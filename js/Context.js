class Context {

    /**
     * @param {String} key - Class instance key passed by instance creator.
     * @param {AdharaView} view - View instance to whom this context belongs to.
     * */
    constructor(key, view) {
        this.key = key;
        this.view = view;
    }

    set parentContext(parent_context) {
        this._parentContext = parent_context;
        this._parentContext.childContext = this;
    }

    get parentContext() {
        return this._parentContext || Adhara.container.context;
    }

    set childContext(child_context) {
        if(!this._childContexts){
            this._childContexts = [];
        }
        this._childContexts.push(child_context);
    }

    get childContexts() {
        return this._childContexts;
    }

    /**
     * @function
     * @description searches context tree and returns a class instance
     * @param {class} classRef - class reference of an AdharaView class
     * @param {String} instanceKey - instance tag as string
     * */
    getViewFromRenderTree(classRef, instanceKey) {
        return this.searchViewInCurrentTreeAndUp(classRef, instanceKey) || this.searchViewInWholeTree(classRef, instanceKey);
    }

    checkKey(contextKey, instanceKey){
        return (!instanceKey || contextKey === instanceKey);
    }

    searchViewInCurrentTreeAndUp(classRef, instanceKey) {
        if(classRef === Adhara.container.constructor){
            return Adhara.container;
        }
        if(this.view === Adhara.container){
            return;
        }
        if (
            (this.parentContext.view.constructor === classRef)
            && this.checkKey(this.parentContext.key, instanceKey)
        ) {
            return this.parentContext.view;
        }
        return this.parentContext.getViewFromRenderTree(classRef, instanceKey);
    }

    searchViewInWholeTree(classRef, instanceKey) {
        let containerView = this.searchViewInCurrentTreeAndUp(Adhara.container.constructor);
        return containerView.context.searchChildren(classRef, instanceKey);
    }

    searchChildren(classRef, instanceKey) {
        for(let context of this.childContexts){
            if(context.view.constructor === classRef && this.checkKey(context.key, instanceKey)){
                return context.view;
            }
        }
        for(let context of this.childContexts){
            let matchedView = context.searchChildren(classRef, instanceKey);
            if(matchedView){
                return matchedView;
            }
        }
    }

}