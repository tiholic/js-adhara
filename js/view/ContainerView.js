class AdharaContainerView extends AdharaView{

    get template(){
        return "container";
    }

    get contentSelector(){
        return "main";
    }

    get data(){
        return {
            app_name: Adhara.app.name,
            detailed_app_name: Adhara.app.detailed_name,
            tag_line: Adhara.app.tag_line
        }
    }

}