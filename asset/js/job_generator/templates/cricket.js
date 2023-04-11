/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Cricket extends square_pitch
{
  static template_type = "Cricket"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "cricket"; // no spaces
  static template_image = "img/templates/cricket_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.Length.val = (22).yard2meter();
    this.options.disableWidthHandles.val = true;
    this.options["fast_test"].val = false;

    var l = 0;
    var this_class = this;
    this.options ["Return Crease"] = {
      get configurable()
      {
        return this_class.options["Paint Pitch"].val;
      },
      name: "Return Crease",
      val: (4).foot2meter(),
      type: "float"
    };
    this.options ["Popping Crease"] = {
      get configurable()
      {
        return this_class.options["Paint Pitch"].val;
      },
      name: "Popping Crease",
      val: (6).foot2meter(),
      type: "float"
    };
    this.options ["Protected Area Indicators"] = {
      get configurable()
      {
        return this_class.options["Paint Pitch"].val;
      },
      name: "Protected area indicators",
      val: true,
      type: "bool"
    };
    this.options ["Protected Area Indicators Size"] = {
      get configurable()
      {
        return this_class.options["Protected Area Indicators"].val;
      },
      name: "Protected area indicators size",
      val: 1.83,
      type: "float"
    };

    this.options ["Close-infield"] = {
      get configurable()
      {
        return this_class.options["Paint Pitch"].val;
      },
      name: "Close-infield",
      val: false,
      type: "bool"
    };

    this.options ["Paint Pitch"] = {
      configurable: true,
      name: "Paint pitch",
      val: true,
      type: "bool"
    };

 
    this.options ["Close-infield size"] = {
      get configurable()
      {
        return this_class.options["Close-infield"].val;
      },
      name: "Close-infield size",
      val: (15).yard2meter(),
      type: "float"
    };
    this.options ["Boundary line"] = {
      configurable: true,
      name: "Boundary line",
      val: true,
      type: "bool"
    };


    this.options ["Boundary size"] = {
      get configurable()
      {
        return this_class.options["Boundary line"].val;
      },
      name: "Boundary size",
      val: (90).yard2meter(),
      type: "float"
    };



    this.options ["Mens size"] = {
      configurable: true,
      name: "Inner circle men",
      val: true,
      type: "bool"
    };
    this.options ["Womens size"] = {
      configurable: true,
      name: "Inner circle women",
      val: false,
      type: "bool"
    };

    this.options ["Wide Guidelines"] = {
      get configurable()
      {
        return this_class.options["Paint Pitch"].val;
      },
      name: "Wide Guidelines",
      val: true,
      type: "bool"
    };
    this.options ["Women"] = {
      configurable: false,
      name: "Inner circle distance",
      val: (23).yard2meter(),
      type: "float"
    };

    this.options ["Men"] = {
      configurable: false,
      name: "Inner circle distance",
      val: (27.43),
      type: "float"
    };
    this.options.DottedOuter = {
      configurable: true,
      name: "Inner circle dotted line",
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

      name: "Inner circle dashed line",
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
      name: "Inner circle dashed line length",
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

    this.options ["Paint Wicket T and dot"] = {
      configurable: true,
      name: "Paint Wicket T's and stump dot",
      val: false,
      type: "bool"
    };

  
  }
    get info_options()
  {
    return [ ];
  }

  refresh_handles()
  {
    
    super.refresh_handles();
    if(this.options ["Boundary line"].val){
    var this_class = this;
    var p = this.drawing_points;
    var p1 = p[2];
    var p2 = p[5];
    var p1p2 = new Line( p1, p2 );
    var g1 = p1p2.unit_vector;

    var bou1 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou2 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );
    var bou4 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou5 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );

    var mid1 = new Line( bou1, bou4 ).middle;
    var center = this.center;
    var g2 = g1.rotate_90_cw();


    this.handles.push( new Handle( mid1, -this.options.Angle.val, "Boundary size", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {
      var g = new Line( center, mid1 );
      var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
      return this_class.set_new_val( this_class.options["Boundary size"], new_length, false );
      
     
    }, function( new_length )
    {
    
        return this_class.set_new_val( this_class.options["Boundary size"], new_length, false );
    } ) );
    }
  }

  static get layout_methods()
  {
    return {
      "two_end_goal_posts_resize": 2,
      //"corner,side": 2,

      //"two_corners_outside": 2,
      //"two_corners,side": 3,
      //"all_corners": 4,
      "free_hand": 0
    };
  }

  get drawing_points()
  {
    let p = super.drawing_points;
    if( this.layout_method === "two_end_goal_posts_resize" )
    {
      let cp1 = this.points[0];
      let cp2 = this.points[1];
      let d = (new Line( cp1, cp2 )).length;
      this.options.Length.val = d;
    }

    return p;
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "two_end_goal_posts_resize" )
    {
      return [
        new Vector( 0.5, 0.3 ),
        new Vector( 0.5, 0.62 )
      ];
    }
  }

  

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    //goal posts
    var p1 = p[2];
    var p2 = p[5];

    this.start_locations.push( new StartLocation( p1, this.tasks.length ) );
    


    var p1p2 = new Line( p1, p2 );

    var g1 = p1p2.unit_vector;



    var n8 = (4).foot2meter() + (4).inch2meter();
    var n4 = (4).foot2meter();
    //bowling crease lines
    var l1 = p1.add( g1.multiply( n8 ).rotate_90_cw() );
    var l2 = p1.add( g1.multiply( n8 ).rotate_90_ccw() );
    var l3 = p2.add( g1.multiply( n8 ).rotate_90_cw() );
    var l4 = p2.add( g1.multiply( n8 ).rotate_90_ccw() );

    //this.tasks.push(new WaypointTask(this.tasks.length, p1[0]));

    
    //proctected area indicators bowling crease
    var pro1 = p1.add( g1.multiply( (1).foot2meter() ).rotate_90_cw() );
    var pro2 = pro1.subtract( g1.multiply( (0.5).foot2meter() ) );
    var pro3 = p1.add( g1.multiply( (1).foot2meter() ).rotate_90_ccw() );
    var pro4 = pro3.subtract( g1.multiply( (0.5).foot2meter() ) );
    var pro5 = p2.add( g1.multiply( (1).foot2meter() ).rotate_90_cw() );
    var pro6 = pro5.add( g1.multiply( (0.5).foot2meter() ) );
    var pro7 = p2.add( g1.multiply( (1).foot2meter() ).rotate_90_ccw() );
    var pro8 = pro7.add( g1.multiply( (0.5).foot2meter() ) );

    // bowling popping
    var l5 = p1.add( g1.multiply( n4 ) );
    var l6 = l5.add( g1.multiply( this.options ["Popping Crease"].val ).rotate_90_cw() );
    var l7 = l5.add( g1.multiply( this.options ["Popping Crease"].val ).rotate_90_ccw() );
    var l8 = p2.subtract( g1.multiply( n4 ) );
    var l9 = l8.add( g1.multiply( this.options ["Popping Crease"].val ).rotate_90_cw() );
    var l10 = l8.add( g1.multiply( this.options ["Popping Crease"].val ).rotate_90_ccw() );


    // proctected area indicators popping 
    var pro9 = l5.add( g1.multiply( (5).foot2meter() ) );
    var pro21 = pro9.add( g1.multiply( this.options ["Protected Area Indicators Size"].val ).rotate_90_cw() );
    var pro10 = pro21.subtract( g1.multiply( (0.5).foot2meter() ) );
    var pro11 = pro21.add( g1.multiply( (0.5).foot2meter() ).rotate_90_cw() );

    var pro12 = pro9.add( g1.multiply( this.options ["Protected Area Indicators Size"].val ).rotate_90_ccw() );
    var pro13 = pro12.subtract( g1.multiply( (0.5).foot2meter() ) );
    var pro14 = pro12.add( g1.multiply( (0.5).foot2meter() ).rotate_90_ccw() );

    var pro15 = l8.subtract( g1.multiply( (5).foot2meter() ) );
    var pro22 = pro15.add( g1.multiply( this.options ["Protected Area Indicators Size"].val ).rotate_90_ccw() );
    var pro16 = pro22.add( g1.multiply( (0.5).foot2meter() ) );
    var pro17 = pro22.add( g1.multiply( (0.5).foot2meter() ).rotate_90_ccw() );

    var pro18 = pro15.add( g1.multiply( this.options ["Protected Area Indicators Size"].val ).rotate_90_cw() );
    var pro19 = pro18.add( g1.multiply( (0.5).foot2meter() ) );
    var pro20 = pro18.add( g1.multiply( (0.5).foot2meter() ).rotate_90_cw() );

    // side lines crease

    var side1 = l1.add( g1.multiply( n4 ) );
    var side2 = l1.subtract( g1.multiply( this.options ["Return Crease"].val ) );
    var side3 = l2.add( g1.multiply( n4 ) );
    var side4 = l2.subtract( g1.multiply( this.options ["Return Crease"].val ) );
    var side5 = l3.subtract( g1.multiply( n4 ) );
    var side6 = l3.add( g1.multiply( this.options ["Return Crease"].val ) );
    var side7 = l4.subtract( g1.multiply( n4 ) );
    var side8 = l4.add( g1.multiply( this.options ["Return Crease"].val ) );
    // Wide guidelines

    var wide1 = l1.add( g1.multiply( (17).inch2meter() ).rotate_90_ccw() );
    var wide2 = wide1.add( g1.multiply( n4 ) );
    var wide3 = l2.add( g1.multiply( (17).inch2meter() ).rotate_90_cw() );
    var wide4 = wide3.add( g1.multiply( n4 ) );
    var wide5 = l3.add( g1.multiply( (17).inch2meter() ).rotate_90_ccw() );
    var wide6 = wide5.subtract( g1.multiply( n4 ) );
    var wide7 = l4.add( g1.multiply( (17).inch2meter() ).rotate_90_cw() );
    var wide8 = wide7.subtract( g1.multiply( n4 ) );
    // mid of innercirkle
    if(this.options["Womens size"].val && this.l === 0){
      this.l = 1;
      this.options["Mens size"].val = false;
    }else if(this.options["Mens size"].val){
      this.l = 0; 
      this.options["Womens size"].val = false;
    }
    if( this.options["Mens size"].val === true )
    {
      var l13 = p1.add( g1.multiply( this.options ["Men"].val ).rotate_90_cw() );
      var l14 = p1.add( g1.multiply( this.options ["Men"].val ).rotate_90_ccw() );
      var l15 = p1.subtract( g1.multiply( this.options ["Men"].val ) );
      var l16 = p2.add( g1.multiply( this.options ["Men"].val ).rotate_90_cw() );
      var l17 = p2.add( g1.multiply( this.options ["Men"].val ).rotate_90_ccw() );
      var l18 = p2.add( g1.multiply( this.options ["Men"].val ) );
      var radius = this.options ["Men"].val;
      
    }

    if( this.options["Womens size"].val === true )
    {
      var l13 = p1.add( g1.multiply( this.options ["Women"].val ).rotate_90_cw() );
      var l14 = p1.add( g1.multiply( this.options ["Women"].val ).rotate_90_ccw() );
      var l15 = p1.subtract( g1.multiply( this.options ["Women"].val ) );
      var l16 = p2.add( g1.multiply( this.options ["Women"].val ).rotate_90_cw() );
      var l17 = p2.add( g1.multiply( this.options ["Women"].val ).rotate_90_ccw() );
      var l18 = p2.add( g1.multiply( this.options ["Women"].val ) );
      var radius = this.options ["Women"].val;
     
    }
    // close infield circle 

    var l19 = l5.add( g1.multiply( this.options ["Close-infield size"].val ).rotate_90_cw() );
    var l20 = l5.add( g1.multiply( this.options ["Close-infield size"].val ).rotate_90_ccw() );

    var l22 = l8.add( g1.multiply( this.options ["Close-infield size"].val ).rotate_90_cw() );
    var l23 = l8.add( g1.multiply( this.options ["Close-infield size"].val ).rotate_90_ccw() );


    if(this.options["Paint Wicket T and dot"].val){
      //Stump dots
      var sDot1 = p1.add( g1.multiply(this.options.LineWidth.val * 0.5).rotate_90_cw());
      var sDot2 = p1.add( g1.multiply(this.options.LineWidth.val* 0.5).rotate_90_ccw());
      var sDot3 = p2.add( g1.multiply(this.options.LineWidth.val* 0.5).rotate_90_cw());
      var sDot4 = p2.add( g1.multiply(this.options.LineWidth.val* 0.5).rotate_90_ccw());
      

      //wicket T 1 on the right side
      var wicketT1p1 = p1.add(g1.multiply(1.1044).rotate_90_cw());
      var wicketT1p2 = wicketT1p1.add(g1.multiply((0.5).foot2meter()))
      var wicketT1p3 = wicketT1p1.add(g1.multiply((0.5).foot2meter()).rotate_90_cw())
      var wicketT1p4 = wicketT1p1.add(g1.multiply((0.5).foot2meter()).rotate_90_ccw()) 
     
      //wicket T 2 on the right side
      var wicketT2p1 = p1.add(g1.multiply(1.1044).rotate_90_ccw());
      var wicketT2p2 = wicketT2p1.add(g1.multiply((0.5).foot2meter()))
      var wicketT2p3 = wicketT2p1.add(g1.multiply((0.5).foot2meter()).rotate_90_cw())
      var wicketT2p4 = wicketT2p1.add(g1.multiply((0.5).foot2meter()).rotate_90_ccw()) 


      //wicket T 1 on the left side
      var wicketT3p1 = p2.add(g1.multiply(1.1044).rotate_90_cw());
      var wicketT3p2 = wicketT3p1.subtract(g1.multiply((0.5).foot2meter()))
      var wicketT3p3 = wicketT3p1.add(g1.multiply((0.5).foot2meter()).rotate_90_cw())
      var wicketT3p4 = wicketT3p1.add(g1.multiply((0.5).foot2meter()).rotate_90_ccw()) 
      

      //wicket T 2 on the left side
      var wicketT4p1 = p2.add(g1.multiply(1.1044).rotate_90_ccw());
      var wicketT4p2 = wicketT4p1.subtract(g1.multiply((0.5).foot2meter()))
      var wicketT4p3 = wicketT4p1.add(g1.multiply((0.5).foot2meter()).rotate_90_cw())
      var wicketT4p4 = wicketT4p1.add(g1.multiply((0.5).foot2meter()).rotate_90_ccw()) 
      

    }
    if( this.options ["Paint Pitch"].val || this.options["Paint Wicket T and dot"].val)
    {
      //this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      // start line right side
      if(this.options["Paint Wicket T and dot"].val){
      this.tasks.push( new LineTask( this.tasks.length, [ wicketT1p1, wicketT1p2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ wicketT1p3, wicketT1p1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ wicketT1p1, wicketT1p4 ], false, true ) );

      if(this.options ["Paint Pitch"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ wide1, p1 ], false, true ) );
      }
      this.tasks.push(new ArcTask(this.tasks.length, [sDot1, sDot2], p1, true, false, true));
      if(this.options ["Paint Pitch"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ p1, wide3 ], false, true ) );
      }

      this.tasks.push( new LineTask( this.tasks.length, [ wicketT2p3, wicketT2p1 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ wicketT2p1, wicketT2p4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ wicketT2p1, wicketT2p2 ], false, true ) );
      }
      else{
        this.tasks.push( new LineTask( this.tasks.length, [ l1, l2 ], false, true ) );
      }
      if(this.options ["Paint Pitch"].val){
        // side 
        this.tasks.push( new LineTask( this.tasks.length, [ side3, l2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l2, side4 ], false, true ) );
        // bowling crease protected indicators
        if( this.options ["Protected Area Indicators"].val )
       {
          this.tasks.push( new LineTask( this.tasks.length, [ pro4, pro3 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro1, pro2 ], false, true ) );
       }
        // side

        this.tasks.push( new LineTask( this.tasks.length, [ side2, l1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l1, side1 ], false, true ) );
        if( this.options ["Wide Guidelines"].val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ wide2, wide1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ wide3, wide4 ], false, true ) );

        }
        // popping line
        this.tasks.push( new LineTask( this.tasks.length, [ l7, l6 ], false, true ) );
        // protected area indicators
        if( this.options ["Protected Area Indicators"].val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ pro21, pro10 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro21, pro11 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro12, pro13 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro12, pro14 ], false, true ) );
        }

      
        // start line left side
        // protected area indicators
        if( this.options ["Protected Area Indicators"].val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ pro22, pro16 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro22, pro17 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro18, pro19 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro18, pro20 ], false, true ) );
        }
        // popping line
        this.tasks.push( new LineTask( this.tasks.length, [ l9, l10 ], false, true ) );
        //side
        this.tasks.push( new LineTask( this.tasks.length, [ side7, l4 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l4, side8 ], false, true ) );
      }
      // bowling line
      if(this.options["Paint Wicket T and dot"].val){
        
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT4p4, wicketT4p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT4p1, wicketT4p3 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT4p1, wicketT4p2 ], false, true ) );

        if(this.options ["Paint Pitch"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ wide7, p2 ], false, true ) );
        }
        this.tasks.push(new ArcTask(this.tasks.length, [sDot3, sDot4], p2, true, false, true));
        if(this.options ["Paint Pitch"].val){
        this.tasks.push( new LineTask( this.tasks.length, [ p2, wide5 ], false, true ) );
        }
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT3p4, wicketT3p1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT3p1, wicketT3p3 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ wicketT3p1, wicketT3p2 ], false, true ) );
        }
        else{
          this.tasks.push( new LineTask( this.tasks.length, [ l4, l3 ], false, true ) );
        }
      if(this.options ["Paint Pitch"].val){    
        if( this.options ["Protected Area Indicators"].val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ pro5, pro6 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ pro7, pro8 ], false, true ) );
        }
        if( this.options ["Wide Guidelines"].val )
        {
          this.tasks.push( new LineTask( this.tasks.length, [ wide5, wide6 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ wide7, wide8 ], false, true ) );
        }

        //side
        this.tasks.push( new LineTask( this.tasks.length, [ side5, side6 ], false, true ) );
        // this.tasks.push( new LineTask( this.tasks.length, [ l3, side6 ], false, true ) );

      } 
      if( this.options ["Close-infield"].val )
      {
        this.tasks.push( new ArcTask( this.tasks.length, [ l19, l20 ], l5, false, false, true ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ l22, l23 ], l8, false, false, true ) );
      }
    }

    

    if( this.options["Mens size"].val === true || this.options["Womens size"].val === true )
    {
      if( (this.options.DottedOuter.val || this.options.DashedOuter.val) && this.options.DahsedLength.val < 4.5 )
      {
        var side_length = (new Line( l16, l13 )).length;
        var circle_side_length = radius * Math.PI;
        var circumference_length = 2 * circle_side_length + 2 * side_length;
        var dots = Math.round( circumference_length / 4.5 );
        var dash_length = this.options.DahsedLength.val;
        var dash_space = (circumference_length / dots) - dash_length;
// Opret linjerne
        var new_outer = [ ];
        var outer_1 = new LineTask( this.tasks.length, [ l16, l13 ], false, true ); //4
        var new_outer1 = outer_1.toLine().split( dash_length, dash_space );
        var used_length = side_length;
        var dots_made = Math.floor( used_length / (dash_space + dash_length) );
        var remaining = used_length - (dots_made * (dash_space + dash_length));
        var outer_2 = new ArcTask( this.tasks.length, [ l13, l15, l14 ], p1, true, false, true ); //3
        var new_outer2 = outer_2.splitLineSpace( dash_length, dash_space, -remaining );
        used_length = circle_side_length + remaining;
        dots_made = Math.floor( used_length / (dash_space + dash_length) );
        remaining = used_length - (dots_made * (dash_space + dash_length));
        var outer_3 = new LineTask( this.tasks.length, [ l14, l17 ], false, true ); //2
        var new_outer3 = outer_3.toLine().split( dash_length, dash_space, remaining );
        used_length = side_length + remaining;
        dots_made = Math.floor( used_length / (dash_space + dash_length) );
        remaining = used_length - (dots_made * (dash_space + dash_length));
        var outer_4 = new ArcTask( this.tasks.length, [ l17, l18, l16 ], p2, true, false, true ); //1
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
        this.tasks.push( new LineTask( this.tasks.length, [ l16, l13 ], false, true ) ); //4
        this.tasks.push( new ArcTask( this.tasks.length, [ l13, l15, l14 ], p1, true, false, true ) ); //3
        this.tasks.push( new LineTask( this.tasks.length, [ l14, l17 ], false, true ) ); //2
        this.tasks.push( new ArcTask( this.tasks.length, [ l17, l18, l16 ], p2, true, false, true ) ); //1     
      }
    }



    // Boundary line


    var bou1 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou2 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );
    var bou3 = p1.subtract( g1.multiply( this.options ["Boundary size"].val ) );
    var bou4 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou5 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );
    var bou6 = p2.add( g1.multiply( this.options ["Boundary size"].val ) );


    if( this.options["Boundary line"].val === true )
    {

      this.tasks.push( new LineTask( this.tasks.length, [ bou4, bou1 ], false, true ) ); //4
      this.tasks.push( new ArcTask( this.tasks.length, [ bou1, bou3, bou2 ], p1, true, false, true ) ); //3
      this.tasks.push( new LineTask( this.tasks.length, [ bou2, bou5 ], false, true ) ); //2
      this.tasks.push( new ArcTask( this.tasks.length, [ bou5, bou6, bou4 ], p2, true, false, true ) ); //1
    }


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();


  }

  refresh_test_run()
  {
    delete this.calculated_drawing_points;
    this.test_tasks = [ ];
    var p = this.drawing_points;
    //goal posts
    var p1 = p[2];
    var p2 = p[5];
 



    var p1p2 = new Line( p1, p2 );

    var g1 = p1p2.unit_vector;
    if( this.options["Mens size"].val )
    {
      var l13 = p1.add( g1.multiply( this.options ["Men"].val ).rotate_90_cw() );
      var l14 = p1.add( g1.multiply( this.options ["Men"].val ).rotate_90_ccw() );
      var l15 = p1.subtract( g1.multiply( this.options ["Men"].val ) );
      var l16 = p2.add( g1.multiply( this.options ["Men"].val ).rotate_90_cw() );
      var l17 = p2.add( g1.multiply( this.options ["Men"].val ).rotate_90_ccw() );
      var l18 = p2.add( g1.multiply( this.options ["Men"].val ) );
      var radius = this.options ["Men"].val;
      
    }

    if( this.options["Womens size"].val )
    {
      var l13 = p1.add( g1.multiply( this.options ["Women"].val ).rotate_90_cw() );
      var l14 = p1.add( g1.multiply( this.options ["Women"].val ).rotate_90_ccw() );
      var l15 = p1.subtract( g1.multiply( this.options ["Women"].val ) );
      var l16 = p2.add( g1.multiply( this.options ["Women"].val ).rotate_90_cw() );
      var l17 = p2.add( g1.multiply( this.options ["Women"].val ).rotate_90_ccw() );
      var l18 = p2.add( g1.multiply( this.options ["Women"].val ) );
      var radius = this.options ["Women"].val;
     
    }

    var bou1 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou2 = p1.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );
    var bou3 = p1.subtract( g1.multiply( this.options ["Boundary size"].val ) );
    var bou4 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_cw() );
    var bou5 = p2.add( g1.multiply( this.options ["Boundary size"].val ).rotate_90_ccw() );
    var bou6 = p2.add( g1.multiply( this.options ["Boundary size"].val ) );


    if( this.options["Boundary line"].val === true )
    {

      this.test_tasks.push( new LineTask( this.tasks.length, [ bou4, bou1 ], false, true ) ); //4
      this.test_tasks.push( new ArcTask( this.tasks.length, [ bou1, bou3, bou2 ], p1, true, false, true ) ); //3
      this.test_tasks.push( new LineTask( this.tasks.length, [ bou2, bou5 ], false, true ) ); //2
      this.test_tasks.push( new ArcTask( this.tasks.length, [ bou5, bou6, bou4 ], p2, true, false, true ) ); //1
    }
    else if( this.options["Mens size"].val || this.options["Womens size"].val)
    {
      this.test_tasks.push( new LineTask( this.tasks.length, [ l16, l13 ], false, true ) ); //4
      this.test_tasks.push( new ArcTask( this.tasks.length, [ l13, l15, l14 ], p1, true, false, true ) ); //3
      this.test_tasks.push( new LineTask( this.tasks.length, [ l14, l17 ], false, true ) ); //2
      this.test_tasks.push( new ArcTask( this.tasks.length, [ l17, l18, l16 ], p2, true, false, true ) ); //1    
    }
    else
    {
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[1] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[2] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[3] ) );
    }

  }

}




