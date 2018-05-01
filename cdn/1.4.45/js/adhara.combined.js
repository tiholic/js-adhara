
/**
 * @typedef {Object} ElementAttributes
 * @description attributes that can be set in a element using `addAttr` helper for Handlebar files.
 * */

/**
 * @namespace
 * @description
 * Helpers written for handlebars. Can also be used directly.
 * */
let HandlebarsHelpers = {
    /**
     * @function
     * @static
     * @param {ElementAttributes} attributes - html element attributes.
     * @param {String|Object} default_attributes - html element default attributes.
     * @description
     * attributes override default_attributes
     * create attribute string and return which can be used to append
     * @example
     * let options = {
	 * 	attributes : { id : 'element-id', className : 'css-class' }
	 * }
     * HandlebarUtils.execute(
     * 	'<a {{addAttr attributes "{"href":"javascript:void(0)", "route":"true"}"}}></a>',
     * 	options
     * )
     * //returns <a href="javascript:void(0)" route:"true" id="element-id" class:"css-class></a>
     * */
    'addAttr': function(attributes, default_attributes){
        if(attributes || default_attributes){
            let attrData = [];
            default_attributes = (default_attributes && typeof(default_attributes) === "string") ? JSON.parse(default_attributes) : {};
            let class_names = attributes?(attributes.className||attributes["class"]||""):"";
            class_names += default_attributes.hasOwnProperty("class")?" "+default_attributes['class']:"";
            attributes = jQuery.extend( {}, default_attributes , attributes );
            attributes['class'] = class_names;
            loop(attributes, function(key, value){
                if(key && value !== undefined){
                    if(key === "style"){
                        let css_values = [];
                        loop(value, function(css_prop, css_value){
                            css_values.push(css_prop+":"+css_value+";");
                        });
                        value = css_values.join('');
                    }
                    if(typeof(value) === "string"){
                        value = '"'+value.replace(/"/g, '\\"')+'"';
                    }
                    attrData.push(key+'='+value);
                }
            });
            return new window.Handlebars.SafeString(attrData.join(' '));
        }
    },
    'selectedClass': function(selected,selectedClassName){
        if(selected === true){
            return selectedClassName;
        } else {
            return '';
        }
    },
    /**
     * @function
     * @static
     * @param {String} template_name - precompiled handlebar template name.
     * @param {Object} context - context with which the `template_name` hbs template to be called
     * @return {String} `template_name` handlebar template contents after execution with provided context.
     * @description
     * includes one hbs template in another.
     * @example
     * //child HBS file - child-template.hbs
     * `<div id="child">
     *     {{name}}
     * </div>`
     *
     * // main HBS file - main-template.hbs
     * `<div id="main">
     *     {{name}}
     *     {{include 'child-template' child_context}}
     * </div>`
     *
     * Handlebars.templates['main-template']({name:"MAIN", child_context:{name:"CHILD"}})
     * // returns
     * //<div id="main">
     * //    MAIN
     * //    <div id="child">
     * //    	CHILD
     * //	 </div>
     * //</div>
     * */
    'include' : function(template_name, context){			
        return new window.Handlebars.SafeString(HandlebarUtils.execute(template_name, context));
    },
    /**
     * @function
     * @static
     * @param {Number} param1 - left operand / lvalue
     * @param {String} operation - can be one among "+", "-", "*", "/" and "%"
     * @param {Number} param2 - right operand / rvalue
     * @returns {Number} - result after operation between param1 and param2 with operation
     * */
    'math' : function(param1, operation, param2){
        let lvalue = parseFloat(String(param1));
        let rvalue = parseFloat(String(param2));
        return {
            "+": lvalue+rvalue,
            "-": lvalue-rvalue,
            "*": lvalue*rvalue,
            "/": lvalue/rvalue,
            "%": lvalue%rvalue
        }[operation]
    },
    /**
     * @function
     * @static
     * @param {String} i18nKey - application key that needs to be internationalized.
     * @returns {String} internationalized application key's value
     * @example
     * // app.key.name = "APP Key"
     * {{i18N 'app.key.name'}}	//returns "APP Key"
     *
     * // app.key.operation = "App Operation {0} by {1}"
     * {{i18N 'app.key.operation' 'operationName' 'operatedBy'}}	//returns "App Operation operationName by operatedBy"
     * */
    'i18n' : function (i18nKey) { //~ (i18nKey, ...subs)
        let subs = Array.prototype.slice.call(arguments);
        subs = subs.splice(1, subs.length-2);
        return Adhara.i18n.get(i18nKey, subs);
    },
    /**
     * @function
     * @static
     * @param {Object} object - object in which to lookup.
     * @param {String} path - dot separated keys to be looked up for in depth.
     * @description
     * Wrapper for {@link getValueFromJSON}
     * @returns {String|Number|Boolean|Object|Array} - Value for the key.
     * */
    'get' : function(object, path){
        return getValueFromJSON(object, path);
    },
    /**
     * @function
     * @static
     * @description
     * Wrapper for {@link evaluateLogic}
     * @returns
     * handlebar block based on logic.
     * */
    'ifCond' : function(param1, operator, param2, options){
        if(evaluateLogic(param1, operator, param2)){
            return options.fn(this);
        }else{
            return options.inverse(this);
        }
    },
    /**
     * @function
     * @static
     * @description
     * If condition with multiple equations to evaluate.
     * Takes numerous arguments which will be executed in pairs.
     * @returns
     * handlebar block based on logic.
     * */
    'mIf' : function(){	
        let arr = [true, 'and', true];
        let args_len = arguments.length-1;
        let options = arguments[args_len];
        for(let i=0; i<args_len; i++){
            if(i === 0){
                arr[0] = arguments[i];
            }else if(i%2 === 1){
                arr[1] = arguments[i];
            }else{
                arr[2] = arguments[i];
                arr[0] = evaluateLogic(arr[0], arr[1], arr[2]);
            }
        }
        if(arr[0]){
            return options.fn(this);
        }else{
            return options.inverse(this);
        }
    },
    /**
     * @function
     * @static
     * @description
     * If condition with multiple equations to evaluate.
     * Takes numerous arguments which will be executed in pairs.
     * @returns {Boolean} result of equation created by provided params.
     * @see evaluateLogic
     * */
    'eIf' : function(param1, operator, param2){
        return evaluateLogic(param1, operator, param2)
    },
    /**
     * @function
     * @static
     * @returns {String|Number|Boolean|Object|Array} - Value of the global letiable.
     * */
    'global' : function(global_letiable){
        if(global_letiable.startsWith("Adhara.")){
            return getValueFromJSON(Adhara, global_letiable.substring("Adhara.".length));
        }
        return getValueFromJSON(window, global_letiable);
    },
    'loop' : function(looper, options){
        let structure = '';
        for(let i=0; i<looper.length; i++){
            structure+=options.fn(looper[i]);
        }
        return structure;
    },
    /**
     * @function
     * @static
     * @description Takes numerous {String} arguments and appends all those strings.
     * @returns {String} arguments joined by ''.
     * */
    'append' : function () {			
        let args = Array.prototype.slice.call(arguments);
        args.pop();
        return args.map(arg => {
            if(typeof arg === "object"){
                return JSON.stringify(arg);
            }
            return arg;
        }).join('');
    },
    /**
     * @function
     * @static
     * @description Takes a {String} and converts it to JSON object.
     * @returns {Object}
     * */
    'make_json' : function (str) {
        return JSON.parse(str);
    },
    /**
     * @function
     * @static
     * @description Takes a {String} and converts it to JSON object.
     * @returns {Object}
     * */
    'make_context' : function () {
        let context = {};
        for(let i=0; i<arguments.length-1; i+=2){
            context[arguments[i]] = arguments[i+1];
        }
        return context;
    },
    /**
     * @function
     * @static
     * @param {Function} fn
     * @description Takes numerous and calls the fn with arguments from 2nd position since 1st argument is fn itself.
     * @returns {String|Number|Boolean|Object|Array} content returned by fn
     * */
    'fn_call' : function(fn){
        return call_fn.apply(this, Array.prototype.slice.call(arguments).slice(0, -1));
    },
    /**
     * @function
     * @static
     * @param {Object} looper
     * @param {Object} options - Handlebars options that has access to blocks.
     * @returns {String} Block string.
     * @description blocks will be called with a context ~ {"key":k, "value":v}
     * where `k` is key in the looper object and `v` is value corresponding to `k`.
     * */
    'loopObject' : function(looper, options){
        let structure = '';
        loop(looper, function(key, value){
            structure+=options.fn( {key: key, value: value} );
        });
        return structure;
    },
    /**
     * @function
     * @static
     * @param {Number} start
     * @param {Number} step
     * @param {Number} end
     * @param {Object} options - Handlebars options that has access to blocks.
     * @returns {String} Block string appended n times where n is the number of times step-looped.
     * @description Block will be called with just a number {Number} as context which keeps increasing in steps, where the step height is equal to step param.
     * */
    'iterate_range' : function(start, step, end, options){		
        let str_buf = '';
        for(let i = start; i <= end; i += step){
            str_buf += options.fn(i);
        }
        return str_buf;
    }
};

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

function registerConfigUtils(){
    Adhara.configUtils = {
        getViewInstance(entity_config){
            try{
                return Adhara.getView(entity_config.view);
            }catch (e){
                return false;
            }
        },
        getProcessor(entity_config){
            return entity_config.processor || Processor.fallback;
        },
        getDataConfig(entity_config){
            return entity_config.data_config;
        },
        getBlobClass(entity_config){
            return entity_config.data_config.blob || entity_config.blob || DataBlob;
        },
        getByDataConfig(data_config){
            let res = [];
            let app_config = Adhara.app.config;
            for(let entity_name in app_config){
                if(app_config.hasOwnProperty(entity_name)){
                    let entity_config = Adhara.app.getEntityConfig(entity_name);
                    if(
                        ( data_config._url === Adhara.configUtils.getDataConfig(entity_config)._url
                            && (
                                !data_config.blob || data_config.blob === Adhara.configUtils.getBlobClass(entity_config)
                            ) )
                        || JSON.stringify(data_config) === JSON.stringify(entity_config.data_config)
                    ){
                        res.push(entity_config);
                    }
                }
            }
            return res;
        }
    };
}

function registerAdharaUtils(){
    //config utils
    registerConfigUtils();
    //Register handlebar helpers
    window.Handlebars.registerHelper(HandlebarsHelpers);
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
        }[operator]
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
            if(!object.hasOwnProperty(key)){
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
 * HandlebarUtils is a set of utilities related to handlebars
 * */
let HandlebarUtils = {};
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
     * HandlebarUtils.execute('template-file-name', {context_key1: "value1", ...});
     *
     * //using template string
     * HandlebarUtils.execute('Hello {{name}}', {name: "Adhara"});	//returns "Hello Adhara"
     * */
    HandlebarUtils.execute = function(template_or_template_string, context, cache){
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
        let value = this.key_map[key] || getValueFromJSON(this.key_map, key);
        if(!value){
            return default_value;
        }
        if(subs && subs.length){
            for (let [idx, sub] of subs.entries()) {
                try {
                    if (sub.indexOf('.') !== -1) {
                        sub = this.get(sub);
                    }
                }catch(e){/*Do Nothing*/}
                value = value.replace( new RegExp( "\\{"+idx+"\\}","g"), sub );
            }
        }
        return value;
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
    class base extends baseClass {
        constructor (...args) {
            super(...args);
            mixins.forEach((mixin) => {
                copyProps(this,(new mixin(...args)));
            });
        }
    }
    function copyProps(target, source){  // this function copies all properties and symbols, filtering out some special ones
        //TODO "Object.getOwnPropertyNames" and "Object.getOwnPropertySymbols" Doesn't work in IE even after transpilation to ES5...
        Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
                if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
            })
    }
    mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(base.prototype, mixin.prototype);
        copyProps(base, mixin);
    });
    return base;
}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaApp{

    /**
     * @function
     * @instance
     * @return {Boolean} Whether the app is being accessed in development mode or in production mode
     * */
    get is_debug_mode(){
        return (
            ["localhost", "127.0.0.1", "0.0.0.0"].indexOf(window.location.hostname)!==-1
            || window.location.hostname.indexOf("192.168.")!==-1
        );
    }

    /**
     * @function
     * @instance
     * @return {String} App name
     * */
    get name(){
        return "Adhara App"
    }

    /**
     * @function
     * @instance
     * @return {Object} App name in detail. Like first and last name
     * */
    get detailedName(){
        return {
            first: "Adhara",
            last: "App"
        }
    }

    /**
     * @function
     * @instance
     * @return {String} Tag line
     * */
    get tagLine(){ }

    /**
     * @function
     * @instance
     * @return {AdharaView} Container view class
     * */
    get containerView(){ }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style app config
     * */
    get config(){ return {}; }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style entity config from crude entity config
     * */
    getEntityConfigFromContext(context){
        let allowed_query_types = context.data_config.allowed_query_types?context.data_config.allowed_query_types.slice():[];
        let data_config;
        if(context.data_config.hasOwnProperty("batch_data_override")){
            data_config = {
                batch_data_override: context.data_config.batch_data_override.map(batch_data_config => {
                    if(!batch_data_config.reuse){
                        batch_data_config.reuse = {};
                    }
                    return {
                        _url: batch_data_config.url,
                        url: batch_data_config.url,
                        query_type: batch_data_config.query_type,
                        identifier: batch_data_config.identifier,
                        reuse: {
                            enable: batch_data_config.reuse.enable,
                            timeout: batch_data_config.reuse.timeout,
                            scope: batch_data_config.reuse.scope,
                            handler: batch_data_config.reuse.handler,
                        },
                        blob: batch_data_config.blob
                    }
                })
            }
        }else{
            if(!context.data_config.reuse){
                context.data_config.reuse = {};
            }
            data_config = {
                _url: context.data_config.url,
                url: context.data_config.url,
                allowed_query_types: allowed_query_types,
                default_query_type: context.data_config.default_query_type || allowed_query_types[0],
                socket_tag: context.data_config.socket_tag,
                reuse: {
                    enable: context.data_config.reuse.enable,
                    timeout: context.data_config.reuse.timeout,
                    scope: context.data_config.reuse.scope,
                    handler: context.data_config.reuse.handler,
                },
                blob: context.data_config.blob
            }
        }
        return {
            data_config,
            view: context.view,
            processor: context.processor
        }
    }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style entity config
     * */
    getEntityConfig(context_name){
        return this.getEntityConfigFromContext(this.config[context_name]);
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Custom global view configurations
     * */
    get customViewConfig(){
        return {
            fetching_data: {
                AdharaListView: "Fetching Data..."
            },
            no_data: {
                AdharaListView: "No Data Available"
            }
        }
    }

    /**
     * @function
     * @instance
     * @returns {Array<String>} list of http methods to be allowed by the application.
     * @description This getter can be configured to return allowed methods based on the current network state.
     * Say if offline, it can be configured to just return `["get"]` method which will restrict DataInterface from making
     * other service API calls such as "post", "delete", etc...
     * */
    get allowedHttpMethods() {
        return ['get', 'post', 'put', 'delete'];  // all available API methods
        // offline mode will switch a few of these off (post, put and delete)
    }

    /**
     * @function
     * @instance
     * @return {AdharaRouterConfiguration} Adhara style routing config
     * */
    get routerConfiguration(){
        return {
            routes: [],
            on_route_listeners: {},
            middlewares: []
        }
    }

    /**
     * @function
     * @instance
     * @returns {String} A css selector in which app is to be rendered.
     * */
    get DOMSelector(){
        return "app";   //=> search DOM for `<app></app>`
    }

    /**
     * @function
     * @instance
     * @returns {String} API Server URL. Either the base path or a full url till base path.
     * */
    get apiServerURL(){
        return "/api";
    }

    /**
     * @function
     * @instance
     * @returns {Object} WebSocket config object.
     * sample...
     * {
     *  url: "sub.domain.com:9081"
     * }
     * */
    get webSocketConfig(){ }

    /**
     * @getter
     * @instance
     * @returns {Object} DB Configuration which includes DB names and DB Schematics for Client Storage ( for all the object stores )
     * */
    get DBConfig(){
        return [
            {
                id: "default",
                name: "Adhara-app_db",
                version: 1,
                schema: {
                    http_cache: {
                        keyPath : "url"
                    }
                }
            }
        ];
    }

    get _diConfig(){
        return Object.assign({
            http_cache_table: "http_cache",
            default_reuse: true,
            reuse_timeout: 5*60*1000
        }, this.DIConfig);
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Data interface related configuration
     * */
    get DIConfig(){
        return {};
    }

    /**
     * @getter
     * @instance
     * @returns {Object<String, Object>} scopes that to be used in the app.
     * @description Map of scopes that can be accessed across the application.
     * Scopes can vary from environment to environment. Like in Node.JS vs in Browser JS.
     * */
    get scopes(){
        return {
            global : window // the global scope
        }
    }

    /**
     * @function
     * @instance
     * @description modify the response even before being utilized by the DataInterface
     * */
    responseMiddleWare(entity_config, success, response, xhr){
        return response;
    }

    /**
     * @function
     * @instance
     * @description modify the data with respect to the URL and method name and
     * return formatted data to be posted or queried to/from the server
     * */
    requestMiddleWare(url, method_name, data){
        return data;
    }

    /**
     * @function
     * @instance
     * @param {String} title - toast message title
     * @param {String} content - toast message content
     * @param {String} type - toast message type. can take the values "success"|"error"|"info".
     * */
    toast(title, content, type){
        AdharaDefaultToaster.make(title, content, type);
    }

    get i18n_key_map(){
        return {
            "i18n.adhara.list.previous": "Previous",
            "i18n.adhara.list.next": "Next",
        };
    }

}

/**------------------------------------------------------------------------------------------------------------------**/
/**
 * @class
 * @classdesc a class that handles everything related to the website
 * */
let Adhara = null;

(()=>{
    class AdharaBase{

        init(app){
            callOnInitListeners();
            this.always_active_views = [];
            this.active_views = [];
            this.container = null;
            this.router = AdharaRouter;
            this.toast = Toast;
            if(app){
                this.app = new app();
                this.dataInterface = new DataInterface();
                this.restAPI = RestAPI;
                this.i18n = new Internationalize(Adhara.app.i18n_key_map);
                this.createShortcuts();
                this.performSystemChecks();
                this.createContainer();
                if(this.app.webSocketConfig){
                    WebSocket.listen(this.app.webSocketConfig);
                }
            }else{
                this.router.route();
            }
        }

        createShortcuts(){
            //Creating a view_name vs context_name map
            this.view_context = {};
            loop(this.app.config, (context_name, configuration)=>{
                if(configuration.hasOwnProperty("view") && AdharaView.isPrototypeOf(configuration.view)){
                    this.view_context[configuration.view.name] = context_name;
                }
            });
        }

        performSystemChecks(){
            /*// verify the controller for if it has support for all the API methods (for ease of Dev)
            for(let i = 0; i < Adhara.app.allowedHttpMethods.length; i++){
                if(typeof Controller[Adhara.app.allowedHttpMethods[i] + "Data"] !== 'function'){
                    throw new Error(Adhara.app.allowedHttpMethods[i] + " api method is not registered with the controller!");
                }
            }*/
        }

        createContainer(){
            this.router.configure(this.app.routerConfiguration);
            this.router.listen();
            if(this.app.containerView) {
                this.container = new this.app.containerView();
                this.container.onViewRendered(this.router.route);
                this.always_active_views = this.container.subViews.map(subView => Adhara.getView(subView));
                this.always_active_views.push(this.container);
                this.clearActiveViews();
                Adhara.createView(this.container);
            }else{
                this.clearActiveViews();
                this.router.route();
            }
        }

        get viewHierarchy(){
            return [
                AdharaContainerView,
                AdharaDialogView,
                AdharaTemplateView,
                AdharaCardView,
                AdharaGridView,
                AdharaListView,
                AdharaFormView,
                AdharaView
            ]
        }

        addToActiveViews(viewInstance){
            if(!this.isActiveView(viewInstance)){
                this.active_views.push(viewInstance);
            }
        }

        getActiveView(classReference){
            let active_view = this.active_views.filter(view_instance => view_instance.constructor === classReference)[0];
            if(!active_view){
                active_view = this.always_active_views.filter(view_instance => view_instance.constructor === classReference)[0];
            }
            return active_view
        }

        isActiveView(viewInstance){
            return this.active_views.indexOf(viewInstance)!==-1 || this.always_active_views.indexOf(viewInstance)!==-1;
        }

        clearActiveViews(){
            this.active_views = [];
        }

        closeActiveViews(){
            for(let active_view of this.active_views){
                active_view.destroy();
            }
            this.clearActiveViews();
        }

    }

    Adhara = new AdharaBase();

    //View class handling
    let view_instances = {};

    //Single ton views
    Adhara.addViewToInstances = (instance) => {
        view_instances[instance.constructor.name] = instance;
    };

    //Query singleton views
    Adhara.getView = (viewClass, parentViewInstance) => {
        if(!viewClass){
            throw new Error("invalid view class");
        }
        let active_view = Adhara.getActiveView((viewClass instanceof Function)?viewClass:viewClass.constructor);
        if(active_view){
            return active_view;
        }else if(parentViewInstance){
            return new viewClass(parentViewInstance);
        }else{
            throw new Error(`parent view is required to construct a view. Failed to create view: ${viewClass.constructor.name}`);
        }
    };

    //Create a view instance
    Adhara.createView = (adhara_view_instance, parentViewInstance) => {
        adhara_view_instance.create(parentViewInstance);
    };

    //On route listener
    Adhara.onRoute = (view_class) => {
        Adhara.closeActiveViews();
        if(!Adhara.container.isActive()){
            return Adhara.container.create();
        }
        Adhara.createView(Adhara.getView(view_class, Adhara.container));
    };

    let on_init_listeners = [
        registerAdharaUtils,
    ];

    Adhara.onInit = (fn) => {
        on_init_listeners.push(fn);
    };

    Adhara.lightReload = ()=>{
        Adhara.container?Adhara.container.refresh():Adhara.router.route();
    };
    
    function callOnInitListeners(){
        for(let on_init_listener of on_init_listeners){
            on_init_listener();
        }
    }

})();

/**------------------------------------------------------------------------------------------------------------------**/
/**
 * @namespace
 * @description
 * Client routing logic.
 * All the client URL pattern's should be registered with the router.
 *
 * On visiting a URL, if called {@link AdharaRouter.route}, it calls the registered view function,
 * which takes care of rendering the page.
 *
 * Any HTML element can be used as a router. For this purpose,
 *
 *
 * > Add this attribute `href="/url/to/be/navigated/to"` and this property `route` to any html element to make behave as a router.
 *
 * > By default routing happening this way will execute the view function even if the current URL is same as provided href.
 *
 * > In order to disable this behaviour, provide the attribute `data-force="false"`
 *
 * > In order to use {@link AdharaRouter.goBack} functionality provide `data-force="true"`. See example below.
 *
 * @example
 * //Registering
 * AdharaRouter.register("^/adhara/{{instance_id}}([0-9]+)/{{tab}}(details|tokens|history)$", function(instance_id, tab){
 *		console.log(instance_id, tab);
 *	    AdharaRouter.getPathParam("instance_id");  //Returns same as instance_id
 *	    AdharaRouter.getPathParam("tab");  //Returns same as tab
 * });
 *
 * //Navigating
 * AdharaRouter.navigateTo("/adhara/123412341234/details");
 *
 * //Routing - In case if URL is already set in address bar and not via Router, call this function to execute the registered view funciton.
 * this.route();
 *
 * //HTML Example
 *
 * <a href="/adhara/123412341234/tokens" />
 *
 * <button href="/adhara/123412341234/tokens" data-force="false">tokens</button>
 *
 * <div href="/adhara/123412341234/details" data-back="true"></div>
 *
 * */
let AdharaRouter = null;

(() => {

    "use strict";


    /**
     * @private
     * @member {Object<String, Object>}
     * @description
     * Stores all the registered URL's along with other view parameters.
     * */
    let registeredUrlPatterns = {};

    /**
     * @private
     * @member {Object<String, String>}
     * @description
     * Stores the current URL's search query parameters.
     * */
    let queryParams = {};

    /**
     * @private
     * @member {Object<String, String>}
     * @description
     * Stores the current URL's path variables.
     * */
    let pathParams = {};

    /**
     * @private
     * @member {Array<String>}
     * @description
     * Stores list of visited URL's
     * */
    let historyStack = [];

    /**
     * @private
     * @member {String|undefined}
     * @description
     * Stores current page URL.
     * */
    let currentUrl = undefined;

    /**
     * @private
     * @member {RouterURLConf}
     * @description
     * Stores route which matches with the current URL against registered URL patterns.
     * */
    let currentRoute = undefined;

    /**
     * @private
     * @member {Object<String, Function|undefined>}
     * @description
     * Stores listeners that will be called on routing.
     * */
    let listeners = {};

    /**
     * @typedef {Function} AdharaRouterMiddleware
     * @param {Object} params - url parameters
     * @param {String } params.view_name - name of the page that is being routed to
     * @param {String} params.path - path that is being routed to
     * @param {Object} params.query_params - url query parameters
     * @param {Object} params.path_params - url path parameters
     * @param {Function} route - Proceed with routing after making necessary checks in middleware
     * */

    /**
     * @private
     * @member {Array<AdharaRouterMiddleware>}
     * @description
     * Stores middlewares that will be called on routing.
     * */
    let middlewares = [];

    /**
     * @function
     * @private
     * @returns {String} Current window URL. IE compatibility provided by Hostory.js (protocol://domain/path?search_query).
     * */
    function getFullUrl(){
        return window.location.href;
        // return History.getState().cleanUrl;
    }

    /**
     * @function
     * @private
     * @returns {String} Full URL without search query (protocol://domain/path).
     * */
    function getBaseUrl(){
        return getFullUrl().split('?')[0];
    }

    /**
     * @function
     * @private
     * @returns {String} URL Path (path).
     * */
    function getPathName(){
        return AdharaRouter.transformURL(window.location.pathname);
    }

    /**
     * @function
     * @private
     * @returns {String} URL Path with search query (/path?search_query).
     * */
    function getFullPath(){
        return window.location.pathname+window.location.search+window.location.hash;
        // return "/"+getFullUrl().split('://')[1].substring(window.location.host.length+1);
    }

    /**
     * @function
     * @private
     * @returns {String} Search query (search_query).
     * */
    function getSearchString(){
        return window.location.search.substring(1);
    }

    /**
     * @function
     * @private
     * @returns {String} Hash (text after `#` from the url).
     * */
    function getHash(){
        return window.location.hash.substring(1);
    }

    /**
     * @function
     * @private
     * @param {String} new_path - URL path.
     * @returns {Boolean} Whether new_path matches with current URL path.
     * */
    function isCurrentPath(new_path){
        function stripSlash(path){
            if(path.indexOf('/') === 0){
                return path.substring(1);
            }
            return path;
        }
        return stripSlash(getFullPath()) === stripSlash(new_path);
    }

    function callMiddlewares(params, proceed){
        let i=0;
        (function _proceed(){
            let middleware_fn = middlewares[i++];
            if(middleware_fn){
                call_fn(middleware_fn, params, _proceed);
            }else{
                proceed();
            }
        })();
    }

    /**
     * @function
     * @private
     * @description matches the current URL and returns the configuration, path and params
     * @returns Object
     * */
    function matchUrl(){
        let path = getPathName();
        let matchFound = false;
        for(let regex in registeredUrlPatterns){
            if(registeredUrlPatterns.hasOwnProperty(regex) && !matchFound) {
                let formed_regex = new RegExp(regex);
                if (formed_regex.test(path)) {
                    matchFound = true;
                    let opts = registeredUrlPatterns[regex];
                    let params = formed_regex.exec(path);
                    return {opts, path, params};
                }
            }
        }
    }

    /**
     * @function
     * @private
     * @description
     * Routes to the current URL.
     * Looks up in the registered URL patterns for a match to current URL.
     * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
     * Current view name will be set to the view name configured against view URL.
     * @returns {Boolean} Whether any view function is found or not.
     * */
    function matchAndCall(){
        let matchOptions = matchUrl();
        if(matchOptions){
            let {opts, path, params} = matchOptions;
            params.splice(0,1);
            if(opts && opts.fn){
                let _pathParams = {};
                for(let [index, param] of params.entries()){
                    _pathParams[opts.path_param_keys[index]] = param;
                }
                currentRoute = opts;
                //Setting current routing params...
                pathParams = _pathParams;
                currentUrl = getFullUrl();
                fetchQueryParams();

                callMiddlewares({
                    view_name: opts.view_name,
                    path: path,
                    query_params: getQueryParams(),
                    path_params: _pathParams
                }, () => {
                    params.push(queryParams);
                    if(opts.fn.constructor instanceof AdharaView.constructor){
                        Adhara.onRoute(opts.fn, params);
                    }else{
                        opts.fn.apply(this, params);
                    }
                });
            }
        }
        return !!matchOptions;
    }

    let curr_path;
    function updateHistoryStack(){
        if(curr_path){
            historyStack.push(curr_path);
        }
        curr_path = getFullPath();
    }
    updateHistoryStack();	//updating history stack with the entry URL

    /**
     * @private
     * @member {Boolean}
     * @description
     * This flag will be set to true when set to true, {@link Router.route} will not call the view function.
     * */
    let settingURL = false;

    /**
     * @function
     * @private
     * @description
     * Updates the {AdharaRouter~queryParams} with the current URL parameters
     * */
    function updateParams(){
        if(getFullUrl() !== currentUrl){
            currentUrl = getFullUrl();
            fetchQueryParams();
        }
    }

    /**
     * @function
     * @private
     * @description
     * Fetches the search query from current URL and transforms it to query param's object.
     * @returns {Object<String, String>} The search query will be decoded and returned as an object.
     * */
    function getQueryParams(){
        let qp = {};
        if(getSearchString()){
            loop(getSearchString().split('&'), function(i, paramPair){
                paramPair = paramPair.split('=');
                qp[decodeURIComponent(paramPair[0])] = decodeURIComponent(paramPair[1]);
            });
        }else{
            qp = {};
        }
        return qp;
    }

    /**
     * @function
     * @private
     * @description
     * Fetches the search query from current URL and transforms it to query param's.
     * The search query will be decoded and stored.
     * */
    function fetchQueryParams(){
        queryParams = getQueryParams();
    }

    /**
     * @function
     * @private
     * @returns {String} URL constructed by current base URL and current Query Parameters.
     * */
    function generateCurrentUrl(){
        let url = getPathName();
        let params = [];
        loop(queryParams, function(key, value){
            params.push(key+"="+value);
        });
        if(params.length){
            url+="?"+params.join("&");
        }
        return url;
    }

    /**
     * @function
     * @private
     * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route.
     * @param {Object} route_options - Route options.
     * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
     * @see {@link RouteType}
     * */
    function _route(route_type, route_options){
        if(!route_type || route_type===this.RouteTypes.SET){
            this.setURL(generateCurrentUrl());
        }else if(route_type===this.RouteTypes.NAVIGATE){
            this.navigateTo(generateCurrentUrl(), (route_options && route_options.force)||false);
        }else if(route_type===this.RouteTypes.OVERRIDE){
            this.overrideURL(generateCurrentUrl());
        }else if(route_type===this.RouteTypes.UPDATE){
            this.updateURL(generateCurrentUrl());
        }
    }

    const STATE_KEY = "__adhara_router__";

    class Router{

        /**
         * @function
         * @private
         * @param {String} url - path
         * @description
         * modified the URL and returns the new value. Default transformer just returns the passed url/path.
         * */
        static transformURL(url){
            return url;
        }

        /**
         * @callback ViewFunction
         * @param {String} regexMatchedParams - matched regex params.
         * @param {String} searchQuery - search query parameters converted to object form.
         * @description
         * View callback function.
         * Parameters passed will be the regex matches and last parameter will be searchQueryParameters.
         * In case of more than 1 path regex match, ViewFunction will be called back with (match1, match2, ..., searchQuery)
         * */

        /**
         * @function
         * @static
         * @param {String} pattern - URL Pattern that is to be registered.
         * @param {String} view_name - Name of the view that is mapped to this URL.
         * @param {ViewFunction|Adhara} fn - View function that will be called when the pattern matches window URL.
         * */
        static register_one(pattern, view_name, fn){
            let path_param_keys = [];
            let regex = /{{([a-zA-Z$_][a-zA-Z0-9$_]*)}}/g;
            let match = regex.exec(pattern);
            while (match != null) {
                path_param_keys.push(match[1]);
                match = regex.exec(pattern);
            }
            pattern = pattern.replace(new RegExp("\\{\\{[a-zA-Z$_][a-zA-Z0-9$_]*\\}\\}", "g"), '');
            //Removing all {{XYZ}} iff, XYZ matches first character as an alphabet ot $ or _

            pattern = "^"+this.transformURL(pattern.substring(1));
            pattern = pattern.replace(/[?]/g, '\\?');   //Converting ? to \? as RegExp(pattern) dosen't handle that
            registeredUrlPatterns[pattern] = { view_name, fn, path_param_keys };
        }

        /**
         * @function
         * @static
         * @param {RegExp} regex - URL Pattern that is to be unregistered.
         * @description
         * Once unregistered, this URL regex will be removed from registered URL patterns and on hitting that URL,
         * will be routed to a 404.
         * */
        static deRegister(regex){
            registeredUrlPatterns[regex] = undefined;
        }

        /**
         * Bulk url conf
         * @typedef {Object} RouterURLConf
         * @property {string} url - url regex
         * @property {String} view_name - view name
         * @property {Object} path_params - Path params
         * @property {Function|class} view - view
         * */

        /**
         * @function
         * @static
         * @param {Array<RouterURLConf>} list - list of url configurations
         * @description
         * Register's urls in the list iteratively...
         * */
        static register(list){
            for(let conf of list){
                this.register_one(conf.url, conf.view_name, conf.view);
            }
        }

        /**
         * @typedef {Object} AdharaRouterConfiguration - Adhara router configuration
         * @property {Array<RouterURLConf>} routes - Route configurations
         * @property {Object<String, Function>} on_route_listeners - On Route listeners
         * @property {Array<AdharaRouterMiddleware>} middlewares - Middleware functions
         * */

        /**
         * @function
         * @static
         * @param {AdharaRouterConfiguration} router_configuration
         * */
        static configure(router_configuration){
            if(router_configuration.routes){
                Router.register(router_configuration.routes);
            }
            if(router_configuration.on_route_listeners){
                for(let listener_name in router_configuration.on_route_listeners){
                    if(router_configuration.on_route_listeners.hasOwnProperty(listener_name)){
                        Router.onRoute(listener_name, router_configuration.on_route_listeners[listener_name]);
                    }
                }
            }
            if(router_configuration.middlewares){
                for(let middleware_fn of router_configuration.middlewares){
                    Router.registerMiddleware(middleware_fn);
                }
            }
        }

        /**
         * @function
         * @static
         * @param {String} listener_name - A unique name for the listener that will be useful for unregistering.
         * @param {Function} listener_fn - Listener function that to be called on routing. No arguments passed.
         * @description
         * All registered listeners will be called whenever routing happens via AdharaRouter
         * */
        static onRoute(listener_name, listener_fn){
            listeners[listener_name] = listener_fn;
        }

        /**
         * @function
         * @static
         * @param {String} listener_name - A unique name for the listener that will be useful for unregistering.
         * @description
         * De-reigsters the listener registered with this name.
         * */
        static offRouteListener(listener_name){
            listeners[listener_name] = undefined;
        }

        /**
         * @function
         * @static
         * @param {Function} middleware_fn - middleware function to be used
         * @description Stores all middleware's and calls then in the order of registration
         * */
        static registerMiddleware(middleware_fn){
            if(typeof middleware_fn === "function"){
                middlewares.push(middleware_fn);
            }
        }

        /**
         * @function
         * @static
         * @description
         * Routes to the current URL.
         * Looks up in the registered URL patterns for a match to current URL.
         * If match found, view function will be called with regex path matches in the matched order and query param's as the last argument.
         * Current view name will be set to the view name configured against view URL.
         * */
        static route(){
            if(!settingURL){
                let matchFound = matchAndCall();
                if(!matchFound){
                    throw new Error('No route registered for this url : '+getPathName());
                }
            }else{
                settingURL = false;
            }
            loop(listeners, function(listener_name, listener_fn){ call_fn(listener_fn); });
        }

        /**
         * @function
         * @static
         * @returns {RouterURLConf} Current view name.
         * */
        static getCurrentRoute(){
            if(!currentRoute){
                currentRoute = matchUrl().opts;
            }
            return currentRoute;
        }

        /**
         * @function
         * @static
         * @returns {String} Current view name.
         * */
        static getCurrentPageName(){
            return AdharaRouter.getCurrentRoute().view_name;
        }

        /**
         * @function
         * @static
         * @returns {String} Current URL.
         * */
        static getCurrentURL(){
            return getFullPath();
        }

        /**
         * @function
         * @static
         * @returns {String} Current URL's Hash.
         * */
        static getCurrentHash(){
            return getHash();
        }

        /**
         * @function
         * @private
         * @param {URL|String} url - URL to be navigated to.
         * @description
         * navigates to the provided URL.
         * */
        static go(url){
            if (isCurrentPath(url)){
                return false;
            }
            history.pushState({[STATE_KEY]:true}, parent.document.title, url);
            //considering the behaviour of immediate state change
            let state = history.state;
            updateHistoryStack();
            pathParams = {};
            if(state !== undefined && state !== ''){
                // let data = state.data;
                if(state[STATE_KEY] === true || state.data[STATE_KEY] === true){
                    this.route();
                }
            }
            // History.pushState({[STATE_KEY]:true}, parent.document.title, url);
            return true;
        }

        /**
         * @function
         * @static
         * @param {String} url - URL that to be updated.
         * @description Updates current URL in the path but doesn't call the view function. Appends current URL in History.
         * */
        static setURL(url){
            url = this.transformURL(url);
            settingURL = true;
            let gone = this.go(url);
            if(!gone){
                settingURL = false;
            }
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL that to be updated.
         * @description Replaces current URL in the path, and calls view function. No modifications made to History.
         * */
        static overrideURL(url){
            url = this.transformURL(url);
            history.replaceState({[STATE_KEY]:true}, parent.document.title, url);
            // History.replaceState({[STATE_KEY]:true}, parent.document.title, url);
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL that to be updated.
         * @description Replaces current URL in the path but doesn't call the view function. No modifications made to History.
         * */
        static updateURL(url){
            settingURL = true;
            this.overrideURL(url);
        }

        /**
         * @function
         * @static
         * @param {!String} url - URL to be navigated to.
         * @param {Boolean} [force=false] - If true, will call the view function even if current URL is same as provided URL.
         * @description Navigates to the provided URL.
         * And if provided URL is same as current URL, view function will not be called unless force parameter is true.
         * */
        static navigateTo(url, force){
            url =this.transformURL(url);
            if (!isCurrentPath(url)) {
                let gone = this.go(url);
                if(gone){
                    fetchQueryParams();
                }
            } else if(force) {
                this.route();
            }
        }

        /**
         * @function
         * @static
         * @param {!String} backwardURL - backward URL to be navigated to.
         * @description Navigates to the backward URL by moving back in history.
         * In case if history is not available, Router will navigate to the backwardURL as if it is a new URL.
         * */
        static goBack(backwardURL){
            if(!backwardURL){
                backwardURL = historyStack.slice(-1)[0];
                if(!backwardURL){
                    return false;
                }
            }
            backwardURL =this.transformURL(backwardURL);
            let backwardIndex = historyStack.lastIndexOf(backwardURL);
            if(backwardIndex === -1){
                this.navigateTo(backwardURL);
            }else{
                let stackLen = historyStack.length;
                let negativeIndex = backwardIndex-stackLen;
                historyStack.splice(stackLen+negativeIndex, -negativeIndex);
                history.go(negativeIndex);
            }
        }

        /**
         * @function
         * @static
         * @returns {Array<String>} List of visited URL's that are routed by Router.
         * */
        static peekStack(){
            return historyStack.slice();
        }

        /**
         * @function
         * @static
         * @param {String} param_name - name of the query parameter for which value is required.
         * @returns {String} Value of the search parameter from current URL.
         * */
        static getQueryParam(param_name){
            updateParams();
            return queryParams[param_name];
        }

        static getPathParam(param_name){
            return pathParams[param_name];
        }

        /**
         * Route type
         * @typedef {String} RouteType
         * @see {@link Router.RouteTypes}
         * */

        /**
         * @function
         * @static
         * @param {!Object} new_params - Search Parameters to be added/updated.
         * @param {Boolean} [drop_existing=false] - Whether to completely replace existing search parameters or update with the new ones.
         * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route. {@link RouteType}
         * @param {Object} route_options - Route options.
         * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
         * @description
         * Updates the query parameters and navigates to the new URL based on route_type that is constructed with the new parameters.
         * */
        static updateQueryParams(new_params, drop_existing, route_type, route_options){
            if(!route_type){route_type = this.RouteTypes.NAVIGATE;}
            if(!Object.keys(new_params).length){
                return;
            }
            if(drop_existing){
                queryParams = new_params;
            }else{
                Object.assign(queryParams, new_params);
            }
            _route(route_type, route_options);
        }

        /**
         * @function
         * @static
         * @param {!Array} param_keys - Search Parameters to be dropped.
         * @param {RouteType} [route_type=this.routeTypes.NAVIGATE] - How to route. {@link RouteType}
         * @param {Object} route_options - Route options.
         * @param {boolean} [route_options.force=false] - Whether to force navigate URL or not. Will call view function even if current URL is same. Applies for {@link RouteType.NAVIGATE}.
         * @description
         * Drops provided keys if exist, updates the query parameters and navigates to the new URL that is constructed with the new parameters.
         * */
        static removeQueryParams(param_keys, route_type, route_options){
            loop(param_keys, function(idx, key){
                delete queryParams[key];
            });
            _route(route_type, route_options);
        }

        /**
         * @function
         * @static
         * @param {String} view_name - View name with which a URL pattern is registered.
         * @returns {RegExp} Pattern for which the provided view name is the view name.
         * */
        static getURLPatternByPageName(view_name){
            let matched_pattern = null;
            loop(registeredUrlPatterns, function(pattern, options){
                if(options.view_name === view_name){
                    matched_pattern = pattern;
                    return false;
                }
            });
            return matched_pattern;
        }

    }

    //---------------------

    AdharaRouter = Router;

    /**
     * @description
     * setting current view name to undefined on moving to some other page that is not registered with router.
     * */
    window.onpopstate = (e) => {
        // if(e.state[STATE_KEY]){
        AdharaRouter.route();
        // }else{
        //     currentRoute = null;
        // }
        /*if(currentRoute){
            let url_pattern = Router.getURLPatternByPageName(currentRoute.view_name);
            if(!(url_pattern && new RegExp(url_pattern).test(getPathName()))){
                currentRoute = undefined;
            }
        }*/
    };

    /**
     * @static
     * @readonly
     * @enum {RouteType}
     * @description Operations that can be performed on the entity
     * */
    AdharaRouter.RouteTypes = Object.freeze({
        /**
         * navigate to the url and call the view function. This will add current URL to History.
         * */
        NAVIGATE : "navigate",
        /**
         * override the current url and call the view function. This will not change History.
         * */
        OVERRIDE : "override",
        /**
         * Just update the URL. Adds current URL to History. View function will not be called.
         * */
        SET : "set",
        /**
         * Overrides the current URL. No modifications made to History. View function will not be called.
         * */
        UPDATE : "update"
    });


    AdharaRouter.enableAllAnchors = true;

    AdharaRouter.listen = function(){
        /**
         * Listening to elements with route property in DOM.
         * If it has href attribute, preventing default event and proceeding with SdpRouting
         * */

        function getRoutingElement(event){
            return (event.target.nodeName !== "A")?event.currentTarget:event.target;
        }

        function hasAttribute(elem, attribute_name) {
            return elem.hasAttribute(attribute_name);
        }

        function routeHandler(event){
            let re = getRoutingElement(event);
            if ((AdharaRouter.enableAllAnchors || hasAttribute(re, "route")) && hasAttribute(re, "href")) {
                let url = this.getAttribute('href').trim();
                let target = this.getAttribute("target");
                if( ( target && target !== "_self") || url.indexOf('javascript') !== -1){
                    return;
                }
                try{
                    let go_to_url = new URL(url);
                    if(go_to_url.host !== window.location.host){
                        return;
                    }
                }catch(e){/*Do nothing. Try catches the invalid url on new ULR(...)*/}
                if (url) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                let go_back = this.getAttribute("data-back");
                let force = this.getAttribute("data-force") !== "false";
                if (go_back) {
                    return AdharaRouter.goBack(url);
                }
                AdharaRouter.navigateTo(url, force);
            }
        }

        jQuery(document).on("click", "a", routeHandler);
        jQuery(document).on("click", "[route]", routeHandler);

        /*document.addEventListener('click', function (e) {
            if(e.target.nodeName === "A" && ( AdharaRouter.enableAllAnchors || hasAttribute(e.target, "route") ) ){
                let url = e.target.getAttribute('href').trim();
                if(url.indexOf('javascript') !== -1){return;}
                if(url){
                    e.preventDefault();
                    e.stopPropagation();
                }
                let go_back = e.target.getAttribute("data-back");
                let force = e.target.getAttribute("data-force") !== "false";
                if(go_back){ return AdharaRouter.goBack(url); }
                AdharaRouter.navigateTo(url, force);
            }

        }, false);*/
    }

    //---------------------



})();
/**------------------------------------------------------------------------------------------------------------------**/
let Toast = {};
(function(){

    Toast.make = function(title, content, type){    //type should be "success", "error" or "info"
        if(Adhara.app){
            Adhara.app.toast(title, content, type);
        }else{
            if(window.ToastHandler){
                window.ToastHandler[type](content, title);
            }else{
                console.log(`No toast handler found. Toast message: type-${type}, title-${title}, content=${content}`);
            }
        }
    };

    Toast.error = function(message){
        Toast.make("Error!", message, "error");
    };

    Toast.success = function(message){
        Toast.make("Success", message, "success");
    };

})();

let AdharaDefaultToaster = {};

(function(){

    let notifyQueue = 0;

    function notify(title, content, type){
        let id = "notification_"+new Date().getTime();
        let $notificationDiv = jQuery('<div class="notification '+type+'" id="'+id+'"/>');
        let $title = jQuery('<strong style="display:block" />').text(title);
        let $content = jQuery('<p />').html(content);
        $notificationDiv.append($title).append($content);
        jQuery('body').append($notificationDiv);

        let existing_notifications = jQuery('.notification');
        if(existing_notifications.length > 0){
            jQuery.each(existing_notifications, function(index, value){
                if(jQuery(this).attr('id') !== id){
                    let new_top = parseFloat(jQuery(this).css('top'))+$notificationDiv.height()+40;
                    jQuery(this).animate({top: new_top+"px"}, 'fast');
                }
            });
        }

        jQuery('#'+id).animate({right:'0px'}, 'fast', function(){notifyQueue--;});
        setTimeout(function(){
            jQuery('#'+id).animate({opacity: '0.5'}, 'fast', function(){
                jQuery('#'+id).hide('slide', {direction: 'right'}, 'slow', function(){
                    setTimeout(function() {
                        jQuery('#'+id).remove()
                    }, 1000);
                });
            });
        }, 5000);
    }

    AdharaDefaultToaster.make = function(title, content, type){
        let maxNotificationsHeight = window.innerHeight-200;
        let currentNotificationsHeight = 0;
        jQuery.each(jQuery('.notification'), function(){
            currentNotificationsHeight+=jQuery(this).height()+40;
        });
        let proceed = (currentNotificationsHeight<maxNotificationsHeight);
        let notifyTimeout = (notifyQueue === 0)?0:2000;
        if(!content && type==="failure"){
            content = "Error occurred...";
        }
        setTimeout(function(){
            if(notifyQueue === 0 && proceed){
                notifyQueue++;
                notify(title, content, type);
            }else{
                AdharaDefaultToaster.make(title, content, type);
            }
        }, notifyTimeout);
    }

})();
/**------------------------------------------------------------------------------------------------------------------**/
/**
 * Created by rohit on 25/5/16.
 */

let RestAPI = {};

(function(){

    RestAPI.error_codes = {
        not_found : 404
    };


    RestAPI.getCookie = function (name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === name+'=') {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    RestAPI.getHeaders = function () {
        return {
            'X-CSRFToken' : RestAPI.getCookie('csrftoken')
        };
    };

    RestAPI.handle_api_success = function(fns, fne, d, s, x, toastFailure, successMessage){  //data, success, xhr
        if(s === "nocontent"){
            //DO NOTHING
            return;
        }
        if(s === "success") {
            if (x.getResponseHeader('Content-Disposition')) {
                return call_fn(fns, d, x);
            } else {
                if(typeof d === "string"){
                    d = JSON.parse(d);
                }
                if (d.status === "success") {
                    if (successMessage && successMessage !== "") {
                        Toast.success(successMessage);
                    }
                    return call_fn(fns, d, x);
                }
            }
        }
        if(toastFailure !== false) {
            Toast.error(d, x);
        }
        call_fn(fne, d, x);
    };

    RestAPI.handle_api_failure = function(fne, x, s, e){  //xhr, status, error
        if( x.readyState === 0 && x.status === 0 && e === ""){
            e = "Unable to connect to server";
        }
        call_fn(fne, e, x);
        // if(x.responseText){
        //     return Toast.error(e+"\n"+x.responseText);
        // }
        // Toast.error(e);
    };

    RestAPI.post = function(o){
        o.type = "post";
        send(o);
    };

    RestAPI.get = function(o){
        o.type = "get";
        send(o);
    };

    RestAPI.put = function(o){
        o.type = "put";
        send(o);
    };

    RestAPI.patch = function(o){
        o.type = "patch";
        send(o);
    };

    RestAPI.delete = function(o){
        o.type = "delete";
        send(o);
    };

    function formatURL(url){
        let base = Adhara.app?Adhara.app.apiServerURL:"/";
        if(base.lastIndexOf("/")+1 !== base.length){
            base += "/";
        }
        if(url.indexOf("/") === 0){
            url = url.substring(1);
        }
        return base+url;
    }

    function send(o){
        o.url = formatURL(o.url);
        let fns = o.success;
        let fnf = o.failure;
        o.success = function(d,s,x){RestAPI.handle_api_success(fns,fnf,d,s,x,o.handleError,o.successMessage);};
        o.error = function(x,s,e){RestAPI.handle_api_failure(fnf,x,s,e);};
        o.headers = RestAPI.getHeaders();
        if(o.data instanceof FormData){
            multipart(o);
        }else {
            ajax(o);
        }
    }

    function ajax(o) {
        if(o.type !== "get" && o.data instanceof Object){
            if(!Object.keys(o.data).length){
                delete o.data;
            } else {
                o.data = JSON.stringify(o.data);
            }
        }
        /*if(o.type === "get" || o.type === "patch" || o.type === "post") {
            if (o.type === "get") {
                /!*if (o.data) {
                    o.data = {data: o.data};
                }*!/
            }
        }*/
        o.headers['Content-Type'] = 'application/json';
        jQuery.ajax(o);
    }

    function multipart(o) {
        let xhr = new XMLHttpRequest();
        xhr.open(o.type.toUpperCase(), o.url);
        loop(o.headers, function (header, value) {
            xhr.setRequestHeader(header, value)
        });
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status === 200) {
                    o.success(xhr.responseText, "success", xhr);
                }else{
                    o.error(xhr, "error", "Multipart upload error");
                }
            }
        };
        xhr.send(o.data);
    }

})();
/**------------------------------------------------------------------------------------------------------------------**/
function deserialize(str, context) {
    if(typeof context === 'object' && context.blob){
        let data = JSON.parse(str);
        return new context.blob(data);
    }
    if(context){
        let data = JSON.parse(str);
        return new context.blob(data);
    }
    throw new Error (`context passed is invalid: ${context}`);
}

function isPrimitive(ob) {
    return (ob !== Object(ob));
}

class Serializable{

    static _validateData(data){ // checks if there is information loss on serializing the data
        function equivalence(ob1, ob2){
            if(isPrimitive(ob1) && isPrimitive(ob2)){
                return ob1 === ob2;
            } else if(isPrimitive(ob1) !== isPrimitive(ob2)){
                return false;
            }
            for(let key in ob1){
                if(ob1.hasOwnProperty(key)){
                    if(!equivalence(ob1[key], ob2[key])){
                        return false;
                    }
                }
            }
            return true;
        }
        if(isPrimitive(data)){
            return true;
        }else if(typeof data !== 'object' || data === null || data instanceof Array){
            // console.warn("null/array data", data);
            return true;            //Todo handle array of arrays as well !
        } else {
            let eq_success = equivalence(JSON.parse(JSON.stringify(data)), data);
            if(!eq_success){
                console.warn("Equivalence check failed for the data. Data is not serializable.", data);
            }
            return eq_success;
        }
    }

    constructor(data){
        if(!Serializable._validateData(data)){
            throw new Error(`blob must be initialized with serializable(tree-like, non-array) object: ${data}`);
        }
    }

    serialize(){
        throw new Error("Need to define method: serialize");
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class DataBlob extends Serializable{
    // extender blobs represent tree like objects only

    constructor(data) {
        super(data);
        if(!data){
            return;
        }
        this._data =  data;
        let data_is_fine = this.validate(data);
        if (data_is_fine === false) {
            throw new Error(`assigned data does not clear the custom validation: ${data}`);
        }
    }

    static get _context() {
        return "base";
    }

    // noinspection JSAnnotator
    get data() {
        return this._data;
    }

    set data(data) {
        if(!Serializable._validateData(data)) {  // all blobs are validated for serializability
            throw new Error(`blob must represent a non-array, tree-like object ${data}`);
        }
        let data_is_fine = this.validate(data);   // custom validators must throw their own errors or return a false status on failure
        if(data_is_fine === false) {
            throw new Error(`assigned data does not clear the custom validation: ${data}`);
        }
        this._data = data;
    }

    get packet() {
        return this.serialize();
    }

    validate(){
        return true;
    }

    _formatTimeBit(value){
        return ((value.toString().length === 1)?"0":"")+value.toString();
    }

    //TODO generalize this using string format's
    _formatTime(date){
        return `${this._formatTimeBit(date.getHours())}:${this._formatTimeBit(date.getMinutes())}:${this._formatTimeBit(date.getSeconds())}`;
    }

    //TODO generalize this using string format's
    _formatDate(date){
        return `${this._formatTimeBit(date.getDate())}/${this._formatTimeBit(date.getMonth())}/${date.getFullYear()}`;
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
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
/**------------------------------------------------------------------------------------------------------------------**/
/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView extends AdharaController{

    /**
     * @constructor
     * @param {AdharaView} parentViewInstance - parent view instance that is to be passed to render a view inside another.
     * */
    constructor(parentViewInstance){
        super();
        this._parentViewInstance = parentViewInstance;
        Adhara.addViewToInstances(this);
        this._data = null;
        this._state = {};
        this._error = null;
        this._event_listeners = {};
        this.is_active = false;
        this._registerEvents(["ViewRendered", "SubViewsRendered", "ViewFormatted", "ViewDestroyed"]);
        this._registerEvents(this.events);
        this.onInit();
    }

    /**
     * @function
     * @instance
     * @description Anything that needs to be done right after initializing the view.
     * */
    onInit(){
        //Override this method to do any miscellaneous operations/assignments right after initializing the View
    }

    /**
     * @getter
     * @instance
     * @returns {Array<String>} return list of custom event names in PascalCase...
     * @description event listener registration functions will be created dynamically by prepending "on" th the event name
     * @example
     * say get events() returns this array: ["Render", "Format"]
     * listener functions these events can be then registered using `onRender(listener)` and `onFormat(listener)`
     * */
    get events(){
        return [];
    }

    /**
     * @function
     * @protected
     * @param {Array<String>} event_names - list of events that are to be enabled on the current View instance.
     * @description registers the event names and creates event registration functions.
     * @example
     * _registerEvents(["Render", "Format"]);
     * //This will create 2 functions onRender and onFormat runtime to allow registration of events
     * */
    _registerEvents(event_names){
        for(let event_name of event_names){
            this._event_listeners[event_name] = [];
            this["on"+event_name] = handler => {
                this._event_listeners[event_name].push(handler);
            };
            this["off"+event_name] = handler => {
                this._event_listeners[event_name].splice(this._event_listeners[event_name].indexOf(handler), 1);
            };
        }
    }

    trigger(event_name, ...data){
        for(let event_handler of this._event_listeners[event_name]){
            event_handler(data);
        }
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of the view
     * */
    get template(){
        if(Adhara.router.getCurrentPageName()){
            return Adhara.router.getCurrentPageName().replace(/_/g, "-");
        }else{
            let className = this.constructor.name.toLowerCase();
            if(className.endsWith("view")){
                return className.slice(0, className.length - 4);
            }else{
                return className;
            }
        }
    }

    getCustomTemplate(type){
        for(let ViewClass of Adhara.viewHierarchy){
            if(ViewClass.isPrototypeOf(this.constructor)){
                if(Adhara.app.customViewConfig[type] && Adhara.app.customViewConfig[type][ViewClass.name]){
                    return Adhara.app.customViewConfig[type][ViewClass.name];
                }
            }
        }
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of the view
     * */
    get errorTemplate(){
        return this.getCustomTemplate("error") || null;
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} structure to be rendered when data is being fetched
     * */
    get fetchingDataTemplate(){
        return this.getCustomTemplate("fetching_data") || "";
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} structure to be rendered when there is no data available
     * */
    get noDataTemplate(){
        return this.getCustomTemplate("no_data") || "";
    }

    /**
     * @function
     * @instance
     * @description Helper method to get required template. Error template or success template.
     * */
    getTemplate(){
        return this.state.fetching_data?this.fetchingDataTemplate:(this.errors?(this.errorTemplate||this.template):this.template);
    }

    /**
     * @getter
     * @instance
     * @param {String} [batch_identifier=undefined] - In case if the config is a batch config,
     * use batch_identifier to know what url's path parameters are required.
     * @returns {Object|null} url path parameters as an object with keys as template variables
     * */
    getURLPathParams(batch_identifier){
        return null;
    }

    /**
     * @getter
     * @instance
     * @returns {Object|null} Add dynamic input data to API calls made to server
     * */
    get payload(){
        return null;
    }

    formatURL(url, params){
        if(!params){
            return url;
        }
        let match = url.match(/\${([a-zA-Z0-9$_]*)}/gi);
        let this_match = match.map( match => '${this.'+/\${([a-zA-Z0-9$_]*)}/.exec(match)[1]+'}' );
        for(let idx in match){  //in works of doesn't work here as it is not a classic Array
            url = url.replace(match[idx], this_match[idx]);
        }
        return new Function("return `" + url + "`;").call(params);
    }

    formatEntityConfig(entity_config){
        if(entity_config.data_config.hasOwnProperty("batch_data_override")){
            for(let one_config of entity_config.data_config.batch_data_override){
                let url_path_params = this.getURLPathParams(one_config.identifier);
                if(url_path_params){
                    one_config.url = this.formatURL(one_config.url, url_path_params);
                }
            }
        }else{
            let url_path_params = this.getURLPathParams();
            if(url_path_params) {
                entity_config.data_config.url = this.formatURL(entity_config.data_config.url, url_path_params);
            }
        }
        return entity_config;
    }

    /**
     * @function
     * @instance
     * @returns Adhara style entity config for entity mapped with this view
     * */
    get entityConfig(){
        let entity_name = Adhara.view_context[this.constructor.name];
        if(!entity_name){
            return null;
        }
        return this.formatEntityConfig(Adhara.app.getEntityConfig(entity_name));
    }

    /**
     * @function
     * @instance
     * @returns Add dynamic input data to API calls made to server
     * @description intermediate function that can be overridden by other generic views
     * */
    getPayload(){
        return this.payload;
    }

    /**
     * @getter
     * @instance
     * @returns {Object} state object of the current View
     * */
    get state(){
        return this._state;
    }

    create(parentViewInstance){
        if(parentViewInstance && AdharaView.isPrototypeOf(parentViewInstance.constructor)){
            this._parentViewInstance = parentViewInstance;
        }
        Adhara.addToActiveViews(this);
        this.is_active = true;
        this.fetchData();
    }

    isActive(){
        return Adhara.isActiveView(this) && this.is_active;
    }

    /**
     * @function
     * @instance
     * @description hook to make API calls, data change event will be triggered on successful API call.
     * By default no API call will be made and dataChange method will be called right away.
     * */
    fetchData(){
        this._state.fetching_data = true;
        let config = this.entityConfig;
        if(config){
            if(config.data_config.hasOwnProperty("batch_data_override")){
                this.render();
                return this.control(undefined, config);
            }
            if(Adhara.dataInterface.getHTTPMethod(config.data_config.default_query_type)==="get"){
                this.render();
                return this.control(config.data_config.default_query_type, config, this.getPayload());
            }
            return this.handleDataChange();
        }
        this.handleDataChange();
    }

    /**
     * @function
     * @private
     * @param {DataBlob|Array<DataBlob>} [new_data=null] - Data in the form of DataBlob instance to be updated in view
     * */
    handleDataChange(new_data){
        if(!this.isActive()){return;}
        this.dataChange(new_data);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @private
     * @param {*} error - Error to be updated in view
     * */
    handleDataError(error){
        if(!this.isActive()){return;}
        this.dataError(error);
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @private
     * @param {Object<String, Object<String, DataBlob|*>>} map - Data/Error to be updated in view. Map of {String} identifier vs {Object<success:response|error:error>}
     * */
    handleBatchData(map){
        if(!this.isActive()){return;}
        let errors = {};
        let success = {};
        for(let identifier in map){
            if(map.hasOwnProperty(identifier)){
                if(map[identifier].hasOwnProperty("error")){
                    errors[identifier] = map[identifier].error;
                }else{
                    success[identifier] = map[identifier].success;
                }
            }
        }
        if(Object.keys(success).length){
            this.dataChange(success);
        }
        if(Object.keys(errors).length){
            this.dataError(errors);
        }
        this._state.fetching_data = false;
        this.render();
    }

    /**
     * @function
     * @instance
     * @param {DataBlob|*} new_data - Data in the form of DataBlob instance to be set in view
     * */
    dataChange(new_data){
        this._data = new_data;
        this._error = null;
    }

    /**
     * @function
     * @instance
     * @param {*} error - Error to be set in view
     * */
    dataError(error){
        this._error = error;
    }

    /**
     * @method
     * @getter
     * @returns {*} View errors, that can be consumed by the template.
     * */
    get errors(){
        return this._error;
    }

    /**
     * @method
     * @getter
     * @returns {*} View data, that can be consumed by the template.
     * */
    get data(){
        return this._data;
    }

    _getHTML(template){
        return HandlebarUtils.execute(
            template || this.getTemplate(),
            this
        );
    }

    get parentView(){
        return this._parentViewInstance || Adhara.getView(Adhara.app.containerView);
    }

    _getParentContainer(){
        let container = this.parentView.contentContainer;
        if(typeof container === "string"){
            return container;
        }
        return container[this.constructor.name]||container["*"];
    }

    getParentContainerElement(){
        return document.querySelector(this._getParentContainer())
    }

    _render(){

    }

    render(){
        let container = this.getParentContainerElement();
        if(!container){
            console.warn("No container defined/available", this.constructor.name);
            return;
        }
        container.innerHTML = this._getHTML();
        if(this.state.fetching_data){ return; }
        this.trigger("ViewRendered");
        this._format(container);
        setTimeout(()=> {
            this.format(container);
            this.trigger("ViewFormatted");
        }, 0);
        this.renderSubViews();
        this.trigger("SubViewsRendered");
    }

    /**
     * @function
     * @getter
     * @returns {String} A CSS selector inside which child views are to be rendered.
     * */
    get contentContainer(){
        throw new Error("implement this method");
    }

    /**
     * @typedef {Object} SubView - Sub view configuration
     * @property {String} container_selector - container's CSS selector
     * @property {class} view - view class reference of the sub view
     * */

    /**
     * @function
     * @instance
     * @returns Array<SubView>
     * */
    get subViews(){
        return [];
    }

    renderSubViews(){
        if(!this.subViews){
            return;
        }
        for(let sub_view of this.subViews){
            Adhara.createView(Adhara.getView(sub_view, this), this);
        }
    }

    _format(container){
        for(let action of ["click", "change"]){
            let onActionElements = container.querySelectorAll(`[data-on${action}]`);
            for(let actionElement of onActionElements){
                if(actionElement.dataset['_adharaevent_']){
                    continue;
                }
                actionElement.addEventListener(action, event => {
                    let data = actionElement.dataset;
                    let action_key = `on${action}`;
                    if(this[data[action_key]]){
                        this[data[action_key]](event, data, this);
                    }else{
                        let fn = getValueFromJSON(window, data[action_key]);
                        if(fn) {
                            fn(event, data, this);
                        }else{
                            throw new Error(`Invalid function: ${data[action_key]} in View ${this.constructor.name}`);
                        }
                    }
                });
                actionElement.dataset['_adharaevent_'] = true;
            }
        }
    }

    format(container){
        //Control the DOM elements after rendering
    }

    refresh(){
        Adhara.createView(this);
    }

    onDestroy(){
        // This method will be called just before destroying the view
    }

    destroy(){
        // This method will destroy the view
        this.onDestroy();
        this.trigger("ViewDestroyed");
        this.is_active = false;
        try{
            this.getParentContainerElement().innerHTML = "";
        }catch(e){/*Do nothing*/}
    }

}

/**------------------------------------------------------------------------------------------------------------------**/
class AdharaListView extends AdharaView{

    constructor(parentViewInstance){
        super(parentViewInstance);
        this._page_number = 1;
    }

    get template(){
        return "adhara-list";
    }

    /**
     * @function
     * @getter
     * @returns {HandlebarTemplate} template of the list structure
     * */
    get listTemplate(){
        throw new Error("override `get listTemplate`");
    }

    /**
     * @function
     * @getter
     * @returns {HandlebarTemplate} template of the list header
     * */
    get headerTemplate(){
        throw new Error("override `get headerTemplate`");
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of a list item
     * */
    get itemTemplate(){
        throw new Error("override `get itemTemplate`");
    }

    /**
     * @method
     * @getter
     * @returns {String} Table title that is to be rendered
     * */
    get title(){
        return "";
    }

    /**
     * @method
     * @getter
     * @returns {Boolean} whether to enable pagination or not
     * */
    get isPaginationRequired(){
        return false;
    }

    /**
     * @typedef {Object} ColumnConfig
     * @property {String} key - column key
     * @property {String} name - column name that is to be rendered
     * @property {Boolean} trust_as_html - whether to render as text content or HTML content
     * @example
     * {
     *  key: "column_key",
     *  name: "Column Name",
     *  trust_as_html: false // whether to render HTML as buttons or not
     * }
     * */

    /**
     * @method
     * @getter
     * @returns {Array<ColumnConfig>} list of columns in the format of column configuration
     * */
    get columns(){
        return [];
    }

    get noDataAvailable(){
        return "No Data Available";
    }

    /**
     * @function
     * @getter
     * @returns {Boolean} whether add new button is required or not
     * */
    get addNew(){
        return false;
    }

    /**
     * @function
     * @getter
     * @returns {Number} total row count in a page
     * */
    get rowCount(){
        return AdharaListView.rowCount;
    }

    /**
     * @function
     * @getter
     * @returns {Number} the start index of the current page
     * */
    get pageNumber(){
        return this._page_number;
    }

    /**
     * @function
     * @getter
     * @returns {Boolean} if the current page is the first page
     * */
    get isFirstPage(){
        return this._page_number===1;
    }

    /**
     * @function
     * @getter
     * @returns {Boolean} if the current page is the last page
     * */
    get isLastPage(){
        //Assumption: this.data is the only has the data for the current page
        return this.data.length < this.rowCount;
    }

    /**
     * @function
     * @instance
     * @description listens to the previous page request, and triggers the Page Change Listener
     * */
    onPreviousPage(){
        this._page_number = this.pageNumber - 1;
        this.pageChange();
    }

    /**
     * @function
     * @instance
     * @description listens to the next page request, and triggers the Page Change Listener
     * */
    onNextPage(){
        this._page_number = this.pageNumber + 1;
        this.pageChange();
    }

    /**
     * @function
     * @instance
     * @description will be called on page change
     * */
    pageChange(){
        this.fetchData();
    }

    getPayload(){
        return Object.assign({}, this.payload, AdharaListView.getPagePayload(this.pageNumber));
    }

}

/**
 * @member {Number} default row count of all table instances. Default's 5.
 * Override to increase globally.
 * */
AdharaListView.rowCount = 5;

/**
 * @member {Function} Global function that implements pagePayload pattern for payload on pagination.
 * Recommended to override.
 * */
AdharaListView.getPagePayload = page=>({page});
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaFormView extends AdharaView{

    /**
     * @getter
     * @returns {String|null} action, URL to be called to post data to.
     * */
    get action(){
        return this.formElement?( this.formElement.action.split(window.location.host)[1] ): "";
    }

    get method(){
        return this.formElement?( this.formElement.getAttribute('api-method') || "post" ): "post";
    }

    get formEntityConfig(){
        let form = this.formElement;
        return Adhara.app.getEntityConfigFromContext({
            data_config: {
                url: this.formatURL(this.action, this.getURLPathParams()),
                allowed_query_types: [this.method],
                default_query_type: this.method
            },
            processor: {
                success: (query_type, entity_config, response, xhr, pass_over)=>{
                    if(this.clearFormOnSuccess) {
                        form.reset();
                    }
                    this.updateFormState(false);
                    this.onSuccess(response);
                },
                error: (query_type, entity_config, error, xhr, pass_over)=>{
                    this.updateFormState(false);
                    this.onError(error);
                }
            }
        });
    }

    /**
     * @getter
     * @instance
     * @returns {Boolean} whether to clear form on successful submission or not
     * */
    get clearFormOnSuccess(){
        return this.formElement.getAttribute('form-clear')==="true";
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Response Object
     * @description This method will be called on forms's POST/PUT call success
     * */
    onSuccess(data){
        Toast.success("Success");
    }

    /**
     * @function
     * @instance
     * @param {Object} error - Error Response Object
     * @description This method will be called on forms's POST/PUT failure
     * */
    onError(error){
        Toast.error(error);
    }

    /**
     * @function
     * @instance
     * @param {Error} error - Error thrown from validator
     * */
    onValidationError(error){
        Toast.error(error.message);
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Form data
     * @returns {Boolean} Whether the data is valid or not
     * */
    validate(data){
        let validate_fn = this.formElement.getAttribute('validate-data');
        if(validate_fn) {
            return !!call_fn(validate_fn, data);
        }
    }

    /**
     * @function
     * @instance
     * @param {Object} data - Form data
     * @returns {Object} Modified/Formatted data
     * */
    formatData(data){
        let format_fn = this.formElement.getAttribute('format-data');
        if(format_fn) {
            data = call_fn(format_fn, data);
        }
        return data;
    }

    /**
     * @getter
     * @instance
     * @returns {HTMLFormElement} HTML node which represents the Form element
     * */
    get formElement(){
        if(!this._formElement || !document.body.contains(this._formElement)){
            this._formElement = this.getParentContainerElement().querySelector("form");
        }
        if(!this._formElement){
            throw new Error("No from element discovered!");
        }
        return this._formElement;
    }

    /**
     * @funciton
     * @instance
     * @returns {*} Field data
     * */
    getFieldValue(field_name){
        let field = this.formElement[field_name];
        if(field.type==="number"){
            return +field.value;
        }else if(field.type==="checkbox"){
            return field.checked;
        }
        return field.value;
    }

    /**
     * @funciton
     * @instance
     * @returns {*} Field data
     * */
    setFieldValue(field_name, value){
        let field = this.formElement[field_name];
        if(field.type==="checkbox"){
            field.checked = true;
        }else{
            field.value = value;
        }
    }

    /**
     * @getter
     * @instance
     * @description whether to handle file uploads or not!
     * */
    get handleFileUploads(){
        return true;
    }

    updateFormState(submitting){
        this.formElement.submitting = submitting;
        this.handleSubmitButton();
    }

    get submitButton(){
        return this.formElement.querySelector('button[type="submit"]');
    }

    handleSubmitButton(){
        let submit_button = this.submitButton;
        if(!submit_button){
            console.warn("Unable to discover 'Submit button'. Duplicate submission are not handled.");
            return;
        }
        if(this.formElement.submitting){
            submit_button.dataset.tosubmit = submit_button.innerHTML;
            submit_button.innerHTML = submit_button.dataset.inprogress || submit_button.dataset.tosubmit;
            submit_button.disabled = true;
        }else{
            submit_button.dataset.inprogress = submit_button.innerHTML;
            submit_button.innerHTML = submit_button.dataset.tosubmit;
            submit_button.disabled = false;
        }
    }

    /**
     * @getter
     * @private
     * @description handle making API call on behalf of the form
     * */
    _handleForm(){
        let form = this.formElement;
        if(form.submitting){
            return;
        }
        this.updateFormState(true);
        let apiData;
        let fileElements = Array.prototype.slice.apply(form.querySelectorAll('input[type="file"]')).filter(fileElement => !fileElement.disabled);
        if(this.handleFileUploads && !!fileElements.length){ // ~ if(hasFiles){
            apiData = new FormData(form);
        }else{
            let formData = jQuery(form).serializeArray();
            apiData = {};
            jQuery.each(formData, function (i, fieldData) {
                apiData[fieldData.name] = fieldData.value;
            });
        }
        try{
            this.validate(apiData)
        }catch(e){
            return this.onValidationError(e);
        }
        apiData = this.formatData(apiData);
        return this.control(this.method, this.formEntityConfig, apiData);
    }

    _format(container){
        super._format(container);
        if(this.errors){
            return;
        }
        this.formElement.addEventListener("submit", (event) => {
            event.preventDefault();
            this.submit();
        });
    }

    submit(){
        this._handleForm(this.formElement);
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
/**
 * Created by varun on 19/12/17.
 * TODO : 1. need to take in different table configurations, 2. need a preprocessor for data before drawing table
 */

class AdharaGridView extends AdharaListView{

    get listTemplate(){
        return 'adhara-list-grid';
    }

    get tableClass(){
        return "table-bordered table-hover";
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaTemplateView extends AdharaListView{

    get listTemplate(){
        return 'adhara-list-template';
    }

    get headerTemplate(){
        return 'adhara-list-template-header';
    }

    get itemTemplate(){
        return 'adhara-list-template-item';
    }

    get tableClass(){
        return "table-bordered table-hover";
    }

    get containerAttributes(){
        return {};
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaCardView extends AdharaListView{

    get template(){
        return "adhara-card";
    }

    get containerClass(){
        return "";
    }

    get cardSizeClass(){
        return "col-md-4";
    }

    get itemTemplate(){
        return "adhara-card-content";
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
/**
 * Created by varun on 10/2/18.
 */
class AdharaDialogView extends AdharaView{

    onInit(){
        this._modalId = "adhara-dialog-id-"+Date.now();
        this.destroy = this.destroy.bind(this);
    }

    get template(){
        return "adhara-dialog";
    }

    get titleTemplate(){
        return 'Adhara Dialog';
    }

    get messageTemplate(){
        return 'Adhara Dialog Message!';
    }

    get buttons() {
        return [
            {
                attributes: {
                    "type": "button",
                    "class": "btn btn-secondary",
                    "data-dismiss": "modal"
                },
                text : 'Close'
            }
        ];
    }

    get modalId(){
        return this._modalId;
    }

    get wrapperId(){
        return `${this.modalId}-wrapper`;
    }

    get modalElement(){
        if(!this._modalElemnt || !document.body.contains(this._modalElemnt[0])){
            this._modalElemnt = $('#'+this.modalId);    //Using jQ as that is mostly used in this view
        }
        return this._modalElemnt;
    }

    get isAutoShow(){
        return true;
    }

    get destroyOnClose(){
        return true;
    }

    getParentContainerElement(){
        // return document.querySelector('.adhara-dialog')
        return document.querySelector('#'+this.wrapperId);
    }

    render(){
        let dialog_elements = document.querySelectorAll('#'+this.modalId);
        if(dialog_elements && dialog_elements.length){
            for(let i = 0; i < dialog_elements.length; i++){
                dialog_elements[i].remove()
            }
        }
        let wrapper= document.createElement('div');
        wrapper.id = this.wrapperId;
        wrapper.classList.add('adhara-dialog');
        document.querySelector('body').appendChild(wrapper);
        super.render();
    }

    format(){
        if(this.isAutoShow){
            this.show();
        }
    }

    show(){
        this.modalElement.modal('show');
        if(this.destroyOnClose){
            setTimeout(()=>{
                this.modalElement.on('hidden.bs.modal', this.destroy);
            }, 0);
        }
    }

    hide(){ //Note: destroy's if destroyOnClose is enabled. See event listener binding in show() method.
        this.modalElement.modal('hide');
    }

    onDestroy(){
        let wrapper_element = document.getElementById(this.wrapperId);
        if(wrapper_element) {
            wrapper_element.remove();
        }
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaTabView extends AdharaView{

    get template(){
        return "adhara-tab-view";
    }

    get containerClass(){
        return 'nav nav-pills';
    }

    get tabNavClass(){
        return 'custom-tabs-line tabs-line-bottom left-aligned';
    }

    get tabListClass(){
        return "nav";
    }

    get tabs(){
        return [];
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Active tab configuration
     * */
    get currentTab(){
        let current_tab_link_from_url = Adhara.router.getCurrentURL();
        let current_Tab = this.tabs.filter(tab=>tab.link===current_tab_link_from_url);
        return current_Tab.length?current_Tab[0]:this.tabs[0];
    }

    get tabsList(){
        let current_tab_id = this.currentTab.id;
        return this.tabs.map(tab => {
            tab.className = (tab.id === current_tab_id)?"active":"";
            return tab;
        });
    }

    get nextSelector(){
        return '.btn-next';
    }

    get previousSelector(){
        return '.btn-previous';
    }

    onTabShow() {

    }

    onTabClick(){

    }

    onTabChange(){

    }

    /*onShow(){

    }*/

    format(){

    }

    get contentContainer(){
        return ".tab-content .tab-pane";
    }

    renderSubViews(){
        Adhara.createView(Adhara.getView(this.currentTab.view, this));
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaContainerView extends AdharaView{

    get template(){
        return "container";
    }

    get contentContainer(){
        return "main";
    }

    _getParentContainer(){
        return Adhara.app.DOMSelector;
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaDialogFormView extends MutateViews(AdharaFormView, AdharaDialogView){

    primaryAction(){
        this.submit();
    }

    get primaryActionTitle(){
        return 'Save';
    }

    get submitButton(){
        return this.getParentContainerElement().querySelector('button.btn-primary');
    }

    get buttons(){
        if(this.primaryActionTitle){
            return [
                super.buttons[0],
                {
                    attributes: {
                        "type": "button",
                        "class": "btn btn-primary",
                        "data-onclick": "primaryAction"
                    },
                    text : this.primaryActionTitle
                }
            ]
        }else{
            return super.buttons;
        }

    }

}
/**------------------------------------------------------------------------------------------------------------------**/
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
/**------------------------------------------------------------------------------------------------------------------**/
class StorageSelector{

    static select(){
        if(window.hasOwnProperty("indexedDB")){
            return AdharaDBStorage;
        }else{
            return AdharaCacheStorage;
        }
    }

}
/**------------------------------------------------------------------------------------------------------------------**/
class AdharaDBStorage extends AdharaStorage{

    constructor(){
        super();
        // promise based Async wrapper for indexedDB

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
            let p = new Promise((resolve, reject) => {
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
            properties.forEach(prop => {
                if (!(prop in Constructor.prototype)) {
                    return;
                }
                ProxyClass.prototype[prop] = function(){
                    return promisifyRequestCall(this[targetProp], prop, arguments);
                };
            });
        }

        function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
            properties.forEach(prop => {
                if (!(prop in Constructor.prototype)) {
                    return;
                }
                ProxyClass.prototype[prop] = function(){
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
                    return promisifyRequest(cursor._request).then(value => value ? (new Cursor(value, cursor._request)) : null);
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
                    let args = Array.prototype.slice.call(arguments);
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

        let idb = {
            open: (name, version, upgradeCallback)=>{
                let p = promisifyRequestCall(indexedDB, 'open', [name, version]);
                let request = p.request;

                request.onupgradeneeded = function(event) {
                    if (upgradeCallback) {
                        upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
                    }
                };

                return p.then((db)=>{
                    return new DB(db);
                });
            },
            del: (name)=>{
                return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
            }
        };

        this.dbs = {};
        for(let db_config of Adhara.app.DBConfig){
            this.dbs[db_config.id] = idb.open(db_config.name, db_config.version, upgradeDb => this.createObjectStores(upgradeDb, db_config));
        }

    }

    createObjectStores(upgradeDb, db_config){
        try{
            let db_schema = db_config.schema;
            for(let table_name in db_schema){
                if(db_schema.hasOwnProperty(table_name)){
                    if(!upgradeDb.objectStoreNames.contains(table_name)){   //If table doesn't exist already
                        let os = upgradeDb.createObjectStore(table_name, db_schema[table_name]);
                        //indexes = [
                        // // See for more details https://developers.google.com/web/ilt/pwa/working-with-indexeddb#defining_indexes
                        //      {
                        //          name: "title-index",
                        //          property: "title",
                        //          options: {
                        //              unique: true
                        //          }
                        //      }
                        //      {
                        //          name: "gender-index",
                        //          property: "gender",
                        //          options: {
                        //              unique: false
                        //          }
                        //      }
                        // ]
                        for(let index of db_schema[table_name].indexes){
                            os.createIndex(index.name, index.property, index.options);
                        }
                    }
                }
            }
            return true;
        } catch(e){
            return false;
        }
    }

    select(database_name, dataset_name){
        return new DBStorageOperator(dataset_name, this.dbs[database_name]);
    }

}

class DBStorageOperator extends AdharaStorageOperator{

    constructor(dataset, db){
        super(dataset);
        this.db = db;
    }

    retrieve(key) {
        return this.db.then(db => {
            return db.transaction(this.dataset)
                .objectStore(this.dataset).get(key);
        });
    }

    store(key, val) {
        if(!val){
            val = key;
            key = undefined;
        }
        return this.db.then(db => {
            const tx = db.transaction(this.dataset, 'readwrite');
            tx.objectStore(this.dataset).put(val, key);
            return tx.complete;
        });
    }

    remove(key) {
        return this.db.then(db => {
            const tx = db.transaction(this.dataset, 'readwrite');
            tx.objectStore(this.dataset).delete(key);
            return tx.complete;
        });
    }

    removeAll() {
        return this.db.then(db => {
            const tx = db.transaction(this.dataset, 'readwrite');
            tx.objectStore(this.dataset).clear();
            return tx.complete;
        });
    }

    keys() {
        return this.db.then(db => {
            const tx = db.transaction(this.dataset);
            const keys = [];
            const store = tx.objectStore(this.dataset);
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

}
/**------------------------------------------------------------------------------------------------------------------**/
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
/**------------------------------------------------------------------------------------------------------------------**/
class DataInterface extends StorageSelector.select(){

    constructor(){
        super();
        this.config = Adhara.app._diConfig;
        this.request_queue = {}; // for NON-get requests
        this.rem_que = {};
        this.db_table = this.select("default", this.config.http_cache_table);
        this.initDependencies();
    }

    // local helpers ...
    makeServiceCall(url, method_name, data){
        data = Adhara.app.requestMiddleWare(url, method_name, data);
        return new Promise(function (resolve, reject) {
            // make API call and fetch data OR fetch from client storage, pass on_success and on_failure to the thing
            RestAPI[method_name] ({
                url, data, crossDomain: true, xhrFields: { "withCredentials": true },
                beforeSend(xhr){
                    xhr.withCredentials = true;
                },
                success(response, xhr){
                    resolve({response, xhr});
                },
                failure (error, xhr){
                    reject({error, xhr});
                }
            });
        });
    }

    handle_bulk_config(query_type, entity_configs, data, opts){
        if(['get', 'get_list'].indexOf(query_type) < 0) return;
        let num_reqs = entity_configs.length,
            result = new Array(num_reqs),
            entry_count = 0;
        let caller_viewable = opts.caller_view && (opts.caller_view instanceof AdharaView
            || (opts.caller_view.hasOwnProperty('handleDataChange')
                && typeof opts.caller_view.handleDataChange === 'function'));
        for(let i=0; i<num_reqs; i++){
            let dummy_entity_config = Object.assign({}, entity_configs[i]);
            dummy_entity_config.processor = (function IIFE(scoped_i){
                return {
                    success: function(query_type, entity_config, response, xhr){
                        let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, response, xhr);
                        result[scoped_i] = processed_data;
                        entry_count++;
                        if(caller_viewable) {
                            if(entry_count === num_reqs) {
                                opts.caller_view.handleDataChange(result);
                            }
                        } else {
                            Adhara.configUtils.getViewInstance(entity_config).handleDataChange(processed_data);
                        }
                    },
                    error: function(query_type, entity_config, error, xhr){
                        let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, error, xhr);
                        result[scoped_i] = processed_data;
                        entry_count++;
                        if(caller_viewable) {
                            if(entry_count === num_reqs){
                                opts.caller_view.handleDataChange(result);
                            }
                        } else {
                            Adhara.configUtils.getViewInstance(entity_config).handleDataError(processed_data);
                        }
                    }
                };
            })(i);
            this.enqueue(query_type, dummy_entity_config, data, opts);
        }
    }

    handle_batch_enqueue(entity_config){
        let batch_result_map = {};
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        let batch_calls = data_config.batch_data_override;
        function check_fills(obj){
            for(let k in obj){
                if(obj.hasOwnProperty(k)){
                    if(typeof obj[k] === 'undefined'){
                        return false;
                    }
                }
            }
            return true;
        }
        function publishToView(final_batch_data){
            Adhara.configUtils.getViewInstance(entity_config).handleBatchData(final_batch_data);
        }
        let batch_processor = { // custom processor for batching requests
            success: function(query_type, entity_config, response, xhr){
                let blob = Adhara.configUtils.getBlobClass(entity_config);
                let data_config = Adhara.configUtils.getDataConfig(entity_config);
                let processed_data;
                if(query_type==="get_list"){
                    processed_data = [];
                    for(let datum of response){
                        processed_data.push(new blob(datum));
                    }
                }else{
                    processed_data = new blob(response);
                }
                batch_result_map[data_config.identifier] = {success:processed_data};
                if(check_fills(batch_result_map)) publishToView(batch_result_map);
                processor_helper.on_success_common(query_type, entity_config, response, xhr);
            },
            error: function(query_type, entity_config, error, xhr){
                let data_config = Adhara.configUtils.getDataConfig(entity_config);
                batch_result_map[data_config.identifier] = {error};
                if(check_fills(batch_result_map)) publishToView(batch_result_map);
            }
        };
        for(let batch_call of batch_calls){
            batch_result_map[batch_call.identifier] = undefined;
            //TODO add stuff to the cline db after query abd before querying teh ckiebt DV befire quertubg!
            //add stuff to the client db after query and before querying the client DB
            let dummy_entity_config = {
                data_config: {
                    url: batch_call.url,
                    _url: batch_call.url,
                    identifier: batch_call.identifier,
                    default_query_type: batch_call.query_type || 'get',
                    allowed_query_types: ["get", "get_list"],
                    reuse: batch_call.reuse,
                    blob: batch_call.blob
                },
                view: Adhara.configUtils.getViewInstance(entity_config),
                processor: batch_processor
            };
            this.enqueue(undefined, dummy_entity_config, undefined);
        }
    }

    isValidStorageData(stored_data){
        return stored_data.hasOwnProperty("response");
    }

    isMethodAllowed(query_type, http_method, data_config) {
        return (
            Adhara.app.allowedHttpMethods.indexOf(http_method) !== -1
            || ( data_config.allowed_query_types && data_config.allowed_query_types.indexOf(query_type) !== -1 )
        );
    }

    isValidDataConfig(data_config){
        return (data_config instanceof Object
            && data_config.allowed_query_types instanceof Array
            && typeof data_config.url === "string"
            && data_config.allowed_query_types.length > 0)
            ||  (data_config instanceof Object
                && data_config.batch_data_override instanceof Array);
    }

    isValidProcessor(processor){
        return (processor instanceof Object
            && processor.success instanceof Function
            && processor.error instanceof Function);
    }

    isValidEntityConfig(entity_config){
        if(entity_config instanceof Object && this.isValidDataConfig(entity_config.data_config)){
            if (entity_config.data_config.batch_data_override){
                return true;
            }
            else if(entity_config.data_config.allowed_query_types.indexOf('get') > -1
                || entity_config.data_config.allowed_query_types.indexOf('get_list') > -1 ){
                if(this.isValidProcessor(entity_config.processor)){
                    return true;
                } else if( !(AdharaView.isPrototypeOf(entity_config.view)) ) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    getHTTPMethod(query_type){
        return query_type==="get_list"?"get":query_type;
    }

    getUniqueUrlForData(url, http_method, data){
        return url+ ( data?("?"+Object.keys(data).sort().map(key=> key+"="+data[key]).join("&")):"" );
    }

    remember(url, response, reuse, _url){
        let expires = (reuse.timeout || this.config.reuse_timeout || 5*60*1000 ) + Date.now();  //5 minutes is the default timeout
        let _ = {
            expires,
            url: _url
        };
        if(reuse.scope === "in_page"){
            _.page_name = Adhara.router.getCurrentPageName();
        }
        this.rem_que[url] = response;  // hold response till dbPromise resolves
        return this.db_table.store({ url, response, _ }).then(()=> {
            delete this.rem_que[url];
            return true;
        });
    }

    recall(data_url) {
        return new Promise((resolve, reject) => {
            if(this.rem_que[data_url]){
                resolve(this.rem_que[data_url]);
            } else {
                this.db_table.retrieve(data_url).then((data)=>{
                    if(!data){
                        reject({message: "No such key stored", code:404});
                    } else if (isNaN(data._.expires) || data._.expires < (new Date()).getTime()){
                        reject({message: "data has expired", code:404});
                    }
                    else {
                        this.isValidStorageData(data) ? resolve(data.response) : reject({message:`Invalid data ${data.response}`, code:500});
                    }
                });//.catch(reject);
            }
        });
    }

    remove(data_url) {
        return this.db_table.remove(data_url);
    }

    signalViewSuccess(query_type, entity_config, response_json, xhr){
        Adhara.configUtils
            .getProcessor(entity_config)
            .success(query_type, entity_config, response_json, xhr, true);
    }

    signalViewFailure(query_type, entity_config, error, xhr){
        Adhara.configUtils
            .getProcessor(entity_config)
            .error(query_type, entity_config, error, xhr);
    }

    // rest of the public methods and local glue logic goes here ...
    enqueue(query_type, entity_config, data, options){
        // AS OF NOW options can contain additional parameter 'caller_view'. Which ensures the caller view does get the result.
        if(!this.isValidEntityConfig(entity_config)){
            throw new Error(`Entity config passed to enqueue is invalid: ${JSON.stringify(entity_config, null, 4)}`);
        }
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        if(data_config.hasOwnProperty("batch_data_override")){    // Map of url -> data
            this.handle_batch_enqueue(entity_config);
            return;
        }
        if(entity_config instanceof Array){ // Array of app configs -> array of responses
            // batch call type 2
            this.handle_bulk_config(query_type, entity_config, data, options);
            return;
        }
        // if it is not a get or get_list it will make it wait in a queue
        if(!(this.request_queue[data_config.url] instanceof Array)){
            this.request_queue[data_config.url] = [];
        }
        if(['get', 'get_list'].indexOf(query_type) < 0) {
            if(options && options.consider_for_queueing !== false){
                options.consider_for_queueing = false; // would prevent recursive queueing of the same URL
                this.request_queue[data_config.url].push( {entry_time : performance.now(), arg : [query_type, entity_config, data, options]} );
                if(this.request_queue[data_config.url].length > 1) { // not the first entry, taken up later hence
                    return;
                }
            }
        }

        //=========================================================================================================//
        //                  LOGISTICS END HERE, CORE ENQUEUE IS BELOW THIS COMMENT
        //=========================================================================================================//

        if(!query_type) query_type = data_config.default_query_type;
        let http_method = this.getHTTPMethod(query_type);
        if(!this.isMethodAllowed(query_type, http_method, data_config)) {  // either globally off or off due to links configured for particular data configuration
            let failure_message = {message: "Unauthorized Request"};
            this.signalViewFailure(query_type, entity_config, failure_message, 405);
            return;
        }
        let reuse = data_config.reuse || {};
        if( ( reuse.enable !== false && this.config.default_reuse !== false ) && ['get', 'get_list'].indexOf(http_method) !== -1 ){
            let unique_url = this.getUniqueUrlForData(data_config.url, http_method, data);
            let msc = ()=>{
                //initiating call to Backend Service, and registering listeners for success and failure
                this.makeServiceCall(data_config.url, http_method, data).then(response_object => {
                    let response = Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr);
                    this.signalViewSuccess(
                        query_type, entity_config,
                        response,
                        response_object.xhr
                    );
                    this.remember(unique_url, response, reuse, data_config._url);
                }, error_response_object => {
                    this.signalViewFailure(
                        query_type, entity_config,
                        Adhara.app.responseMiddleWare(entity_config, false, error_response_object.error, error_response_object.xhr),
                        error_response_object.xhr
                    );
                });
            };
            this.recall(unique_url)
                .then(
                    response => {
                        if(!(reuse instanceof Function) || reuse(response)){
                            let xhr = new XMLHttpRequest();
                            this.signalViewSuccess(query_type, entity_config, response, xhr);
                        }else{
                            msc();
                        }
                    },
                    err => {
                        msc();
                    });
        } else {
            this.makeServiceCall(data_config.url, http_method, data).then(response_object => {
                this.signalViewSuccess(
                    query_type, entity_config,
                    Adhara.app.responseMiddleWare(entity_config, true, response_object.response, response_object.xhr),
                    response_object.xhr
                );
            }, error_response_object => {
                this.signalViewFailure(
                    query_type, entity_config,
                    Adhara.app.responseMiddleWare(entity_config, false, error_response_object.error, error_response_object.xhr),
                    error_response_object.xhr
                );
            }).then(()=>{
                this.request_queue[data_config.url].shift();
                if(this.request_queue[data_config.url].length > 0){
                    if(performance.now() - this.request_queue[data_config.url][0]['entry_time'] <= 30000){
                        this.enqueue(...(this.request_queue[data_config.url][0]['arg']));
                    }
                    else {
                        this.request_queue[data_config.url] = [];
                    }
                }
            });
        }
    }

    cleanUp(current_page_name){
        this.db_table.removeMultiple((url, response) => {
            return ( response._.expires <= Date.now()
                        || ( response._.page_name && response._.page_name !== current_page_name ) );
        });
    }

    initDependencies(){
        Adhara.router.onRoute("DIPageChangeListener", ()=>{
            this.cleanUp(Adhara.router.getCurrentPageName());
        });
    }

}

/**------------------------------------------------------------------------------------------------------------------**/
let processor_helper = {
    on_success_common: function(query_type, entity_config, response, xhr, pass_over){
        // put here the common functionality that is shared among all the processors on success
        // like intimating the data to other processors of contexts with mutually same data_configs
        let data_config = Adhara.configUtils.getDataConfig(entity_config);
        if(!data_config) return;
        let related_app_configs = Adhara.configUtils.getByDataConfig(data_config);
        for(let i = 0; i < related_app_configs.length; i++){
            let processor = Adhara.configUtils.getProcessor(related_app_configs[i]);
            if(processor){
                processor.success(query_type, related_app_configs[i], response, xhr, pass_over);
            }
        }
    },
    get_basic_processed_data: function(query_type, entity_config, response, xhr){
        let blob = Adhara.configUtils.getBlobClass(entity_config);
        let processed_data;
        if(query_type==="get_list"){
            processed_data = [];
            for(let datum of response){
                processed_data.push(new blob(datum));
            }
        }else{
            processed_data = new blob(response);
        }
        return processed_data;
    }
};

let Processor = {

    fallback: {
        success: function(query_type, entity_config, response, xhr, pass_over){
            let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, response, xhr);
            let view = Adhara.configUtils.getViewInstance(entity_config);
            // move on to the functionality common among all the processors
            if(pass_over === true){
                processor_helper.on_success_common(query_type, entity_config, response, xhr, false);
            }else{
                if(view){
                    view.handleDataChange(processed_data);
                }
            }
        },
        error: function(query_type, entity_config, error, xhr){
            let processed_data = {error, response_code:xhr.status};
            // let processed_data = processor_helper.get_basic_processed_data(query_type, entity_config, error, xhr);
            //TODO is it required to create error response as a blob?
            let view = Adhara.configUtils.getViewInstance(entity_config);
            if(view) {
                view.handleDataError(processed_data);
            }
        }
    }

};
// register with this object all the processors for the data as per all the contexts
/**------------------------------------------------------------------------------------------------------------------**/
class WebSocket{

    constructor(web_socket_config){
        let socket = this.socket = io.connect(web_socket_config.url||"/socket", {
            resource: web_socket_config.resource || "/"
        });
        socket.on('connect_failed', data => console.log('connect_failed', data));
        socket.on('connecting', data => console.log('connecting', data));
        socket.on('disconnect', data => console.log('disconnect', data));
        socket.on('error', reason => console.log('error', reason));
        socket.on('reconnect_failed', data => console.log('reconnect_failed', data));
        socket.on('reconnect', data => console.log('reconnect', data));
        socket.on('reconnecting', data => console.log('reconnecting', data));
    }

    listen(){   // instance scope method
        let config = Adhara.app.config;
        for(let app_conf in config){
            if(config.hasOwnProperty(app_conf)){
                let data_config = Adhara.configUtils.getDataConfig(app_conf);
                if(!data_config.socket_tag) continue;
                this.socket.on(data_config.socket_tag, (data) => {
                    Adhara.configUtils.getProcessor(app_conf)(data);
                });
            }
        }
    }

}

WebSocket.listen = (web_socket_config) => { // static scope method
    let ws = new WebSocket(web_socket_config);
    ws.listen();
};