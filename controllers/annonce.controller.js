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

// async function compareImages(imageUrl1, imageUrl2, visionClient) {
//   const response1 = await visionClient.imageProperties(imageUrl1);

//   const response2 = await visionClient.imageProperties(imageUrl2);
//   const dominantColors1 =
//     response1[0].imagePropertiesAnnotation.dominantColors.colors
//       .slice(0, 3)
//       .map((color) => color.color.red + color.color.green + color.color.blue);
//   const dominantColors2 =
//     response2[0].imagePropertiesAnnotation.dominantColors.colors
//       .slice(0, 3)
//       .map((color) => color.color.red + color.color.green + color.color.blue);
//   const similarityScore = calculateColorSimilarity(
//     dominantColors1,
//     dominantColors2
//   );
//   return similarityScore;
// }

// function calculateColorSimilarity(colors1, colors2) {
//   const sum = colors1.reduce((acc, color, index) => {
//     const difference = Math.abs(color - colors2[index]);
//     return acc + difference;
//   }, 0);
//   const similarityScore = Math.max((1 - sum / (255 * 3)) * 100, 0);
//   return similarityScore;
// }
const compareImages = async (imageUrl1, imageUrl2, visionClient) => {
  const response1 = await visionClient.objectLocalization(imageUrl1);
  const response2 = await visionClient.objectLocalization(imageUrl2);
  
  const objects1 = response1[0].localizedObjectAnnotations.map((obj) => obj.name);
  const objects2 = response2[0].localizedObjectAnnotations.map((obj) => obj.name);
  
  const similarityScore = calculateObjectSimilarity(objects1, objects2);
  return similarityScore;
};

const calculateObjectSimilarity = (objects1, objects2) => {
  const intersection = objects1.filter((obj) => objects2.includes(obj));
  const union = [...new Set([...objects1, ...objects2])];
  
  const similarityScore = (intersection.length / union.length) * 100;
  return similarityScore;
};

const createNewAnnonce = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, category, subCategory, isLost } = req.body;

    const files = req.files;
    if (!files) {
      res.json({ success: false, result: "No files uploaded" });
      return;
    }

    const photoPaths = files.map((elm) => elm.path);
    const itemIsLost = isLost === "true";

    let allAnnonces = await Annonce.find({ isLost: !itemIsLost, isArchived: false })
      .populate("createdBy")
      .populate("category")
      .populate("subCategory");

    const visionClient = client;

    const similarityScores = await Promise.all(
      allAnnonces.map(async (annonce) => {
        const annoncePhotoPaths = annonce.photos;

        const similarityScoresForAnnouncement = await Promise.all(
          photoPaths.map(async (photoPath) => {
            const similarityScoresForImage = await Promise.all(
              annoncePhotoPaths.map(async (announcementPhoto) => {
                const similarityScore = await compareImages(photoPath, announcementPhoto, visionClient);
                return similarityScore;
              })
            );
            const averageSimilarityScore =
              similarityScoresForImage.reduce((acc, score) => acc + score, 0) / similarityScoresForImage.length;
            return averageSimilarityScore;
          })
        );

        return similarityScoresForAnnouncement;
      })
    );

    const similarAnnonces = allAnnonces.filter((annonce, annonceIndex) => {
      const similarityScoresForAnnouncement = similarityScores[annonceIndex];

      if (similarityScoresForAnnouncement && similarityScoresForAnnouncement.length > 0) {
        const averageSimilarityScore =
          similarityScoresForAnnouncement.reduce((acc, score) => acc + score, 0) / similarityScoresForAnnouncement.length;
        console.log("AVERAGE", averageSimilarityScore)
        if (!isNaN(averageSimilarityScore) && averageSimilarityScore >= SIMILARITY_THRESHOLD) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });

    if (similarAnnonces.length > 0) {
      res.json({
        success: true,
        hasSimilar: true,
        result: similarAnnonces,
        isLost: itemIsLost,
      });
    } else {
      const newAnnonce = new Annonce({
        title,
        description,
        category,
        subCategory,
        createdBy: user,
        photos: photoPaths,
        isLost: itemIsLost,
      });
      const result = await newAnnonce.save();
      res.json({ success: true, result, hasSimilar: false });
    }
  } catch (error) {
    console.log("Error", error);
    res.json({ success: false, result: error.message });
  }
};

const createNewAnnonceForced = async (req, res) => {
  try {
    let user = req.user;
    let { title, description, category, subCategory, isLost } = req.body;

    const files = req.files;
    if (files) {
      const photoPath = files.map((elm) => elm.path);
      const newAnnonce = new Annonce({
        title,
        description,
        category,
        subCategory,
        createdBy: user,
        photos: photoPath,
        isLost,
      });
      const result = await newAnnonce.save();
      res.json({ success: true, result, hasSimilair: false });
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
    const result = await Annonce.find({
      isArchived: false,
    })
      .populate("createdBy")
      .populate("category")
      .populate("subCategory");
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};

const getAllAnnonceByUser = async (req, res) => {
  try {
    const result = await Annonce.find({
      isArchived: false,
      createdBy: req.user,
    })
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
      isLost: true,
    });
    const result = await newAnnonce.save();
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
    const foundAnnoce = await Annonce.findById(annonce._id)
      .populate("foundBy")
      .populate("createdBy");
    let result = await message.send({
      notification: {
        title: "Element Trouvé",
        body: `${foundAnnoce.foundBy.firstName} ${foundAnnoce.foundBy.lastName} à marquer votre element comme trouvé, contacter le sur ${foundAnnoce.foundBy.phoneNumber}`,
      },
      data: {
        annonce: foundAnnoce._id.toString(),
        founderNumber: foundAnnoce.foundBy.phoneNumber.toString(),
      },
      token: foundAnnoce.createdBy.deviceId,
    });
    res.json({ success: true, result });
  } catch (error) {
    console.log("Error", error);
    res.json({ success: false, result: error.message });
  }
};
const deleteAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const annonce = await Annonce.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    );
    res.json({ success: true, annonce });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
const updateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;
    const annonce = await Annonce.findByIdAndUpdate(
      id,
      { ...dataToUpdate },
      { new: true }
    );
    res.json({ success: true, annonce });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
// Exportation de la fonction pour la rendre disponible pour d'autres fichiers
module.exports = {
  createNewAnnonce,
  getAllAnnonce,
  createNewAnnonceFromItem,
  markAnnonceAsFound,
  deleteAnnonce,
  getAllAnnonceByUser,
  updateAnnonce,
  createNewAnnonceForced,
};
