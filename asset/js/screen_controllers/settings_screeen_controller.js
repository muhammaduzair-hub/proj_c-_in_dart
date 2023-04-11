const nozzleTypes = {
  FAN: "fan",
  CONE: "cone"
};
Object.freeze(nozzleTypes);

const settings_screeen_controller = {
  is_open: false,
  chosen_menu: 'general_settings_screen',
  chosen_menu_item: '',
  hide: [ ],
  nozzle_type: nozzleTypes.FAN,
  paint_width: 0.1,
  paint_length: 0.04,
  _chosen_file: "",
  _imported_files: {},

  get chosen_file(){
    return this._chosen_file;
  },
  set chosen_file(v){
    this._chosen_file = v;
  },
  get imported_files(){
    return this._imported_files;
  },
  set imported_files(v){
    this._imported_files = v;
  },
  choose_imported_file( element ){
    const val = $(element).val();
    if(!val){
      return;
    }
    settings_screeen_controller.chosen_file = val;
    settings_screeen_controller.update(settings_screeen_controller.chosen_file);
  },
  fill_up_imported_files_dropdown(default_value = null){
    let select = $("#choose_layers_files_dropdown");
    let keys = Object.keys(settings_screeen_controller.imported_files);
    select.empty();
    keys.forEach(layer =>{
      let opt = layer;
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        if(default_value === keys[layer]){
          el.selected = "selected";
        }
        select.append(el);
    });

  },
  open: function()
  {
    settings_screeen_controller.is_open = true;
    $("#choose_layers_select_all").text(translate["Select all"]);
    $("#choose_layers_deselect_all").text(translate["Deselect all"]);
    settings_screeen_controller.fill_up_imported_files_dropdown(settings_screeen_controller.chosen_file);
    settings_screeen_controller.update(settings_screeen_controller.chosen_file);
    $( "#settings_screen" ).removeClass( "gone" );

    event_controller.call_callback( "open_settings_menu", settings_screeen_controller.chosen_menu );
    setTimeout( function()
    {
      //$( "#settings_screen" ).height( $( "#settings_screen" ).height() );
    }, 100 );
  },
  updateSettingsMenuButton() {
    const lock = [
      edit_pitch_screen_controller.isOpen,
      copy_pitch_screen_controller.isOpen,
    ];

    const isLocked = lock.filter(l=>l).length > 0;

    if(isLocked) {
      $("#settings_icon_space").attr("disabled",true).off('click').on('click',()=>popup_screen_controller.confirm_popup_with_options({
        header: translate["You can't do that right now"],
        body: translate["You cannot go here right now because you are editing a layout"],
        ok_text: translate["Ok"],
        ok_callback: popup_screen_controller.close
      }));
    } else {
      $("#settings_icon_space").attr("disabled",false).off('click').on('click',settings_screeen_controller.open);
    }
  },
  set_paint_width()
  {
    const paint_width_ls = parseFloat(localStorage.getItem("robot.paint_width"));
    settings_screeen_controller.paint_width = isNaN(paint_width_ls) ? SETTINGS.default_paint_width : paint_width_ls;
  },
  repaint_content: function()
  {
    var siteHeader = document.getElementById( 'content_area' );

    siteHeader.style.display = 'none';
    siteHeader.offsetHeight; // no need to store this anywhere, the reference is enough
    siteHeader.style.display = 'block';
  },
  choose_menu: function( id, content_id, scroll_to, content_title )
  {
    const callback = function()
    {
      settings_screeen_controller.choose_menu_action( id, content_id, scroll_to, content_title );
    };
    const something_activated = {
      result: false
    };

    const something_called = event_controller.call_callback( "leaving_settings_menu", settings_screeen_controller.chosen_menu, content_id, callback, something_activated );
    if( something_called && something_activated.result )
      return;
    else
      callback();

  },
  choose_menu_action: function( id, content_id, scroll_to, content_title )
  {
    const old = settings_screeen_controller.chosen_menu;
    settings_screeen_controller.chosen_menu = content_id;
    const old_item = settings_screeen_controller.chosen_menu_item;
    settings_screeen_controller.chosen_menu_item = id;

    $( "#settings_screen #menu_select h2" ).removeClass( "selected" );
    $( "#settings_screen #menu_select ." + id ).addClass( "selected" );

//    settings_screeen_controller.set_breadcrumb( breadcrumb, (breadcrumb && breadcrumb.length > 1 ? old : undefined) );
    if( old_item !== settings_screeen_controller.chosen_menu_item || settings_screeen_controller.breadcrumb.is_root( settings_screeen_controller.chosen_menu ) )
      settings_screeen_controller.breadcrumb.reset_to( settings_screeen_controller.chosen_menu, $( "#settings_screen #menu_select ." + id ).html() );
    else if( !!content_title )
      settings_screeen_controller.breadcrumb.update_to( settings_screeen_controller.chosen_menu, content_title );
    else if( content_title === false )
    {
      settings_screeen_controller.breadcrumb.delete_last();
      settings_screeen_controller.breadcrumb.update();
    }
    else
      settings_screeen_controller.breadcrumb.update();

    $( "#settings_screen #content_area > div" ).addClass( "gone" );
    $( "#settings_screen #content_area #" + content_id ).removeClass( "gone" );
    $( "#settings_screen #content_area #" + content_id + " > div" ).removeClass( "gone" );

    if( scroll_to )
    {
      $( "#settings_screen #content_area" ).animate( {
        scrollTop: $( scroll_to ).offset().top
      }, 125 );
    }

    if( settings_screeen_controller.chosen_menu === "console_screen" )
      console_screen_controller.update_screen();

    if( content_id === "communication_settings_screen" )
      robot_communication_settings_screen.open();

    if( content_id === "help_screen" )
      help_screen.open();

    if( settings_screeen_controller.chosen_menu === "robot_settings_menu" )
      settings_screeen_controller.open_robot_settings();

    event_controller.call_callback( "close_settings_menu", old );
    event_controller.call_callback( "open_settings_menu", settings_screeen_controller.chosen_menu );

    if( window.cordova && window.device && device.model === "SM-T719" )
      setTimeout( settings_screeen_controller.repaint_content, 0 );

  },
  breadcrumb: {
    _items: [ ],
    add_item: function( content_id, content_title )
    {
      const last = settings_screeen_controller.breadcrumb._items.last();
      if( !(last && last[0] === content_id && last[1] === content_title) )
        settings_screeen_controller.breadcrumb._items.push( [ content_id, content_title ] );
    },
    delete_last: function()
    {
      settings_screeen_controller.breadcrumb._items.pop();
    },
    back: function( force )
    {
      const n = settings_screeen_controller.breadcrumb._items.length;

      if( n < 2 )
      {
        settings_screeen_controller.close();
      }
      else
      {
        const destination = settings_screeen_controller.breadcrumb._items[n - 2];
        if( force )
          settings_screeen_controller.choose_menu_action( settings_screeen_controller.chosen_menu_item, destination[0], false, false );
        else
          settings_screeen_controller.choose_menu( settings_screeen_controller.chosen_menu_item, destination[0], false, false );
      }
    },
    exists: function( content_id )
    {
      const items = settings_screeen_controller.breadcrumb._items;
      for( let i = 0; i < items.length; i++ )
        if( items[i][0] === content_id )
          return true;
      return false;
    },
    is_root: function( content_id )
    {
      return settings_screeen_controller.breadcrumb._items[0][0] === content_id;
    },
    update: function()
    {

      const items = settings_screeen_controller.breadcrumb._items;
      $( "#breadcrumb" ).html( items.reduce( ( txt, part, idx ) => {
        if( idx > 0 )
          txt += `<span class="delim">»</span>`;
        txt += `<span class="title">${part[1]}</span>`;
        return txt;
      }, (items.length > 1 ? '<img src="img/icons/gray_single_arrow.png" />' : "") ) );
    },
    update_to: function( content_id, content_title )
    {
      settings_screeen_controller.breadcrumb.add_item( content_id, content_title );
      settings_screeen_controller.breadcrumb.update();
    },
    reset_to: function( content_id, content_title )
    {
      if( !content_id && !content_title )
      {
        content_id = settings_screeen_controller.chosen_menu;
        content_title = $( "#settings_screen #menu_select ." + settings_screeen_controller.chosen_menu_item ).html();
      }
      settings_screeen_controller.breadcrumb._items = [ ];
      settings_screeen_controller.breadcrumb.update_to( content_id, content_title );
    },
    add_callback_to_last: function( callback )
    {
      const n = settings_screeen_controller.breadcrumb._items.length;
      settings_screeen_controller.breadcrumb._items[n - 1].push( callback );
    },
    delete_callback_from_last: function()
    {
      const n = settings_screeen_controller.breadcrumb._items.length;
      settings_screeen_controller.breadcrumb._items[n - 1].splice( 2 );
    }

  },
  update: function(chosen_file = null)
  {
    if( !settings_screeen_controller.is_open )
      return;
    var template_ids = pt.list;

    if( pt.templates.length )
    {
      template_ids = template_ids.filter( function( template_id )
      {
        return pt.templates.indexOf( template_id ) >= 0;
      } );
    }

    $( "#locale_settings_screen #language_buttons" ).empty();
    translation.language_names.forEach( function( name, i )
    {
      var html = "";
      if( translation.languages[i] === translation.language )
      {
        html = '<button class="chosen">' + name + '</button>';
      }
      else
      {
        html = '<button class="bright" onclick="settings_screeen_controller.choose_language(' + i + ')">' + name + '</button>';
      }
      $( "#locale_settings_screen #language_buttons" ).append( html );
    } );
    if(settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file]){
      if( settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file].length > 0)
      {
        document.querySelector("#choose_layers_files_dropdown").value = settings_screeen_controller.chosen_file;
        var layers = settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file];
  
        $( "#layers_table tbody" ).empty();
  
        layers.forEach( function( layer_name )
        {
          let html;
          if( file_loader_screen.hide_layers[layer_name] )
            html = `<tr><td><input                   type="checkbox" onclick="settings_screeen_controller.toggle_layer('${layer_name}', true)" name="${layer_name}" value="valuable" id="${layer_name}"/></td><td><p class="checkbox-label"><label for="${layer_name}">${layer_name}</label></p></td></tr>`;
          else
            html = `<tr><td><input checked="checked" type="checkbox" onclick="settings_screeen_controller.toggle_layer('${layer_name}', false)" name="${layer_name}" value="valuable" id="${layer_name}"/></td><td><p class="checkbox-label"><label for="${layer_name}">${layer_name}</label></p></td></tr>`;
          $( "#layers_table tbody" ).append( html );
        } );
  
        $( ".choose_layers_header" ).removeClass( "gone" );
        $( "#choose_layers_devider" ).removeClass( "gone" );
  
      }
    }
    else
    {
      $( ".choose_layers_header" ).addClass( "gone" );
      $( "#choose_layers_devider" ).addClass( "gone" );
    }
    


    $( "#settings_screen #show_pitches" ).empty();
    var pitch_types = Object.keys( pt.pitches );
    //pitch_types = pitch_types.concat( pitch_types ).concat( pitch_types );
    var lists = [ ];
    pitch_types.forEach( function( type )
    {
      type = type.trim();
      var header_name = "header_" + type;
      var html = '<div class="pitch_collection">';

      var one_hidden = false;
      var number_of_templates = 0;
      if( pt.pitches[type].length > 1 || true )
      {
        pt.pitches[type].forEach( function( template )
        {
          if( template_ids.indexOf( template ) === -1 )
            return;

          number_of_templates++;
          var templ_name = "template_" + template;
          var tmp_template = new pt[template]();
          var tmtl_title = tmp_template.template_title;
          //var title = translate[pt[template].template_title] ? translate[pt[template].template_title] : pt[template].template_title;
          var title = translate[tmtl_title] ? translate[tmtl_title] : tmtl_title;

          if( settings_screeen_controller.template_hidden( template ) )
          {
            html += '<table><tr><td><input onclick="settings_screeen_controller.toggle_hide(\'' + template + '\')" type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" style="margin-left:50px"/></td><td><p class="checkbox-label"><label for="' + templ_name + '">' + title + '</label></p></td></tr></table>';
            one_hidden = true;
          }
          else
          {
            html += '<table><tr><td><input checked="checked" onclick="settings_screeen_controller.toggle_hide(\'' + template + '\')" type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" style="margin-left:50px"/></td><td><p class="checkbox-label"><label for="' + templ_name + '">' + title + '</label></p></td></tr></table>';
          }

        } );
      }

      var type_title = translate[type] ? translate[type] : type;
      if( number_of_templates === 1 )
        html = "";
      if( one_hidden )
      {
        html = '<table><tr><td><input type="checkbox" onclick="settings_screeen_controller.show_all_of_type(\'' + type + '\')" name="' + header_name + '" value="valuable" id="' + header_name + '"/></td><td><p class="checkbox-label"><label for="' + header_name + '">' + type_title + '</label></p></td></tr></table>' + html;
      }
      else
      {
        html = '<table><tr><td><input type="checkbox" onclick="settings_screeen_controller.hide_all_of_type(\'' + type + '\')" checked="checked" name="' + header_name + '" value="valuable" id="' + header_name + '"/></td><td><p class="checkbox-label"><label for="' + header_name + '">' + type_title + '</label></p></td></tr></table>' + html;
      }
      html += '</div>';
      if( number_of_templates )
      {
        html = '<div style="float:left">' + html + "</div>";
        //$( "#settings_screen #show_pitches" ).append( html );
        lists.push( [ html, number_of_templates > 1 ? (number_of_templates + 1) : number_of_templates ] );
      }
    } );
    lists = lists.sort( function( a, b )
    {
      return (a[1] < b[1]);
    } );
    lists.forEach( function( html )
    {
      $( "#settings_screen #show_pitches" ).append( html[0] );
    } );
    /////   SET SPEEDS  /////
    // JOYSTICK SPEEDS
    $( "#settings_screen #joystick_speed_content #normal_speed_button" ).removeClass( "chosen" ).addClass( "bright" );
    $( "#settings_screen #joystick_speed_content #slow_speed_button" ).removeClass( "chosen" ).addClass( "bright" );
    $( "#settings_screen #joystick_speed_content #fast_speed_button" ).removeClass( "chosen" ).addClass( "bright" );
    $( "#settings_screen #joystick_speed_content #deamon_speed_button" ).removeClass( "chosen" ).addClass( "bright" );

    if( joystick_controller.max_speed > 4.9 )
    {
      $( "#settings_screen #joystick_speed_content #deamon_speed_button" ).removeClass( "bright" ).addClass( "chosen" );
    }
    else if( joystick_controller.max_speed > 1.9 )
    {
      $( "#settings_screen #joystick_speed_content #fast_speed_button" ).removeClass( "bright" ).addClass( "chosen" );
    }
    else if( joystick_controller.max_speed > 0.9 )
    {
      $( "#settings_screen #joystick_speed_content #normal_speed_button" ).removeClass( "bright" ).addClass( "chosen" );
    }
    else
    {
      $( "#settings_screen #joystick_speed_content #slow_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
    }
    //DRIVE SPEEDS
    $( "#settings_screen #robot_drive_speed_content #slow_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_drive_speed_content #moderate_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_drive_speed_content #normal_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_drive_speed_content #fast_speed_button" ).addClass( "bright" ).removeClass( "chosen" );

    if (robot_controller.config.velocity_drive === 0.5) {
      $('#settings_screen #robot_drive_speed_content #slow_speed_button').addClass('chosen').removeClass('bright');
    } 
    else if (robot_controller.config.velocity_drive === 1.0) {
      $('#settings_screen #robot_drive_speed_content #normal_speed_button').addClass('chosen').removeClass('bright');
    }
    else if (robot_controller.config.velocity_drive === 2.0) {
      $('#settings_screen #robot_drive_speed_content #fast_speed_button').addClass('chosen').removeClass('bright');
    }



    //SPRAY SPEEDS
    $( "#settings_screen #robot_spray_speed_content #slow_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_spray_speed_content #moderate_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_spray_speed_content #normal_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_spray_speed_content #fast_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_spray_speed_content #ultra_speed_button" ).addClass( "bright" ).removeClass( "chosen" );
    $( "#settings_screen #robot_spray_speed_content #deamon_speed_button" ).addClass( "bright" ).removeClass( "chosen" );

    $( "#settings_screen #robot_spray_speed_content #fast_speed_button" ).addClass( "gone" );
    $( "#settings_screen #robot_spray_speed_content #ultra_speed_button" ).addClass( "gone" );
    $( "#settings_screen #robot_spray_speed_content #deamon_speed_button" ).addClass( "gone" );

    if( robot_controller.config.velocity_spray === 0.5 )
      $( "#settings_screen #robot_spray_speed_content #slow_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
    if( robot_controller.config.velocity_spray === 0.7 )
      $( "#settings_screen #robot_spray_speed_content #moderate_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
    if( robot_controller.config.velocity_spray === 1.0 )
      $( "#settings_screen #robot_spray_speed_content #normal_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
    if( $( "#enable_extra_robot_speeds" ).is( ':checked' ) )
    {
      $( "#settings_screen #robot_spray_speed_content #fast_speed_button" ).removeClass( "gone" );
      $( "#settings_screen #robot_spray_speed_content #ultra_speed_button" ).removeClass( "gone" );
      $( "#settings_screen #robot_spray_speed_content #deamon_speed_button" ).removeClass( "gone" );
      if( robot_controller.config.velocity_spray === 1.2 )
        $( "#settings_screen #robot_spray_speed_content #fast_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
      if( robot_controller.config.velocity_spray === 1.5 )
        $( "#settings_screen #robot_spray_speed_content #ultra_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
      if( robot_controller.config.velocity_spray === 2.0 )
        $( "#settings_screen #robot_spray_speed_content #deamon_speed_button" ).addClass( "chosen" ).removeClass( "bright" );
    }

    // Show owned features, hide the rest
    templateshop_controller.show_feature( "basestation", ".base_station_screen_header" );
    templateshop_controller.show_feature( "totalstation", ".totalstation_screen_header" );


    $( "#settings_screen .set_paint_dimensions_inputs" ).toggleClass( "gone", login_screen_controller.user_level > user_level.NORMAL );
    $( "#settings_screen #superuser_taps_collection" ).toggleClass( "gone", login_screen_controller.user_level > user_level.SUPER );
    $( "#settings_screen #dealer_taps_collection" ).toggleClass( "gone", login_screen_controller.user_level > user_level.DEALER );
    $( "#settings_screen #developer_taps_collection" ).toggleClass( "gone", login_screen_controller.user_level > user_level.DEVELOPER );

    if( !window.cordova )
    {
      $( "#settings_screen .dont_show_on_cordova" ).removeClass( "gone" );
    }

    if( robot_controller.chosen_robot.online )
    {
      $( "#settings_screen .communication_settings_header" ).removeClass( "disabled" ).attr( "onclick", "settings_screeen_controller.choose_menu( 'communication_settings_header', 'communication_settings_screen' )" );
      $( "#settings_screen .robot_behaviour_settings_header" ).removeClass( "disabled" ).attr( "onclick", "settings_screeen_controller.choose_menu( 'robot_behaviour_settings_header', 'robot_behaviour_settings_screen' )" );
      $( "#settings_screen .user_calibration_menu_header" ).removeClass( "disabled" ).attr( "onclick", "settings_screeen_controller.choose_menu( 'user_calibration_menu_header', 'robot_behaviour_settings_screen' )" );
      //$( "#settings_screen .wifi_screen_header" ).removeClass( "disabled" ).attr( "onclick", "settings_screeen_controller.choose_menu( 'wifi_screen_header', 'wifi_screen' )" );
      $( "#settings_screen .robot_settings_menu_header" ).removeClass( "disabled" ).attr( "onclick", "settings_screeen_controller.choose_menu( 'robot_settings_menu_header', 'robot_settings_menu' )" );
      $( "#settings_screen .totalstation_screen_header" ).removeClass( "disabled" ).attr( "onclick", "totalstation_screen.open()" );
    }
    else
    {
      if( $( "#settings_screen .communication_settings_header" ).hasClass( "selected" ) ||
        $( "#settings_screen .robot_behaviour_settings_header" ).hasClass( "selected" ) ||
        $( "#settings_screen .robot_settings_menu_header" ).hasClass( "selected" ) ||
        $( "#settings_screen .totalstation_screen_header" ).hasClass( "selected" ) )
      {
        settings_screeen_controller.choose_menu( 'general_settings_screen_header', 'general_settings_screen' );
      }
      $( "#settings_screen .communication_settings_header" ).addClass( "disabled" ).attr( "onclick", "" );
      $( "#settings_screen .robot_behaviour_settings_header" ).addClass( "disabled" ).attr( "onclick", "" );
      $( "#settings_screen .user_calibration_menu_header" ).addClass( "disabled" ).attr( "onclick", "" );
      //$( "#settings_screen .wifi_screen_header" ).addClass( "disabled" ).attr( "onclick", "" );
      $( "#settings_screen .robot_settings_menu_header" ).addClass( "disabled" ).attr( "onclick", "" );
      $( "#settings_screen .totalstation_screen_header" ).addClass( "disabled" ).attr( "onclick", "" );
    }

  },
  select_all_layers(){
    const lngth = settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file].length;
    for(let i = 0; i < lngth; i++){
      if(file_loader_screen.hide_layers[settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file][i]]){
        settings_screeen_controller.toggle_layer(settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file][i], true);
      }
    }
  },
  deselect_all_layers(){
    const lngth = settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file].length;
    for(let i = 0; i < lngth; i++){
      if(!file_loader_screen.hide_layers[settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file][i]]){
        settings_screeen_controller.toggle_layer(settings_screeen_controller.imported_files[settings_screeen_controller.chosen_file][i], false);
      }
    }
  },
  update_template_enabler: function()
  {

    /*
     var template_ids = pt.list;
     template_ids = template_ids.filter( function ( template_id ) {
     return pt.templates.indexOf( template_id ) >= 0;
     } );
     */

//    if( !pt.user_templates )
//      pt.user_templates = [ ];

    var options_enable = {};
    var template_ids = templateshop_controller.tablet_templates.map( function( template )
    {
      var s = template.split( "?" );
      options_enable[s[0]] = [ ];
      for( var i = 1; i < s.length; i++ )
      {
        options_enable[s[0]].push( s[i] );
      }
      return s[0];
    } );

    $( "#enable_development_templates_menu #templates" ).empty();
    var pitch_types = Object.keys( pt.pitches );
    var pt_options_a = Object.keys( pt_options );

    pitch_types.sort(function (a, b) {
      return a.localeCompare(b);
    });

    pitch_types.forEach( function( type )
    {
      var html = '';
      var type_title = type;

      if( pt.pitches[type].length > 1 || true )
      {
        pt.pitches[type].forEach( function( template )
        {

          var tmp = new pt[template]();

          var templ_name = "enable_dev_template_" + template;
          var title = tmp.template_title;

          if( template_ids.indexOf( template ) === -1 )
          {
            html += '<div id="' + templ_name + '_holder"><table><tr><td><input type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" class="this_is_a_raw_template_id"/></td><td colspan="2"><p class="checkbox-label"><label for="' + templ_name + '">' + type_title + " " + title + " (" + template + ")" + '</label></p></td></tr>';
          }
          else
          {
            html += '<div id="' + templ_name + '_holder"><table><tr><td><input checked="checked" type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" class="this_is_a_raw_template_id"/></td><td colspan="2"><p class="checkbox-label"><label for="' + templ_name + '">' + type_title + " " + title + " (" + template + ")" + '</label></p></td></tr>';
          }

          pt_options_a.forEach( function( option )
          {
            var option_name = "option_dev_" + option + "_" + template;
            pt_options[option].forEach( function( tmpl )
            {
              if( tmpl === template )
              {
                if( options_enable[template] && options_enable[template].indexOf( option ) >= 0 )
                  html += '<tr><td></td><td><input checked="checked" type="checkbox" name="' + option_name + '" value="valuable" id="' + option_name + '" class="this_is_a_template_option"/></td><td colspan="2"><p class="checkbox-label"><label for="' + option_name + '">' + option + '</label></p></td></tr>';
                else
                  html += '<tr><td></td><td><input type="checkbox" name="' + option_name + '" value="valuable" id="' + option_name + '" class="this_is_a_template_option"/></td><td colspan="2"><p class="checkbox-label"><label for="' + option_name + '">' + option + '</label></p></td></tr>';
              }
            } );
          } );

          html += "</table></div>";

        } );
      }

      $( "#enable_development_templates_menu #templates" ).append( html );
    } );

  },
  save_new_template_list: function()
  {

    var templ_string = "";

    var templates = $( "#enable_development_templates_menu #templates input.this_is_a_raw_template_id" ).length;
    for( var i = 0; i < templates; i++ )
    {
      var template = $( "#enable_development_templates_menu #templates input.this_is_a_raw_template_id" )[i].id;
      var template_id = template.replace( "enable_dev_template_", "" );
      var checked = ($( '#enable_development_templates_menu #templates #enable_dev_template_' + template_id + ':checkbox:checked' ).length) > 0;
      if( checked )
      {
        if( templ_string )
          templ_string += ",";
        templ_string += template_id;

        var options = $( "#enable_development_templates_menu #templates #enable_dev_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" ).length;
        for( var o = 0; o < options; o++ )
        {
          var opt = $( "#enable_development_templates_menu #templates #enable_dev_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" )[o].id.replace( "option_dev_", "" );
          opt = opt.replace( "_" + template_id, "" );
          templ_string += "?" + opt;
        }
      }
    }
    console.log( templ_string );
    communication_controller.send( 'set_user_templates', {
      templates: templ_string
    }, "cloud", 10 );

    templ_string = pt.dealer_templates + "," + templ_string;
    pt.templates = templ_string.split( "," );
    pt.templates = pt.templates.filter( function( id )
    {
      return !!id;
    } ).map( function( template )
    {
      var options = template.split( "?" );
      var name = options[0];
      options = options.slice( 1 );
      pt.template_options[name] = options;
      return name;
    } );
    localStorage.setItem( "user.templates", JSON.stringify( pt.templates ) );

    popup_screen_controller.pop_up_once( "Saving templates", "user_templates_saved" );

    map_controller.background.remove_all_pitches();
    event_controller.call_callback( "template_list_updated" );

  },
  toggle_layer( layer_name , on_or_off = null)
  {
    console.log( "Toggle ", layer_name );
    file_loader_screen.hide_layers[layer_name] = !file_loader_screen.hide_layers[layer_name];
    if( !file_loader_screen.hide_layers[layer_name] && on_or_off )
    {  map_controller.background.jobs.importedJobs.concat(pitch_generator.active).forEach( job =>
      {
        if(job["_layers"]){
          if( job["_layers"][0] === layer_name )
          {
              job.showPitchLayer();
          }
        }
      } );
      delete file_loader_screen.hide_layers[layer_name];
    }
    else if(!on_or_off)
    {
      map_controller.background.jobs.importedJobs.concat(pitch_generator.active).forEach( job =>
      {
        if(job["_layers"]){
          if( job["_layers"][0] === layer_name )
          {
              if(pitch_generator.active.name === job.name){
                pitch_generator.active.hidePitchLayer();
                pitch_generator.active = new NullJob();
              }
              job.hidePitchLayer();
          }
        }
      } );
    }

    event_controller.call_callback( "job_labels_changed" );
    settings_screeen_controller.update();
  },
  hide_all_of_type: function( type )
  {

    map_controller.background.jobs.concat(pitch_generator.active).forEach( function( job )
    {
      if( pt.pitches[type].indexOf( job.template_id ) >= 0 )
      {
        job.removePitchLayer();
      }
    } );

    pt.pitches[type].forEach( function( template )
    {
      if( !settings_screeen_controller.template_hidden( template ) )
      {
        settings_screeen_controller.hide.push( template );
      }
    } );
    settings_screeen_controller.update();
  },
  show_all_of_type: function( type )
  {
    pt.pitches[type].forEach( function( template )
    {
      settings_screeen_controller.hide.splice( settings_screeen_controller.hide.indexOf( template ), 1 );
    } );
    settings_screeen_controller.update();
    event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  toggle_templates: function( template_id_array )
  {
    template_id_array.forEach( function( template_id )
    {
      if( settings_screeen_controller.template_hidden( template_id ) )
        settings_screeen_controller.show_template( template_id, true );
      else
        settings_screeen_controller.hide_template( template_id, true );
    } );
    event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  hide_templates: function( template_id_array )
  {
    template_id_array.forEach( function( template_id )
    {
      if( !settings_screeen_controller.template_hidden( template_id ) )
        settings_screeen_controller.hide_template( template_id, true );
    } );
    event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  show_templates: function( template_id_array )
  {
    template_id_array.forEach( function( template_id )
    {
      if( settings_screeen_controller.template_hidden( template_id ) )
        settings_screeen_controller.show_template( template_id, true );
    } );
    event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  hide_template: function( template_id, dont_update_map = false)
  {
    console.log( "Hiding template", template_id );
    settings_screeen_controller.hide.push( template_id );

    map_controller.background.jobs.concat(pitch_generator.active).forEach( job =>
    {
      if( job.template_id === template_id )
      {
        job.removePitchLayer();
      }
    } );
    if( !dont_update_map )
      event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  show_template: function( template_id, dont_update_map = false)
  {
    console.log( "Showing template", template_id );
    settings_screeen_controller.hide.splice( settings_screeen_controller.hide.indexOf( template_id ), 1 );
    if( !dont_update_map )
      event_controller.call_callback( "template_type_hidden_state_changed" );
  },
  toggle_hide: function( template_id )
  {
    settings_screeen_controller.toggle_templates( [ template_id ] );
    settings_screeen_controller.update();
  },
  template_hidden: function( template_id )
  {
    return settings_screeen_controller.hide.indexOf( template_id ) >= 0;
  },
  choose_language: function( i )
  {
    //translation.language = translation.languages[i];
    translation.set_language( translation.languages[i] );
    settings_screeen_controller.open();
    translate_screen();
    bottom_bar_chooser.choose_bottom_bar( bottom_bar_chooser.active_bar );

    // top_bar_screen_controller.update();
    event_controller.call_callback("topbar_force_update");

    general_settings_screen.init();

    position_settings_screen.recently_used.update_gui();
    settings_screeen_controller.breadcrumb.reset_to();
    localStorage.setItem( "language", translation.language );
  },
  use_emperial: false,
  unit: "m",
  set_units: function( unit )
  {
    /*
     * Remember to update:
     * . prototype_extension.js
     * .. unit2meter()
     * .. meter2unit()
     * . translation.js
     * .. translate_unit()
     */


    if( unit === true )
      unit = "ft";

    $( "#locale_settings_screen #unit_buttons button" ).removeClass( "chosen" ).addClass( "bright" );
    switch( unit )
    {
      case "ft":
      {
        $( "#locale_settings_screen #emperial_choser" ).addClass( "chosen" ).removeClass( "bright" );
        settings_screeen_controller.use_emperial = true;
        break;
      }
      case "us-ft":
      {
        $( "#locale_settings_screen #us_ft_choser" ).addClass( "chosen" ).removeClass( "bright" );
        settings_screeen_controller.use_emperial = true;
        break;
      }
      case "yard":
      {
        $( "#locale_settings_screen #yard_choser" ).addClass( "chosen" ).removeClass( "bright" );
        settings_screeen_controller.use_emperial = true;
        break;
      }
      case "m":
      default:
      {
        unit = "m";
        settings_screeen_controller.use_emperial = false;
        $( "#locale_settings_screen #metric_choser" ).addClass( "chosen" ).removeClass( "bright" );
      }
    }
    console.log( unit + " units chosen" );

    settings_screeen_controller.unit = unit;
    measure_screen.draw_on_map();
    measure_screen.element_info();
    bottom_bar_chooser.reload_bottom_bar();
    settings_screeen_controller.update();
    settings_screeen_controller.update_paint_input_values();
    settings_screeen_controller.update_robot_settings_page_values();
    translate_screen();
    localStorage.setItem( "unit", unit );
    event_controller.call_callback( "units_changed" );
  },
  close: function()
  {
    if( settings_screeen_controller.chosen_menu === "position_settings_screen" )
    {
      $( '#position_settings_screen #position_projection' ).blur();
      position_settings_screen.close();
    }

    $( "#settings_screen" ).addClass( "gone" );
    settings_screeen_controller.is_open = false;

    event_controller.call_callback( "close_settings_menu", settings_screeen_controller.chosen_menu );
  },

  changed_nozzle_type: function( new_val, recalculate_dimensions = true)
  {
    if ( Object.values(nozzleTypes).indexOf(new_val) === -1 ) {
      console.warn(`Nozzle type "${new_val}" does not exist`);
      return false;
    }

    localStorage.setItem( "robot.nozzle_type", new_val );
    communication_controller.send_key_val( "Nozzle type", new_val );
    $( "#robot_settings_menu #nozzle_type_select button" ).removeClass( "chosen" ).addClass( "bright" );

    settings_screeen_controller.nozzle_type = new_val;
    console.log(`Changed nozzle type to \"${settings_screeen_controller.nozzle_type}\"`);
    if( new_val === nozzleTypes.CONE)
    {
      $( "#robot_settings_menu #nozzle_type_select_cone" ).removeClass( "bright" ).addClass( "chosen" );

      $( "#robot_settings_menu #set_paint_length" ).prop( "disabled", true );
      if( recalculate_dimensions )
      {
        if( settings_screeen_controller.use_emperial )
          settings_screeen_controller.change_paint_length( settings_screeen_controller.paint_width.meter2inch() );
        else
          settings_screeen_controller.change_paint_length( settings_screeen_controller.paint_width );
      }
    }
    else
    {
      $( "#robot_settings_menu #nozzle_type_select_fan" ).removeClass( "bright" ).addClass( "chosen" );

      $( "#robot_settings_menu #set_paint_length" ).prop( "disabled", false );
      if( recalculate_dimensions )
      {
        if( settings_screeen_controller.use_emperial )
          settings_screeen_controller.change_paint_length( (settings_screeen_controller.paint_width * 0.4).meter2inch() );
        else
          settings_screeen_controller.change_paint_length( settings_screeen_controller.paint_width * 0.4 );
      }
      return true;
  }
  },
  change_paint_width: function( input_value )
  {
    let original_val = parseFloat(input_value)
    let new_val = 0;
    
    if( settings_screeen_controller.use_emperial )
    {
      new_val = original_val.inch2meter();
    }
    else
    {
      new_val = original_val;
    }

    settings_screeen_controller.paint_width = new_val;

    // If cone nozzle
    if( settings_screeen_controller.nozzle_type === "cone")
    {
      settings_screeen_controller.change_paint_length( original_val );
    }

    console.log( "New paint width", new_val );
    localStorage.setItem( "robot.paint_width", new_val );
    communication_controller.send_key_val( "Paint width", new_val );
    settings_screeen_controller.update_paint_input_values();

    map_controller.background.jobs.forEach( function( db_job )
    {
      db_job.tasks = [ ];
    } );
    if( pitch_generator.active.id >= 0 )
    {
      pitch_generator.active.draw();
    }
    map_controller.background.remove_all_pitches();
    map_controller.background.draw_all_jobs();
  },
  change_paint_length: function( input_value )
  {
    let original_val = parseFloat(input_value);
    let new_val = 0;
    if( settings_screeen_controller.use_emperial )
    {
      new_val = original_val.inch2meter();
    }
    else
    {
      new_val = original_val;
    }

    console.log( "New paint length", new_val );
    settings_screeen_controller.paint_length = new_val;
    localStorage.setItem( "robot.paint_length", new_val );
    communication_controller.send_key_val( "Paint length", new_val );
    settings_screeen_controller.update_paint_input_values();

    map_controller.background.jobs.forEach( function( db_job )
    {
      db_job.tasks = [ ];
    } );
    if( pitch_generator.active.id >= 0 )
    {
      pitch_generator.active.draw();
    }
    map_controller.background.remove_all_pitches();
    map_controller.background.draw_all_jobs();
  },
  update_paint_input_values: function()
  {
    var paint_width = settings_screeen_controller.paint_width;
    if( settings_screeen_controller.use_emperial )
      paint_width = paint_width.meter2inch();
    paint_width = paint_width.round( 2 );
    $( "#robot_settings_menu #set_paint_width" ).val( paint_width );

    var paint_length = settings_screeen_controller.paint_length;
    if( settings_screeen_controller.use_emperial )
      paint_length = paint_length.meter2inch();
    paint_length = paint_length.round( 2 );
    $( "#robot_settings_menu #set_paint_length" ).val( paint_length );
  },
  force_new_ramp_up_length: new FloatSetting('robot.force_new_ramp_up_length', 1.0, (v) => {
    settings_screeen_controller.change_ramp_up_slider( 'force_new_ramp_up_length', v, 1 );
  }, true, 0.5, 5.0, 0.1),
  force_new_internal_ramp_up_length: new FloatSetting('robot.force_new_internal_ramp_up_length', 4.0, (v) => {
    settings_screeen_controller.change_ramp_up_slider( 'force_new_internal_ramp_up_length', v, 1 );
  }, true, 0.5, 5.0, 0.1),
  safety_distance: new FloatSetting('robot.safety_distance', 0.2, (v) => {
    settings_screeen_controller.change_ramp_up_slider( 'safety_distance', v, 2 );
  }, true, 0.0, 1.0, 0.01),
  update_robot_settings_page_values: function()
  {
    settings_screeen_controller.force_new_ramp_up_length.load();
    settings_screeen_controller.force_new_internal_ramp_up_length.load();
    settings_screeen_controller.safety_distance.load();

    $( "#robot_settings_menu #force_new_ramp_up_length" ).attr( {
      'step': settings_screeen_controller.force_new_ramp_up_length.step.unit2meter()
    } );
    $( "#robot_settings_menu #force_new_internal_ramp_up_length" ).attr( {
      'step': settings_screeen_controller.force_new_internal_ramp_up_length.step.unit2meter()
    } );
    $( "#robot_settings_menu #safety_distance" ).attr( {
      'step': settings_screeen_controller.safety_distance.step.unit2meter()
    } );

    $("#select_interference_filter_type_section").toggleClass("gone", !robot_controller.robot_has_all_capability( ["position_filtering_altitude","position_filtering_varzi"] ));
    $("#select_interference_filter_type_ts").toggleClass("gone", !robot_controller.robot_has_all_capability( ["position_filtering_altitude","position_filtering_varzi"] ));

    if(robot_controller.robot_has_any_capability(["napping_version_1", "napping_version_2", "napping_version_3"])) {
      $("#select_napping_version_section").removeClass("gone");
      const selectElement = $("#select_napping_version_tlm");
      selectElement.html(""); // Clear inner HTML
      if(robot_controller.robot_has_capability("napping_version_1")) {
        selectElement.append('<option value="1">Antinapping v1</option>');
      }
      if(robot_controller.robot_has_capability("napping_version_2")) {
        selectElement.append('<option value="2">Antinapping v2</option>');
      }
      if(robot_controller.robot_has_capability("napping_version_3")) {
        selectElement.append('<option value="3">Antinapping v3</option>');
      }
      general_settings_screen.settings.napping_version.load();
    } else {
      $("#select_napping_version_section").addClass("gone");
    }
  },
  change_ramp_up_slider: function( label_id, new_value, decimals )
  {
    new_value = parseFloat( new_value );
  
    if( label_id === "safety_distance" ){
      $( `#robot_settings_menu #${label_id}_value` ).removeClass( "warning" );
      if(new_value < 0.1)
        $( `#robot_settings_menu #${label_id}_value` ).addClass( "warning" );
      else
        $( `#robot_settings_menu #${label_id}_value` ).removeClass( "warning" );
    }
    else{
      if( new_value < 1.0 )
      {
        $( `#robot_settings_menu #${label_id}_value` ).addClass( "warning" );
      }
      else
      {
        $( `#robot_settings_menu #${label_id}_value` ).removeClass( "warning" );
      }
    }
    $( `#robot_settings_menu #${label_id}` ).val( new_value );
    $( `#robot_settings_menu #${label_id}_value` ).text( new_value.meter2unit( ).toFixed( decimals ) + " " + translate_unit() );
  },
  changed_ramp_up_slider: function( label_id, new_value )
  {
    switch(label_id)
    {
      case 'force_new_ramp_up_length':
        communication_controller.send_key_val( "Line Run-up Before line", settings_screeen_controller[label_id].val );
        break;
      case 'force_new_internal_ramp_up_length':
        communication_controller.send_key_val( "Line Run-up On line", settings_screeen_controller[label_id].val );
        break;
      case 'safety_distance':
        communication_controller.send_key_val("Safety distance to post", settings_screeen_controller[label_id].val );
        setTimeout(() => map_controller.background.refresh_specific_job_drawing("reverseInGoal"), 10);
        break;
      default:
        throw new ReferenceError(`${label_id} does not exist!`);
    }
  },
  // apply_safety_distance: function()
  // { 
  //   localStorage.setItem( "robot.safety_distance", settings_screeen_controller.SAFETY_DISTANCE );
  //   pop_generator.create_popup( translate["Saving data"],"", [], false, "safety_distance_popup", "", "", false, true);
  //   setTimeout(function() {map_controller.background.refresh_specific_job_drawing("reverseInGoal");
  //   popup_screen_controller.close("safety_distance_popup");}, 10)
  // },
  update_line_parameters: function()
  {
    var line_length = robot_behaviour_settings_screen.format_number( parseFloat( robot_controller.config.spray_line_length ) );
    var line_space = robot_behaviour_settings_screen.format_number( parseFloat( robot_controller.config.spray_space_length ) );

    $( "#robot_settings_menu #line_length_value" ).val( line_length );
    $( "#robot_settings_menu #line_space_value" ).val( line_space );

  },
  line_parameters_changed: function()
  {
    var line_length = parseFloat( $( "#robot_settings_menu #line_length_value" ).val() );
    var line_space = parseFloat( $( "#robot_settings_menu #line_space_value" ).val() );

    line_length = line_length.unit2meter();
    line_space = line_space.unit2meter();

    robot_controller.config.spray_line_length = line_length;
    robot_controller.config.spray_space_length = line_space;

    robot_behaviour_settings_screen.user_params.spray_line_length.current = line_length;
    robot_behaviour_settings_screen.user_params.spray_space_length.current = line_space;
    robot_behaviour_settings_screen.save_user_params_in_local_storage(undefined,undefined,false);

    robot_controller.update_user_params( {
      spray_line_length: line_length,
      spray_space_length: line_space
    }, "all" );

    communication_controller.send_key_val( "Line length", line_length );
    communication_controller.send_key_val( "Line space", line_space );

    map_controller.background.refreshh_jobs_drawing();
  },
  open_robot_settings: function()
  {
    settings_screeen_controller.update_paint_input_values();
    settings_screeen_controller.update_robot_settings_page_values();
    settings_screeen_controller.update_line_parameters();
    settings_screeen_controller.update_safety_parameters();
    settings_screeen_controller.updateWarningsParameters();
  },
  set_robot_drive_speed: function( speed )
  {
    robot_controller.set_max_drive_speed( speed );
    popup_screen_controller.pop_up_once( translate["Saving robot drive speed"], "updated_user_config", 1000 );
    robot_controller.config.velocity_drive = speed;
    settings_screeen_controller.update();
  },  
  set_robot_spray_speed: function( speed )
  {
    robot_controller.set_max_spray_speed( speed );
    popup_screen_controller.pop_up_once( translate["Saving robot spray speed"], "updated_user_config", 1000 );
    robot_controller.config.velocity_spray = speed;
    settings_screeen_controller.update();
  },
  update_safety_parameters()
  {
    const safety_parameters = [ ];

    if( robot_controller.robot_has_capability( 'platform_ultrasound' ) )
    {
      $( "#robot_settings_menu #collision_detector_row" ).removeClass( 'gone' );
      $( "#robot_settings_menu  #collision_detector" ).prop( 'checked', (robot_behaviour_settings_screen.user_params.collision_harderror.current && robot_behaviour_settings_screen.user_params.collision_slowdown.current) );
      safety_parameters.push( 'platform_ultrasound' );
    }
    else
      $( "#robot_settings_menu #collision_detector_row" ).addClass( 'gone' );

    if( safety_parameters.length === 0 )
      $( "#robot_settings_menu #safety_parameters" ).addClass( 'gone' );
    else
    {
      $( "#robot_settings_menu #safety_parameters" ).removeClass( 'gone' );
      $( "#robot_settings_menu #line_parameters_divider" ).removeClass( "gone" );
    }
  },

  toggle_collision_detector()
  {
    let safety_on = robot_behaviour_settings_screen.user_params.collision_harderror.current && robot_behaviour_settings_screen.user_params.collision_slowdown.current;
    robot_controller.update_user_params( {
      collision_harderror: !safety_on,
      collision_slowdown: !safety_on
    }, "all" );
    popup_screen_controller.pop_up_once( translate["Saving safety settings"], "updated_user_config", 1000 );
  },

  updateWarningsParameters() {
    let showWarnings = false;
    if (robot_controller.robot_has_capability("paint_indicator")) {
      $("#robot_settings_menu #toggle_paint_indicator_warning_row").removeClass("gone");
      $("#robot_settings_menu #toggle_paint_indicator_warning").prop('checked', robot_behaviour_settings_screen.user_params.paint_indicator_alert.current);
      showWarnings = true;
    }

    if (showWarnings) {
      $("#robot_settings_menu #warnings_parameters").removeClass("gone");
    }
  },
  
  togglePaintIndicatorWarning() {
    const showIndicator = robot_behaviour_settings_screen.user_params.paint_indicator_alert.current;
    robot_controller.update_user_param("paint_indicator_alert", !showIndicator, "all");
    popup_screen_controller.pop_up_once( translate["Saving warnings settings"], "updated_user_config", 1000 );
  },

  wheel_flip: {},
  set_wheel_direction( side, new_value, update_on_robot = false)
  {
    settings_screeen_controller.wheel_flip[side] = new_value === "yes";

    $( "#robot_settings_menu #other_content" ).removeClass( "gone" );
    $( "#robot_settings_menu #line_parameters_divider" ).removeClass( "gone" );

    $( "#robot_settings_menu #" + side + "_wheel_direction_row" ).removeClass( "gone" );
    $( "#robot_settings_menu #" + side + "_wheel_direction_select button" ).removeClass( "chosen" ).addClass( "bright" );
    $( "#robot_settings_menu #" + side + "_wheel_direction_select #" + side + "_wheel_direction_select_" + new_value ).removeClass( "bright" ).addClass( "chosen" );

    // send to robot emidetly
    if( update_on_robot )
    {
      let data = {};
      if( side === "left" )
        data.wheel_flip_ch1 = settings_screeen_controller.wheel_flip[side];
      else
        data.wheel_flip_ch2 = settings_screeen_controller.wheel_flip[side];

      robot_controller.update_user_params( data, "all" );
      popup_screen_controller.pop_up_once( translate["Saving wheel flip"], "updated_user_config", 1000 );
    }

    console.log;  // Do nothing at all
  },
  got_user_params( user_data )
  {
    let data = user_data["/user"];
    //let data = robot_behaviour_settings_screen.user_params;
    if( robot_controller.robot_has_capability( "wheel_direction_individual" ) )
    {
      if( data.wheel_flip_ch1 )
        settings_screeen_controller.set_wheel_direction( "left", data.wheel_flip_ch1.current ? "yes" : "no" );
      if( data.wheel_flip_ch2 )
        settings_screeen_controller.set_wheel_direction( "right", data.wheel_flip_ch2.current ? "yes" : "no" );
    }
  },
  got_capabilities()
  {
    if( robot_controller.robot_has_capability( "wheel_direction_individual" ) )
    {
      settings_screeen_controller.got_user_params(
      {
        "/user": robot_behaviour_settings_screen.user_params
      } );
    }

    if( robot_controller.robot_has_capability( "job_merge_noaction" ) )
      $( "#robot_ramp_content #enable_fluent_run_section" ).removeClass( "gone" );
    else
    {
      $( "#robot_ramp_content #enable_fluent_run_section" ).addClass( "gone" );
      general_settings_screen.settings.enable_fluent_run.val = false;
    }
  },
  enable_fluent_run()
  {
    popup_screen_controller.confirm_popup( translate["Warning"], translate["Fluent_run_warning"].format(
      (3).meter2unit().round() + " " + translate_unit()
      ), translate["OK"], translate["Cancel"], function()
    {
      general_settings_screen.settings.enable_fluent_run.val = true;
      popup_screen_controller.close();
      betaWarning();
    }, function()
    {
      popup_screen_controller.close();
      general_settings_screen.settings.enable_fluent_run.val = false;
    } );

    // TODO: Remove beta warning when fluent run is out of BETA
    function betaWarning() {
      const options =  {header: translate["Warning"],
      body: translate["betaWarningBody"],
      ok_text: translate["OK"],
      ok_callback: popup_screen_controller.close};
      popup_screen_controller.confirm_popup_with_options(options);
    }
  },
  show_fluent_run_more_info_popup()
  {
    popup_screen_controller.confirm_popup( translate["Info"], translate["Fluent_run_more_info_text"].format(
      (5).meter2unit().round() + " " + translate_unit()
      ), translate["OK"], undefined, function()
    {
      popup_screen_controller.close();
    } );
  },

  toggle_password: function( input_field_selector )
  {
    let eye = $( `${input_field_selector} + .password_toggle` );
    let input = $( input_field_selector );
    if( input.attr( "type" ) === "password" )
    {
      input.attr( "type", "text" );
      eye.text('visibility');
    }
    else
    {
      input.attr( "type", "password" );
      eye.text('visibility_off');
    }
    input.focus();
  },

  toggleUserPermittedButtons() {
    if (login_screen_controller.user_level === user_level.DEVELOPER) {
      $("#calibration_menu #btn_open_stress_test").removeClass("gone");
      $("#calibration_menu #btn_open_stress_test").prop("disabled", false);
    }
    else {
      $("#calibration_menu #btn_open_stress_test").addClass("gone");
      $("#calibration_menu #btn_open_stress_test").prop("disabled", true);
    }
  },

  offlInePopup() {
    const buttons = [new PopButton(translate["OK"], pop_generator.close, "dark")];

    const options = {
        header: translate["No server connection"],
        body: translate["cannotWithoutServer"],
        buttons: buttons
    }
    pop_generator.create_popup_with_options(options);
  },
};


$( document ).ready( function()
{
  message_controller.events.add_callback( "reconf_topic_/user", settings_screeen_controller.got_user_params );
  event_controller.add_callback( 'got_robot_capabilities', settings_screeen_controller.got_capabilities );

  event_controller.add_callback( "user_login_success", settings_screeen_controller.update );

  var nozzle_type = (localStorage.getItem( "robot.nozzle_type" ));
  var paint_width = parseFloat( localStorage.getItem( "robot.paint_width" ) );
  var paint_length = parseFloat( localStorage.getItem( "robot.paint_length" ) );
  
  settings_screeen_controller.force_new_ramp_up_length.load();
  settings_screeen_controller.force_new_internal_ramp_up_length.load();
  settings_screeen_controller.safety_distance.load();
  
  if( paint_width )
  {
    settings_screeen_controller.paint_width = paint_width;
  }
  if( paint_length )
  {
    settings_screeen_controller.paint_length = paint_length;
  }

  if( nozzle_type )
  {
    settings_screeen_controller.changed_nozzle_type( nozzle_type, false );
  }
  else
  {
    settings_screeen_controller.changed_nozzle_type( nozzleTypes.CONE );
  }

  // Only get use_emperial if unit is not set
  settings_screeen_controller.set_units( localStorage.getItem( "unit" ) ? localStorage.getItem( "unit" ) : (localStorage.getItem( "use_emperial" ) === "true") );

  event_controller.add_callback( "app_specific_setup_done", settings_screeen_controller.set_paint_width );
  event_controller.add_callback( "robot_list_updated", settings_screeen_controller.update );

  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "enable_development_templates_menu" )
      settings_screeen_controller.update_template_enabler();

    if( settings_screen_name === "robot_settings_menu" )
      settings_screeen_controller.open_robot_settings();
  } );

  event_controller.add_callback( "user_login_success", function()
  {
    $( ".hidden_when_no_internet" ).css( "display", "" );
  } );
  event_controller.add_callback( "app_server_connection_closed", function()
  {
    $( ".hidden_when_no_internet" ).css( "display", "none" );
  } );

  if( DEBUG_MODE )
  {
    event_controller.add_callback( "close_settings_menu", function( settings_screen_name )
    {
      console.log( "closing", settings_screen_name );
    } );
    event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
    {
      console.log( "opening", settings_screen_name );
    } );
  }
  settings_screeen_controller.updateSettingsMenuButton();

} );
