
/* global Infinity */

class WaypointTask extends Task
{
  constructor(id, point, reverse, paint, via=false) {
    var name = "way";
    super(id, name, [point], reverse, paint);
    this.via = via;

    this.constructorCheck();
  }

  get label_position() {
    return this.ends[0];
  }

  get label_offset() {
    return [ 0, 20 ]; // px
  }

  constructorCheck() {
    if (this.paint 
    &&  this.via) {
      this.via = false;
      console.error("Waypoint task received both paint and via - defaulting to paint!");
    }
  }

  copy() {
    var newTask = new WaypointTask(this.id, this.ends[0].copy(), this.reverse, this.paint, this.via);
    newTask.task_options = this.task_options.copy();
    newTask.action_options = this.action_options.copy();
    newTask.layer = this.layer;
    newTask.label = this.label;
    newTask.via = this.via;
    newTask.force_draw_color = this.force_draw_color;
    newTask.fluent_run_options = JSON.copy( this.fluent_run_options );
    return newTask;
  }

  static importTask(task) {
    return new WaypointTask(task.id, task.ends.map(e=>e.toVector()), undefined, task.paint, task.via);
  }
}

