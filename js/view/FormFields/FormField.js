class FormField extends AdharaView{

    /**
     * @constructor
     * @param {String} name - field name
     * @param {Object} [config={}]
     * @param {String} [config.key=name] - a key to get field data from form data
     * @param {*} [config.value=undefined] - A value consumable by form field. A string for input type text and a number for input type number
     * @param {Map} [config.label_attributes={}]
     * @param {Array} [config.label_properties=[]]
     * @param {Map} [config.attributes={}]
     * @param {Array} [config.properties=[]]
     * @param {Boolean} [config.readonly=false]
     * @param {String} [config.field_display_name=<i18n of form_name.field_name.label>] - display name of the field
     * @param {boolean} [config.nullable=true] - whether the field is nullable or not
     * @param {Object} [settings={}]
     * */
    constructor(name, config = {}, settings){
        settings = settings || {};
        settings.c = settings.c || `[data-field="${name}"]`;
        super(settings);
        this.name = name;
        this.key = config.key || name;
        this._value = config.value;
        this.ts = `d${performance.now().toString().replace(".", '-')}`;
        /**
         * {AdharaFormView} form
         * */
        this.mutator = undefined;
        this.readonly = config.readonly;
        this.config = config || {};
    }

    get template(){
        return "adhara-form-fields/index";
    }

    get labelTemplate(){
        return 'adhara-form-fields/label';
    }

    /**
     * @getter
     * @returns {HandlebarTemplate} - template for the field
     * */
    get fieldTemplate(){

    }

    get showLabel(){
        return this.config.label !== false;
    }

    get displayName(){
        return this.config.field_display_name || Adhara.i18n.get(`${this.mutator?this.mutator.name:''}.${this.name}.label`);
    }

    get labelAttributes() {
        return Object.assign({
            for: this.name,
        }, this.config.label_attributes);
    }

    get labelProperties() {
        return this.config.label_properties || [];
    }

    get placeholder(){
        if(this.config.placeholder){
            if(typeof this.config.placeholder === "string"){
                return this.config.placeholder;
            }
            return Adhara.i18n.get([this.mutator?this.mutator.name:'', this.name, 'placeholder'].filter(_=>_).join('.'));
        }
    }

    get fieldAttributes() {
        return Object.assign({
            id: this.name,
            name: this.name,
            placeholder: this.placeholder || "",
        }, this.config.attributes || {});
    }

    get fieldProperties() {
        return this.config.properties || [];
    }

    get isNullable(){
        return this.config.nullable || false;
    }

    /**
     * @returns {HTMLElement} dom element of the field that is rendered by the fieldTemplate
     * */
    getField(){
        return document.querySelector(this.parentContainer+" [name='"+this.name+"']");
    }

    queryValue(target){
        return (target || this.getField()).value;
    }

    onDataChange(event, data){
        let old_value = this.value;
        this.value = this.queryValue(event && event.target);
        this.mutator._onFieldValueChanged(this.name, this.value, old_value);
    }

    set value(_){
        this._value = _;
    }

    get value(){
        // if(!this.rendered)
        return this._value;
        // return this.queryValue();
    }

    serialize(){
        return this.value;
    }

}