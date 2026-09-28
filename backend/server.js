const express = require("express");
const cors = require("cors");
const bodyParser=require('body-parser')
require("dotenv").config();

const path = require("path");

const userRoutes = require("./routes/routeUser");
const catRoutes = require("./routes/routeCat");
const commRoutes = require("./routes/routeCommande");
const comdetRoutes = require("./routes/routeComDet");
const livrRoutes = require("./routes/routeLivreur");
const livrsRoutes = require("./routes/routeLivraison");
const paiemRoutes = require("./routes/routePaiement");
const tariflivRoutes = require("./routes/routeTarifLiv");
const notifRoutes = require("./routes/routeNotif");
const platRoutes = require("./routes/routePlat");
const statistiquesRoutes =require("./routes/routeStatistiques");



const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true }))
app.use(bodyParser.json())
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
  );

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", catRoutes);
app.use("/api/commandes", commRoutes);
app.use("/api/commande_details", comdetRoutes);
app.use("/api/livreurs", livrRoutes);
app.use("/api/livraisons", livrsRoutes);
app.use("/api/paiements", paiemRoutes);
app.use("/api/tarifs_livraison", tariflivRoutes);
app.use("/api/notifications", notifRoutes);
app.use("/api/plats", platRoutes );
app.use("/api/statistiques", statistiquesRoutes);


// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "API Restaurant fonctionne correctement 🚀"
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});