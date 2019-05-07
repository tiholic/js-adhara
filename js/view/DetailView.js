class AdharaDetailView extends AdharaMutableView{

    onInit(){
        this._entityData = {};
        this.fieldMap = {};
        this.rendered_fields = [];
    }

    get fields(){
        return [];
    }

    get isMutationReadonly(){
        return true;
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

    get subViews(){
        let fields = this.formFields.map(f => {
            this.fieldMap[f.name] = f;
            f.parent = this;
            f.value = this.getFieldValue(f.name);
            f.readonly = true;
            return f;
        });
        this.rendered_fields = fields.slice();
        return fields;
    }

    _onFieldValueChanged(name, value, old_value){
        // TODO implement for inline edit...
    }

}