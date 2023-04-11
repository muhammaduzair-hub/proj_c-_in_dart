/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class Fistball extends square_pitch
{
  static template_type = "Fistball";// Translateable
  static template_image = "img/templates/fistball.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.SmashFieldWidth = {
      configurable: true,
      name: "Smash field width",
      val: 3,
      type: "float"
    };

  }

  static get layout_methods()
  {
    return {
      "two_middle_goal_posts": 2,
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( -0.01, 1.01 ),
        new Vector( -0.0, 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( -0.01, 1.01 ),
        new Vector( -0.01, -0.01 )
      ];
    }
    if( layout_method === "two_middle_goal_posts" )
    {
      return [
        new Vector( -0.01, 0.5 ),
        new Vector( 1.01, 0.5 )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( -0.01, 1.01 ),
        new Vector( -0.01, -0.01 ),
        new Vector( 1.01, 0.25 )
      ];
    }
    if( layout_method === "all_corners" )
    {
      return [
        new Vector( -0.01, -0.01 ),
        new Vector( 1.01, -0.01 ),
        new Vector( 1.01, 1.01 ),
        new Vector( -0.01, 1.01 )
      ];
    }
  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    //var g1 = new Line( c1, c2 ).unit_vector;
    //var g2 = g1.rotate_90_cw();
    var c3 = p[4];
    var c4 = p[7];

    // update tasks
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );


    var side1 = new Line( c2, c3 );
    var side2 = new Line( c1, c4 );
    var side1_guide = side1.unit_vector;
    var side2_guide = side2.unit_vector;
    var m1 = side1.middle;
    var m2 = side2.middle;
    var middle_line = new Line( m1, m2 );
    var middle_guide = middle_line.unit_vector.rotate_90_ccw();
    var smash_line1 = middle_line.move( middle_guide, -this.options.SmashFieldWidth.val );
    var smash_line2 = middle_line.move( middle_guide, this.options.SmashFieldWidth.val );

    var smash_line1_side1 = side1.cross_with_line( smash_line1 );
    var smash_line1_side2 = side2.cross_with_line( smash_line1 );
    var smash_line2_side1 = side1.cross_with_line( smash_line2 );
    var smash_line2_side2 = side2.cross_with_line( smash_line2 );

    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, m1 ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ smash_line1_side1, smash_line1_side2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ m2, m1 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ smash_line2_side1, smash_line2_side2 ], false, true ) );



    this.tasks.push( new LineTask( this.tasks.length, [ m1, c3 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );

    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.start_locations.push( new StartLocation( c4, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

    // Update test_tasks
    // Update bb
    // Update handles
    //this.refresh_snapping_lines( );
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

  refresh_handles()
  {
    super.refresh_handles();


  }

}

class FistballU21 extends Fistball
{
  static template_title = "U21";// Translateable
  static template_id = "fistball_u21"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 50;
    this.options.Width.val = 20;

  }
}
class FistballU14 extends Fistball
{
  static template_title = "U14";// Translateable
  static template_id = "fistball_u14"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 40;
    this.options.Width.val = 20;

  }
}
class FistballU12 extends Fistball
{
  static template_id = "fistball_u12"; // no spaces
  static template_title = "U12";// Translateable
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 30;
    this.options.Width.val = 15;

  }
}
class FistballU10 extends Fistball
{
  static template_title = "U10";// Translateable
  static template_id = "fistball_u10"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 20;
    this.options.Width.val = 10;

  }
}