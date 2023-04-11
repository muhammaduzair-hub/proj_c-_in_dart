/* global file_loader_screen, math, robot_controller, SETTINGS, general_settings_screen */

// https://github.com/gdsestimating/dxf-parser

var dxf =
{
  load: function( contents, layer, returnObj )
  {
    this.contents = contents;
    this.layer = layer;

    var parser = new DxfParser();
    var dxfparsed = null;

    try
    {
      dxfparsed = parser.parseSync( this.contents );
    }
    catch( err )
    {
      return console.error( err.stack );
    }
    var entities = dxfparsed.entities;
    var entity_tasks = [ ];
    var notparsed = {};
    var parsed = {};
    let blocks = Object.entries(dxfparsed.blocks); 
    if(blocks.length > 2){
      blocks.forEach((block) =>{
        if(block[1].entities){
          block[1].entities.forEach((item)=>{
            entities.push(item);
          });
        }
      });
    }
    var handle_map = {};

    var task, tasks;
    for( var i = 0; i < entities.length; i++ )
    {
      task = null;
      tasks = null;

      if( !parsed[entities[i].type] )
        parsed[entities[i].type] = [ ];
      parsed[entities[i].type].push( entities[i] );

      if( entities[i].type === 'POINT' && dxf.checkLayer( entities[i], layer ) )
      {
        // Type: POINT
        task = dxf.parsePoint( entities[i], i );
      }
      else if( entities[i].type === 'CIRCLE' && dxf.checkLayer( entities[i], layer ) )
      {
        // Type: CIRCLE
        task = dxf.parseCircle( entities[i], i );
      }
      else if( entities[i].type === 'ARC' && dxf.checkLayer( entities[i], layer ) )
      {
        // Type: ARC
        task = dxf.parseArc( entities[i], i );
      }
      else if( entities[i].type === 'ELLIPSE' && dxf.checkLayer( entities[i], layer ) )
      {
        // Type: Ellipse
        task = dxf.parseEllipse( entities[i], i );
      }
      else if( (entities[i].type === 'LINE' || entities[i].type === 'POLYLINE' || entities[i].type === 'LWPOLYLINE') && dxf.checkLayer( entities[i], layer ) )
      {
        //Type: LINE, POLYLINE, LWPOLYLINE
        tasks = dxf.parsePolyline( entities[i], i );
      }
      else if( entities[i].type === 'SPLINE' && dxf.checkLayer( entities[i], layer ) )
      {
        // Type: Spline
        task = dxf.parseSpline( entities[i], i );
      }
      else
      {

        if( !notparsed[entities[i].type] )
          notparsed[entities[i].type] = 0;
        notparsed[entities[i].type]++;

      }

      // Push task(s)
      if( SETTINGS.split_usb_jobs )
      {
        if( task && !tasks )
          entity_tasks.push( [ task ] );
        else if( !task && tasks )
          entity_tasks.push( tasks );

        if( task || tasks )
        {
          handle_map[entities[i].handle] = entity_tasks.length - 1;
        }
      }
      else
      {
        if( task && !tasks )
          entity_tasks.push( task );
        else if( !task && tasks )
          entity_tasks = entity_tasks.concat( tasks );
      }

    }

    if( Object.keys( notparsed ).length > 0 )
      console.log( "didn't parse", notparsed );

    // Remove undefined (not parsed) tasks
    if( SETTINGS.split_usb_jobs )
    {
      entity_tasks = $.grep( entity_tasks, function( n )
      {
        return n[0] !== undefined;
      } );
    }
    else
    {
      entity_tasks = $.grep( entity_tasks, function( n )
      {
        return n !== undefined;
      } );
    }


    if( returnObj )
    {
      return entities;
    }
    else
    {
      return entity_tasks;
    }
  },
  checkLayer: function( entity, layer )
  {
    if( layer )
    {
      return entity.layer === layer;
    }
    else
    {
      return true;
    }
  },
  parsePoint: function( entity, id )
  {
    var point = new Vector( entity.position.x, entity.position.y );

    if( general_settings_screen.settings.swap_ne.val )
      point = point.mirror();

    point = point.projunit2meter();

    var new_task = new WaypointTask( id, point, false, true );
    new_task.layer = entity.layer;
    return new_task;
  },
  parseCircle: function( entity, id )
  {
    var points = [ ];

    var center = new Vector( entity.center.x, entity.center.y );
    var radius = new Vector( entity.radius, 0 );


    if( general_settings_screen.settings.swap_ne.val )
      center = center.mirror();

    center = center.projunit2meter();
    radius = radius.projunit2meter();

    points.push( center.add( radius ) );
    points.push( center.subtract( radius ) );

    var new_task = new ArcTask( id, points, center, true, false, true );


    if( new_task.length < 0.01 )
      new_task = new WaypointTask( id, center, false, true );

    new_task.layer = entity.layer;
    return new_task;
  },
  parseArc: function( entity, id )
  {
    var direction = entity.normal.z;

    var center = new Vector( entity.center.x * direction, entity.center.y );

    var radius = new Vector( entity.radius, 0 );
    var P1 = radius.rotate( entity.startAngle * direction ).add( center );
    var P2 = radius.rotate( entity.endAngle * direction ).add( center );

    var angleLength = entity.angleLength < 0 ? 2 * math.PI + entity.angleLength : entity.angleLength;
    angleLength *= math.sign( entity.angleLength );

    if( entity.startAngle * direction > entity.endAngle * direction )
    {
      var midAngle = angleLength / 2 + entity.endAngle;
    }
    else
    {
      var midAngle = angleLength / 2 + entity.startAngle;
    }
    var P3 = radius.rotate( midAngle * direction ).add( center );

    var points = [ P1, P3, P2 ];

    if( general_settings_screen.settings.swap_ne.val )
    {
      points = points.map( ( p ) => {
        return p.mirror();
      } ).reverse();
      center = center.mirror();
      P1 = P1.mirror();
      P2 = P2.mirror();
      P3 = P3.mirror();
    }

    points = points.map( ( p ) => {
      return p.projunit2meter();
    } );
    center = center.projunit2meter();
    P1 = P1.projunit2meter();
    P2 = P2.projunit2meter();
    P3 = P3.projunit2meter();

    var new_task = new ArcTask( id, points, center, false, false, true );

    if( new_task.length < 0.01 )
      new_task = new WaypointTask( id, P1, false, true );

    new_task.layer = entity.layer;

    return new_task;
  },
  parseEllipse: function( entity, id )
  {
    var direction = entity.normal.z;

    // Fetch entity params
    var center = new Vector( entity.center.x * direction, entity.center.y );
    var start_angle = entity.startAngle;
    var end_angle = entity.endAngle;
    if( direction < 0 )
    {
      start_angle = Math.PI - start_angle;
      if( start_angle < 0 )
        start_angle += 2 * Math.PI;
      if( start_angle > 2 * Math.PI )
        start_angle -= 2 * Math.PI;
      end_angle = Math.PI - end_angle;
      if( end_angle < 0 )
        end_angle += 2 * Math.PI;
      if( end_angle > 2 * Math.PI )
        end_angle -= 2 * Math.PI;
    }
    var major = new Vector( entity.majorAxisEndPoint.x, entity.majorAxisEndPoint.y );

    // Calculate minor vector
    var minor = major.rotate_90_ccw().multiply( entity.axisRatio );

    // Add center
    // Center is added since ends must be positioned absolute and not relative
    var points = [ minor.add( center ), major.add( center ) ];
    if( general_settings_screen.settings.swap_ne.val )
    {
      points = points.map( ( p ) => {
        return p.mirror();
      } );
      center = center.mirror();
    }


    points = points.map( ( p ) => {
      return p.projunit2meter();
    } );
    center = center.projunit2meter();


    // Return task
    var new_task = new EllipseTask( id, points, [ start_angle, end_angle ], center, undefined, false, true );
    new_task.start_angle = start_angle;
    new_task.layer = entity.layer;
    return new_task;
  },
  parsePolyline: function( entity, id )
  {
    var points = [ ];
    var tasks = [ ];

    if( entity.includesSplineFitVertices )
    {
      tasks.push( dxf.parseSpline( entity, id ) );
      return tasks;
    }

    entity.vertices = entity.vertices.filter( function( v )
    {
      return !v.splineControlPoint;
    } );

    // If Entity is closed
    if( entity.shape )
    {
      entity.vertices.push( entity.vertices[0] );
    }

    for( var j = 0; j < entity.vertices.length; j++ )
    {

      var P1 = new Vector(
        entity.vertices[j].x,
        entity.vertices[j].y
        );

      if( entity.vertices[j].bulge && j + 1 < entity.vertices.length )
      {

        // End previous linear polyline
        if( points.length > 0 )
        {
          points.push(
            new Vector(
              entity.vertices[j].x,
              entity.vertices[j].y
              )
            );
          if( general_settings_screen.settings.swap_ne.val )
          {
            points = points.map( ( p ) => {
              return p.mirror();
            } );
          }
          points = points.map( ( p ) => {
            return p.projunit2meter();
          } );
          var new_task = new LineTask( id, points, false, true );
          new_task.layer = entity.layer;
          tasks.push( new_task );
        }

        // Create arc
        var P2 = new Vector(
          entity.vertices[j + 1].x,
          entity.vertices[j + 1].y
          );

        var d = P2.subtract( P1 ).divide( 2 );
        var P3 = P1.add( d ).add( d.rotate_90_cw().multiply( entity.vertices[j].bulge ) );

        points = [ P1, P3, P2 ];
        if( general_settings_screen.settings.swap_ne.val )
        {
          points = points.map( ( p ) => {
            return p.mirror();
          } ).reverse();
        }
        points = points.map( ( p ) => {
          return p.projunit2meter();
        } );

        var new_task = new ArcTask( -j, points, undefined, (entity.vertices[j].bulge < 0), false, true );
        var l = new Line( points[0], points[2] );
        var cp = l.point_on_line( points[1] );
        var d = (new Line( points[1], cp )).length;

        if( new_task.length > 0 )
        {
          if( new_task.length < 0.01 || d < 0.001 )
            new_task = l.toLineTask(id, false, true);

          new_task.layer = entity.layer;
          tasks.push( new_task );
        }
        else
        {
          console.warn( "Found task with zero length." );
        }
        points = [ ];
      }
      else
      {
        points.push( new Vector( entity.vertices[j].x, entity.vertices[j].y ) );
      }
    }

    if( points.length > 1 )
    {
      if( general_settings_screen.settings.swap_ne.val )
      {
        points = points.map( ( p ) => {
          return p.mirror();
        } );
      }
      points = points.map( ( p ) => {
        return p.projunit2meter();
      } );
      var new_task = new LineTask( id, points, false, true );
      new_task.layer = entity.layer;
      tasks.push( new_task );
    }

    // Merge close points
    if( SETTINGS.dxf_merge_min_tasks )
    {
      var new_tasks = [ ];
      var m = SETTINGS.minimum_task_length;
      var i = 0;
      while( i < tasks.length )
      {
        if( tasks[i].type === "arc3" )
        {
          new_tasks.push( tasks[i] );
          i += 1;
        }
        else if( tasks[i].type === "line" )
        {
          var tmp_task = tasks[i];

          i += 1;
          while( i < tasks.length && tasks[i].type === "line" )
          {
            tmp_task.ends.pushAll( tasks[i].ends );
            i += 1;
          }

          new_tasks.push( tmp_task );
        }
      }

      tasks = new_tasks;
    }

    return tasks;
  },
  parseSpline: function( entity, id )
  {

    if( !robot_controller.robot_has_capability( "spline_task" ) )
    {
      console.log( "Didn't parse Spline, minimum RS6.0.0 needed" );
      return;
    }

    if( entity.type === "POLYLINE" && entity.includesSplineFitVertices )
    {
      var closed = entity.shape;
      var control_points = entity.vertices.filter( function( v )
      {
        return v.splineControlPoint;
      } );
      var degree = 3;


      var sampled_points = entity.vertices.filter( function( v )
      {
        return !v.splineControlPoint;
      } );
      var length = 0;
      for( var i = 1; i < sampled_points.length; i++ )
      {
        length += Math.sqrt( Math.pow( sampled_points[i - 1].x - sampled_points[i].x, 2 ) + Math.pow( sampled_points[i - 1].y - sampled_points[i].y, 2 ) );
      }

      var knot_step = length / (control_points.length - degree);
      var knots = [ ];
      for( var i = 0; i < degree + 1; i++ )
      {
        knots.push( 0 );
      }
      for( var i = 1; i < (control_points.length - degree); i++ )
      {
        knots.push( knot_step + knots[degree + i - 1] );
      }
      for( var i = 0; i < degree + 1; i++ )
      {
        knots.push( length );
      }
    }
    else
    {
      var closed = entity.closed;
      var control_points = entity.controlPoints;
      var degree = entity.degreeOfSplineCurve;
      var knots = entity.knotValues;
    }

    var points = [ ];
    for( var i = 0; i < control_points.length; i++ )
    {
      let p = new Vector( control_points[i].x, control_points[i].y );
      if( general_settings_screen.settings.swap_ne.val )
        p = p.mirror();

      p = p.projunit2meter();
      points.push( p );
    }

    // Normalize knots
    var length = knots.slice( -1 )[0];
    knots = knots.map( function( knot )
    {
      return knot / length;
    } );

    // Return task
//    var new_task = new LineTask( id, points, false, true );
//    console.warn("UNCOMMENT THE NEXT LINE");
    var new_task = new SplineTask( id, points, knots, degree, closed, false, true );
    new_task.layer = entity.layer;
    new_task.length = length;
    return new_task;
  }
};
