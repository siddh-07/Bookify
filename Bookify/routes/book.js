// Import required modules
const express = require('express');
const axios = require('axios');
const bookRouter = express.Router();

// Define the Open Library API URL
const openLibraryURL = "http://openlibrary.org/search.json?title=";

// Define a route for handling book search requests
bookRouter.get('', async (req, res) => {
  try {
    // Get the search query from the request parameters
    const query = req.query.query;

    // Make a request to the Open Library API to search for books
    const response = await axios.get(`${openLibraryURL}${query}`);
    const books = response.data.docs || [];

    // Slice the results to get the top 6 books
    const top6Books = books.slice(17, 23);

    // Render the 'Home' view and pass the top 12 books and query data to it
    res.render('Home', { top6Books, query });

    // Render the 'Book' view and pass all books and query data to it (is this intended?)
    res.render('Book', { books, query });

  } catch (error) {
    console.error('Error searching for books:', error);
    res.status(500).send('An error occurred while searching for books.');
  }
});

// Export the bookRouter for use in other parts of the application
module.exports = bookRouter;
