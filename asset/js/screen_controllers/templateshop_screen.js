/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools ' Templates
 * and open the template in the editor.
 */


/* global event_controller, templateshop_controller, settings_screeen_controller, settings_screen_controller, popup_screen_controller, pop_generator, translate, communication_controller, message_controller, login_screen_controller, templateshop_config, Intl, robot_controller */

const templateshop_screen = {
  browser: undefined,
  browser_interval: undefined,
  chosen_vat: false,
  changing_vat: false,
  _chosen_currency: undefined,
  get chosen_currency()
  {
    if( templateshop_controller.template_group_currencies.indexOf( templateshop_screen._chosen_currency ) < 0 )
      templateshop_screen._chosen_currency = templateshop_controller.template_group_currencies[0];

    return templateshop_screen._chosen_currency;
  },
  set chosen_currency( v )
  {
    if( v )
      templateshop_screen._chosen_currency = v;
  },
  open_overview: function()
  {
    templateshop_controller.init();

    templateshop_controller.get_featuregroups();

    templateshop_screen.update_overview_screen();
    templateshop_screen.add_checkout_session_callback();

    templateshop_screen.setup_browser_interval();
  },

  close_overview: function()
  {
    templateshop_screen.close();
  },

  close_details: function()
  {
    templateshop_screen.close();
  },

  close: function()
  {
    if( templateshop_screen.browser )
      templateshop_screen.browser.close();
    clearInterval( templateshop_screen.browser_interval );
  },

  setup_browser_interval: function()
  {
    templateshop_screen.browser_interval = setInterval( function()
    {
      if( templateshop_screen.browser && templateshop_screen.browser.closed )
      {
        console.log( "Browser closed manually" );
        templateshop_screen.closed_checkout_session();
      }
    }, 1000 );
  },

  select_currency: function()
  {
    const val = $( "#currency_selector" ).val();
    console.log( "Chosen currency", val );
    templateshop_screen.chosen_currency = val;
    templateshop_screen.update_overview_screen();
  },
  changed_vat: function()
  {
    templateshop_screen.changing_vat = false;
    templateshop_screen.update_vat_text();
    $( ".available_templates_vat_notice_change_p" ).removeClass( "gone" );
  },
  update_vat_text: function()
  {
    if( templateshop_screen.chosen_vat )
      $( ".available_templates_vat_notice_text" ).text( translate["All prices include VAT"] );
    else
      $( ".available_templates_vat_notice_text" ).text( translate["All prices exclude VAT"] );
  },
  toggle_vat: function()
  {
    if( !templateshop_screen.changing_vat )
    {
      console.log( "Toggle VAT" );
      templateshop_screen.chosen_vat = !templateshop_screen.chosen_vat;
      templateshop_screen.changing_vat = true;
      $( ".available_templates_vat_notice_change_p" ).addClass( "gone" );
      templateshop_controller.get_featuregroups();
    }
  },

  shown_groups: [ ],
  update_overview_screen: function()
  {
    if( !robot_controller.chosen_robot_id )
    {
      $( "#templateshop_choose_robot" ).removeClass( 'gone' );
      $( "#templateshop_choose_robot" ).addClass( 'first-child' );
      $( "#owned_templates" ).addClass( 'gone' );
      $( "#owned_templates" ).removeClass( 'first-child' );
      $( "#available_templates" ).addClass( 'gone' );
    }
    else
    {
      $( "#templateshop_choose_robot" ).addClass( 'gone' );
      $( "#templateshop_choose_robot" ).removeClass( 'first-child' );
      $( "#owned_templates" ).removeClass( 'gone' );
      $( "#owned_templates" ).addClass( 'first-child' );
      $( "#available_templates" ).removeClass( 'gone' );

      let rows;

      // Create owned rows
      templateshop_screen.shown_groups = [ ];
      rows = templateshop_controller.template_groups.filter( ( g ) => g.owned ).reduce( ( r, g ) => r + templateshop_screen.generate_overview_row( g ), "" );
      $( "#owned_templates table" ).html( rows );

      // Create not owned rows
      templateshop_screen.shown_groups = [ ];
      rows = templateshop_controller.template_groups.filter( ( g ) => !g.owned ).reduce( ( r, g ) => r + templateshop_screen.generate_overview_row( g ), "" );
      if( templateshop_controller.template_groups.filter(g=>!g.owned&&g.templategroup).length === 0 )
        templateshop_screen.hide_available_templates();
      else if( communication_controller.appServerConnection.connected )
        templateshop_screen.show_available_templates();
      else
        templateshop_screen.disable_available_templates();
      $( "#available_templates table" ).html( rows );
      
      // Remove currencies that doesn't have any groups that costs money
      let active_currencies = templateshop_controller.template_group_currencies.filter( c => {
        return templateshop_controller.template_groups.filter( g => g.currency === c ).map( g => g.price ).reduce( ( n, a ) => n + a, 0 );
      } );
      
      // if all groups was removed, add one
      if( !active_currencies.length )
        active_currencies.push( templateshop_controller.template_group_currencies[0] );
      
      // If we have chosen a currency that is not one that is left on this list. then choose one that is.
      if( active_currencies.indexOf( templateshop_screen.chosen_currency ) === -1 )
        templateshop_screen.chosen_currency = active_currencies[0];
      
      if( active_currencies.length > 1 )
      {
        $( "#currency_selector" ).html( templateshop_controller.template_group_currencies.reduce( ( r, currency ) => r + `<option value="${currency}" ${currency === templateshop_screen.chosen_currency ? "selected" : ""}>${currency}</option>`, "" ) );
        $( "#currency_selector" ).removeClass( 'gone' );
      }
      else
      {
        $( "#currency_selector" ).addClass( 'gone' );
      }

      event_controller.call_callback( 'updated_templateshop_overview_screen' );
    }
  },
  hide_available_templates: function()
  {
    $( "#available_templates" ).addClass( 'gone' );
  },
  disable_available_templates: function()
  {
    $( "#available_templates_header" ).text( `${translate["Available templates"]} (${translate["Offline"]})` );
    $( ".templateshop_buy_now" ).prop( 'disabled', true );
    $( "#redeem_voucher_init_button" ).prop( 'disabled', true );
    $( "#voucher_submit_wrap" ).prop( 'disabled', true );
    $( ".available_templates_vat_notice_change_p" ).addClass( "gone" );
  },
  show_available_templates: function()
  {
    $( "#available_templates" ).removeClass( 'gone' );
    $( "#available_templates_header" ).text( translate["Available templates"] );
    $( ".templateshop_buy_now" ).prop( 'disabled', false );
    $( "#redeem_voucher_init_button" ).prop( 'disabled', false );
    $( "#voucher_submit_wrap" ).prop( 'disabled', false );
    $( ".available_templates_vat_notice_change_p" ).removeClass( "gone" );
  },
  generate_overview_row: function( group )
  {
    let html = '';
    if( !group.has_shown_templates() )
      return html;
    if( !group.owned )
    {
      if( group.price === undefined || group.currency === undefined )
        return html;
      else if( group.price > 0 && group.currency.toUpperCase() !== templateshop_screen.chosen_currency )
        return html;
    }
    if( templateshop_screen.shown_groups.indexOf( group.id ) > -1 )
      return html;
    else
      templateshop_screen.shown_groups.push( group.id );

    html += '<tr>';
    if( group.owned )
    {
      if (group.isFullyEnabled ) {
        html += `<td><input type="checkbox" onclick="templateshop_controller.toggle_template_group(${group.id})" id="enable_template_${group.id}" checked></td>`;
      }
      else if (group.isPartiallyEnabled) {
        html += `<td><input class="pseudo_checked" type="checkbox" onclick="templateshop_controller.toggle_template_group(${group.id})" id="enable_template_${group.id}"></td>`;
      }
      else {
        html += `<td><input type="checkbox" onclick="templateshop_controller.toggle_template_group(${group.id})" id="enable_template_${group.id}"></td>`;
      }
      html += `<td><label for="enable_template_${group.id}">${group.name}</p></td>`;
    }
    else
      html += `<td><label>${group.name}</label></td>`;
    html += '<td>';
    if( !group.owned )
    {
      html += `<p class="price">${templateshop_screen.generate_price( group )}</p>`;
      html += templateshop_screen.generate_buy_now_button( group.id, group.currency );
    }
    html += `<button class="dark" onclick="templateshop_screen.open_details(${group.id})">${translate['Details']}</button>`;
    html += '</td>';
    html += '</tr>';
    return html;
  },

  active_group_id: null,
  open_details: function( group_id, currency )
  {
    templateshop_screen.active_group_id = group_id;
    let group = this.update_details(group_id, currency);

    settings_screeen_controller.choose_menu( 'templateshop_screen_header', 'template_details_screen', false, group.name );

    templateshop_screen.setup_browser_interval();
  },
  update_details: function(group_id, currency)
  {
    const group = templateshop_controller.get_group_by_id( group_id, currency );

    if( group.description )
      $( "#template_details_description" ).removeClass( 'gone' );
    else
      $( "#template_details_description" ).addClass( 'gone' );
    $( "#template_details_description" ).text( translate[group.description] );

    const templates = group.shown_templates;
    let rows = templates.reduce( ( r, t ) => r + templateshop_screen.generate_details_row( group, t ), "" );

    if( !group.owned )
    {
      const buy_now = templateshop_screen.generate_buy_now_row( group );
      if(templates.length < 3)
      {
        rows = rows + buy_now;
      }
      else
      {
        rows = buy_now + rows + buy_now;
      }
      $( "#template_details_screen .available_templates_vat_notice" ).removeClass( "gone" );
    }
    else
    {
      $( "#template_details_screen .available_templates_vat_notice" ).addClass( "gone" );
    }

    $( "#template_details table" ).html( rows );
    if( group.owned )
      $( "#template_details_screen section.options" ).addClass( "checkboxes" );
    else
      $( "#template_details_screen section.options" ).removeClass( "checkboxes" );
    
    return group;
  },

  preload_images: function( template )
  {
    const image = new Image();
    image.src = template.image ? template.image : template.image.white;
  },

  generate_details_row: function( group, template )
  {
    const imageSRC = pt[template.id].template_image;
    let html;
    html += `<tr>`;
    if( group.owned ) {
      if (settings_screeen_controller.template_hidden(template.id)) {
        html += `<td><input type="checkbox" onclick="templateshop_controller.toggle_template('${template.id}')" id="toggle_template_${template.id}"></td>`;

      }
      else {
        html += `<td><input type="checkbox" onclick="templateshop_controller.toggle_template('${template.id}')" id="toggle_template_${template.id}" ${settings_screeen_controller.template_hidden( template.id ) ? "" : "checked"}></td>`;

      }
    }
    html += `<td>`;
    html += `<p><label for="toggle_template_${template.id}" style="display:inline;">${template.type} ${template.title}</label>`;
    
    let rotate = templateshop_screen.shouldRotate(template);
    
    if(template.description 
    && template.description !== "null"
    && template.description !== "") {
      html += `<i class="material-icons" onclick="templateshop_screen.templatePreview('${template.id}', '${template.description}', ${rotate})" style="display:inline;vertical-align: middle;padding-left:10px;">help_outline</i>`;
    }
    html += `<p></td>`;
    html += `<td>`;

    if (imageSRC) {
      html += `<div class="templateshop_list_image_wrapper" onclick="templateshop_screen.templatePreview('${template.id}', '${template.description}', ${rotate})">`
      html += `<img src="${imageSRC}" class="templateshop_list_image ${rotate ? "rotate" : ""}"/>`;
      html += '</div>'
    }

    html += `</td>`;
    html += `</tr>`;
    return html;
  },

  shouldRotate(template) {
    const templateProto = pt[template.id];
    const neverRotateType = ["baseball", "file", "geometry", "kickball", "logo", "rounders", "softball", "stoolball", "symbol"];
    const neverRotateTemplate = ["athletics_rounders", "event_social_distance", "sams_corner", "socialdistance_coverage"];
    const alwaysRotateTemplate = ["geometry_dashed", "geometry_line", "geometry_rectangle"];

    let rotate = true;

    if (neverRotateType.includes(templateProto.template_type.toLowerCase())) {
      rotate = false;
    }

    neverRotateTemplate.forEach((templateID)=>{
      if (templateProto.template_id.includes(templateID)) {
        rotate = false;
      }
    });

    if (alwaysRotateTemplate.includes(templateProto.template_id.toLowerCase())) {
      rotate = true;
    }

    return rotate;
  },

  templatePreview(templateID, templateDescription, rotate) {
    const template = pt[templateID];
    const description = templateDescription !== "null" ? templateDescription : "";
    const src = template.template_image;
    const header = `${template.template_type} - ${template.template_title}`;

    const buttons = [new PopButton(translate["OK"], pop_generator.close, "dark")];

    const options = {
      header: header,
      body: description,
      popup_id: "template_preview",
      outside_click_callback: pop_generator.close,
      extra_before_buttons_html: generateHTML(),
      buttons: buttons
    }
    pop_generator.create_popup_with_options(options);

    function generateHTML() {
      return `<img src="${src}" class="template_shop_preview_image ${rotate ? "rotate" : ""}" onclick="pop_generator.close()">`;
    }
  },

  open_redeem_voucher: function()
  {
    $( "#voucher_code" ).val( "" );
    $( "#templateshop_redeem_voucher_screen #voucher_code" ).attr( "maxlength", 4 * 3 + (3 - 1) );
    settings_screeen_controller.choose_menu( 'templateshop_screen_header', 'templateshop_redeem_voucher_screen', false, translate['Redeem voucher'] );
  },

  redeem_voucher_onchange: function()
  {
    const BL = 4;  // Block length
    const BN = 3;  // Block amount
    const key = event.keyCode;
    const code = $( "#templateshop_redeem_voucher_screen #voucher_code" ).val();
//    console.log( "Onchange redeem", code, key, code.length );
    let nc = code;
    if( key === 189 )
    {
//      console.log( "Length", nc.length );
      if( !(nc.length === (BL + 1) || nc.length === (BL + 1 + BL + 1)) )
        nc = nc.substr( 0, nc.length - 1 );
    }
    if( key !== 8 )
    {
      if( nc.length === BL || nc.length === (BL + 1 + BL) )
        nc += "-";
      else if( (nc.length === (BL + 1) || nc.length === (BL + 1 + BL + 1)) )
      {
        const a = nc.substr( 0, BL );
        const b = nc.substr( BL );
        if( b !== "-" )
          nc = a + "-" + b;
      }
    }
    if( key === 8 && nc[nc.length - 1] === "-" )
      nc = nc.substr( 0, nc.length - 1 );
    nc = nc.toUpperCase();

    let dd = nc.indexOf( "--" );
    while( dd > -1 )
    {
      nc = nc.substr( 0, dd ) + nc.substr( dd + 1 );
      dd = nc.indexOf( "--" );
    }

    if( nc.match( /^[0-9a-zA-Z-]+$/ ) === null )
      nc = nc.substr( 0, nc.length - 1 );

    $( "#templateshop_redeem_voucher_screen #voucher_code" ).val( nc ).focus();
  },

  redeem_voucher: function()
  {

    const code = $( "#templateshop_redeem_voucher_screen #voucher_code" ).val();
    const code_pieces = code.split( "-" );

    if( code.length !== 14 )
      console.warn( "Voucher invalid: Length != 14" );
    else if( code_pieces.length !== 3 )
      console.warn( "Voucher invalid: Pieces != 3" );
    else if( code_pieces[0].length !== 4 || code_pieces[1].length !== 4 || code_pieces[2].length !== 4 )
      console.warn( "Voucher invalid: Piece length != 4" );
    else
    {
      templateshop_screen.disable_voucher_button();
      communication_controller.send( 'webshop.redeemVoucher', {
        'code': `${code_pieces[0]}-${code_pieces[1]}-${code_pieces[2]}`
      }, 'cloud' );
    }
  },

  open_scanner: function()
  {
    cordova.plugins.barcodeScanner.scan( function( result )
    {
      $( "#voucher_code" ).val( result.text ).change();
    },
      function( error )
      {
        templateshop_screen.checkout_session_popup( translate['Something went wrong!'], translate["ErrorDiagGenericBody"] );
      },
    {
      preferFrontCamera: false, // iOS and Android
      showFlipCameraButton: false, // iOS and Android
      showTorchButton: true, // iOS and Android
      torchOn: false, // Android, launch with the torch switched on (if available)
      prompt: translate["Place the QR code inside the scan area"], // Android
      resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
//      orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
      disableSuccessBeep: false // iOS and Android
    }
    );
  },

  got_voucher_response: function( data )
  {
    templateshop_screen.enable_voucher_button();

    console.log( "Voucher", data );
    if( data["success"] === "false" )
    {
      console.warn( "Voucher", data["result"] );
      if( data["result"] === "Voucher invalid" )
        templateshop_screen.checkout_session_popup( translate['Something went wrong!'], translate["Voucher invalid"] );
      else
        templateshop_screen.checkout_session_popup( translate['Something went wrong!'], translate["ErrorDiagGenericBody"] );
    }
    else if( data["success"] === "true" )
    {
      console.log( "Voucher", data["result"] );
      templateshop_screen.checkout_session_popup( translate['Congratulations!'], translate["Voucher redeemed"] );
      settings_screeen_controller.choose_menu( 'templateshop_screen_header', 'templateshop_screen' );
    }
  },

  disable_voucher_button: function()
  {
    $( "#voucher_submit" ).html( '<div class="lds-ring lds-ring-button-scale"><div></div><div></div><div></div><div></div></div>' );
    $( "#voucher_submit" ).prop( 'disabled', true );
  },

  enable_voucher_button: function()
  {
    $( "#voucher_submit" ).html( 'Redeem voucher' );
    $( "#voucher_submit" ).prop( 'disabled', false );
  },

  generate_buy_now_button: function( group_id, currency )
  {
    const group = templateshop_controller.get_group_by_id( group_id, currency );

    let content = translate["Buy now"];
    if( group.order && group.order.show )
      content = translate["Order"];
    if( group.price === 0 )
      content = translate["Get"];

    return `<button class="chosen templateshop_buy_now ${templateshop_screen.buy_now_id( group_id )}" onclick="templateshop_controller.buy_group(${group_id},'${currency}')">${ content }</button>`;
  },

  buy_now_id: function( group_id )
  {
    return `buy_now_${group_id}`;
  },

  generate_buy_now_row: function( group )
  {
    return `<tr><td></td><td><p class="price">${templateshop_screen.generate_price( group )}</p>${templateshop_screen.generate_buy_now_button( group.id, group.currency )}</td></tr>`;
  },

  generate_price: function( group )
  {
    return group.price > 0 ? new Intl.NumberFormat( templateshop_controller.stripe_currency(), {
      style: 'currency',
      currency: group.currency
    } ).format( group.decimal_price ) : translate['Free'];
  },

  generate_card_input_popup: function( group )
  {
    templateshop_screen.generate_checkout_session( group );
  },

  closed_checkout_session: function()
  {
    console.log( "Closed Checkout Session" );
    templateshop_screen.update_overview_screen();
    templateshop_screen.browser = undefined;
  },

  got_checkout_session: function( data )
  {
    console.log( "webshop.testCheckoutSessionCreate", data );

    if( data.success === "false" )
    {
      console.error( "Could not generate checkout session", data.result );
      templateshop_screen.checkout_session_popup( translate['Something went wrong!'], translate["ErrorDiagGenericBody"] );
      templateshop_screen.closed_checkout_session();
      return;
    }

    const group_id = parseInt( data.group_id );
    const group = templateshop_controller.get_group_by_id( group_id );

    if( data.free_group === "true" || data.is_order === "true" )
    {
      templateshop_screen.checkout_session_popup( translate['Congratulations!'], translate['You now have access to %1s'].format( group.name ) );
      templateshop_screen.closed_checkout_session();
      setTimeout( templateshop_controller.get_featuregroups, 2000 );
    }
    else
    {

      const sessionId = data.session_id;

      const url = `templateshop.html?sessionId=${sessionId}`;
      const target = '_blank';
      const options = 'location=no,zoom=no,fullscreen=no,hidden=yes';  // 'beforeload=yes' does not work with Stripe
      templateshop_screen.browser = window.open( url, target, options );

      if( templateshop_screen.browser )
      {
        templateshop_screen.browser.addEventListener( 'loadstop', function( params )
        {
          if( params.url.startsWith( templateshop_config.checkoutSession.URL.gateway ) )
            templateshop_screen.browser.show();

        } );
        templateshop_screen.browser.addEventListener( 'loadstart', function( params )
        {
          if( params.url.startsWith( templateshop_config.checkoutSession.URL.success ) )
          {
            templateshop_screen.checkout_session_popup( translate['Congratulations!'], translate['You now have access to %1s'].format( group.name ) );
            templateshop_screen.browser.close();
          }
          else if( params.url.startsWith( templateshop_config.checkoutSession.URL.cancel ) )
          {
//            templateshop_screen.checkout_session_popup( `CANCEL!`, `You cancelled your purchase of ${group.name}` );
            templateshop_screen.browser.close();
          }
          else if( params.url.startsWith( templateshop_config.checkoutSession.URL.error ) )
          {
            templateshop_screen.checkout_session_popup( translate['Something went wrong!'], translate['An error occured with your purchase of %1s'].format( group.name ) );
            templateshop_screen.browser.close();
          }

        } );
        templateshop_screen.browser.addEventListener( 'loaderror', function( params )
        {
          console.error( params );
//        templateshop_screen.checkout_session_popup( `LOADERROR!`, ` An error occured with your purchase of ${group.name}` );
          templateshop_screen.browser.close();
        } );
        templateshop_screen.browser.addEventListener( 'exit', function( params )
        {
          console.log( params );
          templateshop_screen.closed_checkout_session();
        } );
      }
    }

  },

  checkout_session_popup: function( header, body )
  {
    popup_screen_controller.confirm_popup( header, body, translate["OK"], "", popup_screen_controller.close );
  },

  add_checkout_session_callback: function()
  {
    message_controller.events.remove_callback( "webshop.testCheckoutSessionCreate", templateshop_screen.got_checkout_session );
    message_controller.events.add_callback( "webshop.testCheckoutSessionCreate", templateshop_screen.got_checkout_session );
    message_controller.events.remove_callback( "webshop.buyFeature", templateshop_screen.got_checkout_session );
    message_controller.events.add_callback( "webshop.buyFeature", templateshop_screen.got_checkout_session );
  },

  begin_loading: function( group )
  {
    let w = $( `.${templateshop_screen.buy_now_id( group.id )}` ).width();
    $( `.${templateshop_screen.buy_now_id( group.id )}` ).html( '<div class="lds-ring lds-ring-button-scale"><div></div><div></div><div></div><div></div></div>' );
    $( ".templateshop_buy_now" ).prop( 'disabled', true );
    $( `.${templateshop_screen.buy_now_id( group.id )}` ).width( w );
  },

  generate_checkout_session: function( group )
  {
    templateshop_screen.begin_loading( group );

    const metadata = {
      'tmr_template_group_id': group.id
    };

    o = {
      "payment_method_types": [ 'card' ],
      "line_items": [ {
          'name': group.name,
//          'description': 'Comfortable cotton t-shirt',
//          'images': [ 'https://example.com/t-shirt.png' ],
          'amount': group.price,
          'currency': group.currency,
          'quantity': 1
        } ],
      "success_url": templateshop_config.checkoutSession.URL.success,
      "cancel_url": templateshop_config.checkoutSession.URL.cancel,
      "metadata": metadata,
      "payment_intent_data": {
        'metadata': metadata
      },
      "locale": templateshop_controller.stripe_language()
    };

    communication_controller.send( "webshop.testCheckoutSessionCreate", {
      "args": o
    }, "cloud", 10 );
  }
};

event_controller.add_callback( 'open_settings_menu', function( settings_screen_name )
{
  if( settings_screen_name === 'templateshop_screen' )
  {
    templateshop_screen.open_overview();
  }
} );

event_controller.add_callback( 'close_settings_menu', function( settings_screen_name )
{
  if( settings_screen_name === 'templateshop_screen' )
  {
    templateshop_screen.close_overview();
  }
  if( settings_screen_name === 'templateshop_details_screen' )
  {
    templateshop_screen.close_details();
  }
} );

event_controller.add_callback( 'updated_featuregroups', templateshop_screen.update_overview_screen );
event_controller.add_callback( 'updated_featuregroups', templateshop_screen.changed_vat );
event_controller.add_callback( 'app_server_connection_established', templateshop_screen.update_overview_screen );
message_controller.events.add_callback( "webshop.redeemVoucher", templateshop_screen.got_voucher_response );