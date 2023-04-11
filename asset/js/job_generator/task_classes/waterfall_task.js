
/* global Infinity */

class WaterfallTask extends Task
{
  constructor( id, ends, l, start_t, end_t, inverse, paint )
  {
    super( id, "waterfall", ends, false, paint );
    this.l = l;
    this.inverse = inverse; // paint from end to start
    this.start_t = start_t;
    this.end_t = end_t;
    this.calculated_length = 0;
  }
  get start_t()
  {
    return this._start_t;
  }
  set start_t( val )
  {
    this._start_t = val;
    delete this.calculated_length;
  }
  get end_t()
  {
    return this._end_t;
  }
  set end_t( val )
  {
    this._end_t = val;
    delete this.calculated_length;
  }
  exportTask()
  {
    const task = super.exportTask();
    task.l = this.l;
    task.inverse = this.inverse;
    task.start_t = this.start_t;
    task.end_t = this.end_t;
    return task;
  }
  static importTask(task)
  {
    return new WaterfallTask(task.id, task.ends.map(e=>e.toVector()), task.l, task.start_t, task.end_t, task.inverse, task.paint );
  }

  copy()
  {
    var newTask = new WaterfallTask( this.id, this.ends.copy(), this.l, this.start_t, this.end_t, this.inverse, this.paint );
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.calculated_length = this.calculated_length;
    //newTask.start_t = this.start_t;
    //newTask.end_t = this.end_t;
    newTask.layer = this.layer;
    newTask.label = this.label;
    newTask.via = this.via;
    newTask.force_draw_color = this.force_draw_color;
    newTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newTask;
  }
  get length()
  {
    var self = this;
    if( !this.calculated_length )
    {
      var lines = this.sample( 0.01, true );
      this.calculated_length = 0;
      lines.forEach( function( line )
      {
        self.calculated_length += line.length;
      } );
      //console.log( "Calcualted length is", this.calculated_length );
    }
    return this.calculated_length;
  }

  get_point_at_t( OC, R, l, O, t )
  {
    let OA = OC.rotate( t );
    let d = t * R + l;
    let AB = OA.rotate_90_cw().multiply( d / R );
    let B = O.add( OA ).add( AB );
    return B;
  }
  get_A( t )
  {
    var O = this.ends[0];
    var C = this.ends[1];
    var OC = C.subtract( O );
    let OA = OC.rotate( t );
    return O.add( OA );
  }
  sample( sample_length = 0.01, return_lines = false)
  {

    var lines = [ ];
    var sample_ends = [ ];
    var O = this.ends[0];
    var C = this.ends[1];
    var l = this.l;
    var OC = C.subtract( O );
    var R = OC.length;
    var step = sample_length;
    var points = [ ];
    if( !this.inverse )
    {
      for( var t = this.start_t; t <= this.end_t; t += step )
        points.push( this.get_point_at_t( OC, R, l, O, t ) );
      points.push( this.get_point_at_t( OC, R, l, O, this.end_t ) );
    }
    else
    {
      for( var t = this.end_t; t >= this.start_t; t -= step )
        points.push( this.get_point_at_t( OC, R, l, O, t ) );
      points.push( this.get_point_at_t( OC, R, l, O, this.start_t ) );
    }

    var line;
    for( var i = 1; i < points.length; i++ )
    {
      line = new Line( points[i - 1], points[i] );
      lines.push( line );

      sample_ends.push( line.start );
    }
    if( line )
      sample_ends.push( line.end );


    if( return_lines )
      return lines;

    return new LineTask( this.id, sample_ends, this.reverse, this.paint );
  }
  splitAnglePercent( procent )
  {
    var before_job = this.copy();
    var after_job = this.copy();
    var diff_angle = this.end_t - this.start_t;
    var new_angle_diff = diff_angle * procent;
    before_job.end_t = this.start_t + new_angle_diff;
    after_job.start_t = before_job.end_t;
    return [ before_job, after_job ];
  }
  splitPercent( procent )
  {

    var before_job_length = this.length * procent;
    var current_test_angle = 0.5;
    var ref_angle = 0.25;
    var j1 = this.splitAnglePercent( current_test_angle );
    while( Math.abs( j1[0].length - before_job_length ) > 0.001 )
    {
      if( j1[0].length > before_job_length )
      {
        // Too long
        current_test_angle -= ref_angle;
      }
      else
      {
        // Too short
        current_test_angle += ref_angle;
      }
      j1 = this.splitAnglePercent( current_test_angle );
      ref_angle /= 2;
    }

    return j1;
  }

  get opposite_direction()
  {
    var new_job = this.copy();
    new_job.inverse = !this.inverse;
    return new_job;
  }
  get label_position()
  {
    return this.start;
  }

  get start()
  {
    var O = this.ends[0];
    var C = this.ends[1];
    var l = this.l;
    var OC = C.subtract( O );
    var R = OC.length;
    if( this.inverse )
    {
      return this.get_point_at_t( OC, R, l, O, this.end_t );
    }
    else
    {
      return this.get_point_at_t( OC, R, l, O, this.start_t );
    }
  }
  get end()
  {
    var O = this.ends[0];
    var C = this.ends[1];
    var l = this.l;
    var OC = C.subtract( O );
    var R = OC.length;
    if( this.inverse )
    {
      return this.get_point_at_t( OC, R, l, O, this.start_t );
    }
    else
    {
      return this.get_point_at_t( OC, R, l, O, this.end_t );
    }
  }
  get start_direction()
  {
    var O = this.ends[0];
    var C = this.ends[1];
    var OC = C.subtract( O );
    var a = OC.angle + this.start_t;
    return a;
  }
  get end_direction()
  {
    var O = this.ends[0];
    var C = this.ends[1];
    var OC = C.subtract( O );
    var a = OC.angle + this.end_t;
    return a;
  }

  makeLonger( addToStart, addToEnd )
  {
    // Not supported
    return this;
  }
  getNearestPoint( pos, return_procent )
  {
    // Update me!!!!!!!
    if( return_procent )
      return 0;
    else
      return this.ends[0];
  }

  cross_with_line( line )
  {
    var original_t = this.end_t;
    var step = 0.01;
    this.end_t = this.start_t - step;
    var d = Infinity;
    var last_d = 1;
    var i = 0;
    while( d > 0.001 && this.end_t < 4 && i < 100 )
    {
      i++;
      last_d = d;
      while( d <= last_d && this.end_t < 4 && i < 100 )
      {
        i++;
        last_d = d;
        this.end_t += step;
        var B = this.end;
        var Bl = line.point_on_line( B );
        d = (new Line( B, Bl )).length;
      }
      this.end_t -= 2 * step;
      step /= 2;
      var B = this.end;
      var Bl = line.point_on_line( B );
      d = (new Line( B, Bl )).length;
    }
    step *= 2;
    this.end_t += step;
    var t_result = this.end_t;
    this.end_t = original_t;
    return t_result;
  }
  find_t_where_dist_to_center_line( line, R )
  {
    var original_t = this.end_t;
    var step = 0.5;
    this.end_t = this.start_t;
    var d = Infinity;
    var i = 0;

    while( Math.abs( d - R ) > 0.001 && this.end_t < 4 && (++i < 100) )
    {

      this.end_t += step;
      var B = this.end;
      var Bl = line.point_on_line( B, true );
      d = (new Line( B, Bl )).length;

      if( (R - d) < 0 && Math.abs( d - R ) > 0.001 )
      {
        this.end_t -= step;
        step /= 2;
      }
    }

    var t_result = this.end_t;
    this.end_t = original_t;
    return t_result;
  }
}
