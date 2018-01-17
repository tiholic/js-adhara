class AdharaListView extends AdharaView{

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
    get isPaginationEnabled(){
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

    get data(){
        return [];
    }

}