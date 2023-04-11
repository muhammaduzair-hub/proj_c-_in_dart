const general_settings_screen = {
  initialized: false,
  init: function()
  {
    const dot_val = general_settings_screen.settings.map_dot_type.val;
    q$("#select_map_dot_icon_content").empty();
    Background.dotIconList.forEach((icon,idx)=>{
      let html = "";
      html += `<button class="${idx!==dot_val?"bright":"chosen"} round" value="${idx}" onclick="general_settings_screen.settings.map_dot_type.setValFromDOMElement(this)">`;
      html += `<img src="${ol_svg_icons[Background.dotIconList[idx]]('#000').src}" alt="${icon}" />`;
      html += `</button>`;
      q$("#select_map_dot_icon_content").append(html);
    });
    const dot_size_val = general_settings_screen.settings.map_dot_size.val;
    q$("#select_map_dot_size_content").empty();
    [1,2,4].forEach((v,idx)=>{
      let html = "";
      html += `<button class="${v!==dot_size_val?"bright":"chosen"} round" value="${v}" onclick="general_settings_screen.settings.map_dot_size.setValFromDOMElement(this)">`;
      html += translate[["LetterSmall","LetterMedium","LetterLarge"][idx]];
      html += `</button>`;
      q$("#select_map_dot_size_content").append(html);
    });

    general_settings_screen.initialized = true;
  },
  open: function( )
  {
    if(!general_settings_screen.initialized)
    {
      general_settings_screen.init();
    }

    if( SETTINGS.changeable_auto_choose_projection )
      $( "#general_settings_screen #auto_choose_projection_inputs" ).removeClass( "gone" );
    else
      $( "#general_settings_screen #auto_choose_projection_inputs" ).addClass( "gone" );
  },
  load_stored_values: function()
  {
    general_settings_screen.all_settings_do( "load" );
  },
  restore_defaults: function()
  {
    general_settings_screen.all_settings_do( "restore_default" );
  },
  all_settings_do: function( function_name /*, args */ )
  {
    var args = Array.prototype.slice.call( arguments, 2 );
    Object.keys( general_settings_screen.settings ).forEach( ( key ) => {
      general_settings_screen.settings[key][function_name].apply( general_settings_screen.settings[key], args );
    } );
  },
  
  get showJobsFromSource() {
    let toShow = localStorage.getItem("showJobsFromSource") ? localStorage.getItem("showJobsFromSource") : "all";
    return toShow;
  },

  set showJobsFromSource(sourceType) {
    localStorage.setItem("showJobsFromSource", sourceType);
  },
  changeShowingJobsBySource(sourceType=null) {
    if(!sourceType) {
      sourceType = this.showJobsFromSource;
    }
    else {
      this.showJobsFromSource = sourceType;
    }    
    $("#general_settings_screen #show_job_types_table button").removeClass("chosen");
    $("#general_settings_screen #show_job_types_table button").addClass("bright");

    $("#general_settings_screen #tlm_show_job_types_button_" + sourceType).addClass("chosen");
    $("#general_settings_screen #tlm_show_job_types_button_" + sourceType).removeClass("bright");
    $("#general_settings_screen #ts_show_job_types_button_" + sourceType).addClass("chosen");
    $("#general_settings_screen #ts_show_job_types_button_" + sourceType).removeClass("bright");
    map_controller.background.refreshh_jobs_drawing();
  },

  settings: {
    label_state: new BoolSetting( "default_task_labels", new DefaultSetting("default_task_labels"), function( v )
    {
      map_controller.background.remove_all_pitches( );
      event_controller.call_callback( "job_labels_changed" );
      $( "#general_settings_screen #toggle_labels" ).prop( "checked", v );
    }, true,
    {
      on: function()
      {
        return robot_controller.get_all_tasks().reduce( ( total, task ) => {
          return total + (task.label !== "" ? 1 : 0);
        }, 0 ) >= 2;
      }
    },
    {
      on: function()
      {

        // Count labels
        const labels = robot_controller.get_all_tasks().reduce( ( total, task ) => {
          return total + (task.label !== "" ? 1 : 0);
        }, 0 );
        const max_label_count = 2;

        // Show popup
        //var header_text = "Enabling " + labels + " labels";
        //var body_text = "You are enabling " + labels + " labels, which can take some time for the app to process. Do you want to proceed?";
        var header_text = translate["Enabling %1s labels"].format( labels );
        var body_text = translate["Please be aware that enabling more than %1s labels may slow down the tablet."].format( max_label_count );
        popup_screen_controller.confirm_popup(
          header_text,
          body_text,
          translate["OK"],
          translate["Cancel"],
          function( )
          {
            setTimeout( function()
            {
              general_settings_screen.settings.label_state.on( true );
              popup_screen_controller.close( "#info_waiting_popup" );
            }, 1 );
            popup_screen_controller.close( "#confirm_popup" );
            popup_screen_controller.open_info_waiter( translate["Creating labels"] );
          },
          function( )
          {
            general_settings_screen.settings.label_state.off( true );
            popup_screen_controller.close( "#confirm_popup" );
          }
        );

      }
    } ),
    label_scale: new BoolSetting( "default_scale_labels", new DefaultSetting("default_scale_labels"), function( v )
    {
      map_controller.background.remove_all_pitches( );
      event_controller.call_callback( "job_labels_changed" );
      $( "#general_settings_screen #scale_labels" ).prop( "checked", v );
    } ),
    split_job: new BoolSetting( "default_split_jobs", new DefaultSetting("default_split_jobs"), function( v )
    {
      $( "#general_settings_screen #toggle_default_split" ).prop( "checked", v );
    } ),
    swap_ne: new BoolSetting( "default_swap_ne", new DefaultSetting("default_swap_ne"), function( v )
    {
      $( "#general_settings_screen #toggle_default_swap_ne" ).prop( "checked", v );
    } ),
    show_path_between_tasks: new BoolSetting( "show_path_between_tasks", new DefaultSetting("show_path_between_task"), function( v )
    {
      $( "#general_settings_screen #toggle_show_path_between_tasks" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    } ),
    auto_zoom: new BoolSetting( "default_auto_zoom", true, function( v )
    {
      $( "#general_settings_screen #toggle_auto_zoom" ).prop( "checked", v );
    } ),
    follow_robot: new BoolSetting( "default_follow_robot", false, function( v )
    {
      $( "#general_settings_screen #toggle_follow_robot" ).prop( "checked", v );
    } ),

    screen_timeout_in_manual: new IntSetting("screen_timeout_in_manual", 3, screen_lock_controller.updateScreenTimeoutInManual, true, 0, 7, 1),
    screen_timeout_in_auto: new IntSetting("screen_timeout_in_auto", 3, screen_lock_controller.updateScreenTimeoutInAuto, true, 0, 7, 1),
    low_power: new FloatSetting("low_power", 3, screen_lock_controller.updateLowPowerSlider, true, 0, 7, 1),
    
    show_dashing: new BoolSetting( "default_show_dashing", false, function( v )
    {
      $( "#general_settings_screen #show_dashing" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    },
    true,
    {
      on: () => true,
    },
    {
      on: function()
      {

        // Count labels
        const labels = robot_controller.get_all_tasks().reduce( ( total, task ) => {
          return total + (task.label !== "" ? 1 : 0);
        }, 0 );
        const max_label_count = 2;

        // Show popup
        //var header_text = "Enabling " + labels + " labels";
        //var body_text = "You are enabling " + labels + " labels, which can take some time for the app to process. Do you want to proceed?";
        var header_text = translate["Enabling line dashing"].format( labels );
        var body_text = translate["Please be aware that displaying line dashing may slow down the tablet."].format( max_label_count );
        popup_screen_controller.confirm_popup(
          header_text,
          body_text,
          translate["OK"],
          translate["Cancel"],
          function( )
          {
            setTimeout( function()
            {
              general_settings_screen.settings.show_dashing.on( true );
              popup_screen_controller.close( "#info_waiting_popup" );
            }, 1 );
            popup_screen_controller.close( "#confirm_popup" );
            popup_screen_controller.open_info_waiter( translate["Enabling line dashing"] );
          },
          function( )
          {
            general_settings_screen.settings.show_dashing.off( true );
            popup_screen_controller.close( "#confirm_popup" );
          }
        );

      }
    } ),
    show_job_task_arrows: new BoolSetting( "show_job_task_arrows", new DefaultSetting("show_job_task_arrows"), function( v )
    {
      $( "#general_settings_screen #show_job_task_arrows" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    } ),
    show_job_direction_arrows: new BoolSetting( "show_job_direction_arrows", new DefaultSetting("show_job_direction_arrows"), function( v )
    {
      $( "#general_settings_screen #show_job_direction_arrows" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    } ),
    show_background_map: new BoolSetting( "default_show_background_map", true, function( v )
    {
      $( "#general_settings_screen #show_background_map" ).prop( "checked", v );
      map_controller.background.refresh_background();

      if( !v )
      {
        $( "#general_settings_screen #show_roads_on_map" ).prop( "disabled", true );
        $( "#general_settings_screen #show_roads_on_map" ).addClass( "disabled" ); // used in toggle_proj_related_gui()
        $( "#general_settings_screen #custom_maps_button" ).prop( "disabled", true );
        $( "#general_settings_screen #custom_maps_button" ).addClass( "disabled" ); // used in toggle_proj_related_gui()
      }
      else
      {
        $( "#general_settings_screen #show_roads_on_map" ).prop( "disabled", false );
        $( "#general_settings_screen #show_roads_on_map" ).removeClass( "disabled" ); // used in toggle_proj_related_gui()
        $( "#general_settings_screen #custom_maps_button" ).prop( "disabled", false );
        $( "#general_settings_screen #custom_maps_button" ).removeClass( "disabled" ); // used in toggle_proj_related_gui()
      }
    } ),
    show_roads_on_map: new BoolSetting( "default_show_roads_on_map", false, function( v )
    {
      $( "#general_settings_screen #show_roads_on_map" ).prop( "checked", v );
      map_controller.background.refresh_background();
    } ),
    show_clusters: new BoolSetting( "default_show_clusters", true, function( v )
    {
      $( "#general_settings_screen #show_clusters" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    } ),
    show_locked_layouts: new BoolSetting( "default_show_locked_layouts", true, function( v )
    {
      $( "#general_settings_screen #show_locked_layouts" ).prop( "checked", v );
      map_controller.background.refreshh_jobs_drawing();
    } ),
    automatic_choose_projection: new BoolSetting( "auto_choose_projection", new DefaultSetting("auto_choose_projection"), function( v )
    {
      $( "#general_settings_screen #automatic_choose_projection" ).prop( "checked", v );
    } ),
    get enable_fluent_run()
    {
      return new BoolSetting( "enable_fluent_run", new DefaultSetting("enable_fluent_run"), function( v )
      {
        communication_controller.send_key_val("Fluent Run", v);
        $( "#settings_screen #enable_fluent_run_section #enable_fluent_run_yes" ).toggleClass( "chosen", v ).toggleClass( "bright", !v );
        $( "#settings_screen #enable_fluent_run_section #enable_fluent_run_no" ).toggleClass( "chosen", !v ).toggleClass( "bright", v );
        pitch_generator.reselect();
      }, true );
    },
    use_test_server_app: new BoolSetting( "use_test_server_app", false, function( v )
    {
      $( "#developer_settigs_menu #use_test_server_app" ).prop( "checked", v );
    } ),
    use_localhost: new BoolSetting( "use_localhost", false, function( v )
    {
      $( "#developer_settigs_menu #use_localhost" ).prop( "checked", v );
    } ),
    interference_filter_type: new IntSetting( "interference_filter_type", 1, function( v )
    {
      communication_controller.send_key_val("Interference Filter Version", v);
      $("#select_interference_filter_type_tlm").val(v);
      $("#select_interference_filter_type_ts").val(v);
    } ),
    napping_version: new IntSetting( "napping_version", 1, function( v )
    {
      communication_controller.send_key_val("Antinapping Version", v);
      $("#select_napping_version_tlm").val(v);
    } ),
    show_dealer_is_customer_warning: new BoolSetting( "show_dealer_is_customer_warning", true, function( v )
    {
      $( "#show_dealer_is_customer_warning_checkbox" ).prop( "checked", v );
      $( ".dealer_is_customer_indicator").toggleClass("gone", !(login_screen_controller.dealer_is_customer && v));
    } ),
    map_dot_type: new IntSetting( "map_dot_type", 0, function( v )
    {
      map_controller.background.refreshh_jobs_drawing();
      $(`#select_map_dot_icon_content button`).removeClass( "chosen" ).addClass( "bright" );
      $(`#select_map_dot_icon_content button[value=${v}]`).addClass( "chosen" ).removeClass( "bright" );
    }, true, 0, 4 ),
    map_dot_size: new IntSetting( "map_dot_size", 1, function( v )
    {
      map_controller.background.refreshh_jobs_drawing();
      $(`#select_map_dot_size_content button`).removeClass( "chosen" ).addClass( "bright" );
      $(`#select_map_dot_size_content button[value=${v}]`).addClass( "chosen" ).removeClass( "bright" );
    }, true ),
  }
};

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "general_settings_screen" )
  {
    general_settings_screen.open();
  }
} );
