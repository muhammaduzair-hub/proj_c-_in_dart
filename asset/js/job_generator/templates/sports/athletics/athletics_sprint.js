/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class AthleticsSprint extends Job
{
  static template_type = "athletics";// Translateable
  static template_title = "sprint";// Translateable
  static template_id = "athletics_sprint"; // no spaces
  static template_image = "img/templates/athletics_sprint_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    this.options.RunningLength = {
      configurable: true,
      name: "Running length",
      val: 100,
      type: "float"
    };
    this.options.Lanes = {
      configurable: true,
      name: "Lanes",
      val: 6,
      type: "float",
      units: "number"
    };

    this.options.AfterGoal = {
      configurable: true,
      name: "Run out",
      val: true,
      type: "bool"
    };
    this.options.AfterGoalLength = {
      get configurable()
      {
        return this_class.options.AfterGoal.val;
      },
      name: "Run out length",
      _val: 10,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 0 )
          v = 0;
        if( (v / this_class.options.CurveRadius.val) > Math.PI && this_class.options.CurveEnd.val )
        {
          this._val = Math.PI * this_class.options.CurveRadius.val;
        }
        else
          this._val = v;
      },
      type: "float",
      prev_sibling: "AfterGoal"
    };
    this.options.CurveRadius = {
      get configurable()
      {
        return this_class.options.CurveEnd.val && this_class.options.AfterGoal.val;
      },
      name: "Curve radius",
      _val: 72.9 / 2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 0.0001 )
          v = 0.0001;
        this._val = v;
        this_class.options.AfterGoalLength.val = this_class.options.AfterGoalLength._val;
      },
      type: "float",
      prev_sibling: "CurveEnd"
    };
    this.options.CurveEnd = {
      get configurable()
      {
        return this_class.options.AfterGoal.val;
      },
      name: "Curve run out",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        this_class.options.AfterGoalLength.val = this_class.options.AfterGoalLength._val;
      },
      type: "bool",
      prev_sibling: "AfterGoal"
    };
    this.options.CurveLeft = {
      get configurable()
      {
        return this_class.options.CurveEnd.val && this_class.options.AfterGoal.val;
      },
      name: "Curve left",
      val: true,
      type: "bool",
      prev_sibling: "CurveEnd"
    };


    this.options.BeforeGoal = {
      configurable: true,
      name: "Before start line",
      val: true,
      type: "bool"
    };
    this.options.BeforeGoalLength = {
      get configurable()
      {
        return this_class.options.BeforeGoal.val;
      },
      name: "Before start line length",
      val: 10,
      type: "float",
      prev_sibling: "BeforeGoal"
    };
    this.options.TrackWidth = {
      configurable: true,
      name: "TrackWidth",
      val: 1.22,
      type: "float"
    }; // inner

    this.options.DriveOneWay = {
      configurable: true,
      name: "Drive one way",
      val: true,
      type: "bool"
    };


  }

  get info_options()
  {
    return [ "RunningLength" ];
  }

  static get layout_methods()
  {
    return {
      "start,goal": 2,
      "free_hand": 0
    };
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "start,goal":
        points = this.points.reverse();
        break;
      case "free_hand":
        points = this.fromOneTo2Points( this.points[0] );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    if( this.layout_method !== "free_hand" )
    {
      var l = new Line( points[0], points[1] );
      this.options.Angle.val = l.angle;
      this.options.RunningLength.val = l.length;
    }

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }
  get center()
  {
    var p = this.drawing_points;
    return (new Line( p[0], p[1] )).middle;
  }
  fromOneTo2Points( p )
  {
    var g = new Vector( this.options.RunningLength.val, 0 );
    g = g.rotate( this.options.Angle.val );

    var p2 = p.subtract( g );
    return [ p, p2 ];
  }

  draw()
  {
    this.tasks = [ ];
    this.start_locations = [ ];
    // update tasks
    delete this.calculated_drawing_points;
    var p = this.drawing_points;
    var goal_p = p[0];
    var start_p = p[1];
    var g1 = (new Line( start_p, goal_p )).unit_vector; // Forward direction
    var g2 = g1.rotate_90_cw();

    // Create lanes
    var inner_line = new Line( start_p, goal_p );
    var end_start, end_end, last_goal, last_start, before_start, before_end;

    let arc_angles = this.options.AfterGoalLength.val / this.options.CurveRadius.val;

    this.start_locations.push( new StartLocation( start_p, 0 ) );
    for( var i = 0; i <= this.options.Lanes.val; i++ )
    {
      var ref_line = inner_line.move( g2, this.options.TrackWidth.val * i );
      last_start = ref_line.start; // Safe for later use
      if( this.options.BeforeGoal.val && this.options.BeforeGoalLength.val > 0 )
        ref_line = ref_line.add_to_start( this.options.BeforeGoalLength.val );

      this.tasks.push( new LineTask( this.tasks.length, [ ref_line.start, ref_line.end ], false, true ) );

      if( this.options.AfterGoal.val && this.options.AfterGoalLength.val > 0 )
      {
        if( this.options.CurveEnd.val )
        {
          let r = this.options.CurveRadius.val;
          //let r = 4 * this.options.AfterGoalLength.val / (2 * Math.PI);
          let use_arc_angles = arc_angles;
          if( this.options.CurveLeft.val )
            r += this.options.TrackWidth.val * i;
          else
          {
            r += this.options.TrackWidth.val * (this.options.Lanes.val - i);
            use_arc_angles *= -1;
          }


          let arc_start = ref_line.end;
          let arc_center;
          if( this.options.CurveLeft.val )
            arc_center = arc_start.add( g2.multiply( -r ) );
          else
            arc_center = arc_start.add( g2.multiply( r ) );

          let ref_line_guide = (new Line( arc_center, arc_start )).as_vector;
          let arc_middle = arc_center.add( ref_line_guide.rotate( use_arc_angles / 2 ) );
          let arc_end = arc_center.add( ref_line_guide.rotate( use_arc_angles ) );


          //arc_end = arc_center.add( g1.multiply( r ) );

          //let arc_middle_guide = (new Line( arc_start, arc_end )).middle;
          //let arc_middle = (new Line( arc_center, arc_middle_guide )).unit_vector.multiply( r ).add( arc_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ arc_start, arc_middle, arc_end ], arc_center, !this.options.CurveLeft.val, false, true ) );
          //this.tasks.push( new LineTask( this.tasks.length, [ arc_center, arc_start, arc_middle, arc_end ], false, true ) );

        }
        else
        {
          var rest = ref_line.add_to_end( this.options.AfterGoalLength.val );
          this.tasks.push( new LineTask( this.tasks.length, [ ref_line.end, rest.end ], false, true ) );
        }
      }
      if( !end_start )
        end_start = this.tasks.last().ends.last();
      end_end = this.tasks.last().ends.last();
      last_goal = ref_line.end;
      if( !before_start )
        before_start = ref_line.start;
      before_end = ref_line.start;

      if( !this.options.DriveOneWay.val && (i % 2) )
      {
        if( this.options.AfterGoal.val && this.options.AfterGoalLength.val > 0 )
        {
          var arc = this.tasks.last();
          this.tasks[this.tasks.length - 1] = this.tasks[this.tasks.length - 2];
          this.tasks[this.tasks.length - 2] = arc;
          this.tasks[this.tasks.length - 2] = this.tasks[this.tasks.length - 2].opposite_direction;
        }
        this.tasks[this.tasks.length - 1] = this.tasks.last().opposite_direction;
      }
    }

    // create before,start,goal,end lines
    if( !this.options.DriveOneWay.val && !(this.options.Lanes.val % 2) )
    {
      if( this.options.AfterGoal.val && this.options.AfterGoalLength.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ end_end, end_start ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ last_goal, goal_p ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ start_p, last_start ], false, true ) );
      if( this.options.BeforeGoal.val && this.options.BeforeGoalLength.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ before_end, before_start ], false, true ) );
    }
    else
    {
      if( this.options.BeforeGoal.val && this.options.BeforeGoalLength.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ before_end, before_start ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ start_p, last_start ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ last_goal, goal_p ], false, true ) );
      if( this.options.AfterGoal.val && this.options.AfterGoalLength.val > 0 )
        this.tasks.push( new LineTask( this.tasks.length, [ end_end, end_start ], false, true ) );
    }

    // Update bb
    this.bb = [
      start_p,
      start_p.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) ),
      goal_p.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) ),
      goal_p ];


    // Update test_tasks
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, this.bb[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, this.bb[1] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, this.bb[2] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, this.bb[3] ) );


    // Update handles
    this.refresh_handles();

    this.refresh_snapping_lines( );
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var p1 = p[0];
    var p2 = p[1]; // Goal ?
    var g1 = (new Line( p1, p2 )).unit_vector; // Forward direction
    var g2 = g1.rotate_90_cw();

    this.snapping_lines.push( new Line( p1, p2 ) );
    this.snapping_lines.push( new Line( p2, p2.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) ) ) );
    this.snapping_lines.push( new Line( p1, p1.add( g2.multiply( this.options.TrackWidth.val * this.options.Lanes.val ) ) ) );

  }

  refresh_handles()
  {
    this.handles = [ ];
    var p = this.drawing_points;
    var p1 = p[0];
    var p2 = p[1];
    var this_class = this;

    this.handles.push( new Handle( p1, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
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


    var gml = new Line( p1, p2 ).as_vector.angle - this.options.Angle.val;
    this.handles.push( new Handle( p2, this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
    {

      var new_angle = new Line( p1, new_pos_v ).as_vector.angle - gml;
      new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];

      this_class.options.Angle.val = new_angle;
      delete this.calculated_drawing_points;
      this_class.draw();

    }, function( new_angle )
    {
      return this_class.set_new_val( this_class.options.Angle, new_angle );
    }, "deg" ) );

  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;

    this.points = [ p[0] ];
    this.layout_method = "free_hand";

    var l = new Line( p[1], p[0] );
    this.options.Angle.val = l.angle;
    this.options.RunningLength.val = l.length;

    delete this.calculated_drawing_points;
    this.draw();
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "center" )
    {
      return [
        new Vector( 0.5, 0.5 )
      ];
    }
    if( layout_method === "start,goal" )
    {
      return [
        new Vector( 0.35, 0.72 ),
        new Vector( 0.35, 0.25 )
      ];
    }
  }

  make_side_copy( i, space, n )
  {
    var plus = this.options.Length ? this.options.Length.val : 0;
    if( i % 2 )
      plus = this.options.Width ? this.options.Width.val : 0;
    if( !this.options.Width && !this.options.Length && this.options.Radius )
    {
      plus = this.options.Radius.val * 2;
    }
    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }
}