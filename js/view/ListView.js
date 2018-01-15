class AdharaListView extends AdharaView{

    get template(){
        return 'adhara-list-item';
    }

    get config(){
        return {
            title: ""
        }
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates["adhara-list"]({
            'config' : this.config,
            'content_template': this.template,
            'data' : this.data
        });
        this.format(this.container);
    }

}