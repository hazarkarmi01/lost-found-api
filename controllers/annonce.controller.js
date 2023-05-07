// Importation du modèle d'annonce
const Annonce = require("../models/annoce.model");
const Item = require("../models/userItem.model");
// Import the required TensorFlow.js libraries


// Load the MobileNet model for feature extraction
const loadModel = async () => {
  const model = await mobilenet.load();
  return model;
};
const modelPromise = loadModel();
// Define a function to extract features from an image
const extractFeatures = async (imagePath, model) => {
  const image = tf.node.decodeImage(await fs.promises.readFile(imagePath));
  const features = await model.infer(image);
  image.dispose();
  return features;
};
// Define the createNewAnnonce function
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

      // Load the pre-trained MobileNet model for feature extraction
      const model = await modelPromise;

      // Extract features from the new post images
      const newFeatures = await Promise.all(
        photoPath.map(async (path) => extractFeatures(path, model))
      );

      // Query the database to retrieve the features of the existing posts
      const existingPosts = await Annonce.find({}).select('photos');
      const existingFeatures = [];
      for (const post of existingPosts) {
        const features = await Promise.all(
          post.photos.map(async (path) => extractFeatures(path, model))
        );
        existingFeatures.push(...features);
      }

      // Calculate the similarity scores between the new post and the existing posts
      const similarityThreshold = 0.8;
      const similarityScores = existingFeatures.map((features) =>
        tf.losses.cosineDistance(tf.tensor(newFeatures), tf.tensor(features))
      );
      const isSimilar = similarityScores.some(
        (score) => score.dataSync()[0] > similarityThreshold
      );
        console.log("Similair",isSimilar)
      if (isSimilar) {
        // If the similarity score exceeds the threshold, reject the new post
        res.json({ success: false, message: 'Similar post exists' });
      } else {
        // Otherwise, create and save the new post
        const newAnnonce = new Annonce({
          title,
          description,
          category,
          subCategory,
          createdBy: user,
          photos: photoPath
        });
        const result = await newAnnonce.save();
        console.log('Files', files);
        res.json({ success: true, result });
      }
    }
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
// // Définition de la fonction pour créer une nouvelle annonce
// const createNewAnnonce = async (req, res) => {
//   try {
//     // Récupération de l'utilisateur connecté à partir de la demande
//     let user = req.user;
//     // Récupération des informations d'annonce à partir de la demande
//     let { title, description, category, subCategory } = req.body;
//     // Récupération des fichiers joints à la demande
//     const files = req.files;
//     if (files) {
//       // Si des fichiers ont été joints à la demande, on enregistre leur chemin d'accès dans la variable photoPath
//       const photoPath = files.map((elm) => elm.path);
//       // Création d'une nouvelle annonce avec les informations récupérées
//       const newAnnonce = new Annonce({
//         title,
//         description,
//         category,
//         subCategory,
//         createdBy: user,
//         photos: photoPath
//       });
//       // Enregistrement de la nouvelle annonce dans la base de données
//       const result = await newAnnonce.save();
//       console.log("Files", files);
//       // Réponse avec succès et résultat
//       res.json({ success: true, result });
//     }
//   } catch (error) {
//     // En cas d'erreur, réponse avec un message d'erreur
//     res.json({ success: false, result: error.message });
//   }
// };

const getAllAnnonce = async (req, res) => {
  try {
    const result = await Annonce.find()
      .populate("createdBy")
      .populate("category")
      .populate("subCategory");
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
const createNewAnnonceFromItem = async (req, res) => {
  try {
    const { category, subCategory, itemId } = req.body;
    const item = await Item.findById(itemId);
    const newAnnonce = new Annonce({
      title: item.name,
      description: item.description,
      photos: item.photos,
      createdBy: item.owner,
      category,
      subCategory
    });
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
// Exportation de la fonction pour la rendre disponible pour d'autres fichiers
module.exports = { createNewAnnonce, getAllAnnonce, createNewAnnonceFromItem };
