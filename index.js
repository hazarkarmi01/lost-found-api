// Importation des modules nécessaires pour l'application
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
// Utilisation de l'analyseur de corps de demande
app.use(cors());
app.use(express.json());
const path = require("path");

// Importation des routeurs pour chaque entité
const userRouter = require("./routes/user.routes");
const categoryRouter = require("./routes/category.routes");
const annonceRouter = require("./routes/annonce.routes");
const itemsRouter = require("./routes/items.routes");
// Utilisation des routeurs pour chaque entité et assignation d'un préfixe de route
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/annonce", annonceRouter);
app.use("/api/items", itemsRouter);

// Configuration de l'accès aux fichiers statiques dans le dossier 'uploads'
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Définition du port pour l'application
const port = process.env.PORT || 3500;

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("db is running");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`App is runnning on port ${port}`);
});
