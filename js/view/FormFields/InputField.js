class InputField extends FormField{

    get fieldTemplate(){
        return "adhara-form-fields/input";
    }

    get inputType(){
        return this.config.input_type || "text";
    }

}
