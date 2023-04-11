/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, communication_controller, event_controller, popup_screen_controller, translate, settings_screeen_controller, message_controller */

var robot_communication_settings_screen = {
  get is_open()
  {
    return settings_screeen_controller.chosen_menu === "communication_settings_screen" && settings_screeen_controller.is_open;
  },
  set is_open( v )
  {},
  open: function()
  {
    $( "#communication_settings_screen section" ).removeClass( "gone" );
    false && robot_communication_settings_screen.open_modem_settings();
    true &&  robot_communication_settings_screen.open_ntrip_settings();
    true &&  robot_communication_settings_screen.open_bluetooth_settings();
  },
  displayed_modem_settings: {},
  open_modem_settings: function()
  {
    robot_communication_settings_screen.get_modem_info();
    //robot_communication_settings_screen.get_wifi_settings();

    robot_communication_settings_screen.got_internet_info( robot_communication_settings_screen.internet_info, "open", true );
    robot_communication_settings_screen.got_modem_settings( robot_communication_settings_screen.modem_settings, "open", true );

    robot_communication_settings_screen.displayed_modem_settings.sim = parseInt( $( "#wifi_settings_screen #modem_tab_content #modem_card_select" ).val() );
    robot_communication_settings_screen.displayed_modem_settings.setup = parseInt( $( "#wifi_settings_screen #modem_tab_content #modem_setup_select" ).val() );
    robot_communication_settings_screen.displayed_modem_settings.apn = $( "#wifi_settings_screen #modem_tab_content #modem_apn" ).val();
  },

  displayed_ntrip_settings: {},
  open_ntrip_settings: function()
  {
    robot_communication_settings_screen.get_ntrip_info();

    robot_communication_settings_screen.got_ntrip_info( robot_communication_settings_screen.ntrip_info, "open", true );

    robot_communication_settings_screen.displayed_ntrip_settings.server = $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).val();
    robot_communication_settings_screen.displayed_ntrip_settings.port = parseInt( $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).val() );
    robot_communication_settings_screen.displayed_ntrip_settings.username = $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).val();
    robot_communication_settings_screen.displayed_ntrip_settings.password = $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).val();
    robot_communication_settings_screen.displayed_ntrip_settings.mountpoint = $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).val();
  },
  displayed_bluetooth_settings: {},
  open_bluetooth_settings: function()
  {
    robot_communication_settings_screen.got_bt_info( robot_communication_settings_screen.bt_info, "open", true );

    robot_communication_settings_screen.scan_bluetooth();
    robot_communication_settings_screen.update_bluetooth_tab_content();

    robot_communication_settings_screen.displayed_bluetooth_settings.mac = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_mac_value" ).val();
    robot_communication_settings_screen.displayed_bluetooth_settings.btname = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_name_value" ).val();
    robot_communication_settings_screen.displayed_bluetooth_settings.port = parseInt( $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_port_value" ).val() );
    robot_communication_settings_screen.displayed_bluetooth_settings.ping = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_pin_value" ).val();
    robot_communication_settings_screen.displayed_bluetooth_settings.msg = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_initstring_value" ).val();
  },

  internet_info: {},
  get_internet_info: function()
  {
    communication_controller.send( 'get_internet_info', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  got_internet_info: function( info, source, force_update )
  {
    robot_communication_settings_screen.internet_info = info;

    event_controller.call_callback("got_internet_info", info);
    logger.debug("Internet info", info);

    if( !settings_screeen_controller.is_open )
      return;

    
    // robot_communication_settings_screen.got_ntrip_info( robot_communication_settings_screen.ntrip_info );
    
  },
  modem_settings: {},
  get_modem_info: function()
  {
    communication_controller.send( 'get_modem_settings', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  got_modem_settings: function( new_settings, source, force_update )
  {
    try {
      if(new_settings["Available operators"] && typeof(new_settings["Available operators"]) === 'string')
        new_settings["Available operators"] = new_settings["Available operators"].replace( /"/g, "" ).split( "," );
    }
    catch(e)
    {
      console.warn(e);
    }

    var old_settings = robot_communication_settings_screen.modem_settings;
    robot_communication_settings_screen.modem_settings = new_settings;

    event_controller.call_callback("got_modem_settings", new_settings);
    logger.debug("Modem settings", new_settings);

    if( !settings_screeen_controller.is_open )
      return;

    if( !robot_controller.robot_has_capability( "modem_info" ) )
    {
      $( "#wifi_settings_screen #modem_tab_content #modem_card_row" ).addClass( "gone" );
      $( "#wifi_settings_screen #modem_tab_content #modem_setup_row" ).addClass( "gone" );
      $( "#wifi_settings_screen #modem_tab_content #sim_apn_row" ).addClass( "gone" );
      return;
    }
    else
    {
      $( "#wifi_settings_screen #modem_tab_content #modem_card_row" ).removeClass( "gone" );
      $( "#wifi_settings_screen #modem_tab_content #modem_setup_row" ).removeClass( "gone" );
      $( "#wifi_settings_screen #modem_tab_content #sim_apn_row" ).removeClass( "gone" );
    }

    logger.debug( "got_modem_settings" );

    if( !force_update &&
      (old_settings.modem === robot_communication_settings_screen.modem_settings.modem &&
        old_settings.carrierprofile === robot_communication_settings_screen.modem_settings.carrierprofile &&
        old_settings.activesim === robot_communication_settings_screen.modem_settings.activesim &&
        old_settings.activecarrier === robot_communication_settings_screen.modem_settings.activecarrier &&
        old_settings.simcount === robot_communication_settings_screen.modem_settings.simcount &&
        old_settings.sim === robot_communication_settings_screen.modem_settings.sim &&
        old_settings.apn === robot_communication_settings_screen.modem_settings.apn) )
      return;

    // UI will not update if page is open
    if( robot_communication_settings_screen.is_open && !force_update )
      return;

    logger.debug( "updating modem info on screen" );

    // If no modem detected, modem tab is removed
    if( false && !robot_communication_settings_screen.modem_settings.modemmodel || !robot_controller.robot_has_capability( "modem_info" ) )
    {
      $( "#wifi_settings_screen #modem_tab_content" ).addClass( "gone" );
      $( "#wifi_settings_screen #wifi_tab_content" ).addClass( "first-child" );
    }
    else
    {
      $( "#wifi_settings_screen #modem_tab_content" ).removeClass( "gone" );
      $( "#wifi_settings_screen #wifi_tab_content" ).removeClass( "first-child" );
    }

    

    // Write SIM info
    $( "#communication_settings_screen #modem_card_select" ).html( "" );
    if( robot_communication_settings_screen.modem_settings.simcount > 1 )
    {
      $( "#communication_settings_screen #modem_card_select" ).removeClass( "gone" );
      $( "#communication_settings_screen #modem_card_info" ).addClass( "gone" );
      for( var i = 0; i < robot_communication_settings_screen.modem_settings.simcount; i++ )
      {
        var letter = String.fromCharCode( 65 + i );
        if( robot_communication_settings_screen.modem_settings.sim[letter].state === "None" )
        {
          continue;
        }
        var content = '<option id="modem_card_select_sim' + letter + '" value="' + i + '"';
        content += robot_communication_settings_screen.modem_settings.activesim === letter ? ' selected' : '';
        content += robot_communication_settings_screen.modem_settings.sim[letter].state !== "Available" ? ' disabled' : '';
        content += '>' + letter + ': ' + robot_communication_settings_screen.get_sim_info( letter ) + '</option>';
        $( "#communication_settings_screen #modem_card_select" ).append( content );
      }
    }
    else
    {
      if( robot_communication_settings_screen.modem_settings.activesim )
      {
        $( "#communication_settings_screen #modem_card_info" ).html( robot_communication_settings_screen.get_sim_info( robot_communication_settings_screen.modem_settings.activesim ) );
      }
      else
      {
        $( "#communication_settings_screen #modem_card_info" ).html( "" );
      }
      $( "#communication_settings_screen #modem_card_select" ).addClass( "gone" );
      $( "#communication_settings_screen #modem_card_info" ).removeClass( "gone" );
      if( robot_communication_settings_screen.modem_settings.activesim )
      {
        $( "#communication_settings_screen #modem_card_select" ).append( '<option value="' + (robot_communication_settings_screen.modem_settings.activesim.charCodeAt( 0 ) - 65) + '" selected>' + robot_communication_settings_screen.modem_settings.activesim + '</option>' );
      }
    }
    
  },
  get_sim_info: function( lett )
  {
    var vendor = robot_communication_settings_screen.get_sim_vendor( robot_communication_settings_screen.modem_settings.sim[lett].imsi );

    var content = "";
    switch( robot_communication_settings_screen.modem_settings.sim[lett].state )
    {
      case "Empty":
        content += "Empty";
        break;
      case "Available":
        content += robot_communication_settings_screen.modem_settings.sim[lett].icc;
        content += " " + vendor;
        break;
      case "ErrorGeneral":
      case "ErrorPinRequired":
      case "ErrorPinWrong":
      case "ErrorPuk":
        content += robot_communication_settings_screen.modem_settings.sim[lett].icc;
        content += " " + vendor;
        content += " (ERROR)";
        break;
      default:
        content += "Error";
    }
    return content;
  },
  get_sim_vendor: function( imsi )
  {
    var vendor = "(";
    console.warn( "IMSI->Vendor lookup not implemented. Using IMSI number instead." );
    vendor += imsi;
    vendor += ")";
    // return vendor;
    return "";
  },
  save_modem_settings: function()
  {
    logger.debug( "save_modem_settings" );
    var sim = Number( $( "#wifi_settings_screen #modem_tab_content #modem_card_select" ).val() );
    var setup = Number( $( "#wifi_settings_screen #modem_tab_content #modem_setup_select" ).val() );
    var apn = $( "#wifi_settings_screen #modem_tab_content #modem_apn" ).val();

    if( sim || setup || apn )
    {
      communication_controller.send( 'set_modem_settings', {
        robot: robot_controller.chosen_robot_id,
        modem_settings: {
          active_sim: sim,
          modem_setup: setup,
          apn: apn
        }
      }, "all", 10 );
      robot_communication_settings_screen.pop_up_once( "Setting up modem", "updated_modem" );
    }
  },
  wifi_settings: {},
  get_wifi_settings: function()
  {
    communication_controller.send( 'get_wifi_settings', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  got_wifi_settings: function( new_settings, source, force_update )
  {
    var old_settings = robot_communication_settings_screen.wifi_settings;
    robot_communication_settings_screen.wifi_settings = new_settings;

    event_controller.call_callback("got_wifi_settings", new_settings);
    logger.debug("Wifi settings", new_settings);

    if( !settings_screeen_controller.is_open )
      return;

    if( !force_update && old_settings.ssid === robot_communication_settings_screen.wifi_settings.ssid && old_settings.psk === robot_communication_settings_screen.wifi_settings.psk )
      return;

    // UI will not update if page is open
    if( robot_communication_settings_screen.is_open && !force_update )
      return;

    logger.debug( "updating WiFi info on screen" );
    let ssid = robot_communication_settings_screen.wifi_settings.ssid;
    if(!ssid || ssid.toLowerCase() === "no conn" || ssid.toLowerCase() === "n/a")
      ssid = "";
    let ssid_changed = false;
    if(ssid !== $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid" ).val())
      ssid_changed = true;
    if(ssid)
      $( "#wifi_settings_screen #wifi_tab_content #wifi_ssid" ).val( ssid );
    
    if(ssid_changed)
    {
      let psk = robot_communication_settings_screen.wifi_settings.psk;
      if(!psk || psk.toLowerCase() === "no conn")
        psk = "";
      if(ssid && psk)
        $( "#wifi_settings_screen #wifi_tab_content #wifi_password" ).val( psk );
    }
  },
  ntrip_info: {},
  get_ntrip_info: function()
  {
    communication_controller.send( 'get_ntrip_settings', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  got_ntrip_info: function( info, source, force_update )
  {
    robot_communication_settings_screen.ntrip_info = info;
    if( !settings_screeen_controller.is_open )
      return;

    logger.debug( "got_ntrip_info" );
    $( "#communication_settings_screen #ntrip_tab_content #ntrip_choose_mountpoint_button" ).toggleClass( "gone", !(info.available_mountpoints && info.available_mountpoints.length));

    if( info["Wrong NTRIP server"] && robot_communication_settings_screen.internet_info["Internet route"] !== "No conn" )
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).addClass( "warning_outline" );
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).addClass( "warning_outline" );
    }
    else
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).removeClass( "warning_outline" );
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).removeClass( "warning_outline" );
    }

    if( info["Wrong NTRIP login"] )
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).addClass( "warning_outline" );
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).addClass( "warning_outline" );
    }
    else
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).removeClass( "warning_outline" );
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).removeClass( "warning_outline" );
    }

    if( info["Wrong NTRIP mountpoint"] )
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).addClass( "warning_outline" );
    }
    else
    {
      $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).removeClass( "warning_outline" );
    }

    if( robot_communication_settings_screen.internet_info["Internet route"] === "No conn" )
      $( "#communication_settings_screen #ntrip_info_message" ).html( translate["NTRIP ERROR: No internet"] );
    else
    {
      if( info["Wrong NTRIP server"] )
        $( "#communication_settings_screen #ntrip_info_message" ).html( translate["NTRIP ERROR: Server not available"] );
      else if( info["Wrong NTRIP login"] )
        $( "#communication_settings_screen #ntrip_info_message" ).html( translate["NTRIP ERROR: Username or password wrong"] );
      else if( info["Wrong NTRIP mountpoint"] )
        $( "#communication_settings_screen #ntrip_info_message" ).html( translate["NTRIP ERROR: Wrong mount point"] );
      else
        $( "#communication_settings_screen #ntrip_info_message" ).html( "" );
    }

    // UI will not update if page is open
    if( robot_communication_settings_screen.is_open, !force_update )
      return;

    logger.debug( "updating NTRIP info on screen" );

    $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).val( "" + (info.server ? info.server : "") );
    $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).val( "" + (info.port ? info.port : "") );
    $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).val( "" + (info.username ? info.username : "") );
    $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).val( "" + (info.password ? info.password : "") );
    $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).val( "" + (info.mountpoint ? info.mountpoint : "") );

  },
  set_ntrip: function()
  {
    var server = $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).val();
    var port = $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).val();
    var username = $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).val();
    var password = $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).val();
    var mountpoint = $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).val();

    if( server || port || username || password || mountpoint )
    {

      var ntrip_settings = {
        ntrip_address: server,
        ntrip_port: parseInt( port ),
        ntrip_username: username,
        ntrip_password: password,
        ntrip_mountpoint: mountpoint
      };

      communication_controller.send( 'set_ntrip_settings', {
        robot: robot_controller.chosen_robot_id,
        ntrip_settings: ntrip_settings
      }, "all", 10 );

      robot_communication_settings_screen.pop_up_once( "Setting up ntrip", "updated_ntrip" );

    }

  },
  get_mountpoints: function()
  {
    var url = "http://" + robot_communication_settings_screen.ntrip_info.server + ":" + robot_communication_settings_screen.ntrip_info.port;
    var data = "GET / HTTP/1.1\r\n" +
      "Host: " + robot_communication_settings_screen.ntrip_info.server + "\r\n" +
      "Ntrip-Version: Ntrip/2.0\r\n" +
      "User-Agent: NTRIP KeyResearch/0.1\r\n" +
      "Connection: close\r\n\r\n";
    var request = new XMLHttpRequest();
    request.open( 'GET', url );
    request.responseType = 'text';
    request.timeout = 2000;
    //request.setRequestHeader( "Host", robot_communication_settings_screen.ntrip_info.server );
    request.setRequestHeader( "Ntrip-Version", "Ntrip/2.0" );
    //request.setRequestHeader( "User-Agent", "NTRIP KeyResearch/0.1" );
    //request.setRequestHeader( "Connection", "close" );

    request.onprogress = function()
    {
      console.log( request.response );
    };
    request.ontimeout = function()
    {
      console.log( "timeout" );
    };
    request.loadstart = function()
    {
      console.log( "loadstart" );
    };
    request.onabort = function()
    {
      console.log( "onabort" );
    };
    request.onerror = function()
    {
      console.log( "onerror" );
    };
    request.onload = function()
    {
      console.log( "onload" );
    };
    request.onloadend = function()
    {
      console.log( "onloadend" );
    };
    request.onreadystatechange = function()
    {
      console.log( "onreadystatechange" );
    };
    request.send( data );
    /*
     $.get( url, data, function ( data ) {
     alert( "Data Loaded: " + data );
     } );
     */
    /*
     $.ajax( {
     url: url,
     data: data,
     success: function ( resp ) {
     console.log( resp );
     }
     } );
     */
  },

  bt_info: {},
  get_bt_info: function()
  {

  },
  got_bt_info: function( info, source, force_update )
  {
    robot_communication_settings_screen.bt_info = info;

    if( !settings_screeen_controller.is_open )
      return;

    // UI will not update if page is open
    if( robot_communication_settings_screen.is_open && !force_update )
      return;

    logger.debug( "updating BT info on screen" );

    //$( "#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device" ).val( info.mac );

    $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_mac_value" ).val( "" + (info.mac ? info.mac : "") );
    $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_name_value" ).val( "" + (info.btname ? info.btname : "") );

    $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_port_value" ).val( info.port ? info.port : 1 );
    $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_pin_value" ).val( "" + (info.pin ? info.pin : "") );
    $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_initstring_value" ).val( "" + (info.message ? info.message : "") );

    //popup_screen_controller.close( "#info_waiting_popup" );
  },
  set_bt_info: function()
  {
    //var mac = $( "#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device" ).val();
    var mac = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_mac_value" ).val();
    var btname = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_name_value" ).val();

    var port = parseInt( $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_port_value" ).val() );
    if( !port )
      port = 1;
    var ping = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_pin_value" ).val();
    var msg = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_initstring_value" ).val();

    if( mac || btname || port || ping || msg )
    {

      var data = {
        mac: mac,
        btname: btname,
        port: port,
        message: msg,
        apply: true,
        connect: true
      };
      if( msg )
        data.send = true;
      logger.debug( data );
      communication_controller.send( 'set_bluetooth_info', {
        robot: robot_controller.chosen_robot_id,
        bt_settings: data
      }, "all", 10 );

      robot_communication_settings_screen.pop_up_once( "Setting up bluetooth", "bt_device_info" );
    }

  },
  scan_bluetooth: function()
  {
    communication_controller.send( 'start_bluetooth_scan', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  nb: [ ],
  got_scan_result: function( data )
  {
    let nb = data["nearby"].split( "\r" ).map( function( d )
    {
      return d.split( "\n" );
    } );
    robot_communication_settings_screen.nb = nb;

    robot_communication_settings_screen.nb = robot_communication_settings_screen.nb.filter( ( d ) =>
    {
      return d.length === 2;
    } ).map( d => {
      return {
        mac: d[0],
        name: d[1]
      };
    } );

    logger.debug( "bluetooth_scan_result", robot_communication_settings_screen.nb );

    event_controller.call_callback( "got_scan_result", robot_communication_settings_screen.nb );
    robot_communication_settings_screen.update_bluetooth_tab_content();

  },
  update_bluetooth_tab_content: function()
  {

    const saved_devices = robot_communication_settings_screen.bluetooth_device_settings;
    const found_devices = robot_communication_settings_screen.nb;

    q$( "#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device" ).empty();
    q$("#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device").append(`<option value="" selected>${translate["Select device"]}</option>`);

    const saved_devices_group = $.parseHTML(`<optgroup label="${translate["Saved devices"]}"></optgroup>`);
    const found_devices_group = $.parseHTML(`<optgroup label="${translate["Found devices"]}"></optgroup>`);

    if( saved_devices.length )
    {
      saved_devices.forEach((setting,idx)=>{
        let name;
        if(setting.btname && setting.mac)
        {
          name = `${setting.btname} (${setting.mac})`;
        }
        else if(setting.btname && !setting.mac)
        {
          name = setting.btname;
        }
        else if(!setting.btname && setting.mac)
        {
          name = setting.mac;
        }
        if(setting.port)
        {
          name += ` : ${setting.port}`;
        }
        if(setting.pin)
        {
          name += ` : ${setting.pin}`;
        }
        if(setting.msg)
        {
          name += ` : "${setting.msg}"`;
        }
        $(saved_devices_group).append(`<option value="saved-${idx}">${name}</option>`);
      });
      q$("#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device").append(saved_devices_group);
    }

    if( found_devices.length )
    {
      found_devices.forEach((setting,idx)=>{
        let name;
        if(setting.name && setting.mac)
        {
          name = `${setting.name} (${setting.mac})`;
        }
        else if(setting.name && !setting.mac)
        {
          name = setting.name;
        }
        else if(!setting.name && setting.mac)
        {
          name = setting.mac;
        }
        $(found_devices_group).append(`<option value="found-${idx}">${name}</option>`);
      });
    }
    else
    {
      $(found_devices_group).append(`<option disabled style="font-style:italic;">${translate["Searching for devices"]}</option>`);
    }
    q$("#communication_settings_screen #bluetooth_tab_content #select_bluetooth_device").append(found_devices_group);
  },
  choose_bluetooth_device(element)
  {
    const val = $(element).val();
    if(!val)
    {
      return;
    }
    const parts = val.split("-");
    const category = parts[0];
    const idx = parts[1];
    let setting;
    if(category === "saved")
    {
      setting = robot_communication_settings_screen.bluetooth_device_settings[idx];
      setting.message = setting.msg;
      delete setting.msg;
    }
    else if(category === "found")
    {
      setting = {
        'btname': robot_communication_settings_screen.nb[idx].name,
        'mac': robot_communication_settings_screen.nb[idx].mac
      };
    }
    if(setting)
    {
      robot_communication_settings_screen.got_bt_info(setting, null, true);
    }
    robot_communication_settings_screen.update_bluetooth_tab_content();
  },
  pop_up_once: function( header, callback_names = [], min_wait, spinner = false )
  {
    if( !header )
      header = translate["Saving data"];
    if( !min_wait )
      min_wait = 1000;

    callback_names = [callback_names].flat(); // If callback_names is string, put it in an array. Otherwise it is an array, then just flatten.

    var start = (new Date()).getTime();
    popup_screen_controller.open_info_waiter( header, "", "", spinner );
    function done()
    {
      callback_names.forEach(callback_name=>{
        message_controller.events.remove_callback( callback_name, done );
      });
      message_controller.events.remove_callback( "not_online", done );
      var end = (new Date()).getTime();
      setTimeout( popup_screen_controller.close, min_wait - (end - start) );
    }
    callback_names.forEach(callback_name=>{
      message_controller.events.add_callback( callback_name, done );
    });
    message_controller.events.add_callback( "not_online", done );
  },

  validate_data: function( data )
  {
    let keys = Object.keys( data );
    keys.forEach( ( key ) => {
      if( (typeof (data[key]) === "string" && data[key] === "") || (typeof (data[key]) === "number" && isNaN( data[key] )) || typeof (data[key]) === "undefined" )
        delete data[key];
    } );

    return data;
  },
  save_settings: function()
  {
    let send_counter = 0;

    /*
     * Modem Settings
     */
    const save_modem_settings = () =>
    {
      var sim = parseInt( $( "#wifi_settings_screen #modem_tab_content #modem_card_select" ).val() );
      var setup = parseInt( $( "#wifi_settings_screen #modem_tab_content #modem_setup_select" ).val() );
      var apn = $( "#wifi_settings_screen #modem_tab_content #modem_apn" ).val();
  
      var modem_settings = {};
      if( !!sim && sim !== robot_communication_settings_screen.displayed_modem_settings.sim )
      {
        modem_settings.sim = sim;
        robot_communication_settings_screen.displayed_modem_settings.sim = sim;
      }
      if( !!setup && setup !== robot_communication_settings_screen.displayed_modem_settings.setup )
      {
        modem_settings.setup = setup;
        robot_communication_settings_screen.displayed_modem_settings.setup = setup;
      }
      if( !!apn && apn !== robot_communication_settings_screen.displayed_modem_settings.apn )
      {
        modem_settings.apn = apn;
        robot_communication_settings_screen.displayed_modem_settings.apn = apn;
      }
  
      modem_settings = robot_communication_settings_screen.validate_data( modem_settings );
  
      if( Object.keys( modem_settings ).length > 0 )
      {
        logger.debug( "save_modem_settings" );
        communication_controller.send( 'set_modem_settings', {
          robot: robot_controller.chosen_robot_id,
          modem_settings: modem_settings
        }, "all", 10 );
        robot_communication_settings_screen.pop_up_once( translate["Saving modem settings"], ["updated_modem"] );
        send_counter++;
      }
    };

    /*
     * NTRIP settings
     */
    const save_ntrip_settings = () =>
    {
      var server = $( "#communication_settings_screen #ntrip_tab_content #ntrip_server_input" ).val();
      var port = parseInt( $( "#communication_settings_screen #ntrip_tab_content #ntrip_port_input" ).val() );
      var username = $( "#communication_settings_screen #ntrip_tab_content #ntrip_username_input" ).val();
      var password = $( "#communication_settings_screen #ntrip_tab_content #ntrip_password_input" ).val();
      var mountpoint = $( "#communication_settings_screen #ntrip_tab_content #ntrip_mountpoint_input" ).val();
  
      var ntrip_settings = {};
      if( !!server && server !== robot_communication_settings_screen.displayed_ntrip_settings.server )
      {
        ntrip_settings.ntrip_address = server;
        robot_communication_settings_screen.displayed_ntrip_settings.server = server;
      }
      else
        ntrip_settings.ntrip_address = robot_communication_settings_screen.displayed_ntrip_settings.server;
  
      if( !!port && port !== robot_communication_settings_screen.displayed_ntrip_settings.port )
      {
        ntrip_settings.ntrip_port = port;
        robot_communication_settings_screen.displayed_ntrip_settings.port = port;
      }
      else
        ntrip_settings.ntrip_port = robot_communication_settings_screen.displayed_ntrip_settings.port;
  
      if( !!username && username !== robot_communication_settings_screen.displayed_ntrip_settings.username )
      {
        ntrip_settings.ntrip_username = username;
        robot_communication_settings_screen.displayed_ntrip_settings.username = username;
      }
      else
        ntrip_settings.ntrip_username = robot_communication_settings_screen.displayed_ntrip_settings.username;
  
      if( !!password && password !== robot_communication_settings_screen.displayed_ntrip_settings.password )
      {
        ntrip_settings.ntrip_password = password;
        robot_communication_settings_screen.displayed_ntrip_settings.password = password;
      }
      else
        ntrip_settings.ntrip_password = robot_communication_settings_screen.displayed_ntrip_settings.password;
  
      if( !!mountpoint && mountpoint !== robot_communication_settings_screen.displayed_ntrip_settings.mountpoint )
      {
        ntrip_settings.ntrip_mountpoint = mountpoint;
        robot_communication_settings_screen.displayed_ntrip_settings.mountpoint = mountpoint;
      }
      else
        ntrip_settings.ntrip_mountpoint = robot_communication_settings_screen.displayed_ntrip_settings.mountpoint;
  
      ntrip_settings = robot_communication_settings_screen.validate_data( ntrip_settings );
  
      if( Object.keys( ntrip_settings ).length > 0 )
      {
        logger.debug( "save_ntrip_settings" );
        communication_controller.send( 'set_ntrip_settings', {
          robot: robot_controller.chosen_robot_id,
          ntrip_settings: ntrip_settings
        }, "all", 10 );
  
        robot_communication_settings_screen.pop_up_once( translate["Saving NTRIP settings"], ["updated_ntrip"] );
        send_counter++;
  
      }
    };

    /*
     * BT settings
     */
    const save_bt_settings = () =>
    {
      var mac = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_mac_value" ).val();
      var btname = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_name_value" ).val();
      var port = parseInt( $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_port_value" ).val() );
  //    var ping = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_pin_value" ).val();
      var msg = $( "#communication_settings_screen #bluetooth_tab_content #bluetooth_initstring_value" ).val();
  
      var bluetooth_settings = {};
      if( !!mac && mac !== robot_communication_settings_screen.displayed_bluetooth_settings.mac )
      {
        bluetooth_settings.mac = mac;
        robot_communication_settings_screen.displayed_bluetooth_settings.mac = mac;
      }
      if( !!btname && btname !== robot_communication_settings_screen.displayed_bluetooth_settings.btname )
      {
        bluetooth_settings.btname = btname;
        robot_communication_settings_screen.displayed_bluetooth_settings.btname = btname;
      }
      if( !!port && port !== robot_communication_settings_screen.displayed_bluetooth_settings.port )
      {
        bluetooth_settings.port = port;
        robot_communication_settings_screen.displayed_bluetooth_settings.port = port;
      }
  //    if( !!ping && ping !== robot_communication_settings_screen.displayed_bluetooth_settings.ping ){
  //      bluetooth_settings.ping = ping;}
      if( !!msg && msg !== robot_communication_settings_screen.displayed_bluetooth_settings.msg )
      {
        bluetooth_settings.message = msg;
        robot_communication_settings_screen.displayed_bluetooth_settings.msg = msg;
      }
  
      bluetooth_settings = robot_communication_settings_screen.validate_data( bluetooth_settings );
  
      if( Object.keys( bluetooth_settings ).length > 0 )
      {
        
        logger.debug( "save_bt_settings" );
        if( !bluetooth_settings.port )
          bluetooth_settings.port = 1;
        
        robot_communication_settings_screen.bluetooth_device_settings = robot_communication_settings_screen.displayed_bluetooth_settings;
        bluetooth_settings.apply = true;
  
        if( bluetooth_settings.message )
          bluetooth_settings.send = true;
  
  
        communication_controller.send( 'set_bluetooth_info', {
          robot: robot_controller.chosen_robot_id,
          bt_settings: bluetooth_settings
        }, "all", 10 );
  
        robot_communication_settings_screen.pop_up_once( translate["Saving Bluetooth settings"], ["updated_bluetooth"] );
        send_counter++;
      }
    };

    /*
     * Do Save
     */
    false && save_modem_settings();
    true  && save_ntrip_settings();
    true  && save_bt_settings();
    if( send_counter > 1 )
      robot_communication_settings_screen.pop_up_once( translate["Saving communications"], ["updated_modem","updated_ntrip","updated_bluetooth"] );
  },



  set bluetooth_device_settings(setting)
  {
    const current_settings = robot_communication_settings_screen.bluetooth_device_settings;
    const currentIdx = current_settings.findIndex(current_setting=>
      Object.values(current_setting).equal(Object.values(setting))
    );
    if( currentIdx != -1 )
    {
      current_settings.splice(currentIdx,1);
    }
    else if(current_settings.length > 4)
    {
      current_settings.pop();
    }
    current_settings.unshift(setting);
    localStorage.setItem("bluetooth_device_settings", JSON.stringify(current_settings));
    robot_communication_settings_screen.update_bluetooth_tab_content();
  },

  get bluetooth_device_settings()
  {
    const ls = JSON.parse(localStorage.getItem("bluetooth_device_settings"));
    return ls ? ls : [];
  }


};

message_controller.events.add_callback( "internet_info", robot_communication_settings_screen.got_internet_info );
message_controller.events.add_callback( "ntrip_settings", robot_communication_settings_screen.got_ntrip_info );
message_controller.events.add_callback( "wifi_settings", robot_communication_settings_screen.got_wifi_settings );
message_controller.events.add_callback( "modem_setup", robot_communication_settings_screen.got_modem_settings );

message_controller.events.add_callback( "bluetooth_info", robot_communication_settings_screen.got_bt_info );
message_controller.events.add_callback( "bt_nearby", robot_communication_settings_screen.got_scan_result );
