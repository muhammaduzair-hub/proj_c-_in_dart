/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global run_pitch_controller, robot_controller, WaypointTask, ArcTask, LineTask, Infinity, math, BezierCurve */

/**
 * @param {Job} job The job to generate fluent run tasks from
 * @param {Object} options Option for the fluent run
 * @param {Boolean} [enable=true] 
 * @param {Number} [min_turn_radius=run_pitch_controller.fluent_run_minimum_turn_angle] 
 * @param {Boolean} [start_at_robot=false] 
 * @param {String} [turn_direction="both"] 
 * @param {String} [end_turn_direction="both"] 
 * @param {Boolean} [only_one_side=false] makes sure that the CSC is extended so that it doesn't cross the streight line
 * @param {Boolean} [ignoreCCC=true] 
 * @param {Boolean} [ignoreSCS=false] 
 * @param {Boolean} [ignoreCSC=false] 
 * @param {Boolean} [add_ramp_down=false] 
 * @param {Boolean} [force_turn_to_match_next=false] 
 * @param {Boolean} [smoothing=true] 
 * @param {Number} [smooth_distance=1] 
 * @param {Boolean} [add_ramp_to_next=true] 
 * @param {Boolean} [force_merge=true] 
 * @param {Boolean} [split_on_progress=true] 
 * @returns {Array<Task>} A new task array with fluent run in it
 */
function make_fluent_run( job, options )
{
  if (!robot_controller.chosen_robot.online) {
    return job.tasks;
  }

  if( !options )
    options = {};

  let default_options = {
    enable: true,
    min_turn_radius: run_pitch_controller.fluent_run_minimum_turn_angle,
    start_at_robot: false,
    turn_direction: "both",
    end_turn_direction: "both",
    only_one_side: false,
    ignoreCCC: true,
    ignoreSCS: false,
    ignoreCSC: false,
    add_ramp_down: false,
    force_turn_to_match_next: false,
    smoothing: true,
    smooth_distance: 1,
    add_ramp_to_next: true,
    force_merge: true,
    split_on_progress: true,
    draw_job: true,
  };

  Object.keys( options ).forEach( k => {
    default_options[k] = options[k];
  } );
  options = default_options;

  if( options.smoothing )
    options.add_ramp_down = true;

  if(options.draw_job)
    job.draw();
  if( job.tasks.length === 0 )
    return[ ];

  let tasks = job.tasks;
  if(job.options["Ignore lines"].val) {
    tasks = tasks.filter(t=>job.options.taskModificationIds.ignoreids.indexOf(t.id)<0);
  }
  var new_task_list = [ ];

  if(options.split_on_progress && robot_controller.chosen_robot.in_auto)
  {
    tasks = run_pitch_controller.split_jobs_on_current_progress( tasks, job.start_from.index, job.start_from.percent ).tasks_left;
  }

  if( !options.start_at_robot )
  {
    new_task_list.push( tasks[0] );
  }
  else
  {
    var r = robot_controller.chosen_robot;
    var robot_guide = (new Vector( 1.0, 0 )).rotate( r.t );
    let streight = r.pos.add( robot_guide );
    let streight_task = new LineTask( -1, [ r.pos, streight ] );
    streight_task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
    streight_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
    new_task_list.push( streight_task );
    streight_task.fluent_run_options = options;
  }

  let default_driving_speed = (new Task()).get_task_action_option_value( job, "drive_max_velocity" );
  let default_curvature = 1 / options.min_turn_radius;


  tasks.forEach( ( task, i ) => {
    let task_fluent_options = JSON.copy( options );
    Object.keys( task.fluent_run_options ).forEach( k => {
      task_fluent_options[k] = task.fluent_run_options[k];
    } );
    let max_smooth_dist = 2 * task_fluent_options.min_turn_radius - 0.4;
    // radius * x = max_smooth_dist
    // 0.7*x +a = 1.0 // 0.6*x = 0.8 // 0.5*x = 0.6 // 0.4*x = 0.4 // 0.3*x = 0.2F // 0.2*x = 0.0
    if( max_smooth_dist < task_fluent_options.smooth_distance )
      task_fluent_options.smooth_distance = max_smooth_dist.round( 6 );
    task.fluent_run_options = task_fluent_options;
  } );

  let overwrite_last_task = false;

  tasks.forEach( ( task, i ) => {

    if( !options.start_at_robot && i === 0 )
      return;
    let task_fluent_options = task.fluent_run_options;

    // Assumptions
    //  - Between tasks allways has platform_direction = 1 ( caster wheel front )
    //  - Between tasks allways drives with default driving speed, (unless, When implemented, local curvature prevents it)
    //  - Best path allways starts with a ramptask that can can be fully transformed to a smothing part

    // what causes it to not force merge?
    //  - Diferent speed
    //  - Diferent direction
    //  - Waypoints
    let last_task;
    if( overwrite_last_task )
    {
      last_task = overwrite_last_task;
      overwrite_last_task = false;
    }
    else
      last_task = new_task_list.last();


    if( !task.fluent_run_options.enable )
    {
      new_task_list.push( task );
      return;
    }

    let [ last_angle, last_curvature, last_speed, last_direction, last_pathshift_tool ] = get_task_parameters( job, last_task, false );
    let [ current_angle, current_curvature, current_speed, current_direction, current_pathshift_tool ] = get_task_parameters( job, task, true );

    // If radius is less than global radius, but greater than 0.7, set the local turn radius to the task start radius.
    if( current_curvature > default_curvature && current_curvature < (1 / 0.7) )
      task_fluent_options.min_turn_radius = 1 / current_curvature;
    if( last_curvature > (1 / task_fluent_options.min_turn_radius) && last_curvature < (1 / 0.7) )
      task_fluent_options.min_turn_radius = 1 / last_curvature;


    let force_merge_next = true; // should fluent tasks be merged with task
    let force_merge_prev = true; // should fluent tasks be merged with last_task
    let allow_ramp_merge_up = true; // should the ramp on task be merged with the task or the fluent run
    let allow_ramp_merge_down = true; // should the ramp after last_task be merged with the task or the fluent run

    if( last_speed !== default_driving_speed )
    {
      force_merge_prev = false;
      if( last_task instanceof ArcTask && last_task.radius.length < 0.5 )
        allow_ramp_merge_down = false;
    }

    if( current_speed !== default_driving_speed )
    {
      force_merge_next = false;
      if( task instanceof ArcTask && task.radius.length < 0.5 )
        allow_ramp_merge_up = false;
    }

    if( last_direction === 2 )
    {
      force_merge_prev = false;
      allow_ramp_merge_up = false;
      allow_ramp_merge_down = false;
    }
    if( current_direction === 2 )
    {
      force_merge_next = false;
      allow_ramp_merge_up = false;
      allow_ramp_merge_down = false;
    }

    if( last_pathshift_tool !== current_pathshift_tool )
    {
      if( !current_pathshift_tool )
      {
        force_merge_next = false;
      }
      if( !last_pathshift_tool )
      {
        force_merge_prev = false;
        allow_ramp_merge_down = false;
      }
    }

    // Should make path between?
    //  - If it stops and starts in same position and has same direction and has same curvature
    let direct = new Line( last_task.end, task.start );
    if( !force_merge_next )
    {
      let aramp = task.makeRamp( task.get_task_action_option_value( job, "ramp_up_max_dist" ) );
      direct = new Line( last_task.end, aramp.start );
    }
    if(
      direct.length < 0.015 &&
      //Math.abs( last_curvature - current_curvature ) < 0.01 &&
      Math.abs( (last_angle - current_angle).normalizeAnglePlusMinus ) < 0.02 // 1 degree
      )
    {
      if( force_merge_prev && force_merge_next )
        task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
      new_task_list.push( task );
      return;
    }
    //  - If it stops at same direction with curvature 0 but with a long distance
    if(
      //Math.abs( last_curvature ) < 0.01 &&
      //Math.abs( current_curvature ) < 0.01 &&
      Math.abs( (last_angle - current_angle).normalizeAnglePlusMinus ) < 0.01 &&
      Math.abs( (direct.angle - current_angle).normalizeAnglePlusMinus ) < 0.01
      )
    {
      if( force_merge_prev && force_merge_next )
        task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
      new_task_list.push( task );
      return;
    }

    task_fluent_options.force_merge_next = force_merge_next;
    task_fluent_options.force_merge_prev = force_merge_prev;

    // Find best path between the two tasks.
    let best_path = find_best_between_path( job, last_task, task, task_fluent_options );

    if( best_path.path.length )
    {
      best_path.path = smooth_tasks( job, best_path.path, task_fluent_options.smooth_distance, false, false );

      best_path.path[0].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
      best_path.path[0].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      if( force_merge_prev )
      {
        best_path.path[0].task_options.push( new BoolRobotAction( "task_merge_force", true ) );
        best_path.path[0].task_options.remove( "task_merge_next" ); // if it was added from last_task
        best_path.path[1].task_options.push( new BoolRobotAction( "task_merge_force", true ) );
      }

      if( !force_merge_prev )
      {
        if( allow_ramp_merge_down )
        {
          best_path.path[0].task_options.push( new BoolRobotAction( "task_merge_force", true ) );
          best_path.path[0].task_options.push( new BoolRobotAction( "task_merge_next", false ) );

          best_path.path[1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          best_path.path[1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        }
        else
        {
          last_task.task_options.push( new BoolRobotAction( "task_merge_next", false ) );
          best_path.path[0].task_options.remove( "task_merge_next" );

          best_path.path[1].task_options.push( new BoolRobotAction( "task_merge_force", true ) );
        }
      }

      for( let ti = 2; ti < (best_path.path.length - 1); ti++ )
        best_path.path[ti].task_options.push( new BoolRobotAction( "task_merge_force", true ) );

      if( force_merge_next )
        best_path.path.last( ).task_options.push( new BoolRobotAction( "task_merge_force", true ) );


      if( !force_merge_next )
      {
        if( allow_ramp_merge_up )
        {
          best_path.path.last( -1 ).task_options.push( new BoolRobotAction( "task_merge_next", false ) );

          best_path.path.last( ).task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          best_path.path.last( ).task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        }
        else
        {
          best_path.path.last( ).task_options.push( new BoolRobotAction( "task_merge_force", true ) );
          best_path.path.last( ).task_options.push( new BoolRobotAction( "task_merge_next", false ) );
        }
      }


      // Make sure the ramps has the same options as the not ramps
      if( !last_pathshift_tool && allow_ramp_merge_down )
      {
        let last_navigate_tool = last_task.get_task_action_option_value( job, "navigate_tool" );
        best_path.path[0].task_options.push( new BoolRobotAction( "pathshift_tool", last_pathshift_tool ) );
        best_path.path[0].task_options.push( new BoolRobotAction( "navigate_tool", last_navigate_tool ) );
      }
      if( !current_pathshift_tool && allow_ramp_merge_up )
      {
        let current_navigate_tool = task.get_task_action_option_value( job, "navigate_tool" );
        best_path.path.last().task_options.push( new BoolRobotAction( "pathshift_tool", current_pathshift_tool ) );
        best_path.path.last().task_options.push( new BoolRobotAction( "navigate_tool", current_navigate_tool ) );
      }

      if ( !robot_controller.robot_has_capability("job_merge_noaction") ) {
        best_path.path.forEach((_,ti) => { // OptionArrays makes sure that the same option is not in the list twise.
          best_path.path[ti].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          best_path.path[ti].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        });
      }

      if ( robot_controller.robot_has_capability("job_task_viahard") ) {
        best_path.path.forEach((_,ti) => { // OptionArrays makes sure that the same option is not in the list twise.
          best_path.path[ti].via = true;
        });
      }

      new_task_list.pushAll( best_path.path );

    }
    
    // THIS CODE SAVED FOR FUTURE REFERENCE
    // if( force_merge_next )
    // {
    //   task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
    //   if( !allow_ramp_merge_up )
    //     task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
    // }

    // if( !force_merge_next )
    // {
    //   if( allow_ramp_merge_up )
    //   {
    //     task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
    //   }
    //   else
    //   {
    //     task.task_options.push( new BoolRobotAction( "task_merge_next", false ) );
    //     task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
    //   }
    // }

    if( task instanceof WaypointTask )
    {
      let guide = task.start.subtract( (new Vector( 1, 0 )).rotate( best_path.end_angle ) );
      overwrite_last_task = new LineTask( -1, [ guide, task.start ] );
    }
    else
    {

      if( force_merge_next )
      {
        task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
        if( !allow_ramp_merge_up )
          task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      }

      if( !force_merge_next )
      {
        if( allow_ramp_merge_up )
        {
          task.task_options.push( new BoolRobotAction( "task_merge_force", true ) );
        }
        else
        {
          task.task_options.push( new BoolRobotAction( "task_merge_next", false ) );
          task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
        }
      }
    }

    new_task_list.push( task );

  } );

  /*let beziers = new_task_list.filter( t => t instanceof CubicBezierTask );
   beziers.forEach( t => {
   new_task_list.push( new LineTask( -100, t.ends ) );
   } );*/

   // Convert ids to real ids
  let newId = new_task_list.filter(task=>task.id >= 0).length;
  new_task_list.filter(task=>task.id < 0).forEach(task => {
    task.id = ++newId * -1;
  });

  new_task_list = postProcessNewTasks(new_task_list);

  return new_task_list;
}

function postProcessNewTasks(tasks) {
  let processedList = [];

  for (const task of tasks) {
    if (task instanceof WaypointTask) {
      task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
    }
    processedList.push(task);
  }
  return processedList;
}

function get_task_parameters( job, task, start = true)
{
  let speed = task.get_task_action_option_value( job, "drive_max_velocity" );
  let direction = task.get_task_action_option_value( job, "platform_direction" );
  let pathshift_tool = task.get_task_action_option_value( job, "pathshift_tool" );
  let curvature, angle;
  if( start )
  {
    curvature = task.start_curvature;
    angle = task.get_robot_start_direction( job );
  }
  else
  {
    curvature = task.end_curvature;
    angle = task.get_robot_end_direction( job );
  }
  if( (task instanceof ArcTask) && (task.radius.length < 0.5) )
  {
    speed = 0.1;
    //direction = 2;
  }
  return [ angle, curvature, speed, direction, pathshift_tool ];
}

function find_best_between_path( job, last_task, task, options )
{

  // unpack task parameters

  let [ last_angle, last_curvature, last_speed, last_direction, last_pathshift_tool ] = get_task_parameters( job, last_task, false );
  let [ current_angle, current_curvature, current_speed, current_direction, current_pathshift_tool ] = get_task_parameters( job, task, true );

  // make dubins parameters
  let dubins_curvature = 1 / options.min_turn_radius;
  let smooth_distance = options.smooth_distance;

  // all posible routes
  var all = [ ];

  if( !(task instanceof  WaypointTask) )
  {
    let SCS = find_SCS_between_two_tasks( job, last_task, task, options );
    if( SCS[1].length )
      all.push( SCS );
  }

  let ignoreCSC = options.ignoreCSC;
  ignoreCSC = ignoreCSC && !!all.length;


  if( !ignoreCSC )
  {

    if( task instanceof  WaypointTask )
      all.pushAll( find_CS_to_waypoint_task( job, last_task, task, options ) );
    else
    {
      let results = find_CSCs_between_two_tasks( job, last_task, task, options );
      results.forEach( r => r.push( current_angle ) );
      all.pushAll( results );
    }

  }



  let [ best_length, best_path, end_angle ] = all.sort_objects( 0 )[0];
  best_path = best_path.filter( t => t.length > 0.01 ); // remove less than 1cm length tasks
  best_path = best_path.map( t => {
    return t.makeLonger( -0.005, -0.005 );
  } );
  return {path: best_path, length: best_length, end_angle: end_angle};
}

function find_CS_to_waypoint_task( job, from_task, to_task, options )
{

  let [ last_angle, last_curvature, last_speed, last_direction, last_pathshift_tool ] = get_task_parameters( job, from_task, false );
  let [ current_angle, current_curvature, current_speed, current_direction, current_pathshift_tool ] = get_task_parameters( job, to_task, true );
  let smooth_distance = options.smooth_distance;
  let dubins_curvature = 1 / options.min_turn_radius;


  let ramup_task;
  if( options.force_merge_prev )
  {
    if( (new Line( from_task.end, to_task.start )).length < 0.01 )
      ramup_task = from_task.makeRampDown( options.min_turn_radius );
    else
      ramup_task = from_task.makeRampDown( smooth_distance / 2 );
  }
  else
  {
    let ramp_start = from_task.end;
    let ramp_end = ramp_start.add( from_task.get_end_vector( job ).multiply( smooth_distance ) );
    ramup_task = new LineTask( -1, [ ramp_start, ramp_end ] );
  }
  ramup_task.paint = false;
  let from = ramup_task.end;//.add( from_task.get_end_vector(job).multiply( smooth_distance / 2 ) );
  let from_angle = ramup_task.get_robot_end_direction( job );

  let all = [ ];

  [ false, true ].forEach( clockwise => {

    let result = find_CS_between_circle_waypoint( from_angle, options.min_turn_radius, clockwise, from, to_task.start );
    result[1].unshift( ramup_task );
    let ramp_down = new LineTask( -1, [ result[1].last().end, to_task.start ] );
    let streight_lenght = ramp_down.length;
    if( streight_lenght > (smooth_distance / 2 + 0.1) )
    {
      ramp_down.makeLonger( 0, -(streight_lenght - (smooth_distance / 2)) );
      let last_part = (new LineTask( -1, [ result[1].last().end, to_task.start ] )).makeLonger( -(streight_lenght - 0.1), 0 );
      result[1].push( ramp_down );
      result[1].push( last_part );
    }
    else
      result[1].push( ramp_down );
    all.push( result );
  } );


  //[ total_length, [ arc ], streight.angle ];
  return all;
}

function find_SCS_between_two_tasks( job, from_task, to_task, options )
{
  let [ last_angle, last_curvature, last_speed, last_direction, last_pathshift_tool ] = get_task_parameters( job, from_task, false );
  let [ current_angle, current_curvature, current_speed, current_direction, current_pathshift_tool ] = get_task_parameters( job, to_task, true );

  let dubins_curvature = 1 / options.min_turn_radius;
  let smooth_distance = options.smooth_distance;

  //if( last_curvature > 0 )
  {
    from_task = from_task.makeRampDown( smooth_distance / 2 );
    from_task.paint = false;
  }
  let from = from_task.end.add( from_task.get_end_vector( job ).multiply( (last_curvature > 0) ? smooth_distance : (smooth_distance / 2) ) );
  let from_angle = from_task.get_robot_end_direction( job );

  //if( current_curvature > 0 )
  {
    to_task = to_task.makeRamp( smooth_distance / 2 );
    to_task.paint = false;
  }
  let to = to_task.start.add( to_task.get_start_vector( job ).multiply( (current_curvature > 0) ? (-smooth_distance) : (-smooth_distance / 2) ) );
  let to_angle = to_task.get_robot_start_direction( job );

  let [ dubins_length, path ] = find_SCS_between_to_points( from, from_angle, to, to_angle, options.min_turn_radius, options.turn_direction );

  if( !path.length )
    return  [ Infinity, [ ] ];

  let new_path = [ ];
  if( last_curvature > 0 )
    new_path.push( from_task );
  else
  {
    let line_up_start = path[0].start.subtract( path[0].get_start_vector( job ).multiply( smooth_distance / 2 ) );
    new_path.push( new LineTask( -1, [ line_up_start, path[0].start ] ) );
  }
  new_path.pushAll( path );
  if( current_curvature > 0 )
    new_path.push( to_task );
  else
  {
    let line_down_end = path.last().end.add( path.last().get_end_vector( job ).multiply( smooth_distance / 2 ) );
    new_path.push( new LineTask( -1, [ path.last().end, line_down_end ] ) );
  }

  return [ dubins_length, new_path ];
}

function find_CSCs_between_two_tasks( job, from_task, to_task, options )
{
  // returns shortets dubins path but with ramps in both ends.

  let all = [ ];

  let [ last_angle, last_curvature, last_speed, last_direction, last_pathshift_tool ] = get_task_parameters( job, from_task, false );
  let [ current_angle, current_curvature, current_speed, current_direction, current_pathshift_tool ] = get_task_parameters( job, to_task, true );
  let smooth_distance = options.smooth_distance;
  let dubins_curvature = 1 / options.min_turn_radius;



  let ramup_task;
  if( options.force_merge_prev )
  {
    let perpendicular = Math.abs( (Math.abs( (last_angle - current_angle).normalizeAnglePlusMinus ) - Math.PI / 2) ) < 0.001;
    if( perpendicular && ((new Line( from_task.end, to_task.start )).length < 0.01) )
      ramup_task = from_task.makeRampDown( options.min_turn_radius );
    else
      ramup_task = from_task.makeRampDown( smooth_distance / 2 );
  }
  else
  {
    let ramp_start = from_task.end;
    let ramp_end = ramp_start.add( from_task.get_end_vector( job ).multiply( smooth_distance ) );
    ramup_task = new LineTask( -1, [ ramp_start, ramp_end ] );
  }

  if( last_curvature.veryclose( dubins_curvature ) )
  {
    from_task.makeRampDown( 0 );
  }

  ramup_task.paint = false;
  let from = ramup_task.end;//.add( from_task.get_end_vector(job).multiply( smooth_distance / 2 ) );
  let from_angle = ramup_task.get_robot_end_direction( job );

  let rampdown_task;
  if( options.force_merge_next )
    rampdown_task = to_task.makeRamp( smooth_distance / 2 );
  else
  {
    let task_ramp_length = to_task.get_task_action_option_value( job, "ramp_up_max_dist" );
    let task_ramp = to_task.makeRamp( task_ramp_length );
    let ramp_end = task_ramp.start;
    let ramp_start = ramp_end.subtract( to_task.get_start_vector( job ).multiply( smooth_distance ) );
    rampdown_task = new LineTask( -1, [ ramp_start, ramp_end ] );
  }


  if( current_curvature.veryclose( dubins_curvature ) )
  {
    rampdown_task = to_task.makeRamp( 0 );
  }

  rampdown_task.paint = false;
  let to = rampdown_task.start;//.add( to_task.get_start_vector(job).multiply( -smooth_distance / 2 ) );

  if( options.only_one_side )
  {
    let check = Math.sqrt( Math.pow( smooth_distance, 2 ) / 4 + Math.pow( options.min_turn_radius, 2 ) ) * 2;
    let d = (new Line( from, to )).length;
    if( check > d )
    {
      rampdown_task = rampdown_task.makeLonger( check - d + 0.01, 0 );
    }

  }

  to = rampdown_task.start;//.add( to_task.get_start_vector(job).multiply( -smooth_distance / 2 ) );
  let to_angle = rampdown_task.get_robot_start_direction( job );


  let start_turn_direction = options.turn_direction;
  let end_turn_direction = options.end_turn_direction;
  let start_direction_limit = start_turn_direction;
  if( from_task instanceof ArcTask && from_task.end_curvature > 0.125 && options.force_merge_prev ) // less than 8m radius
  {
    start_direction_limit = from_task.clockwise ? "right" : "left";
  }
  let end_direction_limit = end_turn_direction;
  if( to_task instanceof ArcTask && to_task.start_curvature > 0.125 && options.force_merge_next ) // less than 8m radius
  {
    end_direction_limit = to_task.clockwise ? "right" : "left";
  }
  if( to_task instanceof ArcTask && to_task.start_curvature < 0.125 ) // more than 8m radius
  {
    rampdown_task = to_task.makeRamp( smooth_distance + 1 );
    rampdown_task.paint = false;
    to = rampdown_task.start;
    to_angle = rampdown_task.get_robot_start_direction( job );
  }

  let make_circle_center = ( p, angle, radius, left ) => {
    let circle_guide = (new Vector( radius, 0 )).rotate( angle + (left ? (Math.PI / 2) : (-Math.PI / 2)) );
    let circle_middle = p.add( circle_guide );
    return [ circle_middle, !left ];
  };

  let from_circles = [ ];
  if( start_direction_limit === "both" || start_direction_limit === "left" )
    from_circles.push( make_circle_center( from, from_angle, options.min_turn_radius, true ) );
  if( start_direction_limit === "both" || start_direction_limit === "right" )
    from_circles.push( make_circle_center( from, from_angle, options.min_turn_radius, false ) );

  let to_circles = [ ];
  if( end_direction_limit === "both" || end_direction_limit === "left" )
    to_circles.push( make_circle_center( to, to_angle, options.min_turn_radius, true ) );
  if( end_direction_limit === "both" || end_direction_limit === "right" )
    to_circles.push( make_circle_center( to, to_angle, options.min_turn_radius, false ) );

  from_circles.forEach( ( [fcm, fclockwise] ) => {
    to_circles.forEach( ( [tcm, tclockwise] ) => {
      if( fclockwise === tclockwise )
      {
        let result = find_streight_between_two_circles( fcm, tcm, options.min_turn_radius, fclockwise, from, to );

        // add penalty for thoose who cross from_task
        if( result[1].length > 1 )
        {
          let middle_line = new Line( result[1][0].end, result[1][1].start );
          let mlcp = from_task instanceof LineTask && from_task.toLine().cross_with_line( middle_line, true );
          let cross_line = new Line( result[1][0].end, result[1][1].end );
          let crcp = from_task instanceof LineTask && from_task.toLine().cross_with_line( cross_line, true );
          if( from_task instanceof LineTask && mlcp && mlcp.dist_to_point( result[1][0].end ) > 0.01 && mlcp.dist_to_point( result[1][1].start ) > 0.01 )
            result[0] += 4;
          if( from_task instanceof LineTask && crcp && crcp.dist_to_point( result[1][0].end ) > 0.01 && crcp.dist_to_point( result[1][1].end ) > 0.01 )
            result[0] += 4;
        }

        result[1].unshift( ramup_task );
        result[1].push( rampdown_task );
        all.push( result );
      }
      else
      {
        let result = find_streight_cross_between_two_circles( fcm, tcm, options.min_turn_radius, fclockwise, from, to );
        result[1].unshift( ramup_task );
        result[1].push( rampdown_task );
        all.push( result );
    }
    } );
  } );

  return all;
}

function smooth_tasks( job, tasks, smooth_distance, smooth_in = true, smooth_out = true)
{
  // will smooth tasks, 
  //return tasks;

  let new_tasks = [ ];
  let last_task = undefined;
  tasks.forEach( ( task, i ) => {
    //let next_task = tasks[i + 1];
    let dist_to_prev = Infinity;
    if( last_task )
    {
      dist_to_prev = (new Line( last_task.end, task.start )).length;
      if( false && dist_to_prev > 0.1 )
      {
        new_tasks.push( new LineTask( -1, [ last_task.end, last_task.end.add( last_task.get_end_vector( job ).multiply( 0.1 ) ) ] ) );
      }
    }

    /*if( task instanceof LineTask )
     {
     //last_task = task;
     return;
     }*/

    let this_smooth_in = true;
    let this_smooth_out = true;
    let this_distance_for_smoothing = smooth_distance;
    if( i === 0 && !smooth_in )
    {
      this_smooth_in = false;
      this_distance_for_smoothing -= smooth_distance / 2;
    }

    if( i === (tasks.length - 1) && !smooth_out )
    {
      this_smooth_out = false;
      this_distance_for_smoothing -= smooth_distance / 2;
    }

    if( !((task.length + 0.0001) >= this_distance_for_smoothing) )
    {
      this_distance_for_smoothing = task.length - 0.001;
      if( (this_smooth_in + this_smooth_out) - 2 )
        this_distance_for_smoothing *= 2;
    }

    if( true )
    {
      let new_middle = task.copy();//.makeLonger( -smooth_distance / 2, -smooth_distance / 2 );

      let before_bezier, after_bezier;
      let before_bezier_lines, after_bezier_lines;
      if( this_smooth_in )
      {
        new_middle.makeLonger( -this_distance_for_smoothing / 2, 0 );
        let before_bezier_start_guide = (new Vector( -this_distance_for_smoothing / 2, 0 )).rotate( task.get_robot_start_direction( job ) );
        let before_bezier_start = task.start.add( before_bezier_start_guide );
        let bz = BezierCurve.From2pointsAndCurvature( before_bezier_start, 0, 0, task.get_robot_start_direction( job ), new_middle.start, task.start_curvature, task.clockwise, new_middle.get_robot_start_direction( job ), smooth_distance );
        before_bezier = bz.toBezierTask( -1 );
        before_bezier_lines = new LineTask( -100, bz.cp );
      }
      if( this_smooth_out )
      {
        new_middle.makeLonger( 0, -this_distance_for_smoothing / 2 );
        let after_bezier_end_guide = (new Vector( this_distance_for_smoothing / 2, 0 )).rotate( task.get_robot_end_direction( job ) );
        let after_bezier_end = task.end.add( after_bezier_end_guide );
        let bz = BezierCurve.From2pointsAndCurvature( new_middle.end, task.start_curvature, task.clockwise, new_middle.get_robot_end_direction( job ), after_bezier_end, 0, 0, task.get_robot_end_direction( job ), smooth_distance );
        after_bezier = bz.toBezierTask( -1 );
        after_bezier_lines = new LineTask( -100, bz.cp );
      }

      if( this_smooth_in && this_smooth_out )
      {
        if( new_middle.length <= 0.02 && this_distance_for_smoothing < 0.3 )
        {
          let first_points = before_bezier.ends.slice( 0, 2 );
          let last_points = after_bezier.ends.slice( 2, 4 );
          let middle = (new Line( before_bezier.ends[3], after_bezier.ends[0] )).middle;
          let all_points = [ ...first_points, middle, ...last_points ];
          new_bezier = new CubicBezierTask( -1, all_points );
          //new_tasks.push( new_bezier );
          //this_smooth_in = false;
          this_smooth_out = false;
          before_bezier = new_bezier;
        }
      }

      if( dist_to_prev < this_distance_for_smoothing )
      {
        let last_bezier = new_tasks.pop();
        //let middle_point = new Line( last_bezier.ends.last(), before_bezier.ends[0] ).middle;
        //let longer_bezier = [ ...(last_bezier.ends.slice( 0, 2 )),middle_point, ...(before_bezier.ends.splice( 2 )) ];
        //before_bezier = new CubicBezierTask( -1, longer_bezier );

        let new_bezier_start = last_bezier.ends[0];
        let new_bezier_start_direction = (new Line( last_bezier.ends[0], last_bezier.ends[1] )).angle;
        let new_bezier_end = before_bezier.ends.last();
        let new_bezier_end_direction = (new Line( before_bezier.ends.last( -1 ), before_bezier.ends.last() )).angle;

        let bz = BezierCurve.From2pointsAndCurvature(
          new_bezier_start,
          last_task.start_curvature,
          last_task.clockwise,
          new_bezier_start_direction,
          new_bezier_end,
          task.end_curvature,
          task.clockwise,
          new_bezier_end_direction,
          smooth_distance );
        before_bezier = bz.toBezierTask( -1 );


      }

      if( this_smooth_in )
      {
        new_tasks.push( before_bezier );
        //new_tasks.push( before_bezier_lines );
      }
      if( new_middle.length > 0.02 )
        new_tasks.push( new_middle.makeLonger( -0.01 * this_smooth_in, -0.01 * this_smooth_out ) );
      if( this_smooth_out )
      {
        new_tasks.push( after_bezier );
        //new_tasks.push( after_bezier_lines );
      }
    }
    else
      new_tasks.push( task );

    last_task = task;
    //last_task = new_tasks.last();
  } );
  return new_tasks;

}

function find_CCC_two_circles( c1, c2, radius, clockwise, up, start, end )
{
  var direct = new Line( c1, c2 );
  if( direct.length > (radius * 3) )
    return [ Infinity, [ ] ];
  var t = (direct.length / 2) / (radius * 2);
  if( t > 1 )
    return [ Infinity, [ ] ];

  var theta = math.acos( t );
  var o = math.sin( theta ) * radius * 2;

  var g1 = direct.unit_vector;
  var g2 = direct.unit_vector.rotate_180();
  if( up )
  {
    g1 = g1.rotate( theta );
    g2 = g2.rotate( -theta );
  }
  else
  {
    g1 = g1.rotate( -theta );
    g2 = g2.rotate( theta );
  }

  var p1 = c1.add( g1.multiply( radius ) );
  var p2 = c2.add( g2.multiply( radius ) );

  var c3 = p1.add( g1.multiply( radius ) );

  var arc1 = Arc.From2PointsAndCenter( start, p1, c1, clockwise ).toArcTask( -1, null, false, false );
  var arc2 = Arc.From2PointsAndCenter( p1, p2, c3, !clockwise ).toArcTask( -1, null, false, false );
  var arc3 = Arc.From2PointsAndCenter( p2, end, c2, clockwise ).toArcTask( -1, null, false, false );

  var total_length = arc1.length + arc2.length + arc3.length;
  return [ total_length, [ arc1, arc2, arc3 ] ];

}

function find_streight_cross_between_two_circles( c1, c2, radius, clockwise, start, end )
{
  var direct = new Line( c1, c2 );
  var middle = direct.middle;
  var t = radius / (direct.length / 2);
  if( t > 1 )
  {
    return [ Infinity, [ ] ];
  }

  var theta = math.asin( t );
  var length = math.cos( theta ) * direct.length / 2;
  if( clockwise )
    theta *= -1;
  var a_vec = direct.unit_vector.multiply( length ).rotate( theta );


  var streight = new Line( middle.subtract( a_vec ), middle.add( a_vec ) );
  var arc1 = Arc.From2PointsAndCenter( start, streight.start, c1, clockwise ).toArcTask( -1, null, false, false );
  var arc2 = Arc.From2PointsAndCenter( streight.end, end, c2, !clockwise ).toArcTask( -1, null, false, false );
  var total_length = arc1.length + streight.length + arc2.length;

  let tasks = [ ];
  if( arc1.length )
    tasks.push( arc1 );
  if( arc2.length )
    tasks.push( arc2 );

  return [ total_length, tasks ];
}

function find_streight_between_two_circles( c1, c2, radius, clockwise, start, end )
{
  var direct = new Line( c1, c2 );

  var move_vec = clockwise ? (new Vector( radius, 0 )).rotate( direct.angle + Math.PI / 2 ) : (new Vector( radius, 0 )).rotate( direct.angle - Math.PI / 2 );
  var streight = direct.move( move_vec );

  var arc1 = Arc.From2PointsAndCenter( start, streight.start, c1, clockwise ).toArcTask( -1, null, false, false );
  var arc2 = Arc.From2PointsAndCenter( streight.end, end, c2, clockwise ).toArcTask( -1, null, false, false );

  var total_length = arc1.length + streight.length + arc2.length;

  //return [ total_length, new LineTask( -1, [ start, streight.start ], false, true ), new LineTask( -1, [ streight.end, end ], false, true ) ];

  let tasks = [ ];
  if( arc1.length )
    tasks.push( arc1 );
  if( arc2.length )
    tasks.push( arc2 );

  return [ total_length, tasks ];
}

function find_CS_between_circle_waypoint( start_angle, radius, clockwise, start, end )
{
  let start_vec = (new Vector( radius, 0 )).rotate( start_angle );
  let side_ved = start_vec.rotate( (clockwise ? -1 : 1) * Math.PI / 2 );
  let c = start.add( side_ved );
  if( (new Line( c, end )).length < radius )
    return [ Infinity, [ ] ];
  let direct = (new Line( c, end ));
  let h = direct.length;
  let dg = direct.unit_vector.multiply( radius );
  let a = radius;

  let v = Math.acos( a / h );
  let side_pos_guide = dg.rotate( v * (clockwise ? 1 : -1) );
  let side_pos = c.add( side_pos_guide );

  let arc = Arc.From2PointsAndCenter( start, side_pos, c, clockwise ).toArcTask( -1, null, false, false );
  let streight = new Line( side_pos, end );
  let total_length = arc.length + streight.length;

  if( arc.length )
    return [ total_length, [ arc ], streight.angle ];
  else
    return [ total_length, [ ], streight.angle ];
}

function find_SCS_between_to_points( from, from_angle, to, to_angle, min_radius, limit_turn_direction, different_radius_attemt = false)
{
  let from_guide = (new Vector( 1, 0 )).rotate( from_angle );
  let l1 = new Line( from, from.add( from_guide ) );
  let to_guide = (new Vector( 1, 0 )).rotate( to_angle );
  let l2 = new Line( to, to.add( to_guide ) );

  let angle_diff = (from_angle - to_angle).normalizeAnglePlusMinus;
  let angle_diff_pos = (from_angle - to_angle).normalizeAngle;



  if( Math.abs( angle_diff ).veryclose( 0 ) || angle_diff_pos.veryclose( Math.PI ) )
  {
    return [ Infinity, [ ] ];
  }
  else
  {
    let cross = l1.cross_with_line( l2 );
    let clockwise = true;
    let oposit_way = -1;
    if( angle_diff > 0 )
    {
      clockwise = false;
      oposit_way = 1;
    }

    if( clockwise && limit_turn_direction === "left" )
      return  [ Infinity, [ ] ];
    if( !clockwise && limit_turn_direction === "right" )
      return  [ Infinity, [ ] ];

    let cross_guide1 = cross.add( from_guide );
    let cross_guide2 = cross.add( to_guide.multiply( -1 ) );
    let middle_guide_point = (new Line( cross_guide1, cross_guide2 )).middle;

    let a = (from_angle - (to_angle + Math.PI)).normalizeAnglePlusMinus;
    let h = min_radius / Math.sin( Math.abs( a / 2 ) );
    let middle_guide = (new Line( cross, middle_guide_point )).unit_vector.multiply( h );

    let circle_center = cross.add( middle_guide );

    let start = circle_center.add( l1.unit_vector.rotate_90_cw().multiply( min_radius * oposit_way ) );
    let end = circle_center.add( l2.unit_vector.rotate_90_cw().multiply( min_radius * oposit_way ) );

    let arc = Arc.From2PointsAndCenter( start, end, circle_center, clockwise ).toArcTask( -1, null, false, false );

    let before = new Line( from, start );
    let after = new Line( end, to );

    if( !(before.angle - from_angle).normalizeAnglePlusMinus.veryclose( 0 ) )
    {
      if( !different_radius_attemt )
      {
        let try_radius = Math.max( (new Line( from, cross )).length, (new Line( to, cross )).length ) + 0.01;
        return find_SCS_between_to_points( from, from_angle, to, to_angle, try_radius, limit_turn_direction, true );
      }
      else
        return  [ Infinity, [ ] ];
    }
    if( !(after.angle - to_angle).normalizeAnglePlusMinus.veryclose( 0 ) )
    {
      if( !different_radius_attemt )
      {
        let try_radius = Math.max( (new Line( from, cross )).length, (new Line( to, cross )).length ) + 0.01;
        return find_SCS_between_to_points( from, from_angle, to, to_angle, try_radius, limit_turn_direction, true );
      }
      else
        return  [ Infinity, [ ] ];
    }

    let total_length = before.length + arc.length + after.length;

    return [ total_length, [ arc ] ];

}



}

