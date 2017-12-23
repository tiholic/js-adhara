/**
 * Created by varun on 21/12/17.
 */

class AdharaDialogView extends AdharaView{

    constructor(){
        super();
    }

    get data(){
        return {
            'title' : 'Adhara Dialog',
            'message' : 'Adhara Dialog Message!!!!!!!!',
            'confirmOptions' : {
                'isConfirm' : false
            }
        };
    }

    render(){

        let template = document.querySelector('#'+this.contentSelector);

        if(!template){
            template = Handlebars.templates['popup']({'contentSelector' : this.contentSelector, 'data' : this.data});

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