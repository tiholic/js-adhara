class CheckboxField extends InputField{

    get template(){
        return "adhara-form-fields/checkbox";
    }

    queryValue(target){
        return (target || this.getField()).checked;
    }

}
