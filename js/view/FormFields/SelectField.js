class SelectField extends FormField{

    get editableFieldTemplate(){
        return "adhara-form-fields/select";
    }

    get nonEditableFieldTemplate(){
        return this.config.options.filter(_ => _.value===this._value)[0] || "-";
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
        let _o = (this.config.options || []).slice();
        if(this.isNullable){
            _o.unshift({value: null, display: this.placeholder || "----------"});
        }
        return _o;
    }

    format(container){
        if(this.isEditable) this.value = this.queryValue();
    }

    queryRaw(target){
        let $f = (target || this.getField());
        if(this.isMultiple){
            return [...$f.selectedOptions].map(_ => { return {value: _.value, display: _.innerText}; });
        }
        return {
            value: $f.value,
            display: $f.children[$f.selectedIndex].innerText
        }
    }

    queryValue(target){
        if(this.isMultiple){
            return this.queryRaw(target).map(_ => _.value);
        }
        return super.queryValue(target);
    }

}
