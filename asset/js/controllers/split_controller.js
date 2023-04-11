/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Requirements: https://docs.google.com/document/d/1ni7puSRzEIT-Ae-O8Y-2BV_S9grpgMphTLsDhf_0AtY
 */

/* global robot_controller */

var split_controller =
{
  max_angle: 5.0, // (deg) Max angle between two consecutive straight line segments, §1.0
  closed_distance: 0.001, // (m) Max distance between end-points for the line to be considered closed
  control_distance: 2.0, // (m) distance of added control point to corner, §5.1
  stepsize: 0.10, // (m) Stepsize of sampling
  merge_angle: 0.001, // (deg) Max angle before tangential lines are no longer merged
  legacy_robot_spline_stepsize: 0.10, // (m) The stepsize used in the robot jobconverter before RS6.7.0
  max_arc_radius: 10, // (m) §2.3
  min_line_length: 0.005, // (m) Minimum length of two-end LineTasks to be added in splitter
  robot_merge_angle: 0.05, // (rad) Max angle before tangential lines are no longer merged ON ROBOT
  max_spline_length: 25, // (m) The maximum length of splines
  split_job: function( job )
  {
    job.split_tasks = split_controller.split_tasks( job.tasks );
    console.log( "split job:", job );
    return job;
  },
  split_tasks: function( tasks, smooth_only, force_no_split )
  {
    if( $( "#disable_splitter_checkbox" ).is( ':checked' ) )
      return tasks;

    // Create split_tasks array if not existing, or reset it
    var split_tasks = [ ];
    // Split each task and push it to split_tasks
    for( var i = 0; i < tasks.length; i++ )
    {
      let splitted = split_controller.split_task( tasks[i], smooth_only, force_no_split );
      if( !!tasks[i].label )
        splitted[0].label = tasks[i].label;
      split_tasks = split_tasks.concat( splitted );
      // §2.3
      if( (tasks[i].type === "arc3" && tasks[i].radius.length < split_controller.max_arc_radius)
        || (i + 1 < tasks.length && tasks[i + 1].type === "arc3" && tasks[i + 1].radius.length < split_controller.max_arc_radius) )
      {
        split_tasks[split_tasks.length - 1].task_options.push( new BoolRobotAction( "task_merge_next", false ) );
      }
    }

    if( split_tasks.length === 0 )
    {
      console.warn( "Could not split tasks. Returning original." );
      return tasks;
    }

    for( let i = 0; i < split_tasks.length; i++ )
    {
      split_tasks[i].id = i;
    }

    return split_tasks;
  },
  split_task: function( task, smooth_only, force_no_split )
  {
    var layer = task.layer;
    // Check if task should be split
    if( task.type !== "line"
      && task.type !== "ellipse"
      && task.type !== "spline"
      && task.type !== "bezier" )
      return [ task ];
    if( task.type === "line" && task.ends.length <= 2 )
      return [ task ];
    if( task.type !== "line" )
    {
      if( smooth_only || force_no_split )
      {
        switch( task.type )
        {
          case "spline":
          case "bezier":
          {
            task = task.sample( task.length / 1000 );
            break;
          }
          default:
            return [ task ];
        }
      }
      else
      {
        task = task.sample( split_controller.stepsize );
      }
    }

    var e = task.ends;
    if( !smooth_only )
    {
      /*
       * Split all corners of angle >5deg
       */
      var si = [ ]; // Split indices

      // Find split indices
      var L1, L2, angle, max_angle, i;
      max_angle = split_controller.max_angle.deg2rad();
      L1 = new Line( e[0], e[1] );
      for( i = 1; i < e.length - 1; i++ )
      {
        // If corner is >5deg (in direction of movement)
        L2 = new Line( e[i], e[i + 1] );
        angle = L1.angle_between( L2 );
        if( angle > max_angle )
        {
          // Add index to split indices
          si.push( i );
        }
        L1 = L2;
      }

      // Add the last end
      si.push( e.length - 1 );
      // Create groups of ends
      var ge = [ ]; // Group of ends
      var prev = 0;
      si.forEach( function( i )
      {
        // Create a new LineTask with all
        ge.push( e.slice( prev, i + 1 ) );
        prev = i;
      } );
    }
    else
      var ge = [ e ];
    // Create new LineTasks
    var new_tasks = [ ];
    var id = 0;
    task.layer = layer;
    ge.forEach( function( e )
    {
      id += 1e4;
      if( e.length > 2 )
      {
        new_tasks = new_tasks.concat( split_controller.smooth( e, task, id ) );
      }
      else
      {
        if( e[0].dist_to_point( e[1] ) > split_controller.min_line_length )
          new_tasks.push( new LineTask( task.id + id, e, task.reverse, task.paint ) );
      }
    } );
    return new_tasks;
  },
  smooth( e, task, id_mod ) // ends
  {

    var do_merge = true;
    var count = 0;

    if( false )
    {
      // Split spline into smaller splines

      var e_groups = [ [ ] ];
      var dist = 0;
      var e_old = e.shift();
      e.forEach( ( e_new ) => {
        if( dist < split_controller.max_spline_length || e_groups[e_groups.length - 1].length < 3 )
        {
          e_groups[e_groups.length - 1].push( e_old );
          dist += e_old.dist_to_point( e_new );
        }
        else
        {
          e_groups[e_groups.length - 1].push( e_old );
          dist = 0;
          e_groups.push( [ e_old ] );
        }
        e_old = e_new;
      } );
      e_groups[e_groups.length - 1].push( e_old );

      var splines = [ ];
      var id = 0;
      e_groups.forEach( ( es, idx ) => {
        id += 1e4;

        // Merge parallel line pieces
        if( do_merge )
          es = split_controller.reduce_points( es );

        count += es.length;

        var fitter = new FitBSpline( es, split_controller.control_distance, false );
        var spline = fitter.getSplineTask( task.id + id_mod + id, task.reverse, task.paint );
        spline.layer = task.layer;
        splines.push( spline );
      } );

      // Create SplineTask
      return splines;
    }
    else
    {
      // Keep spline as single spline

      // Merge parallel line pieces
      if( do_merge )
        e = split_controller.reduce_points( e );

      var fitter = new FitBSpline( e, split_controller.control_distance, false );
      var spline = fitter.getSplineTask( task.id + id_mod, task.reverse, task.paint );
      spline.layer = task.layer;
      return [ spline ];
    }
  },
  reduce_points: function( e )
  {
    var nes = [ e[0] ];
    var L1, L2, max_angle;
    L1 = new Line( e[0], e[1] );
    max_angle = split_controller.merge_angle.deg2rad();
    for( var i = 1; i < e.length - 1; i++ )
    {
      L2 = new Line( e[i], e[i + 1] );
      if( L1.angle_between( L2 ) > max_angle )
      {
        nes.push( e[i] );
        L1 = L2;
      }
    }
    nes.push( e.last() );

//    console.log( "Reduced points from", e.length, "to", nes.length );
    return nes;
  },
  merge_linetasks: function( tasks )
  {
    var mergemap = [ ];
    for( var i = 0; i < tasks.length; i++ )
    {
      if( tasks[i].type === "line" )
      {
        if( mergemap.length === 0 )
        {
          mergemap.push( [ i ] );
        }
        else if( mergemap.last().indexOf( i - 1 ) > -1 && tasks[i - 1].type === "line" && tasks[i - 1].end.equals( tasks[i].start ) )
        {
          mergemap[mergemap.length - 1].push( i );
        }
        else
        {
          mergemap.push( [ i ] );
        }
      }
      else
      {
        mergemap.push( [ i ] );
      }
    }

    var new_tasks = [ ];
    mergemap.forEach( ( g, j ) => {
      if( g.length === 1 )
      {
        new_tasks.push( tasks[g[0]] );
      }
      else
      {
        var task = tasks[g[0]];
        for( var i = 1; i < g.length; i++ )
        {
          task.ends = task.ends.concat( tasks[g[i]].ends.slice( 1 ) );
        }
        new_tasks.push( task );
      }
    } );

    return new_tasks;
  },
  smooth_old( e, task, id_mod ) // ends
  {

    if( e.length < 3 )
      return new LineTask( task.id + id_mod, e, task.reverse, task.paint );
    // Add extra control points, §5.1
    if( split_controller.control_distance > 0 )
    {
      var tmpe = [ ];
      for( var i = 0; i < e.length - 1; i++ )
      {
        tmpe.push( e[i] );
        if( e[i].dist_to_point( e[i + 1] ) >= 2 * split_controller.control_distance )
          tmpe.push( new Line( e[i], e[i + 1] ).unit_vector.multiply( split_controller.control_distance ).add( e[i] ) );
        if( e[i].dist_to_point( e[i + 1] ) > 2 * split_controller.control_distance )
          tmpe.push( new Line( e[i + 1], e[i] ).unit_vector.multiply( split_controller.control_distance ).add( e[i + 1] ) );
      }
      tmpe.push( e[i] );
      // Override e with new e's
      e = tmpe;
    }

    var closed = e[0].dist_to_point( e[e.length - 1] ) < split_controller.closed_distance;
    var degree = e.length < 4 ? 2 : 3;
    if( false && closed )
    {
//      // https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/B-spline/bspline-curve-closed.html
//      let start = e[e.length - 2];
//      let end = e[1];
//      e.push( end );
//      e = [ start ].concat( e );
      // https://github.com/thibauts/b-spline
      for( var i = 0; i < degree + 1; i++ )
      {
        e.push( e[i] );
      }
    }
    var domain = [ degree, e.length ];
    // Find knots from definition
    var knots = [ ];
    var j = 0;
    for( var i = 0; i < e.length + degree + 1; i++ )
    {
      if( true || !closed )
      {
        // Clamp to ends
        if( i < domain[0] )
          j = domain[0];
        else if( i > domain[1] )
          j = domain[1];
        else
          j = i;
      }
      else
      {
        // Create uniform knot vector
        j = i;
      }
      knots.push( j );
    }

    // Normalize knots
    knots = knots.map( ( k ) => {
      return (k - knots[0]) / (knots[knots.length - 1] - knots[0]);
    } );
    // Create SplineTask
    var new_spline = new SplineTask( task.id + id_mod, e, knots, degree, closed, task.reverse, task.paint );
    if( !robot_controller.robot_has_capability( "spline_v2_task" ) && new_spline.length < 2 * split_controller.legacy_robot_spline_stepsize )
      return new LineTask( task.id + id_mod, e, task.reverse, task.paint );
    else
      return new_spline;
  }
};