/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global this, developer_screen, SETTINGS, math, split_controller, translate, login_screen_controller */

class GeometryJob extends Job
{
  static template_type = "Geometry";
  constructor( id, name, layout_method )
  {
    if( layout_method === "corner,side" )
      layout_method = "two_ends";
    super( id, name, layout_method );


    // configurable = can be changed on creation
    // adjustable = can be changed on modification
  }

  get can_edit_when_offline()
  {
    return this.source === JobSource.USB;
  }
  set can_edit_when_offline( v )
  {
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
  }
}

class PointJob extends GeometryJob
{
  static template_title = "Point";
  static template_id = "geometry_point";
  static template_image = "img/templates/geometry_point.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.labels = [ ];
    this.waypoint_options = [];

    this.start_from.afterChangeCallback = this._start_from_changed.bind(this);
    
    const self = this;

    this.options.Points = {
      name: "Points",
      get val()
      {
        return self.drawing_points.length;
      },
      set val( v )
      {},
      type: "int",
      min: 0,
      dontsave: true
    };
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.Reverse = {
      adjustable: true,
      name: "Reverse",
      val: false,
      type: "bool"
    };

    this.options["Robot reverse"] = {
      get configurable()
      {
        return self.source === JobSource.CLOUD;
      },
      name: "Robot reverse",
      _val: false,
      get val()
      {
        return self.options["Robot reverse"]._val && self.options["Robot reverse"].configurable;
      },
      set val(v)
      {
        self.options["Robot reverse"]._val = !!v;
      },
      type: "bool"
    };
    this.options.Split = {
      get adjustable()
      {
        return self.isSplittable;
      },
      set adjustable( v )
      {},
      get configurable()
      {
        return self.isSplittable;
      },
      set configurable( v )
      {},
      name: "Split",
      val: general_settings_screen.settings.split_job.val,
      type: "bool",
      robot_capability: "spline",
      special_screen: ["", "fit_screen"]
    };

    this.options.relative_center = {
      name: "relative_center",
      val: {
        x: 0,
        y: 0
      },
      type: "vector"
    };

    this.options.FitType = {
      name: "Convert to",
      type: "select",
      val: undefined,
      set values(v)
      {},
      get values()
      {
        const values = [
          "None",
          "Line",
          "Polyline",
          "Circle",
          "Circles",
          "Bezier",
          "Spline"
        ];
        if( login_screen_controller.user_level === user_level.DEVELOPER )
        {
          values.push("Clothoid");
        }
        return values;
      },
      configurable: true,
      special_screen: ["fit_screen"]
    }

    this.options.CircleRadius = {
      get configurable()
      {
        return self.options.FitType.val === "Circles";
      },
      name: "Circle radius",
      val: 0.06,
      type: "float",
      special_screen: ["fit_screen"],
      prev_sibling: "FitType"
    };

    this.options.FitBSplineSmoothness = {
      name: "Smoothness",
      get configurable()
      {
        return false && self.options.FitType.val === "Spline";
      },
      set configurable( v )
      {},
      val: -1,
      min: 0,
      type: "float",
      special_screen: ["fit_screen"]
    };
  }

  _start_from_changed()
  {
    if( this.start_locations.length > 0 && this.start_from.isStartLocation && this.start_from.id !== this.tasks[0].id )
    {
      
    }
  }

  get length()
  {
    let length = 0;
    if( this.tasks.length === 0 )
      this.draw();
    this.tasks.forEach( ( task, idx ) =>
    {
      if(idx === 0)
        return;

      length += task.end.dist_to_point(this.tasks[idx-1].end);
    } );
    return length;
  }

  get end_location()
  {
    const id = this.start_from.id;
    const result = this.start_locations.find(sl=>sl.task_id!==id);
    
    return result ? result : super.end_location;
  }
  set end_location(v)
  {}

  static get template_title()
  {
    return "Point";
  }
  static get layout_methods()
  {
    return {
      "n_ends": -1
    };
  }
  get info_options()
  {
    return [ "Points" ];
  }

  get allow_fit()
  {
    return this.points.length > 1;
  }
  set allow_fit( v )
  {}

  copy( dont_draw )
  { // override if special
    var new_job = new this.constructor( this.id, this.name, this.layout_method );
    this.copy_job_options_to_job(new_job);
    new_job.points = this.points.copy();
    new_job.allow_revisions = this.allow_revisions;
    new_job.projection = this.projection;
    new_job.proj_alias = this.proj_alias;
    // new_job.start_from.id = this.start_from.id;
    // new_job.start_from.percent = this.start_from.percent;
    new_job.start_locations = this.start_locations.copy();
    new_job.start_from = this.start_from;
    new_job.start_from.job = new_job;
    new_job.start_from.afterChangeCallback = new_job._start_from_changed.bind(new_job);
    new_job.editable = this.editable;
    new_job.labels = this.labels;
    new_job.source = this.source;
    new_job.waypoint_options = this.waypoint_options;
    if( !dont_draw )
      new_job.draw();
    return new_job;
  }

  get original_center()
  {
    if( this._original_center )
      return this._original_center;

    this._original_center = math.mean( this.points.map( ( p ) => {
      return p.toArray();
    } ), 0 ).toVector();

    return this.original_center;
  }

  get center()
  {
    return this.relative_center.add( this.original_center );
  }

  set center( v )
  {
    this.relative_center = v.subtract( this.original_center );
  }

  get relative_center()
  {
    return new Vector( this.options.relative_center.val.x, this.options.relative_center.val.y );
  }

  set relative_center( v )
  {
    this.options.relative_center.val.x = v.x;
    this.options.relative_center.val.y = v.y;
  }

  get drawing_points()
  {
    var p = this.points.copy().map( ( p ) => {
      return p.add( this.relative_center );
    } );

    if( this.options.Reverse.val )
      p = p.reverse();

    return p;
  }

  get isSplittable()
  {
    if( this.allow_fit )
    {
      switch( this.options.FitType.val )
      {
        // case "Line":
        case "Polyline":
        case "Spline":
        case "Bezier":
        // case "Circle":
          return true;
        default:
          return false
      }
    }
    return false;
  }

  draw()
  {

    this.tasks = [ ];
    this.start_locations = [ ];

    let split_tasks = true;
    if( this.allow_fit )
    {
      switch( this.options.FitType.val )
      {
        case "Line":
          this.draw_line();
          break;
        case "Polyline":
          this.draw_polyline();
          break;
        case "Circle":
          this.draw_circle();
          break;
        case "Spline":
          this.draw_bspline();
          break;
        case "Bezier":
          this.draw_bezier();
          break;
        case "Clothoid":
          this.draw_clothoid();
          break;
        case "None":
        default:
          this.draw_points();
          split_tasks = false;
      }
    }
    else
    {
      split_tasks = false;
      this.draw_points();
    }

    if(split_tasks)
    {
      this.tasks = split_controller.split_tasks( this.tasks, !this.options.Split.val );
    }

    if( this.options["Robot reverse"].val )
    {
      for( var i = 0; i < this.tasks.length; i++ )
      {
        this.tasks[i].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
        SETTINGS.backwards_max_speed && this.tasks[i].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
      }
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }

  draw_points()
  {
    var points = this.drawing_points;

    var create_labels;
    if( this.labels && this.labels.length === points.length )
    {
      let s = [ ];
      this.labels.forEach( ( l ) => {
        s.push( !!l ? 1 : 0 );
      } );
      create_labels = math.sum( s ) === 0;
    }
    else
    {
      create_labels = true;
    }

    if( create_labels )
    {
      var labels = [ ];
      for( var i = 0; i < points.length; i++ )
      {
        labels.push( translate["Point"] + (this.options.Reverse.val ? points.length - 1 - i : i) );
      }
    }
    else
    {
      var labels = this.labels;
    }
    
    for( var i = 0; i < points.length; i++ )
    {   
      let id = this.options.Reverse.val ? points.length - 1 - i : i;
      let waypoint;  
      if( this.options.FitType.val === "Circles" )
      {
        waypoint = this.convertPointToCircle(id, points[i], points[i+1], this.options.CircleRadius.val);
      }
      else
      {
        waypoint = new WaypointTask( id, points[i], false, false );
      }
      waypoint.label = labels[id];

      if (this.waypoint_options.length > 0)
      {
        if (this.waypoint_options[i].paint)
        {
          waypoint.paint = true;
        }
        else
        {
          waypoint.via = true;
        }      
        waypoint.task_options = this.waypoint_options[i].task_options;
        waypoint.action_options = this.waypoint_options[i].action_options;
      }
      else
      {
        waypoint.paint = true;
      }

      this.tasks.push( waypoint ); 
    }
    
    this.start_locations.push( new StartLocation( this.tasks[0].start, this.tasks[0].id ) );
  }
  convertPointToCircle(id, this_point, next_point, radius)
  {
    const v1 = next_point ? new Vector( this_point, next_point ).unit_vector : new Vector( 1, 0 );
    const v2 = new Line( this_point, v1 ).unit_vector;
    const v3 = this_point.subtract( v2.multiply( radius ) );
    const v4 = this_point.add( v2.multiply( radius ) );
    return new ArcTask( id, [ v4, v3 ], this_point, false, false, true );
  }
  draw_line()
  {
    var p = this.drawing_points;

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.tasks.push( new FitLine( p ).getLineTask( 0, false, true ) );
    this.tasks[0].label = translate["Line"];
  }
  draw_polyline()
  {
    var p = this.drawing_points;

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.tasks.push( new LineTask( 0, p, false, true ) );
    this.tasks[0].label = translate["Polyline"];
  }
  draw_circle()
  {
    var p = this.drawing_points;
    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.tasks.push( new FitCircle( p ).getCircleTask( 0, true, false, true ) );
    this.tasks[0].label = translate["Circle"];

    if( this.options["Robot reverse"].val )
    {
      this.tasks[0].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
      SETTINGS.backwards_max_speed && this.tasks[0].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    }
  }
  draw_bspline()
  {
    var p = this.drawing_points;

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.tasks.push( new FitBSpline( p, this.options.FitBSplineSmoothness.val ).getSplineTask( 0, false, true ) );
    this.tasks[0].label = translate["BSpline"];
  }
  draw_bezier()
  {
    var p = this.drawing_points;

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    this.tasks.push( new CubicBezierTask( 0, p, false, true ) );
    this.tasks[0].label = translate["Bezier"];
  }
  draw_clothoid()
  {
    let p = this.drawing_points;

    if( this.options.Reverse.val )
      p = p.reverse();

    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    let tasks = [ ];

    let options = {

      // Penalty for each linear curvature piece
      penalty: 5 / 1000,

      // Inversely scale penalty with input size?
      penalty_scale: false,

      // Use only clothoid type curves for clothoid generation
      using_only_clothoid: false,

      // Allow use of G3 continuities
      using_G3: false,

      // Allow use of G1 discontinuities
      using_G1: false,

      // Curve threshold for G1 discontinuities
      g1discontCurvThresh: 1.0 / 100,

      // Endpoint weight
      endPointWeight: 100,

      // Is clothoid closed?
      using_closed: false
    };

    const C = new ClothoidSpline( p, options );
    C.setupTasks();

    this.tasks = this.tasks.concat( this.options.Reverse.val ? C.getTasks().map( task => task.opposite_direction ).reverse() : C.getTasks() );
    this.tasks[0].label = translate["Clothoid"];
  }
  refresh_bb()
  {
    var p = this.drawing_points;

    var top = this.center.y;
    var bottom = this.center.y;
    var left = this.center.x;
    var right = this.center.x;

    p.forEach( function( p )
    {
      if( top < p.y )
        top = p.y;
      if( bottom > p.y )
        bottom = p.y;
      if( left > p.x )
        left = p.x;
      if( right < p.x )
        right = p.x;
    } );

    this.bb = [ new Vector( left, top ), new Vector( right, top ), new Vector( left, bottom ), new Vector( right, bottom ) ];
  }
  refresh_handles()
  {
    var self = this;
    this.handles = [ ];
    var move_handle = new Handle( self.center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
    {
      self.center = new_pos_v;
      self.draw();
    }, function( new_pos_v )
    {
      self.center = new_pos_v;
      self.draw();
    } );
    this.handles.push( move_handle );
  }
  convert_to_free_hand()
  {
//    this.drawing_points = this.center;
    console.error( "convert_to_freehand not implemented" );
  }
}

class LineJob extends GeometryJob
{
  static template_title = "Line";
  static template_id = "geometry_line";
  static template_image = "img/templates/geometry_line.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length = {
      adjustable: true,
      name: "Length",
      val: 40,
      type: "float"
    };
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.TwoWay = {
      adjustable: true,
      name: "TwoWay",
      val: false,
      type: "bool"
    };
    this.options.Reverse = {
      adjustable: true,
      name: "Reverse",
      val: false,
      type: "bool"
    };
    this.options["Robot reverse"] = {
      configurable: true,
      name: "Robot Reverse",
      val: false,
      type: "bool"
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
  static get template_title()
  {
    return "Line";
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

        var before = this_class.options.Length.val;
        var after = new_length;
        var moved = before - after;
        var move_v = new Vector( 1, 0 ).rotate( this_class.options.Angle.val ).multiply( -moved / 2 );
        this_class.points[0] = this_class.points[0].add( move_v );

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

    if( this.options.Reverse.val )
      this.tasks.push( new LineTask( this.tasks.length, [ p[1], p[0] ], false, true ) );
    else
      this.tasks.push( new LineTask( this.tasks.length, [ p[0], p[1] ], false, true ) );

    if( this.options.disableGPS && this.options.disableGPS.val )
    {
      this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "disable_gnss", true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
    }

    if( this.options["Robot reverse"].val )
    {
      this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
      SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    }

    if( this.options.TwoWay.val )
    {
      this.start_locations.push( new StartLocation( p[1], this.tasks.length ) );

      if( this.options.Reverse.val )
        this.tasks.push( new LineTask( this.tasks.length, [ p[0], p[1] ], false, true ) );
      else
        this.tasks.push( new LineTask( this.tasks.length, [ p[1], p[0] ], false, true ) );

      if( this.options["Robot reverse"].val )
      {
        this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
        SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
        this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 1 ) );
      }
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

class EllipsisJob extends GeometryJob {
  static template_title = "Ellipsis";
  static template_id = "geometry_ellipsis_dev";
  static template_image = "img/templates/geometry_ellipsis_black.png";
  constructor(id, name, layout_method) {
    super(id, name, layout_method);

    let thisClass = this;

    this.options.majorAxisLength = {
      name: "Major axis",
      adjustable: true,
      val: 5,
      type: "float"
    }

    this.options.minorAxisLength = {
      name: "Minor axis",
      adjustable: true,
      val: 3,
      type: "float"
    }

    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    }
    this.options.drawFromDegrees = {
      name: "Draw from",
      configurable: true,
      _val: 0,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        if (v < 0) {
          this._val = 0;
        }
        else {
          this._val = v;
        }
      }
    }
    this.options.drawToDegrees = {
      name: "Draw to",
      configurable: true,
      _val: 360,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        if (v > 360) {
          this._val = 360;
        }
        else {
          this._val = v;
        }
      }
    }
    this.options.Clockwise = {
      configurable: true,
      name: "Draw clockwise",
      val: false, // default draw direction is positive, IE: counter-clockwise
      type: "bool"
    }
  }
    
  static get template_title() {
    return "Ellipsis";
  }

  static get layout_methods() {
    return {
      "free_hand": 0
    };
  }

  get info_options()
  {
    return [ "majorAxisLength" ];
  }


  get center() {
    let points = this.drawing_points;
    let center = new Line(points[0], points[1]).middle;
    return center;
  }

  get drawing_points() {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    let points = [];
    switch( this.layout_method ) {
      case "free_hand":
        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_ccw();
        const center = this.points[0];
        const majorEnd1 = center.add(horizontalVector.multiply(0.5 * this.options.majorAxisLength.val - 0.5 * this.options.LineWidth.val));
        const majorEnd2 = center.subtract(horizontalVector.multiply(0.5 * this.options.majorAxisLength.val - 0.5 * this.options.LineWidth.val));
        const minorEnd1 = center.add(verticalVector.multiply(0.5 * this.options.minorAxisLength.val - 0.5 * this.options.LineWidth.val));
        const minorEnd2 = center.subtract(horizontalVector.multiply(0.5 * this.options.minorAxisLength.val - 0.5 * this.options.LineWidth.val));

        points = [majorEnd1, majorEnd2, minorEnd1, minorEnd2];
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    this.calculated_drawing_points = points;
    return points;
  }

  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [];
    this.start_locations = [];

    const points = this.drawing_points;
    const majorEnd1 = points[0];
    const minorEnd1 = points[2];

    const drawFromRadians = (this.options.drawFromDegrees.val - 90).deg2rad(); // Start from majorEnd2, hence -90 degrees
    const drawToRadians = (this.options.drawToDegrees.val - 90).deg2rad(); // End at majorEnd2, hence -90 degress

    this.tasks.push(new EllipseTask(this.tasks.length, [majorEnd1, minorEnd1], [drawFromRadians, drawToRadians], this.center, this.options.Clockwise.val, false, true ));

    this.start_locations.push(new StartLocation( this.tasks[0].start, this.tasks[0].id ));

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }

  refresh_bb() {
    let points = this.drawing_points;
    let minorAxisLine = new Line(points[2], points[3]);
    let guideVector = minorAxisLine.as_vector.multiply(0.5);
    let b1 = points[0].add(guideVector);
    let b2 = points[1].add(guideVector);
    let b3 = points[1].subtract(guideVector);
    let b4 = points[0].subtract(guideVector);
    this.bb = [b1, b2, b3, b4];
  }

  refresh_handles() {
    let thisClass = this;
    let points = this.drawing_points;
    this.handles = [];

    if (this.layout_method === "free_hand") {
      const majorEnd1 = points[0];
      const majorEnd2 = points[1];
      const minorEnd1 = points[2];
      const minorEnd2 = points[3];
      const center = new Line(majorEnd1, majorEnd2).middle;

      const move_handle = new Handle( center, 0, "Move", "move_handle", "yellow_move_handle", function( newPosV, snappingLines ) {
        thisClass.points = [ newPosV ];
        delete thisClass.calculated_drawing_points;
        thisClass.draw();

        let align_this = thisClass.get_align_move( thisClass.snapping_lines, snappingLines )[0];
        thisClass.points = [ newPosV.subtract( align_this ) ];
        delete thisClass.calculated_drawing_points;
        thisClass.draw();

      }, function( new_pos_v ) {
        thisClass.points = [ new_pos_v ];
        delete thisClass.calculated_drawing_points;
        thisClass.draw();
      } );

      const majorGuideLine = new Line(majorEnd1, majorEnd2);
      
      const rotate_handle = new Handle( points[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( newPosV, snappingLines ) {
        let newAngle = new Line( newPosV, majorGuideLine.middle ).as_vector.angle;
        newAngle = thisClass.get_snap_rotation( newAngle, snappingLines )[0];
        thisClass.options.Angle.val = newAngle;
        thisClass.draw();
      }, 
      function( newAngle ){
        console.log( newAngle );
        thisClass.options.Angle.val = newAngle;

        thisClass.draw();
        return true;
      }, "deg" );
      
      const majorAxisHandle = new Handle( points[1], -this.options.Angle.val + Math.PI / 2, "majorAxisLength", "Handle", "Yellow_Handle", function( newPosV )
      {
        let newMajorAxisLength = center.dist_to_point( majorGuideLine.point_on_line( newPosV ) ) * 2;
        thisClass.options.majorAxisLength.val = newMajorAxisLength / 2;
        thisClass.draw();

      }, function( newMajorAxisLength )
      {
        if( newMajorAxisLength <= 0 ) {
          return false;
        }

        thisClass.options.majorAxisLength.val = newMajorAxisLength;
        thisClass.draw();
        return true;
      } );
      
      const minorGuideLine = new Line(minorEnd1, minorEnd2);
      const minorAxisHandle = new Handle( points[2], -this.options.Angle.val, "minorAxisLength", "Handle", "Yellow_Handle", function( newPosV )
      {
        let newMinorAxisLength = center.dist_to_point( minorGuideLine.point_on_line( newPosV ) ) * 2;
        thisClass.options.minorAxisLength.val = newMinorAxisLength / 2;
        thisClass.draw();

      }, function( newMinorAxisLength )
      {
        if( newMinorAxisLength <= 0 ) {
          return false;
        }

        thisClass.options.minorAxisLength.val = newMinorAxisLength;
        thisClass.draw();
        return true;
      } );

      this.handles.push(move_handle);
      this.handles.push(rotate_handle);
      this.handles.push(majorAxisHandle);
      this.handles.push(minorAxisHandle);
    }
  }
  refresh_snapping_lines() {
    const points = this.drawing_points;
    const majorEnd1 = points[0];
    const majorEnd2 = points[1];
    const minorEnd1 = points[2];
    const minorEnd2 = points[3];
    const center = points[4];

    this.snapping_lines = [];

    const majorAxisSnap = new Line(majorEnd1, majorEnd2);
    const minorAxisSnap = new Line(minorEnd1, minorEnd2);

    this.snapping_lines.push(majorAxisSnap);
    this.snapping_lines.push(minorAxisSnap);
  }
}

class CircleJob extends GeometryJob
{
  static template_title = "Circle";
  static template_id = "geometry_circle";
  static template_image = "img/templates/geometry_circle.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Radius = {
      adjustable: true,
      name: "Radius",
      val: 2,
      type: "float"
    };
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.DrawDegrees = {
      configurable: true,
      name: "Draw degrees",
      val: 360,
      min: 0,
      max: 360,
      type: "float",
      units: "deg"
    };
    this.options.Clockwise = {
      configurable: true,
      name: "Clockwise",
      val: true,
      type: "bool"
    };
  }
  static get template_title()
  {
    return "Circle";
  }
  static get layout_methods()
  {
    return {
      "center": 1,
      "two_ends": 2,
      "free_hand": 0
    };
  }

  get info_options()
  {
    return [ "Radius" ];
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
      case "center":
      case "free_hand":
        var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );

        g1 = g1.multiply( this.options.Radius.val );

        var e1 = this.points[0].subtract( g1 );
        var e2 = this.points[0].add( g1 );

        points = [ e1, e2 ];
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    // Calculate length,angle
    var p = points;
    var g = new Line( p[0], p[1] );
    this.options.Radius.val = g.length / 2;
    this.options.Angle.val = g.as_vector.angle;

    // Save for later use
    this.calculated_drawing_points = points;
    return points;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[1] );
    var g1 = g.as_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
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

      this.handles.push( new Handle( p[1], -this.options.Angle.val + Math.PI / 2, "Radius", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_length = middle.dist_to_point( the_line.point_on_line( new_pos_v ) ) * 2;
        this_class.options.Radius.val = new_length / 2;
        this_class.draw();

      }, function( new_length )
      {
        if( new_length === 0 )
          return false;

        this_class.options.Radius.val = new_length;
        this_class.draw();
        return true;
      } ) );
    }
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    this.snapping_lines.push( new Line( p[0], p[1] ) );

    var g = (new Line( p[0], p[1] )).unit_vector.rotate_90_cw();
    this.snapping_lines.push( new Line( this.center.add( g ), this.center.subtract( g ) ) );

    if( this.tasks[0] && this.tasks[0].ends.length === 3 )
      this.snapping_lines.push( new Line( this.tasks[0].ends[0], this.tasks[0].ends[2] ) );

  }
  draw()
  {
    delete this.calculated_drawing_points;
    var p = this.drawing_points;

    this.tasks = [ ];
    this.start_locations = [ ];
    this.start_locations.push( new StartLocation( p[0], this.tasks.length ) );

    // this.tasks.push(new WaypointTask(this.tasks.length, p[0], false, true)); // REMOVE THIS
    // this.tasks.push(new WaypointTask(this.tasks.length, p[1], false, true)); // REMOVE THIS

    //id, ends, center, clockwise, reverse, paint
    if( this.options.DrawDegrees.val >= 360 )
      this.tasks.push( new ArcTask( this.tasks.length, [ p[0], p[1] ], this.center, this.options.Clockwise.val, false, true ) );
    else
    {
      let c = this.center;
      let g = (new Line( c, p[0] )).as_vector;
      let a = this.options.DrawDegrees.val * Math.PI / 180;
      if( this.options.Clockwise.val )
        a *= -1;
      let p2 = c.add( g.rotate( a / 2 ) );
      let p3 = c.add( g.rotate( a ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ p[0], p2, p3 ], this.center, this.options.Clockwise.val, false, true ) );
    }

    this.test_tasks = [ ];
    var tvers = (new Line( p[0], p[1] ));
    var mid = tvers.middle;
    var g = tvers.as_vector.multiply( 0.5 ).rotate_90_ccw();
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, mid.add( g ) ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, mid.subtract( g ) ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    this.options.Radius.val = g.length / 2;
    this.options.Angle.val = g.as_vector.angle;

    this.points = [ g.middle ];
    this.layout_method = "free_hand";

    delete this.calculated_drawing_points;
    this.draw();
  }
}


