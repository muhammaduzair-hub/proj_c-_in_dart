
const edit_pitch_screen_controller = {
  _isOpen: null,
  handler: null,

  set isOpen(v) {
    edit_pitch_screen_controller._isOpen = v;
    settings_screeen_controller.updateSettingsMenuButton();
  },

  get isOpen() {
    return edit_pitch_screen_controller._isOpen;
  },

  init() {
    if( !communication_controller.appServerConnection.connected && !pitch_generator.active.can_edit_when_offline ) {
      popup_screen_controller.confirm_popup( "Offline", "You cannot modify pitches while offline", "ok", "", popup_screen_controller.close );
      return;
    }

    if( pitch_generator.active.can_convert_to_free_hand() ) {
      pitch_generator.active.options.original_points.val = {
        layout_method: pitch_generator.active.layout_method,
        points: pitch_generator.active.points
      };
      pitch_generator.active.convert_to_free_hand();
    }
    else {
      pitch_generator.active.draw();
    }

    map_controller.background.ignore_active = true;
    if( map_controller.background.jobs.is_active )
    {
      pitch_generator.active.is_being_edited = true;
    }

    if (pitch_generator.active.id < 0) {
      edit_pitch_screen_controller.handler = createJobMenuController.handler;
    }
  },

  open(only_width_and_height, create_pitch_mode) {
    edit_pitch_screen_controller.isOpen = true;
    edit_pitch_screen_controller.init();

    edit_pitch_screen_controller.only_width_and_height = !!only_width_and_height;
    edit_pitch_screen_controller.create_pitch_mode = !!create_pitch_mode;
    edit_pitch_screen_controller.last_touched = -1;
    edit_pitch_screen_controller.last_last_touched = -2;

    if( edit_pitch_screen_controller.create_pitch_mode && pitch_generator.active.source === JobSource.CLOUD )
      $( "#edit-pitch #back_button" ).removeClass( "gone" );
    else
      $( "#edit-pitch #back_button" ).addClass( "gone" );

    bottom_bar_chooser.choose_bottom_bar( "#edit-pitch" );

    if( !pitch_generator.active.options.created_with_dubins.val && pitch_generator.active.options["taskModificationIds"].ignoreids.length )
    {
      let dubins_job = pitch_generator.active.copy();
      dubins_job.options.created_with_dubins.val = true;
      dubins_job.draw();
      let job2_ignoreids = align_ignore_lines( pitch_generator.active, dubins_job );
      dubins_job.options.taskModificationIds.ignoreids = job2_ignoreids;
      pitch_generator.active = dubins_job;
    }

    edit_pitch_screen_controller.draw_pitch();
    pitch_generator.original.hidePitchLayer();

    map_controller.background.zoom_to_pitch( pitch_generator.active );
    advance_edit_screen.start_map();
  },

  recollect() {
    edit_pitch_screen_controller.handler = new RecollectUsingRobotHandler(pitch_generator.active);
    edit_pitch_screen_controller.isOpen = false;
    edit_pitch_screen_controller.remove_pitch();
    edit_pitch_screen_controller.handler.resume();
  },
  
  only_width_and_height: false,
  create_pitch_mode: false,
  ask_to_cancel: function()
  {
    if( !pitch_generator.active.new_job )
      edit_pitch_screen_controller.cancel();
    else
    {
      popup_screen_controller.confirm_popup( translate["Are you sure you want to cancel"], "", translate["Yes"], translate["No"], function()
      {
        // yes
        edit_pitch_screen_controller.cancel();
        popup_screen_controller.close( "#confirm_popup" );
      }, function()
      {
        //no
        popup_screen_controller.close( "#confirm_popup" );
      } );
    }
  },

  cancel: function()
  {
    edit_pitch_screen_controller.isOpen = false;
    edit_pitch_screen_controller.goBackCallback = null;
    map_controller.background.ignore_active = false;
    edit_pitch_screen_controller.remove_pitch();
    pitch_generator.original.showPitchLayer();

    if(pitch_generator.active.new_job)
    {
      pitch_generator.reset();
    }
    else
    {
      pitch_generator.reselect();
    }

    $( "#advance-options-overlay" ).addClass( "gone" );    
    edit_pitch_screen_controller.isOpen = false;
  },

  remove_pitch: function()
  {
    edit_pitch_screen_controller.handles.forEach( function( handle )
    {
      map_controller.background.map.removeLayer( handle.layer );
    } );
    edit_pitch_screen_controller.handles = [ ];
  },
  show_width_input: function()
  {
    delete edit_pitch_screen_controller.saved_move_position;
    edit_pitch_screen_controller.hide_inputs();
    q$( "#edit-pitch #width_table_cell" ).removeClass( "gone" );
    q$( "#edit-pitch #width_input_parent" ).removeClass( "gone" );

  },
  show_length_input: function()
  {
    delete edit_pitch_screen_controller.saved_move_position;
    edit_pitch_screen_controller.hide_inputs();
    q$( "#edit-pitch #length_table_cell" ).removeClass( "gone" );
    q$class( "#edit-pitch #length_input_parent" ).removeClass( "gone" );
  },
  saved_move_position: null,
  show_move_inputs: function( pitch_angle )
  {
    if( edit_pitch_screen_controller.last_touched !== edit_pitch_screen_controller.last_last_touched )
    {
      edit_pitch_screen_controller.hide_inputs();
      q$class( "#edit-pitch #move_right_table_cell" ).removeClass( "gone" );
      q$class( "#edit-pitch #move_right_input_parent" ).removeClass( "gone" );
      q$class( "#edit-pitch #move_up_table_cell" ).removeClass( "gone" );
      q$class( "#edit-pitch #move_up_input_parent" ).removeClass( "gone" );

      q$html( "#edit-pitch #move_info_label" ).html( translate["Move"] );
      q$class( "#edit-pitch #move_info_table_cell" ).removeClass( "gone" );
      q$class( "#edit-pitch #move_right_arrow_table_cell" ).removeClass( "gone" );
      q$class( "#edit-pitch #move_up_arrow_table_cell" ).removeClass( "gone" );

      q$( "#edit-pitch #move_right_arrow_table_cell img" ).css( "-webkit-transform", "rotate(" + pitch_angle + "deg)" );
      q$( "#edit-pitch #move_right_arrow_table_cell img" ).css( "transform", "rotate(" + pitch_angle + "deg)" );
      q$( "#edit-pitch #move_up_arrow_table_cell img" ).css( "-webkit-transform", "rotate(" + (pitch_angle - 90) + "deg)" );
      q$( "#edit-pitch #move_up_arrow_table_cell img" ).css( "transform", "rotate(" + (pitch_angle - 90) + "deg)" );
    }

  },
  show_input: function()
  {
    edit_pitch_screen_controller.hide_inputs();
    q$class( "#edit-pitch #option_input_table_cell" ).removeClass( "gone" );
    q$class( "#edit-pitch #option_input_input_parent" ).removeClass( "gone" );
  },
  hide_inputs: function()
  {
    q$class( "#edit-pitch #option_input_input_parent" ).addClass( "gone" );
    q$class( "#edit-pitch #length_input_parent" ).addClass( "gone" );
    q$class( "#edit-pitch #width_input_parent" ).addClass( "gone" );
    q$class( "#edit-pitch #move_right_input_parent" ).addClass( "gone" );
    q$class( "#edit-pitch #move_up_input_parent" ).addClass( "gone" );

    q$class( "#edit-pitch #option_input_table_cell" ).addClass( "gone" );

    q$class( "#edit-pitch #rotation_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #rotation_angle_input" ).parent().addClass( "gone" );
    q$class( "#edit-pitch #length_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #width_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #move_right_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #move_up_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #move_info_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #move_right_arrow_table_cell" ).addClass( "gone" );
    q$class( "#edit-pitch #move_up_arrow_table_cell" ).addClass( "gone" );
  },
  the_pitch: undefined,
  handles: [ ],
  last_touched: -1,
  draw_pitch: function( dont_update_numbers_bar = false, dont_draw_handles = false, highligt = true, draw_on_map = map_controller.background.map )
  {
    edit_pitch_screen_controller.remove_pitch();

    map_controller.background.draw_pitch(pitch_generator.active, highligt ? Background.featureColor.ACTIVE : Background.featureColor.DEFAULT, false);

    pitch_generator.active.handles = pitch_generator.active.handles.sort_objects( "zindex" );
    edit_pitch_screen_controller.update_bar( dont_update_numbers_bar );

    !dont_draw_handles && pitch_generator.active.handles.forEach( function( handle, i )
    {
      var center = map_controller.background.projection_to_map( pitch_generator.active.projection, handle.position.toArray() );
      var icon = handle.icon;
      if( edit_pitch_screen_controller.last_touched === i )
        icon = handle.chosen_icon;

      var handle_marker = ol_markers.create_marker( "handle" + i, center, icon, handle.angle, function()
      {
        // handle_press

        if( edit_pitch_screen_controller.last_touched !== i )
          edit_pitch_screen_controller.saved_move_position = handle.position;

        edit_pitch_screen_controller.last_touched = i;
        edit_pitch_screen_controller.draw_pitch();
        edit_pitch_screen_controller.last_last_touched = i;

      }, function( new_pos_lnglat )
      {
        var new_pos = ProjectorForward( pitch_generator.active.projection, new_pos_lnglat );

        if( edit_pitch_screen_controller.last_touched !== i )
          edit_pitch_screen_controller.saved_move_position = handle.position;

        // handle_drag
        edit_pitch_screen_controller.last_touched = i;

        var new_pos_v = new Vector( new_pos[0], new_pos[1] );

        var snapping_lines = [ ];
        map_controller.background.drawn_jobs.forEach( function( job )
        {
          var projection = Projector( job.projection, pitch_generator.active.projection );
          if( job.id !== pitch_generator.active.id )
          {
            const projectet_snaps = job.snapping_lines.filter(l=>(l instanceof Line)).map( line => line.project( projection ) );
            snapping_lines = snapping_lines.concat( projectet_snaps );
          }
          // projection.release();
        } );
        var highlight_lines = handle.on_drag( new_pos_v, snapping_lines );
        edit_pitch_screen_controller.draw_pitch( false, false, highlight_lines );
        edit_pitch_screen_controller.last_last_touched = i;
      } );

      edit_pitch_screen_controller.handles.push( handle_marker );
      draw_on_map.addLayer( handle_marker.layer );
      handle_marker.layer.setZIndex( 2000001 + i );
    } );

  },
  update_numbers_bar: function( )
  {
    if( edit_pitch_screen_controller.last_touched !== edit_pitch_screen_controller.last_last_touched )
      edit_pitch_screen_controller.hide_inputs();

    if( edit_pitch_screen_controller.last_touched >= 0 )
    {

      if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].name === "Move" )
      {
        edit_pitch_screen_controller.show_move_inputs( -pitch_generator.active.options.Angle.val * 180 / Math.PI );

        var A2 = edit_pitch_screen_controller.saved_move_position.subtract( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].position );
        A2 = A2.rotate( -pitch_generator.get_variable( "Angle" ) );

        q$( "#edit-pitch #move_right_input" ).val( -A2.x.meter2unit().round(2) );
        q$( "#edit-pitch #move_up_input" ).val( -A2.y.meter2unit().round(2) );

      }
      else
      {
        edit_pitch_screen_controller.show_input();
        var option_name = pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].name;
        var label_name = pitch_generator.active.options[option_name].name;
        var input_label_name = translate[label_name];

        var units = pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].units;
        if( units )
        {
          if( units === "m" )
            units = translate_unit();
          units = " (" + units + ")";
        }
        else
        {
          units = "";
        }
        if( units === " (int)" )
          q$html( "#edit-pitch #option_input_label" ).html( input_label_name );
        else
          q$html( "#edit-pitch #option_input_label" ).html( input_label_name + units );

        var value = parseFloat( pitch_generator.active.options[option_name].val );
        if( !value )
          value = 0;
        if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].units === "deg" )
        {
          value *= 180 / Math.PI;
          if( value < 0 )
            value += 360;
        }
        if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].units === "m" )
          q$( "#edit-pitch #option_input_input" ).val( value.meter2unit().round(2) );
        else
          q$( "#edit-pitch #option_input_input" ).val( value.round(2) );

        edit_pitch_screen_controller.last_option_value = value.round(2);
      }

    }
    else
    {

    }

    if( pitch_generator.active instanceof MultiJob )
    {
      q$( "#edit-pitch #edit_name_label" ).parent().addClass( "gone" );
      q$( "#edit-pitch #edit_name_input" ).parent().addClass( "gone" );
    }
    else
    {
      q$( "#edit-pitch #edit_name_label" ).parent().removeClass( "gone" );
      q$( "#edit-pitch #edit_name_input" ).parent().removeClass( "gone" );
    }
    q$( "#edit-pitch #edit_name_input" ).val( pitch_generator.active.name );
  },
  update_bar: function( dont_update_numbers_bar )
  {

    /*
     if ( edit_pitch_screen_controller.only_width_and_height ) {
     $( "#edit-pitch #rotation_table_cell" ).addClass( "gone" );
     $( "#edit-pitch #rotation_angle_input" ).parent().addClass( "gone" );
     } else {
     $( "#edit-pitch #rotation_table_cell" ).removeClass( "gone" );
     $( "#edit-pitch #rotation_angle_input" ).parent().removeClass( "gone" );
     }
     */

    if( edit_pitch_screen_controller.last_touched !== edit_pitch_screen_controller.last_last_touched )
    {

      if( edit_pitch_screen_controller.create_pitch_mode )
      {
        if( AppType === APP_TYPE.TinyLineMarker )
          q$html( "#edit-pitch #header" ).html( translate["Create new pitch"] + " " + pitch_generator.active.name );
        else
          q$html( "#edit-pitch #header" ).html( translate["Create new job"] + " " + pitch_generator.active.name );
      }
      else
      {
        q$html( "#edit-pitch #header" ).html( translate["Edit"] + " " + pitch_generator.active.name );
      }

      q$html( "#edit-pitch #cancel_button" ).html( translate["Cancel"] );
      q$html( "#edit-pitch #open_advance_button" ).html( translate["Advanced"] );
      q$html( "#edit-pitch #save_button" ).html( translate["Save"] );
      q$html( "#edit-pitch #revision_button" ).html( translate["Revisions"] );

      if( AppType === APP_TYPE.TinyLineMarker )
      {
        q$html( "#edit-pitch #edit_name_label" ).html( translate["Pitch name"] + ": " );
        q$html( "#edit-pitch #next_button" ).html( translate["Next"] );
      }
      else
      {
        q$html( "#edit-pitch #edit_name_label" ).html( translate["Job name"] + ": " );
        q$html( "#edit-pitch #next_button" ).html( translate["Collect"] );
      }

      q$html( "#edit-pitch #rotation_angle_label" ).html( translate["Rotation"] + ":" );
      q$html( "#edit-pitch #length_label" ).html( translate["Length"] + " (m):" );
      q$html( "#edit-pitch #width_label" ).html( translate["Width"] + " (m):" );

      if( !pitch_generator.active.show_advance_menu )
        q$class( "#edit-pitch #open_advance_button" ).addClass( "gone" );
      else
        q$class( "#edit-pitch #open_advance_button" ).removeClass( "gone" );


      q$class( "#edit-pitch #length-table-cell" ).addClass( "gone" );
      q$class( "#edit-pitch #width-table-cell" ).addClass( "gone" );
    }


    if( !dont_update_numbers_bar )
    {
      edit_pitch_screen_controller.update_numbers_bar();
      $( "#edit-pitch #top-line .extra-pitch-settings" ).remove();
      var option_keys = Object.keys( pitch_generator.active.options );

      option_keys = option_keys.sort( function( a, b )
      {
        var oa = pitch_generator.active.options[a];
        var ob = pitch_generator.active.options[b];
        if( oa.type > ob.type )
          return 1;
        if( oa.type === ob.type )
          return 0;
        if( oa.type < ob.type )
          return -1;

      } );

      var all_html = "";
      option_keys.forEach( function( v )
      {
        var option = pitch_generator.active.options[v];
        if( !(option.type === "bool" || option.type === "text") && !option.is_info )
          return;
        if( !option.adjustable )
          return;
        if( !!option.robot_version && !robot_controller.is_robot_version_more_or_equal( option.robot_version ) )
          return;
        if( !!option.robot_capability && !robot_controller.robot_has_capability( option.robot_capability ) )
          return;
        if( option.name === "Reverse" && pitch_generator.active.tasks.length === 1 && pitch_generator.active.tasks[0].type === "arc3" && pitch_generator.active.tasks[0].ends.length === 2 )
        {
          return;
        }

        var id = v.replace( /\ /g, "_" ) + "_id_adjust";
        let name = translate[option.name];

        if( option.is_info )
        {
          if( option.type === "float" )
          {
            var new_val = option.val;
            if( settings_screeen_controller.use_emperial && !(option.units && option.units !== "m") )
              new_val = new_val.meter2unit();

            var rounded_val = new_val.round(3);

            var html = '<td class="extra-pitch-settings" style="text-align:center;">';
            //html += '<h4 class="checkbox-label" style="white-space: nowrap;font-family: \'ProximaNova\';font-size: calc( 20px * var(--device-scale) );font-weight: normal;margin: 0;"><label for="' + id + '">' + name + '</label></h4>';
            html += '<h4 class="checkbox-label" style="white-space: nowrap;font-family: \'ProximaNova\';font-size: calc( 20px * var(--device-scale) );font-weight: normal;margin: 0;">' + name + '</h4>';
            //html += '</td>';
            if( !option.units )
              option.units = "m";

            if( settings_screeen_controller.use_emperial && !(option.units && option.units !== "m") )
              html += '<h4 id="' + id + '">' + rounded_val + " " + translate_unit() + '</h4>';
            else
              html += '<h4 id="' + id + '">' + rounded_val + " " + translate[option.units] + '</h4>';
            html += '</td>';
            all_html += html;
            //q$( "#edit-pitch #top-line" ).append( html );

          }
        }
        else
        {
          if( option.type === "bool" && !(option.name === "Reverse" && SETTINGS.show_reverse_button))
          {
            var html = '<td class="extra-pitch-settings"><table><tr><td>';
            html += '<input ' + (option.val ? 'checked="checked" ' : '') + 'onchange="edit_pitch_screen_controller.change_bool_variable(\'' + v + '\')" type="checkbox" name="' + id + '" value="valuable" id="' + id + '" style="margin-left: calc( 24px * var(--device-scale) );"/>';
            html += '</td><td>';
            html += '<h4 class="checkbox-label"><label for="' + id + '">' + name + '</label></h4>';
            html += '</td></tr></table></td>';
            all_html += html; 
            //q$( "#edit-pitch #top-line" ).append( html );
          }
          if( option.type === "text" )
          {
            var html = '<td class="extra-pitch-settings"><table><tr><td>';
            html += '<h4 class="checkbox-label"><label for="' + id + '">' + name + ':</label></h4>';
            html += '</td><td>';
            html += '<input oninput="edit_pitch_screen_controller.change_text_variable(\'' + v + '\', false, true)" type="text" name="' + id + '" value="' + option.val + '" id="' + id + '" style="width:200px" />';
            html += '</td></tr></table></td>';
            all_html += html;
            //q$( "#edit-pitch #top-line" ).append( html );
          }
        }


      } );
      q$( "#edit-pitch #top-line" ).append( all_html );

    }
    //advance_edit_screen.update( dont_update_numbers_bar );
  },
  update_advande_overlay: function()
  {
    $( "#advance-options-overlay" ).empty();

    var option_keys = Object.keys( pitch_generator.active.options );
    var options_drawn = 0;
    option_keys.forEach( function( v )
    {
      var option = pitch_generator.active.options[v];
      if( !option.configurable )
        return;
      options_drawn++;
      var id = v.replace( /\ /g, "_" ) + "_id";
      var html = '<table><tr><td>';
      var name = translate[option.name] ? translate[option.name] : option.name;
      html += '<input ' + (option.val ? 'checked="checked" ' : '') + 'onchange="edit_pitch_screen_controller.change_bool_variable(\'' + v + '\')" type="checkbox" name="' + id + '" value="valuable" id="' + id + '" style="margin-left: calc( 24px * var(--device-scale) );"/>';
      html += '</td><td>';
      html += '<h4 class="checkbox-label" style="white-space: nowrap;font-family: \'ProximaNova\';font-size: calc( 20px * var(--device-scale) );font-weight: normal;margin: 0;"><label for="' + id + '">' + name + '</label></h4>';
      html += '</td></tr></table><br>';
      $( "#advance-options-overlay" ).append( html );
    } );
    if( !options_drawn || !pitch_generator.active.show_advance_menu )
    {
      $( "#edit-pitch #open_advance_button" ).addClass( "gone" );
    }
    else
    {
      $( "#edit-pitch #open_advance_button" ).removeClass( "gone" );
    }
  },
  toggle_open_advance_menu: function()
  {
    if( $( "#advance-options-overlay" ).hasClass( "gone" ) )
    {
      $( "#advance-options-overlay" ).removeClass( "gone" );
    }
    else
    {
      $( "#advance-options-overlay" ).addClass( "gone" );
    }
  },
  last_option_value: undefined,
  edit_option_value: function()
  {
    var new_value = parseFloat( $( "#edit-pitch #option_input_input" ).val() );

    if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched] &&
      pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].units === "m" )
      new_value = new_value.unit2meter();

    if( !new_value )
      new_value = 0;
    console.log( new_value );

    var orig = new_value;
    if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched] &&
      pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].units === "deg" )
      new_value *= Math.PI / 180;

    //console.log( "edit", orig, edit_pitch_screen_controller.last_option_value );
    if( Math.abs( orig - edit_pitch_screen_controller.last_option_value ) > 0.0001 )
    {
      edit_pitch_screen_controller.last_option_value = orig;
      if( pitch_generator.active.handles[edit_pitch_screen_controller.last_touched] &&
        pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].on_new_val( new_value ) )
        edit_pitch_screen_controller.draw_pitch( true );
    }
  },
  change_variable: function( v, from_Advance, new_value, update_options=false )
  {

    if( pitch_generator.active.options[v] && pitch_generator.active.options[v].show_warning_popup )
      pitch_generator.active.options[v].show_warning_popup();

    if( !$.isEmptyObject(pitch_generator.active.options["taskModificationIds"].val) && !pitch_generator.active.options[v].deselectsafe )
    {
      popup_screen_controller.confirm_popup( translate["This will reset all modified lines"], translate["Do you want to continue?"], translate["yes"], translate["no"], function()
      {
        pitch_generator.active.options[v].val = new_value;
        pitch_generator.active.options["taskModificationIds"].val = {};
        pitch_generator.active.draw();
        edit_pitch_screen_controller.draw_pitch();
  
        if( from_Advance )
        {
          advance_edit_screen.update_infos();
          advance_edit_screen.update( true );
        }
        popup_screen_controller.close();
      }, function()
      {
        advance_edit_screen.update_options();
        popup_screen_controller.close();
      } );

    }
    else
    {
      pitch_generator.active.options[v].val = new_value;
      pitch_generator.active.options["taskModificationIds"].val = {};
      pitch_generator.active.changed = true;
      pitch_generator.active.draw();
      edit_pitch_screen_controller.draw_pitch();

      if( from_Advance )
      {
        advance_edit_screen.update_infos();
        advance_edit_screen.update( !update_options );
      }
    }

  },
  change_bool_variable: function( v, from_Advance )
  {
    console.log( v );
    var id = v.replace( /\ /g, "_" ) + "_id";
    if( !from_Advance )
      id += "_adjust";
    var new_val = $( "#" + id ).prop( "checked" );
    edit_pitch_screen_controller.change_variable( v, from_Advance, new_val, true); // Update options

  },
  change_float_variable: function( v, from_Advance )
  {
    console.log( v );
    const id = v.replace( /\ /g, "_" ) + "_id";
    let new_val = parseFloat( $( "#" + id ).val( ) );

    if( isNaN(new_val) )
      return;

    if( !(pitch_generator.active.options[v].units && pitch_generator.active.options[v].units !== "m") )
      new_val = new_val.unit2meter();

    if( pitch_generator.active.options[v].min !== undefined && new_val < pitch_generator.active.options[v].min )
    {
      return;
    }
    if( pitch_generator.active.options[v].max !== undefined && new_val > pitch_generator.active.options[v].max )
    {
      return;
    }
      
    edit_pitch_screen_controller.change_variable( v, from_Advance, new_val);
  },
  change_text_variable: function( v, from_Advance, force_focus = false )
  {
    console.log( v );
    var id = "#" + v.replace( /\ /g, "_" ) + "_id";
    if( !from_Advance )
      id += "_adjust";
    var new_val = $( id ).val( );
    if( !new_val )
      return;

    edit_pitch_screen_controller.change_variable( v, from_Advance, new_val);
    if(force_focus)
    {
      edit_pitch_screen_controller.focus_on_text_end(id)
    }
  },
  focus_on_text_end: function(selector)
  {
    let element = $(selector);

    // Multiply by 2 to ensure the cursor always ends up at the end;
    // Opera sometimes sees a carriage return as 2 characters.
    var strLength = element.val().length * 2;

    element.focus();
    element[0].setSelectionRange(strLength, strLength);
  },
  edit_rotation: function( force_val, val )
  {
    return;
  },
  move: function()
  {
    var move;
    move = new Vector( parseFloat( $( "#edit-pitch #move_right_input" ).val( ) ).unit2meter(), parseFloat( $( "#edit-pitch #move_up_input" ).val( ) ).unit2meter() );
    move = move.rotate( pitch_generator.get_variable( "Angle" ) );

    var new_pos = edit_pitch_screen_controller.saved_move_position.add( move );
    pitch_generator.active.handles[edit_pitch_screen_controller.last_touched].on_new_val( new_pos );

    edit_pitch_screen_controller.draw_pitch( true );

  },

  start_save: function( force_customer )
  {

    if( !pitch_generator.active.tasks.length )
    {
      if( AppType === APP_TYPE.TinyLineMarker )
      {
        // header, body, ok_text, cancel_text, ok_callback, cancel_callback 
        popup_screen_controller.confirm_popup( translate["You cannot save this pitch"], "", translate["OK"], "", popup_screen_controller.close );
      }
      else
      {
        popup_screen_controller.confirm_popup( translate["You cannot save this job"], "", translate["OK"], "", popup_screen_controller.close );
      }
      return;
    }

    if (pitch_generator.active.options.saveToCloud.val) {
      if (AppType === APP_TYPE.TinyLineMarker) {
        popup_screen_controller.open_info_waiter(translate["Saving pitch"], "", "", true);

      }
      else {
        popup_screen_controller.open_info_waiter(translate["Saving job"], "", "", true);
      }
    }

    edit_pitch_screen_controller.remove_pitch();

    if( !pitch_generator.active.options.saveToCloud.val )
    {
      if(pitch_generator.active.new_job) {
        map_controller.background.jobs.add_job( pitch_generator.active );
      }
      robot_controller.replace_job( pitch_generator.active.id, pitch_generator.active.copy() );
      edit_pitch_screen_controller.remove_pitch();
      if(!pitch_generator.active.new_job)
      {
        pitch_generator.set_active_from_db_job_id( pitch_generator.active.id );
      }
      edit_pitch_screen_controller.isOpen = false;
    }
    else if( pitch_generator.active instanceof MultiJob )
    {
      console.log( "saving modified pitches" );

      var jobs = pitch_generator.active.jobs;
      var save_this = 0;
      function do_next()
      {
        if( save_this === jobs.length )
        {
          event_controller.remove_callback( "save_db_job_done", do_next );
          event_controller.remove_callback( "create_db_job_done", do_next );
          if(!jobs[0].new_job)
          {
            pitch_generator.set_active_from_db_job_id( jobs[0].id );
          }
          edit_pitch_screen_controller.done_saving();
        }
        else
        {
          console.log( "Saving", save_this );
          pitch_generator.save_pitch( jobs[save_this], force_customer );
          save_this++;
        }
      }
      event_controller.add_callback( "save_db_job_done", do_next );
      event_controller.add_callback( "create_db_job_done", do_next );
      do_next();
    }
    else
    {
      event_controller.add_callback( "save_db_job_done", edit_pitch_screen_controller.done_saving );
      event_controller.add_callback( "create_db_job_done", edit_pitch_screen_controller.done_saving );

      console.log( "saving modified pitch" );
      var new_name = $( "#edit-pitch #edit_name_input" ).val().trim();
      if( new_name )
        pitch_generator.active.name = new_name;
      pitch_generator.save_pitch( pitch_generator.active, force_customer );

      if(!pitch_generator.active.new_job)
      {
        pitch_generator.set_active_from_db_job_id( pitch_generator.active.id );
      }
    }

    map_controller.background.ignore_active = false;

    $( "#advance-options-overlay" ).addClass( "gone" );
  },
  done_saving: function()
  {
    pitch_generator.reselect();
    popup_screen_controller.close();
    edit_pitch_screen_controller.isOpen = false;

    event_controller.remove_callback( "create_db_job_done", edit_pitch_screen_controller.done_saving );
    event_controller.remove_callback( "save_db_job_done", edit_pitch_screen_controller.done_saving );
  },

  revisions: [ ],
  got_revisions: function( jobs )
  {
    edit_pitch_screen_controller.revisions = jobs;
    event_controller.remove_callback( "got_db_job_revisions", edit_pitch_screen_controller.got_revisions );
    popup_screen_controller.close();
    $( "#choose_job_revision_screen #revision_choose_range" ).attr( "max", jobs.length - 1 );
    $( "#choose_job_revision_screen #revision_choose_range" ).val( jobs.length - 1 );
    edit_pitch_screen_controller.set_info();

    bottom_bar_chooser.choose_bottom_bar( "#choose_job_revision_screen" );
  },
  _set_info_debounce_timeout: null,
  set_info_with_debounce: function()
  {
    clearTimeout(edit_pitch_screen_controller._set_info_debounce_timeout);
    setTimeout(edit_pitch_screen_controller.set_info, 200);
  },
  set_info: function(  )
  {
    clearTimeout(edit_pitch_screen_controller._set_info_debounce_timeout);

    var revision_nr = $( "#choose_job_revision_screen #revision_choose_range" ).val();
    var time = new Date( edit_pitch_screen_controller.revisions[revision_nr].date_from );
    $( "#choose_job_revision_screen #time_info" ).text( new Intl.DateTimeFormat(translate["LCID"], { dateStyle: 'full', timeStyle: 'short' }).format(time) );

    const job = edit_pitch_screen_controller.revisions[revision_nr];
    //new_job = new pt[job.template]( job.id, job.name, job.build_extra.layout_method );
    pitch_generator.active.points = job.build_extra.points.map( p => p.toVector() );

    // add Variables
    var var_keys = Object.keys( job.build_extra.options );
    var_keys.forEach( function( key )
    {
      var keyInside = key;
      (key === "8 man pitch 1") ? keyInside = "PitchInPitch 1" : 0;
      (key === "8 man pitch 2") ? keyInside = "PitchInPitch 2" : 0;
      (key === "Full 8 man pitches") ? keyInside = "Full PitchInPitch" : 0;
      if( pitch_generator.active.options[keyInside] && !pitch_generator.active.options[keyInside].dontsave )
        pitch_generator.active.options[keyInside].val = job.build_extra.options[key];
    } );
    pitch_generator.active.draw();
    edit_pitch_screen_controller.draw_pitch( false, true );
    edit_pitch_screen_controller.zoom_to_revision();
  },
  zoom_to_revision_timeout: null,
  zoom_to_revision_event_id: 0,
  zoom_to_revision: function()
  {
    const id = time.now.toString();
    edit_pitch_screen_controller.zoom_to_revision_event_id = id;
    const interrupt = ()=>{
      if(edit_pitch_screen_controller.zoom_to_revision_event_id === id)
      {
        map_controller.background.zoom_to_pitch( pitch_generator.active, false, 1000 );
        clearTimeout(edit_pitch_screen_controller.zoom_to_revision_timeout);
        edit_pitch_screen_controller.zoom_to_revision_event_id = 0;
      }
    };
    edit_pitch_screen_controller.zoom_to_revision_timeout = setTimeout(interrupt, 500);
  },
  open_revision_screen: function()
  {
    map_controller.background.ignore_active = true;
    pitch_generator.active.removePitchLayer();
    pitch_generator.original.removePitchLayer(); // TODO: Change colors for original and active pitches
    event_controller.add_callback( "got_db_job_revisions", edit_pitch_screen_controller.got_revisions );
    robot_controller.fetch_db_job_revisions( pitch_generator.active.id );
    popup_screen_controller.open_info_waiter( translate["Fetching revisions from server"], "", "" );
  },
  save_revision: function()
  {
    edit_pitch_screen_controller.start_save();
  },
  cancel_revision: function()
  {
    $( "#choose_job_revision_screen #revision_choose_range" ).val( edit_pitch_screen_controller.revisions.length - 1 );
    edit_pitch_screen_controller.set_info();
    edit_pitch_screen_controller.cancel();
  },
  /**
   * 
   * @param {Job} job 
   * @param {ProjectorClass} oldProjector
   * @param {ProjectorClass} newProjector
   * @returns {Job} reprojected job
   */
  convertJobToProjection: function(job, oldProjector, newProjector)
  {
    job.points = job.points.map(p=>
      newProjector.forward(
        oldProjector.inverse(p.toArray())
      ).toVector()
      );
    job.projection = newProjector.pr.originalString;
    job.proj_alias = newProjector.pr.alias;
    return job;
  },
  /**
   * 
   * @param {Job} job
   * @returns {Job} reprojected job
   */
  convertJobToCorrectProjection: function(job)
  {
    if(job.projectionValid)
    {
      console.warn("Job projection already valid!");
      return;
    }

    const oldProjector = job.projector;
    const lnglatCenter = oldProjector.inverse(job.center.toArray());
    const newProjector = projection_controller.get_best_projector(lnglatCenter);
    return edit_pitch_screen_controller.convertJobToProjection(job, oldProjector, newProjector);
  },
  convertActiveJobToCorrectProjection: function()
  {
    pitch_generator.active = edit_pitch_screen_controller.convertJobToCorrectProjection(pitch_generator.active);
    edit_pitch_screen_controller.start_save();
  }
};
