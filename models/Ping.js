var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserPing = require('./UserPing');
var User = require('./User');
var Weixin = require("./Weixin");
// var Manager = require('./Manager');

var PingSchema = new Schema({
    product_id: String,
    product_name: String,
    price_origin: Number,
    price_bottom: Number,
    sponsor_bonus: Number,
    less_minus: Number,
    rules: [Map],
    total: Number,
    finish_num: Number,
    expire: Number,
    sub_fee: Number,
    sponsor: String,
    sponsor_name: String,
    sponsor_avatar: String,
    state: Number,
    need_refund: Boolean,
    refunded: Boolean,
    need_process: Boolean,
    processed: Boolean,
    bonus: Number
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

// 更新已满的Ping
PingSchema.statics.updateFullPing = function () {
    console.log('updatePingStatus');
    var now = new Date();

    this.$where('this.finish_num >= this.total && this.state == 1')
    .where('updated_at').lt(now-5*60*1000)
    .then(pings => {
        if(pings.length>0) {
            console.log('updating pings: ');
            console.log(pings);

            pings.forEach(function (ping) {
                // 更新ping
                ping.need_process = 1;
                ping.processed = 0;
                ping.state = 2;

                ping.save(function (err, aPing) {
                    console.log('ping state set to 2');

                    // 更新user_ping
                    UserPing.find({
                        ping_id: ping._id
                    }).then(userpings => {
                        for(var i=0; i<userpings.length; i++) {
                            var userping = userpings[i];
                            userping.ping_finish = 1;
                            userping.need_process = 1;
                            userping.processed = 0;
                            userping.bonus = getMaxBonus(aPing.rules);
                            userping.save(function (err, aUserPing) {
                                User.findById(aUserPing.user_id).then(user=> {
                                    // 模板消息
                                    var data = {
                                        touser: user.openid,
                                        template_id: "0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w",
                                        form_id: aUserPing.form_id,
                                        data: {
                                            keyword1: {value: aUserPing._id},
                                            keyword2: {value: "三一重卡"},
                                            keyword3: {value: aUserPing.finish_num},
                                            keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                            keyword5: {value: aUserPing.sub_fee / 100 + '元'},
                                            keyword6: {value: (aPing.price_origin - aUserPing.bonus) + '元'},
                                            keyword7: {value: aUserPing.bonus + '元'},
                                            keyword8: {value: "如有任何疑问，请致电: 4009995318"}
                                        }
                                    }
                                    Weixin.sendTemplateMsg(data);
                                })
                            })
                        }
                    })
                })
            })
        }
        else {
            console.log('nothing to update');
        }
    })
}

// 更新过期的Ping
PingSchema.statics.updateExpiredPing = function () {
    console.log('updateExpiredPing');
    var now = new Date();

    this.$where('this.finish_num < this.total && this.state == 1')
        .where('expire').lt(now-5*60)
        .then(pings => {
            if(pings.length>0) {
                console.log('updating pings: ');
                console.log(pings);

                pings.forEach(function (ping) {
                    // 更新ping
                    ping.state = 2;
                    if(ping.finish_num < 3) {
                        ping.need_refund = 1;
                        ping.refunded = 0;

                        ping.save(function (err, aPing) {
                            // 更新user_ping
                            UserPing.find({
                                ping_id: aPing._id
                            }).then(userpings => {
                                for(var i=0; i<userpings.length; i++) {
                                    var userping = userpings[i];
                                    userping.ping_finish = 1;
                                    userping.need_refund = 1;
                                    userping.refunded = 0;
                                    userping.save(function (err, aUserPing) {
                                        User.findById(aUserPing.user_id).then(user=>{
                                            // 模板消息
                                            var data = {
                                                touser: user.openid,
                                                template_id: "mBymF912Fr7T_JAvqignEzbmwnbbSoK_Ngt73i1CFVU",
                                                form_id: aUserPing.form_id,
                                                data: {
                                                    keyword1: {value: "三一重卡"},
                                                    keyword2: {value: aUserPing.finish_num + "人"},
                                                    keyword3: {value: "参团人数不足3人"},
                                                    keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                                    keyword5: {value: aUserPing._id},
                                                    keyword6: {value: "如有任何疑问，请致电: 4009995318"}
                                                }
                                            }
                                            Weixin.sendTemplateMsg(data);
                                        })
                                    })
                                }
                            })
                        })
                    }
                    else {
                        ping.need_process = 1;
                        ping.processed = 0;

                        ping.save(function (err, aPing) {
                            // 更新user_ping
                            UserPing.find({
                                ping_id: aPing._id
                            }).then(userpings => {
                                for(var i=0; i<userpings.length; i++) {
                                    var userping = userpings[i];
                                    userping.ping_finish = 1;
                                    userping.need_process = 1;
                                    userping.processed = 0;
                                    userping.bonus = getBonus(aPing.rules, aPing.finish_num);
                                    userping.save(function (err, aUserPing) {
                                        // 模板消息
                                        var data = {
                                            touser: user.openid,
                                            template_id: "0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w",
                                            form_id: aUserPing.form_id,
                                            data: {
                                                keyword1: {value: aUserPing._id},
                                                keyword2: {value: "三一重卡"},
                                                keyword3: {value: aUserPing.finish_num},
                                                keyword4: {value: moment().format('YYYY-MM-DD HH:mm:ss')},
                                                keyword5: {value: aUserPing.sub_fee/100 + '元'},
                                                keyword6: {value: (aPing.price_origin-aUserPing.bonus) + '元'},
                                                keyword7: {value: aUserPing.bonus + '元'},
                                                keyword8: {value: "如有任何疑问，请致电: 4009995318"}
                                            }
                                        }
                                        Weixin.sendTemplateMsg(data);
                                    });
                                }
                            })
                        })
                    }
                })
            }
            else {
                console.log('nothing to update');
            }
        })
}

getMaxBonus = function (rules) {
    var max = 0;
    for(var i=0; i<rules.length; i++) {
        if(max < rules[i]) {
            max = rules[i];
        }
    }
    return max;
}

getBonus = function (rules, finish_num) {
    for(var i=rules.length-1; i>=0; i--) {
        if(finish_num >= rules[i].num) {
            return rules[i].bonus;
        }
    }
    return 0;
}

module.exports = mongoose.model('Ping', PingSchema, 'pings');