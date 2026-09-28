const Livraison = require("../models/modelLivraison");

const LivraisonController = {

    // ==========================================
    // RÉCUPÉRER TOUTES LES LIVRAISONS
    // ==========================================
    getAll: async (req, res) => {
        try {
            const livraisons = await Livraison.getAll();

            res.status(200).json({
                success: true,
                data: livraisons
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des livraisons"
            });
        }
    },


    // ==========================================
    // RÉCUPÉRER LES LIVRAISONS D'UN LIVREUR
    // ==========================================
    getByLivreur: async (req, res) => {
        try {
            const { livreur_id } = req.params;

            const livraisons = await Livraison.getByLivreur(livreur_id);

            res.status(200).json({
                success: true,
                data: livraisons
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération des livraisons du livreur"
            });
        }
    },


    // ==========================================
    // RÉCUPÉRER LES LIVRAISONS ACTIVES
    // ==========================================
    getActivesByLivreur: async (req, res) => {
        try {
            const { livreur_id } = req.params;

            const livraisons =
                await Livraison.getActivesByLivreur(livreur_id);

            res.status(200).json({
                success: true,
                data: livraisons
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération des livraisons actives"
            });
        }
    },


    // ==========================================
    // RÉCUPÉRER UNE LIVRAISON PAR ID
    // ==========================================
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const livraison = await Livraison.getById(id);

            if (!livraison) {
                return res.status(404).json({
                    success: false,
                    message: "Livraison introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: livraison
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération de la livraison"
            });
        }
    },


    // ==========================================
    // CRÉER UNE LIVRAISON
    // ==========================================
    create: async (req, res) => {
        try {
            const {
                commande_id,
                livreur_id,
                distance_km,
                frais_livraison,
                statut
            } = req.body;

            if (
                !commande_id ||
                !livreur_id ||
                distance_km === undefined ||
                frais_livraison === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Les informations obligatoires sont manquantes"
                });
            }

            const livraisonId = await Livraison.create({
                commande_id,
                livreur_id,
                distance_km,
                frais_livraison,
                statut: statut || "en_attente"
            });

            res.status(201).json({
                success: true,
                message: "Livraison créée avec succès",
                livraisonId
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la création de la livraison"
            });
        }
    },


    // ==========================================
    // MODIFIER UNE LIVRAISON
    // ==========================================
    update: async (req, res) => {
        try {
            const { id } = req.params;

            const livraison = await Livraison.getById(id);

            if (!livraison) {
                return res.status(404).json({
                    success: false,
                    message: "Livraison introuvable"
                });
            }

            await Livraison.update(id, req.body);

            res.status(200).json({
                success: true,
                message: "Livraison modifiée avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la modification de la livraison"
            });
        }
    },


    // ==========================================
    // CHANGER LE STATUT D'UNE LIVRAISON
    // ==========================================
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { statut } = req.body;

            if (!statut) {
                return res.status(400).json({
                    success: false,
                    message: "Le statut est obligatoire"
                });
            }

            const livraison = await Livraison.getById(id);

            if (!livraison) {
                return res.status(404).json({
                    success: false,
                    message: "Livraison introuvable"
                });
            }

            await Livraison.updateStatus(id, statut);

            res.status(200).json({
                success: true,
                message: "Statut de la livraison mis à jour"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Erreur lors de la modification du statut"
            });
        }
    },


    // ==========================================
    // REFUSER UNE LIVRAISON
    // ==========================================
    refuser: async (req, res) => {
        try {

            const { id } = req.params;
            const { motif_refus } = req.body;

            // ==========================================
            // Vérifier le motif
            // ==========================================

            if (
                !motif_refus ||
                motif_refus.trim().length < 3
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Veuillez indiquer le motif du refus."
                });
            }

            // ==========================================
            // Vérifier que la livraison existe
            // ==========================================

            const livraison = await Livraison.getById(id);

            if (!livraison) {
                return res.status(404).json({
                    success: false,
                    message: "Livraison introuvable"
                });
            }

            // ==========================================
            // Refuser la livraison
            // ==========================================

            await Livraison.refuser(
                id,
                motif_refus
            );

            res.status(200).json({
                success: true,
                message:
                    "La livraison a été refusée avec succès"
            });

        } catch (error) {

            console.error(
                "Erreur refus livraison :",
                error
            );

            res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "Erreur lors du refus de la livraison"
            });
        }
    },


    // ==========================================
    // SUPPRIMER UNE LIVRAISON
    // ==========================================
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const livraison = await Livraison.getById(id);

            if (!livraison) {
                return res.status(404).json({
                    success: false,
                    message: "Livraison introuvable"
                });
            }

            await Livraison.delete(id);

            res.status(200).json({
                success: true,
                message:
                    "Livraison supprimée avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la suppression de la livraison"
            });
        }
    }

};

module.exports = LivraisonController;