/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        init(app){
            callOnInitListeners();
            if(app){
                this.app = new app();
                this.createContainer();
            }else{
                AdharaRouter.route();
            }
        }

        createContainer(){
            if(this.app.containerView) {
                this.container = new this.app.containerView();
                Adhara.createView(this.container);
            }
            AdharaRouter.configure(this.app.routerConfiguration);
            AdharaRouter.listen();
            AdharaRouter.route();
        }

    }

    Adhara = new AdharaBase();

    Adhara.getView = (viewClass, parentViewInstance) => {
        if(viewClass instanceof Function){
            return Adhara.instances[viewClass.name] || new viewClass(parentViewInstance);
        }
        return Adhara.instances[viewClass.constructor.name] || new viewClass(parentViewInstance);
    };

    Adhara.createView = (adhara_view_instance) => {
        adhara_view_instance.fetchData();
    };

    Adhara.onRoute = (view_class) => {
        Adhara.createView(Adhara.getView(view_class, Adhara.container));
    };

    let on_init_listeners = [];
    Adhara.onInit = (fn) => {
        on_init_listeners.push(fn);
    };

    function callOnInitListeners(){
        for(let on_init_listener of on_init_listeners){
            on_init_listener();
        }
    }

    Adhara.instances = {};

})();