class InputField extends FormField{

    get fieldTemplate(){
        return "adhara-form-fields/input";
    }

    getValue(){
        console.log(this.getParentContainerElement());
    }

}