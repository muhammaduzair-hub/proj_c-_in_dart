/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, communication_controller, event_controller, message_controller */

var ntrip_settings_controller = {
  ntrip_settings: {
    server: "",
    port: "",
    username: "",
    password: "",
    mountpoint: ""
  },
  reload_settings: function()
  {
    communication_controller.send( 'get_ntrip_settings', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  got_ntrip_settings: function( new_settings )
  {
    ntrip_settings_controller.ntrip_settings = new_settings;
    $( "#ntrip_settigs_menu #ntrip_server_input" ).val( new_settings.server );
    $( "#ntrip_settigs_menu #ntrip_port_input" ).val( new_settings.port );
    $( "#ntrip_settigs_menu #ntrip_username_input" ).val( new_settings.username );
    $( "#ntrip_settigs_menu #ntrip_password_input" ).val( new_settings.password );
    $( "#ntrip_settigs_menu #ntrip_mountpoint_input" ).val( new_settings.mountpoint );

    if( new_settings["Wrong NTRIP server"] )
    {
      $( "#ntrip_settigs_menu #ntrip_server_input" ).addClass( "red" );
      $( "#ntrip_settigs_menu #ntrip_port_input" ).addClass( "red" );
    }
    else
    {
      $( "#ntrip_settigs_menu #ntrip_server_input" ).removeClass( "red" );
      $( "#ntrip_settigs_menu #ntrip_port_input" ).removeClass( "red" );
    }

    if( new_settings["Wrong NTRIP login"] )
    {
      $( "#ntrip_settigs_menu #ntrip_username_input" ).addClass( "red" );
      $( "#ntrip_settigs_menu #ntrip_password_input" ).addClass( "red" );
    }
    else
    {
      $( "#ntrip_settigs_menu #ntrip_username_input" ).removeClass( "red" );
      $( "#ntrip_settigs_menu #ntrip_password_input" ).removeClass( "red" );
    }

    if( new_settings["Wrong NTRIP mountpoint"] )
    {
      $( "#ntrip_settigs_menu #ntrip_mountpoint_input" ).addClass( "red" );
    }
    else
    {
      $( "#ntrip_settigs_menu #ntrip_mountpoint_input" ).removeClass( "red" );
    }
    /*ntrip_settings_controller.ntrip_settings.available_mountpoints = ntrip_settings_controller.ntrip_settings.available_mountpoints.map( function ( mountpoint ) {
     var point = mountpoint.replace( /\[/g, "" ).replace( /\]/g, "" ).replace( /\"/g, "" ).replace( /\'/g, "" ).split( "," )[0].trim();
     var type = mountpoint.replace( /\[/g, "" ).replace( /\]/g, "" ).replace( /\"/g, "" ).replace( /\'/g, "" ).split( "," )[2].trim();
     return [point, type];
     } );*/


  },
  save_settings: function()
  {
    var ntrip_settings = {
      ntrip_address: $( "#ntrip_settigs_menu #ntrip_server_input" ).val(),
      ntrip_port: parseInt( $( "#ntrip_settigs_menu #ntrip_port_input" ).val() ),
      ntrip_username: $( "#ntrip_settigs_menu #ntrip_username_input" ).val(),
      ntrip_password: $( "#ntrip_settigs_menu #ntrip_password_input" ).val(),
      ntrip_mountpoint: $( "#ntrip_settigs_menu #ntrip_mountpoint_input" ).val()
    };
    ntrip_settings_controller.ntrip_settings = ntrip_settings;
    console.log( ntrip_settings );
    communication_controller.send( 'set_ntrip_settings', {
      robot: robot_controller.chosen_robot_id,
      ntrip_settings: ntrip_settings
    }, "all", 10 );
  }
};

message_controller.events.add_callback( "ntrip_settings", ntrip_settings_controller.got_ntrip_settings );

