const APP_VERSION_NUMBER = "v9.6.18";
var AppType = "TinyMobileRobots";

const DEBUG_MODE = false;

var last_test_callback_arg = 0;
function test_callback( arg )
{
  last_test_callback_arg = arg;
  console.log( arg );
}
function test_error_callback( arg )
{
  console.log( "Error : ", arg );
}

function cordovaReady()
{
  clearTimeout( failsafe_timeout );

  if( started_with_cordova )
  {

    if( cordova.plugins.autoStart)
    {
      cordova.plugins.autoStart.enable();
    }

    if( cordova.InAppBrowser )
    {
      window.open = cordova.InAppBrowser.open;
    }

    if( cordova.plugins.CorHttpd )
    {
      // https://github.com/floatinghotpot/cordova-httpd
      local_server = cordova.plugins.CorHttpd;
      if( local_server )
      {
        // Check if server already exists
        local_server.getURL( ( url ) => {
          if( url.length > 0 )
          {
            console.log( "Local server found at", url );
            LOAD_PROJ( url );
          }
          else
          {
            console.log( "Local server not found. Starting..." );

            const options = {
              'www_root': '', // App root
              'port': 12345,
              'localhost_only': true
            };
            const success_callback = ( url ) => {
              console.log( "Local server started at", url );
              LOAD_PROJ( url );
              ;
            };
            const error_callback = ( error ) => {
              console.error( "Local server failed to start", error );
              navigator.app.exitApp();
            };
            local_server.startServer( options, success_callback, error_callback );
          }
        } );
      }
    }
  }
  else
  {
    device = {version: "11"};
    LOAD_PROJ();
  }

  device.versionArray = device.version.split(".").map(v=>parseInt(v));

}

function onDeviceReady()
{
  time.boot = time.now;

  auto_update_screen.deleteUpdateApk();

  AppType = localStorage.getItem( "app.type" );
  robot_behaviour_settings_screen.load_user_params_from_local_storage();

  if( !AppType || AppType === "null" )
    AppType = document.location.search.substring( 1 );
  if( !AppType )
    developer_screen.choose_app_type();

  event_controller.add_callback("app_server_connection_established", developer_screen.transmitAppTypeToServer);

  app_scecific_setup();

  document.title = AppType;

  // $( "#version-number" ).text( APP_VERSION_NUMBER );
  clearTimeout( failsafe_timeout );
  console.log( "started_with_cordova", started_with_cordova );

  developer_screen.load_last_developer_mode();

  // Lock screen orientation to primary landscape mode
  // cordova plugin add cordova-plugin-screen-orientation
  screen.orientation.lock( 'landscape-primary' ).then( function success()
  {
    console.log( "Successfully locked the orientation" );
  }, function error( errMsg )
  {
    console.log( "Error locking the orientation :: " + errMsg );
  } );
  window.addEventListener( "orientationchange", function()
  {
    console.log( screen.orientation.type ); // e.g. portrait
    joystick_controller.restart_joystick_timeout = setTimeout( joystick_controller.restart_joystick, 200 );
    setTimeout( function()
    {
      $( "#popup-sizer" ).height( $( "body" ).height() - 60 );
    }, 200 );
  } );

  // Start other services
  setTimeout( remove_loading_screen, started_with_cordova ? 1000 : 1000 );

  if( typeof (Storage) !== "undefined" )
  {
    var language = localStorage.getItem( "language" );
    if( !language )
      language = "en";
    translation.set_language( language );

    const robot_list_msg = localStorage.getItem( "robotlist" );
    if( robot_list_msg )
    {
      message_controller.handle_message( robot_list_msg );
    }

    robot_controller.try_choose_old_robot();

    templateshop_controller.load_templateshop();
  }
  translate_screen();

  joystick_controller.use_internet = !window.networking;
  if( AppType !== APP_TYPE.TinyRemote )
  {
    gps_controller.start();
  }

  custom_map_controller.init();
  map_controller.background.start_map();
  JobLoader.loadLocalJobs();
  communication_controller.syncTime();

  communication_controller.createInitialAppServerConnection();
  blue.connect_to_robot();

  login_screen_controller.show_login();
  joystick_controller.start_joystick();
  setTimeout( function()
  {
    map_controller.background.map.updateSize();
  }, 2000 );

  general_settings_screen.load_stored_values();
  custom_map_screen.load_stored_maps();
  custom_projection_controller.init();
  position_settings_screen.recently_used.load();
  totalstation_controller.init();
  try
  {
    file_controller.initDirectory();
  }
  catch( e )
  {
    console.warn( e );
  }

  if( AppType === APP_TYPE.TinyRemote )
  {
    taranis_screen_controller.open();
  }

  settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'general_settings_screen' );

  $( "input" ).keyup( function( e )
  {
    if( e.which === 13 )
    {
      console.log( "Enter key was pressed in input field #" + $( this ).attr( "id" ) );
      $( this ).blur();
    }
  } );
  $( "form" ).submit( function( event )
  {
    event.preventDefault();
  } );

  app_controller.init();
  keyboard_controller.init();

  // Validate input number value
  $( "input[type=number]" ).on( "focus change blur keyup", keyboard_controller.add_minus );
  $( "input[type=number]" ).on( "focus change blur keyup", keyboard_controller.validate );

  screen_lock_controller.initializeOnStartup();

  if( AppType === APP_TYPE.TinySurveyor )
    settings_screeen_controller.changed_nozzle_type( nozzleTypes.CONE );
  event_controller.call_callback( "app_specific_setup_done" );

  developer_screen.report_joystick_force_over_internet();

  uncaughtErrorBind();
}

document.addEventListener( 'deviceready', cordovaReady, false );
event_controller.add_callback( "PROJ_LOADED", onDeviceReady );
var started_with_cordova = true;
var failsafe_timeout = 0;


function loadScript( src, onload_callback, async = true)
{
  const script = document.createElement( 'script' );
  script.src = src;
  script.async = async;
  script.onreadystatechange = onload_callback;
  script.onload = onload_callback;
  document.head.appendChild( script );
}
var local_server = null;
//var PROJ = null;
const LOAD_PROJ = function( url = 'http://192.168.100.5/proj')
{
  const proj_path = (url ? url + '/' : '') + 'wasm/proj';
  loadScript( `${proj_path}/proj_wasm.min.js`, () => {
  console.log("*********************",url);
    PROJ.init( proj_path, ( err ) => {
      console.log( `Proj loaded ${err ? "with" : "without"} error` );

      // If "err" is undefined the library is ready to use
      if( err === undefined )
      {
        globalProjectorFactory.clear();
        map_controller.background.refreshh_jobs_drawing();
        event_controller.call_callback( "PROJ_LOADED" );
      }
//      PROJ = proj;
    } );
  } );
};

$( document ).ready( function()
{
  failsafe_timeout = setTimeout( function()
  {
    if( window.cordova )
      return;
    started_with_cordova = false;
    cordovaReady();
  }, 1000 );
} );

const __uncaughtErrorSendList = {};
function uncaughtErrorSend( msg )
{
  if (login_screen_controller.user_level === user_level.DEVELOPER) {
    // Do not send error to server if user is developer
    // This is to avoid sending errors from development environment
    return;
  }

  if( __uncaughtErrorSendList[msg] ) {
    // Do not send same error twice
    __uncaughtErrorSendList[msg]++;
    return;
  }
  
  __uncaughtErrorSendList[msg] = 1;
  communication_controller.send_key_val( "Error", msg );
}
function uncaughtErrorBind()
{
  uncaughtErrorSend( "None" );
  window.addEventListener( "error", function( e )
  {
    var msg = !!e && !!e.error && !!e.error.stack ? e.error.stack : !!e && !!e.error ? e.error : !!e ? e : "Unknown error";
    uncaughtErrorSend( msg );

    // Show warning
    if( SETTINGS.show_error_dialog )
    {
      var diag_header = translate["ErrorDiagGenericHeader"];
      var diag_body = translate["ErrorDiagGenericBody"];
      if( e.error.message )
        diag_body += "<br><br>" + translate["Error: %1s"].format( e.error.message );

      popup_screen_controller.confirm_popup( diag_header, diag_body, translate["OK"], undefined, function()
      {
        popup_screen_controller.close();
      } );
    }
    return false;
  } );
}

function nothing()
{}

var time = {
  _boot: 0,
  get boot()
  {
    return time._boot;
  },
  set boot( v )
  {
    if( !time._boot )
      time._boot = v;
  },
  get up()
  {
    return time.now - time.boot;
  },
  set up( v )
  {},
  get now()
  {
    return performance.now();
  },
  set now( v )
  {}
};
var system_time = time;

logger.debug_original = logger.debug;
logger.debug_enable = function( state )
{
  if( state )
  {
    logger.debug = logger.debug_original;
  }
  else
  {
    logger.debug = function() {};
  }
};
logger.debug_enable( DEBUG_MODE );