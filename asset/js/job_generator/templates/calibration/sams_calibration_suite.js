

class SamsCalibrationSuite extends square_pitch {
    static template_type = "Calibration";
    constructor(id, name, layout_methods) {
        super (id, name, layout_methods);

            this.options["Right goal pole"].configurable = false;
            this.options["Left goal pole"].configurable = false;
    }
}

class SamsCorner extends SamsCalibrationSuite {
    static template_id = "sams_corner";
    static template_title = "Sam's corner";
    static template_image = "img/templates/sams_corner_black.png";
    constructor(id, name, layout_methods) {
        super(id, name, layout_methods);


        this.options.Length.val = 3;
        this.options.Width.val = 3;
        
        this.options.CornerRadius = {
            name: "CornerRadius",
            val: 1.0,
            type: "float",
            adjustable: true
          };
    }

    draw() {
        this.tasks = [];
        this.start_locations = [];

        var p = this.drawing_points;
        var c1 = p[0];
        var c2 = p[3];
        var g1 = new Line(c1, c2).unit_vector;
        var g2 = g1.rotate_90_cw();
        var c3 = p[4];
        var c4 = p[7];
                
        var l1Start = c1;
        var l1End = c2.add(g1.multiply(this.options.LineWidth.val));

        var l2Start = c4.add(g2.multiply(this.options.LineWidth.val));
        var l2End = c1;

        var cornerRadius = this.options.CornerRadius.val;
        var circleCenter = c1.subtract(g1.multiply(this.options.LineWidth.val / 2)).subtract(g2.multiply(this.options.LineWidth.val));
        var curveStart = l1Start.add(g1.multiply(this.options.LineWidth / 2)).add(g2.multiply(cornerRadius));
        var curveEnd = l1Start.add(g2.multiply(this.options.LineWidth / 2)).add(g1.multiply(cornerRadius));; 
        var midpoint = new Line(curveStart, curveEnd).middle;
        var cornerVector = new Line(circleCenter, midpoint).unit_vector;
        var curveMiddle = circleCenter.add(cornerVector.multiply(cornerRadius));

        this.start_locations.push(new StartLocation(l1Start, this.tasks.length));
        this.tasks.push(new LineTask(this.tasks.length, [l1Start, l1End], false, true));

        this.start_locations.push(new StartLocation(l2Start, this.tasks.length));
        this.tasks.push(new LineTask(this.tasks.length, [l2Start, l2End], false, true));

        this.start_locations.push(new StartLocation(curveStart, this.tasks.length));
        this.tasks.push(new ArcTask(this.tasks.length, [curveStart, curveMiddle, curveEnd], circleCenter, false, false, true));
        
        this.refresh_bb();
        this.refresh_handles();
        this.refresh_test_run();
        this.refresh_snapping_lines();
    }

    refresh_handles() {
        this.handles = [];

        var this_class = this;
        var p = this.drawing_points;
        var gml;
        
        this.handles.push(new Handle( this.center, 0, "Move", "move_handle", "yellow_move_handle", (new_pos_v, snapping_lines) => {
            this.points = [new_pos_v];
            var align = this.get_align_move(this.snapping_lines, snapping_lines);
            
            align = align[0];
            this.points = [ new_pos_v.subtract(align) ];
            
            delete this.calculated_drawing_points;
            this.draw();
            
            return true;
        }));

        gml = new Line(this.center, p[0]).as_vector.angle - this.options.Angle.val;
        this.handles.push(new Handle(p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", (new_pos_v, snapping_lines) => {
            var new_angle = new Line(this.center, new_pos_v).as_vector.angle - gml;
            
            new_angle = this.get_snap_rotation(new_angle, snapping_lines)[0];

            this.options.Angle.val = new_angle;
            
            delete this.calculated_drawing_points;
            this.draw();

        }, (new_angle) => {
            return this.set_new_val(this.options.Angle, new_angle);
        }, "deg"));

        this.handles.push( new Handle( new Line( p[3], p[4] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", ( new_pos_v, snapping_lines ) =>
        {
            var g = new Line( p[0], p[3] );
            var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
            
            if (new_width < this_class.options.CornerRadius.val) {
                new_width = this_class.options.CornerRadius.val;
            }
            
            this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
         
            delete this_class.calculated_drawing_points;
            this_class.draw();

            }, (new_width) =>
            {
                return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
        }));

        this.handles.push( new Handle( new Line( p[7], p[4] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", ( new_pos_v, snapping_lines ) =>
        {
            var g = new Line( p[0], p[7] );
            var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );

            if (new_length < this_class.options.CornerRadius.val) {
                new_length = this_class.options.CornerRadius.val;
            }
            
            this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
    
            delete this_class.calculated_drawing_points;
            this_class.draw();

            }, (new_length) =>
            {
                return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
        }));
    }

    static get layout_methods() {
        return {
            "free_hand": 0
        }
    }   
}

class SamsLadder extends SamsCalibrationSuite {
    static template_title = "ladder";
    static template_id = "sams_ladder"
    static template_image = "img/templates/sams_calibration_suite_black.png";
    constructor(id, name, layout_methods) {
        super(id, name, layout_methods);

        this.options.Length = 9;
        this.options.width = 3;
    }

    draw() {
        console.log(`IMPLEMENT SAM'S LADDER.`);
    }
}