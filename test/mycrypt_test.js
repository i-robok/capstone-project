
const { deriveKey, 
  encrypt, 
  decrypt, 
  generateKeyPair, 
  encryptWithPublicKey,
  decryptWithPrivateKey } = require('../modules/mycrypt');

const crypto = require('crypto');

const password = 'mySecretPassword';
const salt = crypto.randomBytes(16); 

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

    const passphrase = 'my-passphrase';
    const { publicKey, privateKey } = await generateKeyPair(passphrase);
    console.log(publicKey);
    console.log(privateKey);
    
    const encryptedMessage = encryptWithPublicKey(publicKey, 'Secret Message');
    console.log(encryptedMessage);
    
    // If your private key is not encrypted with a passphrase, just omit the third argument.
    const decryptedMessage = decryptWithPrivateKey(privateKey, encryptedMessage, passphrase);
    console.log(decryptedMessage);
    

  } catch (error) {
    console.error(error);
  }
}

main();