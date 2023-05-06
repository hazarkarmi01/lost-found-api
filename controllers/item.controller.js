const Item = require("../models/userItem.model");

// Create a new item
const createItem = async (req, res) => {
  try {
    const files = req.files;
    const { name, description } = req.body;

    if (files) {
      const photoPath = files.map((elm) => elm.path);
      const item = new Item({
        name,
        description,
        owner: req.user,
        photos: photoPath
      });
      await item.save();
      res.status(201).json({ message: "Item created successfully", item });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating item", error: err.message });
  }
};

// Retrieve all items
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false, owner: req.user });
    res.status(200).json(items);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error retrieving items", error: err.message });
  }
};

// Retrieve a single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error retrieving item", error: err.message });
  }
};

// Update an existing item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    Object.keys(req.body).forEach((key) => {
      item[key] = req.body[key];
    });
    await item.save();
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating item", error: err.message });
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.isDeleted = true;
    await item.save();
    res.status(200).json({ message: "Item deleted successfully", item });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error deleting item", error: err.message });
  }
};

module.exports = {
  createItem,
  deleteItem,
  updateItem,
  getAllItems,
  getItemById
};
