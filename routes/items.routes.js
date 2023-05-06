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

router.post("/create", verifToken, upload.any("photos"), createItem);
router.get("/", verifToken, getAllItems);
router.put("/update", verifToken, updateItem);
router.delete("/:id", verifToken, deleteItem);

module.exports = router;
