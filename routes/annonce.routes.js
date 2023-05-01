const express = require("express");
const annonceController = require("../controllers/annonce.controller");
const multer = require("multer");
const verifToken = require("../utils/verifToken");
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  verifToken,
  upload.array("photos"),
  annonceController.createNewAnnonce
);
router.get("/", verifToken, annonceController.getAllAnnonce);
module.exports = router;
