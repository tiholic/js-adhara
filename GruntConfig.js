module.exports = {
    app_scripts: [
        "js/Utils.js",
        "js/py.js",
        //Generic configurations
        "js/Generics.js",
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
        "js/view/ContainerView.js",
        //Client DB Storage
        "js/Storage/ClientStorage.js",
        //Data Interface & Processor
        "js/DataInterface/DataInterface.js",
        "js/DataInterface/Processors.js",
        //Web Sockets
        "js/DataInterface/WebSocket.js",
    ],
    app_styles: [
        //Adhara
        "less/cards.css",
    ]
};