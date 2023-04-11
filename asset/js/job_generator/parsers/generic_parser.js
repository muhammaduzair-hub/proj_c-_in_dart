class generic_parser extends Job
{
  static template_type = "File";

  constructor( id, name, data )
  {
    super( id, name, "free_hand" );
    this.data = data;

    this._use_projection = ""; // projection string
    this._use_proj_alias = "";

    this._changed = true;

    const self = this;
    this.options.Angle = {
      name: "Angle",
      _val: 0,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this._val !== v )
        {
          self.changed = true;
          this._val = v;
        }
      },
      type: "float"
    };
    this.options.Scale = {
      name: "Scale",
      _val: 1,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this._val !== v )
        {
          self.changed = true;
          this._val = v;
        }
      },
      type: "float"
    };

    this.options.Reverse = {
      adjustable: true,
      name: "Reverse",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this._val !== v )
        {
          self.changed = true;
          this._val = v;
        }
      },
      type: "bool"
    };
    this.options.SwapNE = {
      name: "SwapNE",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this._val !== v )
        {
          self.changed = true;
          this._val = v;
        }
      },
      type: "bool"
    };
    this.options.Split = {
      get adjustable()
      {
        if( self.tasks.length > 1 )
          return true;
        else if( self.tasks[0].type === "arc3" )
          return false;
        else if( self.tasks[0].type === "line" && self.tasks[0].ends.length < 3 )
          return false;
        else
          return true;
      },
      set adjustable( v )
      {},
      name: "Split",
      _val: general_settings_screen.settings.split_job.val,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this.val !== v )
        {
          this.changed = true;
          self.changed = true;
          this._val = v;
        }
      },
      _changed: true,
      get changed()
      {
        let changed = this._changed;
        this.changed = false;
        return changed;
      },
      set changed( v )
      {
        this._changed = v;
      },
      type: "bool",
      robot_capability: "spline_task"
    };
    this.options.Offset = {
      get configurable()
      {
        return false;
        // Needs action to offset when changed
//        return self.allow_offset;
      },
      set configurable( v )
      {},
      name: "Offset",
      _val: 0,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( this._val !== v )
        {
          self.changed = true;
          this._val = v;
        }
      },
      type: "float"
    };

    this._loaded_tasks = [ ];
    this.loaded_center = [ ];
    this.loaded_bb = [ ];
    this.points = [ ];
    this.tasks = [ ];
    this.allow_revisions = false;

    this._layers = [ ];

    this.click_bounding_box = false;
    this.can_edit_when_offline = true;

    this.options.progress_string = {
      name: "progress_string",
      get val()
      {
        return `${translate["Task"]} ${(self.start_from.index + 1)}/${self.loaded_tasks.length}`;
      },
      set val( v )
      {},
      type: "string"
    };
  }

  get cloudSaveSafe() {
    return false;
  }

  get use_projection()
  {
    return this._use_projection ? this._use_projection : robot_controller.chosen_robot.projection;
  }
  set use_projection(v)
  {
    this._use_projection = v;
  }
  get use_proj_alias()
  {
    return this._use_proj_alias ? this._use_proj_alias : robot_controller.chosen_robot.proj_alias;
  }
  set use_proj_alias(v)
  {
    this._use_proj_alias = v;
  }
  get changed()
  {
    return this._changed;
  }
  set changed( v )
  {
    if( v !== this._changed )
    {
      this._changed = v;
    }
  }
  get show_advance_menu()
  {
    if( this.tasks.length > 1 )
      return true;
    else
    {
      var ok = Object.keys( this.options );
      for( var i = 0; i < ok.length; i++ )
      {
        if( this.options[ok[i]].configurable && this.options[ok[i]].name !== "Skip ignored lines" )
        {
          return true;
        }
      }
      return false;
    }
  }
  set show_advance_menu( v )
  {}
  get allow_offset()
  {
    var _allow_offset = true;

    for( var i = 0; i < this.tasks.length; i++ )
    {
      if( this.tasks[i].type === "way" )
      {
        _allow_offset = false;
        break;
      }
    }

    if( !robot_controller.robot_has_capability( "ellipse_task_offset" ) )
    {
      for( var i = 0; i < this.tasks.length; i++ )
      {
        if( this.tasks[i].type === "ellipse" )
        {
          _allow_offset = false;
          break;
        }
      }
    }
    return _allow_offset;
  }
  set allow_offset( v )
  {
  }
  set loaded_tasks( val )
  {
    this._loaded_tasks = this.clean_task_ids( val );
    this.tasks = this._loaded_tasks.copy();
    this.loaded_center = this.center;
    this.refresh_bb( this.loaded_tasks );
    this.loaded_bb = this.bb.copy();
    this.points = [ this.loaded_center ];
  }
  get loaded_tasks()
  {
    return this._loaded_tasks;
  }
  get center()
  {
    return !this.options.SwapNE.val ? this.calc_center() : this.calc_center().mirror();
  }
  get drawing_points()
  {
    return this.tasks[0].ends;
  }
  get info_options()
  {
    return [ "progress_string" ];
  }
  get layers()
  {
    if( !this._layers.length )
    {
      var lays = {};
      this.loaded_tasks.forEach( function( task )
      {
        lays[task.layer] = 1;
      } );
      this._layers = Object.keys( lays );
    }
    return this._layers;
  }

  get template_type()
  {
    return this.start_from.isSet ? this.start_from.task.label : this.tasks[0].label;
  }
  set template_type( val )
  {

  }

  clean_task_ids( tasks )
  {
    for( let i = 0; i < tasks.length; i++ )
    {
      tasks[i].id = i;
    }
    return tasks;
  }

  single_waypoint()
  {
    if( this.tasks.length === 1 && this.tasks[0].type === "way" )
      return true;
    else
      return false;
  }

  calc_center( use_these_tasks )
  {
    if( !use_these_tasks )
      use_these_tasks = this.tasks;
    this.refresh_bb( use_these_tasks );

    var center = new Vector( 0, 0 );
    this.bb.forEach( function( c )
    {
      center = center.add( c );
    } );
    center = center.divide( this.bb.length );
    return center;
  }
  static get layout_methods()
  {
    return {
      "center": 1,
      "free_hand": 0
    };
  }

  /**
   * 
   * @param {Boolean} dont_draw Don't envoke draw method at copy
   * @returns {Job} Copy of job
   */
  copy( dont_draw )
  {
    const new_job = super.copy(true);
    new_job.data = this.data;
    new_job._loaded_tasks = this._loaded_tasks.copy();
    new_job.loaded_center = this.loaded_center.copy();
    new_job.loaded_bb = this.loaded_bb.copy();


    new_job.template_type = this.template_type;

    if( !dont_draw )
      new_job.draw();
    return new_job;
  }

  make_side_copy( i, space, n )
  {
    var plus = this.bb[0].subtract( this.bb[2] );
    if( i % 2 )
    {
      plus = Math.abs( plus.y );
    }
    else
    {
      plus = Math.abs( plus.x );
    }
    plus = 0;

    var angle = this.options.Angle ? this.options.Angle.val : 0;

    const job_copy = this.copy();
    let g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  make_offset_copy( i, space )
  {

    if( i % 2 )
    {
      var offset_direction = true;
    }
    else
    {
      var offset_direction = false;
    }

    // Calculate the offset with direction
    space = space * (offset_direction ? 1 : -1);
    if( this.loaded_tasks[0].type === "ellipse" )
    {
      space += this.options.Offset.val;
    }
    
    return (new JobOffsetCopy(this, space)).result();
  }
  get offset_handle_angle()
  {
    if( this.tasks.length === 1 && this.tasks[0].type === "ellipse" )
    {
      return this.loaded_tasks[0].offset_handle_angle - this.options.Angle.val;
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "arc3" )
    {
      return this.loaded_tasks[0].offset_handle_angle - this.options.Angle.val;
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "line" )
    {
      var l = new Line( this.tasks[0].ends[0], this.tasks[0].ends[1] );
      return -l.angle + Math.PI/2;
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "spline" )
    {
      return -this.loaded_tasks[0].offset_handle_angle - this.options.Angle.val;
    }
    if( this.tasks.length > 1 )
    {
      var l = new Line( this.tasks[0].ends[0], this.tasks[0].ends[1] );
      return -l.angle + Math.PI/2;
    }
  }
  get offset_handle_pos()
  {
    if( this.tasks.length === 1 && this.tasks[0].type === "ellipse" )
    {
      return this.tasks[0].offset_handle_pos;
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "arc3" )
    {
      return this.tasks[0].offset_handle_pos;
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "line" )
    {
      var l = new Line( this.tasks[0].ends[0], this.tasks[0].ends[1] );
      return l.normal_vector.multiply( this.offset ).add( l.middle );
    }
    if( this.tasks.length === 1 && this.tasks[0].type === "spline" )
    {
      return this.tasks[0].offset_handle_pos;
    }
    if( this.tasks.length > 1 )
    {
      return new Line( this.tasks[0].ends[0], this.tasks[0].ends[1] ).middle;
    }
  }

  draw( force_no_split )
  {
    if( !this.changed )
    {
      console.warn( "Draw", "call redundant", this.id );
      return;
    }
    else
    {
      console.log( "Draw", "job changed" );
      this.changed = false;
    }

    if( !this.loaded_tasks.length )
    {
      console.warn( "Cannot draw job with 0 tasks" );
      return;
    }

    console.log( "Draw", "job", this.id );

    const self = this;

    this.tasks = this.loaded_tasks.copy();

    this.tasks = this.tasks.copy().map( function( task )
    {
      task.offset = self.options.Offset.val * self.options.Scale.val;

      task.ends = task.ends.map( function( end )
      {
        return self.transform( end );
      } );

      if( task.type === "spline" )
      {
        task.length *= self.options.Scale.val;
      }

      if( task.center )
      {
        task.center = self.transform( task.center );
      }
      if( self.options.SwapNE.val && task.clockwise )
      {
        task.clockwise = !task.clockwise;
      }
      if( self.options.SwapNE.val && task.type === "arc3" && self.tasks.length === 1 )
      {
        task.ends = task.ends.reverse();
      }

      if( self.options.Reverse.val )
      {
        task = task.opposite_direction;
      }

      return task;
    } );

    // Reverse task order
    if( self.options.Reverse.val )
    {
      this.tasks.reverse();
      this.start_locations = [];
    }

    this.tasks = split_controller.split_tasks( this.tasks, !this.options.Split.val, force_no_split );

    // Add minimum one start location (needed for UI)
    this.start_locations.push( new StartLocation(this.tasks[0].start, this.tasks[0].id) );
    if( this.tasks[0].id !== this.tasks.last().id && !this.tasks[0].start.veryclose(this.tasks.last().end) )
    {
      this.start_locations.push( new StartLocation(this.tasks.last().end, this.tasks.last().id) );
    }

    this.refresh_bb();
    this.refresh_handles();
  }
  transform( point )
  {
    var translate = this.points.length ? this.points[0].subtract( this.loaded_center ) : new Vector( 0, 0 );

    var new_point = point;
    new_point = new_point.subtract( this.loaded_center );
    if( this.options.SwapNE.val )
      new_point = new_point.mirror();
    new_point = new_point.multiply( this.options.Scale.val );
    new_point = new_point.rotate( this.options.Angle.val );
    new_point = new_point.add( this.loaded_center );

    if( translate )
      new_point = new_point.add( translate );

    return new_point;
  }
  refresh_handles()
  {

    this.handles = [ ];
    const self = this;

    var drawing_center = this.transform( this.loaded_center );

    // Move handle
    this.handles.push( new Handle( drawing_center, -this.options.Angle.val, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
    {

      self.points = [ new_pos_v ];
      delete self.calculated_drawing_points;
      self.draw();

      var align_this = self.get_align_move( self.snapping_lines, snapping_lines );

      align_this = align_this[0];

      self.points = [ new_pos_v.subtract( align_this ) ];
      delete self.calculated_drawing_points;
      self.changed = true;
      self.draw();

    }, function( new_pos_v )
    {

      self.points = [ new_pos_v ];
      self.changed = true;
      self.draw();
      return true;
    } ) );


    // If WAYPOINT the don't show rotate and scale handles
    if( this.single_waypoint() )
      return;

    // Rotate
    var rotate_handle_center = this.tasks[0].ends[0];
    if( this.tasks[0].type === "ellipse" )
      rotate_handle_center = this.tasks[0].major_offset.add( this.center );

    var gml = new Line( drawing_center, rotate_handle_center ).as_vector.angle - this.options.Angle.val;
    this.handles.push( new Handle( rotate_handle_center, -this.options.Angle.val + Math.PI / 2, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
    {

      var new_angle = new Line( drawing_center, new_pos_v ).as_vector.angle - gml;
      new_angle = self.get_snap_rotation( new_angle, snapping_lines )[0];

      self.options.Angle.val = new_angle;
      delete this.calculated_drawing_points;
      self.changed = true;
      self.draw();

    }, function( new_angle )
    {
      return self.set_new_val( self.options.Angle, new_angle );
    }, "deg" ) );



    // Scale
    var orig_length = this.loaded_center.subtract( this.loaded_bb[0] ).length;

    var scale_handle_center = this.tasks[this.tasks.length - 1].ends[this.tasks[this.tasks.length - 1].ends.length - 1];
    if( this.tasks[0].type === "ellipse" )
    {
      orig_length = this.loaded_tasks[0].major_offset.length;
      scale_handle_center = this.tasks[0].major_offset.rotate_180().add( this.center );
    }
    if( scale_handle_center === rotate_handle_center || scale_handle_center.dist_to_point( rotate_handle_center ) < 0.5 )
      scale_handle_center = scale_handle_center.subtract( this.center ).rotate_180().add( this.center );

    this.handles.push( new Handle( //  position, angle, name, icon, chosen_icon, on_drag, on_new_val, units
      scale_handle_center,
      -this.options.Angle.val - Math.PI / 4,
      "Scale",
      "move_handle_onedirection",
      "yellow_move_handle_onedirection",
      function( new_pos_v, snapping_lines )
      {
        var new_length = drawing_center.subtract( new_pos_v ).length;
        self.set_new_val( self.options.Scale, new_length / orig_length );
      },
      function( new_scale )
      {
        return self.set_new_val( self.options.Scale, new_scale );
      }, "" ) );

  }
  set_new_val( option, new_val )
  {
    if( option.name === "Angle" || new_val > 0 )
    {
      option.val = new_val;
      self.changed = true;
      this.draw();
      return true;
    }
    return false;
  }
  refresh_bb( use_these_tasks )
  {

    if( !use_these_tasks )
      use_these_tasks = this.tasks;

    var extent_corners = {
      min: [ Infinity, Infinity ],
      max: [ -Infinity, -Infinity ]
    };

    self = this;

    use_these_tasks.forEach( function( task )
    {
      var corners = [ ];

      task.offset = self.options.Offset.val * self.options.Scale.val;

      if( task.type === "spline" )
      {
        for( var i = 0; i <= 20; i++ )
        {
          corners.push( task.getPointAtProcent( 1 / 20 * i ) );
        }
      }
      else if( task.type === "ellipse" )
      {
        corners.push( task.major_offset.add( task.minor_offset ).add( task.center ) );
        corners.push( task.major_offset.subtract( task.minor_offset ).add( task.center ) );
        corners.push( task.major_offset.rotate_180().add( task.minor_offset ).add( task.center ) );
        corners.push( task.major_offset.rotate_180().subtract( task.minor_offset ).add( task.center ) );
      }
      else if( task.type === "arc3" && task.ends.length === 2 )
      {
        corners.push( task.ends[0].subtract( task.center ).add( task.ends[0].subtract( task.center ).rotate_90_cw() ).add( task.center ) );
        corners.push( task.ends[0].subtract( task.center ).add( task.ends[0].subtract( task.center ).rotate_90_ccw() ).add( task.center ) );
        corners.push( task.ends[1].subtract( task.center ).add( task.ends[1].subtract( task.center ).rotate_90_cw() ).add( task.center ) );
        corners.push( task.ends[1].subtract( task.center ).add( task.ends[1].subtract( task.center ).rotate_90_ccw() ).add( task.center ) );
      }
      else
      {
        corners = task.ends;
      }
      corners.forEach( function( corner )
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
    } );

    this.bb = [ ];
    this.bb.push( new Vector( extent_corners.min[0], extent_corners.min[1] ) );
    this.bb.push( new Vector( extent_corners.min[0], extent_corners.max[1] ) );
    this.bb.push( new Vector( extent_corners.max[0], extent_corners.max[1] ) );
    this.bb.push( new Vector( extent_corners.max[0], extent_corners.min[1] ) );
  }

  toPointJob()
  {
    let new_job = new PointJob(this.id, this.name, "from_file");

    new_job.source = this.source;
    
    new_job.allow_revisions = false;
    
    new_job.waypoint_options = this.tasks.map((task)=>{
      var options = {'paint': task.paint, 'action_options': task.action_options, 'task_options': task.task_options};
      return options;
    });

    var lngth = this.tasks.length;
    for( var i = 0; i < lngth; i++ )
    {
      new_job.points.push( this.tasks[i].ends[0] );
      new_job.labels.push( this.tasks[i].label );
    }

    new_job.projection = this.projection;
    new_job.proj_alias = this.proj_alias;

    return new_job;
  }

  get locked()
  {
    return false;
  }
}