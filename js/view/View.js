/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView{

    /**
     * @constructor
     * @param {AdharaView} parentViewInstance - parent view instance that is to be passed to render a view inside another.
     * */
    constructor(parentViewInstance){
        this.parentView = parentViewInstance;
        Adhara.instances[this.constructor.name] = this;
        this._data = null;
    }

    get data(){
        return this._data || {};
    }

    /**
     * @function
     * @instance
     * @description hook to make API calls, data change event will be triggered on successful API call.
     * By default no API call will be made and dataChange method will be called right away.
     * */
    fetchData(){
        this.handleDataChange();
    }

    handleDataChange(new_data){
        this.dataChange(new_data);
        this.render();
    }

    dataChange(new_data){
        this._data = new_data;
    }

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

    _getHTML(template){
        return HandlebarUtils.execute(template||this.template, this);
    }

    _getParentContainer(){
        let container = this.parentView.contentContainer;
        if(typeof container === "string"){
            return container;
        }
        return container[this.constructor.name];
    }

    render(){
        let container = document.querySelector(this._getParentContainer());
        container.innerHTML = this._getHTML();
        setTimeout(this.format(container), 0);
        this.renderSubViews();
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

    format(container){
        //Control the DOM elements after rendering
    }

}