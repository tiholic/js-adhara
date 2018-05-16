
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
        if(global_letiable.indexOf("Adhara.") === 0){
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