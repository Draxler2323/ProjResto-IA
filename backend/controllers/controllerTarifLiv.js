const TarifLivraison = require("../models/modelTarifLivraison");

const TarifLivraisonController = {

    getAll: async (req, res) => {
        try {
            const tarifs = await TarifLivraison.getAll();

            res.status(200).json({
                success: true,
                data: tarifs
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des tarifs"
            });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const tarif = await TarifLivraison.getById(id);

            if (!tarif) {
                return res.status(404).json({
                    success: false,
                    message: "Tarif introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: tarif
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du tarif"
            });
        }
    },

    create: async (req, res) => {
        try {
            const {
                distance_min,
                distance_max,
                prix,
                statut
            } = req.body;

            if (
                distance_min === undefined ||
                distance_max === undefined ||
                prix === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "distance_min, distance_max et prix sont obligatoires"
                });
            }

            const tarifId = await TarifLivraison.create({
                distance_min,
                distance_max,
                prix,
                statut: statut || "actif"
            });

            res.status(201).json({
                success: true,
                message: "Tarif créé avec succès",
                tarifId
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du tarif"
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;

            const tarif = await TarifLivraison.getById(id);

            if (!tarif) {
                return res.status(404).json({
                    success: false,
                    message: "Tarif introuvable"
                });
            }

            await TarifLivraison.update(id, req.body);

            res.status(200).json({
                success: true,
                message: "Tarif modifié avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du tarif"
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const tarif = await TarifLivraison.getById(id);

            if (!tarif) {
                return res.status(404).json({
                    success: false,
                    message: "Tarif introuvable"
                });
            }

            await TarifLivraison.delete(id);

            res.status(200).json({
                success: true,
                message: "Tarif supprimé avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Tarif supprimé avec succès"
            });
        }
    }
};

module.exports = TarifLivraisonController;