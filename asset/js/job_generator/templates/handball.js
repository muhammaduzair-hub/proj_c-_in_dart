/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global robot_controller */

class Handball extends square_pitch
{
  static template_type = "Handball";// Translateable
  static template_title = "Standard";// Translateable
  static template_id = "handball"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    //this.options.LineWidth.val = 0.05; // If negative, the pitch is measured from the inside of the lines
    this.options.Length.val = 40;
    this.options.Width.val = 20;
    this.options.GoalWidth.val = 3;
    this.options.KickFieldsAsDots = {
      configurable: true,
      adjustable: false,
      name: "KickFieldsAsDots",
      val: false,
      type: "bool"
    };

    this.options["Dashed free throw line"] = {
      configurable: true,
      name: "Dashed free throw line",
      val: robot_controller.robot_has_capability( "dash_offset_option" ),
      type: "bool"
    };
    this.options.KickFieldRadius = {
      name: "KickFieldRadius",
      val: 0.06,
      type: "float",
      "dontsave": true
    };
    this.options["running lines"] = {
      configurable: true,
      name: "Continuous lines",
      val: false,
      type: "bool"
    };
  }

  static get template_title()
  {
    return "Junior";
  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "free_hand": 0
    };
  }

  draw()
  {

    var self = this;
    delete self.calculated_drawing_points;
    self.tasks = [ ];
    self.start_locations = [ ];

    var p = self.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    var p1 = p[1];
    var p2 = p[2];
    var p3 = p[5];
    var p4 = p[6];

    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    var s1 = new Line( c1, c2 );
    var s2 = new Line( c3, c4 );

    // update tasks
    var dash_length = 0.15;
    var dash_space = 0.15;

    [ [ c1, c2, c3, c4, p1, p2, g1, g2 ], [ c3, c4, c1, c2, p3, p4, g1.rotate_180(), g2.rotate_180() ] ].forEach( e => {
      var c1 = e[0];
      var c2 = e[1];
      var c3 = e[2];
      var c4 = e[3];
      var p1 = e[4];
      var p2 = e[5];
      var g1 = e[6];
      var g2 = e[7];

      var side = new Line( c1, c2 );

      self.start_locations.push( new StartLocation( c1, self.tasks.length ) );
      self.tasks.push( new LineTask( self.tasks.length, [ c1, p1 ], false, true ) );

      //console.log( self.options.GoalDistFromBack.val );
      if( self.get_option_val( "Right goal pole" ) )
        self.tasks.push( new WaypointTask( self.tasks.length, p1.add( g2.unit_vector.multiply( -self.options.GoalDistFromBack.val ) ), false, true ) );
      if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
        self.tasks.push( new WaypointTask( self.tasks.length, p2.add( g2.unit_vector.multiply( -self.options.GoalDistFromBack.val ) ), false, true ) );

      self.tasks.push( new LineTask( self.tasks.length, [ p1, p2 ], false, true ) );

      if( !self.get_option_val( "Right goal pole" ) && self.get_option_val( "Left goal pole" ) )
        self.tasks.push( new WaypointTask( self.tasks.length, p2.add( g2.unit_vector.multiply( -self.options.GoalDistFromBack.val ) ), false, true ) );

      self.tasks.push( new LineTask( self.tasks.length, [ p2, c2 ], false, true ) );

      var goal1_outer = p1.add( g2.multiply( self.options.LineWidth.val / 2 ) );
      var goal2_outer = p2.add( g2.multiply( self.options.LineWidth.val / 2 ) );


      var r1 = 9 + self.options.LineWidth.val / 2;
      var outer_width = r1 * 2 + new Line( p1, p2 ).length;

      var side_line = new Line( c2, c2.add( g2.multiply( self.options.Length.val ) ) );
      if( self.options.Width.val >= outer_width )
      {
        side_line = side.reverse();
        var ag11 = side_line.reverse().crosses_with_circle( goal2_outer, r1 )[1];
      }
      else
        var ag11 = side_line.reverse().crosses_with_circle( goal2_outer, r1 )[0];
      var ag13 = goal2_outer.add( g2.multiply( r1 ) );
      var ag12 = new Line( goal2_outer, new Line( ag11, ag13 ).middle ).unit_vector.multiply( r1 ).add( goal2_outer );

      self.tasks.push( new ArcTask( self.tasks.length, [ ag11, ag12, ag13 ], goal2_outer, true, false, true ) );

      var side_line2 = new Line( c1, c1.add( g2.multiply( self.options.Length.val ) ) );
      if( self.options.Width.val >= outer_width )
      {
        side_line2 = side;
        var ag21 = side_line2.reverse().crosses_with_circle( goal1_outer, r1 )[1];
      }
      else
        var ag21 = side_line2.reverse().crosses_with_circle( goal1_outer, r1 )[0];
      var ag23 = goal1_outer.add( g2.multiply( r1 ) );
      var ag22 = new Line( goal1_outer, new Line( ag21, ag23 ).middle ).unit_vector.multiply( r1 ).add( goal1_outer );

      self.tasks.push( new LineTask( self.tasks.length, [ ag13, ag23 ], false, true ) );
      self.tasks.push( new ArcTask( self.tasks.length, [ ag23, ag22, ag21 ], goal1_outer, true, false, true ) );
      if( self.options["Dashed free throw line"].val )
      {
        for( var i = 1; i <= 3; i++ )
        {
          self.tasks[self.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
          self.tasks[self.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
          self.tasks[self.tasks.length - i].task_options.push( new BoolRobotAction( "navigate_tool", true ) );
          self.tasks[self.tasks.length - i].task_options.push( new BoolRobotAction( "pathshift_tool", false ) );

          self.tasks[self.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
          self.tasks[self.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
          self.tasks[self.tasks.length - i].task_options.push( new IntRobotAction( "dashed_align", 0 ) );
        }

        /* Correct dashed offset to look nice */
        var start_offset = (self.options.GoalWidth.val / 2 - (dash_length / 2)) % (dash_length + dash_space);
        if( start_offset > dash_space )
          start_offset -= (dash_length + dash_space);
        self.tasks[self.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_offset", start_offset ) );

        var first_line_in_midle_length = start_offset - dash_space;
        self.tasks[self.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", -first_line_in_midle_length ) );

        var first_circle_length = self.tasks[self.tasks.length - 3].length;
        var periods = first_circle_length / (dash_length + dash_space);
        var last_period_length = (periods % 1) * (dash_length + dash_space);
        var offset_first_line = (last_period_length + dash_space + first_line_in_midle_length) % (dash_length + dash_space);


        self.tasks[self.tasks.length - 3].task_options.push( new FloatRobotAction( "dashed_offset", offset_first_line ) );
      }


      var r2 = 6 + self.options.LineWidth.val / 2;
      var inner_width = r2 * 2 + new Line( p1, p2 ).length;

      var ag31 = goal1_outer.add( g1.multiply( -r2 ) );
      var ag33 = goal1_outer.add( g2.multiply( r2 ) );
      var ag32 = new Line( goal1_outer, new Line( ag31, ag33 ).middle ).unit_vector.multiply( r2 ).add( goal1_outer );

      if(!this.options["running lines"].val){
      if( self.options.Width.val < inner_width )
      {
        var side_line = new Line( c1, c1.add( g2.multiply( self.options.Length.val ) ) );
        var ag31 = side_line.reverse().crosses_with_circle( goal1_outer, r2 )[0];
        var ag32 = new Line( goal1_outer, new Line( ag31, ag33 ).middle ).unit_vector.multiply( r2 ).add( goal1_outer );
        self.tasks.push( new ArcTask( self.tasks.length, [ ag31, ag32, ag33 ], goal1_outer, false, false, true ) );
      }
      else
        self.tasks.push( new ArcTask( self.tasks.length, [ ag31, ag32, ag33 ], goal1_outer, false, false, true ) );


      // make small lines
      var middle = new Line( c1, c2 ).middle;
      var free_throw_middle = middle.add( g2.multiply( 7 ) );
      var free_throw_start = free_throw_middle.add( g1.multiply( -0.5 ) );
      var free_throw_end = free_throw_middle.add( g1.multiply( 0.5 ) );
      self.tasks.push( new LineTask( self.tasks.length, [ free_throw_start, free_throw_end ], false, true ) );

      var goalkeeper_line_middle = middle.add( g2.multiply( 4 ) );
      var goalkeeper_line_start = goalkeeper_line_middle.add( g1.multiply( 0.15 / 2 ) );
      var goalkeeper_line_end = goalkeeper_line_middle.add( g1.multiply( -0.15 / 2 ) );
      self.tasks.push( new LineTask( self.tasks.length, [ goalkeeper_line_start, goalkeeper_line_end ], false, true ) );

      // last part of arc
      var ag41 = goal2_outer.add( g1.multiply( r2 ) );
      var ag43 = goal2_outer.add( g2.multiply( r2 ) );
      var ag42 = new Line( goal2_outer, new Line( ag41, ag43 ).middle ).unit_vector.multiply( r2 ).add( goal2_outer );

      if( self.options.Width.val < inner_width )
      {
        var side_line = new Line( c2, c2.add( g2.multiply( self.options.Length.val ) ) );
        var ag41 = side_line.reverse().crosses_with_circle( goal2_outer, r2 )[0];
        var ag42 = new Line( goal2_outer, new Line( ag41, ag43 ).middle ).unit_vector.multiply( r2 ).add( goal2_outer );
        self.tasks.push( new LineTask( self.tasks.length, [ ag33, ag43 ], false, true ) );
        self.tasks.push( new ArcTask( self.tasks.length, [ ag43, ag42, ag41 ], goal2_outer, false, false, true ) );
      }
      else
      {
        self.tasks.push( new LineTask( self.tasks.length, [ ag33, ag43 ], false, true ) );
        self.tasks.push( new ArcTask( self.tasks.length, [ ag43, ag42, ag41 ], goal2_outer, false, false, true ) );
      }
      self.start_locations.push( new StartLocation( c2, self.tasks.length ) );
      var midle = new Line( c2, c3 ).middle;
      self.tasks.push( new LineTask( self.tasks.length, [ c2, midle ], false, true ) );
      self.tasks.push( new LineTask( self.tasks.length, [ midle, c3 ], false, true ) );
    }
    else
    {
      if( self.options.Width.val < inner_width )
      {
        var side_line = new Line( c1, c1.add( g2.multiply( self.options.Length.val ) ) );
        var ag31 = side_line.reverse().crosses_with_circle( goal1_outer, r2 )[0];
        var ag32 = new Line( goal1_outer, new Line( ag31, ag33 ).middle ).unit_vector.multiply( r2 ).add( goal1_outer );
        self.tasks.push( new ArcTask( self.tasks.length, [ ag31, ag32, ag33 ], goal1_outer, false, false, true ) );
      }
      else
        self.tasks.push( new ArcTask( self.tasks.length, [ ag31, ag32, ag33 ], goal1_outer, false, false, true ) );

        // last part of arc
        var ag41 = goal2_outer.add( g1.multiply( r2 ) );
        var ag43 = goal2_outer.add( g2.multiply( r2 ) );
        var ag42 = new Line( goal2_outer, new Line( ag41, ag43 ).middle ).unit_vector.multiply( r2 ).add( goal2_outer );
  
        if( self.options.Width.val < inner_width )
        {
          var side_line = new Line( c2, c2.add( g2.multiply( self.options.Length.val ) ) );
          var ag41 = side_line.reverse().crosses_with_circle( goal2_outer, r2 )[0];
          var ag42 = new Line( goal2_outer, new Line( ag41, ag43 ).middle ).unit_vector.multiply( r2 ).add( goal2_outer );
          self.tasks.push( new LineTask( self.tasks.length, [ ag33, ag43 ], false, true ) );
          self.tasks.push( new ArcTask( self.tasks.length, [ ag43, ag42, ag41 ], goal2_outer, false, false, true ) );
        }
        else
        {
          self.tasks.push( new LineTask( self.tasks.length, [ ag33, ag43 ], false, true ) );
          self.tasks.push( new ArcTask( self.tasks.length, [ ag43, ag42, ag41 ], goal2_outer, false, false, true ) );
        }

      // make small lines
      var middle = new Line( c1, c2 ).middle;
      var free_throw_middle = middle.add( g2.multiply( 7 ) );
      var free_throw_start = free_throw_middle.add( g1.multiply( -0.5 ) );
      var free_throw_end = free_throw_middle.add( g1.multiply( 0.5 ) );
      self.tasks.push( new LineTask( self.tasks.length, [ free_throw_start, free_throw_end ], false, true ) );

      var goalkeeper_line_middle = middle.add( g2.multiply( 4 ) );
      var goalkeeper_line_start = goalkeeper_line_middle.add( g1.multiply( 0.15 / 2 ) );
      var goalkeeper_line_end = goalkeeper_line_middle.add( g1.multiply( -0.15 / 2 ) );
      self.tasks.push( new LineTask( self.tasks.length, [ goalkeeper_line_start, goalkeeper_line_end ], false, true ) );

      self.start_locations.push( new StartLocation( c2, self.tasks.length ) );
      var midle = new Line( c2, c3 ).middle;
      self.tasks.push( new LineTask( self.tasks.length, [ c2, midle ], false, true ) );
      self.tasks.push( new LineTask( self.tasks.length, [ midle, c3 ], false, true ) );
    }

    } );
    
    var last_side_line = self.tasks[self.tasks.length - 1];
    var m1 = new Line( c2, c3 ).middle;
    var m2 = new Line( c4, c1 ).middle;
    var c = new Line( m1, m2 ).middle;
    self.tasks[self.tasks.length - 1] = new LineTask( self.tasks.length - 1, [ m2, c ], false, true );
    self.tasks.push( new LineTask( self.tasks.length, [ c, m1 ], false, true ) );

    var kick_guide1 = c.add( g2.multiply( -this.options.KickFieldRadius.val ) );
    var kick_guide2 = c.add( g2.multiply( this.options.KickFieldRadius.val ) );
    if( this.options.KickFieldsAsDots.val )
      this.tasks.push( new WaypointTask( this.tasks.length, c, false, true ) );
    else
      this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], c, false, false, true ) );



    last_side_line.id = self.tasks.length;
    self.tasks.push( last_side_line );

    //self.tasks.push( new LineTask( self.tasks.length, [c4, c1], false, true ) );

    self.refresh_bb();
    self.refresh_handles();
    self.refresh_test_run();
    self.refresh_snapping_lines();
  }

}