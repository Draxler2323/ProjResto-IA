const db = require("../config/db");

const Livraison = {

    // ==========================================
    // RÉCUPÉRER TOUTES LES LIVRAISONS
    // ==========================================
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT
                l.*,
                c.numero_commande,
                c.client_nom,
                c.client_telephone,
                c.adresse,
                c.latitude,
                c.longitude,
                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone
            FROM livraisons l
            INNER JOIN commandes c
                ON l.commande_id = c.id
            INNER JOIN livreurs lv
                ON l.livreur_id = lv.id
            INNER JOIN users u
                ON lv.user_id = u.id
            ORDER BY l.id DESC
        `);

        return rows;
    },


    // ==========================================
    // RÉCUPÉRER UNE LIVRAISON PAR ID
    // ==========================================
    getById: async (id) => {
        const [rows] = await db.query(
            `
            SELECT
                l.*,
                c.numero_commande,
                c.client_nom,
                c.client_telephone,
                c.adresse,
                c.latitude,
                c.longitude,
                c.total_plats,
                c.frais_livraison AS commande_frais_livraison,
                c.total_commande,
                c.statut AS commande_statut,
                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone,
                u.email AS livreur_email

            FROM livraisons l

            INNER JOIN commandes c
                ON l.commande_id = c.id

            INNER JOIN livreurs lv
                ON l.livreur_id = lv.id

            INNER JOIN users u
                ON lv.user_id = u.id

            WHERE l.id = ?
            `,
            [id]
        );

        return rows[0];
    },


    // ==========================================
    // RÉCUPÉRER LES LIVRAISONS D'UN LIVREUR
    // ==========================================
    getByLivreur: async (livreur_id) => {
        const [rows] = await db.query(
            `
            SELECT
                l.*,
                c.numero_commande,
                c.client_nom,
                c.client_telephone,
                c.adresse,
                c.latitude,
                c.longitude,
                c.total_plats,
                c.frais_livraison AS commande_frais_livraison,
                c.total_commande,
                c.statut AS commande_statut,
                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone

            FROM livraisons l

            INNER JOIN commandes c
                ON l.commande_id = c.id

            INNER JOIN livreurs lv
                ON l.livreur_id = lv.id

            INNER JOIN users u
                ON lv.user_id = u.id

            WHERE l.livreur_id = ?

            ORDER BY l.id DESC
            `,
            [livreur_id]
        );

        return rows;
    },


    // ==========================================
    // RÉCUPÉRER LES LIVRAISONS ACTIVES D'UN LIVREUR
    // ==========================================
    getActivesByLivreur: async (livreur_id) => {
        const [rows] = await db.query(
            `
            SELECT
                l.*,
                c.numero_commande,
                c.client_nom,
                c.client_telephone,
                c.adresse,
                c.latitude,
                c.longitude,
                c.total_plats,
                c.frais_livraison AS commande_frais_livraison,
                c.total_commande,
                c.statut AS commande_statut,
                u.nom AS livreur_nom,
                u.telephone AS livreur_telephone

            FROM livraisons l

            INNER JOIN commandes c
                ON l.commande_id = c.id

            INNER JOIN livreurs lv
                ON l.livreur_id = lv.id

            INNER JOIN users u
                ON lv.user_id = u.id

            WHERE l.livreur_id = ?

            AND l.statut IN (
                'attribuee',
                'prise_en_charge',
                'en_livraison'
            )

            ORDER BY l.id DESC
            `,
            [livreur_id]
        );

        return rows;
    },


    // ==========================================
    // CRÉER UNE LIVRAISON
    // ==========================================
    create: async (data) => {
        const {
            commande_id,
            livreur_id,
            distance_km,
            frais_livraison,
            statut,
            date_attribution
        } = data;

        const [result] = await db.query(
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
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                commande_id,
                livreur_id,
                distance_km,
                frais_livraison,
                statut || "en_attente",
                date_attribution || null
            ]
        );

        return result.insertId;
    },


    // ==========================================
    // MODIFIER UNE LIVRAISON
    // ==========================================
    update: async (id, data) => {
        const {
            commande_id,
            livreur_id,
            distance_km,
            frais_livraison,
            statut,
            motif_refus,
            date_attribution,
            date_prise_en_charge,
            date_livraison
        } = data;

        const [result] = await db.query(
            `
            UPDATE livraisons
            SET
                commande_id = ?,
                livreur_id = ?,
                distance_km = ?,
                frais_livraison = ?,
                statut = ?,
                motif_refus = ?,
                date_attribution = ?,
                date_prise_en_charge = ?,
                date_livraison = ?

            WHERE id = ?
            `,
            [
                commande_id,
                livreur_id,
                distance_km,
                frais_livraison,
                statut,
                motif_refus || null,
                date_attribution || null,
                date_prise_en_charge || null,
                date_livraison || null,
                id
            ]
        );

        return result.affectedRows;
    },


    // ==========================================
    // CHANGER LE STATUT D'UNE LIVRAISON
    // ==========================================
    updateStatus: async (id, statut) => {

        // ==========================================
        // LE LIVREUR PEUT UNIQUEMENT PRENDRE
        // EN CHARGE UNE LIVRAISON ATTRIBUÉE
        // ==========================================

        if (statut === "prise_en_charge") {

            const [rows] = await db.query(
                `
                SELECT statut
                FROM livraisons
                WHERE id = ?
                `,
                [id]
            );

            if (rows.length === 0) {
                throw new Error("Livraison introuvable");
            }

            if (rows[0].statut !== "attribuee") {
                throw new Error(
                    "Cette livraison ne peut plus être prise en charge"
                );
            }

            const [result] = await db.query(
                `
                UPDATE livraisons
                SET
                    statut = 'prise_en_charge',
                    date_prise_en_charge = NOW(),
                    motif_refus = NULL
                WHERE id = ?
                `,
                [id]
            );

            return result.affectedRows;
        }


        // ==========================================
        // LE LIVREUR NE PEUT PAS METTRE
        // DIRECTEMENT EN_LIVRAISON
        //
        // C'EST L'ADMINISTRATION QUI LE FAIT
        // LORSQU'ELLE PASSE LA COMMANDE
        // EN LIVRAISON.
        // ==========================================

        if (statut === "en_livraison") {
            throw new Error(
                "La livraison doit être mise en livraison par l'administration"
            );
        }


        // ==========================================
        // LE STATUT LIVREE EST INTERDIT ICI
        //
        // SEULE LA CONFIRMATION DU CLIENT
        // PEUT TERMINER LA LIVRAISON.
        // ==========================================

        if (statut === "livree") {
            throw new Error(
                "La livraison ne peut être terminée que par la confirmation du client"
            );
        }


        // ==========================================
        // AUTRES STATUTS
        // ==========================================

        const [result] = await db.query(
            `
            UPDATE livraisons
            SET statut = ?
            WHERE id = ?
            `,
            [
                statut,
                id
            ]
        );

        return result.affectedRows;
    },


    // ==========================================
    // REFUSER UNE LIVRAISON
    // ==========================================
    refuser: async (id, motif_refus) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            // ==========================================
            // VÉRIFIER LA LIVRAISON
            // ==========================================

            const [livraisons] = await connection.query(
                `
                SELECT
                    id,
                    livreur_id,
                    statut
                FROM livraisons
                WHERE id = ?
                FOR UPDATE
                `,
                [id]
            );

            if (livraisons.length === 0) {
                throw new Error("Livraison introuvable");
            }

            const livraison = livraisons[0];

            // ==========================================
            // LE REFUS EST POSSIBLE UNIQUEMENT
            // POUR UNE LIVRAISON ATTRIBUÉE
            // ==========================================

            if (livraison.statut !== "attribuee") {
                throw new Error(
                    "Cette livraison ne peut plus être refusée."
                );
            }

            // ==========================================
            // VÉRIFIER LE MOTIF
            // ==========================================

            if (
                !motif_refus ||
                motif_refus.trim().length < 3
            ) {
                throw new Error(
                    "Veuillez indiquer le motif du refus."
                );
            }

            // ==========================================
            // ENREGISTRER LE REFUS
            // ==========================================

            await connection.query(
                `
                UPDATE livraisons
                SET
                    statut = 'annulee',
                    motif_refus = ?
                WHERE id = ?
                `,
                [
                    motif_refus.trim(),
                    id
                ]
            );

            // ==========================================
            // LIBÉRER LE LIVREUR
            // ==========================================

            await connection.query(
                `
                UPDATE livreurs
                SET statut = 'disponible'
                WHERE id = ?
                `,
                [livraison.livreur_id]
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
    // SUPPRIMER UNE LIVRAISON
    // ==========================================
    delete: async (id) => {

        const [result] = await db.query(
            `
            DELETE FROM livraisons
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }

};

module.exports = Livraison;