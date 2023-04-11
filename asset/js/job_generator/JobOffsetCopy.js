class JobOffsetCopy
{
  /**
   * 
   * @param {Job} job The job to offset
   * @param {Number} offset Offset in meter
   */
  constructor(job, offset)
  {
    this.job = job.copy(true);
    this.offset = offset.copy();
  }

  isLineType( task )
  {
    switch( task.type )
    {
      case "line":
      case "spline":
        return true;
        break;
      default:
        return false;
    }
  }

  isCircleType( task )
  {
    switch( task.type )
    {
      case "arc3":
        return true;
        break;
      default:
        return false;
    }
  }

  offsetCircle(task)
  {
    task.ends = task.ends.map( ( end ) => {
      return end.subtract( task.center ).extend( this.offset * (task.clockwise ? 1 : -1) ).add( task.center );
    } );
  }

  /**
   * Offset Line
   * @param {LineTask} task 
   */
  offsetLine(task)
  {
    if( task.type === "spline" && task.max_control_point_angle > Math.PI / 2 )
    {
      /*
       * If spline has a sharp angle (>90deg) then sample the spline
       * and save it as a linetask
       */
      console.warn( "Converting spline to linetask (has >90deg bend)" );

      var lines = task.sample( 0.01, true );
      var e = [ ];
      lines.forEach( ( line ) => {
        e.push( line.start );
      } );
      e.push( lines[lines.length - 1].end );
      task = new LineTask( task.id, e, task.reverse, task.paint );
    }

    var oe = task.ends; // Original ends

    task.ends = [ ];
    var l = [ ];
    for( var i = 0; i < oe.length - 1; i++ )
    {
      l.push( new Line( oe[i], oe[i + 1] ).offset( this.offset ) );
    }

    task.ends.push( l[0].start );
    for( var i = 0; i < l.length - 1; i++ )
    {
      if( l[i].as_vector.cross( l[i + 1].as_vector ).veryclose( 0 ) )
      {
        task.ends.push( l[i].end );
      }
      else
      {
        let res = l[i].cross_with_line( l[i + 1] );
        if( !!res )
          task.ends.push( res );
        else
          task.ends.push( l[i].end );
      }
    }
    task.ends.push( l.last().end );

    // Mend broken corners within task
    if( oe[0].veryclose( oe.last() ) )
    {
      let p;
      if( l[0].parallelWith( l.last() ) )
      {
        p = l[0].end;
      }
      else
      {
        let res = l[0].cross_with_line( l[l.length - 1] );
        if( !!res )
          p = res;
        else
          p = l[0].end;
      }
      task.start = p;
      task.end = p;
    }
  }

  offsetTask(original_tasks)
  {
    return original_tasks.copy().map( ( task ) => {
      if( this.isCircleType( task ) )
      {
        this.offsetCircle(task);
      }
      else if( this.isLineType( task ) )
      {
        this.offsetLine(task);
      }
      return task;
    } );
  }

  detectLoops(tasks)
  {
    const lri = [ ]; // loop remove index
    if( tasks.length > 2 )
    {
      for( let i = 1; i < tasks.length - 1; i++ )
      {
        if( this.isCircleType( tasks[i - 1] ) && this.isCircleType( tasks[i] ) && this.isCircleType( tasks[i + 1] ) )
        {
          // If both previus and next circle contain this circle, then this circle is redundant and forms a loop
          if( ((tasks[i - 1].center.dist_to_point( tasks[i].center ) + tasks[i].radius.length) <= tasks[i - 1].radius.length)
            && ((tasks[i + 1].center.dist_to_point( tasks[i].center ) + tasks[i].radius.length) <= tasks[i + 1].radius.length) )
            lri.push( i );
        }
      }
    }
    return lri;
  }

  mendCorners(original_tasks, offset_tasks)
  {
    if( original_tasks.length > 1 )
    {

      let add_tasks = [ ];
      let add_tasks_at_index = [ ];

      let j = 0;
      for( let i = 0; i < original_tasks.length; i++ )
      {
        // If this is the last task then the next task is the first task
        j = ((i + 1) === original_tasks.length) ? 0 : (i + 1);

        // If this is the last task and the curve is not closed, exit for-loop
        if( ((i + 1) === original_tasks.length) && !(original_tasks[i].end.veryclose( original_tasks[j].start )) )
          continue;

        // Tasks form a corner if they are "very close"
        // Tasks need mending if offset corner is not "very close"
        if( !offset_tasks[i].end.veryclose( offset_tasks[j].start ) )
        {
          if( this.isLineType( original_tasks[i] ) && this.isLineType( original_tasks[j] ) )
          {
            // If the corner is formed by to lines, extend it
            var c = extend_corner( original_tasks[i].start, original_tasks[i].end, original_tasks[j].end, this.offset );
            offset_tasks[i].end = c;
            offset_tasks[j].start = c;
          }
          else if( (this.isCircleType( original_tasks[i] ) && this.isCircleType( original_tasks[j] )) && (original_tasks[i].clockwise === original_tasks[j].clockwise) )
          {
            var A = offset_tasks[i].toArc();
            var B = offset_tasks[j].toArc();

            var p = A.crosses_with_circle( B );
            if( p )
            {
              if( p.length > 0 )
              {
                var c = p[0];
                if( p.length > 1 && p[0].dist_to_point( original_tasks[i].midpoint.add( original_tasks[i].center ) ) > p[1].dist_to_point( original_tasks[i].midpoint.add( original_tasks[i].center ) ) )
                  c = p[1];

                offset_tasks[i].end = c;
                offset_tasks[j].start = c;
              }
              else
              {
                // One circle is contained within the other
                // Draw a straight line between tasks
                add_tasks_at_index.push( i + 1 );
                add_tasks.push( new LineTask( -offset_tasks[i].id, [ offset_tasks[i].end, offset_tasks[j].start ], offset_tasks[i].reverse, offset_tasks[i].paint ) );
              }
            }
            else
            {
              // Circles are seperate
              // Draw an arc between tasks
              add_tasks_at_index.push( i + 1 );
              const new_arc1 = Arc.From2PointsAndCenter( offset_tasks[i].end, offset_tasks[j].start, original_tasks[i].end, !offset_tasks[i].clockwise );
              const new_arc2 = Arc.From2PointsAndCenter( offset_tasks[i].end, offset_tasks[j].start, original_tasks[i].end, offset_tasks[i].clockwise );
              const new_arc = new_arc1.circumference <= new_arc2.circumference ? new_arc1 : new_arc2;
              add_tasks.push( new_arc.toArcTask( -offset_tasks[i].id, undefined, offset_tasks[i].reverse, offset_tasks[i].paint ) );

            }
          }
          else if( (this.isLineType( original_tasks[i] ) && this.isCircleType( original_tasks[j] )) || (this.isCircleType( original_tasks[i] ) && this.isLineType( original_tasks[j] )) )
          {

            let A, B, p, c;
            if( this.isLineType( original_tasks[i] ) )
            {
              A = offset_tasks[j].toArc();
              B = offset_tasks[i].lastToLine();
            }
            else
            {
              A = offset_tasks[i].toArc();
              B = offset_tasks[j].toLine();
            }
            p = A.crosses_with_line( B, false );

            if( p.length > 0 )
            {
              c = p[0];
              if( p.length > 1 && (p[0].dist_to_point( original_tasks[i].end ) > p[1].dist_to_point( original_tasks[i].end )) )
                c = p[1];

              offset_tasks[i].end = c;
              offset_tasks[j].start = c;
            }
            else
            {
              // Line and Circle are seperate
              // Draw a straight line between tasks
              add_tasks_at_index.push( i + 1 );
              add_tasks.push( new LineTask( -offset_tasks[i].id, [ offset_tasks[i].end, offset_tasks[j].start ], offset_tasks[i].reverse, offset_tasks[i].paint ) );

            }
          }
          else
          {
            // Otherwise the corner is NOT extended
          }
        }
      }

      // Insert added tasks
      for( let i = add_tasks_at_index.length - 1; i >= 0; i-- )
      {
        offset_tasks.splice( add_tasks_at_index[i], 0, add_tasks[i] );
      }
    }

    return offset_tasks;
  }

  result()
  {
    this.job.options.Offset.val = this.offset;
    this.reverse = this.job.options.Reverse.val;
    this.job.options.Reverse.val = false;
    this.job.draw( true );
    let original_tasks = split_controller.merge_linetasks( this.job.tasks );

    // Offset all tasks in job
    let offset_tasks = this.offsetTask(original_tasks);

    // Loop detection
    const lri = this.detectLoops(offset_tasks);
    offset_tasks = offset_tasks.filter( ( _, i ) => lri.indexOf( i ) < 0 );
    original_tasks = original_tasks.filter( ( _, i ) => lri.indexOf( i ) < 0 );

    // Mend broken corners between tasks
    offset_tasks = this.mendCorners(original_tasks, offset_tasks);

    this.job.loaded_tasks = offset_tasks;
    this.job.tasks = split_controller.split_tasks( offset_tasks, !this.job.options.Split.val );

    this.job.options.Reverse.val = this.reverse;
    this.job.draw();

    return this.job;
  }
}