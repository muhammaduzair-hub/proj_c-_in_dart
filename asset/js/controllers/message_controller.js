/*var utm = "+proj=utm +zone=32";
 var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
 var projection = proj4( utm, wgs84 );*/

var wrong_msg = null;

JSON.copy = function( j )
{
  return JSON.parse( JSON.stringify( j ) );
};

function for_all_in_object( me, func )
{
  var keys = Object.keys( me );
  var values = keys.map( function( key )
  {
    return me[key];
  } );
  values.forEach( func );
}

const message_controller = {
  events: new MultiEventController(),
  last_msg_time: {},

  ping_callback: function( server, ping_time )
  {
  },
  handle_msg_event: function( event, server )
  {
    if( event.data instanceof Blob )
    {
      var reader = new FileReader();
      reader.onload = function()
      {
        message_controller.handle_message( "" + reader.result, server );
      };
      reader.readAsText( event.data );
    }
    else
    {
      wrong_msg = event;
      message_controller.handle_message( "" + event.data, server );
    }

  },
  serer_ping_time: 999,
  recieved_messages: {},
  recieved_array: [ ],
  number_of_recieved_messages: 0,
  is_cleaning: false,
  cleaning_progress: 0,
  clean_up_messages: function( from_handle_message )
  {
    if( message_controller.is_cleaning && from_handle_message )
      return;
    message_controller.is_cleaning = true;

    var now_time = (new Date).getTime();

    if( !message_controller.number_of_recieved_messages )
    {
      message_controller.is_cleaning = false;
      return;
    }

    if( (now_time - message_controller.recieved_array[message_controller.cleaning_progress].time) > 1000 * 60 * 5 ) // 5 min
    {
      delete message_controller.recieved_messages[message_controller.recieved_array[message_controller.cleaning_progress].id];
      message_controller.recieved_array.splice( message_controller.cleaning_progress, 1 );
      message_controller.cleaning_progress--;
      message_controller.number_of_recieved_messages--;
    }

    message_controller.cleaning_progress++;
    var time_out = 0;
    if( message_controller.cleaning_progress >= message_controller.number_of_recieved_messages )
    {
      message_controller.cleaning_progress = 0;
      time_out = 1000;
    }

    setTimeout( message_controller.clean_up_messages, time_out );
  },
  fill_recieved_buffer: function( n )
  {
    var now_time = (new Date).getTime();
    for( var i = 0; i < n; i++ )
    {
      var id = guid( ) + "not_a_topic";
      message_controller.recieved_messages[id] = {time: now_time, server: "local"};
      message_controller.number_of_recieved_messages++;
      message_controller.recieved_array.push( {
        id: id,
        time: now_time
      } );
    }
  },
  check_if_allready_recieved: function( id )
  {
    return !!message_controller.recieved_messages[id];
  },
  topicsToAlwaysProcess: [ "ok", "login_user", "connected", "robots", "ping", "connect_to_robot", "split_msg", "paint_indicator_warning" ],
  topicsToNeverQueue: ["pos", "paint_indicator_warning"],
  topicsToNotReplyOnCloud: ["ok", "pos"],
  handle_message: function( msg_string, server, force = false )
  {
    var msg = JSON.parse( msg_string );
    var id = msg.UUID + msg.topic;

    var now_time = (new Date).getTime();
    message_controller.clean_up_messages( true );

    if( !(msg.topic === "ok" || (message_controller.topicsToNotReplyOnCloud.includes(msg.topic) && server === "cloud") || msg.ra === -1) && server )
    {
      communication_controller.send( "ok", {
        UUID: msg.UUID,
        topic: msg.topic
      }, server, 0 );
    }

    if( !force && message_controller.check_if_allready_recieved( id ) )
    {
      logger.debug( `This message was received on [${server}] but has already been recieved on [${message_controller.recieved_messages[id].server}]`, msg.topic, msg.UUID, now_time - message_controller.recieved_messages[id].time, msg );
      return;
    }
    message_controller.recieved_messages[id] = {time: now_time, server: server};
    message_controller.number_of_recieved_messages++;
    message_controller.recieved_array.push( {
      id: id,
      time: now_time
    } );

    if( server === "robot" )
    {
      communication_controller.lost_packages_from_robot = 0;
    }
    else if( server === "cloud" )
    {
      communication_controller.lost_packages_from_cloud = 0;
    }
    else
    {
      if( robot_controller.chosen_robot && robot_controller.chosen_robot.online_local )
      {
        communication_controller.lost_packages_from_robot = 0;
      }
      else
      {
        communication_controller.lost_packages_from_cloud = 0;
      }
    }

    if (window.cordova) {
      if (cordova.plugins.backgroundMode.isActive()) {
        let processImmediately = false;
        if (message_controller.topicsToAlwaysProcess.includes(msg.topic)) {
          processImmediately = true;
        }
        else if (msg.topic === "user_info" && msg.data.msg === "Job done") {
          processImmediately = true;
        }
        else if (msg.topic === "system_diag") {
          if (msg.data.state_top === TopStates.ERROR_HARD
          || msg.data.state_top === TopStates.ERROR_USER_WAIT
          || msg.data.state_top === TopStates.ERROR_RESOLVED
          || msg.data.state_top === TopStates.ERROR_SOFT) {
            processImmediately = true;
          }
        }

        if (processImmediately) {
          message_controller.processMessage(msg, server);
        }
        else {
          if (!message_controller.topicsToNeverQueue.includes(msg.topic)) {
            message_controller.queuedMessages[msg.topic] = [ msg, server ];
          }
        }
      }
      else {
        message_controller.processMessage( msg, server );
      }
    }
    else {
      //If not running on tablet, simply process
      message_controller.processMessage(msg, server);
    }
  },
  
  processQueuedMessages: ()=>{
    var topics = Object.keys( message_controller.queuedMessages );

    for (const topic of topics) {
      message_controller.processMessage( message_controller.queuedMessages[topic][0], message_controller.queuedMessages[topic][1] );
    }
    message_controller.queuedMessages = {};
  },
  queuedMessages: {},
  allowed_topics: [ ],
  split_msg_que: {},
  processMessage: function( msg, server )
  {
    var potential_slow_topics = [ "db_jobs" ];
    var time_out = 10;
    if( potential_slow_topics.indexOf( msg.topic ) >= 0 )
    {
      time_out = 100;
      logger.debug( "postponing", msg.topic, "100ms" );
    }

    setTimeout( () => {
      var start = time.now;
      message_controller.process_message_timed( msg, server );
      var end = time.now;
      var elapsed = end - start;
      logger.debug( msg.topic, "took", elapsed, "ms" );
    }, time_out );


  },

  process_message_timed: function( msg, server )
  {
    if( msg.topic !== "ok" && message_controller.allowed_topics.length )
    {
      if( message_controller.allowed_topics.indexOf( msg.topic ) < 0 )
      {
        console.log( "ignoring " + msg.topic );
        return;
      }
    }

    let handled = message_controller.events.call_callback( msg.topic, msg.data, server );

    if( msg.topic.startsWith( "reconf_topic_/user" ) && msg.topic !== "reconf_topic_/user" )
    {
      handled = true;
      let key = msg.data.key;
      let val = msg.data.info.current;
      robot_controller.config[key] = val;

      let new_data = {
        "/user": {}
      };
      new_data["/user"][key] = msg.data.info;
      if(msg.data.robot)
        new_data["robot"] = msg.data.robot;
      message_controller.events.call_callback( "reconf_topic_/user", new_data );
    }

    logger.debug( `<- ${server}`, msg.topic, msg );
      
    if( msg.topic in message_controller.handle_topic )
    {
      message_controller.handle_topic[msg.topic](msg, server);
    }
    else if( !handled )
    {
      console.log( "unknown message from", server, "msg:", msg );
    }

    message_controller.last_msg_time[msg.topic] = msg.time;
  },
  handle_topic: {
    split_msg: function(msg, server)
    {
      var msg_id = msg.data.msg_id;
      var data = msg.data.data;
      var package_num = msg.data.n;
      if( package_num === 0 )
      {
        message_controller.split_msg_que = {};
        message_controller.split_msg_que[msg_id] = {
          "packages": msg.data.packages,
          "data": {}
        };
      }
      var packages = message_controller.split_msg_que[msg_id].packages;
      message_controller.split_msg_que[msg_id].data[package_num] = data;

      if( Object.keys( message_controller.split_msg_que[msg_id]["data"] ).length === packages )
      {
        var all_packages = Object.values( message_controller.split_msg_que[msg_id]["data"] );
        var collected_data = "";
        all_packages.forEach( function( data )
        {
          collected_data += data;
        } );
        message_controller.handle_message( collected_data, server );
      }
    },
    writer_db_down: function(msg, server)
    {
      popup_screen_controller.confirm_popup( translate["write_db_server_down_header"], translate["write_db_server_down_body"], "ok", undefined, popup_screen_controller.close )
    },
    udp: function(msg, server)
    {
      communication_controller.robot_p2p_information = msg.data;
    },
    unauthorized: function(msg, server)
    {
      console.log( "not login", msg.data.topic );
      communication_controller.sendLogin();
    },
    ok: function(msg, server)
    {
      for( var i = 0; i < communication_controller.sendBuffer.length; i++ )
      {
        var old_msg = communication_controller.sendBuffer[i];
        if( old_msg.UUID === msg.data.UUID )
        {

          var time = (new Date).getTime() - old_msg.time;
          message_controller.serer_ping_time = time;

          communication_controller.sendBuffer.splice( i, 1 );
          i--;
        }
      }
    },
    connected: function(msg, server)
    {
      console.log( 'connected' );
      communication_controller.send( "keep_alive", {}, server, 0 );
      if( server === "cloud" )
      {
        communication_controller.connected_cloud();
      }
      if( server === "robot" )
      {
        communication_controller.connected_robot();
      }
    },
    set_dns_settings: function(msg, server) {
      try {
        const settings = msg.data.dns_settings;
        console.warn("Server delivered new DNS Settings: ", settings);
        communication_controller.writeAppDNS(settings);
      }
      catch (error) {
        console.error("Server delivered malformed DNS: ", msg, error);
      }
    },
    ping: function(msg, server)
    {
      communication_controller.ping_end( msg.data.route );
    },
    templates: function(msg, server)
    {
      templateshop_controller.got_templates( msg.data );
    },
    dealer_is_customer: function(msg, server)
    {
      login_screen_controller.dealer_is_customer = msg.data.result;
      login_screen_controller.dealer_name = msg.data.dealer;
      $(".dealer_is_customer_indicator").toggleClass("gone", !(login_screen_controller.dealer_is_customer && general_settings_screen.settings.show_dealer_is_customer_warning.val));
      $("#dealer_is_customer_indicator_text").text(login_screen_controller.dealer_name);
    },
    appVersionInfo: function(msg, server)
    {
      const current = msg.data.current;
      const next = msg.data.next;

      const doUpdate = () => {
        settings_screeen_controller.choose_menu( 'auto_update_screen_header', 'auto_update_screen' );
        settings_screeen_controller.open();
        auto_update_screen.checkAppUpdate();
      };
      const showUpdate = () => {
        if( SETTINGS.show_update_app_dialog && login_screen_controller.user_level !== user_level.DEVELOPER)
        {
          const buttons = [
            new PopButton(translate["Check for Updates"], openUpdateMenu, null, null),
            new PopButton(translate["remindMe"], remind, "red", null)
          ]

          const options = {
            popup_id: "update_popup",
            header: translate["Please update"],
            body: translate["There is a newer version of the app."],
            buttons: buttons
          }

          pop_generator.create_popup_with_options(options);

          function openUpdateMenu() {
            doUpdate();
            pop_generator.close();
          }

          function remind() {
            SETTINGS.show_update_app_dialog = false;
            pop_generator.close();
          }
        }
      }

      if(current.exists && current.deprecated && !next.deprecated)
      {
        showUpdate();
      }
      else
      {
        const currentVersion = auto_update_screen.getVersionNumbers(APP_VERSION_NUMBER.replace("v",""));
        const nextVersion = auto_update_screen.getVersionNumbers(next.tag.replace("v",""));

        if(
             (nextVersion[0] > (currentVersion[0] + 0))
          || (nextVersion[1] > (currentVersion[1] + 1))
          || (nextVersion[2] > (currentVersion[2] + 10))
        )
        {
          showUpdate();
        }
      }
    },
    login_user: function(msg, server)
    {
      if( msg.data.success )
      {
        login_screen_controller.user_level = msg.data.user_level;
        login_screen_controller.user_id = msg.data.user_id;
        login_screen_controller.customer_id = msg.data.customer;
        login_screen_controller.customer_name = msg.data.customer_name;

        console.log( "login success" );
        templateshop_controller.got_templates( msg.data );
        localStorage.setItem( "user.aproved_once", true );

        communication_controller.autoLogin = true;


        if( msg.data.connect_to && msg.data.connect_to !== robot_controller.chosen_robot_id )
        {
          developer_screen.choose_robot( msg.data.connect_to, true );
          return;
        }
        if( !robot_controller.chosen_robot_id )
          robot_controller.get_robots( server );
        robot_controller.fetch_db_jobs();
        robot_controller.user_login_success();
        event_controller.call_callback( "user_login_success" );
        if( robot_controller.chosen_robot_id && communication_controller.autoConnect )
        {
          communication_controller.doConnectToRobot();
        }

      }
      else
      {
        console.log( "login failure" );
        robot_controller.user_login_failure();
        console.log( msg );
      }
    },
    robot_capabilities: function(msg, server)
    {
      robot_controller.got_got_robot_capabilities_from_robot( msg.data.capabilities );
    },
    robots: function(msg, server)
    {
      if(message_controller._robotlist === JSON.stringify(msg.data) )
        return;

      if(server !== undefined)
        message_controller._robotlist = JSON.stringify(msg.data);
      
      localStorage.setItem( "robotlist", JSON.stringify( msg ) );
      var n = msg.data.robots.length;

      var new_robot_ids = msg.data.robots.map( function( robot )
      {
        return robot.id;
      } );
      var old_robot_ids = Object.keys( robot_controller.robots );
      var lost_robots = old_robot_ids.filter( function( robot_id )
      {
        return new_robot_ids.indexOf( parseInt( robot_id ) ) === -1;
      } );
      lost_robots.forEach( function( id )
      {
        delete robot_controller.robots[id];
      } );

      for( i = 0; i < n; i++ )
      {
        let r = msg.data.robots[i];

        var was_online = !!(robot_controller.robots[r.id] && robot_controller.robots[r.id].online);

        if( !r.id )
          continue

        if( server === "cloud" )
          r.online_cloud = (r.online === "online");
        delete r.online;

        var robot_id = parseInt( r.id );
        var robot_name = r.name;
        delete r.id;
        delete r.name;

        r.version = r.version ? r.version : "RS5.4.0 - or later";
        if( r.version.replace( "None", "" ) )
        {
          r.version_numbers = auto_update_screen.getVersionNumbers(r.version.replace("RS", ""));
        }

        if( r.proj_string )
        {
          var lnglat = ProjectorInverse(r.proj_string, [ r.x, r.y ] );
          r.long = lnglat[0];
          r.lat = lnglat[1];
        }

        if( !robot_controller.robots[robot_id] )
          robot_controller.robots[robot_id] = new Robot( robot_name, robot_id );
        else
        {
          delete r.x;
          delete r.y;
          delete r.z;
          delete r.t;
        }
        robot_controller.robots[robot_id].name = robot_name;
        robot_controller.robots[robot_id].loadKeys( r );
      }

      event_controller.call_callback( "robot_list_updated" );

      if( blue.socketId === -1 || blue.connect_to !== robot_controller.chosen_robot.bmac )
      {
        blue.connect_to_robot();
      }
    },
    pos: function(msg, server)
    {
      if( msg.data.success )
      {

        if( !robot_controller.robots[ msg.data.robot ] )
        {
          robot_controller.robots[ msg.data.robot ] = new Robot( "", msg.data.robot );
        }
        
        if( !robot_controller.robots[ msg.data.robot ].projection )
        {
          communication_controller.get_reconfigure_topic("/user", "projection");
          return;
        }

        if( msg.time > robot_controller.robots[ msg.data.robot ].last_time )
        {
          robot_controller.robots[ msg.data.robot ].last_time = msg.time;
        }
        else
        {
          return;
        }

        robot_controller.robots[ msg.data.robot ].pos = msg.data; // load x and y into robot
        robot_controller.robots[ msg.data.robot ].z = msg.data.z;
        robot_controller.robots[ msg.data.robot ].t = msg.data.t;
        robot_controller.robots[ msg.data.robot ].precision = msg.data.precision;
        
        if(!robot_controller.robots[ msg.data.robot ].projector)
        {
          robot_controller.robots[ msg.data.robot ].projector = Projector( robot_controller.robots[ msg.data.robot ].proj_string );
          projection_controller.set_zone_on_next_gps();
        }
        const lnglat = robot_controller.robots[ msg.data.robot ].projector.inverse( [ msg.data.x, msg.data.y ] );
        robot_controller.robots[ msg.data.robot ].long = lnglat[0];
        robot_controller.robots[ msg.data.robot ].lat = lnglat[1];

        event_controller.call_callback( "got_robot_position", robot_controller.robots[ msg.data.robot ] );
      }
      else
      {
        logger.debug( "Ignoring 'pos' message", msg );
      }
    },
    connect_to_robot: function(msg, server)
    {
      if( msg.data.success )
      {
        console.log( "Connected to robot" );
        event_controller.call_callback( "connected_to_robot" );
      }
      else
      {
        console.log( msg );
        setTimeout(
          communication_controller.doConnectToRobot,
          10*1000
        );
      }
    },
    battery: function(msg, server)
    {
      robot_controller.battery_level = msg.data.level;
      robot_controller.last_battery_level = msg.data.level;
      robot_controller.battery_level_updated();
      event_controller.call_callback( "battery_level_updated" );
    },
    display: function(msg, server)
    {
      msg.data.lines.forEach( function( l, i )
      {
        robot_controller.display_lines[i] = l.replace( /\[\.\]/g, "," ).replace( /\ /g, "&nbsp;" );
      } );
      event_controller.call_callback( "lcd_display_lines" );
    },
    config: function(msg, server)
    {
      robot_controller.update_config_legacy( msg.data );
      event_controller.call_callback( "robot_config_updated" );
    },
    parkinglot_config: function(msg, server)
    {
      robot_controller.plot_config = msg.data;
      event_controller.call_callback( "plot_configutation_updated" );
    },
    task_info: function(msg, server)
    {
      msg.data["Task procent"] = robot_controller.task_info["Task procent"];
      robot_controller.task_info = msg.data;
      robot_controller.task_info["Original task idx"] = parseFloat( robot_controller.task_info["Original task idx"] );
      robot_controller.task_info["Original task pct"] = parseFloat( robot_controller.task_info["Original task pct"] );

      event_controller.call_callback( "task_info_updated" );
    },
    system_diag: function(msg, server)
    {
      const new_syslevel = robot_controller.user_state !== msg.data.usr_level || robot_controller.state_top !== msg.data.state_top;

      logger.debug( "state user", robot_controller.user_state, "->", msg.data.usr_level );
      logger.debug( "state top", robot_controller.state_top, "->", msg.data.state_top );

      console.log( server, "system_diag", msg );
      robot_controller.system_level = msg.data.sys_level; // error
      robot_controller.user_state = msg.data.usr_level; // auto/manual
      robot_controller.system_message = msg.data.msg;
      robot_controller.state_top = msg.data.state_top;

      if( new_syslevel )
      {
        event_controller.call_callback( "on_system_diag_change" );
      }

      if( robot_controller.user_state === TopStates.MANUAL && robot_controller.state_top === TopStates.MANUAL )
      {
        console.warn( "robot_manual_mode" );
        event_controller.call_callback( "robot_manual_mode" );
      }
    },
    user_info: function(msg, server)
    {
      if( server === "cloud" && communication_controller.local_connection.connected )
        return;
      var duration = msg.data.duration * 1000;
      var msg = msg.data.msg;
      event_controller.call_callback( "got_user_info", msg, duration );
    },
    create_db_job: function(msg, server)
    {
      if(pitch_generator.active.new_job) {
        const currentID = pitch_generator.active.id;
        pitch_generator.active.id = msg.data.id;
        
        const tempJob = map_controller.background.jobs.find(job=>{job.id === currentID});
        
        if (tempJob) {
          tempJob.id = msg.data.id;
        }
      }

      event_controller.call_callback( "create_db_job_done", msg.data.success );
    },
    save_db_job: function(msg, server)
    {
      // The ID has changed on the DB but the job is the same as was sent to the DB
      pitch_generator.active.id = msg.data.id;

      console.log( msg.data.success );
      event_controller.call_callback( "save_db_job_done", msg.data.success );
    },
    db_jobs: function(msg, server)
    {
      console.log( server, msg.topic, msg.data );

      function loadJobs() {
        map_controller.background.jobLoader.load(msg.data.jobs, () => {
          message_controller.events.call_callback( "db_jobs_list_load_done" );
          event_controller.call_callback( "db_jobs_list_updated" );
        });
      };

      if(server === "local") {
        loadJobs();
      } else if( parseInt(msg.data.customer_id) === login_screen_controller.customer_id) {
        loadJobs();
        try
        {
          localStorage.setItem( "db_jobs.jobs", JSON.stringify( msg ) );
        }
        catch( e )
        {
          console.error(e);
        }
      }
    },
    db_job_revisions: function(msg, server)
    {
      event_controller.call_callback( "got_db_job_revisions", msg.data.jobs );
    },
    not_online: function(msg, server)
    {
      console.log( "The server says the robot is offline" );
      robot_controller.disconnect_robots( server, parseInt( msg.data.robot ) );
      event_controller.call_callback( "robot_not_online" );
    },
    tool_info: function(msg, server)
    {
      delete msg.data.robot;
      robot_controller.tool_info = msg.data;
      event_controller.call_callback( "tool_info_updated" );
    },
    found_near: function(msg, server)
    {
      event_controller.call_callback( "goto_near_done", msg.data.success );
    },
    slow_bt: function(msg, server)
    {
      event_controller.call_callback( "got_slow_bt_info", msg.data.is_slow );
    },
    projections: function(msg, server)
    {
      event_controller.call_callback( "got_projections", msg.data );
    },
    user_featuregroups: function(msg, server)
    {
      event_controller.call_callback( "got_user_featuregroups", msg.data );
    },
    paint_indicator_warning: function(msg, server)
    {
      if(msg.data && msg.data.state === "ko")
      {
        event_controller.call_callback("paint_indicator_warning");   
      }
    },
    save_key_val(msg, server) {
      if (msg.data.success) {
        console.log("Successfully saved key/val:", msg);
      }
      else {
        console.error("Error saving key/val:", msg);
      }
    }
  }
};

$(()=>{
  document.addEventListener("resume", message_controller.processQueuedMessages);

  event_controller.add_callback( "app_server_connection_closed", ()=>message_controller._robotlist=undefined );
  event_controller.add_callback( "bluetooth_disconnect", ()=>message_controller._robotlist=undefined );
} );