/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global CustomProjection, projection_controller, event_controller */

const custom_projection_controller = {
  prefix: "Custom: ",
  illegal_name_characters: [ "+", "=" ],
  projections: {},
  init: function()
  {
    custom_projection_controller.load();
  },
  projection_exists( projection_name, include_predefined = false)
  {
    const custom = !!custom_projection_controller.projections[projection_name];
    if( !include_predefined )
      return custom;

    const predefined = !!projection_controller.projections[projection_name];
    const none = projection_controller.isNone( projection_name );
    return custom || predefined || none;
  },
  get_all: function()
  {
    return Object.keys( custom_projection_controller.projections ).map( k => custom_projection_controller.projections[k] ).sort_objects( 'name' );
  },
  add: function( projection )
  {
    custom_projection_controller.edit( projection, true );
  },
  edit: function( projection, force_validate = false, force_edit = false)
  {
//    const name = projection.name_original ? projection.name_original : projection.name;
    const edit = function()
    {
      custom_projection_controller.projections[projection.name] = projection;
      custom_projection_controller.update_projections();
      custom_projection_controller.save();
      return;
    };
    const validate = function()
    {
      if( custom_projection_controller.projection_exists( projection.name ) )
      {
        console.error( `Projection '${projection.name}' already exists!` );
        throw `Projection name already exists!`;
      }

      custom_projection_controller.illegal_name_characters.forEach( c => {
        if( projection.name.indexOf( c ) !== -1 )
        {
          console.error( `Character '${c}' is illegal in name` );
          throw `Illegal character in name`;
        }
      } );

      if( projection.name.length === 0 )
        throw `No name provided`;

      edit();
    };

    try
    {
      ProjectorForward( projection.proj4, [ 0, 0 ] );
    }
    catch( e )
    {
      console.error( `Projection invalid`, e );
      throw `Projection invalid`;
    }

    if( force_edit )
      edit();
    else if( force_validate )
      validate();
    else if( projection.name_original )
    {
      if( projection.name_original === projection.name )
        edit();
      else
      {
        custom_projection_controller.remove( projection.name_original );
        validate();
      }
    }
    else
      validate();

  },

  save_name: "custom_projections",
  save: function()
  {
    localStorage.setItem( custom_projection_controller.save_name, JSON.stringify( custom_projection_controller.projections ) );
  },
  remove_saved: function()
  {
    localStorage.removeItem( custom_projection_controller.save_name );
  },
  load: function()
  {
    const p = JSON.parse( localStorage.getItem( custom_projection_controller.save_name ) );
    if( p !== null )
    {
      const projs = {};
      Object.keys( p ).forEach( k => {
        projs[k] = CustomProjection.load( p[k] );
      } );
      custom_projection_controller.projections = projs;
    }
    else
      custom_projection_controller.remove_all();

    custom_projection_controller.update_projections();
  },
  export_projection: function( name, successCallback, errorCallback )
  {
    if( !custom_projection_controller.projection_exists( name ) )
      throw "Projection doesn't exist!";

    const p = custom_projection_controller.projections[name];

    file_controller.writeLocal( `${p.name}.prj`, p.wkt, successCallback, errorCallback );
  },
  remove: function( name )
  {
    if( custom_projection_controller.projections[name] )
    {
      delete custom_projection_controller.projections[name];
      custom_projection_controller.update_projections();
      custom_projection_controller.save();
      try
      {
        position_settings_screen.recently_used.remove( custom_projection_controller.prefix + name );
      }
      catch( e )
      {
        console.warn( e );
      }
      return true;
    }
    else
      return false;
  },
  remove_all: function()
  {
    custom_projection_controller.projections = {};
    custom_projection_controller.remove_saved();
  },
  to_projections: function()
  {
    const projs = {};
    Object.keys( custom_projection_controller.projections ).forEach( k => {
      projs[k] = custom_projection_controller.projections[k].proj4;
    } );
    return projs;
  },
  update_projections: function()
  {
    projection_controller.update_projections_with_prefix( custom_projection_controller.prefix, custom_projection_controller.to_projections() );
  },
  get_projection_from_list: function( name )
  {
    if( !custom_projection_controller.projection_exists( name, true ) )
      throw "Projection doesn't exist!";

    if( projection_controller.isNone( name ) )
      name = projection_controller.getNoneName( name );

    let proj = new CustomProjection( name, {
      "proj4": projection_controller.get_proj_string( name )
    } );

    const matches = Object.keys( custom_projection_controller.projections ).filter( key => {
      return `${custom_projection_controller.prefix}${key}` === proj.name;
    } );
    if( matches.length > 0 )
      proj.description = custom_projection_controller.projections[matches[0]].description;
    return proj;
  },

  test: function()
  {
    custom_projection_controller.edit( new CustomProjection( "C5", {
      "proj4": "+proj=utm +zone=35 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    } ) );
    custom_projection_controller.edit( new CustomProjection( "C1", {
      "description": "Some description for C1 here",
      "proj4": "+proj=utm +zone=31 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    } ) );
    custom_projection_controller.edit( new CustomProjection( "C4", {
      "proj4": "+proj=utm +zone=34 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    } ) );
    custom_projection_controller.edit( new CustomProjection( "C2", {
      "proj4": "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    } ) );
    custom_projection_controller.edit( new CustomProjection( "C3", {
      "description": "Some description for C3 here",
      "proj4": "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
    } ) );

    custom_projection_controller.update_projections();
  }
};