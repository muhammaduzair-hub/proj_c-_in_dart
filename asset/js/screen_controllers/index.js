/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* Remove loading screen after all texts has been updated  */
/* global translation, cleaning_screen_controller, bottom_bar_chooser, create_pitch_screen_controller, edit_pitch_screen_controller, settings_screeen_controller, robot_controller, AppType, translate, event_controller, templateshop_screen */

function remove_loading_screen()
{
  setTimeout( function()
  {
    $( "#loading-screen" ).addClass( "gone" );
    //$( "#popup-sizer" ).height( $( "body" ).height() - 60 );
  }, 1000 );
  $( "#loading-screen" ).css( "opacity", "0.0" );
  $( "#loading-screen" ).css( "pointer-events", "none" );
}

window.addEventListener( 'native.keyboardshow', function( e )
{
  console.log( "native.keyboardshow" );
  setTimeout( function()
  {
    document.activeElement.scrollIntoViewIfNeeded();
  }, 100 );
} );

function translate_screen()
{
  // SAFE MODE
  $("#safe_mode_on_indicator_text").text(translate["safeModeOnWarning"]);

  // APP TYPE SPECIFIC
  if( AppType === APP_TYPE.TinyLineMarker )
  {
    $( ".button-container #new_track_button" ).html( "+ " + translate["New pitch"] );
    
    // $( "#create_job_popup #create_new_track_header" ).html( translate["Create new pitch"] );
    $( "#create_job_popup #job_name_label" ).html( translate["Pitch name"] + ": " );
    $( "#create_job_popup #place_selector_collection #place_track_label" ).html( translate["How would you like to place the pitch?"] );
    $( "#create_job_popup #template_create_button" ).html( translate["Create pitch"] );
    $( "#create_track_choose_layout_method_popup #create_button" ).html( translate["Create new pitch"] );
    $( "#save_copy_popup #track_name_label" ).html( translate["Pitch name"] );
    $( "#delete_pitch_popup #delete_pitch_popup_header" ).html( translate["Delete pitch"] );
    $( "#waiting_dialog #info_label1" ).html( translate["Saving pitch"] );
    $( "#paint_pitch_finished_popup #header" ).html( translate["Pitch done"] );
  }
  else
  {
    $( ".button-container #new_track_button" ).html( "+ " + translate["New job"] );
    

    // $( "#create_job_popup #create_new_track_header" ).html( translate["Create new job"] );
    $( "#create_job_popup #job_name_label" ).html( translate["Job name"] + ": " );
    $( "#create_job_popup #place_selector_collection #place_track_label" ).html( translate["How would you like to place the job?"] );
    $( "#create_job_popup #template_create_button" ).html( translate["Create job"] );
    $( "#create_track_choose_layout_method_popup #create_button" ).html( translate["Create new job"] );
    $( "#save_copy_popup #track_name_label" ).html( translate["Job name"] );
    $( "#delete_pitch_popup #delete_pitch_popup_header" ).html( translate["Delete job"] );
    $( "#waiting_dialog #info_label1" ).html( translate["Saving job"] );
    $( "#paint_pitch_finished_popup #header" ).html( translate["Job done"] );
  }
  
  $( "#create_job_popup #import_create_button" ).html( translate["Import"] );
  $( "#create_job_popup #ok_button" ).html( translate["OK"] );

  // BOTTOM BAR
  $( "#robot-offline #tools_button" ).html( translate["tools"] );
  $( "#robot-selected #tools_button" ).html( translate["tools"] );
  $( "#drive_to_button" ).html( translate["Drive to"] );
  $( "#cleaning_button" ).html( translate["Cleaning"] );
  $( "#test_spray_button" ).html( translate["Test spray"] );
  $( "#choose_utility_method_overlay #test_spray_button" ).html( translate["Test spray"] );
  $( "#prime_pump_button" ).html( translate["primePump"] );
  $( "#measure_button" ).html( translate["measure"] );

  $( "#robot-not-selected h3" ).html( translate["Choose robot to start"] + "." );
  $( "#starting-bottombar h3" ).html( translate["Connecting to robot"] + "." );


  $( "#track-selected #start_button" ).html( translate["Start"] );
  $( "#track-selected #start_near_button" ).html( translate["Near"] );
  $( "#track-selected #test_button" ).html( translate["Test"] );
  $( "#choose_test_method_overlay #fast_border" ).html( translate["TestCorner"] );
  $( "#choose_test_method_overlay #border_test" ).html( translate["TestPerimeter"] );
  $( "#choose_test_method_overlay #full_test" ).html( translate["TestField"] );

  $( "#track-selected #modify_button" ).html( translate["Modify"] );

  $( "#button_overlay #edit_button" ).html( translate["Edit"] );
  $("#button_overlay #recollect_button").html(translate["recollect"]);
  $( "#button_overlay #copy_button" ).html( translate["Copy"] );
  $( "#button_overlay #reverse_button" ).html( translate["Reverse"] );
  $( "#button_overlay #offset_button" ).html( translate["Offset"] );
  $( "#button_overlay #fitter_button" ).html( translate["Convert"] );
  $( "#button_overlay #delete_button" ).html( translate["Delete"] );
  $( "#button_overlay #pitch_revision_button" ).html( translate["Revisions"] );
  $( "#button_overlay #optimize_path_button" ).html( translate["Optimize route"] );

  $( "#robot-selected #near_button" ).html( translate["Near"] );

  $("#tablet_offline_indicator_text").text(translate["No tablet internet"].toUpperCase());
  $("#no_app_server_connection_indicator_text").text(translate["No server connection"].toUpperCase());

  // Measure screen
  $("#measure-screen #reset_measurement").text(translate["Clear"]);
  $("#measure-screen #cancel_button").text(translate["Close"]);
  
  // Bottombar
  bottom_bar_chooser.reload_bottom_bar();

  // Corner visualizer
  $( "#which-corner-visualiser #txt_selected" ).html( translate["selected"] );
  $( "#which-corner-visualiser #txt_collected" ).html( translate["collected"] );
  $( "#which-corner-visualiser #txt_remaining" ).html( translate["missing"] );

  // start pitch error
  $( "#start_paint_pitch_error_popup #header" ).html( translate["No connection to the robot"] );
  $( "#start_paint_pitch_error_popup #info_label1" ).html( translate["There is no connection to the robot"] + "." );
  $( "#start_paint_pitch_error_popup #info_label2" ).html( translate["Turn on the robot or wait for it to reconnect"] + "." );
  $( "#start_paint_pitch_error_popup #ok_button" ).html( translate["OK"] );

  // Save bottom bar
  $( "#copy-track #copy_dist_label" ).html( translate["Distance between fields"] + " (" + translate_unit() + "): " );
  $( "#offset-track #offset_dist_label" ).html( translate["Perpendicular distance to job"] + " (" + translate_unit() + "): " );
  $( "#copy-track #copy_number_label" ).html( translate["Number of copies"] + ": " );
  $( "#copy-track #cancel_button" ).html( translate["Cancel"] );
  $( "#offset-track #cancel_button" ).html( translate["Cancel"] );
  $( "#copy-track #save_button" ).html( translate["Save"] );
  $( "#offset-track #save_button" ).html( translate["Save"] );

  // Save popups
  $( "#save_copy_popup #save_copy_popup_header" ).html( translate["Save copy"] );
  $( "#save_copy_popup #cancel_button" ).html( translate["Cancel"] );
  $( "#save_copy_popup #save_button" ).html( translate["Save"] );
  $( "#save_copy_error_popup #save_error_header" ).html( translate["Please select a copy before saving"] );
  $( "#save_copy_error_popup #save_error_button" ).html( translate["OK"] );

  // low battery popup
  $( "#low_battery_popup #ok_button" ).html( translate["OK"] );

  // delete pitch popup

  $( "#delete_pitch_popup #cancel_button" ).html( translate["Cancel"] );
  $( "#delete_pitch_popup #delete_button" ).html( translate["Delete"] );

  // Settings screen
  $( "#settings_screen_title" ).html( translate["Settings"] );
  $( "#settings_screen #language_header" ).html( translate["Language"] );

  $( "#settings_screen #show_pitch_header" ).html( translate["Show"] );
  $( "#settings_screen .robot_settings_menu_header" ).html( translate["Robot Settings"] );
  $( "#settings_screen #close_button" ).html( translate["Close"] );
  $( "#settings_screen #robot_speed_header" ).html( translate["Drive speed"] );
  $( "#settings_screen #robot_speed_header" ).html( translate["Spray speed"] );

  $( "#settings_screen #slow_speed_button" ).html( translate["Slow speed"] );
  $( "#settings_screen #normal_speed_button" ).html( translate["Normal speed"] );
  $( "#settings_screen #fast_speed_button" ).html( translate["High speed"] );
  $( "#settings_screen #moderate_speed_button" ).html( translate["Moderate speed"] );
  
  //$( "#settings_screen #robot_speed_content #moderate_speed_button" ).addClass( "bright" ).removeClass( "chosen" );

  $( "#settings_screen #joystick_speed_header" ).html( translate["Joystick speed"] );
  $( "#settings_screen #drive_speed_header" ).html( translate["Drive speed"] );
  $( "#settings_screen #paint_settings_header" ).html( translate["Paint settings"] );
  $( "#settings_screen #nozzle_type_label" ).html( translate["Nozzle type"] );
  $( "#settings_screen #nozzle_type_select_cone" ).html( translate["ConeType"] );
  $( "#settings_screen #nozzle_type_select_fan" ).html( translate["FanType"] );

  $( "#settings_screen #robot_driving_behavior_header" ).html( translate["Robot driving behavior"] );
  $( "#settings_screen #force_new_ramp_up_length_label" ).html( translate["Ramp up"] );
  $( "#settings_screen #force_new_internal_ramp_up_length_label" ).html( translate["Internal ramp up"] );
  $( "#settings_screen #safety_distance_label" ).html( translate["Safety distance to post"] );
  $( "#settings_screen #enable_fluent_run_label" ).html( translate["Fluent run"] +
    '<i class="material-icons" onclick="settings_screeen_controller.show_fluent_run_more_info_popup()" style="font-size: var(--font-20);">help_outline</i>'
    );
  $( "#settings_screen #enable_fluent_run_yes" ).html( translate["On_enable"] );
  $( "#settings_screen #enable_fluent_run_no" ).html( translate["Off_enable"] );

  $("#settings_screen #select_interference_filter_type_tlm_label").text(translate["Tree filter type"]);
  $("#settings_screen .select_interference_filter_type option[value=1]").text(translate["Tree filter v1 (classic)"]);
  $("#settings_screen .select_interference_filter_type option[value=2]").text(translate["Tree filter v2 (improved)"]);

  $("#settings_screen #select_napping_version_tlm_label").text(translate["Antinapping type"]);
  $("#settings_screen .select_napping_version option[value=1]").text(translate["Antinapping v1"]);
  $("#settings_screen .select_napping_version option[value=2]").text(translate["Antinapping v2"]);

  $( ".fixed_save_button" ).html( translate["Save"] );
  $( "#robot_settings_menu #line_parameters_header" ).html( translate["Line parameters"] );
  $( "#robot_settings_menu #line_length_label" ).html( translate["Line length"] + " (" + translate_unit() + ")" );
  $( "#robot_settings_menu #line_space_label" ).html( translate["Line space"] + " (" + translate_unit() + ")" );


  if( !settings_screeen_controller.use_emperial )
  {
    $( "#settings_screen #paint_width_label" ).html( translate["Paint width"] + " (" + translate_unit() + ")" );
    $( "#settings_screen #paint_length_label" ).html( translate["Paint length"] + " (" + translate_unit() + ")" );
  }
  else
  {
    $( "#settings_screen #paint_width_label" ).html( translate["Paint width"] + " (" + translate["inch"] + ")" );
    $( "#settings_screen #paint_length_label" ).html( translate["Paint length"] + " (" + translate["inch"] + ")" );
  }

  $( "#robot_settings_menu #safety_parameters_header" ).html( translate["Safety"] );
  $( "#robot_settings_menu #collision_detector_label" ).html( translate["Collision detector"] );

  $( "#robot_settings_menu #warnings_parameters_header" ).html( translate["headerWarnings"] );
  $( "#robot_settings_menu #toggle_paint_indicator_warning_label" ).html( translate["labelPaintIndicator"] );

  $( "#robot_settings_menu #other_header" ).html( translate["Advanced"] );
  $( "#robot_settings_menu #left_wheel_direction_label" ).html( translate["Left wheel is Bafang motor"] );
  $( "#robot_settings_menu #right_wheel_direction_label" ).html( translate["Right wheel is Bafang motor"] );
  $( "#robot_settings_menu #left_wheel_direction_select_yes" ).html( translate["Yes"] );
  $( "#robot_settings_menu #left_wheel_direction_select_no" ).html( translate["No"] );
  $( "#robot_settings_menu #right_wheel_direction_select_yes" ).html( translate["Yes"] );
  $( "#robot_settings_menu #right_wheel_direction_select_no" ).html( translate["No"] );

  $( "#robot_settings_menu #robot_customization_header" ).html( translate["Robot customization"] );
  $( "#robot_settings_menu #robot_name_label" ).html( translate["Robot name"] );


  // Locale settings
  $( "#settings_screen #locale_settings_header" ).html( translate["Locale settings"] );
  $( "#settings_screen #locale_settings_screen #language_header" ).html( translate["Language"] );
  $( "#settings_screen #locale_settings_screen #units_header" ).html( translate["Units"] );
  $( "#settings_screen #locale_settings_screen #metric_choser" ).html( translate["Metric"] );
  $( "#settings_screen #locale_settings_screen #emperial_choser" ).html( translate["Empirically"] );
  $( "#settings_screen #locale_settings_screen #us_ft_choser" ).html( translate["US survey feet"] );
  $( "#settings_screen #locale_settings_screen #yard_choser" ).html( translate["Yard"] );

  // Position settings
  $( "#settings_screen .position_settings_header" ).html( translate["Position settings"] );
  $( "#settings_screen #position_settings_screen #projection_header" ).html( translate["Projection"] );
  $( "#position_settings_screen #position_summary > h2" ).html( translate["Summary"] );
  $( "#settings_screen #position_settings_screen #projection_recent_header" ).html( translate["Recently used"] );
  $( "#settings_screen #position_settings_screen #projection_edit_projections_header" ).html( translate["Manage projections"] );
  $( "#settings_screen #position_settings_screen #custom_projections_button_open" ).html( translate["Edit projections"] );

  $( "#settings_screen #position_settings_screen #nmea_header" ).text( translate["NMEA"] );
  $( "#settings_screen #position_settings_screen #csv_header" ).text( translate["CSV"] );
  $( "#settings_screen #position_settings_screen #ts_header" ).text( translate["TS"] );
  $( "#settings_screen #position_settings_screen #gdm_header" ).text( translate["GDM"] );

  // Position settings screen > Edit projections screen
  $( "#custom_projection_screen_edit_projection_page #custom_projection_edit_form_name_label" ).html( translate["Name"] );
  $( "#custom_projection_screen_edit_projection_page #custom_projection_edit_form_description_label" ).html( translate["Description"] );
  $( "#custom_projection_screen_edit_projection_page #custom_projection_edit_form_proj4_label" ).html( translate["Projection"] );
  $( "#custom_projection_screen_edit_projection_page #save_button" ).html( translate["Save"] );
  $( "#custom_projection_screen_edit_projection_page #cancel_button" ).html( translate["Cancel"] );
  $( "#custom_projection_screen_edit_projection_page #custom_projections_button_load_list" ).html( translate["Load"] );
  $( "#custom_projection_screen_edit_projection_page #custom_projections_button_load_file" ).html( translate["Import"] );


  // Wifi screen
  $( "#settings_screen #wifi_settings_screen #wifi_tab" ).html( translate["WiFi Robot"] );
  $( "#settings_screen #wifi_settings_screen #internet_status_header" ).html( translate["Robot internet status"] );
  $( "#settings_screen #wifi_settings_screen #internet_provider_header" ).html( translate["Internet operator"] );

  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #wifi_help_text_1" ).html( translate["WifiHelp1"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #wifi_help_text_2" ).html( translate["WifiHelp2"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #robot_wifi_warning" ).html( translate["Robot_wifi_warning"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #Robot_wifi_warning_extra" ).html( translate["Robot_wifi_warning_extra"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #wifi_ssid_header" ).html( translate["Network name"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #wifi_wassword_header" ).html( translate["Password"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #search_robot_wifi_button" ).html( translate["Search for WiFi"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #connect_robot_wifi_button" ).html( translate["Connect Robot"] );
  $( "#settings_screen #wifi_settings_screen #wifi_tab_content #disconnect_robot_wifi_button" ).html( translate["Disconnect Robot"] );

  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #wifi_tab" ).html( translate["WiFi Tablet"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #wifi_help_text_1" ).html( translate["TabletWifiHelp1"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #wifi_help_text_2" ).html( translate["WifiHelp2"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #tablet_internet_status_header" ).html( translate["Tablet internet status"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #wifi_ssid_header" ).html( translate["Network name"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #wifi_wassword_header" ).html( translate["Password"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #search_tablet_wifi_button" ).html( translate["Search for WiFi"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #connect_tablet_wifi_button" ).html( translate["Connect Tablet"] );
  $( "#settings_screen #wifi_settings_screen #tablet_wifi_tab_content #try_robot_wifi_button" ).html( translate["Copy settings to robot"] );



  $( "#settings_screen #wifi_settings_screen #connection_status_tab #connection_status_header" ).html( translate["Connection"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #robot_connection_header" ).html( translate["Robot"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #robot_modem_connection_header" ).html( translate["Modem"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #robot_wifi_connection_header" ).html( translate["WiFi"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #tablet_connection_header" ).html( translate["Tablet"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #tablet_modem_connection_header" ).html( translate["Modem"] );
  $( "#settings_screen #wifi_settings_screen #connection_status_tab #tablet_wifi_connection_header" ).html( translate["WiFi"] );

  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_tab_header" ).html( translate["Robot Modem"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #sim_status_header" ).html( translate["Status"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_imei_header" ).html( translate["IMEI"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_icc_header" ).html( translate["ICC"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_model_header" ).html( translate["Model"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_apn_header" ).html( translate["APN"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #set_apn_btn" ).html( translate["Save %1s"].format(translate["APN"]) );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #change_operator_btn" ).html( translate["Search for Operators"] );
  $( "#settings_screen #wifi_settings_screen #modem_tab_content #modem_active_carrier_header" ).html( translate["Operator"] );
  

  $( "#settings_screen #wifi_settings_screen #tablet_tab_content #modem_tab_header" ).html( translate["Tablet Modem"] );
  $( "#settings_screen #wifi_settings_screen #tablet_tab_content #tablet_imei_header" ).html( translate["IMEI"] );
  $( "#settings_screen #wifi_settings_screen #tablet_tab_content #tablet_icc_header" ).html( translate["ICC"] );
  
  // Base station screen
  $( "#settings_screen .base_station_screen_header" ).html( translate["Base station"] );

  // Communication settings
  $( "#settings_screen .communication_settings_header" ).html( translate["Communication settings"] );
  $( "#settings_screen .wifi_screen_header" ).html( translate["Internet"] );

  $( "#settings_screen #communication_settings_screen #ntrip_tab" ).text( translate["NTRIP"] );
  $( "#settings_screen #communication_settings_screen #ntrip_server_header" ).html( translate["NTRIP server"] );
  $( "#settings_screen #communication_settings_screen #ntrip_username_header" ).html( translate["NTRIP username"] );
  $( "#settings_screen #communication_settings_screen #ntrip_password_header" ).html( translate["NTRIP password"] );
  $( "#settings_screen #communication_settings_screen #ntrip_mountpoint_header" ).html( translate["NTRIP mountpoint"] );
  $( "#settings_screen #communication_settings_screen #ntrip_choose_mountpoint_button" ).html( translate["Choose"] );
  $( "#settings_screen #communication_settings_screen #ntrip_tab_content #save_button" ).html( translate["Save"] );

  $( "#settings_screen #communication_settings_screen #bluetooth_tab" ).text( translate["Bluetooth"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_mac_header" ).html( translate["Bluetooth mac"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_name_header" ).html( translate["Bluetooth name"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_port_header" ).html( translate["Bluetooth port"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_pin_header" ).html( translate["Bluetooth PIN"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_initstring_header" ).html( translate["Initialization message"] );
  $( "#settings_screen #communication_settings_screen #bluetooth_tab_content #save_button" ).html( translate["Save"] );

  // Robot behaviour
  $( "#settings_screen .robot_behaviour_settings_header" ).html( translate["Robot behaviour"] );
  $( "#settings_screen #robot_behaviour_settings_screen #reset_button" ).html( translate["Reset"] );
  $( "#settings_screen #robot_behaviour_settings_screen #delete_config_button" ).html( translate["Delete"] );
  $(" #settings_screen #robot_behaviour_settings_screen #robot_behaviour_save_button").html(translate["sendToRobot"]);
  $(" #settings_screen #robot_behaviour_settings_screen #save_config_button").html(translate["Save config"]);
  $( "#robot_behaviour_settings_screen #robot_behaviour_configurations_header" ).html( translate["Robot configurations"] );
  $( "#robot_behaviour_settings_screen #robot_velocity_header" ).html( translate["Robot velocities"] );
  $( "#robot_behaviour_settings_screen #manuel_vel_label" ).html( translate["Manuel velocity"] );
  $( "#robot_behaviour_settings_screen #drive_vel_label" ).html( translate["Drive velocity"] );
  $( "#robot_behaviour_settings_screen #spray_vel_label" ).html( translate["Spray velocity"] );
  $( "#settings_screen #robot_behaviour_settings_screen #manuel_vel_value" ).text( translate["m/s"] );

  $( "#robot_behaviour_settings_screen #line_parameters_header" ).text( translate["Line parameters"] );
  $( "#robot_behaviour_settings_screen #line_length_label" ).text( translate["Line length"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #line_space_label" ).text( translate["Line space"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #paint_ramp_up_label" ).text( translate["Paint ramp up"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #paint_ramp_down_label" ).text( translate["Paint ramp down"] + " (" + translate_unit() + ")" );
  if( robot_controller.robot_has_capability( "spray_offset_as_time" ) )
  {
    $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_label" ).text( translate["Linepaint spray offset start"] + " (" + translate["sec"] + ")" );
    $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_label" ).text( translate["Linepaint spray offset end"] + " (" + translate["sec"] + ")" );
  }
  else
  {
    $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_label" ).text( translate["Linepaint spray offset start"] + " (" + translate_unit() + ")" );
    $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_label" ).text( translate["Linepaint spray offset end"] + " (" + translate_unit() + ")" );
  }

  $( "#robot_behaviour_settings_screen #point_parameters_header" ).html( translate["Point parameters"] );
  $( "#robot_behaviour_settings_screen #spray_duration_label" ).html( translate["Spray duration"] + " (" + translate["sec"] + ")" );
  $( "#robot_behaviour_settings_screen #default_wait_label" ).html( translate["Default wait"] + " (" + translate["sec"] + ")" );
  $( "#robot_behaviour_settings_screen #approach_dist_label" ).html( translate["Approach dist"] + " (" + translate_unit() + ")" );


  $( "#robot_behaviour_settings_screen #robot_geometry_header" ).html( translate["Robot geometry"] );
  $( "#robot_behaviour_settings_screen #antenna_height_label" ).html( translate["Antenna height"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #tool_height_label" ).html( translate["Tool height"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #tool_sideshift_label" ).html( translate["Tool sideshift"] + " (" + translate_unit() + ")" );

  $( "#robot_behaviour_settings_screen #turn_restrict_label" ).html( translate["Turn restrict"] );
  $( "#robot_behaviour_settings_screen #turn_restrict_select_left" ).html( translate["Only turn Left"] );
  $( "#robot_behaviour_settings_screen #turn_restrict_select_none" ).html( translate["None"] );
  $( "#robot_behaviour_settings_screen #turn_restrict_select_right" ).html( translate["Only turn Right"] );
  $( "#robot_behaviour_settings_screen #tool_side_label" ).html( translate["Tool side"] );
  $( "#robot_behaviour_settings_screen #tool_side_select_left" ).html( translate["Left"] );
  $( "#robot_behaviour_settings_screen #tool_side_select_center" ).html( translate["Center"] );
  $( "#robot_behaviour_settings_screen #tool_side_select_right" ).html( translate["Right"] );
  $( "#robot_behaviour_settings_screen #caster_front_label" ).html( translate["Caster front"] );
  $( "#robot_behaviour_settings_screen #caster_front_select_yes" ).html( translate["Yes"] );
  $( "#robot_behaviour_settings_screen #caster_front_select_no" ).html( translate["No"] );

  $( "#robot_behaviour_settings_screen #calibration_header" ).html( translate["Calibration"] );
  $( "#robot_behaviour_settings_screen #tool_calibrate_x_label" ).html( translate["Tool calibrate x"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #tool_calibrate_y_label" ).html( translate["Tool calibrate y"] + " (" + translate_unit() + ")" );
  $( "#robot_behaviour_settings_screen #position_time_offset_label" ).html( translate["Position time offset"] + " (" + translate["sec"] + ")" );


  $( "#robot_behaviour_settings_screen #other_header" ).html( translate["Advanced"] );
  $( "#robot_behaviour_settings_screen #input_frequency_min_label" ).html( translate["Minimum input frequency"] + " (" + translate["Hz"] + ")" );
  $( "#robot_behaviour_settings_screen #input_frequency_window_label" ).html( translate["Input frequency window"] + " (" + translate["sec"] + ")" );
  $( "#robot_behaviour_settings_screen #external_baud_rate_label" ).text( translate["Baud rate"] );
  $( "#robot_behaviour_settings_screen #error_auto_resume_label" ).html( translate["Autoresume on error"] );
  $( "#robot_behaviour_settings_screen #left_wheel_direction_label" ).html( translate["Left wheel is Bafang motor"] );
  $( "#robot_behaviour_settings_screen #right_wheel_direction_label" ).html( translate["Right wheel is Bafang motor"] );
  $( "#robot_behaviour_settings_screen #error_auto_resume_select_yes" ).html( translate["Yes"] );
  $( "#robot_behaviour_settings_screen #error_auto_resume_select_no" ).html( translate["No"] );
  $( "#robot_behaviour_settings_screen #left_wheel_direction_select_yes" ).html( translate["Yes"] );
  $( "#robot_behaviour_settings_screen #left_wheel_direction_select_no" ).html( translate["No"] );
  $( "#robot_behaviour_settings_screen #right_wheel_direction_select_yes" ).html( translate["Yes"] );
  $( "#robot_behaviour_settings_screen #right_wheel_direction_select_no" ).html( translate["No"] );


  // Layers screen
  $( "#settings_screen .choose_layers_header" ).html( translate["Layers"] );

  // Total station screen
  $( ".totalstation_screen_header" ).text( translate["Total station"] );
  $( "#totalstation_screen_front_connected_header h2" ).text( translate["Connected total station"] );
  $( "#totalstation_screen_front_position_header h2" ).text( translate["Position total station"] );
  $( "#totalstation_screen_front_robot_header h2" ).text( translate["Tracking robot prism"] );
  $( "#totalstation_screen_front_robot_ready_header h2" ).text( translate["Robot status"] );
  $( "#totalstation_screen_connect_previous_header" ).text( translate["Previous total stations"] );
  $( "#totalstation_screen_connect_nearby_header" ).text( translate["Nearby total stations"] );
  $( "#totalstation_screen_location_edit_form_name_label" ).text( translate["Name"] );
  $( "#totalstation_screen_location_edit_form_description_label" ).text( translate["Description"] );
  $( "#totalstation_screen_location_edit_form_fixed_label" ).text( translate["Fixed plate"] );
  $( "#totalstation_screen_location_edit_form_fixed_yes" ).text( translate["Yes"] );
  $( "#totalstation_screen_location_edit_form_fixed_no" ).text( translate["No"] );
  $( "#totalstation_screen_location_edit #save_button" ).text( translate["Save"] );
  $( "#totalstation_screen_location_edit #cancel_button" ).text( translate["Cancel"] );
  $( "#position-totalstation.bottombar #header" ).text(translate["Position prisms on map"]);
  $( "#position-totalstation.bottombar #helptext" ).html(translate["PositionPrismHelpText2"].format(` <img src="img/icons/ts_prism.png" style="height:var(--font-20);vertical-align: text-bottom;padding-bottom: 1px;" > `,` <img src="img/icons/ts_ts.png" style="height:var(--font-20);vertical-align: text-bottom;padding-bottom: 1px;" > `));
  $( "#position-totalstation.bottombar #cancel_button" ).text(translate["Cancel"]);
  $( "#position-totalstation.bottombar #save_button" ).text(translate["Continue"]);

  // Point collection / End collection
  $( "#create-new-pitch-get-corner #slow_button" ).html( translate["Slow joystick"] );
  $( "#create-new-pitch-get-corner #done_button" ).html( translate["Save"] );

  // Saving popup
  $( "#waiting_dialog #header" ).html( translate["Saving"] );
  $( "#waiting_dialog #info_label2" ).html( translate["Please wait"] );

  // Pause marking popups and bottombar (the static parts)

  $( "#stop_paint_pitch_popup #info_label2" ).html( translate["What will you do"] + "?" );
  $( "#stop_paint_pitch_popup #resume_later_button" ).html( translate["Resume later"] );

  $( "#resume_later_bar #resume_button" ).html( translate["Resume"] );
  $( "#resume_later_bar #cancel_button" ).html( translate["Cancel"] );
  $( "#resume_paint_pitch_popup #info_label1" ).html( translate["Where will you resume from"] + "?" );
  $( "#resume_paint_pitch_popup #resume_button1" ).html( translate["Resume from stopped position"] );
  $( "#resume_paint_pitch_popup #resume_button2" ).html( translate["Resume from robot's position"] );
  $( "#resume_paint_pitch_popup #resume_button3" ).html( translate["Skip to next line"] );
  $( "#resume_paint_pitch_popup #cancel_button" ).html( translate["Cancel"] );



  // Drive to screens
  $( "#drive_to_error_popup #header" ).html( translate["Cannot drive to"] );
  $( "#drive_to_error_popup #info_label1" ).html( translate["Please choose a point to drive to"] );
  $( "#drive_to_error_popup #ok_button" ).html( translate["OK"] );

  $( "#drive-to-screen #header" ).html( translate["Drive to"] );
  $( "#drive-to-screen #info1" ).html( translate["Choose a point to drive to on the map"] );
  $( "#drive-to-screen #start_button" ).html( translate["Start"] );
  $( "#drive-to-screen #cancel_button" ).html( translate["Cancel"] );

  $( "#drive-to-automode-screen #header" ).html( translate["Drive to"] );

  $( "#choose_job_revision_screen #save_button" ).html( translate["Save"] );
  $( "#choose_job_revision_screen #cancel_button" ).html( translate["Cancel"] );
  $( "#choose_job_revision_screen #header" ).html( translate["Choose revision"] );
  if( bottom_bar_chooser.active_bar === "#choose_job_revision_screen" )
    edit_pitch_screen_controller.set_info();

  // Edit layout screen
  $( "#edit-pitch #move_right_label" ).html( "(" + translate_unit() + ")" );
  $( "#edit-pitch #move_up_label" ).html( "(" + translate_unit() + ")" );
  $( "#edit-pitch #back_button" ).html( translate["Back"] );

  // Advanced edit screen
  $( "#advance_edit_screen #close_button" ).html( translate["OK"] );
  $( "#advance_edit_screen #cancel_button" ).html( translate["Cancel"] );
  $( "#advance_edit_screen #save_button" ).html( translate["Save"] );

  // Multi select screen

  // USB load
  
  $( "#load_usb_popup #load_usb_file_header" ).html( translate["Searching for files"] );
  $( "#load_usb_popup #load_file_button" ).html( translate["Import file"] );

  // User information screen
  $(".user_information_screen_header").html(translate["userHeader"]);
  $("#user_information_screen #about_customer_header").text(translate["Owner"]);
  $("#user_information_screen #customer_name_header").text(translate["Customer"]);
  $("#user_information_screen #dealer_name_header").text(translate["Dealer"]);
  
  $("#user_information_screen #user_information_header").text(translate["userContactInfoHeader"]);
  $("#user_information_screen #user_information_message").text(translate["userContactInfoMessage"]);
  $("#user_information_screen #user_information_email_header").text(translate["SupportContactEmailText"]);
  $("#user_information_screen #user_information_phone_header").text(translate["SupportContactPhoneText"]);
  $("#user_information_screen #btn_edit_user_information" ).html( translate["Edit"]);
  $("#user_information_screen #btn_clear_user_information" ).html( translate["delete"]);

  
  // User information popup
  $("#user_info_popup_header").html(translate["editUserContactInfoHeader"]);
  $("#enter_user_info_popup #button_submit").html(translate["submit"]);
  $("#enter_user_info_popup #button_cancel").html(translate["remindMe"]);
  $("#user_info_still_valid_popup #button_yes").html(translate["yes"]);
  $("#user_info_still_valid_popup #button_no").html(translate["no"]);

  // Help screen
  $( ".help_screen_header" ).html( translate["Help"] );
  $( "#help_screen #help_screen_support_contact_header" ).html( translate["SupportContactHeader"] );
  $( "#help_screen #help_screen_support_contact_text" ).html( translate["SupportContactText"] );
  $( "#help_screen #help_screen_support_contact_phone_text" ).html( translate["SupportContactPhoneText"] );
  $( "#help_screen #help_screen_support_contact_phone_value" ).html( translate["SupportContactPhoneValue"] );
  $( "#help_screen #help_screen_support_contact_email_text" ).html( translate["SupportContactEmailText"] );
  $( "#help_screen #help_screen_support_contact_email_value" ).html( translate["SupportContactEmailValue"] );
  $( "#help_screen #help_screen_support_teamviewer_header" ).html( translate["SupportTeamviewerHeader"] );
  $( "#help_screen #help_screen_support_teamviewer_text" ).html( translate["SupportTeamviewerText"] );
  $( "#help_screen #help_screen_support_teamviewer_button" ).html( translate["SupportTeamviewerButton"] );
  $( "#help_screen #help_screen_support_teamviewer_qs_text" ).html( translate["SupportTeamviewerText"] );
  $( "#help_screen #help_screen_support_teamviewer_qs_button" ).html( translate["SupportTeamviewerButton"] );
  $( "#help_screen #help_screen_support_knox_remote_header" ).html( translate["SupportKnoxRemoteHeader"] );
  $( "#help_screen #help_screen_support_knox_remote_text" ).html( translate["SupportTeamviewerText"] );
  $( "#help_screen #help_screen_support_knox_remote_button" ).html( translate["SupportKnoxRemoteButton"] );

  $( "#help_screen  #help_qr_code_link_section_header" ).text(translate["Knowledge Center"]);
  $( "#help_screen  #help_qr_code_link_section_text" ).text(translate["knowledgeCenterBody"]);

  if( AppType === APP_TYPE.TinyLineMarker ) {
    $( "#help_screen #restore_layouts_section_header" ).html( translate["RestorePitchesHeader"] );
    $( "#help_screen #restore_layouts_section_text" ).html( translate["RestorePitchesText"] );
    $( "#help_screen #open_restore_layouts_wizard_button" ).html( translate["RestorePitchesHeader"] );
    $( "#restore_layouts_wizard #restore_layouts_wizard_title" ).html( translate["RestorePitchesHeader"] );
  } else {
    $( "#help_screen #restore_layouts_section_header" ).html( translate["RestoreJobsHeader"] );
    $( "#help_screen #restore_layouts_section_text" ).html( translate["RestoreJobsText"] );
    $( "#help_screen #open_restore_layouts_wizard_button" ).html( translate["RestoreJobsHeader"] );
    $( "#restore_layouts_wizard #restore_layouts_wizard_title" ).html( translate["RestoreJobsHeader"] );
  }

  $( "#help_screen #technical_support_section_header" ).html( translate["TechnicalSupportHeader"] );
  $( "#help_screen #technical_support_section_text" ).html( translate["SupportTeamviewerText"] );
  if( logger.vorlonProd )
    $( "#help_screen #technical_support_section_button" ).html( translate["TechnicalSupportButtonRunning"] );
  else
    $( "#help_screen #technical_support_section_button" ).html( translate["TechnicalSupportButton"] );

  $( "#help_screen_support_screenshot_header" ).html( translate["Send screenshot"] );
  $( "#help_screen_support_screenshot_button" ).html( translate["Send screenshot"] );
  $( "#help_screen_support_screenshot_text" ).html( translate["Screenshot_info_text"].replace( /\n/g, "<br>" ) );
  $( "#topbar #send_screenshot_topbar_labal" ).html( translate["Send screen"].replace( " ", "<br>" ) );

  $( "#help_screen #app_safemode_section_header" ).text( translate["Safe Mode"] );
  $( "#help_screen #app_safemode_section_text" ).text( translate["SafeModeInfoText"] );

  $( "#help_screen #reset_settings_section_header" ).text( translate["Reset settings"] );
  $( "#help_screen #reset_settings_btn" ).text( translate["Reset settings"] );
  $( "#help_screen #reset_settings_section_text" ).text( translate["Reset_info_text"] );

  // New topbar
  $("#topbar_conn_header_robot").text(translate["Robot"]);
  $("#topbar_conn_header_tablet").text(translate["Tablet"]);
  $("#topbar_internet_header").text(translate["Robot Internet"]);
  $("#topbar_battery_header").text(translate["Robot Battery"]);

  // General settings screen
  $( ".general_settings_screen_header" ).html( translate["GeneralSettingsHeader"] );
  $( ".display_settings_header" ).html( translate["DisplaySettingsHeader"] );
  $( "#map_settings_header" ).html( translate["Map"] );
  $( "#job_settings_header" ).html( translate["Job"] );
  $( "#general_settings_screen #show_job_task_arrows_label" ).html( translate["ToggleTaskArrows"] );
  $( "#general_settings_screen #show_job_direction_arrows_label" ).text( translate["ToggleDirectionalArrows"] );
  $( "#general_settings_screen #show_dashing_label" ).html( translate["ToggleDashing"] );
  $( "#general_settings_screen #toggle_labels_label" ).html( translate["ToggleLabels"] );
  $( "#general_settings_screen #scale_labels_label" ).html( translate["ScaleLabels"] );
  $( "#general_settings_screen #toggle_default_split_label" ).html( translate["ToggleSplit"] );
  $( "#general_settings_screen #toggle_default_swap_ne_label" ).html( translate["SwapNE"] );
  if( APP_TYPE.TinySurveyor === AppType){
    $( "#general_settings_screen #toggle_show_path_between_tasks_label" ).html( translate["Transport path"]);
  }
  else{
    $( "#general_settings_screen #toggle_show_path_between_tasks_label" ).html( translate["ShowRobotPath"] );
  }
  $( "#general_settings_screen #select_map_dot_icon_label" ).text( translate["Point Symbol"] );
  $( "#general_settings_screen #select_map_dot_size_label" ).text( translate["Size"] );
  $( "#general_settings_screen #toggle_follow_robot_label" ).html( translate["Follow robot"] );
  $( "#general_settings_screen #toggle_auto_zoom_label" ).html( translate["Auto zoom"] );
  $( "#general_settings_screen #show_background_map_label" ).html( translate["Background map"] );
  $( "#general_settings_screen #show_roads_on_map_label" ).html( translate["Map labels"] );
  $( "#general_settings_screen #automatic_choose_projection_label" ).html( translate["Automatic choose projection"] );
  $( "#general_settings_screen #show_job_types_label" ).html( translate["showJobsBySource"].format(translate["Job"].toLowerCase()) );
  $( "#general_settings_screen #tlm_show_job_types_button_cloud" ).html( translate["cloud"] );
  $( "#general_settings_screen #tlm_show_job_types_button_all" ).html( translate["all"] );
  $( "#general_settings_screen #tlm_show_job_types_button_usb" ).html( translate["imported"] );
  $( "#general_settings_screen #ts_show_job_types_button_cloud" ).html( translate["cloud"] );
  $( "#general_settings_screen #ts_show_job_types_button_all" ).html( translate["all"] );
  $( "#general_settings_screen #ts_show_job_types_button_usb" ).html( translate["imported"] );
  general_settings_screen.changeShowingJobsBySource();


  // Screen timeout setting
  $("#general_settings_screen #screen_timeout_setting_header").text(translate["screenTimeout"]);
  $("#general_settings_screen #screen_timeout_in_manual_label").text(translate["whileNotPainting"]);
  $("#general_settings_screen #screen_timeout_in_auto_label").text(translate["whilePainting"]);

  // Low power mode setting
  $("#general_settings_screen #low_power_setting_header").text(translate["lowPowerTimeout"]);
  $("#general_settings_screen #low_power_label").text(translate["lowPowerTimeout"]);

  if( AppType === APP_TYPE.TinyLineMarker )
    $( "#general_settings_screen #show_clusters_label" ).html( translate["Field clusters"] );
  else
    $( "#general_settings_screen #show_clusters_label" ).html( translate["Job clusters"] );

  $( "#general_settings_screen #show_locked_layouts_label" ).html( translate["Show locked layouts"] );

  // General settings screen > Edit maps screen
  $( "#general_settings_screen #custom_maps_button" ).html( translate["Edit maps"] );
  $( "#general_settings_screen #custom_map_screen_header" ).html( translate["Edit maps"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_name_label" ).html( translate["Name"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_url_label" ).html( translate["URL"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_raw_url_label" ).html( translate["Raw URL"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_token_label" ).html( translate["Token"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_username_label" ).html( translate["Username"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_password_label" ).html( translate["Password"] );
  $( "#custom_map_screen_edit_map_page #load_layers_button" ).html( translate["Load layers"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_layer_label" ).html( translate["Layer"] );
  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_layer_abstract_label" ).html( translate["Description"] );
  $( "#custom_map_screen_edit_map_page #save_button" ).html( translate["Save"] );
  $( "#custom_map_screen_edit_map_page #cancel_button" ).html( translate["Cancel"] );
  $( "#custom_map_screen_edit_map_information" ).html( translate["WarningCustomMapType"] );

  $( "#custom_map_screen_edit_map_page #custom_map_edit_form_service_label" ).text( translate["Service"] );
  $( "#custom_map_screen_edit_map_page #load_capabilities_file_button" ).text( translate["Load source"] );

  // User calibration screen
  $( ".user_calibration_menu_header" ).html( translate["Calibration"] );

  // About / Auto Update screen
  $( ".auto_update_screen_header" ).html( translate["About"] );
  $( "#auto_update_screen #auto_update_app_header" ).html( translate["Tablet"] );
  $( "#auto_update_screen #tablet-id-header" ).html( translate["ID"] ); 
  $( "#auto_update_screen #current-app-version-header" ).html( translate["Version"] );
  $( "#auto_update_screen .auto_update_app_button" ).html( translate["Check for Updates"] );
  $( "#auto_update_screen .app_changelog_button" ).html( translate["Changelog"] );

  $( "#auto_update_screen #auto_update_robot_header" ).text( translate["Robot"] ); 
  $( "#auto_update_robot .robot-id-header" ).text( translate["ID"] );
  $( "#auto_update_robot .robot-name-header" ).text( translate["name"] );
  $( "#auto_update_screen #current-robot-version-header" ).html( translate["version"] );

  // run pitch screen
  $( '#paint-pitch-bar #dist_to_point_label' ).html( " " + translate["to next point"] );

  // robot_position_error
  $( "#robot_position_error #header" ).html( translate["Robot position"] );
  $( "#robot_position_error #info_label1" ).html( translate["Uncertain robot position"] );
  $( "#robot_position_error #info_label2" ).html( translate["Please wait for the robot to get a better signal"] );
  $( "#robot_position_error #ok_button" ).html( translate["OK"] );

  // robot_message_popup
  $( "#robot_message_popup #open_cleaning_from_error" ).html( translate["Open cleaning"] );

  // Templateshop
  $( ".templateshop_screen_header" ).text( translate["Templates"] );
  $( "#templateshop_screen #redeem_voucher_init_button" ).text( translate["Redeem Voucher"] );
  $( "#templateshop_choose_robot h2" ).text( translate["Choose robot to start"] + "." );
  $( "#owned_templates_header" ).text( translate["My templates"] );
  $( "#available_templates_header" ).text( translate["Available templates"] );
  templateshop_screen.update_vat_text();
  $( ".available_templates_vat_notice_change" ).text( translate["Change"].toLowerCase() );
  $( "#templateshop_redeem_voucher_screen #voucher_wrapper h2" ).text( translate["Redeem Voucher"] );
  $( "#templateshop_redeem_voucher_screen #voucher_open_scanner" ).text( translate["Scan QR"] );
  $( "#templateshop_redeem_voucher_screen #voucher_submit" ).text( translate["Redeem Voucher"] );

  // Move Layouts Wizard
  $( "#open_move_layouts_wizard_button" ).text( translate["Move Layouts Wizard"] );
  $( "#move_layouts_wizard #move_layouts_wizard_title" ).text( translate["Move Layouts Wizard"] );
  if(AppType === APP_TYPE.TinySurveyor) {
    $( "#move_layouts_wizard #move_layouts_wizard_subtitle" ).text( translate["selectJobsMoveWizard"] );
  } else {
    $( "#move_layouts_wizard #move_layouts_wizard_subtitle" ).text( translate["selectPitchesMoveWizard"] );
  }
  $( "#move_layouts_wizard #deselect_all" ).text( translate["Deselect all"] );
  $( "#move_layouts_wizard #select_all_onscreen" ).text( translate["Select visible"] );
  $( "#move_layouts_wizard #give_to_button" ).text( translate["Give to"] );
  $( "#move_layouts_wizard #copy_to_button" ).text( translate["Copy to"] );
  $( "#move_layouts_wizard #cancel_button" ).text( translate["Done"] );

  // Restore Layouts Wizard
  $( "#restore_layouts_wizard #restore_layouts_wizard_title" ).text( translate["RestorePitchesHeader"] );
  if(AppType === APP_TYPE.TinySurveyor) {
    $( "#restore_layouts_wizard #restore_layouts_wizard_subtitle" ).text( translate["selectJobsRestoreWizard"] );
  } else {
    $( "#restore_layouts_wizard #restore_layouts_wizard_subtitle" ).text( translate["selectPitchesRestoreWizard"] );
  }
  $( "#restore_layouts_wizard #deselect_all" ).text( translate["Deselect all"] );
  $( "#restore_layouts_wizard #select_all_onscreen" ).text( translate["Select visible"] );
  $( "#restore_layouts_wizard #restore_button" ).text( translate["Restore"] );
  $( "#restore_layouts_wizard #cancel_button" ).text( translate["Done"] );

  // Multiselect
  $(".multiselect_button_on").text(translate["Select"]);
  $(".multiselect_select_all_onscreen").text(translate["Visible"]);
  $(".multiselect_layer_select").text(translate["Layer"]);
  $(".multiselect_boundary_select").text(translate["Boundary"]);

  cleaning_screen_controller.translate();

  top_bar_screen_controller.update_precision( true );

  screen_lock_controller.updateScreenTimeoutInManual();
  screen_lock_controller.updateScreenTimeoutInAuto();
  screen_lock_controller.updateLowPowerSlider();
}

$( document ).ready( function()
{
  //event_controller.add_callback( "robot_list_updated", translate_screen );
  event_controller.add_callback( "robot_capabilities_updated", function()
  {
    if( AppType !== APP_TYPE.TinyLineMarker )
    {
      if( robot_controller.robot_has_capability( "task_start_from_option" ) )
        $( "#track-selected #start_near_button" ).removeClass( "gone" );
      else
        $( "#track-selected #start_near_button" ).addClass( "gone" );
    }

    if( robot_controller.robot_has_capability( "spray_offset_as_time" ) )
    {
      $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_label" ).html( translate["Linepaint spray offset start"] + " (" + translate["sec"] + ")" );
      $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_label" ).html( translate["Linepaint spray offset end"] + " (" + translate["sec"] + ")" );
    }
    else
    {
      $( "#robot_behaviour_settings_screen #linepaint_spray_offset_start_label" ).html( translate["Linepaint spray offset start"] + " (" + translate_unit() + ")" );
      $( "#robot_behaviour_settings_screen #linepaint_spray_offset_end_label" ).html( translate["Linepaint spray offset end"] + " (" + translate_unit() + ")" );
    }
  } );
} );
