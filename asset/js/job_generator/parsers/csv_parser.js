/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global projection_controller, proj4, file_loader_screen, Projector */

class csv_parser extends  generic_parser
{
  static template_id = "csv_parser";
  static template_title = "CSV";
  static template_image = "img/file_icons/csv.png";
  constructor( id, name = "CSV File", csv_string, tasks)
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
    var columns = [ "name", "x", "y" ];
    var first_line = true;
    var task_id = 0;
    var tasks = [ ];
    var projection = "";

    lines.forEach( ( line, i ) => {
      if( line[0] === "#" )
        return;
      if( line === "" )
        return;
      var data = line.trim().split( "," );

      if( first_line )
      {
        first_line = false;
        if( !parseFloat( data[1] ) )
        {
          columns = data.map( this._map_csv_header );
          console.log( "using custom columns:", columns );
          return;
        }
        else
        {
          console.log( "using default columns:", columns );
        }
      }

      if( data.length < columns.length )
      {
        console.log( "Badly formatted line in " + this.name + " line " + i + " : " + line + ", to few elements" );
        return;
      }
      if( data.length > columns.length )
        console.log( "Badly formatted line in " + line + " line " + i + " : " + this.name + ", to many elements, ignoring surplus" );

      // var parsed_data = {"z": 0.0, "z2": 0.0, "name": "spray" + task_id, "spray": 1};
      var parsed_data = {
        "z": 0.0,
        "z2": 0.0,
        "name": "" + task_id,
        "spray": 1
      };

      data.forEach( ( val, i ) => {
        if( columns[i] === "name" )
          parsed_data.name = val;
        else if( (columns[i] === "lat" || columns[i] === "lng") && val.indexOf( "'" ) >= 0 )
        {
          parsed_data[columns[i]] = this.parseDMS( val );
        }
        else
          parsed_data[columns[i]] = parseFloat( val );
      } );

      if( parsed_data.lat && parsed_data.x )
      {
        // split file?
        parsed_data.x2 = parsed_data.x;
        parsed_data.y2 = parsed_data.y;
      }

      if( parsed_data.x && parsed_data.x2 )
      {
        // Split file?
      }

      if( parsed_data.lat )
      {
        // Convert from lnglat to xy
        var xy = ProjectorForward( projection, [ parsed_data.lng, parsed_data.lat ] );
        parsed_data.x = xy[0];
        parsed_data.y = xy[1];
      }

      var spray = true;

      if (parsed_data.spray === 0) {
        spray = false;
      }


      if( parsed_data.x && parsed_data.x2 )
      {
        // This is a localization file.
        this.is_localization = true;

        let p = new Vector( parsed_data.x, parsed_data.y );
        if( general_settings_screen.settings.swap_ne.val )
          p = p.mirror();

        p = p.projunit2meter();
        var new_task = new WaypointTask( task_id, p, false, spray );
        new_task.set_label( parsed_data.name );
        tasks.push( new_task );
      }
      else
      {
        let p = new Vector( parsed_data.x, parsed_data.y );
        if( general_settings_screen.settings.swap_ne.val )
          p = p.mirror();

        p = p.projunit2meter();
        var new_task = new WaypointTask( task_id, p, false, spray );
        if( parsed_data.delay || parsed_data.delay === 0 )
        {
          new_task.task_options.push( new FloatRobotAction( "point_wait", parsed_data.delay ) );
        }
        if( parsed_data.stop === 0 )
        {
          new_task.task_options.push( new FloatRobotAction( "point_wait", 0 ) );
        }
        new_task.set_label( parsed_data.name );
        tasks.push( new_task );
      }

      task_id++;
    } );

    return tasks;
  }

  parseDMS( dms, m, s )
  {
    if( m === undefined )
    {
      var d = parseFloat( dms.split( '°' )[0] );
      var m = parseFloat( dms.split( '°' )[1].split( "'" )[0] );
      var s = parseFloat( dms.split( '°' )[1].split( "'" )[1].split( '"' )[0] );
      return this.parseDMS( d, m, s );
    }
    else
    {
      if( dms < 0 )
        return (dms + (m / 60) + (s / 3600)) * -1;
      else
        return (dms + (m / 60) + (s / 3600));
    }
  }

  _map_csv_header( column_header )
  {
    column_header = column_header.trim();
    if( column_header.toLowerCase() === "latitude" )
      return "lat";

    else if( column_header.toLowerCase() === "long" )
      return "lng";
    else if( column_header.toLowerCase() === "longitude" )
      return "lng";

    else if( column_header.toLowerCase() === "easting" )
      return "x";
    else if( column_header.toLowerCase() === "e" )
      return "x";
    else if( column_header.toLowerCase() === "x1" )
      return "x";

    else if( column_header.toLowerCase() === "northing" )
      return "y";
    else if( column_header.toLowerCase() === "n" )
      return "y";
    else if( column_header.toLowerCase() === "y1" )
      return "y";

    else if( column_header.toLowerCase() === "eli" )
      return "z";
    else if( column_header.toLowerCase() === "elevation" )
      return "z";
    else if( column_header.toLowerCase() === "height" )
      return "z";

    else if( column_header.toLowerCase() === "pausetime" )
      return "delay";

    else
      return column_header.toLowerCase();
  }
}