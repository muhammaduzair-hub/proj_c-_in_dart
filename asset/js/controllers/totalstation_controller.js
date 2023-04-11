/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global TotalStation, totalstation_controller, event_controller, robot_communication_settings_screen, message_controller, TotalStation_LN150, communication_controller, robot_controller */

const totalstation_controller = {
  illegal_name_characters: [ ],
  legal_bt_name_beginnings: [ "LN-150" ],
  nearby_totalstations: {
    current: [ ],
    all: [ ]
  },
  totalstations: {},
  active: undefined,
  ignore_known_devices_when_scanning: true,
  initialized: false,
  get totalstation_in_use()
  {
    return !!totalstation_controller.active && !!totalstation_location_controller.active;
  },
  init: function( reinitialize = false)
  {
    if( reinitialize )
      totalstation_controller.initialized = false;

    if( totalstation_controller.initialized )
      return;

    totalstation_location_controller.init( reinitialize );
    totalstation_controller.load();
    totalstation_controller.initialized = true;
  },
  totalstation_exists( totalstation_name )
  {
    const custom = !!totalstation_controller.totalstations[totalstation_name];
    return custom;
  },
  get_all: function()
  {
    return Object.keys( totalstation_controller.totalstations ).map( k => totalstation_controller.totalstations[k] ).sort_objects( 'name' );
  },
  add: function( totalstation )
  {
    totalstation_controller.edit( totalstation, true );
  },
  edit: function( totalstation, original, force_validate = false, force_edit = false)
  {
    const edit = function()
    {
      totalstation_controller.totalstations[totalstation.name] = totalstation;
//      totalstation_controller.update_totalstations();
      totalstation_controller.save();
      return;
    };
    const validate = function()
    {
      if( totalstation_controller.totalstation_exists( totalstation.name ) )
      {
        console.error( `TotalStation '${totalstation.name}' already exists!` );
        throw `TotalStation name already exists!`;
      }

      totalstation_controller.illegal_name_characters.forEach( c => {
        if( totalstation.name.indexOf( c ) !== -1 )
        {
          console.error( `Character '${c}' is illegal in name` );
          throw `Illegal character in name`;
        }
      } );

      edit();
    };

    if( force_edit )
      edit();
    else if( force_validate )
      validate();
    else if( original && original.name )
    {
      if( original.name === totalstation.name )
        edit();
      else
      {
        totalstation_controller.remove( original.name );
        validate();
      }
    }
    else
      validate();

  },

  save_name: "totalstations",
  save: function()
  {
    localStorage.setItem( totalstation_controller.save_name, JSON.stringify( totalstation_controller.totalstations ) );
  },
  remove_saved: function()
  {
    localStorage.removeItem( totalstation_controller.save_name );
  },
  load: function()
  {
    const p = JSON.parse( localStorage.getItem( totalstation_controller.save_name ) );
    if( p !== null )
    {
      const tss = {};
      Object.keys( p ).forEach( k => {
        if( p[k].bt.name.indexOf( 'LN-150' ) === 0 )
          tss[k] = TotalStation_LN150.load( p[k] );
        else
          throw "Total station unsupported";
      } );
      totalstation_controller.totalstations = tss;
      totalstation_controller.set_active( Object.keys( totalstation_controller.totalstations ).find( name => totalstation_controller.totalstations[name].active ) );
    }
    else
      totalstation_controller.remove_all();

//    totalstation_screen.update_totalstations();
  },
  remove: function( name )
  {
    if( totalstation_controller.totalstations[name] )
    {
      delete totalstation_controller.totalstations[name];
//      totalstation_screen.update_totalstations();
      totalstation_controller.save();
      return true;
    }
    else
      return false;
  },
  remove_all: function()
  {
    totalstation_controller.totalstations = {};
    totalstation_controller.remove_saved();
  },

  get_nearby_totalstations: function()
  {
    robot_communication_settings_screen.scan_bluetooth();
  },

  got_nearby_totalstations: function( devices )
  {
//    const starts_with = Object.keys( totalstation_controller.totalstations ).map( k => totalstation_controller.totalstations[k].starts_with );

    // Only react on legal devices
    devices = devices.filter( d => {
      return totalstation_controller.legal_bt_name_beginnings.filter( ( n ) => d.name.indexOf( n ) === 0 ).length > 0;
    } );

    console.log( "Total Stations", devices );
    totalstation_controller.nearby_totalstations.current = devices;

    const all_names = totalstation_controller.nearby_totalstations.all.map( d => d.name );
    const all_macs = totalstation_controller.nearby_totalstations.all.map( d => d.mac );

    if( totalstation_controller.ignore_known_devices_when_scanning )
    {
      all_names.pushAll( Object.keys( totalstation_controller.totalstations ).map( k => totalstation_controller.totalstations[k].bt.name ) );
      all_macs.pushAll( Object.keys( totalstation_controller.totalstations ).map( k => totalstation_controller.totalstations[k].bt.mac ) );
    }

    const new_devices = devices.filter( d => all_names.indexOf( d.name ) === -1 && all_macs.indexOf( d.mac ) === -1 );
    totalstation_controller.nearby_totalstations.all = totalstation_controller.nearby_totalstations.all.concat( new_devices ).sort( ( a, b ) =>
    {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if( nameA < nameB )
        return -1;
      else if( nameA > nameB )
        return 1;
      else
        return 0;
    } );

    event_controller.call_callback( "got_nearby_totalstations", totalstation_controller.nearby_totalstations.all );
  },

  reset_nearby_totalstations: function()
  {
    totalstation_controller.nearby_totalstations = {
      current: [ ],
      all: [ ]
    };
  },

  create_totalstation_from_nearby( mac )
  {
    const nbts = totalstation_controller.nearby_totalstations.all.find( q => q.mac === mac );
    
    if( !nbts )
      throw "Nearby total station does not exist";

    let ts;
    if( nbts.name.indexOf( 'LN-150' ) === 0 )
      ts = new TotalStation_LN150( nbts.name, {
        bt: {
          mac: nbts.mac,
          name: nbts.name
        }
      } );
    else
      throw "Total station unsupported";
    totalstation_controller.add( ts );
  },

  set_active( name )
  {
    if( !name )
    {
      if( totalstation_controller.active )
        totalstation_controller.active.active = false;
      totalstation_controller.active = undefined;
      totalstation_controller.save();
    }
    else if( totalstation_controller.totalstation_exists( name ) )
    {
      totalstation_controller.active = totalstation_controller.totalstations[name];
      totalstation_controller.active.active = true;
      totalstation_controller.save();
    }
    else
      throw "Total station does not exist";
  },

  locate_fixpoints()
  {
    if( !totalstation_controller.active )
      throw "No active total station";
    if( totalstation_controller.active.fixpoints.length === 0 )
      throw "No total station fixpoints";

    return;
  },

  test: function( ready = false)
  {
    totalstation_controller.edit( new TotalStation_LN150( "LN-150_LW000526", {
      'bt': {
        'mac': "00:07:80:E2:A7:BA",
        'name': "LN-150_LW000526"
      }
    } ), false, false, true );

    totalstation_controller.set_active( "LN-150_LW000526" );

    if( ready )
    {
      totalstation_controller.active.connected = true;
      totalstation_controller.active.listening = true;
  }

  },

  get_device_state()
  {
    logger.debug( 'tssend ->', 'get_bluetooth_device_state' );
    communication_controller.send( 'get_bluetooth_device_state', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },

  got_device_state( msg )
  {
    console.log( 'tssend <-', 'bt_device_state', msg );
    if( totalstation_controller.active && msg.Mac === totalstation_controller.active.bt.mac )
    {
      totalstation_controller.active.connecting = msg.Connecting;
      totalstation_controller.active.connected = msg.Connected;
      totalstation_controller.active.listening = msg.Listening;
      totalstation_controller.active.connection.state = msg.Level;
      totalstation_controller.active.connection.error = msg.LastError;

      if( msg['Message Headers Repeat'] )
        totalstation_controller.active.msg.ignoreheaders = msg['Message Headers Repeat'];
    }
  },

  got_bluetooth_info( msg )
  {
    console.log( 'tssend <-', "bluetooth_info", msg );
    if( msg.mac )
    {
      totalstation_controller.init();
      const tsk = Object.keys( totalstation_controller.totalstations ).find( k => totalstation_controller.totalstations[k].bt.mac === msg.mac );
      if( tsk )
      {
        totalstation_controller.set_active( tsk );
        totalstation_controller.get_device_state();
      }
    }
  },

  robot_offline()
  {
    if( totalstation_controller.active )
    {
      totalstation_controller.active.connected = false;
      totalstation_controller.active.listening = false;
    }
  },
  robot_online()
  {
    if( totalstation_controller.active )
    {
      if( totalstation_controller.active.autoconnect )
        totalstation_controller.active.connect();
      // else
      //   totalstation_controller.active.setup();
    }
  },
  track_robot_start( autoset_projection = true )
  {
    if(!totalstation_location_controller.active && autoset_projection)
      position_settings_screen.change_projection(projection_controller.none.NONE.name);
    robot_controller.update_user_param('input_source', 5);
    console.warn("Should this be NONE or customizable?");
    totalstation_controller.active.track_robot_start();
    totalstation_screen.update_robot_tracking();
  },
  track_robot_stop()
  {
    totalstation_controller.active.track_robot_stop();
    robot_controller.update_user_param('input_source', 0);
    totalstation_screen.update_robot_tracking();
  },
  projection: undefined,
  use_site_calibration_as_projection(location, use_default = false)
  {
    if(!location)
      throw "No location provided";

    try
    {
      // totalstation_controller.active.site_calibrate_calculate_matrix(!!location.fixplate);

      
      if(!location.fixplate)
      {
        let original = totalstation_controller.active.fixpoints.original;
        let current = totalstation_controller.active.fixpoints.current;
        totalstation_controller.active.site_calibration = new AffineTransform(original, current).sort().findTerms();
      }
      else
      {
        totalstation_controller.active.site_calibration = new AffineTransform().setTranslation(location.translation).setRotation(location.angle);
      }


    }
    catch(e)
    {
      if(e === "Incorrect amount of fixpoints" && use_default)
        console.warn(e)
      else
        throw e;
    }

    if( !totalstation_controller.active.site_calibration )
      throw "No site calibration";

    // Add special total station tag to projection
    const projection = `${totalstation_controller.active.site_calibration.PROJString()} +tmr_ts=${location.uuid}`;

    console.log( projection );
    totalstation_controller.projection = projection;
    position_settings_screen.change_projection(projection);
    event_controller.add_callback("projection_chosen", totalstation_controller.projection_changed);
  },
  projection_changed()
  {
    if( !(robot_controller.chosen_robot.projection.indexOf("+tmr_ts") >= 0 && robot_controller.chosen_robot.projector.pr.getValue("+tmr_ts") === totalstation_location_controller.active.uuid) )
    {
      totalstation_controller.track_robot_stop();
      totalstation_screen.deselect_location();
    }
  }
};

event_controller.add_callback( "got_scan_result", totalstation_controller.got_nearby_totalstations );
event_controller.add_callback( "robot_now_offline", totalstation_controller.robot_offline );
event_controller.add_callback( "robot_now_online", totalstation_controller.robot_online );
message_controller.events.add_callback( "bt_input", ( msg ) => {
  if( totalstation_controller.active )
    totalstation_controller.active.recv( msg.input );
} );
message_controller.events.add_callback( "bluetooth_info", totalstation_controller.got_bluetooth_info );
message_controller.events.add_callback( "bt_device_info", totalstation_controller.got_device_state );
message_controller.events.add_callback( "bt_device_state", totalstation_controller.got_device_state );
