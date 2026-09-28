const db = require("../config/db");

const Plat = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT 
                plats.*,
                categories.nom AS categorie_nom
            FROM plats
            INNER JOIN categories
                ON plats.categorie_id = categories.id
            ORDER BY plats.id DESC
        `);

        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(
            `SELECT 
                plats.*,
                categories.nom AS categorie_nom
             FROM plats
             INNER JOIN categories
                ON plats.categorie_id = categories.id
             WHERE plats.id = ?`,
            [id]
        );

        return rows[0];
    },

    create: async (data) => {
        const {
            categorie_id,
            nom,
            description,
            prix,
            image,
            disponibilite
        } = data;

        const [result] = await db.query(
            `INSERT INTO plats
            (categorie_id, nom, description, prix, image, disponibilite)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                categorie_id,
                nom,
                description,
                prix,
                image,
                disponibilite
            ]
        );

        return result.insertId;
    },

    update: async (id, data) => {
        const {
            categorie_id,
            nom,
            description,
            prix,
            image,
            disponibilite
        } = data;

        const [result] = await db.query(
            `UPDATE plats
             SET categorie_id = ?,
                 nom = ?,
                 description = ?,
                 prix = ?,
                 image = ?,
                 disponibilite = ?
             WHERE id = ?`,
            [
                categorie_id,
                nom,
                description,
                prix,
                image,
                disponibilite,
                id
            ]
        );

        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM plats
             WHERE id = ?`,
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = Plat;