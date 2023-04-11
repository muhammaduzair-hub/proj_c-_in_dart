/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, app_controller, device, event_controller */

var shipment_prep_screen = {
  generate_customer_preparation: function()
  {
    shipment_prep_screen.check_all_apps( function()
    {
      var generate_button = shipment_prep_screen.generate_button;
      var generate_app_button = shipment_prep_screen.generate_app_button;

      var c = {};

      c["App"] = [
        '<button class="dark auto_update_app_button" onclick="auto_update_screen.checkAppUpdate();">Check for Updates</button><em class="auto_update_app_message" style="white-space: nowrap;"></em>',
        generate_button( "Choose robot", "developer_screen.open_choose_robot();" ),
        generate_button( "Select customer", "developer_screen.ask_to_change_only_tablet();" ),
        generate_button( "App language and units", "settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'general_settings_screen', '#language_header' );" ),
        generate_button("Reset user contact information", "userInformationController.destroyUserInformation()")
      ];

     c["Tablet"] = [
      //  generate_app_button( "location" ),
       generate_app_button( "active_key" ),
       generate_app_button( "side_key" ),
     ];

      c["Connectivity"] = [
        generate_app_button( "roaming" ),
        generate_app_button( "apn" )
      ];

      c["Robot"] = [
        generate_button( "Check APN", "settings_screeen_controller.choose_menu( 'wifi_screen_header', 'wifi_settings_screen', '#wifi_settings_screen #modem_tab_content' );", !robot_controller.chosen_robot.online ),
        generate_button( "Check NTRIP", "settings_screeen_controller.choose_menu( 'communication_settings_header', 'communication_settings_screen', '#communication_settings_screen #bluetooth_tab_content' );", !robot_controller.chosen_robot.online )
      ];

      c["Keyboard"] = [
        generate_app_button( "keyboard" )
      ];

      c["Finalize"] = [
        generate_button( "Set user level", "developer_screen.open_select_user_level( 1 )" )
      ];

      shipment_prep_screen.generate_sections( "#customer_preparation_screen", c );
    } );
  },
  generate_shipment_preparation: function()
  {
    shipment_prep_screen.check_all_apps( function()
    {
      var generate_button = shipment_prep_screen.generate_button;
      var generate_app_button = shipment_prep_screen.generate_app_button;

      var c = {};

      c["App"] = [
        '<button class="dark auto_update_app_button" onclick="auto_update_screen.checkAppUpdate();">Check for Updates</button><em class="auto_update_app_message" style="white-space: nowrap;"></em>',
        generate_button( "Choose app type", "developer_screen.choose_app_type();" ),
        generate_button( "Choose robot", "developer_screen.open_choose_robot();" ),
        generate_button( "Select customer", "developer_screen.ask_to_change_only_tablet();" ),
        generate_button( "App language and units", "settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'general_settings_screen', '#language_header' );" ),
        generate_button("Reset user contact information", "userInformationController.destroyUserInformation()")
      ];

      c["Keyboard"] = [
        generate_app_button( "keyboard" )
      ];

      c["Tablet"] = [
        generate_app_button( "remote_support" ),
        generate_app_button( "lock_screen" ),
        generate_app_button( "notification_icons" ),
        generate_app_button( "battery_percentage" ),
        generate_app_button( "volume" ),
        generate_app_button( "screen_timeout" ),
        generate_app_button( "location" ),
        generate_app_button( "active_key"),
        generate_app_button( "side_key" ),
      ];

      c["Connectivity"] = [
        generate_app_button( "roaming" ),
        generate_app_button( "apn" )
      ];

      c["Robot"] = [
        generate_button( "Check APN", "settings_screeen_controller.choose_menu( 'wifi_screen_header', 'wifi_settings_screen', '#wifi_settings_screen #modem_tab_content' );" ),
        generate_button( "Check NTRIP", "settings_screeen_controller.choose_menu( 'communication_settings_header', 'communication_settings_screen', '#communication_settings_screen #bluetooth_tab_content' );" )
      ];

      c["Finalize"] = [
        generate_button( "Set user level", "developer_screen.open_select_user_level( 1 )" )
      ];

      shipment_prep_screen.generate_sections( "#shipment_preparation_screen", c );
    } );
  },
  generate_sections: function( destination, content )
  {

    var c = "";

    var count = Object.keys( content ).length;

    Object.keys( content ).forEach( ( key, i ) => {
      c += shipment_prep_screen.generate_section( "Part " + (i + 1) + "/" + count + ": " + key, content[key] );
    } );

    $( destination ).html( c );
  },
  generate_section: function( header, content )
  {

    content = content.flat();

    var txt = '<section>';
    txt += '<h2>' + header + '</h2>';

    if( content.length > 0 )
    {
      txt += '<ol>';

      for( var i = 0; i < content.length; i++ )
      {
        if( content[i] )
          txt += '<li>' + content[i] + '</li>';
      }

      txt += '</ol>';
    }
    else
    {
      txt += "<p><em>No content available</em></p>";
    }
    txt += '</section>';

    return txt;
  },
  generate_button: function( text, onclick, disabled )
  {
    var txt = '<button class="dark" onclick="' + onclick + '"';
    if( disabled )
      txt += ' disabled';
    txt += '>' + text + '</button>';
    return txt;
  },
  generate_app_button: function( category )
  {
    var result = [ ];
    if( shipment_prep_screen.apps[category].active )
    {
      const config = {...shipment_prep_screen.apps[category].active};

      if( typeof (config.text) === "string" )
        config.text = [ config.text ];

      if( config.activity && typeof (config.activity) === "string" )
        config.activity = [ config.activity ];
      
      config.text.forEach( ( text, idx ) => {
        const singleConfig = {...config};
        if(config.activity)
          singleConfig.activity = config.activity[idx%config.activity.length]
        let txt = '<button class="dark" onclick=\'app_controller.startConfig(';
        txt += JSON.stringify( singleConfig );
        txt += ');\'>' + text + '</button>';
        result.push( txt );
      } );

    }
    return result;
  },
  check_all_apps_run: false,
  check_all_apps_count: 0,
  check_all_apps_count_total: 0,
  check_all_apps: function( callback )
  {
    if( shipment_prep_screen.check_all_apps_run )
    {
      callback();
      return;
    }

    shipment_prep_screen.check_all_apps_count = 0;
    shipment_prep_screen.check_all_apps_count_total = 0;
    Object.keys( shipment_prep_screen.apps ).forEach( ( category ) =>
    {
      Object.keys( shipment_prep_screen.apps[category] ).forEach( ( app ) =>
      {
        if( app !== "active" )
          shipment_prep_screen.check_all_apps_count_total++;
      } );
    } );

    var apps = JSON.parse( JSON.stringify( shipment_prep_screen.apps ) );
    Object.keys( apps ).forEach( function( category )
    {
      shipment_prep_screen.apps[category].active = false;
      Object.keys( apps[category] ).forEach( function( app )
      {
        if( app !== "active" )
        {
          var theapp = apps[category][app];
          app_controller.check( (theapp.package ? theapp.package : theapp.application), function( res )
          {
            if( res )
              shipment_prep_screen.apps[category].active = theapp;

            if( ++shipment_prep_screen.check_all_apps_count === shipment_prep_screen.check_all_apps_count_total )
              callback();

          } );
        }
      } );
    } );
    shipment_prep_screen.check_all_apps_run = true;
  },

  apps: {
    keyboard: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch (device.version) {
            case "12":
              res = {
                package: "com.android.settings",
                activity: "com.android.settings.Settings$VirtualKeyboardActivity",
                text: ['Samsung Keyboard > Languages and types > Manage input language',
                'Samsung Keyboard > Predictive text > Turn OFF',
                'Samsung Keyboard > Suggest stickers while typing > Turn OFF',
                'Samsung Keyboard > Keyboard toolbar > Turn OFF']
              };
              break;
            case "11":
            case "10":
              res = {
                package: "com.android.settings",
                activity: "com.android.settings.Settings$VirtualKeyboardActivity",
                text: ['Samsung Keyboard > Languages and types > Manage input language',
                  'Samsung Keyboard > Smart typing > Predictive text > Turn OFF',
                  'Samsung Keyboard > Smart typing > Suggest stickers while typing > Turn OFF',
                  'Samsung Keyboard > keyboard layout > Keyboard toolbar > Turn OFF']
              };
              break;
            case "9":
              res = {
                package: "com.android.settings",
                activity: "com.android.settings.Settings$VirtualKeyboardActivity",
                text: ['Samsung Keyboard > Languages and types > Manage input language',
                  'Samsung Keyboard > Smart typing > Predictive text > Turn OFF',
                  'Samsung Keyboard > keyboard layout > Keyboard toolbar > Turn OFF']
              };
              break;
            case "8.1.0":
            default:
              res = {
                application: 'com.google.android.inputmethod.latin',
                text: 'Select Gboard keyboard Language'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    remote_support: {
      teamviewer: {
        application: 'com.teamviewer.host.samsung',
        text: 'Check TeamViewer'
      },
      knox_remote: {
        package: 'com.sds.emm.sers',
        activity: 'com.sds.emm.rs.activity.ERSActivity',
        text: 'Check Knox Remote Support'
      }
    },
    lock_screen: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$LockscreenSettingsActivity',
                text: 'Screen lock type > None'
              };
              break;
            case "11":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$LockscreenSettingsActivity',
                text: 'Screen lock type > None'
              };
              break;
            case "10":
            case "9":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.password.ScreenLockSuggestionActivity',
                text: 'Screen lock type > None'
              };
              break;
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$ScreenLockSuggestionActivity',
                text: 'Screen lock type > None'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    notification_icons: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$ConfigureNotificationMoreSettingsActivity',
                text: 'Show notification icons > None'
              };
              break;
            case "11":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings',
                text: 'Notifications > Advanced settings > Show notification icons > None'
              };
              break;
            case "10":
            case "9":
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$StatusBarActivity',
                text: 'Notification icons > Turn OFF'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    battery_percentage: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$ConfigureNotificationMoreSettingsActivity',
                text: 'Show battery percentage > Turn ON'
              };
              break;
              case "11":
                res = {
                  package: 'com.android.settings',
                  activity: 'com.android.settings.Settings',
                  text: 'Notifications > Advanced settings > Show battery percentage > Turn ON'
                };
                break;
            case "10":
            case "9":
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$StatusBarActivity',
                text: 'Battery percentage > Turn ON'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    roaming: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
            case "11":
            case "10":
            case "9":
              res = {
                package: 'com.samsung.android.app.telephonyui',
                activity: 'com.samsung.android.app.telephonyui.netsettings.ui.NetSettingsActivity',
                text: 'Data roaming > Turn ON'
              };
              break;
            case "8.1.0":
            default:
              res = {
                package: 'com.samsung.networkui',
                activity: 'com.samsung.networkui.MobileNetworkSettings',
                text: 'Data roaming > Turn ON'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    apn: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
            case "11":
            case "10":
            case "9":
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
//                activity: 'com.android.settings.Settings$ApnSettingsActivity',
                intent: 'android.settings.APN_SETTINGS',
                text: 'Check APN'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    volume: {
      android: {
        package: 'com.android.settings',
        activity: 'com.android.settings.Settings$SoundSettingsActivity',
        text: 'Use Volume keys for media > Turn ON'
      }
    },
    screen_timeout: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
            case "11":
            case "10":
            case "9":
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$ScreenTimeoutActivity',
                text: 'Screen timeout > 15 seconds'
              };
              break;
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
                activity: 'com.android.settings.Settings$DisplaySettingsActivity',
                text: 'Screen timeout > 15 seconds'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    location: {
      get pkg()
      {
        var res = {};
        if( window.cordova && device )
          switch( device.version )
          {
            case "12":
            case "11":
            case "10":
              res = {};
              break;
            case "9":
            case "8.1.0":
            default:
              res = {
                package: 'com.android.settings',
//                activity: 'com.android.settings.Settings$ApnSettingsActivity',
                intent: 'android.settings.LOCATION_SOURCE_SETTINGS',
                text: 'Turn Location Off and On again'
              };
          }
        return res;
      },
      set pkg( v )
      {
      }
    },
    active_key: {
      get pkg()
      {
        var res = {};
        if(window.cordova && device){
          switch( device.version )
          {
            case "12":
            case "11":
              default:
                res = {
                  package: "com.android.settings",
                  activity: "com.android.settings.Settings$ActiveKeySettingsActivity",
                  text: ["Press > Turn OFF", "Press and hold > Turn OFF"] 
                };
          }
          return res;
        }
      },
      set pkg( v )
      {
    }
    },
    side_key: {
      get pkg()
      {
        var res = {};
        if(window.cordova && device){
          switch( device.version )
          {
            case "12":
            case "11":
              default:
                res = {
                  package: "com.android.settings",
                  activity: "com.android.settings.Settings$FunctionKeySettingsActivity",
                  text: "Select Power off menu"
                };
          }
          return res;
        }
      },
      set pkg( v )
      {
      }
    },
  }
};
event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "shipment_preparation_screen" )
    shipment_prep_screen.generate_shipment_preparation();
  if( settings_screen_name === "customer_preparation_screen" )
    shipment_prep_screen.generate_customer_preparation();
} );