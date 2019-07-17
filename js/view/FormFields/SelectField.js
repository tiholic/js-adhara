class SelectField extends FormField{

    onInit(){
        this.isSelectedValue = this.isSelectedValue.bind(this);
    }

    get editableFieldTemplate(){
        return "adhara-form-fields/select";
    }

    get nonEditableFieldTemplate(){
        return this.config.options.filter(_ => _.value===this._value)[0] || "-";
    }

    set value(_){
        console.log("_", _);
        super.value = _;
    }

    get value(){
        let _  = super.value;
        return (_===undefined)?null:_;
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
        let _o = this.options_cache;
        if(!_o && this.config.options){
            if(this.config.options.call){
                let promise = this.config.options();
                if(promise.then) {
                    promise.then(_options => {
                        this.options_cache = _options;
                        this.setState();
                    });
                }else{
                    _o = promise;
                }
                return [];
            }else{
                _o = this.config.options;
            }
        }
        _o = (_o || []).slice();
        if(this.isNullable){
            _o.unshift({value: null, display: this.placeholder || "----------"});
        }
        return _o;
    }

    format(container){
        if(this.isEditable) this.value = this.queryValue();
    }

    isSelectedValue(rendering_value){
        console.log(1009, rendering_value, this.value);
        if(!this.value) return !rendering_value;
        if(this.isMultiple){
            return this.value.indexOf(rendering_value && rendering_value.toString())!==-1;
        }
        return rendering_value === this.value;
    }

    getSelectedValue(htmlValue){
        return (htmlValue==="")?null:htmlValue;
    }

    queryRaw(target){
        let $f = (target || this.getField());
        if(this.isMultiple){
            return [...$f.selectedOptions].map(_ => { return {value: this.getSelectedValue(_.value), display: _.innerText}; });
        }
        return {
            value: this.getSelectedValue($f.value),
            display: $f.children[$f.selectedIndex].innerText
        }
    }

    queryValue(target){
        if(this.isMultiple){
            return this.queryRaw(target).map(_ => this.getSelectedValue(_.value));
        }
        return this.getSelectedValue(super.queryValue(target));
    }

}
