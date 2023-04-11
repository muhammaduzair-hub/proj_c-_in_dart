
class AmericanFootballTraining extends square_pitch 
{
    static template_type = "Football";// Translateable
    static template_title = "Training field";
    static template_id = "american_football_training_beta";
    static template_image = "img/templates/american_football_training_black.png";
    static white_template_image = "img/templates/american_football_training_white.png";
    
    constructor( id, name, layout_method )
    {
      super( id, name, layout_method );
      
      var this_class = this;
      this.options["Right goal pole"].configurable = false;
      this.options["Left goal pole"].configurable = false;
      this.options.NegativeLineWidth.val = true;
      this.options.Length.val = (100).foot2meter();
      this.options.Width.val = (160).foot2meter();
  
      this.options.HashMarks = {
        configurable: true,
        name: "Hash Markers",
        val: true,
        type: "bool"
      };
      this.options.MiddleHashMarks = {
        get configurable() {
          return this_class.options.HashMarks.val;
        },
        name: "Middle hash marks",
        val: true,
        type: "bool"
      };
      this.options.SideHashMarks = {
        get configurable() {
          return this_class.options.HashMarks.val;
        },
        name: "Side hash marks",
        val: true,
        type: "bool"
      };
      this.options.HorizontalHashmarks = {
        get configurable() {
          return this_class.options.HashMarks.val;
        },
        name: "Horizontal hash marks",
        val: true,
        type: "bool",
        prev_sibling: "SideHashMarks"
        
      };
      this.options.HashMarksToSideline = {
        get configurable() {
          return this_class.options.HashMarks.val;
        },
        name: "Hash marks to the side line",
        _val: (2).foot2meter(),
        get val() {
          return this._val;
        },
        set val(v){
          if(v > (this_class.options.Width.val / 4) || v < 0 ) {
            this._val = this._val;
          }
          else {
            this._val = v;
          }
        },
        type: "float",
        prev_sibling: "HorizontalHashmarks"
      };
  
      this.options.LinesDistance = {
        name: "Yard lines distances",
        configurable: false,
        val: (5).yard2meter(),
        type: "float",      
      };
      this.options.HashMarksDistance = {
        configurable: false,
        name: "Distances between hash marks",
        val: (1).yard2meter(),
        type: "float",
        prev_sibling: "HashMarksToSideline"
        
      };
      this.options.HashMarkLength = {
        get configurable() {
          return this_class.options.HashMarks.val;
        },
        name: "Hash marks length",
        val: (2).foot2meter(),
        type: "float",
        prev_sibling: "HashMarksDistance",
      };
      this.options.SidelineToMiddleHashs = {
        name: "Sideline to closest middle hash marks",
        configurable: false,
        val: (60).foot2meter(),
        type: "float",
      };
      this.options.EndZoneLeft = {
        name: "End zone (L)",
        configurable: true,
        val: true,
        type: "bool",
        prev_sibling: "HashMarkLength",
      }
      this.options.EndZoneLength = {
        name: "Endzone length",
        configurable: false,
        val: (30).foot2meter(),
        type: "float",
      };
      this.options.WideLine = {
        name: "Wide lines",
        configurable: true,
        val: false,
        type: "bool",
        prev_sibling: "EndZoneLeft",
      };
      this.options.DriveAroundGoal = {
        name: "Drive around goals",
        get configurable() {
          return this_class.options.EndZoneLeft.val;
        },
        val: true,
        type: "bool",
        prev_sibling: "WideLine"
      };
      this.options.goalPoleWidth = {
        configurable: false,
        name: "Goal width",
        val: (6).inch2meter(),
        type: "float",
      };
      this.options.FromCornerToGoal = {
        configurable: false,
        name: "Distances from corner to goal",
        val: ((this_class.options.Width.val / 2) -((18).foot2meter() + (6).inch2meter())),
        type: "bool",
      };
    }
  
    draw()
    {
      delete this.calculated_drawing_points;
      this.tasks = [ ];
      this.start_locations = [ ];
      let p = this.drawing_points;
      let c1 = p[0];
      let c2 = p[3];
      let c3 = p[4];
      let c4 = p[7];
  
      let middle_line = new Line( c1, c4 );
      let verticalMiddle = new Line( c4, c3 ).middle;
      let notPainted = this.options.Length.val;
      let g1 = middle_line.unit_vector; 
      let g2 = g1.rotate_90_cw(); 
      let start = c3;
      let end = c4;
      let robotPosition = "top";

      let ballStartTop = verticalMiddle.subtract(g1.multiply(9).foot2meter()).add(g2.multiply((1).foot2meter() / 2));
      let ballStartBottom = verticalMiddle.subtract(g1.multiply(9).foot2meter()).subtract(g2.multiply((1).foot2meter() / 2));
  
      this.start_locations.push( new StartLocation (c2, this.tasks.length));
      this.tasks.push( new LineTask( this.tasks.length, [c2, c3], false, true));
      this.tasks.push( new LineTask( this.tasks.length, [ballStartBottom, ballStartTop], false, true));
  
      this.horizontalHashMarks(c4, c3, c1, g1, g2, "bottom");
  
      this.start_locations.push( new StartLocation (c1, this.tasks.length));
      this.tasks.push( new LineTask( this.tasks.length, [c1, c4], false, true));
      this.start_locations.push( new StartLocation (c4, this.tasks.length));
      this.tasks.push( new LineTask( this.tasks.length, [c4, c3], false, true));
  
      for(notPainted; notPainted > this.options.LinesDistance.val; notPainted -=this.options.LinesDistance.val ) {
        if(this.options.HashMarks.val) {
          this.paintHashMarks(start, end, robotPosition, g1, g2 );
        }
  
        start = start.subtract(g1.multiply(this.options.LinesDistance.val));
        end = end.subtract(g1.multiply(this.options.LinesDistance.val));
        this.paintYardLines(start, end, g1, robotPosition);
        robotPosition = this.toggleDirection(robotPosition);
      }

      this.horizontalHashMarks(c4, c3, c1, g1, g2, "top");
      if(this.options.WideLine.val ) {
        this.WideLines(c1, c2, c3, c4, g1, g2);
      }
  
      if(this.options.EndZoneLeft.val) {
        this.endZone(c3, c4, g1, g2);
      }
  
      this.refresh_test_run( );
      this.refresh_bb();
      this.refresh_handles();
      this.refresh_snapping_lines();
    }
  
    paintYardLines(start, end, g1, robotPosition ) {
      if(robotPosition === "top") {
        this.tasks.push( new LineTask( this.tasks.length, [start, end], false, true));
      }
      else {
        this.tasks.push( new LineTask( this.tasks.length, [end, start], false, true));
      }
    }
  
    paintHashMarks(start, end, rPosition, g1, g2) {
  
      let newStart = start;
      let newEnd = end;
      let robotPosition = rPosition; 
      let topHashStart;
      let topHashEnd;
      let bottomHashStart;
      let bottomHashEnd;    
      
      for(let i = 0; i <= 3; i++) {       
        newStart = newStart.subtract(g1.multiply(this.options.HashMarksDistance.val));  // Moving the lines horizontal for one yard
        newEnd = newEnd.subtract(g1.multiply(this.options.HashMarksDistance.val));
        
        if(robotPosition === "top") {
          topHashStart = newStart.add( g2.multiply( this.options.HashMarksToSideline.val ));
          topHashEnd = topHashStart.add( g2.multiply( this.options.HashMarkLength.val ));
          bottomHashStart = newEnd.subtract( g2.multiply( this.options.HashMarksToSideline.val + this.options.HashMarkLength.val));
          bottomHashEnd = bottomHashStart.add( g2.multiply( this.options.HashMarkLength.val ));
        }
        else {
          topHashStart = newEnd.subtract( g2.multiply( this.options.HashMarksToSideline.val ));
          topHashEnd = topHashStart.subtract( g2.multiply( this.options.HashMarkLength.val ));
          bottomHashStart = newStart.add( g2.multiply( this.options.HashMarksToSideline.val + this.options.HashMarkLength.val ));
          bottomHashEnd = bottomHashStart.subtract( g2.multiply( this.options.HashMarkLength.val ));
        }
  
        if(this.options.SideHashMarks.val) {
          this.tasks.push( new LineTask( this.tasks.length, [topHashStart, topHashEnd], false, true));
          this.middleHashMarks( newStart, newEnd, g1, g2, robotPosition);
          this.tasks.push( new LineTask( this.tasks.length, [bottomHashStart, bottomHashEnd], false, true));
        }
        else {
          this.middleHashMarks( newStart, newEnd, g1, g2, robotPosition);
        }
        robotPosition = this.toggleDirection(robotPosition);
      }
    }
  
    middleHashMarks(start, end, g1, g2, robotPosition) {
      if(!this.options.MiddleHashMarks.val) {
        return;
      }
        
      let upperHashStart;
      let upperHashEnd;
      let lowerHashStart;
      let lowerHashEnd;
  
      if(robotPosition === "top") {
        upperHashStart = start.add( g2.multiply( this.options.SidelineToMiddleHashs.val - this.options.HashMarkLength.val));
        upperHashEnd = start.add( g2.multiply( this.options.SidelineToMiddleHashs.val));
        lowerHashStart = end.subtract( g2.multiply( this.options.SidelineToMiddleHashs.val));
        lowerHashEnd = end.subtract( g2.multiply( this.options.SidelineToMiddleHashs.val - this.options.HashMarkLength.val));
      }
      else {
        upperHashStart = end.subtract( g2.multiply( this.options.SidelineToMiddleHashs.val - this.options.HashMarkLength.val));
        upperHashEnd = end.subtract( g2.multiply( this.options.SidelineToMiddleHashs.val));
        lowerHashStart = start.add( g2.multiply( this.options.SidelineToMiddleHashs.val));
        lowerHashEnd = start.add( g2.multiply( this.options.SidelineToMiddleHashs.val - this.options.HashMarkLength.val));
  
      }
      this.tasks.push( new LineTask( this.tasks.length, [upperHashStart, upperHashEnd], false, true));
      this.tasks.push( new LineTask( this.tasks.length, [lowerHashStart, lowerHashEnd], false, true));      
    }
  
    horizontalHashMarks(c4, c3, c1, g1, g2, robotPosition) {
      if(!this.options.HorizontalHashmarks.val || !this.options.HashMarks.val) {
        return;
      }
      
      let startHash;
      let endhash;
      let fieldLength = new Line(c4, c1).length;
      let linesDistance = this.options.LinesDistance.val;
      let notPainted = fieldLength - linesDistance;
  
      if(robotPosition === "top") {
        startHash = c4.subtract( g2.multiply( this.options.SidelineToMiddleHashs.val)).add( g1.multiply(this.options.HashMarkLength.val / 2));
      }
      else {
        startHash = c3.add( g2.multiply( this.options.SidelineToMiddleHashs.val)).add( g1.multiply(this.options.HashMarkLength.val / 2));
      }
  
      for(notPainted; notPainted > linesDistance; notPainted -=linesDistance) {
        startHash = startHash.subtract( g1.multiply( linesDistance));
        endhash = startHash.subtract( g1.multiply( this.options.HashMarkLength.val));
        this.tasks.push( new LineTask( this.tasks.length, [startHash, endhash], false, true));
      }
    }
  
    endZone(c3, c4, g1, g2) {
      let topLeftCorner = c4.add( g1.multiply( this.options.EndZoneLength.val));
      let bottomLeftCorner = c3.add( g1.multiply( this.options.EndZoneLength.val));
      
      // If the user want drive around goal
      let fieldHalfSize = new Line(topLeftCorner, bottomLeftCorner).length / 2;
      let fieldHalfWidth = new Line(topLeftCorner, bottomLeftCorner).middle;
      let goalTopSide = fieldHalfWidth.add( g2.multiply((( (18).foot2meter() + (6).inch2meter()) / 2 ) - this.options.goalPoleWidth.val / 2));
      let goalBottomSide = fieldHalfWidth.subtract( g2.multiply((( (18).foot2meter() + (6).inch2meter()) / 2 ) - this.options.goalPoleWidth.val / 2));
  
      this.tasks.push( new LineTask( this.tasks.length, [c4, topLeftCorner], false, true));
      if(!this.options.DriveAroundGoal.val) {
        this.tasks.push( new LineTask( this.tasks.length, [topLeftCorner, bottomLeftCorner], false, true));
      }
      else {
        this.tasks.pushAll( drive_around_goal_posts(this, topLeftCorner, goalTopSide, goalBottomSide, bottomLeftCorner, 2, this.tasks.length, this.options.goalPoleWidth.val, false));
      }
      this.tasks.push( new LineTask( this.tasks.length, [bottomLeftCorner, c3], false, true));
    }
  
    WideLines(c1, c2, c3, c4, g1, g2) {  
      let innerBottom = c3.add( g1.multiply( this.options.LineWidth.val / 2 ));
      let innerTop = c4.add( g1.multiply( this.options.LineWidth.val / 2 ));
      let outerC1 = c1.subtract( g2.multiply( this.options.LineWidth.val / 2 ));
      let outerC2 = c2.add( g2.multiply( this.options.LineWidth.val / 2 ));
      let outerC3 = c3.add( g2.multiply( this.options.LineWidth.val / 2));
      let outerC4 = c4.subtract( g2.multiply( this.options.LineWidth.val / 2 ));
  
      let outerEndzoneTop = c4.subtract( g2.multiply( this.options.LineWidth.val / 2 )).add(g1.multiply(this.options.EndZoneLength.val - this.options.LineWidth.val / 2));
      let outerEndzoneBottom = c3.add( g2.multiply( this.options.LineWidth.val / 2)).add(g1.multiply(this.options.EndZoneLength.val - this.options.LineWidth.val / 2));
      
      this.tasks.push( new LineTask( this.tasks.length, [innerBottom, innerTop], false, true));
      if(!this.options.EndZoneLeft.val) {
        this.tasks.push( new LineTask( this.tasks.length, [outerC4, outerC1], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [outerC2, outerC3], false, true));
      }
      else {
        this.tasks.push( new LineTask( this.tasks.length, [outerC1, outerEndzoneTop], false, true));
    
        if(this.options.DriveAroundGoal.val){
          let fieldHalfWidth = new Line(outerEndzoneTop, outerEndzoneBottom).middle;
          let goalTopSide = fieldHalfWidth.add( g2.multiply((( (18).foot2meter() + (6).inch2meter()) / 2 ) - this.options.goalPoleWidth.val / 2));
          let goalBottomSide = fieldHalfWidth.subtract( g2.multiply((( (18).foot2meter() + (6).inch2meter()) / 2 ) - this.options.goalPoleWidth.val / 2));
          this.tasks.pushAll( drive_around_goal_posts(this, outerEndzoneTop, goalTopSide, goalBottomSide, outerEndzoneBottom, 2, this.tasks.length, this.options.goalPoleWidth.val, false));
        }
        else {
          this.tasks.push( new LineTask( this.tasks.length, [outerEndzoneTop, outerEndzoneBottom], false, true));
        }
        this.tasks.push( new LineTask( this.tasks.length, [outerEndzoneBottom, outerC2], false, true));
      } 
    }
  
    toggleDirection(direction) {
      return direction == "top" ? "bottom" : "top";
    }  
  }
  