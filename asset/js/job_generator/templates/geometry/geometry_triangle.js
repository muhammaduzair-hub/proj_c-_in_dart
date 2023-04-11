/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Geometry_Triangle extends square_pitch
{
  static template_type = "Geometry";
  static template_title = "Triangle";
  static template_id = "geometry_triangle";
  static template_image = "img/templates/geometry_triangle.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 50;
    this.options.Width.val = 25;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
  }
    
    static get layout_methods()
  {
    return {
      
      "corner,side": 2,
      "two_corners": 2,
      "free_hand": 0
    };

  } 
    static get_point_positions( layout_method )
  {
    
    if( layout_method === "two_corners" )
    {
      return [
        
        new Vector( 0.9, 0.099 ),
        new Vector( 0.1, 0.099 )
      ];
    }
  
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0.3, 0.5 ),
        new Vector( 0.1, 0.099 )
        
      ];
    }
   
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
    
   // var mid =  new Line( c1, c2 ).middle;
    var mid1 =  new Line( c2, c3 ).middle;
    //var g1 = new Line( mid1,mid  ).unit_vector;
    //var top = mid1.add(g1.multiply(this.options.Length.val));


    this.start_locations.push( new StartLocation( c3, this.tasks.length ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c4, c1], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ c1, mid1 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ mid1, c4], false, true ) );

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines( );
    this.refresh_test_run();
  }
  refresh_test_run() {
    this.test_tasks = [];
    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var mid1 =  new Line( c2, c3 ).middle;
    this.test_tasks.push(new WaypointTask(this.test_tasks.length + 1, c1, false, true));
    this.test_tasks.push(new WaypointTask(this.test_tasks.length + 1, c4, false, true));
    this.test_tasks.push(new WaypointTask(this.test_tasks.length + 1, mid1, false, true));

  }

}


