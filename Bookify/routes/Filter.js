// Import required modules
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Filter by Author
router.get('/author/:authorName', async (req, res) => {
    try {
        const query = req.query.query;

        // Make a request to the Open Library API to search for books
        const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
        const searchResults = response.data.docs || [];

        // Render the 'Book' view and pass the search results data to it
        res.render('Book', { searchResults, query });

    } catch (error) {
        console.error('Error searching for books:', error);
        res.status(500).send('An error occurred while searching for books.');
    }
});

// Filter by Year
router.get('/year/:year', async (req, res) => {
    const year = req.params.year;
    // Use the year to filter books and fetch the filtered data
    // Example: const filteredBooks = await fetchBooksByYear(year);
    res.render('filtered_books', { books: filteredBooks });
});

// Filter by Title
router.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    // Use the title to filter books and fetch the filtered data
    // Example: const filteredBooks = await fetchBooksByTitle(title);
    res.render('filtered_books', { books: filteredBooks });
});

// Export the router to be used in other parts of the application
module.exports = router;
