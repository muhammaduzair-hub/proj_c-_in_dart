

const joystickScreenController = {
    hideLock: new CountedIdSemophor(),

    hide(caller=null) {
        if (!caller) {
            return false;
        }
        else {
            joystickScreenController.hideLock.lock(caller);
            joystickScreenController._superHide();
        }
    },

    unhide(caller) {
        if (!caller) {
            return false;
        }
        else {
            joystickScreenController.hideLock.unlock(caller);
            if (joystickScreenController.hideLock.unlocked) {
                joystickScreenController._superUnhide();
            }
        }
    },

    update() {
        if (robot_controller.user_state === TopStates.AUTOMATIC) {
            joystickScreenController._hideJoystick();
            joystickScreenController._showStopButton();
        }
        else {
            joystickScreenController._showJoystick();
            joystickScreenController._hideStopButton();
        }
    },

    _superHide() {
        $(".joystick").addClass("supergone");
    },

    _superUnhide() {
        $(".joystick").removeClass("supergone");
    },

    _showJoystick() {
        if (robot_controller.joystickControlLinkExists) {
            $( ".joystick" ).removeClass( "gone" );
        }
        else {
            $( ".joystick" ).addClass( "gone" );
        }
    },

    _hideJoystick() {
        $( ".joystick" ).addClass( "gone" );
    },

    _showStopButton() {
        joystickScreenController._setStopButtonColor();
        $( ".emergencystop" ).removeClass( "gone" );
    },

    _hideStopButton() {
        $( ".emergencystop" ).addClass( "gone" );
    },

    _setStopButtonColor() {
        if (   (robot_controller.joystickControlLinkExists || robot_controller.emergencyStopLinkExists) 
            && !emergencyStopController.emergencyStopWhenAble) {
            // DEFAULT COLORS
            $(".emergencystop").css({'background-color': '#FF4D4D',
                                    'border-color': '#FFFFFF'});
            $(".emergencystop p").css({'color': '#FFFFFF'});                     
        }
        else {
            // GREYED OUT
            $(".emergencystop").css({'background-color': '#262626',
                                    'border-color': '#545454'});
            $(".emergencystop p").css({'color': '#545454'});
        }
    }
}

$(()=>{
    event_controller.add_callback("app_server_connection_established", joystickScreenController.update);
    event_controller.add_callback("app_server_connection_lost", joystickScreenController.update);
    event_controller.add_callback("tablet_offline", joystickScreenController.update);
    event_controller.add_callback("robot_now_online", joystickScreenController.update);
    event_controller.add_callback("robot_now_offline", joystickScreenController.update);
});