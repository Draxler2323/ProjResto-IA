
const db = require("../config/db");

const Notification = {

  // ==========================================
  // RÉCUPÉRER TOUTES LES NOTIFICATIONS
  // ==========================================
  getAll: async () => {

    const [rows] = await db.query(`
      SELECT *
      FROM notifications
      ORDER BY id DESC
    `);

    return rows;

  },


  // ==========================================
  // RÉCUPÉRER UNE NOTIFICATION PAR ID
  // ==========================================
  getById: async (id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    return rows[0] || null;

  },


  // ==========================================
  // RÉCUPÉRER LES NOTIFICATIONS D'UN UTILISATEUR
  // ==========================================
  getByUser: async (user_id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
      `,
      [user_id]
    );

    return rows;

  },


  // ==========================================
  // RÉCUPÉRER LES NOTIFICATIONS NON LUES
  // ==========================================
  getUnreadByUser: async (user_id) => {

    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
        AND lu = false
      ORDER BY id DESC
      `,
      [user_id]
    );

    return rows;

  },


  // ==========================================
  // CRÉER UNE NOTIFICATION
  // ==========================================
  create: async (data) => {

    const {
      user_id,
      commande_id,
      titre,
      message,
      type
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO notifications
      (
        user_id,
        commande_id,
        titre,
        message,
        type,
        lu
      )
      VALUES (?, ?, ?, ?, ?, false)
      `,
      [
        user_id,
        commande_id || null,
        titre,
        message,
        type
      ]
    );

    return result.insertId;

  },


  // ==========================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ==========================================
  markAsRead: async (id) => {

    const [result] = await db.query(
      `
      UPDATE notifications
      SET lu = true
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows;

  },


  // ==========================================
  // MODIFIER UNE NOTIFICATION
  // ==========================================
  update: async (id, data) => {

    const champsAutorises = [
      "titre",
      "message",
      "type",
      "lu"
    ];

    const champs = [];
    const valeurs = [];

    champsAutorises.forEach((champ) => {

      if (
        Object.prototype.hasOwnProperty.call(
          data,
          champ
        )
      ) {

        champs.push(`${champ} = ?`);
        valeurs.push(data[champ]);

      }

    });

    if (champs.length === 0) {
      return 0;
    }

    valeurs.push(id);

    const [result] = await db.query(
      `
      UPDATE notifications
      SET ${champs.join(", ")}
      WHERE id = ?
      `,
      valeurs
    );

    return result.affectedRows;

  },


  // ==========================================
  // SUPPRIMER UNE NOTIFICATION
  // ==========================================
  delete: async (id) => {

    const [result] = await db.query(
      `
      DELETE FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows;

  }

};

module.exports = Notification;
