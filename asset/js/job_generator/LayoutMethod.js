class LayoutMethod
{
  constructor( args )
  {
    this.name = args.name ? args.name : false;
    this.number_of_points = args.number_of_points;
    this.layout_image = args.layout_image ? args.layout_image : false;
    this.layout_method_image = args.layout_method_image ? args.layout_method_image : false;
    if( !this.layout_method_image && this.layout_image )
      this.layout_method_image = this.layout_image;
    this.layout_point_positions = args.layout_point_positions ? args.layout_point_positions : false;
  }
}