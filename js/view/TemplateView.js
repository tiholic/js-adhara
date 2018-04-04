class AdharaTemplateView extends AdharaListView{

    get listTemplate(){
        return 'adhara-list-template';
    }

    get headerTemplate(){
        return 'adhara-list-template-header';
    }

    get itemTemplate(){
        return 'adhara-list-template-item';
    }

    get tableClass(){
        return "table-bordered table-hover";
    }

    get containerAttributes(){
        return {};
    }

}