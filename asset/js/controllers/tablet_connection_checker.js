/* event_controller */

const ConnectionState = {
  "UNKNOWN": "unknown",
  "ETHERNET": "ethernet",
  "WIFI": "wifi",
  "CELL_2G": "2g",
  "CELL_3G": "3g",
  "CELL_4G": "4g",
  "CELL": "cellular",
  "NONE": "none"
}
Object.freeze(ConnectionState);

const tablet_connection = {
  last_state: ConnectionState.UNKNOWN,
  state_checker_interval_seconds: 1,
  state_checker_interval: null,
  
  get online()
  {
    return navigator.onLine;
  },
  get state()
  {
    return navigator.connection.type;
  },
  start_state_checker: function()
  {
    clearInterval(tablet_connection.state_checker_interval);
    tablet_connection.state_checker_interval = setInterval(
      tablet_connection.check_state,
      tablet_connection.state_checker_interval_seconds * 1000
    );
  },
  check_state: function()
  {
    if(tablet_connection.state !== tablet_connection.last_state)
    {
      tablet_connection.last_state = tablet_connection.state;
      if(tablet_connection.online)
      {
        event_controller.call_callback("tablet_online");
        console.warn("Tablet just came ONLINE");
      }
      else
      {
        event_controller.call_callback("tablet_offline");
        console.warn("Tablet just went OFFLINE");
      }
    }

    if(tablet_connection.online) {
      errorIndicatorController.removeError(indicatorErrors.NO_INTERNET);
    }
    else {
      errorIndicatorController.addError(indicatorErrors.NO_INTERNET);
    }
  },

  toggle_offline_indicator: function()
  {
    const enable = SETTINGS.show_offline_indicator;

    if(enable && !tablet_connection.online) {
      q$("#tablet_offline_indicator").removeClass("gone");
      q$("#no_app_server_connection_indicator").addClass("gone");
    }
    else {
      q$("#tablet_offline_indicator").addClass("gone");
    }
  }
};

$( document ).ready( function( )
{  
  tablet_connection.start_state_checker();
});