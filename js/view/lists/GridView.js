class AdharaGridView extends AdharaListView{

    get listType(){
        return AdharaListView.VIEW_TYPES.GRID_VIEW;
    }

    // TODO
    // 1. need to take in different table configurations,
    // 2. need a preprocessor for data before drawing table

    get tableClass(){
        return "table-bordered table-hover";
    }

}