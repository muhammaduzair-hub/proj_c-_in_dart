/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* ----- jQuery ----- */
q$cache = {
  cache: {
    store: {},
    create()
    {
      var store = q$cache.cache.store;
      return {
        has( key )
        {
          return (key in store);
        },
        get( key )
        {
          return store[key];
        },
        set( key, value )
        {
          store[key] = value;
        },
        del( key )
        {
          delete store[key];
        }
      };
    }
  }
};
q$ = memoize( $, q$cache );

q$html = function( selector )
{
  var obj = q$( selector );
  if( !obj.original_html )
  {
    var last_html = obj.html();
    obj.original_html = obj.html;
    obj.html = function( new_html_val )
    {
      if( new_html_val === undefined )
        return last_html;
      else
      {
        if( new_html_val === last_html )
          return obj;
        else
        {
          last_html = new_html_val;
          return obj.original_html( new_html_val );
        }
      }
    };
  }
  return obj;
};
q$text = function( selector )
{
  var obj = q$( selector );
  if( !obj.original_text )
  {
    var last_text = obj.text();
    obj.original_text = obj.text;
    obj.text = function( new_text_val )
    {
      if( new_text_val === undefined )
        return last_text;
      else
      {
        if( new_text_val === last_text )
          return obj;
        else
        {
          last_text = new_text_val;
          return obj.original_text( new_text_val );
        }
      }
    };
  }
  return obj;
};
q$val = function( selector )
{
  var obj = q$( selector );
  if( !obj.original_val )
  {
    obj.last_val = obj.val();
    obj.original_val = obj.val;
    obj.val = function( new_val )
    {
      if( new_val === undefined )
        return obj.last_val;
      else
      {
        if( new_val === obj.last_val )
          return obj;
        else
        {
          obj.last_val = new_val;
          return obj.original_val( new_val );
        }
      }
    };
  }
  return obj;
};

q$class = function( selector )
{
  var obj = q$( selector );
  if( !obj.original_addClass )
  {
    obj.original_addClass = obj.addClass;
    obj.original_removeClass = obj.removeClass;
    var class_string = obj.attr( "class" );
    if( !class_string )
      class_string = "";
    var classes = class_string.split( " " );
    obj.addClass = function( new_class )
    {
      if( classes.indexOf( new_class ) >= 0 )
        return obj;
      else
      {
        classes.push( new_class );
        obj.original_addClass( new_class );
      }
    };
    obj.removeClass = function( new_class )
    {
      if( classes.indexOf( new_class ) === -1 )
        return obj;
      else
      {
        classes.splice( classes.indexOf( new_class ), 1 );
        obj.original_removeClass( new_class );
      }
    };
  }
  return obj;
};

/* ---------- Array ---------- */
/* global settings_screeen_controller, robot_controller */

Array.prototype.copy = function(  )
{
  return this.map( function( e )
  {
    return e.copy();
  } );
};
Array.prototype.last = function( minux_index = 0)
{
  return this[this.length - 1 + minux_index];
};

Array.prototype.diff = function( a )
{
  // Returns values that are in this and not a
  return this.filter( function( i )
  {
    return a.indexOf( i ) < 0;
  } );
};

Array.prototype.pushAll = function( a )
{
  a.forEach( ( e ) => {
    this.push( e );
  } );
  return a;
};

Array.prototype.toVector = function( )
{
  return new Vector( this[0], this[1] );
};

Array.prototype.toVector3 = function( )
{
  return new Vector3( this[0], this[1], this[2] );
};

Array.prototype.sort_objects = function( by_key, descending, ignore_case )
{
  var sort_keys = by_key;
  if( !(sort_keys instanceof Array) )
    sort_keys = [ sort_keys ];

  function comp( a, b, key_index )
  {
    if( key_index >= sort_keys.length )
      return 0;

    var v1 = a[sort_keys[key_index]];
    var v2 = b[sort_keys[key_index]];
    if( ignore_case )
    {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if( v1 > v2 )
      return descending ? -1 : 1;
    if( v1 === v2 )
      return comp( a, b, key_index + 1 );
    if( v1 < v2 )
      return descending ? 1 : -1;
  }

  return this.sort( function( a, b )
  {
    return comp( a, b, 0 );

  } );
};
Array.prototype.sort_num = function( descending )
{
  return this.sort( function( v1, v2 )
  {

    if( v1 > v2 )
      return descending ? -1 : 1;
    if( v1 === v2 )
      return 0;
    if( v1 < v2 )
      return descending ? 1 : -1;

  } );
};

Array.prototype.remove_duplicates = function( )
{
  return this.filter( ( v, i ) => this.indexOf( v ) === i );
};


Array.prototype.set_val_of = function( key, val )
{
  for( var i = 0; i < this.length; i++ )
  {
    if( this[i].key === key )
    {
      this[i].value = val;
      return true;
    }
  }
  return false;
};

Array.prototype.fliplr = function(  )
{
  return this.map( ( row ) => {
    return row.copy().reverse();
  } );
};

Array.prototype.flipud = function(  )
{
  return this.copy().reverse();
};

function range( from, to )
{
  var a = [ ];
  for( var i = from; i < to; i++ )
    a.push( i );
  return a;
}

Array.prototype.count = function( element )
{
  var num = 0;
  this.forEach( e => {
    if( e === element )
      num++;
  } );
  return num;
};

Array.prototype.closest = function( n )
{
  var a = this.map( t => {
    return [ Math.abs( t - n ), t ];
  } ).sort_objects( 0, false );
  return a[0][1];
};

Array.prototype.closestIndexBinarySearch = function (num) {
  let mid;
  let lo = 0;
  let hi = this.length - 1;
  while (hi - lo > 1) {
    mid = Math.floor((lo + hi) / 2);
    if (this[mid] < num) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (num - this[lo] <= this[hi] - num) {
    return lo;
  }
  else {
    return hi;
  }
};

Array.prototype.closestBinarySearch = function (num) {
  return this[this.closestIndexBinarySearch(num)];
};


if( !Array.prototype.flat )
{
  Array.prototype.flat = function( depth = 1)
  {
    var flattened = [ ];
    this.forEach( e => {
      if( e instanceof Array )
      {
        if( depth )
          flattened.pushAll( e.flat( depth - 1 ) );
        else
          flattened.push( e );
      }
      else
        flattened.push( e );
    } );
    return flattened;
  };
}

Array.prototype.equal = function( b )
{
  if( this === b )
    return true;
  if( this === null || b === null )
    return false;
  if( this.length !== b.length )
    return false;
  for( var i = 0; i < this.length; ++i )
  {
    if( this[i] !== b[i] )
      return false;
  }
  return true;
};


/* ---------- Number ---------- */
Number.prototype.coerce = function( min, max )
{
  var new_val = 0 + this;
  if( new_val < min )
    new_val = min;
  if( new_val > max )
    new_val = max;
  return new_val;
};

Number.prototype.mod = function( n )
{
  return ((this % n) + n) % n;
};

Number.prototype.xor = function( bar )
{
  var foo = this + 0;
  return ((foo && !bar) || (!foo && bar)) + 0;
};

Number.prototype.veryclose = function( to )
{
  var diff = Math.abs( this - to );
  return diff < 0.0001;
};

Number.prototype.copy = function()
{
  return this + 0;
};

Object.defineProperty( Number.prototype, 'abs', {
  get: function()
  {
    return Math.abs( this );
  }
} );

Object.defineProperty( Number.prototype, 'normalizeAngle', {
  get: function()
  {
    if( this < 0 )
      return this + Math.PI * 2;
    if( this > Math.PI * 2 )
      return this - Math.PI * 2;
    return this + 0;
  }
} );

Object.defineProperty( Number.prototype, 'normalizeAnglePlusMinus', {
  get: function()
  {
    if( this < -Math.PI )
      return this + Math.PI * 2;
    if( this > Math.PI )
      return this - Math.PI * 2;
    return this + 0;
  }
} );

Number.prototype.unit2meter = function( use_this )
{
  if( !use_this )
    use_this = settings_screeen_controller.unit;

  // https://proj.org/operations/conversions/unitconvert.html?highlight=units#distance-units

  switch( use_this )
  {
    case "ft":
      return this.foot2meter();
      break;
    case "us-ft":
      return this.foot2meter( true );
      break;
    case "yard":
      return this.yard2meter();
      break;
    case "m":
    default:
      return this + 0;
  }
};

Number.prototype.meter2unit = function( use_this )
{
  if( !use_this )
    use_this = settings_screeen_controller.unit;

  // https://proj.org/operations/conversions/unitconvert.html?highlight=units#distance-units

  switch( use_this )
  {
    case "ft":
      return this.meter2foot();
      break;
    case "us-ft":
      return this.meter2foot( true );
      break;
    case "yard":
      return this.meter2yard();
      break;
    case "m":
    default:
      return this + 0;
  }
};

Number.prototype.projunit2meter = function()
{
  if( robot_controller.chosen_robot.projector )
    return this * robot_controller.chosen_robot.projector.pr.unit2meter;
  else
    return this + 0;
};

Number.prototype.meter2projunit = function()
{
  if( robot_controller.chosen_robot.projector )
    return this / robot_controller.chosen_robot.projector.pr.unit2meter;
  else
    return this + 0;
};


Number.prototype.inch2meter = function( )
{
  return this * 0.0254;
};

Number.prototype.foot2meter = function( use_survey = false)
{
  if( use_survey )
    return this * (1200 / 3937);   // U.S Survey feet
  else
    return this * 0.3048;
};

Number.prototype.yard2meter = function( use_this = 0.9144)
{
  return this * use_this;
};

Number.prototype.mile2meter = function( use_survey = true)
{
  if( use_survey )
    return this * (6336 / 3937 * 1000);   // U.S Survey mile
  else
    return this * 1609.34422;  // British mile
};

Number.prototype.meter2inch = function( )
{
  return this / 0.0254;
};

Number.prototype.meter2foot = function( use_survey = false)
{
  if( use_survey )
    return this / (1200 / 3937);   // U.S Survey feet
  else
    return this / 0.3048;
};

Number.prototype.meter2yard = function( use_this = 0.9144)
{
  return this / use_this;
};

Number.prototype.meter2mile = function( use_survey = true)
{
  if( use_survey )
    return this / (6336 / 3937 * 1000);   // U.S Survey mile
  else
    return this / 1609.34422;  // British mile
};

Number.prototype.meter2prettyEmpirish = function()
{
  var rest = this;

  var miles = 0;
  //var miles = Math.floor( rest.meter2mile( ) );
  //rest -= miles.mile2meter( );
  var yards = Math.floor( rest.meter2yard() );
  rest -= yards.yard2meter();
  var feet = Math.floor( rest.meter2foot() );
  rest -= feet.foot2meter();
  var inch = rest.meter2inch();

  var s = "";
  if( miles )
    s += miles + " miles, ";
  if( yards )
    s += yards + " yards, ";
  if( feet )
    s += feet + " feet, ";
  if( inch )
    s += inch + " inch";

  return s;
};
Number.prototype.rad2deg = function()
{
  return this * (180 / Math.PI);
};
Number.prototype.deg2rad = function()
{
  return this * (Math.PI / 180);
};
Number.prototype.round = function( fixed_width = 0)
{
  magnitude = Math.pow( 10, parseInt(fixed_width) );
  return Math.round( this * magnitude ) / magnitude;
};
Number.prototype.ceil = function( magnitude = 1)
{
  return Math.ceil( this * magnitude ) / magnitude;
};
Number.prototype.floor = function( magnitude = 1)
{
  return Math.floor( this * magnitude ) / magnitude;
};
Number.prototype.abslimit = function( abs_max )
{
  if( this > abs_max )
    return abs_max;
  if( this < -abs_max )
    return -abs_max;
  return this;
};

/* ---------- String ---------- */
String.prototype.startsWith = function( input )
{
  return this.substring( 0, input.length ) === input;
};

String.prototype.toCamelCase = function()
{
  var str = this
    .replace( /\s(.)/g, function( $1 )
    {
      return $1.toUpperCase();
    } )
    .replace( /\s/g, ' ' )
    .replace( /^(.)/, function( $1 )
    {
      return $1.toLowerCase();
    } );
  str[0] = str[0].toUpperCase();
  return str;
};

String.prototype.format = function()
{
  var args = arguments;
  return this.replace( /%(\d+)s/g, function( match, number )
  {
    return typeof args[number - 1] !== 'undefined'
      ? args[number - 1]
      : match
      ;
  } );
};

String.prototype.splitFloats = function()
{
  if( this.length === 0 )
  {
    return [ ];
  }
  else
  {
    return this.replace( /e-/g, "e+" ).replace( /-/g, " -" ).replace( "e+", "e-" ).replace( /,/g, " " ).replace( /  /g, " " ).trim().split( /[ ,]/g ).map( s => !!s ? parseFloat( s ) : null ).filter(n=>n!==null);
  }
};

String.prototype.toVector = function( invert_y = false, invert_x = false)
{
  var parts = this.splitFloats();
  if( parts.length > 2 )
  {
    var vectors = [ ];
    for( var i = 0; i < parts.length; i += 2 )
      vectors.push( new Vector( parts[i] * (invert_x ? -1 : 1), parts[i + 1] * (invert_y ? -1 : 1) ) );
    return vectors;
  }
  else
    return new Vector( parts[0] * (invert_x ? -1 : 1), parts[1] * (invert_y ? -1 : 1) );
};

/* ---------- Object ---------- */

Object.values = function( obj )
{
  return Object.keys( obj ).map( k => obj[k] );
};

Object.keysStartingWith = function( obj, prefix )
{
  return Object.keys( obj ).filter( function( k )
  {
    return k.indexOf( prefix ) === 0;
  } );
};
Object.hasOwnNestedProperty = function( obj, path )
{
  if( !path || typeof path !== "string" )
    return false;

  var properties = path.split( '.' );

  for( var i = 0; i < properties.length; i++ )
  {
    var prop = properties[i];

    if( !obj || !obj.hasOwnProperty( prop ) )
    {
      return false;
    }
    else
    {
      obj = obj[prop];
    }
  }

  return true;
};
if(!Object.fromEntries)
{
  Object.fromEntries = function(entries = [])
  {
    const obj = {};
    entries.forEach(entry=>obj[entry[0]] = entry[1]);
    return obj;
  }
}