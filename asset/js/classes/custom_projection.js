/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global custom_projection_controller */

class CustomProjection
{
  constructor( name, options )
  {

    if( !options )
      options = {};

    this.name = name;
    this.name_original = name;
    this.description = options.description;
    this.proj4 = options.proj4;

    this.copyable = true;
    this.deleteable = true;
  }

  static load( stored )
  {
    const m = new CustomProjection( stored._name, stored );
    m.name = stored._name;
    return m;
  }

  set name( v )
  {
    if( v === this._name )
      return;
    this.name_original = this.name;
    this._name = v;
  }
  get name()
  {
    return this._name;
  }

  copy()
  {
    return CustomProjection.load( this );
  }

  get description_shown()
  {
    if( this.description )
      return this.description;
    else if( this.proj4 )
      return this.proj4;
    else
      return "";
  }
  set description_shown( v )
  {
    this.description = v;
  }

  get description_shown_short()
  {
    let short_description = this.description_shown.substring( 0, 240 );
    short_description += short_description === this.description_shown ? '' : ' [............]';
    return short_description;
  }
  set description_shown_short( v )
  {
    this.description_shown = v;
  }

  get wkt()
  {
    // Make UTM safe
    let safe = projection_controller.parse_proj_with_utm( this.proj4 );
    return window.PROJ.PROJToWKTStr( safe );
  }

}
;