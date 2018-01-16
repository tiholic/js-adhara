let Toast = {};
(function(){
    let COLOR_PRIMARY = "color-primary",
        COLOR_DANGER = "color-primary";


    let notifyQueue = 0;

    function notify(title, content, type){
        let id = "notification_"+new Date().getTime();
        let $notificationDiv = jQuery('<div class="notification '+type+'" id="'+id+'"/>');
        let $title = jQuery('<strong style="display:block" />').text(title);
        let $content = jQuery('<p />').html(content);
        $notificationDiv.append($title).append($content);
        jQuery('body').append($notificationDiv);

        let existing_notifications = jQuery('.notification');
        if(existing_notifications.length > 0){
            jQuery.each(existing_notifications, function(index, value){
                if(jQuery(this).attr('id') !== id){
                    let new_top = parseFloat(jQuery(this).css('top'))+$notificationDiv.height()+40;
                    jQuery(this).animate({top: new_top+"px"}, 'fast');
                }
            });
        }

        jQuery('#'+id).animate({right:'0px'}, 'fast', function(){notifyQueue--;});
        setTimeout(function(){
            jQuery('#'+id).animate({opacity: '0.5'}, 'fast', function(){
                jQuery('#'+id).hide('slide', {direction: 'right'}, 'slow', function(){
                    setTimeout(function() {
                        jQuery('#'+id).remove()
                    }, 1000);
                });
            });
        }, 5000);
    }

    Toast.make = function(title, content, type){    //type should be "success", "error" or "info"
        let maxNotificationsHeight = window.innerHeight-200;
        let currentNotificationsHeight = 0;
        jQuery.each(jQuery('.notification'), function(){
            currentNotificationsHeight+=jQuery(this).height()+40;
        });
        let proceed = (currentNotificationsHeight<maxNotificationsHeight);
        let notifyTimeout = (notifyQueue === 0)?0:2000;
        if(!content && type==="failure"){
            content = "Error occurred...";
        }
        setTimeout(function(){
            if(notifyQueue === 0 && proceed){
                notifyQueue++;
                notify(title, content, type);
            }else{
                Toast.make(title, content, type);
            }
        }, notifyTimeout);
    };

    Toast.error = function(message){
        Toast.make(message, "error");
    };

    Toast.success = function(message){
        Toast.make(message, "success");
    };

})();