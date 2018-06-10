class FormFieldInputView extends FormFieldView{

    get fieldTemplate(){
        return "adhara-form-field-input";
    }

    /**
     * @getter
     * @returns {("text"|"color"|"date"|"datetime-local"|"email"|"month"|"number"|"range"|"search"|"tel"|"time"|"url"|"week")}
     * */
    get type(){
        return "text";
    }

}