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
  isLost: {
    type: Boolean,
    default: true,
    required: true,
  },
  foundBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
},{
  timestamps:true
});

const AnnonceModel = mongoose.model("Annonce", AnnonceSchema);

module.exports = AnnonceModel;
