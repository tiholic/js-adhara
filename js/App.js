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

    get dataInterface(){
        return DataInterface();
    }

    get d(){
        if(!this._d){
            this._d = this.dataInterface;
        }
        return this.dataInterface;
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
            "form.processing": "Processing...",
            "common.yes": "Yes",
            "common.no": "No",
        };
    }

    renderTemplate(template, context){
        return TemplateUtils.execute(template, context);
    }

}
