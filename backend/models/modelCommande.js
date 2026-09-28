const db = require("../config/db");
const calculerDistance = require("../utils/distance");

const Commande = {

    // ==========================================
    // RÉCUPÉRER TOUTES LES COMMANDES
    // ==========================================
    getAll: async () => {

        const [rows] = await db.query(`
            SELECT
                c.*,

                l.id AS livreur_id_info,
                l.numero_piece AS livreur_numero_piece,
                l.telephone AS livreur_telephone,
                l.statut AS livreur_statut,

                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone_user,
                u.email AS livreur_email,

                liv.id AS livraison_id,
                liv.statut AS livraison_statut,
                liv.motif_refus AS livraison_motif_refus,
                liv.date_attribution,
                liv.date_prise_en_charge,
                liv.date_livraison

            FROM commandes c

            LEFT JOIN livreurs l
                ON c.livreur_id = l.id

            LEFT JOIN users u
                ON l.user_id = u.id

            LEFT JOIN livraisons liv
                ON liv.commande_id = c.id

            ORDER BY c.id DESC
        `);

        return rows;
    },


    // ==========================================
    // RÉCUPÉRER UNE COMMANDE PAR ID
    // ==========================================
    getById: async (id) => {

        const [rows] = await db.query(
            `
            SELECT
                c.*,

                l.id AS livreur_id_info,
                l.numero_piece AS livreur_numero_piece,
                l.telephone AS livreur_telephone,
                l.statut AS livreur_statut,

                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone_user,
                u.email AS livreur_email,

                liv.id AS livraison_id,
                liv.statut AS livraison_statut,
                liv.motif_refus AS livraison_motif_refus,
                liv.date_attribution,
                liv.date_prise_en_charge,
                liv.date_livraison

            FROM commandes c

            LEFT JOIN livreurs l
                ON c.livreur_id = l.id

            LEFT JOIN users u
                ON l.user_id = u.id

            LEFT JOIN livraisons liv
                ON liv.commande_id = c.id

            WHERE c.id = ?
            `,
            [id]
        );

        return rows[0];
    },


    // ==========================================
    // RÉCUPÉRER LES COMMANDES D'UN CLIENT
    // ==========================================
    getByTelephone: async (telephone) => {

        const [rows] = await db.query(
            `
            SELECT *
            FROM commandes
            WHERE client_telephone = ?
            ORDER BY id DESC
            `,
            [telephone]
        );

        return rows;
    },


    // ==========================================
    // CRÉER UNE COMMANDE COMPLÈTE
    // ==========================================
    createComplete: async (data) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            const {
                client_nom,
                client_telephone,
                latitude,
                longitude,
                adresse,
                panier
            } = data;


            // ==========================================
            // VÉRIFIER LES PLATS ET CALCULER LES TOTAUX
            // ==========================================

            let total_plats = 0;

            const details = [];

            for (const item of panier) {

                const [plats] = await connection.query(
                    `
                    SELECT id, nom, prix, disponibilite
                    FROM plats
                    WHERE id = ?
                    `,
                    [item.plat_id]
                );

                if (plats.length === 0) {
                    throw new Error(
                        `Le plat ${item.plat_id} n'existe pas`
                    );
                }

                const plat = plats[0];

                if (plat.disponibilite !== "disponible") {
                    throw new Error(
                        `Le plat "${plat.nom}" n'est pas disponible`
                    );
                }

                const quantite = Number(item.quantite);

                if (!Number.isInteger(quantite) || quantite <= 0) {
                    throw new Error(
                        `Quantité invalide pour le plat "${plat.nom}"`
                    );
                }

                const prix_unitaire = Number(plat.prix);

                const sous_total =
                    prix_unitaire * quantite;

                total_plats += sous_total;

                details.push({
                    plat_id: plat.id,
                    quantite,
                    prix_unitaire,
                    sous_total
                });
            }


            // ==========================================
            // NUMÉRO DE COMMANDE
            // ==========================================

            const numero_commande =
                "CMD-" +
                Date.now().toString().slice(-10);


            // ==========================================
            // CRÉER LA COMMANDE
            // ==========================================

            const [resultCommande] = await connection.query(
                `
                INSERT INTO commandes
                (
                    numero_commande,
                    client_nom,
                    client_telephone,
                    total_plats,
                    frais_livraison,
                    total_commande,
                    latitude,
                    longitude,
                    adresse,
                    statut,
                    livreur_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    numero_commande,
                    client_nom,
                    client_telephone,
                    total_plats,
                    0,
                    total_plats,
                    latitude,
                    longitude,
                    adresse,
                    "en_attente",
                    null
                ]
            );

            const commande_id =
                resultCommande.insertId;


            // ==========================================
            // CRÉER LES DÉTAILS
            // ==========================================

            for (const detail of details) {

                await connection.query(
                    `
                    INSERT INTO commande_details
                    (
                        commande_id,
                        plat_id,
                        quantite,
                        prix_unitaire,
                        sous_total
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        commande_id,
                        detail.plat_id,
                        detail.quantite,
                        detail.prix_unitaire,
                        detail.sous_total
                    ]
                );
            }


            await connection.commit();


            return {
                id: commande_id,
                numero_commande,
                total_plats,
                frais_livraison: 0,
                total_commande: total_plats
            };


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    },


    // ==========================================
    // MODIFIER UNE COMMANDE
    // ==========================================
    update: async (id, data) => {

        const {
            client_nom,
            client_telephone,
            total_plats,
            frais_livraison,
            total_commande,
            latitude,
            longitude,
            adresse,
            statut,
            motif_refus
        } = data;

        const [result] = await db.query(
            `
            UPDATE commandes
            SET
                client_nom = ?,
                client_telephone = ?,
                total_plats = ?,
                frais_livraison = ?,
                total_commande = ?,
                latitude = ?,
                longitude = ?,
                adresse = ?,
                statut = ?,
                motif_refus = ?
            WHERE id = ?
            `,
            [
                client_nom,
                client_telephone,
                total_plats,
                frais_livraison,
                total_commande,
                latitude,
                longitude,
                adresse,
                statut,
                motif_refus,
                id
            ]
        );

        return result.affectedRows;
    },


    // ==========================================
    // MODIFIER UNIQUEMENT LE STATUT
    // ==========================================
    updateStatus: async (id, statut, motif_refus = null) => {

        // ==========================================
        // RÉCUPÉRER LA COMMANDE + LIVRAISON
        // ==========================================

        const [commandes] = await db.query(
            `
            SELECT
                c.id,
                c.statut,
                c.total_plats,
                c.latitude,
                c.longitude,
                c.frais_livraison,

                liv.id AS livraison_id,
                liv.statut AS livraison_statut

            FROM commandes c

            LEFT JOIN livraisons liv
                ON liv.commande_id = c.id

            WHERE c.id = ?
            `,
            [id]
        );

        if (commandes.length === 0) {
            throw new Error("Commande introuvable");
        }

        const commande = commandes[0];


        // ==========================================
        // APPROUVER LA COMMANDE
        // ==========================================

        if (statut === "approuvee") {

            if (commande.statut !== "en_attente") {
                throw new Error(
                    "Seule une commande en attente peut être approuvée"
                );
            }

            if (
                commande.latitude === null ||
                commande.longitude === null
            ) {
                throw new Error(
                    "Les coordonnées GPS du client sont absentes"
                );
            }

            const restaurantLat = -3.346178;
            const restaurantLng = 29.372166;

            const distance = calculerDistance(
                restaurantLat,
                restaurantLng,
                Number(commande.latitude),
                Number(commande.longitude)
            );

            const distanceArrondie =
                Number(distance.toFixed(2));

            console.log(
                `Distance commande ${id} : ${distanceArrondie} km`
            );

            const [tarifs] = await db.query(
                `
                SELECT
                    id,
                    distance_min,
                    distance_max,
                    prix
                FROM tarifs_livraison
                WHERE statut = 'actif'
                AND distance_min <= ?
                AND distance_max >= ?
                ORDER BY distance_min ASC
                LIMIT 1
                `,
                [
                    distanceArrondie,
                    distanceArrondie
                ]
            );

            if (tarifs.length === 0) {
                throw new Error(
                    `Aucun tarif de livraison disponible pour ${distanceArrondie} km`
                );
            }

            const tarif = tarifs[0];

            const frais_livraison =
                Number(tarif.prix);

            const total_commande =
                Number(commande.total_plats) +
                frais_livraison;

            const [result] = await db.query(
                `
                UPDATE commandes
                SET
                    statut = ?,
                    motif_refus = NULL,
                    frais_livraison = ?,
                    total_commande = ?
                WHERE id = ?
                `,
                [
                    statut,
                    frais_livraison,
                    total_commande,
                    id
                ]
            );

            console.log(
                `Frais livraison : ${frais_livraison} BIF`
            );

            console.log(
                `Total commande : ${total_commande} BIF`
            );

            return result.affectedRows;
        }


        // ==========================================
        // EN PRÉPARATION
        // ==========================================

        if (statut === "en_preparation") {

            // Il faut obligatoirement avoir un livreur
            if (!commande.livraison_id) {
                throw new Error(
                    "Impossible de commencer la préparation : aucun livreur n'est assigné"
                );
            }

            // Le livreur doit avoir accepté
            if (commande.livraison_statut !== "prise_en_charge") {
                throw new Error(
                    "Impossible de commencer la préparation : le livreur n'a pas encore accepté la livraison"
                );
            }

            // La commande doit être au statut livreur_assigne
            if (commande.statut !== "livreur_assigne") {
                throw new Error(
                    "La commande ne peut pas passer en préparation depuis son statut actuel"
                );
            }
        }


        // ==========================================
        // COMMANDE PRÊTE
        // ==========================================

        if (statut === "prete") {

            if (commande.statut !== "en_preparation") {
                throw new Error(
                    "La commande doit être en préparation avant d'être prête"
                );
            }
        }


        // ==========================================
        // EN LIVRAISON
        // ==========================================

        if (statut === "en_livraison") {

            if (commande.statut !== "prete") {
                throw new Error(
                    "La commande doit être prête avant d'être mise en livraison"
                );
            }

            // Il faut obligatoirement une livraison
            if (!commande.livraison_id) {
                throw new Error(
                    "Impossible de mettre en livraison : aucune livraison n'est associée"
                );
            }

            // Le livreur doit avoir accepté
            if (commande.livraison_statut !== "prise_en_charge") {
                throw new Error(
                    "Le livreur doit avoir accepté la livraison avant la mise en livraison"
                );
            }
        }


        // ==========================================
        // LIVRÉE
        // ==========================================

        if (statut === "livree") {

            throw new Error(
                "Une commande ne peut être livrée que par confirmation du client"
            );
        }


        // ==========================================
        // METTRE À JOUR LA COMMANDE
        // ==========================================

        const [result] = await db.query(
            `
            UPDATE commandes
            SET
                statut = ?,
                motif_refus = ?
            WHERE id = ?
            `,
            [
                statut,
                motif_refus,
                id
            ]
        );


        // ==========================================
        // SI L'ADMIN MET LA COMMANDE EN LIVRAISON
        // → METTRE AUTOMATIQUEMENT LA LIVRAISON
        // EN LIVRAISON
        // ==========================================

        if (statut === "en_livraison") {

            const [livraisonResult] = await db.query(
                `
                UPDATE livraisons
                SET
                    statut = 'en_livraison'
                WHERE id = ?
                AND statut = 'prise_en_charge'
                `,
                [
                    commande.livraison_id
                ]
            );

            if (livraisonResult.affectedRows === 0) {

                // Annuler la modification de la commande
                await db.query(
                    `
                    UPDATE commandes
                    SET
                        statut = 'prete'
                    WHERE id = ?
                    `,
                    [id]
                );

                throw new Error(
                    "La livraison doit être prise en charge par le livreur"
                );
            }
        }


        return result.affectedRows;
    },


    // ==========================================
    // ASSIGNER UN LIVREUR
    // ==========================================
    assignerLivreur: async (commandeId, livreurId) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();


            // ==========================================
            // VÉRIFIER LA COMMANDE
            // ==========================================

            const [commandes] = await connection.query(
                `
                SELECT
                    id,
                    statut,
                    livreur_id,
                    latitude,
                    longitude,
                    frais_livraison
                FROM commandes
                WHERE id = ?
                FOR UPDATE
                `,
                [commandeId]
            );

            if (commandes.length === 0) {
                throw new Error("Commande introuvable");
            }

            const commande = commandes[0];


            // ==========================================
            // LA COMMANDE DOIT ÊTRE APPROUVÉE
            // ==========================================

            if (commande.statut !== "approuvee") {
                throw new Error(
                    "Seule une commande approuvée peut recevoir un livreur"
                );
            }


            // ==========================================
            // VÉRIFIER LE LIVREUR
            // ==========================================

            const [livreurs] = await connection.query(
                `
                SELECT
                    l.id,
                    l.statut,
                    u.nom,
                    u.telephone,
                    u.statut AS compte_statut,
                    u.role
                FROM livreurs l
                INNER JOIN users u
                    ON l.user_id = u.id
                WHERE l.id = ?
                FOR UPDATE
                `,
                [livreurId]
            );

            if (livreurs.length === 0) {
                throw new Error("Livreur introuvable");
            }

            const livreur = livreurs[0];


            // ==========================================
            // VÉRIFIER QUE LE COMPTE EST VALIDE
            // ==========================================

            if (livreur.role !== "livreur") {
                throw new Error(
                    "Ce compte n'est pas un livreur"
                );
            }

            if (livreur.compte_statut !== "actif") {
                throw new Error(
                    "Le compte du livreur est inactif"
                );
            }

            if (livreur.statut !== "disponible") {
                throw new Error(
                    "Ce livreur n'est pas disponible"
                );
            }


            // ==========================================
            // CALCULER LA DISTANCE
            // ==========================================

            if (
                commande.latitude === null ||
                commande.longitude === null
            ) {
                throw new Error(
                    "Les coordonnées GPS du client sont absentes"
                );
            }

            const restaurantLat = -3.346178;
            const restaurantLng = 29.372166;

            const distance = calculerDistance(
                restaurantLat,
                restaurantLng,
                Number(commande.latitude),
                Number(commande.longitude)
            );

            const distanceArrondie =
                Number(distance.toFixed(2));


            // ==========================================
            // VÉRIFIER S'IL EXISTE DÉJÀ UNE LIVRAISON
            // ==========================================

            const [livraisonsExistantes] = await connection.query(
                `
                SELECT id
                FROM livraisons
                WHERE commande_id = ?
                FOR UPDATE
                `,
                [commandeId]
            );

            if (livraisonsExistantes.length > 0) {
                throw new Error(
                    "Une livraison existe déjà pour cette commande"
                );
            }


            // ==========================================
            // ASSIGNER LE LIVREUR À LA COMMANDE
            // ==========================================

            await connection.query(
                `
                UPDATE commandes
                SET
                    livreur_id = ?,
                    statut = 'livreur_assigne',
                    motif_refus = NULL
                WHERE id = ?
                `,
                [
                    livreurId,
                    commandeId
                ]
            );


            // ==========================================
            // CRÉER AUTOMATIQUEMENT LA LIVRAISON
            // ==========================================

            await connection.query(
                `
                INSERT INTO livraisons
                (
                    commande_id,
                    livreur_id,
                    distance_km,
                    frais_livraison,
                    statut,
                    date_attribution
                )
                VALUES (?, ?, ?, ?, 'attribuee', NOW())
                `,
                [
                    commandeId,
                    livreurId,
                    distanceArrondie,
                    Number(commande.frais_livraison)
                ]
            );


            // ==========================================
            // METTRE LE LIVREUR EN LIVRAISON
            // ==========================================

            await connection.query(
                `
                UPDATE livreurs
                SET statut = 'en_livraison'
                WHERE id = ?
                `,
                [livreurId]
            );


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    },


    // ==========================================
    // RÉASSIGNER UN AUTRE LIVREUR
    // ==========================================
    reassignerLivreur: async (commandeId, nouveauLivreurId) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();


            // ==========================================
            // VÉRIFIER LA COMMANDE
            // ==========================================

            const [commandes] = await connection.query(
                `
                SELECT
                    c.id,
                    c.statut,
                    c.livreur_id,
                    c.latitude,
                    c.longitude,
                    c.frais_livraison,

                    liv.id AS livraison_id,
                    liv.livreur_id AS ancien_livreur_id,
                    liv.statut AS livraison_statut

                FROM commandes c

                LEFT JOIN livraisons liv
                    ON liv.commande_id = c.id

                WHERE c.id = ?

                FOR UPDATE
                `,
                [commandeId]
            );


            if (commandes.length === 0) {
                throw new Error("Commande introuvable");
            }


            const commande = commandes[0];


            // ==========================================
            // LA COMMANDE DOIT AVOIR UN LIVREUR REFUSÉ
            // ==========================================

            if (commande.statut !== "livreur_assigne") {
                throw new Error(
                    "Cette commande ne peut pas être réassignée dans son statut actuel"
                );
            }


            if (!commande.livraison_id) {
                throw new Error(
                    "Aucune livraison n'existe pour cette commande"
                );
            }


            if (commande.livraison_statut !== "annulee") {
                throw new Error(
                    "La livraison doit avoir été refusée par le livreur avant une réattribution"
                );
            }


            // ==========================================
            // VÉRIFIER LE NOUVEAU LIVREUR
            // ==========================================

            const [livreurs] = await connection.query(
                `
                SELECT
                    l.id,
                    l.statut,
                    u.nom,
                    u.telephone,
                    u.statut AS compte_statut,
                    u.role

                FROM livreurs l

                INNER JOIN users u
                    ON l.user_id = u.id

                WHERE l.id = ?

                FOR UPDATE
                `,
                [nouveauLivreurId]
            );


            if (livreurs.length === 0) {
                throw new Error("Nouveau livreur introuvable");
            }


            const nouveauLivreur = livreurs[0];


            // ==========================================
            // VÉRIFIER LE COMPTE
            // ==========================================

            if (nouveauLivreur.role !== "livreur") {
                throw new Error(
                    "Ce compte n'est pas un livreur"
                );
            }


            if (nouveauLivreur.compte_statut !== "actif") {
                throw new Error(
                    "Le compte du nouveau livreur est inactif"
                );
            }


            if (nouveauLivreur.statut !== "disponible") {
                throw new Error(
                    "Ce livreur n'est pas disponible"
                );
            }


            // ==========================================
            // VÉRIFIER QU'ON NE RÉASSIGNE PAS AU MÊME
            // ==========================================

            if (
                Number(commande.ancien_livreur_id) ===
                Number(nouveauLivreurId)
            ) {
                throw new Error(
                    "Veuillez choisir un autre livreur"
                );
            }


            // ==========================================
            // VÉRIFIER LES COORDONNÉES GPS
            // ==========================================

            if (
                commande.latitude === null ||
                commande.longitude === null
            ) {
                throw new Error(
                    "Les coordonnées GPS du client sont absentes"
                );
            }


            // ==========================================
            // CALCULER LA DISTANCE
            // ==========================================

            const restaurantLat = -3.346178;
            const restaurantLng = 29.372166;

            const distance = calculerDistance(
                restaurantLat,
                restaurantLng,
                Number(commande.latitude),
                Number(commande.longitude)
            );

            const distanceArrondie =
                Number(distance.toFixed(2));


            // ==========================================
            // RÉASSIGNER LA COMMANDE
            // ==========================================

            await connection.query(
                `
                UPDATE commandes
                SET
                    livreur_id = ?,
                    statut = 'livreur_assigne',
                    motif_refus = NULL
                WHERE id = ?
                `,
                [
                    nouveauLivreurId,
                    commandeId
                ]
            );


            // ==========================================
            // RÉUTILISER LA LIVRAISON EXISTANTE
            // ==========================================

            await connection.query(
                `
                UPDATE livraisons
                SET
                    livreur_id = ?,
                    distance_km = ?,
                    frais_livraison = ?,
                    statut = 'attribuee',
                    motif_refus = NULL,
                    date_attribution = NOW(),
                    date_prise_en_charge = NULL,
                    date_livraison = NULL
                WHERE id = ?
                `,
                [
                    nouveauLivreurId,
                    distanceArrondie,
                    Number(commande.frais_livraison),
                    commande.livraison_id
                ]
            );


            // ==========================================
            // METTRE LE NOUVEAU LIVREUR EN LIVRAISON
            // ==========================================

            await connection.query(
                `
                UPDATE livreurs
                SET statut = 'en_livraison'
                WHERE id = ?
                `,
                [nouveauLivreurId]
            );


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    },


    // ==========================================
    // LIBÉRER LE LIVREUR APRÈS LIVRAISON
    // ==========================================
    libererLivreur: async (commandeId) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();


            const [commandes] = await connection.query(
                `
                SELECT livreur_id
                FROM commandes
                WHERE id = ?
                FOR UPDATE
                `,
                [commandeId]
            );

            if (commandes.length === 0) {
                throw new Error("Commande introuvable");
            }

            const livreurId =
                commandes[0].livreur_id;


            if (livreurId) {

                await connection.query(
                    `
                    UPDATE livreurs
                    SET statut = 'disponible'
                    WHERE id = ?
                    `,
                    [livreurId]
                );
            }


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    },


    // ==========================================
    // CONFIRMER LA RÉCEPTION PAR LE CLIENT
    // ==========================================
    confirmerReceptionClient: async (id) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();


            // ==========================================
            // VÉRIFIER LA COMMANDE
            // ==========================================

            const [commandes] = await connection.query(
                `
                SELECT
                    id,
                    statut,
                    confirmation_client,
                    livreur_id
                FROM commandes
                WHERE id = ?
                FOR UPDATE
                `,
                [id]
            );

            if (commandes.length === 0) {
                throw new Error("Commande introuvable");
            }

            const commande = commandes[0];


            // ==========================================
            // VÉRIFIER QUE LA LIVRAISON EST EN COURS
            // ==========================================

            if (commande.statut !== "en_livraison") {
                throw new Error(
                    "Cette commande n'est pas actuellement en livraison"
                );
            }


            // ==========================================
            // VÉRIFIER SI LE CLIENT A DÉJÀ CONFIRMÉ
            // ==========================================

            if (commande.confirmation_client === 1) {
                throw new Error(
                    "La réception de cette commande a déjà été confirmée"
                );
            }


            // ==========================================
            // CONFIRMER LA RÉCEPTION
            // ==========================================

            await connection.query(
                `
                UPDATE commandes
                SET
                    confirmation_client = 1,
                    date_confirmation_client = NOW(),
                    statut = 'livree'
                WHERE id = ?
                `,
                [id]
            );


            // ==========================================
            // METTRE LA LIVRAISON À LIVRÉE
            // ==========================================

            await connection.query(
                `
                UPDATE livraisons
                SET
                    statut = 'livree',
                    date_livraison = NOW()
                WHERE commande_id = ?
                `,
                [id]
            );


            // ==========================================
            // LIBÉRER LE LIVREUR
            // ==========================================

            if (commande.livreur_id) {

                await connection.query(
                    `
                    UPDATE livreurs
                    SET statut = 'disponible'
                    WHERE id = ?
                    `,
                    [commande.livreur_id]
                );
            }


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    },


    // ==========================================
    // SUPPRIMER UNE COMMANDE
    // ==========================================
    delete: async (id) => {

        const [result] = await db.query(
            `
            DELETE FROM commandes
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }

};

module.exports = Commande;
