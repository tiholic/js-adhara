/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView{

    constructor(){
        Adhara.instances[this.constructor.name] = this;
        this.subViews = [];
    }

    set data(data){
        this.data = data;
    }

    get data(){
        return {};
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

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates[this.template](this.data);
        this.format(this.container);
    }

    getContentContainer(){
        return this.DOMcontent.querySelector(this.contentSelector);
    }

    format(){
        //Control the DOM elements after rendering
    }

    get getSubViews(){
        return this.subViews;
    }

    set setSubViews(subViews){
        this.getSubViews.concat(subViews);
    }

    set setSubView(subView){
        this.getSubViews.push(subView);
    }


}