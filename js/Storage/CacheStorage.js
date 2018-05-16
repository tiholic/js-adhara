class AdharaCacheStorage extends AdharaStorage{

    constructor(){
        super();
        this.dbs = AdharaCacheStorageOperator.cache;
        for(let db_config of Adhara.app.DBConfig){
            if(!this.dbs[db_config.id]){
                this.dbs[db_config.id] = {};
            }
        }
    }

    select(database_name, dataset_name){
        return new AdharaCacheStorageOperator(dataset_name, this.dbs[database_name]);
    }

}

class AdharaCacheStorageOperator extends AdharaStorageOperator{

    constructor(dataset, db){
        super(dataset);
        this.db = db;
    }

    store(key, value){
        return new Promise((resolve, reject) => {
            AdharaCacheStorageOperator.cache[key] = value;
            resolve();
        });
    }

    retrieve(key){
        return new Promise((resolve, reject) => {
            resolve(AdharaCacheStorageOperator.cache[key]);
        });
    }

    remove(key){
        return new Promise((resolve, reject) => {
            delete AdharaCacheStorageOperator.cache[key];
            resolve();
        });
    }

    removeAll(){
        return new Promise((resolve, reject) => {
            AdharaCacheStorageOperator.cache = {};
            resolve();
        });
    }

    keys(){
        return new Promise((resolve, reject) => {
            resolve(Object.keys(AdharaCacheStorageOperator.cache));
        });
    }

}

AdharaCacheStorageOperator.cache = {};