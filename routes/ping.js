var express = require('express');
var router = express.Router();
var pingController = require("../controllers/PingController.js");

// wx
router.post('/', pingController.ping);

router.post('/createPing', pingController.createPing);

router.post('/joinPing', pingController.joinPing);

router.post('/avatars', pingController.avatars);

// admin
router.post('/addPing', pingController.addPing);

module.exports = router;