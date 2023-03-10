// Importation du modèle d'annonce
const Annonce = require("../models/annoce.model");

// Définition de la fonction pour créer une nouvelle annonce
const createNewAnnonce = async (req, res) => {
  try {
    // Récupération de l'utilisateur connecté à partir de la demande
    let user = req.user;
    // Récupération des informations d'annonce à partir de la demande
    let { title, description, category, subCategory } = req.body;
    // Récupération des fichiers joints à la demande
    const files = req.files;
    if (files) {
      // Si des fichiers ont été joints à la demande, on enregistre leur chemin d'accès dans la variable photoPath
      const photoPath = files.map((elm) => elm.path);
      // Création d'une nouvelle annonce avec les informations récupérées
      const newAnnonce = new Annonce({
        title,
        description,
        category,
        subCategory,
        createdBy: user,
        photos: photoPath,
      });
      // Enregistrement de la nouvelle annonce dans la base de données
      const result = await newAnnonce.save();
      console.log("Files", files);
      // Réponse avec succès et résultat
      res.json({ success: true, result });
    }
  } catch (error) {
    // En cas d'erreur, réponse avec un message d'erreur
    res.json({ success: false, result: error.message });
  }
};

// Exportation de la fonction pour la rendre disponible pour d'autres fichiers
module.exports = { createNewAnnonce };
