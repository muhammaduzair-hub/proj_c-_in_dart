class IlluminationTestGrid extends Job{
    static template_type = "Grid";
    static template_title = "Illumination Test";
    static template_id = "illumination_test_grid_beta";
    static template_image = "img/templates/illumination_test_grid.png";

    /**
     * @param {number} id 
     * @param {String} name 
     * @param {String} layoutMethod 
     */
    constructor(id, name, layoutMethod) {
        super(id, name, layoutMethod);

        const thisClass = this;

        this.options.Length = {
            adjustable: true,
            name: "Length",
            val: 105,
            type: "float"
        };
        this.options.TotalLength ={
            adjustable: false,
            configurable: false,
            name: "Total Length",
            _val: -1,
            type: "float"
        };
        this.options.Width = {
            adjustable: true,
            name: "Width",
            val: 68,
            type: "float"
        };
        this.options.amountColumns = {
            adjustable: true,
            name: "Columns",
            type: "int",
            val: 8,
            configurable: true,
            min: 1, // IMPORTANT
            max: 50
        }
        this.options.amountRows = {
            name: "Rows",
            type: "int",
            val: 5,
            configurable: true,
            min: 1, // IMPORTANT
            max: 50
        }
        this.options.lengthMargin = {
            name: "Lengthwise margin",
            type: "float",
            val: 5,
            configurable: true,
            adjustable: true,
            min: 0
        }
        this.options.widthMargin = {
            name: "Widthwise margin",
            type: "float",
            val: 5,
            configurable: true,
            adjustable: true,
            min: 0
        }

        this.options.trueLength = {
            type: "float",
            _val: -1,
            get val() {
                return thisClass.options.Length.val - 2 * thisClass.options.lengthMargin.val;
            },
            set val(_) {},
            configurable: false,
            adjustable: false,
        }
        this.options.trueWidth = {
            type: "float",
            val: -1,
            get val() {
                return thisClass.options.Width.val - 2 * thisClass.options.widthMargin.val;
            },
            set val(_) {},
            configurable: false,
            adjustable: false,
        }
    }

    static get layout_methods() {
        return {
            "free_hand": 0
        };
    }

    get center() {
        return this.points[0];
    }

    get drawing_points() {
        if (this.calculated_drawing_points) {
            return this.calculated_drawing_points;
        }

        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_cw();

        const p0 = this.center.add(verticalVector.multiply(this.options.Width.val / 2)).add(horizontalVector.multiply(this.options.Length.val / 2));
        const p1 = this.center.subtract(verticalVector.multiply(this.options.Width.val / 2)).add(horizontalVector.multiply(this.options.Length.val / 2));
        const p2 = this.center.subtract(verticalVector.multiply(this.options.Width.val / 2)).subtract(horizontalVector.multiply(this.options.Length.val / 2));
        const p3 = this.center.add(verticalVector.multiply(this.options.Width.val / 2)).subtract(horizontalVector.multiply(this.options.Length.val / 2));

        const points = [p0, p1, p2, p3];

        this.calculated_drawing_points = points;
        return points;

    }


    draw() {
        this.tasks = [];
        this.start_locations = [];
        const points = this.drawing_points;

        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_cw();

        const width = this.options.Width.val - 2 * this.options.widthMargin.val;
        const length = this.options.Length.val - 2 * this.options.lengthMargin.val;
        
        const columnDotDistance = width / (this.options.amountRows.val - 1);
        const rowDotDistance = length / (this.options.amountColumns.val - 1);

        let start, end;

        if (columnDotDistance > rowDotDistance) {
            start = points[0].subtract(verticalVector.multiply(this.options.widthMargin.val)).subtract(horizontalVector.multiply(this.options.lengthMargin.val));
            end = points[3].subtract(verticalVector.multiply(this.options.widthMargin.val)).add(horizontalVector.multiply(this.options.lengthMargin.val));

            for (let i = 0; i < this.options.amountRows.val; i++) {
                const verticalDisplace = i * columnDotDistance;
                for (let j = 0; j < this.options.amountColumns.val; j++) {
                    const horizontalDisplace = j * rowDotDistance;
                    
                    let point;
                    if (i % 2 === 0) {
                        point = start.subtract(horizontalVector.multiply(horizontalDisplace)).subtract(verticalVector.multiply(verticalDisplace));
                    }
                    else {
                        point = end.add(horizontalVector.multiply(horizontalDisplace)).subtract(verticalVector.multiply(verticalDisplace));
                    }

                    this._pushTask(new WaypointTask(-1, point, false, true, false));
                }
            }
        }
        else {
            start = points[0].subtract(verticalVector.multiply(this.options.widthMargin.val)).subtract(horizontalVector.multiply(this.options.lengthMargin.val));
            end = points[1].add(verticalVector.multiply(this.options.widthMargin.val)).subtract(horizontalVector.multiply(this.options.lengthMargin.val));

            for (let i = 0; i < this.options.amountColumns.val; i++) {
                const horizontalDisplace = i * rowDotDistance;
                for (let j = 0; j < this.options.amountRows.val; j++) {
                    const verticalDisplace = j * columnDotDistance;
                    
                    let point;
                    if (i % 2 === 0) {
                        point = start.subtract(horizontalVector.multiply(horizontalDisplace)).subtract(verticalVector.multiply(verticalDisplace));
                    }
                    else {
                        point = end.subtract(horizontalVector.multiply(horizontalDisplace)).add(verticalVector.multiply(verticalDisplace));
                    }
                    this._pushTask(new WaypointTask(-1, point, false, true, false));
                }
            }
        }

        this.start_locations.push(new StartLocation(this.tasks[0].end, this.tasks[0].id));

        this.refresh_bb();
        this.refresh_snapping_lines();
        this.refresh_handles();
        this.refresh_test_run();
    }

    refresh_bb() {
        this.bb = this.drawing_points;
    }

    refresh_handles() {
        this.handles = [];

        const thisClass = this;

        const moveHandle = new Handle(this.center, 0, "Move", "move_handle", "yellow_move_handle", (newPosV, snappingLines)=>{
            const g = newPosV.subtract(thisClass.center);

            thisClass.move_all(g);
            thisClass.refresh_snapping_lines();

            let alignThis = thisClass.get_align_move(thisClass.snapping_lines, snappingLines);
            const alignLines = alignThis[1];
            alignThis = alignThis[0];

            thisClass.move_all(alignThis.multiply(-1));
            thisClass.refresh_snapping_lines();

            return alignLines;
        }, 
        (newPosV)=>{
            thisClass.points = [newPosV];
            thisClass.draw();
            return true;
        });

        const gml = new Line(this.center, this.drawing_points[0]).as_vector.angle - this.options.Angle.val;
        const rotateHandle = new Handle(this.drawing_points[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", (newPosV, snappingLines)=>{
            let newAngle = new Line(this.center, newPosV).as_vector.angle - gml;
                        
            newAngle = thisClass.get_snap_rotation(newAngle, snappingLines)[0];
            thisClass.options.Angle.val = newAngle;
            
            delete this.calculated_drawing_points;
            
            thisClass.draw();    
        }, 
        (newAngle)=>{
            return thisClass.set_new_val(thisClass.options.Angle, newAngle);
        }, "deg");

        const lengthHandlePosition = new Line(this.drawing_points[3], this.drawing_points[2]).middle;
        const lengthHandle = new Handle(lengthHandlePosition, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", (newPosV)=>{
            const g = new Line(thisClass.center, newPosV);
            const newLength = g.length * 2;

            thisClass.set_new_val(thisClass.options.Length, newLength, false);

            delete this.calculated_drawing_points;
            
            return newLength
        }, 
        (newLength)=>{
            return thisClass.set_new_val(thisClass.options.Length, newLength, false);
        });

        const widthHandlePosition = new Line(this.drawing_points[1], this.drawing_points[2]).middle;
        const widthHandle = new Handle(widthHandlePosition, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", (newPosV)=>{
            const g = new Line(thisClass.center, newPosV);
            const newWidth = g.length * 2;

            delete this.calculated_drawing_points;

            thisClass.set_new_val(thisClass.options.Width, newWidth, false);
            return newWidth;
        }, 
        (newWidth)=>{
            return thisClass.set_new_val(thisClass.options.Width, newWidth, false);

        });

        this.handles.push(moveHandle);
        this.handles.push(rotateHandle);
        this.handles.push(lengthHandle);
        this.handles.push(widthHandle);
    }

    refresh_snapping_lines() {
        this.snapping_lines = [];

        const points = this.drawing_points;

        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_cw();

        const verticalStart = this.center.add(verticalVector.multiply(this.options.Width.val));
        const verticalEnd = this.center.subtract(verticalVector.multiply(this.options.Width.val));
        const horizontalStart = this.center.add(horizontalVector.multiply(this.options.Length.val));
        const horizontalEnd = this.center.subtract(horizontalVector.multiply(this.options.Length.val));

        this.snapping_lines.push(new Line(verticalStart, verticalEnd));
        this.snapping_lines.push(new Line(horizontalStart, horizontalEnd));
        this.snapping_lines.push(new Line(points[0], points[1]));
        this.snapping_lines.push(new Line(points[1], points[2]));
        this.snapping_lines.push(new Line(points[2], points[3]));
        this.snapping_lines.push(new Line(points[3], points[0]));
    }

    refresh_test_run() {
        this.test_tasks = [];

        const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const horizontalVector = verticalVector.rotate_90_cw();
        const points = [];

        points.push(this.drawing_points[0].subtract(verticalVector.multiply(this.options.widthMargin.val)).subtract(horizontalVector.multiply(this.options.lengthMargin.val)));
        points.push(this.drawing_points[1].add(verticalVector.multiply(this.options.widthMargin.val)).subtract(horizontalVector.multiply(this.options.lengthMargin.val)));
        points.push(this.drawing_points[2].add(verticalVector.multiply(this.options.widthMargin.val)).add(horizontalVector.multiply(this.options.lengthMargin.val)));
        points.push(this.drawing_points[3].subtract(verticalVector.multiply(this.options.widthMargin.val)).add(horizontalVector.multiply(this.options.lengthMargin.val)));

        for (const point of points) {
            this._pushTestTask(new WaypointTask(-1, point, false, false));
        }
    }

    /**
     * @param {Task} task 
     */
    _pushTask(task) {
        task.id = this.tasks.length;
        this.tasks.push(task);
    }

    /**
     * @param {Task} task
     */
    _pushTestTask(task) {
        task.id = this.test_tasks.length;
        this.test_tasks.push(task);
    }
}