/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global robot_controller, translation, bottom_bar_chooser, event_controller, blue, pop_generator, translate, AppType, message_controller, robot_behaviour_settings_screen */

var popup_screen_controller = {
  open_id: '',
  dont_close_when_click_outside: false,
  error_is_open: false,
  removepopup: function() // placeholder
  {}, 
  is_popup_open: function(check_popup, include_error = true) 
  {
    let current_popup = popup_screen_controller.open_id;
    let error_exists = popup_screen_controller.error_is_open;

    //Ternary check, both variables are set to false if they are empty strings else they are true
    current_popup = current_popup === "" ? false : current_popup; 
    check_popup = check_popup === "" ? false : check_popup; 

    //Ternary check, if include_error is false, set error_exists to false, else it is set to popup_screen_controller.error_is_open
    error_exists = include_error === false ? false : error_exists; 

    if(check_popup === current_popup && current_popup !== false && !error_exists) //popup exists
    {
      return true;
    }
    else if(check_popup === false && current_popup && !error_exists) //popup exists
    {
      return true;
    }
    else if(error_exists) //error popup exists
    {
      return true;
    }
    else
    {
      return false;
    }
  },
  /**
   * 
   * @param {Object} options 
   * @param {String} options.header
   * @param {String} options.body
   * @param {String} options.ok_text
   * @param {String} options.cancel_text
   * @param {Function} options.ok_callback,
   * @param {Function} options.cancel_callback,
   * @param {String} options.ok_class - CSS button class
   * @param {String} options.cancel_class - CSS button class
   * @param {Boolean} options.show_x
   * @param {Boolean} options.spinner
   * @param {String} options.popup_name - Name of popup (Default: "confirm_popup")
   */
  confirm_popup_with_options(options = {})
  {
    popup_screen_controller.confirm_popup(
      options.header,
      options.body,
      options.ok_text,
      options.cancel_text,
      options.ok_callback,
      options.cancel_callback,
      options.ok_class,
      options.cancel_class,
      options.show_x,
      options.spinner,
      options.popup_name,
      options.image
    )
  },
  confirm_popup: function( header, body, ok_text, cancel_text, ok_callback, cancel_callback, ok_class, cancel_class, show_x, spinner, popup_name = "confirm_popup", image )
  {

    popup_screen_controller.confirm_popup_ok_callback = ok_callback;
    popup_screen_controller.confirm_popup_cancel_callback = cancel_callback;

    var buttons = [ ];
    if( ok_text )
      buttons.push( new PopButton( ok_text, popup_screen_controller.confirm_popup_ok_callback, ok_class ? ok_class : "dark" ) );
    if( cancel_text )
      buttons.push( new PopButton( cancel_text, popup_screen_controller.confirm_popup_cancel_callback, cancel_class ? cancel_class : "dark" ) );

    let htmlImageBefore, htmlImageAfter;
    if(image && image.src)
    {
      const width = image.width?`width:${image.width};`:'';
      const height = image.width?`height:${image.width};`:'';
      const htmlImage = `<img src="${image.src}" style="${width}${height}" />`;
      if(image.after)
      {
        htmlImageAfter = htmlImage;
      }
      else
      {
        htmlImageBefore = htmlImage;
      }
    }

    pop_generator.create_popup( header, body, buttons, false, popup_name, htmlImageBefore, htmlImageAfter, show_x, spinner);
  },

  confirmPopupWithList(header, body, ok_text, cancel_text, ok_callback, cancel_callback, ok_class, cancel_class, show_x, spinner, popup_name = "confirm_popup", list=null) {
      popup_screen_controller.confirm_popup_ok_callback = ok_callback;
      popup_screen_controller.confirm_popup_cancel_callback = cancel_callback;

      var buttons = [ ];
      if( ok_text )
        buttons.push( new PopButton( ok_text, popup_screen_controller.confirm_popup_ok_callback, ok_class ? ok_class : "dark" ) );
      if( cancel_text )
        buttons.push( new PopButton( cancel_text, popup_screen_controller.confirm_popup_cancel_callback, cancel_class ? cancel_class : "dark" ) );

      let listHTML = '';
      if(list) {
        listHTML += '<div class="list_in_popup scrollbar_y">';
        list.forEach((entry)=>{
          listHTML += '<p>'+entry+'</p>';
        });
        listHTML += '</div>';
      }

      pop_generator.create_popup( header, body, buttons, false, popup_name, listHTML, null, show_x, spinner );
  },


  confirm_popup_ok_callback: function()
  {},
  confirm_popup_cancel_callback: function()
  {},

  open: function( popup_id, dont_close_when_click_outside )
  {
    if( popup_screen_controller.open_id === popup_id )
      return;
//    console.error("OPEN", popup_id);
    dont_close_when_click_outside = !!dont_close_when_click_outside;

    if( popup_screen_controller.error_is_open )
    {
      popup_screen_controller.open_id = popup_id;
      popup_screen_controller.dont_close_when_click_outside = dont_close_when_click_outside;
    }
    else
    {
      document.activeElement.blur();
      popup_screen_controller.dont_close_when_click_outside = dont_close_when_click_outside;

      if( popup_screen_controller.open_id )
        popup_screen_controller.close();
      if( popup_id[0] !== "#" )
        popup_id = "#" + popup_id;
      popup_screen_controller.open_id = popup_id;

      $( popup_id ).removeClass( "gone" );
      popup_screen_controller.show_holders();

      if( dont_close_when_click_outside )
        popup_screen_controller.removepopup = function()
        {};
      else
        popup_screen_controller.removepopup = popup_screen_controller.press_outside;

    }

  },
  press_outside: function()
  {
    if( !popup_screen_controller.dont_close_when_click_outside )
      popup_screen_controller.close();
  },
  close: function( only_if_this_id )
  {
    $( ".active-circle" ).removeClass( "overpopup" );
    if( typeof only_if_this_id !== "string" )
      only_if_this_id = "";

    if( !!only_if_this_id && only_if_this_id.indexOf("#") !== 0)
      only_if_this_id = "#" + only_if_this_id;

//    console.error("CLOSE", only_if_this_id, popup_screen_controller.open_id);
    console.log( "Popup closing", popup_screen_controller.open_id, only_if_this_id );
    if( !only_if_this_id && popup_screen_controller.open_id !== "#generated_popup" )
      printStack();
    if( only_if_this_id && only_if_this_id !== popup_screen_controller.open_id )
      return;
    if( popup_screen_controller.error_is_open )
      return;

    event_controller.call_callback( "close_popup", popup_screen_controller.open_id );
    pop_generator.close();
    $( popup_screen_controller.open_id ).addClass( "gone" );

    popup_screen_controller.open_id = '';
    if( !popup_screen_controller.error_is_open )
      popup_screen_controller.remove_holders();

  },
  show_holders: function()
  {
    $( "#popup-background" ).removeClass( "gone" );
    $( ".popup-holder" ).removeClass( "gone" );
  },
  remove_holders: function()
  {
    $( "#popup-background" ).addClass( "gone" );
    $( ".popup-holder" ).addClass( "gone" );
  },

  open_info_waiter: function( header_text, info_text1, info_text2, spinner = false)
  {
    if( !info_text1 )
      info_text1 = "";
    if( !info_text2 )
      info_text2 = "";
    if( !info_text1 && !info_text2 )
      $( "#info_waiting_popup" ).addClass( "padding_lr" );
    else
      $( "#info_waiting_popup" ).removeClass( "padding_lr" );

    if( header_text )
      $( "#info_waiting_popup #header" ).text( header_text ).removeClass( 'gone' );
    else
      $( "#info_waiting_popup #header" ).addClass( 'gone' );

    if( info_text1 )
      $( "#info_waiting_popup #info_label1" ).text( info_text1 ).removeClass( 'gone' );
    else
      $( "#info_waiting_popup #info_label1" ).addClass( 'gone' );

    if( info_text2 )
      $( "#info_waiting_popup #info_label2" ).text( info_text2 ).removeClass( 'gone' );
    else
      $( "#info_waiting_popup #info_label2" ).addClass( 'gone' );

    if( spinner )
      $( "#info_waiting_popup #spinner" ).removeClass( 'gone' );
    else
      $( "#info_waiting_popup #spinner" ).addClass( 'gone' );

    popup_screen_controller.open( "#info_waiting_popup", true );
  },
  close_info_waiter: function()
  {
    console.log( "close info waiter" );
    popup_screen_controller.close( "#info_waiting_popup" );
  },
  open_error: function()
  {
    if( AppType === APP_TYPE.TinyRemote )
      return;
    popup_screen_controller.removepopup = function()
    {};
    $( popup_screen_controller.open_id ).addClass( "gone" );
    $( "#robot_message_popup" ).removeClass( "gone" );
    popup_screen_controller.error_is_open = true;
    popup_screen_controller.show_holders();

    document.activeElement.blur();
    console.log( robot_controller.system_message );
    var lines = robot_controller.system_message.split( "\n" );
    $( "#robot_message_popup #header" ).html( lines[0] ? translate[lines[0]] : "" );
    $( "#robot_message_popup #info_label1" ).html( lines[1] ? translate[lines[1]] : "" );
    $( "#robot_message_popup #info_label2" ).html( lines[2] ? translate[lines[2]] : "" );

    if( login_screen_controller.user_level === user_level.DEVELOPER )
    {
      $( "#topbar .center_on_robot_button" ).addClass( "gone" );
      $( ".robot_warning_button" ).removeClass( "gone" );
      $( "#robot_message_popup #hide_hard_error_button" ).removeClass( "gone" );
    }
    else
    {
      $( "#topbar .center_on_robot_button" ).removeClass( "gone" );
      $( ".robot_warning_button" ).addClass( "gone" );
      $( "#robot_message_popup #hide_hard_error_button" ).addClass( "gone" );
    }

  },
  close_error: function()
  {
    popup_screen_controller.try_attemps = 0;
    $( "#robot_message_popup #open_cleaning_from_error" ).addClass( "gone" );

    popup_screen_controller.error_is_open = false;
    $( "#robot_message_popup" ).addClass( "gone" );
    popup_screen_controller.remove_holders();

    if( login_screen_controller.user_level === user_level.DEVELOPER )
    {
      $( "#topbar .center_on_robot_button" ).removeClass( "gone" );
      $( ".robot_warning_button" ).addClass( "gone" );
    }

    if( popup_screen_controller.open_id )
    {
      let open_this = popup_screen_controller.open_id;
      popup_screen_controller.open_id = "";
      popup_screen_controller.open( open_this, popup_screen_controller.dont_close_when_click_outside );
    }

    if( !robot_behaviour_settings_screen.user_params.error_auto_resume )
    {
      if( bottom_bar_chooser.active_bar === "#drive-to-automode-screen" ||
        bottom_bar_chooser.active_bar === "#paint-pitch-bar" )
      {
        robot_controller.auto_mode();
      }
    }
  },
  try_attemps: 0,
  try_remove_error: function()
  {
    $( "#robot_message_popup #spinner" ).removeClass( "gone" );
    $( "#robot_message_popup #ok_button" ).addClass( "gone" );

    popup_screen_controller.try_attemps++;
    setTimeout( function()
    {
      if( SETTINGS.error_open_cleaning && popup_screen_controller.try_attemps >= 1 )
        $( "#robot_message_popup #open_cleaning_from_error" ).removeClass( "gone" );
      $( "#robot_message_popup #spinner" ).addClass( "gone" );
      $( "#robot_message_popup #ok_button" ).removeClass( "gone" );
    }, 5000 );

    robot_controller.ack();
  },
  hide_error: function()
  {
    popup_screen_controller.error_is_open = false;
    $( "#robot_message_popup" ).addClass( "gone" );

    let other_popup_open = false;
    $(".popup-holder > div > .popup-content").each((idx, elem) => { if (elem.className.indexOf('gone') === -1) other_popup_open = true; })
    
    if(!other_popup_open)
      popup_screen_controller.remove_holders();
  },

  last_robot_battery: 100,
  last_tablet_battery: 100,
  robot_battery_update: function()
  {
    if( robot_controller.battery_level >= 0 )
    {
      if( popup_screen_controller.last_robot_battery > 10 && robot_controller.battery_level <= 10 )
      {
        // open low battery popup
        $( "#low_battery_popup #header" ).html( translate["Robot battery low"] );
        popup_screen_controller.open( "#low_battery_popup" );
        popup_screen_controller.play_whistle();
      }
      if( popup_screen_controller.last_robot_battery > 2 && robot_controller.battery_level <= 2 )
      {
        // open low battery popup
        $( "#low_battery_popup #header" ).html( translate["Robot battery critical"] );
        popup_screen_controller.open( "#low_battery_popup" );
        popup_screen_controller.play_whistle();
      }
      popup_screen_controller.last_robot_battery = robot_controller.battery_level;
    }

    if( popup_screen_controller.open_id === "#low_battery_popup" && robot_controller.battery_level > 10 )
    {
      popup_screen_controller.close();
    }
  },
  tablet_battery_update: function( status )
  {
    if( popup_screen_controller.last_tablet_battery > 10 && status.level <= 10 )
    {
      // open low battery popup
      $( "#low_battery_popup #header" ).html( translate["Tablet battery low"] );
      popup_screen_controller.open( "#low_battery_popup" );
      popup_screen_controller.play_whistle();
    }
    popup_screen_controller.last_tablet_battery = status.level;

    if( popup_screen_controller.open_id === "#low_battery_popup" && status.level > 10 )
    {
      popup_screen_controller.close();
    }
  },
  play_whistle: function()
  {
    audioController.list.whistleWarning.play();
  },

  pop_up_once: function( header, callback, min_wait )
  {
    if( !header )
      header = translate["Saving data"];
    if( !min_wait )
      min_wait = 1000;

    var start = (new Date()).getTime();
    popup_screen_controller.open_info_waiter( header, "", "" );
    function done()
    {
      message_controller.events.remove_callback( callback, done );
      message_controller.events.remove_callback( "not_online", done );
      var end = (new Date()).getTime();
      setTimeout( popup_screen_controller.close, min_wait - (end - start) );
    }
    message_controller.events.add_callback( callback, done );
    message_controller.events.add_callback( "not_online", done );
  },

  remove_error_timeout: false,

  customer_selection_popup( data, callback, header, dealer_section_header, customer_section_header, always_show_dealer_section_header = false )
  {

    $( "#choose_customer_popup #customer_buttons" ).empty();
    $( "#choose_customer_popup #dealer_button" ).empty();

    if( always_show_dealer_section_header || (login_screen_controller.user_level === user_level.DEVELOPER && data.me !== parseInt( data.dealer.id ) ) )
    {
      if( dealer_section_header !== "" )
      {
        $( "#choose_customer_popup #dealer_button" ).append( `<p>${dealer_section_header !== undefined ? dealer_section_header : translate["Back to dealer"]}</p>` );
      }
      const elem = $.parseHTML( `<button class="dark" style="margin-right: 0" >${data.dealer.name}</button>` );
      $(elem).on('click', ()=>{callback(data.dealer.id, data.dealer.name)});
      $( "#choose_customer_popup #dealer_button" ).append( elem );
    }

    if( customer_section_header !== "" )
    {
      $( "#choose_customer_popup #customer_buttons" ).append( `<p>${customer_section_header !== undefined ? customer_section_header : translate["Customers"]}</p>` );
    }

    data.customers = data.customers.sort_objects( "name", false, true );
    function addCustomersWithDealer( dealer, indents, builderElement )
    {
      let did_something = false;

      data.customers.filter( ( c ) => {
        return c.dealer === dealer;
      } ).forEach( ( c ) => {
        did_something = true;
        var leftmargin = 40 * indents;

        const customer_button = $.parseHTML(`<button class="dark" style="margin-right: 0;margin-left: ${leftmargin}px" >${c.name}</button>`);
        $(customer_button).on('click', ()=>{callback(c.id, c.name)});

        // var customers_html = addCustomersWithDealer( c.id, indents + 1 );
        const customers_html = $.parseHTML(`<div id="customers_for_dealer${c.id}" class="gone"></div>`);
        if( addCustomersWithDealer( c.id, indents + 1, customers_html ) )
        {
          $(builderElement).append(`<button              id="plus_button_for_dealer${c.id}"  style="min-width: 41px;" onclick="$('#customers_for_dealer${c.id}').toggleClass('gone');$('#plus_button_for_dealer${c.id}').toggleClass('gone');$('#minus_button_for_dealer${c.id}').toggleClass('gone')">+</button>`);
          $(builderElement).append(`<button class="gone" id="minus_button_for_dealer${c.id}" style="min-width: 41px;" onclick="$('#customers_for_dealer${c.id}').toggleClass('gone');$('#plus_button_for_dealer${c.id}').toggleClass('gone');$('#minus_button_for_dealer${c.id}').toggleClass('gone')">-</button>`);
          $(builderElement).append(customer_button);
          $(builderElement).append(customers_html);

        }
        else
        {
          $(builderElement).append('<button style="min-width: 0;color: transparent;background-color: transparent;">+</button>');
          $(builderElement).append(customer_button);
        }
        $(builderElement).append('<br>');

      } );
      return did_something;
    }
    const customerList = $.parseHTML('<div style="text-align: left;"></div>');
    addCustomersWithDealer( data.dealer.id, 0, customerList );
    $( "#choose_customer_popup #customer_buttons" ).append( customerList );
    $( "#choose_customer_popup #header" ).text( header !== undefined ? translate[header] : translate["Give to"] );
    popup_screen_controller.open( "#choose_customer_popup" );
  }
};

event_controller.add_callback( 'on_system_diag_change', function()
{
  // console.log( robot_controller.state_top );
  /*
   uint16 INIT=1
   uint16 MANUAL=2
   uint16 AUTOMATIC=3
   uint16 AUTOMATIC_OFF=4
   uint16 ERROR_HARD=5
   uint16 ERROR_USER_WAIT=6
   uint16 ERROR_ACK=7
   uint16 ERROR_RESOLVED=8
   uint16 ERROR_SOFT=9
   uint16 BASE_MODE=10
   */

  clearTimeout( popup_screen_controller.remove_error_timeout );

  if( robot_controller.state_top === TopStates.ERROR_HARD || robot_controller.state_top === TopStates.ERROR_USER_WAIT || robot_controller.state_top === TopStates.ERROR_ACK || robot_controller.state_top === TopStates.ERROR_RESOLVED )
  {
    if( !popup_screen_controller.error_is_open )
      popup_screen_controller.play_whistle();
    popup_screen_controller.open_error();

  }
  else
  {
    popup_screen_controller.remove_error_timeout = setTimeout( function()
    {
      if( popup_screen_controller.error_is_open )
        popup_screen_controller.close_error();
    }, 2000 );
  }
} );

$( document ).ready( function()
{

  event_controller.add_callback( "battery_level_updated", popup_screen_controller.robot_battery_update );
  window.addEventListener( "batterystatus", popup_screen_controller.tablet_battery_update, false );

  event_controller.add_callback( "robot_now_offline", function()
  {
    if( !robot_controller.chosen_robot.online && blue.socketId < 0 )
    {
      robot_controller.state_top = TopStates.UNDEFINED;
      event_controller.call_callback( 'on_system_diag_change' );
    }

  } );

  event_controller.add_callback("marking_done", ()=>{
    if (!developer_screen.isReporting) {
      popup_screen_controller.open( "#paint_pitch_finished_popup" );
    }
  });
} );