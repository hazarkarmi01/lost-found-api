const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifToken = require("../utils/verifToken");

router.get("/", verifToken, userController.getAllUsers);
router.post("/create", userController.createNewUser);
router.post("/login", userController.signInUser);

module.exports = router;
