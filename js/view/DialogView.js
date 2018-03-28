/**
 * Created by varun on 10/2/18.
 */
class AdharaDialogView extends AdharaView{

    onInit(){
        this._modalId = "adhara-dialog-id-"+Date.now();
        this.destroy = this.destroy.bind(this);
    }

    get template(){
        return "adhara-dialog";
    }

    get titleTemplate(){
        return 'Adhara Dialog';
    }

    get messageTemplate(){
        return 'Adhara Dialog Message!';
    }

    get buttons() {
        return [
            {
                attributes: {
                    "type": "button",
                    "class": "btn btn-secondary",
                    "data-dismiss": "modal"
                },
                text : 'Close'
            }
        ];
    }

    get modalId(){
        return this._modalId;
    }

    get wrapperId(){
        return `${this.modalId}-wrapper`;
    }

    get modalElement(){
        if(!this._modalElemnt || !document.body.contains(this._modalElemnt[0])){
            this._modalElemnt = $('#'+this.modalId);    //Using jQ as that is mostly used in this view
        }
        return this._modalElemnt;
    }

    get isAutoShow(){
        return true;
    }

    get destroyOnClose(){
        return true;
    }

    getParentContainerElement(){
        // return document.querySelector('.adhara-dialog')
        return document.querySelector('#'+this.wrapperId);
    }

    render(){
        let dialog_elements = document.querySelectorAll('#'+this.modalId);
        if(dialog_elements && dialog_elements.length){
            for(let i = 0; i < dialog_elements.length; i++){
                dialog_elements[i].remove()
            }
        }
        let wrapper= document.createElement('div');
        wrapper.id = this.wrapperId;
        wrapper.classList.add('adhara-dialog');
        document.querySelector('body').appendChild(wrapper);
        super.render();
    }

    format(){
        if(this.isAutoShow){
            this.show();
        }
    }

    show(){
        this.modalElement.modal('show');
        if(this.destroyOnClose){
            setTimeout(()=>{
                this.modalElement.on('hidden.bs.modal', this.destroy);
            }, 0);
        }
    }

    hide(){ //Note: destroy's if destroyOnClose is enabled. See event listener binding in show() method.
        this.modalElement.modal('hide');
    }

    destroy(){
        let wrapper_element = document.getElementById(this.wrapperId);
        if(wrapper_element) {
            wrapper_element.remove();
        }
    }

}