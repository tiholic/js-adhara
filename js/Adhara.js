/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        init(app_module){
            this.app_module = app_module;
            if(app_module){
                this.app = new app_module();
                if(this.app.container) {
                    this.container = new this.app.container();
                    this.container.render(this.app.DOMSelector||"app");
                }
            }
            AdharaRouter.route();
        }

    }

    Adhara = new AdharaBase();

    Adhara.onRoute = (view_class) => {
        let view = Adhara.instances[view_class.constructor.name] || new view_class();
        view.render(Adhara.container?Adhara.container.contentSelector:"body");
    };

    Adhara.instances = {};

})();