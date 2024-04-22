const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const app = express();

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve your HTML form
app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/contact.html');
});

// Handle form submission with validation
app.post('/submit', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If there are validation errors, render the form again with error messages
        return res.status(400).render('contact.html', { errors: errors.array() });
    } else {
        // If validation passes, process the form data and send a success response
        res.send('Form submitted successfully!');
    }
});

// Start the Express server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
