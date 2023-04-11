class Proj4Projection
{
  constructor( proj4String )
  {
    this.ignore_keys = [ "+units", "+to_meter" ];
    if( !proj4String )
      proj4String = "";

    this.loadString(proj4String);
    if( this.originalString !== proj4String )
    {
      console.warn( proj4String, this );

      throw "Proj string not loaded correctly";
    }
  }

  /**
   * Removes "tmr_" keys from a projection string in order for the string to conform to proj4 standard.
   * 
   * @param {string} projString A projection string. Can be proj4- or tmr-standard.
   * @returns {string} The projection string parameter cleaned of tmr_tags
   */
  static cleanProjectionString(projString) {
    // Searches for the following keys to replace with corresponding value. A value of "null" will cause the key to be removed from the string.
    const keysToReplace = {tmr_alias: null, tmr_units: "units"}
    const parts = projString.split(" ");
    let cleanedParts = [];
    let cleanedString = "";

    // Split input string and replace/remove indvidual keys
    parts.forEach((part)=>{
      Object.keys(keysToReplace).forEach((key)=>{
        const replacement = "+" + keysToReplace[key];
        if (keysToReplace[key] !== null) {
          const fullKey = "+" + key;
          if (part.includes(fullKey)) {
            cleanedParts.push(part.replace(fullKey, replacement));
          }
          else {
            cleanedParts.push(part);
          }
        }
      });
    });

    return cleanedParts.reduce((prev,curr)=>`${prev} ${curr}`,'').trim();

  }

  loadString(proj4String) {
    this._original_parts = proj4String.split( "+" ).map( p => p.trim() ).filter( p => !!p ).map( ( part ) =>
    {
      if(!projection_controller.isNone(part))
        part = "+" + part;
      var key = part.split( "=" )[0].trim();

      var value = part.replace( key + "=", "" ).trim();
      if( key === value )
        value = false;

      return [ key, value ];
    } );
    this._parts = this._original_parts.map( part => {
      var key = part[0];
      var value = part[1];
      if( this.ignore_keys.indexOf( key ) >= 0 )
        return [ key.replace( "+", "+tmr_" ), value ];
      else
        return [ key, value ];
    } );

    if(projection_controller.isNone( this.originalString )) {
      return;
    }

    if(!this._parts.find(part=>part[0] === "+tmr_alias") && this.alias)
    {
      this._parts.push(["+tmr_alias",this.alias])
    }
  }
  get units()
  {
    var units = this.getValue( "+tmr_units", "m" );
    if( projection_controller.isNone( this.originalString ) )
      units = projection_controller.none[this.originalString].units;
    return units;
  }
  get unit2meter()
  {
    var conv = parseFloat( this.getValue( "+tmr_to_meter" ) );
    if( conv )
      return conv;
    else
      return (1).unit2meter( this.units );
  }
  get alias()
  {
    if(this._alias)
    {
      return this._alias;
    }
    let _alias = this.getValue( "+tmr_alias" );
    let _proj = this.getValue( "+proj" );
    let _zone = this.getValue( "+zone" );
    if( _alias === undefined && _proj === "utm" && _zone )
    {
      _alias = `UTM${_zone.toUpperCase()}`; 
      if(this.getValue("+south"))
        _alias += "S";
    }
    else if( projection_controller.isNone(this.originalString) )
      _alias = this.originalString;

    if(_alias === undefined)
    {
      _alias = projection_controller.lookup_proj_string_alias(this.originalString);
    }

    this._alias = _alias;
    return this._alias;
  }
  get string()
  {
    var s = "";
    this._parts.forEach( ( part ) =>
    {
      if( s )
        s += " ";
      s += part[0];
      if( part[1] || parseInt(part[1]) === 0 )
        s += "=" + part[1];
    } );
    return s;
  }
  get originalString()
  {
    var s = "";
    this._original_parts.forEach( ( part ) =>
    {
      if( s )
        s += " ";
      s += part[0];
      if( part[1] || parseInt(part[1]) === 0 )
        s += "=" + part[1];
    } );
    return s;
  }
  indexOf( key )
  {
    var index = -1;
    this._parts.forEach( function( part, i )
    {
      if( part[0] === key && index === -1 )
        index = i;
    } );
    return index;
  }
  getValue( key, default_val )
  {
    const part = this._parts.find( p => p[0] === key );
    const val = part ? (part[1]?part[1]:!!part[0]) : part;
    return val ? val : default_val;
  }
  setValue( key, value )
  {
    var key_index = this.indexOf( key );
    if( key_index >= 0 )
      this._parts[key_index][1] = value;
    else
      this._parts.push( [ key, value ] );
  }
}