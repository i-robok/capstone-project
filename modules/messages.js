const crypto = require('crypto');
const messageStorage = require('./messagesStorage'); // module for storing/retrieving messages

const UserManagement = require('./userManagement');
const userManager = new UserManagement('users.json');

// Encrypt a message with the recipient's public key
function encryptMessage(message, receiverPublicKey) {
    const bufferMessage = Buffer.from(message, 'utf-8');
    const encryptedMessage = crypto.publicEncrypt(receiverPublicKey, bufferMessage);
    return encryptedMessage.toString('base64');
}

// Decrypt a message with the recipient's private key
function decryptMessage(encryptedMessage, receiverPrivateKey) {
    const bufferEncryptedMessage = Buffer.from(encryptedMessage, 'base64');
    const decryptedMessage = crypto.privateDecrypt({
        key: receiverPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, bufferEncryptedMessage);
    return decryptedMessage.toString('utf-8');
}

// Send message to a recipient
async function sendMessage(senderUsername, receiverUsername, message) {
    try {
        const receiverPublicKey = await userManager.getUserPublicKey(receiverUsername);
        const encryptedMessage = encryptMessage(message, receiverPublicKey);

        messageStorage.storeMessage(receiverUsername, senderUsername, encryptedMessage);
    } catch (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }
}

// Retrieve messages for a specific user and decrypt them
async function retrieveMessages(username, password) {
    try {
        const receiverPrivateKey = await userManager.getUserPrivateKey(username, password);
        const encryptedMessages = await messageStorage.retrieveMessages(username);

        return encryptedMessages.map((msg) => ({
            sender: msg.sender,
            message: decryptMessage(msg.encryptedMessage, receiverPrivateKey)
        }));
    } catch (error) {
        throw new Error(`Failed to retrieve messages: ${error.message}`);
    }
}

module.exports = {
    sendMessage,
    retrieveMessages,
};