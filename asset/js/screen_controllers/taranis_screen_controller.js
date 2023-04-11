const taranis_screen_controller = {
  open: function()
  {
    taranis_screen_controller.is_open = true;
    $( ".joystick" ).addClass( "taranis_joystick" );
    $( ".emergencystop" ).addClass( "taranis_joystick" );
    $( "#taranis_screen" ).removeClass( "gone" );
    settings_screeen_controller.close();
    taranis_screen_controller.update_buttons();

    if( AppType === APP_TYPE.TinyRemote )
    {
      $( "#taranis_screen .close_button_icon" ).css( "opacity", 0 );
    }
  },
  is_open: false,
  close_countdown: 10,
  close: function()
  {
    function doClose()
    {
      taranis_screen_controller.is_open = false;
      $( ".joystick" ).removeClass( "taranis_joystick" );
      $( ".emergencystop" ).removeClass( "taranis_joystick" );
      $( "#taranis_screen" ).addClass( "gone" );
      settings_screeen_controller.open();
    }

    if( AppType === APP_TYPE.TinyRemote )
    {
      taranis_screen_controller.close_countdown--;
      if( taranis_screen_controller.close_countdown === 0 )
        doClose();

      setTimeout( function()
      {
        taranis_screen_controller.close_countdown = 10;
      }, 10000 );
    }
    else
      doClose();
  },

  update_display: function()
  {
    $( "#taranis_screen #lcd_line1" ).html( robot_controller.display_lines[0].replace( /\ /g, "&nbsp;" ) );
    $( "#taranis_screen #lcd_line2" ).html( robot_controller.display_lines[1].replace( /\ /g, "&nbsp;" ) );
    $( "#taranis_screen #lcd_line3" ).html( robot_controller.display_lines[2].replace( /\ /g, "&nbsp;" ) );
    $( "#taranis_screen #lcd_line4" ).html( robot_controller.display_lines[3].replace( /\ /g, "&nbsp;" ) );
  },
  toggle_auto: function()
  {
    if( robot_controller.state_top === TopStates.AUTOMATIC )
    {
      robot_controller.manual_mode();
      $( "#taranis_screen #auto_button" ).html( "Auto" );
    }
    else
    {
      robot_controller.auto_mode();
      $( "#taranis_screen #auto_button" ).html( "Manuel" );
    }
  },
  set_manuel: function()
  {
    robot_controller.manual_mode();
    $( "#taranis_screen #auto_button" ).html( "Auto" );
  },
  update_buttons: function()
  {
    if( !taranis_screen_controller.is_open )
      return;

    if( robot_controller.state_top !== TopStates.AUTOMATIC )
    {
      $( "#taranis_screen #auto_button" ).html( "Auto" );
    }
    else
    {
      $( "#taranis_screen #auto_button" ).html( "Manuel" );
    }
  },
  goto_task: function()
  {
    var num = parseInt( prompt( "Choose task number" ) );
    if( num || num === 0 )
      robot_controller.set_task_pos( num );
  }
};

event_controller.add_callback( "lcd_display_lines", taranis_screen_controller.update_display );
event_controller.add_callback( "on_system_diag_change", taranis_screen_controller.update_buttons );