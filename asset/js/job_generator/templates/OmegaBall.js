
class OmegaBall extends Job
{
  
    static template_type = "OmegaBall";// Translateable
    static template_title = "Standard";// Translateable
    static template_id = "omega_ball_dev"; // no spaces
    static template_image = "img/templates/OmegaBall_black.png"; // no spaces

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    let this_class = this;
    this.options.AdditionalArcLines = {
      configurable: true,
      name : "Suggested goal-arc lines",
      val  : false, 
      type : "bool"
    };
    this.options.CoachBox = {
      configurable : true,
      name : "Coach boxes",
      val : true,
      type : "bool"
    };
   this.options.CenterPoint = {
    configurable : true,
    name : "Center point",
    val : true,
    type : "bool"
   };
   this.options.GoalDistance = {
    configurable : false,
    name : "Goal distance",
    val : 86.925 ,
    type : "float"
   };
   this.options.CenterCircleRadius = {
    configurable : false,
    name : "Center circle radius",
    val : 10,//this.options.GoalDistance.val / 8.6925,
    type : "float"
   };
   this.options.GoalRadius = {
    configurable : false,
    name : "Goal radius",
    val : 36,//this.options.CenterCircleRadius.val * 3.6,
    type : "float"
   };
   this.options.BigCircleRadius = {
    configurable : false,
    name : "Field radius",
    val : 87.6,//this.options.GoalDistance.val * 1.007765315 ,
    type : "float"
   };
   this.options.GoalLength = {
    configurable : false,
    name : "Goal length",
    val : 24,
    type : "float"
   };
   this.options.KickFieldsAsDots = {
    configurable: true,
    name: "Spots as dots",
    val: false,
    type: "bool"
  };
  this.options.KickFieldRadius = {
    adjustable: false,
    name: "KickFieldRadius",
    val: 0.06,
    type: "float",
    "dontsave": true
  };
  this.options.SizeHandlesMoveCenter = {
    val: true
  };
  this.options.Length = {
    adjustable: true,
    name: "Length",
    val: 86.925,
    type: "float"
  };
  this.options.Width = {
    adjustable: true,
    name: "Width",
    val: 86.925,
    type: "float"
  };
  this.options.addLineLengthInSides = {
    name: "addLineLengthInSides",
    val: true,
    type: "bool"
  };
  this.options.GoalWidth = {
    adjustable: false,
    name: "GoalWidth",
    val: 0,
    type: "float",
    "dontsave": true
  };
  this.options.disableLengthHandles = {
    val: false,
    type: "bool",
    dontsave: true
  };
  this.options.disableWidthHandles = {
    val: false,
    type: "bool",
    dontsave: true
  };
  }
  create_middle_point()
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    if(this.options.CenterPoint.val)
    {
    this.tasks.push(new WaypointTask(this.tasks.length, center_point, false, true));
    }
  }
  create_middle( )
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let use_small_radius = this.options.CenterCircleRadius.val.foot2meter();//(this.options.GoalDistance.val / 8.6925).foot2meter();
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    //Small circle in the center
    let rad1_small_circle = center_point.add(vector.multiply(use_small_radius));
    let rad2_small_circle = center_point.add(vector.multiply(-use_small_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [rad1_small_circle, rad2_small_circle], center_point, true, false, true ));
  }
  create_goalend(which_goal )
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let goal_distance = (this.options.GoalDistance.val).foot2meter();
    let goal_length = this.options.GoalLength.val.foot2meter();//(this.options.GoalDistance.val / 3.621875).foot2meter();
    let goal_width = this.options.GoalLength.val / 3;//(this.options.GoalDistance.val / 3.621875) / 3;
    if(which_goal == 1)
    {
      //Top goal line
    let goal_point = center_point.add(vector.multiply(goal_distance));
    let r_goal_point = goal_point.add(anti_vector.multiply(goal_length/2));
    let l_goal_point = goal_point.subtract(anti_vector.multiply(goal_length/2));
    let r_back_goal_point = r_goal_point.add(vector.multiply((goal_width).foot2meter()));
    let l_back_goal_point = l_goal_point.add(vector.multiply((goal_width).foot2meter()));
    this.tasks.push(new LineTask(this.tasks.length, [l_goal_point, r_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_goal_point, r_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_back_goal_point, l_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [l_back_goal_point, l_goal_point], false, true));
    }else if(which_goal == 2)
    {//Bottom left goal line
    let vector_new = vector.rotate((120).deg2rad());
    let anti_vector_new = vector_new.rotate((90).deg2rad());
    let goal_point = center_point.add(vector_new.multiply(goal_distance));
    let r_goal_point = goal_point.add(anti_vector_new.multiply(goal_length/2));
    let l_goal_point = goal_point.subtract(anti_vector_new.multiply(goal_length/2));
    let r_back_goal_point = r_goal_point.add(vector_new.multiply((goal_width).foot2meter()));
    let l_back_goal_point = l_goal_point.add(vector_new.multiply((goal_width).foot2meter()));
    this.tasks.push(new LineTask(this.tasks.length, [l_goal_point, r_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_goal_point, r_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_back_goal_point, l_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [l_back_goal_point, l_goal_point], false, true));
    }else if(which_goal ==3)
    {//Bottom right goal line
    let vector_new = vector.rotate((-120).deg2rad());
    let anti_vector_new = vector_new.rotate((90).deg2rad());
    let goal_point = center_point.add(vector_new.multiply(goal_distance));
    let r_goal_point = goal_point.add(anti_vector_new.multiply(goal_length/2));
    let l_goal_point = goal_point.subtract(anti_vector_new.multiply(goal_length/2));
    let r_back_goal_point = r_goal_point.add(vector_new.multiply((goal_width).foot2meter()));
    let l_back_goal_point = l_goal_point.add(vector_new.multiply((goal_width).foot2meter()));
    this.tasks.push(new LineTask(this.tasks.length, [l_goal_point, r_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_goal_point, r_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_back_goal_point, l_back_goal_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [l_back_goal_point, l_goal_point], false, true));
    }
  }
  create_arc(which_arc)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let goal_distance = (this.options.GoalDistance.val).foot2meter();
    let goal_length = (this.options.GoalLength.val ).foot2meter();
    if(which_arc == 1)
    {//An arc from bottom-left gate till the botom-right
    let vector_new1 = vector.rotate((120).deg2rad());
    let anti_vector_new1 = vector_new1.rotate((90).deg2rad());
    let goal_point1 = center_point.add(vector_new1.multiply(goal_distance));
    let r_goal_point1 = goal_point1.add(anti_vector_new1.multiply(goal_length/2));
    let vector_new2 = vector.rotate((240).deg2rad());
    let anti_vector_new2 = vector_new2.rotate((90).deg2rad());
    let goal_point2 = center_point.add(vector_new2.multiply(goal_distance));
    let l_goal_point2 = goal_point2.subtract(anti_vector_new2.multiply(goal_length/2));
    let arc = Arc.From2PointsAndCenter(r_goal_point1 ,l_goal_point2 , center_point, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) );
    }else if(which_arc == 2)
    {//An arc from bottom right goal gate till the top one
    let vector_new2 = vector.rotate((240).deg2rad());
    let anti_vector_new2 = vector_new2.rotate((90).deg2rad());
    let goal_point2 = center_point.add(vector_new2.multiply(goal_distance));
    let r_goal_point2 = goal_point2.add(anti_vector_new2.multiply(goal_length/2));
    let goal_point3 = center_point.add(vector.multiply(goal_distance));
    let l_goal_point3 = goal_point3.subtract(anti_vector.multiply(goal_length/2));
    let arc = Arc.From2PointsAndCenter(r_goal_point2 ,l_goal_point3 , center_point, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) );
    }else if(which_arc == 3)
    {//And arc from top gate till the bottom left
    let goal_point3 = center_point.add(vector.multiply(goal_distance));
    let r_goal_point3 = goal_point3.add(anti_vector.multiply(goal_length/2));
    let vector_new1 = vector.rotate((120).deg2rad());
    let anti_vector_new1 = vector_new1.rotate((90).deg2rad());
    let goal_point1 = center_point.add(vector_new1.multiply(goal_distance));
    let l_goal_point1 = goal_point1.subtract(anti_vector_new1.multiply(goal_length/2));
    let arc = Arc.From2PointsAndCenter(r_goal_point3 ,l_goal_point1 , center_point, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) );    
    }
  }
  create_corner(wchich_corner)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let use_big_radius = (this.options.BigCircleRadius.val).foot2meter();
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let corner_distance = 6;//((this.options.GoalDistance.val / 8.6925) * 3.6) / 6;
    if(wchich_corner == 1)
    {//a circle for the bottom corner 
    let corner_point = center_point.subtract(vector.multiply(use_big_radius - (corner_distance).foot2meter()));
    let corner_radius = (corner_distance / 2).foot2meter();
    let end1 = corner_point.add(vector.multiply(corner_radius));
    let end2 = corner_point.subtract(vector.multiply(corner_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [end1, end2], corner_point, true, false, true));
    }else if(wchich_corner == 2)
    {//A circle for the top left corner
    let new_vector = vector.rotate((120).deg2rad());
    let corner_point = center_point.subtract(new_vector.multiply(use_big_radius - (corner_distance).foot2meter()));
    let corner_radius = (corner_distance / 2).foot2meter();
    let end1 = corner_point.add(vector.multiply(corner_radius));
    let end2 = corner_point.subtract(vector.multiply(corner_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [end1, end2], corner_point, true, false, true));
    }
    else if(wchich_corner == 3)
    {//A circle for the top right corner
    let new_vector = vector.rotate((-120).deg2rad());
    let corner_point = center_point.subtract(new_vector.multiply(use_big_radius - (corner_distance).foot2meter()));
    let corner_radius = (corner_distance / 2).foot2meter();
    let end1 = corner_point.add(vector.multiply(corner_radius));
    let end2 = corner_point.subtract(vector.multiply(corner_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [end1, end2], corner_point, true, false, true));
    }
  }
   create_goal_additional_lines(which_line)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let goal_distance = (this.options.GoalDistance.val).foot2meter();
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let line_distance = 9;//this.options.GoalDistance.val / 9.658333333;
      if(which_line == 1)
      {
        let goal_point = center_point.add(vector.multiply(goal_distance));
        let line_point = goal_point.subtract(vector.multiply(line_distance).foot2meter());
        let r_line_point = line_point.add(anti_vector.multiply((3).foot2meter()));
        let l_line_point = line_point.subtract(anti_vector.multiply((3).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [r_line_point, l_line_point], false, true));
      }else if(which_line ==2)
      {
        let vector_new1 = vector.rotate((120).deg2rad());
        let goal_point1 = center_point.add(vector_new1.multiply(goal_distance));
        let vector_new = vector.rotate((120).deg2rad());
        let anti_vector_new = vector_new.rotate((90).deg2rad());
        let line_point = goal_point1.subtract(vector_new.multiply(line_distance.foot2meter()));
        let r_line_point = line_point.add(anti_vector_new.multiply((line_distance / 3).foot2meter()));
        let l_line_point = line_point.subtract(anti_vector_new.multiply((line_distance / 3).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [r_line_point, l_line_point], false, true));
      }else if(which_line ==3)
      {
        let vector_new = vector.rotate((-120).deg2rad());
        let goal_point2 = center_point.add(vector_new.multiply(goal_distance));
        let anti_vector_new = vector_new.rotate((90).deg2rad());
        let line_point = goal_point2.subtract(vector_new.multiply(line_distance.foot2meter()));
        let r_line_point = line_point.add(anti_vector_new.multiply((line_distance / 3).foot2meter()));
        let l_line_point = line_point.subtract(anti_vector_new.multiply((line_distance / 3).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [r_line_point, l_line_point], false, true));
      }
  }
  create_goal_arc_additional_lines(which_arc_lines)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let goal_radius = (this.options.GoalRadius.val).foot2meter();
    let goal_distance = (this.options.GoalDistance.val).foot2meter();
    let point_distance = this.options.GoalDistance.val / 5.795;
    let lines_length = point_distance / 10;
    if(this.options.AdditionalArcLines.val)
    {
     if(which_arc_lines == 1)
     { 
      let goal_point = center_point.add(vector.multiply(goal_distance));
      let penalty_point = goal_point.subtract(vector.multiply(goal_radius));
      let r_penalty_point = penalty_point.add(anti_vector.multiply((point_distance).foot2meter()));
      let l_penalty_point = penalty_point.subtract(anti_vector.multiply((point_distance).foot2meter()));
      let arc1 = Arc.From2PointsAndCenter(r_penalty_point, l_penalty_point, penalty_point, true);
      let arc2 = this.create_goal_arc(1);
      let cross_points = arc1.crosses_with_arc(arc2);
      let point_vector1 = vector.rotate((-30).deg2rad());
      let r_cross_point1 = cross_points[1].add(point_vector1.multiply((lines_length).foot2meter()));    
      let l_cross_point1 = cross_points[1].subtract(point_vector1.multiply((lines_length).foot2meter()));
      let point_vector2 = vector.rotate((30).deg2rad());
      let r_cross_point2 = cross_points[0].add(point_vector2.multiply((lines_length).foot2meter()));    
      let l_cross_point2 = cross_points[0].subtract(point_vector2.multiply((lines_length).foot2meter()));
      this.tasks.push(new LineTask(this.tasks.length, [r_cross_point2, l_cross_point2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [r_cross_point1, l_cross_point1], false, true));
     }if(which_arc_lines == 2)
     {
       let vector1 = vector.rotate((120).deg2rad());
       let anti_vector1 = vector1.rotate((90).deg2rad());
       let goal_point = center_point.add(vector1.multiply(goal_distance));
       let penalty_point = goal_point.subtract(vector1.multiply(goal_radius));
       let r_penalty_point = penalty_point.add(anti_vector1.multiply((point_distance).foot2meter()));
       let l_penalty_point = penalty_point.subtract(anti_vector1.multiply((point_distance).foot2meter()));
       let arc1 = Arc.From2PointsAndCenter(r_penalty_point, l_penalty_point, penalty_point, true);
       let arc2 = this.create_goal_arc(2);
       let cross_points = arc1.crosses_with_arc(arc2);
       let point_vector1 = vector1.rotate((-30).deg2rad());
       let r_cross_point1 = cross_points[1].add(point_vector1.multiply((lines_length).foot2meter()));    
       let l_cross_point1 = cross_points[1].subtract(point_vector1.multiply((lines_length).foot2meter()));
       let point_vector2 = vector1.rotate((30).deg2rad());
       let r_cross_point2 = cross_points[0].add(point_vector2.multiply((lines_length).foot2meter()));    
       let l_cross_point2 = cross_points[0].subtract(point_vector2.multiply((lines_length).foot2meter()));
       this.tasks.push(new LineTask(this.tasks.length, [r_cross_point2, l_cross_point2], false, true));
       this.tasks.push(new LineTask(this.tasks.length, [r_cross_point1, l_cross_point1], false, true));
      }if(which_arc_lines == 3)
     {
       let vector1 = vector.rotate((-120).deg2rad());
       let anti_vector1 = vector1.rotate((90).deg2rad());
       let goal_point = center_point.add(vector1.multiply(goal_distance));
       let penalty_point = goal_point.subtract(vector1.multiply(goal_radius));
       let r_penalty_point = penalty_point.add(anti_vector1.multiply((point_distance).foot2meter()));
       let l_penalty_point = penalty_point.subtract(anti_vector1.multiply((point_distance).foot2meter()));
       let arc1 = Arc.From2PointsAndCenter(r_penalty_point, l_penalty_point, penalty_point, true);
       let arc2 = this.create_goal_arc(3);
       let cross_points = arc1.crosses_with_arc(arc2);
       let point_vector1 = vector1.rotate((-30).deg2rad());
       let r_cross_point1 = cross_points[1].add(point_vector1.multiply((lines_length).foot2meter()));    
       let l_cross_point1 = cross_points[1].subtract(point_vector1.multiply((lines_length).foot2meter()));
       let point_vector2 = vector1.rotate((30).deg2rad());
       let r_cross_point2 = cross_points[0].add(point_vector2.multiply((lines_length).foot2meter()));    
       let l_cross_point2 = cross_points[0].subtract(point_vector2.multiply((lines_length).foot2meter()));
       this.tasks.push(new LineTask(this.tasks.length, [r_cross_point2, l_cross_point2], false, true));
       this.tasks.push(new LineTask(this.tasks.length, [r_cross_point1, l_cross_point1], false, true));
      }
    }
  }
  create_goal_arc(which_goal_arc)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let goal_radius = (this.options.GoalRadius.val).foot2meter();
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let goal_distance = (this.options.GoalDistance.val).foot2meter();
    let goal_length = (this.options.GoalDistance.val / 3.621875).foot2meter();
    if(which_goal_arc == 1)
    {//An arc for the top gate
    let goal_point = center_point.add(vector.multiply(goal_distance));
    let vector_new2 = vector.rotate((240).deg2rad());
    let anti_vector_new2 = vector_new2.rotate((90).deg2rad());
    let goal_point2 = center_point.add(vector_new2.multiply(goal_distance));
    let r_goal_point2 = goal_point2.add(anti_vector_new2.multiply(goal_length/2));
    let goal_point3 = center_point.add(vector.multiply(goal_distance));
    let l_goal_point3 = goal_point3.subtract(anti_vector.multiply(goal_length/2));
    let arc1 = Arc.From2PointsAndCenter(r_goal_point2 ,l_goal_point3 , center_point, false );
    let pt1 = goal_point.add(anti_vector.multiply(goal_radius));
    let pt2 = goal_point.subtract(anti_vector.multiply(goal_radius));
    let goal_arc = Arc.From2PointsAndCenter(pt1 ,pt2 , goal_point, false );
    let cross_points = arc1.crosses_with_arc(goal_arc);
    let arc2 = Arc.From2PointsAndCenter(cross_points[0], cross_points[1] , goal_point, true );
    this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) ); 
    return arc2;
    }else if(which_goal_arc == 2)
    {//An arc for the bottom left gate
    let goal_point3 = center_point.add(vector.multiply(goal_distance));
    let r_goal_point3 = goal_point3.add(anti_vector.multiply(goal_length/2));
    let vector_new1 = vector.rotate((120).deg2rad());
    let anti_vector_new1 = vector_new1.rotate((90).deg2rad());
    let goal_point1 = center_point.add(vector_new1.multiply(goal_distance));
    let l_goal_point1 = goal_point1.subtract(anti_vector_new1.multiply(goal_length/2));
    let arc1 = Arc.From2PointsAndCenter(r_goal_point3 ,l_goal_point1 , center_point, false );
    let pt1 = goal_point1.add(anti_vector.multiply(goal_radius));
    let pt2 = goal_point1.subtract(anti_vector.multiply(goal_radius));
    let goal_arc = Arc.From2PointsAndCenter(pt1 ,pt2 , goal_point1, false );
    let cross_points = arc1.crosses_with_arc(goal_arc);
    let arc2 = Arc.From2PointsAndCenter(cross_points[0], cross_points[1] , goal_point1, true );
    this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) ); 
    return arc2;
    }else if(which_goal_arc == 3)
    {
      //And arc for bottom right goal gate
    let vector_new2 = vector.rotate((240).deg2rad());
    let anti_vector_new2 = vector_new2.rotate((90).deg2rad());
    let goal_point2 = center_point.add(vector_new2.multiply(goal_distance));
    let l_goal_point2 = goal_point2.subtract(anti_vector_new2.multiply(goal_length/2));
    let vector_new1 = vector.rotate((120).deg2rad());
    let anti_vector_new1 = vector_new1.rotate((90).deg2rad());
    let goal_point1 = center_point.add(vector_new1.multiply(goal_distance));
    let r_goal_point1 = goal_point1.add(anti_vector_new1.multiply(goal_length/2));
    let arc1 = Arc.From2PointsAndCenter(r_goal_point1 ,l_goal_point2 , center_point, false );
    let pt1 = goal_point2.add(anti_vector.multiply(goal_radius));
    let pt2 = goal_point2.subtract(anti_vector.multiply(goal_radius));
    let goal_arc = Arc.From2PointsAndCenter(pt1 ,pt2 , goal_point2, false );
    let cross_points = arc1.crosses_with_arc(goal_arc);
    let arc2 = Arc.From2PointsAndCenter(cross_points[0], cross_points[1] , goal_point2, true );
    this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) ); 
    return arc2;
    }
    
  }
  create_penalty_point(which_penalty_point)
  {
    if(which_penalty_point == 1)
    {
      let p = this.drawing_points;
      let c1 = p[0];
      let c2 = p[3];
      let c3 = p[4];
      let c4 = p[7];
      let point_line = new Line(c1, c3);
      let center_point = point_line.middle;
      let vector = new Line(c2, c1).unit_vector;
      let penalty_point = center_point.add(vector.multiply((this.options.GoalDistance.val - this.options.GoalRadius.val).foot2meter()));
      if(this.options.KickFieldsAsDots.val  == true)
      {
        var kick_guide1 = penalty_point.add( vector.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = penalty_point.add( vector.multiply( this.options.KickFieldRadius.val ) );
        this.tasks.push(new ArcTask(this.tasks.length, [kick_guide1, kick_guide2], penalty_point, true, false, true));
      }
      else{
      this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
      }
    }
    if(which_penalty_point == 2)
    {
      let p = this.drawing_points;
      let c1 = p[0];
      let c2 = p[3];
      let c3 = p[4];
      let c4 = p[7];
      let point_line = new Line(c1, c3);
      let center_point = point_line.middle;
      let vector = new Line(c2, c1).unit_vector;
      let vector_new1 = vector.rotate((120).deg2rad());
      let penalty_point = center_point.add(vector_new1.multiply((this.options.GoalDistance.val - this.options.GoalRadius.val).foot2meter()));
      if(this.options.KickFieldsAsDots.val )
      {
        var kick_guide1 = penalty_point.add( vector.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = penalty_point.add( vector.multiply( this.options.KickFieldRadius.val ) );
        this.tasks.push(new ArcTask(this.tasks.length, [kick_guide1, kick_guide2], penalty_point, true, false, true));
      }else{
      this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
      }
    }
    if(which_penalty_point == 3)
    {
      let p = this.drawing_points;
      let c1 = p[0];
      let c2 = p[3];
      let c3 = p[4];
      let c4 = p[7];
      let point_line = new Line(c1, c3);
      let center_point = point_line.middle;
      let vector = new Line(c2, c1).unit_vector;
      let vector_new2 = vector.rotate((240).deg2rad());
      let penalty_point = center_point.add(vector_new2.multiply((this.options.GoalDistance.val - this.options.GoalRadius.val).foot2meter()));
      if(this.options.KickFieldsAsDots.val)
      {
        var kick_guide1 = penalty_point.add( vector.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = penalty_point.add( vector.multiply( this.options.KickFieldRadius.val ) );
        this.tasks.push(new ArcTask(this.tasks.length, [kick_guide1, kick_guide2], penalty_point, true, false, true));
      }else{
      this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
      }
    }
  }
  create_coach_box(which_coach_box)
  {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let vector = new Line(c2, c1).unit_vector;
    let anti_vector = vector.rotate((90).deg2rad());
    let use_big_radius = (this.options.BigCircleRadius.val).foot2meter();
    let point_line = new Line(c1, c3);
    let center_point = point_line.middle;
    let box_width = this.options.GoalRadius.val / 3.6;
    if(this.options.CoachBox.val)
    {
      if(which_coach_box == 1)
      {//Bottom coach box
      let box_point0 = center_point.subtract(vector.multiply(use_big_radius + (box_width).foot2meter()));
      let box_point1 = box_point0.add(anti_vector.multiply((box_width).foot2meter()));
      let box_point2 = box_point1.subtract(vector.multiply((box_width).foot2meter()));
      let box_point3 = box_point2.subtract(anti_vector.multiply((box_width * 2).foot2meter()));
      let box_point4 = box_point3.add(vector.multiply((box_width).foot2meter()));
      this.tasks.push(new LineTask(this.tasks.length, [box_point1, box_point2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [box_point2, box_point3], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [box_point3, box_point4], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [box_point4, box_point1], false, true));
      }else if(which_coach_box == 2)
      {//Top right coach box
        let new_vector = vector.rotate((120).deg2rad());
        let new_anti_vector = new_vector.rotate((90).deg2rad());
        let box_point0 = center_point.subtract(new_vector.multiply(use_big_radius + (box_width).foot2meter()));
        let box_point1 = box_point0.add(new_anti_vector.multiply((box_width).foot2meter()));
        let box_point2 = box_point1.subtract(new_vector.multiply((box_width).foot2meter()));
        let box_point3 = box_point2.subtract(new_anti_vector.multiply((box_width * 2).foot2meter()));
        let box_point4 = box_point3.add(new_vector.multiply((box_width).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [box_point1, box_point2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point2, box_point3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point3, box_point4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point4, box_point1], false, true));
      }else if(which_coach_box == 3)
      {//Top left coach box
        let new_vector = vector.rotate((-120).deg2rad());
        let new_anti_vector = new_vector.rotate((90).deg2rad());
        let box_point0 = center_point.subtract(new_vector.multiply(use_big_radius + (box_width).foot2meter()))
        let box_point1 = box_point0.add(new_anti_vector.multiply((box_width).foot2meter()));
        let box_point2 = box_point1.subtract(new_vector.multiply((box_width).foot2meter()));
        let box_point3 = box_point2.subtract(new_anti_vector.multiply((box_width * 2).foot2meter()));
        let box_point4 = box_point3.add(new_vector.multiply((box_width).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [box_point1, box_point2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point2, box_point3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point3, box_point4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [box_point4, box_point1], false, true));
      }
    }
  }
  change_width_or_length_with_center_point( option, new_val, add_angle )
  {
    if( new_val === 0 )
      return false;
    var moved = option.val - new_val;
    var move_v = new Vector( 1, 0 ).rotate( this.options.Angle.val + add_angle ).multiply( moved / 2 );
    this.points[0] = this.points[0].add( move_v );
    return this.set_new_val( option, new_val );
  }
  get center()
  {
    var p = this.drawing_points;
    return this.get_middle( p );
  }
  fromCenterTo4Corners( center )
  {
    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_cw();
    g1 = g1.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    var c1 = center.add( g1.divide( 2 ) ).add( g2.divide( 2 ) );
    var c2 = c1.add( g1.multiply( -1 ) );
    var c3 = c2.add( g2.multiply( -1 ) );
    var c0 = c3.add( g1 );
    return [ c0, c1, c2, c3 ];
  }
  from2middleToCenter( points )
  {
    var middle_line = new Line( points[0], points[1] );
    var middle = middle_line.middle;
    this.options.Angle.val = middle_line.as_vector.rotate_90_cw().angle;
    if( !this.options.ForceStdMeasurements.val )
      this.options.Width.val = middle_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
    return middle;
  }
  from2endsToCenter( points )
  {
    var middle_line = new Line( points[0], points[1] );
    var middle = middle_line.middle;
    this.options.Angle.val = middle_line.as_vector.angle;
    return middle;
  }
  from2endsTo4corners( points )
  {
    var m1 = points[0];
    var m2 = points[1];
    var g1 = new Line( m1, m2 ).unit_vector;
    var g2 = g1.rotate_90_cw();
    let c0 = m1.add( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c3 = m1.subtract( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c4 = m2.subtract( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c7 = m2.add( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    this.options.GoalWidth.val = 0;
    return [ c0, c3, c4, c7 ];
  }
  from2cornersOutsideTo2Corners( corners )
  {
    var pitch_angle = (new Line( corners[0], corners[1] )).angle;
    var move_vec0 = this.options.outsideMoveIn.val.rotate( pitch_angle );
    var move_vec1 = this.options.outsideMoveIn.val.mirror_x().rotate( pitch_angle );
    var new_corners = [
      corners[0].add( move_vec0 ),
      corners[1].add( move_vec1 )
    ];
    return new_corners;
  }
  from2cornersTo4Corners( corners )
  {
    var c0 = corners[0];
    var c3 = corners[1];
    var g1 = new Line( c3, c0 ).unit_vector;
    var g2 = g1.rotate_90_cw();
    if( !(this.options.Rotation.val % 2) )
    {
      g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    else
    {
      g2 = g2.multiply( -this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    var c1 = c0.add( g2 );
    var c2 = c3.add( g2 );
    if( !(this.options.Rotation.val % 2) )
      return [ c0, c1, c2, c3 ];
    else
      return [ c3, c2, c1, c0 ];
  }
  from3pointsTo4Corners( points )
  {
    var c1 = points[0];
    var c2 = points[1];
    var side_line = new Line( c1, c2 );
    var p = side_line.point_on_line( points[2] );
    var width = p.dist_to_point( points[2] );
    var direction = new Line( p, points[2] ).unit_vector;
    var wanted_direction = side_line.unit_vector.rotate_90_cw();
    if( !direction.equals( wanted_direction ) )
    {
      width *= -1;
    }
    var g1 = side_line.as_vector;
    var g2 = side_line.unit_vector.rotate_90_cw().multiply( width );
    var c3 = c2.add( g2 );
    var c4 = c3.add( g1.multiply( -1 ) );
    return [ c2, c3, c4, c1 ];
  }
  from2pointsTo4corners( points )
  {
    var c1 = points[0];
    var g1 = new Line( points[0], points[1] ).unit_vector;
    var g2 = g1.rotate_90_cw();
    if( this.options.Rotation.val % 2 )
    {
      g1 = g1.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
      g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    else
    {
      g1 = g1.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
      g2 = g2.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    if( this.options.Rotation.val <= 2 )
      g2 = g2.multiply( -1 );
    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c4 = c1.add( g2 );
    if( this.options.Rotation.val === 1 )
    { // 1->3
      var tmp = c2;
      c2 = c3;
      c3 = tmp;
      tmp = c1;
      c1 = c4;
      c4 = tmp;
    }
    if( this.options.Rotation.val === 2 )
    { // 2->4
      var tmp = c1;
      c1 = c2;
      c2 = tmp;
      tmp = c3;
      c3 = c4;
      c4 = tmp;
    }
    if( !(this.options.Rotation.val % 2) )
    { // 2,4 -> 3
      var t = c1;
      c1 = c2;
      c2 = c3;
      c3 = c4;
      c4 = t;
    }
    //return [c4, c1, c2, c3];
    return [ c2, c3, c4, c1 ];
  }
  from4cornersTo8points( corners )
  {
    var points = [ ];
    var pitch = this;
    [ [ 0, 1 ], [ 2, 3 ] ].forEach( function( index )
    {
      points.push( corners[index[0]] );
      var back_line = new Line( corners[index[0]], corners[index[1]] );
      var goal_width = (pitch.options["Goal box width"] && !(pitch.options["Right goal pole"].val || pitch.options["Left goal pole"].val || pitch.options["reverseInGoal"].val)) ? pitch.options["Goal box width"].val - pitch.options.LineWidth.val : pitch.options.GoalWidth.val;
      if( goal_width > back_line.length )
      {
        goal_width = back_line.length / 2;
      }
      points.push( back_line.middle.add( back_line.unit_vector.multiply( -goal_width / 2 ) ) );
      points.push( back_line.middle.add( back_line.unit_vector.multiply( goal_width / 2 ) ) );
      points.push( corners[index[1]] );
    } );
    return points;
  }
  from4goalPostsTo8points( poles )
  {
    var points = [ ];
    var goal_line1 = new Line( poles[0], poles[1] );
    var goal_line2 = new Line( poles[2], poles[3] );
    var goal_to_goal = new Line( goal_line1.middle, goal_line2.middle );
    var pitch_center = goal_to_goal.middle;
    var g1 = goal_to_goal.unit_vector;
    var g2 = g1.rotate_90_cw();
    var dist_between_width = (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0));
    var middle_side1 = pitch_center.subtract( g2.multiply( dist_between_width / 2 ) );
    var g1_side1 = middle_side1.add( g1 );
    var middle_side2 = pitch_center.add( g2.multiply( dist_between_width / 2 ) );
    var g1_side2 = middle_side2.add( g1 );
    var side1_guide_line = new Line( middle_side1, g1_side1 );
    var side2_guide_line = new Line( middle_side2, g1_side2 );
    var c1 = goal_line1.cross_with_line( side2_guide_line );
    var c2 = goal_line1.cross_with_line( side1_guide_line );
    var c3 = goal_line2.cross_with_line( side1_guide_line );
    var c4 = goal_line2.cross_with_line( side2_guide_line );
    points.push( c1 );
    points.push( poles[0] );
    points.push( poles[1] );
    points.push( c2 );
    points.push( c3 );
    points.push( poles[2] );
    points.push( poles[3] );
    points.push( c4 );
    return points;
  }
  fromNgoalPostsTo8points( poles )
  {
    var points = [ ];
    var number_posts = poles.length / 2;
    var goal_line1 = new Line( poles[0], poles[number_posts - 1] );
    var goal_line2 = new Line( poles[number_posts], poles.last() );
    var goal_to_goal = new Line( goal_line1.middle, goal_line2.middle );
    var pitch_center = goal_to_goal.middle;
    var g1 = goal_to_goal.unit_vector;
    var g2 = g1.rotate_90_cw();
    var dist_between_width = (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0));
    var middle_side1 = pitch_center.subtract( g2.multiply( dist_between_width / 2 ) );
    var g1_side1 = middle_side1.add( g1 );
    var middle_side2 = pitch_center.add( g2.multiply( dist_between_width / 2 ) );
    var g1_side2 = middle_side2.add( g1 );
    var side1_guide_line = new Line( middle_side1, g1_side1 );
    var side2_guide_line = new Line( middle_side2, g1_side2 );
    var c1 = goal_line1.cross_with_line( side2_guide_line );
    var c2 = goal_line1.cross_with_line( side1_guide_line );
    var c3 = goal_line2.cross_with_line( side1_guide_line );
    var c4 = goal_line2.cross_with_line( side2_guide_line );
    var first = poles.slice( 0, poles.length / 2 );
    var last = poles.slice( poles.length / 2 );
    points.push( c1 );
    points.pushAll( first );
    points.push( c2 );
    points.push( c3 );
    points.pushAll( last );
    points.push( c4 );
    return points;
  }
  get_middle( corners )
  {
    var middle = new Vector( 0, 0 );
    for( var i = 0; i < corners.length; i++ )
    {
      var c = corners[i];
      middle.x += c.x;
      middle.y += c.y;
    }
    return middle.divide( corners.length );
  }
  check_clockwise( corners )
  {
    var middle = this.get_middle( corners );
    var sum = 0;
    var c1 = corners[0].subtract( middle );
    for( var i = 1; i < corners.length; i++ )
    {
      var c2 = corners[i].subtract( middle );
      sum += (c2.x - c1.x) * (c2.y + c1.y);
      c1 = c2;
    }
    return sum > 0;
  }
  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;
    var p = [ ];
    switch( this.layout_method )
    {
      case "corner,side":
        p = this.from4cornersTo8points( this.from2pointsTo4corners( this.points ) );
        break;
      case "two_corners":
        p = this.from4cornersTo8points( this.from2cornersTo4Corners( this.points ) );
        break;
      case "two_corners_outside":
        p = this.from4cornersTo8points( this.from2cornersTo4Corners( this.from2cornersOutsideTo2Corners( this.points ) ) );
        break;
      case "two_middle_goal_posts":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2middleToCenter( this.points ) ) );
        break;
      case "two_end_goal_posts":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2endsToCenter( this.points ) ) );
      case "two_end_goal_posts_resize":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2endsToCenter( this.points ) ) );
        break;
      case "single_post":
        p = this.from4cornersTo8points( this.from2endsTo4corners( this.points ) );
        break;
      case "two_corners,side":
        p = this.from4cornersTo8points( this.from3pointsTo4Corners( this.points ) );
        break;
      case "all_corners":
        p = this.from4cornersTo8points( this.points );
        break;
      case "all_goal_posts":
        p = this.fromNgoalPostsTo8points( this.points );
        break;
      case "all_corners,all_goal_posts":
        p = this.points;
        break;
      case "free_hand":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.points[0] ) );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    if( !this.check_clockwise( p ) )
    {
      var first = p;
      var last = first.splice( p.length / 2 );
      first.reverse();
      last.reverse();
      p = ([ first, last ]).flat();
      //p = [ p[3], p[2], p[1], p[0], p[7], p[6], p[5], p[4] ];
    }
    var c1 = p[0];
    var c2 = p.slice( p.length / 2 - 1 )[0];
    var c3 = p.slice( p.length / 2 - 1 )[1];
    var c4 = p.last();
    //var posts_side1 = p.slice( 1, p.length / 2 - 1 );
    var posts_side2 = p.slice( p.length / 2 + 1, p.length - 1 );
    var back_line1 = new Line( c1, c2 );
    var back_line2 = new Line( c3, c4 );
    var side_line1 = new Line( c2, c3 );
    var side_line2 = new Line( c4, c1 );
    var length_line = new Line( back_line1.middle, back_line2.middle );
    var width_p = side_line1.point_on_line( side_line2.start );
    var width_line = new Line( side_line2.start, width_p );
    this.options.Length.val = length_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
    this.options.Width.val = width_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
    this.calculated_drawing_points = p;
    return p;
  }
  refresh_bb()
  {
    //this.bb = this.drawing_points;
    var p = this.drawing_points;
    this.bb = [ p[0], p[3], p[4], p[7] ];
  }

  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;
    // Free hand handles
    if( this.layout_method === "free_hand" )
    {
      var e1 = new Line( p[1], p[2] ).middle;
      var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = new Line( e1, e2 ).middle;
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {
        var g = new_pos_v.subtract( this_class.points[0] );
        this_class.move_all( g );
        this_class.refresh_snapping_lines();
        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );
        var align_lines = align_this[1];
        align_this = align_this[0];
        this_class.move_all( align_this.multiply( -1 ) );
        this_class.refresh_snapping_lines();
        return align_lines;
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
        var align_this = this_class.get_snap_rotation( new_angle, snapping_lines );
        var align_lines = align_this[1];
        new_angle = align_this[0];
        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();
        return align_lines;
      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );
    }
    else if( login_screen_controller.user_level === user_level.DEVELOPER )
    {
      //var e1 = new Line( p[1], p[2] ).middle;
      //var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = this.get_middle( p );
      var original_points = this_class.points.copy();
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {
        var diff_vec = new_pos_v.subtract( pitch_center );
        this_class.points = original_points.map( function( p )
        {
          return p.add( diff_vec );
        } );
        delete this_class.calculated_drawing_points;
        this_class.draw();
      }, function( new_pos_v )
      {
        var diff_vec = new_pos_v.subtract( pitch_center );
        this_class.points = original_points.map( function( p )
        {
          return p.add( diff_vec );
        } );
        //this_class.points = [new_pos_v];
        delete this_class.calculated_drawing_points;
        this_class.draw();
        return true;
      } ) );
    }
    // 2 points handles
    if( this.layout_method === "corner,side" )
    {
      this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[4], p[3] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Length, new_length );
        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }
        this_class.set_new_val( this_class.options.Length, new_length );
      }, function( new_length )
      {
        return this_class.set_new_val( this_class.options.Length, new_length );
      } ) );
      var handle_center = new Line( p[3], p[4] ).middle;
      if( this.options.Rotation.val === 1 || this.options.Rotation.val === 4 )
        handle_center = new Line( p[0], p[7] ).middle;

      this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[3] );
        if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
          g = new Line( p[3], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Width, new_width );
        var new_ps = this_class.drawing_points;
        var align_this;
        if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
          align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
        else
          align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );
        var the_lines = align_this[1];/*.map( function ( line, i ) {
         return new LineTask( i, [line.start, line.end], false, true );
         } );*/
        align_this = align_this[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        this_class.set_new_val( this_class.options.Width, new_width );
        return the_lines;
      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );
    }
    // 2 corners handles
    if( this.layout_method === "two_corners" )
    {
      var handle_center = new Line( p[3], p[4] ).middle;
      if( this_class.options.Rotation.val % 2 )
        handle_center = new Line( p[0], p[7] ).middle;
      this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( p[0], p[3] );
        if( this_class.options.Rotation.val % 2 )
          g = new Line( p[3], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Width, new_width );
        var new_ps = this_class.drawing_points;
        var align_this;
        if( this_class.options.Rotation.val % 2 )
          align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
        else
          align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );
        var the_lines = align_this[1];
        align_this = align_this[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        this_class.set_new_val( this_class.options.Width, new_width );
        return the_lines;
      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );
    }
    if( this.layout_method === "all_goal_posts" )
    {
      var middle_corners = p.slice( p.length / 2 - 1 );
      var handle1 = new Line( middle_corners[0], middle_corners[1] );
      var handle2 = new Line( p[0], p.last() );
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

  }
  refresh_test_run()
  {
    var p = this.drawing_points;
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[3] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[4] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[7] ) );
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    this.snapping_lines.push( new Line( p[0], p[3] ) );
    this.snapping_lines.push( new Line( p[3], p[4] ) );
    this.snapping_lines.push( new Line( p[4], p[7] ) );
    this.snapping_lines.push( new Line( p[7], p[0] ) );
    var e1 = new Line( p[1], p[2] ).middle;
    var e2 = new Line( p[5], p[6] ).middle;
    var m1 = new Line( e1, e2 );
    var s1 = new Line( p[3], p[4] ).middle;
    var s2 = new Line( p[0], p[7] ).middle;
    var m2 = new Line( s1, s2 );
    this.snapping_lines.push( m1 );
    this.snapping_lines.push( m2 );
  }
  draw( )
   {
  let p = this.drawing_points;
  let c1 = p[0];
  let c2 = p[3];
  let c3 = p[4];
  let c4 = p[7];
  let point_line = new Line(c1, c3);
  let center_point = point_line.middle;
  this.tasks = [ ];
  this.start_locations = [ ];
  this.start_locations.push( new StartLocation( center_point, this.tasks.length ) );
  delete this.calculated_drawing_points;
  this.create_middle_point();  
  this.create_middle();
  this.create_goalend(2);
  this.create_arc(1);
  this.create_goalend(3);
  this.create_arc(2);
  this.create_goalend(1);
  this.create_arc(3);
  this.create_corner(1);
  this.create_coach_box(1);
  this.create_goal_arc(3);
  this.create_goal_additional_lines(3)
  this.create_penalty_point(3);
  this.create_goal_arc_additional_lines(3);  
  this.create_corner(2);
  this.create_coach_box(2);
  this.create_goal_arc(1);
  this.create_goal_additional_lines(1);
  this.create_penalty_point(1);
  this.create_goal_arc_additional_lines(1);
  this.create_corner(3);
  this.create_coach_box(3);  
  this.create_goal_arc(2);
  this.create_goal_additional_lines(2);
  this.create_penalty_point(2);
  this.create_goal_arc_additional_lines(2);
  
  this.refresh_bb();
  this.refresh_handles();
  this.refresh_test_run();
  this.refresh_snapping_lines();
  }
}

