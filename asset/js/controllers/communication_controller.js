
/* global robot_controller, message_controller, wifi_controller, chrome, general_settings_screen */

const communication_controller = {
  appServerConnection: {
    isOpen: function() {
      return 0;
    },
    get connected() {
      return 0;
    }
  },
  local_connection: {
    readyState: 0,
    isOpen: function()
    {
      return 0;
    }
  },

  _appServerConnectionKeepAliveInterval: null,
  _appServerConnectionKeepAliveIntervalTime: 2, // 2 seconds
  _appServerConnectionCheckIntervalHandler: null,
  // _appServerConnectionTimeoutLimitSeconds: 60, // 60 seconds
  _appServerConnectionTimeoutLimitSeconds: 10, // 10 seconds
  _lastMessageReceivedAt: time.now,
  _appServerConnectionIsConnecting: false,
  _appServerConnectionAttempts: 0,
  localAdress: "",
  username: '',
  password: '',
  tabletID: '',
  autoLogin: false,
  autoConnect: false,
  sendBuffer: [],
  timeOffset: 0,
  numberOfMessages: 0,
  lastCheckTime: 0,
  messageTypes: {},

  get AppDNS() {
    let settings = null;
    try {
      settings = JSON.parse(localStorage.getItem("AppDNS"));
    } catch (error) {
      console.error("Error while reading AppDNS from localStorage: ", error);
    }
    if (this.checkAppDNSSettings(settings)){
      return settings;
    }
    else {
      return communication_controller._AppDNSDefaults;
    }
  },

  set AppDNS(settings) {
    this.writeAppDNS(settings);
  },

  resetAppDNS() {
    console.warn("Resetting local storage AppDNS settings...");
    localStorage.setItem("AppDNS", JSON.stringify({}));
  },

  checkAppDNSSettings(settings) {
    if (!settings) {
      logger.debug("'Settings' are empty");
      return false;
    }
    if (typeof settings === 'string') {
      console.error("'Settings' are of type string, did you run JSON.parse?");
      return false;
    }
    if (Object.keys(settings).length === 0) {
      logger.debug("'Settings' are empty");
      return false;
    }
    if(!("prepend_hostname" in settings) || typeof(settings.prepend_hostname) !== 'boolean' ) {
      console.error("'Settings' does not contain 'prepend_hostname' or value is not of type 'boolean'");
      return false;
    }
    if(!("use_secure" in settings) || typeof(settings.use_secure) !== 'boolean' ) {
      console.error("'Settings' does not contain 'use_secure' or value is not of type 'boolean'");
      return false;
    }
    if(!("address" in settings) || typeof(settings.address) !== 'string' ) {
      console.error("'Settings' does not contain 'address' or value is not of type 'string'");
      return false;
    }
    if(!("port" in settings) || typeof(settings.port) !== 'number' ) {
      console.error("'Settings' does not contain 'port' or value is not a number");
      return false;
    }
    return true;
  },

  writeAppDNS(settings) {
    try {
      if (this.checkAppDNSSettings(settings)) {
        console.log("Writing AppDNS to local storage ", settings);
        localStorage.setItem("AppDNS", JSON.stringify(settings));
      }
      else {
        console.error("Received malformed AppDNS, reverting to defaults...");
        this.writeAppDNS(communication_controller._AppDNSDefaults);
      }
    }
    catch (error) {
      console.error("Unable to set AppDNS");
      localStorage.setItem("AppDNS", JSON.stringify({}));
    }
  },

  get baseAddress() {
    return general_settings_screen.settings.use_localhost.val ? "localhost" : communication_controller.AppDNS.address;
  },

  get appServerAddress() {
    const protocol = communication_controller.AppDNS.use_secure ? "wss://" : "ws://";
    if( communication_controller.AppDNS.prepend_hostname && communication_controller.username )
      return protocol + communication_controller.username + "." + communication_controller.baseAddress;
    else if (!communication_controller.AppDNS.prepend_hostname)
      return protocol + communication_controller.baseAddress;
    else
      return false;
  },

  get serverPort() {
    return general_settings_screen.settings.use_test_server_app.val ? 8084 : communication_controller.AppDNS.port;
  },

  get url() {
    return communication_controller.appServerAddress + ":" + communication_controller.serverPort + "/app";
  },

  canCreateConnection: ()=>{
    if (!navigator.onLine) {
      console.error("No internet connection!");
      return false;
    }
    if(!communication_controller.username || !communication_controller.password) {
      console.error("Login appears to have failed!");
      return false;
    }
    if (!communication_controller.AppDNS.address || !communication_controller.AppDNS.port) {
      console.error("Failed to read AppDNS information!");
      return false;
    }
    return true;
  },

  shouldCreateConnection: ()=>{
    if (communication_controller.appServerConnection && communication_controller.appServerConnection.connected) {
      console.warn("App server connection is already open, aborting...");
      return false;
    }
    if (communication_controller._appServerConnectionIsConnecting) {
      console.warn("App server connection is already being created, aborting...");
      return false;
    }
    return true;
  },

  toggleAppServerConnectionIsConnecting() {
    if (communication_controller._appServerConnectionIsConnecting) {
      communication_controller._appServerConnectionIsConnecting = false;
    }
    else {
      communication_controller._appServerConnectionIsConnecting = true;
      setTimeout(()=>{
        communication_controller.toggleAppServerConnectionIsConnecting();
      }, 3 * 1000); // 3 seconds
    }
  },

  createAppServerConnection: (reason=null)=>{
    console.warn("Attempting server connection...");
        
    // communication_controller.resetAppServerConnectionCheckCount();
    communication_controller.startAppServerConnectionCheckInterval();

    if (!communication_controller.canCreateConnection() || !communication_controller.shouldCreateConnection()) {
      return false;
    }

    communication_controller._appServerConnectionIsConnecting = true;
    setTimeout(()=>{
      communication_controller._appServerConnectionIsConnecting = false;
    }, 3 * 1000); // 3 seconds
    
    if (communication_controller._appServerConnectionAttempts > 2) {
     communication_controller._appServerConnectionAttempts = 0;
     communication_controller.resetAppDNS();
    }
    else {
      communication_controller._appServerConnectionAttempts += 1;
    }


    if (communication_controller.appServerConnection) {
      delete communication_controller.appServerConnection;
    }
    
    try {
      communication_controller.appServerConnection = new WebSocket(communication_controller.url);
    }
    catch( e ) {
      communication_controller._appServerConnectionIsConnecting = false;
      console.log( e );
    }

    communication_controller.appServerConnection.orig_send = communication_controller.appServerConnection.send;
    communication_controller.appServerConnection.sending = false;
    communication_controller.appServerConnection.send_que = {};
    communication_controller.appServerConnection.same_topic_send_que = [ ];
    communication_controller.appServerConnection.send = function( data, topic, buffer_msg, sendImmediately=false )
    {
      buffer_msg.qued = true;
      if( !communication_controller.appServerConnection.sending || sendImmediately )
      {
        communication_controller.appServerConnection.sending = true;
        communication_controller.appServerConnection.orig_send( data );
        if( window.bootTime )
        {
          var new_time = time.now + communication_controller.timeOffset;
          buffer_msg.time = new_time;
        }
        else
        {
          var new_time = (new Date).getTime();
          buffer_msg.time = new_time;
        }

        var last_bufferAmount = communication_controller.appServerConnection.bufferedAmount;
        var check_buffer = setInterval( function()
        {
          if( communication_controller.appServerConnection.bufferedAmount !== last_bufferAmount )
          {
            last_bufferAmount = communication_controller.appServerConnection.bufferedAmount;
          }
          if( !communication_controller.appServerConnection.bufferedAmount )
          {
            communication_controller.appServerConnection.sending = false;
            clearInterval( check_buffer );
            if( communication_controller.appServerConnection.same_topic_send_que.length || Object.keys( communication_controller.appServerConnection.send_que ).length )
            {
              if( communication_controller.appServerConnection.same_topic_send_que.length )
              {
                const data = communication_controller.appServerConnection.same_topic_send_que.shift(); // pop left
                communication_controller.appServerConnection.send( data[0], topic, data[1] );
              }
              else
              {
                var send_topic = "";
                if( communication_controller.appServerConnection.send_que["ping"] )
                  send_topic = "ping";
                else if( communication_controller.appServerConnection.send_que["move"] )
                  send_topic = "move";
                else
                {
                  var topics = Object.keys( communication_controller.appServerConnection.send_que );
                  send_topic = topics[0];
                }
                const data = communication_controller.appServerConnection.send_que[send_topic];
                communication_controller.appServerConnection.send( data[0], topic, data[1] );
                delete communication_controller.appServerConnection.send_que[send_topic];
              }
            }

          }
        }, 0 );
      }
      else
      {
        if( topic === "ok" || topic === "save_key_val" || topic === "save_device_data" || topic === "get_device_data" )
          communication_controller.appServerConnection.same_topic_send_que.push( [ data, buffer_msg ] );
        else
        {
          if( communication_controller.appServerConnection.send_que[topic] ) {
            console.warn(`Message with topic '${topic}' was changed before it was sent.`)
          }
          communication_controller.appServerConnection.send_que[topic] = [ data, buffer_msg ];
        }
      }
    };
    communication_controller.appServerConnection.isOpen = ()=>{
      return (communication_controller.appServerConnection._isOpen && (communication_controller.appServerConnection.readyState === 1)) ? 1 : 0;
    };
    Object.defineProperty( communication_controller.appServerConnection, 'connected', {
      get: ()=>{
        return communication_controller.appServerConnection.isOpen();
      }
    });
    communication_controller.appServerConnection.onopen = ()=>{
      communication_controller.appServerConnection._isOpen = 1;
      communication_controller._appServerConnectionIsConnecting = false;
      communication_controller._appServerConnectionAttempts = 0;
      communication_controller.startAppServerConnectionKeepAliveInterval();
      console.log("Connected with server on " + communication_controller.appServerConnection.url);
      if(communication_controller.serverPort === 8084) {
        console.log('%cUSING SERVER PORT 8084 (test server)', 'color: red; font-size: 30px;');
      }
      if(communication_controller.baseAddress === "localhost") {
        console.log('%cUSING SERVER ADDRESS \"localhost\"', 'color: red; font-size: 30px;');
      }
      if( communication_controller.autoLogin ) {
        communication_controller.sendLogin(reason);
      }
      event_controller.call_callback("topbar_force_update");
      event_controller.call_callback( "app_server_connection_established" );
    };
    communication_controller.appServerConnection.orig_close = communication_controller.appServerConnection.close;
    communication_controller.appServerConnection.close = (reason=null)=>{
      if (!reason) {
        reason = "Unknown";
      }
      communication_controller.appServerConnection.orig_close(1000, reason);
      robot_controller.disconnect_robots( "cloud" );
      event_controller.call_callback("topbar_force_update");
      console.warn("Closing server connection because \"" + reason + "\"");
    };
    communication_controller.appServerConnection.onclose = (event)=>{
      if (event.code !== 1000) {
        // let data = {code: event.code, wasClean: event.wasClean, reason: event.reason}
        console.error("UNCLEAN CLOSE: ", event);
      }
      console.warn("App server connection closed.");
      
      communication_controller.appServerConnection._isOpen = 0;
      robot_controller.disconnect_robots( "cloud" );
      event_controller.call_callback("topbar_force_update");
      event_controller.call_callback( "app_server_connection_closed" );
    };
    communication_controller.appServerConnection.onmessage = function( msg )
    {
      if( communication_controller.appServerConnection !== communication_controller.appServerConnection ) {
        console.error( "Multiple app server connections are open, closing this one", communication_controller.appServerConnection );
        communication_controller.appServerConnection.onclose = function()
        {};
        communication_controller.appServerConnection.close = communication_controller.appServerConnection.orig_close;
        communication_controller.appServerConnection.close("Multiple connections");
      }
      communication_controller.resetAppServerConnectionCheckCount();
      message_controller.handle_msg_event( msg, "cloud" );
      return false;
    };
    communication_controller.appServerConnection.onerror = (event)=>{
      console.error("App server connection error!");
      console.error(event);
    }
  },
  
  createInitialAppServerConnection: ()=>{
    communication_controller.createAppServerConnection("Initial connection");
  },
  
  resetAppServerConnectionCheckCount: ()=>{
    communication_controller._lastMessageReceivedAt = time.now;
  },

  startAppServerConnectionCheckInterval: ()=>{
    if (!communication_controller._appServerConnectionCheckIntervalHandler) {
      communication_controller._appServerConnectionCheckIntervalHandler = new IntervalHandler(
      "App server connection check interval", 
      communication_controller.appServerConnectionCheck,
      window, 
      1, 
      1000);
    }
    if (!communication_controller._appServerConnectionCheckIntervalHandler.isRunning) {
      communication_controller.resetAppServerConnectionCheckCount();
      communication_controller._appServerConnectionCheckIntervalHandler.start();
    }
    return true;
  },

  stopAppServerConnectionCheckInterval: ()=>{
    communication_controller._appServerConnectionCheckIntervalHandler.stop();
  },
  
  appServerConnectionCheck: ()=>{
    if (!tablet_connection.online) {
      logger.debug("No internet connection, aborting app server connection check...");
    }
    else if (communication_controller.appServerConnection.connected && communication_controller.appServerConnection.url !== communication_controller.url) {
      logger.debug("Detected changes to App DNS");
      communication_controller.closeAppServerConnectionAndReconnect("DNS changed");
    }
    else if (communication_controller.connectionHasTimedOut()) {
      logger.debug("App server connection check count exceeded, reconnecting...");
      event_controller.call_callback("app_server_connection_lost");
      communication_controller.closeAppServerConnectionAndReconnect("Connection timed out");
    }
    else if (communication_controller.appServerConnection.readyState === 3) {
      logger.debug("App server connection seems closed, reopening...");
      event_controller.call_callback("app_server_connection_closed");
      communication_controller.closeAppServerConnectionAndReconnect("Connection closed");
    }
    else if (communication_controller.appServerConnection.readyState === 0) {
      logger.debug("Currently opening server connection, aborting connection attempt...");
    }
  },

  connectionHasTimedOut() {
    const lastMessageReceivedAt = communication_controller._lastMessageReceivedAt;
    const limit = communication_controller._appServerConnectionTimeoutLimitSeconds * 1000; // To milliseconds
    const difference = time.now - lastMessageReceivedAt;
    return difference > limit;
  },

  closeAppServerConnectionAndReconnect: (reason=null)=>{
    if (!communication_controller.appServerConnection && !communication_controller.appServerConnection.connected) {
      console.warn("App server connection is already closed");
    }
    else if (communication_controller.appServerConnection.connected){
      communication_controller.appServerConnection.close(reason);
    }
    communication_controller.createAppServerConnection(reason);
    return true;
  },

  closeAppServerConnectionWithoutReconnecting: (reason=null)=>{
    if (!communication_controller.appServerConnection.connected) {
      console.warn("App server connection is already closed");
      return false;
    }
    console.warn("Closing app server connection without reconnecting...");
    communication_controller.stopAppServerConnectionCheckInterval();
    communication_controller.stopAppServerConnectionKeepAliveInterval();
        
    communication_controller.appServerConnection.close(reason);
        
    robot_controller.disconnect_robots( "cloud" );
    event_controller.call_callback("topbar_force_update");

    return true;
  },

  clearSendBuffer: (topic)=>{
    communication_controller.sendBuffer = communication_controller.sendBuffer.filter( function( old_msg )
    {
      return old_msg.topic !== topic;
    } );
  },

  addToBuffer: (msg)=>{
    if( msg.topic !== "save_key_val" )
      communication_controller.clearSendBuffer( msg.topic );
    communication_controller.sendBuffer = communication_controller.sendBuffer.filter( function( old_msg )
    {
      return msg.UUID !== old_msg.UUID && msg.topic !== old_msg.topic;
    } );
    communication_controller.sendBuffer.push( msg );
  },

  syncTime: ()=>{
    if(window.bootTime) {
      window.bootTime.get((newBootTime)=>{
        var newRealTime = ((new Date).getTime());
        newBootTime = time.now;
        communication_controller.timeOffset = newRealTime - parseInt(newBootTime);
      } );
    }
  },

  /**
   * 
   * @param {String} topicName 
   * @param {String} paramName 
   * @param {String} server 
   * @param {Number} remaining_attempts 
   * @param {Boolean} get_meta 
   */
  get_reconfigure_topic( topicName, paramName, server = "all", remaining_attempts = 10, get_meta = true) {
    console.log( "getting reconfigure topic", topicName, paramName );
    communication_controller.send( 'get_reconf_topic', {
      robot: robot_controller.chosen_robot_id,
      topic: topicName,
      meta: get_meta,
      config: paramName,
    }, server, remaining_attempts );
  },
  
  send: (topic, data, server, remainingAttempts, sendImmediately=false)=>{
    if( window.bootTime ) {
      window.bootTime.get((newBootTime)=>{
        const newTime = time.now + communication_controller.timeOffset;
        return communication_controller.sendWithTime(topic, data, server, remainingAttempts, newTime, sendImmediately);
      } );
    }
    else {
      const newTime = (new Date).getTime();
      return communication_controller.sendWithTime( topic, data, server, remainingAttempts, newTime, sendImmediately);
    }
  },

  sendWithTime: (topic, data, server, remainingAttempts, time, sendImmediately=false)=>{
    return communication_controller.sendWithTimeAndUUID( topic, data, server, remainingAttempts, time, guid(), sendImmediately );
  },

  sendWithUUID: (topic, data, server, remainingAttempts, newUUID, sendImmediately=false)=>{
    if(window.bootTime) {
      window.bootTime.get((newBootTime)=>{
        const new_time = time.now + communication_controller.timeOffset;
        return communication_controller.sendWithTimeAndUUID( topic, data, server, remainingAttempts, new_time, newUUID, sendImmediately );
      } );
    }
    else {
      const new_time = (new Date).getTime();
      return communication_controller.sendWithTimeAndUUID( topic, data, server, remainingAttempts, new_time, newUUID, sendImmediately );
    }
  },
  sendWithTimeAndUUID: (topic, data = {}, server, remainingAttempts, time, newUUID, sendImmediately=false)=>{
    if(!('robot' in data)) {
      data['robot'] = robot_controller.chosen_robot_id;
    }

    let msg = {
      topic: topic,
      data: data,
      UUID: newUUID,
      time: time + 120000, // add 2 minutes
      server: server || "all"
    };

    logger.debug( `-> ${server}`, msg.topic, msg );
    let msgString = JSON.stringify( msg );
    msg.qued = false;
    msg.ra = remainingAttempts === undefined ? -1 : remainingAttempts;
    if( topic === "send_job" ) {
      console.log( "Sending job with size: ", msgString.length, " Bytes" );
      event_controller.call_callback( "send_job" );
    }

    if( server === "p2p" ) {
      communication_controller.send_to_p2p( msgString );
    }
    else if( server === "blue" ) {
      // TODO: IMPLEMENT SENDIMMEDIATELY VIA BT
      blue.send( msgString, topic, msg );
    }
    else if( server === "all" ) {
      communication_controller.sendWithTimeAndUUID(topic, data, "cloud", remainingAttempts, time, newUUID, sendImmediately);
      communication_controller.sendWithTimeAndUUID(topic, data, "blue",  remainingAttempts, time, newUUID, sendImmediately);
    }
    else if( server === "robot" ) {
      if( communication_controller.local_connection && communication_controller.local_connection.connected ) {
        communication_controller.local_connection.send( msgString );
      }
    }
    else if( server === "cloud" ) {
      if( communication_controller.appServerConnection && communication_controller.appServerConnection.connected ) {
        communication_controller.appServerConnection.send( msgString, topic, msg, sendImmediately );
        communication_controller.serverSendMessage( topic );
      }
    }
    else {
      if( robot_controller.chosen_robot ) {
        if( robot_controller.chosen_robot.online_local ) {
          communication_controller.local_connection.send( msgString );
        }
        else if( robot_controller.chosen_robot.online_cloud ) {
          communication_controller.appServerConnection.send( msgString, topic, msg );
          communication_controller.serverSendMessage( topic );
        }
        else {
          if( blue.socketId >= 0 ) {
            blue.send( msgString, topic, msg );
          }
          else {
            if( msg.ra > 0 )
              msg.ra += 1;
          }
        }
      }
      else {
        if( communication_controller.appServerConnection.connected ) {
          communication_controller.appServerConnection.send( msgString, topic, msg, sendImmediately );
          communication_controller.serverSendMessage( topic );
        }
        else {
          if( blue.socketId >= 0 )
            blue.send( msgString, topic, msg );
        }
      }
    }

    if( msg.ra > 0 ) {
      communication_controller.addToBuffer( msg );
    }
    return msg;
  },

  serverSendMessage: (topic)=>{
    communication_controller.numberOfMessages += 1;
    if( !communication_controller.messageTypes[topic] ) {
      communication_controller.messageTypes[topic] = 0;
    }
    communication_controller.messageTypes[topic] += 1;
    var newTime = new Date();
    if( newTime - communication_controller.lastCheckTime > 1000 ) {
      let hz = communication_controller.numberOfMessages / ((newTime - communication_controller.lastCheckTime) / 1000);
      event_controller.call_callback( 'new_frequency_measurement', hz, communication_controller.messageTypes );
      communication_controller.numberOfMessages = 0;
      communication_controller.messageTypes = {};
      communication_controller.lastCheckTime = newTime;
    }
  },

  sendUnquedMessagesAgain: ()=>{
    console.log( "Sending unqued messages again", JSON.copy( communication_controller.sendBuffer ) );
    JSON.copy( communication_controller.sendBuffer ).forEach( function( msg )
    {
      if( !msg.qued )
      {
        console.log( "sending unsent", msg );
        communication_controller.sendWithUUID( msg.topic, msg.data, msg.server, msg.ra, msg.UUID );
      }
    } );
  },
  
  setCredentials: (username, password)=>{
    communication_controller.username = username;
    communication_controller.password = password;
    communication_controller.autoLogin = true;
  },

  sendLogin: (reason=null )=>{
    reason = reason ? reason : "Unknown";
    let message = {
      username: communication_controller.username,
      password: communication_controller.password,
      send_customer_jobs: developer_screen.customer_jobs,
      appVersion: APP_VERSION_NUMBER,
      reason: reason
    }
    logger.debug("Sending login with reason:", message.reason);

    communication_controller.send( "login_user", message, "cloud", 5 );
  },

  connectToRobot: (robot_id)=>{
    robot_controller.chosen_robot_id = robot_id;
    communication_controller.autoConnect = true;
    if( communication_controller.appServerConnection.connected )
      communication_controller.doConnectToRobot();
  },

  disconnectFromRobot: ()=>{
    robot_controller.chosen_robot_id = null;
    communication_controller.autoConnect = false;
    communication_controller.doConnectToRobot();
  },
  doConnectToRobot: ()=>{
    communication_controller.send( "connect_to_robot", {
      robot: robot_controller.chosen_robot_id
    }, "cloud", 5 );
  },

  ping_start_time: {
    "any": 0,
    "cloud": 0,
    "blue": 0
  },
  last_ping_time: {
    "any": Infinity,
    "cloud": Infinity,
    "blue": Infinity
  },
  timeout_timer: {
    "any": 0,
    "cloud": 0,
    "blue": 0
  },
  max_ping: {
    "any": 0,
    "cloud": 0,
    "blue": 0
  },
  min_ping: {
    "any": 10000,
    "cloud": 10000,
    "blue": 10000
  },

  ping_timeout_manual: {
    any: 20000,
    all: 20000,
    cloud: 20000,
    blue: 20000
  },
  ping_timeout_auto: {
    any: 10000,
    all: 10000,
    cloud: 10000,
    blue: 2000
  },
  get ping_timeout()
  {
    if( robot_controller.chosen_robot.in_auto )
      return communication_controller.ping_timeout_auto;
    else
      return communication_controller.ping_timeout_manual;
  },
  ping_end_callback: function( server )
  {
    event_controller.call_callback( "got_" + server + "_ping", communication_controller.last_ping_time[server] );
  },
  ping: function( robot, server )
  {
    if( !robot_controller.chosen_robot_id )
      return;
    if( !robot )
      robot = robot_controller.chosen_robot_id;
    if( !server )
      server = "any";
    if( !communication_controller.ping_start_time[server] )
    {
      communication_controller.ping_start_time[server] = time.now;
      communication_controller.send( "ping", {
        robot: robot,
        route: server
      }, server, 0 );

      communication_controller.timeout_timer[server] = setTimeout( function( )
      {
        communication_controller.ping_timeout_action( server );
        communication_controller.ping_end_callback( server );
      }, communication_controller.ping_timeout[server] );
    }
  },
  ping_timeout_action: function( server )
  {
    communication_controller.ping_start_time[server] = 0;
    communication_controller.last_ping_time[server] = communication_controller.ping_timeout[server] + 1;
  },
  ping_end: function( server )
  {
    // Do not react to stray ping
    if( communication_controller.ping_start_time[server] === 0 )
      return;
    communication_controller.last_ping_time[server] = time.now - communication_controller.ping_start_time[server];
    communication_controller.ping_start_time[server] = 0;
    logger.debug( server, "ping", communication_controller.last_ping_time[server] );
    if( communication_controller.last_ping_time[server] > communication_controller.max_ping[server] && communication_controller.last_ping_time[server] < 10000 )
      communication_controller.max_ping[server] = communication_controller.last_ping_time[server];
    if( communication_controller.last_ping_time[server] < communication_controller.min_ping[server] )
      communication_controller.min_ping[server] = communication_controller.last_ping_time[server];
    if( communication_controller.timeout_timer[server] )
      clearInterval( communication_controller.timeout_timer[server] );
    communication_controller.ping_end_callback( server );
  },
  infinite_ping: function( server )
  {
    communication_controller.max_ping = 0;
    communication_controller.min_ping = 10000;
    communication_controller.ping_end_callback = function()
    {
      setTimeout( function()
      {
        communication_controller.ping( robot_controller.chosen_robot_id, server );
      }, 1 );
    };
    communication_controller.ping( robot_controller.chosen_robot_id, server );
  },
  stop_infinite_ping: function( )
  {
    communication_controller.ping_end_callback = function()
    {};
    console.log( "max_ping " + communication_controller.max_ping );
    console.log( "min_ping " + communication_controller.min_ping );
  },
  connected_cloud: function( )
  {
    console.log( "Connected to Cloud" );
    event_controller.call_callback( "connected_to_cloud" );
  },
  connected_robot: function( )
  {
    console.log( "Connected to Robot" );
    event_controller.call_callback( "connected_to_robot" );
  },
  lost_packages_from_robot: 0,
  lost_packages_from_cloud: 0,
  check_old_messages: function( )
  {
    if( window.bootTime )
    {
      window.bootTime.get( function( new_boot_time )
      {
        const new_time = time.now + communication_controller.timeOffset;
        communication_controller.check_old_messages_with_time( new_time );
      } );
    }
    else
    {
      const new_time = (new Date).getTime();
      communication_controller.check_old_messages_with_time( new_time );
    }
  },
  check_old_messages_with_time: function( current_time )
  {
    for( var i = 0; i < communication_controller.sendBuffer.length; i++ )
    {
      var msg = communication_controller.sendBuffer[i];
      var should_send = false;
      should_send |= msg.server === "cloud" && communication_controller.appServerConnection && communication_controller.appServerConnection.connected;
      should_send |= msg.server === "robot" && robot_controller.chosen_robot && robot_controller.chosen_robot.online_local === "online";
      should_send |= msg.server === "any" &&
        ((communication_controller.appServerConnection && communication_controller.appServerConnection.connected) ||
          (robot_controller.chosen_robot && robot_controller.chosen_robot.online_local === "online"));
      should_send = true; // WHAT IS THIS??
      if( should_send )
      {

        if( current_time - msg.time > 2000 )
        {
          console.log( "resend to", msg.server, msg );
          if( msg.server === "robot" )
          {
            communication_controller.lost_packages_from_robot++;
          }
          else if( msg.server === "cloud" )
          {
            communication_controller.lost_packages_from_cloud++;
          }
          else
          {
            if( robot_controller.chosen_robot && robot_controller.chosen_robot.online_local )
            {
              communication_controller.lost_packages_from_robot++;
            }
            else
            {
              communication_controller.lost_packages_from_cloud++;
            }
          }

          if( communication_controller.lost_packages_from_robot > 20 )
          {
            robot_controller.disconnect_robots( "robot" );
            console.log( 'lost wifi connection' );
          }
          if( communication_controller.lost_packages_from_cloud > 20 )
          {
            robot_controller.disconnect_robots( "cloud" );
            console.log( 'lost cloud connection' );
          }

          communication_controller.sendBuffer.splice( i, 1 );
          if( msg.ra !== 0 )
            communication_controller.sendWithUUID( msg.topic, msg.data, msg.server, msg.ra - 1, msg.UUID );

          i--;
        }
      }
      else
      {
        msg.time = current_time;
      }
    }
  },
  check_timer: null,
  start_check_timer: function( )
  {
    if( communication_controller.check_timer ) {
      console.warn("Message buffer check interval already running, aborting...");
      return false;
    }
    console.log("Starting message check timer...");
    communication_controller.check_timer = setInterval( communication_controller.check_old_messages, 100 );
  },
  stop_check_timer: function( )
  {
    clearInterval( communication_controller.check_timer );
    communication_controller.check_timer = null;
  },

  startAppServerConnectionKeepAliveInterval: ()=>{
    if (communication_controller._appServerConnectionKeepAliveInterval) {
      console.log("Keep alive interval already started, aborting...");
      return false;
    }
    communication_controller._appServerConnectionKeepAliveInterval = new IntervalHandler(
      "App server connection keep alive interval",
      ()=>{communication_controller.send( "keep_alive", {}, "cloud", 0, true);}, // Send immediately
      window,
      1, 
      communication_controller._appServerConnectionKeepAliveIntervalTime * 1000); // Seconds
    communication_controller._appServerConnectionKeepAliveInterval.start();
  },

  stopAppServerConnectionKeepAliveInterval: ()=>{
    communication_controller._appServerConnectionKeepAliveInterval.stop();
    communication_controller._appServerConnectionKeepAliveInterval = null;
  },

  send_key_val: function( key, val )
  {
    communication_controller.send( "save_key_val", {
      key: key,
      val: val
    }, "cloud", 5 );
  },
};

communication_controller._AppDNSDefaults = {
  default_settings: true,
  prepend_hostname: true,
  use_secure: false,
  address: "appserver.tinymobilerobots.com",
  port: 8083,
};
Object.freeze(communication_controller._AppDNSDefaults);

$(function() {  
  document.addEventListener("pause", ()=>{
    if (   robot_controller.user_state === TopStates.MANUAL
        && !run_pitch_controller.running
        && !permission_controller.queue.running
        && !file_controller.pluginFileOpenerIsActive
        && !stress_test.isRunning) {
      communication_controller.stop_check_timer();
      communication_controller.closeAppServerConnectionWithoutReconnecting("App paused");
      joystick_controller.stop_timer();
      blue.disconnect();
    }
  }, false );

  document.addEventListener("resume", ()=>{
    communication_controller.start_check_timer();
    if (!communication_controller.appServerConnection.connected) {
    communication_controller.createAppServerConnection("App resumed");  
    }
    if (!blue.socket_confirmed) {
      blue.connect_to_robot();
    }
    joystick_controller.start_timer();
    popup_screen_controller.close_info_waiter();
  }, false );
    
  event_controller.add_callback( "user_login_success", communication_controller.sendUnquedMessagesAgain );

  event_controller.add_callback( "app_server_connection_established", ()=>{
    errorIndicatorController.removeError(indicatorErrors.NO_APP_SERVER_CONNECTION);
    bottom_bar_chooser.reload_bottom_bar();
  });

  event_controller.add_callback("app_server_connection_lost", ()=>{
    errorIndicatorController.addError(indicatorErrors.NO_APP_SERVER_CONNECTION);
    bottom_bar_chooser.reload_bottom_bar();
  });

  communication_controller.start_check_timer();

});
