const top_bar_screen_controller = {
  calc_precision_thresh: function( original_thresh )
  {
    if( AppType !== APP_TYPE.TinySurveyor )
      return original_thresh;

    let mod = 7.5 / robot_behaviour_settings_screen.get_min_input_frequency();
    return mod ? mod * original_thresh : original_thresh;
  },
  get precision_god_tresh()
  {
    return top_bar_screen_controller.calc_precision_thresh( 0.0035 );
  },
  get precision_bad1_tresh()
  {
    return top_bar_screen_controller.calc_precision_thresh( 0.02 );
  },
  get pricision_bad2_tresh()
  {
    return top_bar_screen_controller.calc_precision_thresh( 2 );
  },
  update: function()
  {
    
    var server_online = robot_controller.chosen_robot.online_cloud;
    var bluetooth_online = robot_controller.chosen_robot.online_bluetooth;

    if( server_online && bluetooth_online )
    {
      $( "#topbar #signal_indicator" ).html( '<img src="img/icons/Signal@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Good"] );
      $( "#topbar #signal_indicator" ).attr( "class", "" );
    }

    if( server_online && !bluetooth_online )
    {
      $( "#topbar #signal_indicator" ).html( '<img src="img/icons/Signal@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Cloud"] );
      $( "#topbar #signal_indicator" ).attr( "class", "topbar-bad" );
    }

    if( !server_online && bluetooth_online )
    {
      $( "#topbar #signal_indicator" ).html( '<img src="img/icons/Signal@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Bluetooth"] );
      $( "#topbar #signal_indicator" ).attr( "class", "topbar-bad" );
    }

    if( !server_online && !bluetooth_online )
    {
      $( "#topbar #signal_indicator" ).html( '<img src="img/icons/Signal@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["None"] );
      $( "#topbar #signal_indicator" ).attr( "class", "topbar-none" );
      top_bar_screen_controller.force_battery( -1 );
    }

    top_bar_screen_controller.update_precision();

    // Toggle report bug button
    if( false && login_screen_controller.user_level === user_level.DEVELOPER)
      q$(".report_bug_button").removeClass("gone");
    else
      q$(".report_bug_button").addClass("gone");

  },
  last_precision: undefined,
  last_online: undefined,
  update_precision: function( force_update )
  {
    if( top_bar_screen_controller.last_precision === robot_controller.chosen_robot.precision && top_bar_screen_controller.last_online === robot_controller.chosen_robot.online && !force_update )
      return;
    top_bar_screen_controller.last_precision = robot_controller.chosen_robot.precision;
    top_bar_screen_controller.last_online = robot_controller.chosen_robot.online;
    if( robot_controller.chosen_robot.precision < top_bar_screen_controller.precision_god_tresh && robot_controller.chosen_robot.online )
    {
      $( "#topbar #precision_indicator" ).html( '<img src="img/icons/Satellite@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Good"] );
      $( "#topbar #precision_indicator" ).attr( "class", "" );
      $( "#topbar .center_on_robot_button" ).removeClass( "gone" );
    }
    else if( robot_controller.chosen_robot.precision < top_bar_screen_controller.precision_bad1_tresh && robot_controller.chosen_robot.online )
    {
      $( "#topbar #precision_indicator" ).html( '<img src="img/icons/Satellite@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Bad"] );
      $( "#topbar #precision_indicator" ).attr( "class", "topbar-bad" );
      $( "#topbar .center_on_robot_button" ).addClass( "gone" );
    }
    else if( robot_controller.chosen_robot.precision < top_bar_screen_controller.pricision_bad2_tresh && robot_controller.chosen_robot.online )
    {
      $( "#topbar #precision_indicator" ).html( '<img src="img/icons/Satellite@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["Bad"] );
      $( "#topbar #precision_indicator" ).attr( "class", "topbar-critical" );
      $( "#topbar .center_on_robot_button" ).addClass( "gone" );
    }
    else
    {
      $( "#topbar #precision_indicator" ).html( '<img src="img/icons/Satellite@2x.png" alt="" class="topbar-icon-small"><br> ' + translate["None"] );
      $( "#topbar #precision_indicator" ).attr( "class", "topbar-none" );
      $( "#topbar .center_on_robot_button" ).addClass( "gone" );
    }
  },
  update_tools: function()
  {
    /*
     <div id="pump_status" ><img src="img/icons/Pump_2@2x.png" alt="" class="topbar-icon"></div>
     <div id="spray_status"><img src="img/icons/Spray_2@2x.png" alt="" class="topbar-icon"></div>
     */
     if( APP_TYPE.TinySurveyor === AppType){
      $("#topbar_gnss_header").text(translate["Robot GNSS"]);
  
    }
    else{
      $("#topbar_gnss_header").text(translate["Robot GPS"]);
    }

    if( (robot_controller.tool_info && robot_controller.tool_info.pump_on) )
    {// || robot_controller.state_top === TopStates.AUTOMATIC ) {
      $( "#topbar #pump_status img" ).attr( "src", "img/icons/Pump_1@2x.png" );
    }
    else
    {
      $( "#topbar #pump_status img" ).attr( "src", "img/icons/Pump_2@2x.png" );
    }
    if( robot_controller.tool_info && robot_controller.tool_info.spray_on )
    {
      $( "#topbar #spray_status img" ).attr( "src", "img/icons/Spray_1@2x.png" );
    }
    else
    {
      $( "#topbar #spray_status img" ).attr( "src", "img/icons/Spray_2@2x.png" );
    }
  },
  update_battery: function()
  {
    $( "#topbar #battery-container" ).removeClass( "topbar-bad" );
    $( "#topbar #battery-container" ).removeClass( "topbar-critical" );
    $( "#topbar #battery-container" ).removeClass( "topbar-none" );

    var new_class = "";
    var html = "";
    if( robot_controller.battery_level > 75 )
    {
      html = '<img src="img/icons/Battery_full.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
    }
    if( robot_controller.battery_level <= 75 )
    {
      html = '<img src="img/icons/Battery_high.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
    }
    if( robot_controller.battery_level <= 55 )
    {
      html = '<img src="img/icons/Battery_half.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
    }
    if( robot_controller.battery_level <= 25 )
    {
      html = '<img src="img/icons/Battery_low.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
      new_class = "topbar-bad";
    }
    if( robot_controller.battery_level <= 5 )
    {
      html = '<img src="img/icons/Battery_critical.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
      new_class = "topbar-critical";
    }
    if( robot_controller.battery_level < 2 )
    {
      html = '<img src="img/icons/Battery_empty.png" alt="" class="topbar-icon-small"><br> ' + robot_controller.battery_level + '%';
      new_class = "topbar-critical";
    }
    if( robot_controller.battery_level < 0 )
    {
      html = '<img src="img/icons/Battery_unknown.png" alt="" class="topbar-icon-small"><br> ' + '';
      new_class = "topbar-critical";
    }

    $( "#topbar #battery-container" ).html( html );
    $( "#topbar #battery-container" ).addClass( new_class );
  },
  force_battery: function( level )
  {
    if( level !== robot_controller.battery_level )
    {
      robot_controller.battery_level = level;
      top_bar_screen_controller.update_battery();
    }
  },
  play_battery: function()
  {
    var level = 100;
    var inter = setInterval( function()
    {
      message_controller.processMessage( {
        topic: "battery",
        data: {
          level: level
        }
      } );
      //top_bar_screen_controller.force_battery( level );
      if( level <= 0.1 )
      {
        clearInterval( inter );
      }
      level -= 1;
    }, 200 );
  },
  code_pressed: '',
  secret_button: function( num )
  {
    top_bar_screen_controller.code_pressed += num.toString();

    //var reset_pass_code = '01234331143210';
    var reset_pass_code = '012333113210';
    var dealer_pass_code = '01230123012010';

    if( top_bar_screen_controller.code_pressed.length > 50 )
      top_bar_screen_controller.code_pressed = top_bar_screen_controller.code_pressed.substring( 1 );

    if( top_bar_screen_controller.code_pressed.endsWith( reset_pass_code ) )
    {
      top_bar_screen_controller.code_pressed = '';
      developer_screen.enableDeveloperMode();
    }
    if( top_bar_screen_controller.code_pressed.endsWith( dealer_pass_code ) )
    {
      top_bar_screen_controller.code_pressed = '';
      developer_screen.set_user_level( 1, true );
      alert( "Dealer mode active" );
    }
  }
};
$( document ).ready( function()
{
  event_controller.add_callback( "topbar_force_update", top_bar_screen_controller.update );

  event_controller.add_callback( "got_robot_position", function( robot )
  {
    top_bar_screen_controller.update_precision();
  } );
  event_controller.add_callback( "chosen_robot_online_changed", top_bar_screen_controller.update );
  event_controller.add_callback( "chosen_robot_online_cloud_changed", top_bar_screen_controller.update );
  event_controller.add_callback( "connected_to_bluetooth", top_bar_screen_controller.update );
  event_controller.add_callback( "bluetooth_disconnect", top_bar_screen_controller.update );
  event_controller.add_callback( "tool_info_updated", top_bar_screen_controller.update_tools );
  event_controller.add_callback( "on_system_diag_change", top_bar_screen_controller.update_tools );
  event_controller.add_callback( "battery_level_updated", top_bar_screen_controller.update_battery );

  event_controller.add_callback( 'got_robot_capabilities', function()
  {
    if( AppType === APP_TYPE.TinySurveyor )
    {
      if( robot_controller.robot_has_capability( 'platform_pump' ) )
      {
        $( "#dummy_field" ).addClass( "gone" );
        $( "#pump_status" ).removeClass( "gone" );
      }
      else
      {
        $( "#dummy_field" ).removeClass( "gone" );
        $( "#pump_status" ).addClass( "gone" );
      }
    }
  } );
});