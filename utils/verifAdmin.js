const User = require("../models/user.model");
const verifAdmin = async (req, res, next) => {
  const userId = req.user;
  const user = await User.findById(userId);
  if (user) {
    if (user.role == "ADMIN") {
      next();
    } else {
      res.json({ success: false, message: "Not Admin !" });
    }
  } else {
    res.json({ success: false, message: "Not Admin !" });
  }
};

module.exports = verifAdmin;
