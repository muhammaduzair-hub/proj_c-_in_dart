/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global this, BACKWARDS_MAX_SPEED, robot_controller, pt, SETTINGS, login_screen_controller, popup_screen_controller, event_controller, pitch_generator */

class soccer_pitch extends square_pitch
{
  static template_type = "Soccer";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed in advance menu
    // adjustable = can be changed from the bottombar.
    this.options["Technical lines"] = {
      name: "Technical lines",
      val: false,
      type: "bool",
      configurable: false
    };


    this.options["Technical lines distance"] = {
      val: 9.15,
      type: "float"
    };
    this.options.IsFieldAmerican = {
      configurable : false,
      name : "Check",
      type : "bool", 
      val  : false,
    };
    this.options.KickFieldRadius = {
      adjustable: false,
      name: "KickFieldRadius",
      val: 0.06,
      type: "float",
      "dontsave": true
    };
    this.options.CenterCircleRadius = {
      adjustable: false,
      name: "CenterCircleRadius",
      val: 0,
      type: "float",
      "dontsave": true
    };
    this.options.DrawCorners = {
      name: "Draw corners",
      val: false,
      type: "bool"
    };
    this.options.reciseCenterCirlce = {
      val: true,
      type: "bool"
    };
    this.options["Center circle"] = {
      configurable: false,
      name: "Center circle",
      val: true,
      type: "bool"
    };

    this.options["running lines"] = {
      configurable: true,
      name: "Continuous lines",
      val: false,
      type: "bool"
    };

    this.options.CornerRadius = {
      name: "CornerRadius",
      val: 1.0,
      type: "float"
    };
    this.options.KickFieldsAsDots = {
      configurable: true,
      adjustable: false,
      name: "Spots as dots",
      val: false,
      type: "bool"
    };
    this.options.makeFieldsSkew = {
      configurable: false,
      name: "makeFieldsSkew",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options.alignWithBackLine = {
      configurable: false,
      name: "alignWithBackLine",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options.ScalePitch = {
      configurable: false,
      name: "Scale pitch",
      val: false,
      type: "bool"
    };
    this.options.reverseInGoal = {
      adjustable: false,
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
    this.options.goalPoleWidth = {
      adjustable: false,
      name: "goalPoleWidth",
      val: 0.12,
      type: "float",
      "dontsave": true
    };
    this.options.MakeKickDot = {
      configurable: false,
      name: "Kickoff spot",
      val: true,
      type: "bool"
    };
    this.options.MakeBuildOut = {
      configurable: false,
      name: "Build Out lines",
      val: false,
      type: "bool"
    };
    this.options.CenterBuildOutLine = {
      get configurable(){
        return this_class.options.MakeBuildOut.val;
      },
      name: "Center build out lines",
      type: "bool",
      val: true,
      prev_sibling: "MakeBuildOut"
    }
    this.options.DashBuildOut = {
      get configurable( )
      {
        return this_class.options.MakeBuildOut.val;
      },
      name: "Dashed Build Out",
      val: false,
      type: "bool",
      prev_sibling: "MakeBuildOut"
    };
    this.options.DashFactorBuildOut = {
      dontsave: true,
      val: (100 / 51) / 100
    };
    this.options.BuildOutDistFromMiddle = {
      dontsave: true,
      val: 0
    };
    this.options.BuildOutDistPercentageVal = {
      get configurable( )
      {
        return !this_class.options.BuildOutDistFromMiddle.val && this_class.options.MakeBuildOut.val && !this_class.options.CenterBuildOutLine.val;
      },
      _val: 30,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if(v < 0)
          this._val = 0;
        else if(v > 50)
          this._val = 50
        else
          this._val = v;
      },
      name: "Retreat line distance %",
      type: "float",
      prev_sibling: "MakeBuildOut"
    }

    this.options.AllowCoarseStart = {
      get configurable( )
      {
        if( !robot_controller.chosen_robot_id )
          return true;
        if( !robot_controller.robot_has_capability( "bezier_task" ) )
          return false;
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "drive_around_goal" ) >= 0 )
          return login_screen_controller.user_level === user_level.DEVELOPER;
        return false;
      },
      name: "Allow coarse start",
      val: true,
      type: "bool"
    };
    this.options.FluentRun = {
      configurable: false,
      name: "FluentRun",
      val: false,
      type: "bool",
      "dontsave": false
    };
    this.options.CenterCross = {
      configurable : false,
      name : "Center line length",
      type : "float",
      val  : (2).foot2meter(),
      prev_sibling : "CenterLayoutMethod"
    };
    this.options.PenaltyCross = {
      configurable : false,
      name : "Penalty line length",
      type : "float",
      val  : (2).foot2meter(),
      prev_sibling : "PenaltyLayoutMethod"
    };

    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
      this.options.reverseInGoal.val = true;
    this.options["Goal corners"] = {
      name: "Goal corners",
      val: false,
      type: "bool"
    };
    this.options["1"] = {
      name: "1",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options["2"] = {
      name: "2",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options["3"] = {
      name: "3",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options["4"] = {
      name: "4",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options["5"] = {
      name: "5",
      val: true,
      type: "bool",
      "dontsave": true
    };
    this.options["corner_markings_only"] = {
      name: "Corner markings",
      val: false,
      type: "bool",
      configurable: false
    }
  }

  create_goalend( which_end )
  {

    var p = this.drawing_points;
    var c1 = p[0 + which_end * 4];
    var p1 = p[1 + which_end * 4];
    var p2 = p[2 + which_end * 4];
    var c2 = p[3 + which_end * 4];
    var this_goal_middle = new Line( p1, p2 ).middle;
    var oposite = 1 - which_end;
    var p3 = p[1 + oposite * 4];
    var p4 = p[2 + oposite * 4];
    var c3 = p[0 + oposite * 4];
    var c4 = p[3 + oposite * 4];
    var oposite_goal_middle = new Line( p3, p4 ).middle;
    var field_guide = new Line( this_goal_middle, oposite_goal_middle ).unit_vector;
    var g2;
    if( this.options.alignWithBackLine.val )
      g2 = new Line( p1, p2 ).unit_vector; // along backline
    else
      g2 = new Line( c1, c2 ).unit_vector; // along backline
    var g1 = g2.rotate( -Math.PI / 2 ); // along the long side
    var middle = new Line( p1, p2 ).middle;
    var build_out_vector;
    var corners;

    if(this.options["corner_markings_only"].val)
    {
      //Corner markings only
      
      let c1p1 = c1;
      let c1p2 = c1.add(g2.multiply(0.5));
      let c2p1 = c2;
      let c2p2 = c2.subtract(g2.multiply(0.5));

      let penaltyP1;
      let penaltyP1p2;
      let penaltyP2;
      let penaltyP2p2;
      let penaltyP3;
      let penaltyP4;

      let penaltyP3p1;
      let penaltyP3p2;

      let penaltyP4p1; 
      let penaltyP4p2;

      let penaltyMid; 
      let penaltyMid1; 
      let penaltyMid2;

      let blMid;
      let blMid1; 

      if(this.options.Fields.val.length === 0)
      {
        penaltyP1 = this_goal_middle.add(g2.multiply(this.options.GoalWidth.val/2));
        penaltyP1p2 = penaltyP1.subtract(g2.multiply(0.2).rotate_90_cw());
  
        penaltyP2 = this_goal_middle.subtract(g2.multiply(this.options.GoalWidth.val/2));
        penaltyP2p2 = penaltyP2.subtract(g2.multiply(0.2).rotate_90_cw());
      }
      else
      {
        penaltyP1 = this_goal_middle.add(g2.multiply(this.options.Fields.val[0].width/2));
        penaltyP1p2 = penaltyP1.add(g2.multiply(0.5).rotate_90_cw());

        penaltyP2 = this_goal_middle.subtract(g2.multiply(this.options.Fields.val[0].width/2));
        penaltyP2p2 = penaltyP2.add(g2.multiply(0.5).rotate_90_cw());
      }
      
      if((this.options.Fields.val.length === 1))
      {
        penaltyP3 = penaltyP1.add(g2.multiply(this.options.Fields.val[0].length - this.options.LineWidth.val).rotate_90_cw());
        penaltyP4 = penaltyP2.add(g2.multiply(this.options.Fields.val[0].length - this.options.LineWidth.val).rotate_90_cw());
        penaltyP3p1 = penaltyP3.add(g2.multiply(0.5).rotate_90_ccw());
        penaltyP3p2 = penaltyP3.subtract(g2.multiply(0.5));

        penaltyP4p1 = penaltyP4.add(g2.multiply(0.5).rotate_90_ccw());
        penaltyP4p2 = penaltyP4.add(g2.multiply(0.5));

        penaltyMid = new Line(penaltyP4, penaltyP3).middle;
        penaltyMid1 = penaltyMid.add(g2.multiply(0.25));
        penaltyMid2 = penaltyMid.subtract(g2.multiply(0.25));

        blMid = new Line(penaltyP1, penaltyP2).middle;
        blMid1 = blMid.add(g2.multiply(0.5).rotate_90_ccw());
      }
       
      let local_field_guide = g1;
      var kick_dot;
      
      if(!(this.options.Fields.val.length === 0))
      {
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[0].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        if( this.options.Fields.val[0].kick_spot_from_back - this.options.LineWidth.val / 2 );
        {
            if(this.options.IsFieldAmerican.val){
              if( this.options.MakeKickDot.val ){
                if(this.options.PenaltyLayoutMethod.val == "Dot")
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Circle")
             kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Cross"){
              let g2 = new Line(c1, c2).unit_vector;
              let g1 = g2.rotate((90).deg2rad()); 
               let cross_point = kick_center;
               let cross_pointR = cross_point.add(g1.multiply(this.options.PenaltyCross.val / 2));
               let cross_point1 = cross_pointR.add(g2.multiply(this.options.PenaltyCross.val /2));
               let cross_point2 = cross_point1.subtract(g1.multiply(this.options.PenaltyCross.val));
               let cross_point3 = cross_point2.subtract(g2.multiply(this.options.PenaltyCross.val));
               let cross_point4 = cross_point3.add(g1.multiply(this.options.PenaltyCross.val));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
             }else if(this.options.PenaltyLayoutMethod.val == "Line"){
              let g2 = new Line(c1, c2).unit_vector;
              let pt1 = kick_center.add(g2.multiply(this.options.PenaltyCross.val/2));
              let pt2 = kick_center.subtract(g2.multiply(this.options.PenaltyCross.val/2));
              this.tasks.push(new LineTask(this.tasks.length, [pt1, pt2], false, true));
             }
              }
            }else{
          if( this.options.KickFieldsAsDots.val )
          {
            kick_dot = new WaypointTask( this.tasks.length + 1, kick_center, false, true );
            kick_dot = kick_dot.rotate(180); 
          }
          else
          {
            var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
            var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
            kick_dot = new ArcTask( this.tasks.length + 1, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
            kick_dot = kick_dot.rotate(180)

          }
        }
      }

      }
     

      if(which_end === 0)
      {
        this.tasks.push(new LineTask(this.tasks.length, [c1p1, c1p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP1, penaltyP1p2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3p1, penaltyP3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3, penaltyP3p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyMid1, penaltyMid2], false, true));
        this.tasks.push(kick_dot);

        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4p2, penaltyP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4, penaltyP4p1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP2p2, penaltyP2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [blMid, blMid1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [c2p2, c2p1], false, true));
      }
      if(which_end === 1)
      {
        this.tasks.push(new LineTask(this.tasks.length, [c2p1, c2p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP2, penaltyP2p2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4p1, penaltyP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4, penaltyP4p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyMid2, penaltyMid1], false, true));
        this.tasks.push(kick_dot);

        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3p2, penaltyP3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3, penaltyP3p1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP1p2, penaltyP1], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [blMid, blMid1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [c1p2, c1p1], false, true));
      }
    }
    else
      {
    // draw some of backline and the two goal poles
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    var bl1 = new Line( c1, p1 );
    var bl2 = new Line( p2, c2 );
    if( !this.options.reverseInGoal.val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, p1 ], false, true ) );
    }
    if( !this.options ["running lines"] )
    {
// mark goal poles
      if( !this.options.reverseInGoal.val && !(this.options.Fields.val.length % 2) )
      {
        if( this.get_option_val( "Right goal pole" ) )
          //if ( this.options.DrawRightGoalPole.val )
          this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
        if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }
    }
    if( !this.options.reverseInGoal.val )
    {
     this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      if( !this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
        this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
    }

    var outer_dot = undefined;
    // make fields
    var fields_drawn = 0;
    var start_end = 1;
    var goalcorners;
    var k = 0;
    var fc_array = [ ];

    for( var i = this.options.Fields.val.length - 1; i >= 0; i-- )
    {


      var local_field_guide = g1;
      if( this.options.makeFieldsSkew.val )
        local_field_guide = field_guide;
      var width = (this.options.Fields.val[i].width - this.options.LineWidth.val) * start_end;
      if( (this.options.Width.val < (this.options.Fields.val[i].width + 2 - this.options.LineWidth.val)) && !this.options.Fields.val[i].is_round )
        continue;
      var pitch_length = this.options.Length.val - (this.options.CenterCircleRadius.val * 2);
      var field_length = (this.options.Fields.val[i].length - this.options.LineWidth.val);
      if( this.options.Fields.val[i].arc )
      {
        if( this.options.Fields.val[i].arc.center_from_back !== undefined )
          field_length = this.options.Fields.val[i].arc.radius + this.options.LineWidth.val / 2 + this.options.Fields.val[i].arc.center_from_back - this.options.LineWidth.val / 2;
        else
          field_length = this.options.Fields.val[i].arc.radius + this.options.LineWidth.val / 2 + this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2;
      }
      if( pitch_length < (field_length * 2) )
        continue;
      if( !this.options.Fields.val[i].length && !this.options.Fields.val[i].width )
      {

        var kick_dot;
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
        {
            if(this.options.IsFieldAmerican.val){
              if( this.options.MakeKickDot.val ){
                if(this.options.PenaltyLayoutMethod.val == "Dot")
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Circle")
             kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Cross"){
              let g2 = new Line(c1, c2).unit_vector;
              let g1 = g2.rotate((90).deg2rad()); 
               let cross_point = kick_center;
               let cross_pointR = cross_point.add(g1.multiply(thisthis.options.PenaltyCross.val / 2));
               let cross_point1 = cross_pointR.add(g2.multiply(this.options.PenaltyCross.val /2));
               let cross_point2 = cross_point1.subtract(g1.multiply(this.options.PenaltyCross.val));
               let cross_point3 = cross_point2.subtract(g2.multiply(this.options.PenaltyCross.val));
               let cross_point4 = cross_point3.add(g1.multiply(this.options.PenaltyCross.val));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
             }else if(this.options.PenaltyLayoutMethod.val == "Line"){
              let g2 = new Line(c1, c2).unit_vector;
              let pt1 = kick_center.add(g2.multiply(this.options.PenaltyCross.val/2));
              let pt2 = kick_center.subtract(g2.multiply(this.options.PenaltyCross.val/2));
              this.tasks.push(new LineTask(this.tasks.length, [pt1, pt2], false, true));
             }
              }
            }else{
          if( this.options.KickFieldsAsDots.val )
            kick_dot = new WaypointTask( this.tasks.length + 1, kick_center, false, true );
          else
          {

            var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
            var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
            kick_dot = new ArcTask( this.tasks.length + 1, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
          }
        }
      }

        this.tasks.push( kick_dot );
        continue;
      }
      var fc1 = middle.add( g2.multiply( width / 2 ) );

      var fc2 = fc1.add( local_field_guide.multiply( this.options.Fields.val[i].length - this.options.LineWidth.val ) );
      if( width >= this.options.Width.val )
        fc1 = c2;
      var fc1_line = new Line( fc1, fc2 );
      if( start_end > 0 )
        fc1 = fc1_line.cross_with_line( bl2 );
      else
        fc1 = fc1_line.cross_with_line( bl1 );

      if( !outer_dot )
      {
        if( this.options.reverseInGoal.val )
        {
          let tasks;
          if( this.options["running lines"].val === true )
          {
            tasks = drive_around_goal_posts( this, c1, p1, p2, c2, 2, this.tasks.length, this.options.goalPoleWidth.val );
            var b = tasks.last( -1 ).end;
            tasks.pop();
            tasks.pop();
            tasks[0].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
            tasks[0].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
            // brug last end til at finde det sidste element gem det og derefter smid det
          }
          else
          {
            tasks = drive_around_goal_posts( this, c1, p1, p2, fc1, 2, this.tasks.length, this.options.goalPoleWidth.val );
          }



          this.tasks.pushAll( tasks );
          if( this.options["running lines"].val === true )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ c2, b ], false, true ) );
            this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
            SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
          }
        }
        else
        {
          if( this.options["running lines"].val === true )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, c2 ], false, true ) );
          }
          else
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, fc1 ], false, true ) );
          }
        }
        outer_dot = fc1;
      }

      if( this.options["Goal corners"].val && !goalcorners )
      {
        if( which_end === 0 )
        {
          this.create_goal_corner( 1, fc1, fc2 );
          goalcorners = 1;
        }
        else
        {
          this.create_goal_corner( 3, fc1, fc2 );
          goalcorners = 1;
        }
      }

      var fc3 = fc2.add( g2.multiply( -(this.options.Fields.val[i].width - this.options.LineWidth.val) * start_end ) );
      var fc4 = fc3.add( local_field_guide.multiply( -(this.options.Fields.val[i].length - this.options.LineWidth.val) ) );
      if( width >= this.options.Width.val )
        fc4 = c1;

      if( this.options.Fields.val[i].is_round )
      {

        let arc_radius_l = this.options.Fields.val[i].length - this.options.LineWidth.val;
        let arc_radius_w = this.options.Fields.val[i].width / 2 - this.options.LineWidth.val / 2;
        let arc_radius = (arc_radius_l < arc_radius_w) ? arc_radius_l : arc_radius_w;
        let arc1_c1 = fc2.subtract( local_field_guide.multiply( arc_radius ) );
        let arc1_c2 = fc2.subtract( g2.multiply( arc_radius ) );
        let arc1_cent = arc1_c2.subtract( local_field_guide.multiply( arc_radius ) );

        let arc2_c1 = fc3.add( g2.multiply( arc_radius ) );
        let arc2_c2 = fc3.subtract( local_field_guide.multiply( arc_radius ) );
        let arc2_cent = arc2_c1.subtract( local_field_guide.multiply( arc_radius ) );

        var arc1 = (Arc.From2PointsAndCenter( arc1_c1, arc1_c2, arc1_cent, true ));
        var arc2 = (Arc.From2PointsAndCenter( arc2_c1, arc2_c2, arc2_cent, true ));

        if( width < this.options.Width.val )
        {
          let l1 = new LineTask( this.tasks.length, [ fc1, arc1_c1 ], false, true );
          if( !l1.length.veryclose( 0 ) )
          {
            this.tasks.push( l1 );
          }
        }
        else
        {
          let side1_l = new Line( c2, c3 );
          let side2_l = new Line( c1, c4 );

          arc1_c1 = arc1.crosses_with_line( side1_l, true )[0];
          arc2_c2 = arc2.crosses_with_line( side2_l, true )[0];
        }

        arc1 = (Arc.From2PointsAndCenter( arc1_c1, arc1_c2, arc1_cent, true ));
        arc2 = (Arc.From2PointsAndCenter( arc2_c1, arc2_c2, arc2_cent, true ));
        if(this.options["running lines"].val)
        {
          this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) );
          this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) );
        }
        else
          this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) );
        
        let l2 = new LineTask( this.tasks.length, [ arc1_c2, arc2_c1 ], false, true );
        if( !l2.length.veryclose( 0 ) )
          this.tasks.push( l2 );

        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val ) );
        //this.options.KickFieldRadius.val
        var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
        if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
        {
            if(this.options.IsFieldAmerican.val){
              if( this.options.MakeKickDot.val ){
                if(this.options.PenaltyLayoutMethod.val == "Dot")
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Circle")
             {
                 if(this.options.KickFieldsAsDots.val){
              kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             }else{
              kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
             }
            }
             else if(this.options.PenaltyLayoutMethod.val == "Cross"){
              let g2 = new Line(c1, c2).unit_vector;
              let g1 = g2.rotate((90).deg2rad()); 
               let cross_point = kick_center;
               let cross_pointR = cross_point.add(g1.multiply(this.options.PenaltyCross.val / 2));
               let cross_point1 = cross_pointR.add(g2.multiply(this.options.PenaltyCross.val /2));
               let cross_point2 = cross_point1.subtract(g1.multiply(this.options.PenaltyCross.val));
               let cross_point3 = cross_point2.subtract(g2.multiply(this.options.PenaltyCross.val));
               let cross_point4 = cross_point3.add(g1.multiply(this.options.PenaltyCross.val));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
             }else if(this.options.PenaltyLayoutMethod.val == "Line"){
              let g2 = new Line(c1, c2).unit_vector;
              let pt1 = kick_center.add(g2.multiply(this.options.PenaltyCross.val/2));
              let pt2 = kick_center.subtract(g2.multiply(this.options.PenaltyCross.val/2));
              this.tasks.push(new LineTask(this.tasks.length, [pt1, pt2], false, true));
             }
              }
            }else{
          if( this.options.KickFieldsAsDots.val )
            this.tasks.push( new WaypointTask( this.tasks.length + 1, kick_center, false, true ) );
          else
            this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide1, kick_guide2 ], kick_center, false, false, true ) );
        }
      }
        if(!this.options["running lines"].val)
        this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) );

        if( width < this.options.Width.val )
        {
          let l3 = new LineTask( this.tasks.length, [ arc2_c2, fc4 ], false, true );
          if( !l3.length.veryclose( 0 ) )
            this.tasks.push( l3 );
        }

      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ fc1, fc2 ], false, true ) );

       

        var fc2_line = new Line( fc3, fc4 );
        if( start_end > 0 )
          fc4 = fc2_line.cross_with_line( bl1 );
        else
          fc4 = fc2_line.cross_with_line( bl2 );
        // kick field setup
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        //this.options.KickFieldRadius.val
        var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
        var field_line = new Line( fc2, fc3 );
        if( this.options.Fields.val[i].arc )
        {
          let center_from_back = (this.options.Fields.val[i].arc.center_from_back !== undefined) ? this.options.Fields.val[i].arc.center_from_back : this.options.Fields.val[i].kick_spot_from_back;
          let arc_center = middle.add( local_field_guide.multiply( center_from_back - this.options.LineWidth.val / 2 ) );

          var crosses = field_line.crosses_with_circle( arc_center, this.options.Fields.val[i].arc.radius - this.options.LineWidth.val / 2 );
          var arc_guide = arc_center.add( local_field_guide.multiply( this.options.Fields.val[i].arc.radius - this.options.LineWidth.val / 2 ) );
          this.tasks.push( new LineTask( this.tasks.length, [ fc2, crosses[1] ], false, true ) );
          var the_arc = new ArcTask( this.tasks.length, [ crosses[1], arc_guide, crosses[0] ], arc_center, false, false, true );

          // kick_arc
          if( this.options["running lines"].val === true )
          {

            var rest_of_field = new LineTask( this.tasks.length, [ crosses[1], fc3 ], false, true );
            rest_of_field.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
            this.tasks.push( rest_of_field );

            this.tasks.push( the_arc );
            // kick_dot
            var kick_dot;
            if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
            {
                if(this.options.IsFieldAmerican.val){
              if( this.options.MakeKickDot.val ){
                if(this.options.PenaltyLayoutMethod.val == "Dot")
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Circle")
             {
              if(this.options.KickFieldsAsDots.val){
                {
              kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
                }
             }else{
             kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
             }
            }
             else if(this.options.PenaltyLayoutMethod.val == "Cross"){
              let g2 = new Line(c1, c2).unit_vector;
              let g1 = g2.rotate((90).deg2rad()); 
               let cross_point = kick_center;
               let cross_pointR = cross_point.add(g1.multiply(this.options.PenaltyCross.val / 2));
               let cross_point1 = cross_pointR.add(g2.multiply(this.options.PenaltyCross.val /2));
               let cross_point2 = cross_point1.subtract(g1.multiply(this.options.PenaltyCross.val));
               let cross_point3 = cross_point2.subtract(g2.multiply(this.options.PenaltyCross.val));
               let cross_point4 = cross_point3.add(g1.multiply(this.options.PenaltyCross.val));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
             }else if(this.options.PenaltyLayoutMethod.val == "Line"){
              let g2 = new Line(c1, c2).unit_vector;
              let pt1 = kick_center.add(g2.multiply(this.options.PenaltyCross.val/2));
              let pt2 = kick_center.subtract(g2.multiply(this.options.PenaltyCross.val/2));
              this.tasks.push(new LineTask(this.tasks.length, [pt1, pt2], false, true));
             }
              }
            }else{
              if( this.options.KickFieldsAsDots.val )
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
              else
                kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
            }
          }
            this.tasks.push( kick_dot );

            const viaTask = new WaypointTask(this.tasks.length, crosses[0], false, false, true);
            this.tasks.push(viaTask);

            // Make pitchinpitcc kick dot
            if( i === (this.options.Fields.val.length - 1) )
            {
              if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
              {
                var c3 = p[0 + oposite * 4];
                var c4 = p[3 + oposite * 4];
                var m1 = new Line( c1, c4 ).middle;
                var m2 = new Line( c2, c3 ).middle;
                var cm = new Line( c1, c2 ).middle;
                var mm = new Line( m1, m2 ).middle;
                var m = new Line( cm, mm ).middle;
                this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
              }
            }


          }
          else
          {
            this.tasks.push( the_arc );
            // kick_dot
            var kick_dot;
            if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
            {
              if(this.options.IsFieldAmerican.val){
              if( this.options.MakeKickDot.val ){
                if(this.options.PenaltyLayoutMethod.val == "Dot")
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             else if(this.options.PenaltyLayoutMethod.val == "Circle")
             {
             if(this.options.KickFieldsAsDots.val){
              kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
             }else{
              kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
             }
            }
             else if(this.options.PenaltyLayoutMethod.val == "Cross"){
              let g2 = new Line(c1, c2).unit_vector;
              let g1 = g2.rotate((90).deg2rad()); 
               let cross_point = kick_center;
               let cross_pointR = cross_point.add(g1.multiply(this.options.PenaltyCross.val / 2));
               let cross_point1 = cross_pointR.add(g2.multiply(this.options.PenaltyCross.val /2));
               let cross_point2 = cross_point1.subtract(g1.multiply(this.options.PenaltyCross.val));
               let cross_point3 = cross_point2.subtract(g2.multiply(this.options.PenaltyCross.val));
               let cross_point4 = cross_point3.add(g1.multiply(this.options.PenaltyCross.val));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
                this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
             }else if(this.options.PenaltyLayoutMethod.val == "Line"){
              let g2 = new Line(c1, c2).unit_vector;
              let pt1 = kick_center.add(g2.multiply(this.options.PenaltyCross.val / 2));
              let pt2 = kick_center.subtract(g2.multiply(this.options.PenaltyCross.val / 2));
              this.tasks.push(new LineTask(this.tasks.length, [pt1, pt2], false, true));
             }
              }
            }else{
              if( this.options.KickFieldsAsDots.val )
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
              else
                kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
            }
            }
            this.tasks.push( kick_dot );
            // Make pitchinpitcc kick dot
            if( i === (this.options.Fields.val.length - 1) )
            {

              if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
              {
                var c3 = p[0 + oposite * 4];
                var c4 = p[3 + oposite * 4];
                var m1 = new Line( c1, c4 ).middle;
                var m2 = new Line( c2, c3 ).middle;
                var cm = new Line( c1, c2 ).middle;
                var mm = new Line( m1, m2 ).middle;
                var m = new Line( cm, mm ).middle;
                this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
              }
            }

            var rest_of_field = new LineTask( this.tasks.length, [ crosses[1], fc3 ], false, true );
            rest_of_field.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
            this.tasks.push( rest_of_field );
          }
        }
        else
        {
          if(this.options["running lines"].val)
            this.tasks.push( new LineTask( this.tasks.length, [ fc2, fc3 ], false, true ) );
          else  
            this.tasks.push( new LineTask( this.tasks.length, [ fc2, field_line.middle ], false, true ) );
          // kick_dot
          if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
          {
            if( this.options.KickFieldsAsDots.val )
              this.tasks.push( new WaypointTask( this.tasks.length + 1, kick_center, false, true ) );
            else
              this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide1, kick_guide2 ], kick_center, false, false, true ) );
          }
// Make pitchinpitcc kick dot
          if( i === (this.options.Fields.val.length - 1) )
          {

            if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
            {
              var c3 = p[0 + oposite * 4];
              var c4 = p[3 + oposite * 4];
              var m1 = new Line( c1, c4 ).middle;
              var m2 = new Line( c2, c3 ).middle;
              var cm = new Line( c1, c2 ).middle;
              var mm = new Line( m1, m2 ).middle;
              var m = new Line( cm, mm ).middle;
              this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
            }
          }
          if(!this.options["running lines"].val)
          {
            this.tasks.push( new LineTask( this.tasks.length, [ field_line.middle, fc3 ], false, true ) );
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
          }
        }

        this.tasks.push( new LineTask( this.tasks.length, [ fc3, fc4 ], false, true ) );
        //if(k === 0){this.tasks.push( new LineTask( this.tasks.length, [ fc2, fc4 ], false, true ) );}
      }
      start_end *= -1;
      fields_drawn++;
      if( !build_out_vector )
      {
        build_out_vector = new Line( fc1, fc2 ).unit_vector;
        corners = [ fc2, fc3 ];
      }

      if( this.options["Goal corners"].val && goalcorners === 1 )
      {
        if( which_end === 0 )
        {
          this.create_goal_corner( 0, fc4, fc3 );
          goalcorners = 2;
        }
        else
        {
          this.create_goal_corner( 2, fc4, fc3 );
          goalcorners = 2;
        }


      }

      if( k === 0 )
      {
        fc_array.push( fc1, fc2, fc3, fc4 );
        k++;
      }

    }

    if( fc_array.length )
    {
      this.snapping_lines.push( new Line( fc_array[0], fc_array[1] ) );
      this.snapping_lines.push( new Line( fc_array[2], fc_array[3] ) );
      this.snapping_lines.push( new Line( fc_array[1], fc_array[2] ) );
    }




    if( !this.options.reverseInGoal.val && (this.options.Fields.val.length % 2) )
    {
      if( this.get_option_val( "Right goal pole" ) )
        //if ( this.options.DrawRightGoalPole.val )
        this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
        this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
    }

    if( fields_drawn % 2 )
    {
      if( this.options.reverseInGoal.val )
      {
        // The robot ends on the wrong side of the goal, and there is fixed goal posts.

        //var first_bezier_point = this.tasks.last( ).ends.last( );
        //var last_bezier_point = outer_dot;
        var first_bezier_point = p1.subtract( g2.multiply( 5 ) );
        var last_bezier_point = p2.add( g2.multiply( 7 ) );
        var gbl = new Line( first_bezier_point, last_bezier_point );
        var gb = gbl.unit_vector;
        var gbt = gb.rotate_90_cw( );
        var middle = gbl.middle;
        var bp1 = first_bezier_point.add( gbt.multiply( -0.10 ) );
        var bp2 = first_bezier_point.add( gb );
        var bp3 = middle.add( gbt.multiply( 3 ) );
        var bp4 = last_bezier_point.add( gb.multiply( -4 ) );
        var bp42 = last_bezier_point.add( gb.multiply( -3 ) );
        var bp5 = last_bezier_point.add( gb.multiply( -2 ) );
        this.tasks.push( new CubicBezierTask( this.tasks.length, [ bp1, bp3, bp4, bp42, bp5 ], false, false ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
        if( this.options.AllowCoarseStart.val )
          this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
        
       
      }
    }
    if( this.options ["running lines"] )
    {
// mark goal poles
      if( !this.options.reverseInGoal.val && !(this.options.Fields.val.length % 2) )
      {
        if( this.get_option_val( "Right goal pole" ) )
          //if ( this.options.DrawRightGoalPole.val )
          this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
        if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }

      if( !this.options.reverseInGoal.val )
      {
        if( !this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }
    }
    if( !this.options["running lines"].val )
    {

      if( !outer_dot )
      {
        outer_dot = p2;
        if( this.options.reverseInGoal.val )
        {

          var tasks = drive_around_goal_posts( this, c1, p1, p2, c2, 2, this.tasks.length, this.options.goalPoleWidth.val );
          tasks.forEach( ( t ) => {
            this.tasks.push( t );
          } );
          var last_line = new Line( c2, outer_dot );
          var last_line_length = last_line.length;
          last_line = last_line.add_to_end( -(this.options.goalPoleWidth.val / 2 + 0.2) );
          var bezier_end = this.tasks[this.tasks.length - 1].ends[this.tasks[this.tasks.length - 1].ends.length - 1];
          var ramp = new Line( c2, bezier_end ).length;
          //this.tasks[this.tasks.length - 1].ends.push( ramp.start );
          this.tasks.push( new LineTask( this.tasks.length, [ c2, last_line.end ], true, true ) );
          if( last_line_length < 3 )
            this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
          else
            this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
          SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", ramp ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0.0 ) );
          if( this.options.AllowCoarseStart.val )
            this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          this.tasks.push( new WaypointTask( this.tasks.length, last_line.add_to_end( -0.5 ).end, false, false ) );
        }
        else
        {
          this.tasks.push( new LineTask( this.tasks.length, [ outer_dot, c2 ], false, true ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        }
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ outer_dot, c2 ], false, true ) );
        //To prevent crash into goal post under specific conditions
        let dist2goalpost = fc1.dist_to_point(p2) + 1; 
        if(fields_drawn % 2 && dist2goalpost < settings_screeen_controller.INTERNAL_RAMP)
        {
          let ramp = 0.5;
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", ramp ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", ramp ) );
          
        }
        else{
           this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        }
       
        if( this.options.AllowCoarseStart.val )
          this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      }
    }
    if( !build_out_vector )
    {
      build_out_vector = new Line( p1, p4 ).unit_vector;
      corners = [ p1, p2 ];
    }
    var stuff = [ corners, build_out_vector ];
    return stuff;
    }
  }

  create_merge( l1, l2 )
  {
    let ql1 = l1.add_to_end( 3 );
    let ql12 = l1.add_to_end( 1 );
    ql1.start = l2.start;
    let ql2 = l2.add_to_start( 3 );
    let ql3 = l2.add_to_start( 1 );
    ql2.end = l2.start;
    let qp = ql2.start.add( ql1.as_vector );
    var merge_task = new CubicBezierTask( this.tasks.length, [ ql1.start, ql12.end, ql1.end, qp, ql2.start, ql3.start, ql2.end ], false, false );
    merge_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
    merge_task.task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
    this.tasks.push( merge_task );
  }

  create_side( which_side )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    if(this.options["corner_markings_only"].val){

      let g2 = new Line(c4, c1).unit_vector;
      
      
      let c1p1 = c1;
      let c1p2 = c1.subtract(g2.multiply(0.5));

      let c2p1 = c2;
      let c2p2 = c2.subtract(g2.multiply(0.5));


      let c3p1 = c3;
      let c3p2 = c3.add(g2.multiply(0.5));
      let c4p1 = c4;
      let c4p2 = c4.add(g2.multiply(0.5));

      let side1Mid = new Line(c1, c4).middle;
      let side1Mid1 = side1Mid.add(g2.multiply(0.5));
      let side1Mid2 = side1Mid.subtract(g2.multiply(0.5)); 

      let side2Mid = new Line(c2, c3).middle;
      let side2Mid1 = side2Mid.add(g2.multiply(0.5));
      let side2Mid2 = side2Mid.subtract(g2.multiply(0.5)); 

      if(which_side === 0){
      this.tasks.push(new LineTask(this.tasks.length, [c2p1, c2p2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [side2Mid1, side2Mid2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [c3p2, c3p1], false, true));
      }
      if(which_side === 1){
      this.tasks.push(new LineTask(this.tasks.length, [c1p1, c1p2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [side1Mid1, side1Mid2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [c4p2, c4p1], false, true));
      }
    }
    else{
    if( this.options ["running lines"].val )
    {
      var m1 = c3;
      var m2 = c1;
    }
    else
    {
      var m1 = new Line( c2, c3 ).middle;
      var m2 = new Line( c4, c1 ).middle;
    }
    var l1, l2;
    switch( which_side )
    {
      case 0:
        l1 = c2;
        l2 = m1;
        this.start_locations.push( new StartLocation( l2, this.tasks.length - 1 ) );
        break;
      case 1:
        l1 = m1;
        l2 = c3;
        break;
      case 2:
        l1 = c4;
        l2 = m2;
        this.start_locations.push( new StartLocation( l1, this.tasks.length -1 ) );
        break;
      case 3:
        l1 = m2;
        l2 = c1;
        break;
    }

    var before_feature = this.tasks.length;
    var split = this.create_side_feature( which_side );
    if( split )
    {

      var new_task = new LineTask( this.tasks.length, [ l1, split ], false, true );
      if( which_side === 1 || which_side === 3 )
        new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.splice( before_feature, 0, new_task );
      //this.tasks.push( new_task );

      var new_task = new LineTask( this.tasks.length, [ split, l2 ], false, true );
      new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.push( new_task );
    }
    else
    {
      var new_task = new LineTask( this.tasks.length, [ l1, l2 ], false, true );
      if( which_side === 1 || which_side === 3 )
        new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.push( new_task );
    }

    return new_task.toLine( );
  }
  }
  create_middle( )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var goal_1_middle = new Line( p[1], p[2] ).middle;
    var goal_2_middle = new Line( p[5], p[6] ).middle;
    var goal_middle_middle = new Line( goal_1_middle, goal_2_middle );
    var m2 = new Line( c4, c1 ).middle;
    var m1 = new Line( c2, c3 ).middle;
    var middle_line = new Line( m1, m2 );
    var c;
    if(this.options["corner_markings_only"].val){
      let g2 = new Line(c1, c2).unit_vector;
      let m2p1 = m2.add(g2.multiply(0.5));
      let m1p1 = m1.subtract(g2.multiply(0.5));
      let center = middle_line.middle;
      let center1 = center.add(g2.multiply(0.05));
      let center2 = center.subtract(g2.multiply(0.05));

      this.tasks.push(new LineTask(this.tasks.length, [m1, m1p1], false, true));
      this.tasks.push(new ArcTask( this.tasks.length, [ center1, center2 ], center, true, false, true ));
      this.tasks.push(new LineTask(this.tasks.length, [m2p1, m2], false, true));
    }
    else {
      if( this.options.makeFieldsSkew.val )
        c = middle_line.cross_with_line( goal_middle_middle );
      else
        c = middle_line.middle;
      if( !c )
        c = middle_line.middle;
      var g = middle_line.unit_vector;
      if( !this.options["Middle line"] || this.options["Middle line"].val )
        this.tasks.push( new LineTask( this.tasks.length, [ m1, m2 ], false, true ) );
      if( this.options.CenterCircleRadius.val && this.options["Center circle"].val )
      {
        var use_radius = this.options.CenterCircleRadius.val - this.options.LineWidth.val / 2;
        var center_circle_to_big = false;
        if( ((this.options.Width.val / 3) < (this.options.CenterCircleRadius.val + this.options.LineWidth.val / 2)) || ((this.options.Length.val / 3) < (this.options.CenterCircleRadius.val + this.options.LineWidth.val / 2)) )
          center_circle_to_big = true;

        if( center_circle_to_big && this.options.reciseCenterCirlce.val )
          use_radius = (this.options.Width.val < this.options.Length.val) ? this.options.Width.val / 3 : this.options.Length.val / 3;

        var center_guide1 = c.add( g.multiply( use_radius ) );
        var center_guide2 = c.add( g.multiply( -use_radius ) );
        var big_circle = new ArcTask( this.tasks.length, [ center_guide1, center_guide2 ], c, true, false, true );
        big_circle.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 3.0 ) );

        if( !center_circle_to_big || this.options.reciseCenterCirlce.val )
          this.tasks.push( big_circle );
      }

      var kick_guide1 = c.add( g.rotate_90_cw( ).multiply( -this.options.KickFieldRadius.val ) );
      var kick_guide2 = c.add( g.rotate_90_cw( ).multiply( this.options.KickFieldRadius.val ) );
      let g2 = new Line(c1, c2).unit_vector;
     let g1 = g2.rotate((90).deg2rad()); 
      let cross_point = middle_line.middle;
      let cross_pointR = cross_point.add(g1.multiply(this.options.CenterCross.val / 2));
      let cross_pointL = cross_point.subtract(g1.multiply(this.options.CenterCross.val/2));
      let cross_point1 = cross_pointR.add(g2.multiply(this.options.CenterCross.val /2));
      let cross_point2 = cross_point1.subtract(g1.multiply(this.options.CenterCross.val));
      let cross_point3 = cross_point2.subtract(g2.multiply(this.options.CenterCross.val));
      let cross_point4 = cross_point3.add(g1.multiply(this.options.CenterCross.val));
      let kick_dot;

     if(this.options.IsFieldAmerican.val){
      if( this.options.MakeKickDot.val ){
        if(this.options.CenterLayoutMethod.val == "Dot")
         this.tasks.push( new WaypointTask( this.tasks.length, c, false, true ) );
     else if(this.options.CenterLayoutMethod.val == "Circle")
     if(this.options.KickFieldsAsDots.val){
      kick_dot = new WaypointTask( this.tasks.length, c, false, true );
      this.tasks.push(kick_dot);
     }else
         this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], c, false, false, true ) );
     else if(this.options.CenterLayoutMethod.val == "Cross"){
        this.tasks.push(new LineTask(this.tasks.length, [cross_point1, cross_point3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cross_point2, cross_point4], false, true));
     }else if(this.options.CenterLayoutMethod.val == "Line"){
      this.tasks.push(new LineTask(this.tasks.length, [cross_pointR, cross_pointL], false, true));
    }
      }
     }else{
      if( this.options.MakeKickDot.val )
      {
        if( this.options.KickFieldsAsDots.val )
          this.tasks.push( new WaypointTask( this.tasks.length, c, false, true ) );
        else
          this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], c, false, false, true ) );
      }

      if (this.options["running lines"].val) {
        const viaTask = new WaypointTask(this.tasks.length, m1, false, false, true);
        this.tasks.push(viaTask);
        }
      }
    }

    if(this.options.IsFieldAmerican.val)
    {
      if(this.options.CoachArea.val)
      {
      let mid = new Line(c4, c1).middle;
      let vertical_vector = new  Line(c2, c1).unit_vector;
      let horizontal_vector = new Line(c4,c1).unit_vector;
      let up_mid = mid.add(vertical_vector.multiply(this.options.CoachAreaDistance.val));
      let b_r_off_area = up_mid.add(horizontal_vector.multiply(this.options.OfficialArea.val /2));
      let b_l_off_area = up_mid.subtract(horizontal_vector.multiply(this.options.OfficialArea.val /2));
      let t_l_off_area = b_l_off_area.add(vertical_vector.multiply(this.options.CoachAreaWidth.val));
      let t_r_off_area = t_l_off_area.add(horizontal_vector.multiply(this.options.OfficialArea.val));
      
      let l_coach_area2 = up_mid.subtract(horizontal_vector.multiply(this.options.DistanceBetweenCoachAreas.val));
      let l_coach_area3 = l_coach_area2.subtract(horizontal_vector.multiply(this.options.CoachAreaLength.val));
      let l_coach_area4 = l_coach_area3.add(vertical_vector.multiply(this.options.CoachAreaWidth.val));
      let l_coach_area1 = l_coach_area4.add(horizontal_vector.multiply(this.options.CoachAreaLength.val));

      let r_coach_area3 = up_mid.add(horizontal_vector.multiply(this.options.DistanceBetweenCoachAreas.val));
      let r_coach_area2 = r_coach_area3.add(horizontal_vector.multiply(this.options.CoachAreaLength.val));
      let r_coach_area1 = r_coach_area2.add(vertical_vector.multiply(this.options.CoachAreaWidth.val));
      let r_coach_area4 = r_coach_area1.subtract(horizontal_vector.multiply(this.options.CoachAreaLength.val));
      
      this.tasks.push(new LineTask(this.tasks.length, [l_coach_area3, l_coach_area2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [b_l_off_area, b_r_off_area], false, true) );
      this.tasks.push(new LineTask(this.tasks.length, [r_coach_area3, r_coach_area2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [r_coach_area2, r_coach_area1], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [r_coach_area4, r_coach_area3], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [b_r_off_area, t_r_off_area], false, true) );
      this.tasks.push(new LineTask(this.tasks.length, [t_l_off_area, b_l_off_area], false, true) );
      this.tasks.push(new LineTask(this.tasks.length, [l_coach_area2, l_coach_area1], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [l_coach_area4, l_coach_area3], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [l_coach_area4, l_coach_area1], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [t_l_off_area, t_r_off_area], false, true) );
      this.tasks.push(new LineTask(this.tasks.length, [r_coach_area4, r_coach_area1], false, true));
      }
      if(this.options.RestrainingLine.val)
      {
        var p = this.drawing_points;
        var c1 = p[0];
        var c2 = p[3];
        var c3 = p[4];
        var c4 = p[7];
        let horizontal_vector = new Line(c4, c1).unit_vector;
        let vertical_vector = new Line(c3, c4).unit_vector;

        let l_res_point = c4.add(vertical_vector.multiply(this.options.CoachAreaDistance.val));
        let centr_res_point1 = l_res_point.add(horizontal_vector.multiply(this.options.RestrainingLinesL1.val));
        let top_res_point1 = centr_res_point1.add(vertical_vector.multiply(this.options.RestrainingLinesWidth.val));
        
        let r_res_point = c1.add(vertical_vector.multiply(this.options.CoachAreaDistance.val));
        let centr_res_point2 = r_res_point.subtract(horizontal_vector.multiply(this.options.RestrainingLinesL1.val));
        let top_res_point2 = centr_res_point2.add(vertical_vector.multiply(this.options.RestrainingLinesWidth.val));
        
        this.draw_dashed_lines(l_res_point, centr_res_point1);
        this.draw_dashed_lines(centr_res_point1, top_res_point1);
        this.draw_dashed_lines(top_res_point1, top_res_point2);
        this.draw_dashed_lines(top_res_point2, centr_res_point2);
        this.draw_dashed_lines(centr_res_point2, r_res_point);
      }
    }
  }
  draw_dashed_lines(start, end)
  {
    this.tasks.push(new LineTask(this.tasks.length,[start, end], false, true))
    this.tasks[this.tasks.length -1].task_options.push( new FloatRobotAction( "dashed_length", (2).foot2meter() ) );
    this.tasks[this.tasks.length -1].task_options.push( new FloatRobotAction( "dashed_space",  (2).foot2meter() ) );
  }
  create_corner( corner )
  {
    var p = this.drawing_points;
    var corner_indexes = [ 0, 3, 4, 7 ];
    var corner_index = corner_indexes[corner];
    //this.bb = [p[0], p[3], p[4], p[7]];

    var g1g = p[(corner_index - 1).mod( 8 )];
    var c = p[corner_index]; // 0 3 4 7
    var g2g = p[(corner_index + 1).mod( 8 )];

    var g1 = new Line( c, g1g ).unit_vector;
    var g2 = new Line( c, g2g ).unit_vector;
    if( this.get_option_val( "DrawCorners" ) )
    {
      let ac = c.subtract( g1.multiply( this.options.LineWidth.val / 2 ) ).subtract( g2.multiply( this.options.LineWidth.val / 2 ) );
      var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2);
      // find line upto
      var l1 = (new Line( g1g, c )).crosses_with_circle( ac, corner_radius )[0];

      // find line outfrom
      var l2 = (new Line( g2g, c )).crosses_with_circle( ac, corner_radius )[0];

      // find middle of the two with same radius from corner
      var m = ac.add( new Line( ac, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ l1, m, l2 ], ac, false, false, true ) );
    }
    if(this.options.IsFieldAmerican.val){
      if(this.options.GoalTechnicalLines.val)
      {
        var p = this.drawing_points;
        var c1 = p[0];
        var c2 = p[3];
        var c3 = p[4];
        var c4 = p[7];
      if(corner == 0){
        let tech_line1 = c1.add(g2.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
        let po1 = tech_line1.subtract(g1.multiply(this.options.TechnicalGapLength.val));
        let po2 = po1.subtract(g1.multiply(this.options.TechnicalLinesLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
      }else if(corner == 1 ){
        let tech_line1 = c2.add(g1.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
        let po1 = tech_line1.subtract(g2.multiply(this.options.TechnicalGapLength.val));
        let po2 = po1.subtract(g2.multiply(this.options.TechnicalLinesLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
      }else if(corner == 2){
        let tech_line1 = c3.add(g2.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
        let po1 = tech_line1.subtract(g1.multiply(this.options.TechnicalGapLength.val));
        let po2 = po1.subtract(g1.multiply(this.options.TechnicalLinesLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
      }else if(corner == 3){
        let tech_line1 = c4.add(g1.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
        let po1 = tech_line1.subtract(g2.multiply(this.options.TechnicalGapLength.val));
        let po2 = po1.subtract(g2.multiply(this.options.TechnicalLinesLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
      }
    }
    if(this.options.SideTechnicalLines.val)
    {
      var p = this.drawing_points;
        var c1 = p[0];
        var c2 = p[3];
        var c3 = p[4];
        var c4 = p[7];
        if(corner == 0){
          let tech_line1 = c1.add(g1.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
          let po1 = tech_line1.subtract(g2.multiply(this.options.TechnicalGapLength.val));
          let po2 = po1.subtract(g2.multiply(this.options.TechnicalLinesLength.val));
          this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
        }else if(corner == 1 ){
          let tech_line1 = c2.add(g2.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
          let po1 = tech_line1.subtract(g1.multiply(this.options.TechnicalGapLength.val));
          let po2 = po1.subtract(g1.multiply(this.options.TechnicalLinesLength.val));
          this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
        }else if(corner == 2){
          let tech_line1 = c3.add(g1.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
          let po1 = tech_line1.subtract(g2.multiply(this.options.TechnicalGapLength.val));
          let po2 = po1.subtract(g2.multiply(this.options.TechnicalLinesLength.val));
          this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
        }else if(corner == 3){
          let tech_line1 = c4.add(g2.multiply((this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val));
          let po1 = tech_line1.subtract(g1.multiply(this.options.TechnicalGapLength.val));
          let po2 = po1.subtract(g1.multiply(this.options.TechnicalLinesLength.val));
          this.tasks.push(new LineTask(this.tasks.length, [po1, po2], false, true));
    }
  }    
  }
    if( this.get_option_val( "Technical lines" ) )
    {
      var corner_radius = (this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val;
      // find line upto
      var l1 = c.add( g1.multiply( corner_radius ) );
      var l1_1 = l1.add( g2.multiply( -0.15 ) );
      var l1_2 = l1.add( g2.multiply( -0.4 - 0.15 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ l1_1, l1_2 ], false, true ) );
      // find line outfrom
      var l2 = c.add( g2.multiply( corner_radius ) );
      var l2_1 = l2.add( g1.multiply( -0.15 ) );
      var l2_2 = l2.add( g1.multiply( -0.4 - 0.15 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ l2_1, l2_2 ], false, true ) );
      //this.tasks.push( new LineTask( this.tasks.length, [l1, l2], false, true ) );
    }
  }
  create_goal_corner( corner, new_c, oppo_c )
  {
    var p = this.drawing_points;
    var corner_indexes = [ 0, 3, 4, 7 ];
    var corner_index = corner_indexes[corner];
    var new_g1;
    var new_g2;
    var l1 = 0;
    var l2 = 0;
    var m = 0;
    if( this.get_option_val( "Goal corners" ) )
    {
      if( corner_index === 0 || corner_index === 4 )
      {
        new_g1 = new Line( new_c, oppo_c ).unit_vector;
        new_g2 = new Line( new_c, p[corner_index + 1] ).unit_vector;
        var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2) - Math.sqrt( 2 * Math.pow( this.options.LineWidth.val / 2, 2 ) );
        // find line upto
        l1 = new_c.add( new_g1.multiply( corner_radius ) );
        // find line outfrom
        l2 = new_c.add( new_g2.multiply( corner_radius ) );
        // find middle of the two with same radius from corner
        m = new_c.add( new Line( new_c, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      }
      else
      {
        new_g1 = new Line( new_c, oppo_c ).unit_vector;
        new_g2 = new Line( new_c, p[corner_index - 1] ).unit_vector;
        var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2) - Math.sqrt( 2 * Math.pow( this.options.LineWidth.val / 2, 2 ) );
        // find line upto
        l1 = new_c.add( new_g2.multiply( corner_radius ) );
        // find line outfrom
        l2 = new_c.add( new_g1.multiply( corner_radius ) );
        // find middle of the two with same radius from corner
        m = new_c.add( new Line( new_c, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      }

      this.tasks.push( new ArcTask( this.tasks.length, [ l1, m, l2 ], new_c, false, false, true ) );
    }
  }

  create_side_feature( which_side )
  {
    if( (which_side === 0 || which_side === 3) && !this.get_option_val( "PitchInPitch 1" ) )
      return;
    if( (which_side === 1 || which_side === 2) && !this.get_option_val( "PitchInPitch 2" ) )
      return;
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var m1 = new Line( c2, c3 ).middle;
    var m2 = new Line( c4, c1 ).middle;
    var this_goal_middle = new Line( p[1], p[2] ).middle;
    var oposite_goal_middle = new Line( p[3], p[4] ).middle;
    var field_guide;
    if( which_side >= 2 )
      field_guide = new Line( oposite_goal_middle, this_goal_middle ).unit_vector;
    else
      field_guide = new Line( this_goal_middle, oposite_goal_middle ).unit_vector;
    var s1, s2;
    switch( which_side )
    {
      case 0:
        s1 = c2;
        s2 = m1;
        break;
      case 1:
        s1 = m1;
        s2 = c3;
        break;
      case 2:
        s1 = c4;
        s2 = m2;
        break;
      case 3:
        s1 = m2;
        s2 = c1;
        break;
    }

    var l1, l2;
    if( which_side === 2 || which_side === 1 )
    {
      l1 = new Line( m1, c3 ).middle;
      l2 = new Line( c4, m2 ).middle;
    }
    else if( which_side === 3 || which_side === 0 )
    {
      l1 = new Line( c2, m1 ).middle;
      l2 = new Line( m2, c1 ).middle;
    }
    var mp = new Line( l1, l2 );
    var g2 = mp.unit_vector;
    if( which_side >= 2 )
      g2 = g2.multiply( -1 );
    mp = mp.middle;
    var g1 = new Line( s1, s2 );
    var m = g1.middle;
    g1 = g1.unit_vector;
    //var g2 = g1.rotate_90_cw();
    //var g2 = field_guide.rotate_90_cw();

    var c1 = m.add( g1.multiply( this.get_option_val( "sideFeatureWidth" ) / 2 ) );
    var feature_start = c1;
    var c2 = c1.add( g2.multiply( this.get_option_val( "sideFeatureLength" ) ) );
    var c2_2, c3_2;
    var c3 = c2.add( g1.multiply( -this.get_option_val( "sideFeatureWidth" ) ) );
    var c4 = c3.add( g2.multiply( -this.get_option_val( "sideFeatureLength" ) ) );
    var c4_1, c4_2;
    if( !this.get_option_val( "Full PitchInPitch" ) )
    {
      var l1 = new Line( c1, c2 ).add_to_end( -1 ).add_to_start( -1 );
      this.tasks.push( new LineTask( this.tasks.length, [ c1, l1.start ], false, true ) );
      c1 = l1.end;
      var l3 = new Line( c4, c3 ).add_to_end( -1 ).add_to_start( -1 );
      c4_1 = c4;
      c4_2 = l3.start;
      c4 = l3.end;
      var l2 = new Line( c2, c3 ).add_to_end( -1 ).add_to_start( -1 );
      c2_2 = l2.start;
      c3_2 = l2.end;
    }

    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    var kick_center = new Line( c2, c3 ).middle;
    var kick_guide1 = kick_center.add( g2.multiply( this.options.KickFieldRadius.val ) );
    var kick_guide2 = kick_center.add( g2.multiply( -this.options.KickFieldRadius.val ) );
    if( this.get_option_val( "Full PitchInPitch" ) )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, kick_center ], false, true ) );
      if( this.options.KickFieldsAsDots.val )
        this.tasks.push( new WaypointTask( this.tasks.length, kick_center, false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ kick_center, c3 ], false, true ) );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, c2_2 ], false, true ) );
      if( this.options.KickFieldsAsDots.val )
        this.tasks.push( new WaypointTask( this.tasks.length, kick_center, false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c3_2, c3 ], false, true ) );
    }
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    if( !this.get_option_val( "Full PitchInPitch" ) )
      this.tasks.push( new LineTask( this.tasks.length, [ c4_2, c4_1 ], false, true ) );
    if( this.options["Right goal pole"].val )
    {
      var goal_back = m.add( g2.multiply( -this.options.GoalDistFromBack.val ) );
      var right_goal = goal_back.add( g1.multiply( -this.options["sideFeatureGoalWidth"].val / 2 ) );
      this.tasks.push( new WaypointTask( this.tasks.length, right_goal, false, true ) );
    }
    if( this.options["Left goal pole"].val )
    {
      var goal_back = m.add( g2.multiply( -this.options.GoalDistFromBack.val ) );
      var left_goal = goal_back.add( g1.multiply( this.options["sideFeatureGoalWidth"].val / 2 ) );
      this.tasks.push( new WaypointTask( this.tasks.length, left_goal, false, true ) );
    }

    return feature_start;
  }

  create_buildout( goalend1_corners, goalend2_corners, sides )
  {
    var p = this.drawing_points;
    var g1 = goalend1_corners[1];
    var h1 = goalend2_corners[1];

    var l1, l2;
    if( !this.options.BuildOutDistFromMiddle.val )
    {
      let g1c1 = goalend1_corners[0][0];
      let g1c2 = goalend1_corners[0][1];
      let g2c1 = goalend2_corners[0][0];
      let g2c2 = goalend2_corners[0][1];
      
      let add1;
      let add2;

      if(this.options.BuildOutDistPercentageVal.configurable)
      {
        add1 = this.options.Length.val * (this.options.BuildOutDistPercentageVal.val/100);
        add2 = this.options.Length.val * (this.options.BuildOutDistPercentageVal.val/100);
        if(this.options.Fields.val.length !== 0 && !this.options.CenterBuildOutLine.val)
        {
          g1c1 = g1c1.subtract(g1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
          g1c2 = g1c2.subtract(g1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));

          g2c1 = g2c1.subtract(h1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
          g2c2 = g2c2.subtract(h1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
        }
      }
      else
      {
        add1 = (new Line( g1c1, g2c2 ).length / 2) / 2;
        add2 = (new Line( g1c2, g2c1 ).length / 2) / 2;
      }
      if(!this.options.CenterBuildOutLine.val){
        l1 = new Line(
          new Line( g1c1.add( g1.multiply( add1 ) ), g1c2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[0] ),
          new Line( g1c1.add( g1.multiply( add1 ) ), g1c2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[2] )
          );
        l2 = new Line(
          new Line( g2c1.add( h1.multiply( add2 ) ), g2c2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[0] ),
          new Line( g2c1.add( h1.multiply( add2 ) ), g2c2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[2] )
          );
      }
      else{
        l1 = new Line(
        new Line( g1c1.add(g1.multiply( g1c1.dist_to_point(g2c2) / 4)), g1c2.add( g1.multiply(g1c2.dist_to_point(g2c1) / 4))).cross_with_line( sides[0]),
        new Line( g1c1.add(g1.multiply( g1c1.dist_to_point(g2c2) / 4)), g1c2.add( g1.multiply(g1c2.dist_to_point(g2c1) / 4))).cross_with_line( sides[2]));
        l2 = new Line(
        new Line( g2c1.add(h1.multiply( g2c1.dist_to_point(g1c2) / 4)), g2c2.add( h1.multiply(g2c2.dist_to_point(g1c1) / 4))).cross_with_line( sides[0]),
        new Line( g2c1.add(h1.multiply( g2c1.dist_to_point(g1c2) / 4)), g2c2.add( h1.multiply(g2c2.dist_to_point(g1c1) / 4))).cross_with_line( sides[2]));
      }
    }
    else
    {
      let add1;
      let add2;
      
      add1 = this.options.BuildOutDistFromMiddle.val;
      add2 = this.options.BuildOutDistFromMiddle.val;

      let m1 = (new Line( p[3], p[4] )).middle;
      let m2 = (new Line( p[7], p[0] )).middle;

      l1 = new Line(
        new Line( m1.add( g1.multiply( add1 ) ), m2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[0] ),
        new Line( m1.add( g1.multiply( add1 ) ), m2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[2] )
        );
      l2 = new Line(
        new Line( m1.add( h1.multiply( add2 ) ), m2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[0] ),
        new Line( m1.add( h1.multiply( add2 ) ), m2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[2] )
        );
    }

    this.tasks.push( l1.reverse( ).toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );

    var dash_factor = this.options.DashFactorBuildOut.val;
    var dash_length = (this.options.Width.val * dash_factor);

    if( this.options.DashBuildOut.val && !this.options["All dashed lines"].val )
    {
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );

      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );
    }
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

  draw( )
  {
    if(this.options.reverseInGoal.val)
    {
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }
    else
    {
      this.options["fast_test"].val = true;
      this.options["normal_test"].val = true;
    }


    if( this.points.length === 4 )
    {
      let d1 = (new Line( this.points[0], this.points[1] )).unit_vector;
      let d2 = (new Line( this.points[2], this.points[3] )).unit_vector;
      let d = (new Line( d1, d2 )).length;
      if( d < 1 )
      {
        let p2 = this.points[2];
        let p3 = this.points[3];
        this.points[2] = p3;
        this.points[3] = p2;
      }
    }

    if( this.points.length >= 3 && !this.border_is_clockwise() )
    {
      this.points = this.points.reverse();
    }

    var save_CenterCircleRadius = this.options.CenterCircleRadius.val;
    var original_fields = this.options.Fields;
    this.options.Fields = {
      val: JSON.parse( JSON.stringify( this.options.Fields.val ) )
    };
    try
    {

      delete this.calculated_drawing_points;
      this.refresh_snapping_lines();
      this.tasks = [ ];
      this.start_locations = [ ]; 

      var goalend1 = [ ];
      var goalend2 = [ ];
      var sides = [ ];
      if( this.options.ScalePitch.val )
      {

        var scaleX = this.options.Length.val / this.options.Length.default;
        var scaleY = this.options.Width.val / this.options.Width.default;
        var scale = scaleX;
        if( scaleY < scale )
          scale = scaleY;
        this.options.CenterCircleRadius.val *= scale;
        this.options.Fields.val.forEach( function( field )
        {
          field.width *= scaleY;
          field.length *= scaleX;
          if( field.kick_spot_from_back )
            field.kick_spot_from_back *= scaleX;
          if( field.arc )
          {
            field.arc.radius *= scaleX;
            if( field.arc.center_from_back )
              field.arc.center_from_back *= scaleX;
          }
        } );
      }

      goalend1 = this.create_goalend( 0 );
      this.create_corner( 1 );
      sides.push( this.create_side( 0 ) );
      this.create_middle( );
      sides.push( this.create_side( 1 ) );
      this.create_corner( 2 );
      goalend2 = this.create_goalend( 1 );
      this.create_corner( 3 );
      sides.push( this.create_side( 2 ) );
      sides.push( this.create_side( 3 ) );
      this.create_corner( 0 );
      if( this.options.MakeBuildOut.val && !this.options["corner_markings_only"].val )
        this.create_buildout( goalend1, goalend2, sides );
      this.refresh_bb( );
      this.refresh_handles( );
      this.refresh_test_run( );

    }
    catch( e )
    {
      console.error( "Something whent wrong when drawing a soccer pitch." );
      console.error( e );
      console.error( this.id, this );
      throw e;
    }

    this.options.CenterCircleRadius.val = save_CenterCircleRadius;
    this.options.Fields = original_fields;

    this.tasks = this.tasks.filter( t => {
      return t;
    } );

  }

  get_rearranged_tasks( robot_position )
  {
    if( this.options.MakeBuildOut.val )
    {
      var tasks = super.get_rearranged_tasks( robot_position, 2 );
      return tasks;
    }
    else
      return super.get_rearranged_tasks( robot_position );
  }
}


const IFAB_YARDS = [
  {
    width: (20).yard2meter(),
    length: (6).yard2meter()
  },
  {
    width: (44).yard2meter(), // the line is measured from the outside og the line
    length: (18).yard2meter(),
    kick_spot_from_back: (12).yard2meter(),
    arc: {
      radius: (10).yard2meter() // the radius is measured to the inside of the circle
    }
  }
];
Object.freeze(IFAB_YARDS);

const IFAB_METERS = [
  {
    width: 18.32,
    length: 5.5
  },
  {
    width: 40.32, // the line is measured from the outside og the line
    length: 16.5,
    kick_spot_from_back: 11,
    arc: {
      radius: 9.15 // the radius is measured to the inside of the circle
    }
  }
];
Object.freeze(IFAB_METERS);


class dbu_soccer_11_man_pitch extends soccer_pitch
{
  static template_title = "11 man";
  static template_id = "dbu_soccer_11_man";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.DrawCorners.val = true;
    this.options.Length.val = 105;
    this.options.Width.val = 68;
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    this.options.ScalePitch.configurable = true;

    //this.options["8 man pitches"] = {name: "8 man pitches", val: true, type: "bool"};
    this.options["PitchInPitch 1"] = {
      adjustable: false,
      configurable: true,
      name: "8 man pitch 1",
      val: false,
      type: "bool"
    };
    this.options["PitchInPitch 2"] = {
      adjustable: false,
      configurable: true,
      name: "8 man pitch 2",
      val: false,
      type: "bool",
      prev_sibling: "PitchInPitch 1"
    };
    this.options["Full PitchInPitch"] = {
      adjustable: false,
      get configurable( )
      {
        return (this_class.options["PitchInPitch 1"].val || this_class.options["PitchInPitch 2"].val);
      },
      name: "Full 8 man pitches",
      val: true,
      type: "bool",
      prev_sibling: "PitchInPitch 2"
    };
    this.options["sideFeatureLength"] = {
      name: "sideFeatureLength",
      val: 8,
      type: "float"
    };
    this.options["sideFeatureWidth"] = {
      name: "sideFeatureWidth",
      val: 25,
      type: "float"
    };
    this.options["sideFeatureGoalWidth"] = {
      name: "sideFeatureGoalWidth",
      val: 5,
      type: "float"
    };
    this.options["Technical lines"] = {
      name: "Technical lines",
      val: false,
      type: "bool",
      configurable: true
    };
    this.options.GoalWidth.val = 7.32;
    this.options.CenterCircleRadius.val = 9.15;

    this.options["Technical lines distance"] = {
      type: "float",
      get val() {
        if (this_class.options["useIFABYards"].val) {
          return (10).yard2meter();
        }
        else {
          return 9.15;
        }
      },
      set val(v) {
        // PASS
      }
    };

    this.options["useIFABYards"] = {
      name: "Use IFAB yard measurements",
      existingJobDefault: false,
      _configurable: false,
      get configurable() {
        if (pt.template_options[this_class.template_id] 
          && pt.template_options[this_class.template_id].indexOf("use_ifab_yards") >= 0) 
        {
          return true;
        }
        return false;
      },
      _val: true,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v
          && pt.template_options[this_class.template_id] 
          && pt.template_options[this_class.template_id].indexOf("use_ifab_yards") >= 0) 
        {
          this._val = true;
          this_class.options["Technical lines distance"].val = (10).yard2meter();
        }
        else {
          this._val = false;
          this_class.options["Technical lines distance"].val = 9.15;
        }
      },
      type: "bool"
    }

    this.options.Fields = {
      adjustable: false,
      name: "Fields",
      type: "array",
      "dontsave": true,
      get val() {
        if (this_class.options["useIFABYards"].val) {
          return IFAB_YARDS;
        }
        else {
          return IFAB_METERS;
        }
      },
      set val (_) {
        // PASS
      }
    };
  }

  static get template_title( )
  {
    return "11 man";
  }
}

class german_soccer_11_man_pitch extends dbu_soccer_11_man_pitch
{
  static template_id = "german_soccer_11_man";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Fields.val[1].length = 16.5;
  }
}

class dbu_soccer_8_man_pitch extends soccer_pitch
{
  static template_title = "8 man";
  static template_id = "dbu_soccer_8_man";
  static template_image = "img/templates/8-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 68;
    this.options.Width.val = 52.5;
    this.options["corner_markings_only"].configurable = true;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options["PitchInPitch 1"] = {
      adjustable: false,
      configurable: true,
      name: "5 man pitch 1",
      val: false,
      type: "bool"
    };
    this.options["PitchInPitch 2"] = {
      adjustable: false,
      configurable: true,
      name: "5 man pitch 2",
      val: false,
      type: "bool",
      prev_sibling: "PitchInPitch 1"
    };
    this.options["Full PitchInPitch"] = {
      adjustable: false,
      get configurable( )
      {
        return (this_class.options["PitchInPitch 1"].val || this_class.options["PitchInPitch 2"].val);
      },
      name: "Full 5 man pitches",
      val: true,
      type: "bool",
      prev_sibling: "PitchInPitch 2"
    };
    this.options["sideFeatureLength"] = {
      name: "sideFeatureLength",
      val: 5,
      type: "float"
    };
    this.options["sideFeatureWidth"] = {
      name: "sideFeatureWidth",
      val: 13,
      type: "float"
    };
    this.options["sideFeatureGoalWidth"] = {
      name: "sideFeatureGoalWidth",
      val: 3,
      type: "float"
    };
    this.options.GoalWidth.val = 5;
    this.options.Fields.val = [
      {
        width: 25,
        length: 8,
        get kick_spot_from_back()
        {
          return 8 - this_class.options.LineWidth.val / 2;
        }
      }
    ];
  }

  static get template_title( )
  {
    return "8 man";
  }

}
class dbu_soccer_5_man_pitch extends soccer_pitch
{
  static template_title = "5 man";
  static template_id = "dbu_soccer_5_man";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 40;
    this.options.Width.val = 30;
    this.options["corner_markings_only"].configurable = true;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.GoalWidth.val = 3;
    var this_class = this;
    this.options.Fields.val = [
      {
        width: 13,
        length: 5,
        get kick_spot_from_back()
        {
          return 5 - this_class.options.LineWidth.val / 2;
        }
      }
    ];
  }
  static get template_title( )
  {
    return "5 man";
  }
}
class dbu_soccer_3_man_pitch extends soccer_pitch
{
  static template_title = "3 man";
  static template_id = "dbu_soccer_3_man";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 21;
    this.options.Width.val = 13;
    this.options["corner_markings_only"].configurable = true;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.MakeKickDot.configurable = true;
    this.options.GoalWidth.val = 1.5;
  }
  static get template_title( )
  {
    return "3 man";
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
  }
}

class dbu_soccer_9_man extends soccer_pitch
{
  static template_title = "9 man";
  static template_id = "dbu_soccer_9_man";
  static template_image = "img/templates/9-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.DrawCorners.val = false;
    this.options.DrawCorners.dontsave = true;
    this.options.Length.val = 94.2;
    this.options.Width.val = 68;
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    //this.options.ScalePitch.configurable = true;

    this.options.GoalWidth.val = 7.32;
    this.options.CenterCircleRadius.val = 9.15;

    this.options.Fields.val = [
      {
        width: 40.32, // the line is measured from the outside og the line
        length: 11 + this_class.options.LineWidth.val,
        kick_spot_from_back: 11 + this_class.options.LineWidth.val / 2,
        arc: {
          radius: 9.15, // the radius is measured to the inside of the circle
          center_from_back: 11 - 5.5 + this_class.options.LineWidth.val  // the center point measured from back. if not set. kick_spot_from_back is used
        }
      }
    ];
  }
  static get template_title( )
  {
    return "9 man";
  }
}

class invert_name_soccer_pitch extends soccer_pitch
{
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.template_title = this.constructor.template_title;
  }
  job_name( translate_dict )
  {
    var pitch_titlte = translate_dict[this.template_title] ? translate_dict[this.template_title] : this.template_title;
    var pitch_type = translate_dict[this.template_type] ? translate_dict[this.template_type] : this.template_type;

    var pitch_type_name = pitch_type + " " + pitch_titlte;
    return pitch_type_name;
  }
}

class se_soccer_3_man_pitch extends invert_name_soccer_pitch
{
  static template_id = "se_soccer_3_man";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 15;
    this.options.Width.val = 10;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.MakeKickDot.configurable = true;
    this.options.GoalWidth.val = 1.5;
  }
  static get template_title( )
  {
    return "3 mot 3 (6-7 år)";
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
  }
}
class se_soccer_5_man_pitch extends invert_name_soccer_pitch
{
  static template_id = "se_soccer_5_man";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 30;
    this.options.Width.val = 20;
    this.options["corner_markings_only"].configurable = true;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.MakeKickDot.configurable = true;
    this.options.GoalWidth.val = 3;
  }
  static get template_title( )
  {
    return "5 mot 5 (8-9 år)";
  }
}

class se_soccer_7_man_10_11_year_pitch extends invert_name_soccer_pitch
{
  static template_id = "se_soccer_7_man_10_11_year";
  static template_image = "img/templates/8-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 50;
    this.options.Width.val = 30;
    this.options["corner_markings_only"].configurable = true;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.GoalWidth.val = 5;
    this.options.Fields.val = [
      {
        width: 19,
        length: 7,
        get kick_spot_from_back()
        {
          return 7 - this_class.options.LineWidth.val / 2;
        }
      }
    ];

    this.options.MakeBuildOut.val = true;
    this.options.MakeBuildOut.configurable = true;
    this.options.DashBuildOut.val = true;
    this.options.BuildOutDistFromMiddle.val = 7;
    this.options.DashFactorBuildOut.val = (100 / 11) / 100;

    this.options.MakeBuildOut.name = "Retreat linje";
    this.options.DashBuildOut.name = "Prickade retreat linje";

  }

  static get template_title( )
  {
    return "7 mot 7 (10-11 år)";
  }
}
class se_soccer_7_man_12_year_pitch extends se_soccer_7_man_10_11_year_pitch
{
  static template_id = "se_soccer_7_man_12_year";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 55;
    this.options.Width.val = 35;
    this.options["corner_markings_only"].configurable = true;
  }
  static get template_title( )
  {
    return "7 mot 7 (12 år)";
  }
  

}

class se_soccer_9_man_13_year_pitch extends invert_name_soccer_pitch
{
  static template_id = "se_soccer_9_man_13_year";
  static template_image = "img/templates/8-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 65;
    this.options.Width.val = 50;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options["corner_markings_only"].configurable = true;
    this.options.GoalWidth.val = 6;

    this.options.kick_spot_from_back_distance = {
      configurable: true,
      name: "Straffpunkt",
      val: 9,
      type: "float"
    };
    this.options.Fields.val = [
      {
        width: 24,
        length: 9,
        get kick_spot_from_back()
        {
          if( this_class.options.kick_spot_from_back_distance.val > 0 )
            return this_class.options.kick_spot_from_back_distance.val - this_class.options.LineWidth.val / 2;
          else
            return 0;
        }
      }
    ];

    //this.options.MakeBuildOut.val = false;
    //this.options.MakeBuildOut.configurable = true;

  }

  static get template_title( )
  {
    return "9 mot 9 (13 år)";
  }
}
class se_soccer_9_man_14_year_pitch extends se_soccer_9_man_13_year_pitch
{
  static template_id = "se_soccer_9_man_14_year";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 72;
    this.options.Width.val = 55;

    this.options["corner_markings_only"].configurable = true;

  }
  static get template_title( )
  {
    return "9 mot 9 (14 år)";
  }

}

class se_soccer_11_man_pitch extends dbu_soccer_11_man_pitch
{
  static template_id = "se_soccer_11_man";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.template_title = this.constructor.template_title;
  }
  static get template_title( )
  {
    return "11 mot 11";
  }
  job_name( translate_dict )
  {
    var pitch_titlte = translate_dict[this.template_title] ? translate_dict[this.template_title] : this.template_title;
    var pitch_type = translate_dict[this.template_type] ? translate_dict[this.template_type] : this.template_type;

    var pitch_type_name = pitch_type + " " + pitch_titlte;
    return pitch_type_name;
  }
}

class soccer_junior extends soccer_pitch
{
  static template_title = "Junior";
  static template_id = "soccer_junior";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.DrawCorners.val = true;
    this.options.Length.val = 55;
    this.options.Width.val = 36.6;
    this.options.GoalWidth.val = 3.6;
    this.options.CenterCircleRadius.val = 5;
    this.options.Fields.val = [
      {
        width: 10,
        length: 3
      },
      {
        width: 21.6, // the line is measured from the outside og the line
        length: 9.15,
        kick_spot_from_back: 6.3,
        arc: {
          radius: 5  // the radius is measured to the inside of the circle
        }
      }
    ];
  }

  static get template_title( )
  {
    return "Junior";
  }
}

class fa_soccer_5_man_pitch extends soccer_pitch
{
  static template_title = "5v5";
  static template_id = "fa_soccer_5_man_pitch";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = (40).yard2meter( );
    this.options.Width.val = (30).yard2meter( );
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };

    this.options["Half circle end"] = {
      configurable: true,
      name: "Half circle",
      val: false,
      type: "bool"
    };

    
    this.options["Half circle end size"] = {
      get configurable()
    {
      return this_class.options["Half circle end"].val;
    },
      name: "Half circle radius",
      val: 7.5,
      type: "float"
    }
  
    this.options.distance2kickspot= {
      configurable: true,
      name: "Distance to penalty spot",
      val: 6,
      type: "float"
    }
    
    this.options.GoalWidth.val = (12).foot2meter( );

    Object.defineProperty( this.options.Fields, 'val', {
      get: function()
      {
        if( this_class.options["Half circle end"].val )
        {
          return [ {
              is_round: true,
              width: (this_class.options["Half circle end size"].val) * 2,
              length: this_class.options["Half circle end size"].val,
              kick_spot_from_back: (this_class.options["Half circle end size"].val/7.5)*this_class.options.distance2kickspot.val
          } ];
        }
        else
        {
          return [ {
              width: (16).yard2meter(),
              length: (9).yard2meter(),
              kick_spot_from_back: (7).yard2meter()
            } ];
        }
      },
      set: function( v )
      {}
    } );

    this.options.Fields.val = [
      {
        width: (16).yard2meter( ),
        length: (9).yard2meter( ),
        kick_spot_from_back: (7).yard2meter( )
      }
    ];
  }
}

class fiveAside extends fa_soccer_5_man_pitch 
{
  static template_title = "Five-A-Side";
  static template_id = "five_a_side_beta";
  static template_image = "img/templates/fiveaside.png";
  constructor(id, name, layout_method)
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = (40).yard2meter( );
    this.options.Width.val = (30).yard2meter( );
    this.options["running lines"].configurable = false
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    
    this.options["Half circle end"] = {
      configurable: true,
      name: "Half circle goalkeeper area",
      val: true,
      type: "bool"
    }

    this.options.reverseInGoal = {
      name: "Fixed Goal posts",
      val: false,
      type: "bool",
      configurable: true
    };
    this.options["Center circle"] = {
      configurable: true,
      name: "Center circle",
      val: false,
      type: "bool"
    };
    this.options.CenterCircleRadius ={
      get configurable()
      {
        return this_class.options["Center circle"].val;
      },
      name: "Center circle radius",
      val: 1,
      type: "float" 
    }
    this.options["Middle line"] = {
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.distance2kickspot= {
      configurable: true,
      name: "Distance to penalty spot",
      val: 6,
      type: "float"
    }
    
      this.options["Half circle end size"] = {
        get configurable()
      {
        return this_class.options["Half circle end"].val;
      },
        name: "Goalkeeper area",
        val: 7.5,
        type: "float"
      }
    
    
    this.options.goalKeeperWidth = {
      get configurable()
      {
        return !this_class.options["Half circle end"].val;
      },
      type: "float",
      name: "Goal keeper area width",
      val: 14 
    }

    this.options.goalKeeperLength = {
      get configurable()
      {
        return !this_class.options["Half circle end"].val;
      },
      type: "float",
      name: "Goal keeper area depth",
      val: 7.5 
    }
    
    Object.defineProperty( this.options.Fields, 'val', {
      get: function()
      {
        if( this_class.options["Half circle end"].val )
        {
          return [ {
              is_round: true,
              width: (this_class.options["Half circle end size"].val) * 2,
              length: this_class.options["Half circle end size"].val,
              kick_spot_from_back: (this_class.options["Half circle end size"].val/7.5)*this_class.options.distance2kickspot.val
          } ];
        }
        else
        {
          return [ {
              width: this_class.options.goalKeeperWidth.val,
              length: this_class.options.goalKeeperLength.val,
              kick_spot_from_back: this_class.options.distance2kickspot.val
            } ];
        }
      },
      set: function( v )
      {}
    } );

    this.options.Fields.val = [
      {
        width: (16).yard2meter( ),
        length: (9).yard2meter( ),
        kick_spot_from_back: this.options.distance2kickspot.val
      }
    ];
  }
}

class fa_soccer_7_man_pitch extends soccer_pitch
{
  static template_title = "7v7";
  static template_id = "fa_soccer_7_man_pitch";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = (60).yard2meter( );
    this.options.Width.val = (40).yard2meter( );
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.GoalWidth.val = (12).foot2meter( );
    this.options.Fields.val = [
      {
        width: (18).yard2meter( ),
        length: (10).yard2meter( ),
        kick_spot_from_back: (8).yard2meter( )
      }
    ];

    this.options.CenterCircleRadius = {
      adjustable: false,
      name: "CenterCircleRadius",
      val: (6).yard2meter(),
      type: "float",
      "dontsave": true
    };
    this.options["Center circle"] = {
      configurable: true,
      name: "Center circle",
      val: false,
      type: "bool"
    };

  }
}

class fa_soccer_9_man_pitch extends soccer_pitch
{
  static template_title = "9v9";
  static template_id = "fa_soccer_9_man_pitch";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.DrawCorners.val = true;
    this.options.CornerRadius.val = (1).yard2meter( );
    this.options.Length.val = (80).yard2meter( );
    this.options.Width.val = (50).yard2meter( );
    //this.options["8 man pitches"] = {name: "8 man pitches", val: true, type: "bool"};
    //this.options["PitchInPitch 1"] = {adjustable: false, configurable: true, name: "8 man pitch 1", val: false, type: "bool", prev_sibling: "8 man pitches"};
    //this.options["PitchInPitch 2"] = {adjustable: false, configurable: true, name: "8 man pitch 2", val: false, type: "bool", prev_sibling: "8 man pitches"};
    //this.options["Full PitchInPitch"] = {adjustable: false, configurable: true, name: "Full 8 man pitches", val: true, type: "bool", prev_sibling: "8 man pitches"};
    //this.options["sideFeatureLength"] = {name: "sideFeatureLength", val: 8, type: "float"};
    //this.options["sideFeatureWidth"] = {name: "sideFeatureWidth", val: 25, type: "float"};

    //this.options["Technical lines"] = {name: "Technical lines", val: false, type: "bool", configurable: true};

    this.options.GoalWidth.val = (16).foot2meter( );
    this.options.CenterCircleRadius.val = (7).yard2meter( );
    this.options.Fields.val = [
      {
        width: (14).yard2meter( ),
        length: (4).yard2meter( )
      },
      {
        width: (32).yard2meter( ), // the line is measured from the outside og the line
        length: (13).yard2meter( ),
        kick_spot_from_back: (9).yard2meter( ),
        arc: {
          radius: (7).yard2meter( ) // the radius is measured to the inside of the circle
        }
      }
    ];
  }
}

class de_soccer_9_and_7_man_pitch extends se_soccer_9_man_13_year_pitch
{
  static template_id = "de_soccer_9_and_7_man_pitch";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 72.0;
    this.options.Width.val = 68.5;
    this.options ["Middle line"].val = false;
    this.options["corner_markings_only"].configurable = false;
    this.options.Fields.val = [
      {
        width: 25,
        length: 10
      } ];
  }
  static get template_title( )
  {
    return " 7/9 man";
  }
}

class be_expoline_soccer extends soccer_pitch
{
  static template_title = "BE Expoline";
  static template_id = "be_expoline_soccer";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 37;
    this.options.Width.val = 19;
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.reverseInGoal = {
      name: "reverseInGoal",
      val: false,
      type: "bool",
      dontsave: true
    };
    this.options.GoalWidth.val = 6;
    this.options.Fields.val = [
      {
        width: 8,
        length: 5,
        kick_spot_from_back: 7
      }
    ];
  }
}

class soccer_technical_field extends square_pitch
{
  static template_type = "Soccer"; // Translateable
  static template_title = "Technical field"; // Translateable
  static template_id = "soccer_technical_field"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    const this_class = this;

    this.options.Length.val = 5;
    this.options.Width.val = 2;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.dashLines = {
      name: "Dash lines",
      configurable: true,
      existingJobDefault: false,
      val: false,
      type: "bool",
    }

    this.options.dashLength = {
      name: "Dash length",
      get configurable() {
        return this_class.options.dashLines.val;
      },
      existingJobDefault: 0.25,
      _val: 0.25,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v < 0.1) {
          this._val = 0.1;
        }
        else if (v > 1) {
          this._val = 1;
        }
        else {
          this._val = v;
        }
      },
      type: "float",
      prev_sibling: "dashLines"
    }
    this.options.dashSpace = {
      get configurable() {
        return this_class.options.dashLines.val;
      },
      name: "Dash length",
      existingJobDefault: 0.25,
      _val: 0.25,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v < 0.1) {
          this._val = 0.1;
        }
        else if (v > 1) {
          this._val = 1;
        }
        else {
          this._val = v;
        }
      },
      type: "float",
      prev_sibling: "dashLines"
    }
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  draw( )
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    // update tasks
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c3 ], false, true ) );
    this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );

    if (this.options.dashLines.val) {
      for (const [i, task] of this.tasks.entries()) {
        this.tasks[i].task_options.push(new FloatRobotAction("dashed_length", this.options.dashLength.val));
        this.tasks[i].task_options.push(new FloatRobotAction("dashed_space", this.options.dashSpace.val));
      }
    }

    this.refresh_bb( );
    this.refresh_handles( );
    this.refresh_test_run( );
    this.refresh_snapping_lines( );
  }
}

class ch_soccer_5_man_pitch extends soccer_pitch
{
  static template_title = "5er";
  static template_id = "ch_soccer_5_man_pitch";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 35;
    this.options.Width.val = 25;
    this.options["Middle line"] = {
      configurable: true,
      name: "Middle line",
      val: false,
      type: "bool"
    };
    this.options.CenterCircleRadius.val = false;
    this.options.MakeKickDot.val = false;
    this.options.MakeKickDot.configurable = true;
    this.options.GoalWidth.val = 5;

    this.options.DrawCorners.configurable = true;

  }
}

class ch_soccer_7_man_pitch extends soccer_pitch
{
  static template_title = "7er";
  static template_id = "ch_soccer_7_man_pitch";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 53;
    this.options.Width.val = 34;
    this.options["Middle line"] = {
      adjustable: false,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.DrawCorners = {
      configurable: true,
      name: "Draw corners",
      val: false,
      type: "bool"
    };
    this.options.GoalWidth.val = 5;
    this.options.Fields.val = [
      {
        width: 5 + 20,
        length: 10,
        kick_spot_from_back: 7.5
      }
    ];
    this.options["Goal corners"].configurable = true;
    this.options["Goal corners"].val = true;
  }
}

class ch_soccer_9_man_pitch extends soccer_pitch
{
  static template_title = "9er";
  static template_id = "ch_soccer_9_man_pitch";
  static template_image = "img/templates/5-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.Length.val = 68;
    this.options.Width.val = 50;
    this.options.DrawCorners = {
      configurable: true,
      name: "Draw corners",
      val: false,
      type: "bool"
    };
    this.options.DrawCorners.dontsave = true;
    this.options["Goal corners"].configurable = true;
    this.options["Goal corners"].val = true;
    this.options.GoalWidth.val = 5;
    this.options.Fields.val = [
      {
        width: 29, // the line is measured from the outside of the line
        length: 12,
        kick_spot_from_back: 7.5
      }
    ];
  }
}

class ch_soccer_11_man_pitch extends dbu_soccer_11_man_pitch
{
  static template_title = "11er";
  static template_id = "ch_soccer_11_man_pitch";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }
}

//In US soccer, the lines are painted inside the line of play (dimensions measured from outside of line)
class us_soccer_11_man_pitch extends soccer_pitch
{
  static template_title = "11v11";
  static template_id = "us_soccer_11_man_pitch";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.Length.val = (115).yard2meter( );
    this.options.Width.val = (75).yard2meter( );
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    this.options["Middle line"] = {
      adjustable: false,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.CenterCircleRadius.val = (10).yard2meter( );
    this.options.MakeKickDot.dontsave = true;
    this.options.DrawCorners.val = true;
    this.options.DrawCorners.dontsave = true;
    this.options.CornerRadius.val = (3).foot2meter( );
    this.options["Technical lines distance"].val = (11).yard2meter() - this.options.CornerRadius.val;

    this.options.ScalePitch.val = false;
    this.options.ScalePitch.configurable = true;
    this.options.MakeBuildOut.val = false;
    this.options.MakeBuildOut.configurable = true;
    this.options.GoalWidth.val = (24).foot2meter( );
    
    let this_class = this;
    this.options["Technical lines"].configurable = false;
    this.options.KickFieldsAsDots.configurable = true;
    this.options.KickFieldsAsDots.val = false;
    this.options.IsFieldAmerican.val = true;
    
    this.options.CenterLayoutMethod = {
      configurable: true,
      name: "Center type ",
      values: [ "Cross", "Circle", "Dot", "Line" ],
      _val: "Circle",
      type: "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.CenterCross.configurable = false;
        }else{
          this_class.options.CenterCross.configurable = true;
        }
      }
    };
    this.options.PenaltyLayoutMethod = {
      configurable : true,
      name : "Penalty type",
      _val : this_class.options.KickFieldsAsDots.val ? "Dot" : "Circle",
      existingJobDefault: this_class.options.KickFieldsAsDots.val ? "Dot" : "Circle",
      values: ["Cross", "Circle", "Dot", "Line"],
      type : "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.PenaltyCross.configurable = false;
        }else{
          this_class.options.PenaltyCross.configurable = true;
        }
      },
    };
    this.options.CoachAreaLength = {
      configurable : false,
      name : "Coach area length",
      type : "float",
      val  : (20).yard2meter() 
    };
    this.options.CoachAreaDistance ={
      configurable : true,
      name : "Coach area offset",
      type : "float",
      val  : (10).foot2meter()
    };
    this.options.CoachAreaWidth = {
      configurable : false,
      name : "Coach area width",
      type : "float",
      val  : (5).yard2meter() 
    };
    this.options.OfficialArea = {
      configurable : false,
      name : "Official area",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.DistanceBetweenCoachAreas = {
      configurable : false,
      name : "Distance between coach areas",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.CoachArea = {
      configurable : true,
      name : "Coach area",
      type : "bool",
      _val  : false,
      get val(){
        return this._val ;
      },
      set val(v){
        this._val = v ;
        if(v)
        {
          this_class.options.RestrainingLine.configurable = true ;
        }
        else {
          this_class.options.RestrainingLine.configurable = false ;
          this_class.options.RestrainingLine.val = false ;
        }
        
      },
    };

    this.options.TechnicalGapLength = {
      configurable : true,
      name : "Technical lines gap",
      type : "float",
      val  : 0.15
    };
    this.options.TechnicalLinesLength = {
      configurable : false,
      name : "Technical line length",
      type : "float",
      val  : 0.4
    };
    this.options.GoalTechnicalLines = {
      configurable : true,
      name : "Goal end technical lines",
      type : "bool",
      val  : false
    };
    this.options.SideTechnicalLines = {
      configurable : true,
      name : "Side technical lines",
      type : "bool",
      val  : false
    };
    this.options.RestrainingLine = {
      configurable : this_class.options.CoachArea.val ? true : false,
      name : "Restraining lines",
      type : "bool",
      val  : false,
      prev_sibling : "CoachArea"
    };
    this.options.RestrainingLinesL1 = {
      configurable : false,
      name : "Restraining lines length 1",
      type : "float",
      val  : (72.5).foot2meter()
    };
    this.options.RestrainingLinesWidth = {
      configurable : false,
      name : "Restraining line width",
      type : "float",
      val  : (25).foot2meter()
    };
    this.options["Technical lines"].configurable = false;

    this.options.Fields.val = [
      {
        width: (20).yard2meter( ),
        length: (6).yard2meter( )
      },
      {
        width: (44).yard2meter( ), // the line is measured from the outside og the line
        length: (18).yard2meter( ),
        kick_spot_from_back: (12).yard2meter( ),
        arc: {
          radius: (10).yard2meter( ) // the radius is measured to the inside of the circle
        }
      }
    ];
  }
}
class us_soccer_9_man_pitch extends soccer_pitch
{
  static template_title = "9v9";
  static template_id = "us_soccer_9_man_pitch";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // adjustable = can be changed on modification
    // configurable = can be changed on advande modification
    this.options.Length.val = (80).yard2meter( );
    this.options.Width.val = (55).yard2meter( );
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    this.options.ScalePitch.val = false;
    this.options.ScalePitch.configurable = true;
    this.options["Middle line"] = {
      adjustable: false,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.CenterCircleRadius.val = (8).yard2meter( );
    this.options.MakeKickDot.dontsave = true;
    this.options.DrawCorners.val = true;
    this.options.DrawCorners.dontsave = true;
    this.options.CornerRadius.val = (3).foot2meter( );
    this.options.MakeBuildOut.val = false;
    this.options.MakeBuildOut.configurable = true;
    this.options.GoalWidth.val = (21).foot2meter( );
    this.options.Fields.val = [
      {
        width: (16).yard2meter( ),
        length: (5).yard2meter( )
      },
      {
        width: (36).yard2meter( ), // the line is measured from the outside og the line
        length: (14).yard2meter( ),
        kick_spot_from_back: (10).yard2meter( ),
        arc: {
          radius: (8).yard2meter( )  // the radius is measured to the inside of the circle
        }
      }
    ];
    let this_class = this;
    this.options["Technical lines"].configurable = false;
    this.options.KickFieldsAsDots.configurable = false;
    this.options.IsFieldAmerican.val = true;
    
    this.options.CenterLayoutMethod = {
      configurable: true,
      name: "Center type ",
      values: [ "Cross", "Circle", "Dot", "Line" ],
      _val: "Circle",
      type: "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.CenterCross.configurable = false;
        }else{
          this_class.options.CenterCross.configurable = true;
        }
      }
    };
    this.options.PenaltyLayoutMethod = {
      configurable : true,
      name : "Penalty type",
      _val : "Circle",
      values: ["Cross", "Circle", "Dot", "Line"],
      type : "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.PenaltyCross.configurable = false;
        }else{
          this_class.options.PenaltyCross.configurable = true;
        }
      }
    };
    this.options.CoachAreaLength = {
      configurable : false,
      name : "Coach area length",
      type : "float",
      val  : (20).yard2meter() 
    };
    this.options.CoachAreaDistance ={
      configurable : true,
      name : "Coach area offset",
      type : "float",
      val  : (10).foot2meter()
    };
    this.options.CoachAreaWidth = {
      configurable : false,
      name : "Coach area width",
      type : "float",
      val  : (5).yard2meter() 
    };
    this.options.OfficialArea = {
      configurable : false,
      name : "Official area",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.DistanceBetweenCoachAreas = {
      configurable : false,
      name : "Distance between coach areas",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.CoachArea = {
      configurable : true,
      name : "Coach area",
      type : "bool",
      _val  : false,
      get val(){
        return this._val ;
      },
      set val(v){
        this._val = v ;
        if(v)
        {
          this_class.options.RestrainingLine.configurable = true ;
        }
        else {
          this_class.options.RestrainingLine.configurable = false ;
          this_class.options.RestrainingLine.val = false ;
        }
        
      },
    };

    this.options.TechnicalGapLength = {
      configurable : true,
      name : "Technical lines gap",
      type : "float",
      val  : 0.15
    };
    this.options.TechnicalLinesLength = {
      configurable : false,
      name : "Technical line length",
      type : "float",
      val  : 0.4
    };
    this.options.GoalTechnicalLines = {
      configurable : true,
      name : "Goal end technical lines",
      type : "bool",
      val  : false
    };
    this.options.SideTechnicalLines = {
      configurable : true,
      name : "Side technical lines",
      type : "bool",
      val  : false
    };
    this.options.RestrainingLine = {
      configurable : false,
      name : "Restraining lines",
      type : "bool",
      val  : false,
      prev_sibling : "CoachArea"
    };
    this.options.RestrainingLinesL1 = {
      configurable : false,
      name : "Restraining lines length 1",
      type : "float",
      val  : (72.5).foot2meter()
    };
    this.options.RestrainingLinesWidth = {
      configurable : false,
      name : "Restraining line width",
      type : "float",
      val  : (25).foot2meter()
    };
    this.options["Technical lines"].configurable = false;
  }
}
class us_soccer_7_man_pitch extends soccer_pitch
{
  static template_title = "7v7";
  static template_id = "us_soccer_7_man_pitch";
  static template_image = "img/templates/11-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = (65).yard2meter( );
    this.options.Width.val = (45).yard2meter( );
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    this.options.ScalePitch.val = false;
    this.options.ScalePitch.configurable = true;
    this.options["Middle line"] = {
      adjustable: false,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.CenterCircleRadius.val = (8).yard2meter( );
    this.options.MakeKickDot.dontsave = true;
    this.options.DrawCorners.val = true;
    this.options.DrawCorners.dontsave = false;
    this.options.CornerRadius.val = (3).foot2meter( );
    this.options.MakeBuildOut.val = true;
    this.options.MakeBuildOut.configurable = true;
    this.options.GoalWidth.val = (18.5).foot2meter( );
    let this_class = this;
    this.options["Technical lines"].configurable = false;
    this.options.KickFieldsAsDots.configurable = false;
    this.options.IsFieldAmerican.val = true;
    
    this.options.CenterLayoutMethod = {
      configurable: true,
      name: "Center type ",
      values: [ "Cross", "Circle", "Dot", "Line" ],
      _val: "Circle",
      type: "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.CenterCross.configurable = false;
        }else{
          this_class.options.CenterCross.configurable = true;
        }
      }
    };
    this.options.PenaltyLayoutMethod = {
      configurable : true,
      name : "Penalty type",
      _val : "Circle",
      values: ["Cross", "Circle", "Dot", "Line"],
      type : "select",
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
        if(v === "Dot" || v === "Circle")
        {
          this_class.options.PenaltyCross.configurable = false;
        }else{
          this_class.options.PenaltyCross.configurable = true;
        }
      }
    };
    this.options.CoachAreaLength = {
      configurable : false,
      name : "Coach area length",
      type : "float",
      val  : (20).yard2meter() 
    };
    this.options.CoachAreaDistance ={
      configurable : true,
      name : "Coach area offset",
      type : "float",
      val  : (10).foot2meter()
    };
    this.options.CoachAreaWidth = {
      configurable : false,
      name : "Coach area width",
      type : "float",
      val  : (5).yard2meter() 
    };
    this.options.OfficialArea = {
      configurable : false,
      name : "Official area",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.DistanceBetweenCoachAreas = {
      configurable : false,
      name : "Distance between coach areas",
      type : "float",
      val  : (10).yard2meter()
    };
    this.options.CoachArea = {
      configurable : true,
      name : "Coach area",
      type : "bool",
      _val  : false,
      get val(){
        return this._val ;
      },
      set val(v){
        this._val = v ;
        if(v)
        {
          this_class.options.RestrainingLine.configurable = true ;
        }
        else {
          this_class.options.RestrainingLine.configurable = false ;
          this_class.options.RestrainingLine.val = false ;
        }
        
      },
    };

    this.options.TechnicalGapLength = {
      configurable : true,
      name : "Technical lines gap",
      type : "float",
      val  : 0.15
    };
    this.options.TechnicalLinesLength = {
      configurable : false,
      name : "Technical line length",
      type : "float",
      val  : 0.4
    };
    this.options.GoalTechnicalLines = {
      configurable : true,
      name : "Goal end technical lines",
      type : "bool",
      val  : false
    };
    this.options.SideTechnicalLines = {
      configurable : true,
      name : "Side technical lines",
      type : "bool",
      val  : false
    };
    this.options.RestrainingLine = {
      configurable : false,
      name : "Restraining lines",
      type : "bool",
      val  : false,
      prev_sibling : "CoachArea"
    };
    this.options.RestrainingLinesL1 = {
      configurable : false,
      name : "Restraining lines length 1",
      type : "float",
      val  : (72.5).foot2meter()
    };
    this.options.RestrainingLinesWidth = {
      configurable : false,
      name : "Restraining line width",
      type : "float",
      val  : (25).foot2meter()
    };
    this.options["Technical lines"].configurable = false;
    this.options.Fields.val = [
      {
        width: (8).yard2meter( ),
        length: (4).yard2meter( )
      },
      {
        width: (24).yard2meter( ), // the line is measured from the outside og the line
        length: (12).yard2meter( ),
        kick_spot_from_back: (10).yard2meter( ),
        arc: {
          radius: (8).yard2meter( )  // the radius is measured to the inside of the circle
        }
      }
    ];
  }
}
class us_soccer_4_man_pitch extends soccer_pitch
{
  static template_title = "4v4";
  static template_id = "us_soccer_4_man_pitch";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = (35).yard2meter( );
    this.options.Width.val = (25).yard2meter( );
    this.options.Length.default = this.options.Length.val;
    this.options.Width.default = this.options.Width.val;
    this.options.ScalePitch.val = false;
    this.options.ScalePitch.configurable = true;
    this.options["Middle line"] = {
      adjustable: false,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.CenterCircleRadius.val = false;
    this.options.KickFieldsAsDots.configurable = false;
    this.options.MakeKickDot.dontsave = true;
    this.options.DrawCorners.val = false;
    this.options.DrawCorners.dontsave = true;
    this.options.CornerRadius.val = (2).foot2meter( );
    this.options.GoalWidth.val = (6).foot2meter( );
  }
}

class nz_4_6_year extends soccer_pitch
{
  static template_title = "4-6 year";
  static template_id = "nz_4_6_year";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["running lines"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 30;
    this.options.Width.val = 20;
    this.options.GoalWidth.val = 2;
   
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
   
  }
}
 
class nz_7_8_year extends soccer_pitch
{
  static template_title = "7-8 year";
  static template_id = "nz_7_8_year";
  static template_image = "img/templates/3-man-soccer.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["running lines"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 40;
    this.options.Width.val = 30;
    this.options.GoalWidth.val = 2;
   
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
   
    this.options.MakeBuildOut.val = true;
    this.options.MakeBuildOut.configurable = true;
    this.options.DashBuildOut.val = true;
    //this.options.BuildOutDistFromMiddle.val =  this.options.Length.val * 0.2;
    this.options.DashFactorBuildOut.val = (100 / 11) / 100;
    this.options.BuildOutDistPercentageVal.val = 30;

    this.options.MakeBuildOut.name = "Retreat linje";
    this.options.DashBuildOut.name = "Prickade retreat linje";
  }
}
 
class nz_9_10_year extends soccer_pitch
{
  static template_title = "9-10 year";
  static template_id = "nz_9_10_year";
  static template_image = "img/templates/5-man-soccer.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    let this_class = this;
    this.options["running lines"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 55;
    this.options.Width.val = 35;
       
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
   
    this.options["kick"] = {
      configurable: true,
      name: "Penalty spot",
      val: 7,
      type: "float"
    };
   
    this.options.MakeBuildOut.val = true;
    this.options.MakeBuildOut.configurable = true;
    this.options.DashBuildOut.val = true;
    this.options.DashFactorBuildOut.val = (100 / 11) / 100;
    
    this.options.BuildOutDistPercentageVal.val = 30;
  
    this.options.MakeBuildOut.name = "Retreat linje";
    this.options.DashBuildOut.name = "Prickade retreat linje";
   
    this.options.GoalWidth.val = 4;

    Object.defineProperty( this.options.Fields, 'val', {
      get: function()
      {
        return [ {
          width: 16,
          length: 8,
          kick_spot_from_back: this_class.options["kick"].val
          } ];
      },
      set: function( v )
      {}
    } );
  }
}

class nz_11_12_year extends soccer_pitch
{
  static template_title = "11-12 year";
  static template_id = "nz_11_12_year";
  static template_image = "img/templates/5-man-soccer.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    let this_class = this;
    this.options["running lines"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 70;
    this.options.Width.val = 50;
   
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
   
    this.options["kick"] = {
      configurable: true,
      name: "Penalty spot",
      val: 7,
      type: "float"
    };

    this.options.MakeBuildOut.val = true;
    this.options.MakeBuildOut.configurable = true;
    this.options.DashBuildOut.val = true;
    this.options.DashFactorBuildOut.val = (100 / 11) / 100;
    this.options.BuildOutDistPercentageVal.val = 30;
    this.options.MakeBuildOut.name = "Retreat linje";
    this.options.DashBuildOut.name = "Prickade retreat linje";
   
    this.options.GoalWidth.val = 5;
    
    Object.defineProperty( this.options.Fields, 'val', {
      get: function()
      {
        return [ {
          width: 16,
          length: 8,
          kick_spot_from_back: this_class.options["kick"].val
          } ];
      },
      set: function( v )
      {}
    } );
  }
}

class nz_13_14_year extends soccer_pitch
{
  static template_title = "13-14 year";
  static template_id = "nz_13_14_year";
  static template_image = "img/templates/11-man-soccer.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["running lines"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 82;
    this.options.Width.val = 50;
  
    this.options["Middle line"] = {
      adjustable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
       
    this.options.GoalWidth.val = 6.4;

    this.options.Fields.val = [
      {
        width: 12.8,
        length: 4.5
      },
      {
        width: 32, // the line is measured from the outside og the line
        length: 12.8,
        kick_spot_from_back: 9.15,
      }
    ];
  }
}

function convert_soccer_pitches( jobs, id )
{
  if( !id )
    id = 0;
  popup_screen_controller.open_info_waiter( "Saving" );
  job = jobs[id];

  var new_pitch = pt["custom_soccer"].create_from_other_soccer( job );
  pitch_generator.save_pitch( new_pitch );

  function do_next()
  {
    event_controller.remove_callback( "save_db_job_done", do_next );
    id += 1;
    if( id === jobs.length )
      popup_screen_controller.close();
    else
      convert_soccer_pitches( jobs, id );
  }
  event_controller.add_callback( "save_db_job_done", do_next );

}