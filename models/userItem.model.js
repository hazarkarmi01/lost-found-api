const mongoose = require("mongoose");
const ItemSchema = mongoose.Schema(
  {
    name: {
      type: String
    },
    description: {
      type: String
    },
    photos: [],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
