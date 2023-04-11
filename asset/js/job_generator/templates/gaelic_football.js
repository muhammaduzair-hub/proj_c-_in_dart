/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor. 
 */

class GaelicFootball extends square_pitch
{
  static template_type = "Soccer";
  static template_title = "Gaelic";
  static template_id = "soccer_gaelic";
  static template_image = "img/templates/gealic_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 145; // Max Value
    this.options.Width.val = 90; // Max Value
    this.options.GoalWidth.val = 6.5;
    this.options.goalPoleWidth.val = 0.09;
    this.options.addLineLengthInSides.val = false;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options ["Scalability"] = {
      configurable: true,
      name: "Scalability",
      val: false,
      type: "bool"
    };
    this.options ["CenterLine"] = {
      configurable: true,
      name: "Center Line",
      val: 2.4,
      type: "float"
    };

    this.options.Clockwise = {
      configurable: false,
      name: "Clockwise",
      val: false,
      type: "bool"
    };

    this.options ["13m line"] = {
      configurable: false,
      name: "13m line",
      val: true,
      type: "bool"
    };

    this.options ["20m line"] = {
      configurable: true,
      name: "20m line",
      val: true,
      type: "bool"
    };

    this.options ["45m line"] = {
      configurable: true,
      name: "45m line",
      val: true,
      type: "bool"
    };


    this.options ["65m line"] = {
      configurable: true,
      name: "65m line",
      val: true,
      type: "bool"
    };

    this.options.reverseInGoal = {
      adjustable: false,
      configurable: false,
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
      this.options.reverseInGoal.val = true;
  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    // Goal posts 
    var c5 = p[1];
    var c6 = p[2];
    var c7 = p[5];
    var c8 = p[6];
    if( this.options ["Scalability"].val === false )
    {
      var n4 = 4.5;
      var n3 = 3.75;
      var n6 = 6.25;
      var n11 = 11.0;
      var n11kickdot1 = 11.05;
      var n11kickdot2 = 10.95;
      var n13 = 13.0;
      var n20 = 20.0;
      var n45 = 45.0;
      var n65 = 65.0;
      var n33 = 33.0;
    }
    else
    {
      this.options.GoalWidth.val = (6.5 / 145 * this.options.Length.val);
      var n4 = (4.5 / 145 * this.options.Length.val);
      var n3 = (3.75 / 90 * this.options.Width.val);
      var n6 = (6.25 / 90 * this.options.Width.val);
      var n11 = (11 / 145 * this.options.Length.val);
      var n11kickdot1 = (11.05 / 145 * this.options.Length.val);
      var n11kickdot2 = (10.95 / 145 * this.options.Length.val);
      var n33 = (33 / 145 * this.options.Length.val);
      var n13 = (13 / 145 * this.options.Length.val);
      var n20 = (20 / 145 * this.options.Length.val);
      var n45 = (45 / 145 * this.options.Length.val);
      var n65 = (65 / 145 * this.options.Length.val);

    }
    var g1 = new Line( c5, c6 ).unit_vector;
    var g2 = g1.rotate_90_cw();
    var g3 = new Line( c7, c8 ).unit_vector;
    var g4 = g3.rotate_90_cw();

    var g5 = new Line( c5, c8 ).unit_vector;
    var g6 = new Line( c6, c7 ).unit_vector;
    var g7 = new Line( c8, c5 ).unit_vector;
    var g8 = new Line( c7, c6 ).unit_vector;
    var c1c4 = new Line( c1, c4 );
    var c2c3 = new Line( c2, c3 );
    var midc5c6 = new Line( c5, c6 ).middle;
    var midc7c8 = new Line( c7, c8 ).middle;
    var g9 = new Line( midc5c6, midc7c8 ).middle;





    // Small goal right side
    var smallgoalr1 = c5.subtract( g1.multiply( n3 ) );
    var smallgoalr2 = smallgoalr1.add( g2.multiply( n4 ) );
    var smallgoalr3 = c6.add( g1.multiply( n3 ) );
    var smallgoalr4 = smallgoalr3.add( g2.multiply( n4 ) );

    // Small goal left side
    var smallgoall1 = c7.subtract( g3.multiply( n3 ) );
    var smallgoall2 = smallgoall1.add( g4.multiply( n4 ) );
    var smallgoall3 = c8.add( g3.multiply( n3 ) );
    var smallgoall4 = smallgoall3.add( g4.multiply( n4 ) );
    // Big goal right side

    var biggoalr1 = c5.subtract( g1.multiply( n6 ) );
    var biggoalr2 = biggoalr1.add( g5.multiply( n13 ) );

    var biggoalr3 = c6.add( g1.multiply( n6 ) );
    var biggoalr4 = biggoalr3.add( g6.multiply( n13 ) );
    /// Big goal left side 
    var biggoall1 = c7.subtract( g3.multiply( n6 ) );
    var biggoall2 = biggoall1.add( g7.multiply( n13 ) );

    var biggoall3 = c8.add( g3.multiply( n6 ) );
    var biggoall4 = biggoall3.add( g8.multiply( n13 ) );
    // Kick dot 11 m right side
    var kickdotrh = midc5c6.add( g2.multiply( n11 ) );
    var kickdotrh1 = midc5c6.add( g2.multiply( n11kickdot1 ) );
    var kickdotrh2 = midc5c6.add( g2.multiply( n11kickdot2 ) );

    // Kick dot 11 m left side
    var kickdotlh = midc7c8.subtract( g3.multiply( n11 ).rotate_90_ccw() );
    var kickdotlh1 = midc7c8.subtract( g3.multiply( n11kickdot1 ).rotate_90_ccw() );
    var kickdotlh2 = midc7c8.subtract( g3.multiply( n11kickdot2 ).rotate_90_ccw() );


    // center line
    var centerLine1 = g9.add( g1.multiply( this.options.CenterLine.val / 2 ) );
    var centerLine2 = g9.subtract( g1.multiply( this.options.CenterLine.val / 2 ) );


    // 13 m crossLines right half
    var cross13rh1 = new Line( biggoalr2, biggoalr4 ).cross_with_line( c1c4 );
    var cross13rh2 = new Line( biggoalr2, biggoalr4 ).cross_with_line( c2c3 );
    // 13 m crossLines left half
    var cross13lh1 = new Line( biggoall2, biggoall4 ).cross_with_line( c1c4 );
    var cross13lh2 = new Line( biggoall2, biggoall4 ).cross_with_line( c2c3 );
    // 65 m line right half
    var line65rh = c5.add( g2.multiply( n65 ) );
    var line65rh1 = c6.add( g2.multiply( n65 ) );
    var cross65rh2 = new Line( line65rh, line65rh1 ).cross_with_line( c1c4 );
    var cross65rh3 = new Line( line65rh, line65rh1 ).cross_with_line( c2c3 );

    // 65 m line left half
    var line65lh = c7.add( g4.multiply( n65 ) );
    var line65lh1 = c8.add( g4.multiply( n65 ) );
    var cross65lh2 = new Line( line65lh, line65lh1 ).cross_with_line( c1c4 );
    var cross65lh3 = new Line( line65lh, line65lh1 ).cross_with_line( c2c3 );

    // 45 m line right half
    var line45rh = c5.add( g2.multiply( n45 ) );
    var line45rh1 = c6.add( g2.multiply( n45 ) );
    var cross45rh2 = new Line( line45rh, line45rh1 ).cross_with_line( c1c4 );
    var cross45rh3 = new Line( line45rh, line45rh1 ).cross_with_line( c2c3 );

    // 45 m line left half
    var line45lh = c8.add( g4.multiply( n45 ) );
    var line45lh1 = c7.add( g4.multiply( n45 ) );
    var cross45lh2 = new Line( line45lh, line45lh1 ).cross_with_line( c1c4 );
    var cross45lh3 = new Line( line45lh, line45lh1 ).cross_with_line( c2c3 );


    // 20 m line right half
    var line20rh = c5.add( g2.multiply( n20 ) );
    var line20rh1 = c6.add( g2.multiply( n20 ) );
    var cross20rh2 = new Line( line20rh, line20rh1 ).cross_with_line( c1c4 );
    var cross20rh3 = new Line( line20rh, line20rh1 ).cross_with_line( c2c3 );

    // 20 m line left half
    var line20lh = c8.add( g4.multiply( n20 ) );
    var line20lh1 = c7.add( g4.multiply( n20 ) );
    var cross20lh2 = new Line( line20lh, line20lh1 ).cross_with_line( c1c4 );
    var cross20lh3 = new Line( line20lh, line20lh1 ).cross_with_line( c2c3 );

    // Arc right half 20 m line
    var mid20line_r = midc5c6.add( g2.multiply( n20 ) );
    var spot1_r = midc5c6.subtract( g1.multiply( n13 ) );
    var spot2_r = spot1_r.add( g2.multiply( n20 ) );
    var spot3_r = midc5c6.add( g1.multiply( n13 ) );
    var spot4_r = spot3_r.add( g2.multiply( n20 ) );
    var toparc_r = midc5c6.add( g2.multiply( n33 ) );
    // arc left half 20 m line
    var mid20line_l = midc7c8.add( g4.multiply( n20 ) );
    var spot1_l = midc7c8.subtract( g3.multiply( n13 ) );
    var spot2_l = spot1_l.add( g4.multiply( n20 ) );
    var spot3_l = midc7c8.add( g3.multiply( n13 ) );
    var spot4_l = spot3_l.add( g4.multiply( n20 ) );
    var toparc_l = midc7c8.add( g4.multiply( n33 ) );


    var new_tasks_right_end = drive_around_posts(
      {
  
        task_before: new LineTask( this.tasks.length, [ c1, c5 ], false, true ),
        task_after: new LineTask( this.tasks.length, [ c6, c2 ], false, true ),
        poles: [ c5, c6 ],
        pole_width: this.options.goalPoleWidth.val,
        left_around: false,
        start_index: this.tasks.length
  
      } );
  
      var new_tasks_left_end = drive_around_posts(
      {
  
        task_before: new LineTask( this.tasks.length, [ c3, c7 ], false, true ),
        task_after: new LineTask( this.tasks.length, [ c8, c4 ], false, true ),
        poles: [ c7, c8 ],
        pole_width: this.options.goalPoleWidth.val,
        left_around: false,
        start_index: this.tasks.length
  
      } );


    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    if( this.options.reverseInGoal.val === true )
    {
      this.tasks.pushAll( new_tasks_right_end );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, c5 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c5, c6 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c6, c2 ], false, true ) );

    }
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );

    if( this.options.reverseInGoal.val === true )
    {
      this.tasks.pushAll( new_tasks_left_end );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c7 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c7, c8 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c8, c4 ], false, true ) );

    }


    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

    // small goals in right side
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoalr1, smallgoalr2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoalr2, smallgoalr4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoalr4, smallgoalr3 ], false, true ) );


    // kick dot right side

    this.tasks.push( new ArcTask( this.tasks.length, [ kickdotrh1, kickdotrh2 ], kickdotrh, false, false, true ) );
    // Big goals in right side
    this.tasks.push( new LineTask( this.tasks.length, [ biggoalr1, biggoalr2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ biggoalr3, biggoalr4 ], false, true ) );



    // 13 m lines right side
    this.tasks.push( new LineTask( this.tasks.length, [ cross13rh2, cross13rh1 ], false, true ) );
    // 20 m lines right side
    if( this.options ["20m line"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ cross20rh2, cross20rh3 ], false, true ) );
      // right arc
      this.tasks.push( new ArcTask( this.tasks.length, [ spot4_r, toparc_r, spot2_r ], mid20line_r, true, false, true ) );

    }

    // 45 m line right side 
    if( this.options ["45m line"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ cross45rh2, cross45rh3 ], false, true ) );
    }



    // Line 65 m 
    if( this.options ["65m line"].val )
    {
      if( this.options.Length.val >= 135 || this.options ["Scalability"].val === true )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ cross65rh3, cross65rh2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ centerLine2, centerLine1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ cross65lh3, cross65lh2 ], false, true ) );
      }
    }

    // center line
    if( this.options.Length.val <= 135 || this.options ["65m line"].val === false )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ centerLine1, centerLine2 ], false, true ) );
    }
    // Line 45 m 
    if( this.options ["45m line"].val )
    {

      this.tasks.push( new LineTask( this.tasks.length, [ cross45lh2, cross45lh3 ], false, true ) );
    }

    // 20 m line left side 
    if( this.options ["20m line"].val )
    {

      this.tasks.push( new LineTask( this.tasks.length, [ cross20lh3, cross20lh2 ], false, true ) );

      // left arc
      this.tasks.push( new ArcTask( this.tasks.length, [ spot4_l, toparc_l, spot2_l ], mid20line_l, true, false, true ) );

    }

    // 13 m left side
    this.tasks.push( new LineTask( this.tasks.length, [ cross13lh2, cross13lh1 ], false, true ) );

    // Big goals in left side
    this.tasks.push( new LineTask( this.tasks.length, [ biggoall4, biggoall3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ biggoall1, biggoall2 ], false, true ) );

    // Kick dot
    this.tasks.push( new ArcTask( this.tasks.length, [ kickdotlh1, kickdotlh2 ], kickdotlh, false, false, true ) );

    //small goal left side
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoall1, smallgoall2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoall2, smallgoall4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ smallgoall4, smallgoall3 ], false, true ) );







    this.refresh_bb();
    this.refresh_handles();

  }
  ;
}

