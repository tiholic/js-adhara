let pkg = require("./package.json");

let version_dir = `${pkg.version}/`
let index_dir = ``;
let styles_dir = `${index_dir}less/`;
let hbs_template_dir = `${index_dir}templates/`;
let dist_dir_base = `${index_dir}cdn/`;
let dist_dir = `${dist_dir_base}${version_dir}`;

let js_dir = 'js/';
let templates_dir = 'templates/';
let css_dir = 'css/';

let dist_scripts_dir = `${dist_dir}${js_dir}`;
let dist_templates_dir = `${dist_dir}${templates_dir}`;
let minified_scripts_dir = dist_scripts_dir;
let minified_styles_dir = `${dist_dir}${css_dir}`;

let templates_output_file = "templates.js";
let concat_app_file = "adhara.combined.js";
let minified_scripts_file = "adhara.min.js";
let minified_css_file = "adhara.min.css";

let adhara_min_templates = `${dist_templates_dir}${templates_output_file}`;
let adhara_min_js = `${minified_scripts_dir}${minified_scripts_file}`;
let adhara_min_css = `${minified_styles_dir}${minified_css_file}`;

let cdn_base = `https://adhara-js.firebaseapp.com/${dist_dir}`;
let cdn_min_templates = cdn_base + templates_dir + templates_output_file;
let cdn_min_js = cdn_base + js_dir + minified_scripts_file;
let cdn_min_css = cdn_base + css_dir + minified_css_file;

module.exports = {
    app_scripts: [
        "js/Utils.js",
        // "js/py.js",
        //Adhara
        "js/App.js",
        "js/Adhara.js",
        "js/Router.js",
        "js/components/Toast.js",
        "js/RestAPI.js",
        // "js/templates.js",   //Commenting out assuming it is not required. TODO check here in case of any template issues
        //Data stores | Blobs
        "js/Blobs/Serializable.js",
        "js/Blobs/DataBlob.js",
        //Controller for controllable views
        "js/DataInterface/Controller.js",
        //basic view
        "js/view/View.js",
        //component views
        "js/view/ListView.js",
        "js/view/FormView.js",
        //dependent component views
        "js/view/GridView.js",
        "js/view/TemplateView.js",
        "js/view/CardView.js",
        "js/view/DialogView.js",
        "js/view/TabView.js",
        "js/view/ContainerView.js",
        //mixins
        "js/view/DialogFormView.js",
        //Client DB Storage
        "js/Storage/Storage.js",
        "js/Storage/StorageSelector.js",
        "js/Storage/DBStorage.js",
        "js/Storage/CacheStorage.js",
        //Data Interface & Processor
        "js/DataInterface/DataInterface.js",
        "js/DataInterface/Processors.js",
        //Web Sockets
        "js/DataInterface/WebSocket.js",
    ],
    app_styles: [
        //Adhara
        "less/adhara.css",
        "less/cards.css",
    ],
    index_dir,
    styles_dir,
    hbs_template_dir,
    dist_dir_base,
    dist_scripts_dir,
    dist_templates_dir,
    templates_output_file,
    concat_app_file,
    adhara_min_templates,
    adhara_min_js,
    adhara_min_css,
    cdn_min_templates,
    cdn_min_js,
    cdn_min_css
};