class Bandy extends square_pitch
{
  static template_type = "Bandy";
  static template_title = "Standard";
  static template_id = "bandy";
  static template_image = "img/templates/bandy.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    const this_class = this;

    this.options.Length.val = 110; // Max Value
    this.options.Width.val = 65; // Max Value
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
    this.options.GoalWidth.val = 3.5;

    this.options.centerCircleRadius = {
      name: "Center circle radius",
      configurable: false,
      adjustable: false,
      existingJobDefault: 5,
      val: 5,
      type: "float"
    }
    this.options.GoalWidth.configurable = true;
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
      configurable: true,
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
    this.options.drawKnatteBandyOne = {
      name: "Draw knatte bandy %1s",
      name_inserts: 1,
      existingJobDefault: false,
      configurable: true,
      val: false,
      type: "bool",
      prev_sibling: "spotRadius"
    }
    this.options.drawKnatteBandyTwo = {
      name: "Draw knatte bandy %1s",
      name_inserts: 2,
      existingJobDefault: false,
      configurable: true,
      val: false,
      type: "bool",
      prev_sibling: "drawKnatteBandyOne"
    }
    this.options.KnatteGoalWidth = {
      name: "Knatte goal width",
      existingJobDefault: 3.5,
      val: 3.5,
      type: "float",
      prev_sibling: "drawKnatteBandyTwo",
      _configurable: false,
      get configurable() {
        if ((this_class.options.drawKnatteBandyOne.val || this_class.options.drawKnatteBandyTwo.val) && (this_class.options.MarkGoalPositions.val)) {
          return true;
        }
        else {
          return false;
        }
      },
      set configurable(_) {
        // PASS
      }
    }
    this.options.KnatteGoalPostWidth = {
      name: "Knatte goal post width",
      existingJobDefault: 0.075,
      val: 0.075,
      type: "float",
      prev_sibling: "KnatteGoalWidth",
      _configurable: false,
      get configurable() {
        if ((this_class.options.drawKnatteBandyOne.val || this_class.options.drawKnatteBandyTwo.val) && (this_class.options.MarkGoalPositions.val)) {
          return true;
        }
        else {
          return false;
        }
      },
      set configurable(_) {
        // PASS
      }
    }
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
    var mid3 = new Line( c1, c4 ).middle;
    var mid4 = new Line( c2, c3 ).middle;
    var mid5 = new Line( mid3, mid4 ).middle;
    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = new Line( c2, c3 ).unit_vector;
    var g3 = new Line( c2, c1 ).unit_vector;
    var g4 = new Line( c3, c4 ).unit_vector;
    var g5 = new Line( c3, c2 ).unit_vector;
    let smallCircleRadius = this.options.spotRadius.val - this.options.LineWidth.val;
    var n17 = 17;
    var n5 = 5;
    var n12 = 12;
    var arc_point1 = mid1.add( g1.multiply( n17 ) );
    var arc_point2 = mid1.subtract( g1.multiply( n17 ) );
    var arc_point3 = mid1.add( g1.multiply( n17 ).rotate_90_cw() );

    var arc_point4 = mid2.add( g1.multiply( n17 ) );
    var arc_point5 = mid2.subtract( g1.multiply( n17 ) );
    var arc_point6 = mid2.add( g1.multiply( n17 ).rotate_90_ccw() );

    // mid circle
    var midC1 = mid5.add( g1.multiply( n5 ) );
    var midC2 = mid5.subtract( g1.multiply( n5 ) );
    var midC3 = mid5.add( g1.multiply( smallCircleRadius ) );
    var midC4 = mid5.subtract( g1.multiply( 0.2 ) );
    // goal dot

    var dot1 = mid1.add( g1.multiply( n12 ).rotate_90_cw() );
    var dot2 = mid1.add( g1.multiply( n12 - smallCircleRadius ).rotate_90_cw() );
    var dot3 = mid1.add( g1.multiply( n12 + smallCircleRadius ).rotate_90_cw() );

    var dot4 = mid2.add( g1.multiply( n12 ).rotate_90_ccw() );
    var dot5 = mid2.add( g1.multiply( n12 - smallCircleRadius ).rotate_90_ccw() );
    var dot6 = mid2.add( g1.multiply( n12 + smallCircleRadius ).rotate_90_ccw() );


    var l5m = c1.add( g1.multiply( n5 ).rotate_90_cw() );
    var l5m1 = c2.add( g1.multiply( n5 ).rotate_90_cw() );
    var l5m2 = new Line( l5m, l5m1 ).crosses_with_circle( mid1, n17 )[0];
    var l5m3 = new Line( l5m1, l5m ).crosses_with_circle( mid1, n17 )[0];

    var l5m4 = c3.subtract( g1.multiply( n5 ).rotate_90_cw() );
    var l5m5 = c4.subtract( g1.multiply( n5 ).rotate_90_cw() );
    var l5m6 = new Line( l5m4, l5m5 ).crosses_with_circle( mid2, n17 )[0];
    var l5m7 = new Line( l5m5, l5m4 ).crosses_with_circle( mid2, n17 )[0];

    // cirkler på banen
    var cir1 = new Line( mid1, arc_point1 ).middle;
    var cir2 = new Line( mid2, arc_point4 ).middle;
    var cir3 = new Line( cir1, cir2 ).crosses_with_circle( mid1, n17, mid5 )[0];
    var cir4 = cir3.add( g1.multiply( n5 ) );
    var cir5 = cir3.subtract( g1.multiply( n5 ) );


    var cir6 = mid1.subtract( g1.multiply( n17 ) );
    var cir7 = new Line( mid1, cir6 ).middle;
    var cir8 = mid2.subtract( g1.multiply( n17 ) );
    var cir9 = new Line( mid1, cir8 ).middle;
    var cir10 = new Line( cir7, cir9 ).crosses_with_circle( mid1, n17, mid5 )[0];

    var cir11 = cir10.add( g1.multiply( n5 ) );
    var cir12 = cir10.subtract( g1.multiply( n5 ) );

    var cir13 = mid2.subtract( g1.multiply( n17 ) );
    var cir14 = new Line( mid2, cir13 ).middle;
    var cir15 = mid1.subtract( g1.multiply( n17 ) );
    var cir16 = new Line( mid2, cir15 ).middle;
    var cir17 = new Line( cir14, cir16 ).crosses_with_circle( mid2, n17, mid5 )[0];

    var cir18 = cir17.add( g1.multiply( n5 ) );
    var cir19 = cir17.subtract( g1.multiply( n5 ) );

    var cir20 = mid2.add( g1.multiply( n17 ) );
    var cir21 = new Line( mid2, cir20 ).middle;
    var cir22 = mid1.add( g1.multiply( n17 ) );
    var cir23 = new Line( mid2, cir22 ).middle;
    var cir24 = new Line( cir21, cir23 ).crosses_with_circle( mid2, n17, mid5 )[0];

    var cir25 = cir24.add( g1.multiply( n5 ) );
    var cir26 = cir24.subtract( g1.multiply( n5 ) );

    var small_cir1 = cir3.add( g1.multiply( smallCircleRadius ) );
    var small_cir2 = cir3.subtract( g1.multiply( smallCircleRadius ) );

    var small_cir3 = cir10.add( g1.multiply( smallCircleRadius ) );
    var small_cir4 = cir10.subtract( g1.multiply( smallCircleRadius ) );
    var small_cir5 = cir17.add( g1.multiply( smallCircleRadius ) );
    var small_cir6 = cir17.subtract( g1.multiply( smallCircleRadius ) );
    var small_cir7 = cir24.add( g1.multiply( smallCircleRadius ) );
    var small_cir8 = cir24.subtract( g1.multiply( smallCircleRadius ) );


    var cor1 = c2.add( g3.multiply( 1 ) );
    var cor2 = c2.add( g2.multiply( 1 ) );
    var cor3 = c2.add( new Line( c2, new Line( cor1, cor2 ).middle ).unit_vector.multiply( 1 ) );

    var cor4 = c1.add( g1.multiply( 1 ) );
    var cor5 = c1.add( g1.multiply( 1 ).rotate_90_cw() );
    var cor6 = c1.add( new Line( c1, new Line( cor4, cor5 ).middle ).unit_vector.multiply( 1 ) );

    var cor7 = c3.add( g5.multiply( 1 ) );
    var cor8 = c3.add( g4.multiply( 1 ) );
    var cor9 = c3.add( new Line( c3, new Line( cor7, cor8 ).middle ).unit_vector.multiply( 1 ) );

    var cor10 = c4.add( g1.multiply( 1 ) );
    var cor11 = c4.add( g1.multiply( 1 ).rotate_90_ccw() );
    var cor12 = c4.add( new Line( c4, new Line( cor10, cor11 ).middle ).unit_vector.multiply( 1 ) );
    // skal være dashed
    var dash_length = 0.5;
    var dash_space = 0.5;

    this.tasks.push( new ArcTask( this.tasks.length, [ cor4, cor6, cor5 ], c1, true, false, true ) );

    if (this.options.MarkGoalPositions.val) {
      this.drawGoalPositionMarkers(c1, c2);
    }
    else {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    }

    this.tasks.push( new ArcTask( this.tasks.length, [ cor2, cor3, cor1 ], c2, true, false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );


    this.tasks.push( new ArcTask( this.tasks.length, [ cor8, cor9, cor7 ], c3, true, false, true ) );
    
    if (this.options.MarkGoalPositions.val) {
      this.drawGoalPositionMarkers(c3, c4);
    }
    else {
      this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    }

    this.tasks.push( new ArcTask( this.tasks.length, [ cor11, cor12, cor10 ], c4, true, false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );


    // stiblede
    this.tasks.push( new LineTask( this.tasks.length, [ l5m, l5m2 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ arc_point2, arc_point3, arc_point1 ], mid1, false, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ dot3, dot2 ], dot1, true, false, true ) ); // Right-side penalty spot
    this.tasks.push( new ArcTask( this.tasks.length, [ cir11, cir12 ], cir10, true, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ small_cir3, small_cir4 ], cir10, true, false, true ) ); // Right-side upper small circle
    this.tasks.push( new ArcTask( this.tasks.length, [ cir5, cir4 ], cir3, true, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ small_cir2, small_cir1 ], cir3, false, false, true ) ); // Right-side lower small circle
    // stiblede
    this.tasks.push( new LineTask( this.tasks.length, [ l5m3, l5m1 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

    if (this.options.drawKnatteBandyOne.val) {
      this.drawKnatteBandy(midC1, midC2, mid5, c1);
    }

    this.tasks.push( new LineTask( this.tasks.length, [ mid4, mid5 ], false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ midC1, midC2 ], mid5, true, false, true ) ); // Middle outer circle
    this.tasks.push( new ArcTask( this.tasks.length, [ midC3, midC4 ], mid5, true, false, true ) ); // Middle inner circle
    this.tasks.push( new LineTask( this.tasks.length, [ mid5, mid3 ], false, true ) );

    if (this.options.drawKnatteBandyTwo.val) {
      this.drawKnatteBandy(midC2, midC1, mid5, c3);
    }

    //stiblede
    this.tasks.push( new LineTask( this.tasks.length, [ l5m5, l5m7 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ arc_point5, arc_point6, arc_point4 ], mid2, true, false, true ) );

    this.tasks.push( new ArcTask( this.tasks.length, [ dot5, dot6 ], dot4, true, false, true ) ); // Left-side penalty spot
    this.tasks.push( new ArcTask( this.tasks.length, [ cir18, cir19 ], cir17, true, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ small_cir5, small_cir6 ], cir17, true, false, true ) ); // Left-side upper small circle
    this.tasks.push( new ArcTask( this.tasks.length, [ cir26, cir25 ], cir24, true, false, true ) );
    this.tasks.push( new ArcTask( this.tasks.length, [ small_cir8, small_cir7 ], cir24, false, false, true ) ); // Left-side lower small circle
    //Stiblede
    this.tasks.push( new LineTask( this.tasks.length, [ l5m6, l5m4 ], false, true ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }

  drawGoalPositionMarkers(cornerOne, cornerTwo) {
    const guideLine = new Line(cornerOne, cornerTwo);
    const verticalVector = guideLine.unit_vector;
    const horizontalVector = verticalVector.rotate_90_ccw();
    const midPoint = guideLine.middle;
    const widthGoalPlusMiddlePosts = this.options.GoalWidth.val + this.options.GoalPostWidth.val; // Same as 2 * postWidth / 2
    const firstPostPosition = midPoint.subtract(verticalVector.multiply(0.5 * widthGoalPlusMiddlePosts));
    const secondPostPosition = midPoint.add(verticalVector.multiply(0.5 * widthGoalPlusMiddlePosts));
    const firstMarkerStart = firstPostPosition.add(horizontalVector.multiply(0.2 + this.options.LineWidth.val)); // 0.2 meters out
    const firstMarkerEnd = firstMarkerStart.add(horizontalVector.multiply(0.2 - this.options.LineWidth.val)); // 0.2 meter line
    const secondMarkerStart = secondPostPosition.add(horizontalVector.multiply(0.2 + this.options.LineWidth.val)); // 0.2 meters out
    const secondMarkerEnd = secondMarkerStart.add(horizontalVector.multiply(0.2 - this.options.LineWidth.val)); // 0.2 meter line


    this.tasks.push(new LineTask(this.tasks.length, [cornerOne, firstPostPosition], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [firstMarkerStart, firstMarkerEnd], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [firstPostPosition, secondPostPosition], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [secondMarkerStart, secondMarkerEnd], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [secondPostPosition, cornerTwo], false, true));
  }

  drawKnatteBandy(circleEndOne, circleEndTwo, largeFieldCenter, largeFieldCorner) {
    const verticalVector = new Line(circleEndOne, circleEndTwo).unit_vector;
    const horizontalVector = verticalVector.rotate_90_cw();
    const halfWidth = 0.5 * this.options.Width.val - 0.5 * this.options.LineWidth.val;
    const haflLength = 0.25 * this.options.Length.val - 0.5 * this.options.centerCircleRadius.val;
    
    const centerSidelineMiddlePoint = largeFieldCenter.add(horizontalVector.multiply(this.options.centerCircleRadius.val));

    const centerSideLineStart = centerSidelineMiddlePoint.subtract(verticalVector.multiply(halfWidth));
    const centerSideLineEnd = centerSidelineMiddlePoint.add(verticalVector.multiply(halfWidth));
    this.tasks.push(new LineTask(this.tasks.length, [centerSideLineStart, centerSideLineEnd], false, true));


    const midPointUpper = centerSideLineEnd.add(horizontalVector.multiply(haflLength));
    const midPointLower = centerSideLineStart.add(horizontalVector.multiply(haflLength));

    this.drawKnatteGoal(midPointUpper, midPointLower);

    const centerPoint = new Line(midPointUpper, midPointLower).middle;
    this.drawKnatteCircle(centerPoint, midPointUpper);

    this.drawKnatteGoal(midPointLower, midPointUpper);
  }

  drawKnatteGoal(midPointClose, midPointFar) {
    const verticalVector = new Line(midPointFar, midPointClose).unit_vector;
    const horizontalVector = verticalVector.rotate_90_cw();
    const circleRadius = 12.5 - 0.5 * this.options.LineWidth.val;

    const first = midPointClose.subtract(horizontalVector.multiply(circleRadius));
    const second = midPointClose.subtract(verticalVector.multiply(circleRadius));
    const third = midPointClose.add(horizontalVector.multiply(circleRadius));
    this.tasks.push(new ArcTask(this.tasks.length, [first, second, third], midPointClose, false, false, true));

    if (this.options.MarkGoalPositions.val) {
      this.drawKnatteGoalMarkers(first, third);
    }

    const penaltySpotPoint = midPointClose.subtract(verticalVector.multiply(10 + 0.5 * this.options.LineWidth.val));
    this.drawKnatteCircle(penaltySpotPoint, third);

    const guideCircle = new Circle(midPointClose, circleRadius);
    let measuringCircle;
    measuringCircle = new Circle(first, circleRadius);
    const arcSpotOne = measuringCircle.crosses_with_circle(guideCircle)[0];
    measuringCircle = new Circle(third, circleRadius)
    const arcSpotTwo = measuringCircle.crosses_with_circle(guideCircle)[1];

    this.drawKnatteCircle(arcSpotOne, penaltySpotPoint);
    this.drawKnatteCircle(arcSpotTwo, arcSpotOne);
  }

  drawKnatteCircle(at, from) {
    const guideVector = new Line(at, from).unit_vector;
    const smallCircleRadius = this.options.spotRadius.val - 0.5 * this.options.LineWidth.val;
    const start = at.add(guideVector.multiply(smallCircleRadius));
    const end = at.subtract(guideVector.multiply(smallCircleRadius));
    this.tasks.push(new ArcTask(this.tasks.length, [start, end], at, true, false, true));
  }

  drawKnatteGoalMarkers(arcStart, arcEnd) {
    const guideLine = new Line(arcStart, arcEnd);
    const horizontalVector = guideLine.unit_vector;
    const verticalVector = horizontalVector.rotate_90_cw();
    const midPoint = guideLine.middle;
    const widthGoalPlusMiddlePosts = this.options.KnatteGoalWidth.val + this.options.KnatteGoalPostWidth.val; // Same as 2 * postWidth / 2
    const firstPostPosition = midPoint.add(horizontalVector.multiply(0.5 * widthGoalPlusMiddlePosts));
    const secondPostPosition = midPoint.subtract(horizontalVector.multiply(0.5 * widthGoalPlusMiddlePosts));
    const firstMarkerStart = firstPostPosition.subtract(verticalVector.multiply(0.2 + this.options.LineWidth.val)); // 0.2 meters out
    const firstMarkerEnd = firstMarkerStart.subtract(verticalVector.multiply(0.2 - this.options.LineWidth.val)); // 0.2 meter line
    const secondMarkerStart = secondPostPosition.subtract(verticalVector.multiply(0.2 + this.options.LineWidth.val)); // 0.2 meters out
    const secondMarkerEnd = secondMarkerStart.subtract(verticalVector.multiply(0.2 - this.options.LineWidth.val)); // 0.2 meter line

    this.tasks.push(new LineTask(this.tasks.length, [firstMarkerStart, firstMarkerEnd], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [secondMarkerStart, secondMarkerEnd], false, true));
  }
}

class KnatteBandy extends square_pitch {
  static template_type = "Bandy";
  static template_title = "Knatte";
  static template_id = "knatte_bandy_dev";
  static template_image = "img/templates/bandy.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Length.val = 65; // Max Value
    this.options.Width.val = 50; // Max Value
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;

    this.options.penaltyAreaRadius = {
      name: "Penalty area radius",
      val: 12.5,
      type: "float",
      configurable: true,
    }
    this.options.drawFreeStrokeAreas = {
      name: "Draw free stroke areas",
      val: true,
      type: "bool",
      configurable: true,
      prev_sibling: "penaltyAreaRadius"
    }
    this.options.freeStrokeAreaRadius = {
      name: "Free stroke area radius",
      val: 2.5,
      type: "float",
      _configurable: true,
      get configurable() {
        return this_class.options.drawFreeStrokeAreas.val;
      },
      set configurable(_) {
        // PASS
      },
      prev_sibling: "drawFreeStrokeAreas"
    }
    this.options.spotRadius = {
      name: "Spot radius",
      val: 0.075,
      type: "float",
      configurable: true,
      prev_sibling: "freeStrokeAreaRadius"
    }
    this.options.drawStopLines = {
      name: "Draw stop lines",
      val: true,
      type: "bool",
      configurable: true,
      prev_sibling: "spotRadius"
    }
    this.options.stopLineDistance = {
      name: "Stop line distance",
      val: 4,
      type: "float",
      _configurable: true,
      get configurable() {
        return this_class.options.drawStopLines.val;
      },
      set configurable(_) {
        // PASS
      },
      prev_sibling: "drawStopLines"
    }
    this.options.drawPlayerEntrance = {
      name: "Draw player entrance",
      val: false,
      type: "bool",
      configurable: true,
      prev_sibling: "stopLineDistance"
    }
    this.options.markGoalPositions = {
      name: "Mark goal positions",
      val: false,
      type: "bool",
      configurable: true,
      prev_sibling: "drawPlayerEntrance"
    }
    this.options.goalWidth = {
      name: "Goal width",
      val: 3.5,
      type: "float",
      _configurable: false,
      get configurable() {
        return this_class.options.markGoalPositions.val;
      },
      set configurable(_) {
        // PASS
      },
      prev_sibling: "markGoalPositions"
    }
    this.options.postWidth = {
      name: "Goal post width",
      val: 0.075,
      type: "float",
      _configurable: false,
      get configurable() {
        return this_class.options.markGoalPositions.val;
      },
      set configurable(_) {
        // PASS
      },
      prev_sibling: "goalWidth"
    }

    this.options.penaltySpotDistanceRatio = {
      name: "Penalty spot distance",
      val: 10/12.5, // Official measurements, IE: "penalty spot distance from rear line" / "goal box radius"
      type: "float",
      configurable: false,
      adjustable: false
    }
    this.options.playerEntraceRatio = {
      name: "Player entrance width",
      val: 16/110, // Official measurements (from grown-up Bandy), IE: "entrance witdh" / "pitch length"
      type: "float",
      configurable: false
    }

    this.services = new BandyServices(this);
    const this_class = this;
  }
  static get layout_methods() {
    return {
      "two_corners": 2,
      "free_hand": 0
    };
  }
  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    const p = this.drawing_points;
    const c1 = p[0];
    const c2 = p[3];
    const c3 = p[4];
    const c4 = p[7];

    const drawStopLines = this.options.drawStopLines.val;
    const markGoalPositions = this.options.markGoalPositions.val;
    const goalWidth = this.options.goalWidth.val;
    const postWidth = this.options.postWidth.val;
    const circleRadii = [this.options.penaltyAreaRadius.val, this.options.freeStrokeAreaRadius.val, this.options.spotRadius.val];
    const drawFreeStrokeAreas = this.options.drawFreeStrokeAreas.val;
    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    
    // LEFT FIELD END
    this.services.addCorner(c1, c2, drawStopLines);
    this.services.addRearLine(c1, c2, markGoalPositions, goalWidth, postWidth);
    this.services.addCorner(c2, c1, drawStopLines, false);
    this.services.addGoal(c2, c1, circleRadii, drawFreeStrokeAreas);
    

    // UPPER MIDFIELD
    this.services.addMidField(c1, c4, circleRadii);

    // RIGHT FIELD END
    this.services.addCorner(c3, c4, drawStopLines);
    this.services.addRearLine(c3, c4, markGoalPositions, goalWidth, postWidth);
    this.services.addCorner(c4, c3, drawStopLines, false);
    this.services.addGoal(c4, c3, circleRadii, drawFreeStrokeAreas);

    // LOWER MIDFIELD
    this.services.addMidField(c3, c2, circleRadii, true, this.options.drawPlayerEntrance.val);

    // GET TASKS FROM SERVICES
    this.services.pushTasksToParent();

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
}
class BandyServices {
  /**
   * This class is implemented in preparation for using the below code for all types of bandy pitches. //
   * Copy the KnatteBandy class and rename it to Bandy. //
   * Change the template type and name accordingly. //
   * Add the "drawKnatteBandy" (there are two), the "knatteGoalWidth" and "knattePostWidth" options to the new class. //
   * Change the relevant values for radii etc. in the new class.
   * 
   * This class contains standard methods for drawing various parts of a bandy pitch.
   * 
   * @param {square_pitch} parentClass : Is the bandy field using these services
   */
  // 
  constructor(parentClass) {
    this.parentClass = parentClass;
    this.tasks = [];
  }

  // drawPoints(points) {
  //   // Service method for development purposes, outcomment on push to git
  //   points.forEach((point)=>{
  //     this.parentClass.tasks.push(new WaypointTask(this.parentClass.tasks.length, point, false, true));
  //   });
  // }

  pushTasksToParent() {
    this.tasks.forEach((task)=>{
      task.id = this.parentClass.tasks.length;
      this.parentClass.tasks.push(task);
    });
    this.tasks = [];
  }

  calculateGuideAndVectors(cornerOne, cornerTwo) {
    const guideLine = new Line(cornerOne, cornerTwo);
    const midpoint = guideLine.middle;
    const lineVector = guideLine.unit_vector;
    const perpendicularVector = lineVector.rotate_90_cw();
    return [guideLine, midpoint, lineVector, perpendicularVector];
  }

  getCircleTask(correctedRadius, at, from) {
    const guideVector = new Line(at, from).unit_vector;
    const start = at.add(guideVector.multiply(correctedRadius));
    const end = at.subtract(guideVector.multiply(correctedRadius));
    return new ArcTask(null, [start, end], at, true, false, true);
  }

  addCorner(cornerOne, cornerTwo, addStopLine, clockwise=true) {
    const gav = this.calculateGuideAndVectors(cornerOne, cornerTwo); // Line, middle, line vector, perpendicular vector
    const lineWidth = this.parentClass.options.LineWidth.val;
    const correctedCornerRadius = 1 - lineWidth; // Corner is measured from outer edge, standard is 1 meter.

    if (addStopLine) {
      this.addStopLine(cornerOne, cornerTwo, !clockwise);
    }

    const first = cornerOne.add(gav[2].multiply(correctedCornerRadius));
    const third = cornerOne.add(gav[3].multiply(correctedCornerRadius));
    const guidePoint = new Line(first, third).middle;
    
    const guideVector = new Line(cornerOne, guidePoint).unit_vector;
    const second = cornerOne.add(guideVector.multiply(correctedCornerRadius));

    this.tasks.push(new ArcTask(null, [first, second, third], cornerOne, clockwise, false, true));
  }

  addStopLine(cornerOne, cornerTwo, moveOntoField) {
    const gav = this.calculateGuideAndVectors(cornerOne, cornerTwo); // Line, middle, line vector, perpendicular vector
    const correctedCircleRadius = this.parentClass.options.penaltyAreaRadius.val + 0.5 * this.parentClass.options.LineWidth.val;
    const correctedDistance = this.parentClass.options.stopLineDistance.val + this.parentClass.options.LineWidth.val;
    
    let guideLine;
    let stopLineStart;
    let task;

    if (moveOntoField) {
      const vector = gav[3].rotate_180();
      guideLine = gav[0].move(vector, correctedDistance);
      stopLineStart = guideLine.crosses_with_circle(gav[1], correctedCircleRadius)[0];
    }
    else {
      guideLine = gav[0].move(gav[3], correctedDistance);
      stopLineStart = guideLine.crosses_with_circle(gav[1], correctedCircleRadius)[0];
    }
    task = new LineTask(null, [stopLineStart, guideLine.start], false, true);
    task.task_options.push(new FloatRobotAction("dashed_length", 0.5));
    task.task_options.push(new FloatRobotAction("dashed_space", 0.5));
    this.tasks.push(task);
  }

  addRearLine(cornerOne, cornerTwo, addGoalMarkers, goalWidth=0, postWidth=0) {
    if (addGoalMarkers && goalWidth && postWidth) {
      const gav = this.calculateGuideAndVectors(cornerOne, cornerTwo); // Line, middle, line vector, perpendicular vector
      const correctedHalfGoalWidth = 0.5 * goalWidth + postWidth; // Same as 2 * postWidth / 2
      const correctedMarkerLength = 0.2 - 0.5 * this.parentClass.options.LineWidth.val; // 20 centimeters
      const firstPostPosition = gav[1].subtract(gav[2].multiply(correctedHalfGoalWidth));
      const secondPostPosition = gav[1].add(gav[2].multiply(correctedHalfGoalWidth));
      const firstMarkerStart = firstPostPosition.subtract(gav[3].multiply(correctedMarkerLength));
      const firstMarkerEnd = firstMarkerStart.subtract(gav[3].multiply(correctedMarkerLength));
      const secondMarkerStart = secondPostPosition.subtract(gav[3].multiply(correctedMarkerLength));
      const secondMarkerEnd = secondMarkerStart.subtract(gav[3].multiply(correctedMarkerLength));

      this.tasks.push(new LineTask(null, [cornerOne, firstPostPosition], false, true));
      this.tasks.push(new LineTask(null, [firstMarkerStart, firstMarkerEnd], false, true));
      this.tasks.push(new LineTask(null, [firstPostPosition, secondPostPosition], false, true));
      this.tasks.push(new LineTask(null, [secondMarkerStart, secondMarkerEnd], false, true));
      this.tasks.push(new LineTask(null, [secondPostPosition, cornerTwo], false, true));
    }
    else {
      this.tasks.push(new LineTask(null, [cornerOne, cornerTwo], false, true));
    }
  }

  addGoal(cornerOne, cornerTwo, circleRadii, addFreeStrokeAreas) {
    const gav = this.calculateGuideAndVectors(cornerOne, cornerTwo); // Line, middle, line vector, perpendicular vector
    const width = gav[0].length;
    const goalMiddle = gav[1];
    const verticalVector = gav[2];
    const horizontalVector = gav[3];
    const halfLineWidth = 0.5 * this.parentClass.options.LineWidth.val;
    const correctedPenaltyRadius = this.parentClass.options.penaltyAreaRadius.val - halfLineWidth;
    const correctedLargeRadius = circleRadii[1] + halfLineWidth;
    const correctedSmallRadius = circleRadii[2] - halfLineWidth;
    const guideCircle = new Circle(goalMiddle, correctedPenaltyRadius);

    // Penalty area
    const first = goalMiddle.add(verticalVector.multiply(correctedPenaltyRadius));
    const second = goalMiddle.subtract(horizontalVector.multiply(correctedPenaltyRadius));
    const third = goalMiddle.subtract(verticalVector.multiply(correctedPenaltyRadius));
    
    this.tasks.push(new ArcTask(null, [first, second, third], goalMiddle, false, false, true));

    // Helper variables
    let distance;
    let measuringCircle;
    let arcSpotPoint;
    let nextFromPoint;

    // Penalty spot
    distance = this.parentClass.options.penaltyAreaRadius.val * this.parentClass.options.penaltySpotDistanceRatio.val - this.parentClass.options.LineWidth.val;
    const penaltySpotPoint = goalMiddle.subtract(horizontalVector.multiply(distance));
    this.tasks.push(this.getCircleTask(correctedSmallRadius, penaltySpotPoint, third));
    nextFromPoint = this.tasks.last().ends[1];

    // Back line is drawn first, so make goal from bottom up
    // Close spot
    measuringCircle = new Circle(third, correctedPenaltyRadius);
    arcSpotPoint = measuringCircle.crosses_with_circle(guideCircle)[1];
    this.tasks.push(this.getCircleTask(correctedSmallRadius, arcSpotPoint, nextFromPoint));
    nextFromPoint = this.tasks.last().ends[1];

    // Close free stroke area
    if (addFreeStrokeAreas) {
      this.tasks.push(this.getCircleTask(correctedLargeRadius, arcSpotPoint, nextFromPoint));
    }

    // Far spot
    measuringCircle = new Circle(first, correctedPenaltyRadius);
    arcSpotPoint = measuringCircle.crosses_with_circle(guideCircle)[0];
    this.tasks.push(this.getCircleTask(correctedSmallRadius, arcSpotPoint, nextFromPoint));
    nextFromPoint = this.tasks.last().ends[1];

    // Far free stroke area
    if (addFreeStrokeAreas) {
      this.tasks.push(this.getCircleTask(correctedLargeRadius, arcSpotPoint, nextFromPoint));
      nextFromPoint = this.tasks.last().ends[1];
    }
  }

  addMidField(cornerOne, cornerTwo, circleRadii, addCenter=false, addPlayerEntrance=false, addKnatteClose=false, addKnatteFar=false) {
    const gav = this.calculateGuideAndVectors(cornerOne, cornerTwo); // Line, middle, line vector, perpendicular vector
    const guideLine = gav[0];
    const midPoint = gav[1];
    const horizontalVector = gav[2];
    const verticalVector = gav[3].rotate_180();
    const correctedHalfWidth = 0.5 * this.parentClass.options.Width.val - 0.5 * this.parentClass.options.LineWidth.val;
    const center = midPoint.add(verticalVector.multiply(correctedHalfWidth));
    const halfLineWidth = 0.5 * this.parentClass.options.LineWidth.val;
    const correctedLargeRadius = circleRadii[1] + halfLineWidth;
    const correctedSmallRadius = circleRadii[2] - halfLineWidth;
    
    if (this.parentClass.options.drawKnatteBandyOne || this.parentClass.options.drawKnatteBandyTwo) {
      if (addKnatteClose) {
        let c1 = midPoint.subtract(horizontalVector.multiply(correctedLargeRadius));
        let c2 = cornerOne;
        this.addKnatte(midPoint, c1, c2, circleRadii, verticalVector, correctedHalfWidth, addCenter, false);
      }
      else {
        this.tasks.push(new LineTask(null, [cornerOne, midPoint], false, true));
        if (addCenter) {
          let nextFrom = center.subtract(verticalVector.multiply(correctedHalfWidth));
          this.tasks.push(this.getCircleTask(correctedSmallRadius, center, nextFrom));
          nextFrom = this.tasks.last().ends[1];
          this.tasks.push(this.getCircleTask(correctedLargeRadius, center, nextFrom));
        }
        this.tasks.push(new LineTask(null, [center, midPoint], false, true));
      }

      if (addPlayerEntrance) {
        this.addPlayerEntrance(cornerOne, cornerTwo);
      }

      if (addKnatteFar) {
        let c1 = cornerTwo;
        let c2 = midPoint.add(horizontalVector.multiply(correctedLargeRadius));
        this.addKnatte(midPoint, c1, c2, circleRadii, verticalVector, correctedHalfWidth, false, true);
      }
      else {
        this.tasks.push(new LineTask(null, [midPoint, cornerTwo], false, true));
      }
    }
    else {
      this.tasks.push(new LineTask(null, [cornerOne, midPoint], false, true));
      if (addCenter) {
        let nextFrom = center.subtract(verticalVector.multiply(correctedHalfWidth));
        this.tasks.push(this.getCircleTask(correctedSmallRadius, center, nextFrom));
        nextFrom = this.tasks.last().ends[1];
        this.tasks.push(this.getCircleTask(correctedLargeRadius, center, nextFrom));
      }
      this.tasks.push(new LineTask(null, [center, midPoint], false, true));
      if (addPlayerEntrance) {
        this.addPlayerEntrance(cornerOne, cornerTwo);
      }
      this.tasks.push(new LineTask(null, [midPoint, cornerTwo], false, true));
    }
  }

  addKnatte(largeFieldMidPoint, c1, c2, circleRadii, verticalVector, largeFieldHalfWidth, addLargeCenter, isFarKnatte) {
    const knatteGoalWidth = this.parentClass.options.knatteGoalWidth.val;
    const knattePostWidth = this.parentClass.options.knattePostWidth.val;
    const smallFieldCenter = new Line(c1, c2).middle.add(verticalVector.multiply(largeFieldHalfWidth));
    const largeFieldCenter = largeFieldMidPoint.add(verticalVector.multiply(largeFieldHalfWidth));
    const halfLineWidth = 0.5 * this.parentClass.options.LineWidth.val;
    const smallCircleRadius = circleRadii[2] + halfLineWidth;
    const largeCircleRadius = circleRadii[1] - halfLineWidth;

    this.tasks.push(new LineTask(null, [largeFieldMidPoint, c1], false, true));

    this.addRearLine(c1, c2, this.parentClass.options.markGoalPositions.val, knatteGoalWidth, knattePostWidth);
  
    this.addGoal(c2, c1, circleRadii, false);

    let sideLineEnd;
    if (isFarKnatte) {
      sideLineEnd = c2.add(verticalVector.multiply(largeFieldHalfWidth));
      this.tasks.push(new LineTask(null, [c2, sideLineEnd], false, true));
    }
    else {
      sideLineEnd = c1.add(verticalVector.multiply(largeFieldHalfWidth));
      this.tasks.push(new LineTask(null, [c1, sideLineEnd], false, true));
      this.tasks.push(this.getCircleTask(smallCircleRadius, smallFieldCenter, sideLineEnd));
    }

    if (addLargeCenter) {
      let nextFrom = largeFieldCenter.subtract(verticalVector.multiply(largeFieldHalfWidth));
      this.tasks.push(this.getCircleTask(smallCircleRadius, largeFieldCenter, nextFrom));
      nextFrom = this.tasks.last().ends[1];
      this.tasks.push(this.getCircleTask(largeCircleRadius, largeFieldCenter, nextFrom));
    }
    this.tasks.push(new LineTask(null, [largeFieldCenter, largeFieldMidPoint], false, true));
  }

  addPlayerEntrance(cornerOne, cornerTwo) {
    const guideLine = new Line(cornerTwo, cornerOne);
    const horizontalVector = guideLine.unit_vector;
    const verticalVector = horizontalVector.rotate_90_cw();
    const midPoint = guideLine.middle;
    const entranceWidth = this.parentClass.options.playerEntraceRatio.val * this.parentClass.options.Length.val;

    const upperLeft = midPoint.subtract(horizontalVector.multiply(0.5 * entranceWidth - 0.5 * this.parentClass.options.LineWidth.val));
    const firstLeft = upperLeft.subtract(verticalVector.multiply(0.9 * this.parentClass.options.LineWidth.val)); // Slight overlap
    const secondLeft = firstLeft.subtract(verticalVector.multiply(0.9 * this.parentClass.options.LineWidth.val)); // Slight overlap
    const upperRight = midPoint.add(horizontalVector.multiply(0.5 * entranceWidth - 0.5 * this.parentClass.options.LineWidth.val));
    const firstRight = upperRight.subtract(verticalVector.multiply(0.9 * this.parentClass.options.LineWidth.val)) // Slight overlap
    const secondRight = firstRight.subtract(verticalVector.multiply(0.9 * this.parentClass.options.LineWidth.val)) // Slight overlap

    this.tasks.push(new LineTask(this.parentClass.tasks.length, [firstLeft, firstRight], false, true));
    this.tasks.push(new LineTask(this.parentClass.tasks.length, [secondRight, secondLeft], false, true));
  }

}
