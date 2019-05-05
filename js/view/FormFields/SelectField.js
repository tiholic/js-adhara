class SelectField extends FormField{

    onInit(){
        super.onInit();
    }

    get fieldTemplate(){
        return "adhara-form-fields/select";
    }

    /**
     * @returns {Array<Object>} options
     * @example:
     * get options(){
     *      return [
     *          {"value": "H", "display: "High"},
     *          {"value": "M", "display: "Medium"},
     *          {"value": "L", "display: "Low"}
     *      ];
     * }
     * */
    get options(){
        let _o = this.config.options || [];
        if(this.isNullable){
            _o.unshift({value: null, display: this.placeholder});
        }
        return _o;
    }

}
