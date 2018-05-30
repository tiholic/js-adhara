/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView extends AdharaController{

    /**
     * @constructor
     * @param {AdharaView} parentViewInstance - parent view instance that is to be passed to render a view inside another.
     * */
    constructor(parentViewInstance){
        super();
        this._parentViewInstance = parentViewInstance;
        Adhara.addViewToInstances(this);
        this._data = null;
        this._state = {};
        this._error = null;
        this._event_listeners = {};
        this.is_active = false;
        this._registerEvents(["ViewRendered", "SubViewsRendered", "ViewFormatted", "ViewDestroyed"]);
        this._registerEvents(this.events);
        this.onInit();
    }

    /**
     * @function
     * @instance
     * @description Anything that needs to be done right after initializing the view.
     * */
    onInit(){
        //Override this method to do any miscellaneous operations/assignments right after initializing the View
    }

    /**
     * @getter
     * @instance
     * @returns {Array<String>} return list of custom event names in PascalCase...
     * @description event listener registration functions will be created dynamically by prepending "on" th the event name
     * @example
     * say get events() returns this array: ["Render", "Format"]
     * listener functions these events can be then registered using `onRender(listener)` and `onFormat(listener)`
     * */
    get events(){
        return [];
    }

    /**
     * @function
     * @protected
     * @param {Array<String>} event_names - list of events that are to be enabled on the current View instance.
     * @description registers the event names and creates event registration functions.
     * @example
     * _registerEvents(["Render", "Format"]);
     * //This will create 2 functions onRender and onFormat runtime to allow registration of events
     * */
    _registerEvents(event_names){
        for(let event_name of event_names){
            this._event_listeners[event_name] = [];
            this["on"+event_name] = handler => {
                this._event_listeners[event_name].push(handler);
            };
            this["off"+event_name] = handler => {
                this._event_listeners[event_name].splice(this._event_listeners[event_name].indexOf(handler), 1);
            };
        }
    }

    trigger(event_name, ...data){
        for(let event_handler of this._event_listeners[event_name]){
            event_handler(data);
        }
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of the view
     * */
    get template(){
        if(Adhara.router.getCurrentPageName()){
            return Adhara.router.getCurrentPageName().replace(/_/g, "-");
        }else{
            let className = this.constructor.name.toLowerCase();
            if(className.endsWith("view")){
                return className.slice(0, className.length - 4);
            }else{
                return className;
            }
        }
    }

    getCustomTemplate(type){
        for(let ViewClass of Adhara.viewHierarchy){
            if(ViewClass.isPrototypeOf(this.constructor)){
                if(Adhara.app.customViewConfig[type] && Adhara.app.customViewConfig[type][ViewClass.name]){
                    return Adhara.app.customViewConfig[type][ViewClass.name];
                }
            }
        }
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of the view
     * */
    get errorTemplate(){
        return this.getCustomTemplate("error") || null;
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} structure to be rendered when data is being fetched
     * */
    get fetchingDataTemplate(){
        return this.getCustomTemplate("fetching_data") || "";
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} structure to be rendered when there is no data available
     * */
    get noDataTemplate(){
        return this.getCustomTemplate("no_data") || "";
    }

    /**
     * @function
     * @instance
     * @description Helper method to get required template. Error template or success template.
     * */
    getTemplate(){
        return this.state.fetching_data?this.fetchingDataTemplate:(this.errors?(this.errorTemplate||this.template):this.template);
    }

    /**
     * @getter
     * @instance
     * @param {String} [batch_identifier=undefined] - In case if the config is a batch config,
     * use batch_identifier to know what url's path parameters are required.
     * @returns {Object|null} url path parameters as an object with keys as template variables
     * */
    getURLPathParams(batch_identifier){
        return null;
    }

    /**
     * @getter
     * @instance
     * @returns {Object|null} Add dynamic input data to API calls made to server
     * */
    get payload(){
        return null;
    }

    formatURL(url, params){
        if(!params){
            return url;
        }
        let match = url.match(/\${([a-zA-Z0-9$_]*)}/gi);
        let this_match = match.map( match => '${this.'+/\${([a-zA-Z0-9$_]*)}/.exec(match)[1]+'}' );
        for(let idx in match){  //in works of doesn't work here as it is not a classic Array
            url = url.replace(match[idx], this_match[idx]);
        }
        return new Function("return `" + url + "`;").call(params);
    }

    formatEntityConfig(entity_config){
        if(entity_config.data_config.hasOwnProperty("batch_data_override")){
            for(let one_config of entity_config.data_config.batch_data_override){
                let url_path_params = this.getURLPathParams(one_config.identifier);
                if(url_path_params){
                    one_config.url = this.formatURL(one_config.url, url_path_params);
                }
            }
        }else{
            let url_path_params = this.getURLPathParams();
            if(url_path_params) {
                entity_config.data_config.url = this.formatURL(entity_config.data_config.url, url_path_params);
            }
        }
        return entity_config;
    }

    /**
     * @function
     * @instance
     * @returns Adhara style entity config for entity mapped with this view
     * */
    get entityConfig(){
        let entity_name = Adhara.getViewContext(this);
        if(!entity_name){
            return null;
        }
        return this.formatEntityConfig(Adhara.app.getEntityConfig(entity_name));
    }

    /**
     * @function
     * @instance
     * @returns Add dynamic input data to API calls made to server
     * @description intermediate function that can be overridden by other generic views
     * */
    getPayload(){
        return this.payload;
    }

    /**
     * @getter
     * @instance
     * @returns {Object} state object of the current View
     * */
    get state(){
        return this._state;
    }

    create(parentViewInstance){
        if(parentViewInstance && AdharaView.isPrototypeOf(parentViewInstance.constructor)){
            this._parentViewInstance = parentViewInstance;
        }
        Adhara.addToActiveViews(this);
        this.is_active = true;
        this.fetchData();
    }

    isActive(){
        return Adhara.isActiveView(this) && this.is_active;
    }

    /**
     * @function
     * @instance
     * @description hook to make API calls, data change event will be triggered on successful API call.
     * By default no API call will be made and dataChange method will be called right away.
     * */
    fetchData(){
        this._state.fetching_data = true;
        let config = this.entityConfig;
        if(config){
            if(config.data_config.hasOwnProperty("batch_data_override")){
                this.render();
                return this.control(undefined, config);
            }
            if(Adhara.dataInterface.getHTTPMethod(config.data_config.default_query_type)==="get"){
                this.render();
                return this.control(config.data_config.default_query_type, config, this.getPayload());
            }
            return this.handleDataChange();
        }
        this.handleDataChange();
    }

    /**
     * @function
     * @protected
     * @param {DataBlob|Array<DataBlob>} [new_data=null] - Data in the form of DataBlob instance to be updated in view
     * */
    handleDataChange(new_data){
        if(!this.isActive()){return;}
        this.dataChange(new_data);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @private
     * @param {*} error - Error to be updated in view
     * */
    handleDataError(error){
        if(!this.isActive()){return;}
        this.dataError(error);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @private
     * @param {Object<String, Object<String, DataBlob|*>>} map - Data/Error to be updated in view. Map of {String} identifier vs {Object<success:response|error:error>}
     * */
    handleBatchData(map){
        if(!this.isActive()){return;}
        let errors = {};
        let success = {};
        for(let identifier in map){
            if(map.hasOwnProperty(identifier)){
                if(map[identifier].hasOwnProperty("error")){
                    errors[identifier] = map[identifier].error;
                }else{
                    success[identifier] = map[identifier].success;
                }
            }
        }
        if(Object.keys(success).length){
            this.dataChange(success);
        }
        if(Object.keys(errors).length){
            this.dataError(errors);
        }
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @instance
     * @param {DataBlob|*} new_data - Data in the form of DataBlob instance to be set in view
     * */
    dataChange(new_data){
        this._data = new_data;
        this._error = null;
    }

    /**
     * @function
     * @instance
     * @param {*} error - Error to be set in view
     * */
    dataError(error){
        this._error = error;
    }

    /**
     * @method
     * @getter
     * @returns {*} View errors, that can be consumed by the template.
     * */
    get errors(){
        return this._error;
    }

    /**
     * @method
     * @getter
     * @returns {*} View data, that can be consumed by the template.
     * */
    get data(){
        return this._data;
    }

    _getHTML(template){
        return Adhara.app.renderTemplate(
            template || this.getTemplate(),
            this
        );
    }

    get parentView(){
        return this._parentViewInstance || Adhara.getView(Adhara.app.containerView);
    }

    _getParentContainer(){
        let container = this.parentView.contentContainer;
        if(typeof container === "string"){
            return container;
        }
        return container[this.constructor.name]||container["*"];
    }

    getParentContainerElement(){
        return document.querySelector(this._getParentContainer())
    }

    _render(){

    }

    render(){
        let container = this.getParentContainerElement();
        if(!container){
            console.warn("No container defined/available", this.constructor.name);
            return;
        }
        container.innerHTML = this._getHTML();
        if(this.state.fetching_data){ return; }
        this.trigger("ViewRendered");
        this._format(container);
        setTimeout(()=> {
            this.format(container);
            this.trigger("ViewFormatted");
        }, 0);
        this.renderSubViews();
        this.trigger("SubViewsRendered");
    }

    /**
     * @function
     * @getter
     * @returns {String} A CSS selector inside which child views are to be rendered.
     * */
    get contentContainer(){
        throw new Error("implement this method");
    }

    /**
     * @typedef {Object} SubView - Sub view configuration
     * @property {String} container_selector - container's CSS selector
     * @property {class} view - view class reference of the sub view
     * */

    /**
     * @function
     * @instance
     * @returns Array<SubView>
     * */
    get subViews(){
        return [];
    }

    renderSubViews(){
        if(!this.subViews){
            return;
        }
        for(let sub_view of this.subViews){
            Adhara.createView(Adhara.getView(sub_view, this), this);
        }
    }

    _format(container){
        for(let action of [ "click", "change", "blur", "focus", "scroll", "contextmenu", "copy", "cut",
                            "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart",
                            "drop", "focus", "focusin", "focusout", "input", "invalid", "mousedown", "mouseenter",
                            "mouseleave", "mouseover", "mouseout", "mouseup", "paste", "scroll", "show",
                            "toggle", "wheel"  ]){
            let onActionElements = container.querySelectorAll(`[data-on${action}]`);
            for(let actionElement of onActionElements){
                if(actionElement.dataset['_adharaevent_']){
                    continue;
                }
                actionElement.addEventListener(action, event => {
                    let data = actionElement.dataset;
                    let action_key = `on${action}`;
                    if(this[data[action_key]]){
                        this[data[action_key]](event, data, this);
                    }else{
                        let fn = getValueFromJSON(window, data[action_key]);
                        if(fn) {
                            fn(event, data, this);
                        }else{
                            throw new Error(`Invalid function: ${data[action_key]} in View ${this.constructor.name}`);
                        }
                    }
                });
                actionElement.dataset['_adharaevent_'] = true;
            }
        }
    }

    format(container){
        //Control the DOM elements after rendering
    }

    refresh(){
        Adhara.createView(this);
    }

    onDestroy(){
        // This method will be called just before destroying the view
    }

    destroy(){
        // This method will destroy the view
        this.onDestroy();
        this.trigger("ViewDestroyed");
        this.is_active = false;
        try{
            this.getParentContainerElement().innerHTML = "";
        }catch(e){/*Do nothing*/}
    }

}
