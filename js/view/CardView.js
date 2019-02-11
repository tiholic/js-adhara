class AdharaCardView extends AdharaListView{

    get listType(){
        return AdharaListView.VIEW_TYPES.CARD_VIEW;
    }

    get containerClass(){
        return "";
    }

    get cardSizeClass(){
        return "col-md-4";
    }

}