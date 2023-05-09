// Importation du modèle d'annonce
const Annonce = require("../models/annoce.model");
const Item = require("../models/userItem.model");
const vision = require("@google-cloud/vision");
const { Storage } = require("@google-cloud/storage");

const client = new vision.ImageAnnotatorClient({
  // Replace with your Google Cloud project ID and credentials file path
  projectId: "quick-platform-386215",
  keyFilename: "./controllers/quick-platform-386215-050b00f72899.json"
  //key: "AIzaSyAWGbcvySYStPDHT5pO5QDHxLVZ1ZlLN9c"
});
const storage = new Storage({
  projectId: "quick-platform-386215",
  keyFilename: "./controllers/quick-platform-386215-050b00f72899.json"
});
const bucket = storage.bucket("gs://test-bucket-lostfound");
const BASE_URL ="https://13.82.2.24.nip.io/api"
// Import the required TensorFlow.js libraries

// Load the MobileNet model for feature extraction
const extractFeatures = async (imgPath) => {
  const img = await cv.imreadAsync(imgPath);
  const orb = new cv.ORB();
  const keypoints = orb.detect(img);
  const descriptors = orb.compute(img, keypoints);
  return descriptors;
};

const findSimilarAnnonce = async (photoPath) => {
  try {
    // Get all Annonce documents from the database
    const allAnnonces = await Annonce.find({});
    // Perform label detection on the uploaded images using the Google Vision SDK
    const labelDetectionResponses = await Promise.all(
      photoPath.map(async (path) => {
        const [result] = await client.labelDetection(`${BASE_URL}/${path}`);
        return result.labelAnnotations.map(
          (annotation) => annotation.description
        );
      })
    );
    const uploadedLabels = labelDetectionResponses.flat();

    // Filter the Annonce documents that have similar images
    const similarAnnonces = allAnnonces.filter((annonce) => {
      if (!annonce.photosLabels) return false;
      const simLabels = uploadedLabels.filter((label) =>
        annonce.photosLabels.includes(label)
      );
      return simLabels.length > 0;
    });

    return similarAnnonces;
  } catch (error) {
    console.log("Error in findSimilarAnnonce:", error);
    return [];
  }
};

const createNewAnnonce = async (req, res) => {
  try {
    let user = req.user;
    let { title, description, category, subCategory } = req.body;
    const files = req.files;
    if (files) {
      const photoPath = files.map((elm) => elm.path);

      // Get all Annonce documents from the database
      const allAnnonces = await Annonce.find({});

      // Perform label detection on the uploaded images using the Google Vision SDK
      const labelDetectionResponses = await Promise.all(
        photoPath.map(async (path) => {
          const [result] = await client.labelDetection(`${BASE_URL}/${path}`);
          return result.labelAnnotations.map((annotation) => annotation.description);
        })
      );
      const uploadedLabels = labelDetectionResponses.flat();

      // Filter the Annonce documents that have similar images
      const similarAnnonces = findSimilarAnnonce(allAnnonces, uploadedLabels);

      if (similarAnnonces.length > 0) {
        // If there are similar Annonce documents, return all of them
        res.json({ success: true, result: similarAnnonces });
      } else {
        // Otherwise, create a new Annonce document
        const newAnnonce = new Annonce({
          title,
          description,
          category,
          subCategory,
          createdBy: user,
          photos: photoPath,
          photosLabels: uploadedLabels,
        });
        const result = await newAnnonce.save();
        res.json({ success: true, result });
      }
    }
  } catch (error) {
    console.log("Error", error);
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
