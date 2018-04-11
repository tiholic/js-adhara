class AdharaStorage{

    /**
     * @function
     * @instance
     * @returns {Promise}
     * */
    store(key, value){
        throw new Error("Override `store` method");
    }

    /**
     * @function
     * @instance
     * @returns {Promise}
     * */
    retrieve(key){
        throw new Error("Override `retrieve` method");
    }

    /**
     * @function
     * @instance
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
        throw new Error("Override `removeAll` method");
    }

    /**
     * @function
     * @instance
     * @returns {Promise}
     * */
    keys(){
        throw new Error("Override `keys` method");
    }

}