
/* global math */

class Vector3
{
  constructor( x, y, z )
  {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.z = z ? z : 0;

    if( Math.abs( this.x ) < 1e-5 )
      this.x = 0;
    if( Math.abs( this.y ) < 1e-5 )
      this.y = 0;
    if( Math.abs( this.z ) < 1e-5 )
      this.z = 0;
  }
  copy()
  {
    return new Vector3( this.x, this.y, this.z );
  }
  toArray()
  {
    return [ this.x, this.y, this.z ];
  }

  dist_to_point( p2 )
  {
    return Math.sqrt( Math.pow( this.x - p2.x, 2 ) + Math.pow( this.y - p2.y, 2 ) + Math.pow( this.z - p2.z, 2 ) );
  }

  veryclose( p2 )
  {
    return this.dist_to_point( p2 ).veryclose( 0 );
  }

  multiply( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector3( this.x * factor, this.y * factor, this.z * factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector3" )
    {
      return new Vector3( this.x * factor.x, this.y * factor.y, this.z * factor.z );
    }
    else
    {
      throw "multiply factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  divide( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector3( this.x / factor, this.y / factor, this.z / factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector3" )
    {
      return new Vector3( this.x / factor.x, this.y / factor.y, this.z / factor.z );
    }
    else
    {
      throw "divide factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  add( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector3( this.x + factor, this.y + factor, this.z + factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector3" )
    {
      return new Vector3( this.x + factor.x, this.y + factor.y, this.z + factor.z );
    }
    else
    {
      throw "add factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  subtract( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector3( this.x - factor, this.y - factor, this.z - factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector3" )
    {
      return new Vector3( this.x - factor.x, this.y - factor.y, this.z - factor.z );
    }
    else
    {
      throw "subtract factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  pow( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector3( Math.pow( this.x, factor ), Math.pow( this.y, factor ), Math.pow( this.z, factor ) );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector3" )
    {
      return new Vector3( Math.pow( this.x, factor.x ), Math.pow( this.y, factor.y ), Math.pow( this.z, factor.z ) );
    }
    else
    {
      throw "pow factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  get sqrt()
  {
    return new Vector3( Math.sqrt( this.x ), Math.sqrt( this.y ), Math.sqrt( this.z ) );
  }
  get length()
  {
    return Math.sqrt( Math.pow( this.x, 2 ) + Math.pow( this.y, 2 ) + Math.pow( this.z, 2 ) );
  }
  cross( v )
  {
    return new Vector3( this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x );
  }
  toVectorS()
  {
    const r = this.length;
    const theta = math.acos( this.z / this.length );
    const phi = math.atan( this.y / this.x );

    return new VectorS( r, theta, phi );
  }
  toVector()
  {
    return new Vector(this.x, this.y);
  }

  /**
   * 
   * @param {DenseMatrix} matrix
   * @returns {Vector} transformed point
   */
   transform(matrix = math.identity(3))
   {
     return math.multiply(matrix, this.toArray())._data.toVector3();
   }
}

class VectorS
{
  constructor( r, theta, phi )
  {
    // r : radius
    // phi: about z
    // theta: from z

    this.r = r ? r : 0;
    this.theta = theta ? theta : 0;
    this.phi = phi ? phi : 0;
  }
  copy()
  {
    return new VectorS( this.r, this.theta, this.phi );
  }
  get length()
  {
    return this.r;
  }
  get x()
  {
    return this.r * math.sin( this.theta ) * math.cos( this.phi );
  }
  get y()
  {
    return this.r * math.sin( this.theta ) * math.sin( this.phi );
  }
  get z()
  {
    return this.r * math.cos( this.theta );
  }
  toVector3()
  {
    return new Vector3( this.x, this.y, this.z );
  }
}

class Vector
{
  toVector3(z = 0)
  {
    return new Vector3(this.x, this.y, z);
  }
  static random()
  {
    return new Vector( Math.random() * 2 - 1, Math.random() * 2 - 1 );
  }
  toString()
  {
    return "(" + this.x + " , " + this.y + ")";
  }
  constructor( x, y )
  {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }
  toCoord()
  {
    return "(" + this.x + " , " + this.y + ")";
  }
  copy()
  {
    return new Vector( this.x, this.y );
  }
  toArray()
  {
    return [ this.x, this.y ];
  }

  /**
   * 
   * @param {DenseMatrix} matrix
   * @returns {Vector} transformed point
   */
   transform(matrix = math.identity(3))
   {
     return this.toVector3().transform(matrix).toVector();
   }

  /**
   * Test if this vector is parallel with other vector
   * @param {Vector} other Other vector
   * @returns {Boolean}
   */
  parallelWith( other )
  {
    return this.cross( other ).veryclose( 0 );
  }
  dist_to_point( p2 )
  {
    return Math.sqrt( Math.pow( this.x - p2.x, 2 ) + Math.pow( this.y - p2.y, 2 ) );
  }

  veryclose( p2 )
  {
    return this.dist_to_point( p2 ).veryclose( 0 );
  }

  cross( v )
  {
    return this.determinant( v );
  }

  determinant( v )
  {
    return this.x * v.y - this.y * v.x;
  }

  multiply( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector( this.x * factor, this.y * factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector" )
    {
      return new Vector( this.x * factor.x, this.y * factor.y );
    }
    else
    {
      throw "multiply factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  divide( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector( this.x / factor, this.y / factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector" )
    {
      return new Vector( this.x / factor.x, this.y / factor.y );
    }
    else
    {
      throw "divide factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  add( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector( this.x + factor, this.y + factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector" )
    {
      return new Vector( this.x + factor.x, this.y + factor.y );
    }
    else
    {
      throw "add factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  subtract( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector( this.x - factor, this.y - factor );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector" )
    {
      return new Vector( this.x - factor.x, this.y - factor.y );
    }
    else
    {
      throw "subtract factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  pow( factor )
  {
    if( typeof factor == "number" || typeof factor == "undefined" )
    {
      return new Vector( Math.pow( this.x, factor ), Math.pow( this.y, factor ) );
    }
    else if( typeof factor == "object" && factor.constructor.name == "Vector" )
    {
      return new Vector( Math.pow( this.x, factor.x ), Math.pow( this.y, factor.y ) );
    }
    else
    {
      throw "pow factor must be either number or 2 element Vector. Type is " + typeof factor;
    }
  }
  get sqrt()
  {
    return new Vector( Math.sqrt( this.x ), Math.sqrt( this.y ) );
  }
  get length()
  {
    return Math.sqrt( Math.pow( this.x, 2 ) + Math.pow( this.y, 2 ) );
  }
  get angle()
  {
    return Math.atan2( this.y, this.x );
  }
  angle_between( p2 )
  {
    var a1 = this.unit_vector.angle;
    if( a1 < 0 )
      a1 += 2 * Math.PI;
    var a2 = p2.unit_vector.angle;
    if( a2 < 0 )
      a2 += 2 * Math.PI;

    var d = a1 - a2;
    if( d < 0 )
      d += 2 * Math.PI;
    if( d > Math.PI )
      d -= 2 * Math.PI;

    return Math.abs( d );
    /*
     ar v1_u = this.unit_vector;
     var v2_u = p2.unit_vector;
     var v1_dot_v2 = v1_u.dot( v2_u );
     if( v1_dot_v2 < -1.0 )
     v1_dot_v2 = -1.0;
     if( v1_dot_v2 > 1.0 )
     v1_dot_v2 = 1.0;
     return Math.acos( v1_dot_v2 );
     */
  }
  rotate( a )
  {
    return new Vector( this.x * Math.cos( a ) - this.y * Math.sin( a ), this.x * Math.sin( a ) + this.y * Math.cos( a ) );
  }
  rotate_90_ccw()
  { // clockwise
    return new Vector( -this.y, this.x );
  }
  rotate_90_cw()
  {
    return new Vector( this.y, -this.x );
  }
  rotate_180()
  {
    return new Vector( -this.x, -this.y );
  }
  mirror_y()
  {
    return new Vector( this.x, -this.y );
  }
  mirror_x()
  {
    return new Vector( -this.x, this.y );
  }
  dot( p2 )
  {
    return this.x * p2.x + this.y * p2.y;
  }
  equals( p2 )
  {
    return ((Math.abs( this.x - p2.x ) < 0.0001) && (Math.abs( this.y - p2.y ) < 0.0001));
  }

  get unit_vector()
  {
    return this.divide( this.length );
  }

  project( projector )
  {
    return projector.forward( [ this.x, this.y ] ).toVector();
  }

  mirror()
  {
    return new Vector( this.y, this.x );
  }

  extend( distance )
  {
    return this.unit_vector.multiply( distance ).add( this );
  }

  directed_angle( other )
  {
    //return (new Line( other, this )).as_vector.angle;
    var p1 = this.unit_vector;
    var p2 = other.unit_vector;
    // both vectors have to be normalized!
    var dotProduct = p1.dot( p2 );
    var angle = math.acos( dotProduct.round(4) );
    var vector1perp = p1.rotate_90_ccw();
    var perpDotProduct = vector1perp.dot( p2 );
    if( perpDotProduct > 0 )
      angle = -1 * angle;
    return angle;
  }

  projunit2meter()
  {
    return new Vector( this.x.projunit2meter(), this.y.projunit2meter() );
  }

  meter2projunit()
  {
    return new Vector( this.x.meter2projunit(), this.y.meter2projunit() );
  }

  unit2meter()
  {
    return new Vector( this.x.unit2meter(), this.y.unit2meter() );
  }

  meter2unit()
  {
    return new Vector( this.x.meter2unit(), this.y.meter2unit() );
  }

  meter2foot()
  {
    return new Vector( this.x.meter2foot(), this.y.meter2foot() );
  }

  foot2meter()
  {
    return new Vector( this.x.foot2meter(), this.y.foot2meter() );
  }

}

class Line
{
  constructor( start, end )
  {
    if( !(start instanceof Vector) ) {
      throw "start must be Vector";
    }

    if( !(end instanceof Vector) ) {
      throw "end must be Vector";
    }
    
    this.start = start; // point
    this.end = end; // point
  }

  toLineTask( id, reverse, paint )
  {
    return new LineTask( id, [ this.start, this.end ], reverse, paint );
  }

  project( projector )
  {
    return new Line( this.start.project( projector ), this.end.project( projector ) );
  }

  get length()
  {
    return this.start.dist_to_point( this.end );
  }

  /**
   * @returns {Vector} Line as Vector
   */
  get as_vector()
  {
    return this.end.subtract( this.start );
  }
  /**
   * @returns {Vector} Line as Vector
   */
  toVector()
  {
    return this.as_vector;
  }
  sameAs( l2 )
  {
    return (this.start.veryclose( l2.start ) && this.end.veryclose( l2.end ));
  }
  get angle()
  {
    return this.as_vector.angle;
  }

  rotate( a )
  {
    // Rotates around start point
    var g = this.as_vector.rotate( a );
    return new Line( this.start, this.start.add( g ) );
  }

  angle_between( l2 )
  {
    return this.as_vector.angle_between( l2.as_vector );
  }

  get unit_vector()
  {
    var line_vec = this.as_vector;
    return line_vec.divide( line_vec.length );
  }
  get middle()
  {
    return this.start.add( this.end ).divide( 2 );
  }

  copy()
  {
    return new Line( this.start.copy(), this.end.copy() );
  }

  add_to_start( length )
  {
    var new_line = this.copy();
    var vec = this.as_vector;
    new_line.start = this.end.subtract( vec.unit_vector.multiply( this.length + length ) );
    return new_line;
  }
  add_to_end( length )
  {
    var new_line = this.copy();
    var vec = this.as_vector;
    new_line.end = this.start.add( vec.unit_vector.multiply( this.length + length ) );
    return new_line;
  }

  move( direction, length = 1)
  {
    var move_vec = direction.multiply( length );
    return new Line( this.start.add( move_vec ), this.end.add( move_vec ) );
  }

  reverse()
  {
    return new Line( this.end, this.start );
  }

  point_on_line( p, limit_to_line, false_if_outside = false)
  {

    var line = this.end.subtract( this.start );
    var the_point;
    if( line.x === 0 )
    {
      the_point = new Vector( this.start.x, p.y );
    }
    else if( line.y === 0 )
    {
      the_point = new Vector( p.x, this.start.y );
    }
    else
    {
      var a = line.y / line.x;
      var line_b = this.start.y - a * this.start.x;
      var b = -1;
      var c = line_b;
      var closest_x = (b * (b * p.x - a * p.y) - a * c) / (a * a + b * b);
      var closest_y = (a * (-b * p.x + a * p.y) - b * c) / (a * a + b * b);
      the_point = new Vector( closest_x, closest_y );
    }

    if( limit_to_line )
    {
      var dist_to_start = new Line( this.start, the_point ).length;
      var dist_to_end = new Line( the_point, this.end ).length;

      if( dist_to_start > this.length && dist_to_start > dist_to_end )
      {
        // limit to end
        the_point = this.end;
        if( false_if_outside )
          return false;
      }
      else if( dist_to_end > this.length )
      {
        // limit to start
        the_point = this.start;
        if( false_if_outside )
          return false;
      }

    }

    return the_point;

  }

  /**
   * Test if this line is parallel with other line
   * @param {Line} other Other line
   * @returns {Boolean}
   */
   parallelWith( other )
   {
     return this.toVector().cross( other.toVector() ).veryclose( 0 );
   }

  cross_with_line( l2, false_if_outside = false)
  {
    var new_x, new_y;

    var u1 = this.unit_vector;
    var u2 = l2.unit_vector;
    var u3 = u2.rotate_180();

    if( u1.veryclose( u2 ) || u1.veryclose( u3 ) )
    {
      return false;
    }

    if( this.start.x.veryclose(this.end.x) )
    {

      new_x = this.start.x;
      var a2 = (l2.start.y - l2.end.y) / (l2.start.x - l2.end.x);
      var b2 = l2.start.y - a2 * l2.start.x;
      new_y = a2 * new_x + b2;

    }
    else if( l2.start.x.veryclose(l2.end.x) )
    {

      new_x = l2.start.x;
      var a1 = (this.start.y - this.end.y) / (this.start.x - this.end.x);
      var b1 = this.start.y - a1 * this.start.x;
      new_y = a1 * new_x + b1;

    }
    else
    {

      var a1 = (this.start.y - this.end.y) / (this.start.x - this.end.x);
      var b1 = this.start.y - a1 * this.start.x;
      var a2 = (l2.start.y - l2.end.y) / (l2.start.x - l2.end.x);
      var b2 = l2.start.y - a2 * l2.start.x;

      new_x = (b1 - b2) / (a2 - a1);
      new_y = a1 * new_x + b1;

    }

    var cross_point = new Vector( new_x, new_y );

    if( false_if_outside )
    {
      var on_this = this.point_on_line( cross_point, true );
      if( on_this.veryclose( cross_point ) )
      {
        var on_this = l2.point_on_line( cross_point, true );
        if( on_this.veryclose( cross_point ) )
          return cross_point;
        else
          return false;
      }
      else
      {
        return false;
      }
    }

    return cross_point;
  }

  crosses_with_circle( orig_center, circle_radius, check_end = false)
  {

    if( this.point_on_line( orig_center ).dist_to_point( orig_center ) > circle_radius )
      return [ ];

    var circle_center = new Vector( 0, 0 );

    var p1 = this.start.subtract( orig_center );
    var p2 = this.end.subtract( orig_center );

    var c1, c2;

    if( p1.x === p2.x )
    {
      var x0 = circle_center.x;
      var y0 = circle_center.y;
      var x1 = p1.x;
      var x2 = p1.x;
      var del = Math.sqrt( Math.pow( circle_radius, 2 ) - Math.pow( x1, 2 ) + 2 * x1 * x0 - Math.pow( x0, 2 ) );
      var y1 = y0 - del;
      var y2 = y0 + del;

      c1 = new Vector( x1, y1 );
      c2 = new Vector( x2, y2 );
    }
    else
    {
      var a = (p1.y - p2.y) / (p1.x - p2.x);
      var b = p1.y - a * p1.x;

      var r = circle_radius;
      var x0 = circle_center.x;
      var y0 = circle_center.y;
      var x1 = (-Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);
      var x2 = (Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);

      var y1 = a * x1 + b;
      var y2 = a * x2 + b;

      c1 = new Vector( x1, y1 );
      c2 = new Vector( x2, y2 );
    }
    c1 = c1.add( orig_center );
    c2 = c2.add( orig_center );

    var checkpoint = check_end ? this.end : this.start;

    if( checkpoint.dist_to_point( c1 ) > checkpoint.dist_to_point( c2 ) )
    {
      return [ c2, c1 ];
    }
    else
    {
      return [ c1, c2 ];
  }
  }  
  crosses_with_circle_within_length_of_line( orig_center, circle_radius, check_end = false)
  {

    if( this.point_on_line( orig_center ).dist_to_point( orig_center ) > circle_radius )
      return [ ];

    var circle_center = new Vector( 0, 0 );

    var p1 = this.start.subtract( orig_center );
    var p2 = this.end.subtract( orig_center );

    var c1, c2;

    if( p1.x === p2.x )
    {
      var x0 = circle_center.x;
      var y0 = circle_center.y;
      var x1 = p1.x;
      var x2 = p1.x;
      var del = Math.sqrt( Math.pow( circle_radius, 2 ) - Math.pow( x1, 2 ) + 2 * x1 * x0 - Math.pow( x0, 2 ) );
      var y1 = y0 - del;
      var y2 = y0 + del;

      c1 = new Vector( x1, y1 );
      c2 = new Vector( x2, y2 );
    }
    else
    {
      var a = (p1.y - p2.y) / (p1.x - p2.x);
      var b = p1.y - a * p1.x;

      var r = circle_radius;
      var x0 = circle_center.x;
      var y0 = circle_center.y;
      var x1 = (-Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);
      var x2 = (Math.sqrt( Math.pow( a, 2 ) * Math.pow( r, 2 ) - Math.pow( a, 2 ) * Math.pow( x0, 2 ) - 2 * a * b * x0 + 2 * a * x0 * y0 - Math.pow( b, 2 ) + 2 * b * y0 + Math.pow( r, 2 ) - Math.pow( y0, 2 ) ) - a * b + a * y0 + x0) / (Math.pow( a, 2 ) + 1);

      var y1 = a * x1 + b;
      var y2 = a * x2 + b;

      c1 = new Vector( x1, y1 );
      c2 = new Vector( x2, y2 );
    }
    c1 = c1.add( orig_center );
    c2 = c2.add( orig_center );

    var checkpoint = check_end ? this.end : this.start;

    if(c2.dist_to_point(this.start) > 0.1 && c2.dist_to_point(this.end) > 0.1 && c1.dist_to_point(this.start) > 0.1 && c1.dist_to_point(this.end) > 0.1)
    {
      return [];
    }

    if( checkpoint.dist_to_point( c1 ) > checkpoint.dist_to_point( c2 ) )
    {
      return [ c2, c1 ];
    }
    else
    {
      return [ c1, c2 ];
  }
  }


  split( line_length, space_length = 0, offset = 0, alignment = [0, 0])
  {
    if( line_length <= 0 )
      throw "Cant split with length 0, since it gives infinite line pieces";
    if( alignment[0] === 1 && alignment[1] === 1 )
    {
      var start_offset = (this.length / 2 - (line_length / 2)) % (line_length + space_length);
      offset += start_offset;
    }

    // negative offset means shorter first line
    var lines = [ ];
    var g = this.unit_vector;
    if( g.length.veryclose( 0 ) )
      return [ this ];
    var is_space = false;

    var a = -offset / (line_length + space_length);
    a = a - Math.floor( a );
    a = a * (line_length + space_length);

    if( a > line_length )
    {
      is_space = true;
      a -= line_length;
    }
    if( is_space )
      a = space_length - a;
    else
      a = line_length - a;

    var use_length = a;
    var l1 = this.start;
    var l2 = l1.add( g.multiply( use_length ) );
    while( (new Line( this.start, l2 )).length < this.length )
    {
      if( is_space )
      {
        l1 = l2;
        l2 = l2.add( g.multiply( line_length ) );
      }
      else
      {
        lines.push( new Line( l1, l2 ) );
        l1 = l2;
        l2 = l2.add( g.multiply( space_length ) );
      }
      is_space = !is_space;
    }
    if( !is_space )
    {
      lines.push( new Line( l1, this.end ) );
    }
    return lines.filter( l => {
      return l.length > 0.00001;
    } );
  }

  splitBySteps( n )
  {

    var lines = [ ];
    var g = this.unit_vector;
    var step = this.length / n;

    g = g.multiply( step );

    lines.push( new Line( this.start, g.add( this.start ) ) );
    for( var i = 0; i < n - 1; i++ )
    {
      let start = g.add( g.multiply( i ) ).add( this.start );
      let end = g.add( g.multiply( i + 1 ) ).add( this.start );
      lines.push( new Line( start, end ) );
    }

    return lines;
  }

  get normal_vector()
  {
    return this.unit_vector.rotate_90_ccw();
  }

  offset( length )
  {
    return this.move( this.normal_vector, length );
  }

}

class Circle
{
  constructor( center, radius )
  {
    this.center = center;  // point
    this.r = radius;  // number
  }

  toArcTask( id, clockwise, reverse, paint )
  {
    return new ArcTask( id, [ this.center.add( new Vector( this.r, 0 ) ),
      this.center.add( new Vector( -this.r, 0 ) ) ], this.center, clockwise, reverse, paint );
  }

  crosses_with_line( q, check_end = false)
  {
    return q.crosses_with_circle( this.center, this.r, check_end );
  }

  crosses_with_circle( q )
  {
    var P0 = this.center.subtract( this.center );
    var P1 = q.center.subtract( this.center );

    var d = P0.dist_to_point( P1 );

    if( (d > (this.r + q.r)) && !(d - (this.r + q.r)).veryclose( 0 ) )
    {
      logger.debug( "circle", "The circles are separate", d, ">", (this.r + q.r), (d - (this.r + q.r)).veryclose( 0 ) );
      return;
    }

    if( d < Math.abs( this.r - q.r ) && !(d - (this.r + q.r)).veryclose( 0 ) )
    {
      logger.debug( "circle", "One circle is contained within the other" );
      return [ ];
    }

    if( d === 0 && this.r === q.r )  // circles coincide
    {
      logger.debug( "circle", "Circles coincide" );
      return [ this.center.add( new Vector( 0, this.r ) ), this.center.add( new Vector( 0, -this.r ) ) ];
    }

    if( d.veryclose(this.r + q.r) || d.veryclose(this.r - q.r) )  // circles meet in one point
    {
      return [ (new Line(this.center, q.center)).unit_vector.multiply(this.r).add(this.center) ];
    }

    var a = (Math.pow( this.r, 2 ) - Math.pow( q.r, 2 ) + Math.pow( d, 2 )) / (2 * d);
    var h = Math.sqrt( Math.pow( this.r, 2 ) - Math.pow( a, 2 ) );

    var P2 = P0.add( (P1.subtract( P0 )).multiply( a / d ) );
    var P31 = new Vector( (P2.x + h * (P1.y - P0.y) / d), (P2.y - h * (P1.x - P0.x) / d) );
    var P32 = new Vector( (P2.x - h * (P1.y - P0.y) / d), (P2.y + h * (P1.x - P0.x) / d) );

    return [ P31.add( this.center ), P32.add( this.center ) ];
  }

  inside_circle( q )
  {
    return this.center.dist_to_point(q.center)+this.r < q.r;
  }

  tangent_circle( q )
  {
    // const p = this.crosses_with_circle(q);
    // return p && p.length === 1;
    const p = this.crosses_with_circle(q);
    return (p && p.length > 0 && this.inside_circle(q)) || (p && p.length > 0 && q.inside_circle(this));
  }

  get circumference()
  {
    return Math.abs(this.r * 2 * Math.PI);
  }

  x( y )
  {
    var v = (Math.sqrt( Math.pow( this.r, 2 ) - Math.pow( y - this.center.y, 2 ) ) + this.center.x);
    return [ v, -v ];
  }
  y( x )
  {
    var v = Math.sign( x ) * Math.sqrt( Math.pow( this.r, 2 ) - Math.pow( x - this.center.x, 2 ) ) + this.center.y;
    return [ v, -v ];
  }
}

class Arc extends Circle
{
  static From2PointsAndCenter( start, end, center, clockwise )
  {
    var start_vec = (new Line( center, start )).as_vector;
    var end_vec = (new Line( center, end )).as_vector;

    var angle = start_vec.directed_angle( end_vec );
    if( !clockwise && angle > 0 )
      angle -= Math.PI * 2;
    if( clockwise && angle < 0 )
      angle += Math.PI * 2;

    return new Arc( center, start_vec, -angle );
  }

  constructor( center, radius, end_angle )
  {
    super( center, radius.length );
    this.R = radius;  // vector

    while( end_angle > 2 * Math.PI )
      end_angle -= 2 * Math.PI;
    while( end_angle < - 2 * Math.PI )
      end_angle += 2 * Math.PI;

    if( (end_angle >= -2 * Math.PI) && (end_angle <= 2 * Math.PI) )
      this.end_angle = end_angle; // radians, relative to radius [-2pi, 2pi]
    else
      throw "Arc end angle outside bounds [-2pi, 2pi]";
  }

  get circumference()
  {
    return Math.abs(this.r * this.end_angle);
  }

  get acute()
  {
    return this.end_angle < (Math.PI / 2);
  }

  get right()
  {
    return this.end_angle === (Math.PI / 2);
  }

  get obtuse()
  {
    return this.end_angle > (Math.PI / 2) && this.end_angle < Math.PI;
  }

  get reflex()
  {
    return this.end_angle > Math.PI;
  }

  get Rend()
  {
    return this.R.rotate( this.end_angle );
  }

  get local_start()
  {
    return this.R;
  }
  get start()
  {
    return this.center.add( this.R );
  }
  get local_end()
  {
    return this.Rend;
  }
  get end()
  {
    return this.center.add( this.Rend );
  }

  toArcTask( id, clockwise_not_used, reverse_not_used, paint )
  {
    return ArcTask.From2PointsAndCenter(id, this.start, this.end, this.center, (this.end_angle <= 0), paint);
  }

  crosses_with_arc( q )
  {
    var v = this.crosses_with_circle( q );

    if( !v )
      return;

    var r = [ ];

    if( this.inside_arc( v[0] ) )
    {
      r.push( v[0] );
    }
    if( this.inside_arc( v[1] ) )
    {
      r.push( v[1] );
    }
    if( r.length === 0 )
    {
      logger.debug( "circle", "Arcs do not cross" );
    }
    return r;
  }

  inside_arc( v )
  {
    /*
     * Check if vector "v" lies within arc span
     */

    var a = this.R;
    var b = v.subtract( this.center );
    var c = this.Rend;

    if( (a.y * b.x - a.x * b.y) * (a.y * c.x - a.x * c.y) < 0 )
    {
      // b is "outside" small triangle AC
      return false;
    }
    else
    {
      // b is "inside" small triangle AC
      return true;
    }
  }
}


class Ellipse
{
  constructor( center, minor, major, start, end, clockwise )
  {
    this.center = center;
    this.minor = minor;
    this.major = major;
    this.start = start;
    this.end = end;
    this.clockwise = clockwise;
  }
  toEllipseTask( id, paint )
  {

    var start_vec = (new Line( this.center, this.start )).rotate( -this.major.angle );
    var end_vec = (new Line( this.center, this.end )).rotate( -this.major.angle );

    var ends = [ this.center.add( this.minor ), this.center.add( this.major ) ];
    var angles = [ 0, Math.PI * 2 ];
    if( this.clockwise )
      var angles = [ 0, -Math.PI * 2 ];
    var task = new EllipseTask( id, ends, angles, this.center, this.clockwise, false, paint );

    var start_angle = task.EllipseAngle( this.start, start_vec.angle );
    var end_angle = task.EllipseAngle( this.end, end_vec.angle );
    task.start_angle = start_angle;
    task.end_angle = end_angle;
    delete task.calculated_length;

    return task;
  }

  cross_with_circle_on_same_focal_line( circle_center, circle_radius, sort_by_this_point )
  {
    var new_circle_center = circle_center.subtract( this.center ).rotate( -this.major.angle );

    var Cx = new_circle_center.x;
    var Cx2 = Cx * Cx;
    var a2 = Math.pow( this.major.length, 2 );
    var b2 = Math.pow( this.minor.length, 2 );
    var r2 = circle_radius * circle_radius;

    var a = b2 / a2 - 1;
    var b = 2 * Cx;
    var c = -b2 - Cx2 + r2;

    var new_x1 = (-b + math.sqrt( b * b - 4 * a * c )) / (2 * a);
    var new_x2 = (-b - math.sqrt( b * b - 4 * a * c )) / (2 * a);

    var new_y1 = math.sqrt( r2 - Math.pow( new_x1 - Cx, 2 ) );
    var new_y2 = math.sqrt( r2 - Math.pow( new_x2 - Cx, 2 ) );

    var crosses = [ ];
    if( !new_x1.im && !new_y1.im )
    {
      crosses.push( (new Vector( new_x1, new_y1 )).rotate( this.major.angle ).add( this.center ) );
      crosses.push( (new Vector( new_x1, -new_y1 )).rotate( this.major.angle ).add( this.center ) );
    }
    if( !new_x2.im && !new_y2.im )
    {
      crosses.push( (new Vector( new_x2, new_y2 )).rotate( this.major.angle ).add( this.center ) );
      crosses.push( (new Vector( new_x2, -new_y2 )).rotate( this.major.angle ).add( this.center ) );
    }

    crosses.forEach( c => {
      c.d = c.dist_to_point( sort_by_this_point );
    } );
    crosses = crosses.sort_objects( "d" );

    return crosses;

  }

  /**
   * Returns the circumference of the full ellipsis.
   * @param {float} a Half Major Axis
   * @param {flaot} b Half Minor Axis
   * @returns {float} Circumference
   */
  static Circumference( a, b )
  {
    // Full ellipse
    if( b / a < 10 )
    {
      return Ellipse.Circumference1(a, b);
    }
    else
    {
      // Method: AGM algorithm contributed by Charles Karney
      return Ellipse.Circumference2(a, b);
    }
  }

  /**
   * Returns the circumference of the full ellipsis.
   * <br>Method: Ramanujan second approximation
   * @param {float} a Half Major Axis
   * @param {flaot} b Half Minor Axis
   * @returns {float} Circumference
   */
  static Circumference1( a, b )
  {
    if( b / a < 10 )
    {
      const h = Math.pow( (a - b), 2 ) / Math.pow( (a + b), 2 );
      return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt( 4 - 3 * h )));
    }
    else
    {
      throw "Bad method for given a and b. Try AGM algoritm instead.";
    }
  }

  /**
   * Returns the circumference of the full ellipsis.
   * <br>Method: AGM algorithm contributed by Charles Karney
   * @see http://paulbourke.net/geometry/ellipsecirc/python.code
   * @param {float} a Half Major Axis
   * @param {flaot} b Half Minor Axis
   * @returns {float} Circumference
   */
  static Circumference2( a, b )
  {
    let x = Math.max( a, b );
    let y = Math.min( a, b );
    let digits = 53;
    let tol = Math.sqrt( Math.pow( 0.5, digits ) );
    if( digits * y < tol * x )
      return 4 * x;
    let s = 0;
    let m = 1;
    while( x - y > tol * y )
    {
      x = 0.5 * (x + y);
      y = Math.sqrt( x * y );
      m *= 2;
      s += m * Math.pow( x - y, 2 );
    }
    return Math.PI * (Math.pow( a + b, 2 ) - s) / (x + y);
  }

}

class Ellipse3Minor extends Ellipse
{
  constructor( center, minor, start, end, clockwise )
  {
    var major_angle = minor.angle + Math.PI / 2;
    var B_0 = start.subtract( center );
    var B_0_a0 = B_0.rotate( -major_angle ); // Rotate CCW
    //var a_0 = -B_0_a0.angle;
    var a_0 = math.asin( Math.abs( B_0_a0.y ) / minor.length );

    var major_length = B_0_a0.x / math.cos( a_0 );
    var minor_length = B_0_a0.y / math.sin( a_0 );

    var major = (new Vector( -major_length, 0 )).rotate( major_angle );
    var minor = (new Vector( minor_length, 0 )).rotate( major_angle + Math.PI / 2 );

    super( center, minor, major, start, end, clockwise );

  }
}

class Ellipse2MinorGuide extends Ellipse
{
  constructor( start, end, minorGuide, clockwise ) // minorGuide = line from middle between goals to minor length out perpendicular to line between goals
  {
    var major_angle = -(minorGuide.angle + Math.PI / 2);
    var middle_point = minorGuide.start;

    var b = minorGuide.length;
    var p1 = start.subtract( middle_point ).rotate( major_angle );
    var p2 = end.subtract( middle_point ).rotate( major_angle );

    var sqrt = math.sqrt;
    var x_1 = p1.x;
    var y_1 = p1.y;
    var x_2 = p2.x;
    var y_2 = p2.y;


    var y12 = y_1 * y_1;
    var bb = b * b;
    var bby12 = bb - y12;

    var h1, h2;
    if( (2 * (1 / (bby12) - 1 / (bby22))) === 0 )
      h1 = h2 = 0;
    else if( y_1.veryclose( y_2 ) )
      h1 = h2 = 0;
    else
    {
      var y22 = y_2 * y_2;
      var x12 = x_1 * x_1;
      var x22 = x_2 * x_2;
      var bby22 = bb - y22;
      var insqrt = (4 * x12) / ((bby12) * (bby22)) - (8 * x_2 * x_1) / ((bby12) * (bby22)) + (4 * x22) / ((bby12) * (bby22));
      h1 = ((2 * x_1) / (bby12) - sqrt( insqrt ) - (2 * x_2) / (bby22)) / (2 * (1 / (bby12) - 1 / (bby22)));
      h2 = ((2 * x_1) / (bby12) + sqrt( insqrt ) - (2 * x_2) / (bby22)) / (2 * (1 / (bby12) - 1 / (bby22)));
    }

    var h = h1;
    if( Math.abs( h2 ) < Math.abs( h1 ) )
      h = h2;

    var a = math.abs( b * sqrt( ((x_1 - h) * (x_1 - h)) / (bby12) ) );

    var center = (new Vector( h1, 0 )).rotate( -major_angle ).add( middle_point );
    var minor = (new Vector( 0, -b )).rotate( -major_angle );
    var major = (new Vector( -a, 0 )).rotate( -major_angle );

    super( center, minor, major, start, end, clockwise );
    //super( center, minor, start, end, clockwise );
  }
}

class BezierCurve
{
  static From2pointsAndCurvature( p0, start_curvature, start_clockwise, start_direction, p3, end_curvature, end_clockwise, end_direction, smooth_distance )
  {
    if( start_curvature.veryclose( 0 ) && end_curvature.veryclose( 0 ) && Math.abs( (start_direction - end_direction).normalizeAnglePlusMinus ) < 0.01 )
      return BezierCurve.From2Points0Curvature( p0, p3 );
    let start_radius = 1 / start_curvature;
    let end_radius = 1 / end_curvature;
    let S = new Vector( 0, 0 );
    if( start_radius > 0 )
    {
      let O = Math.PI * 2 * start_radius;
      let radians = (smooth_distance / O) * Math.PI * 2;
      S = new Vector( -start_radius * Math.cos( radians * (start_clockwise ? -1 : 1) ), -start_radius * Math.sin( radians * (start_clockwise ? -1 : 1) ) );
    }
    let E = new Vector( 0, 0 );
    if( end_radius > 0 )
    {
      let O = Math.PI * 2 * end_radius;
      let radians = (smooth_distance / O) * Math.PI * 2;
      E = new Vector( -end_radius * Math.cos( radians * (end_clockwise ? -1 : 1) ), -end_radius * Math.sin( radians * (end_clockwise ? -1 : 1) ) );
    }

    let p0_p = p0.multiply( 1 / 3 );
    let s_p = S.divide( -18 );
    let p3_p = p3.multiply( 2 / 3 );
    let e_p = E.divide( -9 );

    let p2 = p0_p.add( s_p ).add( p3_p ).add( e_p );
    let p1 = p2.multiply( 2 ).subtract( p3 ).add( E.divide( 6 ) );

    let p1d = new Vector( (new Line( p0, p1 )).length.abslimit( smooth_distance / 2 ), 0 ).rotate( start_direction );
    let p2d = new Vector( -(new Line( p3, p2 )).length.abslimit( smooth_distance / 2 ), 0 ).rotate( end_direction );

    p2 = p3.add( p2d );
    p1 = p0.add( p1d );

    if( true )
    {
      let l1 = new Line( p0, p1 );
      let l2 = new Line( p2, p3 );
      let cross = l1.cross_with_line( l2 );

      let l1c = new Line( p0, cross );
      let l2c = new Line( p3, cross );
      if( l1c.length < l1.length )
        p1 = cross;
      if( l2c.length < l2.length )
        p2 = cross;
    }




    return new BezierCurve( [ p0, p1, p2, p3 ] );
  }
  static From2Points0Curvature( p0, p3 )
  {
    let g1 = (new Line( p0, p3 )).as_vector.divide( 3 );
    let p1 = p0.add( g1 );
    let p2 = p1.add( g1 );
    return new BezierCurve( [ p0, p1, p2, p3 ] );
  }
  constructor( control_points )
  {
    this.cp = control_points;
  }
  toBezierTask( id, paint )
  {
    return new CubicBezierTask( id, this.cp, false, paint );
  }
}
