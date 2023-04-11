/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Cricket_Old extends square_pitch
{
  static template_type = "Cricket"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "cricket_old_dev"; // no spaces
  static template_image = "img/templates/cricket_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.Length.val = (22).yard2meter(); //max length
    //this.options.Length.configurable = true;
    //this.options.Length.prev_sibling = "1";
    this.options.Width.val = (8).foot2meter() + (8).inch2meter();// (12).foot2meter(); //max width 
    //this.options.Width.configurable = true;
    //this.options.Width.prev_sibling = "1";
    this.options.addLineLengthInSides.val = false;
    this.options.NegativeLineWidth.val = true;

    this.options.outsideMoveIn.val = new Vector( 0, -(8).inch2meter() );
    this.options.SizeHandlesMoveCenter.val = false;

    this.options.PitchLength = {
      configurable: false,
      "dontsave": false,
      name: "Length",
      type: "float",
      _val: (22).yard2meter(),
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
      },
      prev_sibling: "1"
    };
    this.options.PitchWidth = {
      configurable: false,
      "dontsave": false,
      name: "Width",
      type: "float",
      _val: (8).foot2meter() + (8).inch2meter(),
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
      },
      prev_sibling: "1"
    };
    this.options.WideGuide = {
      configurable: false,
      "dontsave": false,
      name: "Wide guidelines",
      type: "float",
      _val: (17).inch2meter(),
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
    this.options.BowlingCrease = {
      configurable: false,
      "dontsave": false,
      name: "Bowling Crease",
      type: "float",
      _val: (4).foot2meter(),
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

    //configurable
    this.options.Wide = {
      configurable: true,
      "dontsave": false,
      name: "Draw wide guidelines",
      type: "bool",
      val: true,
      prev_sibling: "2"
    };
    this.options.ReturnCreaseLen = {
      configurable: true,
      "dontsave": false,
      name: "Return crease",
      type: "float",
      _val: (8).foot2meter(),
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
      },
      prev_sibling: "2"
    };
    this.options.PoppingCrease = {
      configurable: true,
      "dontsave": false,
      name: "Popping Crease",
      type: "float",
      _val: (15).yard2meter(),
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
      },
      prev_sibling: "2"
    };
    this.options.radius = {
      configurable: true,
      "dontsave": false,
      name: "Outer field dist",
      type: "float",
      _val: 22.9,
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
      },
      prev_sibling: "3"
    };
    this.options.DottedOuter = {
      configurable: true,
      name: "Dotted outer field",
      type: "bool",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val )
          this_class.options.DashedOuter.val = false;
        this._val = new_val;
      },
      prev_sibling: "3"
    };
    this.options.DashedOuter = {
      configurable: true,
      name: "Dashed outer field",
      type: "bool",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val )
          this_class.options.DottedOuter.val = false;
        this._val = new_val;
      },
      prev_sibling: "3"
    };
    this.options.DahsedLength = {
      get configurable()
      {
        return this_class.options.DashedOuter.val;
      },
      name: "Dashed outer field",
      type: "float",
      _val: 0.2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 0.1 )
          v = 0.1;
        if( v > 4.5 )
          v = 4.5;
        this._val = v;
      },
      prev_sibling: "DashedOuter"
    };



    this.options.OuterField = {
      configurable: true,
      "dontsave": false,
      name: "Paint outer field",
      type: "bool",
      val: true,
      prev_sibling: "3"
    };
    this.options.InField = {
      configurable: true,
      "dontsave": false,
      name: "Paint infield",
      type: "bool",
      val: true,
      prev_sibling: "OuterField"
    };

    // used for sorting
    this.options["1"] = {
      configurable: false,
      "dontsave": false,
      name: "1",
      type: "bool",
      val: false
    };
    this.options["2"] = {
      configurable: false,
      "dontsave": false,
      name: "2",
      type: "bool",
      val: false
    };
    this.options["3"] = {
      configurable: false,
      "dontsave": false,
      name: "3",
      type: "bool",
      val: false
    };

    // used for testing
    this.options.InnerField = {
      configurable: false,
      "dontsave": false,
      name: "Paint inner field",
      type: "bool",
      val: false,
      prev_sibling: "3"
    };
  }

  static get layout_methods()
  {
    return {
      //"corner,side": 2,
      //"two_corners": 2,
      "two_corners_outside": 2,
      //"two_corners,side": 3,
      //"all_corners": 4,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0.4, 0.62 ),
        new Vector( 0.4, 0.43 )
      ]
    }

    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0.4, 0.29 ),
        new Vector( 0.4, 0.62 )
      ]
    }

    if( layout_method === "two_corners_outside" )
    {
      return [
        new Vector( 0.4, 0.29 ),
        new Vector( 0.4, 0.62 )
      ]
    }

    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0.4, 0.29 ),
        new Vector( 0.4, 0.62 ),
        new Vector( 0.58, 0.43 )
      ]
    }

    if( layout_method === "all_corners" )
    {
      return [
        new Vector( 0.4, 0.29 ),
        new Vector( 0.58, 0.29 ),
        new Vector( 0.58, 0.62 ),
        new Vector( 0.4, 0.62 )
      ]
    }
  }

  draw_end( start, end )
  {
    var g = new Line( start, end ).unit_vector;
    var g2 = g.rotate_90_cw();
    var mid = new Line( start, end ).middle;

    // values
    var lw = Math.abs( this.options.LineWidth.val );
    var retCrease_len = this.options.ReturnCreaseLen.val;
    var wide = this.options.WideGuide.val;
    this.start_locations.push( new StartLocation( start, this.tasks.length ) );

    // Popping crease
    var popStart = mid.add( g.rotate_180().multiply( this.options.PoppingCrease.val - lw / 2 ) ).add( g2.multiply( retCrease_len - lw / 2 ) );
    var popEnd = mid.add( g.multiply( this.options.PoppingCrease.val - lw / 2 ) ).add( g2.multiply( retCrease_len - lw / 2 ) );
    var popCrease = new Line( popStart, popEnd );

    // return creases
    var r1 = new Line( start, start.add( g2.multiply( retCrease_len ) ) ).cross_with_line( popCrease );
    var r2 = new Line( end.add( g2.multiply( retCrease_len ) ), end ).cross_with_line( popCrease );
    var rc1 = new Line( start, r1 ).add_to_start( -lw / 2 ).add_to_end( -lw / 2 );
    var rc2 = new Line( r2, end ).add_to_start( -lw / 2 ).add_to_end( -lw / 2 );

    // bowling crease
    var bc1 = rc1.end.subtract( g2.multiply( this.options.BowlingCrease.val - lw / 2 ) );
    var bc2 = rc2.start.subtract( g2.multiply( this.options.BowlingCrease.val - lw / 2 ) );
    var new_bc1 = new Line( bc1, bc2 ).cross_with_line( rc1 );
    var new_bc2 = new Line( bc1, bc2 ).cross_with_line( rc2 );
    var bowCrease = new Line( new_bc1, new_bc2 ).add_to_start( -lw / 2 ).add_to_end( -lw / 2 );

    // wide guidelines
    var wg1 = new Line( rc1.middle.add( g.multiply( wide - lw / 2 ) ), rc1.end.add( g.multiply( wide - lw / 2 ) ) );
    var wg2 = new Line( rc2.middle.subtract( g.multiply( wide - lw / 2 ) ), rc2.start.subtract( g.multiply( wide - lw / 2 ) ) );
    var new_wg1 = new Line( wg1.cross_with_line( bowCrease ), wg1.cross_with_line( popCrease ) );//.add_to_start( -lw / 2 ).add_to_end( -lw / 2 );
    var new_wg2 = new Line( wg2.cross_with_line( bowCrease ), wg2.cross_with_line( popCrease ) );//.add_to_start( -lw / 2 ).add_to_end( -lw / 2 );

    // Draw T
    var T1_middle = new_bc2.add( g.multiply( (8).inch2meter() ) );
    var T1_top = T1_middle.add( g2.multiply( (4).inch2meter() - lw ) );
    var T1_start = T1_middle.add( g.multiply( (4).inch2meter() - lw ) );
    var T1_end = T1_middle.add( g.multiply( -((4).inch2meter() - lw) ) );

    var T2_middle = new_bc1.add( g.multiply( -((8).inch2meter()) ) );
    var T2_top = T2_middle.add( g2.multiply( (4).inch2meter() - lw ) );
    var T2_start = T2_middle.add( g.multiply( (4).inch2meter() - lw ) );
    var T2_end = T2_middle.add( g.multiply( -((4).inch2meter() - lw) ) );

    // draw L
    var L2_middle = r1.add( g.multiply( -((8).inch2meter() + lw / 2) ) ).add( g2.multiply( (5).foot2meter() ) );
    var l2_start = L2_middle.add( g2.multiply( -(4).inch2meter() ) );
    var l2_end = L2_middle.add( g.multiply( -(4).inch2meter() ) );

    var L1_middle = r2.add( g.multiply( ((8).inch2meter() + lw / 2) ) ).add( g2.multiply( (5).foot2meter() ) );
    var l1_start = L1_middle.add( g2.multiply( -(4).inch2meter() ) );
    var l1_end = L1_middle.add( g.multiply( (4).inch2meter() ) );


    // paint
    this.tasks.push( rc1.add_to_end( lw / 2 ).toLineTask( this.tasks.length, false, true ) );
    if( this.options.Wide.val )
    {
      this.tasks.push( new_wg1.reverse().toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( new_wg2.reverse().toLineTask( this.tasks.length, false, true ) );
    }
    this.tasks.push( rc2.add_to_start( lw / 2 ).reverse().toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ T1_top, T1_middle ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ T1_start, T1_end ], false, true ) );

    this.tasks.push( bowCrease.reverse().add_to_start( lw / 2 ).add_to_end( lw / 2 ).toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ T2_start, T2_end ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ T2_middle, T2_top ], false, true ) );

    this.tasks.push( new LineTask( this.tasks.length, [ l2_start, L2_middle ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ l2_end, L2_middle ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ L1_middle, l1_end ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ L1_middle, l1_start ], false, true ) );

    this.tasks.push( popCrease.reverse().toLineTask( this.tasks.length, false, true ) );
  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[3];
      var c3 = p[4];
      var c4 = p[7];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c4, c3 );
      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
    }

    var rest_of_return_crease = this.options.ReturnCreaseLen.val - this.options.BowlingCrease.val;

    var lw = Math.abs( this.options.LineWidth.val );

    var start_1 = c1.subtract( s1_g2.multiply( rest_of_return_crease - lw / 2 ) );
    var end_1 = c2.subtract( s1_g2.multiply( rest_of_return_crease - lw / 2 ) );
    var start_2 = c3.add( s2_g2.multiply( rest_of_return_crease - lw / 2 ) );
    var end_2 = c4.add( s2_g2.multiply( rest_of_return_crease - lw / 2 ) );

    if( this.options.InField.val )
    {
      this.draw_end( start_1, end_1 );
      this.draw_end( start_2, end_2 );
    }

    if( this.options.InnerField.val )
    {
      var is1 = new Line( c1, c2 );
      var is2 = new Line( c4, c3 );
      var is3 = new Line( c2, c3 );
      var is4 = new Line( c1, c4 );
      this.tasks.push( is1.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( is2.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( is3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( is4.toLineTask( this.tasks.length, false, true ) );
    }

    if( this.options.OuterField.val )
    {
      var os1 = new Line( start_1, end_1 );
      var os2 = new Line( end_2, start_2 );

      var guide = new Line( os1.middle, os2.middle ).unit_vector;
      var guide2 = guide.rotate_90_ccw();
      var s1_g = os1.middle.add( guide.rotate_180().multiply( this.options.radius.val ) );
      var s2_g = os2.middle.add( guide.multiply( this.options.radius.val ) );

      var oc1 = os1.middle.subtract( guide2.multiply( this.options.radius.val ) );
      var oc2 = os1.middle.add( guide2.multiply( this.options.radius.val ) );
      var oc3 = os2.middle.add( guide2.multiply( this.options.radius.val ) );
      var oc4 = os2.middle.subtract( guide2.multiply( this.options.radius.val ) );

      this.start_locations.push( new StartLocation( oc4, this.tasks.length ) );

      if( (this.options.DottedOuter.val || this.options.DashedOuter.val) && this.options.DahsedLength.val < 4.5 )
      {
        var side_length = (new Line( oc4, oc1 )).length;
        var circle_side_length = this.options.radius.val * Math.PI;
        var circumference_length = 2 * circle_side_length + 2 * side_length;
        var dots = Math.round( circumference_length / 4.5 );

        var dash_length = this.options.DahsedLength.val;
        var dash_space = (circumference_length / dots) - dash_length;

        // Opret linjerne
        var new_outer = [ ];
        var outer_1 = new LineTask( this.tasks.length, [ oc4, oc1 ], false, true ); //4
        var new_outer1 = outer_1.toLine().split( dash_length, dash_space );
        var used_length = side_length;
        var dots_made = Math.floor( used_length / (dash_space + dash_length) );
        var remaining = used_length - (dots_made * (dash_space + dash_length));


        var outer_2 = new ArcTask( this.tasks.length, [ oc1, s1_g, oc2 ], os1.middle, true, false, true ); //3
        var new_outer2 = outer_2.splitLineSpace( dash_length, dash_space, -remaining );
        used_length = circle_side_length + remaining;
        dots_made = Math.floor( used_length / (dash_space + dash_length) );
        remaining = used_length - (dots_made * (dash_space + dash_length));


        var outer_3 = new LineTask( this.tasks.length, [ oc2, oc3 ], false, true ); //2
        var new_outer3 = outer_3.toLine().split( dash_length, dash_space, remaining );
        used_length = side_length + remaining;
        dots_made = Math.floor( used_length / (dash_space + dash_length) );
        remaining = used_length - (dots_made * (dash_space + dash_length));

        var outer_4 = new ArcTask( this.tasks.length, [ oc3, s2_g, oc4 ], os2.middle, true, false, true ); //1
        var new_outer4 = outer_4.splitLineSpace( dash_length, dash_space, -remaining );




        var buf = [ ];
        for( var i = 0; i < new_outer1.length; i++ )
        {
          buf.push( new_outer1[i].toLineTask( this.tasks.length, false, true ) );
        }
        new_outer1 = buf;
        buf = [ ];
        for( var j = 0; j < new_outer3.length; j++ )
        {
          buf.push( new_outer3[j].toLineTask( this.tasks.length, false, true ) );
        }
        new_outer3 = buf;
        new_outer = new_outer.concat( new_outer1, new_outer2, new_outer3, new_outer4 );

        for( var k = 0; k < new_outer.length; k++ )
        {
          if( this.options.DashedOuter.val )
          {
            if( new_outer[k].start.dist_to_point( new_outer[k].end ) > 0.01 )
              this.tasks.push( new_outer[k] ); //4
          }
          else
            this.tasks.push( new WaypointTask( this.tasks.length, new_outer[k].start, false, true ) ); //4
        }
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ oc4, oc1 ], false, true ) ); //4
        this.tasks.push( new ArcTask( this.tasks.length, [ oc1, s1_g, oc2 ], os1.middle, true, false, true ) ); //3
        this.tasks.push( new LineTask( this.tasks.length, [ oc2, oc3 ], false, true ) ); //2
        this.tasks.push( new ArcTask( this.tasks.length, [ oc3, s2_g, oc4 ], os2.middle, true, false, true ) ); //1
      }
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}