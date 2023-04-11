/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global s2p2 */
/* global this, five_degrees_equal, robot_controller, pt, ArcTask, CubicBezierTask */
class RugbyUnion extends square_pitch
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Union"; // Translateable
  static template_id = "rugby_union"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.adjust_template_crosses = {
      top: 0.12,
      left: 0,
      right: 0,
      bottom: 0.12
    };
    var check = 0;
    //this.options.LineLength = {name: "Line Length", val: 0.1, type: "float", "dontsave": true};
    //this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 100; //maximum length
    this.options.Width.val = 70; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.reverseInGoal = {
      get configurable( )
      {
        if( !robot_controller.chosen_robot_id )
          return true;
        if( !robot_controller.robot_has_capability( "bezier_task" ) )
          return false;
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "drive_around_goal" ) >= 0 )
          return true;
        return false;
      },
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
      this.options.reverseInGoal.val = true;

    this.options["00000"] = {
      dontsave: true,
      val: ""
    };
    this.options.removeGoalEnds = {
      adjustable: false,
      configurable: true,
      name: "Remove Goal Ends",
      val: false,
      type: "bool",
      "dontsave": false,
      prev_sibling: "00000"
    };
    this.options.InGoal = {
      get configurable()
      {
        return !this_class.options.removeGoalEnds.val;
      },
      name: "In Goal length",
      val: 10,
      type: "float",
      prev_sibling: "removeGoalEnds"
    };
    this.options.five_m_line = {
      configurable: true,
      name: "5m line",
      val: 5,
      type: "float",
      prev_sibling: "InGoal"
    };
    this.options.twotwo_m_line = {
      configurable: true,
      name: "22m line",
      val: 22,
      type: "float",
      prev_sibling: "five_m_line"
    };
    this.options.ten_m_line = {
      configurable: true,
      name: "10m line from center",
      val: 10,
      type: "float",
      prev_sibling: "twotwo_m_line"
    };
    this.options.horizontal_line_close = {
      configurable: true,
      name: "Horizontal has marks distance 1",
      val: (5).yard2meter(),
      type: "float",
    }
    this.options.horizontal_line_further = {
      configurable: true,
      name: "Horizontal has marks distance 2",
      val: (15).yard2meter(),
      type: "float",
    }

    this.options.goalPoleWidth = {
      name: "goalPoleWidth",
      val: 0.12,
      type: "float",
      "dontsave": true
    };
    this.options.GoalWidth = {
      name: "Space between goal spots",
      val: 5.6,
      type: "float",
      "dontsave": true
    };
    this.options.Center = {
      get configurable()
      {
        return !this_class.options.noInternals.val;
      },
      prev_sibling: "noInternals",
      name: "Center spot",
      val: true,
      type: "bool"
    };
    this.options.CenterRadius = {
      name: "Center radius",
      val: 0.06,
      type: "float",
      "dontsave": true
    };
    this.options.CenterLine = { 
      get configurable()
      {
        return !this_class.options.noInternals.val;
      },
      prev_sibling: "noInternals",
      name: "Center Line",
      val: false,
      type: "bool"
    };
    //this.options.HashLength = {name: "Hash Length", val: ( 2 - this.options.LineWidth.val ), type: "float", "dontsave": true};

    this.options.noInternals = {
      configurable: false,
      name: "No internals",
      val: false,
      type: "bool",
      dontsave: true
    };

    this.options.HashLength = {
      get configurable()
      {
        return !this_class.options.noInternals.val;
      },
      prev_sibling: "noInternals",
      "dontsave": false,
      name: "Hash Mark Length",
      type: "float",
      _val: (2 - this.options.LineWidth.val),
      get val( )
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      }
    };

    this.options.GoalHashLength = {
      get configurable()
      {
        return !this_class.options.noInternals.val;
      },
      prev_sibling: "noInternals",
      "dontsave": false,
      name: "Goal Hash Mark Length",
      type: "float",
      _val: (2 - this.options.LineWidth.val),
      get val( )
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      }
    };

    this.options.FewHashmarks = {
      get configurable()
      {
        return !this_class.options.noInternals.val;
      },
      prev_sibling: "noInternals",
      name: "Few Hash Marks",
      val: false,
      type: "bool"
    };
    this.options["remove 5m line"]= {
      configurable: true,
      name: "5m lines",
      val: true,
      type: "bool"
    }


  }
  static get layout_methods( )
  {
    if( robot_controller.robot_has_capability( "bezier_task" ) &&
      pt.template_options["rugby_union"] &&
      pt.template_options["rugby_union"].indexOf( "drive_around_goal" ) >= 0 )
    {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "free_hand": 0,
        "all_goal_posts": 4,
        "all_corners,all_goal_posts": 8
      };
    }
    else
    {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "free_hand": 0
      };
    }
  }
  refresh_handles( )
  {
    super.refresh_handles( );
    var this_class = this;
    var p = this.drawing_points; 
    var c1 = p[0];
    var c2 = p[3];
    var g1 = new Line( c1, c2 ).unit_vector; //1.00m guideline
    var g2 = g1.rotate_90_cw( );
    var c3 = p[4];
    var c4 = p[7];
    if( !this.options.removeGoalEnds.val )
    {
      this.options.TotalLength.val = this.options.Length.val + this.options.InGoal.val * 2;
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
      this.options.TotalLength.val = this.options.Length.val;
    }
  }
  refresh_test_run( corners, ic )
  {
    if( this.options.removeGoalEnds.val )
    {
      this.test_tasks = [ ];
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[0] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[1] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[2] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[3] ) );
    }
    else
    {
      this.test_tasks = [ ];
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[0] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[1] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[2] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[3] ) );
    }
  }
  create_center( midline )
  {
    var g1 = midline.unit_vector;
    var g2 = g1.rotate_90_cw( );
    var rad = this.options.CenterRadius.val;
    var lw = this.options.LineWidth.val;
    var center = midline.middle;
    
    
    if(this.options.CenterLine.val){
      var cL1 = center.add(g2.multiply(0.15));
      var cL2 = center.subtract(g2.multiply(0.15));
      this.tasks.push( new LineTask( this.tasks.length, [ cL1, cL2 ], false, true ) );
      
    }
    if( this.options.Center.val){

      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad + lw / 2 ) ),
        center.add( g1.multiply( -(rad + lw / 2) ) ) ], center, true, false, true ) );
    }

  }
  conenozzle_convert( tasks )
  {
    var ll = this.options.LineWidth.val; //Formerly LineLength!!!!
    var taskbuf = [ ];
    for( var i = 0; i < tasks.length; i++ )
    {
      if( tasks[i] instanceof ArcTask )
      {
        taskbuf.push( tasks[i] );
        continue;
      }
      else if( tasks[i] instanceof CubicBezierTask )
      {
        taskbuf.push( tasks[i] );
        continue;
      }
      else
      {
        taskbuf.push( tasks[i].toLine( ).add_to_start( -ll / 2 ).add_to_end( -ll / 2 ) );
      }
    }

    tasks = [ ];
    for( i = 0; i < taskbuf.length; i++ )
    {
      if( taskbuf[i] instanceof ArcTask )
      {
        tasks.push( taskbuf[i] );
        continue;
      }
      else if( taskbuf[i] instanceof CubicBezierTask )
      {
        tasks.push( taskbuf[i] );
        continue;
      }
      else
      {
        tasks.push( taskbuf[i].toLineTask( this.tasks.length, false, true ) );
      }
    }
  }
  connect_to_sides( start, end, s1, s2 )
  {
    var line;
    line = new Line( new Line( start, end ).cross_with_line( s1 ), new Line( start, end ).cross_with_line( s2 ) );
    return line;
  }
  create_hash_vert( linenum, ic1, ic2, ic3, ic4 )
  {
    var p = this.drawing_points;
    var s1 = new Line( ic1, ic2 );
    var s2 = new Line( ic3, ic4 );
    var s3 = new Line( ic2, ic3 );
    var s4 = new Line( ic1, ic4 );
    var a2 = s3.unit_vector; //parallel med s3
    var a1 = a2.rotate_90_ccw( );
    var b2 = s4.unit_vector; //parallel med s4
    var b1 = b2.rotate_90_ccw( );
    var g1 = new Line( p[1], p[2] ).unit_vector; //parallel med s1
    var g2 = g1.rotate_90_cw( );
    var h1 = new Line( p[6], p[5] ).unit_vector; //parallel med s2
    var h2 = h1.rotate_90_cw( );
    var i1 = new Line( s4.middle, s3.middle ).unit_vector;
    var i2 = i1.rotate_90_cw( );
    var lw = this.options.LineWidth.val;
    var hashlen = this.options.HashLength.val;
    var goalhashlen = this.options.GoalHashLength.val;
    var space = 10;
    var amount = 6;
    var dist = [ -(5 + lw / 2), -(15 + lw / 2), 15 + lw / 2, 5 + lw / 2 ];
    var hori = [ ];
    for( var i = 0; i < 4; i++ )
    {
      if( i < 2 )
      {
        var st = ic3;
        var ed = ic2;
        var u1 = a1;
        var u2 = a2;
      }
      else
      {
        var st = ic4;
        var ed = ic1;
        var u1 = b1;
        var u2 = b2;
      }
      var d = dist[i];
      var line = this.connect_to_sides( st.add( u1.multiply( d ) ), ed.add( u1.multiply( d ) ), s2, s1 );
      hori.push( line );
    }

    switch( linenum )
    {
      case 0: //side 1 goal
        var o1 = g1;
        var side = 1;
        if(this.options["remove 5m line"].val){
        var dist2 = this.options.five_m_line.val;
        }
        var start = ic1.add( g2.multiply( dist2 * side ) );
        var end = ic2.add( g2.multiply( dist2 * side ) );
        var s0 = this.connect_to_sides( start, end, s4, s3 );
        var goalwidth = new Line( p[1], p[2] ).length;
        break;
      case 1: //side 1 middle
        var o1 = i1;
        var side = -1;
        var dist2 = this.options.ten_m_line.val;
        var s0 = this.connect_to_sides(
          s4.middle.add( i2.multiply( dist2 * side ) ),
          s3.middle.add( i2.multiply( dist2 * side ) ),
          s4,
          s3 );
        var start = s0.start;
        var end = s0.end;
        break;
      case 2: // //side 2 middle
        var o1 = i1;
        var side = 1;
        var dist2 = this.options.ten_m_line.val;
        var s0 = this.connect_to_sides(
          s4.middle.add( i2.multiply( dist2 * side ) ),
          s3.middle.add( i2.multiply( dist2 * side ) ),
          s4,
          s3 );
        var start = s0.start;
        var end = s0.end;
        break;
      case 3: //side 2 goal
        var o1 = h1;
        var side = -1;
        if(this.options["remove 5m line"].val){
        var dist2 = this.options.five_m_line.val;
        }
        var start = ic4.add( h2.multiply( dist2 * side ) );
        var end = ic3.add( h2.multiply( dist2 * side ) );
        var s0 = this.connect_to_sides( start, end, s4, s3 );
        var goalwidth = new Line( p[6], p[5] ).length;
        break;
    }
    var vert = [ ];
    var j = 0;
    var goalhashes = [ ];
    var fix_goalhash = false;
    var midgoal1 = new Line( new Line( p[1], p[2] ).middle.subtract( g1.multiply( 1 + lw / 2 ) ), new Line( p[1], p[2] ).middle.add( g1.multiply( 1 + lw / 2 ) ) );
    var midgoal2 = new Line( new Line( p[6], p[5] ).middle.subtract( h1.multiply( 1 + lw / 2 ) ), new Line( p[6], p[5] ).middle.add( h1.multiply( 1 + lw / 2 ) ) );

    if( linenum === 0 || linenum === 3 )
    {
      for( var i = 0; i < amount; i++ )
      {
        if( goalwidth - 2 - lw < goalhashlen )
          fix_goalhash = true;

        if( i === 2 )
        {
          if( fix_goalhash )
          {
            var midgoal = new Line( midgoal1.start, midgoal2.start );
            var newstart = s0.cross_with_line( midgoal );
            var newline = new Line( newstart.subtract( o1.multiply( goalhashlen ) ), end ).split( goalhashlen )[0].reverse( );
            vert.push( newline );
            continue;
          }
          //var space = new Line( s0.cross_with_line( hori[1] ), s0.cross_with_line( hori[2] ) ).length / 3;
          var newstart = s0.cross_with_line( new Line( p[2], p[5] ) );
          //var newstart = s0.middle.add( o1.multiply( space / 2 ) );
          var newline = new Line( newstart.subtract( o1.multiply( (goalhashlen - 1.50) / 2 ) ), end ).split( goalhashlen )[0].reverse( );
          goalhashes.push( newline );
        }
        else if( i === 3 )
        {
          if( fix_goalhash )
          {
            var midgoal = new Line( midgoal1.end, midgoal2.end );
            var newstart = s0.cross_with_line( midgoal );
            var newline = new Line( newstart, end ).split( goalhashlen )[0].reverse( );
            vert.push( newline );
            continue;
          }
          //var space = new Line( s0.cross_with_line( hori[1] ), s0.cross_with_line( hori[2] ) ).length / 3;
          var newstart = s0.cross_with_line( new Line( p[1], p[6] ) );
          //var newstart = s0.middle.add( o1.multiply( space / 2 ) );
          var newline = new Line( newstart.subtract( o1.multiply( (goalhashlen + 1.50) / 2 ) ), end ).split( goalhashlen )[0].reverse( );
          goalhashes.push( newline );
        }
        else
        {
          var newstart = s0.cross_with_line( hori[j] );
          j++;
          var newline = new Line( newstart.subtract( o1.multiply( hashlen / 2 ) ), end ).split( hashlen )[0].reverse( );
        }
        vert.push( newline );

      }
    }
    else
    {
      for( var i = 0; i < (amount + 1); i++ )
      {
        if( i === 2 )
        {
          var space = new Line( s0.cross_with_line( hori[1] ), s0.cross_with_line( hori[2] ) ).length;
          var newstart = s0.middle.add( o1.multiply( space / 4 ) );
        }
        else if( i === 3 )
        {
          var newstart = s0.middle;
        }
        else if( i === 4 )
        {
          var space = new Line( s0.cross_with_line( hori[1] ), s0.cross_with_line( hori[2] ) ).length;
          var newstart = s0.middle.subtract( o1.multiply( space / 4 ) );
        }
        else
        {
          var newstart = s0.cross_with_line( hori[j] );
          j++;
        }
        var newline = new Line( newstart.subtract( o1.multiply( hashlen / 2 ) ), end ).split( hashlen )[0].reverse( );
        vert.push( newline );
      }
    }
    if( this.options.removeGoalEnds.val )
    {
      for( var k = 0; k < Math.ceil( vert.length / 2 ); k++ )
      {
        var buf = vert[k];
        vert[k] = vert[vert.length - 1 - k];
        vert[vert.length - 1 - k] = buf;
      }
      for( var k = 0; k < (vert.length); k++ )
      {
        this.tasks.push( vert[k].reverse().toLineTask( this.tasks.length, false, true ) );
      }
    }
    else
    {
      for( var k = 0; k < (vert.length); k++ )
      {
        this.tasks.push( vert[k].toLineTask( this.tasks.length, false, true ) );
      }
    }
  }
  create_hash_hori( linenum, ic1, ic2, ic3, ic4 )
  {
    var p = this.drawing_points;
    var s3 = new Line( ic2, ic3 );
    var s4 = new Line( ic1, ic4 );
    //guidelines
    var a2 = s3.unit_vector; //parrallel to side 3
    var a1 = a2.rotate_90_ccw( );
    var b2 = s4.unit_vector; //parrallel to side 4
    var b1 = b2.rotate_90_ccw( );
    var g1 = new Line( p[1], p[2] ).unit_vector; //parallel med s1
    var g2 = g1.rotate_90_cw( );
    var h1 = new Line( p[6], p[5] ).unit_vector; //parallel med s2
    var h2 = h1.rotate_90_cw( );
    var i1 = new Line( s4.middle, s3.middle ).unit_vector;
    var i2 = i1.rotate_90_cw( );
    var lw = this.options.LineWidth.val;
    var hashlen = this.options.HashLength.val;
    var tasks = [ ];
    var tasksbuf = [ ];
    var vert = [ ];
    var dist = [ this.options.five_m_line.val, this.options.twotwo_m_line.val, -this.options.ten_m_line.val, 0, this.options.ten_m_line.val,
      -this.options.twotwo_m_line.val, -this.options.five_m_line.val ];
    for( var i = 0; i < 7; i++ )
    { //s1 -> s2
      if( i < 2 )
      {
        var st = ic1;
        var ed = ic2;
        var u1 = g1;
        var u2 = g2;
      }
      else if( i > 4 )
      {
        var st = ic4;
        var ed = ic3;
        var u1 = h1;
        var u2 = h2;
      }
      else
      {
        var st = new Line( ic1, ic4 ).middle;
        var ed = new Line( ic2, ic3 ).middle;
        var u1 = i1;
        var u2 = i2;
      }
      var d = dist[i];
      var line = this.connect_to_sides( st.add( u2.multiply( d ) ), ed.add( u2.multiply( d ) ), s4, s3 );
      vert.push( line );
    }

    var m1, m2, side, dist1, start0, end0;
    switch( linenum )
    {
      case 0:
        m1 = a1;
        m2 = a2;
        side = -1;
        dist1 = this.options.horizontal_line_close.val;
        start0 = ic3;
        end0 = ic2;
        break;
      case 1:
        m1 = a1;
        m2 = a2;
        side = -1;
        dist1 = this.options.horizontal_line_further.val;
        start0 = ic3;
        end0 = ic2;
        break;
      case 2:
        m1 = b1;
        m2 = b2;
        side = 1;
        dist1 = this.options.horizontal_line_further.val;
        start0 = ic4;
        end0 = ic1;
        break;
      case 3:
        m1 = b1;
        m2 = b2;
        side = 1;
        dist1 = this.options.horizontal_line_close.val;
        start0 = ic4;
        end0 = ic1;
        break;
    }
    var start = start0.add( m1.multiply( dist1 * side ) );
    var end = end0.add( m1.multiply( dist1 * side ) );
    var line = this.connect_to_sides( start, end, vert[6], vert[0] );
    var amount = 13;
    var j = 6;
    for( var i = 0; i < amount - 2; i++ )
    {
      if( i === 0 )
      {
        var newstart = line.cross_with_line( vert[6] );
        var newline = new Line( newstart, end ).split( hashlen )[0];
        j--;
      }
      else if( i === 1 )
      {
        var space = (new Line( line.cross_with_line( vert[6] ), line.cross_with_line( vert[5] ) ).length - 1.5 * hashlen) / 2;
        var newstart = newline.end.subtract( m2.multiply( space ) );
        var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), end ).split( hashlen )[0];
        if( this.options.FewHashmarks.val )
          continue;
      }
      else if( i === 3 )
      {
        var space = (100 / 2 - 22 - 10 - hashlen) / 3;
        for( var k = 0; k < Math.floor( (new Line( line.cross_with_line( vert[4] ), line.cross_with_line( vert[5] ) ).length - hashlen) / (space + hashlen / 2) ); k++ )
        {
          var newstart = newline.end.subtract( m2.multiply( space ) );
          var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), line.cross_with_line( vert[4] ).subtract( m2.multiply( hashlen / 2 ) ) ).split( hashlen )[0];
          if( this.options.FewHashmarks.val )
          {
            continue;
          }
          else
          {
            tasks.push( newline.toLineTask( tasks.length, false, true ) );
          }
        }
        continue;
      }
      else if( i === 7 )
      {
        var space = (100 / 2 - 22 - 10 - hashlen) / 3;
        for( var k = 0; k < Math.floor( (new Line( line.cross_with_line( vert[1] ), line.cross_with_line( vert[2] ) ).length - hashlen) / (space + hashlen / 2) ); k++ )
        {
          var newstart = newline.end.subtract( m2.multiply( space ) );
          var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), line.cross_with_line( vert[1] ).add( m2.multiply( hashlen / 2 ) ) ).split( hashlen )[0];
          if( this.options.FewHashmarks.val )
          {
            continue;
          }
          else
          {
            tasks.push( newline.toLineTask( tasks.length, false, true ) );
          }
        }
        continue;
      }
      else if( i === 9 )
      {
        var space = (new Line( line.cross_with_line( vert[1] ), line.cross_with_line( vert[0] ) ).length - 1.5 * hashlen) / 2;
        var newstart = newline.end.subtract( m2.multiply( space ) );
        var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), end ).split( hashlen )[0];
        if( this.options.FewHashmarks.val )
          continue;
      }
      else if( i === 10 )
      {
        var newstart = line.cross_with_line( vert[0] );
        var newline = new Line( newstart.add( m2.multiply( hashlen ) ), newstart ).split( hashlen )[0];
      }
      else
      {
        var newstart = line.cross_with_line( vert[j] );
        var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), end ).split( hashlen )[0];
        if( j <= 0 )
        {
          j = 6;
        }
        else
        {
          j--;
        }
      }
      if( newline )
        tasks.push( newline.toLineTask( tasks.length, false, true ) );
    }
    if( linenum === 0 || linenum === 3 )
    {
      for( var i = 0; i < tasks.length; i++ )
      {
        tasksbuf[i] = tasks[i].toLine( );
        this.tasks.push( tasksbuf[i].toLineTask( this.tasks.length, false, true ) );
      }
    }
    else if( linenum === 1 || linenum === 2 )
    {
      for( var i = 0; i < tasks.length; i++ )
      {
        tasksbuf[i] = tasks[tasks.length - (i + 1)].toLine( ).reverse( );
        this.tasks.push( tasksbuf[i].toLineTask( this.tasks.length, false, true ) );
      }
    }
    else
    {
      console.log( "linenum variable has to be between 0-3" );
    }
  }
  draw( )
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var s3 = new Line( c2, c3 );
    var s4 = new Line( c1, c4 );
    var a2 = s3.unit_vector; //parrallel to side 3
    var a1 = a2.rotate_90_ccw( );
    var b2 = s4.unit_vector; //parrallel to side 4
    var b1 = b2.rotate_90_ccw( );
    var g1 = new Line( p[1], p[2] ).unit_vector; //parallel med s1
    var g2 = g1.rotate_90_cw( );
    var h1 = new Line( p[6], p[5] ).unit_vector; //parallel med s2
    var h2 = h1.rotate_90_cw( );
    var i1 = new Line( s4.middle, s3.middle ).unit_vector;
    var i2 = i1.rotate_90_cw( );
    var goalDist = this.options.InGoal.val;
    var lw = this.options.LineWidth.val;
    //goals
    var oc2 = c2.subtract( a2.multiply( goalDist  ) );
    var oc3 = c3.add( a2.multiply( goalDist  ) );
    var oc1 = c1.subtract( b2.multiply( goalDist  ) );
    var oc4 = c4.add( b2.multiply( goalDist  ) );
    var new_corners = [ oc1, oc2, oc3, oc4 ];
    s3 = new Line( oc2, oc3 );
    s4 = new Line( oc1, oc4 );
    var gl1 = this.connect_to_sides( c1, c2, s4, s3 );
    var gl2 = this.connect_to_sides( c4, c3, s4, s3 );
    var midline = this.connect_to_sides( s4.middle, s3.middle, s4, s3 );

    if(this.options.reverseInGoal.val){
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }else{
      this.options["fast_test"].val = true;
      this.options["normal_test"].val = true;
    }

    if(this.options.CenterLine.val && this.check === 0){
      this.check = 1;
      this.options.Center.val = false;
    }else if(this.options.Center.val){
      this.check = 0; 
      this.options.CenterLine.val = false;
    }
    //border
    if( this.options.removeGoalEnds.val )
    {
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl1.start, p[1], p[2], gl1.end, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.start_locations.push( new StartLocation( gl1.start, this.tasks.length ) );
        this.tasks.push( new LineTask( this.tasks.length, [ gl1.start, gl1.end ], false, true ) );
      }
      this.start_locations.push( new StartLocation( gl1.end, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ gl1.end, gl2.end ], false, true ) );
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl2.end, p[5], p[6], gl2.start, 3, this.tasks.length, this.options.goalPoleWidth.val, true ) );
      }
      else
      {
        this.start_locations.push( new StartLocation( gl2.end, this.tasks.length ) );
        this.tasks.push( new LineTask( this.tasks.length, [ gl2.end, gl2.start ], false, true ) );
      }
      this.start_locations.push( new StartLocation( gl2.start, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ gl2.start, gl1.start ], false, true ) );

      if( !this.options.noInternals.val )
      {
        this.create_hash_vert( 0, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( this.connect_to_sides( gl1.start.add( g2.multiply( this.options.twotwo_m_line.val ) ), gl1.end.add( g2.multiply( this.options.twotwo_m_line.val ) ), s4, s3 ).reverse().toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 1, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( midline.reverse().toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 2, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( this.connect_to_sides( gl2.start.subtract( h2.multiply( this.options.twotwo_m_line.val ) ), gl2.end.subtract( h2.multiply( this.options.twotwo_m_line.val ) ), s4, s3 ).reverse().toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 3, gl1.start, gl1.end, gl2.end, gl2.start );
      }
      else
      {
        this.tasks.push( midline.reverse().toLineTask( this.tasks.length, false, true ) );
      }

      if( !this.options.noInternals.val )
      {
        for( var i = 0; i < 4; i++ )
        {
          this.create_hash_hori( i, gl1.start, gl1.end, gl2.end, gl2.start );
          if( i === 1 )
            this.create_center( midline );
        }
      }
    }
    else
    {
      this.start_locations.push( new StartLocation( oc1, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ oc1, oc2 ], false, true ) );
      this.start_locations.push( new StartLocation( s3.start, this.tasks.length ) );
      this.tasks.push( s3.toLineTask( this.tasks.length, false, true ) );
      this.start_locations.push( new StartLocation( oc3, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ oc3, oc4 ], false, true ) );
      this.start_locations.push( new StartLocation( s4.end, this.tasks.length ) );
      this.tasks.push( s4.reverse( ).toLineTask( this.tasks.length, false, true ) );


      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl1.start, p[1], p[2], gl1.end, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ gl1.start, gl1.end ], false, true ) );
      }

      if( !this.options.noInternals.val )
      {
        this.create_hash_vert( 0, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( this.connect_to_sides( gl1.start.add( g2.multiply( this.options.twotwo_m_line.val ) ), gl1.end.add( g2.multiply( this.options.twotwo_m_line.val ) ), s4, s3 ).toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 1, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( midline.toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 2, gl1.start, gl1.end, gl2.end, gl2.start );
        this.tasks.push( this.connect_to_sides( gl2.start.subtract( h2.multiply( this.options.twotwo_m_line.val ) ), gl2.end.subtract( h2.multiply( this.options.twotwo_m_line.val ) ), s4, s3 ).toLineTask( this.tasks.length, false, true ) );
        this.create_hash_vert( 3, gl1.start, gl1.end, gl2.end, gl2.start );
      }
      else
      {
        this.tasks.push( midline.toLineTask( this.tasks.length, false, true ) );
      }

      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl2.start, p[6], p[5], gl2.end, 3, this.tasks.length, this.options.goalPoleWidth.val, true ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ gl2.start, gl2.end ], false, true ) );
      }

      if( !this.options.noInternals.val )
      {
        for( var i = 0; i < 4; i++ )
        {
          this.create_hash_hori( i, gl1.start, gl1.end, gl2.end, gl2.start );
          if( i === 1 )
            this.create_center( midline );
        }
      }
    }
  

    var new_inner_corners = [ gl1.start, gl1.end, gl2.end, gl2.start ];
    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( new_corners, new_inner_corners );
    this.refresh_snapping_lines( );
  }
}

class RugbyYouth extends RugbyUnion
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Youth"; // Translateable
  static template_id = "rugby_youth"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.noInternals.val = true;

    this.options.Length.val = 50; //maximum length
    this.options.Width.val = 30; //maximum width

  }
}

class RugbyLeague extends square_pitch
{
  static template_type = "Rugby"; // Translateable
  static template_title = "League"; // Translateable
  static template_id = "rugby_league"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.adjust_template_crosses = {
      top: 0.12,
      left: 0,
      right: 0,
      bottom: 0.12
    };
    this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 100; //maximum length
    this.options.Width.val = 68; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.reverseInGoal = {
      get configurable( )
      {
        if( !robot_controller.chosen_robot_id )
          return true;
        if( !robot_controller.robot_has_capability( "bezier_task" ) )
          return false;
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "drive_around_goal" ) >= 0 )
          return true;
        return false;
      },
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
      this.options.reverseInGoal.val = true;
    this.options.removeGoalEnds = {
      adjustable: false,
      configurable: true,
      name: "Remove Goal Ends",
      val: false,
      type: "bool",
      "dontsave": false
    };
    this.options.InGoal = {
      name: "In Goal length",
      val: 11,
      type: "float"
    };
    this.options.goalPoleWidth = {
      adjustable: false,
      name: "goalPoleWidth",
      val: 0.12,
      type: "float",
      "dontsave": true
    };
    this.options.GoalWidth = {
      adjustable: false,
      configurable: false,
      name: "Space between goal spots",
      val: 5.5,
      type: "float",
      "dontsave": true
    };
    //this.options.Goal = {adjustable: false, configurable: true, name: "Goal spots", val: false, type: "bool", "dontsave": true};
    this.options.Center = {
      adjustable: false,
      configurable: true,
      name: "Center spot",
      val: true,
      type: "bool"
    };
    this.options.CenterRadius = {
      adjustable: false,
      configurable: false,
      name: "Center radius",
      val: 0.06,
      type: "float",
      "dontsave": true
    };
    this.options.CenterLine = { 
      configurable: true,
      prev_sibling: "noInternals",
      name: "Center Line",
      val: false,
      type: "bool",
      prev_sibling: "Center"
    };

    this.options.InnerScrumLines = {
      configurable: true,
      name: "20m scrum line length",
      _val: 8,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v > this_class.options.Length.val / 10 )
          v = this_class.options.Length.val / 10;
        this._val = v;
      },
      type: "float",
    };

    this.options.OuterScrumLines = {
      configurable: true,
      name: "10m scrum line length",
      _val: 8,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v > this_class.options.Length.val / 10 )
          v = this_class.options.Length.val / 10;
        this._val = v;
      },
      type: "float",
    };
  }
  static get layout_methods( )
  {

    if( robot_controller.robot_has_capability( "bezier_task" ) &&
      pt.template_options["rugby_league"] &&
      pt.template_options["rugby_league"].indexOf( "drive_around_goal" ) >= 0 )
    {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "free_hand": 0,
        "all_goal_posts": 4,
        "all_corners,all_goal_posts": 8
      };
    }
    else
    {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "free_hand": 0
      };
    }

  }
  refresh_handles( )
  {
    super.refresh_handles( );
    var this_class = this;
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var g1 = new Line( c1, c2 ).unit_vector; //1.00m guideline
    var g2 = g1.rotate_90_cw( );
    var c3 = p[4];
    var c4 = p[7];
    if( this.options.removeGoalEnds.val )
    {

    }
    else
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
  }
  refresh_test_run( corners, ic )
  {
    if( this.options.removeGoalEnds.val )
    {
      this.test_tasks = [ ];
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[0] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[1] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[2] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, ic[3] ) );
    }
    else
    {
      this.test_tasks = [ ];
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[0] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[1] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[2] ) );
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, corners[3] ) );
    }
  }
  create_center( midline )
  {
    var g1 = midline.unit_vector;
    var g2 = g1.rotate_90_cw( );
    var rad = this.options.CenterRadius.val;
    var lw = this.options.LineWidth.val;
    var center = midline.middle;
    if(this.options.CenterLine.val){
      var cL1 = center.add(g2.multiply(0.15));
      var cL2 = center.subtract(g2.multiply(0.15));
      this.tasks.push( new LineTask( this.tasks.length, [ cL1, cL2 ], false, true ) );
      
    }
    if( this.options.Center.val )
    {
      this.tasks.push( new ArcTask( this.tasks.length, [ center.add( g1.multiply( rad + lw / 2 ) ),
        center.add( g1.multiply( -(rad + lw / 2) ) ) ], center, true, false, true ) );
    }
  }
  connect_to_sides( start, end, s1, s2 )
  {
    var line;
    line = new Line( new Line( start, end ).cross_with_line( s1 ), new Line( start, end ).cross_with_line( s2 ) );
    return line;
  }
  create_hash_hori( linenum, ic1, ic2, ic3, ic4, vert )
  {
    var p = this.drawing_points;
    var s1 = new Line( ic1, ic2 );
    var s2 = new Line( ic4, ic3 );
    var s3 = new Line( ic2, ic3 );
    var s4 = new Line( ic1, ic4 );
    var a2 = s3.unit_vector; //parrallel to side 3
    var a1 = a2.rotate_90_ccw( );
    var b2 = s4.unit_vector; //parrallel to side 4
    var b1 = b2.rotate_90_ccw( );
    var g1 = new Line( p[1], p[2] ).unit_vector; //parallel med s1
    var g2 = g1.rotate_90_cw( );
    var h1 = new Line( p[6], p[5] ).unit_vector; //parallel med s2
    var h2 = h1.rotate_90_cw( );
    var i1 = new Line( s4.middle, s3.middle ).unit_vector;
    var i2 = i1.rotate_90_cw( );
    var lw = this.options.LineWidth.val;
    var meterline = this.options.Length.val / 10;
    var space = meterline / 5;
    //var hashlen = meterline - space - lw;
    //var hashlen2 = meterline - space * 2 - lw;
    var hashlen = this.options.OuterScrumLines.val - this.options.LineWidth.val;
    var hashlen2 = this.options.InnerScrumLines.val - this.options.LineWidth.val;
    var new_vert = vert;
    switch( linenum )
    {
      case 0:
        var m1 = a1;
        var m2 = a2;
        var side = -1;
        var direction = -1;
        var start0 = ic3;
        var end0 = ic2;
        var dist = 10;
        break;
      case 1:
        var m1 = a1;
        var m2 = a2;
        var side = -1;
        var direction = 1;
        var start0 = ic2;
        var end0 = ic3;
        var dist = 10 * 2;
        break;
      case 2:
        var m1 = b1;
        var m2 = b2;
        var side = 1;
        var direction = 1;
        var start0 = ic1;
        var end0 = ic4;
        var dist = 10 * 2;
        break;
      case 3:
        var m1 = b1;
        var m2 = b2;
        var side = 1;
        var direction = -1;
        var start0 = ic4;
        var end0 = ic1;
        var dist = 10;
        break;
    }

    if( linenum === 2 )
    {
    }
    else
    {
      for( var i = 0; i < Math.ceil( new_vert.length / 2 ); i++ )
      {
        var buf = new_vert[i];
        new_vert[i] = new_vert[new_vert.length - 1 - i];
        new_vert[new_vert.length - 1 - i] = buf;
      }
    }

    var start = start0.add( m1.multiply( dist * side ) );
    var end = end0.add( m1.multiply( dist * side ) );
    if( direction === 1 )
    {
      var line = this.connect_to_sides( start, end, s1, s2 );
    }
    else
    {
      var line = this.connect_to_sides( start, end, s2, s1 );
    }
    var newend = line.cross_with_line( new_vert[new_vert.length - 1] );
    if(hashlen > 0 && (linenum === 0 || linenum === 3)) {
      for( var i = 0; i < new_vert.length; i++ )
      {
        var newstart = line.cross_with_line( new_vert[i] );
        if( i === 0 )
        {
          var newline = new Line( newstart, newend ).split( hashlen / 2 )[0];
        }
        else if( i === new_vert.length - 1 )
        {
          var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), newend ).split( hashlen )[0];
        }
        else
        {
          var newline = new Line( newstart.add( m2.multiply( hashlen / 2 ) ), newend ).split( hashlen )[0];
        }
        this.tasks.push( newline.toLineTask( this.tasks.length, false, true ) );
      }
    }
    else if (hashlen2 > 0) {
      for( var i = 0; i < new_vert.length - 1; i++ )
      {
        var cross1 = line.cross_with_line( new_vert[i] );
        var cross2 = line.cross_with_line( new_vert[i + 1] );
        var newstart = new Line( cross1, cross2 ).middle;
        var newline = new Line( newstart.subtract( m2.multiply( (hashlen2 / 2 + lw / 2) ) ), newend ).split( hashlen2 + lw )[0];
        this.tasks.push( newline.toLineTask( this.tasks.length, false, true ) );
      }
    }
  }
  draw( )
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var s3 = new Line( c2, c3 );
    var s4 = new Line( c1, c4 );
    var a2 = s3.unit_vector; //parrallel to side 3
    var a1 = a2.rotate_90_ccw( );
    var b2 = s4.unit_vector; //parrallel to side 4
    var b1 = b2.rotate_90_ccw( );
    var g1 = new Line( p[1], p[2] ).unit_vector; //parallel med s1
    var g2 = g1.rotate_90_cw( );
    var h1 = new Line( p[6], p[5] ).unit_vector; //parallel med s2
    var h2 = h1.rotate_90_cw( );
    var i1 = new Line( s4.middle, s3.middle ).unit_vector;
    var i2 = i1.rotate_90_cw( );
    var goalDist = this.options.InGoal.val;
    var lw = this.options.LineWidth.val;
    //goals
    var oc2 = c2.subtract( a2.multiply( goalDist - lw / 2 ) );
    var oc3 = c3.add( a2.multiply( goalDist - lw / 2 ) );
    var oc1 = c1.subtract( b2.multiply( goalDist - lw / 2 ) );
    var oc4 = c4.add( b2.multiply( goalDist - lw / 2 ) );
    var new_corners = [ oc1, oc2, oc3, oc4 ];
    s3 = new Line( oc2, oc3 );
    s4 = new Line( oc1, oc4 );
    var gl1 = this.connect_to_sides( c1, c2, s4, s3 );
    var gl2 = this.connect_to_sides( c4, c3, s4, s3 );
    var meterline = this.options.Length.val / 10;
    var vert = [ ]; //will contain all meterlines (NOT goal lines). Used for placing horisontal hash marks

    if(this.options.reverseInGoal.val){
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }else{
      this.options["fast_test"].val = true;
      this.options["normal_test"].val = true;
    }

    if(this.options.CenterLine.val && this.check === 0){
      this.check = 1;
      this.options.Center.val = false;
    }else if(this.options.Center.val){
      this.check = 0; 
      this.options.CenterLine.val = false;
    }

    if( this.options.removeGoalEnds.val )
    {
      this.start_locations.push( new StartLocation( gl1.start, this.tasks.length ) );
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl1.start, p[1], p[2], gl1.end, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.tasks.push( gl1.toLineTask( this.tasks.length, false, true ) );
      }

      this.start_locations.push( new StartLocation( gl1.end, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ gl1.end, gl2.end ], false, true ) );

      this.start_locations.push( new StartLocation( gl2.end, this.tasks.length ) );
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl2.end, p[5], p[6], gl2.start, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.tasks.push( gl2.reverse().toLineTask( this.tasks.length, false, true ) );
      }

      this.start_locations.push( new StartLocation( gl2.start, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ gl2.start, gl1.start ], false, true ) );
    }
    else
    {
      this.start_locations.push( new StartLocation( oc1, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ oc1, oc2 ], false, true ) );
      this.start_locations.push( new StartLocation( s3.start, this.tasks.length ) );
      this.tasks.push( s3.toLineTask( this.tasks.length, false, true ) );
      this.start_locations.push( new StartLocation( oc3, this.tasks.length ) );
      this.tasks.push( new LineTask( this.tasks.length, [ oc3, oc4 ], false, true ) );
      this.start_locations.push( new StartLocation( s4.end, this.tasks.length ) );
      this.tasks.push( s4.reverse( ).toLineTask( this.tasks.length, false, true ) );
    }

    if( !this.options.removeGoalEnds.val )
    {
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl1.start, p[1], p[2], gl1.end, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ gl1.start, gl1.end ], false, true ) );
      }
    }
//vertical
    if( !this.options.removeGoalEnds.val )
    {
      var goal1 = gl1;
      var goal2 = gl2;
      var s3_new = s3;
      var s4_new = s4;
    }
    else
    {
      var goal1 = gl1.reverse();
      var goal2 = gl2.reverse();
      var s3_new = s4;
      var s4_new = s3;
    }
    var find_mid = [ ];
    var move = meterline;
    for( var i = 0; i < 3; i++ )
    {
      var line = this.connect_to_sides( goal1.start.add( g2.multiply( move ) ), goal1.end.add( g2.multiply( move ) ), s4_new, s3_new );
      vert.push( line );
      find_mid.push( line );
      move += meterline;
    }
    move = -meterline;
    for( var i = 0; i < 3; i++ )
    {
      var line = this.connect_to_sides( s4_new.middle.add( i2.multiply( move ) ), s3_new.middle.add( i2.multiply( move ) ), s4_new, s3_new );
      vert.push( line );
      find_mid.push( line );
      move += meterline;
    }
    move = meterline * 3;
    for( var i = 0; i < 3; i++ )
    {
      var line = this.connect_to_sides( goal2.start.subtract( h2.multiply( move ) ), goal2.end.subtract( h2.multiply( move ) ), s4_new, s3_new );
      vert.push( line );
      find_mid.push( line );
      move -= meterline;
    }
    for( var i = 0; i < vert.length; i += 2 )
    {
      this.tasks.push( vert[i].reverse( ).toLineTask( this.tasks.length, false, true ) );
      if( i === vert.length - 1 )
        break;
      this.tasks.push( vert[i + 1].toLineTask( this.tasks.length, false, true ) );
    }

    if( !this.options.removeGoalEnds.val )
    {
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll( drive_around_goal_posts( this, gl2.start, p[6], p[5], gl2.end, 3, this.tasks.length, this.options.goalPoleWidth.val ) );
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ gl2.start, gl2.end ], false, true ) );
      }
    }
//hori 0-3
    for( var i = 0; i < 4; i++ )
    {
      this.create_hash_hori( i, gl1.start, gl1.end, gl2.end, gl2.start, vert );
      if( i === 1 )
      {
//draw center
        var mid_index = Math.floor( find_mid.length / 2 );
        this.create_center( find_mid[mid_index] );
      }
      else
      {
      }
    }

    var new_inner_corners = [ gl1.start, gl1.end, gl2.end, gl2.start ];
    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( new_corners, new_inner_corners );
    this.refresh_snapping_lines( );
  }
}

class Rippa_Rugby extends square_pitch
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Rippa"; // Translateable
  static template_id = "rippa_rugby"; // no spaces
  static template_image = "img/templates/rippa_rugby.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  
    this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 70; //maximum length
    this.options.Width.val = 40; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
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
    this.tasks = []; 
    this.start_locations = [];

    var p = this.drawing_points;
    //corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    let side1 = new Line(c1, c4);
    let side2 = new Line(c2, c3); 
    let g1 = side1.unit_vector;

    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));

    let mid1 = side1.middle;
    let mid2 = side2.middle;
    
    let tryLineP1 = c1.add(g1.multiply(5));
    let tryLineP2 = c2.add(g1.multiply(5));
    
    let tryLineP3 = c4.subtract(g1.multiply(5));
    let tryLineP4 = c3.subtract(g1.multiply(5));
    
    this.tasks.push(new LineTask(this.tasks.length, [tryLineP1, tryLineP2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [mid2, mid1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [tryLineP3, tryLineP4], false, true));
      
    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( );
    this.refresh_snapping_lines( );
  }
}

class Touch_and_Tag_Rugby extends square_pitch_dont_resize
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Touch and Tag"; // Translateable
  static template_id = "touch_and_tag_rugby_beta"; // no spaces
  static template_image = "img/templates/touch_and_tag_rugby.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  
    this.options.LineWidth.val = 0.1; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 76; //maximum length
    this.options.Width.val = 50; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.GoalWidth.val = 5;
  }


  SortLines(tasks)
  {
     //Sorting the tasks
    
     tasks = tasks.map( t => {
       if( t.start_direction.normalizeAngle >= Math.PI )
         return t.opposite_direction;
       else
         return t;
     } );
     tasks.forEach( t => {
       t.sort_a_90 = parseFloat( t.start_direction.normalizeAngle.toFixed( 5 ) % (Math.PI / 2) );
       t.sort_a = parseFloat( t.start_direction.normalizeAngle.toFixed( 5 ) );

       var p = new Vector( t.start.x, t.start.y );
       p = p.rotate( -t.sort_a );
       t.sort_y = parseFloat( (-p.y).toFixed( 2 ) );
       t.sort_x = parseFloat( p.x.toFixed( 2 ) );
     } );
     tasks = tasks.sort_objects( [ "sort_a_90", "sort_a", "sort_y", "sort_x" ] );

     var last_angle = 0;
     var last_y = 0;
     var index = -1;
     var parts = [ ];
     tasks.forEach( t => {
       if( t.sort_y !== last_y )
       {
         index++;
         parts[index] = [ ];
       }
       if( last_angle !== t.sort_a )
       {
         index++;
         parts[index] = [ ];
       }
       last_angle = t.sort_a;
       last_y = t.sort_y;

       if( parts[index] )
         parts[index].push( t );
     } );
     parts = parts.map( ( a, i ) => {
       if( i % 2 )
       {
         a.reverse();
         return a.map( t => {
           t.ends = t.ends.reverse();
           return t
         } );
       }
       else
         return a;
     } );
    tasks = parts.flat();
    return tasks;
  }

  DrawFieldLines(c1, c2, g1, side)
  {
    let field_tasks = [];
    let g2;
    if(side === 1)
      g2 = g1.rotate_90_ccw();
    else
      g2 = g1.rotate_90_cw();

    let fieldLineRowPoint1 = c1.add(g1.multiply(8));
    let fieldLineRowPoint2 = c1.add(g1.multiply(13));

    let fieldLineRowPoint3 = c2.add(g1.multiply(8));
    let fieldLineRowPoint4 = c2.add(g1.multiply(13));

    let centerFieldPoint1 = new Line(fieldLineRowPoint1, fieldLineRowPoint3).middle;
    let fieldLineCenter1P1 = centerFieldPoint1.add(g1.multiply(5).rotate_90_cw());
    let fieldLineCenter1P2 = centerFieldPoint1.add(g1.multiply(5).rotate_90_ccw());
    field_tasks.push(new LineTask(field_tasks.length, [fieldLineCenter1P1, fieldLineCenter1P2], false, true));

    let centerFieldPoint2 = new Line(fieldLineRowPoint2, fieldLineRowPoint4).middle;
    let fieldLineCenter2P1 = centerFieldPoint2.add(g1.multiply(5).rotate_90_cw());
    let fieldLineCenter2P2 = centerFieldPoint2.add(g1.multiply(5).rotate_90_ccw());
    field_tasks.push(new LineTask(field_tasks.length, [fieldLineCenter2P1, fieldLineCenter2P2], false, true));
    let centerHoriLineP1 = centerFieldPoint2.add(g1.multiply(0.15));
    let centerHoriLineP2 = centerFieldPoint2.subtract(g1.multiply(0.15));
    field_tasks.push(new LineTask(field_tasks.length, [centerHoriLineP1, centerHoriLineP2], false, true));

    let farCenterFieldLine1 = centerFieldPoint2.add(g1.multiply(15));
    let fieldLineCenter3P1 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_cw());
    let fieldLineCenter3P2 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_ccw());
    field_tasks.push(new LineTask(field_tasks.length, [fieldLineCenter3P1, fieldLineCenter3P2], false, true));
  
    for(let i = 0; i < 2; i++)
    {
      if(i % 2)
      {
        let fieldLine1Center = fieldLineRowPoint1.add(g2.multiply(10));
        let fieldLine1P1 = fieldLine1Center.add(g1.multiply(5).rotate_90_cw());
        let fieldLine1P2 = fieldLine1Center.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLine1P1, fieldLine1P2], false, true));


        let fieldLine2Center = fieldLineRowPoint2.add(g2.multiply(10));
        let fieldLine2P1 = fieldLine2Center.add(g1.multiply(5).rotate_90_cw());
        let fieldLine2P2 = fieldLine2Center.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLine2P1, fieldLine2P2], false, true));

        let horiLineP1 = fieldLine2Center.add(g1.multiply(2.5));
        let horiLineP2 = fieldLine2Center.subtract(g1.multiply(2.5));
        field_tasks.push(new LineTask(field_tasks.length, [horiLineP1, horiLineP2], false, true));

        let farCenterFieldLine1 = fieldLine2Center.add(g1.multiply(15));
        let fieldLineCenter3P1 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_cw());
        let fieldLineCenter3P2 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLineCenter3P1, fieldLineCenter3P2], false, true));
        let horiLineP3 = farCenterFieldLine1.add(g1.multiply(2.5));
        let horiLineP4 = farCenterFieldLine1.subtract(g1.multiply(2.5));
        field_tasks.push(new LineTask(field_tasks.length, [horiLineP3, horiLineP4], false, true));

      }
      else
      {
        let fieldLine3Center = fieldLineRowPoint3.subtract(g2.multiply(10));
        let fieldLine3P1 = fieldLine3Center.add(g1.multiply(5).rotate_90_cw());
        let fieldLine3P2 = fieldLine3Center.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLine3P1, fieldLine3P2], false, true));

        let fieldLine4Center = fieldLineRowPoint4.subtract(g2.multiply(10));
        let fieldLine4P1 = fieldLine4Center.add(g1.multiply(5).rotate_90_cw());
        let fieldLine4P2 = fieldLine4Center.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLine4P1, fieldLine4P2], false, true));
    
        let horiLineP1 = fieldLine4Center.add(g1.multiply(2.5));
        let horiLineP2 = fieldLine4Center.subtract(g1.multiply(2.5));
        field_tasks.push(new LineTask(field_tasks.length, [horiLineP1, horiLineP2], false, true));


        let farCenterFieldLine1 = fieldLine4Center.add(g1.multiply(15));
        let fieldLineCenter3P1 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_cw());
        let fieldLineCenter3P2 =  farCenterFieldLine1.add(g1.multiply(5).rotate_90_ccw());
        field_tasks.push(new LineTask(field_tasks.length, [fieldLineCenter3P1, fieldLineCenter3P2], false, true));
        let horiLineP3 = farCenterFieldLine1.add(g1.multiply(2.5));
        let horiLineP4 = farCenterFieldLine1.subtract(g1.multiply(2.5));
        field_tasks.push(new LineTask(field_tasks.length, [horiLineP3, horiLineP4], false, true));
      }  
    }
  
    return field_tasks;
  }

  draw() 
  {
    delete this.calculated_drawing_points;
    this.tasks = [];
    this.start_locations = [];

    var p = this.drawing_points;
    //corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    let goal1 = p[1];
    let goal2 = p[2];
    let goal3 = p[5];
    let goal4 = p[6];

    let side1 = new Line(c1, c4);
    let side2 = new Line(c3, c2); 
    let g1 = side1.unit_vector;
    let g2 = side2.unit_vector;

    // this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    
    let field_tasks = [];
    let mid1 = side1.middle;
    let mid2 = side2.middle;
    let mid = new Line(mid1, mid2).middle;
    let centerLine1 = mid.add(g1.multiply(0.15));
    let centerLine2 =  mid.subtract(g1.multiply(0.15));
    
    let tryLineP1 = c1.add(g1.multiply(3));
    let tryLineP2 = c2.add(g1.multiply(3));
    
    let tryLineP3 = c4.subtract(g1.multiply(3));
    let tryLineP4 = c3.subtract(g1.multiply(3));

    let goalLineP1 = goal1.add(g1.multiply(3));
    let goalLineP2 = goal2.add(g1.multiply(3));
    let goalLineP3 = goal3.subtract(g1.multiply(3));
    let goalLineP4 = goal4.subtract(g1.multiply(3));

    // this.tasks.push(new LineTask(this.tasks.length, [tryLineP1, tryLineP2], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [goal1, goalLineP1], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [goalLineP2, goal2], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [mid2, mid1], false, true));
    // field_tasks.push(new LineTask(this.tasks.length, [centerLine1, centerLine2], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [tryLineP3, tryLineP4], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [goal4, goalLineP4], false, true));
    // this.tasks.push(new LineTask(this.tasks.length, [goalLineP3, goal3], false, true));

    // field_tasks.pushAll(this.DrawFieldLines(c1, c2, g1, 1));
    // field_tasks.pushAll(this.DrawFieldLines(c4, c3, g2, 0));
    // field_tasks = this.SortLines(field_tasks);
    // this.tasks.pushAll(field_tasks);
      
    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( );
    this.refresh_snapping_lines( );
  }
}


class TouchRugbyUK extends  square_pitch
{
  static template_type = "Rugby"; // Translateable
  static template_title = "Touch UK"; // Translateable
  static template_id = "touch_rugby_uk"; // no spaces
  static template_image = "img/templates/touch_rugby_icon_black.png"; // no spaces

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    let this_class = this;



    this.options.Length.val = 70; //maximum length
    this.options.Width.val = 50; //maximum width
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.InGoalLength = {
      name: "In goal length",
      configurable: false,
      val: 7,
      type: "float",
    };

    this.options.ShowInterchangeBoxes = {
      name: "Show interchange Box",
      configurable: true,
      val: true,
      existingJobDefault: !this.val,
      type: "bool",
      prev_sibling: "ShowCrowdLines",
    };
    this.options.InterchangeBoxWidth = {
      name: "Interchange box width",
      configurable: false,
      val: 2,
      type: "float",
    };
    this.options.InterchangeBoxLength = {
      name: "Interchange box length",
      configurable: false,
      val: 20,
      type: "float",
    };
    this.options.InterChangeBoxToField = {
      name: "Substitution box to field",
      configurable: false,
      val: 1,
      type: "float",

    };
    this.options.SevenMeterDashedWidth = {
      name: "The distance between 7m dashed and try line",
      configurable: false,
      val: 7,
      type: "float"
    };
    this.options.TenMeterDashedWidth = {
      configurable: false,
      name: "The distance between 10m dashed and center line",
      val: 10,
      type: "float"
    };
  
    this.options.DashedLength = {
      configurable: false,
      name: "Dashed length",
      val: 2,
      type: "float",
    };
    this.options.DashedSpace = {
      name: "Dashed space length",
      configurable: false,
      val: 2,
      type: "float",
    };
    this.options.DeadBallArea = {
      name: "Show deadball area",
      configurable: true,
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if(v) {
          this_class.options.ShowSinBins.configurable = true;
        }
        else {
          this_class.options.ShowSinBins.configurable = false;
        }
      }
    };
    this.options.DeadBallLineWidth = {
      name: "Deadball lines distances to the field end",
      configurable: false,
      val: 7,
      type: "float",
    };
    this.options.ShowSinBins = {
      name: "Show sin bins",
      configurable: this_class.options.DeadBallArea.val,
      val: true,
      existingJobDefault: false,
      type: "bool",
      prev_sibling: "DeadBallArea",
    }
    this.options.SinBinLength = {
      name: "Sin bin length",
      configurable: false,
      val: 10,
      type: "float"
    };
    this.options.SinBinWidth = {
      name: "Sin bin width",
      configurable: false,
      val: 3,
      type: "float"
    };
    this.options.ShowCrowdLines = {
      name: "Show crowd area",
      configurable: true,
      val: true,
      existingJobDefault: false,
      type: "bool",
    };
    this.options.HorizontalCrowdLinesToFielde = {
      name: "Distances for horizontal crowd lines",
      configurable: false,
      val: 10 + this.options.DeadBallLineWidth.val,
      type: "float",
    };
    this.options.VerticalCrowdLinesToFielde = {
      name: "Distances for vertical crowd lines",
      configurable: false,
      val: 8,
      type: "float",
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


  drawDashedLines(start, end )
  {

    // var p = this.drawing_points;
    // var c1 = p[0];
    // var c2 = p[3];

    // if(direction === "top2bottom") {
    //   let newStart = start;
    //   start = end;
    //   end = newStart;
    // }

    // const vertical = new Line(c1, c2).unit_vector;
    // let end1MBottom = start.subtract(vertical.multiply(1));
    // let end1MTop = end.add(vertical.multiply(1));
    // let dashStart = start.subtract(vertical.multiply(3.1));
    // let dashEnd = end.add(vertical.multiply(3.1));


    // this.tasks.push(new LineTask(this.tasks.length, [start, end1MBottom], false, true));

    let task = new LineTask(this.tasks.length, [start, end], false, true);
    task.task_options.push( new FloatRobotAction( "dashed_length", this.options.DashedLength.val ) );
    task.task_options.push( new FloatRobotAction( "dashed_space", this.options.DashedSpace.val ) );


    // this.tasks.push(new LineTask(this.tasks.length, [end1MTop, end], false, true));

    
    return task;
  }

  createCrowdLines(c1, c2, c3, c4, verticalVector) {

    const horizontalVector = verticalVector.rotate_90_cw();

    const newC1 = c1.subtract(horizontalVector.multiply(this.options.HorizontalCrowdLinesToFielde.val)).subtract(verticalVector.multiply(this.options.VerticalCrowdLinesToFielde.val));
    const newC2 = c2.subtract(horizontalVector.multiply(this.options.HorizontalCrowdLinesToFielde.val)).add(verticalVector.multiply(this.options.VerticalCrowdLinesToFielde.val));
    const newC3 = c3.add(horizontalVector.multiply(this.options.HorizontalCrowdLinesToFielde.val)).add(verticalVector.multiply(this.options.VerticalCrowdLinesToFielde.val));
    const newC4 = c4.add(horizontalVector.multiply(this.options.HorizontalCrowdLinesToFielde.val)).subtract(verticalVector.multiply(this.options.VerticalCrowdLinesToFielde.val));

    this.tasks.push( this.drawDashedLines( newC3, newC4 ));
    this.tasks.push( this.drawDashedLines( newC4, newC1 ));
    this.tasks.push( this.drawDashedLines( newC1, newC2 ));
    this.tasks.push( this.drawDashedLines( newC2, newC3 ));


  }

  createSinBinBox(start, verticalVector, whichBox) {

    if(!this.options.ShowSinBins.val || !this.options.DeadBallArea.val){
      return;
    }

    const horizontalVec = verticalVector.rotate_90_cw();
    let boxTop, boxBottom, bottomOnLine;

    if(whichBox === "topRight") {
      boxTop = start.subtract(horizontalVec.multiply(this.options.SinBinWidth.val));
      boxBottom = boxTop.add(verticalVector.multiply(this.options.SinBinLength.val));
      bottomOnLine = boxBottom.add(horizontalVec.multiply(this.options.SinBinWidth.val));      
    }
    else if(whichBox === "bottomRight") {
      boxTop = start.subtract(horizontalVec.multiply(this.options.SinBinWidth.val));
      boxBottom = boxTop.subtract(verticalVector.multiply(this.options.SinBinLength.val));
      bottomOnLine = boxBottom.add(horizontalVec.multiply(this.options.SinBinWidth.val));   
    }
    else if(whichBox === "bottomLeft") {
      boxTop = start.add(horizontalVec.multiply(this.options.SinBinWidth.val));
      boxBottom = boxTop.subtract(verticalVector.multiply(this.options.SinBinLength.val));
      bottomOnLine = boxBottom.subtract(horizontalVec.multiply(this.options.SinBinWidth.val));   
    }
    else {
      boxTop = start.add(horizontalVec.multiply(this.options.SinBinWidth.val));
      boxBottom = boxTop.add(verticalVector.multiply(this.options.SinBinLength.val));
      bottomOnLine = boxBottom.subtract(horizontalVec.multiply(this.options.SinBinWidth.val)); 
    }

    this.tasks.push( new LineTask( this.tasks.length, [bottomOnLine, boxBottom], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [boxBottom, boxTop], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [boxTop, start], false, true));


  }

  createScalate(c1, c2, c3, c4, verticalVector) {

    const horizontalVec = verticalVector.rotate_90_cw();

    let inGoalTopRight = c1.subtract(horizontalVec.multiply(this.options.InGoalLength.val));
    let inGoalTopLeft = c4.add(horizontalVec.multiply(this.options.InGoalLength.val));
    let inGoalBottomRight = c2.subtract(horizontalVec.multiply(this.options.InGoalLength.val));
    let inGoalBottomLeft = c3.add(horizontalVec.multiply(this.options.InGoalLength.val));

    if(!this.options.DeadBallArea.val)
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

    }
    else {
      this.tasks.push( new LineTask( this.tasks.length, [ inGoalTopRight, inGoalBottomRight ], false, true ) );
      this.createSinBinBox(inGoalBottomRight, verticalVector, "bottomRight" );
      this.tasks.push( new LineTask( this.tasks.length, [ inGoalBottomRight, inGoalBottomLeft ], false, true ) );
      this.createSinBinBox(inGoalBottomLeft, verticalVector, "bottomLeft" );
      this.tasks.push( new LineTask( this.tasks.length, [ inGoalBottomLeft, inGoalTopLeft ], false, true ) );
      this.createSinBinBox(inGoalTopLeft, verticalVector, "topLeft" );
      this.tasks.push( new LineTask( this.tasks.length, [ inGoalTopLeft, inGoalTopRight ], false, true ) );
      this.createSinBinBox( inGoalTopRight, verticalVector, "topRight" );
    }

  }


  createInterChargeBox(center, verticalVector, side) {

    let verticalVec = verticalVector;

    if(side === "bottom")
      verticalVec = verticalVec.multiply(-1);

    const horizontalVector = verticalVec.rotate_90_cw();


    let bottomRight = center.add(horizontalVector.multiply(this.options.InterchangeBoxLength.val / 2));
    let bottomLeft = center.subtract(horizontalVector.multiply(this.options.InterchangeBoxLength.val / 2));
    let topRight = bottomRight.subtract(verticalVec.multiply(this.options.InterchangeBoxWidth.val));
    let topLeft = bottomLeft.subtract(verticalVec.multiply(this.options.InterchangeBoxWidth.val));



    this.tasks.push(new LineTask( this.tasks.length, [bottomLeft, bottomRight], false, true));
    this.tasks.push(new LineTask( this.tasks.length, [bottomRight, topRight], false, true));
    this.tasks.push(new LineTask( this.tasks.length, [topRight, topLeft], false, true));
    this.tasks.push(new LineTask( this.tasks.length, [topLeft, bottomLeft], false, true));

  }

  createInsideField(c1, c2, c3, c4, verticalVector) {

    const horizontalVec = verticalVector.rotate_90_cw();
    const topCenter = new Line(c1, c4).middle;
    const bottomCenter = new Line( c2, c3).middle;
    const center = new Line(topCenter, bottomCenter).middle;

    const sevenMeterRightTop = c1.add(horizontalVec.multiply(this.options.SevenMeterDashedWidth.val));
    const sevenMeterRightBottom = c2.add(horizontalVec.multiply(this.options.SevenMeterDashedWidth.val));

    const sevenMeterLeftTop = c4.subtract(horizontalVec.multiply(this.options.SevenMeterDashedWidth.val));
    const sevenMeterLeftBottom = c3.subtract(horizontalVec.multiply(this.options.SevenMeterDashedWidth.val));

    const tenMeterRightTop = topCenter.subtract(horizontalVec.multiply(this.options.TenMeterDashedWidth.val));
    const tenMeterRightBottom = bottomCenter.subtract(horizontalVec.multiply(this.options.TenMeterDashedWidth.val));

    const tenMeterLeftTop = topCenter.add(horizontalVec.multiply(this.options.TenMeterDashedWidth.val));
    const tenMeterLeftBottom = bottomCenter.add(horizontalVec.multiply(this.options.TenMeterDashedWidth.val));
    // Substitions box
    let topBoxMiddle = center.subtract(verticalVector.multiply(this.options.Width.val / 2 + this.options.InterChangeBoxToField.val));
    let bottomBoxMiddle = center.add(verticalVector.multiply(this.options.Width.val / 2 + this.options.InterChangeBoxToField.val));



    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    this.tasks.push(this.drawDashedLines( sevenMeterRightBottom, sevenMeterRightTop ));

    if(this.options.ShowInterchangeBoxes.val){
      this.createInterChargeBox(topBoxMiddle, verticalVector, "right");
    }

    this.tasks.push(this.drawDashedLines( tenMeterRightTop, tenMeterRightBottom ));
    this.tasks.push(new LineTask(this.tasks.length, [bottomCenter, topCenter], false, true));
    this.tasks.push(this.drawDashedLines(tenMeterLeftTop, tenMeterLeftBottom ));

    if(this.options.ShowInterchangeBoxes.val) {
      this.createInterChargeBox(bottomBoxMiddle, verticalVector, "bottom");
    }

    this.tasks.push(this.drawDashedLines( sevenMeterLeftBottom, sevenMeterLeftTop ));
    this.tasks.push(new LineTask( this.tasks.length, [c4, c3], false, true));

  }
  
  draw() {

    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var verticalVector = (new Line( c1, c2 )).unit_vector;
    const horizontalVec = verticalVector.rotate_90_cw();

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.createScalate(c1, c2, c3, c4, verticalVector);
    this.createInsideField(c1, c2, c3, c4, verticalVector);

    if(this.options.ShowCrowdLines.val)  {
      this.createCrowdLines(c1, c2, c3, c4, verticalVector);
    }






    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}