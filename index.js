// Importation des modules nécessaires pour l'application
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors'); 
// Utilisation de l'analyseur de corps de demande
app.use(cors()); 
app.use(express.json());
const path = require("path");

// Importation des routeurs pour chaque entité
const userRouter = require("./routes/user.routes");
const categoryRouter = require("./routes/category.routes");
const annonceRouter = require("./routes/annonce.routes");

// Utilisation des routeurs pour chaque entité et assignation d'un préfixe de route
app.use("/users", userRouter);
app.use("/category", categoryRouter);
app.use("/annonce", annonceRouter);

// Configuration de l'accès aux fichiers statiques dans le dossier 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Définition du port pour l'application
const port = process.env.PORT || 3500;

// Connexion à la base de données MongoDB
mongoose.connect("mongodb://localhost:27017/lostfound").then(() => {
  console.log("db is running");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`App is runnning on port ${port}`);
});
