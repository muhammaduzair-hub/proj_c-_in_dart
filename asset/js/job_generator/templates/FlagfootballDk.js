class FlagfootballDK extends square_pitch
{
  static template_type = "Flagfootball";
  static template_title = "Dk";
  static template_id = "flag_football_dk_beta";
  static template_image = "img/templates/Flag-Football-Pitch1.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.EndZoneLength = {
      configurable: false,
      name: "Endzone",
      type: "float",
      val :  9.144
    };
    this.options.Width = {
      confiurable : false,
      name : "Width",
      type : "float",
      val  : 22.86
    };
    this.options.Length = {
      configurable : false, 
      name : "Length",
      type : "float",
      val  : 64
    };
    this.options.NoRunningLength = {
      configurable : false,
      name : "No Running",
      type : "float",
      val  : 4.572
    };
    this.options.ShortLineLength = {
      configurable : true,
      name : "Mid line length",
      type : "float",
      val  : 1.5
    };
    this.options.ShortLineDistance = {
      configurable : true,
      name : "Mid line distance",
      type : "float",
      val  : 5
    };
    this.options.RestrainingLines = {
      configurable : true, 
      name : "Restraining lines",
      type : "bool",
      val  : true
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

  create_field()
  {
    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let vertical_vector = line1.unit_vector;
    let horizontal_vector = line2.unit_vector;
    let center_point = new Line(c1,c3).middle;
    
    let mid1 = center_point.subtract(vertical_vector.multiply(this.options.Width.val /2));
    let top_left_c = mid1.add(horizontal_vector.multiply(this.options.Length.val / 2));
    let top_right_c = mid1.subtract(horizontal_vector.multiply(this.options.Length.val /2));
    let mid2 = center_point.add(vertical_vector.multiply(this.options.Width.val /2));
    let bottom_left_c = mid2.add(horizontal_vector.multiply(this.options.Length.val /2));
    let bottom_right_c = mid2.subtract(horizontal_vector.multiply(this.options.Length.val/2 ));

    let add_point1 = top_right_c.add(horizontal_vector.multiply(this.options.EndZoneLength.val));
    let add_point2 = bottom_right_c.add(horizontal_vector.multiply(this.options.EndZoneLength.val));
    let add_point3 = bottom_left_c.subtract(horizontal_vector.multiply(this.options.EndZoneLength.val));
    let add_point4 = top_left_c.subtract(horizontal_vector.multiply(this.options.EndZoneLength.val));

    let outMid1 = center_point.subtract(vertical_vector.multiply((this.options.Width.val * 1.24) /2));
    let outMid2 = center_point.add(vertical_vector.multiply((this.options.Width.val * 1.24) /2));
    let top_left_out_c = outMid1.add(horizontal_vector.multiply((this.options.Length.val* 1.08585) / 2));
    let top_right_out_c = outMid1.subtract(horizontal_vector.multiply((this.options.Length.val* 1.08585) /2));
    let bottom_left_out_c = outMid2.add(horizontal_vector.multiply((this.options.Length.val* 1.08585) /2));
    let bottom_right_out_c = outMid2.subtract(horizontal_vector.multiply((this.options.Length.val* 1.08585)/2 ));
    
    if(this.options.RestrainingLines.val)
    {

    this.dashed_function(top_right_out_c, top_left_out_c);
  }
  
    this.tasks.push(new LineTask(this.tasks.length, [top_left_c, top_right_c], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [bottom_right_c, bottom_left_c], false, true));
  
    if(this.options.RestrainingLines.val){
    this.dashed_function(bottom_left_out_c, bottom_right_out_c);
    this.dashed_function(bottom_right_out_c, top_right_out_c);
    }
    
    this.tasks.push(new LineTask(this.tasks.length, [top_right_c, bottom_right_c], false, true));
    
    this.tasks.push(new LineTask(this.tasks.length, [add_point2, add_point1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [add_point4, add_point3], false, true));
    
    this.tasks.push(new LineTask(this.tasks.length, [bottom_left_c, top_left_c], false, true));
    
    if(this.options.RestrainingLines.val)
    this.dashed_function(top_left_out_c, bottom_left_out_c);

  }
  create_NoRunningLine(which_side)
  {
    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let vertical_vector = line1.unit_vector;
    let horizontal_vector = line2.unit_vector;
    let center_point = new Line(c1,c3).middle;

    let run_point1 = c1.add(horizontal_vector.multiply(this.options.EndZoneLength.val + this.options.NoRunningLength.val));
    let run_point2 = c2.add(horizontal_vector.multiply(this.options.EndZoneLength.val + this.options.NoRunningLength.val));
    let run_point3 = c3.subtract(horizontal_vector.multiply(this.options.EndZoneLength.val + this.options.NoRunningLength.val));
    let run_point4 = c4.subtract(horizontal_vector.multiply(this.options.EndZoneLength.val + this.options.NoRunningLength.val));

    if(which_side == 1)
    this.dashed_function(run_point1, run_point2);
     if(which_side == 2)
    this.dashed_function(run_point3, run_point4);
  }
  create_middle()
  {
    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    let line1 = new Line(c1, c2);
    let vertical_vector = line1.unit_vector;
    let center_point = new Line(c1,c3).middle;

    let mid1 = center_point.subtract(vertical_vector.multiply(this.options.Width.val /2));
    let mid2 = center_point.add(vertical_vector.multiply(this.options.Width.val /2));
    this.tasks.push(new LineTask(this.tasks.length, [mid1, mid2], false, true));
  }
  create_shortLine(which_line)  
  {
    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let vertical_vector = line1.unit_vector;
    let horizontal_vector = line2.unit_vector;
    let center_point = new Line(c1,c3).middle;
    let short_line_point1 = center_point.subtract(horizontal_vector.multiply((this.options.Length.val/2) - this.options.EndZoneLength.val - this.options.NoRunningLength.val - this.options.ShortLineDistance.val));
    let r_short_pt1 = short_line_point1.subtract(vertical_vector.multiply(this.options.ShortLineLength.val /2));
    let r_short_pt2 = short_line_point1.add(vertical_vector.multiply(this.options.ShortLineLength.val /2));
    let short_line_point2 = center_point.add(horizontal_vector.multiply((this.options.Length.val/2) - this.options.EndZoneLength.val - this.options.NoRunningLength.val - this.options.ShortLineDistance.val));
    let l_short_pt1 = short_line_point2.subtract(vertical_vector.multiply(this.options.ShortLineLength.val /2));
    let l_short_pt2 = short_line_point2.add(vertical_vector.multiply(this.options.ShortLineLength.val /2));
    if(which_line == 1)
    this.tasks.push(new LineTask(this.tasks.length, [r_short_pt2, r_short_pt1], false, true));
    if(which_line ==2)
    this.tasks.push(new LineTask(this.tasks.length, [l_short_pt1, l_short_pt2], false, true));
  }

  dashed_function(start, end){
    this.tasks.push( new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", 0.5 ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", 0.5 ) );
  }
  draw()
  {

    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    this.create_field();
    this.create_NoRunningLine(2);
    this.create_shortLine(2);
    this.create_middle();
    this.create_shortLine(1);
    this.create_NoRunningLine(1);

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
    
  }
}