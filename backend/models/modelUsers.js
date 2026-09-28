const db = require("../config/db");

const User = {

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT id, nom, telephone, email, role, statut, created_at, updated_at
      FROM users
      ORDER BY id DESC
    `);

    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, nom, telephone, email, role, statut, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  getByTelephone: async (telephone) => {
    const [rows] = await db.query(
      `SELECT *
       FROM users
       WHERE telephone = ?`,
      [telephone]
    );

    return rows[0];
  },
getByEmail: async (email) => {
    const [rows] = await db.query(
        `
        SELECT
            u.id AS user_id,
            u.nom,
            u.telephone,
            u.email,
            u.password,
            u.role,
            u.statut AS compte_statut,
            l.id AS livreur_id,
            l.statut AS livreur_statut
        FROM users u
        LEFT JOIN livreurs l ON l.user_id = u.id
        WHERE u.email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0];
},

  create: async (data) => {
    const {
      nom,
      telephone,
      email,
      password,
      role,
      statut
    } = data;

    const [result] = await db.query(
      `INSERT INTO users
      (nom, telephone, email, password, role, statut)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nom,
        telephone,
        email,
        password,
        role,
        statut
      ]
    );

    return result.insertId;
  },

  update: async (id, data) => {
    const {
      nom,
      telephone,
      email,
      role,
      statut
    } = data;

    const [result] = await db.query(
      `UPDATE users
       SET nom = ?, telephone = ?, email = ?, role = ?, statut = ?
       WHERE id = ?`,
      [
        nom,
        telephone,
        email,
        role,
        statut,
        id
      ]
    );

    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );

    return result.affectedRows;
  }

};

module.exports = User;