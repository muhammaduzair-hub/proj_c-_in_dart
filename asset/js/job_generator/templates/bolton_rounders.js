class BoltonRounders extends square_pitch {
    static template_type = "Rounders";
    static template_title = "Bolton";
    static template_id = "bolton_rounders_dev"; // CHANGE THIS
    static template_image = "img/templates/bolton_rounders_black.png";
    constructor(id, name, layout_method) {
        super(id, name, layout_method);

        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;

        this.options.baseDistance = {
            name: "Base distance",
            configurable: true,
            val: (12).yard2meter(),
            minValue: 1,
            type: "float"
        }
        this.options.boxWidth = {
            name: "Box width",
            configurable: true,
            val: (2).foot2meter(),
            type: "float",
            prev_sibling: "baseDistance"
        }
        this.options.baseRadius = {
            name: "Base radius",
            configurable: true,
            val: (1).foot2meter(),
            type: "float",
            prev_sibling: "boxWidth"
        }
        this.options.distRatio = {
            name: "Distance ratio",
            configurable: false,
            adjustable: false,
            val: 7/12,
            type: "float"
        }

        this.options.guideLines = {
            name: "Draw lines between bases",
            type: "bool",
            configurable: true,
            _val: false,
            get val()
            {
                return this._val;
            },
            set val(input)
            {
                this._val = input;
            }
        }
    }

    static get layout_methods() {
        return {
            "free_hand": 0
        }       
    }

    get drawing_points() {
        if (this.calculated_drawing_points) {
            return this.calculated_drawing_points;
        }

        switch (this.layout_method) {
            case "free_hand":
                return this.calculateFreeHandDrawingPoints();
            default:
                throw "Layout method not found" + this.layout_method;
        }
    }

    get center() {
        return this.points[0];
    }

    calculateFreeHandDrawingPoints() {
        // Note that this pitch measures from inside the lines
        // Also note that the shape is not an equiangular pentagon as distance between bases must remain the same, 
        // but bases can vary in size and there is no base at home box. Therefore the pitch is designed as a trapeze atop a triangle

        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_cw();
        const center = this.center;
        let drawingPoints = [];
   
        // Lower field
        const homeBaseFrontMiddle = center.subtract(verticalVector.multiply(this.options.distRatio.val * this.options.baseDistance.val));
        const centerToMidBaseDist = this.calculateCenterToMidBaseDist();
        const baseOneCenter = center.add(horizontalVector.multiply(centerToMidBaseDist));
        const baseFourCenter = center.subtract(horizontalVector.multiply(centerToMidBaseDist));
        
        // Upper field
        const trapezeHeight = this.calculateTrapezeHeight();
        const correctedBaseDist = this.options.baseDistance.val + 2 * this.options.baseRadius.val + this.options.LineWidth.val;

        drawingPoints[0] = homeBaseFrontMiddle;
        drawingPoints[1] = baseOneCenter;
        drawingPoints[2] = center.add(verticalVector.multiply(trapezeHeight)).add(horizontalVector.multiply(0.5 * correctedBaseDist));
        drawingPoints[3] = center.add(verticalVector.multiply(trapezeHeight)).subtract(horizontalVector.multiply(0.5 * correctedBaseDist));
        drawingPoints[4] = baseFourCenter;
        drawingPoints[5] = center;

        return drawingPoints;
    }

    calculateCenterToMidBaseDist() {
        const correction = this.options.baseRadius.val + 0.5 * this.options.LineWidth.val;
        return Math.sqrt( Math.pow((this.options.baseDistance.val + correction), 2) - Math.pow(this.options.distRatio.val * this.options.baseDistance.val, 2));
    }

    calculateTrapezeHeight() {
        const a = 2 * this.calculateCenterToMidBaseDist();
        const bcd = this.options.baseDistance.val + 2 * this.options.baseRadius.val + this.options.LineWidth.val;

        const s = (a + bcd - bcd + bcd) / 2; // Helper
        const height = 2 / (a - bcd) * Math.sqrt(s * (s-a+bcd) * (s-bcd) * (s-bcd));
        return height;
        
        // const s = (a + b - c + d) / 2; // Helper
        // return 2 / (a - c) * Math.sqrt(s * (s-a+c) * (s-b) * (s-d));
    }

    drawBox(rearMiddle, frontMiddle) {
        const verticalVector = new Line(rearMiddle, frontMiddle).unit_vector;
        const horizontalVector = verticalVector.rotate_90_cw();
        const halfBoxInsideDist = 0.5 * this.options.boxWidth.val + 0.5 * this.options.LineWidth.val;

        const rearRightCorner = rearMiddle.add(horizontalVector.multiply(halfBoxInsideDist));
        const frontRightCorner = frontMiddle.add(horizontalVector.multiply(halfBoxInsideDist));
        const frontLeftCorner = frontMiddle.subtract(horizontalVector.multiply(halfBoxInsideDist));
        const rearLeftCorner = rearMiddle.subtract(horizontalVector.multiply(halfBoxInsideDist));

        this.tasks.push(new LineTask(this.tasks.length, [rearRightCorner, frontRightCorner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [frontRightCorner, frontLeftCorner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [frontLeftCorner, rearLeftCorner], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [rearLeftCorner, rearRightCorner], false, true));

        return rearLeftCorner;
    }

    drawBase(at, from) {
        const guideVector = new Line(at, from).unit_vector;
        const start = at.add(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));
        const end = at.subtract(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));

        this.tasks.push(new ArcTask(this.tasks.length, [start, end], at, true, false, true));
        return end;
    }

    drawLine(from, at, startCase){

        const guideVector = new Line(from, at).unit_vector;
        let line;

        // Lines turned off by user
        if(this.options.guideLines.val === false)
            return null;
    
        if(startCase === "s")
        {
            const newEnd = at.subtract(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));
            this.tasks.push(new LineTask(this.tasks.length, [from, newEnd], false, true));
            return;
        }
    
        else if(startCase === "e")
        {
            const newEnd = from.add(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));
            this.tasks.push(new LineTask(this.tasks.length, [newEnd, at], false, true));
            return;
        }
        else{
            const end = at.subtract(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));
            const start = from.add(guideVector.multiply(this.options.baseRadius.val - 0.5 * this.options.LineWidth.val));

            this.tasks.push(new LineTask(this.tasks.length, [start, end], false, true));
        }
        
    }

    drawPoints(points) {
        // Service method - Draws drawing_points as waypoints.
        this.tasks.push(new WaypointTask(this.tasks.length, this.center, false, true)); // Center
        points.forEach((point)=>{
            this.tasks.push(new WaypointTask(this.tasks.length, point, false, true));
        });
    }

    drawFreeHand() {
        const p = this.drawing_points;
        const horizontalVector = new Line(p[4], p[1]).unit_vector;
        const verticalVector = horizontalVector.rotate_90_ccw();

        // // this.drawPoints(p); // ESSENTIAL THAT THIS IS OUTCOMMENTED WHEN PUSHING

        const halfBoxInsideDist = 0.5 * (2).foot2meter() + 0.5 * this.options.LineWidth.val;
        const homeBoxFrontMiddle = p[0].subtract(verticalVector.multiply(0.5 * this.options.LineWidth.val));
        const homeBoxRearMiddle = homeBoxFrontMiddle.subtract(verticalVector.multiply((1).yard2meter() + this.options.LineWidth.val));
        const backTapeMiddle = homeBoxRearMiddle.subtract(verticalVector.multiply((1).yard2meter() + this.options.LineWidth.val));
        const backTapeStart = backTapeMiddle.subtract(horizontalVector.multiply(halfBoxInsideDist));
        const backTapeEnd = backTapeMiddle.add(horizontalVector.multiply(halfBoxInsideDist));
        const bowlersBoxRearMiddle = p[5].add(verticalVector.multiply(0.5 * this.options.LineWidth.val));
        const bowlersBoxFrontMiddle = bowlersBoxRearMiddle.add(verticalVector.multiply((3).yard2meter() + this.options.LineWidth.val));
        let boxEnd;

        // Back tape
        this.start_locations.push(new StartLocation(backTapeStart, this.tasks.length));
        this.tasks.push(new LineTask(this.tasks.length, [backTapeStart, backTapeEnd], false, true));       
        // Home box
        boxEnd = this.drawBox(homeBoxRearMiddle, homeBoxFrontMiddle);
        // 1st base

        this.drawLine(homeBoxFrontMiddle, p[4], "s");
        this.drawBase(p[4], homeBoxFrontMiddle);

         // 2nd base
        this.drawLine(p[4], p[3]);
        this.drawBase(p[3], p[4]);

        // 3rd base
        this.drawLine(p[3], p[2]);
         this.drawBase(p[2], p[3]);

        // 4rd base
        this.drawLine(p[2], p[1]);
        this.drawBase(p[1], p[2]);

        // draw end line
        this.drawLine(p[1], homeBoxFrontMiddle, "e");


        boxEnd = this.drawBox(bowlersBoxRearMiddle, bowlersBoxFrontMiddle);  
     
    }

    draw() {
        delete this.calculated_drawing_points;

        this.start_locations = [];
        this.tasks = [];
        
        switch (this.layout_method) {
            case "free_hand":
                this.drawFreeHand();
                break;
            default:
                throw "Layout method not found" + this.layout_method;
                
        }
        
        this.refresh_bb();
        this.refresh_snapping_lines();
        this.refresh_handles();
    }

    convert_to_free_hand() {
    }

    refresh_handles() {
        this.handles = [];

        let this_class = this;
        const p = this.drawing_points;

        this.handles.push( new Handle( p[5], 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
        {  
          this_class.points = [ new_pos_v ];
          delete this_class.calculated_drawing_points;
          this_class.draw();
  
          var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );
  
          align_this = align_this[0];
  
          this_class.points = [ new_pos_v.subtract( align_this ) ];

          delete this_class.calculated_drawing_points;
          this_class.draw();
  
        }, function( new_pos_v )
        {
          this_class.points = [ new_pos_v ];
          this_class.draw();
          return true;
        }));

        var gml = new Line( p[5], p[0] ).as_vector.angle - this.options.Angle.val;
        this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
        {
  
          var new_angle = new Line( p[5], new_pos_v ).as_vector.angle - gml;
          new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
  
          this_class.options.Angle.val = new_angle;
          delete this.calculated_drawing_points;
          this_class.draw();
  
        }, function( new_angle )
        {
          return this_class.set_new_val( this_class.options.Angle, new_angle );
        }, "deg" ) );
    }

    refresh_bb() {
        const p = this.drawing_points;
        const horizontalVector = new Line(p[4], p[1]).unit_vector;
        const verticalVector = horizontalVector.rotate_90_ccw();

        const outerBaseOne = p[1].add(horizontalVector.multiply(this.options.baseRadius.val + 0.5 * this.options.LineWidth.val));
        const outerBaseFour = p[4].subtract(horizontalVector.multiply(this.options.baseRadius.val + 0.5 * this.options.LineWidth.val));

        const middleBaseToBackTapeDist = new Line(p[5], p[0]).length + (2 + 1).yard2meter() + 3 * this.options.LineWidth.val;
        const middleBaseToForwardBaseDist = this.calculateTrapezeHeight() + this.options.baseRadius.val + this.options.LineWidth.val;
        const rearRightPoint = outerBaseOne.subtract(verticalVector.multiply(middleBaseToBackTapeDist));
        const rearLeftPoint = outerBaseFour.subtract(verticalVector.multiply(middleBaseToBackTapeDist));
        const forwardRightPoint = outerBaseOne.add(verticalVector.multiply(middleBaseToForwardBaseDist));
        const forwardLeftPoint = outerBaseFour.add(verticalVector.multiply(middleBaseToForwardBaseDist));
        
        this.bb = [forwardRightPoint, rearRightPoint, rearLeftPoint, forwardLeftPoint]
    }

    refresh_snapping_lines() {
        this.snapping_lines = [];
        const p = this.drawing_points;

        this.snapping_lines.push(new Line(p[0], p[5]));
        this.snapping_lines.push(new Line(p[4], p[1]));
    }
}