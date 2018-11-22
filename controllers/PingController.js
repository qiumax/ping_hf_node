var mongoose = require("mongoose");
var Activity = require("../models/Activity");
var Product = require("../models/Product");
var Ping = require("../models/Ping");
var CurrentPing = require('../models/CurrentPing');
var User = require("../models/User");
var UserPing = require("../models/UserPing");
var Manager = require("../models/Manager");
var Weixin = require("../models/Weixin");
var moment = require('moment');

var pingController = {};

var handle_waiting = false;

// wx
pingController.ping = function(req, res) {
    console.log(req.body.id);

    Ping.find({'_id':req.body.id}, function (err, ping) {
        res.send(ping);
    })
};

pingController.currentPing = function (req, res) {
    //console.log(req.body);

    CurrentPing.findOne().populate('ping').then(currentPing =>{
        if(currentPing){
            var ping = currentPing.ping;
            var ts = new Date().getTime()/1000;
            res.send({ping: ping, server_ts:ts});
        }
        else {
            console.log("暂无拼团信息");
        }
    })
}

/*
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
                        form_id: req.body.form_id,
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
                            userPing.pay_form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                })
            })
        })
    // })
}
*/

// 参与拼团
pingController.joinPing = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    var user_id = req.body.user_id;

    Activity.findOne().then(activity=>{
        var now = new Date().getTime()/1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now-activity.starttime));

        if(now < activity.starttime) {
            res.send({err: "活动暂未开始，请耐心等待"});
            return;
        }
        else if (now > activity.endtime) {
            res.send({err: "活动已结束，请参与下一次拼团活动"});
            return;
        }

        Ping.findById(ping_id).then( ping => {
            console.log("ping: ");
            console.log(ping);

            if(ping.state==2){
                res.send({err: "该团已结束，请返回拼团页面, 下拉刷新"});
                return;
            }

            Product.findById(ping.product_id).then( product => {
                console.log("product: ");
                console.log(product);

                User.findById(user_id).then( user => {
                    console.log("user: ");
                    console.log(user);

                    if(user.join_num>=3) {
                        res.send({err: "您拼团次数已达3次"});
                        return;
                    }

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
                        form_id: req.body.form_id,
                        sub_fee: product.sub_fee,
                        pay_state: 0,
                        ping_finish: 0,
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

                        if(user.join_num>=0) user.join_num++;
                        else user.join_num = 1;

                        if(!user.phone || user.phone.length==0) {
                            user.phone = req.body.phone
                        }

                        user.save();

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
                            userPing.pay_form_id = prepay_id;
                            userPing.save();

                            res.send(pay_data);
                        })
                    })
                    // })
                })
            })
        })
    })
}

pingController.avatars = function(req, res) {
    console.log(req.body);

    var ping_id = req.body.ping_id;
    UserPing.find({
        ping_id: ping_id,
        pay_state: 1
    }).select('user_id').limit(5).populate({path:'user_id', select: 'avatar'}).then(ups=>{
        console.log(ups);
        var avatars = [];
        ups.forEach(up => {
            avatars.push(up.user_id.avatar);
        })
        res.send(avatars)
    })
};

// 开始活动
pingController.startActivity = function () {
    console.log('check startActivity');

    CurrentPing.findOne().populate('ping')
        .then(currentPing=> {
            console.log("CurrentPing: ");
            console.log(currentPing);

            // 不存在
            if (!currentPing) {
                console.log("不存在");
                createFirstPing();
            }
        })
}

// 更新当前的Ping
pingController.updateCurrentPing = function () {
    console.log('updateCurrentPing');

    CurrentPing.findOne().populate('ping')
        .then(currentPing=>{
            console.log("CurrentPing: ");
            console.log(currentPing);

            // 不存在
            if(!currentPing) {
                console.log("不存在");
                // createPing();
            }
            else {
                var ping = currentPing.ping;

                if(handle_waiting) {
                    console.log("handle_waiting: " + handle_waiting);
                    return;
                }

                var now_date = new Date();
                var now_ts = new Date().getTime()/1000;

                // 已满
                if(ping.finish_num>=200 && ping.updated_at<(now_date-1*60*1000)) {
                    console.log("已满");
                    updatePing(ping);
                }
                // 已过期
                else if(ping.expire<(now_ts-1*60)) {
                    console.log("已过期");
                    updatePing(ping);
                }
            }
        })
}

createFirstPing = function() {
    console.log("Creating First Ping");

    var product_id = "5bda65617c65fac03d619993";

    Activity.findOne().then(activity=> {
        var now = new Date().getTime() / 1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now - activity.starttime));

        if(now >= activity.starttime && now <= (activity.starttime+30)) {
            console.log("开始第一个Ping");
            Product.findById(product_id).then(product => {
                console.log("product: ");
                console.log(product);

                var ts = new Date().getTime() / 1000;
                var expire = ts + product.expire * 86400;

                var ping = new Ping({
                    product_id: product_id,
                    product_name: product.name,
                    price_origin: product.price_origin,
                    price_bottom: product.price_bottom,
                    sponsor_bonus: product.sponsor_bonus,
                    less_minus: product.less_minus,
                    rules: product.rules,
                    finish_num: 0,
                    expire: expire,
                    sub_fee: product.sub_fee,
                    state: 1
                });

                ping.save().then(aPing => {

                    console.log("New Current Ping");
                    console.log(aPing);

                    var currentPing = new CurrentPing({
                        ping: aPing._id
                    })

                    CurrentPing.deleteMany({}, function (err) {
                        if (err) console.log(err);
                        currentPing.save().then(aCurrentPing => {
                            console.log("Current Ping saved: ");
                            console.log(aCurrentPing)
                        })
                    })
                })
            })
        }
    })
}

createPing = function() {
    console.log("Creating Ping");

    var product_id = "5bda65617c65fac03d619993";

    Activity.findOne().then(activity=> {
        var now = new Date().getTime() / 1000;
        console.log("now: " + now);
        console.log("距离活动开始还有: " + (now - activity.starttime));

        if(now < activity.starttime) {
            console.log("活动暂未开始");
            return;
        }
        else if (now > activity.endtime) {
            console.log("活动已结束");
            return;
        }

        Product.findById(product_id).then( product => {
            console.log("product: ");
            console.log(product);

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
                finish_num: 0,
                expire: expire,
                sub_fee: product.sub_fee,
                state: 1
            });

            ping.save().then(aPing => {

                console.log("New Current Ping");
                console.log(aPing);

                var currentPing = new CurrentPing({
                    ping: aPing._id
                })

                CurrentPing.deleteMany({},function (err) {
                    if (err) console.log(err);
                    currentPing.save().then(aCurrentPing => {
                        console.log("Current Ping saved: ");
                        console.log(aCurrentPing)
                    })
                })
            })
        })
    })
}

updatePing = function (ping) {
    // 更新ping
    ping.finish_time = new Date().getTime()/1000;
    ping.need_process = 1;
    ping.processed = 0;
    ping.state = 2;

    ping.save(function (err, aPing) {

        handle_waiting = true;

        console.log('ping state set to 2');
        console.log(aPing);

        setTimeout(function () {

            createPing();

            // 更新user_ping
            UserPing.find({
                ping_id: ping._id,
                pay_state: 1
            }).then(userpings => {
                for(var i=0; i<userpings.length; i++) {
                    var userping = userpings[i];
                    userping.ping_finish = 1;
                    userping.ping_finish_time = aPing.finish_time;
                    userping.finish_num = aPing.finish_num;
                    userping.need_process = 1;
                    userping.processed = 0;
                    userping.bonus = getBonus(aPing.rules, aPing.finish_num);
                    userping.save(function (err, aUserPing) {
                        User.findById(aUserPing.user_id).then(user=> {
                            // 模板消息
                            var data = {
                                touser: user.openid,
                                template_id: "0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w",
                                form_id: aUserPing.pay_form_id,
                                page: 'pages/mypings/index?user_ping_id='+aUserPing._id,
                                data: {
                                    keyword1: {value: aUserPing._id},
                                    keyword2: {value: "三一重卡"},
                                    keyword3: {value: aUserPing.finish_num + "人"},
                                    keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                    keyword5: {value: aUserPing.sub_fee / 100 + '元'},
                                    keyword6: {value: aUserPing.bonus + '元'},
                                    keyword7: {value: (aPing.price_origin - aUserPing.bonus) + '元'},
                                    keyword8: {value: "如有任何疑问，请致电: 4009995318"}
                                }
                            }
                            Weixin.sendTemplateMsg(data);
                        })
                    })
                }

                handle_waiting = false;
            })
        }, 5*60*1000)
    })
}

getBonus = function (rules, finish_num) {
    for(var i=rules.length-1; i>=0; i--) {
        if(finish_num >= rules[i].num) {
            return rules[i].bonus;
        }
    }
    return 0;
}

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
