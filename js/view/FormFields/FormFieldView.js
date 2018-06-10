class FormFieldView extends AdharaView{

    get template(){
        return "adhara-form-field";
    }

    /**
     * @getter
     * @returns {Object<String, String>} - map of attribute keys and values for form-field
     * */
    get attributes(){
        return {};
    }

    /**
     * @getter
     * @returns {Array<String>} - List of properties for form-field
     * */
    get properties(){
        return [];
    }

    get fieldWrapperTemplate(){
        return "";
    }


    /**
     * @getter
     * @returns {Object<String, String>} - map of attribute keys and values for field-wrapper
     * */
    get fieldWrapperAttributes(){
        return {};
    }

    /**
     * @getter
     * @returns {Array<String>} - List of properties for field-wrapper
     * */
    get fieldWrapperProperties(){
        return [];
    }

    /**
     * @getter
     * @returns {HandlebarTemplate} - template for the field
     * */
    get fieldTemplate(){

    }

    /**
     * @getter
     * @returns {Object<String, String>} - map of attribute keys and values for field
     * */
    get fieldAttributes(){
        return {};
    }

    /**
     * @getter
     * @returns {Array<String>} - List of properties for field
     * */
    get fieldProperties(){
        return [];
    }

}