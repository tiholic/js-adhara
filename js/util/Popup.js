/**
 * Created by varun on 21/12/17.
 */

class AdharaPopup{

    /**
     * @param title The title of the popup
     * @param message The message for the popup
     * @param confirmOptions The confirm options,
     *        1. isConfirm - if the popup is a confirm dialog
     *        2. text - the text for the confirm button
     *        3. callback - the callback on confirm
     * */

    constructor(title, message, confirmOptions){
        this.message = message;
        this.title = title;
        this.confirmOptions = AdharaPopup.validateConfirm(confirmOptions);
    }

    /**
     * @description method to show the popup
     * */
    show(){
        let template = document.querySelector('#adharaDialog');

        if(!template){
            template = Handlebars.templates['popup']({'message' : this.message, 'title' : this.title, 'confirmOptions' : this.confirmOptions});

            let wrapper= document.createElement('div');
            wrapper.innerHTML = template;

            document.querySelector('body').appendChild(wrapper);

            template = wrapper.querySelector('#adharaDialog');

        }else{
            template.querySelector('.modal-title').textContent = this.title;
            template.querySelector('.modal-msg').innerHTML = this.message;
        }

        if(this.confirmOptions.isConfirm){
            let confirmBtn = template.querySelector('.confirm-btn');
            if(!confirmBtn){
                //TODO handle in a better fashion
                template.querySelector('.modal-footer').appendChild(
                    jQuery('<button type="button" class="btn btn-secondary confirm-btn" data-dismiss="modal">'+this.confirmOptions.text+'</button>').get(0)
                );
            }
            confirmBtn.onclick = this.confirmOptions.callback;
        }else if(template.querySelector('.confirm-btn')){
            template.querySelector('.confirm-btn').remove();
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
    reconfig(message, title, confirmOptions){
        if(title){
            this.title = title;
        }
        this.message = message;
        this.confirmOptions = AdharaPopup.validateConfirm(confirmOptions);
    }

    static validateConfirm(confirmOptions){
        let ret = confirmOptions;
        if(!ret){
            ret = {
                isConfirm : false
            };
        }else if(!ret.text){
            ret.text = "Confirm ?";
        }
        return ret;
    }
}