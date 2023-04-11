
/* global Infinity, range */

class LineTask extends Task
{
  /**
   * 
   * @param {Number} id 
   * @param {Array<Vector>} ends 
   * @param {Boolean} reverse 
   * @param {Boolean} paint 
   */
  constructor( id, ends, reverse, paint )
  {
    super( id, "line", ends, reverse, paint );
    this.layer = "";
  }
  /**
   * @returns {Array<Vector>}
   */
  get ends()
  {
    return this._ends;
  }
  set ends( e )
  {
    var last_end = false;
    this._ends = e.filter( function( end )
    {
      if( last_end )
      {
        if( (new Line( last_end, end )).unit_vector.length < 0.5 )
          return false;
      }
      last_end = end;
      return true;
    } );
    if( this._ends.length === 1 )
    {
      if( e.length )
        this._ends.push( e.last() );
      else
        this._ends.push( this._ends[0] );
    }
  }
  get start()
  {
    return this.ends[0];
  }
  set start( v )
  {
    this.ends[0] = v;
  }
  get end()
  {
    return this.ends[this.ends.length - 1];
  }
  set end( v )
  {
    this.ends[this.ends.length - 1] = v;
  }
  copy()
  {
    var newTask = new LineTask( this.id, this.ends.copy(), this.reverse, this.paint );
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.layer = this.layer;
    newTask.label = this.label;
    newTask.via = this.via;
    newTask.force_draw_color = this.force_draw_color;
    newTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newTask;
  }
  get opposite_direction()
  {
    var oposit_task = this.copy();
    oposit_task.ends = oposit_task.ends.reverse();
    return oposit_task;
  }
  get length()
  {
    var last;
    var l = 0;
    this.ends.forEach( function( end )
    {
      if( last )
      {
        l += end.dist_to_point( last );
      }
      last = end;
    } );
    return l;
  }
  splitPercent( procent )
  {

    var first_part = this.copy();
    var last_part = this.copy();
    first_part.ends = [ this.start ];
    last_part.ends = [ ];
    var total_length = this.length;
    var split_length = total_length * procent;
    var tmp_length = 0;
    var split_index = 0;
    var last_point = this.ends[0].copy();
    this.ends.forEach( ( end, i ) => {
      var l = new Line( last_point, end );
      tmp_length += l.length;
      if( tmp_length < split_length )
      {
        split_index = i;
        first_part.ends.push( end.copy() );
      }
      else
      {
        last_part.ends.push( end.copy() );
      }
      last_point = end;
    } );
    var first_length = first_part.length;
    var last_length = last_part.length;
    var missing_length = total_length - last_length - first_length;
    var new_split_length = split_length - first_length;
    var split_start = this.ends[split_index].copy();
    var split_end = this.ends[split_index + 1] ? this.ends[split_index + 1].copy() : this.ends.last().copy();
    //var new_procent = new_split_length / missing_length;

    var line = new Line( split_start, split_end );
    var end2_vec = split_start.add( line.unit_vector.multiply( new_split_length ) );
    //var end2_vec = split_start.add( line.as_vector.multiply( new_procent ) );

    if( missing_length > 0 )
      first_part.ends.push( end2_vec );
    last_part.ends.unshift( end2_vec );
    first_part.ends = first_part.ends.slice();
    last_part.ends = last_part.ends.slice();
    return [ first_part, last_part ];
  }
  toLine( start = 0, end = 1)
  {
    if( end > this.ends.length - 1 )
      end = this.ends.length - 1;
    if( start >= end && end > 0 )
    {
      throw "Start index must be lower than end index";
    }
    return new Line( this.ends[start], this.ends[end] );
  }
  lastToLine()
  {
    return this.toLine( this.ends.length - 2, this.ends.length - 1 );
  }
  sample( sample_length = 0.01, return_lines = false)
  {
    var sample_ends = [ ];
    var lines = [ ];
    for( var i = 0; i < this.ends.length - 1; i++ )
    {
      var single_line = new Line( this.ends[i], this.ends[i + 1] );

      // Get number of samples
      var n = Math.ceil( single_line.length / sample_length );

      var single_line_samples = single_line.splitBySteps( n );
      lines = lines.concat( single_line_samples );
      for( var j = 0; j < single_line_samples.length; j++ )
      {
        sample_ends.push( single_line_samples[j].start );
      }
      sample_ends.push( single_line_samples[j - 1].end );
    }

    // If points is wanted instead of lines
    if( return_lines )
      return lines;

    return new LineTask( this.id, sample_ends, this.reverse, this.paint );
  }

  makeLonger( addToStart, addToEnd )
  {
    var the_start = new Line( this.ends[0], this.ends[1] );
    var the_end = new Line( this.ends[this.ends.length - 2], this.ends[this.ends.length - 1] );
    the_start = the_start.add_to_start( addToStart );
    the_end = the_end.add_to_end( addToEnd );
    this.ends[0] = the_start.start;
    this.ends[this.ends.length - 1] = the_end.end;
    return this;
  }

  getNearestPoint( pos, return_procent )
  {
    var nearest_dist = Infinity;
    var nearest_point;
    var nearest_index = -1;
    var distances = [ 0 ];
    var last_acumulated_dist = 0;
    range( 1, this.ends.length ).forEach( ( i ) => {
      var line = new Line( this.ends[i - 1], this.ends[i] );
      var line_pos = line.point_on_line( pos, true );
      var dist = new Line( pos, line_pos ).length;
      distances.push( last_acumulated_dist + this.ends[i - 1].dist_to_point( line_pos ) );
      last_acumulated_dist += line.length;
      if( dist < nearest_dist )
      {
        nearest_dist = dist;
        nearest_point = line_pos;
        nearest_index = i;
      }
    } );
    if( return_procent )
    {
      var full = this.length;
      var part = distances[nearest_index];
      return part / full;
    }
    else
      return nearest_point;
    return nearest_point;
  }
  get label_position()
  {
    if( this.reverse )
    {
      return this.end; // At start
    }
    else
    {
      return this.start;
    }
  }

  get normal_vectors()
  {
    var vectors = [ ];
    for( var i = 1; i < this.ends.length; i++ )
    {
      vectors.push( (new Line( this.ends[i - 1], this.ends[i] )).unit_vector );
    }
    return vectors;
  }

  static importTask(task)
  {
    return new LineTask(task.id, task.ends.map(e=>e.toVector()), undefined, task.paint );
  }

}

