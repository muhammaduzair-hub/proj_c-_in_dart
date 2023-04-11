/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global pitch_generator, projection, ol, gps_controller, robot_controller, projection_controller, Projector, map_controller, edit_pitch_screen_controller, translate, settings_screeen_controller, Infinity, custom_map_controller, q$ */

var advance_edit_screen = {
  open: function( special_screen = "", no_jobs = false )
  {
    advance_edit_screen.special_screen = special_screen;

    $( "#advance_edit_screen" ).removeClass( "gone" );
    advance_edit_screen.update( );

    if(no_jobs)
    {
      advance_edit_screen.background.zoom_to_all();
    }
    else
    {
      advance_edit_screen.background.zoom_to_pitch( pitch_generator.active );
    }
  },
  close: function( )
  {
    $( "#advance_edit_screen" ).addClass( "gone" );
    if( advance_edit_screen.special_screen !== "" )
    {
      edit_pitch_screen_controller.ask_to_cancel();
      edit_pitch_screen_controller.remove_pitch();
    }

    if( advance_edit_screen.special_screen === "" )
      edit_pitch_screen_controller.draw_pitch( );

    advance_edit_screen.special_screen = "";
  },
  update: function( dont_update_options )
  {
    if( !dont_update_options )
      advance_edit_screen.update_options( );
    advance_edit_screen.update_map( );

    if( advance_edit_screen.special_screen === "" )
    {
      q$( "#advance_edit_screen #close_button" ).removeClass( "gone" );
      q$( "#advance_edit_screen #cancel_button" ).addClass( "gone" );
      q$( "#advance_edit_screen #save_button" ).addClass( "gone" );
    }
    else
    {
      q$( "#advance_edit_screen #close_button" ).addClass( "gone" );
      q$( "#advance_edit_screen #cancel_button" ).removeClass( "gone" );
      q$( "#advance_edit_screen #save_button" ).removeClass( "gone" );
    }


    switch( advance_edit_screen.special_screen )
    {
      case "fit_screen":
        q$( "#advance_edit_screen #advance_edit_screen_title" ).text( translate["Convert points"] );
        q$( "#advance_edit_screen #map_header" ).empty();
        advance_edit_screen.background.allow_map_click = false;
        break;
      case "move_job_screen":
        q$( "#advance_edit_screen #advance_edit_screen_title" ).text( translate["Move jobs to customer"] );
        advance_edit_screen.background.allow_map_click = true;
        break;
      default:
        q$( "#advance_edit_screen #advance_edit_screen_title" ).text( translate["Advanced editing"] );
        q$( "#advance_edit_screen #map_header" ).html( ()=>{
          let text = translate["Select lines to modify them"];
          text += `<br>`;
          text += `<span style="font-weight:bold;-webkit-text-stroke: .25px black;color:${Background.featureColor.ACTIVE}">${translate["Normal"]}</span>`;
          text += ` | <span style="font-weight:bold;-webkit-text-stroke: .25px black;color:${Background.featureColor.IGNORE}">${translate["Ignored"]}</span>`;
          if(robot_controller.robot_has_any_capability( ["position_filtering_altitude","position_filtering_varzi"] ))
          {
            text += ` | <span style="font-weight:bold;-webkit-text-stroke: .25px black;color:${Background.featureColor.INTERFERENCE_FILTER}">${translate["Tree filter"]}</span>`;
          }
          if(robot_controller.robot_has_any_capability( ["napping_version_1", "napping_version_2", "napping_version_3"] ))
          {
            text += ` | <span style="font-weight:bold;-webkit-text-stroke: .25px black;color:${Background.featureColor.ANTINAPPING}">${translate["Antinapping"]}</span>`;
          }
          text += ` | <span style="font-weight:bold;-webkit-text-stroke: .25px black;color:${Background.featureColor.VIA}">${translate["Robot Path"]}</span>`;
          return text;
        });
        advance_edit_screen.background.allow_map_click = true;
    }
  },
  save: function()
  {
    map_controller.background.ignore_active = false;
//    map_controller.background.remove_all_pitches( );
    edit_pitch_screen_controller.start_save();
    advance_edit_screen.close();
  },
  cancel: function()
  {
    map_controller.background.ignore_active = false;
//    map_controller.background.remove_all_pitches( );
    advance_edit_screen.close();
  },
  sort_options: function( options )
  {
    let siblings = options.filter( function( option )
    {
      return option.prev_sibling;
    } ).reverse();
    let firstborns = options.filter( function( option )
    {
      return !option.prev_sibling;
    } );

    let last_sibling_count = -1;
    while( siblings.length && last_sibling_count !== siblings.length )
    {
      last_sibling_count = siblings.length;

      siblings = siblings.filter( function( sibling )
      {
        let firstborn_index = -1;
        firstborns.forEach( ( firstborn, i ) => {
          if( firstborn.key === sibling.prev_sibling )
            firstborn_index = i;
        } );

        if( firstborn_index >= 0 )
        {
          firstborns.splice( firstborn_index + 1, 0, sibling );
          return false;
        }
        else
        {
          return true;
        }

      } );
    }

    return firstborns.concat( siblings );
  },
  get_options_family: function( options, option_categories )
  {
    const options_array = Object.keys( options ).map( function( key )
    {
      let val = Object.assign({}, options[key] );
      if( !val.name )
        val.name = key;
      val.key = key;
      return val;
    } );

    const categories = Array.from(option_categories).sort_objects('position');
    const return_options = [];
    categories.forEach( category =>
    {
      let _a = options_array.filter(option=>option.category===category.title);
      let _b = advance_edit_screen.sort_options( _a.sort_objects( 'name', false, true ) )
      return_options.push(_b);
    });
    let _a = options_array.filter(option=>!option.category);
    let _b = advance_edit_screen.sort_options( _a.sort_objects( 'name', false, true ) )
    return_options.push(_b);
    
    return return_options.flat();
  },
  generate_option_input_html: function( option )
  {
    var v = option.key;

    if( !option.configurable )
      return;

    if( option.special_screen )
    {
      if( option.special_screen.indexOf(advance_edit_screen.special_screen) < 0 )
      {
        return;
      }
    }
    else
    {
      if( advance_edit_screen.special_screen !== "" )
      {
        return;
      }
    }

    var id = v.replace( /\ /g, "_" ) + "_id";
    let name = translate[option.name].format(...(option.name_inserts instanceof Array ? option.name_inserts : [option.name_inserts]));

    let unit;
    if( option.units && option.units !== "number" )
    {
      unit = !(option.units && option.units !== "m") ? translate_unit() : translate[option.units];
    }

    let input_html = "";
    switch( option.type )
    {
      case "button":
        input_html = $.parseHTML(`<button class="dark">${name}</button>`);
        $(input_html).on('click',()=>{option.callback();advance_edit_screen.update( true );});
        break;
      case "bool":
        option.label_first = true;
        input_html = $.parseHTML('<input ' + (option.val ? 'checked="checked" ' : '') + 'onchange="edit_pitch_screen_controller.change_bool_variable(\'' + v + '\',true)" type="checkbox" name="' + id + '" value="valuable" id="' + id + '"/>');
        break;
      case "int":
      case "float":
        option.label_first = true;
        var new_val = option.val ? option.val : 0;
        if( !(option.units && option.units !== "m") ) // This is actually working as intended. If an options is not working as it should; try to set its "units" to "number"
          new_val = new_val.meter2unit();

        if( option.min !== undefined && option.max !== undefined )
        {
          name += ` ( ${option.min} - ${option.max} )`;
        }
        else if( option.min !== undefined && option.max === undefined )
        {
          name += ` ( ≥ ${option.min} )`;
        }
        else if( option.min === undefined && option.max !== undefined )
        {
          name += ` ( ≤ ${option.max} )`;
        }
        let rounded_val = new_val.round(3);
        input_html += `<input onblur="advance_edit_screen.update_infos()" ${option.is_info ? "disabled" : ""} oninput="edit_pitch_screen_controller.change_float_variable('${v}',true)" type="number" name="${id}" value="${rounded_val}" id="${id}" style="width:100px" />`;
        if(unit)
          name += ` (${unit.toLowerCase()})`;
        input_html = $.parseHTML(input_html);
        break;
      case "text":
        input_html = $.parseHTML(`<input oninput="edit_pitch_screen_controller.change_text_variable('${v}',true)" type="text" name="${id}" value="${option.val}" id="${id}" style="width:200px" />`);
        option.label_first = true;
        break;
      case "select":
        option.label_first = true;
        input_html += '<select oninput="edit_pitch_screen_controller.change_text_variable(\'' + v + '\',true)" name="' + id + '" id="' + id + '" style="width:200px" >';
        option.values.forEach( possible_value => {
          input_html += '<option value="' + possible_value + '" ' + (option.val === possible_value ? "selected" : "") + ' >' + translate[possible_value] + '</option>';
        } );
        input_html += '</select>';
        input_html = $.parseHTML(input_html);
        $(input_html).on('change',()=>{advance_edit_screen.update();});
        break;
      default:
        return;
    }

    const label_html = $.parseHTML(`<h4 class="checkbox-label"><label for="${id}">${name}</label></h4>`);

    const table = $.parseHTML(`<table class="job_option option_${option.type}"></table>`);
    const row = $.parseHTML(`<tr></tr>`);

    const create_warning = () => {
      if( option.show_warning_popup )
      {
        const warning = $.parseHTML(`<img src="img/icons/Warning@2x_none.png" alt="" style="height:30px">`);
        $(warning).on('click',option.show_warning_popup);
        $(row).append($($.parseHTML(`<td></td>`)).append(warning));
      }
    };

    if( option.type === "button" )
    {
      const col = $($.parseHTML(`<td colspan="2"></td>`)).append(input_html);
      $(row).append(col);
    }
    else
    {
      const col1 = $($.parseHTML(`<td class="check_side"></td>`)).append(label_html);
      const col2 = $($.parseHTML(`<td class="label_side"></td>`)).append(input_html);
      if( option.label_first )
      {
        $(row).append(col1);
        create_warning();
        $(row).append(col2);
      }
      else
      {
        $(row).append(col2);
        $(row).append(col1);
        create_warning();
      }
    }

    $(table).append(row);

    return table;
  },
  update_options: function( )
  {
    q$( "#advance_edit_screen #options_side" ).empty( );
    const options = advance_edit_screen.get_options_family( pitch_generator.active.options, pitch_generator.active.option_categories );

    var options_drawn = 0;
    var all_html = $.parseHTML('<!-- OPTIONS -->');
    options.forEach( function( option )
    {
      const html = advance_edit_screen.generate_option_input_html( option );
      if( html )
      {
        options_drawn++;
        q$( "#advance_edit_screen #options_side" ).append( html );
      }
    } );
  },
  update_infos: function()
  {
    var option_keys = Object.keys( pitch_generator.active.options );
    var options = option_keys.map( function( key )
    {
      var val = JSON.copy( pitch_generator.active.options[key] );
      val.name = translate[val.name] ? translate[val.name].format(...(val.name_inserts instanceof Array ? val.name_inserts : [val.name_inserts])) : val.name;
      if( !val.name )
        val.name = key;
      val.key = key;
      return val;
    } );

    options.forEach( function( val )
    {
      var v = val.key;
      if( !pitch_generator.active.options[v].configurable )
        return;
      
      var id = v.replace( /\ /g, "_" ) + "_id";

      switch( val.type )
      {
        case "bool":

          break;
        case "int":
        case "float":
          var new_val = val.val;
          if( settings_screeen_controller.use_emperial && !(val.units && val.units !== "m") )
            new_val = new_val.meter2unit();

          new_val = new_val.round(3);

          break;
        default:
          return;
          break;
      }

      $( "#advance_edit_screen #options_side #" + id ).val( new_val );

    } );
  },
  start_map: function( )
  {
    advance_edit_screen.background = new AdvancedEditBackground( "#advance_edit_screen .advanced_map_canvas #advanced_map" );
    advance_edit_screen.background.start_map( );
  },
  pitch_layer: undefined,
  update_map: function( )
  {
    if( !advance_edit_screen.background )
    {
      advance_edit_screen.start_map( );
    }
    else
    {
      advance_edit_screen.background.update_map();
    }
    
    if(advance_edit_screen.pitch_layer)
    {
      advance_edit_screen.pitch_layer.remove();
    }

    advance_edit_screen.pitch_layer = advance_edit_screen.background.draw_job( pitch_generator.active, Background.featureColor.ACTIVE );
  }
};