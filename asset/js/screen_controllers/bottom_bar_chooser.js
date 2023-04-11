
function return_something()
{
  return 1, 2;
}

const bottom_bar_chooser = {
  events: {
    before_open: new MultiEventController(),
    before_close: new MultiEventController(),
    after_open: new MultiEventController(),
    after_close: new MultiEventController()
  },

  active_bar: "#starting-bottombar",
  bars: [ "#robot-not-selected", "#robot-offline", "#robot-selected", "#track-selected", "#copy-track", "#offset-track", "#edit-pitch", "#position-totalstation" ],
  history: [ ],
  reload_bottom_bar: function()
  {
    logger.debug( "reloading bottombar" );
    bottom_bar_chooser.choose_bottom_bar(bottom_bar_chooser.active_bar, true);
  },
  choose_bottom_bar: function( id = "#robot-selected", reload = false)
  {
    // Always lock app functionality if robot has not been chosen
    if( !robot_controller.chosen_robot_id && (id !== "#robot-not-selected") )
    {
      bottom_bar_chooser.choose_bottom_bar( "#robot-not-selected" );
      return;
    }

    // Don't reload robot-not-selected
    if(reload && id === "#robot-not-selected")
    {
      id = "#robot-selected";
    }

    // Always show one of the bars related to AUTOMATIC top state
    // if in the process of doing a job.
    if(robot_controller.chosen_robot.top_state === TopStates.AUTOMATIC || run_pitch_controller.running || drive_to_screen_controller.running)
    {
      let jobInfo = [];
      if(robot_controller.task_info["Job name"])
      {
        jobInfo = robot_controller.task_info["Job name"].split( "_" );
      }


      if(((robot_controller.chosen_robot.top_state === TopStates.AUTOMATIC && robot_controller.chosen_robot.user_state === TopStates.AUTOMATIC && jobInfo[0] === "goto") || drive_to_screen_controller.running) && id !== "#drive-to-automode-screen")
      {
        drive_to_screen_controller.after_waypoint_loaded();
        return;
      }
      else if(robot_controller.chosen_robot.top_state === TopStates.MANUAL && robot_controller.chosen_robot.user_state === TopStates.MANUAL &&  drive_to_screen_controller.running && id !== '#drive-to-screen' && id !== "#drive-to-automode-screen")
      {
        drive_to_screen_controller.stop_screen();
        return;
      }
      else if(robot_controller.task_info["Job name"])
      {
        const job_id = parseInt( jobInfo[0] );
        const job = robot_controller.get_db_job( job_id );
        
        if(job && !(pitch_generator.active instanceof MultiJob) ) {
          
          if( jobInfo[3] === "linemarker" || jobInfo[3] === "test" ) {
            if(robot_controller.chosen_robot.top_state === TopStates.AUTOMATIC && robot_controller.chosen_robot.user_state === TopStates.AUTOMATIC && id !== "#paint-pitch-bar" && !run_pitch_controller.running && !run_pitch_controller.jobLoading)
            {
              run_pitch_controller.running = true;
              pitch_generator.set_active_from_db_job_id( job_id );
            
              const start_time = parseFloat( jobInfo.last() );
    
              run_pitch_controller.starTime = new Date( start_time );
              run_pitch_controller.start_timer();

              bottom_bar_chooser.choose_bottom_bar( "#paint-pitch-bar" );
              robot_controller.user_info_event.add_callback( "Job done", run_pitch_controller.marking_done );
              return;
            }
            else if(robot_controller.chosen_robot.top_state === TopStates.MANUAL && robot_controller.chosen_robot.user_state === TopStates.MANUAL && run_pitch_controller.running && !run_pitch_controller.jobLoading && id !== "#resume_later_bar" && id !== "#paint-pitch-bar")
            {
              run_pitch_controller.running = true;
              pitch_generator.set_active_from_db_job_id( job_id );
              bottom_bar_chooser.choose_bottom_bar( "#resume_later_bar" );
              return;
            }
          }
        }
      }
    }

    if( bottom_bar_chooser.active_bar === id && !reload )
      return;

    if( bottom_bar_chooser.active_bar !== id )
    {
      console.log( "closing bar", bottom_bar_chooser.active_bar );
      console.log( "opening bar", id );

      if( bottom_bar_chooser.active_bar === "#track-selected" )
      {
        map_controller.background.remove_overlays();
      }
    }

    if( bottom_bar_chooser.active_bar !== id )
    {
      bottom_bar_chooser.events.before_close.call_callback( bottom_bar_chooser.active_bar );
      bottom_bar_chooser.events.before_open.call_callback( id );
    }
    
    if( id === "#robot-offline" )
    {
      if( robot_controller.chosen_robot_id && robot_controller.chosen_robot.online )
      {
        bottom_bar_chooser.choose_bottom_bar( "#robot-selected" );
        return;
      }

      if( robot_controller.chosen_robot )
      {
        $( "#robot-offline h3" ).html( translate["The robot %1s"].format(robot_controller.chosen_robot.name) );
        $( "#robot-offline h4" ).html( translate["No connection to the robot"] );
      }
      else
      {
        $( "#robot-offline h3" ).html( translate["The robot %1s"].format("") );
        $( "#robot-offline h4" ).html( translate["No connection to the robot"] );
      }
    }
    if( id === "#robot-selected" )
    {
      if( !robot_controller.chosen_robot_id || !robot_controller.chosen_robot.online )
      {
        bottom_bar_chooser.choose_bottom_bar( "#robot-offline" );
        return;
      }

      $( "#robot-selected h3" ).text( translate["The robot %1s"].format(robot_controller.chosen_robot.name) );

      auto_update_screen.updateRobotSection();
    }

    if( id === "#track-selected" )
    {

      let show_copy_button = pitch_generator.active.copyable;
      let show_edit_button = pitch_generator.active.editable;
      let show_delete_button = pitch_generator.active.deleteable;

      if( !communication_controller.appServerConnection.connected && !pitch_generator.active.can_edit_when_offline )
      {
        $( "#button_overlay #edit_button" ).addClass( "bright" );
        $( "#button_overlay #edit_button" ).removeClass( "dark" );

        $( "#button_overlay #copy_button" ).addClass( "bright" );
        $( "#button_overlay #copy_button" ).removeClass( "dark" );

        $( "#button_overlay #fitter_button" ).addClass( "bright" );
        $( "#button_overlay #fitter_button" ).removeClass( "dark" );

        $( "#button_overlay #delete_button" ).addClass( "bright" );
        $( "#button_overlay #delete_button" ).removeClass( "dark" );
      }
      else
      {
        $( "#button_overlay #edit_button" ).removeClass( "bright" );
        $( "#button_overlay #edit_button" ).addClass( "dark" );

        $( "#button_overlay #copy_button" ).removeClass( "bright" );
        $( "#button_overlay #copy_button" ).addClass( "dark" );

        $( "#button_overlay #fitter_button" ).removeClass( "bright" );
        $( "#button_overlay #fitter_button" ).addClass( "dark" );

        $( "#button_overlay #reverse_button" ).removeClass( "bright" );
        $( "#button_overlay #reverse_button" ).addClass( "dark" );

        $( "#button_overlay #delete_button" ).removeClass( "bright" );
        $( "#button_overlay #delete_button" ).addClass( "dark" );
      }

      if( login_screen_controller.user_level === user_level.LIMITED )
      {
        show_edit_button &= false;
        show_delete_button &= false;
        show_copy_button &= false;
      }

      $( "#track-selected #test_button" ).removeClass( "gone" );


      $( "#button_overlay #pitch_revision_button" ).toggleClass( "gone", !pitch_generator.active.allow_revisions );
      $( "#button_overlay #offset_button" ).toggleClass( "gone", !pitch_generator.active.allow_offset );
      $( "#button_overlay #reverse_button" ).toggleClass( "gone", !(pitch_generator.active.options["Reverse"] && (pitch_generator.active.options["Reverse"].adjustable||pitch_generator.active.options["Reverse"].configurable) && SETTINGS.show_reverse_button) );
      $( "#button_overlay #fitter_button" ).toggleClass( "gone", !pitch_generator.active.allow_fit );
      $( "#button_overlay #optimize_path_button" ).toggleClass("gone", !pitch_generator.active.allow_optimize);
      
      $( "#button_overlay #edit_button" ).attr("disabled", !show_edit_button);
      $( "#button_overlay #reverse_button" ).attr("disabled", !show_edit_button);
      $( "#button_overlay #copy_button" ).attr("disabled", !show_copy_button);
      $( "#button_overlay #delete_button" ).attr("disabled", !show_delete_button);

      if (pitch_generator.active.forceUsingStartLocations) {
        $("#start_near_button").attr("disabled", true);
      }
      else {
        $("#start_near_button").attr("disabled", false);
      }
      
      if(pitch_generator.active instanceof MultiJob)
      {
        $(".multiselect_button_toggle").text(translate["Exit"]);

        $(".multiselect_job_list .reorder-handle").removeClass("gone");

        const job_count = pitch_generator.active.jobs.length;

        $( "#track-selected #start_button" ).attr("disabled", job_count === 0);
        $( "#track-selected #test_button" ).attr("disabled", job_count === 0);
        $( "#button_overlay #optimize_path_button" ).attr("disabled", job_count === 0);
        $( "#button_overlay #delete_button" ).attr("disabled", job_count === 0);
        
        const total_distance = pitch_generator.active.length.meter2unit().round();
        const total_time = pitch_generator.active.time_to_drive;
        switch(job_count)
        {
          case 0: {
            $( "#track-selected #header" ).text( translate["Selecting multiple jobs"] );
            $( "#track-selected #pitch_type" ).text( translate["Please select a job"] );
            $( "#track-selected #pitch_info" ).text( "" );
            break;
          }
          case 1: {
            $( "#track-selected #header" ).text( translate["Selected %1s job"].format(job_count) );
            $( "#track-selected #pitch_type" ).text( translate["Total distance to drive: %1s%2s"].format(total_distance,translate_unit()) );
            $( "#track-selected #pitch_info" ).text( translate["Estimated time to finish: %1s"].format(translation.seconds2time(total_time)) );
            break;
          }
          default: {
            $( "#track-selected #header" ).text( translate["Selected %1s jobs"].format(job_count) );
            $( "#track-selected #pitch_type" ).text( translate["Total distance to drive: %1s%2s"].format(total_distance,translate_unit()) );
            $( "#track-selected #pitch_info" ).text( translate["Estimated time to finish: %1s"].format(translation.seconds2time(total_time)) );
            break;
          }
        }
      }
      else
      {
        $(".multiselect_button_toggle").text(translate["Select"]);
        if( pitch_generator.active.template_id === "dxf_parser" )
        {
          $( "#track-selected #header" ).text( pitch_generator.active.template_type );
          //var pitch_titlte = "";
          //var pitch_type = pitch_generator.active.name;
        }
        else
        {
          $( "#track-selected #header" ).text( pitch_generator.active.name );
        }
        
        var pitch_type_name = pitch_generator.active.job_name( translate );
        $( "#track-selected #pitch_type" ).html( pitch_type_name );


        if(pitch_generator.active.interaction_type === Job.interaction_types.PITCH){
          var txt = "";
          pitch_generator.active.info_options.map( function( option_key )
          {
            if( txt )
              txt += ", ";
            var option_name = pitch_generator.active.options[option_key].name;
            var translated = translate[option_name] ? translate[option_name] : option_name;
            if( pitch_generator.active.options[option_key].type === "float" )
            {
              if( pitch_generator.active.options[option_key].val || pitch_generator.active.options[option_key].val === 0 )
                txt += translated + ": " + pitch_generator.active.options[option_key].val.meter2unit().round(2) + " " + translate_unit();
              else
                console.error( "Info key is supposed to be a value but is not found. Job id:", pitch_generator.active.id );
            }
            if( pitch_generator.active.options[option_key].type === "int" )
            {
              txt += translated + ": " + pitch_generator.active.options[option_key].val.round(2);
            }
            if( pitch_generator.active.options[option_key].type === "string" )
            {
              txt += pitch_generator.active.options[option_key].val;
            }
            if( pitch_generator.active.options[option_key].type === "bool" )
            {
              txt += translated + ": " + pitch_generator.active.options[option_key].val;
            }
          } );        
        }
      

        $( "#track-selected #pitch_info" ).text( txt );
      }


      if( robot_controller.chosen_robot && robot_controller.chosen_robot.online )
      {
        $( "#track-selected .start-robot" ).removeClass( "bright" );
        $( "#track-selected .start-robot" ).addClass( "dark" );
        //bottom_bar_chooser.show_joystick();
      }
      else
      {
        $( "#track-selected .start-robot" ).addClass( "bright" );
        $( "#track-selected .start-robot" ).removeClass( "dark" );
        //obttom_bar_chooser.hide_circle();
      }
    }

    if( id === "#edit-pitch" )
    {
      if( !reload )
      {
        edit_pitch_screen_controller.update_bar();
      }
    }


    if( id === "#copy-track" || id === "#offset-track" )
    {
      if( !communication_controller.appServerConnection.connected && !pitch_generator.active.can_edit_when_offline )
      {
        popup_screen_controller.confirm_popup( "Offline", "You cannot modify pitches while offline", "ok", "", popup_screen_controller.close );
        return;
      }
      if( !reload )
      {
        if( id === "#copy-track" )
          copy_pitch_screen_controller.open();
        if( id === "#offset-track" )
          copy_pitch_screen_controller.open( true );
      }
    }

    if( id === "#create-new-pitch-get-corner" )
    {
      // if( AppType === APP_TYPE.TinyLineMarker )
      // {
      //   $( "#create-new-pitch-get-corner #header" ).html( translate["Create new pitch"] + " '" + pitch_generator.active.name + "'" );
      //   $( "#create-new-pitch-get-corner #next_button" ).html( translate["Next"] );
      // }
      // else
      // {
      //   $( "#create-new-pitch-get-corner #header" ).html( translate["Create new job"] + " '" + pitch_generator.active.name + "'" );
      //   $( "#create-new-pitch-get-corner #next_button" ).html( translate["Collect"] );
      // }
      // $( "#create-new-pitch-get-corner #back_button" ).html( translate["Back"] );
      // $( "#create-new-pitch-get-corner #cancel_button" ).html( translate["Cancel"] );
    }
    if( id === "#create-new-rotate-pitch" )
    {
      if( AppType === APP_TYPE.TinyLineMarker )
        $( "#create-new-rotate-pitch #header" ).html( translate["Create new pitch"] + " '" + pitch_generator.active.name + "'" );

      else
        $( "#create-new-rotate-pitch #header" ).html( translate["Create new job"] + " '" + pitch_generator.active.name + "'" );

      $( "#create-new-rotate-pitch #next_button" ).html( translate["Next"] );
      $( "#create-new-rotate-pitch #cancel_button" ).html( translate["Cancel"] );
      $( "#create-new-rotate-pitch #rotate_button" ).html( translate["Change direction"] );
      $( "#create-new-rotate-pitch #back_button" ).html( translate["Back"] );


      $( "#create-new-rotate-pitch #info_label" ).html( translate["Choose one of four directions and press next"] );
    }

    if( id === "#paint-pitch-bar" )
    {
      if( run_pitch_controller.job_params[3] === "test" || run_pitch_controller.job_params[4] === "fulltest" )
      {
        $( "#paint-pitch-bar #header" ).html( translate["The robot %1s is testing %2s"].format( robot_controller.chosen_robot.name, pitch_generator.active.name ) );
      }
      else
      {
        $( "#paint-pitch-bar #header" ).html( translate["The robot %1s is painting %2s"].format( robot_controller.chosen_robot.name, pitch_generator.active.name ) );
      }

      $(".multiselect_job_list .reorder-handle").addClass("gone");
    }

    var old_id = bottom_bar_chooser.active_bar;
    bottom_bar_chooser.active_bar = id;
    
    $( ".bottombar" ).addClass( "gone" );
    $( id ).removeClass( "gone" );
    
    event_controller.call_callback( "page_loaded", bottom_bar_chooser.active_bar );
    if( old_id !== id )
    {
      bottom_bar_chooser.events.after_close.call_callback( old_id );
      bottom_bar_chooser.events.after_open.call_callback( id );
    }

    $("#modify_button").attr('disabled', $("#button_overlay button:not([disabled]):not(.gone)").length === 0);

    bottom_bar_chooser.history.push(bottom_bar_chooser.active_bar);
    if(bottom_bar_chooser.history.length > 10)
    {
      bottom_bar_chooser.history.shift()
    }
    if(id === "#drive-to-screen" || id === "#track-selected"){
      utilitiesScreenController.choose_utility_overlay.off();
    }
  },
  go_back: function()
  {

    if( popup_screen_controller.error_is_open )
    {
    }
    else if( popup_screen_controller.open_id )
    {

      switch( popup_screen_controller.open_id )
      {
        case "#login_popup":
        case "#stop_paint_pitch_popup":
        case "#robot_message_popup":
        case "#waiting_dialog":
          break;
        default :
          popup_screen_controller.close();
          break;
      }

    }
    else if( settings_screeen_controller.is_open )
    {
      settings_screeen_controller.breadcrumb.back( true );
    }
    else if( cleaning_screen_controller.is_open )
    {
      cleaning_screen_controller.close();
    }
    else
    {

      switch( bottom_bar_chooser.active_bar )
      {
        case "#drive-to-screen":
          bottom_bar_chooser.choose_bottom_bar( '#robot-selected' );
          break;
        case "#track-selected":
          pitch_generator.reset( );
          if( robot_controller.chosen_robot.online )
          {
            bottom_bar_chooser.choose_bottom_bar( "#robot-selected" );
          }
          else
          {
            //bottom_bar_chooser.choose_bottom_bar( "#robot-offline" );
            if( communication_controller.appServerConnection.connected )
              bottom_bar_chooser.choose_bottom_bar( "#robot-offline" );
            else
              bottom_bar_chooser.choose_bottom_bar( "#tablet-offline" );
          }
          break;
        case "#copy-track":
        case "#offset-track":
          copy_pitch_screen_controller.clean_parameters();
          break;
        case "#edit-pitch":
          edit_pitch_screen_controller.cancel();
          break;
        case "#create-new-pitch-get-corner":
          createJobMenuController.cancel();
          break;
        case "#create-new-rotate-pitch":
          createJobMenuController.cancel();
          break;

        case "#tablet-offline":
        case "#robot-offline":
        case "#robot-not-selected":
        case "#robot-selected":
          popup_screen_controller.confirm_popup( translate["Do you want to close the app"] + "?", "", translate["Yes"], translate["No"], function()
          {
            var e = document.getElementById( "loading_screen_info_lbl" );
            e.innerHTML = translate["Closing"];
            $( "#loading-screen" ).removeClass( "gone" );
            $( "#loading-screen" ).css( "opacity", 1 );
            $( "#loading-screen" ).css( "pointer-events", "" );

            lowPowerModeController.enterLowPowerMode();
            
          }, popup_screen_controller.close );

          break;

        case "#paint-pitch-bar":
          run_pitch_controller.stop();
          break;
      }
    }

  },
  button_overlay: {
    off: function()
    {
      if( !$( "#button_overlay" ).hasClass( "gone" ) )
      {
        $( "body" ).removeClass( 'fixed' );
        $( "#button_overlay" ).addClass( "animated" );
        $( "#button_overlay" ).removeClass( "fadeInRight" );
        $( "#button_overlay" ).addClass( "fadeOutRight" );
      }
      setTimeout( function()
      {
        joystickScreenController.unhide("bottom_bar_chooser");
        $( "#button_overlay" ).addClass( "gone" );
      }, 250 );
    },
    on: function()
    {
      setRecollectButton();
      
      if( $( "#button_overlay" ).hasClass( "gone" ) )
      {
        map_controller.background.remove_overlays( $( "#button_overlay" ) );
        joystickScreenController.hide("bottom_bar_chooser");

        $( "body" ).addClass( 'fixed' );
        $( "#button_overlay" ).removeClass( "gone" );
        $( "#button_overlay" ).addClass( "animated" );
        $( "#button_overlay" ).removeClass( "fadeOutRight" );
        $( "#button_overlay" ).addClass( "fadeInRight" );
        $( "#button_overlay button" ).on( "click", bottom_bar_chooser.button_overlay.off );
      }
      
      function setRecollectButton() {
        const handler = new RecollectUsingRobotHandler(pitch_generator.active);
        if (pitch_generator.active instanceof MultiJob) {
          $("#button_overlay #recollect_button").addClass("gone");
        }
        else {
          $("#button_overlay #recollect_button").removeClass("gone");
                    if (handler.canRecollect) {
            $("#button_overlay #recollect_button").prop("disabled", false);
          }
          else {
            $("#button_overlay #recollect_button").prop("disabled", true);
          }
        }
      }
    },
    toggle: function()
    {
      if( !$( "#button_overlay" ).hasClass( "gone" ) )
        bottom_bar_chooser.button_overlay.off();
      else
        bottom_bar_chooser.button_overlay.on();
    },
  },

  active_job_changed()
  {
    if(map_controller.background.jobs.is_active || map_controller.background.jobs.active instanceof MultiJob)
    {
      if(   bottom_bar_chooser.active_bar === "#copy-track"
         || bottom_bar_chooser.active_bar === "#offset-track"
         || bottom_bar_chooser.active_bar === "#edit-pitch"
         || bottom_bar_chooser.active_bar === "#choose_job_revision_screen")
      {
        if( !communication_controller.appServerConnection.connected && !pitch_generator.active.can_edit_when_offline )
        {
          popup_screen_controller.confirm_popup( "Offline", "You cannot modify pitches while offline", "ok", "", popup_screen_controller.close );
          bottom_bar_chooser.choose_bottom_bar( '#track-selected', true );
        }
        else
        {
          bottom_bar_chooser.reload_bottom_bar();
        }
      }
      else
      {
        bottom_bar_chooser.choose_bottom_bar( '#track-selected', true );
      }
    }
    else
    {
      bottom_bar_chooser.choose_bottom_bar();
    }
  }
};

event_controller.add_callback( "got_robot_position", function()
{
  if( robot_controller.chosen_robot.precision < top_bar_screen_controller.precision_god_tresh )
  {
    $( ".gray_when_bad_robot_position" ).removeClass( "bright" );
    $( ".gray_when_bad_robot_position" ).addClass( "dark" );
  }
  else
  {
    $( ".gray_when_bad_robot_position" ).addClass( "bright" );
    $( ".gray_when_bad_robot_position" ).removeClass( "dark" );
  }

  if( robot_controller.chosen_robot.precision < top_bar_screen_controller.pricision_bad2_tresh )
  {
    $( ".gray_when_no_robot_position" ).removeClass( "bright" );
    $( ".gray_when_no_robot_position" ).addClass( "dark" );
  }
  else
  {
    $( ".gray_when_no_robot_position" ).addClass( "bright" );
    $( ".gray_when_no_robot_position" ).removeClass( "dark" );
  }

} );


$( document ).ready( function()
{
  map_controller.background.eventController.add_callback( "active_job_changed", bottom_bar_chooser.active_job_changed );
  event_controller.add_callback( "connected_to_robot", bottom_bar_chooser.reload_bottom_bar );
  event_controller.add_callback( "chosen_robot_online_changed", bottom_bar_chooser.reload_bottom_bar );
  event_controller.add_callback( "user_login_success", bottom_bar_chooser.reload_bottom_bar );

  document.addEventListener( "backbutton", bottom_bar_chooser.go_back, false );
  document.addEventListener( "homebutton", settings_screeen_controller.close, false );
} );