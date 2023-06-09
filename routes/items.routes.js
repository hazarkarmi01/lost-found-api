const {
  createItem,
  deleteItem,
  updateItem,
  getAllItems,
  getItemById
} = require("../controllers/item.controller");
const verifToken = require("../utils/verifToken");
const router = require("express").Router();
const multer = require("multer");
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

router.post("/create", verifToken, upload.any("photos"), createItem);
router.get("/", verifToken, getAllItems);
router.put("/update", verifToken, updateItem);
router.delete("/:id", verifToken, deleteItem);

module.exports = router;
