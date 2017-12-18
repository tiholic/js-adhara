/**
 * Created by varun on 19/12/17.
 * TODO : 1. need to take in different table configurations, 2. need a preprocessor for data before drawing table
 */

class AdharaTableView extends AdharaSubView{

    constructor(api_key, columns){
        super('table');
        this.api_key = api_key;
        this.columns = columns;
    }

    render(containerSelector){
        this.initFetch(containerSelector);
    }

    initFetch(containerSelector){
        jQuery.ajax({
            url : this.api_key,
            method : 'GET',
            success : function(data){
                this.data = data;
                this.drawTable(containerSelector);
            },
            error : function(){

            }
        });
    }

    drawTable(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates[this.template]({'columns' : this.columns, 'data' : this.data});
        this.postProcess(this.container);
    }
}