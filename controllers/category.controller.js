const { Category, SubCategory } = require("../models/categorie.model");

const createNewCategory = async (req, res) => {
  try {
    let { name } = req.body;
    const newCateg = new Category({ name });
    const result = await newCateg.save();
    res.json({ success: true, result: result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const result = await Category.find({ isArchived: false });
    res.json({ success: true, result: result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    let { categId } = req.params;
    let result = await Category.findByIdAndUpdate(
      categId,
      {
        isArchived: true,
      },
      { new: true }
    );
    res.json({ success: true, result: "Category deleted successfuly" });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};

const createSubCategory = async (req, res) => {
  try {
    let { name, parentCategory } = req.body;
    const newSubcCateg = new SubCategory({
      name,
      parentCategory,
    });
    const result = await newSubcCateg.save();
    console.log("result", result);
    const parentCateg = await Category.findById(parentCategory);
    parentCateg.subCategories.push(result);
    await parentCateg.save();
    res.json({ success: true, result: result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
const deleteSubCategory = async (req, res) => {
  try {
    let { categId } = req.params;
    let result = await SubCategory.findByIdAndUpdate(
      categId,
      {
        isArchived: true,
      },
      { new: true }
    );
    res.json({ success: true, result: "Sub Category deleted successfuly" });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
const getAllSubCategories = async (req, res) => {
  try {
    let result = await SubCategory.find().populate("parentCategory");
    res.json({ success: true, result: result });
  } catch (error) {
    res.json({ success: false, result: error.message });
  }
};
module.exports = {
  deleteCategory,
  getAllCategories,
  createNewCategory,
  createSubCategory,
  getAllSubCategories,
  deleteSubCategory,
};
