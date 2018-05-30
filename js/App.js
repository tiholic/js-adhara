class AdharaApp{

    /**
     * @function
     * @instance
     * @return {Boolean} Whether the app is being accessed in development mode or in production mode
     * */
    get is_debug_mode(){
        return (
            ["localhost", "127.0.0.1", "0.0.0.0"].indexOf(window.location.hostname)!==-1
            || window.location.hostname.indexOf("192.168.")!==-1
        );
    }

    /**
     * @function
     * @instance
     * @return {String} App name
     * */
    get name(){
        return "Adhara App"
    }

    /**
     * @function
     * @instance
     * @return {Object} App name in detail. Like first and last name
     * */
    get detailedName(){
        return {
            first: "Adhara",
            last: "App"
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
    get config(){ return {}; }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style entity config from crude entity config
     * */
    getEntityConfigFromContext(context){
        let allowed_query_types = context.data_config.allowed_query_types?context.data_config.allowed_query_types.slice():[];
        let data_config;
        if(context.data_config.hasOwnProperty("batch_data_override")){
            data_config = {
                batch_data_override: context.data_config.batch_data_override.map(batch_data_config => {
                    if(!batch_data_config.reuse){
                        batch_data_config.reuse = {};
                    }
                    return {
                        _url: batch_data_config.url,
                        url: batch_data_config.url,
                        query_type: batch_data_config.query_type,
                        identifier: batch_data_config.identifier,
                        reuse: {
                            enable: batch_data_config.reuse.enable,
                            timeout: batch_data_config.reuse.timeout,
                            scope: batch_data_config.reuse.scope,
                            handler: batch_data_config.reuse.handler,
                        },
                        blob: batch_data_config.blob
                    }
                })
            }
        }else{
            if(!context.data_config.reuse){
                context.data_config.reuse = {};
            }
            data_config = {
                _url: context.data_config.url,
                url: context.data_config.url,
                allowed_query_types: allowed_query_types,
                default_query_type: context.data_config.default_query_type || allowed_query_types[0],
                socket_tag: context.data_config.socket_tag,
                reuse: {
                    enable: context.data_config.reuse.enable,
                    timeout: context.data_config.reuse.timeout,
                    scope: context.data_config.reuse.scope,
                    handler: context.data_config.reuse.handler,
                },
                blob: context.data_config.blob
            }
        }
        let processor = {
            success: ( context.processor && context.processor.success ) || Processor.fallback.success,
            error: ( context.processor && context.processor.error ) || Processor.fallback.error
        };
        let controller = {
            get: ( context.controller && context.controller.get ) || Adhara.restAPI.get,
            put: ( context.controller && context.controller.put ) || Adhara.restAPI.put,
            post: ( context.controller && context.controller.post ) || Adhara.restAPI.post,
            delete: ( context.controller && context.controller.delete ) || Adhara.restAPI.delete
        };
        return {
            data_config,
            view: context.view,
            controller,
            processor
        }
    }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style entity config
     * */
    getEntityConfig(context_name){
        return this.getEntityConfigFromContext(this.config[context_name]);
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Custom global view configurations
     * */
    get customViewConfig(){
        return {
            fetching_data: {
                AdharaListView: "Fetching Data..."
            },
            no_data: {
                AdharaListView: "No Data Available"
            }
        }
    }

    /**
     * @function
     * @instance
     * @returns {Array<String>} list of http methods to be allowed by the application.
     * @description This getter can be configured to return allowed methods based on the current network state.
     * Say if offline, it can be configured to just return `["get"]` method which will restrict DataInterface from making
     * other service API calls such as "post", "delete", etc...
     * */
    get allowedHttpMethods() {
        return ['get', 'post', 'put', 'delete'];  // all available API methods
        // offline mode will switch a few of these off (post, put and delete)
    }

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

    /**
     * @getter
     * @instance
     * @returns {Object} DB Configuration which includes DB names and DB Schematics for Client Storage ( for all the object stores )
     * */
    get DBConfig(){
        return [
            {
                id: "default",
                name: "Adhara-app_db",
                version: 1,
                schema: {
                    http_cache: {
                        keyPath : "url"
                    }
                }
            }
        ];
    }

    get _diConfig(){
        return Object.assign({
            http_cache_table: "http_cache",
            default_reuse: true,
            reuse_timeout: 5*60*1000
        }, this.DIConfig);
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Data interface related configuration
     * */
    get DIConfig(){
        return {};
    }

    /**
     * @getter
     * @instance
     * @returns {Object<String, Object>} scopes that to be used in the app.
     * @description Map of scopes that can be accessed across the application.
     * Scopes can vary from environment to environment. Like in Node.JS vs in Browser JS.
     * */
    get scopes(){
        return {
            global : window // the global scope
        }
    }

    /**
     * @function
     * @instance
     * @description modify the response even before being utilized by the DataInterface
     * */
    responseMiddleWare(entity_config, success, response, xhr){
        return response;
    }

    /**
     * @function
     * @instance
     * @description modify the data with respect to the URL and method name and
     * return formatted data to be posted or queried to/from the server
     * */
    requestMiddleWare(url, method_name, data){
        return data;
    }

    /**
     * @function
     * @instance
     * @param {String} title - toast message title
     * @param {String} content - toast message content
     * @param {String} type - toast message type. can take the values "success"|"error"|"info".
     * */
    toast(title, content, type){
        return AdharaDefaultToaster.make(title, content, type);
    }

    get i18n_key_map(){
        return {
            "list_view.navigation.previous": "Previous",
            "list_view.navigation.next": "Next",
        };
    }

    renderTemplate(template, context){
        return TemplateUtils.execute(template, context);
    }

}
