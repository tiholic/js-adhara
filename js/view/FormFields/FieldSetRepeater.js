class FieldSetRepeater extends AdharaMutableView{

    /**
     * @constructor
     * @param {Object} [settings]
     * * @param {String} [settings.name] - field name
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * @param {String} settings.fields - CSS Selector from parent view to place content of this class
     * @param {HandlebarTemplate} settings.fieldSetTemplate - CSS Selector from parent view to place content of this class
     * */
    constructor(settings = {}) {
        settings.c = settings.c || `[data-field="${settings.name}"]`;
        super(settings);
        this.fieldSetTemplate = settings.fieldSetTemplate;
        this.field_set_data = [{}];
    }

    get template(){
        return 'adhara-form-fields/repeater';
    }

    addFieldSet(event, data){
        this.field_set_data.push({});
        this.setState();
    }

    removeFieldSet(event, data){
        if(this.field_set_data.length > 1) {
            this.field_set_data.splice(data.idx, 1);
            this.setState();
        }
    }

    get subViews(){
        let repeated_fields = [];
        for(let field of this.mutableFields){
            for(let i=0; i<this.field_set_data.length; i++){
                let _field = field.clone();
                let fieldset_datum = this.field_set_data;
                _field.mutator = this;
                _field.value = getValueFromJSON(fieldset_datum, _field.name);
                _field.parentContainer = `#fieldset-${i}-${this.safeName} [data-field=${_field.safeName}]`;
                _field.config.label = i===0;
                repeated_fields.push(_field);
            }
        }
        this.rendered_fields = repeated_fields.slice();
        return repeated_fields;
    }

}