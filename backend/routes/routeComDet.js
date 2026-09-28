const express = require("express");

const router = express.Router();

const CommandeDetailController =
    require("../controllers/controllerCommDetail");

// Tous les détails
router.get(
    "/",
    CommandeDetailController.getAll
);

// Détails d'une commande
// Cette route doit être AVANT /:id
router.get(
    "/commande/:commande_id",
    CommandeDetailController.getByCommandeId
);

// Un détail précis
router.get(
    "/:id",
    CommandeDetailController.getById
);

// Créer
router.post(
    "/",
    CommandeDetailController.create
);

// Modifier
router.put("/:id",CommandeDetailController.update
);

// Supprimer
router.delete(
    "/:id",
    CommandeDetailController.delete
);

module.exports = router;