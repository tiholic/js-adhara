class AdharaDialogFormView extends MutateViews(AdharaFormView, AdharaDialogView){

    primaryAction(){
        this.submit();
    }

    get primaryActionTitle(){
        return 'Save';
    }

    get submitButton(){
        return this.getParentContainerElement().querySelector('button.btn-primary');
    }

    get buttons(){
        if(this.primaryActionTitle){
            return [
                super.buttons[0],
                {
                    attributes: {
                        "type": "button",
                        "class": "btn btn-primary",
                        "data-onclick": "primaryAction"
                    },
                    text : this.primaryActionTitle
                }
            ]
        }else{
            return super.buttons;
        }

    }

}