
const { storeMessage, retrieveMessages } = require('./messagesStorage');
const { getUserPublicKey, getUserPrivateKey } = require('./userManagement');
const { encryptWithPublicKey, decryptWithPrivateKey } = require('./mycrypt');

// Send message to a recipient
async function sendMessage(senderUsername, receiverUsername, message) {
    try {
        console.log(`Sending message to ${receiverUsername}: ${message}`);

        const receiverPublicKey = await getUserPublicKey(receiverUsername);
        console.log(`Receiver user ${receiverUsername} public key: ${receiverPublicKey}`);
        const encryptedMessage = encryptWithPublicKey(receiverPublicKey, message);
        console.log(`Encrypted message: ${JSON.stringify(encryptedMessage)}`);

        await storeMessage(receiverUsername, senderUsername, encryptedMessage);
    } catch (error) {
        console.error(`ERROR in sendMessage: ${error}`);
        console.error(error.stack);
        throw new Error(`Failed to send message: ${error}`);
    }
}

// Retrieve messages for a specific user and decrypt them
async function retrieveUserMessages(username, password) {
    try {
        const receiverPrivateKey = await getUserPrivateKey(username);
        console.log(`Receiver public key: ${receiverPrivateKey}`);
        const encryptedMessages = await retrieveMessages(username);
        console.log(`Encrypted messages: ${JSON.stringify(encryptedMessages)}`);

        return encryptedMessages.map((msg) => ({
            id: msg.id,
            sender: msg.sender_username,
            message: decryptWithPrivateKey(receiverPrivateKey, msg.encrypted_message, password),
            timestamp: msg.timestamp
        }));
    } catch (error) {
        console.error(`ERROR in retrieveUserMessages: ${error}`);
        console.error(error.stack);
        return [];
        // throw new Error('Failed to retrieve messages');
    }
}

module.exports = {
    sendMessage,
    retrieveUserMessages,
};