class svg_parser extends Job {
  static template_type = "File";
  static template_title = "SVG";
  static template_id = "svg_parser";
  static template_image = "img/file_icons/svg.png";

  svg = new FileParserSVG();

  constructor( id, name, layout_method = "free_hand") {
    super( id, name, layout_method );
    var this_class = this;

    this.options.drawTasks.dontsave = false;

    this.options.Height = {
      adjustable: true,
      name: "Height",
      val: 10,
      type: "float",
      dontsave: true
    };

    this.options.AspectRatio = {
      val: 1,
      type: "float"
    };

    this.options.SVGHeight = {
      val: 1,
      type: "float"
    };
    this.options.SVGWidth = {
      val: 1,
      type: "float"
    };

    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 10,
      get val() {
        return this._val;
      },
      set val( v ) {
        this._val = v.coerce(0.5);
        this_class.options.Height.val = this._val * this_class.options.AspectRatio.val;
      },
      type: "float"
    };
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };

    this.options.AutoSplit = {
      configurable: true,
      name: "Auto split",
      val: true,
      type: "bool"
    };
    
  }

  get center() {
    return this.points[0];
  }
  
  get info_options() {
    return [ "Height" ];
  }

  static get layout_methods() {
    return {
      "center": 1,
      "free_hand": 0
    };
  }

  parseString(svg_string = "")
  {
    this.svg = this.svg.parseSync(svg_string);
  }

  copy( dont_draw ) {
    var the_copy = super.copy( true );
    the_copy.svg = this.svg.copy();
    this.copy_job_options_to_job(the_copy);
    if(!dont_draw) {
      the_copy.draw();
    }
    return the_copy;
  }

  draw() {
    if(this.options.drawTasks.val.length > 0)
    {
      this.importTasks(this.options.drawTasks.val);
    }
    else
    {
      this.tasks = this.svg.tasks.copy();
      this.options.AspectRatio.val = this.svg.height / this.svg.width;
      this.options.SVGHeight.val = this.svg.height;
      this.options.SVGWidth.val = this.svg.width;

      this.options.drawTasks.val = this.exportTasks();
    }
    
    const scale = this.options.Width.val / this.options.SVGWidth.val;

    this.tasks.forEach( ( task ) => {
      task.scale_task( scale );
      task.rotate( this.options.Angle.val );
      task.move_task( this.points[0] );
    } );

    if( this.options.AutoSplit.val ) {
      this.tasks = split_controller.split_tasks( this.tasks );
    }

    this.start_locations = [this.tasks[0].toStartLocation()];

    this.refresh_bb();
    this.refresh_snapping_lines();
    this.refresh_handles();
    this.refresh_test_run();
  }

  refresh_snapping_lines() {
    this.snapping_lines = [ ];
    var p = this.bb;

    this.snapping_lines.push( new Line( p[0], p[1] ) );
    this.snapping_lines.push( new Line( p[1], p[2] ) );
    this.snapping_lines.push( new Line( p[2], p[3] ) );
    this.snapping_lines.push( new Line( p[3], p[0] ) );

    const horizontalMiddleLeft = new Line(p[3], p[2]).middle;
    const horizontalMiddleRight = new Line(p[0], p[1]).middle;
    const verticalMiddleTop = new Line(p[3], p[0]).middle;
    const verticalMiddleBottom = new Line(p[2], p[1]).middle;

    this.snapping_lines.push(new Line(horizontalMiddleLeft, horizontalMiddleRight));
    this.snapping_lines.push(new Line(verticalMiddleTop, verticalMiddleBottom));

    for (const task of this.tasks) {
      if (   task.type === 'line' 
          && task.ends.length === 2) {
          this.snapping_lines.push(new Line(task.start, task.end));
      }
    }
  }

  refresh_handles() {
    var this_class = this;
    this.handles = [ ];
    var p = this.bb;
    // Free hand handles

    var e1 = new Line( p[0], p[1] ).middle;
    var e2 = new Line( p[2], p[3] ).middle;
    let center = this.center;
    
    this.handles.push( new Handle( center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines ) {
      this_class.points = [ new_pos_v ];
      delete this_class.calculated_drawing_points;
      this_class.draw();
      var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );
      align_this = align_this[0];
      this_class.points = [ new_pos_v.subtract( align_this ) ];
      delete this_class.calculated_drawing_points;
      this_class.draw();
    }, function( new_pos_v ) {
      this_class.points = [ new_pos_v ];
      this_class.draw();
      return true;
    } ) );

    var gml = new Line( center, p[3] ).as_vector.angle - this.options.Angle.val;
    this.handles.push( new Handle( p[3], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines ) {
      var new_angle = new Line( center, new_pos_v ).as_vector.angle - gml;
      new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];
      this_class.options.Angle.val = new_angle;
      delete this.calculated_drawing_points;
      this_class.draw();
    }, function( new_angle ) {
      return this_class.set_new_val( this_class.options.Angle, new_angle );
    }, "deg" ) );

    var lm = new Line( p[0], p[1] ).middle;
    var center_line = new Line( (new Line( p[0], p[1] )).middle, (new Line( p[2], p[3] )).middle );
if(this.options.Width.adjustable == true){
    this.handles.push( new Handle( lm, -this.options.Angle.val + Math.PI / 2, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines ) {
      var p2 = center_line.point_on_line( new_pos_v );
      var length_line = new Line( center_line.middle, p2 );
      var new_height = length_line.length * 2;
      this_class.set_new_val( this_class.options.Width, new_height, false );
    }, function( new_height ) {
      return this_class.set_new_val( this_class.options.Width, new_height, false );
    } ) );
  }
  }

  refresh_bb() {
    const verticalVector = new Vector(0, 1).rotate(this.options.Angle.val);
    const horizontalVector = verticalVector.rotate_90_cw();
    const center = this.center;
    const halfHeight = this.options.Height.val / 2;
    const halfWidth = this.options.Width.val / 2;

    let boundingBox = [];

    boundingBox[0] = center.add(verticalVector.multiply(halfHeight)).add(horizontalVector.multiply(halfWidth));
    boundingBox[1] = center.subtract(verticalVector.multiply(halfHeight)).add(horizontalVector.multiply(halfWidth));
    boundingBox[2] = center.subtract(verticalVector.multiply(halfHeight)).subtract(horizontalVector.multiply(halfWidth));
    boundingBox[3] = center.add(verticalVector.multiply(halfHeight)).subtract(horizontalVector.multiply(halfWidth));

    this.bb = boundingBox;

    // THIS CODE SAVED FOR FUTURE REFERENCE
    // var extent_corners = {
    //   min: [ Infinity, Infinity ],
    //   max: [ -Infinity, -Infinity ]
    // };
    // this.tasks.forEach( function( task )
    // {
    //   let ec = task.bounding_box();

    //   if( ec.max[0] > extent_corners.max[0] )
    //     extent_corners.max[0] = ec.max[0];
    //   if( ec.max[1] > extent_corners.max[1] )
    //     extent_corners.max[1] = ec.max[1];
    //   if( ec.min[0] < extent_corners.min[0] )
    //     extent_corners.min[0] = ec.min[0];
    //   if( ec.min[1] < extent_corners.min[1] )
    //     extent_corners.min[1] = ec.min[1];
    // });
    // this.bb = [ ];
    // this.bb.push( new Vector( extent_corners.min[0], extent_corners.min[1] ) );
    // this.bb.push( new Vector( extent_corners.min[0], extent_corners.max[1] ) );
    // this.bb.push( new Vector( extent_corners.max[0], extent_corners.max[1] ) );
    // this.bb.push( new Vector( extent_corners.max[0], extent_corners.min[1] ) );
  }

  refresh_test_run() {
    const points = this.bb;
    let tasks = [];

    const lngth = points.length;
    for (let i = 0; i < lngth; i ++) {
      if (i == lngth - 1) {
        tasks.push(new LineTask(i, [points[i], points[0]], false, false));
      }
      else {
        tasks.push(new LineTask(i, [points[i], points[i+1]], false, false));
      }
    }
    this.test_tasks = tasks;
  }

  convert_to_free_hand() {
    this.layout_method = "free_hand";
    this.draw();
  }

  can_convert_to_free_hand() {
    if (this.layout_method === "free_hand") {
      return false;
    }
    return true;
  }
}
