// userManagement.js

const crypto = require('crypto');
const fs = require('fs').promises;

const { deriveKey, deriveHash, encrypt, decrypt, generateKeyPair } = require('./mycrypt');

require('dotenv').config();

async function loadJsonFile(jsonFilePath) {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // No users file found, return empty object
    }
    throw error;
  }
}

async function saveJsonFile(jsonFilePath, users) {
  const data = JSON.stringify(users, null, 2);
  await fs.writeFile(jsonFilePath, data, 'utf8');
}

var registered_users = null; 
var registered_users_binaries = null;

// Exported functions

async function registeredUserLoaded() {
  if (registered_users === null) {
    registered_users = await loadJsonFile(process.env.USERS_FILE);
  }
  if (registered_users_binaries === null) {
    registered_users_binaries = await loadJsonFile(process.env.BINARIES_FILE);
  }

  return ! (registered_users === null);
}

async function saveUsers() {
  await saveJsonFile(process.env.USERS_FILE, registered_users);
  await saveJsonFile(process.env.BINARIES_FILE, registered_users_binaries);
}

function findUser(email) {
  email = email.toLowerCase().trim();
  const user = (registered_users[email]) ? { 
                 ...registered_users[email],
                 ...registered_users_binaries[email]
              } : null;

  return user;
}

function userExists(email) {
  const user = findUser(email);

  if (user) {
    return true;
  }
  return false;
}


async function registerUser(email, password) {
  await registeredUserLoaded();

  if (userExists(email)) {
    throw new Error('User already exists');
  }

  const salt = crypto.randomBytes(16).toString('hex');

  // Use myCrypt.deriveHash for password hashing
  const hash = await deriveHash(password, salt);

  const { publicKey, privateKey } = await generateKeyPair(password);

  registered_users[email] = {
    hash: hash.toString('hex')
  };

  registered_users_binaries[email] = {
    salt,
    publicKey,
    privateKey
  };

  await saveUsers();

  return { email };
}

async function authenticateUser(email, password) {
  await registeredUserLoaded();

  const user = findUser(email);

  if (!user) {
    console.error(`User '${email}' does not exist`);
    throw new Error('User does not exist');
  }

  const { hash, salt } = user;

  // Check the password against the saved hash.
  const inputHash = await deriveHash(password, salt);

  return inputHash.toString('hex') === hash;
}

async function getUserPublicKey (email) {
  await registeredUserLoaded();

  const user = findUser(email);

  if (!user) {
    throw new Error('User does not exist');
  }

  const { publicKey } = user;
  return publicKey;
}

async function getUserPrivateKey(email) {
  await registeredUserLoaded();

  const user = findUser(email);

  if (!user) {
    throw new Error('User does not exist');
  }

  const { privateKey } = user;
  return privateKey;
}

module.exports = { registerUser, authenticateUser, getUserPublicKey, getUserPrivateKey, userExists };