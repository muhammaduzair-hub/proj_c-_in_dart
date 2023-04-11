


class Displaced_Threshold_Markings extends square_pitch
{
  static template_type = "Runway"; // Translateable
  static template_title = "Threshold"; // Translateable
  static template_id = "displaced_threshold_markings_faa_dev"; // no spaces
  static template_image = "img/templates/threshold_displacement.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    let this_class = this;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options.disableLengthHandles.val = false;
    this.options.disableWidthHandles.val = true;
    /*this.options["fast_test"].val = false;
    this.options["normal_test"].val = false;*/

    this.options.Width = {
        name: "width",
        val: (150).foot2meter(),
        type: "float"
    };
    this.options.Length = {
        name: "Length",
        val: (150).foot2meter(),
        type: "float"
    };
   
    this.options.arrowheads = {
        name: "Number of arrowheads",
        val: 4,
        type: "float",
        configurable: true
    };
    this.options.arrows = {
        name: "Arrows",
        val: false,
        type: "bool",
        configurable: true
    }
    this.options.numarrows = {
        name: "Number of arrows",
        val: 1,
        type: "float",
        get configurable()
      {
        return this_class.options.arrows.val;
      }
    };
    this.options.dividingValue = {
        name: "divide with this",
        val: 4,
        type: "float"
    };
    this.options.thresholdBarWidth = {
        name: "Threshold bar width " + "("+ translate_unit()+")",
        val: 3,
        type: "float",
        get configurable()
        {
          return this_class.options.thresholdbar.val;
        }
    };
    this.options.arrowHeadLength = {
        name: "Arrowhead length " + "("+ translate_unit()+")",
        val: (45).foot2meter(),
        type: "float",
        configurable: true
    };
    this.options.thresholdbar = {
        name: "Threshold bar",
        val: true,
        type: "bool",
        configurable: true
    };
    this.options.tailLength = {
        name: "Tail length " + "("+ translate_unit()+")",
        val: (80).foot2meter(),
        type: "float",
        get configurable()
        {
          return this_class.options.arrows.val;
        }
    };
    this.options.tailWidth = {
        name: "Tail Width " + "("+ translate_unit()+")",
        val: (1.5).foot2meter(),
        type: "float",
        get configurable()
        {
          return this_class.options.arrows.val;
        }
    };
    this.options.distance2arrows = {
        name: "Distance to arrows " + "("+ translate_unit()+")",
        val: (94).foot2meter(),
        type: "float",
        get configurable()
        {
          return this_class.options.arrows.val;
        }
    };
    this.options.space_between_arrows = {
        name: "Space between arrows " + "("+ translate_unit()+")",
        val: (80).foot2meter(),
        type: "float",
        get configurable()
      {
        return this_class.options.arrows.val;
      }
    };
    this.options.dist2arrowheads = {
        name: "Distance to arrowheads " + "("+ translate_unit()+")",
        val: (5).foot2meter(),
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
    
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 1, 0 ),
        new Vector( 1, 1 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 1, 0 ),
        new Vector( 1, 1 )
      ];
    }
  }
  
  arrows(p)
  {
    //corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g1 = new Line(c1, c2).unit_vector;
    
    let midLine = new Line(c1, c4).middle;
    let scaleArrow = ((45).foot2meter() - this.options.arrowHeadLength.val) * -1
    let scaleWidth = (7.5).foot2meter()/(45).foot2meter()* scaleArrow;
    let scaleLine = (3).foot2meter()/(45).foot2meter()* scaleArrow; 
    
    for(let i = 0; i < this.options.numarrows.val; i++)
    {
   
        if(i < 1)
        {    //ARROWHEAD
            let dist2arrow = this.options.distance2arrows.val 
            let aHeadPoint = midLine.add(g1.multiply(dist2arrow));
            let backCenter = aHeadPoint.add(g1.multiply((this.options.arrowHeadLength.val)));
            //this.tasks.push( new LineTask( this.tasks.length, [ aP, c3], false, true));
    
            let aBackPoint1 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_ccw());
            let aBackPoint2 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_cw());



            let g2 = new Line(aHeadPoint, aBackPoint1).unit_vector;
            let g3 = new Line(aHeadPoint, aBackPoint2).unit_vector;
            let aBackPoint3  = aBackPoint1.add(g2.multiply((3 + scaleLine*4).foot2meter()).rotate_90_cw());
            let aBackPoint4 = aBackPoint2.add(g3.multiply((3 + scaleLine *4).foot2meter()).rotate_90_ccw());

            let aguide1 =aBackPoint3.subtract(g2.multiply(10));
            let aguide2 =aBackPoint4.subtract(g3.multiply(10));

            let aMidLine1 = new Line(aBackPoint3, aguide1);
            let aMidLine2 = new Line(aBackPoint4, aguide2);

            let aMid = aMidLine1.cross_with_line(aMidLine2);

    
            this.tasks.push( new LineTask( this.tasks.length, [ aHeadPoint, aBackPoint1], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint1, aBackPoint3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint3, aMid], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aMid, aBackPoint4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [aBackPoint4, aBackPoint2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint2, aHeadPoint], false, true));
            //TAIL
            let tailstart = backCenter.subtract(g1.multiply((5).foot2meter()));
            let tailc1 = tailstart.add(g1.multiply((this.options.tailWidth.val/2)).rotate_90_cw());
            let tailc2 = tailstart.add(g1.multiply((this.options.tailWidth.val/2)).rotate_90_ccw()); 
            let tailc3 = tailc1.add(g1.multiply((this.options.tailLength.val)));
            let tailc4 = tailc2.add(g1.multiply((this.options.tailLength.val)));

            this.tasks.push( new LineTask( this.tasks.length, [ tailc1, tailc2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [tailc2, tailc4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ tailc4, tailc3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [tailc3, tailc1], false, true));
        }
        else
        {
            let dist2arrow = this.options.distance2arrows.val
            let space_between_arrows = ((this.options.arrowHeadLength.val + (this.options.tailLength.val-(5).foot2meter()))+this.options.space_between_arrows.val)*i;
            dist2arrow += space_between_arrows;

             //ARROWHEAD
            let aHeadPoint = midLine.add(g1.multiply(dist2arrow));
            let backCenter = aHeadPoint.add(g1.multiply((this.options.arrowHeadLength.val)));
            //this.tasks.push( new LineTask( this.tasks.length, [ aP, c3], false, true));
    
            let aBackPoint1 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_ccw());
            let aBackPoint2 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_cw());

            let g2 = new Line(aHeadPoint, aBackPoint1).unit_vector;
            let g3 = new Line(aHeadPoint, aBackPoint2).unit_vector;
            let aBackPoint3  = aBackPoint1.add(g2.multiply((3 + scaleLine*4).foot2meter()).rotate_90_cw());
            let aBackPoint4 = aBackPoint2.add(g3.multiply((3 + scaleLine *4).foot2meter()).rotate_90_ccw());

            let aguide1 =aBackPoint3.subtract(g2.multiply(10));
            let aguide2 =aBackPoint4.subtract(g3.multiply(10));

            let aMidLine1 = new Line(aBackPoint3, aguide1);
            let aMidLine2 = new Line(aBackPoint4, aguide2);

            let aMid = aMidLine1.cross_with_line(aMidLine2);

    
            this.tasks.push( new LineTask( this.tasks.length, [ aHeadPoint, aBackPoint1], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint1, aBackPoint3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint3, aMid], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aMid, aBackPoint4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [aBackPoint4, aBackPoint2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint2, aHeadPoint], false, true));

             //TAIL
            let tailstart = backCenter.subtract(g1.multiply((5).foot2meter()));
            let tailc1 = tailstart.add(g1.multiply((this.options.tailWidth.val/2)).rotate_90_cw());
            let tailc2 = tailstart.add(g1.multiply((this.options.tailWidth.val/2)).rotate_90_ccw()); 
            let tailc3 = tailc1.add(g1.multiply((this.options.tailLength.val)));
            let tailc4 = tailc2.add(g1.multiply((this.options.tailLength.val)));

            this.tasks.push( new LineTask( this.tasks.length, [ tailc1, tailc2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [tailc2, tailc4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ tailc4, tailc3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [tailc3, tailc1], false, true));
        }
    }
 }
  
  threshold(p)
  {
    //corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g1 = new Line(c1, c2).unit_vector;

    //THRESHOLDBAR
    let thresholdLineP1 = c1.add(g1.multiply((this.options.thresholdBarWidth.val).foot2meter()));
    let thresholdLineP2 = c4.add(g1.multiply((this.options.thresholdBarWidth.val).foot2meter()));
    if(this.options.thresholdbar.val){
    this.tasks.push( new LineTask( this.tasks.length, [c1, c4], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [c4, thresholdLineP2], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [thresholdLineP2, thresholdLineP1], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [thresholdLineP1, c1], false, true));
    }
    else{
        this.options.thresholdBarWidth.val = 0;
    }
    //ARROWHEADS
    for(let i = 0; i < this.options.arrowheads.val; i++){
        let aP1 = thresholdLineP1.add(g1.multiply(this.options.Length.val/(this.options.dividingValue.val*2)).rotate_90_cw());
        let scaleArrow = ((45).foot2meter() - this.options.arrowHeadLength.val) * -1
        let scaleWidth = (7.5).foot2meter()/(45).foot2meter()* scaleArrow;
        let scaleLine = (3).foot2meter()/(45).foot2meter()* scaleArrow; 
        if(i < 1){
            //let aP = thresholdLineP1.add(g1.multiply(this.options.Width.val/8).rotate_90_cw());
            let aHeadPoint = aP1.add(g1.multiply((this.options.dist2arrowheads.val).foot2meter()));
            let backCenter = aHeadPoint.add(g1.multiply((this.options.arrowHeadLength.val)));
            //this.tasks.push( new LineTask( this.tasks.length, [ aP, c3], false, true));
            
            let aBackPoint1 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_ccw());
            let aBackPoint2 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_cw());
 


            let g2 = new Line(aHeadPoint, aBackPoint1).unit_vector;
            let g3 = new Line(aHeadPoint, aBackPoint2).unit_vector;
            let aBackPoint3  = aBackPoint1.add(g2.multiply((3 + scaleLine*4).foot2meter()).rotate_90_cw());
            let aBackPoint4 = aBackPoint2.add(g3.multiply((3 + scaleLine *4).foot2meter()).rotate_90_ccw());

            let aguide1 =aBackPoint3.subtract(g2.multiply(10));
            let aguide2 =aBackPoint4.subtract(g3.multiply(10));

            let aMidLine1 = new Line(aBackPoint3, aguide1);
            let aMidLine2 = new Line(aBackPoint4, aguide2);

            let aMid = aMidLine1.cross_with_line(aMidLine2);

            this.tasks.push( new LineTask( this.tasks.length, [ aHeadPoint, aBackPoint1], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint1, aBackPoint3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint3, aMid], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aMid, aBackPoint4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [aBackPoint4, aBackPoint2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint2, aHeadPoint], false, true));
          
            //this.tasks.push( new LineTask( this.tasks.length, [aBackPoint1, aBackPoint2], false, true));
        }
        else{
            let aP2 = aP1.add(g1.multiply((this.options.Length.val/this.options.dividingValue.val)*i).rotate_90_cw());
            let aHeadPoint = aP2.add(g1.multiply((this.options.dist2arrowheads.val).foot2meter()));
            let backCenter = aHeadPoint.add(g1.multiply(this.options.arrowHeadLength.val));
            //this.tasks.push( new LineTask( this.tasks.length, [ aP, c3], false, true));
            let aBackPoint1 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_ccw());
            let aBackPoint2 = backCenter.add(g1.multiply((7.5 + scaleWidth*4).foot2meter()).rotate_90_cw());
 


            let g2 = new Line(aHeadPoint, aBackPoint1).unit_vector;
            let g3 = new Line(aHeadPoint, aBackPoint2).unit_vector;
            let aBackPoint3  = aBackPoint1.add(g2.multiply((3 + scaleLine*4).foot2meter()).rotate_90_cw());
            let aBackPoint4 = aBackPoint2.add(g3.multiply((3 + scaleLine *4).foot2meter()).rotate_90_ccw());

            let aguide1 =aBackPoint3.subtract(g2.multiply(10));
            let aguide2 =aBackPoint4.subtract(g3.multiply(10));

            let aMidLine1 = new Line(aBackPoint3, aguide1);
            let aMidLine2 = new Line(aBackPoint4, aguide2);

            let aMid = aMidLine1.cross_with_line(aMidLine2);

            
            this.tasks.push( new LineTask( this.tasks.length, [ aHeadPoint, aBackPoint1], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint1, aBackPoint3], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint3, aMid], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aMid, aBackPoint4], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [aBackPoint4, aBackPoint2], false, true));
            this.tasks.push( new LineTask( this.tasks.length, [ aBackPoint2, aHeadPoint], false, true));
           
        }
       

    }


  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [];
    this.start_locations = [];

    let p = this.drawing_points;

    this.start_locations.push( new StartLocation( p, this.tasks.length ) );

    switch( this.options.arrowheads.val )
    {
      case 2:
        this.options.dividingValue.val = 2;
        break;
      case 3:
        this.options.dividingValue.val = 3;
        break;
      case 4:
        this.options.dividingValue.val = 4;
        break;
      default:
        this.options.dividingValue.val = 4;
        break;
    }
   this.threshold(p);
   if(this.options.arrows.val){
    this.arrows(p);
   }
   

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}