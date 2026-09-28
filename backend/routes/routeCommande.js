const express = require("express");

const router = express.Router();

const CommandeController = require("../controllers/controllerCommand");

// Récupérer toutes les commandes
router.get("/", CommandeController.getAll);

// Récupérer les commandes d'un client par téléphone
router.get(
    "/client/:telephone",
    CommandeController.getByTelephone
);

// Créer une commande
router.post("/", CommandeController.create);

// Modifier une commande
router.put("/:id", CommandeController.update);

// Modifier le statut
router.patch("/:id/status", CommandeController.updateStatus);

// CLIENT : confirmer la réception
router.patch(
    "/:id/confirmer-reception",
    CommandeController.confirmerReception
);

// Récupérer une commande par ID
router.get("/:id", CommandeController.getById);

//assigner un livreur
router.patch("/:id/assigner-livreur",
    CommandeController.assignerLivreur
);
//reassigner livreur
router.patch(
    "/:id/reassigner-livreur",
    CommandeController.reassignerLivreur
);

// Supprimer une commande
router.delete("/:id", CommandeController.delete);

module.exports = router;