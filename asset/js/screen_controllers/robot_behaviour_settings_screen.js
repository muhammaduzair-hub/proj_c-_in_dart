/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, message_controller, popup_screen_controller, settings_screeen_controller, parseFloat, event_controller, AppType, map_controller, math, translate */


var robot_behaviour_settings_screen = {
  _chosen_config: null,
  _list_of_configs: [],
  interval_id: null, 
  original_settings: null, 

  get chosen_config(){
    return this._chosen_config;
  },
  set chosen_config(v){
    this._chosen_config = v;
  },
  get list_of_configs(){
    return JSON.parse(localStorage.getItem("robot.user_params_list"));
  },
  set list_of_configs(v){
    localStorage.setItem("robot.user_params_list", JSON.stringify(v));
  },
  get is_open()
  {
    return settings_screeen_controller.chosen_menu === "robot_behaviour_settings_screen" && settings_screeen_controller.is_open;
  },
  set is_open( v )
  {},
  open: function()
  {
    /*
     * Create dynamic save button that responds to
     */
//    $( "#robot_behaviour_settings_screen #save_button" ).prop( "disabled", true );
//    $( '#robot_behaviour_settings_screen input' ).on( 'keyup change', function()
//    {
//      if( $( this ).val() !== $( this ).prop( "defaultValue" ) )
//        $( '#robot_behaviour_settings_screen #save_button' ).prop( "disabled", false );
//      else
//        $( '#robot_behaviour_settings_screen #save_button' ).prop( "disabled", true );
//    } );

    if( robot_controller.is_robot_version_more_or_equal( [ 6, 8, 0 ] ) )
      $( "#robot_behaviour_settings_screen #input_frequency_window_row" ).removeClass( 'gone' );
    else
      $( "#robot_behaviour_settings_screen #input_frequency_window_row" ).addClass( 'gone' );
      $("#overwrite_config_button").prop("disabled", true);
      $("#reload_config_button").prop("disabled", true);
      $("#delete_config_button").prop("disabled", true);
      $("#robot_behaviour_save_button").prop("disabled", true);
      $("#overwrite_config_button").text(translate["Overwrite"]);
      $("#reload_config_button").text(translate["Reset"]);
      $("#add_config_button").text(translate["New"]);
        localStorage.setItem("robot.user_params", JSON.stringify(robot_behaviour_settings_screen.user_params));
        tmp = localStorage.getItem("robot.user_params");
      robot_behaviour_settings_screen.original_settings = JSON.parse(tmp);
    robot_behaviour_settings_screen.update_ui_values(null, "current");
    robot_behaviour_settings_screen.load_config_dropdown_from_local_storage();
    if( AppType === APP_TYPE.TinyLineMarker )
    {
      $( "#robot_behaviour_settings_screen section:not(.gone)" ).addClass( "first-child" );
      $( "#robot_behaviour_settings_screen section:not(.gone) tr:not(.gone)" ).addClass( "last-child" );
    }
    robot_behaviour_settings_screen.interval_id = setInterval(()=>{robot_behaviour_settings_screen.save_settings(false, true)}, 500);
  },
  choose_behaviour_config( element){
    const val = $(element).val();
    if(!val){
      document.querySelector("#robot_behaviour_configurations_dropdown").value = "" + robot_behaviour_settings_screen.chosen_config + "";
      return;
    }
    robot_behaviour_settings_screen.chosen_config = val;
    $("#overwrite_config_button").prop("disabled", false);
    $("#delete_config_button").prop("disabled", false);
    $("#reload_config_button").prop("disabled", true);
    robot_behaviour_settings_screen.update_ui_values(robot_behaviour_settings_screen.chosen_config, "current");
  },
  user_config_event: (new MultiEventController()),
  user_params: {},
  got_user_params: function( data )
  {
    if( !data )
      return;

    data = data["/user"];

    //console.log( "Got /user reconfigure parameters" );
//    console.log( data );

    /*
     * Dashed parameters that require a refresh to the drawing
     */
    var changed_dash = false;
    if( !robot_behaviour_settings_screen.user_params && data.spray_space_length.current > 0 )
      changed_dash = true;

    if( data.spray_space_length && data.spray_line_length && robot_behaviour_settings_screen.user_params.spray_line_length && robot_behaviour_settings_screen.user_params.spray_space_length )
    {
      if( data.spray_space_length.current && data.spray_line_length.current !== robot_behaviour_settings_screen.user_params.spray_line_length.current )
        changed_dash = true;

      if( data.spray_space_length.current !== robot_behaviour_settings_screen.user_params.spray_space_length.current )
        changed_dash = true;
    }

    if( changed_dash )
      map_controller.background.refreshh_jobs_drawing();


    /*
     * Add keys and override existing values (for legacy support)
     * and update the presented UI values
     */
    Object.keys( data ).forEach( function( key )
    {
      var old_value;
      if( robot_behaviour_settings_screen.user_params[key] )
        old_value = robot_behaviour_settings_screen.user_params[key].current;

      robot_behaviour_settings_screen.user_params[key] = data[key];
      if( old_value !== data[key].current )
      {
        setTimeout( function()
        {
          robot_behaviour_settings_screen.user_config_event.call_callback( key, data[key].current );
        }, 0 );
      }
    } );

    if( !robot_behaviour_settings_screen.is_open )
      robot_behaviour_settings_screen.update_ui_values(robot_behaviour_settings_screen.chosen_config, "current");


  },

  update_ui_values: function( chosen_config = null, type)
  {
    if( !settings_screeen_controller.is_open )
      return;
    let data = null; 
    if(chosen_config){
      data = robot_behaviour_settings_screen.load_user_params_from_local_storage(false);
    }
    else if(!chosen_config){
      data = robot_behaviour_settings_screen.original_settings;
    }
    if( !data || data === undefined || !Object.keys( data ).length )
      return;

    const fn = robot_behaviour_settings_screen.format_number;

    $( "#robot_behaviour_settings_screen input[type=number]" ).removeClass( "warning_outline" );

    /*
     * Velocities. Manual, drive, spray
     */
    if( data.velocity_manual )
    {
      $( "#robot_behaviour_settings_screen #manuel_vel_input" ).val( data.velocity_manual[type] );
      robot_behaviour_settings_screen.change_velocity_slider( "manuel_vel_value", data.velocity_manual[type] );
    }
    if( data.velocity_drive )
    {
      $( "#robot_behaviour_settings_screen #drive_vel_input" ).val( data.velocity_drive[type] );
      robot_behaviour_settings_screen.change_velocity_slider( "drive_vel_value", data.velocity_drive[type] );
    }
    if( data.velocity_spray )
    {
      $( "#robot_behaviour_settings_screen #spray_vel_input" ).val( data.velocity_spray[type] );
      robot_behaviour_settings_screen.change_velocity_slider( "spray_vel_value", data.velocity_spray[type] );
    }

    /*
     * Line parameters. Length, space, ramp up, linepaint, spray offset start/stop
     */
    if( data.waypoint_spray_duration )
      $( "#robot_behaviour_settings_screen #spray_duration_value" ).val( data.waypoint_spray_duration[type] );
    if( data.waypoint_default_wait )
      $( "#robot_behaviour_settings_screen #default_wait_value" ).val( data.waypoint_default_wait[type] );

    if( data.spray_line_length )
      $( "#robot_behaviour_settings_screen #line_length_value" ).val( fn( data.spray_line_length[type] ) );
    if( data.spray_space_length )
      $( "#robot_behaviour_settings_screen #line_space_value" ).val( fn( data.spray_space_length[type] ) );
    if( data.linepaint_ramp_up )
      $( "#robot_behaviour_settings_screen #paint_ramp_up_value" ).val( fn( data.linepaint_ramp_up[type] ) );
    if( data.linepaint_ramp_down )
      $( "#robot_behaviour_settings_screen #paint_ramp_down_value" ).val( fn( data.linepaint_ramp_down[type] ) );


    if( robot_controller.robot_has_capability( "spray_offset_as_time" ) )
    {
      if( data.spray_time_offset_start )
        $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_value" ).val( data.spray_time_offset_start[type] );
      if( data.spray_time_offset_stop )
        $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_value" ).val( data.spray_time_offset_stop[type] );
    }
    else
    {
      if( data.linepaint_spray_offset_start )
        $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_value" ).val( fn( data.linepaint_spray_offset_start[type] ) );
      if( data.linepaint_spray_offset_stop )
        $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_value" ).val( fn( data.linepaint_spray_offset_stop[type] ) );
    }

    /*
     * Point parameters. Spray duration, waiting time, approach distance, waypoint radius (skal slettes)
     */
    if( data.waypoint_max_radius )
      $( "#robot_behaviour_settings_screen #waypoint_max_radius_value" ).val( fn( data.waypoint_max_radius[type] ) );
    if( data.waypoint_approach_dist )
      $( "#robot_behaviour_settings_screen #approach_dist_value" ).val( fn( data.waypoint_approach_dist[type] ) );

    /*
     * Buildup/geometry/general. Ant height, tool height, tool side, tool sideshift, caster front, nmea min freq
     */
    if( data.antenna_height )
      $( "#robot_behaviour_settings_screen #antenna_height_value" ).val( fn( data.antenna_height[type] ) );
    if( data.tool_height )
      $( "#robot_behaviour_settings_screen #tool_height_value" ).val( fn( data.tool_height[type] ) );
    if( data.tool_sideshift )
      $( "#robot_behaviour_settings_screen #tool_sideshift_value" ).val( fn( data.tool_sideshift[type] ) );


      // left,center,right
      if( data.tool_side )
        robot_behaviour_settings_screen.change_tool_side( data.tool_side[type] );
  //      $( "#robot_behaviour_settings_screen #tool_side_select" ).val( data.tool_side.current );


    // left,center,right
    if( data.turn_restrict )
    robot_behaviour_settings_screen.change_turn_restrict( robot_behaviour_settings_screen.get_turn_restrict_string_from_val( data.turn_restrict[type] ) );
//      $( "#robot_behaviour_settings_screen #turn_restrict_select" ).val( data.turn_restrict.current );

    // yes,no
    if( data.caster_front )
      robot_behaviour_settings_screen.change_caster_front( data.caster_front[type] ? "yes" : "no" );
//      $( "#robot_behaviour_settings_screen #caster_front_select" ).val( data.caster_front.current ? "yes" : "no" );


    /*
     * Calibration. Tool x/y, position time offset
     */
    if( data.tool_calibrate_x )
      $( "#robot_behaviour_settings_screen #tool_calibrate_x_value" ).val( fn( data.tool_calibrate_x[type] ) );

    if( data.tool_calibrate_y )
      $( "#robot_behaviour_settings_screen #tool_calibrate_y_value" ).val( fn( data.tool_calibrate_y[type] ) );

    if( data.position_time_offset )
      $( "#robot_behaviour_settings_screen #position_time_offset_value" ).val( data.position_time_offset[type] );

    /*
     * Other, ungrouped
     */
    if( data.external_baudrate && data.external_baudrate.enum )
      robot_behaviour_settings_screen.change_external_baudrate( data.external_baudrate[type] );
    else
      $("#robot_behaviour_settings_screen #external_baud_rate_row").addClass('gone');

    if( data.ts_frequency_min || data.gdm_frequency_min || data.csv_frequency_min || data.nmea_frequency_min )
    {
      let max = robot_behaviour_settings_screen.get_min_input_frequency( data );
      $( "#robot_behaviour_settings_screen #input_frequency_min_value" ).val( max );
    }
    if( robot_controller.is_robot_version_more_or_equal( [ 6, 8, 0 ] ) )
    {
      let max = robot_behaviour_settings_screen.get_input_frequency_window( data );
      $( "#robot_behaviour_settings_screen #input_frequency_window_value" ).val( max );
    }

    if( data.error_auto_resume )
      robot_behaviour_settings_screen.change_error_auto_resume( data.error_auto_resume[type] ? "yes" : "no" );

    if( robot_controller.robot_has_capability( "wheel_direction_individual" ) )
    {
      if( data.wheel_flip_ch1 )
        robot_behaviour_settings_screen.set_wheel_direction( "left", data.wheel_flip_ch1[type] ? "yes" : "no" );
      if( data.wheel_flip_ch2 )
        robot_behaviour_settings_screen.set_wheel_direction( "right", data.wheel_flip_ch2[type] ? "yes" : "no" );
    }

  },

  get_min_input_frequency: function( data )
  {
    if( !data )
      data = robot_behaviour_settings_screen.user_params;
    if( !data )
      return;

    let ts = parseFloat( data.ts_frequency_min ? data.ts_frequency_min.current : 0 );
    let gdm = parseFloat( data.gdm_frequency_min ? data.gdm_frequency_min.current : 0 );
    let csv = parseFloat( data.csv_frequency_min ? data.csv_frequency_min.current : 0 );
    let nmea = parseFloat( data.nmea_frequency_min ? data.nmea_frequency_min.current : 0 );
    return math.max( ts, gdm, csv, nmea );
  },

  get_input_frequency_window: function( data )
  {
    if( !data )
      data = robot_behaviour_settings_screen.user_params;
    if( !data )
      return;

    let ts = parseFloat( data.ts_frequency_window ? data.ts_frequency_window.current : 0 );
    let gdm = parseFloat( data.gdm_frequency_window ? data.gdm_frequency_window.current : 0 );
    let csv = parseFloat( data.csv_frequency_window ? data.csv_frequency_window.current : 0 );
    let nmea = parseFloat( data.nmea_frequency_window ? data.nmea_frequency_window.current : 0 );
    return math.max( ts, gdm, csv, nmea );
  },

  format_number( number, round_magnitude )
  {
    if( !round_magnitude || isNaN( round_magnitude ) )
      round_magnitude = 4;
    return number.meter2unit().round( round_magnitude );
  },

  tool_side: "",
  change_tool_side: function( new_value )
  {
    if( new_value === "left" || new_value === "center" || new_value === "right" )
    {
      robot_behaviour_settings_screen.tool_side = new_value;
      $( "#robot_behaviour_settings_screen #tool_side_select button" ).removeClass( "chosen" ).addClass( "bright" );
      $( "#robot_behaviour_settings_screen #tool_side_select #tool_side_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );
    }
    else
    {
      console.warn( "Tool side cannot be changed to", new_value );
    }
  },

  turn_restrict: 0,
  change_turn_restrict: function( new_value )
  {
    if( new_value === "left" || new_value === "none" || new_value === "right" )
    {
      robot_behaviour_settings_screen.turn_restrict = robot_behaviour_settings_screen.get_turn_restrict_val_from_string(new_value);
      $( "#robot_behaviour_settings_screen #turn_restrict_select button" ).removeClass( "chosen" ).addClass( "bright" );
      $( "#robot_behaviour_settings_screen #turn_restrict_select #turn_restrict_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );
    }
    else
    {
      console.warn( "Turn restrict cannot be changed to", new_value );
    }
  },
  get_turn_restrict_val_from_string: function( s )
  {
    return robot_behaviour_settings_screen.user_params.turn_restrict.enum.find(e=>e.n===s).v;
  },
  get_turn_restrict_string_from_val: function( v )
  {
    return robot_behaviour_settings_screen.user_params.turn_restrict.enum.find(e=>e.v===v).n;
  },

  caster_front: "",
  change_caster_front: function( new_value )
  {
    if( new_value === "yes" || new_value === "no" )
    {
      robot_behaviour_settings_screen.caster_front = new_value;
      $( "#robot_behaviour_settings_screen #caster_front_select button" ).removeClass( "chosen" ).addClass( "bright" );
      $( "#robot_behaviour_settings_screen #caster_front_select #caster_front_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );
    }
    else
    {
      console.warn( "Caster front cannot be changed to", new_value );
    }
  },

  change_external_baudrate: function( new_value )
  {
    if(!robot_behaviour_settings_screen.user_params.external_baudrate.enum)
    {
      return;
    }
    const values = robot_behaviour_settings_screen.user_params.external_baudrate.enum.map(e=>e.v);
    $("#robot_behaviour_settings_screen #external_baud_rate_value").empty();
    values.forEach((val,idx)=>$("#robot_behaviour_settings_screen #external_baud_rate_value").append(`<option value="${val}" ${val===robot_behaviour_settings_screen.user_params.external_baudrate.current?"selected":""}>${val}</option>`));
    $("#robot_behaviour_settings_screen #external_baud_rate_row").removeClass('gone');
    if( values.indexOf(new_value) != -1 )
    {
      robot_behaviour_settings_screen.external_baudrate = new_value;
    }
    else
    {
      console.warn( "External baud rate cannot be changed to", new_value );
    }
  },

  error_auto_resume: "",
  change_error_auto_resume: function( new_value )
  {
    if( new_value === "yes" || new_value === "no" )
    {
      robot_behaviour_settings_screen.error_auto_resume = new_value;
      $( "#robot_behaviour_settings_screen #error_auto_resume_select button" ).removeClass( "chosen" ).addClass( "bright" );
      $( "#robot_behaviour_settings_screen #error_auto_resume_select #error_auto_resume_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );
    }
    else
    {
      console.warn( "Error auto resume cannot be changed to", new_value );
    }
  },
  wheel_flip: {},
  set_wheel_direction: function( side, new_value )
  {
    robot_behaviour_settings_screen.wheel_flip[side] = new_value === "yes";

    $( "#robot_behaviour_settings_screen #" + side + "_wheel_direction_row" ).removeClass( "gone" );
    $( "#robot_behaviour_settings_screen #" + side + "_wheel_direction_select button" ).removeClass( "chosen" ).addClass( "bright" );
    $( "#robot_behaviour_settings_screen #" + side + "_wheel_direction_select #" + side + "_wheel_direction_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );

  },

  change_velocity_slider: function( label_id, new_value )
  {
    if( label_id === "spray_vel_value" )
    {
      if( new_value > 1.0 )
      {
        $( "#robot_behaviour_settings_screen #" + label_id ).addClass( "warning" );
      }
      else
      {
        $( "#robot_behaviour_settings_screen #" + label_id ).removeClass( "warning" );
      }
    }

    new_value = (parseFloat( new_value )).meter2unit( );
    new_value = "" + parseFloat( new_value ).round( 1 );
    if( new_value.length === 1 )
    {
      new_value += ".0";
    }
    $( "#robot_behaviour_settings_screen #" + label_id ).html( new_value + " " + translate_unit() + "/s" );

  },
  pop_up_once: function( header, min_wait )
  {
    if( !header )
      header = translate["Saving data"];
    if( !min_wait )
      min_wait = 1000;
    var start = (new Date( )).getTime( );
    popup_screen_controller.open_info_waiter( header, "", "" );
    function done( )
    {
      message_controller.events.remove_callback( "updated_user_config", done );
      message_controller.events.remove_callback( "not_online", done );
      var end = (new Date( )).getTime( );
      setTimeout( popup_screen_controller.close, min_wait - (end - start) );
    }
    message_controller.events.add_callback( "updated_user_config", done );
    message_controller.events.add_callback( "not_online", done );
  },

  save_settings: function(save_as_config = false, for_checking = false)
  {
    var data = {};

    /*
     * Velocities. Manual, drive, spray
     */
    data.velocity_drive = parseFloat( $( "#robot_behaviour_settings_screen #drive_vel_input" ).val( ) );
    data.velocity_spray = parseFloat( $( "#robot_behaviour_settings_screen #spray_vel_input" ).val( ) );
    data.velocity_manual = parseFloat( $( "#robot_behaviour_settings_screen #manuel_vel_input" ).val( ) );

    data.velocity_drive.toFixed(1);
    data.velocity_spray.toFixed(1);
    data.velocity_manual.toFixed(1);

    /*
     * Line parameters. Length, space, ramp up, linepaint, spray offset start/stop
     */
    data.spray_line_length = parseFloat( $( "#robot_behaviour_settings_screen #line_length_value" ).val( ) );
    data.spray_space_length = parseFloat( $( "#robot_behaviour_settings_screen #line_space_value" ).val( ) );
    data.linepaint_ramp_up = parseFloat( $( "#robot_behaviour_settings_screen #paint_ramp_up_value" ).val( ) );
    data.linepaint_ramp_down = parseFloat( $( "#robot_behaviour_settings_screen #paint_ramp_down_value" ).val( ) );

    data.spray_line_length = data.spray_line_length.unit2meter( );
    data.spray_space_length = data.spray_space_length.unit2meter( );
    data.linepaint_ramp_up = data.linepaint_ramp_up.unit2meter( );
    data.linepaint_ramp_down = data.linepaint_ramp_down.unit2meter( );

    data.spray_line_length.toFixed();
    data.spray_space_length.toFixed(1);
    data.linepaint_ramp_up.toFixed();
    data.linepaint_ramp_down.toFixed(1);

    if( robot_controller.robot_has_capability( "spray_offset_as_time" ) )
    {
      data.spray_time_offset_start = parseFloat( $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_value" ).val( ) );
      data.spray_time_offset_stop = parseFloat( $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_value" ).val( ) );

      data.spray_time_offset_start.toFixed(1);
      data.spray_time_offset_stop.toFixed(1);
    }
    else
    {
      data.linepaint_spray_offset_start = parseFloat( $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_value" ).val( ) );
      data.linepaint_spray_offset_stop = parseFloat( $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_value" ).val( ) );

      data.linepaint_spray_offset_start = data.linepaint_spray_offset_start.unit2meter( );
      data.linepaint_spray_offset_stop = data.linepaint_spray_offset_stop.unit2meter( );

      data.linepaint_spray_offset_start.toFixed(1);
      data.linepaint_spray_offset_stop.toFixed(1);
    }

    /*
     * Point parameters. Spray duration, waiting time, approach distance
     */
    data.waypoint_spray_duration = parseFloat( $( "#robot_behaviour_settings_screen #spray_duration_value" ).val( ) );
    data.waypoint_default_wait = parseFloat( $( "#robot_behaviour_settings_screen #default_wait_value" ).val( ) );
    data.waypoint_approach_dist = parseFloat( $( "#robot_behaviour_settings_screen #approach_dist_value" ).val( ) );

    data.waypoint_approach_dist = data.waypoint_approach_dist.unit2meter( );

    data.waypoint_spray_duration.toFixed(1); 
    data.waypoint_default_wait.toFixed(1);
    data.waypoint_approach_dist.toFixed(1); 
    /*
     * Buildup/geometry/general. Ant height, tool height, tool side, tool sideshift, caster front
     */
    data.antenna_height = parseFloat( $( "#robot_behaviour_settings_screen #antenna_height_value" ).val( ) );
    data.tool_height = parseFloat( $( "#robot_behaviour_settings_screen #tool_height_value" ).val( ) );
    data.tool_sideshift = parseFloat( $( "#robot_behaviour_settings_screen #tool_sideshift_value" ).val( ) );


    data.antenna_height = data.antenna_height.unit2meter( );
    data.tool_height = data.tool_height.unit2meter( );
    data.tool_sideshift = data.tool_sideshift.unit2meter( );

    data.antenna_height.toFixed(1);
    data.tool_height.toFixed(1);
    data.tool_sideshift.toFixed(1);

    data.tool_side = robot_behaviour_settings_screen.tool_side;
    data.turn_restrict = robot_behaviour_settings_screen.turn_restrict;
    data.caster_front = robot_behaviour_settings_screen.caster_front === "yes" ? true : false;

    /*
     * Calibration. Tool x/y, position time offset, nmea min freq
     */
    data.tool_calibrate_x = parseFloat( $( "#robot_behaviour_settings_screen #tool_calibrate_x_value" ).val() );
    data.tool_calibrate_y = parseFloat( $( "#robot_behaviour_settings_screen #tool_calibrate_y_value" ).val() );

    data.tool_calibrate_x = data.tool_calibrate_x.unit2meter( );
    data.tool_calibrate_y = data.tool_calibrate_y.unit2meter( );

    data.tool_calibrate_x.toFixed(5);
    data.tool_calibrate_y.toFixed(5);

    data.position_time_offset = parseFloat( $( "#robot_behaviour_settings_screen #position_time_offset_value" ).val(  ) );
    
    data.position_time_offset.toFixed(1);

    /*
     * Other, ungrouped
     */
    var frequency_min = parseFloat( $( "#robot_behaviour_settings_screen #input_frequency_min_value" ).val(  ) );
    frequency_min.toFixed(1);
    if( robot_controller.is_robot_version_more_or_equal( [ 6, 8, 0 ] ) )
    {
      data.ts_frequency_min = frequency_min;
      data.gdm_frequency_min = frequency_min;
      data.csv_frequency_min = frequency_min;
    }
    data.nmea_frequency_min = frequency_min;

    var frequency_window = parseFloat( $( "#robot_behaviour_settings_screen #input_frequency_window_value" ).val(  ) );
    frequency_window.toFixed(1);
    if( robot_controller.is_robot_version_more_or_equal( [ 6, 8, 0 ] ) )
    {
      data.ts_frequency_window = frequency_window;
      data.gdm_frequency_window = frequency_window;
      data.csv_frequency_window = frequency_window;
      data.nmea_frequency_window = frequency_window;
    }

    data.external_baudrate = parseInt( $("#robot_behaviour_settings_screen #external_baud_rate_value").val() );

    data.error_auto_resume = robot_behaviour_settings_screen.error_auto_resume === "yes" ? true : false;

    // flip wheel direction
    if( robot_behaviour_settings_screen.wheel_flip["left"] !== undefined )
      data.wheel_flip_ch1 = robot_behaviour_settings_screen.wheel_flip["left"];
    if( robot_behaviour_settings_screen.wheel_flip["right"] !== undefined )
      data.wheel_flip_ch2 = robot_behaviour_settings_screen.wheel_flip["right"];
      let saved_settings = null;
      if(robot_behaviour_settings_screen.chosen_config){
        saved_settings = robot_behaviour_settings_screen.load_user_params_from_local_storage(false);
      }
      else{
          saved_settings = robot_behaviour_settings_screen.original_settings;
      }
    let keys = Object.keys( data );
      keys.forEach( ( key ) => {
        //Remove undefined data
        if( (typeof (data[key]) === "string" && data[key] === "") || (typeof (data[key]) === "number" && isNaN( data[key] )) || typeof (data[key]) === "undefined" )
          delete data[key];
  
        // Remove unchanged data
        if( robot_controller.config[key] === data[key] )
        {
          delete data[key];
        }
        else
        {
          if(!for_checking){
          robot_controller.config[key] = data[key];
          }
          robot_behaviour_settings_screen.user_params[key].current = data[key];
        }
  
      } );
    if(for_checking && saved_settings){
      let tmp = 0;
      if(Object.entries(data).length > 0 && !$("input[type=number]" ).hasClass('warning_outline')){
        $("#robot_behaviour_save_button").prop("disabled", false);
        Object.entries(data).forEach((item, key) =>{
          Object.values(saved_settings).forEach((saved_item, saved_key)=>{
            if(item[0] === saved_item["name"] && item[1] !== saved_item["current"]){
              tmp = tmp + 1;
            }
          });
        });
        if(tmp !== 0){
          $("#reload_config_button").prop("disabled", false);
        }
        else{
          $("#reload_config_button").prop("disabled", true);
        }
      }
      else if(Object.entries(data).length === 0 || $("input[type=number]" ).hasClass('warning_outline')){
        if(!save_as_config){
          $("#reload_config_button").prop("disabled", true);
        }
        $("#robot_behaviour_save_button").prop("disabled", true);
      }
    }
    /*
     * Send data
     */
    if(!for_checking && !save_as_config){
      robot_controller.update_user_params( data, "all" );
      localStorage.setItem("robot.user_params", JSON.stringify(robot_behaviour_settings_screen.user_params));
      robot_behaviour_settings_screen.original_settings = JSON.parse(localStorage.getItem("robot.user_params"));
      robot_behaviour_settings_screen.interval_id = setInterval(()=>{robot_behaviour_settings_screen.save_settings(false, true)}, 500);
      $("#robot_behaviour_save_button").prop("disabled", true);
      $("#reload_config_button").prop("disabled", true);
      $("#delete_config_button").prop("disabled", true);
      $("#overwrite_config_button").prop("disabled", true);
      if(!save_as_config){
        document.querySelector("#robot_behaviour_configurations_dropdown").value = "default";
        robot_behaviour_settings_screen.chosen_config = null;
      robot_behaviour_settings_screen.pop_up_once( translate["Saving robot behaviour"] );
    }
    map_controller.background.refreshh_jobs_drawing();
    }
  },
  delete_config(){
    let list_of_buttons = [];
    list_of_buttons.push(new PopButton( translate["Yes"], () =>{
    localStorage.removeItem("robot.user_params " + robot_behaviour_settings_screen.chosen_config);
    let index = robot_behaviour_settings_screen.list_of_configs.indexOf(robot_behaviour_settings_screen.chosen_config);
    robot_behaviour_settings_screen.list_of_configs = robot_behaviour_settings_screen.list_of_configs.filter(element => {
      return element !== robot_behaviour_settings_screen.chosen_config;
    });
    if(index === 0){
      if(robot_behaviour_settings_screen.list_of_configs.length > 0){
        robot_behaviour_settings_screen.chosen_config = robot_behaviour_settings_screen.list_of_configs[index];
      }
      else{
        robot_behaviour_settings_screen.chosen_config =  null;
      }
    }
    else if(index === robot_behaviour_settings_screen.list_of_configs.length){
      robot_behaviour_settings_screen.chosen_config = robot_behaviour_settings_screen.list_of_configs[index - 1];
    }
    else{
      robot_behaviour_settings_screen.chosen_config = robot_behaviour_settings_screen.list_of_configs[index];
    }
    $("#reload_config_button").prop("disabled", true);
    robot_behaviour_settings_screen.load_config_dropdown_from_local_storage(robot_behaviour_settings_screen.chosen_config);
      popup_screen_controller.close("delete_robot_behaviour_popup");
        } , "dark" ));
    list_of_buttons.push(new PopButton( translate["Cancel"], () =>{
      pop_generator.close();
    } , "red" ));

    pop_generator.create_popup_with_options({
      header: translate["Deleting current configuration"],
      body: translate["Are you sure?"],
      buttons: list_of_buttons,
      popup_id: "delete_robot_behaviour_popup"
    });
  },
  reloading_config(){
    robot_behaviour_settings_screen.update_ui_values(robot_behaviour_settings_screen.chosen_config, "current");
  },
  adding_new_config(){
    let list_of_buttons = [];
    let placeholder = translate["Robot Configuration %1s"].format(new Date().toLocaleDateString());
    list_of_buttons.push(new PopButton( translate["Save"], () =>{
        if(robot_behaviour_settings_screen.list_of_configs && robot_behaviour_settings_screen.list_of_configs.indexOf(placeholder) !== -1 && $("#popup_input_field").val() === ""){
            $("#popup_body").text(translate["Configuration name already exists, choose different name"]);
            return;
        }
        if(robot_behaviour_settings_screen.list_of_configs && (robot_behaviour_settings_screen.list_of_configs.indexOf($("#popup_input_field").val()) !== -1 || (robot_behaviour_settings_screen.list_of_configs.indexOf(placeholder) !== -1 && $("#popup_input_field").val() === ""))){
            $("#popup_body").text(translate["Configuration name already exists, choose different name"]);
            return;
        }
        else{
          if($("#popup_input_field").val() === ""){ 
            robot_behaviour_settings_screen.save_user_params_in_local_storage(placeholder, true);
            robot_behaviour_settings_screen.load_config_dropdown_from_local_storage(placeholder);
          }
          else{
            robot_behaviour_settings_screen.save_user_params_in_local_storage($("#popup_input_field").val(), true);
            robot_behaviour_settings_screen.load_config_dropdown_from_local_storage($("#popup_input_field").val());
          }
        if(robot_behaviour_settings_screen.list_of_configs.length >= 1){
        $("#robot_behaviour_configurations_dropdown").prop('disabled', false);
        }
        popup_screen_controller.close("adding_new_robot_behaviour_popup");
        }
        } , "dark" ));
    list_of_buttons.push(new PopButton( translate["Cancel"], () =>{
      pop_generator.close();
    } , "red" ));

    pop_generator.create_popup_with_options({
      header: translate["Adding of new configuration"],
      body: translate["Specify configuration name"],
      buttons: list_of_buttons,
      show_x: false,
      input_field: false,
      input_placeholder: true,
      spinner: placeholder,
      popup_id: "adding_new_robot_behaviour_popup",
    });
  },

  overwriting_config(){
    let list_of_buttons = [];
    list_of_buttons.push(new PopButton( translate["Overwrite"], () =>{
      robot_behaviour_settings_screen.save_user_params_in_local_storage(robot_behaviour_settings_screen.chosen_config);
      popup_screen_controller.close("overwriting_robot_behaviour_popup");
    } , "dark" ));
    list_of_buttons.push(new PopButton( translate["Cancel"], () =>{
      pop_generator.close();
    } , "red" ));

    pop_generator.create_popup_with_options({
      header: translate["Overwriting currently chosen configuration"],
      body: translate["Are you sure you want to overwrite currently chosen configuration?"],
      buttons: list_of_buttons,
      popup_id: "overwriting_robot_behaviour_popup",
    });
  },
  save_user_params_in_local_storage(config_name, set_config = null, doChangeCheck = true)
  {
    robot_behaviour_settings_screen.save_settings(true, doChangeCheck);
    localStorage.setItem( "robot.user_params " + config_name, JSON.stringify( robot_behaviour_settings_screen.user_params ) );
    let received = robot_behaviour_settings_screen.list_of_configs;
    let tmp = [];
    if(received){
      tmp = received;
      for(let i= 0; i < tmp.length; i++){
        if(tmp[i] === config_name){
          return;
        }
      }
      tmp.push(config_name);
      received = tmp;
    } else  {
      received = [];
      received.push(config_name);
    }
    if(set_config){
      robot_behaviour_settings_screen.chosen_config = config_name;
      $("#overwrite_config_button").prop("disabled", false);
      $("#delete_config_button").prop("disabled", false); 
    }
    robot_behaviour_settings_screen.list_of_configs = received;
  },
  load_config_dropdown_from_local_storage(selected_config = null){
    let data = robot_behaviour_settings_screen.list_of_configs;
    if(data){
      if(data.length === robot_behaviour_settings_screen.list_of_configs.length && robot_behaviour_settings_screen.list_of_configs.length <= 0){
        $("#robot_behaviour_configurations_dropdown").empty();
        $("#delete_config_button").prop("disabled", true);  
        $("#overwrite_config_button").prop("disabled", true);
        $("#robot_behaviour_configurations_dropdown").prop('disabled', true);
        return;
      }
      else {
        $("#robot_behaviour_configurations_dropdown").empty();
        let select = document.getElementById("robot_behaviour_configurations_dropdown");
        let placeholder_option = document.createElement("option");
        placeholder_option.textContent = translate["Choose configuration here"];
        placeholder_option.value = "default";
        placeholder_option.disabled = "disabled";
        placeholder_option.selected = "selected";
        select.append(placeholder_option);
          for(let i= 0; i < data.length; i++){
            let el = document.createElement("option");
            if(data[i] === selected_config){
              el.selected = "selected";
            }
            el.textContent = data[i];
            el.value = data[i];
            select.appendChild(el);
        }
        robot_behaviour_settings_screen.list_of_configs.length = 0;
        for(let i= 0; i < data.length; i++){
            robot_behaviour_settings_screen.list_of_configs.push(data[i]);
        } 
            $("#robot_behaviour_configurations_dropdown").prop('disabled', false);
        }
      }
      else{
        $("#delete_config_button").prop("disabled", true);  
        $("#overwrite_config_button").prop("disabled", true);
        $("#robot_behaviour_configurations_dropdown").prop('disabled', true);
      }
  },
  load_user_params_from_local_storage(overwrite_config = true)
  {

    let data = localStorage.getItem( "robot.user_params " + robot_behaviour_settings_screen.chosen_config );
    if( data )
    {
      let result = JSON.parse( data );
      if(overwrite_config){
        message_controller.events.call_callback( "reconf_topic_/user", {
          "/user": result
        } );
      }
      return result;
    }
  },
  got_user_params_legacy: function( data )
  {
    var user = {};
    Object.keys( data ).forEach( function( key )
    {
      if( key !== "robot" )
        user[key] = {
          'name': key,
          'current': data[key]
        };
    } );

    data["/user"] = user;

    robot_behaviour_settings_screen.got_user_params( data );
  },
  got_capabilities()
  {
    robot_behaviour_settings_screen.got_user_params(
    {
      "/user": robot_behaviour_settings_screen.user_params
    } );

  },
  stop_check_interval(){
    clearInterval(robot_behaviour_settings_screen.interval_id);
    robot_behaviour_settings_screen.chosen_config = null;
  }
};
$( document ).ready( function( )
{
  message_controller.events.add_callback( "robot_velocities", robot_behaviour_settings_screen.got_user_params_legacy );
  message_controller.events.add_callback( "marking_parameters", robot_behaviour_settings_screen.got_user_params_legacy );
  message_controller.events.add_callback( "marking_calibration", robot_behaviour_settings_screen.got_user_params_legacy );
  message_controller.events.add_callback( "robot_geometri", robot_behaviour_settings_screen.got_user_params_legacy );
  message_controller.events.add_callback( "reconf_topic_/user", robot_behaviour_settings_screen.got_user_params );
  event_controller.add_callback( 'got_robot_capabilities', robot_behaviour_settings_screen.got_capabilities );
  event_controller.add_callback( "units_changed", robot_behaviour_settings_screen.update_ui_values );
  event_controller.add_callback( "close_settings_menu", robot_behaviour_settings_screen.stop_check_interval );
  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "robot_behaviour_settings_screen" )
      robot_behaviour_settings_screen.open();
  } );
} );