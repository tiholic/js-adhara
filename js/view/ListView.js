class AdharaListView extends AdharaView{

    get template(){
        return 'adhara-list';
    }

    get itemTemplate(){
        return "adhara-list-item";
    }

    get config(){
        return {
            title: ""
        }
    }

    get data(){
        return [];
    }

}