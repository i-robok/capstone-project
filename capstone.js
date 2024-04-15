
const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));

// Set view engine as EJS
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// Set static path to public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use session middleware to keep the username.
const session = require('express-session');

app.use(session({
    secret: process.env.MASTER_PASSWORD,
    resave: false,
    saveUninitialized: true,
    rolling: true, // Reset maxAge on every request to require user activity for session to be maintained
    cookie: {
        maxAge: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
        secure: process.env.NODE_ENV === "production" // Set 'secure: true' if you are using HTTPS, typically in production
    }
}));

// for validation
const { body, validationResult } = require('express-validator');

// Import project core functions
const { registerUser, authenticateUser, userExists, getUserPublicKey, getUserPrivateKey } = require('./modules/userManagement');
const { sendMessage, retrieveUserMessages } = require('./modules/messages');


// Endpoints to manage the WEB site.

// Route for home page
app.get('/', (req, res) => {
    res.render('index');
});

// Route for registration page
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    console.log(`req.body: ${JSON.stringify(req.body)}`);
    const { username, password } = req.body;

    try {
      const userInfo = await registerUser(username, password);
      console.log(`User registered: ${JSON.stringify(userInfo)}`);

      res.status(201).json({ message: 'User registered successfully' });
    } 
    catch (error) {
      console.error('Registration failed:', error.message);
      console.error(error.stack);

      res.status(500).json({ errorMessage: `Registration failed: ${error.message}` });
    }
    
});

app.post('/register',
  // Validate and sanitize the username
  body('username')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers')
    .trim()
    .escape(),
  // Validate and sanitize the password
  body('password')
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1
    }).withMessage('Password must be stronger')
    .trim()
    .escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    console.log(`req.body: ${JSON.stringify(req.body)}`);
    const { username, password } = req.body;

    try {
      const userInfo = await registerUser(username, password);
      console.log(`User registered: ${JSON.stringify(userInfo)}`);

      res.status(201).json({ message: 'User registered successfully' });
    } 
    catch (error) {
      console.error('Registration failed:', error.message);
      console.error(error.stack);

      res.status(500).json({ errorMessage: `Registration failed: ${error.message}` });
    }
});


// Route for login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // login attempts
    if (!req.session.loginAttempts) {
        req.session.loginAttempts = 0;
    }

    try {
        const isAuthenticated = await authenticateUser(username, password);
        console.log(isAuthenticated ? 'Login successful' : 'Login failed');

        if (!isAuthenticated) {
            req.session.loginAttempts += 1;
            
            if (req.session.loginAttempts >= 3) {
                // Delay subsequent responses by 5 seconds after 3 failed login attempts
                setTimeout(() => {
                    res.status(429).json({ errorMessage: 'Too many failed login attempts. Please try again later.' });
                }, 5000 * (req.session.loginAttempts - 2)); // Apply delay based on attempts
            } else {
                return res.status(401).json({ errorMessage: 'Login failed: user doesn\'t exist or password is incorrect' });
                // throw new Error('Login failed: user doesn\'t exist or password is incorrect');
            }
            return; // Early return to prevent further processing
        }

        // Reset login attempts after successful authentication
        req.session.loginAttempts = 0;

        // User validated successfully, let's login
        req.session.isAuthenticated = true;
        req.session.user = { username: username };

        // Retrieving messages here avoids keeping the password in the session info.
        req.session.messages = await retrieveUserMessages(username, password);

        console.log(`User ${username} logged in`);
        return res.status(201).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login failed:', error.message);
        console.error(error.stack);

        return res.status(401).json({ errorMessage: 'Login failed: user doesn\'t exist or password is incorrect' });
    }
});


// Route for logout

app.post('/logout', async (req, res) => {

    try {
      if (!req.session.isAuthenticated) {
          // Nothing to do: there's no logged user.
          return res.status(201).json({ message: 'No logged user' });
      }
    
      // Just for logging purposes:
      const { username } = req.session.user;
      console.log(`User ${username} logging out`);

      // Destroy the session
      req.session.destroy(function(err) {
        if (err) {
            console.error('Session destruction error:', err);
        } else {
            console.log(`User ${username} logged out`);
            return res.status(201).json({ message: 'User logged out' });
        }
      });

    } 
    catch (error) {
      console.error('Logout failed:', error.message);
      console.error(error.stack);
  
      return res.status(500).json({ errorMessage: 'Logout failed' });
    }
});

// Route for displaying messages
app.get('/messages', async (req, res) => {

    if (!req.session.isAuthenticated) {
        return res.status(401).send('You are not authorized to view this page');
    }

    const { username } = req.session.user;
    var userMessages = req.session.messages;

    // Render 'messages.ejs' with the list of messages for the user
    res.render('messages', { user: username, messages: userMessages });
});


// Route for sending messages
app.get('/send', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).send('You are not authorized to view this page');
    }

    const { username } = req.session.user;
    res.render('send', { user: username });
});

// Route for handling message sending
app.post('/send', async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ errorMessage: 'You are not authorized to view this page' });
    }

    const { username } = req.session.user;
    const { recipient, message } = req.body;
    
    // Ensure recipient user exist
    if (!userExists(recipient)) {
        return res.status(400).json({ errorMessage: 'You are not authorized to view this page' });
    }

    try {
      await sendMessage(username, recipient, message);

      return res.status(201).json({ message: `Message sent successfully to ${recipient}`});
    } 
    catch (error) {
      console.error('Send message failed:', error.message);
      console.error(error.stack);
  
      return res.status(500).json({ errorMessage: error.message });
    }
});


// Route for dbdump
const fs = require('fs').promises; // fs promises API for use with async/await
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

app.get('/dbdump', async (req, res) => {
  try {
    // Load & Parse the content of the files
    const users_json = await loadJsonFile(process.env.USERS_FILE);
    const messages_json = await loadJsonFile(process.env.MESSAGES_FILE);
    const binaries_json = await loadJsonFile(process.env.BINARIES_FILE);

    // Combine them into one JSON object with separate sections
    const dbdumpJson = {
      users: users_json,
      messages: messages_json,
      binaries: binaries_json
    };

    // Send the combined JSON as a response
    res.json(dbdumpJson);

  } catch (error) {
    // Handle possible errors such as file not found
    console.error(error);
    res.status(500).send('An error occurred while fetching the data.');
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
