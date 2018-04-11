class StorageSelector{

    static select(){
        if(window.hasOwnProperty("indexedDB")){
            return AdharaDBStorage;
        }else{
            return AdharaCacheStorage;
        }
    }

}