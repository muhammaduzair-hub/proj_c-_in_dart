
/* global Infinity, math, Fresnel */

class ClothoidTask extends Task
{
  constructor( id, ends, curve, reverse, paint )
  {
    super( id, "clothoid", ends, reverse, paint );
    this._memo_single;
    this.opposite = false;

    if( ends.length !== 2 )
      throw "Invalid amount of ends, must have exactly 2";
    if( curve.length !== 2 )
      throw "Invalid curve length, must have exactly 2 values (start and stop)";

    this._curve = curve;


  }
  get length()
  {
    return this._curve[1] - this._curve[0];
  }
  set length( v )
  {}
  get cvs()
  {
    return this._curve[0] / this.scale;
  }
  set cvs( v )
  {
    this._curve[0] = v;
  }
  get cve()
  {
    return this._curve[1] / this.scale;
  }
  set cve( v )
  {
    this._curve[1] = v;
  }
  calc_scale( p )
  {
    return p[0].dist_to_point( p[1] ) / Fresnel.Ce( 1 );
  }
  get scale()
  {
    return this.calc_scale( this.ends );
  }
  set scale( v )
  {}
  calc_rot( p )
  {
    return (new Line( p[0], p[1] ).angle) - 0.5 * Math.PI;
  }
  get rot()
  {
    return this.calc_rot( this.ends );
  }
  set rot( v )
  {}
  copy()
  {
    var newTask = new ClothoidTask( this.id, this.ends.copy(), this._curve.copy(), this.reverse, this.paint );
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.layer = this.layer;
    newTask.label = this.label;
    newTask.via = this.via;
    newTask.force_draw_color = this.force_draw_color;
    newTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newTask;
  }
  splitPercent( p )
  {
    var first = this.copy();
    first.cve = this.length * p + first.cvs;

    var last = this.copy();
    last.cvs = first.cve;
    last.ends[0] = first.getPointAtProcent( 1 );

    return [ first, last ];
  }
  getPointAtProcent( p )
  {
    const e = (this.cve - this.cvs) * p + this.cvs;
    return this.single( e, this.scale, this.rot, this.start );
  }
  exportTask()
  {
    const task = super.exportTask();
    task.curve = this.curve.copy();
    return task;
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
    return this.getPointAtProcent( 1 );
  }
  set end( v )
  {}
  get start_direction()
  {
    var add_procent = 0.001;
    if( this.clockwise )
      add_procent = -0.001;

    var p1 = this.getPointAtProcent( 0 );
    var p2 = this.getPointAtProcent( 0 + add_procent );
    var d = new Line( p1, p2 );
    return d.angle;
  }
  get end_direction()
  {
    var add_procent = 0.001;
    if( this.clockwise )
      add_procent = -0.001;

    var p1 = this.getPointAtProcent( 1 - add_procent );
    var p2 = this.getPointAtProcent( 1 );
    var d = new Line( p1, p2 );
    return d.angle;
  }

  single( e, scale, rot, start )
  {
    if( !this._memo_single )
    {
      this._memo_single = memoize( function( e, s, scale, rot, start )
      {
        return new Vector( Fresnel.Se( e ) - Fresnel.Se( s ), Fresnel.Ce( e ) - Fresnel.Ce( s ) )
          .multiply( scale )
          .rotate( rot )
          .add( start );
      } );
    }

    const v = this._memo_single( e, this.cvs, scale, rot, start );

    return v;
  }
  sample( sample_length = 0.001, return_lines = false, proj_cb)
  {

    if( !proj_cb )
      proj_cb = function( v )
      {
        return v;
      };

    // Get number of samples
    const n = Math.ceil( this.length / sample_length );
    const ends = this.array_ends.map( ( e ) => proj_cb( e ).toVector() );
    const scale = this.calc_scale( ends );
    const rot = this.calc_rot( ends );

    var clothoid = [ this.single( 0, scale, rot, ends[0] ) ];
    for( let i = 1; i < n; i++ )
    {
      clothoid.push( this.single( i * sample_length, scale, rot, ends[0] ) );
    }

    if( this.opposite )
      clothoid.reverse();

    if( return_lines )
    {
      var lines = [ ];
      for( var i = 0; i < clothoid.length - 1; i++ )
      {
        var line = new Line( clothoid[i], clothoid[i + 1] );
        lines.push( line );
      }

      // If lines is wanted instead of linetasks
      return lines;
    }

    return new LineTask( this.id, clothoid, this.reverse, this.paint );
  }
  get opposite_direction()
  {
    var t = this.copy();
    t.opposite = !this.opposite;
    return t;
  }
  getNearestPoint( pos, return_procent )
  {
    var nearest_dist = Infinity;
    var nearest_point;
    var nearest_index;

    // Evaluate spline points
    var points = this.sample( 0.01 ).ends;

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
    return this.start;
  }
  get offset_handle_angle()
  {
    return new Line( this.getPointAtProcent( 0.495 ), this.getPointAtProcent( 0.505 ) ).normal_vector.angle;
  }
  get offset_handle_pos()
  {
    return this.getPointAtProcent( 0.5 );
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
}

