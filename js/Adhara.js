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
                this.setupPage(this.app.styles, this.app.scripts);
            }else{
                AdharaRouter.route();
            }
        }

        createContainer(){
            if(this.app.container) {
                this.container = new this.app.container();
                this.container.render(this.app.DOMSelector||"app");
            }
            AdharaRouter.route();
        }

        setupPage(styles, scripts){
            for(let style_path of styles){
                let head = document.getElementsByTagName('head')[0];
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                /*link.onload = function() {
                    console.log("script_downloaded");
                };*/
                link.href = style_path;
                head.appendChild(link);
            }
            let counter = 0;
            function scriptDownloaded(){
                counter++;
                if(counter === scripts.length){
                    this.createContainer();
                }
            }
            for(let script_path of scripts){
                let head = document.getElementsByTagName('head')[0];
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.onload = function() {
                    scriptDownloaded();
                };
                script.src = script_path;
                head.appendChild(script);
            }
            let APP = document.createElement("app");
            document.getElementsByTagName('body')[0].appendChild(APP);
        }

    }

    Adhara = new AdharaBase();

    Adhara.onRoute = (view_class) => {
        let view = Adhara.instances[view_class.constructor.name] || new view_class();
        view.render(Adhara.container?Adhara.container.contentSelector:"body");
    };

    Adhara.instances = {};

})();