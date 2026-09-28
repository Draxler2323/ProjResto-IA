const db = require("../config/db");

const TarifLivraison = {

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT *
      FROM tarifs_livraison
      ORDER BY distance_min ASC
    `);

    return rows;
  },

  getByDistance: async (distance) => {
    const [rows] = await db.query(
      `SELECT *
       FROM tarifs_livraison
       WHERE distance_min <= ?
         AND distance_max >= ?
         AND statut = 'actif'
       LIMIT 1`,
      [distance, distance]
    );

    return rows[0];
  },

  create: async (data) => {
    const {
      distance_min,
      distance_max,
      prix,
      statut
    } = data;

    const [result] = await db.query(
      `INSERT INTO tarifs_livraison
      (distance_min, distance_max, prix, statut)
      VALUES (?, ?, ?, ?)`,
      [
        distance_min,
        distance_max,
        prix,
        statut
      ]
    );

    return result.insertId;
  },

  update: async (id, data) => {
    const {
      distance_min,
      distance_max,
      prix,
      statut
    } = data;

    const [result] = await db.query(
      `UPDATE tarifs_livraison
       SET distance_min = ?,
           distance_max = ?,
           prix = ?,
           statut = ?
       WHERE id = ?`,
      [
        distance_min,
        distance_max,
        prix,
        statut,
        id
      ]
    );

    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM tarifs_livraison
       WHERE id = ?`,
      [id]
    );

    return result.affectedRows;
  }

};

module.exports = TarifLivraison;