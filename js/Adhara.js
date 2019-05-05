/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        constructor(){
            this.container = null;
            this.always_active_views = [];
            this.active_views = [];
            this.router = AdharaRouter;
            this.toast = Toast;
        }

        get templateEngine(){
            return {
                name: "Handlebars",
                helpersHandler: TemplateEngineHelpers
            };
        }

        init(app){
            callOnInitListeners();
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
                this.router.route();
            }
        }

        createShortcuts(){
            //Creating a view_name vs context_name map
            this.view_config = {};
            loop(this.app.config, (context_name, configuration)=>{
                if(configuration.hasOwnProperty("view") && AdharaView.isPrototypeOf(configuration.view)){
                    this.view_config[configuration.view.name] = context_name;
                }
            });
        }

        getEntityNameFromViewConfig(viewInstance){
            return this.view_config[viewInstance.constructor.name];
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
            this.router.configure(this.app.routerConfiguration);
            this.router.listen();
            let containerView = this.app.containerView;
            if(containerView) {
                this.container = containerView;
                this.container.onViewRendered(this.router.route);
                this._clearActiveViews();
                //TODO Adhara.getView is not valid function anymore...
                this.always_active_views = this.container.subViews.map(subView => Adhara.getView(subView, this.container));
                this.container.create();
                this.always_active_views.push(this.container);
            }else{
                this._clearActiveViews();
                this.router.route();
            }
        }

        get viewHierarchy(){
            return [
                AdharaAppContainerView,
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
            if(!this.isActiveView(viewInstance)){
                if(viewInstance.isImmortal){
                    this.always_active_views.push(viewInstance);
                }else{
                    this.active_views.push(viewInstance);
                }
            }
        }

        getActiveView(classReference){
            let active_view = this.active_views.filter(view_instance => view_instance.constructor === classReference)[0];
            if(!active_view){
                active_view = this.always_active_views.filter(view_instance => view_instance.constructor === classReference)[0];
            }
            return active_view
        }

        isActiveView(viewInstance){
            return this.active_views.indexOf(viewInstance)!==-1 || this.always_active_views.indexOf(viewInstance)!==-1;
        }

        _clearActiveViews(){
            this.active_views = [];
        }

        closeActiveViews(){
            for(let active_view of this.active_views){
                active_view.destroy();
            }
            this._clearActiveViews();
        }

    }

    Adhara = new AdharaBase();

    //View class handling
    let view_instances = {};

    //Single ton views
    Adhara.addViewToInstances = (instance) => {
        view_instances[instance.constructor.name] = instance;
    };

    // //Query singleton views
    Adhara.getView = (viewClass, parentViewInstance) => {
        if(!viewClass){
            throw new Error("invalid view class");
        }
        let active_view = Adhara.getActiveView((viewClass instanceof Function)?viewClass:viewClass.constructor);
        if(active_view){
            return active_view;
        }else if(parentViewInstance){
            return new viewClass(parentViewInstance);
        }else{
            throw new Error(`parent view is required to construct a view. Failed to create view: ${viewClass.constructor.name}`);
        }
    };

    //Create a view instance
    Adhara.createView = (adhara_view_instance, parentViewInstance) => {
        adhara_view_instance.context.parentContext = parentViewInstance.context;
        adhara_view_instance.create();
    };

    //On route listener
    Adhara.onRoute = (view) => {
        Adhara.closeActiveViews();
        if(!Adhara.container.isActive()){
            return Adhara.container.create();
        }
        view.parentContainer = Adhara.container.contentContainer;
        Adhara.createView(view, Adhara.container);
    };

    let on_init_listeners = [
        registerAdharaUtils,
    ];

    Adhara.onInit = (fn) => {
        on_init_listeners.push(fn);
    };

    Adhara.lightReload = ()=>{
        Adhara.container?Adhara.container.refresh():Adhara.router.route();
    };
    
    function callOnInitListeners(){
        for(let on_init_listener of on_init_listeners){
            on_init_listener();
        }
    }

})();
