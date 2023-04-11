/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global startApp */

var app_controller = {
  sa: '',
  init: function()
  {
    if( window.cordova && startApp )
    {
      // https://www.npmjs.com/package/com.lampa.startapp
      app_controller.sa = startApp;
    }
    else
    {
      app_controller.sa = function()
      {
        console.log( "startApp does not exist" );
      };
    }
  },
  startConfig: function( config, flag_new_task = true)
  {

    if( config.package && config.activity )
      config.component = [ config.package, config.activity ];

    if( flag_new_task )
      config.flags = [ 'FLAG_ACTIVITY_NEW_TASK', 'FLAG_ACTIVITY_CLEAR_TASK' ];

    app_controller.sa.set( config ).start( function()
    {
      // Success
      console.log( "Starting", config );
    }, function( err )
    {
      console.warn( "Error", err, "while starting", config );
    } );
  },
  start: function( package, activity, intent, flag_new_task = true)
  {
    var config = {};

    package = package ? package : null;
    activity = activity ? activity : null;
    intent = intent ? intent : null;

    var component = package && activity ? [ package, activity ] : null;

    if( package )
    {
      config.package = package;
      config.application = package;
    }
    if( component )
      config.component = component;
    if( intent )
      config.intent = intent;


    if( flag_new_task )
      config.flags = [ 'FLAG_ACTIVITY_NEW_TASK', 'FLAG_ACTIVITY_CLEAR_TASK' ];

    app_controller.startConfig( config );
  },
  check_result: false,
  check: function( package, callback, disable_selector, hide_instead_of_disable )
  {
    if( !callback )
      callback = function()
      {};

    if( window.cordova )
    {
      app_controller.sa.set( {
        package: package,
        application: package
      } ).check( function( success )
      {
        callback( true );
      }, function( error )
      {
        if( disable_selector )
        {
          if( hide_instead_of_disable )
            $( disable_selector ).addClass( "gone" );
          else
            $( disable_selector ).addClass( "disable" );
        }
        callback( false );
      } );
    }
    else
    {
      if( disable_selector )
        $( disable_selector ).addClass( "gone" );
      callback( false );
    }
  }
};