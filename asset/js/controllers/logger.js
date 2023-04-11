/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global logger */

var logger = {
  debug: function()
  {
    console.debug.apply( arguments.callee.caller, arguments );
    // console.debug.apply( arguments.callee.caller, [`[${new Date().toISOString().slice(11,23)}]`].concat([].slice.call(arguments) ) );
  },
  auto_start_remote_debugger()
  {
    let last_enable = parseInt( localStorage.getItem( "support.last_enable" ) );
    let now = (new Date).getTime();
    let diff = now - last_enable;
    if( diff < (1000 * 60 * 10) )
      logger.start_remote_debugger();
    else
      return true;
    
    
    if( !communication_controller )
      return false;
    if( !communication_controller.username )
      return false;
    return true;
  },
  start_remote_debugger: function()
  {
    if( !logger.vorlonProd )
      logger.vorlonProd = new VORLON.Production( "http://vorlon.tinymobilerobots.com:8082", "default" );
    if( !communication_controller )
      return false;
    if( !communication_controller.username )
      return false;

    logger.vorlonProd.setIdentity( communication_controller.username.toLowerCase() );
    logger.vorlonProd.activate( false );

    localStorage.setItem( "support.last_enable", (new Date).getTime() );
    help_screen.open();
    return true;
  },
  print_filters()
  {
    console.log("%c-ok -reconf -pos -ping -display -robots -keep_alive", 'color: red; font-size: 15px;')
  }
};


let inter = setInterval( function()
{
  if( logger.auto_start_remote_debugger() )
    clearInterval( inter );
}, 1000 );
if( logger.auto_start_remote_debugger() )
  clearInterval( inter );


