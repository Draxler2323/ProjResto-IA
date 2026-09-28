const db = require("../config/db");

const Category = {

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT *
      FROM categories
      ORDER BY id DESC
    `);

    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT *
       FROM categories
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  create: async (data) => {
    const {
      nom,
      description,
      image,
      statut
    } = data;

    const [result] = await db.query(
      `INSERT INTO categories
      (nom, description, image, statut)
      VALUES (?, ?, ?, ?)`,
      [
        nom,
        description,
        image,
        statut
      ]
    );

    return result.insertId;
  },

  update: async (id, data) => {
    const {
      nom,
      description,
      image,
      statut
    } = data;

    const [result] = await db.query(
      `UPDATE categories
       SET nom = ?, description = ?, image = ?, statut = ?
       WHERE id = ?`,
      [
        nom,
        description,
        image,
        statut,
        id
      ]
    );

    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    return result.affectedRows;
  }

};

module.exports = Category;