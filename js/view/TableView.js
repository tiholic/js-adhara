/**
 * Created by varun on 19/12/17.
 * TODO : 1. need to take in different table configurations, 2. need a preprocessor for data before drawing table
 */

class AdharaTableView extends AdharaListView{

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
     * @typedef {Object} TableConfig
     * @property {String} title - Table title
     * @property {Boolean} add_new - add new button on the table
     * @property {Boolean} nav - Add navigation component or not
     * @property {Array<ColumnConfig>} columns - list of column configuration
     * */

    /**
     * @function
     * @instance
     * @returns {TableConfig}
     * */
    get config(){
        return {
            title : 'Adhara Table',
            add_new : false,
            nav : false,
            columns: []
        }
    }

    get structureTemplate(){
        return 'adhara-table'
    }

}