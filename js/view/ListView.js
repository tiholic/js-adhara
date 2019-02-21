class AdharaListView extends AdharaView{

    constructor(parentViewInstance){
        super(parentViewInstance);
        this._page_number = 1;
        this.searchText = null;
    }

    get template(){
        return "adhara-list";
    }

    get allowedListTypes(){
        return [];
    }

    get defaultListType(){
        if(this.allowedListTypes.length){
            return this.allowedListTypes[0];
        }
        throw new Error("override `get listType`");
    }

    get listType(){
        if(this._listType){
            return this._listType;
        }
        return this.defaultListType;
    }

    get nextType(){
        if(this.allowedListTypes.length > 1) {
            let currentIndex = this.allowedListTypes.indexOf(this.listType);
            return this.allowedListTypes[currentIndex + 1] || this.allowedListTypes[0];
        }
        return null;
    }

    changeViewType(event, data){
        this._listType = data.viewtype;
        this.refresh();
        this.onViewTypeChanged(this.listType);
    }

    onViewTypeChanged(new_view_type){
        //Override as required
    }

    /**
     * @function
     * @getter
     * @returns {HandlebarTemplate} template of the list structure
     * */
    get listTemplate(){
        return AdharaListView.DEFAULT_TEMPLATES[this.listType].listTemplate;
    }

    /**
     * @function
     * @getter
     * @returns {HandlebarTemplate} template of the list header
     * */
    get headerTemplate(){
        return AdharaListView.DEFAULT_TEMPLATES[this.listType].headerTemplate;
    }

    /**
     * @method
     * @getter
     * @returns {HandlebarTemplate} template of a list item
     * */
    get itemTemplate(){
        return AdharaListView.DEFAULT_TEMPLATES[this.listType].itemTemplate;
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

    /**
     * example:
     * return Object
     * { attributes: {} }
     * */
    search(){

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
            this.searchText = event.target.value;
            this.onSearch(event.target.value);
        }
    }

    onSearch(text){
        console.error(`TODO Search is enabled for this list view.
         So, implement onSearch... search text: "${text}"`);
    }

    updateResults(){
        this.getParentContainerElement().querySelector(".list-contents").innerHTML
            = Adhara.app.renderTemplate(this.listTemplate, this);
    }

    format(container){
        if(this.searchText !== null) {
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

AdharaListView.VIEW_TYPES = {
    CARD_VIEW: "card",
    GRID_VIEW: "grid",
    TEMPLATE_VIEW: "template"
};

AdharaListView.DEFAULT_TEMPLATES = {
    [AdharaListView.VIEW_TYPES.CARD_VIEW]: {
        listTemplate: "adhara-card",
        itemTemplate: "adhara-card-content"
    },
    [AdharaListView.VIEW_TYPES.GRID_VIEW]: {
        listTemplate: "adhara-list-grid"
    },
    [AdharaListView.VIEW_TYPES.TEMPLATE_VIEW]: {
        listTemplate: "adhara-list-template",
        headerTemplate: "adhara-list-template-header",
        itemTemplate: "adhara-list-template-item"
    }
};