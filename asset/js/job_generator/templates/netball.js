/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Netball extends square_pitch
{
  static template_type = "Netball";
  static template_title = "Standard";
  static template_id = "netball";
  static template_image = "img/templates/netball.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 30.5; // Max Value
    this.options.Width.val = 15.25; // Max Value
    this.options.goalPoleWidth.val = 0.09;
    this.options.GoalWidth.val = 0;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;

    this.options ["Scalability"] = {
      configurable: true,
      name: "Scalability",
      val: false,
      type: "bool"
    };
    
    this.options ["Center circle"] = {
      configurable: true,
      name: "Center circle",
      val: 0.45,
      type: "float"
    };

    this.options.reverseInGoal = {
      adjustable: false,
      configurable: false,
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "two_end_goal_posts_resize" )
      this.options.reverseInGoal.val = true;
  }

  static get layout_methods()
  {
    return {
      "two_end_goal_posts_resize": 2,
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
    
  }

  get drawing_points()
  {
    let p = super.drawing_points;
    if( this.layout_method === "two_end_goal_posts_resize" )
    {
      let cp1 = this.points[0];
      let cp2 = this.points[1];
      let d = (new Line( cp1, cp2 )).length;
      this.options.Length.val = d;
    }

    return p;
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "center" )
    {
      return [
        new Vector( 0.5, 0.5 )
      ];
    }
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0, 1.03 ),
        new Vector( 0, 0 )
      ];
    }
    if( layout_method === "two_end_goal_posts_resize" )
    {
      return [
        new Vector( 0.5, -0.03 ),
        new Vector( 0.5, 1.03 )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0 ),
        new Vector( 1, 0.25 )
      ];
    }
    if( layout_method === "all_corners" )
    {
      return [
        new Vector( 0, 0 ),
        new Vector( 1, 0 ),
        new Vector( 1, 1.03 ),
        new Vector( 0, 1.03 )
      ];
    }
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
    // goal posts
    var c5 = p[2];
    var c6 = p[5];

    // Lines
    var c1c4 = new Line( c1, c4 );
    var c2c3 = new Line( c2, c3 );



    // guide lines
    var g1 = new Line( c6, c5 ).unit_vector;
    //var g3 = g1.rotate_90_cw;

    if( this.options ["Scalability"].val === true )
    {
      var n4 = (4.9 / 30.5 * this.options.Length.val) + this.options.LineWidth.val;
      var n10 = (10.167 / 30.5 * this.options.Length.val) - (this.options.LineWidth.val * 0.5);
    }
    else
    {
      var n4 = 4.9 + this.options.LineWidth.val;
      var n10 = 10.167 - (this.options.LineWidth.val * 0.5);
    }



    // End lines right side
    var endLine1 = c5.add( g1.multiply( 1 ).rotate_90_cw() );
    var newEndLine1 = new Line( c5, endLine1 ).cross_with_line( c1c4 );
    var newEndLine2 = new Line( c5, endLine1 ).cross_with_line( c2c3 );
    // End arc right side
    var endArcRight1 = c5.add( g1.multiply( n4 ).rotate_90_cw() );
    var endArcRight2 = c5.add( g1.multiply( n4 ).rotate_90_ccw() );
    var endArcTop = c5.subtract( g1.multiply( n4 ) );

    // End lines right side
    var endLine2 = c6.subtract( g1.multiply( 1 ).rotate_90_cw() );
    var newEndLine3 = new Line( c6, endLine2 ).cross_with_line( c1c4 );
    var newEndLine4 = new Line( c6, endLine2 ).cross_with_line( c2c3 );

    // End arc left side
    var endArcLeft1 = c6.add( g1.multiply( n4 ).rotate_90_cw() );
    var endArcLeft2 = c6.add( g1.multiply( n4 ).rotate_90_ccw() );
    var endArcTop1 = c6.add( g1.multiply( n4 ) );


    //  transvers lines right side
    var transvers1 = c5.subtract( g1.multiply( n10 ) );
    var testLine = transvers1.add( g1.multiply( 1 ).rotate_90_cw() );
    var newLine1 = new Line( transvers1, testLine ).cross_with_line( c1c4 );
    var newLine2 = new Line( transvers1, testLine ).cross_with_line( c2c3 );

    // Middle cirkel
    var midPoint = new Line( c5, c6 ).middle;
    var startPoint = midPoint.add( g1.multiply( this.options ["Center circle"].val ) );
    var endPoint = midPoint.subtract( g1.multiply( this.options ["Center circle"].val ) );



    //  transvers lines left side
    var transvers2 = c6.add( g1.multiply( n10 ) );
    var testLine2 = transvers2.add( g1.multiply( 1 ).rotate_90_cw() );
    var newLine3 = new Line( transvers2, testLine2 ).cross_with_line( c1c4 );
    var newLine4 = new Line( transvers2, testLine2 ).cross_with_line( c2c3 );

    
     
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    // frame


    var new_tasks_right_end = drive_around_posts(
    {

      task_before: new LineTask( this.tasks.length, [ newEndLine1, c5 ], false, true ),
      task_after: new LineTask( this.tasks.length, [ c5, newEndLine2 ], false, true ),
      poles: [ c5 ],
      pole_width: this.options.goalPoleWidth.val,
      left_around: false,
      start_index: this.tasks.length

    } );

    if( this.options.reverseInGoal.val === true )
    {
      this.tasks.pushAll( new_tasks_right_end );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ newEndLine1, newEndLine2 ], false, true ) );

    }


    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );

    var new_tasks_left_end = drive_around_posts(
    {

      task_before: new LineTask( this.tasks.length, [ newEndLine4, c6 ], false, true ),
      task_after: new LineTask( this.tasks.length, [ c6, newEndLine3 ], false, true ),
      poles: [ c6 ],
      pole_width: this.options.goalPoleWidth.val,
      left_around: false,
      start_index: this.tasks.length

    } );



    if( this.options.reverseInGoal.val === true )
    {
      this.tasks.pushAll( new_tasks_left_end );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ newEndLine4, newEndLine3 ], false, true ) );

    }


    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    // end arc right side
    this.tasks.push( new ArcTask( this.tasks.length, [ endArcRight2, endArcTop, endArcRight1 ], c5, false, false, true ) );
     

    // middle lines
    this.tasks.push( new LineTask( this.tasks.length, [ newLine2, newLine1 ], false, true ) );
    // middle cirkel
    this.tasks.push( new ArcTask( this.tasks.length, [ startPoint, endPoint ], midPoint, true, false, true ) );
    // middle lines
    this.tasks.push( new LineTask( this.tasks.length, [ newLine3, newLine4 ], false, true ) );




    // end arc left side
    this.tasks.push( new ArcTask( this.tasks.length, [ endArcLeft1, endArcTop1, endArcLeft2 ], c6, false, true, true ) );
    

    this.refresh_test_run();
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
}


