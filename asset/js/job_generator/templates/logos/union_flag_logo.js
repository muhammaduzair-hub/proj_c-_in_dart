/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class UnionFlagLogo extends square_pitch
{
  static template_type = "Logo";
  static template_title = "Union Flag";
  static template_id = "logo_union_flag_dev";
  static template_image = "img/logos/union_flag_black.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    
    let this_class = this;
    
    this.options["Left goal pole"].configurable = false;
    this.options["Right goal pole"].configurable = false;

    this.options.Length = {
      adjustable: true,
      name: "Length",
      _val: 25,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v < 5) {
          v = 5;
        }

        this._val = v;
        this_class.options.Width.val = v * this_class.options.widthLengthRatio.val;
        this_class.options.measurementRatio.val = v / 50; // 50 is the full length of a "standard" flag (50-by-30 ratio)
      },
      type: "float"
    };
    this.options.Width = {
      adjustable: true,
      name: "Width",
      val: 15,
      type: "float"
    };

    this.options.widthLengthRatio = {
      name: "Width to lenght ratio",
      _val: 15/25, // Template was laid out using standard 50-by-30 ratio (25m long, 15m wide)
      get val() {
        return this._val;
      },
      set val(v) {
        // Must never change
      },
      type: "float",
      configurable: false,
      adjustable: false
    }

    this.options.measurementRatio = {
      name: "Modified distance ratio",
      val: 0.5, // Template based on 50 (meter) flag, starting length is 25; hence 0.5
      type: "float",
      configurable: false,
      adjustable: false
    }

    this.options.drawInsideGuides = {
      name: "Draw inside guides",
      _val: true,
      type: "bool",
      configurable: true,
      adjustable: false,
      get val () {
        return this._val;
      },
      set val (v) {
        if (v) {
          this_class.options.encircleWithWhiteOutline.val = false;
          this._val = true;
        }
        else {
          this._val = false;
        }
      }
    }

    this.options.encircleWithWhiteOutline = {
      name: "Encircle with white outline",
      _val: false,
      type: "bool",
      configurable: true,
      adjustable: false,
      prev_sibling: "drawInsideGuides",
      get val () {
        return this._val;
      },
      set val (v) {
        if (v) {
          this_class.options.drawInsideGuides.val = false;
          this._val = true;
        }
        else {
          this._val = false;
        }
      }
    }
  }

  static get layout_methods() {
    return {"free_hand": 0};
  }

  draw() {
    /**
     * Sct. George refers to the English part of the flag (large red cross in middle)
     * Sct. Andrews refers to the Scottish part of the flag (The blue triangles)
     * Sct. Patrick refers to the Irish part of the flag (the red diagonal parallelograms)
     * 
     * It is recommended to see documentation for relevant information
     */
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    const drawingPoints = this.drawing_points;
    const center = this.points[0];
    const cornerOne = drawingPoints[0];
    const cornerTwo = drawingPoints[3];
    const cornerThree = drawingPoints[4];
    const cornerFour = drawingPoints[7];
    const rimGuides = this.getRimGuides(cornerOne, cornerTwo, cornerThree, cornerFour);    
    let quarterGuides;

    quarterGuides = this.getQuarterGuides(center, cornerOne, cornerTwo, cornerThree, cornerFour);
    this.start_locations.push(new StartLocation(quarterGuides[0].start, this.tasks.length));
    this.drawLines(quarterGuides);

    // TODO: Make "around move"

    quarterGuides = this.getQuarterGuides(center, cornerTwo, cornerThree, cornerFour, cornerOne);
    this.drawLines(quarterGuides);

    // TODO: Make "around move"

    quarterGuides = this.getQuarterGuides(center, cornerThree, cornerFour, cornerOne, cornerTwo);
    this.drawLines(quarterGuides);

    // TODO: Make "around move"

    quarterGuides = this.getQuarterGuides(center, cornerFour, cornerOne, cornerTwo, cornerThree);
    this.drawLines(quarterGuides);
    
    // TODO: Make "around move"

    this.drawRim(rimGuides);
    
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  
  getQuarterGuides(center, cornerOne, cornerTwo, cornerThree, cornerFour) {  
    const rimGuides = this.getRimGuides(cornerOne, cornerTwo, cornerThree, cornerFour)  
    const verticalVector = new Line(cornerTwo, cornerOne).unit_vector;
    const horizontalVector = new Line(cornerFour, cornerOne).unit_vector;
    const diagonalGuide = new Line(center, cornerOne);
    const diagonalVector = diagonalGuide.unit_vector;
    const displaceVector = diagonalVector.rotate_90_ccw();

    let guideLists = [];
    let modifiedDist;

    modifiedDist = 3 * this.options.measurementRatio.val + 0.5 * this.options.LineWidth.val;
    const largeBoxGuides = this.getBoxGuides(center, verticalVector, horizontalVector, rimGuides, modifiedDist);
    modifiedDist = (3 + 2) * this.options.measurementRatio.val - 0.5 * this.options.LineWidth.val;
    const smallBoxGuides = this.getBoxGuides(center, verticalVector, horizontalVector, rimGuides, modifiedDist);
    
    guideLists.push(this.getSctGeorgeGuides(largeBoxGuides));    
    guideLists.push(this.getLowerSctAndrewsGuides(smallBoxGuides, diagonalGuide, displaceVector));
    guideLists.push(this.getSctPatrickGuides(smallBoxGuides, diagonalGuide, displaceVector));
    guideLists.push(this.getUpperSctAndrewsGuides(smallBoxGuides, diagonalGuide, displaceVector));
    
    let quarterGuides = [];
    for (let list of guideLists) {
      quarterGuides = quarterGuides.concat(list);
    }
    return quarterGuides;
  }

  getSctGeorgeGuides(boxGuides) {
    const lineOne = new Line(boxGuides[2].end, boxGuides[2].start);
    const lineTwo = new Line(boxGuides[1].end, boxGuides[1].start);
    return [lineOne, lineTwo];
  }

  getLowerSctAndrewsGuides(boxGuides, diagonalGuide, displaceVector) {
    const moveDistance = -3 * this.options.measurementRatio.val + 0.5 * this.options.LineWidth.val;
    const guideLine = diagonalGuide.move(displaceVector, moveDistance);
        
    const pointOne = boxGuides[0].cross_with_line(boxGuides[1]);
    const pointTwo = guideLine.cross_with_line(boxGuides[1]);
    const pointThree = guideLine.cross_with_line(boxGuides[0]);
    
    const lineOne = new Line(pointOne, pointTwo);
    const lineTwo = new Line(pointTwo, pointThree);

    return [lineOne, lineTwo];
  }

  getSctPatrickGuides(boxGuides, diagonalGuide, displaceVector) {
    const lowerGuideLine = diagonalGuide.move(displaceVector, 0.5 * -1 * this.options.LineWidth.val);
    const upperGuideLine = diagonalGuide.move(displaceVector, 2 * this.options.measurementRatio.val + 0.5 * this.options.LineWidth.val);
    let lines = [];
    if (boxGuides[0].length > boxGuides[1].length) {
      const pointOne = lowerGuideLine.cross_with_line(boxGuides[0]);
      const pointTwo = lowerGuideLine.cross_with_line(boxGuides[2]);
      const pointThree = upperGuideLine.cross_with_line(boxGuides[2]);
      const pointFour = upperGuideLine.cross_with_line(boxGuides[3]);
  
      lines.push(new Line(pointOne, pointTwo));
      lines.push(new Line(pointTwo, pointThree));
      lines.push(new Line(pointThree, pointFour));
    }
    else {      
      const pointOne = lowerGuideLine.cross_with_line(boxGuides[0]);
      const pointTwo = lowerGuideLine.cross_with_line(boxGuides[1]);
      const pointThree = boxGuides[1].cross_with_line(boxGuides[2]);
      const pointFour = upperGuideLine.cross_with_line(boxGuides[2]);
      const pointFive = upperGuideLine.cross_with_line(boxGuides[3]);
  
      lines.push(new Line(pointOne, pointTwo));
      lines.push(new Line(pointTwo, pointThree));
      lines.push(new Line(pointThree, pointFour));
      lines.push(new Line(pointFour, pointFive));
    }
    return lines;
  }

  getUpperSctAndrewsGuides(boxGuides, diagonalGuide, displaceVector) {
    const guideLine = diagonalGuide.move(displaceVector, (2 + 1) * this.options.measurementRatio.val - 0.5 * this.options.LineWidth.val);
    
    const pointOne = guideLine.cross_with_line(boxGuides[3]);
    const pointTwo = guideLine.cross_with_line(boxGuides[2]);
    const pointThree = boxGuides[2].cross_with_line(boxGuides[3]);

    let lines = [];

    if (this.options.Length.val > 5) {
      const lineOne = new Line(pointOne, pointTwo);
      lines.push(lineOne);
    }
    const lineTwo = new Line(pointTwo, pointThree);
    lines.push(lineTwo);

    return lines;
  }

  drawRim(rimGuides) {
    if (!this.options.encircleWithWhiteOutline.val && !this.options.drawInsideGuides.val) {
      return;
    }

    for (let guide of rimGuides) {
      this.tasks.push(new LineTask(this.tasks.length, [guide.start, guide.end], false, true)); 
      
      if (this.options.drawInsideGuides.val) {
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", 0.2 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", 0.2 ) );
      }
    }
  }

  getRimGuides(cornerOne, cornerTwo, cornerThree, cornerFour) {
    let c1, c2, c3, c4;

    if (this.options.encircleWithWhiteOutline.val) {
      const verticalVector = new Line(cornerTwo, cornerOne).unit_vector;
      const horizontalVector = verticalVector.rotate_90_cw();
      const halfLineWidth = 0.5 * this.options.LineWidth.val;
      c1 = cornerOne.add(verticalVector.multiply(halfLineWidth)).add(horizontalVector.multiply(halfLineWidth));
      c2 = cornerTwo.subtract(verticalVector.multiply(halfLineWidth)).add(horizontalVector.multiply(halfLineWidth));
      c3 = cornerThree.subtract(verticalVector.multiply(halfLineWidth)).subtract(horizontalVector.multiply(halfLineWidth));
      c4 = cornerFour.add(verticalVector.multiply(halfLineWidth)).subtract(horizontalVector.multiply(halfLineWidth));
    }
    else {
      const verticalVector = new Line(cornerTwo, cornerOne).unit_vector;
      const horizontalVector = verticalVector.rotate_90_cw();
      const halfLineWidth = 0.5 * this.options.LineWidth.val;
      c1 = cornerOne.subtract(verticalVector.multiply(halfLineWidth)).subtract(horizontalVector.multiply(halfLineWidth));
      c2 = cornerTwo.add(verticalVector.multiply(halfLineWidth)).subtract(horizontalVector.multiply(halfLineWidth));
      c3 = cornerThree.add(verticalVector.multiply(halfLineWidth)).add(horizontalVector.multiply(halfLineWidth));
      c4 = cornerFour.subtract(verticalVector.multiply(halfLineWidth)).add(horizontalVector.multiply(halfLineWidth));
    }
    return this.getBoxLines([c1, c2, c3, c4]);
  }

  getBoxGuides(center, verticalVector, horizontalVector, rimGuides, modifiedDist) {
    const verticalMiddle = rimGuides[3].middle;
    const horizontalMiddle = rimGuides[0].middle;
            
    let verticalGuide = new Line(verticalMiddle, center);
    let horizontalGuide = new Line(center, horizontalMiddle);
    
    verticalGuide = verticalGuide.move(horizontalVector, modifiedDist);
    horizontalGuide = horizontalGuide.move(verticalVector, modifiedDist);
    
    const c1 = rimGuides[0].start;
    const c2 = horizontalGuide.cross_with_line(rimGuides[0]);
    const c3 = horizontalGuide.cross_with_line(verticalGuide);
    const c4 = verticalGuide.cross_with_line(rimGuides[3]);

    return this.getBoxLines([c1, c2, c3, c4]);
  }

  getBoxLines(points) {
    let lines = [];

    for (i = 0; i < points.length; i++) {
      let iPlusOne = i+1;
      if (i == points.length - 1) {
        iPlusOne = 0;
      }
      lines.push(new Line(points[i], points[iPlusOne]));
    }
    return lines;
  }

  drawLines(lines) {
    for (let line of lines) {
      this.tasks.push(new LineTask(this.tasks.length, [line.start, line.end], false, true))
    }
  }

  refresh_handles() {
    const this_class = this;
    const drawingPoints = this.drawing_points;
    const center = this.points[0];
    const cornerOne = drawingPoints[0];
    const cornerFour = drawingPoints[7];
    
    const lengthHandlePosition = drawingPoints[1];
    const lengthHandleGuide = new Line(cornerFour, cornerOne);
    
    this.handles = [];
    this.handles.push(this.lengthHandle(this_class, lengthHandlePosition, lengthHandleGuide));
    this.handles.push(this.moveHandle(this_class, center));   
    this.handles.push(this.rotateHandle(this_class, center, cornerFour));
  }

  lengthHandle(this_class, position, g) {
    return new Handle(position, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", (new_pos_v, snapping_lines)=>{
      const newLength = g.start.dist_to_point( g.point_on_line(new_pos_v));
      this_class.set_new_val(this_class.options.Length, newLength, false);
      return newLength;
    }, (newLength)=>{
      return this_class.set_new_val(this_class.options.Length, newLength, false);
    });
  }

  moveHandle(this_class, position) {
    return new Handle(position, 0, "Move", "move_handle", "yellow_move_handle", (new_pos_v, snapping_lines)=>{
      const g = new_pos_v.subtract(this_class.points[0]);
      this_class.move_all( g );
      this_class.refresh_snapping_lines();

      let align_this = this_class.get_align_move(this_class.snapping_lines, snapping_lines);

      const align_lines = align_this[1];
      align_this = align_this[0];

      this_class.move_all( align_this.multiply(-1));
      this_class.refresh_snapping_lines();

      return align_lines;
    },
    (new_pos_v)=>{
      this_class.points = [new_pos_v];
      this_class.draw();
      return true;
    });
  }

  rotateHandle(this_class, center, position) {
    var gml = new Line(center, position).as_vector.angle - this.options.Angle.val;
    return new Handle(position, this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", (new_pos_v, snapping_lines)=>{

      var new_angle = new Line(center, new_pos_v).as_vector.angle - gml;
      var align_this = this_class.get_snap_rotation(new_angle, snapping_lines);
      var align_lines = align_this[1];
      new_angle = align_this[0];

      this_class.options.Angle.val = new_angle;
      delete this.calculated_drawing_points;
      this_class.draw();

      return align_lines;
    }, function(new_angle)
    {
      return this_class.set_new_val(this_class.options.Angle, new_angle);
    }, "deg");
  }
}


