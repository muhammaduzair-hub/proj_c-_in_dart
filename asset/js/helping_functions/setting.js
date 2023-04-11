/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Infinity, math */

class Setting
{
  constructor( name, defaultVal, onsave, persistent = true, warning_if, warning_popup)
  {
    this.name = "" + name;
    this.default = defaultVal;
    this.persistent = persistent;

    this.warning_if = warning_if;
    this.warning_popup = warning_popup;

    if( onsave !== undefined )
    {
      this.onsave = onsave;
    }
    else
    {
      this.onsave = function( v )
      {
        return;
      };
  }
  }

  get storage()
  {
    if( this.persistent )
      return localStorage.getItem( this.name );
    else
    {
      if( this._v )
        return this._v;
      else
        return null;
    }
  }

  set storage( v )
  {
    if( this.persistent )
      localStorage.setItem( this.name, v );
    else
      this._v = v;
  }

  // Override
  get val()
  {
    // localStorage.getItem( this.name );
  }

  // Override
  set val( v )
  {
    // localStorage.setItem( this.name, v );
  }

  delete()
  {
    this.restore_default();
    localStorage.removeItem( this.name );
  }

  setValFromDOMElement(element)
  {
    this.val = $(element).val();
  }

  load()
  {
    this.onsave( this.val );
  }

  restore_default()
  {
    if( typeof(this.default) === "undefined" )
      this.val = false;
    else if( this.default.constructor.name === "DefaultSetting" )
      this.val = this.default.val;
    else
      this.val = this.default;
  }
}

class BoolSetting extends Setting
{
  constructor( name, defaultVal, onsave, persistent, warning_if, warning_popup )
  {
    super( name, defaultVal, onsave, persistent, warning_if, warning_popup );
  }

  get val()
  {
    if( this.storage === null )
      this.restore_default();

    return this.storage === "true";
  }

  set val( v )
  {
    v = !!v;
    this.storage = v;
    this.onsave( v );
  }

  on( force )
  {
    if( !force && this.warning_if && this.warning_if.on && this.warning_if.on() )
    {
      this.warning_popup && this.warning_popup.on && this.warning_popup.on();
    }

    this.val = true;
    return this.val;
  }

  off( force )
  {
    if( !force && this.warning_if && this.warning_if.off && this.warning_if.off() )
    {
      this.warning_popup && this.warning_popup.off && this.warning_popup.off();
    }

    this.val = false;
    return this.val;
  }

  toggle()
  {
    if( this.val )
      this.off();
    else
      this.on();
//    this.val = !this.val;
    return this.val;
  }
}

class FloatSetting extends Setting
{
  constructor( name, defaultVal, onsave, persistent, min, max, step )
  {
    super( name, defaultVal, onsave, persistent );

    this.default = this.parseNumber( defaultVal );
    this.min = min !== undefined ? this.parseNumber( min ) : -Infinity;
    this.max = max !== undefined ? this.parseNumber( max ) : Infinity;
    this.step = step !== undefined ? math.abs( this.parseNumber( step ) ) : 1;
  }

  get val()
  {
    if( this.storage === null )
      this.restore_default();

    return this.parseNumber( this.storage );
  }

  set val( v )
  {
    v = this.parseNumber( v );
    if(isNaN(v))
    {
      throw TypeError("Value is NaN");
    }
    v = v < this.min ? this.min : v;
    v = v > this.max ? this.max : v;

    if( this.step !== 0 )
      v = math.round( v / this.step ) * this.step;

    this.storage = v;
    this.onsave( v );
  }

  increment( pre = false)
  {
    var now = this.val;
    if( now + this.step > this.max )
    {
      this.val = this.min;
    }
    else if( pre )
    {
      now += this.step;
      this.val = now;
    }
    else
    {
      this.val += this.step;
    }
    return now;
  }

  decrement( pre = false)
  {
    var now = this.val;
    if( now - this.step < this.min )
    {
      this.val = this.max;
    }
    else if( pre )
    {
      now -= this.step;
      this.val = now;
    }
    else
    {
      this.val -= this.step;
    }
    return now;
  }

  change(selector)
  {
    this.val = $(selector).val();
  }

  parseNumber(v)
  {
    return parseFloat(v);
  }

}

class IntSetting extends FloatSetting
{
  parseNumber(v)
  {
    return parseInt(v);
  }
}

class DefaultSetting
{
  constructor(name)
  {
    this.name = name;
  }

  get val()
  {
    return SETTINGS[this.name];
  }
};