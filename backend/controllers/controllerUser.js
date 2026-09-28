const User = require("../models/modelUsers");
const bcrypt = require("bcryptjs");

const UserController = {

    // Obtenir tous les utilisateurs
    getAll: async (req, res) => {
        try {
            const users = await User.getAll();

            res.status(200).json({
                success: true,
                data: users
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des utilisateurs"
            });
        }
    },


    // Obtenir un utilisateur par son ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'utilisateur"
            });
        }
    },


    // Créer un utilisateur
    create: async (req, res) => {
        try {
            const {
                nom,
                telephone,
                email,
                password,
                role
            } = req.body;

            if (!nom || !telephone || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: "Nom, téléphone, mot de passe et rôle sont obligatoires"
                });
            }

            const existingUser = await User.getByTelephone(telephone);

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Ce numéro de téléphone existe déjà"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const userId = await User.create({
                nom,
                telephone,
                email: email || null,
                password: hashedPassword,
                role,
                statut: "actif"
            });

            res.status(201).json({
                success: true,
                message: "Utilisateur créé avec succès",
                userId
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'utilisateur"
            });
        }
    },


    // Modifier un utilisateur
    update: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                nom,
                telephone,
                email,
                role,
                statut
            } = req.body;

            const user = await User.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur introuvable"
                });
            }

            await User.update(id, {
                nom,
                telephone,
                email,
                role,
                statut
            });

            res.status(200).json({
                success: true,
                message: "Utilisateur modifié avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification"
            });
        }
    },

    // Connexion utilisateur
login: async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérification des champs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe sont obligatoires"
            });
        }

        // Rechercher l'utilisateur avec son email
        const user = await User.getByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // Vérifier le mot de passe
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // Vérifier que le compte est actif
        if (user.compte_statut !== "actif") {
            return res.status(403).json({
                success: false,
                message: "Votre compte est désactivé"
            });
        }

        // Pour le moment, cette connexion est destinée aux livreurs
        if (user.role !== "livreur") {
            return res.status(403).json({
                success: false,
                message: "Ce compte n'est pas un compte livreur"
            });
        }

        // Vérifier que le compte possède bien un profil livreur
        if (!user.livreur_id) {
            return res.status(403).json({
                success: false,
                message: "Profil livreur introuvable"
            });
        }

        // Connexion réussie
        res.status(200).json({
            success: true,
            message: "Connexion réussie",
            data: {
                userId: user.user_id,
                livreurId: user.livreur_id,
                nom: user.nom,
                telephone: user.telephone,
                email: user.email,
                role: user.role,
                statut: user.compte_statut,
                livreurStatut: user.livreur_statut
            }
        });

    } catch (error) {
        console.error("Erreur connexion :", error);

        res.status(500).json({
            success: false,
            message: "Erreur lors de la connexion"
        });
    }
},

    // Supprimer un utilisateur
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Utilisateur introuvable"
                });
            }

            await User.delete(id);

            res.status(200).json({
                success: true,
                message: "Utilisateur supprimé avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression"
            });
        }
    }

};

module.exports = UserController;