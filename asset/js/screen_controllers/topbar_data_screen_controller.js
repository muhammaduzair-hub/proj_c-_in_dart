/** The topbar_data_screen_controller holds the JavaScript functionality for the new topbar starting in RS8 */

const topbar_data_screen_controller = {
    topbar_info: {},
    add_icons_on_load: function()
    {
        $("#settings_icon_space").html(topbar_data_icon_object.settings_icon);
        $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi_empty_icon);
        $("#gnss_ts_icon").html(topbar_data_icon_object.gnss_signal_icon);
        $("#battery_power_icon").html(topbar_data_icon_object.battery_undefined_icon);

        $("#user_location").html(topbar_data_icon_object.user_location_icon);
        $("#zoom_out_all").html(topbar_data_icon_object.zoom_out_icon);
    },
    got_topbar_data: function( data = {} ) 
    {
        topbar_data_screen_controller.topbar_info = data;
        logger.debug("PRINT: " , data);
        
        topbar_data_screen_controller.display_battery_data(data["Battery Percent"]);
        topbar_data_screen_controller.display_gnss_ts_data(data["Description"], data["Technology"], data["Operational"], 
        data["Message Type"], data["Frequency"], data["Satellites"]);
        topbar_data_screen_controller.display_internet_data(data["Internet Type"], data["Carrier"], data["Status"], data["Strength"]);
        topbar_data_screen_controller.display_connection_data();
    },
    robotOnlineStateChanged() {
        if(!robot_controller.chosen_robot.online) {
            topbar_data_screen_controller.got_topbar_data();
        }
        topbar_data_screen_controller.display_robot_icon();
        topbar_data_screen_controller.display_connection_data();
    },
    setTopBarToUnknown() {

    },
    display_battery_data: function(battery_data)
    {
        level = isNaN(parseInt(battery_data)) ? -1 : parseInt(battery_data);
        logger.debug("PRINT BATTERY: " + battery_data);

        const change_battery = function(icon)
        {
            const color = level <= 30 ? 'red' : (level <= 60 ? 'goldenrod' : 'green');
            $("#battery_power_icon").html(icon);
            $("#battery_charge_text").css('color', color);
            $("#battery_charge_text").text(level >= 0 ? `${level}%` : translate["Unknown"]);
        }
        
        if(battery_data <= 100 && battery_data >= 91)
        {
            change_battery(topbar_data_icon_object.battery_full_icon);
        }
        else if(battery_data <= 90 && battery_data >= 81)
        {
            change_battery(topbar_data_icon_object.battery_90_icon);
        }
        else if(battery_data <= 80 && battery_data >= 71)
        {
            change_battery(topbar_data_icon_object.battery_80_icon);
        }
        else if(battery_data <= 70 && battery_data >= 61)
        {
            change_battery(topbar_data_icon_object.battery_70_icon);
        }
        else if(battery_data <= 60 && battery_data >= 51)
        {
            change_battery(topbar_data_icon_object.battery_60_icon);
        }
        else if(battery_data <= 50 && battery_data >= 41)
        {
            change_battery(topbar_data_icon_object.battery_50_icon);
        }
        else if(battery_data <= 40 && battery_data >= 31)
        {
            change_battery(topbar_data_icon_object.battery_40_icon);
        }
        else if(battery_data <= 30 && battery_data >= 21)
        {
            change_battery(topbar_data_icon_object.battery_30_icon);
        }
        else if(battery_data <= 20 && battery_data >= 11)
        {
            change_battery(topbar_data_icon_object.battery_20_icon);
        }
        else if(battery_data <= 10 && battery_data >= 1)
        {
            change_battery(topbar_data_icon_object.battery_10_icon);
        }
        else if(battery_data == 0)
        {
            change_battery(topbar_data_icon_object.battery_empty_icon);
        }
        else
        {
            change_battery(topbar_data_icon_object.battery_undefined_icon);
        }

    },
    display_gnss_ts_data: function(position_desc, position_tech, position_op, position_msg_type, position_freq, position_num = -1) 
    {
        position_desc = !!position_desc && position_desc !== "0" ? position_desc : "Unknown";
        position_freq = parseInt(position_freq);
        position_num = parseInt(position_num);

        logger.debug("PRINT POSITION: ", position_desc, position_tech, position_op, position_msg_type, position_freq);
        if(position_tech === "GNSS")
        {
            $("#topbar_gnss_header").text(translate["Robot GPS"])
            $("#gnss_ts_icon").html(topbar_data_icon_object.gnss_signal_icon); 
        }
        else if(position_tech === "TS")
        {
            $("#topbar_gnss_header").text(translate["Total station"])
            //change this to a total station svg icon when available
            $("#gnss_ts_icon").html(topbar_data_icon_object.ts_signal_icon); 
        }

        if(position_op == true) 
        {
            $("#gnss_ts_text").css('color', 'green');
            $("#gnss_ts_text").text(`${translate[position_desc]} ${position_freq}Hz`);
        }
        else
        {
            //show gnss or ts icon with a slash through it
            $("#gnss_ts_text").css('color', 'red');
            if( position_desc !== position_msg_type)
            {
                $("#gnss_ts_text").text(translate[position_desc.replace(position_msg_type,"%1s")].format(position_msg_type));
            }
            else
            {
                $("#gnss_ts_text").text(translate[position_desc]);
            }
        }

        $("#gnss_ts_icon_text").text(parseInt(position_num) > -1 ? parseInt(position_num) : "");

        topbar_data_screen_controller.display_robot_icon();

    },
    display_internet_data: function(internet_type, internet_carrier, internet_status, internet_strength)
    {
        logger.debug("PRINT INTERNET: ", internet_type, internet_carrier, internet_status, internet_strength);

        internet_strength = parseInt(internet_strength);

        if(internet_status !== "Connecting")
        {
            topbar_data_screen_controller.animate_icon_stop("#cell_wifi_icon");
        }

        if(internet_type === "WIFI")
        {
            if(internet_carrier != "ERROR")
            {
                if(internet_status == "Connected")
                {    
                    switch(internet_strength)
                    {
                        case 0:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi_empty_icon);
                            $("#robot_internet_text").css('color', 'red');
                            $("#robot_internet_text").text(translate["WIFI connected, no internet"]);
                            break;
                        case 1:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi1_icon);
                            $("#robot_internet_text").css('color', 'goldenrod');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 2:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi2_icon);
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 3:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi3_icon);
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 4:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi4_icon);
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        default:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi0_warn_icon);
                            $("#robot_internet_text").css('color', 'red');
                            $("#robot_internet_text").text(translate["WIFI connected, no internet"]);
                            break;
                    }
                }
                else if(internet_status == "Connecting")
                {
                    topbar_data_screen_controller.animate_icon_start("#cell_wifi_icon", [
                        topbar_data_icon_object.signal_wifi_empty_icon,
                        topbar_data_icon_object.signal_wifi1_icon,
                        topbar_data_icon_object.signal_wifi2_icon,
                        topbar_data_icon_object.signal_wifi3_icon,
                        topbar_data_icon_object.signal_wifi4_icon
                    ]);

                    $("#robot_internet_text").css('color', 'goldenrod');
                    $("#robot_internet_text").text(translate["Connecting"]);
                }
                else
                {
                    $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi0_warn_icon);
                    $("#robot_internet_text").css('color', 'red');
                    $("#robot_internet_text").text(internet_carrier + " (" + translate["No data"] + ")");
                }
            }
            else
            {
                $("#cell_wifi_icon").html(topbar_data_icon_object.signal_wifi0_warn_icon);
                $("#robot_internet_text").css('color', 'red');
                $("#robot_internet_text").text(translate["No connection"]); //Connected, no SSID
            }
        }
        else if(internet_type === "Cell")
        {
            if(internet_carrier != "ERROR")
            {
                if(internet_status == "Connected") //change this to a switch?
                {
                    switch(internet_strength)
                    {
                        case 0:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
                            $("#robot_internet_text").css('color', 'red');
                            $("#robot_internet_text").text(internet_carrier + translate["no internet"]);
                            break;
                        case 1:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell1_icon);
                            $("#robot_internet_text").css('color', 'goldenrod');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 2:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell2_icon);
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 3:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell2_icon);
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        case 4:
                            //A cell signal icon with 4 bars doesn't appear to officially exist at the moment.
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell3_icon); 
                            $("#robot_internet_text").css('color', 'green');
                            $("#robot_internet_text").text(internet_carrier);
                            break;
                        default:
                            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
                            $("#robot_internet_text").css('color', 'red');
                            $("#robot_internet_text").text(internet_carrier + " (" + translate["no internet"] + ")");
                            break;
                    }
                }
                else if(internet_status == "Connecting")
                {
                    topbar_data_screen_controller.animate_icon_start("#cell_wifi_icon", [
                        topbar_data_icon_object.signal_cell0_icon,
                        topbar_data_icon_object.signal_cell1_icon,
                        topbar_data_icon_object.signal_cell2_icon,
                        topbar_data_icon_object.signal_cell3_icon,
                    ]);

                    $("#robot_internet_text").css('color', 'goldenrod');
                    $("#robot_internet_text").text(translate["Connecting"]);
                }
                else
                {
                    $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
                    $("#robot_internet_text").css('color', 'red');
                    $("#robot_internet_text").html(internet_carrier + translate["no internet"]);
                }
            }
            else
            {
                $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
                $("#robot_internet_text").css('color', 'red');
                $("#robot_internet_text").text(translate["No connection"]); //Connected, no operator
            }
        }
        else if(internet_type === "ERROR")
        {
            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
            $("#robot_internet_text").css('color', 'red');
            $("#robot_internet_text").text(translate["No connection"]);
        }
        else
        {
            $("#cell_wifi_icon").html(topbar_data_icon_object.signal_cell0_icon);
            $("#robot_internet_text").css('color', 'red');
            $("#robot_internet_text").text(translate["Unknown"]);
        }
    },
    display_connection_data: function()
    {
        let internet_online = robot_controller.chosen_robot.online_cloud;
        let bluetooth_online = robot_controller.chosen_robot.online_bluetooth;

        if(internet_online && bluetooth_online)
        {
            $("#robot_to_tablet_text").css('color', 'green')
            $("#robot_to_tablet_text").text(translate["Internet"] + " + " + translate["Bluetooth"]);
        }
        else if(!internet_online && bluetooth_online)
        {
            $("#robot_to_tablet_text").css('color', 'goldenrod')
            $("#robot_to_tablet_text").text(translate["Bluetooth"]);
        }
        else if(internet_online && !bluetooth_online)
        {
            $("#robot_to_tablet_text").css('color', 'goldenrod')
            $("#robot_to_tablet_text").text(translate["Internet"]);
        }
        else
        {
            $("#robot_to_tablet_text").css('color', 'red')
            $("#robot_to_tablet_text").text(translate["No connection"]);
        }
    },
    display_robot_icon: function()
    {
        $( "#sidebar_robot_icon" ).toggleClass("gone", !robot_controller.chosen_robot.online || !topbar_data_screen_controller.topbar_info["Operational"] );
    },
    animate_intervals: {},
    animate_icon_start(selector, list_of_icons, intervalTime = 1000)
    {
        if(selector in topbar_data_screen_controller.animate_intervals)
            return;

        const animator = function()
        {
            $(selector).html(topbar_data_screen_controller.animate_intervals[selector].icons[topbar_data_screen_controller.animate_intervals[selector].counter++]);
            if(topbar_data_screen_controller.animate_intervals[selector].counter >= topbar_data_screen_controller.animate_intervals[selector].icons.length)
                topbar_data_screen_controller.animate_intervals[selector].counter = 0;
        };
        
        
        topbar_data_screen_controller.animate_intervals[selector] = {
            intervalTime: intervalTime,
            counter: 0,
            icons: list_of_icons,
            interval: setInterval(animator, intervalTime)
        };
        
        animator();

    },
    animate_icon_stop(selector)
    {
        if(!(selector in topbar_data_screen_controller.animate_intervals))
            return;

        clearInterval(topbar_data_screen_controller.animate_intervals[selector].interval);
        delete topbar_data_screen_controller.animate_intervals[selector];
    },
    switch_topbar()
    {
        if(robot_controller.robot_has_capability("topbar_data_enable"))
        {
            $("#topbar").addClass("gone");
            $("#topbar_data_v2").removeClass("gone");
            $("#topbar_overlay").removeClass("gone");
        }
        else
        {
            $("#topbar").removeClass("gone");
            $("#topbar_data_v2").addClass("gone");
            $("#topbar_overlay").addClass("gone");
        }
    }
};

$(()=> {
    topbar_data_screen_controller.switch_topbar();
    topbar_data_screen_controller.add_icons_on_load();

    message_controller.events.add_callback("topbar_data", topbar_data_screen_controller.got_topbar_data);

    event_controller.add_callback("got_robot_capabilities", topbar_data_screen_controller.switch_topbar);
    event_controller.add_callback("topbar_force_update", ()=>{topbar_data_screen_controller.got_topbar_data(topbar_data_screen_controller.topbar_info)});
    event_controller.add_callback("chosen_robot_online_changed", topbar_data_screen_controller.robotOnlineStateChanged);
    event_controller.add_callback("chosen_robot_online_cloud_changed", topbar_data_screen_controller.display_connection_data);
    event_controller.add_callback("bluetooth_disconnect", topbar_data_screen_controller.display_connection_data);
    event_controller.add_callback("connected_to_bluetooth", topbar_data_screen_controller.display_connection_data);
});