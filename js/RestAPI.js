/**
 * Created by rohit on 25/5/16.
 */

let RestAPI = {};

(function(){

    RestAPI.error_codes = {
        not_found : 404
    };


    RestAPI.getCookie = function (name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === name+'=') {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    RestAPI.getHeaders = function () {
        return {
            'X-CSRFToken' : RestAPI.getCookie('csrftoken')
        };
    };

    RestAPI.handle_api_success = function(fns, fne, d, s, x, toastFailure, successMessage){  //data, success, xhr
        if(s === "nocontent"){
            //DO NOTHING
            return;
        }
        if(s === "success") {
            if (x.getResponseHeader('Content-Disposition')) {
                return call_fn(fns, d, s, x)
            } else {
                if(typeof d === "string"){
                    d = JSON.parse(d);
                }
                if (d.status === "success") {
                    if (successMessage && successMessage !== "") {
                        toastr.success(successMessage);
                    }
                    return call_fn(fns, d.data);
                }
            }
        }
        if(toastFailure !== false) {
            toastr.error(d.message);
        }
        call_fn(fne, d.message);
    };

    RestAPI.handle_api_failure = function(fne, x, s, e){  //xhr, status, error
        if( x.readyState === 0 && x.status === 0 && e === ""){
            e = "Unable to connect to server";
        }
        call_fn(fne, e);
        if(x.responseText){
            return toastr.error(e+"\n"+x.responseText);
        }
        toastr.error(e);
    };

    RestAPI.post = function(o){
        o.type = "post";
        send(o);
    };

    RestAPI.get = function(o){
        o.type = "get";
        send(o);
    };

    RestAPI.put = function(o){
        o.type = "put";
        send(o);
    };

    RestAPI.patch = function(o){
        o.type = "patch";
        send(o);
    };

    RestAPI.delete = function(o){
        o.type = "delete";
        send(o);
    };

    function formatURL(url){
        let base = Adhara.app?Adhara.app.base_api_url?Adhara.app.base_api_url:"/":"/";
        if(base.indexOf("/")+1 !== base.length){
            base += "/";
        }
        if(url.indexOf("/") === 0){
            url = url.substring(1);
        }
        return base+url;
    }

    function send(o){
        o.url = formatURL(o.url);
        let fns = o.success;
        let fnf = o.failure;
        o.success = function(d,s,x){RestAPI.handle_api_success(fns,fnf,d,s,x,o.handleError,o.successMessage);};
        o.error = function(x,s,e){RestAPI.handle_api_failure(fnf,x,s,e);};
        o.headers = RestAPI.getHeaders();
        if(o.data instanceof FormData){
            multipart(o);
        }else {
            ajax(o);
        }
    }

    function ajax(o) {
        if(o.data instanceof Object){
            if(!Object.keys(o.data).length){
                delete o.data;
            } else {
                o.data = JSON.stringify(o.data);
            }
        }
        if(o.type === "get" || o.type === "patch" || o.type === "post") {
            if (o.type === "get") {
                if (o.data) {
                    o.data = {data: o.data};
                }
            }
        }
        o.headers['Content-Type'] = 'application/json';
        jQuery.ajax(o);
    }

    function multipart(o) {
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
                    o.error(xhr, "error", "Multipart upload error");
                }
            }
        };
        xhr.send(o.data);
    }

})();
