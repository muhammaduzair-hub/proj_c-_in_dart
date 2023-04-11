/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global popup_screen_controller, communication_controller, message_controller, pt, pt_options, event_controller, pop_generator, developer_screen, login_screen_controller */

var manage_customers_screen = {
  open: function()
  {
    manage_customers_screen.customer_tablets = {};
    manage_customers_screen.customer_robots = {};
    manage_customers_screen.update_customers();
  },
  update_customers: function()
  {
    manage_customers_screen.customer_to_move = 0;
    manage_customers_screen.customer_old_dealer = 0;

    $( "#manage_customers_menu #customers_list" ).empty( );
    popup_screen_controller.open_info_waiter( "Getting list of customers", "", "" );
    communication_controller.send( "get_customers", {"force_customer": 1}, "cloud", 10 );

    /*
     function got_customers( data ) {
     
     var ids = manage_customers_screen.customer_data.customers.map(function(cus){return cus.id;});
     
     message_controller.events.add_callback( "user_customers_tablets", got_tablets );
     message_controller.events.remove_callback( "user_customers", got_customers );
     }
     function got_tablets( data ) {
     manage_customers_screen.draw_customers( data );
     popup_screen_controller.close( "#info_waiting_popup" );
     
     }
     */


    function got_customers( data )
    {
      manage_customers_screen.draw_customers( data );
      popup_screen_controller.close( "#info_waiting_popup" );
      message_controller.events.remove_callback( "user_customers", got_customers );
    }

    message_controller.events.add_callback( "user_customers", got_customers );
  },
  manage_user: function( customer_id, user_id )
  {

    var user = manage_customers_screen.customer_tablets[customer_id].tablets.filter( ( u ) => {
      return u.tablet_id === user_id;
    } )[0];

    var header_text = "Manager " + user.tablet_name;
    var body_text = "What action would you like to do?<br>";
    if( user.robot_id && user.customer !== user.robot_customer )
    {
      header_text += '<br><span style="color: red;">Robot and tablet doesn\'t belong to same customer!</span>';
    }
    var buttons = [ ];
    buttons.push( new PopButton( "Select templates", function()
    {
      manage_customers_screen.change_customer_templates( user_id, true );
    } ) );

    if( user.robot_id )
    {
      buttons.push( new PopButton( "Change robot name", function()
      {
        var new_name = prompt( "Input new name", user.robot_name );
        if( new_name )
        {

          popup_screen_controller.pop_up_once( "Saving robot name", "set_robot_name_done" );

          function refresh()
          {
            message_controller.events.remove_callback( "set_robot_name_done", refresh );
            user.robot_name = new_name;
            //manage_customers_screen.draw_customers( manage_customers_screen.customer_data );
            manage_customers_screen.update_all_buttons_with_robot( user.robot_id, new_name );
          }
          message_controller.events.add_callback( "set_robot_name_done", refresh );

          communication_controller.send( 'set_robot_name', {
            robot: user.robot_id,
            customer: user.robot_customer,
            new_name: new_name
          }, "cloud", 10 );
        }
      } ) );
    }

    buttons.push( new PopButton( "Change customer", function()
    {

      var what_to_move_buttons = [ ];
      what_to_move_buttons.push( new PopButton( "Only tablet", function()
      {
        developer_screen.open_change_customer( user.tablet_id, -1, user.customer );
      } ) );
      if( user.robot_id && user.robot_customer === user.customer )
      {
        what_to_move_buttons.push( new PopButton( "Both", function()
        {
          developer_screen.open_change_customer( user.tablet_id, user.robot_id, user.customer );
        } ) );
      }
      if( user.robot_id )
      {
        what_to_move_buttons.push( new PopButton( "Only robot", function()
        {
          developer_screen.open_change_customer( -1, user.robot_id, user.robot_customer );
        } ) );
      }

      pop_generator.create_popup( "What should change customer", "", what_to_move_buttons, function()
      {
        pop_generator.close( );
      } );

    } ) );

    buttons.push( new PopButton( "Set user level", function()
    {
      developer_screen.open_select_user_level( 0, user.tablet_id )
    } ) );

    pop_generator.create_popup( header_text, body_text, buttons, function()
    {
      pop_generator.close( );
    } );
  },
  manage_robot: function( customer_id, robot_id )
  {
    var robot = manage_customers_screen.customer_robots[customer_id].robots.filter( ( r ) => {
      return r.robot_id === robot_id;
    } )[0];
    console.log( robot );

    var header_text = "Manager " + robot.robot_id + ", " + robot.robot_name;
    var body_text = "What action would you like to do?<br>";
    if( robot.tablet_id && robot.tablet_customer !== robot.robot_customer )
    {
      header_text += '<br><span style="color: red;">Robot and tablet doesn\'t belong to same customer!</span>';
    }
    var buttons = [ ];

    buttons.push( new PopButton( "Change robot name", function()
    {
      var new_name = prompt( "Input new name", robot.robot_name );
      if( new_name )
      {

        popup_screen_controller.pop_up_once( "Saving robot name", "set_robot_name_done" );

        function refresh()
        {
          message_controller.events.remove_callback( "set_robot_name_done", refresh );
          robot.robot_name = new_name;
          //manage_customers_screen.draw_customers( manage_customers_screen.customer_data );
          manage_customers_screen.update_all_buttons_with_robot( robot.robot_id, new_name );
        }
        message_controller.events.add_callback( "set_robot_name_done", refresh );

        communication_controller.send( 'set_robot_name', {
          robot: robot.robot_id,
          customer: robot.robot_customer,
          new_name: new_name
        }, "cloud", 10 );
      }
    } ) );


    buttons.push( new PopButton( "Change customer", function()
    {

      var what_to_move_buttons = [ ];
      if( robot.tablet_id )
      {
        what_to_move_buttons.push( new PopButton( "Only tablet", function()
        {
          developer_screen.open_change_customer( robot.tablet_id, -1, robot.tablet_customer );
        } ) );
      }

      if( robot.tablet_id && robot.robot_customer === robot.tablet_customer )
      {
        what_to_move_buttons.push( new PopButton( "Both", function()
        {
          developer_screen.open_change_customer( robot.tablet_id, robot.robot_id, robot.robot_customer );
        } ) );
      }

      what_to_move_buttons.push( new PopButton( "Only robot", function()
      {
        developer_screen.open_change_customer( -1, robot.robot_id, robot.robot_customer );
      } ) );


      pop_generator.create_popup( "What should change customer", "", what_to_move_buttons, function()
      {
        pop_generator.close( );
      } );

    } ) );

    pop_generator.create_popup( header_text, body_text, buttons, function()
    {
      pop_generator.close( );
    } );

  },
  customer_tablets: {},
  customer_robots: {},
  update_all_buttons_with_robot: function( robot_id, new_robot_name )
  {
    var customers = Object.keys( manage_customers_screen.customer_tablets );
    customers.forEach( function( customer )
    {
      manage_customers_screen.customer_tablets[customer].tablets.forEach( function( tablet )
      {
        if( tablet.robot_id === robot_id )
          tablet.robot_name = new_robot_name;
        $( "#manage_tablet" + tablet.tablet_id ).html( manage_customers_screen.get_tablet_button_text( tablet ) );
      } );
    } );

    var robot_customers = Object.keys( manage_customers_screen.customer_robots );
    robot_customers.forEach( function( customer )
    {
      manage_customers_screen.customer_robots[customer].robots.forEach( function( robot )
      {
        if( robot.robot_id === robot_id )
          robot.robot_name = new_robot_name;
        $( "#manage_robot" + robot.tablet_id ).html( manage_customers_screen.get_robot_button_text( robot ) );
      } );
    } );

  },
  get_tablet_button_text: function( u )
  {
    var html = u.tablet_name;
    if( u.robot_id )
      html += ' connected to tinybox' + u.robot_id + ' called ' + u.robot_name;
    return html;
  },
  get_robot_button_text: function( u )
  {
    var html = u.robot_id + ", " + u.robot_name;
    if( u.tablet_id )
      html += ' connected to ' + u.tablet_id + ' called ' + u.tablet_name;
    return html;
  },
  show_tablets_for_customer: function( customer_id )
  {

    function got_tablets_from_internet( data )
    {
      manage_customers_screen.customer_tablets[customer_id] = data;
      message_controller.events.remove_callback( "got_tablets", got_tablets_from_internet );
      popup_screen_controller.close( "#info_waiting_popup" );

      got_tablets( data );
    }
    function got_tablets( data )
    {

      $( "#tablets_for_customer" + customer_id ).empty();
      data.tablets.forEach( function( u )
      {
        var color_class = "";
        if( u.robot_id && u.customer !== u.robot_customer )
          color_class = "purple";
        var html = '<button id="manage_tablet' + u.tablet_id + '" onclick="manage_customers_screen.manage_user(' + customer_id + ',' + u.tablet_id + ')" class="' + color_class + '">';
        html += manage_customers_screen.get_tablet_button_text( u );
        html += '</button><br>';
        $( "#tablets_for_customer" + customer_id ).append( html );
      } );

      var is_plus = $( "#button_for_customer_tablets" + customer_id ).html() === "+";
      if( is_plus )
        $( "#button_for_customer_tablets" + customer_id ).html( "-" );
      else
        $( "#button_for_customer_tablets" + customer_id ).html( "+" );
      $( "#tablets_for_customer" + customer_id ).toggleClass( "gone" );
    }

    if( !manage_customers_screen.customer_tablets[customer_id] )
    {
      popup_screen_controller.open_info_waiter( "Getting list of tablets", "", "" );
      message_controller.events.add_callback( "got_tablets", got_tablets_from_internet );
      communication_controller.send( "get_tablets", {
        "ids": [ customer_id ]
      }, "cloud", 10 );

    }
    else
    {
      got_tablets( manage_customers_screen.customer_tablets[customer_id] );
    }
  },
  show_robots_for_customer: function( customer_id )
  {

    function got_robots_from_internet( data )
    {
      manage_customers_screen.customer_robots[customer_id] = data;
      message_controller.events.remove_callback( "got_tablets", got_robots_from_internet );
      popup_screen_controller.close( "#info_waiting_popup" );

      got_robots( data );
    }
    function got_robots( data )
    {

      $( "#robots_for_customer" + customer_id ).empty();
      data.robots = data.robots.sort_objects( "robot_id" );
      data.robots.forEach( function( u )
      {
        var color_class = "";
        if( u.robot_id && u.tablet_customer !== u.robot_customer )
          color_class = "purple";
        var html = '<button id="manage_robot' + u.tablet_id + '" onclick="manage_customers_screen.manage_robot(' + customer_id + ',' + u.robot_id + ')" class="' + color_class + '">';
        html += manage_customers_screen.get_robot_button_text( u );
        html += '</button><br>';
        $( "#robots_for_customer" + customer_id ).append( html );
      } );

      var is_plus = $( "#button_for_customer_robotss" + customer_id ).html() === "+";
      if( is_plus )
        $( "#button_for_customer_robots" + customer_id ).html( "-" );
      else
        $( "#button_for_customer_robots" + customer_id ).html( "+" );
      $( "#robots_for_customer" + customer_id ).toggleClass( "gone" );
    }

    if( !manage_customers_screen.customer_robots[customer_id] )
    {
      popup_screen_controller.open_info_waiter( "Getting list of robots", "", "" );
      message_controller.events.add_callback( "got_robots", got_robots_from_internet );
      communication_controller.send( "get_robots", {
        "ids": [ customer_id ]
      }, "cloud", 10 );

    }
    else
    {
      got_robots( manage_customers_screen.customer_robots[customer_id] );
    }
  },
  draw_customers: function( data )
  {
    manage_customers_screen.customer_data = data;

    $( "#manage_customers_menu #customers_list" ).empty( );

    data.customers = data.customers.sort_objects( "name", false, true );

    function AddTabletsRow( c_id, indents )
    {
      var html = "";
      html += '<button class="" id="button_for_customer_tablets' + c_id + '"  style="min-width: 41px;" onclick="manage_customers_screen.show_tablets_for_customer(' + c_id + ')">+</button>';
      html += '<button id="show_tablets_for' + c_id + '" class="show_tablets_button red" style="margin-right: 0;margin-left: ' + (40 * indents) + 'px">Tablets</button><br>';

      html += '<div id="tablets_for_customer' + c_id + '" class="gone" style="margin-left: ' + (40 * (indents + 2)) + 'px">';
      html += "No tablets";
      html += "</div>";

      return html;
    }
    function AddRobotsRow( c_id, indents )
    {
      var html = "";
      html += '<button class="" id="button_for_customer_robots' + c_id + '"  style="min-width: 41px;" onclick="manage_customers_screen.show_robots_for_customer(' + c_id + ')">+</button>';
      html += '<button id="show_robots_for' + c_id + '" class="show_robots_button red" style="margin-right: 0;margin-left: ' + (40 * indents) + 'px">Robots</button><br>';

      html += '<div id="robots_for_customer' + c_id + '" class="gone" style="margin-left: ' + (40 * (indents + 2)) + 'px">';
      html += "No robots";
      html += "</div>";

      return html;
    }

    function addCustomersWithDealer( dealer, indents )
    {
      var html = "";
      var customers = data.customers.filter( ( c ) => {
        return c.dealer === dealer;
      } );
      customers.forEach( ( c ) => {
        var customer_html = "";
        var leftmargin = 40 * indents;
        customer_html += '<button class="dark" style="margin-right: 0;margin-left: ' + leftmargin + 'px" >' + c.name + '</button>';
        if( login_screen_controller.user_level === user_level.DEVELOPER )
        {
          // add move button, to move customer to another customer (change dealer)
          customer_html += '<button id="move_customer_button' + c.id + '" class="move_customer_button" onclick="manage_customers_screen.move_customer(' + c.id + ',' + c.dealer + ');" >Move</button>';
          customer_html += '<button id="change_customer_templates_button' + c.id + '" onclick="manage_customers_screen.change_customer_templates(' + c.id + ');" >Templates</button>';
        }
        customer_html += '<br>';

        var customers_html = addCustomersWithDealer( c.id, indents + 1 );
        if( true || customers_html )
        {
          customer_html += '<div id="customers_for_dealer' + c.id + '" class="gone">';

          customer_html += AddTabletsRow( c.id, indents + 1 );
          customer_html += AddRobotsRow( c.id, indents + 1 );

          customer_html += customers_html;

          customer_html += "</div>";

          html += '<button class="plus_button_for_dealer" id="plus_button_for_dealer' + c.id + '"  style="min-width: 41px;" onclick="$(\'#customers_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#plus_button_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#minus_button_for_dealer' + c.id + '\').toggleClass(\'gone\')">+</button>';
          html += '<button class="gone" id="minus_button_for_dealer' + c.id + '" style="min-width: 41px;" onclick="$(\'#customers_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#plus_button_for_dealer' + c.id + '\').toggleClass(\'gone\');$(\'#minus_button_for_dealer' + c.id + '\').toggleClass(\'gone\')">-</button>';
          html += customer_html;

        }
        else
        {
          html += '<button style="min-width: 0;color: transparent;background-color: transparent;">+</button>';
          html += customer_html;
        }

      } );
      return html;
    }

    var html = '<div style="text-align: left;">';
    html += addCustomersWithDealer( 1, 0 );
    html += AddTabletsRow( 1, 0 );
    html += AddRobotsRow( 1, 0 );
    html += "</div>";

    $( "#manage_customers_menu #customers_list" ).append( html );

  },
  customer_to_move: 0,
  customer_old_dealer: 0,
  move_customer: function( customer, old_dealer )
  {
    if( !manage_customers_screen.customer_to_move )
    {
      $( ".move_customer_button" ).html( "Here" );
      $( "#move_customer_button" + customer + ".move_customer_button" ).html( "Cancel" );
      $( "#move_customer_button" + old_dealer + ".move_customer_button" ).addClass( "gone" );
      manage_customers_screen.customer_to_move = customer;
      manage_customers_screen.customer_old_dealer = old_dealer;
    }
    else
    {
      $( ".move_customer_button" ).html( "Move" );
      $( ".move_customer_button" ).removeClass( "gone" );

      if( customer !== manage_customers_screen.customer_to_move )
      {
        console.log( "Moving customer " + customer + " to " + manage_customers_screen.customer_to_move );

        manage_customers_screen.customer_data.customers = manage_customers_screen.customer_data.customers.map( ( c ) => {
          if( c.id === manage_customers_screen.customer_to_move )
          {
            c.dealer = customer;
          }
          return c;
        } );

        var unfolded = [ ];
        $( ".plus_button_for_dealer.gone" ).each( function( )
        {
          unfolded.push( this.id.replace( "plus_button_for_dealer", "" ) );
        } );

        manage_customers_screen.draw_customers( manage_customers_screen.customer_data );

        console.log( unfolded );
        unfolded.forEach( function( an_id )
        {
          $( "#customers_for_dealer" + an_id ).toggleClass( "gone" );
          $( "#plus_button_for_dealer" + an_id ).toggleClass( "gone" );
          $( "#minus_button_for_dealer" + an_id ).toggleClass( "gone" );
        } );

        communication_controller.send( 'set_dealer', {
          customer: manage_customers_screen.customer_to_move,
          new_dealer: customer
        }, "cloud", 10 );

      }

      manage_customers_screen.customer_to_move = 0;
      manage_customers_screen.customer_old_dealer = 0;
    }

  },

  change_templates_for_user: false,
  customer_to_change_templates_for: 0,
  change_customer_templates: function( customer, is_tablet )
  {

    var cus_name;
    if( is_tablet )
    {
      for( var key in manage_customers_screen.customer_tablets )
      {
        manage_customers_screen.customer_tablets[key].tablets.forEach( function( t )
        {
          if( t.tablet_id === customer )
            cus_name = t.tablet_name;
        } );
      }
    }
    else
    {
      cus_name = manage_customers_screen.customer_data.customers.filter( function( c )
      {
        return c.id === customer;
      } )[0].name;
    }
    popup_screen_controller.open_info_waiter( "Getting templates for " + cus_name, "", "" );

    function got_dealer_templates( data )
    {
      manage_customers_screen.customer_to_change_templates_for = customer;
      manage_customers_screen.change_templates_for_user = !!is_tablet;
      manage_customers_screen.draw_template_selector_list( "#choose_dealer_templates_popup #templates", data.templates.add, data.templates.hide, !is_tablet );
      popup_screen_controller.close( "#info_waiting_popup" );
      popup_screen_controller.open( "choose_dealer_templates_popup" );

      message_controller.events.remove_callback( "user_templates", got_dealer_templates );
      message_controller.events.remove_callback( "dealer_templates", got_dealer_templates );
    }
    if( is_tablet )
    {
      message_controller.events.add_callback( "user_templates", got_dealer_templates );
      communication_controller.send( "get_user_templates", {
        user: customer
      }, "cloud", 10 );
    }
    else
    {
      message_controller.events.add_callback( "dealer_templates", got_dealer_templates );
      communication_controller.send( "get_dealer_templates", {
        customer: customer
      }, "cloud", 10 );
    }
  },

  draw_template_selector_list: function( div_id, templates_enabled, templates_hidden, limit_to_dealer_templates )
  {

    if( !templates_enabled )
      templates_enabled = "";
    if( !templates_hidden )
      templates_hidden = "";

    templates_enabled = templates_enabled.split( "," ).filter( ( t ) => {
      return !!t;
    } );

    var options_enable = {};
    templates_enabled = templates_enabled.map( function( template )
    {
      var s = template.split( "?" );
      options_enable[s[0]] = [ ];
      for( var i = 1; i < s.length; i++ )
      {
        options_enable[s[0]].push( s[i] );
      }
      return s[0];
    } );

    templates_hidden = templates_hidden.split( "," ).filter( ( t ) => {
      return !!t;
    } );

    var template_ids = pt.list;
    template_ids = template_ids.filter( function( template_id )
    {
      return pt.templates.indexOf( template_id ) >= 0;
    } );

    $( div_id ).empty();
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

          var templ_name = "enable_spec_template_" + template;
          var title = tmp.template_title;

          if( templates_enabled.indexOf( template ) === -1 )
          {
            html += '<div id="' + templ_name + '_holder"><table><tr><td><input type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" class="this_is_a_raw_template_id"/></td><td colspan="2"><p class="checkbox-label"><label for="' + templ_name + '">' + type_title + " " + title + " (" + template + ")" + '</label></p></td></tr>';
          }
          else
          {
            html += '<div id="' + templ_name + '_holder"><table><tr><td><input checked="checked" type="checkbox" name="' + templ_name + '" value="valuable" id="' + templ_name + '" class="this_is_a_raw_template_id"/></td><td colspan="2"><p class="checkbox-label"><label for="' + templ_name + '">' + type_title + " " + title + " (" + template + ")" + '</label></p></td></tr>';
          }

          pt_options_a.forEach( function( option )
          {
            var option_name = "option_spec_" + option + "_" + template;
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

      $( div_id ).append( html );
    } );


  },

  save_dealer_templates: function( div_id )
  {


    var templ_string = "";

    var templates = $( div_id + " input.this_is_a_raw_template_id" ).length;
    for( var i = 0; i < templates; i++ )
    {
      var template = $( div_id + " input.this_is_a_raw_template_id" )[i].id;
      var template_id = template.replace( "enable_spec_template_", "" );
      var checked = ($( div_id + ' #enable_spec_template_' + template_id + ':checkbox:checked' ).length) > 0;
      if( checked )
      {
        if( templ_string )
          templ_string += ",";
        templ_string += template_id;

        var options = $( div_id + " #enable_spec_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" ).length;
        for( var o = 0; o < options; o++ )
        {
          var opt = $( div_id + " #enable_spec_template_" + template_id + "_holder .this_is_a_template_option:checkbox:checked" )[o].id.replace( "option_spec_", "" );
          opt = opt.replace( "_" + template_id, "" );
          templ_string += "?" + opt;
        }
      }
    }
    console.log( templ_string );


    if( manage_customers_screen.change_templates_for_user )
    {
      popup_screen_controller.pop_up_once( "Saving user templates", "user_templates_saved" );
      communication_controller.send( 'set_user_templates',
      {
        user_id: manage_customers_screen.customer_to_change_templates_for,
        templates: templ_string
      }, "cloud", 10 );
    }
    else
    {
      popup_screen_controller.pop_up_once( "Saving customer templates", "dealer_templates_saved" );
      communication_controller.send( 'set_dealer_templates',
      {
        customer: manage_customers_screen.customer_to_change_templates_for,
        templates: templ_string
      }, "cloud", 10 );
    }

  },
  cancel_save_templates: function( div_id )
  {
    $( div_id ).empty();
  }

};



event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "manage_customers_menu" )
    manage_customers_screen.open();
} );

event_controller.add_callback( "close_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "manage_customers_menu" )
    $( "#manage_customers_menu #customers_list" ).empty( );
} );

