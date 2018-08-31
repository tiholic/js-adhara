class AdharaContainerView extends AdharaView{

    get template(){
        return "container";
    }

    get isImmortal(){
        return true;
    }

    get contentContainer(){
        return "main";
    }

    _getParentContainer(){
        return Adhara.app.DOMSelector;
    }

}