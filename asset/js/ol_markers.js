/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global ol */

var ol_markers = {};


ol_markers.create_marker = function( name, center, icon, args, info_msg = "", dragable = false )
{

  var marker = {
    layer: '',
    source: '',
    feature: ''
  };
  var feature_options = {
    geometry: new ol.geom.Point( center ),
    name: name,
    dragable: dragable
  };
  if( info_msg )
    feature_options.info_message = info_msg;

  marker.feature = new ol.Feature( feature_options );
  marker.source = new ol.source.Vector( {
    wrapDateLine: false,
    wrapX: false,
    noWrap: true} );
  marker.layer = new ol.layer.Vector( {
    visible: true,
    source: marker.source,
    style: typeof (ol_markers.icons[icon]) === "object" ? ol_markers.icons[icon].clone() : ol_markers.icons[icon]( args )
      // If you set style as a function "style: function(feature, resolution) {" you can adjust size on every resolution
  } );
  marker.source.addFeature( marker.feature );
  return marker;
};

ol_markers.icons = {};

ol_markers.icons["yellow_arrow"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 15, 30 ],
      anchorXUnits: 'pixel',
      anchorYUnits: 'pixel',
      opacity: 0.75,
      src: 'img/icons/yellow_arrow.png',
      rotation: angle
    }) )
  } );
};


//var HANDLE_SCALE = 0.15;
var HANDLE_SCALE = 0.2;
ol_markers.icons["Handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/Handle.png',
      rotation: angle,
      scale: HANDLE_SCALE * 1.5
    }) )
  } );
};
ol_markers.icons["Yellow_Handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/Handle-Yellow.png',
      rotation: angle,
      scale: HANDLE_SCALE * 1.5
    }) )
  } );
};

ol_markers.icons["move_handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/move-arrows.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};
ol_markers.icons["yellow_move_handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/yellow-move-arrows.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};

ol_markers.icons["move_handle_onedirection"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/move-arrows_onedirection.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};

ol_markers.icons["yellow_move_handle_onedirection"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 0.5, 0.5 ],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: 'img/icons/yellow-move-arrows_onedirection.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};

ol_markers.icons["turn_handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      opacity: 1.0,
      src: 'img/icons/rotate_white.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};
ol_markers.icons["yellow_turn_handle"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      opacity: 1.0,
      src: 'img/icons/rotate_yellow.png',
      rotation: angle,
      scale: HANDLE_SCALE
    }) )
  } );
};

ol_markers.icons["TinyRobot"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 16, 23 ],
      anchorXUnits: 'pixel',
      anchorYUnits: 'pixel',
      opacity: 0.75,
      src: 'img/icons/TinyRobot.png',
      rotation: angle
    }) )
  } );
};

ol_markers.icons["robot_white"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [ 73.5, 92.5 ],
      anchorXUnits: 'pixel',
      anchorYUnits: 'pixel',
      src: 'img/icons/Robot-whiteBG@2x.png',
      rotation: angle,
      scale: 0.25
    }) )
  } );
};
ol_markers.icons["robot_yellow"] = function( angle )
{
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [0.465, 0.65],
      // anchor: [0.47, 0.47],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'img/icons/Robot-yellowBG@2x.png',
      rotation: angle,
      scale: 0.25
    }) )
  } );
};

ol_markers.icons["gps_dot"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [ 0.5, 0.5 ],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.9,
    scale: 0.16,
    src: 'img/icons/User-location@2x.png'
  }) )
} );

ol_markers.icons["red_dot"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [ 0.5, 0.5 ],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.9,
    scale: 0.16,
    src: 'img/icons/red-location@2x.png'
  }) )
} );


ol_markers.icons["corner_mark"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    scale: 0.75,
    src: 'img/icons/corner_mark.png'
  }) )
} );

ol_markers.icons["red_corner_flag"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [ 10, 30 ],
    anchorXUnits: 'pixel',
    anchorYUnits: 'pixel',
    opacity: 1.0,
    scale: 2.0,
    src: 'img/icons/red_corner_flag.png'
  }) )
} );

ol_markers.icons["yellow_corner_flag"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [ 10, 30 ],
    anchorXUnits: 'pixel',
    anchorYUnits: 'pixel',
    opacity: 1.0,
    scale: 2.0,
    src: 'img/icons/yellow_corner_flag.png'
  }) )
} );

ol_markers.icons["red_circle"] = new ol.style.Style( {
  image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    anchor: [ 0.5, 0.5 ],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.9,
    scale: ol_svg_icons.circle().scale,
    src: ol_svg_icons.circle('#B12C23').src
  }) ),
  zIndex: 900
} );

ol_markers.icons["numbered_marker"] = (number, color, addRing)=>{
  const marker = ol_svg_icons.numbered_marker(number, color, addRing);
  return new ol.style.Style( {
    image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
      anchor: [0.19, 0.195],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 1.0,
      src: marker.src,
      scale: marker.scale,
    }))
  });
}
