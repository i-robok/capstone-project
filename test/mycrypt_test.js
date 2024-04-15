
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
    var plaintext = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu feugiat mauris, sit amet vestibulum turpis. Aenean sollicitudin lobortis nunc, id dictum ante molestie eget. Fusce congue sem in tortor efficitur ultricies. Aenean suscipit nisi felis, quis suscipit dolor sagittis in. Sed iaculis a justo vel vestibulum. In lacinia sit amet felis eu dapibus. In ultrices finibus malesuada. Maecenas bibendum ultrices suscipit. Duis rhoncus justo ac lacus viverra, molestie suscipit nisl condimentum. Etiam laoreet ornare lectus vitae fermentum. Nunc nisl augue, molestie maximus dapibus eu, laoreet commodo velit. Maecenas lacinia elit eu nunc viverra luctus. In bibendum nisi luctus risus consectetur vehicula quis a sapien. Donec rutrum gravida mauris sit amet blandit.';
    const encrypted = await encrypt(plaintext, derivedKey);
    console.log(`Encrypted text: ${encrypted}`);
    
    // Decrypt ciphertext
    const decrypted = await decrypt(encrypted, derivedKey);
    console.log(`Decrypted text: ${decrypted}`);

    // RAS testing
    // Limit size to 180.
    plaintext = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu feugiat mauris, sit amet vestibulum turpis. Aenean sollicitudin lobortis nunc, id dictum ante molestie eget.';

    const passphrase = 'my-passphrase';
    const { publicKey, privateKey } = await generateKeyPair(passphrase);
    console.log(publicKey);
    console.log(privateKey);
    
    const encryptedMessage = encryptWithPublicKey(publicKey, plaintext);
    console.log(encryptedMessage);
    
    const decryptedMessage = decryptWithPrivateKey(privateKey, encryptedMessage, passphrase);
    console.log(decryptedMessage);

    if (decryptedMessage === plaintext) {
      console.log('Decryption successful!');
    }

  } catch (error) {
    console.error(error);
  }
}

main();