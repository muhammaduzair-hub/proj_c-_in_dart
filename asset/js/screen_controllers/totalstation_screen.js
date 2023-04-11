/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global settings_screeen_controller, totalstation_controller, position_settings_screen, popup_screen_controller, login_screen_controller, translate, event_controller, q$val, q$, q$text, file_loader_screen, DEBUG_MODE, file_controller, totalstation_location_controller */

const totalstation_screen = {
  _test_mode: false,
  _importing_fixpoints: false,
  get test_mode()
  {
    return q$("#enable_ts_test_mode").prop( "checked" ) || totalstation_screen._test_mode;
  },
  _use_data_freq: 20,
  change_data_frequency: function(freq)
  {
    if(!(freq === 20 || freq === 10 || freq === 5))
      throw "Frequency must be 20, 10 or 5";

    $("#developer_settigs_menu #ts_freq_20Hz").prop('checked', false);
    $("#developer_settigs_menu #ts_freq_10Hz").prop('checked', false);
    $("#developer_settigs_menu #ts_freq_5Hz").prop('checked', false);
    $(`#developer_settigs_menu #ts_freq_${freq}Hz`).prop('checked', true);
    totalstation_screen._use_data_freq = freq;
  },
  front_page_interval: null,
  open: function( )
  {
    settings_screeen_controller.choose_menu( 'totalstation_screen_header', 'totalstation_screen_front', false, translate["Total station"] );

    if( totalstation_screen.test_mode )
      totalstation_controller.test( true );

    totalstation_screen.update_connected();
    totalstation_screen.update_position();
    totalstation_screen.update_robot_tracking();
    totalstation_screen.update_robot_ready();
    totalstation_screen.front_page_interval = setInterval( () => {
      totalstation_screen.update_position();
      totalstation_screen.update_robot_tracking();
      totalstation_screen.update_robot_ready();
    }, 2000 );
  },
  update_connected: function()
  {
    const ready = totalstation_controller.active && totalstation_controller.active.ready;
    $( "#totalstation_screen_front_connected_header i.material-icons" ).text( ready?'sensors':'sensors_off' );

    let content = "";
    content += `<section class="row" style="margin-bottom: 0;">`;
    if( ready )
    {
      content += `<div><p class="working">${translate["Total station %1s connected"].format(totalstation_controller.active.name)}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
//      content += `<button class="dark" onclick="totalstation_screen.device_settings()">${translate["Settings"]}</button>`;
      content += `<button class="red" onclick="totalstation_screen.disconnect_device()">${translate["Disconnect"]}</button>`;
      content += `<button class="dark" onclick="totalstation_screen.open_connect()">${translate["Select other"]}</button>`;
    }
    else
    {
      content += `<div><p class="warning">${translate["No total station connected"]}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
      if( totalstation_controller.active )
      content += `<button class="chosen" onclick="totalstation_screen.connect_device('${totalstation_controller.active.bt.name}','${totalstation_controller.active.bt.mac}',${true})">${translate["Connect previous"]}</button>`;
      content += `<button class="dark" onclick="totalstation_screen.open_connect()">${translate["Select"]}</button>`;
    }
    content += `</div><div class="flex_fill"></div></aside>`;
    content += `</section>`;
    $( "#totalstation_screen_front_connected div.list" ).html( content );
  },
  update_position: function()
  {
    const ready = totalstation_controller.active && totalstation_controller.active.ready && totalstation_location_controller.active;
    $( "#totalstation_screen_front_position_header i.material-icons" ).text( ready?'location_on':'location_off' );

    let content = "";
    content += `<section class="row" style="margin-bottom: 0;">`;
    if( ready )
    {
      content += `<div><p class="working">${translate["Using '%1s'"].format( totalstation_location_controller.active.name )}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
      if( AppType === APP_TYPE.TinySurveyor )
        content += `<button class="red" onclick="totalstation_screen.deselect_location()">${translate["Deselect"]}</button>`;
      content += `<button class="dark" onclick="totalstation_screen.open_location_list()">${translate["Select other"]}</button>`;
    }
    else
    {
      content += `<div><p class="warning">${translate["No location selected"]}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
      content += `<button class="dark" onclick="totalstation_screen.open_location_list()"${totalstation_controller.active && totalstation_controller.active.ready || totalstation_screen.test_mode ? '' : ' disabled="disabled"'}>${translate["Select"]}</button>`;
    }
    content += `</div><div class="flex_fill"></div></aside>`;
    content += `</section>`;
    $( "#totalstation_screen_front_position div.list" ).html( content );
  },
  get robot_tracking_ready()
  {
    return totalstation_controller.active && totalstation_controller.active.robot_lock;
  },
  update_robot_tracking: function()
  {
    const position_ready = totalstation_location_controller.active && totalstation_location_controller.active.is_positioned;

    $( "#totalstation_screen_front_robot_header i.material-icons" ).text( totalstation_screen.robot_tracking_ready ? 'gps_fixed' : 'gps_off' );

    let content = "";
    content += `<section class="row" style="margin-bottom: 0;">`;
    if( totalstation_screen.robot_tracking_ready )
    {
      content += `<div><p class="working">${translate["Robot prism is being tracked"]}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
      content += `<button class="red" onclick="totalstation_controller.track_robot_stop()">${translate["Stop"]}</button>`;
    }
    else
    {
      content += `<div><p class="warning">${translate["Robot prism not currently tracked"]}</p><p>${translate["CollectRobotPrismHelpText"].format(`<b>${translate["Track"]}</b>`)}</p></div>`;
      content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
      content += `<button class="dark" onclick="totalstation_controller.track_robot_start()"${totalstation_controller.active && totalstation_controller.active.ready && (AppType === APP_TYPE.TinySurveyor || position_ready ) ? '' : ' disabled="disabled"'}>${translate["Track"]}</button>`;
    }
    content += `</div><div class="flex_fill"></div></aside>`;
    content += `</section>`;

    $( "#totalstation_screen_front_robot div.list" ).html( content );
  },
  update_robot_ready: function()
  {
    const ready = totalstation_controller.active && totalstation_controller.active.robot_lock;
    const position_ready = totalstation_location_controller.active && totalstation_location_controller.active.is_positioned;

    $( "#totalstation_screen_front_robot_ready_header i.material-icons" ).text( ready?'check_box':'check_box_outline_blank' );

    let content = "";

    content += `<section class="row" style="margin-bottom: 0;">`;
    if( ready && position_ready )
      content += `<div><p class="working">${translate["Robot ready"]}</p></div>`;
    else
      content += `<div><p class="warning">${translate["Robot not ready"]}</p></div>`;
    content += `</section>`;

    $( "#totalstation_screen_front_robot_ready div.list" ).html( content );
  },
  open_connect: function( )
  {
    totalstation_controller.reset_nearby_totalstations();
    $( "#totalstation_screen_connect_nearby div.list" ).empty();

    // Existing total stations
    const tsk = Object.keys( totalstation_controller.totalstations );
    let content = '';
    if( tsk.length === 0 )
      content = `<section class="row first-child"><div><p>${translate["No previous total stations"]}</p></div></section>`;
    else
      content = tsk.reduce( ( accu, curr ) => accu + totalstation_screen.generate_connect_row( totalstation_controller.totalstations[curr].bt, true ), "" );

    $( "#totalstation_screen_connect_previous div.list" ).html( content );

    // New total stations
    event_controller.add_callback( "got_nearby_totalstations", totalstation_screen.update_connect_nearby );
    totalstation_controller.get_nearby_totalstations();

    settings_screeen_controller.choose_menu( 'totalstation_screen_header', 'totalstation_screen_connect', false, translate["Connect"] );
  },
  close_connect: function()
  {
    event_controller.remove_callback( "got_nearby_totalstations", totalstation_screen.update_connect_nearby );
    clearInterval( totalstation_screen.front_page_interval );
  },
  update_connect_nearby: function( devices )
  {
    const content = devices.reduce( ( accu, curr ) => accu + totalstation_screen.generate_connect_row( curr, false ), "" );
    $( "#totalstation_screen_connect_nearby div.list" ).html( content );
    totalstation_controller.get_nearby_totalstations();
  },
  generate_connect_row: function( device, existing )
  {
    let content = "";

    content += `<section class="row">`;
    content += `<div><p>${device.name}</p></div>`;
    content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
    content += `<button class="dark" onclick="totalstation_screen.connect_device('${device.name}','${device.mac}',${existing}, '${true}')">${translate["Connect"]}</button>`;
    content += `</div><div class="flex_fill"></div></aside>`;
    content += `</section>`;

    return content;
  },
  connect_device( name, mac, existing )
  {
    if( !existing )
    {
      totalstation_controller.create_totalstation_from_nearby( mac );
    }

    totalstation_controller.set_active( name );
    totalstation_controller.active.connect();
    totalstation_screen.open();
  },
  disconnect_device()
  {
    totalstation_controller.active.disconnect();
  },

  open_location_list: function()
  {
    settings_screeen_controller.choose_menu( 'totalstation_screen_header', 'totalstation_screen_location_list', false, translate["Locations"] );
  },
  update_location_list: function()
  {
    let content = "";

    content += `<section id="totalstation_screen_location_list_head">`;
    content += `<header><h2>${translate["Locations"]}</h2></header>`;
    content += `<p>${translate["ChooseLocationHelpText"]}</p>`;
    // content += '<p id="actions">';
    // content += `<button class="dark" onclick="totalstation_screen.add_location()">${translate["Add location"]}</button>`;
    // if( false && login_screen_controller.user_level === 0 )
    //   content += `<button class="dark" onclick="totalstation_screen.demo()">DEMO</button>`;
    // content += '</p>';
    content += `</section>`;
    content += totalstation_location_controller.get_all().reduce( ( accu, curr ) => accu + totalstation_screen.generate_location_list_row( curr, false ), "" );
    content += `<section class="row"><div></div><aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill"><button class="dark" onclick="totalstation_screen.import_csv()">${translate["Import CSV file"]}</button><button class="dark" onclick="totalstation_screen.add_location()">${translate["Add location"]}</button></div><div class="flex_fill"></div></aside></section>`
    $( "#totalstation_screen_location_list.list" ).html( content );
  },
  import_csv(){
      createJobMenuController.importHelper(); 
      totalstation_screen._importing_fixpoints = true;
  },
  imported_csv_handling(){
    totalstation_screen._importing_fixpoints = false;
    let loaded_file = file_loader_screen.loaded_files[0];
    let csv_location = new TotalStationLocation(loaded_file.name, "CSV imported file",{
      _fixpoints : loaded_file.points,
      fixpoint_labels : loaded_file.labels,
      _projection : loaded_file.use_projection
    });
    totalstation_location_controller.edit( csv_location, false, false, true );
    totalstation_screen.update_location_list();
  },
  demo: function()
  {
    totalstation_location_controller.test();
    totalstation_screen.update_location_list();
  },
  generate_location_list_row: function( location )
  {
    let content = "";

    content += `<section class="row">`;
    content += `<div>`;
    content += `<header><h2>${location.name}</h2></header>`;
    if( location.description )
      content += `<p>${location.description}</p>`;
    content += `</div>`;
    content += `<aside class="buttons"><div class="flex_fill"></div><div class="flex_no_fill">`;
    if( totalstation_location_controller.active && location.name === totalstation_location_controller.active.name && !totalstation_location_controller.active.fixplate )
      content += `<button class="chosen" onclick="totalstation_screen.reconfigure_location('${location.name}')">${translate["Reconfigure"]}</button>`;
    content += `<button class="dark" onclick="totalstation_screen.edit_location('${location.name}')">${translate["Edit"]}</button>`;
    content += `<button class="red" onclick="totalstation_screen.delete_location('${location.name}')">${translate["Delete"]}</button>`;
    if( totalstation_location_controller.active && location.name === totalstation_location_controller.active.name )
      content += `<button class="red" onclick="totalstation_screen.deselect_location()">${translate["Deselect"]}</button>`;
    else
      content += `<button class="dark" onclick="totalstation_screen.select_location('${location.name}')">${translate["Select"]}</button>`;
    content += `</div><div class="flex_fill"></div></aside>`;
    content += `</section>`;

    return content;
  },

  _selecting_location: false,
  select_location: function( location_name )
  {
    totalstation_screen._selecting_location = true;
    totalstation_location_controller.set_active( location_name );
    if(!totalstation_location_controller.active.fixplate)
      totalstation_screen.open_location_setup();
    else
    {
      totalstation_screen._state = "setup";
      totalstation_screen.transfer_fixpoints( true );
      totalstation_controller.active.fixpoints_lock();
      totalstation_controller.active.fixpoints.current = Array.from( totalstation_screen.active_location.fixpoints );
      // totalstation_controller.active.fixpoints_to_current();
      totalstation_screen.save_selection();
    }
  },
  reconfigure_location: function(location_name)
  {
    totalstation_screen._selecting_location = false;
    totalstation_location_controller.set_active( location_name );
    totalstation_screen.open_location_setup();
  },
  deselect_location()
  {
    totalstation_location_controller.set_active();
    totalstation_controller.active.fixpoints_reset();
    totalstation_screen.update_location_list();
    totalstation_screen.update_position();
  },
  add_location: function()
  {
    totalstation_screen.edit_location( null );
  },
  edit_location: function( location_name )
  {
    totalstation_screen.open_edit_page( location_name, false );
  },
  copy_location: function( location_name )
  {
    totalstation_screen.open_edit_page( location_name, true );
  },
  change_fixplate: function( state )
  {
    if(state === true || state === 'yes')
    {
      totalstation_screen._location.fixplate = true;
      q$( "#totalstation_screen_location_edit_form_fixed_yes" ).removeClass('bright').addClass('chosen');
      q$( "#totalstation_screen_location_edit_form_fixed_no" ).removeClass('chosen').addClass('bright');
    }
    else
    {
      totalstation_screen._location.fixplate = false;
      q$( "#totalstation_screen_location_edit_form_fixed_yes" ).removeClass('chosen').addClass('bright');
      q$( "#totalstation_screen_location_edit_form_fixed_no" ).removeClass('bright').addClass('chosen');
    }
    totalstation_screen.update_fixpoints();
  },

  edit_back: function( callback )
  {
    const ok = function()
    {
      // if( totalstation_screen._selecting_location && (totalstation_controller.active.fixpoints.current.filter(p=>!undefined).length - totalstation_screen.cleared_fixpoints.length) !== totalstation_controller.active.fixpoints.original_length )
      if( totalstation_screen._selecting_location )
      {
        totalstation_screen.deselect_location();
      }

      popup_screen_controller.close();
      if( callback )
        callback();
      else
        settings_screeen_controller.breadcrumb.back( true );
      // totalstation_screen._location = null;
    };
    const cancel = function()
    {
      popup_screen_controller.close();
    };

    if( totalstation_screen.edit_page_diff() )
      popup_screen_controller.confirm_popup( translate["WarningUnsavedData"], "", translate["OK"], translate["Cancel"], ok, cancel );
    else
      ok();
  },
  delete_location: function( location_name )
  {
    popup_screen_controller.confirm_popup(
      translate["WarningCustomLocationDelete"],
      "",
      translate["Delete"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();

        if( totalstation_location_controller.active && location_name === totalstation_location_controller.active.name )
          totalstation_screen.deselect_location();
        totalstation_location_controller.remove( location_name );
        totalstation_location_controller.save();
        totalstation_screen.open_location_list();
      },
      function()
      {
        popup_screen_controller.close();
      },
      "red"
    );
  },
  _location: null,
  _location_original: null,
  _state: null,
  _init_edit_page: false,
  init_edit_page: function()
  {
    if( totalstation_screen._init_edit_page )
      return;

    totalstation_screen._init_edit_page = true;
  },
  open_edit_page: function( location_name, copy )
  {
    totalstation_screen.init_edit_page();

    if( location_name && copy )
      totalstation_screen._state = "copy";
    else if( location_name )
      totalstation_screen._state = "edit";
    else
      totalstation_screen._state = "add";

    console.log( "Location", totalstation_screen._state );

    totalstation_screen._location = null;
    totalstation_screen._location_original = null;

    if( totalstation_screen._state !== "add" )
    {
      totalstation_screen._location = totalstation_location_controller.locations[location_name].copy();

      if( totalstation_screen._state === "copy" )
        totalstation_screen._location.name += ` (${translate["ItemCopy"]})`;

      totalstation_screen._location_original = totalstation_screen._location.copy();
      totalstation_screen.refresh_page_content( totalstation_screen._location );
    }
    else
    {
      totalstation_screen._location = new TotalStationLocation("Dummy");
    }

    totalstation_controller.active.fixpoints_unlock();

    // Reset form
    q$( "#totalstation_screen_location_edit_form" ).get( 0 ).reset();
    totalstation_screen.change_fixplate();

    totalstation_screen.open_location_page();
  },
  open_location_page: function()
  {
    if( totalstation_screen._state === "setup" )
    {
      q$( "#totalstation_screen_location_edit_page_header" ).text( translate["Setting up %1s"].format( totalstation_screen.active_location.name ) );
      q$( "#totalstation_screen_location_edit_page_description" ).removeClass( 'gone' ).text( totalstation_screen.active_location.description );
      q$( "#totalstation_screen_location_edit_form_section" ).addClass( 'gone' );
      q$( "#totalstation_screen_location_edit_form_add_fixpoint").addClass( 'gone'); 
    }
    else
    {
      q$( "#totalstation_screen_location_edit_page_header" ).text( totalstation_screen._location && totalstation_screen._location.name ? translate["Edit location"] : translate["Add location"] );
      q$( "#totalstation_screen_location_edit_page_description" ).addClass( 'gone' );
      q$( "#totalstation_screen_location_edit_form_section" ).removeClass( 'gone' );
      q$( "#totalstation_screen_location_edit_form_add_fixpoint").removeClass( 'gone');
      //Filling up of edit form with latest saved details
      if(totalstation_screen._state === "edit"){
        q$( "#totalstation_screen_location_edit_form_name").val(totalstation_screen.active_location.name);
        q$( "#totalstation_screen_location_edit_form_description").val(totalstation_screen.active_location.description);
      }
    }

    totalstation_controller.track_robot_stop();

    totalstation_screen.clear_all_fixpoints();

    if( totalstation_screen._state !== "setup" )
      totalstation_screen.transfer_fixpoints( false );

    settings_screeen_controller.choose_menu( 'totalstation_screen_header', 'totalstation_screen_location_edit', false, q$text( "#totalstation_screen_location_edit_page_header" ).text() );
    totalstation_screen.update_location_setup();
    totalstation_screen.start_animate_map_totalstation();
  },
  refresh_page_content: function( location )
  {
    if( !location )
      location = {};

    q$( "#totalstation_screen_location_edit_form_name" ).val( location.name ? location.name : "" ).change();
    q$( "#totalstation_screen_location_edit_form_description" ).val( location.description ? location.description : "" ).change();
    if(totalstation_screen.active_fixpoints.length > 0){
      for(let i=0; i< totalstation_screen.active_location.fixpoint_labels.length; i++){
        q$("#fixpoint"+i).val(totalstation_screen.active_location.fixpoint_labels[i]);
      }
    }
    totalstation_screen.change_fixplate( location.fixplate );
  },
  edit_page_diff: function()
  {
    let old = totalstation_screen._location;
    if( !old )
      old = {};
    const diff = function( old_val, new_val )
    {
      return (old_val ? old_val : "") !== (new_val ? new_val : "");
    };

    let diffs = [ ];
    if( totalstation_screen._state !== "setup" )
    {
      diffs.push( diff( old.name, q$( "#totalstation_screen_location_edit_form_name" ).val() ) );
      diffs.push( diff( old.description, q$( "#totalstation_screen_location_edit_form_description" ).val() ) );
      diffs.push( !totalstation_screen.active_fixpoints.equal( totalstation_screen.active_location.fixpoints ) );
    }
    else
    {
      diffs.push( totalstation_controller.active.fixpoints.current.filter(p=>!!p).length > 0 );
    }
    diffs.push( totalstation_screen.cleared_fixpoints.length > 0 );

    return diffs.indexOf( true ) !== -1;

  },
  save_settings: function()
  {
    let name = q$( "#totalstation_screen_location_edit_form_name" ).val().trim();

    if( !name )
      name = translate["Location"];

    totalstation_screen._location.name = name;
    totalstation_screen._location.description = $( "#totalstation_screen_location_edit_form_description" ).val().trim();
    // totalstation_screen._location.fixplate = $("#totalstation_screen_location_edit_form_fixed_yes").hasClass("chosen");
    totalstation_screen.active_location.fixpoints = totalstation_screen.active_fixpoints.filter( ( _, idx ) => {
      return totalstation_screen.cleared_fixpoints.indexOf( idx ) === -1;
    } );
    totalstation_screen.active_location.fixpoints.forEach(( _ , idx ) => {
      if(totalstation_screen.active_location.fixpoint_labels.indexOf($(`#totalstation_screen_location_edit_form_fixpoints #fixpoint${idx}`).val()) === -1){
        totalstation_screen.active_location.fixpoint_labels.push($(`#totalstation_screen_location_edit_form_fixpoints #fixpoint${idx}`).val());
      }
    });

  },
  save_selection: function()
  {
    totalstation_controller.use_site_calibration_as_projection( totalstation_location_controller.active );
    totalstation_screen.open();
  },
  save_location: function()
  {
    if( totalstation_screen._state === "setup" )
    {
      totalstation_screen.save_selection();
      return;
    }

    try
    {
      let current_location = totalstation_screen._location_original;
      if( !current_location )
        current_location = {};
      totalstation_screen.save_settings();

      const save_location_finalize = function()
      {
        if( totalstation_screen._location.name !== current_location.name )
          totalstation_location_controller.remove( current_location.name );
        totalstation_location_controller.save();

        if( totalstation_screen._state === "edit" )
          settings_screeen_controller.breadcrumb.back( true );
        else if( totalstation_screen._state === "add" )
        {
          totalstation_location_controller.set_active( totalstation_screen._location.name );
          totalstation_screen.transfer_fixpoints( false, false );
          totalstation_controller.active.fixpoints_to_current();
          totalstation_screen.transfer_fixpoints( true, false );
          totalstation_controller.active.fixpoints_lock();
          totalstation_screen.save_selection();
        }
        else
        {
          throw "Unknown state";
        }
      };

      if( totalstation_location_controller.location_exists( totalstation_screen._location.name ) && totalstation_screen._location.name !== current_location.name )
      {
        popup_screen_controller.confirm_popup(
          translate["WarningTotalstationLocationNameExist"],
          "",
          translate["Overwrite"],
          translate["Cancel"],
          function()
          {
            popup_screen_controller.close();
            totalstation_location_controller.edit( totalstation_screen._location, current_location, false, true );
            save_location_finalize();
            totalstation_screen.open();
          },
          function()
          {
            popup_screen_controller.close();
          },
          "red"
          );
        return;
      }
      else if( totalstation_screen._state === "edit" )
        totalstation_location_controller.edit( totalstation_screen._location, current_location );
      else
        totalstation_location_controller.add( totalstation_screen._location );

      save_location_finalize();

    }
    catch( e )
    {
      uncaughtErrorSend( e.stack ? e.stack : e );
      console.error( e );

      let diag_header = translate["ErrorDiagBadTotalstationLocationHeader"];
      let diag_body;
      switch( e )
      {
        case "Illegal character in name":
          diag_body = translate["Name must not contain the following characters: %1s"].format( totalstation_location_controller.illegal_name_characters.reduce( ( a, b ) => a += b, "" ) );
          break;
        case `Projection invalid`:
          diag_body = translate["The location text is invalid."];
          break;
        default:
          diag_body = translate["ErrorDiagBadTotalstationLocationBody"];
      }

      popup_screen_controller.confirm_popup( diag_header, diag_body, translate["OK"], undefined, function()
      {
        popup_screen_controller.close();
      } );
    }
  },

  get active_location()
  {
    if( totalstation_screen._state === "setup" )
      return totalstation_location_controller.active;
    else
      return totalstation_screen._location;
  },
  get active_fixpoints()
  {
    if( false && totalstation_screen._state === "setup" )
      return totalstation_controller.active.fixpoints.current;
    else
      return totalstation_controller.active.fixpoints.original;
  },

  fixpoints_current_before_setup: [],
  open_location_setup: function()
  {
    totalstation_screen._state = "setup";
    totalstation_screen.transfer_fixpoints( true );
    totalstation_controller.active.fixpoints_lock();
    totalstation_screen.fixpoints_current_before_setup = Array.from(totalstation_controller.active.fixpoints.current);
    totalstation_screen._location = totalstation_location_controller.active.copy();
    totalstation_screen._location_original = totalstation_screen._location.copy();
    totalstation_screen.open_location_page();
  },
  update_location_setup: function()
  {
    // Map
    if( !totalstation_screen.map )
      totalstation_screen.start_map( );

    totalstation_screen.map.refresh_background();

    if( totalstation_screen._state !== "add" && totalstation_screen.active_location.layout )
    {
      totalstation_screen.update_pitch();
      totalstation_screen.map.zoom_to_pitch( totalstation_screen.active_location.layout );
    }
    else
    {
      totalstation_screen.map.zoom_to_point( [0,0] );
    }

    totalstation_screen.update_map();
    totalstation_screen.update_fixpoints();
  },

  map: undefined,
  start_map: function( )
  {
    q$( "#totalstation_screen_location_edit .advanced_map_canvas" ).height( q$( "#totalstation_screen_location_edit .advanced_map_canvas" ).width() );
    totalstation_screen.map = new AdvancedEditBackground( "#totalstation_screen_location_edit .advanced_map_canvas #fixpoints_map" );
    totalstation_screen.map.start_map( );
  },
  update_pitch: function()
  {
    if( totalstation_screen._state === "setup")
    {
      if(false)
        totalstation_screen.active_location.layout.points = totalstation_screen.active_location.fixpoints.filter((_,idx)=>totalstation_screen.cleared_fixpoints.indexOf(idx)===-1);
    }
    else
    {
      totalstation_screen.active_location.layout.points = totalstation_screen.active_fixpoints.filter((_,idx)=>totalstation_screen.cleared_fixpoints.indexOf(idx)===-1);
    }
    totalstation_screen.active_location.layout.draw();
  },
  pitch_layer: undefined,
  update_map: function( )
  {
    if( !totalstation_screen.map )
      return;

    totalstation_screen.map.removePitchLayer( totalstation_screen.pitch_layer );

    if( totalstation_screen.active_location.layout )
    {
      totalstation_screen.pitch_layer = totalstation_screen.map.draw_job( totalstation_screen.active_location.layout, "#FFFFFF", false, false );
    }
  },
  fit_map_timeout: undefined,
  fit_map()
  {
    // setTimeout(totalstation_screen.map.zoom_to_all.bind(totalstation_screen.map), 250);
    const zoom_to_pitch = function()
    {
      totalstation_screen.map.zoom_to_pitch( totalstation_screen.active_location.layout );
    };
    clearTimeout(totalstation_screen.fit_map_timeout);
    totalstation_screen.fit_map_timeout = setTimeout(zoom_to_pitch, 100);
  },
  start_animate_map_totalstation: function()
  {
    totalstation_screen.stop_animate_map_totalstation();
    totalstation_controller.active.events.add_callback("got_position", totalstation_screen.animate_map_totalstation);
  },
  stop_animate_map_totalstation: function()
  {
    totalstation_controller.active.events.remove_callback("got_position", totalstation_screen.animate_map_totalstation);
  },
  animate_map_totalstation: function()
  {
    totalstation_screen.active_location.layout.draw();
    totalstation_screen.update_map();
  },
  draw_layout_on_big_map()
  {
    pitch_generator.set_active_from_db_job(totalstation_screen.active_location.layout);
    pitch_generator.active.draw();
    edit_pitch_screen_controller.draw_pitch(true,false,false);
  },
  positioning_on_map: false,
  position_layout_on_map()
  {
    totalstation_screen.positioning_on_map = true;
    pitch_generator.set_active_from_db_job(totalstation_screen.active_location.layout);

    if( !totalstation_screen.active_location.is_positioned )
    {
      pitch_generator.active.projection = projection_controller.lnglat2UTMProjString(gps_controller.last_position);
      pitch_generator.active.options.Translation.val = map_controller.background.ol_proj_fromLonLat( gps_controller.last_position, pitch_generator.active.projection ).toVector();
    }

    pitch_generator.active.draw();
    edit_pitch_screen_controller.draw_pitch(true,false,true);
    map_controller.background.zoom_to_pitch(pitch_generator.active);
    bottom_bar_chooser.choose_bottom_bar("#position-totalstation");
    settings_screeen_controller.close();
  },
  position_layout_cancel()
  {
    if( !totalstation_screen.positioning_on_map )
      return;

      totalstation_screen.positioning_on_map = false;

    bottom_bar_chooser.choose_bottom_bar();
    edit_pitch_screen_controller.remove_pitch();
    settings_screeen_controller.open();
  },
  position_layout_save()
  {
    if( !totalstation_screen.positioning_on_map )
      return;

    totalstation_screen.positioning_on_map = false;

    bottom_bar_chooser.choose_bottom_bar();

    totalstation_screen.active_location.layout = pitch_generator.active.copy();
    totalstation_screen.active_location.projection = totalstation_screen.active_location.layout.projection;
    totalstation_screen.active_location.translation = totalstation_screen.active_location.layout.options.Translation.val;
    totalstation_screen.active_location.angle = totalstation_screen.active_location.layout.options.Angle.val;
    totalstation_screen.active_location.is_positioned = true;

    edit_pitch_screen_controller.remove_pitch();
    settings_screeen_controller.open();

    totalstation_screen.update_location_setup();
    totalstation_screen.fit_map();
  },
  transfer_fixpoints: function( use_positioned_fixpoints, reset_current_fixpoints = true )
  {
    // Transfer fixpoints
    if( !totalstation_controller.active )
      throw "No active total station";
    if( !totalstation_screen.active_location )
      throw "No active location";
    if( use_positioned_fixpoints === undefined )
      throw "Missing argument";

    if( use_positioned_fixpoints )
      totalstation_controller.active.fixpoints.original = Array.from( totalstation_screen.active_location.positioned_fixpoints );
    else
      totalstation_controller.active.fixpoints.original = Array.from( totalstation_screen.active_location.fixpoints );

    if( reset_current_fixpoints )
      totalstation_controller.active.fixpoints.current = Array(totalstation_controller.active.fixpoints.original_length);
  },
  update_fixpoints_interval_start: null,
  track_robot_for_fixpoints_start: function()
  {
    clearInterval(totalstation_screen.update_fixpoints_interval_start);
    clearInterval(totalstation_screen.update_fixpoints_interval_stop);
    $("#collect_fixpoint_robot_track").prop( "disabled", true );
    totalstation_controller.track_robot_start(false);
    totalstation_screen.update_fixpoints_interval_start = setInterval(()=>{
      if(totalstation_screen.robot_tracking_ready)
      {
        totalstation_screen.update_fixpoints();
        clearInterval(totalstation_screen.update_fixpoints_interval_start);
      }
    }, 500);
  },
  update_fixpoints_interval_stop: null,
  track_robot_for_fixpoints_stop: function()
  {
    clearInterval(totalstation_screen.update_fixpoints_interval_start);
    clearInterval(totalstation_screen.update_fixpoints_interval_stop);
    $("#collect_fixpoint_robot_track").prop( "disabled", true );
    totalstation_controller.track_robot_stop();
    totalstation_screen.update_fixpoints_interval_stop = setInterval(()=>{
      if(!totalstation_screen.robot_tracking_ready)
      {
        totalstation_screen.update_fixpoints();
        clearInterval(totalstation_screen.update_fixpoints_interval_stop);
      }
    }, 500)
  },

  update_fixpoints(adding=null)
  {
    const fixplate_mode = totalstation_screen._state !== "setup" && totalstation_screen._location.fixplate;

    const amount = totalstation_screen._state !== "setup" ? totalstation_screen.active_fixpoints.length : totalstation_controller.active.fixpoints.current_length;
    const amount_satisfied = fixplate_mode ? (amount >= 1) : (amount >= 3);
    const cleared_amount = amount - totalstation_screen.cleared_fixpoints.length;
    const cleared_amount_satisfied = fixplate_mode ? (cleared_amount >= 1) : cleared_amount >= 3;

    let content = "";
      content += totalstation_screen.active_fixpoints.reduce( ( accu, curr, idx ) => {
      const label = totalstation_screen.active_location.fixpoint_labels[idx];
      const cleared = totalstation_screen.cleared_fixpoints.indexOf( idx ) > -1;
      const collected = !!totalstation_controller.active.fixpoints.current[idx];

      accu += `<tr>`;
      if(totalstation_screen._state === "setup")
      {
        if( cleared || !collected)
        {
          accu += `<td><i class="material-icons">gps_not_fixed</i></td>`;
          accu += `<td style="padding:0 5px;width:100%;"><p>${label?label:translate["Prism %1s"].format(idx+1)}</p></td>`;
        }
        else
        {
          accu += `<td><i class="material-icons">gps_fixed</i></td>`;
          accu += `<td style="padding:0 5px;width:100%;"><p style="font-weight:600;">${label?label:translate["Prism %1s"].format(idx+1)}</p></td>`;
        }
      }
     else
      {
        accu += `<td style="padding:0 5px;width:100%;"><input type="text" name="fixpoint${idx}" id="fixpoint${idx}" placeholder="${translate["Prism %1s"].format(idx+1)}" value="${label?label:""}"></td>`;
      }

      if( cleared )
      {
        accu += `<td><button class="dark material-icons round" onclick="totalstation_screen.undo_cleared_fixpoint(${idx})">undo</button></td>`;
        accu += `<td><button class="dark" onclick="totalstation_screen.recollect_fixpoint(${idx})">${translate['Collect']}</button></td>`;
        if(totalstation_screen._state === "add" || (totalstation_screen._state === "edit" && cleared_amount_satisfied))
          accu += `<td><button class="red material-icons round" onclick="totalstation_screen.delete_fixpoint(${idx})">delete_forever</button></td>`;
      }
      else if(totalstation_screen._state === "setup" && !collected)
      {
        accu += `<td></td>`;
        accu += `<td colspan="2"><button class="dark" onclick="totalstation_screen.recollect_fixpoint(${idx})">${translate['Collect']}</button></td>`;
      }
      else
      {
        accu += `<td style="text-align:right"><button class="dark material-icons round" onclick="totalstation_screen.show_fixpoint_details(${idx})">more_horiz</button></td>`;
        accu += `<td colspan="2"><button class="red material-icons" onclick="totalstation_screen.clear_fixpoint(${idx})">delete</button></td>`;
      }
      accu += `</tr>`;
      return accu;
    }, content );
    if(adding === "add new fixpoint"){
      content += `<tr>`;
      content += `<td style="padding:0 5px;width:100%;"><input type="text" name="fixpoint${totalstation_screen.active_fixpoints.length}" id="fixpoint${totalstation_screen.active_fixpoints.length}" placeholder="${translate["Prism %1s"].format(totalstation_screen.active_fixpoints.length+1)}" value=""}"></td>`;
      content += `<td width="40px"></td>`;
      content += `<td colspan="1"><button class="red material-icons" onclick="totalstation_screen.clear_fixpoint(${totalstation_screen.active_fixpoints.length})">delete</button></td>`;
      content += `</tr>`;

    }

    const current_id = amount;
    const label = totalstation_screen.active_location.fixpoint_labels[current_id];
    content += `<tr><td colspan="4"><p style="text-align:left;padding:${amount>0?"10px":"0"} 0 0 0;">`;
    if( fixplate_mode )
    {
      content += translate["CollectRobotPrismHelpText1"].format( `<b>${translate['Track']}</b>` );
    }
    else if( amount_satisfied )
    {
      content += translate["CollectPrismHelpText2alt2"].format( `<b>${translate['Collect']}</b>` );
    }
    else
    {
      if( (totalstation_screen._state === "add") || !label )
        content += (current_id === 0 ? translate["CollectPrismHelpText1"] : translate["CollectPrismHelpText2"]).format( `<b>${translate['Collect']}</b>` );
      else
        content += (current_id === 0 ? translate["CollectPrismHelpText1alt"] : translate["CollectPrismHelpText2alt"]).format( `<b>${label}</b>`, `<b>${translate['Collect']}</b>` );
    }
    content += `</p></td></tr>`;
    if( fixplate_mode )
    {
      if( !totalstation_screen.robot_tracking_ready )
      {
        content += `<tr><td colspan="4" style="text-align:center;"><button id="collect_fixpoint_robot_track" class="dark" onclick="totalstation_screen.track_robot_for_fixpoints_start()">${translate['Track']}</button></td></tr>`;
        q$( ".active-circle" ).removeClass( "overpopup" );
      }
      else
      {
        content += `<tr><td colspan="4" style="text-align:center;"><button id="collect_fixpoint_robot_track" class="red" onclick="totalstation_screen.track_robot_for_fixpoints_stop()">${translate['Stop']}</button></td></tr>`;
        q$( ".active-circle" ).addClass( "overpopup" );
      }
      content += `<tr><td colspan="3"><p style="text-align:left;padding:10px 0;">${translate["CollectRobotPrismHelpText2"].format( `<b>${translate['Collect']}</b>` )}</p></td></tr>`;
      if( totalstation_screen.robot_tracking_ready )
        content += `<tr><td colspan="4" style="text-align:center;"><button class="dark" onclick="totalstation_screen.collect_fixpoint(true)">${translate['Collect']}</button></td></tr>`;
      else
        content += `<tr><td colspan="4" style="text-align:center;"><button class="dark" onclick="totalstation_screen.collect_fixpoint(true)" disabled>${translate['Collect']}</button></td></tr>`;
    }
    //Fixpoint can be collected only when the "empty" new fix point is added
    else if(totalstation_screen._state !== "setup")
    if(adding === "add new fixpoint"){
      content += `<tr><td colspan="4" style="text-align:center;"><button class="dark" onclick="totalstation_screen.collect_fixpoint()">${translate['Collect']}</button></td></tr>`;
    }
    else{
      content += `<tr><td colspan="4" style="text-align:center;"><button class="dark" onclick="totalstation_screen.collect_fixpoint()" disabled>${translate['Collect']}</button></td></tr>`;
    }

    if( totalstation_screen._state !== "setup")
    {
      content += `<tr><td colspan="3"><p style="text-align:left;padding:10px 0;">${translate["PositionPrismHelpText1"].format(`<b>${translate["Position prisms on map"]}</b>`)}</p></td></tr>`
      if( cleared_amount_satisfied )
        content += `<tr><td colspan="3" style="text-align:center;"><button class="dark" onclick="totalstation_screen.position_layout_on_map()">${translate["Position prisms on map"]}</button></td></tr>`;
      else
        content += `<tr><td colspan="3" style="text-align:center;"><button class="dark" onclick="totalstation_screen.position_layout_on_map()" disabled>${translate["Position prisms on map"]}</button></td></tr>`;
    }

    q$( "#fixpoints tbody" ).html( content );

    if( totalstation_screen.active_fixpoints.length > 0 )
    {
      q$( "#fixpoints thead" ).removeClass( "gone" );
      q$( "#fixpoints #fixpoint_help_text" ).addClass( "gone" );
    }
    else
    {
      q$( "#fixpoints thead" ).addClass( "gone" );
      q$( "#fixpoints #fixpoint_help_text" ).removeClass( "gone" );
    }

    if( totalstation_screen._state === "setup" )
      q$( "#totalstation_screen_location_edit #save_button" ).prop( 'disabled',
        totalstation_controller.active.fixpoints.current_length !== totalstation_controller.active.fixpoints.original_length ||
        totalstation_screen.fixpoints_current_before_setup.equal(totalstation_screen.active_fixpoints) ||
        totalstation_screen.cleared_fixpoints.length > 0
      );
    else
    {
      const position_ready = totalstation_screen.active_location && totalstation_screen.active_location.is_positioned;

      q$( "#totalstation_screen_location_edit #save_button" ).prop( 'disabled', !(cleared_amount_satisfied && (AppType === APP_TYPE.TinySurveyor || position_ready)) );
    }

    try
    {
      totalstation_screen.update_pitch();
      totalstation_screen.update_map();
      totalstation_screen.fit_map();
    }
    catch(e)
    {
      console.error(e);
    }
  },
  recollect_fixpoint( idx )
  {
    console.log( "Recollect", idx );
    totalstation_controller.active.fixpoints_get( true, idx );
    //Might be handling the check for existing prism in the list
    if(totalstation_screen.cleared_fixpoints.indexOf( idx ) > -1)
      totalstation_screen.cleared_fixpoints.splice( totalstation_screen.cleared_fixpoints.indexOf( idx ), 1 );
  },
  collect_fixpoint( robot_as_fixpoint = false )
  {
    console.log( "Collect" );
    if( robot_as_fixpoint )
      totalstation_controller.active.fixpoints_get( false, undefined, totalstation_controller.active._target.ROBOT_AS_FIXPOINT );
    else
      totalstation_controller.active.fixpoints_get( true, undefined, totalstation_controller.active._target.FIXPOINT );
  },
  autocollect_fixpoints()
  {
    console.log( "AutoCollect" );
    totalstation_controller.active.site_calibrate_start();
  },
  delete_fixpoint( idx )
  {
    console.log( "Delete", idx );
    totalstation_controller.active.fixpoints_delete( idx );
    totalstation_screen._location.fixpoint_label_delete( idx );
    totalstation_screen.cleared_fixpoints.splice( totalstation_screen.cleared_fixpoints.indexOf( idx ), 1 );
    totalstation_screen.update_fixpoints();
  },
  cleared_fixpoints: [ ],
  clear_all_fixpoints()
  {
    totalstation_screen.cleared_fixpoints = [ ];
  },
  clear_fixpoint( idx )
  {
    totalstation_screen.cleared_fixpoints.push( idx );
    totalstation_screen.update_fixpoints();
  },
  undo_cleared_fixpoint( idx )
  {
    const i = totalstation_screen.cleared_fixpoints.indexOf(idx);
    if(i > -1)
    {
      totalstation_screen.cleared_fixpoints.splice( i, 1 );
      totalstation_screen.update_fixpoints();
    }
  },
  show_fixpoint_details(idx)
  {
    // const point = totalstation_screen.active_fixpoints[idx];
    let point = totalstation_controller.active.fixpoints.original[idx];
    if( totalstation_screen._state === "setup" )
      point = totalstation_controller.active.fixpoints.current[idx];
      
    const label = totalstation_screen.active_location.fixpoint_labels[idx];
    let dist = point.toVector().length;
    const head = translate["%1s details"].format(label ? label : translate["Prism %1s"].format(idx + 1));
    let body = "";
    body += `<table class="align-center" style="width:70%;margin:0 15%;">`;
    body += `<thead><tr> <th>${translate["Height"]}</th> <th>${translate["Distance"]}</th> </tr></thead>`;
    body += `<tbody><tr> <td>${point.z.meter2unit().round(2)} ${translate_unit()}</td> <td>${dist.meter2unit().round(2)} ${translate_unit()}</td> </tr></tbody>`;
    body += `</table>`;

    pop_generator.create_popup(
      head,
      body,
      [new PopButton(translate["Close"], pop_generator.close)],
      pop_generator.close
    );
  }
};


event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  switch( settings_screen_name )
  {
    case "totalstation_screen_location_list":
      totalstation_screen.update_location_list();
      if( totalstation_screen.test_mode )
        totalstation_controller.set_active( "LN-150_LW000526" );
      break;
    case "totalstation_screen_location_edit":
      totalstation_controller.active.events.add_callback( 'target_lock', totalstation_screen.update_fixpoints );
      totalstation_screen.position_layout_cancel();
      break;
  }
} );
event_controller.add_callback( "leaving_settings_menu", function( old_screen_name, new_screen_name, callback, activated )
{
  switch( old_screen_name )
  {
    case "totalstation_screen_location_edit":
      if( new_screen_name !== "totalstation_screen_front" )
      {
        activated.result = true;
        totalstation_screen.edit_back( callback );
      }
      break;
  }
} );
event_controller.add_callback( "close_settings_menu", function( settings_screen_name )
{
  switch( settings_screen_name )
  {
    case "totalstation_screen_connect":
      totalstation_screen.close_connect();
      break;
    case "totalstation_screen_location_edit":
      totalstation_screen.stop_animate_map_totalstation();
      totalstation_controller.active.events.remove_callback( 'target_lock', totalstation_screen.update_fixpoints );
      if( !totalstation_screen.positioning_on_map )
        totalstation_controller.track_robot_stop();
      break;
  }
} );