/**
 * @typedef {Object} ElementAttributes
 * @description attributes that can be set in a element using `addAttr` helper for Handlebar files.
 * */

class TemplateEngineHelpers{

    /**
     * @namespace
     * @description
     * Helpers written for handlebars. Can also be used by static references.
     * */
    static getHelpers(currentHelpers){
        let if_helper = currentHelpers.if;
        return {
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
             * TemplateUtils.execute(
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
                    attributes = Object.assign( default_attributes, attributes );
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
            'addProps': function(){
                let properties = Array.prototype.slice.call(arguments);
                return properties.splice(0, properties.length-1).join(' ');
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
                return new window.Handlebars.SafeString(TemplateUtils.execute(template_name, context));
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
            'if' : function(param1, operator, param2, options){
                if(typeof operator === "object"){
                    return if_helper.call(this, param1, operator);
                }
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
            },
            /*
            TODO handle better!
            'generate': function(context, options){
                let generatorInstance = context(),
                    ret = '', done = false, index = 0,
                    data = {};

                function execIteration(field, index, last) {
                    if (data) {
                        data.key = field;
                        data.index = index;
                        data.first = index === 0;
                        data.last = !!last;
                    }

                    ret = ret + options.fn(context[field], {
                        data: data,
                        // blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
                    });
                }

                do{
                    let yi = generatorInstance.next();
                    done = yi.done;
                    execIteration(yi.value, ++index, done===true);
                }while(done===false);
                console.log(context, options);
                return ret;
            }*/
        };
    }

    static registerHelpers(){
        window.Handlebars.registerHelper(TemplateEngineHelpers.getHelpers(window.Handlebars.helpers));
    }

}
