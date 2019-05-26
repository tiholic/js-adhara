class FormField extends AdharaView{

    /**
     * @constructor
     * @param {String} name - field name
     * @param {Object} [config={}]
     * @param {*} [config.value=undefined] - A value consumable by form field. A string for input type text and a number for input type number
     * @param {Map} [config.label_attributes={}]
     * @param {Array} [config.label_properties=[]]
     * @param {Map} [config.attributes={}]
     * @param {Array} [config.properties=[]]
     * @param {String} [config.help_text=null]
     * @param {Boolean} [config.readonly=false]
     * @param {String} [config.field_display_name=<i18n of form_name.field_name.label>] - display name of the field
     * @param {boolean} [config.nullable=true] - whether the field is nullable or not
     * @param {Object} [settings]
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * */
    constructor(name, config = {}, settings){
        settings = settings || {};
        super(settings);
        this.name = name;
        this._value = config.value;
        /**
         * {AdharaFormView} form
         * */
        this.mutator = null;
        this.readonly = config.readonly;
        this.config = config || {};
    }

    get parentContainer(){
        return super.parentContainer || `[data-field="${this.name}"]`;
    }

    set parentContainer(_){
        super.parentContainer = _;
    }

    clone(key){
        return new (this.constructor)(this.name, Object.assign({}, cloneObject(this.config)), Object.assign({}, cloneObject(this.settings), {key}));
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

    get helpTemplate(){
        return 'adhara-form-fields/help';
    }

    get safeName(){
        return this.name.replace(/\./g, '-');
    }

    get showLabel(){
        return this.config.label !== false;
    }

    get displayName(){
        return this.config.field_display_name || Adhara.i18n.get(`${this.mutator?this.mutator.fullName:''}.${this.name}.label`);
    }

    get labelAttributes() {
        return Object.assign({
            for: this.safeName,
        }, this.config.label_attributes);
    }

    get labelProperties() {
        return  (this.config.label_properties || []).slice();
    }

    get placeholder(){
        if(this.config.placeholder){
            if(typeof this.config.placeholder === "string"){
                return this.config.placeholder;
            }
            return Adhara.i18n.get([this.mutator?this.mutator.fullName:'', this.name, 'placeholder'].filter(_=>_).join('.'));
        }
    }

    get defaultFieldAttributes(){
        return {class: "form-control"};
    }

    get fieldAttributes() {
        return Object.assign({
            id: this.safeName,
            name: this.safeName,
            placeholder: this.placeholder || "",
        }, this.config.attributes || this.defaultFieldAttributes);
    }

    get fieldProperties() {
        let _p =  (this.config.label_properties || []).slice();
        if(this.config.required){
            _p.push("required");
        }
        return _p;
    }

    get helpText(){
        return this.config.help_text;
    }

    get isNullable() {
        return this.config.nullable===true;
    }

    /**
     * @returns {HTMLElement} dom element of the field that is rendered by the fieldTemplate
     * */
    getField(){
        return document.querySelector(this.parentContainer+" [name='"+this.safeName+"']");
    }

    queryValue(target){
        return (target || this.getField()).value;
    }

    queryRaw(target){
        return this.queryValue(target);
    }

    onDataChange(event, data){
        let old_value = this.value;
        this.value = this.queryValue(event && event.target);
        this.mutator._onFieldValueChanged(this.name, this.value, old_value, {event, data});
    }

    set value(_){
        this._value = _;
    }

    get value(){
        return this._value;
    }

    serialize(){
        return this.value;
    }

}