const express = require('express');
const detailRouter = express.Router()
const axios = require('axios');
const { logActivity } = require('./activityTracker');
const {logAndStoreAction} = require("./activityTracker")
const {query} = require("./search")
detailRouter.get('/works/:key', async (req, res) => {
  let bookID = req.params.key;
  try {

    // Make a request to the Open Library API to search for books
    const response = await axios.get(`https://openlibrary.org/works/${bookID}.json`);
    const book = response.data || [];

    // console.log(book);
    const viewAction =  { name: "View Activity",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      url: `http://localhost:3001/detail//works/${bookID}`,
      description: `Searched for a book: ${book.title}`,}

    const userActivities =  logAndStoreAction(req, viewAction);

    // Render the 'search-results' view and pass the search results data to it
    res.render('bookDetails', {book , userActivities});

  } catch (error) {
    console.error('Error searching for books:', error);
    res.status(500).send('An error occurred while searching for books.');
  }
});

module.exports = detailRouter