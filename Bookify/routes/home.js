var express = require('express');
var router = express.Router();
const axios = require('axios')
const homeRouter = express.Router()
/* GET home page. */
// https://openlibrary.org/search.json?title=the+lord+of+the+rings
const openLibraryURL = "http://openlibrary.org/search.json?title=";

// Define a route for handling book search requests
homeRouter.get('', async (req, res) => {
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
    //res.render('Book', { books, query });

  } catch (error) {
    console.error('Error searching for books:', error);
    res.status(500).send('An error occurred while searching for books.');
  }
});


module.exports = homeRouter;