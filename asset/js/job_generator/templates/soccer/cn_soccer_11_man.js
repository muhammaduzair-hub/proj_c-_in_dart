class CnSoccer11Man extends soccer_pitch
{
  static template_title = "11 man";
  static template_id = "cn_soccer_11_man_beta";
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

   this.options.EightManPitch1 = {
    configurable : true,
    name : "8 man pitch 1",
    type : "bool",
    val  : false
   };
   this.options.EightManPitch2 = {
    configurable : true,
    name : "8 man pitch 2",
    type : "bool",
    val  : false
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
    this.options.EightManGoalBoxLength = {
      configurable : false,
      name : "8 man goal box length",
      type : "float",
      val  :  13.5
    };
    this.options.EightManGoalBoxDepth = {
      configurable : false,
      name : "8 man goal box depth",
      type : "float",
      val  : 4 
    };
    this.options.EightManPenaltyAreaLength = {
      configurable : false,
      name : "8 man penalty area length",
      type : "float",
      val  : 25.5 
    };
    this.options.EightManPenaltyAreaDepth = {
      configurable : false,
      name : "8 man penalty area depth",
      type : "float",
      val  : 10
    };
    this.options.EightManPenaltyDistance = {
      configurable : false,
      name : "8 man penalty distance",
      type : "float",
      val  : 9
    };
    this.options.EightManPenaltyArcRadius = {
      configurable : false, 
      name : "8 man penalty arc radius",
      type : "float",
      val  : 6
    };
    this.options.EightManWidth = {
      configurable : false,
      name : "8 man width",
      type : "float",
      val  : 48
    };
    this.options.EightManCornerRadius = {
      configurable : false,
      name : "8 man corner radius",
      type : "float",
      val  : 0.8
    };
    this.options.EightManTechnicalLinesLength = {
      configurable : false,
      name : "technical lines length",
      type : "float",
      val  : 0.25
    };
    this.options.EightManTechnicalLinesDistance = {
      configurable : false,
      name : "Technical lines distance",
      type : "float",
      val  : 6
    };
    this.options.EightManCenterCircleRadius = {
      configurable : false,
      name : "8 man center circle radius",
      type : "float",
      val  : 6  
    };
  }
  create_eight_man_pitch(){
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let line3 = new Line(c3, c4);
    let line4 = new Line(c4, c1);
    let vertical_vector = line1.unit_vector;
    let horizontal_vector = line4.unit_vector;

    let m1 = line4.middle;
    let m2 = line2.middle;
    if(this.options.EightManPitch1.val){
    let g1 = new Line(c4, m1).middle;
    let g2 = new Line(c3, m2).middle;
    
    //top left goal box
    let t_l_g_p1 = g1.add(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    let t_r_g_p1 = g1.subtract(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    
    let t_r_g_p2 = t_r_g_p1.add(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    let t_l_g_p2 = t_l_g_p1.add(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    
    this.tasks.push(new LineTask(this.tasks.length, [t_l_g_p1, t_l_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [t_l_g_p2, t_r_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [t_r_g_p1, t_r_g_p2], false, true));
    //bottom left goal box

    let b_l_g_p1 = g2.add(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    let b_r_g_p1 = g2.subtract(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
  
    let b_r_g_p2 = b_r_g_p1.subtract(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    let b_l_g_p2 = b_l_g_p1.subtract(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
   
    this.tasks.push(new LineTask(this.tasks.length, [b_l_g_p1, b_l_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [b_l_g_p2, b_r_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [b_r_g_p1, b_r_g_p2], false, true));

    //top left penalty area
    let top_left1 = g1.add(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let top_rigth1 = g1.subtract(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let top_left2 = top_left1.add(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val));
    let top_rigth2 = top_rigth1.add(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val)); 

    this.tasks.push(new LineTask(this.tasks.length, [top_left1, top_left2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_left2, top_rigth2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_rigth2, top_rigth1], false, true));

    //top left penalty point
    let t_l_penalty = g1.add(vertical_vector.multiply(this.options.EightManPenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, t_l_penalty, false, true));

    //top left penalty arc
    let l_arc_p = t_l_penalty.add(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));
    let r_arc_p = t_l_penalty.subtract(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));

    let arc = Arc.From2PointsAndCenter(l_arc_p, r_arc_p, t_l_penalty, true);
    let cross_points = arc.crosses_with_line(new Line(top_left2, top_rigth2));
    let t_arc = Arc.From2PointsAndCenter(cross_points[0], cross_points[1] , t_l_penalty, true );
    this.tasks.push( t_arc.toArcTask( this.tasks.length, false, false, true ) ); 

    //botton left penalty area
    let bottom_left1 = g2.add(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let bottom_rigth1 = g2.subtract(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let bottom_left2 = bottom_left1.subtract(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val));
    let bottom_rigth2 = bottom_rigth1.subtract(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val)); 

    this.tasks.push(new LineTask(this.tasks.length, [bottom_left1, bottom_left2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [bottom_left2, bottom_rigth2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [bottom_rigth2, bottom_rigth1], false, true));

    //bottom left penalty point
    let b_l_penalty = g2.subtract(vertical_vector.multiply(this.options.EightManPenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, b_l_penalty, false, true));

    //bottom left penalty arc
    let l_arc_p1 = b_l_penalty.add(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));
    let r_arc_p1 = b_l_penalty.subtract(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));

    let arc1 = Arc.From2PointsAndCenter(l_arc_p1, r_arc_p1, b_l_penalty, true);
    let cross_points1 = arc1.crosses_with_line(new Line(bottom_left2, bottom_rigth2));
    let t_arc1 = Arc.From2PointsAndCenter(cross_points1[0], cross_points1[1] , b_l_penalty, false );
    this.tasks.push( t_arc1.toArcTask( this.tasks.length, false, false, true ) ); 

    //Sides
    let top_left_corner = g1.subtract(horizontal_vector.multiply(this.options.EightManWidth.val/2));
    let top_right_corner = g1.add(horizontal_vector.multiply(this.options.EightManWidth.val /2));
    let bottom_left_corner = g2.subtract(horizontal_vector.multiply(this.options.EightManWidth.val/2));
    let bottom_right_corner = g2.add(horizontal_vector.multiply(this.options.EightManWidth.val /2));

    this.tasks.push(new LineTask(this.tasks.length, [top_left_corner, bottom_left_corner], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_right_corner, bottom_right_corner], false, true));

    //corners
    //top left corner area
    let top_left_corner_p1 = top_left_corner.add(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let top_left_corner_p2 = top_left_corner.add(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let TopLeftCornerArc = Arc.From2PointsAndCenter(top_left_corner_p1, top_left_corner_p2, top_left_corner, true);
    let cross_point1 = TopLeftCornerArc.crosses_with_line(new Line(top_left_corner, bottom_left_corner));
    let cross_point2 = TopLeftCornerArc.crosses_with_line(line4);
    let TopLeftCornerArc1 = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[1], top_left_corner, false  );
    this.tasks.push( TopLeftCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 
    //technical lines
    let tech_line1 = cross_point1[0].add(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line2 = tech_line1.subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line1, tech_line2], false, true));
    let tech_line3 = cross_point2[1].add(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line4 = tech_line3.subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line3, tech_line4], false, true));
    //bottom left corner area
    let bottom_left_corner_p1 = bottom_left_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let bottom_left_corner_p2 = bottom_left_corner.subtract(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let BottomLeftCornerArc = Arc.From2PointsAndCenter(bottom_left_corner_p1, bottom_left_corner_p2, bottom_left_corner, false);
    let cross_point3 = BottomLeftCornerArc.crosses_with_line(new Line(top_left_corner, bottom_left_corner));
    let cross_point4 = BottomLeftCornerArc.crosses_with_line(line2);
    let BottomLeftCornerArc1 = Arc.From2PointsAndCenter(cross_point3[0], cross_point4[0], bottom_left_corner, true  );
    this.tasks.push( BottomLeftCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 

    //technical lines
    let tech_line5 = cross_point3[0].subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line6 = tech_line5.subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line5, tech_line6], false, true));
    let tech_line7 = cross_point4[0].add(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line8 = tech_line7.add(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line7, tech_line8], false, true));
    //bottom right corner area
    let bottom_right_corner_p1 = bottom_right_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let bottom_right_corner_p2 = bottom_right_corner.subtract(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let BottomRightCornerArc = Arc.From2PointsAndCenter(bottom_right_corner_p1, bottom_right_corner_p2, bottom_right_corner, false);
    let cross_point5 = BottomRightCornerArc.crosses_with_line(new Line(top_right_corner, bottom_right_corner));
    let cross_point6 = BottomRightCornerArc.crosses_with_line(line2);
    let BottomRightCornerArc1 = Arc.From2PointsAndCenter(cross_point5[0], cross_point6[1], bottom_right_corner, false  );
    this.tasks.push( BottomRightCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 
    //technical lines
    let tech_line9 = cross_point5[0].subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line10 = tech_line9.add(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line9, tech_line10], false, true));
    let tech_line11 = cross_point6[1].subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line12 = tech_line11.add(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line11, tech_line12], false, true));
    //top right corner area
     let top_right_corner_p1 = top_right_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
     let top_right_corner_p2 = top_right_corner.add(vertical_vector.multiply(this.options.EightManCornerRadius.val));
 
     let TopRightCornerArc = Arc.From2PointsAndCenter(top_right_corner_p1, top_right_corner_p2, top_right_corner, false);
     let cross_point7 = TopRightCornerArc.crosses_with_line(new Line(top_right_corner, bottom_right_corner));
     let cross_point8 = TopRightCornerArc.crosses_with_line(line4);
     let TopRightCornerArc1 = Arc.From2PointsAndCenter(cross_point7[0], cross_point8[1], top_right_corner, false  );
     this.tasks.push( TopRightCornerArc.toArcTask( this.tasks.length, false, false, true ) ); 
    
     //technical lines
    let tech_line13 = cross_point7[0].add(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line14 = tech_line13.add(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line13, tech_line14], false, true));
    let tech_line15 = cross_point8[1].subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line16 = tech_line15.subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line15, tech_line16], false, true));

     //create middle
     let center_point = new Line(g1,g2).middle;
     this.tasks.push(new WaypointTask(this.tasks.length, center_point, false, true));

     this.tasks.push(new CircleTask(this.tasks.length, this.options.EightManCenterCircleRadius.val, center_point, true));
      
     let sideCenter1 = new Line(top_left_corner, bottom_left_corner).middle;
     let sideCenter2 = new Line(bottom_right_corner, top_right_corner).middle;
     this.tasks.push(new LineTask(this.tasks.length, [sideCenter1, sideCenter2], false,true));
    }
    
    if(this.options.EightManPitch2.val){
      let g1 = new Line(m1, c1).middle;
      let g2 = new Line(m2, c2).middle;

      //top right goal box
    let t_l_g_p1 = g1.add(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    let t_r_g_p1 = g1.subtract(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    
    let t_r_g_p2 = t_r_g_p1.add(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    let t_l_g_p2 = t_l_g_p1.add(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    
    this.tasks.push(new LineTask(this.tasks.length, [t_l_g_p1, t_l_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [t_l_g_p2, t_r_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [t_r_g_p1, t_r_g_p2], false, true));
    //bottom right goal box

    let b_l_g_p1 = g2.add(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
    let b_r_g_p1 = g2.subtract(horizontal_vector.multiply(this.options.EightManGoalBoxLength.val /2));
  
    let b_r_g_p2 = b_r_g_p1.subtract(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
    let b_l_g_p2 = b_l_g_p1.subtract(vertical_vector.multiply(this.options.EightManGoalBoxDepth.val));
   
    this.tasks.push(new LineTask(this.tasks.length, [b_l_g_p1, b_l_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [b_l_g_p2, b_r_g_p2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [b_r_g_p1, b_r_g_p2], false, true));

    //top right penalty area
    let top_left1 = g1.add(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let top_rigth1 = g1.subtract(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let top_left2 = top_left1.add(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val));
    let top_rigth2 = top_rigth1.add(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val)); 

    this.tasks.push(new LineTask(this.tasks.length, [top_left1, top_left2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_left2, top_rigth2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_rigth2, top_rigth1], false, true));

    //top right penalty point
    let t_l_penalty = g1.add(vertical_vector.multiply(this.options.EightManPenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, t_l_penalty, false, true));

    //top right penalty arc
    let l_arc_p = t_l_penalty.add(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));
    let r_arc_p = t_l_penalty.subtract(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));

    let arc = Arc.From2PointsAndCenter(l_arc_p, r_arc_p, t_l_penalty, true);
    let cross_points = arc.crosses_with_line(new Line(top_left2, top_rigth2));
    let t_arc = Arc.From2PointsAndCenter(cross_points[0], cross_points[1] , t_l_penalty, true );
    this.tasks.push( t_arc.toArcTask( this.tasks.length, false, false, true ) ); 

    //botton right penalty area
    let bottom_left1 = g2.add(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let bottom_rigth1 = g2.subtract(horizontal_vector.multiply(this.options.EightManPenaltyAreaLength.val/2));
    let bottom_left2 = bottom_left1.subtract(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val));
    let bottom_rigth2 = bottom_rigth1.subtract(vertical_vector.multiply(this.options.EightManPenaltyAreaDepth.val)); 

    this.tasks.push(new LineTask(this.tasks.length, [bottom_left1, bottom_left2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [bottom_left2, bottom_rigth2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [bottom_rigth2, bottom_rigth1], false, true));

    //bottom right penalty point
    let b_l_penalty = g2.subtract(vertical_vector.multiply(this.options.EightManPenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, b_l_penalty, false, true));

    //bottom right penalty arc
    let l_arc_p1 = b_l_penalty.add(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));
    let r_arc_p1 = b_l_penalty.subtract(horizontal_vector.multiply(this.options.EightManPenaltyArcRadius.val));

    let arc1 = Arc.From2PointsAndCenter(l_arc_p1, r_arc_p1, b_l_penalty, true);
    let cross_points1 = arc1.crosses_with_line(new Line(bottom_left2, bottom_rigth2));
    let t_arc1 = Arc.From2PointsAndCenter(cross_points1[0], cross_points1[1] , b_l_penalty, false );
    this.tasks.push( t_arc1.toArcTask( this.tasks.length, false, false, true ) ); 

    //Sides
    let top_left_corner = g1.subtract(horizontal_vector.multiply(this.options.EightManWidth.val/2));
    let top_right_corner = g1.add(horizontal_vector.multiply(this.options.EightManWidth.val /2));
    let bottom_left_corner = g2.subtract(horizontal_vector.multiply(this.options.EightManWidth.val/2));
    let bottom_right_corner = g2.add(horizontal_vector.multiply(this.options.EightManWidth.val /2));

    this.tasks.push(new LineTask(this.tasks.length, [top_left_corner, bottom_left_corner], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [top_right_corner, bottom_right_corner], false, true));

    //corners
    //top left corner area
    let top_left_corner_p1 = top_left_corner.add(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let top_left_corner_p2 = top_left_corner.add(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let TopLeftCornerArc = Arc.From2PointsAndCenter(top_left_corner_p1, top_left_corner_p2, top_left_corner, true);
    let cross_point1 = TopLeftCornerArc.crosses_with_line(new Line(top_left_corner, bottom_left_corner));
    let cross_point2 = TopLeftCornerArc.crosses_with_line(line4);
    let TopLeftCornerArc1 = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[1], top_left_corner, false  );
    this.tasks.push( TopLeftCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 
    //technical lines
    let tech_line1 = cross_point1[0].add(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line2 = tech_line1.subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line1, tech_line2], false, true));
    let tech_line3 = cross_point2[1].add(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line4 = tech_line3.subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line3, tech_line4], false, true));
    //bottom left corner area
    let bottom_left_corner_p1 = bottom_left_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let bottom_left_corner_p2 = bottom_left_corner.subtract(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let BottomLeftCornerArc = Arc.From2PointsAndCenter(bottom_left_corner_p1, bottom_left_corner_p2, bottom_left_corner, false);
    let cross_point3 = BottomLeftCornerArc.crosses_with_line(new Line(top_left_corner, bottom_left_corner));
    let cross_point4 = BottomLeftCornerArc.crosses_with_line(line2);
    let BottomLeftCornerArc1 = Arc.From2PointsAndCenter(cross_point3[0], cross_point4[0], bottom_left_corner, true  );
    this.tasks.push( BottomLeftCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 

    //technical lines
    let tech_line5 = cross_point3[0].subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line6 = tech_line5.subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line5, tech_line6], false, true));
    let tech_line7 = cross_point4[0].add(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line8 = tech_line7.add(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line7, tech_line8], false, true));
    //bottom right corner area
    let bottom_right_corner_p1 = bottom_right_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
    let bottom_right_corner_p2 = bottom_right_corner.subtract(vertical_vector.multiply(this.options.EightManCornerRadius.val));

    let BottomRightCornerArc = Arc.From2PointsAndCenter(bottom_right_corner_p1, bottom_right_corner_p2, bottom_right_corner, false);
    let cross_point5 = BottomRightCornerArc.crosses_with_line(new Line(top_right_corner, bottom_right_corner));
    let cross_point6 = BottomRightCornerArc.crosses_with_line(line2);
    let BottomRightCornerArc1 = Arc.From2PointsAndCenter(cross_point5[0], cross_point6[1], bottom_right_corner, false  );
    this.tasks.push( BottomRightCornerArc1.toArcTask( this.tasks.length, false, false, true ) ); 
    //technical lines
    let tech_line9 = cross_point5[0].subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line10 = tech_line9.add(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line9, tech_line10], false, true));
    let tech_line11 = cross_point6[1].subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line12 = tech_line11.add(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line11, tech_line12], false, true));
    //top right corner area
     let top_right_corner_p1 = top_right_corner.subtract(horizontal_vector.multiply(this.options.EightManCornerRadius.val));
     let top_right_corner_p2 = top_right_corner.add(vertical_vector.multiply(this.options.EightManCornerRadius.val));
 
     let TopRightCornerArc = Arc.From2PointsAndCenter(top_right_corner_p1, top_right_corner_p2, top_right_corner, false);
     let cross_point7 = TopRightCornerArc.crosses_with_line(new Line(top_right_corner, bottom_right_corner));
     let cross_point8 = TopRightCornerArc.crosses_with_line(line4);
     let TopRightCornerArc1 = Arc.From2PointsAndCenter(cross_point7[0], cross_point8[1], top_right_corner, false  );
     this.tasks.push( TopRightCornerArc.toArcTask( this.tasks.length, false, false, true ) ); 
    
     //technical lines
    let tech_line13 = cross_point7[0].add(vertical_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line14 = tech_line13.add(horizontal_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line13, tech_line14], false, true));
    let tech_line15 = cross_point8[1].subtract(horizontal_vector.multiply(this.options.EightManTechnicalLinesDistance.val));
    let tech_line16 = tech_line15.subtract(vertical_vector.multiply(this.options.EightManTechnicalLinesLength.val));
    this.tasks.push(new LineTask(this.tasks.length, [tech_line15, tech_line16], false, true));

     //create middle
     let center_point = new Line(g1,g2).middle;
     this.tasks.push(new WaypointTask(this.tasks.length, center_point, false, true));

     this.tasks.push(new CircleTask(this.tasks.length, this.options.EightManCenterCircleRadius.val, center_point, true));
      
     let sideCenter1 = new Line(top_left_corner, bottom_left_corner).middle;
     let sideCenter2 = new Line(bottom_right_corner, top_right_corner).middle;
     this.tasks.push(new LineTask(this.tasks.length, [sideCenter1, sideCenter2], false,true));
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
    // this.tasks.push(new LineTask(this.tasks.length, [top_l2, top_r2], false, true));
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
      this.create_eight_man_pitch();
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
    }

    this.options.CenterCircleRadius.val = save_CenterCircleRadius;
    this.options.Fields = original_fields;

    this.tasks = this.tasks.filter( t => {
      return t;
    } );

  }
  static get template_title( )
  {
    return "11 man";
  }
}