/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global event_controller, robot_controller, popup_screen_controller, ntrip_settings_controller, communication_controller, message_controller, projection_controller, gps_controller, translate */

const baseStationScreenController = {
  _discover_interval: 0,
  _device_updater_interval: 0,
  _owned_base_stations: {},
  _devices_without_name: {},
  _base_station_fetcher: 0,

  open: function () {
    baseStationScreenController._devices_without_name = {};
    baseStationScreenController._owned_base_stations = {};

    baseStationScreenController.startDiscovery();
    baseStationScreenController.updateFoundList();
    baseStationScreenController.startBaseStationFetcher();
  },
  close: function () {
    baseStationScreenController.stopBaseStationFetcher();
    baseStationScreenController.stopDiscovery();
    baseStationScreenController.disconnectDevice();
  },
  startBaseStationFetcher: function () {
    baseStationScreenController.addCustomerBaseStations();
    baseStationScreenController._base_station_fetcher = setInterval(baseStationScreenController.addCustomerBaseStations, 10 * 1000);
  },
  stopBaseStationFetcher: function () {
    clearInterval(baseStationScreenController._base_station_fetcher);
  },
  gotCustomerBaseStations:function(msg_data)
  {
    msg_data.basestations.forEach(b => {

      if (b.type && (b.type !== "BS1" && !b.online)) {
        delete baseStationScreenController._owned_base_stations[b.id];
        return;
      }

      let base_bt_name = "" + b.id;
      while (base_bt_name.length < 8) {
        base_bt_name = "0" + base_bt_name;
      }

      try {
        b.position = JSON.parse(b.position);
      } catch (error) {
        b.position = [0, 0, 0];
      }
      if (!b.position) {
        b.position = [0, 0, 0];
      }
      let p = projection_controller.get_best_projector(gps_controller.last_position);
      let p1 = p.forward(gps_controller.last_position.slice(0, 2));
      let p2 = p.forward(b.position.slice(0, 2).reverse());
      p.release();
      let dist = p1.toVector().subtract(p2.toVector()).length;
      let tablet_dist = Math.ceil(dist / 50) * 50;

      let device = {
        name: base_bt_name,
        id: b.id,
        connected: b.online,
        data_is_flowing: b.dataIsFlowing,
        position: b.position,
        mac: b.mac,
        tablet_dist: tablet_dist,
        robot_status: "Not connected",
        robot_connected: false,
        setupable: false,
        type: b.type
      }

      if (device.type === "BS1"){
        device.address = device.mac;
        device.setupable = true;
      }

      if (ntrip_settings_controller.ntrip_settings.server === "ntrip.tinymobilerobots.com" &&
        ntrip_settings_controller.ntrip_settings.port === 2102 &&
        ntrip_settings_controller.ntrip_settings.username === "tinybox" + robot_controller.chosen_robot.id &&
        ntrip_settings_controller.ntrip_settings.password === "tinybox" + robot_controller.chosen_robot.id &&
        ntrip_settings_controller.ntrip_settings.mountpoint === (device.id + "")
      ) {
        device.robot_status = "Connected to base station";
        device.robot_connected = true;
      }

      if (!baseStationScreenController._owned_base_stations[device.id])
        baseStationScreenController._owned_base_stations[device.id] = device;
      else {

        baseStationScreenController._owned_base_stations[device.id]["connected"] = b.online;
        baseStationScreenController._owned_base_stations[device.id]["data_is_flowing"] = b.dataIsFlowing;
        baseStationScreenController._owned_base_stations[device.id]["position"] = b.position;
        baseStationScreenController._owned_base_stations[device.id]["tablet_dist"] = tablet_dist;

      }
      
    });
    baseStationScreenController.updateFoundList();
  },
  addCustomerBaseStations: function () {
    communication_controller.send( "get_base_stations", {customerId: login_screen_controller.customer_id}, "cloud" );
  },
  startDiscovery: function()
  {
    if ( !window.networking ) {
      return;
    }
    networking.bluetooth.startDiscovery();
    networking.bluetooth.onDeviceAdded.addListener( baseStationScreenController.foundNewBluetoothDevice );

    $( "#base_station_screen #myBar" ).css( "transition", "margin-left 0s" );
    $( "#base_station_screen #myBar" ).css( "margin-left", "-5%" );
    setTimeout( () => {
      $( "#base_station_screen #myBar" ).css( "transition", "margin-left 20s linear 0s" );
      $( "#base_station_screen #myBar" ).css( "margin-left", "100%" );
    }, 0 );

    baseStationScreenController._discover_interval = setInterval( function()
    {
      $( "#base_station_screen #myBar" ).css( "transition", "margin-left 0s" );
      $( "#base_station_screen #myBar" ).css( "margin-left", "-5%" );
      setTimeout( () => {
        $( "#base_station_screen #myBar" ).css( "transition", "margin-left 20s linear 0s" );
        $( "#base_station_screen #myBar" ).css( "margin-left", "100%" );
      }, 0 );

      baseStationScreenController.updateFoundList();
      networking.bluetooth.stopDiscovery();
      networking.bluetooth.startDiscovery();
    }, 20 * 1000 );
  },
  stopDiscovery: function()
  {
    if ( !window.networking ) {
      return;
    }
    clearInterval( baseStationScreenController._discover_interval );
    networking.bluetooth.stopDiscovery();
    networking.bluetooth.onDeviceAdded.removeListener( baseStationScreenController.foundNewBluetoothDevice );
  },
  checkForBasestaionDeviceName: function( device_name )
  {
    return baseStationScreenController.checkForV1ComnavBase(device_name) || baseStationScreenController.checkForV2ComnavBase(device_name) || baseStationScreenController.checkForTmrBase(device_name);
  },
  checkForV1ComnavBase: function( device_name )
  {
    return device_name && device_name.indexOf( "tinybox" ) === -1 && device_name.length === 8 && device_name[0] === "0" && parseInt( device_name );
  },
  checkForV2ComnavBase: function( device_name )
  {
    return device_name && device_name.indexOf( "tinybox" ) === -1 && device_name.length === 9 && device_name[0] === "T" && parseInt( device_name.substring(1) )
  },
  checkForTmrBase: function( device_name )
  {
    return device_name && device_name.indexOf( "tinybox" ) === 0;
  },
  makeDeviceId: function(device_name)
  {
    let try_id = device_name;
    while (!parseInt(try_id)) {
      try_id = try_id.substring(1);
    }
    return parseInt(try_id);
  },
  foundNewBluetoothDevice: function( device )
  {
    device.setupable = true;
    baseStationScreenController.foundNewDevice(device);
  },
  foundNewDevice: function( device )
  {
    if ( device.name && baseStationScreenController.checkForBasestaionDeviceName(device.name) ) {
      device.id = baseStationScreenController.makeDeviceId( device.name );
      device.count_down = 3;
      if ( !baseStationScreenController._owned_base_stations[device.id] || !baseStationScreenController._owned_base_stations[device.id].address ) {
        if ( baseStationScreenController._owned_base_stations[device.id] ) {
          baseStationScreenController._owned_base_stations[device.id].address = device.address;
          baseStationScreenController._owned_base_stations[device.id].id = device.id;
          baseStationScreenController._owned_base_stations[device.id].count_down = device.count_down;
          baseStationScreenController._owned_base_stations[device.id].setupable = true;
          device = baseStationScreenController._owned_base_stations[device.id];
        }

        baseStationScreenController.updateFoundList();
      }
    }
    else
      baseStationScreenController._devices_without_name[device.address] = device;
  },
  updateRobotStatusOnFoundDevice: function( device, callback )
  {
    if ( ntrip_settings_controller.ntrip_settings.server === "ntrip.tinymobilerobots.com" &&
      ntrip_settings_controller.ntrip_settings.port === 2102 &&
      ntrip_settings_controller.ntrip_settings.username === "tinybox" + robot_controller.chosen_robot.id &&
      ntrip_settings_controller.ntrip_settings.password === "tinybox" + robot_controller.chosen_robot.id &&
      ntrip_settings_controller.ntrip_settings.mountpoint === (device.id + "")
      )
    {
      device.robot_is_setup = true;
      communication_controller.send( "get_device_data", {device_type: 1, device_id: robot_controller.chosen_robot.id,
        keys: [ "connected", "data_is_flowing", "position", "apn", "user_state", "time_since_last_ntrip" ]}, "cloud" );
      function got_device_data( data )
      {
        if ( data.device_type === 1 && data.device_id === robot_controller.chosen_robot.id ) {
          let working = ("MAX timeout" !== data.device_data.time_since_last_ntrip) && data.device_data.time_since_last_ntrip;
          if ( working ) {
            device.robot_status = "Connected to base station";
          } else {
            device.robot_status = "Waiting for signal";
          }
          message_controller.events.remove_callback( "get_device_data", got_device_data );
          if ( callback ) {
            callback();
          }
        }
      }
      message_controller.events.add_callback( "get_device_data", got_device_data );
    }
    else
    {
      device.robot_status = "Not connected";
      device.robot_is_setup = false;
      if ( callback ) {
        callback();
      }
    }
  },
  
  setConnectedRobotInBasemode: function()
  {
    robot_controller.base_mode();

    communication_controller.send( "save_device_data", {device_type: 3, device_id: robot_controller.chosen_robot.id, key: "customer", val: login_screen_controller.customer_id}, "cloud" );
    //communication_controller.send( "save_device_data", {device_type: 3, device_id: robot_controller.chosen_robot.id, key: "Robot type", val: value?? }, "cloud" );

    baseModeScreenController.base_mode_info_data["Basestation manager state"] = "Idle";
    baseModeScreenController.open();
  },
  updateFoundList: function()
  {
    
    var html = "";
    
    if (robot_controller.robot_has_capability("base_mode") && (login_screen_controller.user_level === user_level["DEALER"] || login_screen_controller.user_level === user_level["DEVELOPER"])) {
      html += '<div id="set_current_robot_in_base_mode" style="text-align: right;">';
      html += '<button onclick="baseStationScreenController.setConnectedRobotInBasemode()" class="dark">' + translate["basemodeStartButtonText"] + '</button>';
      html += '</div>';
    }
    
    Object.values( baseStationScreenController._owned_base_stations ).forEach( ( device ) =>
    {
      let device_html = '<div style="background-color: white;width: 95%;padding-left: 1em;padding-top: 1;border: thick;border-color: black;border-style: solid;margin-bottom: 25px;">';
      device_html += '<img class="close_button_popup_icon" src="img/icons/edit_black.png" alt="" onclick="baseStationScreenController.enableAdvanceMode(' + device.id + ')" style="position: initial;">';
      device_html += '<h1>' + translate["Base station"] + ' ' + device.id + '</h1>';
      device_html += '<table style="width: 100%;"><tbody><tr><th style="text-align: left;">';
      //device_html += '<h3>SN: ' + device.id + '</h3>';

      if ( device.connected && device.data_is_flowing ) {
        device_html += '<h3>' + translate["Base station status: Operational"] + '</h3>';
      } else if ( !device.connected && !device.data_is_flowing && !device.settings_changed ) {
        device_html += '<h3>' + translate["Base station status: Unknown"] + '</h3>';
      } else if ( !device.connected && !device.data_is_flowing && device.settings_changed ) {
        device_html += '<h3>' + translate["Base station status: Connecting to server"] + '</h3>';
      } else if ( !device.connected ) {
        device_html += '<h3>' + translate["Base station status: Offline"] + '</h3>';
      } else if ( !device.data_is_flowing ) {
        device_html += '<h3>' + translate["Base station status: Not sending data"] + '</h3>';
      }


      switch( device.robot_status )
      {
        case "Connected to base station":
          device_html += '<h3>' + translate["Robot %1s: Connected to base station %2s"].format( robot_controller.chosen_robot.name, device.id ) + '</h3>';
          break;
        case "Waiting for signal":
          device_html += '<h3>' + translate["Robot %1s: Waiting for signal from base station %2s"].format( robot_controller.chosen_robot.name, device.id ) + '</h3>';
          break;
        case "Not connected":
          device_html += '<h3>' + translate["Robot %1s: Not connected to base station %2s"].format( robot_controller.chosen_robot.name, device.id ) + '</h3>';
          break;
        default:
          device_html += '<h3>Robot ' + robot_controller.chosen_robot.name + " is " + device.robot_status + '</h3>';
          break;
      }


      if ( device.advance_mode ) {
        device_html += '<h3>' + translate["Distance to base station: less than %1s"].format( device.tablet_dist.meter2unit().round() + " " + translate_unit() ) + '</h3>';
        //device_html += '<h3>APN: ' + device.apn + '</h3>';
      }

      device_html += '</th><th style="text-align: right;">';
      if (device.setupable && !device.type) {
        device_html += '<button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="baseStationScreenController.connectAndSetup(' + device.id + ')">' + translate["Setup"] + '</button><br>';
      }

      let disable_connect_button = device.robot_is_setup || device.robot_connected;
      device_html += '<button ' + (disable_connect_button ? "disabled " : "") + 'style="width:150px" onclick="baseStationScreenController.setupRobotToBasestation(' + device.id + ')">' + translate["Connect Robot"] + '</button>';
      
      if (device.setupable && device.type === "BS1") {
        device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="tmrBaseStationHandlerScreen.open(' + device.id + ')">' + translate["Setup"] + '</button>';
      }
      if ( device.advance_mode && device.setupable  && !device.type) {
        device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="baseStationScreenController.connectAndReset(' + device.id + ')" class="red">' + translate["Reset"] + '</button>';
        device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="baseStationScreenController.connectAndSetupWithApn(' + device.id + ')" class="red">Setup with APN</button>';
        device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" class="gone" onclick="baseStationScreenController.askForApn(' + device.id + ')" class="red">' + translate["Set APN"] + '</button>';
        if ( device.advance_mode ) {
          device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="baseStationScreenController.connectAndOpenConsole(' + device.id + ')" class="red">Debug</button>';
        }
      }
      if ( device.advance_mode ) {
        device_html += '<br><button ' + (device.address ? "" : "disabled ") + 'style="width:150px" onclick="baseStationScreenController.connectAndOpenConsole(' + device.id + ')" class="red">Debug</button>';
      }

      device_html += '</th></tr></tbody></table></div>';
      html += device_html;
    } );
    if ( !html ) {
      html = "<h3>" + translate["Searching for nearby base stations"] + "</h3>";
    }

    $( "#base_station_screen #found_devices" ).html(html);
  },
  enableAdvanceMode( id )
  {
    baseStationScreenController._owned_base_stations[id].advance_mode = !baseStationScreenController._owned_base_stations[id].advance_mode;
    baseStationScreenController.updateFoundList();
  },
  connected_device: false,
  connectTo: function( id )
  {
    baseStationScreenController.disconnectDevice();
    let device = baseStationScreenController._owned_base_stations[id];
    if (device.type === "BS1") {
      baseStationScreenController.connected_device = new TmrBaseStation(device.address);
    } else {
      if (device.name[0] === "R") {
        baseStationScreenController.connected_device = new HarxonBaseStationBluetoothConnection(device.address);
      } else {
        baseStationScreenController.connected_device = new ComnavBaseStationBluetoothConnection(device.address);
      }
      baseStationScreenController.connected_device.serial_number = baseStationScreenController.makeDeviceId(device.name);
    }
    baseStationScreenController.connected_device.start();
    baseStationScreenController.updateFoundList();

  },
  connectAndOpenConsole: function( id )
  {
    baseStationScreenController.connectTo( id );
    baseStationConsole.open();
  },
  askForApn: function( id )
  {
    let new_apn = prompt( "APN:" );
    if ( new_apn ) {
      baseStationScreenController.connectAndSetApn( id, new_apn );
    }
  },
  connectAndSetApn: function( id, new_apn )
  {
    popup_screen_controller.open_info_waiter( "Connecting to base station" );
    baseStationScreenController.connectTo( id );
    function setup_base_station()
    {
      popup_screen_controller.open_info_waiter( "Setting new APN" );
      setTimeout( () => {
        baseStationScreenController.connected_device.set_apn( new_apn, 1, 1, success => {
          baseStationScreenController._owned_base_stations[baseStationScreenController.connected_device.serial_number].settings_changed = true;
          communication_controller.send( "save_device_data", {device_type: 3, device_id: baseStationScreenController.connected_device.serial_number, key: "apn", val: new_apn}, "cloud" );
          baseStationScreenController.disconnectDevice();
          popup_screen_controller.close();
          baseStationScreenController.updateFoundList();

        } );
      }, 2000 );
    }
    baseStationScreenController.connected_device.events.add_callback( "ready", setup_base_station, true );
  },
  connectAndSetupWithApn:function( id )
  {
    let apn = prompt( "apn:" );
    baseStationScreenController.connectAndSetup( id , apn );
  },
  connectAndSetup: function( id, apn )
  {
    popup_screen_controller.open_info_waiter( "Connecting to base station" );
    baseStationScreenController.connectTo( id );
    function setup_base_station()
    {
      baseStationScreenController.connected_device.events.remove_callback( "ready", setup_base_station );
      baseStationScreenController.justSetup(apn);
    }
    baseStationScreenController.connected_device.events.add_callback( "ready", setup_base_station, true );
  },
  justSetup: function(apn){
    function base_station_setup_done()
    {
      baseStationScreenController._owned_base_stations[baseStationScreenController.connected_device.serial_number].settings_changed = true;
      baseStationScreenController.disconnectDevice();
      baseStationScreenController.updateFoundList();
    }
    baseStationScreenController.connected_device.events.add_callback( "base_setup", base_station_setup_done, true );
    baseStationScreenController.setupBasestation( apn );
  },
  connectAndReset: function( id )
  {
    popup_screen_controller.open_info_waiter( "Resetting base station" );
    baseStationScreenController.connectTo( id );
    baseStationScreenController.connected_device.events.add_callback( "connected", function()
    {
      setTimeout(()=>{
        baseStationScreenController.connected_device.send( "freset" );
        baseStationScreenController.connected_device.events.add_callback( "connected", function()
        {
          baseStationScreenController.disconnectDevice();
          popup_screen_controller.close();
        }, true );
      }, 4000);
    }, true );
  },
  disconnectDevice: function()
  {
    if ( baseStationScreenController.connected_device ) {
      baseStationScreenController.connected_device.delete();
    }
    baseStationScreenController.connected_device = false;
    baseStationScreenController.updateFoundList();
  },
  setupBasestation: function( apn )
  {
    baseStationScreenController.connected_device.setup( apn );
    popup_screen_controller.open_info_waiter( "Configuring base station" );
    baseStationScreenController.connected_device.events.add_callback( "base_setup", function()
    {
      popup_screen_controller.close();
    }, true );
  },
  setupRobotToBasestation: function( id )
  {
    var ntrip_settings = {
      ntrip_address: "ntrip.tinymobilerobots.com",
      ntrip_port: 2102,
      ntrip_username: "tinybox" + robot_controller.chosen_robot.id,
      ntrip_password: "tinybox" + robot_controller.chosen_robot.id,
      ntrip_mountpoint: id
    };
    communication_controller.send( 'set_ntrip_settings', {
      robot: robot_controller.chosen_robot_id,
      ntrip_settings: ntrip_settings
    }, "all", 10 );
    popup_screen_controller.pop_up_once( "Sending ntrip to robot", "updated_ntrip", 2000 );
  }
};
$( document ).ready( function()
{
  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if ( settings_screen_name === "base_station_screen" ) {
      baseStationScreenController.open();
    }
  } );
  event_controller.add_callback( "close_settings_menu", function( settings_screen_name )
  {
    if ( settings_screen_name === "base_station_screen" ) {
      baseStationScreenController.close();
    }
  } );
} );

class BaseStationBluetooth extends BluetoothConnection
{
  constructor( mac )
  {
    super( mac );
    this.position = [ 0, 0, 0, 0, 0 ];
    this.serial_number = "";
  }

  find_gpgga( data )
  {
    if ( data.indexOf( "$GPGGA" ) >= 0 ) // $GPGGA,074451.70,5601.4101743,N,00953.6407380,E,7,12,0.9,45.5574,M,39.443,M,,*25
    {
      let split = data.split( "$GPGGA" )[1].split( "," ); // [074451.70 , 5601.4101743 , N , 00953.6407380 , E , 7 , 12 , 0.9 , 45.5574 , M , 39.443 , M , , *25 ]
      if (parseInt(split[6]) >= 1)
      {
        let lat = ConvertDMSToDD( parseFloat( split[2] ), split[3] ); // DDmm.mm
        let lon = ConvertDMSToDD( parseFloat( split[4] ), split[5] );
        let alt = parseFloat( split[9] );
        let qlt = parseInt( split[6] );
        let sats = parseInt( split[7] );
        this.position = [ lat, lon, alt, qlt, sats ];
        this.events.call_callback( "position_updated", this.position );
      }else
        this.events.call_callback( "position_updated", [0,0,0,0,0] );
      return true;
    }
    return false;
  }

  set_ntrip( server, port, username, password, mount, averge_time = 10)
  {

    this.send( "fix none" );
    //this.send( "unlogall" );
    this.log_position();
    var this_class = this;
    var average = [ ];
    function position_upd( pos )
    {
      if ( pos[3] >= 1 && pos[3] < 7 )
      {
        average.push( pos );
        popup_screen_controller.open_info_waiter( "Configuring base station", "Collecting points " + average.length + "/" + averge_time );
        if ( average.length === averge_time )
        {
          this_class.events.remove_callback( "position_updated", position_upd );
          let pos_avr = average.reduce( ( t, e ) => {
            e.forEach( ( p, i ) => {
              t[i] += p;
            } );
            return t;
          } );
          pos_avr = pos_avr.map( e => {
            return e / average.length;
          } );
          popup_screen_controller.open_info_waiter( "Configuring base settings");
          this_class.setup_ntrip_base( server, port, username, password, mount, pos_avr );
        }
      }
    }
    popup_screen_controller.open_info_waiter( "Waiting for fix position" );
    this.events.add_callback( "position_updated", position_upd );
  }

  setup( apn = "3iot.com")
  {
    //this.set_apn( apn, 1, 1, success => {
      this.set_ntrip( "ntrip.tinymobilerobots.com", 2102, this.serial_number, "pass", this.serial_number );
      var this_device = this;
      baseStationScreenController.connected_device.events.add_callback( "base_setup", function()
      {
        communication_controller.send( "save_device_data", {device_type: 3, device_id: this_device.serial_number, key: "mac", val: this_device.mac}, "cloud" );
        communication_controller.send( "save_device_data", {device_type: 3, device_id: this_device.serial_number, key: "position", val: this_device.position.slice( 0, 3 )}, "cloud" );
        communication_controller.send( "save_device_data", {device_type: 3, device_id: this_device.serial_number, key: "apn", val: apn}, "cloud" );
        communication_controller.send( "save_device_data", {device_type: 3, device_id: this_device.serial_number, key: "customer", val: login_screen_controller.customer_id}, "cloud" );

      }, true );
    //} );
  }

  send( data )
  {
    super.send( data );
    console.log( "basestation send ", data );
    baseStationConsole.newOutput( data );
  }
  handle_msg( data )
  {
    super.handle_msg( data );
    baseStationConsole.newInput( data );
  }

  handle_connected( sockId )
  {
    super.handle_connected( sockId );
    baseStationConsole.newLine( "Connected to " + this.mac );
  }
  onDisconnect()
  {
    baseStationConsole.newLine( "Disconnected" );
  }
}


function ConvertDMSToDD( DDS, direction )
{
  let degrees = Math.floor( DDS / 100 );
  let minutes = (DDS - degrees * 100) / 60;
  let dd = degrees + minutes;
  if ( direction === "S" || direction === "W" )
    dd = dd * -1;
  return dd;
}

class HarxonBaseStationBluetoothConnection extends BaseStationBluetooth
{
  constructor( mac )
  {
    super( mac );
  }

  log_position()
  {
    this.send( "$CFG GNSS\nunlog\nlog gpgga ontime 1" );
  }

  parse_data( data )
  {
    var message_handled = false;
    message_handled |= this.find_gpgga( data );
    if ( data.indexOf( "BT MODULE: NAME R" ) >= 0 )
    {
      // HARDWARE,SN,S18089000023*
      // >OK

      this.serial_number = data.split( "BT MODULE: NAME R" )[1].split( "\n" )[0].trim();
      message_handled = true;
    }

    return message_handled;
  }

  handle_connected( sockId )
  {
    super.handle_connected( sockId );
    this.events.add_callback( "msg", data => {
      clearTimeout( to );
      this.send( "$CFG BT OUT ON", data => {
        this.send( "$CFG PROINFO", data => {
          this.log_position();
          var this_class = this;
          function position_upd( pos )
          {
            if ( pos[3] >= 1 )
            {
              this_class.send( "$CFG GNSS\nunlog" );
              this_class.events.remove_callback( "position_updated", position_upd );
            }
          }
          this.events.add_callback( "position_updated", position_upd );
          //this.send( "log VERSION" );
          //this.send( "log gpgga once" );

          this.events.call_callback( "connected" );
        } );
      } );
    }, true );
    let to = setTimeout( () => {
      this.send( "$CFG BT OUT ON" );
    }, 1000 );
  }

  handle_msg( data )
  {
    super.handle_msg( data );
    if ( !this.parse_data( data ) || true )
      console.log( "basestation data", data );
    this.events.call_callback( "msg", data );
  }

  send( data, callback )
  {
    super.send( data + "\r\n" );
    if ( callback )
      this.events.add_callback( "msg", callback, true );
  }

  set_apn( apn, username = 1, password = 1, callback)
  {
    this.send( "$CFG NET UMTS " + apn + " 1 1", callback );
  }

  setup_ntrip_base( server, port, username, password, mount, pos )
  {
    this.send( "$CFG FIX " + pos[0].round( 4 ) + " " + pos[1].round( 4 ) + " " + pos[2].round( 4 ), () => {
      this.send( "$CFG NTRIP " + server + " " + port + " " + mount + " NTRIP NtripLinuxCaster " + username + " " + password, () => {
        this.send( "$CFG 3G DLINK", () => {
          this.send( "$CFG GNSS\nlog com3 rtcm1005 ontime 10\nlog com3 rtcm1033 ontime 10\nlog com3 rtcm1074 ontime 1\nlog com3 rtcm1084 ontime 1\nlog com3 rtcm1124 ontime 1\nlog com3 rtcm1094 ontime 1\nsaveconfig", () => {
            this.events.call_callback( "base_setup" );
          } );
        } );
      } );
    } );
    //this.send( "saveconfig" );

  }

  reset_device()
  {
    //this.send( "fix none" );
    //this.send( "unlogall" );
    this.send( "$CFG FRST GNSS" );
    this.disconnect();
    setTimeout( () =>
    {
      this.connect();
    }, 1000 );
  }
}


class ComnavBaseStationBluetoothConnection extends BaseStationBluetooth
{
  constructor( mac )
  {
    super( mac );

    this.serial_checker;
    this.position_checker;
  }
  parse_data( data )
  {
    var message_handled = false;
    message_handled |= this.find_gpgga( data );
    if ( data.indexOf( "<VERSION" ) >= 0 )
    {
      this.serial_number = data.split( "<VERSION" )[1].split( "<" )[2].split( '"' )[3].substring( 0, 9 ); // 0330538500000000 or // T330153850000000 or 
      while (!parseInt( this.serial_number ))
        this.serial_number = this.serial_number.substring(1);
      this.serial_number = "" + parseInt( this.serial_number );
      clearInterval(this.serial_checker);
      this.events.call_callback( "serial_updated", this.serial_number );
      message_handled = true;
    }

    
    let types = data.split( /#|<|\$/g );
    types.forEach((m) => {
      let type = (m.split(/,| /g)[0]).toUpperCase();
      if (!this.is_accepted_type(type))
        this.send( "unlog " + type );
    });

    return message_handled;
  }

  is_accepted_type(type)
  {
    const ACCEPTED_TYPES = ["","VERSION","GPGGA"];
    if (ACCEPTED_TYPES.indexOf(type) == -1 && type.indexOf("\n") == -1)
      return this.check_chars(type);
    return true;
  }
  check_chars(type)
  {
    for (let i = 0 ; i < type.length; i++)
    {
      if (type.charCodeAt(i) <= 65 || type.charCodeAt(i) >= 122)
        return true;
    }
    return false;
  }

  handle_connected( sockId )
  {
    super.handle_connected( sockId );
    //this.send( "unlogall" );
    if (!this.serial_number)
    {
      this.send( "log VERSION" );
      this.serial_checker = setInterval(()=>{this.send( "log VERSION" );}, 10000);
    }
    
    this.send( "log gpgga ontime 1" );
    this.position_checker = setInterval(()=>{this.send( "log gpgga ontime 1" );}, 5000);
    
    var this_class = this;
    function position_upd( pos )
    {
      if (this_class.position_checker)
        clearInterval(this_class.position_checker);
      this_class.position_checker = 0;
      if ( pos[3] >= 1 )
      {
        this_class.events.remove_callback( "position_updated", position_upd );
        this_class.send( "unlog gpgga" );
      }
    }
    this.events.add_callback( "position_updated", position_upd );

    let parts_updated = 0;
    if (this.serial_number)
      parts_updated++
    function part_updated()
    {
      parts_updated++;
      if ( parts_updated === 2 )
        this_class.events.call_callback( "ready" );
    }
    this.events.add_callback( "position_updated", part_updated, true );
    this.events.add_callback( "serial_updated", part_updated, true );

  }

  handle_msg( data )
  {
    if (!data)
      return;
    super.handle_msg( data );
    if ( !this.parse_data( data ) || true )
      console.log( "basestation data", data );
    this.events.call_callback( "msg", data );
  }

  send( data, callback )
  {
    super.send( data + "\r\n" );
    if ( callback )
      this.events.add_callback( "msg", callback, true );
  }

  get_apn()
  {
    this.send( "tst readapn" );
  }

  set_apn( apn, username = 1, password = 1, callback)
  {
    this.send( ("tst setgprs " + apn + " " + username + " " + password).replace( "  ", " " ), callback );
  }

  log_position()
  {
    this.send( "log gpgga ontime 1" );
  }

  send_multiple(msgs, index = 0, callback) 
  {
    var next_one_send = false;
    var timeout_sender = setTimeout(() => {
      next_one_send = true;
      console.log("send_multiple, timeout reached");
      index++;
      if (index < msgs.length)
        this.send_multiple(msgs, index, callback);
      else
        callback();
    }, 1000);

    this.send(msgs[index], (first_response) => {
      if (next_one_send)
        return;
      clearTimeout(timeout_sender);
      console.log("send_multiple, first_response:", first_response);
      index++;
      if (index < msgs.length)
        this.send_multiple(msgs, index, callback);
      else
        callback();
    });
  }

  setup_ntrip_base( server, port, username, password, mount, pos )
  {

    this.send( "fix position " + pos[0].round( 4 ) + " " + pos[1].round( 4 ) + " " + pos[2].round( 4 ) );
    var valid_position = 0;
    var this_class = this;
    function got_position( pos )
    {
      if ( pos[3] === 7 )
        valid_position++;
      if ( valid_position === 3 )
      {
        popup_screen_controller.open_info_waiter( "Configuring ntrip settings");
        this_class.events.remove_callback( "position_updated", got_position );
        let msgs = [
          "unlog gpgga",
          "set datalink gprs on",
          "tst connect com2 gprs",
          "tst setgprs 3iot.com 1 1",
          //"unlogall",
          //"tst setcors " + server + " " + port + " " + username + " " + password,
          //"tst setcorsmp " + mount + " server",

          "set datalink gprs cors param 3iot.com " + server + " " + port + " TCP Server",
          "set datalink gprs cors srctable " + mount + " " + username + " " + password,
          "interfacemode com2 compass compass on",
          "interfacemode gprs compass compass on",

          "log gprs rtcm1005b ontime 10",
          "log gprs rtcm1033b ontime 10",
          "log gprs rtcm1074b ontime 1",
          "log gprs rtcm1084b ontime 1",
          "log gprs rtcm1094b ontime 1",
          "log gprs rtcm1124b ontime 1",
          "interfacemode gprs auto auto on",
          "saveconfig",
          //"log gpgga ontime 1",
          ""
        ];
        this_class.send_multiple( msgs, 0, () => {
          this_class.events.call_callback( "base_setup" );
        } );
        /*
         this_class.send( "unlogall" );
         this_class.send( "tst setcors " + server + " " + port + " " + username + " " + password );
         this_class.send( "tst setcorsmp " + mount + " server", () => {
         this_class.send( "log gprs rtcm1005b ontime 5" );
         this_class.send( "log gprs rtcm1033b ontime 5" );
         this_class.send( "log gprs rtcm1074b ontime 1" );
         this_class.send( "log gprs rtcm1084b ontime 1" );
         this_class.send( "log gprs rtcm1094b ontime 1" );
         this_class.send( "log gprs rtcm1124b ontime 1" );
         this_class.send( "saveconfig" );
         this_class.events.call_callback( "base_setup" );
         } );
         */
      }
    }
    //this.send( "log gpgga ontime 1" );
    this.events.add_callback( "position_updated", got_position );
  }

  set_ntrip_client( server, port, username, password, mount )
  {
    this.send( "set datalink gprs on" );
    this.send( "tst connect com2 gprs" );
    this.send( "interfacemode gprs auto auto on" );
    this.send( "tst setcors " + server + " " + port + " " + username + " " + password );
    this.send( "tst setcorsmp " + mount + " clients" );
    this.send( "saveconfig" );
  }

  reset_device()
  {
    this.send( "fix none" );
    //this.send( "unlogall" );
    setTimeout( () => {
      this.send( "freset" );
      this.disconnect();
      setTimeout( () =>
      {
        this.connect();
      }, 1000 );
    }, 1000 );
  }
}


const baseStationConsole = {
  open()
  {
    $( "#base_station_console" ).removeClass( "gone" );
  },
  close()
  {
    $( "#base_station_console" ).addClass( "gone" );
    if (baseStationScreenController.connected_device) {
      baseStationScreenController.connected_device.delete();
      baseStationScreenController.connected_device = false;
    }
  },
  clear()
  {
    $( "#console_input_lines" ).empty();
  },
  newLine( text )
  {
    $( "#base_station_console #console_input_lines" ).prepend( "<p>" + text.replace( /\n/g, "<br>" ).replace( /\r/g, "[CR]" ) + "</p>" );
  },
  newInput( input_text )
  {
    baseStationConsole.newLine( "< " + input_text );
  },
  newOutput( output_text )
  {
    baseStationConsole.newLine( " >" + output_text );
  },
  send()
  {
    let t = $( "#command_input" ).val();
    if ( t ) {
      baseStationScreenController.connected_device.send( t );
    }
  }
};


$(() => {
  message_controller.events.add_callback("get_base_stations",baseStationScreenController.gotCustomerBaseStations);
});