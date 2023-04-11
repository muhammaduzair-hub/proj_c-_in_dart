/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class Korfball extends square_pitch
{
  static template_type = "Korfbal"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "korfball"; // no spaces
  static template_image = "img/templates/korfball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineLength = {name: "Line Length", val: 0.1, type: "float", "dontsave": true};
    //this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 40; //maximum length
    this.options.Width.val = 20; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.NegativeLineWidth.val = true;

    this.options.mark_goal_pole = {
      configurable: true,
      name: "Mark goal pole",
      val: false,
      type: "bool"
    };

    this.options.goal_poleDiameter = {
      configurable: true,
      name: "Pole diameter",
      val: 0.1,
      type: "float"
    };

  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "two_middle_goal_posts": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {

    var korfball_img_cross_left = -0.02;
    var korfball_img_cross_right = 1.05;
    var korfball_img_cross_top = -0.05;
    var korfball_img_cross_bot = 1.02;

    var korfball_img_cross_mid = 0.52;
    var korfball_img_cross_g_bot = 0.83;
    var korfball_img_cross_g_top = 0.14;

    if( layout_method === "corner,side" )
    {
      return [
        new Vector( korfball_img_cross_left, korfball_img_cross_bot ),
        new Vector( korfball_img_cross_left, korfball_img_cross_bot / 4 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( korfball_img_cross_left, korfball_img_cross_bot ),
        new Vector( korfball_img_cross_left, korfball_img_cross_top )
      ];
    }
    if( layout_method === "two_middle_goal_posts" )
    {
      return [
        new Vector( korfball_img_cross_mid, korfball_img_cross_g_bot ),
        new Vector( korfball_img_cross_mid, korfball_img_cross_g_top )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( korfball_img_cross_left, korfball_img_cross_bot ),
        new Vector( korfball_img_cross_left, korfball_img_cross_top ),
        new Vector( korfball_img_cross_right, korfball_img_cross_bot / 4 )
      ];
    }
    if( layout_method === "all_corners" )
    {
      return [
        new Vector( korfball_img_cross_left, korfball_img_cross_top ),
        new Vector( korfball_img_cross_right, korfball_img_cross_top ),
        new Vector( korfball_img_cross_right, korfball_img_cross_bot ),
        new Vector( korfball_img_cross_left, korfball_img_cross_bot )
      ];
    }
  }

  create_goal( ms, g1, g_down, clockwise )
  {
    var circle_outer_radius = 2.5;

    var pole_middle = ms.add( g1.multiply( 6.67 - this.options.LineWidth.val / 2 ) );
    var c_half = pole_middle.add( g1.multiply( this.options.goal_poleDiameter.val / 2 ) );
    var c_full = c_half.add( g1.multiply( circle_outer_radius - this.options.LineWidth.val ) );

    var goal_line_start = c_full.subtract( g_down.multiply( (0.15 + this.options.LineWidth.val) / 2 ) );
    var goal_line_end = c_full.add( g_down.multiply( (0.15 + this.options.LineWidth.val) / 2 ) );

    g1 = g1.multiply( circle_outer_radius + this.options.LineWidth.val / 2 );
    g_down = g_down.multiply( circle_outer_radius + this.options.LineWidth.val / 2 );

    var l1_start = c_full.add( g_down );
    var l1_end = c_half.add( g_down );
    var l2_start = c_half.subtract( g_down );
    var l2_end = c_full.subtract( g_down );
    var c_half_start = l1_end;
    var c_half_middle = c_half.subtract( g1 );
    var c_half_end = l2_start;


    this.tasks.push( new LineTask( this.tasks.length, [ l1_start, l1_end ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ c_half_start, c_half_middle, c_half_end ], c_half, clockwise, false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ l2_start, l2_end ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ l2_end, l1_start, l2_end ], c_full, clockwise, false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ goal_line_start, goal_line_end ], false, true ) );

    if( this.options.mark_goal_pole.val )
      this.tasks.push( new WaypointTask( this.tasks.length, pole_middle, false, true ) );

  }

  draw()
  {
    // update tasks
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var g1 = (new Line( c2, c3 )).unit_vector;
    var g2 = g1.rotate_90_cw();

    var ms1 = (new Line( c1, c2 )).middle;
    var ms2 = (new Line( c3, c4 )).middle;

    var ml1 = (new Line( c2, c3 )).middle;
    var ml2 = (new Line( c4, c1 )).middle;

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

    this.create_goal( ms1, g1, g2, true );

    this.tasks.push( new LineTask( this.tasks.length, [ ml1, ml2 ], false, true ) );
    this.create_goal( ms2, g1.multiply( -1 ), g2.multiply( -1 ), true );



    // Update bb
    this.refresh_bb();
    // Update handles
    this.refresh_handles();
    // Update test_tasks
    this.refresh_test_run( );
    // Refresh snapping lines
    this.refresh_snapping_lines();

  }
}