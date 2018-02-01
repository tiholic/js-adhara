class AdharaFormView extends AdharaView{

    /**
     * @getter
     * @returns {String|null} action, URL to be called to post data to.
     * */
    get action(){
        return this.formElement.action.split(window.location.host)[1];
    }

    get method(){
        return this.formElement.getAttribute('api-method') || "post";
    }

    /**
     * @getter
     * @instance
     * @returns {Boolean} whether to clear form on successful submission or not
     * */
    get clearFormOnSubmit(){
        return this.formElement.getAttribute('form-clear')==="true";
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Response Object
     * @description This method will be called on forms's POST/PUT call success
     * */
    onSuccess(data){
        //Override this to handle success event...
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
     * @param {Object} data - Form data
     * @returns {Boolean} Whether the data is valid or not
     * */
    validate(data){
        let validate_fn = this.formElement.getAttribute('validate-data');
        if(validate_fn) {
            return !!call_fn(validate_fn, data);
        }
        return true;
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
        return this._formElement;
    }

    /**
     * @getter
     * @private
     * @description handle making API call on behalf of the form
     * */
    _handleForm(){
        let form = this.formElement;
        if(form.submitting){
            return;
        }
        form.submitting = true;
        let apiData;
        if(!!form.querySelector('input[type="file"]')){ // ~ if(hasFiles){
            apiData = new FormData(form);
        }else{
            let formData = jQuery(form).serializeArray();
            apiData = {};
            jQuery.each(formData, function (i, fieldData) {
                apiData[fieldData.name] = fieldData.value;
            });
        }
        if(!this.validate(apiData)){
            return;
        }
        apiData = this.formatData(apiData);
        return Controller.control(
            this.method,
            {
                data_config: {
                    url: this.action
                },
                form: form,
                processor: {
                    success: (query_type, entity_config, response, response_code, pass_over)=>{
                        if(this.clearFormOnSubmit) {
                            form.reset();
                        }
                        this.onSuccess(response);
                        form.submitting = false;
                    },
                    error: (query_type, entity_config, error, response_code, pass_over)=>{
                        this.onError(error);
                        form.submitting = false;
                    }
                }
            }, apiData);
    }

    _format(container){
        this.formElement.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submit();
        });
        super._format(container);
    }

    submit(){
        this._handleForm(this.formElement);
    }

}