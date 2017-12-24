/**
 * Created by varun on 19/12/17.
 * TODO : 1. need to take in different table configurations, 2. need a preprocessor for data before drawing table
 */

class AdharaTableView extends AdharaView{

    constructor(){
        super();
    }

    get config(){
        return {
            title : 'Adhara Table',
            add_new : false,
            nav : false
        }
    }

    get template(){
        return 'table'
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates[this.template]({'config' : this.config, 'data' : this.data});
        this.format(this.container);
    }

}