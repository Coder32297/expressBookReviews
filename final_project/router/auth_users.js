const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

// Login a register user
//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provied
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required"});
    }

    // Validate if the user exists and the password matches
    const validUser = users.find(user => user.username === username && user.password === password);

    if (validUser) {
        // Generate JWT access token
        let accessToken = jwt.sign({ data: username }, "access", {expiresIn: 60 * 60 });

        // Save the token to the session authorization object
        req.session.authorization = {
            accessToken, username
        };

        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization ? req.session.authorization['username'] : null;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Check if the book exists in the database
    if (books[isbn]) {
        // Add or update the review under the logged-in user's username
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `The review for book with ISBN ${isbn} has been added/updated.` });
    } else {
        return res.status(444).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization['username'] : null;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Check if the book exists
    if (books[isbn]) {
        // Check if this specific user has a review for the book
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
        } else {
            return res.status(404).json({ message: "No review found for this user on this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
