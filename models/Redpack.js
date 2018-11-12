var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RedpackSchema = new Schema({
    level: Number,
    user_ping_id: String,
    to_user_id: String,
    to_openid: String,
    amount: Number,
    redpack_id: String,
    redpack_sent: Boolean,
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('Redpack', RedpackSchema, 'redpacks');
