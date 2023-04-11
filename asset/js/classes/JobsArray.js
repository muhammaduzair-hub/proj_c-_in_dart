class JobsArray extends Array
{
  /**
   * @returns {Array<Job>}
   */
  constructor()
  {
    super(...arguments);
    /** @type {Job} */ this._active = null;
    /** @type {Job} */ this._original = null;
    /** @type {Background} */ this._background = null;
  }

  set background(v)
  {
    if(v instanceof Background)
    {
      this._background = v;
    }
    else
    {
      throw new TypeError("Type must be Background");
    }
  }
  get background()
  {
    if(this._background === null)
    {
      console.warn("No background specified. Using map_controller.background.")
      return map_controller.background;
    }
    else
    {
      return this._background;
    }
  }

  set is_active(v)
  {}
  get is_active()
  {
    if( this.active instanceof MultiJob )
    {
      return this.active.jobs.length !== 0;
    }
    else
    {
      return !(this.active instanceof NullJob);
    }
  }

  /**
   * @param {Job} v
   */
  set active(v)
  {
    if( !v )
      v = new NullJob();

    if(this.active !== v && !((this.active instanceof NullJob) && (v instanceof NullJob)))
    {
      const old_active_id = this._active.id;
      this._active.removePitchLayer();
      this._active = v;
      this._active.container = this;
      this.background.eventController.call_callback( "active_job_changed", old_active_id );
    }
  }
  /**
   * @returns {Job} v
   */
  get active()
  {
    if(!this._active)
      this._active = new NullJob();

    return this._active;
  }

  set original(v)
  {
    if( !v )
      v = new NullJob();

    if(this._original !== v)
    {
      this._original = v;
    }
  }
  get original()
  {
    if(!this._original)
      this._original = new NullJob();

    return this._original;
  }

  get nextImportID() {
    return this.containsImportedJobs ? this.getLowestID(this.importedJobs) - 1 : -1000;
  }

  get containsImportedJobs() {
    return this.find(job=>job.source === JobSource.USB) ? true : false;
  }

  /**
   * @returns {Array<Job>} List of imported jobs contained in the JobsArray
   */
  get importedJobs() {
    let importedJobs = [];
    this.forEach((job)=>{
      if (job.source === JobSource.USB) {
        importedJobs.push(job);
      }
    });
    return importedJobs;
  }

  get lastImportedJob() {
    return this.containsImportedJobs ? this[this.getLowestID] : new NullJob();
  }

  /**
   * @param {Array<Job>} jobs
   * @returns {Integer} The lowest ID of the jobs contained in 'jobs'
   */
  getLowestID(jobs) {
    let lowestID = Infinity;
    jobs.forEach((job)=>{
      if (job.id < lowestID) {
        lowestID = job.id;
      }
    });
    return lowestID;
  }

  set_active_from_db_job_id( db_job_id )
  {
    const found_job = this.get_db_job( db_job_id );
    if(found_job !== this.original)
    {
      this.set_active_from_db_job( found_job );
    }
  }
  
  /**
   * 
   * @param {Job} db_job 
   */
  set_active_from_db_job( db_job )
  {
    // this.reset();
    if(!db_job)
    {
      throw new ReferenceError("Job undefined!");
    };

    this.original = db_job;
    this.active = db_job.copy(); // Important! Active *must* be set after original (when setting active, callbacks are being called)

    if(general_settings_screen.settings.enable_fluent_run.val)
    {
      this.active.fluentRunEnable({
        start_at_robot: robot_controller.chosen_robot.online
      })
    }
    else
    {
      this.active.tasks = db_job.tasks.copy();
    }

    if( this.original instanceof NullJob ) {
      this.original = this.active;
    }

    // Convert proj_alias to alias when necessary
    if( this.active.proj_alias === this.active.projection )
    {
      const p_job = new Proj4Projection( this.active.proj_alias );
      this.active.proj_alias = p_job.getValue( "+tmr_alias" );
    }
  }

  reset( )
  {
    if(this.original instanceof MultiJob) {
      this.original.removePitchLayer();
    }
    this.active.removePitchLayer();
    this.active.start_from.reset();
    this.original.destroy();
    this.active.destroy();
    this.original = undefined;
    this.active = undefined;
  }

  reselect()
  {
    if(!this.is_active)
    {
      return;
    }
    if (this.active instanceof MultiJob) {
      return this.active;
    }
    const jobId = this.active.id;
    this.reset();
    this.set_active_from_db_job_id( jobId );
  }

  get_db_job( id )
  {
    return this.find( db_job => db_job.id === id );
  }

  get_db_job_index( id )
  {
    return this.findIndex( db_job => db_job.id === id );
  }

  replace_job( id, new_job )
  {
    this.background.draw_pitch_in_viewport(new_job);
    var old_job = this.get_db_job( id );
    if(!old_job)
    {
      console.warn( "Job ID does not exist" );
      return;
    }
    old_job.removePitchLayer();
    this[this.indexOf( old_job )] = new_job;
    if(id === this.active.id)
    {
      this.reselect();
    }
  }

  add_job( new_job )
  {
    this.push(new_job);
    this.background.draw_pitch_in_viewport(new_job);
  }
  
  add_jobs( new_jobs )
  {
    this.pushAll(new_jobs);
    new_jobs.forEach(new_job=>this.background.draw_pitch_in_viewport(new_job));
  }

  remove_job( id )
  {
    const old_job = this.get_db_job( id );
    const old_job_index = this.get_db_job_index( id );
    if( old_job && old_job_index > -1 )
    {
      old_job.removePitchLayer();
      this.splice( old_job_index, 1 );
    }
    else
    {
      console.warn( "Job ID does not exist" );
    }
  }

  /**
   * Get all jobs that are active as an array
   * @returns {Array<Job>}
   */
  get_active_jobs()
  {
    return this.active instanceof NullJob ? [] : (this.active instanceof MultiJob ? this.active.jobs : JobsArray.from([this.active]));
  }

  /**
   * Get all jobs that are original as an array
   * @returns {Array<Job>}
   */
  get_original_jobs()
  {
    return this.original instanceof NullJob ? [] : (this.original instanceof MultiJob ? this.original.jobs : JobsArray.from([this.original]));
  }

  /**
   * Get all jobs that contain a pitch layer
   * @returns {Array<Job>}
   */
  get_all_jobs_with_pitch_layer()
  {
    return this.concat(this.get_active_jobs()).filter(job=>!!job.pitch_layer);
  }

  removeAllPitchLayers()
  {
    this.get_all_jobs_with_pitch_layer().forEach(job=>job.removePitchLayer())
  }

  get_all_jobs()
  {
    let list = [ ];
    let locked_jobs = [ ];
    const active_jobs = this.get_active_jobs();

    list = this;
    // remove hidden layers
    list = list.filter( ( job ) =>
    {
        if(job.tasks.length > 0)
        {
            return !file_loader_screen.hide_layers[job.tasks[0].layer];
        }
        else
        {
            return true;
        }
    } );
    list = list.filter( ( /** @type {Job} */ job ) =>
    {
      const is_active = active_jobs.findIndex(j=>j.id===job.id) >= 0;
      return !(job.templateHidden() || (this.background && this.background.ignore_active && is_active));
    } );
    locked_jobs = this.filter(j=>j.locked);
      
    return { list:list, active:active_jobs, locked:locked_jobs };
  }

  get_all_cloud_jobs() {

  }

  get_all_imported_jobs() {

  }

  get_all_tasks( active_jobs = false)
  {
    var jobs = active_jobs ? this.get_all_jobs().active : this.get_all_jobs().list;
    return jobs.reduce((tasks, job)=>tasks.concat(job.tasks),[]);
  }

  get_job( id )
  {
    if( !id )
      return;
    var res = this.filter( job => job.id === id );
    if( res.length > 1 )
    {
      console.warn( "Multiple jobs with same id ", id );
      return res;
    }
    else
      return res[0];
  }

  toMultiJob()
  {
    const mj = new MultiJob();
    mj.addJobs(this);
    return mj;
  }
  
  get lastUpdated()
  {
    return this.map(job=>job.last_edit).sort().last();
  }

  set lastUpdated(_)
  {}

  /**
   * 
   * @param {JobsArray} otherJobsArray 
   * @returns 
   */
   isEqualTo(otherJobsArray)
  {
    return this.map(job=>job.id).sort().equal(otherJobsArray.map(job=>job.id).sort()) && this.lastUpdated === otherJobsArray.lastUpdated;
  }
}