/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Pickle_Ball extends square_pitch {
  static template_type = "Tennis";
  static template_title = "Pickle Ball";
  static template_id = "pickleball_beta";
  static template_image = "img/templates/pickleball_black.png";
  
  constructor(id, name, layout_method) {
    super( id, name, layout_method );
    this.options.Length.val = (44).foot2meter();
    this.options.Width.val = (20).foot2meter();
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;

    // Corners
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    let g1 = new Line(c2, c3).unit_vector;
    let netTop = new Line(c2, c3).middle;
    let netBottom = new Line(c4, c1).middle;
    let serviceAreaLength = this.options.Length.val;
    let ratio = 0.681818182;   
    
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );

    this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
    
    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );

    this.start_locations.push( new StartLocation( c4, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
    
    this.start_locations.push( new StartLocation( netTop, this.tasks.length ) );
    this.start_locations.push( new StartLocation( netBottom, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [netTop, netBottom], false, true));

    let p1 = c1.add(g1.multiply(ratio * serviceAreaLength));
    let p2 = c2.add(g1.multiply(ratio * serviceAreaLength));
    let p3 = c3.subtract(g1.multiply(ratio * serviceAreaLength));
    let p4 = c4.subtract(g1.multiply(ratio * serviceAreaLength));

    this.start_locations.push( new StartLocation( p1, this.tasks.length ) );
    this.start_locations.push( new StartLocation( p2, this.tasks.length ) );
    this.start_locations.push( new StartLocation( p3, this.tasks.length ) );
    this.start_locations.push( new StartLocation( p4, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [p1, p2], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [p3, p4], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [new Line(c1, c2).middle, new Line(p3, p4).middle], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [new Line(c3, c4).middle, new Line(p1, p2).middle], false, true));

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines( );
    this.refresh_test_run();
  }
}

