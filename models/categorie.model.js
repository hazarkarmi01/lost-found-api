const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    subCategories: [subCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = {
  Category,
  SubCategory,
};
