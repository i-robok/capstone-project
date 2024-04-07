const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Simulate a database in memory
const usersDb = {
    // This is a key-value store where username is the key and value is an object containing email and password
};

// Set up the templating engine
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Helper functions
function validateLogin(username, password) {
    const user = usersDb[username];
    return user && user.password === password;
}

function registerUser(username, email, password) {
    if (usersDb[username]) {
        return false; // Username already taken
    }
    // Register new user
    usersDb[username] = { email, password };
    return true;
}

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (validateLogin(username, password)) {
        res.send(`Welcome back, ${username}!`);
    } else {
        res.send('Invalid username or password.');
    }
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (registerUser(username, email, password)) {
        res.send(`Hi ${username}, you have been registered successfully!`);
    } else {
        res.send('Registration failed: Username already exists.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
