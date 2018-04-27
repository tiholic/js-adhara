class AdharaController{

    /**
     * @function
     * @instance
     * @param {String} method - can be any of [get|get_list|put|post|delete]
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a data call
     * */
    control(method, entity_config, data, options){
        return Adhara.dataInterface.enqueue(method, entity_config, data, options);
    }

    /**
     * @function
     * @instance
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a get data call
     * */
    getData(entity_config, data, options){
        this.control('get', entity_config, data, options);
    };

    /**
     * @function
     * @instance
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a get list data call
     * */
    getListData(entity_config, data, options){
        this.control('get_list', entity_config, data, options);
    };

    /**
     * @function
     * @instance
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a put data call
     * */
    putData(entity_config, data, options){
        this.control('put', entity_config, data, options);
    };

    /**
     * @function
     * @instance
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a post data call
     * */
    postData(entity_config, data, options){
        this.control('post', entity_config, data, options);
    };

    /**
     * @function
     * @instance
     * @param {Object} entity_config - entity configuration
     * @param {*} [data=undefined] - data to be passed as a payload/query params
     * @param {Object} [options={}] - options for DI handling! might not be necessary
     * @description initial hook to handle a delete data call
     * */
    deleteData(entity_config, data, options){
        this.control('delete', entity_config, data, options);
    };

}