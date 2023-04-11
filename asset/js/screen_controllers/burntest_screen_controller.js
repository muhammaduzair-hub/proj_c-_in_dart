/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global settings_screeen_controller, robot_controller */

var burntest_screen_controller = {
  is_open: false,
  open: function()
  {
    burntest_screen_controller.is_open = true;
    $( "#burn_in_test_screen" ).removeClass( "gone" );
    settings_screeen_controller.close();
  },
  close: function()
  {
    burntest_screen_controller.is_open = false;
    $( "#burn_in_test_screen" ).addClass( "gone" );
    burntest_screen_controller.stop_pump_test();
    settings_screeen_controller.open();

  },

  pump_test_running: false,
  pump_interval: "",
  on_time: 2.0,
  off_time: 2.0,
  toggle_pump_test: function()
  {
    if( !burntest_screen_controller.pump_test_running )
    {
      $( "#burn_in_test_screen #start_pump_test_button" ).removeClass( "dark" ).addClass( "chosen" ).text( "Stop pump test" );
      burntest_screen_controller.pump_test_running = true;
      burntest_screen_controller.start_pump_test();

    }
    else
    {
      burntest_screen_controller.stop_pump_test();
    }
  },
  stop_pump_test: function()
  {
    $( "#burn_in_test_screen #start_pump_test_button" ).removeClass( "chosen" ).addClass( "dark" ).text( "Start pump test" );
    burntest_screen_controller.pump_test_running = false;
    clearInterval( burntest_screen_controller.pump_interval );
    burntest_screen_controller.pump_interval = "";
    $( "#burn_in_test_screen #pump_indicator" ).removeClass( "chosen" ).addClass( "dark" ).text( "Spray off" );
    robot_controller.spray( 1 );
    robot_controller.pump( false );
  },
  start_pump_test: function()
  {
    if( burntest_screen_controller.pump_interval )
      clearInterval( burntest_screen_controller.pump_interval );
    robot_controller.pump( true );

    var c = 0;
    var update_freq = 100; // ms
    var is_on = false;
    burntest_screen_controller.pump_interval = setInterval( function()
    {
      c++;

      if( is_on )
      {
        if( !(c % 10) )
          robot_controller.spray( 2000 );
        if( (update_freq * c / 1000) >= burntest_screen_controller.on_time )
        {
          is_on = false;
          c = 0;
          $( "#burn_in_test_screen #pump_indicator" ).removeClass( "chosen" ).addClass( "dark" ).text( "Spray off" );
          robot_controller.spray( 1 );
        }
      }
      else
      {
        if( (update_freq * c / 1000) >= burntest_screen_controller.off_time )
        {
          is_on = true;
          c = 0;
          $( "#burn_in_test_screen #pump_indicator" ).addClass( "chosen" ).removeClass( "dark" ).text( "Spray on" );
          robot_controller.spray( 2000 );

        }
      }




    }, update_freq );
  },

  change_on_time_slider: function( new_value )
  {
    $( "#on_time_value" ).text( new_value + " s" );
    burntest_screen_controller.on_time = parseFloat( new_value );
  },
  change_off_time_slider: function( new_value )
  {
    $( "#off_time_value" ).text( new_value + " s" );
    burntest_screen_controller.off_time = parseFloat( new_value );
  }
};