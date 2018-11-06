var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserPingSchema = new Schema({
    //user_id: String,
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    ping_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ping'
    },
    sponsor: String,
    name: String,
    phone: String,
    form_id: String,
    sub_fee: Number,
    pay_state: Number,
    ping_finish: Number,
    use_state: Number,
    need_refund: Boolean,
    refunded: Boolean,
    need_process: Boolean,
    processed: Boolean,
    m_name: String,
    m_phone: String,
    m_wx: String,
    m_email: String,
    m_avatar: String
    // manager: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Manager'
    // }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

module.exports = mongoose.model('UserPing', UserPingSchema, 'user_pings');
