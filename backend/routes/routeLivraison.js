const express = require("express");
const router = express.Router();
const LivraisonController = require("../controllers/controllerLivraison");

router.get("/", LivraisonController.getAll);

router.get(
    "/livreur/:livreur_id",
    LivraisonController.getByLivreur
);

router.get(
    "/livreur/:livreur_id/actives",
    LivraisonController.getActivesByLivreur
);

router.get(
    "/:id",
    LivraisonController.getById
);

router.post(
    "/",
    LivraisonController.create
);

router.put(
    "/:id",
    LivraisonController.update
);

router.patch(
    "/:id/statut",
    LivraisonController.updateStatus
);

// ==========================================
// REFUSER UNE LIVRAISON
// ==========================================
router.patch(
    "/:id/refuser",
    LivraisonController.refuser
);

router.delete(
    "/:id",
    LivraisonController.delete
);

module.exports = router;