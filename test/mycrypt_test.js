const { deriveKey, encrypt, decrypt } = require('./mycrypt');
const password = 'mySecretPassword';
const salt = crypto.randomBytes(16); // Ideally save this salt for future use

async function main() {
  try {
    // Derive key from password
    const derivedKey = await deriveKey(password, salt);
    
    // Encrypt plaintext
    const plaintext = 'Hello, World!';
    const encrypted = await encrypt(plaintext, derivedKey);
    console.log(`Encrypted text: ${encrypted}`);
    
    // Decrypt ciphertext
    const decrypted = await decrypt(encrypted, derivedKey);
    console.log(`Decrypted text: ${decrypted}`);
  } catch (error) {
    console.error(error);
  }
}

main();