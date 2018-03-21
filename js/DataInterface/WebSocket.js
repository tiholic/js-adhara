class WebSocket{

    constructor(web_socket_config){
        let socket = this.socket = io.connect(web_socket_config.url||"/socket", {
            resource: web_socket_config.resource || "/"
        });
        socket.on('connect_failed', data => console.log('connect_failed', data));
        socket.on('connecting', data => console.log('connecting', data));
        socket.on('disconnect', data => console.log('disconnect', data));
        socket.on('error', reason => console.log('error', reason));
        socket.on('reconnect_failed', data => console.log('reconnect_failed', data));
        socket.on('reconnect', data => console.log('reconnect', data));
        socket.on('reconnecting', data => console.log('reconnecting', data));
    }

    listen(){   // instance scope method
        let config = Adhara.app.config;
        for(let app_conf in config){
            if(config.hasOwnProperty(app_conf)){
                let data_config = Adhara.configUtils.getDataConfig(app_conf);
                if(!data_config.socket_tag) continue;
                this.socket.on(data_config.socket_tag, (data) => {
                    Adhara.configUtils.getProcessor(app_conf)(data);
                });
            }
        }
    }

}

WebSocket.listen = (web_socket_config) => { // static scope method
    let ws = new WebSocket(web_socket_config);
    ws.listen();
};