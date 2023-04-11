/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Basketball extends square_pitch
{
  static template_type = "Basketball";
  static template_title = "Standard";
  static template_id = "basketball_beta";
  static template_image = "img/templates/Basketball.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 28; // Max Value
    this.options.Width.val = 15; // Max Value
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

  }
  static get layout_methods()
  {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }
  create_free_throw_points(free_throw_point1, free_throw_point2, direction)
  {
    let g = new Line(free_throw_point2, free_throw_point1).unit_vector;

    let free_throw1 = free_throw_point2.add(g.multiply(1.06 - this.options.LineWidth.val/2));
    let free_throw2 = free_throw_point2.add(g.multiply(1.98 - this.options.LineWidth.val/2));
    let free_throw3 = free_throw_point2.add(g.multiply(2.89 - this.options.LineWidth.val/2));
    let free_throw4 = free_throw_point2.add(g.multiply(4.15 - this.options.LineWidth.val/2));
    let ft1; 
    let ft2;
    let ft3; 
    let ft4;
    let ft5;
    if(direction === 0)
    {
      ft1 = free_throw1.add(g.multiply(0.1).rotate_90_cw());
      ft2 = free_throw2.add(g.multiply(0.1).rotate_90_cw());
      ft3 = free_throw3.add(g.multiply(0.1).rotate_90_cw());
      ft4 = free_throw4.add(g.multiply(0.1).rotate_90_cw());
      ft5 = ft3.add(g.multiply(0.3));
    }
    else
    {
      ft1 = free_throw1.add(g.multiply(0.1).rotate_90_ccw());
      ft2 = free_throw2.add(g.multiply(0.1).rotate_90_ccw());
      ft3 = free_throw3.add(g.multiply(0.1).rotate_90_ccw());
      ft4 = free_throw4.add(g.multiply(0.1).rotate_90_ccw());
      ft5 = ft3.add(g.multiply(0.3));
    }
    this.tasks.push( new LineTask( this.tasks.length, [ ft1, free_throw1 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ ft2, free_throw2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ ft3, ft5 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ ft4, free_throw4 ], false, true ) );

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

    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = new Line( c2, c1 ).unit_vector;
    var g3 = new Line( c3, c4 ).unit_vector;
    var g4 = new Line( c4, c3 ).unit_vector;


    var mid = new Line( c1, c2 ).middle;
    var mid1 = new Line( c3, c4 ).middle;
    var center = new Line( mid, mid1 ).middle;
    var midLine = new Line( c1, c4 ).middle;
    var midLine1 = new Line( c2, c3 ).middle;
    var midlineStart = midLine.add( g2.multiply( 0.15 ) );
    var midlineEnd = midLine1.add( g1.multiply( 0.15 ) );

    var centerCircle = center.add( g1.multiply( 1.8 ) );
    var centerCircle1 = center.add( g2.multiply( 1.8 ) );

    var courtmid = mid.add( g1.multiply( 1.6 ).rotate_90_cw() );
    var threePointTop = courtmid.add( g1.multiply( 6.25 ).rotate_90_cw() );

    var courtmid1 = mid1.add( g3.multiply( 1.6 ).rotate_90_cw() );
    var threePointTop1 = courtmid1.add( g3.multiply( 6.25 ).rotate_90_cw() );

    var threePoint1 = c1.add( g1.multiply( 1.25 ) );
    var threePoint2 = c2.add( g2.multiply( 1.25 ) );
    var threePoint3 = threePoint1.add( g1.multiply( 1.6 ).rotate_90_cw() );
    var threePoint4 = threePoint2.add( g1.multiply( 1.6 ).rotate_90_cw() );

    var threePoint5 = c3.add( g3.multiply( 1.25 ) );
    var threePoint6 = c4.add( g4.multiply( 1.25 ) );
    var threePoint7 = threePoint5.add( g1.multiply( 1.6 ).rotate_90_ccw() );
    var threePoint8 = threePoint6.add( g1.multiply( 1.6 ).rotate_90_ccw() );

    var freeThrow1 = mid.add( g1.multiply( 3 ) );
    var freeThrow2 = mid.add( g2.multiply( 3 ) );
    var freeThrow3 = mid.add( g1.multiply( 1.8 ) );
    var freeThrow4 = mid.add( g2.multiply( 1.8 ) );
    var freeThrow5 = freeThrow3.add( g1.multiply( 5.8 ).rotate_90_cw() );
    var freeThrow6 = freeThrow4.add( g1.multiply( 5.8 ).rotate_90_cw() );
    var freeThrowMid = new Line( freeThrow5, freeThrow6 ).middle;
    var freeThrowTop = freeThrowMid.add( g1.multiply( 1.8 ).rotate_90_cw() );
    var freeThrowUnder = freeThrowMid.add( g1.multiply( 1.8 ).rotate_90_ccw() );

    var dash_length = 0.34;
    var dash_space = 0.15;

    var freeThrow7 = mid1.add( g3.multiply( 3 ) );
    var freeThrow8 = mid1.add( g4.multiply( 3 ) );
    var freeThrow9 = mid1.add( g3.multiply( 1.8 ) );
    var freeThrow10 = mid1.add( g4.multiply( 1.8 ) );
    var freeThrow11 = freeThrow9.add( g3.multiply( 5.8 ).rotate_90_cw() );
    var freeThrow12 = freeThrow10.add( g3.multiply( 5.8 ).rotate_90_cw() );
    var freeThrowMid1 = new Line( freeThrow11, freeThrow12 ).middle;
    var freeThrowTop1 = freeThrowMid1.add( g1.multiply( 1.8 ).rotate_90_ccw() );
    var freeThrowUnder1 = freeThrowMid1.add( g1.multiply( 1.8 ).rotate_90_cw() );
    var dash_length = 0.34;
    var dash_space = 0.15;


    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    //3 point arc
    this.tasks.push( new LineTask( this.tasks.length, [ threePoint1, threePoint3 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ threePoint3, threePointTop, threePoint4 ], courtmid, false, true, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ threePoint4, threePoint2 ], false, true ) );
    //free throw area
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow1, freeThrow5 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ freeThrow5, freeThrowTop, freeThrow6 ], freeThrowMid, true, true, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ freeThrow6, freeThrowUnder, freeThrow5 ], freeThrowMid, true, true, true ) );
    this.tasks[this.tasks.length - 1 ].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow5, freeThrow6 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow6, freeThrow2 ], false, true ) );
    this.create_free_throw_points(freeThrow1, freeThrow5, 0);
    this.create_free_throw_points(freeThrow2, freeThrow6, 1);
    //Center
    this.tasks.push( new LineTask( this.tasks.length, [ midlineStart, center ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ centerCircle, centerCircle1 ], center, true, false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ center, midlineEnd ], false, true ) );
    //3 point arc   
    this.tasks.push( new LineTask( this.tasks.length, [ threePoint5, threePoint7 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ threePoint7, threePointTop1, threePoint8 ], courtmid1, false, true, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ threePoint8, threePoint6 ], false, true ) );
    //free throw area
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow7, freeThrow11 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ freeThrow11, freeThrowTop1, freeThrow12 ], freeThrowMid1, true, true, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ freeThrow12, freeThrowUnder1, freeThrow11 ], freeThrowMid1, true, true, true ) );
    this.tasks[this.tasks.length - 1 ].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow11, freeThrow12 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ freeThrow12, freeThrow8 ], false, true ) );
    this.create_free_throw_points(freeThrow7, freeThrow11, 0);
    this.create_free_throw_points(freeThrow8, freeThrow12, 1);

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
}

