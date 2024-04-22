const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer')
const path = require("path");
const bcrypt = require('bcrypt')
const express = require("express");
const app = express();
const bookRouter = require("./routes/book");
const detailRouter = require("./routes/detail");
const homeRouter = require("./routes/home");
const bookNavRouter = require("./routes/bookNav");
const contactRouter = require("./routes/contact");
const searchRouter = require("./routes/search");
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const {logAndStoreAction} = require("./routes/activityTracker")
const GoogleStrategy = require('passport-google-oauth20').Strategy
const initializePassport = require('./routes/passport-config')
const cookieParser = require('cookie-parser');
const {body, validationResult} = require('express-validator');
const hbs = require("hbs");
hbs.registerHelper("eq", (a, b) => a === b);

const PORT = process.env.PORT || 3001;

app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'uploads')));


app.use(express.static("public"));
app.use(cors());
app.use(express.json());

const users = []

app.use(cookieParser());
app.use(express.urlencoded({extended: true}))
app.use(flash())
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.use(session({
    secret: 'loda',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 5 * 60 * 1000, // 5 minutes (adjust as needed)
    },
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('Profile')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    const logAction = {
        name: "Login Activity",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        url: `http://localhost:3001/`,
        description: `You logged in succesfully.`
    }

    const userActivities = logAndStoreAction(req, logAction);
    res.render('login', userActivities)
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            // Authentication failed
            return res.redirect('/login');
        }

        // Log the user in
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            if (req.body.rememberMe) {
                // If "Remember Me" is checked, extend the session duration
                // req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
                // req.session.cookie.maxAge = 30*1000
            }

            return res.redirect('/home'); // Redirect to the home page upon successful login
        });
    })(req, res, next);
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        if (users.email !== req.body.email) {
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                img: "",
                source: "local"

            })


            res.redirect('/login')
        }
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {

    if (req.isAuthenticated()) {
        return res.redirect('/home')
    }
    next()
}

function checkSessionExpiration(req, res, next) {
    if (req.isAuthenticated()) {
        // The user is authenticated, so the session is still active
        return next();
    }

    // Session has expired; display an error page or message
    res.render('session_expire');
}


// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: '162292685834-h3hr7nkbqaqo3fu5e5lqqb9lg3skm7mf.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: "http://localhost:3001/auth/google/callback",
        },
        function (accessToken, refreshToken, profile, cb) {
            // Use the profile information to authenticate the user
            // ...
            if (users.email !== profile.emails[0].value) {
                users.push({
                    id: profile.id, // Use a unique identifier from Google (profile.id is just an example)
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    img: profile.photos[0].value,
                    source: 'google'
                })

                return cb(null, users);
                //  cb(null, profile);
            }
        })
);

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login");
});

app.get(
    "/auth/google",
    passport.authenticate("google", {scope: ["profile", "email"]})
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {failureRedirect: "/login"}),
    function (req, res) {
        res.redirect("/home");
    }
);

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/login");
        }
    });
});

const storage = multer.diskStorage
({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Define the file name
    },
});

const upload = multer({storage: storage});

app.post('/update-profile-picture', checkAuthenticated, upload.single('profilePicture'), (req, res) => {
    const file = req.file.path.replace(/\\/g, '/');
    const image = path.basename(file);
    let user = req.user[0];

    if (req.user.source === 'local') {
        user = users.find((u) => u.email === req.user.email);
        console.log(user)
        user.img = image;
    }
    if (user.source === 'google') {
        // user = users.find((u) => u.email === req.user.email);
        console.log(user)
        user.img = image;
    }
    else{
        user = users.find((u) => u.email === req.user.email);
        console.log(user)
        user.img = image;
    }

    const viewAction = {
        name: "Upload Activity",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        url: user.img,
        description: `Profile Updated`,
    }

    const userActivities = logAndStoreAction(req, viewAction);

    return res.redirect('/profile');
});

app.use('/home', checkSessionExpiration, checkAuthenticated, homeRouter);
app.use("/book", checkSessionExpiration, checkAuthenticated, bookRouter);
app.use("/detail", checkSessionExpiration, checkAuthenticated, detailRouter);
app.use("/bookNav", checkSessionExpiration, checkAuthenticated, bookNavRouter);
app.use("/contact", checkSessionExpiration, checkAuthenticated, contactRouter);
app.use("/search", checkSessionExpiration, checkAuthenticated, searchRouter);

app.get('/profile', checkSessionExpiration,checkAuthenticated,(req, res) => {

// console.log( { user: req.user,name : req.user.email })
    // Display the user's profile information
    // console.log('req.user:', req.user); // Check the value of req.user

    let user = req.user[0];
    const userActivities = req.session.userActivities || [];
    if (req.user.source === 'local') {
        user = users.find((u) => u.email === req.user.email);
        console.log('User is local:', user);
    }
    else if (req.user.source === 'google') {
        user = users.find((u) => u.email === req.user.email);
        // user=user[0];
        console.log('User is google:', user);
    }
// console.log(user);
    res.render('Profile',
        {user,  userActivities})

});

const fs = require("fs");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/submit-review", (req, res) => res.render("Review_form"));

app.post(
    "/submit-review",
    [
        body("name").notEmpty().withMessage("required"),
        body("email").isEmail().withMessage("required"),
        body("reviewBook").notEmpty().withMessage("required"),
        body("readAgain")
            .notEmpty()
            .withMessage("Please select whether you would read it again"),
        body("dateRead").notEmpty().isISO8601().withMessage("Invalid date format"),
        body("rating")
            .notEmpty()
            .isInt({ min: 1, max: 5 })
            .withMessage("Invalid rating"),
        body("terms")
            .notEmpty()
            .withMessage("You must accept the terms and conditions"),
    ],
    upload.single("file"),
    (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            const formData = {
                name: req.body.name,
                email: req.body.email,
                favoriteQuotes: req.body.favoriteQuotes,
                reviewBook: req.body.reviewBook,
                readAgain: req.body.readAgain,
                bookFormat: req.body.bookFormat,
                dateRead: req.body.dateRead,
                rating: req.body.rating,
                terms: req.body.terms === "on",
            };

            // Save the data to a JSON file
            const fs = require("fs");
            let reviews = [];
            fs.readFileSync("reviews.json", "utf8", (err, data) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Unable to read the data file." });
                }

                if (data) {
                    reviews = JSON.parse(data);
                }
            });
            reviews.push(formData);

            fs.writeFileSync("reviews.json", JSON.stringify(reviews), (err) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Unable to write to the data file." });
                }
            });

            const viewAction = {
                name: "Review Activity",
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                url: `http://localhost:3001/submit-review`,
                description: `Your review is Submitted`,
            };

            logAndStoreAction(req, viewAction);

            return res.redirect("/home");
        } else {
            // Handle validation errors
            res.render("Review_form", { errors: errors.array(), formData: req.body });
        }
    }
);

app.post(
    "/contact",
    [
        body("firstName").notEmpty().withMessage("Name is required"),
        body("lastName").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("phone").isMobilePhone("any").withMessage("Invalid contact number"),
        body("message").notEmpty().withMessage("Message is required"),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            const { firstName, lastName, email, phone} = req.body;

            if (req.body.rememberMe) {
                // Set cookies if "Remember Me" is checked
                //save cookies for 60 days
                res.cookie("firstName", firstName, {
                    maxAge: 60 * 24 * 60 * 60 * 1000,
                });
                res.cookie("lastName", lastName, { maxAge: 60 * 24 * 60 * 60 * 1000 });
                res.cookie("email", email, { maxAge: 60 * 24 * 60 * 60 * 1000 });
                res.cookie("phone", phone, { maxAge: 60 * 24 * 60 * 60 * 1000 });
            }
            res.redirect("contact");

            const viewAction = {
                name: "Feedback Activity",
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                url: `http://localhost:3001/contact`,
                description: `Your feedback is Submitted`,
            };

            const userActivities = logAndStoreAction(req, viewAction);

            // Render the 'search-results' view and pass the search results data to it
            res.render("ContactUs", { userActivities });
        } else {
            // Handle validation errors
            res.render("ContactUs", { errors: errors.array(), formData: req.body });
        }
    }
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


