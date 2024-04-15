const fs = require('fs').promises;

require('dotenv').config();
const path = require('path');

// Define the path to the JSON file where messages will be stored.
const MESSAGE_FILE_PATH = process.env.MESSAGES_FILE;

// Helper function to read messages from the JSON file.
async function readMessagesFile() {
    try {
        const data = await fs.readFile(MESSAGE_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file does not exist, return an empty array.
            return [];
        } else {
            console.error(`Error reading file ${MESSAGE_FILE_PATH}: ${error}`);
            throw error;
        }
    }
}

// Helper function to write messages to the JSON file.
async function writeMessagesFile(messages) {
    await fs.writeFile(MESSAGE_FILE_PATH, JSON.stringify(messages, null, 2), 'utf8');
}

async function storeMessage(receiverUsername, senderUsername, encryptedMessage) {
    // Read the current list of messages from the JSON file.
    const messages = await readMessagesFile();

    // Create a new message object with a generated ID and current timestamp.
    const newMessage = {
        id: messages.length + 1,
        receiver_username: receiverUsername,
        sender_username: senderUsername,
        encrypted_message: encryptedMessage,
        timestamp: new Date().toISOString()
    };

    // Add the new message to the messages array.
    messages.push(newMessage);

    // Write the updated messages back to the JSON file.
    await writeMessagesFile(messages);

    // Return the ID of the inserted message.
    return newMessage.id;
}

async function retrieveMessages(username) {
    // Read the current list of messages from the JSON file.
    const messages = await readMessagesFile();

    // Filter messages for those received by the specified username and sort them by timestamp.
    const userMessages = messages
        .filter(message => message.receiver_username === username)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Returns an array of messages for the user.
    return userMessages;
}

module.exports = {
    storeMessage,
    retrieveMessages
};