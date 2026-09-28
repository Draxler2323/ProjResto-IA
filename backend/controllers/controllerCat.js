const Category = require("../models/modelCategory");

const CategoryController = {

    // Récupérer toutes les catégories
    getAll: async (req, res) => {
        try {
            const categories = await Category.getAll();

            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des catégories"
            });
        }
    },


    // Récupérer une catégorie
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.getById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Catégorie introuvable"
                });
            }

            res.status(200).json({
                success: true,
                data: category
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la catégorie"
            });
        }
    },


    // Créer une catégorie
    create: async (req, res) => {
        try {
            const {
                nom,
                description,
                image
            } = req.body;

            if (!nom) {
                return res.status(400).json({
                    success: false,
                    message: "Le nom de la catégorie est obligatoire"
                });
            }

            const categoryId = await Category.create({
                nom,
                description: description || null,
                image: image || null,
                statut: "actif"
            });

            res.status(201).json({
                success: true,
                message: "Catégorie créée avec succès",
                categoryId
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la catégorie"
            });
        }
    },


    // Modifier une catégorie
    update: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                nom,
                description,
                image,
                statut
            } = req.body;

            const category = await Category.getById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Catégorie introuvable"
                });
            }

            await Category.update(id, {
                nom,
                description,
                image,
                statut
            });

            res.status(200).json({
                success: true,
                message: "Catégorie modifiée avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification de la catégorie"
            });
        }
    },


    // Supprimer une catégorie
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.getById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Catégorie introuvable"
                });
            }

            await Category.delete(id);

            res.status(200).json({
                success: true,
                message: "Catégorie supprimée avec succès"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la catégorie"
            });
        }
    }

};

module.exports = CategoryController;