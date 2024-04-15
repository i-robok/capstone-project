// userManagement_test.js

const UserManagement = require('../modules/userManagement');
const userManager = new UserManagement('users.json');

async function registerUser(email, password) {
  try {
    const userInfo = await userManager.register(email, password);
    console.log('User registered:', userInfo);
  } catch (error) {
    console.error('Registration failed:', error.message);
    console.error(error.stack);
  }
}

async function loginUser(email, password) {
  try {
    const isAuthenticated = await userManager.authenticate(email, password);
    console.log(isAuthenticated ? 'Login successful' : 'Login failed');
  } catch (error) {
    console.error('Authentication failed:', error.message);
    console.error(error.stack);
  }
}

async function getUserPrivateKey(email) {
  try {
    const privateKey = await userManager.getUserPrivateKey(email);
    console.log('Private key:', privateKey);
  } catch (error) {
    console.error('Authentication failed:', error.message);
    console.error(error.stack);
  }
}

async function main() {
  try {
    console.log('Registering user...');
  
    const startRegister = Date.now();
    await registerUser('john.doe@example.com', 's3cret123');
    const endRegister = Date.now();
    console.log(`Registration took ${endRegister - startRegister}ms`);
    
    console.log('Logging in user...');
    
    const startLogin = Date.now();
    await loginUser('john.doe@example.com', 's3cret123');
    const endLogin = Date.now();
    console.log(`Login took ${endLogin - startLogin}ms`);
  
    console.log('Getting user private key...');
    
    const startGetkey = Date.now();
    await getUserPrivateKey('john.doe@example.com');
    const endGetkey = Date.now();
    console.log(`Get Private Key took ${endGetkey - startGetkey}ms`);
  } catch (error) {
    console.error(error);
    console.error(error.stack);
  }
}

main();
