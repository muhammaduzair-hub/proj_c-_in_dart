
/* global Infinity, RobotAction */

class OptionArray extends Array
{
  push( element )
  {
    if( !(element instanceof RobotAction) )
      throw "Element not a RobotAction";

    for( let i = 0; i < this.length; i++ )
    {
      if( this[i].key === element.key )
      {
        this[i] = element;
        return this.length;
      }
    }

    return super.push( element );
  }
  remove( key )
  {
    let to_be_removed = this.filter( e => {
      return e.key === key;
    } );
    to_be_removed.forEach( e => {
      const index = this.indexOf( e );
      this.splice( index, 1 );
    } );
  }
};

class Task
{
  static get modificationType()
  {
    return {
      NORMAL: 0, // No mod, shouldn't be used
      IGNORE: 1, // Ignore line
      INTERFERENCE_FILTER: 2, // Add interference filter to line
      ANTINAPPING: 3, // Add napping to line
      VIA: 4 // Don't paint line
    };
  }
  
  get_next_modification(val_current, recursion_count = 0) {
    const line_modifications = {
      // "requires_one_of" indicates the option needs the robot to have the listed capability(ies)
      types: [
        {val: Task.modificationType.NORMAL, requires_one_of: []},
        {val: Task.modificationType.IGNORE, requires_one_of: []},
        {val: Task.modificationType.INTERFERENCE_FILTER, requires_one_of: ['position_filtering_altitude', 'position_filtering_varzi']},
        {val: Task.modificationType.ANTINAPPING, requires_one_of: ['napping_version_1', 'napping_version_2', 'napping_version_3']},
        {val: Task.modificationType.VIA, requires_one_of: []}
      ]
    }

    var val_next = val_current + 1;
  
    if (val_next >= line_modifications.types.length) {
      val_next = 0;
    }

    if (line_modifications.types[val_next].requires_one_of.length == 0) {
      if(this.paint && val_next === Task.modificationType.VIA)
      {
        // return this.get_next_modification(val_next, recursion_count++);
        return val_next;
      }
      else if((!this.paint || this.via) && val_next === Task.modificationType.NORMAL)
      {
        return this.get_next_modification(val_next, recursion_count++);
      }
      else
      {
        return val_next;
      }
    }
    else {
      if (robot_controller.robot_has_any_capability(line_modifications.types[val_next].requires_one_of)) {
        return val_next;
      }
      else {
        if (recursion_count >= line_modifications.length) {
          console.warn("get_next_modification reached it's maximum recursion depth and returned default value");
          return 0;
        }
        return this.get_next_modification(val_next, recursion_count++);
      }
    }
  }

  /**
   * 
   * @param {Number} id 
   * @param {String} type 
   * @param {Array<Vector>} ends 
   * @param {Boolean} reverse 
   * @param {Boolean} paint 
   */
  constructor( id, type, ends = [], reverse, paint )
  {
    this.id = id;
    this.type = type;
    this.ends = ends;
    //this.reverse = !!reverse; // is being used in reduce_jobs
    this.paint = !!paint;
    this.via = false;
    this.task_options = new OptionArray();
    this.action_options = new OptionArray();
    this.sample_step = 1;
    this.label = "";
    this.layer = "";
    this.offset = 0;
    this.force_draw_color;
    this.fluent_run_options = {};
  }

  get isVisible()
  {
    if(this.paint && !this.via) {
      return true;
    } 
    else if (!this.paint && this.via) {
      return true;
    }
    else if (this.paint && this.via) {
      console.warn("Encountered task where both paint and via set: ", this);
    }
    return false;
  }

  equals( t2 )
  {
    let t1 = this;
    if( t1.type !== t2.type )
      return false;
    if( !t1.start.veryclose( t2.start ) )
      return false;
    if( !((t1.start_direction - t2.start_direction).normalizeAnglePlusMinus.veryclose( 0 )) )
      return false;
    return true;
  }

  scale_task( factor )
  {
    this.ends = this.ends.map( ( corner ) =>
    {
      return corner.multiply( factor ); // recize
    } );
  }
  move_task( g )
  {
    this.ends = this.ends.map( e => e.add( g ) );
  }
  rotate( a, p )
  {
    this.ends = this.ends.map( ( corner ) =>
    {
      if( p )
        corner = corner.subtract( p ); // move to 0,0
      corner = corner.rotate( a );
      if( p )
        corner = corner.add( p ); // move to point
      return corner;
    } );
  }
  bounding_box()
  {
    var extent_corners = {
      min: [ Infinity, Infinity ],
      max: [ -Infinity, -Infinity ]
    };
    this.ends.forEach( function( corner )
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
  project( from, to )
  {
    return this.projectWithProjector( Projector( from, to ) );
  }
  projectWithProjector( projector, releaseProjectorOnComplete = true ) {
    const new_task = this.copy();
    new_task.ends = this.ends.map( end => projector.forward( end.toArray() ).toVector() );
    if( releaseProjectorOnComplete ) {
      projector.release();
    }
    return new_task;
  }
  get reverse() // Caster wheel front
  {
    var dummy_job = new Job( 0 );
    dummy_job.tasks = [ this ];
    return (dummy_job.get_task_action_option_value( 0, "platform_direction" ) === 2);
  }

  get length()
  {
    return 0;
  }

  get array_ends()
  {
    if( !(this._old_ends && this._old_ends.equal( this.ends )) )
    {
      this._old_ends = this.ends.copy();
      this._array_ends = this.ends.map( ( end ) => {
        return end.toArray();
      } );
    }
    return this._array_ends;
  }

  toJob( id )
  {
    return new TaskJob( id, this );
  }

  get_task_option_value( parent_job, action_key )
  {
    var value = RobotAction.get_default_value( action_key ? action_key : parent_job );
    if( action_key )
      value = parent_job.get_job_option_value( action_key );
    else
      action_key = parent_job;
    this.task_options.forEach( function( option )
    {
      if( option.key === action_key )
        value = option.value;
    } );
    return value;
  }
  set_task_option_value( action_key, action_val )
  {
    var found = false;
    this.task_options.forEach( function( option )
    {
      if( option.key === action_key )
      {
        option.value = action_val;
        found = true;
      }
    } );
    return found;
  }
  
  get_task_action_option_value( parent_job, action_key )
  {
    var value = this.get_task_option_value( action_key ? action_key : parent_job );
    if( action_key )
      value = this.get_task_option_value( parent_job, action_key );
    else
      action_key = parent_job;
    this.action_options.forEach( function( option )
    {
      if( option.key === action_key )
        value = option.value;
    } );
    return value;
  }
  set_task_action_option_value( action_key, action_val )
  {
    var found = false;
    this.action_options.forEach( function( option )
    {
      if( option.key === action_key )
      {
        option.value = action_val;
        found = true;
      }
    } );
    return found;
  }

  sampleAmount( length )
  {
    return Math.ceil( length / this.sample_step );
  }

  getNearestProcent( pos )
  {
    return this.getNearestPoint( pos, true );
  }

  // Overwrite if special
  get start()
  {
    return this.ends[0];
  }
  get end()
  {
    return this.ends[this.ends.length - 1];
  }
  get start_direction()
  {
    if( this.ends.length > 1 )
    {
      var d = new Line( this.ends[0], this.ends[1] );
      return d.angle;
    }
    else
      return 0;
  }
  get end_direction()
  {
    if( this.ends.length > 1 )
    {
      var d = new Line( this.ends[this.ends.length - 2], this.ends[this.ends.length - 1] );
      return d.angle;
    }
    else
      return 0;
  }

  get_start_vector( parent_job )
  {
    return new Vector( 1, 0 ).rotate( this.get_robot_start_direction( parent_job ) );
  }
  get_end_vector( parent_job )
  {
    return new Vector( 1, 0 ).rotate( this.get_robot_end_direction( parent_job ) );
  }

  get start_curvature()
  {
    return 0;
  }
  get end_curvature()
  {
    return 0;

  }

  get_robot_start_direction( parent_job )
  {
    let angle = this.start_direction.normalizeAngle;
    if( this.get_task_action_option_value( parent_job, "platform_direction" ) === 2 )
      angle = (angle + Math.PI).normalizeAngle;
    return angle;
  }
  get_robot_end_direction( parent_job )
  {
    let angle = this.end_direction.normalizeAngle;
    if( this.get_task_action_option_value( parent_job, "platform_direction" ) === 2 )
      angle = (angle + Math.PI).normalizeAngle;
    return angle;
  }

  exportTask()
  {
    const task = {
      id: this.id,
      type: this.type,
      paint: !!this.paint,
      ends: this.array_ends,
      via: this.via
    };
    if(this.task_options.length > 0)
    {
      task.options = OptionArray.from( this.task_options.map( option => option.toRobotAction() ));
    }
    if(this.action_options.length > 0)
    {
      task.action_options = OptionArray.from( this.action_options.map( option => option.toRobotAction() ));
    }
      
    return task;
  }
  static getTaskClassFromType(type)
  {
    const taskTypes = {
      "line": LineTask,
      "way": WaypointTask,
      "spray": WaypointTask,
      "arc3": ArcTask,
      "bezier": CubicBezierTask,
      "ellipse": EllipseTask,
      "spline": SplineTask,
      "waterfall": WaterfallTask
    };
    return taskTypes[type];
  }
  static importTask(task)
  {
    if(task.type === "")
    {
      throw new TypeError("Task type unknown. Cannot import task.");
    }

    const importedTask = Task.getTaskClassFromType(task.type).importTask(task);

    importedTask.via = !!task.via;

    if(importedTask.options && importedTask.options.length > 0)
    {
      importedTask.task_options = OptionArray.from( task.options.map( option => RobotAction.fromRobotAction(option) ));
    }
    if(importedTask.action_options && importedTask.action_options.length > 0)
    {
      importedTask.action_options = OptionArray.from( this.action_options.map( option => RobotAction.fromRobotAction(option) ));
    }

    return importedTask;

  }

  toRobotTask()
  {
    return this.exportTask();
  }

  // Overwrite these in all sub classes
  makeLonger( addToStart, addToEnd )
  {
    return this;
  }
  makeRamp( rampLength )
  {
    return this.copy().makeLonger( rampLength, -this.length );
  }
  makeRampDown( rampLength )
  {
    return this.copy().makeLonger( -this.length, rampLength );
  }
  get opposite_direction()
  {
    return this;
  }
  splitPercent( procent )
  {
    return [ this.copy(), this.copy() ];
  }
  splitMeter( meter )
  {
    var l = this.length;
    var procent = meter / l;
    if( meter < 0 )
      procent = (l + meter) / l;
    return this.splitPercent( procent );
  }
  getNearestPoint( pos, return_procent )
  {
    if( return_procent )
      return 0;
    else
      return this.ends[0];
  }
  get label_position()
  {
    return this.ends[0]; // At start
  }
  get label_offset()
  {
    return [ 0, 0 ]; // px
  }
  set_label( label )
  {
    if( label )
    {
      this.label = "" + label;
    }
  }
  align_dash_to_end()
  {
    let d = this.length;
    let dashed_length = this.get_task_action_option_value( "dashed_length" );
    let dashed_space = this.get_task_action_option_value( "dashed_space" );

    let period = dashed_length + dashed_space;
    var periods = d / period;
    var rest = dashed_length - (periods % 1) * period;

    this.task_options.push( new FloatRobotAction( "dashed_offset", -rest ) );

  }

  convert_to_waypoints( paint = false)
  {
    let points = [ this.start, this.end ];
    points = points.filter( ( p, i ) => {
      if( i > 0 )
        return !p.dist_to_point( points[i - 1] ).veryclose( 0 );
      return true;
    } );
    let tasks = points.map( p => {
      let nt = new WaypointTask( this.id, p, false, paint );
      return nt;
    } );

    if( this.get_task_option_value( "platform_direction" ) === 2 )
    {
      tasks[0].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
      if( tasks[1] && (this.get_task_action_option_value( "platform_direction" ) === 2) )
        tasks[1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
    }
    else if( tasks[1] )
    {
      if( this.get_task_action_option_value( "platform_direction" ) === 2 )
        tasks[1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
    }

    return tasks;
  }

  toStartLocation()
  {
    return new StartLocation(this.start, this.id);
  }

  /**
   * Do matrix transform on task
   * @param {DenseMatrix} matrixTransform 
   * @returns {Task} Transformed copy of task
   */
   transform(matrixTransform = math.identity(3))
   {
     const copy = this.copy();
     copy.ends = copy.ends.map(end=>end.transform(matrixTransform));
     return copy;
   }
}
Object.freeze(Task.modificationType);