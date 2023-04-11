/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global s2p2 */
/* global this, five_degrees_equal */
class Quidditch extends square_pitch_dont_resize
{
  static template_type = "Quadball"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "quidditch"; // no spaces
  static template_image = "img/templates/quidditch_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    var this_class = this;

    this.options.Length.val = 60; //max length
    this.options.Width.val = 33; //max width

    // Goal Line and Keeper Zone Line is measured from the midline, not from the end line. 
    this.options.GoalLine = {
      configurable: false,
      "dontsave": false,
      name: "Goal Line",
      type: "float",
      _val: 16.5 - this_class.options.LineWidth.val,
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      }
    };

    this.options.KeeperZoneLine = {
      configurable: false,
      "dontsave": false,
      name: "Keeper Zone Line",
      type: "float",
      _val: 11 - this_class.options.LineWidth.val,
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      }
    };

    this.options["Team Area"] = {
      configurable: true,
      "dontsave": false,
      name: "Team Area",
      type: "bool",
      val: false
    };
    this.options.TeamSize = {
      configurable: false,
      "dontsave": false,
      name: "Team Area width",
      type: "float",
      _val: 2.75 - this_class.options.LineWidth.val,
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "Team Area"
    }

    this.options["Penalty Area"] = {
      configurable: true,
      "dontsave": false,
      name: "Penalty Area",
      type: "bool",
      val: false
    };
    this.options.PenaltySize = {
      configurable: false,
      "dontsave": false,
      name: "Penalty Area length/width",
      type: "float",
      _val: 5.5 - this_class.options.LineWidth.val,
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "Penalty Area"
    }

    this.options["Ball Marks"] = {
      configurable: true,
      "dontsave": false,
      name: "Ball markings",
      type: "bool",
      val: true
    };
    this.options.BallSize = {
      configurable: false,
      "dontsave": false,
      name: "Ball marking radius",
      type: "float",
      _val: 0.12,
      get val()
      {
        return this._val + this_class.options.LineWidth.val / 2;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.01 + this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val / 2;
      },
      prev_sibling: "Ball Marks"
    }
    this.options.ball_1 = {
      configurable: false,
      "dontsave": false,
      name: "Ball 1",
      type: "float",
      val: 2.75
    };
    this.options.ball_2 = {
      configurable: false,
      "dontsave": false,
      name: "Ball 2",
      type: "float",
      val: 8.25
    };

    this.options["Goals"] = {
      configurable: true,
      "dontsave": false,
      name: "Goal marking",
      type: "bool",
      val: true
    };
    this.options.GoalSize = {
      configurable: false,
      "dontsave": false,
      name: "Goal marking radius",
      type: "float",
      _val: 0.12,
      get val()
      {
        return this._val + this_class.options.LineWidth.val / 2;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.01 + this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val / 2;
      },
      prev_sibling: "Goals"
    }
    this.options.goal_pos = {
      configurable: false,
      "dontsave": false,
      name: "Goal position from center",
      type: "float",
      val: 2.34
    };
  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      //"two_corners": 2,
      //"two_corners,side": 3,
      //"all_corners": 4,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( -0.010, 1.01 ),
        new Vector( -0.010, 0.25 )
      ]
    }

//    if( layout_method === "two_corners" )
//    {
//      return [
//        new Vector( -0.010, 1.01 ),
//        new Vector( -0.010, -0.05 )
//      ]
//    }
//
//    if( layout_method === "two_corners,side" )
//    {
//      return [
//        new Vector( -0.010, 1.01 ),
//        new Vector( -0.010, -0.05 ),
//        new Vector( 1.035, 0.25 )
//      ]
//    }
//
//    if( layout_method === "all_corners" )
//    {
//      return [
//        new Vector( -0.010, -0.05 ),
//        new Vector( 1.035, -0.05 ),
//        new Vector( 1.035, 1.01 ),
//        new Vector( -0.010, 1.01 )
//      ]
//    }
  }

  draw_s3( goal_line, keeper_line, keep )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    var s3 = new Line( c2, c3 );
    var s4 = new Line( c4, c1 );
    var middle = new Line( s4.middle, s3.middle );

    var s3_g2 = s3.unit_vector;
    var s3_g1 = s3_g2.rotate_90_ccw();

    // penalty area
    var penalty_size = this.options.PenaltySize._val;

    var corner_1_on_line = middle.end.subtract( s3_g2.multiply( penalty_size + this.options.LineWidth.val / 2 ) );
    var corner_1 = corner_1_on_line.add( s3_g1.multiply( this.options.LineWidth.val / 2 ) );
    var corner_2 = corner_1.add( s3_g1.multiply( penalty_size ) );
    var corner_3 = corner_2.add( s3_g2.multiply( penalty_size * 2 + this.options.LineWidth.val ) );
    var corner_4_on_line = middle.end.add( s3_g2.multiply( penalty_size + this.options.LineWidth.val / 2 ) );
    var corner_4 = corner_4_on_line.add( s3_g1.multiply( this.options.LineWidth.val / 2 ) );

    var l1 = new Line( corner_1, corner_2 );
    var l2 = new Line( corner_2, corner_3 );
    var l3 = new Line( corner_3, corner_4 );
    var l4 = new Line( corner_4, corner_1 );

    var midpoint_1 = l2.middle.subtract( s3_g2.multiply( this.options.LineWidth.val / 2 ) );
    var midpoint_2 = l2.middle.add( s3_g2.multiply( this.options.LineWidth.val / 2 ) );

    var mid_1 = l4.middle.subtract( s3_g2.multiply( this.options.LineWidth.val / 2 ) );
    var mid_2 = l4.middle.add( s3_g2.multiply( this.options.LineWidth.val / 2 ) );

    // team areas
    var team_size = this.options.TeamSize.val;

    // side 1
    var t1_c1 = keep[0].add( s3_g1.multiply( team_size ) );
    var t1_c2 = c2.add( s3_g1.multiply( team_size ) );
    var t1_c3 = t1_c2.add( s3_g1.multiply( team_size ) );
    var t1_c4 = t1_c1.add( s3_g1.multiply( team_size ) );

    // side 2
    var t2_c1 = c3.add( s3_g1.multiply( team_size ) );
    var t2_c2 = keep[1].add( s3_g1.multiply( team_size ) );
    var t2_c3 = t2_c2.add( s3_g1.multiply( team_size ) );
    var t2_c4 = t2_c1.add( s3_g1.multiply( team_size ) );

    if( this.options["Penalty Area"].val && !this.options["Team Area"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, corner_1_on_line ], false, true ) );
      this.tasks.push( l1.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( l3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ corner_4, mid_2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ mid_2, midpoint_2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ midpoint_1, mid_1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ mid_1, corner_1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ corner_1_on_line, c3 ], false, true ) );
    }
    else if( !this.options["Penalty Area"].val && this.options["Team Area"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, keep[0] ], false, true ) );

      // team area - side 1
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c1, t1_c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c2, t1_c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c3, t1_c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c4, t1_c1 ], false, true ) );

      this.tasks.push( new LineTask( this.tasks.length, [ keep[0], c3 ], false, true ) );

      // team area - side 2
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c1, t2_c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c2, t2_c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c3, t2_c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c4, t2_c1 ], false, true ) );
    }
    else if( this.options["Penalty Area"].val && this.options["Team Area"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, keep[0] ], false, true ) );

      // team area - side 1
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c1, t1_c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c2, t1_c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c3, t1_c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t1_c4, t1_c1 ], false, true ) );

      // penalty area
      this.tasks.push( new LineTask( this.tasks.length, [ keep[0], corner_1_on_line ], false, true ) );
      this.tasks.push( l1.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( l3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ corner_4, mid_2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ mid_2, midpoint_2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ midpoint_1, mid_1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ mid_1, corner_1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ corner_1_on_line, c3 ], false, true ) );

      // team area - side 2
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c1, t2_c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c2, t2_c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c3, t2_c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ t2_c4, t2_c1 ], false, true ) );
    }
    else
      this.tasks.push( s3.toLineTask( this.tasks.length, false, true ) );
  }

  draw_goalline( gl_p1, gl_p2 )
  {
    var goal_line = new Line( gl_p1, gl_p2 );
    var g1 = goal_line.unit_vector;
    var g2 = g1.rotate_90_cw();

    var goal_rad = this.options.GoalSize._val;

    var center = goal_line.middle;
    var goal_1 = center.add( g1.multiply( this.options.goal_pos.val ) );
    var goal_2 = center.subtract( g1.multiply( this.options.goal_pos.val ) );

    var goals = [ goal_2, center, goal_1 ];

    if( this.options["Goals"].val )
    {
      var start = gl_p1;
      for( var i = 0; i < goals.length; i++ )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ start, goals[i].add( g1.multiply( -goal_rad ) ) ], false, true ) );

        this.tasks.push( new ArcTask( this.tasks.length, [ goals[i].add( g1.multiply( -goal_rad ) ),
          goals[i].add( g1.multiply( goal_rad ) ) ], goals[i], true, false, true ) );
        start = goals[i].add( g1.multiply( -goal_rad ) );
      }

      this.tasks.push( new LineTask( this.tasks.length, [ start, gl_p2 ], false, true ) );
    }
    else
      this.tasks.push( new LineTask( this.tasks.length, [ gl_p1, gl_p2 ], false, true ) );
  }

  draw_midfield( p1, p2 )
  {
    var midline = new Line( p1, p2 );
    var g1 = midline.unit_vector;
    var g2 = g1.rotate_90_cw();

    var mark_rad = this.options.BallSize._val;

    var center = midline.middle;
    var ball_1 = center.subtract( g1.multiply( this.options.ball_2.val ) );
    var ball_2 = center.subtract( g1.multiply( this.options.ball_1.val ) );
    var ball_3 = center.add( g1.multiply( this.options.ball_1.val ) );
    var ball_4 = center.add( g1.multiply( this.options.ball_2.val ) );

    var ball = [ ball_1, ball_2, ball_3, ball_4 ];
    var start = p1;
    if( this.options["Ball Marks"].val )
    {
      for( var i = 0; i < ball.length; i++ )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ start, ball[i].add( g1.multiply( -mark_rad ) ) ], false, true ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ ball[i].add( g1.multiply( -mark_rad ) ),
          ball[i].add( g1.multiply( mark_rad ) ) ], ball[i], true, false, true ) );
        start = ball[i].add( g1.multiply( -mark_rad ) );
      }
      this.tasks.push( new LineTask( this.tasks.length, [ start, p2 ], false, true ) );
    }
    else
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );

  }
  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var s1 = new Line( c1, c2 );
    var s2 = new Line( c3, c4 );
    var s3 = new Line( c2, c3 );
    var s4 = new Line( c4, c1 );

    var s1_g1 = s1.unit_vector;
    var s1_g2 = s1_g1.rotate_90_cw();
    var s2_g1 = s2.reverse().unit_vector;
    var s2_g2 = s2_g1.rotate_90_cw();
    var s3_g2 = s3.unit_vector;
    var s3_g1 = s3_g2.rotate_90_ccw();
    var s4_g2 = s4.reverse().unit_vector;
    var s4_g1 = s4_g2.rotate_90_ccw();

    var middle = new Line( s4.middle, s3.middle );
    var mid_g1 = middle.unit_vector;
    var mid_g2 = mid_g1.rotate_90_cw;

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( s1.toLineTask( this.tasks.length, false, true ) );

    // calculate inner lines - we need keeper line for team area calculations
    var goal_line = this.options.GoalLine._val;
    var keeper_line = this.options.KeeperZoneLine._val;

    // side 1
    var goal1_p1 = middle.start.subtract( s4_g2.multiply( goal_line ) );
    var goal1_p2 = middle.end.subtract( s3_g2.multiply( goal_line ) );
    var keep1_p1 = middle.end.subtract( s3_g2.multiply( keeper_line ) );
    var keep1_p2 = middle.start.subtract( s4_g2.multiply( keeper_line ) );

    // side 2    
    var goal2_p1 = middle.start.add( s4_g2.multiply( goal_line ) );
    var goal2_p2 = middle.end.add( s3_g2.multiply( goal_line ) );
    var keep2_p1 = middle.end.add( s3_g2.multiply( keeper_line ) );
    var keep2_p2 = middle.start.add( s4_g2.multiply( keeper_line ) );

    var keep = [ keep1_p1, keep2_p1 ];

    this.draw_s3( goal_line, keeper_line, keep );

    this.tasks.push( s2.toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( s4.toLineTask( this.tasks.length, false, true ) );

    // draw inner lines
    this.draw_goalline( goal1_p1, goal1_p2 );
    this.tasks.push( new LineTask( this.tasks.length, [ keep1_p1, keep1_p2 ], false, true ) );
    this.draw_midfield( s4.middle, s3.middle );
    this.tasks.push( new LineTask( this.tasks.length, [ keep2_p1, keep2_p2 ], false, true ) );
    this.draw_goalline( goal2_p1, goal2_p2 );


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class US_Quidditch extends Quidditch
{
  static template_type = "Quadball"; // Translateable
  static template_title = "US"; // Translateable
  static template_id = "us_quidditch"; // no spaces
  static template_image = "img/templates/quidditch_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.Length.val = (66).yard2meter(); //max length
    this.options.Width.val = (36).yard2meter(); //max width

    // Goal Line and Keeper Zone Line is measured from the midline, not from the end line. 
    this.options.GoalLine._val = (18).yard2meter() - this_class.options.LineWidth.val;
    this.options.KeeperZoneLine._val = (12).yard2meter() - this_class.options.LineWidth.val;

    this.options["Team Area"].val = false;
    this.options.TeamSize._val = (3).yard2meter() - this_class.options.LineWidth.val;

    this.options["Penalty Area"].val = false;
    this.options.PenaltySize._val = (6).yard2meter() - this_class.options.LineWidth.val;

    this.options["Ball Marks"].val = true;
    this.options.ball_1.val = (3).yard2meter();
    this.options.ball_2.val = (9).yard2meter();

    this.options["Goals"].val = true;
    this.options.goal_pos.val = (92).inch2meter();
  }
}