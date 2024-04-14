
const express = require('express');
const path = require('path');
const app = express();

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));

// Set view engine as EJS
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

// Simple in-memory "database"
const users = {
    // username: password (in plain text for simplicity)
};

const messages = {
    // username: ['message1', 'message2']
};

// Route for home page
app.get('/', (req, res) => {
    res.render('index');
});

// Route for registration page
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        // User already exists
        res.render('register', { errorMessage: 'Registration failed. Please try again.' });
        return res.redirect('/register');
    }
    
    // Register the user (insecure as plaintext!)
    users[username] = password;
    messages[username] = []; // Create an empty array for user messages

    // Redirect to login on success
    return res.redirect('/login');
});

// Route for login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] === password) {
        // Login successful, redirect to messages page
        return res.redirect(`/messages?user=${encodeURIComponent(username)}`);
    }

    // Login failed
    return res.redirect('/login');
});

// Existing route for displaying messages
app.get('/messages', (req, res) => {
    const { user } = req.query;
    var userMessages = messages[user] || [];

    // Ensure the user parameter is provided
    if (!user) {
        return res.status(401).send("User query parameter is required.");
    }
    
    // Render 'messages.ejs' with the list of messages for the user
    res.render('messages', { user: user, messages: userMessages });
});


// Route for sending messages
app.get('/send', (req, res) => {
    const { user } = req.query;
    
    // Ensure the user is valid
    if (!user || !users[user]) {
        return res.redirect('/');
    }

    // Render 'send.ejs' template instead of sending a file
    res.render('send', { user });
});

// Dummy endpoint for handling message sending
app.post('/send', (req, res) => {
    const { sender, recipient, message } = req.body;
    
    // Ensure both users exist
    if (!users[sender] || !users[recipient]) {
        return res.send('Failed to send message: Invalid user.');
    }
    
    // Add the message to the recipient's messages array
    if (!messages[recipient]) {
        messages[recipient] = [];
    }
    messages[recipient].push(message);
    
    // Redirect to the messages page without reloading received messages
    return res.redirect(`/messages?user=${encodeURIComponent(sender)}`);
});


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
