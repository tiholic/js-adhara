class FormField extends AdharaView{

    /**
     * @typedef {Function} OnFieldValueChangeCallback
     * @param {*} old_value - old value
     * @param {*} new_value - new value
     * @param {Object} event_data - data for the event.
     * @param {String} event_data.initiator - sender tag who is initiating this event self and external will be set by default
     * */

    /**
     * @typedef {Function} FieldValidator
     * @param {*} value - value
     * @param {AdharaMutableView} mutator - Instance of Mutator
     * */

    /**
     * @constructor
     * @param {String} name - field name
     * @param {Object} [config={}]
     * @param {*} [config.value=undefined] - A value consumable by form field. A string for input type text and a number for input type number
     * @param {Map} [config.label_attributes={}]
     * @param {Array} [config.label_properties=[]]
     * @param {Map} [config.attributes={}]
     * @param {Array} [config.properties=[]] contentContainer
     * @param {String} [config.help_text=null]
     * @param {Boolean} [config.readonly=false]
     * @param {String} [config.input_type='']
     * @param {String} [config.display_name=<i18n of form_name.field_name.label>] - display name of the field
     * @param {boolean} [config.nullable=true] - whether the field is nullable or not
     * @param {boolean} [config.editable=true] - whether the field is editable or not. Used for display only purposes in details page, etc
     * @param {Function} [config.nullable=true] - whether the field is nullable or not
     * @param {FieldValidator} [config.validator=null] - Field validator
     * @param {Array<String>} [config.depends_on=null] - field depends on another field
     * @param {OnFieldValueChangeCallback} [config.onChange=null] - Callback function for on change
     * @param {OnFieldValueChangeCallback} [config.onDependentParentChanged=null] - Callback function for on dependent change
     * @param {Object} [settings]
     * @param {String} [settings.key=undefined] - Instance key
     * @param {String} settings.c - CSS Selector from parent view to place content of this class
     * */
    constructor(name, config = {}, settings){
        settings = settings || {};
        super(settings);
        this.name = name;
        this._value = config.value;
        this.readonly = config.readonly || false;
        this.config = config || {};
        this.field_errors = [];

        /**
         * @field {Array<FormField>} dependent form field instances
         * */
        this._dependent_fields = [];
        /**
         * {AdharaFormView} form
         * */
        this.mutator = this.config.mutator || null;
    }

    get parentContainer(){
        return super.parentContainer || `[data-field="${this.name}"]`;
    }

    set parentContainer(_){
        super.parentContainer = _;
    }

    set mutator(_){
        this._mutator = _;
    }

    get mutator(){
        return this._mutator;
    }

    clone(key){
        return new (this.constructor)(this.name, Object.assign({}, cloneObject(this.config)), Object.assign({}, cloneObject(this.settings), {key}));
    }

    get template(){
        return "adhara-form-fields/index";
    }

    get inputType(){
        return this.config.input_type;
    }

    get labelTemplate(){
        return 'adhara-form-fields/label';
    }

    get prependTemplate(){
        return this.config.prependTemplate;
    }

    get appendTemplate(){
        return this.config.appendTemplate;
    }

    get fieldErrorsTemplate(){
        return 'adhara-form-fields/error';
    }

    validate(){
        if(this.isRequired && this.isEmpty){
            this.field_errors.push(Adhara.i18n.get(`${this.mutatorName}.${this.name}.error`, 'This field is required'));
        }
        this.field_errors.push(...(
            (this.config.validator && this.config.validator(this.value, this.mutator)) || []
        ));
        this.refreshErrors();
    }

    refreshErrors(){
        let errors = this.querySelector('.invalid-feedback');
        if(this.field_errors.length) {
            errors.classList.add("d-none");
        }else{
            errors.classList.remove("d-none");
        }
        errors.innerHTML = this.field_errors.join(", ");
    }

    clearErrors(){
        this.field_errors = [];
        this.refreshErrors();
    }

    /**
     * @getter
     * @returns {HandlebarTemplate} - template for the field
     * */
    get fieldTemplate(){
        if(this.isEditable) return this.editableFieldTemplate;
        return this.nonEditableFieldTemplate;
    }

    get editableFieldTemplate(){

    }

    get nonEditableFieldTemplate(){
        return this.value || "-";
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

    get isRequired(){
        return this.config.required || this.fieldProperties.indexOf("required")!==-1;
    }

    get isMultiple(){
        return this.config.multiple || this.fieldProperties.indexOf("multiple")!==-1;
    }

    get isReadOnly(){
        return this.config.readonly || this.fieldProperties.indexOf("readonly")!==-1;
    }

    get displayName(){
        return this.config.display_name || Adhara.i18n.get(`${this.mutatorName}.${this.name}.label`);
    }

    get labelAttributes() {
        let _ = Object.assign({
            for: this.safeName,
        }, this.config.label_attributes);
        if(this.isRequired){
            _.class = _.class || [];
            _.class.push("required");
        }
        return _;
    }

    get labelProperties() {
        return  (this.config.label_properties || []).slice();
    }

    set placeholder(_){
        this.config.placeholder = _;
    }

    get mutatorName(){
        return this.mutator?this.mutator.fullName:'';
    }

    get hasFieldErrors(){
        return this.field_errors.length;
    }

    get placeholder(){
        //placeholder can be disabled by setting config.placeholder to false to by enabling label
        let _p = "";
        if(this.config.placeholder || (!this.showLabel && this.config.placeholder!==false)){
            if(typeof this.config.placeholder === "string"){
                _p = this.config.placeholder;
            }else{
                _p = Adhara.i18n.get([this.mutatorName, this.name, 'placeholder'].filter(_=>_).join('.'));
            }
        }
        return (this.isRequired && _p)?`${_p} *`:_p;
    }

    get defaultFieldAttributes(){
        if(this.isEditable) return {class: "form-control"};
        return {};
    }

    get fieldAttributes() {
        return Object.assign({
            id: this.safeName,
            name: this.safeName,
            placeholder: this.placeholder || "",
            // title: this.value?this.value:this.placeholder
        }, this.config.attributes || this.defaultFieldAttributes);
    }

    get fieldProperties() {
        let _p =  (this.config.properties || []).slice();
        if(_p.indexOf("required") !== -1) _p.splice(_p.indexOf("required"), 1);
        if(this.config.multiple) _p.push("multiple");
        if(this.config.readonly) _p.push("readonly");
        return _p;
    }

    get helpText(){
        return this.config.help_text;
    }

    get isNullable() {
        return this.config.nullable===true;
    }

    get isEditable(){
        return this.config.editable===undefined && this.mutator.isExclusivelyEditable;
    }

    get dependsOn(){
        return this.config.depends_on || [];
    }

    addToDependentFields(field){
        if(this._dependent_fields.indexOf(field) === -1){
            this._dependent_fields.push(field);
        }
    }

    /**
     * @returns {HTMLElement} dom element of the field that is rendered by the fieldTemplate
     * */
    getField(){
        return document.querySelector(this.parentContainer+" [name='"+this.safeName+"']");
    }

    queryValue(){
        return this.getField().value;
    }

    queryRaw(){
        return this.queryValue();
    }

    onDataChange(event, event_data){
        this.handleDataChange(this.queryValue(), this.value, event_data);
    }

    handleDataChange(value, old_value, event_data={}){
        event_data.initiator = event_data.initiator || "self";
        if(this.config.onChange){
            this.config.onChange(value, old_value, event_data);
        }
        for(let dependent_field of this._dependent_fields){
            let d_event_data = Object.assign({}, event_data, {initiator: "dependency"});
            if(dependent_field.config.onDependentParentChanged){
                dependent_field.config.onDependentParentChanged(value, old_value, d_event_data);
            }else if(event_data.initiator==="self"){
                dependent_field.changeData(null, d_event_data);
            }
        }
        this.value = value;
        if(this.field_errors.length) this.validate();
        this.mutator._onFieldValueChanged(this.name, this.value, old_value, event_data);
    }

    changeData(value, event_data={}){
        event_data.initiator = event_data.initiator || "external";
        this.handleDataChange(value, this.value, event_data);
        this.setState();
    }

    get isEmpty(){
        if(typeof this.value === "boolean") return false;
        if(this.value instanceof Array) return !this.value.length;
        return !this.value;
    }

    set value(_){
        this._value = _;
    }

    get value(){
        return this._value;
    }

    serialize(){
        if(this.value===undefined) this.value = this.queryValue();
        return this.value;
    }

}