/**
 * @namespace
 * @description
 * Client routing logic.
 * All the client URL pattern's should be registered with the router.
 *
 * On visiting a URL, if called {@link AdharaRouter.route}, it calls the registered view function,
 * which takes care of rendering the page.
 *
 * Any HTML element can be used as a router. For this purpose,
 *
 *
 * > Add this attribute `href="/url/to/be/navigated/to"` and this property `route` to any html element to make behave as a router.
 *
 * > By default routing happening this way will execute the view function even if the current URL is same as provided href.
 *
 * > In order to disable this behaviour, provide the attribute `data-force="false"`
 *
 * > In order to use {@link AdharaRouter.goBack} functionality provide `data-force="true"`. See example below.
 *
 * @example
 * //Registering
 * AdharaRouter.register("^/adhara/{{instance_id}}([0-9]+)/{{tab}}(details|tokens|history)$", function(instance_id, tab){
 *		console.log(instance_id, tab);
 *	    AdharaRouter.getPathParam("instance_id");  //Returns same as instance_id
 *	    AdharaRouter.getPathParam("tab");  //Returns same as tab
 * });
 *
 * //Navigating
 * AdharaRouter.navigateTo("/adhara/123412341234/details");
 *
 * //Routing - In case if URL is already set in address bar and not via Router, call this function to execute the registered view funciton.
 * this.route();
 *
 * //HTML Example
 *
 * <a href="/adhara/123412341234/tokens" />
 *
 * <button href="/adhara/123412341234/tokens" data-force="false">tokens</button>
 *
 * <div href="/adhara/123412341234/details" data-back="true"></div>
 *
 * */
let AdharaRouter = null;

(() => {

    "use strict";


    /**
     * @private
     * @member {Object<String, Object>}
     * @description
     * Stores all the registered URL's along with other view parameters.
     * */
    let registeredUrlPatterns = {};

    /**
     * @private
     * @member {Object<String, String>}
     * @description
     * Stores the current URL's search query parameters.
     * */
    let queryParams = {};

    /**
     * @private
     * @member {Object<String, String>}
     * @description
     * Stores the current URL's path variables.
     * */
    let pathParams = {};

    /**
     * @private
     * @member {Array<String>}
     * @description
     * Stores list of visited URL's
     * */
    let historyStack = [];

    /**
     * @private
     * @member {String|undefined}
     * @description
     * Stores current page URL.
     * */
    let currentUrl = undefined;

    /**
     * @private
     * @member {String|undefined}
     * @description
     * Stores current page name of the match found from registered URL patterns.
     * */
    let currPageName = undefined;

    /**
     * @private
     * @member {Object<String, Function|undefined>}
     * @description
     * Stores listeners that will be called on routing.
     * */
    let listeners = {};

    /**
     * @function
     * @private
     * @returns {String} Current window URL. IE compatibility provided by Hostory.js (protocol://domain/path?search_query).
     * */
    function getFullUrl(){
        return window.location.href;
        // return History.getState().cleanUrl;
    }

    /**
     * @function
     * @private
     * @returns {String} Full URL without search query (protocol://domain/path).
     * */
    function getBaseUrl(){
        return getFullUrl().split('?')[0];
    }

    /**
     * @function
     * @private
     * @returns {String} URL Path (path).
     * */
    function getPathName(){
        return AdharaRouter.transformURL(getBaseUrl().split('://')[1].substring(window.location.host.length));
    }

    /**
     * @function
     * @private
     * @returns {String} URL Path with search query (/path?search_query).
     * */
    function getFullPath(){
        return "/"+getFullUrl().split('://')[1].substring(window.location.host.length+1);
    }

    /**
     * @function
     * @private
     * @returns {String} Search query (search_query).
     * */
    function getSearchString(){
        return getFullUrl().split('?')[1];
    }

    /**
     * @function
     * @private
     * @param {String} new_path - URL path.
     * @returns {Boolean} Whether new_path matches with current URL path.
     * */
    function isCurrentPath(new_path){
        function stripSlash(path){
            if(path.indexOf('/') === 0){
                return path.substring(1);
            }
            return path;
        }
        return stripSlash(getFullPath()) === stripSlash(new_path);
    }

    /**
     * @function
     * @private
     * @description
     * Routes to the current URL.
     * Looks up in the registered URL patterns for a match to current URL.
     * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
     * Current page name will be set to the page name configured against view URL.
     * @returns {Boolean} Whether any view function is found or not.
     * */
    function matchAndCall(){
        let path = getPathName();
        let matchFound = false;
        loop(registeredUrlPatterns, function(regex, opts){
            if(!matchFound){
                regex = new RegExp(regex);
                if(regex.test(path)){
                    let params = regex.exec(path);
                    params.splice(0,1);
                    if(opts && opts.fn){
                        for(let [index, param] of params.entries()){
                            pathParams[opts.path_params[index]] = param;
                        }
                        currPageName = opts.page_name;
                        currentUrl = getFullUrl();
                        fetchQueryParams();
                        params.push(queryParams);
                        if(opts.fn.constructor instanceof AdharaView.constructor){
                            Adhara.onRoute(opts.fn, params);
                        }else{
                            opts.fn.apply(this, params);
                        }
                        matchFound = true;
                    }
                }
            }
        });
        return matchFound;
    }

    let curr_path;
    function updateHistoryStack(){
        if(curr_path){
            historyStack.push(curr_path);
        }
        curr_path = getFullPath();
    }
    updateHistoryStack();	//updating history stack with the entry URL

    /**
     * @private
     * @member {Boolean}
     * @description
     * This flag will be set to true when set to true, {@link Router.route} will not call the view function.
     * */
    let settingURL = false;

    /**
     * @function
     * @private
     * @description
     * Updates the {AdharaRouter~queryParams} with the current URL parameters
     * */
    function updateParams(){
        if(getFullUrl() !== currentUrl){
            currentUrl = getFullUrl();
            fetchQueryParams();
        }
    }

    /**
     * @function
     * @private
     * @description
     * Fetches the search query from current URL and transforms it to query param's.
     * The search query will be decoded and stored.
     * */
    function fetchQueryParams(){
        queryParams = {};
        if(getSearchString()){
            loop(getSearchString().split('&'), function(i, paramPair){
                paramPair = paramPair.split('=');
                queryParams[decodeURIComponent(paramPair[0])] = decodeURIComponent(paramPair[1]);
            });
        }else{
            queryParams = {};
        }
    }

    /**
     * @function
     * @private
     * @returns {String} URL constructed by current base URL and current Query Parameters.
     * */
    function generateCurrentUrl(){
        let url = getPathName();
        let params = [];
        loop(queryParams, function(key, value){
            params.push(key+"="+value);
        });
        if(params.length){
            url+="?"+params.join("&");
        }
        return url;
    }

    /**
     * @function
     * @private
     * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route.
     * @param {Object} route_options - Route options.
     * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
     * @see {@link RouteType}
     * */
    function _route(route_type, route_options){
        if(!route_type || route_type===this.RouteTypes.SET){
            this.setURL(generateCurrentUrl());
        }else if(route_type===this.RouteTypes.NAVIGATE){
            this.navigateTo(generateCurrentUrl(), (route_options && route_options.force)||false);
        }else if(route_type===this.RouteTypes.OVERRIDE){
            this.overrideURL(generateCurrentUrl());
        }else if(route_type===this.RouteTypes.UPDATE){
            this.updateURL(generateCurrentUrl());
        }
    }

    class Router{

        /**
         * @function
         * @private
         * @param {String} url - path
         * @description
         * modified the URL and returns the new value. Default transformer just returns the passed url/path.
         * */
        static transformURL(url){
            return url;
        }

        /**
         * @callback ViewFunction
         * @param {String} regexMatchedParams - matched regex params.
         * @param {String} searchQuery - search query parameters converted to object form.
         * @description
         * View callback function.
         * Parameters passed will be the regex matches and last parameter will be searchQueryParameters.
         * In case of more than 1 path regex match, ViewFunction will be called back with (match1, match2, ..., searchQuery)
         * */

        /**
         * @function
         * @static
         * @param {String} pattern - URL Pattern that is to be registered.
         * @param {String} page_name - Name of the view that is mapped to this URL.
         * @param {ViewFunction|Adhara} fn - View function that will be called when the pattern matches window URL.
         * */
        static register_one(pattern, page_name, fn){
            let path_params = [];
            let regex = /{{([a-zA-Z]*)}}/g;
            let match = regex.exec(pattern);
            while (match != null) {
                path_params.push(match[1]);
                match = regex.exec(pattern);
            }
            pattern = pattern.replace(new RegExp("\\{\\{[a-zA-Z]*\\}\\}", "g"), '');	//Removing all {{XYZ}}

            pattern = "^"+this.transformURL(pattern.substring(1));
            pattern = pattern.replace(/[?]/g, '\\?');   //Converting ? to \? as RegExp(pattern) dosen't handle that
            registeredUrlPatterns[pattern] = {
                page_name: page_name,
                fn: fn,
                path_params: path_params
            };
        }

        /**
         * @function
         * @static
         * @param {RegExp} regex - URL Pattern that is to be unregistered.
         * @description
         * Once unregistered, this URL regex will be removed from registered URL patterns and on hitting that URL,
         * will be routed to a 404.
         * */
        static deRegister(regex){
            registeredUrlPatterns[regex] = undefined;
        }

        /**
         * Bulk url conf
         * @typedef {Object} RouterURLConf
         * @property {string} url - url regex
         * @property {String} view_name - view name
         * @property {Function|class} view - view
         * */

        /**
         * @function
         * @static
         * @param {Array<RouterURLConf>} list - list of url configurations
         * @description
         * Register's urls in the list iteratively...
         * */
        static register(list){
            for(let conf of list){
                this.register_one(conf.url, conf.view_name, conf.view);
            }
        }

        /**
         * @function
         * @static
         * @param {String} listener_name - A unique name for the listener that will be useful for unregistering.
         * @param {Function} listener_fn - Listener function that to be called on routing. No arguments passed.
         * @description
         * All registered listeners will be called whenever routing happens via AdharaRouter
         * */
        static onRoute(listener_name, listener_fn){
            listeners[listener_name] = listener_fn;
        }

        /**
         * @function
         * @static
         * @param {String} listener_name - A unique name for the listener that will be useful for unregistering.
         * @description
         * De-reigsters the listener registered with this name.
         * */
        static offRouteListener(listener_name){
            listeners[listener_name] = undefined;
        }

        /**
         * @function
         * @static
         * @description
         * Routes to the current URL.
         * Looks up in the registered URL patterns for a match to current URL.
         * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
         * Current page name will be set to the page name configured against view URL.
         * */
        static route(){
            if(!settingURL){
                let matchFound = matchAndCall();
                if(!matchFound){
                    throw new Error('No route registered for this url : '+getPathName());
                }
            }else{
                settingURL = false;
            }
            loop(listeners, function(listener_name, listener_fn){ call_fn(listener_fn); });
        }

        /**
         * @function
         * @static
         * @returns {String} Current view name.
         * */
        static getCurrentPageName(){
            return currPageName;
        }

        /**
         * @function
         * @static
         * @returns Current URL.
         * */
        static getCurrentURL(){
            getFullPath();
        }

        /**
         * @function
         * @private
         * @param {URL|String} url - URL to be navigated to.
         * @description
         * navigates to the provided URL.
         * */
        static go(url){
            if (isCurrentPath(url)){
                return false;
            }
            history.pushState({__router__:true}, parent.document.title, url);
            // History.pushState({__router__:true}, parent.document.title, url);
            return true;
        }

        /**
         * @function
         * @static
         * @param {String} url - URL that to be updated.
         * @description Updates current URL in the path but doesn't call the view function. Appends current URL in History.
         * */
        static setURL(url){
            url = this.transformURL(url);
            settingURL = true;
            let gone = this.go(url);
            if(!gone){
                settingURL = false;
            }
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL that to be updated.
         * @description Replaces current URL in the path, and calls view function. No modifications made to History.
         * */
        static overrideURL(url){
            url = this.transformURL(url);
            history.replaceState({__router__:true}, parent.document.title, url);
            // History.replaceState({__router__:true}, parent.document.title, url);
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL that to be updated.
         * @description Replaces current URL in the path but doesn't call the view function. No modifications made to History.
         * */
        static updateURL(url){
            settingURL = true;
            this.overrideURL(url);
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL to be navigated to.
         * @param {Boolean} [force=false] - If true, will call the view function even if current URL is same as provided URL.
         * @description Navigates to the provided URL.
         * And if provided URL is same as current URL, view function will not be called unless force parameter is true.
         * */
        static navigateTo(url, force){
            url =this.transformURL(url);
            if (!isCurrentPath(url)) {
                let gone = this.go(url);
                if(gone){
                    fetchQueryParams();
                }
            } else if(force) {
                this.route();
            }
        }

        /**
         * @function
         * @static
         * @param {!String} backwardURL - backward URL to be navigated to.
         * @description Navigates to the backward URL by moving back in history.
         * In case if history is not available, Router will navigate to the backwardURL as if it is a new URL.
         * */
        static goBack(backwardURL){
            if(!backwardURL){
                backwardURL = historyStack.slice(-1)[0];
                if(!backwardURL){
                    return false;
                }
            }
            backwardURL =this.transformURL(backwardURL);
            let backwardIndex = historyStack.lastIndexOf(backwardURL);
            if(backwardIndex === -1){
                this.navigateTo(backwardURL);
            }else{
                let stackLen = historyStack.length;
                let negativeIndex = backwardIndex-stackLen;
                historyStack.splice(stackLen+negativeIndex, -negativeIndex);
                history.go(negativeIndex);
            }
        }

        /**
         * @function
         * @static
         * @returns {Array<String>} List of visited URL's that are routed by Router.
         * */
        static peekStack(){
            return historyStack.slice();
        }

        /**
         * @function
         * @static
         * @param {String} param_name - name of the query parameter for which value is required.
         * @returns {String} Value of the search parameter from current URL.
         * */
        static getQueryParam(param_name){
            updateParams();
            return queryParams[param_name];
        }

        static getPathParam(param_name){
            return pathParams[param_name];
        }

        /**
         * Route type
         * @typedef {String} RouteType
         * @see {@link Router.RouteTypes}
         * */

        /**
         * @function
         * @static
         * @param {!Object} new_params - Search Parameters to be added/updated.
         * @param {Boolean} [drop_existing=false] - Whether to completely replace existing search parameters or update with the new ones.
         * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route. {@link RouteType}
         * @param {Object} route_options - Route options.
         * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
         * @description
         * Updates the query parameters and navigates to the new URL based on route_type that is constructed with the new parameters.
         * */
        static updateQueryParams(new_params, drop_existing, route_type, route_options){
            if(!route_type){route_type = this.RouteTypes.NAVIGATE;}
            if(!Object.keys(new_params).length){
                return;
            }
            if(drop_existing){
                queryParams = new_params;
            }else{
                Object.assign(queryParams, new_params);
            }
            _route(route_type, route_options);
        }

        /**
         * @function
         * @static
         * @param {!Array} param_keys - Search Parameters to be dropped.
         * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route. {@link RouteType}
         * @param {Object} route_options - Route options.
         * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
         * @description
         * Drops provided keys if exist, updates the query parameters and navigates to the new URL that is constructed with the new parameters.
         * */
        static removeQueryParams(param_keys, route_type, route_options){
            loop(param_keys, function(idx, key){
                delete queryParams[key];
            });
            _route(route_type, route_options);
        }

        /**
         * @function
         * @static
         * @param {String} page_name - View name with which a URL pattern is registered.
         * @returns {RegExp} Pattern for which the provided page name is the page name.
         * */
        static getURLPatternByPageName(page_name){
            let matched_pattern = null;
            loop(registeredUrlPatterns, function(pattern, options){
                if(options.page_name === page_name){
                    matched_pattern = pattern;
                    return false;
                }
            });
            return matched_pattern;
        }

        static xxx(){
            return getPathName();
        }

    }

    //---------------------

    AdharaRouter = Router;

    /**
     * @description
     * setting current page name to undefined on moving to some other page that is not registered with router.
     * */
    window.onpopstate = () => {
        if(currPageName){
            let url_pattern = Router.getURLPatternByPageName(currPageName);
            if(!(url_pattern && new RegExp(url_pattern).test(getPathName()))){
                currPageName = undefined;
            }
        }
    };

    window.statechange = () => {
        let state = history.state;
        updateHistoryStack();
        pathParams = {};
        if(state !== undefined && state !== ''){
            let data = state.data;
            if(data.__router__ === true){
                this.route();
            }
        }
    };

    /**
     * @static
     * @readonly
     * @enum {RouteType}
     * @description Operations that can be performed on the entity
     * */
    AdharaRouter.RouteTypes = Object.freeze({
        /**
         * navigate to the url and call the view function. This will add current URL to History.
         * */
        NAVIGATE : "navigate",
        /**
         * override the current url and call the view function. This will not change History.
         * */
        OVERRIDE : "override",
        /**
         * Just update the URL. Adds current URL to History. View function will not be called.
         * */
        SET : "set",
        /**
         * Overrides the current URL. No modifications made to History. View function will not be called.
         * */
        UPDATE : "update"
    });


    AdharaRouter.enableAllAnchors = true;

    AdharaRouter.listen = function(){
        /**
         * Listening to elements with route property in DOM.
         * If it has href attribute, preventing default event and proceeding with SdpRouting
         * */

        function hasAttribute(elem, attribute_name) {
            return elem.hasAttribute(attribute_name);
        }

        jQuery(document).on("click", "a", function(e){
            if ((AdharaRouter.enableAllAnchors || hasAttribute(e.target, "route"))) {
                let url = this.getAttribute('href').trim();
                if (url.indexOf('javascript') !== -1) {
                    return;
                }
                if (url) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                let go_back = this.getAttribute("data-back");
                let force = this.getAttribute("data-force") !== "false";
                if (go_back) {
                    return AdharaRouter.goBack(url);
                }
                AdharaRouter.navigateTo(url, force);
            }
        });

        /*document.addEventListener('click', function (e) {
            if(e.target.nodeName === "A" && ( AdharaRouter.enableAllAnchors || hasAttribute(e.target, "route") ) ){
                let url = e.target.getAttribute('href').trim();
                if(url.indexOf('javascript') !== -1){return;}
                if(url){
                    e.preventDefault();
                    e.stopPropagation();
                }
                let go_back = e.target.getAttribute("data-back");
                let force = e.target.getAttribute("data-force") !== "false";
                if(go_back){ return AdharaRouter.goBack(url); }
                AdharaRouter.navigateTo(url, force);
            }

        }, false);*/
    }
    
    //---------------------



})();