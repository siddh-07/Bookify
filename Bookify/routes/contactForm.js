const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3001;
const expressValidator = require('express-validator');
const expressSession = require('express-session');
const {logAndStoreAction} = require("../routes/activityTracker")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(expressValidator()); // Initialize Express Validator

app.use(
    expressSession({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
    })
);

app.set('view engine', 'hbs');

// Add custom validators
app.use(expressValidator({
    customValidators: {
        isValidPhone: (value) => {

            const phonePattern = /^\d{10}$/;

            return phonePattern.test(phone);
        },
        isValidEmail: (value) => {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

            return emailPattern.test(email);
        },
    },
}));

app.post('/submit', (req, res) => {
    req.checkBody('firstName', 'First Name is required').notEmpty();
    req.checkBody('lastName', 'Last Name is required').notEmpty();
    req.checkBody('phone', 'Phone is required').notEmpty().isValidPhone();
    req.checkBody('email', 'Email is required').notEmpty().isValidEmail();
    req.checkBody('message', 'Message is required').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        // If there are validation errors, render the form with error messages
        res.render('form', { errors });
    } else {
        // If there are no errors, you can handle the form submission here
        // For example, save data to a database
        alert("Feedback Submitted successfully");
        res.redirect('contact');
    }

    const viewAction =  { name: "Feedback Activity",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        url: `http://localhost:3001/contact`,
        description: `Your feedback is Submitted`,}

    const userActivities =  logAndStoreAction(req, viewAction);

    // Render the 'search-results' view and pass the search results data to it
    res.render('contact', {userActivities});
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
