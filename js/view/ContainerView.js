class AdharaContainerView extends AdharaView{

    get template(){
        return "container";
    }

    get contentContainer(){
        return "main";
    }

    get data(){
        return {
            app_name: Adhara.app.name,
            detailed_app_name: Adhara.app.detailedName,
            tag_line: Adhara.app.tagLine
        }
    }

    _getParentContainer(){
        return Adhara.app.DOMSelector;
    }

}