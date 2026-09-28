const Livreur = require("../models/modelLivreur");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const LivreurController = {

    // =========================
    // GET TOUS LES LIVREURS
    // =========================
    getAll: async (req, res) => {
        try {

            const livreurs = await Livreur.getAll();

            res.status(200).json({
                success: true,
                data: livreurs
            });

        } catch (error) {

            console.error("Erreur récupération livreurs :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des livreurs"
            });
        }
    },


    // =========================
    // GET UN LIVREUR
    // =========================
    getById: async (req, res) => {
        try {

            const { id } = req.params;

            const livreur = await Livreur.getById(id);

            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: "Livreur introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: livreur
            });

        } catch (error) {

            console.error("Erreur récupération livreur :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du livreur"
            });
        }
    },


    // =========================
    // LIVREURS DISPONIBLES
    // =========================
    getAvailable: async (req, res) => {
        try {

            const livreurs = await Livreur.getAvailable();

            res.status(200).json({
                success: true,
                data: livreurs
            });

        } catch (error) {

            console.error("Erreur récupération livreurs disponibles :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des livreurs disponibles"
            });
        }
    },


    // =========================
    // CRÉER UN LIVREUR
    // =========================
    create: async (req, res) => {

        let connection;

        try {

            const {
                nom,
                telephone,
                email,
                password,
                numero_piece,
                statut
            } = req.body;


            // Vérification
            if (!nom || !telephone || !password) {

                return res.status(400).json({
                    success: false,
                    message: "Le nom, le téléphone et le mot de passe sont obligatoires"
                });
            }


            // Vérifier si le téléphone existe déjà
            const [existingTelephone] = await db.query(
                `
                SELECT id
                FROM users
                WHERE telephone = ?
                `,
                [telephone]
            );

            if (existingTelephone.length > 0) {

                return res.status(409).json({
                    success: false,
                    message: "Ce numéro de téléphone existe déjà"
                });
            }


            // Vérifier l'email uniquement s'il est fourni
            if (email) {

                const [existingEmail] = await db.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );

                if (existingEmail.length > 0) {

                    return res.status(409).json({
                        success: false,
                        message: "Cette adresse email existe déjà"
                    });
                }
            }


            // Connexion transactionnelle
            connection = await db.getConnection();

            await connection.beginTransaction();


            // Crypter le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);


            // Créer le compte utilisateur
            const [userResult] = await connection.query(
                `
                INSERT INTO users
                (
                    nom,
                    telephone,
                    email,
                    password,
                    role,
                    statut
                )
                VALUES (?, ?, ?, ?, 'livreur', 'actif')
                `,
                [
                    nom,
                    telephone,
                    email || null,
                    hashedPassword
                ]
            );


            const userId = userResult.insertId;


            // Créer le profil livreur
            const livreurId = await Livreur.create(
                connection,
                {
                    user_id: userId,
                    numero_piece: numero_piece || null,
                    telephone,
                    statut: statut || "indisponible"
                }
            );


            // Valider la transaction
            await connection.commit();


            res.status(201).json({
                success: true,
                message: "Livreur créé avec succès",
                userId,
                livreurId
            });

        } catch (error) {

            // Annuler la transaction en cas d'erreur
            if (connection) {
                await connection.rollback();
            }

            console.error("Erreur création livreur :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du livreur"
            });

        } finally {

            if (connection) {
                connection.release();
            }
        }
    },


    // =========================
    // MODIFIER UN LIVREUR
    // =========================
    update: async (req, res) => {

        try {

            const { id } = req.params;

            const livreur = await Livreur.getById(id);

            if (!livreur) {

                return res.status(404).json({
                    success: false,
                    message: "Livreur introuvable"
                });
            }


            const {
                user_id,
                numero_piece,
                telephone,
                statut
            } = req.body;


            if (!user_id || !telephone || !statut) {

                return res.status(400).json({
                    success: false,
                    message: "user_id, téléphone et statut sont obligatoires"
                });
            }


            await Livreur.update(id, {
                user_id,
                numero_piece: numero_piece || null,
                telephone,
                statut
            });


            res.status(200).json({
                success: true,
                message: "Livreur modifié avec succès"
            });

        } catch (error) {

            console.error("Erreur modification livreur :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du livreur"
            });
        }
    },


    // =========================
    // MODIFIER LE STATUT
    // =========================
    updateStatus: async (req, res) => {

        try {

            const { id } = req.params;
            const { statut } = req.body;


            const statutsAutorises = [
                "disponible",
                "en_livraison",
                "indisponible"
            ];


            if (!statutsAutorises.includes(statut)) {

                return res.status(400).json({
                    success: false,
                    message: "Statut de livreur invalide"
                });
            }


            const livreur = await Livreur.getById(id);

            if (!livreur) {

                return res.status(404).json({
                    success: false,
                    message: "Livreur introuvable"
                });
            }


            await Livreur.updateStatus(id, statut);


            res.status(200).json({
                success: true,
                message: "Statut du livreur modifié avec succès"
            });

        } catch (error) {

            console.error("Erreur modification statut :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du statut"
            });
        }
    },


    // =========================
    // SUPPRIMER UN LIVREUR
    // =========================
    delete: async (req, res) => {

        try {

            const { id } = req.params;

            const livreur = await Livreur.getById(id);

            if (!livreur) {

                return res.status(404).json({
                    success: false,
                    message: "Livreur introuvable"
                });
            }


            await Livreur.delete(id);


            res.status(200).json({
                success: true,
                message: "Livreur supprimé avec succès"
            });

        } catch (error) {

            console.error("Erreur suppression livreur :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du livreur"
            });
        }
    }

};

module.exports = LivreurController;