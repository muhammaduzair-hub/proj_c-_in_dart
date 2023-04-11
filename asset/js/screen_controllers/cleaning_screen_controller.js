/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, translation, robot_behaviour_settings_screen, SETTINGS, translate */

var cleaning_screen_controller = {
  is_open: false,

  open: function()
  {
    $( "#cleaning_screen" ).removeClass( "gone" );
    sprayToolUtilitiesController.stopTestSpray();
    cleaning_screen_controller.stop_all();
    cleaning_screen_controller.translate();
    cleaning_screen_controller.is_open = true;
    utilitiesScreenController.choose_utility_overlay.off();
  },
  translate: function()
  {
    $( "#cleaning_screen_title" ).html( translate["Cleaning the pump system"] );

    $( "#cleaning_screen #step1_header" ).html( translate["Empty_system_header"] );
    $( "#cleaning_screen #step1_info" ).html( translate["Empty_system_info"] );
    $( "#cleaning_screen #empty_system_button" ).html( translate["Empty system"] );

    $( "#cleaning_screen #step2_header" ).html( translate["Rinse_system_header"] );
    $( "#cleaning_screen #step2_info" ).html( translate["Rinse_system_info"] );
    $( "#cleaning_screen #rinse_system_button" ).html( translate["Rinse system"] );

    $( "#cleaning_screen #step3_header" ).html( translate["Clean_nozzle_header"] );
    $( "#cleaning_screen #step3_info" ).html( translate["Clean_nozzle_info"] );
    $( "#cleaning_screen #clean_nozzle_button" ).html( translate["Clean nozzle"] );

//    $( "#cleaning_screen #step3_header" ).html( translate["Clean_valve_header"] );
//    $( "#cleaning_screen #step3_info" ).html( translate["Clean_valve_info"] );
    $( "#developer_cleaning_screen #clean_valve_button" ).html( translate["Clean valve"] );

    $( "#cleaning_screen #step4_header" ).html( translate["Clean_nozzle_and_filter_header"] );
    $( "#cleaning_screen #step4_info" ).html( translate["Clean_nozzle_and_filter_info"] );
  },
  stop_all: function()
  {
    if( cleaning_screen_controller.emptying_system )
      cleaning_screen_controller.empty_system();

    if( cleaning_screen_controller.rinsing_system )
      cleaning_screen_controller.rinse_system();

    if( cleaning_screen_controller.cleaning_nozzle )
      cleaning_screen_controller.clean_nozzle();
  },
  close: function()
  {
    $( "#cleaning_screen" ).addClass( "gone" );
    sprayToolUtilitiesController.stopTestSpray();
    cleaning_screen_controller.stop_all();
    cleaning_screen_controller.is_open = false;
  },

  wiggle_active: function()
  {
    if( cleaning_screen_controller.emptying_system )
    {
      $( "#cleaning_screen #empty_system_button" ).addClass( "animated flash" );
      $( "#cleaning_screen #empty_system_button" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
      {
        $( "#cleaning_screen #empty_system_button" ).removeClass( "animated flash" );
      } );
    }

    if( cleaning_screen_controller.rinsing_system )
    {
      $( "#cleaning_screen #rinse_system_button" ).addClass( "animated flash" );
      $( "#cleaning_screen #rinse_system_button" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
      {
        $( "#cleaning_screen #rinse_system_button" ).removeClass( "animated flash" );
      } );
    }

    if( cleaning_screen_controller.cleaning_nozzle )
    {
      $( "#cleaning_screen #clean_nozzle_button" ).addClass( "animated flash" );
      $( "#cleaning_screen #clean_nozzle_button" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
      {
        $( "#cleaning_screen #clean_nozzle_button" ).removeClass( "animated flash" );
      } );
    }

    if( cleaning_screen_controller.cleaning_valve )
    {
      $( "#developer_cleaning_screen #clean_valve_button" ).addClass( "animated flash" );
      $( "#developer_cleaning_screen #clean_valve_button" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
      {
        $( "#developer_cleaning_screen #clean_valve_button" ).removeClass( "animated flash" );
      } );
    }
  },

  emptying_system: false,
  emptying_system_timeout: '',
  empty_system: function()
  {
    if( cleaning_screen_controller.rinsing_system || cleaning_screen_controller.cleaning_nozzle || cleaning_screen_controller.cleaning_valve )
    {
      cleaning_screen_controller.wiggle_active();
      return;
    }

    // timeout or until click again
    clearInterval( cleaning_screen_controller.emptying_system_timeout );
    if( !cleaning_screen_controller.emptying_system )
    {
      var i = 10;
      cleaning_screen_controller.emptying_system_timeout = setInterval( function()
      {
        i -= 1;
        $( "#cleaning_screen #empty_system_button" ).html( translate["Emptying"] + "... " + i + "<br>" + translate["Click to stop"] );
        if( i === 0 )
          cleaning_screen_controller.empty_system();
      }, 1000 );
      $( "#cleaning_screen #empty_system_button" ).html( translate["Emptying"] + "... " + i + "<br>" + translate["Click to stop"] );
      $( "#cleaning_screen #empty_system_button" ).attr( "class", "chosen" );
      robot_controller.pump( true );
    }
    else
    {
      $( "#cleaning_screen #empty_system_button" ).html( translate["Empty system"] );
      $( "#cleaning_screen #empty_system_button" ).attr( "class", "dark" );
      robot_controller.pump( false );
    }
    cleaning_screen_controller.emptying_system = !cleaning_screen_controller.emptying_system;
  },
  rinsing_system: false,
  rinse_system: function( let_pump_stay_open )
  {

    if( cleaning_screen_controller.cleaning_nozzle )
    {
      cleaning_screen_controller.clean_nozzle( true );
    }
    if( cleaning_screen_controller.cleaning_valve )
    {
      cleaning_screen_controller.clean_valve( true );
    }

    if( cleaning_screen_controller.emptying_system )
    {
      cleaning_screen_controller.wiggle_active();
      return;
    }


    // untill click again
    if( !cleaning_screen_controller.rinsing_system )
    {
      $( "#cleaning_screen #rinse_system_button" ).html( translate["Rinsing"] + "... " + "<br>" + translate["Click to stop"] );
      $( "#cleaning_screen #rinse_system_button" ).attr( "class", "chosen" );
      robot_controller.pump( true );
    }
    else
    {
      $( "#cleaning_screen #rinse_system_button" ).html( translate["Rinse system"] );
      $( "#cleaning_screen #rinse_system_button" ).attr( "class", "dark" );
      if( !let_pump_stay_open )
        robot_controller.pump( false );
    }
    cleaning_screen_controller.rinsing_system = !cleaning_screen_controller.rinsing_system;


    

  },
  cleaning_nozzle: false,
  clean_nozzle: function( let_pump_stay_open )
  {

    if( cleaning_screen_controller.rinsing_system )
    {
      cleaning_screen_controller.rinse_system( true );
    }
    if( cleaning_screen_controller.cleaning_valve )
    {
      cleaning_screen_controller.clean_valve( true );
    }

    if( cleaning_screen_controller.emptying_system )
    {
      cleaning_screen_controller.wiggle_active();
      return;
    }


    // untill click again
    if( !cleaning_screen_controller.cleaning_nozzle )
    {
      $( "#cleaning_screen #clean_nozzle_button" ).html( translate["Cleaning..."] + "<br>" + translate["Click to stop"] );
      $( "#cleaning_screen #clean_nozzle_button" ).attr( "class", "chosen" );
      sprayToolUtilitiesController.startTestSpray();
    }
    else
    {
      $( "#cleaning_screen #clean_nozzle_button" ).html( translate["Clean nozzle"] );
      $( "#cleaning_screen #clean_nozzle_button" ).attr( "class", "dark" );
      sprayToolUtilitiesController.stopTestSpray(let_pump_stay_open);
    }
    cleaning_screen_controller.cleaning_nozzle = !cleaning_screen_controller.cleaning_nozzle;
    cleaning_screen_controller.disable_button("clean_nozzle_button", 500);


  },
  cleaning_valve: false,
  clean_valve: function( let_pump_stay_open )
  {
    if( cleaning_screen_controller.rinsing_system )
    {
      cleaning_screen_controller.rinse_system( true );
    }
    if( cleaning_screen_controller.cleaning_nozzle )
    {
      cleaning_screen_controller.clean_nozzle( true );
    }

    if( cleaning_screen_controller.emptying_system )
    {
      cleaning_screen_controller.wiggle_active();
      return;
    }

    // untill click again
    if( !cleaning_screen_controller.cleaning_valve )
    {
      $( "#developer_cleaning_screen #clean_valve_button" ).html( translate["Cleaning..."] + "<br>" + translate["Click to stop"] );
      $( "#developer_cleaning_screen #clean_valve_button" ).attr( "class", "chosen" );
      message_controller.events.add_callback( 'ok', cleaning_screen_controller.clean_valve_spray );

      robot_controller.pump( true );
      robot_controller.spray( 2000 );

    }
    else
    {
      $( "#developer_cleaning_screen #clean_valve_button" ).html( translate["Clean valve"] );
      $( "#developer_cleaning_screen #clean_valve_button" ).attr( "class", "dark" );
      message_controller.events.remove_callback( 'ok', cleaning_screen_controller.clean_valve_spray );
      if( !let_pump_stay_open )
        robot_controller.pump( false );
    }
    cleaning_screen_controller.cleaning_valve = !cleaning_screen_controller.cleaning_valve;

  },
  cleaning_valve_spray_state: false,
  clean_valve_spray: function( data )
  {
    if( data.topic !== 'spray' )
      return;

    if( cleaning_screen_controller.cleaning_valve_spray_state )
    {
      console.log( 'valve off' );
      cleaning_screen_controller.cleaning_valve_spray_state = !cleaning_screen_controller.cleaning_valve_spray_state;
      robot_controller.spray( 1 );
    }
    else
    {
      console.log( 'valve on' );
      cleaning_screen_controller.cleaning_valve_spray_state = !cleaning_screen_controller.cleaning_valve_spray_state;
      robot_controller.spray( 2000 );
    }
  },

  disable_button: function(id, timeInMilliSecond)
  {
    var btn = document.getElementById(id);
    btn.disabled = true;
    setTimeout(function(){btn.disabled = false;}, timeInMilliSecond);
  },

};



$( document ).ready( function()
{

//  bottom_bar_chooser.events.before_close.add_callback( "#robot-selected", cleaning_screen_controller.stop_test_spray );

} );