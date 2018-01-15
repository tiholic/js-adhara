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
                this.container.render(this.app.DOMSelector);
            }
            AdharaRouter.register(this.app.routes);
            AdharaRouter.listen();
            AdharaRouter.route();
        }

    }

    Adhara = new AdharaBase();

    Adhara.getView = (view_class) => {
        return Adhara.instances[view_class.constructor.name] || new view_class();
    };

    Adhara.onRoute = (view_class) => {
        let view = Adhara.getView(view_class);
        view.render(Adhara.container?Adhara.container.contentSelector:"body");
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