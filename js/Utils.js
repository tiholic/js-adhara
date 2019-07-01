function handleForm(form){
    if(form.submitting){
        return;
    }else{
        form.submitting = true;
    }
    let hasFiles = !!form.querySelector('input[type="file"]');
    let apiData;
    if(hasFiles){
        apiData = new FormData(form);
    }else{
        let formData = jQuery(form).serializeArray();
        apiData = {};
        jQuery.each(formData, function (i, fieldData) {
            apiData[fieldData.name] = fieldData.value;
        });
    }
    let format_fn = form.getAttribute('format-data');
    if(format_fn){
        apiData = call_fn(format_fn, apiData);
    }
    if(apiData===false){return;}
    RestAPI[form.getAttribute('api-method')]({
        url: form.action.split(window.location.host)[1],
        data: apiData,
        successMessage: form.getAttribute('success-message'),
        handleError: form.getAttribute('handle-error')!=="false",
        success: function(data){
            if(form.getAttribute('form-clear')==="true") {
                form.reset();
            }
            jQuery(form).trigger('success', data);
        },
        failure: function(message){
            jQuery(form).trigger('failure', message);
        }
    });
}

function registerAdharaUtils(){
    //Register templateEngine helpers
    Adhara.templateEngine.helpersHandler.registerHelpers();
    //Form listeners
    jQuery(document).on('submit', 'form.api-form', function (event) {
        event.preventDefault();
        handleForm(this);
    });
    //Form listeners
    jQuery(document).on('success', 'form.dialog-form', function (/*e, d*/) {
        this.close.click();
    });
}


/**
 * @function
 * @global
 * @param {String|Number|Boolean} param1
 * @param {String} operator - Operator can be one among these.
 * "in", "not_in", "contains", "not_contains", "has", "||", "&&", "|", "&", "==", "===", "!=", "!==", ">", "<", ">=", "<=", "equals", "and", "or".
 * @param {String|Number|Boolean} param2
 * @Returns {Boolean}
 *
 * "in" - param2 must be an {Array}. Whether param1's existence in that array will be checked for
 *
 * "not_in" - param2 must be an {Array} and param1's non-existence in that array will be checked for
 *
 * "contains" - param1 must be an {Array} and param2's existence in that array will be checked for
 *
 * "not_contains" - param1 must be an {Array} and param2's non-existence in that array will be checked for
 *
 * "has" - param1 must be an {Object}. Whether param2 is a key of param1
 *
 * All other operations will be applied as javaScript evaluates them.
 * `"equals" is equivalent to "=="`,
 * `"and" is equivalent to "&&"`
 * and `"or" is equivalent to "||"`.
 *
 * */
function evaluateLogic(param1, operator, param2){
    if(operator === "in"){					
        return param2 && param2.indexOf(param1) !== -1;
    }else if(operator === "not_in"){		
        return param2 && param2.indexOf(param1) === -1;
    }else if(operator === "contains"){		
        return param1 && param1.indexOf(param2) !== -1;
    }else if(operator === "not_contains"){	
        return param1 && param1.indexOf(param2) === -1;
    }else if(operator === "has"){	
        return param1 && param1.hasOwnProperty(param2);
    }else{
        return {
            "||" : param1||param2,
            "&&" : param1&&param2,
            "|"  : param1|param2,
            "&"  : param1&param2,
            "==" : param1==param2,
            "===": param1===param2,
            "!=" : param1!=param2,
            "!==": param1!==param2,
            ">"  : param1>param2,
            "<"  : param1<param2,
            ">=" : param1>=param2,
            "<=" : param1<=param2,
            "equals" : param1==param2,
            "and" : param1&&param2,
            "or" : param1||param2	
        }[operator];
    }
}

/**
 * @function
 * @global
 * @param {Object} object - object in which to lookup.
 * @param {String} path - dot separated keys to be looked up for in depth.
 * @param {String} [identifier=null] - token that helps to lookup inside arrays.
 * @returns {String|Number|Boolean|Object|Array} - Value for the key.
 * @description
 * Looks up a JSON object in depth and returns the value for the key provided.
 * @example
 * let obj = {
 *	task: {
 *		id: "12341234",
 * 		status: {
 * 			color: "#fff"
 * 			}
 *		}
 *	};
 * getValueFromJSON(obj, "task.status.color");	//returns "#fff"
 *
 * let objX = {
 *	tasks: [
 *		{
 *			id: "12341234",
 * 			status: {
 * 				color: "#fff"
 * 				}
 *			},
 *		{
 *			id: "55424",
 * 			status: {
 * 				color: "#f5f5f5"
 * 				}
 *			},
 *		{
 *			id: "90898080",
 * 			status: {
 * 				color: "#eee"
 * 				}
 *			},
 *		]
 *	};
 * getValueFromJSON(objX, "task[1].status.color");	//returns "#f5f5f5"
 * getValueFromJSON(objX, "task[$, ].status.color", "$");	//returns "#fff, #f5f5f5, #eee"
 * // Elaborately,
 * // In `[$, ]`		--split into identifier and separator
 * // '$'=identifier(from params).
 * // Remaining part inside [] is the separator i.e., `', '` will be used to join the results from the array
 * */
function getValueFromJSON(object, path, identifier){
    try{
        if(!path){
            return object;
        }
        let keys = path.split('.');
        for(let i=0; i<keys.length; i++){
            let key_in = keys[i];
            if(key_in.indexOf('[') !== -1){
                let arr = key_in.split('[');
                let arrName = arr[0];
                let index = arr[1].split(']')[0];
                if(isNaN(index)){
                    let rite = object[arrName];
                    let separator = index.substring(identifier.length, index.length);
                    let formattedVal = '';
                    for(let j=0; j<rite.length; j++){
                        if(j>0){
                            formattedVal += separator;
                        }
                        formattedVal += getValueFromJSON(rite[j], path.split('.').splice(i+1).join('.'), identifier);
                    }
                    object = formattedVal;
                }else{
                    object = object[arrName][index];
                }
                break;
            }else{
                object = object[key_in];
            }
        }
        return object;
    }catch (e) {
        return undefined;
    }
}

/**
 * @function
 * @global
 * @param {Object} object - object to set value to
 * @param {String} path - dot separated path.
 * @param {String|Number|Boolean|Object|Array} value - value to be set fot the given key
 * @description
 * Sets value to provided object at specified depth in the path be using dot separators.
 * Creates objects at depths if no object already exists at specified path.
 * @example
 * let kit = {'has_bat': true}
 * setValueToJson(kit, 'has_ball', true);	//let kit = {'has_bat': true, 'has_ball': true}
 * setValueToJson(kit, 'has_bat', false);	//let kit = {'has_bat': false, 'has_ball': true}
 *
 * let aeroplane = {'name': 'B747'}
 * setValueToJson(aeroplane, 'tank.capacity', '4000');	//aeroplane = {'name': 'B747', 'tank': { 'capacity': '4000' }}
 * setValueToJson(aeroplane, 'tank.shape', 'amoeba');	//aeroplane = {'name': 'B747', 'tank': { 'capacity': '4000', 'shape': 'amoeba' }}
 * */
function setValueToJson(object, path, value){
    let keys = path.split('.');
    loop(keys, function(i, key){
        if(i+1 < keys.length){
            if(!object.hasOwnProperty(key) || !object[key] || typeof object[key] !== "object"){
                object[key]={}
            }
            object=object[key];
        }else{
            object[key]=value
        }
    });
}

/**
 * @typedef {Object|Array|String|Boolean|Number|null|undefined} _MultiParams - numerous arguments of any kind
 * @description
 * A function if accepts multiple params, can use this as param type.
 * @example
 * //def
 * function mpFn({String} param1, {_MultiParams} m_params){}
 * //call
 * mpFn("Str_param1", "p1", "p2", 1, {'key':'val'}, ['m1', 'm2', ...], ...);
 * //def2
 * function mp2Fn({String} param1, {_MultiParams} m_params, {String} param2){}
 * //call2
 * mp2Fn("Str_param1", "p1", "p2", 1, {'key':'val'}, ['m1', 'm2', ...], ..., "StrX_param2");
 *
 * */
/**
 * @function
 * @global
 * @param {Function|String} fn - function to be called or global path to a function
 * @param {_MultiParams} params - any params that to be passed to function
 * @description
 * calls the function with params passed
 * @example
 * let gv = {}; //global_letiable
 * gv.sample_fn = function(param1, param2, param3){
 * 	//Do Something...
 * 	return "Hello from SampleFN"
 * };
 * call_fn('gv.sample_fn', param1, param2, param3);	//returns "Hello from SampleFN"
 * */
function call_fn(fn){
    if(!fn){return;}
    let args = Array.prototype.slice.call(arguments);
    args.splice(0,1);
    if(typeof(fn) === "function"){
        return fn.apply(fn, args);
    }else{
        try{
            fn = getValueFromJSON(window, fn);
            if(fn && fn !== window){
                return fn.apply(window[fn], args);
            }
        }catch(e){
            if(e.name === "TypeError" && e.message.indexOf("is not a function") !== -1){
                throw new Error("error executing function : "+fn);
            }else{
                throw e;
            }
        }
    }
}

/**
 * Can be used if required to call a function, and if it is unavailable, call a default fn
 * Usage : call_fn_or_def(fn, arg1, arg2, arg3, def_fn)
 * Result : fn(arg1, arg2, arg3) if fn is not undefined else def_fn(arg1, arg2, arg3)
 * */

/**
 * @function
 * @global
 * @param {Function|String} fn - function to be called or global path to a function
 * @param {_MultiParams} params - any params that to be passed to function
 * @param {Function|String} fn - function to be called or global path to a function
 * @description
 * calls the function with params passed
 * @example
 * let gv = {}; //global_letiable
 * gv.sample_fn = function(param1, param2, param3){
 * 	//Do Something...
 * 	return "Hello from SampleFN"
 * };
 * call_fn('gv.sample_fn', param1, param2, param3, defaultFunction);	//returns "Hello from SampleFN"
 * */
function call_fn_or_def(fn){
    let args = Array.prototype.slice.call(arguments);
    let def_fn = args.pop();
    if( ! (  typeof(def_fn) === "function" || typeof(window[def_fn]) === "function" ) ){
        args.push(def_fn);
        def_fn = undefined;
    }
    if(fn){
        return call_fn.apply(call_fn, args);
    }else if(def_fn){
        args[0] = def_fn;
        return call_fn.apply(call_fn, args);
    }
}

/**
 * Loop - looper iterator function
 * @callback LoopIteratorCallback
 * @param {String|Number|RegExp} key - key will be string in case of an object and Number will be an Array while looping through an Array.
 * @param {*} value - Value of iterable for key.
 * @returns {Boolean}
 * return `false` to stop iteration.
 * */
/**
 * @function
 * @global
 * @param {Object|Array} object - Iterable.
 * @param {LoopIteratorCallback} cbk - callback for each value in iterable.
 * @param {Boolean} [reverseIterate=false] - iterate in reverse if it is an array.
 * */
function loop(object, cbk, reverseIterate) {
    let i, loop_size;
    if(object instanceof Array){
        loop_size = object.length;
        if(reverseIterate){
            for(i=loop_size-1; i>=0; i--){
                if(cbk(i, object[i]) === false){
                    break;
                }
            }
        }else{
            for(i=0; i<loop_size; i++){
                if(cbk(i, object[i]) === false){
                    break;
                }
            }
        }
    }else{
        let keys = Object.keys(object);
        loop_size = keys.length;
        for(i=0; i<loop_size; i++){
            if(cbk(keys[i], object[keys[i]]) === false){
                break;
            }
        }
    }
}

/**
 * @typedef {String} HandlebarTemplate
 * @description handlebar template can be an inline template or a pre compiled template that is created in a HBS file.
 * */

/**
 * @namespace
 * @description
 * TemplateUtils is a set of utilities related to handlebars
 * */
let TemplateUtils = {};
(function(){
    let preCompiledCache = {};

    /**
     * @function
     * @static
     * @param {HandlebarTemplate} template_or_template_string - Handlebar template name or template string.
     * @param {Object} context - content to be passed t provided handlebar template/string.
     * @param {Boolean} [cache=true] - whether to cache if the provided template is a Handlebar string template.
     * @returns {String} compiled adn executed handlebar template
     * @example
     * //using template
     * TemplateUtils.execute('template-file-name', {context_key1: "value1", ...});
     *
     * //using template string
     * TemplateUtils.execute('Hello {{name}}', {name: "Adhara"});	//returns "Hello Adhara"
     * */
    TemplateUtils.execute = function(template_or_template_string, context, cache){
        //Check if it is a pre compiled hbs template
        let template = window.Handlebars.templates[template_or_template_string];
        if(!template && window.Handlebars.hasOwnProperty("compile")){
            //If template not found in precompiled hbs list => template is a handlebar string template
            // check if cacheable
            if(cache !== false){
                //check if the template is already cached.
                template = preCompiledCache[template_or_template_string];
                if(!template){
                    //else compile, store it in cache and proceed to execution
                    template = preCompiledCache[template_or_template_string] = window.Handlebars.compile(template_or_template_string);
                }
            }else{
                //else compile and proceed to execution
                template = window.Handlebars.compile(template_or_template_string);
            }
        }
        //execute with the provided context and return the output content...
        return template(context);
    };
})();

class Internationalize{

    /**
     * @constructor
     * @param {Object<String, String>} key_map - i18n key map
     * */
    constructor(key_map){
        this.key_map = key_map;
    }

    /**
     * @instance
     * @function
     * @param {String} key - key
     * @param {Array<String>} subs - substitutes
     * @param {String} default_value - will be returned if key is not availalbe in the keymap
     * */
    getValue(key, subs, default_value){
        if(!key){return;}
        let value = this.key_map[key];
        if(value===undefined){
            value = getValueFromJSON(this.key_map, key);
        }
        if(value===undefined){
            return default_value;
        }
        subs = subs || [];
        let placeholders = value.match(/{[0-9]+}/g) || [];
        for(let i=0; i<placeholders.length; i++){
            let sub = subs[i] || "";
            try {
                if (sub.indexOf('.') !== -1) {
                    sub = this.get(sub);
                }
            }catch(e){/*Do Nothing*/}
            value = value.replace( new RegExp( "\\{"+i+"\\}","g"), sub );
        }
        return value.trim();
    }

    /**
     * @instance
     * @function
     * @param {String} key - key
     * @param {Array<String>} [subs=[]] - substitutes
     * */
    get(key, subs){
        return this.getValue(key, subs, key);
    }

}

// Enable multi extend functionality https://stackoverflow.com/a/45332959
function MutateViews(baseClass, ...mixins){
    function copyProps(target, source){  // this function copies all properties and symbols, filtering out some special ones
        //TODO "Object.getOwnPropertyNames" and "Object.getOwnPropertySymbols" Doesn't work in IE even after transpilation to ES5...
        Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
                if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length|context)$/))
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
            })
    }
    class base extends baseClass {
        constructor (...args) {
            super(...args);
            mixins.forEach((mixin) => {
                copyProps(this,(new mixin(...args)));
            });
        }
    }
    mixins.forEach((mixin) => { // outside constructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(base.prototype, mixin.prototype);
        copyProps(base, mixin);
    });
    return base;
}

function cloneObject(obj) {
    let clone = (obj instanceof Array)?[]:{};
    for(let i in obj) {
        if(obj[i] != null &&  typeof(obj[i])==="object"){
            clone[i] = cloneObject(obj[i]);
        }else{
            clone[i] = obj[i];
        }
    }
    return clone;
}

class Time{

    static async sleep(millis){
        return new Promise((resolve, reject)=>{
            setTimeout(resolve, millis);
        })
    }

}