class AdharaListView extends AdharaView{

    constructor(parentViewInstance){
        super(parentViewInstance);
        this._page_number = 1;
        this.searchText = null;
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
     * @returns {HandlebarTemplate}
     * @description this template contents will be rendered just above the table.
     * */
    get menuTemplate(){
        return "adhara-list-menu";
    }

    /**
     * @function
     * @getter
     * @returns {Array<Object>} Buttons to be added in the header
     * @example
     * return [
     *  {
     *      title: "Add new element",
     *      attributes: {
     *          "class": "btn btn-primary",
     *          "data-onclick": "openForm",
     *      }
     *  }
     * ]
     * */
    get buttons(){
        return [];
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
    previousPage(){
        this.setPage(this.pageNumber - 1);
        this.pageChange();
    }

    /**
     * @function
     * @instance
     * @description listens to the next page request, and triggers the Page Change Listener
     * */
    nextPage(){
        this.setPage(this.pageNumber + 1);
        this.pageChange();
    }

    firstPage(){
        this.setPage(1);
        this.pageChange();
    }

    setPage(page_number){
        this._page_number = page_number;
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
        if(this.isPaginationRequired){
            return Object.assign({}, super.getPayload(), AdharaListView.getPagePayload(this.pageNumber));
        }
        return super.getPayload();
    }

    search(){
        return {
            attributes: {

            }
        }
    }

    onSearchToggle(event, data){
        if(event.target === document.activeElement){
            event.target.classList.add("active");
        }else{
            event.target.classList.remove("active");
        }
    }

    onSearchCapture(event, data){
        if(event.target.value !== this.searchText){
            this.onSearch(event.target.value);
            this.searchText = event.target.value;
        }
    }

    onSearch(text){
        console.error(`TODO Search is enabled for this list view.
         So, implement onSearch... search text: "${text}"`);
    }

    format(container){
        if(this.searchText) {
            let $search = container.querySelector("input[type=\"search\"]");
            $search.focus();
            $search.setSelectionRange(this.searchText.length, this.searchText.length);
        }
        super.format(container);
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