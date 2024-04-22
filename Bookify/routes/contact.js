var express = require('express');
var router = express.Router();
const contactRouter = express.Router()
/* GET home page. */
contactRouter.get('', function(req, res,) {

  const formData = {
    firstName: req.cookies.firstName || '',
    lastName: req.cookies.lastName || '',
    email: req.cookies.email || '',
    phone: req.cookies.phone || '',
    message: req.cookies.message || '',
  };

  res.render('ContactUs', {formData});
});

module.exports = contactRouter;