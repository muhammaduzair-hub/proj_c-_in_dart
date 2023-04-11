/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global da_translate, de_translate, en_translate, translation, settings_screeen_controller, robot_controller, all_translations, DEBUG_MODE, dev_translations */

if( !window.translation )
{
  translation = {};
  translation.languages = [ ];
  translation.language_names = [ ];
}

translation.set_language = function( lan )
{
  translation.language = lan;
  window.use_translate = translations[lan];
};

function translate_unit( short = true, proj = false)
{
  var unit = settings_screeen_controller.unit;

  if( proj && robot_controller.chosen_robot.projector )
    unit = robot_controller.chosen_robot.projector.pr.units;

  switch( unit )
  {
    case "ft":
      return short ? translate["ft"] : translate["feet"];
      break;
    case "us-ft":
      return short ? translate["us-ft"] : translate["US feet"];
      break;
    case "yard":
      return short ? translate["yd"] : translate["yard"];
      break;
    case "m":
    default:
      return short ? translate["m"] : translate["meter"];
}
}

const missing_translations = new Set();
let translate_handler = {
  get( _, name )
  {
    if( use_translate[name] )
    {
      return use_translate[name];
    }
    else
    {
      const case_insensitive_entry = Object.entries(use_translate).find(entry=>entry[0].toLowerCase()===name.toLowerCase());
      if (case_insensitive_entry && case_insensitive_entry[1]) {
        return case_insensitive_entry[1];
      }
      else if( translations["us"][name] )
      {
        return translations["us"][name];
      }
      else if( typeof(name) !== "string" && name === undefined || name === null || name === "undefined" || (typeof(name) === "number" && isNaN(name)) || name === false ) 
      {
        return translate["N/A"];
      }
      else if( name )
      {
        if( DEBUG_MODE && !missing_translations.has( name ) )
        {
          console.groupCollapsed( "%cTranslation missing", "color: PowderBlue;font-weight:bold; background-color: #444; padding: 3px 7px; margin-left: -7px;", name );
          {
            console.trace();
            console.log( "(Added to missing_translations" );
            missing_translations.add( name );
            console.groupCollapsed( "Missing translations" );
            {
              console.table( [ ...missing_translations ] );
            }
            console.groupEnd();
          }
          console.groupEnd();
        }
        return name;
      }
    }
  }
};

var translate = new Proxy( {}, translate_handler );

translation.num2text = function( num )
{
  switch( num )
  {
    case 1:
      return translate["first"];
    case 2:
      return translate["second"];
    case 3:
      return translate["third"];
    case 4:
      return translate["fourth"];
    case 5:
      return translate["fifth"];
    case 6:
      return translate["sixth"];
    case 7:
      return translate["seventh"];
    case 8:
      return translate["eighth"];
    case 9:
      return translate["ninth"];
  }
};

translation.seconds2time = function( seconds, outputStyle, decimals = 0 )
{

  const s2d = (seconds)=>(seconds/(60 * 60 * 24)).round(decimals);
  const s2h = (seconds)=>(seconds / (60 * 60)).round(decimals);
  const s2m = (seconds)=>(seconds / (60)).round(decimals);

  const seconds2text = (t) => t === 1 ? translate["%1s second"].format(t) : translate["%1s seconds"].format(t);
  const minutes2text = (t) => t === 1 ? translate["%1s minute"].format(t) : translate["%1s minutes"].format(t);
  const hours2text   = (t) => t === 1 ? translate["%1s hour"].format(t) : translate["%1s hours"].format(t);
  const days2text    = (t) => t === 1 ? translate["%1s day"].format(t) : translate["%1s days"].format(t);

  let time_left = seconds;
  const days = Math.floor( time_left / (60 * 60 * 24) );
  time_left = time_left - (days * 60 * 60 * 24);
  const hours = Math.floor( time_left / (60 * 60) );
  time_left = time_left - (hours * 60 * 60);
  const minutes = Math.floor( time_left / (60) );
  time_left = time_left - (minutes * 60);
  time_left = time_left.round(decimals);

  switch(outputStyle)
  {
    case "seconds": return seconds2text(seconds);
    case "minutes": return minutes2text(s2m(seconds));
    case "hours": return hours2text(s2h(seconds));
    case "days": return days2text(s2d(seconds));
    case "all": return translate["TimeDaysHoursMinutesSeconds"].format(days2text(days),hours2text(hours),minutes2text(minutes),seconds2text(time_left));
    case "short":
      let daysText = days !== 0 ? days2text(days) : "";
      let hoursText = hours !== 0 ? hours2text(hours) : "";
      let minutesText = minutes !== 0 ? minutes2text(minutes) : "";
      let secondsText = time_left !== 0 ? seconds2text(time_left) : "";

      return daysText + " " + hoursText + " " + minutesText + " " + secondsText;
    case "nonzero": {
      // Same as all but without zeroed upper times
      // E.g "0 days and 1 hour" has the "0 days" removed
      
      if(days > 0) {
        return translate["TimeDaysHoursMinutesSeconds"].format(days2text(days),hours2text(hours),minutes2text(minutes),seconds2text(time_left));
      }
      else if(hours > 0 && minutes > 0) {
        if (time_left > 0) {
          return translate["TimeHoursMinutesSeconds"].format(hours2text(hours),minutes2text(minutes),seconds2text(time_left));
        } 
        else {
          return translate["TimeHoursMinutes"].format(hours2text(hours), minutes2text(minutes));
        }
      }
      else if(minutes > 0) {
        return translate["TimeMinutesSeconds"].format(minutes2text(minutes),seconds2text(time_left));
      }
      else {
        return seconds2text(time_left);
      }
    };
    case "single":
    default: {
      if(days > 0)
      {
        return days2text(s2d(seconds));
      }
      else if(hours > 0)
      {
        return hours2text(s2h(seconds));
      }
      else if(minutes > 0)
      {
        return minutes2text(s2m(seconds));
      }
      else
      {
        return seconds2text(seconds.round(decimals));
      }
    };
  }

}

var translations = {};
function load_translations()
{
  const all_keys = Object.keys( all_translations );
  const dev_keys = Object.keys( dev_translations );
  delete all_translations["Country Name"].Key;
  const languages = Object.keys( all_translations["Country Name"] );
  languages.forEach( function( lan )
  {
    translations[lan] = {};
    translation.languages.push( lan );
    translation.language_names.push( all_translations["Country Name"][lan] );
  } );

  all_keys.forEach( function( key )
  {
    languages.forEach( function( lan )
    {
      translations[lan][key] = all_translations[key][lan];
    } );
  } );
  dev_keys.forEach( function( key )
  {
    languages.forEach( function( lan )
    {
      translations[lan][key] = dev_translations[key][lan];
    } );
  } );
}
load_translations();

function load_lower_case_translate_keys()
{
  var country_codes = Object.keys( translations );
  country_codes.forEach( function( code )
  {
    var keys = Object.keys( translations[code] );
    keys.forEach( function( key )
    {
      if( translations[code][key] && translations[code][key].toLowerCase ) // functions don't have a toLowerCase key
        translations[code][key.toLowerCase()] = translations[code][key];
    } );
  } );

}
load_lower_case_translate_keys();

translation.set_language( "en" );
