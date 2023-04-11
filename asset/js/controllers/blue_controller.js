
/* global robot_controller, message_controller, wifi_controller, chrome, event_controller, Blob, networking, communication_controller, joystick_controller, bottom_bar_chooser, time */

function str2ab( str )
{
  var buf = new ArrayBuffer( str.length ); // 2 bytes for each char
  var bufView = new Uint8Array( buf );
  for( var i = 0, strLen = str.length; i < strLen; i++ )
  {
    if( str.charCodeAt( i ) > 255 )
      bufView[i] = 63;
    else
      bufView[i] = str.charCodeAt( i );
  }
  return buf;
}
function ab2str( buffer )
{
  var arr = new Uint8Array( buffer );
  var str = String.fromCharCode.apply( String, arr );
  if( /[\u0080-\uffff]/.test( str ) )
  {
//console.log( str );
//throw new Error( "this string seems to contain (still encoded) multibytes" );
    return "";
  }
  return str;
}

class StaticBluetoothConnection
{
  constructor()
  { }

  static start_bt_base_handler( callback )
  {
    if( StaticBluetoothConnection.started )
      return;
    StaticBluetoothConnection.started = true;
    if( !window.networking )
    {
      setTimeout( function()
      {
        StaticBluetoothConnection.start_bt_base_handler( callback );
      }, 10 );
      return;
    }


    var bt_enable_callback = function( enabled )
    {
      if( enabled )
      {
        networking.bluetooth.onReceive.addListener( StaticBluetoothConnection.got_bt_message );
        networking.bluetooth.onReceiveError.addListener( StaticBluetoothConnection.onReceiveError );
        console.log( "Bluetooth enabled" );
      }
      else
      {
        console.warn( "Failed to enable bluetooth" );
      }
    };
    StaticBluetoothConnection.enable_bluetooth( bt_enable_callback );
  }

  static enable_bluetooth( callback )
  {
    networking.bluetooth.getAdapterState( function( adapterInfo )
    {
      StaticBluetoothConnection.bt_enabled = adapterInfo.enabled;
      if( StaticBluetoothConnection.bt_enabled )
      {
        if( callback )
          callback( true );
      }
      else
      {
        console.log( 'Adapter is disabled, enabling' );
        networking.bluetooth.enable( function()
        {
          // The adapter is now enabled
          StaticBluetoothConnection.bt_enabled = true;
          if( callback )
            callback( true );
        }, function()
        {
          StaticBluetoothConnection.bt_enabled = false;
          // The user has cancelled the operation
          if( callback )
            callback( false );
        } );
      }
    } );
  }

  static toggle_bluetooth( callback )
  {
    networking.bluetooth.getAdapterState( function( adapterInfo )
    {
      if( adapterInfo.enabled )
        networking.bluetooth.disable();
      else
        networking.bluetooth.enable();
      if( callback )
        callback( !adapterInfo.enabled );
    } );
  }

  static got_bt_message( receiveInfo )
  {
    if( !StaticBluetoothConnection.connections )
      StaticBluetoothConnection.connections = [ ];
    var found = false;
    StaticBluetoothConnection.connections.forEach( conn => {
      if( conn.socketId === receiveInfo.socketId )
      {
        found = true;
        conn.handle_raw_msg( receiveInfo.data );
      }
    } );
    if( !found )
      networking.bluetooth.close( receiveInfo.socketId );
  }

  static onReceiveError( errorInfo )
  {
    if( !StaticBluetoothConnection.connections )
      StaticBluetoothConnection.connections = [ ];
    StaticBluetoothConnection.connections.forEach( conn => {
      if( conn.socketId === errorInfo.socketId )
        conn.onReceiveError( errorInfo.errorMessage );
    } );
  }

  static add_connection( conn )
  {
    if( !StaticBluetoothConnection.connections )
      StaticBluetoothConnection.connections = [ ];
    StaticBluetoothConnection.connections.push( conn );
  }
  static remove_connection( conn )
  {
    if( !StaticBluetoothConnection.connections )
      StaticBluetoothConnection.connections = [ ];
    if( StaticBluetoothConnection.connections.indexOf( conn ) >= 0 )
      StaticBluetoothConnection.connections.splice( StaticBluetoothConnection.connections.indexOf( conn ), 1 );
    conn.disconnect();
  }

}

class BluetoothConnection extends StaticBluetoothConnection
{
  constructor( mac, uuid = "00001101-0000-1000-8000-00805f9b34fb")
  {
    super();
    this._mac = mac;
    this.socketId = -1;
    this.started = false;
    this.stopped = false;
    this.uuid = uuid;
    this.errors = 0;
    this.last_error = "";
    this._gotData = false;
    this.connecting = false;
    this.last_mac_used = "";
    this.sending = false;
    this.last_message_believed_send = false;
    this.last_message_recieve = 0;
    this.last_data = "";
    this.last_connect = 0;
    this._disabled = false;
    StaticBluetoothConnection.add_connection( this );
    StaticBluetoothConnection.start_bt_base_handler();

    this.convert_data = true;

    this.events = new MultiEventController();

    this.events.add_callback( "disconnected", this.onDisconnect );
  }
  delete()
  {
    this.disable();
    this.disconnect();
    StaticBluetoothConnection.remove_connection( this );
  }
  get is_disabled()
  {
    return this._disabled;
  }
  disable()
  {
    this._disabled = true;
    this.disconnect();
  }
  enable()
  {
    this._disabled = false;
    this.connect();
  }
  get mac()
  {
    if (this._mac)
      return this._mac;
    else
    {
      console.warn("Bluetooth MAC has not been set!");
      $('#bluetooth_status_value').text(translate["Bluetooth MAC has not been set!"]);
      return null;
    }
  }
  get connected()
  {
    return this.socketId >= 0;
  }
  get confirmed()
  {
    return this._gotData;
  }
  start()
  {
    if( !this.started )
      this.connect();
  }
  connect()
  {
    logger.debug("Attempting blutooth connection...");
    if (!window.networking) {
      logger.debug("No bluetooth module detected.");
      $('#bluetooth_status_value').text(translate["No bluetooth module detected."]);
      return false;
    }
    if (this.stopped) {
      logger.debug("Bluetooth has been stopped.");
      $('#bluetooth_status_value').text(translate["Bluetooth has been stopped."]);
      return false;
    }
    if (!this.mac) {
      logger.debug("MAC is not set.");
      $('#bluetooth_status_value').text(translate["MAC is not set."]);
 
      return false;
    }
    if (!this.uuid) {
      logger.debug("UUID is not set.");
      $('#bluetooth_status_value').text(translate["UUID is not set."]);
      return false;
    }
    if (this._disabled) {
      logger.debug("Bluetooth has been disabled.");
      $('#bluetooth_status_value').text(translate["Bluetooth has been disabled."]);
      return false;
    }

    this.started = true;
    
    if (this.socketId >= 0) {
      logger.debug("Bluetooth connection already exists, disconnecting before reconnecting...");
      $('#bluetooth_status_value').text(translate["Bluetooth has been disabled."]);
      this.disconnect();
    }
    if (this.connecting) {
      logger.debug("Bluetooth already connecting.");
      $('#bluetooth_status_value').text(translate["Bluetooth has been disabled."]);
      return false;
    }

    this.connecting = true;
    console.log("Connecting bluetooth");
    $('#bluetooth_status_value').text(translate["Connecting bluetooth."]);
    var this_class = this;
    this.last_mac_used = this.mac;
    var start_connect_time = time.now;
    networking.bluetooth.connect( this.mac, this.uuid, function( socketId )
    {
      this_class.connecting = false;
      this_class.handle_connected( socketId );
      this_class.events.call_callback( "connected" );
      communication_controller.send_key_val( "Bluetooth", "Connected" );
      $('#bluetooth_status_value').text(translate["Bluetooth connected."]);
    }, function( errorMessage )
    {
      var time_to_error = time.now - start_connect_time;
      var time_to_wait = 1000 - time_to_error;
      setTimeout( function()
      {
        StaticBluetoothConnection.enable_bluetooth();
        this_class.connecting = false;
        this_class.handle_error_connected( errorMessage );
      }, time_to_wait );

    } );
    //} );
  }
  disconnect()
  {
    if( this.socketId >= 0 )
    {
      printStack();
      communication_controller.send_key_val( "Bluetooth", "Disconnected" );
      networking.bluetooth.close( this.socketId );
    }
    this.socketId = -1;
    this._gotData = false;
    this.started = false;

    this.events.call_callback( "disconnected" );
    $('#bluetooth_status_value').text(translate["Bluetooth disconnected."]);
  }
  handle_connected( socketId )
  {
    this.socketId = socketId;
    this.last_connect = time.now;
    logger.debug( "Bluetooth connected to MAC: " + this.mac + ", on socket ID: " + socketId );
    this.errors = 0;
    this.last_error = "";
  }
  onDisconnect()
  {

  }
  onReceiveError( errorMessage )
  {
    communication_controller.send_key_val( "Bluetooth", `Error: ${errorMessage}` );
    console.warn( "blue receive error", errorMessage );
    this.disconnect();
    this.connect();
  }
  handle_error_connected( errorMessage )
  {
    this.errors++;
    this.last_error = errorMessage;
    this.on_error( errorMessage );
    console.error("Bluetooth connection failed: ", errorMessage);
    $('#bluetooth_status_value').text(translate["Bluetooth connection failed: " + errorMessage]);
  }
  on_error( errorMessage )
  {
    this.connect();
  }
  handle_raw_msg( byteArray )
  {
    if( this.convert_data )
      this.handle_msg( ab2str( byteArray ) );
    else
      this.handle_msg( byteArray );
  }
  handle_msg( data )
  {
    this._gotData = true;
    this.last_data = data;
    this.last_message_recieve = time.now;
  }
  send( data )
  {
    this.sending = true;
    this.last_message_believed_send = false;

    var s = data;
    if( this.convert_data )
      s = str2ab( data );

    networking.bluetooth.send( this.socketId, s, () =>
    {
      this.success_send();
    }, ( errorMessage ) =>
    {
      this.error_send( errorMessage );
    } );
  }
  success_send()
  {
    this.sending = false;
    this.last_message_believed_send = true;
  }
  error_send( errorMessage )
  {
    this.sending = false;
    this.on_error( errorMessage );
  }
}

class RobotBluetoothConnection extends BluetoothConnection
{
  constructor()
  {
    super( "", "00001101-0000-1000-8000-00805f9b34fb" );
    this.data_buffer = "";
    this.last_message_sent = null;
    this.same_topic_send_que = [ ];
    this.que = {};
    this.last_ping_send = 0;
    this.last_ping_recieve = 0;
    this.first_ping_send = false;
    this.ping_ok = false;
    this.ping_checker = setInterval( () => {
      this.send_ping();
    }, 2000 );

  }
  get mac()
  {
    return robot_controller.chosen_robot.bmac;
  }
  handle_connected( socketId )
  {
    super.handle_connected( socketId );
    event_controller.call_callback( "connected_to_bluetooth" );
    robot_controller.chosen_robot_online_change();
    joystick_controller.start_timer();
  }
  disconnect()
  {
    super.disconnect();
    this.ping_ok = false;
    this.first_ping_send = false;
    event_controller.call_callback( "bluetooth_disconnect" );
    console.warn( "Disconnecting bluetooth" );
    event_controller.call_callback( "robot_now_offline" );
    robot_controller.chosen_robot_online_change();
  }
  handle_msg( data )
  {
    var was_confirmed = this.confirmed;
    super.handle_msg( data );
    if(!data) {
      return;
    }
    if(this.data_buffer.length > 10000) {
      this.data_buffer = "";
    }
    if(!was_confirmed || !this.data_buffer.startsWith( '{' )) {
      this.data_buffer = "";
    }
    this.data_buffer += data;
    this.parse_data_buffer();
  }
  parse_data_buffer()
  {
    var packages = this.data_buffer.split( '{' );
    //this.data_buffer = "";

    for( var is = 1; is < packages.length; is++ )
    {
      var test_data = "";
      for( var ie = is; ie < packages.length; ie++ )
      {
        //console.log( is, ie );
        test_data += "{" + packages[ie];
        try
        {
          //console.log( test_data );
          var msg = JSON.parse( test_data );
        }
        catch( e )
        {
          continue;
        }

        if( !msg.data || !msg.UUID || !msg.topic )
          continue;
        msg.data.robot = robot_controller.chosen_robot.id;
        //console.log( msg );
        this.data_buffer = "";
        for( var ir = ie + 1; ir < packages.length; ir++ )
        {
          this.data_buffer += "{" + packages[ir];
        }

        if( msg.topic === "ping" )
        {
          this.ping_send = 0;
          this.last_ping_recieve = time.now;
          this.check_ping();
        }
        message_controller.handle_message( JSON.stringify( msg ), "blue" );
      }
    }

  }
  send_ping()
  {
    if( this.connected )
    {
      logger.debug( 'sending bluetooth ping' );
      communication_controller.ping( "", "blue" );
    }
  }
  check_ping()
  {
    if( !this.connected )
      return;
    if( !this.first_ping_send )
      return;
    var ping_time = time.now - this.last_ping_send;
    var time_sinse_connect = time.now - this.last_connect;
    if( ping_time > (communication_controller.ping_timeout["blue"]) )
    {
      if( time_sinse_connect > 10000 )
      {
        console.warn( "Bluetooth ping timeout!", ping_time, "last msg", this.last_message_sent );
        event_controller.call_callback( "ping_timeout" );
        this.connect(); // also reconnect
      }
      else
        logger.debug( "Bluetooth ping timeout!", ping_time, "but before first timeout" );
    }
    else
    {
      this.ping_ok = true;
    }
  }
  queMsg( msg, topic, buffer_msg )
  {
    if( !this.connected )
      return;
    buffer_msg.qued = true;
    if( topic === "ok" )
      this.same_topic_send_que.push( [ msg, buffer_msg ] );
    else
    {
      if( this.que[topic] )
        console.warn( "Message", topic, "is being changed before it was sent to bluetooth" );
      this.que[topic] = [ msg, buffer_msg ];
    }
    if( !this.sending )
      this.sendNext();
  }
  getNextMessage()
  {
    var msg;
    if( this.same_topic_send_que.length )
    {
      msg = this.same_topic_send_que.shift(); // pop left
    }
    else
    {
      var send_topic = "";
      if( this.que["cmd"] )
        send_topic = "cmd";
      else if( this.que["ping"] )
        send_topic = "ping";
      else if( this.que["move"] )
        send_topic = "move";
      else
      {
        var topics = Object.keys( this.que );
        send_topic = topics[0];
      }
      msg = this.que[send_topic];
      delete this.que[send_topic];
    }
    return msg;
  }
  isMessageInQue()
  {
    return !!this.same_topic_send_que.length || !!Object.keys( this.que ).length;
  }
  updateTimeOnMsg( buffer_message )
  {
    if( window.bootTime )
    {
      window.bootTime.get( function( new_boot_time )
      {
        var new_time = parseInt( new_boot_time ) + communication_controller.timeOffset;
        buffer_message.time = new_time;
      } );
    }
    else
    {
      var new_time = (new Date).getTime();
      buffer_message.time = new_time;
    }
  }
  sendNext()
  {
    this.sending = true;
    if( !this.connected )
    {
      this.sending = false;
      return;
    }

    var msg = this.getNextMessage();
    this.updateTimeOnMsg( msg[1] );
    if( msg[1].topic === "ping" )
    {
      this.last_ping_send = time.now;
      this.first_ping_send = true;
    }

    super.send( msg[0] + "\r" );
    this.last_message_sent = msg[1];
  }
  success_send()
  {
    super.success_send();
    if( this.isMessageInQue() )
      this.sendNext();
    else
      this.sending = false;
  }
  error_send( errorMessage )
  {
    super.error_send();
    communication_controller.send_key_val( "Bluetooth", `Error: ${errorMessage}` );
    console.warn( errorMessage, this.socketId );
  }
}

var blue = {
  _RobotConnection: false,
  get RobotConnection()
  {
    if( !blue._RobotConnection )
      blue._RobotConnection = new RobotBluetoothConnection();
    return blue._RobotConnection;
  },
  get socket_confirmed()
  {
    return blue.RobotConnection.confirmed;
  },
  get socketId()
  {
    return blue.RobotConnection.socketId;
  },
  get connect_to()
  {
    return blue.RobotConnection.last_mac_used;
  },
  get connection_acceptable()
  {
    return blue.RobotConnection.ping_ok;
  },
  connect_to_robot: function()
  {
    blue.RobotConnection.start();
  },
  send: function( msg, topic, buffer_msg )
  {
    blue.RobotConnection.queMsg( msg, topic, buffer_msg );
  },
  disable_bluetooth_changed: function()
  {
    var disable = $( '#disable_bluetooth_checkbox' ).prop( "checked" );
    if( disable )
      blue.RobotConnection.disable();
    else
      blue.RobotConnection.enable();
  },
  disconnect: function()
  {
    blue.RobotConnection.disconnect();
  },
  toggle: function( callback )
  {
    StaticBluetoothConnection.toggle_bluetooth( callback );
  }
};

