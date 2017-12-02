/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        init(app_module){
            if(app_module){
                this.app = new app_module();
                if(app_module.container) {
                    this.container = new app_module.container();
                    this.container.render(app_module.DOMContainer||document.getElementsByTagName("APP")[0]);
                }
            }
        }

        static onRoute(view_class){
            new view_class();
        }

    }

    Adhara = new AdharaBase();
})();