
const sprayToolUtilitiesScreenController = {
    disableSprayButtonWithWarning(){
        $("#choose_utility_method_overlay #test_spray_button").addClass("disabled");
        $("#resume_later_bar #test_spray_button").addClass("disabled");
        $("#calibration_menu #test_spray_button").addClass("disabled");
    },

    enableTestSprayButton() {
        $("#choose_utility_method_overlay #test_spray_button").removeClass("disabled");
        $("#resume_later_bar #test_spray_button").removeClass("disabled");
        $("#calibration_menu #test_spray_button").removeClass("disabled");
    },

    disableCleaningButton() {
        $("#choose_utility_method_overlay #cleaning_button").prop("disabled", true);
    },

    enableCleaningButton() {
        $("#choose_utility_method_overlay #cleaning_button").prop("disabled", false);
    },

    disablePrimePumpButton() {
        $("#choose_utility_method_overlay #prime_pump_button").prop("disabled", true);
    },

    enablePrimePumpButton() {
        $("#choose_utility_method_overlay #prime_pump_button").prop("disabled", false);
    },


    disableMeasureButton() {
        $("#choose_utility_method_overlay #measure_button").prop("disabled", true);
    },

    enableMeasureButton() {
        $("#choose_utility_method_overlay #measure_button").prop("disabled", false);
    },


    drawPrimePumpButton() {
        if(sprayToolUtilitiesController.isPriming) {
            $("#choose_utility_method_overlay #prime_pump_button").attr("class", "chosen");
            $("#choose_utility_method_overlay #prime_pump_button").text(translate["stopPriming"]);
            $("#resume_later_bar #prime_pump_button").attr("class", "chosen");
            $("#resume_later_bar #prime_pump_button").text(translate["stopPriming"]);
            $("#calibration_menu #prime_pump_button").attr("class", "chosen");
        }
        else {
            $("#choose_utility_method_overlay #prime_pump_button").attr("class", "dark");
            $("#choose_utility_method_overlay #prime_pump_button").text(translate["primePump"]);
            $("#resume_later_bar #prime_pump_button").attr("class", "dark");
            $("#resume_later_bar #prime_pump_button").text(translate["primePump"]);
            $("#calibration_menu #prime_pump_button").attr("class", "dark");
        }
    },

    drawTestSprayButton() {
        if(sprayToolUtilitiesController.isTesting) {
            $("#choose_utility_method_overlay #test_spray_button").attr("class", "chosen");
            $("#choose_utility_method_overlay #test_spray_button").text(translate["Stop spray"]);
            $("#resume_later_bar #test_spray_button").attr("class", "chosen");
            $("#resume_later_bar #test_spray_button").text(translate["Stop spray"]);
            $("#calibration_menu #test_spray_button").attr("class", "chosen");
        }
        else {
            $("#choose_utility_method_overlay #test_spray_button").attr("class", "dark");
            $("#choose_utility_method_overlay #test_spray_button").text(translate["Test spray"]);
            $("#resume_later_bar #test_spray_button").attr("class", "dark");
            $("#resume_later_bar #test_spray_button").text(translate["Test spray"]);
            $("#calibration_menu #test_spray_button").attr("class", "dark");
        }
    },

    filterButtons() {
        const robotOnline = robot_controller.chosen_robot.online;
        const robotHasPump = robot_controller.robot_has_capability("platform_pump");
                
        if(!robotHasPump){
            $("#choose_utility_method_overlay #cleaning_button").addClass("gone");
            $("#choose_utility_method_overlay #prime_pump_button").addClass("gone");  
        }
        else{
            $("#choose_utility_method_overlay #cleaning_button").removeClass("gone");
            $("#choose_utility_method_overlay #prime_pump_button").removeClass("gone");
        }

        if (robotOnline) {
            $("#choose_utility_method_overlay #test_spray_button").removeClass("disabled");

            if (robotHasPump) {
                $("#choose_utility_method_overlay #test_spray_button").addClass("disabled");
              $("#choose_utility_method_overlay #cleaning_button").removeClass("disabled");
              $("#choose_utility_method_overlay #prime_pump_button").removeClass("disabled");
            }
        }
        else{
            sprayToolUtilitiesScreenController.disableSprayButtonWithWarning();
            if(robotHasPump) {
                $("#choose_utility_method_overlay #cleaning_button").addClass("disabled");
                $("#choose_utility_method_overlay #prime_pump_button").addClass("disabled");
            }
        }
        
    }
}

$(()=>{
    event_controller.add_callback( 'got_robot_capabilities', ()=>{
        sprayToolUtilitiesScreenController.filterButtons();
    } );

    if (robot_controller.robot_has_capability("platform_pump")) {
        sprayToolUtilitiesScreenController.disableSprayButtonWithWarning();
    }


    event_controller.add_callback( 'chosen_robot_online_changed', ()=>{
        sprayToolUtilitiesScreenController.filterButtons();
    } );
});