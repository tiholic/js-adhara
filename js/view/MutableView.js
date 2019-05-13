class AdharaMutableView extends AdharaView{

    /**
     * @constructor
     * @param {Object} [settings]
     * @param {String} [settings.name] - field name
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * @param {String} settings.fields - CSS Selector from parent view to place content of this class
     * */
    constructor(settings = {}) {
        super(settings);
        this._name = settings.name;
        this._fields = settings.fields;
        this.mutator = null;
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

    get mutableFields(){
        return this.fields.filter(f => (f instanceof FormField || f instanceof AdharaMutableView));
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
        return getValueFromJSON(this.mutableData, this.fieldMap[field_name].name);
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
            setValueToJson(data, field.name, field.serialize());
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

    /**
     * @param {FormField} field
     * */
    enhanceFieldForSubViewRendering(field){
        this.fieldMap[field.name] = field;
        field.mutator = this;
        field.value = this.getFieldValue(field.name);
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

    _onFieldValueChanged(field_name, value, old_value){
        setValueToJson(this._mutable_data, this.fieldMap[field_name].name, value);
        this.onFieldValueChanged(field_name, value, old_value);
        this.onMutableDataChanged();
    }

}