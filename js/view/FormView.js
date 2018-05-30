class AdharaFormView extends AdharaView{

    /**
     * @getter
     * @returns {String|null} action, URL to be called to post data to.
     * */
    get action(){
        return this.formElement?( this.formElement.action.split(window.location.host)[1] ): "";
    }

    get method(){
        return this.formElement?( this.formElement.getAttribute('api-method') || "post" ): "post";
    }

    get formEntityConfig(){
        let form = this.formElement;
        return Adhara.app.getEntityConfigFromContext({
            data_config: {
                url: this.formatURL(this.action, this.getURLPathParams()),
                allowed_query_types: [this.method],
                default_query_type: this.method
            },
            processor: {
                success: (query_type, entity_config, response, xhr, pass_over)=>{
                    if(this.clearFormOnSuccess) {
                        form.reset();
                    }
                    this.updateFormState(false);
                    this.onSuccess(response);
                },
                error: (query_type, entity_config, error, xhr, pass_over)=>{
                    this.updateFormState(false);
                    this.onError(error);
                }
            }
        });
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
    validate(data){
        let validate_fn = this.formElement.getAttribute('validate-data');
        if(validate_fn) {
            return !!call_fn(validate_fn, data);
        }
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Form data
     * @returns {Object} Modified/Formatted data
     * */
    formatData(data){
        let format_fn = this.formElement.getAttribute('format-data');
        if(format_fn) {
            data = call_fn(format_fn, data);
        }
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
     * @funciton
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
     * @funciton
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
            submit_button.innerHTML = submit_button.dataset.inprogress || submit_button.dataset.tosubmit;
            submit_button.disabled = true;
        }else{
            submit_button.dataset.inprogress = submit_button.innerHTML;
            submit_button.innerHTML = submit_button.dataset.tosubmit;
            submit_button.disabled = false;
        }
    }

    /**
     * @getter
     * @private
     * @description handle making API call on behalf of the form
     * */
    _handleForm(){
        let form = this.formElement;
        if(form.submitting){
            return false;
        }
        let apiData;
        let fileElements = Array.prototype.slice.apply(form.querySelectorAll('input[type="file"]')).filter(fileElement => !fileElement.disabled);
        if(this.handleFileUploads && !!fileElements.length){ // ~ if(hasFiles){
            apiData = new FormData(form);
        }else{
            let formData = jQuery(form).serializeArray();
            apiData = {};
            jQuery.each(formData, function (i, fieldData) {
                apiData[fieldData.name] = fieldData.value;
            });
        }
        try{
            this.validate(apiData);
        }catch(e){
            return this.onValidationError(e);
        }
        apiData = this.formatData(apiData);
        this.updateFormState(true);
        this.control(this.method, this.formEntityConfig, apiData);
        return true;
    }

    _format(container){
        super._format(container);
        if(this.errors){
            return;
        }
        this.formElement.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submit();
        });
    }

    reSubmitIfRequired(){
        this.re_submit = this.duplicateSubmissions && this.re_submit && !this._handleForm();
    }

    submit(){
        this.re_submit = !this._handleForm();
    }

}