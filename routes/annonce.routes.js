const express = require("express");
const annonceController = require("../controllers/annonce.controller");
const multer = require("multer");
const verifToken = require("../utils/verifToken");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dnozudt2x",
  api_key: "956142484736458",
  api_secret: "Y7w8mstqLX4B-KScPuuPVotkKd0",
});
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => file.originalname.split(".").pop(), // set the desired image format
    public_id: (req, file) => {
      const nameWithoutExtension = file.originalname
        .split(".")
        .slice(0, -1)
        .join(".");
      const sanitizedFilename = nameWithoutExtension.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      return `${Date.now()}-${sanitizedFilename}`;
    }, //
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  verifToken,
  upload.array("photos"),
  annonceController.createNewAnnonce
);
router.get("/", verifToken, annonceController.getAllAnnonce);
router.post(
  "/create/item/",
  verifToken,
  annonceController.createNewAnnonceFromItem
);
router.put(
  "/found/:annonceId",
  verifToken,
  annonceController.markAnnonceAsFound
);
module.exports = router;
