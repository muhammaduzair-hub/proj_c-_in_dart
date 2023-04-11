/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global s2p2 */
/* global this, five_degrees_equal */
class TouchFootball extends square_pitch
{
  static template_type = "Football"; // Translateable
  static template_title = "Touch US"; // Translateable
  static template_id = "touch_football"; // no spaces
  static template_image = "img/templates/touch_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineLength = {name: "Line Length", val: 0.1, type: "float", "dontsave": true};
    //this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 70; //maximum length
    this.options.Width.val = 50; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.removeGoalEnds = {
      adjustable: false,
      configurable: true,
      name: "Remove Goal Ends",
      val: false,
      type: "bool"
    };
    this.options.InGoal = {
      configurable: false,
      name: "In Goal length",
      val: 6,
      type: "float",
      dontsave: false
    };
    this.options.SimpleLines = {
      configurable: true,
      name: "Simple lines",
      val: false,
      type: "bool"
    };
    this.options.InterchangeBox = {
      configurable: true,
      name: "Interchange Box",
      val: true,
      type: "bool"
    };
    this.options.InterchangeBoxWidth = {
      val: 2,
      type: "float",
      dontsave: true
    };
    this.options.closed_interchange_box = {
      configurable: false,
      val: false,
      type: "bool",
      dontsave: true
    };
    this.options.inside_lines = {
      configurable: true,
      name: "No running zones",
      val: false,
      type: "bool"
    };
    this.options.inside_lines_length = {
      configurable: false,
      name: "a",
      val: 5.0,
      type: "float",
      dontsave: true
    };
    this.options.middle_lines_length = {
      configurable: false,
      name: "b",
      val: 5.0,
      type: "float",
      dontsave: true
    };
    this.options.middle_spot_line_length = {
      configurable: false,
      val: 0,
      type: "float",
      dontsave: true
    };
    this.options.dashes = {
      configurable: false,
      name: "Number of dashes",
      val: 6,
      type: "int",
      dontsave: true
    };
    this.options.DoubleGoalline = {
      configurable: false,
      dontsave: true,
      name: "Double Goal Line",
      type: "bool",
      val: false
    };
  }
  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }
  
  refresh_handles()
  {
    
    super.refresh_handles();
    var this_class = this;
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();
    var c3 = p[4];
    var c4 = p[7];
    if( !this.options.removeGoalEnds.val )
    {
      this.handles.push( new Handle( (new Line( p[0], p[3] ).middle).subtract( g2.multiply( this_class.options.InGoal.val + this_class.options.LineWidth.val / 2 ) ), -this_class.options.Angle.val + Math.PI / 2, "InGoal", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[7] );
        var new_goal_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.InGoal, new_goal_length );
      }, function( new_goal_length )
      {
        return this_class.set_new_val( this_class.options.InGoal, new_goal_length );
      } ) );
    }
    else
    {
    }
  }
  

  make_T( middle, left, right, g )
  {
    var ghalf = g.multiply( 0.5 ).rotate_90_cw();
    var e1 = middle;
    var e2 = middle;
    var lines_vert = [ ];
    var lines_hor = [ ];
    if( left )
    {
      e1 = middle.subtract( g );
      var e3 = e1.add( ghalf );
      var e4 = e1.subtract( ghalf );
      lines_vert.push( new Line( e3, e4 ) );
    }
    if( !right )
    {
      lines_hor.push( new Line( e1, e2 ) );
    }
    if( right )
    {
      e2 = middle.add( g );
      lines_hor.push( new Line( e1, e2 ) );
      var e5 = e2.add( ghalf );
      var e6 = e2.subtract( ghalf );
      lines_vert.push( new Line( e5, e6 ) );
    }

    return [ lines_hor[0], lines_vert ];
  }

  make_line( ref_e1, ref_e2, move_ref, make_simple, dashes, reverse = false)
  {
    var e1 = ref_e1.add( move_ref );
    var e2 = ref_e2.add( move_ref );
    var g = (new Line( e1, e2 )).unit_vector;
    var g_side = g.multiply( 5 + this.options.LineWidth.val / 2 );
    var g_middle = g.multiply( 5 - this.options.LineWidth.val );
    var vertical_lines = [ ];
    if( make_simple )
    {
      if( reverse )
        var l = new Line( e2, e1 );
      else
        var l = new Line( e1, e2 );
      this.tasks.push( l.toLineTask( this.tasks.length, false, true ) );
      var dash_length = l.length / (dashes * 2 - 1);
      this.tasks.last().task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks.last().task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );
      //this.tasks.last().action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    }
    else
    {
      var m = (new Line( e1, e2 )).middle;
      var res1 = this.make_T( e1, false, true, g_side );
      var res2 = this.make_T( m, true, true, g_middle );
      var res3 = this.make_T( e2, true, false, g_side );
      if( reverse )
      {
        this.tasks.push( res3[0].toLineTask( this.tasks.length, false, true ).opposite_direction );
        this.tasks.push( res2[0].toLineTask( this.tasks.length, false, true ).opposite_direction );
        this.tasks.push( res1[0].toLineTask( this.tasks.length, false, true ).opposite_direction );
      }
      else
      {
        this.tasks.push( res1[0].toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( res2[0].toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( res3[0].toLineTask( this.tasks.length, false, true ) );
      }
      vertical_lines.pushAll( res1[1] );
      vertical_lines.pushAll( res2[1] );
      vertical_lines.pushAll( res3[1] );
    }
    return vertical_lines;
  }

  make_interchange_box( m, g1, g2 )
  {
    if( !this.options.InterchangeBox.val )
      return;
    var c2 = m.add( g2.multiply( 1 + this.options.LineWidth.val ) ).add( g1.multiply( -this.options.middle_lines_length.val ) );
    var c1 = c2.add( g2.multiply( this.options.InterchangeBoxWidth.val - this.options.LineWidth.val ) );
    var c3 = c2.add( g1.multiply( this.options.middle_lines_length.val * 2 ) );
    var c4 = c3.add( g2.multiply( this.options.InterchangeBoxWidth.val - this.options.LineWidth.val ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c1 ], false, true ) );
    this.tasks.last().action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.tasks.last().action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    if( this.options.closed_interchange_box.val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
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
    var c3 = p[4];
    var c4 = p[7];
    var g1 = (new Line( c2, c3 )).unit_vector;
    var g2 = g1.rotate_90_cw();
    // outer corners
    var oc1 = c1;
    var oc2 = c2;
    var oc3 = c3;
    var oc4 = c4;
    if( !this.options.removeGoalEnds.val )
    {
      oc1 = c1.add( g1.multiply( -this.options.InGoal.val - this.options.LineWidth.val / 2 ) );
      oc2 = c2.add( g1.multiply( -this.options.InGoal.val - this.options.LineWidth.val / 2 ) );
      oc3 = c3.add( g1.multiply( this.options.InGoal.val + this.options.LineWidth.val / 2 ) );
      oc4 = c4.add( g1.multiply( this.options.InGoal.val + this.options.LineWidth.val / 2 ) );
    }
    else if( this.options.DoubleGoalline.val )
    {
      oc1 = c1.add( g1.multiply( -this.options.LineWidth.val / 2 + 0.005 ) );
      oc2 = c2.add( g1.multiply( -this.options.LineWidth.val / 2 + 0.005 ) );
      oc3 = c3.add( g1.multiply( this.options.LineWidth.val / 2 - 0.005 ) );
      oc4 = c4.add( g1.multiply( this.options.LineWidth.val / 2 - 0.005 ) );
    }

    this.start_locations.push( new StartLocation( oc1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ oc1, oc2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ oc2, oc3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ oc3, oc4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ oc4, oc1 ], false, true ) );
    var reverse = new Inverter( true );
    if( !this.options.removeGoalEnds.val )
    {
      if( !this.options.DoubleGoalline.val )
        this.make_line( c1, c2, new Vector( 0, 0 ), true, 1, reverse.next );
      else
        this.make_line( c1, c2, g1.multiply( -this.options.LineWidth.val / 2 + 0.005 ), true, 1, reverse.next );
    }
    if( this.options.DoubleGoalline.val )
      this.make_line( c1, c2, g1.multiply( this.options.LineWidth.val / 2 - 0.005 ), true, 1, reverse.next );

    var m1 = (new Line( c2, c3 )).middle;
    var m2 = (new Line( c1, c4 )).middle;
    var rest = [ ];

    if( !this.options.inside_lines.val )
      rest.push( this.make_line( c1, c2, g1.multiply( this.options.inside_lines_length.val ), this.options.SimpleLines.val, this.options.dashes.val, reverse.next ) );

    if( !reverse.val || !this.options.inside_lines.val && !this.options.removeGoalEnds.val)
      this.make_interchange_box( m1, g1, g2.multiply( -1 ) );
    else
      this.make_interchange_box( m2, g1, g2 );

    if( !this.options.inside_lines.val )
      rest.push( this.make_line( m2, m1, g1.multiply( -this.options.middle_lines_length.val ), this.options.SimpleLines.val, this.options.dashes.val, reverse.next ) );

    if( !reverse.val || !this.options.inside_lines.val && this.options.removeGoalEnds.val)
      this.make_interchange_box( m2, g1, g2 );
    else
      this.make_interchange_box( m1, g1, g2.multiply( -1 ) );
      
 
    // Middle line
    this.make_line( m2, m1, new Vector( 0, 0 ), true, 1, reverse.next );
    if( this.options.middle_spot_line_length.val > 0 )
    {
      var mm = (new Line( m1, m2 )).middle;
      var ms1 = mm.add( g1.multiply( -this.options.middle_spot_line_length.val / 2 + this.options.LineWidth.val / 2 ) );
      var ms2 = mm.add( g1.multiply( this.options.middle_spot_line_length.val / 2 - this.options.LineWidth.val / 2 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ ms1, ms2 ], false, true ) );
    }

    if( !this.options.inside_lines.val )
    {
      rest.push( this.make_line( m2, m1, g1.multiply( this.options.middle_lines_length.val ), this.options.SimpleLines.val, this.options.dashes.val, reverse.next ) );
      rest.push( this.make_line( c4, c3, g1.multiply( -this.options.inside_lines_length.val ), this.options.SimpleLines.val, this.options.dashes.val, reverse.next ) );
    }

    if( this.options.DoubleGoalline.val )
      this.make_line( c4, c3, g1.multiply( -this.options.LineWidth.val / 2 + 0.005 ), true, 1, reverse.next );
    if( !this.options.removeGoalEnds.val )
    {
      if( !this.options.DoubleGoalline.val )
        this.make_line( c4, c3, new Vector( 0, 0 ), true, 1, reverse.next );
      else
        this.make_line( c4, c3, g1.multiply( this.options.LineWidth.val / 2 - 0.005 ), true, 1, reverse.next );
    }

    if( rest.length )
    {
      for( var r = 0; r < rest[0].length; r++ )
      {
        var index = r;
        if( !reverse.val )
          index = rest[0].length - r - 1;
        rest.reverse(); // up/down shift
        rest.forEach( ( row, c ) => {
          if( (r % 2) )
            row[index] = row[index].reverse();
          this.tasks.push( row[index].toLineTask( this.tasks.length, false, true ) );
        } );
      }
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run( [ oc1, oc2, oc3, oc4 ] );
    this.refresh_snapping_lines();
  }

  refresh_test_run( corners )
  {
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[1] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[2] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[3] ) );
  }

  static get_point_positions( layout_method )
  {
    var touch_cross_bottom = 0.935;
    var touch_cross_top = 0.068;
    var touch_cross_left = 0;
    var touch_cross_right = 1.03;
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( touch_cross_left, touch_cross_bottom ),
        new Vector( touch_cross_left, touch_cross_bottom * 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( touch_cross_left, touch_cross_bottom ),
        new Vector( touch_cross_left, touch_cross_top )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( touch_cross_left, touch_cross_bottom ),
        new Vector( touch_cross_left, touch_cross_top ),
        new Vector( touch_cross_right, touch_cross_top )
      ];
    }

  }

}



class Flag_Youth_US extends TouchFootball
{
  static template_type = "Football"; // Translateable
  static template_title = "Youth Flag"; // Translateable
  static template_id = "flag_football_youth_us"; // no spaces
  static template_image = "img/templates/flag_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = (70).yard2meter(); //max length
    this.options.Width.val = (30).yard2meter(); //max width

    this.options.InGoal.val = (10).yard2meter();
    this.options.inside_lines.configurable = true;
    this.options.inside_lines.dontsave = false;

    this.options.InterchangeBox.configurable = false;
    this.options.InterchangeBox.val = false;
    this.options.InterchangeBox.dontsave = true;

    this.options.SimpleLines.configurable = false;
    this.options.SimpleLines.val = true;
    this.options.SimpleLines.dontsave = true;

    this.options.DoubleGoalline.configurable = true;
    this.options.DoubleGoalline.dontsave = false;
  }

  static get_point_positions( layout_method )
  {
    /*
     * "corner,side": 2,
     "two_corners": 2,
     "two_corners,side": 3,
     "free_hand": 0
     * 
     */

    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0.005, 1.01 ),
        new Vector( 0.005, 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0.005, 0.86 ),
        new Vector( 0.005, 0.11 )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0.005, 0.86 ),
        new Vector( 0.005, 0.11 ),
        new Vector( 1.005, 0.11 )
      ];
    }

  }

}

class TouchFootballAU extends  TouchFootball
{
  static template_type = "Football"; // Translateable
  static template_title = "Touch AU"; // Translateable
  static template_id = "touch_football_au"; // no spaces
  static template_image = "img/templates/flag_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 70; //max length
    this.options.Width.val = 50; //max width

    this.options.InGoal.val = 7;
    this.options.SimpleLines.configurable = false;
    this.options.SimpleLines.val = true;
    this.options.SimpleLines.dontsave = true;
    this.options.inside_lines_length = {
      configurable: true,
      name: "7 meter line",
      val: 7.0,
      type: "float"
      
    };
    this.options.middle_lines_length = {
      configurable: true,
      name: "10 meter line",
      val: 10.0,
      type: "float"
      
    };

   

    this.options.closed_interchange_box.val = true;
    this.options.InterchangeBoxWidth.val = 3;

    this.options.middle_spot_line_length.val = 1;
  }

  job_name( translate_dict )
  {
    var pitch_titlte = translate_dict[this.template_title] ? translate_dict[this.template_title] : this.template_title;
    var pitch_type = translate_dict[this.template_type] ? translate_dict[this.template_type] : this.template_type;

    var pitch_type_name = pitch_type + " " + pitch_titlte;
    return pitch_type_name;
  }
}

class TouchRugbyNZ extends  TouchFootballAU
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Touch NZ"; // Translateable
  static template_id = "touch_rugby_nz_beta"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }

}


class TouchFootballNZ extends TouchFootball
{
  static template_type = "Football"; // Translateable
  static template_title = "Touch NZ"; // Translateable
  static template_id = "touch_football_nz"; // no spaces
  static template_image = "img/templates/touch_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineLength = {name: "Line Length", val: 0.1, type: "float", "dontsave": true};
    //this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 70; //maximum length
    this.options.Width.val = 50; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.removeGoalEnds = {
      adjustable: false,
      configurable: true,
      name: "Remove Goal Ends",
      val: false,
      type: "bool"
    };
    this.options.InGoal = {
      configurable: false,
      name: "In Goal length",
      val: 6,
      type: "float",
      dontsave: false
    };
    this.options.SimpleLines = {
      configurable: true,
      name: "Simple lines",
      val: false,
      type: "bool"
    };
    this.options.InterchangeBox = {
      configurable: true,
      name: "Interchange Box",
      val: true,
      type: "bool"
    };
    this.options.InterchangeBoxWidth = {
      val: 2,
      type: "float",
      dontsave: true
    };
    this.options.closed_interchange_box = {
      configurable: false,
      val: false,
      type: "bool",
      dontsave: true
    };
    this.options.inside_lines = {
      configurable: true,
      name: "No running zones",
      val: true,
      type: "bool",
      dontsave: true
    };
    this.options.inside_lines_length = {
      configurable: true,
      name: "5 meter line",
      val: 5.0,
      type: "float"
      
    };
    this.options.middle_lines_length = {
      configurable: true,
      name: "10 meter line",
      val: 10.0,
      type: "float"
      
    };
    this.options.middle_spot_line_length = {
      configurable: false,
      val: 0,
      type: "float",
      dontsave: true
    };
    this.options.dashes = {
      configurable: false,
      name: "Number of dashes",
      val: 6,
      type: "int",
      dontsave: true
    };
    this.options.DoubleGoalline = {
      configurable: false,
      dontsave: true,
      name: "Double Goal Line",
      type: "bool",
      val: false
    };
  }
}