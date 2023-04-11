class Floorball extends square_pitch
{
  static template_type = "Floorball";
  static template_title = "Standard";
  static template_id = "floorball_dev";
  static template_image = "img/templates/trytagrugby.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 24.0;
    this.options.Width.val = 12.0;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
    
  }

  draw()
  {

    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    
    var g1 = new Line(c1,c4).unit_vector;
    var g2 = new Line(c2,c3).unit_vector;
    var g3 = new Line(c1,c2).unit_vector;
    var g4 = new Line(c4,c3).unit_vector;
    var g5 = new Line(c2,c1).unit_vector;
    var g6 = new Line(c3,c2).unit_vector;
    var g7 = new Line(c3,c4).unit_vector;
    var g8 = new Line(c4,c1).unit_vector;

    var cL1 = c1.add( g3.multiply( 1 ));
    var cL2 = c2.add( g5.multiply( 1.85 )); 
    var cL3 = c2.add( g2.multiply(1.85));
    var cL4 = c3.add( g6.multiply(1.85));
    var cL5 = c3.add( g7.multiply( 1 ) );
    var cL6 = c4.add( g4.multiply( 1 )); 
    var cL7 = c4.add( g8.multiply(1.85));
    var cL8 = c1.add( g1.multiply(1.85));

    var corMid = new Line(cL2,cL3).middle;

    this.tasks.push( new LineTask( this.tasks.length, [cL1,cL2 ], false, true ) );  
    this.tasks.push( new LineTask( this.tasks.length, [cL3,cL4 ], false, true ) );  
    this.tasks.push( new LineTask( this.tasks.length, [cL5,cL6 ], false, true ) );  
    this.tasks.push( new LineTask( this.tasks.length, [cL7,cL8 ], false, true ) );  

    this.tasks.push( new ArcTask( this.tasks.length, [ cL3, c2, cL2 ], corMid, false, false, true ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
    
  }
}