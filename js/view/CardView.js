class AdharaCardView extends AdharaView{

    get template(){
        return "adhara-card-content";
    }

    get config(){
        return {
            title: ""
        }
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates["adhara-card"]({
            'config' : this.config,
            'content_template': this.template,
            'data' : this.data
        });
        this.format(this.container);
    }

}