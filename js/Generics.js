/**
 * @module
 * @description ALL GLOBAL VARIABLES AND CONSTANTS
 */

/**
 * @global
 * @memberOf window
 * @description Map of scopes that can be accessed across the application.
 * Scopes can vary from environment to environment. Like in Node.JS vs in Browser JS.
 * */
let SCOPES = {  // basically consists 'this' parameter of different services
    global : window // the global scope
};

/**
 * @global
 * @constant
 * @memberOf window
 * @description DB Schematics for Client Storage ( for all the object stores )
 * */
const DB_SCHEMA = {
    urlRes: {
        keyPath : "url"
    }
};