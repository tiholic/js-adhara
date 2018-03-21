/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        init(app){
            callOnInitListeners();
            this.always_active_views = [];
            this.active_views = [];
            this.container = null;
            if(app){
                this.app = new app();
                this.i18n = new Internationalize(Adhara.app.i18n_key_map);
                this.createShortcuts();
                this.performSystemChecks();
                this.createContainer();
                if(this.app.webSocketConfig){
                    WebSocket.listen(this.app.webSocketConfig);
                }
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
            /*// verify the controller for if it has support for all the API methods (for ease of Dev)
            for(let i = 0; i < Adhara.app.allowedHttpMethods.length; i++){
                if(typeof Controller[Adhara.app.allowedHttpMethods[i] + "Data"] !== 'function'){
                    throw new Error(Adhara.app.allowedHttpMethods[i] + " api method is not registered with the controller!");
                }
            }*/
        }

        createContainer(){
            AdharaRouter.configure(this.app.routerConfiguration);
            AdharaRouter.listen();
            if(this.app.containerView) {
                this.container = new this.app.containerView();
                this.container.onViewRendered(AdharaRouter.route);
                this.always_active_views = this.container.subViews.map(subView => Adhara.getView(subView));
                this.always_active_views.push(this.container);
                this.clearActiveViews();
                Adhara.createView(this.container);
            }else{
                this.clearActiveViews();
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

        addToActiveViews(viewInstance){
            this.active_views.push(viewInstance);
        }

        isActiveView(viewInstance){
            return this.active_views.indexOf(viewInstance)!==-1;
        }

        clearActiveViews(){
            this.active_views = this.always_active_views.slice();
        }

    }

    Adhara = new AdharaBase();

    //View class handling
    let view_instances = {};

    //Single ton views
    Adhara.addViewToInstances = (instance) => {
        view_instances[instance.constructor.name] = instance;
    };

    //Query singleton views
    Adhara.getView = (viewClass, parentViewInstance) => {
        if(!viewClass){
            throw new Error("invalid view class");
        }
        if(viewClass instanceof Function){
            return view_instances[viewClass.name] || new viewClass(parentViewInstance);
        }
        return view_instances[viewClass.constructor.name] || new viewClass(parentViewInstance);
    };

    //Create a view instance
    Adhara.createView = (adhara_view_instance) => {
        adhara_view_instance.create();
    };

    //On route listener
    Adhara.onRoute = (view_class) => {
        Adhara.clearActiveViews();
        Adhara.createView(Adhara.getView(view_class, Adhara.container));
    };

    let on_init_listeners = [
        registerAdharaUtils
    ];

    Adhara.onInit = (fn) => {
        on_init_listeners.push(fn);
    };

    Adhara.lightReload = ()=>{
        Adhara.container?Adhara.container.refresh():AdharaRouter.route();
    };
    
    function callOnInitListeners(){
        for(let on_init_listener of on_init_listeners){
            on_init_listener();
        }
    }

})();
