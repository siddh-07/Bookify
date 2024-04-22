const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const searchRouter = express.Router(); // Create a new router for search functionality
const axios = require('axios');
const https = require('node:https');
const { logActivity } = require('./activityTracker');
const {logAndStoreAction} = require("./activityTracker")

// Define a GET route for handling book searches

searchRouter.get('', async (req, res) => {
    try {
        const query = req.query.query;
        const sort = req.query.sort;

        // Check if the searchResults array exists in the current session; if not, fetch it
        let searchResults =  [];
// showLoadingSpinner();
        // If searchResults is empty or the user performed a new search, fetch data from the API
        if (!searchResults.length ){//|| req.query.newSearch === 'true') {
            const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
            searchResults = response.data.docs || [];

            // Store the initial search results in the session
            req.session.searchResults = searchResults;
        }

        // Handle the sorting on the server
        if (sort) {
            if (sort === 'title') {
                const titleAction =  { name: "Filter Activity",
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    url: `http://localhost:3001/search?query=${query}`,
                    description: `Filtered ${query} by Title`,}
                const userActivities =  logAndStoreAction(req, titleAction);
                searchResults.sort((a, b) => a.title.localeCompare(b.title));
            } else if (sort === 'year') {
                searchResults.sort((a, b) => a.first_publish_year - b.first_publish_year);
            } else if (sort === 'author') {
                // searchResults.sort((a, b) => a.author_name.forEach(element => {
                //   (a.author_name[element] - b.author_name[element])
                // }))
                searchResults.sort((a, b) => a.author_name[0] - b.author_name[0]);
            } else if (sort === 'edition') {
                searchResults.sort((a, b) => a.edition_count - b.edition_count);
            }
        }
        const searchAction =  { name: "Search Activity",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            url: `http://localhost:3001/search?query=${query}`,
            description: `Searched for a book: ${query}`}

        const userActivities =  logAndStoreAction(req, searchAction);


        res.render('Book', { searchResults, query , sort, userActivities});
    } catch (error) {
        console.error('Error searching for books:', error);
        // hideLoadingSpinner();
        res.status(500).send('An error occurred while searching for books.');
    }
});

module.exports = searchRouter;