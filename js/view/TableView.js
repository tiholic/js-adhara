/**
 * Created by varun on 19/12/17.
 * TODO : 1. need to take in different table configurations, 2. need a preprocessor for data before drawing table
 */

class AdharaTableView extends AdharaView{

    /***
     * @param url The api URL
     * @config the configurations required for the table
     *          the config object comprises of the following:
     *          1. columns - array - the colummns for the table. (Only these fields are fetched by the url)
     *          2. url - string - the apiurl
     *          2. title - string - the title for the table
     *          3. add_new - boolean - defaulted to false, "add new" button will be present if set as true
     *          4. nav - boolean - defaulted to false, will display navigations if set as true
     */

    constructor(url, config){
        super('table');
        this.url = url;
        this.config = config;
        AdharaTableView.validateConf(this.config);
    }

    render(containerSelector){
        this.initFetch(containerSelector);
    }

    initFetch(containerSelector){
        jQuery.ajax({
            url : this.config.url,
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
        this.container.innerHTML = Handlebars.templates[this.template]({'config' : this.config, 'data' : this.data});
        this.format(this.container);
    }

    static validateConf(conf){
        let errors = [];
        if(!conf.url){
            errors.push("No URL in config.")
        }
        if(!conf.columns){
            errors.push("No COLUMNS in config.")
        }
        if(!conf.title){
            errors.push("No TITLE in config.")
        }
        if(conf.add_new == undefined){
            conf.add_new = true;
        }
        if(conf.nav == undefined){
            conf.nav = false;
        }

        if(!errors.length == 0){
            throw new Error(errors.join(','));
        }

    }
}