class FormField extends AdharaView{

    /**
     * @constructor
     * @param {String} name - field name
     * @param {*} [value] - A value consumable by form field. A string for input type text and a number for input type number
     * @param {Object} [config={}]
     * @param {Map} config.label_attributes
     * @param {Array} config.label_properties
     * @param {Map} config.attributes
     * @param {Array} config.properties
     * @param {String} config.field_display_name - display name of the field
     * @param {Object} [settings={}]
     * @param {String} settings.key - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * */
    constructor(name, value, config, settings){
        settings = settings || {};
        settings.c = settings.c || `[data-field="${name}"]`;
        super(settings);
        this.name = name;
        this.value = value;
        this.form_name = "";
        this.config = config || {};
    }

    get template(){
        return "adhara-form-fields/index";
    }

    /**
     * @getter
     * @returns {HandlebarTemplate} - template for the field
     * */
    get fieldTemplate(){

    }

    get displayName(){
        return this.config.field_display_name || Adhara.i18n.get(`${this.form_name}.${this.name}.label`);
    }

    get labelAttributes() {
        return Object.assign({
            for: this.name,
        }, this.config.label_attributes);
    }

    get labelProperties() {
        return this.config.label_properties || [];
    }

    get fieldAttributes() {
        return Object.assign({
            id: this.name,
            name: this.name,
            class: "form-control",
            placeholder: Adhara.i18n.get(`${this.form_name}.${this.name}.placeholder`)
        }, this.config.attributes || {});
    }

    get fieldProperties() {
        return this.config.properties || [];
    }

    getValue(){
        return this.value;
    }

}