class FileParserSVG extends FileParser
{
    constructor() {
        super();
        this.origin = new Vector(0,0);
        this.width = undefined;
        this.height = undefined;
    }

    getTranslateMatrix(params = [])
    {
      const m = math.identity(3);
      m.set([0,2], params[0]);
      m.set([1,2], params[1] === undefined ? params[0] : params[1]);
      return m;
    }
  
    getScaleMatrix(params = [])
    {
      const m = math.identity(3);
      m.set([0,0], params[0]);
      m.set([1,1], params[1] === undefined ? params[0] : params[1]);
      return m;
    }
  
    getRotateMatrix(params = [])
    {
      const a = params[0].deg2rad();
      const m = math.matrix([
        [ math.cos(a), math.sin(a), 0],
        [-math.sin(a), math.cos(a), 0],
        [0           , 0          , 1]
      ]);
      if(params.length === 1)
      {
        return m;
      }
      else
      {
        const translateToPoint = this.getTranslateMatrix([params[1], params[2]]);
        const translateFromPoint = this.getTranslateMatrix([-params[1], -params[2]]);
        return math.multiply(translateFromPoint,m,translateToPoint);
      }
    }
  
    getSkewXMatrix(params = [])
    {
      const m = math.identity(3);
      m.set([0,1], math.tan(params[0].deg2rad()));
      return m;
    }
  
    getSkewYMatrix(params = [])
    {
      const m = math.identity(3);
      m.set([1,0], math.tan(params[0].deg2rad()));
      return m;
    }

    getAttributeOrDefault(node, attribute, defaultValue) {
      if(node === undefined) {
        throw "Need node";
      }

      if(attribute === undefined) {
        throw "Need attribute";
      }

      if(defaultValue === undefined) {
        throw "Need default value";
      }

      const value = node.getAttribute(attribute);
      return value === null ? defaultValue : value;
    }
  
    parseTransformAttribute(transform = "")
    {
      if(transform === null)
      {
        return math.identity(3);
      }
  
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#transform_functions
      // https://www.w3.org/TR/SVG11/coords.html#TransformAttribute
  
      const parts = transform.trim().split(") "); // different transforms end with ')' and are separated by space
      const newTransform = [math.identity(3)];
      parts.forEach(part=>{
        const subparts = part.trim().split("(");
        const partname = subparts[0];
        const p = subparts[1].splitFloats(); // parameters
  
        switch(partname)
        {
          case "matrix":
            newTransform.push(math.matrix([
              [p[0],p[2],p[4]],
              [p[1],p[3],p[5]],
              [0   ,0   ,1   ]
            ]));
            break;
          case "translate":
            newTransform.push(this.getTranslateMatrix(p));
            break;
          case "scale":
            newTransform.push(this.getScaleMatrix(p));
            break;
          case "rotate":
            newTransform.push(this.getRotateMatrix(p));
            break;
          case "skewX":
            // TODO: Reactivate skew
            // We operate on parametrized geometries, so we cannot skew the image
  
            // newTransform.push(this.getSkewXMatrix(p));
            console.warn("Ignoring skewX");
            break;
          case "skewY":
            // TODO: Reactivate skew
            // We operate on parametrized geometries, so we cannot skew the image
  
            // newTransform.push(this.getSkewYMatrix(p));
            console.warn("Ignoring skewY");
            break;
        }
      });
      return newTransform.length > 1 ? math.multiply(...newTransform) : newTransform[0];
    }
  
    transformPoints(transform, points = [])
    {
      return points.map(p=>p.transform(transform));
    }
  
    setViewBox(viewbox = "")
    {
      if(viewbox === null)
      {
        return;
      }
  
      const params = viewbox.splitFloats();
      this.origin = new Vector(params[0], params[1]);
  
      // The rest of the viewbox and width/height is not used for historic reasons
      // and because the scale between them is irrelevant on our map
    }
  
    parseNode( node, transform = math.identity(3) )
    {
  
      if(node.getAttribute)
      {
        this.setViewBox(node.getAttribute("viewBox"));
        transform = math.multiply(transform, this.parseTransformAttribute(node.getAttribute("transform")));
      }
  
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes
      switch( node.localName )
      {
        case "rect":
          this.parseRectangle(node, transform); // TODO: fix uneven corners, otherwise confirmed
          break;
        case "circle":
          this.parseCircle( node, transform ); // Confirmed
          break;
        case "ellipse":
          this.parseEllipse( node, transform );
          break;
        case "line":
          this.parseLine(node, transform); // Confirmed
          break;
        case "polyline":
          this.parsePolyline( node, false, transform ); // Confirmed
          break;
        case "polygon":
          this.parsePolyline( node, true, transform ); // Confirmed
          break;
        case "path":
          this.parsePath( node, transform ); // TODO
          break;
      }
  
      node.childNodes.forEach( child => this.parseNode(child, transform ) );
    }
    parseRectangle(node, transform)
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#rectangle
      const x = parseFloat(this.getAttributeOrDefault(node, "x", 0));
      const y = parseFloat(this.getAttributeOrDefault(node, "y", 0));
      const width = parseFloat(node.getAttribute("width"));
      const height = parseFloat(node.getAttribute("height"));
  
      let rx = parseFloat(node.getAttribute("rx"));
      let ry = parseFloat(node.getAttribute("ry"));
      let drawCorners = !!rx;
      let drawTopBottomLine = true;
      let drawLeftRightLine = true;
      if(!ry)
      {
        ry = rx;
      }
      if(rx > width / 2)
      {
        rx = width / 2;
        drawTopBottomLine = false;
      }
      if(ry > height / 2)
      {
        ry = height / 2;
        drawLeftRightLine = false;
      }
  
      const cornerTopLeft = new Vector(x, y+height);
      const cornerTopRight = new Vector(x+width, y+height);
      const cornerBottomRight = new Vector(x+width, y);
      const cornerBottomLeft = new Vector(x, y);
  
      const Rx = new Vector(rx,0);
      const Ry = new Vector(0,ry);
  
      const lineTop    = [cornerTopLeft.add(Rx),          cornerTopRight.subtract(Rx)];
      const lineRight  = [cornerTopRight.subtract(Ry),    cornerBottomRight.add(Ry)  ];
      const lineBottom = [cornerBottomRight.subtract(Rx), cornerBottomLeft.add(Rx)   ];
      const lineLeft   = [cornerBottomLeft.add(Ry),  cornerTopLeft.subtract(Ry)      ];
  
      const circleTopLeft     = [lineLeft[1],   lineTop[0],    lineTop[0].subtract(Ry)];
      const circleTopRight    = [lineTop[1],    lineRight[0],  lineTop[1].subtract(Ry)];
      const circleBottomRight = [lineRight[1],  lineBottom[0], lineBottom[0].add(Ry)];
      const circleBottomLeft  = [lineBottom[1], lineLeft[0],   lineBottom[1].add(Ry)];
  
      const createCorner = (id, c) => {
        if(rx === ry)
        {
          return ArcTask.From2PointsAndCenter(id, c[0], c[1], c[2], true, true);
        }
        else
        {
          // TODO: Fix uneven corners
          console.warn("Ellipse corners not yet supported!")
          return new Ellipse(c[2], Rx, Ry, c[0], c[1]).toEllipseTask(id, true);
        }
      }
  
      const pathTasks = [];
      const getId = () => this.tasks.length + pathTasks.length;
      
      drawTopBottomLine && pathTasks.push(new LineTask(getId(), lineTop, undefined, true));
      drawCorners       && pathTasks.push(createCorner(getId(), circleTopRight));
      drawLeftRightLine && pathTasks.push(new LineTask(getId(), lineRight, undefined, true));
      drawCorners       && pathTasks.push(createCorner(getId(), circleBottomRight));
      drawTopBottomLine && pathTasks.push(new LineTask(getId(), lineBottom, undefined, true));
      drawCorners       && pathTasks.push(createCorner(getId(), circleBottomLeft));
      drawLeftRightLine && pathTasks.push(new LineTask(getId(), lineLeft, undefined, true));
      drawCorners       && pathTasks.push(createCorner(getId(), circleTopLeft));
  
      this.tasks.pushAll(pathTasks.map(task=>task.transform(transform)));
    }
    parseCircle(node, transform)
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#circle
      const x = parseFloat(this.getAttributeOrDefault(node, "cx", 0));
      const y = parseFloat(this.getAttributeOrDefault(node, "cy", 0));
      const r = parseFloat(this.getAttributeOrDefault(node, "r", 0));
  
      const center = new Vector(x,y);
      const radius = new Vector(r,0);
  
      const circle = new CircleTask(this.tasks.length, radius, center, true).transform(transform);
  
      this.tasks.push(circle);
    }
    parseEllipse(node, transform)
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#ellipse
      const cx = parseFloat(this.getAttributeOrDefault(node, "cx", 0));
      const cy = parseFloat(this.getAttributeOrDefault(node, "cy", 0));
      const rx = parseFloat(node.getAttribute("rx"));
      const ry = parseFloat(node.getAttribute("ry"));
  
      const center = new Vector(cx, cy);
      const major = new Vector(rx, 0).add(center);
      const minor = new Vector(0, ry).add(center);
  
      const ellipse = new EllipseTask(this.tasks.length, [minor, major], [ 0, Math.PI * 2 ], center, true, false, true).transform(transform);
  
      this.tasks.push(ellipse);
    }
    parseLine(node, transform)
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#line
      const x1 = parseFloat(this.getAttributeOrDefault(node, "x1", 0));
      const y1 = parseFloat(this.getAttributeOrDefault(node, "y1", 0));
      const x2 = parseFloat(this.getAttributeOrDefault(node, "x2", 0));
      const y2 = parseFloat(this.getAttributeOrDefault(node, "y2", 0));
  
      const ends = [
        new Vector(x1, y1),
        new Vector(x2, y2)
      ];
  
      this.tasks.push(new LineTask(this.tasks.length, this.transformPoints(transform, ends), false, true));
    }
    parsePolyline( node, closed, transform )
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#polyline
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes#polygon
  
      const points = this.getAttributeOrDefault(node, "points", "").trim();
      const ends = points.toVector();
      
      if( closed )
      {
        ends.push( ends[0].copy() );
      }
  
      const polyline = new LineTask( this.tasks.length, ends, false, true ).transform(transform);
  
      this.tasks.push( polyline );
    }
    get_required_points( cmdU )
    {
      switch( cmdU )
      {
        case "Z":
          return 0;
        case "V":
        case "H":
          return 1;
        case "M":
        case "L":
        case "T":
          return 2;
        case "S":
        case "Q":
          return 4;
        case "C":
          return 6;
        case "A":
          return 7;
        default:
          break;
      }
    }
    expand_commands( commands, parameters )
    {
      // https://www.w3.org/TR/SVG/paths.html#PathDataGeneralInformation
      for( let c = 0; c < commands.length; c++ )
      {
        const cmd = commands[c];
        const cmdU = cmd.toUpperCase();
        const param = parameters[c + 1].trim();
        const required_numbers = this.get_required_points( cmdU );
        const numbers = param.splitFloats( param );
        if( numbers.length > required_numbers )
        {
          const extra = numbers.splice( required_numbers ).toString().replace( /,/g, " " );
          const new_cmd = cmdU === "M" ? ( cmd === "M" ? "L" : "l" ) : cmd; // https://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands
          commands.splice( c + 1, 0, new_cmd );
          parameters.splice( c + 2, 0, extra );
          parameters[c + 1] = numbers.toString().replace( /,/g, " " );
        }
      }
    }
    parsePath( node, transform )
    {
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
  
      const s = this.getAttributeOrDefault(node, "d", "").trim();

      if(!s || s === "") {
        return;
      }

      const commands = s.match( /[MLHVCSQTAZmlhvcsqtaz]/g );
      const parameters = s.split( /[MLHVCSQTAZmlhvcsqtaz]/g );
      
      this.expand_commands( commands, parameters );
      
      let lastPoint = this.origin;
      let lastStart = lastPoint.copy();
  
      const pathTasks = [];
      const getId = () => this.tasks.length + pathTasks.length;
  
      for( let c = 0; c < commands.length; c++ )
      {
        const cmd = commands[c];
        const cmdU = cmd.toUpperCase();
        const relative = cmd !== cmdU;
  
        const param = parameters[c + 1].trim();
        
        switch( cmdU )
        {
          case "M": {
            lastStart = param.toVector();
            if( relative )
              lastStart = lastStart.add( lastPoint );
            lastPoint = lastStart;
            break;
          }
          case "H":
          case "V":
          case "L": {
            let p;
            if( cmdU === "H" )
            {
              p = new Vector( parseFloat( param ), 0 );
            }
            else if( cmdU === "V" )
            {
              p = new Vector( 0, parseFloat( param ) );
            }
            else
            {
              p = param.toVector();
            }
            if( relative )
            {
              p = p.add( lastPoint );
            }
            else
            {
              if( cmdU === "H" )
                p.y = lastPoint.y;
              else if( cmdU === "V" )
                p.x = lastPoint.x;
            }
            if( !lastPoint.veryclose( p ) )
            {
              pathTasks.push( new LineTask( getId(), [ lastPoint, p ], false, true ) );
            }
            lastPoint = p;
            break;
          }
          case "C":
          case "Q": {
            let points = [param.toVector()].flat();
            if( relative )
            {
              points = points.map( p => p.add( lastPoint ) );
            }
            points.unshift( lastPoint );
            pathTasks.push( new CubicBezierTask( getId(), points, false, true ) );
            lastPoint = points.last();
            break;
          }
          case "T":
          case "S": {
            let points = [param.toVector()].flat();
            if( cmd === "t" )
              points = [ points ];
            if( relative )
              points = points.map( p => {
                var new_p = p.add( lastPoint );
                return new_p;
              } );
            if( pathTasks.last() instanceof CubicBezierTask )
            {
              const last_control_point = pathTasks.last().ends.last( -1 );
              const guide = (new Line( last_control_point, pathTasks.last().end )).as_vector;
              const new_control_point = pathTasks.last().end.add( guide );
              points.unshift( new_control_point );
            }
            else
            {
              points.unshift( lastPoint );
            }
            points.unshift( lastPoint );
            pathTasks.push( new CubicBezierTask( getId(), points, false, true ) );
            lastPoint = points.last();
            break;
          }
          case "A": {
            // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#arcs
  
            //rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const parts = param.splitFloats();
            const rx = parts[0];
            const ry = parts[1];
            const angle = parts[2].deg2rad();
            const large_arc_flag = parts[3] > 0.5;
            const sweep_flag = parts[4] > 0.5;
            const clockwise = !sweep_flag;
  
            const start = lastPoint;
            let end = new Vector( parts[5], parts[6] );
  
            if( relative )
              end = end.add( lastPoint );
  
            var center = this.getPathACenterParameters( start, end, large_arc_flag, sweep_flag, rx, ry, angle );
  
            if( rx === ry )
            {
              const arc = ArcTask.From2PointsAndCenter( getId(), start, end, center, clockwise, true );
              pathTasks.push( arc );
            }
            else
            {
              var minor = (new Vector( rx, 0 )).rotate( angle );
              var minorGuide = new Line( start, start.add( minor ) );
              var el = new Ellipse2MinorGuide( start, end, minorGuide, clockwise ); // minorGuide = line from middle between goals to minor length out perpendicular to line between goals
              pathTasks.push( el.toEllipseTask( getId(), true ) );
            }
  
            lastPoint = end.copy();
            break;
          }
          case "Z": {
            if( !lastStart.veryclose( lastPoint ) )
            {
              pathTasks.push( new LineTask( getId(), [ lastPoint, lastStart ], false, true ) );
            }
            lastPoint = lastStart.copy();
            break;
          }
          default: {
            console.warn( "Couldn't parse path command", cmd );
            break;
          }
        }
        lastPoint = lastPoint.copy();
      }
  
      this.tasks.pushAll(pathTasks.map(task=>task.transform(transform)));
  
    }
    getPathACenterParameters( p1, p2, fa, fs, rx, ry, phi )
    {
      // https://observablehq.com/@toja/ellipse-and-elliptical-arc-conversion
      // https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
  
      let x1 = p1.x;
      let y1 = p1.y;
      let x2 = p2.x;
      let y2 = p2.y;
  
      const {abs, sin, cos, sqrt} = Math;
      const pow = n => Math.pow( n, 2 );
  
      const sinphi = sin( phi ), cosphi = cos( phi );
  
      // Step 1: simplify through translation/rotation
      const x = cosphi * (x1 - x2) / 2 + sinphi * (y1 - y2) / 2,
        y = -sinphi * (x1 - x2) / 2 + cosphi * (y1 - y2) / 2;
  
      const px = pow( x ), py = pow( y ), prx = pow( rx ), pry = pow( ry );
  
      // correct of out-of-range radii
      const L = px / prx + py / pry;
  
      if( L > 1 )
      {
        rx = sqrt( L ) * abs( rx );
        ry = sqrt( L ) * abs( ry );
      }
      else
      {
        rx = abs( rx );
        ry = abs( ry );
      }
  
      // Step 2 + 3: compute center
      const sign = fa === fs ? -1 : 1;
      let M = sqrt( (prx * pry - prx * py - pry * px) / (prx * py + pry * px) ) * sign;
      if( !M )
        M = 0;
  
      const _cx = M * (rx * y) / ry,
        _cy = M * (-ry * x) / rx;
  
      const cx = cosphi * _cx - sinphi * _cy + (x1 + x2) / 2,
        cy = sinphi * _cx + cosphi * _cy + (y1 + y2) / 2;
  
      return new Vector( cx, cy );
    }


    /**
     * 
     * @param {String} datastring SVG as a string
     * @returns {FileParserSVG} Parser
     */
    _parse(datastring)
    {
        this.src = new DOMParser().parseFromString( datastring, "text/xml" );

        const transform = this.getScaleMatrix([1,-1]); // SVG is drawn from the top left corner. We draw from the bottom left corner.
        this.src.childNodes.forEach( child => this.parseNode( child, transform ));

        this.refresh_bb();
        const mid = new Line( (new Line( this.bb[0], this.bb[1] )).middle, (new Line( this.bb[2], this.bb[3] )).middle ).middle;
        this.height = this.bb[2].y - this.bb[0].y;
        this.width = this.bb[2].x - this.bb[0].x;
        const negative_mid = mid.multiply( -1 );
        
        this.tasks.forEach( task => task.move_task( negative_mid ) ); // move to 0,0

        return this;
    }

    copy() {
        const theCopy = super.copy();
        theCopy.origin = this.origin;
        theCopy.width = this.width;
        theCopy.height = this.height;
        return theCopy;
    }

}