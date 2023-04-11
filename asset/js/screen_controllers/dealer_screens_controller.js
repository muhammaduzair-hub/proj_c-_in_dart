/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global pt, pt_options, communication_controller, robot_controller, event_controller, map_controller, popup_screen_controller */

var dealer_screens_controller = {

  update_template_enabler: function()
  {

    var template_ids = pt.list;
    if( pt.templates.length )
    {
      template_ids = template_ids.filter( function( template_id )
      {
        return pt.templates.indexOf( template_id ) >= 0;
      } );
    }

    $( "#enable_templates_menu #templates" ).empty();
    var pitch_types = Object.keys( pt.pitches );
    var pt_options_a = Object.keys( pt_options );

    pitch_types.forEach( function( type )
    {

      var html = '';
      var type_title = type;

      if( pt.pitches[type].length > 1 || true )
      {
        pt.pitches[type].forEach( function( template )
        {
          var tmp = new pt[template]();

          var templ_name = "enable_template_" + template;
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
            var option_name = "option_" + option + "_" + template;
            pt_options[option].forEach( function( tmpl )
            {
              if( tmpl === template )
              {
                if( pt.template_options[template] && pt.template_options[template].indexOf( option ) >= 0 )
                  html += '<tr><td></td><td><input checked="checked" type="checkbox" name="' + option_name + '" value="valuable" id="' + option_name + '" class="this_is_a_template_option"/></td><td colspan="2"><p class="checkbox-label"><label for="' + option_name + '">' + option + '</label></p></td></tr>';
                else
                  html += '<tr><td></td><td><input type="checkbox" name="' + option_name + '" value="valuable" id="' + option_name + '" class="this_is_a_template_option"/></td><td colspan="2"><p class="checkbox-label"><label for="' + option_name + '">' + option + '</label></p></td></tr>';
              }
            } );
          } );

          html += "</table></div>";

        } );
      }

      $( "#enable_templates_menu #templates" ).append( html );
    } );

  },

  save_new_template_list: function()
  {

    var templ_string = "";

    var templates = $( "#enable_templates_menu #templates input.this_is_a_raw_template_id" ).length;
    for( var i = 0; i < templates; i++ )
    {
      var template = $( "#enable_templates_menu #templates input.this_is_a_raw_template_id" )[i].id;
      var template_id = template.replace( "enable_template_", "" );
      var checked = ($( '#enable_templates_menu #templates #enable_template_' + template_id + ':checkbox:checked' ).length) > 0;
      if( checked )
      {
        if( templ_string )
          templ_string += ",";
        templ_string += template_id;

        var options = $( "#enable_templates_menu #templates #enable_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" ).length;
        for( var o = 0; o < options; o++ )
        {
          var opt = $( "#enable_templates_menu #templates #enable_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" )[o].id.replace( "option_", "" );
          opt = opt.replace( "_" + template_id, "" );
          templ_string += "?" + opt;
        }
      }
    }
    console.log( templ_string );
    communication_controller.send( 'set_user_templates', {
      templates: templ_string
    }, "cloud", 10 );

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
  open: function()
  {
    $("#set_new_robot_name_input").val(robot_controller.chosen_robot.name);
  },
  robot_name_change: function()
  {
    let robot_name = robot_controller.chosen_robot.name;
    let old_robot_name = $( "#set_new_robot_name_input" ).val();
    let robot_elementID = $( "#set_new_robot_name_input" ).is( ":focus" );

      if(robot_name !== old_robot_name && !robot_elementID)
      {
        $("#set_new_robot_name_input").val(robot_name);
      }
  }
};

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "enable_templates_menu" )
  {
    dealer_screens_controller.update_template_enabler();
  }
  if( settings_screen_name === "dealer_menu" )
  {
    dealer_screens_controller.open();
  }
} );

event_controller.add_callback( "robot_list_updated", dealer_screens_controller.robot_name_change);
