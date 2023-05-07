const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");

// Create a new conversation
router.post("/", conversationController.createConversation);

// Get all conversations for a user
router.get("/:userId", conversationController.getConversationsForUser);

// Get a conversation by ID
router.get("/conv/:conversationId", conversationController.getConversationById);

// Add a message to a conversation
router.post("/:conversationId/messages", conversationController.addMessageToConversation);

// Delete a conversation by ID
router.delete("/:conversationId", conversationController.deleteConversationById);

module.exports = router;