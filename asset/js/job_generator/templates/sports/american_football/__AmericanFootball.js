class __AmericanFootball extends square_pitch {
    static template_type = "Football";
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;
        this.options.NegativeLineWidth.val = true;
        this.options.Length.val = (360).foot2meter();
        this.options.Width.val = (160).foot2meter();
        const this_class = this;

        this.options.doubleCenterYard = {
            configurable: true,
            name: "Double center yard",
            val: true,
            type: "bool",
        };
        this.options.scalingYardLines = {
            configurable: true, 
            name: "Scaling field by yard lines",
            val: true,
            type: "bool",
            prev_sibling: "doubleCenterYard",
        };
        this.options.paintForthAndBack = {
            configurable: true, 
            name: "Paint forth and back",
            val: false,
            type: "bool",
            prev_sibling: "scalingYardLines",
        };
        this.options.endZone = {
            configurable: true,
            name: "End zone",
            _val: true,
            get val(){
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(!v) {
                    this_class.options.nitroLines.val = false;
                }else {
                    this_class.options.nitroLines.val = true;
                }
            },
            type: "bool",
            prev_sibling: "paintForthAndBack",
        };

        this.options.endZoneWidth = {
            get configurable()
            {
                return this_class.options.endZone.configurable;
            },
            name: "End zone width",
            val: (30).foot2meter(),
            type: "float",
            prev_sibling: "endZone",
        };
        this.options.nitroLines = {
            get configurable()
            {
                return this_class.options.endZone.val;
            },
            name: "Nitro lines",
            _val: true,
            get val(){
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.nitroLinesLength.configurable = true;
                }else {
                    this_class.options.nitroLinesLength.configurable = false;
                }
            },
            type: "bool",
            prev_sibling: "endZoneWidth",
        };
        this.options.nitroLinesLength = {
            configurable: true,
            name: "Nitro lines length",
            val: this_class.options.endZoneWidth.val,
            type: "float",
            prev_sibling: "nitroLines",
        };
        this.options.wideSideLines = {
            configurable: true,
            name: "Wide side lines",
            val: true,
            type: "bool",
            prev_sibling: "nitroLinesLength",
        };
        this.options.numberOfWideLines = {
            get configurable () 
            {
                return this_class.options.wideSideLines.val;
            },
            name:"Number of wide lines",
            _val: 1,
            type: "int",
            units: "number",
            get val() {
                return this._val;
            },
            set val(v) {
                if(v > 10 || v < 0) {
                    return;
                }
                else {
                    this._val = v;
                }
            },
            prev_sibling: "wideSideLines",
        };
        this.options.threeYardLine = {
            configurable: true,
            name: "Three yard line",
            val: true,
            type: "bool",
            prev_sibling: "numberOfWideLines",
        };
        this.options.threeYardLineLength = {
            get configurable()
            {
                return this_class.options.threeYardLine.val;
            },
            name: "Three yard line length",
            val: (1).yard2meter(),
            type: "float",
            prev_sibling: "threeYardLine",
        };
        this.options.threeYardLineToGoalLine = {
            get configurable()
            {
                return this_class.options.threeYardLine.val;
            },
            name: "Three yard lines space to goal line",
            val: (3).yard2meter(),
            type: "float",
            prev_sibling: "threeYardLineLength",
        };
        this.options.driveAroundGoal = {
            get configurable()
            {
                return this_class.options.endZone.val;
            },
            name: "Drive around goal",
            val: true,
            type: "bool",
            prev_sibling: "threeYardLineToGoalLine",
        };
        this.options.goalWidth = {
            get configurable()
            {
                return this_class.options.driveAroundGoal.val;
            },
            name: "Goal width",
            val: (18).foot2meter() + (6).inch2meter(),
            type: "float",
            prev_sibling: "driveAroundGoal",
        };
        this.options.goalTypeH = {
            get configurable()
            {
                return this_class.options.driveAroundGoal.val && this_class.options.driveAroundGoal.configurable;
            },
            name: "Goal type H",
            _val: true,
            type: "bool",

            get val() {
                return this._val;
            },
            set val (v) {
                this._val = v;
                if(v === true) {
                    this_class.options.goalTypeY.val = false;
                    this_class.options.goalTypeGosseNeck.val = false;
                }
            },
            prev_sibling: "goalWidth",
        };
        this.options.goalTypeY = {
            get configurable()
            {
                return this_class.options.driveAroundGoal.val && this_class.options.driveAroundGoal.configurable;
            },
            name: "Goal type Y",
            _val: false,
            type: "bool",

            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v === true) {
                    this_class.options.goalTypeH.val = false;
                    this_class.options.goalTypeGosseNeck.val = false;
                }
            },
            prev_sibling: "goalTypeH",
        };
        this.options.goalTypeGosseNeck = {
            get configurable()
            {
                return this_class.options.driveAroundGoal.val && this_class.options.driveAroundGoal.configurable;
            },
            name: "Goal type goose neck",
            _val: false,
            type: "bool",

            get val() {
                return this._val;
            },
            set val (v) {
                this._val = v;
                if(v === true) {
                    this_class.options.goalTypeY.val = false;
                    this_class.options.goalTypeH.val = false;
                    this_class.options.gosseNeckDistanceToSideLine.configurable = true;
                }
                else {
                    this_class.options.gosseNeckDistanceToSideLine.configurable = false;
                }
            },
            prev_sibling: "goalTypeY",
        };
        this.options.gosseNeckDistanceToSideLine = {
            _configurable: this_class.options.goalTypeGosseNeck.val && this_class.options.goalTypeGosseNeck.configurable,
            get configurable() {
                return this._configurable;
            },
            set configurable(v) {
                this._configurable = v;
            },
            name: "Gosse neck distance",
            _val: (0).foot2meter(),
            type: "float",

            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "goalTypeGosseNeck",
        }

        this.options.goalPoleWidth = {
            configurable: false,
            name: "Goal pole width",
            val: (6).inch2meter(),
            type: "float",
        };
        this.options.hashMarks = {
            configurable: true,
            name: "Vertical hash markers",
            val: true,
            type: "bool",
            prev_sibling: "gosseNeckDistanceToSideLine",
        };
        this.options.hashMarksLength = {
            get configurable()
            {
                return this_class.options.hashMarks.val;
            },
            name: "Hash markers length",
            val: (1).yard2meter(),
            type: "float",
            prev_sibling: "hashMarks",
        };
        this.options.sideHashMarks = {
            get configurable()
            {
                return this_class.options.hashMarks.val;
            },
            name: "Side hash markers",
            val: true,
            type: "bool",
            prev_sibling: "hashMarksLength",
        };
        this.options.sideHashMarksSpaceToSideline = {
            get configurable()
            {
                return this_class.options.hashMarks.val;
            },
            name: "Hash marks to side line",
            val: (4).inch2meter(),
            type: "float",
            prev_sibling: "sideHashMarks",
        };
        this.options.middleHashMarks = {
            get configurable()
            {
                return this_class.options.hashMarks.val;
            },
            name: "Middle hash markers",
            _val: true,           
            type: "bool",
            get val() {
                return this._val;
            },
            set val (v) {
                this._val = v;

            },
            prev_sibling: "sideHashMarksSpaceToSideline",

        };
        this.options.middleHashMarksSpaceToSideline = {
            get configurable()
            {
                return this_class.options.hashMarks.val && this_class.options.middleHashMarks.val;
            },
            name: "Middle hash markers to side line",
            val: ((60).foot2meter() - this_class.options.hashMarksLength.val),
            type: "float",
            prev_sibling: "middleHashMarks",

        };
        this.options.horizontalHashmarks = {
            configurable: true,
            name: "Tick markers",
            val: true,
            type: "bool",
            prev_sibling: "middleHashMarksSpaceToSideline",
        };
        this.options.horizontalHashmarksToSideline = {
            get configurable()
            {
                return this_class.options.horizontalHashmarks.val;
            },
            name: "Tick markers to side line",
            _val: (45).foot2meter(),
            type: "float",

            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "horizontalHashmarks",
        };
        this.options.yardLines = {
            configurable: true,
            name: "Yard lines",
            val: true,
            type: "bool",
            prev_sibling: "horizontalHashmarksToSideline",
        };
        this.options.numberOfYardLines = {
            get configurable () 
            {
                return (!this_class.options.scalingYardLines.val && this_class.options.yardLines.val) ? true : false;
            },
            name:"Number of yard lines",
            _val: 20,
            type: "int",
            units: "number",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "yardLines",
        };

        this.options.yardLinesSpace = {
            get configurable()
            {
                return (this_class.options.yardLines.val && this_class.options.scalingYardLines.val) ? true: false;
            },
            name: "Space between yard lines",
            val: (5).yard2meter(),
            type: "float",
            prev_sibling: "yardLines",
        };
        this.options.hashMarksSpace = {
            configurable: false,
            name: "Space between hash markers",
            val: this_class.options.yardLinesSpace.val / 5,
            type: "float",
            prev_sibling: "yardLinespace",
        };
        this.options.yardLinesSpaceToSideline = {
            get configurable()
            {
                return (this_class.options.yardLines.val && this_class.options.scalingYardLines.val) ? true: false;
            },
            name: "Yard lines to side lines",
            _val: (4).inch2meter(),
            type: "float",
            get val() {
                return this._val;
            },
            set val(v) {
                if(v > (6).inch2meter() || v < 0) {
                    return;
                }
                else{
                    this._val = v;
                }
            },
            prev_sibling: "yardLinesSpace",
        };
        this.options.teamBoxStandard = {
            configurable: true,
            name: "Team box standard",
            _val: true,
            type: "bool",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.teamBoxHighschool.val = false;
                    this_class.options.teamBoxClosed.configurable = true;
                }
                else{
                    this_class.options.teamBoxClosed.configurable = false;
                }
            },
            prev_sibling: "yardLinesSpaceToSideline",
        };
        this.options.teamBoxClosed = {
            configurable: true,
            name: "Closed team box",
            val: true,
            type: "bool",
            prev_sibling: "teamBoxStandard",
        };
        this.options.teamBoxHighschool = {
            configurable: true,
            name: "Highschool team box",
            _val: false,
            type: "bool",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.teamBoxStandard.val = false;
                    this_class.options.teamBoxClosed.configurable = false;
                }
            },
            prev_sibling: "teamBoxClosed",
        };
        this.options.teamBoxLength = {
            configurable: false,
            name: "Team box length",
            val: (30).yard2meter(),
            type: "float",
            prev_sibling: "teamBoxHighschool",
        };
        this.options.teamBoxWidth = {
            get configurable(){
                return (this_class.options.teamBoxStandard.val || this_class.options.teamBoxHighschool.val) ? true : false;
            },
            name: "Team box width",
            val: (8).yard2meter(),
            type: "float",
            prev_sibling: "teamBoxLength",
        };
        this.options.teamBoxToEndzone = {
            configurable: true,
            name: "Team box to endzone",
            _val: 4,
            type: "int",
            units: "number",
            get val() {
                return this._val;
            },
            set val(v) {
                if(v > 6 && v < 1) {
                    return;
                }
                else {
                    this._val = v;
                }
            },
            prev_sibling: "teamBoxLength",
        };
        this.options.teamBoxToSideline = {
            get configurable() {
                return (this_class.options.teamBoxStandard.val || this_class.options.teamBoxHighschool.val) ? true : false;
            },
            name: "Team box to side line",
            _val: (2).yard2meter(),
            type: "float",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "teamBoxToEndzone",
        };
        this.options.coachAreaWidth = {
            get configurable() {
                return this_class.options.teamBoxStandard.val;
            },
            name: "Coach area width",
            _val: (2).yard2meter(),
            type: "float",
            get val(){
                return this._val;
            },
            set val(v){
                this._val = v;
            },
            prev_sibling: "teamBoxToSideline",
        }
        this.options.centerCross = {
            configurable: true,
            name: "Center cross",
            val: false,
            type: "bool",
            prev_sibling: "coachAreaWidth"
        };
        this.options.centerCrossLength = {
            get configurable()
            {
                return this_class.options.centerCross.val;
            },
            name: "Center cross length",
            _val: this_class.options.hashMarksLength.val,
            type: "float",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "centerCross"
        };
        this.options.numbers = {
            configurable: true,
            name: "Numbers",
            _val: true,
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.sevenYardMarkNumbers.val = false;
                    this_class.options.nineYardMarkNumbers.val = false;
                    this_class.options.numbersTopFromSideLine.configurable = true;
                }
                else {
                    this_class.options.numbersTopFromSideLine.configurable = false;
                }
            },
            type: "bool",
            prev_sibling: "centerCrossLength",
        };
        this.options.numberFont = {
            configurable: false,
            name: "Number font",
            val: "College",
            values: [ "College", "Segment" ],
            type: "select",
            prev_sibling: "numbers"
        };
        this.options.hieghtOfNumbers = {
            configurable: false,
            name: "Height of numbers",
            val: (2).yard2meter(),
            type: "float",
            prev_sibling: "numberFont", 
        };
        this.options.numbersTopFromSideLine = {
            configurable: true,
            name: "Numbers top from side line",
            val: (27).foot2meter(),
            type: "float",
            prev_sibling: "numbers",
        };
        this.options.sevenYardMarkNumbers = {
            configurable: true,
            name: "Seven yard marks",
            _val: false,
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.numbers.val = false;
                }
                else {
                    return;
                }
            },
            type: "bool",
            prev_sibling: "numbersTopFromSideLine",
        };
        this.options.nineYardMarkNumbers = {
            configurable: true,
            name: "Nine yard marks",
            _val: false,
            type: "bool",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
                if(v) {
                    this_class.options.numbers.val = false;
                    this_class.options.nineYardToSideline.configurable = true;
                }
                else {
                    this_class.options.nineYardToSideline.configurable = false;
                }
            },
            prev_sibling: "sevenYardMarkNumbers",
        };
        this.options.nineYardToSideline = {
            configurable: this_class.options.nineYardMarkNumbers.val,
            name: "Give your own distance",
            _val: (9).yard2meter(),
            type: "float",
            get val() {
                return this._val;
            },
            set val(v) {
                this._val = v;
            },
            prev_sibling: "nineYardMarkNumbers",

        };
        this.options.restrainingLines = {
            configurable: true,
            name: "Restraining lines",
            val: true,
            type: "bool",
            prev_sibling: "nineYardToSideline",
        };
        this.options.restrainingToSideLine = {
            get configurable()
            {
                return this_class.options.restrainingLines.val;
            },
            name: "Restraining lines to side line",
            _val: (2).yard2meter(),
            get val() {
                return this._val;
            },
            set val(v) {
                if(v < (2).yard2meter() && v > (5).yard2meter()) {
                    this._val = (2).yard2meter();
                }
                else {
                    this._val = v;
                }
            },
            type: "float",
            prev_sibling: "restrainingLines",
        };
        this.options.restrainingDashLength = {
            get configurable()
            {
                return this_class.options.restrainingLines.val;
            },
            name: "Dashed line length",
            val: (1).foot2meter(),
            type: "float",
            prev_sibling: "restrainingToSideLine",
        };
        this.options.restrainingDashSpace = {
            get configurable()
            {
                return this_class.options.restrainingLines.val;
            },
            name: "Dashed space length",
            val: (1).foot2meter(),
            type: "float",
            prev_sibling: "restrainingDashLength",
        };
        this.options.mediaLines = {
            configurable: true,
            name: "Media lines",
            val: false,
            type: "bool",
            prev_sibling: "restrainingDashSpace",
        };
        this.options.mediaLinesDistanceToSideLine = {
            get configurable()
            {
                return this_class.options.mediaLines.val;
            },
            name: "Media line to side line",
            val: (this_class.options.teamBoxWidth.val + this_class.options.restrainingToSideLine.val),
            type: "float",
            prev_sibling: "mediaLines",
        };

    }

    static get layout_methods()
    {
      if( robot_controller.robot_has_capability( "bezier_task" ) )
      {
        return {
          "two_end_goal_posts": 2,
          "two_end_goal_posts_resize": 2,
          "corner,side": 2,
          "all_goal_posts": 4,
          "free_hand": 0
        };
      }
      else
      {
        return {
          "two_end_goal_posts": 2,
          "two_end_goal_posts_resize": 2,
          "corner,side": 2,
          "free_hand": 0
        };
      }
    }
  
    static get_point_positions( layout_method )
    {
      if( layout_method === "two_end_goal_posts" )
      {
        return [
          new Vector( 0.5, 1 ),
          new Vector( 0.5, -0.025 )
        ]
      }
      if( layout_method === "two_end_goal_posts_resize" )
      {
        return [
          new Vector( 0.5, 1 ),
          new Vector( 0.5, -0.025 )
        ]
      }
      if( layout_method === "corner,side" )
      {
        return [
          new Vector( 0, 1 ),
          new Vector( 0, 0.25 )
        ]
      }
  
      if( layout_method === "all_goal_posts" )
      {
        return [
          new Vector( 0.45, -0.025 ),
          new Vector( 0.55, -0.025 ),
          new Vector( 0.55, 1 ),
          new Vector( 0.45, 1 )
        ]
      }
  
      if( layout_method === "all_corners,all_goal_posts" )
      {
        return [
          new Vector( 0, -0.025 ),
          new Vector( 0.45, -0.025 ),
          new Vector( 0.55, -0.025 ),
          new Vector( 1, -0.025 ),
          new Vector( 1, 1 ),
          new Vector( 0.55, 1 ),
          new Vector( 0.45, 1 ),
          new Vector( 0, 1 )
        ]
      }
    }

    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     */
    sidelines(c1, c2, c3, c4, horizontalVector, verticalVector) 
    {
        let newC1 = c1.add(horizontalVector.multiply(this.options.endZoneWidth.val ));
        let newC2 = c2.add(horizontalVector.multiply(this.options.endZoneWidth.val ));
        let newC3 = c3.subtract(horizontalVector.multiply(this.options.endZoneWidth.val ));
        let newC4 = c4.subtract(horizontalVector.multiply(this.options.endZoneWidth.val ));

        if(this.options.endZone.val) {
            this.tasks.push( new LineTask( this.tasks.length, [c2, c3], false, true));
            if(this.options.driveAroundGoal.val) {
                this.driveAroundGoal(c3, c4, "bottom2top", verticalVector);     
            } else{
                this.tasks.push( new LineTask( this.tasks.length, [c3, c4], false, true));
            }

            this.tasks.push( new LineTask( this.tasks.length, [c4, c1], false, true)); 
            if(this.options.driveAroundGoal.val) {
                this.driveAroundGoal(c1, c2, "top2bottom", verticalVector);
            }
            else{
                this.tasks.push( new LineTask( this.tasks.length, [c1, c2], false, true));
            }
        }
        else {
            newC1 = c1.add(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
            newC2 = c2.add(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
            newC3 = c3.subtract(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
            newC4 = c4.subtract(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
            this.tasks.push( new LineTask( this.tasks.length, [newC2, newC3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [newC4, newC1], false, true));
        }  
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @returns {null} if the wide side lines option are false
     */
    wideSideLines(c1, c2, c3, c4, horizontalVector, verticalVector) {
        if(!this.options.wideSideLines.val) {
            return;
        }
        let outerC1 = c1;
        let outerC2 = c2;
        let outerC3 = c3;
        let outerC4 = c4;
        let lineWidth = this.options.LineWidth.val;
        let numberOfWideSideLine = this.options.numberOfWideLines.val;

        if(!this.options.endZone.val) {
            outerC1 = c1.add(horizontalVector.multiply(this.options.endZoneWidth.val - lineWidth ));
            outerC2 = c2.add(horizontalVector.multiply(this.options.endZoneWidth.val - lineWidth ));
            outerC3 = c3.subtract(horizontalVector.multiply(this.options.endZoneWidth.val - lineWidth ));
            outerC4 = c4.subtract(horizontalVector.multiply(this.options.endZoneWidth.val - lineWidth ));
        }

        for(let numberOfLines = 0; numberOfLines < numberOfWideSideLine; numberOfLines++) {
            outerC1 = outerC1.add(horizontalVector.multiply( 0.8 * lineWidth )).subtract(verticalVector.multiply( 0.8 * lineWidth ));
            outerC2 = outerC2.add(horizontalVector.multiply( 0.8 * lineWidth )).add(verticalVector.multiply( 0.8 *  lineWidth ));
            outerC3 = outerC3.subtract(horizontalVector.multiply( 0.8 * lineWidth )).add(verticalVector.multiply( 0.8 * lineWidth ));
            outerC4 = outerC4.subtract(horizontalVector.multiply( 0.8 * lineWidth )).subtract(verticalVector.multiply( 0.8 * lineWidth ));

            if(this.options.driveAroundGoal.val && this.options.endZone.val) {       
                this.tasks.push( new LineTask( this.tasks.length, [outerC2, outerC3], false, true));
                this.driveAroundGoal(outerC3, outerC4, "bottom2top", verticalVector );
                this.tasks.push( new LineTask( this.tasks.length, [outerC4, outerC1], false, true));
                this.driveAroundGoal(outerC1, outerC2, "top2bottom", verticalVector );
            }
            else {
                this.tasks.push( new LineTask( this.tasks.length, [outerC2, outerC3], false, true));
                this.tasks.push( new LineTask( this.tasks.length, [outerC3, outerC4], false, true) );
                this.tasks.push( new LineTask( this.tasks.length, [outerC4, outerC1], false, true));
                this.tasks.push( new LineTask( this.tasks.length, [outerC1, outerC2], false, true));
            }
        }  
    }

    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Array} yards
     * @return {null} if restraining option are false
     */
    restrainingLines(c1, c2, c3, c4, horizontalVector, verticalVector, yards) {
        if(!this.options.restrainingLines.val) {
            return;
        }

        let yardSpace = new Line(yards[0].start, yards[1].start).length;
        let restrainingToSideline = this.options.restrainingToSideLine.val;
        let behindTeamBoxToSideline = (this.options.teamBoxWidth.val);
        let distanceToCorners = this.options.endZoneWidth.val + (this.options.teamBoxToEndzone.val * yardSpace - this.options.LineWidth.val ) - restrainingToSideline;

        let newC1 = c1.subtract(horizontalVector.multiply(restrainingToSideline)).add(verticalVector.multiply(restrainingToSideline));
        let newC2 = c2.subtract(horizontalVector.multiply(restrainingToSideline)).subtract(verticalVector.multiply(restrainingToSideline));
        let newC3 = c3.add(horizontalVector.multiply(restrainingToSideline)).subtract(verticalVector.multiply(restrainingToSideline));
        let newC4 = c4.add(horizontalVector.multiply(restrainingToSideline)).add(verticalVector.multiply(restrainingToSideline));
        
        let bottomRight = c2.add(horizontalVector.multiply(distanceToCorners)).subtract(verticalVector.multiply(restrainingToSideline));
        let bottomLeft = c3.subtract(horizontalVector.multiply(distanceToCorners)).subtract(verticalVector.multiply(restrainingToSideline));
        let topRight = c1.add(horizontalVector.multiply(distanceToCorners)).add(verticalVector.multiply(restrainingToSideline));
        let topLeft = c4.subtract(horizontalVector.multiply(distanceToCorners)).add(verticalVector.multiply(restrainingToSideline));

        let topRightVertical = topRight.add(verticalVector.multiply(behindTeamBoxToSideline));
        let topLeftVertical = topLeft.add(verticalVector.multiply(behindTeamBoxToSideline));
        let bottomRightVertical = bottomRight.subtract(verticalVector.multiply(behindTeamBoxToSideline));
        let bottomLeftVertical = bottomLeft.subtract(verticalVector.multiply(behindTeamBoxToSideline));

        if(this.options.nitroLines.val) {
            this.start_locations.push( new StartLocation( newC2, this.tasks.length ) ); 
            this.start_locations.push( new StartLocation( newC3, this.tasks.length ) ); 
            this.start_locations.push( new StartLocation( newC4, this.tasks.length ) ); 
        }
        else {
            this.start_locations.push( new StartLocation( newC3, this.tasks.length ) ); 
            this.start_locations.push( new StartLocation( newC4, this.tasks.length ) ); 
            this.start_locations.push( new StartLocation( newC1, this.tasks.length ) ); 
        }

        if(!this.options.endZone.val) {
            newC3 = newC3.subtract(horizontalVector.multiply(this.options.endZoneWidth.val));
            newC4 = newC4.subtract(horizontalVector.multiply(this.options.endZoneWidth.val));
            newC1 = newC1.add(horizontalVector.multiply(this.options.endZoneWidth.val));
            newC2 = newC2.add(horizontalVector.multiply(this.options.endZoneWidth.val));
        }
        
        if(this.options.teamBoxStandard.val || this.options.teamBoxHighschool.val) {
            this.paintDashedLines(newC2, bottomRight );
            this.paintDashedLines(bottomRight, bottomRightVertical);
            this.paintDashedLines(bottomRightVertical, bottomLeftVertical);
            this.paintDashedLines(bottomLeftVertical, bottomLeft);
            this.paintDashedLines(bottomLeft, newC3 );
            this.paintDashedLines(newC3, newC4 );
            this.paintDashedLines(newC4, topLeft );
            this.paintDashedLines(topLeft, topLeftVertical);
            this.paintDashedLines(topLeftVertical, topRightVertical);
            this.paintDashedLines(topRightVertical, topRight);
            this.paintDashedLines(topRight, newC1);
            this.paintDashedLines(newC1, newC2); 
        }
        else {
            this.paintDashedLines(newC2, newC3);
            this.paintDashedLines(newC3, newC4);
            this.paintDashedLines(newC4, newC1);
            this.paintDashedLines(newC1, newC2); 
        }
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @return {null} if media lines option are false
     */
    mediaLines(c1, c2, c3, c4, horizontalVector, verticalVector) {

        if(!this.options.mediaLines.val) {
            return;
        }

        let distance = this.options.mediaLinesDistanceToSideLine.val;
        let newC1 = c1.subtract(horizontalVector.multiply(distance)).add(verticalVector.multiply(distance));
        let newC2 = c2.subtract(horizontalVector.multiply(distance)).subtract(verticalVector.multiply(distance));
        let newC3 = c3.add(horizontalVector.multiply(distance)).subtract(verticalVector.multiply(distance));
        let newC4 = c4.add(horizontalVector.multiply(distance)).add(verticalVector.multiply(distance));

        this.tasks.push(new LineTask(this.tasks.length, [newC2, newC3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [newC3, newC4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [newC4, newC1], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [newC1, newC2], false, true));
    }
    /**
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     * @param {String} direction 
     * @param {Vector} verticalVector 
     */
    // painRestrainingAroundGoal is not working currently - this is not used yet, because of our app can not handle hashed around goal
    paintRestrainingAroundGoal(start, end, direction, verticalVector) {
        let topSideGoal;
        let bottomSideGoal;
        let verticalSidelineCenter = new Line(start, end).middle;
        let goalWidth = (23).foot2meter() + (4).inch2meter();
        let drive_left_around = false;

        if(direction === "top2bottom") {
            topSideGoal = verticalSidelineCenter.add(verticalVector.multiply( 0.5 * goalWidth ));
            bottomSideGoal = verticalSidelineCenter.subtract(verticalVector.multiply( 0.5 * goalWidth ));
        }
        else {
            topSideGoal = verticalSidelineCenter.subtract(verticalVector.multiply( 0.5 * goalWidth ));
            bottomSideGoal = verticalSidelineCenter.add(verticalVector.multiply( 0.5 * goalWidth ));
        }

        let drive_around_task = drive_around_goal_posts(this, start, topSideGoal, bottomSideGoal, end, 2, this.tasks.length, this.options.goalPoleWidth.val, drive_left_around);

        this.tasks.pushAll( drive_around_task );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options.restrainingDashLength.val ));
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options.restrainingDashSpace.val ));
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} fieldSide 
     * @param {Array} yards 
     * @returns {null} if team box option are false
     */
    teamBox(c1, c2, c3, c4, horizontalVector, verticalVector, fieldSide, yards) {

        if(!this.options.teamBoxStandard.val && !this.options.teamBoxHighschool.val) {
            return;
        }


        let restrectedRight;
        let restrectedLeft;
        let teamBoxRight;
        let teamBoxLeft
        let coachLeftCorner;
        let coachRightCorner;
        let teamBoxRightCorner;
        let teamBoxLeftCorner
        let distanceToCorners;
        let restrectedWidth = this.options.teamBoxToSideline.val;

        if(!this.options.scalingYardLines.val) {
            let yardSpace = new Line(yards[0].start, yards[1].start).length;
            distanceToCorners = this.options.endZoneWidth.val + (this.options.teamBoxToEndzone.val * yardSpace - this.options.LineWidth.val );

        }else{
            distanceToCorners = this.options.endZoneWidth.val + (this.options.teamBoxToEndzone.val * this.options.yardLinesSpace.val - this.options.LineWidth.val );
        }

        if(fieldSide === "top") {
            restrectedRight = c1.add( horizontalVector.multiply( distanceToCorners ));
            restrectedLeft = c4.subtract( horizontalVector.multiply( distanceToCorners ));
            teamBoxRight = restrectedRight.add(verticalVector.multiply(restrectedWidth));
            teamBoxLeft = restrectedLeft.add(verticalVector.multiply(restrectedWidth));
            coachRightCorner = teamBoxRight.add(verticalVector.multiply( this.options.coachAreaWidth.val));
            coachLeftCorner = teamBoxLeft.add( verticalVector.multiply( this.options.coachAreaWidth.val));
            teamBoxRightCorner = restrectedRight.add(verticalVector.multiply( this.options.teamBoxWidth.val));
            teamBoxLeftCorner = restrectedLeft.add(verticalVector.multiply( this.options.teamBoxWidth.val));
        }
        else {
            restrectedRight = c3.subtract( horizontalVector.multiply( distanceToCorners ));
            restrectedLeft = c2.add( horizontalVector.multiply( distanceToCorners ));
            teamBoxRight = restrectedRight.subtract(verticalVector.multiply(restrectedWidth));
            teamBoxLeft = restrectedLeft.subtract(verticalVector.multiply(restrectedWidth));
            coachRightCorner = teamBoxRight.subtract(verticalVector.multiply( this.options.coachAreaWidth.val));
            coachLeftCorner = teamBoxLeft.subtract( verticalVector.multiply( this.options.coachAreaWidth.val));
            teamBoxRightCorner = restrectedRight.subtract(verticalVector.multiply( this.options.teamBoxWidth.val));
            teamBoxLeftCorner = restrectedLeft.subtract(verticalVector.multiply( this.options.teamBoxWidth.val));
        }

        if(this.options.teamBoxStandard.val) {

            if(fieldSide === 'top') {
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxRight, teamBoxRightCorner], false, true));
                if(this.options.teamBoxClosed.val) {
                    this.tasks.push(new LineTask( this.tasks.length, [teamBoxRightCorner, teamBoxLeftCorner], false, true));
                }
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxLeftCorner, teamBoxLeft], false, true));    
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxLeft, teamBoxRight], false, true));
                this.tasks.push(new LineTask( this.tasks.length, [coachRightCorner, coachLeftCorner], false, true));
            }
            else {
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxRight, teamBoxLeft], false, true));
                this.tasks.push(new LineTask( this.tasks.length, [coachLeftCorner, coachRightCorner], false, true));
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxRight, teamBoxRightCorner], false, true));
                if(this.options.teamBoxClosed.val) {
                    this.tasks.push(new LineTask( this.tasks.length, [teamBoxRightCorner, teamBoxLeftCorner], false, true));
                }
                this.tasks.push(new LineTask( this.tasks.length, [teamBoxLeftCorner, teamBoxLeft], false, true));
            }
        }
        if(this.options.teamBoxHighschool.val) {
            
            if(fieldSide ==="bottom") {
                this.paintDashedLines(teamBoxRightCorner, teamBoxRight);   
                this.paintDashedLines(teamBoxRight, teamBoxLeft);
                this.paintDashedLines(teamBoxLeftCorner, teamBoxLeft);
            }
            else{
                this.paintDashedLines(teamBoxRight, teamBoxRightCorner );   
                this.paintDashedLines(teamBoxRight, teamBoxLeft);
                this.paintDashedLines(teamBoxLeft, teamBoxLeftCorner);
            }
        }
    }

    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} fieldSide 
     * @param {String} position 
     * @returns {null} if nitro option are false
     */
    nitroLines(c1, c2, c3, c4, horizontalVector, verticalVector, fieldSide, position) {
        if(!this.options.nitroLines.val) {
            return position;
        }
        let lineStart;
        let lineStart90degree;
        let nitroArea;
        let nitronLines = [];
        let robotPosition = position;

        if(fieldSide === "leftSide") {
            lineStart = c4.subtract(horizontalVector.multiply(this.options.endZoneWidth.val));
            lineStart90degree = c4.subtract(verticalVector.multiply(this.options.endZoneWidth.val));
            nitroArea = new Line(c4, c3).length;
        }
        else {
            lineStart = c2.add(horizontalVector.multiply(this.options.endZoneWidth.val));
            lineStart90degree = c2.add(verticalVector.multiply(this.options.endZoneWidth.val));
            nitroArea = new Line(c1, c2).length;
        }
        let vector = new Line(lineStart, lineStart90degree).as_vector.unit_vector;
        let lineLength = new Line(lineStart, lineStart90degree).length;
        let verticalSpace = (nitroArea - this.options.endZoneWidth.val) / 8;
        let nitroAndEndzonlineSpace = (lineLength - this.options.nitroLinesLength.val) / 2;
        let start = lineStart.add(vector.multiply(nitroAndEndzonlineSpace));
        let end = start.add(vector.multiply(this.options.nitroLinesLength.val));

        for(let i = 0; i < 9; i++) {
            nitronLines.unshift(new Line(start, end)); 
            if(fieldSide === "leftSide") {  
                start = start.subtract(verticalVector.multiply(verticalSpace));
                end = start.add(vector.multiply(this.options.nitroLinesLength.val));
            }
            else {
                start = start.add(verticalVector.multiply(verticalSpace));
                end = start.add(vector.multiply(this.options.nitroLinesLength.val));
            }
        }
        fieldSide = "leftSide" ? robotPosition = "bottom" : "top";
        nitronLines.forEach(element => {            
            if(robotPosition === "top") {
                this.tasks.push(new LineTask(this.tasks.length, [element.start, element.end], false, true));
            }
            else {
                this.tasks.push(new LineTask(this.tasks.length, [element.end, element.start], false, true));
            }
            robotPosition = this.toggleVerticalPosition(robotPosition);
        });

        let pos = this.toggleVerticalPosition(position);
        return pos;
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} fieldSide 
     * @returns {null} if three yards option are false
     */
    threeYardLine(c1, c2, c3, c4, horizontalVector, verticalVector, fieldSide) {
        if(!this.options.threeYardLine.val) {
            return;
        }

        let start; 
        let end;
        let middle;
        c1 = c1.add(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
        c2 = c2.add(horizontalVector.multiply(this.options.endZoneWidth.val - this.options.LineWidth.val ));
        c3 = c3.subtract(horizontalVector.multiply( this.options.endZoneWidth.val - this.options.LineWidth.val ));
        c4 = c4.subtract(horizontalVector.multiply( this.options.endZoneWidth.val - this.options.LineWidth.val ));

        if(fieldSide === "rightSide") {
            middle = new Line(c1, c2).middle;
            start = middle.add(horizontalVector.multiply(this.options.threeYardLineToGoalLine.val)).add(verticalVector.multiply((0.5 * this.options.threeYardLineLength.val))); 
            end = middle.add(horizontalVector.multiply(this.options.threeYardLineToGoalLine.val)).subtract(verticalVector.multiply((0.5 * this.options.threeYardLineLength.val))); 
        }
        else {
            middle = new Line(c4, c3).middle;
            start = middle.subtract(horizontalVector.multiply(this.options.threeYardLineToGoalLine.val)).add(verticalVector.multiply((0.5 * this.options.threeYardLineLength.val))); 
            end = middle.subtract(horizontalVector.multiply(this.options.threeYardLineToGoalLine.val)).subtract(verticalVector.multiply((0.5 * this.options.threeYardLineLength.val))); 
        }
        if(fieldSide === 'leftSide') {
            this.tasks.push(new LineTask(this.tasks.length, [ end, start], false, true));
        }
        else {
            this.tasks.push(new LineTask(this.tasks.length, [ start, end], false, true));
        }
    }
    /**
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     * @param {String} direction 
     * @param {Vector} verticalVector 
     * @returns {null} if the option around goal are false
     */
    driveAroundGoal(start, end, direction, verticalVector) {
        if(!this.options.driveAroundGoal.val){
            return;
        }

        let topSideGoal;
        let bottomSideGoal;
        let verticalSidelineCenter = new Line(start, end).middle;
        let goalWidth = this.options.goalWidth.val;
        let drive_left_around = false;

        if(this.options.goalTypeH.val) {
            if(direction === "top2bottom") {
                topSideGoal = verticalSidelineCenter.add(verticalVector.multiply( 0.5 * goalWidth ));
                bottomSideGoal = verticalSidelineCenter.subtract(verticalVector.multiply( 0.5 * goalWidth ));
            }
            else {
                topSideGoal = verticalSidelineCenter.subtract(verticalVector.multiply( 0.5 * goalWidth ));
                bottomSideGoal = verticalSidelineCenter.add(verticalVector.multiply( 0.5 * goalWidth ));
            }
            this.tasks.pushAll( drive_around_goal_posts(this, start, topSideGoal, bottomSideGoal, end, 2, this.tasks.length, this.options.goalPoleWidth.val, drive_left_around));
        }
        else if(this.options.goalTypeY.val){
            topSideGoal = verticalSidelineCenter;
            bottomSideGoal = verticalSidelineCenter;
            this.tasks.pushAll( drive_around_goal_posts(this, start, topSideGoal, bottomSideGoal, end, 2, this.tasks.length, this.options.goalPoleWidth.val, drive_left_around));
        }
        else if(this.options.goalTypeGosseNeck.val && this.options.gosseNeckDistanceToSideLine.val < (1.2).foot2meter()){
            topSideGoal = verticalSidelineCenter;
            bottomSideGoal = verticalSidelineCenter;
            this.tasks.pushAll( drive_around_goal_posts(this, start, topSideGoal, bottomSideGoal, end, 2, this.tasks.length, this.options.goalPoleWidth.val, drive_left_around));
        }
        else {
            this.tasks.push( new LineTask( this.tasks.length, [start, end], false, true));
        }   
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} paintDirection 
     * @param {String} robotPosition 
     * @returns {Array}
     */
    defineYardLinesPositions(c1, c2, c3, c4, horizontalVector, verticalVector, paintDirection, robotPosition) {

        let rightSide;
        let leftSide;
        let middleRight;
        let middleLeft;
        let paintingAreaSize;
        let spaceBetweenYardLines;
        let yardLines = [];
        let yardSpace ;
        let fieldMiddle = new Line(c2, c3).middle;
        let lineWidth = this.options.LineWidth.val;
        let endzonWidth = this.options.endZoneWidth.val;
        let yardLinesLength = (new Line(c1, c2).length - 2 * this.options.yardLinesSpaceToSideline.val);
        let yardsToSideline = this.options.yardLinesSpaceToSideline.val;

        fieldMiddle = fieldMiddle.add(verticalVector.multiply(yardsToSideline));
        if(this.options.scalingYardLines.val) {
            spaceBetweenYardLines = this.options.yardLinesSpace.val;
            rightSide = c2.add( horizontalVector.multiply( endzonWidth - 0.5 * lineWidth  )).add(verticalVector.multiply(yardsToSideline));
            leftSide = c3.subtract( horizontalVector.multiply( endzonWidth - 0.5 * lineWidth  )).add(verticalVector.multiply(yardsToSideline));

            if(this.options.doubleCenterYard.val) {
                
                middleRight = fieldMiddle.add(horizontalVector.multiply( 0.5 * lineWidth ));
                middleLeft = fieldMiddle.subtract(horizontalVector.multiply( 0.5 * lineWidth ));
                paintingAreaSize = new Line(middleRight, rightSide).length;
            }
            else {         
                middleRight = fieldMiddle;
                middleLeft = fieldMiddle.add(horizontalVector.multiply(spaceBetweenYardLines));
                paintingAreaSize = new Line(fieldMiddle, rightSide).length;
            }
        }
        else{
            rightSide = c2.add( horizontalVector.multiply( endzonWidth - lineWidth  )).add(verticalVector.multiply(yardsToSideline));;
            leftSide = c3.subtract( horizontalVector.multiply( endzonWidth  -  lineWidth  )).add(verticalVector.multiply(yardsToSideline));;
            let numberOfYards = (0.5 * this.options.numberOfYardLines.val);

            if(this.options.doubleCenterYard.val) {
                middleRight = fieldMiddle.add(horizontalVector.multiply( 0.5 * lineWidth ));
                middleLeft = fieldMiddle.subtract(horizontalVector.multiply( 0.5 * lineWidth ));
                paintingAreaSize = new Line(middleLeft, leftSide).length; 
            }  
            else{
                middleRight = fieldMiddle;
                middleLeft = fieldMiddle.add(horizontalVector.multiply(spaceBetweenYardLines));
                paintingAreaSize = new Line(fieldMiddle, rightSide).length;    
            }
            spaceBetweenYardLines =  paintingAreaSize / numberOfYards ;
        }

        yardSpace = 0.5 * spaceBetweenYardLines;
        let start = middleRight;
        let end ;
        
        if(paintDirection === "left2Right") {            
            for(let i = paintingAreaSize; i > yardSpace ; i -= spaceBetweenYardLines)
            {
                end = start.add( verticalVector.multiply( yardLinesLength));
                yardLines.unshift(new Line( end, start )); 
                start = start.subtract( horizontalVector.multiply( spaceBetweenYardLines));  
            }
        }

        if(!this.options.doubleCenterYard.val && this.options.scalingYardLines.val)
            paintingAreaSize -= spaceBetweenYardLines;
        
        start = middleLeft;
        if(paintDirection === "right2Left") {

            robotPosition = this.toggleVerticalPosition(robotPosition);
            for(let i = paintingAreaSize; i > yardSpace ; i -= spaceBetweenYardLines)
            {
                end = start.add( verticalVector.multiply( yardLinesLength));
                yardLines.push(new Line( end, start )); 
                start = start.add( horizontalVector.multiply( spaceBetweenYardLines));              
            }
        }
        return yardLines;
    }
    /**
     * 
     * @param {Array} yardLines 
     * @param {String} position 
     * @returns {null} if the option for yard lines are false
     */
    yardLines(yardLines, position)
    {
        if(!this.options.yardLines.val) {
            return position;
        }

        let robotPosition = position;
        let yardlines = [] = yardLines;

        if(this.options.paintForthAndBack.val) {
            yardlines.forEach(element => {
                this.tasks.push(new LineTask( this.tasks.length, [element.end, element.start], false, true));
            });
        }
        else {
            yardlines.forEach(element => {

                if(robotPosition ==="top") {
                    this.tasks.push(new LineTask( this.tasks.length, [element.start, element.end], false, true));
                }
                else {
                    this.tasks.push(new LineTask( this.tasks.length, [element.end, element.start], false, true));
                }
                robotPosition = this.toggleVerticalPosition(robotPosition);
            });
        }
       return robotPosition;
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} fieldSide 
     * @param {Array} yards 
     * @returns {null} if side hash marks option are false
     */
    sideHashMarks(horizontalVector, verticalVector, fieldSide, yards)
    {
        if(!this.options.sideHashMarks.val) {
            return;
        }

        let yardLines = [] = yards;
        let hashes = [];
        let yardNumbers = yardLines.length;
        let hashSpace;
        let startIndex;
        let endIndex;
        let partHashes = [];

        if(this.options.scalingYardLines.val) {
            hashSpace = this.options.hashMarksSpace.val;
        } 
        else {
            let yardLinesDistance = new Line(yardLines[1].end, yardLines[2].end).length;
            hashSpace = yardLinesDistance / 5;
        }

        if(!this.options.doubleCenterYard.val) {
            endIndex = yardNumbers-1;
            partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, 0, endIndex, "bottom", yardLines, true);
            partHashes.forEach(element=> {
                hashes.push(element);
            });

            startIndex = endIndex;
            endIndex = 0;
            partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, "top", yardLines, true);
            partHashes.forEach(element=> {
                hashes.push(element);
            });
        }
        else {
            if(fieldSide === "bottom") {

                endIndex = 0.5 * yardNumbers-2;
                partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, 0, endIndex, "bottom", yardLines, true);
                partHashes.forEach(element=> {
                    hashes.push(element);
                });
    
                startIndex = 0.5 * yardNumbers;
                endIndex = yardNumbers -1;
                partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, "bottom", yardLines, false);
                partHashes.forEach(element=> {
                    hashes.push(element);
                });
            }
            else {

                startIndex = yardNumbers -1;
                endIndex = 0.5 * yardNumbers;
                partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, "top", yardLines, false);
                partHashes.forEach(element=> {
                    hashes.push(element);
                });
    
                startIndex = endIndex-2;
                endIndex = 0;
                partHashes = [] = this.hashPart(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, "top", yardLines, true);
                partHashes.forEach(element=> {
                    hashes.push(element);
                });
            }
        }

        let position = "bottom";
        hashes.forEach(element => {

            if(position === "bottom")
            this.tasks.push(new LineTask( this.tasks.length, [element.start, element.end], false, true));
            else
            this.tasks.push(new LineTask( this.tasks.length, [element.end, element.start], false, true));
            
            position  = this.toggleVerticalPosition(position);
        });
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Vector} hashSpace 
     * @param {Vector} startIndex 
     * @param {Vector} endIndex 
     * @param {String} fieldSide 
     * @param {Array} yardLines 
     * @param {Boolean} extraHashes 
     * @returns {Array} an array of hash marks
     */
    hashPart(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, fieldSide, yardLines, extraHashes) {

        let hashLength = this.options.hashMarksLength.val;
        let yardSpace2Sidelines = -this.options.yardLinesSpaceToSideline.val;
        let space2SideLine = this.options.sideHashMarksSpaceToSideline.val;
        let hashStart;
        let hashEnd;
        let space2NextHash;
        let hashes = [];

        if(fieldSide === "bottom") {
            if(extraHashes === true) {
                for(let i = 4; i > 0; i--) {
                    space2NextHash = i * hashSpace;
                    hashStart = yardLines[startIndex].end.subtract(horizontalVector.multiply( space2NextHash )).add(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                    hashEnd = hashStart.add( verticalVector.multiply( hashLength));
                    
                    hashes.push(new Line(hashStart, hashEnd));
                }
            }                
            for(let yards = startIndex; yards <= endIndex; yards++) {
                
                space2NextHash = 0;
                for(let i = 1; i < 5; i++) {
                    space2NextHash = i * hashSpace;
                    hashStart = yardLines[yards].end.add(horizontalVector.multiply( space2NextHash )).add(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                    hashEnd = hashStart.add( verticalVector.multiply( hashLength));
    
                    hashes.push(new Line(hashStart, hashEnd));
                }
            }
        }
        else {
            for(let yards = startIndex; yards >= endIndex; yards--) {  
                space2NextHash = 0;
                for(let i = 4; i > 0; i--) {
                    space2NextHash = i * hashSpace;
                    hashStart = yardLines[yards].start.add(horizontalVector.multiply( space2NextHash )).subtract(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                    hashEnd = hashStart.subtract( verticalVector.multiply( hashLength));
    
                    hashes.push(new Line(hashStart, hashEnd));
                }
            }
            space2NextHash = 0;
            if(extraHashes === true) {
                for(let i = 4; i > 0; i--) {
                    space2NextHash += hashSpace;
                    hashStart = yardLines[endIndex].start.subtract(horizontalVector.multiply( space2NextHash )).subtract(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                    hashEnd = hashStart.subtract( verticalVector.multiply( hashLength));
    
                    hashes.push(new Line(hashStart, hashEnd));
                }
            }
        }
        return hashes;
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Array} yards 
     * @param {String} fieldSide 
     * @returns {null} if the Tick markers option are false
     */
    horizontalHashMarks(horizontalVector, verticalVector, yards)
    {
        if(!this.options.horizontalHashmarks.val) {
            return;
        }

        let hashDistanceToSideline = this.options.horizontalHashmarksToSideline.val - this.options.yardLinesSpaceToSideline.val;
        let hashLength = this.options.hashMarksLength.val;
        let lineWidth = this.options.LineWidth.val;
        let yardLines = [] = yards;
        let paintingLength = yardLines.length;
        let hashes = [];

        let startHash, endHash;
        if(!this.options.doubleCenterYard.val) {

            for(let i = 0; i < paintingLength; i++) {
                startHash = yardLines[i].end.add(verticalVector.multiply(hashDistanceToSideline)).subtract(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.add(horizontalVector.multiply(hashLength));
                
                hashes.push(new Line(startHash, endHash));
            }
            let i = paintingLength - 1;
            for(i; i >= 0; i--) {
                startHash = yardLines[i].start.subtract(verticalVector.multiply(hashDistanceToSideline)).add(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.subtract(horizontalVector.multiply(hashLength));
    
                hashes.push(new Line(startHash, endHash));
            }
        }
        else {
            let paintingSide = 0.5 * paintingLength-1;

            for(let i = 0; i < paintingSide; i++) {
                startHash = yardLines[i].end.add(verticalVector.multiply(hashDistanceToSideline)).subtract(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.add(horizontalVector.multiply(hashLength));
    
                hashes.push(new Line(startHash, endHash));
            }

            let middle = paintingLength / 2;
            startHash = yardLines[middle].end.add(verticalVector.multiply(hashDistanceToSideline)).subtract(horizontalVector.multiply( 0.5 * (hashLength - lineWidth)));
            endHash = startHash.add(horizontalVector.multiply(hashLength));
            hashes.push(new Line(startHash, endHash));

            middle +=1;
            for(let i = middle ; i < paintingLength; i++) {
                startHash = yardLines[i].end.add(verticalVector.multiply(hashDistanceToSideline)).subtract(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.add(horizontalVector.multiply(hashLength));
    
                hashes.push(new Line(startHash, endHash));
            }

            paintingSide +=1;
            for(let i = paintingLength-1 ; i > paintingSide; i--) {
                startHash = yardLines[i].start.subtract(verticalVector.multiply(hashDistanceToSideline)).add(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.subtract(horizontalVector.multiply(hashLength));
    
                hashes.push(new Line(startHash, endHash));
            }

            middle -=1;
            startHash = yardLines[middle].start.subtract(verticalVector.multiply(hashDistanceToSideline)).add(horizontalVector.multiply( 0.5 * (hashLength + lineWidth)));
            endHash = startHash.subtract(horizontalVector.multiply(hashLength));
            hashes.push(new Line(startHash, endHash));

            for(let i = middle-2 ; i > -1; i--) {
                startHash = yardLines[i].start.subtract(verticalVector.multiply(hashDistanceToSideline)).add(horizontalVector.multiply( 0.5 * hashLength));
                endHash = startHash.subtract(horizontalVector.multiply(hashLength));
    
                hashes.push(new Line(startHash, endHash));
            }
        }
        hashes.forEach(element => {
            this.tasks.push(new LineTask(this.tasks.length, [element.start, element.end], false, true));
        });
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Array} yards 
     * @returns {null} if middle hashmarkers option are false
     */
    middleHashMarks(horizontalVector, verticalVector, yards) {
        if(!this.options.middleHashMarks.val) {
            return;
        }

        let yardLines = [] = yards;
        let hashes = [];
        let yardNumbers = yardLines.length;
        let hashSpace;
        let startIndex;
        let endIndex;
        let hashPartes = [];

        if(this.options.scalingYardLines.val) {
            hashSpace = this.options.hashMarksSpace.val;
        } 
        else {
            let yardLinesDistance = new Line(yardLines[1].end, yardLines[2].end).length;
            hashSpace = yardLinesDistance / 5;
        }
        if(!this.options.doubleCenterYard.val) {

            endIndex = yardNumbers-1;
            hashPartes = [] = this.hashPartMiddle(horizontalVector, verticalVector, hashSpace, 0, endIndex, yardLines, true);
            hashPartes.forEach(element=> {
                hashes.push(element);
            });
        }
        else {
            endIndex = 0.5 * yardNumbers-2;
            hashPartes = [] = this.hashPartMiddle(horizontalVector, verticalVector, hashSpace, 0, endIndex, yardLines, true);
            hashPartes.forEach(element=> {
                hashes.push(element);
            });
            startIndex = 0.5 * yardNumbers;
            endIndex = yardNumbers -1;
            hashPartes = [] = this.hashPartMiddle(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, yardLines, false);
            hashPartes.forEach(element=> {
                hashes.push(element);
            });
        }
        hashes.forEach(element => {

            this.tasks.push(new LineTask( this.tasks.length, [element.start, element.end], false, true));
        });
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Vector} hashSpace 
     * @param {Number} startIndex 
     * @param {Number} endIndex 
     * @param {Array} yardLines 
     * @param {Boolean} extraHashes 
     * @returns {Array} an Array of containing hash markers
     */
    hashPartMiddle(horizontalVector, verticalVector, hashSpace, startIndex, endIndex, yardLines, extraHashes) {

        let hashLength = this.options.hashMarksLength.val;
        let yardSpace2Sidelines = -this.options.yardLinesSpaceToSideline.val;
        let space2SideLine = this.options.middleHashMarksSpaceToSideline.val;
        let bottomStart;
        let bottomEnd;
        let topStart;
        let topEnd;
        let space2NextHash;
        let hashes = [];
        let robotsPosition = "top";

        if(extraHashes === true) {

            for(let i = 4; i > 0; i--) {
                robotsPosition = this.toggleVerticalPosition(robotsPosition);
                space2NextHash = i * hashSpace;
                bottomStart = yardLines[startIndex].end.subtract(horizontalVector.multiply( space2NextHash )).add(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                bottomEnd = bottomStart.add( verticalVector.multiply( hashLength));

                topStart = yardLines[startIndex].start.subtract(horizontalVector.multiply( space2NextHash )).subtract(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                topEnd = topStart.subtract( verticalVector.multiply( hashLength));
                
                if(robotsPosition === "bottom") {
                    hashes.push(new Line(bottomStart, bottomEnd));
                    hashes.push(new Line(topEnd, topStart));
                }
                else {
                    hashes.push(new Line(topStart, topEnd));
                    hashes.push(new Line(bottomEnd, bottomStart));
                }
            }
        }     
        for(let yard = startIndex; yard <= endIndex; yard++) {   
            space2NextHash = 0;
            for(let i = 1; i < 5; i++) {
                robotsPosition = this.toggleVerticalPosition(robotsPosition);
                
                space2NextHash = i * hashSpace;
                bottomStart = yardLines[yard].end.add(horizontalVector.multiply( space2NextHash )).add(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                bottomEnd = bottomStart.add( verticalVector.multiply( hashLength));
                topStart = yardLines[yard].start.add(horizontalVector.multiply( space2NextHash )).subtract(verticalVector.multiply(space2SideLine + yardSpace2Sidelines));
                topEnd = topStart.subtract( verticalVector.multiply( hashLength));

                if(robotsPosition === "bottom") {
                    hashes.push(new Line(bottomStart, bottomEnd));
                    hashes.push(new Line(topEnd, topStart));
                }
                else {
                    hashes.push(new Line(topStart, topEnd));
                    hashes.push(new Line(bottomEnd, bottomStart));
                }                
            }
        }
        return hashes;
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {String} position 
     * @param {Array} yards 
    */
    paintAllVerticalLinesInsideField(horizontalVector, verticalVector, position, yards)
    {
        if(!this.options.paintForthAndBack.val){
            position = "bottom";
        }
        let yardLines = [] = yards;
        let yardNumbers = yardLines.length;
        let startIndex = 0;
        let endIndex;
        let paintTasks = [];
        let hashes = [];

        if(!this.options.doubleCenterYard.val) {
            endIndex = yardNumbers;
            hashes = this.partOfInsideField (horizontalVector, verticalVector, startIndex, endIndex, yardLines, true, position);
            hashes.forEach(element => {
                paintTasks.unshift(element);
            });
        }
        else {
            endIndex = 0.5 * yardNumbers -1;
            hashes = [] = this.partOfInsideField(horizontalVector, verticalVector, startIndex, endIndex, yardLines, false, position, "rightSide");
            hashes.forEach(element=> {
                paintTasks.push(element);
            });
            startIndex = 0.5 * yardNumbers;
            endIndex = yardNumbers;
            hashes = [] = this.partOfInsideField(horizontalVector, verticalVector, startIndex, endIndex, yardLines, false, position, "leftSide");
            hashes.forEach(element=> {
                paintTasks.push(element);
            });
        }

        paintTasks.forEach(( element) => {
            this.tasks.push(new LineTask( this.tasks.length, [element.start, element.end], false, true));
        });
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Number} startIndex 
     * @param {Number} endIndex 
     * @param {Array} yardLines 
     * @param {Boolean} extraHashes 
     * @param {String} position 
     * @param {String} fieldSide 
     * @returns {Array} containing the inside hash marks and yard lines
     */
    partOfInsideField (horizontalVector, verticalVector, startIndex, endIndex, yardLines, extraHashes, position, fieldSide) {
        let space2NextHash;
        let robotPosition = position;
        let hashSpace;
        let tasks = [];
        let hashes = []; 
        let start;
        let end;

        if(this.options.scalingYardLines.val) {
            hashSpace = this.options.hashMarksSpace.val;
        } 
        else {
            let yardLinesDistance = new Line(yardLines[1].end, yardLines[2].end).length;
            hashSpace = yardLinesDistance / 5;
        }
        if(extraHashes===true) {
            
            for(let i = 4; i > 0; i--) {
                this.options.paintForthAndBack.val ? robotPosition = this.toggleVerticalPosition(robotPosition) : "bottom";
                space2NextHash = i * hashSpace;

                start = yardLines[startIndex].end.subtract(horizontalVector.multiply(space2NextHash)).subtract(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
                end = yardLines[startIndex].start.subtract(horizontalVector.multiply(space2NextHash)).add(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));

                hashes = [] = this.paintInsideHashes(start, end, fieldSide, robotPosition, verticalVector);
                hashes.forEach(element => {
                    tasks.push(element);
                });
            }
        }
        this.options.paintForthAndBack.val ? robotPosition = this.toggleVerticalPosition(robotPosition) : "top";

        if(fieldSide === "rightSide") {
            this.options.paintForthAndBack.val ? robotPosition = this.toggleVerticalPosition(robotPosition) : "top";
            for(let yard = endIndex; yard >= startIndex; yard--) {
                
                this.options.paintForthAndBack.val ? robotPosition = this.toggleVerticalPosition(robotPosition) : "top";
                if(robotPosition === "top") {
                    tasks.unshift(new Line(yardLines[yard].start, yardLines[yard].end));
                }
                else {
                    tasks.unshift(new Line(yardLines[yard].end, yardLines[yard].start));
                }
                
                for(let i = 1; i < 5; i++) {
                    space2NextHash = i * hashSpace;
                    start = yardLines[yard].end.subtract(horizontalVector.multiply(space2NextHash)).subtract(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
                    end = yardLines[yard].start.subtract(horizontalVector.multiply(space2NextHash)).add(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
                    
                    hashes = this.paintInsideHashes(start, end, fieldSide, robotPosition, verticalVector);
                    hashes.forEach(element => {
                        tasks.unshift(element);
                    });
                    robotPosition = this.toggleVerticalPosition(robotPosition);
                }
            }
        }
        else {
            for(let yard = startIndex; yard < endIndex; yard++) {
    
                this.options.paintForthAndBack.val ? robotPosition = this.toggleVerticalPosition(robotPosition) : "top";
                if(robotPosition === "top") {
                    tasks.push(new Line(yardLines[yard].start, yardLines[yard].end));
                }
                else {
                    tasks.push(new Line(yardLines[yard].end, yardLines[yard].start));
                }

                for(let i = 1; i < 5; i++) {
                    robotPosition = this.toggleVerticalPosition(robotPosition);
                    space2NextHash = i * hashSpace;
    
                    start = yardLines[yard].end.add(horizontalVector.multiply(space2NextHash)).subtract(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
                    end = yardLines[yard].start.add(horizontalVector.multiply(space2NextHash)).add(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
    
                    hashes = this.paintInsideHashes(start, end, fieldSide, robotPosition, verticalVector);
                    hashes.forEach(element => {
                        tasks.push(element);
                    });
                }
            }
        }
        return tasks;
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Array} rightY 
     * @param {Array} leftY 
     * @returns {null} if the number option are false
     */
    markNumbers(horizontalVector, verticalVector, rightY, leftY) {
        if(!(this.options.sevenYardMarkNumbers.val || this.options.nineYardMarkNumbers.val)){
            return;
        }

        let yardsWithMarkOn = [];
        let markNumbers = [];
        let tempMarks  = [];
        let yardNumbers;
        let nineYardToSideline = this.options.nineYardToSideline.val - this.options.yardLinesSpaceToSideline.val;
        let verticalDistance = (7).yard2meter() - this.options.yardLinesSpaceToSideline.val;;
        
        if(!this.options.doubleCenterYard.val) {
            yardsWithMarkOn = rightY;
            yardNumbers = leftY.length -1;
            if(!this.options.scalingYardLines.val){
                for(let i = 1; i < yardNumbers; i++){
                    yardsWithMarkOn.push(leftY[i]);
                }
            }
            else{
                for(let i = 0; i < yardNumbers; i++){
                    yardsWithMarkOn.push(leftY[i]);
                }
            }

            yardNumbers = yardsWithMarkOn.length;
            if(this.options.sevenYardMarkNumbers.val){
                markNumbers = this.partMarks("bottom", "right2left", verticalDistance, verticalVector, horizontalVector, yardsWithMarkOn, 1, yardNumbers );
            }
            if( this.options.nineYardMarkNumbers.val) {
                tempMarks = this.partMarks("bottom", "left2Right", nineYardToSideline, verticalVector, horizontalVector, yardsWithMarkOn, yardNumbers-1, 0 );
                markNumbers = markNumbers.concat(tempMarks);
                tempMarks = this.partMarks("top", "right2left", nineYardToSideline, verticalVector, horizontalVector, yardsWithMarkOn, 1, yardNumbers );
                markNumbers = markNumbers.concat(tempMarks);
            }
            if(this.options.sevenYardMarkNumbers.val){
                tempMarks = this.partMarks("top", "left2Right", verticalDistance, verticalVector, horizontalVector, yardsWithMarkOn, yardNumbers-1, 0 );
                markNumbers = markNumbers.concat(tempMarks);
            }
        }
        else {
            let rightYardsLength = rightY.length -1;
            let leftYardsLength = leftY.length-1;
            let startElement;
            let endElement;

            if(this.options.sevenYardMarkNumbers.val) {
                markNumbers = this.partMarks("bottom", "right2left", verticalDistance, verticalVector, horizontalVector, rightY, 1, rightYardsLength);
                markNumbers.push(this.middleMark("right2left", verticalDistance, verticalVector, horizontalVector, rightY[rightYardsLength].end, leftY[0].end));
    
                startElement = (leftYardsLength % 2 == 0 ? 1 : 2);
                tempMarks = this.partMarks("bottom", "right2left", verticalDistance, verticalVector, horizontalVector, leftY, startElement, leftYardsLength);
                markNumbers = markNumbers.concat(tempMarks);
            }
            if(this.options.nineYardMarkNumbers.val){
                // bottom side
                tempMarks = this.partMarks("bottom", "left2right", nineYardToSideline, verticalVector, horizontalVector, leftY, leftYardsLength-1, 0);
                markNumbers = markNumbers.concat(tempMarks);
                markNumbers.push(this.middleMark("left2right", nineYardToSideline, verticalVector, horizontalVector, rightY[rightYardsLength].end, leftY[0].end));
    
                endElement = rightYardsLength % 2 == 0 ? (rightYardsLength -1) : (rightYardsLength);
                tempMarks = this.partMarks("bottom", "left2right", nineYardToSideline, verticalVector, horizontalVector, rightY, endElement, 0);
                markNumbers = markNumbers.concat(tempMarks);
                // top side
                tempMarks = this.partMarks("top", "right2left", nineYardToSideline, verticalVector, horizontalVector, rightY, 1, rightYardsLength);
                markNumbers = markNumbers.concat(tempMarks);
                markNumbers.push(this.middleMark("right2left", -nineYardToSideline, verticalVector, horizontalVector, rightY[rightYardsLength].start, leftY[0].start));
    
                startElement = (leftYardsLength % 2 == 0 ? 1 : 2);
                tempMarks = this.partMarks("top", "right2left", nineYardToSideline, verticalVector, horizontalVector, leftY, startElement, leftYardsLength);
                markNumbers = markNumbers.concat(tempMarks);
            }
            if(this.options.sevenYardMarkNumbers.val){
                tempMarks = this.partMarks("top", "left2right", verticalDistance, verticalVector, horizontalVector, leftY, leftYardsLength-1, 0);
                markNumbers = markNumbers.concat(tempMarks);
                markNumbers.push(this.middleMark("left2right", -verticalDistance, verticalVector, horizontalVector, rightY[rightYardsLength].start, leftY[0].start));
    
                endElement = rightYardsLength % 2 == 0 ? (rightYardsLength -1) : (rightYardsLength);
                tempMarks = this.partMarks("top", "left2right", verticalDistance, verticalVector, horizontalVector, rightY, endElement, 0);
                markNumbers = markNumbers.concat(tempMarks);
            }

        }
        markNumbers.forEach(element => {
            this.tasks.push(new LineTask(this.tasks.length, [element.start, element.end], false, true));
        });
    }
    /**
     * 
     * @param {String} direction 
     * @param {Vector} distanceToFieldSide 
     * @param {Vector} verticalVector 
     * @param {Vector} horizontalVector 
     * @param {Array} rightY 
     * @param {Array} leftY 
     * @returns {Vector} 7 or 9 marks - alternative for number
     */
    middleMark(direction, distanceToFieldSide, verticalVector, horizontalVector, rightY, leftY){
        let hashLength = this.options.hashMarksLength.val;
        let mark, start, end;
        let markMidle = new Line(rightY, leftY).middle;
        start = markMidle.add(verticalVector.multiply(distanceToFieldSide)).subtract(horizontalVector.multiply( 0.5 * hashLength ));
        end = start.add(horizontalVector.multiply(this.options.hashMarksLength.val));

        if(direction === "right2left"){
            return mark = new Line(start, end);
        }
        else{
            return mark = new Line(end, start);
        }
    }
    /**
     * 
     * @param {String} fieldSide 
     * @param {String} direction 
     * @param {Vector} distanceToFieldSide 
     * @param {Vector} verticalVector 
     * @param {Vector} horizontalVector 
     * @param {Array} yards 
     * @param {Number} startElement 
     * @param {Number} endElement 
     * @returns {Array} 7 or 9 marks - alternative for numbers
     */
    partMarks(fieldSide, direction, distanceToFieldSide, verticalVector, horizontalVector, yards, startElement, endElement) {
        let hashLength = this.options.hashMarksLength.val;
        let marks = [];
        let start;
        let end;
        
        if(fieldSide === "bottom") {
            if(direction === "right2left") {
                for( let i = startElement; i < endElement; i+=2) {
                    start = yards[i].end.add(verticalVector.multiply(distanceToFieldSide)).subtract(horizontalVector.multiply( 0.5 * hashLength ));
                    end = start.add(horizontalVector.multiply(hashLength));
                    marks.push(new Line(start, end));
                }
            }
            else{
                for( let i = startElement; i > endElement; i-=2) {
                    start = yards[i].end.add(verticalVector.multiply(distanceToFieldSide)).subtract(horizontalVector.multiply( 0.5 * hashLength ));
                    end = start.add(horizontalVector.multiply(hashLength));
                    marks.push(new Line(end, start));
                }
            }
        }
        else {
            if(direction === "right2left") {
                for( let i = startElement; i < endElement; i+=2) {
                    start = yards[i].start.subtract(verticalVector.multiply(distanceToFieldSide)).subtract(horizontalVector.multiply( 0.5 * hashLength ));
                    end = start.add(horizontalVector.multiply(hashLength));
                    marks.push(new Line(start, end));
                }
            }
            else{
                for( let i = startElement; i > endElement; i-=2) {
                    start = yards[i].start.subtract(verticalVector.multiply(distanceToFieldSide)).subtract(horizontalVector.multiply( 0.5 * hashLength ));
                    end = start.add(horizontalVector.multiply(hashLength));
                    marks.push(new Line(end, start));
                }
            }
        }
        return marks;
    }
    /**
     * 
     * @param {Vector} verticalVector 
     * @param {Array} rightY 
     * @param {Array} leftY 
     * @returns {null} if Number option are false
     */
    numbers(verticalVector, rightY, leftY) {
        if(!this.options.numbers.val) {
            return;
        }

        let yardsWithNumberOn = [];
        let verticalDistance = this.options.numbersTopFromSideLine.val - this.options.yardLinesSpaceToSideline.val;
        let verticalOpposite = verticalVector.multiply(-1);
        let numberOfNumbers;
        let numbersTopCenter;
        let sideLength = rightY.length;
        let numbers;
          
        if(!this.options.doubleCenterYard.val) {
            yardsWithNumberOn = rightY;
            let leftYards = leftY.length;
            if(!this.options.scalingYardLines.val){
                for(let i = 1; i < leftYards; i++){
                    yardsWithNumberOn.push(leftY[i]);
                }
            }
            else{
                for(let i = 0; i < leftYards; i++){
                    yardsWithNumberOn.push(leftY[i]);
                }
            }

            numberOfNumbers = yardsWithNumberOn.length -1;
            numbers = 0;
            for(let i = 1; i < numberOfNumbers; i+=2) {
                numbersTopCenter = yardsWithNumberOn[i].end.add(verticalVector.multiply(verticalDistance));
                numbers = i > sideLength ? numbers-=10 : numbers+=10;
                this.add_number_marking(numbersTopCenter, verticalOpposite,  numbers);
            }

            numbers = 0;
            sideLength = leftY.length -1;
            for(let i = numberOfNumbers-1; i > 0; i-=2) {
                numbersTopCenter = yardsWithNumberOn[i].start.subtract(verticalVector.multiply(verticalDistance));
                numbers = i > sideLength ? numbers+=10 : numbers-=10;
                this.add_number_marking(numbersTopCenter, verticalVector,  numbers);
            }
        }
        else {

            let yardStart;
            numbers = 0;
            numberOfNumbers = rightY.length -1;
            for( let i = 1; i < numberOfNumbers; i+=2) {
                numbersTopCenter = rightY[i].end.add(verticalVector.multiply(verticalDistance));
                numbers +=10;
                this.add_number_marking(numbersTopCenter, verticalOpposite,  numbers);
            }
            let markMidle = new Line(rightY[numberOfNumbers].end, leftY[0].end).middle;
            numbers += 10;
            numbersTopCenter = markMidle.add(verticalVector.multiply(verticalDistance));
            this.add_number_marking(numbersTopCenter, verticalOpposite,  numbers);

            numberOfNumbers = leftY.length -1;
            yardStart = (numberOfNumbers % 2 == 0 ? 1 : 2);
            for(let i = yardStart; i < numberOfNumbers; i+=2) {
                numbers -= 10;
                numbersTopCenter = leftY[i].end.add(verticalVector.multiply(verticalDistance));
                this.add_number_marking(numbersTopCenter, verticalOpposite,  numbers);
            }
            numbers = 0;
            numberOfNumbers = leftY.length -2;
            for(let i = numberOfNumbers; i > 0; i-=2) {
                numbers += 10;
                numbersTopCenter = leftY[i].start.subtract(verticalVector.multiply(verticalDistance));
                this.add_number_marking(numbersTopCenter, verticalVector,  numbers);
            }

            numbers += 10;
            numberOfNumbers = rightY.length -1;
            markMidle = new Line(rightY[numberOfNumbers].start, leftY[0].start).middle;
            numbersTopCenter = markMidle.subtract(verticalVector.multiply(verticalDistance));
            this.add_number_marking(numbersTopCenter, verticalVector,  numbers);

            yardStart = numberOfNumbers % 2 == 0 ? (numberOfNumbers-1) : (numberOfNumbers -2);
            for( let i = yardStart; i > 0; i-=2) {
                numbers -= 10;
                numbersTopCenter = rightY[i].start.subtract(verticalVector.multiply(verticalDistance));
                this.add_number_marking(numbersTopCenter, verticalVector,  numbers);
            }
        }
    }
    /**
     * 
     * @param {Vector} horizontalVector 
     * @param {Vector} verticalVector 
     * @param {Array} rightY 
     * @param {Array} leftY 
     * @returns {null} if center cross option are false
     */
    centerCross(horizontalVector, verticalVector, rightY, leftY) {
        if(!this.options.centerCross.val){
            return;
        }
        let position = rightY.length-3;
        let crossLength = 0.5 * this.options.centerCrossLength.val;
        let topRight;
        let topLeft;
        let bottomRight;
        let bottomLeft;
        let X;
        let side = "right";
        
        for(let i = 0; i < 2; i++) {
            if(side === "right") {
                if(this.options.doubleCenterYard.val){
                    X = rightY[position].middle;
                }
                else{
                    if(!(this.options.doubleCenterYard.val || this.options.scalingYardLines.val)) {
                        position = leftY.length -3;
                        X = rightY[position].middle;
                    }
                    else{
                        position = leftY.length -2;
                        X = rightY[position].middle;
                    }
                }
            }else{
                if(this.options.doubleCenterYard.val){
                    X = leftY[2].middle;
                }
                else{
                    if(!(this.options.doubleCenterYard.val || this.options.scalingYardLines.val)) {
                        position = 2;
                        X = leftY[position].middle;
                    }
                    else{
                        X = leftY[1].middle;
                    }
                }
            }
            topRight = X.subtract(horizontalVector.multiply(crossLength)).add(verticalVector.multiply(crossLength));
            topLeft = X.add(horizontalVector.multiply(crossLength)).add(verticalVector.multiply(crossLength));
            bottomRight = X.subtract(horizontalVector.multiply(crossLength)).subtract(verticalVector.multiply(crossLength));
            bottomLeft = X.add(horizontalVector.multiply(crossLength)).subtract(verticalVector.multiply(crossLength));

            this.tasks.push(new LineTask(this.tasks.length, [bottomLeft, topRight], false, true));
            this.tasks.push(new LineTask(this.tasks.length, [topLeft, bottomRight], false, true));
        
            side = "left";
        }
    }



    draw() {
        delete this.calculated_drawing_points;
        this.refresh_snapping_lines();
        this.tasks = [ ];
        this.start_locations = [ ];    
        let p = this.scalePitchSize(this.drawing_points);
        let c1 = p[0];
        let c2 = p[1];
        let c3 = p[2];
        let c4 = p[3];
        let horizontalVector = new Line( c2, c3 ).unit_vector; 
        let verticalVector = horizontalVector.rotate_90_cw(); 

        let rightYards = this.defineYardLinesPositions(c1, c2, c3, c4, horizontalVector, verticalVector, "left2Right", "bottom");
        let leftYards = this.defineYardLinesPositions(c1, c2, c3, c4, horizontalVector, verticalVector, "right2Left", "top");
        let yardLines = [] = rightYards.concat(leftYards);
        
        let side = "rightSide";
        let position = "bottom";
        this.numbers(verticalVector, rightYards, leftYards);
        this.markNumbers(horizontalVector, verticalVector, rightYards, leftYards);
        position = this.nitroLines(c1, c2, c3, c4, horizontalVector, verticalVector, side, position);
        
        if(this.options.sideHashMarks.val && this.options.middleHashMarks.val && this.options.yardLines.val) {
            this.threeYardLine(c1, c2, c3, c4, horizontalVector, verticalVector, side, "bottom");
            this.horizontalHashMarks(horizontalVector, verticalVector, yardLines);
            position = this.endzoneInsideLines(c1, c2, c3, c4, horizontalVector, side, position);
            this.paintAllVerticalLinesInsideField(horizontalVector, verticalVector, position, yardLines);
            this.endzoneInsideLines(c1, c2, c3, c4, horizontalVector, "leftSide", position);  
            this.threeYardLine(c1, c2, c3, c4, horizontalVector, verticalVector, "leftSide", "top");
            this.nitroLines(c1, c2, c3, c4, horizontalVector, verticalVector, 'leftSide');
        }
        else {

            this.horizontalHashMarks(horizontalVector, verticalVector, yardLines);
            this.threeYardLine(c1, c2, c3, c4, horizontalVector, verticalVector, side, "top");
            this.middleHashMarks(horizontalVector, verticalVector, yardLines);
            this.sideHashMarks(horizontalVector, verticalVector, "bottom", yardLines);
            position = this.nitroLines(c1, c2, c3, c4, horizontalVector, verticalVector, 'leftSide', position);
            this.sideHashMarks(horizontalVector, verticalVector, "top", yardLines);
            this.threeYardLine(c1, c2, c3, c4, horizontalVector, verticalVector, "leftSide", "bottom");
            position = this.endzoneInsideLines(c1, c2, c3, c4, horizontalVector, side, position);
            position = this.yardLines( yardLines, position);
            position = this.endzoneInsideLines(c1, c2, c3, c4, horizontalVector, "leftSide", position);  
        }

        this.teamBox(c1, c2, c3, c4, horizontalVector, verticalVector, 'bottom', yardLines);
        this.sidelines(c1, c2, c3, c4, horizontalVector, verticalVector);
        this.wideSideLines(c1, c2, c3, c4, horizontalVector, verticalVector);
        this.teamBox(c1, c2, c3, c4, horizontalVector, verticalVector, 'top', yardLines);
        this.centerCross(horizontalVector, verticalVector, rightYards, leftYards);
        this.restrainingLines(c1, c2, c3, c4, horizontalVector, verticalVector, yardLines);
        this.mediaLines(c1, c2, c3, c4, horizontalVector, verticalVector);


        this.refresh_bb();
        this.refresh_handles();
        this.refresh_test_run();
        this.refresh_snapping_lines();  
    }


    /**
     * 
     * @param {Array} p 
     * @returns {Array}
     */
    scalePitchSize(p) {
        // Remember, because of the endzone width has to be 30 feet from inside to inside, we need to put one lines width on the field length
        // In the case of having double yard lines in the middle of the field, then we nned to add one more line width on the field length for not getting issues with the yard lines or endzone spaces
        let c1 = p[0];
        let c2 = p[3];
        let c3 = p[4];
        let c4 = p[7];
        let horizontalVector = new Line( c2, c3 ).unit_vector; // long length
        let lineWidth = this.options.LineWidth.val;  
        let corners = [];

        if(this.options.doubleCenterYard.val) {
            c1 = c1.add(horizontalVector.multiply( lineWidth ));
            c2 = c2.add(horizontalVector.multiply(  lineWidth ));
            c3 = c3.subtract(horizontalVector.multiply( lineWidth ));
            c4 = c4.subtract(horizontalVector.multiply( lineWidth ));
        }else {
            c1 = c1.add(horizontalVector.multiply(  0.5 * lineWidth ));
            c2 = c2.add(horizontalVector.multiply(  0.5 * lineWidth ));
            c3 = c3.subtract(horizontalVector.multiply( 0.5 *  lineWidth ));
            c4 = c4.subtract(horizontalVector.multiply( 0.5 *  lineWidth ));
        }
        corners.push(c1, c2, c3, c4);
        return corners;
    }
    /**
     * 
     * @param {Vector} c1 
     * @param {Vector} c2 
     * @param {Vector} c3 
     * @param {Vector} c4 
     * @param {Vector} horizontalVector 
     * @param {String} fieldSide 
     * @param {String} robotPosition 
     * @returns {null} an Array of Vector
     */
    endzoneInsideLines(c1, c2, c3, c4, horizontalVector, fieldSide, robotPosition) {
        console.log("Endzone start position: " + robotPosition);
        let endzoneW = this.options.endZoneWidth.val;
        let lineWidth = this.options.LineWidth.val;
        let position = robotPosition;
        let start; 
        let end;
        let insideLines = [];

        if(fieldSide ==="rightSide") {
            start = c2.add(horizontalVector.multiply(endzoneW - lineWidth));
            end = c1.add(horizontalVector.multiply(endzoneW - lineWidth));
        }
        if(fieldSide ==="leftSide") {
            start = c3.subtract(horizontalVector.multiply(endzoneW - lineWidth));
            end = c4.subtract(horizontalVector.multiply(endzoneW - lineWidth));
        }
        this.start_locations.push( new StartLocation( start, this.tasks.length ) ); 

        if(position === "bottom"){
            insideLines.push(new Line(start, end));
        }
        else {
            insideLines.push(new Line(end, start));
        }

        if(this.options.wideSideLines.val && this.options.endzon) {            
            position = this.toggleVerticalPosition(position);

            if(fieldSide === "rightSide") {
                start = start.subtract(horizontalVector.multiply( 0.8 * lineWidth ));  // times 0.8 instead of 1 for making a little overlab, so there is no space between the widelines and sidelines
                end = end.subtract(horizontalVector.multiply( 0.8 * lineWidth ));
            }
            else {
                start = start.add(horizontalVector.multiply( 0.8 * lineWidth ));
                end = end.add(horizontalVector.multiply( 0.8 * lineWidth));
            }
            if(position === "bottom"){
                insideLines.push(new Line(start, end));
            }
            else {
                insideLines.push(new Line(end, start));
            }
        }

        insideLines.forEach(element => {
            this.tasks.push(new LineTask( this.tasks.length, [element.start, element.end], false, true));
        });

        position = this.toggleVerticalPosition(position);
        return position;
    }
    /**
     * 
     * @param {Array} yardLines 
     * @param {String} robotPosition 
     */
        turnYardLinesDirection(yardLines, robotPosition) {
            // Making the yardlines to have the same direction
            let start;
            let end;

            let oneDirectionedYards = [];
            yardLines.forEach(element =>{
                robotPosition = this.toggleVerticalPosition(robotPosition);
                if(robotPosition === "bottom") {
                    start = element.start;
                    end = element.end;
                }
                else {
                    start = element.end;
                    end = element.start;
                }

                oneDirectionedYards.push(new Line(start, end));
                return oneDirectionedYards;
            });
        }
    /**
     * 
     * @param {Vector} topOfNumber 
     * @param {Vector} verticalVector 
     * @param {Number} number 
     * @returns {Task}
     */
    add_number_marking( topOfNumber, verticalVector, number )
    {
        let number_height = this.options.hieghtOfNumbers.val;
        let middle = topOfNumber.add(verticalVector.multiply( 0.5 * (number_height + this.options.LineWidth.val )));
        let g = verticalVector.multiply( 0.5 * ( number_height + this.options.LineWidth.val ));

        let number_job = new Text( 0, "", "free_hand" );
        number_job.points.push( middle );
        number_job.options.Width.val = number_height;
        number_job.options.text.val = "" + number;
        number_job.options.Angle.val = g.angle + Math.PI / 2;
        number_job.options.font.val = this.options.numberFont.val;
        number_job.options.extra_space.val = -this.options.LineWidth.val * 2 + (2).foot2meter();
        number_job.options.natual_space_between.val = false;
        number_job.options.center_after_letter.val = 0;
        number_job.draw();
        number_job.tasks.forEach((t,i) => {
        t.id = this.tasks.length + i;
        });
        this.tasks.pushAll( number_job.tasks );

        return number_job.tasks;
    }
    /**
     * 
     * @param {String} position 
     * @returns {String}
     */
    toggleVerticalPosition(position) 
    {
        return position == "top" ? "bottom" : "top";
    }
    /**
     * 
     * @param {String} fieldSide 
     * @returns {String}
     */
        toggleFieldSide(fieldSide) {
            return fieldSide == "rightSide" ? "leftSide" : "rightSide";
        }
    /**
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     */
    paintDashedLines(start, end)
    {
      this.tasks.push( new LineTask(this.tasks.length, [start, end], false, true));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options.restrainingDashLength.val ));
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options.restrainingDashSpace.val ));
    }
    /**
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     * @param {String} fieldSide 
     * @param {String} robotPosition 
     * @param {Vector} verticalVector 
     * @returns {Vector}
     */
    paintYardLine(start, end, fieldSide, robotPosition, verticalVector) {
        let newStart;
        let newEnd;
        let line = [];

        if(fieldSide === "rightSide") {
            newStart = start.add(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
            newEnd = end.subtract(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
        }
        else {
            newStart = start.subtract(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
            newEnd = end.add(verticalVector.multiply(this.options.yardLinesSpaceToSideline.val));
        }

        if(robotPosition === "bottom") {
            line = [newStart, newEnd];
        }else {
            line = [newEnd, newStart];
        }
        return line;
    }
    /**
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     * @param {String} fieldSide 
     * @param {String} robotPosition 
     * @param {Vector} verticalVector 
     * @returns 
     */
    paintInsideHashes(start, end, fieldSide, robotPosition, verticalVector) {
        let bottomHashStart;
        let bottomHashEnd;
        let middleBottomHashStart;
        let middleBottomHashEnd;
        let middleTopHashStart; 
        let middleTopHashEnd;  
        let topHashStart;     
        let topHashEnd;
        let position = robotPosition;
        let side = fieldSide;
        let hashes = [];

        if(!this.options.paintForthAndBack.val) {
            position = "top"; 
            side = "leftSide";
            if(fieldSide === "leftSide") {
                position = "bottom";
            }
        }

        bottomHashStart = start.add(verticalVector.multiply(this.options.sideHashMarksSpaceToSideline.val));
        bottomHashEnd = bottomHashStart.add( verticalVector.multiply(this.options.hashMarksLength.val ));
        middleBottomHashStart = start.add(verticalVector.multiply(this.options.middleHashMarksSpaceToSideline.val));
        middleBottomHashEnd = middleBottomHashStart.add( verticalVector.multiply(this.options.hashMarksLength.val ));
        middleTopHashStart = end.subtract(verticalVector.multiply(this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val));
        middleTopHashEnd = middleTopHashStart.add(verticalVector.multiply( this.options.hashMarksLength.val));
        topHashStart = end.subtract(verticalVector.multiply(this.options.sideHashMarksSpaceToSideline.val + this.options.hashMarksLength.val));
        topHashEnd = topHashStart.add(verticalVector.multiply( this.options.hashMarksLength.val));

        if(fieldSide === "rightSide") {
            if(position === "bottom") {
                hashes[0] = new Line(bottomHashEnd, bottomHashStart);
                hashes[1] = new Line(middleBottomHashEnd, middleBottomHashStart);
                hashes[2] = new Line(middleTopHashEnd, middleTopHashStart);
                hashes[3] = new Line(topHashEnd, topHashStart);
            }
            else {
                hashes[0] = new Line(topHashStart, topHashEnd);
                hashes[1] = new Line(middleTopHashStart, middleTopHashEnd);
                hashes[2] = new Line(middleBottomHashStart, middleBottomHashEnd);
                hashes[3] = new Line(bottomHashStart, bottomHashEnd);
            }
        }
        else {
            if(position === "bottom") {
                hashes[0] = new Line(bottomHashStart, bottomHashEnd);
                hashes[1] = new Line(middleBottomHashStart, middleBottomHashEnd);
                hashes[2] = new Line(middleTopHashStart, middleTopHashEnd);
                hashes[3] = new Line(topHashStart, topHashEnd);
            }
            else {

                hashes[0] = new Line(topHashEnd, topHashStart);
                hashes[1] = new Line(middleTopHashEnd, middleTopHashStart);
                hashes[2] = new Line(middleBottomHashEnd, middleBottomHashStart);
                hashes[3] = new Line(bottomHashEnd, bottomHashStart);
            }
        }
        return hashes;
    }
   
    refresh_handles()
    {
      var this_class = this;
      this.handles = [ ];
      var p = this.drawing_points;
  
      // Free hand handles
      if( this.layout_method === "free_hand" || this_class.layout_method === "corner,side")
      {
  
        if( !this.options.disableLengthHandles.val )
        {
          this.handles.push( new Handle( new Line( p[5], p[6] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
          {
            var g = new Line( p[0], p[7] );
  
            if( this_class.options.SizeHandlesMoveCenter.val )
            {
              var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
  
              this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
  
              var new_ps = this_class.drawing_points;
              var align_this = this_class.get_align_move( [ new Line( new_ps[5], new_ps[6] ) ], snapping_lines )[0];
              if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_length += align_this.length;
              }
              else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_length -= align_this.length;
              }

              if( this_class.options.scalingYardLines.val )   
              {
                var track_length_in_yards = new_length.meter2yard();
                var n = Math.floor( track_length_in_yards / 10 );
      
                new_length = n * 10;      
                new_length = new_length.yard2meter();
      
                if( new_length < (10).yard2meter() )
                  new_length = (10).yard2meter();
              }
            //   else {
            //     new_length = align_this.length;
            //   }
  
              this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
            }
            else
            {
  
              var new_length = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
              return this_class.set_new_val( this_class.options.Length, new_length, false );
            }
          }, function( new_length )
          {
            if( this_class.options.SizeHandlesMoveCenter.val )
              return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
            else
              return this_class.set_new_val( this_class.options.Length, new_length, false );
          } ) );
  
          this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
          {
            var g = new Line( p[7], p[0] );
  
            if( this_class.options.SizeHandlesMoveCenter.val )
            {
              var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
              this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
  
              var new_ps = this_class.drawing_points;
              var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
              if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_length -= align_this.length;
              }
              else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_length += align_this.length;
              }

  
              if( this_class.options.scalingYardLines.val )   // to scale the length in yard 
              {
                var track_length_in_yards = new_length.meter2yard();
                var n = Math.floor( track_length_in_yards / 10 );
      
                new_length = n * 10;      
                new_length = new_length.yard2meter();
      
                if( new_length < (10).yard2meter() )
                  new_length = (10).yard2meter();
              }
            //   else {
            //     new_length -= align_this.length;
            //   }


              this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
            }
            else
            {
  
              var new_length = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
              return this_class.set_new_val( this_class.options.Length, new_length, false );
            }
          }, function( new_length )
          {
            if( this_class.options.SizeHandlesMoveCenter.val )
              return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
            else
              return this_class.set_new_val( this_class.options.Length, new_length, false );
          } ) );
        }
  
        if( !this.options.disableWidthHandles.val )
        {
          this.handles.push( new Handle( new Line( p[3], p[4] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
          {
            var g = new Line( p[0], p[3] );
  
            if( this_class.options.SizeHandlesMoveCenter.val )
            {
              var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
              this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
  
              var new_ps = this_class.drawing_points;
              var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];
              if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_width -= align_this.length;
              }
              else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_width += align_this.length;
              }
  
              this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
            }
            else
            {
              var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
              this_class.set_new_val( this_class.options.Width, new_width, false );
            }
          }, function( new_width )
          {
            if( this_class.options.SizeHandlesMoveCenter.val )
              return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
            else
              return this_class.set_new_val( this_class.options.Length, new_width, false );
          } ) );
  
          this.handles.push( new Handle( new Line( p[0], p[7] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
          {
            var g = new Line( p[3], p[0] );
  
            if( this_class.options.SizeHandlesMoveCenter.val )
            {
  
              var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
              this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );
  
              var new_ps = this_class.drawing_points;
              var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];
              if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_width += align_this.length;
              }
              else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
              {
                new_width -= align_this.length;
              }
  
              this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );
            }
            else
            {
              var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
              this_class.set_new_val( this_class.options.Width, new_width, false );
  
            }
          }, function( new_width )
          {
            if( this_class.options.SizeHandlesMoveCenter.val )
              return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );
            else
              return this_class.set_new_val( this_class.options.Length, new_width, false );
          } ) );
        }
  
        var e1 = new Line( p[1], p[2] ).middle;
        var e2 = new Line( p[5], p[6] ).middle;
        var pitch_center = new Line( e1, e2 ).middle;
        this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
        {
  
          var g = new_pos_v.subtract( this_class.points[0] );
          this_class.move_all( g );
          this_class.refresh_snapping_lines();
  
          var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );
  
          var align_lines = align_this[1];
          align_this = align_this[0];
  
          this_class.move_all( align_this.multiply( -1 ) );
          this_class.refresh_snapping_lines();
  
          return align_lines;
        }, function( new_pos_v )
        {
  
          this_class.points = [ new_pos_v ];
          this_class.draw();
          return true;
        } ) );
  
        var gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
        this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
        {
  
          var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle - gml;
          var align_this = this_class.get_snap_rotation( new_angle, snapping_lines );
          var align_lines = align_this[1];
          new_angle = align_this[0];
  
          this_class.options.Angle.val = new_angle;
          delete this.calculated_drawing_points;
          this_class.draw();
  
          return align_lines;
        }, function( new_angle )
        {
          return this_class.set_new_val( this_class.options.Angle, new_angle );
        }, "deg" ) );
      }
      else if( login_screen_controller.user_level === user_level.DEVELOPER )
      {
        //var e1 = new Line( p[1], p[2] ).middle;
        //var e2 = new Line( p[5], p[6] ).middle;
        var pitch_center = this.get_middle( p );
        var original_points = this_class.points.copy();
        this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
        {
  
  
          var diff_vec = new_pos_v.subtract( pitch_center );
          this_class.points = original_points.map( function( p )
          {
            return p.add( diff_vec );
          } );
  
          delete this_class.calculated_drawing_points;
          this_class.draw();
  
        }, function( new_pos_v )
        {
  
          var diff_vec = new_pos_v.subtract( pitch_center );
          this_class.points = original_points.map( function( p )
          {
            return p.add( diff_vec );
          } );
          //this_class.points = [new_pos_v];
          delete this_class.calculated_drawing_points;
          this_class.draw();
          return true;
        } ) );
      }
  
      // 2 points handles
      if( this.layout_method === "corner,side" )
      {
  
        this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
            // let c2 = p[3];
            // let c3 = p[4];
  
          var g = new Line( p[4], p[3] );
          var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.Length, new_length );
  
          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
          if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length += align_this.length;
          }
          else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length -= align_this.length;
          }
  
          this_class.set_new_val( this_class.options.Length, new_length );
  
        }, function( new_length )
        {
          return this_class.set_new_val( this_class.options.Length, new_length );
        } ) );
  
        var handle_center = new Line( p[3], p[4] ).middle;
        if( this.options.Rotation.val === 1 || this.options.Rotation.val === 4 )
          handle_center = new Line( p[0], p[7] ).middle;
  
        this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
  
          var g = new Line( p[0], p[3] );
          if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
            g = new Line( p[3], p[0] );
          var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.Width, new_width );
  
          var new_ps = this_class.drawing_points;
          var align_this;
          if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
            align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
          else
            align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );
          var the_lines = align_this[1];/*.map( function ( line, i ) {
           return new LineTask( i, [line.start, line.end], false, true );
           } );*/
          align_this = align_this[0];
  
          if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width += align_this.length;
          }
          else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width -= align_this.length;
          }
  
          this_class.set_new_val( this_class.options.Width, new_width );
          return the_lines;
        }, function( new_width )
        {
          return this_class.set_new_val( this_class.options.Width, new_width );
        } ) );
      }
  
      // 2 corners handles
      if( this.layout_method === "two_corners" )
      {
  
        var handle_center = new Line( p[3], p[4] ).middle;
        if( this_class.options.Rotation.val % 2 )
          handle_center = new Line( p[0], p[7] ).middle;
  
        this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
  
          var g = new Line( p[0], p[3] );
          if( this_class.options.Rotation.val % 2 )
            g = new Line( p[3], p[0] );
          var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.Width, new_width );
  
          var new_ps = this_class.drawing_points;
          var align_this;
          if( this_class.options.Rotation.val % 2 )
            align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
          else
            align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );
  
          var the_lines = align_this[1];/*.map( function ( line, i ) {
           return new LineTask( i, [line.start, line.end], false, true );
           } );*/
          align_this = align_this[0];
  
          if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width += align_this.length;
          }
          else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width -= align_this.length;
          }
          /*if ( ( align_this.angle - this_class.options.Angle.val ) > 0 )
           new_width -= align_this.length;
           else
           new_width += align_this.length;*/
          this_class.set_new_val( this_class.options.Width, new_width );
  
          return the_lines;
        }, function( new_width )
        {
          return this_class.set_new_val( this_class.options.Width, new_width );
        } ) );
      }
  
      if( this.layout_method === "all_goal_posts" )
      {
        var middle_corners = p.slice( p.length / 2 - 1 );
        var handle1 = new Line( middle_corners[0], middle_corners[1] );
        var handle2 = new Line( p[0], p.last() );
        var center_line = new Line( handle1.middle, handle2.middle );
        var center = center_line.middle;
  
        this.handles.push( new Handle( handle1.middle, -handle1.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
          this_class.set_new_val( this_class.options.Width, new_width );
  
          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];
  
          if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width -= align_this.length * 2;
          }
          else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width += align_this.length * 2;
          }
  
          this_class.set_new_val( this_class.options.Width, new_width );
  
        }, function( new_width )
        {
          return this_class.set_new_val( this_class.options.Width, new_width );
        } ) );
  
        this.handles.push( new Handle( handle2.middle, -handle2.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
          this_class.set_new_val( this_class.options.Width, new_width );
  
          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];
  
          if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width += align_this.length * 2;
          }
          else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_width -= align_this.length * 2;
          }
  
          this_class.set_new_val( this_class.options.Width, new_width );
        }, function( new_width )
        {
          return this_class.set_new_val( this_class.options.Width, new_width );
        } ) );
      }
  
    }
}


// Finished
class AmericanFootball6v6USV2 extends __AmericanFootball {

    static template_title = "6v6 V2";// Translateable
    static template_id = "american_football_6v6_us_v2_beta"; // no spaces
    static template_image = "img/templates/football_high_school_black.png"; // no spaces
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        let this_class = this;
        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;
        this.options.Length.val = (300).foot2meter();
        this.options.Width.val = (120).foot2meter();
        this.options.doubleCenterYard.val = false;

        this.options.sideHashMarksSpaceToSideline.val = (8).inch2meter();
        this.options.numbers.configurable = false;
        this.options.numbers.val = false;
        this.options.sevenYardMarkNumbers.val = false;
        this.options.middleHashMarksSpaceToSideline.val = (45).foot2meter();
        this.options.horizontalHashmarksToSideline.val = ((45).foot2meter() + this.options.hashMarksLength.val);
        this.options.nitroLines.val = false;
        this.options.restrainingLines.val = false;
        this.options.wideSideLines.val = false;
        this.options.driveAroundGoal.val = false;

    }
}

// Finished
class AmericanFootball8v8USV2 extends __AmericanFootball {

    static template_title = "8v8 V2";// Translateable
    static template_id = "american_football_8v8_us_v2_beta"; // no spaces
    static template_image = "img/templates/football_high_school_black.png"; // no spaces
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        let this_class = this;
        this.options["Right goal pole"].configurable = false;
        this.options["Left goal pole"].configurable = false;
        this.options.Length.val = (300).foot2meter();
        this.options.Width.val = (120).foot2meter();
        this.options.doubleCenterYard.val = false;

        this.options.sideHashMarksSpaceToSideline.val = (8).inch2meter();
        this.options.numbers.configurable = false;
        this.options.numbers.val = false;
        this.options.sevenYardMarkNumbers.val = false;
        this.options.middleHashMarksSpaceToSideline.val = (45).foot2meter();
        this.options.horizontalHashmarksToSideline.val = ((45).foot2meter() + this.options.hashMarksLength.val);
        this.options.nitroLines.val = false;
        this.options.restrainingLines.val = false;
        this.options.wideSideLines.val = false;
        this.options.driveAroundGoal.val = false;
    }
}

// Finished
class AmericanFootballHighSchool9v9USV2 extends __AmericanFootball {
    static template_title = "High school 9v9 V2";// Translateable
    static template_id = "american_football_9v9_us_v2_beta"; // no spaces
    static template_image = "img/templates/football_high_school_black.png"; // no spaces
  
    constructor( id, name, layout_method ) {
        super( id, name, layout_method );
        const this_class = this;
        this.options.Length.val = (100).yard2meter();
        this.options.Width.val = (40).yard2meter();
        this.options.doubleCenterYard.val = false;
        this.options.scalingYardLines.val = true;
        this.options.scalingYardLines.dontsave = true;

        this.options.nitroLines.val = false;
        this.options.hashMarksLength.val = (0.7).yard2meter();
        this.options.middleHashMarksSpaceToSideline.val = (10.35).yard2meter();
        this.options.horizontalHashmarksToSideline.val = this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val;
        this.options.wideSideLines.val = false;
        this.options.sevenYardMarkNumbers.val = true;
        this.options.nineYardMarkNumbers.val = false;
        this.options.restrainingLines.val = false;
        this.options.sideHashMarksSpaceToSideline.val = (8).inch2meter() - this.options.yardLinesSpaceToSideline.val;
        this.options.teamBoxStandard.val = false;
        this.options.teamBoxHighschool.val = true;
        this.options.teamBoxWidth.val = (6).yard2meter();
        this.options.centerCross.val = true;
        this.options.restrainingDashLength.val = (0.35).yard2meter();
        this.options.restrainingDashSpace.val = (0.65).yard2meter();
    }
}

// Finished
class AmericanFootballCollegeEUV2 extends __AmericanFootball
{
  static template_title = "College EU V2";  
  static template_id = "american_football_college_eu_v2_beta";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.NegativeLineWidth.val = true;
    this.options.Length.val = (360).foot2meter();
    this.options.Width.val = (160).foot2meter();
    this.options.hashMarksLength.val = (2).foot2meter();
    this.options.middleHashMarksSpaceToSideline.val = (60).foot2meter() - this.options.hashMarksLength.val;
    this.options.horizontalHashmarksToSideline.val = (this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val);
    this.options.teamBoxToEndzone.val = 5;
    this.options.coachAreaWidth.val = (3).yard2meter();
    this.options.teamBoxWidth.val = (15).yard2meter();
    this.options.scalingYardLines.val = false;
    this.options.sevenYardMarkNumbers.val = false;
    this.options.nineYardMarkNumbers.val = true;
    this.options.restrainingLines.val = false;
    this.options.driveAroundGoal.val = false;
    this.options.nitroLines.val = false;

  }
}

// Finished
class AmericanFootballCustomV2 extends __AmericanFootball
{
  static template_title = "Custom V2";  
  static template_id = "american_football_custom_v2_beta";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.NegativeLineWidth.val = true;
    this.options.sideHashMarksSpaceToSideline.val = (5).inch2meter();
    this.options.middleHashMarksSpaceToSideline.val = (60).foot2meter();
    this.options.horizontalHashmarksToSideline.val = (this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val);
    this.options.teamBoxToEndzone.val = 5;
    this.options.scalingYardLines.val = false;
    this.options.nitroLines.val = true;

  }
}

// Finished
class AmericanFootballCollegeUSV2 extends __AmericanFootball
{
  static template_title = "College US V2";
  static template_id = "american_football_college_us_v2_beta";
  static template_image = "img/templates/american_football.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.doubleCenterYard.val = false;
    this.options.wideSideLines.val = false;
    this.options.nitroLines.val = false;
    this.options.hashMarksLength.val = (0.7).yard2meter();
    this.options.restrainingLines.val = false;
    this.options.threeYardLineToGoalLine.val = (3).yard2meter();
    this.options.teamBoxWidth.val = (15).yard2meter();
    this.options.teamBoxToSideline.val = (2).yard2meter();
    this.options.coachAreaWidth.val = (3).yard2meter();
    this.options.teamBoxStandard.val = true;
    this.options.teamBoxToEndzone.val = 5;
    this.options.nineYardMarkNumbers.val = true;
    this.options.sevenYardMarkNumbers.val = true;
    this.options.middleHashMarksSpaceToSideline.val = ((60).foot2meter() - this.options.hashMarksLength.val);
    this.options.horizontalHashmarksToSideline.val = this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val;
    this.options.driveAroundGoal.val = false;
    this.options.goalWidth.val = (18).foot2meter() + (6).inch2meter();

  }
}

// Finished
class AmericanFootballHighSchoolUSV2 extends __AmericanFootball {
    static template_title = "High school US V2";// Translateable
    static template_id = "american_football_highschool_us_v2_beta"; // no spaces
    static template_image = "img/templates/football_high_school_black.png"; // no spaces
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        this.options.scalingYardLines.val = false;
        this.options.scalingYardLines.dontsave = true;
        this.options.wideSideLines.val = true;
        this.options.teamBoxToEndzone.val = 5;
        this.options.teamBoxHighschool.val = true;
        this.options.teamBoxStandard.val = false;
        this.options.numbers.val = false;
        this.options.sevenYardMarkNumbers.val = false;
        this.options.nineYardMarkNumbers.val = true;
        this.options.yardLinesSpaceToSideline.val = (4).inch2meter();
        this.options.hashMarksLength.val = (0.8).yard2meter();
        this.options.sideHashMarksSpaceToSideline.val = (4).inch2meter();
        this.options.middleHashMarksSpaceToSideline.val = (17).yard2meter();
        this.options.horizontalHashmarksToSideline.val = this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val;
        this.options.goalWidth.val = (23).foot2meter() + (4).inch2meter();
        this.options.restrainingLines.val = false;
        this.options.nitroLines.val = false;
        this.options.centerCross.val = true;
    
    }
}

// Finished
class AmericanFootballHighSchoolEUV2 extends __AmericanFootball
{
    static template_title = "High school EU V2";// Translateable
    static template_id = "american_football_highschool_eu_v2_beta"; // no spaces
    static template_image = "img/templates/football_high_school_black.png"; // no spaces
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        this.options.Length.val = (360).foot2meter();
        this.options.Width.val = (160).foot2meter();
        this.options.doubleCenterYard.val = true;
        this.options.teamBoxHighschool.val = true;
        this.options.goalWidth.val = (23).foot2meter() + (4).inch2meter();
        this.options.restrainingLines.val = false;
        this.options.numbers.val = false;
        this.options.nitroLines.val = false;
        this.options.centerCross.val = true;
        this.options.teamBoxToEndzone.val = 5;
        this.options.driveAroundGoal.val = false;
        this.options.sideHashMarksSpaceToSideline.val = (8).inch2meter();
        this.options.middleHashMarksSpaceToSideline.val = (18).yard2meter() - this.options.hashMarksLength.val;
        this.options.horizontalHashmarksToSideline.val =(18).yard2meter();
        this.options.nineYardMarkNumbers.val = true;
    }
}

// Finished
class AmericanFootballProfessionalUSV2 extends __AmericanFootball
{
    static template_title = "Professional V2";// Translateable
    static template_id = "american_football_professional_us_v2_beta"; // no spaces
    static template_image = "img/templates/american_football_professional.png"; // no spaces
    constructor( id, name, layout_method )
    {
        super( id, name, layout_method );
        this.options.doubleCenterYard.val = false;
        this.options.wideSideLines.val = false;
        this.options.nitroLines.val = false;
        this.options.hashMarksLength.val = (0.7).yard2meter();
        this.options.restrainingLines.val = false;
        this.options.threeYardLineToGoalLine.val = (2).yard2meter();
        this.options.teamBoxWidth.val = (15).yard2meter();
        this.options.teamBoxToSideline.val = (2).yard2meter();
        this.options.coachAreaWidth.val = (3).yard2meter();
        this.options.teamBoxStandard.val = true;
        this.options.teamBoxToEndzone.val = 5;
        this.options.nineYardToSideline.val = (12).yard2meter();
        this.options.nineYardMarkNumbers.val = true;
        this.options.sideHashMarksSpaceToSideline.val = (4).inch2meter();
        this.options.yardLinesSpaceToSideline.val = (4).inch2meter();
        this.options.middleHashMarksSpaceToSideline.val = ((23.5).yard2meter() - (this.options.hashMarksLength.val - this.options.yardLinesSpaceToSideline.val));
        this.options.horizontalHashmarksToSideline.val = this.options.middleHashMarksSpaceToSideline.val + this.options.hashMarksLength.val;
        this.options.driveAroundGoal.val = false;
        this.options.goalWidth.val = (18).foot2meter() + (6).inch2meter();
    }
}
