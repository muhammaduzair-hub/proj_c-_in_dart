/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global five_degrees_equal, robot_controller, login_screen_controller */

class AthleticsRunningTrack extends Job
{  
  static template_type = "Athletics"; // Translateable
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options["fast_test"].val = false;
    this.options["normal_test"].val = true;
    this.options["full_test"].val = true;
    this.options["Ramps_length"] = {
      configurable: true,
      name: "Ramps on lanes",
      val: 5.0,
      type: "float"
    };

    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };

    this.options.Length = {
      adjustable: true,
      name: "Length",
      val: 0,
      get max()
      {
        return (((this_class.options.Width.min / 2) + this_class.options.FirstRunningLaneOffset.val + (this_class.options.LineWidth.val / 2)) * 2 * Math.PI - this_class.options.RunningLength.val) / -2;
      },
      min: 0.001,
      type: "float"
    };
    this.options.Width = {
      adjustable: true,
      name: "Width",
      get val()
      {
        var first_running_lane_diameter = (this_class.options.RunningLength.val - 2 * this_class.options.Length.val) / Math.PI;
        return ((first_running_lane_diameter / 2) - this_class.options.FirstRunningLaneOffset.val - this_class.options.LineWidth.val / 2) * 2;
      },
      set val( new_width )
      {

        var new_length = (((new_width / 2) + this_class.options.FirstRunningLaneOffset.val + (this_class.options.LineWidth.val / 2)) * 2 * Math.PI - this_class.options.RunningLength.val) / -2;

        this_class.options.Length.val = new_length;

      },
      get max()
      {
        var first_running_lane_diameter = (this_class.options.RunningLength.val - 2 * this_class.options.Length.min) / Math.PI;
        return ((first_running_lane_diameter / 2) - this_class.options.FirstRunningLaneOffset.val - this_class.options.LineWidth.val / 2) * 2;
      },
      min: 0.001,
      type: "float",
      dont_save: true
    };

    this.options.RunningLength = {
      name: "Running length",
      val: 200,
      type: "float",
      dontsave: true
    };
    this.options.TrackWidth = {
      configurable: true,
      name: "TrackWidth",
      val: 1.22,
      type: "float"
    }; // inner
    this.options.Lanes = {
      configurable: true,
      name: "Lanes",
      val: 1,
      type: "float",
      units: "number"
    };
    this.options.FirstRunningLaneOffset = {
      name: "RunningLaneOffset",
      val: 0.3,
      type: "float",
      dontsave: true
    };
    this.options.RunningLaneOffset = {
      name: "RunningLaneOffset",
      val: 0.2,
      type: "float",
      dontsave: true
    };

    this.options.lines = {
      val: [ ],
      dontsave: true
    };

    this.options.TwoWay = {
      configurable: true,
      name: "TwoWay",
      val: false,
      type: "bool"
    };

    this.options.DrawSprint = {
      name: "100m sprint",
      val: false,
      type: "bool"
    };
    this.options.SprintLength = {
      configurable: false,
      name: "Sprint length",
      val: 100,
      type: "float",
      prev_sibling: "DrawSprint"
    };
    
    this.options.DrawSprint50 = {
      configurable:true,
      name: "50m sprint",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint60"
    };
    this.options.SprintLength50 = {
      configurable: false,
      name: "Sprint length",
      val: 50,
      type: "float",
      prev_sibling: "DrawSprint50"
    };
    
    this.options.DrawSprint60 = {
      configurable:true,
      name: "60m sprint",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint70"
      
    };
    this.options.SprintLength60 = {
      configurable: false,
      name: "Sprint length",
      val: 60,
      type: "float",
      prev_sibling: "DrawSprint60"
    };
    
    this.options.DrawSprint70 = {
      configurable:true,
      name: "70m sprint",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint80"
    };
    this.options.SprintLength70 = {
      configurable: false,
      name: "Sprint length",
      val: 70,
      type: "float",
      prev_sibling: "DrawSprint70"
    };
    
    this.options.DrawSprint80 = {
      configurable:true,
      name: "80m sprint",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint90"
    };
    this.options.SprintLength80 = {
      configurable: false,
      name: "Sprint length",
      val: 80,
      type: "float",
      prev_sibling: "DrawSprint80"
    };

    
    this.options.DrawSprint90 = {
      configurable:true,
      name: "90m sprint",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint"
    };
    this.options.SprintLength90 = {
      configurable: false,
      name: "Sprint length",
      val: 90,
      type: "float",
      prev_sibling: "DrawSprint90"
    };

    this.options.SprintExtra = {
      get configurable()
      {
        return this_class.options.DrawSprint.val || this_class.options.DrawSprint50.val || this_class.options.DrawSprint60.val || this_class.options.DrawSprint70.val || this_class.options.DrawSprint80.val || this_class.options.DrawSprint90.val;
      },
      prev_sibling: "DrawSprint",
      name: "Sprint extra",
      val: 10,
      type: "float"
    };
    this.options.ExistingSprintLength = {
      name: "ExistingSprintLength",
      type: "float",
      val: 0
    }
    this.options.dashedSprint = {
      name: "Dashed sprint lines",
      type: "bool",
      prev_sibling: "DrawSprint",
      get configurable()
      {
        return this_class.options.DrawSprint.val || this_class.options.DrawSprint50.val || this_class.options.DrawSprint60.val || this_class.options.DrawSprint70.val || this_class.options.DrawSprint80.val || this_class.options.DrawSprint90.val;
      },
      val: true
    }

    this.options.periodicallyRecalibrateRobot = {
      name: "Periodically recalibrate Robot",
      _val: false,
      existingJobDefault: false,
      get val () {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.calibrationDistance.configurable = true;
          this_class.options.waitWhileRecalibrating.configurable = true;
          this_class.options.recalibrationWaitTime.configurable = this_class.options.waitWhileRecalibrating.val ? true : false;
        } else {
          this_class.options.calibrationDistance.configurable = false;
          this_class.options.waitWhileRecalibrating.configurable = false;
          this_class.options.recalibrationWaitTime.configurable = false;
        }
      },
      type: "bool",
      configurable: true,
      adjustable: false,
      prev_sibling: "TwoWay"
    }
    this.options.calibrationDistance = {
      name: "Calibration distance",
      val: 15,
      existingJobDefault: 15,
      type: "int",
      configurable: false,
      adjustable: false,
      prev_sibling: "periodicallyRecalibrateRobot"
    }
    this.options.waitWhileRecalibrating = {
      name: "Wait while recalibrating",
      _val: false,
      get val () {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.recalibrationWaitTime.configurable = true;
        } else {
          this_class.options.recalibrationWaitTime.configurable = false;
        }
      },
      existingJobDefault: false,
      type: "bool",
      configurable: false,
      adjustable: false,
      prev_sibling: "calibrationDistance"
    }
    this.options.recalibrationWaitTime = {
      name: "Wait time",
      val: 60,
      existingJobDefault: 60,
      type: "int",
      configurable: false,
      adjustable: false,
      prev_sibling: "waitWhileRecalibrating"
    }
  }
    
  static get layout_methods()
  {
    return {
      "run_inner_corner,side": 2,
      "run_inner_two_corners,side": 3,
      "run_outer_corner,side": 2,
      "run_outer_two_corners,side": 3,
      "free_hand": 0
    };
  }

  get info_options()
  {
    return [ ];
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "run_inner_corner,side":
        points = this.from2innerPointsTo4corners( this.points );
        break;
      case "run_outer_corner,side":
        points = this.from2outerPointsTo4corners( this.points );
        break;
      case "run_inner_two_corners,side":
        points = this.from3innerPointsTo4corners( this.points );
        break;
      case "run_outer_two_corners,side":
        points = this.from3outerPointsTo4corners( this.points );
        break;
      case "free_hand":
        points = this.fromCenterTo4Corners( this.points[0] );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  get center()
  {
    var p = this.drawing_points;
    var back_line_1 = new Line( p[0], p[1] );
    var e1 = back_line_1.middle; // between goal 1
    var e2 = new Line( p[2], p[3] ).middle;
    var m = new Line( e1, e2 );

    return m.middle;
  }
  make_side_copy( i, space, n )
  {
    var plus = this.options.Length.val + this.options.Width.val + this.options.TrackWidth.val * this.options.Lanes.val * 2;
    if( i % 2 )
      plus = this.options.Width.val + this.options.TrackWidth.val * this.options.Lanes.val * 2;
    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  fromCenterTo4Corners( center )
  {

    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_cw();

    g1 = g1.multiply( this.options.Length.val );
    g2 = g2.multiply( this.options.Width.val );

    var c1 = center.add( g1.divide( 2 ) ).add( g2.divide( 2 ) );
    var c2 = c1.add( g1.multiply( -1 ) );
    var c3 = c2.add( g2.multiply( -1 ) );
    var c0 = c3.add( g1 );

    return [ c0, c1, c2, c3 ];
  }
  from2innerPointsTo4corners( points )
  {
    var c1 = points[0];
    var g1 = new Line( points[0], points[1] ).unit_vector;
    var g2 = g1.rotate_90_cw();

    g1 = g1.multiply( this.options.Length.val );
    g2 = g2.multiply( this.options.Width.val );

    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c0 = c1.add( g2 );

    return [ c0, c1, c2, c3 ];
  }
  from3innerPointsTo4corners( points )
  {
    var c1 = points[0];
    var p3 = points[2];
    var side = new Line( points[0], points[1] );
    var g1 = side.unit_vector;
    var g2 = g1.rotate_90_cw();

    var width_point = side.point_on_line( p3 );
    this.options.Width.val = (new Line( p3, width_point )).length;

    g1 = g1.multiply( this.options.Length.val );
    g2 = g2.multiply( this.options.Width.val );

    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c0 = c1.add( g2 );

    return [ c0, c1, c2, c3 ];
  }
  from2outerPointsTo4corners( points )
  {
    // Move points to the right ( along what axis? )
    var c1 = points[0];
    var g1 = new Line( points[0], points[1] ).unit_vector;
    var g2 = g1.rotate_90_cw();

    c1 = c1.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) );

    g1 = g1.multiply( this.options.Length.val );
    g2 = g2.multiply( this.options.Width.val );
    this.options.Length.val * 2 + (this.options.Width.val + this.options.FirstRunningLaneOffset.val) * Math.PI;
    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c0 = c1.add( g2 );

    return [ c0, c1, c2, c3 ];
  }
  from3outerPointsTo4corners( points )
  {
    // Move points to the right ( along what axis? )
    var c1 = points[0];
    var p3 = points[2];
    var side = new Line( points[0], points[1] );
    var g1 = side.unit_vector;
    var g2 = g1.rotate_90_cw();

    var width_point = side.point_on_line( p3 );
    this.options.Width.val = (new Line( p3, width_point )).length - (2 * this.options.TrackWidth.val * this.options.Lanes.val);

    c1 = c1.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) );

    g1 = g1.multiply( this.options.Length.val );
    g2 = g2.multiply( this.options.Width.val );

    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c0 = c1.add( g2 );

    return [ c0, c1, c2, c3 ];
  }

  convert_to_free_hand()
  {
    console.log( "Converting to free hand" );

    var p = this.drawing_points;
    var back_line_1 = new Line( p[0], p[1] );
    var e1 = back_line_1.middle; // between goal 1
    var e2 = new Line( p[2], p[3] ).middle;
    var m = new Line( e1, e2 );

    //this.options.Angle.val = m.as_vector.angle;
    this.options.Angle.val = back_line_1.as_vector.rotate_90_ccw().angle;
    this.options.Length.val = m.length;

    var s1 = new Line( p[1], p[2] ).middle;
    var s2 = new Line( p[0], p[3] ).middle;
    var m2 = new Line( s1, s2 );
    this.options.Width.val = m2.length;

    this.points = [ m.middle ];
    this.layout_method = "free_hand";
    delete this.calculated_drawing_points;
    this.draw();
  }

  refresh_handles()
  {
    var p = this.drawing_points;
    var this_class = this;
    this.handles = [ ];

    var handle1 = new Line( p[1], p[2] );
    var handle2 = new Line( p[0], p[3] );
    var center_line = new Line( handle1.middle, handle2.middle );
    var center = center_line.middle;

    var e1 = new Line( p[0], p[1] ).middle;
    var e2 = new Line( p[2], p[3] ).middle;
    var pitch_center = new Line( e1, e2 ).middle;
    if( this.layout_method === "free_hand" )
    {
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );

        align_this = align_this[0];

        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        this_class.draw();
        return true;
      } ) );

      var gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle - gml;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];

        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();

      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );



      var max_length = this_class.options.Length.max;
      this.handles.push( new Handle( new Line( p[2], p[3] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[3] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );

        if( new_length > max_length )
          new_length = max_length;
        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[2], new_ps[3] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
      } ) );

      this.handles.push( new Handle( new Line( p[0], p[1] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[3], p[0] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        if( new_length > max_length )
          new_length = max_length;
        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[1] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
      } ) );



      var max_width = this_class.options.Width.max;
      this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[1] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        if( new_width > max_width )
          new_width = max_width;
        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );

      }, function( new_width )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
      } ) );

      this.handles.push( new Handle( new Line( p[0], p[3] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[1], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        if( new_width > max_width )
          new_width = max_width;
        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[3] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_length, -Math.PI / 2 );
      } ) );

    }

  }
  set_new_val( option, new_val, allow_zero )
  {
    if( option.name === "Angle" || new_val > 0 || (allow_zero && new_val === 0) )
    {
      option.val = new_val;
      this.draw();
      return true;
    }
    return false;
  }
  change_width_or_length_with_center_point( option, new_val, add_angle )
  {
    if( new_val === 0 )
      return false;
    var moved = option.val - new_val;
    var move_v = new Vector( 1, 0 ).rotate( this.options.Angle.val + add_angle ).multiply( moved / 2 );
    this.points[0] = this.points[0].add( move_v );

    return this.set_new_val( option, new_val );
  }

  create_round( radius, c1, c2, clockwise, paint, recalibrate )
  {
    var g2 = new Line( c1, c2 ).unit_vector;
    var g1 = g2.rotate_90_ccw( );
    var arc1_start = c1.add( g1.multiply( radius ) );
    var arc1_mid = c1.add( g2.multiply( -radius ) );
    var arc1_end = c1.add( g1.multiply( -radius ) );
    var arc2_start = c2.add( g1.multiply( -radius ) );
    var arc2_mid = c2.add( g2.multiply( radius ) );
    var arc2_end = c2.add( g1.multiply( radius ) );
    var tasks =[]
    let start_index = this.tasks.length;

    if(paint){
      if( !clockwise ) {
        var minor_ramp = new Line( arc2_end, arc1_start );
        minor_ramp = minor_ramp.add_to_start( -(minor_ramp.length - this.options["Ramps_length"].val) );
        tasks.push( new LineTask( tasks.length + start_index, [ minor_ramp.start, minor_ramp.end ], false, false ) );
        tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options["Ramps_length"].val - 0.1 ) );

        tasks.push( new ArcTask( tasks.length + start_index, [ arc1_start, arc1_mid, arc1_end ], c1, false, false, true ) );
        tasks.push( new LineTask( tasks.length + start_index, [ arc1_end, arc2_start ], false, true ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc2_start, arc2_mid, arc2_end ], c2, false, false, true ) );
        tasks.push( new LineTask( tasks.length + start_index, [ arc2_end, arc1_start ], false, true ) );
        
      }
      else {
        /*
        var minor_ramp = new ArcTask( this.tasks.length, [ arc1_end, arc1_mid, arc1_start ], c1, true, false, false );
        minor_ramp = minor_ramp.makeLonger( -(minor_ramp.length - 0.5), 0 );
        this.tasks.push( minor_ramp );
        */

        tasks.push( new LineTask( tasks.length + start_index, [ arc1_start, arc2_end ], false, true ) );
        tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options["Ramps_length"].val - 0.5 ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc2_end, arc2_mid, arc2_start ], c2, true, false, true ) );
        tasks.push( new LineTask( tasks.length + start_index, [ arc2_start, arc1_end ], false, true ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc1_end, arc1_mid, arc1_start ], c1, true, false, true ) );
        
      }      
    }
    else{
      if( !clockwise )
      {
        /*
        var minor_ramp = new Line( arc2_end, arc1_start );
        minor_ramp = minor_ramp.add_to_start( -(minor_ramp.length - 0.1) );
        tasks.push( new LineTask( this.tasks.length, [ minor_ramp.start, minor_ramp.end ], false, false ) );
        tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options["Ramps_length"].val - 0.1 ) );
        */
        tasks.push( new ArcTask( tasks.length + start_index, [ arc1_start, arc1_mid, arc1_end ], c1, false, false, false ) );
        tasks.push( new LineTask( tasks.length + start_index, [ arc1_end, arc2_start ], false, false ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc2_start, arc2_mid, arc2_end ], c2, false, false, false ) );
        tasks.push( new LineTask( this.tasks.length, [ arc2_end, arc1_start ], false, false ) );
        
      }
      else
      {
        tasks.push( new LineTask( tasks.length + start_index, [ arc1_start, arc2_end ], false, false ) );
        tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options["Ramps_length"].val - 0.5 ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc2_end, arc2_mid, arc2_start ], c2, true, false, false ) );
        tasks.push( new LineTask( tasks.length + start_index, [ arc2_start, arc1_end ], false, false ) );
        tasks.push( new ArcTask( tasks.length + start_index, [ arc1_end, arc1_mid, arc1_start ], c1, true, false, false ) );
      }
    }

    if (this.options.periodicallyRecalibrateRobot.val) {
      if (this.options.waitWhileRecalibrating.val) {
        tasks.push(new WaypointTask(tasks.length + start_index, arc1_start, false, false));
        tasks.last().task_options.push(new FloatRobotAction("point_wait", this.options.recalibrationWaitTime.val)); // 1 minute
      }
      const startPoint = arc1_start;
      const guideVector = new Line(arc1_start, arc2_end).unit_vector;
      const endPoint = startPoint.add(guideVector.multiply(this.options.calibrationDistance.val));
      tasks.push(new LineTask(tasks.length + start_index, [startPoint, endPoint], false, false));
    }

    return tasks; // RETURN
  }

  make_scratch_lines( end1, end2, line_options, side_guide_top, side_guide_bottom, hurdle = false )
  {
    var running_length = line_options.length;
    var line_width = line_options.width;

    // Make scratch lines
    var end1_guide = new Line( end1, end2 ).unit_vector.rotate_90_cw( );
    var end2_guide = new Line( end2, end1 ).unit_vector.rotate_90_cw( );
    var r1 = this.options.Width.val / 2;

    for( var i = 0; i < this.options.Lanes.val; i++ )
    {
      // Calculate distances from center and out.
      var r = r1 + this.options.LineWidth.val / 2;
      if( i === 0 )
        r += this.options.FirstRunningLaneOffset.val;
      else
        r += this.options.RunningLaneOffset.val;
      var r2 = r1 + this.options.TrackWidth.val;

      // Check if scratch line would be on start line.
      var lane_length = 2 * Math.PI * r + 2 * this.options.Length.val;
      if( !(running_length % lane_length) )
      {
        r1 += this.options.TrackWidth.val;
        continue;
      }

      // Find position on track of scratch line
      var subtract = running_length;
      var o = 2 * r * Math.PI;
      var p = running_length / (2 * this.options.Length.val);
      var track_part = 0;
      while( p > 0.5 )
      {
        if( track_part % 2 )
        {
          subtract -= Math.PI * r;
          p = subtract / (2 * this.options.Length.val);
        }
        else
        {
          subtract -= this.options.Length.val;
          p = subtract / o;
        }
        track_part = ++track_part % 4;
      }

      var p1, p2;
      // Draw the scratch line
      if( track_part % 2 )
      {
        // cirlce part
        var radians = 2 * Math.PI * p;
        //let p1, p2;
        if( track_part === 1 )
        {
          // Second round in running direction
          let p_retning = end2_guide.rotate( -radians );
          p1 = end2.add( p_retning.multiply( r1 ) );
          p2 = end2.add( p_retning.multiply( r2 ) );
        }
        else
        {
          // first round  in running direction
          let p_retning = end1_guide.rotate( -radians );
          p1 = end1.add( p_retning.multiply( r1 ) );
          p2 = end1.add( p_retning.multiply( r2 ) );
        }
        //this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      }
      else
      {
        // line part
        //let p1, p2;
        if( track_part === 0 )
        {
          // Second streight in running directino
          var side_guide = side_guide_top;
          var guide = end1.add( side_guide.multiply( subtract ) );
          p1 = guide.add( end2_guide.multiply( r1 ) );
          p2 = guide.add( end2_guide.multiply( r2 ) );
        }
        else
        {
          // First streight in running directino
          var side_guide = side_guide_bottom;
          var guide = end2.add( side_guide.multiply( subtract ) );
          p1 = guide.add( end1_guide.multiply( r1 ) );
          p2 = guide.add( end1_guide.multiply( r2 ) );
        }
        //this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      }

      if( line_width )
      {
        let g = new Line( p1, p2 );
        let m = g.middle;
        g = g.unit_vector;
        if(hurdle)
        {
          let p1_1;
          let p2_2;
          p1_1 = p1.add(g.multiply(0.2));
          p2_2 = p2.subtract(g.multiply(0.2));
          this.tasks.push( new LineTask( this.tasks.length, [ p1, p1_1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ p2_2, p2], false, true ) );
        }
        else{
        p1 = m.add( g.multiply( -line_width / 2 ) );
        p2 = m.add( g.multiply( line_width / 2 ) );
        }
      }
      if(!hurdle)
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );

      // Go to next lane
      r1 += this.options.TrackWidth.val;
    }

  }
  make_waterfall_line( end1, end2, running_length, side_guide_top, side_guide_bottom )
  {

    var r1 = this.options.Width.val / 2;
    var end1_guide = new Line( end1, end2 ).unit_vector.rotate_90_cw( );
    var end2_guide = new Line( end2, end1 ).unit_vector.rotate_90_cw( );
    var middle = new Line( end1, end2 );

    // Calculate distances from center and out.
    var r = r1 + this.options.FirstRunningLaneOffset.val + this.options.LineWidth.val / 2;

    // Find position on track of scratch line
    var subtract = running_length;
    var o = 2 * r * Math.PI;
    var p = running_length / (2 * this.options.Length.val);
    var track_part = 0;
    while( p > 0.5 )
    {
      if( track_part % 2 )
      {
        subtract -= Math.PI * r;
        p = subtract / (2 * this.options.Length.val);
      }
      else
      {
        subtract -= this.options.Length.val;
        p = subtract / o;
      }
      track_part = ++track_part % 4;
    }

    let C, O, Cb, Ck;
    let C2, O2, Cb2;
    let radians = 0;

    // Draw the scratch line
    if( track_part % 2 )
    {
      let inner_line, C1;
      // cirlce part
      radians = 2 * Math.PI * p;
      let R = r1 + this.options.FirstRunningLaneOffset.val;
      if( track_part === 1 )
      {
        // Second round in running direction
        let p_retning = end2_guide.rotate( -radians );
        C = end2.add( p_retning.multiply( R ) );
        Ck = end2.add( p_retning.multiply( r1 ) );
        O = end2;
        Cb = C;

        p_retning = end1_guide.rotate( Math.PI );
        C1 = end2.add( p_retning.multiply( R ) );
        C2 = end1.add( p_retning.multiply( R ) );
        O2 = end1;
        Cb2 = C2;

        inner_line = new Line( C1, C2 );
      }
      else
      {
        // first round  in running direction
        let p_retning = end1_guide.rotate( -radians );
        C = end1.add( p_retning.multiply( R ) );
        Ck = end1.add( p_retning.multiply( r1 ) );
        O = end1;
        Cb = C;

        p_retning = end2_guide.rotate( Math.PI );
        C2 = end2.add( p_retning.multiply( R ) );
        C1 = end1.add( p_retning.multiply( R ) );
        O2 = end2;
        Cb2 = C2;

        inner_line = new Line( C1, C2 );

      }

      this.tasks.push( new LineTask( this.tasks.length, [ Ck, Cb ], false, true ) );
      let water_fall_task = new WaterfallTask( this.tasks.length, [ O, C ], 0, 0, 1, false, true );
      let t1 = water_fall_task.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val * this.options.Lanes.val );
      if( p < 0.25 )
        var t2 = water_fall_task.cross_with_line( inner_line );

      else
        var t2 = t1 + 1;

      water_fall_task.end_t = t1;
      if( t2 < t1 )
        water_fall_task.end_t = t2;
      this.tasks.push( water_fall_task );

      if( t2 < t1 )
      {
        let l2 = (2 * Math.PI * R * p) + this.options.Length.val;
        let water_fall_task2 = new WaterfallTask( this.tasks.length, [ O2, C2 ], l2, 0, 1, false, true );
        water_fall_task2.end_t = water_fall_task2.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val * this.options.Lanes.val );
        this.tasks.push( water_fall_task2 );
      }
    }
    else
    {
      // line part
      if( track_part === 0 )
      {
        // Second streight in running directino
        let side_guide = side_guide_top;
        let guide = end1.add( side_guide.multiply( subtract ) );
        Cb = guide.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start of waterfall
        Ck = guide.add( end2_guide.multiply( r1 ) ); // start at inner lane
        C = end1.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start_point of cirlce
        O = end1; // Cirlce center
      }
      else
      {
        // First streight in running direction
        let side_guide = side_guide_bottom;
        let guide = end2.add( side_guide.multiply( subtract ) );
        Cb = guide.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
        Ck = guide.add( end1_guide.multiply( r1 ) );
        C = end2.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
        O = end2;
      }

      this.tasks.push( new LineTask( this.tasks.length, [ Ck, Cb ], false, true ) );

      let water_fall_task = new WaterfallTask( this.tasks.length, [ O, C ], subtract, 0, 1, false, true );
      let t1 = water_fall_task.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val * this.options.Lanes.val );
      water_fall_task.end_t = t1;
      this.tasks.push( water_fall_task );

    }

  }

  make_sprint( end1, end2, g1, g2, sprintLength, prevLength, hurdles)
  {
    var sprint_length = sprintLength + this.options.SprintExtra.val;
    if( this.options.Length.val < sprint_length )
    {
      var outerR = this.options.Width.val / 2 + this.options.Lanes.val * this.options.TrackWidth.val;
      var r = this.options.Width.val / 2;



      var dash_length = (sprint_length - this.options.Length.val) / (Math.floor( (sprint_length - this.options.Length.val) / 2 ) * 2 + 1);

      if(prevLength)
      {
        var inverse = false;
        for( var i = 0; i <= this.options.Lanes.val; i++ )
        {
          // Calculate distances from center and out.

          var p1 = end1.add( g1.multiply( r ) ).add( g2.multiply( this.options.Length.val ) );
          var p2 = end1.add( g1.multiply( r ) ).add( g2.multiply( sprint_length ) );

          var line = new Line( p2, p1 );
          var crosses = line.crosses_with_circle( end2, outerR );
          var pm = crosses[0];

          var line_end = p2;
          var to_long = !pm || (new Line( p1, pm )).length < (sprint_length - this.options.Length.val);
          if( to_long )
            line_end = pm;

          var l = 0;
          if( to_long && i !== this.options.Lanes.val )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, pm ], false, true ) );
            this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "task_merge_next", false ) );
            l = (new Line( p2, pm )).length;
          }
          if( i === this.options.Lanes.val )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, p1 ], false, true ) );
            this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "task_merge_next", false ) );
            l = (new Line( p2, p1 )).length;
          }

          if( i < this.options.Lanes.val && i < this.options.Lanes.val )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ line_end, p1 ], false, true ) );
            if(this.options.dashedSprint.val){
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", -l ) );

            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
            this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "dashed_align", 0 ) );
            }
          }

          r += this.options.TrackWidth.val;
          inverse = !inverse;
        } 
      
      
      var r = this.options.Width.val / 2;
      var first = end1.add( g1.multiply( r ) ).add( g2.multiply( sprint_length ) );
      var last = end1.add( g1.multiply( r + this.options.TrackWidth.val * this.options.Lanes.val ) ).add( g2.multiply( sprint_length ) );
      if( this.options.SprintExtra.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ last, first ], false, true ) );


    }
      if( this.options.Length.val < sprintLength)
      {
        var first100 = end1.add( g1.multiply( r ) ).add( g2.multiply( sprintLength ) );
        var lastt100 = end1.add( g1.multiply( r + this.options.TrackWidth.val * this.options.Lanes.val ) ).add( g2.multiply( sprintLength) );
        if( this.options.SprintExtra.val > 0 )
          this.tasks.push( new LineTask( this.tasks.length, [ first100, lastt100 ], false, true ) );
        else
          this.tasks.push( new LineTask( this.tasks.length, [ lastt100, first100 ], false, true ) );
      }
    
  }
    else
    {
      var r = this.options.Width.val / 2;
      var first = end1.add( g1.multiply( r ) ).add( g2.multiply( sprint_length ) );
      var last = end1.add( g1.multiply( r + this.options.TrackWidth.val * this.options.Lanes.val ) ).add( g2.multiply( sprint_length ) ); 
      var first100 = end1.add( g1.multiply( r ) ).add( g2.multiply(sprintLength ) );
      var lastt100 = end1.add( g1.multiply( r + this.options.TrackWidth.val * this.options.Lanes.val ) ).add( g2.multiply(sprintLength ) );
      if( this.options.SprintExtra.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ last, first ], false, true ) );
      
      if( this.options.SprintExtra.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ first100, lastt100 ], false, true ) );
      else
        this.tasks.push( new LineTask( this.tasks.length, [ lastt100, first100 ], false, true ) );
    }
    if(hurdles && (this instanceof Athletics400mRunningTrack || this instanceof CustomRunningTrack))
    {
      if(this.options["hurdles men"].val)
        {
          let hurdle_end1
          let hurdle_end2;
          let line_width = 0.3;
          
          for(let h = 0; h < 10; h++)
          {
            if(h === 0)
            {
              hurdle_end1 = first100.subtract(g2.multiply(3.72));
              for(let l = 0; l < this.options.Lanes.val; l++)
              {
              let hurdle_row1 = hurdle_end1.add(g1.multiply(this.options.TrackWidth.val * l));
              hurdle_end2 = hurdle_row1.add(g1.multiply(this.options.TrackWidth.val));
              let g = new Line( hurdle_row1, hurdle_end2 );
              let m = g.middle;
              g = g.unit_vector;
              
              let p1_1;
              let p2_2;
              p1_1 = hurdle_row1.add(g.multiply(0.2));
              p2_2 = hurdle_end2.subtract(g.multiply(0.2));
            
              this.tasks.push( new LineTask( this.tasks.length, [ hurdle_row1, p1_1 ], false, true ) );
              this.tasks.push( new LineTask( this.tasks.length, [ p2_2, hurdle_end2], false, true ) );
              }
            }
            else
            {
              hurdle_end1 = hurdle_end1.subtract(g2.multiply((9.14 )));
              for(let l = 0; l < this.options.Lanes.val; l++)
              {
              let hurdle_row1 = hurdle_end1.add(g1.multiply(this.options.TrackWidth.val * l));
              hurdle_end2 = hurdle_row1.add(g1.multiply(this.options.TrackWidth.val));
              let g = new Line( hurdle_row1, hurdle_end2 );
              let m = g.middle;
              g = g.unit_vector;
              
              let p1_1;
              let p2_2;
              p1_1 = hurdle_row1.add(g.multiply(0.2));
              p2_2 = hurdle_end2.subtract(g.multiply(0.2));
            
              this.tasks.push( new LineTask( this.tasks.length, [ hurdle_row1, p1_1 ], false, true ) );
              this.tasks.push( new LineTask( this.tasks.length, [ p2_2, hurdle_end2], false, true ) );
              }
            }
          }
      }
      if(this.options["hurdles women"].val)
      {
        let hurdle_end1
        let hurdle_end2;
        let line_width = 0.3;
        
        for(let h = 0; h < 10; h++)
        {
          if(h === 0)
          {
            hurdle_end1 = first100.subtract(g2.multiply(13));
            for(let l = 0; l < this.options.Lanes.val; l++)
            {
            let hurdle_row1 = hurdle_end1.add(g1.multiply(this.options.TrackWidth.val * l));
            hurdle_end2 = hurdle_row1.add(g1.multiply(this.options.TrackWidth.val));
            let g = new Line( hurdle_row1, hurdle_end2 );
            let m = g.middle;
            g = g.unit_vector;

            let p1_1;
            let p2_2;
            p1_1 = hurdle_row1.add(g.multiply(0.2));
            p2_2 = hurdle_end2.subtract(g.multiply(0.2));
          
            this.tasks.push( new LineTask( this.tasks.length, [ hurdle_row1, p1_1 ], false, true ) );
            this.tasks.push( new LineTask( this.tasks.length, [ p2_2, hurdle_end2], false, true ) );
            }
          }
          else
          {
            hurdle_end1 = hurdle_end1.subtract(g2.multiply(( 8.5 )));
            for(let l = 0; l < this.options.Lanes.val; l++)
            {
            let hurdle_row1 = hurdle_end1.add(g1.multiply(this.options.TrackWidth.val * l));
            hurdle_end2 = hurdle_row1.add(g1.multiply(this.options.TrackWidth.val));
            let g = new Line( hurdle_row1, hurdle_end2 );
            let m = g.middle;
            g = g.unit_vector;

            let p1_1;
            let p2_2;
            p1_1 = hurdle_row1.add(g.multiply(0.2));
            p2_2 = hurdle_end2.subtract(g.multiply(0.2));
            
            this.tasks.push( new LineTask( this.tasks.length, [ hurdle_row1, p1_1 ], false, true ) );
            this.tasks.push( new LineTask( this.tasks.length, [ p2_2, hurdle_end2], false, true ) );
            }
          }
        }
      }
    }
    /*if( this.options.Length.val < this.options.SprintLength.val )
    {
     
      if( this.options.SprintExtra.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ first100, lastt100 ], false, true ) );
      else
        this.tasks.push( new LineTask( this.tasks.length, [ lastt100, first100 ], false, true ) );
    }*/
    
  }
  
  make_breakstart_lines( end1, end2, line, side_guide_top, side_guide_bottom )
  {
    var running_length = line.length;
    var where = line.breakline;
    var rounds = line.rounds_in_own_lane ? line.rounds_in_own_lane : 0;
    //this.options.RunningLength.val;

    var middle = new Line( end1, end2 );
    var r1 = this.options.Width.val / 2;
    var end1_guide = new Line( end1, end2 ).unit_vector.rotate_90_cw( );
    var end2_guide = new Line( end2, end1 ).unit_vector.rotate_90_cw( );

    var Cb, Ck, C, O;
    var subtract;
    if( where === 2 )
    {
      // Second streight in running directino
      let side_guide = side_guide_top;
      let guide = end1.add( side_guide.multiply( this.options.Length.val ) );
      Cb = guide.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start of waterfall
      Ck = guide.add( end2_guide.multiply( r1 ) ); // start at inner lane
      C = end1.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start_point of cirlce
      O = end1; // Cirlce center


    }
    else
    {
      // First streight in running direction
      let side_guide = side_guide_bottom;
      let guide = end2.add( side_guide.multiply( this.options.Length.val ) );
      Cb = guide.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
      Ck = guide.add( end1_guide.multiply( r1 ) );
      C = end2.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
      O = end2;

      var o_inner_lane = 2 * Math.PI * (this.options.Width.val / 2 + this.options.LineWidth.val / 2 + this.options.FirstRunningLaneOffset.val);
      subtract = this.options.RunningLength.val - 2 * this.options.Length.val - o_inner_lane / 2;
    }

    let water_fall = new WaterfallTask( this.tasks.length, [ O, C ], this.options.Length.val, 0, 1, false, true );
    /*let t1 = water_fall.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val );
     let t2 = water_fall.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val * this.options.Lanes.val );
     water_fall.start_t = t1;
     water_fall.end_t = t2;
     this.tasks.push( water_fall );*/



    for( var i = 1; i < this.options.Lanes.val; i++ )
    {
      var r1 = this.options.Width.val / 2 + this.options.TrackWidth.val * i;

      // Calculate distances from center and out.
      var r = r1 + this.options.LineWidth.val / 2;
      if( i === 0 )
        r += this.options.FirstRunningLaneOffset.val;
      else
        r += this.options.RunningLaneOffset.val;
      var r2 = r1 + this.options.TrackWidth.val;

      let t = water_fall.find_t_where_dist_to_center_line( middle, r );
      water_fall.end_t = t;
      var B = water_fall.end;

      var in_circle;
      var o_lane = 2 * Math.PI * r;
      if( where === 2 )
      {

        let last = middle.end.add( end1_guide.multiply( -r ) );
        let rest = (new Line( B, last )).length;

        in_circle = this.options.RunningLength.val - 2 * this.options.Length.val - rest - o_lane / 2;
      }
      else
      {
        let last = middle.start.add( end1_guide.multiply( r ) );
        let rest = (new Line( B, last )).length;
        in_circle = subtract - rest - ((o_lane + 2 * this.options.Length.val) - this.options.RunningLength.val) * rounds;
      }

      var circle_procent = in_circle / o_lane;

      var radians = 2 * Math.PI * circle_procent;
      var scratch_guide = end1_guide.rotate( -radians );
      var start = end1.add( scratch_guide.multiply( r1 ) );
      var end = end1.add( scratch_guide.multiply( r2 ) );

      this.tasks.push( new LineTask( this.tasks.length, [ start, end ], false, true ) );

    }

  }

  make_breakline_line( end1, end2, line, side_guide_top, side_guide_bottom )
  {
    var where = line.breakline;

    var middle = new Line( end1, end2 );
    var r1 = this.options.Width.val / 2;
    var end1_guide = new Line( end1, end2 ).unit_vector.rotate_90_cw( );
    var end2_guide = new Line( end2, end1 ).unit_vector.rotate_90_cw( );

    var Cb, Ck, C, O;
    if( where === 2 )
    {
      // Second streight in running directino
      let side_guide = side_guide_top;
      let guide = end1.add( side_guide.multiply( this.options.Length.val ) );
      Cb = guide.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start of waterfall
      Ck = guide.add( end2_guide.multiply( r1 ) ); // start at inner lane
      C = end1.add( end2_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) ); // start_point of cirlce
      O = end1; // Cirlce center
    }
    else
    {
      // First streight in running direction
      let side_guide = side_guide_bottom;
      let guide = end2.add( side_guide.multiply( this.options.Length.val ) );
      Cb = guide.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
      Ck = guide.add( end1_guide.multiply( r1 ) );
      C = end2.add( end1_guide.multiply( r1 + this.options.FirstRunningLaneOffset.val ) );
      O = end2;
    }

    let water_fall = new WaterfallTask( this.tasks.length, [ O, C ], this.options.Length.val, 0, 1, false, true );
    let t1 = water_fall.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val );
    let t2 = water_fall.find_t_where_dist_to_center_line( middle, r1 + this.options.TrackWidth.val * this.options.Lanes.val );
    water_fall.start_t = t1;
    water_fall.end_t = t2;

    this.tasks.push( water_fall );

  }

  draw( )
  {
    this.tasks = [ ];
    this.start_locations = [ ];
    // update tasks
    delete this.calculated_drawing_points;
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[1];//p[3];
    var c3 = p[2];//p[4];
    var c4 = p[3];//p[7];
    var g2 = new Line( c2, c3 ).unit_vector;
    if( g2.length === 0 )
    {
      var g1 = new Line( c1, c2 ).unit_vector;
      var g2 = g1.rotate_90_cw( );
    }
    else
      var g1 = g2.rotate_90_ccw( );

    var end1 = new Line( c1, c2 ).middle;
    var end2 = new Line( c3, c4 ).middle;
    //var center = new Line( end1, end2 ).middle;

    var r = this.options.Width.val / 2;
    var start_line_end = end1.add( g1.multiply( r ) );

    // Make running laves
    for( var i = 0; i <= this.options.Lanes.val; i++ )
    {
      this.tasks.pushAll(this.create_round( r, end1, end2, this.options.TwoWay.val ? (i % 2) : false, true ));
      r += this.options.TrackWidth.val;
    }
    this.start_locations.push( new StartLocation( this.tasks[0].ends[0], 0 ) );

    // Make goal line
    r -= this.options.TrackWidth.val;
    var start_line_start = end1.add( g1.multiply( r ) );

    this.tasks.push( new LineTask( this.tasks.length, [ start_line_end, start_line_start ], false, true ) );

    var side_guide_top = (new Line( c2, c3 )).unit_vector;
    var side_guide_bottom = (new Line( c4, c1 )).unit_vector;

    // Make lines
    this.options.lines.val.forEach( line => {
      if( line.type === "scratch" )
        this.make_scratch_lines( end1, end2, line, side_guide_top, side_guide_bottom );
      if( line.type === "hurdle" )
        this.make_scratch_lines( end1, end2, line, side_guide_top, side_guide_bottom, true);
      if( line.type === "waterfall" && robot_controller.robot_has_capability( "waterfall_task" ) )
        this.make_waterfall_line( end1, end2, line.length, side_guide_top, side_guide_bottom );
      if( line.type === "breakstart" )
        this.make_breakstart_lines( end1, end2, line, side_guide_top, side_guide_bottom );
      if( line.type === "breakline" )
        this.make_breakline_line( end1, end2, line, side_guide_top, side_guide_bottom );


    } );

    
    if( this.options.DrawSprint.val )
    {
      this.options.ExistingSprintLength.val = this.options.SprintLength.val;
      this.make_sprint( end1, end2, g1, g2, this.options.SprintLength.val, true, true );
    }
    else if(!this.options.DrawSprint.val && this.options.ExistingSprintLength.val === this.options.SprintLength.val && this.options.SprintLength.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }
    
    if(this.options.DrawSprint90.val)
    {
      if(this.options.ExistingSprintLength.val <= this.options.SprintLength90.val)
      {
        this.options.ExistingSprintLength.val = this.options.SprintLength90.val
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength90.val, true, false);
      }
      else
      {
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength90.val, false, false);
      }
    }
    else if(!this.options.DrawSprint90.val && this.options.ExistingSprintLength.val === this.options.SprintLength90.val && this.options.SprintLength90.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }

    if(this.options.DrawSprint80.val)
    {
      if(this.options.ExistingSprintLength.val <= this.options.SprintLength80.val)
      {
        this.options.ExistingSprintLength.val = this.options.SprintLength80.val
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength80.val, true, false);
      }
      else
      {
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength80.val, false, false);
      }
    }
    else if(!this.options.DrawSprint80.val && this.options.ExistingSprintLength.val === this.options.SprintLength80.val && this.options.SprintLength80.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }

    if(this.options.DrawSprint70.val)
    {
      if(this.options.ExistingSprintLength.val <= this.options.SprintLength70.val)
      {
        this.options.ExistingSprintLength.val = this.options.SprintLength70.val
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength70.val, true, false);
      }
      else
      {
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength70.val, false, false);
      }
    }
    else if(!this.options.DrawSprint70.val && this.options.ExistingSprintLength.val === this.options.SprintLength70.val && this.options.SprintLength80.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }

    if(this.options.DrawSprint60.val)
    {
      if(this.options.ExistingSprintLength.val <= this.options.SprintLength60.val)
      {
        this.options.ExistingSprintLength.val = this.options.SprintLength60.val
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength60.val, true, false);
      }
      else
      {
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength60.val, false, false);
      }
    }
    else if(!this.options.DrawSprint60.val && this.options.ExistingSprintLength.val === this.options.SprintLength60.val && this.options.SprintLength60.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }
    
    if(this.options.DrawSprint50.val)
    {
      if(this.options.ExistingSprintLength.val <= this.options.SprintLength50.val)
      {
        this.options.ExistingSprintLength.val = this.options.SprintLength50.val
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength50.val, true, false);
      }
      else
      {
        this.make_sprint(end1, end2, g1, g2, this.options.SprintLength50.val, false, false);
      }
    }
    else if(!this.options.DrawSprint50.val && this.options.ExistingSprintLength.val === this.options.SprintLength50.val && this.options.SprintLength50.val !== 0)
    {
      this.options.ExistingSprintLength.val = 0;
      this.draw();
    }
        
    

    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( );

    this.refresh_snapping_lines( );
    this.snapping_lines.push( new Line( start_line_end, start_line_start ) );
    

  }

  refresh_test_run()
  {
    var p = this.drawing_points;
    this.test_tasks = [ ];
    var c1 = p[0];
    var c2 = p[1];//p[3];
    var c3 = p[2];//p[4];
    var c4 = p[3];//p[7];

    var end1 = new Line( c1, c2 ).middle;
    var end2 = new Line( c3, c4 ).middle;
    var r = this.options.TrackWidth.val* this.options.Lanes.val + this.options.Width.val / 2;
    this.test_tasks.pushAll( this.create_round( r, end1, end2, false, false ));
    
    //this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    //this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    //this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[2] ) );
    //this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[3] ) );
  }

  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;

    //this.bb = [p[0], p[3], p[4], p[7]];
    this.snapping_lines.push( new Line( p[0], p[1] ) );
    this.snapping_lines.push( new Line( p[1], p[2] ) );
    this.snapping_lines.push( new Line( p[2], p[3] ) );
    this.snapping_lines.push( new Line( p[3], p[0] ) );

    //for ( var i = 0; i < p.length - 1; i++ )
    //    this.snapping_lines.push( new Line( p[i], p[i + 1] ) );

    var e1 = new Line( p[0], p[1] ).middle;
    var e2 = new Line( p[2], p[3] ).middle;
    var m1 = new Line( e1, e2 );
    var s1 = new Line( p[1], p[2] ).middle;
    var s2 = new Line( p[0], p[3] ).middle;
    var m2 = new Line( s1, s2 );

    this.snapping_lines.push( m1 );
    this.snapping_lines.push( m2 );

  }

  get info_options( )
  {
    return [ "RunningLength" ];
  }

  refresh_bb( )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[1];
    var c3 = p[2];
    var c4 = p[3];
    return [ c1, c2, c3, c4 ];
  }
  
  static get_point_positions( layout_method )
  {
    if( layout_method === "run_inner_corner,side" )
    {
      return [
        new Vector( 0.25, 0.63 ),
        new Vector( 0.25, 0.4 )
      ];
    }
    if( layout_method === "run_inner_two_corners,side" )
    {
      return [
        new Vector( 0.25, 0.64 ),
        new Vector( 0.25, 0.4 ),
        new Vector( 0.75, 0.4 )
      ];
    }
    if( layout_method === "run_outer_corner,side" )
    {
      return [
        new Vector( -0.03, 0.64 ),
        new Vector( -0.03, 0.4 )
      ];
    }
    if( layout_method === "run_outer_two_corners,side" )
    {
      return [
        new Vector( -0.03, 0.63 ),
        new Vector( -0.03, 0.3 ),
        new Vector( 1.03, 0.3 )
      ];
    }
  }
 

}

class Athletics200mRunningTrack extends AthleticsRunningTrack
{
  static template_title = "200m running track"; // Translateable
  static template_id = "athletics_200m"; // no spaces
  static template_image = "img/templates/athletics_running_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    //this.options.Width.val = 23.67 * 2; // inner width/2 also inner radius
    this.options.Length.val = 25.01;
    //this.options.LongSideLength.val = this.options.Length.val;
    this.options.RunningLength.val = 200;
    this.options.DrawSprint.configurable = true;

    //var first_running_lane_radius = (this.options.RunningLength.val - 2 * this.options.Length.val) / Math.PI;
    //this.options.Width.val = first_running_lane_radius - 0.3 - this.options.LineWidth.val / 2;

    this.options.Lanes.val = 6;
    //this.options.ScratchLines.val = [ 200, 150, 100, 50 ];
    //this.options.WaterfallLines.val = [ 1000 ];

    Object.defineProperty( this.options.lines, 'val', {
      get: function()
      {
        var lines = [ ];
        this_class.options["Start 1000m"].val && lines.push( {
          length: 1000,
          type: "waterfall"
        } );

        this_class.options["Start 800m"].val && lines.push( {
          length: 800,
          breakline: 1, // after  how many half rounds should they merge to one line
          type: "breakstart" // scratch lines where they run into the same lane after the breakline
        } );
        this_class.options["Start 200m"].val && lines.push( {
          length: 200,
          type: "scratch" // Scratch lines
        } );
        this_class.options["Start 400m"].val && lines.push( {
          length: 400,
          breakline: 2, // after  how many half rounds should they merge to one line
          type: "breakstart" // scratch lines where they run into the same lane after the breakline
        } );
        this_class.options["150m scratch"].val && lines.push( {
          length: 150,
          type: "scratch"
        } );
        this_class.options["Start 800m"].val && lines.push( {
          length: 800,
          breakline: 1, // after  how many half rounds should they merge to one line
          type: "breakline"
        } );
        this_class.options["Start 1500m"].val && lines.push( {
          length: 1500,
          type: "waterfall"
        } );
        this_class.options["100m scratch"].val && lines.push( {
          length: 100,
          type: "scratch"
        } );
        this_class.options["50m scratch"].val && lines.push( {
          length: 50,
          type: "scratch"
        } );
        this_class.options["Start 400m"].val && lines.push( {
          length: 800,
          breakline: 2, // after  how many half rounds should they merge to one line
          type: "breakline"
        } );

        this_class.options["Start 1mile"].val && lines.push( {
          length: (1).mile2meter(),
          type: "waterfall" // waterfall start, everybody merge to same line as soon as posible.
        } );
       
        return lines;
      },
      set: function( new_val )
      {

      }
    } );
    this.options["Start 200m"] = {
      configurable: true,
      name: "Start 200m",
      val: true,
      type: "bool"
    };
    this.options["150m scratch"] = {
      configurable: true,
      name: "First take-over zone for 4x50 relay",
      val: true,
      type: "bool",
      prev_sibling: "Start 200m"
    };
    this.options["100m scratch"] = {
      configurable: true,
      name: "Second take-over zone for 4x50 relay",
      val: true,
      type: "bool",
      prev_sibling: "150m scratch"
    };
    this.options["50m scratch"] = {
      configurable: true,
      name: "Third take-over zone for 4x50 relay",
      val: true,
      type: "bool",
      prev_sibling: "100m scratch"
    };
    this.options["Start 400m"] = {
      configurable: true,
      name: "Start 400m",
      val: true,
      type: "bool",
      prev_sibling: "50m scratch"
    };
    this.options["Start 800m"] = {
      configurable: true,
      name: "Start 800m",
      val: true,
      type: "bool",
      prev_sibling: "Start 400m"
    };
    this.options["Start 1500m"] = {
      configurable: true,
      name: "Start 1500m",
      val: false,
      type: "bool",
      prev_sibling: "Start 800m"
    };
    this.options["Start 1000m"] = {
      configurable: true,
      name: "Start 1000m",
      val: false,
      type: "bool",
      prev_sibling: "Start 1500m"
    };
    this.options["Start 1mile"] = {
      configurable: true,
      name: "Start 1mile",
      val: false,
      type: "bool",
      prev_sibling: "Start 1000m"
    };
    
    Object.defineProperty( this.options.DrawSprint, 'configurable', {
      get: function()
      {
        return login_screen_controller.user_level === user_level.DEVELOPER;
      },
      set: function( new_val )
      { }
    } );

  }
  
}

class Athletics300mRunningTrack extends AthleticsRunningTrack
{
  static template_title = "300m running track"; // Translateable
  static template_id = "athletics_300m"; // no spaces
  static template_image = "img/templates/athletics_running_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.Width.val = 34.8 * 2; // inner width/2 also inner radius
    this.options.Length.val = 40.04;
    this.options.RunningLength.val = 300;
    this.options.DrawSprint.configurable = true;

    this.options.Lanes.val = 7;
    //this.options.ScratchLines.val = [ 300, 200, 100, 400 ];
    this.options.lines.val = [ {
        length: 300,
        type: "scratch"
      }, {
        length: 200,
        type: "scratch"
      }, {
        length: 100,
        type: "scratch"
      }, {
        length: 400,
        type: "scratch"
      } ];
  }

}

class Athletics400mRunningTrack extends AthleticsRunningTrack
{
  static template_title = "400m running track"; // Translateable
  static template_id = "athletics_400m"; // no spaces
  static template_image = "img/templates/athletics_running_long_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    //this.options.Width.val = 36.5 * 2; // inner width/2 also inner radius
    this.options.Length.val = 84.39;
    this.options.RunningLength.val = 400;

    this.options.Lanes.val = 8;
    //this.options.ScratchLines.val = [ 400, 300, 200, 100 ];
    //this.options.WaterfallLines.val = [ 2000, 1500, 1000 ];
    this.options.lines.val = [
      /*{
       length: 2000,
       type: "waterfall"
       }, {
       length: 400,
       type: "scratch"
       }, {
       length: 1500,
       type: "waterfall"
       }, {
       length: 300,
       type: "scratch"
       }, {
       length: 1000,
       type: "waterfall"
       }, {
       length: 200,
       type: "scratch"
       }, {
       length: 100,
       type: "scratch"
       }*/
    ];

    Object.defineProperty( this.options.lines, 'val', {
      get: function()
      {
        var lines = [ ];
        this_class.options["Start 2000m"].val && lines.push( {
          length: 2000,
          type: "waterfall"
        } );
        this_class.options["Start 800m"].val && lines.push( {
          length: 800,
          breakline: 1, // after  how many half rounds should they merge to one line
          type: "breakstart" // scratch lines where they run into the same lane after the breakline
        } );
        this_class.options["Start 400m"].val && lines.push( {
          length: 400,
          type: "scratch" // scratch lines where they run into the same lane after the breakline
        } );
        this_class.options["Start 4x400m"].val && lines.push( {
          length: 400,
          breakline: 1, // after  how many half rounds should they merge to one line
          rounds_in_own_lane: 1,
          type: "breakstart" // scratch lines where they run into the same lane after the breakline
        });
        this_class.options["400m hurdles"].val && lines.push( {
          length: 355,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 320,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["300m scratch"].val && lines.push( {
          length: 320,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["Start 1500m"].val && lines.push( {
          length: 1500,
          type: "waterfall"
        } );
        this_class.options["300m scratch"].val && lines.push( {
          length: 310,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["300m scratch"].val && lines.push( {
          length: 300,
          type: "scratch"
        } );
        this_class.options["300m scratch"].val && lines.push( {
          length: 290,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 285,
          type: "hurdle",
          width: 0.3
        } );
         this_class.options["Start 800m"].val && lines.push( {
          length: 800,
          breakline: 1, // after  how many half rounds should they merge to one line
          type: "breakline" // scratch lines where they run into the same lane after the breakline
        } );


        this_class.options["400m hurdles"].val && lines.push( {
          length: 250,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["Start 200m"].val && lines.push( {
          length: 220,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 215,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["Start 1000m"].val && lines.push( {
          length: 1000,
          type: "waterfall"
        } );
        this_class.options["Start 200m"].val && lines.push( {
          length: 210,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["Start 200m"].val && lines.push( {
          length: 200,
          type: "scratch" // Scratch lines
        } );
        this_class.options["Start 200m"].val && lines.push( {
          length: 190,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 180,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 145,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["100m scratch"].val && lines.push( {
          length: 120,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 110,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["100m scratch"].val && lines.push( {
          length: 110,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["100m scratch"].val && lines.push( {
          length: 100,
          type: "scratch"
        } );
        this_class.options["100m scratch"].val && lines.push( {
          length: 90,
          type: "scratch",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 75,
          type: "hurdle",
          width: 0.3
        } );
        this_class.options["400m hurdles"].val && lines.push( {
          length: 40,
          type: "hurdle",
          width: 0.3
        } );
      
        return lines;
      },
      set: ( v ) => {
      }
    } );

    this.options["Start 2000m"] = {
      configurable: true,
      name: "Start 2000m",
      val: true,
      type: "bool"
    };
    this.options["Start 800m"] = {
      configurable: true,
      name: "Start 800m",
      val: true,
      type: "bool",
      prev_sibling: "Start 2000m"
    };
    this.options["Start 400m"] = {
      configurable: true,
      name: "Start 400m, 4x100m, 400m hurdles",
      val: true,
      type: "bool",
      prev_sibling: "Start 800m"
    };
    this.options["Start 4x400m"] = {
      configurable: true,
      name: "Start 4x400m",
      val: true,
      type: "bool",
      prev_sibling: "Start 400m"
    };
    this.options["400m hurdles"] = {
      configurable: true,
      name: "400m hurdles",
      val: false,
      type: "bool",
      prev_sibling: "Start 4x400m"
    };
    this.options["Start 1500m"] = {
      configurable: true,
      name: "Start 1500m",
      val: true,
      type: "bool",
      prev_sibling: "Start 4x400m"
    };
    this.options["300m scratch"] = {
      configurable: true,
      name: "First take-over zone 4x100m relay",
      val: true,
      type: "bool",
      prev_sibling: "Start 1500m"
    };
    this.options["Start 1000m"] = {
      configurable: true,
      name: "Start 1000m",
      val: true,
      type: "bool",
      prev_sibling: "300m scratch"
    };
    this.options["Start 200m"] = {
      configurable: true,
      name: "Second take-over zone 4x100m relay",
      val: true,
      type: "bool",
      prev_sibling: "Start 1000m"
    };
    this.options["100m scratch"] = {
      configurable: true,
      name: "Third take-over zone 4x100m relay",
      val: true,
      type: "bool",
      prev_sibling: "Start 200m"
    };
    this.options["hurdles men"] = {
      get configurable()
      {
        return this_class.options.DrawSprint.val;
      },
      name: "Hurdles men 110m",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint"
    }
    this.options["hurdles women"] = {
      get configurable()
      {
        return this_class.options.DrawSprint.val;
      },
      name: "Hurdles women 100m",
      val: false,
      type: "bool",
      prev_sibling: "DrawSprint"
    }

    this.options.DrawSprint.prev_sibling = "100m scratch";
    this.options.DrawSprint.val = true;
    this.options.DrawSprint.configurable = true;
  }

}

class CustomRunningTrack extends AthleticsRunningTrack
{
  static template_title = "Custom running track"; // Translateable
  static template_id = "athletics_custom_running_track"; // no spaces
  static template_image = "img/templates/athletics_running_long_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    this.options.RunningLength.val = 400;
    this.options.RunningLength.dontsave = false;
    //this.options.RunningLength.configurable = true;

    this.options.Lanes.val = 8;
    this.options.lines.val = [
    ];

    //this.options.DrawSprint.prev_sibling = "100m scratch";
    this.options.DrawSprint.val = true;
    this.options.DrawSprint.configurable = true;
    this.options["hurdles men"] = {
      get configurable()
      {
        return this_class.options.DrawSprint.val;
      },
      name: "Hurdles men 110m",
      val: false,
      type: "bool"
    }
    this.options["hurdles women"] = {
      get configurable()
      {
        return this_class.options.DrawSprint.val;
      },
      name: "Hurdles women 100m",
      val: false,
      type: "bool"
    }

    this.options.Length = {
      adjustable: true,
      name: "Length",
      _val: 84.38999999950504,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        this_class.options.RunningLength.val = ((this_class.options.Width.val / 2) + this_class.options.FirstRunningLaneOffset.val + (this_class.options.LineWidth.val / 2)) * 2 * Math.PI - this_class.options.Length.val * -2;
      },
      min: 0.001,
      type: "float"
    };
    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 72.97421188373119,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        this_class.options.RunningLength.val = ((this_class.options.Width.val / 2) + this_class.options.FirstRunningLaneOffset.val + (this_class.options.LineWidth.val / 2)) * 2 * Math.PI - this_class.options.Length.val * -2;
      },
      min: 0.001,
      type: "float"
    };


    this.options.RunningLengthDisplay = {
      name: "Running length",
      dontsave: true,
      get val()
      {
        return this_class.options.RunningLength.val;
      },
      set val( v )
      {},
      type: "float",
      //configurable: true,
      adjustable: true,
      is_info: true
    };

    this.options.SprintLength = {
      configurable()
      {
        return this_class.options.DrawSprint.val;
      },
      name: "Sprint length",
      val: 100,
      type: "float",
      prev_sibling: "DrawSprint"
    };
    this.options.DrawSprint.name = "Sprint";

  }

}
