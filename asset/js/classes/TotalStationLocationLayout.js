class TotalStationLocationLayout extends Job
{
  static template_id = "totalstation_layout"; // no spaces
  static template_type = "Totalstation"; // Translateable
  static template_title = "Layout"; // Translateable
  constructor( id, name )
  {
    super( id, name, "free_hand" );
    this.interaction_type = Job.interaction_types.TOTALSTATION_LAYOUT;

    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.Translation = {
      name: "Translation",
      _val: {x:0,y:0},
      get val()
      {
        return new Vector(this._val.x, this._val.y);
      },
      set val(v)
      {
        this._val = v;
      },
      type: "vector"
    };
    this.options.TotalStationAngle = {
      name: "TotalStationAngle",
      get val()
      {
        return totalstation_controller.active ? totalstation_controller.active.posS.phi : 0;
      },
      set val(v) {},
      type: "float"
    };
    this.options.TotalStationRadius = {
      name: "TotalStationRadius",
      val: 2,
      type: "float"
    };
    this.options.FixpointRadius = {
      name: "TotalStationRadius",
      val: 1,
      type: "float"
    };

  }

  static get layout_methods()
  {
    return {
      "free_hand": 0
    };
  }
  get drawing_points()
  {
    return [this.transformed_totalstation].concat(this.transformed_fixpoints);
  }
  get center()
  {
    return this.rotated_center.add(this.options.Translation.val);
  }
  get rotated_center()
  {
    return this.relative_center.rotate(this.options.Angle.val)
  }
  get relative_center()
  {
    return math.mean( [this.totalstation].concat(this.fixpoints).map( ( p ) => {
      return p.toArray();
    } ), 0 ).toVector();
  }
  get totalstation()
  {
    return new Vector(0, 0);
  }
  get transformed_totalstation()
  {
    return this.totalstation.rotate(this.options.Angle.val).add(this.options.Translation.val);
  }
  get fixpoints()
  {
    return this.points.map(p=>new Vector(p.x, p.y));
  }
  get transformed_fixpoints()
  {
    return this.fixpoints.map(p=>p.rotate(this.options.Angle.val).add(this.options.Translation.val));
  }
  get farthest_fixpoint()
  {
    let dist = 0;
    this.fixpoints.forEach(p=>
    {
      let d = p.dist_to_point(this.totalstation);
      if(d > dist)
        dist = d;
    });
    return dist;
  }

  draw()
  {
    
    // update tasks
    this.tasks = [];

    // draw total station
    const ff = this.farthest_fixpoint;
    const sc = ff / 15 < 1 ? ff / 15 : 1;
    const tsr = this.options.TotalStationRadius.val * sc;


    const TSCircle = new Circle(this.totalstation, tsr);
    this.tasks.push(TSCircle.toArcTask(0));
    const TSLineLeft = new Line(
      new Vector(
        TSCircle.x(tsr/2)[0],
        tsr/2,
        ),
      new Vector(
        tsr/2,
        tsr/2
      )
    );
    const TSLineRight = new Line(
      new Vector(
        TSCircle.x(tsr/2)[0],
        -tsr/2,
        ),
      new Vector(
        tsr/2,
        -tsr/2
      )
    );

    this.tasks.push(new LineTask(1, [TSLineLeft.start, TSLineLeft.end, TSLineRight.end, TSLineRight.start]));
    // rotate totalstation
    this.tasks = this.tasks.map(t => {t.rotate(this.options.TotalStationAngle.val); return t; });

    // draw fixpoints
    const fpr = this.options.FixpointRadius.val * sc;
    this.fixpoints.forEach((p,i)=>{
      this.tasks.push(new Circle(p, fpr).toArcTask(10+10*i+1));
      this.tasks.push(new LineTask(10+10*i+2, [p.add(new Vector(0, fpr*1.5)), p.add(new Vector(0, -fpr*1.5))]));
      this.tasks.push(new LineTask(10+10*i+3, [p.add(new Vector(fpr*1.5, 0)), p.add(new Vector(-fpr*1.5, 0))]));
    });

    // rotate and translate all tasks
    this.tasks = this.tasks.map(t => { t.rotate(this.options.Angle.val); return t; });
    this.tasks = this.tasks.map(t => { t.move_task(this.options.Translation.val); return t; });
    this.tasks = this.tasks.map(t => { t.paint = true; return t; });

    // Update test_tasks

    this.refresh_bb();
    this.refresh_handles();
  }
  refresh_handles()
  {
    this.handles = [ ];

    // Free hand handles
    if( this.layout_method === "free_hand" )
    {
      this.handles.push( new Handle( this.drawing_points[0].add(this.rotated_center), 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v )
      {
        this.options.Translation.val = new_pos_v.subtract(this.rotated_center);
        this.draw();

      }.bind(this), function( new_pos_v )
      {
        this.options.Translation.val = new_pos_v.subtract(this.rotated_center);
        this.draw();
        return true;
      }.bind(this) ) );

      var angleOrig = this.rotated_center.angle - this.options.Angle.val;
      this.handles.push( new Handle( this.drawing_points[0].add(this.rotated_center.unit_vector.multiply(this.farthest_fixpoint+0.5)), this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v )
      {
        var new_angle = new Line( this.drawing_points[0], new_pos_v ).as_vector.angle - angleOrig;
        this.options.Angle.val = new_angle;
        this.draw();

      }.bind(this), function( new_angle )
      {
        return this.set_new_val( this.options.Angle, new_angle );
      }.bind(this), "deg" ) );
    }
  }
  convert_to_free_hand()
  {

  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
  }
  refresh_bb()
  {
    var p = this.drawing_points;

    var top = this.center.y;
    var bottom = this.center.y;
    var left = this.center.x;
    var right = this.center.x;

    p.forEach( function( p )
    {
      if( top < p.y )
        top = p.y;
      if( bottom > p.y )
        bottom = p.y;
      if( left > p.x )
        left = p.x;
      if( right < p.x )
        right = p.x;
    } );

    this.bb = [ new Vector( left, top ), new Vector( right, top ), new Vector( right, bottom ), new Vector( left, bottom ) ];
  }
}