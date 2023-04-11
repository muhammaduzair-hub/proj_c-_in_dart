/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, event_controller, popup_screen_controller, communication_controller, translate, APP_VERSION_NUMBER, started_with_cordova */

const auto_update_screen = {
  open: function(subMenu=null)
  {
    // auto_update_screen.updateTabletSection();
    // auto_update_screen.updateRobotSection();
    // auto_update_screen.updateUserSection();

    switch (subMenu) {
      case "auto_update_screen":
        auto_update_screen.updateTabletSection();
        auto_update_screen.updateRobotSection();
        break;
      case "user_information_screen":
        auto_update_screen.updateUserSection();
        break;
      default:
        //Do nothing
        // console.log("OPEN DID NOTHING"); // REMOVE
        break;
    }
  },

  checkAppUpdate: function( check_rc )
  {
    if(!login_screen_controller.check_login())
      return;

    auto_update_screen.update_button_disable();
    console.log( "Check for App updates" );
    try
    {
      //var updateUrl = "http://update.tinymobilerobots.com/version.xml";
      var updateUrl = "http://";
      if( communication_controller.username )
        updateUrl += communication_controller.username + ".";
      updateUrl += "appupdate.tinymobilerobots.com:8090/check";
      if( check_rc )
        updateUrl += "_rc";
      updateUrl += "/" + communication_controller.username + "/version.xml";

      function onFail()
      {
        console.log( 'fail', JSON.stringify( arguments ), arguments );
        switch( arguments[0].code )
        {
          case 301: // VERSION_RESOLVE_FAIL (version-xml file resolve fail)
          case 302: // VERSION_COMPARE_FAIL (version-xml file compare fail)
          case 404: // REMOTE_FILE_NOT_FOUND
          case 501: // NO_SUCH_METHOD
          case 901: // UNKNOWN_ERROR
            $( ".auto_update_app_message" ).html( translate["Something went wrong. Please try again later."] );
            break;
          case 405: // NETWORK_ERROR
            $( ".auto_update_app_message" ).html( translate["Network Error. Please check your connection."] );
            break;
        }
      }
      function onSuccess()
      {
        console.log( 'success', JSON.stringify( arguments ), arguments );
        auto_update_screen.update_button_enable();
        switch( arguments[0].code )
        {
          case 201: // VERSION_NEED_UPDATE (need update)
          case 203: // VERSION_UPDATING (version is updating)
            $( ".auto_update_app_message" ).html( translate["There is a newer version of the app."] );
            //auto_update_screen.update_button_disable();
            break;
          case 202: // VERSION_UP_TO_UPDATE (version up to date)
            $( ".auto_update_app_message" ).html( translate["Your app is up to date!"] );
            break;
        }
      }
      window.AppUpdate.checkAppUpdate( onSuccess, onFail, updateUrl, {
        'authType': 'basic',
        'username': 'tabletupdate',
        'password': '6pCvw@hNJFzo3Rsn3AntwNpkrFX4F7',
        'version': APP_VERSION_NUMBER,

        // 'skipPromptDialog' : true,
        // 'skipProgressDialog' : true
      } );
    }
    catch( e )
    {
      console.error( "checkAppUpdate failed" );
      $( ".auto_update_app_message" ).html( translate["Something went wrong. Please try again later."] );
    }
  },
  _update_button_disable_timer: null,
  update_button_disable: function()
  {
    $( ".auto_update_app_button" ).prop( "disabled", true );
    clearTimeout(auto_update_screen._update_button_disable_timer);
    auto_update_screen._update_button_disable_timer = setTimeout(auto_update_screen.update_button_enable,5*1000);
  },
  update_button_enable: function()
  {
    $( ".auto_update_app_button" ).prop( "disabled", false );
  },
  deleteUpdateApk: function()
  {
    var path = "file:///storage/emulated/0/download";
    var filename = "tmr.apk";

    console.log( "Attempting to delete update file", path, filename );

    try
    {
      if( started_with_cordova )
      {
        window.resolveLocalFileSystemURL( path, function( dir )
        {
          dir.getFile( filename, {
            create: false
          }, function( fileEntry )
          {
            fileEntry.remove( function()
            {
              console.log( "The update file has been removed succesfully" );
            }, function( error )
            {
              console.warn( "Error deleting the update file" );
            }, function()
            {
              console.warn( "The file doesn't exist" );
            } );
          }, function( error )
          {
            console.warn( "Error deleting the update file" );
          } );
        }, function( error )
        {
          console.warn( "Error deleting the update file" );
        } );
      }
    }
    catch( e )
    {
      console.error( e );
    }
  },
  getTabletId: function()
  {
    if( login_screen_controller.user_id )
      return  zero_pad( login_screen_controller.user_id, 4 );
    else
    {
      if( communication_controller.tabletID === '' )
      {
        var id = communication_controller.username;
        id = id.replace( 'tablet', '' );
        if( Number.isInteger( parseInt( id ) ) )
        {
          var num = parseInt( id );
          id = zero_pad( num, 4 );
        }
        communication_controller.tabletID = id;
      }
      return communication_controller.tabletID;
    }
  },
  getAppVersion: function()
  {
    var version = APP_VERSION_NUMBER;
    if( version.indexOf( "v" ) == 0 )
    {
      return version.slice( 1 );
    }
    else
    {
      return version;
    }
  },
  getVersionNumbers: function(version)
  {
    const parts = version.split("-");
    const numbers = parts[0].split(".").map(n=>parseInt(n));
    const extra = parts.length > 1 ? parts[1] : "";
    return numbers.concat([extra]);
  },
  updateTabletSection: function()
  {
    $( "#current-app-version" ).html( auto_update_screen.getAppVersion() );
    $( "#tablet-id" ).html( auto_update_screen.getTabletId() );

    auto_update_screen.update_button_enable();
    $( ".auto_update_app_message" ).text( "" );
  },
  getRobotId: function()
  {
    return zero_pad( robot_controller.chosen_robot.id, 4 );
  },

  getRobotName() {
    return robot_controller.chosen_robot.name.trim();
  },

  getRobotVersion: function()
  {
    var version = robot_controller.chosen_robot.version;
    if( version && version.indexOf( "RS" ) === 0 )
    {
      return version.slice( 2 );
    }
    else
    {
      return version;
    }
  },
  updateRobotSection: function()
  {
    if( robot_controller.chosen_robot.id > -1 )
    {
      $("#current-robot-version" ).html( translate[auto_update_screen.getRobotVersion()] );
      $(".robot-id").text(auto_update_screen.getRobotId());
      $("#auto_update_robot .robot-name").text(auto_update_screen.getRobotName());
      $("#auto_update_robot_no_robot").addClass("gone");
      $("#auto_update_robot_table").removeClass("gone");
    }
    else
    {
      $( "#auto_update_robot_no_robot" ).html( translate["No robot selected"] );
      $( "#auto_update_robot_no_robot" ).removeClass( "gone" );
      $( "#auto_update_robot_table" ).addClass( "gone" );
    }
  },
  updateUserSection: function()
  {
    $("#user_information_screen #customer_name_value").text(login_screen_controller.customer_name ? login_screen_controller.customer_name : translate["N/A"]);
    $("#user_information_screen #dealer_name_value").text(login_screen_controller.dealer_name ? login_screen_controller.dealer_name : translate["N/A"]);
    $("#user_information_screen #user_information_email_value").text(userInformationController.email ? userInformationController.email : translate["N/A"]);
  },

  openChangelog() {
    const buttonDisabled = $("#auto_update_app .app_changelog_button").hasClass("disabled");
    if (buttonDisabled) {
        settings_screeen_controller.offlInePopup();
        return;
    }
    settings_screeen_controller.choose_menu( 'auto_update_screen_header', 'app_changelog_screen', false, translate["Changelog"] );
  },

  generateChangelog() {
    const type = AppType === APP_TYPE.TinySurveyor ? "ts" : "tlm";
    const src=`http://app.tinymobilerobots.com:6288/${type}.html`;
    $("#app_changelog_screen").empty().html(`<iframe src="${src}" class="changelog"></iframe>`);
  },

  updateButtons() {
    const changelogButton = $("#auto_update_app .app_changelog_button");
    if (tablet_connection.online 
    &&  communication_controller.appServerConnection.connected) {
      changelogButton.removeClass("disabled");
    }
    else {
      changelogButton.addClass("disabled");
    }
  }
};

$(()=>{
  auto_update_screen.updateButtons();

  event_controller.add_callback( "open_settings_menu", auto_update_screen.open);
  event_controller.add_callback( "app_specific_setup_done", auto_update_screen.generateChangelog );

  event_controller.add_callback("app_server_connection_established", auto_update_screen.updateButtons);
  event_controller.add_callback("app_server_connection_lost", auto_update_screen.updateButtons);
});


