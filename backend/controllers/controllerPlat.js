const Plat = require("../models/modelPlat");

const PlatController = {

    // ==========================================
    // RÉCUPÉRER TOUS LES PLATS
    // ==========================================
    getAll: async (req, res) => {
        try {

            const plats = await Plat.getAll();

            res.status(200).json({
                success: true,
                data: plats
            });

        } catch (error) {

            console.error("Erreur récupération plats :", error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération des plats"
            });
        }
    },


    // ==========================================
    // RÉCUPÉRER UN PLAT
    // ==========================================
    getById: async (req, res) => {
        try {

            const { id } = req.params;

            const plat = await Plat.getById(id);

            if (!plat) {
                return res.status(404).json({
                    success: false,
                    message: "Plat introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: plat
            });

        } catch (error) {

            console.error("Erreur récupération plat :", error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération du plat"
            });
        }
    },


    // ==========================================
    // CRÉER UN PLAT
    // ==========================================
    create: async (req, res) => {
        try {

            const {
                categorie_id,
                nom,
                description,
                prix
            } = req.body;


            // Vérifications
            if (!categorie_id || !nom || prix === undefined) {

                return res.status(400).json({
                    success: false,
                    message:
                        "La catégorie, le nom et le prix sont obligatoires"
                });
            }


            // Image
            const image = req.file
                ? `/uploads/${req.file.filename}`
                : null;


            const platId = await Plat.create({

                categorie_id,

                nom,

                description:
                    description || null,

                prix,

                image,

                disponibilite:
                    "disponible"
            });


            res.status(201).json({

                success: true,

                message:
                    "Plat créé avec succès",

                platId
            });

        } catch (error) {

            console.error(
                "Erreur création plat :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Erreur lors de la création du plat"
            });
        }
    },


    // ==========================================
    // MODIFIER UN PLAT
    // ==========================================
    update: async (req, res) => {
        try {

            const { id } = req.params;

            const plat =
                await Plat.getById(id);


            if (!plat) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Plat introuvable"
                });
            }


            const {
                categorie_id,
                nom,
                description,
                prix,
                disponibilite
            } = req.body;


            // Garder l'ancienne image
            // si aucune nouvelle image n'est choisie
            let image = plat.image;


            // Si une nouvelle image est envoyée
            if (req.file) {

                image =
                    `/uploads/${req.file.filename}`;
            }


            await Plat.update(id, {

                categorie_id,

                nom,

                description,

                prix,

                image,

                disponibilite
            });


            res.status(200).json({

                success: true,

                message:
                    "Plat modifié avec succès"
            });

        } catch (error) {

            console.error(
                "Erreur modification plat :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Erreur lors de la modification du plat"
            });
        }
    },


    // ==========================================
    // SUPPRIMER UN PLAT
    // ==========================================
    delete: async (req, res) => {
        try {

            const { id } = req.params;

            const plat =
                await Plat.getById(id);


            if (!plat) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Plat introuvable"
                });
            }


            await Plat.delete(id);


            res.status(200).json({

                success: true,

                message:
                    "Plat supprimé avec succès"
            });

        } catch (error) {

            console.error(
                "Erreur suppression plat :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la suppression du plat"
            });
        }
    }
};


module.exports = PlatController;