class SelectField extends FormField{

    constructor(name, config = {}, settings){
        super(name, config, settings);
        if(this.config.options){
            console.log('ioi', this.config.options);
        }
    }

    get fieldTemplate(){
        return "adhara-form-fields/select";
    }

    set value(_){
        super.value = _;
    }

    get value(){
        let _  = super.value;
        if(_===undefined){
            return null;
        }
        return super.value;
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
        console.log(_o);
        if(this.isNullable){
            _o.unshift({value: null, display: this.placeholder || "----------"});
        }
        return _o;
    }

    format(container){
        this.value = this.queryValue();
    }

}
