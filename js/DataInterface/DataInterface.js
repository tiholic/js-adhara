class DataInterface extends StorageSelector.select(){

    constructor(){
        super();
        this.config = Adhara.app.DIConfig;
        this.request_queue = {}; // for NON-get requests
        this.rem_que = {};
        this.db_table = this.select(this.config.http_cache_table);
    }

    // local helpers ...
    makeServiceCall(url, method_name, data){
        data = Adhara.app.requestMiddleWare(url, method_name, data);
        return new Promise(function (resolve, reject) {
            // make API call and fetch data OR fetch from client storage, pass on_success and on_failure to the thing
            RestAPI[method_name] ({
                url, data, crossDomain: true, xhrFields: { "withCredentials": true },
                beforeSend(xhr){
                    xhr.withCredentials = true;
                },
                success(response, xhr){
                    resolve({response, xhr});
                },
                failure (error, xhr){
                    reject({error, xhr});
                }
            });
        });
    }

    handle_bulk_config(query_type, entity_configs, data, opts){
        if(['get', 'get_list'].indexOf(query_type) < 0) return;
        let num_reqs = entity_configs.length,
            result = new Array(num_reqs),
            entry_count = 0;
        let caller_viewable = opts.caller_view && (opts.caller_view instanceof AdharaView
            || (opts.caller_view.hasOwnProperty('handleDataChange')
                && typeof opts.caller_view.handleDataChange === 'function'));
        for(let i=0; i<num_reqs; i++){
            let dummy_entity_config = Object.assign({}, entity_configs[i]);
            dummy_entity_config.processor = (function IIFE(scoped_i){
                return {
                    success: function(query_type, entity_config, response, xhr){
                        let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, response, xhr);
                        result[scoped_i] = processed_data;
                        entry_count++;
                        if(caller_viewable) {
                            if(entry_count === num_reqs) {
                                opts.caller_view.handleDataChange(result);
                            }
                        } else {
                            Adhara.configUtils.getViewInstance(entity_config).handleDataChange(processed_data);
                        }
                    },
                    error: function(query_type, entity_config, error, xhr){
                        let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, error, xhr);
                        result[scoped_i] = processed_data;
                        entry_count++;
                        if(caller_viewable) {
                            if(entry_count === num_reqs){
                                opts.caller_view.handleDataChange(result);
                            }
                        } else {
                            Adhara.configUtils.getViewInstance(entity_config).handleDataError(processed_data);
                        }
                    }
                };
            })(i);
            this.enqueue(query_type, dummy_entity_config, data, opts);
        }
    }

    handle_batch_enqueue(entity_config){
        let batch_result_map = {};
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        let batch_calls = data_config.batch_data_override;
        function check_fills(obj){
            for(let k in obj){
                if(obj.hasOwnProperty(k)){
                    if(typeof obj[k] === 'undefined'){
                        return false;
                    }
                }
            }
            return true;
        }
        function publishToView(final_batch_data){
            Adhara.configUtils.getViewInstance(entity_config).handleBatchData(final_batch_data);
        }
        let batch_processor = { // custom processor for batching requests
            success: function(query_type, entity_config, response, xhr){
                let blob = Adhara.configUtils.getBlobClass(entity_config);
                let data_config = Adhara.configUtils.getDataConfig(entity_config);
                let processed_data;
                if(query_type==="get_list"){
                    processed_data = [];
                    for(let datum of response){
                        processed_data.push(new blob(datum));
                    }
                }else{
                    processed_data = new blob(response);
                }
                batch_result_map[data_config.identifier] = {success:processed_data};
                if(check_fills(batch_result_map)) publishToView(batch_result_map);
                processor_helper.on_success_common(query_type, entity_config, response, xhr);
            },
            error: function(query_type, entity_config, error, xhr){
                let data_config = Adhara.configUtils.getDataConfig(entity_config);
                batch_result_map[data_config.identifier] = {error};
                if(check_fills(batch_result_map)) publishToView(batch_result_map);
            }
        };
        for(let batch_call of batch_calls){
            batch_result_map[batch_call.identifier] = undefined;
            //TODO add stuff to the cline db after query abd before querying teh ckiebt DV befire quertubg!
            //add stuff to the client db after query and before querying the client DB
            let dummy_entity_config = {
                data_config: {
                    url: batch_call.url,
                    _url: batch_call.url,
                    identifier: batch_call.identifier,
                    default_query_type: batch_call.query_type || 'get',
                    allowed_query_types: ["get", "get_list"],
                    reuse: batch_call.reuse,
                    blob: batch_call.blob
                },
                view: Adhara.configUtils.getViewInstance(entity_config),
                processor: batch_processor
            };
            this.enqueue(undefined, dummy_entity_config, undefined);
        }
    }

    isValidStorageData(stored_data){
        return stored_data.hasOwnProperty("response");
    }

    isMethodAllowed(query_type, http_method, data_config) {
        return (
            Adhara.app.allowedHttpMethods.indexOf(http_method) !== -1
            || ( data_config.allowed_query_types && data_config.allowed_query_types.indexOf(query_type) !== -1 )
        );
    }

    isValidDataConfig(data_config){
        return (data_config instanceof Object
            && data_config.allowed_query_types instanceof Array
            && typeof data_config.url === "string"
            && data_config.allowed_query_types.length > 0)
            ||  (data_config instanceof Object
                && data_config.batch_data_override instanceof Array);
    }

    isValidProcessor(processor){
        return (processor instanceof Object
            && processor.success instanceof Function
            && processor.error instanceof Function);
    }

    isValidEntityConfig(entity_config){
        if(entity_config instanceof Object && this.isValidDataConfig(entity_config.data_config)){
            if (entity_config.data_config.batch_data_override){
                return true;
            }
            else if(entity_config.data_config.allowed_query_types.indexOf('get') > -1
                || entity_config.data_config.allowed_query_types.indexOf('get_list') > -1 ){
                if(this.isValidProcessor(entity_config.processor)){
                    return true;
                } else if( !(AdharaView.isPrototypeOf(entity_config.view)) ) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    getHTTPMethod(query_type){
        return query_type==="get_list"?"get":query_type;
    };

    getUniqueUrlForData(url, http_method, data){
        return url+ ( data?("?"+Object.keys(data).sort().map(key=> key+"="+data[key]).join("&")):"" );
    }

    remember(data_url, response, resource_timeout){
        this.rem_que[data_url] = response;  // hold response till dbPromise resolves
        return this.db_table.store(data_url, {
            url: data_url,
            response: response,
            expires : (isNaN(resource_timeout) ? (this.config.reuse_timeout || 5*60*1000 ) : resource_timeout) + Date.now()  //5 minutes is the default timeout
        }).then(()=> {
            delete this.rem_que[data_url];
            return true;
        });
    }

    recall(data_url) {
        return new Promise((resolve, reject) => {
            if(this.rem_que[data_url]){
                resolve(this.rem_que[data_url]);
            } else {
                this.db_table.retrieve(data_url).then((data)=>{
                    if(!data){
                        reject({message: "No such key stored", code:404});
                    } else if (isNaN(data.expires) || data.expires < (new Date()).getTime()){
                        reject({message: "data has expired", code:404});
                    }
                    else {
                        this.isValidStorageData(data) ? resolve(data.response) : reject({message:`Invalid data ${data.response}`, code:500});
                    }
                });//.catch(reject);
            }
        });
    }

    remove(data_url) {
        return this.db_table.remove(data_url);
    }

    signalViewSuccess(query_type, entity_config, response_json, xhr){
        Adhara.configUtils
            .getProcessor(entity_config)
            .success(query_type, entity_config, response_json, xhr, true);
    }

    signalViewFailure(query_type, entity_config, error, xhr){
        Adhara.configUtils
            .getProcessor(entity_config)
            .error(query_type, entity_config, error, xhr);
    }

    // rest of the public methods and local glue logic goes here ...
    enqueue(query_type, entity_config, data, options){
        // AS OF NOW options can contain additional parameter 'caller_view'. Which ensures the caller view does get the result.
        if(!this.isValidEntityConfig(entity_config)){
            throw new Error(`Entity config passed to enqueue is invalid: ${JSON.stringify(entity_config, null, 4)}`);
        }
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        if(data_config.hasOwnProperty("batch_data_override")){    // Map of url -> data
            this.handle_batch_enqueue(entity_config);
            return;
        }
        if(entity_config instanceof Array){ // Array of app configs -> array of responses
            // batch call type 2
            this.handle_bulk_config(query_type, entity_config, data, options);
            return;
        }
        // if it is not a get or get_list it will make it wait in a queue
        if(!(this.request_queue[data_config.url] instanceof Array)){
            this.request_queue[data_config.url] = [];
        }
        if(['get', 'get_list'].indexOf(query_type) < 0) {
            if(options && options.consider_for_queueing !== false){
                options.consider_for_queueing = false; // would prevent recursive queueing of the same URL
                this.request_queue[data_config.url].push( {entry_time : performance.now(), arg : [query_type, entity_config, data, options]} );
                if(this.request_queue[data_config.url].length > 1) { // not the first entry, taken up later hence
                    return;
                }
            }
        }

        //=========================================================================================================//
        //                  LOGISTICS END HERE, CORE ENQUEUE IS BELOW THIS COMMENT
        //=========================================================================================================//

        if(!query_type) query_type = data_config.default_query_type;
        let http_method = this.getHTTPMethod(query_type);
        if(!this.isMethodAllowed(query_type, http_method, data_config)) {  // either globally off or off due to links configured for particular data configuration
            let failure_message = {message: "Unauthorized Request"};
            this.signalViewFailure(query_type, entity_config, failure_message, 405);
            return;
        }
        let reuse = data_config['reuse'], resource_timeout;
        if(typeof reuse === "number"){
            resource_timeout = reuse;
            reuse = true;
        }
        if((reuse === true || reuse instanceof Function || ( typeof reuse === "undefined"  && this.config.default_reuse === true ))
            && ['get', 'get_list'].indexOf(http_method) !== -1 ){
            let unique_url = this.getUniqueUrlForData(data_config.url, http_method, data);
            function msc(){
                //initiating call to Backend Service, and registering listeners for success and failure
                this.makeServiceCall(data_config.url, http_method, data).then(response_object => {
                    let response = Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr);
                    this.signalViewSuccess(
                        query_type, entity_config,
                        response,
                        response_object.xhr
                    );
                    this.remember(unique_url, response, resource_timeout);
                }, error_response_object => {
                    this.signalViewFailure(
                        query_type, entity_config,
                        Adhara.app.responseMiddleWare(entity_config, false, error_response_object.error, error_response_object.xhr),
                        error_response_object.xhr
                    );
                });
            }
            this.recall(unique_url)
                .then(
                    response => {
                        if(reuse(response)){
                            this.signalViewSuccess(query_type, entity_config, response, 200);
                        }else{
                            msc();
                        }
                    },
                    err => {
                        msc();
                    });
        } else {
            this.makeServiceCall(data_config.url, http_method, data).then(response_object => {
                this.signalViewSuccess(
                    query_type, entity_config,
                    Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr),
                    response_object.xhr
                );
            }, error_response_object => {
                this.signalViewFailure(
                    query_type, entity_config,
                    Adhara.app.responseMiddleWare(entity_config, false, error_response_object.error, error_response_object.xhr),
                    error_response_object.xhr
                );
            }).then(()=>{
                this.request_queue[data_config.url].shift();
                if(this.request_queue[data_config.url].length > 0){
                    if(performance.now() - this.request_queue[data_config.url][0]['entry_time'] <= 30000){
                        this.enqueue(...(this.request_queue[data_config.url][0]['arg']));
                    }
                    else {
                        this.request_queue[data_config.url] = [];
                    }
                }
            });
        }
    }

}