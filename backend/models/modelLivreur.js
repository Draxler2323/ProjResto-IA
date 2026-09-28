const db = require("../config/db");

const Livreur = {

    // Récupérer tous les livreurs
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT
                l.id,
                l.user_id,
                l.numero_piece,
                l.telephone AS telephone_livreur,
                l.statut,
                l.created_at,
                l.updated_at,
                u.nom,
                u.telephone AS telephone_user,
                u.email,
                u.statut AS compte_statut
            FROM livreurs l
            INNER JOIN users u
                ON l.user_id = u.id
            ORDER BY l.id DESC
        `);

        return rows;
    },


    // Récupérer un livreur par son ID
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT
                l.id,
                l.user_id,
                l.numero_piece,
                l.telephone AS telephone_livreur,
                l.statut,
                l.created_at,
                l.updated_at,
                u.nom,
                u.telephone AS telephone_user,
                u.email,
                u.statut AS compte_statut
            FROM livreurs l
            INNER JOIN users u
                ON l.user_id = u.id
            WHERE l.id = ?
        `, [id]);

        return rows[0];
    },


    // Récupérer uniquement les livreurs disponibles
    getAvailable: async () => {
        const [rows] = await db.query(`
            SELECT
                l.id,
                l.user_id,
                l.numero_piece,
                l.telephone AS telephone_livreur,
                l.statut,
                u.nom,
                u.telephone AS telephone_user,
                u.email
            FROM livreurs l
            INNER JOIN users u
                ON l.user_id = u.id
            WHERE l.statut = 'disponible'
              AND u.statut = 'actif'
              AND u.role = 'livreur'
            ORDER BY u.nom ASC
        `);

        return rows;
    },


    // Créer le profil livreur
    create: async (connection, data) => {
        const {
            user_id,
            numero_piece,
            telephone,
            statut
        } = data;

        const [result] = await connection.query(
            `
            INSERT INTO livreurs
            (
                user_id,
                numero_piece,
                telephone,
                statut
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                user_id,
                numero_piece,
                telephone,
                statut
            ]
        );

        return result.insertId;
    },


    // Modifier un livreur
    update: async (id, data) => {
        const {
            user_id,
            numero_piece,
            telephone,
            statut
        } = data;

        const [result] = await db.query(
            `
            UPDATE livreurs
            SET
                user_id = ?,
                numero_piece = ?,
                telephone = ?,
                statut = ?
            WHERE id = ?
            `,
            [
                user_id,
                numero_piece,
                telephone,
                statut,
                id
            ]
        );

        return result.affectedRows;
    },


    // Modifier uniquement le statut
    updateStatus: async (id, statut) => {
        const [result] = await db.query(
            `
            UPDATE livreurs
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


    // Supprimer un livreur
    delete: async (id) => {
        const [result] = await db.query(
            `
            DELETE FROM livreurs
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }

};

module.exports = Livreur;