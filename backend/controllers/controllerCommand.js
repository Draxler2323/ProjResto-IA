const Commande = require("../models/modelCommande");
const calculerDistance = require("../utils/distance");

const CommandeController = {

    // ==========================================
    // Récupérer toutes les commandes
    // ==========================================
    getAll: async (req, res) => {
        try {

            const commandes = await Commande.getAll();

            res.status(200).json({
                success: true,
                data: commandes
            });

        } catch (error) {

            console.error(
                "Erreur récupération commandes :",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération des commandes"
            });
        }
    },


    // ==========================================
    // Récupérer une commande par ID
    // ==========================================
    getById: async (req, res) => {
        try {

            const { id } = req.params;

            const commande =
                await Commande.getById(id);

            if (!commande) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Commande introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: commande
            });

        } catch (error) {

            console.error(
                "Erreur récupération commande :",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération de la commande"
            });
        }
    },


    // ==========================================
    // Récupérer toutes les commandes d'un client
    // ==========================================
    getByTelephone: async (req, res) => {
        try {

            const { telephone } = req.params;

            if (!telephone || !telephone.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Le numéro de téléphone est obligatoire"
                });
            }

            const commandes =
                await Commande.getByTelephone(telephone.trim());

            res.status(200).json({
                success: true,
                data: commandes
            });

        } catch (error) {

            console.error(
                "Erreur récupération commandes client :",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Erreur lors de la récupération des commandes du client"
            });
        }
    },


    // ==========================================
    // CRÉER UNE COMMANDE COMPLÈTE
    // ==========================================
    create: async (req, res) => {

        try {

            const {
                client_nom,
                client_telephone,
                latitude,
                longitude,
                adresse,
                panier
            } = req.body;


            // ==========================================
            // Vérifications
            // ==========================================

            if (!client_nom || !client_nom.trim()) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Le nom du client est obligatoire"
                });
            }


            if (
                !client_telephone ||
                !client_telephone.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Le numéro de téléphone est obligatoire"
                });
            }


            if (
                latitude === undefined ||
                latitude === null ||
                longitude === undefined ||
                longitude === null
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "La localisation GPS est obligatoire"
                });
            }


            if (!adresse || !adresse.trim()) {

                return res.status(400).json({
                    success: false,
                    message:
                        "L'adresse est obligatoire"
                });
            }


            if (
                !Array.isArray(panier) ||
                panier.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Le panier est vide"
                });
            }


            // ==========================================
            // Calcul de la distance restaurant → client
            // ==========================================

            const restaurantLat = -3.346178;
            const restaurantLng = 29.372166;

            const distance = calculerDistance(
                restaurantLat,
                restaurantLng,
                Number(latitude),
                Number(longitude)
            );

            console.log(
                `Distance restaurant → client : ${distance.toFixed(2)} km`
            );


            // ==========================================
            // Création de la commande
            // ==========================================

            const commande =
                await Commande.createComplete({

                    client_nom:
                        client_nom.trim(),

                    client_telephone:
                        client_telephone.trim(),

                    latitude,

                    longitude,

                    adresse:
                        adresse.trim(),

                    panier
                });


            // ==========================================
            // Réponse
            // ==========================================

            res.status(201).json({

                success: true,

                message:
                    "Commande envoyée avec succès",

                data: commande
            });


        } catch (error) {

            console.error(
                "Erreur création commande :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Erreur lors de la création de la commande"
            });
        }
    },


    // ==========================================
    // Modifier une commande
    // ==========================================
    update: async (req, res) => {

        try {

            const { id } = req.params;

            const commande =
                await Commande.getById(id);

            if (!commande) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Commande introuvable"
                });
            }


            await Commande.update(
                id,
                req.body
            );


            res.status(200).json({

                success: true,

                message:
                    "Commande modifiée avec succès"
            });


        } catch (error) {

            console.error(
                "Erreur modification commande :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la modification de la commande"
            });
        }
    },


    // ==========================================
    // Modifier le statut
    // ==========================================
    updateStatus: async (req, res) => {

        try {

            const { id } = req.params;

            const {
                statut,
                motif_refus
            } = req.body;


            const commande =
                await Commande.getById(id);

            if (!commande) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Commande introuvable"
                });
            }


            const statutsAutorises = [

                "en_attente",

                "approuvee",

                "refusee",

                "livreur_assigne",

                "en_preparation",

                "prete",

                "en_livraison",

                "livree",

                "annulee"

            ];


            if (!statutsAutorises.includes(statut)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Statut invalide"
                });
            }


            await Commande.updateStatus(

                id,

                statut,

                motif_refus || null

            );


            res.status(200).json({

                success: true,

                message:
                    "Statut de la commande mis à jour"
            });


        } catch (error) {

            console.error(
                "Erreur changement statut :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la modification du statut"
            });
        }
    },


 // ==========================================
// CLIENT : CONFIRMER LA RÉCEPTION
// ==========================================
confirmerReception: async (req, res) => {

    try {

        const { id } = req.params;

        // ==========================================
        // Vérifier que la commande existe
        // ==========================================

        const commande =
            await Commande.getById(id);

        if (!commande) {

            return res.status(404).json({
                success: false,
                message: "Commande introuvable"
            });
        }

        // ==========================================
        // Vérifier le statut actuel
        // ==========================================

        if (commande.statut !== "en_livraison") {

            return res.status(400).json({
                success: false,
                message:
                    "Cette commande ne peut pas être confirmée. Elle doit être en livraison."
            });
        }

        // ==========================================
        // Confirmer la réception du client
        // ==========================================

        await Commande.confirmerReceptionClient(id);

        // ==========================================
        // Réponse
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Réception de la commande confirmée avec succès"

        });

    } catch (error) {

        console.error(
            "Erreur confirmation réception :",
            error
        );

        res.status(400).json({

            success: false,

            message:
                error.message ||
                "Erreur lors de la confirmation de réception"
        });
    }
},

    // ==========================================
// ASSIGNER UN LIVREUR À UNE COMMANDE
// ==========================================
assignerLivreur: async (req, res) => {

    try {

        const { id } = req.params;
        const { livreur_id } = req.body;


        // Vérifier le livreur
        if (!livreur_id) {

            return res.status(400).json({
                success: false,
                message: "Le livreur est obligatoire"
            });
        }


        // Vérifier la commande
        const commande =
            await Commande.getById(id);

        if (!commande) {

            return res.status(404).json({
                success: false,
                message: "Commande introuvable"
            });
        }


        // Attribution
        await Commande.assignerLivreur(
            id,
            Number(livreur_id)
        );


        res.status(200).json({

            success: true,

            message:
                "Livreur assigné avec succès"
        });


    } catch (error) {

        console.error(
            "Erreur attribution livreur :",
            error
        );

        res.status(400).json({

            success: false,

            message:
                error.message ||
                "Erreur lors de l'attribution du livreur"
        });
    }
},

// ==========================================
// RÉASSIGNER UN LIVREUR APRÈS UN REFUS
// ==========================================
reassignerLivreur: async (req, res) => {

    try {

        const { id } = req.params;
        const { livreur_id } = req.body;


        // ==========================================
        // Vérifier le nouveau livreur
        // ==========================================

        if (!livreur_id) {

            return res.status(400).json({
                success: false,
                message: "Le nouveau livreur est obligatoire"
            });
        }


        // ==========================================
        // Vérifier la commande
        // ==========================================

        const commande =
            await Commande.getById(id);

        if (!commande) {

            return res.status(404).json({
                success: false,
                message: "Commande introuvable"
            });
        }


        // ==========================================
        // Réassigner le livreur
        // ==========================================

        await Commande.reassignerLivreur(
            id,
            Number(livreur_id)
        );


        // ==========================================
        // Réponse
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Nouveau livreur assigné avec succès"
        });


    } catch (error) {

        console.error(
            "Erreur réassignation livreur :",
            error
        );

        res.status(400).json({

            success: false,

            message:
                error.message ||
                "Erreur lors de la réassignation du livreur"
        });
    }
},

    // ==========================================
    // Supprimer une commande
    // ==========================================
    delete: async (req, res) => {

        try {

            const { id } = req.params;

            const commande =
                await Commande.getById(id);

            if (!commande) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Commande introuvable"
                });
            }


            await Commande.delete(id);


            res.status(200).json({

                success: true,

                message:
                    "Commande supprimée avec succès"
            });


        } catch (error) {

            console.error(
                "Erreur suppression commande :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la suppression de la commande"
            });
        }
    }

};


module.exports = CommandeController;