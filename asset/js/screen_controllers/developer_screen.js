/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, top_bar_screen_controller, blue, popup_screen_controller, Storage, settings_screeen_controller, joystick_controller, communication_controller, run_pitch_controller, pitch_generator, event_controller, login_screen_controller, message_controller, bottom_bar_chooser, manage_customers_screen, pop_generator, range, smtpClient */

var developer_screen = {
  open: function()
  {
    var auth = new Authenticator( 4 );
    auth.generate_code().then( code => {
      $( "#developer_mode_authenticator p" ).html( code.split( "" ).reduce( ( txt, char ) => txt + "<span>" + char + "</span>", " " ) );
    } );
  },
  developerMode: true,
  server_user_level: 4,
  use_authentication: true,

  authenticateDeveloperMode: function()
  {
    var val = $( "#developer_mode_input_text" ).val().toUpperCase();
    $( "#developer_mode_input_text" ).val( val );
    console.log( "Checking auth code", val );

    var auth = new Authenticator( 4 );
    auth.generate_code().then( code => {
      if( val === code )
      {
        console.log( "Auth code correct" );
        developer_screen.actualEnableDeveloperMode();
        pop_generator.close();
      }
    } );
  },
  enableDeveloperMode: function()
  {
    if( developer_screen.use_authentication )
      pop_generator.create_popup( "Authenticate", '<input type="text" id="developer_mode_input_text" onkeyup="developer_screen.authenticateDeveloperMode()">', pop_generator.close );
    else
      developer_screen.actualEnableDeveloperMode();
  },
  actualEnableDeveloperMode: function()
  {
    developer_screen.server_user_level = login_screen_controller.user_level;
    login_screen_controller.user_level = user_level.DEVELOPER;
    login_screen_controller.force_developer = true;
    alert( "Developer mode temporary active" );
  },
  update_server_user_level: function()
  {
    developer_screen.server_user_level = login_screen_controller.user_level;
  },
  disableDeveloperMode: function()
  {
    login_screen_controller.user_level = developer_screen.server_user_level;
    login_screen_controller.force_developer = false;
    //communication_controller.send( "disable_developer_mode", {}, "cloud", 10 );
    alert( "Developer mode is disabled" );
    settings_screeen_controller.update();
  },
  set_user_level: function( level, force, user_id )
  {
    var user_levels = login_screen_controller.user_level_names;

    function do_it()
    {
      communication_controller.send( "set_user_level", {
        new_user_level: level,
        user_id: user_id
      }, "cloud", 10 );
      if( !user_id )
      {
        login_screen_controller.user_level = level;

        settings_screeen_controller.update();
        bottom_bar_chooser.reload_bottom_bar();

        settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'general_settings_screen' );
      }
      popup_screen_controller.close();
    }

    !force && popup_screen_controller.confirm_popup( "Change user level", "Do you want to change your user level to: " + user_levels[level], "yes", "no", do_it, popup_screen_controller.close );
    if( force )
      do_it();
  },
  open_select_user_level: function( minimum_level, user_id )
  {
    var buttons = [ ];
    var user_levels = login_screen_controller.user_level_names;

    range( minimum_level, 5 ).forEach( function( user_level )
    {
      if( user_level in user_levels )
        buttons.push( new PopButton( user_levels[user_level], function()
        {
          developer_screen.set_user_level( user_level, false, user_id );
        } ) );
    } );

    pop_generator.create_popup( "Choose new user level", "", buttons, pop_generator.close );


  },
  load_last_developer_mode: function()
  {

  },
  _joystick_force_over_internet: -1,
  get joystick_force_over_internet()
  {
    if( developer_screen._joystick_force_over_internet === -1 )
    {
      developer_screen._joystick_force_over_internet = localStorage.getItem( "user.joystick_over_internet" ) === "true";
      if( developer_screen._joystick_force_over_internet )
        $( '#joystick_over_internet_checkbox' ).attr( "checked", "checked" );
    }
    return developer_screen._joystick_force_over_internet;
  },
  set joystick_force_over_internet( v )
  {
    developer_screen._joystick_force_over_internet = v;
    localStorage.setItem( "user.joystick_over_internet", v );
    developer_screen.report_joystick_force_over_internet( v );
    joystickScreenController.update();
  },
  report_joystick_force_over_internet( v )
  {
    if( !v )
      v = developer_screen.joystick_force_over_internet;
    communication_controller.send_key_val( "Joystick", v ? "Internet" : "Bluetooth" );
  },
  joystick_force_over_internet_changed: function()
  {
    developer_screen.joystick_force_over_internet = ($( '#joystick_over_internet_checkbox:checkbox:checked' ).length) > 0;
  },
  choose_robot: function( id, force = false)
  {
    if( !id )
      id = prompt( "Skriv id på robot" );

    if( id )
    {
      robot_controller.choose_robot( id );

      // top_bar_screen_controller.update();
      event_controller.call_callback("topbar_force_update");
      
      blue.connect_to_robot();
      
      if( force || confirm( "Choose robot '" + robot_controller.robots[id].name + "' for this device?" ) )
      {
        localStorage.setItem( "robot.chosen", id );
        location.reload();
      }

    }
    popup_screen_controller.close();
  },
  choose_no_robot: function()
  {
    robot_controller.choose_robot( "" );
    if( window.networking )
      blue.disconnect();
    localStorage.removeItem( "robot.chosen" );
    location.reload();
  },
  open_choose_robot: function()
  {
    popup_screen_controller.open( "#choose_robot_popup" );
    //<button id="ok_button" class="dark" onclick="popup_screen_controller.close();" style="margin-right: 0" >OK</button>
    $( "#choose_robot_popup #robot_buttons" ).empty();
    var robots = robot_controller.robot_list();

    var html = '<button class="dark" onclick="developer_screen.choose_no_robot();" style="margin-right: 0" >No robot</button><br><br>';
    $( "#choose_robot_popup #robot_buttons" ).append( html );

    robots.forEach( function( robot )
    {
      var html = '<button class="dark" onclick="developer_screen.choose_robot(' + robot.id + ');" style="margin-right: 0" >' + robot.id + " " + robot.name + '</button>';
      $( "#choose_robot_popup #robot_buttons" ).append( html );
    } );
  },
  last_customer_list: {},
  open_change_customer: function( user_id, robot_id, use_customer )
  {
    console.log( user_id, robot_id, use_customer );
    popup_screen_controller.open_info_waiter( "Getting list of customers", "", "" );
    communication_controller.send( "get_customers", {}, "cloud", 10 );
    function got_customers( data )
    {
      console.log( data );
      developer_screen.last_customer_list = data;

      $( "#choose_customer_popup #customer_buttons" ).empty();
      $( "#choose_customer_popup #dealer_button" ).empty();

      var is_developer = login_screen_controller.user_level === user_level.DEVELOPER;
      var is_top_level = data.me === parseInt( data.dealer.id );
      var moving_customer = user_id || robot_id || use_customer;

      if( !is_top_level || is_developer )
      {
        if( is_developer || use_customer )
        {
          $( "#choose_customer_popup #dealer_button" ).append( "<p>Back to TinyMobileRobots:</p>" );
          $( "#choose_customer_popup #dealer_button" ).append( '<button class="dark" onclick="developer_screen.change_costumer(1,' + user_id + ',' + robot_id + ',' + use_customer + ');" style="margin-right: 0" >TinyMobileRobots</button>' );
        }
        else
        {
          // Show dealer
          $( "#choose_customer_popup #dealer_button" ).append( "<p>" + data.dealer.name + "</p>" );
          $( "#choose_customer_popup #dealer_button" ).append( '<button class="dark" onclick="developer_screen.change_costumer(' + data.dealer.id + ',' + user_id + ',' + robot_id + ',' + use_customer + ');" style="margin-right: 0" >' + data.dealer.name + '</button>' );
        }
      }

      $( "#choose_customer_popup #customer_buttons" ).append( "<p>Customers:</p>" );

      data.customers = data.customers.sort_objects( "name", false, true );


      function addCustomersWithDealer( dealer, indents )
      {
        var html = "";
        var customers = data.customers.filter( ( c ) => {
          return c.dealer === dealer;
        } );
        customers.forEach( ( c ) => {
          var customer_html = "";
          var leftmargin = 40 * indents;
          customer_html += '<button class="dark" onclick="developer_screen.change_costumer(' + c.id + ',' + user_id + ',' + robot_id + ',' + use_customer + ');" style="margin-right: 0;margin-left: ' + leftmargin + 'px" >' + c.name + '</button>';
          if( login_screen_controller.user_level === user_level.DEVELOPER )
          {
            // add move button, to move customer to another customer (change dealer)
            customer_html += '<button id="move_customer_button' + c.id + '" class="move_customer_button" onclick="developer_screen.move_customer(' + c.id + ',' + c.dealer + ');" >Move</button>';
          }
          customer_html += '<br>';

          var customers_html = addCustomersWithDealer( c.id, indents + 1 );
          if( customers_html )
          {
            customer_html += '<div id="popup_customers_for_dealer' + c.id + '" class="gone">';
            customer_html += customers_html;
            customer_html += "</div>";

            html += '<button id="popup_plus_button_for_dealer' + c.id + '"  style="min-width: 41px;" onclick="$(\'#popup_customers_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#popup_plus_button_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#popup_minus_button_for_dealer' + c.id + '\').toggleClass(\'gone\')">+</button>';
            html += '<button class="gone" id="popup_minus_button_for_dealer' + c.id + '" style="min-width: 41px;" onclick="$(\'#popup_customers_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#popup_plus_button_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#popup_minus_button_for_dealer' + c.id + '\').toggleClass(\'gone\')">-</button>';
            html += customer_html;

          }
          else
          {
            html += '<button style="min-width: 0;color: transparent;background-color: transparent;">+</button>';
            html += customer_html;
          }

        } );
        return html;
      }

      var html = '<div style="text-align: left;">';
      html += addCustomersWithDealer( data.dealer.id, 0 );
      html += "</div>";

      $( "#choose_customer_popup #customer_buttons" ).append( html );

      popup_screen_controller.close( "#info_waiting_popup" );
      popup_screen_controller.open( "#choose_customer_popup" );
      message_controller.events.remove_callback( "user_customers", got_customers );
    }
    message_controller.events.add_callback( "user_customers", got_customers );

    developer_screen.customer_to_move = 0;
    developer_screen.customer_old_dealer = 0;
  },
  customer_to_move: 0,
  customer_old_dealer: 0,
  move_customer: function( customer, old_dealer )
  {
    if( !developer_screen.customer_to_move )
    {
      $( ".move_customer_button" ).html( "Here" );
      $( "#move_customer_button" + customer + ".move_customer_button" ).html( "Cancel" );
      $( "#move_customer_button" + old_dealer + ".move_customer_button" ).addClass( "gone" );
      developer_screen.customer_to_move = customer;
      developer_screen.customer_old_dealer = old_dealer;
    }
    else
    {
      $( ".move_customer_button" ).html( "Move" );
      $( ".move_customer_button" ).removeClass( "gone" );

      if( customer !== developer_screen.customer_to_move )
      {
        console.log( "Moving customer " + customer + " to " + developer_screen.customer_to_move );

        communication_controller.send( 'set_dealer', {
          customer: developer_screen.customer_to_move,
          new_dealer: customer
        }, "cloud", 10 );

        function done_set_dealer()
        {
          message_controller.events.remove_callback( "done_set_dealer", done_set_dealer );
          developer_screen.open_change_customer();
        }
        popup_screen_controller.open_info_waiter( "Changing dealer for customer", "", "" );
        message_controller.events.add_callback( "done_set_dealer", done_set_dealer );

      }

      developer_screen.customer_to_move = 0;
      developer_screen.customer_old_dealer = 0;
    }

  },
  set_new_name: function(selector = "#dealer_menu #set_new_robot_name_input", show_popup = true)
  {
    var new_name = $( selector ).val();
    if( new_name && new_name !== robot_controller.chosen_robot.name )
    {
      if(new_name.length > 20)
      {
        popup_screen_controller.confirm_popup_with_options({
          header: translate["Name too long"],
          body: translate["The name cannot be longer than %1s characters. Please try again."].format(20),
          ok_text: translate["Ok"],
          ok_callback: popup_screen_controller.close
        });
        developer_screen.update_robot_name_input();
      }
      else
      {
        robot_controller.change_robot_name( new_name );
        if(show_popup)
          popup_screen_controller.pop_up_once( translate["Saving new name"], "robots", 1000 );
        bottom_bar_chooser.reload_bottom_bar();
      }
    }
  },
  set_new_name_user: function()
  {
    if(settings_screeen_controller.chosen_menu === "robot_settings_menu")
      developer_screen.set_new_name("#robot_settings_menu #robot_name_value", false);
  },
  update_robot_name_input: function()
  {
    $( "#robot_settings_menu #set_new_robot_name_input" ).val( robot_controller.chosen_robot.name );
    $( "#robot_settings_menu #robot_name_value" ).val( robot_controller.chosen_robot.name );
  },
  log: [ ],
  original_log: null,
  add_to_log: function( msg1, msg2, msg3, msg4 )
  {
    developer_screen.original_log( msg1 );
    if( msg2 )
      developer_screen.original_log( msg2 );
    if( msg3 )
      developer_screen.original_log( msg3 );
    if( msg4 )
      developer_screen.original_log( msg4 );

    var msg = msg1 + "" + msg2 + "" + msg3 + "" + msg4;
    var lines = msg.split( "\n" );
    lines.forEach( function( line )
    {
      developer_screen.add_to_log( line );
    } );
    event_controller.call_callback( "new_log_entry" );
  },

  move_interval: 0,
  toggle_forward: function(  )
  {
    var speed = $( "#develop_auto_speed" ).val();

    if( developer_screen.move_interval )
    {
      clearInterval( developer_screen.move_interval );
      developer_screen.move_interval = 0;
      joystick_controller.count_down = 0;
      return;
    }

    var time = $( "#develop_auto_time" ).val();
    if( time >= 0 )
    {
      setTimeout( function()
      {
        developer_screen.auto_stop();
      }, time * 1000 );
    }

    developer_screen.move_interval = setInterval( function()
    {
      var msg = {
        x: (speed / parseFloat( robot_controller.config["velocity_manual"] )) * 100,
        y: 0,
        robot: robot_controller.chosen_robot_id
      };
      if( joystick_controller.use_internet )
        communication_controller.send( "move", msg, "cloud", 0 );
      else
        communication_controller.send( "move", msg, "blue", 0 );
    }, 1 / 20 * 1000 );
  },
  toggle_turn: function()
  {
    var speed = $( "#develop_auto_speed" ).val();
    if( developer_screen.move_interval )
    {
      clearInterval( developer_screen.move_interval );
      developer_screen.move_interval = 0;
      joystick_controller.count_down = 0;
      return;
    }

    developer_screen.move_interval = setInterval( function()
    {
      var msg = {
        x: 0,
        y: (speed / parseFloat( robot_controller.config["velocity_manual"] )) * 100,
        robot: robot_controller.chosen_robot_id
      };
      if( joystick_controller.use_internet )
        communication_controller.send( "move", msg, "cloud", 0 );
      else
        communication_controller.send( "move", msg, "blue", 0 );
    }, 1 / 20 * 1000 );
  },
  auto_stop: function()
  {
    clearInterval( developer_screen.move_interval );
    developer_screen.move_interval = 0;
    joystick_controller.count_down = 0;
    sprayToolUtilitiesController.stopTestSpray();
    return;
  },
  toggle_infinite_run()
  {
    if( run_pitch_controller.pitch_que.length > 0 )
    {
      run_pitch_controller.stop_infinity_run();
    }
    else
    {
      if( pitch_generator.active.id > 0 )
      {
        popup_screen_controller.confirm_popup( "Should the infinite run paint?", "", "Yes", "No", function()
        {
          run_pitch_controller.infinity_run( pitch_generator.active.id, true );
          settings_screeen_controller.close();
        }, function()
        {
          run_pitch_controller.infinity_run( pitch_generator.active.id, false );
          settings_screeen_controller.close();
        } );

      }
      else
      {
        alert( "Please select a track to run before starting" );
      }
    }
  },
  choose_app_type: function( )
  {

    const allowed_types = [
      APP_TYPE.TinyLineMarker,
      APP_TYPE.TinySurveyor
    ];

    const index = allowed_types.indexOf(AppType);
    if(index > -1)
    {
      allowed_types.splice(index, 1);
    }

    const buttons = [];
    allowed_types.forEach(type=>{
      buttons.push( new PopButton( type, function()
      {
        localStorage.setItem( "app.type", type );
        popup_screen_controller.open_info_waiter( `Changing app type to ${type}` );
        developer_screen._actual_do_reset_localstorage();
      } ) );
    });

    pop_generator.create_popup( "Choose app type", "", buttons, pop_generator.close );

  },
  transmitAppTypeToServer() {
    const data = {key: "App Type", val: AppType};
    communication_controller.send("save_key_val", data, "cloud", 5);
    event_controller.remove_callback("app_server_connection_established", developer_screen.transmitAppTypeToServer);

  },

  set_tool_shift: function()
  {
    var new_toolshift = parseFloat( $( '#force_new_toolshift' ).val() );
    alert( "setting tool shift to " + new_toolshift );
    robot_controller.update_user_param( "tool_sideshift", new_toolshift );
  },
  ask_to_change_only_tablet()
  {

    var what_to_move_buttons = [ ];
    what_to_move_buttons.push( new PopButton( "Only tablet", function()
    {
      developer_screen.open_change_customer( login_screen_controller.user_id, -1 );
    } ) );
    if( robot_controller.chosen_robot_id )
    {
      what_to_move_buttons.push( new PopButton( "Also robot", function()
      {
        developer_screen.open_change_customer( login_screen_controller.user_id, robot_controller.chosen_robot_id );
      } ) );
    }

    pop_generator.create_popup( "What should change customer", "", what_to_move_buttons, function()
    {
      pop_generator.close( );
    } );
  },
  change_costumer: function( customer_id, user_id, robot_id, old_customer )
  {
    console.log( "choosing", customer_id );

    var new_customer_name = developer_screen.last_customer_list.customers.filter( c => {
      return c.id === customer_id;
    } ).map( c => {
      return c.name;
    } )[0];
    if( !new_customer_name && customer_id === developer_screen.last_customer_list.dealer.id )
      new_customer_name = developer_screen.last_customer_list.dealer.name;


    function customer_changed( data )
    {
      if( data.success )
      {
        if( user_id === login_screen_controller.user_id || !user_id )
          location.reload();
        else
        {
          popup_screen_controller.close_info_waiter();
          manage_customers_screen.customer_tablets = {};
          manage_customers_screen.customer_robots = {};
          manage_customers_screen.open();
        }
      }
      else
      {
        popup_screen_controller.close( "#choose_customer_popup" );
        alert( data.msg );
      }
      message_controller.events.remove_callback( "customer_changed", customer_changed );

    }

    var data = {
      new_customer: customer_id
    };
    if( user_id )
      data.user_id = user_id;
    if( robot_id )
      data.robot = robot_id;
    if( old_customer )
      data.old_customer = old_customer;

    var text = "";
    console.log( data );
    if( (user_id > 0) && (robot_id > 0) )
    {
      text = "This will move both <strong><u>tablet " + user_id + "</u></strong> and <strong><u>robot " + robot_id + "</u></strong> to <strong><u>" + new_customer_name + "</u></strong>";
    }
    else if( (robot_id > 0) && !(user_id > 0) )
    {
      text = "This will only move the <strong><u>robot " + robot_id + "</u></strong> to <strong><u>" + new_customer_name + "</u></strong>";
    }
    else if( !(robot_id > 0) && (user_id > 0) )
    {
      text = "This will only move <strong><u>tablet " + user_id + "</u></strong> to <strong><u>" + new_customer_name + "</u></strong>";
    }
    popup_screen_controller.confirm_popup_with_options({
      header: "Warning!",
      body: text,
      ok_text: "Ok",
      cancel_text: "Cancel",
      ok_callback: function()
      {
        communication_controller.send( "set_customer", data, "cloud", 10 );
        popup_screen_controller.open_info_waiter( "Setting customer", "", "" );
        message_controller.events.add_callback( "customer_changed", customer_changed );
      },
      cancel_callback: popup_screen_controller.close
    });
  },

  apply_extra_job_options: function(job_options)
  {
    let extra_options = $( "#developer_settigs_menu #extra_job_options" ).val();
    if( extra_options )
    {
      let rows = extra_options.trim().split( "\n" );
      rows.forEach( r => {
        if( r && (r.split( "," ).length === 3) )
        {
          let e = r.split( "," );
          let type = e[0].trim().toLowerCase();
          let key = e[1].trim();
          let s_val = e[2].trim();
          if( type === "int" && !isNaN( parseInt( s_val ) ) )
            job_options.push( new IntRobotAction( key, parseInt( s_val ) ) );
          if( type === "float" && !isNaN( parseFloat( s_val ) ) )
            job_options.push( new FloatRobotAction( key, parseFloat( s_val ) ) );
        }
      } );
    }
  },

  get_splits: function()
  {
    var n_robots = parseInt( prompt( "How many robot?", 1 ) );
    var splits = split_job( pitch_generator.active, n_robots );
    var tekst = "";
    splits.forEach( function( list, i )
    {
      if( list.length )
        tekst += "Robot " + (i + 1) + " has to start from task " + list[0].id + ". It is driving " + parseInt( track_length( list, true ) ) + " meters<br>";
      else
        tekst += "Robot " + (i + 1) + " has no tasks<br>";
    } );
    popup_screen_controller.confirm_popup( "Split job tasks", tekst, "ok", "", popup_screen_controller.close );
  },

  customer_jobs: false,
  toggle_customer_customer_jobs: function()
  {
    developer_screen.customer_jobs = $( '#customer_customer_jobs_checkbox' ).prop( 'checked' );

    function done_setting()
    {
      robot_controller.fetch_db_jobs();
      message_controller.events.remove_callback( "enable_send_of_customer_jobs", done_setting );
    }
    message_controller.events.add_callback( "enable_send_of_customer_jobs", done_setting );

    popup_screen_controller.pop_up_once( "Getting all templates", "db_jobs_list_load_done", 1000 );

    communication_controller.send( "enable_send_of_customer_jobs", {
      enable: developer_screen.customer_jobs
    }, "cloud", 10 );

  },

  get force_robot_online()
  {
    return $( '#force_robot_online_checkbox' ).prop( 'checked' );
  },
  force_robot_online_changed()
  {
    event_controller.call_callback( "robot_list_updated" );
  },

  get isSafemode()
  {
    return localStorage.getItem('safemodeBackup') !== null;
  },
  set isSafemode(_)
  {},

  enable_safemode()
  {
    if (developer_screen.isSafemode) {
      return;
    }

    const options = {
      header_text: translate["Safe mode"],
      body_text: translate["safeModeOn"],
      spinner: true
    }
    pop_generator.create_popup_with_options(options);

    const safemodeBackup = JSON.stringify(localStorage);
    const username = localStorage.getItem( "user.username" );
    const password = localStorage.getItem( "user.password" );
    const apptype = localStorage.getItem( "app.type" );
    const userContactInformation = userInformationController.information;

    localStorage.clear();
    localStorage.setItem( "user.username", username );
    localStorage.setItem( "user.password", password );
    localStorage.setItem( "app.type", apptype );
    localStorage.setItem( "user.save", true );
    localStorage.setItem( "safemodeBackup", safemodeBackup );
    localStorage.setItem("user.contactInformation", JSON.stringify(userContactInformation));

    location.reload();
  },

  disable_safemode()
  {
    if(!developer_screen.isSafemode)
    {
      return;
    }

    const options = {
      header_text: translate["Safe mode"],
      body_text: translate["safeModeOff"],
      spinner: true
    }
    pop_generator.create_popup_with_options(options);

    const safemodeBackup = JSON.parse(localStorage.getItem('safemodeBackup'));
    localStorage.clear();
    for (const [key, value] of Object.entries(safemodeBackup)) {
      localStorage.setItem(key, value);
    }

    location.reload();
  },

  toggle_safemode()
  {
    if(developer_screen.isSafemode)
    {
      developer_screen.disable_safemode();
    }
    else
    {
      developer_screen.enable_safemode();
    }

    userInformationController.updateButtons();
  },

  _actual_do_reset_localstorage()
  {
    const username = localStorage.getItem( "user.username" );
    const password = localStorage.getItem( "user.password" );
    const apptype = localStorage.getItem( "app.type" );
    const userContactInformation = userInformationController.information;
    localStorage.clear();
    localStorage.setItem( "user.username", username );
    localStorage.setItem( "user.password", password );
    localStorage.setItem( "app.type", apptype );
    localStorage.setItem( "user.save", true );
    localStorage.setItem("user.contactInformation", JSON.stringify(userContactInformation));

    location.reload();
  },

  reset_localstorage(send_mail=true)
  {
    // header, body, ok_text, cancel_text, ok_callback, cancel_callback
    popup_screen_controller.confirm_popup( translate["Reset settings"], translate["Reset_settings_text"], translate["OK"], translate["Cancel"], function()
    {

      let mailSettings = Object.assign({},email_config);
      mailSettings.emailTo = "app.reset@tinymobilerobots.com";
      mailSettings.attachmentsInBase64Format = [ ];
      mailSettings.subject = auto_update_screen.getTabletId() + " is reset, here is the old localStorage state";
      mailSettings.textBody = JSON.stringify( localStorage );

      popup_screen_controller.open_info_waiter( translate["Reset_waiting_text"] );

      setTimeout( function()
      {
        if( send_mail && window.smtpClient )
          smtpClient.sendMail( mailSettings, developer_screen._actual_do_reset_localstorage, developer_screen._actual_do_reset_localstorage );
        else
          developer_screen._actual_do_reset_localstorage();
      }, 10 );


    }, function()
    {
      popup_screen_controller.close();
    },
    "red");


  },

  report_bug_result: function(response = false)
  {
    if(response && response.result.data)
    {
      popup_screen_controller.close_info_waiter();
      popup_screen_controller.confirm_popup( translate["Bug report has been sent"], "", translate["OK"], "", popup_screen_controller.close );
    }
    else
    {
      popup_screen_controller.close_info_waiter();
      popup_screen_controller.confirm_popup( translate["Error sending bug report"], "", translate["OK"], "", popup_screen_controller.close );
    }
  },

  isReporting: false,

  report_bug: function(text = "")
  {
    let html = "";
    html += `<label for="report_bug_reporter">Initials</label> <input type="text" name="report_bug_reporter" id="report_bug_reporter" placeholder="abc" minlength="2" maxlength="3" size="3" required>`;
    html += `<label for="report_bug_known">Seen before</label> <input type="checkbox" name="report_bug_known" id="report_bug_known" style="vertical-align:middle"><br>`;
    html += `<textarea id="report_bug_textarea" name="report_bug_textarea" placeholder="${translate["Please write what this report is about"]}" style="height:100px;width:100%">${text}</textarea>`;

    const timestamp = Date.now();

    developer_screen.isReporting = true;

    const report_send = async function()
    {
      const textAreaText = $("#report_bug_textarea").val();
      const textInitials = $("#report_bug_reporter").val().toUpperCase();
      const checkKnown = $("#report_bug_known").prop('checked');
      
      popup_screen_controller.close("confirm_popup");

      try
      {
        popup_screen_controller.open_info_waiter( translate["Sending bug report"] );

        communication_controller.send( "send_bug_report", {
          report: textAreaText,
          initials: textInitials,
          timestamp: timestamp,
          tablet_id: auto_update_screen.getTabletId(),
          robot_id: auto_update_screen.getRobotId(),
          known_issue: checkKnown,
          app_version: auto_update_screen.getAppVersion(),
          rs_version: auto_update_screen.getRobotVersion(),
        }, "cloud", 0 );
        developer_screen.isReporting = false;
      }
      catch(e)
      {
        console.error(e);
        developer_screen.report_bug();
      }
    };

    const report_cancel = function()
    {
      popup_screen_controller.close("confirm_popup");
      developer_screen.isReporting = false;
    };

    popup_screen_controller.confirm_popup(translate["Report a bug"],html,translate["Report"],translate["Cancel"], report_send, report_cancel);
  },

  setup_robot_to_tinydemo_ntrip: function( mountpoint )
  {
    var ntrip_settings = {
      ntrip_address: "69.64.185.170",
      ntrip_port: 9301,
      ntrip_username: "TinyDemo01",
      ntrip_password: "Tiny2017",
      ntrip_mountpoint: mountpoint
    };
    communication_controller.send( 'set_ntrip_settings', {
      robot: robot_controller.chosen_robot_id,
      ntrip_settings: ntrip_settings
    }, "all", 10 );
    popup_screen_controller.pop_up_once( "Sending ntrip to robot", "updated_ntrip", 2000 );
  },

  show_dealer_is_customer_warning_popup: function()
  {
    if(login_screen_controller.user_level <= user_level.DEALER)
    {
      let body = "This tablet has not been moved to a customer; it is still owned by %1s.".format(login_screen_controller.dealer_name);
      body += "<br><br>";
      body += "Please use the Service Center (service.tinymobilerobots.com) to create a new customer and to move the tablet and robot to that customer.";
      body += "<br><br>";
      body += "To hide this warning, go to the 'Dealer menu' and uncheck the 'Show dealer warning' checkbox.";
      popup_screen_controller.confirm_popup_with_options({
        header: "Tablet has not been moved to a Customer",
        body: body,
        ok_text: translate["Ok"],
        ok_callback: popup_screen_controller.close,
        cancel_text: "Hide this warning",
        cancel_callback: ()=>{
          popup_screen_controller.close();
          settings_screeen_controller.choose_menu( 'dealer_menu_header', 'dealer_menu' );
          settings_screeen_controller.open();
        }
      });
    }
    else
    {
      popup_screen_controller.confirm_popup_with_options({
        header: translate["Tablet belongs to %1s"].format(login_screen_controller.dealer_name),
        body: translate["This tablet belongs to %1s."].format(login_screen_controller.dealer_name) + "<br>" + translate["Please contact support to remove this message."],
        ok_text: translate["Ok"],
        ok_callback: popup_screen_controller.close
      });
    }
      
  },

  showSafeModeEnabledWarning() {
    const buttons = [
      new PopButton(translate["yes"], yes, null, null),
      new PopButton(translate["no"], no, null, null)
    ]
    const options = {
      popup_id: "ask_disable_safe_mode_popup",
      header_text: translate["safe mode"],
      body_text: translate["askDisableSafeModeFromWarning"],
      buttons: buttons
    }

    pop_generator.create_popup_with_options(options);

    function yes() {
      pop_generator.close();
      developer_screen.toggle_safemode();
    }
    
    function no() {
      pop_generator.close();
    }
  }
};

$( document ).ready( function()
{
  if (developer_screen.isSafemode) {
    $("#safe_mode_on_indicator").removeClass("gone");
  }

  event_controller.add_callback( "lcd_display_lines", function()
  {

    $( "#settings_screen #lcd_display #lcd_line1" ).html( robot_controller.display_lines[0].replace( /\ /g, "&nbsp;" ) );
    $( "#settings_screen #lcd_display #lcd_line2" ).html( robot_controller.display_lines[1].replace( /\ /g, "&nbsp;" ) );
    $( "#settings_screen #lcd_display #lcd_line3" ).html( robot_controller.display_lines[2].replace( /\ /g, "&nbsp;" ) );
    $( "#settings_screen #lcd_display #lcd_line4" ).html( robot_controller.display_lines[3].replace( /\ /g, "&nbsp;" ) );

  } );

  event_controller.add_callback( "on_system_diag_change", function()
  {
    if( robot_controller.state_top === TopStates.ERROR_USER_WAIT )
    {
      developer_screen.auto_stop();
    }
  } );

  event_controller.add_callback( "open_settings_menu", function( menu )
  {
    if( menu === "robot_settings_menu" || menu === "robot_settings_menu_header")
    {
      developer_screen.update_robot_name_input();
    }
  } );

  event_controller.add_callback( "user_login_success", developer_screen.update_server_user_level );

  message_controller.events.add_callback("send_bug_report", developer_screen.report_bug_result)

} );

event_controller.add_callback( "robot_config_updated", function()
{
  $( "#force_new_toolshift" ).val( robot_controller.config.tool_sideshift );

} );


event_controller.add_callback( "close_popup", function( popup_id )
{
  if( popup_id === "#choose_customer_popup" )
    $( "#choose_customer_popup #customer_buttons" ).empty();
} );

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "developer_settigs_menu" )
  {
    developer_screen.open();
  }
} );