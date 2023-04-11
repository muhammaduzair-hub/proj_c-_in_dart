/* http://www.landxml.org/schema/landxml-1.2/documentation/landxml-1.2doc.html */

var last_points_from_xml = [ ];
class landxml_parser extends generic_parser
{
  static template_id = "landxml_parser";
  static template_image = "img/file_icons/xml.png";
  static template_title = "LandXML"
  constructor( id, name = "LandXML File", xml_string)
  {
    super( id, name, xml_string );
    if( this.data )
    {
      this.loaded_tasks = this.load( this.data );
  }
  }
  load( data )
  {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString( data.slice( data.indexOf( '<' ) ), "text/xml" );
    var tasks = [ ];
    // Points
    var points = xmlDoc.getElementsByTagName( "CgPoint" );
    last_points_from_xml = points;
    for( var i = 0; i < points.length; i++ )
    {
      var name = points[i].getAttribute( "name" );
      var pos = points[i].innerHTML.split( " " );
      var p = new Vector( parseFloat( pos[0] ), parseFloat( pos[1] ) );
      if( general_settings_screen.settings.swap_ne.val )
        p = p.mirror();

      p = p.projunit2meter();
      var new_task = new WaypointTask( i, p, false, true );
      new_task.set_label( name );
      tasks.push( new_task );
    }

    // PlanFeatures
    var features = xmlDoc.getElementsByTagName( "PlanFeature" );
    tasks = tasks.concat( this.getFeatures( features, i ) );
    // Alignment
    features = xmlDoc.getElementsByTagName( "Alignment" );
    tasks = tasks.concat( this.getFeatures( features, i ) );

    return tasks;
  }
  coordToArray( coord )
  {
    return coord.innerHTML.split( " " );
  }
  arrayToVector( array, start_idx = 0, end_idx = 1)
  {
    return array.slice( start_idx, end_idx + 1 ).map( ( c ) => {
      return parseFloat( c );
    } ).toVector();
  }
  coordToVector( coord, start_idx = 0, end_idx = 1)
  {
    return this.arrayToVector( this.coordToArray( coord ), start_idx, end_idx );
  }
  getFeatures( features, base_idx )
  {
    var tasks = [ ];
    var feature, coordgeom, entity, coords, task, id, name;

    for( var j = 0; j < features.length; j++ )
    {
      feature = features[j];
      name = features[j].getAttribute( "name" );

      for( var i = 0; i < feature.children.length; i++ )
      {
        coordgeom = feature.children[i];

        for( var k = 0; k < coordgeom.children.length; k++ )
        {
          id = base_idx + j * 1000000 + i * 1000 + k;
          entity = coordgeom.children[k];
          coords = entity.children;

          switch( entity.nodeName.toLowerCase() )
          {
            case "curve":
            {
              if( entity.getAttribute( "crvType" ).toLowerCase() !== "arc" )
                break;

              var clockwise = entity.getAttribute( "rot" ).toLowerCase() === "cw";

              var start, center, end, radius, start_angle, end_angle, diff_angle;
              for( var s = 0; s < coords.length; s++ )
              {
                switch( coords[s].nodeName.toLowerCase() )
                {
                  case "start":
                    start = this.coordToVector( coords[s] );
                    break;
                  case "center":
                    center = this.coordToVector( coords[s] );
                    break;
                  case "end":
                    end = this.coordToVector( coords[s] );
                    break;
                }
              }

              if( !start || !center || !end )
                break;

              if( general_settings_screen.settings.swap_ne.val )
              {
                start = start.mirror();
                center = center.mirror();
                end = end.mirror();
              }

              start = start.projunit2meter();
              center = center.projunit2meter();
              end = end.projunit2meter();

              task = Arc.From2PointsAndCenter( start, end, center, !clockwise ).toArcTask( id, null, false, true );
              task.set_label( name );
              tasks.push( task );

              if( !task.start.veryclose( start.add( center ) ) )
                console.warn( "Start wrong" );
              else if( !task.end.veryclose( end.add( center ) ) )
                console.warn( "end wrong" );

              break;
            }
            case "line":
            {

              var start, end;
              for( var s = 0; s < coords.length; s++ )
              {
                switch( coords[s].nodeName.toLowerCase() )
                {
                  case "start":
                    start = this.coordToVector( coords[s] );
                    break;
                  case "end":
                    end = this.coordToVector( coords[s] );
                    break;
                }
              }

              var ends = [ start, end ];

              if( general_settings_screen.settings.swap_ne.val )
              {
                ends = ends.map( ( p ) => {
                  return p.mirror();
                } );
              }

              ends = ends.map( ( p ) => {
                return p.projunit2meter();
              } );

              if( tasks.length > 0 && tasks.last().type === "line" )
              {
                if( !tasks.last().end.veryclose( start ) )
                  ends = ends.slice( 1 );

                tasks[tasks.length - 1].ends = tasks.last().ends.concat( ends );
              }
              else
              {
                task = new LineTask( id, ends, false, true );
                task.set_label( name );
                tasks.push( task );
              }

              break;
            }
            case"irregularline":
            {
              var start, end, dim, points;
              for( var s = 0; s < coords.length; s++ )
              {
                switch( coords[s].nodeName.toLowerCase() )
                {
                  case "start":
                    start = this.coordToVector( coords[s] );
                    break;
                  case "end":
                    end = this.coordToVector( coords[s] );
                    break;
                  case "pntlist2d":
                    dim = 2;
                    points = this.coordToArray( coords[s] );
                    break;
                  case "pntlist3d":
                    dim = 3;
                    points = this.coordToArray( coords[s] );
                    break;
                }
              }

              var ends = [ ];
              for( var d = 0; d < points.length; d += dim )
              {
                ends.push( this.arrayToVector( points, d, d + 1 ) );
              }

              if( general_settings_screen.settings.swap_ne.val )
              {
                ends = ends.map( ( p ) => {
                  return p.mirror();
                } );
              }

              ends = ends.map( ( p ) => {
                return p.projunit2meter();
              } );

              if( tasks.length > 0 && tasks.last().type === "line" )
              {
                tasks[tasks.length - 1].ends = tasks.last().ends.concat( ends.slice( 1 ) );
              }
              else
              {
                task = new LineTask( id, ends, false, true );
                task.set_label( name );
                tasks.push( task );
              }

              break;
            }
            default:
            {
              console.warn( "Could not parse LandXML entity" );
            }
          }
        }
      }

    }

    return tasks;

  }

  // Old getFeatures method
  getFeaturesOld( features, base_idx )
  {
    var tasks = [ ];
    for( var j = 0; j < features.length; j++ )
    {

      var coords = [ ];
      var name = features[j].getAttribute( "name" );

      // Line
      if( features[j].firstElementChild.firstElementChild.nodeName === "Line" )
      {
        var childs, pos, new_coord;
        for( var k = 0; k < features[j].firstElementChild.children.length; k++ )
        {
          if( features[j].firstElementChild.children[k].nodeName === "Line" )
          {
            childs = features[j].firstElementChild.children[k].children;
            pos = childs[0].innerHTML.split( " " );
            new_coord = new Vector( parseFloat( pos[0] ), parseFloat( pos[1] ) );
            if( coords.length > 0 )
            {
              if( !new_coord.equals( coords[coords.length - 1] ) )
                coords.push( new_coord );
            }
            else
            {
              coords.push( new_coord );
            }
            pos = childs[1].innerHTML.split( " " );
            coords.push( new Vector( parseFloat( pos[0] ), parseFloat( pos[1] ) ) );
          }
        }

      }

      // IrregularLine
      if( features[j].firstElementChild.firstElementChild.nodeName === "IrregularLine" )
      {
        var name = features[j].getAttribute( "name" );
        var childs = features[j].firstElementChild.firstElementChild.children;
        var idx2D = -1;
        var idx3D = -1;
        for( var n = 0; n < childs.length; n++ )
        {
          if( childs[n].nodeName === "PntList2D" )
            idx2D = n;
          if( childs[n].nodeName === "PntList3D" )
            idx3D = n;
        }

        if( idx2D !== -1 )
        {
          var pos2D = childs[idx2D].innerHTML.split( " " );
          for( var m = 0; m < pos2D.length; m += 2 )
          {
            coords.push( new Vector( parseFloat( pos2D[m] ), parseFloat( pos2D[m + 1] ) ) );
          }
        }
        if( idx3D !== -1 )
        {
          var pos3D = childs[idx3D].innerHTML.split( " " );
          for( var m = 0; m < pos3D.length; m += 3 )
          {
            coords.push( new Vector( parseFloat( pos3D[m] ), parseFloat( pos3D[m + 1] ) ) );
          }
        }

      }

      if( general_settings_screen.settings.swap_ne.val )
      {
        coords = coords.map( ( p ) => {
          return p.mirror();
        } );
      }
      coords = coords.map( ( p ) => {
        return p.projunit2meter();
      } );
      var new_task = new LineTask( j + base_idx + 1, coords, false, true );
      new_task.set_label( name );
      tasks.push( new_task );
    }
    return tasks;
  }
}
