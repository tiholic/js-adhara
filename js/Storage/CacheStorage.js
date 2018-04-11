class AdharaCacheStorage extends Storage{

    store(key, value){
        throw new Error("Override `store` method");
    }

    retrieve(key){
        throw new Error("Override `retrieve` method");
    }

    remove(key){
        throw new Error("Override `remove` method");
    }

    removeAll(){
        throw new Error("Override `removeAll` method");
    }

    keys(){
        throw new Error("Override `keys` method");
    }

}