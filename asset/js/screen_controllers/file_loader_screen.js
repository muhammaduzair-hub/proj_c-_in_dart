/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global popup_screen_controller, file_controller, SETTINGS, robot_controller, event_controller, map_controller, translate, settings_screeen_controller, bottom_bar_chooser, login_screen_controller */

var file_loader_screen = {
  chosen_file: -1,
  files: [ ],
  legal_endings: [ ],
  requirements: [ ],
  file_loader: undefined,
  file_loaded_callback: undefined,
  loaded_files: [ ],
  layers: [ ],
  hide_layers: {},
  _supportedExtensions: ["dxf", "xml", "csv", "geo", "svg"],

  get supportedExtensions() {
    return this._supportedExtensions;
  },

  get legalExtensions() {
    return this.supportedExtensions.filter(ext=>templateshop_controller.has_feature(`${ext}_parser`));
  },

  importHelper() {
    const legalExtensions = this.legalExtensions;

    let requirements = [file_controller.requirements.PROJECTION_SET];
    
    if (general_settings_screen.showJobsFromSource === JobSourceToShow.CLOUD) {
      const options = {
                      header: translate["headerJobSourceWarning"],
                      body: translate["bodyJobSourceWarning"].format(translate["Job"].toLowerCase()),
                      ok_text: translate["Yes"],
                      cancel_text: translate["No"],
                      ok_callback: ()=>{general_settings_screen.changeShowingJobsBySource(JobSourceToShow.ALL); doNext()},
                      cancel_callback: doNext
                      }
      popup_screen_controller.confirm_popup_with_options(options);
    }
    else {
      file_loader_screen.open(legalExtensions, requirements, file_controller.load_job_file, file_loader_screen.file_loaded);
    }

  function doNext() {
    popup_screen_controller.close();
    createJobMenuScreenController.open(false);
    file_loader_screen.open(legalExtensions, requirements, file_controller.load_job_file, file_loader_screen.file_loaded);
  }

},
open(legal_endings, requirements, file_loader, file_loaded_callback) {
  file_loader_screen.legal_endings = legal_endings;
  file_loader_screen.requirements = requirements;
  file_loader_screen.file_loader = file_loader;
  file_loader_screen.file_loaded_callback = file_loaded_callback;

  if( window.cordova && device)
  {
    try {
      let allOk = file_controller.filePreProcessor(requirements);
      if (allOk) {
        popup_screen_controller.open_info_waiter( translate["Importing file"], "" );
        file_controller.pluginFileOpener(legal_endings, file_loader, file_loaded_callback);
      }
    } 
    catch (error) {
      console.log(error);
    }
    // const androidVersion = parseInt(device.version.split(".")[0]);
    // if (androidVersion > 0) { // ALWAYS USE THE NEW METHOD
    // }
    // else { // DEPRECATED
    //   file_loader_screen.chosen_file = -1;
    //   $( "#load_usb_popup #files" ).empty( );
    //   popup_screen_controller.open( "#load_usb_popup", true );
    //   file_loader_screen.file_loader_number_of_files = 0;
    //   $( "#load_usb_popup #files_container" ).addClass( 'gone' );
    //   $( "#load_usb_popup #load_file_bottom_wrap" ).addClass( "gone" );
    //   $( "#load_usb_popup" ).addClass( "padding_lr" );
    //   clearInterval( file_loader_screen.file_loader_interval );
    //   file_loader_screen.file_loader_interval = setInterval( function()
    //   {
    //     file_loader_screen.update_files_from_usb();
    //   }, 1000 );
    // }
  }
  else
  {
    $("#file-input-field" ).attr( "accept", file_loader_screen.legal_endings.map( e => `.${e}` ).join( ',' ) );
    $('#file-input-field').trigger("click");
  }
},
close()
{
  clearInterval( file_loader_screen.file_loader_interval );
  popup_screen_controller.close( "#load_usb_popup" );
  $( "#load_usb_popup #load_usb_file_header" ).text( translate["Searching for files"] );
},

  file_loader_interval: 0,
  file_loader_number_of_files: 0,
  update_files_from_usb: function()
  {
    file_controller.getValidFiles( function( files )
    {

      if( files.length > 0 )
      {
        // clearInterval( file_loader_screen.file_loader_interval );
      }
      else
      {
        $( "#load_usb_popup #load_usb_file_header" ).text( translate["Searching for files"] );
        $( "#load_usb_popup #files_container" ).addClass( 'gone' );
        $( "#load_usb_popup #load_file_bottom_wrap" ).addClass( "gone" );
        $( "#load_usb_popup" ).addClass( "padding_lr" );
        file_loader_screen.file_loader_number_of_files = 0;
      }

      if( files.length !== file_loader_screen.file_loader_number_of_files )
      {

        // $( "#load_usb_popup #load_usb_file_header" ).html( translate["Loading files from USB"] );

        file_loader_screen.file_loader_number_of_files = files.length;

        files = files.sort( function( f1, f2 )
        {
          var f1_name = f1.name.toLowerCase();
          var f2_name = f2.name.toLowerCase();
          if( f1_name > f2_name )
            return 1;
          if( f1_name === f2_name )
            return 0;
          if( f1_name < f2_name )
            return -1;
        } );

        $( "#load_usb_popup #files" ).empty( );

        let loc_internal = 0, loc_external = 0;
        files = files.map( f => {
          if( f.nativeURL.indexOf( 'file:///storage/emulated/0/' + file_controller.tmr_directory_name ) === 0 )
          {
            f.location = translate["Internal"];
            loc_internal = 1;
          }
          else
          {
            f.location = translate["USB or SD"];
            loc_external = 1;
          }
          return f;
        } );

        files = files.sort_objects( "location" );

        const show_location = loc_internal + loc_external > 1;

        files.forEach( function( file, i )
        {
          console.log( file.name );

          let html = `<div style=" text-align: center;" id="file_${i}" class="template-image" onclick="file_loader_screen.choose_file(${i})">`;
          html += `<img src="img/file_icons/${file.ext}.png" alt="${file.ext}" style="height: 50pt;"><br><p>`;
          html += file.name;
          if( true || show_location )
            html += `<br><span style="color:#aaa">${file.location}</span>`;
          html += "</p></div>";
          $( "#load_usb_popup #files" ).append( html );
        } );
        $( "#load_usb_popup #files_container" ).removeClass( 'gone' );
        $( "#load_usb_popup" ).removeClass( "padding_lr" );
        $( "#load_usb_popup #load_usb_file_header" ).text( translate["Choose file"] );

        file_loader_screen.files = files;
      }
    });
  },
  choose_file: function( id )
  {
    file_loader_screen.chosen_file = id;
    $( "#load_usb_popup #files div" ).removeClass( "template_chosen" );
    $( "#load_usb_popup #files #file_" + id ).addClass( "template_chosen" );
    $( "#load_usb_popup #load_file_bottom_wrap" ).removeClass( "gone" );
  },
  waiting_file: false,
  process_file: function( file_entry, callback )
  {

    if( !callback )
    {
      if( file_loader_screen.file_loaded_callback )
        callback = file_loader_screen.file_loaded_callback;
      else
        callback = file_loader_screen.file_loaded;
    }

    file_loader = file_loader_screen.file_loader;

    if( (!file_loader || file_loader === file_controller.load_job_file) && !robot_controller.chosen_robot.proj_string )
    {
      popup_screen_controller.confirm_popup( translate["HeaderSelectValidProjection"], translate["BodySelectValidProjection"], translate["Ok"], "", function()
      {
        settings_screeen_controller.open();
        settings_screeen_controller.choose_menu( 'position_settings_header', 'position_settings_screen' );
        popup_screen_controller.close();

        file_loader_screen.waiting_file = {
          fileloader: file_loader,
          file: file_entry,
          cb: callback
        };
        event_controller.add_callback( "projection_chosen", file_loader_screen.load_file_after_projection_chosen );

      } );
    }
    else
    {
      file_controller.load_file( file_loader, file_entry, callback );
    }

  },
  load_file_after_projection_chosen: function()
  {
    settings_screeen_controller.close();
    file_controller.load_file( file_loader_screen.waiting_file.fileloader, file_loader_screen.waiting_file.file, file_loader_screen.waiting_file.cb );
    event_controller.remove_callback( "projection_chosen", file_loader_screen.load_file_after_projection_chosen );
    file_loader_screen.waiting_file = false;
  },
  load_file: function()
  {

    if( file_loader_screen.chosen_file < 0 )
    {

      $( "#load_usb_popup #files" ).addClass( "animated flashRed" );
      $( "#load_usb_popup #files" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function( )
      {
        $( "#load_usb_popup #files" ).removeClass( "animated flashRed" );
      } );

      return;
    }

    popup_screen_controller.close();
    popup_screen_controller.open_info_waiter( translate["Importing file"], "" );

    setTimeout( function()
    {
      file_loader_screen.files[file_loader_screen.chosen_file].file( function( file )
      {
        file_loader_screen.process_file( file, file_loader_screen.file_loaded_callback );
      } );
    }, 1 );
  },
  imported_files_handling(){
    let tmp = {};
    for(let i = 0; i< map_controller.background.jobs.length; i++){
      if(map_controller.background.jobs[i].source === JobSource.USB 
      && map_controller.background.jobs[i].layers
      && map_controller.background.jobs[i].layers.length > 0){
        if(tmp.hasOwnProperty(map_controller.background.jobs[i].template_type)){
          tmp[map_controller.background.jobs[i].template_type].push(map_controller.background.jobs[i].layers[0]);
          tmp[map_controller.background.jobs[i].template_type] = [...new Set(tmp[map_controller.background.jobs[i].template_type])];
        }
        else{
          tmp[map_controller.background.jobs[i].template_type] = [];
          tmp[map_controller.background.jobs[i].template_type].push(map_controller.background.jobs[i].layers[0]);
        }
      }
    } 
    settings_screeen_controller.imported_files.length = 0;
    settings_screeen_controller.imported_files = tmp;

    if(settings_screeen_controller.chosen_file === "" || settings_screeen_controller.chosen_file == undefined){
      settings_screeen_controller.chosen_file = Object.keys(settings_screeen_controller.imported_files)[0];
    }
  },
  file_loaded(file_jobs = [])
  {
    file_loader_screen.loaded_files = file_jobs;

    file_loader_screen.layers = [ ];
    file_loader_screen.loaded_files.forEach( function( file )
    {
      file_loader_screen.layers = file_loader_screen.layers.concat( file.layers );
    } );
    file_loader_screen.layers = file_loader_screen.layers.sort();
    file_loader_screen.layers = file_loader_screen.layers.filter( function( l, i )
    {
      return file_loader_screen.layers.indexOf( l ) === i;
    } );


    if( !file_jobs.length || !file_jobs[0].tasks || !file_jobs[0].tasks.length ) {
      popup_screen_controller.confirm_popup( translate["No tasks in file"], translate["The file is empty or contains unsupported entities"], translate["Ok"], "", popup_screen_controller.close );
    }

    popup_screen_controller.close_info_waiter();

    map_controller.background.zoom_to_pitches( file_jobs, true );
    
    if(file_jobs.length === 1 && SETTINGS.import_auto_open_edit)
    {
      pitch_generator.active = file_jobs[0];
      pitch_generator.active.new_job = true;
      edit_pitch_screen_controller.open(false, true);
    }
    else
    {
    map_controller.background.jobs.add_jobs( file_jobs );      
    file_loader_screen.imported_files_handling();
      bottom_bar_chooser.reload_bottom_bar();
    }
    
    // Ask to enable missing templates, if any
    setTimeout(() => {
      let did_ask = false;
      map_controller.background.jobs.importedJobs.forEach((job)=>{
        if (job instanceof PointJob && !did_ask) {
          did_ask = true;
          file_loader_screen.check_disabled();
        }
      });      
    }, 100);
    if(totalstation_screen._importing_fixpoints){
      totalstation_screen.imported_csv_handling();
    }
  },
  check_disabled() {
    var disabled = file_loader_screen.get_disabled();
    if (disabled) {
      popup_screen_controller.confirm_popup_with_options({
        header: translate["PopupDisabledGeometryHeader"], 
        body: translate["PopupDisabledGeometryBody"], 
        ok_text: translate["yes"], 
        cancel_text: translate["no"], 
        ok_callback: ()=> {file_loader_screen.toggle_disabled(disabled)},
        cancel_callback: popup_screen_controller.close
      });
    }
  },
  get_disabled() {
    let groups = templateshop_controller.template_groups;
    let lngth = groups.length;
    for (var i = 0; i < lngth; i++) {
      if (groups[i]._name === "Geometry") {
        if (!groups[i].enabled) {
          return groups[i];
        }
        let templates = groups[i].templates;
        let lngt = templates.length;
        for (var j = 0; j < lngt; j++) {
          if (settings_screeen_controller.template_hidden(templates[j])) {
            return groups[i];
          }
        }
      }
    }
    return null;
  },
  toggle_disabled(group) {
    templateshop_controller.show_template_group(group);
    settings_screeen_controller.show_templates(group.templates);
  
    if (settings_screeen_controller.chosen_menu === "template_details_screen") {
      templateshop_screen.update_details(group.id);
    }

    popup_screen_controller.close();
  }
};
