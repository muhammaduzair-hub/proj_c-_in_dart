/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global math, split_controller, robot_controller */

class FitCurve
{
  constructor( data )
  {
    this.data = data.map( ( p ) => {
      return p.toArray();
    } );

    this.offset = math.mean( this.data, 0 );
    this.points = this.data.copy().map( ( p ) => {
      return math.subtract( p, this.offset );
    } );

    this.ends = [ ];
  }

  rotMatrix( angle )
  {
//    angle = angle.deg2rad();
    return [ [ math.cos( angle ), -math.sin( angle ) ], [ math.sin( angle ), math.cos( angle ) ] ];
  }
}

class FitPolynomial extends FitCurve
{
  constructor( data, order )
  {
    super( data );
    this.order = parseInt( (order) );
    this.R = this.rotMatrix( 0.0 );
    this.line_fit();
  }

  pca( data = this.points)
  {
    /*
     * Principal Component Analysis
     */
    var A = math.multiply( math.transpose( data ), data );
    var E = math.eig( A );
    var lam = E.lambda.x;
    var eig = E.E.x;

    if( lam[0] < lam[1] )
      eig = eig.fliplr();

    return eig;
  }

  line_fit()
  {
    this.eig = this.pca();

    if( this.points.length < this.order + 1 )
    {
      throw "Insufficient data for given order";
      return;
    }


    try
    {
      this.points = math.multiply( this.points, this.eig );
      this.x = [ ];
      this.y = [ ];

      for( var n = 0; n < this.points.length; n++ )
      {
        let xs = [ ];
        for( var o = 0; o < this.order + 1; o++ )
        {
          xs.push( math.pow( this.points[n][0], o ) );
        }
        this.x.push( xs );
        this.y.push( this.points[n][1] );
      }

      this.B = math.multiply( math.multiply( math.inv( math.multiply( math.transpose( this.x ), this.x ) ), math.transpose( this.x ) ), this.y );
    }
    catch( e )
    {
      console.warn( "Encountered exception", e, "Changing Rotation" );
      this.R = this.rotMatrix( -math.pi / 2 );
      this.line_fit();
    }

  }

  sample_line()
  {
    var x_start, x_stop, y, o, samples;

    samples = [ ];

    x_start = math.min( this.points, 0 )[0];
    x_stop = math.max( this.points, 0 )[0];

    y = 0.0;
    for( o = 0; o < this.order + 1; o++ )
    {
      y = y + math.pow( x_start, o ) * this.B[o];
    }

    samples.push( [ x_start, y ] );

    y = 0.0;
    for( o = 0; o < this.order + 1; o++ )
    {
      y = y + math.pow( x_stop, o ) * this.B[o];
    }

    samples.push( [ x_stop, y ] );

    this.ends = math.multiply( samples, math.inv( this.eig ) ).map( ( row ) => {
      return math.add( row, this.offset ).toVector();
    } );

    if( this.ends[0].dist_to_point( this.data[0].toVector() ) > this.ends.last().dist_to_point( this.data[0].toVector() ) )
      this.ends.reverse();
  }

}

class FitLine extends FitPolynomial
{
  constructor( data )
  {
    super( data, 1 );
  }

  getLineTask( id, reverse, paint )
  {
    this.sample_line();
    return new LineTask( id, this.ends, reverse, paint );
  }
}

class FitCircle extends FitCurve
{
  constructor( data )
  {
    super( data );

    // Scale for numerical stability
    this.scale = math.max( math.abs( this.points ) );
    this.points = this.points.map( ( p ) => {
      return math.divide( p, this.scale );
    } );
  }

  circle_fit()
  {
    if( this.points.length < 2 )
      throw "Too few points to fit circle";

    else if( this.points.length === 2 )
      this.fit2points();

//    else if( this.points.length === 3 )
//      this.fit3points();

    else if( this.points.length > 2 )
      this.fitNpoints();

  }

  fit2points()
  {
    this.ends = this.data.copy().map( ( p ) => {
      return p.toVector();
    } );
  }

  fit3points()
  {
    this.ends = this.data.copy().map( ( p ) => {
      return p.toVector();
    } );
  }

  fitNpoints()
  {
    // Init optimization
    this.u = [ 0.0, 0.0, 1.0 ]; // Maybe init with 3 random points?
    this.J = [ ];

    var res_old = 0.0;
    var res = 1.0;
    var break_cnt = 0;
    while( math.abs( res - res_old ) >= math.pow( 10, -20 ) )
    {
      var residual = this.getResidual();
      res_old = res;
      res = math.sum( math.abs( residual ) );
      this.updateJ();

      try
      {
        let A, B, C, D, E;
        A = math.multiply( math.transpose( this.J ), this.J );
        B = math.inv( A );
        C = math.multiply( B, math.transpose( this.J ) );
        D = math.multiply( C, residual );
        E = math.flatten( math.multiply( 1.0, D ) );
        this.u = math.add( this.u, E );
      }
      catch( e )
      {
        throw "Error fitting N points: " + e;
      }

      break_cnt += 1;
      if( break_cnt > 500 )
      {
        console.log( "Breaking from circle fit" );
        break;
      }
    }

    this.center = this.u.slice( 0, 2 );
    this.radius = math.abs( this.u[2] );

    this.center = this.center.toVector();
    this.radius = new Vector( this.radius, 0 );

    this.center = this.center.multiply( this.scale );
    this.radius = this.radius.multiply( this.scale );

    this.center = this.center.add( this.offset.toVector() );

    this.ends = [ ];
    this.ends.push( this.center.add( this.radius ) );
    this.ends.push( this.center.subtract( this.radius ) );
  }

  getResidual()
  {
    var r = [ ];
    this.center = this.u.slice( 0, 2 );
    this.radius = this.u[2];
    for( var n = 0; n < this.points.length; n++ )
    {
      r.push( [ math.pow( this.points[n][0] - this.u[0], 2 ) + math.pow( this.points[n][1] - this.u[1], 2 ) - math.pow( this.u[2], 2 ) ] );
    }
    return r;
  }

  updateJ()
  {
    for( var n = 0; n < this.points.length; n++ )
    {
      this.J[n] = [
        2.0 * this.points[n][0] - 2.0 * this.u[0],
        2.0 * this.points[n][1] - 2.0 * this.u[1],
        2.0 * this.u[2]
      ];
    }
  }

  getCircleTask( id, clockwise, reverse, paint )
  {
    this.circle_fit();
    return new ArcTask( id, this.ends, undefined, clockwise, reverse, paint );
  }
}

class FitSpline extends FitCurve
{
  constructor( data )
  {
    super( data );

    this.x = [ ];
    this.y = [ ];
    this.x_min = 0;
    this.y_min = 0;
    this.lsq_spl = false;
    this.uni_spl = false;
    this.interpolated = false;
    this.spl_x, this.spl_y;
    this.rawLength = 0.0;

  }
}

class FitBSpline extends FitCurve
{
  constructor( data, control_distance = 10, closed = false)
  {
    super( data );
    this.knots = [ ];
    this.closed = false;
    this.degree;
    this.domain;
    this.control_distance = control_distance;
  }

  spline_fit()
  {
    var e = this.data.map( ( p ) => {
      return p.toVector();
    } );

    // Add extra control points, §5.1
    if( this.control_distance >= 0 )
    {
      var tmpe = [ ];
      for( var i = 0; i < e.length - 1; i++ )
      {
        tmpe.push( e[i] );

        if( e[i].dist_to_point( e[i + 1] ) > (i === 0 ? 1 : 2) * this.control_distance )
//        if( e[i].dist_to_point( e[i + 1] ) > this.control_distance )
          tmpe.push( new Line( e[i], e[i + 1] ).unit_vector.multiply( this.control_distance ).add( e[i] ) );

        if( e[i].dist_to_point( e[i + 1] ) > (i === e.length - 1 ? 1 : 2) * this.control_distance )
//        if( e[i].dist_to_point( e[i + 1] ) > this.control_distance )
          tmpe.push( new Line( e[i + 1], e[i] ).unit_vector.multiply( this.control_distance ).add( e[i + 1] ) );

      }
      tmpe.push( e[i] );

      // Override e with new e's
      e = tmpe;
    }

    this.degree = e.length < 4 ? 2 : 3;
    if( this.closed )
    {
      // https://github.com/thibauts/b-spline
      for( var i = 0; i < this.degree + 1; i++ )
      {
        e.push( e[i] );
      }
    }
    this.domain = [ this.degree, e.length ];

    // Find knots from definition
    var j = 0;
    for( var i = 0; i < e.length + this.degree + 1; i++ )
    {
      if( !this.closed )
      {
        // Clamp to ends
        if( i < this.domain[0] )
          j = this.domain[0];
        else if( i > this.domain[1] )
          j = this.domain[1];
        else
          j = i;
      }
      else
      {
        // Create uniform knot vector
        j = i;
      }
      this.knots.push( j );
    }

    // Normalize knots
    var first = this.knots[0].copy();
    var factor = this.knots.last().copy() - first;
    this.knots = this.knots.map( ( k ) => {
      return (k - first) / factor;
    } );

    this.ends = e;

  }

  getSplineTask( id, reverse, paint )
  {

    if( this.data.length < 3 )
      return new LineTask( id, this.data.map( ( p ) => {
        return p.toVector();
      } ), reverse, paint );

    this.spline_fit();

    // Create SplineTask
    var new_spline = new SplineTask( id, this.ends, this.knots, this.degree, this.closed, reverse, paint );
    if( !robot_controller.robot_has_capability( "spline_v2_task" ) && new_spline.length < 2 * split_controller.legacy_robot_spline_stepsize )
      return new LineTask( id, this.ends, reverse, paint );
    else
      return new_spline;
  }
}