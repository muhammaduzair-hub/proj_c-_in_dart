class Background
{
  /**
   * @param {Object} options
   * @param {Boolean} options.use_custom_maps
   * @param {Boolean} options.ignore_active
   * @param {Boolean} options.enable_show_start_location
   * @param {Element} options.map_element DOM element to put the map (don't use together with 'whereToPut')
   * @param {String} options.whereToPut DOM selector to put the map (don't use together with 'map_element')
   * @param {Boolean} options.follow_robot
   * @param {Boolean} options.error_doing_tile_load
   * @param {ol.Map} options.map
   * @param {ol.layer.Tile} options.background_layer
   * @param {Array<ol.layer.Tile>} options.background_layers
   * @param {Boolean} options.useLocalStorage
   * @param {Number} options.map_min_zoom
   * @param {Number} options.map_max_zoom
   * @param {Boolean} options.show_decorations
   * @param {Boolean} options.show_labels
   * @param {Boolean} options.show_path_between
   * @param {Boolean} options.show_ignored_geometries
   * @param {Boolean} options.allow_map_click
   * @param {JobLoader} options.jobLoader
   * @param {JobsArray} options.jobs
   * @param {Boolean} options.show_multiselect_reorder_handle Show reorder handle on multiselect overlay
   * @param {Boolean} options.deselect_on_map_click Deselect jobs when clicking the map (not a job)
   * @param {Boolean} options.show_locked_layouts
   * @param {Boolean} options.drawHiddenTemplates Draw templates that have been hidden in the templates menu
   */
  constructor(options = {})
  { 
      this.use_custom_maps = options.use_custom_maps !== undefined ? options.use_custom_maps : true;
      this.ignore_active = options.ignore_active !== undefined ? options.ignore_active : false;
      this.enable_show_start_location = options.enable_show_start_location !== undefined ? options.enable_show_start_location : true;
      this.map_element = options.map_element !== undefined ? options.map_element : null;
      this.follow_robot = options.follow_robot !== undefined ? options.follow_robot : false;
      this.error_doing_tile_load = options.error_doing_tile_load !== undefined ? options.error_doing_tile_load : true;
      this.map = options.map !== undefined ? options.map : null;
      this.background_layer = options.background_layer !== undefined ? options.background_layer : null;
      this.background_layers = options.background_layers !== undefined ? options.background_layers : [ ];
      this.useLocalStorage = options.useLocalStorage !== undefined ? options.useLocalStorage : true;
      this.map_min_zoom = options.map_min_zoom !== undefined ? options.map_min_zoom : 2;
      this.map_max_zoom = options.map_max_zoom !== undefined ? options.map_max_zoom : 25;
      this.show_decorations = options.show_decorations !== undefined ? options.show_decorations : true;
      this.show_labels = options.show_labels !== undefined ? options.show_labels : true;
      this.show_path_between = options.show_path_between !== undefined ? options.show_path_between : true;
      this.show_ignored_geometries = options.show_ignored_geometries !== undefined ? options.show_ignored_geometries : true;
      this.allow_map_click = options.allow_map_click !== undefined ? options.allow_map_click : true;
      this.show_multiselect_line_number = options.show_multiselect_line_number !== undefined ? options.show_multiselect_line_number : true;
      this.show_multiselect_reorder_handle = options.show_multiselect_reorder_handle !== undefined ? options.show_multiselect_reorder_handle : true;
      this.deselect_on_map_click = options.deselect_on_map_click !== undefined ? options.deselect_on_map_click : true;
      this.drawHiddenTemplates = options.drawHiddenTemplates !== undefined ? options.drawHiddenTemplates : false;
      this.show_locked_layouts = options.show_locked_layouts !== undefined ? options.show_locked_layouts : true;
      this.canSelectLockedJobs = options.canSelectLockedJobs !== undefined ? options.canSelectLockedJobs : false;
      this.mirrorMoveOnMainMap = options.mirrorMoveOnMainMap !== undefined ? options.mirrorMoveOnMainMap : true;
            
      this._jobs = new JobsArray();
      this._jobs._background = this;
      if(options.jobs !== undefined)
      {
        this.jobs = options.jobs;
      }
      this.jobLoader = options.jobLoader !== undefined ? options.jobLoader : new JobLoader(this.jobs);

      if(!options.whereToPut)
        throw "Need a DOM selector to put the map";
      else
        this.whereToPut = options.whereToPut;

      this.map_started = false;

      this.drawn_jobs = [ ];
      this.drawn_cluster = null;
      this.popup = null;

      this.pitch_layers = [ ];

      this.background_map_key = 'w_bing';

      this.multifield_select_overlay = new MapOverlaySelectField(this);
      this.multiselect_layer_overlay = new MapOverlay(this, (layer)=>this.select_all_by_layer(layer));
      this.multiselect_job_list_overlay = new MapOverlayJobList(this);
      this.multiselect_state_controller = new MultiSelectStateController(this);

      this.isZooming = false;

      this.eventController = new MultiEventController();
  }
  /**
   * @param {JobsArray} v
   */
  set jobs(v)
  {
    if(this.jobs.active.is_being_edited)
    {
      throw "Cannot set jobs while editing active job!";
    }
    if(this.jobs.active.new_job)
    {
      throw "Cannot set jobs while creating new job!";
    }

    if(!this._jobs.isEqualTo(v) || v._background !== this)
    {
      this._jobs.forEach(job=>job.removePitchLayer());
      this._jobs = v;
      this._jobs.background = this;
      this.draw_all_jobs();
    }
    else
    {
      console.warn("Job Arrays are equal. I will not update it");
    }
  }
  /**
   * @returns {JobsArray<Job>}
   */
  get jobs()
  {
    return this._jobs;
  }
  robot_to_map( robot_coordinate )
  {
    return this.projection_to_map( robot_controller.chosen_robot.proj_string, robot_coordinate );
  }
  map_to_robot( map_coordinate )
  {
    return this.map_to_projection( robot_controller.chosen_robot.proj_string, map_coordinate );
  }
  map_to_lnglat( map_coordinate )
  {
    return this.ol_proj_toLonLat( map_coordinate, this.projection );
  }
  lnglat_to_map( lnglat )
  {
    return this.ol_proj_fromLonLat( lnglat, this.projection );
  }
  projection_to_map( proj_string, coordinate )
  {
    if( projection_controller.isOldNone( proj_string ) )
      return coordinate;
    var lnglat = ProjectorInverse( proj_string, coordinate );
    return this.ol_proj_fromLonLat( lnglat, this.projection );
  }
  map_to_projection( proj_string, coordinate )
  {
    if(!this._map_to_projection_memoized)
    {
      this._map_to_projection_memoized = memoize(( proj_string, coordinate ) => {
        if( projection_controller.isOldNone( proj_string ) )
          return coordinate;
        var lnglat = this.map_to_lnglat( coordinate );
        return ProjectorForward( proj_string, lnglat );
      });
    }
    return this._map_to_projection_memoized( proj_string, coordinate );
  }
  get_map_center_lnglat()
  {
//    var map_coordinate = this.map_center;
    var map_coordinate = [-8230367.11714535, 4972311.83720769];
    return this.ol_proj_toLonLat( map_coordinate, this.projection );
  }
  ol_proj_toLonLat(coordinate, projection = "EPSG:3857")
  {
    // PROJ override of ol.proj.toLonLat

    if(false)
      return ol.proj.toLonLat(coordinate, projection);

    if(typeof(projection) !== "string" && projection.getCode)
      projection = projection_controller.get_best_proj_string_from_alias(projection.getCode());

    coordinate = coordinate.slice(0,2);

    return ProjectorInverse(projection, coordinate);
  }
  ol_proj_fromLonLat(coordinate, projection = "EPSG:3857")
  {
    // PROJ override of ol.proj.fromLonLat

    if(false)
      return ol.proj.fromLonLat(coordinate, projection);

    if(typeof(projection) !== "string" && projection.getCode)
      projection = projection_controller.get_best_proj_string_from_alias(projection.getCode());

    coordinate = coordinate.slice(0,2);

    return ProjectorForward(projection, coordinate);
  }
  refresh_background()
  {
    if( !this.map_started )
    {
      logger.debug( "Map not started yet. Waiting 1msek" );
      setTimeout( this.refresh_background, 1 );
      return;
    }

    if( this.use_custom_maps )
    {
      // Remove current background layers
      if( this.background_layers.length > 0 )
        this.background_layers.forEach( layer => this.map.removeLayer( layer ) );

      // Create new background layers
      this.background_layers = custom_map_controller.get_background_layers();

      // Add new background layers
      this.background_layers.forEach( layer => this.map.addLayer( layer ) );

      // Put z-index on new background layers
      // this.background_layers.forEach( ( layer, index ) => layer.setZIndex( -1 * index - 1 ) );

      this.error_doing_tile_load = false;
    }
    else
    {
      this.map.removeLayer( this.background_layer );
      this.background_layer = this.create_new_background_layer();
      this.map.addLayer( this.background_layer );
      this.background_layer.setZIndex( -1 );
    }
  }
  create_new_background_layer( use_bing = false)
  {

    var bl;
    if( this.background_map_key === "dk_orto_foraar" && !use_bing )
    {
      // https://services.kortforsyningen.dk/service?request=GetCapabilities&version=1.1.1&servicename=orto_foraar&service=WMS
      bl = new ol.layer.Tile( {
        visible: true,
        source: new ol.source.TileWMS( {
//          projection: 'EPSG:25832', //HERE IS THE DATA SOURCE PROJECTION
          preload: Infinity,
          url: "https://services.kortforsyningen.dk/orto_foraar",
          params: {
            'LAYERS': 'orto_foraar',
            'VERSION': '1.1.1',
            'FORMAT': "image/jpeg",
            'TOKEN': '9b2120b801e79220db6a98b439d31380'
          }
        } )
      } );
    }
    else if( this.background_map_key === "ch_swissimage" && !use_bing )
    {
      // https://wms.swisstopo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.0.0&lang=en
      bl = new ol.layer.Tile( {
        visible: true,
        source: new ol.source.TileWMS( {
          projection: 'EPSG:2056', //HERE IS THE DATA SOURCE PROJECTION
          preload: Infinity,
          tileLoadFunction: function( imageTile, src )
          {
            imageTile.getImage().src = src;
          }.bind,
          url: "https://wms.swisstopo.admin.ch",
          params: {
            'LAYERS': 'ch.swisstopo.swissimage',
            'VERSION': '1.1.1',
            'FORMAT': "image/png",
            'STYLE': 'default',
            'USERNAME': 'user_brn0a',
            'PASSWORD': 'kybka4l6uvyyfe16'
          }
        } )
      } );
    }
    else // Default to Bing Maps
    {
      bl = new ol.layer.Tile( {
        visible: true,
        preload: Infinity,
        source: new ol.source.BingMaps( {
          key: 'AnHKCRny8ysAm-ZcrGkIb87jHQpmU1YZRIZcnxcPSS2qKOb9x4nLT9EsH9kAK7dm',
          imagerySet: general_settings_screen.settings.show_roads_on_map.val ? 'AerialWithLabelsOnDemand' : 'Aerial',
          // use maxZoom 19 to see stretched tiles instead of the BingMaps
          // "no photos at this zoom level" tiles
          maxZoom: 19,
          wrapDateLine: false,
          wrapX: false,
          noWrap: true
        } )
      } );
    }

    var source = bl.getSource();
    source.on( 'tileloaderror', ()=>{
      if( !this.error_doing_tile_load )
      {
        setTimeout( ()=>{
          if( this.error_doing_tile_load )
            this.refresh_background();
        }, 4000 );
      }
      this.error_doing_tile_load = true;
    });
    this.error_doing_tile_load = false;

    if( projection_controller.isNone( robot_controller.chosen_robot.projection ) || !general_settings_screen.settings.show_background_map.val )
      bl.setVisible( false );
    else
      bl.setVisible( true );
    return bl;
  }
  start_map()
  {
    if( this.map_started )
      return;

    this.map_started = true;

    $( this.whereToPut ).empty();
    this.map_element = document.querySelector( this.whereToPut );

    var interactions = ol.interaction.defaults( {
      altShiftDragRotate: false,
      pinchRotate: false,
      doubleClickZoom: false
    } );
    interactions.extend( [ new drag_feature() ] );

    this.map_center = localStorage.getItem( "map.center" );
    if( this.map_center )
    {
      try
      {
        this.map_center = JSON.parse( "[" + this.map_center + "]" );
      }
      catch( e )
      {
        this.map_center = [ 1134630.165641276, 7567136.78588453 ];
      }
    }
    else
      this.map_center = [ 1134630.165641276, 7567136.78588453 ];
    this.map_zoom = localStorage.getItem( "map.zoom" );

    if( this.map_zoom )
      this.map_zoom = parseInt( this.map_zoom );
    else
      this.map_zoom = 20;
    this.last_map_zoom = 25 - this.map_zoom;

    if( this.use_custom_maps )
      this.background_layers = custom_map_controller.get_background_layers();
    else
      this.background_layers = [ this.create_new_background_layer() ];

    this.map = new ol.Map( {
      moveTolerance: 5,
      // Improve user experience by loading tiles while dragging/zooming. Will make
      // zooming choppy on mobile or slow devices.
      loadTilesWhileInteracting: false,
      loadTilesWhileAnimating: false,
      interactions: interactions,
      layers: this.background_layers,
      target: this.map_element,
      view: new ol.View( {
        center: this.map_center,
        zoom: this.map_zoom,
        minZoom: this.map_min_zoom, //7,
        maxZoom: this.max_max_zoom,
        constrainOnlyCenter: true
      } ),
      controls: [ ]
    } );
    this.projection = this.map.getView().getProjection();

    this.update_map();
    this.add_map_events();
    this.add_map_callbacks();
  }

  update_map()
  {
    this.map.updateSize();
  }

  add_map_events()
  {
    this.map.on( "moveend", function()
    {
      this.map_center = this.map.getView().getCenter();
      if( Math.abs( this.map_center[0] ) > 20037510 || Math.abs( this.map_center[1] ) > 20037510 )
      {
        this.map_center[0] = this.map_center[0].coerce( -20037510, 20037510 );
        this.map_center[1] = this.map_center[1].coerce( -20037510, 20037510 );
        this.zoom_to_point( this.map_center, true, -1 );
      }
      this.last_map_zoom = this.map_zoom;
      this.map_zoom = this.map.getView().getZoom();
      this.eventController.call_callback( "map_move" );

      if(this === map_controller.background) {
        localStorage.setItem( "map.center", this.map_center );
        localStorage.setItem( "map.zoom", this.map_zoom );
      }
      
      if(this !== map_controller.background && this.mirrorMoveOnMainMap) {
        map_controller.background.zoom_to_point(this.map_center, true, this.map_zoom, true);
      }

    }.bind(this) );

    // click events
    this.map_long_click_length = 5000;
    this.map_click_duration = 0;
    this.map_click_start = 0;
    this.map_click_timeout = '';
    this.map.on( 'pointerdown', function( evt )
    {
      this.map_click_start = new Date();
      this.map_click_timeout = setTimeout( function()
      {
        this.map_click_duration = (new Date()) - this.map_click_start;
        //map_click( evt );
      }, this.map_long_click_length );
    }.bind(this) );
    this.map.on( 'pointerup', function( evt )
    {
      this.map_click_duration = (new Date()) - this.map_click_start;
    }.bind(this) );
    this.map.on( 'pointermove', function()
    {
      clearTimeout( this.map_click_timeout );
    }.bind(this) );
    this.map.on( "zoom", function()
    {
      clearTimeout( this.map_click_timeout );
    }.bind(this) );

    this.map.on( 'click', this.map_click.bind(this) );

    // change mouse cursor when over marker
    this.map.on( 'pointermove', function( e )
    {
      if( e.dragging )
      {
        //this.map.removeOverlay( popup );
        return;
      }
      var pixel = this.map.getEventPixel( e.originalEvent );
      var hit = this.map.hasFeatureAtPixel( pixel );
      this.map.getTarget().style.cursor = hit ? 'pointer' : '';
    }.bind(this) );
  }

  distanceGreaterThan(posOne, posTwo, meters, ignoreZoom=true) {
    const vectorOne = posOne.toVector();
    const vectorTwo = posTwo.toVector();
    const actualDistance = vectorOne.dist_to_point(vectorTwo);
    if (!ignoreZoom) {
      const zoomModifier = 20 / this.map_zoom; // 20 is standard zoom
      meters = meters * zoomModifier;
    }
    return actualDistance > meters ? true : false;
  };

  add_map_callbacks()
  {
    if( robot_controller.chosen_robot.id > -1 )
      event_controller.call_callback( "got_robot_position", robot_controller.chosen_robot );

    // Show user dot
    var first_user_position = true;
    event_controller.add_callback( "got_user_position", function( position )
    {

      if( first_user_position )
      {
        //this.center_map_on_user( true );
        first_user_position = false;
      }

      if( projection_controller.isNone( robot_controller.chosen_robot.projection ) )
      {
        if( this.user_marker )
        {
          this.map.removeLayer( this.user_marker.layer );
          delete this.user_marker;
        }
      }
      else
      {
        var center = this.ol_proj_fromLonLat( position );
        if( this.user_marker )
        {
          this.user_marker.feature.setGeometry( new ol.geom.Point( center ) );
        }
        else
        {
          this.user_marker = ol_markers.create_marker( "user", center, "gps_dot", 0 );
          this.map.addLayer( this.user_marker.layer );

        }
      }

    }.bind(this) );

    this.robot_markers = {};

    const update_positions = function( args )
    {
      var robots = robot_controller.robot_list();
      robots.forEach( function( robot )
      {
        if( robot_controller.chosen_robot_id && parseInt( robot.id ) !== parseInt( robot_controller.chosen_robot_id ) )
        {
          // delete robots that should not be displayed
          if( this.robot_markers[ robot.id ] )
          {
            this.map.removeLayer( this.robot_markers[ robot.id ].layer );
            delete this.robot_markers[ robot.id ];
          }
        }
        else
        {
          if( robot.online && robot.x && robot.y && robot.projector )
          {
            var center = this.robot_to_map( robot.pos.toArray() );

            if( !this.old_robot_position )
              this.old_robot_position = [ 0, 0 ];

            if(!this.robot_markers[ robot.id ] || this.distanceGreaterThan(this.old_robot_position, center, 0.0001)) {
              this.old_robot_position = center;
              $( ".center_on_robot_button" ).css( "transform", "rotate(" + (-robot.t + Math.PI / 2) + "rad)" );

              if( this.robot_markers[ robot.id ] ) {
                this.robot_markers[ robot.id ].feature.setGeometry( new ol.geom.Point( center ) );
                this.robot_markers[ robot.id ].layer.getStyle().getImage().setRotation( -robot.t + Math.PI / 2 );
              
                // Move map with robot
                if (!this.isZooming) {
                  if(   general_settings_screen.settings.follow_robot.val 
                     && (robot_controller.user_state === TopStates.AUTOMATIC || (args && args.follow_robot === true) || this.follow_robot)
                     && this.distanceGreaterThan(this.map_center, center, 1.5, false)) {
                    this.map_center = center;
                    this.map.getView().setCenter( this.map_center );
                  }
                }
              }
              else
              {
                this.robot_markers[ robot.id ] = ol_markers.create_marker( robot.name, center, "robot_yellow", -robot.t + Math.PI / 2, function()
                {
                  console.log( robot.name + " clicked" );
                  if( robot_controller.chosen_robot_id !== robot.id )
                  {
                    if( confirm( "Choose " + robot.name + " robot on this device?" ) )
                    {
                      robot_controller.choose_robot( robot.id );

                      // top_bar_screen_controller.update();
                      event_controller.call_callback("topbar_force_update");
                      
                      blue.connect_to_robot();

                      if( confirm( "Choose robot '" + robot_controller.robots[ robot.id ].name + "' for this device?" ) )
                      {
                        localStorage.setItem( "robot.chosen", robot.id );
                      }
                    }
                  }

                } );
                this.map.addLayer( this.robot_markers[ robot.id ].layer );
                this.robot_markers[ robot.id ].layer.setZIndex( 1000000 + parseInt( robot.id ) );
              }
            }
          }
          else
          {
            if( this.robot_markers[ robot.id ] )
            {
              this.map.removeLayer( this.robot_markers[ robot.id ].layer );
              delete this.robot_markers[ robot.id ];
            }
          }
        }
      }.bind(this) );
    }.bind(this);

    var last_projection = "a arojection that does not exists";
    const refresh_if_proj_none = function()
    {
      var r = robot_controller.chosen_robot;
      if( (projection_controller.isNone( r.projection ) || projection_controller.isNone( last_projection )) && r.projection !== last_projection )
      {
        this.refresh_background();
        event_controller.call_callback( "got_user_position", gps_controller.last_position );
      }

      last_projection = r.projection;
    }.bind(this);
    event_controller.add_callback( "got_robot_position", refresh_if_proj_none );
    event_controller.add_callback( "got_robot_position", update_positions );
    event_controller.add_callback( "robot_list_updated", update_positions );
    event_controller.add_callback( "got_robot_position", this.update_start_location.bind(this) );
    event_controller.add_callback( "got_fake_robot_position", update_positions );
    event_controller.add_callback("chosen_robot_online_changed", update_positions);

    const change_follow_robot = function( v )
    {
      if( this.follow_robot === undefined )
        this.follow_robot = false;

      this.follow_robot = !!v;
    }.bind(this);
    event_controller.add_callback( "change_follow_robot", change_follow_robot );
    this.eventController.add_callback( "active_job_changed", (lastJobId) =>
    {
      this.active_changed(lastJobId);
    } );
    event_controller.add_callback( "template_list_updated", function()
    {
      this.draw_all_jobs();
    }.bind(this) );
    event_controller.add_callback( "job_labels_changed", function()
    {
      this.draw_all_jobs();
    }.bind(this) );
    this.eventController.add_callback( "map_move", function()
    {
      this.draw_all_jobs(true);
    }.bind(this) );
    event_controller.add_callback( "template_type_hidden_state_changed", function()
    {
      this.draw_all_jobs();
    }.bind(this) );

    event_controller.add_callback("tablet_online", this.refresh_background.bind(this));
  }

  update_start_location( call_active_changed = true )
  {
    if(!this.enable_show_start_location)
    {
      return;
    }

    if(!robot_controller.chosen_robot.online)
    {
      return;
    }

    if(robot_controller.chosen_robot.in_auto)
    {
      return;
    }

    if(!robot_controller.has_chosen_robot_position)
    {
      return;
    }

    if(this.jobs.is_active && !this.jobs.active.new_job)
    {
      if( this.jobs.active.is_being_edited )
      {
        return;
      }

      if( this.jobs.active instanceof MultiJob && this.jobs.active.jobs.length === 0 )
      {
        // Don't do anything, if there are no jobs in the multijob list
        return;
      }
      
      if( this.jobs.active.start_from.isSet && !this.jobs.active.start_from.isStartLocation)
      {
        // This case is when NEAR has been used.
        // Then the chosen start from is not a defined start location.
        return;
      }

      const new_loc = this.jobs.active.get_best_start_location();
      if(new_loc !== this.jobs.active.start_from.id || !this.jobs.active.hasStartCircle() )
      {
        this.jobs.active.start_from.id = new_loc;
        if( !!call_active_changed )
        {
          this.active_changed();
        }
      }
    }
  }

  map_click( evt )
  {
    if( !this.allow_map_click )
    {
      return;
    }

    clearTimeout( this.map_click_timeout );

    this.multifield_select_overlay.off();

    var long_click = this.map_click_duration >= this.map_long_click_length;
    logger.debug( "click was " + this.map_click_duration + "ms long " + (long_click ? "This is a long click" : "this is a short click") );

    // Ignore map click under these conditions
    if(robot_controller.user_state === TopStates.AUTOMATIC
      || bottom_bar_chooser.active_bar === "#create-new-pitch-get-corner"
      || bottom_bar_chooser.active_bar === "#resume_later_bar") {
      return;
    }

    var layers = [ ];
    var features = [ ];
    var cluster_features = [ ];

    this.map.forEachFeatureAtPixel( evt.pixel,
      function( feature, layer )
      {
        layers.push( layer );
        features.push( feature );
        if( layer.is_cluster )
          cluster_features.pushAll( feature.get( "features" ) );
      }, {
      hitTolerance: 12
    } );

    let jobs = layers.filter( ( layer ) =>
    {
      return !!layer.job;
    } ).map( function( layer )
    {
      return layer.job;
    } );

    jobs = jobs.filter(job=>job.pitch_layer && job.pitch_layer.getOpacity() === 1);

    cluster_features = cluster_features.map( ( cf ) =>
    {
      return this.jobs.get_job(cf.job_id);
    } );
    jobs = jobs.concat( cluster_features );

    // Remove doublets
    jobs = jobs.filter( ( job, pos ) =>
    {
      return jobs.findIndex( j => j.id === job.id ) === pos;
    } );
    jobs.sort_objects("id");

    if( jobs.length )
    {
      console.groupCollapsed( "Pitches" );
      jobs.forEach( ( job ) =>
      {
          if( job.id < 0 )
            console.log( job.id, (job.id + 1) * -1 ); // i * -1 - 1 = pitch_id <=> i=(pitch_id+1)*-1
          else
            console.log( job.id );
      } );
      console.log( jobs );
      console.groupEnd();
    }

    this.multiselect_state_controller.select_button_overlay.off();
    bottom_bar_chooser.button_overlay.off();
    utilitiesScreenController.choose_utility_overlay.off();
    if( jobs.length === 0 )
      this.remove_overlays();

    if( jobs.length > 0 && (bottom_bar_chooser.active_bar === "#robot-not-selected" || bottom_bar_chooser.active_bar === "#robot-selected" || bottom_bar_chooser.active_bar === "#track-selected" || bottom_bar_chooser.active_bar === "#robot-offline") )
    {
      if( jobs.length === 1 && !cluster_features.length )
      {
        this.selectJob(jobs[0]);
      }
      else
      {
        // show menu
        this.multifield_select_overlay.createContent(jobs);
        this.multifield_select_overlay.on();
      }
      if(this.showClusters())
      {
        this.refresh_cluster_layer();
      }
    }
    else if( bottom_bar_chooser.active_bar === "#copy-track" || bottom_bar_chooser.active_bar === "#offset-track" )
    {
      jobs = jobs.filter( function( job )
      {
        return job.id < 0;
      } );
      if( jobs.length === 0 )
      {
        copy_pitch_screen_controller.unchoose_copy();
      }
      else
      {
        jobs.forEach( function( job )
        {
          copy_pitch_screen_controller.choose_copy( job.id );
        } );
      }

    }
    else if( bottom_bar_chooser.active_bar === "#robot-not-selected" && features.length )
    {

      features.forEach( function( feature )
      {
        if( feature && feature.get( "info_message" ) && typeof (feature.get( "info_message" )) === "function" )
        {
          feature.get( "info_message" )();
        }
      } );

    }
    else if( bottom_bar_chooser.active_bar === "#edit-pitch" )
    {

      if( features.length === 0 )
      {
        edit_pitch_screen_controller.last_touched = -1;
        edit_pitch_screen_controller.draw_pitch();
      }

      features.forEach( function( feature )
      {
        if( feature.name === "user" )
          return;

        if( feature && feature.get( "info_message" ) && typeof (feature.get( "info_message" )) === "function" )
        {
          feature.get( "info_message" )();
        }
      } );

    }
    else if( bottom_bar_chooser.active_bar === "#drive-to-screen" )
    {
      var point = this.map_to_robot( evt.coordinate );
      drive_to_screen_controller.add_point( point );
    }
    else if( bottom_bar_chooser.active_bar === "#measure-screen" )
    {
      if( jobs.length > 0 ){
        
        var proj_string = jobs[ 0 ].projection;
        var point = this.map_to_projection( proj_string, evt.coordinate ).toVector();

        var nearestJob = near_controller.get_nearest_job_to_pos( point, proj_string, jobs ); // nearest_job, nearest_task, nearest_point
        measure_screen.add_point( nearestJob.job, nearestJob.task, nearestJob.point, nearestJob.projection );
      }
    }
    else if( jobs.length === 0 || bottom_bar_chooser.active_bar === "#track-selected" )
    {
      this.deselectJobs();
      this.draw_all_jobs();
    }
      
  }
  deselectJobs() {
    if(this.deselect_on_map_click)
    {
      if(this.jobs.active instanceof MultiJob)
      {
        this.multiselect_state_controller.exitMultiSelectPopup(this);
      }
      else
      {
        this.jobs.reset();
      }
    }
  }
  refreshh_jobs_drawing()
  {
    console.log( "refreshing jobs" );
    this.remove_all_pitches();
    this.draw_all_jobs();
  }
  refresh_specific_job_drawing(option)
  {
    console.log( "refreshing specific jobs" );
    
    this.jobs.get_all_jobs_with_pitch_layer().forEach( job =>
    {
      if(job.options[option]){
        let optionFixedGoalPosts = job.options[option];
        if(optionFixedGoalPosts.val)
        {
          job.removePitchLayer();
          job.draw()
        }
      }
    } );

    this.draw_all_jobs();
  }
  showClusters()
  {
    if( general_settings_screen.settings.show_clusters.val && !robot_controller.is_chosen_none )
    {
      if( this.map_zoom <= SETTINGS.cluster_max_zoom_level )
      {
        return true;
      }
    }
    return false;
  }
  draw_all_jobs(ignoreActive)
  {
    if( !this.map )
      return;

    if( this.showClusters() )
    {
      if(this.last_map_zoom > SETTINGS.cluster_max_zoom_level)
      {
        this.hide_all_pitches();
        this.refresh_cluster_layer();
      }
    }
    else
    {
      if( general_settings_screen.settings.show_clusters.val )
      {
        if(this.last_map_zoom <= SETTINGS.cluster_max_zoom_level)
        {
          this.show_all_pitches();
        }
      }
      this.draw_jobs(ignoreActive);
    }
  }
  refresh_cluster_layer()
  {
    if(this.__last_cluster_layer_refresh_time && this.showClusters())
    {
      if(time.now - this.__last_cluster_layer_refresh_time < 3000)
      {
        return;
      }
    }

    this.__last_cluster_layer_refresh_time = time.now;
    this.draw_pitches_as_cluster( this.jobs.get_all_jobs().list );
  }
  getViewportExtent()
  {
    return this.map.getView().calculateExtent( this.map.getSize() );
  }
  /**
   * 
   * @param {Job} job 
   * @param {Boolean=true} partly_visible Return true if job is only partly in viewport
   */
  isJobInViewport(job, partly_visible = true, extent = null)
  {
    if(!extent)
    {
      extent = this.getViewportExtent();
    }
    try
    {
      
      const lower_left = this.map_to_projection( job.projection, [ extent[ 0 ], extent[ 1 ] ] );
      const upper_right = this.map_to_projection( job.projection, [ extent[ 2 ], extent[ 3 ] ] );

      const corners = job.bb.filter( b => {
        return b;
      } );
      if( !job.bb.length )
      {
        if( !job.tasks.length )
          job.draw();
        job.tasks.forEach( function( task )
        {
          task.ends.forEach( function( end )
          {
            if( end )
              corners.push( end );
          } );
        } );
      }

      
      let left_of_screen;
      let right_of_screen;
      let above_screen;
      let below_screen;

      if( partly_visible )
      {
        left_of_screen = true;
        right_of_screen = true;
        above_screen = true;
        below_screen = true;
      }
      else
      {
        left_of_screen = false;
        right_of_screen = false;
        above_screen = false;
        below_screen = false;
      }
      
      for( let i = 0; i < corners.length; i++ )
      {
        if( partly_visible )
        {
          left_of_screen  &= corners[ i ].x < lower_left[ 0 ];
          right_of_screen &= corners[ i ].x > upper_right[ 0 ];
          above_screen    &= corners[ i ].y > upper_right[ 1 ];
          below_screen    &= corners[ i ].y < lower_left[ 1 ];
        }
        else
        {
          left_of_screen  |= corners[ i ].x < lower_left[ 0 ];
          right_of_screen |= corners[ i ].x > upper_right[ 0 ];
          above_screen    |= corners[ i ].y > upper_right[ 1 ];
          below_screen    |= corners[ i ].y < lower_left[ 1 ];
        }
      }

      return !(left_of_screen || right_of_screen || above_screen || below_screen);
    }
    catch(e)
    {
      throw `Error calculating if job ${job.id} is in viewport: ${e}`;
    }
  }
  getViewportJobs(partly_visible = true, jobs_list = new JobsArray())
  {
    if(jobs_list.length === 0)
    {
      jobs_list = this.jobs.get_all_jobs().list;
    }

    const extent = this.getViewportExtent();
    return jobs_list.filter( ( job ) =>
    {
      try{
        const show = this.isJobInViewport(job, partly_visible, extent) || (job.id === this.jobs.active.id);
  
        if( show && !job.tasks.length )
          job.draw();
  
        return show;
      }
      catch(e)
      {
        uncaughtErrorSend(e);
        return false;
      }
    } );
  }

  draw_jobs(ignoreActive)
  {
    const extent = this.map.getView().calculateExtent( this.map.getSize() );
    const res = this.jobs.get_all_jobs();
    const all_jobs = res.list;
    let active_jobs = res.active;
    let locked_jobs = res.locked;

    // remove jobs that are to far away
    let visible_jobs = this.getViewportJobs(true, all_jobs).filter(j=>!j.locked);

    let not_active = visible_jobs.filter( function( job )
    {
      return active_jobs.findIndex( active => job.id === active.id ) === -1;
    } );
    let hidden_jobs = all_jobs.filter( function( job )
    {
      return visible_jobs.findIndex( visible => job.id === visible.id ) === -1;
    } );
    
    if(!general_settings_screen.settings.show_locked_layouts.val || !this.show_locked_layouts)
    {
      locked_jobs = [];
    }
    else
    {
      locked_jobs = locked_jobs.filter( function( job )
      {
  
        try
        {
          
          var lower_left = this.map_to_projection( job.projection, [ extent[ 0 ], extent[ 1 ] ] );
          var upper_right = this.map_to_projection( job.projection, [ extent[ 2 ], extent[ 3 ] ] );
  
          var corners = job.bb.filter( b => {
            return b;
          } );
          if( !job.bb.length )
          {
            if( !job.tasks.length )
              job.draw();
            job.tasks.forEach( function( task )
            {
              task.ends.forEach( function( end )
              {
                if( end )
                  corners.push( end );
              } );
            } );
          }
  
          var left_of_screen = true;
          for( var i = 0; i < corners.length; i++ )
            left_of_screen &= corners[ i ].x < lower_left[ 0 ];
  
          var right_of_screen = true;
          for( var i = 0; i < corners.length; i++ )
            right_of_screen &= corners[ i ].x > upper_right[ 0 ];
  
          var above_screen = true;
          for( var i = 0; i < corners.length; i++ )
            above_screen &= corners[ i ].y > upper_right[ 1 ];
  
          var below_screen = true;
          for( var i = 0; i < corners.length; i++ )
            below_screen &= corners[ i ].y < lower_left[ 1 ];
  
          var inside = !(left_of_screen || right_of_screen || above_screen || below_screen);
  
          var show = inside || (job.id === this.jobs.active.id);
  
          if( show && !job.tasks.length )
            job.draw();
  
          return show;
        }
        catch(e)
        {
          console.error(e);
          return false;
        }
      }.bind(this) );
    }

    

    this.smart_draw_pitches( not_active, ignoreActive ? [] : active_jobs, hidden_jobs, locked_jobs );
  }
  draw_usb_jobs()
  {
    var res = this.jobs.get_all_jobs();
    var visible_jobs = res.list;
    var active_jobs = res.active;

    var not_active = visible_jobs.filter( function( job )
    {
      return active_jobs.findIndex( j => job.id === j.id ) === -1;
    } );
    this.smart_draw_pitches( not_active, active_jobs, [ ] );
  }
  select_from_popup( pitch_id )
  {
    pitch_id = parseInt( pitch_id );
    console.log( pitch_id );
    const selectedJob = this.jobs.get_job(pitch_id);
    
    this.selectJob(selectedJob);

    this.multifield_select_overlay.off();

  }
  selectJob(job) {
    if(job.locked && !this.canSelectLockedJobs)
    {
      this.locked_job_popup(job);
    }
    else
    {
      if( this.jobs.active instanceof MultiJob )
      {
        if(!this.jobs.active.jobs.find(j=>j.id===job.id)) {
          // Add the job
          this.jobs.active.addJob(job);
          this.eventController.call_callback( "active_job_changed" );
        } else { 
          // Remove a job

          if(this.jobs.active.jobs.length > 2) {
            this.jobs.active.removeJob(job);
            this.eventController.call_callback( "active_job_changed" );
          } else if(this.jobs.active.jobs.length === 2) {
            this.jobs.active.removeJob(job);
            const lastJobId = this.jobs.active.jobs[0].id;
            this.jobs.reset();
            this.jobs.set_active_from_db_job_id( lastJobId );
          } else {
            this.jobs.reset();
            this.jobs.set_active_from_db_job_id( job.id );
          }
        }

      }
      else
      {
        if(this.jobs.active instanceof NullJob) {
          this.jobs.set_active_from_db_job( job );
        } else {
          if(this.jobs.original.id === job.id) {
            this.deselectJobs();
          } else {
            this.multiselect_state_controller.enableMultiSelect(this.jobs.original);
            this.jobs.active.toggleJob(job);
          }
        }
      }
    }
    if( this.map_zoom <= SETTINGS.cluster_max_zoom_level && general_settings_screen.settings.auto_zoom.val ) {
      this.zoom_to_pitch( this.jobs.active );
    }
  }
  remove_popup()
  {
    if( this.popup )
    {
      this.map.removeOverlay( this.popup );
      delete this.popup;
    }
  }
  locked_job_popup(job)
  {
    let go_to_shop;
    let go_to_button_text = "";
    let body = "";

    body += translate["You do not have access to this layout since you do not own the proper template group."];
    if(job.template_group)
    {
      body += "<br>";
      body += translate["You need the %1s group to access this layout."].format(job.template_group.name);
      go_to_shop = ()=>{
        settings_screeen_controller.choose_menu( 'templateshop_screen_header', 'templateshop_screen' );
        templateshop_screen.open_details(job.template_group.id);
      };
      go_to_button_text = translate["Go to %1s"].format(job.template_group.name);
    }
    else
    {
      go_to_shop = ()=>{settings_screeen_controller.choose_menu( 'templateshop_screen_header', 'templateshop_screen' )};
      go_to_button_text = translate["Go to Templates"];
    }

    body += "<br><br>";
    body += `<span style="font-size:var(--font-12)">${job.name} | ${translate[job.template_type]} ${translate[job.template_title]}</span>`;

    pop_generator.create_popup_with_options({
      header: translate["Layout locked"],
      body: body,
      buttons: [
        new PopButton(translate["Ok"], pop_generator.close),
        new PopButton(go_to_button_text, ()=>{
          go_to_shop();
          pop_generator.close();
          settings_screeen_controller.open();
        }),
        new PopButton(AppType === APP_TYPE.TinyLineMarker ? translate["Delete pitch"] : translate["Delete job"], ()=>{
          pop_generator.close();
          delete_pitch_screen_controller.start_delete(job);
        }, "red")
      ]
    });
  }

  async zoom_to_point( projected_point, dont_animate = false, zoom_level = 20, force = false )
  {
    let zoomDuration = 1000;
    
    projected_point.forEach(e=>{if(!isFinite(e)) throw "Point is Infinite";});

    this.map_center = projected_point;
    this.map_zoom = zoom_level;
    if( dont_animate )
    {
      this.map.getView().setCenter( this.map_center );
      this.map.getView().setZoom( this.map_zoom );
    }
    else
    {
      const options = {
        center: (this.map_center),
        duration: zoomDuration
      };

      if( (general_settings_screen.settings.auto_zoom.val || force) && zoom_level >= 0 )
        options.zoom = this.map_zoom;

        this.map.getView().animate( options );
    }
    if (general_settings_screen.settings.follow_robot.val){
      this.isZooming = true;
      await new Promise(resolve => setTimeout(resolve, zoomDuration));
      this.isZooming = false;
    }
    
  }

  zoom_to_extent( extent, force = false, duration = 1000)
  {
    console.warn( "Zoom to extent", extent );
    try
    {
      extent.forEach(e=>{if(!isFinite(e)) throw "Extent is Infinite";});

      if(extent[0] > extent[2])
      {
        console.warn("Extent must be on the form [minx, miny, maxx, maxy]. The extent provided is on the form [maxx, miny, minx, maxy].");
        console.log("X dimension will be flipped");
        let tmp = extent[0] + 0;
        extent[0] = extent[2];
        extent[2] = tmp;
      }
      if(extent[1] > extent[3])
      {
        console.warn("Extent must be on the form [minx, miny, maxx, maxy]. The extent provided is on the form [minx, maxy, maxx, miny].");
        console.log("Y dimension will be flipped");
        let tmp = extent[1] + 0;
        extent[1] = extent[3];
        extent[3] = tmp;
      }

      var extent_center = [ (extent[ 0 ] + extent[ 2 ]) / 2, (extent[ 1 ] + extent[ 3 ]) / 2 ];
      if( general_settings_screen.settings.auto_zoom.val || force )
      {
        var view = this.map.getView();
        var options = {
//        center: (extent_center), // @type {ol.Coordinate}
//        resolution: view.getResolutionForExtent( extent ),
          duration: duration,
          maxZoom: 20
        };

        view.fit( extent, options );
      }
      else
      {
        this.zoom_to_point( extent_center );
      }
    }
    catch( e )
    {
      console.warn( "Could not zoom to extent", e );
  }
  }
  center_map_on_user( dont_animate )
  {
    console.log( "center user" );
    this.zoom_to_point( this.ol_proj_fromLonLat( gps_controller.last_position, this.projection ), dont_animate, -1 );
  }
  zoom_to_user( dont_animate )
  {
    console.log( "zoom to user" );
    this.zoom_to_point( this.ol_proj_fromLonLat( gps_controller.last_position, this.projection ), dont_animate, undefined, true );
  }
  center_map_on_robot( dont_animate )
  {
    console.log( "center on robot" );
    this.zoom_to_point( this.robot_to_map( robot_controller.chosen_robot_position.toArray() ), dont_animate, -1 );
  }
  zoom_to_robot( dont_animate )
  {
    console.log( "zoom to robot" );
    this.zoom_to_point( this.robot_to_map( robot_controller.chosen_robot_position.toArray() ), dont_animate, undefined, true );
  }
  zoom_to_lng_lat( lnglat, dont_animate )
  {
    console.log( "zoom to robot" );
    this.zoom_to_point( this.ol_proj_fromLonLat( lnglat, this.projection ), dont_animate, undefined, true );
  }
  zoom_to_robot_point_extent( projected_point, force )
  {
    console.log( "Zoom to robot-point extent" );

    var robot = this.robot_to_map( robot_controller.chosen_robot_position.toArray() );

    var xmin, xmax, ymin, ymax, xdiff, ydiff;
    if( robot[0] < projected_point[0] )
    {
      xmin = robot[0];
      xmax = projected_point[0];
    }
    else
    {
      xmin = projected_point[0];
      xmax = robot[0];
    }
    if( robot[1] < projected_point[1] )
    {
      ymin = robot[1];
      ymax = projected_point[1];
    }
    else
    {
      ymin = projected_point[1];
      ymax = robot[1];
    }
    xdiff = Math.abs( xmax - xmin );
    ydiff = Math.abs( ymax - ymin );

    if( xdiff < 50 && ydiff < 50 )
    {
      ydiff = 100;
      xdiff = 100;
    }

    this.zoom_to_extent( [ xmin, ymin, xmax, ymax ], force );
  }
  zoom_to_pitch( db_job, force, duration )
  {
    //var db_job;
    if( !db_job )
    {
      db_job = this.jobs.active;
    }

    var extent_corners = {
      min: [ Infinity, Infinity ],
      max: [ -Infinity, -Infinity ]
    };
    extent_corners.min[0] = db_job.center.x;
    extent_corners.max[0] = db_job.center.x;

    extent_corners.min[1] = db_job.center.y;
    extent_corners.max[1] = db_job.center.y;

    function proccess_corner( corner )
    {
      if( corner.x > extent_corners.max[ 0 ] )
        extent_corners.max[ 0 ] = corner.x;
      if( corner.y > extent_corners.max[ 1 ] )
        extent_corners.max[ 1 ] = corner.y;

      if( corner.x < extent_corners.min[ 0 ] )
        extent_corners.min[ 0 ] = corner.x;
      if( corner.y < extent_corners.min[ 1 ] )
        extent_corners.min[ 1 ] = corner.y;
    }

    db_job.bb.forEach( proccess_corner );

    if( !db_job.bb.length )
    {
      db_job.tasks.forEach( function( task )
      {
        task.ends.forEach( proccess_corner );
      } );
    }

    extent_corners.min[ 0 ] -= (extent_corners.max[ 0 ] - extent_corners.min[ 0 ]) * 0.5;
    extent_corners.max[ 0 ] += (extent_corners.max[ 0 ] - extent_corners.min[ 0 ]) * 0.5;
    extent_corners.min[ 1 ] -= (extent_corners.max[ 1 ] - extent_corners.min[ 1 ]) * 0.25;
    extent_corners.max[ 1 ] += (extent_corners.max[ 1 ] - extent_corners.min[ 1 ]) * 0.1;

    extent_corners.min = this.projection_to_map( db_job.projection, extent_corners.min );
    extent_corners.max = this.projection_to_map( db_job.projection, extent_corners.max );
    extent_corners.center = vec_div( vec_add( extent_corners.min, extent_corners.max ), 2 );

    var extent = [ extent_corners.min[ 0 ], extent_corners.min[ 1 ], extent_corners.max[ 0 ], extent_corners.max[ 1 ] ];
    if( extent[ 0 ] && extent[ 1 ] && extent[ 2 ] && extent[ 3 ] )
      this.zoom_to_extent( extent, force, duration );
    else
      console.log( "Cant zoom to this job" );

  }
  zoom_to_pitches( jobs, force )
  {

    if( !jobs.length )
    {
      console.log( "No jobs to zoom to" );
      return;
    }

    var extent_corners = {
      min: [ Infinity, Infinity ],
      max: [ -Infinity, -Infinity ]
    };

    function proccess_corner( corner )
    {
      if( corner.x > extent_corners.max[ 0 ] )
        extent_corners.max[ 0 ] = corner.x;
      if( corner.y > extent_corners.max[ 1 ] )
        extent_corners.max[ 1 ] = corner.y;

      if( corner.x < extent_corners.min[ 0 ] )
        extent_corners.min[ 0 ] = corner.x;
      if( corner.y < extent_corners.min[ 1 ] )
        extent_corners.min[ 1 ] = corner.y;
    }

    jobs.forEach( function( job )
    {
      job.bb.forEach( proccess_corner );
      if( !job.bb.length )
      {
        job.tasks.forEach( function( task )
        {
          task.ends.forEach( proccess_corner );
        } );
      }
    } );

    extent_corners.min[ 0 ] -= (extent_corners.max[ 0 ] - extent_corners.min[ 0 ]) * 0.5;
    extent_corners.max[ 0 ] += (extent_corners.max[ 0 ] - extent_corners.min[ 0 ]) * 0.5;
    extent_corners.min[ 1 ] -= (extent_corners.max[ 1 ] - extent_corners.min[ 1 ]) * 0.25;
    extent_corners.max[ 1 ] += (extent_corners.max[ 1 ] - extent_corners.min[ 1 ]) * 0.1;

    extent_corners.min = this.projection_to_map( jobs[ 0 ].projection, extent_corners.min );
    extent_corners.max = this.projection_to_map( jobs[ 0 ].projection, extent_corners.max );
    extent_corners.center = vec_div( vec_add( extent_corners.min, extent_corners.max ), 2 );

    var extent = [ extent_corners.min[ 0 ], extent_corners.min[ 1 ], extent_corners.max[ 0 ], extent_corners.max[ 1 ] ];
    if( extent[ 0 ] && extent[ 1 ] && extent[ 2 ] && extent[ 3 ] )
      this.zoom_to_extent( extent, force );
    else
      console.log( "Cant zoom to this job" );
  }
  zoom_to_all()
  {

    let slow = true;

    if( slow )
    {
      const all_jobs = this.jobs.get_all_jobs().list;
      const job_centers = all_jobs.map(job=>this.projection_to_map(job.projection,job.center.toArray()));
      const x = job_centers.map(c=>c[0]).filter(c=>isFinite(c));
      const y = job_centers.map(c=>c[1]).filter(c=>isFinite(c));
      if( x.length > 0 && y.length > 0)
      {
        const extent = [math.min(x), math.min(y), math.max(x), math.max(y)];
        this.zoom_to_extent(extent, true);
      }
      return;
    }

    //Create an empty extent that we will gradually extend
    var extent = ol.extent.createEmpty();

    this.map.getLayers().forEach( function( layer )
    {
      //If this is actually a group, we need to create an inner loop to go through its individual layers
      if( layer instanceof ol.layer.Group )
      {
        layer.getLayers().forEach( function( groupLayer )
        {
          //If this is a vector layer, add it to our extent
          if( groupLayer instanceof ol.layer.Vector )
          {
            ol.extent.extend( extent, groupLayer.getSource().getExtent() );
          }
        } );
      }
      else if( layer instanceof ol.layer.Vector )
      {
        if( layer.getSource().getFeatures()[0] && layer.getSource().getFeatures()[0].getProperties().name !== "user" )
          ol.extent.extend( extent, layer.getSource().getExtent() );
      }
    }.bind(this) );

    if( extent.equal([Infinity, Infinity, -Infinity, -Infinity]) )
    {
      const all_jobs = this.jobs.get_all_jobs().list;
      this.zoom_to_pitches(all_jobs);
    }
    else
    {
      //Finally fit the map's view to our combined extent
      this.zoom_to_extent( extent, true );
    }
  }
  zoom_to_level( level )
  {
    this.zoom_to_point(this.map.getView().getCenter(),false,level);
  }
  remove_all_pitches()
  {
    this.jobs.forEach( job => job.removePitchLayer() );
    this.jobs.active.removePitchLayer();
  }
  hide_all_pitches()
  {
    this.jobs.forEach( job => job.hidePitchLayer() );
    this.jobs.active.hidePitchLayer();
  }
  show_all_pitches()
  {
   let tmp = Object.keys(file_loader_screen.hide_layers);
   this.jobs.forEach((job) => {
    try {
      if(tmp.indexOf(job.tasks[0].layer) === -1){
        job.showPitchLayer();
      }
    } catch (e) {
      console.warn(e);
    }
   });
   this.jobs.active.showPitchLayer();
  }
  active_changed(lastJobId)
  {
    this.update_start_location(false);
    this._actual_active_changed(lastJobId);
  }
  _actual_active_changed(lastJobId = -1)
  {
    if( this.jobs.active instanceof MultiJob )
    {
      if( this.jobs.active.jobs.length > 0 )
      {
        this.multiselect_job_list_overlay.createContent(
          this.jobs.active.jobs,
          (pitch_id,relative_index)=>{
            this.jobs.active.moveJob.bind(this.jobs.active)(pitch_id,relative_index);
            this.eventController.call_callback( "active_job_changed" );
          }
        );
        this.multiselect_job_list_overlay.on();
      }
      else
      {
        this.multiselect_job_list_overlay.off();
      }
    }
    else
    {
      this.multiselect_job_list_overlay.off();
    }

    if(lastJobId > 0)
    {
      this.draw_pitch(this.jobs.get_db_job(lastJobId), Background.featureColor.DEFAULT);
    }
    this.jobs.get_original_jobs().forEach(job=>this.draw_pitch(job, Background.featureColor.DEFAULT));
    this.jobs.get_active_jobs().forEach(job=>!job.new_job && this.draw_pitch(job, Background.featureColor.ACTIVE, SETTINGS.draw_job_start_position && this.enable_show_start_location));
    this.refresh_cluster_layer();
  }
  /**
   * 
   * @param {JobsArray} not_active 
   * @param {JobsArray} active_jobs 
   * @param {JobsArray=} hidden_jobs 
   * @param {JobsArray=} locked_jobs
   */
  smart_draw_pitches( not_active, active_jobs, hidden_jobs = [], locked_jobs = [] )
  {
    this.draw_pitches( not_active, Background.featureColor.DEFAULT );
    this.drawn_jobs = not_active;

    this.draw_pitches( locked_jobs, Background.featureColor.NOACCESS );
    
    if( !this.ignore_active )
    {
      active_jobs.forEach( job => this.draw_pitch( job, Background.featureColor.ACTIVE, SETTINGS.draw_job_start_position && this.enable_show_start_location ));
      this.drawn_jobs = this.drawn_jobs.concat( active_jobs );
    }

    this.drawn_jobs = this.drawn_jobs.concat( locked_jobs );
  }
  draw_pitches_as_cluster( jobs = [])
  {
    if( this.drawn_cluster )
      this.removePitchLayer( this.drawn_cluster );
    this.drawn_cluster = false;
    if( !jobs.length )
      return;

    if( !(general_settings_screen.settings.show_clusters.val && !robot_controller.is_chosen_none) )
      return;

    //var features = new Array( jobs.length );
    var map_centers = jobs.map( job => {
      try{
        const use_ol_proj = this.get_ol_projection( job );
        const job_projection = job.projector;
        const center = use_ol_proj.fromLonLat( job_projection.inverse( job.center.toArray() ), this.projection );
        job.map_center = center;
        return job;
        //return job.map_center_position; // This should be calculated somewhere else at some point.
      }
      catch(e) {
        console.error(e);
        return new NullJob();
      }
    } );
    map_centers = map_centers.filter(j=>!(j instanceof NullJob)).filter( job => {
      return job.map_center[0] && job.map_center[1];
    } );
    var features = map_centers.map( ( job ) => {
      var new_f = new ol.Feature( new ol.geom.Point( job.map_center ) );
      new_f.job_id = job.id;
      return new_f;
    } );

    var min_x = map_centers.map( c => {
      return c[0];
    } ).sort()[0];
    var max_x = map_centers.map( c => {
      return c[0];
    } ).sort().last();
    var min_y = map_centers.map( c => {
      return c[1];
    } ).sort()[0];
    var max_y = map_centers.map( c => {
      return c[1];
    } ).sort().last();

    var source = new ol.source.Vector( {
      features: features,
      wrapDateLine: false,
      wrapX: false,
      noWrap: true
    } );

    var clusterSource = new ol.source.Cluster( {
      distance: 50,
      source: source,
      wrapDateLine: false,
      wrapX: false,
      noWrap: true
    } );

    var styleCache = {
      "empty": new ol.style.Style( {} )
    };
    var cluster_layer = new ol.layer.Vector( {
      source: clusterSource,
      style: function( feature )
      {
        if( this.map.getView().getZoom() > SETTINGS.cluster_max_zoom_level || !(general_settings_screen.settings.show_clusters.val && !robot_controller.is_chosen_none) )
          return  styleCache["empty"];

        var fs = feature.get( 'features' ).map( f => {
          return f.job_id;
        } );
        var is_with_chosen = false;
        ("" + this.jobs.active.id).split( "," ).forEach( id => {
          is_with_chosen |= fs.indexOf( parseInt( id ) ) >= 0;
        } );
        //var is_with_chosen = false;

        var size = feature.get( 'features' ).length;
        var style = styleCache[size];
        if( !style || is_with_chosen )
        {
          style = new ol.style.Style( {
            image: new ol.style.Circle( {
              radius: 15,
              stroke: new ol.style.Stroke( {
                color: '#fff'
              } ),
              fill: new ol.style.Fill( {
                color: is_with_chosen ? '#ffff00' : '#3399CC'
              } )
            } ),
            text: new ol.style.Text( {
              text: size.toString(),
              fill: new ol.style.Fill( {
                color: is_with_chosen ? '#000' : '#fff'
              } )
            } )
          } );
          if( !is_with_chosen )
            styleCache[size] = style;
        }
        return style;
      }.bind(this)
    } );
    cluster_layer.setZIndex( 10000 );
    cluster_layer.is_cluster = true;

    this.map.addLayer( cluster_layer );
    this.drawn_cluster = cluster_layer;
  }
  /**
   * 
   * @param {Array<Job>} db_jobs 
   * @param {Background.featureColor} color 
   * @param {Array<Job>} exclude 
   * @returns 
   */
  draw_pitches( jobs, color, exclude = [])
  {
    const ex_ids = exclude.map( function( job )
    {
      return job.id;
    } );
    jobs.forEach( ( job ) =>
    {
      if( ex_ids.indexOf( job.id ) === -1 )
      {
        this.draw_pitch( job, color );
      }
    } );
    return exclude;
  }
  /**
   * 
   * @param {Job} job 
   * @param {Background.featureColor} color 
   * @param {Boolean} draw_start_position 
   */
  draw_pitch_in_viewport( job, color, draw_start_position, force = false )
  {
    if(!(job instanceof Job) || (!job))
    {
      return;
    }

    try {
      if(this.isJobInViewport(job))
      {
        if(job.templateHidden() && !this.drawHiddenTemplates) {
          return;
        }
  
        if(job.locked && !this.show_locked_layouts) {
          return;
        }
  
        if( !job.tasks.length ) {
          job.draw();
        }
  
        this._draw_pitch( job, color, draw_start_position, force )
      }
    }
    catch(e) {
      throw `Error drawing pitch ${job.id} in viewport: ${e}`;
    }
  }
  /**
   * 
   * @param {Job} job 
   * @param {Background.featureColor} color 
   * @param {Boolean} draw_start_position 
   */
  draw_pitch( job, color, draw_start_position, force = false )
  {
    this.draw_pitch_in_viewport(...arguments);
  }

  /**
   * Determines if a job should actually be drawn
   * @param {Job} job is the job to check
   */
  _shouldBeDrawn(job) {
    if (!job) {
      return false;
    }
    if (!(job instanceof Job)) {
      return false;
    }
    if (  general_settings_screen.showJobsFromSource !== JobSourceToShow.ALL
       && job.source !== general_settings_screen.showJobsFromSource)  {
        return false;
    }
    return true;
  }


  /**
   * 
   * @param {Job} job 
   * @param {Background.featureColor} color 
   * @param {Boolean} draw_start_position 
   */
  _draw_pitch( job, color, draw_start_position, force = false )
  {
    if(!this._shouldBeDrawn(job)) {
      return;
    }

    // Draw jobs async
    setTimeout(() => {

      if( job.pitch_layer )
      {
        if( color !== job.pitch_layer.color || job.pitch_layer.color === Background.featureColor.ACTIVE || force )
        {
          job.removePitchLayer();
        }
      }
      if( !job.pitch_layer )
      {
        job.pitch_layer = this.draw_job( job, color, true, false, draw_start_position );
      }
    }, 0);
  }
  removePitchLayer( pitch_layer )
  {
    if( !pitch_layer )
      return;

    if( pitch_layer.labels )
    {
      pitch_layer.labels.forEach( label =>
      {
        this.map.removeOverlay( label );
      } );
    }
    this.map.removeLayer( pitch_layer );
    if(pitch_layer && DEBUG_MODE)
    {
      console.warn(`DRAW ${pitch_layer.color}`, pitch_layer.job, "removed pitch layer", pitch_layer, pitch_layer.uuid)
    }
  }
  draw_job( job, color, clickable, dragable, draw_start_position, lineWidth = undefined )
  {
    try
    {
      if(job instanceof MultiJob && color === Background.featureColor.DEFAULT) { // TODO: Don't do this! Find a better way
        return;
      }
      const pitch_layer = this.create_pitch_layer( job, color, clickable, dragable, this.projection, this.show_ignored_geometries, draw_start_position, true, lineWidth );
      if(this.showClusters())
      {
        pitch_layer.hide();
      }
      this.map.addLayer( pitch_layer );
      if(this.showClusters())
      {
        this.refresh_cluster_layer();
      }
      if(pitch_layer && DEBUG_MODE)
      {
        console.warn(`DRAW ${pitch_layer.color}`, job, "created pitch layer", pitch_layer, pitch_layer.uuid, pitch_layer.getSource().getFeatures()[0].getGeometry().getCoordinates());
      }
      return pitch_layer;
    }
    catch( e )
    {
      console.error( "error drawing job on map", e, job );
      return undefined;
    }
  }

  static get dotIconList()
  {
    const icons = [
      'dot',
      'cross',
      'plus',
      'crosshair',
      'crosshair2'
    ];
    return icons;
  }

  static get dotIcon()
  {
    const selection = general_settings_screen.settings.map_dot_type.val;
    return ol_svg_icons[Background.dotIconList[selection]];
  }

  static createDotIcon( color )
  {
    const icon = Background.dotIcon(color);

    return new ol.style.Icon( {
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: icon.scale,
      src: icon.src
    });
  }

  draw_job_styles( color, lineWidth )
  {
    const style = function(color, _lineWidth = 3, lineDash = null, zindex = 100, olDash = null)
    {
      return {
        line: new ol.style.Style( {
          stroke: new ol.style.Stroke( {
            color: color,
            width: _lineWidth,
            lineCap: "square",
            lineDash: olDash
          } ),
          zIndex: zindex
        } ),
        dot:  new ol.style.Style( {
            image: Background.createDotIcon(color),
            stroke: new ol.style.Stroke( {
              color: color
            } ),
            zIndex: zindex
        } ),
        dash: lineDash instanceof Array ? lineDash : []
      };
    }

    const styles = {
      paint: style(color, lineWidth, false),
      between: style(Background.featureColor.BETWEEN, 4, null, 1000, [15]), // test dashing here http://phrogz.net/tmp/canvas_dashed_line.html
      antinapping: style(Background.featureColor.ANTINAPPING, 3),
      interference_filter: style(Background.featureColor.INTERFERENCE_FILTER, 3),
      ignore: style(Background.featureColor.IGNORE, 3, false, -100),
      nearest: style(Background.featureColor.SPECIAL, 3, false),
      via: style(Background.featureColor.VIA, 4, false, 1000)
    };
    return styles;
  }
  static get featureColor() {
    return {
      DEFAULT: "#FFFFFF",
      ACTIVE: "#FFFF00",
      COPY: "#00FF67",
      IGNORE: "#FF0000",
      PROGRESS: "#00E7FF",
      SPECIAL: "#FF00FF",
      NOACCESS: "#666666",
      BETWEEN: "#ff7afc",
      ANTINAPPING: "#3F00FF",
      INTERFERENCE_FILTER: "#FF7F00",
      NOPAINT: "#00FF67",
      STARTARROW: "#00FF67",
      VIA: "#ff7afc"
    };
  }
  /**
   * 
   * @param {Job} job 
   * @param {Background.featureColor} color 
   * @param {boolean} clickable 
   * @param {boolean} dragable 
   * @param {string} projection 
   * @param {boolean} show_ignored_lines 
   * @param {boolean} draw_start_position 
   * @param {boolean} draw_label 
   * @returns {ol.layer.Vector} pitch_layer
   */
  create_pitch_layer( job, color, clickable, dragable, projection, show_ignored_lines, draw_start_position, draw_label = true, lineWidth = undefined)
  {
    this.draw_label = draw_label;
    const styleFunc = function( feature, resolution )
      {
        /*
         * Arrows
         */
        const geometry = feature.getGeometry();
        const styles = [ feature.get( 'style' ) ].filter(s=>!!s);
        const is_dot = feature.get( 'is_dot' ); // Not used in advanced edit screen
        const is_bb = feature.get( 'is_bb' );
        const is_label = feature.get( 'is_label' );
        const task_id = feature.get( 'id' );
        let first_arrow = !!feature.get( 'first_arrow' );

        let color = Background.featureColor.IGNORE;
        // let color = "";
        let zIndex;
        styles.forEach( s => {
          if( s.getStroke() )
            color = s.getStroke().getColor();
          zIndex = s.getZIndex();
        } );

        // const between = Background.scaleFromResolution(resolution) >= 1 ? 15 : 30;
        const between = 100;
        const margin = general_settings_screen.settings.show_dashing.val ? 0 : between / 10;

        const test_start_arrows = general_settings_screen.settings.show_job_task_arrows.val && SETTINGS.show_job_task_arrows && first_arrow;
        const test_direc_arrows = general_settings_screen.settings.show_job_direction_arrows.val && SETTINGS.show_job_direction_arrows && Background.scaleFromResolution(resolution) > 0.5;
        const test_interaction = job.interaction_type === Job.interaction_types.PITCH && !is_bb && !is_dot && !is_label;
        const test_color = color !== Background.featureColor.PROGRESS && color !== Background.featureColor.IGNORE;
        const test_job = (this.jobs.active instanceof MultiJob && this.jobs.active.jobs.findIndex(j=>j===job)!=-1) || this.jobs.active === job;

        if( test_job && !this.jobs.active.new_job && this.show_decorations && test_interaction && (test_start_arrows || test_direc_arrows) && test_color )
        {
          const direc_arrow_icon = ol_svg_icons.arrow_small(color);
          const start_arrow_icon = ol_svg_icons.arrow_large(Background.featureColor.STARTARROW);
          const generateArrow = ( point, rotation, icon, anchor ) => {
            return new ol.style.Style( {
              geometry: new ol.geom.Point( point ),
              image: new ol.style.Icon( {
                src: icon.src,
                anchor: anchor,
                rotateWithView: true,
                rotation: -rotation,
                scale: (Background.scaleFromResolution(resolution)*icon.scale).coerce(icon.scale*1.5,icon.scale*2)
              } ),
              zIndex: zIndex
            } );
          };

          const pA = [];
          const dpA = [];
          const rotA = [];
          let totalLength = 0;
          const tlA = [totalLength];

          const coords = geometry.getCoordinates().flat();
          if(!(coords[0] instanceof Array))
          {
            return styles;
          }

          let start = coords[0]
          const step = Math.floor(coords.length / 100).coerce(1);
          for (let i = 1; i < coords.length; i+=step) {
            const end = coords[i];
            const dx = end[ 0 ] - start[ 0 ];
            const dy = end[ 1 ] - start[ 1 ];
            const rotation = Math.atan2( dy, dx );
            totalLength += Math.sqrt( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) );

            pA.push(start.copy());
            dpA.push([dx,dy]);
            tlA.push(totalLength);
            rotA.push(rotation);
            start = end; 
          }

          if(isNaN(totalLength) || totalLength < 0.5)
          {
            return styles;
          }

          tlA.pop(); // Remove last element, so that it is not used in finding index

          let first_arrow_created = false;
            const createArrowPointRecurse = (place, step, depth = 0) => {
               if(++depth === 1000){
                return;
              }
              if(isNaN(place) || isNaN(step))
              {
                return;
              }
  
              if( !coords.length )
              {
                return;
              }
  
              if( first_arrow_created && ((place-margin) < 0 || (place+margin) > totalLength))
              {
                return;
              }
  
              const i = getFirstIndexOfMinValue(math.abs(tlA.map(segment=>segment-place)));
              if(i === tlA.length)
              {
                return;
              }
  
              const segmentEnd = tlA[i+1] ? tlA[i+1] : totalLength;
              const diffFromTruePos = place - tlA[i];
  
              if(diffFromTruePos < 0)
              {
                return createArrowPointRecurse(place+diffFromTruePos, step, depth);
              }
              else
              {
                const scaleToTruePos = diffFromTruePos / segmentEnd;
                const new_point = [pA[i][0]+dpA[i][0]*scaleToTruePos, pA[i][1]+dpA[i][1]*scaleToTruePos];
                styles.push( generateArrow(new_point, rotA[i], direc_arrow_icon, [ 0.45, 0.5 ]) );
  
                first_arrow_created = true;
                
                return createArrowPointRecurse(place+step, step, depth);
              }
  
            };

          if( test_direc_arrows )
          {
            const place = totalLength/2;
            createArrowPointRecurse(place, between);
            createArrowPointRecurse(place-between, -between);
          }

          if( test_start_arrows && first_arrow && task_id !== undefined )
          {
            if( general_settings_screen.settings.show_dashing.val )
            {
              const use_ol_proj = this.get_ol_projection( job );
              const job_projection = job.projector;
              const task_start = use_ol_proj.fromLonLat( job_projection.inverse( job.get_task( task_id ).start.toArray() ), this.projection );
              const geom_start = pA[0];
              if(!task_start.toVector().veryclose( geom_start.toVector() ))
                first_arrow = false;
            }
            if( first_arrow )
            {
              styles.push(generateArrow(pA[0], rotA[0], start_arrow_icon, [1, 0.5]));
            }
          }
        }

        return styles;
      }.bind(this);

    if(!color)
    {
      if(job.locked)
      {
        color = Background.featureColor.NOACCESS;
      }
      else if(job === this.jobs.active)
      {
        color = Background.featureColor.ACTIVE;
      }
      else
      {
        color = Background.featureColor.DEFAULT;
      }
    }

    const pitch_layer = new ol.layer.Vector( {
      source: this.create_pitch_vector_lines( job, color, clickable, dragable, projection, show_ignored_lines, draw_start_position, draw_label, lineWidth ),
      style: styleFunc
    } );
    pitch_layer.job = job;
    pitch_layer.color = color;

    pitch_layer.remove = () => {
      this.removePitchLayer(pitch_layer);
    }

    pitch_layer.hide = () => {
      pitch_layer.setOpacity(0);
    }
    pitch_layer.show = () => {
      pitch_layer.setOpacity(1);
    }

    if(pitch_layer.color === Background.featureColor.ACTIVE) {
      pitch_layer.setZIndex( 2000 );
    }

    if(job.pitchLayerHidden) {
      pitch_layer.hide();
    }

    pitch_layer.uuid = guid();

    return pitch_layer;
  }
  get_ol_projection( job )
  {
    if( !job )
      return;

    var proj_string = job.projection;
    if( projection_controller.isNone( proj_string ) )
    {
      var use_ol_proj = {
        fromLonLat: function( pos )
        {
          return pos;
        }
      };
    }
    else
    {
      var use_ol_proj = ol.proj;
    }

    return use_ol_proj;
  }

  /**
   * 
   * @param {Job} job 
   * @param {Background.featureColor} color 
   * @param {boolean} clickable 
   * @param {boolean} dragable 
   * @param {string} projection 
   * @param {boolean} show_ignored_lines 
   * @param {boolean} draw_start_position 
   * @param {boolean} draw_label 
   * @returns {ol.source.Vector} vector source
   */
  create_pitch_vector_lines( job, color, clickable, dragable, projection, show_ignored_lines, draw_start_position, draw_label = true, lineWidth = undefined)
  {
    var styles = this.draw_job_styles( color, lineWidth );
    if(job.tasks.length === 0) {
      job.draw();
    }
    let tasks = [];
    if(job.start_from.isSet) {
      tasks = job.get_rearranged_tasks_around_id(job.start_from.id).copy();
    }
    else {
      tasks = job.get_rearranged_tasks().copy();
    }

    var use_ol_proj = this.get_ol_projection( job );
    const job_projection = job.projector;

    const projectPoint = ( point ) => {
      return use_ol_proj.fromLonLat( job_projection.inverse( point ), projection );
    };

    const projectPoints = ( points ) => {
      return points.map( point => {
        return projectPoint( point.toArray() );
      } );
    };

    const vectorLine = new ol.source.Vector( {
      wrapDateLine: false,
      wrapX: false,
      noWrap: true
    } );

    if(tasks.length === 0)
    {
      return vectorLine;
    }

    var bounding_boks = job.bb;
    if( job.click_bounding_box )
    {
      // draw bounding box
      if( !clickable )
        bounding_boks = [ ];
      var bb = projectPoints(bounding_boks);
      var polyFeature = new ol.Feature( {
        geometry: new ol.geom.Polygon( [ bb ] ),
        is_bb: true,
        job_id: job.id,
        job: job,
        dragable: dragable,
        style: new ol.style.Style( {
          stroke: new ol.style.Stroke( {
            color: [ 0, 0, 0, 0 ],
            width: 0
          } )
        } )
      } );
      polyFeature.bb_me = true;
      vectorLine.addFeature( polyFeature );
    }

    const generateBetweenLine = (start, end) => {
      if(start.veryclose(end))
      {
        return;
      }
      let geometry; 
      if(styles.between.dash.length > 0) {
        geometry = new ol.geom.MultiLineString( new Line( start, end ).split(...styles.between.dash).map( ( piece ) => projectPoints([piece.start, piece.end])) );
      } else {
        geometry = new ol.geom.MultiLineString( [new Line( start, end )].map( ( piece ) => projectPoints([piece.start, piece.end])) );
      }
      vectorLine.addFeature( new ol.Feature( {
        geometry: geometry,
        job_id: job.id,
        job: job,
        is_between: true,
        style: styles.between.line
      } ) );
    };

    const calculateDashingParamsFromIndex = taskID => {
      const params = {};
      params.length = job.getTaskActionOptionByTaskID( taskID, "dashed_length" );
      params.space = job.getTaskActionOptionByTaskID( taskID, "dashed_space" );
      params.offset = job.getTaskActionOptionByTaskID( taskID, "dashed_offset" );

      params.first_length = job.getTaskActionOptionByTaskID( taskID, "lineat_begin_length" );
      params.last_length = job.getTaskActionOptionByTaskID( taskID, "lineat_end_length" );
      params.reference = job.getTaskActionOptionByTaskID( taskID, "dashed_reference" );
      params.align = job.getTaskActionOptionByTaskID( taskID, "dashed_align" );

      if( !(robot_controller.robot_has_capability( "dash_alignment_options" )) )
      {
        params.first_length = 0;
        params.last_length = 0;
        params.reference = 0;
        params.align = 0;
      }
      return params;
    };
    const calculateDashingParamsFromStyleDash = dash => {
      if(!(dash instanceof Array) || dash.length < 2) {
        return;
      }

      const params = {};
      params.length = dash[0];
      params.space = dash[1];
      params.offset = 0;

      params.first_length = 0;
      params.last_length = 0;
      params.reference = 0;
      params.align = 0;
      return params;
    };

    const generateTaskLabel = (task, use_style, label = "", for_line = null, custom_color = null, custom_offset = null) => {
      if(label === "")
      {
        return;
      }

      const scale = 1;
      const style = new ol.style.Style( {
        text: new ol.style.Text( {
          textAlign: "center",
          textBaseline: "middle",
          font: `600 ${parseInt( 20 * scale )}px ProximaNova, sans-serif`,
          text: label,
          fill: new ol.style.Fill( {
            color: "#000000"
          } ),
          stroke: new ol.style.Stroke( {
            color: custom_color ? custom_color : color,
            width: 3
          } ),
          offsetX: parseInt( task.label_offset[ 0 ] * scale ),
          offsetY: parseInt( custom_offset ? custom_offset * scale : task.label_offset[ 1 ] * scale ),
          placement: for_line ? "line" : "point",
          maxAngle: 0,
          overflow: true,
          rotation: 0
        }),
        zIndex: use_style.getZIndex()+10,
      });
      let tmp = [];
      if(for_line){
          if(task.ends){
            tmp.push(task.ends[0]);
            tmp.push(task.ends[1]);
          }
      }
      var featureLine = new ol.Feature( {
        geometry: for_line ? new ol.geom.LineString( projectPoints(tmp) ): new ol.geom.Point( projectPoint( task.label_position.toArray() ) ),
        style: style,
        is_label: true,
      });
      if( general_settings_screen.settings.label_scale.val )
      {
        featureLine.setStyle((feature, resolution) => {
          const scale = (Background.scaleFromResolution(resolution)*0.25);
          style.getText().setFont( `600 ${parseInt( 20 * scale )}px ProximaNova, sans-serif` );
          style.getText().setOffsetX( parseInt( task.label_offset[ 0 ] * scale ) );
          style.getText().setOffsetY( parseInt( task.label_offset[ 1 ] * scale ) );
          return style;
        });
      }
      vectorLine.addFeature( featureLine );
    };

    const generateStartCircle = (use_style) => {
      const center = projectPoint(job.start_from.point.toArray());

      const icon = ol_svg_icons.circle('#B12C23');
      const style = new ol.style.Style( {
        geometry: new ol.geom.Point( center ),
        image: new ol.style.Icon( {
          src: icon.src,
          anchor: [ 0.5, 0.5 ],
          rotateWithView: true,
          scale: icon.scale
        } ),
        zIndex: use_style.getZIndex()+1
      } );
      var featureLine = new ol.Feature( {
        geometry: new ol.geom.Point( center ),
        is_start_circle: true
      } );
      if(SETTINGS.scale_with_map_circle)
      {
        featureLine.setStyle((feature, resolution) => {
          const scale = (Background.scaleFromResolution(resolution)*icon.scale*0.5).coerce(icon.scale,icon.scale*2);
          style.getImage().setScale(scale);
          return style;
        });
      }
      else
      {
        featureLine.setStyle(style);
      }
      vectorLine.addFeature( featureLine );
    };

    const shouldGenerateStartCircle = (task) => {
      if( draw_start_position && job.start_from.id === task.id && this.show_decorations && robot_controller.chosen_robot.online )
      {
        if(job.parent instanceof MultiJob)
        {
          if(job === job.parent.jobs[0])
          {
            return true;
          }
        }
        else
        {
          return true;
        }
      }
      return false;
    };
    
    if(DEBUG_MODE)
    {
      const duplicate_ids = tasks.map(task=>task.id).filter((e, i, a) => a.indexOf(e) !== i);
      if(duplicate_ids.length > 0)
      {
        console.error("Job contains duplicate task ids", duplicate_ids, job)
      }
    }
        const slIdx = job.start_locations.map(sl=>sl.task_id);
    if(tasks.filter(t=>slIdx.indexOf(t.id)!=-1).length === 0)
    {
      logger.debug("Job StartLocation doesn't exist!", job);
    }
    
    let startLocationDrawn = false;
    let startLocationShouldHaveBeenDrawn = false;
    const draw_task = ( last_task, task, index, draw_ignored_lines ) =>
    {
      startLocationShouldHaveBeenDrawn |= shouldGenerateStartCircle(task);
      if( !task.force_draw_color )
      {
        if( !task.via && !task.paint && !(SETTINGS.show_path_between_task && general_settings_screen.settings.show_path_between_tasks.val) )
        {
          return last_task;
        }
        if( !draw_ignored_lines && job.options[ "taskModificationIds" ].ignoreids.indexOf( task.id ) >= 0 )
        {
          return last_task;
        }
      }
      
      if(this.show_path_between && !draw_ignored_lines)
      {
        if( last_task && last_task.end && color === Background.featureColor.ACTIVE && (SETTINGS.show_path_between_task && general_settings_screen.settings.show_path_between_tasks.val))
        {
          generateBetweenLine(last_task.end, task.start);
        }
        if( this.jobs.active instanceof MultiJob && SETTINGS.show_path_between_jobs && color === Background.featureColor.ACTIVE )
        {
          const this_job_index = this.jobs.active.jobs.findIndex(j=>j.id===job.id);
          if(this_job_index > 0 && this.jobs.length > 0)
          {
            const end = job.start_from.point;
            const startJob = this.jobs.active.jobs[this_job_index-1];
            const startPos = startJob.end_location.position.toArray();
            const startPosProjected = Projector(startJob.projection, job.projection, startPos);
            generateBetweenLine(startPosProjected.toVector(), end);
          }
        }
      }

      
      if(draw_ignored_lines && job.options.taskModificationIds.val[task.id] === Task.modificationType.IGNORE)
      {
        // continue
      }
      else if(!draw_ignored_lines && job.options.taskModificationIds.val[task.id] === Task.modificationType.IGNORE)
      {
        return last_task;
      }
      else if(draw_ignored_lines && job.options.taskModificationIds.val[task.id] !== Task.modificationType.IGNORE)
      {
        return last_task;
      }
      else if(!draw_ignored_lines && job.options.taskModificationIds.val[task.id] !== Task.modificationType.IGNORE)
      {
        // continue
      }

      // Get the line style
      let use_style, use_style_dot;
      let use_style_dash = [];

      switch(job.options.taskModificationIds.val[task.id])
      {
        case Task.modificationType.IGNORE:
          if(task.paint)
          {
            use_style = styles.ignore.line.clone();
            use_style_dot = styles.ignore.dot.clone();
          }
          else if(task.via)
          {
            if(color === Background.featureColor.ACTIVE)
            {
              use_style = styles.ignore.line.clone();
              use_style_dot = styles.ignore.dot.clone();
            }
            else
            {
              return last_task;
            }
          }
          else
          {
            return last_task;
          }
          break;
        case Task.modificationType.VIA:
          use_style = styles.via.line.clone();
          use_style_dot = styles.via.dot.clone();
          break;
        case Task.modificationType.INTERFERENCE_FILTER:
          use_style = styles.interference_filter.line.clone();
          use_style_dot = styles.interference_filter.dot.clone();
          break;
        case Task.modificationType.ANTINAPPING:
          use_style = styles.antinapping.line.clone();
          use_style_dot = styles.antinapping.dot.clone();
          break;
        default:
          if(task.paint)
          {
            use_style = styles.paint.line.clone();
            use_style_dot = styles.paint.dot.clone();
          }
          else if(task.via)
          {
            if( color === Background.featureColor.ACTIVE )
            {
              use_style = styles.via.line.clone();
              use_style_dot = styles.via.dot.clone();
              // use_style_dash = styles.via.dash.copy();
            }
            else
            {
              return last_task;
            }
          }  
          else
          {
            if( color === Background.featureColor.ACTIVE && (SETTINGS.show_path_between_task && general_settings_screen.settings.show_path_between_tasks.val) )
            {
              use_style = styles.between.line.clone();
              use_style_dot = styles.between.dot.clone();
              use_style_dash = styles.between.dash.copy();
            }
          }

          if( task.force_draw_color )
          {
            use_style.getStroke().setColor( task.force_draw_color );
            use_style_dot.getStroke().setColor( task.force_draw_color );
            use_style_dot.getImage().setColor( task.force_draw_color );
          }
      }

      const vectorLineFeature = ( points, first_arrow = false) => {
        return new ol.Feature( {
          geometry: new ol.geom.MultiLineString( points ),
          id: task.id,
          job_id: job.id,
          job: job,
          style: use_style,
          is_dot: false,
          first_arrow: first_arrow
        } );
      };

      const vectorPointFeature = ( point ) =>
      {
        const feature = new ol.Feature( {
          geometry: new ol.geom.Point( point ),
          id: task.id,
          job_id: job.id,
          job: job,
          style: use_style_dot,
          is_dot: true
        } );
        // Scale dots with zoom
        feature.setStyle((feature, resolution) => {
          const originalScale = Background.dotIcon().scale*general_settings_screen.settings.map_dot_size.val/2;
          const scale = (Background.scaleFromResolution(resolution)*originalScale).coerce(originalScale,originalScale*10);
          try {
            use_style_dot.getImage().setScale(scale);
            return use_style_dot;
          } 
          catch (error) {
            console.log("Error while getting image for feature: ", error);
          }
        });
        return feature;
      };

      let draw_first_arrow;
      if( last_task && last_task.end && task.start.veryclose( last_task.end ) )
        draw_first_arrow = false;
      else
        draw_first_arrow = true;

      const generateLine = () => {
        if( last_task )
        {
          if( (last_task.type === "line" || last_task.type === "spline" || last_task.type === "bezier") && (last_task.lastToLine().angle_between( task.toLine() ) > split_controller.robot_merge_angle) )
            draw_first_arrow = true;
          else if( last_task.type === "arc3" && (Math.abs( last_task.radius.angle_between( task.toLine().toVector() ) - Math.PI / 2 ) > split_controller.robot_merge_angle) )
            draw_first_arrow = true;
        }
  
        let coords = [];
        if( general_settings_screen.settings.show_dashing.val || use_style_dash.length > 0 )
        {
          const dashed = general_settings_screen.settings.show_dashing.val ? calculateDashingParamsFromIndex(task.id) : calculateDashingParamsFromStyleDash(use_style_dash);
          if( dashed.space >= 0.001 && task.ends.length > 1 )
          {
            var line = new Line( task.start, task.end );
            var splittet = line.split( dashed.length, dashed.space, dashed.offset, [ dashed.reference, dashed.align ] );
            if( dashed.first_length > 0.001 )
            {
              var first_part = line.split( dashed.first_length, 1 )[0];
              splittet.push( first_part );
            }
    
            if( dashed.last_length > 0.001 )
            {
              var offset = line.length - dashed.last_length;
              var last_part = line.split( dashed.last_length, offset, offset - 0.0001 )[0];
              splittet.push( last_part );
            }
    
            coords = splittet.map( ( piece ) => projectPoints([piece.start, piece.end]));
          }
        }
        if( coords.length === 0 )
        {
          coords = [projectPoints(task.ends)];
        }
        if( coords.length > 0 )
        {
          vectorLine.addFeature( vectorLineFeature( coords, draw_first_arrow ) );
        }
      };

      const generateCircle = () => {
        if( last_task )
        {
          if( last_task.type === "arc3" && (last_task.radius.angle_between( task.radius ) > split_controller.robot_merge_angle) )
          {
            draw_first_arrow = true;
          }
          else if( (last_task.type === "line" || last_task.type === "spline") && (Math.abs( last_task.lastToLine().toVector().angle_between( task.radius ) - Math.PI / 2 ) > split_controller.robot_merge_angle) )
          {
            draw_first_arrow = true;
          }
        }
  
        var arcs_tasks = [ task ];
        if( general_settings_screen.settings.show_dashing.val || use_style_dash.length > 0 )
        {
          
          const dashed = general_settings_screen.settings.show_dashing.val ? calculateDashingParamsFromIndex(task.id) : calculateDashingParamsFromStyleDash(use_style_dash);
          if( dashed.space > 0.001 )
          {
            arcs_tasks = task.splitLineSpace( dashed.length, dashed.space, dashed.offset, [ dashed.reference, dashed.align ] );
            if( dashed.first_length > 0.001 )
            {
              var first_part = task.splitLineSpace( dashed.first_length, 1 )[0];
              arcs_tasks.push( first_part );
            }
    
            if( dashed.last_length > 0.001 )
            {
              var offset = task.length - dashed.last_length;
              var last_part = task.splitLineSpace( dashed.last_length, offset, offset - 0.0001 )[0];
              arcs_tasks.push( last_part );
            }
          }
        }
  
        if( task.radius.length < split_controller.max_arc_radius )
          draw_first_arrow = true;
  
        const coords = arcs_tasks.map( function( task, index )
        {
          var sample_size = task.length / 64;
          if( sample_size > 1 )
            sample_size = 1;
          if( sample_size < 0.02 )
            sample_size = 0.02;
          var circle_line = task.sample( sample_size, false, projectPoint );
          if( !circle_line.ends.length )
            return;

          return circle_line.ends.map( end => {
            return end.toArray();
          } );
  
        } );
        if( coords.length > 0 )
        {
          vectorLine.addFeature( vectorLineFeature( coords, draw_first_arrow && index === 0 ) );
        }
      };

      const generateSpline = (sample_length) => {
        if( last_task && task.lastToLine)
        {
          if( (last_task.type === "line" || last_task.type === "spline" || last_task.type === "bezier") && (last_task.lastToLine().angle_between( task.toLine() ) > split_controller.robot_merge_angle) )
            draw_first_arrow = true;
          else if( last_task.type === "arc3" && (Math.abs( last_task.radius.angle_between( task.lastToLine().toVector() ) - Math.PI / 2 ) > split_controller.robot_merge_angle) )
            draw_first_arrow = true;
        }

        const dashed = general_settings_screen.settings.show_dashing.val ? calculateDashingParamsFromIndex(task.id) : (use_style_dash.length > 0 ? calculateDashingParamsFromStyleDash(use_style_dash) : {});
        if( dashed.space > 0.001 && (general_settings_screen.settings.show_dashing.val || use_style_dash.length > 0) )
        {
          const coords = task.splitLineSpace( sample_length, dashed.length, dashed.space, dashed.offset, [ dashed.reference, dashed.align ] );
          vectorLine.addFeature( vectorLineFeature( coords.map(coordset=>projectPoints(coordset)), draw_first_arrow ) );
        }
        else if( task.type === "spline" )
        {
          const line = task.sample( sample_length, false, projectPoint );
          vectorLine.addFeature( vectorLineFeature( [line.ends.map( end => end.toArray() )], draw_first_arrow ) );
        }
        else
        {
          const line = task.sample( sample_length, false );
          vectorLine.addFeature( vectorLineFeature( [projectPoints( line.ends )], draw_first_arrow ) );
        }
      };

      const generateCurve = (sample_length) => {
        const line = task.sample( sample_length );
        if( !line.ends.length )
          return;
  
        vectorLine.addFeature( vectorLineFeature( [projectPoints( line.ends )], draw_first_arrow ) );
      }

      const generatePoint = () => {
        task.ends.forEach( point => {
          vectorLine.addFeature( vectorPointFeature( projectPoint(point.toArray()) ) );
        });
      };

      switch( task.type )
      {
        case "line":
          generateLine();
          break;
        case "arc3":
          generateCircle();
          break;
        case "spline":
        case "bezier":
        case "ellipse":
          generateSpline(0.1);
          break;
        case "waterfall":
          generateCurve(0.1);
          break;
        case "clothoid":
          generateCurve(0.01);
          break;
        case "spray":
        case "way":
          generatePoint();
          break;
        default:
          logger.debug("map_controller encountered unknown task type");
      }

      if (this.show_labels) {
        if( job.parent instanceof MultiJob && task.id === job.start_from.id )
        {
          const job_id = job.parent.jobs.indexOf(job);
          const label = job_id + 1;
          generateTaskLabel(task, use_style, label.toString());
        }
        else if( draw_label && SETTINGS.show_task_labels && general_settings_screen.settings.label_state.val && task.label !== "" )
        {
          generateTaskLabel(task, use_style, task.label);
        }
        else if(bottom_bar_chooser.active_bar === "#measure-screen" && (task.id === "measurement" || task.id === "measurement_p_c" || task.id === "measurement_c_c" || task.id === "Element_label1" || task.id === "Element_label2")){
          if(task.id === "Element_label1"){
            generateTaskLabel(task, use_style, translate["Element %1s"].format("A"), null, measure_screen.COLORS_FOR_MEASUREMENTS.POINT_LABEL);
          } 
          if(task.id === "Element_label2"){
            generateTaskLabel(task, use_style, translate["Element %1s"].format("B"), null, measure_screen.COLORS_FOR_MEASUREMENTS.POINT_LABEL);
          }
          if(measure_screen.point_center_drawn && task.id === "measurement_p_c"){
            generateTaskLabel(task, use_style, measure_screen.point_center_result + " " + translate_unit(), true, null, measure_screen.label_offsets[2]);
          }
          if(measure_screen.center_center_drawn && task.id === "measurement_c_c"){
            generateTaskLabel(task, use_style, measure_screen.center_center_result + " " + translate_unit(), true, null, measure_screen.label_offsets[3]);
          }
          if(task.id === "measurement"){
            if(!measure_screen.first_drawn){
              generateTaskLabel(task, use_style, measure_screen.shortest_result + " " + translate_unit(), true, null, measure_screen.label_offsets[0]);
            }
            else{
              generateTaskLabel(task, use_style, measure_screen.straight_result + " " + translate_unit(), true, null, measure_screen.label_offsets[1]);
            }
          }
        }
      }

      if((shouldGenerateStartCircle(task) || startLocationShouldHaveBeenDrawn) && !startLocationDrawn)
      {
        generateStartCircle(use_style);
        startLocationDrawn = true;
      }

      return task;
    };

    let last_task;
    if(show_ignored_lines) {
      last_task = undefined;
      tasks.forEach((task,idx)=>last_task = draw_task(last_task, task, idx, true)); // Draw everything ignored
    }
    last_task = undefined;
    tasks.forEach((task,idx)=>last_task = draw_task(last_task, task, idx, false)); // Draw everything else

    return vectorLine;

  }

  static scaleFromResolution(resolution)
  {
    return 1/Math.pow(resolution, 1/1.47473195); // Found be fit resolution change
  }

  select_nearest_job_to_robot( force_job )
  {
    if( !robot_controller.chosen_robot.online )
    {
      popup_screen_controller.open( "start_paint_pitch_error_popup" );
      return;
    }
    if( robot_controller.chosen_robot.precision > top_bar_screen_controller.pricision_bad2_tresh )
    {
      popup_screen_controller.open( "#robot_position_error" );
      return;
    }

    const nearest = near_controller.get_nearest_job_to_robot( force_job ? [ force_job ] : this.jobs );

    if( !force_job ) {
      this.jobs.set_active_from_db_job_id( parseInt( nearest.job.id ) );
    }


    if (!nearest.job.forceUsingStartLocations) {
      nearest.job.start_from.id = nearest.task.id;
      nearest.job.start_from.percent = nearest.percent;
    }
   
    nearest.job.removePitchLayer();

    logger.debug( "Near", nearest );

    this.zoom_to_point( this.projection_to_map( nearest.projection, nearest.point.toArray() ), false );

    this.eventController.call_callback( "active_job_changed" );
  }

  move_to_here( use_customer )
  {

    var lnglat_map_center = this.get_map_center_lnglat();
    var proj_string = projection_controller.lnglat2UTMProjString( lnglat_map_center );
    var proj_alias = projection_controller.lnglat2UTMAlias( lnglat_map_center );
    var new_center = ProjectorForward( proj_string, lnglat_map_center );
    var new_center_v = new Vector( new_center[ 0 ], new_center[ 1 ] );

    if( this.jobs.active instanceof MultiJob )
      var ref = this.jobs.active.jobs[ 0 ].points[ 0 ];
    else
      var ref = this.jobs.active.points[ 0 ];
    var movexy = ref.subtract( new_center_v );

    if( this.jobs.active instanceof MultiJob )
    {
      this.jobs.active.jobs.forEach( ( job ) =>
      {
        job.points = job.points.map( function( p )
        {
          return p.subtract( movexy );
        } );
        job.proj_alias = proj_alias;
        job.projection = proj_string;
        var db_job = this.jobs.get_job( job.id );
        db_job.proj_alias = proj_alias;
        db_job.projection = proj_string;
      } );
    }
    else
    {
      this.jobs.active.points = this.jobs.active.points.map( function( p )
      {
        return p.subtract( movexy );
      } );
      this.jobs.active.proj_alias = proj_alias;
      this.jobs.active.projection = proj_string;
      var db_job = this.jobs.get_job( this.jobs.active.id );
      db_job.proj_alias = proj_alias;
      db_job.projection = proj_string;

    }
    edit_pitch_screen_controller.start_save( use_customer );
  }
  change_background_map( map_key )
  {
    this.background_map_key = map_key;
    this.refresh_background();
  }
  set_enable_show_start_location( v )
  {
    this.enable_show_start_location = v;
  }
  remove_overlays( caller )
  {
    $( ".menu_overlay" ).each( function()
    {
      if( !$( this ).hasClass( "gone" ) && !$( this ).hasClass( "persistent" ) && !$( this ).is( caller ) )
      {
        if( $( this ).hasClass( "fadeInRight" ) )
        {
          $( this ).removeClass( "fadeInRight" );
          $( this ).addClass( "fadeOutRight" );
          $( this ).addClass( "gone" );
        }
        else if( $( this ).hasClass( "fadeInLeft" ) )
        {
          $( this ).removeClass( "fadeInLeft" );
          $( this ).addClass( "fadeOutLeft" );
          $( this ).addClass( "gone" );
        }
        else if( $( this ).hasClass( "fadeInUp" ) )
        {
          $( this ).removeClass( "fadeInUp" );
          $( this ).addClass( "fadeOutDown" );
          $( this ).addClass( "gone" );
        }
        else if( $( this ).hasClass( "fadeInDown" ) )
        {
          $( this ).removeClass( "fadeInDown" );
          $( this ).addClass( "fadeOutUp" );
          $( this ).addClass( "gone" );
        }
      }
    } );
  }

  deselect_all()
  {
    const is_multijob = this.jobs.active instanceof MultiJob;
    this.jobs.reset();
    if( is_multijob )
    {
      this.jobs.active = new MultiJob();
    }
  }

  select_all(include_locked_jobs)
  {
    const all_jobs = this.jobs.get_all_jobs();
    const jobs = include_locked_jobs ? all_jobs.list : all_jobs.list.filter(j=>!j.locked);
    this.jobs.active = jobs.toMultiJob();
  }

  select_all_on_screen(include_locked_jobs)
  {
    const all_jobs = this.jobs.get_all_jobs();
    const jobs = include_locked_jobs ? all_jobs.list : all_jobs.list.filter(j=>!j.locked);
    const visible_ids = this.getViewportJobs(false, jobs).map(j=>j.id);
    this.jobs.active = jobs.filter(j=>visible_ids.indexOf(j.id)>-1).toMultiJob();
  }

  select_all_by_layer(layer_name, include_locked_jobs)
  {
    const all_jobs = this.jobs.get_all_jobs();
    const jobs = include_locked_jobs ? all_jobs.list : all_jobs.list.filter(j=>!j.locked);
    this.jobs.active = jobs.filter( job => job.tasks[0].layer === layer_name ).toMultiJob();
  }

  restore_selected_pitches()
  {
    let job_ids = [];
    if(this.jobs.active instanceof MultiJob)
    {
      job_ids = this.jobs.active.ids;
    }
    else if( this.jobs.active.id > 0)
    {
      job_ids = [this.jobs.active.id];
    }

    if(job_ids.length > 0)
    {
      communication_controller.send( ('restore_jobs'), {
        ids: job_ids,
      }, "cloud", 10 );

      // Remove given jobs
      job_ids.forEach(jobId=>this.jobs.remove_job(jobId));
      
      if(this.jobs.active instanceof MultiJob) {        
        this.jobs.reset();
        this.jobs.active = new MultiJob();
      } else {
        this.jobs.reset();
      }
    }
  }

  generateCustomerSelectorList(callback) {
    const generateCustomerSelectorListCallback = (data) => {
      popup_screen_controller.customer_selection_popup(data, callback.bind(this));
      message_controller.events.remove_callback( "user_customers", "generateCustomerSelectorListCallback" );
    };
    message_controller.events.add_callback( "user_customers", generateCustomerSelectorListCallback );

    popup_screen_controller.open_info_waiter( translate["Getting list of customers"], "", "", true );
    communication_controller.send( "get_customers", {}, "cloud", 10 );
  }

  moveSelectedJobsToCustomer(oldId) {
    this.generateCustomerSelectorList((customerId)=>this.give_selected_pitches_to_customer(customerId, oldId, false));
  }

  copySelectedJobsToCustomer(oldId) {
    this.generateCustomerSelectorList((customerId)=>this.give_selected_pitches_to_customer(customerId, oldId, true));
  }

  give_selected_pitches_to_customer( customer_id, old_id, copy = false )
  {
    if( !customer_id ){
      throw "Need customer id";
    }

    let job_ids = [];
    if(this.jobs.active instanceof MultiJob)
    {
      job_ids = this.jobs.active.ids;
    }
    else if( this.jobs.active.id > 0)
    {
      job_ids = [this.jobs.active.id];
    }

    if(job_ids.length > 0)
    {
      communication_controller.send( (copy ? 'copy_db_jobs' : 'move_db_jobs'), { // TODO: Implement copy_db_jobs on server
        ids: job_ids,
        new_customer: customer_id,
        old_customer: old_id
      }, "cloud", 10 );

      // Remove given jobs
      if(!copy) {
        job_ids.forEach(jobId=>this.jobs.remove_job(jobId));
      }
      
      if(this.jobs.active instanceof MultiJob) {        
        this.jobs.reset();
        this.jobs.active = new MultiJob();
      } else {
        this.jobs.reset();
      }

      popup_screen_controller.close( "#choose_customer_popup" );
    }

  }

};

const map_controller = {
  background: new Background({
    whereToPut:"#map"
  })
};
