/**
 * @class
 * @abstract
 * @classdesc operations that can be performed on a specific dataset whose name must be passed as initializer argument
 * */
class AdharaStorage{

    /**
     * @function
     * @instance
     * @param {String} database_name - name of the database
     * @param {String} dataset_name - name/key_name of the dataset on which operations are to be carried out
     * */
    select(database_name, dataset_name){
        throw new Error("return a StorageOperator instance from this method. create a `class xStorageOperator extends AdharaStorageOperator{...}`");
    }

}

/**
 * @class
 * @abstract
 * @classdesc operations that can be performed on a specific dataset whose name must be passed as initializer argument
 * */
class AdharaStorageOperator{

    /**
     * @constructor
     * @param {String} dataset - name/key_name of the dataset on which operations are to be carried out
     * */
    constructor(dataset){
        this.dataset = dataset;
    }

    /**
     * @function
     * @instance
     * @abstract
     * @returns {Promise}
     * */
    store(key, value){
        throw new Error("Override `store` method");
    }

    /**
     * @function
     * @instance
     * @abstract
     * @returns {Promise}
     * */
    retrieve(key){
        throw new Error("Override `retrieve` method");
    }

    /**
     * @function
     * @instance
     * @abstract
     * @returns {Promise}
     * */
    remove(key){
        throw new Error("Override `remove` method");
    }

    /**
     * @function
     * @instance
     * @returns {Promise}
     * */
    removeAll(){
        return this.removeMultiple(()=>true);
    }

    /**
     * @function
     * @instance
     * @param {Function} filter - A function whose return value is interpreted as a boolean. return true, will remove the entry, else do nothing
     * @returns {Promise}
     * */
    removeMultiple(filter){
        return this.keys().then(async keys => {
            let key_promises = [];
            for(let key of keys) {
                key_promises.push(await this.retrieve(key))
            }
            let data = await Promise.all(key_promises);
            let data_promises = [];
            for(let i=0; i<data.length; i++){
                let datum = data[i];
                let key = keys[i];
                if(!!filter(key, datum)){
                    data_promises.push(this.remove(key));
                }
            }
            return await Promise.all(data_promises);
        });
    }

    /**
     * @function
     * @instance
     * @abstract
     * @returns {Promise}
     * */
    keys(){
        throw new Error("Override `keys` method");
    }

}