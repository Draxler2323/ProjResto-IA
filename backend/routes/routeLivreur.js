const express = require("express");

const router = express.Router();

const LivreurController = require("../controllers/controllerLivreur");


// Tous les livreurs
router.get("/", LivreurController.getAll);

// Livreurs disponibles
router.get("/disponibles", LivreurController.getAvailable);

// Un livreur
router.get("/:id", LivreurController.getById);

// Créer un livreur
router.post("/", LivreurController.create);

// Modifier un livreur
router.put("/:id", LivreurController.update);

// Modifier uniquement le statut
router.patch("/:id/status", LivreurController.updateStatus);

// Supprimer un livreur
router.delete("/:id", LivreurController.delete);


module.exports = router;