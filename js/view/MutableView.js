class AdharaMutableView extends AdharaView{

    onInit(){
        this._mutable_data = {};
        this.fieldMap = {};
        this.rendered_fields = [];
    }

    get name(){
        return "";
    }

    /**
     * @example
     * get fields(){
     *  return [
     *      InputField("question", {}, {}),
     *      TextArea("answer", {}, {})
     *  ];
     * }
     * returns {Array<FormField>>}
     * */
    get fields(){
        return [];
    }

    get mutableFields(){
        return this.fields.filter(f => f instanceof FormField);
    }

    set mutableData(_){
        this._mutable_data = _;
    }

    get mutableData(){
        return this._mutable_data;
    }

    /**
     * @returns {*} Field data
     * */
    getFieldValue(field_name){
        return getValueFromJSON(this.formData, this.fieldMap[field_name].key);
    }

    /**
     * @returns {*} Field data
     * */
    setFieldValue(field_name, value){
        let field = this.formElement[field_name];
        if(field.type==="checkbox"){
            field.checked = true;
        }else{
            field.value = value;
        }
    }

    getMutatedData(){
        let data = {};
        for(let field of this.rendered_fields){
            setValueToJson(data, field.key, field.serialize());
        }
        return data;
    }

    /**
     * @getter
     * @param {*} data to be submitted destination
     * @returns {Promise} response on submission.
     * */
    async submitData(data){
        throw new Error("Must override `submitData`");
    }

    get subViews(){
        let fields = this.mutableFields.map(f => {
            this.fieldMap[f.name] = f;
            f.mutator = this;
            f.value = this.getFieldValue(f.name);
            f.readonly = this.isMutationReadonly || false;
            return f;
        });
        this.rendered_fields = fields.slice();
        return fields;
    }

    onMutableDataChanged(){
        //    Can override if required...
    }

    onFieldValueChanged(field_name, value, old_value){
        //    can override as required
    }

    _onFieldValueChanged(field_name, value, old_value){
        setValueToJson(this._mutable_data, this.fieldMap[field_name].key, value);
        this.onFieldValueChanged(field_name, value, old_value);
        this.onMutableDataChanged();
    }

}