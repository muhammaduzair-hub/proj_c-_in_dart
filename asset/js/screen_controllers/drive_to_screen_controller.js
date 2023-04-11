/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global robot_controller, map_controller, ol_markers, bottom_bar_chooser, ol, projection, popup_screen_controller, top_bar_screen_controller, run_pitch_controller, translate, SETTINGS, general_settings_screen, event_controller, parseFloat */

var drive_to_screen_controller = {
  point_coordinates: [ ],
  map_points: [ ],
  route_layer: null,
  running: false,
  open: function()
  {
    if( robot_controller.chosen_robot.precision < top_bar_screen_controller.pricision_bad2_tresh )
    {
      $( "#drive-to-screen #info2" ).html( "" );
      bottom_bar_chooser.choose_bottom_bar( '#drive-to-screen' );
    }
    else
    {
      popup_screen_controller.open( "#robot_position_error" );
    }

  },
  close: function()
  {
    drive_to_screen_controller.point_coordinates = [ ];
    drive_to_screen_controller.stop_all();
    bottom_bar_chooser.choose_bottom_bar( '#robot-selected' );
  },
  start: function()
  {
    if( drive_to_screen_controller.point_coordinates.length > 0 )
    {
      drive_to_screen_controller.do_next();
    }
    else
    {
      popup_screen_controller.open( "#drive_to_error_popup" );
    }
  },
  add_point: function( point_coordinate )
  {
    var new_task = new WaypointTask( drive_to_screen_controller.point_coordinates.length, new Vector( point_coordinate[0], point_coordinate[1] ) );
    // add action option to drive fast to point if distance is bigger than x meter ?

    robot_controller.task_info["Original task idx"] = 0;
    robot_controller.task_info["Original task pct"] = 0;
    drive_to_screen_controller.point_coordinates = [ ];
    drive_to_screen_controller.point_coordinates.push( new_task );
    drive_to_screen_controller.draw_points();
  },
  do_next: function()
  {
    /*var jobs = [];
     drive_to_screen_controller.point_coordinates.forEach( function ( wp, i ) {
     jobs.push( wp )
     } );*/

    popup_screen_controller.confirm_popup( translate["Sending waypoint to robot"], "", "", translate["Cancel"], undefined, run_pitch_controller.cancel_start );
    robot_controller.user_info_event.add_callback( "Job loaded", drive_to_screen_controller.after_waypoint_loaded );

    drive_to_screen_controller.running = true;
    robot_controller.send_job( "goto_0_0.0_test", drive_to_screen_controller.point_coordinates );
    drive_to_screen_controller.draw_points();

    if( run_pitch_controller.fluent_updater )
      clearInterval( run_pitch_controller.fluent_updater );
    if( SETTINGS.predict_robot_position )
      run_pitch_controller.fluent_updater = setInterval( run_pitch_controller.predict_next, 25 );

  },
  after_waypoint_loaded: function()
  {
    drive_to_screen_controller.running = true;

    if( general_settings_screen.settings.follow_robot.val )
      map_controller.background.zoom_to_robot();

    robot_controller.auto_mode( );
    popup_screen_controller.close();
    robot_controller.user_info_event.remove_callback( "Job loaded", drive_to_screen_controller.after_waypoint_loaded );

    $( "#drive-to-automode-screen #info1" ).html( translate["The robot %1s is driving to the selected point"].format( robot_controller.chosen_robot.name ) );
    bottom_bar_chooser.choose_bottom_bar( '#drive-to-automode-screen' );
  },
  stop_all: function()
  {
    drive_to_screen_controller.draw_points();
    drive_to_screen_controller.running = false;
    clearInterval( run_pitch_controller.fluent_updater );
  },
  stop_screen: function()
  {
    if( drive_to_screen_controller.running === true )
    {
      robot_controller.manual_mode();
      drive_to_screen_controller.stop_all();
      bottom_bar_chooser.choose_bottom_bar( '#drive-to-screen' );
    }
  },
  remove_layer: function()
  {
    if( drive_to_screen_controller.route_layer )
    {
      map_controller.background.map.removeLayer( drive_to_screen_controller.route_layer );
      delete drive_to_screen_controller.route_layer;
    }
  },
  draw_points: function()
  {

    drive_to_screen_controller.remove_layer();

    if( drive_to_screen_controller.end_point_marker )
    {
      map_controller.background.map.removeLayer( drive_to_screen_controller.end_point_marker.layer );
      delete drive_to_screen_controller.end_point_marker;
    }

    if( !drive_to_screen_controller.point_coordinates.length ){
      $( "#drive-to-screen #info2" ).html( "" );
        return;
    }
    
    var vectorLine = new ol.source.Vector( {} );
    var style = new ol.style.Style( {
      stroke: new ol.style.Stroke( {
        color: [ 255, 65, 51, 0.6 ],
        width: 6
      } )
    } );
    var coords = drive_to_screen_controller.point_coordinates.map( function( p )
    {
      return map_controller.background.robot_to_map( p.ends[0].toArray() );
    } );

    coords = coords.splice( parseInt( robot_controller.task_info["Original task idx"] ) );
    var robot_pos = robot_controller.chosen_robot_position.toArray();
    var robot_pos_in_map = map_controller.background.robot_to_map( robot_pos );
    coords.unshift( robot_pos_in_map );

    var featureLine = new ol.Feature( {
      geometry: new ol.geom.LineString( coords ),
      id: 0,
      style: style
    } );
    vectorLine.addFeature( featureLine );
    var route_layer = new ol.layer.Vector( {
      source: vectorLine,
      style: function( feature, resolution )
      {
        return feature.get( 'style' );
      }
    } );
    map_controller.background.map.addLayer( route_layer );
    drive_to_screen_controller.route_layer = route_layer;
    drive_to_screen_controller.route_layer.setZIndex( 1000000 );

    if( coords.length > 1 )
    {
      let distance_to_point = new Vector(coords[0][0], coords[0][1]).dist_to_point(new Vector(coords[1][0], coords[1][1]));
      drive_to_screen_controller.end_point_marker = ol_markers.create_marker( "drive_to_end", coords[coords.length - 1], "red_dot", 0 );
      map_controller.background.map.addLayer( drive_to_screen_controller.end_point_marker.layer );
      drive_to_screen_controller.end_point_marker.layer.setZIndex( 1000000 );
      $( "#drive-to-screen #info2" ).html(translate["The chosen point is " + distance_to_point.meter2unit().toFixed(2)  + " " + translate_unit()  + " away"]);
    }

  }
};

event_controller.add_callback( "task_info_updated", drive_to_screen_controller.draw_points );

// event_controller.add_callback( "emergency_stop", drive_to_screen_controller.stop_screen );
event_controller.add_callback( "robot_manual_mode", () => {
  if( bottom_bar_chooser.active_bar === "#drive-to-automode-screen" )
    drive_to_screen_controller.stop_screen();
} );
event_controller.add_callback("got_user_info", function(msg, duration) {
  if(drive_to_screen_controller.running 
  && msg === "Job done") {
    drive_to_screen_controller.running = false;
    bottom_bar_chooser.choose_bottom_bar( '#robot-selected' );
    drive_to_screen_controller.point_coordinates = [ ];
    drive_to_screen_controller.draw_points();
    robot_controller.manual_mode();
    clearInterval( run_pitch_controller.fluent_updater );
  }
});
event_controller.add_callback("active_changed", () => {
  if(drive_to_screen_controller.route_layer)
  {
    drive_to_screen_controller.remove_layer();
  }
});
event_controller.add_callback("robot_now_offline", () => {
  if(drive_to_screen_controller.route_layer)
  {
    drive_to_screen_controller.remove_layer();
  }
});
event_controller.add_callback('got_robot_position', () => {
  if(drive_to_screen_controller.route_layer || bottom_bar_chooser.active_bar === '#drive-to-screen')
  {
    drive_to_screen_controller.draw_points();
  }
});