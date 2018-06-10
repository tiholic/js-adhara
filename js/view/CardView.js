class AdharaCardView extends AdharaListView{

    get listTemplate(){
        return "adhara-card";
    }

    get containerClass(){
        return "";
    }

    get cardSizeClass(){
        return "col-md-4";
    }

    get itemTemplate(){
        return "adhara-card-content";
    }

}