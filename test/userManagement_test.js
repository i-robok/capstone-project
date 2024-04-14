// userManagement_test.js

const UserManagement = require('./userManagement');
const userManager = new UserManagement('users.json');

async function registerUser(email, password) {
  try {
    const userInfo = await userManager.register(email, password);
    console.log('User registered:', userInfo);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

async function loginUser(email, password) {
  try {
    const isAuthenticated = await userManager.authenticate(email, password);
    console.log(isAuthenticated ? 'Login successful' : 'Login failed');
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
}

// Example usage:
registerUser('jane.doe@example.com', 's3cret123');
loginUser('jane.doe@example.com', 's3cret123');