class CnSoccer5Man extends square_pitch
{
  static template_title = "5 man";
  static template_id = "cn_soccer_5_man_beta";
  static template_type = "Soccer";
  static template_image = "img/templates/chinese_pitch_5man.png";
        
 constructor(id, name, layout_method) {
    super( id, name, layout_method );
    this.options.Length.val = 40;
    this.options.Width.val = 20;
    this.options.GoalWidth ={
        configurable : false,
        name : "Goal width",
        type : "float",
        val  : 3
    };
    this.options.GoalCircle={
        configurable : false,
        name : "Goal area",
        type : "float",
        val  : 6
    };
    this.options.GoalDepth = {
        configurable : false,
        name : "Goal depth",
        type : "float",
        val  : 0.25
    };
    this.options.CenterCircle = {
        configurable : false,
        name :"Center circle",
        type : "float",
        val  : 3
    };
    this.options.PenaltyDistance1 = {
        configurable : false,
        name : "Penalty distance",
        type : "float",
        val  : 6
    };
    this.options.PenaltyDistance2 = {
        configurable : false,
        name : "Second penalty point",
        type : "float",
        val  : 10
    };
    this.options.CornerRadius = {
        configurable : false,
        name : "Corner radius",
        type : "float",
        val  : 0.25
    };
    this.options.AdditionalPointsDistance = {
        configurable : false,
        name : "Additional points distance",
        type : "float",
        val : 5
    };
    this.options.AdditionalPoints = {
        configurable : false,
        name : "Additional points",
        type : "bool",
        val  : true
    };
    this.options.AdditionalSideLines = {
        configurable : false,
        name : "Additional side lines",
        type : "bool",
        val  : true
    };
    this.options.AdditionalSideLinesDistance = {
        configurable : false,
        name : "Side lines distance",
        type : "float",
        val  : 5 
    };
    this.options.AdditionalSideLinesLength = {
        configurable : false,
        name : "Side lines length",
        type : "float",
        val  : 0.25 
    };
    this.options.AdditionalPenaltyLines = {
        configurable : false,
        name: "Additional penalty Lines",
        type : "bool",
        val : true
    };
    this.options.AdditionalPenaltyLinesDistance = {
        configurable : false,
        name : "Additional penalty Lines distance",
        type : "float",
        val : 5
    };
    this.options.AdditionalPenaltyLinesLength = {
        configurable : false,
        name : "Additional penalty Lines length",
        type : "float",
        val : 0.4
    };
    this.options.AdditionalBackLine = {
        configurable : false,
        name : "Back lines",
        type : "bool",
        val  : true
    };
    this.options.AdditionalBackLineDistance = {
        configurable : false,
        name : "Back lines distance",
        type : "float",
        val : 5
    };
    this.options.AdditionalBackLineLength = {
        configurable : false,
        name : "Back Lines length",
        type : "float",
        val  : 0.25
    };
    this.options.CoachBox = {
        configurable : true,
        name : "Coach box",
        type : "bool",
        val  : true
    };
    this.options.CoachBoxWidth = {
        configurable : false,
        name : "Coach box width",
        type : "float",
        val  : 2 
    };
    this.options.CoachBoxLength = {
        configurable : false,
        name : "Coach box length",
        type : "float",
        val  : 5.75 
    };
    this.options.CoachBoxDistance = {
        configurable : false,
        name : "Coac box distance",
        type : "float",
        val  : 0.75
    };
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
    }

    create_end(which_end){
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    if(which_end === 1)
    {
    let line1 = new Line(c1, c2);
    let vertical_vector = line1.unit_vector;
    let line2 = new Line(c2,c3);
    let horizontal_vector = line2.unit_vector;
    let goalPoint = line1.middle;
    let l_GoalPoint = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let r_GoalPoint = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let l_backGoalPoint = l_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    let r_backGoalPoint = r_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [c1, c2], false, true ) );
    this.tasks.push(new LineTask(this.tasks.length, [r_backGoalPoint, r_GoalPoint], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [l_GoalPoint, l_backGoalPoint], false, true));
    }else if(which_end === 2)
    {
    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    }else if(which_end ===3)
    {
    let line1 = new Line(c3, c4);
    let vertical_vector = line1.unit_vector;
    let line2 = new Line(c4,c1);
    let horizontal_vector = line2.unit_vector;
    let goalPoint = line1.middle;
    let l_GoalPoint = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let r_GoalPoint = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let l_backGoalPoint = l_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    let r_backGoalPoint = r_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    this.tasks.push(new LineTask(this.tasks.length, [l_GoalPoint, l_backGoalPoint], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_backGoalPoint, r_GoalPoint], false, true));
    }else if(which_end === 4)
    {
    this.start_locations.push( new StartLocation( c4, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    }
    }
    create_middle()
    {
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let line3 = new Line(c4, c1);
    let vertical_vector = line1.unit_vector;
    let diagonalLine = new Line(c1, c3);
    let middlePoint = diagonalLine.middle;
    let r_middlePoint = middlePoint.add(vertical_vector.multiply(this.options.CenterCircle.val));
    let l_middlePoint = middlePoint.subtract(vertical_vector.multiply(this.options.CenterCircle.val));
    let middlePoint1 = line2.middle;
    let middlePoint2 = line3.middle;
    this.tasks.push(new LineTask(this.tasks.length, [middlePoint2, middlePoint1], false, true));
    this.tasks.push(new WaypointTask(this.tasks.length, middlePoint, false, true));
    this.tasks.push(new ArcTask(this.tasks.length,[r_middlePoint, l_middlePoint], middlePoint, true, false, true ));
    }
    create_penalty_spot(which_end)
    {
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    if(which_end === 1){
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2,c3);
    let horizontal_vector = line2.unit_vector;
    let goalPoint = line1.middle;
    let penalty_point = goalPoint.add(horizontal_vector.multiply(this.options.PenaltyDistance1.val));
    let penalty_point2 = goalPoint.add(horizontal_vector.multiply(this.options.PenaltyDistance2.val));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point2, false, true));
    }else if(which_end ===2)
    {
    let line1 = new Line(c3, c4);
    let line2 = new Line(c2,c3);
    let horizontal_vector = line2.unit_vector;
    let goalPoint = line1.middle;
    let penalty_point = goalPoint.subtract(horizontal_vector.multiply(this.options.PenaltyDistance1.val));
    let penalty_point2 = goalPoint.subtract(horizontal_vector.multiply(this.options.PenaltyDistance2.val));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point2, false, true));
    }
    }
    create_goalArc(which_side)
    {
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let line1 = new Line(c1, c2);
    let vertical_vector = line1.unit_vector;
    let line2 = new Line(c2,c3);
    let horizontal_vector = line2.unit_vector;
    let line3 = new Line(c3, c4);
     if(which_side ===1)
     {
     let goalPoint = line1.middle;
     let l_goalCircle = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val / 2 ));
     let r_goalCircle = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val / 2 ));
     let l_goalCircle1 = l_goalCircle.add(vertical_vector.multiply(this.options.GoalCircle.val));
     let l_goalCircle2 = l_goalCircle.add(horizontal_vector.multiply(this.options.GoalCircle.val));
     let arc1 = Arc.From2PointsAndCenter(l_goalCircle1, l_goalCircle2  , l_goalCircle, true );
     this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) ); 
     let r_goalCircle1 = r_goalCircle.subtract(vertical_vector.multiply(this.options.GoalCircle.val));
     let r_goalCircle2 = r_goalCircle.add(horizontal_vector.multiply(this.options.GoalCircle.val));
     this.tasks.push(new LineTask(this.tasks.length, [l_goalCircle2, r_goalCircle2], false, true));
     let arc2 = Arc.From2PointsAndCenter(r_goalCircle2, r_goalCircle1, r_goalCircle, true );
     this.tasks.push( arc2.toArcTask( this.tasks.length, false,false, true ) ); 
     }else if(which_side)
     {
     let goalPoint = line3.middle;
     let l_goalCircle = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val / 2 ));
     let r_goalCircle = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val / 2 ));
     let l_goalCircle1 = l_goalCircle.subtract(vertical_vector.multiply(this.options.GoalCircle.val));
     let l_goalCircle2 = l_goalCircle.subtract(horizontal_vector.multiply(this.options.GoalCircle.val));
     let arc1 = Arc.From2PointsAndCenter(l_goalCircle1, l_goalCircle2  , l_goalCircle, true );
     this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) ); 
     let r_goalCircle1 = r_goalCircle.add(vertical_vector.multiply(this.options.GoalCircle.val));
     let r_goalCircle2 = r_goalCircle.subtract(horizontal_vector.multiply(this.options.GoalCircle.val));
     this.tasks.push(new LineTask(this.tasks.length, [l_goalCircle2, r_goalCircle2], false, true));
     let arc2 = Arc.From2PointsAndCenter(r_goalCircle2 ,r_goalCircle1, r_goalCircle, true );
     this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) ); 
     }
    }
    create_corner(which_corner){
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let line3 = new Line(c3, c4);
    let line4 = new Line(c4 ,c1);
    let vertical_vector = line1.unit_vector;
    if(which_corner ==1)
    {
    let rp_c = c1.add(vertical_vector.multiply(this.options.CornerRadius.val));
    let lp_c = c1.subtract(vertical_vector.multiply(this.options.CornerRadius.val));
    let arc1 = Arc.From2PointsAndCenter(rp_c, lp_c, c1, true);
    let cross_point1 = arc1.crosses_with_line(line1);
    let cross_point2 = arc1.crosses_with_line(line4);
    let arc = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[0] , c1, true );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) ); 
    }else if(which_corner == 2)
    {
    let rp_c = c2.add(vertical_vector.multiply(this.options.CornerRadius.val));
    let lp_c = c2.subtract(vertical_vector.multiply(this.options.CornerRadius.val));
    let arc1 = Arc.From2PointsAndCenter(rp_c, lp_c, c2, true);
    let cross_point1 = arc1.crosses_with_line(line1);
    let cross_point2 = arc1.crosses_with_line(line2);
    let arc = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[0] , c2, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) ); 
    }else if(which_corner == 3)
    {
    let rp_c = c3.add(vertical_vector.multiply(this.options.CornerRadius.val));
    let lp_c = c3.subtract(vertical_vector.multiply(this.options.CornerRadius.val));
    let arc1 = Arc.From2PointsAndCenter(rp_c, lp_c, c3, true);
    let cross_point1 = arc1.crosses_with_line(line2);
    let cross_point2 = arc1.crosses_with_line(line3);
    let arc = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[1] , c3, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) ); 
    }else if(which_corner == 4)
    {
    let rp_c = c4.add(vertical_vector.multiply(this.options.CornerRadius.val));
    let lp_c = c4.subtract(vertical_vector.multiply(this.options.CornerRadius.val));
    let arc1 = Arc.From2PointsAndCenter(rp_c, lp_c, c4, true);
    let cross_point1 = arc1.crosses_with_line(line3);
    let cross_point2 = arc1.crosses_with_line(line4);
    let arc = Arc.From2PointsAndCenter(cross_point1[0], cross_point2[1] , c4, false );
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) ); 
    }
    }
    create_additional_points(){
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let line1 = new Line(c1, c2);
    let line2 = new Line(c2, c3);
    let line3 = new Line(c3, c4);
    let vertical_vector = line1.unit_vector;
    let horizontal_vector = line2.unit_vector;
    if(this.options.AdditionalPoints.val){
    let goal_point1 = line1.middle;
    let p_point1 = goal_point1.add(horizontal_vector.multiply(this.options.PenaltyDistance2.val));
    let a_p_point1 = p_point1.add(vertical_vector.multiply(this.options.AdditionalPointsDistance.val));
    this.tasks.push(new WaypointTask(this.options.tasks, a_p_point1, false, true));
    let a_p_point11 = p_point1.subtract(vertical_vector.multiply(this.options.AdditionalPointsDistance.val));
    this.tasks.push(new WaypointTask(this.options.tasks, a_p_point11, false, true));
    let goal_point2 = line3.middle;
    let p_point2 = goal_point2.subtract(horizontal_vector.multiply(this.options.PenaltyDistance2.val));
    let a_p_point2 = p_point2.add(vertical_vector.multiply(this.options.AdditionalPointsDistance.val));
    this.tasks.push(new WaypointTask(this.options.tasks, a_p_point2, false, true));
    let a_p_point22 = p_point2.subtract(vertical_vector.multiply(this.options.AdditionalPointsDistance.val));
    this.tasks.push(new WaypointTask(this.options.tasks, a_p_point22, false, true));
    }
    }
    create_additional_side_lines()
    {
        if(this.options.AdditionalSideLines.val){
        let p = this.drawing_points;
        // Corners
        let c1 = p[0];
        let c2 = p[3];
        let c3 = p[4];
        let c4 = p[7];
        let line1 = new Line(c1, c2);
        let line2 = new Line(c2, c3);
        let line4 = new Line(c4 ,c1);
        let vertical_vector = line1.unit_vector;
        let horizontal_vector = line2.unit_vector;
        let middle_point1 = line4.middle;
        let a_point1 = middle_point1.subtract(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let a_s_point21 = a_point1.subtract(vertical_vector.multiply(this.options.AdditionalSideLinesLength.val));
        let a_point2 = a_point1.subtract(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let a_s_point22 = a_point2.subtract(vertical_vector.multiply(this.options.AdditionalSideLinesLength.val));
        let a_point3 = middle_point1.add(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let a_s_point23 = a_point3.subtract(vertical_vector.multiply(this.options.AdditionalSideLinesLength.val));
        let a_point4 = a_point3.add(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let a_s_point24 = a_point4.subtract(vertical_vector.multiply(this.options.AdditionalSideLinesLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [a_point4, a_s_point24], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [a_point3, a_s_point23], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [a_point1, a_s_point21], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [a_point2, a_s_point22], false, true));    
        }
    }
    create_additional_goal_lines(which_add_line)
    {
        if(this.options.AdditionalPenaltyLines.val){
        let p = this.drawing_points;
        // Corners
        let c1 = p[0];
        let c2 = p[3];
        let c3 = p[4];
        let c4 = p[7];
        let line1 = new Line(c1, c2);
        let line2 = new Line(c2, c3);
        let line3 = new Line(c3, c4);
        let vertical_vector = line1.unit_vector;
        let horizontal_vector = line2.unit_vector;
        if(which_add_line === 1)
        {
        let goal_middle = line1.middle;
        let add_penalty_point = goal_middle.add(horizontal_vector.multiply(this.options.AdditionalPenaltyLinesDistance.val));
        let add_penalty_point1 = add_penalty_point.add(vertical_vector.multiply(this.options.AdditionalPenaltyLinesLength.val / 2));
        let add_penalty_point2 = add_penalty_point.subtract(vertical_vector.multiply(this.options.AdditionalPenaltyLinesLength.val / 2));
        this.tasks.push(new LineTask(this.tasks.options, [add_penalty_point1, add_penalty_point2], false, true));
        }else if(which_add_line === 2){
        let goal_middle = line3.middle;
        let add_penalty_point = goal_middle.subtract(horizontal_vector.multiply(this.options.AdditionalPenaltyLinesDistance.val));
        let add_penalty_point1 = add_penalty_point.add(vertical_vector.multiply(this.options.AdditionalPenaltyLinesLength.val / 2));
        let add_penalty_point2 = add_penalty_point.subtract(vertical_vector.multiply(this.options.AdditionalPenaltyLinesLength.val / 2));
        this.tasks.push(new LineTask(this.tasks.options, [add_penalty_point1, add_penalty_point2], false, true));
        }
        }
    }
    create_additional_back_lines(which_back_line)
    {
        if(this.options.AdditionalBackLine.val){
            let p = this.drawing_points;
            // Corners
            let c1 = p[0];
            let c2 = p[3];
            let c3 = p[4];
            let c4 = p[7];
            let line1 = new Line(c1, c2);
            let line2 = new Line(c2, c3);
            let vertical_vector = line1.unit_vector;
            let horizontal_vector = line2.unit_vector;
            if(which_back_line === 1)
            {
            let pt1 = c1.add(vertical_vector.multiply(this.options.AdditionalBackLineDistance.val));
            let pt1_2 = pt1.subtract(horizontal_vector.multiply(this.options.AdditionalBackLineLength.val));
            let pt2 = c2.subtract(vertical_vector.multiply(this.options.AdditionalBackLineDistance.val));
            let pt2_2 = pt2.subtract(horizontal_vector.multiply(this.options.AdditionalBackLineLength.val));
            this.tasks.push(new LineTask( this.tasks.length, [pt1, pt1_2 ], false, true));
            this.tasks.push(new LineTask( this.tasks.length, [pt2, pt2_2 ], false, true));
            }else if(which_back_line === 2)
            {
            let pt1 = c3.subtract(vertical_vector.multiply(this.options.AdditionalBackLineDistance.val));
            let pt1_2 = pt1.add(horizontal_vector.multiply(this.options.AdditionalBackLineLength.val));
            let pt2 = c4.add(vertical_vector.multiply(this.options.AdditionalBackLineDistance.val));
            let pt2_2 = pt2.add(horizontal_vector.multiply(this.options.AdditionalBackLineLength.val));
            this.tasks.push(new LineTask( this.tasks.length, [pt1, pt1_2 ], false, true));
            this.tasks.push(new LineTask( this.tasks.length, [pt2, pt2_2 ], false, true));
            }
        }    
    }
    create_coach_box(which_box)
    {
        let p = this.drawing_points;
        // Corners
        let c1 = p[0];
        let c2 = p[3];
        let c3 = p[4];
        let c4 = p[7];
        let line1 = new Line(c1, c2);
        let line2 = new Line(c2, c3);
        let line3 = new Line(c3, c4);
        let line4 = new Line(c4 ,c1);
        let vertical_vector = line1.unit_vector;
        let horizontal_vector = line2.unit_vector;
        if(this.options.CoachBox.val)
        {
        if(which_box === 1){
        let middlePoint = line4.middle;
        let h_point = middlePoint.add(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let r_low_corner = h_point.subtract(vertical_vector.multiply(this.options.CoachBoxDistance.val));
        let r_top_corner = r_low_corner.subtract(vertical_vector.multiply(this.options.CoachBoxWidth.val));
        let l_top_corner = r_top_corner.add(horizontal_vector.multiply(this.options.CoachBoxLength.val));
        let l_low_corner = l_top_corner.add(vertical_vector.multiply(this.options.CoachBoxWidth.val));

        this.tasks.push(new LineTask(this.tasks.length, [r_low_corner, r_top_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [r_top_corner, l_top_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [l_top_corner, l_low_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [l_low_corner, r_low_corner], false, true));
        }else if(which_box === 2){
        let middlePoint = line4.middle;
        let h_point = middlePoint.subtract(horizontal_vector.multiply(this.options.AdditionalSideLinesDistance.val));
        let r_low_corner = h_point.subtract(vertical_vector.multiply(this.options.CoachBoxDistance.val));
        let r_top_corner = r_low_corner.subtract(vertical_vector.multiply(this.options.CoachBoxWidth.val));
        let l_top_corner = r_top_corner.subtract(horizontal_vector.multiply(this.options.CoachBoxLength.val));
        let l_low_corner = l_top_corner.add(vertical_vector.multiply(this.options.CoachBoxWidth.val));

        this.tasks.push(new LineTask(this.tasks.length, [r_low_corner, r_top_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [r_top_corner, l_top_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [l_top_corner, l_low_corner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [l_low_corner, r_low_corner], false, true));
            }
        }

    }
    draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    this.create_end(1);
    this.create_corner(2);
    this.create_additional_back_lines(1);
    this.create_corner(1);
    this.create_goalArc(1);
    this.create_additional_goal_lines(1);
    this.create_penalty_spot(1);
    this.create_end(2);
    this.create_corner(3);
    this.create_end(3);
    this.create_additional_back_lines(2);
    this.create_goalArc(2);
    this.create_additional_goal_lines(2);
    this.create_penalty_spot(2);
    this.create_corner(4);
    this.create_end(4);
    this.create_middle();
    this.create_additional_points();
    this.create_additional_side_lines();
    this. create_coach_box(1);
    this. create_coach_box(2);
    
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines( );
    this.refresh_test_run();
    }
}