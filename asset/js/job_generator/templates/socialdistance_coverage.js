/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Infinity */

class SocialDistanceCoverage extends Job
{
  static template_type = "Social Distance Coverage"; // Translateable
  static template_title = "Standard"; // Translateable
  static template_id = "socialdistance_coverage_beta"; // no spaces
  static template_image = "img/templates/geometry_coverage.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.show_path_between_task = true;
    //this.options["fast_test"].val = false;
    //this.options["normal_test"].val = false;

    var this_class = this;
    this.options.Orientation = {
      configurable: false,
      name: "Orientation",
      val: 0,
      type: "float",
      units: "deg"
    };
    this.options.LineSpacing = {
      configurable: false,
      name: "Line spacing",
      val: 1.0,
      type: "float"
    };
    this.options.BufferZone = {
      configurable: true,
      name: "Buffer zone",
      val: 1,
      type: "float"
    };
    this.options.DrawBufferZone = {
      configurable: false,
      name: "Draw buffer zone",
      //val: false,
      get val()
      {
        return false;
      },
      set val( v )
      { },
      type: "bool",
      dontsave: true
    };

    this.options.OptimizeRoute = {
      configurable: false,
      adjustable: false,
      name: "Optimize route",
      get val()
      {
        return true;
      },
      set val( v )
      {},
      type: "bool"
    };

    this.options.ButtomText = {
      get val()
      {
        if( this_class.options.OptimizeRoute.val )
          return "Route is optimized";
        else
          return "";
      },
      set val( v )
      {},
      type: "string"
    };


    // for debug
    this.options.MaxZones = {
      configurable: false,
      name: "Max Zones",
      get val()
      {
        return -1;
      },
      set val( v )
      {},
      type: "int"
    };

    this.options.OnlyDraw = {
      configurable: false,
      name: "Only Draw",
      get val()
      {
        return -1;
      },
      set val( v )
      {},
      type: "int"
    };

    this.options.make_dots = {
      configurable: false,
      name: "make dots",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        if( v )
          this_class.options.make_dash.val = false;
      },
      type: "bool",
      parent: "make_dash"
    };
    this.options.make_dash = {
      configurable: true,
      name: "make dash",
      _val: false,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v;
        if( v )
          this_class.options.make_dots.val = false;
      },
      type: "bool"
    };

    this.options.dot_distance = {
      get configurable()
      {
        return false
      },
      get name()
      {
        if( this_class.options.make_dots.val )
          return "Dot distance";
        else
          return "Center to center";
      },
      val: 1.0,
      type: "float",
      parent: "make_dots"
    };
    this.options.dash_length = {
      get configurable()
      {
        return this_class.options.make_dash.val;
      },
      get name()
      {
        return "Dash length";
      },
      val: 0.2,
      type: "float",
      parent: "dot_distance"
    };

    this.options.dot_offset = {
      get configurable()
      {
        return false;
      },
      get name()
      {
        if( this_class.options.make_dots.val )
          return "Dot offset";
        else
          return "Dash offset";
      },
      val: 0.0,
      type: "float",
      parent: "make_dots"
    };
  
    this.options.box_width = {
      configurable: true,
      name: "Box width",
      type: "float",
      _val: 1,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v > 0 )
          this._val = v;
        
      },
    }
    this.options.box_space = {
      configurable: true,
      name: "Distance between boxes",
      type: "float",
      _val: 2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v >= 0 )
          this._val = v;
      },
    }
  }

  get info_options()
  {
    return [ ];
  }

  static get layout_methods()
  {
    return {
      "n_ends": -1,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "n_ends" )
    {
      return [
        new Vector( 0.38, 0.05 ),
        new Vector( 0.88, 0.33 ),
        new Vector( 0.83, 0.94 ),
        new Vector( 0.17, 0.92 ),
        new Vector( 0.1, 0.43 )
      ];
    }
  }

  get center()
  {
    var sum = new Vector( 0, 0 );
    // move to zero
    var pzeros = this.points.map( ( p ) => {
      return p.subtract( this.points[0] );
    } );
    // sum small vectors
    pzeros.forEach( ( p ) => {
      sum = sum.add( p );
    } );
    // get average
    sum = sum.divide( this.points.length );
    // move back to original
    return sum.add( this.points[0] );
  }
  get drawing_points()
  {
    /*
     if( this.layout_method !== "free_hand" )
     this.options.Angle.val = (new Line( points[0], points[1] )).angle;
     */
    return this.points;
  }
  make_task( ends )
  {
    //this.tasks.push( new LineTask( this.tasks.length, ends, false, true ) );
    let dist = ends[0].dist_to_point(ends[1]);
    let g1 = new Line(ends[0], ends[1]).unit_vector;
    let direction_check = 0;
    if(g1.x === -1)
    {
      g1 = new Line(ends[1], ends[0]).unit_vector;
      direction_check = 1;
    }
    let numBox = dist/(this.options.box_width.val + this.options.box_space.val);      
    for(let i = 0;i<numBox;i++)
    {
    let c1;
    if(direction_check ===1)
      c1 = ends[1].add(g1.multiply((this.options.box_width.val + this.options.box_space.val)*i));  
    else
      c1 = ends[0].add(g1.multiply((this.options.box_width.val + this.options.box_space.val)*i));
            
      let c2 = c1.add(g1.multiply(this.options.box_width.val));
      let c3 = c2.add(g1.multiply(this.options.box_width.val).rotate_90_ccw());
      
      let c4 = c3.subtract(g1.multiply(this.options.box_width.val));
      this.tasks.push( new LineTask( this.tasks.length, [c1,c2], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [c2,c3], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [c3,c4], false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [c4,c1], false, true ) );     
    }
  }

  sort_tasks()
  {
      /* --- sort route --- */
    this.tasks = this.tasks.map( t => {
        if( t.start_direction.normalizeAngle >= Math.PI )
          return t.opposite_direction;
        else
          return t;
      } );

      this.tasks.forEach( t => {
        t.sort_a_90 = parseFloat( t.start_direction.normalizeAngle.toPrecision( 5 ) % (Math.PI / 2) );
        t.sort_a = parseFloat( t.start_direction.normalizeAngle.toPrecision( 5 ) );

        var p = new Vector( t.start.x, t.start.y );
        p = p.rotate( -t.sort_a );
        t.sort_y = parseFloat( (-p.y).toPrecision( 4 ) );
        t.sort_x = parseFloat( p.x.toPrecision( 4 ) );


      } );


      //this.tasks = this.tasks.sort_objects( [ "a", "p", "x" ] );
      this.tasks = this.tasks.sort_objects( [ "sort_a_90", "sort_a", "sort_y", "sort_x" ] );

      var last_angle = 0;
      var last_y = 0;
      var index = -1;
      var parts = [ ];
      this.tasks.forEach( t => {
        if( t.sort_y !== last_y )
        {
          index++;
          parts[index] = [ ];
        }
        if( last_angle !== t.sort_a )
        {
          index++;
          parts[index] = [ ];
        }
        last_angle = t.sort_a;
        last_y = t.sort_y;

        if( parts[index] )
          parts[index].push( t );
      } );

      parts = parts.map( ( a, i ) => {
        if( i % 2 )
        {
          a.reverse();
          return a.map( t => {
            return t.opposite_direction;
          } );
        }
        else
          return a;
      } );
      this.tasks = parts.flat();
      
    if(this.tasks.length > 0){
      this.tasks.last().task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
      this.tasks.last().task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
    }
  }

  border_is_clockwise()
  {
    var p = this.points.copy();
    p.push( p[0] );
    var sum = 0;
    for( var i = 0; i < this.points.length; i++ )
    {
      var v1 = p[i];
      var v2 = p[i + 1];
      sum += (v2.x - v1.x) * (v2.y + v1.y);
    }
    return sum > 0;
  }

  route_between_points( start, goal, border, points, point_map, maximum_posible_dist )
  {
    function new_Node( g, state, cameFrom, state_id )
    {
      let h = state.dist_to_point( goal );
      let node = {
        state: state,
        state_id: state_id,
        h: h,
        g: g,
        f: g + h,
        from: cameFrom
      };
      return node;
    }
    function id_in( state_id, list )
    {
      let found = false;
      list.forEach( l => {
        if( l.state_id === state_id )
          found = l;
      } );
      return found;
    }

    points = points.slice( 0 );

    //point_map = point_map.slice( 0 );
    point_map = point_map.map( pm => {
      return pm.slice( 0 );
    } );
    let goal_neighboors = [ ];
    for( let i = 0; i < points.length; i++ )
    {
      let p = points[i];
      let l = new Line( goal, p );
      if( !this.check_if_line_is_outside( l, maximum_posible_dist, border ) )
      {
        point_map[ i ].push( points.length );
        goal_neighboors.push( i );
      }
    }
    if( goal_neighboors.indexOf( goal.border_line_index ) < 0 )
      point_map[ goal.border_line_index ].push( points.length );
    if( goal_neighboors.indexOf( (goal.border_line_index + 1) % points.length ) < 0 )
      point_map[ (goal.border_line_index + 1) % points.length ].push( points.length );
    points.push( goal );
    point_map.push( goal_neighboors );

    let frontier = [ ];
    let current = new_Node( 0, start, null, -1 );
    var start_neighboors = [ ];
    for( let i = 0; i < points.length; i++ )
    {
      let p = points[i];
      let l = new Line( start, p );
      if( !this.check_if_line_is_outside( l, maximum_posible_dist, border ) )
      {
        start_neighboors.push( i );
      }
    }
    if( start_neighboors.indexOf( start.border_line_index ) < 0 )
      start_neighboors.push( start.border_line_index );
    if( start_neighboors.indexOf( (start.border_line_index + 1) % (points.length - 1) ) < 0 )
      start_neighboors.push( (start.border_line_index + 1) % (points.length - 1) );

    start_neighboors.forEach( n => {
      let p = points[n];
      let l = new Line( start, p );
      frontier.push( new_Node( current.g + l.length, p, current, n ) );
    } );
    let explored = [ ];

    while( frontier.length && frontier.length < (points.length * 10) )
    {
      frontier = frontier.sort_objects( "f" );
      current = frontier.shift();
      explored.push( current );
      if( current.h < 0.001 ) // current state is at goal, break loop and find solution
        break;

      point_map[current.state_id].forEach( neighboot_id => {
        if( id_in( neighboot_id, explored ) )
          return;
        let p = points[neighboot_id];
        let l = new Line( current.state, p );
        let new_candidate = new_Node( current.g + l.length, p, current, neighboot_id );
        let another_node = id_in( neighboot_id, frontier );
        if( another_node )
        {
          if( another_node.g > new_candidate.g )
          {
            another_node.state = new_candidate.state;
            another_node.state_id = new_candidate.state_id;
            another_node.h = new_candidate.h;
            another_node.g = new_candidate.g;
            another_node.f = new_candidate.f;
            another_node.from = new_candidate.from;
          }
        }
        else
          frontier.push( new_candidate );
      } );

    }


    let node = current;
    let path = [ ];
    let total_length = node.f + node.h * 200;
    while( node.from !== null )
    {
      path.push( node.state );
      node = node.from;
    }
    //path.push( node.state );
    //console.log( start, goal, current, path );
    return [ total_length, path.reverse() ];
  }

  find_valid_crosses( line, border_lines )
  {
    var crosses = [ ];
    // Fond all crosses
    border_lines.forEach( bl => {
      var cross = line.cross_with_line( bl, true );
      if( cross )
      {
        cross.borders = [ bl ];
        crosses.push( cross );
      }
    } );
    // sort them from left to right
    crosses = crosses.sort_objects( "x" );
    // remove dublets
    crosses = crosses.filter( ( c, i ) => {
      if( i === 0 )
        return true;
      var close = c.veryclose( crosses[i - 1] );
      if( close )
        crosses[i - 1].borders = crosses[i - 1].borders.concat( c.borders );
      return !close;
    } );
    // remove pointy ends where the cross doesn't change from inside to outside or oposit
    crosses = crosses.filter( ( c ) => {
      if( c.borders.length === 1 )
      {
        return !(c.veryclose( c.borders[0].start ) || c.veryclose( c.borders[0].end ));
      }
      else
      {
        var end1 = c.borders[0].end;
        var end2 = c.borders[1].start;
        if( end1.veryclose( c ) )
        {
          end1 = c.borders[0].start;
          end2 = c.borders[1].end;
        }
        var gp1 = line.point_on_line( end1 );
        var gp2 = line.point_on_line( end2 );
        var g1 = (new Line( gp1, end1 )).unit_vector;
        var g2 = (new Line( gp2, end2 )).unit_vector;
        var null_vec = new Vector( 0, 0 );
        if( g1.veryclose( null_vec ) || g2.veryclose( null_vec ) )
          return false;
        if( g1.veryclose( g2 ) )
          return false;
        else
          return true;
      }
    } );
    return crosses;
  }

  check_if_line_is_outside( l, coverage_width, border_lines )
  {
    // start by checking if both ends of l is on the same border_line
    for( var bi = 0; bi < border_lines.length; bi++ )
    {
      let bl = border_lines[bi];
      var p1 = bl.point_on_line( l.start, true, true );
      var p2 = bl.point_on_line( l.end, true, true );

      if( p1 && p2 && p1.veryclose( l.start ) && p2.veryclose( l.end ) )
        return false;
    }


    // allways check from left to right
    if( l.start.x > l.end.x )
      l = l.reverse();
    // make a line that is guarantied to start and end outside the polygon
    var l_long = l.add_to_start( coverage_width ).add_to_end( coverage_width );
    // find all crosses on the long line
    var crosses = this.find_valid_crosses( l_long, border_lines );
    // if long line doesn't cross anywhere, the small lines doesn't either and it is outside.
    if( !crosses.length )
      return true;
    // find the crosses but limited to the actual line
    var small_crosses = this.find_valid_crosses( l, border_lines );
    if( small_crosses.length > 2 )
      return true;
    // figure out where the line start and end are on the long crosses to see where it starts
    var short_crosses_begins = -1;
    var short_crosses_ends = -1;
    for( var i = 0; i < crosses.length; i++ )
    {
      if( crosses[i].veryclose( l.start ) )
        short_crosses_begins = i;
      if( crosses[i].veryclose( l.end ) )
        short_crosses_ends = i;
    }

    // if not found then look on lines instead of only in the ends.
    if( short_crosses_begins === -1 || short_crosses_ends === -1 )
    {
      var inside_lines = [ ];
      for( var c = 1; c < crosses.length; c++ )
        inside_lines.push( new Line( crosses[c - 1], crosses[c] ) );
      if( short_crosses_begins === -1 )
      {
        inside_lines.forEach( ( il, i ) => {
          if( il.point_on_line( l.start, true, true ) )
            short_crosses_begins = i;
        } );
      }
      if( short_crosses_ends === -1 )
      {
        inside_lines.forEach( ( il, i ) => {
          if( il.point_on_line( l.end, true, true ) )
            short_crosses_ends = i + 1;
        } );
      }
    }

    //if -1 then outisde
    if( short_crosses_begins === -1 || short_crosses_ends === -1 )
      return true;
    return  !!(short_crosses_begins % 2) || (Math.abs( short_crosses_ends - short_crosses_begins ) > 1);
  }

  move_border( blines, dist )
  {
    var this_class = this;
    var concave_corners = this.find_concave_corners( blines );
    concave_corners.push( concave_corners.shift() );
    var original_border = blines.slice( 0 );
    var border_lines = blines.slice( 0 );
    var clockwise = this.border_is_clockwise();
    // move lines
    border_lines = border_lines.map( bl => {
      var g = bl.unit_vector;
      if( clockwise )
        g = g.rotate_90_cw();
      else
        g = g.rotate_90_ccw();
        return bl.move( g, dist );
      } );
      // find new crosses
      border_lines.forEach( ( bl, i ) => {
        var last_border_line = border_lines[(i + 1) % border_lines.length];
        var new_corner = bl.cross_with_line( last_border_line );
        bl.start = new_corner;
        last_border_line.end = new_corner;
      } );
      // remove pointy ends
      var new_points = [ ];
      border_lines.forEach( ( bl, i ) => {
        var original_border_line = original_border[(i + 1) % original_border.length];
        var g = new Line( original_border_line.start, bl.start );
        g = g.unit_vector;
        var new_point = g.multiply( dist ).add( original_border_line.start );
        //var p_check = original_border[i].point_on_line( new_point, true );
        //var d = (new Line( new_point, p_check )).length;
        //if( d >= (dist * 0.99) )
        if( concave_corners[i] )
        {
          var g_r = g.rotate_90_ccw();
          var g_l = new Line( new_point, new_point.add( g_r ) );
          var pl1 = bl.cross_with_line( g_l );
          var bl_n = border_lines[(i + 1) % border_lines.length];
          var g_l = new Line( new_point, new_point.add( g_r ) );
          var pl2 = bl_n.cross_with_line( g_l );
          new_points.push( pl1 );
          new_points.push( new_point );
          new_points.push( pl2 );
        }
        else
        {
          new_points.push( bl.start );
        }
    } );
    border_lines = [ ];
    for( var p = 1; p < new_points.length; p++ )
    border_lines.push( new Line( new_points[p - 1], new_points[p] ) );
    border_lines.push( new Line( new_points.last(), new_points[0] ) );
    //for(let k = 0; k < border_lines.length; k++)
     //this_class.tasks.push(border_lines[k].toLineTask(this_class.tasks.length, false, true));
    return border_lines;
  }

  make_waypoint_map( border_lines, points, cw )
  {

    var map = [ ];
    for( var i = 0; i < points.length; i++ )
      map.push( [ ] );
    for( var i1 = 0; i1 < points.length; i1++ )
    {
      for( var i2 = (i1 + 1); i2 < points.length; i2++ )
      {
        var p1 = points[ i1 ];
        var p2 = points[ i2 ];
        var l = new Line( p1, p2 );
        if( ((i2 - i1) === 1) || ((i2 - i1 + 1) === points.length) || !this.check_if_line_is_outside( l, cw, border_lines ) )
        {
          //this.make_task( [ p1, p2 ] );
          map[ i1 ].push( i2 );
          map[ i2 ].push( i1 );
        }
      }
    }

    return map;
  }
  make_border_lines_map( border_lines, point_map )
  {
    var map = [ ];
    // point_map[i] === border_lines[i].start

    for( var b1 = 0; b1 < border_lines.length; b1++ )
      map.push( [ b1 ] );

    for( var b1 = 0; b1 < border_lines.length; b1++ )
    {
      var b1_start = b1;
      var b1_end = (b1 + 1) % border_lines.length;
      for( var b2 = (b1 + 1); b2 < border_lines.length; b2++ )
      {
        var b2_start = b2;
        var b2_end = (b2 + 1) % border_lines.length;

        // b1_start -> b2_start
        var check_1 = (point_map[b1_start].indexOf( b2_start ) >= 0) || (b1_start === b2_start);
        // b1_start -> b2_end
        var check_2 = (point_map[b1_start].indexOf( b2_end ) >= 0) || (b1_start === b2_end);
        // b1_end -> b2_start
        var check_3 = (point_map[b1_end].indexOf( b2_start ) >= 0) || (b1_end === b2_start);
        // b1_end -> b2_end
        var check_4 = (point_map[b1_end].indexOf( b2_end ) >= 0) || (b1_end === b2_end);
        if( check_1 && check_2 && check_3 && check_4 )
        {
          map[b1].push( b2 );
          map[b2].push( b1 );
        }

      }
    }
    return map;
  }

  split_border( border_lines, from_id, to_id, split_point, p, reverse_search = false)
  {

    /*
     * The first line in borders[0] will be the border line with id from_id
     * It will then add lines until it reaches to_id
     * The line ehere id = to_id will have split_point as its end
     * a new border line will be added to the end of borders[0] that goes from split_point to p, where p is the start of the first line
     * 
     * Afters borders[0] is filled, it will continue from split_point and add the rest of line with to_id as id untill it reaches form_id again.
     * 
     * */


    var borders = [ [ ], [ ] ];

    var offset = 0;
    for( var i = 0; i < border_lines.length; i++ )
      if( border_lines[i].id === from_id )
        offset = i;

    var add_to = 0;
    for( var index = 0; index < border_lines.length; index++ )
    {
      var i = index;
      if( reverse_search )
        i = border_lines.length - index;
      if( border_lines[(i + offset) % border_lines.length].id === to_id )
      {
        add_to = 1;
        var split_this = border_lines[(i + offset) % border_lines.length];

        var l1, l2;
        if( !reverse_search )
        {
          l1 = new Line( split_this.start, split_point );
          l2 = new Line( split_point, split_this.end );
        }
        else
        {
          l2 = new Line( split_this.start, split_point );
          l1 = new Line( split_point, split_this.end );
        }
        l1.id = to_id;
        l2.id = to_id;

        var split_l1 = new Line( split_point, p );
        var split_l2 = new Line( p, split_point );

        borders[0].push( l1 );
        borders[0].push( split_l1 );

        borders[1].push( split_l2 );
        borders[1].push( l2 );

      }
      else
        borders[add_to].push( border_lines[(i + offset) % border_lines.length] );
    }
    return borders;

  }

  find_concave_corners( border_lines )
  {
    var concave_corners = border_lines.map( ( b2, i ) => {
      var i1 = i - 1;
      if( i1 < 0 )
        i1 += border_lines.length;

      //let b2 = border_lines[(i + 1) % border_lines.length];
      let b1 = border_lines[i1];
      let g1 = b1.angle;
      let g2 = b2.angle;
      let a = g2 - g1;
      if( a < -Math.PI )
        a += 2 * Math.PI;
      if( a > Math.PI )
        a -= 2 * Math.PI;
      return a < -0.0001;

    } );
    return concave_corners;
  }

  draw()
  {

    if( this.points.length === 1 )
    {
      var c = this.points[0];
      var p1 = c.add( new Vector( 5, 5 ) );
      var p2 = c.add( new Vector( -5, 5 ) );
      var p3 = c.add( new Vector( 0, -5 ) );
      this.points = [ p1, p2, p3 ];
    }
    this.options.LineSpacing.val =  (this.options.box_width.val + this.options.box_space.val)
    //console.log( this.id, "clockwize?", this.border_is_clockwise() );
    if( this.border_is_clockwise() )
      this.points = this.points.reverse();

    this.tasks = [ ];
    this.start_locations = [ ];
    var Orientation_angle = -this.options.Orientation.val; // radians
    // Move to zero
    var center = this.center;
    var p_zeros = this.points.map( p => {
      var at_center = p.subtract( center );
      var rotated = at_center.rotate( Orientation_angle );
      return rotated;
    } );
    // rotate to zero


    // Create border lines
    var border_lines = [ ];
    for( var p = 1; p < p_zeros.length; p++ )
      border_lines.push( new Line( p_zeros[p - 1], p_zeros[p] ) );
    border_lines.push( new Line( p_zeros.last(), p_zeros[0] ) );
    border_lines = border_lines.map( ( bl, i ) => {
      bl.id = i;
      return bl;
    } );
    var original_border = border_lines.slice( 0 );
    // update tasks

    // add buffer zone
    if( this.options.BufferZone.val )
    {
      border_lines = this.move_border( original_border, this.options.BufferZone.val );
    }
    border_lines.forEach( ( b, id ) => {
      b.id = id;
    } );

    // the end of a border_lines is where it checks the point for concave
    // border_lines[0].end => concave_corner[0]
    var concave_corners = this.find_concave_corners( border_lines );

    // find smallest and largest x and y
    var limits = find_bounding_box( p_zeros );
    var longest_dist = Math.sqrt( Math.pow( limits[1] - limits[0], 2 ) + Math.pow( limits[3] - limits[2], 2 ) ) * 2;


    // find points map
    var points = border_lines.map( bl => {
      return bl.start;
    } );
    var point_map = this.make_waypoint_map( border_lines, points, longest_dist );
    // find first

    var border_map = this.make_border_lines_map( border_lines, point_map );


    if( this.options.OptimizeRoute.val )
    {
      var first_zone = {
        full_border: border_lines,
        zone_border: border_lines,
        children: [ ],
        parent: null,
        forward: true
      };
      var zones = [ first_zone ];

      var zones_added = 0;
      while( zones.length > 0 )
      {
        if( zones_added === (border_lines.length * 2) || (this.options.MaxZones.val >= 0 && this.options.MaxZones.val <= zones_added) )
          break;
        zones_added++;
        var active_parent = zones.shift();
        var remaining_border = active_parent.full_border;
        var old_id = active_parent.p ? active_parent.p.id : false;

        var aranged_bottom_up_points = remaining_border.map( border_line => {
          border_line.start.id = border_line.id;
          return border_line.start;
        } ).filter( function( p )
        {
          return concave_corners[p.id];
        } ).sort_objects( "y" );

        /*if( old_id || old_id === 0 )
         {
         aranged_bottom_up_points = aranged_bottom_up_points.sort( ( a, b ) => {
         var d1 = a.id - old_id;
         var d2 = b.id - old_id;
         if( d1 > d2 )
         return -1;
         else if( d1 < d2 )
         return 1;
         else
         return 0;
         } );
         }*/

        //aranged_bottom_up_points.forEach( p => {
        for( var pi = 0; pi < aranged_bottom_up_points.length; pi++ )
        {
          var p = aranged_bottom_up_points[pi];
          if( concave_corners[p.id] )
          {
            var y = p.y;
            var l = new Line( new Vector( limits[0], y ), new Vector( limits[1], y ) );
            l = l.add_to_end( 10 ).add_to_start( 10 );
            var crosses = [ ];
            remaining_border.forEach( ( bl ) => {
              var cross = l.cross_with_line( bl, true );
              if( cross )
              {
                cross.border_line_index = bl.id;
                crosses.push( cross );
              }
            } );
            crosses = crosses.sort_objects( "x" );
            // remove dublets
            crosses = crosses.filter( ( c, i ) => {
              if( i === 0 )
                return true;
              var close = c.veryclose( crosses[i - 1] );
              return !close;
            } );

            var lines = [ ];
            for( let i = 1; i < crosses.length; i++ )
            {
              var l_part = new Line( crosses[i - 1], crosses[i] );
              l_part.start_at_border = crosses[i - 1].border_line_index;
              l_part.end_at_border = crosses[i].border_line_index;
              if( !this.check_if_line_is_outside( l_part, longest_dist, remaining_border ) )
                lines.push( l_part );
            }

            lines = lines.filter( l => {
              return p.veryclose( l.start ) || p.veryclose( l.end );
            } );

            if( lines.length )
            {
              if( lines.length === 1 )
              {
                var line = lines[0];
                if( lines[0].start.veryclose( p ) )
                {
                  // one part, p start on line
                  //this.make_task( [ p, line.end ] );
                  // keep up
                  var splittet_border = this.split_border( remaining_border, p.id, line.end_at_border, line.end, p );
                  active_parent.zone_border = splittet_border[0];
                  var new_child = {
                    full_border: splittet_border[1],
                    zone_border: splittet_border[1],
                    children: [ ],
                    parent: active_parent,
                    forward: true,
                    p: p
                  };
                }
                else
                {
                  // one part, p end on line
                  //this.make_task( [ line.start, p ] );
                  // keep down
                  var splittet_border = this.split_border( remaining_border, p.id, line.start_at_border, line.start, p );
                  active_parent.zone_border = splittet_border[1];
                  var new_child = {
                    full_border: splittet_border[0],
                    zone_border: splittet_border[0],
                    children: [ ],
                    parent: active_parent,
                    forward: true,
                    p: p
                  };
                }

                //if( this.options.MaxZones.val >= 0 && this.options.MaxZones.val <= zones_added )
                //  new_child.zone_border = new_child.full_border;

                concave_corners[p.id] = false;
                active_parent.children.push( new_child );
                zones.push( new_child );
                pi = aranged_bottom_up_points.length * 2;
              }
              else
              {
                var splittet_border1 = this.split_border( remaining_border, p.id, lines[1].end_at_border, lines[1].end, p );
                var splittet_border2 = this.split_border( remaining_border, p.id, lines[0].start_at_border, lines[0].start, p );
                var splittet_border3 = this.split_border( splittet_border1[1], p.id, lines[0].start_at_border, lines[0].start, p );

                var zone1 = splittet_border1[0];
                var zone2 = splittet_border2[1];
                var rest = splittet_border3[0];

                var check_both_zones = false;
                if( this.find_concave_corners( zone1 ).count( true ) || this.find_concave_corners( zone2 ).count( true ) )
                {
                  check_both_zones = true;
                  splittet_border1[0].last().id = splittet_border1[0][0].id - 1;
                  rest = splittet_border1[1];
                  zone2 = splittet_border2[0];
                  zone1 = this.split_border( splittet_border1[0], p.id - 1, lines[0].start_at_border, lines[0].start, p, true )[0].reverse();
                  zone1[0] = zone1[0].reverse();
                }
                //this.find_concave_corners( rest ).count( true ) 

                if( active_parent.parent )
                {
                  var only_zero = ( z ) => {
                    return z.angle.veryclose( 0 );
                  };
                  var less_zone1 = zone1.filter( only_zero );
                  var less_zone2 = zone2.filter( only_zero );
                  var less_parent_zone = active_parent.parent.zone_border.filter( z => {
                    return z.angle.veryclose( Math.PI );
                  } );
                  //console.log( zone1, zone2, active_parent.parent.zone_border );
                  //console.log( less_zone1, less_zone2, less_parent_zone );

                  if( less_zone1.length === 0 && less_zone2.length > 0 )
                  {
                    zone2 = splittet_border1[0];
                    zone1 = splittet_border2[1];
                  }
                }
                //else
                //  console.log( "no parent" );

                active_parent.zone_border = zone1;
                var new_child1 = {
                  full_border: rest,
                  zone_border: rest,
                  children: [ ],
                  parent: active_parent,
                  forward: true,
                  p: p
                };
                //if( this.options.MaxZones.val >= 0 && this.options.MaxZones.val <= zones_added )
                //  new_child1.zone_border = new_child1.full_border;

                var new_child2 = {
                  full_border: zone2,
                  zone_border: zone2,
                  children: [ ],
                  parent: active_parent,
                  forward: true,
                  p: p
                };



                concave_corners[p.id] = false;
                active_parent.children.push( new_child1 );
                zones.push( new_child1 );
                if( check_both_zones )
                {
                  active_parent.children.push( new_child2 );
                  zones.push( new_child2 );
                }
                else
                {
                  new_child2.forward = false;
                  new_child2.parent = new_child1;
                  new_child1.children.push( new_child2 );
                }

                pi = aranged_bottom_up_points.length * 2;

              }

            }


          }
        }
      }

      function is_zones_next_to_eachother( zone1, zone2 )
      {
        var equal = false;
        zone1.forEach( l1 => {
          zone2.forEach( l2 => {
            let l3 = l2.reverse();
            if( l1.angle.veryclose( l2.angle ) || l1.angle.veryclose( l3.angle ) )
            {
              equal |= l1.start.veryclose( l2.start );
              equal |= l1.start.veryclose( l2.end );
              equal |= l1.end.veryclose( l2.start );
              equal |= l1.end.veryclose( l2.end );
              equal |= l1.start.veryclose( l3.start );
              equal |= l1.start.veryclose( l3.end );
              equal |= l1.end.veryclose( l3.start );
              equal |= l1.end.veryclose( l3.end );
            }
          } );
        } );
        return equal;
      }
      function get_zones_next_to( zone, other_zones )
      {
        var neigboors = other_zones.filter( function( potential_neightboorg )
        {
          return is_zones_next_to_eachother( zone, potential_neightboorg );
        } );
        var rest = other_zones.filter( function( potential_neightboorg )
        {
          return neigboors.indexOf( potential_neightboorg ) === -1;
        } );
        return [ neigboors, rest ];
      }

      var all_zones = [ ];
      var get_zone = function( zone )
      {
        all_zones.push( zone.zone_border );
        zone.children.forEach( get_zone );
      };
      get_zone( first_zone );
      var save_all_zones = all_zones;

      var base_zone = {
        zone_border: all_zones.shift(),
        children: [ ],
        forward: true
      };
      base_zone.zone_limits = find_bounding_box( base_zone.zone_border.map( l => {
        return l.start;
      } ) );
      base_zone.middle = new Vector( (base_zone.zone_limits[0] + base_zone.zone_limits[1]) / 2, (base_zone.zone_limits[2] + base_zone.zone_limits[3]) / 2 );

      var check_zones = [ base_zone ];
      while( all_zones.length )
      {
        var front = check_zones.shift();
        var splittet = get_zones_next_to( front.zone_border, all_zones );
        var neighboors = splittet[0];
        all_zones = splittet[1];



        neighboors.forEach( function( neighboor )
        {
          var child = {
            zone_border: neighboor,
            children: [ ]
          };
          child.zone_limits = find_bounding_box( child.zone_border.map( l => {
            return l.start;
          } ) );
          child.middle = new Vector( (child.zone_limits[0] + child.zone_limits[1]) / 2, (child.zone_limits[2] + child.zone_limits[3]) / 2 );

          child.forward = child.zone_limits[3] > (front.zone_limits[3] + 0.0001);

          front.children.push( child );
          check_zones.push( child );
        } );

      }
      first_zone = base_zone;

      if( this.options.LineSpacing.val > 0 )
      {
        function find_crosses( zone_border_lines, l, oposit )
        {
          var crosses = [ ];
          zone_border_lines.forEach( ( bl, i ) => {
            var cross = l.cross_with_line( bl, true );
            if( cross )
            {
              cross.border_line_index = bl.id;
              crosses.push( cross );
            }
          } );
          if(crosses.length > 2)
            crosses.splice(2,crosses.length -2);
          
          crosses = crosses.sort_objects( "x", oposit % 2 );
          return crosses;
        }

        var make_lines_in_zone = ( zone, y0, direction ) =>
        {


          var zone_points = zone.zone_border.map( l => {
            return l.start;
          } );
          var zone_limits = find_bounding_box( zone_points );

          var y = y0;

          /*zone.children.filter( z => {
           return z.forward !== zone.forward;
           } ).forEach( child => {
           make_lines_in_zone( child, y, direction );
           } );*/

          while( y < zone_limits[2] )
            y += this.options.LineSpacing.val;
          while( y > zone_limits[3] )
            y -= this.options.LineSpacing.val;
          var zone_too_small = false;
          if( y < zone_limits[2] )
            zone_too_small = true;

          var first = true;
          while( y >= zone_limits[2] && y <= zone_limits[3] )
          {
            var l = new Line( new Vector( limits[0] - 10, y ), new Vector( limits[1] + 10, y ) );
            var crosses = find_crosses( zone.zone_border, l, direction );

            let c1 = crosses[0];
            let c2 = crosses[1];

            if( first && c2 )
            {
              first = false;
              if( this.tasks.length )
              {
                let last_task = this.tasks.last();

                var d1 = (new Line( last_task.end, c1 )).length;
                var d2 = (new Line( last_task.end, c2 )).length;
                if( d2 < d1 )
                {
                  c1 = crosses[1];
                  c2 = crosses[0];
                  direction++;
                }


                /*var route = this.route_between_points( last_task.end, c1, border_lines, points, point_map, longest_dist );
                best_path = route[1].slice( 0, -1 );

                // make route between
                best_path.forEach( ( p ) => {
                  let new_task = new WaypointTask( this.tasks.length, p, false, false );
                  new_task.task_options.push( new FloatRobotAction( "point_wait", 0 ) );
                  new_task.task_options.push( new IntRobotAction( "coarse_line_start", 1 ) );
                  this.tasks.push( new_task );
                } );*/
              }
            }

            if( c2 )
            {
              this.make_task( [ c1, c2 ] );
              this.tasks.last().from_border = c1.border_line_index;
              this.tasks.last().to_border = c2.border_line_index;
            }
            
            if( zone.forward )
              y += this.options.LineSpacing.val;
            else
              y -= this.options.LineSpacing.val;
            direction++;
          }
          this.sort_tasks();
          zone.children.filter( z => {
            return z.forward !== zone.forward;
          } ).forEach( child => {
            make_lines_in_zone( child, y, direction );
          } );

          var next_zones = zone.children.filter( z => {
            return z.forward === zone.forward;
          } );
          if( !zone_too_small )
          {
            var nearest_child = next_zones.map( z => {
              return z.zone_border.map( l => {
                //return this.tasks.length ? (new Line( l.start, this.tasks.last().end )).length : 0;
                return (new Line( l.start, this.tasks.last().end )).length;
              } ).sort_num()[0];
            } );
            if( nearest_child[0] > nearest_child[1] )
            {
              var f = next_zones[0];
              next_zones[0] = next_zones[1];
              next_zones[1] = f;
            }
          }
          next_zones.forEach( child => {
            make_lines_in_zone( child, y, direction );
          } );
        };
        make_lines_in_zone( first_zone, limits[2] + this.options.LineSpacing.val, 0 );


      }

      // debug creation
      var enable_debug = false;
      if( enable_debug && this.options.OnlyDraw.val >= 0 )
      {
        var this_job = this;
        save_all_zones[this.options.OnlyDraw.val].forEach( l => {
          this_job.make_task( [ l.start, l.end ] );
        } );
      }
      if( enable_debug && this.options.OnlyDraw.val === -1 )
      {
        console.log( first_zone );



        var colors = [ ];
        var num = [ "00", "FF" ];
        num.forEach( cp1 => {
          num.forEach( cp2 => {
            num.forEach( cp3 => {
              colors.push( "#" + cp1 + cp2 + cp3 );
            } );
          } );
        } );
        var color_picker = 0;
        var this_job = this;

        var zone_id = 1;
        function draw_zone_center( zone, depth )
        {
          console.log( "depth", depth );
          zone.id = zone_id++;

          zone.children.forEach( child => {
            if( !child.forward )
              draw_zone_center( child, depth + 1 );
          } );

          var x_avg = 0;
          var y_avg = 0;
          zone.zone_border.forEach( l => {
            x_avg += l.start.x;
            y_avg += l.start.y;
          } );
          x_avg /= zone.zone_border.length;
          y_avg /= zone.zone_border.length;

          this_job.tasks.push( new WaypointTask( this_job.tasks.length, new Vector( x_avg, y_avg ), false, true ) );

          zone.children.forEach( child => {
            if( child.forward )
              draw_zone_center( child, depth + 1 );
          } );
        }
        draw_zone_center( first_zone, 0 );



        function draw_zone( zone )
        {
          let color = colors[color_picker++];
          if( color_picker > colors.length )
            color_picker = 0;

          zone.zone_border.forEach( ( l ) => {
            this_job.make_task( [ l.start, l.end ] );
            this_job.tasks.last().force_draw_color = color;

          } );
          zone.children.forEach( child => {
            draw_zone( child );
          } );
        }
        draw_zone( first_zone );
      }
    }

    if( this.options.make_dash.val )
    {
      if( this.options.dot_distance.val > 0 )
      {
        var ref_x = this.tasks[0].start.x;
        var ref_a = this.tasks[0].toLine().angle;
        this.tasks = this.tasks.map( lt => {
          if( lt instanceof WaypointTask )
            return lt;

          var oposit = !lt.toLine().angle.veryclose( ref_a );
          if( oposit )
            lt = lt.opposite_direction;
          var offset = this.options.dot_offset.val;
          offset = offset % this.options.dot_distance.val;
          if( offset < 0 )
            offset += this.options.dot_distance.val;

          //lt = lt.makeLonger( -offset, 0 );

        
            //dash_length
            /*
             dashed_length":
             "dashed_space":
             "dashed_offset"
             */

            //if( oposit )
            //  lt = lt.opposite_direction;
            lt.action_options.push( new FloatRobotAction( "dashed_length", this.options.dash_length.val ) );
            lt.action_options.push( new FloatRobotAction( "dashed_space", this.options.dot_distance.val - this.options.dash_length.val ) );
            lt.action_options.push( new FloatRobotAction( "dashed_offset", -this.options.dash_length.val / 2 + offset ) );

            return lt;
        } );
        this.tasks = this.tasks.flat();
      }
    }



    if( this.options.DrawBufferZone.val )
    {
      // fix route to border if this ever has to be drawn by robot.

      //var first_old_task = this.tasks[0];
      //var last_new_task;
      //var added = 0;
      border_lines.forEach( l => {
        this.make_task( [ l.start, l.end ] );
        //last_new_task = this.tasks.last();
        //this.tasks.last().force_draw_color = "#7F00FF";
        //this.tasks.splice( added, 0, this.tasks.pop() );
        //added++;
      } );

      /*if( first_old_task )
       {
       var route = this.route_between_points( last_new_task.end, first_old_task.start, original_border, points, point_map, longest_dist );
       var best_path = route[1].slice( 0, -1 );
       // make route between
       best_path.forEach( ( p, i ) => {
       var new_task = new WaypointTask( this.tasks.length, p, false, false );
       new_task.task_options.push( new FloatRobotAction( "point_wait", 0 ) );
       new_task.task_options.push( new IntRobotAction( "coarse_line_start", 1 ) );
       //this.tasks.splice( added + i, 0, new_task );
       } );
       }*/
    }

    // move back from zero
    this.tasks.forEach( ( task, i ) => {
      task.ends = task.ends.map( end => {
        var rotated = end.rotate( -Orientation_angle );
        var moved_back = rotated.add( center );
        return moved_back;
      } );
      task.id = i;
    } );
    // Update test_tasks
    this.test_tasks = [ ];
    points.forEach( p => {
      this.test_tasks.push( new WaypointTask( this.test_tasks.length, p ) );
    } );
    // Update bb
    // Update handles
    var big_limits = find_bounding_box( this.points );
    var tvers = new Line( new Vector( big_limits[0], big_limits[2] ), new Vector( big_limits[1], big_limits[3] ) );
    var pitch_center = tvers.middle;
    this.refresh_handles( tvers );
    //this.refresh_snapping_lines( );
    this.snapping_lines = [ ];
    if( this.tasks.length )
    {
      var guide_ = (new Vector( 1, 0 )).rotate( this.options.Orientation.val );

      var l = new Line( pitch_center, pitch_center.add( guide_ ) );
      this.snapping_lines.push( l );
    }
     this.start_locations.push( new StartLocation( l, this.tasks.length ) );
  }
  refresh_handles( tvers )
  {
    var this_class = this;
    this.handles = [ ];
    //var limits = find_bounding_box( this.points );
    //var tvers = new Line( new Vector( limits[0], limits[2] ), new Vector( limits[1], limits[3] ) );
    var pitch_center = tvers.middle;
    var angle_handle_guide = (new Vector( tvers.length / 4, 0 )).rotate( this.options.Orientation.val );
    var angle_handle_pos = pitch_center.add( angle_handle_guide );

    var i_last = this_class.points.length - 1;
    var extra_lines = this_class.points.map( ( p, i ) => {
      var extra_line = new Line( this_class.points[i_last], p );
      i_last = i;
      return extra_line;
    } );

    this.handles.push( new Handle( angle_handle_pos, this.options.Orientation.val, "Orientation", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
    {

      var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle;
      new_angle = this_class.get_snap_rotation( new_angle, snapping_lines.concat( extra_lines ) )[0];
      //console.log( new_angle );

      this_class.options.Orientation.val = new_angle;
      delete this.calculated_drawing_points;
      this_class.draw();

    }, function( new_angle )
    {
      console.log( new_angle );
      return this_class.set_new_val( this_class.options.Orientation, new_angle, true );
    }, "deg" ) );

    var this_class = this;
    this.points.forEach( function( p, i )
    {
      var is_removed = false;
      this_class.handles.push( new Handle( p, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {
        if( !is_removed )
          this_class.points[i] = new_pos_v;

        let i_befo = (i - 1);
        if( i_befo < 0 )
          i_befo = this_class.points.length - 1;
        let i_next = (i + 1) % this_class.points.length;
        if( is_removed )
          i_next = i % this_class.points.length;

        let lu_befo = (new Line( this_class.points[i_befo], new_pos_v )).unit_vector;
        let lu_next = (new Line( new_pos_v, this_class.points[i_next] )).unit_vector;
        let d = (new Line( lu_befo, lu_next )).length;

        if( d < 0.1 && !is_removed )
        {
          is_removed = true;
          if( edit_pitch_screen_controller.last_touched === 1 )
            edit_pitch_screen_controller.last_touched += this_class.points.length - 1;
          edit_pitch_screen_controller.last_touched += this_class.points.length - 2;
          this_class.points.splice( i, 1 );
        }
        if( d > 0.1 && is_removed )
        {
          is_removed = false;
          this_class.points.splice( i, 0, new_pos_v );
          edit_pitch_screen_controller.last_touched -= this_class.points.length - 2;
        }

        this_class.draw();
      }, function( new_pos_v )
      {
        this_class.points[i] = new_pos_v;
        this_class.draw();
        return true;
      } ) );

    } );

    if( this.layout_method === "free_hand" )
    {
      this.points.forEach( function( p, i )
      {
        var line = new Line( p, this_class.points[(i + 1) % this_class.points.length] );
        var m = line.middle;
        var is_removed = true;

        i = (i + 1) % this_class.points.length;
        if(!(line.length < 10))
        {
        //position, angle, name, icon, chosen_icon, on_drag, on_new_val, units, zindex
        this_class.handles.push( new Handle( m, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
        {
          if( !is_removed )
            this_class.points[i] = new_pos_v;

          let i_befo = (i - 1);
          if( i_befo < 0 )
            i_befo = this_class.points.length - 1;
          let i_next = (i + 1) % this_class.points.length;
          if( is_removed )
            i_next = i % this_class.points.length;

          let lu_befo = (new Line( this_class.points[i_befo], new_pos_v )).unit_vector;
          let lu_next = (new Line( new_pos_v, this_class.points[i_next] )).unit_vector;
          let d = (new Line( lu_befo, lu_next )).length;

          if( d < 0.1 && !is_removed )
          {
            is_removed = true;
            edit_pitch_screen_controller.last_touched += this_class.points.length - 2;
            this_class.points.splice( i, 1 );
          }
          if( d > 0.1 && is_removed )
          {
            is_removed = false;
            this_class.points.splice( i, 0, new_pos_v );
            edit_pitch_screen_controller.last_touched -= this_class.points.length - 2;
          }
          this_class.draw();

        }, function( new_pos_v )
        {
          if( !this_is_added )
            this_class.points.splice( i + 1, 0, new_pos_v );
          else
          {
            this_class.points[i + 1] = new_pos_v;
          }
          this_is_added = true;
          this_class.draw();
          return true;
        }, undefined, undefined, 0.25 ) );
      }
      } );
    }

  }
  convert_to_free_hand()
  {
    return this;
  }
  can_convert_to_free_hand()
  {
    return false;
  }
}