const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifAdmin = require("../utils/verifAdmin");
const verifToken = require("../utils/verifToken");

router.get("/", verifToken, verifAdmin, userController.getAllUsers);
router.put("/update", verifToken, userController.updateUserProfile);
router.put("/admin/update", verifToken, verifAdmin, userController.updateUser);
router.post("/create", userController.createNewUser);
router.post("/login", userController.signInUser);

module.exports = router;
