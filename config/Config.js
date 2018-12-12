var config = {

    project_name: 'ping',
     
    mongodb: {
        url: 'mongodb://sa_ping:wending0304@172.30.0.5:27017/ping'
    },
    
    redis: {
        host: '172.30.0.4',
        port: 6379,
        pwd: 'wending0304',
        ttl: 3600
    },
    
    wx: {
        appid: 'wx26b5571fa5d85590',
        secret: '6d7b0e92d2b8de2a61139cdd9eb605b9',
        key: 'pYwUbTaaWnTLOpInl2HtnJA7x1v9UVWC',
        mchid: '1518016601',
        notify_url: 'https://ping.quxunbao.cn/wx/payNotify',
    
        ping_success_tmp_id: '0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w'
    },
 
    ping: {
        product_id: '5bda65617c65fac03d619993'
    },
 
    ping_schedule_time_interval: 2*60,
    ip: '94.191.48.58',
    
    
    // ping-test
    /*
    project_name: 'ping-test',
    
    mongodb: {
        url: 'mongodb://sa_ping:wending0304@localhost:27017/ping'
    },
    
    redis: {
        host: 'localhost',
        port: 6379,
        pwd: 'wending0304',
        ttl: 3600
    },
    
    wx: {
        appid: 'wx26b5571fa5d85590',
        secret: '6d7b0e92d2b8de2a61139cdd9eb605b9',
        key: 'pYwUbTaaWnTLOpInl2HtnJA7x1v9UVWC',
        mchid: '1518016601',
        notify_url: 'https://ping-test.quxunbao.cn/wx/payNotify',
        
        ping_success_tmp_id: '0Ismn4fy3jEsr_fR79DT6hErBvYD-wL0Pl_o_1NjO6w'
    },
    
    ping: {
        product_id: '5bda65617c65fac03d619993'
    },
    
    ping_schedule_time_interval: 2*60,
    
    ip: '94.191.48.58',
    */
}

module.exports = config