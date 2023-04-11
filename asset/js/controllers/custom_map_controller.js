/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global map_controller, ol, fetche, Infinity, projection_controller, robot_controller, general_settings_screen, event_controller, fetch */

var custom_map_controller = {
  init: function()
  {
    if( !custom_map_controller.maps )
      custom_map_controller.load();

    if( custom_map_controller.maps.length > 0 )
      return;
    else
      custom_map_controller.delete_all();
  },

  init_test: function()
  {
    const url_dk = "https://services.kortforsyningen.dk/orto_foraar";
    const url_dk2 = "https://services.kortforsyningen.dk/service?request=GetCapabilities&servicename=orto_foraar&service=WMTS&version=1.0.0&token=9b2120b801e79220db6a98b439d31380";
    const url_swiss = "https://wms.swisstopo.admin.ch/";
    const url_swiss2 = "https://wms.geo.admin.ch/";
    const url_nz = "https://data.linz.govt.nz/services;key=bdebe85f7a9e435fbdd9dc5fe4d64584/wmts/1.0.0/set/4702/WMTSCapabilities.xml";

    const service = "WMS";
    const version = "1.1.1"; // Lower versions are not well supported by OpenLayers WMSCapabilities

    custom_map_controller.maps = [ ];
    {
      custom_map_controller.add_map( new CustomMap( "Denmark WMS", {
        url: url_dk,
        service: service,
        version: version,
        auth: {
          token: '9b2120b801e79220db6a98b439d31380'
        }
      } ) );
      custom_map_controller.add_map( new CustomMap( "Denmark WMTS", {
        raw_url: url_dk2,
      } ) );
      custom_map_controller.add_map( new CustomMap( "swissimage", {
        url: url_swiss,
        service: service,
        version: version,
        auth: {
          username: 'user_brn0a',
          password: 'kybka4l6uvyyfe16'
        }
      } ) );
      custom_map_controller.add_map( new CustomMap( "swissimage2", {
        url: url_swiss2,
        service: service,
        version: version
      } ) );
      custom_map_controller.add_map( new CustomMap( "New Zealand WMTS", {
        raw_url: url_nz
      } ) );
    }

//    custom_map_controller.maps.forEach( m => m.get_capabilities() );
    custom_map_controller.add_map( custom_map_controller.get_bing_map() );

    custom_map_controller.save();
  },

  get_background_layers: function()
  {
    if( !custom_map_controller.maps || custom_map_controller.maps.length === 0 )
      custom_map_controller.load();
    return custom_map_controller.maps.map( ( m, idx ) => custom_map_controller.get_background_layer( m, idx ) ).filter( m => m !== null );
  },
  get_background_layer: function( m, idx )
  {
    if( !m.has_selected_layer() || !m.active )
      return null;

    try
    {
      let bl;
      if( m.name !== "bing" )
      {
        if( m.service === "WMS" )
        {
          bl = new ol.layer.Tile( {
            visible: true,
            source: new ol.source.TileWMS( m.options ),
            zIndex: -1 * idx - 1,
            type: 'overlay'
          } );
        }
        else if( m.service === "WMTS" )
        {
          bl = new ol.layer.Tile( {
            visible: true,
            source: new ol.source.WMTS( m.options ),
            zIndex: -1 * idx - 1,
            type: 'overlay'
          } );
        }
      }
      else
      {
        bl = new ol.layer.Tile( {
          visible: true,
          preload: Infinity,
          source: new ol.source.BingMaps( {
            key: 'AnHKCRny8ysAm-ZcrGkIb87jHQpmU1YZRIZcnxcPSS2qKOb9x4nLT9EsH9kAK7dm',
            imagerySet: m.get_selected_layer_names()[0],
            // use maxZoom 19 to see stretched tiles instead of the BingMaps
            // "no photos at this zoom level" tiles
            maxZoom: 19,
            wrapDateLine: false,
            wrapX: false,
            noWrap: true
          } ),
          zIndex: -1 * idx - 1,
          type: 'base'
        } );
      }

      if( projection_controller.isNone( robot_controller.chosen_robot.projection ) || !general_settings_screen.settings.show_background_map.val )
        bl.setVisible( false );
      else
        bl.setVisible( true );
      return bl;
    }
    catch( e )
    {

      uncaughtErrorSend( e.stack ? e.stack : e );
      console.error( e );

      return null;
    }
  },

  map_exists( map_name )
  {
    return !!custom_map_controller.get_map_by_name( map_name );
  },

  get_map_by_name: function( map_name )
  {
    return custom_map_controller.maps.filter( m => m.name === map_name )[0];
  },

  get_map_index_by_name: function( map_name )
  {
    return custom_map_controller.maps.indexOf( custom_map_controller.get_map_by_name( map_name ) );
  },

  add_map: function( map )
  {
    custom_map_controller.maps.push( map );
  },

  edit_map: function( map, map_name )
  {
    let index = null;
    if( map_name )
      index = custom_map_controller.get_map_index_by_name( map_name );
    else
      index = custom_map_controller.get_map_index_by_name( map.name );

    if( index < 0 )
      custom_map_controller.add_map( map );
    else
      custom_map_controller.maps[index] = map;
  },

  toggle_map: function( map_name )
  {
    const index = custom_map_controller.get_map_index_by_name( map_name );
    custom_map_controller.maps[index].active = !custom_map_controller.maps[index].active;
  },

  move: function( map_name, relative_index )
  {
    const index = custom_map_controller.get_map_index_by_name( map_name );

    custom_map_controller.maps.splice( index + relative_index, 0, custom_map_controller.maps.splice( index, 1 )[0] );
  },

  move_up: function( map_name )
  {
    custom_map_controller.move( map_name, -1 );
  },

  move_down: function( map_name )
  {
    custom_map_controller.move( map_name, 1 );
  },

  delete_map_by_name: function( map_name )
  {
    custom_map_controller.delete_map( custom_map_controller.get_map_by_name( map_name ) );
  },

  delete_map: function( map )
  {
    const index = custom_map_controller.maps.indexOf( map );
    if( index < 0 )
      console.error( "Map does not exist" );

    const name = map.name;

    try
    {
      if( custom_map_controller.maps[index].deleteable )
      {
        let del_items = custom_map_controller.maps.splice( index, 1 );
        if( del_items.length === 0 )
          throw "Could not delete this map.";
        else
          console.log( "Deleted map", name, "successfully" );
      }
      else
      {
        console.warn( "Cannot delete this map. It is read only." );
      }
    }
    catch( e )
    {
      console.error( "Could not delete map.", e );
    }

    map_controller.background.refresh_background();

  },
  delete_all: function()
  {
    custom_map_controller.maps = [ custom_map_controller.get_bing_map() ];
    custom_map_controller.save();
    map_controller.background.refresh_background();
  },

  save: function()
  {
    localStorage.setItem( "custom_maps", JSON.stringify( custom_map_controller.maps ) );
  },
  load: function()
  {
    var p = JSON.parse( localStorage.getItem( "custom_maps" ) );
    if( p !== null )
      custom_map_controller.maps = p.map( e => {
        const m = new CustomMap();
        m.load( e );
        return m;
      } );
    else
      custom_map_controller.delete_all();
  },

  get_bing_map: function()
  {
    const m = new CustomMap();
    m.change_name( "bing", true );

    const layers = [ {
        Name: 'AerialWithLabelsOnDemand',
        Title: 'Aerial with Labels'
      }, {
        Name: 'Aerial',
        Title: 'Aerial'
      }, {
        Name: 'RoadOnDemand',
        Title: 'Roads'
      }, {
        Name: 'CanvasDark',
        Title: 'CanvasDark'
      }, {
        Name: 'OrdnanceSurvey',
        Title: 'OrdnanceSurvey'
      } ];
    m.layers = layers;

    m.use_layer( layers[0] );
    m.deleteable = false;
    m.copyable = false;
    return m;
  }
};