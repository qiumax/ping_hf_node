var mongoose = require("mongoose");
var Ping = require("../models/Ping");
var User = require("../models/User");
var RedPack = require("../models/Redpack");
var UserPing = require("../models/UserPing");
var Weixin = require("../models/Weixin");

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

//followers
userController.userfollowers = function (req, res) {
    console.log(req.body);
    var fields;
    var user_id = req.body.user_id;
    var next = req.body.next;

    var followers = [];

    if(next == 0)
        fields = ['name','avatar','followers'];
    else
        fields = ['user_id', 'name', 'avatar', 'followers'];
    if(user_id){
        User.findOne({'_id':user_id}, function (err, user){
            if(user && user.followers && user.followers.length>0)
            {
                var project;
                if(next == 0){
                    project ={
                        _id:0,
                        name:1,
                        avatar:1,
                        follower_num:{$size:"$followers"}
                    }
                }
                else{
                    project ={
                        _id:0,
                        user_id:"$_id",
                        name:1,
                        avatar:1,
                        follower_num:{$size:"$followers"}
                    }
                }
                var arr =new Array();
                user.followers.forEach(function(item,index){
                    arr.push(mongoose.Types.ObjectId(item));
                })
                console.log(arr);
                User.aggregate(
                    [
                        {
                            $match:{_id:{$in:arr}}
                        },
                        {
                            $project:project
                        }
                    ]
                ).then(function(followers){
                    user.user_id = user._id;
                    user.follower_num = user.followers.length;
                    delete user.followers;
                    delete user._id;
                    RedPack.aggregate(
                        [{
                            $match: {
                                to: user_id,
                                redpack_sent: 1
                            }
                        },
                            {
                                $group:{
                                    _id:user_id,
                                    total:{$sum:"$amount"}
                                }
                            }
                        ]
                    ).then(function (rp){
                        console.log("rp----");
                        console.log(rp);
                        if(rp && rp[0]){
                            user.redpack_total = rp[0].total;
                        }
                        else
                        {
                            user.redpack_total = 0;
                        }
                        console.log(user);
                        console.log(followers);
                        res.send({user:user,followers:followers})
                    });

                })


            }
            else{
                user.follower_num = 0;
                delete user.followers;
                res.send({user:user,followers:followers});
            }
        })

    }

}


userController.userpacks = function (req, res) {
    var user_id = req.body.user_id;
    console.log('userid---');
    console.log(user_id);
    if (user_id) {
        RedPack.find({redpack_sent: 1, to_user_id: user_id}, ["level", "create_at", "amount"])
            .then(function (redpacks) {
                console.log(redpacks);
                res.send({redpacks: redpacks});
            });
    }
}

userController.wxacode = function (req, res) {
    console.log(req.body);
    var scene = req.body.scene;
    Weixin.getWXACode(scene, function (body, err) {
        res.send(body);
    })
}



// admin

module.exports = userController;
