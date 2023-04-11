/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global s2p2 */
/* global this, five_degrees_equal */
class Softball_base extends Job
{
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    this.options.FoulLineLength = {
      configurable: true,
      name: "Foul Line Length (L)",
      _val: (185).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = Math.abs( v );
      },
      type: "float"
    };

    this.options.FoulLineLength2 = {
      get configurable()
      {
        return !this_class.options.IdenticalFoulLines.val;
      },
      name: "Foul Line Length (R)",
      _val: (185).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = Math.abs( v );
      },
      type: "float"
    };

    this.options.NoBrokenLines = {
      configurable: true,
      name: "Continuous lines",
      type: "bool",
      val: false
    };
    this.options.draw_batter_area = {
      configurable: true,
      name: "Draw batting area",
      type: "bool",
      val: true
    };
    this.options.Baseball = {
      configurable: false,
      name: "Baseball",
      type: "bool",
      val: false
    };

    this.options ["Fence line"] = {
      configurable: true,
      name: "Fence line",
      type: "bool",
      val: false
    };

    this.options ["Fence line size"] = {
      get configurable()
      {
        return this_class.options["Fence line"].val;
      },
      name: "Fence line size",
      type: "float",
      val: (175).foot2meter()
    };
    this.options.draw_grass_line = {
      configurable: true,
      name: "Draw grass line",
      type: "bool",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        this_class.options.FoulLineLength.val = this_class.options.FoulLineLength._val;
      }
    };
    this.options.grassline = {
      get configurable()
      {
        return this_class.options.draw_grass_line.val;
      },
      name: "grassline radius",
      type: "float",
      _val: (60).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val <= 0.5 )
          this._val = 0.5;
        else
          this._val = new_val;
      },
      prev_sibling: "draw_grass_line"
    };
    this.options["batters box"] = {
      configurable: false,
      name: "Batter's box",
      type: "bool",
      val: true
    };
    this.options.bb_length = {
      configurable: true,
      name: "batters box length",
      type: "float",
      _val: (17).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5;
        else
          this._val = new_val;
      }
    };
    this.options.bb_width = {
      configurable: false,
      name: "batters box width",
      type: "float",
      _val: (8).foot2meter() + (5).inch2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options.bb_dist = {
      configurable: false,
      name: "batters box distance",
      type: "float",
      _val: (8).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options.bb_dist2 = {
      configurable: false,
      name: "batters box distance",
      type: "float",
      _val: (43).inch2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options["Infield"] = {
      configurable: true,
      name: "Draw infield",
      type: "bool",
      val: false
    };
    // Goal Line and Keeper Zone Line is measured from the midline, not from the end line.
    this.options.field_length = {
      configurable: true,
      name: "Base length",
      type: "float",
      _val: (65).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val <= 0.5 )
          this._val = 0.5;
        else
          this._val = new_val;
      },
      prev_sibling: "Infield"
    };
    this.options.picth_length = {
      configurable: false,
      name: "Pitcher's plate length",
      type: "float",
      _val: (24).inch2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options.picth_width = {
      configurable: false,
      name: "Pitcher's plate length",
      type: "float",
      _val: (6).inch2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options["Coach Boxes"] = {
      configurable: true,
      name: "Coach Boxes",
      type: "bool",
      val: true
    };

    this.options.cb_width = {
      configurable: false,
      name: "Coach box width",
      type: "float",
      _val: (1).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options.cb_length = {
      configurable: false,
      name: "Coach box length",
      type: "float",
      _val: (15).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options.cb_dist = {
      configurable: true,
      name: "Coach box distance",
      type: "float",
      _val: (8).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options["Coach Boxes"] = {
      configurable: true,
      name: "Coach Boxes",
      type: "bool",
      val: true
    };
    this.options["Hashed Center Circle"] = {
      configurable: true,
      name: "Hashed Pitcher's circle",
      type: "bool",
      val: false
    };
    this.options.Radius = {
      configurable: false,
      name: "Pitcher's circle radius",
      type: "float",
      _val: (16).foot2meter() / 2,
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };

    this.options.draw_middle_circle = {
      configurable: true,
      name: "Pitchers circle",
      type: "bool",
      val: false
    };
    this.options.draw_middle_plate = {
      configurable: true,
      name: "Pitchers plate",
      type: "bool",
      val: false,
      prev_sibling: 'draw_middle_circle'
    };
    this.options.draw_pitchers_lane = {
      configurable: true,
      name: "Pitchers lane",
      type: "bool",
      val: false,
    };
    this.options.pitchers_distance = {
      get configurable()
      {
        return this_class.options.draw_middle_circle.val || this_class.options.draw_middle_plate.val;
      },
      name: "Pitchers distance",
      type: "float",
      val: (60).foot2meter() + (6).inch2meter(),
      prev_sibling: 'draw_middle_plate'
    };

    this.options["On deck circle"] = {
      configurable: true,
      name: "On deck circle",
      type: "bool",
      val: true
    };
    this.options.On_deck_radius = {
      get configurable(){
        return this_class.options["On deck circle"].val;
      },
      name: "On deck radius",
      type: "float",
      _val: (5).foot2meter() / 2,
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "On deck circle"
    };
    this.options.On_deck_dist = {
      get configurable()
      {
        return !this_class.options["Based on foul line"].val;
      },
      name: "On deck circles distance",
      type: "float",
      _val: (30).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "On deck circle"
    };
    this.options["Based on foul line"] = {
      get configurable(){
        return this_class.options["On deck circle"].val;
      },
      name: "On deck based on foul line",
      val: false,
      type: "bool",
    };
    this.options["Parallel distance"] = {
      get configurable()
      {
        return this_class.options["Based on foul line"].val;
      },
      name: "Parallel dist to foul line",
      type: "float",
      _val: (30).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
    }
    this.options["Perpendicular distance"] = {
      get configurable()
      {
        return this_class.options["Based on foul line"].val;
      },
      name: "Perpendicular dist to foul line",
      type: "float",
      _val: (10).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
    }
    this.options["Bases"] = {
      configurable: false,
      name: "Bases",
      type: "bool",
      val: false
    };
    this.options.base_size = {
      get configurable()
      {
        return this_class.options["Bases"].val;
      },
      name: "Base width/length",
      type: "float",
      _val: (15).inch2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Bases"
    };
    this.options["Home Plate"] = {
      configurable: true,
      name: "Home Plate",
      type: "bool",
      val: false
    };
    this.options["Runners lane"] = {
      configurable: true,
      name: "Runners lane",
      type: "bool",
      val: true
    };
    this.options.run_dist = {
      configurable: false,
      name: "Runners lane distance",
      type: "float",
      _val: (3).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options.CatchersBox = {
      configurable: true,
      name: "Catcher's Box",
      type: "bool",
      val: true
    };
    this.options.IdenticalFoulLines = {
      configurable: true,
      name: "Foul Lines same length",
      type: "bool",
      val: true
    };
    this.options.FixedPoles = {
      get configurable()
      {
        return this_class.options.Baseball.val;
      },
      name: "Fixed Foul posts",
      type: "bool",
      val: true
    };
  }

  get info_options()
  {
    return [ ];
  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "corner,2_sides": 3,
      "corner,2_posts": 3,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0.014, 1 ),
        new Vector( 0.014, 0.25 )
      ];
    }
    if( layout_method === "corner,2_sides" )
    {
      return [
        new Vector( 0.014, 1 ),
        new Vector( 0.014, 0.25 ),
        new Vector( 0.75, 1 )
      ];
    }
    if( layout_method === "corner,2_posts" )
    {
      return [
        new Vector( 0.014, 1 ),
        new Vector( 0.014, 0 ),
        new Vector( 0.96, 1 )
      ];
    }
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var p = [ ];
    switch( this.layout_method )
    {
      case "corner,side":
        p = this.from2pointsTo4Corners( this.points );
        let l = new Line( p[0], p[1] );
        this.options.Angle.val = l.unit_vector.angle;
        break;
      case "corner,2_sides":
        p = this.from3pointsTo4Corners( this.points );
        break;
      case "corner,2_posts":
        p = this.from3cornersTo4Corners( this.points );
        break;
      case "free_hand":
        p = this.fromStartTo4corners( this.points[0] );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    return p;
  }
  from3cornersTo4Corners( points )
  {
    var g_1 = new Line( points[0], points[1] );
    var g_2 = new Line( points[0], points[2] );
    var g1 = g_1.unit_vector;
    var g2 = g_2.unit_vector;




    //foul lines are inside the home plate
    var start = points[0].add( g1.multiply( this.options.LineWidth.val / 2 ) ).add( g2.multiply( this.options.LineWidth.val / 2 ) );

    //update vectors to use start
    g_1 = new Line( start, points[1] );
    g_2 = new Line( start, points[2] );
    g1 = g_1.unit_vector;
    g2 = g_2.unit_vector;

    this.options.IdenticalFoulLines.val = false;
    this.options.FoulLineLength.val = g_1.length;
    this.options.FoulLineLength2.val = g_2.length;

    var p1 = start;
    var p2 = points[1];
    var p4 = points[2];

    var l1 = new Line( p2, p2.add( g2.multiply( g_2.length ) ) );
    var l2 = new Line( p4, p4.add( g1.multiply( g_1.length ) ) );
    var p3 = l1.cross_with_line( l2 );

    return [ p1, p2, p3, p4 ];
  }
  from3pointsTo4Corners( points )
  {
    var g_1 = new Line( points[0], points[1] );
    var g_2 = new Line( points[0], points[2] );
    var g1 = g_1.unit_vector;
    var g2 = g_2.unit_vector;

    var g1_c = g1.rotate_90_cw();
    var g2_c = g2.rotate_90_ccw();

    //foul lines are inside the home plate
    var start = points[0].add( g1.multiply( this.options.LineWidth.val / 2 ) ).add( g2.multiply( this.options.LineWidth.val / 2 ) );

    //update vectors to use start
    g_1 = new Line( points[0], points[1] );
    g_2 = new Line( points[0], points[2] );
    g1 = g_1.unit_vector;
    g2 = g_2.unit_vector;

    if( !this.options.IdenticalFoulLines.val )
    {
      g_1 = g1.multiply( this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      g_2 = g2.multiply( this.options.FoulLineLength2.val - this.options.LineWidth.val * 1.5 );
      var p3_len = this.options.FoulLineLength2.val - this.options.LineWidth.val * 1.5;
    }
    else
    {
      g_1 = g1.multiply( this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      g_2 = g2.multiply( this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      var p3_len = this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5;
    }


    var p1 = start;
    var p2 = start.add( g_1 ).add( g1_c.multiply( this.options.LineWidth.val / 2 ) );
    var p4 = start.add( g_2 ).add( g2_c.multiply( this.options.LineWidth.val / 2 ) );

    var l1 = new Line( p2, p2.add( g2.multiply( p3_len ) ) );
    var l2 = new Line( p4, p4.add( g1.multiply( new Line( p1, p2 ).length ) ) );
    var p3 = l1.cross_with_line( l2 );

    return [ p1, p2, p3, p4 ];

  }
  from2pointsTo4Corners( points )
  {
    var l = new Line( points[0], points[1] );
    var g1 = l.unit_vector;
    var g2_2 = g1.rotate_90_cw();

    //foul lines are inside the home plate
    var start = points[0].add( g1.multiply( this.options.LineWidth.val / 2 ) ).add( g2_2.multiply( this.options.LineWidth.val / 2 ) );

    //update vectors to use start
    var g_1 = new Line( start, points[1] );
    g1 = g_1.unit_vector;

    if( !this.options.IdenticalFoulLines.val )
    {
      var g = g1.multiply( this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      var g2 = g1.multiply( this.options.FoulLineLength2.val - this.options.LineWidth.val * 1.5 ).rotate_90_ccw();
    }
    else
    {
      var g = g1.multiply( this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      var g2 = g.rotate_90_ccw();
    }

    var p1 = start;
    var p2 = p1.add( g );
    var p3 = p2.subtract( g2 );
    var p4 = p1.subtract( g2 );

    return [ p1, p2, p3, p4 ];
  }

  fromStartTo4corners( start )
  {
    if( !this.options.IdenticalFoulLines.val )
    {
      var g = new Vector( 0, this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      g = g.rotate( this.options.Angle.val );
      //var g2 = g.rotate_90_ccw();
      var g2 = new Vector( 0, this.options.FoulLineLength2.val - this.options.LineWidth.val * 1.5 );
      g2 = g2.rotate( this.options.Angle.val ).rotate_90_ccw();
    }
    else
    {
      var g = new Vector( 0, this.options.FoulLineLength.val - this.options.LineWidth.val * 1.5 );
      g = g.rotate( this.options.Angle.val );
      var g2 = g.rotate_90_ccw();
    }

    var start = start;

    var p1 = start;
    var p2 = p1.add( g );
    var p3 = p2.subtract( g2 );
    var p4 = p1.subtract( g2 );
    return [ p1, p2, p3, p4 ];
  }

  get center()
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[1];
    var c3 = p[2];
    var c4 = p[3];

    var m2 = new Line( c4, c1 ).middle;
    var m1 = new Line( c2, c3 ).middle;
    var middle_line = new Line( m1, m2 );
    var center = middle_line.middle;
    return center;
  }
  make_side_copy( i, space, n )
  {
    var plus = this.options.FoulLineLength.val;

    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.editable = this.editable;
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  can_convert_to_free_hand()
  {
    return this.layout_method === "corner,side";
  }

  convert_to_free_hand()
  {

    var p = this.drawing_points;

    var l = new Line( p[0], p[3] );

    this.options.Angle.val = l.as_vector.angle;

    var g = new Vector( 0, 1 );
    g = g.rotate( this.options.Angle.val );
    var g2 = g.rotate_90_ccw();
    var start = p[0].add( g.multiply( this.options.LineWidth.val ) ).subtract( g2.multiply( this.options.LineWidth.val ) );

    this.points = [ start ];
    this.layout_method = "free_hand";
    delete this.calculated_drawing_points;
    this.draw();
  }

  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;
    var g_line = new Line( p[0], p[3] );
    var angle_g = g_line.unit_vector;

    if( !this.options.IdenticalFoulLines.val )
    {
      var angleHandle = p[3].subtract( angle_g.multiply( g_line.length * 0.25 ) );
    }
    else
    {
      var angleHandle = p[3];
    }

    this.handles.push( new Handle( angleHandle, -this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
    {

      var new_angle = new Line( p[0], new_pos_v ).as_vector.angle;
      new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];

      this_class.options.Angle.val = new_angle;
      delete this.calculated_drawing_points;
      this_class.draw();

    }, function( new_angle )
    {
      return this_class.set_new_val( this_class.options.Angle, new_angle );
    }, "deg" ) );


    this.handles.push( new Handle( p[1], -this.options.Angle.val, "FoulLineLength", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {

      var l = new Line( p[0], new_pos_v );


      this_class.options.FoulLineLength.val = l.length;
      delete this.calculated_drawing_points;
      this_class.draw();

    }, function( new_length )
    {
      return this_class.set_new_val( this_class.options.FoulLineLength, new_length );
    }, "m" ) );
    if( !this.options.IdenticalFoulLines.val )
    {
      this.handles.push( new Handle( p[3], -this.options.Angle.val + Math.PI / 2, "FoulLineLength2", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {

        var l = new Line( p[0], new_pos_v );


        this_class.options.FoulLineLength2.val = l.length;
        delete this.calculated_drawing_points;
        this_class.draw();

      }, function( new_length )
      {
        return this_class.set_new_val( this_class.options.FoulLineLength2, new_length );
      }, "m" ) );
    }

    this.handles.push( new Handle( p[0], -this.options.Angle.val, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
    {

      this_class.points = [ new_pos_v ];
      delete this_class.calculated_drawing_points;
      this_class.draw();

      var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );

      align_this = align_this[0];

      this_class.points = [ new_pos_v.subtract( align_this ) ];
      delete this_class.calculated_drawing_points;
      this_class.draw();

    }, function( new_pos_v )
    {

      this_class.points = [ new_pos_v ];
      this_class.draw();
      return true;
    } ) );

  }

  generate_grassline( center )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }

    var radius = this.options.grassline._val - this.options.LineWidth.val;
    if( radius < this.options.pitchers_distance.val )
      radius = this.options.pitchers_distance.val + this.options.LineWidth.val;
    //var radius = (60).foot2meter();

    var p1 = center.add( s4_g2.multiply( radius ) );
    var p2 = center.add( s1_g1.multiply( radius ) );
    var new_p1 = s1.crosses_with_circle( center, radius )[1];
    var new_p2 = s4.reverse().crosses_with_circle( center, radius )[1];
    var g_mid = new Line( new_p1, new_p2 ).middle;
    var guide = new Line( center, g_mid ).unit_vector;
    var middle = center.add( guide.multiply( radius ) );

    return [ new_p2, middle, new_p1 ];
  }

  fixed_poles( start, end, check = false)
  {
    if( new Line( start, end ).length > 3 )
      var line = new Line( start, end ).split( new Line( start, end ).length - 3 );
    else
      var line = new Line( start, end ).split( new Line( start, end ).length * 0.85 );

    var first_part = line[0];
    var reverse_part = line[1];
    this.tasks.push( first_part.toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( reverse_part.toLineTask( this.tasks.length, false, true ) );
    this.tasks[ this.tasks.length - 1 ].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    if( check === true )
    {
      var buf = this.tasks[this.tasks.length - 2];
      this.tasks[this.tasks.length - 2] = this.tasks[this.tasks.length - 1];
      this.tasks[this.tasks.length - 1] = buf.opposite_direction;
  }
  }

  batters_box( check )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
      var c1c4 = s4.unit_vector;

    }



    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var g = new Line( c1, guide ).unit_vector;
    var g2 = g.rotate_90_cw();

    // home plate
    var width = (17).inch2meter() - this.options.LineWidth.val;
    var hyp = Math.sqrt( Math.pow( width / 2, 2 ) * 2 );
    var p1 = c1.add( s1_g1.multiply( hyp ) );
    var p2 = p1.add( g.multiply( width / 2 ) );
    var p3 = p2.add( g2.multiply( width ) );
    var p4 = c1.add( s4_g2.multiply( hyp ) );

    if( check === 1 && this.options.draw_batter_area.val )
    {
      if( this.options["Home Plate"].val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1, p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p4, c1 ], false, true ) );

      }
    }

    var len = this.options.bb_length._val - this.options.LineWidth.val;
    var wid = this.options.bb_width._val - this.options.LineWidth.val;
    var batbox1 = (4).foot2meter();
    var batbox2 = (3).foot2meter();
    var plate_hyp = Math.sqrt( Math.pow( this.options.LineWidth.val / 2, 2 ) * 2 );
    var dist = plate_hyp + this.options.bb_dist._val - this.options.LineWidth.val / 2;
    var batbox_width = (3).foot2meter();

    var back_mid = c1.subtract( g.multiply( dist ) );
    var bc1 = back_mid.subtract( g2.multiply( wid / 2 ) );
    var bc2 = bc1.add( g.multiply( len ) );
    var bc3 = bc2.add( g2.multiply( wid ) );
    var bc4 = bc1.add( g2.multiply( wid ) );



    var side;
    var start;
    var boxes = [ ];
    for( var i = 0; i < 2; i++ )
    {
      if( i === 0 )
      {
        start = bc2;
        side = 1;


      }
      else
      {

        start = bc3;
        side = -1;
      }
      var buf = [ ];
      buf.push( start.add( g2.multiply( batbox_width * side ) ) );
      buf.push( buf[0].subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[1].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      buf.push( start.subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[3].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      boxes.push( buf );

    }

    var box1 = boxes[0];
    var box2 = boxes[1];

    // BASEBALL
    // box dimensions for Baseball
    var height = this.options.bb_length._val - this.options.LineWidth.val;
    let default_height = (6).foot2meter() - this.options.LineWidth.val;
    let default_width = (4).foot2meter() - this.options.LineWidth.val;
    var width = this.options.bb_width._val - this.options.LineWidth.val;
    var hori_dist = this.options.bb_dist2._val - this.options.LineWidth.val;
    var vert_dist = (25.96).inch2meter() + height - this.options.LineWidth.val / 2; 
    var start = 0;
    var box = [ ];

    for( var i = 0; i < 2; i++ )
    {
      if( start === 0 )
        var p1 = c1.subtract( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + default_width + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + default_height / 2 ) );
      else
        var p1 = c1.add( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + default_height / 2 ) );

      var p2 = p1.add( g2.multiply( width ) );
      var p3 = p2.subtract( g.multiply( height ) );
      var p4 = p1.subtract( g.multiply( height ) );
      box.push( [ p1, p2, p3, p4 ] );

      start = 1;

    }



    // bottom of batters' box.
    var bottom_mid = c1.subtract( g.multiply( vert_dist ) );
    var bot_c1 = bottom_mid.subtract( g2.multiply( hori_dist / 2 ) );
    var bot_c4 = bottom_mid.add( g2.multiply( hori_dist / 2 ) );
    var t_c2 = c1.subtract( g2.multiply( hori_dist / 2 ) );
    var t_c3 = c1.add( g2.multiply( hori_dist / 2 ) );

    var left = new Line( bot_c1, t_c2 );
    var right = new Line( bot_c4, t_c3 );
    var hori_line = new Line( box[0][2], box[0][3] );

    var top_c2 = left.cross_with_line( hori_line );
    var top_c3 = right.cross_with_line( hori_line );

    if( check === 1 )
    {

      if( !this.options.Baseball.val )
      {

        return [ bc1, bc2, bc3, bc4 ];

      }

      else
        return [ box[0][3], box[0][0], box[1][1], box[1][2] ];

    }



    if( check === 2 && this.options.draw_batter_area.val )
    {
      if( !this.options.Baseball.val )
      {
        // vertical lines
        this.tasks.push( new LineTask( this.tasks.length, [ bc1, bc2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ bc3, bc4 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box2[2], box2[0] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box1[0], box1[2] ], false, true ) );

        // INSERT BEZIER TASK HERE
        // INSERT BEZIER TASK HERE
        // INSERT BEZIER TASK HERE


        //horizontal lines
        this.tasks.push( new LineTask( this.tasks.length, [ bc1, bc4 ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box2[4], box2[2] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[2], box1[4] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ bc3, box2[0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[0], bc2 ], false, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][3], box[0][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][1], box[0][2] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][3], box[1][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][1], box[1][2] ], false, true ) );

        if( this.options.CatchersBox.val )
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, bot_c1 ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[0][0], box[0][1] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][0], box[1][1] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][2], box[1][3] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][2], box[0][3] ], false, true ) );

        if( this.options.CatchersBox.val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ top_c2, bot_c1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, top_c3 ], false, true ) );
        }
      }
    }
  }

  coach_boxes( check, start )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }

    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var m1 = new Line( c1, guide ).unit_vector;
    var m2 = m1.rotate_90_cw();

    var len = this.options.cb_length._val - this.options.LineWidth.val;
    var width = this.options.cb_width._val - this.options.LineWidth.val;
    var dist = this.options.cb_dist._val - this.options.LineWidth.val;
    var rad = this.options.On_deck_radius._val - this.options.LineWidth.val / 2;
    var circle_dist = this.options.On_deck_dist._val + rad - this.options.LineWidth.val;
    var side;

    if( check === 1 )
    {
      side = 1;
      var g1 = s1_g1;
      var g2 = s1_g2;
    }
    else
    {
      side = -1;
      var g1 = s4_g2;
      var g2 = s4_g1;
    }

    var p1 = start.subtract( g2.multiply( dist + width ) );
    var p2 = p1.add( g2.multiply( width ) );
    var p3 = p2.subtract( g1.multiply( len ) );
    var p4 = p3.subtract( g2.multiply( width ) );
    var center = c1.add( m2.multiply( -circle_dist * side ) );

    if( this.options["Coach Boxes"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
    }

    if( this.options["On deck circle"].val )
    {
      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad ) ), center.add( g1.multiply( -rad ) ) ], center, true, false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
      this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
    }

    if( check === 2 && this.options["Runners lane"].val )
    {
      var run_p1 = start.subtract( g2.multiply( this.options.run_dist.val ) );
      var run_p2 = run_p1.subtract( g1.multiply( (this.options.field_length.val - this.options.LineWidth.val) / 2 ) );

      this.tasks.push( new LineTask( this.tasks.length, [ run_p1, run_p2 ], false, true ) );
    }
  }

  make_center( center )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }
    var guide_1 = c1.add( s1_g1.multiply( 2 ) );
    var guide_2 = c1.add( s4_g2.multiply( 2 ) );
    var guide = new Line( guide_1, guide_2 ).middle;

    var g1 = new Line( c1, guide ).unit_vector;
    var g2 = g1.rotate_90_cw();
    var radius = this.options.Radius._val - this.options.LineWidth.val;
    var length = this.options.picth_length._val - this.options.LineWidth.val; 
    var width = this.options.picth_width._val - this.options.LineWidth.val; 

    let circle_center = c1.add( g1.multiply( this.options.pitchers_distance.val ) );

    var p1 = circle_center.subtract( g1.multiply( width / 2 ) ).subtract( g2.multiply( length / 2 ) );
    var p2 = p1.add( g1.multiply( width ) );
    var p3 = p2.add( g2.multiply( length ) );
    var p4 = p1.add( g2.multiply( length ) );
    var pitch_front = center.subtract( g1.multiply( width / 2 + this.options.LineWidth.val / 2 ) );
    pitch_front = circle_center;

    if( this.options.draw_middle_plate.val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p2 ], false, true ) );
    }

    if( this.options.draw_pitchers_lane.val ){
        let pl1 = p4.subtract( g1.multiply((9).foot2meter())).add(g2.multiply(0.203));
        let pl2 = p1.subtract( g1.multiply((9).foot2meter())).subtract(g2.multiply(0.203));
        let new_pl1 = new Line(p4, pl1).crosses_with_circle(circle_center, radius)[0];
        let new_pl2 = new Line(p1, pl2).crosses_with_circle(circle_center, radius)[0];
        this.tasks.push(new LineTask( this.tasks.length, [p4, new_pl1], false, true));
        this.tasks.push(new LineTask( this.tasks.length, [p1, new_pl2], false, true));
    }

    if( this.options.draw_middle_circle.val )
    {
      if( !this.options.NoBrokenLines.val )
      {
        this.tasks.push( new ArcTask( this.tasks.length, [ circle_center.add( g2.multiply( radius ) ),
          circle_center.add( g2.multiply( -radius ) ) ], circle_center, true, false, true ) );
      }
      else
      {
        this.tasks.push( new ArcTask( this.tasks.length, [ circle_center.add( g2.multiply( -radius ) ),
          circle_center.add( g2.multiply( radius ) ) ], circle_center, true, false, true ) );
      }
      if( this.options["Hashed Center Circle"].val )
      {
        var o = radius * 2 * Math.PI;
        var n = Math.round( o / (1).foot2meter() );
        var len = o / n;
        var dash_length = len;
        var dash_space = dash_length;
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 3 ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
    }
    return pitch_front;
  }

  draw_base( which_corner, start )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );
      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }
    var centered = false;
    var base_size = this.options.base_size._val - this.options.LineWidth.val;
    switch( which_corner )
    {
      case 0:
        var g2 = s1.reverse().unit_vector;
        var g1 = g2.rotate_90_ccw();
        break;
      case 1:
        var g1 = s1_g1;
        var g2 = s1_g2;
        centered = true;
        break;
      case 2:
        var g1 = s4.unit_vector;
        var g2 = s4_g1;
        break;
    }
    if( centered )
    {
      var buf = start.subtract( g1.multiply( base_size / 2 ) ).subtract( g2.multiply( base_size / 2 ) );
      start = buf;
    }
    var p1 = start;
    var p2 = start.add( g1.multiply( base_size ) );
    var p3 = p2.add( g2.multiply( base_size ) );
    var p4 = p3.subtract( g1.multiply( base_size ) );
    if( centered )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );

      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
    }

  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];


      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );



      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
      //fence line
      var fl1 = c1.add( s1_g1.multiply( this.options ["Fence line size"].val ) );
      var fl2 = c1.add( s4_g2.multiply( this.options ["Fence line size"].val ) );
      var gfl = new Line( c1, c3 ).unit_vector;
      var fl3 = c1.add( gfl.multiply( this.options ["Fence line size"].val ) );
    }

    // home plate
    var bb_corners = this.batters_box( 1 );
    if( !this.options.Baseball.val )
    {
      var l1 = new Line( bb_corners[1], bb_corners[0] );
      var l2 = new Line( bb_corners[2], bb_corners[3] );
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l2 );
    }
    else
    {
      var l1 = new Line( bb_corners[1], bb_corners[2] );
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l1 );
    }
    var ic2 = c1.add( s1_g1.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic3 = ic2.add( s3_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic4 = c1.add( s4_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );

    var g_arc = new Line( c2, c4 ).middle;
    var guide = new Line( c1, g_arc ).unit_vector;
    var mid_point = c1.add( guide.multiply( new Line( c1, c4 ).length ) );

    var i_center = new Line( c1, ic3 ).middle;

    if( !this.options["Infield"].val )
    {
      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 1, ic2 );

      if( this.options["Bases"].val )
        this.draw_base( 0, ic2 );
      if( this.options["Bases"].val )
        this.draw_base( 1, ic3 );

      var pitch_front = this.make_center( i_center );

      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 2, ic4 );

      if( this.options["Bases"].val )
        this.draw_base( 2, ic4 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, c2 ], false, true ) );
      else
        this.fixed_poles( c1_left, c2 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );
      else
        this.fixed_poles( c1_right, c4, true );

      // grass line
      if( this.options.draw_grass_line.val )
      {
        if( this.options.Baseball.val )
        {
          var grass_points = this.generate_grassline( pitch_front );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], pitch_front, false, false, true ) );
        }
        else
        {
          var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

      }
    }
    else
    {
      // inner field & Coach boxes
      if( !this.options.NoBrokenLines.val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, ic2 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );
        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );
        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        var pitch_front = this.make_center( i_center );
        // grass line
        if( this.options.draw_grass_line.val )
        {
          let grass_points;
          if( this.options.Baseball.val )
            grass_points = this.generate_grassline( pitch_front );
          else
            grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

        // rest of main field
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, c2 ], false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        //add ramp on last task somehow to make lines align better
        this.tasks.push( new LineTask( this.tasks.length, [ ic4, c1_right ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ c4, ic4 ], false, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, c2 ], false, true ) );

        //fence line
        if( this.options ["Fence line"].val )
          this.tasks.push( new ArcTask( this.tasks.length, [ fl1, fl3, fl2 ], c1, true, true, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );

        var pitch_front = this.make_center( i_center );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );

        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );

        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        // grass line
        if( this.options.draw_grass_line.val )
        {
          if( this.options.Baseball.val )
            var grass_points = this.generate_grassline( pitch_front );
          else
            var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }
      }
    }
    // batter's box
    this.batters_box( 2 );

    this.start_locations.push( new StartLocation( this.tasks[0].ends[0], this.tasks[0].id ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

  refresh_bb()
  {
    var p = this.drawing_points;
    this.bb = [ p[0], p[1], p[2], p[3] ];
  }
  refresh_test_run()
  {
    // Change to go to the bases

    var p = this.drawing_points;
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[3] ) );
  }
  refresh_snapping_lines()
  {
    // Change to go to the bases ??
    this.snapping_lines = [ ];
    var p = this.drawing_points;

    this.snapping_lines.push( new Line( p[0], p[1] ) );
    this.snapping_lines.push( new Line( p[1], p[2] ) );
    this.snapping_lines.push( new Line( p[2], p[3] ) );
    this.snapping_lines.push( new Line( p[3], p[0] ) );


    var e1 = new Line( p[0], p[1] ).middle;
    var e2 = new Line( p[2], p[3] ).middle;
    var m1 = new Line( e1, e2 );
    var s1 = new Line( p[1], p[2] ).middle;
    var s2 = new Line( p[0], p[3] ).middle;
    var m2 = new Line( s1, s2 );

    this.snapping_lines.push( m1 );
    this.snapping_lines.push( m2 );

  }
}

class Softball extends Softball_base
{
  static template_type = "Softball"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "softball"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }
}
class Softball_US extends Softball_base
{
  static template_type = "Softball"; // Translateable
  static template_title = "US"; // Translateable
  static template_id = "softball_us"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    //this.options["Right goal pole"].configurable = false;
    //this.options["Left goal pole"].configurable = false;

    this.options.NoBrokenLines.val = true;
    this.options.draw_batter_area.val = true;
    this.options.Baseball.val = false;
    this.options.draw_grass_line._val = false;
    this.options.grassline._val = 0;
    this.options["batters box"].val = true;
    this.options.bb_length.configurable = false;
    this.options.bb_dist._val = (-8.5).inch2meter() + (-4 + 7 + 10).foot2meter();
    this.options["Infield"].val = false;

    this.options["Coach Boxes"].val = true;
    this.options["Hashed Center Circle"].val = false;
    this.options.Radius._val = (16).foot2meter() / 2;
    this.options["On deck circle"].val = false;
    this.options.On_deck_radius._val = (2).foot2meter() + (6).inch2meter();
    this.options["Bases"].val = false;
    this.options["Home Plate"].val = false;
    this.options["Runners lane"].val = true;

    this.options["Coach Boxes As L"] = {
      configurable: true,
      name: "Coach boxes as 'L'",
      type: "bool",
      val: false,
      prev_sibling: "Coach Boxes"
    };
    this.options["Coach Boxes As Open Boxs"] = {
      configurable: true,
      name: "Coach boxes as open boxs",
      type: "bool",
      val: true,
      prev_sibling: "Coach Boxes As L"
    };
    this.options.CatchersBoxLength7 = {
      name: "Catcher's box 7 foot",
      configurable: true,
      type: "bool",
      _val: false,
    };  
    
    this.options["Coach Boxes without thickness"] = {
      configurable: true,
      name: "Double-lined coach boxes",
      type: "bool",
      val: false,
      prev_sibling: "Coach Boxes"
    }
  }

  coach_boxes( check, start )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s4 = new Line( c4, c1 );
      
      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }

    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var m1 = new Line( c1, guide ).unit_vector;
    var m2 = m1.rotate_90_cw();

    var len = this.options.cb_length._val - this.options.LineWidth.val;
    var width = this.options.cb_width._val - this.options.LineWidth.val;
    var dist = this.options.cb_dist._val - this.options.LineWidth.val;

    var rad = this.options.On_deck_radius._val - this.options.LineWidth.val / 2;
    var circle_dist = this.options.On_deck_dist._val + rad - this.options.LineWidth.val;
    var side;

    if( check === 1 )
    {
      side = 1;
      var g1 = s1_g1;
      var g2 = s1_g2;
    }
    else
    {
      side = -1;
      var g1 = s4_g2;
      var g2 = s4_g1;
    }

    let boxWidth = (3).foot2meter();

    let center = c1.add( m2.multiply( - circle_dist * side ) );
    let p1 = start.subtract( g2.multiply( dist + width ) );
    let p2 = p1.add( g2.multiply( width ) );
    let p3 = p2.subtract( g1.multiply( len ) );
    let p4 = p3.subtract( g2.multiply( width ) );
    let p5 = p4.add( g1.multiply( width ) );
    let new_p4 = p3.subtract(g2.multiply( boxWidth ));
    let p6 = new_p4.add( g1.multiply( width ));
    let new_p1 = p1.subtract( g1.multiply( width ) );
    let p7 = new_p1.subtract(g2.multiply(( boxWidth ) - width));
    let p8 = p7.add(g1.multiply(width));



    if( this.options["Coach Boxes"].val )
    {

      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );

      if(this.options["Coach Boxes As L"].val )
      {

        this.tasks.push( new LineTask( this.tasks.length, [ p3, new_p4 ], false, true )); 
        if(this.options["Coach Boxes without thickness"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ new_p4, p6 ], false, true )); 
        this.tasks.push( new LineTask( this.tasks.length, [ p6, p5 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ p5, p1 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      }
      }
      else if(this.options["Coach Boxes As Open Boxs"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ p3, new_p4 ], false, true )); 
        if(this.options["Coach Boxes without thickness"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ new_p4, p6 ], false, true )); 
        this.tasks.push( new LineTask( this.tasks.length, [ p6, p5 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ p5, new_p1 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ new_p1, p7 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p7, p8 ], false, true ) );
        }
        this.tasks.push( new LineTask( this.tasks.length, [ p8, p2 ], false, true ) );

      }
      else {
        this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) ); 
        this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) ); 
      }
    }

    if( this.options["On deck circle"].val )
    {
      if(this.options["Based on foul line"].val){
        if(check === 1){
          center = c1.add(g2.multiply(this.options["Parallel distance"].val)).subtract(g1.multiply(this.options["Perpendicular distance"].val));
        }
        else{
          center = c1.add(g2.multiply(this.options["Parallel distance"].val)).subtract(g1.multiply(this.options["Perpendicular distance"].val));
        }
      }
      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad ) ), center.add( g1.multiply( -rad ) ) ], center, true, false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
      this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
    }

    if( check === 2 && this.options["Runners lane"].val )
    {
      var run_p1 = start.subtract( g2.multiply( this.options.run_dist.val ) );
      var run_p2 = run_p1.subtract( g1.multiply( (this.options.field_length.val - this.options.LineWidth.val) / 2 ) );

      this.tasks.push( new LineTask( this.tasks.length, [ run_p1, run_p2 ], false, true ) );
    }
  }

  batters_box( check )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s4_g2 = s4.reverse().unit_vector;

    }


    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var g = new Line( c1, guide ).unit_vector;
    var g2 = g.rotate_90_cw();

    // home plate
    var width = (17).inch2meter() - this.options.LineWidth.val;
    var hyp = Math.sqrt( Math.pow( width / 2, 2 ) * 2 );
    var p1 = c1.add( s1_g1.multiply( hyp ) );
    var p2 = p1.add( g.multiply( width / 2 ) );
    var p3 = p2.add( g2.multiply( width ) );
    var p4 = c1.add( s4_g2.multiply( hyp ) );

    if( check === 1 && this.options.draw_batter_area.val )
    {
      if( this.options["Home Plate"].val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1, p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p4, c1 ], false, true ) );
      }
    }

    var batbox1 = (4).foot2meter();
    var batbox2 = (3).foot2meter();
    var plate_hyp = Math.sqrt( Math.pow( this.options.LineWidth.val / 2, 2 ) * 2 );
    var batbox_width = (3).foot2meter();

    let len = this.options.bb_length._val - this.options.LineWidth.val;
    let wid = this.options.bb_width._val;
    let dist = plate_hyp + this.options.bb_dist._val - this.options.LineWidth.val / 2;
    let back_mid = c1.subtract( g.multiply( dist ) );

    let bc1 = c1.subtract( g2.multiply( 0.5 * (wid + this.options.LineWidth.val))).subtract(g.multiply(dist));
    let bc2 = p1.subtract( g2.multiply(batbox2 + (6).inch2meter() + this.options.LineWidth.val)).add(g.multiply(batbox1 + plate_hyp + this.options.LineWidth.val/2));
    let bc3 = p4.add( g2.multiply(batbox2 + (6).inch2meter() + this.options.LineWidth.val)).add(g.multiply(batbox1 + plate_hyp + this.options.LineWidth.val/2));
    let bc4 = c1.add( g2.multiply( 0.5 * (wid + this.options.LineWidth.val))).subtract(g.multiply(dist));

    if(this.options.CatchersBoxLength7.val){
      bc1 = bc2.subtract(g.multiply(len - (3).foot2meter()));
      bc4 = bc3.subtract(g.multiply(len - (3).foot2meter()));
    }

    var side, start;
    var boxes = [ ];
    for( var i = 0; i < 2; i++ )
    {
      if( i === 0 ) {

        start = bc2;
        side = 1;
      }
      else {

        start = bc3;
        side = -1;
      }

      var buf = [ ];
      buf.push( start.add( g2.multiply( batbox_width * side ) ) );
      buf.push( buf[0].subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[1].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      buf.push( start.subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[3].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      boxes.push( buf );

    }

    var box1 = boxes[0];
    var box2 = boxes[1];

    // BASEBALL
    // box dimensions for Baseball
    var height = this.options.bb_length._val - this.options.LineWidth.val;
    var width = this.options.bb_width._val - this.options.LineWidth.val;
    var hori_dist = this.options.bb_dist2._val - this.options.LineWidth.val;
    var vert_dist = this.options.bb_dist._val - this.options.LineWidth.val / 2;
    var start = 0;
    var box = [ ];

    for( var i = 0; i < 2; i++ )
    {
      if( start === 0 )
        var p1 = c1.subtract( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + width + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + height / 2 ) );
      else
        var p1 = c1.add( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + height / 2 ) );

      var p2 = p1.add( g2.multiply( width ) );
      var p3 = p2.subtract( g.multiply( height ) );
      var p4 = p1.subtract( g.multiply( height ) );
      box.push( [ p1, p2, p3, p4 ] );

      start = 1;

    }

    // bottom of batters' box.
    var bottom_mid = c1.subtract( g.multiply( vert_dist ) );
    var bot_c1 = bottom_mid.subtract( g2.multiply( hori_dist / 2 ) );
    var bot_c4 = bottom_mid.add( g2.multiply( hori_dist / 2 ) );
    var t_c2 = c1.subtract( g2.multiply( hori_dist / 2 ) );
    var t_c3 = c1.add( g2.multiply( hori_dist / 2 ) );

    var left = new Line( bot_c1, t_c2 );
    var right = new Line( bot_c4, t_c3 );
    var hori_line = new Line( box[0][2], box[0][3] );

    var top_c2 = left.cross_with_line( hori_line );
    var top_c3 = right.cross_with_line( hori_line );

    if( check === 1 ) {

      if( !this.options.Baseball.val )
        return [ bc1, bc2, bc3, bc4 ];

      else
        return [ box[0][3], box[0][0], box[1][1], box[1][2] ];
    }


    if( check === 2 && this.options.draw_batter_area.val )
    {
      if( !this.options.Baseball.val )
      {
        // vertical lines
        if(this.options.CatchersBox.val){
          this.tasks.push( new LineTask( this.tasks.length, [ bc1, box1[4] ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ bc4, box2[4] ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ bc1, bc4 ], false, true ) );
        }
        this.tasks.push( new LineTask( this.tasks.length, [ bc2, box1[4] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ bc3, box2[4] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box2[2], box2[0] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box1[2], box1[0] ], false, true ) );

        //horizontal lines

        this.tasks.push( new LineTask( this.tasks.length, [ box2[4], box2[2] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[2], box1[4] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ bc3, box2[0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[0], bc2 ], false, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][3], box[0][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][1], box[0][2] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][3], box[1][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][1], box[1][2] ], false, true ) );

        if( this.options.CatchersBox.val )
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, bot_c1 ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[0][0], box[0][1] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][0], box[1][1] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][2], box[1][3] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][2], box[0][3] ], false, true ) );

        if( this.options.CatchersBox.val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ top_c2, bot_c1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, top_c3 ], false, true ) );
        }
      }
    }
  }
}


class Softball_NZ extends Softball_base
{
  static template_type = "Softball"; // Translateable
  static template_title = "NZ"; // Translateable
  static template_id = "softball_nz"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;


    this.options.NoBrokenLines.val = true;
    this.options.draw_batter_area.val = true;
    this.options.Baseball.val = false;
    this.options.draw_grass_line._val = false;
    this.options.grassline._val = 0;
    this.options["batters box"].val = true;

    this.options["Infield"].val = false;

    this.options["Coach Boxes"].val = true;
    this.options["Hashed Center Circle"].val = false;
    this.options.Radius._val = (16).foot2meter() / 2;
    this.options["On deck circle"].val = true;
    this.options.On_deck_radius._val = (2).foot2meter() + (6).inch2meter();
    this.options["Bases"].val = false;
    this.options["Home Plate"].val = false;
    this.options["Runners lane"].val = true;
    this.options.pitchers_distance = {
      get configurable()
      {
        return this_class.options.draw_middle_circle.val || this_class.options.draw_middle_plate.val;
      },
      name: "Pitchers distance",
      type: "float",
      val: 14.82,
      prev_sibling: 'draw_middle_plate'
    };

    this.options.bb_dist = {
      configurable: true,
      name: "batters box distance",
      type: "float",
      _val: (12.54).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };

  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];


      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );



      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
      //fence line
      var fl1 = c1.add( s1_g1.multiply( this.options ["Fence line size"].val ) );
      var fl2 = c1.add( s4_g2.multiply( this.options ["Fence line size"].val ) );
      var gfl = new Line( c1, c3 ).unit_vector;
      var fl3 = c1.add( gfl.multiply( this.options ["Fence line size"].val ) );
    }

    // home plate
    var bb_corners = this.batters_box( 1 );
    if( !this.options.Baseball.val )
    {
      var l1 = new Line( bb_corners[1], bb_corners[0] );
      var l2 = new Line( bb_corners[2], bb_corners[3] );
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l2 );
    }
    else
    {
      var l1 = new Line( bb_corners[1], bb_corners[2] );
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l1 );
    }
    var ic2 = c1.add( s1_g1.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic3 = ic2.add( s3_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic4 = c1.add( s4_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );

    var g_arc = new Line( c2, c4 ).middle;
    var guide = new Line( c1, g_arc ).unit_vector;
    var mid_point = c1.add( guide.multiply( new Line( c1, c4 ).length ) );

    var i_center = new Line( c1, ic3 ).middle;

    if( !this.options["Infield"].val )
    {
      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 1, ic2 );

      if( this.options["Bases"].val )
        this.draw_base( 0, ic2 );
      if( this.options["Bases"].val )
        this.draw_base( 1, ic3 );

      var pitch_front = this.make_center( i_center );

      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 2, ic4 );

      if( this.options["Bases"].val )
        this.draw_base( 2, ic4 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, c2 ], false, true ) );
      else
        this.fixed_poles( c1_left, c2 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );
      else
        this.fixed_poles( c1_right, c4, true );

      // grass line
      if( this.options.draw_grass_line.val )
      {
        if( this.options.Baseball.val )
        {
          var grass_points = this.generate_grassline( pitch_front );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], pitch_front, false, false, true ) );
        }
        else
        {
          var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

      }
    }
    else
    {
      // inner field & Coach boxes
      if( !this.options.NoBrokenLines.val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, ic2 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );
        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );
        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        var pitch_front = this.make_center( i_center );
        // grass line
        if( this.options.draw_grass_line.val )
        {
          let grass_points;
          if( this.options.Baseball.val )
            grass_points = this.generate_grassline( pitch_front );
          else
            grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

        // rest of main field
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, c2 ], false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        //add ramp on last task somehow to make lines align better
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );

        //fence line
        if( this.options ["Fence line"].val )
          this.tasks.push( new ArcTask( this.tasks.length, [ fl1, fl3, fl2 ], c1, true, true, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

        var pitch_front = this.make_center( i_center );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );

        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );

        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        // grass line
        if( this.options.draw_grass_line.val )
        {
          if( this.options.Baseball.val )
            var grass_points = this.generate_grassline( pitch_front );
          else
            var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }
      }
    }
    // batter's box
    this.batters_box( 2 );

    this.start_locations.push( new StartLocation( this.tasks[0].ends[0], this.tasks[0].id ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}


class TeeBall extends Softball_NZ
{
  static template_type = "Softball"; // Translateable
  static template_title = "Tee-ball"; // Translateable
  static template_id = "teeball"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    
    this.options.NoBrokenLines.val = true;
    this.options.draw_batter_area.val = true;
    this.options.Baseball.val = true;
    this.options.draw_grass_line._val = false;
    this.options.grassline._val = 0;
    this.options["batters box"].val = true;
    this.options.bb_length._val = (6).foot2meter();
    this.options.bb_width._val = 1.17 + (this.options.LineWidth.val/2);
    this.options.bb_dist._val = 0.736 - (2* this.options.LineWidth.val);
    this.options.bb_dist2._val = 0.736;
    this.options["Infield"].val = true;
    this.options.CatchersBox.val = false;
    this.options.CatchersBox.configuration = false;
    this.options["Coach Boxes"].val = true;
    this.options["Hashed Center Circle"].val = false;
    this.options.Radius.configurable = true;
    this.options.Radius._val = (16).foot2meter() / 2;
    this.options["On deck circle"].val = true;
    this.options.On_deck_radius._val = 0.5;
    this.options.On_deck_dist._val = 5.8;
    this.options ["Bases"].configurable = true; 
    this.options["Bases"].val = false;
    this.options["Home Plate"].val = true;
    this.options["Home Plate"].configurable = true;
    this.options["Home Plate"].name = "Dead zone";
    this.options["Runners lane"].val = false;
    this.options["Runners lane"].configurable = false;
    this.options.draw_middle_plate.val = true;
    this.options ["Fence line"].configurable = false;
    this.options.draw_grass_line.configurable = false;

    this.options.FoulLineLength.val = 26.29;
    this.options.cb_width._val = 0.9;
    this.options.cb_length._val = 3;
    this.options.cb_dist._val = 1.83 + (2 * this.options.LineWidth.val);


    this.options.bb_dist = {
      configurable: false,
      name: "batters box distance",
      type: "float",
      _val: (12.54).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };

  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];


      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );




      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
      //home plate

      var guide1 = c1.add( s1_g1.multiply( 5 ) );
      var guide2 = c1.add( s4_g2.multiply( 5 ) );
      var guide = new Line( guide1, guide2 ).middle;
      var g = new Line( c1, guide ).unit_vector;
      var g2 = g.rotate_90_cw();
      var width = (17).inch2meter() - this.options.LineWidth.val;
      var hyp = Math.sqrt( Math.pow( width / 2, 2 ) * 2 );
      var p1 = c1.add( s1_g1.multiply( hyp ) );
      var p2 = p1.add( g.multiply( width / 2 ) );
      var p3 = p2.add( g2.multiply( width ) );
      var p4 = c1.add( s4_g2.multiply( hyp ) );
      //fence line
      var fl1 = c1.add( s1_g1.multiply( this.options ["Fence line size"].val ) );
      var fl2 = c1.add( s4_g2.multiply( this.options ["Fence line size"].val ) );
      var gfl = new Line( c1, c3 ).unit_vector;
      var fl3 = c1.add( gfl.multiply( this.options ["Fence line size"].val ) );
    }

    // home plate
    var bb_corners = this.batters_box( 1 );
    if( !this.options.Baseball.val )
    {
      var l1 = new Line( bb_corners[1], bb_corners[0] );
      var l2 = new Line( bb_corners[2], bb_corners[3] );    
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l2 );
    }
    else
    {
      var l1 = new Line( bb_corners[1], bb_corners[2] );
      var c1_left = s1.cross_with_line( l1 );
      var c1_right = s4.reverse().cross_with_line( l1 );
    }
    var ic2 = c1.add( s1_g1.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic3 = ic2.add( s3_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );
    var ic4 = c1.add( s4_g2.multiply( this.options.field_length._val - this.options.LineWidth.val ) );

    var g_arc = new Line( c2, c4 ).middle;
    var guide = new Line( c1, g_arc ).unit_vector;
    var mid_point = c1.add( guide.multiply( new Line( c1, c4 ).length ) );

    var i_center = new Line( c1, ic3 ).middle;

    if( !this.options["Infield"].val )
    {
      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 1, ic2 );

      if( this.options["Bases"].val )
        this.draw_base( 0, ic2 );
      if( this.options["Bases"].val )
        this.draw_base( 1, ic3 );

      var pitch_front = this.make_center( i_center );

      if( this.options["Coach Boxes"].val )
        this.coach_boxes( 2, ic4 );

      if( this.options["Bases"].val )
        this.draw_base( 2, ic4 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, c2 ], false, true ) );
      else
        this.fixed_poles( c1_left, c2 );

      if( !this.options.FixedPoles.val )
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );
      else
        this.fixed_poles( c1_right, c4, true );

      // grass line
      if( this.options.draw_grass_line.val )
      {
        if( this.options.Baseball.val )
        {
          var grass_points = this.generate_grassline( pitch_front );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], pitch_front, false, false, true ) );
        }
        else
        {
          var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

      }
    }
    else
    {
      // inner field & Coach boxes
      if( !this.options.NoBrokenLines.val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c1_left, ic2 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );
        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );
        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );
        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        var pitch_front = this.make_center( i_center );
        // grass line
        if( this.options.draw_grass_line.val )
        {

          if( this.options.Baseball.val )
          {
            var grass_points = this.generate_grassline( pitch_front );
            this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], pitch_front, false, false, true ) );
          }

          else
            grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }

        // rest of main field
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, c2 ], false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        //add ramp on last task somehow to make lines align better
         this.tasks.push( new LineTask( this.tasks.length, [ c4, c1_right ], false, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
        
        

        this.tasks.push( new LineTask( this.tasks.length, [ c1,c2], false, true ) );
        //fence line
        if( this.options ["Fence line"].val )
          this.tasks.push( new ArcTask( this.tasks.length, [ fl1, fl3, fl2 ], c1, true, true, true ) );

        var pitch_front = this.make_center( i_center );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 1, ic2 );

        if( this.options["Bases"].val )
          this.draw_base( 0, ic2 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic2, ic3 ], false, true ) );
        if( this.options["Bases"].val )
          this.draw_base( 1, ic3 );
        this.tasks.push( new LineTask( this.tasks.length, [ ic3, ic4 ], false, true ) );

        if( this.options["Coach Boxes"].val )
          this.coach_boxes( 2, ic4 );

        if( this.options["Bases"].val )
          this.draw_base( 2, ic4 );
        // grass line
        if( this.options.draw_grass_line.val )
        {
          if( this.options.Baseball.val )
            var grass_points = this.generate_grassline( pitch_front );
          else
            var grass_points = this.generate_grassline( i_center );
          this.tasks.push( new ArcTask( this.tasks.length, [ grass_points[0], grass_points[1], grass_points[2] ], i_center, false, false, true ) );
        }
      }
    }
    // batter's box
    this.batters_box( 2 );

    this.start_locations.push( new StartLocation( this.tasks[0].ends[0], this.tasks[0].id ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

  batters_box( check )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
      var c1c4 = s4.unit_vector;
      var deadline1 = c1.add( s1_g1.multiply( 6.10 ).rotate_90_ccw() );
      var deadline2 = c2.add( s1_g1.multiply( 6.10 ).rotate_90_ccw() );
      var deadline3 = c1.add( c1c4.multiply( 6.10 ).rotate_90_ccw() );
      var deadline4 = c4.add( c1c4.multiply( 6.10 ).rotate_90_ccw() );
      var smd1 = deadline1.subtract( s1_g1.multiply( 6.1 ) );
      var smd2 = deadline3.add( c1c4.multiply( 6.1 ) );
      var smd12 = new Line( smd1, smd2 ).middle;
      var smd3 = deadline4.subtract( c1c4.multiply( 8 ) );
      var smd4 = deadline2.add( s1_g1.multiply( 8 ) );
      var guideSmd = new Line( c1, smd1 ).unit_vector;
      var guideSmd1 = c1.add( guideSmd.multiply( 6.1 ) );
    }



    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var g = new Line( c1, guide ).unit_vector;
    var g2 = g.rotate_90_cw();

    // home plate
    var width = (17).inch2meter() - this.options.LineWidth.val;
    var hyp = Math.sqrt( Math.pow( width / 2, 2 ) * 2 );
    var p1 = c1.add( s1_g1.multiply( hyp ) );
    var p2 = p1.add( g.multiply( width / 2 ) );
    var p3 = p2.add( g2.multiply( width ) );
    var p4 = c1.add( s4_g2.multiply( hyp ) );

    if( check === 1 && this.options.draw_batter_area.val )
    {

      if( this.options["Home Plate"].val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ smd4, deadline1 ], false, true ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ deadline1, guideSmd1, deadline3 ], c1, false, true, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ deadline3,smd3], false, true ) );
        

        


      }
    }

    var len = this.options.bb_length._val - this.options.LineWidth.val;
    var wid = this.options.bb_width._val - this.options.LineWidth.val;
    var batbox1 = (4).foot2meter();
    var batbox2 = (3).foot2meter();
    var plate_hyp = Math.sqrt( Math.pow( this.options.LineWidth.val / 2, 2 ) * 2 );
    var dist = plate_hyp + this.options.bb_dist._val - this.options.LineWidth.val / 2;
    var batbox_width = (3).foot2meter();

    var back_mid = c1.subtract( g.multiply( dist ) );
    var bc1 = back_mid.subtract( g2.multiply( wid / 2 ) );
    var bc2 = bc1.add( g.multiply( len ) );
    var bc3 = bc2.add( g2.multiply( wid ) );
    var bc4 = bc1.add( g2.multiply( wid ) );



    var side;
    var start;
    var boxes = [ ];
    for( var i = 0; i < 2; i++ )
    {
      if( i === 0 )
      {
        start = bc2;
        side = 1;


      }
      else
      {

        start = bc3;
        side = -1;
      }
      var buf = [ ];
      buf.push( start.add( g2.multiply( batbox_width * side ) ) );
      buf.push( buf[0].subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[1].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      buf.push( start.subtract( g.multiply( batbox1 ) ) );
      buf.push( buf[3].subtract( g.multiply( batbox2 - this.options.LineWidth.val ) ) );
      boxes.push( buf );

    }

    var box1 = boxes[0];
    var box2 = boxes[1];

    // BASEBALL
    // box dimensions for Baseball
    var height = this.options.bb_length._val - this.options.LineWidth.val;
    var width = this.options.bb_width._val - this.options.LineWidth.val;
    var hori_dist = this.options.bb_dist2._val - this.options.LineWidth.val;
    var vert_dist = this.options.bb_dist._val - this.options.LineWidth.val / 2;
    var start = 0;
    var box = [ ];

    for( var i = 0; i < 2; i++ )
    {
      if( start === 0 )
        var p1 = c1.subtract( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + width + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + height / 2.725 ) );
      else
        var p1 = c1.add( g2.multiply( (17).inch2meter() / 2 + (6).inch2meter() + this.options.LineWidth.val / 2 ) ).add( g.multiply( (8.5).inch2meter() + height / 2.725 ) );
      
  
      var p2 = p1.add( g2.multiply( width ) );
      var p3 = p2.subtract( g.multiply( height ) );
      var p4 = p1.subtract( g.multiply( height ) );
      box.push( [ p1, p2, p3, p4 ] );

      start = 1;

    }



    // bottom of batters' box.
    var bottom_mid = c1.subtract( g.multiply( vert_dist ) );
    var bot_c1 = bottom_mid.subtract( g2.multiply( hori_dist / 2 ) );
    var bot_c4 = bottom_mid.add( g2.multiply( hori_dist / 2 ) );
    var t_c2 = c1.subtract( g2.multiply( hori_dist / 2 ) );
    var t_c3 = c1.add( g2.multiply( hori_dist / 2 ) );

    var left = new Line( bot_c1, t_c2 );
    var right = new Line( bot_c4, t_c3 );
    var hori_line = new Line( box[0][2], box[0][3] );

    var top_c2 = left.cross_with_line( hori_line );
    var top_c3 = right.cross_with_line( hori_line );

    if( check === 1 )
    {

      if( !this.options.Baseball.val )
      {

        return [ bc1, bc2, bc3, bc4 ];

      }

      else
        return [ box[0][3], box[0][0], box[1][1], box[1][2] ];

    }


    if( check === 2 && this.options.draw_batter_area.val )
    {
      if( !this.options.Baseball.val )
      {
        // vertical lines
        this.tasks.push( new LineTask( this.tasks.length, [ bc1, bc2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ bc3, bc4 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box2[2], box2[0] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box1[0], box1[2] ], false, true ) );

        // INSERT BEZIER TASK HERE


        //horizontal lines
        this.tasks.push( new LineTask( this.tasks.length, [ bc1, bc4 ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box2[4], box2[2] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[2], box1[4] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ bc3, box2[0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box1[0], bc2 ], false, true ) );
       
      }
      else
      { 
        
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][3], box[0][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][1], box[0][2] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][3], box[1][0] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][1], box[1][2] ], false, true ) );

        if( this.options.CatchersBox.val )
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, bot_c1 ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[0][0], box[0][1] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[1][0], box[1][1] ], false, true ) );

        this.tasks.push( new LineTask( this.tasks.length, [ box[1][2], box[1][3] ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ box[0][2], box[0][3] ], false, true ) );

        if( this.options.CatchersBox.val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ top_c2, bot_c1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ bot_c4, top_c3 ], false, true ) );
        }
      }
    }
  }
}


class Softball_UK extends Softball_base
{
  static template_type = "Softball"; // Translateable
  static template_title = "Field uk"; // Translateable
  static template_id = "softball_uk_beta"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.NoBrokenLines.val = true;
    this.options.draw_batter_area.val = true;
    this.options.Baseball.val = false;
    this.options.draw_grass_line._val = false;
    this.options.grassline._val = 0;
    this.options["batters box"].val = true;

    this.options.bb_dist._val = (-8.5).inch2meter() + (-4 + 7 + 10).foot2meter();
    this.options["Infield"].val = false;

    
    this.options["Hashed Center Circle"].val = false;
    this.options.Radius._val = (16).foot2meter() / 2;
    this.options["On deck circle"].val = true;
    this.options.On_deck_radius._val = (2).foot2meter() + (6).inch2meter();
    this.options["Bases"].val = false;
    this.options["Home Plate"].val = false;
    this.options["Runners lane"].val = true;

    this.options["Coach Boxes"] = {
      configurable: true,
      name: "Coach Boxes",
      type: "bool",
      val: true
    };

    this.options.cb_width = {
      configurable: false,
      name: "Coach box width",
      type: "float",
      _val: (3).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options.cb_length = {
      configurable: false,
      name: "Coach box length",
      type: "float",
      _val: (15).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
    this.options.cb_dist = {
      configurable: true,
      name: "Coach box distance",
      type: "float",
      _val: (9).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      },
      prev_sibling: "Coach Boxes"
    };
  }
  
  coach_boxes( check, start )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c3 = p[2];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
      var s3_g2 = s3.unit_vector;
      var s3_g1 = s3_g2.rotate_90_ccw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }

    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var m1 = new Line( c1, guide ).unit_vector;
    var m2 = m1.rotate_90_cw();

    var len = this.options.cb_length._val - this.options.LineWidth.val;
    var width = this.options.cb_width._val - this.options.LineWidth.val;
    var dist = this.options.cb_dist._val + this.options.LineWidth.val* 0.5;
    var rad = this.options.On_deck_radius._val - this.options.LineWidth.val / 2;
    var circle_dist = this.options.On_deck_dist._val + rad - this.options.LineWidth.val;
    var side;

    if( check === 1 )
    {
      side = 1;
      var g1 = s1_g1;
      var g2 = s1_g2;
    }
    else
    {
      side = -1;
      var g1 = s4_g2;
      var g2 = s4_g1;
    }

    var p1 = start.subtract( g2.multiply( dist + width ) );
    var p2 = p1.add( g2.multiply( width ) );
    var p3 = p2.subtract( g1.multiply( len ) );
    var p4 = p3.subtract( g2.multiply( width ) );
    var center = c1.add( m2.multiply( -circle_dist * side ) );

    if( this.options["Coach Boxes"].val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
    }

    if( this.options["On deck circle"].val )
    {
      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad ) ), center.add( g1.multiply( -rad ) ) ], center, true, false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
      this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
    }

    if( check === 2 && this.options["Runners lane"].val )
    {
      var run_p1 = start.subtract( g2.multiply( this.options.run_dist.val ) );
      var run_p2 = run_p1.subtract( g1.multiply( (this.options.field_length.val - this.options.LineWidth.val) / 2 ) );

      this.tasks.push( new LineTask( this.tasks.length, [ run_p1, run_p2 ], false, true ) );
    }
  }
}

class Baseball extends Softball_base
{
  static template_type = "Baseball"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "baseball"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options.Baseball.val = true;

    this.options.field_length._val = (90).foot2meter();
    this.options.grassline._val = (95).foot2meter();

    this.options["batters box"].val = true;
    this.options.bb_length._val = (6).foot2meter();
    this.options.bb_width._val = (4).foot2meter();
    this.options.bb_dist._val = (8).foot2meter();
    this.options.bb_dist2._val = (43).inch2meter();

    this.options.picth_length._val = (24).inch2meter();
    this.options.picth_width._val = (6).inch2meter();

    this.options["Coach Boxes"].val = true;
    this.options.cb_width._val = (1).foot2meter();
    this.options.cb_length._val = (20).foot2meter();
    this.options.cb_dist._val = (15).foot2meter();

    this.options["Hashed Center Circle"].val = false;
    this.options.Radius._val = (18).foot2meter() / 2;

    this.options["On deck circle"].val = true;
    this.options.On_deck_radius._val = (5).foot2meter() / 2;
    this.options.On_deck_dist._val = (37).foot2meter();

    this.options["Bases"].val = false;
    this.options.base_size._val = (15).inch2meter();

    this.options.FoulLineLength._val = (250).foot2meter();

    this.options.NoBrokenLines.val = true;

    this.options.draw_batter_area.val = true;
    this.options.draw_grass_line._val = false;

    this.options["Infield"].val = false;

    this.options["Home Plate"].val = false;

    this.options["Runners lane"].val = true;

    this.options.run_dist._val = (3).foot2meter();
    this.options.bb_length.configurable = true;
  }
}
class Baseball_US extends Softball_base
{
  static template_type = "Baseball"; // Translateable
  static template_title = "US"; // Translateable
  static template_id = "baseball_us"; // no spaces
  static template_image = "img/templates/softball_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options.Baseball.val = true;

    this.options.field_length._val = (90).foot2meter();
    this.options.grassline._val = (95).foot2meter();

    this.options["batters box"].val = true;
    this.options.bb_length._val = (6).foot2meter();
    this.options.bb_width._val = (4).foot2meter();
    this.options.bb_dist._val = (8).foot2meter();
    this.options.bb_dist2._val = (43).inch2meter();

    this.options.picth_length._val = (18).inch2meter();
    this.options.picth_width._val = (6).inch2meter();

    this.options["Coach Boxes"].val = true;
    this.options.cb_width._val = (1).foot2meter();
    this.options.cb_length._val = (20).foot2meter();
    this.options.cb_dist._val = (15).foot2meter();

    this.options["Hashed Center Circle"].val = false;
    this.options["Hashed Center Circle"].configurable = false;
    this.options.Radius._val = (18).foot2meter() / 2;


    this.options["On deck circle"].val = false;
    this.options.On_deck_radius._val = (5).foot2meter() / 2;
    this.options.On_deck_dist._val = (37).foot2meter();

    this.options["Bases"].val = false;
    this.options.base_size._val = (150).inch2meter();

    this.options.FoulLineLength._val = (250).foot2meter();

    this.options.NoBrokenLines.val = true;

    this.options.draw_batter_area.val = true;
    this.options.draw_grass_line._val = false;

    this.options["Infield"].val = false;

    this.options["Home Plate"].val = false;

    this.options["Runners lane"].val = true;

    this.options.run_dist._val = (3).foot2meter();
    this.options.bb_length.configurable = true;

    this.options["Coach Boxes As Open Boxs"] = {
      configurable: true,
      name: "Coach boxes as open boxes",
      type: "bool",
      val: true,
    };

    this.options["Coach Boxes without thickness"] = {
      configurable: true,
      name: "Double-lined coach boxes",
      type: "bool",
      val: false,
      prev_sibling: "Coach Boxes"
    }
  }

  coach_boxes( check, start )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[1];
      var c4 = p[3];
      var s1 = new Line( c1, c2 );
      var s4 = new Line( c4, c1 );
      
      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s4_g2 = s4.reverse().unit_vector;
      var s4_g1 = s4_g2.rotate_90_ccw();
    }

    var guide1 = c1.add( s1_g1.multiply( 5 ) );
    var guide2 = c1.add( s4_g2.multiply( 5 ) );
    var guide = new Line( guide1, guide2 ).middle;
    var m1 = new Line( c1, guide ).unit_vector;
    var m2 = m1.rotate_90_cw();

    var len = this.options.cb_length._val - this.options.LineWidth.val;
    var width = this.options.cb_width._val - this.options.LineWidth.val;
    var dist = this.options.cb_dist._val - this.options.LineWidth.val;

    var rad = this.options.On_deck_radius._val - this.options.LineWidth.val / 2;
    var circle_dist = this.options.On_deck_dist._val + rad - this.options.LineWidth.val;
    var side;

    if( check === 1 )
    {
      side = 1;
      var g1 = s1_g1;
      var g2 = s1_g2;
    }
    else
    {
      side = -1;
      var g1 = s4_g2;
      var g2 = s4_g1;
    }

    let boxWidth = (5).foot2meter();

    let center = c1.add( m2.multiply( - circle_dist * side ) );
    let p1 = start.subtract( g2.multiply( dist + width ) );
    let p2 = p1.add( g2.multiply( width ) );
    let p3 = p2.subtract( g1.multiply( len ) );
    let p4 = p3.subtract( g2.multiply( width ) );
    let p5 = p4.add( g1.multiply( width ) );
    let new_p4 = p3.subtract(g2.multiply( boxWidth ));
    let p6 = new_p4.add( g1.multiply( width ));
    let new_p1 = p1.subtract( g1.multiply( width ) );
    let p7 = new_p1.subtract(g2.multiply(( boxWidth ) - width));
    let p8 = p7.add(g1.multiply(width));



    if( this.options["Coach Boxes"].val )
    {

      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );

     if(this.options["Coach Boxes As Open Boxs"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ p3, new_p4 ], false, true )); 
        if(this.options["Coach Boxes without thickness"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ new_p4, p6 ], false, true )); 
        this.tasks.push( new LineTask( this.tasks.length, [ p6, p5 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ p5, new_p1 ], false, true ));
        this.tasks.push( new LineTask( this.tasks.length, [ new_p1, p7 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p7, p8 ], false, true ) );
        }
        this.tasks.push( new LineTask( this.tasks.length, [ p8, p2 ], false, true ) );

      }
      else {
        this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) ); 
        this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) ); 
      }
    }
    if( this.options["On deck circle"].val )
    {
      if(this.options["Based on foul line"].val){
        if(check === 1){
          center = c1.add(g2.multiply(this.options["Parallel distance"].val)).subtract(g1.multiply(this.options["Perpendicular distance"].val));
        }
        else{
          center = c1.add(g2.multiply(this.options["Parallel distance"].val)).subtract(g1.multiply(this.options["Perpendicular distance"].val));
        }
      }
      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad ) ), center.add( g1.multiply( -rad ) ) ], center, true, false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
      this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
    }
  }
}