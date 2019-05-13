class AdharaDetailView extends AdharaMutableView{

    onInit(){
        this._entityData = {};
        this.fieldMap = {};
        this.rendered_fields = [];
    }

    get fields(){
        return [];
    }

    set entityData(_){
        this._entityData = _;
    }

    get entityData(){
        return this._entityData;
    }

    getFieldValue(field_name){
        return getValueFromJSON(this.entityData, this.fieldMap[field_name].key);
    }

    get formFields(){
        return this.fields.filter(f => f instanceof FormField);
    }

    enhanceFieldForSubViewRendering(field){
        field = super.enhanceFieldForSubViewRendering(field);
        field.readonly = true;
        return field;
    }

    _onFieldValueChanged(name, value, old_value){
        // TODO implement for inline edit...
    }

}