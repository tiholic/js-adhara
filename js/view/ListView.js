class AdharaListView extends AdharaView{

    constructor(parentViewInstance){
        super(parentViewInstance);
        this._page_index = 0;
        this.onPageChange(this.pageChangeListener);
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
     * @returns {Array<Events>} events to be registered
     * */
    get events(){
        return ["PageChange"];
    }

    /**
     * @function
     * @getter
     * @returns {int} total row count in a page
     * */
    get rowCount(){
        return 5;
    }

    /**
     * @function
     * @getter
     * @returns {int} the start index of the current page
     * */
    get pageIndex(){
        return this._page_index;
    }

    /**
     * @function
     * @getter
     * @returns {Boolean} if the current page is the first page
     * */
    get isFirstPage(){
        if(this._page_index == 0){
            return true;
        }
        return false;
    }

    /**
     * @function
     * @getter
     * @returns {Boolean} if the current page is the last page
     * */
    get isLastPage(){
        //TODO assuming this.data is the only has the data for the current page
        if(this.data.length < this.rowCount){
            return true;
        }
        return false;
    }

    /**
     * @function
     * @instance
     * @description listens to the previous page request, and triggers the Page Change Listener
     * */
    onPreviousPage(e){
        this._page_index = this.pageIndex - this.rowCount;
        this.trigger("PageChange");
    }

    /**
     * @function
     * @instance
     * @description listens to the next page request, and triggers the Page Change Listener
     * */
    onNextPage(e){
        this._page_index = this.pageIndex + this.rowCount;
        this.trigger("PageChange");
    }

    //TODO check if necessary (included to make it a mandate to override)
    pageChangeListener(){
        if(this.isPaginationRequired){
            throw new Error("page change listener needs to be overridden");
        }
    }

}