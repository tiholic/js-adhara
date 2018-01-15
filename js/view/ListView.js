class AdharaListView extends AdharaView{

    get template(){
        return 'adhara-list-item';
    }

    get structureTemplate(){
        return "adhara-list";
    }

    get config(){
        return {
            title: ""
        }
    }

    get data(){
        return [];
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = this._getHTML(this.structureTemplate);
        this.format(this.container);
    }

}