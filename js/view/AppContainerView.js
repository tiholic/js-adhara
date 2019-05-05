class AdharaAppContainerView extends AdharaView{

    get template(){
        return "app-container";
    }

    get isImmortal(){
        return true;
    }

    get contentContainer(){
        return "main";
    }

}