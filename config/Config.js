var config = {

    project_name: 'ping-xy',
     
    mongodb: {
        url: 'mongodb://sa_ping_xy:wending0304@172.17.0.7:27017/ping_xy'
    },
    
    redis: {
        host: '172.17.0.15',
        port: 6379,
        pwd: 'Wd03041985!',
        ttl: 3600
    },
    
    wx: {
        appid: 'wxe3d56102bbe38265',
        secret: '865f64f74127d4dd20b6a63ccf27a102',
        key: 'cPKF0NbDMNu6Iz1qLG5WUektx5DhfK4r',
        mchid: '1524816251',
        notify_url: 'https://ping-xy.quxunbao.cn/wx/payNotify',
    
        ping_success_tmp_id: 'Q0YI0q4OcIhYQ-tQLm4C0kKEJtQUVaJKnps9mKNlTpM'
    },
 
    ping: {
        product_id: '5bda65617c65fac03d619993'
    },
 
    ping_schedule_time_interval: 2*60,
    ip: '212.64.93.183',
    
    
}

module.exports = config
