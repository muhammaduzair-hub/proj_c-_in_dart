class Polo extends square_pitch {
    static template_type = "Polo";
    static template_title = "Standard";
    static template_id = "polo_international_dev";
    static template_image = "img/templates/polo_black.png";
    constructor( id, name, layout_method )
    {
      super( id, name, layout_method );
  
      this.options.Length.val = (300).yard2meter();
      this.options.Width.val = (200).yard2meter();
      this.options.reverseInGoal = {
        adjustable: false,
        configurable: true,
        name: "Fixed goal posts",
        val: true,
        type: "bool"
      };

      this.options ["Banded"] = {  
        configurable: true,
        name: "banded field",
        val: false,
        type: "bool"
      }; 
      
      this.options ["safty line"] = {  
        configurable: true,
        name: "safty line",
        val: true,
        type: "bool"
      }; 
      
      this.options ["dashed space"] = {

        configurable: true,
        name: "dashed lines space",
        val: (1.0).yard2meter(),
        type: "float"

      }

      this.options ["dashed lines length"] = {

        configurable: true,
        name: "dashed lines length",
        val: (1.0).yard2meter(),
        type: "float"

      }

  }

    draw() {
        delete this.calculated_drawing_points;
        this.tasks = [ ];
        this.start_locations = [ ];
    
        var p = this.drawing_points;

        // Corners
        const cornerOne = p[0];
        const cornerTwo = p[3];
        const cornerThree = p[4]
        const cornerFour = p[7];
        this.start_locations.push( new StartLocation( cornerOne, this.tasks.length ) );
        if(this.options ["Banded"].val)
        { 
          this.firstEnd(cornerOne,cornerTwo)        
          this.secondEnd(cornerThree,cornerFour)
          this.thirtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.fortyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.sixtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.midFieldLine(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.sixtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.fortyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.thirtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          if(this.options ["safty line"].val)
          this.SaftyLine(cornerOne,cornerTwo,cornerThree,cornerFour)
          
        } 
        else
        {
          this.firstEnd(cornerOne,cornerTwo)
          this.firstSide(cornerTwo,cornerThree)
          this.secondEnd(cornerThree,cornerFour)
          this.secondSide(cornerFour, cornerOne)
          this.thirtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.fortyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.sixtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.midFieldLine(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.sixtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.fortyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          this.thirtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
          if(this.options ["safty line"].val)
          this.SaftyLine(cornerOne,cornerTwo,cornerThree,cornerFour)
          
          
        }    

        this.refresh_bb();
        this.refresh_handles();    
    }


    firstEnd(cornerOne,cornerTwo){

      const middle = new Line(cornerOne, cornerTwo).middle;
      const guideVector = new Line(middle,cornerOne).unit_vector;
      const goalpostOne = middle.add(guideVector.multiply(3.65));
      const guideVectorTwo = new Line(middle,cornerTwo).unit_vector;
      const goalpostTwo = middle.add(guideVectorTwo.multiply(3.65));      


      const first_end_goalpostOne = drive_around_posts(
        {
    
          task_before: new LineTask( this.tasks.length, [ cornerOne, goalpostOne ], false, true ),
          task_after: new LineTask( this.tasks.length, [ goalpostOne, goalpostTwo ], false, true ),
          poles: [ goalpostOne ],
          pole_width: this.options.goalPoleWidth.val,
          left_around: false,
          start_index: this.tasks.length
    
        } );    
        if( this.options.reverseInGoal.val === true )
        {
          this.tasks.pushAll( first_end_goalpostOne );
        }
        else
        {
          this.tasks.push( new LineTask( this.tasks.length, [cornerOne , cornerTwo], false, true ) );    
        }

        const first_end_goalpostTwo = drive_around_posts(
          {      
            task_before: new LineTask( this.tasks.length, [ goalpostOne, goalpostTwo ], false, true ),
            task_after: new LineTask( this.tasks.length, [ goalpostTwo, cornerTwo ], false, true ),
            poles: [ goalpostTwo ],
            pole_width: this.options.goalPoleWidth.val,
            left_around: false,
            start_index: this.tasks.length      
          } );
      
          if( this.options.reverseInGoal.val === true )
          {
            this.tasks.pushAll( first_end_goalpostTwo );
          }
          else
          {
            this.tasks.push( new LineTask( this.tasks.length, [cornerOne , cornerTwo], false, true ) );      
          }    
        
    }

    firstSide(cornerTwo, cornerThree){
      this.tasks.push( new LineTask( this.tasks.length, [cornerTwo , cornerThree], false, true ) );
    }
    
    secondSide(cornerFour, cornerOne){
      this.tasks.push( new LineTask( this.tasks.length, [cornerFour , cornerOne], false, true ) );
    }

    secondEnd(cornerThree,cornerFour){

      const middle = new Line(cornerThree, cornerFour).middle;
      const guideVector = new Line(middle,cornerThree).unit_vector;
      const goalpostOne = middle.add(guideVector.multiply(3.65));
      const guideVectorTwo = new Line(middle,cornerFour).unit_vector;
      const goalpostTwo = middle.add(guideVectorTwo.multiply(3.65));

      const second_end_goalpostOne = drive_around_posts(
        {
    
          task_before: new LineTask( this.tasks.length, [ cornerThree, goalpostOne ], false, true ),
          task_after: new LineTask( this.tasks.length, [ goalpostOne, goalpostTwo ], false, true ),
          poles: [ goalpostOne ],
          pole_width: this.options.goalPoleWidth.val,
          left_around: false,
          start_index: this.tasks.length
    
        } );
    
        if( this.options.reverseInGoal.val === true )
        {
          this.tasks.pushAll( second_end_goalpostOne );
        }
        else
        {
          this.tasks.push( new LineTask( this.tasks.length, [cornerThree , cornerFour], false, true ) );   
        }

        const second_end_goalpostTwo = drive_around_posts(
          {
      
            task_before: new LineTask( this.tasks.length, [ goalpostOne, goalpostTwo ], false, true ),
            task_after: new LineTask( this.tasks.length, [ goalpostTwo, cornerFour ], false, true ),
            poles: [ goalpostTwo ],
            pole_width: this.options.goalPoleWidth.val,
            left_around: false,
            start_index: this.tasks.length
      
          } );
      
          if( this.options.reverseInGoal.val === true )
          {
            this.tasks.pushAll( second_end_goalpostTwo );
          }
          else
          {
            this.tasks.push( new LineTask( this.tasks.length, [cornerThree , cornerFour], false, true ) );      
          }
      }

    thirtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerOne,cornerFour).unit_vector;
      const lineStart = cornerOne.add(guideVector.multiply((30).yard2meter())); 
      const guideVectortwo = new Line(cornerTwo,cornerThree).unit_vector;
      const lineEnd = cornerTwo.add(guideVectortwo.multiply((30).yard2meter())); 

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
    } 

    fortyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerOne,cornerFour).unit_vector;
      const lineEnd = cornerOne.add(guideVector.multiply((40).yard2meter())); 
      const guideVectortwo = new Line(cornerTwo,cornerThree).unit_vector;
      const lineStart = cornerTwo.add(guideVectortwo.multiply((40).yard2meter())); 

      // dashed lines 
      let dash_length = this.options ["dashed lines length"].val;
      let dash_space = this.options ["dashed space"].val;

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    } 

    sixtyYardLineOne(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerOne,cornerFour).unit_vector;
      const lineStart = cornerOne.add(guideVector.multiply((60).yard2meter())); 
      const guideVectortwo = new Line(cornerTwo,cornerThree).unit_vector;
      const lineEnd = cornerTwo.add(guideVectortwo.multiply((60).yard2meter())); 

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
    } 

    midFieldLine(cornerOne,cornerTwo,cornerThree,cornerFour){
      const midStart = new Line(cornerOne,cornerFour).middle;
      const midEnd = new Line(cornerTwo,cornerThree).middle;
      let dash_length = this.options ["dashed lines length"].val;
      let dash_space = this.options ["dashed space"].val;
      this.tasks.push( new LineTask( this.tasks.length, [midEnd,midStart], false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    }

    sixtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerFour,cornerOne).unit_vector;
      const lineStart = cornerFour.add(guideVector.multiply((60).yard2meter())); 
      const guideVectortwo = new Line(cornerThree,cornerTwo).unit_vector;
      const lineEnd = cornerThree.add(guideVectortwo.multiply((60).yard2meter())); 

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
    } 

    fortyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerFour,cornerOne).unit_vector;
      const lineEnd = cornerFour.add(guideVector.multiply((40).yard2meter())); 
      const guideVectortwo = new Line(cornerThree,cornerTwo).unit_vector;
      const lineStart = cornerThree.add(guideVectortwo.multiply((40).yard2meter())); 

      // dashed lines 
      let dash_length = this.options ["dashed lines length"].val;
      let dash_space = this.options ["dashed space"].val;

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
    } 

    thirtyYardLineTwo(cornerOne,cornerTwo,cornerThree,cornerFour)
    {
      const guideVector = new Line(cornerFour,cornerOne).unit_vector;
      const lineStart = cornerFour.add(guideVector.multiply((30).yard2meter())); 
      const guideVectortwo = new Line(cornerThree,cornerTwo).unit_vector;
      const lineEnd = cornerThree.add(guideVectortwo.multiply((30).yard2meter())); 

      this.tasks.push( new LineTask( this.tasks.length, [lineStart , lineEnd], false, true ) );
    } 

  
  SaftyLine(cornerOne,cornerTwo,cornerThree,cornerFour){
    const guideVector = new Line(cornerFour,cornerOne).unit_vector;
    const guideVectorTwo = new Line(cornerTwo, cornerOne).unit_vector;
    const backendOne = cornerOne.add(guideVector.multiply(27.5));
    const firstCorner = backendOne.add(guideVectorTwo.multiply(9));

    const guideVectorThree = new Line(cornerOne,cornerTwo).unit_vector;
    const guideVectorFour = new Line(cornerThree, cornerTwo).unit_vector;
    const backendTwo = cornerTwo.add(guideVectorThree.multiply(9));
    const secondCorner = backendTwo.add(guideVectorFour.multiply(27.5));

    const guideVectorFive = new Line(cornerOne,cornerFour).unit_vector;
    const guideVectorSix = new Line(cornerThree, cornerFour).unit_vector;
    const backendThree = cornerFour.add(guideVectorFive.multiply(27.5));
    const thirdCorner = backendThree.add(guideVectorSix.multiply(9));

    const guideVectorSeven = new Line(cornerTwo,cornerThree).unit_vector;
    const guideVectorEight = new Line(cornerFour, cornerThree).unit_vector;
    const backendFour = cornerThree.add(guideVectorSeven.multiply(27.5));
    const fourCorner = backendFour.add(guideVectorEight.multiply(9));

    this.tasks.push( new LineTask( this.tasks.length, [fourCorner , thirdCorner], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [thirdCorner , firstCorner], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [firstCorner , secondCorner], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [secondCorner , fourCorner], false, true ) );
    

  }



}




