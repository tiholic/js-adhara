class SelectField extends FormField{

    get fieldTemplate(){
        return "adhara-form-fields/select";
    }

    /**
     * @returns {Array<Object>} options
     * @example:
     * get options(){
     *      return [
     *          {"value": "H", "display_value: "High"},
     *          {"value": "M", "display_value: "Medium"},
     *          {"value": "L", "display_value: "Low"}
     *      ];
     * }
     * */
    get options(){
        return this.config.options || [];
    }

}
