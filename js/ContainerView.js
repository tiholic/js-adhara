class AdharaContainerView extends AdharaView{

    get template(){
        return "container";
    }

    get contentSelector(){
        return "main";
    }

    get data(){
        return {
            app_name: Adhara.app.name
        }
    }

}