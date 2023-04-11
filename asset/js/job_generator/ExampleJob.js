/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class ExampleJob extends Job
{
  static template_type = "Type eg soccer";// Translateable
  static template_title = "title eg 5 man";// Translateable
  static template_id = "unique id for this type eg soccer_5_man"; // no spaces
  static template_image = "img/templates/black lines image.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
  }

  get info_options()
  {
    return [ "Angle" ];
  }

  static get layout_methods()
  {
    return {
      "free_hand": 0
    };
  }
  get center()
  {
    return this.points[0];
  }
  get drawing_points()
  {
    
    if( this.layout_method !== "free_hand" )
      this.options.Angle.val = (new Line( points[0], points[1] )).angle;
    
    return this.points;
  }

  draw()
  {
    // update tasks
    // Update test_tasks
    // Update bb
    // Update handles
    //this.refresh_snapping_lines( );
  }
  refresh_handles()
  {
    this.handles = [ ];
  }
  convert_to_free_hand()
  {

  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "center" )
    {
      return [
        new Vector( 0.5, 0.5 )
      ];
    }
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0.25 )
      ];
    }
  }

  make_side_copy( i, space, n )
  {
    var plus = this.options.Length ? this.options.Length.val : 0;
    if( i % 2 )
      plus = this.options.Width ? this.options.Width.val : 0;
    if( !this.options.Width && !this.options.Length && this.options.Radius )
    {
      plus = this.options.Radius.val * 2;
    }
    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }
}