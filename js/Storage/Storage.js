/**
 * @class
 * @abstract
 * @classdesc operations that can be performed on a specific dataset whose name must be passed as initializer argument
 * */
class AdharaStorage{

    /**
     * @function
     * @instance
     * @param {String} dataset_name - name/key_name of the dataset on which operations are to be carried out
     * */
    select(dataset_name){
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
     * @abstract
     * @returns {Promise}
     * */
    removeAll(){
        throw new Error("Override `removeAll` method");
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