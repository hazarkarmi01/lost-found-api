const jwt = require("jsonwebtoken");

const verifToken = (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    if (!token) {
      res.json({ success: false, message: "No Token provided" });
    } else {
      const verif = jwt.verify(token, "MYSECRET");
      if (!verif) {
        res.json({ success: false, message: "Invalid token provided" });
      } else {
        const decoded = jwt.decode(token);
        console.log("decoded", decoded);
        const userId = decoded["user"];
        req.user = userId;
        next();
      }
    }
  } catch (error) {
    res.json({ success: false, message: "Invalid token provided" });
  }
};

module.exports = verifToken;
