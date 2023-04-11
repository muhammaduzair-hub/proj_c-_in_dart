
class WelshBaseballLadies extends square_pitch_dont_resize {

    static template_type = "Baseball";
    static template_title = "Welsh Ladies'";
    static template_id = "baseball_welsh_ladies_dev"; // CHANGE THIS
    static template_image = "img/templates/WelshBaseball.png";
    constructor ( id, name, layout_method) {
        super(id, name, layout_method);


        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;


        this.options.Length.val = (56).foot2meter();
        this.options.Width.val = (56).foot2meter();


        this.options.prompterLength = {
            name: "Prompter box length",
            val: (4).foot2meter(),
            type: "float",
            configurable: false,
        }

        this.options.prompterWidth = {
            name: "Prompter box Width",
            val: (4).foot2meter(),
            type: "float",
            configurable: false,
        }

        this.options.bowlingBoxLength = {
            name: "Bowling Box Length",
            val: (9).foot2meter(),
            type: "float",
            configurable: false,
        }

        this.options.bowlingBoxWidth = {
            name: "Bowling Box Width",
            val: (2).foot2meter(),
            type: "float",
            configurable: false,
        }

        this.options.battingCreaseLength = {
            name: "Batting Crease Length",
            val: (2).foot2meter(),
            type: "float",
            configurable: false,
        }
        this.options.sideCut = {
            name: "The cut on the top right side",
            val: (12).foot2meter(),
            type: "float",
            configurable: false,
        }
        this.options.distanceBetweemBoxs = {
            name: "The distance between the small and big boxs",
            val: (15).foot2meter(),
            type: "float",
            configurable: false,
        }


    }


    static get layout_methods(){
        return { 
            "free_hand": 0
        }
    }

    get center() {
        return this.points[0];
    }


    // Drawing the reactangle and the little box
    drawBoxs(center, boxHeight, boxWidth, angle){

        const vertical = angle;
        let horizontal = vertical.rotate_90_cw();

        /* The corners */
        // const topHorizontalStart = center.add(vertical.multiply(0.5 * boxHeight)).subtract(horizontal.multiply( 0.5 * boxWidth + this.options.LineWidth.val / 2));
        // const topHorizontalEnd = center.add(vertical.multiply(0.5 * boxHeight)).add(horizontal.multiply( 0.5 * boxWidth + this.options.LineWidth.val / 2 ));
        // // const line = new Line(topHorizontalStart, topHorizontalEnd).length;
        // // console.log("Line width: ", this.options.LineWidth.val);
        // // console.log("Line length: ", line);
        // // console.log("Top horizontal end: ", topHorizontalEnd);


        // const rightVerticalStart = center.add(vertical.multiply(0.5 * boxHeight + this.options.LineWidth.val / 2 )).add(horizontal.multiply( 0.5 * boxWidth));
        // const rightVerticalEnd = center.subtract(vertical.multiply(0.5 * boxHeight + this.options.LineWidth.val / 2 )).add(horizontal.multiply(0.5 * boxWidth));
       
        // const bottomHorizontalStart = center.subtract(vertical.multiply(0.5 * boxHeight )).add(horizontal.multiply(0.5 * boxWidth + this.options.LineWidth.val / 2 ));
        // const bottomHorizontalEnd = center.subtract(vertical.multiply(0.5 * boxHeight )).subtract(horizontal.multiply(0.5 * boxWidth + this.options.LineWidth.val / 2 ));

        // const leftVerticalStart = center.subtract(vertical.multiply(0.5 * boxHeight + this.options.LineWidth.val / 2)).subtract(horizontal.multiply(0.5 * boxWidth ));
        // const leftVerticalEnd = center.add(vertical.multiply(0.5 * boxHeight + this.options.LineWidth.val / 2)).subtract(horizontal.multiply(0.5 * boxWidth ));


        /* Test uden halve linje */
        const topHorizontalStart = center.add(vertical.multiply(0.5 * boxHeight)).subtract(horizontal.multiply( 0.5 * boxWidth ));
        const topHorizontalEnd = center.add(vertical.multiply(0.5 * boxHeight)).add(horizontal.multiply( 0.5 * boxWidth ));

        const rightVerticalStart = center.add(vertical.multiply(0.5 * boxHeight )).add(horizontal.multiply( 0.5 * boxWidth));
        const rightVerticalEnd = center.subtract(vertical.multiply(0.5 * boxHeight )).add(horizontal.multiply(0.5 * boxWidth));
       
        const bottomHorizontalStart = center.subtract(vertical.multiply(0.5 * boxHeight )).add(horizontal.multiply(0.5 * boxWidth ));
        const bottomHorizontalEnd = center.subtract(vertical.multiply(0.5 * boxHeight )).subtract(horizontal.multiply(0.5 * boxWidth ));

        const leftVerticalStart = center.subtract(vertical.multiply(0.5 * boxHeight )).subtract(horizontal.multiply(0.5 * boxWidth ));
        const leftVerticalEnd = center.add(vertical.multiply(0.5 * boxHeight )).subtract(horizontal.multiply(0.5 * boxWidth ));

        this.start_locations.push( new StartLocation( topHorizontalStart, this.tasks.length )); 
        this.tasks.push(new LineTask(this.tasks.length, [topHorizontalStart, topHorizontalEnd], false, true));        
        this.tasks.push(new LineTask(this.tasks.length, [rightVerticalStart, rightVerticalEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [bottomHorizontalStart, bottomHorizontalEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [leftVerticalStart, leftVerticalEnd], false, true));



        return;
    }


    drawBox(center, boxLength, boxWidth, sideCut, angle) {

        const vertical  = angle;
        let horizontal = vertical.rotate_90_cw();

        // The corners

        const topLeftCornerStart = center.add(vertical.multiply(0.5 * boxLength )).subtract(horizontal.multiply(0.5 * boxWidth ));
        const topRightCornerStart = center.add(vertical.multiply(0.5 * boxLength )).add(horizontal.multiply(0.5 * boxWidth));
        const bottomRightCornerStart = center.subtract(vertical.multiply(0.5 * boxLength )).add(horizontal.multiply(0.5 * boxWidth ));
        const bottomLeftCornerStart = center.subtract(vertical.multiply(0.5 * boxLength )).subtract(horizontal.multiply(0.5 * boxWidth ));

        const newTopLeftCornerStart = center.subtract(horizontal.multiply(0.5 * boxWidth - sideCut)).add(vertical.multiply(0.5 * boxLength));



        // if(sideCut != null){
        //     const newTopLeftCornerStart = center.subtract(horizontal.multiply(0.5 * boxWidth - sideCut)).add(vertical.multiply(0.5 * boxLength));
        //     this.tasks.push(new LineTask(this.tasks.length, [newTopLeftCornerStart, topRightCornerStart], false, true));
        // }
        // else
        //     this.tasks.push(new LineTask(this.tasks.length, [topLeftCornerStart, topRightCornerStart], false, true));
        this.start_locations.push( new StartLocation( newTopLeftCornerStart, this.tasks.length )); 
        this.tasks.push(new LineTask(this.tasks.length, [newTopLeftCornerStart, topRightCornerStart], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [topRightCornerStart, bottomRightCornerStart], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [bottomRightCornerStart, bottomLeftCornerStart], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [bottomLeftCornerStart, topLeftCornerStart], false, true));

        return;
    }


    draw() {

        delete this.calculated_drawing_points;
        this.tasks = [ ];
        this.start_locations = [ ];
        const center = this.center;


        // Boxs angle
        const horizontal = new Vector(0, 1).rotate(this.options.Angle.val);
        const vertical = horizontal.rotate_90_cw();

        // Drawing the reactangle inside the big box
        const horizontal45degree = horizontal.rotate((45).deg2rad());  // The start angle 
        const bowlingBoxCenter = center.subtract(horizontal45degree.multiply(this.options.bowlingBoxLength.val/2));
        this.drawBoxs(bowlingBoxCenter, this.options.bowlingBoxLength.val, this.options.bowlingBoxWidth.val, horizontal45degree);

        // Drawing the big box
        this.drawBox(center, this.options.Length.val, this.options.Width.val, this.options.sideCut.val, horizontal);


        // The line over the top corner of the bigbox
        const vertical45degree = horizontal45degree.rotate_90_cw();
        const topCorner = center.add(horizontal.multiply( this.options.Length.val / 2)).subtract(vertical.multiply( this.options.Width.val / 2));
        const rightSide = topCorner.add(vertical45degree.multiply( 0.5 * this.options.battingCreaseLength.val));
        const leftSide = topCorner.subtract(vertical45degree.multiply( 0.5 * this.options.battingCreaseLength.val));
        this.tasks.push(new LineTask(this.tasks.length, [rightSide, leftSide], false, true));


        // Drawing the small box on the left side of the big box
        const prompterCenter = center.subtract(vertical.multiply( 0.5 * (this.options.Length.val + this.options.prompterWidth.val) + this.options.distanceBetweemBoxs.val ));
        this.drawBoxs(prompterCenter, this.options.prompterLength.val, this.options.prompterWidth.val, horizontal);

        
        this.refresh_bb();
        this.refresh_handles();
        this.refresh_test_run();
        this.refresh_snapping_lines();     

    }

    convert_to_free_hand() {
    }

}


class WelshBaseballMen extends WelshBaseballLadies
{
    static template_type = "Baseball";
    static template_title = "Welsh Men's";
    static template_id = "baseball_welsh_men_dev"; // CHANGE THIS
    static template_image = "img/templates/WelshBaseball.png";
    constructor ( id, name, layout_method) {
        super(id, name, layout_method);



        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;


        this.options.Length.val = (66).foot2meter();
        this.options.Width.val = (66).foot2meter();

        this.options.prompterLength.val = (4).foot2meter();
        this.options.prompterWidth.val = (4).foot2meter();

        this.options.bowlingBoxLength.val = (11).foot2meter();
        this.options.bowlingBoxWidth.val = (3).foot2meter();

        this.options.battingCreaseLength.val = (3).foot2meter();

        this.options.sideCut.val = (15).foot2meter();

    }



    draw() {


        delete this.calculated_drawing_points;
        this.tasks = [ ];
        this.start_locations = [ ];
        const center = this.center;

        // Boxs angle
        const horizontal = new Vector(0, 1).rotate(this.options.Angle.val);
        const vertical = horizontal.rotate_90_cw();


        // Drawing the bowlingbox / reactagnle inside the big box
        const horizontal45degree = horizontal.rotate((45).deg2rad());
        const bowlingBoxCenter = center.subtract(horizontal45degree.multiply(this.options.bowlingBoxLength.val/2));
        this.drawBoxs(bowlingBoxCenter, this.options.bowlingBoxLength.val, this.options.bowlingBoxWidth.val, horizontal45degree);

         this.start_locations.push( new StartLocation( bowlingBoxCenter, this.tasks.length )); 

        // Drawing the big box
        this.drawBox(center, this.options.Length.val, this.options.Width.val, this.options.sideCut.val, horizontal);


        // The line over the top corner
        const vertical45degree = horizontal45degree.rotate_90_cw();
        const topCorner = center.add(horizontal.multiply( this.options.Length.val / 2)).subtract(vertical.multiply( this.options.Width.val / 2));
        const rightSide = topCorner.add(vertical45degree.multiply( 0.5 * this.options.battingCreaseLength.val));
        const leftSide = topCorner.subtract(vertical45degree.multiply( 0.5 * this.options.battingCreaseLength.val));
    
        this.tasks.push(new LineTask(this.tasks.length, [leftSide, rightSide], false, true));


        // Drawing the  prompter's / small box on the left or right side of the big box
        const prompterCenter = center.add(horizontal.multiply( 0.5 * (this.options.Length.val + this.options.prompterWidth.val) + this.options.distanceBetweemBoxs.val ));
        this.drawBoxs(prompterCenter, this.options.prompterLength.val, this.options.prompterWidth.val, horizontal);


        this.refresh_bb();
        this.refresh_handles();
        this.refresh_test_run();
        this.refresh_snapping_lines();   

    }

    convert_to_free_hand() {
    }


}

