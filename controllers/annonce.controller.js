// Importation du modèle d'annonce
const Annonce = require("../models/annoce.model");
const Item = require("../models/userItem.model");
const vision = require("@google-cloud/vision");
const cloudinary = require("cloudinary").v2;
const { getMessaging } = require("firebase-admin/messaging");
cloudinary.config({
  cloud_name: "dnozudt2x",
  api_key: "956142484736458",
  api_secret: "Y7w8mstqLX4B-KScPuuPVotkKd0",
});
const client = new vision.ImageAnnotatorClient({
  // Replace with your Google Cloud project ID and credentials file path
  projectId: "quick-platform-386215",
  keyFilename: "./controllers/quick-platform-386215-050b00f72899.json",
});

async function compareImages(imageUrl1, imageUrl2, visionClient) {
  const response1 = await visionClient.imageProperties(imageUrl1);
  const response2 = await visionClient.imageProperties(imageUrl2);
  const dominantColors1 =
    response1[0].imagePropertiesAnnotation.dominantColors.colors
      .slice(0, 3)
      .map((color) => color.color.red + color.color.green + color.color.blue);
  const dominantColors2 =
    response2[0].imagePropertiesAnnotation.dominantColors.colors
      .slice(0, 3)
      .map((color) => color.color.red + color.color.green + color.color.blue);
  const similarityScore = calculateColorSimilarity(
    dominantColors1,
    dominantColors2
  );
  return similarityScore;
}

function calculateColorSimilarity(colors1, colors2) {
  const sum = colors1.reduce((acc, color, index) => {
    const difference = Math.abs(color - colors2[index]);
    return acc + difference;
  }, 0);
  const similarityScore = (1 - sum / (255 * 3)) * 100;
  return similarityScore;
}

const createNewAnnonce = async (req, res) => {
  try {
    let user = req.user;
    let { title, description, category, subCategory, isLost } = req.body;
    const files = req.files;
    if (files) {
      const photoPath = files.map((elm) => elm.path);
      let allAnnonces = [];
      if (isLost) {
        allAnnonces = await Annonce.find({ isLost: false });
      } else {
        allAnnonces = await Annonce.find({ isLost: true });
      }

      // Compare uploaded images with the images in the database
      const visionClient = client;
      const similarityScores = await Promise.all(
        photoPath.map(async (url) => {
          const response = await visionClient.imageProperties(url);
          const dominantColors =
            response[0].imagePropertiesAnnotation.dominantColors.colors
              .slice(0, 3)
              .map(
                (color) =>
                  color.color.red + color.color.green + color.color.blue
              );
          return Promise.all(
            allAnnonces.map(async (annonce) => {
              const similarityScore = await compareImages(
                url,
                annonce.photos[0],
                visionClient
              );
              return similarityScore;
            })
          );
        })
      );

      // Filter the Annonce documents that have similar images
      const similarAnnonces = allAnnonces.filter((annonce, index) => {
        const similarityScore = similarityScores[index];
        //console.log("Similar Annonce", similarityScore);
        if (similarityScore) {
          const totalSimilarityScore = similarityScore.reduce(
            (acc, score) => Number(acc) + Number(score),
            0
          );
          const averageSimilarityScore =
            totalSimilarityScore / similarityScore.length;
          //console.log("Average Similar", averageSimilarityScore);
          if (averageSimilarityScore > SIMILARITY_THRESHOLD) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      });

      // If there are similar Annonce documents, return all of them
      if (similarAnnonces.length > 0) {
        res.json({ success: true, result: similarAnnonces, isLost });
      } else {
        // Otherwise, create a new Annonce document
        const newAnnonce = new Annonce({
          title,
          description,
          category,
          subCategory,
          createdBy: user,
          photos: photoPath,
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
const SIMILARITY_THRESHOLD = 20;
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
      subCategory,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
const markAnnonceAsFound = async (req, res) => {
  try {
    let user = req.user;
    let { annonceId } = req.params;
    const annonce = await Annonce.findByIdAndUpdate(annonceId, {
      foundBy: user,
    });
    const message = getMessaging();
    const foundAnnoce = await Annonce.findById(annonce._id).populate("foundBy");
    let result = await message.send({
      notification: {
        title: "Element Trouvé",
        body: `${foundAnnoce.foundBy.firstName} ${foundAnnoce.foundBy.lastName} à marquer votre element comme trouvé, contacter le sur ${foundAnnoce.foundBy.phoneNumber}`,
      },
      data: {
        annonce: foundAnnoce._id,
        founderNumber: foundAnnoce.foundBy.phoneNumber,
      },
      token: tokenDevice,
    });
  } catch (error) {}
};
// Exportation de la fonction pour la rendre disponible pour d'autres fichiers
module.exports = { createNewAnnonce, getAllAnnonce, createNewAnnonceFromItem,markAnnonceAsFound };
