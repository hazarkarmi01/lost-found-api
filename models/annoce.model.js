const mongoose = require("mongoose");

const AnnonceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photos: { type: [], default: [] },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
});

const AnnonceModel = mongoose.model("Annonce", AnnonceSchema);

module.exports = AnnonceModel;
