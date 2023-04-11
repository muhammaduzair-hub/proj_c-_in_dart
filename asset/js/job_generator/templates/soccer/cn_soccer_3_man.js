class CnSoccer3Man extends square_pitch
{
  static template_title = "3 man";
  static template_id = "cn_soccer_3_man_beta";
  static template_type = "Soccer";
  static template_image = "img/templates/chinese_pitch_3man.png";
        
 constructor(id, name, layout_method) {
    super( id, name, layout_method );
    this.options.Length.val = 26;
    this.options.Width.val = 15;
    this.options.GoalWidth ={
        configurable : false,
        name : "Goal width",
        type: "float",
        val : 1.2
    };
    this.options.GoalCircle={
        configurable : false,
        name: "Goal area",
        type: "float",
        val: 1.5
    };
    this.options.GoalDepth = {
        configurable : false,
        name:"Goal depth",
        type :"float",
        val: 0.25
    };
    this.options.CenterCircle = {
        configurable : false,
        name :"Center circle",
        type: "float",
        val: 3
    };
    this.options.PenaltyDistance = {
        configurable : false,
        name: "Penalty distance",
        type: "float",
        val:6
    };
    this.options.SideDistance = {
        configurable: false,
        name :"Side distance",
        type:"float",
        val:3
    };
    this.options.SideLineAdditionalLine = {
        configutrable: false,
        name : "side line length",
        type:"float",
        val : 0.25
        }
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
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
    create_goalend(which_end){
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
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [c1, c2], false, true ) );
    let l_GoalPoint = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let r_GoalPoint = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let l_backGoalPoint = l_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    let r_backGoalPoint = r_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    this.tasks.push(new LineTask(this.tasks.length, [l_GoalPoint, l_backGoalPoint], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_backGoalPoint, r_GoalPoint], false, true));
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
    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    let l_GoalPoint = goalPoint.add(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let r_GoalPoint = goalPoint.subtract(vertical_vector.multiply(this.options.GoalWidth.val/2));
    let l_backGoalPoint = l_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    let r_backGoalPoint = r_GoalPoint.subtract(horizontal_vector.multiply(this.options.GoalDepth.val));
    this.tasks.push(new LineTask(this.tasks.length, [l_GoalPoint, l_backGoalPoint], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [r_backGoalPoint, r_GoalPoint], false, true));
    }else if(which_end===4)
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
    let vertical_vector = line1.unit_vector;
    let line2 = new Line(c2, c3);
    let line4 = new Line(c4, c1);
    let middle_point1 = line2.middle;
    let middle_point2 = line4.middle;
    let diagonalLine = new Line(c1, c3);
    let middlePoint = diagonalLine.middle;
    let r_middlePoint = middlePoint.add(vertical_vector.multiply(this.options.CenterCircle.val/2));
    let l_middlePoint = middlePoint.subtract(vertical_vector.multiply(this.options.CenterCircle.val/2));
    this.tasks.push(new LineTask(this.tasks.length,[middle_point2, middle_point1], false, true));
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
    let penalty_point = goalPoint.add(horizontal_vector.multiply(this.options.PenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
    }else if(which_end ===2)
    {
    let line1 = new Line(c3, c4);
    let line2 = new Line(c2,c3);
    let horizontal_vector = line2.unit_vector;
    let goalPoint = line1.middle;
    let penalty_point = goalPoint.subtract(horizontal_vector.multiply(this.options.PenaltyDistance.val));
    this.tasks.push(new WaypointTask(this.tasks.length, penalty_point, false, true));
    }
    }
    create_goalArc(which_end)
    {
    let p = this.drawing_points;
    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    if(which_end === 1){
    let line1 = new Line(c1, c2);
    let vertical_vector = line1.unit_vector;
    let goalPoint = line1.middle;
    let r_goalCircle = goalPoint.add(vertical_vector.multiply(this.options.GoalCircle.val));
    let l_goalCircle = goalPoint.subtract(vertical_vector.multiply(this.options.GoalCircle.val));
    let arc = Arc.From2PointsAndCenter(r_goalCircle, l_goalCircle, goalPoint, true);
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) );
    }else if(which_end===2)
    {
    let line1 = new Line(c3, c4);
    let vertical_vector = line1.unit_vector;
    let goalPoint = line1.middle;
    let r_goalCircle = goalPoint.add(vertical_vector.multiply(this.options.GoalCircle.val));
    let l_goalCircle = goalPoint.subtract(vertical_vector.multiply(this.options.GoalCircle.val));
    let arc = Arc.From2PointsAndCenter(r_goalCircle, l_goalCircle, goalPoint, true);
    this.tasks.push( arc.toArcTask( this.tasks.length, false, false, true ) );
    }
    }
    create_sideLine(){
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
    let sideLine = new Line(c4, c1);
    let side_middle = sideLine.middle;
    let f_point = side_middle.subtract(horizontal_vector.multiply(this.options.SideDistance.val));
    let r_point = f_point.subtract(vertical_vector.multiply(this.options.SideLineAdditionalLine.val));
    let s_point = side_middle.add(horizontal_vector.multiply(this.options.SideDistance.val));
    let l_point = s_point.subtract(vertical_vector.multiply(this.options.SideLineAdditionalLine.val));
    this.tasks.push(new LineTask(this.tasks.length, [f_point, r_point], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [s_point, l_point], false, true));
    }
    draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    this.create_goalend(1);
    this.create_goalArc(1);
    this.create_penalty_spot(1);
    this.create_goalend(2);
    this.create_goalend(3);
    this.create_goalArc(2);
    this.create_penalty_spot(2);
    this.create_goalend(4);
    this.create_sideLine();
    this.create_middle();
    
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines( );
    this.refresh_test_run();
    }
}