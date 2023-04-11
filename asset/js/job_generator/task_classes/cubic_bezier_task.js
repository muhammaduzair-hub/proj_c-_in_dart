
/* global Infinity, line_tasks, math */

class CubicBezierTask extends Task
{
  constructor( id, ends, reverse, paint )
  {
    super( id, "bezier", ends, reverse, paint );
    this.start_percent = 0;
    this.end_percent = 1;
    this.calculated_length = 0;
  }
  copy()
  {
    var newTask = new CubicBezierTask( this.id, this.ends.copy(), this.reverse, this.paint );
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.calculated_length = this.calculated_length;
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
    return this.calculated_length * (this.end_percent - this.start_percent);
  }
  getPointAtProcent( procent )
  {
    var lines = this.make_lines( this.ends );
    var tangent_line = this.reduce_lines( lines, procent );
    return this.get_point_on_line( tangent_line, procent );
  }
  make_lines( points )
  {
    var lines = [ ];
    for( var i = 1; i < points.length; i++ )
    {
      lines.push( new Line( points[i - 1], points[i] ) );
    }
    return lines;
  }
  get_point_on_line( line, procent )
  {
    return line.start.add( line.as_vector.multiply( procent ) );
  }
  reduce_lines( lines, procent )
  {
    if( lines.length === 1 )
    {
      return lines[0];
    }
    else
    {

      var new_lines = [ ];
      var start = this.get_point_on_line( lines[0], procent );
      for( var i = 1; i < lines.length; i++ )
      {
        var end = this.get_point_on_line( lines[i], procent );
        new_lines.push( new Line( start, end ) );
        start = end;
      }
      return this.reduce_lines( new_lines, procent );
    }
  }
  splitLineSpace( sample_length, line_length, space_length = 0, dashed_offset = 0, alignment = [0, 0])
  {
    if( alignment[0] === 1 && alignment[1] === 1 )
    {
      const start_offset = (this.length / 2 - (line_length / 2)) % (line_length + space_length);
      dashed_offset += start_offset;
    }

    const line_percent = line_length / this.length;
    const space_percent = space_length / this.length;
    const offset_percent = dashed_offset / this.length;

    const do_sample = true;
    const task_copy = this.copy();

    const coordFromPercent = (start, end) => {
      const p1 = start;
      const p2 = end;
      if(do_sample && line_length > sample_length)
      {
        task_copy.start_percent = p1;
        task_copy.end_percent = p2;
        return task_copy.sample(sample_length).ends;
      }
      else
      {
        const coord = [];
        coord.push(this.getPointAtProcent(p1));
        coord.push(this.getPointAtProcent(p2));
        return coord;
      }
    };

    const coords = [];
    let total_percent = -offset_percent;
    while(total_percent < 1)
    {
      coords.push(coordFromPercent(total_percent, total_percent+line_percent));
      total_percent += line_percent + space_percent;
    };

    return coords;
  }
  sample( line_length = 10, return_lines = false, get_angles)
  {

    var lines = [ ];
    var sample_ends = [ ];
    var tangents = [ ];
    var max_length = 0;
    var lines = this.make_lines( this.ends );
    lines.forEach( function( line )
    {
      max_length += line.length;
    } );
    var steps = math.ceil( max_length / line_length );
    if( steps > 100 )
      steps = 100;
    var step_size = 1 / steps;
//    step_size = 0.1;
    var tangent_line = this.reduce_lines( lines, this.start_percent );
    tangents.push( tangent_line.angle );
    var start = this.get_point_on_line( tangent_line, this.start_percent );
    for( var i = this.start_percent; i < this.end_percent; i += step_size )
    {
      tangent_line = this.reduce_lines( lines, i );
      tangents.push( tangent_line.angle );
      var end = this.get_point_on_line( tangent_line, i );
      sample_ends.push( start );
      start = end;
    }
    sample_ends.push( end );
    tangent_line = this.reduce_lines( lines, this.end_percent );
    tangents.push( tangent_line.angle );
    var end = this.get_point_on_line( tangent_line, this.end_percent );
    var line = new Line( start, end );
    lines.push( line );
    sample_ends.push( end );
//    line_tasks.push( line.toLineTask( this.id, this.reverse, this.paint ) );
    this.sampled = new LineTask( this.id, sample_ends, this.reverse, this.paint );

    if( get_angles )
      return [ line_tasks, tangents ];

    if( return_lines )
    {
      lines = [ ];
      for( var i = 1; i < sample_ends.length; i++ )
      {
        lines.push( new Line( sample_ends[i - 1], sample_ends[i] ) );
      }
      return lines;
    }

    return this.sampled;
  }
  splitPercent( procent )
  {

    var first_part = this.copy();
    first_part.end_percent = procent;
    var last_part = this.copy();
    last_part.start_percent = procent;
    return [ first_part, last_part ];
  }

  get opposite_direction()
  {
    return new CubicBezierTask( this.id, this.ends.reverse(), this.reverse, this.paint );
  }
  get label_position()
  {
    if( this.reverse )
    {
      return this.getPointAtProcent( 1 )[0];
    }
    else
    {
      return this.getPointAtProcent( 0 )[0];
    }
  }
  isThisALine()
  {
    this.ends
    var line1 = new Line(this.ends[0], this.ends[1]).angle;
    var line2 = new Line(this.ends[1], this.ends[2]).angle;
    var line3 = new Line(this.ends[2], this.ends[3]).angle;
    if((line1 -line2).normalizeAnglePlusMinus.veryclose(0) && (line2 -line3).normalizeAnglePlusMinus.veryclose(0)){
      return new LineTask(this.id, [this.start, this.end], this.reverse, this.paint);
    }
    return this;
  }
  toLine( start = 0, end = 0.001)
  {
    // This toLine uses percents instead of end numbers

    if( end > 1 )
      end = 1;
    if( start >= end && end > 0 )
    {
      throw "Start percent must be lower than end percent";
    }
    return new Line( this.getPointAtProcent( start ), this.getPointAtProcent( end ) );
  }
  lastToLine()
  {
    // This toLine uses percents instead of end numbers

    return this.toLine( 0.999, 1 );
  }

  static importTask(task)
  {
    return new CubicBezierTask(task.id, task.ends.map(e=>e.toVector()), undefined, task.paint );
  }

}

