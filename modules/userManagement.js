// userManagement.js

const crypto = require('crypto');
const fs = require('fs').promises;

const { deriveKey, deriveHash, encrypt, decrypt, generateKeyPair } = require('./mycrypt');

require('dotenv').config();

async function loadUsers(usersFilePath) {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // No users file found, return empty object
    }
    throw error;
  }
}

// Load registered users from file her to avoid re-loading the info on each request.
var registered_users = {}; 

// Use an IIFE (Immediately Invoked Function Expression) to allow initialization on startup.
(async () => {
    try {
        registered_users = await loadUsers(process.env.USERS_FILE);
        // Proceed with registered_users
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();

// Exported functions

async function saveUsers(users) {
  const data = JSON.stringify(users, null, 2);
  await fs.writeFile(process.env.USERS_FILE, data, 'utf8');
}

async function registerUser(email, password) {

  if (registered_users[email]) {
    throw new Error('User already exists');
  }

  const salt = crypto.randomBytes(16).toString('hex');

  // Use myCrypt.deriveHash for password hashing
  const hash = await deriveHash(password, salt);

  const { publicKey, privateKey } = await generateKeyPair(password);

  registered_users[email] = {
    hash: hash.toString('hex'),
    salt,
    publicKey,
    privateKey: privateKey
  };

  await saveUsers(registered_users);

  return { email };
}

async function authenticateUser(email, password) {
  const user = registered_users[email];

  if (!user) {
    throw new Error('User does not exist');
  }

  const { hash, salt } = user;

  // Check the password against the saved hash.
  const inputHash = await deriveHash(password, salt);

  return inputHash.toString('hex') === hash;
}

async function getUserPublicKey (email) {
  const user = registered_users[email];

  if (!user) {
    throw new Error('User does not exist');
  }

  const { publicKey } = user;

  return publicKey;
}

async function getUserPrivateKey(email) {
  const user = registered_users[email];

  if (!user) {
    throw new Error('User does not exist');
  }

  const { privateKey } = user;

  return privateKey ;
}

async function userExists(email) {
  const user = registered_users[email];

  if (!user) {
    return false;
  }

  return true;
}

module.exports = { registerUser, authenticateUser, getUserPublicKey, getUserPrivateKey, userExists };