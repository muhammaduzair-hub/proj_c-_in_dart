/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global communication_controller, robot_controller, message_controller, pop_generator, translate, math, robot_behaviour_settings_screen, popup_screen_controller */

const calibration_screen = {
  open() {
    $("#open_wheel_calibration_btn").prop("disabled",!robot_controller.robot_has_capability("wheel_calibration"));
  },
  use_constant: false,
  change_use_constant: function()
  {
    calibration_screen.use_constant = $( "#calibration_use_constant_checkbox" ).is( ':checked' );
  },
  number_of_lines: 4 * 2 + 1,
  change_number_of_lines: function()
  {
    let v = parseInt( $( "#calibration_screen_spray_calculate input[name='number_of_lines']" ).val() );
    $( "#calibration_screen_spray_calculate input[name='number_of_lines']" ).blur();
    $( "#calibration_lines_result" ).html( " = " + (4 * v + 1) );
    console.log( "changing number of lines to", (4 * v + 1) );
    calibration_screen.number_of_lines = 4 * v + 1;
    calibration_screen.start();
  }
  ,
  y_dist: 0.2,
  change_y_dist: function()
  {
    let v = parseInt( $( "#calibration_screen_spray_calculate input[name='y_dist']" ).val() );
    $( "#calibration_screen_spray_calculate input[name='y_dist']" ).blur();
    console.log( "changing y dist to", v * calibration_screen.units.convert );
    calibration_screen.y_dist = v * calibration_screen.units.convert;
  }
  ,
  v_slow: 0.5,
  v_fast_multiplier: 2, // How many times faster does high speed drive with
  get v_fast()
  {
    return calibration_screen.v_slow * calibration_screen.v_fast_multiplier;
  },
  start: function( )
  {
    $( "#calibration_screen_spray_calculate input[name='number_of_lines']" ).val( (calibration_screen.number_of_lines - 1) / 4 );
    $( "#calibration_lines_result" ).html( " = " + (calibration_screen.number_of_lines) );
    $( "#calibration_screen_spray_calculate input[name='y_dist']" ).val( calibration_screen.y_dist / calibration_screen.units.convert );

    $( "#calibration_screen_spray_calculate" ).removeClass( "gone" );

    $( "#calibration_canvas_container" ).html( '<canvas></canvas>' );

    var c = $( "#calibration_canvas_container canvas" )[0].getContext( "2d" );

    var margin_x = 100;
    var margin_y = 50;
    var t = 50;
    var x = 50;
    var y = 100;
    var N = calibration_screen.number_of_lines;

    var width = 650;
    var height = y * (N - 1) + 2 * margin_y;

    var line_length = 300;
    var line_stroke = 10;

    var arrow_height = 40;
    var arrow_width = 20;
    var arrow_stroke = 5;
    var small_arrow_width = 7;

    var measure_stroke = 1;
    var measure_from_line = 2;

    c.canvas.width = width;
    c.canvas.height = height;

    var sign = function( i )
    {
      return (i % 2 === 0 ? -1 : 1);
    }
    var k = function( i )
    {
//      return ((i + 1) > N / 3 * 1) && ((i + 1) <= N / 3 * 2) ? 2 : 1;
      return i % 4 === 2 || i % 4 === 3 ? 2 : 1;
    }
    var x_start = function( i )
    {
      return margin_x + sign( i ) * 0.5 * (x + k( i ) * t);
    }
    var x_end = function( i )
    {
      return margin_x + sign( i ) * 0.5 * (x + k( i ) * t) + line_length;
    }
    var x_mid = function( i )
    {
      return x_start( i ) + (x_end( i ) - x_start( i )) / 2;
    }
    var y_val = function( i )
    {
      return margin_y + y * i;
    }

    for( var i = 0; i < N; i++ )
    {


      // Line
      c.lineWidth = line_stroke;
      c.beginPath();
      c.moveTo( x_start( i ), y_val( i ) );
      c.lineTo( x_end( i ), y_val( i ) );
      c.stroke();

      // Arrow
      c.lineWidth = arrow_stroke;
      c.beginPath();
      c.moveTo( x_mid( i ) - sign( i ) * arrow_width / 2, y_val( i ) + arrow_height / 2 );
      c.lineTo( x_mid( i ) + sign( i ) * arrow_width / 2, y_val( i ) );
      c.lineTo( x_mid( i ) - sign( i ) * arrow_width / 2, y_val( i ) - arrow_height / 2 );
      c.stroke();

      // x-input boxes
      if( i + 1 < N )
      {
        // Line
        c.lineWidth = measure_stroke;
        c.beginPath();
        c.moveTo( x_start( i ), y_val( i ) + (line_stroke / 2 + measure_from_line) );
        c.lineTo( x_start( i ), y_val( i ) + y / 2 );
        c.lineTo( x_start( i + 1 ), y_val( i ) + y / 2 );
        c.lineTo( x_start( i + 1 ), y_val( i + 1 ) - (line_stroke / 2 + measure_from_line) );
        c.stroke();

        // Small Arrows
        c.beginPath();
        c.moveTo( x_start( i ), y_val( i ) + y / 2 );
        c.lineTo( x_start( i ) - sign( i ) * small_arrow_width, y_val( i ) + y / 2 + small_arrow_width );
        c.lineTo( x_start( i ) - sign( i ) * small_arrow_width, y_val( i ) + y / 2 - small_arrow_width );
        c.fill();
        c.beginPath();
        c.moveTo( x_start( i + 1 ), y_val( i ) + y / 2 );
        c.lineTo( x_start( i + 1 ) - sign( i + 1 ) * small_arrow_width, y_val( i ) + y / 2 + small_arrow_width );
        c.lineTo( x_start( i + 1 ) - sign( i + 1 ) * small_arrow_width, y_val( i ) + y / 2 - small_arrow_width );
        c.fill();

        // Input
        $( "#calibration_canvas_container" ).append( '<input type="tel" name="x_input_' + i + '" style="position: absolute;top:' + (y_val( i ) + y / 2 - 30 / 2) + 'px;left:' + (x_start( i + (i % 2 == 0 ? 0 : 1) ) + (Math.abs( x_start( i ) - x_start( i + 1 ) ) - 75) / 2) + 'px;width:75px;height:30px">' );
      }

      // y-input boxes
      if( i + 1 < N )
      {
        // Line
        c.lineWidth = measure_stroke;
        c.beginPath();
        c.moveTo( x_end( i ) + measure_from_line, y_val( i ) - (line_stroke / 2) );
        c.lineTo( width - margin_x, y_val( i ) - (line_stroke / 2) );
        c.lineTo( width - margin_x, y_val( i + 1 ) - (line_stroke / 2) );
        c.lineTo( x_end( i + 1 ) + measure_from_line, y_val( i + 1 ) - (line_stroke / 2) );
        c.stroke();

        // Small Arrows
        c.beginPath();
        c.moveTo( width - margin_x, y_val( i ) - (line_stroke / 2) );
        c.lineTo( width - margin_x - small_arrow_width, y_val( i ) - (line_stroke / 2) - sign( i ) * small_arrow_width );
        c.lineTo( width - margin_x + small_arrow_width, y_val( i ) - (line_stroke / 2) - sign( i ) * small_arrow_width );
        c.fill();
        c.beginPath();
        c.moveTo( width - margin_x, y_val( i + 1 ) - (line_stroke / 2) );
        c.lineTo( width - margin_x - small_arrow_width, y_val( i + 1 ) - (line_stroke / 2) - sign( i ) * small_arrow_width );
        c.lineTo( width - margin_x + small_arrow_width, y_val( i + 1 ) - (line_stroke / 2) - sign( i ) * small_arrow_width );
        c.fill();

        // Input
        $( "#calibration_canvas_container" ).append( '<input type="tel" name="y_input_' + i + '" style="position: absolute;top:' + (y_val( i ) - (line_stroke / 2) + y / 2 - 30 / 2) + 'px;left:' + (width - margin_x - 75 / 2) + 'px;width:75px;height:30px">' );

        // Line number
        $( "#calibration_canvas_container" ).append( '<h2 style="position: absolute;top:' + (y_val( i ) - (line_stroke / 2) + y / 2 - 30) + 'px;left:' + (width - margin_x - 75 / 2 + 100) + 'px;">' + (i + 1) + '</h2>' );
      }

    }

  },
  cancel: function( )
  {
    $( "#calibration_screen_spray_calculate" ).addClass( "gone" );
  },
  filter_outliers: false,
  filterOutliers: function( array )
  {
    if( !calibration_screen.filter_outliers )
      return array;

    if( array.length < 3 )
      return array;

    var m = math.mean( array );
    var s = math.std( array );
    var n = 2; // number of standard deviations
    var max_val = m + s * n;

    var a = [ ];
    array.forEach( ( v ) =>
    {
      if( math.abs( v ) < max_val )
        a.push( v );
    } );

    return a.length ? a : array;
  },
  get units()
  {
    var unit = 0;
    switch( $( "#calibration_units" ).val() )
    {
      case ("cm"):
        unit = 0.01;
        break;
      case ("m"):
        unit = 1;
        break;
      case ("feet"):
        unit = (1).foot2meter();
      case ("inces"):
        unit = (1).inch2meter();
    }
    return {
      convert: unit,
      name: $( "#calibration_units" ).val()
    };
  },
  calibration:
  {
    x: 0,
    y: 0,
    ts: 0,
    te: 0
  },
  calibrate_y: true,
  calibrate_x: true,
  calculate: function( )
  {
    $( "#calibration_screen_spray_calculate" ).append( "<p>----------</p>" );
    calibration_screen.calibrate_y = true;
    calibration_screen.calibrate_x = true;

    var unit = calibration_screen.units.convert;
    var n = calibration_screen.v_fast_multiplier;
    var v = calibration_screen.v_slow;

    var c_arr = [ ], ac_arr = [ ], abc_arr = [ ], bc_arr = [ ], y_arr = [ ], y_orig_arr = [ ], val, Ca, Cb;
    for( var i = 0; i < calibration_screen.number_of_lines - 1; i++ )
    {
      // get y-value
      val = parseFloat( $( "#calibration_canvas_container input[name='y_input_" + i + "']" ).val( ) );
      y_orig_arr.push( val );
      if( !isNaN( val ) )
        y_arr.push( math.abs( val * unit - calibration_screen.y_dist ) );

      // get x-value
      val = parseFloat( $( "#calibration_canvas_container input[name='x_input_" + i + "']" ).val( ) );
      if( !isNaN( val ) )
      {
        val *= unit;
        switch( i % 4 )
        {
          case (0):
            c_arr.push( val );
            break;
          case (1):
            ac_arr.push( val );
            break;
          case (2):
            abc_arr.push( val );
            break;
          case (3):
            bc_arr.push( val );
            break;
        }
      }
    }

    // Calculate y
    if( y_arr.length > 0 )
    {
      var y_sign = -1;
      for( var i = 0; i < y_orig_arr.length - 2; i += 2 )
      {
        if( !isNaN( y_orig_arr[i] ) && !isNaN( y_orig_arr[i + 1] ) )
        {
          if( y_orig_arr[i] < y_orig_arr[i + 1] && y_orig_arr[i + 1] > y_orig_arr[i + 2] )
          {
            y_sign = 1;
            break;
          }
        }
      }

      var y_filtered = calibration_screen.filterOutliers( y_arr );
      if( y_filtered.length > 3 )
      {
        var y_avg = math.mean( y_filtered );
        var y_cal = y_avg * y_sign;
        y_cal /= 2;

        console.log( "y_cal", y_cal );
      }
      else
      {
        $( "#calibration_screen_spray_calculate" ).append( "<p>Y NOT CALIBRATED (Too few y input)</p>" );
        calibration_screen.calibrate_y = false;
      }
    }
    else
    {
      $( "#calibration_screen_spray_calculate" ).append( "<p>Y NOT CALIBRATED (No y input)</p>" );
      calibration_screen.calibrate_y = false;
    }

    // Calculate x
    if( c_arr.concat( ac_arr ).concat( bc_arr ).concat( abc_arr ).length > 0 )
    {
      var c_filtered = calibration_screen.filterOutliers( c_arr );
      var ac_filtered = calibration_screen.filterOutliers( ac_arr );
      var bc_filtered = calibration_screen.filterOutliers( bc_arr );
      var abc_filtered = calibration_screen.filterOutliers( abc_arr );

      if( c_filtered.length > 1 && ac_filtered.length > 1 && bc_filtered.length > 1 && abc_filtered.length > 1 )
      {
        var c = math.mean( c_filtered );
        var ac = math.mean( ac_filtered );
        var bc = math.mean( bc_filtered );
        var abc = math.mean( abc_filtered );

        var a = ac - c;
        var b = bc - c;
        a = math.mean( [ a, abc - b - c ] );
        b = math.mean( [ b, abc - a - c ] );
        c = math.mean( [ c, abc - a - b ] );
        console.log( "a", a );
        console.log( "b", b );
        console.log( "c", c );
        var te = a / ((n - 1) * v);
        var ts = b / ((n - 1) * v);
        var x_cal = (c - (a + b) / (n - 1)) / 2;
        console.log( "ts", ts );
        console.log( "te", te );
        console.log( "cx", x_cal );

        // Constant calculations
        if( calibration_screen.calibration.ts !== 0 && calibration_screen.calibration.te !== 0 )
        {
          Ca = calibration_screen.calibration.te - te;
          Cb = calibration_screen.calibration.ts - ts;
          $( "#calibration_screen_spray_calculate" ).append( "<p>CONSTANT/Ca:" + Ca.toFixed( 4 ) + "</p>" );
          $( "#calibration_screen_spray_calculate" ).append( "<p>CONSTANT/Cb:" + Cb.toFixed( 4 ) + "</p>" );

          // Calibration direction correct
          Ca = -Ca;
          Cb = -Cb;
        }
      }
      else
      {
        $( "#calibration_screen_spray_calculate" ).append( "<p>TIME AND X NOT CALIBRATED (Too few x input)</p>" );
        calibration_screen.calibrate_x = false;
      }
    }
    else
    {
      $( "#calibration_screen_spray_calculate" ).append( "<p>TIME AND X NOT CALIBRATED (No x input)</p>" );
      calibration_screen.calibrate_x = false;
    }
    var ts_cal = -ts;
    var te_cal = -te;

    // Save calibration internally
    if( calibration_screen.calibrate_y )
    {
      calibration_screen.calibration.y += y_cal;
      $( "#calibration_screen_spray_calculate" ).append( "<p>user/tool_calibrate_y: " + calibration_screen.calibration.y.toFixed( 4 ) + "</p>" );
    }
    if( calibration_screen.calibrate_x )
    {
      calibration_screen.calibration.x += x_cal;
      calibration_screen.calibration.ts += ts_cal + (calibration_screen.use_constant && Cb ? Cb : 0);
      calibration_screen.calibration.te += te_cal + (calibration_screen.use_constant && Ca ? Ca : 0);
      $( "#calibration_screen_spray_calculate" ).append( "<p>user/tool_calibrate_x: " + calibration_screen.calibration.x.toFixed( 4 ) + "</p>" );
      $( "#calibration_screen_spray_calculate" ).append( "<p>user/spray_time_offset_start: " + calibration_screen.calibration.ts.toFixed( 4 ) + "</p>" );
      $( "#calibration_screen_spray_calculate" ).append( "<p>user/spray_time_offset_stop: " + calibration_screen.calibration.te.toFixed( 4 ) + "</p>" );
    }

    // Save calibration to robot
    calibration_screen.save_calibration_to_robot();

  },

  save_calibration_to_robot: function()
  {
    // Save calibration to robot
    var data = {};
    if( calibration_screen.calibrate_y )
      data.tool_calibrate_y = calibration_screen.calibration.y;
    if( calibration_screen.calibrate_x )
    {
      data.tool_calibrate_x = calibration_screen.calibration.x;
      data.spray_time_offset_start = calibration_screen.calibration.ts;
      data.spray_time_offset_stop = calibration_screen.calibration.te;
    }
    robot_controller.update_user_params( data, "all" );
    robot_behaviour_settings_screen.pop_up_once( );
  },
  got_tool_transform: function( )
  {
    if( !robot_behaviour_settings_screen.user_params["tool_calibrate_x"] || !robot_behaviour_settings_screen.user_params["tool_calibrate_y"] )
      return;
    if( !robot_behaviour_settings_screen.user_params["spray_time_offset_start"] || !robot_behaviour_settings_screen.user_params["spray_time_offset_stop"] )
      return;

    var tx = robot_behaviour_settings_screen.user_params["tool_calibrate_x"].current;
    var ty = robot_behaviour_settings_screen.user_params["tool_calibrate_y"].current;

    var s_start = robot_behaviour_settings_screen.user_params["spray_time_offset_start"].current;
    var s_stop = robot_behaviour_settings_screen.user_params["spray_time_offset_stop"].current;
    
    $( "#calibration_screen_spray_calculate #tool_calibrate_x" ).val( tx );
    $( "#calibration_screen_spray_calculate #tool_calibrate_y" ).val( ty );
    $( "#calibration_screen_spray_calculate #unadjusted_tool_calibrate_x" ).val( tx );
    $( "#calibration_screen_spray_calculate #unadjusted_tool_calibrate_y" ).val( ty );

    $( "#calibration_screen_spray_calculate #spray_time_offset_start" ).val( s_start );
    $( "#calibration_screen_spray_calculate #spray_time_offset_stop" ).val( s_stop );
    $( "#calibration_screen_spray_calculate #unadjusted_offset_start" ).val( s_start );
    $( "#calibration_screen_spray_calculate #unadjusted_offset_stop" ).val( s_stop );
  },
  resetAdjust() {
    const transformX = $("#calibration_screen_spray_calculate #unadjusted_tool_calibrate_x").val();
    const sprayOffsetStart = $("#calibration_screen_spray_calculate #unadjusted_offset_start").val();
    const sprayOffsetStop = $("#calibration_screen_spray_calculate #unadjusted_offset_stop").val();

    $("#calibration_screen_spray_calculate #tool_calibrate_x").val(transformX);
    $("#calibration_screen_spray_calculate #spray_time_offset_start").val(sprayOffsetStart);
    $("#calibration_screen_spray_calculate #spray_time_offset_stop").val(sprayOffsetStop);
  },
  calculateAdjustedX(seventyPercent=false) {
    const multiplier = seventyPercent ? 0.7 : 1.0;
    const transformX = $("#calibration_screen_spray_calculate #unadjusted_tool_calibrate_x").val();
    const transformY = $("#calibration_screen_spray_calculate #unadjusted_tool_calibrate_y").val();
    const sprayOffsetStart = $("#calibration_screen_spray_calculate #unadjusted_offset_start").val();
    const sprayOffsetStop = $("#calibration_screen_spray_calculate #unadjusted_offset_stop").val();
    const adjOffsetStart = sprayOffsetStart - (transformX * multiplier);
    const adjOffsetStop = sprayOffsetStop - (transformX * multiplier);

    $("#calibration_screen_spray_calculate #tool_calibrate_x").val(0);
    $("#calibration_screen_spray_calculate #tool_calibrate_y").val(transformY);
    $("#calibration_screen_spray_calculate #spray_time_offset_start").val(adjOffsetStart.toFixed(4));
    $("#calibration_screen_spray_calculate #spray_time_offset_stop").val(adjOffsetStop.toFixed(4));
  },
  save_tool_calibrate: function()
  {
    var data = {};
    data.tool_calibrate_x = parseFloat( $( "#calibration_screen_spray_calculate #tool_calibrate_x" ).val() );
    data.tool_calibrate_y = parseFloat( $( "#calibration_screen_spray_calculate #tool_calibrate_y" ).val() );
    data.spray_time_offset_start = parseFloat( $( "#calibration_screen_spray_calculate #spray_time_offset_start" ).val() );
    data.spray_time_offset_stop = parseFloat( $( "#calibration_screen_spray_calculate #spray_time_offset_stop" ).val() );

    robot_controller.update_user_params( data, "all" );
    robot_behaviour_settings_screen.pop_up_once( );
  },
  reset_calibration: function()
  {
    calibration_screen.calibration.x = 0;
    calibration_screen.calibration.y = 0;
    calibration_screen.calibration.ts = 0;
    calibration_screen.calibration.te = 0;

    // Save calibration to robot
    calibration_screen.save_calibration_to_robot();

    calibration_screen.start();
    $( "#calibration_screen_spray_calculate" ).append( "<p>---------- RESET ----------</p>" );
  },
  get_result( dst, dsl, d )
  {

    dst = -dst / (0.5 - 2.0);
    dsl = -dsl / (0.5 - 2.0);
    var d1 = (d - (0.5 * dst + 0.5 * dsl)) / 2;
    var d2 = (-d - (0.5 * dst + 0.5 * dsl)) / 2;
    return [ dst, dsl, d1, d2 ];
  }

  ,
  inter: '',
  count: 0,
  start_infinite: function( print )
  {
    if( calibration_screen.inter )
      clearInterval( calibration_screen.inter );
    if( print )
    {
      calibration_screen.inter = setInterval( function()
      {
        calibration_screen.test_random( true );
      }, 1 );
    }
    else
      calibration_screen.inter = setInterval( calibration_screen.test_random, 1 );
  },
  stop_infinite: function( )
  {
    clearInterval( calibration_screen.inter );
  }
  ,
  test_random: function( print )
  {
    var data = calibration_screen.generate_random( );
    var result = calibration_screen.get_result( data[1][0], data[1][1], data[1][2] );
    var corr1 = data[0][0].veryclose( result[0] );
    var corr2 = data[0][1].veryclose( result[1] );
    var corr3 = data[0][2].veryclose( result[2] );
    var corr4 = data[0][2].veryclose( result[3] );
    var first = corr1 && corr2 && corr3;
    var second = corr1 && corr2 && corr4;
    var one_correct = first || second;
    if( !one_correct )
    {
      console.log( data[0], result );
    }
    else if( print )
    {
      if( first )
        console.log( 1 );
      else
        console.log( 2, data );
    }
    calibration_screen.count++;
  }

  ,
  generate_random( )
  {
    var dx = ((Math.random( ) * 2 - 1) / 100) * 2;
    var dst = Math.random( ) / 10;
    var dsl = Math.random( ) / 10;
    return [ [ dst, dsl, dx ], calibration_screen.get_parameters( dx, dst, dsl ) ];
  },
  get_parameters( dx, dst, dsl )
  {
    var x_start_05 = dx + 0.5 * dst;
    var x_start_20 = dx + 2.0 * dst;
    var x_end_05 = -dx - 0.5 * dsl;
    var x_end_20 = -dx - 2.0 * dsl;
    var dx_start = x_start_20 - x_start_05;
    var dx_end = x_end_05 - x_end_20;
    var diff = Math.abs( x_start_05 - x_end_05 );
    var negative = diff < 0;
    return [ dx_start, dx_end, diff, negative ];
  }


  ,
  show_calibrator_popup: false
  ,
  in_test_mode: false
  ,
  got_antenna_calibration_info: function( data, server )
  {
    data.state = parseInt( data.state );
    if( data.lst_result )
      data.lst_result = JSON.parse( data.lst_result );
    console.log( data, server );

    if( calibration_screen.show_calibrator_popup )
    {
      if( data.state >= 80 )
      {
        var buttons = [ new PopButton( translate["OK"], function()
          {
            pop_generator.close();
            calibration_screen.show_calibrator_popup = false;
          }, "dark" ) ];
        var info_msg = "";
        if( data.state < 100 )
        {
          info_msg = "Result;<br>";
          if( calibration_screen.in_test_mode )
          {
            info_msg += "x error:" + data.lst_result[0] + "<br>";
            info_msg += "y error:" + data.lst_result[1] + "<p> </p>";
          }
          else
          {
            info_msg += "New x offset:" + data.lst_result[0] + "<br>";
            info_msg += "New y offset:" + data.lst_result[1] + "<p> </p>";
          }
        }
        pop_generator.create_popup( data.lst_msg, info_msg, buttons );
      }
      else
      {
        var buttons = [ new PopButton( translate["Cancel"], calibration_screen.stop_antenna_calibration, "dark" ) ];
        pop_generator.create_popup( "Iteration " + (parseInt( data.iteration ) + 1) + "/" + calibration_screen.number_of_iterations, data.lst_msg, buttons );
      }
    }
  }
  ,
  ask_start_antenna_calibration: function( test_mode = false)
  {
    //header, body, ok_text, cancel_text, ok_callback, cancel_callback
    popup_screen_controller.confirm_popup( "Do you want to start antenna calibration?", "Make sure there is room for the robot to drive forward aprox. 3 meters", "Yes", "No", function()
    {
      calibration_screen.count_down_start( test_mode );
    }, popup_screen_controller.close );
  },
  count_down_start: function( test_mode = false)
  {

    var count_down = 3;
    var count_down_timer = setInterval( function()
    {
      count_down -= 1;
      if( count_down === 0 )
      {
        calibration_screen.start_antenna_calibration( test_mode );
        clearInterval( count_down_timer );
      }
      else
      {
        popup_screen_controller.confirm_popup( "Starting antenna calibration in", count_down, "Cancel", undefined, function()
        {
          popup_screen_controller.close();
          clearInterval( count_down_timer );
        } );
      }
    }, 1000 );

    popup_screen_controller.confirm_popup( "Starting antenna calibration in", count_down, "Cancel", undefined, function()
    {
      popup_screen_controller.close();
      clearInterval( count_down_timer );
    } );
  },
  number_of_iterations: 1,
  start_antenna_calibration: function( test_mode = false)
  {
    calibration_screen.in_test_mode = test_mode;
    if( robot_controller.chosen_robot.online )
    {
      communication_controller.send( "start_auto_antenna_calibration", {
        robot: robot_controller.chosen_robot_id,
        start: true,
        test: test_mode,
        iterations: calibration_screen.number_of_iterations
      }, "all" );

      calibration_screen.show_calibrator_popup = true;
      var buttons = [ new PopButton( translate["Cancel"], calibration_screen.stop_antenna_calibration, "dark" ) ];
      //header_text, body_text, buttons, outside_click_callback, popup_id
      pop_generator.create_popup( "Starting calibration", "", buttons, false, "antenna_calibration_status_popup" );
    }
    else
    {
      // header, body, ok_text, cancel_text, ok_callback, cancel_callback
      popup_screen_controller.confirm_popup( "Robot not online", "", "ok", "", function()
      {
        popup_screen_controller.close();
      } );
  }


  },

  stop_antenna_calibration: function()
  {
    communication_controller.send( "start_auto_antenna_calibration", {
      robot: robot_controller.chosen_robot_id,
      start: false,
      test: false
    }, "all" );
  }

};

function infinite_antenna_calib()
{
  calibration_screen.start_antenna_calibration( true );
  last_state = 0;
  var handle_info = ( data, server ) => {
    if( data.state === 80 && last_state !== 80 )
    {
      console.log( "calibration result = ", data.lst_result );
      calibration_screen.start_antenna_calibration( true );
    }
    if( data.state >= 100 && last_state < 100 )
    {
      message_controller.events.remove_callback( "antenna_calibration_info", handle_info );
    }
    last_state = data.state;
  };


  message_controller.events.add_callback( "antenna_calibration_info", handle_info );
}

var stress_test = {
  current_pump_interval: null,
  current_move_interval: null,
  current_update_interval: null,
  current_timeout: null,
  max_iterations: 0,
  has_run_times: 0,
  speed: 3,
  onTime: 0.1,
  offTime: 0.1,
  isRunning: false,
  prematurely_ended: false,
  completed: false,
  
  open: ()=> {
    $("#inp_stress_test_iterations").val(90);
    $( "#stress_test_screen" ).removeClass( "gone" );
    $('#stress_test_robot_id').text("Robot "+robot_controller.chosen_robot_id);
    stress_test.current_update_interval = setInterval(()=>{
      stress_test.updateStatus();
    }, 1000); // Every 1 seconds
    
    if (AppType !== APP_TYPE.TinyLineMarker) {
      $('#btn_stress_test_start').addClass('gone');
      $('#inp_stress_test_iterations').addClass('gone');
      stress_test.toReadout('Stress test only supports TinyLineMarker');
    }
    else {
      $('#btn_stress_test_start').removeClass('gone');
      $('#inp_stress_test_iterations').removeClass('gone');
      stress_test.getRobotCalibration();
    }
  },
  close: ()=> {
    clearInterval(stress_test.current_update_interval);
    if (stress_test.isRunning) {
      stress_test.end(true);
    }
    $( "#stress_test_screen" ).addClass( "gone" );
  },
  begin: ()=> {
    if (robot_controller.user_state === TopStates.MANUAL) {
      if (stress_test.setIterations()) {
        stress_test.resetTest();
        stress_test.isRunning = true;
        robot_controller.user_state = TopStates.AUTOMATIC;
        stress_test.toggleStartButton();
        stress_test.runPumpTest();
        stress_test.runIteration();
      } 
      else {
        stress_test.toReadout("Amount of iterations must be at least 1");  
      }
    }
    else {
      stress_test.toReadout(`Cannot begin - robot is not in manual mode.`);
    }    
  },
  setIterations: ()=> {
    var input;
    input = parseInt($('#inp_stress_test_iterations').val());
    if (input > 0 && Number.isInteger(input)) {
      $('#inp_stress_test_iterations').val(input);
      stress_test.max_iterations = input;
      return true;      
    }
    else {
      $('#inp_stress_test_iterations').val(90);
      return false;
    }
  },
  runIteration: ()=>{
    stress_test.updateStatus(true);
    stress_test.toReadout("Moving forward");
    stress_test.loadMoveInterval(1, 0);
    stress_test.current_timeout = setTimeout(()=>{
      stress_test.updateStatus(true);
      stress_test.toReadout("Turning left");
      stress_test.loadMoveInterval(0, 1);
      stress_test.current_timeout = setTimeout(()=>{
        stress_test.updateStatus(true);
        stress_test.toReadout("Turning right");
        stress_test.loadMoveInterval(0, -1);
        stress_test.current_timeout = setTimeout(()=>{
          stress_test.updateStatus(true);
          stress_test.toReadout("Moving backwards");
          stress_test.loadMoveInterval(-1, 0);
          stress_test.current_timeout = setTimeout(()=>{
            clearInterval(stress_test.current_move_interval);
            stress_test.has_run_times++;
            stress_test.updateStatus(true);
            if (stress_test.has_run_times == stress_test.max_iterations) {
              stress_test.end();
            }
            else {
              stress_test.toReadout(`Beginning next iteration...`);
              stress_test.current_timeout = setTimeout(()=>{
                stress_test.runIteration();
              }, 2000);
            }
          }, 1000 * 5);
        }, 1000 * 5);
      }, 1000 * 5);
    }, 1000 * 5);
  },
  end: (premature=false)=> {
    clearInterval(stress_test.current_move_interval);
    clearTimeout(stress_test.current_timeout);
    stress_test.stopPumpTest();
    if (premature) {
      stress_test.prematurely_ended = true;
    }
    else {
      stress_test.completed = true;
    }
    if (stress_test.isRunning) {  
      stress_test.toggleStartButton();
      stress_test.isRunning = false;
      robot_controller.user_state = TopStates.MANUAL;
      stress_test.updateStatus();
    }
  },
  resetTest() {
    stress_test.has_run_times = 0;
    stress_test.isRunning = false;
    stress_test.prematurely_ended = false;
    stress_test.completed = false;
  },
  runPumpTest: ()=>{
    var frequency = 3; // Seconds
    var count = 0; // Amount

    robot_controller.pump(true, true);

    stress_test.current_pump_interval = setInterval(()=>{
      if (count % 2 === 0) {
        robot_controller.spray( 1000 * frequency, true);
      }
      count++;
    }, 1000 * frequency);
  },
  stopPumpTest: ()=>{
    clearInterval(stress_test.current_pump_interval);
    robot_controller.spray(1);
    robot_controller.pump(false, true);
  },
  loadMoveInterval: (speed, turn)=>{
    clearInterval(stress_test.current_move_interval);
    stress_test.current_move_interval = setInterval(() => {         
      var msg = {x: 0, y: 0, robot: robot_controller.chosen_robot_id};
      msg.y = (stress_test.speed / parseFloat( robot_controller.config["velocity_manual"] )) * 100 * turn;  
      msg.x = (stress_test.speed / parseFloat( robot_controller.config["velocity_manual"] )) * 100 * speed;
      stress_test.send(msg)
    }, 1000 * 1/20);
  },
  send: (msg)=> {
    if (joystick_controller.use_internet) {
      communication_controller.send("move", msg, "cloud", 0)
    } else {
      communication_controller.send("move", msg, "blue", 0)
    }
  },
  updateStatus: (clear=false)=>{
    if (clear) {
      stress_test.clearStatus();
    }
    const robot_state = stress_test.getRobotState();

    $('#stress_test_robot_state').text(`${robot_state[0]}`);
    if (robot_state[1]) {
      $('#stress_test_robot_error').removeClass( "gone" );
      let html = ""
      robot_state[1].forEach((entry)=>{
        html += entry + "<br>";
      });
      $('#stress_test_robot_error').html(html);
    } else {
      $('#stress_test_robot_error').addClass( "gone" );
    }

    $('#stress_test_screen_state').text(`${stress_test.getScreenState()}`);
    $('#stress_test_status').text(`${stress_test.getRunState()}`);
    $('#stress_test_has_run_times').text(`${stress_test.has_run_times}`);
  },
  getRobotState() {
    let robotState = [];

    Object.keys(TopStates).forEach((key)=>{
      if (TopStates[key] === robot_controller.state_top) {
        robotState[0] = key;
      }
    });

    if (!(robot_controller.top_state === 2 || robot_controller.top_state === 3)) {
      robotState[1] = robot_controller.display_lines;
    }
    return robotState;
  },
  getRobotCalibration() {
    const transformX = robot_behaviour_settings_screen.user_params["tool_calibrate_x"].current;
    const transformY = robot_behaviour_settings_screen.user_params["tool_calibrate_y"].current;

    const sprayOffsetStart = robot_behaviour_settings_screen.user_params["spray_time_offset_start"].current;
    const sprayOffsetStop = robot_behaviour_settings_screen.user_params["spray_time_offset_stop"].current;

    $( "#stress_test_calibration_tool_x_readout" ).text(transformX);
    $( "#stress_test_calibration_tool_y_readout" ).text(transformY);
    $( "#stress_test_spray_offset_start_readout" ).text(sprayOffsetStart);
    $( "#stress_test_spray_offset_stop_readout" ).text(sprayOffsetStop);
  },
  getScreenState() {
    if (!screen_lock_controller._automaticLockIsOn) {
      return "Unlocked";
    }
    else {
      return "Locked";
    }
  },
  getRunState() {
    let runState = "Not started";
    if (stress_test.isRunning) {
      runState = "Running";
    }
    if (stress_test.prematurely_ended) {
      return "User abort";
    }
    if (stress_test.completed) {
      return "Completed";
    }
    return runState;
  },
  toReadout: (msg)=> {
    var html = '<p>'+msg+'</p>';
    console.log(msg);
    $(`#stress_test_readout`).append(html);
  },
  clearStatus: ()=> {
    $(`#stress_test_readout`).empty();
  },
  toggleStartButton: ()=>{
    if ($('#btn_stress_test_start').text() === "START") {
      $('#btn_stress_test_start').css("background-color", "#04AA6D");
      $('#btn_stress_test_start').text("RUNNING");
      $('#btn_stress_test_start').prop('disabled', true);
    } else {
      $('#btn_stress_test_start').css("background-color", "transparent");
      $('#btn_stress_test_start').text("START");
      $('#btn_stress_test_start').prop('disabled', false);
    }
  }
}

var antenna_calibration_screen =
{
  current_config: {translate_x: 0, translate_y: 0},
  open: function()
  {
    $( "#calibrate_antenna_screen #iterations_input" ).val( calibration_screen.number_of_iterations );
    $( "#calibrate_antenna_screen" ).removeClass( "gone" );
  },
  close: function()
  {
    $( "#calibrate_antenna_screen" ).addClass( "gone" );
  },
  start: function( test_mode )
  {
    calibration_screen.ask_start_antenna_calibration( test_mode );
  },
  change_iteration_count: function()
  {
    var new_iteration_count = parseInt( $( "#calibrate_antenna_screen #iterations_input" ).val() );
    calibration_screen.number_of_iterations = new_iteration_count;
  },
  change_x_translation: function()
  {
    var new_translate_x = parseFloat( $( "#calibrate_antenna_screen #antenna_x_translation" ).val() );
    var new_translate_y = parseFloat( $( "#calibrate_antenna_screen #antenna_y_translation" ).val() );
  },
  change_y_translation: function()
  {
    var new_translate_x = parseFloat( $( "#calibrate_antenna_screen #antenna_x_translation" ).val() );
    var new_translate_y = parseFloat( $( "#calibrate_antenna_screen #antenna_y_translation" ).val() );
  },
  save_new_translation: function()
  {

    popup_screen_controller.pop_up_once( "Saving new translations", "updated_antenna_transform" );

    var new_translate_x = parseFloat( $( "#calibrate_antenna_screen #antenna_x_translation" ).val() );
    var new_translate_y = parseFloat( $( "#calibrate_antenna_screen #antenna_y_translation" ).val() );

    communication_controller.send( "set_antenna_transform", {
      robot: robot_controller.chosen_robot_id,
      new_antenna_x: new_translate_x,
      new_antenna_y: new_translate_y
    }, "all" );


  },
  got_new_translations: function( data )
  {
    console.log( data );
    antenna_calibration_screen.current_config = data;

    $( "#calibrate_antenna_screen #antenna_x_translation" ).val( data.translate_x );
    $( "#calibrate_antenna_screen #antenna_y_translation" ).val( data.translate_y );
  }
};

const wheel_calibration_screen =
{
  current_config: {translate_x: 0, translate_y: 0},
  open()
  {
    message_controller.events.add_callback("wheel_calibration_info",wheel_calibration_screen.gotCalibrationInfo);
    message_controller.events.add_callback("wheel_calibration_test_info",wheel_calibration_screen.gotTestInfo);

    $( "#calibrate_wheel_screen" ).removeClass( "gone" );
  },
  close()
  {
    message_controller.events.remove_callback("wheel_calibration_info",wheel_calibration_screen.gotCalibrationInfo);
    message_controller.events.remove_callback("wheel_calibration_test_info",wheel_calibration_screen.gotTestInfo);

    $( "#calibrate_wheel_screen" ).addClass( "gone" );
  },
  startCalibration()
  {
    communication_controller.send("start_wheel_calibration");
    $("#calibrate_wheel_test_start").prop('disable',true);
  },
  startTest()
  {
    communication_controller.send("start_wheel_calibration_test");
    $("#calibrate_wheel_test_info").prop('disable',true);
  },
  gotCalibrationInfo(msg)
  {
    $("#calibrate_wheel_test_start").prop('disable',false);
    $("#calibrate_wheel_status").text(msg.status);
    $("#calibrate_wheel_motor_encoder_offset").text(msg.motor_encoder_offset);
    $("#calibrate_wheel_pwm_linearity").text(msg.pwm_linearity);
    $("#calibrate_wheel_closed_loop1").text(msg.closed_loop1);
    $("#calibrate_wheel_closed_loop2").text(msg.closed_loop2);
    $("#calibrate_wheel_encoder_calibration").text(msg.encoder_calibration);
    $("#calibrate_wheel_errors").text(msg.errors);
  },
  gotTestInfo(msg)
  {
    $("#calibrate_wheel_test_info").prop('disable',false);
    $("#calibrate_wheel_test_info").text(msg);
  }
};


var imu_calibration_screen = {
  seconds_to_sample: 0.5,
  open: function()
  {
    $( "#reset_imu_screen #seconds_to_sample_input" ).val( imu_calibration_screen.seconds_to_sample );
    $( "#reset_imu_screen" ).removeClass( "gone" );

  },
  close: function()
  {
    $( "#reset_imu_screen" ).addClass( "gone" );
  },
  start: function()
  {
    imu_calibration_screen.reset_robot_imu();
  },
  change_sample_time: function()
  {
    imu_calibration_screen.seconds_to_sample = parseFloat( $( "#reset_imu_screen #seconds_to_sample_input" ).val() );
    imu_calibration_screen.seconds_to_sample = parseInt( imu_calibration_screen.seconds_to_sample * 1000 ) / 1000;
  },
  reset_robot_imu: function()
  {
    // header, body, ok_text, cancel_text, ok_callback, cancel_callback
    popup_screen_controller.confirm_popup( "IMU calibration", "This will calibrate the imu on the robot. <br> Please make sure the robot is on a completely level surface", "Calibrate", "cancel", function()
    {
      let samples = parseInt( imu_calibration_screen.seconds_to_sample * 100 );
      communication_controller.send( 'start_imu_calibration', {robot: robot_controller.chosen_robot.id, samples: samples}, "all", 10 );
      popup_screen_controller.close();
    }, popup_screen_controller.close );
  },
  got_imu_status: function( msg )
  {
    $( "#reset_imu_screen #imu_calibration_status" ).html( msg.state );

    console.log( msg );
    /*
     {state: "Collecting samples", robot: 8}
     calibration_screen.js:656 {state: "Saving new matrix", robot: 8}
     */
  },
  got_imu_matrix: function( msg )
  {
    console.log( msg );

    function format_number( num, size )
    {
      var s = num + "";
      if( s.length === 1 )
        s = s + ".";
      if( num >= 0 )
        s = " " + s;
      while( s.length < size )
        s = s + "0";
      return s;
    }

    msg.rotation = msg.rotation.map( l => {
      return l.map( v => {
        return format_number( v, 9 );
      } );
    } );

    $( "#reset_imu_screen #imu_rotation_matrix_row1" ).html( "[" + msg.rotation[0] + "]" );
    $( "#reset_imu_screen #imu_rotation_matrix_row2" ).html( "[" + msg.rotation[1] + "]" );
    $( "#reset_imu_screen #imu_rotation_matrix_row3" ).html( "[" + msg.rotation[2] + "]" );

    /*
     
     #reset_imu_screen #imu_rotation_matrix_row1
     #reset_imu_screen #imu_rotation_matrix_row2
     #reset_imu_screen #imu_rotation_matrix_row3
     
     {rotation: Array(3), robot: 8}
     rotation: Array(3)
     0: (3) [-0.999941, 0.000636, 0.010848]
     1: (3) [0, -0.998284, 0.058554]
     2: (3) [0.010867, 0.05855, 0.998225]
     length: 3
     __proto__: Array(0)
     robot: 8
     
     */
  }
};


$(()=>
{
  message_controller.events.add_callback( "antenna_calibration_info", calibration_screen.got_antenna_calibration_info );

  message_controller.events.add_callback( "imu_calibration_info", imu_calibration_screen.got_imu_status );
  message_controller.events.add_callback( "imu_info", imu_calibration_screen.got_imu_matrix );
  message_controller.events.add_callback( "antenna_info", antenna_calibration_screen.got_new_translations );


  robot_behaviour_settings_screen.user_config_event.add_callback( "tool_calibrate_x", calibration_screen.got_tool_transform );
  robot_behaviour_settings_screen.user_config_event.add_callback( "tool_calibrate_y", calibration_screen.got_tool_transform );
  robot_behaviour_settings_screen.user_config_event.add_callback( "spray_time_offset_start", calibration_screen.got_tool_transform );
  robot_behaviour_settings_screen.user_config_event.add_callback( "spray_time_offset_stop", calibration_screen.got_tool_transform );

  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "calibration_menu" )
    {
      calibration_screen.open();
    }
  } );

} );