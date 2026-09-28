const db = require("../config/db");

const CommandeDetail = {

    // Récupérer tous les détails
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT
                commande_details.*,
                plats.nom AS plat_nom,
                plats.image AS plat_image
            FROM commande_details
            INNER JOIN plats
                ON commande_details.plat_id = plats.id
            ORDER BY commande_details.id DESC
        `);

        return rows;
    },

    // Récupérer un détail par son ID
    getById: async (id) => {
        const [rows] = await db.query(
            `
            SELECT
                commande_details.*,
                plats.nom AS plat_nom,
                plats.image AS plat_image
            FROM commande_details
            INNER JOIN plats
                ON commande_details.plat_id = plats.id
            WHERE commande_details.id = ?
            `,
            [id]
        );

        return rows[0];
    },

    // Récupérer tous les détails d'une commande
    getByCommandeId: async (commande_id) => {
        const [rows] = await db.query(
            `
            SELECT
                commande_details.*,
                plats.nom AS plat_nom,
                plats.image AS plat_image,
                plats.prix AS prix_actuel
            FROM commande_details
            INNER JOIN plats
                ON commande_details.plat_id = plats.id
            WHERE commande_details.commande_id = ?
            ORDER BY commande_details.id ASC
            `,
            [commande_id]
        );

        return rows;
    },

    // Créer un détail
    create: async (data) => {

        const {
            commande_id,
            plat_id,
            quantite,
            prix_unitaire,
            sous_total
        } = data;

        const [result] = await db.query(
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
                plat_id,
                quantite,
                prix_unitaire,
                sous_total
            ]
        );

        return result.insertId;
    },

    // Modifier un détail
    update: async (id, data) => {

        const {
            commande_id,
            plat_id,
            quantite,
            prix_unitaire,
            sous_total
        } = data;

        const [result] = await db.query(
            `
            UPDATE commande_details
            SET
                commande_id = ?,
                plat_id = ?,
                quantite = ?,
                prix_unitaire = ?,
                sous_total = ?
            WHERE id = ?
            `,
            [
                commande_id,
                plat_id,
                quantite,
                prix_unitaire,
                sous_total,
                id
            ]
        );

        return result.affectedRows;
    },

    // Supprimer un détail
    delete: async (id) => {

        const [result] = await db.query(
            `
            DELETE FROM commande_details
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = CommandeDetail;