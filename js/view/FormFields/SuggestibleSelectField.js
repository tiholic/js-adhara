class SuggestibleSelectField extends FormField{

    constructor(name, config = {}, settings){
        super(name, config, settings);
        if(!config.selected_template) console.warn("No selected_template for", this.name);

        let _onDependentParentChanged = config.onDependentParentChanged;
        config.onDependentParentChanged = (value, old_value, d_event_data)=>{
            this.suggestions_field.parentChanged = true;
            _onDependentParentChanged && _onDependentParentChanged(value, old_value, d_event_data);
        };

        this.suggestions_field = new SuggestionMetaField(`__internal_${this.ts}__`, {
            label: false,
            hide_input: true,
            placeholder: false,
            data_provider: this.config.data_provider,
            attributes: {class: "form-control"},
            hint_template: config.hint_template
        }, {c: `.suggestions#${this.ts}`});
        this.suggestions_field.onHintSelected((hint, dataset)=>{
            this.hideSuggestions();
            this.handleDataChange(hint, this.value, {list_index: this.config.list_index});
            this.setState();
        });
        this.suggestions_field.onHintDeleted((hint, dataset)=>{
            this.hideSuggestions();
            this.handleDataChange(null, this.value, dataset);
            this.setState();
        });
    }

    get subViews(){
        return [ this.suggestions_field ];
    }

    get selectedTemplate(){
        return this.config.selected_template;
    }

    get editableFieldTemplate(){
        return "adhara-form-fields/suggestible-selection";
    }

    format(container) {
        super.format(container);
        this.getField().nextElementSibling.addEventListener("keydown", (event)=>{
            if(event.which === TAB){
                this.hideSuggestions();
            }
            if(event.which === ESCAPE){
                this.hideSuggestions();
            }
        });
    }

    onFocusToggle(event, data){
        if(event.which && [ESCAPE, SHIFT, TAB].indexOf(event.which) === -1){
            let isValid = (48 <= event.which) && (event.which <= 90);           //alpha numeric
            isValid = isValid || (96 <= event.which) && (event.which <= 111);   //numpad keys
            isValid = isValid || (186 <= event.which) && (event.which <= 192);  //semi-colon 186, equal sign 187, comma 188, dash 189, period 190, forward slash 191, grave accent	192
            isValid = isValid || (219 <= event.which) && (event.which <= 222);  //open bracket	219, back slash	220, close bracket 221, single quote 222
            this.showSuggestions(isValid?event.key:undefined, true);
            event.preventDefault();
        }
    }

    showSuggestions(term, append=false){
        this.getField().nextElementSibling.classList.remove("d-none");
        this.suggestions_field.update(term, append);
    }

    removeSelection(event, data){
        event.stopPropagation();
        this.handleDataChange(null, this.value, {list_index: this.config.list_index});
        this.setState();
    }

    hideSuggestions(){
        this.suggestions_field.hide();
        this.getField().nextElementSibling.classList.add("d-none");
    }

    serialize(){
        if(this.config.serialize_value){
            return this.config.serialize_value(this.value);
        }
        return this.value ? this.value.value : null;    //TODO remove this line completely!
    }

    queryValue(target){
        return this.value;
    }

    queryRaw(target){
        return this.value;
    }

}