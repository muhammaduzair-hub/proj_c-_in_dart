class Job
{
  constructor(id = -1, name = "", layout_method = "") {
    const this_class = this;
    this._source = JobSource.CLOUD;
    this.parent = null;
    this.id = id;
    this.name = name;
    this.layout_method = layout_method; // String
    this.is_being_edited = false;
    this.interaction_type = Job.interaction_types.PITCH;
    this.points = [ ]; // Array of Vector
    this.tasks = [ ]; // Array of tasks
    this.test_tasks = [ ]; // Array of WaypointTask
    this.bb = [ ]; // Array of Vector
    this.snapping_lines = [ ]; // Array of Line
    this.start_locations = [ ]; // Array of StartLocation
    this.options = {}; // fill in options
    this.option_categories = new Set(); // fill in option categories
    this.handles = [ ]; // Array of Handle
    this.new_job = false;
    this.show_advance_menu = true;
    this.start_from = new StartFrom(this);
    this.allow_offset = false;
    this.allow_revisions = true;
    this.editable = true;
    this.copyable = true;
    this.show_template_type = true;
    this.hasFluentRun = false;
    
    /** @type {JobsArray} */
    this.container = null;

    this.job_options = [ ];
    
    this.options.created_with_dubins = {
      val: true
    };
    this.options.drawTasks = {
      val: [],
      dontsave: true
    }

    this.options["original_points"] = {
      val: ""
    };
    
    
    this.options["taskModificationIds"] = {
      name: "taskModificationIds",
      val: {},
      set ignoreids(v = [])
      {
        this_class.options.taskModificationIds.val = Object.assign(this_class.options.taskModificationIds.val, Object.fromEntries(v.map(id=>[id,Task.modificationType.IGNORE])));
      },
      get ignoreids()
      {
        return Object.entries(this_class.options.taskModificationIds.val).filter(entry=>entry[1]===Task.modificationType.IGNORE).map(entry=>parseInt(entry[0]));
      },
      type: "dict"
    };
    this.options["Ignore lines"] = {
      name: "Skip ignored lines",
      val: !!SETTINGS.skib_ignore_default_state,
      type: "bool",
      configurable: !SETTINGS.skib_ignore_default_state,
      deselectsafe: true,
      prev_sibling: "zzzzzzzzzzzzzzz"
    };
    this.options.zzzzzzzzzzzzzzz = {// Makes sure that the ignore lines option always is last.
      dontsave: true,
      val: 0
    };
    
    this.options["Cone nozzle"] = {
      name: "Cone nozzle",
      get val()
      {
        return  settings_screeen_controller.nozzle_type === nozzleTypes.CONE;
      },
      set val( new_val )
      {
        //console.log( "cannot set new val for cone nozzle" );
      },
      type: "bool",
      deselectsafe: true,
      dontsave: true
    };
    this.options.LineWidth = {
      name: "LineWidth",
      get val()
      {
        var val = settings_screeen_controller.paint_width;
        if( this_class.options.NegativeLineWidth.val )
          return -val;
        return val;
      },
      set val( new_val )
      {
        //console.log( "Line width is now set from robot settings menu" );
      },
      type: "float",
      "dontsave": true
    }; // the pitch is measured from the inside
    this.options.LineLength = {
      name: "LineLength",
      get val()
      {
        return settings_screeen_controller.paint_length;
      },
      set val( new_val )
      {
        //console.log( "Line length is now set from robot settings menu" );
      },
      type: "float",
      "dontsave": true
    };
    this.options.NegativeLineWidth = {
      name: "NegativeLineWidth",
      val: false,
      type: "bool",
      dontsave: true
    };
    //this.callbacks = {};

    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };

    // overwrite these child constructor
    this.adjust_template_crosses = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };

    this.use_projection = ""; // projection string
    this.use_proj_alias = "";

    this.click_bounding_box = true;

    this.options.saveToCloud = {
      name: "Save to Cloud",
      _adjustable: false,
      get adjustable() {
        if (this_class.cloudSaveSafe
        &&  this_class.isImported
        &&  !SETTINGS.import_default_save_to_cloud) {
          return true;
        }
        else {
          return false;
        }
      },
      set adjustable(v) {
        this_class.options.saveToCloud._adjustable = v;
      },
      configurable: false,
      _val: SETTINGS.import_default_save_to_cloud ? true : false,
      get val() {
        if (!this_class.cloudSaveSafe) {
          return false;
        }

        return this_class.options.saveToCloud._val;
      },
      set val(v) {
        this_class.options.saveToCloud._val = v;
      },
      type: "bool",
      dontsave: true
    };
    this.options["All dashed lines"] = {
      name: "All dashed lines",
      get val()
      {
        return false;
      },
      set val( v )
      {},
      type: "bool",
      configurable: false,
      deselectsafe: true
    };
    this.options["Align dash to center"] = {
      name: "Align dash to center",
      val: true,
      type: "bool",
      get configurable()
      {
        return this_class.options["All dashed lines"].val && robot_controller.robot_has_capability( "dash_alignment_options" );
      },
      prev_sibling: "All dashed lines",
      deselectsafe: true
    };
    this.options["Dashed length"] = {
      name: "Dashed length",
      val: 0.1,
      type: "float",
      get configurable()
      {
        return this_class.options["All dashed lines"].val;
      },
      prev_sibling: "All dashed lines",
      deselectsafe: true
    };
    this.options["Dashed space"] = {
      name: "Dashed space",
      val: 1,
      type: "float",
      get configurable()
      {
        return this_class.options["All dashed lines"].val;
      },
      prev_sibling: "All dashed lines",
      deselectsafe: true
    };
    this.options["first_last_dash"] = {
      name: "First & last dash length",
      val: 0.2,
      type: "float",
      get configurable()
      {
        return this_class.options["All dashed lines"].val && robot_controller.robot_has_capability( "first_last_dash_option" );
      },
      prev_sibling: "All dashed lines",
      deselectsafe: true
    };

    this.options["fast_test"] = {
      name: "fast_test",
      val: true,
      type: "bool"
    };
    this.options["normal_test"] = {
      name: "normal_test",
      val: true,
      type: "bool"
    };
    this.options["full_test"] = {
      name: "full_test",
      val: true,
      type: "bool"
    };

    this.option_categories.add({title: "Modify Lines", position: 0});
    this.options.altitude_filter = {
      name: "Enable Tree filter (BETA) on all lines",
      callback: ()=>
      this_class.options.taskModificationIds.val = Object.fromEntries(this_class.tasks.filter(task=>task.isVisible).map(task=>[task.id,Task.modificationType.INTERFERENCE_FILTER])),
      type: "button",
      get configurable()
      {
        return robot_controller.robot_has_any_capability( ["position_filtering_altitude","position_filtering_varzi"] );
      },
      prev_sibling: "deselect_lines",
      category: "Modify Lines"
    };
    this.options.napping = {
      name: "Enable Antinapping (BETA) on all lines",
      callback: ()=>
      this_class.options.taskModificationIds.val = Object.fromEntries(this_class.tasks.filter(task=>task.isVisible).map(task=>[task.id,Task.modificationType.ANTINAPPING])),
      type: "button",
      get configurable()
      {
        return robot_controller.robot_has_any_capability( ["napping_version_1", "napping_version_2", "napping_version_3"] );
      },
      prev_sibling: "altitude_filter",
      category: "Modify Lines"
    };
    this.options.normal_lines = {
      name: "Enable all lines",
      callback: ()=>
      this_class.options.taskModificationIds.val = {},
      type: "button",
      configurable: true,
      category: "Modify Lines"
    };
    this.options.deselect_lines = {
      name: "Ignore all lines",
      callback: ()=>
      this_class.options.taskModificationIds.val = Object.fromEntries(this_class.tasks.filter(task=>task.isVisible).map(task=>[task.id,Task.modificationType.IGNORE])),
      type: "button",
      configurable: true,
      prev_sibling: "normal_lines",
      category: "Modify Lines"
    };

    this.options.ignore_preceding_tasks_on_near = {
      name: "Ignore preceding tasks when selecting with \"near\"",
      _val: false,
      type: "bool",
      adjustable: false,
      configurable: false,
      get val() {
        if(this_class.parent instanceof MultiJob)
        {
          return false;
        }
        else if (this_class.source === JobSource.USB) {
          return SETTINGS.ignore_preceding_tasks_on_near_default;
        }
        else if( this_class instanceof PointJob ) {
          return !this_class.start_from.isStartLocation.val;
        } else {
          return false;
        }
      },
      set val(v) {
        this_class.options.ignore_preceding_tasks_on_near._val = v;
      },
      deselectsafe: true
    };

    this.job_options.push( new FloatRobotAction( "dashed_length", 0 ) );
    Object.defineProperty( this.job_options.last(), 'value', {
      get: function()
      {
        return this_class.options["All dashed lines"].val ? this_class.options["Dashed length"].val : RobotAction.get_default_value( "dashed_length" );
      }
    } );
    this.job_options.push( new FloatRobotAction( "dashed_space", 0 ) );
    Object.defineProperty( this.job_options.last(), 'value', {
      get: function()
      {
        return this_class.options["All dashed lines"].val ? this_class.options["Dashed space"].val : RobotAction.get_default_value( "dashed_space" );
      }
    } );

    if( robot_controller.robot_has_capability( "dash_alignment_options" ) )
    {
      this.job_options.push( new IntRobotAction( "dashed_reference", 1 ) );
      Object.defineProperty( this.job_options.last(), 'value', {
        get: function()
        {
          return (this_class.options["Align dash to center"].val ? this_class.options["Align dash to center"].val : RobotAction.get_default_value( "dashed_reference" )) ? 1 : 0;
        }
      } );
      this.job_options.push( new IntRobotAction( "dashed_align", 1 ) );
      Object.defineProperty( this.job_options.last(), 'value', {
        get: function()
        {
          return (this_class.options["Align dash to center"].val ? this_class.options["Align dash to center"].val : RobotAction.get_default_value( "dashed_align" )) ? 1 : 0;
        }
      } );

      this.job_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
      Object.defineProperty( this.job_options.last(), 'value', {
        get: function()
        {
          return this_class.options["first_last_dash"].val ? this_class.options["first_last_dash"].val : RobotAction.get_default_value( "lineat_begin_length" );
        }
      } );
      this.job_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
      Object.defineProperty( this.job_options.last(), 'value', {
        get: function()
        {
          return this_class.options["first_last_dash"].val ? this_class.options["first_last_dash"].val : RobotAction.get_default_value( "lineat_end_length" );
        }
      } );
    }
  }

  get cloudSaveSafe() {
    return true;
  }

  get source() {
    return this._source;
  }

  set source(v) {
    this._source = v;
  }

  get isImported() {
    return this.source === JobSource.USB;
  }

  get template_type() {
    return this.constructor.template_type;
  }
  set template_type(_) {
    console.warn("Refusing to overwrite static field 'template_type' with", _);
  }
  get template_id() {
    return this.constructor.template_id;
  }
  set template_id(_) {
    console.warn("Refusing to overwrite static field 'template_id' with", _);
  }
  get template_title() {
    return this.constructor.template_title;
  }
  set template_title(_) {
    console.warn("Refusing to overwrite static field 'template_title' with", _);
  }
  get template_image() {
    return this.constructor.template_image;
  }
  set template_image(_) {
    console.warn("Refusing to overwrite static field 'template_image' with", _);
  }
  
  static get layout_methods() {
    return {"free_hand": 0};
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "center" )
    {
      return [
        new Vector( 0.5, 0.5 )
      ];
    }
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0 )
      ];
    }
    if( layout_method === "two_middle_goal_posts" )
    {
      return [
        new Vector( 0, 0.5 ),
        new Vector( 1, 0.5 )
      ];
    }
    if( layout_method === "two_end_goal_posts" )
    {
      return [
        new Vector( 0.5, -0.03 ),
        new Vector( 0.5, 1.03 )
      ];
    }
    if( layout_method === "two_ends" )
    {
      return [
        new Vector( 0.5, 1 ),
        new Vector( 0.5, 0 )
      ];
    }
    if( layout_method === "n_ends" )
    {
      return [
        new Vector( 0.25, 0.24 ),
        new Vector( 0.77, 0.24 ),
        new Vector( 0.51, 0.77 )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0 ),
        new Vector( 1, 0.25 )
      ];
    }
    if( layout_method === "all_corners" )
    {
      return [
        new Vector( 0, 0 ),
        new Vector( 1, 0 ),
        new Vector( 1, 1 ),
        new Vector( 0, 1 )
      ];
    }
    if( layout_method === "all_goal_posts" )
    {
      return [
        new Vector( 0.4468, 0 ),
        new Vector( 0.5585, 0 ),
        new Vector( 0.5585, 1 ),
        new Vector( 0.4468, 1 )
      ];
    }
    if( layout_method === "all_corners,all_goal_posts" )
    {
      return [
        new Vector( 0, 0 ),
        new Vector( 0.4468, 0 ),
        new Vector( 0.5585, 0 ),
        new Vector( 1, 0 ),
        new Vector( 1, 1 ),
        new Vector( 0.5585, 1 ),
        new Vector( 0.4468, 1 ),
        new Vector( 0, 1 )
      ];
    }
  }

  get info_options()
  {
    return pitch_generator.active.options["TotalLength"].val > pitch_generator.active.options["Length"].val ? [ "TotalLength", "Length", "Width" ] : [ "Length", "Width" ];
  }

  static get interaction_types()
  {
    return {
      PITCH: 1,
      TOTALSTATION_LAYOUT: 2
    };
  }

  static get optionType()
  {
    return {
      INT: "int",
      FLOAT: "float",
      BOOL: "bool",
      ARRAY: "array",
      DICT: "dict"
    };
  }

  get deleteable()
  {
    return this.editable;
  }

  get end_location()
  {
    if(this.start_locations.length === 0)
    {
      // All layouts must have at least one start location
      // Start locations are usually calculated with draw
      this.draw();
    }
    if(!this.start_from.isSet)
    {
      // Choose a start location, if not done yet
      this.choose_start_location_closest_to();
    }
    if(this.start_locations.length === 1)
    {
      // Case: Non-loopable layout
      const t = this.tasks.last();
      return new StartLocation(t.end, t.id);
    }
    else
    {
      // Case: Loop-able layout
      // Return the start location as end location
      const id = this.start_from.id;
      return this.start_locations.find(sl=>sl.task_id===id);
    }
  }
  set end_location(v)
  {}

  set_new_val( option, new_val, allow_zero )
  {
    if( option.name === "Angle" || new_val > 0 || (allow_zero && new_val === 0) )
    {
      option.val = new_val;
      this.draw();
      return true;
    }
    return false;
  }

  make_side_copy( i, space, n )
  {
    var plus = this.options.Length ? this.options.Length.val : 0;
    if( i % 2 )
      plus = this.options.Width ? this.options.Width.val : 0;
    if( !this.options.Width && !this.options.Length && this.options.Radius )
    {
      plus = this.options.Radius.val * 2;
    }
    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.editable = this.editable;
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  /**
   * Sets the start from configuration to the start location nearest the given position
   * @param {Vector} pos 
   */
  choose_start_location_closest_to( pos )
  {
    this.start_from.id = this.get_nearest_start_location(pos);
  }

  get_task( id )
  {
    return this.tasks.find( t => t.id === id );
  }
  /**
   * @param pos {Vector} The position to find the nearest task to
   */
  get_nearest_task( pos )
  {
    let nearest_dist = Infinity;
    let nearest_task, nearest_point;

    this.tasks.filter(t=>t.isVisible).forEach(task => {
      if(this.options.taskModificationIds.ignoreids.indexOf(task.id) === -1){
        const nearestPoint = task.getNearestPoint( pos );
        const dist = nearestPoint.dist_to_point( pos );
        if( dist < nearest_dist )
        {
          nearest_dist = dist;
          nearest_task = task;
          nearest_point = nearestPoint;
        }
      }
    });
    return {
      task: nearest_task,
      point: nearest_point,
      dist: nearest_dist,
      get percent()
      {
        return nearest_task.getNearestProcent( pos );
      },
    };
  }
  set projection( val )
  {
    this.use_projection = '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs';//ProjectorClass.remove_gridparams( val );
    return this.projector;
  }
  get projection()
  {
    if( projection_controller.isNone( this.use_projection ) )
      return projection_controller.projections[map_controller.background.projection.getCode()];
    else
      return this.use_projection;
  }
  set proj_alias( val )
  {
    this.use_proj_alias = val;
  }
  get proj_alias()
  {
    if( projection_controller.isNone( this.use_proj_alias ) )
      return map_controller.background.projection.getCode();
    else
      return this.use_proj_alias;
  }

  get projector()
  {
    if(!this._projector || this._projector.a !== this.projection)
    {
            console.log("************************************ 1");
      this._projector && this._projector.release();
              console.log("************************************ 2"+this.projection);
      this._projector = Projector(this.projection);
              console.log("************************************ 3");
      this.projection = this._projector.a;
              console.log("************************************ 99"+this.projection);

    }
    return this._projector;
  }
  set projector(_)
  {}
  get projectionValid()
  {
    return projection_controller.UTMCoordinateValid(this.projection, this.center);
  }
  set projectionValid(_)
  {}

  get_job_option_value( option_key )
  {
    var value = RobotAction.get_default_value( option_key );
    this.job_options.forEach( function( option )
    {
      if( option.key === option_key )
        value = option.value;
    } );
    return value;
  }
  set_job_option_value( option_key, option_value )
  {
    var found = false;
    this.job_options.forEach( function( option )
    {
      if( option.key === option_key )
      {
        option.value = option_value;
        found = true;
      }
    } );
    return found;
  }
  get_task_option_value( taskIndex, action_key )
  {
    var value = this.get_job_option_value( action_key );
    if( this.tasks[taskIndex] )
    {
      this.tasks[taskIndex].task_options.forEach( function( option )
      {
        if( option.key === action_key )
          value = option.value;
      } );
    }
    return value;
  }

  getTaskOptionValueByTaskID(taskID, actionKey) {
    return this.get_task_option_value(this.tasks.findIndex(task=>task.id === taskID), actionKey);
  }

  get_task_action_option_value( taskIndex, action_key )
  {
    var value = this.get_task_option_value( taskIndex, action_key );
    if( this.tasks[taskIndex] )
    {
      this.tasks[taskIndex].action_options.forEach( function( option )
      {
        if( option.key === action_key )
          value = option.value;
      } );
    }
    return value;
  }

  getTaskActionOptionByTaskID(taskID, actionKey) {
    return this.get_task_action_option_value(this.tasks.findIndex(task=>task.id === taskID), actionKey);
  }


  has_option( option_name )
  {
    var found = false;
    this.job_options.forEach( function( option )
    {
      if( option.key === option_name )
        found = true;
    } );
    return found;
  }

  job_name( translate_dict )
  {
    var pitch_titlte = translate_dict[this.template_title] ? translate_dict[this.template_title] : this.template_title;
    var pitch_type = translate_dict[this.template_type] ? translate_dict[this.template_type] : this.template_type;

    var pitch_type_name = pitch_titlte + " " + pitch_type;
    return pitch_type_name;
  }

  removePitchLayer()
  {
    if(this.pitch_layer)
    {
      this.pitch_layer.remove();
      delete this._pitch_layer;
    }
  }

  hidePitchLayer() {
    if (this.pitch_layer) {
      this.pitch_layer.hide();
    }
    this.pitchLayerHidden = true;
  }

  showPitchLayer() {
    if (this.pitch_layer) {
      this.pitch_layer.show();
    }
    this.pitchLayerHidden = false;
  }

  get pitch_layer()
  {
    return this._pitch_layer;
  }
  set pitch_layer(v)
  {
    this.removePitchLayer();
    this._pitch_layer = v;
  }

  hasStartCircle()
  {
    if(this.pitch_layer)
    {
      return this.pitch_layer.getSource().getFeatures().map(feature=>feature.get('is_start_circle')).some(v=>v);
    }
    else
    {
      return false;
    }
  }

  templateHidden()
  {
    return settings_screeen_controller.template_hidden( this.template_id );
  }

  copy_job_options_to_job( new_job )
  {
    Object.keys( new_job.options ).forEach( ( key ) => {
      try
      {
        if(!this.options[key])
        {
          return;
        }
        else if(this.options[key].type !== "button")
        {
          let value = undefined; // do this because JSON.parse does not support 'undefined'
          if( this.options[key].val !== undefined )
          {
            value = JSON.parse( JSON.stringify( this.options[key].val ) );
          }
          new_job.options[key].val = value;
        }
      }
      catch( e )
      {
        console.log( "Failed to set value for", key, new_job.options[key].val, e );
      }
    });
  }

  /**
   * 
   * @param {Boolean} dont_draw Do not invoke the `draw` method
   * @returns {Job} Job Copy
   */
  copy( dont_draw )
  { // override if special

    const new_job = new this.constructor( this.id, this.name );
    this.copy_job_options_to_job(new_job);

    new_job.layout_method = this.layout_method;
    new_job.points = this.points.copy();
    new_job.projection = this.projection;
    new_job.proj_alias = this.proj_alias;
    new_job.start_locations = this.start_locations.copy();
    if(this.interaction_type === Job.interaction_types.PITCH){
      new_job.start_from = this.start_from;
      new_job.start_from.job = new_job;
    }
    new_job.source = this.source;
    new_job.editable = this.editable;
    if( !dont_draw )
      new_job.draw();
    return new_job;
  }
  move_points( g )
  {
    this.points = this.points.map(p=>p.add(g));
    this.changed = true;
    this.draw();
  }

  draw()
  { // override
    // update bb
    // update test_jobs
    // update jobs
  }
  move_all( g )
  {

    this.tasks = this.tasks.map( t => {
      t.move_task( g );
      return t;
    } );

    this.test_tasks = this.test_tasks.map( t => {
      t.move_task( g );
      return t;
    } );

    this.points = this.points.map( p => {
      return p.add( g );
    } );

    this.bb = this.bb.map( p => {
      return p.add( g );
    } );

    this.handles = this.handles.map( h => {
      h.position = h.position.add( g );
      return h;
    } );

    this.calculated_drawing_points = this.calculated_drawing_points.map( p => {
      return p.add( g );
    } );

  }
  can_convert_to_free_hand()
  {
    if (this.layout_method === "free_hand") {
      return false;
    }
    let lm = this.constructor.layout_methods[this.layout_method];
    let points_needed;
    if( lm instanceof LayoutMethod )
      points_needed = lm.number_of_points;
    else
      points_needed = lm;

    if( points_needed <= 3 && points_needed >= 0 )
      return true;
    else
      return false;
  }
  convert_to_free_hand()
  { // override

  }

  // Helping functions:
  get length()
  {
    var length = 0;
    if( this.tasks.length === 0 )
      this.draw();
    this.tasks.forEach( function( task )
    {
      length += task.length;
    } );
    return length;
  }

  set task_total_between_distance(v)
  {}
  get task_total_between_distance()
  {
    if(this.tasks.length <= 1)
    {
      return 0;
    }

    // Calculate length between tasks
    let space_length = 0;
    this.tasks.forEach((_, idx)=>{
      if(idx > 0)
        space_length += this.tasks[idx].start.dist_to_point(this.tasks[idx-1].end);
    });

    return space_length;
  }

  set job_total_line_distance(v)
  {}
  get job_total_line_distance()
  {
    // Add extra length (10%) to approximate ramps, etc.
    return this.length * 1.10;
  }

  set time_to_drive(v)
  {}
  get time_to_drive()
  {
    const on_line = this.job_total_line_distance / robot_controller.config.velocity_spray;
    let total_turn_angle = 0;
    let prevTask, prevTaskSplit, currTaskSplit;
    this.tasks.forEach(currTask=>{
      if(!prevTask) {
        currTaskSplit = currTask.splitMeter(0.01);
        prevTask = currTask;
        return;
      }

      if(!prevTask.toLine || !currTask.toLine)
      {
        return;
      }

      prevTaskSplit = currTaskSplit;
      currTaskSplit = currTask.splitMeter(0.01);

      const L1 = prevTaskSplit[1].toLine();
      const L2 = currTaskSplit[0].toLine();

      total_turn_angle += L1.angle_between(L2);

      prevTask = currTask;
    });
    const full_rotations = total_turn_angle / Math.PI * (2*1.5); // Robot rotates 2 * 1.5 times for each corner (because of ramps and not turning on the spot)
    const rotate = full_rotations * 20 / robot_controller.config.velocity_drive; // full_rotations * (20s to turn fully with 1m/s)
    const between_tasks = this.task_total_between_distance / robot_controller.config.velocity_drive;
    return on_line + rotate + between_tasks;
  }

  get_simple_options()
  {
    var this_class = this;
    var option_keys = Object.keys( this_class.options );
    var so = {};
    option_keys.forEach( function( key )
    {
      if( !this_class.options[key].dontsave )
        so[key] = this_class.options[key].val;
    } );
    return so;
  }
  get_build_extra()
  {
    var be = {
      layout_method: this.layout_method,
      options: this.get_simple_options(),
      points: this.points.map( function( p )
      {
        return p.toArray();
      } ),
      projection: this.projection,
      proj_alias: this.proj_alias
    };
    return be;
  }
  get_option_val( key )
  {
    if( this.options[key] )
      return this.options[key].val;
    else
      return 0;
  }

  /**
   * 
   * @param {Vector} robot_position Projected robot position
   * @returns {Number} Task ID from StartLocation
   */
  get_best_start_location( robot_position )
  {
    return this.get_nearest_start_location(robot_position);
  }
  /**
   * Finds the nearest start location from given position
   * @param {Vector} pos Projected Position from which to find the nearest start location
   * @returns {Number} Task ID from StartLocation
   */
  get_nearest_start_location( pos = robot_controller.chosen_robot_position )
  {
    var closest_dist = Infinity;
    var closest_id = 0; // If no start_locations created, 0 is default.

    if(this.start_locations.length === 0)
    {
      this.draw();
    }

    let locations = this.start_locations.filter(sl=>this.options.taskModificationIds.val[sl.task_id]!==Task.modificationType.IGNORE);
    if(locations.length === 0) {
      locations = this.tasks.filter(t=>this.options.taskModificationIds.val[t.id]!==Task.modificationType.IGNORE).map(t=>new StartLocation(t.start, t.id));
    }

    locations.forEach( function( sl )
    {
      var dist = pos.dist_to_point( sl.position );
      if( dist < closest_dist )
      {
        closest_dist = dist;
        closest_id = sl.task_id;
      }
    } );
    return closest_id;
  }
  /**
   * 
   * @param {Integer} nexus_id ID to rearrange about
   * @param {Integer} end_tasks Amount of tasks to preserve at the end of the result
   * 
   * I.e. task array [a,b,c,d,e,f] with rearranging about b and preserving 2 end tasks will
   * result in [b,c,d,a,e,f]
   * @param {Boolean} returnRestOnly Only return the last part of the tasks
   * @returns {Array<Task>} Rearranged tasks
   */
  get_rearranged_tasks_around_id( nexus_id, end_tasks = 0, returnRestOnly = false )
  {
    if(!nexus_id)
    {
      nexus_id = this.start_from.id;
    }
    else if(this.start_from.id !== nexus_id)
    {
      this.start_from.id = nexus_id;
    }

    const first = this.tasks.copy();

    if(false) // TODO: Add this back in when ids are defined properly on tasks.
      first = first.sort_objects("id");

    const nexus_index = first.findIndex(task=>task.id === nexus_id);
    const rest = first.splice( nexus_index, first.length - nexus_index - end_tasks ); // this will remove the last (N-i-end_tasks) tasks and move them to the array rest

    // if (ends_do_not_meet && only_one_start_location) { // If imported job (CSV), only return the remaining tasks
    if (returnRestOnly) {
      return rest;
    } else {
      return rest.concat( first );
    }
  }
  /**
   * 
   * @param {Vector} position Position to rearrange tasks about
   * @param {Integer} end_tasks Amount of tasks to preserve at the end of the result
   * 
   * I.e. task array [a,b,c,d,e,f] with rearranging about b and preserving 2 end tasks will
   * result in [b,c,d,a,e,f]
   * @param {Boolean} returnRestOnly Only return the last part of the tasks
   * @returns {Array<Task>} Rearranged tasks
   */
  get_rearranged_tasks( position, end_tasks = 0, returnRestOnly = false )
  {
    const best_id = this.get_best_start_location( position );
    return this.get_rearranged_tasks_around_id(best_id, end_tasks, returnRestOnly);
  }
  get_rearranged_test_tasks( robot_position )
  {
    var closest_dist = Infinity;
    var closest_id = 0; // If no start_locations created, 0 is default.
    this.test_tasks.forEach( function( tt, i )
    {
      var dist = robot_position.dist_to_point( tt.ends[0] );
      if( dist < closest_dist )
      {
        closest_dist = dist;
        closest_id = i;
      }
    } );
    console.log( "closest id", closest_id );

    var first = this.test_tasks.copy();
    var rest = first.splice( closest_id ); // this will remove the last (N-i) tasks and move them to the array rest
    var new_tasks = rest.concat( first );
    if(new_tasks[0] instanceof WaypointTask)
      new_tasks.push( new_tasks[0].copy() );
    return new_tasks;
  }

  // theese might not belong here, but lets see if it makes any trouble.
  get_snap_rotation( new_angle, snapping_lines )
  {
    var smallest_diff = Math.PI * 2;
    var smallest_abs_dist = Math.PI * 2;
    var smallest_line = [ ];
    var smallest_lines = [ ];
    snapping_lines.forEach( function( line )
    {

      var angle_diff = new_angle - line.as_vector.angle;
      while( angle_diff > (Math.PI / 4) )
        angle_diff -= (Math.PI / 2);
      while( angle_diff < - (Math.PI / 4) )
        angle_diff += (Math.PI / 2);

      if( smallest_abs_dist > Math.abs( angle_diff ) )
      {
        smallest_diff = angle_diff;
        smallest_abs_dist = Math.abs( angle_diff );
        smallest_line = [ line ];
      }

      if( Math.abs( angle_diff ) < (5 * Math.PI / 180) )
      {
        smallest_lines.push( line );
      }

    } );
    if( (5 * Math.PI / 180) > smallest_abs_dist )
    {
      new_angle -= smallest_diff;
    }
    return [ new_angle, smallest_line ];
  }
  get_align_move( this_snapping_lines, snapping_lines )
  {
    snapping_lines = snapping_lines.filter(l=>l instanceof Line);
    const align_to_lines = snapping_lines;
    let distances = [ ];
    align_to_lines.forEach( line =>
    {
      this_snapping_lines.forEach( this_line =>
      {

        if(!(line instanceof Line) || !(this_line instanceof Line)) {
          return;
        }

        // only consider lines that are parallel
        if( angle_equal( line.as_vector.angle, this_line.as_vector.angle ) < five_degrees_equal ||
          angle_equal( line.as_vector.angle + Math.PI, this_line.as_vector.angle ) < five_degrees_equal )
        {
          distances.push( [ this_line.start.subtract( line.point_on_line( this_line.start ) ), line ] );
          distances.push( [ this_line.end.subtract( line.point_on_line( this_line.end ) ), line ] );
        }

      } );
    } );

    distances = distances.filter( function( dist, i )
    { // remove distances that are the same
      return dist[0].length > 1e-8;
    } );
    distances = distances.sort( function( a, b )
    {
      return a[0].length - b[0].length;
    } );
    distances = distances.filter( function( dist, i )
    { // remove distances that are the same
      if( i === 0 )
        return true;
      return Math.abs( distances[i - 1][0].length - dist[0].length ) > 0.0001;
    } );
    distances = distances.filter( function( dist, i )
    { // remove distances that are the same
      if( i === 0 )
        return true;
      return Math.abs( dist[0].unit_vector.dot( distances[0][0].unit_vector ) ) < 0.0001;
    } );

    // map_controller.background.map_zoom == 25 -> 0.2
    // map_controller.background.map_zoom == 18 -> 2
    var snap_length = map_controller.background.map_zoom * -0.39 + 9.85;
    if( snap_length > 1 )
      snap_length = 1;
    var lines_aligned_to = [ ];
    if( distances.length > 0 && distances[0][0].length < snap_length )
    {
      var smallest_vector = distances[0][0];
      lines_aligned_to.push( distances[0][1] );
      if( distances.length > 1 && distances[1][0].length < snap_length )
      {
        smallest_vector = smallest_vector.add( distances[1][0] );
        lines_aligned_to.push( distances[1][1] );
      }
      return [ smallest_vector, lines_aligned_to ];
    }
    else
    {
      return [ new Vector( 0, 0 ), [ ] ];
    }
  }

  next_visible_task_id( task_id = 0 )
  {
    return this.tasks.sort_objects( "id" ).find(task=>task.id >= task_id && task.isVisible).id;
  }

  next_visible_task_index( task_index = 0 )
  {
    return this.tasks.findIndex((task,idx)=>idx >= task_index && task.isVisible);
  }

  next_task_id( task_id = 0 )
  {
    return this.tasks.sort_objects( "id" ).find(task=>task.id >= task_id).id;
  }

  next_task_index( task_index = 0 )
  {
    return this.tasks.findIndex((_,idx)=>idx >= task_index);
  }

  get distanceBetweenTasks()
  {
    const a = this.tasks.slice(0,(this.tasks.length-1)-1);
    const b = this.tasks.slice(1,(this.tasks.length-1)-0);
    return a.map((t,i)=>t.end.dist_to_point(b[i].start));
  }

  get locked()
  {
    return pt.templates.indexOf(this.constructor.template_id) < 0 && this.source === JobSource.CLOUD;
  }

  get template_group()
  {
    return templateshop_controller.get_group_by_template(this.template_id);
  }

  create()
  {
    this.new_job = true;
    return this;
  }

  /**
   * @param {Object} options Option for the fluent run
   * @param {Boolean} [enable=true] 
   * @param {Number} [min_turn_radius=run_pitch_controller.fluent_run_minimum_turn_angle] 
   * @param {Boolean} [start_at_robot=false] 
   * @param {String} [turn_direction="both"] 
   * @param {String} [end_turn_direction="both"] 
   * @param {Boolean} [only_one_side=false] makes sure that the CSC is extended so that it doesn't cross the streight line
   * @param {Boolean} [ignoreCCC=true] 
   * @param {Boolean} [ignoreSCS=false] 
   * @param {Boolean} [ignoreCSC=false] 
   * @param {Boolean} [add_ramp_down=false] 
   * @param {Boolean} [force_turn_to_match_next=false] 
   * @param {Boolean} [smoothing=true] 
   * @param {Number} [smooth_distance=1] 
   * @param {Boolean} [add_ramp_to_next=true] 
   * @param {Boolean} [force_merge=true] 
   * @param {Boolean} [split_on_progress=true] 
   */
  fluentRunToggle(options)
  {
    if(this.hasFluentRun)
    {
      this.draw();
      this.hasFluentRun = false;
    }
    else
    {
      this.start_from.reset();
      this.tasks = make_fluent_run(this, options);
      this.hasFluentRun = true;
    }
  }

  /**
   * @param {Object} options Option for the fluent run
   * @param {Boolean} [enable=true] 
   * @param {Number} [min_turn_radius=run_pitch_controller.fluent_run_minimum_turn_angle] 
   * @param {Boolean} [start_at_robot=false] 
   * @param {String} [turn_direction="both"] 
   * @param {String} [end_turn_direction="both"] 
   * @param {Boolean} [only_one_side=false] makes sure that the CSC is extended so that it doesn't cross the streight line
   * @param {Boolean} [ignoreCCC=true] 
   * @param {Boolean} [ignoreSCS=false] 
   * @param {Boolean} [ignoreCSC=false] 
   * @param {Boolean} [add_ramp_down=false] 
   * @param {Boolean} [force_turn_to_match_next=false] 
   * @param {Boolean} [smoothing=true] 
   * @param {Number} [smooth_distance=1] 
   * @param {Boolean} [add_ramp_to_next=true] 
   * @param {Boolean} [force_merge=true] 
   * @param {Boolean} [split_on_progress=true] 
   */
  fluentRunEnable(options)
  {
    if(!this.hasFluentRun)
    {
      this.start_from.reset();
      this.tasks = make_fluent_run(this, options);
      this.hasFluentRun = true;
    }
  }
  fluentRunDisable()
  {
    if(this.hasFluentRun)
    {
      this.start_from.reset();
      this.draw();
      this.hasFluentRun = false;
    }
  }
  exportTasks()
  {
    return this.tasks.map(t=>t.exportTask());
  }
  importTasks(tasks)
  {
    this.tasks = tasks.map(t=>Task.importTask(t));
  }

  toMultiJob()
  {
    const mj = new MultiJob();
    mj.addJob(this);
    return mj;
  }

  destroy() {
    // overload
  }
}
Object.freeze(Job.interaction_types);
Object.freeze(Job.optionType);