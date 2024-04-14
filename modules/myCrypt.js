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

module.exports = {
  deriveKey,
  deriveHash,
  encrypt,
  decrypt,
};