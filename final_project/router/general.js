const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username alredy exists"});
  }

  // Add the new user to the shared user array
  users.push({ "username": username, "password": password });

  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const axios = require('axios');

// Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
    try {
        // Simulating an external API/database fetch asynchronously
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        // Fallback directly to local data if the server loop is tricky during initialization
        return res.status(200).send(JSON.stringify({ books }, null, 4));
    }
});
});

// Get book details based on ISBN using Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        // Asynchronously fetch from local server endpoint
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        // Fallback directly to local data if the network request fails or during initialization
        if (books[isbn]) {
            return res.status(200).send(JSON.stringify(books[isbn], null, 4));
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    }
});
  
// Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        // Asynchronously fetch from your local server endpoint
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        // Fallback directly to filtering local data if the network request fails
        const bookKeys = Object.keys(books);
        let matchingBooks = [];

        bookKeys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });

        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify({ booksByAuthor: matchingBooks }, null, 4));
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    }
});

//Get book details based on title
public_users.get("/title/:title", function (req, res) {
    const title = req.params.title;

    // Obtain all the keys for the 'books' object
    const bookKeys = Object.keys(books);

    // Array to hold books that match the requested title
    let matchingBooks = [];

    // Iterate through the 'books' object using keys
    bookKeys.forEach(key => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push({
                isbn: key,
                author: books[key].author,
                reviews: books[key].reviews
            });
        }
    });
    // Check if any matching books were found
    if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify({ booksByTitle: matchingBooks }, null, 4));
    } else {
        return res.status(404).json({ message: "No books found for this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // Check if the book exists in your database
    if (books[isbn]) {
        // Return only the reviews object for that book
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found"});
    }
});

module.exports.general = public_users;
