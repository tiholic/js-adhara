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
        this._parentView = parentViewInstance;
        Adhara.instances[this.constructor.name] = this;
        this._data = null;
        this._state = {};
        this._error = null;
        this._event_listeners = {};
        this._registerEvents(["ViewRendered", "SubViewsRendered", "ViewFormatted"]);
        this._registerEvents(this.events);
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
            }
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
        if(AdharaRouter.getCurrentPageName()){
            return AdharaRouter.getCurrentPageName().replace(/_/g, "-");
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
                if(Adhara.app.customViewConfig[type][ViewClass.name]){
                    return Adhara.app.customViewConfig[type][ViewClass.name];
                }
            }
        }
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

    get entityConfig(){
        let entity_name = Adhara.view_context[this.constructor.name];
        return entity_name?Adhara.app.getEntityConfig(entity_name):null;
    }

    /**
     * @getter
     * @instance
     * @returns {Object} state object of the current View
     * */
    get state(){
        return this._state;
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
            if(dataInterface.getHTTPMethod(config.data_config.default_query_type)==="get"){
                this.render();
                return this.control(config.data_config.default_query_type, config, config.data);
            }
            return this.handleDataChange();
        }
        this.handleDataChange();
    }

    /**
     * @function
     * @instance
     * @param {DataBlob|Array<DataBlob>} [new_data=null] - Data in the form of DataBlob instance to be updated in view
     * */
    handleDataChange(new_data){
        this.dataChange(new_data);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @instance
     * @param {*} error - Error to be updated in view
     * */
    handleDataError(error){
        this.dataError(error);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @instance
     * @param {Object<String, Object<String, DataBlob|*>>} map - Data/Error to be updated in view. Map of {String} identifier vs {Object<success:response|error:error>}
     * */
    handleBatchData(map){
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
        this.dataChange(success);
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
        return HandlebarUtils.execute(
            template || ( this.state.fetching_data?this.fetchingDataTemplate:this.template ),
            this
        );
    }

    get parentView(){
        return this._parentView || Adhara.getView(Adhara.app.containerView);
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
        setTimeout(()=> {
            this._format(container);
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
        for(let sub_view of this.subViews){
            Adhara.createView(Adhara.getView(sub_view, this));
        }
    }

    _format(container){
        let onClickElements = container.querySelectorAll("[data-onclick]");
        for(let onClickElement of onClickElements){
            onClickElement.addEventListener("click", event => {
                return this[onClickElement.dataset.onclick](event);
            });
        }
    }

    format(container){
        //Control the DOM elements after rendering
    }

    refresh(){
        Adhara.createView(this);
    }

}
