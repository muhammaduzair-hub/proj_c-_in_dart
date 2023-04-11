const templateshop_controller = {
  template_groups: [ ],
  template_group_currencies: [ ],
  initialized: false,
  init: function()
  {
    if( templateshop_controller.initialized )
      return;

    templateshop_controller.sort_groups();

    templateshop_controller.initialized = true;
  },

  generate_test_groups: function()
  {
    const groups = [ ];
    groups.push( new ShopFeatureGroup(
      1,
      "templates_simple",
      "templates_simple",
    [
      "geometry_point",
      "geometry_line",
      "geometry_circle",
      "dk_tennis",
      "quidditch_dev",
      "us_quidditch_dev",
      "fistball_u21_dev",
      "fistball_u14_dev",
      "fistball_u12_dev",
      "fistball_u10_dev",
      "ultimate",
      "ch_ultimate"
    ],
      true,
      true,
      0,
      ''
      ) );
    groups.push( new ShopFeatureGroup(
      2,
      "templates_soccer",
      "templates_soccer",
    [
      "dbu_soccer_11_man",
      "dbu_soccer_8_man",
      "dbu_soccer_5_man",
      "dbu_soccer_3_man",
      "soccer_junior",
      "soccer_technical_field",
      "fa_soccer_9_man_pitch",
      "fa_soccer_7_man_pitch",
      "fa_soccer_5_man_pitch",
      "ch_soccer_11_man_pitch",
      "ch_soccer_9_man_pitch",
      "ch_soccer_7_man_pitch",
      "ch_soccer_5_man_pitch",
      "us_soccer_11_man_pitch",
      "us_soccer_9_man_pitch",
      "us_soccer_7_man_pitch",
      "us_soccer_4_man_pitch",
      "be_expoline_soccer",
      "custom_soccer"
    ],
      false,
      true,
      99999999,
      'DKK'
      ) );
    groups.push( new ShopFeatureGroup(
      4,
      "templates_lacrosse",
      "templates_lacrosse",
    [
      "us_lacross_men",
      "us_lacross_women",
      "us_lacross_unified_highschool"
    ],
      false,
      true,
      0,
      'DKK'
      ) );
    groups.push( new ShopFeatureGroup( 3, "templates_empty" ) );

    return groups;
  },

  get_featuregroups: function()
  {
    communication_controller.send( "get_user_featuregroups", {
      'include_vat': templateshop_screen.chosen_vat
    }, "cloud" );
  },

  got_featuregroups: function( data )
  {
    console.log( "got featuregroups", data );

    if( true || data.user === login_screen_controller.user_id )
    {
      if( data.featuregroups )
      {
        const groups = [ ];
        const currencies = [ ];
        data.featuregroups.forEach( group => {
          group.price.forEach( (price, idx) => {
            groups.push( new ShopFeatureGroup(
              group.id,
              group.name,
              group.description,
              group.features.split( ',' ).map(f=>f.toLowerCase()),
              group.owned === "true",
              group.templategroup === "true",
              parseFloat( price.price ),
              price.currency,
              templateshop_controller.get_group_by_id( group.id ) ? templateshop_controller.get_group_by_id( group.id ).enabled : undefined,
              {
                show:group.order_header && group.order_header[idx] !== "",
                header:group.order_header && group.order_header[idx],
                body:group.order_body && group.order_body[idx],
              },
              group.metadata )
            );
            currencies.push( price.currency );
          } );
        } );
        const tablet_templates_group = templateshop_controller.get_group_by_id( 0 );
        tablet_templates_group && groups.push( tablet_templates_group.copy() );

        groups.forEach(g=>{
          if(g.templategroup)
          {
            g.templates = g.templates.map(t=>templateshop_controller.get_local_template_tag(t)).filter(t=>!!t);
          }
        });

        templateshop_controller.template_groups = groups;
        templateshop_controller.template_group_currencies = currencies.filter( ( v, i, a ) => a.indexOf( v ) === i ).sort(); // Only unique currencies
        templateshop_controller.sort_groups();
        event_controller.call_callback( "updated_featuregroups" );
        templateshop_controller.get_templates();
      }
      else
        console.warn( "No featuregroups received" );
    }
    else
      console.warn( `Wrong user for featuregroups. Received user ${data.user} but this device is user ${login_screen_controller.user_id}` );
  },

  get_templates: function()
  {
    communication_controller.send( 'get_templates', {}, 'cloud' );
  },

  got_templates: function( data )
  {
    console.log( "got templates", data );
    if( !data.templates )
      data.templates = "";
    pt.templates = data.templates.split( "," );

    if( data.dealer_templates )
      pt.dealer_templates = data.dealer_templates;

    pt.templates = pt.templates.map( function( tag )
    {
      const options = tag.split( "?" );
      const name = options.shift().toLowerCase();
      return [templateshop_controller.get_local_template_tag(name), options];
    } ).filter(parts=>!!parts[0]).map( function( parts )
    {
      pt.template_options[parts[0]] = parts[1];
      return parts[0];
    } );
    localStorage.setItem( "user.templates", JSON.stringify( pt.templates ) );

    templateshop_controller.calculate_tablet_templates();
    templateshop_controller.create_tablet_templates_group();
  },

  get_local_template_tag: function(remote_template_tag)
  {
    if( OLD_TEMPLATES_THAT_HAS_BEEN_RENMAED[remote_template_tag] )
      remote_template_tag = OLD_TEMPLATES_THAT_HAS_BEEN_RENMAED[remote_template_tag];
    if( !pt[remote_template_tag] )
    {
      if( remote_template_tag.endsWith( "_dev" ) )
      {
        remote_template_tag = remote_template_tag.slice( 0, remote_template_tag.length - 4 );
        if( !pt[remote_template_tag] ) {
          return templateshop_controller.get_local_template_tag(remote_template_tag + "_beta");
        }
      }
      else if( remote_template_tag.endsWith( "_beta" ) )
      {
        remote_template_tag = remote_template_tag.slice( 0, remote_template_tag.length - 5 );
        if( !pt[remote_template_tag] ) {
          return templateshop_controller.get_local_template_tag(remote_template_tag);
        }
      }
      else
      {
        return;
      }
    }
    

    return remote_template_tag;
  },

  calculate_tablet_templates: function()
  {
    let all_owned_templates = [ ];
    templateshop_controller.template_groups.forEach( g => {
      if( g.id > 0 && g.owned )
        all_owned_templates = all_owned_templates.concat( g.templates );
    } );
    templateshop_controller.tablet_templates = pt.templates.filter( t => all_owned_templates.indexOf( t ) < 0 );
    return templateshop_controller.tablet_templates;
  },

  create_tablet_templates_group: function()
  {
    if( templateshop_controller.tablet_templates.length > 0 )
    {
      let existing = templateshop_controller.get_group_by_id( 0 );

      if( existing )
      {
        existing.templates = templateshop_controller.tablet_templates;
      }
      else
      {
        templateshop_controller.template_groups.push( new ShopFeatureGroup(
          0,
          translate["Tablet Templates"],
          translate["These templates are specifically given to this tablet"],
          templateshop_controller.tablet_templates,
          true,
          true ) );
      }
    }
    else
    {
      templateshop_controller.remove_group_by_id( 0 );
    }

    event_controller.call_callback( "updated_featuregroups" );
  },

  has_feature: function( feature_tag )
  {
    let found = false;
    templateshop_controller.template_groups.forEach( fg => {
      if( fg.owned )
      {
        fg.templates.forEach( f => {
          if( f === feature_tag )
            found = true;
        } );
      }
    } );
    return found;
  },

  hasAnyFeature(featureTagList) {
    let hasAny = false;
    featureTagList.forEach((tag)=>{
      console.log(tag);
      if (this.has_feature(tag)) {
        hasAny = true;
      }
    });
    return hasAny;
  },

  show_feature: function( feature_tag, selector )
  {
    if(!feature_tag)
      throw "Feature Tag required";
    if(!selector)
      throw "Selector required";

    if( templateshop_controller.has_feature( feature_tag ) )
      $( selector ).removeClass( "gone" );
    else
      $( selector ).addClass( "gone" );
  },

  sort_groups: function()
  {
    templateshop_controller.template_groups.sort_objects( [ "id", "currency" ] );
    if( !templateshop_controller.template_groups || templateshop_controller.template_groups.length === 0 )
      return;

    if( templateshop_controller.template_groups[0].id === 0 )
    {
      templateshop_controller.template_groups.push( templateshop_controller.template_groups.shift() );
    }
  },

  remove_group_by_id: function( group_id, currency )
  {
    const idx = templateshop_controller.get_group_index_by_id( group_id, currency );
    if( idx > -1 )
      templateshop_controller.template_groups.splice( idx, 1 );
  },

  get_group_index_by_id: function( group_id, currency )
  {
    return templateshop_controller.template_groups.indexOf( templateshop_controller.get_group_by_id( group_id, currency ) );
  },

  get_group_by_id: function( group_id, currency )
  {
    // NOTE: Group ids are not unique

    const count = templateshop_controller.template_groups.filter( g => g.id === group_id ).length;
    if( count === 1 )
    {
      return templateshop_controller.template_groups.find( g => g.id === group_id );
    }
    else if( count > 1 )
    {
      if( !currency )
      {
        const free = templateshop_controller.template_groups.find(g => g.id === group_id && g.price === 0);
        if( free )
          return free;
        currency = templateshop_screen.chosen_currency;
      }
      return templateshop_controller.template_groups.find( g => g.id === group_id && g.currency === currency );
    }
    else
    {
      return undefined;
    }
  },

  get_group_by_template: function(template_id, currency)
  {
    // Return free template group if available
    const free = templateshop_controller.template_groups.find(g=>g.templates.indexOf(template_id) >= 0 && g.price === 0);
    if( free )
      return free;

    // Otherwise return it in the right currency
    if( !currency )
    {
      currency = templateshop_screen.chosen_currency;
    }
    let result = templateshop_controller.template_groups.find(g=>g.templates.indexOf(template_id) >= 0 && g.currency === currency);
    if(!result)
    {
      result = templateshop_controller.template_groups.find(g=>g.templates.indexOf(template_id) >= 0);
    }
    // Check for free alternatives
    return result;
  },

  toggle_template: function( template_id, save_state=true)
  {
    const group = templateshop_controller.get_group_by_template(template_id);
    const wasFully = group.isFullyEnabled;
    const wasPartially = group.isPartiallyEnabled;

    settings_screeen_controller.toggle_templates( [ template_id ] );

    const isFully = group.isFullyEnabled;
    const isPartially = group.isPartiallyEnabled;

    if (wasFully && isPartially) {
      group.enabled = false;
    }
    else if (wasPartially && isFully) {
      group.enabled = true;
    }

    if(save_state) {
      templateshop_controller.store_templateshop();
    }
    templateshop_screen.update_details(group.id, templateshop_screen.chosen_currency);
  },
  hide_template_group: function( group, save_state=true)
  {
    if( group.enabled )
    {
      try
      {
        console.groupCollapsed( `Hiding template group ${group.name}` );
        settings_screeen_controller.hide_templates( group.shown_templates.map( ( t ) => t.id ) );
        console.groupEnd();
      }
      catch(e)
      {
        console.error(e);
      }
    }
    group.enabled = false;
    if( save_state )
      templateshop_controller.store_templateshop();
  },
  show_template_group: function( group, save_state = true)
  {
    if( !group.enabled )
    {
      try
      {
        console.groupCollapsed( `Showing template group ${group.name}` );
        settings_screeen_controller.show_templates( group.shown_templates.map( ( t ) => t.id ) );
        console.groupEnd();
      }
      catch(e)
      {
        console.error(e);
      }
    }
    group.enabled = true;
    if( save_state )
      templateshop_controller.store_templateshop();
  },
  toggle_template_group: function( group_id, save_state = true)
  {
    const group = templateshop_controller.get_group_by_id( group_id );
    if( group.enabled )
      templateshop_controller.hide_template_group( group, save_state );
    else
      templateshop_controller.show_template_group( group, save_state );
    templateshop_screen.update_overview_screen();
  },
  stripe_language: function()
  {
    return translate["ISO639-1"] ? translate["ISO639-1"] : "en";
  },
  stripe_currency: function()
  {
    return translate["LCID"] ? translate["LCID"] : "en-GB";
  },

  buy_group: function( group_id, currency )
  {
    if( communication_controller.appServerConnection.connected )
    {
      if( !currency )
        currency = templateshop_screen.chosen_currency;

      const group = templateshop_controller.get_group_by_id( group_id, currency );

      const send_request = function()
      {
        templateshop_screen.begin_loading( group );

        const data = {
          group_id: group.id,
          group_name: group.name,
          currency: group.currency,
          success_url: templateshop_config.checkoutSession.URL.success,
          cancel_url: templateshop_config.checkoutSession.URL.cancel,
          locale: templateshop_controller.stripe_language(),
          vat: translate["VAT"]
        };
  
        communication_controller.send( "webshop.buyFeature", data, "cloud", 10 );
      };

      if( group.order && group.order.show )
        popup_screen_controller.confirm_popup(
          group.order.header.format(
            group.name
          ),
          group.order.body.format(
            `<b><i>${translate["Confirm"]}</i></b>`,
            `<b><i>${group.name}</i></b>`,
            `<u>${templateshop_screen.generate_price( group )}</u>`,
            templateshop_screen.chosen_vat ? translate["Including VAT"] : translate["Excluding VAT"],
            `<b><i>${translate["Cancel"]}</i></b>`
          ),
          translate["Confirm"],
          translate["Cancel"],
          function()
          {
            popup_screen_controller.close();
            send_request();
          },
          popup_screen_controller.close
        );
      else
        send_request();

    }
    else
    {
      popup_screen_controller.confirm_popup( translate["Offline"], translate["You cannot purchase anything while offline"], translate["OK"], "", popup_screen_controller.close );
    }
  },

  store_templateshop: function()
  {
    localStorage.setItem( 'templateshop.featuregroups', JSON.stringify( templateshop_controller.template_groups ) );
    localStorage.setItem( 'templateshop.featuregroup_currencies', JSON.stringify( templateshop_controller.template_group_currencies ) );
    localStorage.setItem( 'templateshop.hidden_templates', JSON.stringify( settings_screeen_controller.hide ) );
    localStorage.setItem( 'templateshop.chosen_currency', JSON.stringify( templateshop_screen._chosen_currency ? templateshop_screen._chosen_currency : "" ) );
    localStorage.setItem( 'templateshop.chosen_vat', JSON.stringify( !!templateshop_screen.chosen_vat ) );
    console.log( "Stored templateshop" );
  },
  load_templateshop: function()
  {
    const tmpl = localStorage.getItem( "user.templates" );
    if( tmpl )
      pt.templates = JSON.parse( tmpl );

    const stored_hidden = JSON.parse( localStorage.getItem( 'templateshop.hidden_templates' ) );
    if( stored_hidden )
      settings_screeen_controller.hide_templates( stored_hidden );

    const stored_groups = JSON.parse( localStorage.getItem( 'templateshop.featuregroups' ) );
    const stored_currencies = JSON.parse( localStorage.getItem( 'templateshop.featuregroup_currencies' ) );

    const already_loaded = templateshop_controller.template_groups.length > 0;

    if( stored_groups )
    {
      if( !already_loaded )
      {
        const groups = [ ];
        stored_groups.forEach( g => {
          groups.push( new ShopFeatureGroup(
            g.id,
            g._name,
            g.description,
            g.templates,
            g._owned,
            g._templategroup,
            g.price,
            g._currency,
            g.enabled ) );
        } );

        templateshop_controller.template_groups = groups;
        templateshop_controller.sort_groups();
        templateshop_controller.template_group_currencies = stored_currencies.sort();

        let chosen_currency = localStorage.getItem( 'templateshop.chosen_currency' );
        templateshop_screen.chosen_currency = chosen_currency === "undefined" ? "" : JSON.parse( chosen_currency );
      }
      else
      {
        stored_groups.forEach( g => {
          group = templateshop_controller.get_group_by_id( g.id );
          if( !group.enabled )
            templateshop_controller.hide_template_group( group, false );
        } );
      }
      event_controller.call_callback( "updated_featuregroups" );
    }

    templateshop_screen.chosen_vat = JSON.parse( localStorage.getItem( 'templateshop.chosen_vat' ) );
    templateshop_screen.update_vat_text();

    console.log( "Loaded stored templateshop" );

  }

};

message_controller.events.add_callback( "user_featuregroups", templateshop_controller.got_featuregroups );
event_controller.add_callback( 'updated_templateshop_overview_screen', templateshop_controller.store_templateshop );