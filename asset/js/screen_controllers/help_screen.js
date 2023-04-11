/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, event_controller, popup_screen_controller, app_controller, translate */

const help_screen = {
  teamviewer_app: 'com.teamviewer.host.samsung',
  teamviewer_qs: 'com.teamviewer.quicksupport.market',
  open: function( )
  {
    app_controller.check( help_screen.teamviewer_app, undefined, "#help_screen_teamviewer_section", true );
    app_controller.check( help_screen.teamviewer_qs, undefined, "#help_screen_teamviewer_qs_section", true );
    app_controller.check( shipment_prep_screen.apps.remote_support.knox_remote.package, undefined, "#help_screen_knox_remote_section", true );
    
    // if (window.cordova && device) {
    //   const androidVersion = parseInt(device.version.split(".")[0]);
    //   console.log("VERSION: ", androidVersion);
    //   if (androidVersion < 11) {
    //     $("#help_screen_send_screenshot_section").removeClass("gone");
    //   }
    // }

    if( logger.vorlonProd )
    {
      $( "#help_screen #technical_support_section_button" ).text( translate["TechnicalSupportButtonRunning"] );
      $( "#help_screen #technical_support_section_button" ).prop( 'disabled', true );
    }
    else
    {
      $( "#help_screen #technical_support_section_button" ).text( translate["TechnicalSupportButton"] );
      $( "#help_screen #technical_support_section_button" ).prop( 'disabled', false );
    }

    if(developer_screen.isSafemode)
    {
      $( "#help_screen #app_safemode_btn" ).text( translate["SafeModeDisable"] ).addClass('chosen').removeClass('dark');
    }
    else
    {
      $( "#help_screen #app_safemode_btn" ).text( translate["SafeModeEnable"] ).removeClass('chosen').addClass('dark');
    }

    help_screen.update_contact_information();
  },
  update_contact_information: function()
  {
    const fg = templateshop_controller.get_group_by_id(24);
    const rows = [];

    if(fg && fg.metadata) {
      fg.metadata.sort_objects('name').forEach(feature=>{
        feature.metadata.sort_objects(['order','key','value']).forEach(row=>{
          if(row.key && row.value)
          {
            rows.push(`<tr><td><p>${translate[row.key]}</p><td><p>${translate[row.value]}</p></td></tr>`)
          }
        })
      });
    }

    if(rows.length > 0)
    {
      $("#help_screen_support_contact_dynamic_table").empty();
      rows.forEach(row=>$("#help_screen_support_contact_dynamic_table").append(row))
      
      $("#help_screen_support_contact_text").addClass('gone');
      $("#help_screen_support_contact_default_table").addClass('gone');
      $("#help_screen_support_contact_dynamic_table").removeClass('gone');
    }
    else
    {
      $("#help_screen_support_contact_text").removeClass('gone');
      $("#help_screen_support_contact_default_table").removeClass('gone');
      $("#help_screen_support_contact_dynamic_table").addClass('gone');
    }

  },
  start_teamviewer_app: function()
  {
    console.log( "Starting Teamviewer" );
    app_controller.start( help_screen.teamviewer_app );
  },
  start_teamviewer_qs: function()
  {
    console.log( "Starting Teamviewer" );
    app_controller.start( help_screen.teamviewer_qs );
  },
  start_knox_remote: function()
  {
    console.log( "Starting Knox Remote" );
    app_controller.start( shipment_prep_screen.apps.remote_support.knox_remote.package );
  },

  open_send_screenshot()
  {
    var emailTo = localStorage.getItem( "email.to" );
    $( "#send_screenshot_popup #email_to_input" ).val( emailTo ? emailTo : "" );

    $( "#send_screenshot_popup #email_sendto_label" ).html( translate["Sendto"] + ":" );
    $( "#send_screenshot_popup #email_body_label" ).html( translate["Extrainfo"] + ":" );
    $( "#send_screenshot_popup #emailto_ok_button" ).html( translate["OK"] );
    $( "#send_screenshot_popup #emailbody_ok_button" ).html( translate["OK"] );
    $( "#send_screenshot_popup #sendto_info_label" ).html( translate["Sendscreenshot_info_popup"] );


    $( "#send_screenshot_popup #send_screenshot_header" ).html( translate["Send screenshot"] );
    $( "#send_screenshot_popup #sendto_btn" ).html( translate["Send screenshot"] );
    $( "#send_screenshot_popup #sendto_cancel_btn" ).html( translate["Cancel"] );


    file_controller.getScreenshots( screenshots => {

      if( screenshots.length )
      {
        var screenshot = screenshots.last();
        popup_screen_controller.open( "send_screenshot_popup", true );
      }
      else
      {
        popup_screen_controller.confirm_popup( translate["No screenshots available"], "", translate["OK"], "", popup_screen_controller.close );
      }


    } );
  },
  cancel_send_screenshot()
  {
    popup_screen_controller.close( "#send_screenshot_popup" );
  },
  success_send_email()
  {
    popup_screen_controller.close_info_waiter();
    popup_screen_controller.confirm_popup( translate["Screenshot has been sent"], "", translate["OK"], "", popup_screen_controller.close );
  },
  error_send_email()
  {
    popup_screen_controller.close_info_waiter();
    popup_screen_controller.confirm_popup( translate["Error sending screenshot"], "", translate["OK"], "", popup_screen_controller.close );
  },
  send_last_screenshot()
  {
    file_controller.getScreenshots( screenshots => {

      var screenshot = screenshots.last();

      var emailTo = $( "#send_screenshot_popup #email_to_input" ).val();

      var email_body = translate["Screenshot_email_body"];
      email_body += "\n\n" + $( "#send_screenshot_popup #email_extra_body" ).val();

      if( emailTo )
      {
        localStorage.setItem( "email.to", emailTo );
        let mailSettings = Object.assign({},email_config);
        mailSettings.emailTo = emailTo;
        mailSettings.attachments = [];
        mailSettings.attachmentsInBase64Format = [ screenshot.toURI() ];
        mailSettings.subject = translate["Screenshot_email_subject"].format( communication_controller.username );
        mailSettings.textBody = email_body;

        popup_screen_controller.open_info_waiter( translate["Sending screenshot"] );

        setTimeout( () => {
          smtpClient.sendMail( mailSettings, help_screen.success_send_email, help_screen.error_send_email );
        }, 1000 );

      }
      else
      {
        popup_screen_controller.confirm_popup( translate["Screenshot send cancelled"], "", translate["OK"], "", popup_screen_controller.close );
      }
    } );
  }
};


$(()=>{
  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "help_screen" )
    {
      help_screen.open();
    }
  } );

  event_controller.add_callback( "updated_featuregroups", help_screen.update_contact_information );
});