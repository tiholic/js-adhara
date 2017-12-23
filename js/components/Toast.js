let Toast = {};
(function(){
    let COLOR_PRIMARY = "color-primary",
        COLOR_DANGER = "color-primary";

    Toast.make = function(message, class_name){
        // TODO handle
        alert(`class_name: ${message}`);
    };

    Toast.error = function(message){
        Toast.make(message, false);
    };

    Toast.success = function(message){
        Toast.make(message, );
    };

})();