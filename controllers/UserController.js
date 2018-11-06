var mongoose = require("mongoose");
var Ping = require("../models/Ping");
var User = require("../models/User");
var UserPing = require("../models/UserPing");

var userController = {};

// wx
userController.userpings = function(req, res) {
    console.log(req.body);
    console.log('here');
    var user_id = req.body.user_id;
    UserPing.find({
        user_id: user_id
    }).populate('ping_id').then(ups=>{
        console.log(ups)
        res.send(ups)
    })
};

userController.userping = function(req, res) {
    console.log(req.body);
    console.log('here');
    var user_ping_id = req.body.user_ping_id;
    UserPing.findById(user_ping_id).populate('ping_id').then(up=>{
        console.log(up)
        res.send(up)
    })
};

// admin

module.exports = userController;
