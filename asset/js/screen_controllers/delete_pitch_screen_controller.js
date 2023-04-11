/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global pitch_generator, robot_controller, bottom_bar_chooser, popup_screen_controller, translation, AppType, communication_controller, event_controller, pop_generator, translate */

var delete_pitch_screen_controller = {
  start_delete: function(jobToDelete)
  {
    if( !communication_controller.appServerConnection.connected && !jobToDelete.can_edit_when_offline )
    {
      popup_screen_controller.confirm_popup( "Offline", "You cannot modify pitches while offline", "ok", "", popup_screen_controller.close );
      return;
    }

    if (jobToDelete instanceof MultiJob) {
      
      const amountJobs = jobToDelete.jobs.length;
      const isTLM = AppType === APP_TYPE.TinyLineMarker;
      const headerText = isTLM ? translate["headerMultiDeletePitches"].format(amountJobs) : translate["headerMultiDeleteJobs"].format(amountJobs);
      const bodyText = isTLM ? translate["bodyMultiDeletePitches"] : translate["bodyMultiDeleteJobs"];

      let nameList = [];
      jobToDelete.jobs.forEach((job)=>{
        nameList.push(job.name);
      });

      popup_screen_controller.confirmPopupWithList(
        headerText,
        bodyText,
        translate["Delete"],
        translate["Cancel"],
        ()=>delete_pitch_screen_controller.do_delete(jobToDelete),
        delete_pitch_screen_controller.cancel_delete,
        "red",
        undefined,
        false,
        false,
        "multi_delete_popup",
        nameList
      );

      $("#multi_delete_popup").addClass("animated flash");
      $("#multi_delete_popup").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
        $("#multi_delete_popup").removeClass("animated flash");
      });
    }
    else {
      popup_screen_controller.confirm_popup(
        AppType === APP_TYPE.TinyLineMarker ? translate["Delete pitch"] : translate["Delete job"],
        translate["Are you sure you want to delete"] + ' "' + jobToDelete.name + '" ?',
        translate["Delete"],
        translate["Cancel"],
        ()=>delete_pitch_screen_controller.do_delete(jobToDelete),
        delete_pitch_screen_controller.cancel_delete,
        "red",
      );
    }
  },
  
  cancel_delete: function()
  {
    popup_screen_controller.close();
  },
  do_delete: function(jobToDelete)
  {
    popup_screen_controller.close();
    popup_screen_controller.open_info_waiter(translate["Deleting"], "", "", true);
    bottom_bar_chooser.choose_bottom_bar();
    
    const arrayOfJobs = jobToDelete instanceof NullJob ? [] : (jobToDelete instanceof MultiJob ? jobToDelete.jobs : [jobToDelete]);
        
    event_controller.add_callback("db_jobs_list_updated", pitch_generator.reset);

    pitch_generator.deleteJobs(arrayOfJobs);
  },

  afterDelete() {
    pitch_generator.reset();
    popup_screen_controller.close();
    event_controller.remove_callback("db_jobs_list_updated", pitch_generator.reset);
  },

};
