/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function vec_sub( v1, v2 )
{
  var v3 = [ ];
  for( var i = 0; i < v1.length; i++ )
  {
    v3[i] = v1[i] - v2[i];
  }
  return v3;
}

function vec_len( v )
{
  var d = 0;
  v.forEach( function( e )
  {
    d += Math.pow( e, 2 );
  } );
  d = Math.sqrt( d );
  return d;
}

function vec_div( v, num )
{
  var v2 = [ ];
  for( var i = 0; i < v.length; i++ )
  {
    v2[i] = v[i] / num;
  }
  return v2;
}
function vec_mul( v, m )
{
  var v2 = [ ];
  for( var i = 0; i < v.length; i++ )
  {
    v2[i] = v[i] * m;
  }
  return v2;
}

function vec_add( v1, v2 )
{
  var v3 = [ ];
  for( var i = 0; i < v1.length; i++ )
  {
    v3[i] = v1[i] + v2[i];
  }
  return v3;
}

function vec_rot_90( v )
{
  return [ -v[1], v[0] ];
  //return vec_rot( v, Math.PI / 2 );
}
function vec_rot( v, a )
{
  return [ v[0] * Math.cos( a ) - v[1] * Math.sin( a ), v[0] * Math.sin( a ) + v[1] * Math.cos( a ) ];
}

function vec_avg( v1, v2 )
{
  var v3 = [ ];
  for( var i = 0; i < v1.length; i++ )
  {
    v3[i] = (v1[i] + v2[i]) / 2;
  }
  return v3;
}

function vec_equal( v1, v2 )
{
  var equal = true;
  for( var i = 0; i < v1.length; i++ )
  {
    if( Math.abs( v1[i] - v2[i] ) > 0.0001 )
      equal = false;
  }
  return equal;
}

function vec_dot( v1, v2 )
{
  var result = 0;
  for( var i = 0; i < v1.length; i++ )
  {
    result += v1[i] * v2[i];
  }
  return result;
}

function vec_normalize( v )
{
  return vec_div( v, vec_len( v ) );
}

function point_to_vec( point )
{
  return [ point.x, point.y ];
}
function vec_into_point( vec, point )
{
  point.x = vec[0];
  point.y = vec[1];
}

function find_cross( circle_center, circle_radius, line )
{

  var p1 = line[0];
  var p2 = line[1];

  if( p1[0] === p2[0] )
  {

    var r = circle_radius;
    var x0 = circle_center[0];
    var y0 = circle_center[1];

    var x1 = p1[0];
    var x2 = p1[0];

    var del = Math.sqrt( Math.pow( r, 2 ) - Math.pow( x1, 2 ) + 2 * x1 * x0 - Math.pow( x0, 2 ) );
    var y1 = y0 - del;
    var y2 = y0 + del;

    return [ [ x1, y1 ], [ x2, y2 ] ];


  }
  else
  {

    var a = (p1[1] - p2[1]) / (p1[0] - p2[0]);
    var b = p1[1] - a * p1[0];

    var r = circle_radius;
    var x0 = circle_center[0];
    var y0 = circle_center[1];
    var x1 = (-Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);
    var x2 = (Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);

    var y1 = a * x1 + b;
    var y2 = a * x2 + b;

    return [ [ x1, y1 ], [ x2, y2 ] ];
  }
}

function make_bb_clockwise( bb )
{
  var v1 = vec_normalize( [ bb[0][0] - bb[1][0], bb[0][1] - bb[1][1] ] );
  var v2 = vec_normalize( [ bb[1][0] - bb[2][0], bb[1][1] - bb[2][1] ] );

  var a1 = norm_angle( Math.atan2( v1[0], v1[1] ) );
  var a2 = norm_angle( Math.atan2( v2[0], v2[1] ) );
  var diff = a1 - a2;

  if( diff < -Math.PI )
    diff += 2 * Math.PI;

  if( diff > 0 )
    bb = bb.reverse();

  return bb;
}