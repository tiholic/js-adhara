/**
 * Created by varun on 21/12/17.
 */

//TODO Enhance
class AdharaDialogView extends AdharaView{

    get data(){
        return {
            'title' : 'Adhara Dialog',
            'message' : 'Adhara Dialog Message!!!!!!!!',
            'confirmOptions' : {
                'isConfirm' : false
            }
        };
    }

    get template(){
        return "adhara-dialog";
    }

    get modalId(){
        return "adhara-dialog-id-"+Date.now();
    }

    render(){
        let template = document.querySelector(this._getParentContainer());
        if(!template){
            template = this._getHTML();
            let wrapper= document.createElement('div');
            wrapper.innerHTML = template;
            document.querySelector('body').appendChild(wrapper);
        }
        $('#adharaDialog').modal('show');
    }

    hide(){
        $('#adharaDialog').modal('hide');
    }

}