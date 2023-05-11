const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifAdmin = require("../utils/verifAdmin");
const verifToken = require("../utils/verifToken");

router.get("/", verifToken, verifAdmin, userController.getAllUsers);
router.put("/update/profile", verifToken, userController.updateUserProfile);
router.put("/admin/update/:user", verifToken, verifAdmin, userController.updateUser);
router.post("/create", userController.createNewUser);
router.post("/login", userController.signInUser);
router.post("/deviceId",verifToken,userController.setDeviceId); 

router.delete(
  "/delete/:userId",
  verifToken,
  verifAdmin,
  userController.deleteUser
);
module.exports = router;
