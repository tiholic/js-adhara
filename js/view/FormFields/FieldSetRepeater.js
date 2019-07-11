/**
 * @class
 * @param {Object} [settings]
 * @param {String} [settings.name] - field name
 * @param {String} [settings.key=undefined] - Instance key
 * @param {String} settings.c - CSS Selector from parent view to place content of this class
 * @param {Function} settings.get_fields - fields list for index
 * @param {Function} settings.serializedRowFilter -  filter put serialized rows based on input values
 * @param {HandlebarTemplate} settings.fieldSetTemplate - CSS Selector from parent view to place content of this class
 * */
class FieldSetRepeater extends AdharaMutableView{

    onInit(){
        super.onInit();
        this.fieldMap = null;
        this.mutableData = ((this.mutableData instanceof Array) && this.mutableData.length) ? this.mutableData : [{}];
        this.fieldSetMap = [];
    }

    get template(){
        return 'adhara-form-fields/repeater';
    }

    get isHorizontal(){
        return this.settings.style===FieldSetRepeater.style.HORIZONTAL;
    }

    get addNewText(){
        return this.settings.add_new_text;
    }

    get repeaterFieldSetClass(){
        return this.isHorizontal?"d-inline-block":"d-flex";
    }

    addFieldSet(event, data){
        this.mutableData.push({});
        this.setState();
    }

    removeFieldSet(event, data){
        if(this.mutableData.length > 1) {
            this.mutableData.splice(data.idx, 1);
            this.setState();
        }
    }

    getFieldsForIndex(idx){
        return (this.settings.get_fields && this.settings.get_fields(idx)) || this.settings.fields;
    }

    get subViews(){
        let repeated_fields = [];
        for(let i=0; i<this.mutableData.length; i++){
            for(let field of this.getFieldsForIndex(i).filter(this.isFormField)){
                let _field = field.clone(`repeater-${this.safeName}-${i}`);
                _field.mutator = this;
                _field.parentContainer = `#fieldset-${i}-${this.safeName} [data-field=${_field.safeName}]`;
                if(!this.isHorizontal){ //=> vertical growing repeater
                    _field.config.label = _field.config.label!==false && i===0;
                }
                _field.config.list_index = i;
                _field.config.attributes["data-repeaterIndex"] = i;
                if(!this.fieldSetMap[i]) this.fieldSetMap[i] = {};
                this.fieldSetMap[i][_field.name] = _field;
                _field.value = this.getFieldValueByIndex(_field.name, i);
                repeated_fields.push(_field);
            }
        }
        this.rendered_fields = repeated_fields.slice();
        return repeated_fields;
    }

    filterSerializedRows(data){
        if(this.settings.serializedRowFilter){
            return this.settings.serializedRowFilter(data);
        }
        return data.filter(datum => !!Object.values(datum).filter(_ => _).length);
    }

    getFieldValue(field_name){
        throw new Error("invalid function called for a repeater field set. Use getFieldValueByIndex");
    }

    /**
     * @returns {*} Field data
     * */
    getFieldValueByIndex(field_name, row_index){
        return getValueFromJSON(this.mutableData[row_index], this.fieldSetMap[row_index][field_name].name);
    }

    /**
     * @returns {*} Field data
     * */
    getFieldByIndex(field_name, index){
        return this.rendered_fields.filter(_ => _.name===field_name && _.config.list_index === index)[0];
    }

    getMutatedData(){
        let data = [];
        for(let field of this.rendered_fields){
            if(!data[field.config.list_index]){
                data[field.config.list_index] = {};
            }
            setValueToJson(data[field.config.list_index], field.name, field.serialize());
        }
        return this.filterSerializedRows(data);
    }

    onFieldValueChangedForIndex(field_name, value, old_value, index){
        //    can override as required
    }

    _onFieldValueChanged(field_name, value, old_value, event_data){
        let index = event_data.repeaterindex || event_data.list_index;
        setValueToJson(this.mutableData[index], this.fieldSetMap[index][field_name].name, value);
        this.onFieldValueChangedForIndex(field_name, value, old_value, index);
        this.onMutableDataChanged();
    }

}

FieldSetRepeater.style = {
    HORIZONTAL: "h",
    VERTICAL: "v"
};