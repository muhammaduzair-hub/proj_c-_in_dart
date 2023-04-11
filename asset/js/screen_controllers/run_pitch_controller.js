
function norm( p )
{
  if( p > 1 )
    p = 1;
  if( p < 0 )
    p = 0;
  return p;
}

const run_pitch_controller = {

  // Run modes
  modes: {
    RUN: 0,
    FULL_TEST: 1,
    NORMAL_BORDER: 2,
    FAST_BORDER: 3,
    NEAREST_START: 4,
  },

  pitch_que_paint_enable: false,
  starTime: 0,
  splitTime: 0,
  updater: null,
  running: false,
  jobLoading: false,

  fluent_run_minimum_turn_angle: 1.2,
  fluent_run_radius_changed: function()
  {
    run_pitch_controller.fluent_run_minimum_turn_angle = parseFloat( $( '#fluent_run_radius_input' ).val() );
  },
  start_timer: function()
  {
    run_pitch_controller.starTime = new Date();

    clearInterval( run_pitch_controller.updater );
    run_pitch_controller.updater = setInterval( function()
    {
      let elapsed = run_pitch_controller.splitTime + ((new Date()) - run_pitch_controller.starTime);
      run_pitch_controller.set_time( elapsed / 60000 );
    }, 100 );
  },
  pause_timer: function()
  {
    run_pitch_controller.splitTime += (new Date()) - run_pitch_controller.starTime;
    clearInterval( run_pitch_controller.updater );
  },
  reset_timer: function()
  {
    run_pitch_controller.splitTime = 0;
  },
  choose_test_overlay: {
    off: function()
    {
      if( !$( "#choose_test_method_overlay" ).hasClass( "gone" ) )
      {
        $( "body" ).removeClass( 'fixed' );
        $( "#choose_test_method_overlay" ).addClass( "animated" );
        $( "#choose_test_method_overlay" ).removeClass( "fadeInUp" );
        $( "#choose_test_method_overlay" ).addClass( "fadeOutDown" );
      }
      setTimeout( function()
      {
        joystickScreenController.unhide("run_pitch_controller");
        $( "#choose_test_method_overlay" ).addClass( "gone" );
      }, 250 );
    },
    on: function( button )
    {
      if( robot_controller.is_robot_version_more_or_equal( [ 5, 5, 0 ] ) )
      {
        if( pitch_generator.active.source === JobSource.USB || SETTINGS.only_full_test )
          run_pitch_controller.open( run_pitch_controller.modes.FULL_TEST );
        else if( $( "#choose_test_method_overlay" ).hasClass( "gone" ) )
        {
          map_controller.background.remove_overlays( $( "#choose_test_method_overlay" ) );
          joystickScreenController.hide("run_pitch_controller");


          $( "#choose_test_method_overlay #full_test" ).toggleClass( "gone", login_screen_controller.user_level > user_level.NORMAL );
          $( "#choose_test_method_overlay #border_test" ).toggleClass( "gone", login_screen_controller.user_level > user_level.DEVELOPER );    
          if(pitch_generator.active.test_tasks.length > 0){
            $( "#choose_test_method_overlay #fast_border" ).attr("disabled", false);
            $( "#choose_test_method_overlay #border_test" ).attr("disabled", false);
          }
          else{
            $( "#choose_test_method_overlay #fast_border" ).attr("disabled", true);
            $( "#choose_test_method_overlay #border_test" ).attr("disabled", true);
          }
          $( "body" ).addClass( 'fixed' );
          $( "#choose_test_method_overlay" ).removeClass( "gone" );

          if(!pitch_generator.get_variable("fast_test")){
            $( "#choose_test_method_overlay #fast_border" ).removeClass("dark").addClass("bright").unbind("click").click(()=>
            {  run_pitch_controller.test_options_message()});
          }
          else
          {
            let test = pitch_generator.get_variable("fast_test");
            $( "#choose_test_method_overlay #fast_border" ).addClass("dark").removeClass("bright").unbind("click").click(()=>
            {run_pitch_controller.open( run_pitch_controller.modes.FAST_BORDER )});
          }

          if(!pitch_generator.get_variable("normal_test")){
            $( "#choose_test_method_overlay #border_test" ).removeClass("dark").addClass("bright").unbind("click").click(()=>
            {  run_pitch_controller.test_options_message()});
          }
          else
          {
            $( "#choose_test_method_overlay #border_test" ).addClass("dark").removeClass("bright").unbind("click").click(()=>
            {run_pitch_controller.open( run_pitch_controller.modes.NORMAL_BORDER )});
          }

          if(!pitch_generator.get_variable("full_test")){
            $( "#choose_test_method_overlay #full_test" ).removeClass("dark").addClass("bright").unbind("click").click(()=>
            { run_pitch_controller.test_options_message()});
          }
          else
          {
            $( "#choose_test_method_overlay #full_test" ).addClass("dark").removeClass("bright").unbind("click").click(()=>
            {run_pitch_controller.open( run_pitch_controller.modes.FULL_TEST )});
          }

          if( button )
          {
            var r = button.getBoundingClientRect();
            $( "#choose_test_method_overlay" ).css( "left", r.left + (r.width / 2) - ($( "#choose_test_method_overlay" ).outerWidth() / 2) );
          }

          $( "#choose_test_method_overlay" ).addClass( "animated" );
          $( "#choose_test_method_overlay" ).removeClass( "fadeOutDown" );
          $( "#choose_test_method_overlay" ).addClass( "fadeInUp" );
          $( "#choose_test_method_overlay button" ).on( "click", run_pitch_controller.choose_test_overlay.off );
        }
      }
      else
        run_pitch_controller.open( run_pitch_controller.modes.FAST_BORDER );
    },
    toggle: function( button )
    {
      if( !$( "#choose_test_method_overlay" ).hasClass( "gone" ) )
        run_pitch_controller.choose_test_overlay.off();
      else{
        run_pitch_controller.choose_test_overlay.on( button );
      }
        
    }
  },
  open_choose_test_popup: function( button )
  {

    if( pitch_generator.active.source === JobSource.USB || SETTINGS.only_full_test )
      run_pitch_controller.open( run_pitch_controller.modes.FULL_TEST );
    else
    {
      $( "#choose_test_method_popup #full_test" ).toggleClass( "gone", login_screen_controller.user_level > user_level.NORMAL );
      $( "#choose_test_method_popup #border_test" ).toggleClass( "gone", login_screen_controller.user_level > user_level.DEALER );
      $( "#choose_test_method_popup" ).removeClass( "gone" );

      var r = button.getBoundingClientRect();
      $( "#choose_test_method_popup > div" ).css( "bottom", $( "#track-selected" ).height() );
      $( "#choose_test_method_popup > div" ).css( "left", r.left + r.width / 2 - ($( "#choose_test_method_popup > div" ).width() / 2) );
      $( "#choose_test_method_popup > div" ).css( "z-index", 3 );
    }

  },
  close_choose_test_popup: function()
  {
    $( "#choose_test_method_popup" ).addClass( "gone" );
  },
  open: function( running_mode )
  {
    communication_controller.send_key_val( "job_start", pitch_generator.active.id );
    communication_controller.send_key_val( "job_start_type", pitch_generator.active.template_id ); // geometry_line
    communication_controller.send_key_val( "job_start_name", pitch_generator.active.template_id === "dxf_parser" ? pitch_generator.active.template_type : pitch_generator.active.name ); // linetest


    console.log( "opening run view" );

    if( !robot_controller.chosen_robot.online )
    {
      popup_screen_controller.open( "start_paint_pitch_error_popup" );
      return;
    }
    
    robot_controller.chosen_robot.projectionLock.lock("run_pitch_controller");
    run_pitch_controller.choose_test_overlay.off();
    run_pitch_controller.set_progress( 0 );
    map_controller.background.set_enable_show_start_location( false );

    run_pitch_controller.reset_timer();
    run_pitch_controller.update_robot_options();

    if( run_pitch_controller.saved_progress )
    {
      delete run_pitch_controller.saved_progress;
    }

    robot_controller.user_info_event.add_callback( "Job loaded", run_pitch_controller.after_job_loaded );
    run_pitch_controller.set_progress( 0 );  
    run_pitch_controller.set_time( 0 );

    popup_screen_controller.confirm_popup( translate["Waiting for new robot position"], "", "Start anyway", translate["Cancel"], function()
    {
      event_controller.call_callback( "got_robot_position", robot_controller.chosen_robot );
      console.warn( "Starting job without robot position!" );
    }, run_pitch_controller.cancel_start );

    robot_controller.fetch_chosen_robot_position();

    const robot_distance_callback = function()
    {
      if(!robot_controller.has_chosen_robot_position)
      {
        return;
      }
      event_controller.remove_callback( "got_robot_position", robot_distance_callback );

      robot_controller.chosen_robot.projectionLock.lock("run_pitch_controller");
      let robot_projection_okay = true;

      const robot_proj = new Proj4Projection( robot_controller.chosen_robot.projection );
      const job_proj = new Proj4Projection( pitch_generator.active.projection );

      if( robot_proj.alias !== job_proj.alias && robot_proj.string !== job_proj.string )
      {
        if( robot_controller.is_chosen_none )
        {
          robot_projection_okay = true;
        }
        else if( totalstation_controller.totalstation_in_use )
        {
          robot_projection_okay = robot_proj.getValue("+tmr_ts") === job_proj.getValue("+tmr_ts");
        }
        else
        {
          robot_projection_okay = false;
        }
      }

      const robotPosition = robot_controller.chosen_robot_position;
      if(!pitch_generator.active.start_from.isSet)
      {
        pitch_generator.active.choose_start_location_closest_to(robotPosition);
      }
      let distance = Infinity;
      try
      {
        distance = robotPosition.subtract( pitch_generator.active.start_from.point ).length;
      }
      catch(e)
      {
        console.warn(e);
      }

      function changeProjection()
      {
        function config_updated()
        {
          message_controller.events.remove_callback( "updated_user_config", config_updated );
          message_controller.events.add_callback('reconf_topic_/user@projection', robot_projection_callback);
          communication_controller.get_reconfigure_topic("/user", "projection");
        }
        message_controller.events.add_callback( "updated_user_config", config_updated );

        // change projection
        
        robot_controller.chosen_robot.projectionLock.unlock("run_pitch_controller");
        position_settings_screen.change_projection( job_proj.alias );
        //robot_controller.update_user_param( 'projection', pitch_generator.active.use_proj_alias, "all" );

        // show a waiting
        // popup_screen_controller.open_info_waiter( "Setting projection" );
      }


      if( SETTINGS.auto_set_default_values && !robot_projection_okay && !totalstation_controller.totalstation_in_use )
      {
        changeProjection();
        return;
      }


      if( SETTINGS.show_missing_position_dialog && (!robot_controller.chosen_robot.precision || robot_controller.chosen_robot.precision > top_bar_screen_controller.pricision_bad2_tresh) )
      {
        // Missing position fix warning
        console.warn( "Missing robot position position" );
        popup_screen_controller.confirm_popup(
          translate["Warning"],
          AppType === APP_TYPE.TinyLineMarker ? translate["MissingPositionPitchWarning"] : translate["MissingPositionJobWarning"],
          translate["OK"],
          translate["Cancel"],
          function()
          {
            console.log( "Missing robot position position: Start job anyway" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.start( running_mode );
          },
          function()
          {
            console.log( "Missing robot position position: Cancelled job start" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.cancel_start();
          }
        );
      }
      else if( distance > SETTINGS.distance_before_warning && robot_projection_okay )
      {
        console.warn( "Job distance is more than " + SETTINGS.distance_before_warning + " m away " );
        popup_screen_controller.confirm_popup(
          translate["Warning"],
          (AppType === APP_TYPE.TinyLineMarker ? translate["FarPitchWarningText"] : translate["FarJobWarningText"]).format( parseInt( distance.meter2unit() ), translate_unit() ),
          translate["OK"],
          translate["Cancel"],
          function()
          {
            console.log( "Job distance is more than " + SETTINGS.distance_before_warning + " m away: Start job anyway" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.start( running_mode );
          },
          function()
          {
            console.log( "Job distance is more than " + SETTINGS.distance_before_warning + " m away: Cancelled job start" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.cancel_start();
          }
        );
      }
      else if( distance > SETTINGS.distance_before_warning && !robot_projection_okay )
      {
        console.warn( "Job distance is more than " + SETTINGS.distance_before_warning + " m away and projection does not match" );

        var job_projection = job_proj.alias;
        var robot_projection = robot_proj.alias;

        if( totalstation_controller.totalstation_in_use )
        {
          const job_loc = totalstation_location_controller.get_location_from_uuid(job_proj.getValue("+tmr_ts"));
          if(job_loc)
            job_projection = `"${job_loc.name}"`;

          const robot_loc = totalstation_location_controller.get_location_from_uuid(robot_proj.getValue("+tmr_ts"));
          if(robot_loc)
            robot_projection = `"${robot_loc.name}"`;
        }

        var robot_site_text = "";
        var job_site_text = "";

        pop_generator.create_popup(
          translate["Warning"],
          (AppType === APP_TYPE.TinyLineMarker ? translate["FarPitchWrongProjectionWarningText"] : translate["FarJobWrongProjectionWarningText"]).format( (job_projection ? job_projection : translate["N/A"]), job_site_text, robot_projection, robot_site_text, parseInt( distance.meter2unit() ), translate_unit() ),
        [
          new PopButton( translate["RunAnywayButton"], function()
          {
            console.log( "Job distance is more than " + SETTINGS.distance_before_warning + " m away: Start job anyway, projection mismatch" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.start( running_mode );
          } ),
          new PopButton( translate["ChangeProjectionButton"], changeProjection ),
          new PopButton( translate["Cancel"], function()
          {
            console.log( "Job distance is more than " + SETTINGS.distance_before_warning + " m away: Cancelled job start, projection mismatch" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.cancel_start();
          } )
        ],
          pop_generator.close );

      }
      else if( distance <= SETTINGS.distance_before_warning && !robot_projection_okay )
      {
        console.warn( "Job distance is less than " + SETTINGS.distance_before_warning + " m away but projection does not match" );

        var job_projection = job_proj.alias;
        var robot_projection = robot_proj.alias;

        if( totalstation_controller.totalstation_in_use )
        {
          const job_loc = totalstation_location_controller.get_all().find(loc=>loc.uuid===job_proj.getValue("+tmr_ts"));
          if(job_loc)
            job_projection = `"${job_loc.name}"`;

          const robot_loc = totalstation_location_controller.get_all().find(loc=>loc.uuid===robot_proj.getValue("+tmr_ts"));
          if(robot_loc)
            robot_projection = `"${robot_loc.name}"`;
        }

        var robot_site_text = "";
        var job_site_text = "";

        pop_generator.create_popup(
          translate["Warning"],
          (AppType === APP_TYPE.TinyLineMarker ? translate["WrongPitchProjectionText"] : translate["WrongJobProjectionText"]).format( (job_projection ? job_projection : translate["N/A"]), job_site_text, robot_projection, robot_site_text ),
        [
          new PopButton( translate["RunAnywayButton"], function()
          {
            console.log( "Job distance is less than " + SETTINGS.distance_before_warning + " m away: Start job anyway, projection mismatch" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.start( running_mode );
          } ),
          new PopButton( translate["ChangeProjectionButton"], changeProjection ),
          new PopButton( translate["Cancel"], function()
          {
            console.log( "Job distance is less than " + SETTINGS.distance_before_warning + " m away: Cancelled job start, projection mismatch" );
            event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
            run_pitch_controller.cancel_start();
          } )
        ],
          pop_generator.close );
      }
      else
      {
        event_controller.remove_callback( "got_robot_distance", robot_distance_callback );
        run_pitch_controller.start( running_mode );
      }
    };
    const robot_projection_callback = function()
    {
      console.log( "removing robot projection callback" );
      message_controller.events.remove_callback('reconf_topic_/user@projection', robot_projection_callback);
      console.log( "adding robot distance callback" );
      event_controller.add_callback( "got_robot_position", robot_distance_callback );
    };
    console.log( "adding robot projection callback" );
    message_controller.events.add_callback('reconf_topic_/user@projection', robot_projection_callback);
    communication_controller.get_reconfigure_topic("/user", "projection");

  },
  get_closest_corner: function( jobs, corners )
  {
    var robot_pos = robot_controller.chosen_robot_position.toArray();
    var smallest_dist = Infinity;
    var job_i = -1;

    var closest_corner = 0;
    corners.forEach( function( corner, i )
    {
      var dist = vec_len( vec_sub( robot_pos, corner ) );
      if( dist < smallest_dist )
      {
        smallest_dist = dist;
        closest_corner = i;
      }
    } );

    smallest_dist = Infinity;
    jobs.forEach( function( job, i )
    {
      var dist = vec_len( vec_sub( corners[closest_corner], job.ends[0] ) );
      if( dist < smallest_dist )
      {
        smallest_dist = dist;
        job_i = i;
      }
    } );

    return [ job_i + 1, 0 ];
  },
  get_closest_line: function( jobs )
  {
    var robot_pos = robot_controller.chosen_robot_position.toArray();
    var smallest_dist = Infinity;
    var job_i = -1;

    jobs.forEach( function( job, i )
    {
      var dist = Infinity;

      if( job.type === "line" )
      {
        var end2 = closest_point_on_line( robot_pos, job.ends );
        var g = vec_sub( job.ends[1], job.ends[0] );
        var l = vec_len( g );
        var done_l = vec_len( vec_sub( job.ends[0], end2 ) );
        var rest_l = vec_len( vec_sub( job.ends[1], end2 ) );
        var p_done = done_l / l;
        var p_rest = rest_l / l;
        var p = 1 - p_rest;
        if( p_done > p_rest )
          p = p_done;
        p = norm( p );

        var end2 = vec_add( vec_mul( vec_div( g, l ), l * p ), job.ends[0] );
        dist = vec_len( vec_sub( robot_pos, end2 ) );
        if( p === 1 )
        {
          dist = Infinity;
        }

      }
      else if( job.type === "arc3" )
      {
        var start_vec = vec_sub( job.ends[0], job.center );
        var r = vec_len( start_vec );
        var robot_vec = vec_sub( robot_pos, job.center );
        dist = Math.abs( vec_len( robot_vec ) - r );

        if( job.ends.length === 3 )
        {

          var p = run_pitch_controller.get_current_progress_on_task( jobs, i );
          if( p > 0.99 )
          {
            var dist_start = vec_len( vec_sub( robot_pos, job.ends[0] ) );
            var dist_end = vec_len( vec_sub( robot_pos, job.ends[2] ) );

            if( dist_start > dist_end )
            {
              dist = Infinity;
            }
            else
            {
              dist = dist_start;
            }
          }

        }
      }
      else if( job.type === "spray" )
      {
        dist = vec_len( vec_sub( robot_pos, job.ends[0] ) );
      }

      if( dist < (smallest_dist - 0.001) )
      {
        smallest_dist = dist;
        job_i = i;
      }
    } );
    console.log( "closest job is ", job_i );

    var task_id = job_i + 1;
    var task_procent = run_pitch_controller.get_current_progress_on_task( jobs, job_i );

    return [ task_id, task_procent ];
  },
  _configStart()
  {
    robot_controller.chosen_robot.projectionLock.lock("run_pitch_controller");
    run_pitch_controller.running = true;
  },
  _configEnd()
  {
    robot_controller.chosen_robot.projectionLock.unlock("run_pitch_controller");
    run_pitch_controller.running = false;
  },
  resume_run: function( from_robot )
  {
    run_pitch_controller._configStart();
    if( run_pitch_controller.fluent_updater )
      clearInterval( run_pitch_controller.fluent_updater );
    if( SETTINGS.predict_robot_position )
      run_pitch_controller.fluent_updater = setInterval( run_pitch_controller.predict_next, 25 );

    run_pitch_controller.start_timer();
    popup_screen_controller.close();
    bottom_bar_chooser.choose_bottom_bar( "#paint-pitch-bar" );
    if( from_robot === 1)
    {
      var near_callback = function( success )
      {
        if( success )
          robot_controller.auto_mode();
        event_controller.remove_callback( "goto_near_done", near_callback );
      };
      event_controller.add_callback( "goto_near_done", near_callback );
      robot_controller.set_near_pos();
    }
    else if( from_robot === 2){
      let task_arr = run_pitch_controller.split_jobs_on_current_progress( pitch_generator.active.tasks, parseInt( robot_controller.task_info["Original task idx"] ), parseFloat( robot_controller.task_info["Original task pct"] ) );
      task_arr.tasks_left.shift(task_arr.tasks_left[0]);
      const idx = pitch_generator.active.tasks.findIndex(task => task.id === task_arr.tasks_left[0].id);
      robot_controller.increment_task_pos(idx);
      robot_controller.auto_mode();
    }
    else
    {
      robot_controller.auto_mode();
    }
  },
  stop: function( goto_manual_mode = true)
  {
    clearInterval( run_pitch_controller.fluent_updater );

    $( "#resume_later_bar #header" ).html( pitch_generator.active.name );
    $( "#stop_paint_pitch_popup #header" ).html( translate["Marking stopped"] );
    $( "#stop_paint_pitch_popup #info_label1" ).html( translate["You have stopped marking of"] + " " + pitch_generator.active.name );
    $( "#stop_paint_pitch_popup #cancel_button" ).html( translate["Cancel marking"] );
    $( "#resume_later_bar #info_label" ).html( translate["Marking was stopped"] );
    $( "#resume_paint_pitch_popup #header" ).html( translate["Continue marking"] );
    $( "#resume_paint_pitch_popup #resume_button2" ).html( translate["Resume from robot position"] );
    $( "#resume_paint_pitch_popup #resume_button3" ).html( translate["Skip to next line"] );
    let task_arr = run_pitch_controller.split_jobs_on_current_progress( pitch_generator.active.tasks, parseInt( robot_controller.task_info["Original task idx"] ), parseFloat( robot_controller.task_info["Original task pct"] ) );
    if(pitch_generator.active.tasks.length <= 2 || task_arr.tasks_left.length <= 1){
      if(!$("#resume_button3").hasClass('gone')){
        $("#resume_button3").addClass('gone');
      }
    }
    else{
      if($("#resume_button3").hasClass('gone')){
        $("#resume_button3").removeClass('gone');
      }
    }

    joystick_controller.count_down = 20;
    if( goto_manual_mode )
    {
      robot_controller.manual_mode();
      run_pitch_controller.pause_timer();
      if( !SETTINGS.keep_progress_on_job_cancel )
      {
        pitch_generator.active.start_from.reset();
      }
    }
    else
    {
      // run_pitch_controller.pause_timer();
      run_pitch_controller.remove_map_progress();

    }
    //run_pitch_controller.stop_infinity_run();

    // spørg om genoptag.
    var job_id = parseInt( run_pitch_controller.job_params[0] );
    if((job_id || job_id === 0) && !popup_screen_controller.is_popup_open("#stop_paint_pitch_popup", false)) 
    {
      popup_screen_controller.open( "#stop_paint_pitch_popup", true );
      $( ".active-circle" ).addClass( "overpopup" );
      if( run_pitch_controller.job_params[3] === "test" )
      {
        $( "#stop_paint_pitch_popup #header" ).html( translate["Testing stopped"] );
        $( "#stop_paint_pitch_popup #info_label1" ).html( translate["You have stopped testing of"] + " " + pitch_generator.active.name );
        $( "#stop_paint_pitch_popup #cancel_button" ).html( translate["Cancel test"] );
        $( "#resume_later_bar #info_label" ).html( translate["Test was stopped"] );
        $( "#resume_paint_pitch_popup #header" ).html( translate["Continue testing"] );
        if( run_pitch_controller.job_params[4] === "border" )
          $( "#resume_paint_pitch_popup #resume_button2" ).html( translate["Resume from closest corner"] );
        else
          $( "#resume_paint_pitch_popup #resume_button2" ).html( translate["Resume from robot position"] );
      }
    }
    else if(popup_screen_controller.is_popup_open("", false) && !$( ".active-circle" ).hasClass( "overpopup" ))
    {
      $( ".active-circle" ).addClass( "overpopup" );
    }
  },
  cleanup: function()
  {
    run_pitch_controller._configEnd();
    bottom_bar_chooser.choose_bottom_bar( "#track-selected" );
    map_controller.background.set_enable_show_start_location( true );
    run_pitch_controller.remove_next_task_circle();
    run_pitch_controller.remove_map_progress();
    pitch_generator.reselect();
  },
  after_done: function()
  {
    run_pitch_controller._configEnd();
    clearInterval( run_pitch_controller.fluent_updater );
    delete run_pitch_controller.saved_progress;
    run_pitch_controller.pause_timer();
    robot_controller.manual_mode();
    $( '#paint-pitch-bar #dist_to_point' ).addClass( "gone" );
    run_pitch_controller.cleanup();
  },
  resume_later: function()
  {
    run_pitch_controller.saved_progress = {
      pitch: pitch_generator.active.id,
      task: robot_controller.task_info["Original task idx"],
      procent: robot_controller.task_info["Original task pct"]
    };
    run_pitch_controller.update_progress(true);
    popup_screen_controller.close();
    if (robot_controller.robot_has_capability('platform_pump')) {
      sprayToolUtilitiesScreenController.disableSprayButtonWithWarning();
    }
    bottom_bar_chooser.choose_bottom_bar( "#resume_later_bar" );
  },
  cancel_marking: function()
  {
    run_pitch_controller._configEnd();
    delete run_pitch_controller.saved_progress;
    popup_screen_controller.close();
    robot_controller.user_info_event.remove_callback( "Job done", run_pitch_controller.marking_done );
    run_pitch_controller.stop_infinity_run();
    run_pitch_controller.cleanup();
  },

  send_jobs: [ ],
  expected_time: 0,
  
  /**
   * 
   * @param {Job} job 
   * @param {Vector} target_position 
   * @param {boolean} full_test 
   * @returns {Job}
   */
  prepare_job_run: function( job, target_position, full_test = false )
  {
    job.draw();

    let orig_job = job.copy();

    if( !orig_job.options.created_with_dubins.val && orig_job.options["taskModificationIds"].ignoreids.length )
    {
      let dubins_job = orig_job.copy();
      dubins_job.options.created_with_dubins.val = true;
      dubins_job.draw();
      let job2_ignoreids = align_ignore_lines( orig_job, dubins_job );
      dubins_job.options.taskModificationIds.ignoreids = job2_ignoreids;
      orig_job = dubins_job;
    }

    if(!(orig_job instanceof MultiJob))
    {
      if(orig_job.start_from.isSet)
      {
        orig_job.tasks = orig_job.get_rearranged_tasks_around_id(orig_job.start_from.id, 0, orig_job.options.ignore_preceding_tasks_on_near.val);
        // orig_job.start_from.index = 0; // We have just rearranged the tasks around "start from" task, so the indices are rearranged as well
      }
      else
      {
        orig_job.tasks = orig_job.get_rearranged_tasks( target_position, 0, orig_job.options.ignore_preceding_tasks_on_near.val );
      }
    }

    if( orig_job.options["Ignore lines"].val )
    {
      orig_job.tasks = orig_job.tasks.filter( function( task )
      {
        if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.IGNORE )
          return false;
        else
          return true;
      } );
    }
    else
    {
      if( !general_settings_screen.settings.enable_fluent_run.val )
      {
        orig_job.tasks = orig_job.tasks.map( function( task )
        {
          if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.IGNORE )
            return task.convert_to_waypoints();
          else
            return task;
        } );
        orig_job.tasks = orig_job.tasks.flat();
      }
      else
      {
        orig_job.tasks = orig_job.tasks.map( function( task )
        {
          if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.IGNORE )
            task.paint = false;

          return task;
        } );

      }
    }
    orig_job.tasks = orig_job.tasks.map( function( task )
    {
      if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.INTERFERENCE_FILTER )
      {
        task.task_options.push( new IntRobotAction( "position_filtering_interference", general_settings_screen.settings.interference_filter_type.val ) );
      }
      else if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.ANTINAPPING )
      {
        task.action_options.push( new IntRobotAction( "napping_version", general_settings_screen.settings.napping_version.val ) );
      }
      else if( orig_job.options["taskModificationIds"].val[task.id] === Task.modificationType.VIA )
      {
        task.paint = false;
        if(robot_controller.robot_has_capability("job_task_viahard")) {
          task.via = true;
        }
      }
      return task;
    });

    if( full_test )
    {
      orig_job.tasks = orig_job.tasks.map( task => {task.paint = false; return task;} );
    }

    if( orig_job.source !== JobSource.USB )
      orig_job.tasks = reduce_jobs( orig_job.tasks, ["way"] );

    // Remove "zero length tasks"
    orig_job.tasks = orig_job.tasks.filter( ( t, idx ) => {
      if( t.type === "way" )
        return true;
      if( t.length > SETTINGS.minimum_task_length )
        return true;
      else if( idx <= orig_job.start_from.index )
        orig_job.start_from.index--;
    } );

    let job_name = "";
    if( orig_job.source !== JobSource.USB )
      job_name = `${orig_job.id}_${orig_job.tasks[0].id}_0.0_linemarker`;
    else
      job_name = `${orig_job.id}_${orig_job.name}_${orig_job.template_type}`;

    // robot_controller.task_info["Job name"] = job_name;

    var job_options = orig_job.job_options.copy( );

    if( !orig_job.has_option( "ramp_up_max_dist" ) && SETTINGS.allow_override_ramp_up )
      job_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( '#robot_settings_menu #force_new_ramp_up_length' ).val() ) ) );
    if( !orig_job.has_option( "ramp_down_max_dist" ) && SETTINGS.allow_override_ramp_up )
      job_options.push( new FloatRobotAction( "ramp_down_max_dist", parseFloat( $( '#force_new_ramp_down_length' ).val() ) ) );

    if( !orig_job.has_option( "dashed_length" ) )
      job_options.push( new FloatRobotAction( "dashed_length", robot_controller.config.spray_line_length ) );
    if( !orig_job.has_option( "dashed_space" ) )
      job_options.push( new FloatRobotAction( "dashed_space", robot_controller.config.spray_space_length ) );

    if( $( '#navigate_tool_checkbox' ).prop('checked') )
    {
      job_options.push( new BoolRobotAction( "navigate_tool", true ) );
      job_options.push( new BoolRobotAction( "pathshift_tool", false ) );
    }

    developer_screen.apply_extra_job_options(job_options);

    if( full_test )
      job_name += "_fulltest";

    var job_tasks = orig_job.tasks.copy();
    var job_copy = orig_job.copy();
    job_copy.tasks = job_tasks;
    fit_tasks_length( {
      tasks: job_tasks,
      options: orig_job.options
    } );
    fit_tasks_dashed_length( {
      tasks: job_tasks,
      options: orig_job.options
    } );
    job_copy.tasks = job_tasks;

    if( general_settings_screen.settings.enable_fluent_run.val )
      job_copy.fluentRunEnable({start_at_robot: true,draw_job:false})
    orig_job.tasks = job_copy.tasks;

    orig_job.task_options = job_options;
    orig_job.hmi_name = job_name;
    return orig_job;
  },
  
  /**
   * 
   * @param {Job} job 
   * @param {Vector} target_position 
   * @param {boolean} full_test 
   * @returns {Job}
   */
  prepare_job_test: function( job, target_position, fast_test = false )
  {
    let orig_job = job.copy();

    orig_job.draw();
    var tasks = orig_job.get_rearranged_test_tasks( target_position );

    var options = [ ];
    if( !fast_test )
    {
      var last_task = tasks[0];
      var new_tasks = [ ];
      for( var i = 0; i < tasks.length; i++ )
      {
        if(tasks[i] instanceof ArcTask) {
          var arc_task = new ArcTask(tasks[i].id, [tasks[i].ends[0], tasks[i].ends[1], tasks[i].ends[2]], tasks[i].center, false, false  )
          new_tasks.push( arc_task );
          last_task = tasks[i];
        }
        else if(tasks[i] instanceof LineTask ){
          var line_task = new LineTask( tasks[i].id, [ tasks[i].ends[0], tasks[i].ends[1] ], false, false );
          new_tasks.push( line_task );
          last_task = tasks[i];
        }
        else if(tasks[i] instanceof EllipseTask){
          var elipse_task = new EllipseTask( tasks[i].id, [tasks[i].ends[0], tasks[i].ends[1]], [tasks[i].start_angle, tasks[i].end_angle], tasks[i].center, true, false, false);
          new_tasks.push( elipse_task );
          last_task = tasks[i];
        }
          else if(tasks[i] instanceof SplineTask)
          {
            let spline_task = tasks[i].copy();
            spline_task.paint = false;
            new_tasks.push(spline_task);
            last_task = tasks[i];
          }
        else{
           // id, ends, reverse, paint
          var line_task = new LineTask( last_task.id, [ last_task.ends[0], tasks[i].ends[0] ], false, false );
          new_tasks.push( line_task );
          last_task = tasks[i];
        }
       
      }
      tasks = new_tasks;
    }
    
    orig_job.test_tasks = tasks;

    var job_name = "" + orig_job.id + "_" + tasks[0].id + "_0.0_test";
    if( fast_test )
      job_name += "_border";
    else
      job_name += "_borderline";

    orig_job.test_task_options = options;
    orig_job.hmi_name = job_name;
    return orig_job;
  },

  start: function(  running_mode, skip_sending = false, use_task_pos_as_start_ref = false )
  {
    run_pitch_controller.jobLoading = true;
    run_pitch_controller._configStart();

    const only_test = running_mode === run_pitch_controller.modes.FAST_BORDER || running_mode === run_pitch_controller.modes.NORMAL_BORDER;
    const fast_test = running_mode === run_pitch_controller.modes.FAST_BORDER;
    const full_test = running_mode === run_pitch_controller.modes.FULL_TEST;

    if( general_settings_screen.settings.follow_robot.val )
      map_controller.background.zoom_to_robot();
    else
    {
      if( AppType === APP_TYPE.TinySurveyor )
        map_controller.background.zoom_to_robot_point_extent( map_controller.background.robot_to_map( pitch_generator.active.start_from.point.toArray() ) );
      else
        map_controller.background.zoom_to_pitch( pitch_generator.active );
    }

    $( '#paint-pitch-bar #dist_to_point' ).addClass( "gone" );

    console.log( "only_test: " + !!only_test );

    run_pitch_controller.set_progress( 0 );
    robot_controller.task_info["Original task idx"] = pitch_generator.active.start_from.index;
    robot_controller.task_info["Original task pct"] = pitch_generator.active.start_from.percent;
    run_pitch_controller.reset_timer();
    run_pitch_controller.start_timer();

    const target_position = use_task_pos_as_start_ref ? use_task_pos_as_start_ref : robot_controller.chosen_robot_position;
    if( !only_test )
    {

      pitch_generator.active = run_pitch_controller.prepare_job_run( pitch_generator.active, target_position, full_test );

      robot_controller.task_info["Job name"] = pitch_generator.active.hmi_name;
      if( !skip_sending )
      {
        pitch_generator.active.hmi_name += "_" + run_pitch_controller.starTime.getTime();
        robot_controller.send_job( pitch_generator.active.hmi_name, pitch_generator.active.tasks, pitch_generator.active.task_options, pitch_generator.active.start_from );
      }
      run_pitch_controller.full_track_length = 0;
      run_pitch_controller.update_progress();

    }
    else
    {

      pitch_generator.active = run_pitch_controller.prepare_job_test( pitch_generator.active, target_position, fast_test );

      robot_controller.task_info["Job name"] = pitch_generator.active.hmi_name;
      if( !skip_sending )
      {
        pitch_generator.active.hmi_name += "_" + run_pitch_controller.starTime.getTime();
        robot_controller.send_job( pitch_generator.active.hmi_name, pitch_generator.active.test_tasks, pitch_generator.active.test_task_options );
      }

      run_pitch_controller.full_track_length = 0;
      run_pitch_controller.update_progress();
    }

    message_controller.events.add_callback( "job_part_recieved", run_pitch_controller.update_send_progress );

    if( run_pitch_controller.fluent_updater )
      clearInterval( run_pitch_controller.fluent_updater );
    if( SETTINGS.predict_robot_position )
      run_pitch_controller.fluent_updater = setInterval( run_pitch_controller.predict_next, 25 );


    if( !skip_sending )
    {
      run_pitch_controller.update_send_progress();
      popup_screen_controller.confirm_popup_with_options({
        header: AppType === APP_TYPE.TinyLineMarker ? translate["Sending pitch to robot"] : translate["Sending job to robot"],
        cancel_text: translate["Cancel"],
        cancel_callback: run_pitch_controller.cancel_start
      })
    }
    else
    {
      run_pitch_controller.after_job_loaded();
    }
  },
  update_send_progress()
  {
    if( robot_controller.cancel_send )
    {
      
    }
    else
    {
      var procent = Math.round( robot_controller.parts_send * 100 / robot_controller.parts_to_send );
      // header, body, ok_text, cancel_text, ok_callback, cancel_callback
      var text = "";
      if( AppType === APP_TYPE.TinyLineMarker )
        text = translate["Sending pitch to robot"];
      else
        text = translate["Sending job to robot"];

      if( robot_controller.robot_has_capability( "load_job_topic" ) )
        text += " " + procent + "%";

      pop_generator.last_created_header_element.innerHTML = text;
      //popup_screen_controller.confirm_popup( text, "", "", translate["Cancel"], undefined, run_pitch_controller.cancel_start );
    }
  },
  after_job_loaded: function()
  {
    run_pitch_controller.jobLoading = false;
    if( !(robot_controller.task_info["Job name"] === "Empty") )
    {
      robot_controller.auto_mode( );
      robot_controller.user_info_event.add_callback( "Job done", run_pitch_controller.marking_done );
    }

    popup_screen_controller.close();
    robot_controller.user_info_event.remove_callback( "Job loaded", run_pitch_controller.after_job_loaded );
    message_controller.events.remove_callback( "job_part_recieved", run_pitch_controller.update_send_progress );
    event_controller.remove_callback( "robot_now_offline", robot_controller.resend_if_robot_went_offline );
    bottom_bar_chooser.choose_bottom_bar( "#paint-pitch-bar" );
  },
  cancel_start: function()
  {
    run_pitch_controller.running = false;
    robot_controller.user_info_event.remove_callback( "Job loaded", run_pitch_controller.after_job_loaded );
    event_controller.remove_callback( "robot_now_offline", robot_controller.resend_if_robot_went_offline );
    message_controller.events.remove_callback( "job_part_recieved", run_pitch_controller.update_send_progress );
    console.log( "Cancel start" );
    popup_screen_controller.close();
    communication_controller.clearSendBuffer( "send_job" );
    robot_controller.cancel_send = true;
    run_pitch_controller._configEnd();
    run_pitch_controller.cleanup();
  },
  cancelWithError(message) {
    if (robot_controller.resend_interval && !robot_controller.chosen_robot.online) {
      console.warn("Job load was canceled because connection to robot was lost");
      
      const options = {header: translate["HeaderJobCanceled"],
                      body: translate[message],
                      ok_text: translate["OK"],
                      ok_callback: popup_screen_controller.close
    };
      popup_screen_controller.confirm_popup_with_options(options);
    }
  },
  make_tool_test: function()
  {
    var robot_pos = robot_controller.chosen_robot_position.toArray();
    var angle = robot_controller.chosen_robot.t;
    var g = vec_rot( [ 1, 0 ], angle );

    var jobs = [ ];
    jobs.push( {
      "type": "line",
      "ends": [ vec_add( robot_pos, vec_mul( g, 1.5 ) ), vec_add( robot_pos, vec_mul( g, 2.5 ) ) ]
    } );
    jobs.push( {
      "type": "line",
      "ends": [ vec_add( robot_pos, vec_mul( g, 4.5 ) ), vec_add( robot_pos, vec_mul( g, 3.5 ) ) ]
    } );
    jobs.push( {
      "type": "way",
      "ends": [ robot_pos ]
    } );
    var job_name = "000_0_0.0_test";
    robot_controller.task_info["Job name"] = job_name;
    robot_controller.send_job( job_name, jobs );

    run_pitch_controller.full_track_length = 0;
    run_pitch_controller.update_progress();
  },
  simulation_interval: null,
  simulate: function( tf, ms, start_at, only_draw_one = true)
  {
    run_pitch_controller.only_draw_one = only_draw_one;
    if( run_pitch_controller.simulation_interval )
    {
      clearInterval( run_pitch_controller.simulation_interval );
      delete run_pitch_controller.simulation_interval;
      run_pitch_controller.remove_map_progress();
      return;
    }

    if( false && pitch_generator.active.source !== JobSource.USB )
      pitch_generator.active.tasks = reduce_jobs( pitch_generator.active.tasks );

    var task = 0;
    if( start_at )
    {
      while( pitch_generator.active.tasks[task].id !== start_at )
      {
        task += 1;
      }
    }
    var procent = 0.0;
    console.log( "Simulating", task, pitch_generator.active.tasks[task].id );
    var job_length = pitch_generator.active.tasks[task].length;
    var mt = ms * (tf / 1000);
    var step = mt / job_length;

    run_pitch_controller.simulation_interval = setInterval( function()
    {
      if( run_pitch_controller.pause_simulation )
        return;

      //var job_length = pitch_generator.active.tasks[robot_controller.task_info["Original task idx"]].length;



      procent += step;
      if( procent > 1.0 )
      {
        task += 1;
        if( task < pitch_generator.active.tasks.length )
        {
          console.log( "Simulating", pitch_generator.active.tasks[task].id );
          console.log( pitch_generator.active.tasks[task].type );
          job_length = pitch_generator.active.tasks[task].length;
          mt = ms * (tf / 1000);
          step = mt / job_length;

          if( pitch_generator.active.tasks[task].type === "way" )
            step = 1 / (tf / 10);
          console.log( step );
        }
        procent = 0;//procent - 1;
      }

      if( task >= pitch_generator.active.tasks.length )
      {
        clearInterval( run_pitch_controller.simulation_interval );
        delete run_pitch_controller.simulation_interval;
        console.log( "Simulation done" );

        robot_controller.task_info["Original task idx"] = 0;
        robot_controller.task_info["Original task pct"] = 0;

        run_pitch_controller.remove_map_progress();
      }
      else
      {

        robot_controller.task_info["Original task idx"] = task;
        robot_controller.task_info["Original task pct"] = procent;

        run_pitch_controller.update_progress( true );
      }

    }, tf );
  },
  pause_simulation: false,
  fluent_updater: null,
  robot_linear_speed: 1.0,
  robot_angular_speed: 0.2,
  robot_linear_acceleration: 100,
  robot_angular_acceleration: 100,
  predict_next: function()
  {
    var update_freq = 40; //Hz (1/s)
    if( robot_controller.state_top !== TopStates.AUTOMATIC )
      return;
    if( robot_controller.task_info["Job name"] !== "goto_0_0.0_test" )
    {
      var job_id = parseInt( run_pitch_controller.job_params[0] );
      if( !(job_id || job_id === 0) )
        return;
      if( !pitch_generator.active.name )
        return;
    }

    var current_task_state = robot_controller.current_state;

    var current_job = pitch_generator.active;
    var current_task = null;
    var current_tasks = [ ];
    if( robot_controller.task_info["Job name"] === "goto_0_0.0_test" )
    {
      current_task = drive_to_screen_controller.point_coordinates[0];
      current_job = new Job( 0, "goto_0_0.0_test" );
      current_job.tasks = [ current_task ];
      current_tasks = current_job.tasks;
    }
    else if( run_pitch_controller.job_params[3] === "test" )
    {
      current_task = current_job.test_tasks[parseInt( robot_controller.task_info["Original task idx"] )];
      current_tasks = current_job.test_tasks;
    }
    else
    {
      current_tasks = current_job.tasks;
      current_task = current_job.tasks[parseInt( robot_controller.task_info["Original task idx"] )];
    }


    var procent = parseFloat( robot_controller.task_info["Original task pct"] );

    if( current_task_state === 0 || current_task_state === 1 )
    {
      var going_to = null;

      var l = current_task.length;
      var p = 0;
      if( current_task_state === 0 )
      {
        var task_ramp = current_job.get_task_option_value( parseInt( robot_controller.task_info["Original task idx"] ), "ramp_up_max_dist" );
        p = task_ramp / l;
      }
      var rem = run_pitch_controller.split_jobs_on_current_progress( [ current_task ], 0, -p );
      if( rem.tasks_left.length )
        going_to = rem.tasks_left[0].ends[0];
      else
        going_to = current_task.ends[0];

      if( going_to )
      {
        var robot_pos = robot_controller.chosen_robot_position;
        var predicted_path = new Line( robot_pos, going_to );

        var robot_speed = robot_controller.config.velocity_drive / 2;// m/s
        var m_pr_update = robot_speed / update_freq;
        predicted_path = predicted_path.add_to_start( -m_pr_update );

        var angle = predicted_path.as_vector.angle;
        var diff_angle = robot_controller.chosen_robot.t - angle;
        if( diff_angle > Math.PI )
          diff_angle -= Math.PI * 2;

        if( Math.abs( diff_angle ) < 0.01 && predicted_path.length >= m_pr_update )
        {
          robot_controller.chosen_robot.x = predicted_path.start.x;
          robot_controller.chosen_robot.y = predicted_path.start.y;
        }
        if( Math.abs( diff_angle ) >= 0.01 )
        {

          if( diff_angle > 0 )
          {
            robot_controller.chosen_robot.t -= 0.02;
          }
          else
          {
            robot_controller.chosen_robot.t += 0.02;
          }
        }
        if( predicted_path.length <= m_pr_update )
        {
          current_task_state++;
          if( current_task.ends.length === 1 )
            current_task_state += 2;
          if( current_task_state === 1 )
            robot_controller.task_info["Lineplanner on ramp up"] = true;
          if( current_task_state === 2 )
          {
            robot_controller.task_info["Lineplanner on ramp up"] = false;
            robot_controller.task_info["Lineplanner on line"] = true;
          }
        }

      }
    }

    if( current_task_state === 2 )
    { // on the line
      var job_length = current_task.length; // m
      //var robot_speed = robot_controller.config.velocity_spray;// m/s
      var robot_speed = current_job.get_task_action_option_value( robot_controller.task_info["Original task idx"], "drive_max_velocity" );
      if( current_task.type === "arc3" && current_task.radius < 0.5 )
        robot_speed = 0.1;
      var m_pr_update = robot_speed / update_freq;
      var procent_pr_update = m_pr_update / job_length;
      procent += procent_pr_update;
      if( procent > 1 )
      {
        procent = 1;
        current_task_state = 3;
        robot_controller.task_info["Lineplanner on line"] = false;
        robot_controller.task_info["Lineplanner on ramp down"] = true;
      }
      robot_controller.task_info["Original task pct"] = procent;

      var predicted;
      if( current_task.type === "bezier" )
      {
        var result = current_task.getPointAtProcent( procent );
        predicted = result[0];
        robot_controller.chosen_robot.t = result[1];
      }
      else
      {
        var jobs_left = run_pitch_controller.split_jobs_on_current_progress( current_tasks, parseInt( robot_controller.task_info["Original task idx"] ), parseFloat( robot_controller.task_info["Original task pct"] ) ).tasks_left;
        var predicted = jobs_left[0].ends[0];
      }
      robot_controller.chosen_robot.x = predicted.x;
      robot_controller.chosen_robot.y = predicted.y;


      if( current_task.type === "line" )
      {
        var a = new Line( current_task.ends[0], current_task.ends[1] ).angle;
        robot_controller.chosen_robot.t = a;
      }

      if( current_task.type === "arc3" )
      {
        var r = current_task.radius;
        var o = 2 * Math.PI * r;
        var s_pr_o = o / robot_speed;
        var o_pr_s = 1 / s_pr_o;
        var pi_pr_s = o_pr_s * 2 * Math.PI;
        var pi_pr_update = pi_pr_s / update_freq;
        if( current_task.clockwise )
          robot_controller.chosen_robot.t -= pi_pr_update;
        else
          robot_controller.chosen_robot.t += pi_pr_update;
      }

    }

    if( current_task_state === 3 )
    {
      robot_controller.task_info["Original task pct"] = 0;
      if( parseInt( robot_controller.task_info["Original task idx"] ) < (parseInt( robot_controller.task_info["Task count"] ) - 1) )
        robot_controller.task_info["Original task idx"] = parseInt( robot_controller.task_info["Original task idx"] ) + 1;
      current_task_state = 0;
      robot_controller.task_info["Lineplanner on ramp down"] = false;
    }

    var rlnglat = ProjectorInverse( robot_controller.chosen_robot.proj_string, robot_controller.chosen_robot_position.toArray() );
    robot_controller.chosen_robot.long = rlnglat[0];
    robot_controller.chosen_robot.lat = rlnglat[1];

    event_controller.call_callback( "got_robot_position", robot_controller.chosen_robot );
    event_controller.call_callback( "task_info_updated" );


  },
  split_jobs_on_current_progress: function( tasks, current_task_index, current_progress_on_task )
  {
    if( run_pitch_controller.job_params[3] === "test" || run_pitch_controller.job_params[4] === "fulltest" )
    {
      current_task_index = pitch_generator.active.next_task_index(current_task_index);
    }
    else
    {
      current_task_index = pitch_generator.active.next_visible_task_index(current_task_index);
    }

    var tasks_done = tasks.copy().splice( 0, current_task_index );
    var tasks_left = tasks.copy().splice( current_task_index + 1, tasks.length );


    if( current_task_index < tasks.length )
    {
      let current_task = tasks[current_task_index];

      if( current_task )
      {
        current_task = current_task.copy();
      }
      else
      {
        console.error("Current task is undefined", tasks, current_task_index);
        return {
          tasks_done: tasks_done,
          tasks_left: tasks_left,
        };
      }

      if( current_progress_on_task > 0.01 )
      {
        var splittet = current_task.splitPercent( current_progress_on_task, (robot_controller.current_state === 2 ? 0.01 : 0.000001) );
        tasks_done.push( splittet[0] );
        tasks_left.unshift( splittet[1] );
      }
      else
      {
        tasks_left.unshift( current_task );
      }
    }
    else
    {
      tasks_done.push( tasks.last().copy() );
    }

    return {
      tasks_done: tasks_done,
      tasks_left: tasks_left,
    };
  },
  last_robot_state: 0,
  get job_params()
  {
    return robot_controller.task_info["Job name"].split( "_" );
  },
  set job_params(_)
  {},
  update_progress: function( force_drawing )
  {
    if( !pitch_generator.active.name )
      return;

    var job_id = parseInt( run_pitch_controller.job_params[0] );
    if( !(job_id || job_id === 0) && !force_drawing )
      return;
    if( robot_controller.user_state !== TopStates.AUTOMATIC && !force_drawing )
      return;

    const progress_index = parseInt( robot_controller.task_info["Original task idx"] );
    const progress_percent = parseFloat( robot_controller.task_info["Original task pct"] );
    if(!(pitch_generator.active instanceof MultiJob)) // TODO: Reimplement when start_from supports MultiJob
    {
      pitch_generator.active.start_from.index = progress_index;
      pitch_generator.active.start_from.percent = progress_percent;
    }

    var jobs_arr = run_pitch_controller.split_jobs_on_current_progress( pitch_generator.active.tasks, progress_index, progress_percent );
    var jobs_done = jobs_arr.tasks_done;
    var jobs_left = jobs_arr.tasks_left;
      
    if( !run_pitch_controller.full_track_length )
    {
      run_pitch_controller.full_track_length = track_length( pitch_generator.active.tasks );
    }

    var remaining_length = track_length( jobs_done );
    var total_procent = remaining_length / run_pitch_controller.full_track_length;
    var robot_pos = robot_controller.chosen_robot_position;

    if( run_pitch_controller.job_params[3] === "test" && !force_drawing )
    {
      var p1 = (progress_index - 1) / pitch_generator.active.bb.length;
      // calculate
      if( progress_index > 0 )
      {
        var before = pitch_generator.active.test_tasks[progress_index - 1].ends[0];
        var next = pitch_generator.active.test_tasks[progress_index % pitch_generator.active.test_tasks.length].ends[0];
        var l1 = new Line( before, next ).length;
        var l2 = new Line( before, robot_pos ).length;
        p1 += (l2 / l1) / pitch_generator.active.bb.length;
      }

      run_pitch_controller.set_progress( p1 * 100 );
    }
    else
    {
      run_pitch_controller.set_progress( total_procent * 100 );
    }
    if( SETTINGS.draw_map_progress && run_pitch_controller.job_params[3] !== "test" )
    {
      run_pitch_controller.draw_map_progress( force_drawing );
    }

    if( jobs_left.length )
    {
      if( robot_controller.current_state < 1 )
      
        run_pitch_controller.update_next_task_circle( jobs_left[0].start );
      else
        run_pitch_controller.update_next_task_circle( jobs_left[0].end );
    }

  },
  update_robot_position_from_task_info: function( robot_pos )
  {
    if( !robot_pos )
    {
      var task_arr = run_pitch_controller.split_jobs_on_current_progress( pitch_generator.active.tasks, parseInt( robot_controller.task_info["Original task idx"] ), parseFloat( robot_controller.task_info["Original task pct"] ) );
      var task_done = task_arr.tasks_done;
      var task_left = task_arr.tasks_left;
      robot_pos = task_left[0].start;
    }
    if( robot_pos.x && robot_pos.y )
    {
      robot_controller.chosen_robot.x = robot_pos.x;
      robot_controller.chosen_robot.y = robot_pos.y;
      event_controller.call_callback( "got_robot_position", robot_controller.chosen_robot );
    }
  },
  update_goal_distance: function( msg )
  {

    if( SETTINGS.distance_to_point )
      $( '#paint-pitch-bar #dist_to_point' ).removeClass( "gone" );
    else
    {
      $( '#paint-pitch-bar #dist_to_point' ).addClass( "gone" );
      return;
    }

    var dist_to_point = msg.distance;
    var unit = "";
    if( dist_to_point >= 0 )
    {
      if( settings_screeen_controller.use_emperial )
      {
        if( dist_to_point.meter2mile() >= 10 )
        {
          dist_to_point = dist_to_point.meter2mile( settings_screeen_controller.unit === "us-ft" );
          unit = translate["mile"];
        }
        else
        {
          dist_to_point = dist_to_point.meter2unit();
          unit = translate_unit();
        }
      }
      else
      {
        if( dist_to_point / 1000 >= 10 )
        {
          dist_to_point /= 1000;
          unit = translate["km"];
        }
        else
        {
          unit = translate_unit();
        }
      }
      dist_to_point = "" + dist_to_point.round(2);
      if( dist_to_point.split( "." ).length === 1 )
        dist_to_point += ".";
      while( dist_to_point.split(".")[1].length < 2 )
        dist_to_point += "0";
      $( '#paint-pitch-bar #dist_to_point_value' ).html( dist_to_point + " " + unit );
    }
  },
  next_task_cicle: null,
  update_next_task_circle: function( circle_position_robot_frame )
  {
    if( !SETTINGS.draw_job_next_position || !map_controller.background.show_decorations )
      return;
    //var circle_position = map_controller.background.robot_to_map( circle_position_robot_frame.toArray() );
    var circle_position = map_controller.background.projection_to_map( pitch_generator.active.projection, circle_position_robot_frame.toArray() );
    if( !run_pitch_controller.next_task_cicle )
    {
      // create circle
      run_pitch_controller.next_task_cicle = ol_markers.create_marker( "current_task", circle_position, "red_circle", 0 );
      if(SETTINGS.scale_with_map_circle)
      {
        run_pitch_controller.next_task_cicle.feature.setStyle((feature, resolution) => {
            const originalScale = ol_svg_icons.circle().scale;
            const scale = (Background.scaleFromResolution(resolution)*originalScale*0.5).coerce(originalScale,originalScale*2);
            const style = ol_markers.icons["red_circle"].clone();
            style.getImage().setScale(scale);
            return style;
          });
      }
      map_controller.background.map.addLayer( run_pitch_controller.next_task_cicle.layer );
    }
    else
    {
      run_pitch_controller.next_task_cicle.feature.setGeometry( new ol.geom.Point( circle_position ) );
    }
  },
  remove_next_task_circle: function()
  {
    if( run_pitch_controller.next_task_cicle )
    {
      map_controller.background.map.removeLayer( run_pitch_controller.next_task_cicle.layer );
      run_pitch_controller.next_task_cicle = null;
    }
  },

  progress: {
    task: 0,
    procent: 0
  },
  get_current_progress_on_task: function( jobs, task_index )
  {
    var p = 0;

    if( parseInt( robot_controller.task_info["Original task idx"] ) <= pitch_generator.active.tasks.length )
    {
      var current_job = JSON.copy( jobs[task_index] );
      if( current_job.type === "line" )
      {
        var robot_pos = robot_controller.chosen_robot_position.toArray();

        var end2 = closest_point_on_line( robot_pos, current_job.ends );
        var g = vec_sub( current_job.ends[1], current_job.ends[0] );
        var l = vec_len( g );
        var done_l = vec_len( vec_sub( current_job.ends[0], end2 ) );
        var rest_l = vec_len( vec_sub( current_job.ends[1], end2 ) );
        var p_done = done_l / l;
        var p_rest = rest_l / l;
        var p = 1 - p_rest;
        if( p_done > p_rest )
          p = p_done;
        p = norm( p );

      }
      else if( current_job.type === "arc3" )
      {

        if( current_job.ends.length === 2 )
        {
          current_job.ends.push( current_job.ends[0] );
        }

        var start_vec = vec_sub( current_job.ends[0], current_job.center );
        var r = vec_len( start_vec );

        var end_vec = vec_sub( current_job.ends[2], current_job.center );
        var angle_start = norm_angle( Math.atan2( start_vec[1], start_vec[0] ) );
        var angle_end = norm_angle( Math.atan2( end_vec[1], end_vec[0] ) );

        if( current_job.clockwise && angle_end >= angle_start )
        {
          angle_end -= Math.PI * 2;
        }
        if( !current_job.clockwise && angle_end <= angle_start )
        {
          angle_end += Math.PI * 2;
        }
        var angle_diff = Math.abs( angle_start - angle_end );
        //var radians_done = angle_diff * current_progress_on_task;

        var current_vec = vec_sub( robot_controller.chosen_robot_position.toArray(), current_job.center );
        var current_angle = norm_angle( Math.atan2( current_vec[1], current_vec[0] ) );
        if( current_job.clockwise && current_angle >= angle_start )
        {
          current_angle -= Math.PI * 2;
        }
        if( !current_job.clockwise && current_angle <= angle_start )
        {
          current_angle += Math.PI * 2;
        }
        var current_angle_diff = Math.abs( angle_start - current_angle );
        p = current_angle_diff / angle_diff;
        p = norm( p );
      }
    }
    //run_pitch_controller.progress.procent = p;
    //run_pitch_controller.progress.task += 1;

    //robot_controller.task_info["Task procent"] = p;

    return p;
  },

  progress_drawn: null,
  remove_map_progress: function()
  {
    if( run_pitch_controller.progress_drawn )
    {
      map_controller.background.removePitchLayer( run_pitch_controller.progress_drawn );
      delete run_pitch_controller.progress_drawn;
    }
  },
  draw_map_progress_timeout: null,
  draw_map_progress: function( force_drawing )
  {
    clearTimeout(run_pitch_controller.draw_map_progress_timeout);
    run_pitch_controller.draw_map_progress_timeout = setTimeout(()=>run_pitch_controller._draw_map_progress(force_drawing), 0);
  },
  _draw_map_progress: function( force_drawing )
  {
    run_pitch_controller.remove_map_progress();

    if( (parseInt( robot_controller.task_info["Original task idx"] ) > pitch_generator.active.tasks.length || robot_controller.user_state !== TopStates.AUTOMATIC) && !force_drawing )
      return;

    //if ( !force_drawing )
    var cid = parseInt( robot_controller.task_info["Original task idx"] );
    var tasks_splittet = run_pitch_controller.split_jobs_on_current_progress( pitch_generator.active.tasks, cid, parseFloat( robot_controller.task_info["Original task pct"] ) );
    var tasks_done = tasks_splittet.tasks_done.copy();
    //var tasks_left = tasks_splittet[1];

    if( tasks_done.length && (pitch_generator.active.get_task_action_option_value( cid, "dashed_reference" ) || pitch_generator.active.get_task_action_option_value( cid, "dashed_align" )) )
    {
      var line_length = pitch_generator.active.get_task_action_option_value( cid, "dashed_length" );
      var space_length = pitch_generator.active.get_task_action_option_value( cid, "dashed_space" );
      var dashed_offset = pitch_generator.active.get_task_action_option_value( cid, "dashed_offset" );

      var start_offset = (pitch_generator.active.tasks[cid].length / 2 - (line_length / 2)) % (line_length + space_length);
      dashed_offset += start_offset;

      if( !tasks_done.last().set_task_action_option_value( "dashed_offset", dashed_offset ) )
        tasks_done.last().action_options.push( new FloatRobotAction( "dashed_offset", dashed_offset ) );
      if( !tasks_done.last().set_task_action_option_value( "dashed_reference", 0 ) )
        tasks_done.last().action_options.push( new IntRobotAction( "dashed_reference", 0 ) );
      if( !tasks_done.last().set_task_action_option_value( "dashed_align", 0 ) )
        tasks_done.last().action_options.push( new IntRobotAction( "dashed_align", 0 ) );

      if( !tasks_done.last().set_task_action_option_value( "lineat_end_length", 0 ) )
        tasks_done.last().action_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
    }

    if( force_drawing )
    {
      if( tasks_done.length )
      {
        if( run_pitch_controller.only_draw_one )
          tasks_done = [ tasks_done[tasks_done.length - 1] ];
        if( !tasks_done.last().paint )
          tasks_done.last().force_draw_color = Background.featureColor.SPECIAL;
      }
    }
    else if( run_pitch_controller.job_params[3] === "test" )
    {
      tasks_done = [ ];
    }

    tasks_done = tasks_done.filter( j => {
      return j;
    } );

    //job, color, clickable, dragable
    var dummy_job = new Job( pitch_generator.active.id, pitch_generator.active.name, "" );
    dummy_job.tasks = tasks_done;
    dummy_job.projection = pitch_generator.active.projection;
    dummy_job.job_options = pitch_generator.active.job_options.copy();

    if( force_drawing && tasks_done && tasks_done.length && tasks_done[0].reverse )
    {
      run_pitch_controller.progress_drawn = map_controller.background.draw_job( dummy_job, Background.featureColor.IGNORE, false );
    }
    else
    {
      run_pitch_controller.progress_drawn = map_controller.background.draw_job( dummy_job, Background.featureColor.PROGRESS, false );
    }

    if( run_pitch_controller.progress_drawn )
      run_pitch_controller.progress_drawn.setZIndex( 1000000 );

  },
  set_progress: function( procent )
  {
    $( "#paint-pitch-bar #progressbar-loaded" ).css( "width", procent + "%" );
  },
  set_time: function( min )
  {
    let bare_min = Math.floor( min );
    let sec = Math.floor( (min - bare_min) * 60 );

    if( sec < 10 )
    {
      sec = "0" + sec;
    }

    $( "#paint-pitch-bar #time-left" ).html( bare_min + ":" + sec );

    if( AppType === APP_TYPE.TinyLineMarker )
      $( "#paint_pitch_finished_popup #info_label1" ).html( translate["The pitch was painted in"] + " " + bare_min + ":" + sec + " " + translate["minutes"] );
    else
      $( "#paint_pitch_finished_popup #info_label1" ).html( translate["The job was painted in"] + " " + bare_min + ":" + sec + " " + translate["minutes"] );
  },
  play_progress: function()
  {
    var p = 0;
    var inter = setInterval( function()
    {
      p += 0.1;
      if( p > 100 )
        p = 100;
      if( p >= 100 )
        clearInterval( inter );

      run_pitch_controller.set_progress( p );
    }, 10 );

  },

  pitch_que: [ ],
  start_que: function()
  {
    var pitch_id = run_pitch_controller.pitch_que[0];
    pitch_generator.set_active_from_db_job_id( pitch_id );
    if( run_pitch_controller.pitch_que_paint_enable )
      run_pitch_controller.open( run_pitch_controller.modes.RUN );
    else
      run_pitch_controller.open( run_pitch_controller.modes.FULL_TEST );
    run_pitch_controller.pitch_que = run_pitch_controller.pitch_que.splice( 1 );
  },

  /* --- Testing --- */
  test_que: function()
  {
    run_pitch_controller.pitch_que = [ 195, 131, 189, 190, 191, 192, 193, 194 ];
    run_pitch_controller.start_que();
  },
  infinity_run: function( pitch_id, paint = true)
  {
    run_pitch_controller.pitch_que_paint_enable = paint;
    run_pitch_controller.pitch_que.push( pitch_id );
    run_pitch_controller.pitch_que.push( pitch_id );
    run_pitch_controller.pitch_que.push( pitch_id );
    robot_controller.user_info_event.add_callback( "Job done", run_pitch_controller.add_same );
    run_pitch_controller.start_que();
  },
  stop_infinity_run: function()
  {
    robot_controller.user_info_event.remove_callback( "Job done", run_pitch_controller.add_same );
    run_pitch_controller.pitch_que = [ ];

    //robot_controller.user_state = TopStates.MANUAL;
    //robot_controller.manual_mode();
    //run_pitch_controller.stop();
  },
  add_same: function( )
  {
    run_pitch_controller.pitch_que.push( run_pitch_controller.pitch_que[run_pitch_controller.pitch_que.length - 1] );
  },

  robot_options: {},
  update_robot_options: function()
  {
    if( SETTINGS.auto_set_default_values )
    {
      if( Object.keys( run_pitch_controller.robot_options ).length )
        robot_controller.update_user_params( run_pitch_controller.robot_options, "all" );
    }
    $( "#slow_button" ).removeClass( "chosen" ).addClass( "dark" );
  },
  set_default_robot_options: function()
  {
    run_pitch_controller.robot_options.velocity_manual = 2.0; // Joystick is scaled in joystick_controller.js

    run_pitch_controller.robot_options.waypoint_spray_duration = 1.0; //point_spray_duration

    run_pitch_controller.robot_options.caster_front = true; //platform_direction
    run_pitch_controller.robot_options.task_order_asc = true;
    run_pitch_controller.robot_options.error_auto_resume = true;
  },

  play_done_sound: function()
  {
    let audio = null;
    switch (AppType) {
      case (APP_TYPE.TinyLineMarker):
        audio = audioController.list.whistleDone;
        break;
      case (APP_TYPE.TinySurveyor):
      case (APP_TYPE.TinyRemote):
      default:
        audio = audioController.list.fanfareA;
    }

    if (audio) {
      audio.play();
    }
  },

  marking_done: ()=>{
    robot_controller.user_info_event.remove_callback( "Job done", run_pitch_controller.marking_done );
    var job_id = parseInt( run_pitch_controller.job_params[0] );
    if((job_id || job_id === 0)) {
      run_pitch_controller.after_done();
      if(run_pitch_controller.pitch_que.length) {
        run_pitch_controller.start_que();
      }
      else {
        event_controller.call_callback("marking_done");
      }
    }
  },
  test_options_message: function() 
  {
    if( pitch_generator.get_option("Reverse Draw"))
    {
      if( pitch_generator.get_option("Reverse Draw").val)
        popup_screen_controller.confirm_popup(translate["Test Run Warning Goal Sockets"], "", "ok","",popup_screen_controller.close);
      else
        popup_screen_controller.confirm_popup(translate["Test Run Warning Not Compatible"], "", "ok","",popup_screen_controller.close);
    }
    
    if( pitch_generator.get_option("reverseInGoal")) 
    {
      if( pitch_generator.get_option("reverseInGoal").val )
        popup_screen_controller.confirm_popup(translate["Test Run Warning Goal Sockets"], "", "ok","",popup_screen_controller.close)
      else
        popup_screen_controller.confirm_popup(translate["Test Run Warning Not Compatible"], "", "ok","",popup_screen_controller.close);
    }
    else
      popup_screen_controller.confirm_popup(translate["Test Run Warning Not Compatible"], "", "ok","",popup_screen_controller.close);
    
  }
  
};
Object.freeze(run_pitch_controller.modes);


$( document ).ready( function()
{
  event_controller.add_callback( "app_specific_setup_done", function()
  {
    if( general_settings_screen.settings.automatic_choose_projection.val )
    {
      event_controller.add_callback( "got_user_position", projection_controller.set_to_nearest_projection );
      event_controller.add_callback( "robot_now_online", projection_controller.set_zone_on_next_gps );
    }

    if( SETTINGS.auto_set_default_values )
    {
      run_pitch_controller.set_default_robot_options();
    }
  } );

  event_controller.add_callback( "connected_to_robot", run_pitch_controller.update_robot_options );
  event_controller.add_callback( "task_info_updated", run_pitch_controller.update_progress );
  // event_controller.add_callback( "emergency_stop", () => {
  //   run_pitch_controller.stop( true );
  // } );
  event_controller.add_callback( "robot_manual_mode", () => {
    if( bottom_bar_chooser.active_bar === "#paint-pitch-bar" || bottom_bar_chooser.active_bar === "#resume_later_bar" )
    {
      if(run_pitch_controller.running)
      {
        run_pitch_controller.stop( false );
      }
    }
  } );
  message_controller.events.add_callback( "linepoint_goal_distance", run_pitch_controller.update_goal_distance );

  event_controller.add_callback( "got_user_info", function( msg, duration )
  {
    console.log( duration, msg );
  });

  event_controller.add_callback("marking_done", ()=>{
    run_pitch_controller.play_done_sound();
  });

  event_controller.add_callback("chosen_robot_online_changed", ()=>{
    run_pitch_controller.cancelWithError("BodyRobotConnectionLost");
  });
});
