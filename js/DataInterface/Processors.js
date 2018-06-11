let processor_helper = {
    on_success_common: function(query_type, entity_config, response, xhr){
        // put here the common functionality that is shared among all the processors on success
        // like intimating the data to other processors of contexts with mutually same data_configs
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        if(!data_config) return false;
        let similar_app_configs = Adhara.configUtils.getSimilarDataConfigs(data_config);
        let views_called = false;
        for(let i = 0; i < similar_app_configs.length; i++){
            let processor = Adhara.configUtils.getProcessor(similar_app_configs[i]);
            if(processor){
                processor.success(query_type, similar_app_configs[i], response, xhr, false);
                views_called = true;
            }
        }
        return views_called;
    },
    get_basic_processed_data: function(query_type, entity_config, response, xhr){
        let blob = Adhara.configUtils.getBlobClass(entity_config);
        let processed_data;
        if(query_type==="get_list"){
            processed_data = [];
            for(let datum of response){
                processed_data.push(new blob(datum));
            }
        }else{
            processed_data = new blob(response);
        }
        return processed_data;
    }
};

let Processor = {

    fallback: {
        success: function(query_type, entity_config, response, xhr, pass_over){
            let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, response, xhr);
            let view = Adhara.configUtils.getViewInstance(entity_config);
            // move on to the functionality common among all the processors
            if(pass_over === true){
                let view_called = processor_helper.on_success_common(query_type, entity_config, response, xhr);
                if(!view_called && view){
                    view.handleDataChange(processed_data);
                }
            }else if(view){
                view.handleDataChange(processed_data);
            }
        },
        error: function(query_type, entity_config, error, xhr){
            let processed_data = {error, response_code:xhr.status};
            // let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, error, xhr);
            //TODO is it required to create error response as a blob?
            let view = Adhara.configUtils.getViewInstance(entity_config);
            if(view) {
                view.handleDataError(processed_data);
            }
        }
    }

};
// register with this object all the processors for the data as per all the contexts