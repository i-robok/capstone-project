// mycrypt.js
// My convenience functions to manage crypt/decrypt operations.

const crypto = require('crypto');

// Asynchronous derivedKey function
async function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

// Asynchronous deriveHash function
async function deriveHash(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

// Encrypts the given plaintext using the derived key
async function encrypt(plaintext, derivedKey) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted; // Return IV with ciphertext for later decryption
}

// Decrypts the given ciphertext using the derived key
async function decrypt(ciphertext, derivedKey) {
  const components = ciphertext.split(':');
  const iv = Buffer.from(components.shift(), 'hex');
  const encryptedText = components.join(':');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// RSA convenience functions.

const generateKeyPair = (passphrase) => {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair('rsa', {
      modulusLength: 2048,  // the length of your key in bits
      publicKeyEncoding: {
        type: 'spki',       // recommended to be 'spki' by the Node.js docs
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',      // recommended to be 'pkcs8' by the Node.js docs
        format: 'pem',
        cipher: 'aes-256-cbc',   // encryption for the private key
        passphrase: passphrase   // passphrase for the encrypted private key
      }
    }, (err, publicKey, privateKey) => {
      if (err) {
        reject(err);
      } else {
        resolve({ publicKey, privateKey });
      }
    });
  });
};


const encryptWithPublicKey = (publicKey, message) => {
  const bufferMessage = Buffer.from(message, 'utf8');
  const maxDataSize = 180;

  if (bufferMessage.length > maxDataSize) {
    throw new Error(`Message is too long (${bufferMessage.length} bytes), max length is ${maxDataSize} bytes.`);
  }

  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    bufferMessage
  ).toString('base64');
};

const decryptWithPrivateKey = (privateKey, encryptedMessage, passphrase='') => {
  const bufferEncryptedMessage = Buffer.from(encryptedMessage, 'base64');
  try {
    const decryptedMessage = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: passphrase,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      bufferEncryptedMessage
    );

    return decryptedMessage.toString('utf8');
  } catch (error) {
    console.error(`Decryption failed: ${privateKey}-${passphrase}`);
    console.error('Decryption failed:', error);
    console.error('Encrypted message:', encryptedMessage);
    console.error(error.stack);
    // throw error;
    return null;
  }
};

module.exports = {
  deriveKey,
  deriveHash,
  encrypt,
  decrypt,
  generateKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey
};