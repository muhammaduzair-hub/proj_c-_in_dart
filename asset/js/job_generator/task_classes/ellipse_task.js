
/* global Infinity */

class EllipseTask extends Task
{
  constructor( id, ends, angles, center, clockwise, reverse, paint )
  {
    super( id, "ellipse", ends, reverse, paint );
    this.center = center;
    this.clockwise = clockwise;
    this.calculated_length = 0;
    this.start_angle = angles[0].copy();
    this.end_angle = angles[1].copy();

    if( this.clockwise && this.end_angle >= this.start_angle )
      this.end_angle -= Math.PI * 2;
    if( !this.clockwise && this.end_angle <= this.start_angle )
      this.end_angle += Math.PI * 2;

    if( !this.center )
      throw "Center not defined";
    if( this.ends.length < 2 )
      throw "Too few ends, must have minimum 2 (minor and major axis)";
    if( this.clockwise === undefined )
      this.clockwise = false;

    this._percentMap = [];
  }

  scale_task( factor )
  {
    super.scale_task( factor );
    this.center = this.center.multiply( factor );
  }
  move_task( g )
  {
    super.move_task( g );
    this.center = this.center.add( g );
  }
  rotate( a, p )
  {
    super.rotate( a, p );
    if( p )
      this.center = this.center.subtract( p );
    this.center = this.center.rotate( a );
    if( p )
      this.center = this.center.add( p );
  }

  get minor()
  {
    return this.ends[0].subtract( this.center );
  }
  set minor( val )
  {
    this.ends[0] = this.minor.unit_vector.multiply( val ).add( this.center );
  }
  get major()
  {
    return this.ends[1].subtract( this.center );
  }
  set major( val )
  {
    this.ends[1] = this.major.unit_vector.multiply( val ).add( this.center );
  }
  get major_offset()
  {
    return this.major.add( this.major.unit_vector.multiply( this.offset ) );
  }
  get minor_offset()
  {
    return this.minor.add( this.minor.unit_vector.multiply( this.offset ) );
  }
  get start()
  {
    return this.EllipsePoint( this.start_angle ).add( this.center );
  }
  get end()
  {
    return this.EllipsePoint( this.end_angle ).add( this.center );
  }
  get start_direction()
  {
    var add_angle = 0.001;
    if( this.clockwise )
      add_angle = -0.001;

    var p1 = this.EllipsePoint( this.start_angle );
    var p2 = this.EllipsePoint( this.start_angle + add_angle );
    var d = new Line( p1, p2 );
    return d.angle;
  }
  get end_direction()
  {
    var add_angle = 0.001;
    if( this.clockwise )
      add_angle = -0.001;

    var p1 = this.EllipsePoint( this.end_angle - add_angle );
    var p2 = this.EllipsePoint( this.end_angle );
    var d = new Line( p1, p2 );
    return d.angle;
  }
  set start_percent(v)
  {
    this.start_angle = (Math.PI * 2) * v;
  }
  get start_percent()
  {
    return this.start_angle / (Math.PI * 2);
  }
  set end_percent(v)
  {
    this.end_angle = (Math.PI * 2) * v;
  }
  get end_percent()
  {
    return this.end_angle / (Math.PI * 2);
  }

  project( from, to )
  {
    var proj = Projector( from, to );
    var new_task = this.copy();
    new_task.ends = this.ends.map( function( end )
    {
      return proj.forward( end.toArray() ).toVector();
    } );
    new_task.center = proj.forward( new_task.center.toArray() ).toVector();
    proj.release();
    return new_task;
  }
  exportTask()
  {
    if( this.major.length < this.minor.length )
    {
      const copy = this.copy();
      copy.switchMajorMinor();
      return copy.exportTask();
    }

    const task = super.exportTask();
    task.center = this.center.toArray();
    task.angles = [ this.start_angle, this.end_angle ];
    task.clockwise = this.clockwise;
    task.offset = this.offset;
    return task;
  }
  static importTask(task)
  {
    const importedTask = new EllipseTask(task.id, task.ends.map(e=>e.toVector()), task.angles, task.center.toVector(),task.clockwise, undefined, task.paint );
    importedTask.offset = task.offset;
    return importedTask;
  }
  switchMajorMinor()
  {
    var old_major = this.major;
    var old_minor = this.minor;
    var new_major = old_minor.multiply( -1 );
    var new_minor = old_major;
    this.ends[0] = this.center.add( new_minor );
    this.ends[1] = this.center.add( new_major );
    this.start_angle += Math.PI / 2;
    this.end_angle += Math.PI / 2;
  }
  copy()
  {
    var newEllipseTask = new EllipseTask( this.id, this.ends.copy(), [ this.start_angle,
      this.end_angle ], this.center.copy(), this.clockwise, this.reverse, this.paint );
    newEllipseTask.task_options = this.task_options.copy();
    newEllipseTask.action_options = this.action_options.copy();
    newEllipseTask.layer = this.layer;
    newEllipseTask.label = this.label;
    newEllipseTask.via = this.via;
    newEllipseTask.offset = this.offset;
    newEllipseTask.force_draw_color = this.force_draw_color;
    newEllipseTask._percentMap = this._percentMap.copy();
    newEllipseTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newEllipseTask;
  }

  get length()
  {
    if( this.calculated_length )
      return this.calculated_length;
    if( this.ends.length >= 2 )
    {
      if( (this.end_angle - this.start_angle).normalizeAngle.veryclose( 2 * Math.PI ) && this.offset === 0 )
      {
        this.calculated_length = Ellipse.Circumference( this.major.length, this.minor.length );
      }
      else
      {
        // Partial ellipse
        // Method: Sampling
        var sampled_lines = this.sample( undefined, true, 100 );
        this.calculated_length = 0;
        sampled_lines.forEach( line => {
          this.calculated_length += line.length;
        } );
      }
    }

    return this.calculated_length;
  }

  getPointAtProcent( p )
  {
    return this.EllipsePoint( Math.PI * 2 * this.splitPercentConvertTrue(p) );
  }

  EllipsePoint( t )
  {
    var a = this.major;
    var b = this.minor;
    var k = this.offset;

    // http://mathworld.wolfram.com/EllipseParallelCurves.html

    var q = a.angle;
    var al = a.length;
    var bl = b.length;

    // Limit k to avoid discontinuities
    var kl = k;
//    if( k < 0 )
//      if( -k > bl / (al / bl) )
//        kl = -bl / (al / bl);

    var divisor = Math.sqrt( Math.pow( al, 2 ) * Math.pow( Math.sin( t ), 2 ) + Math.pow( bl, 2 ) * Math.pow( Math.cos( t ), 2 ) );

    var x = (al + bl * kl / divisor) * Math.cos( t );
    var y = (bl + al * kl / divisor) * Math.sin( t );

    return new Vector( x, y ).rotate( q );
  }
  EllipseAngle( point, guessAngle )
  {
    var a = this.major;
    var b = this.minor;
    var k = this.offset;

    var q = a.angle;
    var al = a.length;
    var bl = b.length;

    var p = point.subtract( this.center ).rotate( -q );
    var x = p.x;
    var y = p.y;

    var d = Math.sqrt( al * al * y * y / Math.pow( bl + al * k, 2 ) + bl * bl * x * x / Math.pow( al + bl * k, 2 ) );

    var ct = x * d / (al * d + bl * k);
    var st = y * d / (bl * d + bl * k);

    var t1 = Math.acos( ct );
    var t2 = Math.asin( st );

    var t3 = Math.acos( -ct );
    var t4 = Math.asin( -st );

    var t = ([ t1, t2, t3, t4 ]).closest( guessAngle );

    return t1;
  }

  sample( sample_length = 0.1, return_lines = false, use_steps, coerce_steps = true, full_ellipse = false)
  {

    const lines = [ ];
    const sample_ends = [ ];

    // Calculate amount of steps and stepsize
    let steps = use_steps;
    if( !steps )
    {
      steps = this.length / sample_length;
    }

    if( coerce_steps )
    {
      steps = steps.coerce(4, 100);
    }

    const start_angle = full_ellipse ? 0 : this.start_angle;
    const end_angle = full_ellipse ? 2 * Math.PI : this.end_angle;
    let angle_step = Math.abs( end_angle - start_angle ) / steps;

    // Inverse step if clockwise direction
    angle_step *= this.clockwise ? -1 : 1;

    // Init points
    let A, B, line;
    A = this.EllipsePoint( start_angle );

    // Sample
    for( var i = 1; i < steps; i++ )
    {
      // Calculate points
      B = this.EllipsePoint( start_angle + angle_step * (i) );

      // Create line between points
      line = new Line( A.add( this.center ), B.add( this.center ) );
      lines.push( line );
      sample_ends.push( line.start );
      A = B;
    }
    sample_ends.push( line.end );
    B = this.EllipsePoint( end_angle );
    line = new Line( A.add( this.center ), B.add( this.center ) );
    lines.push( line );
    sample_ends.push( line.end );

    if( return_lines )
      return lines;

    return new LineTask( this.id, sample_ends, this.reverse, this.paint );
  }

  splitPercent( true_procent, threshold )
  {
    this.percentMap;

    if( !this._splitPercent )
    {
      this._splitPercent = memoize( function( true_procent, threshold )
      {
        var fake_procent = this.splitPercentConvertTrue( true_procent, threshold );
        return this.splitAnglePercent(fake_procent);
      }.bind(this) );
    }

    return this._splitPercent( true_procent, threshold );
  }
  /**
   * 
   * @param {float} true_percent e.g. to get the half-point, put this to 50%
   * @returns {float} fake procent, i.e. the corresponding percentage on the ellipse at the true_percent mark
   */
  splitPercentConvertTrue( true_percent )
  {
    const s = math.abs(math.subtract(this.percentMap[1],true_percent));
    const fake_percent = this.percentMap[0][getFirstIndexOfMinValue( s )];
    return fake_percent;
  }
  set percentMap( v )
  {
    this._percentMap = v;
  }
  get percentMap()
  {
    if( this._percentMap.length === 0 )
    {
      // Evaluate ellipse points
      const ellipse = this.sample( undefined, false, 1000, false, true ).ends; // Sample full ellipse with 1000 samples
      const n = ellipse.length;

      let d = 0; // distance
      const r = [ ]; // real
      const f = [ ]; // fake
      for( let i = 0; i < n - 1; i++ )
      {
        r.push( (i / n) );
        f.push( d );
        d += ellipse[i].dist_to_point( ellipse[i + 1] );
      }
      r.push( 1 );
      f.push( d );

      this._percentMap = [ r, f.map( p => p / d ) ];
    }

    return this._percentMap;
  }
  splitLineSpace( sample_length, line_length, space_length = 0, dashed_offset = 0, alignment = [0, 0])
  {
    if( alignment[0] === 1 && alignment[1] === 1 )
    {
      const start_offset = (this.length / 2 - (line_length / 2)) % (line_length + space_length);
      dashed_offset += start_offset;
    }

    const full_length = Ellipse.Circumference( this.major.length, this.minor.length );
    const line_percent = line_length / full_length;
    const space_percent = space_length / full_length;
    const offset_percent = dashed_offset / full_length;
    sample_length = sample_length < line_length ? line_length / 2 : sample_length;

    const task_copy = this.copy();

    const coordFromPercent = (start, end) => {
      const p1 = this.splitPercentConvertTrue(start).coerce(-1,1);
      const p2 = this.splitPercentConvertTrue(end).coerce(-1,1);
      task_copy.start_percent = p1;
      task_copy.end_percent = p2;
      return task_copy.sample(sample_length).ends;
    };

    const coords = [];
    let line_start = this.start_percent;
    let line_end = line_start + line_percent;

    if(Math.abs(offset_percent) > 0)
    {
      line_end = line_start + offset_percent;
      coords.push(coordFromPercent(line_start, this.end_percent));
      line_start = line_end + space_percent;
      line_end = line_start + line_percent;
    }

    while(line_end <= this.end_percent)
    {
      coords.push(coordFromPercent(line_start, line_end));
      line_start = line_end + space_percent;
      line_end = line_start + line_percent;
    };

    if(line_start < this.end_percent && line_end > this.end_percent)
    {
      coords.push(coordFromPercent(line_start, this.end_percent));
    }

    return coords;
  }

  splitAnglePercent( procent )
  {
    var before_job = this.copy();
    var after_job = this.copy();
    var diff_angle = this.end_angle - this.start_angle;
    var new_diff_angle = diff_angle * procent;

    before_job.end_angle = this.start_angle + new_diff_angle;
    after_job.start_angle = before_job.end_angle;
    return [ before_job, after_job ];
  }
  makeLonger( addToStart = 0, addToEnd = 0)
  {
    var direction = 1;
    if( this.clockwise )
      direction = -1;

    var new_task = this;//.copy();
    var l2 = new_task.length;
    var new_length = l2 + addToStart;
    let addToEndFirst = new_length.veryclose( 0 );

    if( addToEndFirst )
    {
      var l2 = new_task.length;
      var new_length = l2 + addToEnd;

      while( Math.abs( (diff = (new_length - l2)) ) > 0.01 )
      {
        var diff_angle = Math.abs( new_task.end_angle - new_task.start_angle );
        var mp = diff_angle / l2;
        var start_extra = mp * diff * direction;

        new_task.end_angle += start_extra;
        delete new_task.calculated_length;

        l2 = new_task.length;

      }
    }

    var l2 = new_task.length;
    var new_length = l2 + addToStart;

    var diff = 0;
    while( Math.abs( (diff = (new_length - l2)) ) > 0.01 )
    {
      var diff_angle = Math.abs( new_task.end_angle - new_task.start_angle );
      var mp = diff_angle / l2;
      var start_extra = mp * diff * direction;

      new_task.start_angle -= start_extra;
      delete new_task.calculated_length;

      l2 = new_task.length;

    }

    if( !addToEndFirst )
    {
      var l2 = new_task.length;
      var new_length = l2 + addToEnd;

      while( Math.abs( (diff = (new_length - l2)) ) > 0.01 )
      {
        var diff_angle = Math.abs( new_task.end_angle - new_task.start_angle );
        var mp = diff_angle / l2;
        var start_extra = mp * diff * direction;

        new_task.end_angle += start_extra;
        delete new_task.calculated_length;

        l2 = new_task.length;

      }
    }

    return new_task;
  }
  getNearestPoint( pos, return_procent, return_angle )
  {

    var current_test_angle = 0.5;
    var ref_angle = 0.25;
    var before_task = this.splitAnglePercent( current_test_angle - ref_angle )[0];
    var p1 = before_task.end;
    var p2 = this.splitAnglePercent( current_test_angle + ref_angle )[0].end;
    var nearest = p1;
    var nearest_angle = current_test_angle - ref_angle;
    while( p1.dist_to_point( p2 ) > 0.001 )
    {
      if( pos.dist_to_point( p1 ) < pos.dist_to_point( p2 ) )
      {
        // p1 closest
        nearest_angle = current_test_angle - ref_angle;
        current_test_angle -= ref_angle;
        nearest = p1;
      }
      else
      {
        // p2 closest
        nearest_angle = current_test_angle + ref_angle;
        current_test_angle += ref_angle;
        nearest = p2;
      }
      ref_angle /= 2;
      before_task = this.splitAnglePercent( current_test_angle - ref_angle )[0];
      p1 = before_task.end;
      p2 = this.splitAnglePercent( current_test_angle + ref_angle )[0].end;
    }

    if( return_procent )
    {
      var full = this.length;
      var part = before_task.length;
      return part / full;
    }
    else if( return_angle )
      return nearest_angle;
    else
      return nearest;
  }
  get opposite_direction()
  {
    var newEllipseTask = this.copy();
    newEllipseTask.end_angle = this.start_angle;
    newEllipseTask.start_angle = this.end_angle;
    newEllipseTask.clockwise = !this.clockwise;
    return newEllipseTask;
    //return new EllipseTask( this.id, this.ends.copy(), [ this.end_angle, this.start_angle ], this.center, !this.clockwise, this.reverse, this.paint );
  }
  get label_position()
  {
    if( this.clockwise )
    {
      return this.start;
    }
    else
    {
      return this.end;
    }
  }
  get offset_handle_angle()
  {
    return -this.minor.angle;
  }
  get offset_handle_pos()
  {
    // Limit k to avoid discontinuities
    var k = this.offset;
//    if( k < 0 )
//      if( -k > this.minor.length / (this.major.length / this.minor.length) )
//        k = -this.minor.length / (this.major.length / this.minor.length);
    return this.minor.extend( k ).add( this.center );
  }

  /**
   * Do matrix transform on task
   * @param {DenseMatrix} matrixTransform 
   * @returns {Ellipse} Transformed copy of task
   */
  transform(matrixTransform = math.identity(3))
  {
    const copy = super.transform(matrixTransform);
    copy.center = copy.center.transform(matrixTransform);

    // If normal vector flips sign, flip direction of drawing (i.e. 'clockwise')
    const normalBefore = this.major.toVector3().cross(this.minor.toVector3());
    const normalAfter  = copy.major.toVector3().cross(copy.minor.toVector3());
    copy.clockwise = math.sign(normalBefore.z) === math.sign(normalAfter.z) ? copy.clockwise : !copy.clockwise ;

    return copy;
  }
}