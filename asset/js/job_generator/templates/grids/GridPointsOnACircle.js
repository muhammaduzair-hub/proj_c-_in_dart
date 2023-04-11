class GridPointsOnACircle extends GeometryJob {
    static template_type = "Grid"
    static template_title = "Points on a circle";
    static template_id = "grid_points_on_a_circle_beta";
    static template_image = "img/templates/grid_points_on_a_circle.png";

    forceUsingStartLocations = true;
    
    constructor(id, name, layout_methods) {
        super(id, name, layout_methods);
                
        this.options.Radius = {
            adjustable: true,
            name: "Radius",
            _val: 0.8,
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v.coerce(0.15, 999);
            },
            type: "float"
        };

        this.options.amountPoints = {
            configurable: true,
            name: "Amount of points",
            _val: 20,
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v.coerce(1, 999);
            },
            type: "int",
            units: "number",
            deselectsafe: true
        };

        this.options.paintPoints = {
            adjustable: true,
            name: "Paint points",
            val: true,
            type: "bool"
        };

        this.options.wait = {
            adjustable: true,
            name: "Wait at points",
            _val: false,
            type: "bool"
        }

        this.options.waitTime = {
            configurable: true,
            name: "Wait time (seconds)",
            _val: 5,
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v.coerce(0, 999);
            },
            type: "float",
            units: "number"
        }
    }

    static get layout_methods() {
        return {
            "center": 1,
            "two_ends": 2,
            "free_hand": 0
        };
    }

    get info_options() {
        return ["Radius", "amountPoints"];
    }

    get center() {
        if (this.points.length === 1) {
            return this.points[0];
        }
        else {
            const p = this.drawing_points;
            const g = new Line( p[0], p[1] );
            return g.middle;
        }
    }

    get drawing_points() {
        if (this.calculated_drawing_points) {
            return this.calculated_drawing_points;
        }
  
        let points = [];
        switch(this.layout_method) {
            case "two_ends":
                points = this.points;
                break;
            case "center":
            case "free_hand":
                const g1 = new Vector(1, 0).rotate(this.options.Angle.val).multiply(this.options.Radius.val);
                const e1 = this.points[0].subtract(g1);
                const e2 = this.points[0].add(g1);
                points = [e1, e2];
                break;
            default:
                throw `Layout method "${this.layout_method}" not found!`;
        }

        const g = new Line(points[0], points[1]);
        this.options.Radius.val = g.length / 2;
        this.options.Angle.val = g.as_vector.angle;
        this.calculated_drawing_points = points;
        return points;
    }

    draw() {
        delete this.calculated_drawing_points;
        this.tasks = [];

        const p = this.drawing_points;
        const degreeIncrement = 360 / this.options.amountPoints.val; // 360 degrees being a full circle
        const guideVector = new Line(p[0], p[1]).unit_vector;
        
        let currentID;

        const lngth = this.options.amountPoints.val + 1; // We want to drive back to start when completing the circle to ensure the robot is positioned correctly on the first (last) point.
        for (i = 0; i < lngth; i++) {
            const angle = i * degreeIncrement;
            const vector = guideVector.rotate((angle).deg2rad());
            const point = this.center.add(vector.multiply(this.options.Radius.val));
            const paint = this.options.paintPoints.val;
            const wait = this.options.wait.val;
            const waitTime = this.options.waitTime.val;
            
            let task;

            if (i === 0) {
                task = new WaypointTask(-1, point, false, false, true);
            }
            else {
                task = new WaypointTask(-1, point, false, paint, !paint);
                if (wait) {
                    task.task_options.push(new FloatRobotAction("point_wait", waitTime));
                }
                if (!paint) {
                    this.options.taskModificationIds.val[currentID] = Task.modificationType.VIA;
                }
            }

            currentID = this._pushTask(task);
        }

        this.start_locations.push(new StartLocation(this.tasks[0].start, this.tasks[0].id)); // Always attach start location to the first task

        this.refreshSnappingLines();
        this.refreshBB();
        this.refreshHandles();
    }

    refreshSnappingLines() {
        this.snapping_lines = [];
    }

    refreshBB() {
        const guidevector = new Vector(1, 0).rotate(this.options.Angle.val);
        const rotatedVector = guidevector.rotate_90_ccw();
        const center = this.center;
        const transformDistance = this.options.Radius.val; 

        const bbp1 = center.add(guidevector.multiply(transformDistance)).add(rotatedVector.multiply(transformDistance));
        const bbp2 = center.add(guidevector.multiply(transformDistance)).subtract(rotatedVector.multiply(transformDistance));
        const bbp3 = center.subtract(guidevector.multiply(transformDistance)).subtract(rotatedVector.multiply(transformDistance));
        const bbp4 = center.subtract(guidevector.multiply(transformDistance)).add(rotatedVector.multiply(transformDistance));

        this.bb = [bbp1, bbp2, bbp3, bbp4];
    }

    refreshHandles() {
        this.handles = [];

        const thisClass = this;
        const p = this.drawing_points;

        const moveHandle = new Handle(this.center, 0, "Move", "move_handle", "yellow_move_handle", 
        (newPosV)=>{
            thisClass.points = [newPosV];
            delete thisClass.calculated_drawing_points;
            thisClass.draw();
        }, 
        (newPosV)=>{
            thisClass.points = [newPosV];
            delete thisClass.calculated_drawing_points;
            thisClass.draw();
        });

        const rotateHandle = new Handle(p[1], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", 
        (newPosV)=>{
            const newAngle = new Line(thisClass.center, newPosV).as_vector.angle;
            thisClass.options.Angle.val = newAngle;
            thisClass.draw();
        },
        (newAngle)=>{
            thisClass.options.Angle.val = newAngle;
            thisClass.draw();
            return true;
        }, "deg");

        const radiusHandle = new Handle(p[0], -1 * this.options.Angle.val + Math.PI / 2, "Radius", "Handle", "Yellow_Handle", 
        (newPosV)=>{
            const newRadius = new Line(thisClass.center, newPosV).length;
            thisClass.options.Radius.val = newRadius;
            thisClass.draw();
        }, 
        (newRadius)=>{
            thisClass.options.Radius.val = newRadius;
            thisClass.draw();
        });

        this.handles.push(moveHandle);
        this.handles.push(rotateHandle);
        this.handles.push(radiusHandle);
    }

    convert_to_free_hand() {
        const p = this.drawing_points;
        const g = new Line(p[0], p[1]);
        this.options.Radius.val = g.length / 2;
        this.options.Angle.val = g.as_vector.angle;
    
        this.points = [g.middle];
        this.layout_method = "free_hand";
    
        delete this.calculated_drawing_points;
        this.draw();
    }

    /**
     * Push task to tasks array in correct order
     * @param {Task} task 
     * @returns {Number}
     */
    _pushTask(task) {
        task.id = this.tasks.length;
        this.tasks.push(task);
        return task.id;
    }
}