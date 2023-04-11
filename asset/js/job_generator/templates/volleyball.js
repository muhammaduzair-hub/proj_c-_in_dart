/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Volleyball extends square_pitch
{
  static template_type = "Volleyball";
  static template_title = "Standard";
  static template_id = "volleyball_beta";
  static template_image = "img/templates/volleyball.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 18; // Max Value
    this.options.Width.val = 9; // Max Value
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;

    this.options.MiddleLineExtendedLength = {
      name: "Net line extension length",
      type: "float",
      _val: 1,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 0 )
          v = 0;
        this._val = v;
      },
      configurable: true
    };
  }
  static get layout_methods( )
  {
    return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "free_hand": 0,
        "all_corners": 4
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

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = new Line( c2, c1 ).unit_vector;
    var g3 = new Line( c2, c3 ).unit_vector;
    var g4 = new Line( c3, c2 ).unit_vector;
    var g5 = new Line( c1, c4 ).unit_vector;

    var endline1 = c1.subtract( g5.multiply( 0.20 ) );
    var endline2 = c1.subtract( g5.multiply( 0.35 ) );
    var endline3 = c2.add( g4.multiply( 0.20 ) );
    var endline4 = c2.add( g4.multiply( 0.35 ) );
    var endline5 = c3.add( g3.multiply( 0.20 ) );
    var endline6 = c3.add( g3.multiply( 0.35 ) );
    var endline7 = c4.add( g5.multiply( 0.20 ) );
    var endline8 = c4.add( g5.multiply( 0.35 ) );

    var meter6line1 = c1.add( g5.multiply( 6 ) );
    var meter6line2 = c2.add( g3.multiply( 6 ) );
    var meter6line3 = c3.add( g4.multiply( 6 ) );
    var meter6line4 = c4.subtract( g5.multiply( 6 ) );

    var sti1 = meter6line1.add( g2.multiply( 1.75 ) );
    var sti2 = meter6line2.add( g1.multiply( 1.75 ) );
    var sti3 = meter6line3.add( g1.multiply( 1.75 ) );
    var sti4 = meter6line4.subtract( g1.multiply( 1.75 ) );


    var mid = new Line( c1, c4 ).middle;
    var mid1 = new Line( c2, c3 ).middle;
    var mid2 = mid1.add( g1.multiply( this.options.MiddleLineExtendedLength.val ) );
    var mid3 = mid.add( g2.multiply( this.options.MiddleLineExtendedLength.val ) );
    var dash_length = 0.20;
    var dash_space = 0.15;
    var dash_length_mid = 0.20;
    var dash_space_mid = 0.15;


    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ endline4, endline3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ endline5, endline6 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ endline8, endline7 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ endline1, endline2 ], false, true ) );


    this.tasks.push( new LineTask( this.tasks.length, [ sti1, meter6line1 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ meter6line1, meter6line2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ sti2, meter6line2 ], false, true ) );
    
    this.tasks.push( new LineTask( this.tasks.length, [ mid2, mid3 ], false, true ) );
    this.tasks[this.tasks.length - 1 ].task_options.push( new FloatRobotAction( "dashed_length", dash_length_mid ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space_mid ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
    this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );

    this.tasks.push( new LineTask( this.tasks.length, [ sti4, meter6line4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ meter6line4, meter6line3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ sti3, meter6line3 ], false, true ) );


    for( var i = 0; i <= 15; i++ )
    {
      if( i === 1 || i === 3 || i === 5 || i === 7 )
      {
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

        this.tasks[this.tasks.length - i].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
        this.tasks[this.tasks.length - i].task_options.push( new BoolRobotAction( "task_merge_next", false ) );
      }
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }

}
