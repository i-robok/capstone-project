# Capstone NodeJS Web Application

## Overview

Capstone is a NodeJS web application providing a platform for users to register, login, view messages, and send messages. This application utilizes EJS templates for rendering views and encapsulates specific functionalities in various modules.

## Installation

Before installing the application, make sure you have [Node.js](https://nodejs.org/) installed on your machine.

To set up the application:

1. Clone the repository to your local machine.
2. Navigate to the directory where you cloned the repository.
3. Run `npm install` to install the required dependencies.

```bash
git clone https://github.com/your-username/capstone-nodejs-app.git
cd capstone-nodejs-app
npm install
```

## Installation from Heroku

### Prerequisites

To interact with Heroku and clone repositories, you will need to have the Heroku Command Line Interface (CLI) installed on your computer. If you don't have it installed, follow these instructions:

#### Install Heroku CLI

- **macOS**: Use Homebrew by running the following command in the terminal:
  ```bash
  brew tap heroku/brew && brew install heroku
  ```

- **Windows**: Download and run the Windows installer from [Heroku's website](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

- **Ubuntu/Debian**: Run the following commands in your terminal:
  ```bash
  curl https://cli-assets.heroku.com/install.sh | sh
  ```

- For other systems or methods, please refer to the official documentation at: [Heroku CLI Installation][1]

After installation, you can use the `heroku --version` command to confirm that Heroku CLI has been installed successfully.

[1]: https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli

#### Authenticate Heroku CLI

Before cloning the repository, authenticate the Heroku CLI with your account using the following command:

```bash
heroku login
```

This will prompt you to log in through your web browser.

### Clone the Repository Using Heroku CLI

Once you have the Heroku CLI installed and logged in, you can proceed to clone the Heroku app repository using the following steps:

```bash
# Navigate to the directory where you want to clone the repository
cd path/to/directory

# Use the heroku git:clone command to clone the repository
heroku git:clone -a coursera-capstone

# Change into the newly created directory
cd coursera-capstone

# Install dependencies with npm if it's a Node.js app
npm install
```

Now you have cloned the Heroku repository to your local machine and can start working on the app. Remember that for other types of projects you might need to use different package managers or additional set up after cloning.

## Usage

Once the dependencies are installed, you can start the application by running:

```bash
npm start
```

or

```bash
node capstone.js
```

This will start the server, typically on port `3000`, unless configured otherwise. You can access the web application by going to `http://localhost:3000` in your browser.

## Features

- **User Registration**: New users can register for an account using the `register.ejs` view.
- **User Login**: Registered users can log into their account using the `login.ejs` view.
- **Message Viewing**: Users can view their messages through the `messages.ejs` view.
- **Sending Messages**: Users can send messages to others using the `send.ejs` view.

## File Structure

Below is an overview of the main files in the application:

- `capstone.js`: The entry point of the application which sets up the server and routes.
- `views/`: This directory contains the EJS templates for rendering pages.
  - `index.ejs`: The homepage view.
  - `login.ejs`: The login page view.
  - `register.ejs`: The new user registration page view.
  - `messages.ejs`: The view for displaying user messages.
  - `send.ejs`: The view for sending new messages.
- `modules/`: This directory contains separate modules that handle specific aspects of the application.
  - `messages.js`: Manages the creation and retrieval of messages.
  - `mycrypt.js`: Provides encryption and decryption utilities.
  - `userManagement.js`: Handles user-related operations such as registration and authentication.
  - `messagesStorage.js`: Deals with the storage of messages.

## Modules

### `messages.js`

Handles message operations, including saving and fetching messages from the storage system.

### `mycrypt.js`

Provides functions for encrypting and decrypting data, ensuring secure message transmission.

### `userManagement.js`

Manages user accounts, including registration, login, and session management.

### `messagesStorage.js`

Deals with the persistence layer for messages, potentially interfacing with a database or file system.

## Contributions

Contributions to this project are welcome. Please ensure you follow the established code style and add tests for any new features or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE.md).