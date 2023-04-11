
/* global cordova, device, WifiWizard, communication_controller, robot_controller, permission_controller */

function test_callback( arg )
{
  console.log( arg );
}
function test_error_callback( arg )
{
  console.log( "error" );
  console.log( arg );
}
function stackTrace()
{
  var err = new Error();
  console.log( err.stack );
}

var wifi_controller = {
  get_nearby_wifi: function( callback, error_callback )
  {
    permission_controller.getPermission( "ACCESS_COARSE_LOCATION", function()
    {
      wifi_controller.fetch_nearby_wifi( callback, error_callback );
    }, error_callback );
  },
  fetch_nearby_wifi: function( callback, error )
  {

    WifiWizard.startScan( function()
    {
      WifiWizard.getScanResults( function( networks )
      {
        networks = networks.map( function( network )
        {
          return network.SSID.replace( /\"/g, "" );
        } );
        callback( networks );
      }, error );
    }, error );
  },

  last_wifi: '',
  get_current_wifi: function( callback, error_callback )
  {
    if( !window.WifiWizard )
    {
      setTimeout( function()
      {
        wifi_controller.get_current_wifi( callback, error_callback );
      }, 10 );
      return;
    }

    WifiWizard.getCurrentSSID( function( ssid )
    {
      wifi_controller.current_ssid = ssid.replace( /\"/g, "" );

      if( wifi_controller.current_ssid !== wifi_controller.last_wifi )
      {

      }

      wifi_controller.last_wifi = wifi_controller.current_ssid;
      if( callback )
        callback( wifi_controller.current_ssid );
    }, function()
    {
      wifi_controller.last_wifi = "";
      if( callback )
        callback( "Not connected to a wifi" );
    } );
  },

  nearby_ssid: [ ],
  current_ssid: '',
  update_wifi: function( callback, error_callback )
  {

    if( !window.device )
    {
      if( callback )
        callback();
      return;
    }

    var updated = 0;
    function one_updated()
    {
      updated++;
      if( updated === 2 )
      {
        callback();
      }
    }

    wifi_controller.get_nearby_wifi( function( networks )
    {
      wifi_controller.nearby_ssid = networks;
      one_updated();
    }, function()
    {
      wifi_controller.nearby_ssid = [ ];
      one_updated();

    } );
    wifi_controller.get_current_wifi( function( ssid )
    {
      wifi_controller.current_ssid = ssid;
      one_updated();
    }, function()
    {
      wifi_controller.current_ssid = "";
      one_updated();
    } );
  },
  try_connect: function()
  {
    var robot_ssid = robot_controller.chosen_robot_id ? robot_controller.chosen_robot.name : "";
    if( robot_ssid && window.WifiWizard )
    {
      wifi_controller.get_current_wifi( function( current_ssid )
      {
        if( robot_ssid !== current_ssid )
        {

          wifi_controller.get_nearby_wifi( function( networks )
          {
            if( networks.indexOf( robot_ssid ) >= 0 )
            {
              if( device.platform.toLowerCase() === "android" )
              {
                WifiWizard.connectNetwork( robot_ssid, function( resp )
                {

                } );
              }
              else
              {
                alert( "Please open wifi settings" );
              }
            }
          }, function()
          {

          } );
        }
      } );
    }
  },
  choose_wifi: function( SSID )
  {

    if( !window.device )
    {
      return;
    }

    if( SSID === "KeyResearch" )
    {
      communication_controller.localAdress = "192.168.0.66";
      //communication_controller.local_addr = "192.168.1.17";
    }
    else
    {
      communication_controller.localAdress = "10.0.0.10";
    }
    wifi_controller.try_connect();

  },
  disconnect: function()
  {
    if( !window.WifiWizard )
      setTimeout( wifi_controller.disconnect, 100 );
    else
      WifiWizard.disconnect( test_callback, test_callback );
    //stackTrace();
    robot_controller.disconnect_robots( "robot" );
  },
  robot_signal_strength: -1000,
  get_robot_signal_strength( callback )
  {
    if( !robot_controller.chosen_robot )
      return;
    wifi_controller.get_signal_strength( robot_controller.chosen_robot.name, function( strength )
    {
      wifi_controller.robot_signal_strength = strength;
      if( callback )
        callback( strength );
    } );
  },
  strength_updater: 0,
  start_strength_updater: function()
  {
    wifi_controller.strength_updater = setInterval( wifi_controller.get_robot_signal_strength, 500 );
  },
  stop_strength_updater: function()
  {
    clearInterval( wifi_controller.strength_updater );
  },
  get_signal_strength_timeout: 0,
  get_signal_strength: function( SSID, callback, error )
  {

    if( wifi_controller.get_signal_strength_timeout )
    {
      clearTimeout( wifi_controller.get_signal_strength_timeout );
      wifi_controller.get_signal_strength_timeout = 0;
      callback( 0 );
    }

    if( !window.WifiWizard )
    {
      wifi_controller.get_signal_strength_timeout = setTimeout( function()
      {
        wifi_controller.get_signal_strength_timeout = 0;
        wifi_controller.get_signal_strength( SSID, callback, error );
      }, 100 );
      return;
    }

    if( !error )
    {
      error = function()
      {
        callback( -1000 );
      };
    }

    WifiWizard.startScan( function()
    {
      WifiWizard.getScanResults( function( networks )
      {
        networks = networks.filter( function( network )
        {
          return network.SSID.replace( /\"/g, "" ) === SSID;
        } );
        callback( networks[0] ? networks[0].level : -1000 );
      }, error );
    }, error );

  }
  ,
  signal_strength_limit: -80,
  choose_best_connection: function( SSID )
  {
    if( !SSID )
      SSID = robot_controller.chosen_robot.name;

    if( !SSID )
    {
      communication_controller.use_local_connection = false;
    }
    else
    {
      wifi_controller.get_signal_strength( SSID, function( strength )
      {
        if( strength > wifi_controller.signal_strength_limit + 10 )
        {
          console.log( "signal strength for " + SSID + " is fine" );
          if( !communication_controller.use_local_connection )
          {
            communication_controller.use_local_connection = true;
            communication_controller.createLocalConnection();
          }
        }
        else if( strength < wifi_controller.signal_strength_limit )
        {
          console.log( "signal strength for " + SSID + " is too weak" );
          if( communication_controller.use_local_connection )
          {
            communication_controller.use_local_connection = false;
          }
        }
      } );
    }
  }
};

wifi_controller.start_strength_updater();
//setInterval( wifi_controller.choose_best_connection, 1000 );
//setInterval( wifi_controller.try_connect, 5000 );
setInterval( wifi_controller.get_current_wifi, 1000 );