const express = require("express");

const router = express.Router();

const TarifLivraisonController = require("../controllers/controllerTarifLiv");

router.get("/", TarifLivraisonController.getAll);
router.get("/:id", TarifLivraisonController.getById);
router.post("/", TarifLivraisonController.create);
router.put("/:id", TarifLivraisonController.update);
router.delete("/:id", TarifLivraisonController.delete);

module.exports = router;