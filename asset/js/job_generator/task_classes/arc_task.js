
/* global Infinity */


class ArcTask extends Task
{
  /**
   * 
   * @param {Number} id 
   * @param {Vector} p1 
   * @param {Vector} p2 
   * @param {Vector} center 
   * @param {Boolean} clockwise 
   * @param {Boolean} paint 
   * @returns {ArcTask}
   */
  constructor( id, ends, center, clockwise, reverse, paint )
  {
    super( id, "arc3", ends, reverse, paint );
    this.center = center;
    this.clockwise = clockwise === undefined ? false : clockwise;
    this.calculated_length = 0;
  }

  get ends() {
    return this._ends;
  }
  set ends(v) {
    if (v.length === 3 && v[0].equals(v[2])) {
      v = [v[0], v[1]];
    }
    this._ends = v;
  }

  static From2PointsAndCenter( id, p1, p2, center, clockwise, paint )
  {
    var a = p1.subtract( center ).angle;
    var c = p2.subtract( center ).angle;
    var diff = c - a;
    if( clockwise && diff > 0 )
      diff -= Math.PI * 2;
    if( !clockwise && diff < 0 )
      diff += Math.PI * 2;

    var mid = (new Line( center, p1 )).as_vector.rotate( diff / 2 ).add( center );

    return new ArcTask( id, [ p1, mid, p2 ], center, clockwise, false, paint );
  }

  scale_task( factor )
  {
    super.scale_task( factor );
    this.center = this.center.multiply( factor ); // recize
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
      this.center = this.center.subtract( p ); // move to 0,0
    this.center = this.center.rotate( a );
    if( p )
      this.center = this.center.add( p ); // move to point
  }
  bounding_box()
  {
    var extent_corners = {
      min: [ Infinity, Infinity ],
      max: [ -Infinity, -Infinity ]
    };

    var r = new Vector( this.radius.length, 0 );
    var eb = [ ];
    for( let i = 0; i < 4; i++ )
    {
      eb.push( this.center.add( r ) );
      r = r.rotate_90_cw();
    }
    eb = eb.filter( p => {
      return this.point_is_on_arc( p );
    } );
    eb.push(this.start);
    eb.push(this.end);

    eb.forEach( function( corner )
    {
      if( corner.x > extent_corners.max[0] )
        extent_corners.max[0] = corner.x;
      if( corner.y > extent_corners.max[1] )
        extent_corners.max[1] = corner.y;
      if( corner.x < extent_corners.min[0] )
        extent_corners.min[0] = corner.x;
      if( corner.y < extent_corners.min[1] )
        extent_corners.min[1] = corner.y;
    } );

    return extent_corners;
  }
  point_is_on_arc( p )
  {
    var a = this.start.subtract( this.center ).angle;
    var b = this.end.subtract( this.center ).angle;
    var c = p.subtract( this.center ).angle;
    var diff1 = b - a;
    if(diff1 === 0)
      return true;
    if( this.clockwise && diff1 > 0 )
      diff1 -= Math.PI * 2;
    if( !this.clockwise && diff1 < 0 )
      diff1 += Math.PI * 2;
    var diff2 = c - a;
    if( this.clockwise && diff2 > 0 )
      diff2 -= Math.PI * 2;
    if( !this.clockwise && diff2 < 0 )
      diff2 += Math.PI * 2;

    if( this.clockwise )
      return diff1 <= diff2;
    if( !this.clockwise )
      return diff1 >= diff2;

  }
  get center()
  {
    if( !this._center )
      this.center = this.calculate_center();
    return this._center;
  }
  set center(v)
  {
    this._center = v;
  }
  get end()
  {
    if( this.ends.length === 2 )
      return this.ends[0];
    else
      return this.ends[this.ends.length - 1];
  }
  get local_end()
  {
    return this.end.subtract(this.center);
  }
  set end( v )
  {
    if(this.ends.length === 2)
    {
      this.start = v;
    }
    else
    {
      delete this._center;
      this.ends[2] = v;
      this.ends[1] = this.calculate_middle();
    }
  }
  get local_start()
  {
    return this.start.subtract(this.center);
  }
  get local_ends()
  {
    return this.ends.map(e=>e.subtract(this.center));
  }
  set local_ends(_)
  {}
  get start()
  {
    return this.ends[0];
  }
  set start( v )
  {
    if(this.ends.length === 2)
    {
      this.ends[0] = v;
    }
    else
    {
      delete this._center;
      this.ends[0] = v;
      this.ends[1] = this.calculate_middle();
    }
    
    delete this._center;
    this.ends[0] = v;
  }
  get start_direction()
  {
    var d = (new Line( this.center, this.start )).as_vector;
    if( this.clockwise )
      d = d.rotate_90_cw();
    else
      d = d.rotate_90_ccw();
    if( this.radius.length < 0.5 )
      return (d.angle + Math.PI).normalizeAngle;
    return d.angle;
  }
  get end_direction()
  {
    var d = (new Line( this.center, this.end )).as_vector;
    if( this.clockwise )
      d = d.rotate_90_cw();
    else
      d = d.rotate_90_ccw();
    if( this.radius.length < 0.5 )
      return (d.angle + Math.PI).normalizeAngle;
    return d.angle;
  }

  get start_curvature()
  {
    return 1 / this.radius.length;
  }
  get end_curvature()
  {
    return 1 / this.radius.length;
  }

  get_robot_start_direction( parent_job )
  {
    let angle = super.get_robot_start_direction( parent_job );
    //if( this.radius.length < 0.5 )
    //  angle = (angle + Math.PI).normalizeAngle;
    return angle;
  }
  get_robot_end_direction( parent_job )
  {
    let angle = super.get_robot_end_direction( parent_job );
    //if( this.radius.length < 0.5 )
    //  angle = (angle + Math.PI).normalizeAngle;
    return angle;
  }

  get_task_option_value( parent_job, action_key )
  {
    if( action_key === "ramp_up_max_dist" && this.radius.length < 0.5 )
      return 0;
    return super.get_task_option_value( parent_job, action_key );
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
  get radius()
  {
    return this.ends[0].subtract( this.center );
  }
  get end_angle()
  {
    var end_angle = 2 * Math.PI;

    if( this.ends.length > 2 && this.ends[0].dist_to_point( this.ends[2] ) > 1e-6 )
    {
      const a = this.ends[0].subtract( this.center );
      const c = this.ends[2].subtract( this.center );

      if(this.reflex)
      {
        // b is "outside" small triangle AC
        end_angle = a.rotate_180().angle_between( c ) + Math.PI;
      }
      else
      {
        // b is "inside" small triangle AC
        end_angle = a.angle_between( c );
      }

    }
    return end_angle * (this.clockwise ? -1 : 1);
  }
  get length()
  {
    if( this.ends.length === 2 && this.ends[0].veryclose( this.ends[1] ) )
      return 0;
    else if( this.ends.length === 3 && this.ends[0].veryclose( this.ends[1] ) && this.ends[0].veryclose( this.ends[2] ) )
      return 0;
    else
      return Math.abs( this.radius.length * this.end_angle );
  }
  get midpoint()
  {
    return this.radius.rotate( this.end_angle / 2 );
  }

  exportTask()
  {
    const task = super.exportTask();
    task.center = this.center.toArray();
    task.clockwise = this.clockwise;
    return task;
  }
  static importTask(task)
  {
    return new ArcTask(task.id, task.ends.map(e=>e.toVector()), task.center.toVector(), task.clockwise, undefined, task.paint );
  }
  toRobotTask()
  {
    if( this.length < 0.01 )
    {
      return new WaypointTask( this.id, this.start, this.reverse, this.paint ).exportTask();
    }
    else
    {
      return this.exportTask();
    }
  }
  
  calculate_middle()
  {
    const start = this.start.subtract(this.center);
    const angle = start.angle_between(this.end.subtract(this.center)) * (this.clockwise ? -1 : 1);
    return start.rotate( angle / 2 ).add( this.center );;
  }

  calculate_center()
  {
    if( this.ends.length === 2 || this.ends[0].dist_to_point( this.ends[2] ) < 1e-6 )
    {
      return new Line( this.ends[0], this.ends[1] ).middle;
    }
    else
    {
      var A = this.ends[0];
      var B = this.ends[1];
      var C = this.ends[2];
      var AB_Mid = new Line( A, B ).middle;
      var BC_Mid = new Line( B, C ).middle;
      var yDelta_a = B.y - A.y;
      var xDelta_a = B.x - A.x;
      var yDelta_b = C.y - B.y;
      var xDelta_b = C.x - B.x;
      var center = new Vector( 0, 0 );
      var aSlope = yDelta_a / xDelta_a;
      var bSlope = yDelta_b / xDelta_b;
      if( yDelta_a === 0 )         //aSlope == 0
      {
        center.x = AB_Mid.x;
        if( xDelta_b === 0 )         //bSlope == INFINITY
          center.y = BC_Mid.y;
        else
          center.y = BC_Mid.y + (BC_Mid.x - center.x) / bSlope;
      }
      else if( yDelta_b === 0 )               //bSlope == 0
      {
        center.x = BC_Mid.x;
        if( xDelta_a === 0 )             //aSlope == INFINITY
          center.y = AB_Mid.y;
        else
          center.y = AB_Mid.y + (AB_Mid.x - center.x) / aSlope;
      }
      else if( xDelta_a === 0 )        //aSlope == INFINITY
      {
        center.y = AB_Mid.y;
        center.x = bSlope * (BC_Mid.y - center.y) + BC_Mid.x;
      }
      else if( xDelta_b === 0 )        //bSlope == INFINITY
      {
        center.y = BC_Mid.y;
        center.x = aSlope * (AB_Mid.y - center.y) + AB_Mid.x;
      }
      else
      {
        center.x = (aSlope * bSlope * (AB_Mid.y - BC_Mid.y) - aSlope * BC_Mid.x + bSlope * AB_Mid.x) / (bSlope - aSlope);
        center.y = AB_Mid.y - (center.x - AB_Mid.x) / aSlope;
      }

      return center;
    }
  }
  copy()
  {
    var newArcTask = new ArcTask( this.id, this.ends.copy(), this.center.copy(), this.clockwise, this.reverse, this.paint );
    newArcTask.task_options = this.task_options.copy();
    newArcTask.action_options = this.action_options.copy();
    newArcTask.layer = this.layer;
    newArcTask.label = this.label;
    newArcTask.via = this.via;
    newArcTask.force_draw_color = this.force_draw_color;
    newArcTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newArcTask;
  }
  sample( line_length = 0.01, return_lines = false, proj_cb)
  {
    if( proj_cb )
    {
      const proj_ends = this.array_ends.map( ( e ) => {
        return proj_cb( e ).toVector();
      } );
      return new ArcTask(this.id, proj_ends, undefined, this.clockwise, this.reverse, this.paint).sample(line_length, return_lines);
    }
    else
    {
      let steps = this.length / line_length;
      steps = Math.ceil( steps );
      if( steps > 10000 )
        steps = 10000;
      const angle_step = this.end_angle / steps;
      
      let A = this.radius.add( this.center );
      if( return_lines )
      {
        const lines = [ ];
        let B, line;
        // Start for loop at 1 since A is the zeroth step
        for( var i = 1; i <= steps; i++ )
        {
          B = this.radius.rotate( angle_step * i ).add( this.center );
          line = new Line( A, B );
          lines.push( line );
          A = B;
        }
        return lines;
      }
      else
      {
        const sample_ends = [ ];
        // Start for loop at 1 since A is the zeroth step
        for( var i = 1; i <= steps; i++ )
        {
          sample_ends.push( A );
          A = this.radius.rotate( angle_step * i ).add( this.center );
        }
        sample_ends.push( A );
        return new LineTask( this.id, sample_ends, this.reverse, this.paint );
      }

    }
  }
  splitPercent( procent )
  {

    var current_job = this.copy();
    if( current_job.ends.length === 2 )
    {
      current_job.ends.push( current_job.ends[0].copy() );
    }
    var remaining_job = current_job.copy();
    var start_vec = current_job.ends[0].subtract( current_job.center );
    var angle_start = start_vec.angle;
    var r = start_vec.length;
    var end_vec = current_job.ends[2].subtract( current_job.center );
    var angle_end = end_vec.angle;
    if( current_job.clockwise && angle_end >= angle_start )
    {
      angle_end -= Math.PI * 2;
    }
    if( !current_job.clockwise && angle_end <= angle_start )
    {
      angle_end += Math.PI * 2;
    }
    var angle_diff = angle_end - angle_start;
    var radians_done = angle_diff * procent;
    var radians_left = angle_diff * (1 - procent);
    current_job.ends[1].x = r * Math.cos( angle_start + (radians_done / 2) ) + current_job.center.x;
    current_job.ends[1].y = r * Math.sin( angle_start + (radians_done / 2) ) + current_job.center.y;
    current_job.ends[2].x = r * Math.cos( angle_start + radians_done ) + current_job.center.x;
    current_job.ends[2].y = r * Math.sin( angle_start + radians_done ) + current_job.center.y;
    remaining_job.ends[0].x = r * Math.cos( angle_start + radians_done ) + remaining_job.center.x;
    remaining_job.ends[0].y = r * Math.sin( angle_start + radians_done ) + remaining_job.center.y;
    remaining_job.ends[1].x = r * Math.cos( angle_start + radians_done + (radians_left / 2) ) + remaining_job.center.x;
    remaining_job.ends[1].y = r * Math.sin( angle_start + radians_done + (radians_left / 2) ) + remaining_job.center.y;

//    current_job.ends[1] = current_job.radius.rotate( radians_done / 2 ).add( current_job.center );
//    current_job.ends[2] = current_job.radius.rotate( radians_done ).add( current_job.center );
//    remaining_job.ends[1] = remaining_job.radius.rotate( radians_done + radians_left / 2 ).add( remaining_job.center );
//    remaining_job.ends[2] = remaining_job.radius.rotate( radians_done + radians_left ).add( remaining_job.center );

    return [ current_job, remaining_job ];
  }
  splitLineSpace( line_length, space_length = 0, dashed_offset = 0, alignment = [0, 0])
  {
    if( alignment[0] === 1 && alignment[1] === 1 )
    {
      var start_offset = (this.length / 2 - (line_length / 2)) % (line_length + space_length);
      dashed_offset += start_offset;
    }
    var part_length = line_length + space_length;
    var tmp_ends = this.ends.copy();
    tmp_ends.push( tmp_ends[0] );
    var arcs = [ ];
    var number_of_parts = (this.length) / part_length;
    var rad_pr_line = line_length / this.radius.length;
    var rad_pr_space = space_length / this.radius.length;
    if( this.clockwise )
    {
      rad_pr_line *= -1;
      rad_pr_space *= -1;
    }
    var is_line = true;

    var a = -dashed_offset / part_length;
    a = a - Math.floor( a );
    a = a * part_length;
    if( a > line_length )
    {
      is_line = false;
      a -= line_length;
    }
    if( !is_line )
      a = space_length - a;
    else
      a = line_length - a;
    var use_length = a;
    var use_rad = use_length / this.radius.length;
    if( this.clockwise )
      use_rad *= -1;

    var last_start = tmp_ends[0];
    var g = tmp_ends[0].subtract( this.center );


    var line_i = line_length / part_length;
    var space_i = space_length / part_length;

    var start_i = use_length / part_length;
    var step_i;
    for( var i = start_i; i < number_of_parts; i += step_i )
    {
      if( is_line )
      {
        var v1 = g.rotate( use_rad / 2 );
        var v2 = g.rotate( use_rad );
        var e1 = this.center.add( v1 );
        var e2 = this.center.add( v2 );
        var new_arc = new ArcTask( this.id, [ last_start, e1, e2 ], this.center, this.clockwise, this.reverse, this.paint );
        arcs.push( new_arc );
        g = v2;
        last_start = e2;
        use_rad = rad_pr_space;
      }
      else
      {
        var v2 = g.rotate( use_rad );
        var e2 = this.center.add( v2 );
        g = v2;
        last_start = e2;
        use_rad = rad_pr_line;
      }

      is_line = !is_line;
      if( !is_line )
        step_i = space_i;
      else
        step_i = line_i;
    }

    if( is_line )
    {
      var m = new Line( this.center, new Line( last_start, tmp_ends[2] ).middle ).unit_vector.multiply( this.radius.length ).add( this.center );
      var new_arc = new ArcTask( this.id, [ last_start, m, tmp_ends[2] ], this.center, this.clockwise, this.reverse, this.paint );
      arcs.push( new_arc );
    }

    return arcs;
  }

  makeRamp( rampLength )
  {
    let new_ends = this.ends.slice();
    if( new_ends.length === 2 )
      new_ends.push( new_ends[0] );
    let tt = new ArcTask( this.id, new_ends, this.center, this.clockwise, this.reverse, this.paint );
    return tt._makeLonger( rampLength, -tt.length );
  }
  makeRampDown( rampLength )
  {
    let new_ends = this.ends.slice();
    if( new_ends.length === 2 )
      new_ends.push( new_ends[0] );
    let tt = new ArcTask( this.id, new_ends, this.center, this.clockwise, this.reverse, this.paint );
    return tt._makeLonger( -tt.length, rampLength );
  }

  makeLonger( addToStart, addToEnd )
  {
    if( this.ends.length === 2 || (this.ends.length === 3 && this.ends[0].equals(this.ends[2])) )
      return this;
    else
      return this._makeLonger( addToStart, addToEnd );
  }

  _makeLonger( addToStart, addToEnd )
  {
    var r = this.radius.length;
    //var o = 2 * Math.PI * r;
    //var mr = o / ( 2 * Math.PI );
    var radAddStart = addToStart / r;
    var radAddEnd = addToEnd / r;
    if( this.clockwise )
    {
      radAddStart *= -1;
      radAddEnd *= -1;
    }

    if(this.ends.length === 2) {
      this.ends.push(this.ends[0]);
    }

    var start_angle = new Line( this.center, this.ends[0] ).as_vector.angle;
    start_angle -= radAddStart;
    var new_start = new Vector( r * Math.cos( start_angle ) + this.center.x, r * Math.sin( start_angle ) + this.center.y );
    this.ends[0] = new_start;
    var end_angle = new Line( this.center, this.ends[2] ).as_vector.angle;
    end_angle += radAddEnd;
    var new_end = new Vector( r * Math.cos( end_angle ) + this.center.x, r * Math.sin( end_angle ) + this.center.y );
    this.ends[2] = new_end;

    let arcCircle = Arc.From2PointsAndCenter( new_start, new_end, this.center, this.clockwise );
    let new_arc = arcCircle.toArcTask( this.id, this.clockwise, this.reverse, this.paint );
    this.ends = new_arc.ends;

    return this;
  }
  get opposite_direction()
  {
    if( this.ends.length === 2 )
    { // Not suported on the robot yet.
      console.log( "Reverse of complete circles is not suported on the robot yet." );
      return this;
    }
    else
      return new ArcTask( this.id, this.ends.reverse(), this.center, !this.clockwise, this.reverse, this.paint );
  }
  getNearestPoint( pos, return_procent )
  {

    var g = new Line( this.center, pos );
    var g = g.unit_vector.multiply( this.radius.length );
    var p = g.add( this.center );
    var procent = -1;
    if( this.ends.length === 3 )
    {
      var inv = this.clockwise ? -1 : 1;
      var start_angle = new Line( this.center, this.ends[0] ).angle.normalizeAngle;
      var end_angle = new Line( this.center, this.ends[2] ).angle.normalizeAngle;
      if( this.clockwise )
        var angles_to_end = (start_angle - new Line( this.center, this.ends[2] ).angle.normalizeAngle).normalizeAngle;
      else
        var angles_to_end = (new Line( this.center, this.ends[2] ).angle.normalizeAngle - start_angle).normalizeAngle;
      if( this.clockwise )
        var p_angle = (start_angle - new Line( this.center, p ).angle.normalizeAngle).normalizeAngle;
      else
        var p_angle = (new Line( this.center, p ).angle.normalizeAngle - start_angle).normalizeAngle;
      if( end_angle.veryclose( start_angle ) )
        angles_to_end += Math.PI * 2;
      if( p_angle > angles_to_end )
      {

        var l1 = new Line( pos, this.ends[2] ).length;
        var l2 = new Line( pos, this.ends[0] ).length;
        if( l1 < l2 )
        {
          p = this.ends[2];
          procent = 1;
        }
        else
        {
          p = this.ends[0];
          procent = 1;
        }
      }

    }

    if( return_procent )
    {
      if( procent >= 0 )
        return procent;
      const full = this.length;
      const part = Arc.From2PointsAndCenter(this.ends[0],p,this.center,this.clockwise).circumference;
      return part / full;
    }
    else
      return p;
  }
  get label_position()
  {
    if( this.clockwise )
    {
      return this.ends[this.ends.length - 1]; // At start
    }
    else
    {
      return this.ends[0];
    }
  }
  get offset_handle_angle()
  {
    return -this.midpoint.angle;
  }
  get offset_handle_pos()
  {
    return this.midpoint.add( this.center );
  }

  toArc()
  {
    return Arc.From2PointsAndCenter( this.start, this.end, this.center, this.clockwise );
  }
  toLine()
  {
    return new Line(this.start, this.end);
  }

  get reflex()
  {
    // const aang = this.ends[0].subtract( this.center ).angle;
    // const bang = this.ends[1].subtract( this.center ).angle;
    // const cang = this.ends[2].subtract( this.center ).angle;

    // return !( (!this.clockwise && aang < bang && bang < cang) || (this.clockwise && aang > bang && bang > cang) );

    const a = this.ends[0].subtract( this.center );
    const b = this.ends[1].subtract( this.center );
    const c = this.ends[2].subtract( this.center );

    return (a.y * b.x - a.x * b.y) * (a.y * c.x - a.x * c.y) < 0;
  }

  /**
   * Do matrix transform on task
   * @param {DenseMatrix} matrixTransform 
   * @returns {ArcTask} Transformed copy of task
   */
  transform(matrixTransform = math.identity(3))
  {
    const copy = super.transform(matrixTransform);
    copy.center = copy.center.transform(matrixTransform);

    // If normal vector flips sign, flip direction of drawing (i.e. 'clockwise')
    const normalBefore = this.start.toVector3().cross(this.end.toVector3());
    const normalAfter  = copy.start.toVector3().cross(copy.end.toVector3());
    copy.clockwise = math.sign(normalBefore.z) === math.sign(normalAfter.z) ? copy.clockwise : !copy.clockwise ;

    return copy;
  }
}

class CircleTask extends ArcTask
{
  /**
   * 
   * @param {Number} id 
   * @param {Vector} radius 
   * @param {Vector} center 
   * @param {Boolean} paint 
   */
  constructor( id, radius, center, paint )
  {
    var e1 = center.add( radius );
    var e2 = center.subtract( radius );
    super( id, [ e1, e2 ], center, true, undefined, paint );
  }
}
