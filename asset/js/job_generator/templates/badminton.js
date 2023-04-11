
class Badminton extends square_pitch_dont_resize {
    static template_type = "Badminton";
    static template_title = "Badminton";
    static template_id = "gb_badminton_dev"; // CHANGE THIS
    static template_image = "img/templates/tennis.png";
    constructor(id, name, layout_method) {
        super(id, name, layout_method);

        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;


        this.options.Length.val = 13.40;
        this.options.Width.val = 6.10;


        this.options.twoMensSideWidth = {
            name: "Two men's side width",
            configurable: false,
            val: 0.42,
            type: "float",
        }
        this.options.twoMensBackSideWidth = {
            name: "Two men's back side width",
            configurable: false,
            val: 0.72,
            type: "float",
        }
        this.options.oneSideLength = {
            name: "Side length of one side",
            configurable: false,
            val: 3.880,
            type: "float",
        }
        this.options.oneSideWidth = {
            name: "Side width of one side",
            configurable: false,
            val: 2.530,
            type: "float",
        }
        this.options.spaceUnderNet = {
            name: "The under net - between players",
            configurable: false,
            val: 3.960,
            type: "float",
        }
        this.options.lineUnderNet = {
            name: "Line under net",
            configurable: true,
            val: true,
            type: "bool",
        }


    }

    static get layout_methods() {
        return {
            "free_hand": 0
        }       
    }

    get center() {
        return this.points[0];
    }

    // get drawing_points(){
    //     console.error("This is a test error!");
    // }

    draw(){

        delete this.calculated_drawing_points;
        this.tasks = [ ];
        this.start_locations = [ ];
        //corners
        let p = this.drawing_points;
        let c1 = p[0];
        let c2 = p[3];
        let c3 = p[4];
        let c4 = p[7];

        // vector guides
        let g1 = new Line( c1, c2 ).unit_vector;
        let g2 = g1.rotate_90_cw();

        // // Outer Lines between points
        // const outerLongC1 = c1.add(g1.multiply( this.options.LineWidth.val / 2)).add(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC2 = c2.subtract(g1.multiply( this.options.LineWidth.val / 2)).add(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC3 = c3.subtract(g1.multiply( this.options.LineWidth.val / 2)).subtract(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC4 = c4.add(g1.multiply( this.options.LineWidth.val / 2)).subtract(g2.multiply(this.options.LineWidth.val / 2));

        const outerLongC1 = c1;
        const outerLongC2 = c2;
        const outerLongC3 = c3;
        const outerLongC4 = c4;

        // End points 
        // const outerLongC1End = c1.add(g1.multiply( this.options.LineWidth.val / 2)).add(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC2End = c2.add(g1.multiply( this.options.LineWidth.val / 2)).add(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC3End = c3.subtract(g1.multiply( this.options.LineWidth.val / 2)).subtract(g2.multiply(this.options.LineWidth.val / 2));
        // const outerLongC4End = c4.add(g1.multiply( this.options.LineWidth.val / 2)).subtract(g2.multiply(this.options.LineWidth.val / 2));

        // Inner lines --> Longside by subtracting 0.42, and shortsides by subtracting 0.76
        const innerLongC1 = outerLongC1.add(g1.multiply(this.options.twoMensSideWidth.val + this.options.LineWidth.val / 2));
        const innerLongC4 = outerLongC4.add(g1.multiply(this.options.twoMensSideWidth.val + this.options.LineWidth.val / 2));
        const innerLongC3 = outerLongC3.subtract(g1.multiply(this.options.twoMensSideWidth.val + this.options.LineWidth.val / 2));
        const innerLongC2 = outerLongC2.subtract(g1.multiply(this.options.twoMensSideWidth.val + this.options.LineWidth.val / 2));

        const innerShortC4 = outerLongC4.subtract(g2.multiply(this.options.twoMensBackSideWidth.val + this.options.LineWidth.val / 2));
        const innerShortC3 = outerLongC3.subtract(g2.multiply(this.options.twoMensBackSideWidth.val + this.options.LineWidth.val / 2));
        const innerShortC2 = outerLongC2.add(g2.multiply(this.options.twoMensBackSideWidth.val + this.options.LineWidth.val / 2));
        const innerShortC1 = outerLongC1.add(g2.multiply(this.options.twoMensBackSideWidth.val + this.options.LineWidth.val / 2));

        // const length2NetSpace = outerLongC1.add(g2.multiply(this.options.twoMensBackSideWidth.val + this.options.LineWidth.val + this.options.LineWidth.val / 2));
        const middleShortC1 = outerLongC1.add(g2.multiply(this.options.twoMensBackSideWidth.val +  this.options.oneSideLength.val + 2 * this.options.LineWidth.val));
        const middleShortC2 = outerLongC2.add(g2.multiply(this.options.twoMensBackSideWidth.val +  this.options.oneSideLength.val + 2 * this.options.LineWidth.val));
        const middleShortC3 = outerLongC3.subtract(g2.multiply(this.options.twoMensBackSideWidth.val +  this.options.oneSideLength.val + 2 * this.options.LineWidth.val));
        const middleShortC4 = outerLongC4.subtract(g2.multiply(this.options.twoMensBackSideWidth.val +  this.options.oneSideLength.val + 2 * this.options.LineWidth.val));

        const netLineStart = outerLongC1.add(g2.multiply(this.options.Length.val / 2));
        const netLineEnd = outerLongC2.add(g2.multiply(this.options.Length.val / 2));

        // start location
        this.start_locations.push( new StartLocation( c1, this.tasks.length ) );   //If robot has to start from the closest corner...
        this.tasks.push(new LineTask(this.tasks.length, [outerLongC1, outerLongC2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [outerLongC2, outerLongC3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [outerLongC3, outerLongC4], false, true));    
        this.tasks.push(new LineTask(this.tasks.length, [outerLongC4, outerLongC1], false, true));

        this.tasks.push(new LineTask(this.tasks.length, [innerLongC1, innerLongC4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [innerShortC4, innerShortC3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [innerLongC3, innerLongC2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [innerShortC2, innerShortC1], false, true));

        this.tasks.push(new LineTask(this.tasks.length, [middleShortC1, middleShortC2], false, true));
        if(this.options.lineUnderNet.val)
            this.tasks.push(new LineTask(this.tasks.length, [netLineStart, netLineEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [middleShortC4, middleShortC3], false, true));


        // Middle lines on the long direction where the space under net is subtracted 
        const halfWidth = (this.options.twoMensSideWidth.val + this.options.oneSideWidth.val + 2 * this.options.LineWidth.val);
        const halfLength = (this.options.twoMensBackSideWidth.val +  this.options.oneSideLength.val + 2 * this.options.LineWidth.val);

        const outerLineBetweenTeamatesRight = outerLongC1.add(g1.multiply(halfWidth));
        const innerLineBetweenTeamatesRight = outerLongC1.add(g2.multiply(halfLength)).add(g1.multiply(halfWidth)); 
        const outerLineBetweenTeamatesLeft = outerLongC4.add(g1.multiply(halfWidth));
        const innerLineBetweenTeamatesLeft = outerLongC4.subtract(g2.multiply(halfLength)).add(g1.multiply(halfWidth));                    // The space under Net

        this.tasks.push(new LineTask(this.tasks.length, [outerLineBetweenTeamatesLeft, innerLineBetweenTeamatesLeft], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [innerLineBetweenTeamatesRight, outerLineBetweenTeamatesRight], false, true));


        // this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
        // this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));



        this.refresh_bb();
        this.refresh_handles();
        this.refresh_test_run();
        this.refresh_snapping_lines();             

    }


    drawPoints(){

        const points = this.drawing_points;

        for (let point of points ){
            this.tasks.push(new WaypointTask(this.tasks.length, point, false, true));
        }

    }


    convert_to_free_hand() {
    }

}