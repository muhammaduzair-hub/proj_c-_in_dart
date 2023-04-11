/* global robot_controller, communication_controller, projection, blue, Storage, proj4, event_controller */

var joystick_controller = {

  critical_error: false,
  joystick_started: false,
  joystick: '',
  timer: 0,
  count_down: 20,
  _use_internet: false,
  get use_internet()
  {
    var force_internet = developer_screen.joystick_force_over_internet;
    return joystick_controller._use_internet || force_internet;
  },
  set use_internet( value )
  {
    joystick_controller._use_internet = value;
  },
  max_speed: 2.0,
  slow_speed: 0.25,
  use_slow_speed: false,
  set_max_speed: function( new_speed )
  {
    joystick_controller.max_speed = new_speed;
    if( typeof (Storage) !== "undefined" )
    {
      localStorage.setItem( "joystick.max_speed", new_speed );
    }
  },
  load_old_max_speed: function( )
  {
    if( typeof (Storage) !== "undefined" )
    {
      joystick_controller.max_speed = parseInt( localStorage.getItem( "joystick.max_speed" ) );
      if( !joystick_controller.max_speed )
        joystick_controller.max_speed = 1.0;
    }
  },
  start_joystick: function( )
  {
    joystick_controller.load_old_max_speed( );
    if( joystick_controller.joystick_started || joystick_controller.critical_error )
    {
      return;
    }
    joystick_controller.joystick_started = true;
    var container = document.querySelector( 'div.joystick' );
    joystick_controller.joystick = new VirtualJoystick( {
      container: container, //document.getElementById('virtual_joystic_area'),
      mouseSupport: true,
      limitStickTravel: true,
      stickRadius: $( container ).width( ) / 2 - 62 / 2,
      strokeStyle: 'lightgray',
      dragBase: false,
      stationaryBase: true,
      baseX: $( container ).width( ) / 2,
      baseY: $( container ).width( ) / 2
    } );

    joystick_controller.start_timer();
  },
  restart_joystick_timeout: undefined,
  restart_joystick: function()
  {
    console.log( "Joystick", "restart" );
    clearTimeout( joystick_controller.restart_joystick_timeout );
    joystick_controller.restart_joystick_timeout = undefined;
    joystick_controller.stop_joystick();
    joystick_controller.start_joystick();
  },
  start_timer: function()
  {
    if( joystick_controller.gamepad.looper )
      return;
      //joystick_controller.gamepad.stop();
    if( joystick_controller.timer )
      return;
    joystick_controller.timer = setInterval( joystick_controller.timer_do, 1 / 10 * 1000 ); // 10 Hz
  },
  stop_timer: function()
  {
    clearInterval( joystick_controller.timer );
    joystick_controller.timer = 0;
  },
  limit: function( g, deadzone, max )
  {
    if( Math.abs( g ) < deadzone )
    {
      g = 0;
    }
    else
    {
      if( g > deadzone )
        g -= deadzone;
      else
        g += deadzone;
    }
    g *= 100 / (max - deadzone);
    if( g > 100 )
      g = 100;
    if( g < -100 )
      g = -100;
    return g;
  },
  timer_do: function( )
  {
    if( !blue.socket_confirmed && !joystick_controller.use_internet )
      return;
    var dx = joystick_controller.limit( -joystick_controller.joystick.deltaX( ), 10, joystick_controller.joystick._stickRadius );
    var dy = joystick_controller.limit( -joystick_controller.joystick.deltaY( ), 10, joystick_controller.joystick._stickRadius );

    joystick_controller.handle_input( dx, dy );
  },
  accelerometer_watch: 0,
  wait_for_zero: true,
  start_accelerometer: function()
  {

    // cordova plugin add cordova-plugin-device-motion
    joystick_controller.stop_timer();
    if( joystick_controller.accelerometer_watch )
      joystick_controller.stop_accelerometer();

    var options = {
      frequency: 1000 / 20
    };
    function acc_error( e )
    {
      console.log( "accelerometer error:", e );
    }
    joystick_controller.wait_for_zero = true;
    joystick_controller.accelerometer_watch = navigator.accelerometer.watchAcceleration( joystick_controller.accelerometer_do, acc_error, options );
  },
  stop_accelerometer: function()
  {
    if( joystick_controller.accelerometer_watch )
      navigator.accelerometer.clearWatch( joystick_controller.accelerometer_watch );
    joystick_controller.accelerometer_watch = 0;
    $( "#accelerometer_joystick_menu #info" ).html( "Press start to begin" );
    joystick_controller.start_timer();
  },
  accelerometer_do: function( acceleration )
  {

    //$("#accelerometer_joystick_menu #acc_x").html( acceleration.x );
    //$("#accelerometer_joystick_menu #acc_y").html( acceleration.y );
    //$("#accelerometer_joystick_menu #acc_z").html( acceleration.z );

    var g = new Vector3( acceleration.x, acceleration.y, acceleration.z ).length * 0.9;

    var forward = joystick_controller.limit( acceleration.z, 3.0, g );
    var turn = joystick_controller.limit( -acceleration.y, 3.0, g );

    if( forward === 0 && turn === 0 )
      joystick_controller.wait_for_zero = false;

    $( "#accelerometer_joystick_menu #acc_x" ).html( forward );
    $( "#accelerometer_joystick_menu #acc_y" ).html( turn );

    if( joystick_controller.wait_for_zero )
    {
      $( "#accelerometer_joystick_menu #info" ).html( "Please hold tablet in zero position" );
    }
    else
    {
      $( "#accelerometer_joystick_menu #info" ).html( "Tilt to drive" );
      joystick_controller.handle_input( turn, forward );
    }

  },

  map_circle_to_square: false,
  map_circle_to_square_toggle: function()
  {
    const v = $("#toggle_circle_to_square").prop('checked');
    joystick_controller.map_circle_to_square = v;
    $("#toggle_circle_to_square").prop('checked',v);
  },

  last_dx: 1000,
  last_dy: 1000,
  handle_input: function( dx, dy )
  {

    if( !robot_controller.config["velocity_manual"] )
      return;


    if( joystick_controller.map_circle_to_square )
    {
      let u = dx / 100 * (-1);
      let v = dy / 100;

      dx = 0.5 * Math.sqrt( 2 + u**2 - v**2 + 2*Math.sqrt(2)*u ) - 0.5 * Math.sqrt( 2 + u**2 - v**2 - 2*Math.sqrt(2)*u );
      dy = 0.5 * Math.sqrt( 2 - u**2 + v**2 + 2*Math.sqrt(2)*v ) - 0.5 * Math.sqrt( 2 - u**2 + v**2 - 2*Math.sqrt(2)*v );

      dx = dx * 100 * (-1);
      dy = dy * 100;

      dx *= 2; 
    }

    //dx *= Math.abs( Math.pow( dx, 1 ) ) / Math.pow( 100, 1 );
    //dy *= Math.abs( Math.pow( dy, 3 ) ) / Math.pow( 100, 3 );
    if( AppType !== APP_TYPE.TinyRemote && !SETTINGS.joystick_get_speed_from_robot )
    {
      if( joystick_controller.use_slow_speed )
      {
        dx *= Math.abs( dx ) / 100;
        dy *= Math.abs( dy ) / 100;
        dx *= (joystick_controller.slow_speed / parseFloat( robot_controller.config["velocity_manual"] ));
        dy *= (joystick_controller.slow_speed / parseFloat( robot_controller.config["velocity_manual"] ));
      }
      else
      {
        dx *= (joystick_controller.max_speed / parseFloat( robot_controller.config["velocity_manual"] ));
        dy *= (joystick_controller.max_speed / parseFloat( robot_controller.config["velocity_manual"] ));
      }
    }


    if( joystick_controller.last_dx === 0 && joystick_controller.last_dy === 0 && dx === 0 && dy === 0 )
    {
      joystick_controller.last_vel = [ 0, 0 ];
    }
    else
    {
      joystick_controller.count_down = 20;
    }

    if( joystick_controller.count_down === 0 )
      return;
    joystick_controller.count_down--;
    if( !robot_controller.chosen_robot_id )
      return;
    if( !robot_controller.chosen_robot || !robot_controller.chosen_robot.online )
      return;
    var msg = {
      x: dy,
      y: dx,
      robot: robot_controller.chosen_robot_id
    };
    //console.log( msg.x, msg.y );

    if( msg.x === 0 && msg.y === 0 && !(joystick_controller.last_dx === 0 && joystick_controller.last_dy === 0) )
    {
      if( communication_controller.appServerConnection.connected && communication_controller.autoLogin )
        communication_controller.send( "move", msg, "all", 0 );
      else
        communication_controller.send( "move", msg, "blue", 0 );
    }

    if( blue.socket_confirmed && !joystick_controller.use_internet )
    {
      communication_controller.send( "move", msg, "blue", 0 );
    }
    else if( joystick_controller.use_internet && communication_controller.appServerConnection.connected && communication_controller.autoLogin )
    {
      communication_controller.send( "move", msg, "cloud", 0 );
    }

    if( !robot_controller.config.velocity_manual )
    {
      robot_controller.config.velocity_manual = 2.0;
    }
    // Prediction of where the robot is.
//    var diff = joystick_controller.clamp( (msg.x * robot_controller.config.velocity_manual / 100.0) * 0.5, msg.y * (robot_controller.config.velocity_manual / 2) / 100.0 );
//    var diff_x = Math.cos( robot_controller.chosen_robot.t ) * diff[0] / 20.0;
//    var diff_y = Math.sin( robot_controller.chosen_robot.t ) * diff[0] / 20.0;
//    var diff_t = diff[1] / 40.0;
//    if( robot_controller.chosen_robot.proj_string )
//    {
//      robot_controller.chosen_robot.x += diff_x;
//      robot_controller.chosen_robot.y += diff_y;
//      robot_controller.chosen_robot.t += diff_t;
//      var latlng = proj4( robot_controller.chosen_robot.proj_string ).inverse( robot_controller.chosen_robot_position.toArray() );
//      robot_controller.chosen_robot.long = latlng[0];
//      robot_controller.chosen_robot.lat = latlng[1];
//      event_controller.call_callback( "got_fake_robot_position" );
//    }
    event_controller.call_callback( "change_follow_robot", true );

    if( msg.x === 0 && msg.y === 0 )
    {
      event_controller.call_callback( "change_follow_robot", false );
    }

    joystick_controller.last_dx = dx;
    joystick_controller.last_dy = dy;
  },
  last_vel: [ 0, 0 ],
  clamp: function( x, z )
  {
    var max_x_acceleration = 0.1;
    var max_x_deacceleration = 0.5;
    var max_z_acceleration = 0.1;
    var max_z_deacceleration = 0.5;
    var last_vel = joystick_controller.last_vel;
    var max_x_acc = max_x_acceleration;
    if( x === 0 )
      max_x_acc = max_x_deacceleration;
    var x_diff = last_vel[0] - x;
    if( x_diff > 0 && last_vel[0] > 0 )
      max_x_acc = max_x_deacceleration;
    if( x_diff < 0 && last_vel[0] < 0 )
      max_x_acc = max_x_deacceleration;
    if( x > last_vel[0] + max_x_acc )
      x = last_vel[0] + max_x_acc;
    if( x < last_vel[0] - max_x_acc )
      x = last_vel[0] - max_x_acc;
    var max_z_acc = max_z_acceleration;
    if( z === 0 )
      max_z_acc = max_z_deacceleration;
    var z_diff = last_vel[1] - z;
    if( z_diff > 0 && last_vel[1] > 0 )
      max_z_acc = max_z_deacceleration;
    if( z_diff < 0 && last_vel[1] < 0 )
      max_z_acc = max_z_deacceleration;
    if( z > last_vel[1] + max_z_acc )
      z = last_vel[1] + max_z_acc;
    if( z < last_vel[1] - max_z_acc )
      z = last_vel[1] - max_z_acc;
    joystick_controller.last_vel = [ x, z ];
    return [ x, z ];
  },
  stop_joystick: function( )
  {
    if( !joystick_controller.joystick_started )
      return;
    clearInterval( joystick_controller.timer );
    joystick_controller.timer = undefined;
    joystick_controller.joystick_started = false;
    joystick_controller.joystick.destroy( );
  },

  gamepad: {
    zero_axes: [ ],
    state: 0,

    forward_axes_index: -1,
    forward_controller_index: -1,
    forward_multiply: 0,

    turn_axes_index: -1,
    turn_controller_index: -1,
    turn_multiply: 0,

    looper: 0,
    start: function()
    {
      joystick_controller.gamepad.stop();
      joystick_controller.stop_timer();
      joystick_controller.gamepad.looper = setInterval( joystick_controller.gamepad.state_loop, 1 / 20 * 1000 );
      joystick_controller.gamepad.state = 1;

    },
    stop: function()
    {
      clearInterval( joystick_controller.gamepad.looper );
      joystick_controller.gamepad.looper = 0
      joystick_controller.gamepad.state = 0;
      joystick_controller.start_timer();
      $( "#gamepad_info" ).html( "Press start to begin" );
    },
    state_loop: function()
    {
      var next_state = joystick_controller.gamepad.state;
      if( joystick_controller.gamepad.state === 0 )
      {
      }
      if( joystick_controller.gamepad.state === 1 )
      {
        if( !joystick_controller.gamepad.get_all_axes().length )
        {
          joystick_controller.gamepad.stop();
          $( "#gamepad_info" ).html( "No gamepads found" );
          next_state = 0;
        }
        else
        {
          // please leave all joypads in rest position
          joystick_controller.gamepad.zero_axes = joystick_controller.gamepad.get_all_axes(); // [[0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
          next_state = 2;
          $( "#gamepad_info" ).html( "drive in forward direction to capture" );
        }
      }
      if( joystick_controller.gamepad.state === 2 )
      {
        // please move forward with full speed
        // check if any big change somewhere
        var current_axxes = joystick_controller.gamepad.get_all_axes();
        var changes = current_axxes.map( ( c, i ) => {
          return c.map( ( a, n ) => {
            return a - joystick_controller.gamepad.zero_axes[i][n];
          } );
        } );


        for( let i = 0; i < changes.length; i++ )
        {
          for( let n = 0; n < changes[i].length; n++ )
          {
            if( Math.abs( changes[i][n] ) >= 0.99 )
            {
              joystick_controller.gamepad.forward_controller_index = i;
              joystick_controller.gamepad.forward_axes_index = n;
              if( changes[i][n] > 0 )
                joystick_controller.gamepad.forward_multiply = 1;
              else
                joystick_controller.gamepad.forward_multiply = -1;
              next_state = 3;
              $( "#gamepad_info" ).html( "Release all joypads" );
            }
          }
        }

      }
      if( joystick_controller.gamepad.state === 3 )
      {
        if( Math.abs( joystick_controller.gamepad.get_axes( joystick_controller.gamepad.forward_controller_index, joystick_controller.gamepad.forward_axes_index ) ) < 0.01 )
          next_state = 4;
        $( "#gamepad_info" ).html( "turn to the left to capture" );
      }
      if( joystick_controller.gamepad.state === 4 )
      {
        // please move forward with full speed
        // check if any big change somewhere
        var current_axxes = joystick_controller.gamepad.get_all_axes();
        var changes = current_axxes.map( ( c, i ) => {
          return c.map( ( a, n ) => {
            return a - joystick_controller.gamepad.zero_axes[i][n];
          } );
        } );


        for( let i = 0; i < changes.length; i++ )
        {
          for( let n = 0; n < changes[i].length; n++ )
          {
            if( Math.abs( changes[i][n] ) >= 0.99 )
            {
              joystick_controller.gamepad.turn_controller_index = i;
              joystick_controller.gamepad.turn_axes_index = n;
              if( changes[i][n] > 0 )
                joystick_controller.gamepad.turn_multiply = 1;
              else
                joystick_controller.gamepad.turn_multiply = -1;
              next_state = 5;
              $( "#gamepad_info" ).html( "Release all joypads" );
            }
          }
        }

      }
      if( joystick_controller.gamepad.state === 5 )
      {
        if( Math.abs( joystick_controller.gamepad.get_axes( joystick_controller.gamepad.turn_controller_index, joystick_controller.gamepad.turn_axes_index ) ) < 0.01 )
          next_state = 6;
        $( "#gamepad_info" ).html( "Move joypads to move robot" );
      }
      if( joystick_controller.gamepad.state === 6 )
      {
        var forward = joystick_controller.gamepad.get_axes( joystick_controller.gamepad.forward_controller_index, joystick_controller.gamepad.forward_axes_index ) * joystick_controller.gamepad.forward_multiply * 100;
        var turn = joystick_controller.gamepad.get_axes( joystick_controller.gamepad.turn_controller_index, joystick_controller.gamepad.turn_axes_index ) * joystick_controller.gamepad.turn_multiply * 100;
        if( forward === false || turn === false )
        {
          joystick_controller.gamepad.stop();
          $( "#gamepad_info" ).html( "Gamepad lost, press start to try again" );
          next_state = 0;
        }
        else
        {
          joystick_controller.handle_input( turn, forward );
        }

        let pump_button = joystick_controller.gamepad.get_button(joystick_controller.gamepad.forward_controller_index,4);
        let spray_button = joystick_controller.gamepad.get_button(joystick_controller.gamepad.forward_controller_index,5);
        let pump_on = !!(pump_button | spray_button);
        let spray_on = !!spray_button;
        
        if (pump_on !== joystick_controller.gamepad.last_pump_on)
        {
          robot_controller.pump(pump_on);
        }
        if (spray_on !== joystick_controller.gamepad.last_spray_on)
        {
          if( spray_on )
            sprayToolUtilitiesController.startTestSpray();
            
          else
            sprayToolUtilitiesController.stopTestSpray(pump_on);
          sprayToolUtilitiesScreenController.drawTestSprayButton();    
        }
        
        joystick_controller.gamepad.last_pump_on = pump_on;
        joystick_controller.gamepad.last_spray_on = spray_on;

      }

      joystick_controller.gamepad.state = next_state;
    },

    last_pump_on: false,
    last_spray_on: false,

    get_all_axes: function()
    {
      var gps = range( 0, navigator.getGamepads().length ).map( i => {
        return navigator.getGamepads()[i];
      } );

      return gps.filter( c => {
        return c;
      } ).map( c => {
        return c.axes;
      } );
    },
    get_axes: function( c, i )
    {
      if( navigator.getGamepads()[c] === null )
        return false;
      if( navigator.getGamepads()[c].axes.length <= i )
        return false;

      return navigator.getGamepads()[c].axes[i];
    },
    get_button: function(c,i)
    {
      if( navigator.getGamepads()[c] === null )
        return false;
      if( navigator.getGamepads()[c].buttons.length <= i )
        return false;

      return navigator.getGamepads()[c].buttons[i].value;
    }
  }
};