/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global calibration_screen */

class GoalJob extends Job
{
  static template_type = "Test";
  static template_title = "Goal";
  static template_id = "test_goal";
  static template_image = "img/templates/geometry_line.png";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    var this_class = this;

    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      adjustable: true,
      name: "Length",
      val: 15,
      type: "float"
    };
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.GoalWidth = {
      configurable: true,
      name: "GoalWidth",
      val: 7.32,
      type: "float"
    };
    this.options.goalPoleWidth = {
      configurable: true,
      name: "goalPoleWidth",
      val: 0.12,
      type: "float"
    };

    this.options.leftAround = {
      configurable: true,
      name: "Left around poles",
      val: false,
      type: "bool"
    };

    this.options.newDriveAround = {
      configurable: true,
      name: "new drive around",
      val: false,
      type: "bool"
    };
    this.options.maxNumberOfPoles = {
      get configurable()
      {
        return this_class.options.newDriveAround.val;
      },
      prev_sibling: "newDriveAround",
      name: "Max number of poles",
      val: 2,
      type: "int"
    };
    this.options.turnRadius = {
      get configurable()
      {
        return this_class.options.newDriveAround.val;
      },
      prev_sibling: "newDriveAround",
      name: "Turn radius",
      val: 2.0,
      type: "float"
    };
    this.options.stopBeforeGoal = {
      configurable: true,
      name: "Stop before goal",
      val: 2.0,
      type: "float"
    };

  }

  static get layout_methods()
  {
    return {
      "two_ends": 2,
      "free_hand": 0
    };
  }
  get info_options()
  {
    return [ "Length" ];
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "two_ends":
        points = this.points;
        break;
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Length.val ).divide( 2 );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found," + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
    this.bb = [ ];
  }
  refresh_handles()
  {
    var this_class = this;
    var p = this.drawing_points;
    this.handles = [ ];
    if( this.layout_method === "free_hand" )
    {
      var the_line = new Line( p[0], p[1] );
      var middle = the_line.middle;
      var move_handle = new Handle( middle, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines )[0];
        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      } );
      this.handles.push( move_handle );

      var g = new Line( p[0], p[1] );
      //var gml = new Line( g.middle, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( new_pos_v, g.middle ).as_vector.angle;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
        this_class.options.Angle.val = new_angle;
        this_class.draw();

      }, function( new_angle )
      {
        console.log( new_angle );
        this_class.options.Angle.val = new_angle;

        this_class.draw();
        return true;
      }, "deg" ) );

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = p[0].dist_to_point( the_line.point_on_line( new_pos_v ) );

        var changed = (new_length - this_class.options.Length.val);
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( changed / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

        this_class.options.Length.val = new_length;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Length.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var l = new Line( p[0], p[1] );
    this.snapping_lines.push( l );

    var g = l.unit_vector.rotate_90_cw();
    var l2 = new Line( p[0], p[0].add( g ) );
    var l3 = new Line( p[1], p[1].add( g ) );

    this.snapping_lines.push( l2 );
    this.snapping_lines.push( l3 );
  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );



    var whole = new Line( p[0], p[1] );
    var g = whole.unit_vector;
    var middle = whole.middle;



    if( this.options.newDriveAround.val )
    {
      var number_of_poles = this.options.maxNumberOfPoles.val;
      var room_for_poles = (this.options.Length.val - 2 * this.options.stopBeforeGoal.val) / this.options.GoalWidth.val;
      if( number_of_poles > room_for_poles )
        number_of_poles = Math.floor( room_for_poles ) + 1;

      var first_pole_from_middle = ((number_of_poles - 1) * this.options.GoalWidth.val) / 2;
      var goal1 = middle.subtract( g.multiply( first_pole_from_middle ) );
      var poles = [ goal1 ];
      for( var i = 1; i < number_of_poles; i++ )
      {
        var next_goal = goal1.add( g.multiply( this.options.GoalWidth.val * i ) );
        poles.push( next_goal );
      }


      var options = {};
      options.task_before = new LineTask( this.tasks.length, [ p[0], poles[0] ], false, true );
      options.task_after = new LineTask( this.tasks.length, [ poles.last(), p[1] ], false, true );
      options.poles = poles;
      options.pole_width = this.options.goalPoleWidth.val;
      options.left_around = this.options.leftAround.val;
      options.start_index = this.tasks.length;
      options.turn_radius = this.options.turnRadius.val;
      options.stop_before = this.options.stopBeforeGoal.val;
      options.color_dubin = true;
      this.tasks = drive_around_posts( options );
    }
    else
    {
      var goal1 = middle.subtract( g.multiply( this.options.GoalWidth.val / 2 ) );
      var goal2 = middle.add( g.multiply( this.options.GoalWidth.val / 2 ) );
      //c1, p1, p2, fc1, stop_before, start_index, goalPoleWidth, left_around_goal = false, use_old_method = true
      this.tasks = drive_around_goal_posts( this, p[0], goal1, goal2, p[1], this.options.stopBeforeGoal.val, 0, this.options.goalPoleWidth.val, this.options.leftAround.val );
      //this.tasks.push( new LineTask( this.tasks.length, [p[0], p[1]], false, true ) );
    }


    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}

class DashedJob extends Job
{
  static template_type = "Geometry";
  static template_title = "Dashed";
  static template_id = "geometry_dashed";
  static template_image = "img/templates/geometry_line.png";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      name: "Length",
      val: 15,
      type: "float"
    };
    this.options.Angle = {
      name: "Angle",
      val: 0,
      type: "float"
    };


    this.options.DashLength = {
      configurable: true,
      name: "Dashed length",
      val: 0.15,
      type: "float"
    };
    this.options.DashSpace = {
      configurable: true,
      name: "Dashed space",
      val: 0.15,
      type: "float"
    };

  }

  static get layout_methods()
  {
    return {
      "two_ends": 2,
      "free_hand": 0
    };
  }
  get info_options()
  {
    return [ "Length", "DashLength", "DashSpace" ];
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "two_ends":
        points = this.points;
        break;
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Length.val ).divide( 2 );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found," + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
    this.bb = [ ];
  }
  refresh_handles()
  {
    var this_class = this;
    var p = this.drawing_points;
    this.handles = [ ];
    if( this.layout_method === "free_hand" )
    {
      var the_line = new Line( p[0], p[1] );
      var middle = the_line.middle;
      var move_handle = new Handle( middle, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines )[0];
        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      } );
      this.handles.push( move_handle );

      var g = new Line( p[0], p[1] );
      //var gml = new Line( g.middle, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( new_pos_v, g.middle ).as_vector.angle;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
        this_class.options.Angle.val = new_angle;
        this_class.draw();

      }, function( new_angle )
      {
        console.log( new_angle );
        this_class.options.Angle.val = new_angle;

        this_class.draw();
        return true;
      }, "deg" ) );

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = p[0].dist_to_point( the_line.point_on_line( new_pos_v ) );

        var changed = (new_length - this_class.options.Length.val);
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( changed / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

        this_class.options.Length.val = new_length;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Length.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var l = new Line( p[0], p[1] );
    this.snapping_lines.push( l );

    var g = l.unit_vector.rotate_90_cw();
    var l2 = new Line( p[0], p[0].add( g ) );
    var l3 = new Line( p[1], p[1].add( g ) );

    this.snapping_lines.push( l2 );
    this.snapping_lines.push( l3 );
  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p[0], p[1] ], false, true ) );
    this.tasks[0].task_options.push( new FloatRobotAction( "dashed_length", this.options.DashLength.val ) );
    this.tasks[0].task_options.push( new FloatRobotAction( "dashed_space", this.options.DashSpace.val ) );



    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}


class Ladder extends square_pitch
{
  static template_type = "Test";// Translateable
  static template_title = "Ladder";// Translateable
  static template_id = "test_ladder"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineWidth.val = 0.10; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 3;
    this.options.Width.val = 1;

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.SpaceBetweenSteps = {
      name: "Space between steps",
      val: 0.5,
      type: "float"
    };
    this.options.SpaceBetweenGuide = {
      configurable: true,
      name: "Space between guides",
      val: 0.5,
      type: "float"
    };

    this.options.DrawGuideLines = {
      adjustable: true,
      configurable: true,
      name: "Draw guidelines",
      val: true,
      type: "bool"
    };
    this.options.ZigZag = {
      adjustable: true,
      configurable: true,
      name: "Zig Zag",
      val: true,
      type: "bool"
    };
    this.options.fastMiddle = {
      configurable: true,
      name: "fastMiddle",
      val: true,
      type: "bool"
    };

    this.options.Lines = {
      name: "Lines",
      val: 0,
      type: "int"
    };

  }

  static get layout_methods()
  {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }

  get info_options()
  {
    return [ "Lines", "SpaceBetweenSteps", "SpaceBetweenGuide", "ZigZag" ];
  }

  draw()
  {

    var self = this;
    delete self.calculated_drawing_points;
    self.tasks = [ ];
    self.start_locations = [ ];

    var p = self.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    var p1 = p[1];
    var p2 = p[2];
    var p3 = p[5];
    var p4 = p[6];

    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    // update tasks
    if( this.options.DrawGuideLines.val )
    {
      self.start_locations.push( new StartLocation( c2, self.tasks.length ) );
      self.tasks.push( new LineTask( self.tasks.length, [ c2, c3 ], false, true ) );
      self.tasks.push( new LineTask( self.tasks.length, [ c3, c2 ], false, true ) );

      self.tasks.push( new LineTask( self.tasks.length, [ c1, c4 ], false, true ) );
      self.tasks.push( new LineTask( self.tasks.length, [ c4, c1 ], false, true ) );

    }

    if( !this.options.DrawGuideLines.val )
    {
      self.start_locations.push( new StartLocation( c2, self.tasks.length ) );
    }

    let N = (this.options.Length.val - this.options.LineWidth.val) / this.options.SpaceBetweenSteps.val;
    N = Math.floor(N).coerce( 0, 1000);
    this.options.Lines.val = N + 1;

    var start = c2;
    var end = c1;
    var first = new Line( start, end );
    first = first.add_to_start( -this.options.SpaceBetweenGuide.val ).add_to_end( -this.options.SpaceBetweenGuide.val );

    var middle = this.options.Lines.val / 3;


    for( var i = 0; i < N; i++ )
    {
      self.tasks.push( first.toLineTask( self.tasks.length, false, true ) );

      if( this.options.fastMiddle.val && i >= middle && i <= (N - middle) )
      {
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 2.0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 4.0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 4.0 ) );
      }
      else if( this.options.fastMiddle.val )
      {
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 1.0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 1.0 ) );
      }

      first = first.move( g2, this.options.SpaceBetweenSteps.val );

      if( this.options.ZigZag.val )
        first = first.reverse();
    }


    self.refresh_bb();
    self.refresh_handles();
    self.refresh_test_run();
    self.refresh_snapping_lines();
  }

  refresh_handles()
  {
    super.refresh_handles();

    var this_class = this;
    var p = this_class.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    var start = c2;
    var end = c1;
    var first = new Line( start, end );
    first = first.add_to_start( -this_class.options.SpaceBetweenGuide.val ).add_to_end( -this_class.options.SpaceBetweenGuide.val );
    first = first.move( g2, this_class.options.SpaceBetweenSteps.val );

    this.handles.push( new Handle( first.middle, -this_class.options.Angle.val + Math.PI / 2, "SpaceBetweenSteps", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {

      var ref = new Line( c1, c2 );
      var ref_point = ref.point_on_line( new_pos_v );
      var new_length = ref_point.dist_to_point( new_pos_v );
      this_class.set_new_val( this_class.options.SpaceBetweenSteps, new_length, 0 );



    }, function( new_length )
    {
      return this_class.set_new_val( this_class.options.SpaceBetweenSteps, new_length, 0 );
    } ) );


  }

}


class Calibrate extends square_pitch
{
  static template_type = "Test";// Translateable
  static template_title = "Calibrate";// Translateable
  static template_id = "calibrate_ladder"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineWidth.val = 0.10; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = calibration_screen.number_of_lines * calibration_screen.y_dist;
    this.options.Width.val = 0.5;

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.SpaceBetweenSteps = {
      name: "Space between steps",
      val: calibration_screen.y_dist,
      type: "float"
    };
    this.options.SpaceBetweenGuide = {
      configurable: false,
      name: "Space between guides",
      val: 0.0,
      type: "float"
    };

    this.options.DrawGuideLines = {
      adjustable: false,
      configurable: false,
      name: "Draw guidelines",
      val: false,
      type: "bool"
    };
    this.options.ZigZag = {
      adjustable: false,
      configurable: false,
      name: "Zig Zag",
      val: true,
      type: "bool"
    };
    this.options.fastMiddle = {
      configurable: false,
      name: "fastMiddle",
      val: true,
      type: "bool"
    };

    this.options.Lines = {
      name: "Lines",
      val: 0,
      type: "int"
    };

  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "free_hand": 0
    };
  }

  get info_options()
  {
    return [ "Lines", "SpaceBetweenSteps", "SpaceBetweenGuide", "ZigZag" ];
  }

  draw()
  {

    var self = this;
    delete self.calculated_drawing_points;
    self.tasks = [ ];
    self.start_locations = [ ];

    var p = self.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    var p1 = p[1];
    var p2 = p[2];
    var p3 = p[5];
    var p4 = p[6];

    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    // update tasks
    self.start_locations.push( new StartLocation( c2, self.tasks.length ) );

    let N = (this.options.Length.val - this.options.LineWidth.val) / this.options.SpaceBetweenSteps.val;
    N = N.coerce( 0, 1000);
    this.options.Lines.val = Math.floor(N) + 1;

    var start = c2;
    var end = c1;
    var first = new Line( start, end );
    first = first.add_to_start( -this.options.SpaceBetweenGuide.val ).add_to_end( -this.options.SpaceBetweenGuide.val );

    var middle = this.options.Lines.val / 3;


    for( var i = 0; i < N; i++ )
    {
      self.tasks.push( first.toLineTask( self.tasks.length, false, true ) );

      if( this.options.fastMiddle.val && i % 4 > 1 )
      {
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", calibration_screen.v_fast ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 4.0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 4.0 ) );
      }
      else if( this.options.fastMiddle.val )
      {
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", calibration_screen.v_slow ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 4.0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 4.0 ) );
      }

      first = first.move( g2, this.options.SpaceBetweenSteps.val );

      if( this.options.ZigZag.val )
        first = first.reverse();
    }


    self.refresh_bb();
    self.refresh_handles();
    self.refresh_test_run();
    self.refresh_snapping_lines();
  }

  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;

    // Free hand handles
    if( this.layout_method === "free_hand" )
    {
      var e1 = new Line( p[1], p[2] ).middle;
      var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = new Line( e1, e2 ).middle;
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
    }
  }

}




class WheelsTest extends Job
{
  static template_type = "Test";
  static template_title = "Wheels";
  static template_id = "test_wheels";
  static template_image = "img/templates/wheel_test.png";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      name: "Length",
      val: 4,
      type: "float"
    };
    this.options.Angle = {
      name: "Angle",
      val: 0,
      type: "float"
    };

    this.options.CircleRadius = {
      configurable: true,
      name: "Circle radius",
      val: 0.12,
      type: "float"
    };
    this.options.TimesToRun = {
      configurable: true,
      name: "Times to run",
      val: 1,
      type: "int"
    };

    this.job_options.push( new BoolRobotAction( "navigate_tool", true ) );
    this.job_options.push( new BoolRobotAction( "pathshift_tool", false ) );

  }

  static get layout_methods()
  {
    return {
      "two_ends": 2,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "two_ends" )
    {
      return [
        new Vector( 0.51, 0.90 ),
        new Vector( 0.51, 0.08 )
      ];
    }
  }
  get info_options()
  {
    return [ ];
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "two_ends":
        points = this.points;
        break;
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Length.val ).divide( 2 );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found," + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
    this.bb = [ ];
  }
  refresh_handles()
  {
    var this_class = this;
    var p = this.drawing_points;
    this.handles = [ ];
    if( this.layout_method === "free_hand" )
    {
      var the_line = new Line( p[0], p[1] );
      var middle = the_line.middle;
      var move_handle = new Handle( middle, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines )[0];
        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      } );
      this.handles.push( move_handle );

      var g = new Line( p[0], p[1] );
      //var gml = new Line( g.middle, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( new_pos_v, g.middle ).as_vector.angle;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
        this_class.options.Angle.val = new_angle;
        this_class.draw();

      }, function( new_angle )
      {
        console.log( new_angle );
        this_class.options.Angle.val = new_angle;

        this_class.draw();
        return true;
      }, "deg" ) );

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = p[0].dist_to_point( the_line.point_on_line( new_pos_v ) );

        var changed = (new_length - this_class.options.Length.val);
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( changed / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

        this_class.options.Length.val = new_length;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Length.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var l = new Line( p[0], p[1] );
    this.snapping_lines.push( l );

    var g = l.unit_vector.rotate_90_cw();
    var l2 = new Line( p[0], p[0].add( g ) );
    var l3 = new Line( p[1], p[1].add( g ) );

    this.snapping_lines.push( l2 );
    this.snapping_lines.push( l3 );
  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( p[0], 1 ) );

    this.start_locations.push( new StartLocation( p[1], 0 ) );

    if( this.options.CircleRadius.val > 0.02 )
    {


      var g = (new Line( p[0], p[1] )).unit_vector;
      var gl = g.rotate_90_ccw().multiply( this.options.CircleRadius.val );

      var o = Math.PI * 2 * this.options.CircleRadius.val;

      var k1_start = p[0].add( gl );
      var k1_middle = p[0].subtract( gl );


      var k2_start = p[1].add( gl );
      var k2_middle = p[1].subtract( gl );
      var k2_end = (new Line( p[1], k2_start.subtract( g.multiply( 0.02 ) ) )).unit_vector.multiply( this.options.CircleRadius.val ).add( p[1] );

      for( var n = 0; n < this.options.TimesToRun.val; n++ )
      {
        this.tasks.push( new ArcTask( this.tasks.length, [ k1_start, k1_middle ], p[0], true, false, true ) );
        this.tasks.last().task_options.push( new IntRobotAction( "platform_direction", 2 ) );
        this.tasks.last().action_options.push( new IntRobotAction( "platform_direction", 1 ) );
        this.tasks.last().task_options.push( new FloatRobotAction( "drive_max_velocity", 0.7 ) );

        this.tasks.push( new ArcTask( this.tasks.length, [ k2_end, k2_middle, k2_start ], p[1], false, false, true ) );
        this.tasks.last().action_options.push( new IntRobotAction( "platform_direction", 2 ) );
      }
    }
    else
    {
      this.tasks.push( new WaypointTask( this.test_tasks.length, p[0], false, true ) );
      this.tasks.push( new WaypointTask( this.test_tasks.length, p[1], false, true ) );
    }

    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}


class PositionDelayCalibration extends Job
{
  static template_type = "Test";
  static template_title = "Position Delay";
  static template_id = "test_position_deleay";
  static template_image = "img/templates/wheel_test.png";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      name: "Length",
      val: 8,
      type: "float"
    };
    this.options.Angle = {
      name: "Angle",
      val: 0,
      type: "float"
    };

    /*this.options.CircleRadius = {
     configurable: true,
     name: "Circle radius",
     val: 2.0,
     type: "float"
     };*/
    this.options.TimesToRun = {
      configurable: true,
      name: "Times to run",
      val: 1,
      type: "int"
    };

    this.options["disableGPS"] = {
      get configurable()
      {
        login_screen_controller.user_level === user_level.DEVELOPER;
      },
      name: "disableGPS",
      val: false,
      type: "bool"
    };

  }

  static get layout_methods()
  {
    return {
      "two_ends": 2,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "two_ends" )
    {
      return [
        new Vector( 0.51, 0.90 ),
        new Vector( 0.51, 0.08 )
      ];
    }
  }
  get info_options()
  {
    return [ ];
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "two_ends":
        points = this.points;
        break;
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Length.val ).divide( 2 );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found," + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
    this.bb = [ ];
  }
  refresh_handles()
  {
    var this_class = this;
    var p = this.drawing_points;
    this.handles = [ ];
    if( this.layout_method === "free_hand" )
    {
      var the_line = new Line( p[0], p[1] );
      var middle = the_line.middle;
      var move_handle = new Handle( middle, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines )[0];
        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      } );
      this.handles.push( move_handle );

      var g = new Line( p[0], p[1] );
      //var gml = new Line( g.middle, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( new_pos_v, g.middle ).as_vector.angle;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
        this_class.options.Angle.val = new_angle;
        this_class.draw();

      }, function( new_angle )
      {
        console.log( new_angle );
        this_class.options.Angle.val = new_angle;

        this_class.draw();
        return true;
      }, "deg" ) );

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = p[0].dist_to_point( the_line.point_on_line( new_pos_v ) );

        var changed = (new_length - this_class.options.Length.val);
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( changed / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

        this_class.options.Length.val = new_length;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Length.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var l = new Line( p[0], p[1] );
    this.snapping_lines.push( l );

    var g = l.unit_vector.rotate_90_cw();
    var l2 = new Line( p[0], p[0].add( g ) );
    var l3 = new Line( p[1], p[1].add( g ) );

    this.snapping_lines.push( l2 );
    this.snapping_lines.push( l3 );
  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    var r = this.options.Length.val / 4;

    var middle = (new Line( p[0], p[1] )).middle;

    var g1 = (new Line( p[0], p[1] )).unit_vector.multiply( r );
    var g2 = g1.rotate_90_cw();

    var top = p[1];
    var bottom = p[0];
    var c1 = middle.add( g1 );
    var c2 = middle.subtract( g1 );
    var top_left = c1.subtract( g2 );
    var top_right = c1.add( g2 );
    var bottom_left = c2.subtract( g2 );
    var bottom_right = c2.add( g2 );

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( middle, 0 ) );


    for( var n = 0; n < this.options.TimesToRun.val; n++ )
    {
      this.tasks.push( new ArcTask( this.tasks.length, [ middle, top_left, top ], c1, true, false, true ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ top, top_right, middle ], c1, true, false, true ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ middle, bottom_left, bottom ], c2, false, false, true ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ bottom, bottom_right, middle ], c2, false, false, true ) );
    }

    if( this.options.disableGPS && this.options.disableGPS.val )
    {
      this.job_options.push( new BoolRobotAction( "disable_gnss", true ) );
    }


    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}


class yCalibrate extends Job
{
  static template_type = "Calibrate";
  static template_title = "Y";
  static template_id = "calibrate_y";
  static template_image = "img/templates/geometry_line.png";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      name: "Total length",
      val: 4,
      type: "float"
    };
    this.options.Angle = {
      name: "Angle",
      val: 0,
      type: "float"
    };

    this.options.Gab = {
      configurable: true,
      name: "Gab",
      val: 0.2,
      type: "float"
    };

    this.options.reverse = {
      configurable: true,
      adjustable: true,
      name: "Reverse",
      val: false,
      type: "bool"
    };

    this.options.driving_speed = {
      configurable: true,
      name: "Driving speed",
      val: 0.5,
      type: "float"
    };

    this.options.ramp_up = {
      configurable: true,
      name: "Ramp up",
      val: 2,
      type: "float"
    };

    this.options.ramp_down = {
      configurable: true,
      name: "Ramp down",
      val: 2,
      type: "float",
      parrent: "ramp_up"
    };


  }

  static get layout_methods()
  {
    return {
      "two_ends": 2,
      "free_hand": 0
    };
  }
  get info_options()
  {
    return [ "Length", "Gab" ];
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "two_ends":
        points = this.points;
        break;
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Length.val ).divide( 2 );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found," + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
    this.bb = [ ];
  }
  refresh_handles()
  {
    var this_class = this;
    var p = this.drawing_points;
    this.handles = [ ];
    if( this.layout_method === "free_hand" )
    {
      var the_line = new Line( p[0], p[1] );
      var middle = the_line.middle;
      var move_handle = new Handle( middle, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines )[0];
        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      } );
      this.handles.push( move_handle );

      var g = new Line( p[0], p[1] );
      //var gml = new Line( g.middle, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( new_pos_v, g.middle ).as_vector.angle;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
        this_class.options.Angle.val = new_angle;
        this_class.draw();

      }, function( new_angle )
      {
        console.log( new_angle );
        this_class.options.Angle.val = new_angle;

        this_class.draw();
        return true;
      }, "deg" ) );

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = p[0].dist_to_point( the_line.point_on_line( new_pos_v ) );

        var changed = (new_length - this_class.options.Length.val);
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( changed / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

        this_class.options.Length.val = new_length;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Length.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var l = new Line( p[0], p[1] );
    this.snapping_lines.push( l );

    var g = l.unit_vector.rotate_90_cw();
    var l2 = new Line( p[0], p[0].add( g ) );
    var l3 = new Line( p[1], p[1].add( g ) );

    this.snapping_lines.push( l2 );
    this.snapping_lines.push( l3 );
  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );



    var whole = new Line( p[0], p[1] );
    var g = whole.unit_vector.multiply( this.options.Gab.val / 2 + this.options.LineWidth.val / 2 );
    var middle = whole.middle;


    var m1 = middle.add( g );
    var m2 = middle.subtract( g );



    this.tasks.push( new LineTask( this.tasks.length, [ p[0], m2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p[1], m1 ], false, true ) );

    this.tasks[0].task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options.ramp_up.val ) );
    this.tasks[0].task_options.push( new FloatRobotAction( "ramp_down_max_dist", this.options.ramp_down.val ) );
    this.tasks[0].task_options.push( new FloatRobotAction( "drive_max_velocity", this.options.driving_speed.val ) );
    this.tasks[1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", this.options.ramp_up.val ) );
    this.tasks[1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", this.options.ramp_down.val ) );
    this.tasks[1].task_options.push( new FloatRobotAction( "drive_max_velocity", this.options.driving_speed.val ) );

    if( this.options.reverse.val )
    {
      this.tasks[0].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
      this.tasks[1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
    }

    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Length.val = g.length;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}