const baseModeScreenController = {
    is_open: false,
    base_mode_info_data: {
        "Collected points": "0 / 0",
        "Time since last RTCM send": "100",
        "NTRIP server state": "Idle",
        "Basestation manager state": "Idle",
    },
    base_mode_info_fetcher: -1,
    cancel_base_popup_is_open: false,

    open: function () {
        $("#base_mode_screen #header").text(translate["basemodeHeader"]);
        $("#base_mode_screen #stopbasemodebutton").text(translate["stopBaseModePopupButton"]);

        baseModeScreenController.is_open = true;

        baseModeScreenController.updateInfo(
            baseModeScreenController.base_mode_info_data,
            "local"
        );
        $("#base_mode_screen").removeClass("gone");
        baseModeScreenController.base_mode_info_fetcher = setInterval(
            baseModeScreenController.fetchBaseModeInfo,
            2000
        );
    },
    close: function () {
        baseModeScreenController.is_open = false;
        $("#base_mode_screen").addClass("gone");
        clearInterval(baseModeScreenController.base_mode_info_fetcher);
    },
    updateInfo: function (data, server) {
        baseModeScreenController.base_mode_info_data = data;
        /* 
            {"Collected points":"1 / 100",
            "Time since last RTCM send":"0.772951",
            "NTRIP server state":"Connected",
            "Basestation manager state":"BaseActive",
            "robot":614}
            */

        let html = "";

        if (data["Basestation manager state"] === "BaseActive") {
            if (data["NTRIP server state"] === "Connected" && parseFloat(data["Time since last RTCM send"]) < 4) {
                html = translate["basemodeEverytingWorksInfo"];
            } else if (data["NTRIP server state"] === "Connected") {
                html = translate["basemodeNotSendingDataWarning"];
            } else {
                html = translate["basemodeNotConnectedWarning"];
            }

        }
        else if (data["Basestation manager state"] === "CollectingPoints") {
            let p = data["Collected points"].split(" / ");
            let procent = parseInt(p[0]) * 100 / parseInt(p[1]);
            if (parseInt(p[1]) > 1) {
                html = translate["basemodeInitializingInfo"].format((parseInt(procent * 100) / 100) + "%");
            } else {
                html = translate["basemodeInitializingInfo"].format("");
            }
        } else {
            html = translate["basemodeStartingMessage"];
        }

        html += "<br>";
        html += translate["basemodeUsageInfo"].format("<br>");

        $("#base_mode_screen #base_mode_info_text").html(html);
    },
    fetchBaseModeInfo: function () {
        communication_controller.send(
            "get_basemode_info",
            { robot: robot_controller.chosen_robot_id },
            "all",
            10
        );
    },
    systemDiagChangedCallback: function () {
        if (robot_controller.state_top !== TopStates.BASE_MODE && baseModeScreenController.is_open) {
            console.log(
                "Base mode unexpectedly exited. new state: ",
                robot_controller.state_top
            );
            baseModeScreenController.cancel_base_popup_is_open = true;
            popup_screen_controller.confirm_popup(
                translate["stopBasemodePopupHeader"],
                null,
                translate["Ok"],
                null,
                function () {
                    baseModeScreenController.close();
                    popup_screen_controller.close();
                    baseModeScreenController.cancel_base_popup_is_open = false;
                },
                "red"
            );
        }

        if (robot_controller.state_top === TopStates.BASE_MODE && !baseModeScreenController.is_open) {
            baseModeScreenController.open();
        }
        if (robot_controller.state_top === TopStates.BASE_MODE && baseModeScreenController.cancel_base_popup_is_open) {
            popup_screen_controller.close();
            baseModeScreenController.cancel_base_popup_is_open = false;
        }
    },
    stopBaseMode: function () {
        popup_screen_controller.confirm_popup(
            translate["stopBasemodePopupHeader"],
            null,
            translate["Back"],
            translate["stopBaseModePopupButton"],
            function () {
                popup_screen_controller.close();
            },
            function () {
                robot_controller.manual_mode();
                baseModeScreenController.close();
                popup_screen_controller.close();
            },
            "dark",
            "red"
        );
    },
};

$(() => {
    event_controller.add_callback(
        "on_system_diag_change",
        baseModeScreenController.systemDiagChangedCallback
    );
    message_controller.events.add_callback(
        "basemode_info",
        baseModeScreenController.updateInfo
    );
});
