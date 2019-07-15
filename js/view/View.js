/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView extends AdharaEventHandler{

    /**
     * @constructor
     * @param {Object} [settings]
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * @param {Object} settings.options - custom options to be passed
     * @param {HandlebarTemplate} settings.t - View template
     * */
    constructor(settings = {}){
        super();
        this.settings = settings;
        if(!this.settings.options) this.settings.options = {};
        let {key, c} = this.settings;
        this.ts = `d${performance.now().toString().replace(".", '-')}`;
        this.context = new Context(key||this.ts, this);
        this._parentContainer = c;
        Adhara.addViewToInstances(this);
        this.is_active = false;
        this._registerEvents(["ViewRendered", "SubViewsRendered", "ViewFormatted", "ViewDestroyed"]);
        this.fetching_data = false;
        this.onInit();
        this._subViews = [];
        this.rednered_subviews = [];
        this.rendered = false;
        this.initialized = true;
        this.error = null;
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
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of the view
     * */
    get template(){
        if(this.settings.t) return this.settings.t;
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

    get parentContainer(){
        return this._parentContainer;
    }

    set parentContainer(_){
        this._parentContainer = _;
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
        return this.fetching_data?this.fetchingDataTemplate:(this.error?(this.errorTemplate||this.template):this.template);
    }

    get isImmortal(){
        return false;
    }

    isActive(){
        return Adhara.isActiveView(this) && this.is_active;
    }

    create(){
        Adhara.addToActiveViews(this);
        this.is_active = true;
        this.fetch().then(()=>{this.render();});
        this.render();
    }

    async fetch(){
        this.fetching_data = true;
        await this.fetchData();
        this.fetching_data = false;
    }

    /**
     * @function
     * @instance
     * @description hook to make API calls, data change event will be triggered on successful API call.
     * By default no API call will be made and dataChange method will be called right away.
     * */
    async fetchData(){

    }

    _getHTML(template){
        return Adhara.app.renderTemplate(
            template || this.getTemplate(),
            this
        );
    }

    /**
     * @param {Context} context - current view context from which this class instance is to be looked up in the tree
     * @param {String} [tag] - instance tag
     * */
    static of(context, tag){
        return context.getViewFromRenderTree(this, tag);
    }

    get r(){
        return {
            d: Adhara.app.d
        };
    }

    getParentContainerElement(){
        return document.querySelector(this.parentContainer);
    }

    querySelector(css_selector){
        return this.getParentContainerElement().querySelector(css_selector);
    }

    querySelectorAll(css_selector){
        return this.getParentContainerElement().querySelectorAll(css_selector);
    }

    setState(){
        this.render();
    }

    render(){
        let container = this.getParentContainerElement();
        if(!container){
            console.warn(`No container defined/available for ${this.constructor.name}, selecting with ${this.parentContainer}`);
            return;
        }
        container.innerHTML = this._getHTML();
        if(this.fetching_data){
            return;
        }
        this.trigger("ViewRendered");
        this._format(container);
        setTimeout(()=> {
            this.format(container);
            this.trigger("ViewFormatted");
        }, 0);
        this.renderSubViews();
        this.trigger("SubViewsRendered");
        this.rendered = true;
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
     * @function
     * @instance
     * @returns Array<AdharaView>
     * */
    get subViews(){
        return this._subViews;
    }

    renderSubViews(){
        this.rednered_subviews.forEach(_ => { _.destroy(); });
        for(let sub_view of (this.subViews || [])){
            this.rednered_subviews.push(Adhara.createView(sub_view, this));
        }
    }

    _format(container){
        for(let action of [ "click", "change", "blur", "scroll", "contextmenu", "copy", "cut",
            "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart",
            "drop", "focus", "focusin", "focusout", "input", "invalid", "mousedown", "mouseenter",
            "mouseleave", "mouseover", "mouseout", "mouseup", "paste", "show",
            "toggle", "wheel", "keyup", "keydown", "keypress", "load" ]){
            let onActionElements = container.querySelectorAll(`[data-on${action}]`);
            for(let actionElement of onActionElements){
                if(actionElement.dataset[`_ae_${action}_`] === "true"){
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
                actionElement.dataset[`_ae_${action}_`] = "true";
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
        this.context.removeFromParent();
        try{
            this.getParentContainerElement().innerHTML = "";
        }catch(e){/*Do nothing*/}
    }

}
