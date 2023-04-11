/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global projection_controller, proj4, file_loader_screen */

class geo_parser extends  generic_parser
{
  static template_id = "geo_parser";
  static template_title = "GEO";
  static template_image = "img/file_icons/geo.png";
  constructor( id, name = "GEO File", csv_string, tasks)
  {
    super( id, name, csv_string );
    this.is_localization = false;

    if( this.data )
    {
      this.loaded_tasks = this.load( this.data );
    }
    if( tasks )
    {
      this.loaded_tasks = tasks;
  }
  }
  load( data )
  {

    var lines = data.split( "\n" );
    var task_id = 0;
    var tasks = [ ];
    var projection = "";

    lines.forEach( ( line, i ) => {
      if( line[0] === "#" )
        return;
      if( line === "" )
        return;
      var data = line.trim().split( "," );
      console.log( data );

      if( data[0].startsWith( "Point " ) )
      {
        var name = data[0].split( '"' )[1];
        var y = parseFloat( data[1] );
        var x = parseFloat( data[2] );
        var z = data[3] ? parseFloat( data[3] ) : data[3];

        let p = new Vector( x, y );
        if( general_settings_screen.settings.swap_ne.val )
          p = p.mirror();

        p = p.projunit2meter();

        var new_task = new WaypointTask( task_id, p, false, true );
        new_task.set_label( name );
        tasks.push( new_task );
      }

      task_id++;
    } );

    console.log( tasks );
    return tasks;
  }

}