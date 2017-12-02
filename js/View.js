/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView{

    constructor(){
        this.template = "";
        this.data = {};
    }

    getTemplate(){
        return this.template;
    }

    getData(){
        return this.data;
    }

    render(container){
        container.innerHTML = Handlebars.templates[this.getTemplate()](this.getData());
    }

}

AdharaView.container = null;