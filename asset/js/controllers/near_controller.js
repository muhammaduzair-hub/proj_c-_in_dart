/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, Infinity, proj4, file_loader_screen, Projector */

const near_controller = {
  get_nearest_job_to_robot: function( jobs = [] )
  {
    const rpos = robot_controller.chosen_robot_position;
    const r_proj = robot_controller.chosen_robot.proj_string;
    if( jobs.length === 0 )
    {
      jobs = robot_controller.get_all_jobs().list;
    }

    return near_controller.get_nearest_job_to_pos( rpos, r_proj, jobs );
  },
  /**
   * @param pos {Vector} The position to find the nearest job to
   * @param proj {String} Projection string for the position
   * @param jobs {Array<Job>} The jobs to locate the nearest position in
   */
  get_nearest_job_to_pos: function( pos, proj, jobs )
  {
    if( !jobs )
      jobs = robot_controller.get_all_jobs().list;

    const positions = {};
    positions[proj] = pos;

    let nearest_dist = Infinity;
    let nearest_job, nearest_task, nearest_point, nearest_idx, proj_string, nearest_pos;
    jobs.filter(t=> !settings_screeen_controller.hide.includes(t)).forEach( function( job )
    {
      // Project pos
      if( !positions[job.projection] )
      {
        const new_pos = Projector( proj, job.projection, pos.toArray() );
        positions[job.projection] = new Vector( new_pos[0], new_pos[1] );
        //console.log( positions );
      }
      const proj_pos = positions[job.projection];

      const nearest = job.get_nearest_task( proj_pos );

      const dist = new Line( nearest.point, proj_pos ).length;
      if( dist < nearest_dist )
      {
        nearest_dist = dist;
        nearest_job = job;
        nearest_task = nearest.task;
        nearest_point = nearest.point;
        proj_string = job.projection;
        nearest_pos = proj_pos;
      }
    } );
    return {
      job: nearest_job,
      task: nearest_task,
      point: nearest_point,
      projection: proj_string,
      get percent()
      {
        return nearest_task.getNearestProcent( nearest_pos );
      },
    };
  }
};