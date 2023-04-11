class MultiSelectStateController {
  constructor(background) {
    this.background = background;
  }

  /**
   * 
   * @param {Job} jobToAdd 
   */
  toggleMultiSelect(jobToAdd)
  {
    if(this.background.jobs.active instanceof MultiJob)
    {
      this.disableMultiSelect();
    }
    else
    {
      this.enableMultiSelect(jobToAdd);
    }
  }
  enableMultiSelect(jobToAdd)
  {
    this.background.jobs.original = jobToAdd ? jobToAdd.toMultiJob() : new MultiJob();
    this.background.jobs.active = this.background.jobs.original;
  }
  disableMultiSelect()
  {
    this.exitMultiSelectPopup(this.background);
  }
  exitMultiSelectPopup(background)
  {
    setTimeout(()=>{
      popup_screen_controller.confirm_popup_with_options({
      header: AppType === APP_TYPE.TinyLineMarker ? translate["Deselecting all pitches"] : translate["Deselecting all jobs"],
      body: translate["Are you sure?"],
      ok_text: translate["Yes"],
      cancel_text: translate["No"],
      ok_callback: () => {
        background.jobs.reset();
        background.refreshh_jobs_drawing();
        popup_screen_controller.close("exit_multiselect_popup");
      },
      cancel_callback: () => {
        popup_screen_controller.close("exit_multiselect_popup");
        background.multiselect_job_list_overlay.on();
      },
      ok_class: 'red',
      popup_name: "exit_multiselect_popup"
      })
    },50);
  }
  get select_button_overlay() {
    return {
      off: function()
      {
        if( !$("#multiselect_overlay").hasClass("gone") )
        {
          $("body").removeClass('fixed');
          $("#multiselect_overlay").addClass("animated");
          $("#multiselect_overlay").removeClass("fadeInUp");
          $("#multiselect_overlay").addClass("fadeOutDown");
        }
        setTimeout(function()
        {
          $("#multiselect_overlay").addClass("gone");
          joystickScreenController.unhide("multiselect_screen_controller");
        }, 250);
      }.bind(this),
      on: function(button)
      {
        if($("#multiselect_overlay").hasClass("gone"))
        {
          this.background.remove_overlays($("#multiselect_overlay"));
          joystickScreenController.hide("multiselect_screen_controller");
  
          if (button) {
            var r = button.getBoundingClientRect();
            $( "#multiselect_overlay" ).css( "left", r.left + (r.width / 2) - ($( "#multiselect_overlay" ).outerWidth() / 2) );
          }
  
          $("#multiselect_overlay #multiselect_layer_select").attr('disabled', file_loader_screen.layers.filter(l=>!!l).length === 0)
          $("body").addClass('fixed');
          $("#multiselect_overlay").removeClass("gone");
          $("#multiselect_overlay").addClass("animated");
          $("#multiselect_overlay").removeClass("fadeOutDown");
          $("#multiselect_overlay").addClass("fadeInUp");
          $("#multiselect_overlay button").on("click", this.select_button_overlay.off);
        }
      }.bind(this),
      toggle: function(button)
      {
        if(!$("#multiselect_overlay").hasClass("gone") )
        {
          this.select_button_overlay.off();
        }
        else
        {
          this.select_button_overlay.on(button);
        }
      }.bind(this)
    }
  }
  layer_select()
  {
    this.background.multiselect_layer_overlay.createContent(
      file_loader_screen.layers.map(
        layer=>{return {name:layer, id:layer}}
      )
    );
    this.background.multiselect_layer_overlay.on();
  }
};