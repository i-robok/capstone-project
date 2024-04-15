
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
// app.use(express.static(path.join(__dirname, 'public')));

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

// Route for login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const isAuthenticated = await authenticateUser(username, password);
      console.log(isAuthenticated ? 'Login successful' : 'Login failed');
  
      if (!isAuthenticated) {
        throw new Error('Login failed: user doesnt exists or password is incorrect');
      }

      // User validated successfully, let's login
      req.session.isAuthenticated = true;
      req.session.user = { username: username };
      req.session.messages = await retrieveUserMessages(username, password);

      console.log(`User ${username} logged in`);
      res.status(201).json({ message: 'Login successful' });
    } 
    catch (error) {
      console.error('Login failed:', error.message);
      console.error(error.stack);
  
      res.status(500).json({ errorMessage: 'Login failed: user doesnt exists or password is incorrect' });
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

      return res.status(201).json({ message: 'Message sent successfully'});
    } 
    catch (error) {
      console.error('Send message failed:', error.message);
      console.error(error.stack);
  
      return res.status(500).json({ errorMessage: error.message });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
