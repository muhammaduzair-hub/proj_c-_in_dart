class StartLocation
{
  /**
   * @param {Vector} position 
   * @param {Number} task_id 
   */
  constructor( position, task_id )
  {
    this.position = position;
    this.task_id = task_id;
  }

  copy()
  {
    return new this.constructor(this.position.copy(), this.task_id.copy());
  }
}