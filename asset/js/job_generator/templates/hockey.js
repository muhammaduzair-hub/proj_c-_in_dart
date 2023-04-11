/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global s2p2 */
/* global this, five_degrees_equal */
class FieldHockey extends square_pitch
{
  static template_type = "Hockey"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "field_hockey"; // no spaces
  static template_image = "img/templates/field_hockey_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    var this_class = this;

    this.options.Length.val = 91.40; //max length
    this.options.Width.val = 55; //max width

    this.options.yardLine = {
      configurable: true,
      "dontsave": false,
      name: "23 meter line",
      type: "float",
      _val: (22.9 - this.options.LineWidth.val),
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
    };
    this.options.reverseInGoal = {
      adjustable: false,
      configurable: true,
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    this.options.GoalWidth = {
      get configurable()
      {
        return this_class.options["GoalMarking"].val || this_class.options.reverseInGoal.val && this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Goal Width",
      type: "float",
      _val: (3.66 - this.options.LineWidth.val),
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
      },
      prev_sibling: "GoalMarking"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" || layout_method === "all_goal_posts" || layout_method === "two_end_goal_posts_resize" )
    this.options.reverseInGoal.val = true;

    this.options.GoalDepth = {
      get configurable()
      {
        return this_class.options["GoalMarking"].val && this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Goal Depth",
      type: "float",
      _val: (4).foot2meter(),
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
      },
      prev_sibling: "GoalMarking"
    }

    this.options.InnerRadius = {
      configurable: true,
      "dontsave": false,
      name: "Striking circle radius",
      type: "float",
      _val: (14.63 - this_class.options.LineWidth.val),
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
      },
      prev_sibling: "B"
    }

    this.options.OuterRadius = {
      configurable: true,
      "dontsave": false,
      name: "Broken line circle radius",
      type: "float",
      _val: (5 + this_class.options.InnerRadius._val),
      get val()
      {
        return this._val - this_class.options.InnerRadius._val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5 + this_class.options.InnerRadius._val;
        else
          this._val = new_val + this_class.options.InnerRadius._val;
      },
      prev_sibling: "B"
    }
    this.options["DashedGoal"] = {
      configurable: true,
      "dontsave": false,
      name: "Dashed Broken line circle",
      type: "bool",
      val: true
    }
    this.options.DashLength = {
      get configurable()
      {
        return this_class.options["DashedGoal"].val;
      },
      "dontsave": false,
      name: "Dashed length",
      type: "float",
      _val: (0.3 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "DashedGoal"
    }
    this.options.DashSpace = {
      get configurable()
      {
        return this_class.options["DashedGoal"].val;
      },
      "dontsave": false,
      name: "Dash space",
      type: "float",
      _val: (3 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "DashedGoal"
    }

    this.options["TechLines"] = {
      configurable: true,
      "dontsave": false,
      name: "Technical lines",
      type: "bool",
      val: true
    }

    this.options.TechLength1 = {
      get configurable()
      {
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech lines length 1",
      type: "float",
      _val: (0.30 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "TechLines"
    }
    this.options.TechLength2 = {
      get configurable()
      {
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech lines length 2",
      type: "float",
      _val: (0.15 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "TechLines"
    }
    this.options.TechLength3 = {
      get configurable()
      {
        return this_class.options["TechLines"].val;
      },
      name: "Tech lines length 3",
      type: "float",
      _val: (0.15 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "TechLines"
    }
    this.options.TechLength4 = {
      get configurable()
      {
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech lines length 4",
      type: "float",
      _val: (0.15 - this_class.options.LineWidth.val),
      get val()
      {
        return this._val + this_class.options.LineWidth.val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = this_class.options.LineWidth.val;
        else
          this._val = new_val - this_class.options.LineWidth.val;
      },
      prev_sibling: "TechLines"
    }

    // TechDist info (international):
    // 1 = 2nd from outside hashes on backline
    // 2 = outer hashes on backline
    // 3 = sideline hashes    
    this.options.TechDist1 = {
      get configurable(){
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech dist 1",
      type: "float",
      val: 4.975,
      prev_sibling: "TechLines"
    }
    this.options.TechDist2 = {
      get configurable(){
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech dist 2",
      type: "float",
      val: 9.975,
      prev_sibling: "TechLines"
    }
    this.options.TechDist3 = {
      get configurable(){
        return this_class.options["TechLines"].val;
      },
      "dontsave": false,
      name: "Tech line distance sides 1",
      type: "float",
      val: 14.63 - this_class.options.LineWidth.val,
      prev_sibling: "TechLines"
    }
    this.options.TechDist4 = {
      get configurable(){
        return this_class.options["TechLines"].val && this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Tech line distance sides 2",
      type: "float",
      val: 14.63 - this_class.options.LineWidth.val,
      prev_sibling: "TechLines"
    }
    this.options.TechDist5 = {
      configurable: false,
      "dontsave": false,
      name: "Tech dist 5",
      type: "float",
      val: 14.63 - this_class.options.LineWidth.val,
      prev_sibling: "TechLines"
    }
    this.options.TechDist6 = {
      get configurable(){
        return this_class.options["TechLines"].val && !this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Tech line distance sides 2",
      type: "float",
      val: 5.1 - this_class.options.LineWidth.val,
      prev_sibling: "TechLines"
    }

    this.options.Kickdot = {
      configurable: true,
      "dontsave": false,
      name: "Kick dot",
      type: "bool",
      val: true
    }
    this.options.KickdotDia = {
      get configurable()
      {
        return this_class.options.Kickdot.val && !this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Kick dot diameter",
      type: "float",
      val: 0.15,
      prev_sibling: "Kickdot"
    }
    this.options.KickdotDist = {
      get configurable()
      {
        return this_class.options.Kickdot.val;
      },
      "dontsave": false,
      name: "Kick dot dist",
      type: "float",
      val: (6.475 - this_class.options.LineWidth.val / 2),
      prev_sibling: "Kickdot"
    }

    this.options["US"] = {
      configurable: false,
      "dontsave": false,
      name: "US style",
      type: "bool",
      val: false,
      prev_sibling: "A"
    }

    this.options.Kickline = {
      get configurable()
      {
        return this_class.options["US"].val && this_class.options.Kickdot.val;
      },
      "dontsave": false,
      name: "Penalty stroke line length",
      type: "float",
      val: ((12).inch2meter() - this_class.options.LineWidth.val / 2),
      prev_sibling: "Kickdot"
    }

    this.options.CenterLen = {
      get configurable()
      {
        return this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Center Hash Length",
      type: "float",
      val: ((24).inch2meter() - this_class.options.LineWidth.val / 2),
      prev_sibling: "US"
    }
    this.options["GoalMarking"] = {
      get configurable()
      {
        return this_class.options["US"].val;
      },
      "dontsave": false,
      name: "Goal Marking",
      type: "bool",
      val: false,
      prev_sibling: "US"
    }

    this.options["Goal marking dashed"] = {
      get configurable(){
        return this_class.options["GoalMarking"].val;
      },
      name: "Goal marking dashed",
      type: "bool",
      _val: false,
      get val(){
        return this._val;
      },
      set val(v){
          this._val = v;
          if(v){
            this_class.options["Goal small marks"].val = false;
          }
      },
      prev_sibling: "GoalMarking"
    };

    this.options["Goal dashes length"] = {
      get configurable(){
        return this_class.options["Goal marking dashed"].val;
      },
      name: "Goal dashes length",
      type: "float",
      _val: (12).inch2meter(),
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
      },
      prev_sibling: "GoalMarking"
    };
    this.options["Goal small marks"] = {
      get configurable(){
        return this_class.options["GoalMarking"].val;
      },
      type: "bool",
      _val: false,
      get val(){
        return this._val;
      },
      set val(v){
          this._val = v;
          if(v){
            this_class.options["Goal marking dashed"].val = false;
          }
      },
      prev_sibling: "GoalMarking"
    };
    this.options["Goal small marks length"] = {
      get configurable(){
        return this_class.options["Goal small marks"].val;
      },
      name: "Goal small marks length",
      type: "float",
      _val: (12).inch2meter(),
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
      },
      prev_sibling: "GoalMarking"
    };
    this.options["Spectator Lines"] = {
      configurable: true,
      name: "Spectator Lines",
      val: false,
      type: "bool"
    };
    this.options["Spectator Lines offset 1"] = {
      get configurable(){
        return this_class.options["Spectator Lines"].val;
      },
      name: "Spectator Lines offset 1",
      type: "float",
      _val: (10).yard2meter(),
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
      },
      prev_sibling: "Spectator Lines"
    }
    this.options["Spectator Lines offset 2"] = {
      get configurable(){
        return this_class.options["Spectator Lines"].val;
      },
      name: "Spectator Lines offset 2",
      type: "float",
      _val: (5).yard2meter(),
      get val(){
        return this._val;
      },
      set val(v){
        this._val = v;
      },
      prev_sibling: "Spectator Lines"
    }
    this.options["Team Areas"] = {
      configurable: true,
      name: "Team Areas",
      val: false,
      type: "bool"
    };
    this.options["A"] = {
      configurable: false,
      "dontsave": false,
      name: "A",
      type: "bool",
      val: true
    }
    this.options["B"] = {
      configurable: false,
      "dontsave": false,
      name: "B",
      type: "bool",
      val: true
    }
    this.options["C"] = {
      configurable: false,
      "dontsave": false,
      name: "C",
      type: "bool",
      val: true
    }
    this.options.continousLines = {
      configurable: true,
      name: "Continuous lines",
      type: "bool",
      val: false
    }
    this.options.drawHalfField = {
      configurable: true,
      name: "Draw half field",
      val: false,
      type: "bool"
    }

  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "all_goal_posts": 4,
      "all_corners,all_goal_posts": 8,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( -0.005, 1.01 ),
        new Vector( -0.005, 0.25 )
      ]
    }

    if( layout_method === "two_corners" )
    {
      return [
        new Vector( -0.005, 1.01 ),
        new Vector( -0.005, -0.035 )
      ]
    }

    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( -0.005, 1.01 ),
        new Vector( -0.005, -0.035 ),
        new Vector( 1.04, 0.25 )
      ]
    }

    if( layout_method === "all_corners" )
    {
      return [
        new Vector( -0.005, -0.035 ),
        new Vector( 1.04, -0.035 ),
        new Vector( 1.04, 1.01 ),
        new Vector( -0.005, 1.01 )
      ]
    }
    if( layout_method === "all_goal_posts" )
    {
      return [
        new Vector( 0.45, -0.035 ),
        new Vector( 0.58, -0.035 ),
        new Vector( 0.58, 1.01 ),
        new Vector( 0.45, 1.01 )
      ]
    }
    if( layout_method === "all_corners,all_goal_posts" )
    {
      return [
        new Vector( -0.005, -0.035 ),
        new Vector( 0.45, -0.035 ),
        new Vector( 0.58, -0.035 ),
        new Vector( 1.04, -0.035 ),
        new Vector( 1.04, 1.01 ),
        new Vector( 0.58, 1.01 ),
        new Vector( 0.45, 1.01 ),
        new Vector( -0.005, 1.01 )
      ]
    }
  }

  create_end( which_end )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    if(this.options.reverseInGoal.val)
      this.options["GoalMarking"].val = false;
    var s1 = new Line( c1, c2 );
    var s2 = new Line( c3, c4 );

    var s1_g1 = s1.unit_vector;
    var s1_g2 = s1_g1.rotate_90_cw();
    var s2_g1 = s2.unit_vector;
    var s2_g2 = s2_g1.rotate_90_cw();

    var goalwidth = this.options.GoalWidth.val;
    var goaldepth = this.options.GoalDepth._val;
    var inner_rad = this.options.InnerRadius._val;
    var outer_rad = this.options.OuterRadius._val;
    var US_style = 1;
    if( this.options["US"].val )
    {
      US_style = -1;
    }

    if( which_end === 0 )
    { // side 1 
      var o1 = s1_g1;
      var o2 = s1_g2;
      var mid = s1.middle;
      var goal_right = p[1];
      var goal_left = p[2];
      var start = c1;
      var end = c2;
    }
    else if( which_end === 1 )
    { // side 2
      var o1 = s2_g1;
      var o2 = s2_g2;
      var mid = s2.middle;
      var goal_right = p[5];
      var goal_left = p[6];
      var start = c3;
      var end = c4;
    }

    var inner_left = goal_left.add( o1.multiply( inner_rad ) );
    var inner_right = goal_right.subtract( o1.multiply( inner_rad ) );

    var outer_left = goal_left.add( o1.multiply( outer_rad ) );
    var outer_right = goal_right.subtract( o1.multiply( outer_rad ) );

    var inner_straight_part = new Line( goal_left.add( o2.multiply( inner_rad ) ), goal_right.add( o2.multiply( inner_rad ) ) );
    var outer_straight_part = new Line( goal_left.add( o2.multiply( outer_rad ) ), goal_right.add( o2.multiply( outer_rad ) ) );

    // guides for arched part of goal fields
    var inner_left_point = new Line( inner_left, inner_straight_part.start ).middle;
    var inner_left_guide = new Line( goal_left, inner_left_point ).unit_vector;
    var inner_left_mid = goal_left.add( inner_left_guide.multiply( inner_rad ) );

    var inner_right_point = new Line( inner_straight_part.end, inner_right ).middle;
    var inner_right_guide = new Line( goal_right, inner_right_point ).unit_vector;
    var inner_right_mid = goal_right.add( inner_right_guide.multiply( inner_rad ) );

    var outer_left_point = new Line( outer_left, outer_straight_part.start ).middle;
    var outer_left_guide = new Line( goal_left, outer_left_point ).unit_vector;
    var outer_left_mid = goal_left.add( outer_left_guide.multiply( outer_rad ) );

    var outer_right_point = new Line( outer_right, outer_straight_part.end ).middle;
    var outer_right_guide = new Line( goal_right, outer_right_point ).unit_vector;
    var outer_right_mid = goal_right.add( outer_right_guide.multiply( outer_rad ) );

    let indexForTech;
    // corner to goal field
    let goalendTask;
    if(this.options.continousLines.val)
      goalendTask = new LineTask( this.tasks.length, [ start, end ], false, true );
    else
      goalendTask = new LineTask( this.tasks.length, [ start, inner_left ], false, true )

    if(!this.options.reverseInGoal.val)
     this.tasks.push(goalendTask);

    if(this.options.reverseInGoal.val)
    {
      this.tasks.pushAll( drive_around_goal_posts( this, start, goal_right, goal_left, end, 2, this.tasks.length, this.options.goalPoleWidth.val, false, 1 ) );
      indexForTech = this.tasks.length - 19;
    }

    // Inner goal field 
    this.tasks.push( new ArcTask( this.tasks.length, [ inner_left, inner_left_mid, inner_straight_part.start ], goal_left, true, false, true ) );
    this.tasks.push( inner_straight_part.toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ inner_straight_part.end, inner_right_mid, inner_right ], goal_right, true, false, true ) );

    // Outer goal field - hashed line!!!
    this.tasks.push( new ArcTask( this.tasks.length, [ outer_right, outer_right_mid, outer_straight_part.end ], goal_right, false, false, true ) );
    this.tasks.push( outer_straight_part.reverse().toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ outer_straight_part.start, outer_left_mid, outer_left ], goal_left, false, false, true ) );

    var dash_length = this.options.DashLength.val;
    var dash_space = this.options.DashSpace.val;
    var total_len = dash_length + dash_space;

    //beregn offset for midten baseret paa mmidterpunkt og laengder
    var offset_mid = 0;
    var check = false;
    var x = goalwidth / 2 - dash_length / 2;
    var dy = x % total_len;
    var y = dy;
    if( y > dash_space ) //offset_mid is in middle of dash
    {
      y -= dash_space;
      offset_mid = -(dash_length - y);
      check = true;
    }
    else //offset_mid is in middle of space
    {
      offset_mid = y;
    }

    //beregn offset paa side 2 baseret paa offset paa mid
    var offset_side2 = 0;
    if( check ) //offset_mid in middle of dash
      offset_side2 = -y; //-(dash_length - offset_mid);
    else //offset_mid is in middle of space
    {
      if( dash_space === offset_mid )
        offset_side2 = 0;
      else
        offset_side2 = dash_space - offset_mid;
    }

    //beregn offset paa side 1

    var offset_side1 = 0;
    var first_circle_len = this.tasks[this.tasks.length - 3].length;
    var dx = first_circle_len;
    var dy = dx % total_len;

    if( check )
    {
      offset_side1 = this.tasks[this.tasks.length - 3].length + offset_mid;
    }
    else
    {
      offset_side1 = this.tasks[this.tasks.length - 3].length + offset_mid;
    }
    if( this.options["DashedGoal"].val )
    {
      // Dashing outer circle of goal field        
      for( var i = 1; i <= 3; i++ )
      {
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
        this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
        this.tasks[this.tasks.length - i].task_options.push( new IntRobotAction( "dashed_align", 0 ) );
      }
      this.tasks[this.tasks.length - 3].task_options.push( new FloatRobotAction( "dashed_offset", offset_side1 ) );
      this.tasks[this.tasks.length - 3].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 3].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_offset", offset_mid ) );
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_offset", offset_side2 ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    }
    // technical lines
    var techlines = [ ];

    for( var i = 0; i < 6; i++ )
    {
      var side = 1;
      var len = this.options.TechLength1._val * US_style;
      var dist = goalwidth / 2;
      var push = true;

      if( i === 3 || i === 4 || i === 5 )
        var side = -1;

      if( i === 0 || i === 5 )
        dist += this.options.TechDist2.val + this.options.LineWidth.val / 2;

      if( i === 1 || i === 4 )
        dist += this.options.TechDist1.val + this.options.LineWidth.val / 2;

      if( i === 2 || i === 3 )
      {
        len = this.options.TechLength2._val;
        dist += this.options.LineWidth.val / 2;

        if( this.options["US"].val )
        {
          if( i === 3 || !this.options["GoalMarking"].val )
            continue;
          var goal1_1 = mid.add( o1.multiply( goalwidth / 2 ) );
          var goal2_1 = mid.subtract( o1.multiply( goalwidth / 2 ) );

          var goal1_2 = goal1_1.subtract( o2.multiply( goaldepth ) );
          var goal2_2 = goal2_1.subtract( o2.multiply( goaldepth ) );
          techlines.push( new LineTask( this.tasks.length, [ goal1_1, goal1_2 ], false, true ) );
          techlines.push( new LineTask( this.tasks.length + 1, [ goal1_2, goal2_2 ], false, true ) );
          techlines.push( new LineTask( this.tasks.length + 2, [ goal2_2, goal2_1 ], false, true ) );

          if( this.options["TechLines"].val && this.options["GoalMarking"].val )
          {
            if(this.options["Goal marking dashed"].val){
              this.tasks.push( new LineTask( this.tasks.length, [goal1_1, goal1_2], false, true));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options["Goal dashes length"].val));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options["Goal dashes length"].val ) );
              this.tasks.push( new LineTask( this.tasks.length, [goal1_2, goal2_2], false, true));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options["Goal dashes length"].val));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options["Goal dashes length"].val ) );
              this.tasks.push( new LineTask( this.tasks.length, [goal2_2, goal2_1], false, true));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options["Goal dashes length"].val));
              this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options["Goal dashes length"].val ) );
            }
            else if(this.options["Goal small marks"].val){
              let tmp1 = goal1_2.subtract(o1.multiply(this.options["Goal small marks length"].val));
              let tmp2 = goal1_2.add(o2.multiply(this.options["Goal small marks length"].val));
              let tmp3 = goal2_2.add(o1.multiply(this.options["Goal small marks length"].val));
              let tmp4 = goal2_2.add(o2.multiply(this.options["Goal small marks length"].val));
              this.tasks.push( new LineTask( this.tasks.length, [goal1_2, tmp2], false, true));
              this.tasks.push( new LineTask( this.tasks.length, [goal1_2, tmp1], false, true));
              this.tasks.push( new LineTask( this.tasks.length, [goal2_2, tmp3], false, true));
              this.tasks.push( new LineTask( this.tasks.length, [goal2_2, tmp4], false, true));
            }
            else{
              this.tasks.push( techlines[techlines.length - 3] );
              this.tasks.push( techlines[techlines.length - 2] );
              this.tasks.push( techlines[techlines.length - 1] );
            }
          }
          continue;
        }
      }

      var techstart = mid.add( o1.multiply( dist * side ) );
      if(this.options.reverseInGoal.val && i !== 2 && i !== 3)
        var techline = new Line( techstart, techstart.subtract( o2.multiply( len ) ) );
      else if(!this.options.reverseInGoal.val)
        var techline = new Line( techstart, techstart.subtract( o2.multiply( len ) ) );


      if(this.options.reverseInGoal.val && this.options["TechLines"].val)
      {
        if(i === 5 && which_end === 0)
          this.tasks.splice(indexForTech, 0, techline.toLineTask( this.tasks.length, false, true ) )
        else if(i === 4 && which_end === 0)
          this.tasks.splice(indexForTech, 0, techline.toLineTask( this.tasks.length, false, true ) )
        else if(i === 5 && which_end === 1)
          this.tasks.splice(indexForTech, 0, techline.toLineTask( this.tasks.length, false, true ) )
        else if(i === 4 && which_end === 1)
          this.tasks.splice(indexForTech, 0, techline.toLineTask( this.tasks.length, false, true ) )
        else
          this.tasks.push( techline.toLineTask( this.tasks.length, false, true ) );
      }
      else
      {
        if( this.options["TechLines"].val )
          this.tasks.push( techline.toLineTask( this.tasks.length, false, true ) );
      }
      
    }
    if( this.options["US"].val && this.options["Spectator Lines"].val){
      let tmp1, tmp2;
      let dashed_length = (24).inch2meter();
      if(which_end === 0){
        tmp1 = c1.subtract(o1.multiply(this.options["Spectator Lines offset 1"].val));
        tmp2 = c4.subtract(o1.multiply(this.options["Spectator Lines offset 1"].val));
      }
      if(which_end === 1){
        tmp1 = c2.subtract(o1.multiply(this.options["Spectator Lines offset 2"].val));
        tmp2 = c3.subtract(o1.multiply(this.options["Spectator Lines offset 2"].val));
      }
      this.tasks.push( new LineTask(this.tasks.length, [tmp1, tmp2], false, true));
      this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", dashed_length));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dashed_length ) );
    }
    if( this.options["US"].val && this.options["Team Areas"].val && which_end === 1){
      let dashed_length = (24).inch2meter();
      let tmp1 = c1.subtract(o2.multiply(this.options.yardLine.val));
      let tmp2 = c4.add(o2.multiply(this.options.yardLine.val));
      let tmp3 = tmp1.add(o1.multiply(this.options["Spectator Lines offset 1"].val));
      let tmp4 = tmp2.add(o1.multiply(this.options["Spectator Lines offset 1"].val));
      this.tasks.push(new LineTask(this.tasks.length, [tmp1, tmp3], false, true));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction("dashed_length", dashed_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dashed_length ) );
      this.tasks.push(new LineTask(this.tasks.length, [tmp2, tmp4], false, true));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction("dashed_length", dashed_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dashed_length ) );
      this.tasks.push(new LineTask(this.tasks.length, [new Line(tmp1, tmp3).middle, new Line(tmp2, tmp4).middle], false, true));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction("dashed_length", dashed_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dashed_length ) );
    }
    // goal marking for US
    if( this.options["US"].val && this.options["GoalMarking"].val )
    {
      if( this.options["TechLines"].val )
      {
        
      }
      else
      {
        var goal1_1 = mid.add( o1.multiply( goalwidth / 2 ) );
        var goal2_1 = mid.subtract( o1.multiply( goalwidth / 2 ) );
        var goal1_2 = goal1_1.subtract( o2.multiply( goaldepth ) );
        var goal2_2 = goal2_1.subtract( o2.multiply( goaldepth ) );
        this.tasks.push( new LineTask( this.tasks.length, [ goal1_1, goal1_2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ goal1_2, goal2_2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ goal2_2, goal2_1 ], false, true ) );
      }

    }

    // kickdot
    if( this.options.Kickdot.val )
    {
      var kickdot_center = mid.add( o2.multiply( this.options.KickdotDist.val ) );
      var kickdot_g1 = kickdot_center.add( o1.multiply( this.options.KickdotDia.val / 2 ) );
      var kickdot_g2 = kickdot_center.subtract( o1.multiply( this.options.KickdotDia.val / 2 ) );

      if( this.options["US"].val )
        this.tasks.push( new LineTask( this.tasks.length, [ kickdot_center.subtract( o1.multiply( this.options.Kickline.val / 2 ) ),
          kickdot_center.add( o1.multiply( this.options.Kickline.val / 2 ) ) ], false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kickdot_g2, kickdot_g1 ], kickdot_center, false, false, true ) )
    }
    // end of backline
    let goalendendTask;
    if(!this.options.continousLines.val && !this.options.reverseInGoal.val){
      goalendendTask = new LineTask( this.tasks.length, [ inner_left, end ], false, true ) 
      this.tasks.push(goalendendTask);
    }
  }

  create_side( which_side )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    var g2 = new Line(c1, c4).unit_vector;

    if(this.options.drawHalfField.val)
    {
      c1 = p[0].add(g2.multiply(0.5 * this.options.Length.val - 0.5 * this.options.LineWidth.val));
      c2 = p[3].add(g2.multiply(0.5 * this.options.Length.val - 0.5 * this.options.LineWidth.val));

    }


    var s3 = new Line( c2, c3 );
    var s4 = new Line( c4, c1 );


    var s3_g2 = s3.unit_vector;
    var s3_g1 = s3_g2.rotate_90_cw();
    var s4_g2 = s4.reverse().unit_vector;
    var s4_g1 = s4_g2.rotate_90_cw();

    if( which_side === 0 ) // side 3
    {
      var o1 = s3_g1.rotate_180();
      var o2 = s3_g2;
      var start = c2;
      var end = c3;
      var sideline = s3;
    }
    else if( which_side === 1 ) // side 4      
    {
      var o1 = s4_g1;
      var o2 = s4_g2.rotate_180();
      var start = c4;
      var end = c1;
      var sideline = s4;
    }

    if( this.options["US"].val )
    {
      var new_start = start;
      for( var i = 0; i < 6; i++ )
      {
        var side = 1;
        var len = this.options.TechLength1._val;
        var dist = 0;

        if( i === 3 || i === 4 || i === 5 )
        {
          var side = -1;
          start = end;
        }

        if( i === 0 || i === 5 ){
          dist = this.options.TechDist3.val;
          len = this.options.TechLength2._val;
        }

        if( i === 1 || i === 4 ){
          dist = this.options.TechDist4.val;
          len = this.options.TechLength3._val;
        }

        if( i === 2 || i === 3 )
        {
          len = -1 * this.options.TechLength4._val;
          dist = this.options.TechDist5.val * -1;
          start = sideline.middle;
        }

        var mark = start.add( o2.multiply( dist * side ) );
        if(this.options.continousLines.val && i === 0)
          this.tasks.push( new LineTask( this.tasks.length, [ new_start, end ], false, true ) );
        else if(!this.options.continousLines.val)
          this.tasks.push( new LineTask( this.tasks.length, [ new_start, mark ], false, true ) );
        if( this.options["TechLines"].val )
          this.tasks.push( new LineTask( this.tasks.length, [ mark, mark.subtract( o1.multiply( len ) ) ], false, true ) );
        if( i === 5 && !this.options.continousLines.val )
          this.tasks.push( new LineTask( this.tasks.length, [ mark, end ], false, true ) );
        
        else
          new_start = mark;
      }
    }
    else
    {
      var l1 = start.add( o2.multiply( this.options.TechDist3.val ) );
      var l2 = end.subtract( o2.multiply( this.options.TechDist3.val ) );
      let l3 = start.add( o2.multiply( this.options.TechDist6.val ) );
      let l4 = end.subtract( o2.multiply( this.options.TechDist6.val ) );
      if( this.options["TechLines"].val )
      {
        if(this.options.continousLines.val)
          this.tasks.push( new LineTask( this.tasks.length, [ start, end ], false, true ) );
        else{
          this.tasks.push( new LineTask( this.tasks.length, [ start, l1 ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ start, l3 ], false, true ) );
        }
        this.tasks.push( new LineTask( this.tasks.length, [ l1, l1.add( o1.multiply( this.options.TechLength1._val ) ) ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l3, l3.add( o1.multiply( this.options.TechLength1._val ) ) ], false, true ) );
        if(!this.options.continousLines.val)
          this.tasks.push( new LineTask( this.tasks.length, [ l1, l2 ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l2, l2.add( o1.multiply( this.options.TechLength1._val ) ) ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ l4, l4.add( o1.multiply( this.options.TechLength1._val ) ) ], false, true ) );
        if(!this.options.continousLines.val){
          this.tasks.push( new LineTask( this.tasks.length, [ l2, end ], false, true ) );
          this.tasks.push( new LineTask( this.tasks.length, [ l4, end ], false, true ) );
        }
      }
      else
        this.tasks.push( sideline.toLineTask( this.tasks.length, false, true ) );
    }
  }

  drawHalfField()
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

    // sideline - side 3
    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.create_side( 0 );

    // goalend - side 2    
    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.create_end( 1 );

    // sideline - side 4
    this.create_side( 1 );


    //middle
    var mid = new Line( s3.middle, s4.middle );

    var mid_g1 = mid.reverse().unit_vector;
    var mid_g2 = mid_g1.rotate_90_cw();

    var center = mid.middle;
    if( this.options["US"].val )
    {
      if(this.options.continousLines.val)
        this.tasks.push( new LineTask( this.tasks.length, [ mid.start, mid.end ], false, true ) );
      else
        this.tasks.push( new LineTask( this.tasks.length, [ mid.start, center ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ center.subtract( mid_g2.multiply( this.options.CenterLen.val / 2 ) ),
        center.add( mid_g2.multiply( this.options.CenterLen.val / 2 ) ) ], false, true ) );
      if(!this.options.continousLines.val)
        this.tasks.push( new LineTask( this.tasks.length, [ center, mid.end ], false, true ) );
    }
    else
      this.tasks.push( mid.toLineTask( this.tasks.length, false, true ) );

    //yardline 2        
    var line2 = new Line( c4.subtract( s2_g2.multiply( this.options.yardLine.val ) ), c3.subtract( s2_g2.multiply( this.options.yardLine.val ) ) );
    var yardline2 = new Line( line2.cross_with_line( s4 ), line2.cross_with_line( s3 ) );
    this.tasks.push( yardline2.toLineTask( this.tasks.length, false, true ) );
  }



  drawFullField()
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

    var g2 = s3.unit_vector;
    var g1 = g2.rotate_90_ccw();

    // goalend - side 1
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.create_end( 0 );

    // sideline - side 3
    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.create_side( 0 );

    // goalend - side 2    
    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.create_end( 1 );

    // sideline - side 4
    this.create_side( 1 );

    //yardline 1
    var line1 = new Line( c1.add( s1_g2.multiply( this.options.yardLine.val ) ), c2.add( s1_g2.multiply( this.options.yardLine.val ) ) );
    var yardline1 = new Line( line1.cross_with_line( s4 ), line1.cross_with_line( s3 ) );
    this.tasks.push( yardline1.toLineTask( this.tasks.length, false, true ) );

    //middle
    var mid = new Line( s3.middle, s4.middle );

    var mid_g1 = mid.reverse().unit_vector;
    var mid_g2 = mid_g1.rotate_90_cw();

    var center = mid.middle;
    if( this.options["US"].val )
    {
      if(this.options.continousLines.val)
        this.tasks.push( new LineTask( this.tasks.length, [ mid.start, mid.end ], false, true ) );
      else
        this.tasks.push( new LineTask( this.tasks.length, [ mid.start, center ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ center.subtract( mid_g2.multiply( this.options.CenterLen.val / 2 ) ),
        center.add( mid_g2.multiply( this.options.CenterLen.val / 2 ) ) ], false, true ) );
      if(!this.options.continousLines.val)
        this.tasks.push( new LineTask( this.tasks.length, [ center, mid.end ], false, true ) );
    }
    else
      this.tasks.push( mid.toLineTask( this.tasks.length, false, true ) );

    //yardline 2        
    var line2 = new Line( c4.subtract( s2_g2.multiply( this.options.yardLine.val ) ), c3.subtract( s2_g2.multiply( this.options.yardLine.val ) ) );
    var yardline2 = new Line( line2.cross_with_line( s4 ), line2.cross_with_line( s3 ) );
    this.tasks.push( yardline2.toLineTask( this.tasks.length, false, true ) );
  }



  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    if(this.options.drawHalfField.val)
    {
      this.drawHalfField();
    }
    else 
    {
      this.drawFullField();
    }



    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }



}

class US_FieldHockey extends FieldHockey
{
  static template_type = "Hockey"; // Translateable
  static template_title = "US"; // Translateable
  static template_id = "us_field_hockey"; // no spaces
  static template_image = "img/templates/field_hockey_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    var this_class = this;
    this.options.Length.val = (100).yard2meter(); //max length
    this.options.Width.val = (60).yard2meter(); //max width

    this.options["US"].val = true;
    this.options.yardLine.name = "25 Yard Line";
    this.options.yardLine._val = ((25).yard2meter() - this.options.LineWidth.val);
    this.options.GoalWidth._val = (12).foot2meter() - this.options.LineWidth.val;
    this.options.GoalDepth._val = (4).foot2meter() - this.options.LineWidth.val;
    this.options.InnerRadius._val = (16).yard2meter() - this.options.LineWidth.val;
    this.options.OuterRadius.val = (5).yard2meter();
    this.options.DashLength._val = (1).foot2meter() - this.options.LineWidth.val;
    this.options.DashSpace._val = (4).foot2meter() - this.options.LineWidth.val;

    this.options["TechLines"].val = true;
    this.options.TechLength1.val = (1).foot2meter();

    // TechDist info (US style):
    // 1 = 2nd hashes from corners on backline
    // 2 = outer hashes on backline
    // 3 = 1st sideline hash from corners
    // 4 = 2nd hash from corners on sideline
    // 5 = Team Line hashes 
    this.options.TechDist1.val = (5).yard2meter();
    this.options.TechDist2.val = (10).yard2meter();
    this.options.TechDist3.val = (5).yard2meter() - this.options.LineWidth.val;
    this.options.TechDist4.val = (16).yard2meter() - this.options.LineWidth.val;
    this.options.TechDist5.val = (5).yard2meter();
    this.options.Kickdot.name = "Penalty stroke line";
    this.options.Kickdot.val = true;
    this.options.KickdotDist.name = "Penalty stroke line distance";
    this.options.KickdotDist.val = (7).yard2meter();
    this.options.Kickline.val = (12).inch2meter();
    this.options.CenterLen.val = (20).inch2meter();
  }

}