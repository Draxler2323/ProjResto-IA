const db = require("../config/db");

const Paiement = {

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT *
      FROM paiements
      ORDER BY id DESC
    `);

    return rows;
  },

  getByCommande: async (commande_id) => {
    const [rows] = await db.query(
      `SELECT *
       FROM paiements
       WHERE commande_id = ?
       ORDER BY id DESC`,
      [commande_id]
    );

    return rows;
  },

  create: async (data) => {
    const {
      commande_id,
      livreur_id,
      montant,
      mode,
      statut,
      reference_transaction,
      preuve,
      date_paiement
    } = data;

    const [result] = await db.query(
      `INSERT INTO paiements
      (
        commande_id,
        livreur_id,
        montant,
        mode,
        statut,
        reference_transaction,
        preuve,
        date_paiement
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        commande_id,
        livreur_id,
        montant,
        mode,
        statut,
        reference_transaction,
        preuve,
        date_paiement
      ]
    );

    return result.insertId;
  },

  updateStatus: async (id, statut) => {
    const [result] = await db.query(
      `UPDATE paiements
       SET statut = ?
       WHERE id = ?`,
      [statut, id]
    );

    return result.affectedRows;
  }

};

module.exports = Paiement;