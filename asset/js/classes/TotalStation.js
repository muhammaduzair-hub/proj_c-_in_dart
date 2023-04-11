/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global communication_controller, robot_controller, robot_communication_settings_screen, translate, math, NaN, popup_screen_controller, pop_generator */

class TotalStation
{
  constructor( name, options =
  {})
  {
    this._recv_events = new MultiEventController();
    this.events = new MultiEventController();

    this.name = name;

    this.description = options.description;

    this.bt = {};
    this.bt.mac = options.bt.mac;
    this.bt.name = options.bt.name;

    this.msg = {};
    this.msg.ignoreheaders = options.msg.ignoreheaders; // Do not send to tablet
    this.msg.parseheaders = options.msg.parseheaders; // Parse as position msg
    this.msg.header = options.msg.header;
    this.msg.separator = options.msg.separator;
    this.msg.footer = options.msg.footer;
    this.msg.ack = options.msg.ack;
    this.msg.nack = options.msg.nack;

    this.connection = {
      state: 0,
      error: ""
    };
    this.connecting = false;
    this.connected = false;
    this._connected_this_session = false;
    this.listening = false;
    this.autoconnect = false;
    this.autoreconnect = true;
    this.use_msg_retry_timer = true;

    this.active = options.active;


    this.copyable = true;
    this.deleteable = true;

    this.fixpoints = {
      original: [ ],
      current: [ ],
      get original_length()
      {
        return this.original.filter(p=>p!==undefined).length;
      },
      get current_length()
      {
        return this.current.filter(p=>p!==undefined).length;
      }
    };
    if( !!options.fixpoints )
      this.fixpoints.original = options.fixpoints.original ? options.fixpoints.original.map( f => new Vector3( f.x, f.y, f.z ) ) : [ ];
    this.fixpoints.lock = this.fixpoints.original_length > 0;
    this.fixpoints.active_index = -1;

    this.instrument = {};
    this.instrument_guides_setup();

    this.robot_lock = false;

    this._target = {
      NONE: 0,
      FIXPOINT: 1,
      ROBOT: 2,
      ROBOT_AS_FIXPOINT: 3
    };
    Object.freeze(this._target);
    this.target_search_reset();

    this.queue = [ ];
    this.queue_retry_counter = 0;

    this.events_setup();
  }

  static load( stored )
  {
    const m = new TotalStation( stored.name, stored );
    return m;
  }

  copy()
  {
    return TotalStation.load( this );
  }

  events_setup()
  {
    this.events.add_callback( 'target_lock_failed', this.target_lock_failed.bind( this ) );
    this.events.add_callback( 'totalstation_connected', totalstation_screen.update_connected );
    this.events.add_callback( 'totalstation_connecting', this.connect_popup.bind(this) );
    // this.events.add_callback( 'totalstation_connected', function() {
    //   this.connecting = false;
    // }.bind(this) );
    this.events.add_callback( 'totalstation_connected', this.queue_retry.bind(this) );
    this.events.add_callback( 'totalstation_disconnected', totalstation_screen.update_connected );
    // this.events.add_callback( 'totalstation_disconnected', this.reconnect.bind(this) );
    this.events.add_callback( 'device_busy', this.recv_device_busy.bind( this ) );
  }

  instrument_guides_setup()
  {
    // Override

    this.instrument["guides"] = {
      "laser": {
        "exists": false,
        "state": undefined,
        "on": undefined,
        "off": undefined,
        "toggle": undefined
      },
      "light": {
        "exists": false,
        "state": undefined,
        "on": undefined,
        "off": undefined,
        "toggle": undefined
      }
    };
  }

  set connecting( v )
  {
    this._connecting = v;
    this.events.call_callback( 'totalstation_connecting', v );
  }
  get connecting()
  {
    return this._connecting;
  }

  set connected( v )
  {
    this._connected = v;
    this._check_ready();
  }
  get connected()
  {
    return this._connected;
  }

  set listening( v )
  {
    this._listening = v;
    this._check_ready();
  }
  get listening()
  {
    return this._listening;
  }

  get ready()
  {
    return this.connected && this.listening;
  }

  _check_ready()
  {
    if( !this.events )
      return;
    if( this.ready )
      this.events.call_callback( 'totalstation_connected' );
    else
      this.events.call_callback( 'totalstation_disconnected' );
  }

  get description_shown()
  {
    if( this.description )
      return this.description;
    else if( this.bt.name )
      return this.bt.name;
    else
      return "";
  }
  set description_shown( v )
  {
    this.description = v;
  }

  get description_shown_short()
  {
    let short_description = this.description_shown.substring( 0, 240 );
    short_description += short_description === this.description_shown ? '' : ' [............]';
    return short_description;
  }
  set description_shown_short( v )
  {
    this.description_shown = v;
  }
  get ack()
  {
    return hex2ascii( this.msg.ack );
  }
  get nack()
  {
    return hex2ascii( this.msg.nack );
  }
  get pos()
  {
    // Override
    throw "pos attribute not implemented";
  }
  set pos( v )
  {
    // Override
    throw "pos attribute not implemented";
  }
  get posS() // Spherical
  {
    // Override
    throw "posS attribute not implemented";
  }
  set posS( v ) // Spherical
  {
    // Override
    throw "posS attribute not implemented";
  }

  popup_open( header, callback_name, cancel_callback, id = "totalstation_connect_popup" )
  {
    const close = function()
    {
      this.popup_close();
      this.events.remove_callback( callback_name, "bound close" );
    };
    const bound_close = close.bind( this );
    const cancel = function()
    {
      bound_close();
      cancel_callback();
    };
    const bound_cancel = cancel.bind( this );
    this.events.add_callback( callback_name, bound_close );

    const buttons = [ ];
    if( cancel_callback )
      buttons.push( new PopButton( translate["Cancel"], bound_cancel, "red" ) );
    pop_generator.create_popup( header, "", buttons, cancel_callback ? bound_cancel : (() => {
    }), id, false, false, true, true );
  }
  popup_close(id = "totalstation_connect_popup")
  {
    popup_screen_controller.close( id );
  }

  connect( force = false, show_popup = true)
  {

    try
    {
      // if(!force && this.connecting)
      //   throw "Already connecting. Use force to connect anyway";

      this.setup_validate();

      // if( !force && this.connected && this.listening )
      if( !force && this.connected )
        throw "Already connected. Use force to connect anyway";

      // this.connecting = true;

      var data = {
        connect: true
      };
      this.setup( data );

      this._connected_this_session = true;

      this.connect_popup(show_popup);
    }
    catch( e )
    {
      console.error( e );
    }
  }

  connect_popup(show_popup = true)
  {
    if( !show_popup )
      return;

    const cancel_callback = function()
    {
      this.disconnect( false );
    };
    const action_on_connecting = function()
    {
      setTimeout(function () {
        if(!this.connecting && this.connected)
        {
          this.popup_close('confirm_popup');
        }
        else if(!this.connecting && !this.connected)
        {
          popup_screen_controller.confirm_popup(translate["Could not connect"], translate["Please make sure that the Total Station is turned on."], translate["OK"], false, function(){
            this.popup_close('confirm_popup');
            totalstation_screen.open();
          }.bind(this));
        }
        this.events.remove_callback( 'totalstation_connecting', 'bound action_on_connecting' );
      }.bind(this), 2000);
    }
    this.events.add_callback( 'totalstation_connecting', action_on_connecting.bind(this) );
    this.popup_open( translate["Connecting to %1s"].format( this.name ), "totalstation_connected", cancel_callback.bind( this ) );
  }

  disconnect( show_popup = true)
  {
    var data = {
      disconnect: true
    };
    this.track_robot_stop();
    logger.debug( "tssend ->", data );
    communication_controller.send( 'set_bluetooth_info', {
      robot: robot_controller.chosen_robot_id,
      bt_settings: data
    }, "all", 10 );

    if( show_popup )
      this.popup_open( translate["Disconnecting from %1s"].format( this.name ), "totalstation_disconnected", this.popup_close.bind(this) );
  }

  setup_validate()
  {
    if( !this.bt.mac )
      throw "No MAC address defined for total station";
    if( !this.bt.name )
      throw "No Hostname defined for total station";

    if( this.msg.ignoreheaders )
    {
      if( !this.msg.separator )
        throw "No msg separator defined for total station";
      if( !this.msg.ack )
        throw "No msg ACK defined for total station";
      if( !this.msg.nack )
        throw "No msg NACK defined for total station";
    }
    return true;
  }

  setup( extra =
  {})
  {
    try
    {
      this.setup_validate();

      let data = {
        mac: this.bt.mac,
        btname: this.bt.name,
        port: 1,
        reconnect: this.autoreconnect,
        ignoreheaders: this.msg.ignoreheaders,
        header: this.msg.header,
        separator: this.msg.separator,
        footer: this.msg.footer,
        ack: this.msg.ack,
        nack: this.msg.nack
      };
      data['apply'] = true;
      Object.keys( extra ).forEach( k => data[k] = extra[k] );

      this.setup_send( data );
      this.setup_position_parsing();

    }
    catch( e )
    {
      console.error( e );
    }
  }
  setup_position_parsing()
  {
    // Override
    console.warn("setup_position_parsing method not implemented");
  }
  setup_send( data )
  {
    try
    {
      logger.debug( "tssend ->", data );
      communication_controller.send( 'set_bluetooth_info', {
        robot: robot_controller.chosen_robot_id,
        bt_settings: data
      }, "all", 10 );
    }
    catch( e )
    {
      console.error( e );
    }
  }
  setup_new_ignoreheaders( ...headers )
  {
    if( headers.length === 0 )
      headers = [ "" ];

    this.msg.ignoreheaders = headers.join( ',' );

    const data = {
      ignoreheaders: this.msg.ignoreheaders,
      apply: true
    };

    this.setup_send( data );
  }

  send( msg )
  {
    if( !this.ready )
      throw "Total station not ready";

    logger.debug( "tssend ->", msg );
    const data = {
      robot: robot_controller.chosen_robot_id,
      msg: msg
    };
    communication_controller.send( 'bluetooth_device_send', data, "all", 10 );
  }

  queue_add( id, msg )
  {
    this.queue.push( [ id, msg ] );

    if( !this._queue_running )
    {
      this.queue_send();
    }
  }

  queue_got( msg )
  {
    const id = msg[0];
    if( this.queue.length > 0 && this.queue[0][0] === id )
    {
      this.queue_send_next();
    }
    else
    {
      throw "Unqueued message received";
    }
  }

  queue_send()
  {
    if( this.ready && this.queue.length > 0 )
    {
      this._queue_running = true;
      this.queue_retry_counter = 0;
      if( this.use_msg_retry_timer )
      {
        if( this.queue_retry_timer )
          clearTimeout(this.queue_retry_timer);
        this.queue_retry_timer = setTimeout(this.queue_retry.bind(this), 500);
      }
      this.send( this.queue[0][1] );
    }
    else
      this._queue_running = false;
  }

  queue_send_next()
  {
    this.queue.shift();
    this.queue_send();
  }

  queue_retry()
  {
    if( ++this.queue_retry_counter > 10 )
    {
      console.log( "Total Station message could not be sent. Removing msg", this.queue[0] );
      this._queue_running = false;
      popup_screen_controller.confirm_popup(
        translate["Could not contact Total Station"],
        translate["Please check the connection and try again."],
        translate["Retry"],
        translate["Disconnect"],
        function(){
          popup_screen_controller.close("confirm_popup");
          this.queue_retry_counter = 0;
          this.queue_send();
        }.bind(this), 
        function(){
          popup_screen_controller.close("confirm_popup");
          this.queue_clear();
          this.disconnect();
        }.bind(this),
        "dark",
        "red");
    }
    else
    {
      console.log( "Retrying Total Station message" );
      this.queue_send();
    }
    console.log("Total Station retry counter", this.queue_retry_counter )
  }

  queue_clear()
  {
    this.queue = [ ];
  }

  construct_msg( id, params )
  {
    // Override
    throw "Message constructor not defined";
  }

  send_cmd( id, ...params )
  {
    if( this.ready )
      this.queue_add( id, this.construct_msg( id, params ) );
    else
    {
      if( !this.connected )
        throw "Total station not connected";
      if( !this.listening )
        throw "Not listening to total station";
    }
  }

  recv( msg )
  {
    console.log( "tssend <-", msg );

    // Check for correct header
    if( msg[0] !== hex2ascii( this.msg.header ) )
      throw "Unknown header";

    // Remove header
    msg = msg.slice( 1 );

    // Split message into parts
    const parts = msg.split( hex2ascii( this.msg.separator ) );

    // Take action on message based on cmd ID
    this.recv_action( parts );

  }
  recv_action( msg )
  {
    console.log( "Received total station action msg:", msg );
    try
    {
      if( this.success( msg ) )
        this.queue_got( msg );
      if( this._recv_events.registered( msg[0] ) )
        this._recv_events.call_callback( msg[0], msg );
      else
      {
        console.warn( "Unknown msg header", msg );

        if(!this._connected_this_session)
        {
          this.output_to_app_disable();
          this.output_to_robot_disable();
        }

        if(this.queue.length > 0)
          this.queue_retry();
      }
    }
    catch( e )
    {
      console.error( e );
      this.error_handler( e );
    }
  }
  recv_device_busy( msg )
  {
    this.queue_retry();
  }
  recv_action_register( message_id, callback )
  {
    const getBaseName = function(name)
    {
      return name.split(" ").last()
    };

    if( !this._recv_events.callbacks[message_id] )
      this._recv_events.add_callback( message_id, callback.bind( this ) );
    else if( this._recv_events.callbacks[message_id].find(c=> (c===callback) || (getBaseName(c.name)===getBaseName(callback.name)) ) === undefined )
      this._recv_events.add_callback( message_id, callback.bind( this ) );
    else
      console.warn("Callback already added",message_id,callback.name);
  }
  success( msg )
  {
    if( msg[1] === this.ack )
      return true;
    else if( msg[1] === this.nack )
      throw msg;
    else
      return false;
  }

  msg_to_float( msg )
  {
    if( this.success( msg ) )
      return msg;
    else
      return msg.map( ( p, i ) => i === 0 ? p : parseFloat( p ) );
  }

  target_search_reset()
  {
    this.target_search = {
      state: false,
      lock: false,
      target: this._target.NONE,
      index: undefined
    };
  }
  target_search_begin( target = this._target.FIXPOINT, idx)
  {
    if( target !== this._target.ROBOT_AS_FIXPOINT)
      this._target_search_begin();
    this.target_search.target = target;
    this.target_search.state = true;
    this.target_search.index = idx;
  }
  _target_search_begin()
  {
    // Override
    throw "_target_search_begin method not implemented";
  }
  target_search_end()
  {
    if(this.target_search.target !== this._target.ROBOT_AS_FIXPOINT)
      this._target_search_end();
    this.target_search.state = false;
  }
  _target_search_end()
  {
    // Override
    throw "_target_search_end method not implemented";
  }
  target_lock( lock )
  {
    if( this.target_search.state )
    {
      const position = this.pos.copy();
      // if( this.target_search.target !== this._target.ROBOT_AS_FIXPOINT && lock )
      if( lock )
        this.output_to_app_disable();
      console.log( "Total Station got lock", position );
      if( (this.target_search.target === this._target.FIXPOINT || this.target_search.target === this._target.ROBOT_AS_FIXPOINT) && lock )
      {
        const check_index = function(fixpoints)
        {
          if( this.target_search.index !== undefined && this.target_search.index > fixpoints.length - 1 )
            throw "Target lock insert index does not exist";
          if( this.target_search.index !== undefined )
            fixpoints[this.target_search.index] = position;
          else
            if(!this.check_fixpoint(position)){
              fixpoints.push( position );
            }
        }.bind(this);
        check_index(!this.fixpoints.lock ? this.fixpoints.original : this.fixpoints.current);
        this.target_search_end();
        if(this.target_search.target !== this._target.ROBOT_AS_FIXPOINT)
        {
          this.output_to_robot_disable();
        }
      }
      else if( this.target_search.target === this._target.ROBOT )
      {
        if(totalstation_location_controller &&
           totalstation_location_controller.active &&
           totalstation_location_controller.active.fixpoints &&
           totalstation_location_controller.active.fixpoints.filter( p => !!p ).filter(p => p.dist_to_point(position) < 0.2).length > 0 &&
           !totalstation_location_controller.active.fixplate)
        {
          this.events.call_callback('target_lock_failed', {reason:"Robot Near Fixpoint"});
          console.warn("Target lock robot near fixpoint");
          return;
        }
        else if( lock )
        {
          this.target_search.state = false;
          this.robot_lock = true;
        }
      }
      // this.target_search_reset();
      console.warn("SEARCH LOCK", lock)
      this.events.call_callback( 'target_lock', lock );
      if( lock )
        this.target_search.target = this._target.NONE;
    }
    else
    {
      if( this.target_search.target === this._target.ROBOT )
      {
        this.robot_lock = lock;
        if(!lock)
          this.track_robot_start();
      }
    }
  }
  check_fixpoint(fixpoint){
    let result = false;
    if(this.fixpoints.original_length > 0){
      for(let i= 0; i < this.fixpoints.original_length; i++){
        if(fixpoint.dist_to_point(this.fixpoints.original[i]) < 0.02){
        result = true;
               //Notify user
              let list_of_buttons= [];
              list_of_buttons.push(new PopButton(translate["Ok"], ()=>{
                pop_generator.close();
              }, "dark"));
              pop_generator.create_popup_with_options({
                header: translate["The measured fixpoint already exists"],
                body: translate[`The measured fixpoint has the same position as one of the previous fixpoints in the setup.`],
                buttons: list_of_buttons,
                popup_id: "same_fixpoint_id"
              });
        }
      }
    }
    return result;
  }
  target_lock_failed( metadata = {} )
  {
    this.events.call_callback( 'target_lock', false );

    const create_popup = function(header, body, retry_action)
    {
      const buttons = [ ];
      const retry_callback = function()
      {
        this.popup_close( "get_fixpoint_popup" );
        retry_action();
      }.bind( this );
      buttons.push( new PopButton( translate["Retry"], retry_callback ) );
      const cancel_callback = function()
      {
        this.popup_close( "get_fixpoint_popup" );
        this.site_calibrate_stop();
      }.bind( this );
      buttons.push( new PopButton( translate["Cancel"], cancel_callback, "red" ) );

      if( false && this.instrument.guides.laser.exists )
      {
        const laser_callback = function()
        {
          if( !!this.instrument.guides.laser.state )
          {
            this.instrument.guides.laser.off();
            $( "#button_laser_toggle" ).removeClass( "chosen" ).addClass( "dark" ).text( translate["Turn Laser on"] );
          }
          else
          {
            this.instrument.guides.laser.on();
            $( "#button_laser_toggle" ).addClass( "chosen" ).removeClass( "dark" ).text( translate["Turn Laser off"] );
          }
        }.bind( this );
        buttons.push( new PopButton( !!this.instrument.guides.laser.state ? translate["Turn Laser off"] : translate["Turn Laser on"], laser_callback, !!this.instrument.guides.laser.state ? "chosen" : "dark", "button_laser_toggle" ) );
      }

      if( this.instrument.guides.light.exists )
      {
        const light_callback = function()
        {
          if( !!this.instrument.guides.light.state )
          {
            this.instrument.guides.light.off();
            $( "#button_light_toggle" ).removeClass( "chosen" ).addClass( "dark" ).text( translate["Turn Light on"] );
          }
          else
          {
            this.instrument.guides.light.on();
            $( "#button_light_toggle" ).addClass( "chosen" ).removeClass( "dark" ).text( translate["Turn Light off"] );
          }
        }.bind( this );
        buttons.push( new PopButton( !!this.instrument.guides.light.state ? translate["Turn Light off"] : translate["Turn Light on"], light_callback, !!this.instrument.guides.light.state ? "chosen" : "dark", "button_light_toggle" ) );
      }

      pop_generator.create_popup( header, body, buttons, false, "get_fixpoint_popup" );

    }.bind(this);

    if( this.target_search.target === this._target.ROBOT )
    {
      if(metadata.reason === "Robot Near Fixpoint")
      {
        this.track_robot_stop();
  
        // Create popup
        const header = translate["Found fixpoint instead of robot"];
        const body = translate["Please move the robot and try again."];
        create_popup(header, body, this.track_robot_start.bind(this));
      }
      else
      {
        this.robot_lock = false;
        this.track_robot_stop();

        // Create popup
        const header = translate["Could not find robot prism"];
        const body = translate["Please rotate the Total Station towards the robot and try again."];
        create_popup(header, body, this.track_robot_start.bind(this));
      }
    }
    else if( this.target_search.target === this._target.FIXPOINT )
    {
      this.output_to_robot_disable();
      this.output_to_app_disable();

      // Create popup
      const header = translate["Could not find prism"];
      const body = translate["Please rotate the Total Station towards the target and try again."];
      create_popup(header, body, this.fixpoints_get.bind(this));
    }

  }

  fixpoints_get( show_popup = true, insert_at_idx, custom_target)
  {
    if( show_popup )
    {
      const prism_target_lock = function( success )
      {
        if( success )
        {
          this.output_to_robot_disable();
          this.output_to_app_disable();
          this.target_search_end();
          this.events.remove_callback("target_lock", "bound prism_target_lock");
          this.popup_close( "searching_for_prism" );
        }
      };
      const bound_prism_target_lock = prism_target_lock.bind(this);
      const cancel_callback = function()
      {
        bound_prism_target_lock( true );
      };
      this.popup_open( translate["Searching for prism"], "target_lock", cancel_callback.bind(this), "searching_for_prism" );
      this.events.add_callback("target_lock", bound_prism_target_lock)
    }

    this.output_to_robot_enable();
    this.output_to_app_enable();
    this.target_search_begin( custom_target ? custom_target : this._target.FIXPOINT, insert_at_idx );
  }
  fixpoints_lock()
  {
    this.fixpoints.lock = true;
  }
  fixpoints_unlock()
  {
    this.fixpoints.lock = false;
  }
  fixpoints_active()
  {
    return this.fixpoints.lock ? this.fixpoints.current : this.fixpoints.original;
  }
  fixpoints_delete( idx )
  {
    if( this.fixpoints.lock )
    {
      if( this.fixpoints.current_length - 1 >= idx )
        this.fixpoints.current.splice( idx, 1 );
      else
        throw "Fixpoint index does not exist";
    }
    else
    {
      if( this.fixpoints.original_length - 1 >= idx )
        this.fixpoints.original.splice( idx, 1 );
      else
        throw "Fixpoint index does not exist";
    }
  }
  fixpoints_reset()
  {
    this.fixpoints.original = [ ];
    this.fixpoints.current = [ ];
    this.fixpoints.lock = false;
    this.fixpoints.active_index = -1;
    this.site_calibration = undefined;
  }
  fixpoints_from_current()
  {
    this.fixpoints.original = Array.from( this.fixpoints.current );
    this.fixpoints.current = [ ];
    this.fixpoints.lock = true;
  }
  fixpoints_to_current()
  {
    this.fixpoints.current = Array.from( this.fixpoints.original );
  }
  fixpoints_move_to( index = 0)
  {
    if( this.fixpoints.original_length === 0 )
      throw "No fixpoints collected";

    this.fixpoints.active_index = index;

    this.pos = this.fixpoints.original[this.fixpoints.active_index];
  }
  fixpoints_move_to_next()
  {
    let index = this.fixpoints.active_index + 1;
    if( index > this.fixpoints.original_length - 1 )
    {
      index = 0;
      this.events.call_callback( 'fixpoints_move_reached_end' );
      return;
    }
    this.fixpoints_move_to( index );
  }
  site_calibrate_reset()
  {
    this.site_calibration = undefined;
    this.fixpoints.current = [ ];
  }
  site_calibrate_start()
  {
    if( this.fixpoints.original_length < 3 )
      throw "Not enough fixpoints to site calibrate";
    if( this.site_calibration )
      throw "Site calibration exists";

    console.log( "Site calibration start" );
    this.site_calibrating = true;

    const site_calibrate_fixpoints_get = function()
    {
      this.fixpoints_get( false );
    };

    this.events.add_callback( 'moved', site_calibrate_fixpoints_get.bind( this ) );
    this.events.add_callback( 'target_lock', this.site_calibrate_target_lock.bind( this ) );
    this.events.add_callback( 'fixpoints_move_reached_end', this.site_calibrate_stop.bind( this ) );

    this.popup_open( translate["Collecting prisms automatically"], "fixpoints_move_reached_end", this.site_calibrate_stop.bind( this ) );

    this.fixpoints_move_to( 0 );
  }
  site_calibrate_target_lock( success )
  {
    if( success )
    {
      console.log( "Site calibration got fixpoint, moving to next" );
      this.fixpoints_move_to_next();
    }
  }
  site_calibrate_stop()
  {
    console.log( "Site calibration stop" );
    this.site_calibrating = false;

    this.events.remove_callback( 'moved', 'bound site_calibrate_fixpoints_get' );
    this.events.remove_callback( 'target_lock', this.site_calibrate_target_lock.bind( this ) );
    this.events.remove_callback( 'fixpoints_move_reached_end', this.site_calibrate_stop.bind( this ) );

    this.output_to_app_disable();
    this.target_search_end();
    this.output_to_robot_disable();

    if( this.fixpoints.original_length === this.fixpoints.current_length )
    {
      try
      {
        this.site_calibrate_calculate_matrix();
      }
      catch( e )
      {
        this.site_calibrate_failed( e );
      }
    }
  }
  site_calibrate_calculate_matrix()
  {
    this.site_calibration = new AffineTransform(this.fixpoints.original, this.fixpoints.current).sort().findTerms();
  }
  site_calibrate_failed( e )
  {
  }

  track_robot_start()
  {
    this.track_robot_popup();
    this.output_to_robot_enable( true );
    this.output_to_app_enable();
    this.target_search_begin( this._target.ROBOT );
  }
  track_robot_stop()
  {
    this.robot_lock = false;
    this.target_search_end();
    this.target_search_reset();
    this.output_to_robot_disable();
    this.output_to_app_disable();
  }
  track_robot_popup()
  {
    const robot_target_lock = function( success )
    {
      if( success )
      {
        this.output_to_app_disable();
        this.events.remove_callback("target_lock", "bound robot_target_lock");
        this.popup_close( "searching_for_robot" );
      }
    }

    const cancel_callback = function()
    {
      this.track_robot_stop();
      this.events.remove_callback("target_lock", "bound robot_target_lock");
      this.popup_close( "searching_for_robot" );
    }
    this.popup_open( translate["Searching for robot"], "target_lock", cancel_callback.bind(this), "searching_for_robot" );

    this.events.add_callback("target_lock", robot_target_lock.bind(this))
  }

  output_to_app_enable()
  {
    this._output_to_app_enable();
  }
  _output_to_app_enable()
  {
    // Override
    throw "_output_to_app_enable method not implemented";
  }
  output_to_app_disable()
  {
    this._output_to_app_disable();
  }
  _output_to_app_disable()
  {
    // Override
    throw "_output_to_app_disable method not implemented";
  }
  output_to_robot_enable(high_freq = false)
  {
    this._output_to_robot_enable(high_freq);
  }
  _output_to_robot_enable(high_freq = false)
  {
    // Override
    throw "_output_to_robot_enable method not implemented";
  }
  output_to_robot_disable()
  {
    this._output_to_robot_disable();
  }
  _output_to_robot_disable()
  {
    // Override
    throw "_output_to_robot_disable method not implemented";
  }

  error_handler( e )
  {
    throw e;
  }

}
;