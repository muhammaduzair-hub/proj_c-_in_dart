/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global event_controller, custom_map_controller, settings_screeen_controller, map_controller, translate, popup_screen_controller, login_screen_controller, file_loader_screen */

var custom_map_screen = {
//  label_state: false,
//  label_state_soft: false,
  open: function( )
  {
    settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'custom_map_screen', false, translate["Edit maps"] );
  },
  load_stored_maps: function()
  {
    custom_map_controller.load();
    console.log( "Loaded stored custom maps" );

    map_controller.background.refresh_background();

    let content = '';
    {
      content += '<header class="first-child">';
      content += `<h2 id="custom_map_screen_header">${translate["Edit maps"]}</h2>`;
      content += '<p id="actions">';
      content += `<button class="dark" onclick="custom_map_screen.add_map()">${translate["Add map"]}</button>`;
//      content += `<button class="dark" onclick="custom_map_screen.delete_all()">${translate["Delete all maps"]}</button>`;
      if( login_screen_controller.user_level === user_level.DEVELOPER )
        content += `<button class="dark" onclick="custom_map_screen.demo()">${translate["DEMO"]}</button>`;
      content += '</p>';
      content += '</header>';
    }

    content = custom_map_controller.maps.reduce( ( txt, map, idx ) => txt + custom_map_screen.generate_map_element( map, idx ), content );

    $( "#custom_map_screen" ).html( content );
  },
  generate_map_element: function( map, idx )
  {
    let s = `<section class="row ${idx === 0 ? 'not-first-child' : ''}">`;

    /*
     * Toggle part
     */
    s += '<aside class="toggle">';
    s += '<div class="flex_fill"></div>';
    s += '<div class="flex_no_fill">';
    s += `<input type="checkbox" onclick="custom_map_screen.toggle_map('${map.name}')"${map.active ? ' checked="checked"' : ''}>`;
    s += '</div>';
    s += '<div class="flex_fill"></div>';
    s += '</aside>';

    /*
     * Text content part
     */
    s += '<div>';
    s += '<header>';

    if( map.name === "bing" )
      s += `<h2>${translate["Defaultmap"]}</h2>`;
    else
      s += `<h2>${map.name}</h2>`;

    s += '</header>';


    if( map.has_selected_layer() )
    {
      const layer = map.get_selected_layers()[0];

//      s += ` (${map.get_selected_layers().map( layer => layer.Title ).toString()})`;

      if( layer.Name === 'Aerial' || layer.Name === 'AerialWithLabelsOnDemand' )
        s += `<p class="title">${translate[layer.Title]}</p>`;
      else
        s += `<p class="title">${layer.Title}</p>`;

      if( false && layer.Abstract )
      {
        s += `<p class="abstract">${layer.Abstract}</p>`;
      }
    }
    else
    {
      s += '<p class="title">' + translate["NoLayerSelected"].toUpperCase() + '</p>';
    }

    s += '</div>';

    /*
     * Buttons part
     */
    s += '<aside class="buttons">';
    s += '<div class="flex_fill"></div>';
    s += '<div class="flex_no_fill">';
    s += `<button class="dark" onclick="custom_map_screen.edit_map('${map.name}')">${translate["Edit"]}</button>`;
    if( map.copyable )
      s += `<button class="dark" onclick="custom_map_screen.copy_map('${map.name}')">${translate["Copy"]}</button>`;
    if( map.deleteable )
      s += `<button class="red" onclick="custom_map_screen.delete_map('${map.name}')">${translate["Delete"]}</button>`;
    s += '</div>';
    s += '<div class="flex_fill"></div>';
    s += '</aside>';

    /*
     * Arrows part
     */
    s += '<aside class="arrows">';
    s += `<img src="img/icons/gray_single_arrow_up.png" class="up ${idx === 0 ? 'gone' : ''}" onclick="custom_map_screen.move_map_up('${map.name}')">`;
    s += '<div class="flex_fill"></div>';
    s += `<img src="img/icons/gray_single_arrow_up.png" class="down ${idx === custom_map_controller.maps.length - 1 ? 'gone' : ''}" onclick="custom_map_screen.move_map_down('${map.name}')">`;
    s += '</aside>';

    s += '</section>';

    return s;
  },
  demo: function()
  {
    custom_map_controller.init_test();
    custom_map_screen.load_stored_maps();
  },
  toggle_map: function( map_name )
  {
    custom_map_controller.toggle_map( map_name );
    custom_map_controller.save();
    custom_map_screen.load_stored_maps();
  },
  move_map_up: function( map_name )
  {
    custom_map_controller.move_up( map_name );
    custom_map_controller.save();
    custom_map_screen.load_stored_maps();
  },
  move_map_down: function( map_name )
  {
    custom_map_controller.move_down( map_name );
    custom_map_controller.save();
    custom_map_screen.load_stored_maps();
  },
  delete_all: function()
  {
    popup_screen_controller.confirm_popup(
      translate["WarningCustomMapDeleteAll"],
      "",
      translate["OK"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();
        custom_map_controller.delete_all();
        custom_map_screen.load_stored_maps();
      },
      function()
      {
        popup_screen_controller.close();
      }
    );
  },
  delete_map: function( map_name )
  {
    popup_screen_controller.confirm_popup(
      translate["WarningCustomMapDelete"],
      "",
      translate["OK"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();
        custom_map_controller.delete_map_by_name( map_name );
        custom_map_controller.save();
        custom_map_screen.open();
      },
      function()
      {
        popup_screen_controller.close();
      }
    );
  },

  add_map: function()
  {
    custom_map_screen.edit_map( null );
  },
  edit_map: function( map_name )
  {
    custom_map_screen.open_edit_page( map_name, false );
  },
  copy_map: function( map_name )
  {
    custom_map_screen.open_edit_page( map_name, true );
  },
  edit_back: function( callback )
  {
    popup_screen_controller.confirm_popup(
      translate["WarningUnsavedData"],
      "",
      translate["OK"],
      translate["Cancel"],
      function()
      {
        popup_screen_controller.close();
        if( callback )
          callback();
        else
          settings_screeen_controller.breadcrumb.back( true );
      },
      function()
      {
        popup_screen_controller.close();
      }
    );
  },
  _map: null,
  _state: null,
  open_edit_page: function( map_name, copy )
  {

    $( "#custom_map_screen_edit_map_page_header" ).html( map_name ? translate["Edit map"] : translate["Add map"] );
    $( "#custom_map_screen_edit_form" ).get( 0 ).reset();
    $( "#custom_map_edit_form_layer" ).html( "" );
    $( "#custom_map_edit_form_layer_table" ).addClass( "gone" );
    $( "#custom_map_edit_form_layer_abstract" ).html( "" );
    $( "#custom_map_edit_form_layer_abstract_table" ).addClass( "gone" );
    $( "#custom_map_screen_edit_map_page #load_layers_button" ).html( translate["Load layers"] );

    if( map_name && copy )
      custom_map_screen._state = "copy";
    else if( map_name )
      custom_map_screen._state = "edit";
    else
      custom_map_screen._state = "add";

    if( custom_map_screen._state === "edit" || custom_map_screen._state === "copy" )
    {
      custom_map_screen._map = custom_map_controller.get_map_by_name( map_name ).copy();
      if( custom_map_screen._map.name === "bing" )
      {
        $( "#custom_map_edit_form_name" ).val( translate["Defaultmap"] );
        $( "#custom_map_edit_form_name" ).prop( "disabled", true );
        $( ".custom_map_edit_form_resource" ).addClass( "gone" );
      }
      else
      {
        const new_name = custom_map_screen._map.name + (custom_map_screen._state === "copy" ? ` (${translate["ItemCopy"]})` : "")
        $( "#custom_map_edit_form_name" ).val( new_name );
        custom_map_screen._map.name = new_name;
        $( "#custom_map_edit_form_name" ).prop( "disabled", false );
        $( ".custom_map_edit_form_resource" ).removeClass( "gone" );
      }
//      $( "#custom_map_edit_form_url" ).val( custom_map_screen._map.url );
//      $( "#custom_map_edit_form_token" ).val( custom_map_screen._map.auth.token );
//      $( "#custom_map_edit_form_username" ).val( custom_map_screen._map.auth.username );
//      $( "#custom_map_edit_form_password" ).val( custom_map_screen._map.auth.password );
//      $( "#custom_map_edit_form_raw_url" ).val( custom_map_screen._map.raw_url );

      if( custom_map_screen._map.has_selected_layer() )
      {
        custom_map_screen.got_capabilities();
      }

      if( custom_map_screen._map.service )
      {
        $( "#custom_map_edit_form_service" ).val( custom_map_screen._map.service.toLowerCase() );
      }
    }
    else if(custom_map_screen._state === "add")
    {
      $( "#custom_map_edit_form_name" ).val("");
      $( "#custom_map_edit_form_name" ).prop( "disabled", false );
      $( ".custom_map_edit_form_resource" ).removeClass( "gone" );
    }

    custom_map_screen.refresh_page_content();

    settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'custom_map_screen_edit_map_page', false, $( "#custom_map_screen_edit_map_page_header" ).html() );
  },
  refresh_page_content: function()
  {
    const url = $( "#custom_map_edit_form_url" ).val();
    const token = $( "#custom_map_edit_form_token" ).val();
    const username = $( "#custom_map_edit_form_username" ).val();
    const password = $( "#custom_map_edit_form_password" ).val();
    const raw_url = $( "#custom_map_edit_form_raw_url" ).val();

    if( url || token || username || password )
    {
      $( "#custom_map_edit_form_raw_url" ).prop( "disabled", true );
      if( token )
      {
        $( "#custom_map_edit_form_username" ).prop( "disabled", true );
        $( "#custom_map_edit_form_password" ).prop( "disabled", true );
      }
      else
      {
        $( "#custom_map_edit_form_username" ).prop( "disabled", false );
        $( "#custom_map_edit_form_password" ).prop( "disabled", false );
      }

      if( username || password )
        $( "#custom_map_edit_form_token" ).prop( "disabled", true );
      else
        $( "#custom_map_edit_form_token" ).prop( "disabled", false );
    }
    else
      $( "#custom_map_edit_form_raw_url" ).prop( "disabled", false );

    if( raw_url )
    {
      $( "#custom_map_edit_form_url" ).prop( "disabled", true );
      $( "#custom_map_edit_form_token" ).prop( "disabled", true );
      $( "#custom_map_edit_form_username" ).prop( "disabled", true );
      $( "#custom_map_edit_form_password" ).prop( "disabled", true );
    }
    else
    {
      $( "#custom_map_edit_form_url" ).prop( "disabled", false );
      $( "#custom_map_edit_form_token" ).prop( "disabled", false );
      $( "#custom_map_edit_form_username" ).prop( "disabled", false );
      $( "#custom_map_edit_form_password" ).prop( "disabled", false );
    }

    if( (url && token) || (url && username && password) || raw_url )
      $( "#load_layers_button" ).prop( "disabled", false );
    else
      $( "#load_layers_button" ).prop( "disabled", true );
  },
  save_settings: function()
  {

    let name = $( "#custom_map_edit_form_name" ).val();
    if( !name )
      name = translate["Map"];
    const service = $( "#custom_map_edit_form_service" ).val();
//    const url = $( "#custom_map_edit_form_url" ).val();
//    const token = $( "#custom_map_edit_form_token" ).val();
//    const username = $( "#custom_map_edit_form_username" ).val();
//    const password = $( "#custom_map_edit_form_password" ).val();
//    const raw_url = $( "#custom_map_edit_form_raw_url" ).val();

    if( custom_map_screen._map )
    {
      if( custom_map_screen._map.name !== "bing" )
        custom_map_screen._map.change_name( name );
      custom_map_screen._map.service = service;
//      custom_map_screen._map.url = url;
//      custom_map_screen._map.raw_url = raw_url;
//      custom_map_screen._map.auth.token = token ? token : null;
//      custom_map_screen._map.auth.username = username ? username : null;
//      custom_map_screen._map.auth.password = password ? password : null;
    }
    else
    {
      custom_map_screen._map = new CustomMap( name, {
        service: service
//        url: url,
//        version: "1.1.1",
//        auth: {
//          token: token,
//          username: username,
//          password: password
//        },
//        raw_url: raw_url
      } );
    }
  },
  load_file: function()
  {
    custom_map_screen.save_settings();
    const legalExtensions = ["xml"];
    const requirements = [file_controller.requirements.NONE];
    file_loader_screen.open( legalExtensions, requirements, custom_map_screen.load_capabilities_file, custom_map_screen.got_capabilities );
  },
  load_capabilities_file( file_entry, callback, data )
  {
    custom_map_screen._map.parse_capabilities( data );

    custom_map_screen.load_source_timeout = setTimeout( function()
    {
      $( "#custom_map_screen_edit_map_page #load_layers_button" ).html( translate["Loading"] + '<div class="lds-ring lds-ring-button-scale"><div></div><div></div><div></div><div></div></div>' );
    }, 250 );

    callback();
  },
  load_source: function()
  {

    custom_map_screen.save_settings();

    event_controller.add_callback( "got_custom_map_capabilities", custom_map_screen.got_capabilities );
    custom_map_screen._map.get_capabilities();

    custom_map_screen.load_source_timeout = setTimeout( function()
    {
      $( "#custom_map_screen_edit_map_page #load_layers_button" ).html( translate["Loading"] + '<div class="lds-ring lds-ring-button-scale"><div></div><div></div><div></div><div></div></div>' );
    }, 250 );

  },
  load_source_timeout: null,
  got_capabilities: function()
  {
    event_controller.remove_callback( "got_custom_map_capabilities", custom_map_screen.got_capabilities );
    clearTimeout( custom_map_screen.load_source_timeout );

    $( "#custom_map_screen_edit_map_page #load_layers_button" ).html( translate["Load layers"] );

    let selected = "";
    if( custom_map_screen._map.has_selected_layer() )
      selected = custom_map_screen._map.get_selected_layer_names()[0];
    else
      selected = custom_map_screen._map.layers[0].Name;

    const options = custom_map_screen._map.layers.reduce( ( txt, layer ) => {
      let s = `<option onclick="custom_map_screen.layer_changed()" value="${layer.Name}">`;
      if( layer.Name === 'Aerial' || layer.Name === 'AerialWithLabelsOnDemand' )
        s += translate[layer.Title];
      else
        s += layer.Title ? layer.Title : layer.Name;
      s += '</option>';
      return txt + s;
    }, "" );

    $( "#custom_map_edit_form_layer" ).html( options );
    $( "#custom_map_edit_form_layer" ).val( selected );
    $( "#custom_map_edit_form_layer_table" ).removeClass( "gone" );
    custom_map_screen.layer_changed();

  },
  layer_changed: function()
  {
    const layer_name = $( "#custom_map_edit_form_layer" ).val();
    console.warn( "YOU SELECTED ", layer_name );
    const abstracts = custom_map_screen._map.layers.filter( layer => layer.Name === layer_name );

    if( abstracts.length === 0 )
    {
      console.warn( "Could not find layer" );
      $( "#custom_map_edit_form_layer_abstract_table" ).addClass( "gone" );
      return;
    }

    if( abstracts[0].Abstract )
    {
      $( "#custom_map_edit_form_layer_abstract" ).html( abstracts[0].Abstract );
      $( "#custom_map_edit_form_layer_abstract_table" ).removeClass( "gone" );
    }
    else
    {
      $( "#custom_map_edit_form_layer_abstract" ).html( "" );
      $( "#custom_map_edit_form_layer_abstract_table" ).addClass( "gone" );
    }

  },
  save_map: function()
  {
    const layer = $( "#custom_map_edit_form_layer" ).val();
    if( layer )
      custom_map_screen._map.use_layer( custom_map_screen._map.get_layer_by_name( layer ) );

    const old_map_name = custom_map_screen._map.name + "";

    try
    {
      custom_map_screen.save_settings();

      // Check settings
      custom_map_screen._map.options;

      const save_map_finalize = function()
      {
        custom_map_controller.save();
        map_controller.background.refresh_background();

        settings_screeen_controller.breadcrumb.back( true );
      };

      if( custom_map_screen._state !== "edit" && custom_map_controller.map_exists( custom_map_screen._map.name ) )
      {
        popup_screen_controller.confirm_popup(
          translate["WarningCustomMapNameExist"],
          "",
          translate["Overwrite"],
          translate["Cancel"],
          function()
          {
            popup_screen_controller.close();
            custom_map_controller.edit_map( custom_map_screen._map );
            save_map_finalize();
          },
          function()
          {
            popup_screen_controller.close();
          }
        );
        return;
      }
      else if( custom_map_screen._state === "edit" )
        custom_map_controller.edit_map( custom_map_screen._map, old_map_name );
      else
        custom_map_controller.edit_map( custom_map_screen._map );

      save_map_finalize();

    }
    catch( e )
    {
      uncaughtErrorSend( e.stack ? e.stack : e );
      console.error( e );

      var diag_header = translate["ErrorDiagBadCustomMapHeader"];
      var diag_body = translate["ErrorDiagBadCustomMapBody"];

      popup_screen_controller.confirm_popup( diag_header, diag_body, translate["OK"], undefined, function()
      {
        popup_screen_controller.close();
      } );
    }
  }
};

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "custom_map_screen" )
    custom_map_screen.load_stored_maps();
} );

event_controller.add_callback( "leaving_settings_menu", function( old_screen_name, new_screen_name, callback, activated )
{
  if( old_screen_name === "custom_map_screen_edit_map_page" )
  {
    activated.result = true;
    custom_map_screen.edit_back( callback );
  }
} );