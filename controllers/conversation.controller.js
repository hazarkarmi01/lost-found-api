const ConversationModel = require("../models/Conversations.model");
const pusher = require('../utils/pusher.sender');
// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { participants } = req.body;
        const conversation = await ConversationModel.findOne({
            participants: { $all: participants },
        });
        if (conversation) {
            return res.status(200).json(conversation);
        } else {
            const newConversation = new ConversationModel({ participants });
            const savedConversation = await newConversation.save();
            return res.status(201).json(savedConversation);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create conversation" });
    }
};

// // Get all conversations for a user
// const getConversationsForUser = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const conversations = await ConversationModel.find({
//             participants: userId,
//         }).populate("participants", "-password");
//         return res.status(200).json(conversations);
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Failed to get conversations" });
//     }
// };

// // Get a conversation by ID
// const getConversationById = async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const conversation = await ConversationModel.findById(
//             conversationId
//         ).populate("participants", "-password");
//         return res.status(200).json(conversation);
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Failed to get conversation" });
//     }
// };
const getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await ConversationModel.findById(conversationId);
        const sortedMessages = conversation.messages.sort(
            (a, b) => a.createdAt - b.createdAt
        );
        const conversationWithParticipants = await ConversationModel.populate(
            conversation,
            { path: "participants", select: "-password" }
        );
        conversationWithParticipants.messages = sortedMessages;
        return res.status(200).json(conversationWithParticipants);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to get conversation" });
    }
};

const getConversationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await ConversationModel.find({
            participants: userId,
        })
            .populate("participants", "-password")
            .exec();
        const conversationsWithSortedMessages = conversations.map((conversation) => {
            const sortedMessages = conversation.messages.sort(
                (a, b) => a.createdAt - b.createdAt
            );
            conversation.messages = sortedMessages;
            return conversation;
        });
        return res.status(200).json(conversationsWithSortedMessages);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to get conversations" });
    }
};
// Add a message to a conversation
const addMessageToConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { sender, content } = req.body;
        const updatedConversation = await ConversationModel.findByIdAndUpdate(
            conversationId,
            { $push: { messages: { sender, content } } },
            { new: true }
        );
        pusher.trigger(conversationId, "new-message", {
            message: updatedConversation
        });
        return res.status(200).json(updatedConversation);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to add message" });
    }
};

// Delete a conversation by ID
const deleteConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const deletedConversation = await ConversationModel.findByIdAndUpdate(
            conversationId,
            { isDeleted: true }
        );
        return res.status(200).json(deletedConversation);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete conversation" });
    }
};

module.exports = {
    createConversation,
    getConversationsForUser,
    getConversationById,
    addMessageToConversation,
    deleteConversationById,
};
