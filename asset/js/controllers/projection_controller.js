/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global event_controller, communication_controller, Storage, EPSG_FILE, ESRI_FILE, position_settings_screen, robot_controller, proj4, translate, custom_projection_controller, DEBUG_MODE */


const projection_controller = {
  raw_projection_file: "",
  projections: {}, // all projections fro proj4
  alias_projections: {}, // all alias projections
  loaded_projections: false,
  is_open: false,
  use_proj6: false,
  none: {
    NONE: {
      name: "NONE (m)",
      units: "m",
      get projection()
      {
        if(!projection_controller.use_proj6)
          return "NONE";
        return robot_controller.robot_has_capability("proj_v6") ? "+proj=affine +units=m" : "NONE";
      }
    },
    NONE_FEET: {
      name: "NONE (ft)",
      units: "ft",
      get projection()
      {
        if(!projection_controller.use_proj6)
          return "NONE_FEET";
        return robot_controller.robot_has_capability("proj_v6") ? "+proj=affine +units=ft" : "NONE_FEET";
      }
    },
    NONE_US_FEET: {
      name: "NONE (us-ft)",
      units: "us-ft",
      get projection()
      {
        if(!projection_controller.use_proj6)
          return "NONE_US_FEET";
        return robot_controller.robot_has_capability("proj_v6") ? "+proj=affine +units=us-ft" : "NONE_US_FEET";
      }
    }
  },
  isOldNone: function( proj_string )
  {
    return Object.keys( projection_controller.none ).map( ( p ) => {
      return p.toLowerCase();
    } ).indexOf( ("" + proj_string).toLowerCase() ) >= 0 || Object.keys( projection_controller.none ).map( ( k ) => {
      return projection_controller.none[k].name.toLowerCase();
    } ).indexOf( ("" + proj_string).toLowerCase() ) >= 0;
  },
  isNewNone: function( proj_string )
  {
    return (!!proj_string && proj_string.indexOf("+proj=affine") >= 0);
  },
  _isNone: function( proj_string )
  {
    if(!projection_controller.use_proj6)
      return projection_controller.isOldNone( proj_string );
      
    return projection_controller.isNewNone( proj_string ) || projection_controller.isOldNone( proj_string );
  },
  getNoneProjection: function( new_value )
  {
    if( projection_controller.isNone( new_value ) )
    {
      if(projection_controller.isOldNone( new_value ))
      {
        const none_keys = Object.keys( projection_controller.none );
        let key;
        if( none_keys.indexOf( new_value.toUpperCase() ) > -1 )
          key = new_value.toUpperCase();
        else
        {
          key = none_keys.find( k => projection_controller.none[k].name.toUpperCase() === new_value.toUpperCase() );
        }
        return projection_controller.none[key].projection;
      }
      else
      {
        if(robot_controller.robot_has_capability("proj_v6"))
        {
          return new_value;
        }
        else
        {
          const units = new Proj4Projection(new_value).units;
          return Object.keys(projection_controller.none).find(p=>p.units===units).projection;
        }
      }
    }
    else
      throw "Projection not NONE";
  },
  getNoneName: function( new_value )
  {
    if( projection_controller.isOldNone( new_value ) )
    {
      const none_keys = Object.keys( projection_controller.none );
      if( new_value.toUpperCase() in projection_controller.none )
        return projection_controller.none[new_value.toUpperCase()].name;
      else
      {
        return none_keys.map( k => projection_controller.none[k] ).find( p => p.name.toUpperCase() === new_value.toUpperCase() ).name;
      }
    }
    else if(robot_controller.robot_has_capability("proj_v6"))
      return new_value;
    else
      throw "Projection not NONE";
  },
  get_proj_string: function( new_value, test = true )
  {
    if( projection_controller.isNone( new_value ) )
    {
      return projection_controller.getNoneProjection( new_value );
    }

    let proj = "";
    try
    {
      if( projection_controller.projections[new_value] )
        proj = projection_controller.projections[new_value].trim();
      else
        proj = new_value;

      if( proj.indexOf( "+init" ) > -1 )
      {
        const lookup = proj.trim();
        const explode1D = lookup.split( " " );
        const explode2D = explode1D.map( p => p.split( "=" ) );
        const params = explode2D.map( p => p[0] );
        const args = explode2D.map( p => p[1] );

        const initIndex = params.indexOf( "+init" );
        const enr = args[initIndex].toUpperCase();
        explode1D[initIndex] = projection_controller.projections[enr] ? projection_controller.projections[enr].trim() : "";

        proj = explode1D.join( " " );
      }
    }
    catch( e )
    {
      console.error( new_value, test, e );
      throw e;
    }

    if( test )
    {
      try
      {
        ProjectorForward( proj, [0, 0] ); // Test if it works
      }
      catch( e )
      {
        throw e;
      }
    }

    return proj;
  },
  add_projections: function( data, dont_save )
  {

    if( !data && projection_controller.raw_projection_file )
      data = projection_controller.raw_projection_file;

    if( !projection_controller.loaded_projections )
      projection_controller.load_all();

    if( !dont_save )
      localStorage.setItem( "projection_file", data );
    projection_controller.raw_projection_file = data;

    var lines = projection_controller.raw_projection_file.split( "\n" ).map( function( line )
    {
      return line.trim();
    } ).filter( function( line )
    {

      if( line === "" )
        return false;

      if( line[0] === "#" )
        return false;

      if( line.toLowerCase().indexOf("none") > -1)
        return false;

      return true;

    } );

    lines.forEach( function( line )
    {
      var split = line.split( ":" );

      var alias = split[0];
      var proj = line.replace( alias + ":", "" );
      proj = projection_controller.get_proj_string( proj, false );
      proj = projection_controller.parse_proj_with_utm( proj );

      /*try {
       proj4( proj );
       } catch ( e ) {
       var alternative = proj.replace( "+init=", "" ).toUpperCase();
       if ( projection_controller.projections[alternative] )
       proj = projection_controller.projections[alternative];
       }*/

      projection_controller.projections[alias] = proj;
      projection_controller.alias_projections[alias] = proj;

    } );

    // Add NONE projections
    Object.keys( projection_controller.none ).forEach( ( key ) => {
      const p = projection_controller.none[key];
      projection_controller.projections[p.name] = p.projection;
    } );

    // Add Custom projections
    custom_projection_controller.update_projections();

    console.log( "Got projections" );
    event_controller.call_callback( "new_projections", projection_controller.projections );
  },
  update_projections_with_prefix: function( prefix, new_projections )
  {
    Object.keysStartingWith( projection_controller.projections, prefix ).forEach( k =>
    {
      delete projection_controller.projections[k];
    } );

    // Add new projections
    Object.keys( new_projections ).forEach( ( key ) => {
      projection_controller.projections[`${prefix}${key}`] = new_projections[key];
    } );
    event_controller.call_callback( "new_projections", projection_controller.projections );
  },
  load_all: function()
  {
    if( !projection_controller.loaded_projections )
    {
      projection_controller.load_all_epsg();
      projection_controller.load_all_esri();
      projection_controller.loaded_projections = true;
    }
  },
  load_all_epsg: function()
  {
    if( projection_controller.loaded_projections )
      return;
    projection_controller.load_proj_file( EPSG_FILE, "EPSG:" );
  },
  load_all_esri: function()
  {
    if( projection_controller.loaded_projections )
      return;
    projection_controller.load_proj_file( ESRI_FILE, "ESRI:" );
  },
  load_proj_file: function( file, prefix )
  {
    logger.debug( "loading", prefix );
    var lines = file.split( "\n" );

    lines.forEach( function( line, i )
    {
      if( line.trim() && line.trim()[0] !== "#" )
      {
        var info_line = lines[i - 1];
        var info = info_line.replace( "#", "" ).trim();
        var more = line.split( ">" );
        var alias = prefix + more[0].split( "<" )[1];
        var proj = more[1].split( "<" )[0].trim();

        proj = projection_controller.parse_proj_with_utm( proj );

        projection_controller.projections[alias] = proj;
        // proj4.defs( alias, proj );
        //projection_controller.projections[info] = proj;
      }
    } );
    event_controller.call_callback( "new_projections", projection_controller.projections );
  },

  /**
   * Calculate the valid UTM zone for the given longitude in WGS84
   * @param {Float} longitude Longitude to convert to UTM zone
   * @returns {Integer} UTM zone
   */
  WGS84long2UTMZone: function(longitude)
  {
    return (Math.floor((longitude+180)/6) % 60) + 1;
  },
  /**
   * Calculate the valid boundaries for 
   * @param {Integer} UTMZone UTM zone to convert to longitude boundary
   * @returns {Array<Integer>} WGS84 Longitude boundary for UTM zone (east, west)
   */
  UTM2WGS84longBoundary: function(UTMZone)
  {
    const east = (((UTMZone % 60) - 1) * 6) - 180;
    return [east, east + 6];
  },
  /**
   * Convert projected coordinate to UTM zone
   * @param {String} ProjString 
   * @param {Vector} projectedCoordinate 
   * @returns {String} UTM zone
   */
  projectedCoordinate2UTM: function( ProjString, projectedCoordinate )
  {
    const lnglat = ProjectorInverse(ProjString, projectedCoordinate.toArray());
    return projection_controller.lnglat2UTMAlias(lnglat);
  },
  /**
   * 
   * @param {*} UTMProjString
   * @param {*} projectedCoordinate 
   */
  UTMCoordinateValid: function( UTMProjString, projectedCoordinate )
  {
    const projector = Projector(UTMProjString);
    const alias = projector.pr.alias;
    if(!alias.startsWith("UTM"))
    {
      throw TypeError("Projection String not a UTM zone!");
    }
    const lnglatCoordinate = projector.inverse(projectedCoordinate.toArray());
    return alias === projection_controller.lnglat2UTMAlias(lnglatCoordinate);
  },
  UTMCoordinateValidTest: function()
  {
    const UTMProjString = "+proj=tmerc +datum=WGS84 +ellps=WGS84 +a=6378137.0 +rf=298.257223563 +pm=0 +lat_0=0.0 +lon_0=9.0 +k_0=0.9996 +x_0=500000.0 +y_0=0.0 +tmr_units=m +axis=enu +no_defs +tmr_alias=UTM32";
    const projectedCoordinate = new Vector(
      574313.622370767,
      6211562.149227471
    );
    return projection_controller.UTMCoordinateValid(UTMProjString, projectedCoordinate);
  },
  lnglat2UTMZone: function( lnglat )
  {
    return projection_controller.WGS84long2UTMZone(lnglat[0]);
  },
  lnglat2UTMProjString: function( lnglat )
  {
    if( !(lnglat instanceof Array) )
    {
      throw TypeError("lnglat must be of type Array!");
    }
    else if( lnglat.length < 2 || lnglat.length > 3 )
    {
      throw RangeError("lnglat must be 2 or 3 entries long [lng, lat, height]");
    }
    else
    {
      const best_alias = projection_controller.lnglat2UTMAlias(lnglat);
      return projection_controller.get_best_proj_string_from_alias(best_alias);
    }

  },
  getNearestUTMProjString: function()
  {
    const lnglat = gps_controller.last_position;
    if(lnglat)
    {
      return projection_controller.lnglat2UTMProjString(lnglat);
    }
    else
    {
      throw ReferenceError("Missing Last GPS position");
    }
  },
  get_best_proj_string_from_alias: memoize(function( alias )
  {
    const pstring_lookup = projection_controller.projections[alias];
    const projection = new Proj4Projection(pstring_lookup);
    // if(!projection.alias)
    projection.setValue( "+tmr_alias", alias );
    return projection.string;
  }),
  get_best_proj4string: function( lnglat )
  {
    var string = "+proj=utm +zone=" + projection_controller.get_nearest_zone( lnglat );
    if( lnglat[1] < 0 )
      string += " +south";
    return string;
  },
  lnglat2UTMAlias: function( lnglat, useNorth = false )
  {
    const zone = projection_controller.lnglat2UTMZone( lnglat );
    let suffix = "";
    if( lnglat[1] < 0 )
    {
      suffix = "S";
    }
    else if(useNorth)
    {
      suffix = "N";
    }
    return "UTM" + zone + suffix;
  },
  get_best_projector: function( lnglat )
  {
    const utm = projection_controller.lnglat2UTMProjString( lnglat );
    return Projector( utm );
  },
  set_to_nearest_projection: function( lnglat )
  {   
    event_controller.remove_callback( "got_user_position", projection_controller.set_to_nearest_projection );
    var p = projection_controller.lnglat2UTMProjString( lnglat );

    if( p !== robot_controller.chosen_robot.projection && p )
    {
      position_settings_screen.change_projection( p );
    }
  },
  set_zone_on_next_gps: function()
  {
    logger.debug( "set_zone_on_next_gps" );
    event_controller.remove_callback( "got_user_position", projection_controller.set_to_nearest_projection );
    event_controller.remove_callback( "robot_now_online", projection_controller.set_zone_on_next_gps );
    if( general_settings_screen.settings.automatic_choose_projection.val && !totalstation_controller.totalstation_in_use )
    {
      if( gps_controller.last_pos_object )
        projection_controller.set_to_nearest_projection( gps_controller.last_position );
      else
        event_controller.add_callback( "got_user_position", projection_controller.set_to_nearest_projection );
    }

  },
  test_all_aliases: function()
  {
    var keys = Object.keys( projection_controller.alias_projections );
    keys.forEach( function( p )
    {
      var new_value = p;

      var proj = projection_controller.projections[new_value].trim();
      try
      {
        ProjectorForward( proj, [0, 0] );
        new Proj4Projection( proj );
      }
      catch( e )
      {
        var trim = projection_controller.projections[new_value].replace( "+init=", "" ).trim().toUpperCase();
        var epsg = trim.split( "EPSG" );
        for( var i = 1; i < epsg.length; i++ )
        {
          var enr = "EPSG" + epsg[i].split( " " )[0];
          var repl = "";
          if( projection_controller.projections[enr] )
            repl = projection_controller.projections[enr].trim();
          trim = trim.replace( enr, repl );

        }
        proj = trim;
      }
      try
      {
        ProjectorForward( proj, [0, 0] );
      }
      catch( e )
      {
        console.log( p, e );
      }

    } );

  },

  test_proj_string( proj )
  {
    proj = proj.trim();
    try
    {
      const p = PROJ( proj ); // Test if it works
      p.release();
    }
    catch( e )
    {
      var trim = proj.replace( "+init=", "" ).trim().toUpperCase();
      var epsg = trim.split( "EPSG" );
      for( var i = 1; i < epsg.length; i++ )
      {
        var enr = "EPSG" + epsg[i].split( " " )[0];
        var repl = "";
        if( projection_controller.projections[enr] )
          repl = projection_controller.projections[enr].trim();
        trim = trim.replace( enr, repl );

      }
      proj = trim;
    }
    return proj;
  },

  parse_proj_with_utm( proj )
  {
    parts = proj.split( " " );
    projIdx = parts.findIndex( p => p.indexOf( "+proj" ) > -1 );
    zoneIdx = parts.findIndex( p => p.indexOf( "+zone" ) > -1 );
    xIdx = parts.findIndex( p => p.indexOf( "+x_0" ) > -1 );
    yIdx = parts.findIndex( p => p.indexOf( "+y_0" ) > -1 );
    southIdx = parts.findIndex( p => p.indexOf( "+south" ) > -1 );

    if( projIdx === -1 || zoneIdx === -1 )
    {
//      console.warn( "Could not convert proj string with utm", proj );
      return proj;
    }

    const zone = parseInt( parts[zoneIdx].split( "=" )[1] );
    const lat = (0.0);
    const lon = (-177.0 + ((zone - 1) * 360 / 60));

    let x = 0, y = 0;
    if( xIdx > -1 )
      x = parseFloat( parts[xIdx].split( "=" )[1] );
    else
      x = 500000.0;
    if( yIdx > -1 )
      y = parseFloat( parts[xIdx].split( "=" )[1] );
    else if( southIdx > -1 )
    {
      y = 10000000.0;
      parts[southIdx] = ""; // Remove south
    }

    if( xIdx > -1 )
      parts[xIdx] = "";
    if( yIdx > -1 )
      parts[yIdx] = "";

    parts[projIdx] = "+proj=tmerc";
    parts[zoneIdx] = `+lat_0=${ lat } +lon_0=${ lon } +x_0=${ x } +y_0=${ y } +k_0=0.9996`;

    parts = parts.filter( p => p.length > 0 );
    let result = parts.join( " " );
    return result;
  },

  _lookup_proj_string_alias: function(proj_string)
  {
    const cleanedString = Proj4Projection.cleanProjectionString(proj_string);
    const result = Object.entries(projection_controller.projections).find(e=>e[1]===cleanedString);
    if(result)
    {
      return result[0];
    }
    else
    {
      console.warn("Unable to find projection from string!");
      return;
    }
  },
};

projection_controller.isNone = memoize(projection_controller._isNone);
projection_controller.lookup_proj_string_alias = memoize(projection_controller._lookup_proj_string_alias);


$(()=>{
  event_controller.add_callback( "got_projections", projection_controller.add_projections );

  event_controller.add_callback( "user_login_success", function()
  {
    communication_controller.send( 'get_projections', {}, "cloud", 10 );
  } );

  event_controller.add_callback( "close_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "position_settings_screen" )
      projection_controller.is_open = false;
  } );
  event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
  {
    if( settings_screen_name === "position_settings_screen" )
    {
      projection_controller.is_open = true;
      position_settings_screen.update_projection_inputs( robot_controller.chosen_robot );
    }
  } );

  setInterval(projection_controller.set_zone_on_next_gps, 60*1000);


  event_controller.add_callback( "callbacks_loaded", function()
  {

    if( typeof (Storage) !== "undefined" )
    {
      var projection_file = localStorage.getItem( "projection_file" );
      if( projection_file )
        projection_controller.add_projections( projection_file, true );
    }
  } );

} );

