var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: String,
    price_origin: Number,
    price_bottom: Number,
    sponsor_bonus: Number,
    less_minus: Number,
    rules: [{
        num: Number,
        bonus: Number
    }],
    expire: Number,
    sub_fee: Number,
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('Product', ProductSchema, 'products');