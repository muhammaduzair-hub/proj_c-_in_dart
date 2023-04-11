

const tmrBaseStationHandlerScreen = {
    _is_open: false,
    _device: null,
    _connection: null,
    _last_status: {},
    _status_fetcher: null,
    _disconnect_checker: null,
    _stopped: false,
    _waiting_for_operator_scan: false,
    _last_base_apn: "",

    open: function (base_id) {
        tmrBaseStationHandlerScreen._device = baseStationScreenController._owned_base_stations[base_id];

        tmrBaseStationHandlerScreen.translateHeaders();

        $("#tmr_base_station_handler_screen #wait_screen").removeClass("gone");
        $("#tmr_base_station_handler_screen #content").addClass("gone");

        $("#tmr_base_station_handler_screen #header").text("Basestation " + base_id);
        $("#tmr_base_station_handler_screen").removeClass("gone");
        tmrBaseStationHandlerScreen._is_open = true;

        tmrBaseStationHandlerScreen._connection = new TmrBaseStation(tmrBaseStationHandlerScreen._device.mac);
        tmrBaseStationHandlerScreen._stopped = false;
        tmrBaseStationHandlerScreen._connection.start(function () {
            if (!tmrBaseStationHandlerScreen._stopped)
                tmrBaseStationHandlerScreen.startStatusFetcher();
            tmrBaseStationHandlerScreen.startDisconnectedChecker();
        });

    },
    startStatusFetcher: function () {
        tmrBaseStationHandlerScreen._connection.getStatus(tmrBaseStationHandlerScreen.gotStatus);
        tmrBaseStationHandlerScreen._status_fetcher = setInterval(() => {
            tmrBaseStationHandlerScreen._connection.getStatus(tmrBaseStationHandlerScreen.gotStatus);
        }, 5000);
    },
    stopStatusFetcher: function () {
        clearInterval(tmrBaseStationHandlerScreen._status_fetcher);
    },
    _checkDisconnected: function () {
        if (!tmrBaseStationHandlerScreen._connection.connected)
            tmrBaseStationHandlerScreen.updateSceren();
    },
    startDisconnectedChecker: function () {
        tmrBaseStationHandlerScreen._disconnect_checker = setInterval(tmrBaseStationHandlerScreen._checkDisconnected, 1000);
    },
    stopDisconnectedChecker: function () {
        clearInterval(tmrBaseStationHandlerScreen._disconnect_checker);
    },
    close: function () {
        $("#tmr_base_station_handler_screen").addClass("gone");
        tmrBaseStationHandlerScreen.stopStatusFetcher();
        tmrBaseStationHandlerScreen.stopDisconnectedChecker();
        tmrBaseStationHandlerScreen._is_open = false;
        tmrBaseStationHandlerScreen._connection.delete();
        tmrBaseStationHandlerScreen._connection = null;
        tmrBaseStationHandlerScreen._stopped = true;
    },

    gotStatus: function (status) {
        tmrBaseStationHandlerScreen._last_status = status;
        tmrBaseStationHandlerScreen.updateSceren();
        tmrBaseStationHandlerScreen.checkForOperatorScanFinished();
    },

    getOperators() {
        tmrBaseStationHandlerScreen._waiting_for_operator_scan = true;
        popup_screen_controller.open_info_waiter("Scanning for operators", "This can take up to 5 minutes", "", true);

        let not_has_result = tmrBaseStationHandlerScreen._last_status["Available operators"] === "N/A";
        let is_scanning = tmrBaseStationHandlerScreen._last_status["Scanning for operators"];
        if (not_has_result && !is_scanning) {
            tmrBaseStationHandlerScreen._connection.getOperators(function (started) { });
        }
        if (!not_has_result) {
            tmrBaseStationHandlerScreen.checkForOperatorScanFinished();
        }
    },
    checkForOperatorScanFinished() {

        if (tmrBaseStationHandlerScreen._waiting_for_operator_scan) {
            popup_screen_controller.open_info_waiter("Scanning for operators", "This can take up to 5 minutes", "", true);
        }

        let done_waiting = tmrBaseStationHandlerScreen._waiting_for_operator_scan && !tmrBaseStationHandlerScreen._last_status["Scanning for operators"];
        let old_data_available = tmrBaseStationHandlerScreen._last_status["Available operators"].replace("N/A", "").length > 0;

        if (tmrBaseStationHandlerScreen._waiting_for_operator_scan && (done_waiting || old_data_available)) {
            if (done_waiting)
                tmrBaseStationHandlerScreen._waiting_for_operator_scan = false;
            popup_screen_controller.close();

            let operators = tmrBaseStationHandlerScreen._last_status["Available operators"].replace("N/A", "").split(",").map(o => { return o.replace(/\"/g, ""); });

            let buttons = [];
            operators.forEach(function (o) {
                buttons.push(new PopButton(o, () => {
                    pop_generator.close();
                    tmrBaseStationHandlerScreen._waiting_for_operator_scan = false;
                    popup_screen_controller.open_info_waiter("Setting operator to " + o, "", "", true);
                    tmrBaseStationHandlerScreen._connection.setOperator(o, () => {
                        popup_screen_controller.close();
                    });
                }));
            });

            buttons.push(new PopButton("Automatic", () => {
                pop_generator.close();
                tmrBaseStationHandlerScreen._waiting_for_operator_scan = false;
                popup_screen_controller.open_info_waiter("Setting operator to automatic", "", "", true);
                tmrBaseStationHandlerScreen._connection.setAutomaticOperator(() => {
                    popup_screen_controller.close();
                });
            }));

            let body = new PopBody(buttons);
            popup_screen_controller.close();

            // header_text, body_text, buttons, outside_click_callback, popup_id = "generated_popup", extra_before_buttons_html, extra_after_buttons_html, show_x = true, spinner = false
            pop_generator.create_popup("Operators available", body, [], pop_generator.close, "chose_base_operator_popup", "", "<br/>");


        }
    },
    getWifis() {
        console.log("starting wifi scan");

        // header_text, info_text1, info_text2, spinner = false
        popup_screen_controller.open_info_waiter("Searcing for wifi", "", "", true);

        tmrBaseStationHandlerScreen._connection.getWifis(function (WiFis) {
            let buttons = [];
            WiFis.ssids.forEach(function (ssid) {
                buttons.push(new PopButton(ssid, () => {
                    pop_generator.close();
                    tmrBaseStationHandlerScreen.connectToWifi(ssid);
                }));
            });
            let body = new PopBody(buttons);
            popup_screen_controller.close();

            // header_text, body_text, buttons, outside_click_callback, popup_id = "generated_popup", extra_before_buttons_html, extra_after_buttons_html, show_x = true, spinner = false
            pop_generator.create_popup("WiFi's available", body, [], pop_generator.close, "chose_base_wifi_popup", "", "<br/>");
        });
    },
    connectToWifi(ssid) {
        let pwd = "";
        let input = new PopInput("Password", "password", (event) => {
            pwd = event.target.value;
        });
        let body = new PopBody([input]);

        let buttons = [];
        buttons.push(new PopButton("Connect", () => {
            pop_generator.close();
            popup_screen_controller.open_info_waiter("Setting WiFi");
            tmrBaseStationHandlerScreen._connection.setWifi(ssid, pwd, () => {
                popup_screen_controller.close();
            });
        }));
        buttons.push(new PopButton("Cancel", () => {
            pop_generator.close();
        }));

        pop_generator.create_popup("Connect to " + ssid, body, buttons, pop_generator.close, "connect_base_wifi_popup");

    },

    setApn() {
        let new_apn = $("#tmr_base_station_handler_screen #content #base_stations_sim_apn_row #base_stations_modem_apn_input").val();
        if (new_apn) {
            popup_screen_controller.open_info_waiter("Setting new APN");
            tmrBaseStationHandlerScreen._connection.setApn(new_apn, () => {
                popup_screen_controller.close();
            });
        }
    },
    setWifi() {
        tmrBaseStationHandlerScreen._connection.setWifi(ssid, password);
    },
    setAutomaticOperator() {
        tmrBaseStationHandlerScreen._connection.setAutomaticOperator()
    },

    translateHeaders: function () {

        $("#tmr_base_station_handler_screen #wait_screen").html("Connecting to base " + tmrBaseStationHandlerScreen._device.id);

        $("#tmr_base_station_handler_screen #content #base_station_software_version_header").text("Software version");
        $("#tmr_base_station_handler_screen #content #base_station_status_header").text("Base Station status");
        $("#tmr_base_station_handler_screen #content #base_station_modem_section_header").text("Modem");
        $("#tmr_base_station_handler_screen #content #base_station_modem_status_header").text("Status");
        $("#tmr_base_station_handler_screen #content #base_station_modem_technology_header").text("Technology");
        $("#tmr_base_station_handler_screen #content #base_station_modem_signal_header").text("Signal");
        $("#tmr_base_station_handler_screen #content #base_station_modem_icc_header").text("ICC");
        $("#tmr_base_station_handler_screen #content #base_station_modem_imei_header").text("IMEI");
        $("#tmr_base_station_handler_screen #content #base_station_modem_carrier_header").text("Operator");
        $("#tmr_base_station_handler_screen #content #base_station_apn_header").text("APN");
        $("#tmr_base_station_handler_screen #content #base_station_internet_section_header").text("Internet");
        $("#tmr_base_station_handler_screen #content #base_station_internet_modem_header").text("Modem");
        $("#tmr_base_station_handler_screen #content #base_station_wifi_header").text("WiFi");
        $("#tmr_base_station_handler_screen #content #base_station_select_wifi_header").text("Select WiFi");
        $("#tmr_base_station_handler_screen #content #base_stations_save_apn_btn").text("Save APN");
        $("#tmr_base_station_handler_screen #content #base_station_scan_wifi_btn").text("Scan WiFi");

    },

    updateSceren: function () {

        if (!tmrBaseStationHandlerScreen._connection.connected) {
            $("#tmr_base_station_handler_screen #wait_screen").removeClass("gone");
            $("#tmr_base_station_handler_screen #content").addClass("gone");
            return;
        }

        let has_result = tmrBaseStationHandlerScreen._last_status["Available operators"] !== "N/A";
        if (has_result) {
            $("#tmr_base_station_handler_screen #content #base_station_change_operator_btn").text("Select Operator");
        } else {
            $("#tmr_base_station_handler_screen #content #base_station_change_operator_btn").text("Search for Operators");
        }

        $("#tmr_base_station_handler_screen #wait_screen").addClass("gone");
        $("#tmr_base_station_handler_screen #content").removeClass("gone");

        $("#tmr_base_station_handler_screen #content #base_station_software_version_value").text(tmrBaseStationHandlerScreen._last_status["Software version"]);
        $("#tmr_base_station_handler_screen #content #base_station_status_value").text(tmrBaseStationHandlerScreen._last_status["Basestation manager state"]);
        $("#tmr_base_station_handler_screen #content #base_station_modem_status_value").text(tmrBaseStationHandlerScreen._last_status["Status"]);
        if (tmrBaseStationHandlerScreen._last_status["WIFI status"] === "Activated")
            $("#tmr_base_station_handler_screen #content #base_station_modem_technology_label").text(tmrBaseStationHandlerScreen._last_status["Technology"]);
        else
            $("#tmr_base_station_handler_screen #content #base_station_modem_technology_label").text(tmrBaseStationHandlerScreen._last_status["Aux"]);

        switch (tmrBaseStationHandlerScreen._last_status["Strength"]) {
            case "1":
                $("#tmr_base_station_handler_screen #content #base_station_modem_signal_value").text("Marginal");
                break;
            case "2":
                $("#tmr_base_station_handler_screen #content #base_station_modem_signal_value").text("OK");
                break;
            case "3":
                $("#tmr_base_station_handler_screen #content #base_station_modem_signal_value").text("Good");
                break;
            case "4":
                $("#tmr_base_station_handler_screen #content #base_station_modem_signal_value").text("Excellent");
                break;
            default:
                $("#tmr_base_station_handler_screen #content #base_station_modem_signal_value").text("Invalid");
                break;
        }
        $("#tmr_base_station_handler_screen #content #base_station_modem_icc_value").text(tmrBaseStationHandlerScreen._last_status["Sim A ICC"]);
        $("#tmr_base_station_handler_screen #content #base_station_modem_imei_value").text(tmrBaseStationHandlerScreen._last_status["Modem IMEI"]);
        $("#tmr_base_station_handler_screen #content #base_station_modem_carrier_value").text(tmrBaseStationHandlerScreen._last_status["Active operator"]);
        {
            let html = "";
            if (tmrBaseStationHandlerScreen._last_status["Internet route"] === "Mobile" || tmrBaseStationHandlerScreen._last_status["Internet route"] === "Cell")
                html += '<b>'
            html += tmrBaseStationHandlerScreen._last_status["Status"];
            if (tmrBaseStationHandlerScreen._last_status["Internet route"] === "Mobile" || tmrBaseStationHandlerScreen._last_status["Internet route"] === "Cell")
                html += '</b>'
            $("#tmr_base_station_handler_screen #content #base_station_internet_modem_status_value").html(html);
        }
        {
            let html = "";
            if (tmrBaseStationHandlerScreen._last_status["Internet route"] === "WIFI")
                html += '<b>'
            if (tmrBaseStationHandlerScreen._last_status["WIFI status"] === "Activated")
                html += "Connected to " + tmrBaseStationHandlerScreen._last_status["WIFI SSID"]
            else
                html += tmrBaseStationHandlerScreen._last_status["WIFI status"];
            if (tmrBaseStationHandlerScreen._last_status["Internet route"] === "WIFI")
                html += '</b>'
            $("#tmr_base_station_handler_screen #content #base_station_wifi_status_value").html(html);
        }

        tmrBaseStationHandlerScreen._last_status["APN"] = wifi_screen.clean_apn(tmrBaseStationHandlerScreen._last_status["APN"]);
        if (tmrBaseStationHandlerScreen._last_base_apn !== tmrBaseStationHandlerScreen._last_status["APN"]) {
            $("#tmr_base_station_handler_screen #content #base_stations_modem_apn_input").val(tmrBaseStationHandlerScreen._last_status["APN"])
            tmrBaseStationHandlerScreen._last_base_apn = tmrBaseStationHandlerScreen._last_status["APN"];
        }

        return;

    }
}


const RecieveState = {
    NotDoneYet: 0,
    Error: 1,
    Success: 2
}
class TmrBaseStation extends BluetoothConnection {

    constructor(mac) {
        super(mac);

        this._recieving_state = 0;
        this._recieve_length = 0;
        this._rcv_topic = "";
        this._rcv_data = "";
        this._rcv_length = "";
        this._data_buffer = "";

        //this._status_callbacks = [];
        //this._operator_callbacks = [];
        //this._wifi_callbacks = [];
        this.connected_callbaks = [];

        this._callbacks = {};

    }

    _addCallback(topic, callback) {
        if (callback) {
            if (!this._callbacks[topic])
                this._callbacks[topic] = [];
            this._callbacks[topic].push(callback);
        }
    }

    start(callback) {
        super.start();
        if (callback)
            this.connected_callbaks.push(callback);
    }

    handle_connected(sockId) {
        super.handle_connected(sockId);
        this.connected_callbaks.forEach((c) => { c(); });
        this.connected_callbaks = [];
    }

    getStatus(callback) {
        this.send("#STATUS***");
        this._addCallback("STATUS", callback);
    }
    getOperators(callback) {
        console.log("getting Operators");
        this.send("#GNET***");
        this._addCallback("GNET", callback);
    }
    getWifis(callback) {
        console.log("getting WiFis");
        this.send("#GWIFI***");
        this._addCallback("GWIFI", callback);
    }

    setApn(apn, callback) {
        this.send("#SAPN," + apn + "***");
        this._addCallback("SAPN", callback);
    }
    setOperator(operator, callback) {
        this.send("#SNET," + operator + "***");
        this._addCallback("SNET", callback);
    }
    setWifi(ssid, password, callback) {
        this.send("#SWIFI," + ssid + "," + password + "***");
        this._addCallback("SWIFI", callback);
    }

    setAutomaticOperator(callback) {
        this.send("#RNET***");
        this._addCallback("RNET", callback);
    }

    handle_msg(data) {
        //console.log("tmr base input", data);
        super.handle_msg(data);
        baseStationConsole.newInput(data);

        for (let i = 0; i < data.length; i++) {
            if (this._handle_char(data[i]) === RecieveState.Error) {
                let save_data = this._data_buffer;
                this._data_buffer = "";
                this.handle_msg(save_data);
            }
        }
    }

    _handle_char(c) {
        // msg = "#" + topic + "," + str(len(sd)) + "," + sd + "\r\n"

        if (this._recieving_state === 0) {
            if (c === "#") {
                this._recieving_state = 1;
                this._data_buffer = "";
                this._rcv_topic = "";
                this._rcv_data = "";
                this._rcv_length = "";
                return RecieveState.NotDoneYet;
            }
        }
        if (this._recieving_state === 1) {
            this._data_buffer += c;
            if (c === ",") {
                this._recieving_state = 2;
                return RecieveState.NotDoneYet;
            } else {
                this._rcv_topic += c;
            }
        }
        if (this._recieving_state === 2) {
            this._data_buffer += c;
            if (c === ",") {
                this._recieving_state = 3;
                let l = parseInt(this._rcv_length);
                if (!l) {
                    this._recieving_state = 0;
                    return RecieveState.Error;
                }
                this._recieve_length = this._data_buffer.length + l;
                return RecieveState.NotDoneYet;
            } else {
                this._rcv_length += c;
            }
        }
        if (this._recieving_state === 3) {
            this._data_buffer += c;
            if (this._data_buffer.length >= this._recieve_length) {
                this._rcv_data += c;
                let json_data = this._rcv_data;//.substring(0, this._rcv_data.length - 1);
                let json = null;
                try {
                    json = JSON.parse(json_data);
                    this._handle_complete_msg(this._rcv_topic, json);
                } catch (error) {
                    this._recieving_state = 0;
                    return RecieveState.Error;
                }
                this._recieving_state = 0;
                return RecieveState.Success;
            } else {
                this._rcv_data += c;
            }
        }
    }

    _handle_complete_msg(topic, json) {
        //console.log("complete msg", topic, json);
        if (this._callbacks[topic]) {
            this._callbacks[topic].forEach((c) => {
                try {
                    c(json);
                } catch (error) {
                    console.error("Error calling callback for ", topic, c, error);
                }
            });
            delete this._callbacks[topic];
        }
        /* switch (topic) {
            case "STATUS":
                this._status_callbacks.forEach((c) => { c(json); });
                this._status_callbacks = [];
                break;
            case "GNET":
                this._operator_callbacks.forEach((c) => { c(json); });
                this._operator_callbacks = [];
                break;
            case "GWIFI":
                this._wifi_callbacks.forEach((c) => { c(json); });
                this._wifi_callbacks = [];
                break;

            default:
                break;
        } */
    }

}
