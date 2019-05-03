class AdharaFormView extends AdharaView{

    constructor(settings){
        super(settings);
    }

    get formName(){
        return "";
    }

    /**
     * @example
     * get fields(){
     *  return [
     *      InputField("question", {}, {}),
     *      TextArea("answer", {}, {})
     *  ];
     * }
     * returns {Array<FormField>>}
     * */
    get fields(){
        return [];
    }

    /**
     * @getter
     * @instance
     * @returns {Boolean} whether duplicate submissions are to be allowed
     * */
    get duplicateSubmissions(){
        return false;
    }

    /**
     * @getter
     * @instance
     * @returns {Boolean} whether to clear form on successful submission or not
     * */
    get clearFormOnSuccess(){
        return this.formElement.getAttribute('form-clear')==="true";
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Response Object
     * @description This method will be called on forms's POST/PUT call success
     * */
    onSuccess(data){
        Toast.success("Success");
    }

    /**
     * @function
     * @instance
     * @param {Object} error - Error Response Object
     * @description This method will be called on forms's POST/PUT failure
     * */
    onError(error){
        Toast.error(error);
    }

    /**
     * @function
     * @instance
     * @param {Error} error - Error thrown from validator
     * */
    onValidationError(error){
        Toast.error(error.message);
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Form data
     * @returns {Boolean} Whether the data is valid or not
     * */
    validate(data){}

    /**
     * @function
     * @instance
     * @param {Object} data - Form data
     * @returns {Object} Modified/Formatted data
     * */
    formatData(data){
        return data;
    }

    /**
     * @getter
     * @instance
     * @returns {HTMLFormElement} HTML node which represents the Form element
     * */
    get formElement(){
        if(!this._formElement || !document.body.contains(this._formElement)){
            this._formElement = this.getParentContainerElement().querySelector("form");
        }
        if(!this._formElement){
            throw new Error("No from element discovered!");
        }
        return this._formElement;
    }

    /**
     * @function
     * @instance
     * @returns {*} Field data
     * */
    getFieldValue(field_name){
        let field = this.formElement[field_name];
        if(field.type==="number"){
            return +field.value;
        }else if(field.type==="checkbox"){
            return field.checked;
        }
        return field.value;
    }

    /**
     * @function
     * @instance
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

    /**
     * @getter
     * @instance
     * @description whether to handle file uploads or not!
     * */
    get handleFileUploads(){
        return true;
    }

    updateFormState(submitting){
        this.formElement.submitting = submitting;
        this.handleSubmitButton();
        if(!submitting){
            this.reSubmitIfRequired();
        }
    }

    get submitButton(){
        return this.formElement.querySelector('[type="submit"]');
    }

    handleSubmitButton(){
        if(this.duplicateSubmissions){
            return;
        }
        let submit_button = this.submitButton;
        if(!submit_button){
            console.warn("Unable to discover 'Submit button'. Duplicate submission are not handled.");
            return;
        }
        if(this.formElement.submitting){
            submit_button.dataset.tosubmit = submit_button.innerHTML;
            submit_button.innerHTML = submit_button.dataset.inprogress
                || Adhara.i18n.getValue("form.processing", [], "")
                || submit_button.dataset.tosubmit;
            submit_button.disabled = true;
        }else{
            submit_button.dataset.inprogress = submit_button.innerHTML;
            submit_button.innerHTML = submit_button.dataset.tosubmit;
            submit_button.disabled = false;
        }
    }

    getFormData(){
        let form = this.formElement;
        let fileElements = Array.prototype.slice.apply(form.querySelectorAll('input[type="file"]')).filter(fileElement => !fileElement.disabled);
        if(this.handleFileUploads && !!fileElements.length){ // ~ if(hasFiles){
            return new FormData(form);
        }else{
            let formData = jQuery(form).serializeArray();
            let apiData = {};
            jQuery.each(formData, function (i, fieldData) {
                apiData[fieldData.name] = fieldData.value;
            });
            let checkboxes = form.querySelectorAll('[type=checkbox]');
            for(let i=0; i<checkboxes.length; i++){
                apiData[checkboxes[i].name] = checkboxes[i].checked;
            }
            return apiData;
        }
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
     * @getter
     * @private
     * @description handle making API call on behalf of the form
     * */
    async _handleForm(){
        let form = this.formElement;
        if(!form.checkValidity()){
            return form.reportValidity();
        }
        if(form.submitting){
            return false;
        }
        let apiData = this.getFormData();
        try{
            this.validate(apiData);
        }catch(e){
            return this.onValidationError(e);
        }
        apiData = this.formatData(apiData);
        this.updateFormState(true);
        await this.submitData(apiData);
        return true;
    }

    _format(container){
        super._format(container);
        if(this.errors){
            return;
        }
        if(this.formElement.dataset['_ae_'] === "true"){
            return;
        }
        this.formElement.dataset['_ae_'] = "true";
        this.formElement.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submit();
        });
    }

    reSubmitIfRequired(){
        if(this.duplicateSubmissions && this.re_submit){
            this._handleForm().then(_ => this.re_submit = !_);
        }
    }

    submit(){
        this._handleForm().then(_ => this.re_submit = !_);
    }

    get subViews(){
        return this.fields.map(f => {
            f.form_name = this.formName;
            return f;
        });
    }

}