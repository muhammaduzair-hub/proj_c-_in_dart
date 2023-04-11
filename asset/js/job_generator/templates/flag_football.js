/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global s2p2 */
/* global this, five_degrees_equal */
class Flag_football extends square_pitch
{
  static template_type = "Football"; // Translateable
  static template_title = "Flag"; // Translateable
  static template_id = "flag_football"; // no spaces
  static template_image = "img/templates/flag_football_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.Length.val = (360).foot2meter(); //max length
    this.options.Width.val = (160).foot2meter(); //max width

    this.options.EndZone = {
      configurable: true,
      "dontsave": false,
      name: "End Zone",
      type: "bool",
      val: true
    }
    this.options.EndZoneLength = {
      get configurable()
      {
        return this_class.options.EndZone.val;
      },
      "dontsave": false,
      name: "End Zone Length",
      type: "float",
      _val: (30).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }

    this.options.DoubleGoalline = {
      configurable: true,
      "dontsave": false,
      name: "Double Goal Line",
      type: "bool",
      val: true
    }

    this.options.fiveyd = {
      configurable: false,
      "dontsave": false,
      name: "5 yd line",
      type: "float",
      _val: (15).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
    this.options.tenyd = {
      configurable: false,
      "dontsave": false,
      name: "10 yd line",
      type: "float",
      _val: (15).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
    this.options.twentyyd = {
      configurable: false,
      "dontsave": false,
      name: "20 yd line",
      type: "float",
      _val: (30).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
    this.options.twentyfiveyd = {
      configurable: false,
      "dontsave": false,
      name: "25 yd line",
      type: "float",
      _val: (75).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
    this.options.fifteenyd = {
      configurable: false,
      "dontsave": false,
      name: "15 yd line from mid",
      type: "float",
      _val: (45).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
    this.options.ydline_len = {
      configurable: false,
      "dontsave": false,
      name: "End Zone Length",
      type: "float",
      _val: (6).foot2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }

    this.options.ydline_cross = {
      configurable: true,
      "dontsave": false,
      name: "20 yd line as cross",
      type: "bool",
      val: false
    }

    this.options.Youth = {
      configurable: true,
      "dontsave": false,
      name: "youth",
      type: "bool",
      val: false
    }

    this.options.Hashmarks = {
      configurable: true,
      "dontsave": false,
      name: "Hash Markers",
      type: "bool",
      val: false
    }

    this.options.hash_dist_outer = {
      configurable: false,
      "dontsave": false,
      name: "Hashmark dist",
      type: "float",
      _val: (15).yard2meter(),
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val === 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      }
    }
  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0.005, 1.01 ),
        new Vector( 0.005, 0.25 )
      ]
    }
  }

  ydline_as_cross( line )
  {
    var g1 = line.unit_vector;
    var g2 = g1.rotate_90_cw();
    var len = (this.options.ydline_len.val - this.options.LineWidth.val) / 2;
    var wid = len / 2;

    var mid = line.middle;
    var l1 = new Line( mid.subtract( g1.multiply( len ) ).subtract( g2.multiply( wid ) ), mid.add( g1.multiply( len ) ).add( g2.multiply( wid ) ) );
    var l2 = new Line( mid.subtract( g1.multiply( len ) ).add( g2.multiply( wid ) ), mid.add( g1.multiply( len ) ).subtract( g2.multiply( wid ) ) );

    this.tasks.push( l1.toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );
  }

  make_hashmarks( gl_1, gl_2 )
  {
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[3];
      var c3 = p[4];
      var c4 = p[7];
      var s1 = new Line( c1, c2 );
      var s2 = new Line( c3, c4 );
      var s3 = new Line( c2, c3 );
      var s4 = new Line( c4, c1 );

      var lw = this.options.LineWidth.val;

      var c1 = gl_1.start;
      var c2 = gl_1.end;
      var c3 = gl_2.start;
      var c4 = gl_2.end;

      var s1_g1 = s1.unit_vector;
      var s1_g2 = s1_g1.rotate_90_cw();
      var s2_g1 = s2.reverse().unit_vector;
      var s2_g2 = s2_g1.rotate_90_cw();
    }
    var s1_left = c2.subtract( s1_g1.multiply( this.options.hash_dist_outer.val + lw ) );
    var s2_left = c3.subtract( s2_g1.multiply( this.options.hash_dist_outer.val + lw ) );
    var s1_right = c1.add( s1_g1.multiply( this.options.hash_dist_outer.val + lw ) );
    var s2_right = c4.add( s2_g1.multiply( this.options.hash_dist_outer.val + lw ) );

    var l1 = new Line( s1_left, s2_left );
    var l2 = new Line( s1_right, s2_right );

    var counter = 32;
    var hashlen = l1.length / counter - lw;
    var space = l1.length / counter + lw;

    this.tasks.push( l1.toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );

    this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_offset", -hashlen / 2 ) );
    this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_length", hashlen ) );
    this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_space", space ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", -hashlen / 2 ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", hashlen ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", space ) );
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
    var endlen = this.options.EndZoneLength.val + this.options.LineWidth.val / 2;
    var yd5 = this.options.fiveyd.val;
    var yd10 = this.options.tenyd.val + yd5;
    var yd20 = this.options.twentyyd.val + yd10;
    var yd25 = this.options.twentyfiveyd.val;
    var ydlen = this.options.ydline_len.val;
    var yd15 = this.options.fifteenyd.val;

    // calculate goal lines
    var s1_goal_line = new Line( c1.add( s1_g2.multiply( endlen ) ), c2.add( s1_g2.multiply( endlen ) ) );
    var s2_goal_line = new Line( c3.subtract( s2_g2.multiply( endlen ) ), c4.subtract( s2_g2.multiply( endlen ) ) );
    var new_s3 = new Line( s1_goal_line.end, s2_goal_line.start );
    var new_s4 = new Line( s2_goal_line.end, s1_goal_line.start );

    // double goal lines
    var s1_gl_1 = new Line( s1_goal_line.start.add( s1_g2.multiply( -(this.options.LineWidth.val - 0.01) ) ), s1_goal_line.end.add( s1_g2.multiply( -(this.options.LineWidth.val - 0.01) ) ) );
    var s1_gl_2 = new Line( s1_goal_line.start.add( s1_g2.multiply( this.options.LineWidth.val - 0.01 ) ), s1_goal_line.end.add( s1_g2.multiply( this.options.LineWidth.val - 0.01 ) ) );

    var s2_gl_1 = new Line( s2_goal_line.start.add( s2_g2.multiply( -(this.options.LineWidth.val - 0.01) ) ), s2_goal_line.end.add( s2_g2.multiply( -(this.options.LineWidth.val - 0.01) ) ) );
    var s2_gl_2 = new Line( s2_goal_line.start.add( s2_g2.multiply( this.options.LineWidth.val - 0.01 ) ), s2_goal_line.end.add( s2_g2.multiply( this.options.LineWidth.val - 0.01 ) ) );

    // small yard lines
    var s1_mid = s1_goal_line.middle;
    var s1_yd5 = new Line( s1_mid.add( s1_g2.multiply( yd5 ) ).add( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s1_mid.add( s1_g2.multiply( yd5 ) ).subtract( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );
    var s1_yd10 = new Line( s1_mid.add( s1_g2.multiply( yd10 ) ).add( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s1_mid.add( s1_g2.multiply( yd10 ) ).subtract( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );
    var s1_yd20 = new Line( s1_mid.add( s1_g2.multiply( yd20 ) ).add( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s1_mid.add( s1_g2.multiply( yd20 ) ).subtract( s1_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );

    var s2_mid = s2_goal_line.middle;
    var s2_yd5 = new Line( s2_mid.subtract( s2_g2.multiply( yd5 ) ).add( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s2_mid.subtract( s2_g2.multiply( yd5 ) ).subtract( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );
    var s2_yd10 = new Line( s2_mid.subtract( s2_g2.multiply( yd10 ) ).add( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s2_mid.subtract( s2_g2.multiply( yd10 ) ).subtract( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );
    var s2_yd20 = new Line( s2_mid.subtract( s2_g2.multiply( yd20 ) ).add( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ), s2_mid.subtract( s2_g2.multiply( yd20 ) ).subtract( s2_g1.multiply( (ydlen - this.options.LineWidth.val) / 2 ) ) );

    // 25 yd lines
    var s1_25yd = new Line( s1_goal_line.start.add( s1_g2.multiply( yd25 ) ), s1_goal_line.end.add( s1_g2.multiply( yd25 ) ) );
    var s2_25yd = new Line( s2_goal_line.start.subtract( s2_g2.multiply( yd25 ) ), s2_goal_line.end.subtract( s2_g2.multiply( yd25 ) ) );

    // 15 yard from mid
    var middle = new Line( s3.middle, s4.middle );
    var s1_15yd = new Line( middle.start.subtract( s3_g2.multiply( yd15 ) ), middle.end.subtract( s4_g2.multiply( yd15 ) ) );
    var s2_15yd = new Line( middle.start.add( s3_g2.multiply( yd15 ) ), middle.end.add( s4_g2.multiply( yd15 ) ) );

    //borders
    if( !this.options.EndZone.val )
    {
      if( this.options.DoubleGoalline.val )
      {
        this.tasks.push( s1_gl_1.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( s1_gl_2.reverse().toLineTask( this.tasks.length, false, true ) );
      }
      else
        this.tasks.push( s1_goal_line.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( new_s3.toLineTask( this.tasks.length, false, true ) );

      if( this.options.DoubleGoalline.val )
      {
        this.tasks.push( s2_gl_2.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( s2_gl_1.reverse().toLineTask( this.tasks.length, false, true ) );
      }
      else
        this.tasks.push( s2_goal_line.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( new_s4.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( s1_yd5.toLineTask( this.tasks.length, false, true ) );
      if( this.options.Youth.val )
        this.ydline_as_cross( s1_yd10 );
      else
      {
        this.tasks.push( s1_yd10.toLineTask( this.tasks.length, false, true ) );

        if( this.options.ydline_cross.val )
          this.ydline_as_cross( s1_yd20 );
        else
          this.tasks.push( s1_yd20.toLineTask( this.tasks.length, false, true ) );
      }
      this.tasks.push( s1_25yd.toLineTask( this.tasks.length, false, true ) );

      if( !this.options.Youth.val )
        this.tasks.push( s1_15yd.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( middle.toLineTask( this.tasks.length, false, true ) );

      if( !this.options.Youth.val )
        this.tasks.push( s2_15yd.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( s2_25yd.toLineTask( this.tasks.length, false, true ) );

      if( this.options.Youth.val )
        this.ydline_as_cross( s2_yd10 );
      else
      {
        this.tasks.push( s2_yd10.toLineTask( this.tasks.length, false, true ) );

        if( this.options.ydline_cross.val )
          this.ydline_as_cross( s2_yd20 );
        else
          this.tasks.push( s2_yd20.toLineTask( this.tasks.length, false, true ) );
      }
      this.tasks.push( s2_yd5.toLineTask( this.tasks.length, false, true ) );

      if( this.options.Hashmarks.val )
        this.make_hashmarks( s1_goal_line, s2_goal_line );
    }
    else
    {
      this.tasks.push( s1.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( s3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( s2.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( s4.toLineTask( this.tasks.length, false, true ) );

      if( this.options.DoubleGoalline.val )
      {
        this.tasks.push( s1_gl_1.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( s1_gl_2.reverse().toLineTask( this.tasks.length, false, true ) );
      }
      else
        this.tasks.push( s1_goal_line.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( s1_yd5.toLineTask( this.tasks.length, false, true ) );

      if( this.options.Youth.val )
        this.ydline_as_cross( s1_yd10 );
      else
      {

        this.tasks.push( s1_yd10.toLineTask( this.tasks.length, false, true ) );

        if( this.options.ydline_cross.val )
          this.ydline_as_cross( s1_yd20 );
        else
          this.tasks.push( s1_yd20.toLineTask( this.tasks.length, false, true ) );
      }
      this.tasks.push( s1_25yd.toLineTask( this.tasks.length, false, true ) );

      if( !this.options.Youth.val )
        this.tasks.push( s1_15yd.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( middle.toLineTask( this.tasks.length, false, true ) );

      if( !this.options.Youth.val )
        this.tasks.push( s2_15yd.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( s2_25yd.toLineTask( this.tasks.length, false, true ) );

      if( this.options.Youth.val )
        this.ydline_as_cross( s2_yd10 );
      else
      {
        if( this.options.ydline_cross.val )
          this.ydline_as_cross( s2_yd20 );
        else
          this.tasks.push( s2_yd20.toLineTask( this.tasks.length, false, true ) );

        this.tasks.push( s2_yd10.toLineTask( this.tasks.length, false, true ) );
      }
      this.tasks.push( s2_yd5.toLineTask( this.tasks.length, false, true ) );

      if( this.options.DoubleGoalline.val )
      {
        this.tasks.push( s2_gl_2.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( s2_gl_1.reverse().toLineTask( this.tasks.length, false, true ) );
      }
      else
        this.tasks.push( s2_goal_line.toLineTask( this.tasks.length, false, true ) );

      if( this.options.Hashmarks.val )
        this.make_hashmarks( s1_goal_line, s2_goal_line );
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}

class SE_Flag_Football extends square_pitch_dont_resize
{
  static template_type = "Flag"; // Translateable
  static template_title = "Football SE"; // Translateable
  static template_id = "se_flag_football_beta"; // no spaces
  static template_image = "img/templates/se_flag_football.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;
    this.options.Length.val = (76).yard2meter(); //max length
    this.options.Width.val = (31).yard2meter(); //max width

    this.options.safetyArea = {
      configurable: true,
      name: "Safety area",
      type: "bool",
      val: true,
    }

    this.options.TeamArea = {
      configurable: true,
      name: "Team Area",
      type: "bool",
      val: true
    }

    this.options.check = {
      val: true,
      type: "bool",
      name: "check"
    }

  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    let tasks = [];
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    let p1
    let p2
    let p3
    let p4

    let g1 = new Line( c1, c4 ).unit_vector;
    let dash_length = 0.30;
    let dash_space = 0.20;

    let mid1;
    let mid2;
    let endzone1;
    let endzone2;
 
    let endzoneMid;
    
    if(!this.options.safetyArea.val)
    {
      
      this.options.TeamArea.configurable = false;
      var p = this.drawing_points;
      let length = (76).yard2meter();
    
      if(length.round() === this.options.Length.val.round())
      {
        this.options.Length.val = (70).yard2meter();
        this.options.Width.val = (25).yard2meter();
      }

      mid1 = new Line( c1, c4 ).middle;
      mid2 = new Line( c2, c3 ).middle;
      this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );

  
    }
    else
    {
      this.options.TeamArea.configurable = true;
      let length = (70).yard2meter();
    
      if(length.round() === this.options.Length.val.round())
      {
        this.options.Length.val = (76).yard2meter();
        this.options.Width.val = (31).yard2meter();
      }

      this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
      for(let i = 1; i < 5; i++)
      {
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - i].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      } 

      p1 = c1.add(g1.multiply( (3).yard2meter() ));
      p1 = p1.add(g1.multiply( (3).yard2meter() ).rotate_90_ccw() );
      
      p2 = c2.add(g1.multiply( (3).yard2meter() ));
      p2 = p2.add(g1.multiply( (3).yard2meter() ).rotate_90_cw() );

      p3 = c3.subtract(g1.multiply( (3).yard2meter() ));
      p3 = p3.add(g1.multiply( (3).yard2meter() ).rotate_90_cw() );

      p4 = c4.subtract(g1.multiply( (3).yard2meter() ));
      p4 = p4.add(g1.multiply( (3).yard2meter() ).rotate_90_ccw() );

    /*
      p2 = p1.add( g1.multiply( (25).yard2meter() ).rotate_90_ccw());

      p3 = p2.add(g1.multiply( (70).yard2meter() ));

      p4 = p1.add(g1.multiply( (70).yard2meter() ));
    */
      
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p2, p3 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ p4, p1 ], false, true ) );
      mid1 = new Line( p1, p4 ).middle;
      mid2 = new Line( p2, p3 ).middle;
      
      

      let teamGuidePoint1;
      let teamGuidePoint2;
      let teamGuidePoint3;
      let teamGuidePoint4; 

      if(this.options.TeamArea.val)
      {
        for(let i = 0; i < 2; i++)
        {
          if( i % 2 )
          {
            teamGuidePoint3 = c2.add(g1.multiply((18).yard2meter()));
            teamGuidePoint1 = c3.subtract(g1.multiply((18).yard2meter()));
            teamGuidePoint2 = teamGuidePoint1.add(g1.multiply( (5).yard2meter() - this.options.LineWidth.val ).rotate_90_ccw());
            teamGuidePoint4 = teamGuidePoint3.add(g1.multiply( (5).yard2meter() - this.options.LineWidth.val ).rotate_90_ccw());
          }
          else
          {
            teamGuidePoint1 = c1.add(g1.multiply((18).yard2meter()));
            teamGuidePoint2 = teamGuidePoint1.add(g1.multiply( (5).yard2meter() - this.options.LineWidth.val ).rotate_90_cw());
            teamGuidePoint3 = c4.subtract(g1.multiply((18).yard2meter()));
            teamGuidePoint4 = teamGuidePoint3.add(g1.multiply( (5).yard2meter() - this.options.LineWidth.val ).rotate_90_cw());
          }
          
          this.tasks.push( new LineTask( this.tasks.length, [ teamGuidePoint1, teamGuidePoint2 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ teamGuidePoint2, teamGuidePoint4 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ teamGuidePoint4, teamGuidePoint3 ], false, true ) );

          for(let i = 1; i < 4; i++)
          {
            this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
            this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
            this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
            this.tasks[this.tasks.length - i].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
          } 
        }
      }
    }
    
    ///ENDZONES
    let tryP1mid;
    let tryP2mid;
    let tryP1top;
    let tryP1buttom;
    let tryP2top;
    let tryP2buttom;
    let g2;
    
    for(let i = 0; i < 2; i++)
    {
      if(this.options.safetyArea.val){
        if(i % 2)
        {
          endzone1 = p3.subtract(g1.multiply( (10).yard2meter() ));
          endzone2 = p4.subtract(g1.multiply( (10).yard2meter() ));
          g2 = new Line(endzone1, endzone2).unit_vector
          this.tasks.push( new LineTask( this.tasks.length, [ endzone2, endzone1 ], false, true ) );
        }
        else
        {
          endzone1 = p1.add(g1.multiply( (10).yard2meter() ));
          endzone2 = p2.add(g1.multiply( (10).yard2meter() ));
          this.tasks.push( new LineTask( this.tasks.length, [ endzone2, endzone1 ], false, true ) );
          g2 = new Line(endzone1, endzone2).unit_vector
        }
        endzoneMid = new Line(endzone1, endzone2).middle;
        tryP1mid = endzoneMid.add(g2.multiply(5).rotate_90_cw());
        tryP2mid = tryP1mid.add(g2.multiply(5).rotate_90_cw());
        
        tryP1top = tryP1mid.add(g2.multiply( (0.5).yard2meter() ) );
        tryP1buttom = tryP1mid.subtract(g2.multiply( (0.5).yard2meter() ) );
        
        tryP2top = tryP2mid.add(g2.multiply( (0.5).yard2meter() ) );
        tryP2buttom = tryP2mid.subtract(g2.multiply( (0.5).yard2meter() ) );

        this.tasks.push( new LineTask( this.tasks.length, [ tryP1buttom, tryP1top ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ tryP2buttom, tryP2top ], false, true ) );
        if(i === 0)
          this.tasks.push( new LineTask( this.tasks.length, [ mid2, mid1 ], false, true ) );
      }
      else
      {
        if(i % 2)
        {
          endzone1 = c3.subtract(g1.multiply( (10).yard2meter() ));
          endzone2 = c4.subtract(g1.multiply( (10).yard2meter() ));
          g2 = new Line(endzone1, endzone2).unit_vector
          this.tasks.push( new LineTask( this.tasks.length, [ endzone2, endzone1 ], false, true ) );
        }
        else
        {
          endzone1 = c1.add(g1.multiply( (10).yard2meter() ));
          endzone2 = c2.add(g1.multiply( (10).yard2meter() ));
          this.tasks.push( new LineTask( this.tasks.length, [ endzone2, endzone1 ], false, true ) );
          g2 = new Line(endzone1, endzone2).unit_vector
        }
        endzoneMid = new Line(endzone1, endzone2).middle;
        tryP1mid = endzoneMid.add(g2.multiply(5).rotate_90_cw());
        tryP2mid = tryP1mid.add(g2.multiply(5).rotate_90_cw());
        
        tryP1top = tryP1mid.add(g2.multiply( (0.5).yard2meter() ) );
        tryP1buttom = tryP1mid.subtract(g2.multiply( (0.5).yard2meter() ) );
        
        tryP2top = tryP2mid.add(g2.multiply( (0.5).yard2meter() ) );
        tryP2buttom = tryP2mid.subtract(g2.multiply( (0.5).yard2meter() ) );
        
        this.tasks.push( new LineTask( this.tasks.length, [ tryP1buttom, tryP1top ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ tryP2top, tryP2buttom ], false, true ) );
        if(i === 0)
          this.tasks.push( new LineTask( this.tasks.length, [ mid2, mid1 ], false, true ) );
      }
    }
    //this.tasks.push( new LineTask( this.tasks.length, [ mid1, mid2 ], false, true ) );

    if(this.options.check.val !== this.options.safetyArea.val)
    {
      this.options.check.val = this.options.safetyArea.val;
      this.draw();
    }
    this.options.check.val = this.options.safetyArea.val;
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}