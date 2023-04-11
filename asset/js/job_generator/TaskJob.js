class TaskJob extends Job
{
  static template_type = "task";
  static template_title = "task";
  static template_id = "task";
  constructor( id, task )
  {
    super( id, task.type, "" );

    this.tasks = [ task ];
    this.original_task = task;

    this.reversed_task = task.copy();
    this.reversed_task.ends.reverse();
    this.reversed_task.clockwise = !this.reversed_task.clockwise;


    this.options["Caster front"] = {
      adjustable: true,
      name: "Caster front",
      val: true,
      type: "bool"
    };
    this.options["Reverse task"] = {
      adjustable: true,
      name: "Reverse task",
      val: false,
      type: "bool"
    };

  }
  static get template_title()
  {
    return "Task";
  }
  static get layout_methods()
  {
    return {
    };
  }

  copy( dont_draw )
  { // override if special
    var new_job = new TaskJob( this.id, this.original_task );
    new_job.options = JSON.copy( this.options );
    new_job.job_options = this.job_options.copy();
    new_job.projection = this.projection;
    new_job.proj_alias = this.proj_alias;
    if( !dont_draw )
      new_job.draw();
    return new_job;
  }

  get center()
  {
    var p = this.drawing_points;
    var g = new Line( p[0], p[1] );
    var center = g.middle;
    return center;
  }

  get drawing_points()
  {
    return this.tasks[0].ends;
  }

  refresh_bb()
  {
    var p = this.drawing_points;

    var g = new Line( p[0], p[p.length - 1] );
    var g1 = g.unit_vector;
    var g2 = g1.rotate_90_cw().multiply( 0.5 );

    var b1 = p[0].add( g2 );
    var b2 = p[p.length - 1].add( g2 );
    //g2 = g2.multiply( -1 );
    var b3 = p[p.length - 1].subtract( g2 );
    var b4 = p[0].subtract( g2 );

    //this.options.Length.val = g.length;
    //this.options.Angle.val = g.as_vector.angle;

    this.bb = [ b1, b2, b3, b4 ];
  }
  refresh_handles()
  {
    this.handles = [ ];
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
  }
  draw()
  {

    if( this.options["Reverse task"].val )
    {
      this.tasks = [ this.reversed_task ];
    }
    else
    {
      this.tasks = [ this.original_task ];
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
  }
  convert_to_free_hand()
  {

  }
}