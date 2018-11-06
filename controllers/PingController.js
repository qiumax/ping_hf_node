var mongoose = require("mongoose");
var Ping = require("../models/Ping");
var Product = require("../models/Product");
var User = require("../models/User");
var UserPing = require("../models/UserPing");
var Manager = require("../models/Manager");
var Weixin = require("../models/Weixin");

var pingController = {};

// wx
pingController.ping = function(req, res) {
    console.log(req.body.id);

    Ping.find({'_id':req.body.id}, function (err, ping) {
        res.send(ping);
    })
};

// 发起拼团
pingController.createPing = function(req, res) {
    console.log(req.body);

    var product_id = req.body.product_id;
    var user_id = req.body.user_id;
    var total = req.body.total;

    Product.findById(product_id).then( product => {
        console.log("product: ");
        console.log(product);
        // res.send(product);

        User.findById(user_id)
        .then( user => {
            console.log("user: ");
            console.log(user);

            var ts = new Date().getTime()/1000;
            var expire = ts + product.expire * 86400;

            var ping = new Ping({
                product_id: product_id,
                product_name: product.name,
                price_origin: product.price_origin,
                price_bottom: product.price_bottom,
                sponsor_bonus: product.sponsor_bonus,
                less_minus: product.less_minus,
                rules: product.rules,
                total: total,
                finish_num: 0,
                expire: expire,
                sub_fee: product.sub_fee,
                sponsor: user_id,
                sponsor_name: req.body.name,
                sponsor_phone: req.body.phone,
                sponsor_avatar: user.avatar,
                state: 0
            });

            ping.save().then(aPing => {
                console.log(aPing);

                // Manager.find().sort({'appoint_num':1}).limit(1)
                // .then(managers=> {
                //     var manager = managers[0];
                //     console.log(manager);
                //
                //     manager.appoint_num++;
                //     manager.save();

                    var userPing = new UserPing({
                        user_id: user_id,
                        ping_id: aPing.id,
                        sponsor: user_id,
                        name: req.body.name,
                        phone: req.body.phone,
                        sub_fee: product.sub_fee,
                        pay_state: 0,
                        ping_finish: 0,
                        use_state: 0
                        // m_name: manager.name,
                        // m_phone: manager.phone,
                        // m_wx: manager.wx,
                        // m_email: manager.email,
                        // m_avatar: manager.avatar
                    });

                    userPing.save().then(aUserPing => {
                        console.log(aUserPing);
                        // res.send(aUserPing);

                        Weixin.jsapipay({
                            user_ping_id: aUserPing.id,
                            attach: req.body.attach,
                            nonce_str: req.body.nonce_str,
                            sub_fee: aUserPing.sub_fee,
                            openid: user.openid,
                            description: "三一重卡订金",
                            timestamp: req.body.timestamp
                        }, function (pay_data) {
                            var prepay_id = pay_data.prepay_id;
                            userPing.form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                })
            })
        })
    // })
}

// 参与拼团
pingController.joinPing = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    var user_id = req.body.user_id;

    Ping.findById(ping_id).then( ping => {
        console.log("ping: ");
        console.log(ping);

        Product.findById(ping.product_id).then( product => {
            console.log("product: ");
            console.log(product);

            User.findById(user_id).then( user => {
                console.log("user: ");
                console.log(user);

                // Manager.find().sort({'appoint_num':1}).limit(1)
                // .then(managers=> {
                //     var manager = managers[0];
                //     console.log(manager);
                //
                //     manager.appoint_num++;
                //     manager.save();

                    var userPing = new UserPing({
                        user_id: user_id,
                        ping_id: ping.id,
                        sponsor: user_id,
                        name: req.body.name,
                        phone: req.body.phone,
                        sub_fee: product.sub_fee,
                        pay_state: 0,
                        ping_state: 0,
                        use_state: 0
                        // m_name: manager.name,
                        // m_phone: manager.phone,
                        // m_wx: manager.wx,
                        // m_email: manager.email,
                        // m_avatar: manager.avatar
                    })

                    userPing.save().then(aUserPing => {
                        console.log('aUserPing');
                        console.log(aUserPing);

                        Weixin.jsapipay({
                            user_ping_id: aUserPing.id,
                            attach: req.body.attach,
                            nonce_str: req.body.nonce_str,
                            sub_fee: aUserPing.sub_fee,
                            openid: user.openid,
                            description: "三一重卡订金",
                            timestamp: req.body.timestamp
                        }, function (pay_data) {
                            var prepay_id = pay_data.prepay_id;
                            userPing.form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                // })
            })
        })
    })
}

pingController.avatars = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    UserPing.find({
        ping_id: ping_id
    }).select('user_id').limit(5).populate({path:'user_id', select: 'avatar'}).then(ups=>{
	console.log(ups);
	var avatars = [];
	ups.forEach(up => {
		avatars.push(up.user_id.avatar);
	})
	res.send(avatars)
    })
};

// admin
pingController.addPing = function(req, res) {
    console.log(req.body);
    // res.send("get ping of id: " + req.params.ping);

    var ping = new Ping({
        product: req.body.product,
        total: req.body.total,
        finish_num: req.body.finish_num
    });

    ping.save(function (err, aPing) {
        res.send(aPing);
    })
};

module.exports = pingController;
