/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class AthleticsRounders extends Job
{
  static template_type = "Athletics";// Translateable
  static template_title = "Rounders";// Translateable
  static template_id = "athletics_rounders"; // no spaces
  static template_image = "img/templates/athletics_rounders_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["Batsmen waiting line"] = {
      adjustable: true,
      configurable: true,
      name: "Batsmen waiting line",
      val: false,
      type: "bool"
    };
    this.options["Batsmen out line"] = {
      adjustable: true,
      configurable: true,
      name: "Batsmen out line",
      val: false,
      type: "bool"
    };

    this.options["post_length"] = {
      configurable: true,
      name: "Post length",
      val: 12,
      type: "float"
    };

  }
  get info_options()
  {
    return [ ];
  }

  static get layout_methods()
  {
    return {
      "fixed_corners": 2,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "fixed_corners" )
    {
      return [
        new Vector( 0.57, 1.02 ),
        new Vector( 0.57, 0.9 )
      ];
    }
  }

  get center()
  {
    return this.points[0];
  }
  get drawing_points()
  {

    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "fixed_corners": //center + kickboard
        points = this.from2PointsTo2Points( this.points );
        break;
      case "free_hand":
        //points = regular layout??
        points = this.fromStartTo2Points( this.points[0] );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    if( this.layout_method !== "free_hand" )
      this.options.Angle.val = (new Line( points[0], points[1] )).angle;

    this.calculated_drawing_points = points;
    return points;
  }
  from2PointsTo2Points( p )
  {
    var l = new Line( p[1], p[0] );
    l = l.unit_vector.multiply( 2 );
    return [ p[1].add( l ), p[1] ];
  }
  fromStartTo2Points( p )
  {
    var g = new Vector( 2, 0 );
    g = g.rotate( this.options.Angle.val );

    var p2 = p.subtract( g );
    return [ p2, p ];
  }

  make_side_copy( i, space, n )
  {
    var l = Math.sqrt( this.options["post_length"].val * this.options["post_length"].val / 2 );
    var plus = l * 2 + 2; // Forward/backwards
    if( i % 2 )
      plus = l * 2; // Sideways

    var angle = this.options.Angle.val;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  draw()
  {
    this.tasks = [ ];
    this.start_locations = [ ];
    // update tasks
    delete this.calculated_drawing_points;
    var p = this.drawing_points;
    var p1 = p[0];
    var p2 = p[1];
    var g1 = (new Line( p1, p2 )).unit_vector; // Forward direction
    var g2 = g1.rotate_90_cw();
    var g3 = g1.rotate( -Math.PI / 4 );
    var g4 = g3.rotate_90_ccw();
    var l = Math.sqrt( this.options["post_length"].val * this.options["post_length"].val / 2 );

    var BattingSquareSize = (new Line( p1, p2 )).length;
    this.start_locations.push( new StartLocation( p2, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p2, p1 ], false, true ) );

    var battingBoxP3 = p2.subtract( g2.multiply( BattingSquareSize ) );
    var battingBoxP4 = p1.subtract( g2.multiply( BattingSquareSize ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p1, battingBoxP4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ battingBoxP4, battingBoxP3 ], false, true ) );

    var firstPost = p2.add( g3.multiply( this.options["post_length"].val ) );
    var secondPost = firstPost.add( g4.multiply( this.options["post_length"].val ) );
    var thirdPost = secondPost.add( g3.multiply( -this.options["post_length"].val ) );
    var backline_start = p2.add( g2.multiply( -l - 2 ) );
    var backline_end = p2.add( g2.multiply( 12 ) );
    var backline = new Line( backline_start, backline_end );
    var firthPost = backline.point_on_line( thirdPost );

    var bowling_square_start = p2.add( g1.multiply( l - 1 ) ).add( g2.multiply( -1.25 ) );
    var bowling_square_p2 = bowling_square_start.add( g2.multiply( 2.5 ) );
    var bowling_square_p3 = bowling_square_p2.add( g1.multiply( 2.5 ) );
    var bowling_square_p4 = bowling_square_p3.add( g2.multiply( -2.5 ) );

    this.tasks.push( (new Line( p2, firstPost )).add_to_end( 2 ).toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( (new Line( firstPost, secondPost )).add_to_end( 2 ).toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( (new Line( secondPost, thirdPost )).add_to_end( 2 ).toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ bowling_square_start, bowling_square_p2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ bowling_square_p2, bowling_square_p3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ bowling_square_p3, bowling_square_p4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ bowling_square_p4, bowling_square_start ], false, true ) );

    this.tasks.push( (new Line( thirdPost, firthPost )).add_to_end( 2 ).toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ backline_start, backline_end ], false, true ) );

    if( this.options["Batsmen out line"].val )
    {
      var batsmen_out_line_end = backline_end.add( g1.multiply( -10 ) );
      var batsmen_out_line_start = batsmen_out_line_end.add( g2.multiply( 3 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ batsmen_out_line_start, batsmen_out_line_end ], false, true ) );
    }

    var backback_line_start = p1.add( g1.multiply( -1 ) ).add( g2.multiply( 1 ) );
    var backback_line_end = battingBoxP4.add( g1.multiply( -1 ) ).add( g2.multiply( -1 ) );
    this.tasks.push( new LineTask( this.tasks.length, [ backback_line_start, backback_line_end ], false, true ) );

    if( this.options["Batsmen waiting line"].val )
    {
      var batsmen_waiting_line_start = p2.add( g1.multiply( -10 ) ).add( g2.multiply( -2 - 2 - 8.5 ) );
      var batsmen_waiting_line_end = batsmen_waiting_line_start.add( g2.multiply( -3 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ batsmen_waiting_line_start, batsmen_waiting_line_end ], false, true ) );
    }

    // Update test_tasks
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p2 ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, firstPost ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, secondPost ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, thirdPost ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, firthPost ) );

    // Update bb
    this.bb = [ p2, firstPost, secondPost, thirdPost, firthPost ];

    // Update handles
    this.refresh_handles();

    // Update snapping lines
    this.snapping_lines = [ ];

    this.snapping_lines.push( backline );
    this.snapping_lines.push( new Line( p2, p1 ) );
  }

  refresh_handles()
  {
    this.handles = [ ];
    var p = this.drawing_points;
    var p1 = p[0];
    var p2 = p[1];
    var this_class = this;

    this.handles.push( new Handle( p2, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
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


    var g1 = (new Line( p1, p2 )).unit_vector; // Forward direction

    var g3 = g1.rotate( -Math.PI / 4 );
    var g4 = g3.rotate_90_ccw();
    var firstPost = p2.add( g3.multiply( this.options["post_length"].val ) );
    var secondPost = firstPost.add( g4.multiply( this.options["post_length"].val ) );

    var gml = new Line( p2, secondPost ).as_vector.angle - this.options.Angle.val;
    this.handles.push( new Handle( secondPost, this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
    {

      var new_angle = new Line( p2, new_pos_v ).as_vector.angle - gml;
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
    // Calculate width,length,angle
    var p = this.drawing_points;

    this.points = [ p[1] ];
    this.layout_method = "free_hand";
    this.options.Angle.val = (new Line( p[0], p[1] )).angle;
    
    delete this.calculated_drawing_points;
    this.draw();
  }
}