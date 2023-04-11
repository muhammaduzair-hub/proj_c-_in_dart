class StartFrom
{
    /**
     * 
     * @param {Job} job 
     * @param {Object} options Dictionary of options
     */
    constructor(job, options = {})
    {
        this.job = job;

        this.beforeChangeCallback = options.beforeChangeCallback ? options.beforeChangeCallback : ()=>{};
        this.afterChangeCallback = options.afterChangeCallback ? options.afterChangeCallback : ()=>{};

        this._id = undefined;
        this.percent = 0;
    }

    get id()
    {
        return this._id;
    }
    set id(v)
    {
        this.beforeChangeCallback();
        const old_val = this.id;
        this._id = v;
        if( old_val !== v )
        {
            this.afterChangeCallback();
            if(this.job.parent instanceof MultiJob)
            {
                this.job.parent.choose_start_locations();
            }
            if(this.job instanceof MultiJob)
            {
                this.job.jobs[0].choose_start_location_closest_to(this.point)
            }
        }
    }

    get index()
    {
        return this.job.tasks.findIndex(t=>t.id===this.id);
    }
    set index(v)
    {
        this.id = this.job.tasks[v] ? this.job.tasks[v].id : undefined;
    }

    get isSet()
    {
        return this.id !== undefined;
    }
    set isSet(_)
    {}

    get isStartLocation()
    {
        if(!this.job.start_locations.length)
        {
          this.job.draw();
        }
        return this.percent === 0 && (this.job.start_locations.findIndex(sl=>sl.task_id === this.id) !== -1);
    }
    set isStartLocation(_)
    {}

    get point()
    {
        if(this.isStartLocation){
            return this.job.start_locations.find((l) => l.task_id === this.id).position;
        }
      if( this.percent === 0 )
        return this.task.start;
      else if( this.percent === 1 )
        return this.task.end;
      else
        return this.task.splitPercent( this.percent )[0].end;
    }
    set point(_)
    {}

    get task()
    {
        if(!this.isSet)
        {
            throw new ReferenceError("ID is not set!");
        }
        if(this.job.tasks.length === 0)
        {
          this.job.draw();
        }
        return this.job.tasks.find(t=>t.id===this.id);
    }

    reset()
    {
        this._id = undefined;
        this.percent = 0;
    }

    copy()
    {
        const n = new this.constructor(this.job, {
            beforeChangeCallback: this.beforeChangeCallback,
            afterChangeCallback: this.afterChangeCallback,
        });
        n._id = this._id;
        n.percent = this.percent;
        return n;
    }
}