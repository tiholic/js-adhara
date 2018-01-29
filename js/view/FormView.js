class AdharaFormView extends AdharaView{

    onSuccess(data){
        //Override this to handle success event...
    }

    onError(error){
        //Override this to handle error event...
    }

    _onSuccessProcessor(context, data){
        this.onSuccess(data, context.form);
    }

    _onErrorProcessor(context, error){
        this.onError(error);
    }

    getFormElement(){
        return this.getParentContainerElement().querySelector("form");
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
        return Controller.control(
            form.getAttribute('api-method') || "post",
            {
                data_config: {url: form.action.split(window.location.host)[1]},
                form: form,
                processor: {
                    success: (context, data)=>{
                        this._onSuccessProcessor(context, data);
                        form.submitting = false;
                    },
                    error: (context, error)=>{
                        this._onErrorProcessor(context, error);
                        form.submitting = false;
                    }
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

    _format(container){
        container.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
            this._handleForm(event.target);
        });
        jQuery(container).on('success', 'form', response => {
            this.onSuccess();
        });
        jQuery(container).on('failure', 'form', (e,message) => {
            this.onError();
        });
        super._format(container);
    }

}