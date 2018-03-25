/**
 * Created by varun on 10/2/18.
 */
class AdharaDialogView extends AdharaView{

    onInit(){
        this._modelId = "adhara-dialog-id-"+Date.now();
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
        return this._modelId;
    }

    get isAutoShow(){
        return true;
    }

    get destroyOnClose(){
        return true;
    }

    getParentContainerElement(){
        return document.querySelector('.adhara-dialog')
    }

    render(){
        let dialog_elements = document.querySelectorAll('#'+this.modalId);
        if(dialog_elements && dialog_elements.length){
            for(let i = 0; i < dialog_elements.length; i++){
                dialog_elements[i].remove()
            }
        }
        let wrapper= document.createElement('div');
        wrapper.classList.add('adhara-dialog');
        document.querySelector('body').appendChild(wrapper);
        let render_fn = super.render;
        let self = this;
        setTimeout(function(){
            render_fn.call(self);
            }, 0);
    }

    format(){
        if(this.isAutoShow){
            this.show();
        }
    }

    show(){
        //TODO modal.dispose is not available in bootstrap 3
        $('#'+ this.modalId).modal('show');
        if(this.destroyOnClose){
            setTimeout(()=>{
                $('#'+this.modalId).on('hidden.bs.modal', function (event) {
                    $('#'+this.modalId).modal('dispose');
                });
            }, 0);
        }
    }

    hide(){
        $('#'+this.modalId).modal('hide');
    }

    destroy(){
        //destroy .adhara-dialog element
    }
}