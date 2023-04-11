/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global SETTINGS, ROBOT_TOOL_DIST, robot_controller, pt */

function count_types()
{
  var jobs = map_controller.background.jobs;
  var types = {};
  jobs.forEach( function( job )
  {
    if( !types[job.template_id] )
      types[job.template_id] = 0;
    types[job.template_id] += 1;
  } );
  console.log( types );
}

function drive_around_one_post()
{
  var tasks = [ ];


  return tasks;
}

function convert_to_drive_close( task, pole, spray_to, split_dist, beginning = true, reverse_order = false)
{
  var tasks = [ ];
  if( task.length < spray_to )
    return [ ];

  
  var dist_to_pole = (beginning ? task.start : task.end).dist_to_point( pole );
  
  
  if( dist_to_pole < spray_to)
    task = task.splitMeter( (beginning ? 1 : -1) * (spray_to - dist_to_pole) )[beginning ? 1 : 0];
  
  if( task.length <= split_dist )
  {
    task.action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && task.action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", settings_screeen_controller.force_new_internal_ramp_up_length.default ) );
    tasks.push( task );
  }
  else
  {
    if(task instanceof SplineTask)
      split_dist = 3;
    
    tasks.pushAll( task.splitMeter( (beginning ? 1 : -1) * split_dist ) );

    var reverse_task = tasks[beginning ? 0 : 1];
    var streight_task = tasks[beginning ? 1 : 0];
    reverse_task.action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && reverse_task.action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    if( !beginning )
      reverse_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", settings_screeen_controller.force_new_internal_ramp_up_length.default ) );
    else
    {
      if( streight_task instanceof EllipseTask)
      {
      
        let ramp_task = reverse_task.opposite_direction;
        ramp_task.action_options = new OptionArray();
        ramp_task.task_options = new OptionArray();
        ramp_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        ramp_task.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
        ramp_task.paint = false;
        tasks.splice( 1, 0, ramp_task );

        if( beginning )
          tasks[1] = tasks[1].opposite_direction;
      }
      else
        streight_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", reverse_task.length ) );
    }
  }

  if( beginning )
  {
    tasks[0] = tasks[0].opposite_direction;
    //tasks[1] = tasks[1].opposite_direction;
  }

  if( reverse_order && tasks.length > 1 )
  {
    tasks = tasks.reverse();
    tasks = tasks.map( ( t, i ) => {
      if( i === 0 )
        return t;
      return t.opposite_direction;
    } );

    //tasks[1] = tasks[1].opposite_direction;
  }

  return tasks;
}

/* global SETTINGS, ROBOT_TOOL_DIST, settings_screeen_controller */
function drive_around_posts( options )
{
  let task_before = options.task_before; // task to first pole
  let task_after = options.task_after; // task after last pole
  let poles = options.poles;
  let pole_width = options.pole_width;
  let stop_before = options.stop_before ? options.stop_before : 2;
  let left_around = options.left_around ? options.left_around : false;
  let start_index = options.start_index ? options.start_index : 0;
  let SAFETY_DISTANCE = options.SAFETY_DISTANCE ? options.SAFETY_DISTANCE : settings_screeen_controller.safety_distance.val;
  let turn_radius = options.turn_radius ? options.turn_radius : 2;
  let minimumGoalWidth = options.minimumGoalWidth ? options.minimumGoalWidth : 3;

  if( !pole_width.length )
    pole_width = poles.map( () => pole_width );

  var reduced_poles = [ ];
  var reduced_pole_width = [ ];
  poles.forEach( ( pi, i ) => {
    if( i === 0 )
    {
      reduced_poles.push( pi );
      reduced_pole_width.push( pole_width[i] );
    }
    else
    {
      let d = (new Line( pi, reduced_poles.last() )).length;
      if( d <= (SAFETY_DISTANCE + minimumGoalWidth) )
      {
        let new_p = (new Line( pi, reduced_poles.last() )).middle;
        reduced_poles[reduced_poles.length - 1] = new_p;
        reduced_pole_width[reduced_pole_width.length - 1] += d;
      }
      else
      {
        reduced_poles.push( pi );
        reduced_pole_width.push( pole_width[i] );
      }
    }
  } );

  poles = reduced_poles;
  pole_width = reduced_pole_width;

  function fluent_job_with_tasks( tasks )
  {
    var fluent_job = new Job();
    fluent_job.tasks = tasks;
    return fluent_job;
  }

  if( !poles.length )
    return [ task_before, task_after ];



  var i = start_index;
  var tasks = [ ];

  var dist_to_pole = pole_width[0] / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR;
  tasks.pushAll( convert_to_drive_close( task_before, poles[0], dist_to_pole, stop_before, false ) );

  var last_task = tasks.pop();
  var current_pole = poles[0];
  poles.forEach( ( next_pole, i ) => {
    if( i === 0 )
      return;

    var next_direction = (new Line( current_pole, next_pole )).unit_vector;
    var middle = (new Line( current_pole, next_pole )).middle;

    var forward_stop_before_next_pole = next_pole.add( next_direction.multiply( -1 ) ); // 1 meter before the pole, where the robot is pointing at the pole

    var dist_to_pole = pole_width[i - 1] / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR;
    var close_to_current_pole = current_pole.add( next_direction.multiply( dist_to_pole ) );
    var close_to_next_pole = next_pole.add( next_direction.multiply( -dist_to_pole ) );


    var insert_drive_around_index = tasks.length;
    // make lines between posts
    var first_line_between_posts = new LineTask( 0, [ middle, close_to_current_pole ], false, true );
    //tasks.push( first_line_between_posts );
    first_line_between_posts.action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && first_line_between_posts.action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    first_line_between_posts.task_options.push( new FloatRobotAction( "ramp_up_max_dist", (new Line( forward_stop_before_next_pole, middle )).length ) );
    first_line_between_posts.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );

    var second_line_between_posts = new LineTask( 0, [ middle, close_to_next_pole ], false, true );
    second_line_between_posts.action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    second_line_between_posts.task_options.push( new BoolRobotAction( "navigate_tool", true ) );
    SETTINGS.backwards_max_speed && second_line_between_posts.action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    second_line_between_posts.task_options.push( new FloatRobotAction( "ramp_up_max_dist", (new Line( forward_stop_before_next_pole, middle )).length - 0.5 ) );
    second_line_between_posts.task_options.push( new BoolRobotAction( "coarse_line_start", true ) );




    var new_tasks = make_fluent_run( fluent_job_with_tasks(
    [ last_task, first_line_between_posts ]
      ), {min_turn_radius: turn_radius, turn_direction: (left_around ? "right" : "left"), ignoreCCC: false, add_ramp_to_next: false} );
    tasks.pushAll( new_tasks );
    
    // Makes sure that the robot doesn't make a path that goes into the goal
    second_line_between_posts.fluent_run_options.turn_direction = (!left_around ? "right" : "left");
    second_line_between_posts.fluent_run_options.only_one_side = true;

    tasks.push( second_line_between_posts );


    current_pole = next_pole;
    last_task = tasks.pop();
  } );

  // add dirve around last pole
  var dist_to_pole = pole_width.last() / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR;
  let stop_before_last_pole = (turn_radius * 2 - dist_to_pole * 2) < stop_before ? stop_before : (turn_radius * 2 - dist_to_pole * 2);
  var after_tasks = convert_to_drive_close( task_after, poles.last(), dist_to_pole, stop_before_last_pole, true );

  if( !after_tasks[0].set_task_option_value( "ramp_up_max_dist", 3 ) )
    after_tasks[0].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 3 ) );
  after_tasks[0].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
  after_tasks[0].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );

  var new_tasks = make_fluent_run( fluent_job_with_tasks( [ last_task,
    after_tasks.shift() ] ), {min_turn_radius: turn_radius, turn_direction: (left_around ? "right" : "left"), ignoreCCC: false, add_ramp_to_next: false} );
  tasks.pushAll( new_tasks );
  tasks.pushAll( after_tasks );

  tasks.forEach( ( t, i ) => {
    t.id = i + start_index;
    if( i >= 2 && i < (tasks.length - 2) )
    {
      //t.fluent_run_options.enable = false;
      if( !t.fluent_run_options.only_one_side )
        t.fluent_run_options.turn_direction = ((!left_around) ? "left" : "right");
      t.fluent_run_options.min_turn_radius = 1;
      //delete t.fluent_run_options.min_turn_radius;
      t.fluent_run_options.ignoreCCC = false;
      t.fluent_run_options.ignoreCSC = true;

    }
    if( i === 1 )
      t.fluent_run_options.turn_direction = ((left_around) ? "left" : "right");
  } );
  if(turn_radius < 1.5)
  {
    for(let i = 0; i < tasks.length; i++)
    {
      if(tasks[i].paint === false)
      {
        tasks[i].task_options.push( new FloatRobotAction( "drive_max_velocity", 0.5 ) );
      }
    }
  }

  tasks.filter(t=>t.via).forEach(t=>t.viaGoalPost = true);
  
  return tasks;
}


function drive_around_goal_posts( job, c1, p1, p2, fc1, stop_before, start_index, goalPoleWidth, left_around_goal = false, turn_radius = 1.5)
{

  let use_old_method = false;

  if( !job.options.created_with_dubins.val && job.options["taskModificationIds"].ignoreids.length )
    use_old_method = true;


  if( use_old_method )
  {
    return drive_around_goal_posts_old( c1, p1, p2, fc1, stop_before, start_index, goalPoleWidth, left_around_goal );
  }
  else
  {
    var options = {};
    options.task_before = new LineTask( start_index, [ c1, p1 ], false, true );
    options.task_after = new LineTask( start_index, [ p2, fc1 ], false, true );
    options.poles = [ p1, p2 ];
    options.pole_width = goalPoleWidth;
    options.stop_before = stop_before;
    options.left_around = left_around_goal;
    options.start_index = start_index;
    options.turn_radius = turn_radius;

    return drive_around_posts( options );
}
}

function drive_around_goal_posts_old( c1, p1, p2, fc1, stop_before, start_index, goalPoleWidth, left_around_goal = false)
{
  var i = start_index;
  var tasks = [ ];

  var SAFETY_DISTANCE = 0.2;

  var g2 = new Line( p1, p2 ).unit_vector; // along backline
  if( left_around_goal )
    var g1 = g2.rotate( Math.PI / 2 ); // along the long side
  else
    var g1 = g2.rotate( -Math.PI / 2 ); // along the long side

  var line = new Line( c1, p1 );
  if( line.length > stop_before )
  {
    var first = line.add_to_end( -stop_before );
    line.start = first.end;
    tasks.push( new LineTask( i++, [ c1, first.end ], false, true ) );
  }
  line = line.add_to_end( -(goalPoleWidth / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR) );
  tasks.push( new LineTask( i++, [ line.start, line.end ], true, true ) );
  tasks[tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
  SETTINGS.backwards_max_speed && tasks[tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", settings_screeen_controller.force_new_internal_ramp_up_length.default ) );

  /*
   // Easy way around goals
   tasks.push( new WaypointTask( tasks.length, line.start ) );
   var drive_around_goal = p1.add( g1.multiply( 2 ) );
   tasks.push( new WaypointTask( tasks.length, drive_around_goal ) );
   */

  // cubic around
  //var drive_around_goal = p1.add( g1.multiply( 5 ) );

  var along_left_of_goal = line.unit_vector;

  var qblp1 = line.end;
  var qblp2 = qblp1.add( along_left_of_goal.multiply( -2 ) );
  var qblp3 = qblp2.add( g1.multiply( 2 ) );
  var qblp4 = qblp2.add( g1.multiply( 4 ) );

  var goal_line = new Line( p1, p2 );
  var qblp7 = goal_line.start.add( g2.multiply( 3 + goalPoleWidth ) );
  var qblp5 = qblp7.add( g1.multiply( 4 ) );
  var qblp6 = qblp7.add( g1.multiply( 2 ) );
  var qblp8 = qblp7.add( g2.multiply( -2 ) );

  tasks.push( new CubicBezierTask( i++, [ qblp1, qblp2, qblp3, qblp4, qblp5, qblp6, qblp7, qblp8 ], false, false ) );

  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
  tasks[tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );






  var goal_line = new Line( p1, p2 );
  var middle = goal_line.middle;

  goal_line = goal_line.add_to_start( -(goalPoleWidth / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR) );
  goal_line = goal_line.add_to_end( -(goalPoleWidth / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR) );

  var bezier_end = tasks[tasks.length - 1].ends[tasks[tasks.length - 1].ends.length - 1];

  tasks.push( new LineTask( i++, [ middle, goal_line.end ], true, true ) );
  tasks[tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
  SETTINGS.backwards_max_speed && tasks[tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
  var ramp_length = new Line( bezier_end, middle ).length;
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", ramp_length ) );


  tasks.push( new LineTask( i++, [ middle, goal_line.start ], true, true ) );
  tasks[tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
  SETTINGS.backwards_max_speed && tasks[tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
  tasks[tasks.length - 1].task_options.push( new BoolRobotAction( "navigate_tool", true ) );
  tasks[tasks.length - 1].task_options.push( new BoolRobotAction( "pathshift_tool", false ) );
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", (new Line( middle, goal_line.start ).length) - 1 ) );

  var along_right_of_goal = new Line( p2, fc1 ).unit_vector;

  //tasks.push( new WaypointTask( tasks.length, middle ) );
  var qblp1 = goal_line.add_to_start( -0.5 ).start;
  //middle
  var drive_around_goal1 = middle.add( g1.multiply( 2 ) );
  var drive_around_goal2 = p2.add( g1.multiply( 2 ) );
  var qblp2 = p2.add( along_right_of_goal.multiply( 1 ) );
  var qblp3 = p2.add( along_right_of_goal.multiply( 2 ) );
  var qblp4 = p2.add( along_right_of_goal.multiply( 4 + (goalPoleWidth / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR) ) );

  tasks.push( new CubicBezierTask( i++, [ goal_line.start, qblp1, middle, drive_around_goal1, drive_around_goal2, qblp2, qblp3, qblp4 ], false, false ) );
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
  tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
  tasks[tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
  var last_bezier = tasks[tasks.length - 1];


  var line = new Line( fc1, p2 );
  line = line.add_to_end( -(goalPoleWidth / 2 + SAFETY_DISTANCE + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR) );
  if( line.length <= stop_before )
  {
    var bezier_end = tasks[tasks.length - 1].ends[tasks[tasks.length - 1].ends.length - 1];
    var ramp = new Line( line.start, bezier_end ).length;
    tasks.push( new LineTask( i++, [ line.start, line.end ], true, true ) );
    tasks[tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && tasks[tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    tasks[tasks.length - 1].action_options.push( new IntRobotAction( "ramp_up_max_dist", ramp ) );
  }
  else
  {
    var first = line.add_to_end( -stop_before );
    line.start = first.end;
    tasks.push( new LineTask( i++, [ line.start, line.end ], true, true ) );

    if( (new Line( p2, line.start ).length + stop_before) > new Line( p2, last_bezier.ends[last_bezier.ends.length - 1] ).length )
      tasks[tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
    else
      tasks[tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
    SETTINGS.backwards_max_speed && tasks[tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
    tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", stop_before ) );

    tasks.push( new LineTask( i++, [ first.end, first.start ], false, true ) );
    tasks[tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", stop_before ) );
  }

  tasks.forEach( ( t, i ) => {
    if( i >= 2 || i < (tasks.length - 2) )
    {
      //t.fluent_run_options.enable = false;
      t.fluent_run_options.turn_direction = (!left_around_goal ? "left" : "right");
      t.fluent_run_options.min_turn_radius = 1;
      t.fluent_run_options.ignoreCCC = false;
      t.fluent_run_options.add_ramp_to_next = false;
    }
  } );

  return tasks;
}

function align_ignore_lines( job1, job2 )
{
  let job2_ignoreids = [ ];
  job1.options.taskModificationIds.ignoreids.forEach( tid => {
    let job1_task = job1.tasks.filter( t1 => (t1.id === tid) )[0];
    if( job1_task )
    {
      let equal_task = false;
      job2.tasks.forEach( t2 => {
        if( job1_task.equals( t2 ) )
          equal_task = t2;
      } );

      if( equal_task )
        job2_ignoreids.push( equal_task.id );
    }
  } );
  return job2_ignoreids;
}

function fit_tasks_length( job )
{
  if( job.options["Cone nozzle"].val )
    return;
  console.log( "---------- fitting tasks --------" );
  var lw = Math.abs( job.options.LineWidth.val );
  var ll = Math.abs( job.options.LineLength.val );
  var extra_paint = (lw - ll) / 2;
  job.tasks.forEach( function( task, i )
  {
    if( i === 0 )
      task.paint && task.makeLonger( extra_paint, 0 );

    var original_end = task.end;
    if( i === (job.tasks.length - 1) )
    {
      task.paint && task.makeLonger( 0, extra_paint );
    }
    else
    {
      if( job.tasks.length > 1 )
      {
        var next_task = job.tasks[i + 1];
        var next_start = next_task.start;
        if( original_end.dist_to_point( next_start ) < (extra_paint * 2) )
        {
          var diff = (task.end_direction - next_task.start_direction).normalizeAngle;
          if( diff > Math.PI )
            diff -= 2 * Math.PI;
          if( diff > (5).deg2rad() )
          {
            task.paint && task.makeLonger( 0, extra_paint );
            next_task.paint && next_task.makeLonger( extra_paint, 0 );
          }
        }
        else
        {
          task.paint && task.makeLonger( 0, extra_paint );
          next_task.paint && next_task.makeLonger( extra_paint, 0 );
        }
      }

    }
    //task.makeLonger( diff, diff );
  } );
}
function fit_job_options_dashed_length( job, job_options )
{
  var ll = Math.abs( job.options.LineLength.val );

  let space_length = job.get_job_option_value( "dashed_space" );
  let line_length = job.get_job_option_value( "dashed_length" );
  let offset_length = job.get_job_option_value( "dashed_offset" );

  job_options.forEach( function( option )
  {
    if( option.key === "dashed_space" )
      space_length = option.value;
    if( option.key === "dashed_length" )
      line_length = option.value;
    if( option.key === "dashed_offset" )
      offset_length = option.value;
  } );

  if( space_length > 0 )
  {
    console.log( "Adjusting job dash option" );

    if( !job_options.set_val_of( "dashed_space", space_length + ll ) )
      job_options.push( new FloatRobotAction( "dashed_space", space_length + ll ) );
    if( !job_options.set_val_of( "dashed_length", line_length - ll ) )
      job_options.push( new FloatRobotAction( "dashed_length", line_length - ll ) );
    if( !job_options.set_val_of( "dashed_offset", offset_length + ll / 2 ) )
      job_options.push( new FloatRobotAction( "dashed_offset", offset_length + ll / 2 ) );

  }

}
function fit_tasks_dashed_length( job )
{
  var lw = Math.abs( job.options.LineWidth.val );
  var ll = Math.abs( job.options.LineLength.val );
  console.log( "---------- adjusting dash tasks --------" );

  job.tasks.forEach( function( task )
  {

    let space_langth = task.get_task_action_option_value( "dashed_space" );
    if( space_langth > 0 )
    {
      console.log( "Adjusting task dash option" );

      let line_length = task.get_task_action_option_value( "dashed_length" );
      let offset_length = task.get_task_action_option_value( "dashed_offset" );

      var adjust_offset = false;
      adjust_offset |= task.set_task_option_value( "dashed_space", space_langth + ll );
      adjust_offset |= task.set_task_action_option_value( "dashed_space", space_langth + ll );

      adjust_offset |= task.set_task_option_value( "dashed_length", line_length - ll );
      adjust_offset |= task.set_task_action_option_value( "dashed_length", line_length - ll );

      adjust_offset &= (!task.set_task_action_option_value( "dashed_offset", offset_length + ll / 2 ) && !task.set_task_option_value( "dashed_offset", offset_length + ll / 2 ));
      if( adjust_offset )
        task.action_options.push( new FloatRobotAction( "dashed_offset", offset_length + ll / 2 ) );

    }
  } );
}
function hexToRgb( hex )
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
  return result ? {
    r: parseInt( result[1], 16 ),
    g: parseInt( result[2], 16 ),
    b: parseInt( result[3], 16 )
  } : null;
}


function get_length_of_all_templates()
{
  pt.list.forEach( function( t )
  {
    var templ = new pt[t]( 1, "Tempoary_field", "free_hand" );
    templ.points = [ new Vector( 574343.6275482916, 6211631.611686742 ) ];
    templ.draw();
    console.log( t + " : " + templ.length + "m long" );
  } );
}

function printStack() {
  console.groupCollapsed( "Stack trace" );
  console.trace();
  console.groupEnd();

  if( console.print_error ) {
    let err = new Error();
    let e = err.stack;
    e = e.replace( / at /g, "  \nat " );
    window.last_err = err.stack;
    console.log( err.stack );
  }
}

function guid() {
  function s4() {
    return Math.floor( (1 + Math.random()) * 0x10000 ).toString( 16 ).substring( 1 );
  }
  return s4( ) + s4( ) + '-' + s4( ) + '-' + s4( ) + '-' + s4( ) + '-' + s4( ) + s4( ) + s4( );
}
;