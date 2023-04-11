/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol, projection */

var drag_feature = function()
{

  ol.interaction.Pointer.call( this, {
    handleDownEvent: drag_feature.prototype.handleDownEvent,
    handleDragEvent: drag_feature.prototype.handleDragEvent,
    handleMoveEvent: drag_feature.prototype.handleMoveEvent,
    handleUpEvent: drag_feature.prototype.handleUpEvent
  } );

  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'pointer';

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined;

};
ol.inherits( drag_feature, ol.interaction.Pointer );


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
drag_feature.prototype.handleDownEvent = function( evt )
{
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel( evt.pixel,
    function( feature, layer )
    {
      return feature;
    } );

  if( feature && feature.get( "dragable" ) )
  {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }
  else
  {
    feature = null;
  }

  return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
drag_feature.prototype.handleDragEvent = function( evt )
{
  var map = evt.map;

  var feature = this.feature_;
  /*var feature = map.forEachFeatureAtPixel( evt.pixel,
   function ( feature, layer ) {
   return feature;
   } );*/

  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = /** @type {ol.geom.SimpleGeometry} */
    (this.feature_.getGeometry());
  geometry.translate( deltaX, deltaY );

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];

  if( feature && feature.get( "dragable" ) )
  {
    var coordinates = feature.getGeometry().getCoordinates();
    if( coordinates.length !== 2 )
      coordinates = coordinates[0][0];

    var new_lnglat = map_controller.background.ol_proj_toLonLat( coordinates, map.getView( ).getProjection( ) );
    feature.get( "dragable" )( new_lnglat );
  }
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
drag_feature.prototype.handleMoveEvent = function( evt )
{
  if( this.cursor_ )
  {
    var map = evt.map;
    var feature = this.feature_;
    /*var feature = map.forEachFeatureAtPixel( evt.pixel,
     function ( feature, layer ) {
     return feature;
     } );*/
    var element = evt.map.getTargetElement();
    if( feature )
    {
      if( element.style.cursor != this.cursor_ )
      {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    }
    else if( this.previousCursor_ !== undefined )
    {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
drag_feature.prototype.handleUpEvent = function( evt )
{
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
};