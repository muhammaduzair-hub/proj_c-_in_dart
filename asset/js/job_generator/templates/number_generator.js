/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global map_controller */

class NumberJob extends square_pitch
{
  template_type = "number";// Translateable
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Width.val = (6).foot2meter();
    this.options.Length.val = (4).foot2meter();
  }

  static get layout_methods()
  {
    return {
      "free_hand": 0
    };
  }
  get center()
  {
    return this.points[0];
  }

  draw()
  {
    this.reset_saved_stuff();
    // Update bb
    this.refresh_bb();
    // Update handles
    this.refresh_handles();
  }
  convert_to_free_hand()
  {

  }
}

class Number0 extends NumberJob
{
  static template_title = "Number 0";// Translateable
  static template_id = "number_0"; // no spaces
  static template_image = "img/templates/black lines image.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }
  draw()
  {
    super.draw();
    var p = this.drawing_points;
    var c1 = p[4];

    var number_height = this.options.Width.val; // 6
    var number_width = this.options.Length.val; // 4

    var p1 = new Vector( 0.0, number_height - number_width * 0.5 ).add( c1 );
    var p2 = new Vector( number_width * 0.5, number_height ).add( c1 );
    var p3 = new Vector( number_width, number_height - number_width * 0.5 ).add( c1 );

    var p4 = new Vector( number_width, number_width * 0.5 ).add( c1 );
    var p5 = new Vector( number_width * 0.5, 0 ).add( c1 );
    var p6 = new Vector( 0.0, number_width * 0.5 ).add( c1 );

    this.start_locations.push( new StartLocation( p1, this.tasks.length ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ p1, p2, p3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ p4, p5, p6 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p6, p1 ], false, true ) );

  }
}

class Number1 extends NumberJob
{
  static template_title = "Number 1";// Translateable
  static template_id = "number_1"; // no spaces
  static template_image = "img/templates/black lines image.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }
  draw()
  {
    super.draw();
    var p = this.drawing_points;
    var c1 = p[4];

    var number_height = this.options.Width.val; // 6
    var number_width = this.options.Length.val; // 4

    var p1 = new Vector( 0.0, number_height * 0.75 ).add( c1 );
    var p2 = new Vector( number_width * 0.5, number_height ).add( c1 );
    var p3 = new Vector( number_width * 0.5, 0.0 ).add( c1 );
    var p4 = new Vector( 0.0, 0.0 ).add( c1 );
    var p5 = new Vector( number_width, 0.0 ).add( c1 );

    this.start_locations.push( new StartLocation( p1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p4, p5 ], false, true ) );

  }
}

class Number2 extends NumberJob
{
  static template_title = "Number 2";// Translateable
  static template_id = "number_2"; // no spaces
  static template_image = "img/templates/black lines image.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }
  draw()
  {
    super.draw();
    var p = this.drawing_points;
    var c1 = p[4];

    var number_height = this.options.Width.val; // 6
    var number_width = this.options.Length.val; // 4

    var p1 = new Vector( 0.0, number_height - number_width * 0.5 ).add( c1 );
    var p2 = new Vector( number_width * 0.5, number_height ).add( c1 );
    var p3 = new Vector( number_width, number_height - number_width * 0.5 ).add( c1 );

    var p4 = new Vector( 0, 0 ).add( c1 );
    var p5 = new Vector( number_width, 0 ).add( c1 );

    this.start_locations.push( new StartLocation( p1, this.tasks.length ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ p1, p2, p3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p4, p5 ], false, true ) );

  }
}

function test_number_job()
{
  var new_center = map_controller.background.map_to_robot( map_controller.background.map_center );
  var new_center_v = new Vector( new_center[0], new_center[1] );
  var new_job = new Number1( -1, "test_number", "free_hand" );
  new_job.points = [ new_center_v ];
  return new_job;
}