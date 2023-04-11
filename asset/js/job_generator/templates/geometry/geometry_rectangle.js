/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Geometry_Rectangle extends square_pitch {
  static template_type = "Geometry";
  static template_title = "Rectangle";
  static template_id = "geometry_rectangle";
  static template_image = "img/templates/geometry_rectangle.png";
  
  constructor(id, name, layout_method) {
    super( id, name, layout_method );
    this.options.Length.val = 20;
    this.options.Width.val = 10;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;

    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    console.log("************************************01"+this.drawing_points);


    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );

    console.log("************************************02 Drawing Points"+this.drawing_points);
    console.log("************************************02 Tasks"+this.tasks);

    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );

    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );

    this.start_locations.push( new StartLocation( c4, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    console.log("************************************03 Drawing Points"+this.drawing_points);
    console.log("************************************03 Tasks"+this.tasks);

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines( );
    this.refresh_test_run();

    //Added by Laraib
    return this.tasks;
  }
}

