var express = require('express');
var router = express.Router();
var userController = require("../controllers/UserController.js");

// wx
router.post('/userpings', userController.userpings);

router.post('/userping', userController.userping);

// admin

module.exports = router;
