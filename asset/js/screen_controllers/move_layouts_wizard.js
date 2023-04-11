const move_layouts_wizard = {
    is_active: false,
    selected_customer: -1,
    start_wizard()
    {  
      const callback = (data) => {
        popup_screen_controller.customer_selection_popup(data, move_layouts_wizard.open, translate["Move layouts from"], "", "", true);
        message_controller.events.remove_callback( "user_customers", "callback" );
      };
      message_controller.events.add_callback( "user_customers", callback );

      popup_screen_controller.open_info_waiter( translate["Getting list of customers"], "", "", true );
      communication_controller.send( "get_customers", {}, "cloud", 10 );
    },
    open(customer_id, customer_name)
    {
      if(!customer_id)
      {
        throw "Need a customer id";
      }

      // Cleanup opened popups
      popup_screen_controller.close( "#choose_customer_popup" );

      // Save selected customer for reference
      move_layouts_wizard.selected_customer = customer_id;

      // Open spinner popup
      popup_screen_controller.open_info_waiter(translate["Loading jobs from %1s"].format(customer_name), "", "", true);

      // Add callback for getting jobs and then get jobs
      message_controller.events.add_callback("db_jobs",move_layouts_wizard.draw_jobs );
      communication_controller.send("get_db_jobs",{"customer":move_layouts_wizard.selected_customer},"cloud")
      
      // Generate a new move layouts wizard map
      move_layouts_wizard.background = new Background( {
        whereToPut:"#move_layouts_wizard .wizard_map_canvas #move_layouts_wizard_map",
        show_decorations: false,
        useLocalStorage: false,
        show_path_between: false,
        show_labels: false,
        show_multiselect_line_number: false,
        show_multiselect_reorder_handle: false,
        drawHiddenTemplates: true,
        canSelectLockedJobs: true
      } );

      // Show the move layouts wizard screen
      $( "#move_layouts_wizard" ).removeClass( "gone" );
      move_layouts_wizard.background.start_map( );

      // Mark this wizard as being active
      move_layouts_wizard.is_active = true;
    },
    draw_jobs(msg)
    {
      // The topic 'db_jobs' is used for all jobs fetching, not only for move layouts wizard
      // so only begin loading the jobs if the customer matches
      if( parseInt(msg.customer_id) !== move_layouts_wizard.selected_customer ) {
        return;
      }
      
      // Remove drawing callback
      message_controller.events.remove_callback("db_jobs",move_layouts_wizard.draw_jobs );

      move_layouts_wizard.background.jobLoader.load( msg.jobs, () => {
        // move_layouts_wizard.background.zoom_to_all();
        move_layouts_wizard.background.jobs.reset( );
        // move_layouts_wizard.background.jobs.active = new MultiJob();
      }, () => {
        popup_screen_controller.close("info_waiting_popup");
      } );
      
    },
    close: function( )
    {
      move_layouts_wizard.background.jobs.reset( );
      delete move_layouts_wizard.background;
      $( "#move_layouts_wizard" ).addClass( "gone" );

      move_layouts_wizard.is_active = false;
    }
};