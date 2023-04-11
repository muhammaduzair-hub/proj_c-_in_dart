/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Storage, communication_controller, robot_controller, popup_screen_controller, AppType, developer_screen */

const user_level = {
  DEVELOPER: 0,
  DEALER: 1,
  SUPER: 2,
  NORMAL: 3,
  LIMITED: 4
};
Object.freeze(user_level);

var login_screen_controller = {
  _user_level: -1,
  force_developer: false,
  get user_level()
  {
    if( login_screen_controller._user_level === -1 )
    {
      var l = localStorage.getItem( "user.level" );
      if( !l )
        l = "4";
      login_screen_controller._user_level = parseInt( l );
    }
    if( login_screen_controller.force_developer )
      return 0;
    else
      return login_screen_controller._user_level;
  },
  set user_level( val )
  {
    login_screen_controller._user_level = val;
    localStorage.setItem( "user.level", val );
    settings_screeen_controller.toggleUserPermittedButtons();
    communication_controller.send_key_val( "User level", login_screen_controller.get_user_level_name( val ) );
  },

  get user_id()
  {
    if(!login_screen_controller._user_id)
    {
      login_screen_controller._user_id = parseInt(localStorage.getItem( "user.id" ));
    }
    return login_screen_controller._user_id;
  },
  set user_id( val )
  {
    login_screen_controller._user_id = val;
    localStorage.setItem( "user.id", val );
  },
  get customer_id()
  {
    if(!login_screen_controller._customer_id)
    {
      login_screen_controller._customer_id = parseInt(localStorage.getItem( "customer.id" ));
    }
    return login_screen_controller._customer_id;
  },
  set customer_id( val )
  {
    const changed = login_screen_controller._customer_id === undefined ? false : login_screen_controller._customer_id !== val;
    login_screen_controller._customer_id = val;
    localStorage.setItem( "customer.id", val );
    if(changed)
    {
      localStorage.removeItem( "db_jobs.jobs" );
      location.reload();
    }
  },
  _user_level_names: {
    0: "Developer",
    1: "Dealer",
    2: "Super",
    3: "Normal",
    4: "Limited"
  },
  get user_level_names()
  {
    let names = login_screen_controller._user_level_names;
    delete names[user_level.SUPER];
    delete names[user_level.LIMITED];
    return names;
  },
  get_user_level_name( user_level )
  {
    if( user_level in login_screen_controller._user_level_names )
      return login_screen_controller._user_level_names[user_level];
    else
      return "Unknown";
  },
  check_login: function(success_callback = ()=>{}, error_callback = ()=>{})
  {
    let username = localStorage.getItem( "user.username" );
    let password = localStorage.getItem( "user.password" );
    let save = localStorage.getItem( "user.save" ) === "true";

    let username_check = username && username === communication_controller.username;
    let password_check = password && password === communication_controller.password;

    if( username_check && password_check && save )
    {
      login_screen_controller.hide_login();
      return true;
    }
    else if( username && password && save )
    {
      login_screen_controller.show_login();
      return false;
    }
    else
    {
      login_screen_controller._show_login();
      return false;
    }
  },
  show_login: function( )
  {
    if( typeof (Storage) !== "undefined" )
    {
      var save = localStorage.getItem( "user.save" );
      if( save === null )
      {
        save = false;
      }
      else
      {
        save = save === "true";
      }
    }

    $( "#username_input" ).val( localStorage.getItem( "user.username" ) );
    $( "#password_input" ).val( localStorage.getItem( "user.password" ) );
    if( !save )
    {
      login_screen_controller._show_login();
    }
    else
    {
      login_screen_controller.login( true );
    }
    
    /*window.removepopup = function () { console.log( "hello" ); };*/
  },
  _show_login: function()
  { 
    popup_screen_controller.open( "#login_popup" );
    popup_screen_controller.removepopup = function( )
    {};
  },
  hide_login: function( )
  {
    popup_screen_controller.close( "#login_popup" );

    if( !AppType )
      developer_screen.choose_app_type();

  },
  login: function( save )
  {
    var username = $( "#username_input" ).val( ).toLowerCase();
    var password = $( "#password_input" ).val( );
    save = !!save;
    if( !save )
    {
      save = true;
    }

    if( username && password && save )
    {
      localStorage.setItem( "user.username", username );
      localStorage.setItem( "user.password", password );
      localStorage.setItem( "user.save", save );
    }
    else
    {
      login_screen_controller.show_login();
      return;
    }

    robot_controller.user_login_success = function( )
    {
      login_screen_controller.hide_login( );
    };
    robot_controller.user_login_failure = function( )
    {
      var has_been_aproved = localStorage.getItem( "user.aproved_once" ) === "true";
      if( has_been_aproved )
      {
        setTimeout( function()
        {
          communication_controller.appServerConnection.close("User login failed");
        }, 10000 );
      }
      else
      {
        alert( "Wrong username or password" );
        communication_controller.autoLogin = false;
        login_screen_controller.clear_saved_user( );
        location.reload( );
      }
    };
    communication_controller.setCredentials( username, password );
    communication_controller.sendLogin();
  },
  clear_saved_user: function( )
  {
    console.log( "Auto login disabled" );
    localStorage.setItem( "user.save", false );
    localStorage.setItem( "user.aproved_once", false );
    localStorage.removeItem( "robot.chosen" );
  }
};

$(()=>{
  login_screen_controller.login();
});
