/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol, fetch, event_controller, projection_controller */

class CustomMap
{
  constructor( name, options )
  {

    if( !options )
      options = {
        url: undefined,
        service: undefined,
        version: undefined,
        auth: undefined,
        deleteable: undefined,
        copyable: undefined,
        raw_url: undefined
      };

    const {
      url,
      service,
      version,
      auth,
      deleteable,
      copyable,
      raw_url
    }
    = options;

    this.name = this.change_name( name );
    this.url = url;
    this.service = service;
    this.version = version;
    this.auth = {
      username: auth && auth.username ? auth.username : null,
      password: auth && auth.password ? auth.password : null,
      token: auth && auth.token ? auth.token : null
    };
    this.raw_url = raw_url;

    this.active = true;
    this.deleteable = deleteable ? deleteable : true;
    this.copyable = copyable ? copyable : true;


    this.config = {
      params: {}
    };
  }

  change_name( name, force )
  {
    if( force || (name !== "bing") )
    {
      return this.name = name;
    }
    else
    {
      console.warn( "Custom map name", name, "reserved. Reverting to previous name." );
      return false;
    }
  }

  get service()
  {
    return this._service;
  }
  set service( v )
  {
    if( !v )
      this._service = undefined;
    else
    {
      v = v.toUpperCase();
      if( v === "WMS" || v === "WMTS" )
        this._service = v;
      else
        throw "Only WMS or WMTS services supported!";
    }
  }

  load( stored )
  {
    this.name = stored.name;
    this.url = stored.url;
    this.raw_url = stored.raw_url;
    this.service = stored._service;
    this.version = stored.version;
    this.auth = stored.auth;
    this.config = stored.config;
    this.deleteable = stored.deleteable;
    this.copyable = stored.copyable;
    this.active = stored.active;

    this.capabilities = stored.capabilities;
    this.layers = stored.layers;
  }

  copy()
  {
    const m = new CustomMap();
    m.load( this );
    return m;
  }

  get_capabilities()
  {

    if( this.name === "bing" )
      return;

    const self = this;
    const cors_proxy = "https://cors-anywhere.herokuapp.com/"; // Todo: Setup our own proxy

    // Fetch
    const headers = new Headers();
    let url = "";
    if( this.auth.username && this.auth.password )
    {
      headers.set( 'Authorization', 'Basic ' + btoa( this.auth.username + ":" + this.auth.password ) );
      url = cors_proxy;
    }
    url += `${this.url}?request=GetCapabilities&version=${this.version}&service=${this.service}`;

    if( !!this.raw_url )
    {
      url = this.raw_url;
      this.service = undefined;
      this.version = undefined;
    }

    if( !this.service )
      this.service = this.get_service_from_url( url );

    fetch( url, {
      method: 'GET',
      mode: 'cors', // no-cors, *cors, same-origin
      headers: headers
    } ).then( function( response )
    {
      return response.text();
    } ).then( function( text )
    {
      self.parse_capabilities( text );
    } ).catch( error => console.error( "Could not attain capabilities from URL. Error: ", error ) );

  }

  get_service_from_url( url )
  {
    url = url.toUpperCase();
    if( url.indexOf( "WMTS" ) > 0 )
      return "WMTS";
    else if( url.indexOf( "WMS" ) > 0 )
      return "WMS";
    else
      return undefined;
  }

  parse_capabilities( data )
  {
    console.log( "Got Capabilities" );

    if( this.service === "WMS" )
    {
      const parser = new ol.format.WMSCapabilities();
      this.capabilities = parser.read( data );
      this.layers = this.capabilities.Capability.Layer.Layer;
    }
    else if( this.service === "WMTS" )
    {
      const parser = new ol.format.WMTSCapabilities();
      this.capabilities = parser.read( data );
      this.layers = this.capabilities.Contents.Layer;
    }
    this.layers = this.layers.map( ( layer ) => {
      if( !layer.Name && layer.Identifier )
        layer.Name = layer.Identifier;
      if( !layer.Title && layer.Name )
        layer.Title = layer.Name;
      return layer;
    } );

    this.version = this.capabilities.version;
    this.config = {
      url: this.url,
      params: {}
    };
//    if( this.auth.username )
//      this.config.params['USERNAME'] = this.auth.username;
//    if( this.auth.password )
//      this.config.params['PASSWORD'] = this.auth.password;
//    if( this.auth.token )
//      this.config.params['TOKEN'] = this.auth.token;
    this.config.params['VERSION'] = this.version;
    this.config.params['LAYERS'] = '';

    event_controller.call_callback( "got_custom_map_capabilities" );
  }

  get tileLoadFunction()
  {

    const cors_proxy = "https://cors-anywhere.herokuapp.com/"; // Todo: Setup our own proxy

    const user = this.auth.username ? this.auth.username : null;
    const pass = this.auth.password ? this.auth.password : null;

    const tileLoadFunction = function( tile, src )
    {
      const headers = new Headers();
      let url = "";
      if( user && pass )
      {
        headers.set( 'Authorization', 'Basic ' + btoa( user + ":" + pass ) );
        url = cors_proxy;
      }
      url += src;

      fetch( url, {
        method: 'GET',
        mode: 'cors', // no-cors, *cors, same-origin
        headers: headers
      } )
        .then( response => response.blob() )
        .then( function( data )
        {
          if( data !== undefined )
          {
            tile.getImage().src = URL.createObjectURL( data );
          }
          else
          {
//          tile.setState( ol.TileState.ERROR );
            throw "No data!";
          }
        } )
        .catch( error => {
          console.error( error );
//        tile.setState( ol.TileState.ERROR );
        } );
    };

    return tileLoadFunction;
  }
  set tileLoadFunction( v )
  {
  }

  get_layer_by_name( name )
  {
    return this.layers.filter( layer => layer.Name === name )[0];
  }

  get_layer_names()
  {
    return this.layers.map( layer => layer.Name );
  }

  get_selected_layer_names()
  {
    if( this.config.params['LAYERS'] )
      return this.config.params['LAYERS'].split( ',' );
    else
      return [ ];
  }

  get_selected_layers()
  {
    const names = this.get_selected_layer_names();
    return this.layers.filter( layer => names.indexOf( layer.Name ) > -1 );
  }

  use_layer( layer )
  {
    this.config.params['LAYERS'] = layer.Name;
  }

  add_layer( layer )
  {
    this.config.params['LAYERS'] = this.get_selected_layer_names().push( layer.Name ).toString();
  }

  has_selected_layer()
  {
    return this.get_selected_layer_names().length > 0;
  }

  get options()
  {
    let options = {};

    if( this.name === "bing" )
      return options;

    if( this.service === "WMS" )
    {
      options = this.getWMSOptionsFromCapabilities();
    }
    else if( this.service === "WMTS" )
    {
      options = this.getWMTSOptionsFromCapabilities();
    }

//    options.tileLoadFunction = this.tileLoadFunction;

    return options;
  }

  getWMSOptionsFromCapabilities()
  {
    let options = {};

    let urls = [ ];
    {
      if( Object.hasOwnNestedProperty( this.capabilities, 'Capability.Request.GetMap.DCPType' ) )
        this.capabilities.Capability.Request.GetMap.DCPType.forEach( type => {
          if( Object.hasOwnNestedProperty( type, 'HTTP.Get.OnlineResource' ) )
            urls.push( type.HTTP.Get.OnlineResource );
        } );
      else if( Object.hasOwnNestedProperty( this.capabilities, 'Service.OnlineResource' ) )
        urls.push( this.capabilities.Service.OnlineResource );
      if( urls.length === 0 )
        throw "Could not attain url";
    }

    options.urls = urls;
    options.params = this.config.params;

    return options;
  }

  getWMTSOptionsFromCapabilities()
  {
    const identifier = this.get_selected_layer_names()[0];

    try
    {
      return ol.source.WMTS.optionsFromCapabilities( this.capabilities, {
        layer: identifier
      } );
    }
    catch( e )
    {
      console.warn( "Could not attain options profile from capabilities. Trying manual method. Error ", e );
      const layer = this.get_selected_layers()[0];
      if( !layer )
        throw "No layer!";

      let urls = [ ];
      {
        if( Object.hasOwnNestedProperty( layer, 'ResourceURL.template' ) )
          urls.push( layer.ResourceURL.template );
        else if( Object.hasOwnNestedProperty( this.capabilities, 'OperationsMetadata.GetTile.DCP.HTTP.Get' ) )
          this.capabilities.OperationsMetadata.GetTile.DCP.HTTP.Get.forEach( url => urls.push( url ) );
        if( urls.length === 0 )
          throw "Could not attain url";
      }

      const chosenMatrixSet = 0;
      const matrixSetIdentifier = layer.TileMatrixSetLink[chosenMatrixSet].TileMatrixSet;
      const matrixSet = this.capabilities.Contents.TileMatrixSet.filter( set => set.Identifier === matrixSetIdentifier )[0];

      const format = layer.Format[0];

      let tileGrid = null;
      try
      {
        tileGrid = ol.tilegrid.WMTS.createFromCapabilitiesMatrixSet( matrixSet );
      }
      catch( e )
      {
        console.warn( "Could not attain tileGrid from capabilities. Trying manual method. Error ", e );

        const projection_short = matrixSet.SupportedCRS.split( ":" ).filter( c => !!c && (c === "EPSG" || !isNaN( c )) ).join( ":" );
        const projection_long = projection_controller.get_proj_string( projection_short );
        const projector = Projector( projection_long );

        tileGrid = new ol.tilegrid.WMTS( {
          extent: layer.WGS84BoundingBox.map( c => projector.forward( c ) ),
          resolutions: matrixSet.TileMatrix.map( t => t.ScaleDenominator ),
          matrixIds: matrixSet.TileMatrix.map( t => t.Identifier )
        } );

        projector.release();
      }

      const style = layer.Style.filter( s => !!s.isDefault )[0].Identifier;

      return {
        urls: urls,
        layer: identifier,
        matrixSet: matrixSetIdentifier,
        format: format,
        tileGrid: tileGrid,
        style: style
      };

    }
  }

}