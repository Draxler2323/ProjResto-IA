const Statistiques = require("../models/ModelStatistiques");

const StatistiquesController = {

    // ==========================================
    // RÉCUPÉRER TOUTES LES STATISTIQUES
    // ==========================================
    getAll: async (req, res) => {

        try {

            const [
                generales,
                livraisons,
                commandesParStatut,
                evolutionCommandes,
                platsPopulaires,
                performanceLivreurs
            ] = await Promise.all([

                Statistiques.getGenerales(),

                Statistiques.getTotalLivraisons(),

                Statistiques.getCommandesParStatut(),

                Statistiques.getEvolutionCommandes(),

                Statistiques.getPlatsPopulaires(),

                Statistiques.getPerformanceLivreurs()

            ]);


            res.status(200).json({

                success: true,

                data: {

                    generales: {
                        ...generales,
                        ...livraisons
                    },

                    commandesParStatut,

                    evolutionCommandes,

                    platsPopulaires,

                    performanceLivreurs

                }

            });

        } catch (error) {

            console.error(
                "Erreur récupération statistiques :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la récupération des statistiques"

            });

        }

    }

};

module.exports = StatistiquesController;