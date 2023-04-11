/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// 1 yard = 3 feet
// 1 feet = 12 inch

/* global five_degrees_equal, login_screen_controller, robot_controller, pt */

class american_football_base extends square_pitch
{
  static template_type = "Football";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;


    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.NegativeLineWidth.val = true;
    this.options.Length.val = (360).foot2meter();
    this.options.Width.val = (160).foot2meter();
    var this_class = this;
    this.options.GoalWidth.dontsave = false;

    this.options["Hash Markers"] = {
      configurable: true,
      name: "Hash Markers",
      val: true,
      type: "bool"
    };
    this.options["Middle hash marks"] = {
      get configurable()
      {
        return this_class.options["Hash Markers"].val;
      },
      name: "Middle hash marks",
      prev_sibling: "Hash Markers",
      val: true,
      type: "bool"
    };
    this.options["Side hash marks"] = {
      get configurable()
      {
        return this_class.options["Hash Markers"].val;
      },
      name: "Side hash marks",
      prev_sibling: "Hash Markers",
      val: true,
      type: "bool"
    };
    this.options["ScaleEndZone"] = {
      configurable: true,
      name: "Scale end zone",
      val: false,
      type: "bool"
    };

    this.options["High School Teamboxes"] = {
      name: "High School Teamboxes",
      val: false,
      type: "bool"
    };
    this.options["Team Area 1"] = {
      configurable: true,
      name: "Team Area 1",
      val: true,
      type: "bool"
    };
    this.options["Team Area 1 width"] = {
      name: "Team Area 1 width",
      val: ((30).foot2meter()),
      type: "float",
      get configurable()
      {
        return this_class.options["Team Area 1"].val;
      },
      prev_sibling: "Team Area 1"
    };
    this.options["Team Area 2"] = {
      configurable: true,
      name: "Team Area 2",
      val: true,
      type: "bool"
    };
    this.options["Team Area 2 width"] = {
      name: "Team Area 2 width",
      val: ((30).foot2meter()),
      type: "float",
      get configurable()
      {
        return this_class.options["Team Area 2"].val;
      },
      prev_sibling: "Team Area 2"
    };

    this.options["Restricted zone width"] = {
      name: "Restricted zone width",
      val: (6).foot2meter(),
      type: "float",
      get configurable()
      {
        return this_class.options["Team Area 1"].val || this_class.options["Team Area 2"].val;
      },
      prev_sibling: "Team Area 2 width"
    };
    this.options["Coaching box width"] = {
      name: "Coaching box width",
      val: (9).foot2meter(),
      type: "float",
      get configurable()
      {
        return this_class.options["Team Area 1"].val || this_class.options["Team Area 2"].val;
      },
      prev_sibling: "Restricted zone width"
    };

    this.options["End zone 1"] = {
      configurable: false,
      name: "End zone 1",
      _val: undefined,
      set val( v )
      {
        if( this._val !== undefined )
        {
          if( !this._val && v )
          {
            this_class.options.Length.val += (10).yard2meter();
            var d = (new Vector( (5).yard2meter(), 0 )).rotate( this_class.options.Angle.val );
            this_class.move_points( d );
          }
          if( this._val && !v )
          {
            this_class.options.Length.val -= (10).yard2meter();
            var d = (new Vector( (-5).yard2meter(), 0 )).rotate( this_class.options.Angle.val );
            this_class.move_points( d );
          }
        }
        this._val = v;
      },
      get val()
      {
        if( this._val === undefined )
          return true;
        else
          return this._val;
      },
      type: "bool"
    };
    this.options["End zone 2"] = {
      configurable: false,
      name: "End zone 2",
      _val: undefined,
      set val( v )
      {
        if( this._val !== undefined )
        {
          if( !this._val && v )
          {
            this_class.options.Length.val += (10).yard2meter();
            var d = (new Vector( (-5).yard2meter(), 0 )).rotate( this_class.options.Angle.val );
            this_class.move_points( d );
          }
          if( this._val && !v )
          {
            this_class.options.Length.val -= (10).yard2meter();
            var d = (new Vector( (5).yard2meter(), 0 )).rotate( this_class.options.Angle.val );
            this_class.move_points( d );
          }
        }
        this._val = v;
      },
      get val()
      {
        if( this._val === undefined )
          return true;
        else
          return this._val;
      },
      type: "bool"
    };
    this.options["ScaleYard"] = {
      configurable: false,
      name: "ScaleYard",
      val: true,
      type: "bool"
    };
    this.options["zones"] = {
      name: "zones",
      val: 20,
      type: "int"
    };
    
    this.options["TeamBoxStartZone"] = {
      name: "Team box start zone",
      configurable: true,
      _val: 5,
      type: "int",
      units: "number",
      get val() {
        return this._val;
      },
      set val(v) {
        if (v > this_class.options["zones"].val / 2) {
          v = this_class.options["zones"].val / 2;
        }
        if (v < 0) {
          v = 0;
        }

        this._val = Math.round(v);
      }
    };
    this.options["DrawFirstHash"] = {
      name: "DrawFirstHash",
      val: true,
      type: "bool"
    };
    this.options["Wide lines"] = {
      configurable: true,
      name: "Wide lines",
      val: true,
      type: "bool"
    };
    this.options["Wide middle"] = {
      name: "Wide middle",
      val: true,
      type: "bool",
      dontsave: true
    };

    this.options["width in middle"] = {
      name: "width in middle",
      val: (40).foot2meter(),
      type: "float",
      dontsave: true
    };
    this.options["Crosses in middle"] = {
      name: "Crosses in middle",
      val: false,
      type: "bool",
      dontsave: true
    };

    this.options["Safety zone"] = {
      configurable: true,
      name: "Restriction lines",
      val: false,
      type: "bool"
    };
    this.options["Safety zone distance"] = {
      name: "Safety zone margin",
      val: (18).foot2meter(),
      type: "float",
      get configurable()
      {
        return this_class.options["Safety zone"].val;
      },
      prev_sibling: "Safety zone"
    };

    this.options["number marking"] = {
      configurable: true,
      name: "9 yard marking",
      val: true,
      type: "bool"
    };

    this.options["Mark numbers"] = {
      get configurable()
      {
        if(this_class.template_id === "us_american_football_professional" )
          return true;
          
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "mark_numbers" ) >= 0 )
          return this_class.options["number marking"].val;
        return this_class.options["Mark numbers"].val;
      },
      name: "Mark numbers (Beta)",
      _val: false,
      set val(v){
        this._val = v;
      },
      get val(){
        return this._val && this_class.options["number marking"].val;
      },
      type: "bool",
      prev_sibling: "number marking"
    };
    this.options["Number font"] = {
      get configurable()
      {
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "mark_numbers" ) >= 0 )
          return this_class.options["Mark numbers"].val;
        return this_class.options["Mark numbers"].val;
      },
      name: "Number font",
      val: "College",
      values: [ "College", "Segment" ],
      type: "select",
      prev_sibling: "Mark numbers"

    };


    this.options["7 yard marking"] = {
      configurable: false,
      name: "7 yard marking",
      val: false,
      type: "bool"
    };

    this.options["number marking distance"] = {
      val: (9).yard2meter(),
      type: "float",
      dontsave: true
    };
    this.options["number outside marking"] = {
      val: true,
      type: "bool",
      dontsave: true
    };

    this.options["9 yard kick line"] = {
      val: true,
      type: "bool",
      dontsave: true
    };
    this.options["6 yard kick line"] = {
      val: false,
      type: "bool",
      dontsave: true
    };

    this.options["ZigzagHashMarks"] = {
      get configurable()
      { // take one row at a time
        return false;
      },
      name: "Zigzag Hash Marks",
      val: false,
      type: "bool"
    };

    this.options.onewayhashmakrs = {
      configurable: false,
      name: "oneway hashmarks",
      val: true,
      type: "bool"
    };

    this.options.twowayhashmakrs = {
      get configurable()
      {
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "two_way_drive" ) >= 0 )
          return true;
        return false;
      },
      name: "Fast hash marks",
      type: "bool",
      dontsave: true,
      show_warning_popup: function()
      {
        if( this_class.options.onewayhashmakrs.val )
          popup_screen_controller.confirm_popup( translate["Warning"], translate["Fash hash marks warning"], translate["OK"], "", popup_screen_controller.close, "" );
      },
      set val( v )
      {
        this_class.options.onewayhashmakrs.val = !v;
      },
      get val()
      {
        return !this_class.options.onewayhashmakrs.val;
      }
    };

    this.options.Hgoal_Single = {
      type: "bool",
      val: true
    }
    this.options.Hgoal = {
      get configurable()
      {
        if(this_class.options.reverseInGoal.val && layout_method !== "single_post" && this_class.options.Hgoal_Single.val)
        {
          return true;
        }
      },
      name: "Remove line between posts",
      val: false,
      type:"bool",
      prev_sibling: "reverseInGoal"
    };

    this.options.onlyNumbers = {
      get configurable()
      {
        if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "mark_numbers" ) >= 0 )
          return this_class.options["Mark numbers"].val;
        return this_class.options["Mark numbers"].val;
      },
      name: "Paint only numbers",
      type: "bool",
      val: false,
      prev_sibling: "Mark numbers"
    };

    this.job_options.push( new FloatRobotAction( "ramp_up_max_dist", 2.0 ) );

    this.options.reverseInGoal = {
      adjustable: false,
      get configurable( )
      {
        if( !robot_controller.chosen_robot_id )
          return true;
        if( !robot_controller.robot_has_capability( "bezier_task" ) )
          return false;
        return true;
      },
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" || layout_method === "single_post" || layout_method === "two_end_goal_posts_resize" )
      this.options.reverseInGoal.val = true;

    this.options.goalPoleWidth.val = (6).inch2meter();
  }
  refresh_handles()
  {
    var this_class = this;
    //super.refresh_handles();
    this.handles = [ ];
    var p = this.drawing_points;

    if( this_class.layout_method === "free_hand" || this_class.layout_method === "corner,side" )
    {
      this.handles.push( new Handle( new Line( p[5], p[6] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[7] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[5], new_ps[6] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }

        if( !this_class.options["ScaleYard"].val )
        {
          var track_length_in_yards = new_length.meter2yard();
          if( this_class.options["End zone 1"].val )
            track_length_in_yards -= 10;
          if( this_class.options["End zone 2"].val )
            track_length_in_yards -= 10;
          var n = Math.floor( track_length_in_yards / 10 );

          new_length = n * 10;

          if( this_class.options["End zone 1"].val )
            new_length += 10;
          if( this_class.options["End zone 2"].val )
            new_length += 10;

          new_length = new_length.yard2meter();

          if( new_length < (10).yard2meter() )
            new_length = (10).yard2meter();
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
      } ) );

      this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[7], p[0] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }

        if( !this_class.options["ScaleYard"].val )
        {
          var track_length_in_yards = new_length.meter2yard();
          if( this_class.options["End zone 1"].val )
            track_length_in_yards -= 10;
          if( this_class.options["End zone 2"].val )
            track_length_in_yards -= 10;
          var n = Math.floor( track_length_in_yards / 10 );

          new_length = n * 10;

          if( this_class.options["End zone 1"].val )
            new_length += 10;
          if( this_class.options["End zone 2"].val )
            new_length += 10;

          new_length = new_length.yard2meter();

          if( new_length < (10).yard2meter() )
            new_length = (10).yard2meter();
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
      } ) );

      this.handles.push( new Handle( new Line( p[3], p[4] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[3] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );

      }, function( new_width )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
      } ) );

      this.handles.push( new Handle( new Line( p[0], p[7] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[3], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }

        this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );

      }, function( new_length )
      {
        return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_length, -Math.PI / 2 );
      } ) );

      var e1 = new Line( p[1], p[2] ).middle;
      var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = new Line( e1, e2 ).middle;
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
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

      var gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle - gml;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];

        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();

      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );
    }

    if( this_class.layout_method === "all_goal_posts" )
    {
      //NO LENGTH
      //NO MOVE
      //NO ANGLE

      var handle1 = new Line( p[3], p[4] );
      var handle2 = new Line( p[0], p[7] );
      var center_line = new Line( handle1.middle, handle2.middle );
      var center = center_line.middle;

      this.handles.push( new Handle( handle1.middle, -handle1.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length * 2;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length * 2;
        }

        this_class.set_new_val( this_class.options.Width, new_width );

      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );

      this.handles.push( new Handle( handle2.middle, -handle2.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length * 2;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length * 2;
        }

        this_class.set_new_val( this_class.options.Width, new_width );

      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );

    }
    if( this_class.layout_method === "all,corners,all_goal_posts" )
    {
      //NO LENGTH
      //NO WIDTH
      //NO MOVE
      //NO ANGLE
    }

    if( this.options["Team Area 1"].val )
    {
      var side_line = new Line( p[3], p[4] );
      var line_middle = side_line.middle;
      var point_out = side_line.unit_vector.rotate_90_ccw();
      var handle_center;
      if( this.options["High School Teamboxes"].val )
        handle_center = line_middle.add( point_out.multiply( this.options["Safety zone distance"].val + this.options["Team Area 1 width"].val ) );
      else
        handle_center = line_middle.add( point_out.multiply( (6 + 9).foot2meter() + this.options["Team Area 1 width"].val ) );

      this.handles.push( new Handle( handle_center, -side_line.angle, "Team Area 1 width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[3], p[4] );
        var new_width = g.point_on_line( new_pos_v ).subtract( new_pos_v ).length - (6 + 9).foot2meter();
        if( new_width < 0 )
          new_width = 0;
        this_class.options["Team Area 1 width"].val = new_width;
        this_class.draw();

        var new_ps = this_class.drawing_points;
        var side_line = new Line( new_ps[3], new_ps[4] );
        var line_middle = side_line.middle;
        var point_out = side_line.unit_vector.rotate_90_ccw();
        var handle_center = line_middle.add( point_out.multiply( (6 + 9).foot2meter() + this_class.options["Team Area 1 width"].val ) );
        var team_line = new Line( handle_center, handle_center.add( side_line.unit_vector ) );

        var align_this = this_class.get_align_move( [ team_line ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }

        this_class.options["Team Area 1 width"].val = new_width;
        this_class.draw();

      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options["Team Area 1 width"], new_width );
      } ) );
    }
    if( this.options["Team Area 2"].val )
    {
      var side_line = new Line( p[7], p[0] );
      var line_middle = side_line.middle;
      var point_out = side_line.unit_vector.rotate_90_ccw();
      var handle_center;
      if( this.options["High School Teamboxes"].val )
        handle_center = line_middle.add( point_out.multiply( this.options["Safety zone distance"].val + this.options["Team Area 2 width"].val ) );
      else
        handle_center = line_middle.add( point_out.multiply( (6 + 9).foot2meter() + this.options["Team Area 2 width"].val ) );

      this.handles.push( new Handle( handle_center, -side_line.angle, "Team Area 2 width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[7], p[0] );
        var new_width = g.point_on_line( new_pos_v ).subtract( new_pos_v ).length - (6 + 9).foot2meter();
        if( new_width < 0 )
          new_width = 0;
        this_class.options["Team Area 2 width"].val = new_width;
        this_class.draw();

        var new_ps = this_class.drawing_points;
        var side_line = new Line( new_ps[7], new_ps[0] );
        var line_middle = side_line.middle;
        var point_out = side_line.unit_vector.rotate_90_ccw();
        var handle_center = line_middle.add( point_out.multiply( (6 + 9).foot2meter() + this_class.options["Team Area 2 width"].val ) );
        var team_line = new Line( handle_center, handle_center.add( side_line.unit_vector ) );

        var align_this = this_class.get_align_move( [ team_line ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }

        this_class.options["Team Area 2 width"].val = new_width;
        this_class.draw();

      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options["Team Area 2 width"], new_width );
      } ) );
    }

  }

  /*refresh_snapping_lines()
   {
   super.refresh_snapping_lines();
   
   var p = this.drawing_points;
   var c1 = p[0];
   var c2 = p[3];
   var c3 = p[4];
   var c4 = p[7];
   var g1 = new Line( c2, c3 ).unit_vector; // long length
   var g2 = g1.rotate_90_cw(); // width length
   
   var gm1 = new Line( c1, c2 ).middle;
   var gm2 = new Line( c3, c4 ).middle;
   // Calculate Length of a yard for this track
   var yardLength = (1).yard2meter();
   if( this.options["ScaleYard"].val )
   {
   var track_length_in_yards, yardScale;
   var EndZonesTotalLength = 0;
   if( this.options["End zone 1"].val )
   EndZonesTotalLength += 10;
   if( this.options["End zone 2"].val )
   EndZonesTotalLength += 10;
   
   if( this.options["ScaleEndZone"].val )
   {
   track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard();
   yardScale = track_length_in_yards / (100 + EndZonesTotalLength);
   }
   else
   {
   track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard() - EndZonesTotalLength;
   yardScale = track_length_in_yards / 100;
   }
   yardLength *= yardScale;
   this.options["zones"].val = 20;
   }
   else
   {
   var track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard();
   if( this.options["End zone 1"].val )
   track_length_in_yards -= 10;
   if( this.options["End zone 2"].val )
   track_length_in_yards -= 10;
   var n = track_length_in_yards / 5;
   this.options["zones"].val = Math.floor( n );
   }
   
   }*/

  static get layout_methods()
  {
    if( robot_controller.robot_has_capability( "bezier_task" ) )
    {
      return {
        "two_end_goal_posts": 2,
        "two_end_goal_posts_resize": 2,
        "corner,side": 2,
        "all_goal_posts": 4,
        "free_hand": 0
      };
    }
    else
    {
      return {
        "two_end_goal_posts": 2,
        "two_end_goal_posts_resize": 2,
        "corner,side": 2,
        "free_hand": 0
      };
    }
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "two_end_goal_posts" )
    {
      return [
        new Vector( 0.5, 1 ),
        new Vector( 0.5, -0.025 )
      ]
    }
    if( layout_method === "two_end_goal_posts_resize" )
    {
      return [
        new Vector( 0.5, 1 ),
        new Vector( 0.5, -0.025 )
      ]
    }
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0.25 )
      ]
    }

    if( layout_method === "all_goal_posts" )
    {
      return [
        new Vector( 0.45, -0.025 ),
        new Vector( 0.55, -0.025 ),
        new Vector( 0.55, 1 ),
        new Vector( 0.45, 1 )
      ]
    }

    if( layout_method === "all_corners,all_goal_posts" )
    {
      return [
        new Vector( 0, -0.025 ),
        new Vector( 0.45, -0.025 ),
        new Vector( 0.55, -0.025 ),
        new Vector( 1, -0.025 ),
        new Vector( 1, 1 ),
        new Vector( 0.55, 1 ),
        new Vector( 0.45, 1 ),
        new Vector( 0, 1 )
      ]
    }
  }

  draw()
  {
    var self = this;
    this.reset_saved_stuff();
    if(this.options.reverseInGoal.val){
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }else{
      this.options["fast_test"].val = true;
      this.options["normal_test"].val = true;
    }
    if(this.layout_method === "single_post")
      this.options.Hgoal_Single.val = false;
    // update tasks
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    let vector_new = new Line(c4, c1).unit_vector;
    
    let c1_copy = c1;
    let c2_copy = c2;
    c1_copy = c1_copy.subtract(vector_new.multiply(this.options.LineWidth.val));
    c2_copy = c2_copy.subtract(vector_new.multiply(this.options.LineWidth.val));

    let c3_copy = c3;
    let c4_copy = c4;
    c3_copy = c3_copy.add(vector_new.multiply(this.options.LineWidth.val));
    c4_copy = c4_copy.add(vector_new.multiply(this.options.LineWidth.val));
    //var m1 = new Line( c2, c3 ).middle;
    //var m2 = new Line( c1, c4 ).middle;
    //var mm = new Line( m1, m2 ).middle;
    var side_line1 = new Line( c2, c3 );
    var side_line2 = new Line( c4, c1 );
    var gm1 = new Line( c1, c2 ).middle;
    var gm2 = new Line( c3, c4 ).middle;
    var middle_line = new Line( gm1, gm2 );
    var mm = middle_line.middle;

    // Calculate Length of a yard for this track
    var yardLength = (1).yard2meter();
    if( this.options["ScaleYard"].val )
    {
      var track_length_in_yards, yardScale;
      var EndZonesTotalLength = 0;
      if( this.options["End zone 1"].val )
        EndZonesTotalLength += 10;
      if( this.options["End zone 2"].val )
        EndZonesTotalLength += 10;

      if( this.options["ScaleEndZone"].val )
      {
        track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard() + this.options.LineWidth.val.meter2yard();
        yardScale = track_length_in_yards / (100 + EndZonesTotalLength);
      }
      else
      {
        track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard() - EndZonesTotalLength + this.options.LineWidth.val.meter2yard();
        yardScale = track_length_in_yards / 100;
      }
      yardLength *= yardScale;
      this.options["zones"].val = 20;
    }
    else
    {
      var track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard() + this.options.LineWidth.val.meter2yard();
      track_length_in_yards *= 100000;
      track_length_in_yards = Math.round( track_length_in_yards );
      track_length_in_yards /= 100000;
      if( this.options["End zone 1"].val )
        track_length_in_yards -= 10;
      if( this.options["End zone 2"].val )
        track_length_in_yards -= 10;
      var n = track_length_in_yards / 5;
      this.options["zones"].val = Math.floor( n );
      if( this.options["zones"].val % 2 )
        this.options["zones"].val += 1;

      if( !this.options["End zone 1"].val && !this.options["End zone 2"].val )
      {
        track_length_in_yards = new Line( gm1, gm2 ).length.meter2yard() + this.options.LineWidth.val.meter2yard();
        yardScale = track_length_in_yards / (this.options["zones"].val * 5);
        yardLength *= yardScale;
      }
    }


    var g1 = middle_line.unit_vector; // long length
    var g2 = g1.rotate_90_cw(); // width length
    var zones_start = this.getZonesStart( yardLength, c1, c2, c3, c4 );
    var c1_zones = side_line2.point_on_line( zones_start );
    var c2_zones = side_line1.point_on_line( zones_start );

    let corners = [ c4, c1, c2, c3, c4, c1 ];
    let oc = [ 0, 0, 0, 0 ];
    for( var i = 1; i < 5; i++ )
    {
      oc[i - 1] = extend_corner( corners[i - 1], corners[i], corners[i + 1], -this.options.LineWidth.val - 0.01 );
    }
    let oc1 = oc[0];
    let oc2 = oc[1];
    let oc3 = oc[2];
    let oc4 = oc[3];

    var outer_goalline_1 = new Line( oc1, oc2 );
    var outer_goalline_2 = new Line( oc3, oc4 );

    var detect_goal_2_and_5 = new Line( p[2], p[5] );
    var detect_goal_1_and_6 = new Line( p[1], p[6] );

    var ogoal1 = detect_goal_1_and_6.cross_with_line( outer_goalline_1 ); //p[1]
    var ogoal2 = detect_goal_2_and_5.cross_with_line( outer_goalline_1 ); //p[2]
    var ogoal5 = detect_goal_2_and_5.cross_with_line( outer_goalline_2 ); //p[5]
    var ogoal6 = detect_goal_1_and_6.cross_with_line( outer_goalline_2 ); //p[6]

    let vector_ext = new Line(c4, c1).unit_vector;

    oc1 = oc1.subtract(vector_ext.multiply(this.options.LineWidth.val));
    oc2 = oc2.subtract(vector_ext.multiply(this.options.LineWidth.val));
    oc3 = oc3.add(vector_ext.multiply(this.options.LineWidth.val));
    oc4 = oc4.add(vector_ext.multiply(this.options.LineWidth.val));


    var outerLine1 = new Line( oc2, oc3 );
    var outerLine2 = new Line( oc3, oc4 );
    var outerLine3 = new Line( oc4, oc1 );
    var outerLine4 = new Line( oc1, oc2 );

    this.start_locations.push( new StartLocation( oc2, this.tasks.length ) );
    if( this.options["Wide lines"].val )
    {
      this.tasks.push( outerLine1.toLineTask( this.tasks.length, false, true ) );

      if( this.options.reverseInGoal.val )
      {
        if(!this.options.Hgoal.val)
          this.tasks.pushAll( drive_around_goal_posts( this, oc3, ogoal5, ogoal6, oc4, 3, this.tasks.length, this.options.goalPoleWidth.val, false ) );
        else
        {
          var taskBefore = new LineTask(this.tasks.length, [oc3, ogoal5], false, true);
          var taskAfter = new LineTask(this.tasks.length, [ogoal6, oc4],false, true);
          let goalCenter = new Line( ogoal6, ogoal5 ).middle;
          var options = {};
          options.task_before = taskBefore;
          options.task_after = taskAfter;
          options.poles = [goalCenter];
          options.pole_width = this.options.GoalWidth.val;
          options.stop_before = 3;
  
          options.left_around = false;
          options.start_index = this.tasks.length;
          options.turn_radius = 2;
          var around_tasks = drive_around_posts( options );
          this.tasks.pushAll( around_tasks); 
        }
      }
      else
        this.tasks.push( outerLine2.toLineTask( this.tasks.length, false, true ) );

      this.tasks.push( outerLine3.toLineTask( this.tasks.length, false, true ) );

      if( this.options.reverseInGoal.val )
      {
        if(!this.options.Hgoal.val)
          this.tasks.pushAll( drive_around_goal_posts( this, oc1, ogoal1, ogoal2, oc2, 3, this.tasks.length, this.options.goalPoleWidth.val, false ) );
        else
        {
          var taskBefore = new LineTask(this.tasks.length, [oc1, ogoal1], false, true);
          var taskAfter = new LineTask(this.tasks.length, [ogoal2, oc2],false, true);
          let goalCenter = new Line(ogoal2, ogoal1).middle;
          var options = {};
          options.task_before = taskBefore;
          options.task_after = taskAfter;
          options.poles = [goalCenter];
          options.pole_width = this.options.GoalWidth.val;
          options.stop_before = 3;
  
          options.left_around = false;
          options.start_index = this.tasks.length;
          options.turn_radius = 2;
          var around_tasks = drive_around_posts( options );
          this.tasks.pushAll( around_tasks); 
        }
      }
      else
        this.tasks.push( outerLine4.toLineTask( this.tasks.length, false, true ) );
    }

    // Dashed lines:
    var line_length = (1).foot2meter();
    var space_length = (2).foot2meter();

    // Starting zone for coach/team boxes
    let base_zones = 20;
    let box_zone = this.options["TeamBoxStartZone"].val;
    let percentage = box_zone / base_zones;
    let start_zone = Math.round(this.options["zones"].val * percentage);
    
    if( this.options["Safety zone"].val )
    {
      var dist = this.options["Safety zone distance"].val - this.options.LineWidth.val - 0.01;

      let bc = [ 0, 0, 0, 0 ];
      for( var i = 1; i < 5; i++ )
      {
        bc[i - 1] = extend_corner( corners[i - 1], corners[i], corners[i + 1], dist );
      }
      let bc1 = bc[0];
      let bc2 = bc[1];
      let bc3 = bc[2];
      let bc4 = bc[3];

      var lines = [ ];
      if( !this.options["Team Area 1"].val )
      {
        lines = lines.concat( (new Line( bc2, bc3 )) );
      }
      else
      {        
        let sp1 = c2_zones.add( g1.multiply( (start_zone * 5).yard2meter( yardLength ) - this.options.LineWidth.val / 2 ) );
        let sp2 = c2_zones.add( g1.multiply( ((this.options["zones"].val - start_zone) * 5).yard2meter( yardLength ) - this.options.LineWidth.val / 2 ) );

        var restricted_p1 = sp1.add( g2.multiply( -this.options["Restricted zone width"].val ) );
        var restricted_p2 = sp2.add( g2.multiply( -this.options["Restricted zone width"].val ) );
        var coaching_p1 = restricted_p1.add( g2.multiply( -this.options["Coaching box width"].val ) );
        var coaching_p2 = restricted_p2.add( g2.multiply( -this.options["Coaching box width"].val ) );


        if( this.options["High School Teamboxes"].val )
        {

          var team_p1 = sp1.add( g2.multiply( -this.options["Team Area 1 width"].val - dist ) );
          var team_p2 = sp2.add( g2.multiply( -this.options["Team Area 1 width"].val - dist ) );

          sp1 = sp1.add( g2.multiply( -dist ) );
          sp2 = sp2.add( g2.multiply( -dist ) );

          lines = lines.concat( (new Line( bc2, sp1 )) );
          lines = lines.concat( (new Line( sp1, team_p1 )) );
          lines = lines.concat( (new Line( sp1, sp2 )) );
          lines = lines.concat( (new Line( sp2, team_p2 )) );
          lines = lines.concat( (new Line( sp2, bc3 )) );

        }
        else
        {

          var team_p1 = coaching_p1.add( g2.multiply( -this.options["Team Area 1 width"].val ) );
          var team_p2 = coaching_p2.add( g2.multiply( -this.options["Team Area 1 width"].val ) );

          sp1 = sp1.add( g1.multiply( -dist ) ).add( g2.multiply( -dist ) );
          team_p1 = team_p1.add( g1.multiply( -dist ) ).add( g2.multiply( -dist ) );
          sp2 = sp2.add( g1.multiply( dist ) ).add( g2.multiply( -dist ) );
          team_p2 = team_p2.add( g1.multiply( dist ) ).add( g2.multiply( -dist ) );

          lines = lines.concat( (new Line( bc2, sp1 )) );
          lines = lines.concat( (new Line( sp1, team_p1 )) );
          lines = lines.concat( (new Line( team_p1, team_p2 )) );
          lines = lines.concat( (new Line( team_p2, sp2 )) );
          lines = lines.concat( (new Line( sp2, bc3 )) );
        }


      }
      lines = lines.concat( (new Line( bc3, bc4 )) );
      if( !this.options["Team Area 2"].val )
      {
        lines = lines.concat( (new Line( bc4, bc1 )) );
      }
      else
      {
        let sp2 = c1_zones.subtract( g1.multiply( -(start_zone * 5).yard2meter( yardLength ) + this.options.LineWidth.val / 2 ) );
        let sp1 = c1_zones.subtract( g1.multiply( -((this.options["zones"].val - start_zone) * 5).yard2meter( yardLength ) + this.options.LineWidth.val / 2 ) );

        var restricted_p1 = sp1.add( g2.multiply( this.options["Restricted zone width"].val ) );
        var restricted_p2 = sp2.add( g2.multiply( this.options["Restricted zone width"].val ) );
        var coaching_p1 = restricted_p1.add( g2.multiply( this.options["Coaching box width"].val ) );
        var coaching_p2 = restricted_p2.add( g2.multiply( this.options["Coaching box width"].val ) );

        if( this.options["High School Teamboxes"].val )
        {

          var team_p1 = sp1.add( g2.multiply( this.options["Team Area 2 width"].val + dist ) );
          var team_p2 = sp2.add( g2.multiply( this.options["Team Area 2 width"].val + dist ) );

          sp1 = sp1.add( g2.multiply( dist ) );
          sp2 = sp2.add( g2.multiply( dist ) );

          lines = lines.concat( (new Line( bc4, sp1 )) );
          lines = lines.concat( (new Line( sp1, team_p1 )) );
          lines = lines.concat( (new Line( sp1, sp2 )) );
          lines = lines.concat( (new Line( sp2, team_p2 )) );
          lines = lines.concat( (new Line( sp2, bc1 )) );

        }
        else
        {

          var team_p1 = coaching_p1.add( g2.multiply( this.options["Team Area 2 width"].val ) );
          var team_p2 = coaching_p2.add( g2.multiply( this.options["Team Area 2 width"].val ) );

          sp1 = sp1.add( g1.multiply( dist ) ).add( g2.multiply( dist ) );
          team_p1 = team_p1.add( g1.multiply( dist ) ).add( g2.multiply( dist ) );
          sp2 = sp2.add( g1.multiply( -dist ) ).add( g2.multiply( dist ) );
          team_p2 = team_p2.add( g1.multiply( -dist ) ).add( g2.multiply( dist ) );

          lines = lines.concat( (new Line( bc4, sp1 )) );
          lines = lines.concat( (new Line( sp1, team_p1 )) );
          lines = lines.concat( (new Line( team_p1, team_p2 )) );
          lines = lines.concat( (new Line( team_p2, sp2 )) );
          lines = lines.concat( (new Line( sp2, bc1 )) );

        }

      }
      lines = lines.concat( (new Line( bc1, bc2 )) );

      this.start_locations.push( new StartLocation( bc2, this.tasks.length ) );
      lines.forEach( function( line )
      {
        self.tasks.push( new LineTask( self.tasks.length, [ line.start, line.end ], false, true ) );
        self.tasks[self.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", line_length ) );
        self.tasks[self.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", space_length ) );
      } );

    }

    if( this.options["Team Area 1"].val && !(this.options["High School Teamboxes"].val && this.options["Safety zone"].val) )
    {
      let sp1 = c2_zones.add( g1.multiply( (start_zone * 5).yard2meter( yardLength ) - this.options.LineWidth.val / 2 ) );
      let sp2 = c2_zones.add( g1.multiply( ((this.options["zones"].val - start_zone) * 5).yard2meter( yardLength ) - this.options.LineWidth.val / 2 ) );

      if( this.options["High School Teamboxes"].val )
      {
        var dist = this.options["Safety zone distance"].val + -this.options.LineWidth.val;
        var restricted_p1 = sp1.add( g2.multiply( -dist ) );
        var restricted_p2 = sp2.add( g2.multiply( -dist ) );
      }
      else
      {
        var restricted_p1 = sp1.add( g2.multiply( -this.options["Restricted zone width"].val ) );
        var restricted_p2 = sp2.add( g2.multiply( -this.options["Restricted zone width"].val ) );
      }
      var coaching_p1 = restricted_p1.add( g2.multiply( -this.options["Coaching box width"].val ) );
      var coaching_p2 = restricted_p2.add( g2.multiply( -this.options["Coaching box width"].val ) );
      var team_p1 = coaching_p1.add( g2.multiply( -this.options["Team Area 1 width"].val ) );
      var team_p2 = coaching_p2.add( g2.multiply( -this.options["Team Area 1 width"].val ) );

      if( this.options["High School Teamboxes"].val )
      {

        team_p1 = restricted_p1.add( g2.multiply( -this.options["Team Area 1 width"].val ) );
        team_p2 = restricted_p2.add( g2.multiply( -this.options["Team Area 1 width"].val ) );
      }
      
      var innerLine1 = new Line( c2_copy, sp2 );
      var teamLine1 = new Line( restricted_p2, team_p2 );
      var teamLine2 = new Line( team_p2, team_p1 );

      this.tasks.push( innerLine1.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( teamLine1.toLineTask( this.tasks.length, false, true ) );

      if( !this.options["High School Teamboxes"].val )
        this.tasks.push( teamLine2.toLineTask( this.tasks.length, false, true ) );

      var teamLine3 = new Line( team_p1, restricted_p1 );
      if( this.options.onewayhashmakrs.val )
        teamLine3 = teamLine3.reverse();
      this.tasks.push( teamLine3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ restricted_p1, restricted_p2 ], false, true ) );
      if( !this.options["High School Teamboxes"].val )
        this.tasks.push( new LineTask( this.tasks.length, [ coaching_p2, coaching_p1 ], false, true ) );

      if( this.options["High School Teamboxes"].val )
      {
        for( var i = this.tasks.length - 3; i < this.tasks.length; i++ )
        {
          self.tasks[i].task_options.push( new FloatRobotAction( "dashed_length", line_length ) );
          self.tasks[i].task_options.push( new FloatRobotAction( "dashed_space", space_length ) );
        }
      }

      var innerLine12 = new Line( sp2, c3_copy );
      this.tasks.push( innerLine12.toLineTask( this.tasks.length, false, true ) );

    }
    else
    {
      var innerLine1 = new Line( c2, c3 );
      this.tasks.push( innerLine1.toLineTask( this.tasks.length, false, true ) );
    }

    var innerLine2 = new Line( c3_copy, c4_copy );
    let p5_moved = p[5].add(vector_new.multiply(this.options.LineWidth.val));
    let p6_moved = p[6].add(vector_new.multiply(this.options.LineWidth.val));
    if( this.options.reverseInGoal.val )
    {
      if(!this.options.Hgoal.val)
        this.tasks.pushAll( drive_around_goal_posts( this, c3_copy, p5_moved, p6_moved, c4_copy, 3, this.tasks.length, this.options.goalPoleWidth.val, false ) );
      else
      {
        var taskBefore = new LineTask(this.tasks.length, [c3_copy, p5_moved], false, true);
        var taskAfter = new LineTask(this.tasks.length, [p6_moved, c4_copy],false, true);
        let goalCenter = new Line(p[5],p[6]).middle;
        var options = {};
        options.task_before = taskBefore;
        options.task_after = taskAfter;
        options.poles = [goalCenter];
        options.pole_width = this.options.GoalWidth.val;
        options.stop_before = 3;

        options.left_around = false;
        options.start_index = this.tasks.length;
        options.turn_radius = 2;
        var around_tasks = drive_around_posts( options );
        this.tasks.pushAll( around_tasks); 
      }
    }
    else
      this.tasks.push( innerLine2.toLineTask( this.tasks.length, false, true ) );

    if( this.options["Team Area 2"].val && !(this.options["High School Teamboxes"].val && this.options["Safety zone"].val) )
    {
      let g1 = new Line( c1, c4 ).unit_vector; // long length

      let sp2 = c1_zones.subtract( g1.multiply( -(start_zone * 5).yard2meter( yardLength ) + this.options.LineWidth.val / 2 ) );
      let sp1 = c1_zones.subtract( g1.multiply( -((this.options["zones"].val - start_zone) * 5).yard2meter( yardLength ) + this.options.LineWidth.val / 2 ) );

      if( this.options["High School Teamboxes"].val )
      {
        var dist = this.options["Safety zone distance"].val + -this.options.LineWidth.val;
        var restricted_p1 = sp1.add( g2.multiply( dist ) );
        var restricted_p2 = sp2.add( g2.multiply( dist ) );
      }
      else
      {
        var restricted_p1 = sp1.add( g2.multiply( this.options["Restricted zone width"].val ) );
        var restricted_p2 = sp2.add( g2.multiply( this.options["Restricted zone width"].val ) );
      }
      var coaching_p1 = restricted_p1.add( g2.multiply( this.options["Coaching box width"].val ) );
      var coaching_p2 = restricted_p2.add( g2.multiply( this.options["Coaching box width"].val ) );
      var team_p1 = coaching_p1.add( g2.multiply( this.options["Team Area 2 width"].val ) );
      var team_p2 = coaching_p2.add( g2.multiply( this.options["Team Area 2 width"].val ) );

      if( this.options["High School Teamboxes"].val )
      {
        team_p1 = restricted_p1.add( g2.multiply( this.options["Team Area 2 width"].val ) );
        team_p2 = restricted_p2.add( g2.multiply( this.options["Team Area 2 width"].val ) );
      }

      var innerLine31 = new Line( c4_copy, sp2 );
      this.tasks.push( innerLine31.toLineTask( this.tasks.length, false, true ) );

      var teamLine1 = new Line( restricted_p2, team_p2 );
      this.tasks.push( teamLine1.toLineTask( this.tasks.length, false, true ) );

      var teamLine2 = new Line( team_p2, team_p1 );
      if( !this.options["High School Teamboxes"].val )
        this.tasks.push( teamLine2.toLineTask( this.tasks.length, false, true ) );

      var teamLine3 = new Line( team_p1, restricted_p1 );
      if( this.options.onewayhashmakrs.val )
        teamLine3 = teamLine3.reverse();
      this.tasks.push( teamLine3.toLineTask( this.tasks.length, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ restricted_p1, restricted_p2 ], false, true ) );
      if( !this.options["High School Teamboxes"].val )
        this.tasks.push( new LineTask( this.tasks.length, [ coaching_p2, coaching_p1 ], false, true ) );

      if( this.options["High School Teamboxes"].val )
      {
        for( var i = this.tasks.length - 3; i < this.tasks.length; i++ )
        {
          self.tasks[i].task_options.push( new FloatRobotAction( "dashed_length", line_length ) );
          self.tasks[i].task_options.push( new FloatRobotAction( "dashed_space", space_length ) );
        }
      }

      var innerLine32 = new Line( sp2, c1_copy );
       this.tasks.push( innerLine32.toLineTask( this.tasks.length, false, true ) );
    }
    else
    {
      var innerLine3 = new Line( c4, c1 );
      this.tasks.push( innerLine3.toLineTask( this.tasks.length, false, true ) );
    }

    var innerLine4 = new Line( c1_copy, c2_copy );
    let p1_moved = p[1].subtract(vector_new.multiply(this.options.LineWidth.val));
    let p2_moved = p[2].subtract(vector_new.multiply(this.options.LineWidth.val));
    if( this.options.reverseInGoal.val )
    {
      if(!this.options.Hgoal.val)
      {
        this.tasks.pushAll( drive_around_goal_posts( this, c1_copy, p1_moved, p2_moved, c2_copy, 3, this.tasks.length, this.options.goalPoleWidth.val, false ) );
      }
      else
      {
        var taskBefore = new LineTask(this.tasks.length, [c1_copy, p1_moved], false, true);
        var taskAfter = new LineTask(this.tasks.length, [p2_moved, c2_copy],false, true);
        let goalCenter = new Line(p[1],p[2]).middle;
        var options = {};
        options.task_before = taskBefore;
        options.task_after = taskAfter;
        options.poles = [goalCenter];
        options.pole_width = this.options.GoalWidth.val;
        options.stop_before = 3;
        options.left_around = false;
        options.start_index = this.tasks.length;
        options.turn_radius = 2;
        var around_tasks = drive_around_posts( options );
        this.tasks.pushAll( around_tasks); 
      }
    }
    else
      this.tasks.push( innerLine4.toLineTask( this.tasks.length, false, true ) );



    if( this.options.ZigzagHashMarks.val )
      this.makeHashMarks_zigzag2( yardLength, g1, g2, c1, c2, c3, c4 );
    else
      this.makeHashMarks_line( yardLength, g1, g2, zones_start, side_line1, side_line2 );
    //this.makeHashMarks_line( yardLength, g1, g2, c1, c2, c3, c4 );

    // make first 9 yard
    //this.options["number marking"]

    var top2bottom = true;
    //var fromBack = goal_width1 - this.options.LineWidth.val / 2 + (this.options["zones"].val * 5 + 5).yard2meter( yardLength );
    //if( this.options["number marking"].val && !(this.options["zones"].val % 2) )
    //  fromBack = goal_width1 - this.options.LineWidth.val / 2 + (this.options["zones"].val * 5 + 10).yard2meter( yardLength );
    var fromBack = -this.options.LineWidth.val / 2 + (this.options["zones"].val * 5 + 5).yard2meter( yardLength );
    if( (this.options["number marking"].val || this.options["7 yard marking"].val) && !(this.options["zones"].val % 2) )
      fromBack = -this.options.LineWidth.val / 2 + (this.options["zones"].val * 5 + 10).yard2meter( yardLength );

    if( !this.options["End zone 1"].val && !this.options["End zone 2"].val )
      fromBack -= this.options.LineWidth.val / 2;
    if( !this.options["End zone 1"].val && this.options["End zone 2"].val )
      fromBack -= this.options.LineWidth.val / 2;
    if( this.options["End zone 1"].val && !this.options["End zone 2"].val )
      fromBack += this.options.LineWidth.val / 2;

    var dir = 1;
    var dir1 = 1;
    //var middle_width = this.options["Small width in middle"].val ? ( ( ( 18 ).foot2meter() + ( 6 ).inch2meter() ) / 2 ) : ( 20 ).foot2meter();
    var middle_width = this.options["width in middle"].val / 2;
    var lines = [ middle_width - this.options.LineWidth.val / 2, -middle_width + this.options.LineWidth.val / 2 ];
    var steps = [ 5, 5 ];
    var step = 5;
    var nZones = this.options["zones"].val;
    var nsteps = [ nZones + 2, nZones + 2 ];
    if( (this.options["number marking"].val || this.options["7 yard marking"].val) && !(this.options["zones"].val % 2) )
    {
      var from_middle = this.options.Width.val / 2 - this.options["number marking distance"].val;
      if( this.options["number outside marking"].val )
        from_middle -= this.options.LineWidth.val / 2;
      else
        from_middle += this.options.LineWidth.val / 2;
      if (this.options["number marking"].val)
      {
        lines = ([ from_middle ]).concat( lines );
        lines.push( -from_middle );
      }
      steps = [ 10, 5, 5, 10 ];
      step = 10;
      nsteps = [ nZones / 2 + 2, nZones + 2, nZones + 2, nZones / 2 + 2 ];

      if( this.options["7 yard marking"].val && !this.options["Mark numbers"].val )
      {
        var from_middle = this.options.Width.val / 2 - (7).yard2meter();
        if( !this.options["number outside marking"].val )
          from_middle -= this.options.LineWidth.val / 2;
        else
          from_middle += this.options.LineWidth.val / 2;
        lines = ([ from_middle ]).concat( lines );
        lines.push( -from_middle );
        if (this.options["number marking"].val)
          {
            steps = [ 10, 10, 5, 5, 10, 10 ];
            nsteps = [ nZones / 2 + 2, nZones / 2 + 2, nZones + 2, nZones + 2, nZones / 2 + 2, nZones / 2 + 2 ];
          }
        else
          {
            steps = [ 10, 5, 5, 10 ];
            nsteps = [ nZones / 2 + 2, nZones + 2, nZones + 2, nZones / 2 + 2 ];
          }
        step = 10;
      }
    }
    let numberTasks = [];
    var hash_length = (2).foot2meter();
    for( var i = 0; i < lines.length; i++ )
    {

      if( this.options["Crosses in middle"].val && ((i / lines.length) === 0.5) && nZones > 4 )
      {
        
        var cross_guide = g2.multiply( (0.5).yard2meter( ) + this.options.LineWidth.val / 2 );
        var cross1_middle = mm.add( g1.multiply( (10).yard2meter( yardLength ) ) );
        var c1e1 = cross1_middle.subtract( cross_guide.rotate( Math.PI * 3 / 4 ) );
        var c1e2 = cross1_middle.subtract( cross_guide.rotate( -Math.PI / 4 ) );

        var c1e3 = cross1_middle.add( cross_guide.rotate( Math.PI / 4 ) );
        var c1e4 = cross1_middle.subtract( cross_guide.rotate( Math.PI / 4 ) );

        this.tasks.push( new LineTask( this.tasks.length, [ c1e2, c1e1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ c1e3, c1e4 ], false, true ) );

        var cross2_middle = mm.subtract( g1.multiply( (10).yard2meter( yardLength ) ) );
        var c2e1 = cross2_middle.subtract( cross_guide.rotate( Math.PI * 3 / 4 ) );
        var c2e2 = cross2_middle.subtract( cross_guide.rotate( -Math.PI / 4 ) );

        var c2e3 = cross2_middle.add( cross_guide.rotate( Math.PI / 4 ) );
        var c2e4 = cross2_middle.subtract( cross_guide.rotate( Math.PI / 4 ) );

        this.tasks.push( new LineTask( this.tasks.length, [ c2e2, c2e1 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ c2e3, c2e4 ], false, true ) );

        fromBack -= (step).yard2meter( yardLength ) * dir * (nZones + 2);
        dir *= -1;

      }

      fromBack -= (step).yard2meter( yardLength ) * dir;
      var from_middle = lines[i];
      step = steps[i];
      var N = nsteps[i];


      var gDown = g2;
      if( !top2bottom )
      {
        gDown = g2.multiply( -1 );
      }

      for( var fi = 1; fi < N; fi++ )
      {
        var mid = zones_start.add( g1.multiply( fromBack ) );

        if(this.template_id === "us_football_college")
          var lm = mid.add( gDown.multiply( from_middle + ( this.options.LineWidth.val * 0.5) * dir ) );
        else if(this.template_id === "eu_american_football_high_school" || this.template_id === "us_american_football_high_school")
        {
          if(this.options["number marking"].val)
          {
            if(from_middle < 0)
              var lm = mid.add( gDown.multiply( from_middle + ( this.options.LineWidth.val * 0.5) * dir ) );
            else
              var lm = mid.add( gDown.multiply( from_middle - ( this.options.LineWidth.val * 0.5) * dir ) );
          }
          else
          {
            if(from_middle < 0)
              var lm = mid.add( gDown.multiply( from_middle - ( this.options.LineWidth.val * 0.5) * dir ) );
            else
              var lm = mid.add( gDown.multiply( from_middle + ( this.options.LineWidth.val * 0.5) * dir ) );
          }
        }
        else
        {
          if(this.options["number marking"].val)
            var lm = mid.add( gDown.multiply( from_middle - ( this.options.LineWidth.val * 0.5) * dir ) );
          else
            var lm = mid.add( gDown.multiply( from_middle + ( this.options.LineWidth.val * 0.5) * dir ) );
        }

        var p1, p2;
        if( fi === 1 )
          p1 = lm;
        else
          p1 = lm.add( g1.multiply( dir * hash_length / 2 ) );
        if( fi === N - 1 )
          p2 = lm;
        else
          p2 = lm.add( g1.multiply( -dir * hash_length / 2 ) );
        if( (fi !== 1 || this.options["DrawFirstHash"].val) && (fi !== (N - 1) || this.options["DrawFirstHash"].val) )
        {
          if( i === 0 && this.options["Mark numbers"].val )
            numberTasks.push(this.add_number_marking( p1, p2, gDown, (N / 2) * 10 - Math.abs( (fi - N / 2) * 10 ) - 10 ));
          else if( i === (lines.length - 1) && this.options["Mark numbers"].val )
            numberTasks.push(this.add_number_marking( p1, p2, gDown.rotate_180(), (N / 2) * 10 - Math.abs( (fi - N / 2) * 10 ) - 10 ));
          else
            this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
        }
        fromBack -= (step).yard2meter( yardLength ) * dir;
      }
      dir *= -1;
    }

    if(this.options.onlyNumbers.val && this.options["Mark numbers"].val)
    {
      this.tasks = numberTasks.flat();
    }


    // Update test_tasks
    this.refresh_test_run( );
    // Update bb
    this.refresh_bb();
    // Update handles
    this.refresh_handles();
    // Refresh snapping lines
    this.refresh_snapping_lines();
  }

  add_number_marking( p1, p2, gDown, number )
  {
    var number_height = (2).yard2meter();
    var top = (new Line( p1, p2 )).middle;
    var g = gDown.unit_vector.multiply( number_height / 2 + this.options.LineWidth.val / 2 );
    var middle = top.add( g );

    var number_job = new Text( 0, "", "free_hand" );
    number_job.points.push( middle );
    number_job.options.Width.val = number_height;
    number_job.options.text.val = "" + number;
    number_job.options.Angle.val = g.angle + Math.PI / 2;
    number_job.options.font.val = this.options["Number font"].val;
    number_job.options.extra_space.val = -this.options.LineWidth.val * 2 + (2).foot2meter();
    number_job.options.natual_space_between.val = false;
    number_job.options.center_after_letter.val = 0;

    number_job.draw();
    number_job.tasks.forEach((t,i) => {
      t.id = this.tasks.length + i;
    });
    this.tasks.pushAll( number_job.tasks );

    return number_job.tasks;

    //console.log( number_job );
  }

  makeHashMarks_zigzag( yardLength, g1, g2, c1, c2, c3, c4 )
  {
    var goal_width = (10).yard2meter( yardLength );
    var fromBack = goal_width;//this.goal_length( track_length_in_yards );
    var top2bottom = true;


    var line_length = (2).foot2meter() - this.options.LineWidth.val.abs;

    var middle = new Line( c1, c2 ).middle;
    //var middle_width = this.options["Small width in middle"].val ? ( ( 18 ).foot2meter() + ( 6 ).inch2meter() ) : ( 40 ).foot2meter();
    var middle_width = this.options["Small width in middle"].val;


    var line_starts = [
      c2.add( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) ),
      middle.subtract( g2.multiply( middle_width / 2 + line_length ) ),
      middle.add( g2.multiply( middle_width / 2 ) ),
      c1.subtract( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 + line_length ) )
    ];

    var dir = 1;
    var last_line_task = false;
    line_starts.forEach( a_start => {

      last_line_task = false;
      for( var fi = 0; fi <= this.options["zones"].val; fi++ )
      {
        for( var mi = 0; mi < 5; mi++ )
        {
          if( fi === 20 && mi !== 0 )
            continue;
          if( mi === 0 )
          {
            fromBack += (1).yard2meter( yardLength ) * dir;
            continue;
          }

          var line_start = a_start.add( g1.multiply( fromBack ) );
          var line_end = line_start.add( g2.multiply( line_length ) );

          var new_line_task;
          if( top2bottom )
            new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_start, line_end ], false, true );
          else
            new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_end, line_start ], false, true );

          if( last_line_task )
            this.connect_lines( last_line_task, new_line_task );
          last_line_task = new_line_task;
          //new_line_task.task_options.push( new IntRobotAction( "auto_route_next", 1 ) );
          //new_line_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2.0 ) );
          //new_line_task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          this.tasks.push( new_line_task );

          top2bottom = !top2bottom;
          fromBack += (1).yard2meter( yardLength ) * dir;
        }
      }
      fromBack -= (1).yard2meter( yardLength ) * dir;
      dir *= -1;
    } );

    var top = c2.add( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) );
    var bot = c1.subtract( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) );
    top2bottom = !top2bottom;
    var last_line_task = false;
    for( var fi = 0; fi < 21; fi++ )
    {
      var line_start = top.add( g1.multiply( fromBack ) );
      var line_end = bot.add( g1.multiply( fromBack ) );

      var new_line_task;
      if( top2bottom )
        new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_start, line_end ], false, true );
      else
        new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_end, line_start ], false, true );

      if( last_line_task )
        this.connect_lines( last_line_task, new_line_task );
      //last_line_task = new_line_task;
      this.tasks.push( new_line_task );

      top2bottom = !top2bottom;
      fromBack += (5).yard2meter( yardLength ) * dir;
    }

  }
  makeHashMarks_zigzag2( yardLength, g1, g2, c1, c2, c3, c4 )
  {
    var goal_width = (10).yard2meter( yardLength );
    var fromBack = goal_width;//this.goal_length( track_length_in_yards );
    var top2bottom = true;


    var line_length = (2).foot2meter() - this.options.LineWidth.val.abs;

    var middle = new Line( c1, c2 ).middle;
    //var middle_width = this.options["Small width in middle"].val ? ( ( 18 ).foot2meter() + ( 6 ).inch2meter() ) : ( 40 ).foot2meter();
    var middle_width = this.options["width in middle"].val;


    var line_starts = [
      c2.add( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) ),
      middle.subtract( g2.multiply( middle_width / 2 + line_length ) ),
      middle.add( g2.multiply( middle_width / 2 ) ),
      c1.subtract( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 + line_length ) )
    ];

    var dir = 1;
    var last_line_task = false;
    line_starts.forEach( a_start => {


      for( var mis = 0; mis < 2; mis++ )
      {
        last_line_task = false;
        for( var fi = 0; fi < 21; fi++ )
        {
          for( var mi = 0; mi < 5; mi += 2 )
          {
            if( fi === 20 && mi !== 0 )
              continue;
            if( mi === 0 )
            {
              fromBack += (1).yard2meter( yardLength ) * dir;
              continue;
            }

            var line_start = a_start.add( g1.multiply( fromBack ) );
            var line_end = line_start.add( g2.multiply( line_length ) );

            var new_line_task;
            if( top2bottom )
              new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_start, line_end ], false, true );
            else
              new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_end, line_start ], false, true );

            if( last_line_task )
              this.connect_lines( last_line_task, new_line_task );
            last_line_task = new_line_task;
            //new_line_task.task_options.push( new IntRobotAction( "auto_route_next", 1 ) );
            //new_line_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 2.0 ) );
            //new_line_task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
            this.tasks.push( new_line_task );

            top2bottom = !top2bottom;
            fromBack += (2).yard2meter( yardLength ) * dir;
          }
        }
        fromBack -= (1).yard2meter( yardLength ) * dir;
        dir *= -1;
      }
    } );

    var top = c2.add( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) );
    var bot = c1.subtract( g2.multiply( (6).inch2meter( ) + this.options.LineWidth.val.abs / 2 ) );
    top2bottom = !top2bottom;
    var last_line_task = false;
    for( var fi = 0; fi < 21; fi++ )
    {
      var line_start = top.add( g1.multiply( fromBack ) );
      var line_end = bot.add( g1.multiply( fromBack ) );

      var new_line_task;
      if( top2bottom )
        new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_start, line_end ], false, true );
      else
        new_line_task = new LineTask( this.tasks.length + (last_line_task ? 1 : 0), [ line_end, line_start ], false, true );

      if( last_line_task )
        this.connect_lines( last_line_task, new_line_task );
      last_line_task = new_line_task;
      this.tasks.push( new_line_task );

      top2bottom = !top2bottom;
      fromBack += (5).yard2meter( yardLength ) * dir;
    }

  }

  connect_lines( l1, l2 )
  {
    /*
     var g1 = l1.toLine().unit_vector;
     var g2 = l2.toLine().unit_vector;
     
     var p1 = l1.ends[1];
     var p3 = l2.ends[0];
     
     var dist = ( new Line( p1, p3 ) ).length;
     var middle = new Line( l1.ends[1], l2.ends[0] ).middle;
     var p2 = middle.add( g1.multiply( dist / 2 ) );
     
     this.tasks.push( new ArcTask( this.tasks.length, [p1, p2, p3], middle, undefined, false, true ) );
     */


    // bezier
    var g1 = l1.toLine().unit_vector;
    var g2 = l2.toLine().unit_vector;

    var p1 = l1.ends[1];
    var p4 = l2.ends[0];

    var dist = (new Line( p1, p4 )).length * 2;
    var p2 = l1.ends[1].add( g1.multiply( dist ) );
    var p3 = l2.ends[0].add( g2.multiply( -dist ) );

    this.tasks.push( new CubicBezierTask( this.tasks.length, [ p1.add( g1 ), p2.add( g1 ), p3.add( g1 ), p4.add( g1 ) ], false, false ) );

    /*
     var g1 = l1.toLine().unit_vector;
     var g2 = l2.toLine().unit_vector;
     
     
     var p1 = l1.ends[1].add( g1 );
     var p2, p3;
     var p6 = l2.ends[0].add( g1.multiply( -1 ) );
     var points = [l1.ends[1],p1];
     
     var to_next = new Line( p1, l2.ends[1] ).unit_vector;
     var dist = ( new Line( p1, l2.ends[1] ) ).length;
     if ( dist < 3 ) {
     p2 = p1.add( g1.multiply( dist ) );
     p3 = p2.add( to_next.multiply( -( 5 + dist ) ) );
     
     var p5 = l2.ends[0].add( g2.multiply( -dist - 1 ) );
     
     var p4_guide = p3.add( g2 );
     var p4_guide_line = new Line( p3, p4_guide );
     var p4 = p4_guide_line.point_on_line( p5 );
     
     points.push( p2, p3, p4, p5 );
     
     } else {
     p2 = l1.ends[1].add( g1.multiply( dist + 1 ) );
     p3 = l2.ends[0].add( g2.multiply( -dist - 1 ) );
     points.push( p2, p3 );
     }
     points.push( p6, l2.ends[0] );
     
     this.tasks.push( new CubicBezierTask( this.tasks.length, points, false, true ) );
     */
  }

  getZonesStart( yardLength, c1, c2, c3, c4 )
  {
    var back_line1 = new Line( c1, c2 );
    var back_line2 = new Line( c3, c4 );
    var middle_line = new Line( back_line1.middle, back_line2.middle );
    var g1 = middle_line.unit_vector;

    var space_for_goal_area = middle_line.length - (this.options["zones"].val * (5).yard2meter( yardLength ));
    var goal_areas = (this.options["End zone 1"].val ? 1 : 0) + (this.options["End zone 2"].val ? 1 : 0);
    var space_for_each_goal_area = space_for_goal_area / goal_areas;
    if( goal_areas === 0 )
      space_for_each_goal_area = 0;
    var goal_width1 = space_for_each_goal_area;
    if( !this.options["End zone 1"].val )
      goal_width1 = 0;

    var fromBack = goal_width1 + this.options.LineWidth.val / 2;
    var start = back_line1.middle;
    start = start.add( g1.multiply( fromBack ) );
    return start;
  }

  //makeHashMarks_line( yardLength, g1, g2, c1, c2, c3, c4 )
  makeHashMarks_line( yardLength, g1, g2, start, side_line1, side_line2 )
  {
    //var side_line1 = new Line( c2, c3 );
    //var side_line2 = new Line( c4, c1 );
    /*
     var back_line1 = new Line( c1, c2 );
     var back_line2 = new Line( c3, c4 );
     var middle_line = new Line( back_line1.middle, back_line2.middle );
     
     
     var g1 = middle_line.unit_vector;
     var g2 = g1.rotate_90_cw();
     
     var space_for_goal_area = middle_line.length - (this.options["zones"].val * (5).yard2meter( yardLength ));
     var goal_areas = (this.options["End zone 1"].val ? 1 : 0) + (this.options["End zone 2"].val ? 1 : 0);
     var space_for_each_goal_area = space_for_goal_area / goal_areas;
     if( goal_areas === 0 )
     space_for_each_goal_area = 0;
     
     var goal_width1 = space_for_each_goal_area;
     if( !this.options["End zone 1"].val )
     goal_width1 = 0;
     
     var start = back_line1.middle;
     
     this.tasks.push( new LineTask( this.tasks.length, [ start, start.subtract( g1 ) ], false, true ) );
     this.tasks.push( new LineTask( this.tasks.length, [ start, start.subtract( g2 ) ], false, true ) );
     this.tasks.push( new LineTask( this.tasks.length, [ back_line2.middle, back_line2.middle.subtract( g2 ) ], false, true ) );
     
     var fromBack = goal_width1 + this.options.LineWidth.val / 2;
     start = start.add( g1.multiply( fromBack ) );
     
     */
    //var start = getZonesStart( yardLength, c1, c2, c3, c4 );
    var fromBack = 0;

    if( !this.options["End zone 1"].val && !this.options["End zone 2"].val )
      fromBack -= this.options.LineWidth.val / 2;
    if( !this.options["End zone 1"].val && this.options["End zone 2"].val )
      fromBack -= this.options.LineWidth.val / 2;
    if( this.options["End zone 1"].val && !this.options["End zone 2"].val )
      fromBack += this.options.LineWidth.val / 2;


    var top2bottom = true;
    for( var fi = 0; fi <= this.options["zones"].val; fi++ )
    { // fields (5 yard step
      for( var mi = 0; mi < 5; mi++ )
      { // mini fields, 1 yard steps
        if( fi === this.options["zones"].val && mi !== 0 )
          continue;

        if( fi === 0 && mi === 1 )
          fromBack -= this.options.LineWidth.val / 2;

        var middle = start.add( g1.multiply( fromBack ) );
        var left_of_middle = middle.add( g2 );
        var guide_line = new Line( middle, left_of_middle );
        var topPoint = guide_line.cross_with_line( side_line1 );
        var bottomPoint = guide_line.cross_with_line( side_line2 );

        //var topPoint = c2.add( g1.multiply( fromBack ) );
        //var bottomPoint = c1.add( g1.multiply( fromBack ) );
        var gDown = g2;
        if( !top2bottom )
        {
          let tmp = bottomPoint;
          bottomPoint = topPoint;
          topPoint = tmp;
          //bottomPoint = c2.add( g1.multiply( fromBack ) );
          //topPoint = c1.add( g1.multiply( fromBack ) );
          gDown = g2.multiply( -1 );
        }

        if( (fi !== 0 && fi !== this.options["zones"].val) || mi > 0 )
        {
          topPoint = topPoint.add( gDown.multiply( (4).inch2meter() - this.options.LineWidth.val / 2 + this.options.LineWidth.val.abs / 2 ) );
          bottomPoint = bottomPoint.add( gDown.multiply( (-4).inch2meter() + this.options.LineWidth.val / 2 - this.options.LineWidth.val.abs / 2 ) );
        }
        if( mi === 0 )
        {

          if( fi === this.options["zones"].val && this.options["End zone 2"].val && this.options["Wide lines"].val )
          {
            var dblLineStart = bottomPoint.add( g1.multiply( this.options.LineWidth.val + 0.01 ) );
            var dblLineEnd = topPoint.add( g1.multiply( this.options.LineWidth.val + 0.01 ) );
            this.tasks.push( new LineTask( this.tasks.length, [ dblLineEnd, dblLineStart ], false, true ) );

            if( !this.options.onewayhashmakrs.val )
            {
              top2bottom = !top2bottom;

            }
            var tmp = topPoint;
            topPoint = bottomPoint;
            bottomPoint = tmp;

          }

          if( fi === this.options["zones"].val / 2 && this.options["Wide middle"].val )
          { // middle line
            var dblLineStart1 = topPoint.add( g1.multiply( this.options.LineWidth.val / 2 + 0.005 ) );
            var dblLineEnd1 = bottomPoint.add( g1.multiply( this.options.LineWidth.val / 2 + 0.005 ) );
            var dblLineStart2 = bottomPoint.add( g1.multiply( -this.options.LineWidth.val / 2 - 0.005 ) );
            var dblLineEnd2 = topPoint.add( g1.multiply( -this.options.LineWidth.val / 2 - 0.005 ) );

            this.tasks.push( new LineTask( this.tasks.length, [ dblLineStart1, dblLineEnd1 ], false, true ) );
            this.tasks.push( new LineTask( this.tasks.length, [ dblLineStart2, dblLineEnd2 ], false, true ) );
          }
          else
          {
            if( (fi === 0 && !this.options["End zone 1"].val) || (fi === this.options["zones"].val && !this.options["End zone 2"].val) )
            {

            }
            else
            {
              this.tasks.push( new LineTask( this.tasks.length, [ topPoint, bottomPoint ], false, true ) );

              if( !this.options.onewayhashmakrs.val )
                top2bottom = !top2bottom;
            }
          }
          if( fi === 0 && this.options["End zone 1"].val && this.options["Wide lines"].val )
          {
            var dblLineStart = bottomPoint.add( g1.multiply( -this.options.LineWidth.val - 0.01 ) );
            var dblLineEnd = topPoint.add( g1.multiply( -this.options.LineWidth.val - 0.01 ) );
            this.tasks.push( new LineTask( this.tasks.length, [ dblLineStart, dblLineEnd ], false, true ) );

            if( !this.options.onewayhashmakrs.val )
              top2bottom = !top2bottom;
          }

        }
        else
        {
          var p2 = topPoint.add( gDown.multiply( (2).foot2meter() ) );
          var p7 = bottomPoint.add( gDown.multiply( (-2).foot2meter() ) );

          var middle = new Line( topPoint, bottomPoint ).middle;
          //var middle_width = this.options["Small width in middle"].val ? ( ( ( 18 ).foot2meter() + ( 6 ).inch2meter() ) / 2 ) : ( 20 ).foot2meter();
          var middle_width = this.options["width in middle"].val / 2;
          var p4 = middle.add( gDown.multiply( -middle_width ) );
          var p3 = p4.add( gDown.multiply( (-2).foot2meter() ) );
          var p5 = middle.add( gDown.multiply( middle_width ) );
          var p6 = p5.add( gDown.multiply( (2).foot2meter() ) );
          if( this.options["Hash Markers"].val )
          {
            if( this.options["Side hash marks"].val )
              this.tasks.push( new LineTask( this.tasks.length, [ topPoint, p2 ], false, true ) );
            if( this.options["Middle hash marks"].val )
              this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );
          }
          if( this.options["9 yard kick line"].val )
          {
            if( fi === 0 && mi === 3 )
            {
              //var goalKickMiddle = new Line( c1, c2 ).middle.add( g1.multiply( (3).yard2meter( yardLength ) + goal_width1 + this.options.LineWidth.val / 2 ) );
              var pm1 = middle.add( gDown.multiply( (-1).foot2meter() ) );
              var pm2 = middle.add( gDown.multiply( (1).foot2meter() ) );
              this.tasks.push( new LineTask( this.tasks.length, [ pm1, pm2 ], false, true ) );
            }
            if( fi === (this.options["zones"].val - 1) && mi === 2 )
            {
              //var goalKickMiddle = new Line( c3, c4 ).middle.add( g1.multiply( (-3).yard2meter( yardLength ) - goal_width2 - this.options.LineWidth.val / 2 ) );
              var pm1 = middle.add( gDown.multiply( (-1).foot2meter() ) );
              var pm2 = middle.add( gDown.multiply( (1).foot2meter() ) );
              this.tasks.push( new LineTask( this.tasks.length, [ pm1, pm2 ], false, true ) );
            }
          }
          if( this.options["6 yard kick line"].val )
          {
            if( fi === 0 && mi === 2 )
            {
              //var goalKickMiddle = new Line( c1, c2 ).middle.add( g1.multiply( (2).yard2meter( yardLength ) + goal_width1 + this.options.LineWidth.val / 2 ) );
              var pm1 = middle.add( gDown.multiply( (-1).foot2meter() ) );
              var pm2 = middle.add( gDown.multiply( (1).foot2meter() ) );
              this.tasks.push( new LineTask( this.tasks.length, [ pm1, pm2 ], false, true ) );
            }
            if( fi === (this.options["zones"].val - 1) && mi === 3 )
            {
              //var goalKickMiddle = new Line( c3, c4 ).middle.add( g1.multiply( (-2).yard2meter( yardLength ) - goal_width2 - this.options.LineWidth.val / 2 ) );
              var pm1 = middle.add( gDown.multiply( (-1).foot2meter() ) );
              var pm2 = middle.add( gDown.multiply( (1).foot2meter() ) );
              this.tasks.push( new LineTask( this.tasks.length, [ pm1, pm2 ], false, true ) );
            }
          }

          if( this.options["Hash Markers"].val )
          {
            if( this.options["Middle hash marks"].val )
              this.tasks.push( new LineTask( this.tasks.length, [ p5, p6 ], false, true ) );
            if( this.options["Side hash marks"].val )
              this.tasks.push( new LineTask( this.tasks.length, [ p7, bottomPoint ], false, true ) );
          }
          if( this.options["Hash Markers"].val || (fi === 0 && mi === 3) || (fi === (19) && mi === 2) )
          {

            if( !this.options.onewayhashmakrs.val )
              top2bottom = !top2bottom;
          }
        }

        fromBack += (1).yard2meter( yardLength );
        if( fi === (this.options["zones"].val - 1) && mi === 4 )
          fromBack -= this.options.LineWidth.val / 2;
      }
    }

  }
}

class eu_american_football_base extends american_football_base
{

  static get layout_methods()
  {



    if( robot_controller.robot_has_capability( "bezier_task" ) )
    {
      return {
        "two_end_goal_posts": 2,
        "corner,side": 2,
        "all_goal_posts": 4,
        "free_hand": 0
      };
    }
    else
    {
      return {
        "two_end_goal_posts": 2,
        "corner,side": 2,
        "free_hand": 0
      };
    }


  }
}
class us_american_football_base extends american_football_base
{
  static get layout_methods()
  {

    let methods = {
      "free_hand": 0,
      "corner,side": 2,

      //"two_end_goal_posts_resize": 2,
      "two_end_goal_posts": new LayoutMethod(
      {
        name: "Gooseneck",
        number_of_points: 2,
        layout_method_image: "img/icons/goosenech.png",
        layout_point_positions: [ new Vector( 0.5, 1 ), new Vector( 0.5, -0.025 ) ]
      } ),
      "single_post": new LayoutMethod(
      {
        name: "Single post",
        number_of_points: 2,
        layout_method_image: "img/icons/Y-goal_black.png",
        layout_point_positions: [ new Vector( 0.5, 1 ), new Vector( 0.5, -0.025 ) ]
      } )
    };

    methods["all_goal_posts"] = new LayoutMethod(
    {
      name: "H goal",
      number_of_points: 4,
      layout_method_image: "img/icons/H-goal_black.png",
      layout_point_positions: [
        new Vector( 0.45, -0.025 ),
        new Vector( 0.55, -0.025 ),
        new Vector( 0.55, 1 ),
        new Vector( 0.45, 1 )
      ]} );

    return methods;

  }

  get drawing_points()
  {
    let p = super.drawing_points;
    if( this.layout_method === "two_end_goal_posts" )
    {
      let cp1 = this.points[0];
      let cp2 = this.points[1];
      let d = (new Line( cp1, cp2 )).length.meter2yard() - 1.2;
      if( d > 120 )
        d = 120;
      d = Math.floor( d / 10 ) * 10;
      this.options.Length.val = d.yard2meter();
    }
    if( this.layout_method === "two_end_goal_posts_resize" )
    {
      let cp1 = this.points[0];
      let cp2 = this.points[1];
      let d = (new Line( cp1, cp2 )).length;
      this.options.Length.val = d;
    }

    if( this.points.length === 2 )
    {
      this.options.GoalWidth.val = 0;
    }
    return p;
  }

}

class american_football_college extends eu_american_football_base
{
  static template_title = "College EU";  
  static template_id = "eu_football_college";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;


    this.options["ScaleYard"].configurable = false;
    //this.options["Small width in middle"].configurable = false;

    this.options["DrawFirstHash"].val = false;
    this.options.GoalWidth.val = (18).foot2meter() + (6).inch2meter();

    this.options["7 yard marking"] = {
      configurable: true,
      name: "7 yard marking",
      val: false,
      type: "bool"
    };

  }
}

class us_american_football_college extends us_american_football_base
{
  static template_title = "College US";
  static template_id = "us_football_college";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;


    this.options["ScaleYard"].val = false;
    this.options["ScaleYard"].dontsave = true;
    this.options["Hash Markers"].configurable = false;


    this.options["TeamBoxStartZone"].val = 4;

    this.options["End zone 1"].configurable = true;
    this.options["End zone 2"].configurable = true;

    //this.options["ScaleEndZone"].configurable = false;
    //this.options["ScaleEndZone"].dontsave = true;

    this.options["DrawFirstHash"].val = false;

    this.options["Wide lines"].configurable = true;
    this.options["Wide lines"].val = false;

    this.options["Wide middle"].val = false;
    this.options.GoalWidth.val = (18).foot2meter() + (6).inch2meter();


    this.options["number marking"].name = "Numbers marking";
    this.options["7 yard marking"] = {
      configurable: false,
      name: "7 yard marking",
      get val()
      {
        return this_class.options["number marking"].val;
      },
      set val( v )
      { },
      type: "bool"
    };
  }
}

class test_american_football_college extends eu_american_football_base
{
  static template_title = "Test College";
  static template_id = "test_american_football_college";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;


    this.options["End zone 1"].configurable = true;
    this.options["End zone 2"].configurable = true;
    this.options["Wide lines"].configurable = true;
    this.options["Wide middle"].configurable = true;
    this.options["ScaleYard"].configurable = true;
    this.options["ScaleEndZone"].configurable = true;
    this.options["Crosses in middle"].configurable = true;
    this.options["Crosses in middle"].dontsave = false;

    this.options.Length.val = (360).foot2meter();
    this.options.GoalWidth.val = (18).foot2meter() + (6).inch2meter();

  }
}

class eu_american_football_high_school extends eu_american_football_base
{
  static template_type = "Football";// Translateable
  static template_title = "High school";// Translateable
  static template_id = "eu_american_football_high_school"; // no spaces
  static template_image = "img/templates/football_high_school_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["ScaleYard"].configurable = false;
    this.options["DrawFirstHash"].val = false;

    this.options["width in middle"].val = (160).foot2meter() - ((53).foot2meter() + (4).inch2meter()) * 2;
    this.options["High School Teamboxes"].val = true;
    this.options["Safety zone distance"].val = (2).yard2meter();

    this.options["Team Area 1 width"].val = (10).foot2meter();
    this.options["Team Area 2 width"].val = (10).foot2meter();

    this.options["Crosses in middle"].val = true;

    this.options.GoalWidth.val = (23).foot2meter() + (4).inch2meter();

  }
}

class us_american_football_high_school extends us_american_football_base
{
  static template_type = "Football";// Translateable
  static template_title = "High school";// Translateable
  static template_id = "us_american_football_high_school"; // no spaces
  static template_image = "img/templates/football_high_school_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["ScaleYard"].val = false;
    this.options["ScaleYard"].dontsave = true;
    this.options["Hash Markers"].configurable = false;

    this.options["End zone 1"].configurable = true;
    this.options["End zone 2"].configurable = true;

    this.options["ScaleEndZone"].configurable = false;
    this.options["ScaleEndZone"].dontsave = true;

    this.options["DrawFirstHash"].val = false;

    this.options["Wide lines"].configurable = true;
    this.options["Wide lines"].val = false;

    this.options["Wide middle"].val = false;

    this.options["width in middle"].val = (160).foot2meter() - ((53).foot2meter() + (4).inch2meter()) * 2;
    this.options["High School Teamboxes"].val = true;
    this.options["Safety zone distance"].val = (2).yard2meter();

    this.options["Team Area 1 width"].val = (10).foot2meter();
    this.options["Team Area 2 width"].val = (10).foot2meter();

    this.options["Crosses in middle"].val = true;

    this.options.GoalWidth.val = (23).foot2meter() + (4).inch2meter();
  }

}

class us_american_football_professional extends us_american_football_base
{
  static template_type = "Football";// Translateable
  static template_title = "Professional";// Translateable
  static template_id = "us_american_football_professional"; // no spaces
  static template_image = "img/templates/american_football_professional.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["ScaleYard"].val = false;
    this.options["ScaleYard"].dontsave = true;
    this.options["Hash Markers"].configurable = false;


    this.options["End zone 1"].configurable = true;
    this.options["End zone 2"].configurable = true;

    this.options["ScaleEndZone"].configurable = false;
    this.options["ScaleEndZone"].dontsave = true;

    this.options["DrawFirstHash"].val = false;

    this.options["Wide lines"].configurable = true;
    this.options["Wide lines"].val = false;

    this.options["Wide middle"].val = false;
    this.options["width in middle"].val = (18).foot2meter() + (6).inch2meter();

    this.options["number marking"].name = "12 yard marking";
    this.options["number marking distance"].val = (12).yard2meter();
    this.options["number outside marking"].val = false;

    this.options["6 yard kick line"].val = true;
    this.options["9 yard kick line"].val = false;
    this.options.GoalWidth.val = (18).foot2meter() + (6).inch2meter();
  }

}

function test_num( track_length )
{
  var l1 = (track_length - 20) / 10;
  var num_fields = Math.round( l1 ) * 2;
  var mid_length = num_fields * 5;
  var goal_length = (track_length - mid_length) / 2;
  console.log( "number of fields", num_fields );
  console.log( "goal_length", goal_length );

}