let NetworkMethods = {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete",
    PATCH: "patch"
};


class NetworkProvider {

    get baseURL(){
        return "/";
    }

    formatResponse(data) {
        return data;
    }

    getCookie (cookie_name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, cookie_name.length + 1) === cookie_name+'=') {
                    cookieValue = decodeURIComponent(cookie.substring(cookie_name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    extractResponse(response) {
        try {
            return this.formatResponse(JSON.parse(response));
        } catch (e) {
            return response;
        }
    }

    get headers() {
        return {
            "Content-Type": "application/json"
        };
    }

    isFullURL(link) {
        return link.startsWith("http://")||link.startsWith("https://")||link.startsWith("//");
    }

    formatURL(url){
        if(this.isFullURL(url)){
            return url;
        }
        let baseURL = this.baseURL;
        if(baseURL.endsWith("/")){
            baseURL = baseURL.substr(0, baseURL.length-1);
        }
        if(url.startsWith("/")){
            url = url.substr(1);
        }
        return baseURL + '/' + url;
    }

    handleSuccess(fns, fne, d, s, x){  //data, success, xhr
        if(s === "nocontent"){
            //DO NOTHING
            return;
        }
        if(s === "success") {
            if (x.getResponseHeader('Content-Disposition')) {
                return call_fn(fns, d, x);
            } else {
                if(typeof d === "string"){
                    try{
                        d = JSON.parse(d);
                    }catch(e){ /*DO NOTHING*/ }
                }
                return call_fn(fns, d, x);
            }
        }
        call_fn(fne, d, x);
    }

    handleFailure(fne, x, s, e){  //xhr, status, error
        if( x.readyState === 0 && x.status === 0 && e === ""){
            e = "Unable to connect to server";
        }
        call_fn(fne, e, x);
        // if(x.responseText){
        //     return Toast.error(e+"\n"+x.responseText);
        // }
        // Toast.error(e);
    }

    ajax(o) {
        if(o.type !== "get" && o.data instanceof Object){
            if(!Object.keys(o.data).length){
                delete o.data;
            } else {
                o.data = JSON.stringify(o.data);
            }
        }
        /*if(o.type === "get" || o.type === "patch" || o.type === "post") { if (o.type === "get") { /!*if (o.data) { o.data = {data: o.data}; }*!/ } }*/
        if(o.type !== "get" && o.type !== "delete"){
            o.headers['Content-Type'] = 'application/json';
        }
        jQuery.ajax(o);
    }

    multipart(o) {
        let xhr = new XMLHttpRequest();
        xhr.open(o.type.toUpperCase(), o.url);
        loop(o.headers, function (header, value) {
            xhr.setRequestHeader(header, value)
        });
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status === 200) {
                    o.success(xhr.responseText, "success", xhr);
                }else{
                    o.error(xhr, "error", xhr.responseText);
                }
            }
        };
        xhr.send(o.data);
    }

    async send(o){
        return new Promise((resolve, reject)=>{
            o.url = this.formatURL(o.url);
            o.success = (d,s,x) => {
                this.handleSuccess((d, s)=>{
                    resolve([d, x]);
                },(d, x)=>{
                    reject([d, x]);
                },d,s,x,o.handleError,o.successMessage);
            };
            o.error = (x,s,e) => {
                this.handleFailure((e, x)=>{
                    reject([e, x]);
                },x,s,e);
            };
            if(o.data instanceof FormData){
                this.multipart(o);
            }else {
                this.ajax(o);
            }
        });
    }

    preFlightIntercept(method, url, data) {
        //    Override if required
    }

    _preFlightIntercept(method, url, data) {
        this.preFlightIntercept(method, url, data);
    }

    postResponseIntercept(method, url, data, response){
        //    Override if required
    }

    _postResponseIntercept(method, url, data, response){
        this.postResponseIntercept(method, url, data, response);
    }

    async _send(method, url, data, options){
        url = this.formatURL(url);
        this._preFlightIntercept(method, url, null);
        try {
            let [r, x] = await this.send(Object.assign({
                url,
                headers: this.headers,
                method,
                data
            }, options));
            this._postResponseIntercept(method, url, null, r);
            return this.extractResponse(r);
        } catch (e) {
        //    TODO handle
            console.log("API errored out::", e);
        }
    }

    async get(url, data, options){
        return await this._send(NetworkMethods.GET, url, data, options);
    }

    async post(url, data, options){
        return await this._send(NetworkMethods.POST, url, data, options);
    }

    async put(url, data, options){
        return await this._send(NetworkMethods.PUT, url, data, options);
    }

    async delete(url, options){
        return await this._send(NetworkMethods.DELETE, url, data, options);
    }

}
