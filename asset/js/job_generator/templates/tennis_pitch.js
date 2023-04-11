/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



class tennis_pitch extends square_pitch
{
  static template_type = "Tennis";
  static template_title = "Standard";
  static template_id = "dk_tennis";
  static template_image = "img/templates/tennis.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    let this_class = this;
    
    this.options.Length.val = 23.77;
    this.options.Width.val = 10.97;
    this.options.ForceStdMeasurements.val = true;
    //this.options.disableLengthHandles.val = false;

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.reverseInGoal = {
      configurable: true,
      name: "Net",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        if (v && this_class.options["Middle Line"].val) {
          this_class.options["Middle Line"].val = false;
        }
        this._val = v;
      }
    };
    this.options["Double pitch"] = {
      configurable: true,
      name: "Double pitch",
      val: true,
      type: "bool",
    };
    this.options["Middle Line"] = {
      configurable: true,
      name: "Middle line",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        if (v && this_class.options.reverseInGoal.val) {
          this_class.options.reverseInGoal.val = false;
        }
        this._val = v;
      }
    };
    this.options.ServiceAreaLength = {
      configurable: false,
      val: 5.485,
      type: "float",
    };
    this.options.TramLineWidth = {
      configurable: false,
      val: 1.37,
      type: "float",
    };
    this.options.TramLineLength = {
      configurable: false,
      val: this.options.Length.val,
      type: "float",
    };
    this.options["Center Service Line"] = {
      configurable: false,
      name: "Center service line",
      val: 12.8,
      type: "float",
    };
    this.options.CentreServiceLine = {
      configurable: true,
      name: "Center service line",
      val: true,
      type: "bool",
    };
    this.options.BaseLine = {
      configurable: false,
      val: 8.23,
      type: "float",
    };
    this.options.ServiceLine = {
      configurable: false,
      val: this.options.BaseLine.val,
      type: "float",
    };
    this.options["Centre Mark"] = {
      configurable: false,
      val: 0.1 + this.options.LineWidth.val / 2,
      type: "float",
    };
    this.options.PoleWidth = {
      configurable: false,
      val: 0.24,
      type: "float",
    };
  };

  get center() {
    return this.points[0];
  }

  static get layout_methods() {
    if (robot_controller.robot_has_capability("bezier_task")) {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_middle_goal_posts": 2,
        "two_corners,side": 3,
        "all_corners": 4,
        "free_hand": 0
      };
    }
    else {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "all_corners": 4,
        "free_hand": 0
      };
    }
  }

  drawEscalate(c1, c2, c3, c4, angle)
  {
    const horizontal = angle.rotate_90_cw();
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
  

    if(this.options.reverseInGoal.val)
    {
      this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true)); // From corner 1 to corner 2

      this.drawLineWithAroundGoal(c2, c3, angle);
      
      this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true)); // From corner 3 to corner 4

      angle = horizontal.rotate_90_cw();
      this.drawLineWithAroundGoal(c4, c1, angle);

    }

    else {
      this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true)); 
      this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true)); 
      this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true)); 
      this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));
    }
  }

  drawLineWithAroundGoal(lineStart, lineEnd, angle)
  {
    let safety_compensing = 0.3;

    let horizontal = angle.rotate_90_cw();
    let lineLength = new Line(lineStart, lineEnd).length;

    let lineStart2Goal = lineStart.add(horizontal.multiply(0.5 * lineLength - (this.options.PoleWidth.val / 2) + safety_compensing));
    let lineStartFromGoal = lineStart.add(horizontal.multiply(0.5 * lineLength + (this.options.PoleWidth.val / 2) - safety_compensing));

    let turn_around_goal_bottom = drive_around_goal_posts(this, lineStart, lineStart2Goal, lineStartFromGoal, lineEnd, 2, this.tasks.length, this.options.PoleWidth.val, true, 1.5);
    this.tasks.pushAll(turn_around_goal_bottom);
  }
  drawLineWithAroundGoalLeft(lineStart, lineEnd, angle)
  {
    let safety_compensing = 0.3;

    let horizontal = angle.rotate_90_cw();
    let lineLength = new Line(lineStart, lineEnd).length;

    let lineStart2Goal = lineStart.add(horizontal.multiply(0.5 * lineLength - (this.options.PoleWidth.val / 2) + safety_compensing));
    let lineStartFromGoal = lineStart.add(horizontal.multiply(0.5 * lineLength + (this.options.PoleWidth.val / 2) - safety_compensing));

    let turn_around_goal_bottom = drive_around_goal_posts(this, lineStart, lineStart2Goal, lineStartFromGoal, lineEnd, 2, this.tasks.length, this.options.PoleWidth.val, false, 3.5);
    this.tasks.pushAll(turn_around_goal_bottom);
  }
  drawLineWithAroundGoal_L_Small(lineStart, lineEnd, angle)
  {
    let safety_compensing = 0.3;

    let horizontal = angle.rotate_90_cw();
    let lineLength = new Line(lineStart, lineEnd).length;

    let lineStart2Goal = lineStart.add(horizontal.multiply(0.5 * lineLength - (this.options.PoleWidth.val / 2) + safety_compensing));
    let lineStartFromGoal = lineStart.add(horizontal.multiply(0.5 * lineLength + (this.options.PoleWidth.val / 2) - safety_compensing));

    let turn_around_goal_bottom = drive_around_goal_posts(this, lineStart, lineStart2Goal, lineStartFromGoal, lineEnd, 2, this.tasks.length, this.options.PoleWidth.val, false, 1.5);
    this.tasks.pushAll(turn_around_goal_bottom);
  }

  drawSides( c1, c2, c3, c4, angle, direction )
  {
    let lineWidth = this.options.LineWidth.val;
    let horizontal = angle.rotate_90_cw();

    // Centre Marks at centre of which sides
    let centerMarkStart;
    let centerMarkEnd;
  
    // The middle line vertical
    let serviceLineStart;
    let serviceLineEnd;

    // Inner lines for two man field at the top and bottom of the field
    let tramLineStart;
    let tramLineEnd;

    if(direction === "left")
    {
      centerMarkStart = new Line(c1, c2).middle;
      centerMarkEnd = centerMarkStart.add(horizontal.multiply(this.options["Centre Mark"].val));
      
      tramLineStart = c2.subtract( angle.multiply( this.options.TramLineWidth.val  ));
      tramLineEnd = c3.subtract( angle.multiply( this.options.TramLineWidth.val ));
      serviceLineStart = centerMarkStart.add (horizontal.multiply(this.options.ServiceAreaLength.val )).subtract(angle.multiply(0.5 * this.options.BaseLine.val -lineWidth / 2));
      serviceLineEnd = centerMarkStart.add(horizontal.multiply(this.options.ServiceAreaLength.val )).add(angle.multiply(0.5 * this.options.BaseLine.val -lineWidth / 2));

    }
    else
    {
      centerMarkStart = new Line (c3, c4).middle;
      centerMarkEnd = centerMarkStart.subtract(horizontal.multiply(this.options["Centre Mark"].val));
      
      tramLineStart = c1.add( angle.multiply( this.options.TramLineWidth.val )) 
      tramLineEnd = c4.add( angle.multiply( this.options.TramLineWidth.val ));
      serviceLineStart = centerMarkStart.subtract(horizontal.multiply(this.options.ServiceAreaLength.val )).subtract(angle.multiply(0.5 * this.options.BaseLine.val -lineWidth / 2));
      serviceLineEnd = centerMarkStart.subtract(horizontal.multiply(this.options.ServiceAreaLength.val )).add(angle.multiply(0.5 * this.options.BaseLine.val -lineWidth / 2));

    }

    if( this.options["Double pitch"].val )   // drawing two man pitch
    {

      if(this.options.reverseInGoal.val) {   

        if(direction ==="left") {
          this.tasks.push(new LineTask(this.tasks.length, [serviceLineEnd, serviceLineStart], false, true)); 
          this.tasks.push(new LineTask(this.tasks.length, [centerMarkEnd, centerMarkStart], false, true));

          this.drawLineWithAroundGoal( tramLineStart, tramLineEnd, angle);

        } else{
          this.drawLineWithAroundGoal_L_Small(tramLineStart, tramLineEnd, angle);
          this.tasks.push(new LineTask(this.tasks.length, [centerMarkEnd, centerMarkStart], false, true));
          this.tasks.push(new LineTask(this.tasks.length, [serviceLineStart, serviceLineEnd], false, true)); 
        }
      }
      else {
        if(direction ==="right") {

          this.tasks.push(new LineTask(this.tasks.length, [tramLineStart, tramLineEnd], false, true));
          this.tasks.push(new LineTask(this.tasks.length, [centerMarkStart, centerMarkEnd], false, true));
          this.tasks.push(new LineTask(this.tasks.length, [serviceLineStart, serviceLineEnd], false, true)); 
        }
        else{
          this.tasks.push(new LineTask(this.tasks.length, [serviceLineEnd, serviceLineStart], false, true)); 
          this.tasks.push(new LineTask(this.tasks.length, [centerMarkEnd, centerMarkStart], false, true));
          this.tasks.push(new LineTask(this.tasks.length, [tramLineStart, tramLineEnd], false, true));

        } 

      }
    }
    else{    // Drawing one man pitch
      if(direction ==="right")
      {
        this.tasks.push(new LineTask(this.tasks.length, [centerMarkStart, centerMarkEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [serviceLineStart, serviceLineEnd], false, true));

      }
      else {
        this.tasks.push(new LineTask(this.tasks.length, [centerMarkStart, centerMarkEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [serviceLineEnd, serviceLineStart], false, true)); 

      }
    }

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

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
  
    const angle = new Line( c1, c2 ).unit_vector;
    let horizontal = angle.rotate_90_cw();    

    if( !this.options["Double pitch"].val)
    {
      c1 = c1.add( angle.multiply( this.options.TramLineWidth.val ));  
      c2 = c2.add( angle.multiply( - this.options.TramLineWidth.val ));
      c3 = c3.add( angle.multiply( - this.options.TramLineWidth.val ));
      c4 = c4.add( angle.multiply( this.options.TramLineWidth.val));    
    }
    const serviceCenterRight = new Line(c1, c2).middle;
    const serviceCenterLeft = new Line(c4, c3).middle;
    const centerServiceLineStart = serviceCenterLeft.subtract(horizontal.multiply(this.options.ServiceAreaLength.val));
    const centerServiceLineEnd = serviceCenterRight.add(horizontal.multiply(this.options.ServiceAreaLength.val));

    this.drawEscalate(c1, c2, c3, c4, angle);

    let direction = "right";
    this.drawSides(c1, c2, c3, c4, angle, direction);
 
    if(this.options.CentreServiceLine.val) {
      if(this.options.reverseInGoal.val){
        horizontal = horizontal.rotate_90_cw();
        this.drawLineWithAroundGoalLeft(centerServiceLineStart, centerServiceLineEnd, horizontal);
      }
      else
        this.tasks.push(new LineTask(this.tasks.length, [centerServiceLineStart, centerServiceLineEnd], false, true));
    }

    direction = "left";
    this.drawSides(c1, c2, c3, c4, angle, direction);

    if(this.options["Middle Line"].val) // vertical mid line
    {
      let midLineStart = new Line(c1, c4).middle;
      let midLineEnd = new Line(c2, c3).middle;
      this.tasks.push(new LineTask(this.tasks.length, [midLineStart, midLineEnd], false, true));

    }


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();

  } 
}

 class Soccer_Tennis extends square_pitch
 {
  static template_type = "Tennis";
  static template_title = "Soccer tennis";
  static template_id = "dk_soccer_tennis_beta";
  static template_image = "img/templates/dk_soccer_tennis.png";
  constructor(id, name, layout_method )
  {
  super( id, name, layout_method );
  
  this.options.Length.val = 18;
  this.options.Width.val = 9;
  //this.options.disableLengthHandles.val = false;

  this.options["Right goal pole"].configurable = false;
  this.options["Left goal pole"].configurable = false;
  this.options["Triple pitch"] = {
    name: "Triple pitch",
    val: true,
    type: "bool",
    adjustable: true
  };
  this.options.middleLine = {
    name: "Middle line",
    adjustable: true,
    val: true,
    type: "bool"
  }
  
  }
  static get layout_methods()
  {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  create_triple_pitch(p)
  {
    let c1 = p[0];
    let c2 = p[3]; 
    let c3 = p[4];
    let c4 = p[7];
    let endMid1;
    let endMid2;

    var g1 = new Line( c1, c4 ).unit_vector;
    let  triplePitchLine1;
    let  triplePitchLine2;
    
  
    if(this.options["Triple pitch"].val){
      this.options.Length.val = 18;

      let p1 = c1.add(g1.multiply(2.60));
      let p2 = c2.add(g1.multiply(2.60));
      triplePitchLine1 = new Line(p1, p2);
      this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );

      let p3 = c3.subtract(g1.multiply(2.60));
      let p4 = c4.subtract(g1.multiply(2.60));
      triplePitchLine2 = new Line(p3, p4);
      this.tasks.push( new LineTask( this.tasks.length, [ p3, p4 ], false, true ) );

      endMid1 = triplePitchLine1.middle;
      endMid2 = triplePitchLine2.middle;
    }
    else{
      this.options.Length.val = 12.8;
      endMid1 = new Line(c1, c2).middle;
      endMid2 = new Line(c3, c4).middle;
    }

    this.tasks.push( new LineTask( this.tasks.length, [ endMid2, endMid1 ], false, true ) );
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

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    this.tasks.push( new LineTask( this.tasks.length, [ p[0], p[3] ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p[3], p[4] ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p[4], p[7] ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ p[7], p[0] ], false, true ) );
    let mid1 = new Line(c1, c4).middle;
    let mid2 = new Line(c2, c3).middle;
    this.create_triple_pitch(p, 0)
    if(this.options.middleLine.val)
    {
    this.tasks.push( new LineTask( this.tasks.length, [ mid2, mid1 ], false, true ) );
    }

    
  
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
  }
