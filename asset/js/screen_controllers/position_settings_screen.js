/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global projection_controller, event_controller, robot_controller, translate, settings_screeen_controller, map_controller, file_loader_screen, gps_controller, communication_controller, message_controller, popup_screen_controller, q$, q$val, q$class, custom_projection_controller, CustomProjection, q$html, DEBUG_MODE */

var position_settings_screen = {
  get is_open()
  {
    return settings_screeen_controller.chosen_menu === "position_settings_screen" && settings_screeen_controller.is_open;
  },
  set is_open( v )
  {},
  open: function()
  {
    if( !robot_controller.robot_has_capability( "gps_info" ) )
    {
      $( "#position_settings_screen .gps_info" ).addClass( "gone" );
      $( "#position_settings_screen #position_projection_section" ).addClass( "first-child" );
    }
    else
    {
      position_settings_screen.get_gps_info();
      position_settings_screen.get_gps_info_start();
    }

    $( "#position_settings_screen #projection_y_shift_header" ).html( translate["Northern shift"] );
    $( "#position_settings_screen #projection_x_shift_header" ).html( translate["Eastern shift"] );
    $( "#position_settings_screen #apply_projection_button" ).html( translate["Apply projection"] );

    position_settings_screen.update_allowed_projection_change();
    position_settings_screen.can_update_projection_input = true;
    position_settings_screen.recently_used.update_gui();
    position_settings_screen.update_input_field();
  },
  close: function()
  {
    position_settings_screen.get_gps_info_stop();
  },
  update_input_field: function()
  {
    var data = Object.keys( projection_controller.projections ).map( function( alias, i )
    {
      return {
        id: i,
        alias: alias,
        proj: projection_controller.projections[alias]
      };
    } );

    $( '.flexdatalist' ).flexdatalist( 'destroy' );
    $( '.flexdatalist' ).flexdatalist( {
      minLength: 1,
      selectionRequired: true,
      visibleProperties: [ "alias", "proj" ],
      searchIn: [ "alias", "proj" ],
      searchContain: true,
      searchByWord: true,
      maxShownResults: 10,
      noResultsText: 'Not found',
      cache: false,
      data: data
    } );
    $( '#position_projection-flexdatalist' ).attr( "type", "search" );
    $( '#position_projection-flexdatalist' ).on( "focus", function()
    {
      position_settings_screen.get_gps_info_stop();
      position_settings_screen.can_update_projection_input = false;
    } );
    $( '#position_projection-flexdatalist' ).on( "blur", function()
    {
      position_settings_screen.get_gps_info_start();
    } );
    $( '#position_projection-flexdatalist' ).attr( "placeholder", translate["Search projection"] );
  },
  changed_value: function( projection )
  {
    if(!robot_controller.chosen_robot.projection_change_allowed)
    {
      return;
    }

    position_settings_screen.can_update_projection_input = true;

    let new_value = '';
    if( projection )
      new_value = projection;
    else
      new_value = $( "#position_settings_screen #position_projection-flexdatalist" ).val();
    if( false )
      $( "#position_settings_screen #position_projection-flexdatalist" ).val( projection );
    else
      $( "#position_settings_screen #position_projection-flexdatalist" ).val( '' );

    position_settings_screen.change_projection( new_value );
  },
  change_projection: function( new_value )
  {
    if( robot_controller.chosen_robot.projection_change_allowed )
    {
      position_settings_screen.actual_change_projection(new_value);
    }
    else
    {
      const change = function()
      {
        if( robot_controller.chosen_robot.projection_change_allowed )
        {
          event_controller.remove_callback("on_system_diag_change", change);
          position_settings_screen.actual_change_projection(new_value);
        }
      }
      event_controller.add_callback("on_system_diag_change", change);
    }
  },
  actual_change_projection: function( new_value )
  {
    if( !new_value )
      return;

    if( projection_controller.isNone( new_value ) )
    {
      new_value = Object.keys( projection_controller.none ).filter( ( key ) => {
        return new_value === projection_controller.none[key].name;
      } )[0];
    }

    let proj;
    if( projection_controller.projections[new_value] || projection_controller.isNone( new_value ) )
    {
      console.log( "Setting new projection ", new_value );

      proj = projection_controller.get_proj_string( new_value );
      if( !projection_controller.isNone( new_value ) )
      {
        let p = new Proj4Projection( proj );
        p.setValue( "+tmr_alias", new_value );
        proj = p.string;
      }
    }
    else
    {
      let alias = new Proj4Projection(new_value).alias;
      if( projection_controller.projections[alias] )
      {
        proj = projection_controller.get_proj_string( alias );
        let p = new Proj4Projection( proj );
        p.setValue( "+tmr_alias", alias );
        proj = p.string;
      }
      else
      {
        try
        {
          let p = Projector( new_value );
          console.log( "new value is proj4 string", new_value, p );
          proj = p.pr.string + "";
          p.release();
        }
        catch(e) {
          throw `Projection "${new_value}" not valid! (Error: ${e})`;
        }
      }
    }

    if (!proj) {
      throw "Projection undefined!";
    }

    robot_controller.update_user_params( {
      projection: proj,
      projection_external: proj.indexOf( "+proj=affine" ) === 0 ? "+proj=affine" : "WGS84"
    } );

    if(!general_settings_screen.settings.automatic_choose_projection.val)
    {
      position_settings_screen.pop_up_once();
    }

    var robot = robot_controller.chosen_robot;
    robot.projection = proj;
    robot.proj_string = proj;

    map_controller.background.refresh_background();
    event_controller.call_callback( "got_user_position", gps_controller.last_position );

    event_controller.call_callback( "projection_chosen" );

    position_settings_screen.update_proj_related_gui( new_value );
    if( false )
      q$( "#position_settings_screen #position_projection-flexdatalist" ).val( new_value );
    else
      $( "#position_settings_screen #position_projection-flexdatalist" ).val( '' );
  },
  last_projection_info: [ 0, 0, 0 ],
  update_projection_inputs( robot )
  {
    if( position_settings_screen.projection_inputs_initialized_by_robot )
      return;

    if( !robot.projection )
      return;

    if( robot.proj_string === robot_controller.robots[robot.id].proj_string )
      return;

    if( DEBUG_MODE )
      console.warn( "This method is DEPRECATED" );

    var alias = robot.proj_alias;

    if( projection_controller.isNone( alias ) )
    {
      alias = projection_controller.none[alias].name;
    }

    if( position_settings_screen.can_update_projection_input && $( "#position_settings_screen #position_projection-flexdatalist" ).val() !== alias && custom_projection_controller.projection_exists( alias, true ) )
    {
      if( false )
        $( "#position_settings_screen #position_projection-flexdatalist" ).val( alias );
      else
        $( "#position_settings_screen #position_projection-flexdatalist" ).val( '' );
      position_settings_screen.update_proj_related_gui( alias );
    }
  },
  force_projection: function( new_value )
  {
    var robot = robot_controller.chosen_robot;
    var proj = projection_controller.projections[new_value];
    robot.projection = new_value;
    robot.proj_string = proj;

    event_controller.call_callback( "projection_chosen" );
  },
  can_update_projection_input: true,
  can_update_projection_input_timeout: null,
  update_proj_related_gui: function( alias )
  {
    position_settings_screen.toggle_proj_related_gui( alias );
    position_settings_screen.recently_used.update_projections( alias );
  },
  toggle_proj_related_gui: function( alias )
  {
    var v = projection_controller.isNone( alias );
    q$( "#general_settings_screen #show_background_map" ).prop( "disabled", v );
    q$( "#position_settings_screen #projection_shift_section input" ).prop( "disabled", v );

    if( q$( "#general_settings_screen #show_roads_on_map" ).hasClass( 'disabled' ) )
      q$( "#general_settings_screen #show_roads_on_map" ).prop( "disabled", true );
    else
      q$( "#general_settings_screen #show_roads_on_map" ).prop( "disabled", v );

    if( q$( "#general_settings_screen #custom_maps_button" ).hasClass( 'disabled' ) )
      q$( "#general_settings_screen #custom_maps_button" ).prop( "disabled", true );
    else
      q$( "#general_settings_screen #custom_maps_button" ).prop( "disabled", v );
  },
  recently_used: {
    projections: [ ],
    max_length: 5,
    save_name: "recently_used",
    save: function()
    {
      localStorage.setItem( position_settings_screen.recently_used.save_name, JSON.stringify( position_settings_screen.recently_used.projections ) );
    },
    remove_saved: function()
    {
      localStorage.removeItem( position_settings_screen.recently_used.save_name );
    },
    remove: function( name )
    {
      const index = position_settings_screen.recently_used.projections.findIndex( p => p.name === name );

      if( index < 0 )
        throw "Could not remove projection. Projection does not exist!";

      position_settings_screen.recently_used.projections.splice( index, 1 );
      position_settings_screen.recently_used.save();
      position_settings_screen.recently_used.update_gui();
    },
    remove_all: function()
    {
      position_settings_screen.recently_used.projections = [ ];
      position_settings_screen.recently_used.remove_saved();
      position_settings_screen.recently_used.update_gui();
    },
    load: function()
    {
      console.log( "Loading recently used projections" );
      const p = JSON.parse( localStorage.getItem( position_settings_screen.recently_used.save_name ) );
      if( p !== null )
      {
        const proj = p.map( e => {
          return CustomProjection.load( e );
        } );
        position_settings_screen.recently_used.projections = proj;
      }
      else
      {
        position_settings_screen.recently_used.remove_all();
      }
      position_settings_screen.recently_used.update_gui();
    },
    update_single: function( old_name, new_proj )
    {
      const index = position_settings_screen.recently_used.projections.findIndex( proj => {
        return proj.name === old_name;
      } );
      position_settings_screen.recently_used.projections[index] = new_proj;
    },
    update_projections: function( name )
    {
      const isNone = projection_controller.isNone( name );
      const exists = custom_projection_controller.projection_exists( name, true );
      if( exists || isNone )
      {
        let proj = custom_projection_controller.get_projection_from_list( name );

        if( position_settings_screen.recently_used.projections.findIndex( p => p.name === proj.name ) === -1 )
        {
          position_settings_screen.recently_used.projections.unshift( proj );
          if( position_settings_screen.recently_used.projections.length > position_settings_screen.recently_used.max_length )
            position_settings_screen.recently_used.projections.pop();
        }

        if( DEBUG_MODE )
          console.log( "Recently used", position_settings_screen.recently_used.projections );
        position_settings_screen.recently_used.save();
        position_settings_screen.recently_used.update_gui();
      }
      else
      {
        console.warn( "Could not add to recently used", name );
      }
    },
    update_gui: function()
    {

      let active_projection = robot_controller.chosen_robot.proj_alias;

      if( projection_controller.isNone( active_projection ) )
        active_projection = projection_controller.getNoneName( active_projection );

      let content = '';

      if( position_settings_screen.recently_used.projections.length !== 0 )
      {
        content += `<h2 id="projection_recent_header">${translate["Recently used"]}</h2>`;
        content = position_settings_screen.recently_used.projections.reduce( ( txt, projection, idx ) => txt + position_settings_screen.recently_used.generate_row( projection, active_projection, idx ), content );
      }

      q$html( "#projection_recently_used" ).html( content );
    },
    generate_row: function( projection, active_projection, idx )
    {
      let s = `<section class="row ${idx === 0 ? 'first-child' : ''}" onclick="position_settings_screen.changed_value('${projection.name}')">`;

      /*
       * Radio part
       */
      s += '<aside class="toggle">';
      s += '<div class="flex_fill"></div>';
      s += '<div class="flex_no_fill">';
      s += `<input type="radio" name="projection_recently_used" ${projection.name === active_projection || projection.proj4 === active_projection ? ' checked="checked"' : ''}>`;
      s += '</div>';
      s += '<div class="flex_fill"></div>';
      s += '</aside>';

      /*
       * Text content part
       */
      s += '<div>';
      s += '<header>';
      s += `<p>${projection.name}</p>`;
      s += '</header>';

      s += `<p class="title" style="font-size:14px;">${projection.description_shown_short}</p>`;

      s += '</div>';

      s += '</section>';

      return s;
    }
  },
  pop_up_once: function( header, min_wait )
  {
    if( !header )
      header = translate["Changing projection"];
    if( !min_wait )
      min_wait = 1000;

    var start = (new Date()).getTime();
    popup_screen_controller.open_info_waiter( header, "", "" );
    function done()
    {
      message_controller.events.remove_callback( "not_online", done );
      message_controller.events.remove_callback( "updated_user_config", done );
      var end = (new Date()).getTime();
      setTimeout( () => {
        popup_screen_controller.close( "info_waiting_popup" )
      }, min_wait - (end - start) );
    }

    message_controller.events.add_callback( "not_online", done );
    message_controller.events.add_callback( "updated_user_config", done );
  },
  gps_info: {},
  get_gps_info: function( )
  {
    communication_controller.send( 'get_gps_info', {
      robot: robot_controller.chosen_robot_id
    }, "any", 10 );

    if( !position_settings_screen.is_open )
      position_settings_screen.get_gps_info_stop();
  },
  update_interval: 0,
  get_gps_info_start: function()
  {
    if( position_settings_screen.is_open )
    {
      clearInterval( position_settings_screen.update_interval );
      position_settings_screen.update_interval = setInterval( position_settings_screen.get_gps_info, 2000 );
    }
  },
  get_gps_info_stop: function()
  {
    clearInterval( position_settings_screen.update_interval );
  },
  clear_gps_info_timeout: null,
  clear_gps_info: function()
  {
    position_settings_screen.clear_gps_info_timeout = setTimeout( function()
    {
      console.log( "CLEAR GPS INFO" );
      position_settings_screen.got_gps_info( undefined, false );
    }, 2000 );
  },
  gps_info_na_count: 0,
  got_gps_info: function( info, force = false)
  {
    force = force === true;

    if( DEBUG_MODE )
      console.log( "GOT_GPS_INFO", force );

    if( info || force )
      position_settings_screen.gps_info_na_count = 0;
    else
      position_settings_screen.gps_info_na_count += 1;

    if( position_settings_screen.gps_info_na_count === 1 )
      return;

    position_settings_screen.gps_info = info ? info : {};

    if( Object.keys( position_settings_screen.gps_info ).length === 0 )
    {
      $( "#position_settings_screen .gps_info" ).addClass( "gone" );

      if( robot_controller.chosen_robot.online )
      {
        $( "#position_settings_screen #position_summary" ).removeClass( "gone" );
        $( "#position_settings_screen #position_projection_section" ).removeClass( "first-child" );
        position_settings_screen.print_summary();
      }
      else
      {
        $( "#position_settings_screen #position_projection_section" ).addClass( "first-child" );
      }
      return;
    }
    else
    {
      $( "#position_settings_screen #position_projection_section" ).removeClass( "first-child" );
    }

    if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Parsing CSV"] && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: CSV"] ) )
    {
      position_settings_screen.print_csv();
      $( "#position_settings_screen .gps_info#position_csv" ).removeClass( "gone" );
    }
    else
    {
      $( "#position_settings_screen .gps_info#position_csv" ).addClass( "gone" );
    }

    if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Parsing GDM"] && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: GDM"] ) )
    {
      position_settings_screen.print_gdm();
      $( "#position_settings_screen .gps_info#position_gdm" ).removeClass( "gone" );
    }
    else
    {
      $( "#position_settings_screen .gps_info#position_gdm" ).addClass( "gone" );
    }

    if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Parsing NMEA"] && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: NMEA"] ) &&
      (position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] ) || position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"] )) )
    {
      position_settings_screen.print_nmea();
      $( "#position_settings_screen .gps_info#position_nmea" ).removeClass( "gone" );
    }
    else
    {
      $( "#position_settings_screen .gps_info#position_nmea" ).addClass( "gone" );
    }

    if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Parsing TS"] && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: TS"] ) && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: TS ED"] ) )
    {
      position_settings_screen.print_ts();
      $( "#position_settings_screen .gps_info#position_ts" ).removeClass( "gone" );
    }
    else
    {
      $( "#position_settings_screen .gps_info#position_ts" ).addClass( "gone" );
    }
    if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Parsing NMEA Pjk"] && position_settings_screen.has_objects( position_settings_screen.gps_info["platform/gnss_antenna: PJK"] ) )
    {
      position_settings_screen.print_pjk();
      $( "#position_settings_screen .gps_info#position_pjk" ).removeClass( "gone" );
    }
    else
    {
      $( "#position_settings_screen .gps_info#position_pjk" ).addClass( "gone" );
    }
    

    position_settings_screen.print_summary();
    $( "#position_settings_screen #position_projection_section" ).removeClass( "first-child" );
    $( "#position_settings_screen .gps_info#position_summary" ).removeClass( "gone" );
  },
  print_csv: function()
  {
    var rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Easting"], robot_controller.chosen_robot_position.x.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Northing"], robot_controller.chosen_robot_position.y.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Output frequency"], position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Valid position output frequency"] + " Hz" );

    rows += position_settings_screen.table_row( "N", position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["N coordinate"] );
    rows += position_settings_screen.table_row( "E", position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["E coordinate"] );
    rows += position_settings_screen.table_row( "Z", position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Z coordinate"] );

    $( "#position_csv table" ).html( rows );

    $( "#position_csv button" ).html( translate["Raw input"] );
  },
  print_gdm: function()
  {
    var rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Easting"], robot_controller.chosen_robot_position.x.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Northing"], robot_controller.chosen_robot_position.y.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Input frequency"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["GDM Frequency"] + " Hz" );
    rows += position_settings_screen.table_row( translate["Output frequency"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Valid position output frequency"] + " Hz" );

    rows += position_settings_screen.table_row( translate["Timestamp"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Time"] );
    rows += position_settings_screen.table_row( translate["Datum"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Datum"] );
    rows += position_settings_screen.table_row( translate["XY time diff"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["XY time diff [ms]"] + " ms" );

    rows += position_settings_screen.table_row( translate["Horizontal angle"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Horizontal angle"] );
    rows += position_settings_screen.table_row( translate["Vertical angle"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Verical angle"] );
    rows += position_settings_screen.table_row( translate["Horizontal distance"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Horizontal distance"] );
    rows += position_settings_screen.table_row( translate["Vertical distance"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Vertical distance"] );
    rows += position_settings_screen.table_row( translate["Slanting distance"], position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Slanting distance"] );

    rows += position_settings_screen.table_row( "X", position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["X"] );
    rows += position_settings_screen.table_row( "Y", position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Y"] );
    rows += position_settings_screen.table_row( "Z", position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Z"] );

    $( "#position_gdm table" ).html( rows );
  },
  print_pjk: function()
  {
    let rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Altitude"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Alt"] + " " + position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Alt model"]);
    rows += position_settings_screen.table_row( translate["UTC of position fix"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["UTC"]);
    rows += position_settings_screen.table_row( translate["Northing"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Northing"]);
    rows += position_settings_screen.table_row( translate["Easting"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Easting"]);
    rows += position_settings_screen.table_row( translate["DNSS Quality"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Quality"] );
    rows += position_settings_screen.table_row( translate["Number of satellites in fix"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Satellite count"] );
    rows += position_settings_screen.table_row( translate["DOP of fix"], position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Dop"] );

    $( "#position_pjk table" ).html( rows );
    $( "#position_pjk button" ).html( translate["Raw input"] );
  },
  convert_to_degrees( value, direction )
  {
    const v = value.toString();
    const no_decimal = v.indexOf( "." ) < 0;
    const idx = no_decimal ? v.length : v.indexOf( "." );
    const d = parseInt( v.slice( 0, idx - 2 ) );
    const m = parseInt( v.slice( idx - 2, idx ) );

    if( no_decimal )
    {
      return `${d}&deg; ${m}' ${direction}`;
    }
    else
    {
      const sd = v.slice( idx + 1, idx + 6 );
      return `${d}&deg; ${m}${sd.length > 0 ? "." + sd : ""}' ${direction}`;
    }
  },
  print_nmea: function()
  {
    let gmpMessage, gmpFrequency, ggaFrequency;
    if( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Frequency"] )
      ggaFrequency = parseFloat( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Frequency"] );

    if( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] !== undefined )
    {
      gmpMessage = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Message"];
      gmpFrequency = parseFloat( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Frequency"] );
    }
    if( gmpMessage === "Receiving" && gmpFrequency > 0 )
    {
      position_settings_screen.print_nmeaGMP();
      if( q$( "#raw_nmeaGMP" ).hasClass( "gone" ) )
      {
        q$( "#raw_nmeaGMP" ).removeClass( "gone" );
        q$( "#raw_nmeaGGA" ).addClass( "gone" );
      }
    }
    else if( ggaFrequency != 0 )
    {
      position_settings_screen.print_nmeaGGA();
      q$( "#raw_nmeaGGA" ).removeClass( "gone" );
      q$( "#raw_nmeaGMP" ).addClass( "gone" );
    }
    else
    {
      console.warn( "Check platform/gnss_antenna: NMEA reading." );
    }
  },
  print_nmeaGMP: function()
  {
    var rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Easting"], robot_controller.chosen_robot_position.x.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Northing"], robot_controller.chosen_robot_position.y.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Input frequency"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Frequency"] + " Hz" );
    rows += position_settings_screen.table_row( translate["Output frequency"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Valid position output frequency"] + " Hz" );
    rows += position_settings_screen.table_row( translate["Timestamp"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Timestamp"] );

    if( !robot_controller.is_chosen_none )
    {
      rows += position_settings_screen.table_row( translate["X"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["x"] );
      rows += position_settings_screen.table_row( translate["Y"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["y"] );
    }

    rows += position_settings_screen.table_row( translate["Altitude"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Alt"] );
    rows += position_settings_screen.table_row( translate["HDOP"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Hdop"] );
    rows += position_settings_screen.table_row( translate["GPS Quality"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Quality"] );
    rows += position_settings_screen.table_row( translate["Satellite count"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Satelite count"] );
    //Careful of the leftover typo on Satellite/Satelite on above line.

    $( "#position_nmea table" ).html( rows );
    $( "#position_nmea button" ).html( translate["Raw input"] );
  },
  print_nmeaGGA: function()
  {
    var rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Easting"], robot_controller.chosen_robot_position.x.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Northing"], robot_controller.chosen_robot_position.y.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Input frequency"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Frequency"] + " Hz" );
    rows += position_settings_screen.table_row( translate["Output frequency"], position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Valid position output frequency"] + " Hz" );

    const parts = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Raw"].split( ',' );

    rows += position_settings_screen.table_row( translate["Timestamp"], parts[1] );

    if( !robot_controller.is_chosen_none )
    {
      var lat = position_settings_screen.convert_to_degrees( parts[2], parts[3] );
      rows += position_settings_screen.table_row( translate["Latitude"], lat );
    }
    else
    {
      rows += position_settings_screen.table_row( translate["Northing"], parts[2] + " " + translate_unit( true, true ) );
    }

    if( !robot_controller.is_chosen_none )
    {
      var long = position_settings_screen.convert_to_degrees( parts[4], parts[5] );
      rows += position_settings_screen.table_row( translate["Longitude"], long );
    }
    else
    {
      rows += position_settings_screen.table_row( translate["Easting"], parts[4] + " " + translate_unit( true, true ) );
    }

    rows += position_settings_screen.table_row( translate["Altitude"], parts[9] + " " + parts[10].toLowerCase() );
    rows += position_settings_screen.table_row( translate["HDOP"], parts[8] );
    rows += position_settings_screen.table_row( translate["GPS Quality"], parts[6] );
    rows += position_settings_screen.table_row( translate["Satellite count"], parts[7] );

    $( "#position_nmea table" ).html( rows );
    $( "#position_nmea button" ).html( translate["Raw input"] );
  },
  print_ts: function()
  {
    var rows = "";
    rows += position_settings_screen.table_row( translate["Status"], (position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Level"] > 0 ? position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Message"] : translate["OK"]) );
    rows += position_settings_screen.table_row( translate["Easting"], robot_controller.chosen_robot_position.x.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Northing"], robot_controller.chosen_robot_position.y.meter2unit().toFixed(3) + " " + translate_unit());
    rows += position_settings_screen.table_row( translate["Input frequency"], position_settings_screen.gps_info["platform/gnss_antenna: TS ED"]["Frequency"] + " Hz" );
    rows += position_settings_screen.table_row( translate["Output frequency"], position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Valid position output frequency"] + " Hz" );

    rows += position_settings_screen.table_row( "N", position_settings_screen.gps_info["platform/gnss_antenna: TS ED"]["N coordinate"] );
    rows += position_settings_screen.table_row( "E", position_settings_screen.gps_info["platform/gnss_antenna: TS ED"]["E coordinate"] );
    rows += position_settings_screen.table_row( "Z", position_settings_screen.gps_info["platform/gnss_antenna: TS ED"]["Z coordinate"] );

    $( "#position_ts table" ).html( rows );
    $( "#position_ts button" ).html( translate["Raw input"] );
  },
  print_summary: function()
  {
    var rows = "";
    let gmpMessage, gmpFrequency, ggaFrequency, pjkMessage, pjkFrequency;

    // Build status row
    if( Object.keys( position_settings_screen.gps_info ).length > 0 )
    {
      var status = translate["OK"];
      var errors = {};
      if( position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Active position input"] === "None" )
        errors["GNSS"] = translate["No input"];
      if( position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Level"] > 0 )
        errors["CSV"] = position_settings_screen.gps_info["platform/gnss_antenna: CSV"]["Message"];
      if( position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Level"] > 0 )
        errors["GDM"] = position_settings_screen.gps_info["platform/gnss_antenna: GDM"]["Message"];
      if( position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Level"] > 0 )
        errors["NMEA"] = position_settings_screen.gps_info["platform/gnss_antenna: NMEA"]["Message"];
      if( position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Level"] > 0 )
        errors["TS"] = position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Message"];
        if( position_settings_screen.gps_info["platform/gnss_antenna: TS"]["Level"] > 0 )
        errors["PJK"] = position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Message"];
      if( Object.keys( errors ).length > 1 )
      {
        status = "";
        for( var i = 0; i < Object.keys( errors ).length; i++ )
        {
          status += Object.keys( errors )[i] + ": " + errors[Object.keys( errors )[i]];
          if( i < Object.keys( errors ).length - 1 )
            status += ", ";
        }
      }
      else if( Object.keys( errors ).length === 1 )
      {
        status = errors[Object.keys( errors )[0]];
      }
      
      if( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Frequency"] )
      ggaFrequency = parseFloat( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Frequency"] );
    }
    
    var content = "";

    content = status ? status : "";
    rows += position_settings_screen.table_row( translate["Status"], content, true );

    // Build gps source row
    content = position_settings_screen.gps_info["platform/gnss_antenna: Input"] ? position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Active position input"] : "";
    rows += position_settings_screen.table_row( translate["GPS source"], content, true );

    // Build summed frequency row
    content = position_settings_screen.gps_info["platform/gnss_antenna: Input"] ? position_settings_screen.gps_info["platform/gnss_antenna: Input"]["Input frequency summed"] + " Hz" : "";
    rows += position_settings_screen.table_row( translate["Frequency"], content, true );

    if( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] !== undefined )
    {
      gmpMessage = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Message"];
      gmpFrequency = parseFloat( position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Frequency"] );
    }
    if( gmpMessage === "Receiving" && gmpFrequency > 0 )
    {
      // Build HDOP row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Hdop"] : "";
      rows += position_settings_screen.table_row( translate["HDOP"], content, true );

      // Build GPS Quality row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Quality"] : "";
      rows += position_settings_screen.table_row( translate["GPS Quality"], content, true );

      // Build Satellite count row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GMP"]["Satelite count"] : "";
      rows += position_settings_screen.table_row( translate["Satellite count"], content, true );
    }
    else if( ggaFrequency > 0 )
    {
      // Build HDOP row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Hdop"] : "";
      rows += position_settings_screen.table_row( translate["HDOP"], content, true );

      // Build GPS Quality row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Quality"] : "";
      rows += position_settings_screen.table_row( translate["GPS Quality"], content, true );

      // Build Satellite count row
      content = position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"] ? position_settings_screen.gps_info["platform/gnss_antenna: NMEA GGA"]["Satelite count"] : "";
      rows += position_settings_screen.table_row( translate["Satellite count"], content, true );
    }
    else
    {
      console.warn( "Check platform/gnss_antenna: NMEA reading." );
    }


    if( position_settings_screen.gps_info["platform/gnss_antenna: PJK"] !== undefined)
    {
      pjkMessage = position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Message"];
    }
    //For some reason it's set to "Running" instead of "Receiving" in this situation
    if(pjkMessage === "Running")
    {
      // Build HDOP row
      content = position_settings_screen.gps_info["platform/gnss_antenna: PJK"] ? position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Dop"] : "";
      rows += position_settings_screen.table_row( translate["DOP of fix"], content, true );

      // Build GPS Quality row
      content = position_settings_screen.gps_info["platform/gnss_antenna: PJK"] ? position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Quality"] : "";
      rows += position_settings_screen.table_row( translate["DNSS Quality"], content, true );

      // Build Satellite count row
      content = position_settings_screen.gps_info["platform/gnss_antenna: PJK"] ? position_settings_screen.gps_info["platform/gnss_antenna: PJK"]["Satellite count"] : "";
      rows += position_settings_screen.table_row( translate["Satellite count"], content, true );
    }
    else
    {
      console.warn( "Check platform/gnss_antenna: PJK reading." );
    }

    // Build projection or totalstation row
    const projector = robot_controller.chosen_robot.projector ? robot_controller.chosen_robot.projector.pr : robot_controller.chosen_robot.projection;
    let alias = projector.alias;
    let tmr_ts;
    if( projector )
      tmr_ts = projector.getValue( "+tmr_ts" );

    if( !!tmr_ts )
    {
      let location = translate["N/A"];
      const loc = Object.keys( totalstation_location_controller.locations ).map( k => totalstation_location_controller.locations[k] ).find( l => l.uuid === tmr_ts );
      if( loc && loc.name )
        location = loc.name;
      rows += position_settings_screen.table_row( translate["Total Station Location"], location );
    }
    else
    {
      if( projection_controller.isOldNone( alias ) )
        alias = projection_controller.none[alias].name;
      rows += position_settings_screen.table_row( translate["Projection"], alias );
    }

    $( "#position_summary table" ).html( rows );
  },
  table_row: function( name, value, use_not_available = false)
  {
    if( !value )
    {
      if( !use_not_available )
        return "";
      else
        value = translate["N/A"];
    }

    const numval = Number(value);
    if( !Number.isNaN(numval) )
    {
      if( Number.isInteger(numval) )
      {
        value = numval.toFixed(0);
      }
    }

    var row = "<tr>";
    row += '<td style="width:35%;"><p>' + name + "</p></td>";
    row += "<td><p>" + value + "</p></td>";
    row += "</tr>";
    return row;
  },
  raw_input_interval: 0,
  raw_input: function( title, name )
  {
    position_settings_screen.raw_input_interval = setInterval( function()
    {
      $( "#confirm_popup #info_label1" ).html( position_settings_screen.gps_info["platform/gnss_antenna: " + name]["Raw"] );
    }, 1000 );

    popup_screen_controller.confirm_popup( translate["Raw %1s input"].format( title ), position_settings_screen.gps_info["platform/gnss_antenna: " + name]["Raw"], translate["Close"], "", function()
    {
      clearInterval( position_settings_screen.raw_input_interval );
      popup_screen_controller.close();
    } );
  },
  has_objects: function( obj )
  {
    if( !obj )
      return false;

    for( var i = 0; i < Object.keys( obj ).length; i++ )
    {
      if( obj[Object.keys( obj )[i]] === undefined )
        return false;
    }

    return true;
  },
  update_allowed_projection_change: function()
  {
    const check = !robot_controller.chosen_robot.projection_change_allowed;
    $("#projection_recently_used .row input[type='radio']").prop("disabled", check);
    $("#apply_projection_button").prop("disabled", check);
  }
};
//End of position_settings_screen object

message_controller.events.add_callback( "gps_info", position_settings_screen.got_gps_info );
event_controller.add_callback( "robot_not_online", position_settings_screen.got_gps_info );

$( document ).ready( function()
{
  projection_controller.load_all_epsg();
  projection_controller.load_all_esri();

  event_controller.add_callback( "got_robot_position", function()
  {
    position_settings_screen.update_projection_inputs( robot_controller.chosen_robot );
  } );

  event_controller.add_callback( "robot_now_offline", position_settings_screen.clear_gps_info );
  event_controller.add_callback( "robot_now_online", function()
  {
    clearTimeout( position_settings_screen.clear_gps_info_timeout );
  } );

  event_controller.add_callback("on_system_diag_change", position_settings_screen.update_allowed_projection_change);
} );

event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "position_settings_screen" )
    position_settings_screen.open();
  else
    position_settings_screen.close();
} );