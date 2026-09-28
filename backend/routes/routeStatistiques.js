const express = require("express");

const router = express.Router();

const StatistiquesController =
    require("../controllers/controllerStatistiques");


// ==========================================
// RÉCUPÉRER TOUTES LES STATISTIQUES
// ==========================================
router.get(
    "/",
    StatistiquesController.getAll
);


module.exports = router;