/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, event_controller, popup_screen_controller, settings_screeen_controller, robot_communication_settings_screen, cordova, translate */

var wifi_screen = {
  open: function( )
  {
    wifi_screen.update_internet_status();
    robot_communication_settings_screen.got_wifi_settings( robot_communication_settings_screen.wifi_settings, true );
    wifi_screen.update_robot_internet_info();
    wifi_screen.got_modem_settings( robot_communication_settings_screen.modem_settings, true );

    robot_communication_settings_screen.get_internet_info();

    // recise tablet modem table to match robot modem table
    let new_width = $( "#settings_screen #wifi_settings_screen #modem_tab_content #sim_status_header" ).width();
    $( "#settings_screen #wifi_settings_screen #tablet_tab_content #tablet_imei_header" ).width( new_width );

    if( robot_controller.robot_has_capability("wifi_as_service"))
    {
      $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid_search" ).removeClass("gone");
      $( "#wifi_settings_screen #wifi_tab_content #search_robot_wifi_button" ).removeClass("gone");
      $( "#wifi_settings_screen #wifi_tab_content #disconnect_robot_wifi_button" ).removeClass("gone");
    }
    else
    {
      $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid_search" ).addClass("gone");
      $( "#wifi_settings_screen #wifi_tab_content #search_robot_wifi_button" ).addClass("gone");
      $( "#wifi_settings_screen #wifi_tab_content #disconnect_robot_wifi_button" ).addClass("gone");
    }

    wifi_screen.toggle_robot_settings();
  },
  waiting_for_scan_result: false,
  section_search_id: "",
  search_for_nearby: function( section_id )
  {
    logger.debug( "starting wifi scan" );
    if(section_id === "tablet_wifi_tab_content")
      cordova.plugins.WifiManager.startScan();
    else if( section_id === "wifi_tab_content")
      wifi_screen.start_robot_wifi_scan();

    wifi_screen.waiting_for_scan_result = true;
    wifi_screen.section_search_id = section_id;
    popup_screen_controller.confirm_popup( translate["Searching for networks nearby"], "", translate["Cancel"], false, function()
    {
      popup_screen_controller.close();
      wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.UNDEFINED;
      wifi_screen.waiting_for_scan_result = false;
    },false,false,false,true,true );
  },
  start_robot_wifi_scan: function()
  {
    logger.debug("start_wifi_scan");
    wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.SEARCHING;
    communication_controller.send('start_wifi_scan',{},'all');
  },
  got_tablet_wifi_scan_result: function( resultsUpdated )
  {
    if( !wifi_screen.waiting_for_scan_result )
      return;
    if( wifi_screen.section_search_id !== "tablet_wifi_tab_content")
      return;
      logger.debug( resultsUpdated );

    cordova.plugins.WifiManager.getScanResults( ( err, scanResults ) => {
      logger.debug( scanResults );

      let ssids = scanResults.map( w => w.SSID ).filter( s => s ).remove_duplicates().sort();
      //ssids = ssids.map( s => s.replace( '"', "" ).trim() );
      logger.debug( ssids );
      let body = "";
      body += "<p>" + translate["Showing WiFi networks that the tablet has detected"] + "</p><br>";
      body += '<div style="max-height: 50%;padding-right: 10px;" class="scrollbar_y">';

      ssids.forEach( ssid => {
        body += '<button id="connect_tablet_wifi_button" class="dark" style="width: 100%;margin-bottom: 20px;" onclick="wifi_screen.set_wifi_ssid(\'' + ssid + '\')">' + ssid + '</button><br>';
      } );
      body += "</div>";
      popup_screen_controller.confirm_popup( translate["Choose network"], body, translate["Cancel"], translate["Search again"], function()
      {
        popup_screen_controller.close();
        wifi_screen.waiting_for_scan_result = false;
      },
      function()
      {
        wifi_screen.search_for_nearby( 'tablet_wifi_tab_content' );
      });

    } );
  },
  got_robot_wifi_scan_result: function( data )
  {
    wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.UNDEFINED;

    logger.debug("wifi_scan_result", data);
    if( !wifi_screen.waiting_for_scan_result )
      return;
    if( wifi_screen.section_search_id !== "wifi_tab_content")
      return;

    logger.debug( data.nearby );

    let ssids = data.nearby.filter( s => s ).remove_duplicates().sort();
    //ssids = ssids.map( s => s.replace( '"', "" ).trim() );
    logger.debug( ssids );
    let body = "";
    body += "<p>" + translate["Showing WiFi networks that the robot has detected"] + "</p><br>";
    body += '<div style="max-height: 50%;padding-right: 10px;" class="scrollbar_y">';

    ssids.forEach( ssid => {
      body += '<button id="connect_tablet_wifi_button" class="dark" style="width: 100%;margin-bottom: 20px;" onclick="wifi_screen.set_wifi_ssid(\'' + ssid + '\')">' + ssid + '</button><br>';
    } );
    body += "</div>";
    popup_screen_controller.confirm_popup( translate["Choose network"], body, translate["Cancel"], translate["Search again"], function()
    {
      popup_screen_controller.close();
      wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.UNDEFINED;
      wifi_screen.waiting_for_scan_result = false;
    },
    function()
    {
      wifi_screen.search_for_nearby( 'wifi_tab_content' );
    });

  },
  set_wifi_ssid: function( ssid )
  {
    $( "#wifi_settings_screen #" + wifi_screen.section_search_id + " #wifi_ssid" ).val( ssid );
    $( "#wifi_settings_screen #" + wifi_screen.section_search_id + " #wifi_password" ).focus();
    wifi_screen.waiting_for_scan_result = false;
    popup_screen_controller.close();
  },
  connect_tablet_wifi: function( )
  {
    let ssid = $( "#wifi_settings_screen #tablet_wifi_tab_content #wifi_ssid" ).val();
    let password = $( "#wifi_settings_screen #tablet_wifi_tab_content #wifi_password" ).val( );

    logger.debug( ssid, password );
    setTimeout( () => {
      window.wifiManager.connect( ssid, password, wifi_screen.connected, wifi_screen.error_connecting );
    } );

    popup_screen_controller.open_info_waiter( translate["Connecting to %1s"].format(ssid) );
  },
  connected: function( success )
  {
    logger.debug( success );
    popup_screen_controller.close();
    wifi_screen.update_internet_status();
  },
  error_connecting: function( err )
  {
    popup_screen_controller.confirm_popup( "Could not connect", err.message, "ok", false, popup_screen_controller.close );
  },
  update_internet_status: function()
  {
    logger.debug.apply( arguments );
    if( !window.cordova )
    {
      $( "#wifi_settings_screen #connection_status_tab #tablet_wifi_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #tablet_tab_content" ).addClass( "gone" );
      return;
    }

    cordova.plugins.WifiManager.getWifiState( ( err, state ) => {

      if( state === "ENABLED" )
      {
        cordova.plugins.WifiManager.getConnectionInfo( ( err, wifiInfo ) => {
          if( wifiInfo.SSID[0] === '"' )
            wifiInfo.SSID = wifiInfo.SSID.substr( 1, wifiInfo.SSID.length - 2 );

          if(wifiInfo.SSID !== "")
            $( "#wifi_settings_screen #connection_status_tab #tablet_wifi_status" ).html( "<b>" + translate["Connected to %1s"].format( wifiInfo.SSID ) + "</b>" );
          else
            $( "#wifi_settings_screen #connection_status_tab #tablet_wifi_status" ).html( "<b>" + translate["Connecting to network"] + "</b>" );
          // $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( translate["Off_power"] );
        } );
      }
      else if( state === "DISABLED" )
      {
        $( "#wifi_settings_screen #connection_status_tab #tablet_wifi_status" ).html( translate["Off_power"] );
        // device_information_controller.getPhoneInformation( info => {
        //   $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( "<b>" + translate["Connected to %1s"].format( info.carrierName ) + "</b>" );
        // } );

      }
      else
      {
        // device_information_controller.getPhoneInformation( info => {
        //   $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( "<b>" + translate["Connected to %1s"].format( info.carrierName ) + "</b>" );
        // } );
        $( "#wifi_settings_screen #connection_status_tab #tablet_wifi_status" ).html( "<b>" + translate["WiFi %1s"].format(state) + "</b>" );
      }
    } );

    device_information_controller.getPhoneInformation( info => {
      
      if( info.parsedCards.carrierName )
        $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( "<b>" + translate["Connected to %1s"].format( info.parsedCards.carrierName ) + "</b>" );
      else
        $( "#wifi_settings_screen #connection_status_tab #tablet_modem_status" ).html( translate["Off_power"] );

      $( "#wifi_settings_screen #tablet_tab_content" ).toggleClass('gone', info.parsedCards.deviceId === "N/A" && info.parsedCards.simSerialNumber === "N/A")
      $( "#wifi_settings_screen #tablet_tab_content #tablet_imei_value" ).html( info.parsedCards.deviceId );
      $( "#wifi_settings_screen #tablet_tab_content #tablet_icc_value" ).html( info.parsedCards.simSerialNumber );
    } );

  },
  disconnect_wifi: function()
  {
    cordova.plugins.WifiManager.getConnectionInfo( wifiInfo => {
      //removeNetwork(netId, callback(err, success))

      cordova.plugins.WifiManager.disableNetwork( wifiInfo.networkId, logger.debug );
    } );
  },
  displayed_wifi_settings: {},
  open_wifi_settings: function()
  {
    wifi_screen.get_internet_info();
    wifi_screen.get_wifi_settings();

    wifi_screen.got_wifi_settings( wifi_screen.wifi_settings, true );

    wifi_screen.displayed_wifi_settings.ssid = $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid" ).val();
    wifi_screen.displayed_wifi_settings.pass = $( "#wifi_settings_screen #wifi_tab_content #wifi_password" ).val();
  },
  transfer_tablet_to_robot_wifi_input()
  {
    let ssid = $( "#wifi_settings_screen #tablet_wifi_tab_content #wifi_ssid" ).val();
    let password = $( "#wifi_settings_screen #tablet_wifi_tab_content #wifi_password" ).val( );

    $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid" ).val( ssid );
    $( "#wifi_settings_screen #wifi_tab_content #wifi_password" ).val( password );

    $( "#wifi_settings_screen #wifi_tab" )[0].scrollIntoView();
  },
  disconnect_robot_wifi: function()
  {
    if(robot_communication_settings_screen.wifi_settings["status"] === "disconnected")
    {
      popup_screen_controller.confirm_popup_with_options({
        header: translate["Error"],
        body: translate["Not connected to any WiFi"],
        ok_text: translate["OK"],
        ok_callback: popup_screen_controller.close
      });

      return;
    }
    wifi_screen.set_robot_wifi({disconnect: true});
  },
  set_robot_wifi_timeout: null,
  robot_wifi_states: {
    UNDEFINED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTING: 3,
    DISCONNECTED: 4,
    ERROR: 5,
    SEARCHING: 6
  },
  _set_robot_wifi_state: 0,
  get set_robot_wifi_state()
  {
    return wifi_screen._set_robot_wifi_state;
  },
  set set_robot_wifi_state(v)
  {
    if(v in Object.values(wifi_screen.robot_wifi_states))
    {
      wifi_screen._set_robot_wifi_state = v;
      wifi_screen.update_robot_internet_info();
    }
    else
    {
      throw "Undefined state";
    }
  },
  set_robot_wifi: function(options = {})
  {
    var ssid = options.ssid ? options.ssid : $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid" ).val();
    var pass = options.pass ? options.pass : $( "#wifi_settings_screen #wifi_tab_content #wifi_password" ).val();

    var wifi_settings = {};
    if(options.disconnect)
    {
      wifi_settings.disconnect = true;
    }
    else
    {
      if(!ssid)
      {
        popup_screen_controller.confirm_popup_with_options({
          header: translate["Error"],
          body: translate["WiFi SSID must not be empty"],
          ok_text: translate["OK"],
          ok_callback: popup_screen_controller.close
        });

        return;
      }

      wifi_settings.ssid = ssid;
      wifi_screen.displayed_wifi_settings.ssid = ssid;
    
      wifi_settings.psk = pass;
      wifi_screen.displayed_wifi_settings.pass = pass;
    }

    wifi_settings = robot_communication_settings_screen.validate_data( wifi_settings );

    if( Object.keys( wifi_settings ).length > 0 )
    {
      logger.debug( "save_wifi_settings" );

      // communication_controller.send( 'connect_wifi_nmcli', { robot: robot_controller.chosen_robot_id, wifi_settings: {ssid:"PeRina",psk:"9gj7dBan"} }, "all", 10 );
      // communication_controller.send( 'disconnect_wifi_nmcli', { robot: robot_controller.chosen_robot_id }, "all", 10 );

      wifi_settings.reconfigure_now = true;
      communication_controller.send( 'set_wifi_settings', {
        robot: robot_controller.chosen_robot_id,
        wifi_settings: wifi_settings
      }, "all", 10 );

      // let header = wifi_settings.disconnect ? translate["Disconnecting"] : translate["Connecting to %1s"].format(ssid);
      // robot_communication_settings_screen.pop_up_once( header, "updated_wifi", undefined, true );

      pop_generator.create_popup_with_options({
        header: wifi_settings.disconnect ? translate["Disconnecting"] : translate["Connecting to %1s"].format(ssid),
        popup_id: "setup_wifi",
        spinner: true
      });

      const remove_callbacks = function()
      {
        clearTimeout(wifi_screen.set_robot_wifi_timeout);
        message_controller.events.remove_callback("updated_wifi", updated_wifi_cb);
        event_controller.remove_callback("got_wifi_settings", got_wifi_settings_cb);
        event_controller.remove_callback("got_internet_info", got_internet_info_cb);
      };

      const success_callback = function()
      {
        remove_callbacks();
        if(wifi_settings.disconnect)
          wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.DISCONNECTED;
        else
          wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.CONNECTED;
        popup_screen_controller.close("setup_wifi");
      };

      const error_callback = function()
      {
        remove_callbacks();
        wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.ERROR;

        popup_screen_controller.confirm_popup_with_options({
          header:translate["Error"],
          body: wifi_settings.disconnect ? translate["An error occured while disconnecting"] : translate["An error occured while connecting to %1s. Please try again."].format(ssid),
          ok_text:translate["OK"],
          ok_callback: function()
          {
            popup_screen_controller.close("confirm_popup");
          }
        });
      }

      const updated_wifi_cb = function(data)
      {
        logger.debug("updated_wifi_cb",wifi_settings.disconnect,data);
        if(wifi_settings.disconnect)
          return;

        if(data.success === true)
          // success_callback();
          return; // otherwise popup disappears too fast
        else if(data.success === false)
          error_callback();
        else
          return;
      };
      const got_wifi_settings_cb = function(data)
      {
        logger.debug("got_wifi_settings_cb",wifi_settings.disconnect,data);
        if(data.status === undefined)
          return;

        if(wifi_settings.disconnect && data.status.toLowerCase() === "disconnected")
          success_callback();
        else if(!wifi_settings.disconnect && data.status.toLowerCase() === "activated")
          success_callback();
        else
          return;
      };
      const got_internet_info_cb = function(data)
      {
        logger.debug("got_internet_info_cb",wifi_settings.disconnect,data);
        if(wifi_settings.disconnect && data["Internet route"].toLowerCase() !== "wifi")
          success_callback();
        else if(!wifi_settings.disconnect && data["Internet route"].toLowerCase() === "wifi")
          success_callback();
        else
          return;
      };

      let already_disconnected = false;
      if( wifi_settings.disconnect && wifi_screen.set_robot_wifi_state === wifi_screen.robot_wifi_states.DISCONNECTED )
      {
        already_disconnected = true;
      }
      let already_connected = false;
      if( !wifi_settings.disconnect && wifi_screen.set_robot_wifi_state === wifi_screen.robot_wifi_states.CONNECTED )
      {
        if( robot_communication_settings_screen.wifi_settings.ssid === wifi_settings.ssid )
          already_connected = true;
      }

      if(wifi_settings.disconnect)
        wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.DISCONNECTING;
      else
        wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.CONNECTING;


      if( already_connected || already_disconnected )
      {
        setTimeout(robot_communication_settings_screen.get_wifi_settings, 2*1000);
      }
      
      setTimeout(()=>{
        message_controller.events.add_callback("updated_wifi", updated_wifi_cb);
        event_controller.add_callback("got_wifi_settings", got_wifi_settings_cb);
        event_controller.add_callback("got_internet_info", got_internet_info_cb);
      }, 100 );

      clearTimeout(wifi_screen.set_robot_wifi_timeout);
      wifi_screen.set_robot_wifi_timeout = setTimeout(error_callback,2*60*1000);
      
    }
  },
  update_robot_internet_info: function()
  {

    const info = robot_communication_settings_screen.internet_info;
    const wifi = robot_communication_settings_screen.wifi_settings;
    const modem = robot_communication_settings_screen.modem_settings;

    logger.debug( "Robot internet route:", info["Internet route"], info, wifi, modem );

    let carrier = "N/A";
    if( info["Operator"] )
      carrier = info["Operator"];
    else if( modem.activecarrier )
      carrier = modem.activecarrier;
    if(!info["Internet route"])
      info["Internet route"] = "";
    
    if( info["Internet route"].toLowerCase() === "wifi" )
    {
      if( wifi.ssid && wifi.ssid.toLowerCase() !== "n/a")
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( "<b>" + translate["Connected to %1s"].format( wifi["ssid"] ) + "</b>" );
      else
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( translate["Off_power"] );
      //$( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).html( translate[info["PIN Status"]] );
    }
    else if( info["Internet route"].toLowerCase() === "mobile" || info["Internet route"].toLowerCase() === "cell" )
    {
      $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( "<b>" + translate["Connected to %1s"].format( carrier ) + "</b>" );
      //$( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).html( translate[info["PIN Status"]] );
    }
    else if( info["Internet route"].toLowerCase() === "no conn" )
    {
      $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( "<b>" + translate["No conn"] );
      //$( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).html( translate["No conn"] );
    }
    else
    {
      $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( "<b>" + (info["Internet route"] ? translate[info["Internet route"]] : translate["No conn"]) + "</b>" );
      //$( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).html( (info["Internet route"] ? translate[info["Internet route"]] : translate["No conn"]) );
    }

    if( modem["Driver state"] )
    {
      let state = modem["Driver state"];
      state = (state ? state : "").toLowerCase();
      if( state === "running" )
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( "<b>" + translate["Connected to %1s"].format( carrier ) + "</b>" );
      }
      else if( state === "scan operators")
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( translate["Searching for networks nearby"] );
      }
      else if( state === "set operator" || state === "waitconnected")
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( translate["Connecting to network"] );
      }
      else
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_modem_status" ).html( translate["Off_power"] );
      }
    }

    if( wifi.status )
    {
      if(wifi.status.toLowerCase() === "activated")
      {
        if( wifi.ssid && wifi.ssid.toLowerCase() !== "n/a")
        {
          $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( "<b>" + translate["Connected to %1s"].format( wifi["ssid"] ) + "</b>" );
        }
        else
        {
          $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( "<b>" + translate["Connected"] + "</b>" );
          wifi_screen._update_connected_wifi();
        }
      }
      else if(wifi.status.toLowerCase() === "disconnected")
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      }
    }

    if( wifi_screen.set_robot_wifi_state !== wifi_screen.robot_wifi_states.UNDEFINED )
    {
      let state = wifi_screen.set_robot_wifi_state;
      if( state === wifi_screen.robot_wifi_states.CONNECTING )
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Connecting to network"] );
      }
      else if( state === wifi_screen.robot_wifi_states.CONNECTED )
      {
        if( wifi.ssid && wifi.ssid.toLowerCase() !== "n/a")
        {
          $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( "<b>" + translate["Connected to %1s"].format( wifi["ssid"] ) + "</b>" );
        }
        else
        {
          $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( "<b>" + translate["Connected"] + "</b>" );
          wifi_screen._update_connected_wifi();
        }
      }
      else if( state === wifi_screen.robot_wifi_states.DISCONNECTING )
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Disconnecting"] );
      }
      else if( state === wifi_screen.robot_wifi_states.DISCONNECTED )
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Off_power"] );
      }
      else if( state === wifi_screen.robot_wifi_states.SEARCHING )
      {
        $( "#wifi_settings_screen #connection_status_tab #robot_wifi_status" ).html( translate["Searching for networks nearby"] );
      }
    }
    else
    {
      if(wifi.status)
      {
        if( wifi.status.toLowerCase() === "disconnected" )
          wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.DISCONNECTED;
        else if( wifi.status.toLowerCase() === "activated" || wifi.ssid.toLowerCase() !== "n/a" )
          wifi_screen.set_robot_wifi_state = wifi_screen.robot_wifi_states.CONNECTED;
      }
    }

  },
  _updating_connected_wifi_time: 0,
  _update_connected_wifi: function()
  {
    if( (time.now - wifi_screen._updating_connected_wifi_time) > 5000 )
    {
      wifi_screen._updating_connected_wifi_time = time.now;
      robot_communication_settings_screen.get_wifi_settings();
    }
  },
  update_displayed_wifi: function( new_settings, source, force_update )
  {
    let ssid = "";
    let psk = "";

    if( new_settings.ssid && new_settings.ssid.toLowerCase() !== "no conn")
      ssid = new_settings.ssid;

    if( new_settings.psk && new_settings.psk.toLowerCase() !== "no conn")
      psk = new_settings.psk;

    wifi_screen.displayed_wifi_settings.ssid = ssid;
    wifi_screen.displayed_wifi_settings.psk = ssid;
  },
  got_modem_settings: function( new_settings )
  {
    if( robot_communication_settings_screen.internet_info["PIN Status"] === "OK" )
    {
      if( new_settings["Driver state"] === "Running" )
        $( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).text( translate[robot_communication_settings_screen.internet_info["PIN Status"]] );
      else if( new_settings["Driver state"] === "Scan Operators" )
        $( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).text( translate["Scanning for networks"] );
      else if( new_settings["Driver state"] === "Set Operator" )
        $( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).text( translate["Registering for network"] );
      else
        $( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).text( translate["Connecting to network"] );
    }
    else
    {
      $( "#wifi_settings_screen #modem_tab_content #sim_status_value" ).html( translate[robot_communication_settings_screen.internet_info["PIN Status"]] );
    }

    // Write the modem IMEI
    if( new_settings.modemimei )
      $( "#wifi_settings_screen #modem_imei_value" ).text( new_settings.modemimei );
    else
      $( "#wifi_settings_screen #modem_imei_value" ).text( translate["N/A"] );
    if( new_settings.sim && new_settings.sim["A"].icc )
    {
      let icc = parseInt(new_settings.sim["A"].icc);
      if( isNaN(icc) )
        $( "#wifi_settings_screen #modem_icc_value" ).text( translate["Error"] );
      else
        $( "#wifi_settings_screen #modem_icc_value" ).text( icc );
    }
    else
    {
      $( "#wifi_settings_screen #modem_icc_value" ).text( translate["N/A"] );
    }

    // Write the active carrier / Network of the SIM
    $( "#wifi_settings_screen #modem_active_carrier_value" ).text( new_settings.activecarrier );
    if( new_settings["Operator mode"] === "Manual" )
    {
      $( "#wifi_settings_screen #change_operator_btn").text( translate["Change Operator"] );
    }
    else
    {
      $( "#wifi_settings_screen #change_operator_btn").text( translate["Search for Operators"] );
    }

    
    if( robot_controller.robot_has_capability( "cell_select" ) )
    {
       $( "#wifi_settings_screen #modem_carrier_row" ).removeClass( "gone" );
    }
    else
    {
      $( "#wifi_settings_screen #modem_carrier_row" ).addClass( "gone" );
    }

    // Modem model
    if( new_settings.modemmodel )
      $( "#wifi_settings_screen #modem_model_value" ).html( new_settings.modemmodel );
    else
      $( "#wifi_settings_screen #modem_model_value" ).html( translate["N/A"] );

    // APN settings
    $( "#wifi_settings_screen #modem_tab_content #modem_apn" ).val( "" + (new_settings.apn ? wifi_screen.clean_apn(new_settings.apn) : "") );

  },
  clean_apn: function( apn )
  {
    apn = apn.split('.').filter(part=>{
      if( part.indexOf('mnc') === 0 && !isNaN(parseInt(part.slice(3))) )
        return false;
      if( part.indexOf('mcc') === 0 && !isNaN(parseInt(part.slice(3))) )
        return false;
      if( part.indexOf('gprs') === 0 )
        return false;

      return true;
    }).join('.');

    let i = apn.indexOf('.3gppnetwork.org');
    if( i > 0 )
      apn = apn.slice(0,i)

    return apn;
  },
  set_robot_apn: function()
  {
    let new_apn = $( "#wifi_settings_screen #modem_tab_content #modem_apn" ).val( );
    if( !new_apn )
      return;

    communication_controller.send( 'set_modem_settings', {
      robot: robot_controller.chosen_robot_id,
      modem_settings: {
        apn: new_apn
      }
    }, "all", 10 );
    robot_communication_settings_screen.pop_up_once( "Setting up modem", "updated_modem" );

  },
  waiting_for_modem_scan_result: false,
  _check_done_searching_timeout: null,
  change_modem_operator: function()
  {
    popup_screen_controller.confirm_popup_with_options({
      header: translate["HeaderTimeConsumingOperation"],
      body: translate["BodyTimeConsumingOperation"],
      ok_text: translate["Yes"],
      cancel_text: translate["No"],
      ok_callback: proceed,
      cancel_callback: popup_screen_controller.close
    });

    function proceed() {
      popup_screen_controller.close();

      if( wifi_screen.modem_operator_scan_result.length > 0 )
      {
        wifi_screen.got_modem_operator_scan_result(wifi_screen.modem_operator_scan_result, true);
      }
      else
      {
        wifi_screen.search_for_modem_operator();
      }
    }
  },
  search_for_modem_operator: function()
  {
    communication_controller.send( 'set_modem_operator_settings', {robot: robot_controller.chosen_robot_id, settings: {scan_operators: true}}, "all", 10 );

    popup_screen_controller.confirm_popup_with_options( {
      header:translate["Searching for networks nearby"],
      body:translate["ModemOperatorConnectText"].format(10),
      spinner:true,
    } );

    wifi_screen.waiting_for_modem_scan_result = true;

    let modem = robot_communication_settings_screen.modem_settings;

    let last_scan_time = "";
    let last_success_time = "";
    if(modem["Timestamp"] && modem["Timestamp"]["Last scan"])
      last_scan_time = modem["Timestamp"]["Last scan"];
    if(modem["Timestamp"] && modem["Timestamp"]["Last success"])
      last_success_time = modem["Timestamp"]["Last success"];

    function check_done_searching( data )
    {

      let new_scan_time = "";
      let new_success_time = "";
      if(data["Timestamp"] && data["Timestamp"]["Last scan"])
        new_scan_time = data["Timestamp"]["Last scan"];
      if(data["Timestamp"] && data["Timestamp"]["Last success"])
        new_success_time = data["Timestamp"]["Last success"];

      if( !data["Scanning for operators"] )
      {
        if( data["Last operator scan succeeded"] && new_success_time !== last_success_time )
        {
          let operators = data["Available operators"].filter(net => net !== "N/A");
          if(operators.length < 1)
            return;

          event_controller.remove_callback( "got_modem_settings", check_done_searching );
          wifi_screen.got_modem_operator_scan_result( operators );
        }

        if( !data["Last operator scan succeeded"] && new_scan_time !== last_scan_time )
        {
          wifi_screen.open_scan_error_popup();
        }
      }
    }

    clearTimeout(wifi_screen._check_done_searching_timeout);
    wifi_screen._check_done_searching_timeout = setTimeout(()=>event_controller.add_callback( "got_modem_settings", check_done_searching ), 10*1000);
    wifi_screen._waiting_for_modem_scan_result_timeout = setTimeout(wifi_screen.open_scan_error_popup, 20*60*1000);
  },

  open_scan_error_popup: function()
  {
    clearTimeout(wifi_screen._waiting_for_modem_scan_result_timeout);
    popup_screen_controller.confirm_popup_with_options({
      header:translate["Error"],
      body:translate["An error occured while scanning for networks. Please try again."],
      ok_text:translate["OK"],
      ok_callback: function()
      {
        popup_screen_controller.close("confirm_popup");
        wifi_screen.waiting_for_modem_scan_result = false;
      }
    });
  },
  modem_operator_scan_result: [],
  got_modem_operator_scan_result: function( result, force = false )
  {
    if( !force && !wifi_screen.waiting_for_modem_scan_result )
      return;

    result = result.filter(net => net !== "N/A");
    wifi_screen.modem_operator_scan_result = result;

    if(result.length < 1)
    {
      wifi_screen.open_scan_error_popup();
      return;
    }

    wifi_screen.waiting_for_modem_scan_result = false;
    clearTimeout(wifi_screen._waiting_for_modem_scan_result_timeout);

    let body = "";
    body += '<div style="max-height: 50%;padding-right: 10px;" class="scrollbar_y">';

    const create_button = function(network,name,button_class="dark")
    {
      return `<button id="connect_tablet_wifi_button" class="${button_class}" style="width: 100%;margin-bottom: 20px;" onclick="wifi_screen.set_modem_operator('${network}')">${name?name:network}</button><br>`;
    }

    result.forEach( network => {
      body += create_button(network);
    } );
    if(robot_communication_settings_screen.modem_settings["Operator mode"] === "Manual")
      body += create_button("",translate["Select Network Automatically"],"chosen");
    body += "</div>";
    popup_screen_controller.confirm_popup_with_options(
    {
      header: translate["Choose network"],
      body: body,
      ok_text: translate["Search again"],
      ok_callback: wifi_screen.search_for_modem_operator,
      cancel_text: translate["Cancel"],
      cancel_callback: popup_screen_controller.close,
      cancel_class:"red",
      show_x:true
    } );

  },
  _set_modem_operator_timeout: null,
  open_set_modem_error_popup: function(net)
  {
    clearTimeout(wifi_screen._set_modem_operator_timeout);
    popup_screen_controller.confirm_popup_with_options({
      header:translate["Error"],
      body:translate["An error occured while connecting to %1s. Please try again."].format(net),
      ok_text:translate["OK"],
      ok_callback: function()
      {
        popup_screen_controller.close("confirm_popup");
      }
    });
  },
  set_modem_operator: function( operator )
  {
    if(operator)
    {
      communication_controller.send( 'set_modem_operator_settings', {robot: robot_controller.chosen_robot_id, settings: {operator_selection: operator}}, "all", 10 );
    }
    else
    {
      communication_controller.send( 'set_modem_operator_settings', {robot: robot_controller.chosen_robot_id, settings: {automatic_operator_selection: true}}, "all", 10 );
    }
    popup_screen_controller.close();


    const close = function()
    {
      let internet = robot_communication_settings_screen.internet_info;
      let modem = robot_communication_settings_screen.modem_settings;
      if(internet["Operator"] && internet["Operator"] === operator && internet["Internet route"] && internet["Internet route"].toLowerCase() !== "no conn" && modem["Driver state"] && modem["Driver state"].toLowerCase() === "running")
      {
        popup_screen_controller.close("confirm_popup");
        clearTimeout(wifi_screen._set_modem_operator_timeout);
        event_controller.remove_callback( "got_internet_info", close );
      }
    }

    popup_screen_controller.confirm_popup_with_options( {
      header:operator ? translate["Connecting to %1s"].format(operator) : translate["Automatically selecting network"],
      body:translate["ModemOperatorConnectText"].format(10),
      spinner:true
     } );

    event_controller.add_callback( "got_internet_info", close );
    clearTimeout(wifi_screen._set_modem_operator_timeout);
    wifi_screen._set_modem_operator_timeout = setTimeout(()=>wifi_screen.open_set_modem_error_popup(operator), 10*60*1000);
  },

  toggle_robot_settings: function( state = robot_controller.chosen_robot.online )
  {
    if( state )
    {
      $( "#wifi_settings_screen #modem_tab_content h2" ).text( translate["Robot Modem"] );
      $( "#wifi_settings_screen #wifi_tab_content h2" ).text( translate["WiFi Robot"] );
    }
    else
    {
      $( "#wifi_settings_screen #modem_tab_content h2" ).text( `${translate["Robot Modem"]} (${translate["Offline"]})` );
      $( "#wifi_settings_screen #wifi_tab_content h2" ).text( `${translate["WiFi Robot"]} (${translate["Offline"]})` );
    }
    $( "#wifi_settings_screen #modem_tab_content input" ).prop( "disabled", !state );
    $( "#wifi_settings_screen #modem_tab_content button" ).prop( "disabled", !state );
    $( "#wifi_settings_screen #wifi_tab_content input" ).prop( "disabled", !state );
    $( "#wifi_settings_screen #wifi_tab_content button" ).prop( "disabled", !state );
  }
};

$( document ).ready( function()
{
  event_controller.add_callback( "app_specific_setup_done", () => {

    if( window.cordova )
    {
      cordova.plugins.WifiManager.onnetworkstatechanged = function( networkInfo, BSSID, wifiInfo )
      {
        event_controller.call_callback( "onnetworkstatechanged", networkInfo, BSSID, wifiInfo );
      };
      cordova.plugins.WifiManager.onnetworkidschanged = function(  )
      {
        event_controller.call_callback( "onnetworkidschanged" );
      };
      cordova.plugins.WifiManager.onwifistatechanged = function( wifiState, previousWifiState )
      {
        event_controller.call_callback( "onwifistatechanged", wifiState, previousWifiState );
      };
      cordova.plugins.WifiManager.onscanresultsavailable = function( resultsUpdated )
      {
        event_controller.call_callback( "onscanresultsavailable", resultsUpdated );
      };

      event_controller.add_callback( "onnetworkstatechanged", wifi_screen.update_internet_status );
      event_controller.add_callback( "onnetworkidschanged", wifi_screen.update_internet_status );
      event_controller.add_callback( "onwifistatechanged", wifi_screen.update_internet_status );
      event_controller.add_callback( "onscanresultsavailable", wifi_screen.got_tablet_wifi_scan_result );
    }
    event_controller.add_callback( "got_wifi_settings", wifi_screen.update_displayed_wifi );
    message_controller.events.add_callback( "wifi_nearby", wifi_screen.got_robot_wifi_scan_result );
    event_controller.add_callback( "got_modem_settings", wifi_screen.got_modem_settings );
  } );

  event_controller.add_callback( "got_internet_info", wifi_screen.update_robot_internet_info );
  event_controller.add_callback( "got_wifi_settings", wifi_screen.update_robot_internet_info );
  event_controller.add_callback( "got_modem_settings", wifi_screen.update_robot_internet_info );

  event_controller.add_callback( "chosen_robot_online_changed", wifi_screen.toggle_robot_settings );
} );
event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "wifi_settings_screen" )
  {
    wifi_screen.open();
  }
} );