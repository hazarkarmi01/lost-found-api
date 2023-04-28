const CatgeoryController = require("../controllers/category.controller");
const express = require("express");
const verifToken = require("../utils/verifToken");
const verifAdmin = require("../utils/verifAdmin");
const router = express.Router();

router.post(
  "/create",
  verifToken,
  verifAdmin,
  CatgeoryController.createNewCategory
);
router.get("/", verifToken, CatgeoryController.getAllCategories);
router.post(
  "/sub/create",
  verifToken,
  verifAdmin,
  CatgeoryController.createSubCategory
);
router.get("/sub", verifToken, CatgeoryController.getAllSubCategories);
router.delete(
  "/sub/:categId",
  verifToken,
  verifAdmin,
  CatgeoryController.deleteSubCategory
);
router.delete(
  "/:categId",
  verifToken,
  verifAdmin,
  CatgeoryController.deleteCategory
);
router.get(
  "/:categId",
  verifToken,
  verifAdmin,
  CatgeoryController.getCategoryById
);

module.exports = router;
