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
    }

    onInit(){
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
     * @returns {*} Field data
     * */
    getFieldValue(field_name){
        let d = getValueFromJSON(this.mutableData, this.fieldMap[field_name].name);
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
        let field = this.getField(field_name);
        field.value = value;
        field.setState();
    }

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

    getMutatedData(){
        let hasFiles = this.hasFileFields;
        let data = hasFiles?new FormData():{};
        for(let field of this.rendered_fields){
            if(field instanceof FormField && field.isReadOnly) continue;
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
        let _v = this.getFieldValue(field.name);
        if(field instanceof AdharaMutableView){
            if(_v && _v instanceof Array && _v.length){
                field.mutableData = _v;
            }
        }else{
            field.value = _v;
        }
        return field;
    }

    get subViews(){
        let fields = this.mutableFields.map((_) => this.enhanceFieldForSubViewRendering(_));
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
    }

}