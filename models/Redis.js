var redis = require("redis");

module.exports = redis.createClient(6379, '172.30.0.4');