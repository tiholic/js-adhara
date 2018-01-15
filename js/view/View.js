/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView{

    constructor(){
        Adhara.instances[this.constructor.name] = this;
        this._data = null;
    }

    get data(){
        return this._data || {};
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

    get contentSelector(){
        throw new Error("Not implemented");
    }

    _getHTML(template){
        return HandlebarUtils.execute(template||this.template, this);
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = this._getHTML();
        setTimeout(this.format(this.container), 0);
        this.renderSubViews();
    }

    getContentContainer(){
        return this.DOMcontent.querySelector(this.contentSelector);
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
            let view = Adhara.getView(sub_view.view);
            view.render(sub_view.container_selector);
        }
    }

    format(){
        //Control the DOM elements after rendering
    }

}