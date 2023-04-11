class JobLoader
{
  /**
   * 
   * @param {JobsArray} old_jobs
   */
  constructor(old_jobs)
  {
    this.old_jobs = old_jobs;
    this.loadQueue = [ ];
    this.loading = false;
    this.new_jobs = {};
  }

  removeDeletedJobs()
  {
    let somethingChanged = false;
    this.old_jobs.forEach(job=>{
      if(job.source === JobSource.CLOUD && !(job.id in this.new_jobs))
      {
        this.old_jobs.remove_job(job.id);
        somethingChanged = true;
      }
    });
    return somethingChanged;
  }

  /**
   * 
   * @param {Job} job 
   * @returns {Boolean} jobWasUpdated
   */
  load_one_job( job )
  {
    const old_job = this.getOldJob( job.id );
    if( old_job && old_job.last_edit >= job.date )
    {
      return false;
    }
      
    job.template = job.template.toLowerCase();
      
    if( job.template === "custom_soccer" && job.build_extra.options["Angle"].x )
    {
      return false;
    }

    job.template = templateshop_controller.get_local_template_tag(job.template);
    
    job.name = job.name.replace( /Ã¦/g, "æ" );
    job.name = job.name.replace( /Ã¸/g, "ø" );
    job.name = job.name.replace( /Ã¥/g, "å" );
    job.name = job.name.replace( /Ã†/g, "Æ" );
    job.name = job.name.replace( /Ã˜/g, "Ø" );
    job.name = job.name.replace( /Ã…/g, "Å" );

    if( !job.build_extra.projection )
    {
      job.build_extra.projection = "+proj=utm +zone=32"; // utm 32
      job.build_extra.proj_alias = "UTM32"; // utm 32
    }
    var new_job = null;
    if( job.build_extra.layout_method )
    {
      // new design method
      new_job = new pt[job.template]( job.id, job.name, job.build_extra.layout_method );
      if( job.customer )
      {
        new_job.editable = job.customer === login_screen_controller.customer_id;
        new_job.customer = job.customer;
      }
      job.build_extra.points.forEach( function( p )
      {
        new_job.points.push( new Vector( p[0], p[1] ) );
      } );

      // add Variables

      if( !job.build_extra.options.created_with_dubins ) {
        job.build_extra.options.created_with_dubins = false;
      }

      // Check options for existing job defaults - if jobs exist that are being updated with a new option, this option's "existingJobDefault" will be set as val for the new option on the pitch
      const new_job_keys = Object.keys(new_job.options);
      new_job_keys.forEach((key)=>{
        if (!(key in job.build_extra.options) && "existingJobDefault" in new_job.options[key]) {
          new_job.options[key].val = new_job.options[key].existingJobDefault;
        }
      });

      const build_extra_keys = Object.keys( job.build_extra.options );
      build_extra_keys.forEach( function( key )
      {
        var keyInside = key;
        (key === "8 man pitch 1") ? keyInside = "PitchInPitch 1" : 0;
        (key === "8 man pitch 2") ? keyInside = "PitchInPitch 2" : 0;
        (key === "Full 8 man pitches") ? keyInside = "Full PitchInPitch" : 0;
        if( new_job.options[keyInside] && !new_job.options[keyInside].dontsave ) {
          new_job.options[keyInside].val = job.build_extra.options[key];
        }
          
      } );

    }
    else
    {
      new_job = new pt[job.template]( job.id, job.name, "corner,side" );
      if( job.customer )
      {
        new_job.editable = job.customer === login_screen_controller.customer_id;
        new_job.customer = job.customer;
      }
      // Add points
      for( var i = 0; i < Object.keys( job.build_extra.points ).length; i++ )
      {
        new_job.points.push( new Vector( job.build_extra.points[i].x, job.build_extra.points[i].y ) );
      }
      // add Variables
      Object.keys( job.build_extra.variables ).forEach( function( key )
      {
        if( (key === "ignoreids") && new_job.options["taskModificationIds"] && !job.build_extra.variables["taskModificationIds"] )
        {
          new_job.options["taskModificationIds"] = Object.fromEntries(job.build_extra.variables[key].map(id=>[id,Task.modificationType.IGNORE]));
        }
        else if( new_job.options[key] )
        {
          new_job.options[key].val = job.build_extra.variables[key];
        }
      } );

    }

    new_job.projection = job.build_extra.projection;
    new_job.proj_alias = job.build_extra.proj_alias;
    new_job.last_edit = job.date ? job.date : 0;

    if( old_job )
    {
      this.old_jobs.replace_job( new_job.id, new_job );
    }
    else
    {
      this.old_jobs.add_job( new_job );
    }

    return true;
  }

  done_loading_jobs(callback, somethingChanged = false)
  {
    somethingChanged |= this.removeDeletedJobs();

    this.loading = false;
    if( this.loadQueue.length > 0 )
    {
      this.load( this.loadQueue.pop(), callback );
    }
    
    if( !!somethingChanged )
    {
      callback(this.old_jobs);
    }
  }

  /**
   * 
   * @param {Object[]} jobs 
   * @param {Function} callback 
   * @returns 
   */
  load( jobs, jobsChangedCallback, doneLoadingCallback )
  {
    if( this.loading )
    {
      this.loadQueue.unshift(jobs);
      return;
    }
    this.loading = true;
    logger.debug( "Starting job load" );

    jobs = jobs.sort_objects("date", true);

    this.new_jobs = jobs.reduce( function( _jobs, job )
    {
      _jobs[job.id] = job;
      return _jobs;
    }, {} );

    let somethingChanged = false;

    var job_index = 0;
    var job_loader_interval_function = ( depth = 0) =>
    {
      if( job_index < jobs.length )
      {
        var next_job = jobs[job_index];
        var did_something = false;
        try
        {
          did_something |= this.load_one_job( next_job );
        }
        catch( e )
        {
          console.error( "Error loading job", next_job, e);
          uncaughtErrorSend( `Error loading job, ${next_job.id}, ${e}`);
        }
        somethingChanged |= did_something;


        job_index++;
        if( !did_something && depth < 1000 )
          job_loader_interval_function( depth + 1 );
      }
      else
      {
        clearInterval( job_loader_interval );
        this.done_loading_jobs(jobsChangedCallback, somethingChanged);
        if(doneLoadingCallback) {
          doneLoadingCallback();
        }
      }
    };
    var job_loader_interval = setInterval( job_loader_interval_function, 0 );

  }

  getOldJob( id )
  {
    return this.old_jobs.find( job => job.id === id );
  }

  static loadLocalJobs()
  {
    const old_job_message = localStorage.getItem( "db_jobs.jobs" );
    if( old_job_message )
      message_controller.handle_message( old_job_message, "local", true );
  }
};