
/* global Infinity, math */

class SplineTask extends Task
{
  constructor( id, ends, knots, degree, closed, reverse, paint )
  {
    super( id, "spline", ends, reverse, paint );
    this.opposite = false;
    this.knots = knots;
    this.degree = degree;
    this.closed = !!closed;
    this._knot_start = 0;
    this._knot_end = 1;
    if( !this.degree )
      throw "Degree not defined";
    if( this.ends.length < 2 )
      throw "Too few ends, must have minimum 2";
    if( this.knots.length < this.ends.length + degree + 1 )
      throw "Too few knots, must have minimum ends_length+degree+1";
    this.length = this.approximate_length;
    this._percentMap = [];
  }
  copy()
  {
    var newTask = new SplineTask( this.id, this.ends.copy(), this.knots, this.degree, this.closed, this.reverse, this.paint );
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.layer = this.layer;
    newTask.label = this.label;
    newTask.via = this.via;
    newTask.opposite = this.opposite;
    newTask.knot_start = this.knot_start;
    newTask.knot_end = this.knot_end;
    newTask.force_draw_color = this.force_draw_color;
    newTask._percentMap = this._percentMap.copy();
    newTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newTask;
  }
  set length( val )
  {
    this._length = val;
  }
  get length()
  {
    return this._length;
  }
  get knot_start()
  {
    return this._knot_start;
  }
  set knot_start( v )
  {
    this._knot_start = v;
    this.length = this.approximate_length;
  }
  get knot_end()
  {
    return this._knot_end;
  }
  set knot_end( v )
  {
    this._knot_end = v;
    this.length = this.approximate_length;
  }
  get approximate_length()
  {
    var e = this.evaluate( 1000 );
    var len = 0;
    for( var i = 0; i < e.length - 1; i++ )
    {
      len += e[i].dist_to_point( e[i + 1] );
    }
    return len;
  }
  splitPercent( true_procent, threshold )
  {
    this.percentMap;

    if( !this._splitPercent )
    {
      this._splitPercent = memoize( function( true_procent, threshold )
      {
        var first_part = this.copy();
        var last_part = this.copy();

        var fake_procent = this.splitPercentConvertTrue( true_procent, threshold );

        first_part.knot_end = fake_procent;
        last_part.knot_start = fake_procent;

        return [ first_part, last_part ];
      }.bind(this) );
    }

    return this._splitPercent( true_procent, threshold );
  }
  splitPercentConvertTrue( true_procent )
  {
    return this.percentMap[0][this.percentMap[1].closestIndexBinarySearch(true_procent)];
  }
  set percentMap( v )
  {
    this._percentMap = v;
  }
  get percentMap()
  {
    if( this._percentMap.length === 0 )
    {
      // Get number of samples
      let n = Math.ceil( this.length / 0.02 );

      // Evaluate spline points
      const spline = this.evaluate( n, undefined, true );

      n = spline.length;

      let d = 0; // distance
      const r = [ ]; // real
      const f = [ ]; // fake
      for( let i = 0; i < n - 1; i++ )
      {
        r.push( (i / n) );
        f.push( d );
        d += spline[i].dist_to_point( spline[i + 1] );
      }
      r.push( 1 );
      f.push( d );

      this._percentMap = [ r, f.map( p => p / d ) ];
    }

    return this._percentMap;
  }
  splitLineSpace( sample_length, line_length, space_length = 0, dashed_offset = 0, alignment = [0, 0])
  {
    if(!this._splitLineSpaceMemoize)
    {
      this._splitLineSpaceMemoize = memoize(this._splitLineSpace.bind(this));
    }
    return this._splitLineSpaceMemoize(...arguments);
  }
  _splitLineSpace( sample_length, line_length, space_length = 0, dashed_offset = 0, alignment = [0, 0])
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
      const p1 = this.splitPercentConvertTrue(start).coerce(0,1);
      const p2 = this.splitPercentConvertTrue(end).coerce(0,1);
      if(do_sample && line_length > sample_length)
      {
        task_copy.knot_start = p1;
        task_copy.knot_end = p2;
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
  exportTask()
  {
    const task = super.exportTask();
    task.length = this.length;
    task.knots = this.knots;
    task.knot_start = this.knot_start;
    task.knot_end = this.knot_end;
    task.opposite = this.opposite;
    task.degree = this.degree;
    task.closed = this.closed;
    return task;
  }
  static importTask(task)
  {
    const importedTask = new SplineTask(task.id, task.ends.map(e=>e.toVector()), task.knots, task.degree, task.closed, undefined, task.paint );
    importedTask.opposite = task.opposite;
    importedTask.length = task.length;
    importedTask.knot_start = task.knot_start;
    importedTask.knot_end = task.knot_end;
    return importedTask;
  }
  toRobotTask()
  {
    const task = this.exportTask();
    const knot_scale = task.knots.slice( -1 )[0];
    task.knots = this.knots.map( k => (k / knot_scale * task.length) );
    if(task.opposite)
    {
      const start = task.knot_start.copy();
      task.knot_start = task.knot_end;
      task.knot_end = start;
    }
    return task;
  }
  getPointAtProcent( p )
  {
    return this.single( p );
  }
  get start()
  {
    return this.getPointAtProcent( this.knot_start );
  }
  set start( v )
  {
    this.ends[0] = v;
  }
  get end()
  {
    return this.getPointAtProcent( this.knot_end );
  }
  set end( v )
  {
    this.ends[this.ends.length - 1] = v;
  }
  get start_direction()
  {
    var add_procent = 0.001;
    if( this.clockwise )
      add_procent = -0.001;

    var p1 = this.getPointAtProcent( this.knot_start );
    var p2 = this.getPointAtProcent( this.knot_start + add_procent );
    var d = new Line( p1, p2 );
    return d.angle;
  }
  get end_direction()
  {
    var add_procent = 0.001;
    if( this.clockwise )
      add_procent = -0.001;

    var p1 = this.getPointAtProcent( this.knot_end - add_procent );
    var p2 = this.getPointAtProcent( this.knot_end );
    var d = new Line( p1, p2 );
    return d.angle;
  }

  sample( sample_length = 0.01, return_lines = false, proj_cb)
  {

    if( !proj_cb )
      proj_cb = function( v )
      {
        return v;
      };


    // Get number of samples
    const n = Math.ceil( this.length / sample_length );

    // Evaluate spline points
    const spline = this.evaluate( n, proj_cb );

    // Convert spline points to line tasks
    const lines = [ ];
    if( return_lines )
    {
      for( let i = 0; i < spline.length - 1; i++ )
      {
        lines.push( new Line( spline[i], spline[i + 1] ) );
      }
      return lines;
    }

    if( spline.length === 1 )
      spline.push( spline[0] );

    return new LineTask( this.id, spline, this.reverse, this.paint );
  }
  evaluate( number_of_samples, proj_cb, full_spline = false )
  {

    if( !proj_cb )
      proj_cb = function( v )
      {
        return v;
      };

    // Init spline sample point array
    const spline = [ ];

    const points = this.array_ends.map( ( end ) => {
      return proj_cb( end );
    } );

    /*
     * Nurbs
     * https://github.com/standardcyborg/nurbs#readme
     */
    this.curve = nurbs( {
      points: points,
      knots: this.knots,
      boundary: 'clamped',
      degree: this.degree
    } );
    
    const min_knots = math.min( this.knots );
    const max_knots = math.max( this.knots );
    let knot_start, knot_end;
    if( full_spline )
    {
      knot_start = 0;
      knot_end = 1;
    }
    else
    {
      knot_start = this.knot_start < min_knots ? min_knots : this.knot_start;
      knot_end = this.knot_end > max_knots ? max_knots : this.knot_end;
    }

    const knot_range = knot_end - knot_start;

    const step = knot_range / number_of_samples;
    const out = [ ];

    for( var t = knot_start; t < knot_end; t += step )
    {
      this.curve.evaluate( out, t );
      spline.push( out.toVector() );
    }
    this.curve.evaluate( out, knot_end );
    spline.push( out.toVector() );

    if( this.closed && knot_range === 1 )
    {
      spline.push( spline[0] );
    }
   
    return this.opposite ? spline.reverse() : spline;
  }
  single( t )
  {

    /*
     * Nurbs
     * https://github.com/standardcyborg/nurbs#readme
     */
    this.curve = nurbs( {
      points: this.array_ends,
      knots: this.knots,
      boundary: 'clamped',
      degree: this.degree
    } );

    const min_knots = math.min( this.knots );
    const knot_start = this.knot_start < min_knots ? min_knots : this.knot_start;
    const max_knots = math.max( this.knots );
    const knot_end = this.knot_end > max_knots ? max_knots : this.knot_end;

    t = t.coerce( knot_start, knot_end );

    try
    {
      return this.curve.evaluate( [ ], (this.opposite ? knot_end - t : t) ).toVector();
    }
    catch( e )
    {
      console.error( e );
      throw e;
    }
  }
  bspline( t, points )
  {

    if( !points )
      points = this.array_ends.map( ( end ) => {
        return proj_cb( end );
      } );

    var i, j, s, l;           // function-scoped iteration variables
    var n = points.length;    // points count
    var d = points[0].length; // point dimensionality

    if( this.degree < 1 )
      throw new Error( 'degree must be at least 1 (linear)' );
    if( this.degree > (n - 1) )
      throw new Error( 'degree must be less than or equal to point count - 1' );


    if( this.knots.length !== n + this.degree + 1 )
      throw new Error( 'bad knot vector length' );


    var domain = [
      this.degree,
      this.knots.length - this.degree - 1
    ];

    // remap t to the domain where the spline is defined
    var low = this.knots[domain[0]];
    var high = this.knots[domain[1]];
    t = t * (high - low) + low;

    if( t < low || t > high )
      throw new Error( 'out of bounds' );

    // find s (the spline segment) for the [t] value provided
    for( s = domain[0]; s < domain[1]; s++ )
    {
      if( t >= this.knots[s] && t <= this.knots[s + 1] )
      {
        break;
      }
    }

    // convert points to homogeneous coordinates
//    if( !this.bspline_ends )
//    {
    var v = [ ];
    for( i = 0; i < n; i++ )
    {
      v[i] = [ ];
      for( j = 0; j < d; j++ )
      {
        v[i][j] = points[i][j];
      }
      v[i][d] = 1;
    }
//      this.bspline_ends = v;
//    }

    // l (level) goes from 1 to the curve degree + 1
    var alpha;
//    var v = this.bspline_ends.copy();
    for( l = 1; l <= this.degree + 1; l++ )
    {
      // build level l of the pyramid
      for( i = s; i > s - this.degree - 1 + l; i-- )
      {
        alpha = (t - this.knots[i]) / (this.knots[i + this.degree + 1 - l] - this.knots[i]);

        // interpolate each component
        for( j = 0; j < d + 1; j++ )
        {
          v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
        }
      }
    }

    // convert back to cartesian and return
    var result = [ ];
    for( i = 0; i < d; i++ )
    {
      result[i] = v[s][i] / v[s][d];
    }

    return result.toVector();
  }
  /*get opposite_direction()
  {
    const result = this.copy();
    result.opposite = !this.opposite;
    return result;
  }*/
  get opposite_direction()
  {
   
    this.opposite = !this.opposite;
    
    return this.copy();
  }
  getNearestPoint( pos, return_procent )
  {
    var nearest_dist = Infinity;
    var nearest_point;
    var nearest_index;

    // Get number of samples
    var n = Math.ceil( this.length / 0.01 );

    // Evaluate spline points
    var points = this.evaluate( n );

    for( var i = 0; i < points.length; i++ )
    {
      var p = points[i];
      var dist = p.dist_to_point( pos );
      if( dist < nearest_dist )
      {
        nearest_dist = dist;
        nearest_point = p;
        nearest_index = i;
      }
    }

    if( return_procent )
    {
      var dist = 0;
      for( var i = 0; i < nearest_index; i++ )
      {
        dist += points[i].dist_to_point( points[i + 1] );
      }
      return dist / this.length;
    }

    return nearest_point;
  }
  get label_position()
  {
    if( this.reverse && !this.closed )
    {
      return this.ends[this.ends.length - 1]; // At end
    }
    else
    {
      return this.ends[0];
    }
  }
  get offset_handle_angle()
  {
    return new Line( this.getPointAtProcent( 0.495 ), this.getPointAtProcent( 0.505 ) ).normal_vector.angle;
  }
  get offset_handle_pos()
  {
    return this.getPointAtProcent( 0.5 );
  }
  get max_control_point_angle()
  {
    var l = [ ];
    for( var i = 0; i < this.ends.length - 1; i++ )
    {
      l.push( new Line( this.ends[i], this.ends[i + 1] ) );
    }
    var max = 0;
    for( var i = 0; i < l.length - 1; i++ )
    {
      let a = l[i].angle_between( l[i + 1] );
      max = a > max ? a : max;
    }
    return max;
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
    return new Line( this.single( start ), this.single( end ) );
  }
  lastToLine()
  {
    // This toLine uses percents instead of end numbers

    return this.toLine( 0.999, 1 );
  }
  toLineTask()
  {
    let newline = new LineTask( this.id, [ this.start, this.end ], false, true )
    if(this.action_options)
      newline.action_options = this.action_options;
    else if(this.task_options)
      newline.task_options = this.task_options;
    
    if(!this.paint)
      newline.paint = false

    return newline;
  }
}

