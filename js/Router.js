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
     * @member {String}
     * @description
     * Stores base URI for regex matches
     * */
    let baseURI = "";

    let defaultTitle = document.title;

    /**
     * @private
     * @member {String}
     * @description
     * App Name to be used as first half of document title
     * */
    let appName = "";

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
     * @member {RouterURLConf}
     * @description
     * Stores route which matches with the current URL against registered URL patterns.
     * */
    let currentRoute = undefined;

    /**
     * @private
     * @member {Object<String, Function|undefined>}
     * @description
     * Stores listeners that will be called on routing.
     * */
    let listeners = {};

    /**
     * @typedef {Function} AdharaRouterMiddleware
     * @param {Object} params - url parameters
     * @param {String } params.view_name - name of the page that is being routed to
     * @param {String} params.path - path that is being routed to
     * @param {Object} params.query_params - url query parameters
     * @param {Object} params.path_params - url path parameters
     * @param {Function} route - Proceed with routing after making necessary checks in middleware
     * */

    /**
     * @private
     * @member {Array<AdharaRouterMiddleware>}
     * @description
     * Stores middlewares that will be called on routing.
     * */
    let middlewares = [];

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
        return AdharaRouter.transformURL(window.location.pathname);
    }

    /**
     * @function
     * @private
     * @returns {String} URL Path with search query (/path?search_query).
     * */
    function getFullPath(){
        return getPathName()+window.location.search+window.location.hash;
        // return "/"+getFullUrl().split('://')[1].substring(window.location.host.length+1);
    }

    /**
     * @function
     * @private
     * @returns {String} Search query (search_query).
     * */
    function getSearchString(){
        return window.location.search.substring(1);
    }

    /**
     * @function
     * @private
     * @returns {String} Hash (text after `#` from the url).
     * */
    function getHash(){
        return window.location.hash.substring(1);
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

    function callMiddlewares(params, proceed){
        let i=0;
        (function _proceed(){
            let middleware_fn = middlewares[i++];
            if(middleware_fn){
                call_fn(middleware_fn, params, _proceed);
            }else{
                proceed();
            }
        })();
    }

    /**
     * @function
     * @private
     * @description matches the current URL and returns the configuration, path and params
     * @returns Object
     * */
    function matchUrl(){
        let path = getPathName();
        let matchFound = false;
        for(let regex in registeredUrlPatterns){
            if(registeredUrlPatterns.hasOwnProperty(regex) && !matchFound) {
                let formed_regex = new RegExp(regex);
                if (formed_regex.test(path)) {
                    matchFound = true;
                    let opts = registeredUrlPatterns[regex];
                    let params = formed_regex.exec(path);
                    return {opts, path, params, meta: opts.meta};
                }
            }
        }
    }

    /**
     * @function
     * @private
     * @description
     * Routes to the current URL.
     * Looks up in the registered URL patterns for a match to current URL.
     * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
     * Current view name will be set to the view name configured against view URL.
     * @returns {Boolean} Whether any view function is found or not.
     * */
    function matchAndCall(){
        let matchOptions = matchUrl();
        if(matchOptions){
            let {opts, path, params, meta} = matchOptions;
            params.splice(0,1);
            if(opts && opts.fn){
                let _pathParams = {};
                for(let [index, param] of params.entries()){
                    _pathParams[opts.path_param_keys[index]] = param;
                }
                currentRoute = opts;
                //Setting current routing params...
                pathParams = _pathParams;
                currentUrl = getFullUrl();
                fetchQueryParams();

                callMiddlewares({
                    view_name: opts.view_name,
                    path: path,
                    query_params: getQueryParams(),
                    path_params: _pathParams
                }, () => {
                    params.push(queryParams);
                    document.title = [(appName || defaultTitle), meta.title].filter(_=>_).join(" | ");
                    if(opts.fn.constructor instanceof AdharaView.constructor){
                        Adhara.onRoute(opts.fn, params);
                    }else{
                        opts.fn.apply(this, params);
                    }
                });
            }
        }
        return !!matchOptions;
    }

    let curr_path;
    function updateHistoryStack(){
        if(curr_path){
            historyStack.push(curr_path);
        }
        curr_path = getFullPath();
    }

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
     * Fetches the search query from current URL and transforms it to query param's object.
     * @returns {Object<String, String>} The search query will be decoded and returned as an object.
     * */
    function getQueryParams(){
        let qp = {};
        if(getSearchString()){
            loop(getSearchString().split('&'), function(i, paramPair){
                paramPair = paramPair.split('=');
                qp[decodeURIComponent(paramPair[0])] = decodeURIComponent(paramPair[1]);
            });
        }else{
            qp = {};
        }
        return qp;
    }

    /**
     * @function
     * @private
     * @description
     * Fetches the search query from current URL and transforms it to query param's.
     * The search query will be decoded and stored.
     * */
    function fetchQueryParams(){
        queryParams = getQueryParams();
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
            params.push(encodeURIComponent(key)+"="+encodeURIComponent(value));
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
        if(!route_type || route_type===AdharaRouter.RouteTypes.SET){
            AdharaRouter.setURL(generateCurrentUrl());
        }else if(route_type===AdharaRouter.RouteTypes.NAVIGATE){
            AdharaRouter.navigateTo(generateCurrentUrl(), (route_options && route_options.force)||false);
        }else if(route_type===AdharaRouter.RouteTypes.OVERRIDE){
            AdharaRouter.overrideURL(generateCurrentUrl());
        }else if(route_type===AdharaRouter.RouteTypes.UPDATE){
            AdharaRouter.updateURL(generateCurrentUrl());
        }
    }

    const STATE_KEY = "__adhara_router__";

    class Router{

        /**
         * @function
         * @private
         * @param {String} url - path
         * @description
         * modified the URL and returns the new value. Default transformer just returns the passed url/path.
         * */
        static transformURL(url){
            if(url.startsWith(baseURI)){
                return url;
            }
            return baseURI+url;
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
         * @param {String} view_name - Name of the view that is mapped to this URL.
         * @param {ViewFunction|Adhara} fn - View function that will be called when the pattern matches window URL.
         * @param {Object} meta - Route meta which can be accessible for current route. This can be used for miscellaneous operations like finding which tab to highlight on a sidebar.
         routes         * */
        static register_one(pattern, view_name, fn, meta){
            let path_param_keys = [];
            let regex = /{{([a-zA-Z$_][a-zA-Z0-9$_]*)}}/g;
            let match = regex.exec(pattern);
            while (match != null) {
                path_param_keys.push(match[1]);
                match = regex.exec(pattern);
            }
            pattern = pattern.replace(new RegExp("\\{\\{[a-zA-Z$_][a-zA-Z0-9$_]*\\}\\}", "g"), '');
            //Removing all {{XYZ}} iff, XYZ matches first character as an alphabet ot $ or _

            pattern = "^"+this.transformURL(pattern.substring(1));
            pattern = pattern.replace(/[?]/g, '\\?');   //Converting ? to \? as RegExp(pattern) dosen't handle that
            meta = meta || {};
            registeredUrlPatterns[pattern] = { view_name, fn, path_param_keys, meta };
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
         * @property {Object} path_params - Path params
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
                this.register_one(conf.url, conf.view_name, conf.view, conf.meta);
            }
        }

        /**
         * @typedef {Object} AdharaRouterConfiguration - Adhara router configuration
         * @property {Array<RouterURLConf>} routes - Route configurations
         * @property {String} base_uri - base url after which the matches will be taken care of.
         * For example, if '/ui' is given as base URL, then /ui/home will match a route regex with '/home' only
         * @property {Object<String, Function>} on_route_listeners - On Route listeners
         * @property {Array<AdharaRouterMiddleware>} middlewares - Middleware functions
         * */

        /**
         * @function
         * @static
         * @param {AdharaRouterConfiguration} router_configuration
         * */
        static configure(router_configuration){
            if(router_configuration.base_uri){
                baseURI = router_configuration.base_uri;
            }
            if(router_configuration.app_name){
                appName = router_configuration.app_name;
            }
            if(router_configuration.routes){
                Router.register(router_configuration.routes);
            }
            if(router_configuration.on_route_listeners){
                for(let listener_name in router_configuration.on_route_listeners){
                    if(router_configuration.on_route_listeners.hasOwnProperty(listener_name)){
                        Router.onRoute(listener_name, router_configuration.on_route_listeners[listener_name]);
                    }
                }
            }
            if(router_configuration.middlewares){
                for(let middleware_fn of router_configuration.middlewares){
                    Router.registerMiddleware(middleware_fn);
                }
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
         * @param {Function} middleware_fn - middleware function to be used
         * @description Stores all middleware's and calls then in the order of registration
         * */
        static registerMiddleware(middleware_fn){
            if(typeof middleware_fn === "function"){
                middlewares.push(middleware_fn);
            }
        }

        /**
         * @function
         * @static
         * @description
         * Routes to the current URL.
         * Looks up in the registered URL patterns for a match to current URL.
         * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
         * Current view name will be set to the view name configured against view URL.
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
         * @returns {RouterURLConf} Current view name.
         * */
        static getCurrentRoute(){
            if(!currentRoute){
                currentRoute = matchUrl().opts;
            }
            return currentRoute;
        }

        /**
         * @function
         * @static
         * @returns {String} Current view name.
         * */
        static getCurrentPageName(){
            return AdharaRouter.getCurrentRoute().view_name;
        }

        /**
         * @function
         * @static
         * @returns {String} Current URL.
         * */
        static getCurrentURL(){
            return getFullPath();
        }

        /**
         * @function
         * @static
         * @returns {String} Current Path.
         * */
        static getCurrentPath(){
            return getPathName();
        }

        /**
         * @function
         * @static
         * @returns {String} Current URL's Hash.
         * */
        static getCurrentHash(){
            return getHash();
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
            history.pushState({[STATE_KEY]:true}, parent.document.title, url);
            //considering the behaviour of immediate state change
            let state = history.state;
            updateHistoryStack();
            pathParams = {};
            if(state !== undefined && state !== ''){
                // let data = state.data;
                if(state[STATE_KEY] === true || state.data[STATE_KEY] === true){
                    this.route();
                }
            }
            // History.pushState({[STATE_KEY]:true}, parent.document.title, url);
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
            history.replaceState({[STATE_KEY]:true}, parent.document.title, url);
            // History.replaceState({[STATE_KEY]:true}, parent.document.title, url);
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
            url = this.transformURL(url);
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
            /*if(!Object.keys(new_params).length){ return; }*/
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
         * @param {String} view_name - View name with which a URL pattern is registered.
         * @returns {RegExp} Pattern for which the provided view name is the view name.
         * */
        static getURLPatternByPageName(view_name){
            let matched_pattern = null;
            loop(registeredUrlPatterns, function(pattern, options){
                if(options.view_name === view_name){
                    matched_pattern = pattern;
                    return false;
                }
            });
            return matched_pattern;
        }

    }

    //---------------------

    AdharaRouter = Router;

    /**
     * @description
     * setting current view name to undefined on moving to some other page that is not registered with router.
     * */
    window.onpopstate = (e) => {
        // if(e.state[STATE_KEY]){
        AdharaRouter.route();
        // }else{
        //     currentRoute = null;
        // }
        /*if(currentRoute){
            let url_pattern = Router.getURLPatternByPageName(currentRoute.view_name);
            if(!(url_pattern && new RegExp(url_pattern).test(getPathName()))){
                currentRoute = undefined;
            }
        }*/
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

        function getRoutingElement(event){
            return (event.target.nodeName !== "A")?event.currentTarget:event.target;
        }

        function hasAttribute(elem, attribute_name) {
            return elem.hasAttribute(attribute_name);
        }

        function routeHandler(event){
            let re = getRoutingElement(event);
            if ((AdharaRouter.enableAllAnchors || hasAttribute(re, "route")) && hasAttribute(re, "href") && !hasAttribute(re, "skiprouting")) {
                let target = this.getAttribute("target");
                let miniURL = this.getAttribute('href').trim();
                let isHash = miniURL.indexOf("#") === 0;
                if( ( target && target !== "_self") || miniURL.indexOf('javascript') !== -1 || isHash ){
                    return;
                }
                let url = miniURL;//this.href;
                try{
                    let go_to_url = new URL(url);
                    if(go_to_url.host !== window.location.host){
                        return;
                    }
                }catch(e){/*Do nothing. Try catches the invalid url on new ULR(...)*/}
                let go_back = this.getAttribute("data-back");
                let force = this.getAttribute("data-force") !== "false";
                if (go_back) {
                    return AdharaRouter.goBack(url);
                }
                AdharaRouter.navigateTo(url, force);
                if (url) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }

        jQuery(document).on("click", "a", routeHandler);
        jQuery(document).on("click", "[route]", routeHandler);

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
    };

    //---------------------


    updateHistoryStack();	//updating history stack with the entry URL
})();