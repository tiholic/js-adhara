/**
 * Created by varun on 21/12/17.
 */

class AdharaPopup{

    constructor(title, message){
        this.message = message;
        this.title = title;
    }

    /**
     * @description method to show the popup
     * */
    show(){
        let template = document.querySelector('#adharaDialog');

        if(!template){
            template = Handlebars.templates['popup']({'message' : this.message, 'title' : this.title});

            var wrapper= document.createElement('div');
            wrapper.innerHTML = template;

            document.querySelector('body').appendChild(wrapper);
        }else{
            template.querySelector('.modal-title').textContent = this.title;
            template.querySelector('.modal-msg').innerHTML = this.message;
        }

        $('#adharaDialog').modal('show');
    }

    /**
     * @description method to hide the popup
     * */
    hide(){
        $('#adharaDialog').modal('hide');
    }

    /**
     * @description method to rerender the popup with new message and title
     * */
    rerender(message, title){
        if(title){
            this.title = title;
        }
        this.message = message;
        this.show();
    }
}