/**
 * Created by ryshackleton on 9/21/16.
 */

notifications = {
    // simple notification to update user on geolocation status
    topCenter: function(notifyType, timeout, message ) {
        return $.notify({
            icon: "pe-7s-map-marker",
            message: message

        }, {
            type: notifyType,
            timer: timeout,
            placement: {
                from: 'top',
                align: 'center',
            },
            offset: 40
        });
    }
}

