/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global five_degrees_equal */

class AthleticsFieldEvents extends Job
{
  static template_type = "Athletics"; // Translateable
  static template_title = "FieldEvents"; // Translateable
  static template_id = "athletics_fe"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    this.job_options = [ new FloatRobotAction( "ramp_up_max_dist", 2.0 ) ];

    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.Radius = {
      configurable: true,
      name: "Circle radius",
      type: "float",
      _val: 1.25,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
        //this_class.change_width_or_length_with_center_point( this_class.options.Length, Math.abs( new_val ) + this_class.options.LAndingSector.val, 0 );
      }
    };
    this.options.ThrowAngle = {
      configurable: true,
      name: "Throwing angle",
      type: "float",
      _val: 34.92,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
        //this_class.set_new_val(this_class.options.LandingSector, this_class.calculate_side(Math.abs(new_val)));
      }
    };
    this.options.Interval = {
      configurable: true,
      name: "Interval length",
      type: "float",
      _val: 20,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options.LandingSector = {
      configurable: true,
      adjustable: true,
      name: "Landing Sector",
      type: "float",
      _val: 80,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    this.options.Javelin = {
      configurable: false,
      name: "Javelin",
      val: false,
      type: "bool"
    };
    this.options.JavelinArea = {
      get configurable( )
      {
        return (this_class.options.Javelin.val);
      },
      name: "Javelin run-up",
      type: "float",
      _val: 36.5,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = Math.abs( new_val );
      }
    };
    /*this.options.Length = {
     name: "Length",
     type: "float",
     _val: this_class.options.Radius.val + this_class.options.LandingSector.val,
     get val( )
     {
     return this._val;
     },
     set val( new_val )
     {
     this._val = Math.abs( new_val );
     }
     }*/
    this.options.OneWay = {
      configurable: true,
      name: "Drive One Way",
      val: true,
      type: "bool"
    };
    this.options.noCage = {
      configurable: true,
      name: "Cage",
      val: true,
      type: "bool"
    }
    this.options.noCageLength = {
      get configurable()
      {
        return !this_class.options.noCage.val;
      },
      name: "Cutoff from center of cage",
      _val: 0,
      get val(){
       return this._val;
      },
      set val( new_val )
      {
        if(new_val < 0)
          this._val = 0;
        else if(new_val > 20)
          this._val = 20
        else
          this._val = new_val;
      },
      type: "float",
      prev_sibling: "noCage"
    }
    this.options.correctForLineWidth = {
      name: "Correct for line width",
      type: "bool",
      existingJobDefault: false,
      val: true,
      configurable: true,
      adjustable: false
    }
  }

  static get layout_methods()
  {
    return {
      "center,throwdirection": 2,
      "center,landingsector_end": 2,
//      "all_points": 3, //center, throwdirection and landing sector ends
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "center,throwdirection" )
    {
      return [
        new Vector( 0.48, 1 ),
        new Vector( 0.48, 0.96 )
      ];
    }
    if( layout_method === "center,landingsector_end" )
    {
      return [
        new Vector( 0.48, 1 ),
        new Vector( 0.02, 0.01 )
      ];
    }
    if( layout_method === "all_points" )
    {
      return [
        new Vector( 0.48, 1 ),
        new Vector( 0.48, 0.96 ),
        new Vector( 0.02, 0.01 )
          //new Vector( 0.98, 0.01 )
      ];
    }
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var points = [ ];
    switch( this.layout_method )
    {
      case "center,throwdirection": //center + kickboard
        points = this.from2to4points( this.points );
        break;
      case "center,landingsector_end": //center + corner
        points = this.from2to4points( this.center_corner_to2points( this.points ) );
        break;
      case "all_points": //center, throwdirection and corner
        points = this.from3to4points( this.points );
        break;
      case "free_hand":
        //points = regular layout??
        points = this.fromCenterto4points( this.points[0] );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }
//
//    if( !this.check_clockwise( points ) )
//    {
//      points = [ points[0], points[1], points[3], points[2] ];
//    }

    if( this.layout_method !== "free_hand" )
    {
      // Calculate width,length,angle
      var p = points;
      var throw_line = new Line( p[0], p[1] );
      var e1 = p[0]; // throw circle center
      var e2 = new Line( p[3], p[4] ).middle; // between Landing sector ends
      var m = new Line( e2, e1 );

      //this.options.Angle.val = m.as_vector.angle;
      this.options.Angle.val = throw_line.as_vector.angle;
    }

    // Save for later use89+0
    this.calculated_drawing_points = points;
    return points;
  }

  get center()
  {
    return this.drawing_points[0];
  }
  make_side_copy( i, space, n )
  {

    var p = this.drawing_points;
    var l = new Line( p[2], p[3] );

    var plus = this.options.LandingSector.val + this.options.Radius.val;
    if( i % 2 )
      plus = l.length;
    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;
    var g2 = new Line( p[0], p[1] ).unit_vector;
    var g1 = g2.rotate_90_cw();

    var e1 = p[0]; //throw circle center
    var ls_mid = new Line( p[2], p[3] ).middle;

    //create handle on outer arc
    var mid_line = new Line( ls_mid, p[1] );
    var i = this.options.LandingSector.val / this.options.Interval.val;
    var arc_rad = this.options.Interval.val * i;
    var ls_handle = mid_line.crosses_with_circle( p[0], arc_rad )[0];


    // Free hand handles
    if( this.layout_method === "free_hand" )
    {
      //Landing Sector handle
      this.handles.push( new Handle( ls_handle, -this.options.Angle.val + Math.PI / 2, "LandingSector", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( e1, ls_handle );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.LandingSector, new_length );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[2], new_ps[3] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }

        this_class.set_new_val( this_class.options.LandingSector, new_length );

      }, function( new_length )
      {
        return this_class.set_new_val( this_class.options.LandingSector, new_length );
      } ) );

      //Javelin run up handle
      if( this_class.options.Javelin.val )
      {
        var guideline1_l = new Line( e1, p[2] );
        var guideline2_l = new Line( e1, p[3] );
        var guideline1 = guideline1_l.add_to_end( -guideline1_l.length + this.options.Radius.val );
        var guideline2 = guideline2_l.add_to_end( -guideline2_l.length + this.options.Radius.val );

        var guide = new Line( guideline1.end, guideline2.end ).middle;
        var jav_handle = guide.subtract( g2.multiply( this.options.JavelinArea.val ) );
        this.handles.push( new Handle( jav_handle, -this.options.Angle.val + Math.PI / 2, "JavelinArea", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( guide, jav_handle );
          var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.JavelinArea, new_length );

          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[0].subtract( g2.multiply( this_class.options.Radius.val ) ) ) ], snapping_lines )[0];
          if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length += align_this.length;
          }
          else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length -= align_this.length;
          }

          this_class.set_new_val( this_class.options.JavelinArea, new_length );

        }, function( new_length )
        {
          return this_class.set_new_val( this_class.options.JavelinArea, new_length );
        } ) );
      }

      this.handles.push( new Handle( e1, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        this_class.points = [ new_pos_v ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );

        align_this = align_this[0];

        this_class.points = [ new_pos_v.subtract( align_this ) ];
        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {
        this_class.points = [ new_pos_v ];
        this_class.draw();
        return true;
      } ) );

      var angle_line = new Line( p[0], p[1] );
      var gml = new Line( p[0], p[3] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[3], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {
        var new_angle = new Line( p[0], new_pos_v ).as_vector.angle - gml;
        //new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[1];

        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();

      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );
    }
    if( this.layout_method === "center,throwdirection" )
    {
      //Landing Sector handle
      this.handles.push( new Handle( ls_handle, -this.options.Angle.val + Math.PI / 2, "LandingSector", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var g = new Line( e1, ls_handle );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.LandingSector, new_length );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[2], new_ps[3] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }

        this_class.set_new_val( this_class.options.LandingSector, new_length );

      }, function( new_length )
      {
        return this_class.set_new_val( this_class.options.LandingSector, new_length );
      } ) );

      //Javelin run up handle
      if( this_class.options.Javelin.val )
      {
        var guideline1 = new Line( e1, p[2] ).split( this.options.Radius.val )[0];
        var guideline2 = new Line( e1, p[3] ).split( this.options.Radius.val )[0];
        var guide = new Line( guideline1.end, guideline2.end ).middle;
        var jav_handle = guide.subtract( g2.multiply( this.options.JavelinArea.val ) );
        this.handles.push( new Handle( jav_handle, -this.options.Angle.val + Math.PI / 2, "JavelinArea", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( guide, jav_handle );
          var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.JavelinArea, new_length );

          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[0].subtract( g2.multiply( this_class.options.Radius.val ) ) ) ], snapping_lines )[0];
          if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length += align_this.length;
          }
          else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length -= align_this.length;
          }

          this_class.set_new_val( this_class.options.JavelinArea, new_length );

        }, function( new_length )
        {
          return this_class.set_new_val( this_class.options.JavelinArea, new_length );
        } ) );
      }

    }
    if( this.layout_method === "center,landingsector_end" )
    {
      //Javelin run up handle
      if( this_class.options.Javelin.val )
      {
        var guideline1 = new Line( e1, p[2] ).split( this.options.Radius.val )[0];
        var guideline2 = new Line( e1, p[3] ).split( this.options.Radius.val )[0];
        var guide = new Line( guideline1.end, guideline2.end ).middle;
        var jav_handle = guide.subtract( g2.multiply( this.options.JavelinArea.val ) );
        this.handles.push( new Handle( jav_handle, -this.options.Angle.val + Math.PI / 2, "JavelinArea", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( guide, jav_handle );
          var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.JavelinArea, new_length );

          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[0].subtract( g2.multiply( this_class.options.Radius.val ) ) ) ], snapping_lines )[0];
          if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length += align_this.length;
          }
          else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length -= align_this.length;
          }

          this_class.set_new_val( this_class.options.JavelinArea, new_length );

        }, function( new_length )
        {
          return this_class.set_new_val( this_class.options.JavelinArea, new_length );
        } ) );
      }
    }
    if( this.layout_method === "all_points" )
    {
      //Javelin run up handle
      if( this_class.options.Javelin.val )
      {
        var guideline1 = new Line( e1, p[2] ).split( this.options.Radius.val )[0];
        var guideline2 = new Line( e1, p[3] ).split( this.options.Radius.val )[0];
        var guide = new Line( guideline1.end, guideline2.end ).middle;
        var jav_handle = guide.subtract( g2.multiply( this.options.JavelinArea.val ) );
        this.handles.push( new Handle( jav_handle, -this.options.Angle.val + Math.PI / 2, "JavelinArea", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( guide, jav_handle );
          var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
          this_class.set_new_val( this_class.options.JavelinArea, new_length );

          var new_ps = this_class.drawing_points;
          var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[0].subtract( g2.multiply( this_class.options.Radius.val ) ) ) ], snapping_lines )[0];
          if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length += align_this.length;
          }
          else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
          {
            new_length -= align_this.length;
          }

          this_class.set_new_val( this_class.options.JavelinArea, new_length );

        }, function( new_length )
        {
          return this_class.set_new_val( this_class.options.JavelinArea, new_length );
        } ) );
      }
    }
    else
    {
      //
    }

  }

  fromCenterto4points( center )
  {
    var ls = this.options.LandingSector.val;
    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_ccw();
    var baseline = this.calculate_width( ); //trigonometri
    var height = Math.sqrt( Math.pow( ls, 2 ) - Math.pow( baseline / 2, 2 ) );

    var c0 = center;
    var c1 = c0.add( g1.multiply( this.options.Radius.val ) );
    var c2 = c0.add( g1.multiply( height ) ).add( g2.multiply( baseline / 2 ) ); //left end of line (Landing sector)
    var c3 = c0.add( g1.multiply( height ) ).add( g2.multiply( -baseline / 2 ) ); //right end of line (Landing sector)

    return [ c0, c1, c2, c3 ];
  }

  from2to4points( points )
  {
    var ls = this.options.LandingSector.val;
    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_ccw();
    var baseline = this.calculate_width( ); //trigonometri
    var height = Math.sqrt( Math.pow( ls, 2 ) + Math.pow( baseline / 2, 2 ) );

    var c0 = points[0];
    var c1 = points[1];
    var c2 = c0.add( g1.multiply( height ) ).add( g2.multiply( baseline / 2 ) ); //left end of line (Landing sector)
    var c3 = c0.add( g1.multiply( height ) ).add( g2.multiply( -baseline / 2 ) ); //right end of line (Landing sector)

    this.options.Radius.val = new Line( c0, c1 ).length;

    return [ c0, c1, c2, c3 ];
  }

  center_corner_to2points( points ) //ikke optimal
  {
    var c0 = points[0];
    var c2 = points[1];
    var left_line = new Line( c0, c2 );
    var throwAngle_rad = this.options.ThrowAngle.val * (2 * Math.PI / 360);
    this.options.Angle.val = left_line.angle - throwAngle_rad / 2;
    var new_ls = left_line.length;
    this.options.LandingSector.val = new_ls;

    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var c1 = c0.add( g1.multiply( this.options.Radius.val ) );

    return [ c0, c1 ];

  }

  from3to4points( points ) //ikke optimal
  {
    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_ccw();

    var c0 = points[0];
    var c1 = points[1];
    var c2 = points[2]; //left end of line (Landing sector)

    this.options.Radius.val = new Line( c0, c1 ).length;

    var new_ls = new Line( c0, c2 ).length;

    this.options.LandingSector.val = new_ls;
    var baseline = this.calculate_width( ); //trigonometri
    var height = Math.sqrt( Math.pow( new_ls, 2 ) + Math.pow( baseline / 2, 2 ) );

    var c3 = c0.add( g1.multiply( height ) ).add( g2.multiply( -baseline / 2 ) ); //right end of line (Landing sector)


    return [ c0, c1, c2, c3 ];
  }

  convert_to_free_hand()
  {
    // Calculate width,length,angle
    var p = this.drawing_points;
    var throw_line = new Line( p[0], p[1] );
    var e1 = p[0]; // throw circle center
    var e2 = new Line( p[3], p[4] ).middle; // between Landing sector ends
    var m = new Line( e1, e2 );

    //this.options.Angle.val = m.as_vector.angle;
    this.options.Angle.val = throw_line.as_vector.angle;

    this.points = [ p[0] ];
    this.layout_method = "free_hand";
    delete this.calculated_drawing_points;
    this.draw();
  }

  set_new_val( option, new_val )
  {
    if( option.name === "Angle" || new_val > 0 )
    {
      option.val = new_val;
      this.draw();
      return true;
    }
    return false;
  }

  get info_options( )
  {
    return [ "LandingSector" ];
  }

  calculate_width( )
  {
    var ls = this.options.LandingSector.val;
    var this_class = this;
    var throwAngle_rad = this_class.options.ThrowAngle.val * (2 * Math.PI / 360);
//    var other_angle = ((180 - this_class.options.ThrowAngle.val) / 2) * (2 * Math.PI / 360); //radians
//    if( landing_sector > this_class.options.Radius.val )
//      var new_width = Math.abs( landing_sector ) / Math.sin( ((180 - this_class.options.ThrowAngle.val) / 2) * Math.PI / 180 ) * Math.sin( (this_class.options.ThrowAngle.val) * Math.PI / 180 ); //ligebenet trekant, bredden = grundlinjen
//    else
//      var new_width = Math.abs( this_class.options.Radius.val ) / Math.sin( ((180 - this_class.options.ThrowAngle.val) / 2) * Math.PI / 180 ) * Math.sin( (this_class.options.ThrowAngle.val) * Math.PI / 180 ); //ligebenet trekant, bredden = grundlinjen
    var new_width = Math.sqrt( 2 * Math.pow( ls, 2 ) - (2 * Math.pow( ls, 2 ) * Math.cos( throwAngle_rad )) ); //cosinusrelation
    //var new_width = ls / Math.sin( other_angle ) * Math.sin( throwAngle_rad );
    return new_width;
  }

  draw()
  {
    this.tasks = [ ];
    this.start_locations = [ ];
    delete this.calculated_drawing_points;
  
    if (this.options.correctForLineWidth.val) {
      this.newDraw();
    }
    else {
      this.oldDraw();
    }
  }
  newDraw() {
    let points = this.drawing_points;
    const centerPoint = points[0];
    const leftPoint = points[2];
    const rightPoint = points[3];
    const middlePoint = new Line(leftPoint, rightPoint).middle;
    const verticalGuide = new Line(leftPoint, rightPoint).unit_vector;
    const horizontalGuide = new Line(centerPoint, middlePoint).unit_vector;

    let sidePoints = [];
    let temp;

    this.start_locations.push( new StartLocation(centerPoint, this.tasks.length));
    if (this.options.noCage.val) {
      temp = this.drawThrowingCircle(centerPoint, verticalGuide, horizontalGuide);
      sidePoints = sidePoints.concat(temp);
    }
    
    temp = this.drawLandingSector(centerPoint, leftPoint, rightPoint, horizontalGuide);
    sidePoints = sidePoints.concat(temp);

    this.refresh_bb( sidePoints );
    this.refresh_handles( );
    this.refresh_test_run( sidePoints );
    this.refresh_snapping_lines( sidePoints );
  }
  calculateCorrectedCenter(centerPoint, horizontalGuide) {
    const halfAngleInRadians = (this.options.ThrowAngle.val / 2) * (Math.PI / 180);
    const correctionDistance = (this.options.LineWidth.val / 2) / Math.sin(halfAngleInRadians);    
    const correctedCenter = centerPoint.subtract(horizontalGuide.multiply(correctionDistance));
    return [correctionDistance, correctedCenter];
  }
  drawThrowingCircle(centerPoint, verticalGuide, horizontalGuide) {
    if (!this.options.Javelin.val) {
      let leftCircleGuide = centerPoint.subtract(verticalGuide.multiply(this.options.Radius.val));
      let rightCircleGuide = centerPoint.add(verticalGuide.multiply(this.options.Radius.val));
      let leftLineOuterPoint = leftCircleGuide.subtract(verticalGuide.multiply(0.75 - this.options.LineWidth.val)); // Line should be 0.75 meters total
      let rightLineOuterPoint = rightCircleGuide.add(verticalGuide.multiply(0.75 - this.options.LineWidth.val)); // Line should be 0.75 meters total

      this.start_locations.push( new StartLocation(leftLineOuterPoint, this.tasks.length));
      this.tasks.push(new LineTask(this.tasks.length, [leftLineOuterPoint, leftCircleGuide], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [rightCircleGuide, rightLineOuterPoint], false, true));
      this.tasks.push(new ArcTask(this.tasks.length, [leftCircleGuide, rightCircleGuide], centerPoint, true, false, true));

      const rearArcPoint = centerPoint.subtract(horizontalGuide.multiply(this.options.Radius.val));

      return [rightLineOuterPoint, rearArcPoint, leftLineOuterPoint];
    }
    else {
      return this.drawJavelinThrowingRunUp(centerPoint, verticalGuide, horizontalGuide);
    }
  }
  drawJavelinThrowingRunUp(centerPoint, verticalGuide, horizontalGuide) {
    const correctedCenter = this.calculateCorrectedCenter(centerPoint, horizontalGuide)[1];

    const leftGuidePoint = correctedCenter.subtract(verticalGuide.multiply((this.options.Radius.val / 4) + (this.options.LineWidth.val / 2)));
    const leftGuideLine = new Line(leftGuidePoint, leftGuidePoint.add(horizontalGuide.multiply(this.options.LandingSector.val)));
    const rightGuidePoint = correctedCenter.add(verticalGuide.multiply((this.options.Radius.val / 4) + (this.options.LineWidth.val / 2)));
    const rightGuideLine = new Line(rightGuidePoint, rightGuidePoint.add(horizontalGuide.multiply(this.options.LandingSector.val)));
    
    // Order is intentional to optimize robot path
    const leftLineEnd = leftGuideLine.crosses_with_circle(centerPoint, this.options.Radius.val)[1];
    const leftLineStart = leftLineEnd.subtract(horizontalGuide.multiply(this.options.JavelinArea.val));
    const rightLineStart = rightGuideLine.crosses_with_circle(centerPoint, this.options.Radius.val)[1];
    const rightLineEnd = rightLineStart.subtract(horizontalGuide.multiply(this.options.JavelinArea.val));

    this.start_locations.push( new StartLocation(rightLineStart, this.tasks.length));
    this.tasks.push( new LineTask(this.tasks.length, [rightLineStart, rightLineEnd], false, true));
    this.tasks.push( new LineTask(this.tasks.length, [leftLineStart, leftLineEnd], false, true));


    const leftHorizontal = leftLineEnd.subtract(verticalGuide.multiply( 0.75 + this.options.LineWidth.val / 2));                  
    const rightHorizontal = rightLineStart.add(verticalGuide.multiply( 0.75 + this.options.LineWidth.val / 2));


    const midPoint = new Line(leftLineEnd, rightLineStart).middle;
    const temp = new Line(midPoint, midPoint.add(horizontalGuide.multiply(20)));
    const circlePoint = temp.crosses_with_circle(centerPoint, this.options.Radius.val)[0];

    this.tasks.push( new LineTask( this.tasks.length, [leftHorizontal, leftLineEnd], false, true));
    this.tasks.push( new LineTask( this.tasks.length, [rightLineStart, rightHorizontal], false, true));
    this.tasks.push( new ArcTask( this.tasks.length, [leftLineEnd, circlePoint, rightLineStart], correctedCenter, true, false, true ));

    return [rightHorizontal, rightLineEnd, leftLineStart, leftHorizontal];
   // New changes end here
  }

  drawLandingSector(centerPoint, leftPoint, rightPoint, horizontalGuide) {
    const leftGuideVector = new Line(centerPoint, leftPoint).unit_vector;
    const rightGuideVector = new Line(centerPoint, rightPoint).unit_vector;   
    const correctedCenter = this.calculateCorrectedCenter(centerPoint, horizontalGuide)[1];

    let leftStart;
    let leftEnd;
    let rightStart;
    let rightEnd;


    if(this.options.noCage.val) {
      const leftGuideLine = new Line(correctedCenter, correctedCenter.add(leftGuideVector.multiply(this.options.LandingSector.val)));
      const rightGuideLine = new Line(correctedCenter, correctedCenter.add(rightGuideVector.multiply(this.options.LandingSector.val)));

      // Order is intentional to optimize robot path
      leftStart = leftGuideLine.crosses_with_circle(centerPoint, this.options.Radius.val)[1];
      leftEnd = leftStart.add(leftGuideVector.multiply(this.options.LandingSector.val - this.options.Radius.val));
      rightEnd = rightGuideLine.crosses_with_circle(centerPoint, this.options.Radius.val)[1];
      rightStart = rightEnd.add(rightGuideVector.multiply(this.options.LandingSector.val - this.options.Radius.val));
    }
    else {
      // Order is intentional to optimize robot path
      leftStart = correctedCenter.add(leftGuideVector.multiply(this.options.noCageLength.val));
      leftEnd = leftStart.add(leftGuideVector.multiply(this.options.LandingSector.val));
      rightEnd = correctedCenter.add(rightGuideVector.multiply(this.options.noCageLength.val));
      rightStart = rightEnd.add(rightGuideVector.multiply(this.options.LandingSector.val));

      // leftStart = correctedCenter.add(leftGuideVector.multiply(this.options.LandingSector.val));
      // rightStart = correctedCenter.add(rightGuideVector.multiply(this.options.LandingSector.val));

      // leftEnd = correctedCenter;
      // rightEnd = correctedCenter;
    }

    this.tasks.push(new LineTask(this.tasks.length, [leftStart, leftEnd], false, true));
    if(!this.options.OneWay.val) {
      this.tasks.push(new LineTask(this.tasks.length, [rightStart, rightEnd], false, true));
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [rightEnd, rightStart], false, true));
    }
    
    if (this.options.Interval.val > 0 && this.options.Interval.val < this.options.LandingSector.val) {
      const midGuidePoint = new Line(leftEnd, rightStart).middle;
      const midGuideVector = new Line(centerPoint, midGuidePoint).unit_vector;
      this.drawIntervals(centerPoint, horizontalGuide, leftGuideVector, midGuideVector, rightGuideVector);
    }
    return [leftEnd, rightStart];
  }
  drawIntervals(centerPoint, horizontalGuide, leftGuideVector, midGuideVector, rightGuideVector) {
    const corrections = this.calculateCorrectedCenter(centerPoint, horizontalGuide);
    const correctionDistance = corrections[0];
    const correctedCenter = corrections[1];
    
    let leftPoints = [];
    let midPoints = [];
    let rightPoints = [];

    const start = correctionDistance + this.options.Interval.val + this.options.Radius.val - (this.options.LineWidth.val / 2);
    let current = start;
    const until = this.options.LandingSector.val;
    const increment = this.options.Interval.val;
        
    while (current < until) {
      leftPoints.push(correctedCenter.add(leftGuideVector.multiply(current)));
      midPoints.push(correctedCenter.add(midGuideVector.multiply(current)));
      rightPoints.push(correctedCenter.add(rightGuideVector.multiply(current)));

      current += increment; // Termination
    }
    const lngth = midPoints.length;
    for (let i = 0; i < lngth; i++) {
      if (i % 2 == 0 && !this.options.OneWay.val) {
        this.start_locations.push(new StartLocation(rightPoints[i], this.tasks.length));
        this.tasks.push( new ArcTask( this.tasks.length, [ rightPoints[i], midPoints[i], leftPoints[i] ], centerPoint, false, false, true ) );
      }
      else {
        this.start_locations.push(new StartLocation(leftPoints[i], this.tasks.length));
        this.tasks.push( new ArcTask( this.tasks.length, [ leftPoints[i], midPoints[i], rightPoints[i] ], centerPoint, true, false, true ) );
      }
    }
  }
  oldDraw() {
    var p = this.drawing_points;
    var center = p[0]; //circle center
    var kickboard = p[1]; //center of kickboard
    var ls_left = p[2]; //left side of Landing Sector
    var ls_right = p[3]; //right side of Landing Sector
    //var g2 = new Line( center, kickboard ).unit_vector;
    var g2 = (new Vector( 1, 0 )).rotate( this.options.Angle.val );
    var g1 = g2.rotate_90_ccw();
    var g3 = new Line(ls_left, center).unit_vector;
    var g4 = new Line(ls_right, center).unit_vector;
    var circle_left = center.add( g1.multiply( this.options.Radius.val ) ); //left
    var circle_right = center.add( g1.multiply( -this.options.Radius.val ) ); //right

    var corner2corner = new Line( ls_left, ls_right ); //Landing Sector corners

    var line_left = new Line( center, ls_left );
    var line_mid = new Line( center, corner2corner.middle );
    var line_right = new Line( center, ls_right );

    var new_left = [ line_left.add_to_end( -line_left.length + this.options.Radius.val ) ];
    var new_mid = [ line_mid.add_to_end( -line_mid.length + this.options.Radius.val ) ];
    var new_right = [ line_right.add_to_end( -line_right.length + this.options.Radius.val ) ];

    var guide_left = new Line( new_left[0].end, ls_left );
    var guide_mid = new Line( new_mid[0].end, corner2corner.middle );
    var guide_right = new Line( new_right[0].end, ls_right );

    var g3 = new Line(ls_left, new_left[0].end).unit_vector;
    var g4 = new Line(ls_right, new_right[0].end).unit_vector;

    if(this.options.noCage.val){
    //circle
      if( !this.options.Javelin.val )
      {
        this.start_locations.push( new StartLocation( circle_right, this.tasks.length ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ circle_right, circle_left ], center, true, false, true ) );
      }
      else
      {
        this.start_locations.push( new StartLocation( new_left[0].end.add( g1.multiply( 0.75 ) ), this.tasks.length ) );
        this.tasks.push( new LineTask( this.tasks.length, [ new_left[0].end.add( g1.multiply( 0.75 - this.options.LineWidth.val / 2 ) ), new_left[0].end ], false, true ) );
        this.tasks.push( new ArcTask( this.tasks.length, [ new_left[0].end, new_mid[0].end, new_right[0].end ], center, true, false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ new_right[0].end, new_right[0].end.add( g1.multiply( -0.75 + this.options.LineWidth.val / 2 ) ) ], false, true ) );
      }
      //lines by circle
      if( !this.options.Javelin.val )
      {
        this.tasks.push( new LineTask( this.tasks.length, [ circle_right.add( g1.multiply( -0.75 + this.options.LineWidth.val / 2 ) ),
          circle_right ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ circle_left,
          circle_left.add( g1.multiply( 0.75 - this.options.LineWidth.val / 2 ) ) ], false, true ) );
     }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ new_right[0].end,
          new_right[0].end.subtract( g2.multiply( this.options.JavelinArea.val - this.options.LineWidth.val / 2 ) ) ], false, true ) );
        this.tasks.push( new LineTask( this.tasks.length, [ new_left[0].end.subtract( g2.multiply( this.options.JavelinArea.val - this.options.LineWidth.val / 2 ) ),
          new_left[0].end ], false, true ) );
      }
    }
    if(!this.options.noCage.val)
    {
      var ls_left2 = ls_left.add(g3.multiply(this.options.LandingSector.val - this.options.noCageLength.val));
      var ls_right2 = ls_right.add(g4.multiply(this.options.LandingSector.val - this.options.noCageLength.val));
      this.tasks.push( new LineTask( this.tasks.length, [ ls_left2, ls_left ], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ ls_right, ls_right2 ], false, true ) );
    }
    else
    {
    //Landing sector
    this.tasks.push( new LineTask( this.tasks.length, [ new_left[0].end, ls_left ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [ ls_right, new_right[0].end ], false, true ) );
    }
    var interval = this.options.Radius.val - this.options.LineWidth.val / 2;
    var last_mid;
    if( this.options.Interval.val !== 0 )
    {
      for( var i = 0; i < Math.floor( this.options.LandingSector.val / this.options.Interval.val ); i++ )
      {
        interval = interval + this.options.Interval.val;
        if( interval <= this.options.Radius.val )
          continue;
        if( interval > this.options.LandingSector.val )
          continue;
        //make arcs

        var left = guide_left.crosses_with_circle( center, interval, true )[0];
        var mid = guide_mid.crosses_with_circle( center, interval, true )[0];
        last_mid = mid;
        var right = guide_right.crosses_with_circle( center, interval, true )[0];
        //draw them
        if( this.options.OneWay.val )
          this.tasks.push( new ArcTask( this.tasks.length, [ left, mid, right ], center, true, false, true ) );
        else
        {
          if( i % 2 === 0 )
            this.tasks.push( new ArcTask( this.tasks.length, [ left, mid, right ], center, true, false, true ) );
          else
            this.tasks.push( new ArcTask( this.tasks.length, [ right, mid, left ], center, false, false, true ) );
        }
      }
    }
    var side_points = [ new_left[0].end, ls_left, last_mid, ls_right, new_right[0].end ];

    this.refresh_bb( side_points );
    this.refresh_handles( );
    this.refresh_test_run( side_points );
    this.refresh_snapping_lines( side_points );
  }

  refresh_test_run( side_points )
  {
    this.test_tasks = [ ];
    side_points.forEach( ( p ) =>
    {
      if( p )
        this.test_tasks.push( new WaypointTask( this.test_tasks.length, p ) );
    } );

  }
  refresh_snapping_lines( side_points )
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;
    var g1 = new Line( p[0], p[1] ).unit_vector;
    var g2 = g1.rotate_90_ccw();


    //this.bb = [p[0], p[3], p[4], p[7]];
    // this.snapping_lines.push( new Line( p[0], p[1] ) );
    this.snapping_lines.push( new Line( side_points[0], side_points[4] ) );
    this.snapping_lines.push( new Line( p[0], p[1] ) );
    this.snapping_lines.push( new Line( p[0], p[2] ) );
    this.snapping_lines.push( new Line( p[0], p[3] ) );

    //for ( var i = 0; i < p.length - 1; i++ )
    //    this.snapping_lines.push( new Line( p[i], p[i + 1] ) );

    var e1 = p[0];
    var e2 = new Line( p[2], p[3] ).middle;
    var m1 = new Line( e1, e2 );
    var m2 = m1.rotate_90_cw;
    //
    // this.snapping_lines.push( m1 );
    // this.snapping_lines.push( m2 );

  }
  refresh_bb( side_points )
  {
    //this.bb = this.drawing_points;
    //var p = this.drawing_points;
    this.bb = side_points.filter( function( p )
    {
      return p;
    } );
  }
}

class AthleticsDiscus extends AthleticsFieldEvents
{
  static template_type = "Athletics"; // Translateable
  static template_title = "Discus"; // Translateable
  static template_id = "athletics_discus"; // no spaces
  static template_image = "img/templates/athletics_discus_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    var this_class = this;
    this.options.Radius.val = 2.50 / 2;
    this.options.ThrowAngle.val = 34.92;
    this.options.Interval.val = 20;
    this.options.LandingSector._val = 80;

  }
}

class AthleticsHammer extends AthleticsFieldEvents
{
  static template_type = "Athletics"; // Translateable
  static template_title = "Hammer"; // Translateable
  static template_id = "athletics_hammer"; // no spaces
  static template_image = "img/templates/athletics_hammer_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    var this_class = this;
    this.options.Radius.val = 2.135 / 2;
    this.options.ThrowAngle.val = 34.92;
    this.options.Interval.val = 20;
    this.options.LandingSector._val = 90;

  }
}

class AthleticsJavelin extends AthleticsFieldEvents
{
  static template_type = "Athletics"; // Translateable
  static template_title = "Javelin"; // Translateable
  static template_id = "athletics_javelin"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    var this_class = this;
    this.options.Radius.val = 8;
    this.options.ThrowAngle.val = 28.955;
    this.options.Interval.val = 20;
    this.options.LandingSector._val = 100;
    this.options.Javelin.val = true;
  }

  /*static get_point_positions( layout_method )
   {
   if( layout_method === "center,throwdirection" )
   {
   return [
   new Vector( 0.48, 1 ),
   new Vector( 0.48, 0.96 )
   ]
   }
   //    if( layout_method === "center,landingsector_end" )
   //    {
   //      return [
   //        new Vector( 0.48, 1 ),
   //        new Vector( 0.02, 0.01 )
   //      ]
   //    }
   //    if( layout_method === "all_points" )
   //    {
   //      return [
   //        new Vector( 0.48, 1 ),
   //        new Vector( 0.48, 0.96 ),
   //        new Vector( 0.02, 0.01 )
   //          //new Vector( 0.98, 0.01 )
   //      ]
   //    }
   }*/
}

class AthleticsShotput extends AthleticsFieldEvents
{
  static template_type = "Athletics"; // Translateable
  static template_title = "Shotput"; // Translateable
  static template_id = "athletics_shotput"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    var this_class = this;
    this.options.Radius.val = 2.135 / 2;
    this.options.ThrowAngle.val = 34.92;
    this.options.Interval.val = 20;
    this.options.LandingSector._val = 25;
  }

  /*static get_point_positions( layout_method )
   {
   if( layout_method === "center,throwdirection" )
   {
   return [
   new Vector( 0.48, 1 ),
   new Vector( 0.48, 0.96 )
   ]
   }
   //    if( layout_method === "center,landingsector_end" )
   //    {
   //      return [
   //        new Vector( 0.48, 1 ),
   //        new Vector( 0.02, 0.01 )
   //      ]
   //    }
   //    if( layout_method === "all_points" )
   //    {
   //      return [
   //        new Vector( 0.48, 1 ),
   //        new Vector( 0.48, 0.96 ),
   //        new Vector( 0.02, 0.01 )
   //          //new Vector( 0.98, 0.01 )
   //      ]
   //    }
   }*/
}