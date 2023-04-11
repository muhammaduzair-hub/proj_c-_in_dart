/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global s2p2 */
/* global this, five_degrees_equal */
class Ultimate extends square_pitch
{
  static template_type = "Ultimate"; // Translateable
  static template_title = "Frisbee"; // Translateable
  static template_id = "ultimate"; // no spaces
  static template_image = "img/templates/ultimate_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    var this_class = this;

    this.options.Length.val = 100; //max length
    this.options.Width.val = 37; //max width

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
      _val: 18 - this_class.options.LineWidth.val / 2,
      get val()
      {
        return this._val + this_class.options.LineWidth.val / 2;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val / 2;
      }
    }
    this.options.DashedGoalLine = {
      get configurable()
      {
        return this_class.options.EndZone.val;
      },
      "dontsave": false,
      name: "Dashed Goal Line",
      type: "bool",
      val: false
    }
    this.options["A"] = {
      configurable: false,
      "dontsave": false,
      name: "A",
      type: "bool",
      val: false
    }
    this.options["B"] = {
      configurable: false,
      "dontsave": false,
      name: "B",
      type: "bool",
      val: false
    }
    this.options.BrickMarks = {
      configurable: true,
      "dontsave": false,
      name: "Brick Marks",
      type: "bool",
      val: true,
      prev_sibling: "A"
    }
    this.options.BM18 = {
      get configurable()
      {
        return this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "18m Brick Marks",
      type: "bool",
      val: true,
      prev_sibling: "B"
    }
    this.options.BM11 = {
      get configurable()
      {
        return this_class.options.BrickMarks.val && this_class.options.EndZone.val;
      },
      "dontsave": false,
      name: "11m Brick Marks",
      type: "bool",
      val: true,
      prev_sibling: "B"
    }
    this.options.BM_mid = {
      get configurable()
      {
        return this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "center Brick Mark",
      type: "bool",
      val: true,
      prev_sibling: "B"
    }

    this.options.BrickLength = {
      get configurable()
      {
        return this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "18m Brick Marks from goal line",
      type: "float",
      _val: 18 - this_class.options.LineWidth.val,
      get val()
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
    }
    this.options.BrickLength11 = {
      get configurable()
      {
        return this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "11m Brick Marks from goal line",
      type: "float",
      _val: 11.5 - this_class.options.LineWidth.val,
      get val()
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
    }
    this.options.BrickCircle = {
      get configurable()
      {
        return this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "Brick Marks as circles",
      type: "bool",
      val: false
    }
    this.options.BrickRadius = {
      get configurable()
      {
        return this_class.options.BrickCircle.val;
      },
      "dontsave": false,
      name: "Brick Marks radius",
      type: "float",
      _val: 0.5 - this_class.options.LineWidth.val / 2,
      get val()
      {
        return this._val + this_class.options.LineWidth.val / 2;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val / 2;
      }
    }
    this.options.BrickSize = {
      get configurable()
      {
        return !this_class.options.BrickCircle.val && this_class.options.BrickMarks.val;
      },
      "dontsave": false,
      name: "Brick Marks size",
      type: "float",
      _val: 0.25 - this_class.options.LineWidth.val / 2,
      get val()
      {
        return this._val + this_class.options.LineWidth.val / 2;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 - this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val / 2;
      }
    }

  }

  static get layout_methods()
  {
    return {
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
        new Vector( -0.015, 1.008 ),
        new Vector( -0.015, 0.25 )
      ]
    }

    if( layout_method === "two_corners" )
    {
      return [
        new Vector( -0.015, 1.008 ),
        new Vector( -0.015, -0.045 )
      ]
    }

    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( -0.015, 1.008 ),
        new Vector( -0.015, -0.045 ),
        new Vector( 1.035, 0.25 )
      ]
    }

    if( layout_method === "all_corners" )
    {
      return [
        new Vector( -0.015, -0.045 ),
        new Vector( 1.035, -0.045 ),
        new Vector( 1.035, 1.008 ),
        new Vector( -0.015, 1.008 )
      ]
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
    var s1 = new Line( c1, c2 );
    var s2 = new Line( c3, c4 );
    var s3 = new Line( c2, c3 );
    var s4 = new Line( c4, c1 );
    var g2 = new Line( s1.middle, s2.middle ).unit_vector;
    var g1 = g2.rotate_90_ccw();

    // borders
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( s1.toLineTask( this.tasks.length, false, true ) );

    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.tasks.push( s3.toLineTask( this.tasks.length, false, true ) );

    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( s2.toLineTask( this.tasks.length, false, true ) );

    this.tasks.push( s4.toLineTask( this.tasks.length, false, true ) );

    // end zones
    var endzone_s1 = new Line( c1.add( g2.multiply( this.options.EndZoneLength._val ) ), c2.add( g2.multiply( this.options.EndZoneLength._val ) ) );
    var endzone_s2 = new Line( c3.subtract( g2.multiply( this.options.EndZoneLength._val ) ), c4.subtract( g2.multiply( this.options.EndZoneLength._val ) ) );

    var ez_s1 = new Line( endzone_s1.cross_with_line( s4 ), endzone_s1.cross_with_line( s3 ) );
    var ez_s2 = new Line( endzone_s2.cross_with_line( s3 ), endzone_s2.cross_with_line( s4 ) );

    var center = new Line( s1.middle, s2.middle ).middle;

    // brick marks
    if( this.options.EndZone.val )
    {
      var bm_s1_center = ez_s1.middle.add( g2.multiply( this.options.BrickLength._val ) );
      var bm_s2_center = ez_s2.middle.subtract( g2.multiply( this.options.BrickLength._val ) );

      var bm11_s1_center = ez_s1.middle.subtract( g2.multiply( this.options.BrickLength11._val ) );
      var bm11_s2_center = ez_s2.middle.add( g2.multiply( this.options.BrickLength11._val ) );
    }
    else
    {
      this.options.BM11.val = false;
      var bm_s1_center = s1.middle.add( g2.multiply( this.options.BrickLength._val ) );
      var bm_s2_center = s2.middle.subtract( g2.multiply( this.options.BrickLength._val ) );

      var bm11_s1_center = s1.middle.subtract( g2.multiply( this.options.BrickLength11._val ) );
      var bm11_s2_center = s2.middle.add( g2.multiply( this.options.BrickLength11._val ) );
    }

    if( this.options.BrickMarks.val && this.options.BM11.val )
    {
      if( this.options.BrickCircle.val )
      {
        var s1_g1 = bm11_s1_center.add( g1.multiply( this.options.BrickRadius._val ) );
        var s1_g2 = bm11_s1_center.add( g1.multiply( -this.options.BrickRadius._val ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ s1_g1, s1_g2 ], bm11_s1_center, true, false, true ) );
      }
      else
      {
        var size = this.options.BrickSize._val;
        var cross1_l1 = new Line( bm11_s1_center.add( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm11_s1_center.subtract( g1.multiply( size ) ).add( g2.multiply( size ) ) );
        var cross1_l2 = new Line( bm11_s1_center.subtract( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm11_s1_center.add( g1.multiply( size ) ).add( g2.multiply( size ) ) );

        this.tasks.push( cross1_l1.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( cross1_l2.toLineTask( this.tasks.length, false, true ) );
      }
    }

    if( this.options.EndZone.val )
      this.tasks.push( ez_s1.toLineTask( this.tasks.length, false, true ) );
    if( this.options.EndZone.val && this.options.DashedGoalLine.val )
    {
      var dash_length = 1;
      var dash_space = 2;
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
      this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "dashed_align", 0 ) );

    }
    if( this.options.BrickMarks.val )
    {
      if( this.options.BrickCircle.val )
      {
        if( this.options.BM18.val )
        {
          var s1_g1 = bm_s1_center.add( g1.multiply( this.options.BrickRadius._val ) );
          var s1_g2 = bm_s1_center.add( g1.multiply( -this.options.BrickRadius._val ) );
          this.tasks.push( new ArcTask( this.tasks.length, [ s1_g1, s1_g2 ], bm_s1_center, true, false, true ) );
        }

        if( this.options.BM_mid.val )
        {
          var mid_g1 = center.add( g1.multiply( this.options.BrickRadius._val ) );
          var mid_g2 = center.add( g1.multiply( -this.options.BrickRadius._val ) );
          this.tasks.push( new ArcTask( this.tasks.length, [ mid_g1, mid_g2 ], center, true, false, true ) );
        }
        if( this.options.BM18.val )
        {
          var s2_g1 = bm_s2_center.add( g1.multiply( this.options.BrickRadius._val ) );
          var s2_g2 = bm_s2_center.add( g1.multiply( -this.options.BrickRadius._val ) );
          this.tasks.push( new ArcTask( this.tasks.length, [ s2_g1, s2_g2 ], bm_s2_center, true, false, true ) );
        }
      }
      else
      {
        var size = this.options.BrickSize._val;
        var cross1_l1 = new Line( bm_s1_center.add( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm_s1_center.subtract( g1.multiply( size ) ).add( g2.multiply( size ) ) );
        var cross1_l2 = new Line( bm_s1_center.subtract( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm_s1_center.add( g1.multiply( size ) ).add( g2.multiply( size ) ) );

        if( this.options.BM18.val )
        {
          this.tasks.push( cross1_l1.toLineTask( this.tasks.length, false, true ) );
          this.tasks.push( cross1_l2.toLineTask( this.tasks.length, false, true ) );
        }

        var cross1_l1 = new Line( center.add( g1.multiply( size ) ).subtract( g2.multiply( size ) ), center.subtract( g1.multiply( size ) ).add( g2.multiply( size ) ) );
        var cross1_l2 = new Line( center.subtract( g1.multiply( size ) ).subtract( g2.multiply( size ) ), center.add( g1.multiply( size ) ).add( g2.multiply( size ) ) );

        if( this.options.BM_mid.val )
        {
          this.tasks.push( cross1_l1.toLineTask( this.tasks.length, false, true ) );
          this.tasks.push( cross1_l2.toLineTask( this.tasks.length, false, true ) );
        }


        var cross2_l1 = new Line( bm_s2_center.add( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm_s2_center.subtract( g1.multiply( size ) ).add( g2.multiply( size ) ) );
        var cross2_l2 = new Line( bm_s2_center.subtract( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm_s2_center.add( g1.multiply( size ) ).add( g2.multiply( size ) ) );

        if( this.options.BM18.val )
        {
          this.tasks.push( cross2_l1.toLineTask( this.tasks.length, false, true ) );
          this.tasks.push( cross2_l2.toLineTask( this.tasks.length, false, true ) );
        }
      }
    }

    if( this.options.EndZone.val )
      this.tasks.push( ez_s2.toLineTask( this.tasks.length, false, true ) );

    if( this.options.EndZone.val && this.options.DashedGoalLine.val )
    {
      var dash_length = 1;
      var dash_space = 2;
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
      this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "dashed_align", 0 ) );
    }

    if( this.options.BrickMarks.val && this.options.BM11.val )
    {
      if( this.options.BrickCircle.val )
      {
        var s2_g1 = bm11_s2_center.add( g1.multiply( this.options.BrickRadius._val ) );
        var s2_g2 = bm11_s2_center.add( g1.multiply( -this.options.BrickRadius._val ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ s2_g1, s2_g2 ], bm11_s2_center, true, false, true ) );
      }
      else
      {
        var size = this.options.BrickSize._val;
        var cross1_l1 = new Line( bm11_s2_center.add( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm11_s2_center.subtract( g1.multiply( size ) ).add( g2.multiply( size ) ) );
        var cross1_l2 = new Line( bm11_s2_center.subtract( g1.multiply( size ) ).subtract( g2.multiply( size ) ), bm11_s2_center.add( g1.multiply( size ) ).add( g2.multiply( size ) ) );

        this.tasks.push( cross1_l1.toLineTask( this.tasks.length, false, true ) );
        this.tasks.push( cross1_l2.toLineTask( this.tasks.length, false, true ) );
      }
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}

class CH_Ultimate extends Ultimate
{
  static template_type = "Ultimate"; // Translateable
  static template_title = "Frisbee"; // Translateable
  static template_id = "ch_ultimate"; // no spaces
  static template_image = "img/templates/ultimate_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    var this_class = this;

    this.options.Length.val = 64 + 23 + 23 - this_class.options.LineWidth.val; //max length
    this.options.Width.val = 37; //max width

    this.options.DashedGoalLine.val = true;
    this.options.EndZoneLength._val = 23 - this_class.options.LineWidth.val / 2;
    this.options.BrickLength._val = 18 - this_class.options.LineWidth.val / 2;
    this.options.BM11.val = false;
    this.options.BM_mid.val = false;

//    this.options.BrickRadius._val = 0;
//    this.options.BrickSize._val = 0;
  }
}