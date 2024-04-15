// userManagement_test.js

const { registerUser, authenticateUser, getUserPublicKey, getUserPrivateKey, userExists } = require('../modules/userManagement');
const { encryptWithPublicKey, decryptWithPrivateKey } = require('../modules/mycrypt');

async function main() {
  try {

    const passphrase = 's3cret123';
    const username = 'john.doe@example.com';

    /*
    console.log('Registering user...');
  
    const startRegister = Date.now();
    const userInfo = await registerUser(username, passphrase);
    console.log(`User registered: ${JSON.stringify(userInfo)}`);
    const endRegister = Date.now();
    console.log(`Registration took ${endRegister - startRegister}ms`);
    */
   
    console.log('Logging in user...');
    
    const startLogin = Date.now();

    const isAuthenticated = await authenticateUser(username, passphrase);
    console.log(isAuthenticated ? 'Login successful' : 'Login failed');

    const endLogin = Date.now();
    console.log(`Login took ${endLogin - startLogin}ms`);
  
    console.log('Getting user private key...');
    
    const startGetkey = Date.now();
    const privateKey = await getUserPrivateKey(username);
    const publicKey = await getUserPublicKey(username);
    const endGetkey = Date.now();
    console.log(`Get RSA Keys took ${endGetkey - startGetkey}ms`);

    // RAS testing
    // Limit size to 180.
    plaintext = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu feugiat mauris, sit amet vestibulum turpis. Aenean sollicitudin lobortis nunc, id dictum ante molestie eget.';

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
    console.error(error.stack);
  }
}

main();
