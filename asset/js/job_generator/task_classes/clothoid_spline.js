/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Infinity, Fresnel */

class ClothoidSpline
{

  constructor( edgePoints, options )
  {

    this.verbose = false;

    this.const = {
      NUM_FRESNEL_ITERATIONS: 15,
      CURV_FACTOR: Math.sqrt( Math.PI / 2.0 ),

      MIN_CURVATURE_SLOPE: 0.0075 / 10,
      MIN_DISTANCE_FROM_ZERO: 0.005,

      DEFAULT_CLOTHOID_PENALTY: 0.05,
      DEFAULT_G1DISCONT_CURVTHRESH: 0.01,
      DEFAULT_ENDPOINT_WEIGHT: 1.0,
      MIN_LENGTH: 2
    };
    const {
      NUM_FRESNEL_ITERATIONS,
      CURV_FACTOR,

      MIN_CURVATURE_SLOPE,
      MIN_DISTANCE_FROM_ZERO,

      DEFAULT_CLOTHOID_PENALTY,
      DEFAULT_G1DISCONT_CURVTHRESH,
      DEFAULT_ENDPOINT_WEIGHT,
      MIN_LENGTH
    } = this.const;


    if( edgePoints.length < MIN_LENGTH )
      throw "Too few ends, must have minimum " + MIN_LENGTH;
    this.edgePointSet = edgePoints;

    if( options === undefined )
      options = {};
    let {

      // Penalty for each linear curvature piece
      penalty = DEFAULT_CLOTHOID_PENALTY,

      // Inversely scale penalty with input size?
      penalty_scale = false,

      // Use only clothoid type curves for clothoid generation
      using_only_clothoid = false,

      // Allow use of G3 continuities
      using_G3 = false,

      // Allow use of G1 discontinuities
      using_G1 = false,

      // Curve threshold for G1 discontinuities
      g1discontCurvThresh = DEFAULT_G1DISCONT_CURVTHRESH,

      // Endpoint weight
      endPointWeight = DEFAULT_ENDPOINT_WEIGHT,

      // Is clothoid closed?
      using_closed = false
    } = options;

    if( penalty_scale )
      penalty = penalty * 50 / this.edgePointSet.length;

//    this.options = {
//      penalty: penalty,
//      using_only_clothoid: using_only_clothoid,
//      using_G3: using_G3,
//      using_G1: using_G1,
//      g1discontCurvThresh: g1discontCurvThresh,
//      endPointWeight: endPointWeight,
//      using_closed: using_closed
//    };

    // Steps:
    // 0 - close curve (make startpt=lastpt)
    // 1 - construct curvature plot of sketched edge
    // 2 - fit small number of connected line segments
    //     across entire plot (attempting to minimize error)
    // 3 - Flatten slope of line segments whose slope below threshold
    // 4 - Find transformation (translation and rotation) that produces
    //     the best fit between clothoid spline and sketched pointset

    // project to XZ plane
//    this.edgePointSet = this.edgePointSet.map( p => new Vector3( p.x, 0.0, p.y ) );

    // 0 - close curve (make startpt=lastpt)
    // close if not closed
    if( using_closed )
    {
      if( this.edgePointSet[this.edgePointSet.length - 1].subtract( this.edgePointSet[0] ).length <
        this.edgePointSet[this.edgePointSet.length - 2].subtract( this.edgePointSet[this.edgePointSet.length - 1] ).length )
        this.edgePointSet.pop();

      this.edgePointSet.push( this.edgePointSet[0] );
    }
    else
    {
      if( this.edgePointSet[0] === this.edgePointSet[this.edgePointSet.length - 1] )
        this.edgePointSet.pop();
    }

    var eachArcLength = 0.0;
    this.arcLength = [ ];
    for( let i = 0; i < this.edgePointSet.length; i++ )
    {
      this.arcLength.push( eachArcLength );

      if( i < this.edgePointSet.length - 1 )
      {
        eachArcLength += this.edgePointSet[i + 1].subtract( this.edgePointSet[i] ).length;
      }
    }

    // 1 - Curvature estimation:
    this.estCurv = this.getCurvatures( this.edgePointSet );

    // 2 - fit small number of connected line segments
    //		across entire plot (attempting to minimize error)
    //		using dynamic programming approach

    const errorMatrix = new Array( this.edgePointSet.length );
    const walkMatrix = new Array( this.edgePointSet.length );
    const AMatrix = new Array( this.edgePointSet.length );
    const BMatrix = new Array( this.edgePointSet.length );

    for( let i = 0; i < this.edgePointSet.length; i++ )
    {
      errorMatrix[i] = new Array( this.edgePointSet.length ).fill( 0.0 );
      walkMatrix[i] = new Array( this.edgePointSet.length ).fill( -1 );
      AMatrix[i] = new Array( this.edgePointSet.length ).fill( 0.0 );
      BMatrix[i] = new Array( this.edgePointSet.length ).fill( 0.0 );
    }

    //populate first diagonal (cost of line segment between neighbouring points)
    const eachSegmentCost = penalty;
    for( let i = 0; i + 1 < this.edgePointSet.length; i++ )
    {
      errorMatrix[i][i + 1] = eachSegmentCost;
      const points = new Array( 2 );
      points[0] = new Vector( this.arcLength[i], this.estCurv[i] );
      points[1] = new Vector( this.arcLength[i + 1], this.estCurv[i + 1] );

      [ AMatrix[i][i + 1], BMatrix[i][i + 1] ] = this.HeightLineFit2( 2, points, AMatrix[i][i + 1], BMatrix[i][i + 1] );
    }

    // iterate through remaining diagonals
    for( let j = 2; j < this.edgePointSet.length; j++ )
    {
      for( let i = 0; i + j < this.edgePointSet.length; i++ )
      {

        //do linear regression on segments between i and i+j inclusive
        //if that error + penalty for segment is less than
        //	sum of errors [i][i+j-1] and [i+1][i+j], then use
        //	that
        //otherwise, use sum of [i][i+j-1] and [i+1][i+j]

        const points = new Array( j + 1 );
        for( let each = i; each <= i + j; each++ )
        {
          points[each - i] = new Vector( this.arcLength[each], this.estCurv[each] );
        }

        [ AMatrix[i][i + j], BMatrix[i][i + j] ] = this.HeightLineFit2( j + 1, points, AMatrix[i][i + j], BMatrix[i][i + j] );
        const fitError = this.getFitErrors( j + 1, points, AMatrix[i][i + j], BMatrix[i][i + j] );

        var minError = fitError + eachSegmentCost;
        var minIndex = -1;

        for( let each = i + 1; each < i + j; each++ )
        { //check each partitioning at this level
          if( errorMatrix[i][each] + errorMatrix[each][i + j] < minError )
          {
            minIndex = each;
            minError = errorMatrix[i][each] + errorMatrix[each][i + j];
          }
        }

        walkMatrix[i][i + j] = minIndex;
        errorMatrix[i][i + j] = minError;
      }
    }

    // use walk matrix and determine partitions
    let segmentEnd = new Array( this.edgePointSet.length ).fill( false );
    segmentEnd = this.recurseThroughWalkMatrix( walkMatrix, 0, this.edgePointSet.length - 1, segmentEnd );

    // intersect linear regressed lines
    var endIndex;
    var endNextIndex;

    for( let j = 1; j < this.edgePointSet.length; j++ )
    {
      if( segmentEnd[j] )
      {
        endIndex = j;
        break;
      }
    }
    this.segmentPointSet = [ new Vector( 0.0, BMatrix[0][endIndex] ) ];
    for( let i = 0; i < this.edgePointSet.length - 1; i++ )
    {
      if( segmentEnd[i] )
      {
        for( let j = i + 1; j < this.edgePointSet.length; j++ )
        {
          if( segmentEnd[j] )
          {
            endIndex = j;
            break;
          }
        }

        const A1 = AMatrix[i][endIndex];
        const B1 = BMatrix[i][endIndex];

        endNextIndex = endIndex;
        for( let j = endIndex + 1; j < this.edgePointSet.length; j++ )
        {
          if( segmentEnd[j] )
          {
            endNextIndex = j;
            break;
          }
        }

        if( endNextIndex > endIndex )
        { //this is an intersection between two lines

          const A2 = AMatrix[endIndex][endNextIndex];
          const B2 = BMatrix[endIndex][endNextIndex];

          const xintersect = (B2 - B1) / (A1 - A2);
          const yintersect = A1 * xintersect + B1;

          this.segmentPointSet.push( new Vector( xintersect, yintersect ) );
        }
        else
        { //this is the last line (hence no intersection)

          this.segmentPointSet.push( new Vector( this.arcLength[this.edgePointSet.length - 1], A1 * this.arcLength[this.edgePointSet.length - 1] + B1 ) );
          break;
        }
      }
    }

    //some intersection points "overshoot" (causing the linearly interpolated
    //this.segmentPointSet) not to be a function any more, we have to go through
    //and remove these points
    var foundOvershoot;
    do
    {
      foundOvershoot = false;
      for( let i = 1; i < this.segmentPointSet.length - 1; i++ )
      {
        if( (this.segmentPointSet[i].x > this.segmentPointSet[i + 1].x && this.segmentPointSet[i].x > this.segmentPointSet[i - 1].x) ||
          (this.segmentPointSet[i].x < this.segmentPointSet[i - 1].x && this.segmentPointSet[i].x < this.segmentPointSet[i + 1].x) )
        {
          this.segmentPointSet.splice( i, 1 );
          foundOvershoot = true;
          break;
        }
      }
    }
    while( foundOvershoot );

    // 3 - Flatten slope of line segments whose slope is below threshold

    for( let i = 0; i < this.segmentPointSet.length - 1; i++ )
    {

      //turn clothoid into circle segment if slope is low enough
      if( Math.abs( this.segmentPointSet[i + 1].y - this.segmentPointSet[i].y ) < MIN_CURVATURE_SLOPE && !using_only_clothoid )
      {
        var midpoint = (this.segmentPointSet[i].y + this.segmentPointSet[i + 1].y) / 2.0;

        this.segmentPointSet[i].y = midpoint;
        this.segmentPointSet[i + 1].y = midpoint;
      }

      //turn circle segment into line segment if close enough to x-axis
      if( this.segmentPointSet[i + 1].y === this.segmentPointSet[i].y && Math.abs( this.segmentPointSet[i].y ) < MIN_DISTANCE_FROM_ZERO && !using_only_clothoid )
      {
        this.segmentPointSet[i].y = 0.0;
        this.segmentPointSet[i + 1].y = 0.0;
      }
    }

    // 3.5 - Close clothoid (if desired)
    if( using_closed )
    {
      //SnapClosed();
      //ConvergeEndpointsToTouch();

      //add patch piece
      const newLastPiece = this.segmentPointSet[this.segmentPointSet.length - 1];
      this.segmentPointSet[this.segmentPointSet.length - 1] = newLastPiece.add( this.segmentPointSet[this.segmentPointSet.length - 2] ).multiply( 0.5 );
      this.segmentPointSet.push( newLastPiece );
    }

    // 4 - Find transformation (translation and rotation) that produces
    //		the best fit between clothoid spline and sketched pointset

    this.g1ClothoidVec = [ ];
    if( using_G1 )
    {

      // 1. Determine segmentation regions (curvature spikes)

      var discontThreshold = g1discontCurvThresh;
      var lastIndex = 0;

      for( let i = 1; i < this.estCurv.length - 1; i++ )
      {
        if( (Math.abs( this.estCurv[i] - this.estCurv[i - 1] ) > discontThreshold && // THIS ONE USES CURVATURE VARIATION
          Math.abs( this.estCurv[i + 1] - this.estCurv[i] ) > discontThreshold) ||
          (i === this.estCurv.length - 2 &&
            this.g1ClothoidVec.length > 0) )
        {

          const eachClothoidPointSet = [ ];

          if( i === this.estCurv.length - 2 )
          {
            i = this.estCurv.length - 1;
          }

          for( let j = lastIndex; j <= i; j++ )
            eachClothoidPointSet.push( this.edgePointSet[j] );

          //2. Create a series of sub-clothoids
          const eachClothoid = new ClothoidSpline( eachClothoidPointSet, penalty, using_G3, using_G1, using_only_clothoid, g1discontCurvThresh, endPointWeight );
          this.g1ClothoidVec.push( eachClothoid );

          lastIndex = i;
        }
      }

      //3. Interconnect series of sub-clothoids by performing translations

      if( this.g1ClothoidVec.length > 0 )
      {

        for( let i = 0; i < this.g1ClothoidVec.length - 1; i++ )
        {

          const curClothoid = this.g1ClothoidVec[i];
          const nextClothoid = this.g1ClothoidVec[i + 1];

          const curClothoidEnd = curClothoid.getEndPoint();
          const nextClothoidBegin = nextClothoid.getStartPoint();

          nextClothoid.fitTranslate = nextClothoid.fitTranslate.add( curClothoidEnd.subtract( nextClothoidBegin ) );
        }
      }
    }

    if( using_G3 && this.g1ClothoidVec.length > 0 )
    {
      /*
       * G3 continuity feature
       */

      for( let i = 0; i < this.segmentPointSet.length - 2; i++ )
      {

        const segmentSlope = ((this.segmentPointSet[i + 1].y - this.segmentPointSet[i].y) / (this.segmentPointSet[i + 1].x - this.segmentPointSet[i].x));
        const nextSegmentSlope = ((this.segmentPointSet[i + 2].y - this.segmentPointSet[i + 1].y) / (this.segmentPointSet[i + 2].x - this.segmentPointSet[i + 1].x));

        var blend_distance = 5.0;
        if( (this.segmentPointSet[i + 1].x - this.segmentPointSet[i].x) / 2.0 < blend_distance )
          blend_distance = (this.segmentPointSet[i + 1].x - this.segmentPointSet[i].x) / 2.0;
        if( (this.segmentPointSet[i + 2].x - this.segmentPointSet[i + 1].x) / 2.0 < blend_distance )
          blend_distance = (this.segmentPointSet[i + 2].x - this.segmentPointSet[i + 1].x) / 2.0;

        const newBeforePoint = new Vector( this.segmentPointSet[i + 1].x - blend_distance, this.segmentPointSet[i + 1].y + segmentSlope * (-blend_distance) ); // Rewrite: Removed z (0.0)
        const newAfterPoint = new Vector( this.segmentPointSet[i + 1].x + blend_distance, this.segmentPointSet[i + 1].y + nextSegmentSlope * blend_distance ); // Rewrite: Removed z (0.0)

        const point = this.segmentPointSet[i + 1];

        this.segmentPointSet.splice( i + 1, 1, newBeforePoint, newAfterPoint );

        var numPointsAdded = 1;

        for( let j = blend_distance; j >= 0.0; j -= 0.2 )
        {
          const startLine = new Vector( point.x - blend_distance + j, point.y + segmentSlope * (-blend_distance + j) ); // Rewrite: Removed z (0.0)
          const endLine = new Vector( point.x + j, point.y + nextSegmentSlope * j ); // Rewrite: Removed z (0.0)
          const interp = j / blend_distance;

          const eachCurv = startLine.y * (1.0 - interp) + endLine.y * interp;
          const nextXval = startLine.x * (1.0 - interp) + endLine.x * interp;

          this.segmentPointSet.splice( i + 2, 0, new Vector( nextXval, eachCurv ) ); // Rewrite: Removed z (1.0)

          numPointsAdded++;
        }

        i += numPointsAdded;
      }
    }

    this.setupCanonicalSegments();
    this.setupArcLengthSamples();
    this.setupFitTransform( endPointWeight );

    this.maxArcLength = this.arcLength[this.edgePointSet.length - 1];

    // Matrix cleanup
    // Automatic in JS

  }

  getCurvatures( theEdgePointSet )
  {

    const curvVec = [ ];
    curvVec.push( 0.0 );

    var vec1, vec2, det, curvVal;
    vec1 = theEdgePointSet[1].subtract( theEdgePointSet[0] );
    for( let i = 1; i < theEdgePointSet.length - 1; i++ )
    {
      //this curvature definition from schneider/kobbelt paper
      vec2 = theEdgePointSet[i + 1].subtract( theEdgePointSet[i] );
      det = vec1.determinant( vec2 );

      curvVal = 2.0 * det / (vec1.length * vec2.length * (vec1.add( vec2 )).length);
      curvVec.push( curvVal );

      vec1 = vec2;
    }
    curvVec.push( 0.0 );

    curvVec[0] = curvVec[1];
    curvVec[curvVec.length - 1] = curvVec[curvVec.length - 2];

    return curvVec;
  }

  HeightLineFit2( numPoints, points, m, b )
  {

    // compute sums for linear system
    var fSumX = 0.0;
    var fSumY = 0.0;
    var fSumXX = 0.0;
    var fSumXY = 0.0;

    var n = numPoints;

    for( let i = 0; i < numPoints; i++ )
    {
      fSumX += points[i].x;
      fSumY += points[i].y;
      fSumXX += points[i].x * points[i].x;
      fSumXY += points[i].x * points[i].y;
    }

    m = (n * fSumXY - fSumX * fSumY) / (n * fSumXX - fSumX * fSumX);
    b = (fSumY - m * fSumX) / n;

    return [ m, b ];
  }

  getFitErrors( num, points, A, B )
  {
    var totalError = 0.0;
    for( let i = 0; i < num; i++ )
      totalError += Math.abs( B + (A * points[i].x) - points[i].y );

    return totalError;
  }

  recurseThroughWalkMatrix( walkMatrix, begin, end, segmentEnd, stack_count = 0)
  {
    if( stack_count > 5000 )
      throw "Could not fit to data";

    if( begin + 1 >= end )
    {
      segmentEnd[begin] = true;
      segmentEnd[end] = true;
    }

    if( walkMatrix[begin][end] === -1 )
    {
      segmentEnd[begin] = true;
      segmentEnd[end] = true;
    }
    else
    {
      segmentEnd = this.recurseThroughWalkMatrix( walkMatrix, begin, walkMatrix[begin][end], segmentEnd, stack_count++ );
      segmentEnd = this.recurseThroughWalkMatrix( walkMatrix, walkMatrix[begin][end], end, segmentEnd, stack_count++ );
    }

    return segmentEnd;
  }

  getStartPoint()
  {
    return this.segmentTranslate[0].subtract( this.centreSpline ).rotate( -this.fitRotate ).add( this.centreSpline );
  }

  getEndPoint()
  {
    return this.segmentTranslate[this.segmentTranslate.length - 1].subtract( this.centreSpline ).rotate( -this.fitRotate ).add( this.centreSpline );
  }

  setupCanonicalSegments()
  {

    const {
      MIN_CURVATURE_SLOPE,
      CURV_FACTOR
    } = this.const;

    //set up the translate/rotates for each segment

    this.segmentTranslate = [ ];
    this.segmentRotate = [ ];

    this.segmentTranslate.push( new Vector( 0, 0 ) );
    this.segmentRotate.push( 0.0 );

    for( let i = 1; i < this.segmentPointSet.length; i++ )
    {

      const eachTranslate = this.segmentTranslate[i - 1];
      const eachRotate = this.segmentRotate[i - 1];

      const curv1 = this.segmentPointSet[i - 1].y;
      const curv2 = this.segmentPointSet[i].y;

      if( !(Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE) )
      { //CLOTHOID CASE

        const eachLength = this.segmentPointSet[i].x - this.segmentPointSet[i - 1].x;
        const B = Math.sqrt( eachLength / (Math.PI * Math.abs( curv2 - curv1 )) );

        const t1 = curv1 * B * CURV_FACTOR;
        const t2 = curv2 * B * CURV_FACTOR;

        this.verbose && console.log( {
          t1,
          t2,
          B
        } );

        let transVec = this.getClothoidPiecePoint( t1, t2, t2 );
        transVec = transVec.multiply( Math.PI * B );

        //rotate for the end of this piece
        let rotAmount;

        if( t2 > t1 )
        {
          rotAmount = t2 * t2 - t1 * t1;
        }
        else
        {
          rotAmount = t1 * t1 - t2 * t2;
        }

        this.segmentTranslate.push( eachTranslate.add( transVec.rotate( -eachRotate ) ) );
        this.segmentRotate.push( eachRotate - rotAmount );
      }
      else if( Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE && (Math.abs( curv1 ) < MIN_CURVATURE_SLOPE || Math.abs( curv2 ) < MIN_CURVATURE_SLOPE) )
      { //LINE SEGMENT CASE

        const eachLength = this.segmentPointSet[i].x - this.segmentPointSet[i - 1].x;
        const transVec = new Vector( eachLength, 0 );

        this.segmentTranslate.push( eachTranslate.add( transVec.rotate( -eachRotate ) ) );
        this.segmentRotate.push( eachRotate );
      }
      else
      { //CIRCLE SEGMENT CASE

        const eachLength = this.segmentPointSet[i].x - this.segmentPointSet[i - 1].x;
        let radius = (curv1 + curv2) / 2.0;
        radius = 1.0 / radius;
        let negCurvature;

        if( radius < 0.0 )
        {
          negCurvature = true;
          radius = Math.abs( radius );
        }
        else
          negCurvature = false;

        const circumference = 2 * Math.PI * radius;
        const anglesweep_rad = (eachLength * 2 * Math.PI) / circumference;
        let transVec;

        if( !negCurvature )
        {
          transVec = new Vector( 0, -radius );
          transVec = transVec.rotate( anglesweep_rad );
          transVec.y = transVec.y + radius;
        }
        else
        {
          transVec = new Vector( 0, radius );
          transVec = transVec.rotate( -anglesweep_rad );
          transVec.y = transVec.y - radius;
        }

        let rotAmount;
        if( !negCurvature )
          rotAmount = anglesweep_rad;
        else
          rotAmount = -anglesweep_rad;

        this.segmentTranslate.push( eachTranslate.add( transVec.rotate( -eachRotate ) ) );
        this.segmentRotate.push( eachRotate - rotAmount );
      }
    }
  }

  setupArcLengthSamples()
  {

    const {
      MIN_CURVATURE_SLOPE,
      CURV_FACTOR
    } = this.const;

    this.arcLengthSamples = [ ];

    this.arcLengthSamplesStart = Infinity;
    this.arcLengthSamplesEnd = 0;

    for( let i = 0; i < this.edgePointSet.length; i++ )
    {

      for( let j = 0; j < this.segmentPointSet.length - 1; j++ )
      {
        if( this.arcLength[i] >= this.segmentPointSet[j].x && this.arcLength[i] <= this.segmentPointSet[j + 1].x )
        {

          const curv1 = this.segmentPointSet[j].y;
          const curv2 = this.segmentPointSet[j + 1].y;
          const interp = (this.arcLength[i] - this.segmentPointSet[j].x) / (this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x);

          let transVec;

          if( !(Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE) )
          { //CLOTHOID CASE

            const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
            const B = Math.sqrt( eachLength / (Math.PI * Math.abs( curv2 - curv1 )) );
            const t1 = curv1 * B * CURV_FACTOR;
            const t2 = curv2 * B * CURV_FACTOR;
            const eacht = t1 * (1.0 - interp) + t2 * (interp);

            transVec = this.getClothoidPiecePoint( t1, eacht, t2 );
            transVec = transVec.multiply( Math.PI * B );
          }
          else if( Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE && (Math.abs( curv1 ) < MIN_CURVATURE_SLOPE || Math.abs( curv2 ) < MIN_CURVATURE_SLOPE) )
          { //LINE SEGMENT CASE

            transVec = new Vector( this.arcLength[i] - this.segmentPointSet[j].x, 0 );
          }
          else
          { //CIRCLE SEGMENT CASE

            const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
            let radius = 2.0 / (curv1 + curv2);
            let negCurvature;

            if( radius < 0.0 )
            {
              negCurvature = true;
              radius = Math.abs( radius );
            }
            else
              negCurvature = false;

            const circumference = 2 * Math.PI * radius;
            const anglesweep_rad = (eachLength * 2 * Math.PI) / circumference;

            if( !negCurvature )
            {
              transVec = new Vector( 0, -radius );
              transVec = transVec.rotate( interp * anglesweep_rad );
              transVec.y = transVec.y + radius;
            }
            else
            {
              transVec = new Vector( 0, radius );
              transVec = transVec.rotate( -interp * anglesweep_rad );
              transVec.y = transVec.y - radius;
            }
          }

          this.arcLengthSamples.push( this.segmentTranslate[j].add( transVec.rotate( -this.segmentRotate[j] ) ) );
          if( i < this.arcLengthSamplesStart )
            this.arcLengthSamplesStart = i;
          if( i > this.arcLengthSamplesEnd )
            this.arcLengthSamplesEnd = i;

          break;
        }
      }
    }
  }

  setupFitTransform( endpointWeight )
  {

    // 0.  Assign weights to each point that define how much
    //		each point counts in the transformation

    let weighting = [ ];
    let totalWeight = 0.0;

    for( let i = this.arcLengthSamplesStart; i < this.arcLengthSamplesEnd; i++ )
    {

      if( i === this.arcLengthSamplesStart || i === this.arcLengthSamplesEnd - 1 )
        weighting.push( endpointWeight );
      else
        weighting.push( 1.0 );

      totalWeight += weighting[i - this.arcLengthSamplesStart];
    }

    //1.  Translation is given by the centres of mass between the two curves

    this.centreSketch = new Vector( 0, 0 );
    this.centreSpline = new Vector( 0, 0 );

    for( let i = this.arcLengthSamplesStart; i < this.arcLengthSamplesEnd; i++ )
    {
      this.centreSketch = this.centreSketch.add( this.edgePointSet[i].multiply( weighting[i - this.arcLengthSamplesStart] ) );
    }
    this.centreSketch = this.centreSketch.divide( totalWeight );

    for( let i = this.arcLengthSamplesStart; i < this.arcLengthSamplesEnd; i++ )
    { //JAMES CHANGE FROM EDGEPOINTSET TO ARCLENGTHSAMPLES
      this.centreSpline = this.centreSpline.add( this.arcLengthSamples[i - this.arcLengthSamplesStart].multiply( weighting[i - this.arcLengthSamplesStart] ) );
    }
    this.centreSpline = this.centreSpline.divide( totalWeight );

    this.fitTranslate = this.centreSketch.subtract( this.centreSpline );

    // 2.  Rotation if found from rotation component of best linear transformation
    //		(after performing the translation - which leaves only scaling and rotation)

    //Set up matrix A_pq
    const A_pq = new Array( 4 ).fill( 0.0 );

    for( let i = this.arcLengthSamplesStart; i < this.arcLengthSamplesEnd; i++ )
    { //JAMES CHNAGE FROM EDGEPOINTSET TO this.arcLengthSamples
      const p_i = this.edgePointSet[i].subtract( this.centreSketch );
      const q_i = this.arcLengthSamples[i - this.arcLengthSamplesStart].subtract( this.centreSpline );

      A_pq[0] += p_i.x * q_i.x * weighting[i - this.arcLengthSamplesStart];
      A_pq[1] += p_i.x * q_i.y * weighting[i - this.arcLengthSamplesStart];
      A_pq[2] += p_i.y * q_i.x * weighting[i - this.arcLengthSamplesStart];
      A_pq[3] += p_i.y * q_i.y * weighting[i - this.arcLengthSamplesStart];
    }

    //Solve for S, where S=sqrt(A_pq^TA_pq)
    const A_pqTA_pq = new Array( 4 );
    A_pqTA_pq[0] = A_pq[0] * A_pq[0] + A_pq[2] * A_pq[2];
    A_pqTA_pq[1] = A_pq[0] * A_pq[1] + A_pq[2] * A_pq[3];
    A_pqTA_pq[2] = A_pq[0] * A_pq[1] + A_pq[2] * A_pq[3];
    A_pqTA_pq[3] = A_pq[1] * A_pq[1] + A_pq[3] * A_pq[3];

    //square root can be found using eigenvalues of this 2x2 matrix
    //Direct method to obtain eigenvalues
    let a, b, c, d;
    a = A_pqTA_pq[0];
    b = A_pqTA_pq[1];
    c = A_pqTA_pq[2];
    d = A_pqTA_pq[3];

    const r_1 = (a + d) / 2.0 + Math.sqrt( ((a + d) * (a + d)) / 4.0 + b * c - a * d );
    const r_2 = (a + d) / 2.0 - Math.sqrt( ((a + d) * (a + d)) / 4.0 + b * c - a * d );

    const sqrtA = new Array( 4 ); //sqrt(A) where A_pq^T A_pq
    const Sinv = new Array( 4 );
    const R = new Array( 4 );

    if( r_1 !== 0.0 && r_2 !== 0.0 )
    { //If matrix is not RANK DEFICIENT

      let m;
      let p;

      if( r_2 !== r_1 )
      {
        m = (Math.sqrt( r_2 ) - Math.sqrt( r_1 )) / (r_2 - r_1);
        p = (r_2 * Math.sqrt( r_1 ) - r_1 * Math.sqrt( r_2 )) / (r_2 - r_1);
      }
      else if( r_2 === r_1 )
      {
        m = 1 / (4 * r_1);
        p = Math.sqrt( r_1 ) / 2;
      }

      // sqrt(A)=m*A+p*I
      sqrtA[0] = m * A_pqTA_pq[0] + p;
      sqrtA[1] = m * A_pqTA_pq[1];
      sqrtA[2] = m * A_pqTA_pq[2];
      sqrtA[3] = m * A_pqTA_pq[3] + p;

      // S^(-1) = (1/ad-bc)(d -b; -c a)
      const determinant = (1.0 / (sqrtA[0] * sqrtA[3] - sqrtA[1] * sqrtA[2]));
      Sinv[0] = determinant * sqrtA[3];
      Sinv[1] = determinant * (-sqrtA[1]);
      Sinv[2] = determinant * (-sqrtA[2]);
      Sinv[3] = determinant * sqrtA[0];

      // finally, R=A_pq*S^(-1)
      R[0] = A_pq[0] * Sinv[0] + A_pq[1] * Sinv[2];
      R[1] = A_pq[0] * Sinv[1] + A_pq[1] * Sinv[3];
      R[2] = A_pq[2] * Sinv[0] + A_pq[3] * Sinv[2];
      R[3] = A_pq[2] * Sinv[1] + A_pq[3] * Sinv[3];

      if( Math.abs( R[0] - R[3] ) < 0.001 && Math.abs( R[1] - R[2] ) > 0.001 )
      {

        if( R[1] < 0.0 )
        {
          this.fitRotate = -Math.acos( R[0] );
        }
        else
        {
          this.fitRotate = Math.acos( R[0] );
        }
      }
      else
      {

        this.verbose && console.log( "R0 NOT EQUAL to R3!!" );
        if( R[1] < 0.0 )
        {
          this.fitRotate = Math.acos( R[0] );
        }
        else
        {
          this.fitRotate = -Math.acos( R[0] );
        }
      }

      this.verbose && console.log( {
        R,
        determinant
      } );

      this.verbose && console.log( `fitRotate ${this.fitRotate} found VIA R` );
    }
    else
    { //MATRIX A_pq is RANK DEFICIENT

      //use arctangent of 1st tangent to approximate
      this.fitRotate = -Math.atan2( this.edgePointSet[this.edgePointSet.length - 1].y - this.edgePointSet[0].y,
        this.edgePointSet[this.edgePointSet.length - 1].x - this.edgePointSet[0].x );

      this.verbose && console.log( `fitRotate ${this.fitRotate} found VIA arctan2` );
    }

    // Matrix cleanup
    // Automatic in JS
  }

  getClothoidPiecePoint( t1, t, t2 )
  {

    let point = new Vector( this.cosFresnel( t ), this.sinFresnel( t ) ).subtract( new Vector( this.cosFresnel( t1 ), this.sinFresnel( t1 ) ) );

    //translate and rotate point
    if( t2 > t1 )
    {
      point = point.rotate( -(t1 * t1) );
    }
    else
    {
      point = point.rotate( -(t1 * t1 + Math.PI) );
      point.y = -point.y;
    }

    point = point.divide( this.const.CURV_FACTOR );

    return point;
  }

  setupFineSamples( sampleDistance )
  {

    const {
      MIN_CURVATURE_SLOPE,
      CURV_FACTOR
    } = this.const;

    const fineSamples = [ ];
    for( let f = this.segmentPointSet[0].x; f <= this.segmentPointSet[this.segmentPointSet.length - 1].x; f += sampleDistance )
      fineSamples.push( f );
    fineSamples.push( this.segmentPointSet[this.segmentPointSet.length - 1].x );

    this.fineSampleVector = [ ];


    this.verbose && console.group( "Setup Tasks" );

    for( let i = 0; i < fineSamples.length; i++ )
    {

      let pointFound = false;
      for( let j = 0; j < this.segmentPointSet.length - 1; j++ )
      {

        if( fineSamples[i] >= this.segmentPointSet[j].x && fineSamples[i] <= this.segmentPointSet[j + 1].x )
        {

          const curv1 = this.segmentPointSet[j].y;
          const curv2 = this.segmentPointSet[j + 1].y;
          const interp = (fineSamples[i] - this.segmentPointSet[j].x) / (this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x);

          let transVec;

          if( !(Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE) )
          { //CLOTHOID CASE
            this.verbose && console.log( "clothoid" );

            const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
            const B = Math.sqrt( eachLength / (Math.PI * Math.abs( curv2 - curv1 )) );
            const t1 = curv1 * B * CURV_FACTOR;
            const t2 = curv2 * B * CURV_FACTOR;
            const eacht = t1 * (1.0 - interp) + t2 * (interp);

            transVec = this.getClothoidPiecePoint( t1, eacht, t2 );
            transVec = transVec.multiply( Math.PI * B );
          }
          else if( Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE && (Math.abs( curv1 ) < MIN_CURVATURE_SLOPE || Math.abs( curv2 ) < MIN_CURVATURE_SLOPE) )
          { //LINE SEGMENT CASE
            this.verbose && console.log( "line" );

            transVec = new Vector( fineSamples[i] - this.segmentPointSet[j].x, 0 );
          }
          else
          { //CIRCLE SEGMENT CASE
            this.verbose && console.log( "circle" );

            const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
            let radius = 2.0 / (curv1 + curv2);
            let negCurvature;

            if( radius < 0.0 )
            {
              negCurvature = true;
              radius = Math.abs( radius );
            }
            else
              negCurvature = false;

            const circumference = 2 * Math.PI * radius;
            const anglesweep_rad = (eachLength * 2 * Math.PI) / circumference;

            if( !negCurvature )
            {
              transVec = new Vector( 0, -radius );
              transVec = transVec.rotate( interp * anglesweep_rad );
              transVec.y = transVec.y + radius;
            }
            else
            {
              transVec = new Vector( 0, radius );
              transVec = transVec.rotate( -interp * anglesweep_rad );
              transVec.y = transVec.y - radius;
            }
          }

          let eachPoint = this.segmentTranslate[j].add( transVec.rotate( -this.segmentRotate[j] ) );

          eachPoint = eachPoint.subtract( this.centreSpline );
          eachPoint = eachPoint.rotate( -this.fitRotate );
          eachPoint = eachPoint.add( this.centreSpline );
          eachPoint = eachPoint.add( this.fitTranslate );

//				eachPoint.z = j; //z component is which segment this is!!

          this.fineSampleVector.push( eachPoint );

          pointFound = true;
          break;
        }

        if( pointFound )
          break;
      }
    }
    this.verbose && console.groupEnd();
  }
  getFineSamples()
  {

    this.verbose &&
      console.log( "Fitting data", {
        edgePointSet: this.edgePointSet,
        estCurv: this.estCurv,
        arcLength: this.arcLength,
        segmentPointSet: this.segmentPointSet,
        segmentTranslate: this.segmentTranslate,
        segmentRotate: this.segmentRotate.map( r => r.rad2deg() ),
        arcLengthSamples: this.arcLengthSamples,
        centreSpline: this.centreSpline,
        centreSketch: this.centreSketch,
        fitTranslate: this.fitTranslate,
        fitRotate: this.fitRotate.rad2deg(),
        maxArcLength: this.maxArcLength
      } );

    return this.fineSampleVector;
  }

  sinFresnel( t )
  {
    return Fresnel.Se( t / this.const.CURV_FACTOR ) * this.const.CURV_FACTOR;

//    t = t / this.const.CURV_FACTOR;
//
//    let returnVal;
//    if( t >= 0.0 )
//    {
//      const R = (0.506 * t + 1.0) / (1.79 * t * t + 2.05 * t + Math.sqrt( 2.0 ));
//      const A = 1.0 / (0.803 * Math.pow( t, 3 ) + 1.886 * t * t + 2.52 * t + 2.0);
//
//      returnVal = 0.5 - R * Math.cos( 0.5 * Math.PI * (A - t * t) );
//    }
//    else
//    {
//      t = -t;
//
//      const R = (0.506 * t + 1.0) / (1.79 * t * t + 2.05 * t + Math.sqrt( 2.0 ));
//      const A = 1.0 / (0.803 * Math.pow( t, 3 ) + 1.886 * t * t + 2.52 * t + 2.0);
//
//      returnVal = -(0.5 - R * Math.cos( 0.5 * Math.PI * (A - t * t) ));
//    }
//    return returnVal * this.const.CURV_FACTOR;
  }

  cosFresnel( t )
  {
    return Fresnel.Ce( t / this.const.CURV_FACTOR ) * this.const.CURV_FACTOR;

//    t = t / this.const.CURV_FACTOR;
//
//    let returnVal;
//    if( t >= 0.0 )
//    {
//      const R = (0.506 * t + 1.0) / (1.79 * t * t + 2.05 * t + Math.sqrt( 2.0 ));
//      const A = 1.0 / (0.803 * Math.pow( t, 3 ) + 1.886 * t * t + 2.52 * t + 2.0);
//
//      returnVal = 0.5 - R * Math.sin( 0.5 * Math.PI * (A - t * t) );
//    }
//    else
//    {
//      t = -t;
//
//      const R = (0.506 * t + 1.0) / (1.79 * t * t + 2.05 * t + Math.sqrt( 2.0 ));
//      const A = 1.0 / (0.803 * Math.pow( t, 3 ) + 1.886 * t * t + 2.52 * t + 2.0);
//
//      returnVal = -(0.5 - R * Math.sin( 0.5 * Math.PI * (A - t * t) ));
//    }
//    return returnVal * this.const.CURV_FACTOR;
  }

  setupTasks( )
  {

    const {
      MIN_CURVATURE_SLOPE,
      CURV_FACTOR
    } = this.const;

    this.tasks = [ ];

    const translatePoint = ( eachPoint ) =>
    {
      eachPoint = eachPoint.subtract( this.centreSpline );
      eachPoint = eachPoint.rotate( -this.fitRotate );
      eachPoint = eachPoint.add( this.centreSpline );
      eachPoint = eachPoint.add( this.fitTranslate );
      return eachPoint;
    };

    this.verbose && console.group( "Setup Tasks" );

    for( let j = 0; j < this.segmentPointSet.length - 1; j++ )
    {

      const curv1 = this.segmentPointSet[j].y;
      const curv2 = this.segmentPointSet[j + 1].y;

      let transVec;
      let task;

      if( !(Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE) )
      { //CLOTHOID CASE
        this.verbose && console.log( "clothoid" );

        if( false )
        {
          // Clothoid Task
          // Work in progress

//        const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
//        const B = Math.sqrt( eachLength / (Math.PI * Math.abs( curv2 - curv1 )) );
//        let t1 = curv1 * B * CURV_FACTOR;
//        let t2 = curv2 * B * CURV_FACTOR;
//
////        transVec = new Vector( this.cosFresnel( t2 ), this.sinFresnel( t2 ) ).subtract( new Vector( this.cosFresnel( t1 ), this.sinFresnel( t1 ) ) );
//        transVec = new Vector( 1, 0 );
//
//        //translate and rotate point
//        if( t2 > t1 )
//        {
//          transVec = transVec.rotate( -(t1 * t1) );
//        }
//        else
//        {
//          transVec = transVec.rotate( -(t1 * t1 + Math.PI) );
//          transVec.y = -transVec.y;
//        }
//
//        transVec = transVec.divide( this.const.CURV_FACTOR );
//
//        transVec = transVec.multiply( Math.PI * B );
//        transVec = transVec.multiply( eachLength );
//
//        transVec = transVec.rotate_90_ccw();
//
//
//        const start = translatePoint( this.segmentTranslate[j] );
//        const end = translatePoint( this.segmentTranslate[j].add( transVec.rotate( -this.segmentRotate[j] ) ) );
//        t1 *= eachLength;
//        t2 *= eachLength;
//
//        task = new ClothoidTask( j, [ start, end ], [ t1, t2 ], false, true );

        }
        else
        {
          // Faux Clothoid with sampled clothoid
          const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
          const B = Math.sqrt( eachLength / (Math.PI * Math.abs( curv2 - curv1 )) );
          const t1 = curv1 * B * CURV_FACTOR;
          const t2 = curv2 * B * CURV_FACTOR;

          const ends = [ ];
          const interps = [ ];
          for( let i = 0; i < 1; i += 0.01 )
          {
            const eacht = t1 * (1.0 - i) + t2 * (i);

            transVec = this.getClothoidPiecePoint( t1, eacht, t2 );
            transVec = transVec.multiply( Math.PI * B );

            ends.push( translatePoint( this.segmentTranslate[j].add( transVec.rotate( -this.segmentRotate[j] ) ) ) );
          }
          task = new FitBSpline( ends, -1 ).getSplineTask( 0, false, true );
        }

      }
      else if( Math.abs( curv2 - curv1 ) < MIN_CURVATURE_SLOPE && (Math.abs( curv1 ) < MIN_CURVATURE_SLOPE || Math.abs( curv2 ) < MIN_CURVATURE_SLOPE) )
      { //LINE SEGMENT CASE
        this.verbose && console.log( "line" );

        const start = translatePoint( this.segmentTranslate[j] );
        const end = translatePoint( this.segmentTranslate[j].add( new Vector( this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x, 0 ).rotate( -this.segmentRotate[j] ) ) );
        task = new LineTask( j, [ start, end ], false, true );
      }
      else
      { //CIRCLE SEGMENT CASE
        this.verbose && console.log( "circle" );

        const eachLength = this.segmentPointSet[j + 1].x - this.segmentPointSet[j].x;
        let radius = 2.0 / (curv1 + curv2);
        let negCurvature;

        if( radius < 0.0 )
        {
          negCurvature = true;
          radius = Math.abs( radius );
        }
        else
          negCurvature = false;

        const circumference = 2 * Math.PI * radius;
        const anglesweep_rad = (eachLength * 2 * Math.PI) / circumference;

        const ends = [ ];
        const interps = [ 0, 0.5, 1 ];

        interps.forEach( ( interp ) => {
          if( !negCurvature )
          {
            transVec = new Vector( 0, -radius );
            transVec = transVec.rotate( interp * anglesweep_rad );
            transVec.y = transVec.y + radius;
          }
          else
          {
            transVec = new Vector( 0, radius );
            transVec = transVec.rotate( -interp * anglesweep_rad );
            transVec.y = transVec.y - radius;
          }

          ends.push( translatePoint( this.segmentTranslate[j].add( transVec.rotate( -this.segmentRotate[j] ) ) ) );
        } );

        task = new ArcTask( j, ends, undefined, negCurvature, false, true );

      }

      this.tasks.push( task );

    }
    this.verbose && console.groupEnd();

  }
  getTasks()
  {
    this.verbose && console.log( "Fitting data", {
      edgePointSet: this.edgePointSet,
      estCurv: this.estCurv,
      arcLength: this.arcLength,
      segmentPointSet: this.segmentPointSet,
      segmentTranslate: this.segmentTranslate,
      segmentRotate: this.segmentRotate.map( r => r.rad2deg() ),
      arcLengthSamples: this.arcLengthSamples,
      centreSpline: this.centreSpline,
      centreSketch: this.centreSketch,
      fitTranslate: this.fitTranslate,
      fitRotate: this.fitRotate.rad2deg(),
      maxArcLength: this.maxArcLength
    } );

    return this.tasks;
  }

}