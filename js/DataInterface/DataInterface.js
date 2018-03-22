function initDataInterface(){

    function DataInterface(){
        let self = this;

        let request_queue = {}; // for NON-get requests

        // local helpers ...
        function makeServiceCall(url, method_name, data){
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

        function handle_bulk_config(query_type, entity_configs, data, opts){
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
                        success: function(query_type, entity_config, response, response_code){
                            let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, response, response_code);
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
                        error: function(query_type, entity_config, error, response_code){
                            let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, error, response_code);
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
                self.enqueue(query_type, dummy_entity_config, data, opts);
            }
        }

        function handle_batch_enqueue(entity_config){
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
                success: function(query_type, entity_config, response, response_code){
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
                    processor_helper.on_success_common(query_type, entity_config, response, response_code);
                },
                error: function(query_type, entity_config, error, response_code){
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
                        identifier: batch_call.identifier,
                        default_query_type: batch_call.query_type || 'get',
                        allowed_query_types: ["get", "get_list"],
                        reuse: batch_call.reuse,
                        blob: batch_call.blob
                    },
                    view: Adhara.configUtils.getViewInstance(entity_config),
                    processor: batch_processor
                };
                self.enqueue(undefined, dummy_entity_config, undefined);
            }
        }

        function isValidStorageData(stored_data){
            return stored_data.hasOwnProperty("response");
        }

        function isMethodAllowed(query_type, http_method, data_config) {
            return (
                Adhara.app.allowedHttpMethods.indexOf(http_method) !== -1
                || ( data_config.allowed_query_types && data_config.allowed_query_types.indexOf(query_type) !== -1 )
            );
        }

        function isValidDataConfig(data_config){
            return (data_config instanceof Object
                && data_config.allowed_query_types instanceof Array
                && typeof data_config.url === "string"
                && data_config.allowed_query_types.length > 0)
                ||  (data_config instanceof Object
                    && data_config.batch_data_override instanceof Array);
        }

        function isValidProcessor(processor){
            return (processor instanceof Object
                && processor.success instanceof Function
                && processor.error instanceof Function);
        }

        function isValidEntityConfig(entity_config){
            if(entity_config instanceof Object && isValidDataConfig(entity_config.data_config)){
                if (entity_config.data_config.batch_data_override){
                    return true;
                }
                else if(entity_config.data_config.allowed_query_types.indexOf('get') > -1
                    || entity_config.data_config.allowed_query_types.indexOf('get_list') > -1 ){
                    if(isValidProcessor(entity_config.processor)){
                        return true;
                    } else if( !(AdharaView.isPrototypeOf(entity_config.view)) ) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        // namespaced storage and views related methods as per usage ...
        let storage_m = { // methods to talk to storage service
            rem_que : {},
            getUniqueUrlForData : function(url, http_method, data){
                return url+ ( data?("?"+Object.keys(data).sort().map(key=> key+"="+data[key]).join("&")):"" );
            },
            remember : function(data_url, response, resource_timeout){
                storage_m.rem_que[data_url] = response;  // hold response till dbPromise resolves
                return self.dbPromise.then(db => {
                    const tx = db.transaction(Adhara.app.DIConfig.url_storage, 'readwrite');
                    tx.objectStore(Adhara.app.DIConfig.url_storage).put({
                        url: data_url,
                        response: response,
                        useby : (!isNaN(resource_timeout) ? 30*60*1000 : resource_timeout) + (new Date()).getTime()
                    });
                    return tx.complete;
                }).then(()=> {
                    delete storage_m.rem_que[data_url];
                    return true;
                });
            },
            recall : function (data_url) {
                return new Promise((resolve, reject) => {
                    if(storage_m.rem_que[data_url]){
                        resolve(storage_m.rem_que[data_url]);
                    } else {
                        self.dbPromise.then(db => {
                            return db.transaction(Adhara.app.DIConfig.url_storage).objectStore(Adhara.app.DIConfig.url_storage).get(data_url);
                        }).then((data)=>{
                            if(!data){
                                reject({message: "No such key stored", code:404});
                            } else if (isNaN(data.useby) || data.useby < (new Date()).getTime()){
                                reject({message: "use by period has expired", code:404});
                            }
                            else {
                                isValidStorageData(data) ? resolve(data.response) : reject({message:`Invalid data ${data.response}`, code:500});
                            }
                        });//.catch(reject);
                    }
                });
            },
            remove : function (data_url) {
                return self.dbPromise.then(db => {
                    return db.transaction(Adhara.app.DIConfig.url_storage, 'readwrite').objectStore(Adhara.app.DIConfig.url_storage).delete(data_url);
                });
            }
        };
        this.Storage = storage_m;

        let views_m = { // methods to talk to views service
            signalSuccess : function(query_type, entity_config, response_json, response_code){
                Adhara.configUtils
                    .getProcessor(entity_config)
                    .success(query_type, entity_config, response_json, response_code, true);
            },
            signalFailure : function(query_type, entity_config, error, response_code){
                Adhara.configUtils
                    .getProcessor(entity_config)
                    .error(query_type, entity_config, error, response_code);
            }
        };

        this.getHTTPMethod = function(query_type){
            return query_type==="get_list"?"get":query_type;
        };

        // rest of the public methods and local glue logic goes here ...
        this.enqueue = function(query_type, entity_config, data, options){   // AS OF NOW options can contain additional parameter 'caller_view'. Which ensures the caller view does get the result.
            if(!isValidEntityConfig(entity_config)){
                debugger;
                isValidEntityConfig(entity_config);
                throw new Error(`Entity config passed to enqueue is invalid: ${JSON.stringify(entity_config, null, 4)}`);
            }
            let data_config = Adhara.configUtils.getDataConfig(entity_config);
            if(data_config.hasOwnProperty("batch_data_override")){    // Map of url -> data
                handle_batch_enqueue(entity_config);
                return;
            }
            if(entity_config instanceof Array){ // Array of app configs -> array of responses
                // batch call type 2
                handle_bulk_config(query_type, entity_config, data, options);
                return;
            }
            // if it is not a get or get_list it will make it wait in a queue
            if(['get', 'get_list'].indexOf(query_type) < 0) {
                if(!(request_queue[data_config.url] instanceof Array)){
                    request_queue[data_config.url] = [];
                }
                if(options && options.consider_for_queueing !== false){
                    options.consider_for_queueing = false; // would prevent recursive queueing of the same URL
                    request_queue[data_config.url].push( {entry_time : performance.now(), arg : [query_type, entity_config, data, options]} );
                    if(request_queue[data_config.url].length > 1) { // not the first entry, taken up later hence
                        return;
                    }
                }
            }

            //=========================================================================================================//
            //                  LOGISTICS END HERE, CORE ENQUEUE IS BELOW THIS COMMENT
            //=========================================================================================================//

            if(!query_type) query_type = data_config.default_query_type;
            let http_method = this.getHTTPMethod(query_type);
            if(!isMethodAllowed(query_type, http_method, data_config)) {  // either globally off or off due to links configured for particular data configuration
                let failure_message = {message: "Unauthorized Request"};
                views_m.signalFailure(query_type, entity_config, failure_message, 405);
                return;
            }
            let reusage = data_config['reuse'], resource_timeout;
            if(reusage instanceof Function){
                reusage = reusage();
            }
            if(!isNaN(reusage)){
                resource_timeout = reusage;
                reusage = true;
            }
            if((reusage === true || typeof(reusage) === "undefined") && http_method === 'get'){
                let unique_url = storage_m.getUniqueUrlForData(data_config.url, http_method, data);
                storage_m.recall(unique_url)
                    .then(
                        response => {
                            views_m.signalSuccess(query_type, entity_config, response, 200);
                        },
                        err => {
                            //initiating call to Backend Service, and registering listeners for success and failure
                            makeServiceCall(data_config.url, http_method, data).then(response_object => {
                                let response = Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr);
                                views_m.signalSuccess(
                                    query_type, entity_config,
                                    response,
                                    response_object.xhr.status
                                );
                                storage_m.remember(unique_url, response, resource_timeout);
                            }, response_object => {
                                views_m.signalFailure(
                                    query_type, entity_config,
                                    Adhara.app.responseMiddleWare(entity_config, false, response_object.error, response_object.xhr),
                                    response_object.xhr.status
                                );
                            });
                        });
            } else {
                makeServiceCall(data_config.url, http_method, data).then(response_object => {
                    views_m.signalSuccess(
                        query_type, entity_config,
                        Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr),
                        response_object.xhr.status
                    );
                }, response_object => {
                    views_m.signalFailure(
                        query_type, entity_config,
                        Adhara.app.responseMiddleWare(entity_config, false, response_object.error, response_object.xhr),
                        response_object.xhr.status
                    );
                }).then(()=>{
                    request_queue[data_config.url].shift();
                    if(request_queue[data_config.url].length > 0){
                        if(performance.now() - request_queue[data_config.url][0]['entry_time'] <= 30000){
                            self.enqueue(...(request_queue[data_config.url][0]['arg']));
                        }
                        else {
                            request_queue[data_config.url] = [];
                        }
                    }
                });
            }
        };

        // initiate DB
        initPersister(self);    // initializes the persister and gives access to the DB promise
        // turn the engine on
    }

    return new DataInterface();

}

let Controller = {
    control(method, entity_config, data, options){
        return Adhara.dataInterface.enqueue(method, entity_config, data, options);
    }
};