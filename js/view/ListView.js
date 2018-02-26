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