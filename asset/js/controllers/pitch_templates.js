
/* global gps_controller, projection, robot_controller */


function closest_point_on_line( p, l )
{
  var line_end1 = l[0];
  var line_end2 = l[1];
  var line_dir = vec_sub( line_end2, line_end1 );

  if( line_dir[0] === 0 )
  {
    return [ line_end1[0], p[1] ];
  }
  else if( line_dir[1] === 0 )
  {
    return [ p[0], line_end1[1] ];
  }
  else
  {
    var line_a = line_dir[1] / line_dir[0];
    var line_b = line_end1[1] - line_a * line_end1[0];
    var a = line_a;
    var b = -1;
    var c = line_b;
    var closest_x = (b * (b * p[0] - a * p[1]) - a * c) / (a * a + b * b);
    var closest_y = (a * (-b * p[0] + a * p[1]) - b * c) / (a * a + b * b);
    return [ closest_x, closest_y ];
  }

}

function make_relative_to_robot( jobs )
{
  var robot_pos = robot_controller.chosen_robot_position.toArray();
  var shiftet_jobs = jobs.copy();
  shiftet_jobs = shiftet_jobs.map( function( job )
  {
    job.ends.forEach( function( end, i )
    {
      job.ends[i] = vec_sub( end, robot_pos );
    } );
    return job;
  } );
  return shiftet_jobs;
}

function get_pitch_corners_and_guides( points, rotation, width, length )
{
  var c1 = [ points[0].x, points[0].y ];
  var g1 = [ points[1].x, points[1].y ];
  g1 = vec_sub( g1, c1 );
  g1 = vec_div( g1, vec_len( g1 ) );
  var g2 = vec_rot_90( g1 );
  if( rotation % 2 )
  { // true when unequal
    g1 = vec_mul( g1, width );
    g2 = vec_mul( g2, length );
  }
  else
  {
    g1 = vec_mul( g1, length );
    g2 = vec_mul( g2, width );
  }

  if( rotation >= 2 )
    g2 = vec_mul( g2, -1 );
  var c2 = vec_add( g1, c1 );
  var c3 = vec_add( g2, c2 );
  var c4 = vec_add( g2, c1 );
  if( rotation % 2 )
  { // true when unequal
    var tmp = c2;
    c2 = c4; // make sure that c1 and c4 allways is one end and c2 and c3 is the other end. might be mirroed, but doesn't matter
    c4 = tmp;
    tmp = g1;
    g1 = g2; // make sure that Guide 1 allways points towards the long side of hte pitch
    g2 = tmp; // make sure that Guide 2 allways points towards the short side of hte pitch
  }

// normalize to be of length 1
  g1 = vec_div( g1, vec_len( g1 ) );
  g2 = vec_div( g2, vec_len( g2 ) );
  var cl1 = vec_avg( c1, c2 );
  var cl2 = vec_avg( c3, c4 );
  var center = vec_avg( cl1, cl2 );
  var cs1 = vec_avg( c1, c4 );
  var cs2 = vec_avg( c2, c3 );
  // c1,c2,c3,c4 = corners
  // g1,g2 unit vector pointing from corner flag towards long side / short side
  // cl1,cl2 = center of long side
  // center = center of field


  return [ c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center ];
}

function change_to_rotation_one( points, vars )
{
  var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
  var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
  c1 = result[0];
  c2 = result[1];
  c3 = result[2];
  c4 = result[3];
  g1 = result[4];
  g2 = result[5];
  cl1 = result[6]; // center long 1 , between c1,c2
  cl2 = result[7]; // center long 2 , between c3,c4
  cs1 = result[8]; // center short 1 , between c1,c4
  cs2 = result[9]; // center short 2 , between c2,c3
  center = result[10];
  if( vars.Rotation === 1 )
  {

  }
  else if( vars.Rotation === 2 )
  {
    var new_p2 = vec_add( c4, g1 );
    points[0].x = c4[0];
    points[0].y = c4[1];
    points[1].x = new_p2[0];
    points[1].y = new_p2[1];
  }
  else if( vars.Rotation === 3 )
  {
    var new_p2 = vec_add( c4, g1 );
    points[0].x = c4[0];
    points[0].y = c4[1];
    points[1].x = new_p2[0];
    points[1].y = new_p2[1];
  }
  else if( vars.Rotation === 4 )
  {
    var new_p2 = vec_add( c1, g1 );
    points[1].x = new_p2[0];
    points[1].y = new_p2[1];
  }

  vars.Rotation = 1;
  return [ points, vars ];
}

function square_templates_move( points, move_point_key, locket_point_key, vars, new_positoin )
{
  var p1 = [ points[0].x, points[0].y ];
  var p2 = [ points[1].x, points[1].y ];
  var c1, c2, c3, c4, g1, g2, center;
  var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
  c1 = result[0];
  c2 = result[1];
  c3 = result[2];
  c4 = result[3];
  g1 = result[4];
  g2 = result[5];
  center = result[10];
  var adjust_centers = [ center, c1, c2, c3, c4 ];
  var new_p1, new_p2;
  if( locket_point_key === "" || locket_point_key === move_point_key )
  {
    var dist_moved = vec_sub( new_positoin, adjust_centers[move_point_key] );
    new_p1 = vec_add( p1, dist_moved );
    new_p2 = vec_add( p2, dist_moved );
  }
  else
  {
    var old_vec = vec_sub( adjust_centers[locket_point_key], adjust_centers[move_point_key] );
    var new_vec = vec_sub( adjust_centers[locket_point_key], new_positoin );
    var a_old = Math.atan2( old_vec[0], old_vec[1] );
    var a_new = Math.atan2( new_vec[0], new_vec[1] );
    var a_diff = a_old - a_new;
    g1 = vec_rot( g1, a_diff );
    g2 = vec_rot( g2, a_diff );
    var p_g = vec_sub( p2, p1 );
    p_g = vec_rot( p_g, a_diff );
    if( locket_point_key === 1 )
    {
      new_p1 = JSON.copy( p1 );
      new_p2 = vec_add( new_p1, p_g );
    }
    else if( locket_point_key === 2 )
    {

      new_p1 = vec_add( c2, vec_mul( g1, -vars.Length ) );
      new_p2 = vec_add( new_p1, p_g );
    }
    else if( locket_point_key === 3 )
    {

      new_p1 = vec_add( c3, vec_mul( g2, -vars.Width ) );
      new_p1 = vec_add( new_p1, vec_mul( g1, -vars.Length ) );
      new_p2 = vec_add( new_p1, p_g );
    }
    else if( locket_point_key === 4 )
    {

      new_p1 = vec_add( c4, vec_mul( g2, -vars.Width ) );
      new_p2 = vec_add( new_p1, p_g );
    }
    else if( locket_point_key === 0 )
    {

      new_p1 = vec_add( center, vec_mul( g2, -vars.Width / 2 ) );
      new_p1 = vec_add( new_p1, vec_mul( g1, -vars.Length / 2 ) );
      new_p2 = vec_add( new_p1, p_g );
    }

  }

  points[0].x = new_p1[0];
  points[0].y = new_p1[1];
  points[1].x = new_p2[0];
  points[1].y = new_p2[1];
  return points;
}
function square_templates_copy( points, vars, direction, space_between )
{
  var g1, g2;
  var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
  g1 = result[4];
  g2 = result[5];
  var new_points = JSON.copy( points );
  var p1 = [ new_points[0].x, new_points[0].y ];
  var p2 = [ new_points[1].x, new_points[1].y ];
  var add;
  switch( direction )
  {
    case 0:
      add = vec_mul( g1, parseFloat( vars.Length ) + space_between );
      break;
    case 1:
      add = vec_mul( g2, parseFloat( vars.Width ) + space_between );
      break;
    case 2:
      add = vec_mul( g1, -vars.Length - space_between );
      break;
    case 3:
      add = vec_mul( g2, -vars.Width - space_between );
      break;
  }

  var new_p1 = vec_add( p1, add );
  var new_p2 = vec_add( p2, add );
  new_points[0].x = new_p1[0];
  new_points[0].y = new_p1[1];
  new_points[1].x = new_p2[0];
  new_points[1].y = new_p2[1];
  return new_points;
}
function square_templates_adjust( points, adjust_center, old_vars, new_vars )
{
  var new_points = points;
  var p1 = [ points[0].x, points[0].y ];
  var p2 = [ points[1].x, points[1].y ];
  var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
  var result = get_pitch_corners_and_guides( points, old_vars.Rotation - 1, old_vars.Width, old_vars.Length );
  c1 = result[0];
  c2 = result[1];
  c3 = result[2];
  c4 = result[3];
  g1 = result[4];
  g2 = result[5];
  cl1 = result[6];
  cl2 = result[7];
  cs1 = result[8];
  cs2 = result[9];
  center = result[10];
  //[c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center]

  if( vec_equal( c1, adjust_center ) )
  {
    var p2_direction = vec_rot( [ 0, 1 ], -new_vars.Angle );
    p2 = vec_add( p1, p2_direction );
  }
  if( vec_equal( c2, adjust_center ) )
  { // along g1 from start
    p1 = vec_add( p1, vec_mul( g1, old_vars.Length - new_vars.Length ) );
    p2 = vec_add( p2, vec_mul( g1, old_vars.Length - new_vars.Length ) );
  }
  if( vec_equal( c3, adjust_center ) )
  {
    p1 = vec_add( p1, vec_mul( g1, old_vars.Length - new_vars.Length ) );
    p2 = vec_add( p2, vec_mul( g1, old_vars.Length - new_vars.Length ) );
    p1 = vec_add( p1, vec_mul( g2, old_vars.Width - new_vars.Width ) );
    p2 = vec_add( p2, vec_mul( g2, old_vars.Width - new_vars.Width ) );
  }
  if( vec_equal( c4, adjust_center ) )
  {
    p1 = vec_add( p1, vec_mul( g2, old_vars.Width - new_vars.Width ) );
    p2 = vec_add( p2, vec_mul( g2, old_vars.Width - new_vars.Width ) );
  }
  if( vec_equal( center, adjust_center ) )
  {

    p1 = vec_add( p1, vec_mul( g1, (old_vars.Length - new_vars.Length) / 2 ) );
    p2 = vec_add( p2, vec_mul( g1, (old_vars.Length - new_vars.Length) / 2 ) );
    p1 = vec_add( p1, vec_mul( g2, (old_vars.Width - new_vars.Width) / 2 ) );
    p2 = vec_add( p2, vec_mul( g2, (old_vars.Width - new_vars.Width) / 2 ) );
  }

  new_points[0].x = p1[0];
  new_points[0].y = p1[1];
  new_points[1].x = p2[0];
  new_points[1].y = p2[1];
  return new_points;
}

function re_arrange_jobs_by_id( jobs, order )
{
  var new_jobs = [ ];
  order.forEach( function( id )
  {
    var next_job = jobs.filter( function( job )
    {
      return job.id === id;
    } )[0];
    if( next_job )
      new_jobs.push( next_job );
  } );
  return new_jobs;
}

function re_arrange_jobs( jobs, order )
{
  var new_jobs = [ ];
  order.forEach( function( i )
  {
    new_jobs.push( jobs[i] );
  } );
  return new_jobs;
}

function reverse_ids( jobs, ids )
{
  ids.forEach( function( id )
  {
    var job = jobs.filter( function( a_job )
    {
      return a_job.id === id;
    } )[0];
    var tmp = job.ends[0];
    switch( job.type )
    {
      case "line":
        job.ends[0] = job.ends[1];
        job.ends[1] = tmp;
        break;
      case "arc3":
        if( job.ends.length === 2 )
        {
          job.ends[0] = job.ends[1];
          job.ends[1] = tmp;
        }
        else
        {
          job.ends[0] = job.ends[2];
          job.ends[2] = tmp;
        }
        break;
    }
  } );
}

function reverse_jobs___( jobs, reverse_list )
{
  jobs.forEach( function( job, i )
  {
    if( reverse_list === 1 || reverse_list[i] )
    {
      var tmp = job.ends[0];
      switch( job.type )
      {
        case "line":
          job.ends[0] = job.ends[1];
          job.ends[1] = tmp;
          break;
        case "arc3":
          if( job.ends.length === 2 )
          {
            job.ends[0] = job.ends[1];
            job.ends[1] = tmp;
          }
          else
          {
            job.ends[0] = job.ends[2];
            job.ends[2] = tmp;
          }
          break;
      }
    }
  } );
  return jobs;
}

var pitch_templates = {};
pitch_templates["soccer_11_man"] = {
  id: "soccer_11_man",
  title: "11 man",
  type: "soccer",
  image: "img/templates/11-man-soccer.png",
  points_needed: 2,
  point_labels: [ "Set corner", "Set side" ],
  point_short_labels: [ "C", "S" ],
  point_icons: [ 'corner_mark', 'corner_mark' ],
  variables: [
    {
      adjustable: false,
      configurable: true,
      name: "Rotation",
      val: 1,
      choises: [ 1,
        2,
        3,
        4 ],
      type: "choose"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Length",
      val: 105,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Width",
      val: 68,
      type: "float"
    },
    {
      adjustable: false,
      configurable: false,
      name: "Angle",
      val: 0,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "8manfields",
      val: false,
      type: "bool"
    }
  ],
  move: square_templates_move,
  copy: square_templates_copy,
  adjust: square_templates_adjust,
  draw: function( points, vars )
  {

    /*
     var pointvarsarr = change_to_rotation_one( points, vars );
     points = pointvarsarr[0];
     vars = pointvarsarr[1];
     */

    var jobs = [ ];
    var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
    var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
    c1 = result[0];
    c2 = result[1];
    c3 = result[2];
    c4 = result[3];
    g1 = result[4];
    g2 = result[5];
    cl1 = result[6]; // center long 1 , between c1,c2
    cl2 = result[7]; // center long 2 , between c3,c4
    cs1 = result[8]; // center short 1 , between c1,c4
    cs2 = result[9]; // center short 2 , between c2,c3
    center = result[10];
    //[c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center]

    var line_width = 0.1;
    var corner_radius = 1.0 - line_width / 2;
    var goal_field_width = 18.32;
    var big_field_width = 40.32;
    var big_radius = (vars.Width < big_field_width) ? (vars.Width / 3) : (9.15 - line_width / 2);
    var goal_width = vars.Width < big_field_width ? 1.5 : 7.32;
    var cs1g1 = vec_add( cs1, vec_mul( g2, big_field_width / 2 ) );
    var cs1g2 = vec_add( cs1, vec_mul( g2, goal_field_width / 2 ) );
    var cs1g3_1 = vec_add( cs1, vec_mul( g2, goal_width / 2 + 0.05 * 0 ) );
    var cs1g3_2 = vec_add( cs1, vec_mul( g2, goal_width / 2 - 0.05 * 0 ) );
    var cs1g4 = vec_add( cs1, vec_mul( g2, -goal_width / 2 ) );
    var cs1g5 = vec_add( cs1, vec_mul( g2, -goal_field_width / 2 ) );
    var cs1g6 = vec_add( cs1, vec_mul( g2, -big_field_width / 2 ) );
    var cs2g1 = vec_add( cs2, vec_mul( g2, big_field_width / 2 ) );
    var cs2g2 = vec_add( cs2, vec_mul( g2, goal_field_width / 2 ) );
    var cs2g3_1 = vec_add( cs2, vec_mul( g2, goal_width / 2 + 0.05 * 0 ) );
    var cs2g3_2 = vec_add( cs2, vec_mul( g2, goal_width / 2 - 0.05 * 0 ) );
    var cs2g4 = vec_add( cs2, vec_mul( g2, -goal_width / 2 ) );
    var cs2g5 = vec_add( cs2, vec_mul( g2, -goal_field_width / 2 ) );
    var cs2g6 = vec_add( cs2, vec_mul( g2, -big_field_width / 2 ) );
    var id_index = 1;
    var backline1_points = [ c1, cs1g6, cs1g5, cs1g4, [ cs1g3_2, cs1g3_1, 0 ], cs1g2, cs1g1, c4 ];
    var backline2_points = [ c3, cs2g1, cs2g2, [ cs2g3_1, cs2g3_2, 0 ], cs2g4, cs2g5, cs2g6, c2 ];
    if( vars.Width < big_field_width )
    {
      backline1_points = [ c1, c4, c4, c4, c4, c4, c4, c4 ];
      backline2_points = [ c3, c2, c2, c2, c2, c2, c2, c2 ];
    }
    // side line 1-4
    for( var i = 1; i < backline1_points.length; i++ )
    {
      var prev;
      var next;
      if( backline1_points[i].length === 3 )
      {
        var prev = backline1_points[i - 1];
        var next = backline1_points[i][0];
      }
      else if( backline1_points[i - 1].length === 3 )
      {
        var prev = backline1_points[i - 1][1];
        var next = backline1_points[i];
      }
      else
      {
        var prev = backline1_points[i - 1];
        var next = backline1_points[i];
      }
      var job = {
        "type": "line",
        "ends": [ prev,
          next ],
        "oneway": true,
        id: id_index++
      };
      if( vec_len( vec_sub( prev, next ) ) < 0.01 )
        job.dont_draw = true;
      jobs.push( job );
    }



    //jobs.push( {"type": "line", "ends": [c1, c4], "oneway": true} );
    /*jobs.push( {"type": "line", "ends": [c1, cs1g6], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g6, cs1g5], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g5, cs1g4], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g4, cs1g3_2], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g3_1, cs1g2], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g2, cs1g1], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs1g1, c4], "oneway": true, id: id_index++} );*/

    //jobs.push( {"type": "line", "ends": [c4, c3], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c4,
        cl2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl2,
        c3 ],
      "oneway": true,
      id: id_index++
    } );
    for( var i = 1; i < backline2_points.length; i++ )
    {
      var prev;
      var next;
      if( backline2_points[i].length === 3 )
      {
        var prev = backline2_points[i - 1];
        var next = backline2_points[i][0];
      }
      else if( backline2_points[i - 1].length === 3 )
      {
        var prev = backline2_points[i - 1][1];
        var next = backline2_points[i];
      }
      else
      {
        var prev = backline2_points[i - 1];
        var next = backline2_points[i];
      }
      var job = {
        "type": "line",
        "ends": [ prev,
          next ],
        "oneway": true,
        id: id_index++
      };
      if( vec_len( vec_sub( prev, next ) ) < 0.01 )
        job.dont_draw = true;
      jobs.push( job );
    }
    //jobs.push( {"type": "line", "ends": [c3, c2], "oneway": true} );
    /*jobs.push( {"type": "line", "ends": [c3, cs2g1], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g1, cs2g2], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g2, cs2g3_1], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g3_2, cs2g4], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g4, cs2g5], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g5, cs2g6], "oneway": true, id: id_index++} );
     jobs.push( {"type": "line", "ends": [cs2g6, c2], "oneway": true, id: id_index++} );*/

    //jobs.push( {"type": "line", "ends": [c2, c1], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c2,
        cl1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        c1 ],
      "oneway": true,
      id: id_index++
    } );
    // backline corner kick arc
    [ [ c2, -1, 1 ], [ c3, -1, -1 ], [ c4, 1, -1 ], [ c1, 1, 1 ] ].forEach( function( j, n )
    {

      var c2_2 = vec_add( j[0], vec_mul( g1, j[1] * corner_radius ) );
      var c2_3 = vec_add( j[0], vec_mul( g2, j[2] * corner_radius ) );
      var gc = vec_sub( vec_avg( c2_2, c2_3 ), j[0] );
      gc = vec_add( j[0], vec_mul( vec_div( gc, vec_len( gc ) ), corner_radius ) );
      jobs.push( {
        "type": "arc3",
        "ends": [ c2_2,
          gc,
          c2_3 ],
        "center": j[0],
        id: id_index++
      } );
    } );
    // make sides
    var dir = 1;
    [ cs1, cs2 ].forEach( function( cs )
    {

      var c6, c7; // use last c6,c7 to penalty arc
      var last_dim;
      // goal , goal area , penalty kick
      [ [ goal_width, -0.2 ], [ goal_field_width, 5.5 ], [ big_field_width, 16.5 ] ].forEach( function( dim, i )
      {
        last_dim = dim;
        var c5 = vec_add( cs, vec_mul( g2, dim[0] / 2 ) );
        c6 = vec_add( c5, vec_mul( g1, dim[1] * dir ) );
        c7 = vec_add( c6, vec_mul( g2, -dim[0] ) );
        var c8 = vec_add( c7, vec_mul( g1, -dim[1] * dir ) );
        if( i === 0 )
        {
          jobs.push( {
            "type": "spray",
            "ends": [ c6 ],
            id: id_index++,
            "dont_draw": true || ((vars.Width < dim[0]) || (vars.Length < dim[1] * 2))
          } );
          jobs.push( {
            "type": "spray",
            "ends": [ c7 ],
            id: id_index++,
            "dont_draw": true || ((vars.Width < dim[0]) || (vars.Length < dim[1] * 2))
          } );
        }
        else
        {
          jobs.push( {
            "type": "line",
            "ends": [ c5,
              c6 ],
            id: id_index++,
            "dont_draw": ((vars.Width < dim[0]) || (vars.Length < dim[1] * 2))
          } );
          i === 1 && jobs.push( {
            "type": "line",
            "ends": [ c6,
              c7 ],
            id: id_index++,
            "dont_draw": ((vars.Width < dim[0]) || (vars.Length < dim[1] * 2))
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c7,
              c8 ],
            id: id_index++,
            "dont_draw": ((vars.Width < dim[0]) || (vars.Length < dim[1] * 2))
          } );
        }

      } );
      // penalty kick arc
      var center = vec_add( cs, vec_mul( g1, 11 * dir ) );
      var crosses = find_cross( center, big_radius, [ c6, c7 ] );
      var inv = (vec_len( vec_sub( c6, crosses[0] ) ) > 20) ? 0 : 1;
      jobs.push( {
        "type": "line",
        "ends": [ c6,
          crosses[1 - inv] ],
        id: id_index++,
        "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
      } );
      jobs.push( {
        "type": "line",
        "ends": [ crosses[1 - inv],
          crosses[inv] ],
        id: id_index++,
        "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
      } );
      jobs.push( {
        "type": "line",
        "ends": [ crosses[inv],
          c7 ],
        id: id_index++,
        "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
      } );
      var gc = vec_sub( vec_avg( crosses[0], crosses[1] ), center );
      gc = vec_add( center, vec_mul( vec_div( gc, vec_len( gc ) ), big_radius ) );
      jobs.push( {
        "type": "arc3",
        "ends": [ crosses[1 - inv],
          gc,
          crosses[inv] ],
        "center": center,
        id: id_index++,
        "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
      } );
      //01

      // penalty kick dot
      var r = 0.06;
      var pdc2 = vec_add( center, vec_mul( g2, +r ) );
      var pdc4 = vec_add( center, vec_mul( g2, -r ) );
      if( dir === 1 )
        jobs.push( {
          "type": "arc3",
          "ends": [ pdc4,
            pdc2 ],
          "center": center,
          id: id_index++,
          "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
        } );
      else
        jobs.push( {
          "type": "arc3",
          "ends": [ pdc2,
            pdc4 ],
          "center": center,
          id: id_index++,
          "dont_draw": ((vars.Width < last_dim[0]) || (vars.Length < last_dim[1] * 2))
        } );
      //jobs.push( {"type": "arc3", "ends": [pdc1, pdc2, pdc3], "center": center, "angles": [0, 2 * Math.PI], "r": r} );
      //jobs.push( {"type": "arc3", "ends": [pdc1, pdc4, pdc3], "center": center, "angles": [0, 2 * Math.PI], "r": r} );

      dir = -1;
    } );
    // center line
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        center ],
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ center,
        cl2 ],
      id: id_index++
    } );
    // middle circle
    var pdc1 = vec_add( center, vec_mul( g2, +big_radius ) );
    var pdc3 = vec_add( center, vec_mul( g2, -big_radius ) );
    jobs.push( {
      "type": "arc3",
      "ends": [ pdc1,
        pdc3 ],
      "center": center,
      id: id_index++,
      "dont_draw": ((vars.Width < big_radius * 2) || (vars.Length < big_radius * 2))
    } );
    //jobs.push( {"type": "arc3", "ends": [pdc1, pdc2, pdc3], "center": center, "angles": angles, "r": 9.15} );
    //jobs.push( {"type": "arc3", "ends": [pdc1, pdc4, pdc3], "center": center, "angles": [angles[1], angles[0] + 2 * Math.PI], "r": 9.15} );

    // start dot

    var r = 0.06;
    pdc1 = vec_add( center, vec_mul( g1, +r ) );
    pdc3 = vec_add( center, vec_mul( g1, -r ) );
    jobs.push( {
      "type": "arc3",
      "ends": [ pdc1,
        pdc3 ],
      "center": center,
      id: id_index++
    } );
    //jobs.push( {"type": "arc3", "ends": [pdc1, pdc2, pdc3], "center": center, "angles": [0, 2 * Math.PI], "r": r} );
    //jobs.push( {"type": "arc3", "ends": [pdc1, pdc4, pdc3], "center": center, "angles": [0, 2 * Math.PI], "r": r} );

    vars.Angle = Math.atan2( g1[0], g1[1] );
    jobs = re_arrange_jobs_by_id( jobs, [ 1, 2, 3, 24, 4, 5, 6, 28, 30, 33, 34, 31, 32, 29, 27, 26, 25, 7, 21, 8, 9, 20, 10, 11, 12, 35, 13, 14, 15, 41, 44,
      43, 45, 46, 42, 40, 37, 38, 39, 16, 19, 17, 47, 48, 49, 50, 18, 22 ] );
    reverse_ids( jobs, [ 25, 26, 27, 21, 40, 42, 43, 44, 41, 19 ] );
    //jobs = re_arrange_jobs( jobs, [00, 01, 02, 23, 22, 03, 04, 05, 27, 29, 30, 32, 33, 31, 28, 26, 25, 24, 06, 20, 07, 08, 19, 09, 10, 11, 34, 35, 12, 13, 14, 40, 43, 42, 44, 45, 41, 39, 36, 37, 38, 15, 18, 16, 46, 49, 48, 47, 17, 21] );
    //jobs = reverse_jobs___( jobs, [00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 01, 01, 01, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 01, 01, 01, 00, 00, 01, 01, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00] );


    // add clockwise true/false to jobs.
    jobs.forEach( function( job )
    {
      if( job.type === "arc3" )
      {
        throw "Not implemented";
      }
    } );
    jobs = jobs.filter( function( job )
    {
      return !job.dont_draw;
    } );
    return {
      jobs: jobs,
      center: center,
      adjust_centers: [ center,
        c1,
        c2,
        c3,
        c4 ],
      variables: vars,
      bb: [ c1,
        c2,
        c3,
        c4 ]
    };
  }
};
pitch_templates["soccer_8_man"] = {
  id: "soccer_8_man",
  title: "8 man",
  type: "soccer",
  image: "img/templates/8-man-soccer.png",
  points_needed: 2,
  point_labels: [ "Set corner", "Set side" ],
  point_short_labels: [ "C", "S" ],
  point_icons: [ 'corner_mark', 'corner_mark' ],
  variables: [
    {
      adjustable: false,
      configurable: true,
      name: "Rotation",
      val: 1,
      choises: [ 1,
        2,
        3,
        4 ],
      type: "choose"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Length",
      val: 68,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Width",
      val: 52.5,
      type: "float"
    },
    {
      adjustable: false,
      configurable: false,
      name: "Angle",
      val: 0,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    }
  ],
  move: square_templates_move,
  copy: square_templates_copy,
  adjust: square_templates_adjust,
  draw: function( points, vars )
  {

    var jobs = [ ];
    var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
    var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
    c1 = result[0];
    c2 = result[1];
    c3 = result[2];
    c4 = result[3];
    g1 = result[4];
    g2 = result[5];
    cl1 = result[6];
    cl2 = result[7];
    cs1 = result[8];
    cs2 = result[9];
    center = result[10];
    //[c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center]

    var cs1g1 = vec_add( cs1, vec_mul( g2, 25 / 2 ) );
    var cs1g2_1 = vec_add( cs1, vec_mul( g2, 5 / 2 + 0.05 * 0 ) );
    var cs1g2_2 = vec_add( cs1, vec_mul( g2, 5 / 2 - 0.05 * 0 ) );
    var cs1g3 = vec_add( cs1, vec_mul( g2, -5 / 2 ) );
    var cs1g4 = vec_add( cs1, vec_mul( g2, -25 / 2 ) );
    var cs2g1 = vec_add( cs2, vec_mul( g2, 25 / 2 ) );
    var cs2g2_1 = vec_add( cs2, vec_mul( g2, 5 / 2 + 0.05 * 0 ) );
    var cs2g2_2 = vec_add( cs2, vec_mul( g2, 5 / 2 - 0.05 * 0 ) );
    var cs2g3 = vec_add( cs2, vec_mul( g2, -5 / 2 ) );
    var cs2g4 = vec_add( cs2, vec_mul( g2, -25 / 2 ) );
    var id_index = 1;
    // side line 1-4
    //jobs.push( {"type": "line", "ends": [c1, c4], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c1,
        cs1g4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g4,
        cs1g3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g3,
        cs1g2_2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g2_1,
        cs1g1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g1,
        c4 ],
      "oneway": true,
      id: id_index++
    } );
    //jobs.push( {"type": "line", "ends": [c4, c3], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c4,
        cl2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl2,
        c3 ],
      "oneway": true,
      id: id_index++
    } );
    //jobs.push( {"type": "line", "ends": [c3, c2], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c3,
        cs2g1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g1,
        cs2g2_1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g2_2,
        cs2g3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g3,
        cs2g4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g4,
        c2 ],
      "oneway": true,
      id: id_index++
    } );
    //jobs.push( {"type": "line", "ends": [c2, c1], "oneway": true} );
    jobs.push( {
      "type": "line",
      "ends": [ c2,
        cl1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        c1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        center ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ center,
        cl2 ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    var dir = 1;
    [ cs1, cs2 ].forEach( function( cs )
    {

      var c6, c7, scm; // use last c6,c7 to penalty arc
      // goal , penalty kick
      [ [ 5, -0.2 ], [ 25, 8 ] ].forEach( function( dim, i )
      {
        var c5 = vec_add( cs, vec_mul( g2, dim[0] / 2 ) );
        c6 = vec_add( c5, vec_mul( g1, dim[1] * dir ) );
        c7 = vec_add( c6, vec_mul( g2, -dim[0] ) );
        var c8 = vec_add( c7, vec_mul( g1, -dim[1] * dir ) );
        scm = vec_avg( c6, c7 );
        if( i === 0 )
        {
          jobs.push( {
            "type": "spray",
            "ends": [ c6 ],
            id: id_index++,
            "dont_draw": true
          } );
          jobs.push( {
            "type": "spray",
            "ends": [ c7 ],
            id: id_index++,
            "dont_draw": true
          } );
        }
        else
        {
          jobs.push( {
            "type": "line",
            "ends": [ c5,
              c6 ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c6,
              scm ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ scm,
              c7 ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c7,
              c8 ],
            id: id_index++
          } );
        }
      } );
      // kick field
      var r = 0.06;
      var pdc1 = vec_add( scm, vec_mul( g1, -r * dir ) );
      var pdc2 = vec_add( scm, vec_mul( g1, +r * dir ) );
      jobs.push( {
        "type": "arc3",
        "ends": [ pdc1,
          pdc2 ],
        "center": scm,
        id: id_index++
      } );
      dir = -1;
    } );
    var r = 0.06;
    var pdc1 = vec_add( center, vec_mul( g1, +r ) );
    var pdc2 = vec_add( center, vec_mul( g1, -r ) );
    jobs.push( {
      "type": "arc3",
      "ends": [ pdc1,
        pdc2 ],
      "center": center,
      id: id_index++
    } );
    vars.Angle = Math.atan2( g1[0], g1[1] );
    jobs = re_arrange_jobs_by_id( jobs, [ 1, 2, 3, 4, 19, 20, 23, 21, 22, 18, 5, 6, 7, 8, 9, 10, 11, 29, 28, 30, 27, 26, 24, 12, 13, 15, 16, 31, 14 ] );
    reverse_ids( jobs, [ 29, 28, 27, 26 ] );
    // add clockwise true/false to jobs.
    jobs.forEach( function( job )
    {
      if( job.type === "arc3" )
      {
        throw "Not implemented";
      }
    } );
    jobs = jobs.filter( function( job )
    {
      return !job.dont_draw;
    } );
    return {
      jobs: jobs,
      center: center,
      adjust_centers: [ center,
        c1,
        c2,
        c3,
        c4 ],
      variables: vars,
      bb: [ c1,
        c2,
        c3,
        c4 ]
    };
  }
};
pitch_templates["soccer_5_man"] = {
  id: "soccer_5_man",
  title: "5 man",
  type: "soccer",
  image: "img/templates/5-man-soccer.png",
  points_needed: 2,
  point_labels: [ "Set corner", "Set side" ],
  point_short_labels: [ "C", "S" ],
  point_icons: [ 'corner_mark', 'corner_mark' ],
  variables: [
    {
      adjustable: false,
      configurable: true,
      name: "Rotation",
      val: 1,
      choises: [ 1,
        2,
        3,
        4 ],
      type: "choose"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Length",
      val: 40,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Width",
      val: 30,
      type: "float"
    },
    {
      adjustable: false,
      configurable: false,
      name: "Angle",
      val: 0,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Middle line",
      val: false,
      type: "bool"
    }
  ],
  move: square_templates_move,
  copy: square_templates_copy,
  adjust: square_templates_adjust,
  draw: function( points, vars )
  {

    var jobs = [ ];
    var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
    var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
    c1 = result[0];
    c2 = result[1];
    c3 = result[2];
    c4 = result[3];
    g1 = result[4];
    g2 = result[5];
    cl1 = result[6];
    cl2 = result[7];
    cs1 = result[8];
    cs2 = result[9];
    center = result[10];
    //[c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center]

    var cs1g1 = vec_add( cs1, vec_mul( g2, 13 / 2 ) );
    var cs1g2_1 = vec_add( cs1, vec_mul( g2, 3 / 2 + 0.05 * 0 ) );
    var cs1g2_2 = vec_add( cs1, vec_mul( g2, 3 / 2 - 0.05 * 0 ) );
    var cs1g3 = vec_add( cs1, vec_mul( g2, -3 / 2 ) );
    var cs1g4 = vec_add( cs1, vec_mul( g2, -13 / 2 ) );
    var cs2g1 = vec_add( cs2, vec_mul( g2, 13 / 2 ) );
    var cs2g2_1 = vec_add( cs2, vec_mul( g2, 3 / 2 + 0.05 * 0 ) );
    var cs2g2_2 = vec_add( cs2, vec_mul( g2, 3 / 2 - 0.05 * 0 ) );
    var cs2g3 = vec_add( cs2, vec_mul( g2, -3 / 2 ) );
    var cs2g4 = vec_add( cs2, vec_mul( g2, -13 / 2 ) );
    var id_index = 1;
    // side line 1-4
    jobs.push( {
      "type": "line",
      "ends": [ c1,
        cs1g4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g4,
        cs1g3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g3,
        cs1g2_2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g2_1,
        cs1g1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g1,
        c4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c4,
        cl2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl2,
        c3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c3,
        cs2g1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g1,
        cs2g2_1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g2_2,
        cs2g3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g3,
        cs2g4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g4,
        c2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c2,
        cl1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        c1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        center ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ center,
        cl2 ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    // make sides
    var dir = 1;
    [ cs1, cs2 ].forEach( function( cs )
    {

      var c6, c7, scm; // use last c6,c7 to penalty arc
      // goal , penalty kick
      [ [ 3, -0.15 ], [ 13, 5 ] ].forEach( function( dim, i )
      {
        var c5 = vec_add( cs, vec_mul( g2, dim[0] / 2 ) );
        c6 = vec_add( c5, vec_mul( g1, dim[1] * dir ) );
        c7 = vec_add( c6, vec_mul( g2, -dim[0] ) );
        var c8 = vec_add( c7, vec_mul( g1, -dim[1] * dir ) );
        scm = vec_avg( c6, c7 );
        if( i === 0 )
        {
          jobs.push( {
            "type": "spray",
            "ends": [ c6 ],
            id: id_index++,
            "dont_draw": true
          } );
          jobs.push( {
            "type": "spray",
            "ends": [ c7 ],
            id: id_index++,
            "dont_draw": true
          } );
        }
        else
        {
          jobs.push( {
            "type": "line",
            "ends": [ c5,
              c6 ],
            "dont_draw": i === 0,
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c6,
              scm ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ scm,
              c7 ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c7,
              c8 ],
            "dont_draw": i === 0,
            id: id_index++
          } );
        }
      } );
      // kick field

      var r = 0.06;
      var pdc1 = vec_add( scm, vec_mul( g1, -r * dir ) );
      var pdc2 = vec_add( scm, vec_mul( g1, +r * dir ) );
      jobs.push( {
        "type": "arc3",
        "ends": [ pdc1,
          pdc2 ],
        "center": scm,
        id: id_index++
      } );
      dir = -1;
    } );
    var r = 0.06;
    var pdc1 = vec_add( center, vec_mul( g1, +r ) );
    var pdc2 = vec_add( center, vec_mul( g1, -r ) );
    jobs.push( {
      "type": "arc3",
      "ends": [ pdc1,
        pdc2 ],
      "center": center,
      id: id_index++
    } );
    vars.Angle = Math.atan2( g1[0], g1[1] );
    jobs = re_arrange_jobs_by_id( jobs, [ 1, 2, 3, 4, 19, 20, 23, 21, 22, 18, 5, 6, 7, 8, 9, 10, 11, 29, 28, 30, 27, 26, 24, 12, 13, 15, 16, 31, 14 ] );
    reverse_ids( jobs, [ 29, 28, 27, 26 ] );
    //jobs = re_arrange_jobs( jobs, [00, 01, 17, 16, 02, 03, 18, 19, 22, 20, 21, 04, 05, 06, 07, 08, 23, 24, 09, 10, 28, 27, 29, 26, 25, 11, 12, 14, 30, 15, 13] );
    //jobs = reverse_jobs___( jobs, [00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 01, 01, 00, 01, 01, 00, 00, 00, 00, 00, 00] );

    // add clockwise true/false to jobs.
    jobs.forEach( function( job )
    {
      if( job.type === "arc3" )
      {
        throw "Not implemented";
      }
    } );
    jobs = jobs.filter( function( job )
    {
      return !job.dont_draw;
    } );
    return {
      jobs: jobs,
      center: center,
      adjust_centers: [ center,
        c1,
        c2,
        c3,
        c4 ],
      variables: vars,
      bb: [ c1,
        c2,
        c3,
        c4 ]
    };
  }
};
pitch_templates["soccer_3_man"] = {
  id: "soccer_3_man",
  title: "3 man",
  type: "soccer",
  image: "img/templates/3-man-soccer.png",
  points_needed: 2,
  point_labels: [ "Set corner", "Set side" ],
  point_short_labels: [ "C", "S" ],
  point_icons: [ 'corner_mark', 'corner_mark' ],
  variables: [
    {
      adjustable: false,
      configurable: true,
      name: "Rotation",
      val: 1,
      choises: [ 1,
        2,
        3,
        4 ],
      type: "choose"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Length",
      val: 21,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Width",
      val: 13,
      type: "float"
    },
    {
      adjustable: false,
      configurable: false,
      name: "Angle",
      val: 0,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Middle line",
      val: false,
      type: "bool"
    }
  ],
  move: square_templates_move,
  copy: square_templates_copy,
  adjust: square_templates_adjust,
  draw: function( points, vars )
  {

    var jobs = [ ];
    var c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center;
    var result = get_pitch_corners_and_guides( points, vars.Rotation - 1, vars.Width, vars.Length );
    c1 = result[0];
    c2 = result[1];
    c3 = result[2];
    c4 = result[3];
    g1 = result[4];
    g2 = result[5];
    cl1 = result[6];
    cl2 = result[7];
    cs1 = result[8];
    cs2 = result[9];
    center = result[10];
    //[c1, c2, c3, c4, g1, g2, cl1, cl2, cs1, cs2, center]

    var cs1g1_1 = vec_add( cs1, vec_mul( g2, (1.5 / 2) + 0.10 * 0 ) );
    var cs1g1_2 = vec_add( cs1, vec_mul( g2, (1.5 / 2) - 0.10 * 0 ) );
    var cs1g2 = vec_add( cs1, vec_mul( g2, -1.5 / 2 ) );
    var cs2g1_1 = vec_add( cs2, vec_mul( g2, 1.5 / 2 + 0.10 * 0 ) );
    var cs2g1_2 = vec_add( cs2, vec_mul( g2, 1.5 / 2 - 0.10 * 0 ) );
    var cs2g2 = vec_add( cs2, vec_mul( g2, -1.5 / 2 ) );
    var id_index = 1;
    // side line 1-4
    jobs.push( {
      "type": "line",
      "ends": [ c1,
        cs1g2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g2,
        cs1g1_2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs1g1_1,
        c4 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c4,
        cl2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl2,
        c3 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c3,
        cs2g1_1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g1_2,
        cs2g2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cs2g2,
        c2 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c2,
        cl1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        c1 ],
      "oneway": true,
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ cl1,
        center ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    jobs.push( {
      "type": "line",
      "ends": [ center,
        cl2 ],
      "dont_draw": !vars["Middle line"],
      id: id_index++
    } );
    // make sides
    var dir = 1;
    [ cs1, cs2 ].forEach( function( cs )
    {

      var c6, c7; // use last c6,c7 to penalty arc
      // goal , penalty kick
      [ [ 1.5, -0.15 ] ].forEach( function( dim, i )
      {
        var c5 = vec_add( cs, vec_mul( g2, dim[0] / 2 ) );
        c6 = vec_add( c5, vec_mul( g1, dim[1] * dir ) );
        c7 = vec_add( c6, vec_mul( g2, -dim[0] ) );
        var c8 = vec_add( c7, vec_mul( g1, -dim[1] * dir ) );
        if( i === 0 )
        {
          jobs.push( {
            "type": "spray",
            "ends": [ c6 ],
            id: id_index++,
            "dont_draw": true
          } );
          jobs.push( {
            "type": "spray",
            "ends": [ c7 ],
            id: id_index++,
            "dont_draw": true
          } );
        }
        else
        {
          jobs.push( {
            "type": "line",
            "ends": [ c5,
              c6 ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c6,
              c7 ],
            id: id_index++
          } );
          jobs.push( {
            "type": "line",
            "ends": [ c7,
              c8 ],
            id: id_index++
          } );
        }
      } );
      dir = -1;
    } );
    var r = 0.06;
    var pdc1 = vec_add( center, vec_mul( g1, +r ) );
    var pdc2 = vec_add( center, vec_mul( g1, -r ) );
    jobs.push( {
      "type": "arc3",
      "ends": [ pdc1,
        pdc2 ],
      "center": center,
      id: id_index++
    } );
    vars.Angle = Math.atan2( g1[0], g1[1] );
    jobs = re_arrange_jobs_by_id( jobs, [ 1, 14, 2, 3, 4, 5, 6, 15, 7, 8, 9, 11, 12, 17, 10 ] );
    reverse_ids( jobs, [ ] );
    //jobs = re_arrange_jobs( jobs, [00, 13, 12, 01, 02, 03, 04, 05, 14, 15, 06, 07, 08, 10, 16, 11, 09] );
    //jobs = reverse_jobs___( jobs, [00, 01, 01, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00] );

    // add clockwise true/false to jobs.
    jobs.forEach( function( job )
    {
      if( job.type === "arc3" )
      {
        throw "Not implemented";
      }
    } );
    jobs = jobs.filter( function( job )
    {
      return !job.dont_draw;
    } );
    return {
      jobs: jobs,
      center: center,
      adjust_centers: [ center,
        c1,
        c2,
        c3,
        c4 ],
      variables: vars,
      bb: [ c1,
        c2,
        c3,
        c4 ]
    };
  }
};


pitch_templates["test_line"] = {
  id: "test_line",
  title: "line",
  type: "test",
  image: "img/templates/test_line.png",
  points_needed: 2,
  point_labels: [ "Set corner", "Set side" ],
  point_short_labels: [ "C", "S" ],
  point_icons: [ 'corner_mark', 'corner_mark' ],
  variables: [
    {
      adjustable: false,
      configurable: true,
      name: "Rotation",
      val: 1,
      choises: [ 1,
        2,
        3,
        4 ],
      type: "choose"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Length",
      val: 21,
      type: "float"
    },
    {
      adjustable: true,
      configurable: true,
      name: "Width",
      val: 13,
      type: "float"
    },
    {
      adjustable: false,
      configurable: false,
      name: "Angle",
      val: 0,
      type: "float"
    }
  ],
  move: function()
  {},
  copy: function()
  {},
  adjust: function()
  {},
  draw: function( points, vars )
  {

    var jobs = [ ];

    var c1 = [ points[0].x, points[0].y ];
    var c2 = [ points[1].x, points[1].y ];

    var g1 = vec_sub( c2, c1 );
    g1 = vec_div( g1, vec_len( g1 ) );
    var g2 = vec_rot_90( g1 );

    g2 = vec_mul( g2, 0.5 );

    var b1 = vec_add( c1, g2 );
    var b2 = vec_add( c2, g2 );
    var b3 = vec_add( c2, vec_mul( g2, -1 ) );
    var b4 = vec_add( c1, vec_mul( g2, -1 ) );

    jobs.push( {
      "type": "line",
      "ends": [ c1,
        c2 ],
      "oneway": false,
      id: jobs.length
    } );
    jobs.push( {
      "type": "line",
      "ends": [ c2,
        c1 ],
      "oneway": false,
      id: jobs.length
    } );

    console.log( vars );
    vars.Length = vec_len( vec_sub( c1, c2 ) );
    vars.Width = 0.10;

    return {
      jobs: jobs,
      center: c1,
      adjust_centers: [ c1,
        c1,
        c2,
        c1,
        c2 ],
      variables: vars,
      bb: [ b1,
        b2,
        b3,
        b4 ]
    };
  }
};


$( document ).ready( function()
{
  pitch_templates.list = Object.keys( pitch_templates ).filter( function( name )
  {
    return name !== "list";
  } );
  var pitches = {};
  pitch_templates.list.forEach( function( template )
  {
    if( !pitches[pitch_templates[template].type] )
      pitches[pitch_templates[template].type] = [ ];
    pitches[pitch_templates[template].type].push( template );
  } );
  pitch_templates.pitches = pitches;
} );
