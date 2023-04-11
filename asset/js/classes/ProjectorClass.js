class ProjectorClass
{
  constructor( a, b, c )
  {
    if(c && c.indexOf(Infinity) >= 0)
      throw "Coordinate contains Infinity";

    if(this.assertProjection(this.a))
      throw "At least one projection is needed";

    this.a = a;
    this.b = b;
    this.c = c;

    // Convert NONE projections to affine version
    let isNone = false;
    if(projection_controller.isNone( this.a ))
    {
      isNone = true;
      this.a = projection_controller.getNoneProjection( this.a );
    }
    if(projection_controller.isNone( this.b ))
    {
      isNone = true;
      this.b = projection_controller.getNoneProjection( this.b );
    }

    if( isNone )
      this.p = {
        forward: function( coord )
        {
          return coord;
        },
        inverse: function( coord )
        {
          return coord;
        }
      };
    else if(this.assertProjection(this.a) && this.assertProjection(this.b) && !!this.c)
      this.p = PROJ( this.a, this.b, this.c );
    else if(this.assertProjection(this.a) &&  this.assertProjection(this.b) && !this.c)
      {
      console.log("************************************ 6");
      this.p = PROJ( this.a, this.b );}
    else if(this.assertProjection(this.a) && !this.assertProjection(this.b) && !this.c)
      {
      console.log("************************************ 7");
      this.p = PROJ( this.a );
      }
    else
      throw "Projection definition error";

    this.pr = this.pr2 = undefined;
    try
    {
      if( a ) // This should be a and NOT this.a (because this.a removed gridshift)
        this.pr = new Proj4Projection( a );
      if( b ) // This should be b and NOT this.b (because this.b removed gridshift)
        this.pr2 = new Proj4Projection( b );
    }
    catch(e)
    {
      logger.debug("Projector could not create Proj4Projection", e);
    }
  }
  assertProjection( projection )
  {
    return !(!projection || projection === "false" || projection === "undefined" || projection === "null");
  }
  forward( point )
  {
    // return this.p.forward( p );
    let result = this.p.forward(point);
    if(result.length !== point.length)
    {
      this.release();
      if(!!this.a && !!this.b)
        this.p = PROJ( this.a, this.b );
      else
        this.p = PROJ( this.a );
      result = this.p.forward(point)
    }
    return result;
  }
  inverse( point )
  {
    // return this.p.forward( p );
    let result = this.p.inverse(point);
    if(result.length !== point.length)
    {
      this.release();
      if(!!this.a && !!this.b)
        this.p = PROJ( this.a, this.b );
      else
        this.p = PROJ( this.a );
      result = this.p.inverse(point)
    }
    return result;
  }
  release()
  {
    if(DEBUG_MODE) {
        console.warn("Releasing projector",this.a,this.b);
    } else {
        logger.debug("Releasing projector",this.a,this.b);
    }
    this.p.release();
  }
  static remove_param(proj_string, param)
  {
    let proj_parts = proj_string.split(" ");
    proj_parts = proj_parts.filter((part)=>part.indexOf(param) === -1);
    return proj_parts.join(" ");
  }
  static remove_gridparams(proj_string)
  {
    proj_string = ProjectorClass.remove_param(proj_string, "+geoidgrids");
    proj_string = ProjectorClass.remove_param(proj_string, "+nadgrids");
    return proj_string;
  }
  set a(v)
  {
    if(typeof(v) === "string") {
      v = ProjectorClass.remove_gridparams(v);
    }
    this._a = v;
  }
  get a()
  {
    return this._a;
  }
  set b(v)
  {
    if(typeof(v) === "string") {
      v = ProjectorClass.remove_gridparams(v);
    }
    this._b = v;
  }
  get b()
  {
    return this._b;
  }
};