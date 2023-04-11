/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global robot_controller, event_controller */

var gps_controller = {
  watchID: '',
  last_position: [ 10.192556196177037, 56.043784159515866 ], // TinyOffice
  last_pos_object: null,
  use_fake_position: false,
  fake_position: [175.150870436, -37.6735795991],
  fake_object: {
    coords: {
      accuracy: 11.592000007629395,
      latitude: 56.041864,
      longitude: 10.192317,
    },
    timestamp: 1616751421609
  },
  toObject( position )
  {
    return {
      coords: {
        accuracy: position.coords.accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: null
      },
      timestamp: position.timestamp
    };
  },
  start: function()
  {
    function onSuccess( position )
    {
      position = gps_controller.toObject( position );

      if(gps_controller.use_fake_position)
      {
        position.coords.latitude = gps_controller.fake_position[1];
        position.coords.longitude = gps_controller.fake_position[0];
      }

      gps_controller.last_position = [ position.coords.longitude, position.coords.latitude, position.coords.accuracy ];
      gps_controller.last_pos_object = position;
      event_controller.call_callback( "got_user_position", gps_controller.last_position );
    }
    function onError( error )
    {
      console.group( "User position" );
      console.warn( "Error", error );

//      if( robot_controller.has_chosen_robot_position )
//      {
//        console.log( "Using robot position instead" );
//        gps_controller.last_position = robot_controller.chosen_robot.longlat;
//        event_controller.call_callback( "got_user_position", gps_controller.last_position );
//        setTimeout( function()
//        {
//          gps_controller.start();
//        }, 500 );
//      }
//      else if( !robot_controller.has_chosen_robot_position && SETTINGS.show_missing_tablet_position_dialog )
      if( SETTINGS.show_missing_tablet_position_dialog )
      {
        popup_screen_controller.confirm_popup( translate["ErrorTabletPosition"], translate["ErrorContantSupportPersist"], translate["OK"], translate["Don't show again"], function()
        {
          popup_screen_controller.close();
          setTimeout( function()
          {
            gps_controller.start();
          }, 500 );
        }, function()
        {
          SETTINGS.show_missing_tablet_position_dialog = false;
          popup_screen_controller.close();
          setTimeout( function()
          {
            gps_controller.start();
          }, 500 );
        } );
      }
      console.groupEnd();

    }
    if(gps_controller.use_fake_position)
    {
      onSuccess(gps_controller.fake_object)
    }
    else
    {
      gps_controller.watchID = navigator.geolocation.watchPosition( onSuccess, onError, {
        maximumAge: 10000,
        timeout: 15000,
        enableHighAccuracy: true
      } );
    }
    //navigator.geolocation.getCurrentPosition( onSuccess, onError, {maximumAge: 10000, timeout: 15000, enableHighAccuracy: true} );
  },
  stop: function()
  {
    if( gps_controller.watchID )
      navigator.geolocation.clearWatch( gps_controller.watchID );
    gps_controller.watchID = '';
  },
  getOne: function( callback )
  {
    function onSuccess( position )
    {
      position = gps_controller.toObject( position );
      gps_controller.last_position = [ position.coords.longitude, position.coords.latitude, position.coords.accuracy ];
      gps_controller.last_pos_object = position;
      event_controller.call_callback( "got_user_position", gps_controller.last_position );
      if( callback )
        callback( gps_controller.last_position );
    }
    function onError( error )
    {
      console.log( "user position error" );
      console.log( error );
      setTimeout( function()
      {
        //gps_controller.start();
      }, 500 );
    }
    navigator.geolocation.getCurrentPosition( onSuccess, onError, {
      maximumAge: 10000,
      timeout: 15000,
      enableHighAccuracy: true
    } );
  }
};
