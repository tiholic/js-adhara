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
                this.createShortcuts();
                this.performSystemChecks();
                this.createContainer();
            }else{
                AdharaRouter.route();
            }
        }

        createShortcuts(){
            //Creating a view_name vs context_name map
            this.view_context = {};
            loop(this.app.config, (context_name, configuration)=>{
                if(configuration.hasOwnProperty("view") && AdharaView.isPrototypeOf(configuration.view)){
                    this.view_context[configuration.view.name] = context_name;
                }
            });
        }

        performSystemChecks(){
            // verify the controller for if it has support for all the API methods (for ease of Dev)
            for(let i = 0; i < Adhara.app.allowedHttpMethods.length; i++){
                if(typeof Controller[Adhara.app.allowedHttpMethods[i] + "Data"] !== 'function'){
                    throw new Error(Adhara.app.allowedHttpMethods[i] + " api method is not registered with the controller!");
                }
            }
        }

        createContainer(){
            AdharaRouter.configure(this.app.routerConfiguration);
            AdharaRouter.listen();
            if(this.app.containerView) {
                this.container = new this.app.containerView();
                this.container.onViewRendered(AdharaRouter.route);
                Adhara.createView(this.container);
            }else{
              AdharaRouter.route();
            }
        }

        get viewHierarchy(){
            return [
                AdharaContainerView,
                AdharaDialogView,
                AdharaTemplateView,
                AdharaCardView,
                AdharaGridView,
                AdharaListView,
                AdharaFormView,
                AdharaView
            ]
        }

    }

    Adhara = new AdharaBase();

    Adhara.getView = (viewClass, parentViewInstance) => {
        if(!viewClass){
            throw new Error("invalid view class");
        }
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
