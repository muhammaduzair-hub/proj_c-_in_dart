


class Runway_Threshold_Stripes extends square_pitch
{
    static template_type = "Runway"; // Translateable
    static template_title = "Threshold Stripes"; // Translateable
    static template_id = "runway_threshold_stripes_dev"; // no spaces
    static template_image = "img/templates/threshold_stripes.png"; // no spaces
    
    constructor( id, name, layout_method ) {
    super( id, name, layout_method );
    var this_class = this;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.disableLengthHandles.val = true;
    this.options.disableWidthHandles.val = true;
    
    
    this.options.Length = {
        name: "Length",
        val: (150).foot2meter(),
        type: "float"
    };
  
    this.options.numOfStripes = {
        name: "Number of stripes",
        val: 4,
        type: "float",
        configurable: true
    };
    this.options.stripeSpace = {
        name: "Space between stripes " + "("+ translate_unit()+")",
        val: (5.75).foot2meter() + this.options.LineWidth.val,
        type: "float",
        configurable: true
    };
    this.options.stripeWidth = {
        name: "Stripe width " + "("+ translate_unit()+")",
        val: (5.75).foot2meter() - this.options.LineWidth.val,
        type: "float",
        configurable: true
    };
    this.options.stripeLength = {
        name: "Length of stripes " + "("+ translate_unit()+")",
        val: (150).foot2meter(),
        type: "float",
        configurable: true
    };
    this.options.Width = {
        name: "width",
        val: this.options.stripeLength.val,
        type: "float"
    };
    this.options.distance2threshold = {
        name: "Distance to threshold bar " + "("+ translate_unit()+")",
        val: (3).foot2meter(),
        type: "float",
        configurable: true
    }
  }
  static get layout_methods()
  {
    return {
        "two_corners": 2,
        "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {

    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 1, 1 )
      ];
    }
  }
  
  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [];
    this.start_locations = [];

    var p = this.drawing_points;
    //corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var g1 = new Line(c1, c4).unit_vector;

    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    let sC1 = c1.add(g1.multiply((150).foot2meter()).rotate_90_ccw())
    let sC2 = c4.add(g1.multiply((150).foot2meter()).rotate_90_ccw())

    var ml1 = new Line(c1, c4).middle;
    var ml2 = new Line(sC1, sC2).middle;

    this.options.Width.val = this.options.stripeLength.val + this.options.distance2threshold.val;
    let length2Stripe

    for(var i = 1; i <= this.options.numOfStripes.val; i++){
         
        if(i === 1){
           length2Stripe = (this.options.stripeWidth.val + this.options.LineWidth.val/2); 
           //length2Stripe += this.options.stripeSpace.val * i -1.5;
        }
        else{
            let space =this.options.stripeWidth.val + this.options.LineWidth.val+ this.options.stripeSpace.val; 
            length2Stripe +=  space
            //length2Stripe += this.options.stripeSpace.val;
        }

       
        
        var sC1Right = ml1.subtract(g1.multiply(length2Stripe));
        var sC2Right = ml1.subtract(g1.multiply(length2Stripe + this.options.stripeWidth.val));

        var sC3Right = sC1Right.subtract(g1.multiply(this.options.stripeLength.val).rotate_90_cw());
        var sC4Right = sC3Right.subtract(g1.multiply(this.options.stripeWidth.val ));
         

        this.tasks.push( new LineTask( this.tasks.length, [sC1Right, sC2Right], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC2Right, sC4Right], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC4Right, sC3Right], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC3Right, sC1Right], false, true));

        var sC1Left = ml1.add(g1.multiply(length2Stripe));
        var sC2Left = ml1.add(g1.multiply(length2Stripe + this.options.stripeWidth.val));

        var sC3Left = sC1Left.add(g1.multiply(this.options.stripeLength.val).rotate_90_ccw());
        var sC4Left = sC3Left.add(g1.multiply(this.options.stripeWidth.val ));

        this.tasks.push( new LineTask( this.tasks.length, [sC1Left, sC2Left], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC2Left, sC4Left], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC4Left, sC3Left], false, true));
        this.tasks.push( new LineTask( this.tasks.length, [sC3Left, sC1Left], false, true));
    }


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
  from2cornersTo4Corners( corners )
  {
   let [ c0, c1, c2, c3 ] = super.from2cornersTo4Corners( corners );

    if( (this.options.Rotation.val % 2) )
      return [ c0, c1, c2, c3 ];
    else
      return [ c2, c3, c0, c1 ];
   
    }
}