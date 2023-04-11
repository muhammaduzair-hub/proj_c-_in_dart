const restore_layouts_wizard = {
    is_active: false,
    start_wizard()
    {  
      restore_layouts_wizard.open();
    },
    open()
    {
      // Open spinner popup
      popup_screen_controller.open_info_waiter(translate["Loading deleted jobs"], translate["Up to %1s days old"].format(90), "", true);

      // Add callback for getting jobs and then get jobs
      message_controller.events.add_callback("deleted_jobs",restore_layouts_wizard.draw_jobs );
      communication_controller.send("get_deleted_jobs",{"daysOld":90},"cloud");
      
      // Generate a new move layouts wizard map
      restore_layouts_wizard.background = new Background( {
        whereToPut:"#restore_layouts_wizard .wizard_map_canvas #restore_layouts_wizard_map",
        show_decorations: false,
        useLocalStorage: false,
        show_path_between: false,
        show_labels: false,
        show_multiselect_line_number: false,
        show_multiselect_reorder_handle: false,
        drawHiddenTemplates: true,
        show_locked_layouts: false
      } );

      // Show the move layouts wizard screen
      $( "#restore_layouts_wizard" ).removeClass( "gone" );
      restore_layouts_wizard.background.start_map( );

      // Mark this wizard as being active
      restore_layouts_wizard.is_active = true;
    },
    draw_jobs(msg)
    { 
      // Remove drawing callback
      message_controller.events.remove_callback("deleted_jobs",restore_layouts_wizard.draw_jobs );

      restore_layouts_wizard.background.jobLoader.load( msg.jobs, () => {
        restore_layouts_wizard.background.jobs.reset( );
      }, () => {
        popup_screen_controller.close("info_waiting_popup");
      } );
      
    },
    close: function( )
    {
      restore_layouts_wizard.background.jobs.reset( );
      delete restore_layouts_wizard.background;
      $( "#restore_layouts_wizard" ).addClass( "gone" );

      restore_layouts_wizard.is_active = false;
    }
};