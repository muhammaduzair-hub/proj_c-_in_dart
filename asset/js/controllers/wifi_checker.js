/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global cordova, communication_controller, popup_screen_controller, translate, event_controller */

//cordova plugin add cordova-plugin-android-wifi-manager
var wifi_checker = {
  WifiManager: {
    getWifiState: function()
    { }
  },
  state: "DISABLED",
  start_timeout: undefined,
  start: function()
  {
    if( window.cordova )
    {
      if( cordova.plugins.WifiManager && localStorage.getItem( 'user.save' ) === "true" ) // Check if plugin has been loaded, otherwise wait 500ms
      {
        wifi_checker.WifiManager = cordova.plugins.WifiManager;
        wifi_checker.get_state();
        wifi_checker.start_state_listener();
      }
      else
      {
        clearTimeout( wifi_checker.start_timeout );
        wifi_checker.start_timeout = setTimeout( wifi_checker.start, 500 );
      }
    }
  },
  check_state: function( err, state )
  {
    communication_controller.send_key_val( "WIFI", state );

    if( wifi_checker.state !== state && state === "ENABLED" )
    {
      // Alert user
      console.warn( "wifi is enabled" );

      const popcontent = {
        header: translate["Warning"],
        body: translate["WIFI warning"],
        ok_text: translate["OK"],
        ok_callback: popup_screen_controller.close
      };

      if(device.versionArray[0] < 11)
      {
        popcontent['ok_text'] = translate["Keep WIFI enabled"];
        popcontent['cancel_text'] = translate["Disable WIFI"];
        popcontent['cancel_callback'] = function()
        {
          wifi_checker.disable_wifi();
          popup_screen_controller.close();
        };
      }
      else
      {
        $("#connect_tablet_wifi_button").addClass('gone');
      }

      popup_screen_controller.confirm_popup_with_options(popcontent);
    }
    wifi_checker.state = state;
  },
  get_state: function()
  {
    wifi_checker.WifiManager.getWifiState( wifi_checker.check_state );
  },
  start_state_listener: function()
  {
    event_controller.add_callback( "onwifistatechanged", ( data ) => {
      setTimeout( wifi_checker.get_state, 500 );
    } );
  },
  disable_wifi: function()
  {
    wifi_checker.WifiManager.setWifiEnabled( false );
  },
  enable_wifi: function()
  {
    wifi_checker.WifiManager.setWifiEnabled( true );
  },
  toggle_wifi: function()
  {
    if( wifi_checker.state === "ENABLED" )
      wifi_checker.disable_wifi();
    else if( wifi_checker.state === "DISABLED" )
      wifi_checker.enable_wifi();
  },

  make_random_password: function()
  {
    return Math.random().toString( 36 ).slice( -8 );
  },
  enable_hotspot: function()
  {
    // Doesn't work :(
    var wifiAPConfiguration;
    wifi_checker.WifiManager.getWifiApConfiguration( ( err, config ) => {
      if( !err )
      {
        wifiAPConfiguration = config;
        //config.preSharedKey = wifi_checker.make_random_password();

        wifi_checker.WifiManager.setWifiApEnabled( wifiAPConfiguration, true, ( err, success ) => {
          if( !err && success )
          {
            // connect robot to settings
            console.log( "now connect robot to", wifiAPConfiguration.SSID, wifiAPConfiguration.preSharedKey );
          }
          else
          {
            console.err( "could not enable hotspot", err );
          }
        } );

      }
      else
      {
        // warning could not get wifi state
        console.err( "could not get wifi state", err );
      }
    } );
  }
};

event_controller.add_callback( "app_specific_setup_done", function()
{
  wifi_checker.start();
} );


