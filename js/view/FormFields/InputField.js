class InputField extends FormField{

    get fieldTemplate(){
        return "adhara-form-fields/input";
    }

    get inputType(){
        return this.config.input_type || "text";
    }

    queryValue(target){
        let _ = super.queryValue(target);
        if(_.trim() === ""){
            return null;
        }
        let converter = 'query_'+this.inputType;
        return (this[converter] && this[converter](_, (target || this.getField()))) || _;
    }

    query_number(value, field){
        return +value;
    }

    query_checbox(value, field){
        return field.checked;
    }

    query_file(value, field){
        return this.fieldAttributes.multiple?field.files:field.files[0];
    }

}


InputField.BUTTON = "button";
InputField.CHECKBOX = "checkbox";
InputField.COLOR = "color";
InputField.DATE = "date";

InputField.DATETIME_LOCAL = "datetime-local";
InputField.EMAIL = "email";
InputField.FILE = "file";
InputField.IMAGE = "image";
InputField.MONTH = "month";
InputField.NUMBER = "number";

InputField.PASSWORD = "password";

InputField.RADIO = "radio";
InputField.RANGE = "range";
InputField.RESET = "reset";

InputField.SEARCH = "search";
InputField.SUBMIT = "submit";

InputField.TEL = "tel";
InputField.TEXT = "text";
InputField.TIME = "time";
InputField.URL = "url";
InputField.WEEK = "week";