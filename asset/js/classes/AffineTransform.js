class AffineTransform
{
    /**
     * @param  {Vector3[]} original_points
     * @param  {Vector3[]} new_points
     */
    constructor(original_points, new_points)
    {
        this.from_points = new_points;
        this.to_points = original_points;
        this.terms = {};

        if(this.from_points || this.to_points)
          this.filter();
    }

    filter()
    {
        const invalid_from_points = this.from_points.map((p,idx)=>p===undefined ? idx : -1).filter(p=>p>-1);
        const invalid_to_points = this.to_points.map((p,idx)=>p===undefined ? idx : -1).filter(p=>p>-1);

        const invalid_points = invalid_from_points.concat(invalid_to_points);
        this.from_points = this.from_points.filter((_,idx)=>invalid_points.indexOf(idx) < 0);
        this.to_points = this.to_points.filter((_,idx)=>invalid_points.indexOf(idx) < 0);

        return this;
    }

    sort()
    {
        this.from_points = sort_points_in_polygon(this.from_points, this.to_points);
        return this;
    }

    findTerms()
    {
        if( this.from_points.length !== this.to_points.length )
            throw "Fixpoint arrays length does not match";

        if( this.from_points.length === 3)
            this.terms = this.terms3Points;
        else if( this.from_points.length > 3 )
            this.terms = this.terms3Points;
        else
            throw "Incorrect amount of fixpoints";

        return this;
    }
    /**
     * @param  {boolean} remove_infinite=true
     */
    PROJString(remove_infinite = true)
    {
        const t = this.terms;

        const formatNumber = x => Number.parseFloat(x).toFixed(9);
    
        let projection = "+proj=affine";
        if (t.xoff && !(Math.abs(t.xoff) === Infinity && remove_infinite))
          projection += ` +xoff=${formatNumber(t.xoff)}`;
        if (t.yoff && !(Math.abs(t.yoff) === Infinity && remove_infinite))
          projection += ` +yoff=${formatNumber(t.yoff)}`;
        if (t.zoff && !(Math.abs(t.zoff) === Infinity && remove_infinite))
          projection += ` +zoff=${formatNumber(t.zoff)}`;
        if (t.s11 && !(Math.abs(t.s11) === Infinity && remove_infinite))
          projection += ` +s11=${formatNumber(t.s11)}`;
        if (t.s12 && !(Math.abs(t.s12) === Infinity && remove_infinite))
          projection += ` +s12=${formatNumber(t.s12)}`;
        if (t.s13 && !(Math.abs(t.s13) === Infinity && remove_infinite))
          projection += ` +s13=${formatNumber(t.s13)}`;
        if (t.s21 && !(Math.abs(t.s21) === Infinity && remove_infinite))
          projection += ` +s21=${formatNumber(t.s21)}`;
        if (t.s22 && !(Math.abs(t.s22) === Infinity && remove_infinite))
          projection += ` +s22=${formatNumber(t.s22)}`;
        if (t.s23 && !(Math.abs(t.s23) === Infinity && remove_infinite))
          projection += ` +s23=${formatNumber(t.s23)}`;
        if (t.s31 && !(Math.abs(t.s31) === Infinity && remove_infinite))
          projection += ` +s31=${formatNumber(t.s31)}`;
        if (t.s32 && !(Math.abs(t.s32) === Infinity && remove_infinite))
          projection += ` +s32=${formatNumber(t.s32)}`;
        if (t.s33 && !(Math.abs(t.s33) === Infinity && remove_infinite))
          projection += ` +s33=${formatNumber(t.s33)}`;

        return projection;
    }

    get Projector()
    {
      if(Object.keys(this.terms).length === 0)
        this.findTerms();

      return Projector(this.PROJString(), "+proj=affine");
    }

    setTranslation(translation)
    {
      if(translation.x)
        this.terms.xoff = translation.x;
      if(translation.y)
        this.terms.yoff = translation.y;
      if(translation.z)
        this.terms.zoff = translation.z;

      return this;
    }

    setRotation(rotation)
    {
      this.terms.s11 = math.cos(rotation);
      this.terms.s12 = -math.sin(rotation);
      this.terms.s21 = math.sin(rotation);
      this.terms.s22 = math.cos(rotation);

      return this;
    }

    get terms3Points()
    {
        // Math: https://www.mathematica-journal.com/2011/06/27/a-symbolic-solution-of-a-3d-affine-transformation/
        // Output like: https://proj.org/operations/transformations/affine.html
      
        const P = this.from_points;
        const p = this.to_points;
      
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
      }
}