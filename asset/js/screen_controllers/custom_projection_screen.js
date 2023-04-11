/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global settings_screeen_controller, custom_projection_controller, position_settings_screen, popup_screen_controller, login_screen_controller, translate, event_controller, q$val, q$, q$text, file_loader_screen, DEBUG_MODE, file_controller */

const custom_projection_screen = {
  open: function( )
  {
    settings_screeen_controller.choose_menu( 'position_settings_header', 'custom_projection_screen', false, translate["Edit projections"] );
  },
  load_list: function()
  {
    html = "";
    html += `<input id="custom_projections_load_list" class='flexdatalist'>`;
    const load = function()
    {
      const new_value = $( "#custom_projections_load_list-flexdatalist" ).val();
      if( custom_projection_controller.projection_exists( new_value, true ) )
      {
        const new_proj = custom_projection_controller.get_projection_from_list( new_value );
        new_proj.name += ` (${translate["ItemCopy"]})`;

        custom_projection_screen.file_loaded( new_proj );
        popup_screen_controller.close();
        return;
      }
      else
      {
        popup_screen_controller.close();
        return;
      }
    };

    popup_screen_controller.confirm_popup( translate["Select projection"], html, translate["Load projection"], translate["Cancel"], load, popup_screen_controller.close );
    position_settings_screen.update_input_field();
    $( '#custom_projections_load_list-flexdatalist' ).attr( "type", "search" );
    $( '#custom_projections_load_list-flexdatalist' ).attr( "placeholder", translate["Search projection"] );
  },
  file_extensions: ["prj"],
  load_file: function()
  {
    // const legalExtensions = ["prj"];
    const requirements = [file_controller.requirements.NONE];
    file_loader_screen.open( custom_projection_screen.file_extensions, requirements, custom_projection_screen.file_loader, custom_projection_screen.file_loaded );
  },
  file_loader: function( file_entry, callback, data )
  {
    if( DEBUG_MODE )
    {
      console.group( "Custom Projections file loader" );
      console.log( file_entry );
      console.log( callback );
      console.log( data );
      console.groupEnd();
    }

    try
    {
      let file_name = file_entry.name;
      const file_name_parts = file_name.split( '.' );
      if( custom_projection_screen.file_extensions.indexOf( file_name_parts.last() ) > -1 )
      {
        file_name_parts.pop();
        file_name = file_name_parts.join( '.' );
      }

      let projstring = "";
      if(false) // Try with all WKT types
      {
        let WKT_types = Object.keys(PROJ.WKT_TYPE);
        let typeIdx = 0;

        while(projstring==="" && typeIdx < WKT_types.length)
        {
          try
          {
            projstring = PROJ.WKTToPROJStr( data, PROJ.WKT_TYPE[WKT_types[typeIdx]] );
          }
          catch (e)
          {
            console.error(e);
          }
          typeIdx++;
        }

        if(projstring==="")
          throw "Could not convert WKT to Proj";
      }
      else
      {
        projstring = PROJ.WKTToPROJStr( data );
      }

      const proj = new CustomProjection( file_name, {
        'proj4': projstring
      } );
      callback( proj );
    }
    catch( e )
    {
      throw e;
    }
  },
  file_loaded: function( projection )
  {
    const proj4 = projection.proj4;

    let x = 0;
    let y = 0;

    let parts = proj4.split( '+' ).map( p => p.trim().split( '=' ) );

    parts.forEach( p => {
      if( p[0] === 'x_0' || p[0] === 'tmr_x' )
      {
        let v = parseFloat( p[1] );
        if( !isNaN( v ) )
          x += v;
      }
      if( p[0] === 'y_0' || p[0] === 'tmr_y' )
      {
        let v = parseFloat( p[1] );
        if( !isNaN( v ) )
          y += v;
      }
    } );

    projection.proj4 = parts.filter( p => p[0] !== 'tmr_x' && p[0] !== 'tmr_y' ).map( p => {
      if( p[0] === 'x_0' )
        p[1] = x.toString();
      if( p[0] === 'y_0' )
        p[1] = y.toString();

      return p.join( '=' );
    } ).join( ' +' ).trim();

    custom_projection_screen.add_projection();
    custom_projection_screen.refresh_page_content( projection );
  },
  load_stored_projections: function()
  {
    custom_projection_controller.load();
    console.log( "Loaded stored custom projections" );

    let content = '';
    {
      content += '<header class="first-child">';
      content += `<h2 id="custom_projection_screen_header">${translate["Edit projections"]}</h2>`;
      content += '<p id="actions">';
      content += `<button id="custom_projections_button_load_list" class="dark" onclick="custom_projection_screen.load_list()">${translate["Load"]}</button>`;
      content += `<button id="custom_projections_button_load_file" class="dark" onclick="custom_projection_screen.load_file()">${translate["Import"]}</button>`;
      if( false && login_screen_controller.user_level === user_level.DEVELOPER )
      {
        content += `<button class="dark" onclick="custom_projection_screen.add_projection()">${translate["Add projection"]}</button>`;
        content += `<button class="dark" onclick="custom_projection_screen.demo()">DEMO</button>`;
      }
      content += '</p>';
      content += '</header>';
    }

    content = Object.values( custom_projection_controller.projections ).sort_objects( "name" ).reduce( ( txt, projection, idx ) => txt + custom_projection_screen.generate_projection_element( projection, idx ), content );

    $( "#custom_projection_screen" ).html( content );
  },
  generate_projection_element: function( projection, idx )
  {
    let s = `<section class="row ${idx === 0 ? 'not-first-child' : ''}">`;

    /*
     * Text content part
     */
    s += '<div>';
    s += '<header>';
    s += `<h2>${projection.name}</h2>`;
    s += '</header>';

    s += `<p class="title" style="font-size:14px;">${projection.description_shown_short}</p>`;

    s += '</div>';

    /*
     * Buttons part
     */
    s += '<aside class="buttons">';
    s += '<div class="flex_fill"></div>';
    s += '<div class="flex_no_fill">';
    s += `<button class="dark" onclick="custom_projection_screen.edit_projection('${projection.name}')">${translate["Edit"]}</button>`;
    s += `<button class="dark" onclick="custom_projection_screen.more_projection('${projection.name}')">${translate["More"]}</button>`;
//    if( projection.copyable )
//      s += `<button class="dark" onclick="custom_projection_screen.copy_projection('${projection.name}')">${translate["Copy"]}</button>`;
//    if( projection.deleteable )
//      s += `<button class="red" onclick="custom_projection_screen.delete_projection('${projection.name}')">${translate["Delete"]}</button>`;
    s += '</div>';
    s += '<div class="flex_fill"></div>';
    s += '</aside>';

    s += '</section>';

    return s;
  },
  demo: function()
  {
    custom_projection_controller.test();
    custom_projection_screen.load_stored_projections();
  },
  delete_all: function()
  {
    popup_screen_controller.confirm_popup(
      translate["WarningCustomProjectionDeleteAll"],
      "",
      translate["OK"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();
        custom_projection_controller.remove_all();
        custom_projection_screen.load_stored_projections();
      },
      function()
      {
        popup_screen_controller.close();
      }
    );
  },
  delete_projection: function( projection_name )
  {
    popup_screen_controller.confirm_popup(
      translate["WarningCustomprojectionDelete"],
      "",
      translate["OK"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();
        custom_projection_controller.remove( projection_name );
        custom_projection_controller.save();
        custom_projection_screen.open();
      },
      function()
      {
        popup_screen_controller.close();
      }
    );
  },
  export_projection: function( projection_name )
  {
    popup_screen_controller.open_info_waiter( translate["Exporting"], translate["File is being exported to Tablet/%1s"].format( file_controller.tmr_directory_name ) );

    const scb = function( file )
    {
      popup_screen_controller.close_info_waiter();
      popup_screen_controller.confirm_popup( translate["File exported successfully"], translate['File was exported to Tablet/%1s as "%2s"'].format( file_controller.tmr_directory_name, file.name ), translate["OK"], "", popup_screen_controller.close );
    };
    const ecb = function( e )
    {

      let errorMsg = "";
      if( e.code )
      {
        if( e.code.code === 12 )
          errorMsg = translate["File name exists in Tablet/%1s"].format( file_controller.tmr_directory_name );
        else if( e.code.constant )
          errorMsg = e.code.constant;
      }

      popup_screen_controller.close_info_waiter();

      popup_screen_controller.confirm_popup( translate["ErrorDiagGenericHeader"], errorMsg ? translate["Could not export file. Reason: %1s"].format( errorMsg ) : translate["Could not save file"], translate["OK"], "", popup_screen_controller.close );
    };
    custom_projection_controller.export_projection( projection_name, scb, ecb );
  },

  more_projection: function( projection_name )
  {
    projection = custom_projection_controller.projections[projection_name];
    const buttons = [ ];

    if( projection.copyable )
      buttons.push( new PopButton( translate["Copy"], function()
      {
        pop_generator.close();
        custom_projection_screen.copy_projection( projection.name );
      } ) );

    if( window.cordova )
      buttons.push( new PopButton( translate["Export"], function()
      {
        pop_generator.close();
        custom_projection_screen.export_projection( projection.name );
      } ) );

    if( projection.deleteable )
      buttons.push( new PopButton( translate["Delete"], function()
      {
        pop_generator.close();
        custom_projection_screen.delete_projection( projection.name );
      }, "red" ) );

    pop_generator.create_popup( translate["Choose an action"], "", buttons, pop_generator.close );
  },
  add_projection: function()
  {
    custom_projection_screen.edit_projection( null );
  },
  edit_projection: function( projection_name )
  {
    custom_projection_screen.open_edit_page( projection_name, false );
  },
  copy_projection: function( projection_name )
  {
    custom_projection_screen.open_edit_page( projection_name, true );
  },
  edit_back: function( callback )
  {
    const ok = function()
    {
      popup_screen_controller.close();
      if( callback )
        callback();
      else
        settings_screeen_controller.breadcrumb.back( true );
      custom_projection_screen._projection = null;
    };
    const cancel = function()
    {
      popup_screen_controller.close();
    };

    if( custom_projection_screen._state === "add" || custom_projection_screen.edit_page_diff() )
      popup_screen_controller.confirm_popup( translate["WarningUnsavedData"], "", translate["OK"], translate["Cancel"], ok, cancel );
    else
      ok();
  },
  _projection: null,
  _projection_original: null,
  _state: null,
  _init_edit_page: false,
  init_edit_page: function()
  {
    if( custom_projection_screen._init_edit_page )
      return;

    custom_projection_screen._init_edit_page = true;

    autoscale_textarea( "#custom_projection_edit_form_proj4" );
  },
  open_edit_page: function( projection_name, copy )
  {
    custom_projection_screen.init_edit_page();

    q$( "#custom_projection_screen_edit_projection_page_header" ).text( projection_name ? translate["Edit projection"] : translate["Add projection"] );

    // Reset form
    q$( "#custom_projection_screen_edit_form" ).get( 0 ).reset();

    if( projection_name && copy )
      custom_projection_screen._state = "copy";
    else if( projection_name )
      custom_projection_screen._state = "edit";
    else
      custom_projection_screen._state = "add";

    console.log( "Projection", custom_projection_screen._state );

    custom_projection_screen._projection = null;
    custom_projection_screen._projection_original = null;

    if( custom_projection_screen._state !== "add" )
    {
      custom_projection_screen._projection = custom_projection_controller.projections[projection_name].copy();

      if( custom_projection_screen._state === "copy" )
        custom_projection_screen._projection.name += ` (${translate["ItemCopy"]})`;

      custom_projection_screen._projection_original = custom_projection_screen._projection.copy();
      custom_projection_screen.refresh_page_content( custom_projection_screen._projection );
    }

    settings_screeen_controller.choose_menu( 'position_settings_header', 'custom_projection_screen_edit_projection_page', false, q$text( "#custom_projection_screen_edit_projection_page_header" ).text() );
  },
  refresh_page_content: function( projection )
  {
    if( !projection )
      projection = {};

    q$( "#custom_projection_edit_form_name" ).val( projection.name ? projection.name : "" ).change();
    q$( "#custom_projection_edit_form_description" ).val( projection.description ? projection.description : "" ).change();
    q$( "#custom_projection_edit_form_proj4" ).val( projection.proj4 ? projection.proj4 : "" ).change();
  },
  edit_page_diff: function()
  {
    let old = custom_projection_screen._projection;
    if( !old )
      old = {};
    const diff = function( old_val, new_val )
    {
      return (old_val ? old_val : "") !== (new_val ? new_val : "");
    };

    let diffs = [ ];
    diffs.push( diff( old.name, q$( "#custom_projection_edit_form_name" ).val() ) );
    diffs.push( diff( old.description, q$( "#custom_projection_edit_form_description" ).val() ) );
    diffs.push( diff( old.proj4, q$( "#custom_projection_edit_form_proj4" ).val() ) );

    return diffs.indexOf( true ) !== -1;

  },
  save_settings: function()
  {
    let name = q$( "#custom_projection_edit_form_name" ).val().trim();

    if( false && !name )
      name = translate["Projection"];

    if( custom_projection_screen._state === "add" )
      custom_projection_screen._projection = new CustomProjection( name );

    custom_projection_screen._projection.name = name;

    custom_projection_screen._projection.description = $( "#custom_projection_edit_form_description" ).val().trim();
    custom_projection_screen._projection.proj4 = $( "#custom_projection_edit_form_proj4" ).val().trim();

  },
  save_projection: function()
  {
    try
    {
      let current_projection = custom_projection_screen._projection_original;
      if( !current_projection )
        current_projection = {};
      custom_projection_screen.save_settings();

      const save_projection_finalize = function()
      {
        if( custom_projection_screen._projection.name !== current_projection.name )
          custom_projection_controller.remove( current_projection.name );

        const new_proj_with_prefix = custom_projection_screen._projection.copy();
        new_proj_with_prefix.name = custom_projection_controller.prefix + new_proj_with_prefix.name;
        position_settings_screen.recently_used.update_single( custom_projection_controller.prefix + current_projection.name, new_proj_with_prefix );
        custom_projection_controller.save();
        custom_projection_controller.update_projections();

        settings_screeen_controller.breadcrumb.back( true );
      };

      if( custom_projection_controller.projection_exists( custom_projection_screen._projection.name ) && custom_projection_screen._projection.name !== current_projection.name )
      {
        popup_screen_controller.confirm_popup(
          translate["WarningCustomProjectionNameExist"],
          "",
          translate["Overwrite"],
          translate["Cancel"],
          function()
          {
            popup_screen_controller.close();
            custom_projection_controller.edit( custom_projection_screen._projection, false, true );
            save_projection_finalize();
            custom_projection_screen.open();
          },
          function()
          {
            popup_screen_controller.close();
          },
          "red"
          );
        return;
      }
      else if( custom_projection_screen._state === "edit" )
        custom_projection_controller.edit( custom_projection_screen._projection );
      else
        custom_projection_controller.add( custom_projection_screen._projection );

      save_projection_finalize();

    }
    catch( e )
    {
      uncaughtErrorSend( e.stack ? e.stack : e );
      console.error( e );

      let diag_header = translate["ErrorDiagBadCustomProjectionHeader"];
      let diag_body;
      switch( e )
      {
        case "Illegal character in name":
          diag_body = translate["Name must not contain the following characters: %1s"].format( custom_projection_controller.illegal_name_characters.reduce( ( a, b ) => a += b, "" ) );
          break;
        case `No name provided`:
          diag_body = translate["Please provide a name."];
          break;
        case `Projection invalid`:
          diag_body = translate["The projection text is invalid."];
          break;
        default:
          diag_body = translate["ErrorDiagBadCustomProjectionBody"];
      }

      popup_screen_controller.confirm_popup( diag_header, diag_body, translate["OK"], undefined, function()
      {
        popup_screen_controller.close();
      } );
    }
  }
};

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "custom_projection_screen" )
    custom_projection_screen.load_stored_projections();
} );

event_controller.add_callback( "leaving_settings_menu", function( old_screen_name, new_screen_name, callback, activated )
{
  if( old_screen_name === "custom_projection_screen_edit_projection_page" )
  {
    activated.result = true;
    custom_projection_screen.edit_back( callback );
  }
} );