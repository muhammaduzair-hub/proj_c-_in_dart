/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global event_controller, pitch_generator, popup_screen_controller, Projector, pt, map_controller, projection_controller, math */

//return ( event.charCode >= 48 && event.charCode <= 57 ) && ( this.value.length < 5 )

class Inverter
{
  constructor( def )
  {
    this._val = def;
  }
  get next()
  {
    this._val = !this._val;
    return this._val;
  }
  get val()
  {
    return this._val;
  }
}

function number( event, self, numbers, allow_decimals )
{
  /*
   console.log( "-----" );
   console.log( event.charCode );
   console.log( self.value );
   console.log( self.value.replace( /\./g, "" ) );
   console.log( self.value.length, self.value.replace( /\./g, "" ).length );
   */

  var correct_char = (event.charCode >= 48 && event.charCode <= 57);
  var too_many_dots = (self.value.length - self.value.replace( /\./g, "" ).length) > 0;
  if( allow_decimals && !too_many_dots )
    correct_char |= event.charCode === 46;

  var too_long = (self.value.replace( /\./g, "" ).length === numbers);


  return  correct_char && !too_long;

  //return correct_char && ( self.value.length < 5 );
}
function relative_ends( ends )
{
  var first = ends[0];
  return ends.map( function( end )
  {
    return end.subtract( first );
  } );
}
function zero_pad( num, size )
{
  var s = num + "";
  while( s.length < size )
    s = "0" + s;
  return s;
}

function modify_multiple_jobs( jobs = [], mod_function, id = 0 )
{
  if(jobs.length === 0)
  {
    event_controller.call_callback( "save_db_job_done" );
    return;
  }

  popup_screen_controller.open_info_waiter( translate["Moving and saving"] );

  var job = jobs[id];

  mod_function( job );

  function do_next()
  {
    event_controller.remove_callback( "save_db_job_done", do_next );
    id += 1;
    if( id === jobs.length )
      popup_screen_controller.close();
    else
      modify_multiple_jobs( jobs, mod_function, id );
  }
  event_controller.add_callback( "save_db_job_done", do_next );
  pitch_generator.save_pitch( job );
}
function move_jobs_points( jobs, vec )
{
  modify_multiple_jobs( jobs, function( job )
  {
    job.points = job.points.map( function( p )
    {
      return p.add( vec );
    } );
  } )
}

function extend_corner( cl, c, cr, length )
{
  /*
   * Extends a corner "c" with the length "length"
   * cl is the corner left in clockwise direction from the corner "c"
   * cr is the corner right in clockwise direction from the corner "c"
   */
  var l1 = new Line( cl, c ); // Line from corner cl to corner c
  var l2 = new Line( c, cr ); // Line from corner c to corner cr

  // Move each line out by length
  l1 = l1.offset( length );
  l2 = l2.offset( length );

  // Check if lines are parallel
  if( l1.as_vector.cross( l2.as_vector ).veryclose( 0 ) )
    return l1.end;

  // find the new corner where the two lines cross
  return l1.cross_with_line( l2 );
}

function default_options( defaults, input )
{
  if( input === undefined )
    return defaults;

  var result = {};

  /*
   * Add all keys from defaults and input to result
   * Use defaults if input has not redefined the value
   */
  Object.keys( defaults ).forEach( key => {
    result[key] = input[key] === undefined ? defaults[key] : input[key];
  } );

  // Add any additional value from input to result
  Object.keys( input ).forEach( key => {
    if( result[key] === undefined )
      result[key] = input[key];
  } );

  return result;
}



function find_bounding_box( vectors )
{
  var x_max = vectors[0].x;
  var x_min = vectors[0].x;
  var y_max = vectors[0].y;
  var y_min = vectors[0].y;

  vectors.forEach( v => {
    if( v.x > x_max )
      x_max = v.x;
    if( v.x < x_min )
      x_min = v.x;
    if( v.y > y_max )
      y_max = v.y;
    if( v.y < y_min )
      y_min = v.y;
  } );

  return [ x_min, x_max, y_min, y_max ];

}


function test_all_jobs()
{
  var lnglat_map_center = map_controller.background.get_map_center_lnglat();
  var proj_string = projection_controller.lnglat2UTMProjString( lnglat_map_center );
  var proj_alias = projection_controller.lnglat2UTMAlias( lnglat_map_center );
  var new_center = ProjectorForward( proj_string, lnglat_map_center );
  var new_center_v = new Vector( new_center[0], new_center[1] );

  pt.list.forEach( template => {

    console.log( "testing", template );

    var job = new pt[template]( 0, "", "free_hand" );

    job.projection = proj_string;
    job.proj_alias = proj_alias;
    job.points = [ new_center_v ];
    job.draw();

    job.tasks.forEach( task => {
      if( !task )
        throw "Undefined task found";
      else
      {
        task.ends.forEach( end => {
          if( !end )
            throw "undfined end found";
        } );
      }
    } );
    console.log( job );
  } );
  console.log( "all templates tested" );
}

function autoscale_textarea( selector )
{
  var text = q$( selector );
  function resize()
  {
    text.css( 'height', 'auto' );
    text.css( 'height', `${text.prop( 'scrollHeight' )}px` );
  }
  /* 0-timeout to get the already changed text */
  function delayedResize()
  {
    window.setTimeout( resize, 0 );
  }
  text.on( 'change', resize );
  text.on( 'cut', delayedResize );
  text.on( 'paste', delayedResize );
  text.on( 'drop', delayedResize );
  text.on( 'keydown', delayedResize );

  text.focus();
  text.select();
  resize();
}
;
function hex2ascii( hex )
{
  hex = hex.toString();//force conversion
  let str = '';
  for( let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2 )
    str += String.fromCharCode( parseInt( hex.substr( i, 2 ), 16 ) );
  return str;
}

class CircularBuffer
{
  constructor( length, initialValue = [])
  {
    if( initialValue._array )
      initialValue = initialValue._array;

    this._array = new Array( ...initialValue );
    this.length = length;
    this._array = this._array.slice( 0, this.length );
  }

  get length()
  {
    return this._length;
  }
  set length( v )
  {
    if( v < this._array.length )
      this._array = this._array.slice( this._array.length - v );

    this._length = v;
  }
  push( item )
  {
    this._array.push( item );
    if( this._array.length > this.length )
      this._array.shift();
    return this._array.length;
  }
  pop()
  {
    return this._array.pop();
  }
  shift()
  {
    return this._array.shift();
  }
  unshift( item )
  {
    this._array.unshift( item );
    if( this._array.length > this.length )
      this._array.pop();
    return this._array.length;
  }

  get( i )
  {
    return this._array[i];
  }

  set( i, v )
  {
    this._array[i] = v;
  }

  find( test )
  {
    return this._array.find( test );
  }

  findIndex( test )
  {
    return this._array.findIndex( test );
  }

  indexOf( test )
  {
    return this._array.indexOf( test );
  }

  last( i )
  {
    return this._array.last( i );
  }

  forEach( f, a )
  {
    this._array.forEach( f, a );
  }

  map( f, a )
  {
    return this._array.map( f, a );
  }

  reduce( f, a )
  {
    return this._array.reduce( f, a );
  }

  copy()
  {
    const a = new cb( this.length );
    a._array = this.toArray();
    return a;
  }

  toArray()
  {
    return this._array.copy();
  }
}


const get_affine_transform_3_points = function( from_points, to_points )
{
  // Math: https://www.mathematica-journal.com/2011/06/27/a-symbolic-solution-of-a-3d-affine-transformation/
  // Output like: https://proj.org/operations/transformations/affine.html

  const P = from_points;
  const p = to_points;

  // Check that amount of points are equal
  if( P.length !== p.length )
    throw "Arrays of points must be same length";

  if( P.equal( p ) )
  {
    const res = {
      xoff: 0,
      yoff: 0,
      zoff: 0,
      toff: 0,
      s11: 1,
      s12: 0,
      s13: 0,
      s21: 0,
      s22: 1,
      s23: 0,
      s31: 0,
      s32: 0,
      s33: 1
    };

    return res;
  }

  // Check that all points have all dimensions defined
  [ P, p ].forEach( l => {
    l.forEach( q => {
      if( q.x === undefined || q.y === undefined || q.z === undefined )
        throw "Dimension missing in points";
    } );
  } );

  // Create simplifications dimensional operations
  const x = memoize( ( i ) => i.toString().split( '' ).map( I => p[parseInt( I ) - 1].x ).reduce( ( accu, curr ) => accu - curr ) );
  const y = memoize( ( i ) => i.toString().split( '' ).map( I => p[parseInt( I ) - 1].y ).reduce( ( accu, curr ) => accu - curr ) );
  const z = memoize( ( i ) => i.toString().split( '' ).map( I => p[parseInt( I ) - 1].z ).reduce( ( accu, curr ) => accu - curr ) );
  const X = memoize( ( i ) => i.toString().split( '' ).map( I => P[parseInt( I ) - 1].x ).reduce( ( accu, curr ) => accu - curr ) );
  const Y = memoize( ( i ) => i.toString().split( '' ).map( I => P[parseInt( I ) - 1].y ).reduce( ( accu, curr ) => accu - curr ) );
  const Z = memoize( ( i ) => i.toString().split( '' ).map( I => P[parseInt( I ) - 1].z ).reduce( ( accu, curr ) => accu - curr ) );

  // Calculate inverse scale parameters
  const sigma1 = math.re(
    math.divide(
      math.sqrt( X( 23 ) ** 2 * y( 13 ) * z( 13 ) + y( 13 ) * Y( 23 ) ** 2 * z( 13 ) +
        X( 13 ) ** 2 * y( 23 ) * z( 23 ) + Y( 13 ) ** 2 * y( 23 ) * z( 23 ) + y( 23 ) * Z( 13 ) ** 2 * z( 23 ) -
        X( 13 ) * X( 23 ) * (y( 23 ) * z( 13 ) + y( 13 ) * z( 23 )) - Y( 13 ) * Y( 23 ) * (y( 23 ) * z( 13 ) + y( 13 ) * z( 23 )) -
        y( 23 ) * z( 13 ) * Z( 13 ) * Z( 23 ) - y( 13 ) * Z( 13 ) * z( 23 ) * Z( 23 ) + y( 13 ) * z( 13 ) * Z( 23 ) ** 2 ),
      math.sqrt( (x( 23 ) * y( 13 ) - x( 13 ) * y( 23 )) * (x( 23 ) * z( 13 ) - x( 13 ) * z( 23 )) )
      )
    );
  const sigma2 = math.re(
    math.divide(
      math.sqrt( -1 * X( 13 ) ** 2 * x( 23 ) * z( 23 ) + X( 13 ) * X( 23 ) * (x( 23 ) * z( 13 ) + x( 13 ) * z( 23 )) + x( 23 ) * (Y( 13 ) * Y( 23 ) * z( 13 ) -
        Y( 13 ) ** 2 * z( 23 ) - Z( 13 ) ** 2 * z( 23 ) + z( 13 ) * Z( 13 ) * Z( 23 )) - x( 13 ) * (X( 23 ) ** 2 * z( 13 ) +
        Y( 23 ) ** 2 * z( 13 ) - Y( 13 ) * Y( 23 ) * z( 23 ) - Z( 13 ) * z( 23 ) * Z( 23 ) + z( 13 ) * Z( 23 ) ** 2) ),
      math.sqrt( -(x( 23 ) * y( 13 ) - x( 13 ) * y( 23 )) * (-y( 23 ) * z( 13 ) + y( 13 ) * z( 23 )) )
      )
    );
  const sigma3 = math.re(
    math.divide(
      math.sqrt( X( 13 ) ** 2 * x( 23 ) * y( 23 ) - X( 13 ) * X( 23 ) * (x( 23 ) * y( 13 ) + x( 13 ) * y( 23 )) + x( 23 ) * (Y( 13 ) ** 2 * y( 23 ) - y( 13 ) *
        Y( 13 ) * Y( 23 ) + y( 23 ) * Z( 13 ) ** 2 - y( 13 ) * Z( 13 ) * Z( 23 )) + x( 13 ) * (X( 23 ) ** 2 * y( 13 ) -
        Y( 13 ) * y( 23 ) * Y( 23 ) + y( 13 ) * Y( 23 ) ** 2 - y( 23 ) * Z( 13 ) * Z( 23 ) + y( 13 ) * Z( 23 ) ** 2) ),
      math.sqrt( (x( 23 ) * z( 13 ) - x( 13 ) * z( 23 )) * (y( 23 ) * z( 13 ) - y( 13 ) * z( 23 )) )
      )
    );

  const s1 = 1 / sigma1;
  const s2 = 1 / sigma2;
  const s3 = 1 / sigma3;

  // Calculate rotation parameters
  const a = (X( 23 ) * Z( 13 ) - X( 13 ) * Z( 23 ) + (-X( 23 ) * z( 13 ) + X( 13 ) * z( 23 )) * sigma3 +
    sigma1 * (x( 23 ) * Z( 13 ) - x( 13 ) * Z( 23 ) + (-x( 23 ) * z( 13 ) + x( 13 ) * z( 23 )) * sigma3)) /
    (-X( 23 ) * Y( 13 ) + X( 13 ) * Y( 23 ) + (-X( 23 ) * y( 13 ) + X( 13 ) * y( 23 )) * sigma2 +
      sigma1 * (-x( 23 ) * Y( 13 ) + x( 13 ) * Y( 23 ) + (-x( 23 ) * y( 13 ) + x( 13 ) * y( 23 )) * sigma2));
  const b = (a * Y( 13 ) + Z( 13 ) + a * y( 13 ) * sigma2 - z( 13 ) * sigma3) / (X( 13 ) + x( 13 ) * sigma1);
  const c = (X( 13 ) + b * Z( 13 ) - x( 13 ) * sigma1 + b * z( 13 ) * sigma3) / (Y( 13 ) + y( 13 ) * sigma2);

  // Calculate translation parameters
  const X0 = 1 / ((1 + a ** 2 + b ** 2 + c ** 2) * sigma1) *
    ((-1 - a ** 2 + b ** 2 + c ** 2) * X( 1 ) + (-2 * a * b + 2 * c) * Y( 1 ) - 2 * b * Z( 1 ) -
      2 * a * c * Z( 1 ) + x( 1 ) * sigma1 + a ** 2 * x( 1 ) * sigma1 + b ** 2 * x( 1 ) * sigma1 + c ** 2 * x( 1 ) * sigma1);
  const Y0 = (1 / ((1 + a ** 2 + b ** 2 + c ** 2) * sigma2)) * (-2 * (a * b + c) * X( 1 ) + (-1 + a ** 2 - b ** 2 + c ** 2) * Y( 1 ) +
    2 * a * Z( 1 ) - 2 * b * c * Z( 1 ) + y( 1 ) * sigma2 + a ** 2 * y( 1 ) * sigma2 + b ** 2 * y( 1 ) * sigma2 + c ** 2 * y( 1 ) * sigma2);
  const Z0 = (X( 1 ) - c * Y( 1 ) + b * Z( 1 ) - x( 1 ) * sigma1 + X0 * sigma1 - c * y( 1 ) * sigma2 + c * Y0 * sigma2 + b * z( 1 ) * sigma3) / (b * sigma3);

  const W = math.matrix( [ [ s1, 0, 0 ], [ 0, s2, 0 ], [ 0, 0, s3 ] ] );
  const S = math.matrix( [ [ 0, -c, -b ], [ c, 0, -a ], [ -b, a, 0 ] ] );
  const I3 = math.identity( 3 );
  const R = math.multiply( math.inv( math.subtract( I3, S ) ), math.add( I3, S ) );

  // Rotation and Scale for PROJ
  const RS = math.multiply( W, R );

  const round_magnitude = 9;

  const res = {
    xoff: X0.round( round_magnitude ),
    yoff: Y0.round( round_magnitude ),
    zoff: Z0.round( round_magnitude ),
    s11: math.subset( RS, math.index( 0, 0 ) ).round( round_magnitude ),
    s12: math.subset( RS, math.index( 0, 1 ) ).round( round_magnitude ),
    s13: math.subset( RS, math.index( 0, 2 ) ).round( round_magnitude ),
    s21: math.subset( RS, math.index( 1, 0 ) ).round( round_magnitude ),
    s22: math.subset( RS, math.index( 1, 1 ) ).round( round_magnitude ),
    s23: math.subset( RS, math.index( 1, 2 ) ).round( round_magnitude ),
    s31: math.subset( RS, math.index( 2, 0 ) ).round( round_magnitude ),
    s32: math.subset( RS, math.index( 2, 1 ) ).round( round_magnitude ),
    s33: math.subset( RS, math.index( 2, 2 ) ).round( round_magnitude )
  };

  return res;

};

/**
 * correlate_points_in_polygon – Returns map of polygon1 compared to polygon2.
 * @param {Array<Vector>} polygon1
 * @param {Array<Vector>} polygon2
 * @returns {Array<Number>}
 */
const correlate_points_in_polygons = function(polygon1, polygon2)
{
  // Check of polygons are of same length
  if(polygon1.length !== polygon2.length)
    throw "Polygons must have the same amount of points";

  // Create working copies
  let P = polygon1.map(p=>new Vector(p.x, p.y));
  let Q = polygon2.map(q=>new Vector(q.x, q.y));

  // Calculate Center of Mass
  const CMP = math.mean(P.map(p=>p.toArray()), 0).toVector();
  const CMQ = math.mean(Q.map(q=>q.toArray()), 0).toVector();

  // Move both polygons to origin
  P = P.map(p=>p.subtract(CMP));
  Q = Q.map(q=>q.subtract(CMQ));

  // Define rotation steps
  const Cstep = 6; // deg = 60 steps

  // Do coarse rotation
  let minDist = Infinity;
  let minDistAngle = 0;
  for(let angle = 0; angle < 360; angle+=Cstep)
  {
    let Qrot = Q.map(p=>p.rotate(angle.deg2rad()));
    let dist = Qrot.reduce((sum,q)=>sum+math.min(P.map(p=>p.dist_to_point(q))), 0);
    if(dist < minDist)
    {
      minDist = dist;
      minDistAngle = angle;
    }
  }
  
  // Create guess
  const guess = [];
  Q.map(p=>p.rotate(minDistAngle.deg2rad())).forEach((q,idx)=>{
    let dists = P.map(p=>p.dist_to_point(q));
    guess.push(dists.indexOf(math.min(dists)));
  });

  // Return guess
  return guess;
}

/**
 * sort_points_in_polygon – Returns polygon1 sorted as polygon2.
 * @param {Array<Vector>} polygon1
 * @param {Array<Vector>} polygon2
 * @returns {Array<Vector>}
 */
const sort_points_in_polygon = function(polygon1, polygon2)
{
  return correlate_points_in_polygons(polygon1, polygon2).map(idx=>polygon1[idx]);
}


const getFirstIndexOfMinValue = array => array.reduce((r, v, i, a) => v >= a[r] ? r : i, -1);
const getFirstIndexOfMaxValue = array => array.reduce((r, v, i, a) => v <= a[r] ? r : i, -1);