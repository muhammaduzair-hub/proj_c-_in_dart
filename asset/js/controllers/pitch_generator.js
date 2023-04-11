const pitch_generator = {
  get_collected_points: function( )
  {
    var points = pitch_generator.active.points.filter( function( e )
    {
      return !!e;
    } );
    return points;
  },
  save_pitch: function( job, force_customer )
  {
    if( !job )
      job = pitch_generator.active;
    console.log( "saving", job );

    let topic = "create_db_job";
    let createdTemporaryJob = false;

    let msg = {
      name: job.name,
      template: job.template_id,
      build_extra: job.get_build_extra(),
      generated: [ ]
    };
    if( force_customer )
      msg.use_customer = force_customer;

    if( job.id >= 0 && !force_customer )
    {
      console.log( "Saving changed job" );
      msg.id = job.id;
      topic = "save_db_job";

      var db_job = robot_controller.get_db_job( job.id );
      db_job.points = job.points.copy();
      db_job.options = JSON.copy( job.options );
      db_job.name = job.name;
      db_job.layout_method = job.layout_method;
      db_job.draw();

    }
    else if(!job.options.saveToCloud.val) {
      console.log( "Adding job to usb" );
      map_controller.background.jobs.add_job( job );

      if( SETTINGS.show_dialog_job_saved_locally )
      {
        popup_screen_controller.confirm_popup( translate["TemporaryJobDialog1"], translate["TemporaryJobDialog2"], translate["OK"], translate["Don't show again"], function()
        {
          popup_screen_controller.close();
        }, function()
        {
          SETTINGS.show_dialog_job_saved_locally = false;
          popup_screen_controller.close();
        } );
      }
    }
    else
    {
      console.log( "adding temporary job" );
      map_controller.background.jobs.add_job( job );
      createdTemporaryJob = true;
    }

    if( job.options.saveToCloud.val )
    {
      console.log( topic, msg );
      communication_controller.send( topic, msg, "cloud" );
    }
    else
    {
      setTimeout( function()
      {
        event_controller.call_callback( "create_db_job_done" );
      }, 2 );
    }


    if( createdTemporaryJob )
    {
      function check_next_db_list_for_new_job( )
      {
        event_controller.remove_callback( "db_jobs_list_updated", check_next_db_list_for_new_job );
        let new_not_in_list = !map_controller.background.jobs.filter( j => {
          return j.id === pitch_generator.active.id;
        } ).length;
        if( new_not_in_list )
        {
          console.warn( "new job was not in the list, fetching db list again" );
          robot_controller.fetch_db_jobs();
        }

      }
      event_controller.add_callback( "db_jobs_list_updated", check_next_db_list_for_new_job );
    }


  },
 
  /**
   * @param {Array<Jobs>} jobsArray Jobs to delete
   */
  deleteJobs(jobsArray) {  
    const cloudJobs = jobsArray.filter(pitch=>pitch.source === JobSource.CLOUD);
    const usbJobs = jobsArray.filter(pitch=>pitch.source === JobSource.USB);

    console.log("Deleting: ", cloudJobs, usbJobs);

    if (cloudJobs.length > 0) {
      this.cloudJobDeletionHelper(cloudJobs);
    }

    if (usbJobs.length > 0) {
      usbJobs.forEach(pitch=>map_controller.background.jobs.remove_job(pitch.id));
      if (cloudJobs.length < 1) {
        delete_pitch_screen_controller.afterDelete();
      }
    }
  },

  /**
   * Recursively send deletion jobs to server
   *
   * @param {JobsArray} cloudJobs Jobs to delete
   */
  cloudJobDeletionHelper(cloudJobs) {
    let stop = true;

    communication_controller.send( "delete_db_jobs", {
      job_ids: cloudJobs.map(j=>j.id)
    }, "cloud" );


    cloudJobs.forEach(job=>{
      if (map_controller.background.jobs.get_job(job.id)) {
        stop = false;
      }
    });

    if (stop) {   
      delete_pitch_screen_controller.afterDelete();
    }
    else {
      setTimeout(()=>{
        this.cloudJobDeletionHelper(cloudJobs);
      }, 1 * 1000); // 1 seconds  
    }
  },

  set_active_from_db_job_id: function( db_job_id )
  {
    map_controller.background.jobs.set_active_from_db_job_id( db_job_id );
  },
  set_active_from_db_job: function( db_job )
  {
    map_controller.background.jobs.set_active_from_db_job( db_job );
  },
  reset: function( )
  {
    map_controller.background.jobs.reset();
  },
  reselect: function( )
  {
    map_controller.background.jobs.reselect();
  },
  /**
   * @returns {Job}
   */
  get active()
  {
    return map_controller.background.jobs.active;
  },
  set active(v)
  {
    map_controller.background.jobs.active = v;
  },
  /**
   * @returns {Job}
   */
  get original()
  {
    return map_controller.background.jobs.original;
  },
  set original(v)
  {
    map_controller.background.jobs.original = v;
  },
  get_variable: function( name )
  {
    return pitch_generator.active.options[name].val;
  },
  get_option: function( name )
  {
    return pitch_generator.active.options[name];
  },
  set_option: function ( name, setter ){
    pitch_generator.active.options[name].val = setter;
  }
};

$(()=>{
  event_controller.add_callback("chosen_robot_online_changed", pitch_generator.reselect);
});