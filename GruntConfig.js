let pkg = require("./package.json");

//let version_dir = `${pkg.version}/`;
let index_dir = ``;
let styles_dir = `${index_dir}less/`;
let hbs_template_dir = `${index_dir}templates/`;
let dist_dir_base = `${index_dir}cdn/`;
// let dist_dir = `${dist_dir_base}${version_dir}`;
let dist_dir = `${dist_dir_base}`;
let js_dir = 'js/';
let templates_dir = 'templates/';
let css_dir = 'css/';

let dist_scripts_dir = `${dist_dir}${js_dir}`;
let dist_templates_dir = `${dist_dir}${templates_dir}`;
let minified_scripts_dir = dist_scripts_dir;
let minified_styles_dir = `${dist_dir}${css_dir}`;

let templates_output_file = "templates.js";
let concat_app_file = "adhara.combined.js";
let concat_app_file_es5 = "adhara.combined.es5.js";

let minified_scripts_file = "adhara.min.js";
let minified_scripts_file_es5 = "adhara.min.es5.js";
let minified_css_file = "adhara.min.css";

let adhara_min_templates = `${dist_templates_dir}${templates_output_file}`;
let adhara_min_js = `${minified_scripts_dir}${minified_scripts_file}`;
let adhara_min_js_es5 = `${minified_scripts_dir}${minified_scripts_file_es5}`;
let adhara_min_css = `${minified_styles_dir}${minified_css_file}`;

// let cdn_base = `https://adhara-js.firebaseapp.com/${dist_dir}`;
let cdn_base = `https://cdn.jsdelivr.net/npm/adhara@${pkg.version}/${dist_dir}`;
// let cdn_base = `http://localhost:4000/${dist_dir}`;
let cdn_min_templates = cdn_base + templates_dir + templates_output_file;
let cdn_min_js = cdn_base + js_dir + minified_scripts_file;
let cdn_min_js_es5 = cdn_base + js_dir + minified_scripts_file_es5;
let cdn_min_css = cdn_base + css_dir + minified_css_file;

module.exports = {
    app_scripts: [
        "js/TemplateEngineHelpers.js",
        "js/Misc.js",
        "js/Utils.js",
        "js/Ticker.js",
        "js/CoalesceTasker.js",
        "js/Router.js",
        // "js/RestAPI.js",
        "js/components/Toast.js",
        "js/py.js",
        // "js/templates.js",   //Commenting out assuming it is not required. TODO check here in case of any template issues
        //Data stores | Blobs
        "js/Blobs/Serializable.js",
        "js/Blobs/DataBlob.js",
        //Controller for controllable views
        // "js/DataInterface/Controller.js",
        "js/dataproviders/NetworkProvider.js",
        "js/dataproviders/DataInterface.js",
        //Context
        "js/Context.js",
        //Event Handler
        "js/EventHandler.js",
        //basic view
        "js/view/View.js",
        //component views
        "js/view/ListView.js",
        "js/view/MutableView.js",
        "js/view/FormView.js",
        "js/view/DetailView.js",
        //Dorm components
        "js/view/FormFields/FormField.js",
        "js/view/FormFields/InputField.js",
        "js/view/FormFields/TextArea.js",
        "js/view/FormFields/SelectField.js",
        "js/view/FormFields/RadioField.js",
        "js/view/FormFields/CheckboxField.js",
        "js/view/FormFields/SuggestionHintsMetaField.js",
        "js/view/FormFields/SuggestionMetaField.js",
        "js/view/FormFields/SuggestibleSelectField.js",
        "js/view/FormFields/FieldSetRepeater.js",
        //dependent component views
        "js/view/GridView.js",
        "js/view/TemplateView.js",
        "js/view/CardView.js",
        "js/view/DialogView.js",
        "js/view/TabView.js",
        "js/view/AppContainerView.js",
        //mixins
        "js/view/DialogFormView.js",
        //Client DB Storage
        "js/Storage/Storage.js",
        "js/Storage/StorageSelector.js",
        "js/Storage/DBStorage.js",
        "js/Storage/CacheStorage.js",
        //Data Interface & Processor
        // "js/DataInterface/DataInterface.js",
        // "js/DataInterface/Processors.js",
        // //Web Sockets
        // "js/DataInterface/WebSocket.js",
        //Adhara
        "js/App.js",
        "js/Adhara.js",
    ],
    app_styles: [
        //Adhara
        "less/adhara.css",
        "less/cards.css",
        "less/components.css",
    ],
    index_dir,
    styles_dir,
    hbs_template_dir,
    dist_dir_base,
    dist_scripts_dir,
    dist_templates_dir,
    templates_output_file,
    concat_app_file,
    concat_app_file_es5,
    adhara_min_templates,
    adhara_min_js,
    adhara_min_js_es5,
    adhara_min_css,
    cdn_min_templates,
    cdn_min_js,
    cdn_min_js_es5,
    cdn_min_css
};