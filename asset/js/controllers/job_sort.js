/* This only work on line tasks that only has 2 ends.  */
function reduce_jobs( tasks, taskTypes = [] )
{
  var last_job = null;
  var last_g = new Vector( -100, -100 );
  var last_reverse = false;
  var last_paint = false;

  const reduce_lines = taskTypes.indexOf("line") != -1;
  const reduce_waypoints = taskTypes.indexOf("way") != -1;

  for( var i = 0; i < tasks.length; i++ )
  {
    if (!canSafelyReduce(tasks[i], last_job)) {
      last_job = tasks[i];
      last_g = new Vector( -100, -100 );
    }

    else if( tasks[i].type === "line" && tasks[i].ends.length === 2 && reduce_lines )
    {
      var g = new Line( tasks[i].ends[0], tasks[i].ends[1] ).unit_vector;

      //var g = vec_sub( jobs[i].ends[0], jobs[i].ends[1] );
      //g = vec_div( g, vec_len( g ) );
      var diff = g.subtract( last_g ).length;
      //var diff = vec_len( vec_sub( g, last_g ) );
      var start_to_end = !!last_job ? new Line( last_job.end, tasks[i].start ).length : 100;

      if(
        last_job &&
        last_job.type === "line" &&
        last_reverse === tasks[i].reverse &&
        last_paint === tasks[i].paint &&
        diff < 0.01 &&
        start_to_end < 0.01 &&
        tasks[i].get_task_action_option_value( "dashed_space" ).veryclose( 0 ) &&
        tasks[i].get_task_option_value( "dashed_space" ).veryclose( 0 ) &&
        last_job.get_task_action_option_value( "dashed_space" ).veryclose( 0 ) &&
        last_job.get_task_option_value( "dashed_space" ).veryclose( 0 ) &&
        tasks[i].ends.length === 2
        )
      {
        last_job.ends[1] = tasks[i].ends[1];
        tasks.splice( i--, 1 );
      }
      else
      {
        last_g = g;
        last_job = tasks[i];
      }
      last_reverse = tasks[i].reverse;
      last_paint = tasks[i].paint;
    }
    else if( tasks[i].type === "way" && reduce_waypoints )
    {
      if( i === 0 )
      {
        last_job = tasks[i];
        last_reverse = tasks[i].reverse;
        last_paint = tasks[i].paint;
        continue;
      }

      if(
        last_job &&
        //last_job.type === "way" &&
        last_reverse === tasks[i].reverse &&
        !tasks[i].isVisible
        )
      {

        let next_g = (new Line( tasks[i - 1].start, tasks[i].start )).unit_vector;
        if( next_g.length.veryclose( 0 ) && i+1 < tasks.length && tasks[i + 1].type === "way" )
        {
          tasks.splice( i--, 1 );
          continue;
        }
        let g = (new Line( last_job.start, tasks[i].start )).unit_vector;
        var diff = next_g.subtract( g ).length;

        if( diff < 0.01 || diff.veryclose( 2 ) )
        {
          tasks.splice( i--, 1 );
          continue;
        }
        else
        {

        }

      }
      else
      {
        last_job = tasks[i];
        last_g = new Vector( -100, -100 );
      }
      last_reverse = tasks[i].reverse;
      last_paint = tasks[i].paint;
    }
    else
    {
      last_job = tasks[i];
      last_g = new Vector( -100, -100 );
    }
  }
  return tasks;
  
  function canSafelyReduce(currentTask, lastTask) {    
    if (!lastTask) {
      return true;
    }
    const currentTaskOptions = currentTask.task_options.sort_objects("key");
    const lastTaskOptions = lastTask.task_options.sort_objects("key");
    if (!(currentTaskOptions).equal(lastTaskOptions)) {
      return false;
    }
    return true;
  }
}

function remove_unwanted( jobs )
{
  /*for ( var i = 0; i < jobs.length; i++ ) {
   if ( jobs[i].type === "arc3" ) {
   var start_vec = vec_sub( jobs[i].ends[0], jobs[i].center );
   var r = vec_len( start_vec );
   if ( r < 0.9 ) {
   jobs.splice( i, 1 );
   i -= 1;
   }
   }
   }*/
  return jobs;
}

function to_lengths( jobs )
{
  return jobs.map( function( job )
  {
    return vec_len( vec_sub( job.ends[0], job.ends[1] ) );
  } );
}

function calc_time( jobs, speed )
{
  var time = 0;
  var last_pos = robot_controller.chosen_robot_position.toArray();
  //var last_pos = null;
  var exp_jobs = jobs;

  for( var i = 0; i < exp_jobs.length; i++ )
  {
    if( exp_jobs[i].type === "line" )
    {
      for( var n = 0; n < 2; n++ )
      {
        if( last_pos )
        {
          var l = vec_len( vec_sub( last_pos, exp_jobs[i].ends[n] ) );
          var t = l / speed;
          time += t;
        }
        last_pos = exp_jobs[i].ends[n];
      }
    }
    else if( exp_jobs[i].type === "arc3" )
    {
      for( var n = 0; n < exp_jobs[i].ends.length; n += (exp_jobs[i].ends.length - 1) )
      {
        if( last_pos )
        {
          var l = vec_len( vec_sub( last_pos, exp_jobs[i].ends[n] ) );
          var t = l / speed;
          time += t;
        }
        last_pos = exp_jobs[i].ends[n];
      }
    }
    else if( exp_jobs[i].type === "spray" )
    {
      if( last_pos )
      {
        var l = vec_len( vec_sub( last_pos, exp_jobs[i].ends[0] ) );
        var t = l / speed;
        time += t;
      }
      last_pos = exp_jobs[i].ends[n];
    }

  }

  time += jobs.length * 2; // add 2 seconds for each jobs to ramp up/down

  return time;
}

function angle_equal( a1, a2 )
{
  var v1 = new Vector( 1, 0 );
  var v2 = new Vector( 1, 0 ).rotate( a2 - a1 );
  var v = v1.subtract( v2 );
  return v.length;
}
var five_degrees_equal = angle_equal( 0, Math.PI / 180 * 5 );

function norm_angle( angle )
{
  if( angle < 0 )
  {
    angle += Math.PI * 2;
  }
  return angle;
}
function track_length( tasks, include_between )
{
  var total_length = 0;
  var last_task = false;
  tasks.forEach( function( task )
  {
    if( last_task && include_between )
    {
      total_length += new Line( last_task.ends.last(), task.ends[0] ).length + 1;
    }
    total_length += task.length + 1;
    last_task = task;
  } );
  return total_length;
}

function est_time( job )
{
  var paint_length = job.length;
  var total_length = track_length( job.tasks, true );
  var between_length = total_length - paint_length;
  var s = (paint_length * 1 + between_length * 0.5);
  return s;
}

function split_job( job, n_robots )
{
  var total_driven_length = track_length( job.tasks, true );
  var each_length = total_driven_length / n_robots;

  var robots_tasks = [ ];
  var tasks_from = 0;
  for( var r = 0; r < n_robots - 1; r++ )
  {
    var tasks_to = 1;
    while( track_length( job.tasks.slice( tasks_from, tasks_to ), true ) < each_length )
    {
      tasks_to++;
      if( tasks_to > job.tasks.length )
        break;
    }
    robots_tasks.push( job.tasks.slice( tasks_from, tasks_to ) );
    tasks_from = tasks_to + 1;
  }
  robots_tasks.push( job.tasks.slice( tasks_from ) );
  return robots_tasks;

}

var genetic_sort = {
  shortest_possible: function( jobs )
  {
    var fitness = 0;
    jobs.forEach( function( job )
    {
      fitness += pos_dist( job.ends[0], job.ends[1] );
    } );
    return fitness;
  },
  get_score: function( jobs, robot_positoin )
  {
    var fitness = 0;
    jobs.forEach( function( job )
    {
      fitness += pos_dist( robot_positoin, job.ends[0] );
      fitness += pos_dist( job.ends[0], job.ends[1] );
      robot_positoin = job.ends[1];
    } );
    return fitness;
  },
  get_scores: function( candidates, robot_positoin )
  {
    var scores = [ ];
    candidates.forEach( function( jobs )
    {
      scores.push( genetic_sort.get_score( jobs, robot_positoin ) );
    } );
    return scores;
  },
  flip_one_random: function( jobs )
  {
    var new_jobs = jobs.copy();
    var i1 = Math.floor( Math.random( ) * jobs.length );
    var i2 = Math.floor( Math.random( ) * jobs.length );
    var tmp = new_jobs[i1];
    new_jobs[i1] = new_jobs[i2];
    new_jobs[i2] = tmp;
    return new_jobs;
  },
  flip_direction: function( jobs )
  {
    var new_jobs = jobs.copy();
    var i = Math.floor( Math.random( ) * jobs.length );
    while( jobs[i].oneway )
      i = Math.floor( Math.random( ) * jobs.length );
    if( !new_jobs[i].oneway )
    {
      var tmp = new_jobs[i].ends[0];
      new_jobs[i].ends[0] = new_jobs[i].ends[1];
      new_jobs[i].ends[1] = tmp;
    }
    return new_jobs;
  },
  mutate: function( jobs, n )
  {
    var mutations = [ ];
    for( var i = 0; i < n; i++ )
    {
      if( Math.random( ) > 0.5 )
      {
        mutations.push( genetic_sort.flip_one_random( jobs ) );
      }
      else
      {
        mutations.push( genetic_sort.flip_direction( jobs ) );
      }
    }
    return mutations;
  },
  conatins: function( jobs, job )
  {
    for( var i = 0; i < jobs.length; i++ )
    {
      if( jobs[i] && jobs[i].id === job.id )
        return true;
    }
    return false;
  },
  crossover: function( jobs1, jobs2 )
  {
    var child = [ ];
    var startPos = Math.floor( Math.random( ) * jobs1.length );
    var endPos = Math.floor( Math.random( ) * jobs1.length );
    // Loop and add the sub tour from parent1 to our child
    for( var i = 0; i < jobs1.length; i++ )
    {
      // If our start position is less than the end position
      if( startPos < endPos && i > startPos && i < endPos )
      {
        child[i] = jobs1[i];
      } // If our start position is larger
      else if( startPos > endPos )
      {
        if( !(i < startPos && i > endPos) )
        {
          child[i] = jobs1[i];
        }
      }
    }

    // Loop through parent2's city tour
    for( var i = 0; i < jobs2.length; i++ )
    {
      // If child doesn't have the city add it
      if( !genetic_sort.conatins( child, jobs2[i] ) )
      {
        // Loop to find a spare position in the child's tour
        for( var ii = 0; ii < jobs1.length; ii++ )
        {
          // Spare position found, add city
          if( !child[ii] )
          {
            child[ii] = jobs2[i];
            break;
          }
        }
      }
    }
    return child;
  },
  get_best: function( candidates, robot_position, n )
  {
    var scores = genetic_sort.get_scores( candidates, robot_position );
    var best = 0;
    var next_best = 0;
    for( var i = 1; i < scores.length; i++ )
    {
      if( scores[best] > scores[i] )
      {
        next_best = best;
        best = i;
      }
    }
    return [ [ candidates[best], scores[best] ], [ candidates[next_best], scores[next_best] ] ];
  }

};
var global_save_order = "";
var global_save_reverse = "";
var job_sort = {
  clean: function( jobs )
  {

  },
  sort: function( jobs )
  {

    jobs = jobs.filter( function( job )
    {
      return job.type === "line" || job.type === "arc3" || job.type === "way" || job.type === "spray";
    } );
    console.log( jobs.length );
    jobs = jobs.map( function( job, i )
    {
      job.id = i;
      job.reverse = false;
      return job;
    } );
    var result = job_sort.easy_sort( jobs );
    var new_jobs_list = result[0];
    return [ new_jobs_list, result[1] ];
  },
  get_cloests_job: function( jobs )
  {
    var rp = robot_controller.chosen_robot_position.toArray();
    var smallest_dist = Infinity;
    var smallest_index = -1;
    jobs.forEach( function( job, i )
    {
      var dist = Math.sqrt( Math.pow( job.ends[0][0] - rp[0], 2 ) + Math.pow( job.ends[0][1] - rp[1], 2 ) );
      if( smallest_dist > dist )
      {
        smallest_dist = dist;
        smallest_index = i;
      }
    } );
    return smallest_index;
  },
  rearrange_jobs( jobs, start_index )
  {
    var new_jobs = [ ];
    for( var i = 0; i < jobs.length; i++ )
    {
      var new_i = (start_index + i) % jobs.length;
      new_jobs.push( jobs[new_i] );
    }
    return new_jobs;
  },
  easy_sort: function( jobs )
  {
    var smallest_index = job_sort.get_cloests_job( jobs );
    return [ job_sort.rearrange_jobs( jobs, smallest_index ), smallest_index ];
  },
  sort_genetic: function( jobs )
  {
    console.log( "genetic sort" );
    var robot_position = robot_controller.chosen_robot_position.toArray();
    var fitness = genetic_sort.get_score( jobs, robot_position );
    var minimum = genetic_sort.shortest_possible( jobs );
    console.log( minimum );
    var best = jobs;
    var old_best = jobs;
    var best_score = fitness;
    for( var i = 0; i < 1000; i++ )
    {
      //while ( best_score > 86 ) {
      var candidates = genetic_sort.mutate( best, 49 );
      candidates.push( old_best );
      var result = genetic_sort.get_best( candidates, robot_position, 2 );
      old_best = result[0][0];
      best = genetic_sort.crossover( result[0][0], result[1][0] );
      if( result[0][1] < best_score )
        console.log( result[0][1] );
      best_score = result[0][1];
    }
    console.log( "best_score", best_score );
    var list = best.map( function( job )
    {
      return job.id;
    } );
    console.log( list );
    return best;
  },
  sort_greedy: function( jobs )
  {
    console.log( "greedy search" );
    var robot_position = robot_controller.chosen_robot_position.toArray();
    var number_of_jobs = jobs.length;
    var extra_jobs = [ ];
    jobs.forEach( function( job )
    {
      if( !job.oneway )
      {
        var new_job = job.copy();
        var tmp = new_job.ends[0];
        switch( job.type )
        {
          case "line":
            new_job.ends[0] = new_job.ends[1];
            new_job.ends[1] = tmp;
            break;
          case "arc3":
            new_job.ends[0] = new_job.ends[2];
            new_job.ends[2] = tmp;
            break;
        }
        extra_jobs.push( new_job );
      }
    } );
    jobs = jobs.concat( extra_jobs );
    var frontier = [ ];
    jobs.forEach( function( job )
    {
      var node = Sort_Node( 0, job, [ ], jobs, robot_position );
      frontier.push( node );
    } );
    frontier.sort( sort_frontier );
    var node;
    while( frontier.length )
    {
      if( frontier.length === 0 )
        break;
      node = frontier[0];
      frontier = [ ];
      jobs.forEach( function( job )
      {
        var found = false;
        node.prev.forEach( function( p_state, i )
        {
          if( p_state.id === job.id )
            found = true;
        } );
        if( !found )
        {
          var new_node = Sort_Node( node.g, job, node.prev, jobs, node.robot_position );
          frontier.push( new_node );
          frontier.sort( sort_frontier );
        }

      } );
    }
    console.log( node );
    return node.prev;
  },
  sort_breath_first: function( jobs )
  {

    var robot_position = robot_controller.chosen_robot_position.toArray();
    jobs = jobs.map( function( job, i )
    {
      job.id = i;
      return job;
    } );
    var number_of_jobs = jobs.length;
    // add reversed version of all. ? but where and how
    var extra_jobs = [ ];
    jobs.forEach( function( job )
    {
      if( !job.oneway )
      {
        var new_job = job.copy();
        var tmp = new_job.ends[0];
        new_job.reverse = true;
        switch( job.type )
        {
          case "line":
            new_job.ends[0] = new_job.ends[1];
            new_job.ends[1] = tmp;
            break;
          case "arc3":
            if( new_job.ends.length === 2 )
            {
              new_job.ends[0] = new_job.ends[1];
              new_job.ends[1] = tmp;
            }
            else
            { // new_job.ends.length === 3
              new_job.ends[0] = new_job.ends[2];
              new_job.ends[2] = tmp;
            }
            break;
        }
        extra_jobs.push( new_job );
      }
    } );
    jobs = jobs.concat( extra_jobs );
    var frontier = [ ];
    var explored = [ ];
    jobs.forEach( function( job )
    {
      var node = Sort_Node( 0, job, [ ], jobs, robot_position );
      frontier.push( node );
    } );
    frontier.sort( sort_frontier );
    //console.log( frontier.length );

    var first_node = frontier[0];
    frontier = [ first_node ];
    var success_node;
    var node;
    var length_jobs = 0;
    while( frontier.length )
    {
      if( frontier.length === 0 )
      {
        break;
      }
      node = frontier[0];
      frontier.splice( 0, 1 );
      explored.push( node );
      /*jobs.forEach( function ( job, i ) {
       if ( sort_state_same( node.state, job ) )
       jobs.splice( i, 1 );
       } );*/

      console.log( frontier.length, jobs.length, length_jobs );
      if( node.prev.length > length_jobs )
      {
        length_jobs = node.prev.length;
        console.log( "new record: " + length_jobs );
      }

      if( node.prev.length === number_of_jobs )
      {
        success_node = node;
        break;
      }

      //frontier = [];
      // add neighboors
      jobs.forEach( function( job )
      {
        var found = false;
        if( sort_state_same( node.state, job ) )
          found = true;
        /*explored.forEach( function ( e_node ) {
         if ( sort_state_same( e_node.state, job ) )
         found = true;
         } );*/

        /*var twise = false;
         var new_node = Sort_Node( node.g, job, node.prev, jobs, node.robot_position );
         for ( var i = 0; i < frontier.length; i++ ) {
         var f_node = frontier[i];
         if ( sort_state_same( f_node.state, job ) ) {
         if ( f_node.g > new_node.g ) {
         console.log( "replacing" );
         frontier[i] = new_node;
         i = 0;
         if ( twise )
         console.log( "twise" );
         twise = true;
         }
         found = true;
         }
         }
         frontier.sort( sort_frontier );*/

        node.prev.forEach( function( prev_state )
        {
          if( job.id === prev_state.id )
          {
            found = true;
          }
        } );
        if( !found )
        {
          var new_node = Sort_Node( node.g, job, node.prev, jobs, node.robot_position );
          frontier.push( new_node );
          frontier.sort( sort_frontier );
        }

      } );
    }
    console.log( node );
    console.log( success_node );
    return success_node.prev;
  }

};
function sort_state_same( a, b )
{
  if( a.id === b.id )
    return true;
  return false;
}
function sort_frontier( a, b )
{
  return a.f - b.f;
}
function pos_dist( pos1, pos2 )
{
  return Math.sqrt( Math.pow( pos1[0] - pos2[0], 2 ) + Math.pow( pos1[1] - pos2[1], 2 ) );
}
function Sort_Node( parent_g, state, previous_states, all_jobs, robot_position )
{

  var node = {};
  node.waste = pos_dist( robot_position, state.ends[0] );
  node.g = parent_g + node.waste;
  switch( state.type )
  {
    case "line":
      node.g += pos_dist( state.ends[0], state.ends[1] );
      node.robot_position = state.ends[1];
      break;
    case "arc3":
      if( state.ends.length === 3 )
      {
        node.g += pos_dist( state.ends[0], state.ends[2] );
        node.robot_position = state.ends[2];
      }
      else
      {
        node.robot_position = state.ends[0];
      }
      break;
  }

  node.h = 0;
  all_jobs.forEach( function( job )
  {
    if( job.id !== state.id )
    {
      var found = false;
      previous_states.forEach( function( state )
      {
        if( job.id === state.id )
        {
          found = true;
        }
      } );
      if( !found )
      {
        var extra_dist = 0;
        switch( job.type )
        {
          case "line":
            extra_dist += pos_dist( job.ends[0], job.ends[1] );
            break;
          case "arc3":
            if( job.ends.length === 2 )
            {
              extra_dist += pos_dist( job.ends[0], job.ends[1] );
            }
            else
            { // new_job.ends.length === 3
              extra_dist += pos_dist( job.ends[0], job.ends[2] );
            }
            break;
        }
        if( !job.oneway )
          extra_dist /= 2;
        node.h += extra_dist;
      }
    }
  } );
  //node.h *= 10;

  node.state = state;
  node.prev = previous_states.concat( [ state ] );
  node.f = node.g + node.h;
  return node;
}
