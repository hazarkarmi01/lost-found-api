const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    let users = [];
    const result = await User.find({ isDeleted: false }); // select * from users ;
    users = result;
    res.json({ result: users, success: true });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

const setDeviceId = async (req, res) => {
  try {
    let user = req.user;
    let { deviceId } = req.body;
    const result = await User.findByIdAndUpdate(
      user,
      { deviceId: deviceId },
      { new: true }
    );
    res.json({ result: result, success: true });
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
};

const createNewUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      email,
      password,
      phoneNumber,
      isAdmin,
    } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      address: address,
      phoneNumber: phoneNumber,
      password: hashPass,
      role: isAdmin ? "ADMIN" : "USER",
      deviceId: "",
    });
    const result = await newUser.save();
    res.json({ success: true, message: "user created succefully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.json({ success: false, message: "wrong email or password" });
    } else {
      const verif = await bcrypt.compare(password, user.password);
      if (!verif) {
        res.json({ success: false, message: "wrong email or password" });
      } else {
        const token = jwt.sign({ user: user._id }, "MYSECRET");
        res.json({
          success: true,
          userId: user._id,
          token: token,
          user: user,
        });
      }
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    let user = req.user;

    const dataToUpdate = { ...req.body };
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { ...dataToUpdate },
      { new: true }
    );
    res.json({
      success: true,
      message: "user updated sucessfully",
      updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    let user = req.params.user;

    const dataToUpdate = { ...req.body };
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { ...dataToUpdate },
      { new: true }
    );
    res.json({
      success: true,
      message: "user updated sucessfully",
      updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await User.findByIdAndUpdate(userId, {
      isDeleted: true,
    });
    res.json({ success: true, result: result });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const userController = {
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  signInUser: signInUser,
  updateUserProfile: updateUserProfile,
  updateUser: updateUser,
  deleteUser: deleteUser,
  setDeviceId,
};
//testing git
module.exports = userController;
