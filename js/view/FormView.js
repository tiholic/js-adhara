class AdharaFormView extends AdharaView{

    onSuccess(data, form){
        //Override this to handle success event...
    }

    onError(error, form){
        //Override this to handle error event...
    }

    _onSuccessProcessor(context, data){
        this.onSuccess(data, context.form);
    }

    _onErrorProcessor(context, error){
        this.onError(error);
    }

    _handleForm(form){
        if(form.submitting){
            return;
        }else{
            form.submitting = true;
        }
        let hasFiles = !!form.querySelector('input[type="file"]');
        let apiData;
        if(hasFiles){
            apiData = new FormData(form);
        }else{
            let formData = jQuery(form).serializeArray();
            apiData = {};
            jQuery.each(formData, function (i, fieldData) {
                apiData[fieldData.name] = fieldData.value;
            });
        }
        let format_fn = form.getAttribute('format-data');
        if(format_fn){
            apiData = call_fn(format_fn, apiData);
        }
        if(apiData===false){return;}
        return Controller.call(
            form.getAttribute('api-method') || "post",
            {
                data_config: {url: form.action.split(window.location.host)[1]},
                form: form,
                processor: {
                    success: (context, data)=>this._onSuccessProcessor,
                    error: (context, data)=>this._onErrorProcessor
                }
            }, apiData);
        /*RestAPI[form.getAttribute('api-method')]({
            url: form.action.split(window.location.host)[1],
            data: apiData,
            successMessage: form.getAttribute('success-message'),
            handleError: form.getAttribute('handle-error')!=="false",
            success: function(data){
                if(form.getAttribute('form-clear')==="true") {
                    form.reset();
                }
                jQuery(form).trigger('success', data);
            },
            failure: function(message){
                jQuery(form).trigger('failure', message);
            }
        });*/
    }

    _format(element){
        element.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
            this._handleForm(event.target);
        });
        jQuery(element).on('success', 'form', response => {
            this.onSuccess();
        });
        jQuery(element).on('failure', 'form', (e,message) => {
            this.onError();
        });
    }

}