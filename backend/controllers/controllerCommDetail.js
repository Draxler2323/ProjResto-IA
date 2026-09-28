const CommandeDetail = require("../models/modelCommDetail");

const CommandeDetailController = {

    // Récupérer tous les détails
    getAll: async (req, res) => {
        try {
            const details = await CommandeDetail.getAll();

            res.status(200).json({
                success: true,
                data: details
            });

        } catch (error) {
            console.error(
                "Erreur récupération détails :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des détails"
            });
        }
    },

    // Récupérer un détail par ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const detail = await CommandeDetail.getById(id);

            if (!detail) {
                return res.status(404).json({
                    success: false,
                    message: "Détail de commande introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: detail
            });

        } catch (error) {
            console.error(
                "Erreur récupération détail :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du détail"
            });
        }
    },

    // Récupérer les détails d'une commande
    getByCommandeId: async (req, res) => {
        try {
            const { commande_id } = req.params;

            const details =
                await CommandeDetail.getByCommandeId(
                    commande_id
                );

            res.status(200).json({
                success: true,
                data: details
            });

        } catch (error) {
            console.error(
                "Erreur récupération détails commande :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des détails de la commande"
            });
        }
    },

    // Créer un détail
    create: async (req, res) => {
        try {
            const {
                commande_id,
                plat_id,
                quantite,
                prix_unitaire,
                sous_total
            } = req.body;

            if (
                !commande_id ||
                !plat_id ||
                !quantite ||
                !prix_unitaire ||
                sous_total === undefined ||
                sous_total === null
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Toutes les informations obligatoires doivent être fournies"
                });
            }

            const detailId =
                await CommandeDetail.create({
                    commande_id,
                    plat_id,
                    quantite,
                    prix_unitaire,
                    sous_total
                });

            res.status(201).json({
                success: true,
                message: "Détail de commande créé avec succès",
                id: detailId
            });

        } catch (error) {
            console.error(
                "Erreur création détail :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du détail"
            });
        }
    },

    // Modifier un détail
    update: async (req, res) => {
        try {
            const { id } = req.params;

            const detail =
                await CommandeDetail.getById(id);

            if (!detail) {
                return res.status(404).json({
                    success: false,
                    message: "Détail de commande introuvable"
                });
            }

            await CommandeDetail.update(
                id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Détail de commande modifié avec succès"
            });

        } catch (error) {
            console.error(
                "Erreur modification détail :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du détail"
            });
        }
    },

    // Supprimer un détail
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const detail =
                await CommandeDetail.getById(id);

            if (!detail) {
                return res.status(404).json({
                    success: false,
                    message: "Détail de commande introuvable"
                });
            }

            await CommandeDetail.delete(id);

            res.status(200).json({
                success: true,
                message: "Détail de commande supprimé avec succès"
            });

        } catch (error) {
            console.error(
                "Erreur suppression détail :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du détail"
            });
        }
    }
};

module.exports = CommandeDetailController;