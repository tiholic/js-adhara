class AdharaEventHandler{

    constructor(){
        this._event_listeners = {};
        this._registerEvents(this.events);
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

    /*
    // THIS CAN BE ENABLED IF SUPPORT FOR CUSTOM EVENTS OTHER THAN VIEW SPECIFIC EVENTS IS REQUIRED
    on(event_name, handler){
        if(!this._event_listeners[event_name]){
            this._event_listeners[event_name] = [];
        }
        this._event_listeners[event_name].push(handler);
    }

    off(event_name, handler){
        this._event_listeners[event_name] = this._event_listeners[event_name].filter(_handler => _handler!==handler);
    }*/

    trigger(event_name, ...data){
        for(let event_handler of this._event_listeners[event_name]){
            event_handler(data);
        }
    }

}