function initPersister(scope){

    if(initPersister.initialized) return;
    initPersister.initialized = true;

    function takeDependencies(){
        return "indexedDB" in SCOPES.global && "Promise" in SCOPES.global;
    }
    let dependency_success = takeDependencies();
    if(!dependency_success) { return; }	// module level failure

    let self = {};

    (function(self) {	// promise based Async wrapper for indexedDB
        'use strict';
        function toArray(arr) {
            return Array.prototype.slice.call(arr);
        }

        function promisifyRequest(request) {
            return new Promise(function(resolve, reject) {
                request.onsuccess = function() {
                    resolve(request.result);
                };

                request.onerror = function() {
                    reject(request.error);
                };
            });
        }

        function promisifyRequestCall(obj, method, args) {
            let request;
            let p = new Promise(function(resolve, reject) {
                request = obj[method].apply(obj, args);
                promisifyRequest(request).then(resolve, reject);
            });

            p.request = request;
            return p;
        }

        function promisifyCursorRequestCall(obj, method, args) {
            let p = promisifyRequestCall(obj, method, args);
            return p.then(function(value) {
                if (!value) {
                    return;
                }
                return new Cursor(value, p.request);
            });
        }

        function proxyProperties(ProxyClass, targetProp, properties) {
            properties.forEach(function(prop) {
                Object.defineProperty(ProxyClass.prototype, prop, {
                    get: function() {
                        return this[targetProp][prop];
                    },
                    set: function(val) {
                        this[targetProp][prop] = val;
                    }
                });
            });
        }

        function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
            properties.forEach(function(prop) {
                if (!(prop in Constructor.prototype)) {
                    return;
                }
                ProxyClass.prototype[prop] = function() {
                    return promisifyRequestCall(this[targetProp], prop, arguments);
                };
            });
        }

        function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
            properties.forEach(function(prop) {
                if (!(prop in Constructor.prototype)) {
                    return;
                }
                ProxyClass.prototype[prop] = function() {
                    return this[targetProp][prop].apply(this[targetProp], arguments);
                };
            });
        }

        function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
            properties.forEach(function(prop) {
                if (!(prop in Constructor.prototype)) {
                    return;
                }
                ProxyClass.prototype[prop] = function() {
                    return promisifyCursorRequestCall(this[targetProp], prop, arguments);
                };
            });
        }

        function Index(index) {
            this._index = index;
        }

        proxyProperties(Index, '_index', [
            'name',
            'keyPath',
            'multiEntry',
            'unique'
        ]);

        proxyRequestMethods(Index, '_index', IDBIndex, [
            'get',
            'getKey',
            'getAll',
            'getAllKeys',
            'count'
        ]);

        proxyCursorRequestMethods(Index, '_index', IDBIndex, [
            'openCursor',
            'openKeyCursor'
        ]);

        function Cursor(cursor, request) {
            this._cursor = cursor;
            this._request = request;
        }

        proxyProperties(Cursor, '_cursor', [
            'direction',
            'key',
            'primaryKey',
            'value'
        ]);

        proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
            'update',
            'delete'
        ]);

        // proxy 'next' methods
        ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
            if (!(methodName in IDBCursor.prototype)) {
                return;
            }
            Cursor.prototype[methodName] = function() {
                let cursor = this;
                let args = arguments;
                return Promise.resolve().then(function() {
                    cursor._cursor[methodName].apply(cursor._cursor, args);
                    return promisifyRequest(cursor._request).then(function(value) {
                        if (!value) {
                            return;
                        }
                        return new Cursor(value, cursor._request);
                    });
                });
            };
        });

        function ObjectStore(store) {
            this._store = store;
        }

        ObjectStore.prototype.createIndex = function() {
            return new Index(this._store.createIndex.apply(this._store, arguments));
        };

        ObjectStore.prototype.index = function() {
            return new Index(this._store.index.apply(this._store, arguments));
        };

        proxyProperties(ObjectStore, '_store', [
            'name',
            'keyPath',
            'indexNames',
            'autoIncrement'
        ]);

        proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
            'put',
            'add',
            'delete',
            'clear',
            'get',
            'getAll',
            'getKey',
            'getAllKeys',
            'count'
        ]);

        proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
            'openCursor',
            'openKeyCursor'
        ]);

        proxyMethods(ObjectStore, '_store', IDBObjectStore, [
            'deleteIndex'
        ]);

        function Transaction(idbTransaction) {
            this._tx = idbTransaction;
            this.complete = new Promise(function(resolve, reject) {
                idbTransaction.oncomplete = function() {
                    resolve();
                };
                idbTransaction.onerror = function() {
                    reject(idbTransaction.error);
                };
                idbTransaction.onabort = function() {
                    reject(idbTransaction.error);
                };
            });
        }

        Transaction.prototype.objectStore = function() {
            return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
        };

        proxyProperties(Transaction, '_tx', [
            'objectStoreNames',
            'mode'
        ]);

        proxyMethods(Transaction, '_tx', IDBTransaction, [
            'abort'
        ]);

        function UpgradeDB(db, oldVersion, transaction) {
            this._db = db;
            this.oldVersion = oldVersion;
            this.transaction = new Transaction(transaction);
        }

        UpgradeDB.prototype.createObjectStore = function() {
            return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
        };

        proxyProperties(UpgradeDB, '_db', [
            'name',
            'version',
            'objectStoreNames'
        ]);

        proxyMethods(UpgradeDB, '_db', IDBDatabase, [
            'deleteObjectStore',
            'close'
        ]);

        function DB(db) {
            this._db = db;
        }

        DB.prototype.transaction = function() {
            return new Transaction(this._db.transaction.apply(this._db, arguments));
        };

        proxyProperties(DB, '_db', [
            'name',
            'version',
            'objectStoreNames'
        ]);

        proxyMethods(DB, '_db', IDBDatabase, [
            'close'
        ]);

        // Add cursor iterators
        ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
            [ObjectStore, Index].forEach(function(Constructor) {
                Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
                    let args = toArray(arguments);
                    let callback = args[args.length - 1];
                    let nativeObject = this._store || this._index;
                    let request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
                    request.onsuccess = function() {
                        callback(request.result);
                    };
                };
            });
        });

        // polyfill getAll
        [Index, ObjectStore].forEach(function(Constructor) {
            if (Constructor.prototype.getAll) {
                return;
            }
            Constructor.prototype.getAll = function(query, count) {
                let instance = this;
                let items = [];

                return new Promise(function(resolve) {
                    instance.iterateCursor(query, function(cursor) {
                        if (!cursor) {
                            resolve(items);
                            return;
                        }
                        items.push(cursor.value);

                        if (count !== undefined && items.length === count) {
                            resolve(items);
                            return;
                        }
                        cursor["continue"]();
                    });
                });
            };
        });

        let exp = {
            open: function(name, version, upgradeCallback) {
                let p = promisifyRequestCall(indexedDB, 'open', [name, version]);
                let request = p.request;

                request.onupgradeneeded = function(event) {
                    if (upgradeCallback) {
                        upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
                    }
                };

                return p.then(function(db) {
                    return new DB(db);
                });
            },
            del: function(name) {
                return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
            }
        };

        if(self){
            self.idb = exp;	// the idb object (for interacting with indexed db)
        }

    }(self));

    const local_dbPromise = self.idb.open(Adhara.app.DBConfig.key_shelf.name, Adhara.app.DBConfig.key_shelf.version, upgradeDB => {
        upgradeDB.createObjectStore('keyval');
    });

    SCOPES.global.keyshelf = {
        get(key) {
            return local_dbPromise.then(db => {
                return db.transaction('keyval')
                    .objectStore('keyval').get(key);
            });
        },
        set(key, val) {
            return local_dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').put(val, key);
                return tx.complete;
            });
        },
        delete(key) {
            return local_dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').delete(key);
                return tx.complete;
            });
        },
        clear() {
            return local_dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').clear();
                return tx.complete;
            });
        },
        keys() {
            return local_dbPromise.then(db => {
                const tx = db.transaction('keyval');
                const keys = [];
                const store = tx.objectStore('keyval');

                // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
                // openKeyCursor isn't supported by Safari, so we fall back
                (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                    if (!cursor) return;
                    keys.push(cursor.key);
                    cursor.continue();
                });

                return tx.complete.then(() => keys);
            });
        }
    };

    // object-stores creation and initializing dbPromise below
    function init(){
        if(dependency_success){
            try{
                scope.dbPromise = self.idb.open(Adhara.app.DBConfig.name, Adhara.app.DBConfig.version, function(upgradeDb) {
                    dependency_success = dependency_success && createObjectStores(upgradeDb);
                });
            } catch(err){
                dependency_success = false;
            }
        }
        if(dependency_success){
            scope.storage_available = true;
        }
    }


    function createObjectStores(upgradeDb){
        try{
            for(let object_store_name in DB_SCHEMA){
                if(DB_SCHEMA.hasOwnProperty(object_store_name)){
                    if(!upgradeDb.objectStoreNames.contains(object_store_name)){
                        let os = upgradeDb.createObjectStore(object_store_name, DB_SCHEMA[object_store_name]);
                        let indexes = DB_SCHEMA[object_store_name].indexes;
                        for(let index_name in indexes){
                            if(indexes.hasOwnProperty(index_name)){
                                os.createIndex(index_name, indexes[index_name].propname, indexes[index_name].options);
                            }
                        }
                    }
                }
            }
            return true;
        } catch(e){
            return false;
        }
    }

    init();
}
