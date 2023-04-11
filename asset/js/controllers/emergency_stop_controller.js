

const emergencyStopController = {
    emergencyStopWhenAble: false,
    infoPopupIsOpen: false,

    performEmergencyStop() {
        const func = emergencyStopController.determineContext();
        
        if (func) {
            if (robot_controller.joystickControlLinkExists || robot_controller.emergencyStopLinkExists) {
                console.warn("Emergency stop!");
                func();
                this.emergencyStopWhenAble = false;
                if (emergencyStopController.infoPopupIsOpen) {
                    popup_screen_controller.close();
                    emergencyStopController.infoPopupIsOpen = false;
                }
            }
            else {
                console.warn("Queuing emergency stop!");
                emergencyStopController.showPopup();
                emergencyStopController.emergencyStopWhenAble = true;
            }
        }
        else {
            console.error("Emergency stop controller was unable to determine context!");
            bottom_bar_chooser.reload_bottom_bar();
            emergencyStopController.performEmergencyStop();
        }
    },
    
    performDelayedEmergencyStop() {
        if (emergencyStopController.emergencyStopWhenAble) {
            console.warn("Delayed emergency stop!");
            emergencyStopController.performEmergencyStop();
        }
    },

    determineContext() {
        const activeBar = bottom_bar_chooser.active_bar;
        
        if (activeBar === "#drive-to-automode-screen") {
            return drive_to_screen_controller.stop_screen;
        }
        return run_pitch_controller.stop;
    },

    showPopup() {
        emergencyStopController.infoPopupIsOpen = true;
        const options = {header: translate["Emergency stop"], 
                        body: translate["bodyEmergencyButtonPressed"],
                        ok_text: translate["OK"],
                        ok_callback: popup_screen_controller.close};
        popup_screen_controller.confirm_popup_with_options(options);
    }
}

$(()=>{
    event_controller.add_callback("emergency_stop", emergencyStopController.performEmergencyStop);
    event_controller.add_callback("chosen_robot_online_changed", emergencyStopController.performDelayedEmergencyStop)
});