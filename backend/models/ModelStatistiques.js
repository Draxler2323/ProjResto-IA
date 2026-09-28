const db = require("../config/db");

const Statistiques = {

    // ==========================================
    // STATISTIQUES GÉNÉRALES
    // ==========================================
    getGenerales: async () => {

        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS total_commandes,

                COUNT(
                    DISTINCT client_telephone
                ) AS total_clients,

                COALESCE(
                    SUM(
                        CASE
                            WHEN statut = 'livree'
                            THEN total_commande
                            ELSE 0
                        END
                    ),
                    0
                ) AS chiffre_affaires,

                COALESCE(
                    SUM(
                        CASE
                            WHEN statut = 'livree'
                            THEN frais_livraison
                            ELSE 0
                        END
                    ),
                    0
                ) AS frais_livraison

            FROM commandes
        `);

        return rows[0];
    },


    // ==========================================
    // TOTAL DES LIVRAISONS
    // ==========================================
    getTotalLivraisons: async () => {

        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS total_livraisons

            FROM livraisons

            WHERE statut != 'annulee'
        `);

        return rows[0];
    },


    // ==========================================
    // COMMANDES PAR STATUT
    // ==========================================
    getCommandesParStatut: async () => {

        const [rows] = await db.query(`
            SELECT
                statut,
                COUNT(*) AS total

            FROM commandes

            GROUP BY statut

            ORDER BY total DESC
        `);

        return rows;
    },


    // ==========================================
    // ÉVOLUTION DES COMMANDES
    // 7 DERNIERS JOURS
    // ==========================================
    getEvolutionCommandes: async () => {

        const [rows] = await db.query(`
            SELECT
                DATE(created_at) AS date,
                COUNT(*) AS total

            FROM commandes

            WHERE created_at >=
                DATE_SUB(
                    CURDATE(),
                    INTERVAL 6 DAY
                )

            GROUP BY DATE(created_at)

            ORDER BY date ASC
        `);

        return rows;
    },


    // ==========================================
    // PLATS LES PLUS COMMANDÉS
    // ==========================================
    getPlatsPopulaires: async () => {

        const [rows] = await db.query(`
            SELECT
                p.id,
                p.nom,

                COALESCE(
                    SUM(cd.quantite),
                    0
                ) AS quantite_totale,

                COALESCE(
                    SUM(cd.sous_total),
                    0
                ) AS chiffre_affaires

            FROM commande_details cd

            INNER JOIN plats p
                ON p.id = cd.plat_id

            INNER JOIN commandes c
                ON c.id = cd.commande_id

            WHERE c.statut = 'livree'

            GROUP BY
                p.id,
                p.nom

            ORDER BY
                quantite_totale DESC

            LIMIT 5
        `);

        return rows;
    },


    // ==========================================
    // PERFORMANCE DES LIVREURS
    // ==========================================
    getPerformanceLivreurs: async () => {

        const [rows] = await db.query(`
            SELECT

                l.id AS livreur_id,

                u.nom AS livreur_nom,

                COUNT(liv.id) AS total_livraisons,

                SUM(
                    CASE
                        WHEN liv.statut = 'livree'
                        THEN 1
                        ELSE 0
                    END
                ) AS livraisons_terminees,

                COALESCE(
                    SUM(
                        CASE
                            WHEN liv.statut = 'livree'
                            THEN liv.frais_livraison
                            ELSE 0
                        END
                    ),
                    0
                ) AS frais_livraison_generes

            FROM livreurs l

            INNER JOIN users u
                ON u.id = l.user_id

            LEFT JOIN livraisons liv
                ON liv.livreur_id = l.id

            GROUP BY
                l.id,
                u.nom

            ORDER BY
                livraisons_terminees DESC
        `);

        return rows;
    }

};


module.exports = Statistiques;