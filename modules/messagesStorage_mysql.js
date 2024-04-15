// messageStorage.js
const mysql = require('mysql');

// Retrieve MySQL connection credentials from environment variables
const dbConfig = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME
};

// Create a MySQL connection using the credentials from environment variables
const connection = mysql.createConnection(dbConfig);

async function storeMessage(receiverUsername, senderUsername, encryptedMessage, callback) {
    const query = `
        INSERT INTO messages (receiver_username, sender_username, encrypted_message)
        VALUES (?, ?, ?)
    `;

    connection.query(query, [receiverUsername, senderUsername, encryptedMessage], function(error, results, fields) {
        if (error) return callback(error);
        callback(null, results.insertId); // Return the ID of the inserted message
    });
}

async function retrieveMessages(username, callback) {
    const query = `
        SELECT * FROM messages 
        WHERE receiver_username = ?
        ORDER BY timestamp DESC
    `;

    connection.query(query, [username], function(error, results, fields) {
        if (error) return callback(error);
        callback(null, results); // Returns an array of messages
    });
}

module.exports = {
    storeMessage,
    retrieveMessages
};