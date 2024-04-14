CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_username VARCHAR(255) NOT NULL,
    sender_username VARCHAR(255) NOT NULL,
    encrypted_message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);