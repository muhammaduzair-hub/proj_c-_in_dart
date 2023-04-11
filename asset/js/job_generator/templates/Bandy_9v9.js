class Bandy_9v9 extends square_pitch
{
  static template_type = "Bandy";
  static template_title = "9v9";
  static template_id = "bandy_9v9_beta";
  static template_image = "img/templates/bandy9v9.svg";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    const this_class = this;

    this.options.Length.val = 80; // Max Value
    this.options.Width.val = 57; // Max Value
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
    this.options.GoalWidth.val = 3.5;

   
    this.options.GoalPostWidth = {
      name: "Goal post width",
      val: 0.075,
      type: "float",
      configurable: true,
      prev_sibling: "GoalWidth"
    }
    this.options.MarkGoalPositions = {
      name: "Mark goal positions",
      val: false,
      configurable: false,
      type: "bool",
      prev_sibling: "GoalPostWidth"
    }
    this.options.spotRadius = {
      name: "Spot radius",
      configurable: true,
      adjustable: false,
      existingJobDefault: 0.075,
      val: 0.075,
      type: "float",
      prev_sibling: "MarkGoalPositions"
    }
    
    this.options.GoalArcRadius = {
        configurable : true,
        name : "Arc radius",
        type : "float",
        val  : 14
    };
    this.options.PenaltyDistance = {
        configurable : true,
        name : "Penalty distance",
        type : "float",
        val  : 11
    };
    
  }
  static get layout_methods()
  {
    return {

      "two_corners": 2,
      "free_hand": 0
    };
  }
  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    var mid1 = new Line( c1, c2 ).middle;
    var mid2 = new Line( c3, c4 ).middle;
    var g1 = new Line( c1, c2 ).unit_vector;
    let smallCircleRadius = this.options.spotRadius.val - this.options.LineWidth.val;
    var n17 = this.options.GoalArcRadius.val;
    var n12 = this.options.PenaltyDistance.val;
    var arc_point1 = mid1.add( g1.multiply( n17 ) );
    var arc_point2 = mid1.subtract( g1.multiply( n17 ) );
    var arc_point3 = mid1.add( g1.multiply( n17 ).rotate_90_cw() );
    var arc_point4 = mid2.add( g1.multiply( n17 ) );
    var arc_point5 = mid2.subtract( g1.multiply( n17 ) );
    var arc_point6 = mid2.add( g1.multiply( n17 ).rotate_90_ccw() );
    // goal dot
    var dot1 = mid1.add( g1.multiply( n12 ).rotate_90_cw() );
    var dot2 = mid1.add( g1.multiply( n12 - smallCircleRadius ).rotate_90_cw() );
    var dot3 = mid1.add( g1.multiply( n12 + smallCircleRadius ).rotate_90_cw() );

    var dot4 = mid2.add( g1.multiply( n12 ).rotate_90_ccw() );
    var dot5 = mid2.add( g1.multiply( n12 - smallCircleRadius ).rotate_90_ccw() );
    var dot6 = mid2.add( g1.multiply( n12 + smallCircleRadius ).rotate_90_ccw() );

    if (this.options.MarkGoalPositions.val) {
      this.drawGoalPositionMarkers(c1, c2);
    }
    else {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    }

    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );

    //rigth goalend
    if (this.options.MarkGoalPositions.val) {
      this.drawGoalPositionMarkers(c3, c4);
    }
    else {
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    }
    //top line
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    //right goal arc
    this.tasks.push( new ArcTask( this.tasks.length, [ arc_point2, arc_point3, arc_point1 ], mid1, false, false, true ) );
    // Right-side penalty spot
    this.tasks.push( new ArcTask( this.tasks.length, [ dot3, dot2 ], dot1, true, false, true ) ); 
    //left goal arc 
    this.tasks.push( new ArcTask( this.tasks.length, [ arc_point5, arc_point6, arc_point4 ], mid2, true, false, true ) );
    // Left-side penalty spot
    this.tasks.push( new ArcTask( this.tasks.length, [ dot5, dot6 ], dot4, true, false, true ) ); 

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }

}