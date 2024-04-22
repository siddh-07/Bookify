var express = require('express');
var router = express.Router();
const bookNavRouter = express.Router()
/* GET home page. */
bookNavRouter.get('', function(req, res,) {
  res.render('Book');
});

module.exports = bookNavRouter;