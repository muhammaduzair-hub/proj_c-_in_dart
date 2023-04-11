/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global SAFETY_DISTANCE, ROBOT_TOOL_DIST */

class AustralianFootball extends square_pitch
{
  static template_type = "Soccer";
  static template_title = "Australian";
  static template_id = "soccer_australian";
  static template_image = "img/templates/Australian_soccer_black.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    
    let this_class = this;

    this.options.Length.val = 185;
    this.options.Width.val = 155;
    
    this.options.NegativeLineWidth.val = true;
    
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    
    this.options["Middle size"] = {
      configurable: true,
      name: "Middle size",
      val: 50.0,
      type: "float"
    };
    
    this.options["50m line"] = {
      configurable: true,
      name: "50m line",
      val: 50.0,
      type: "float"
    };
    
    this.options["Goal square length"] = {
      configurable: true,
      name: "Goal square length",
      val: 9.0,
      type: "float"
    };
    
    this.options["Close goal square"] = {
      configurable: true,
      name: "Close goal square",
      val: true,
      type: "bool",
      prev_sibling: "Goal square length"
    };

    this.options["Behind post line length"] = {
      configurable: true,
      name: "Behind post line length",
      val: 0.0,
      type: "float"
    };

    this.options.reverseInGoal = {
      configurable: true,
      name: "Drive around posts",
      val: true,
      type: "bool"
    };
    
    this.options.GoalWidth = {
      configurable: true,
      name: "Inner goal line length",
      type: "float",
      _val: 6.4,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if(this_class.options.reverseInGoal.val)
          this._val = v < 4 ? 4 : v;
        else
          this._val = v < 1 ? 1 : v;
      },
    }
    this.options.goalPoleWidth = {
      name: "Behind post line length",
      val: 0.2,
      type: "float"
    };
    this.options.outerGoalLine = {
      configurable: true,
      name: "Outer goal line length",
      _val: 6.4,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if(this_class.options.reverseInGoal.val)
          this._val = v < 4 ? 4 : v;
        else
          this._val = v < 1 ? 1 : v;
      },
      type: "float",
      prev_sibling: "GoalWidth"
    };
    this.options["Control point 1"] = {
      name: "Control point",
      val: 0,
      type: "float"
    }
    this.options.controlPoint1Length = {
      name: "Controlpoint1L",
      val: 0,
      type: "float"
    }
    this.options["Control point 2"]= {
      name: "Control point",
      val: 0,
      type: "float"
    }
    this.options.WierdBorders = {
      name: "Customizable sidelines",
      _val: false,
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if(v && this_class.options.independentSidelines.val) {
          this_class.options.independentSidelines.val = false;
        }
      },
      type: "bool",
      adjustable: true
    }

    this.options.independentSidelines = {
      name: "Independent sidelines",
      val: false,
      existingJobDefault: false,
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if(v && this_class.options.WierdBorders.val) {
          this_class.options.WierdBorders.val = false;
        }
      },
      type: "bool",
      adjustable: true
    }

    this.options.widthSideOne = {
      name: "Side 1 width",
      _val: this_class.options.Width.val / 2,
      existingJobDefault: this_class.options.Width.val / 2,
      get val() {
        return this._val;
      },
      set val(v) {
        if(v <= this_class.options["Middle size"].val / 1.9) {
          v = this_class.options["Middle size"].val / 1.9;
        }
        this._val = v;
      },
      type: "bool",
      adjustable: false
    }

    this.options.widthSideTwo = {
      name: "Side 2 width",
      _val: this_class.options.Width.val / 2,
      existingJobDefault: this_class.options.Width.val / 2,
            get val() {
        return this._val;
      },
      set val(v) {
        if(v <= this_class.options["Middle size"].val / 1.9) {
          v = this_class.options["Middle size"].val / 1.9;
        }
        this._val = v;
      },
      type: "bool",
      adjustable: false
    }

    this.options.DashedArcs30m = {
      name: "Dashed arc 30m",
      val: false,
      type: "bool",
      configurable: true
    }
    this.options.DashedArcs40m = {
      name: "Dashed arc 40m",
      val: false,
      type: "bool",
      configurable: true
    }
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "all_goal_posts" )
    {
      return [
        new Vector( 0.3036, 0.15 ),
        new Vector( 0.4468, 0.15 ),
        new Vector( 0.59, 0.15 ),
        new Vector( 0.7332, 0.15 ),
        new Vector( 0.7332, 0.85 ),
        new Vector( 0.59, 0.85 ),
        new Vector( 0.4468, 0.85 ),
        new Vector( 0.3036, 0.85 )
      ];
    }
  }

  static get layout_methods()
  {
    return {
      "all_goal_posts": 8,
      "free_hand": 0
    };
  }

  fluent_job_with_tasks( tasks )
  {
    var fluent_job = new Job();
    fluent_job.tasks = tasks;
    fluent_job.job_options = this.job_options;
    return fluent_job;
  }

  makeGoal( taskBefore, taskAfter, poles, other_end_poles )
  {

    var behind_post1_guide = new Line( poles[0], other_end_poles[3] ).unit_vector.multiply( this.options["Behind post line length"].val );
    var behind_post2_guide = new Line( poles[3], other_end_poles[0] ).unit_vector.multiply( this.options["Behind post line length"].val );
    var post1_guide = new Line( poles[1], other_end_poles[2] ).unit_vector.multiply( this.options["Goal square length"].val );
    var post2_guide = new Line( poles[2], other_end_poles[1] ).unit_vector.multiply( this.options["Goal square length"].val );
    var rampAfter;

    var first_goal_index = this.tasks.length;
    if( this.options.reverseInGoal.val )
    {

      var options = {};
      options.task_before = taskBefore;
      options.task_after = taskAfter;
      options.poles = poles;
      options.pole_width = this.options.goalPoleWidth.val;
      options.left_around = false;
      options.start_index = this.tasks.length;
      options.turn_radius = 1.5;

      let around_tasks = drive_around_posts( options );
      taskBefore = around_tasks.shift( );
      taskAfter = around_tasks.pop();
      if(around_tasks.last() instanceof EllipseTask)
        rampAfter = around_tasks.splice( around_tasks.length - 2, 2 );
      else
        rampAfter = around_tasks.splice( around_tasks.length - 1, 1 );
        
      around_tasks.pop();
      while( !(around_tasks.last() instanceof LineTask) ){
        around_tasks.pop();
      }

      this.tasks.pushAll( around_tasks );
    }
    else
      this.tasks.push( new LineTask( this.tasks.length, [ poles[0], poles[3] ], false, true ) );  

    var goal_end_index = this.tasks.length;

    var dist_to_pole = this.options.goalPoleWidth.val / 2 + 0.2 + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR;
    // goal end 1 stuff
    if( this.options["Behind post line length"].val > 0.0 )
    {
      if( this.options.reverseInGoal.val )
      {
        this.tasks.pushAll(
          convert_to_drive_close( new LineTask( this.tasks.length,
          [ poles.last().add( behind_post1_guide ), poles.last() ],
            false, true ), poles.last(), dist_to_pole, 2.0, false, true )
          );
      }
      else
        this.tasks.push( new LineTask( this.tasks.length, [ poles.last(), poles.last().add( behind_post1_guide ) ], false, true ) );
    }

    var goal1_p2_end = poles[2].add( post2_guide );
    var goal1_p1_end = poles[1].add( post1_guide );
    if( this.options.reverseInGoal.val )
    {
      // task, pole, spray_to, split_dist, beginning = true, reverse_order = false
      this.tasks.pushAll( convert_to_drive_close( new LineTask( this.tasks.length, [ goal1_p2_end,
        poles[2] ], false, true ), poles[2], dist_to_pole, 3.0, false, true ) );

    }
    else
      this.tasks.push( new LineTask( this.tasks.length, [ poles[2], goal1_p2_end ], false, true ) );

    if( this.options.reverseInGoal.val )
    {
      var new_tasks = make_fluent_run( this.fluent_job_with_tasks( this.tasks.slice( goal_end_index - 1, goal_end_index + 1 ) ), {min_turn_radius: 1.5, turn_direction: "left", ignoreCCC: false} );
      new_tasks = new_tasks.splice( 1, new_tasks.length - 2 );
      this.tasks.splice( goal_end_index, 0, new_tasks );
      this.tasks = this.tasks.flat();
      this.tasks[goal_end_index + new_tasks.length].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
    }

    if( this.options["Close goal square"].val )
      this.tasks.push( new LineTask( this.tasks.length, [ goal1_p2_end, goal1_p1_end ], false, true ) );
    //this.tasks.push( new LineTask( this.tasks.length, [ goal1_p1_end, p1 ], false, true ) );



    if( this.options.reverseInGoal.val )
    {
      this.tasks.pushAll( convert_to_drive_close( new LineTask( this.tasks.length, [ goal1_p1_end,
        poles[1] ], false, true ), poles[1], dist_to_pole, 2.0, false, false ) );
    }
    else
      this.tasks.push( new LineTask( this.tasks.length, [ goal1_p1_end, poles[1] ], false, true ) );

    if( this.options["Behind post line length"].val > 0.0 )
    {
      if( this.options.reverseInGoal.val )
      {
        var bihind_post_line1 = convert_to_drive_close( new LineTask( this.tasks.length, [ poles[0].add( behind_post2_guide ),
          poles[0] ], false, true ), poles[0], dist_to_pole, 2.0, false, true );

        var new_tasks = make_fluent_run( this.fluent_job_with_tasks( [ this.tasks.last(),
          bihind_post_line1[0] ] ), {min_turn_radius: 1.5, turn_direction: "right", ignoreCCC: false} );
        new_tasks = new_tasks.splice( 1, new_tasks.length - 2 );

        this.tasks.pushAll( new_tasks );

        bihind_post_line1[0].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
        this.tasks.pushAll( bihind_post_line1 );
      }
      else
        this.tasks.push( new LineTask( this.tasks.length, [ poles[0], poles[0].add( behind_post2_guide ) ], false, true ) );

    }

//return [ taskBefore, taskAfter ];

    if( this.options.reverseInGoal.val )
    {
      if(taskAfter instanceof SplineTask)
      {
        let rampTask = taskAfter.splitMeter(6);

        var new_tasks = make_fluent_run( this.fluent_job_with_tasks( [ this.tasks.last(),
          rampTask[0] ] ), {min_turn_radius: 1.5, ignoreCCC: false, add_ramp_to_next: false} );
      }
      else{
      var new_tasks = make_fluent_run( this.fluent_job_with_tasks( [ this.tasks.last(),
        taskAfter ] ), {min_turn_radius: 1.5, ignoreCCC: false, add_ramp_to_next: false} );
      }
      new_tasks.forEach( t => {
        t.fluent_run_options = {};
      } );

      new_tasks = new_tasks.splice( 1, new_tasks.length - 3 );
    
      this.tasks.pushAll( new_tasks );
      
      this.tasks.pushAll( rampAfter );
      this.tasks.last().task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      

    }

  
    var start_id = first_goal_index > 0 ? this.tasks[first_goal_index].id : 0;
    for( var id = first_goal_index; id < this.tasks.length; id++ )
    {
      this.tasks[id].id = start_id + (id - first_goal_index);
    }

    this.start_locations.push( new StartLocation( this.tasks[first_goal_index].start, this.tasks[first_goal_index].id ) );
    
    return [ taskBefore, taskAfter ];
  }

  border_is_clockwise()
  {
    var p = this.points.copy();
    p.push( p[0] );
    var sum = 0;
    for( var i = 0; i < this.points.length; i++ )
    {
      var v1 = p[i];
      var v2 = p[i + 1];
      sum += (v2.x - v1.x) * (v2.y + v1.y);
    }
    return sum > 0;
  }

  spline_and_arc_cross_section(spline, arc_center, arc_radius)
  {
    let sample = spline.sample(0.01,true);
    let crossPoint = [];
    for(let s = 0; s < sample.length; s++)
    {
        if(sample[s].crosses_with_circle_within_length_of_line(arc_center, arc_radius).length > 0)
        {
          crossPoint[0] = sample[s].crosses_with_circle_within_length_of_line(arc_center, arc_radius);
        }
    }
    let cp = crossPoint[0]; 
    if(cp)
      return cp[0];
    else
      return cp;

  }

  draw()
  {

    if( this.points.length >= 3 && !this.border_is_clockwise() )
    {
      this.points = this.points.reverse();
    }

    if(this.options.reverseInGoal.val)
    {
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }
    else
    {
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = true;
    }
    
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

  // initial guiding variables
  
    var p = this.drawing_points;
    var goal_posts = (p.length - 4) / 2;

    /*var c1 = p[0];
      var c2 = p[3];
      var c3 = p[4];
      var c4 = p[7];*/

    var posts = p.slice( 1, p.length - 1 ); // remove first and last
    posts.splice( posts.length / 2 - 1, 2 ); // remove middle two elements
    var side1 = posts.slice( 0, posts.length / 2 );
    var side2 = posts.slice( posts.length / 2 );

    var middle_side1 = side1.splice( side1.length / 2 - 1, 2 ); // remove middle two elements
    var middle_side2 = side2.splice( side2.length / 2 - 1, 2 ); // remove middle two elements

    var p1 = middle_side1[0];
    var p2 = middle_side1[1];
    var p3 = middle_side2[0];
    var p4 = middle_side2[1];

    var goal1_guide = new Line( p1, p2 ).unit_vector;
    var goal2_guide = new Line( p4, p3 ).unit_vector;
    //var g2 = g1.rotate_90_cw();

    var s1_middle = (new Line( p1, p2 )).middle;
    var s2_middle = (new Line( p3, p4 )).middle;
    var middle_line = (new Line( s1_middle, s2_middle ));
    var middle = middle_line.middle;

    var g2 = new Line( s1_middle, s2_middle ).unit_vector;
    var g1 = g2.rotate_90_ccw();
      
     
    

    // --- Make border ---
    if( goal_posts === 2 )
    {
      /*
      var back_line1_start = p1.subtract( goal1_guide.multiply( 6.4 ) );
      var back_line1_end = p2.add( goal1_guide.multiply( 6.4 ) );
      var back_line2_start = p3.add( goal2_guide.multiply( 6.4 ) );
      var back_line2_end = p4.subtract( goal2_guide.multiply( 6.4 ) );
      */
      var back_line1_start = p1.subtract( goal1_guide.multiply( this.options.outerGoalLine.val ) );
      var back_line1_end = p2.add( goal1_guide.multiply( this.options.outerGoalLine.val ) );
      var back_line2_start = p3.add( goal2_guide.multiply( this.options.outerGoalLine.val ) );
      var back_line2_end = p4.subtract( goal2_guide.multiply(this.options.outerGoalLine.val ) );
    }
    else
    {
      var back_line1_start = side1[0];
      var back_line1_end = side1[1];
      var back_line2_start = side2[0];
      var back_line2_end = side2[1];
    }
    
    let side_arc1_middle;


    if (this.options.independentSidelines.val) {
      side_arc1_middle = middle.add( g1.multiply( this.options.widthSideOne.val) );
    }
    else {
      side_arc1_middle = middle.add( g1.multiply( this.options.Width.val / 2 ) );
    }
    var side_border1_minorGuide = new Line( middle, side_arc1_middle );
    var side_border1 = new Ellipse2MinorGuide( back_line1_end, back_line2_start, side_border1_minorGuide, true );

    let c1;
    let c2;
    let c3;
    let c4;

    if(this.layout_method ===  "all_goal_posts")
    {
      //this.convert_to_free_hand();
      c1 = p[0];
      c2 = p[5];
      c3 = p[6];
      c4 = p[11];
      
    }
    else
    {
      c1 = p[0];
      c2 = p[3];
      c3 = p[4];
      c4 = p[7];
      
    }


    let g3 = new Line(c4, c1).unit_vector

    let side_arc2_middle;


    if (this.options.independentSidelines.val) {
      side_arc2_middle = middle.subtract( g1.multiply( this.options.widthSideTwo.val) );
    }
    else {
      side_arc2_middle = middle.subtract( g1.multiply( this.options.Width.val / 2 ) );
    }

    // var side_arc2_middle = middle.subtract( g1.multiply( this.options.Width.val / 2 ) );
    var side_border2_minorGuide = new Line( middle, side_arc2_middle );
    var side_border2 = new Ellipse2MinorGuide( back_line2_end, back_line1_start, side_border2_minorGuide, true );
    let midside1 = new Line(c1, c4).middle
    let midside2 = new Line(c2, c3).middle
    
      let contP1 = c4.add(g1.multiply(this.options["Control point 1"].val));
      let contP2 = midside1.subtract(g3.multiply(this.options["Control point 2"].val))
      
      
      let contP3 = c1.add(g1.multiply(this.options["Control point 1"].val))
      let contP4 = midside1.subtract(g2.multiply(this.options["Control point 2"].val));
      
      let contP5 = c2.subtract(g2.multiply(this.options["Control point 1"].val).rotate_90_ccw())
      let contP6 = midside2.subtract(g2.multiply(this.options["Control point 2"].val));
      
      let contP7 = c3.subtract(g2.multiply(this.options["Control point 1"].val).rotate_90_ccw())
      let contP8 = midside2.add(g2.multiply(this.options["Control point 2"].val));
      
    
      // side 1 task
      var elipse1T = side_border1.toEllipseTask( this.tasks.length, true );

      // side 2 task
      var elipse2T = side_border2.toEllipseTask( this.tasks.length, true );
      
      // Goal end 1
      var poles_end1 = [ back_line1_start, p1, p2, back_line1_end ];
      var poles_end2 = [ back_line2_start, p3, p4, back_line2_end ];

      
      // this.tasks.push( new LineTask( this.tasks.length, [contP1,contP2], false, true ) );
      
      // this.tasks.push( new LineTask( this.tasks.length, [contP5,contP6], false, true ) );
      // this.tasks.push( new LineTask( this.tasks.length, [contP7,contP8], false, true ) );

      let wSide1;
      let wSide2;
      let wSide3;
      let wSide4;
      if(this.options.WierdBorders.val)
      {
        wSide1 = new FitBSpline( [back_line2_end, contP1, contP2, midside1], Infinity ).getSplineTask( 124, false, true ) ;
        wSide2 = new FitBSpline( [midside1, contP4, contP3, back_line1_start], Infinity ).getSplineTask( 343, false, true ) ;
        wSide3 = new FitBSpline( [back_line1_end, contP5, contP6, midside2], Infinity ).getSplineTask( 435, false, true );
        wSide4 = new FitBSpline( [midside2, contP8,  contP7, back_line2_start], Infinity ).getSplineTask( 838, false, true );
        
      }
      else{
        var sides = this.makeGoal( elipse2T, elipse1T, poles_end1, poles_end2 );
      elipse1T = sides[1];
      elipse2T = sides[0];
      
      var goalend1_end_index = this.tasks.length;
      
      var sides = this.makeGoal( elipse1T, elipse2T, poles_end2, poles_end1 );
      elipse1T = sides[0];
      elipse2T = sides[1];
      elipse1T.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      /*this.tasks.splice( goalend1_end_index, 0, this.tasks[goalend1_end_index].opposite_direction );
      this.tasks[goalend1_end_index+1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      this.tasks[goalend1_end_index+1].task_options.push( new IntRobotAction( "ramp_up_max_dist", 0 ) );
      this.tasks[goalend1_end_index+1].paint = false;*/
      elipse2T.id = this.tasks.length;
      }
      if(this.options.WierdBorders.val)
      { 
        var sides = this.makeGoal( wSide2, wSide3, poles_end1, poles_end2 );
        let NewwSide2 = sides[0];
        
        let NewwSide3 = sides[1];
        NewwSide3.id = this.tasks.length;
        
        this.tasks.push( NewwSide3 );
        this.tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
        var goalend1_end_index = this.tasks.length;

    
        var sides1 = this.makeGoal( wSide4, wSide1, poles_end2, poles_end1 );
        let NewwSide4 = sides1[0];

        let NewwSide1 = sides1[1]; 
     
        NewwSide1.id = this.tasks.length;
        this.tasks.splice( goalend1_end_index, 0, NewwSide4 );
        this.tasks.push( NewwSide1 );
        this.tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2 ) );
        NewwSide2.id = this.tasks.length;
        this.tasks.push( NewwSide2 );
      }
      else
      {
      this.tasks.splice( goalend1_end_index, 0, elipse1T );
      this.tasks.push( elipse2T );
      }
    // 50 m line
    var flank_line_distance = this.options["50m line"].val + this.options.LineWidth.val;
    // -
    var goal1_circle_middle1 = s1_middle.add( g2.multiply( flank_line_distance ) );
    var goal2_circle_middle1 = s2_middle.add( g2.multiply( -flank_line_distance ) );
    let dashed_goal1_circle = s1_middle.add( g2.multiply(  30 - this.options.LineWidth.val ) ); 
    let dashed_goal2_circle = s2_middle.add( g2.multiply( -30 - this.options.LineWidth.val ) );
    
    if(this.options.WierdBorders.val)
    {
     
      let cp2 = this.spline_and_arc_cross_section(wSide2, s1_middle, flank_line_distance);
      let cp1 = this.spline_and_arc_cross_section(wSide3, s1_middle, flank_line_distance);
 
      if(cp2 && cp1)
      {
        let circle50m = new ArcTask( this.tasks.length, [cp2, goal1_circle_middle1, cp1], s1_middle, false, false, true )
        this.tasks.push(circle50m);
      }
      if(this.options.DashedArcs40m.val)
      {
        let cp2 = this.spline_and_arc_cross_section(wSide2, s1_middle, 40 + this.options.LineWidth.val);
        let cp1 = this.spline_and_arc_cross_section(wSide3, s1_middle, 40 + this.options.LineWidth.val);
        let dash_length = 0.3;
        let dash_space = 0.5;
        this.tasks.push( new ArcTask( this.tasks.length, [ cp1, dashed_goal1_circle, cp2 ], s1_middle, true, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
      if(this.options.DashedArcs30m.val)
      {
        let cp2 = this.spline_and_arc_cross_section(wSide2, s1_middle, 30 + this.options.LineWidth.val);
        let cp1 = this.spline_and_arc_cross_section(wSide3, s1_middle, 30 + this.options.LineWidth.val);
        let dash_length = 0.3;
        let dash_space = 0.5;
        if(!this.options.DashedArcs40m.val)
          this.tasks.push( new ArcTask( this.tasks.length, [ cp1, dashed_goal1_circle, cp2 ], s1_middle, true, false, true ) );
        else
          this.tasks.push( new ArcTask( this.tasks.length, [ cp2, dashed_goal1_circle, cp1 ], s1_middle, false, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
    }
    else
    {
      var crosses1 = side_border1.cross_with_circle_on_same_focal_line( s1_middle, flank_line_distance, back_line1_start );
      var crosses2 = side_border2.cross_with_circle_on_same_focal_line( s1_middle, flank_line_distance, back_line1_start );
      if( crosses1.length && crosses2.length )
        this.tasks.push( new ArcTask( this.tasks.length, [ crosses2[0], goal1_circle_middle1, crosses1[1] ], s1_middle, false, false, true ) );
      if(this.options.DashedArcs40m.val)
      {
        var crosses3 = side_border1.cross_with_circle_on_same_focal_line( s1_middle,  40 + this.options.LineWidth.val, back_line1_start );
        var crosses4 = side_border2.cross_with_circle_on_same_focal_line( s1_middle,  40 + this.options.LineWidth.val, back_line1_start );
        let dash_length = 0.3;
        let dash_space = 0.5;
        this.tasks.push( new ArcTask( this.tasks.length, [ crosses4[1], dashed_goal1_circle, crosses3[0] ], s1_middle, true, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }     
      if(this.options.DashedArcs30m.val)
      {
        var crosses3 = side_border1.cross_with_circle_on_same_focal_line( s1_middle,  30 + this.options.LineWidth.val, back_line1_start );
        var crosses4 = side_border2.cross_with_circle_on_same_focal_line( s1_middle,  30 + this.options.LineWidth.val, back_line1_start );
        let dash_length = 0.3;
        let dash_space = 0.5;
        if(!this.options.DashedArcs40m.val)
          this.tasks.push( new ArcTask( this.tasks.length, [ crosses3[1], dashed_goal1_circle, crosses4[0] ], s1_middle, true, false, true ) );
        else
          this.tasks.push( new ArcTask( this.tasks.length, [ crosses3[0], dashed_goal1_circle, crosses4[1] ], s1_middle, false, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }

    }
    var middle_box_size = this.options["Middle size"].val - this.options.LineWidth.val;
    var box_c1 = middle.add( g1.multiply( middle_box_size / 2 ) ).add( g2.multiply( -middle_box_size / 2 ) );
    var box_c2 = box_c1.add( g1.multiply( -middle_box_size ) );
    var box_c3 = box_c2.add( g2.multiply( middle_box_size ) );
    var box_c4 = box_c3.add( g1.multiply( middle_box_size ) );
    this.tasks.push( new LineTask( this.tasks.length, [ box_c1, box_c2 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ box_c2, box_c3 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ box_c3, box_c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ box_c4, box_c1 ], false, true ) );


    var circle_1_radius = 10 / 2 - this.options.LineWidth.val;
    var c1p1 = middle.add( g1.multiply( circle_1_radius ) );
    var c1p2 = middle.add( g1.multiply( -circle_1_radius ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ c1p1, c1p2 ], middle, true, false, true ) );
    this.tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", 4 ) );

    var circle_2_radius = 3 / 2 - this.options.LineWidth.val;
    var c2p1 = middle.add( g1.multiply( circle_2_radius ) );
    var c2p2 = middle.add( g1.multiply( -circle_2_radius ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ c2p1, c2p2], middle, true, false, true ) );
    this.tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", 4 ) );


    this.tasks.push( new LineTask( this.tasks.length, [ c1p1, c1p2 ], false, true ) );
    // 50m line
    if(this.options.WierdBorders.val)
    {
      let cp3 = this.spline_and_arc_cross_section(wSide4, s2_middle, flank_line_distance);
      let cp4 = this.spline_and_arc_cross_section(wSide1, s2_middle, flank_line_distance);
      if(cp3 && cp4)
      {
        let circle50m1 = new ArcTask( this.tasks.length, [cp3, goal2_circle_middle1, cp4], s2_middle, false, false, true )
        this.tasks.push(circle50m1);
      }
      if(this.options.DashedArcs40m.val)
      {
        cp3 = this.spline_and_arc_cross_section(wSide4, s2_middle, 40 + this.options.LineWidth.val);
        cp4 = this.spline_and_arc_cross_section(wSide1, s2_middle, 40 + this.options.LineWidth.val);
        let dash_length = 0.3;
        let dash_space = 0.5;
        this.tasks.push( new ArcTask( this.tasks.length, [ cp4, dashed_goal2_circle, cp3 ], s2_middle, true, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
      if(this.options.DashedArcs30m.val)
      {
        cp3 = this.spline_and_arc_cross_section(wSide4, s2_middle, 30 + this.options.LineWidth.val);
        cp4 = this.spline_and_arc_cross_section(wSide1, s2_middle, 30 + this.options.LineWidth.val);
        let dash_length = 0.3;
        let dash_space = 0.5;
        if(!this.options.DashedArcs40m.val)
          this.tasks.push( new ArcTask( this.tasks.length, [ cp4, dashed_goal1_circle, cp3 ], s2_middle, true, false, true ) );
        else
          this.tasks.push( new ArcTask( this.tasks.length, [ cp3, dashed_goal2_circle, cp4 ], s2_middle, false, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
    }
    else
    {
      var crosses1 = side_border1.cross_with_circle_on_same_focal_line( s2_middle, flank_line_distance, back_line2_start );
      var crosses2 = side_border2.cross_with_circle_on_same_focal_line( s2_middle, flank_line_distance, back_line2_start );
      if( crosses1.length && crosses2.length )
         this.tasks.push( new ArcTask( this.tasks.length, [ crosses2[1], goal2_circle_middle1, crosses1[0] ], s2_middle, true, false, true ) );
      if(this.options.DashedArcs40m.val)
      {
        var crosses3 = side_border1.cross_with_circle_on_same_focal_line( s2_middle,  40 + this.options.LineWidth.val, back_line2_start );
        var crosses4 = side_border2.cross_with_circle_on_same_focal_line( s2_middle,  40 + this.options.LineWidth.val, back_line2_start );
        let dash_length = 0.3;
        let dash_space = 0.5;
        this.tasks.push( new ArcTask( this.tasks.length, [ crosses3[0], dashed_goal2_circle, crosses4[1] ], s2_middle, false, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
      if(this.options.DashedArcs30m.val)
      {
        var crosses3 = side_border1.cross_with_circle_on_same_focal_line( s2_middle,  30 + this.options.LineWidth.val, back_line2_start );
        var crosses4 = side_border2.cross_with_circle_on_same_focal_line( s2_middle,  30 + this.options.LineWidth.val, back_line2_start );
        let dash_length = 0.3;
        let dash_space = 0.5;
        if(this.options.DashedArcs40m.val)
          this.tasks.push( new ArcTask( this.tasks.length, [ crosses3[1], dashed_goal2_circle, crosses4[0] ], s2_middle, true, false, true ) );
        else
          this.tasks.push( new ArcTask( this.tasks.length, [ crosses3[0], dashed_goal2_circle, crosses4[1] ], s2_middle, false, false, true ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
        this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", 0.8 ) );
      }
    }
    // this.refresh_bb();
    // this.refresh_test_run();
    
    this.test_tasks = [];
    if(!this.options.WierdBorders.val)
    {
      this.test_tasks.splice( goalend1_end_index, 0, elipse1T );
      //elipse2T.id = this.tasks.length;
      this.test_tasks.push( elipse2T );
    }
    else
    {
      this.test_tasks.push(new LineTask(this.test_tasks.length, [wSide2.end, wSide3.start], false, false));
      this.test_tasks.push( wSide3 );
      this.test_tasks.push( wSide4 );
      this.test_tasks.push(new LineTask(this.test_tasks.length, [wSide4.end, wSide1.start], false, false));
      this.test_tasks.push( wSide1 );
      this.test_tasks.push( wSide2 );
    }
    
    //this.convert_to_free_hand()
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();      
    
  }

  filterHandles() {
    const filtered = this.handles.filter( handle => handle.name !== "Width");
    this.handles = filtered;
  }

  setPitchWidthInIndependantMode() {
    const newWidth = this.options.widthSideOne.val + this.options.widthSideTwo.val;
    this.set_new_val(this.options.Width, newWidth, false);
  }

  refresh_handles()
  {
    let this_class = this;
    super.refresh_handles();

    if (this.options.independentSidelines.val) {
      this.filterHandles();
      const center = this.points[0]
      const points = this.drawing_points;
      const verticalVector = new Line(points[3], points[0]).unit_vector;

      const lineOneHandlePosition = center.subtract(verticalVector.multiply(this.options.widthSideOne.val));
      const lineTwoHandlePosition = center.add(verticalVector.multiply(this.options.widthSideTwo.val));

      this.handles.push(new Handle(lineOneHandlePosition, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function(new_pos_v, snapping_lines) {
        let new_width = new Line(center, new_pos_v).length;
        this_class.set_new_val( this_class.options.widthSideOne, new_width, false );
        this_class.setPitchWidthInIndependantMode();
        }, 
        function( new_width ) {  
          return this_class.set_new_val( this_class.options.widthSideOne, new_width, false );
        }) 
      );
      this.handles.push(new Handle(lineTwoHandlePosition, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function(new_pos_v, snapping_lines) {
        let new_width = new Line(center, new_pos_v).length;
        this_class.set_new_val( this_class.options.widthSideTwo, new_width, false );
        this_class.setPitchWidthInIndependantMode();        
        }, 
        function( new_width ) {  
          return this_class.set_new_val( this_class.options.widthSideTwo, new_width, false );
        }) 
      );
    }
    else if(this_class.options.WierdBorders.val) {
      var p = this.drawing_points;
      //let point1
      let c1;
      let c2;
      let c3;
      let c4;
      let post;
      if(this.layout_method ===  "all_goal_posts")
      {
        //this.convert_to_free_hand();
        c1 = p[6];
        c2 = p[11];
        c3 = p[0];
        c4 = p[5];
        post = p[4];
      }
      else
      {
        c1 = p[0];
        c2 = p[3];
        c3 = p[4];
        c4 = p[7];
        post = p[6];
      }
      var g2 = new Line( c1, c4 ).unit_vector;
        //this_class.options.controlPoint1.val = p[0].y;
        let g1 = new Line(c1, c2).unit_vector;  
    
        if(this_class.options["Control point 1"].val <= 0)
        {
          this_class.options["Control point 1"].val = 30;
        }
        let g = new Line(c4, post);
        let point1 = g.start.add(g1.multiply(this_class.options["Control point 1"].val));
      
    
      //g2 = g2.add(g1.multiply(10));

      this.handles.push( new Handle( point1, -this.options.Angle.val + Math.PI / 2, "Control point 1", "move_handle_onedirection", "yellow_move_handle_onedirection", function( new_pos_v, snapping_lines )
      {
        let new_length = g.start.dist_to_point(new_pos_v);
        let max_l_guide = post.subtract(g1.multiply(this_class.options.outerGoalLine.val));
        let max_length = c4.dist_to_point(max_l_guide);
        if(new_length > max_length)
          this_class.set_new_val(this_class.options["Control point 1"], max_length);   
        else
          this_class.set_new_val(this_class.options["Control point 1"], new_length);

      }, function( new_length )
      { 
        return this_class.set_new_val(this_class.options["Control point 1"], new_length);
      } ) );

      let pguide = new Line(c1, c4).middle;
      let pguide2 = new Line(pguide, c4);
      if(this_class.options["Control point 2"].val <= 0)
      {
        this_class.options["Control point 2"].val = 40;
      }
      let point2 = pguide2.start.add(g2.multiply(this_class.options["Control point 2"].val));
      this.handles.push( new Handle( point2, -this.options.Angle.val, "Control point 2", "move_handle_onedirection", "yellow_move_handle_onedirection", function( new_pos_v )
      {
        let new_length = pguide2.start.dist_to_point(new_pos_v);
        let max_length = pguide.dist_to_point(c4);
        if(new_length > max_length)
          this_class.set_new_val(this_class.options["Control point 2"], max_length);   
        else
          this_class.set_new_val(this_class.options["Control point 2"], new_length);
      }, function( new_length )
      { 
        return this_class.set_new_val(this_class.options["Control point 2"], new_length);
      } ) );
    }
  }
}

