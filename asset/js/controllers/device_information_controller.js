/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global cordova, communication_controller, message_controller, permission_controller, event_controller */

var device_information_controller = {

  sendDeviceInformation: function()
  {

    // Send phone info
    device_information_controller.getPhoneInformation( function( info )
    {
      console.log( info );

      info = info.parsedCards;

      if( info.simSerialNumber !== "N/A" )
      {
        console.log( "sending ICC" );
        communication_controller.send_key_val( "ICC", info.simSerialNumber );
      }
      if( info.deviceId !== "N/A" )
      {
        console.log( "Sending IMEI" );
        communication_controller.send_key_val( "IMEI", info.deviceId );
      }
      console.log( "Sending netCountry" );
      communication_controller.send_key_val( "netCountry", info.countryCode );
      console.log( "Sending netName" );
      communication_controller.send_key_val( "netName", info.carrierName );
    } );

    // Send device info
    if(device)
    {
      communication_controller.send_key_val( "device_platform", device.platform ? device.platform : "N/A" );
      communication_controller.send_key_val( "device_version", device.version ? device.version : "N/A" );
      communication_controller.send_key_val( "device_model", device.model ? device.model : "N/A" );
      communication_controller.send_key_val( "device_cordova", device.cordova ? device.cordova : "N/A" );
    }

  },

  getPhoneInformation( callback, error_callback )
  {
    permission_controller.getPermission( "READ_PHONE_STATE", function( ok )
    {
      if( ok )
      {
        window.plugins.sim.getSimInfo( function(info)
        {
          try {
          // Aggregate data
          let cards = {};
          info.cards.forEach(card=>{
            Object.keys(card).forEach(key=>{
              if(!cards[key])
                cards[key] = [];
              cards[key].push(card[key]);
            });
          });
          Object.keys(cards).forEach(key=>{
            if(cards[key].length === 1)
              cards[key] = cards[key][0];
            else
              cards[key] = cards[key].join(",");
          });

          cards.simSerialNumber = cards.simSerialNumber ? cards.simSerialNumber : "N/A";
          cards.deviceId = cards.deviceId ? cards.deviceId : "N/A";
          cards.countryCode = cards.countryCode ? cards.countryCode : "N/A";
          cards.carrierName = cards.carrierName ? cards.carrierName : "N/A";

          info.parsedCards = cards;

          info.simStateTranslated = device_information_controller.getSimStateTranslation(info.simState);
          info.dataActivityTranslated = device_information_controller.getDataActivityTranslated(info.dataActivity);
          info.networkTypeTranslated = device_information_controller.getNetworkTypeTranslation(info.networkType);

          callback(info);

          } catch (error) {
            console.log("Unable to obtain phone information - is SIM-card inserted?", error);
          }
        }, error_callback );
      }
    } );
  },
  getSimStateTranslation(type)
  {
    switch(type)
    {
      case 1: return "Absent";
      case 2: return "PinRequired";
      case 3: return "PukRequired";
      case 4: return "NetworkLocked";
      case 5: return "Ready";
      case 6: return "NotReady";
      case 7: return "PermDisabled";
      case 8: return "CardIoError";
      case 9: return "CardRestricted";
      case 0:
      default: return "Unknown";
    }
  },
  getDataActivityTranslated(type)
  {
    switch(type)
    {
      case 1: return "In"; // Currently receiving IP PPP traffic.
      case 2: return "Out"; // Currently sending IP PPP traffic.
      case 3: return "Inout"; // Currently both sending and receiving IP PPP traffic.
      case 4: return "Dormant";
      case 0: return "None"; // No traffic.
      default: return "Unknown"; 
    }
  },
  getNetworkTypeTranslation(type)
  {
    switch (type) {
      case 1: return "Gprs";
      case 2: return "Edge";
      case 3: return "Umts";
      case 4: return "Cdma";
      case 5: return "Evdo0";
      case 6: return "EvdoA";
      case 7: return "OneXrtt";
      case 8: return "Hsdpa";
      case 9: return "Hsupa";
      case 10: return "Hspa";
      case 11: return "Iden";
      case 12: return "EvdoB";
      case 13: return "Lte";
      case 14: return "Ehrpd";
      case 15: return "Hspap";
      case 16: return "Gsm";
      case 17: return "TdScdma";
      case 18: return "Iwlan";
      case 0:
      default: return "Unknown";
    }
  }
};


$( document ).ready( function()
{

  event_controller.add_callback( "user_login_success", function()
  {
    device_information_controller.sendDeviceInformation();
  } );

} );