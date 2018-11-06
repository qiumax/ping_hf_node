var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    openid: String,
    name: String,
    avatar: String,
    gender: String,
    city: String,
    province: String,
    country: String,
    password: String
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema, 'users');