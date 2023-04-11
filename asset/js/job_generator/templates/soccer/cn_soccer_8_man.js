class CnSoccer8Man extends soccer_pitch
{
  static template_title = "8 man";
  static template_id = "cn_soccer_8_man_beta";
  static template_image = "img/templates/8-man-soccer.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.Length.val = 68;
    this.options.Width.val = 48;
    // this.options["corner_markings_only"].configurable = true;
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
    this.options["Technical lines"] = {
      name: "Technical lines",
      val: true,
      type: "bool",
      configurable: true
    };
    this.options["Technical lines distance"] = {
      val: 6,
      type: "float"
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
      val: 6,
      type: "float",
      "dontsave": true
    };
    this.options.DrawCorners = {
      name: "Draw corners",
      val: true,
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
      val: 0.8,
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
const IFAB_METERS = [
  {
    width: 13.5,
    length: 4
  },
  {
    width: 25.5, 
    length: 10,
    kick_spot_from_back: 9,
    arc: {
      radius: 6 
    }
  }
];
Object.freeze(IFAB_METERS);
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
    };
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
    this.options.GoalWidth.val = 5;
    this.options.Fields.val = [
      {
        width: 13.5,
        length: 4,
        get kick_spot_from_back()
        {
          return 9;
        }
      }
    ];
   if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
    this.options.reverseInGoal.val = true;
  this.options["Goal corners"] = {
    name: "Goal corners",
    val: false,
    type: "bool"
  };
  }
  static get template_title( )
   {
      return "8 man";
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
      let ac = c.subtract( g1.multiply( this.options.LineWidth.val / 2 ) ).subtract( g2.multiply( this.options.LineWidth.val / 2 ) );
      var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2);
      // find line upto
      var l1 = (new Line( g1g, c )).crosses_with_circle( ac, corner_radius )[0];
      // find line outfrom
      var l2 = (new Line( g2g, c )).crosses_with_circle( ac, corner_radius )[0];
      // find middle of the two with same radius from corner
      var m = ac.add( new Line( ac, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      this.tasks.push( new ArcTask( this.tasks.length, [ l1, m, l2 ], ac, false, false, true ) );
    if( this.get_option_val( "Technical lines" ) )
    {
      var corner_radius = (this.options["Technical lines distance"].val + this.options.CornerRadius.val) - this.options.LineWidth.val;
      // find line upto
      var l1 = c.add( g1.multiply( corner_radius ) );
      // var l1_1 = l1.add( g2.multiply( -0.15 ) );
      var l1_2 = l1.add( g2.multiply( -0.25 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ l1, l1_2 ], false, true ) );
      // find line outfrom
      var l2 = c.add( g2.multiply( corner_radius ) );
      var l2_2 = l2.add( g1.multiply( -0.25 ) );
      this.tasks.push( new LineTask( this.tasks.length, [ l2, l2_2 ], false, true ) );
    }
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
      // goalend1 = this.create_goalend( 0 );
      this.create_goalend(0);
      this.create_corner( 1 );
      sides.push( this.create_side( 0 ) );
      this.create_middle( );
      sides.push( this.create_side( 1 ) );
      this.create_corner( 2 );
      this.create_goalend(1);
      // goalend2 = this.create_goalend( 1 );
      this.create_corner( 3 );
      sides.push( this.create_side( 2 ) );
      sides.push( this.create_side( 3 ) );
      this.create_corner( 0 );
      // if( this.options.MakeBuildOut.val && !this.options["corner_markings_only"].val )
      //   this.create_buildout( goalend1, goalend2, sides );
      this.refresh_bb( );
      this.refresh_handles( );
      this.refresh_test_run( );
    }
    catch( e )
    {
      console.error( "Something whent wrong when drawing a soccer pitch." );
      console.error( e );
      console.error( this.id, this );
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
