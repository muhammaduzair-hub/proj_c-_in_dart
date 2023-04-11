/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global cordova, popup_screen_controller, translate, DEBUG_MODE */

var permission_controller = {
  queue: {
    _queue: [ ],
    running: false,
    add: function( permission, callback, error )
    {
      permission_controller.queue._queue.push( [ permission, callback, error ] );
      permission_controller.queue.run();
    },
    run: function()
    {
      if( !permission_controller.queue.running )
      {
        permission_controller.queue.running = true;
        permission_controller.queue.next();
      }
    },
    next: function()
    {
      if( permission_controller.queue._queue.length === 0 )
      {
        permission_controller.queue.running = false;
        return;
      }
      else
      {
        const item = permission_controller.queue._queue.shift();

        const callback = function( result )
        {
          permission_controller.queue.next();
          item[1]( result );
        };
        permission_controller._getPermission( item[0], callback, item[2] );
      }

    }
  },
  getPermission: function( permission, callback, error )
  {
    permission_controller.queue.add( permission, callback, error );
  },
  _getPermissionRetryCounter: 0,
  _getPermission: function( permission, callback, error )
  {

    if( !window.cordova )
      return;

    logger.debug( "Get Permission", permission );

    var p = permission_controller.correctPermission( permission );

    cordova.plugins.permissions.checkPermission( p,
      function( result )
      {
        if( !result.hasPermission )
        {
          console.log( "Requesting permission", p );
          popup_screen_controller.confirm_popup( translate["PermissionDialogHeader"], translate["PermissionDialogBody"].format( translate["Next"] ), translate["Next"], "", function()
          {
            cordova.plugins.permissions.requestPermission( p, function( result )
            {
              if( permission_controller._getPermissionRetryCounter++ < 2 )
              {
                if( !result.hasPermission )
                {
                  console.warn( "Permission denied, retrying, " + p );
                  permission_controller._getPermission( p, callback );
                }
                else
                {
                  permission_controller._getPermissionRetryCounter = 0;
                  popup_screen_controller.close();
                  callback( result.hasPersmission );
                }
              }
              else
              {
                permission_controller._getPermissionRetryCounter = 0;
                popup_screen_controller.close();
                callback( result.hasPersmission );
                throw "Permission denied, failed, " + p;
              }
            }, error );
          } );
        }
        else
        {
          callback( true );
        }
      },
      function()
      {
        callback( false );
      } );
  },
  correctPermission: function( permission )
  {
    let p = cordova.plugins.permissions[permission.split( "." ).last()];
    if( !p )
    {
      p = "";
      if( permission !== permission.toUpperCase() )
        p += "android.permission.";
      p += permission;
    }
    return p;
  }
};