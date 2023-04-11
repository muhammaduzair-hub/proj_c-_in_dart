/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class German_Flag_Football extends square_pitch
{
  static template_type = "German Flag Football"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "german_flag_football"; // no spaces
  static template_image = "img/templates/flag_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.Length.val = 72; //max length
    this.options.Width.val = 22.5; //max width

    this.options ["Endzone"] = {
      configurable: true,
      name: "Endzone line",
      val: 9,
      type: "float"
    };

    this.options ["NoRunningLine"] = {
      configurable: true,
      name: "No running line",
      val: 13.5,
      type: "float"
    };
  }

  static get layout_methods()
  {
    return {

      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };

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


    var g1 = new Line( c2, c3 ).unit_vector;
    var g2 = new Line( c1, c4 ).unit_vector;
    var g3 = new Line( c3, c2 ).unit_vector;
    var g4 = new Line( c4, c1 ).unit_vector;
    var g5 = new Line( c1, c2 ).unit_vector;
    var g6 = new Line( c3, c4 ).unit_vector;
    var mid1 = new Line( c2, c3 ).middle;
    var mid2 = new Line( c1, c4 ).middle;

    // outer dashed field
    var outer = c1.add( g5.multiply( 2.7 ).rotate_90_ccw() );
    var outer1 = outer.subtract( g5.multiply( 2.7 ) );
    var outer2 = c2.subtract( g1.multiply( 2.7 ) );
    var outer3 = outer2.add( g5.multiply( 2.7 ) );
    var outer4 = c3.add( g1.multiply( 2.7 ) );
    var outer5 = outer4.subtract( g6.multiply( 2.7 ) );
    var outer6 = c4.add( g6.multiply( 2.7 ) );
    var outer7 = outer6.add( g2.multiply( 2.7 ) );




    // endzone line
    var line1 = c2.add( g1.multiply( this.options ["Endzone"].val ) );
    var line2 = c1.add( g2.multiply( this.options ["Endzone"].val ) );
    var line3 = c3.add( g3.multiply( this.options ["Endzone"].val ) );
    var line4 = c4.add( g4.multiply( this.options ["Endzone"].val ) );

    //Dashed lines
    var line5 = c2.add( g1.multiply( this.options ["NoRunningLine"].val ) );
    var line6 = c1.add( g2.multiply( this.options ["NoRunningLine"].val ) );
    var line7 = c3.add( g3.multiply( this.options ["NoRunningLine"].val ) );
    var line8 = c4.add( g4.multiply( this.options ["NoRunningLine"].val ) );
    // small lines after dashed
    var line9 = c1.add( g2.multiply( 18 ) );
    var line10 = c2.add( g1.multiply( 18 ) );
    var line11 = new Line( line9, line10 ).middle;
    var small_line = line11.add( g5.multiply( 2.5 ) );
    var small_line1 = line11.subtract( g5.multiply( 2.5 ) );

    var line12 = c3.add( g3.multiply( 18 ) );
    var line13 = c4.add( g4.multiply( 18 ) );
    var line14 = new Line( line12, line13 ).middle;
    var small_line2 = line14.add( g6.multiply( 2.5 ) );
    var small_line3 = line14.subtract( g6.multiply( 2.5 ) );


    var dash_length = 0.5;
    var dash_space = 0.5;
    var outer_dash_length = 0.5;
    var outer_dash_space = 0.6;

    //frame



    this.tasks.push( new LineTask( this.tasks.length, [ outer1, outer3 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", outer_dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", outer_dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ outer3, outer5 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", outer_dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", outer_dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ outer5, outer7 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", outer_dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", outer_dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ outer7, outer1 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", outer_dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", outer_dash_space ) );





    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

    //endzone
    this.tasks.push( new LineTask( this.tasks.length, [ line2, line1 ], false, true ) );
    //dashed
    this.tasks.push( new LineTask( this.tasks.length, [ line5, line6 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    this.tasks.push( new LineTask( this.tasks.length, [ small_line1, small_line ], false, true ) );

    //mid
    this.tasks.push( new LineTask( this.tasks.length, [ mid1, mid2 ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ small_line2, small_line3 ], false, true ) );

    //dashed
    this.tasks.push( new LineTask( this.tasks.length, [ line7, line8 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

    //endzone
    this.tasks.push( new LineTask( this.tasks.length, [ line4, line3 ], false, true ) );



    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
}