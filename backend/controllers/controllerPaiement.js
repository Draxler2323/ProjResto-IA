const Paiement = require("../models/modelPaiement");

const PaiementController = {

    getAll: async (req, res) => {
        try {
            const paiements = await Paiement.getAll();

            res.status(200).json({
                success: true,
                data: paiements
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des paiements"
            });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const paiement = await Paiement.getById(id);

            if (!paiement) {
                return res.status(404).json({
                    success: false,
                    message: "Paiement introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: paiement
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du paiement"
            });
        }
    },

    create: async (req, res) => {
        try {
            const {
                commande_id,
                livreur_id,
                montant,
                mode,
                reference_transaction,
                preuve
            } = req.body;

            if (!commande_id || !livreur_id || !montant || !mode) {
                return res.status(400).json({
                    success: false,
                    message: "Les informations obligatoires sont manquantes"
                });
            }

            const paiementId = await Paiement.create({
                commande_id,
                livreur_id,
                montant,
                mode,
                statut: "en_attente",
                reference_transaction: reference_transaction || null,
                preuve: preuve || null,
                date_paiement: null
            });

            res.status(201).json({
                success: true,
                message: "Paiement créé avec succès",
                paiementId
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du paiement"
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;

            const paiement = await Paiement.getById(id);

            if (!paiement) {
                return res.status(404).json({
                    success: false,
                    message: "Paiement introuvable"
                });
            }

            await Paiement.update(id, req.body);

            res.status(200).json({
                success: true,
                message: "Paiement modifié avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du paiement"
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const paiement = await Paiement.getById(id);

            if (!paiement) {
                return res.status(404).json({
                    success: false,
                    message: "Paiement introuvable"
                });
            }

            await Paiement.delete(id);

            res.status(200).json({
                success: true,
                message: "Paiement supprimé avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du paiement"
            });
        }
    }
};

module.exports = PaiementController;