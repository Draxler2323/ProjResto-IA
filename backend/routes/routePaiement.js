const express = require("express");

const router = express.Router();

const PaiementController = require("../controllers/controllerPaiement");

router.get("/", PaiementController.getAll);
router.get("/:id", PaiementController.getById);
router.post("/", PaiementController.create);
router.put("/:id", PaiementController.update);
router.delete("/:id", PaiementController.delete);

module.exports = router;