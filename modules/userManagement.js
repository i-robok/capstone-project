// userManagement.js

const crypto = require('crypto');
const fs = require('fs').promises;

const { deriveKey, deriveHash } = require('./mycrypt');
import * as encrypt from 'mongoose-encryption';


class UserManagement {
  constructor(usersFile) {
    this.usersFilePath = usersFile;
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {}; // No users file found, return empty object
      }
      throw error;
    }
  }

  async saveUsers(users) {
    const data = JSON.stringify(users, null, 2);
    await fs.writeFile(this.usersFilePath, data, 'utf8');
  }

  async register(email, password) {
    const users = await this.loadUsers();

    if (users[email]) {
      throw new Error('User already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');

    // Use myCrypt.deriveHash for password hashing
    const hash = await deriveHash(password, salt);

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Standard RSA key size
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Use myCrypt.deriveKey for get a derivedKey to crypt private key
    const derivedKey = await deriveKey(password, salt);

    // Use myCrypt.encrypt for private key encryption
    const encryptedPrivateKey = await encrypt(privateKey, derivedKey);

    users[email] = {
      hash: hash.toString('hex'),
      salt,
      publicKey,
      privateKey: encryptedPrivateKey
    };

    await this.saveUsers(users);

    return { email };
  }

  async authenticate(email, password) {
    const users = await this.loadUsers();
    const user = users[email];

    if (!user) {
      throw new Error('User does not exist');
    }

    const { hash, salt } = user;

    // Check the password against the saved hash.
    const inputHash = await deriveHash(password, salt);

    return inputHash.toString('hex') === hash;
  }

  async getUserPublicKey(email) {
    const users = await this.loadUsers();
    const user = users[email];

    if (!user) {
      throw new Error('User does not exist');
    }

    const { publicKey } = user;

    return { publicKey };
  }

  async getUserPrivateKey(email, password) {
    const users = await this.loadUsers();
    const user = users[email];

    if (!user) {
      throw new Error('User does not exist');
    }

    const { encryptedPrivateKey } = user;

    // Use myCrypt.deriveKey for get the derivedKey used to crypt private key
    const derivedKey = await deriveKey(password, salt);

    const { privateKey } = await encrypt(encryptedPrivateKey, passderivedKeyword);

    return { privateKey };
  }
}

module.exports = UserManagement;