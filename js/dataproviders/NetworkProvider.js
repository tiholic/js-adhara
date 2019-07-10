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

    _handleSE(xhr, success_fn, error_fn){
        if(xhr.status >= 400) {
            if( xhr.readyState === 0 && xhr.status === 0 && error_fn.err === ""){
                error_fn.err = "Unable to connect to server";
            }
            error_fn(xhr, error_fn.err || "error", xhr.responseText);
            //    return Toast.error(error_fn.err+"\n"+x.responseText);
        }else{
            success_fn(xhr.responseText, "success", xhr);
        }
    }

    ajax(o) {
        if(o.method !== "get" && o.data instanceof Object){
            if(!Object.keys(o.data).length){
                delete o.data;
            } else {
                o.data = JSON.stringify(o.data);
            }
        }
        /*if(o.method === "get" || o.method === "patch" || o.method === "post") { if (o.method === "get") { /!*if (o.data) { o.data = {data: o.data}; }*!/ } }*/
        if(o.method !== "get" && o.method !== "delete"){
            o.headers['Content-Type'] = 'application/json';
        }
        jQuery.ajax(o);
        // let jqXHR = jQuery.ajax(o);
        // o.abort = jqXHR.abort;
    }

    multipart(o) {
        let xhr = new XMLHttpRequest();
        xhr.open(o.method.toUpperCase(), o.url);
        delete o.headers['Content-Type'];
        loop(o.headers, function (header, value) {
            xhr.setRequestHeader(header, value)
        });
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status >= 400) {
                    o.error(xhr, "error", xhr.responseText);
                }else{
                    o.success(xhr.responseText, "success", xhr);
                }
            }
        };
        xhr.send(o.data);
        // o.abort = xhr.abort;
    }

    async send(o){
        return new Promise((resolve, reject)=>{
            o.success = (d,s,x) => {
                this._handleSE(x, () => resolve([d, x]), () => reject([d, x]));
            };
            o.error = (x,s,e) => {
                let err_fn = () => reject([e, x]);
                err_fn.err = e;
                this._handleSE(x, null, err_fn);
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

    postResponseIntercept(method, url, data, response, xhr){
        //    Override if required
    }

    _postResponseIntercept(method, url, data, response, xhr){
        this.postResponseIntercept(method, url, data, response, xhr);
    }

    postErrorResponseIntercept(method, url, data, response, xhr){
        //    Override if required
    }

    _postErrorResponseIntercept(method, url, data, response, xhr){
        this.postErrorResponseIntercept(method, url, data, response, xhr);
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
            this._postResponseIntercept(method, url, null, r, x);
            return this.formatResponse(r);
        } catch (e) {
            console.log("API errored out::", e);
            this._postErrorResponseIntercept(method, url, data, e[0], e[1]);
            throw(e[0]);
        }
    }

    async get(url, data, options){
        if(data && typeof data === "object"){
            data = Object.entries(data).map(([k, v]) => `${k}=${v}`).join("&");
        }
        return await this._send(NetworkMethods.GET, url, data, options);
    }

    async post(url, data, options){
        return await this._send(NetworkMethods.POST, url, data, options);
    }

    async put(url, data, options){
        return await this._send(NetworkMethods.PUT, url, data, options);
    }

    async patch(url, data, options){
        return await this._send(NetworkMethods.PATCH, url, data, options);
    }

    async delete(url, data, options){
        return await this._send(NetworkMethods.DELETE, url, data, options);
    }

}
