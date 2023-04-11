/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Stoolball extends square_pitch
{
  static template_type = "Stoolball";
  static template_title = "Standard";
  static template_id = "stoolball_dev";
  static template_image = "img/templates/stoolball.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 14.6; // Max Value
    this.options.Width.val = 0.915; // Max Value
    this.options.goalPoleWidth.val = 0.09;
    this.options.GoalWidth.val = 0;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;

    this.options ["Boundary line"] = {

      adjustable: false,
      configurable: true,
      name: "Boundary line",
      val: true,
      type: "bool"
    };
    
     this.options ["Boundary line size"] = {

      adjustable: false,
      configurable: true,
      name: "Boundary line size",
      val: 40.0,
      type: "float"
    };

    this.options ["Scalability"] = {
      configurable: false,
      name: "Scalability",
      val: false,
      type: "bool"
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
    // goal posts
    var c5 = p[2];
    var c6 = p[5];

    var mid = new Line( c5, c6 ).middle;
    var g1 = new Line( c5, c6 ).unit_vector;
    var g2 = new Line( c6, c5 ).unit_vector;
    // right endline
    var endLine1 = c5.add( g1.multiply( this.options.Width.val / 2 ).rotate_90_cw() );
    var endLine2 = c5.add( g1.multiply( this.options.Width.val / 2 ).rotate_90_ccw() );
    var n03 = 0.305 / 14.6 * this.options.Length.val;
    var n5 =  5.165 / 14.6 * this.options.Length.val;
    

    // cease right side 
    var cease1 = endLine1.add( g1.multiply( n5 ) );
    var cease2 = cease1.add( g1.multiply( n03 ) );

    var cease3 = endLine2.add( g1.multiply( n5 ) );
    var cease4 = cease3.add( g1.multiply( n03 ) );


    // left end line 

    var endLine3 = c6.add( g2.multiply( this.options.Width.val / 2 ).rotate_90_cw() );
    var endLine4 = c6.add( g2.multiply( this.options.Width.val / 2 ).rotate_90_ccw() );

// cease left end
    var cease5 = endLine3.add( g2.multiply( n5 ) );
    var cease6 = cease5.add( g2.multiply( n03 ) );

    var cease7 = endLine4.add( g2.multiply( n5) );
    var cease8 = cease7.add( g2.multiply( n03 ) );


    // arc
    var spot1 = mid.add( g1.multiply( this.options ["Boundary line size"].val ).rotate_90_cw() );
    var spot2 = mid.add( g1.multiply( this.options ["Boundary line size"].val).rotate_90_ccw() );


    this.start_locations.push( new StartLocation( c5, this.tasks.length ) );

    //this.tasks.push( new LineTask( this.tasks.length, [ endLine3, cease5 ], false, true ) );
    //this.tasks.push( new LineTask( this.tasks.length, [ endLine4, cease7 ], false, true ) );
    //arc
    if( this.options ["Boundary line"].val === true )
    {
      this.tasks.push( new ArcTask( this.tasks.length, [ spot1, spot2 ], mid, false, false, true ) );
    }

    this.tasks.push( new LineTask( this.tasks.length, [ endLine1, endLine2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ cease2, cease4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ cease1, cease2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ cease3, cease4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ cease5, cease6 ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ cease6, cease8 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ cease7, cease8 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ endLine3, endLine4 ], false, true ) );


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();

  }
}



