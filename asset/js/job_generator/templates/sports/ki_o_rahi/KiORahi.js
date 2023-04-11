class KiORahi extends Job{
    static template_type = "Kī-o-rahi";
    static template_title = "Standard";
    static template_id = "ki_o_rahi_beta";
    static template_image = "img/templates/ki_o_rahi.png";

    constructor(id, name, layout_method) {
        super(id, name, layout_method);

        const thisClass = this;

        // Non-configurable options
        // Roto
        this.options.paintRoto = {
            name: "Paint Te Roto",
            configurable: false,
            type: "bool",
            val: true,
            prev_sibling: "araWidth",
        }
        this.options.rotoRadius = {
            name: "Te Roto radius",
            type: "float",
            val: 9,
            configurable: true,
            prev_sibling: "paintRoto",
        }
        // Ara
        this.options.paintAra = {
            name: "Paint Te Ara",
            configurable: false,
            type: "bool",
            val: true,
            prev_sibling: "paweroRadius",
        }
        this.options.araWidth = {
            name: "Te Ara width",
            type: "float",
            val: 1.5,
            configurable: true,
            prev_sibling: "paintAra",
        }
        // Pawero
        this.options.paintPawero = {
            name: "Paint Pawero",
            configurable: false,
            type: "bool",
            val: true,
        }
        this.options.paweroRadius = {
            name: "Pawero radius",
            type: "float",
            val: 5,
            configurable: true,
            prev_sibling: "paintPawero",
        }
        // Ara
        this.options.paintAra = {
            name: "Paint Te Ara",
            configurable: false,
            type: "bool",
            val: true,
            prev_sibling: "paweroRadius",
        }
        this.options.araWidth = {
            name: "Te Ara width",
            type: "float",
            val: 1.5,
            configurable: true,
            prev_sibling: "paintAra",
        }
        // Configurable options
        // Subs boxes
        this.options.paintSubsBoxes = {
            name: "Paint Substitution boxes",
            configurable: true,
            type: "bool",
            val: true,
            prev_sibling: "aoRadius"
        }
        this.options.subsBoxLength = {
            name: "Substitution box length",
            type: "float",
            val: 2,
            get configurable() {
                return thisClass.options.paintSubsBoxes.val;
            },
            set configurable(_) {},
            prev_sibling: "paintSubsBoxes"
        }
        this.options.subsBoxDepth = {
            name: "Substitution box depth",
            type: "float",
            val: 0.5,
            get configurable() {
                return thisClass.options.paintSubsBoxes.val;
            },
            set configurable(_) {},
            prev_sibling: "subsBoxLength"
        }
        this.options.subsBoxDistance = {
            name: "Substitution box distance",
            val: 18,
            type: "float",
            get configurable() {
                return thisClass.options.paintSubsBoxes.val;
            },
            set configurable(_) {},
            prev_sibling: "subsBoxDepth"
        }
        // Ao
        this.options.paintAo = {
            name: "Paint Te Ao",
            configurable: true,
            type: "bool",
            val: true,
            prev_sibling: "maramaDistance"
        }
        this.options.aoRadius = {
            name: "Te Ao radius",
            type: "float",
            val: 17,
            get configurable() {
                return thisClass.options.paintAo.val;
            },
            set configurable(_) {},
            prev_sibling: "paintAo"
        }
        // Marama
        this.options.paintMarama = {
            name: "Paint Te Marama",
            configurable: true,
            type: "bool",
            val: true,
            prev_sibling: "ngaPouDistance",
        }
        this.options.maramaRadius = {
            name: "Te Marama radius",
            type: "float",
            val: 1,
            get configurable() {
                return thisClass.options.paintMarama.val;
            },
            set configurable(_) {},
            prev_sibling: "paintMarama",
        }
        this.options.maramaDistance = {
            name: "Te Marama distance",
            type: "float",
            val: thisClass.options.aoRadius.val,
            prev_sibling: "maramaRadius",
            get configurable() {
                return thisClass.options.paintMarama.val;
            },
            set configurable(_) {},
        }
        // Ngā Pou
        this.options.paintNgaPou = {
            name: "Paint Ngā Pou",
            configurable: true,
            type: "bool",
            val: true,
            prev_sibling: "wairuaRadius"
        }
        this.options.ngaPouRadius = {
            name: "Ngā Pou radius",
            type: "float",
            val: 0.1,
            get configurable() {
                return thisClass.options.paintNgaPou.val;
            },
            set configurable(_) {},
            prev_sibling: "paintNgaPou"
        }
        this.options.ngaPouDistance = {
            name: "Ngā Pou distance",
            configurable: true,
            type: "float",
            val: 15,
            get configurable() {
                return thisClass.options.paintNgaPou.val;
            },
            set configurable(_) {},
            prev_sibling: "ngaPouRadius"
        }
        // Wairua
        this.options.paintWairua = {
            name: "Paint Te Wairua",
            configurable: true,
            type: "bool",
            val: true,
            prev_sibling: "rotoRadius"
        }
        this.options.wairuaRadius = {
            name: "Te Wairua radius",
            type: "float",
            val: 1,
            get configurable() {
                return thisClass.options.paintWairua.val;
            },
            set configurable(_) {},
            prev_sibling: "paintWairua",
        }
        // Miscellaneous
        this.options.TotalLength ={
            adjustable: true,
            name: "Total Length",
            val: -1,
            type: "float"
          };
        this.options.Length = {
            name: "Length",
            val: 0,
            type: "float"
        };
        this.options.Width = {
            name: "Width",
            val: 0,
            type: "float"
        };
    }

    static get layout_methods() {
        return {
            "center": 1,
            "free_hand": 0
        }
    }

    get center() {
        return this.points[0];
    }

    get drawing_points() {
        if (this.calculated_drawing_points) {
            return this.calculated_drawing_points;
        }

        let points = [];

        switch (this.layout_method) {
            case "center":
            case "free_hand":
                points = [this.center];
                break;
            default:
                throw `Unknown layout method "${this.layout_method}"`;
        }

        this.calculated_drawing_points = points;
        return this.points;
    }

    get maramaExtendsBeyondAo() {
        if (!this.options.paintMarama.val) {
            return false;
        }
        else if (!this.options.paintAo.val) {
            return true;
        }
        else {
            const maramaExtend = this.options.maramaDistance.val + this.options.maramaRadius.val;
            return this.options.aoRadius.val < maramaExtend ? true : false;
        }
    }

    draw() {
        delete this.calculated_drawing_points;
        this.tasks = [];

        const center = this.drawing_points[0];
        const guideVector = new Vector(0, 1).rotate(this.options.Angle.val);
        const maramaTask = this.maramaTask(guideVector);
        
        this.start_locations.push(new StartLocation(center, this.tasks.length));

        this._pushTasks(this.wairuaTask(guideVector));
        this._pushTasks(this.paweroAndAraTasks(guideVector));
        this._pushTasks(this.rotoTask(guideVector));
        this._pushTasks(maramaTask);
        this._pushTasks(this.ngaPouTasks(guideVector));
        this._pushTasks(this.aoTask(guideVector, maramaTask));

        this._setLength();
        this._setWidth();
        
        this._refreshBoundingBox(guideVector);
        this._refreshHandles();
        this._refreshSnappingLines();
        this._refreshTestRun(guideVector);
    }

    /**
     * @param {Vector} guideVector 
     * @returns {CircleTask | WaypointTask}
     */
    wairuaTask(guideVector) {
        if (!this.options.paintWairua.val) {
            return;
        }
        
        if (this.options.wairuaRadius.val > this.options.LineWidth.val) {
            const radius = guideVector.multiply(this.options.wairuaRadius.val + this.options.LineWidth.val).rotate(Math.PI);
            return new CircleTask(-1, radius, this.center, true);
        }
        else {
            return new WaypointTask(-1, this.center, false, true);
        }
    }

    /**
     * @param {Vector} guideVector 
     * @returns {Task[]}
     */
    paweroAndAraTasks(guideVector) {
        if (!this.options.paintPawero.val && !this.options.paintAra.val) {
            return;
        }

        const rotatedVector = guideVector.rotate_90_ccw();
        const first = this.center.subtract(guideVector.multiply(this.options.paweroRadius.val)).subtract(rotatedVector.multiply(0.5 * this.options.araWidth.val + 0.5 * this.options.LineWidth.val));
        const second = this.center.add(guideVector.multiply(this.options.paweroRadius.val));
        const third = this.center.subtract(guideVector.multiply(this.options.paweroRadius.val)).add(rotatedVector.multiply(0.5 * this.options.araWidth.val + 0.5 * this.options.LineWidth.val));
        const mouthStart = first.subtract(guideVector.multiply(this.options.rotoRadius.val - this.options.paweroRadius.val));
        const mouthEnd = third.subtract(guideVector.multiply(this.options.rotoRadius.val - this.options.paweroRadius.val));
        let tasks = [];

        if (this.options.paintAra.val) {
            tasks.push(new LineTask(-1, [mouthStart, first], false, true));
        }
        if (this.options.paintPawero.val) {
            tasks.push(new ArcTask(-1, [first, second, third], this.center, false, false, true));
        }
        if (this.options.paintAra.val) {
            tasks.push(new LineTask(-1, [third, mouthEnd], false, true));
        }

        return tasks;
    }

    /**
     * @param {Vector} guideVector 
     * @returns {ArcTask}
     */
    rotoTask(guideVector) {
        if (!this.options.paintRoto.val) {
            return;
        }
        const rotatedVector = guideVector.rotate_90_ccw();
        const first = this.center.subtract(guideVector.multiply(this.options.rotoRadius.val)).add(rotatedVector.multiply(0.5 * this.options.araWidth.val + 0.5 * this.options.LineWidth.val));
        const second = this.center.add(guideVector.multiply(this.options.rotoRadius.val));
        const third = this.center.subtract(guideVector.multiply(this.options.rotoRadius.val)).subtract(rotatedVector.multiply(0.5 * this.options.araWidth.val + 0.5 * this.options.LineWidth.val));

        return new ArcTask(-1, [first, second, third], this.center, true, false, true);
    }
    
    /**
     * @param {Vector} guideVector 
     * @returns {CircleTask | WaypointTask}
     */
    maramaTask(guideVector) {
        if (!this.options.paintMarama.val) {
            return;
        }
        
        const center = this.center.subtract(guideVector.multiply(this.options.maramaDistance.val));

        if (this.options.maramaRadius.val > this.options.LineWidth.val) {
            const radiusVector = guideVector.multiply(this.options.maramaRadius.val + 0.5 * this.options.LineWidth.val);
    
            return new CircleTask(-1, radiusVector, center, true);
        }
        else {
            return new WaypointTask(-1, center, false, true);
        }
    }

    /**
     * @param {Vector} guideVector 
     * @param {Boolean} forceNoSubsBoxes 
     * @returns {Task[]}
     */
    ngaPouTasks(guideVector, forceNoSubsBoxes=false) {
        if (!this.options.paintNgaPou.val && !this.options.paintSubsBoxes.val) {
            return;
        }

        const amount = 7; // 7 dots should be painted equadistantly
        let tasks = [];
        
        for (let i = 0; i < amount; i++) {
            const angle = 45 * (i + 1);
            const rotatedVector = guideVector.rotate((angle).deg2rad());
            const point = this.center.subtract(rotatedVector.multiply(this.options.ngaPouDistance.val));
            
            if (this.options.paintNgaPou.val && !forceNoSubsBoxes) {
                if (this.options.ngaPouRadius.val > this.options.LineWidth.val) {
                    const radius = rotatedVector.multiply(this.options.ngaPouRadius.val).rotate(Math.PI);
                    tasks.push(new CircleTask(-1, radius, point, true));
                }
                else {
                    tasks.push(new WaypointTask(-1, point, false, true));
                }
            }

            if (this.options.paintSubsBoxes.val && !forceNoSubsBoxes) {
                if (i === 1 || i === 5) {
                    const subsBoxtasks = this.subsBoxTasks(point);
                    for (const task of subsBoxtasks) {
                        tasks.push(task);
                    }
                }
            }
        }
        return tasks;
    }

    /**
     * @param {Vector} referencePoint 
     * @returns {Task[]}
     */
    subsBoxTasks(referencePoint) {
        const guideVector = new Line(this.center, referencePoint).unit_vector;
        const rotatedVector = guideVector.rotate_90_ccw();

        const widthMiddle = this.center.add(guideVector.multiply(this.options.subsBoxDistance.val + 0.5 * this.options.LineWidth.val));
        const correctedLength = this.options.subsBoxLength.val - 0.5 * this.options.LineWidth.val;
        
        const widthStart = widthMiddle.subtract(rotatedVector.multiply(0.5 * correctedLength));
        const widthEnd = widthMiddle.add(rotatedVector.multiply(0.5 * correctedLength));
        
        let tasks = [];

        if (this.options.subsBoxDepth.val > 0.5 * this.options.LineWidth.val) {
            const firstDepthStart = widthStart.add(guideVector.multiply(this.options.subsBoxDepth.val - 0.5 * this.options.LineWidth.val));
            const secondDepthEnd = widthEnd.add(guideVector.multiply(this.options.subsBoxDepth.val - 0.5 * this.options.LineWidth.val));
    
            tasks.push(new LineTask(-1, [firstDepthStart, widthStart], false, true));
            tasks.push(new LineTask(-1, [widthStart, widthEnd], false, true));
            tasks.push(new LineTask(-1, [widthEnd, secondDepthEnd], false, true));
        }
        else {
            tasks.push(new LineTask(-1, [widthStart, widthEnd], false, true));
        }

        return tasks;
    }
    
    /**
     * @param {Vector} guideVector 
     * @param {CircleTask | WaypointTask} maramaTask
     * @returns {CircleTask | ArcTask}
     */
    aoTask(guideVector, maramaTask) {
        if(!this.options.paintAo.val) {
            return;
        }

        const aoRadius = this.options.aoRadius.val + 0.5 * this.options.LineWidth.val;

        if (!this.options.paintMarama.val 
        ||  this.options.maramaRadius.val <= this.options.LineWidth.val) {
            return circle(guideVector, aoRadius, this.center);
        }

        const aoCircle = new Circle(this.center, aoRadius);
        const maramaCircle = new Circle(maramaTask.center, maramaTask.radius.length);
        const crossPoints = aoCircle.crosses_with_circle(maramaCircle);
        
        if (crossPoints.length === 2) {
            return arc(guideVector, crossPoints, this.center);
        }
        else {
            return circle(guideVector, aoRadius, this.center);
        }

        /**
         * @param {Number} radius 
         * @param {Vector} center
         * @returns {CircleTask}
         */
        function circle(guideVector, radius, center) {
            const radiusVector = guideVector.rotate(Math.PI).multiply(radius);
            return new CircleTask(-1, radiusVector, center, true);
        }

        /**
         * @param {Vector} guideVector 
         * @param {Vector} crossPoints 
         * @param {Vector} center 
         * @returns {ArcTask}
         */
        function arc(guideVector, crossPoints, center) {
            const first = crossPoints[1];
            const second = center.add(guideVector.multiply(aoRadius));
            const third = crossPoints[0];

            return new ArcTask(-1, [first, second, third], center, false, false, true);
        }
    }


    /**
     * @param {Task | Task[]} tasks 
     */
    _pushTasks(tasks) {
        if (!tasks) {
            return;
        }

        if (Array.isArray(tasks)) {
            for (const task of tasks) {
                const nextID = this.tasks.length;
                task.id = nextID;
                this.tasks.push(task);
            }
        }
        else {
            const nextID = this.tasks.length;
            tasks.id = nextID;
            this.tasks.push(tasks);
        }
    }
    
    _refreshHandles() {
        this.handles = [];
        
        const thisClass = this;

        const moveHandle = new Handle(this.center, 0, "Move", "move_handle", "yellow_move_handle", (newPosV, snappingLines)=>{
            const g = newPosV.subtract(thisClass.center);
            
            thisClass.move_all(g);
            thisClass._refreshSnappingLines();
            
            let alignThis = thisClass.get_align_move(thisClass.snapping_lines, snappingLines);
            
            const alignLines = alignThis[1];
            
            alignThis = alignThis[0];
            thisClass.move_all(alignThis.multiply(-1));
            thisClass._refreshSnappingLines();

            return alignLines;
        }, (newPosV)=>{
            thisClass.points = [newPosV];
            thisClass.draw();
            return true;
        });

        const gml = new Line(this.center, this.bb[0]).as_vector.angle - this.options.Angle.val;

        const rotateHandle = new Handle(thisClass.bb[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", (newPosV, snappingLines)=>{
            let newAngle = new Line(this.center, newPosV).as_vector.angle - gml;
                        
            newAngle = thisClass.get_snap_rotation(newAngle, snappingLines)[0];
            thisClass.options.Angle.val = newAngle;
            
            delete this.calculated_drawing_points;
            
            thisClass.draw();    
        }, (newAngle)=>{
            return thisClass.set_new_val(thisClass.options.Angle, newAngle);
        }, "deg");


        this.handles.push(moveHandle);
        this.handles.push(rotateHandle);
    }

    /**
     * @param {Vector} guideVector 
     */
    _refreshBoundingBox(guideVector) {
        this.bb = [];
        
        let bbLength = 0;
        let bbWidth = 0;

        if (this.options.paintAo.val) {
            bbLength = this.options.aoRadius.val;
        }
        if (this.options.paintNgaPou.val 
        &&  this.options.ngaPouRadius.val + this.options.ngaPouRadius.val > bbLength) {
                bbLength = this.options.ngaPouRadius.val + this.options.ngaPouRadius.val;
        }
        if (this.options.rotoRadius.val > bbLength) {
                bbLength = this.options.rotoRadius.val;
        }
        if (this.options.paweroRadius.val > bbLength) {
                bbLength = this.options.paweroRadius.val;
        }
        if (this.options.paintWairua.val 
        &&  this.options.wairuaRadius.val > bbLength) {
                bbLength = this.options.wairuaRadius.val;
        }

        if (this.options.paintSubsBoxes.val) {
            bbWidth = this.options.subsBoxDistance.val + this.options.subsBoxDepth.val;
        }
        if (this.options.paintAo.val 
        &&  this.options.aoRadius.val > bbWidth) {
            bbWidth = this.options.aoRadius.val;
        }
        if (this.options.paintNgaPou.val 
        &&  this.options.ngaPouDistance.val + this.options.ngaPouRadius.val > bbWidth) {
            bbWidth = this.options.ngaPouDistance.val + this.options.ngaPouRadius.val;
        }
        if (this.options.rotoRadius.val > bbWidth) {
            bbWidth = this.options.rotoRadius.val;
        }
        if (this.options.paweroRadius.val > bbWidth) {
            bbWidth = this.options.paweroRadius.val;
        }
        if (this.options.paintWairua.val 
        && this.options.wairuaRadius.val > bbWidth) {
            bbWidth = this.options.wairuaRadius.val;
        }
        if (this.options.paintMarama.val 
        && this.options.maramaRadius.val > bbWidth) {
            bbWidth = this.options.maramaRadius.val;
        }

        const rotatedVector = guideVector.rotate_90_cw();
        const p1 = this.center.add(guideVector.multiply(bbLength)).add(rotatedVector.multiply(bbWidth));
        const p2 = this.center.subtract(guideVector.multiply(bbLength)).add(rotatedVector.multiply(bbWidth));
        const p3 = this.center.subtract(guideVector.multiply(bbLength)).subtract(rotatedVector.multiply(bbWidth));
        const p4 = this.center.add(guideVector.multiply(bbLength)).subtract(rotatedVector.multiply(bbWidth));

        this.bb.push(p1);
        this.bb.push(p2);


        if (this.maramaExtendsBeyondAo) {
            const maramaExtend = this.options.maramaDistance.val + this.options.maramaRadius.val + 0.5 * this.options.LineWidth.val;
            this.bb.push(this.center.subtract(guideVector.multiply(maramaExtend)));
        }

        this.bb.push(p3);
        this.bb.push(p4);
    }
    
    _refreshSnappingLines() {
        this.snapping_lines = [];

        for (const [i, point] of this.bb.entries()) {
            let iPlusOne = i + 1;

            if (iPlusOne === this.bb.length) {
                iPlusOne = 0;
            }

            this.snapping_lines.push(new Line(this.bb[i], this.bb[iPlusOne]))
        }
    }

    /**
     * @param {Vector} guideVector 
     */
    _refreshTestRun(guideVector) {
        this.test_tasks = [];
        
        const thisClass = this;

        if (this.options.paintSubsBoxes.val) {
            const distance = this.options.subsBoxDistance.val + this.options.subsBoxDepth.val;
            const length = this.options.subsBoxLength.val;
            
            let rotatedVector = guideVector.rotate_90_cw();
            let point;

            point = this.center.subtract(rotatedVector.multiply(distance)).add(guideVector.multiply(0.5 * length));
            _push(new WaypointTask(-1, point, false, false));

            point = this.center.subtract(rotatedVector.multiply(distance)).subtract(guideVector.multiply(0.5 * length));
            _push(new WaypointTask(-1, point, false, false));
            
            point = this.center.add(rotatedVector.multiply(distance)).subtract(guideVector.multiply(0.5 * length));
            _push(new WaypointTask(-1, point, false, false));

            point = this.center.add(rotatedVector.multiply(distance)).add(guideVector.multiply(0.5 * length));
            _push(new WaypointTask(-1, point, false, false));
        }
                
        if (this.maramaExtendsBeyondAo) {
            const maramaExtent = this.options.maramaDistance.val + this.options.maramaRadius.val;
            const point = this.center.subtract(guideVector.multiply(maramaExtent));
            _push(new WaypointTask(-1, point, false, false));
        }

        if (this.options.paintAo.val) {
            const maramaTask = this.maramaTask(guideVector);
            _push(this.aoTask(guideVector, maramaTask));
        }
        else if (this.options.paintNgaPou.val) {
            const ngaPouTasks = this.ngaPouTasks(guideVector, true);
            for (const task of ngaPouTasks) {
                const end = task.end;
                _push(new WaypointTask(-1, task.end, false, false));
            }
        }
        else {
            _push(this.rotoTask(guideVector));
        }

        /**
         * 
         * @param {Task} task 
         */
        function _push(task) {
            task.id = thisClass.test_tasks.length;
            task.paint = false;
            thisClass.test_tasks.push(task);
        }
    }

    _setLength() {
        let length = 0;

        if (this.options.paintAo.val) {
            length = 2 * this.options.aoRadius.val;
        }
        else if (this.options.paintNgaPou.val) {
            length = 2 * (this.options.ngaPouDistance.val + this.options.ngaPouRadius.val);
        }
        else {
            const radius = this.options.rotoRadius.val > this.options.paweroRadius.val ? this.options.rotoRadius.val : this.options.paweroRadius.val;
            length = 2 * radius;
        }
                
        if (this.options.paintMarama.val) {
            if (!this.options.paintAo.val || this.maramaExtendsBeyondAo) {
                length = length / 2 + this.options.maramaDistance.val + this.options.maramaRadius.val;
            }
        }
        
        length += this.options.LineWidth.val;

        this.options.Length.val = length;
    }

    _setWidth() {
        let width = 0;
        
        if (this.options.paintSubsBoxes.val) {
            width = 2 * (this.options.subsBoxDistance.val + this.options.subsBoxDepth.val);
        }
        else if (this.options.paintAo.val) {
            width = 2 * this.options.aoRadius.val;
        }
        else if (this.options.paintNgaPou.val) {
            width = 2 * (this.options.ngaPouDistance.val + this.options.ngaPouRadius.val);
        }
        else {
            const radius = this.options.rotoRadius.val > this.options.paweroRadius.val ? this.options.rotoRadius.val : this.options.paweroRadius.val;
            width = 2 * radius;
        }
        
        width += this.options.LineWidth.val;
        
        this.options.Width.val = width;
    }
}