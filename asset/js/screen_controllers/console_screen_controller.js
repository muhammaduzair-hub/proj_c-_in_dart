/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global settings_screeen_controller */

var console_screen_controller = {
  history: [ ],
  log_error: function()
  {

  },
  log: function( )
  {
    var e = new Error( 'dummy' );
    var stack = e.stack.replace( /^[^\(]+?[\n$]/gm, '' )
      .replace( /^\s+at\s+/gm, '' )
      .replace( /^Object.<anonymous>\s*\(/gm, '{anonymous}()@' )
      .split( '\n' );
    var file = stack[1].split( /\//g ).last( );
    file = file.substr( 0, file.length - 1 );

    var text = "";
    for( var i = 0; i < arguments.length; i++ )
    {
      text += arguments[i] + " ";
    }

    if( console_screen_controller.history.length && console_screen_controller.history[0].args === text )
    {
      console_screen_controller.history[0].n++;
    }
    else
    {
      console_screen_controller.history.unshift( {
        file: file,
        args: text,
        n: 0
      } );
      if( console_screen_controller.history.length > 30 )
      {
        console_screen_controller.history = console_screen_controller.history.slice( 0, console_screen_controller.history.length - 1 );
      }
    }

    console_screen_controller.orig_log.apply( console, arguments );

    console_screen_controller.update_screen();
  },
  update_screen: function( )
  {
    if( !settings_screeen_controller.is_open || !(settings_screeen_controller.chosen_menu === "console_screen") )
      return;

    $( "#settings_screen #console_screen #lines" ).empty( );

    console_screen_controller.history.forEach( function( entry )
    {

      var html = '<div style="float:left;width: 100%;"><div style="float:left">';

      html += entry.args;
      /*for ( var i = 0; i < entry.args.length; i++ ) {
       html += entry.args[i] + ' ';
       }*/

      html += '</div><div style="float:right">';
      html += entry.file;
      html += '</div></div><br>';

      $( "#settings_screen #console_screen #lines" ).append( html );

      /*
       <div style="float:left;width: 100%;">
       <div style="float:left">Dette er en meget lang tekst som bliver så lang at jeg sikker giver op inden jeg gider at skrive mere, den eneste grund til at jeg skriver denne sætning er for at se hvad der sker hvis man skriver en lang sætning.</div>
       <div style="float:right">index.html:14</div>
       </div>
       <br>
       */
    } );

  },

  eval_input: function()
  {
    var input = $( "#settings_screen #console_screen input" ).val();
    $( "#settings_screen #console_screen input" ).val( "" );
    eval( input );
  },

  orig_log: function( )
  {}
};

/*if ( window.navigator.platform !== "Linux x86_64" ) {
 console_screen_controller.orig_log = console.log;
 console.log = console_screen_controller.log;
 }*/

window.onerror = function( msg, url, line, col, error )
{
  console_screen_controller.orig_log( msg, url, line, col, error );
};


event_controller.add_callback( "open_settings_menu", function( settings_screen_name )
{
  if( settings_screen_name === "console_screen" )
    console_screen_controller.update_screen();
} );