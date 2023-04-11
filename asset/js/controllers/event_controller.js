/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global logger */

class MultiEventController
{
  constructor()
  {
    this.callbacks = {};
    this.once = [ ];
    this.print_timing = false;
  }
  add_callback( type, callback, once )
  {
    callback.once = once;
    if( !this.callbacks[type] )
      this.callbacks[type] = [ ];
    if( this.callbacks[type].indexOf( callback ) === -1 )
      this.callbacks[type].push( callback );
    else
    {
      console.warn( "Callback allready added", type, callback );
//      printStack();
    }
  }
  remove_callback( type, callback )
  {
    if( this.callbacks[type] && this.callbacks[type].indexOf( callback ) >= 0 )
    {
      this.callbacks[type].splice( this.callbacks[type].indexOf( callback ), 1 );
    }
    else if( this.callbacks[type] && this.callbacks[type].findIndex( cb => cb.name === callback ) >= 0 )
    {
      this.callbacks[type].splice( this.callbacks[type].findIndex( cb => cb.name === callback ), 1 );
    }
    else if( this.callbacks[type] && this.callbacks[type].findIndex( cb => cb.name === callback.name ) >= 0 )
    {
      this.callbacks[type].splice( this.callbacks[type].findIndex( cb => cb.name === callback.name ), 1 );
    }
    else
    {
      logger.debug( "Could not remove callback", type, callback );
    }
  }
  registered( type )
  {
    return type in this.callbacks;
  }
  call_callback( )
  {
    var this_controller = this;
    var type = arguments[0];
    var args = [ ];
    for( var i = 1; i < arguments.length; i++ )
    {
      args.push( arguments[i] );
    }
    var something_called = false;
    if( !this.callbacks[type] )
      this.callbacks[type] = [ ];
    if( this.callbacks[type] )
    {
      var callbacks = this.callbacks[type].slice();
      callbacks.forEach( function( callback )
      {
        if( callback )
        {
          var then = performance.now();
          callback.apply( null, args );
          var now = performance.now();
          if( callback.once )
            this_controller.remove_callback( type, callback );

          if( now - then > 50 || this_controller.print_timing )
          {
            let console_func = logger.debug;
            if( this_controller.print_timing )
              console_func = console.warn;
            if( callback.name )
              console_func( "Callback", type, "with function", callback.name, "took", now - then, callback );
            else
              console_func( "Callback", type, "with anonymous function took", now - then, callback );
          }
          something_called = true;
        }
        else
        {
          console.warn( "Undefined callback encountered" );
        }
      } );
    }
    return something_called;
  }
}
event_controller = new MultiEventController();
/*
 var event_controller = {
 callbacks: {},
 add_callback: function ( type, callback ) {
 if ( !event_controller.callbacks[type] )
 event_controller.callbacks[type] = [];
 event_controller.callbacks[type].push( callback );
 },
 remove_callback: function ( type, callback ) {
 if ( event_controller.callbacks[type] && event_controller.callbacks[type].indexOf( callback ) >= 0 ) {
 event_controller.callbacks[type].splice( event_controller.callbacks[type].indexOf( callback ), 1 );
 }
 },
 call_callback: function ( ) {
 var type = arguments[0];
 var args = [];
 for ( var i = 1; i < arguments.length; i++ ) {
 args.push( arguments[i] );
 }
 var handled = false;
 if ( event_controller.callbacks[type] ) {
 event_controller.callbacks[type].forEach( function ( callback ) {
 handled |= callback.apply( null, args );
 } );
 }
 return handled;
 }
 };
 */