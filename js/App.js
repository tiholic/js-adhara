class AdharaApp{

    /**
     * @function
     * @instance
     * @return {String} App name
     * */
    get name(){
        return "Coin Connect"
    }

    /**
     * @function
     * @instance
     * @return {Object} App name in detail. Like first and last name
     * */
    get detailedName(){
        return {
            first: "Coin",
            last: "Connect"
        }
    }

    /**
     * @function
     * @instance
     * @return {String} Tag line
     * */
    get tagLine(){ }

    /**
     * @function
     * @instance
     * @return {AdharaView} Container view class
     * */
    get containerView(){ }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style app config
     * */
    get config(){ }

    /**
     * @function
     * @instance
     * @return {AdharaRouterConfiguration} Adhara style routing config
     * */
    get routerConfiguration(){
        return {
            routes: [],
            on_route_listeners: {},
            middlewares: []
        }
    }

    /**
     * @function
     * @instance
     * @returns {String} A css selector in which app is to be rendered.
     * */
    get DOMSelector(){
        return "app";   //=> search DOM for `<app></app>`
    }

    /**
     * @function
     * @instance
     * @returns {String} API Server URL. Either the base path or a full url till base path.
     * */
    get apiServerURL(){
        return "/api";
    }

    /**
     * @function
     * @instance
     * @returns {Object} WebSocket config object.
     * sample...
     * {
     *  url: "sub.domain.com:9081"
     * }
     * */
    get webSocketConfig(){ }

}