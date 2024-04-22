const fetch = require('node-fetch');

async function fetchBooksFromDataSource(searchTerm) {
  try {
    // Construct the Open Library API URL with the search term
    const apiUrl = `http://openlibrary.org/search.json?title=${encodeURIComponent(searchTerm)}`;
    
    // Fetch data from the API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.docs) {
      // Extract relevant book information from the API response
      const books = data.docs.slice(0, 20).map(bookSingle => {
        const {
          key,
          author_name,
          cover_i,
          edition_count,
          first_publish_year,
          title,
        } = bookSingle;

        return {
          id: key,
          author: author_name,
          cover_id: cover_i,
          edition_count,
          first_publish_year,
          title,
        };
      });

      return books;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

module.exports = fetchBooksFromDataSource;
