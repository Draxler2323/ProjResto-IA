const Notification = require("../models/modelNotification");

const NotificationController = {

    // ==========================================
    // RÉCUPÉRER TOUTES LES NOTIFICATIONS
    // ==========================================
    getAll: async (req, res) => {
        try {

            const notifications = await Notification.getAll();

            res.status(200).json({
                success: true,
                data: notifications
            });

        } catch (error) {

            console.error(
                "Erreur récupération notifications :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des notifications"
            });

        }
    },


    // ==========================================
    // RÉCUPÉRER UNE NOTIFICATION PAR ID
    // ==========================================
    getById: async (req, res) => {
        try {

            const { id } = req.params;

            const notification = await Notification.getById(id);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: "Notification introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: notification
            });

        } catch (error) {

            console.error(
                "Erreur récupération notification :",
                error
            );

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la notification"
            });

        }
    },


    // ==========================================
    // CRÉER UNE NOTIFICATION
    // ==========================================
    create: async (req, res) => {
        try {

            const {
                user_id,
                commande_id,
                titre,
                message,
                type
            } = req.body;


            // Vérification des champs obligatoires
            if (
                !user_id ||
                !titre ||
                !message ||
                !type
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Les informations obligatoires sont manquantes"
                });

            }


            const notificationId = await Notification.create({

                user_id,

                commande_id: commande_id || null,

                titre,

                message,

                type,

                lu: false

            });


            res.status(201).json({

                success: true,

                message: "Notification créée avec succès",

                notificationId

            });

        } catch (error) {

            console.error(
                "Erreur création notification :",
                error
            );

            res.status(500).json({

                success: false,

                message: "Erreur lors de la création de la notification"

            });

        }
    },


    // ==========================================
    // MODIFIER UNE NOTIFICATION
    // ==========================================
    update: async (req, res) => {
        try {

            const { id } = req.params;


            // Vérifier si la notification existe
            const notification = await Notification.getById(id);

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message: "Notification introuvable"

                });

            }


            await Notification.update(
                id,
                req.body
            );


            res.status(200).json({

                success: true,

                message: "Notification modifiée avec succès"

            });

        } catch (error) {

            console.error(
                "Erreur modification notification :",
                error
            );

            res.status(500).json({

                success: false,

                message: "Erreur lors de la modification de la notification"

            });

        }
    },


    // ==========================================
    // MARQUER UNE NOTIFICATION COMME LUE
    // ==========================================
    markAsRead: async (req, res) => {
        try {

            const { id } = req.params;


            // Vérifier si la notification existe
            const notification = await Notification.getById(id);

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message: "Notification introuvable"

                });

            }


            await Notification.markAsRead(id);


            res.status(200).json({

                success: true,

                message: "Notification marquée comme lue"

            });

        } catch (error) {

            console.error(
                "Erreur marquage notification :",
                error
            );

            res.status(500).json({

                success: false,

                message: "Erreur lors du marquage de la notification"

            });

        }
    },


    // ==========================================
    // SUPPRIMER UNE NOTIFICATION
    // ==========================================
    delete: async (req, res) => {
        try {

            const { id } = req.params;


            // Vérifier si la notification existe
            const notification = await Notification.getById(id);

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message: "Notification introuvable"

                });

            }


            await Notification.delete(id);


            res.status(200).json({

                success: true,

                message: "Notification supprimée avec succès"

            });

        } catch (error) {

            console.error(
                "Erreur suppression notification :",
                error
            );

            res.status(500).json({

                success: false,

                message: "Erreur lors de la suppression de la notification"

            });

        }
    }

};


module.exports = NotificationController;