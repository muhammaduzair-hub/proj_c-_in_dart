/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller */

class MultiJob extends Job
{
  // TODO Determine if not forcing start location on multijobs breaks anything, then make getter that returns true if any job in multijob has forceUsingStartLocations
  forceUsingStartLocations = true;
  
  /**
   * 
   * @param {Number} id 
   * @param {String} name 
   * @param {String} layout_method 
   * @param {Array<Job>} jobs 
   */
  constructor( id, name, layout_method, jobs = [] )
  {
    super( id, name, "nearest" );
    this.addJobs(jobs);
    this.allow_offset = false;
    this.allow_revisions = false;
    this.editable = false;
    this.copyable = false;
    this._start_from = new StartFrom(this);
    this.allow_optimize = true;
  }

  get cloudSaveSafe() {
    for (const job of this.jobs) {
      if (!job.cloudSaveSafe) {
        return false;
      }
    }
    return true;
  }

  get start_from() {
    if(this.jobs.length === 0) {
      return this._start_from;
    } else {
      return this.jobs[0].start_from;
    }
  }
  set start_from(_) {}
  get deleteable()
  {
    return true;
  }
  get locked() {
    return false;
  }
  get can_edit_when_offline() {
    let result = true;
    this.jobs.forEach((job)=>{
      if (!job.can_edit_when_offline) {
        result = false;
      }
    });
    return result;
  }

  draw()
  {
    /** @type {Array<Task>} */ this.tasks = [ ];
    /** @type {Array<Vector>} */ this.bb = [ ];

    let current_position = robot_controller.chosen_robot_position;

    this.jobs.forEach( /** @param {Job} job */ job =>
    {
      try
      {
        job.draw();

        /** @type {Array<Task>} */ let tasks;
        tasks = job.get_rearranged_tasks_around_id();
        job.tasks = tasks.copy();
  
        if( job.options["Ignore lines"].val )
        {
          tasks = tasks.filter( task =>
          {
            if( job.options["taskModificationIds"][task.id] === Task.modificationType.IGNORE )
              return false;
            return true;
          } );
        }
        else
        {
          tasks = tasks.map( task =>
          {
            if( job.options["taskModificationIds"][task.id] === Task.modificationType.IGNORE )
              task.paint = false;
            return task;
          } );
        }
  
        if( this.projection !== job.projection )
        {
          const projector = this.projectorFactory.getProjector(job.projection);
          tasks = tasks.map( task => task.projectWithProjector( projector, false ) );
        }

        tasks.forEach(t=>t.id=this._taskIdConverter(t.id, job));
  
        this.tasks = this.tasks.concat( tasks );
        this.bb = this.bb.concat( job.bb );
        if(job.end_location)
        {
          current_position = job.end_location.position;
        }
      }
      catch(e)
      {
        console.warn("Could not draw single job within multijob", e);
      }
    } );

  }

  copy()
  {
    var new_job = super.copy();
    new_job.addJobs(this.jobs);
    new_job.draw();
    return new_job;
  }

  get options()
  {
    const this_class = this;
    const options = {};
    if( !this.jobs )
      return {};

    options["taskModificationIds"] = {
      name: "taskModificationIds",
      get val() {
        return Object.fromEntries(
          this_class.jobs.map(job=>{
            return Object.entries(job.options.taskModificationIds.val).map(entry=>{
              entry[0]=this_class._taskIdConverter(parseInt(entry[0]), job).toString();
              return entry;
            });
          }).flat()
        );
      },
      set val(_) {},
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

    this.jobs.forEach( job => {
      Object.keys( job.options ).forEach( key => {
        if( !options[key] )
        {
          options[key] = {
            type: job.options[key].type,
            configurable: !!job.options[key].configurable,
            adjustable: !!job.options[key].adjustable,
            name: job.options[key].name,
            get val()
            {
              return job.options[key].val;
            },
            set val( value )
            {
              console.log( value );
              this_class.jobs.forEach( function( a_job )
              {
                if( a_job.options[key] )
                  a_job.options[key].val = value;
              } );
            }
          };
        }
      } );
    } );
    return options;
  }
  set options( value )
  {}

  static get layout_methods()
  {
    return {
      "nearest": 0
    };
  }

  get info_options()
  {
    return [];
    // const options = [];
    // this.jobs.forEach(job=>job.info_options.forEach(opt=>options.indexOf(opt)===-1 && options.push(opt)));
    // return options;
  }
  get center()
  {
    return this.jobs[0].center;
  }

  moveJob(jobId, relativeIndex) {
    const old_index = this.jobs.findIndex(j=>j.id===jobId);
    let new_index = old_index + relativeIndex;
    if(old_index != -1)
    {
      this.jobs.splice(new_index, 0, this.jobs.splice(old_index, 1)[0]);
      this.choose_start_locations();
    }
    else
    {
      throw new ReferenceError(`Job with ID ${jobId} doesn't exist`);
    }
  }

  /**
   * 
   * @param {Job} new_job
   */
  addJob(new_job)
  {

    if(new_job.start_locations.length < 1)
    {
      new_job.draw();
      if(new_job.start_locations.length < 1)
      {
        throw new Error("No Start Location!");
      }
    }

    // Remove existing job if it exists
    const idx = this.jobs.findIndex(job=>job.id===new_job.id);
    if(idx >= 0)
    {
      this.jobs.splice(idx,1);
    }

    const job_copy = new_job.copy();

    // Insert reference to parent multijob
    job_copy.parent = this;

    // Choose start location on new job nearest end location of last job
    if(this.jobs.length !== 0)
    {
      job_copy.choose_start_location_closest_to(this.jobs.last().end_location.position);
    }

    // Add new job to the end of the array
    this.jobs.push(job_copy);
  }

  /**
   * 
   * @param {Task} task 
   * @param {Job} job 
   * @returns {Number} Converted id
   */
  _taskIdConverter(task_id, job)
  {
    return job.id * 1e6 + task_id;
  }

  get start_locations()
  {
    return this.jobs.length > 0 ? this.jobs[0].start_locations.copy().map(sl=>{
      sl.task_id=this._taskIdConverter(sl.task_id,this.jobs[0]);
      return sl;
    }) : [];
  }
  set start_locations(_)
  {}

  choose_start_locations()
  {
    if(this.__choosing_start_locations)
    {
      // Protect against inf loops
      return;
    }

    this.__choosing_start_locations = true;
    this.jobs.forEach(( /** @type {Job} */ job, idx) => {
      if(idx === 0)
        return;

      job.choose_start_location_closest_to(this.jobs[idx-1].end_location.position)
    });
    this.__choosing_start_locations = false;
  }

  removePitchLayer()
  {
    this.jobs.forEach(job=>job.removePitchLayer());
  }

  /**
   * 
   * @param {Array<Job>} new_job 
   */
  addJobs(new_jobs)
  {
    if(!this.jobs)
    {
      this.jobs = Array();
    }
    new_jobs.forEach(job=>{
      try {
        this.addJob(job)
      } catch (error) {
        console.warn("Could not add job", error);
      }
    });
    this.draw();
  }

  /**
   * 
   * @param {Job} new_job
   */
  removeJob(new_job)
  {
    const idx = this.jobs.findIndex(job=>job.id===new_job.id);
    if(idx >= 0)
    {
      // Remove job
      delete this.jobs[idx].parent;
      this.jobs[idx].removePitchLayer();
      this.jobs.splice(idx,1);
    }
    else
    {
      console.warn("Job does not exist");
    }
  }

  /**
   * 
   * @param {Job} new_job
   */
  toggleJob(new_job)
  {
    const idx = this.jobs.findIndex(job=>job.id===new_job.id);
    if(idx >= 0)
    {
      this.removeJob(new_job);
    }
    else
    {
      this.addJob(new_job);
    }

    this.draw();

    if(this.container && this.container.background) {
      this.container.background.eventController.call_callback( "active_job_changed" );
    }
  }

  set projection(v)
  {}
  get projection()
  {
    return this.jobs.length > 0 ? this.jobs[0].projection : undefined;
  }
  set proj_alias(v)
  {}
  get proj_alias()
  {
    return this.jobs.length > 0 ? this.jobs[0].proj_alias : undefined;
  }

  get projectorFactory() {
    if( this._projectorFactory && this._projectorFactory.to !== this.projection ) {
      this._projectorFactory.destroy();
    }
    if(!this._projectorFactory) {
      this._projectorFactory = new ProjectorFactory(undefined, this.projection);
    }
    return this._projectorFactory;
  }
  set projectorFactory(_) {}

  set ids(v)
  {}
  get ids()
  {
    return this.jobs.map(j=>j.id);
  }

  set id(v)
  {}
  get id()
  {
    return this.jobs.reduce((sum,job,i)=>sum+(i > 0 ? "," : "")+job.id,"")
  }

  set names(v)
  {}
  get names()
  {
    return this.jobs.map(j=>j.name);
  }

  set name(v)
  {}
  get name()
  {
    return this.jobs.reduce((sum,job,i)=>sum+(i > 0 ? ", " : "")+job.name,"")
  }

  set job_total_line_distance(v)
  {}
  get job_total_line_distance()
  {
    // Length of jobs
    let jobs_length = this.jobs.reduce((total, job)=>total+job.length,0);

    // Add extra length (10%) to approximate ramps, etc.
    jobs_length *= 1.10;

    return jobs_length;
  }

  set job_total_between_distance(v)
  {}
  get job_total_between_distance()
  {
    if(this.jobs.length <= 1)
    {
      return 0;
    }

    // Calculate length between jobs
    if(this.jobs.some(job=>!job.start_from.isSet))
    {
      this.choose_start_locations();
    }
    let space_length = 0;
    this.jobs.forEach((_, idx)=>{
      if(idx > 0)
        space_length += this.jobs[idx].start_from.point.dist_to_point(this.jobs[idx-1].start_from.point);
    });

    return space_length;
  }

  set length(v)
  {}
  get length()
  {
    return this.job_total_line_distance + this.job_total_between_distance;
  }

  set time_to_drive(v)
  {}
  get time_to_drive()
  {
    const on_jobs = this.jobs.reduce((sum,job)=>sum+job.time_to_drive,0);
    const between_jobs = this.job_total_between_distance / robot_controller.config.velocity_drive;
    return on_jobs + between_jobs;
  }

  get_task( id )
  {
    id = this._taskIdConverter(id);
    return this.tasks.find( t => t.id === id );
  }

  hasStartCircle()
  {
    return this.jobs.length > 0 ? this.jobs.some(j=>j.hasStartCircle()) : false;
  }

  optimize()
  {
    const sortedIndices = new Salesman(this.jobs.map(j=>j.start_locations.map(sl=>sl.position)),robot_controller.chosen_robot_position).NearestNeighbor();
    const localJobs = [];
    sortedIndices.forEach(sortedIndexSet=>{
      const startingLocationIndex = sortedIndexSet[1];
      const job = this.jobs[sortedIndexSet[0]];
      job.start_from.id = job.start_locations[startingLocationIndex].task_id;
      localJobs.push(job);
    });
    this.jobs = localJobs;
    if(this.container && this.container.background) {
      this.container.background.eventController.call_callback( "active_job_changed" );
    }
  }

  toMultiJob()
  {
    return this;
  }

  get_best_start_location( robot_position ) {
    if(this.jobs.length === 0) {
      return 0;
    } else {
      return this.jobs[0].get_best_start_location(robot_position);
    }
  }

  destroy() {
    this.projectorFactory.destroy();
  }
  
}
