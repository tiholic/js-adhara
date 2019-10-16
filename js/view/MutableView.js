class AdharaMutableView extends AdharaView{

    /**
     * @constructor
     * @param {Object} [settings]
     * @param {String} [settings.name] - field name
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * @param {Object} settings.options - custom options to be passed
     * @param {String} [settings.fields=[]] - CSS Selector from parent view to place content of this class
     * */
    constructor(settings = {}) {
        settings.key = settings.key || settings.name;
        super(settings);
        this.parentContainer = this.parentContainer || `[data-field="${settings.name}"]`;
        this._name = settings.name;
        this._fields = settings.fields;
        this.mutator = null;
        this._registerEvents(["Saved", "Cancelled"]);
        this.has_field_errors = false;
    }

    onInit(){
        this._resetMetaAndData();
    }

    _resetMetaAndData(){
        this._mutable_data = {};
        this.fieldMap = {};
        this.rendered_fields = [];
    }

    get name(){
        return this._name || "";
    }

    get fullName(){
        return ((this.mutator&&this.mutator.name)?(this.mutator.name+"."):"")+this.name;
    }

    get safeName(){
        return this.name.replace('.', '-');
    }

    get key(){
        return this.name;
    }

    /**
     * @example
     * get fields(){
     *  return [
     *      InputField("question", {}, {}),
     *      TextArea("answer", {}, {})
     *  ];
     * }
     * returns {Array<FormField>}
     * */
    get fields(){
        return this._fields || [];
    }

    isFormField(f){
        return (f instanceof FormField || f instanceof AdharaMutableView);
    }

    get mutableFields(){
        return this.fields.filter(this.isFormField);
    }

    set mutableData(_){
        this._mutable_data = _;
    }

    get mutableData(){
        return this._mutable_data;
    }

    /**
     * @param {String} field_name
     * @returns {*} Field data
     * */
    getFieldValueFromMutableData(field_name){
        return getValueFromJSON(this.mutableData, this.fieldMap[field_name].name);
    }

    /**
     * @param {String} field_name
     * @returns {*} Field data
     * */
    getFieldValue(field_name){
        let d = this.getFieldValueFromMutableData(field_name);
        if(d===undefined){
            d = this.fieldMap[field_name].value;
        }
        return d;
    }

    get ignoreNulls(){
        return false;
    }

    /**
     * @returns {*} Field data
     * */
    setFieldValue(field_name, value){
        this.getField(field_name).changeData(value);
    }

    /**
     * @deprecated use getMutableData instead.
     * */
    getFormData(){
        let hasFiles = false;
        for(let rendered_field of this.rendered_fields){
            if(rendered_field instanceof InputField && rendered_field.config.input_type === InputField.FILE){
                hasFiles = true;
            }
        }
        if(hasFiles){
            let formData = new FormData();
            for(let [key, value] of Object.entries(data)){
                formData.append(key, value);
            }
            return formData;
        }
    }

    get hasFileFields(){
        for(let rendered_field of this.rendered_fields){
            if(rendered_field instanceof InputField && rendered_field.config.input_type === InputField.FILE){
                return true;
            }
        }
        return false;
    }

    get hasFieldErrors(){
        return this.has_field_errors;
    }

    getFieldsForValidation(){
        return this.rendered_fields;
    }

    validate(update_state=false) {
        this.clearErrors();
        this.has_field_errors = false;
        for(let field of this.getFieldsForValidation()) {
            field.validate();
            this.has_field_errors = this.has_field_errors || !!field.hasFieldErrors;
        }
        update_state && this.setState();
    }

    clearErrors(update_state=false){
        for(let field of this.rendered_fields) {
            field.clearErrors();
        }
        update_state && this.setState();
    }

    getMutatedData() {
        this.validate();
        let hasFiles = this.hasFileFields;
        let data = hasFiles?new FormData():{};
        for(let field of this.rendered_fields){
            if((field instanceof FormField) && field.isReadOnly) continue;
            let serialized_value = (field instanceof AdharaMutableView)?field.getMutatedData():field.serialize();
            if((!this.ignoreNulls || serialized_value!==null)){
                if(hasFiles){
                    if(field.config.input_type === InputField.FILE && field.fieldAttributes.multiple==="true"){
                        if(serialized_value){
                            for(let file of serialized_value){
                                data.append(field.name, file);
                            }
                        }
                    }else{
                        if(typeof serialized_value !== "string"){
                            serialized_value = JSON.stringify(serialized_value);
                        }
                        data.append(field.name, serialized_value);
                    }
                }else{
                    setValueToJson(data, field.name, serialized_value);
                }
            }
        }
        return data;
    }

    getField(field_name){
        return this.fieldMap[field_name];
    }

    /**
     * @getter
     * @param {*} data to be submitted destination
     * @returns {Promise} response on submission.
     * */
    async submitData(data){
        throw new Error("Must override `submitData`");
    }

    get isExclusivelyEditable(){
        if(this.mutator){
            return this.mutator.isExclusivelyEditable;
        }
        return true;
    }

    /**
     * @param {FormField} field
     * */
    enhanceFieldForSubViewRendering(field){
        this.fieldMap[field.name] = field;
        field.mutator = this;
        let _v = this.getFieldValueFromMutableData(field.name);
        if(field instanceof AdharaMutableView){
            if(_v){
                if(_v instanceof Array){
                    if(_v.length) field.mutableData = _v;
                }else{
                    field.mutableData = _v;
                }
            }else{
                if(field instanceof FieldSetRepeater){
                    field.mutableData = [{}];
                }else{
                    field.mutableData = {};
                }
            }
        }else{
            field.value = _v;
        }
        return field;
    }

    /**
     * @returns {Array<FormField>}
     * */
    prepareFieldsForRendering(){
        let fields = this.mutableFields.map((_) => this.enhanceFieldForSubViewRendering(_));
        for(let field of fields){
            if((field instanceof FormField) && field.dependsOn.length){
                for(let dependent_field_name of field.dependsOn){
                    this.getField(dependent_field_name).addToDependentFields(field);
                }
            }
        }
        return fields;
    }

    get subViews(){
        let fields = this.prepareFieldsForRendering();
        this.rendered_fields = fields.slice();
        return fields;
    }

    onMutableDataChanged(){
        //    Can override if required...
    }

    onFieldValueChanged(field_name, value, old_value){
        //    can override as required
    }

    _onFieldValueChanged(field_name, value, old_value, {event, data}={}){
        setValueToJson(this._mutable_data, this.fieldMap[field_name].name, value);
        this.onFieldValueChanged(field_name, value, old_value);
        this.onMutableDataChanged();
        if(this.mutator){
            this.mutator._onFieldValueChanged(this.name, this._mutable_data, this._mutable_data, {event, data});    //TODO sending same data for old and new values!
        }
    }

}