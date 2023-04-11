/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global communication_controller, robot_controller, robot_communication_settings_screen, translate, math, NaN, popup_screen_controller */

class TotalStation_LN150 extends TotalStation
{
  constructor( name, options =
  {})
  {
    options['msg'] = {};
    // options.msg['ignoreheaders'] = "";
    options.msg['ignoreheaders'] = "@MFILD,@MTILT";
    options.msg['parseheaders'] = "@MFILD";
    options.msg['header'] = "40";
    options.msg['separator'] = "2C";
    options.msg['footer'] = "0D";
    options.msg['ack'] = "06";
    options.msg['nack'] = "15";

    super( name, options );

    this.measure_length = 10;
    if( !options.measure )
      options.measure = {};
    this.measure = {};
    this.measure['Slope distance'] = new CircularBuffer( this.measure_length, options.measure['Slope distance'] );
    this.measure['Vertical angle'] = new CircularBuffer( this.measure_length, options.measure['Vertical angle'] );
    this.measure['Horizontal angle'] = new CircularBuffer( this.measure_length, options.measure['Horizontal angle'] );
    this.measure['Layout status'] = new CircularBuffer( this.measure_length, options.measure['Layout status'] );
    this.measure['Auto tracking status'] = new CircularBuffer( this.measure_length, options.measure['Auto tracking status'] );
    this.measure['Rotation status'] = new CircularBuffer( this.measure_length, options.measure['Rotation status'] );
    this.measure['Tilt correction status'] = new CircularBuffer( this.measure_length, options.measure['Tilt correction status'] );
    this.measure['Auto leveling status'] = new CircularBuffer( this.measure_length, options.measure['Auto leveling status'] );
    this.measure['Average window'] = new CircularBuffer( this.measure_length, options.measure['Average window'] );
    this.measure['Vertical angle status'] = new CircularBuffer( this.measure_length, options.measure['Vertical angle status'] );
    this.measure['X axis'] = new CircularBuffer( this.measure_length, options.measure['X axis'] );
    this.measure['Y axis'] = new CircularBuffer( this.measure_length, options.measure['Y axis'] );
    this.measure['Internal temperature'] = new CircularBuffer( this.measure_length, options.measure['Internal temperature'] );
    this.measure['Voltage level'] = new CircularBuffer( this.measure_length, options.measure['Voltage level'] );

    this.instrument['TSShield'] = {};
  }

  static load( stored )
  {
    const m = new TotalStation_LN150( stored.name, stored );
    return m;
  }

  copy()
  {
    return TotalStation_LN150.load( this );
  }
  get pos()
  {
    return this.posS.toVector3();
  }
  set pos( v )
  {
    this.posS = v.toVectorS();
  }
  get posS()
  {
    return new VectorS( this.measure['Slope distance'].last(),
    this.measure['Vertical angle'].last() * 2 * math.pi,
    this.measure['Horizontal angle'].last() * 2 * math.pi * -1
    );
  }
  set posS( vs )
  {
    vs.theta = vs.theta / (2 * math.pi);
    vs.phi = 1 - (vs.phi < 0 ? (2 * math.pi + vs.phi) : vs.phi) / (2 * math.pi);
    this.cmd_rspos( 0, 1, vs.theta, 1, vs.phi );
  }
  construct_msg( id, params = [])
  {
    if( !id )
      throw "ID required for message";
    params.unshift( id );
    params = params.map( p => {
      if( typeof p === "number" && !Number.isInteger( p ) )
        return p.toFixed( 8 );
      else
        return p;
    } );
    return hex2ascii( this.msg.header ) + params.reduce( ( s, c ) => s + c + hex2ascii( this.msg.separator ), "" ) + hex2ascii( this.msg.footer );
  }
  _target_search_begin()
  {
    this.cmd_rtrck( 0 );
  }
  _target_search_end()
  {
    this.cmd_smotr();
  }
  _output_to_app_enable()
  {
    this.setup_new_ignoreheaders();
  }
  _output_to_app_disable()
  {
    this.setup_new_ignoreheaders( "@MFILD", "@MTILT" );
  }
  _output_to_robot_enable(high_freq = false)
  {
    let freq;
    switch(totalstation_screen._use_data_freq)
    {
      case 20: freq = 0; break;
      case 10: freq = 1; break;
      default: freq = 2;
    }
    this.cmd_mfild( high_freq ? freq : 2, 0 );
  }
  _output_to_robot_disable()
  {
    this.cmd_sfild();
  }
  setup_position_parsing()
  {
    const data = {
      parse_headers: this.msg.parseheaders,
      header: this.msg.header,
      separator: this.msg.separator,
      footer: this.msg.footer,
      phi_sign: -1
    };

    communication_controller.send( 'set_reconf_topic', {
      robot: robot_controller.chosen_robot_id,
      topic: '/platform/gnss_antenna/msg_sph',
      config: data
    }, "all", 10 );
  }

  instrument_guides_setup()
  {
    // Override

    this.instrument["guides"] = {
      "laser": {
        "exists": true,
        "state": undefined,
        "on": this.cmd_llpon.bind( this ),
        "off": this.cmd_llpof.bind( this )
      },
      "light": {
        "exists": true,
        "state": undefined,
        "on": this.cmd_lglon.bind( this ),
        "off": this.cmd_lglof.bind( this )
      }
    };
  }

  /*
   * COMMANDS
   */

  /**
   * MFILD – Slope distance and encoder angle repeat measurement and output start request.
   * @param {Number} output_rate Output rate
   * @param {Number} average_window Average number of times
   * @returns {undefined}
   */
  cmd_mfild( output_rate = 2,
    average_window = 0
    )
  {
    const output_rates = [
      0, // 50ms (20Hz)
      1, // 100ms (10Hz)
      2 // 200ms (5Hz)
    ];
    const average_windows = [
      0, // single data
      1, // The average of two
      2, // The average of four (default)
      3, // The average of ten
      4 // The average of 20
    ];

    if( !(output_rate in output_rates) )
      throw "Output rate invalid (P1)";
    if( !(average_window in average_windows) )
      throw "Average window invalid (P2)";

    this.recv_action_register( 'MFILD', this.got_mfild );
    this.send_cmd( 'MFILD', output_rate, average_window );
//    this.send_cmd( `@MFILD,${output_rate},${average_window},\r` );
  }
  got_mfild( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 11 )
      throw "Not enough input fields";

    if( msg[5][0] === "E" )
      this.error_handler( msg[5] );

    msg = this.msg_to_float( msg );
    this.measure['Slope distance'].push( msg[1] );
    this.measure['Vertical angle'].push( msg[2] );
    this.measure['Horizontal angle'].push( msg[3] );
    this.measure['Layout status'].push( msg[4] );
    this.measure['Auto tracking status'].push( msg[5] );
    this.measure['Rotation status'].push( msg[6] );
    this.measure['Tilt correction status'].push( msg[7] );
    this.measure['Auto leveling status'].push( msg[8] );
    this.measure['Average window'].push( msg[9] );
    this.measure['Vertical angle status'].push( msg[10] );

    if( this.measure['Auto tracking status'].last() === 2 )
    {
      if( !isNaN( this.measure['Slope distance'].last() ) && !isNaN( this.measure['Vertical angle'].last() ) && !isNaN( this.measure['Horizontal angle'].last() ) )
      {
        this.target_lock( true );
      }
    }
    else if( this.measure['Auto tracking status'].last() === 3 )
    {
      this.target_lock( false )
    }

    this.events.call_callback("got_position");

  }

  /**
   * MTILT – Tilt angle repeat measurement and output start request.
   * @param {type} output_rate
   * @returns {undefined}
   */
  cmd_mtilt( output_rate = 2)
  {
    const output_rates = [
      0, // 50ms (20Hz)
      1, // 100ms (10Hz)
      2 // 200ms (5Hz)
    ];
    if( !(output_rate in output_rates) )
      throw "Output rate invalid (P1)";
    this.recv_action_register( 'MTILT', this.got_mtilt );
    this.send_cmd( 'MTILT', output_rate );
  }
  got_mtilt( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 4 )
      throw "Not enough input fields";

    msg = this.msg_to_float( msg );
    this.measure['X axis'].push( msg[1] );
    this.measure['Y axis'].push( msg[2] );
    this.measure['Internal temperature'].push( msg[3] );
  }

  /**
   * MBATT – Battery level repeat measurement and output start request.
   * @returns {undefined}
   */
  cmd_mbatt()
  {
    this.recv_action_register( 'MBATT', this.got_mbatt );
    this.send_cmd( 'MBATT' );
  }
  got_mbatt( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    msg = this.msg_to_float( msg );

    const cases = {
      5: (1 - 0.9) / 2 + 0.9,
      4: (0.9 - 0.5) / 2 + 0.5,
      3: (0.5 - 0.1) / 2 + 0.1,
      2: (0.1 - 0.0) / 2 + 0.0,
      1: 0.0,
      0: undefined
    };

    this.measure['Voltage level'].push( cases[msg[1]] );
  }

  /**
   * ONUMB – Serial number and firmware versions output.
   * @returns {undefined}
   */
  cmd_onumb()
  {
    this.recv_action_register( 'ONUMB', this.got_onumb );
    this.send_cmd( 'ONUMB' );
  }
  got_onumb( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 9 )
      throw "Not enough input fields";

    this.instrument['Model name'] = msg[1];
    this.instrument['Serial number'] = msg[2];
    this.instrument['DCPU version'] = msg[3];
    this.instrument['EDM version'] = msg[4];
    this.instrument['MD version'] = msg[5];
    this.instrument['TIPU version'] = msg[6];
    this.instrument['SLCPU version'] = msg[7];
    this.instrument['FPGA version'] = msg[8];
  }

  /**
   * OCOND – Instrument conditions output.
   * @returns {undefined}
   */
  cmd_ocond()
  {
    this.recv_action_register( 'OCOND', this.got_ocond );
    this.send_cmd( 'OCOND' );
  }
  got_ocond( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 6 )
      throw "Not enough input fields";

    if( !this.error_codes )
      this.error_handler_setup_codes();

    const handle_error = function( code )
    {
      if( code === "0" )
        return {
          code: "0",
          message: "Normal",
          meaning: "No error"
        };
      else
        return error_codes[code];
    };

    this.instrument['DCPU status'] = handle_error( msg[1] );
    this.instrument['EDM status'] = handle_error( msg[2] );
    this.instrument['MD status'] = handle_error( msg[3] );
    this.instrument['TIPU status'] = handle_error( msg[4] );
    this.instrument['SLCPU status'] = handle_error( msg[5] );
  }

  /**
   * OSTNG – Instrument settings output.
   * @returns {undefined}
   */
  cmd_ostng()
  {
    this.recv_action_register( 'OSTNG', this.got_ostng );
    this.send_cmd( 'OSTNG' );
  }
  got_ostng( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 3 )
      throw "Not enough input fields";

    msg = this.msg_to_float( msg );

    this.instrument['Buzzer'] = msg[1] === 0 ? "OFF" : "ON";

    const apo = {
      0: "OFF",
      1: "5 minutes",
      2: "10 minutes",
      3: "20 minutes",
      4: "30 minutes",
      5: "60 minutes"
    };

    this.instrument['Auto power OFF'] = apo[msg[2]];
  }

  /**
   * OWSET – Wireless LAN configuration parameter output.
   * @param {Number} mode
   * @param {Number} type
   * @returns {undefined}
   */
  cmd_owset( mode, type )
  {
    const modes = [
      1, // Mode A
      2 // Mode B
    ];
    if( !(mode in modes) )
      throw "Mode invalid (P1)";

    const types = [
      1, // IP settings
      2, // IP address
      3, // Net Mask
      4, // SSID
      5, // Security
      6, // Security key (depend on 5)
      7, // Security key (depend on 5)
      8, // Channel number (only if [P1] = 1)
      9 // Mac address
    ];
    if( !(type in types) || (mode === 2 && type === 8) )
      throw "Type invalid (P2)";

    this.recv_action_register( 'OWSET', this.got_owset );
    this.send_cmd( 'OWSET', mode, type );
  }
  got_owset( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 4 )
      throw "Not enough input fields";

    const mode = parseInt( msg[1] );
    const type = parseInt( msg[2] );

    if( !this.wlan )
      this.wlan = {};

    const ip_settings = {
      0: 'Static',
      1: 'DHCP'
    };
    const security = {
      0: 'No security',
      1: 'WEP',
      2: 'WPA',
      3: 'WPA2'
    };

    switch( type )
    {
      case 1:
        this.wlan['IP settings'] = ip_settings( parseInt( msg[3] ) );
        break;
      case 2:
        this.wlan['IP address'] = msg[3];
        break;
      case 3:
        this.wlan['Net Mask'] = msg[3];
        break;
      case 4:
        this.wlan['SSID'] = msg[3];
      case 5:
        this.wlan['Security'] = security( parseInt( msg[3] ) );
        break;
      case 6:
      case 7:
        this.wlan['Security key'] = msg[3];
        break;
      case 8:
        this.wlan['Channel'] = parseInt( msg[3] );
        break;
      case 9:
        this.wlan['Mac address'] = msg[3];
    }
  }

  /**
   * ISTNG – Instrument settings input.
   * @param {Number} buzzer
   * @param {Number} auto_power_off
   * @returns {undefined}
   */
  cmd_istng( buzzer = 1, auto_power_off = 0)
  {
    const buzzers = [
      0, // OFF
      1 // ON (default)
    ];
    if( !(buzzer in buzzers) )
      throw "Buzzer invalid (P1)";

    const apos = [
      0, // OFF
      1, // 5 minutes
      2, // 10 minutes
      3, // 20 minutes
      4, // 30 minutes
      5 // 60 minutes
    ];
    if( !(auto_power_off in apos) )
      throw "Auto power off invalid (P2)";

    this.recv_action_register( 'ISTNG', this.got_istng );
    this.send_cmd( 'ISTNG', buzzer, auto_power_off );
  }
  got_istng( msg )
  {
    if( this.success( msg ) )
      this.cmd_ostng();
  }

  /**
   * IHANG – Set horizontal angle.
   * @param {Number} horizontal_angle
   * @param {Number} horizontal_angle_offset
   * @returns {undefined}
   */
  cmd_ihang( horizontal_angle = 0.0,
    horizontal_angle_offset)
  {
    if( horizontal_angle < 0.0 || horizontal_angle > 0.99999999 )
      throw "Horizontal angle invalid (P1)";
    if( horizontal_angle_offset < 0.0 || horizontal_angle_offset > 0.99999999 )
      throw "Horizontal angle offset value invalid (P2)";

    console.log( 'This command may be missing some logic' );

    this.recv_action_register( 'IHANG', this.got_ihang );
    this.send_cmd( 'IHANG', horizontal_angle, horizontal_angle_offset );
  }
  got_ihang( msg )
  {
  }

  /**
   * ITRGT – Target type settings input.
   * @param {Number} prism_type
   * @param {Number} prism_diameter
   * @param {Number} prism_constant
   * @returns {undefined}
   */
  cmd_itrgt( prism_type = 1,
    prism_diameter = 34, // Integer (unit: mm)
    prism_constant = - 7 // Integer (unit: mm)
    )
  {
    const prism_types = [
      0, // Round prism
      1 // 360 Prism(default)
    ];
    if( !(prism_type in prism_types) )
      throw "Prism type invalid (P1)";

    if( !Number.isInteger( prism_diameter ) || prism_diameter < 1 || prism_diameter > 300 )
      throw "Prism diameter invalid (P2)";

    if( !Number.isInteger( prism_constant ) || prism_constant < -99.9 || prism_constant > 99.9 )
      throw "Prism constant invalid (P3)";

    this.recv_action_register( 'ITRGT', this.got_itrgt );
    this.send_cmd( 'ITRGT', prism_type, prism_diameter, prism_constant );
  }
  got_itrgt( msg )
  {
  }

  /**
   * IATMS – Atmospheric data input.
   * @param {Number} temperature
   * @param {Number} pressure
   * @returns {undefined}
   */
  cmd_iatms( temperature = 15, // Integer (unit: degC)
    pressure = 1013 // Integer (unit: hPa)
    )
  {
    if( !Number.isInteger( temperature ) || temperature < -30 || temperature > 60 )
      throw "Temperature invalid (P1)";

    if( !Number.isInteger( pressure ) || pressure < 500 || pressure > 1400 )
      throw "Pressure invalid (P2)";

    this.recv_action_register( 'IATMS', this.got_iatms );
    this.send_cmd( 'IATMS', temperature, pressure );
  }
  got_iatms( msg )
  {
  }

  /**
   * ITLCR – Enable/disable the tilt correction.
   * @param {Number} tilt_correction
   * @returns {undefined}
   */
  cmd_itlcr( tilt_correction = 1)
  {
    const tilt_corrections = [
      0, // No
      1 // Yes (default)
    ];
    if( !(tilt_correction in tilt_corrections) )
      throw "Tilt correction invalid (P1)";

    this.recv_action_register( 'ITLCR', this.got_itlcr );
    this.send_cmd( 'ITLCR', tilt_correction );
  }
  got_itlcr( msg )
  {
  }

  /**
   * IWSET – Wireless LAN configuration parameter input.
   * @param {Number} mode
   * @param {Number} type
   * @param {(Number|String)} setting
   * @returns {undefined}
   */
  cmd_iwset( mode, type, setting )
  {
    const modes = [
      1, // Mode A
      2 // Mode B
    ];
    if( !(mode in modes) )
      throw "Mode invalid (P1)";

    const types = [
      1, // IP settings
      2, // IP address
      3, // Net Mask
      4, // SSID
      5, // Security
      6, // Security key (depend on 5)
      7, // Security key (depend on 5)
      8, // Channel number (only if [P1] = 1)
      9 // Mac address
    ];
    if( !(type in types) || (mode === 1 && type < 5) || (mode === 2 && type > 7) )
      throw "Type invalid (P2)";

    const ip_settings = {
      0: 'Static',
      1: 'DHCP'
    };
    const security = {
      0: 'No security',
      1: 'WEP',
      2: 'WPA',
      3: 'WPA2'
    };

    switch( setting )
    {
      case 1:
        if( !(setting in ip_settings) )
          throw "Settings invalid (P3)";
        break;
      case 2:
      case 3:
        if( setting.split( '.' ).map( n => parseInt( n ) ).filter( n => n < 0 || n > 255 || !Number.isInteger( n ) ).length > 0 )
          throw "Settings invalid (P3)";
        break;
      case 4:
        if( setting.length > 32 )
          throw "Settings invalid (P3)";
        break;
      case 5:
        if( !(setting in security) )
          throw "Settings invalid (P3)";
        break;
      case 6:
        console.log( "No validation for security string available" );
        break;
      case 7:
        if( (setting.length < 8 || setting.length > 64) )
          throw "Settings invalid (P3)";
        break;
      case 8:
        if( setting < 1 || setting > 11 )
          throw "Settings invalid (P3)";
        break;
    }

    this.recv_action_register( 'IWSET', this.got_itlcr );
    this.send_cmd( 'IWSET', mode, type, setting );
  }
  got_iwset( msg )
  {
  }

  /**
   * LPWOF – Power off.
   * @returns {undefined}
   */
  cmd_lpwof(  )
  {
    this.recv_action_register( 'LPWOF', this.got_lpwof );
    this.send_cmd( 'LPWOF' );
  }
  got_lpwof( msg )
  {
  }

  /**
   * LSLON – Self leveling start request.
   * @returns {undefined}
   */
  cmd_lslon(  )
  {
    this.recv_action_register( 'LSLON', this.got_lslon );
    this.send_cmd( 'LSLON' );
  }
  got_lslon( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument['Self leveling'] = true;
    else
      this.error_handler( msg[1] );
  }

  /**
   * LSLOF – Self leveling stop request.
   * @returns {undefined}
   */
  cmd_lslof(  )
  {
    this.recv_action_register( 'LSLOF', this.got_lslof );
    this.send_cmd( 'LSLOF' );
  }
  got_lslof( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument['Self leveling'] = false;
    else
      this.error_handler( msg[1] );
  }

  /**
   * LGLON – Guide light on.
   * @param {Number} pattern
   * @param {Number} power
   * @returns {undefined}
   */
  cmd_lglon( pattern = 0, power = 2)
  {
    const patterns = [
      0, // pattern 1
      1 // pattern 2
    ];
    if( !(pattern in patterns) )
      throw "Pattern invalid (P1)";

    if( power < 0 || power > 2 )
      throw "Power invalid (P2)";

    this.recv_action_register( 'LGLON', this.got_lglon );
    this.send_cmd( 'LGLON', pattern, power );
  }
  got_lglon( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument.guides.light.state = true;
    else
      this.error_handler( msg[1] );
  }

  /**
   * LGLOF – Guide light off.
   * @returns {undefined}
   */
  cmd_lglof(  )
  {
    this.recv_action_register( 'LGLOF', this.got_lglof );
    this.send_cmd( 'LGLOF' );
  }
  got_lglof( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument.guides.light.state = false;
    else
      this.error_handler( msg[1] );
  }

  /**
   * LLPON – Laser pointer on.
   * @param {Number} pattern
   * @param {Number} power
   * @returns {undefined}
   */
  cmd_llpon( pattern = 0, power = 1)
  {
    const patterns = [
      0, // Lighting (default)
      1 // Blinking
    ];
    if( !(pattern in patterns) )
      throw "Pattern invalid (P1)";

    if( power < 0 || power > 1 )
      throw "Power invalid (P2)";

    this.recv_action_register( 'LLPON', this.got_llpon );
    this.send_cmd( 'LLPON', pattern, power );
  }
  got_llpon( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument.guides.laser.state = true;
    else
      this.error_handler( msg[1] );
  }

  /**
   * LLPOF – Laser pointer off.
   * @returns {undefined}
   */
  cmd_llpof(  )
  {
    this.recv_action_register( 'LLPOF', this.got_llpof );
    this.send_cmd( 'LLPOF' );
  }
  got_llpof( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument.guides.laser.state = false;
    else
      this.error_handler( msg[1] );
  }

  /**
   * RSPOS – Rotate to specified angle.
   * @param {Number} angle_input_type
   * @param {Number} vertical_angle_toggle
   * @param {Number} vertical_angle
   * @param {Number} horizontal_angle_toggle
   * @param {Number} horizontal_angle
   * @returns {undefined}
   */
  cmd_rspos( angle_input_type, vertical_angle_toggle, vertical_angle, horizontal_angle_toggle, horizontal_angle )
  {
    const angle_input_types = [
      0, // Absolute angle
      1 // Relative angle
    ];
    if( !(angle_input_type in angle_input_types) )
      throw "Angle input type invalid (P1)";

    const toggles = [
      0, // OFF
      1 // ON
    ];
    if( !(vertical_angle_toggle in toggles) )
      throw "Vertical angle ON/OFF invalid (P2)";

    if( !(horizontal_angle_toggle in toggles) )
      throw "Vertical angle ON/OFF invalid (P4)";

    if( angle_input_type === 0 )
    {
      if( vertical_angle > 0.33333333 || vertical_angle < 0.09722222 )
        throw "Vertical angle invalid (P3)";
      if( horizontal_angle < 0.0 || horizontal_angle > 0.99999999 )
        throw "Vertical angle invalid (P5)";
    }
    else if( angle_input_type === 1 )
    {
      if( vertical_angle < -0.23611111 || vertical_angle > 0.23611111 )
        throw "Vertical angle invalid (P3)";
      if( horizontal_angle < -0.5 || horizontal_angle > 0.5 )
        throw "Vertical angle invalid (P5)";
    }

    this.recv_action_register( 'RSPOS', this.got_rspos );
    this.send_cmd( 'RSPOS', angle_input_type, vertical_angle_toggle, vertical_angle, horizontal_angle_toggle, horizontal_angle );
  }
  got_rspos( msg )
  {
    if( this.success( msg ) )
    {
      this.moving = true;
      this.events.call_callback( 'moving' );
      return;
    }

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
    {
      this.moving = false;
      this.events.call_callback( 'moved' );
    }
    else
      this.error_handler( msg[1] );
  }

  /**
   * RSSPD – Rotate at specified velocity
   * @param {Number} vertical_velocity
   * @param {Number} horizontal_velocity
   * @returns {undefined}
   */
  cmd_rsspd( vertical_velocity, horizontal_velocity )
  {

    /*
     * 0  : Not rotate
     * ±1 : ±1/32 [deg./sec.]
     * ±2 : ±1/16 [deg./sec.]
     * ±3 : ±1/8  [deg./sec.]
     * ±4 : ±1/4  [deg./sec.]
     * ±5 : ±1/2  [deg./sec.]
     * ±6 : ±1    [deg./sec.]
     * ±7 : ±2    [deg./sec.]
     * ±8 : ±4    [deg./sec.]
     * ±9 : ±8    [deg./sec.]
     * ±10: ±16   [deg./sec.]
     * ±11: ±32   [deg./sec.]
     * ±12: ±64   [deg./sec.]
     */

    if( vertical_velocity < -12 || vertical_velocity > 12 )
      throw "Vertical velocity invalid (P1)";
    if( horizontal_velocity < -12 || horizontal_velocity > 12 )
      throw "Horizontal velocity invalid (P2)";

    this.recv_action_register( 'RSSPD', this.got_rsspd );
    this.send_cmd( 'RSSPD', vertical_velocity, horizontal_velocity );
  }
  got_rsspd( msg )
  {
  }

  /**
   * RTRCK – Auto Tracking start request.
   * @param {Number} search_type
   * @returns {undefined}
   */
  cmd_rtrck( search_type )
  {
    const search_types = [
      0, // Global search
      1 // Vertical search
    ];

    if( !(search_type in search_types) )
      throw "Search type invalid (P1)";

    this.recv_action_register( 'RTRCK', this.got_rtrck );
    this.send_cmd( 'RTRCK', search_type );
  }
  got_rtrck( msg )
  {
  }

  /**
   * RLAYO – Layout start request.
   * @param {Number} horizontal_angle
   * @param {Number} distance
   * @returns {undefined}
   */
  cmd_rlayo( horizontal_angle, distance )
  {
    if( horizontal_angle < 0.0 || horizontal_angle > 0.99999999 )
      throw "Horizontal angle invalid (P1)";
    if( distance < 0.0 || distance > 1000.000 )
      throw "Distance invalid (P2)";

    this.recv_action_register( 'RLAYO', this.got_rlayo );
    this.send_cmd( 'RLAYO', horizontal_angle, distance );
  }
  got_rlayo( msg )
  {
  }

  /**
   * SFILD – Slope distance and encoder angle repeat measurement and output stop request
   * @returns {undefined}
   */
  cmd_sfild()
  {
    this.recv_action_register( 'SFILD', this.got_sfild );
    this.send_cmd( 'SFILD' );
  }
  got_sfild( msg )
  {
  }

  /**
   * STILT – Tilt angle repeat measurement and output stop request.
   * @returns {undefined}
   */
  cmd_stilt()
  {
    this.recv_action_register( 'STILT', this.got_stilt );
    this.send_cmd( 'STILT' );
  }
  got_stilt( msg )
  {
  }

  /**
   * SBATT – Battery level repeat measurement and output stop request
   * @returns {undefined}
   */
  cmd_sbatt()
  {
    this.recv_action_register( 'SBATT', this.got_sbatt );
    this.send_cmd( 'SBATT' );
  }
  got_sbatt( msg )
  {
  }

  /**
   * SMOTR – Rotation stop request.
   * @returns {undefined}
   */
  cmd_smotr()
  {
    this.recv_action_register( 'SMOTR', this.got_smotr );
    this.send_cmd( 'SMOTR' );
  }
  got_smotr( msg )
  {
  }

  /**
   * MWEBS – Confirmation of user registration and status output
   * @returns {undefined}
   */
  cmd_mwebs()
  {
    this.recv_action_register( 'MWEBS', this.got_mwebs );
    this.send_cmd( 'MWEBS', 0 );
  }
  got_mwebs( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 5 )
      throw "Not enough input fields";

    const statuses = {
      0: "During connection process",
      1: "Confirmation process",
      2: "Confirmation OK"
    };

    this.instrument['TSShield']['User Registration Confirmation'] = {};
    this.instrument['TSShield']['User Registration Confirmation']['Status'] = statuses[parseInt( msg[2] )];
    this.instrument['TSShield']['User Registration Confirmation']['Cellular carrier'] = msg[3];
    this.instrument['TSShield']['User Registration Confirmation']['Cellular signal strength'] = msg[4];
  }

  /**
   * OTSST – TSShield status output.
   * @returns {undefined}
   */
  cmd_otsst()
  {
    this.recv_action_register( 'OTSST', this.got_otsst );
    this.send_cmd( 'OTSST' );
  }
  got_otsst( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 8 )
      throw "Not enough input fields";

    msg = this.msg_to_float( msg );

    this.instrument['TSShield']['TSShield'] = msg[1] === 0 ? "Disable (None)" : "Enable";
    this.instrument['TSShield']['User registration'] = msg[2] === 0 ? "None (enable Demo mode)" : "Registered";
    this.instrument['TSShield']['Software update data'] = msg[3] === 0 ? "None" : msg[3];
    this.instrument['TSShield']['Product status'] = msg[4] === 0 ? "Normal" : (msg[4] === 1 ? "Tracking" : "Lock");
    this.instrument['TSShield']['Lock Alert'] = msg[5] === 0 ? "None" : "Yes";
    this.instrument['TSShield']['Time until lock hour'] = msg[6];
    this.instrument['TSShield']['Time until lock minute'] = msg[7];
  }

  /**
   * OTSID – TSShield ID output.
   * @returns {undefined}
   */
  cmd_otsid()
  {
    this.recv_action_register( 'OTSID', this.got_otsid );
    this.send_cmd( 'OTSID' );
  }
  got_otsid( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    this.instrument['TSShield']['ID'] = msg[1];
  }

  /**
   * IKYCD – key code input.
   * @param {String} key_code
   * @returns {undefined}
   */
  cmd_ikycd( key_code )
  {
    this.recv_action_register( 'IKYCD', this.got_ikycd );
    this.send_cmd( 'IKYCD', 0, key_code );
  }
  got_ikycd( msg )
  {
    if( this.success( msg ) )
      return;

    if( msg.length < 2 )
      throw "Not enough input fields";

    if( msg[1] === "OK" )
      this.instrument['TSShield']["Key code"] = true;
    else
    {
      this.instrument['TSShield']["Key code"] = false;
      this.error_handler( msg[1] );
    }
  }

  /**
   * SWEBS – Confirmation of user registration and status output stop request.
   * @returns {undefined}
   */
  cmd_swebs()
  {
    this.recv_action_register( 'SWEBS', this.got_swebs );
    this.send_cmd( 'SWEBS' );
  }
  got_swebs( msg )
  {
  }

  /*
   * ERROR HANDLING
   */

  error_handler( msg )
  {
    if( !this.error_codes )
      this.error_handler_setup_codes();

    let e = "";
    if( typeof (msg) === "string" )
      e = msg;
    else
      e = msg[2];

    if( this.error_codes[e] )
    {
      console.error( this.error_codes[e] );
      if( this.error_codes[e].callback )
        this.events.call_callback( this.error_codes[e].callback, msg );
      else
        throw `Total Station Error ${e}`;
    }
    else
    {
      console.error( e );
      throw "Unknown Total Station Error";
    }
  }

  error_handler_setup_codes()
  {
    const codes = {};
    codes["E114"] = {
      code: "E114",
      message: "Tilted",
      meaning: "The tilt angle exceeds the tilt angle compensation range of the sensor. When this error is displayed despite being non-rotating status, stop the operation by SMOTR command and perform the auto-leveling again."
    };
    codes["E115"] = codes["E114"];
    codes["E180"] = {
      code: "E180",
      message: "RE-MEASURE",
      meaning: "Light intensity adjustment for angle measurement timeout error"
    };
    codes["E181"] = codes["E180"];
    codes["E200"] = {
      code: "E200",
      message: "RE-MEASURE",
      meaning: "EDM error"
    };
    codes["E210"] = {
      code: "E210",
      message: "Out of Range",
      meaning: "EDM error"
    };
    codes["E251"] = {
      code: "E251",
      message: "Please switch it on again",
      meaning: "Self-check error"
    };
    codes["E272"] = {
      code: "E272",
      message: "Backup battery dead.",
      meaning: "Backup battery error (LN-150 only)"
    };
    codes["E297"] = {
      code: "E297",
      message: "Device is busy",
      meaning: "Send a command after the device is ready for receiving commands.",
      callback: "device_busy"
    };
    codes["E369"] = {
      code: "E369",
      message: "Please make leveling again.",
      meaning: "Auto-leveling failed. Check the installed condition of the instrument and level the instrument again."
    };
    codes["E540"] = {
      code: "E540",
      message: "Motor stopped",
      meaning: "Motor drive system error"
    };
    codes["E572"] = {
      code: "E572",
      message: "Time out",
      meaning: "Positioning timeout error"
    };
    codes["E573"] = {
      code: "E573",
      message: "",
      meaning: "Error caused by the designated angle rotation generated when a tilt error occurs. (LN-150 only)"
    };
    codes["E575"] = {
      code: "E575",
      message: "Could not lock target",
      meaning: "Target lost",
      callback: "target_lock_failed"
    };
    codes["E577"] = {
      code: "E577",
      message: "Out of Range",
      meaning: "V angle limit error"
    };
    codes["E579"] = {
      code: "E579",
      message: "Time out",
      meaning: "Target acquisition failed",
      callback: "target_lock_failed"
    };
    codes["E840"] = {
      code: "E840",
      message: "Under the control of the other terminal",
      meaning: "The instrument cannot receive commands because the instrument is controlled by other controller."
    };
    codes["E896"] = {
      code: "E896",
      message: "Operation not permitted",
      meaning: "This operation is limited by Cloud OAF (LN-150 only)."
    };
    codes["E897"] = {
      code: "E897",
      message: "Demo Mode",
      meaning: "Operated in Demo Mode. Demo Mode is deactivated, when user registration is completed."
    };
    codes["E899"] = {
      code: "E899",
      message: "LOCK Mode",
      meaning: "Set to Lock Mode by the user"
    };

    this.error_codes = codes;
  }
}
;