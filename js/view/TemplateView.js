class AdharaTemplateView extends AdharaListView{

    get listType(){
        return AdharaListView.VIEW_TYPES.TEMPLATE_VIEW;
    }

    get tableClass(){
        return "table-bordered table-hover";
    }

    get containerAttributes(){
        return {};
    }

}