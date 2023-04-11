/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global this, five_degrees_equal, login_screen_controller */

function print_vector_list_relative_to_first( list )
{
  var new_list = [ ];
  var center = new Vector( 0, 0 );
  list.forEach( function( vec )
  {
    center = center.add( vec );
  } );
  center = center.divide( list.length );

  list.forEach( function( vec )
  {
    var new_vec = vec.subtract( center );
    console.log( new_vec.x, new_vec.y );
  } );

  //console.log( new_list );
}

class square_pitch extends Job
{

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    this.options.outsideMoveIn = {
      val: new Vector( 0, 0 )
    };
    this.options.SizeHandlesMoveCenter = {
      val: true
    };


    this.options.addLineLengthInSides = {
      name: "addLineLengthInSides",
      val: true,
      type: "bool"
    };

    this.options.disableLengthHandles = {
      val: false,
      type: "bool",
      dontsave: true
    };
    this.options.disableWidthHandles = {
      val: false,
      type: "bool",
      dontsave: true
    };
    this.options.TotalLength ={
      adjustable: true,
      name: "Total Length",
      val: 0,
      type: "float"
    };
    this.options.Length = {
      adjustable: true,
      name: "Length",
      val: 0,
      type: "float"
    };
    this.options.Width = {
      adjustable: true,
      name: "Width",
      val: 0,
      type: "float"
    };
    //this.options.LineWidth = {adjustable: false, name: "LineWidth", val: 0, type: "float", "dontsave": true};
    this.options.Angle = {
      adjustable: true,
      name: "Angle",
      val: 0,
      type: "float"
    };
    this.options.Rotation = {
      adjustable: false,
      name: "Rotation",
      val: 1,
      choises: [ 1, 2, 3, 4 ],
      type: "choose"
    }; // 1-4 if 2 point, 1-2(3-4 repoeat) if 2 corners

    this.options.GoalWidth = {
      adjustable: false,
      name: "GoalWidth",
      val: 0,
      type: "float",
      "dontsave": true
    };
    this.options.Fields = {
      adjustable: false,
      name: "Fields",
      val: [ ],
      type: "array",
      "dontsave": true
    };

    this.options["Right goal pole"] = {
      adjustable: false,
      configurable: true,
      name: "Right goal pole",
      val: false,
      type: "bool"
    };
    this.options["Left goal pole"] = {
      adjustable: false,
      configurable: true,
      name: "Left goal pole",
      val: false,
      type: "bool"
    };
    this.options.GoalDistFromBack = {
      adjustable: false,
      name: "GoalDistFromBack",
      val: 0.3,
      type: "float",
      "dontsave": true
    };

    this.options.ForceStdMeasurements = {
      name: "ForceStdMeasurements",
      val: false,
      type: "bool",
      "dontsave": true
    };

    this.options.goalPoleWidth = {
      name: "goalPoleWidth",
      val: 0,
      type: "float",
      "dontsave": true
    };

  }
  
  static get layout_methods() {
    if(robot_controller.robot_has_capability("bezier_task")) {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "all_corners": 4,
        "all_goal_posts": 4,
        "all_corners,all_goal_posts": 8,
        "free_hand": 0
      };
    }
    else {
      return {
        "corner,side": 2,
        "two_corners": 2,
        "two_corners,side": 3,
        "all_corners": 4,
        "free_hand": 0
      };
    }
  }
  
  get center()
  {
    var p = this.drawing_points;
    return this.get_middle( p );
    /*
     var c1 = p[0];
     var c2 = p[3];
     var c3 = p[4];
     var c4 = p[7];
     
     var m2 = new Line( c4, c1 ).middle;
     var m1 = new Line( c2, c3 ).middle;
     var middle_line = new Line( m1, m2 );
     var center = middle_line.middle;
     return center;
     */
  }

  get drawing_points()
  {
    if( this.calculated_drawing_points )
      return this.calculated_drawing_points;

    var p = [ ];
    switch( this.layout_method )
    {
      case "corner,side":
        p = this.from4cornersTo8points( this.from2pointsTo4corners( this.points ) );
        break;
      case "two_corners":
        p = this.from4cornersTo8points( this.from2cornersTo4Corners( this.points ) );
        break;
      case "two_corners_outside":
        p = this.from4cornersTo8points( this.from2cornersTo4Corners( this.from2cornersOutsideTo2Corners( this.points ) ) );
        break;
      case "two_middle_goal_posts":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2middleToCenter( this.points ) ) );
        break;
      case "two_end_goal_posts":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2endsToCenter( this.points ) ) );
      case "two_end_goal_posts_resize":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.from2endsToCenter( this.points ) ) );
        break;
      case "single_post":
        p = this.from4cornersTo8points( this.from2endsTo4corners( this.points ) );
        break;
      case "two_corners,side":
        p = this.from4cornersTo8points( this.from3pointsTo4Corners( this.points ) );
        break;
      case "all_corners":
        p = this.from4cornersTo8points( this.points );
        break;
      case "all_goal_posts":
        p = this.fromNgoalPostsTo8points( this.points );
        break;
      case "all_corners,all_goal_posts":
        p = this.points;
        break;
      case "free_hand":
        p = this.from4cornersTo8points( this.fromCenterTo4Corners( this.points[0] ) );
        break;
      default:
        throw "Layout method not found" + this.layout_method;
        break;
    }

    if( !this.check_clockwise( p ) )
    {
      var first = p;
      var last = first.splice( p.length / 2 );
      first.reverse();
      last.reverse();
      p = ([ first, last ]).flat();
      //p = [ p[3], p[2], p[1], p[0], p[7], p[6], p[5], p[4] ];
    }

    var c1 = p[0];
    var c2 = p.slice( p.length / 2 - 1 )[0];
    var c3 = p.slice( p.length / 2 - 1 )[1];
    var c4 = p.last();

    //var posts_side1 = p.slice( 1, p.length / 2 - 1 );
    var posts_side2 = p.slice( p.length / 2 + 1, p.length - 1 );

    var back_line1 = new Line( c1, c2 );
    var back_line2 = new Line( c3, c4 );
    var side_line1 = new Line( c2, c3 );
    var side_line2 = new Line( c4, c1 );

    var length_line = new Line( back_line1.middle, back_line2.middle );

    var width_p = side_line1.point_on_line( side_line2.start );

    var width_line = new Line( side_line2.start, width_p );

    this.options.Length.val = length_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
    this.options.Width.val = width_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);

    this.calculated_drawing_points = p;
    return p;
    /*
     // Calculate width,length,angle
     var goal_line_1 = back_line1;
     var e1 = goal_line_1.middle; // between goal 1
     var e2 = new Line( posts_side2[0], posts_side2.last() ).middle; // between goal 2
     var m = new Line( e2, e1 );
     
     //this.options.Angle.val = m.as_vector.angle;
     if( this.layout_method !== "free_hand" )
     this.options.Angle.val = goal_line_1.as_vector.rotate_90_ccw().angle;
     //this.options.Length.val = m.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
     
     //var s1 = side_line1.middle;
     //var s2 = side_line2.middle;
     //var m2 = new Line( s1, s2 );
     //this.options.Width.val = goal_line_1.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);
     
     // Save for later use
     this.calculated_drawing_points = p;
     return p;
     */
  }
  get_middle( corners )
  {
    var middle = new Vector( 0, 0 );
    for( var i = 0; i < corners.length; i++ )
    {
      var c = corners[i];
      middle.x += c.x;
      middle.y += c.y;
    }
    return middle.divide( corners.length );
  }
  check_clockwise( corners )
  {
    var middle = this.get_middle( corners );
    var sum = 0;
    var c1 = corners[0].subtract( middle );
    for( var i = 1; i < corners.length; i++ )
    {
      var c2 = corners[i].subtract( middle );
      sum += (c2.x - c1.x) * (c2.y + c1.y);
      c1 = c2;
    }
    return sum > 0;
  }

  fromCenterTo4Corners( center )
  {

    var g1 = new Vector( 1, 0 ).rotate( this.options.Angle.val );
    var g2 = g1.rotate_90_cw();

    g1 = g1.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );

    var c1 = center.add( g1.divide( 2 ) ).add( g2.divide( 2 ) );
    var c2 = c1.add( g1.multiply( -1 ) );
    var c3 = c2.add( g2.multiply( -1 ) );
    var c0 = c3.add( g1 );

    return [ c0, c1, c2, c3 ];
  }
  from2middleToCenter( points )
  {

    var middle_line = new Line( points[0], points[1] );
    var middle = middle_line.middle;
    this.options.Angle.val = middle_line.as_vector.rotate_90_cw().angle;
    if( !this.options.ForceStdMeasurements.val )
      this.options.Width.val = middle_line.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);

    return middle;

  }
  from2endsToCenter( points )
  {

    var middle_line = new Line( points[0], points[1] );
    var middle = middle_line.middle;
    this.options.Angle.val = middle_line.as_vector.angle;

    return middle;
  }
  from2endsTo4corners( points )
  {

    var m1 = points[0];
    var m2 = points[1];
    var g1 = new Line( m1, m2 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    let c0 = m1.add( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c3 = m1.subtract( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c4 = m2.subtract( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );
    let c7 = m2.add( g2.multiply( (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0)) / 2 ) );

    this.options.GoalWidth.val = 0;

    return [ c0, c3, c4, c7 ];
  }
  from2cornersOutsideTo2Corners( corners )
  {

    var pitch_angle = (new Line( corners[0], corners[1] )).angle;
    var move_vec0 = this.options.outsideMoveIn.val.rotate( pitch_angle );
    var move_vec1 = this.options.outsideMoveIn.val.mirror_x().rotate( pitch_angle );
    var new_corners = [
      corners[0].add( move_vec0 ),
      corners[1].add( move_vec1 )
    ];
    return new_corners;
  }
  from2cornersTo4Corners( corners )
  {

    var c0 = corners[0];
    var c3 = corners[1];
    var g1 = new Line( c3, c0 ).unit_vector;
    var g2 = g1.rotate_90_cw();

    if( !(this.options.Rotation.val % 2) )
    {
      g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    else
    {
      g2 = g2.multiply( -this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }

    var c1 = c0.add( g2 );
    var c2 = c3.add( g2 );

    if( !(this.options.Rotation.val % 2) )
      return [ c0, c1, c2, c3 ];
    else
      return [ c3, c2, c1, c0 ];
  }
  from3pointsTo4Corners( points )
  {
    var c1 = points[0];
    var c2 = points[1];
    var side_line = new Line( c1, c2 );

    var p = side_line.point_on_line( points[2] );
    var width = p.dist_to_point( points[2] );

    var direction = new Line( p, points[2] ).unit_vector;
    var wanted_direction = side_line.unit_vector.rotate_90_cw();
    if( !direction.equals( wanted_direction ) )
    {
      width *= -1;
    }

    var g1 = side_line.as_vector;
    var g2 = side_line.unit_vector.rotate_90_cw().multiply( width );

    var c3 = c2.add( g2 );
    var c4 = c3.add( g1.multiply( -1 ) );

    return [ c2, c3, c4, c1 ];

  }
  from2pointsTo4corners( points )
  {

    var c1 = points[0];
    var g1 = new Line( points[0], points[1] ).unit_vector;
    var g2 = g1.rotate_90_cw();

    if( this.options.Rotation.val % 2 )
    {
      g1 = g1.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
      g2 = g2.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    else
    {
      g1 = g1.multiply( this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
      g2 = g2.multiply( this.options.Length.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0) );
    }
    if( this.options.Rotation.val <= 2 )
      g2 = g2.multiply( -1 );

    var c2 = c1.add( g1 );
    var c3 = c2.add( g2 );
    var c4 = c1.add( g2 );
    if( this.options.Rotation.val === 1 )
    { // 1->3
      var tmp = c2;
      c2 = c3;
      c3 = tmp;
      tmp = c1;
      c1 = c4;
      c4 = tmp;
    }
    if( this.options.Rotation.val === 2 )
    { // 2->4
      var tmp = c1;
      c1 = c2;
      c2 = tmp;
      tmp = c3;
      c3 = c4;
      c4 = tmp;
    }
    if( !(this.options.Rotation.val % 2) )
    { // 2,4 -> 3
      var t = c1;
      c1 = c2;
      c2 = c3;
      c3 = c4;
      c4 = t;
    }

    //return [c4, c1, c2, c3];
    return [ c2, c3, c4, c1 ];
  }
  from4cornersTo8points( corners )
  {
    var points = [ ];
    var pitch = this;

    [ [ 0, 1 ], [ 2, 3 ] ].forEach( function( index )
    {
      points.push( corners[index[0]] );
      var back_line = new Line( corners[index[0]], corners[index[1]] );
      var goal_width = (pitch.options["Goal box width"] && !(pitch.options["Right goal pole"].val || pitch.options["Left goal pole"].val || pitch.options["reverseInGoal"].val)) ? pitch.options["Goal box width"].val - pitch.options.LineWidth.val : pitch.options.GoalWidth.val;
      if( goal_width > back_line.length )
      {
        goal_width = back_line.length / 2;
      }
      points.push( back_line.middle.add( back_line.unit_vector.multiply( -goal_width / 2 ) ) );
      points.push( back_line.middle.add( back_line.unit_vector.multiply( goal_width / 2 ) ) );
      points.push( corners[index[1]] );
    } );

    return points;
  }
  from4goalPostsTo8points( poles )
  {
    var points = [ ];

    var goal_line1 = new Line( poles[0], poles[1] );
    var goal_line2 = new Line( poles[2], poles[3] );
    var goal_to_goal = new Line( goal_line1.middle, goal_line2.middle );
    var pitch_center = goal_to_goal.middle;
    var g1 = goal_to_goal.unit_vector;
    var g2 = g1.rotate_90_cw();
    var dist_between_width = (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0));
    var middle_side1 = pitch_center.subtract( g2.multiply( dist_between_width / 2 ) );
    var g1_side1 = middle_side1.add( g1 );
    var middle_side2 = pitch_center.add( g2.multiply( dist_between_width / 2 ) );
    var g1_side2 = middle_side2.add( g1 );

    var side1_guide_line = new Line( middle_side1, g1_side1 );
    var side2_guide_line = new Line( middle_side2, g1_side2 );

    var c1 = goal_line1.cross_with_line( side2_guide_line );
    var c2 = goal_line1.cross_with_line( side1_guide_line );

    var c3 = goal_line2.cross_with_line( side1_guide_line );
    var c4 = goal_line2.cross_with_line( side2_guide_line );

    points.push( c1 );
    points.push( poles[0] );
    points.push( poles[1] );
    points.push( c2 );
    points.push( c3 );
    points.push( poles[2] );
    points.push( poles[3] );
    points.push( c4 );

    return points;
  }
  fromNgoalPostsTo8points( poles )
  {
    var points = [ ];
    var number_posts = poles.length / 2;

    var goal_line1 = new Line( poles[0], poles[number_posts - 1] );
    var goal_line2 = new Line( poles[number_posts], poles.last() );
    var goal_to_goal = new Line( goal_line1.middle, goal_line2.middle );
    var pitch_center = goal_to_goal.middle;
    var g1 = goal_to_goal.unit_vector;
    var g2 = g1.rotate_90_cw();
    var dist_between_width = (this.options.Width.val - (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0));
    var middle_side1 = pitch_center.subtract( g2.multiply( dist_between_width / 2 ) );
    var g1_side1 = middle_side1.add( g1 );
    var middle_side2 = pitch_center.add( g2.multiply( dist_between_width / 2 ) );
    var g1_side2 = middle_side2.add( g1 );

    var side1_guide_line = new Line( middle_side1, g1_side1 );
    var side2_guide_line = new Line( middle_side2, g1_side2 );

    var c1 = goal_line1.cross_with_line( side2_guide_line );
    var c2 = goal_line1.cross_with_line( side1_guide_line );

    var c3 = goal_line2.cross_with_line( side1_guide_line );
    var c4 = goal_line2.cross_with_line( side2_guide_line );

    var first = poles.slice( 0, poles.length / 2 );
    var last = poles.slice( poles.length / 2 );

    points.push( c1 );
    points.pushAll( first );
    points.push( c2 );
    points.push( c3 );
    points.pushAll( last );
    points.push( c4 );

    return points;
  }
  convert_to_free_hand()
  {

    var p = this.drawing_points;
    var back_line_1 = new Line( p[0], p[3] );
    var e1 = back_line_1.middle; // between goal 1
    var e2 = new Line( p[5], p[6] ).middle;
    var m = new Line( e1, e2 );

    //this.options.Angle.val = m.as_vector.angle;
    this.options.Angle.val = back_line_1.as_vector.rotate_90_ccw().angle;
    this.options.Length.val = m.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);

    var s1 = new Line( p[3], p[4] ).middle;
    var s2 = new Line( p[0], p[7] ).middle;
    var m2 = new Line( s1, s2 );
    this.options.Width.val = m2.length + (this.options.addLineLengthInSides.val ? this.options.LineWidth.val : 0);

    this.points = [ m.middle ];
    this.layout_method = "free_hand";
    delete this.calculated_drawing_points;
    this.draw();
  }

  refresh_bb()
  {
    //this.bb = this.drawing_points;
    var p = this.drawing_points;
    this.bb = [ p[0], p[3], p[4], p[7] ];
  }
  change_width_or_length_with_center_point( option, new_val, add_angle )
  {
    if( new_val === 0 )
      return false;
    var moved = option.val - new_val;
    var move_v = new Vector( 1, 0 ).rotate( this.options.Angle.val + add_angle ).multiply( moved / 2 );
    this.points[0] = this.points[0].add( move_v );

    return this.set_new_val( option, new_val );
  }
  set_new_val( option, new_val, allow_zero )
  {
    if( option.name === "Angle" || new_val > 0 || (allow_zero && new_val === 0) )
    {
      option.val = new_val;
      this.draw();
      return true;
    }
    return false;
  }
  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;

    // Free hand handles
    if( this.layout_method === "free_hand" )
    {

      if( !this.options.disableLengthHandles.val )
      {
        this.handles.push( new Handle( new Line( p[5], p[6] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( p[0], p[7] );

          if( this_class.options.SizeHandlesMoveCenter.val )
          {
            var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );

            this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );

            var new_ps = this_class.drawing_points;
            var align_this = this_class.get_align_move( [ new Line( new_ps[5], new_ps[6] ) ], snapping_lines )[0];
            if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_length += align_this.length;
            }
            else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_length -= align_this.length;
            }

            this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
          }
          else
          {

            var new_length = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
            return this_class.set_new_val( this_class.options.Length, new_length, false );
          }
        }, function( new_length )
        {
          if( this_class.options.SizeHandlesMoveCenter.val )
            return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, 0 );
          else
            return this_class.set_new_val( this_class.options.Length, new_length, false );
        } ) );

        this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( p[7], p[0] );

          if( this_class.options.SizeHandlesMoveCenter.val )
          {
            var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
            this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );

            var new_ps = this_class.drawing_points;
            var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
            if( angle_equal( align_this.angle, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_length -= align_this.length;
            }
            else if( angle_equal( align_this.angle + Math.PI, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_length += align_this.length;
            }

            this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
          }
          else
          {

            var new_length = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
            return this_class.set_new_val( this_class.options.Length, new_length, false );
          }
        }, function( new_length )
        {
          if( this_class.options.SizeHandlesMoveCenter.val )
            return this_class.change_width_or_length_with_center_point( this_class.options.Length, new_length, Math.PI );
          else
            return this_class.set_new_val( this_class.options.Length, new_length, false );
        } ) );
      }

      if( !this.options.disableWidthHandles.val )
      {
        this.handles.push( new Handle( new Line( p[3], p[4] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( p[0], p[3] );

          if( this_class.options.SizeHandlesMoveCenter.val )
          {
            var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
            this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );

            var new_ps = this_class.drawing_points;
            var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];
            if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_width -= align_this.length;
            }
            else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_width += align_this.length;
            }

            this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
          }
          else
          {
            var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
            this_class.set_new_val( this_class.options.Width, new_width, false );
          }
        }, function( new_width )
        {
          if( this_class.options.SizeHandlesMoveCenter.val )
            return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI / 2 );
          else
            return this_class.set_new_val( this_class.options.Length, new_width, false );
        } ) );

        this.handles.push( new Handle( new Line( p[0], p[7] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
        {
          var g = new Line( p[3], p[0] );

          if( this_class.options.SizeHandlesMoveCenter.val )
          {

            var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
            this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );

            var new_ps = this_class.drawing_points;
            var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];
            if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_width += align_this.length;
            }
            else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
            {
              new_width -= align_this.length;
            }

            this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );
          }
          else
          {
            var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
            this_class.set_new_val( this_class.options.Width, new_width, false );

          }
        }, function( new_width )
        {
          if( this_class.options.SizeHandlesMoveCenter.val )
            return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, -Math.PI / 2 );
          else
            return this_class.set_new_val( this_class.options.Length, new_width, false );
        } ) );
      }

      var e1 = new Line( p[1], p[2] ).middle;
      var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = new Line( e1, e2 ).middle;
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {

        var g = new_pos_v.subtract( this_class.points[0] );
        this_class.move_all( g );
        this_class.refresh_snapping_lines();

        var align_this = this_class.get_align_move( this_class.snapping_lines, snapping_lines );

        var align_lines = align_this[1];
        align_this = align_this[0];

        this_class.move_all( align_this.multiply( -1 ) );
        this_class.refresh_snapping_lines();

        return align_lines;
      }, function( new_pos_v )
      {

        this_class.points = [ new_pos_v ];
        this_class.draw();
        return true;
      } ) );

      var gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle - gml;
        var align_this = this_class.get_snap_rotation( new_angle, snapping_lines );
        var align_lines = align_this[1];
        new_angle = align_this[0];

        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();

        return align_lines;
      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );
    }
    else if( login_screen_controller.user_level === user_level.DEVELOPER )
    {
      //var e1 = new Line( p[1], p[2] ).middle;
      //var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = this.get_middle( p );
      var original_points = this_class.points.copy();
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
      {


        var diff_vec = new_pos_v.subtract( pitch_center );
        this_class.points = original_points.map( function( p )
        {
          return p.add( diff_vec );
        } );

        delete this_class.calculated_drawing_points;
        this_class.draw();

      }, function( new_pos_v )
      {

        var diff_vec = new_pos_v.subtract( pitch_center );
        this_class.points = original_points.map( function( p )
        {
          return p.add( diff_vec );
        } );
        //this_class.points = [new_pos_v];
        delete this_class.calculated_drawing_points;
        this_class.draw();
        return true;
      } ) );
    }

    // 2 points handles
    if( this.layout_method === "corner,side" )
    {

      this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {

        var g = new Line( p[4], p[3] );
        var new_length = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Length, new_length );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[1], new_ps[2] ) ], snapping_lines )[0];
        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_length -= align_this.length;
        }

        this_class.set_new_val( this_class.options.Length, new_length );

      }, function( new_length )
      {
        return this_class.set_new_val( this_class.options.Length, new_length );
      } ) );

      var handle_center = new Line( p[3], p[4] ).middle;
      if( this.options.Rotation.val === 1 || this.options.Rotation.val === 4 )
        handle_center = new Line( p[0], p[7] ).middle;

      this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {

        var g = new Line( p[0], p[3] );
        if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
          g = new Line( p[3], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this;
        if( this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4 )
          align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
        else
          align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );
        var the_lines = align_this[1];/*.map( function ( line, i ) {
         return new LineTask( i, [line.start, line.end], false, true );
         } );*/
        align_this = align_this[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }

        this_class.set_new_val( this_class.options.Width, new_width );
        return the_lines;
      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );
    }

    // 2 corners handles
    if( this.layout_method === "two_corners" )
    {

      var handle_center = new Line( p[3], p[4] ).middle;
      if( this_class.options.Rotation.val % 2 )
        handle_center = new Line( p[0], p[7] ).middle;

      this.handles.push( new Handle( handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {

        var g = new Line( p[0], p[3] );
        if( this_class.options.Rotation.val % 2 )
          g = new Line( p[3], p[0] );
        var new_width = g.start.dist_to_point( g.point_on_line( new_pos_v ) );
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this;
        if( this_class.options.Rotation.val % 2 )
          align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines );
        else
          align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines );

        var the_lines = align_this[1];/*.map( function ( line, i ) {
         return new LineTask( i, [line.start, line.end], false, true );
         } );*/
        align_this = align_this[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length;
        }
        /*if ( ( align_this.angle - this_class.options.Angle.val ) > 0 )
         new_width -= align_this.length;
         else
         new_width += align_this.length;*/
        this_class.set_new_val( this_class.options.Width, new_width );

        return the_lines;
      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );
    }

    if( this.layout_method === "all_goal_posts" )
    {
      var middle_corners = p.slice( p.length / 2 - 1 );
      var handle1 = new Line( middle_corners[0], middle_corners[1] );
      var handle2 = new Line( p[0], p.last() );
      var center_line = new Line( handle1.middle, handle2.middle );
      var center = center_line.middle;

      this.handles.push( new Handle( handle1.middle, -handle1.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[3], new_ps[4] ) ], snapping_lines )[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length * 2;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length * 2;
        }

        this_class.set_new_val( this_class.options.Width, new_width );

      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );

      this.handles.push( new Handle( handle2.middle, -handle2.angle, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
      {
        var new_width = center.dist_to_point( center_line.point_on_line( new_pos_v ) ) * 2;
        this_class.set_new_val( this_class.options.Width, new_width );

        var new_ps = this_class.drawing_points;
        var align_this = this_class.get_align_move( [ new Line( new_ps[0], new_ps[7] ) ], snapping_lines )[0];

        if( angle_equal( align_this.angle + Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width += align_this.length * 2;
        }
        else if( angle_equal( align_this.angle - Math.PI / 2, this_class.options.Angle.val ) < five_degrees_equal )
        {
          new_width -= align_this.length * 2;
        }

        this_class.set_new_val( this_class.options.Width, new_width );
      }, function( new_width )
      {
        return this_class.set_new_val( this_class.options.Width, new_width );
      } ) );
    }

  }
  refresh_test_run()
  {
    var p = this.drawing_points;
    this.test_tasks = [ ];
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[0] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[3] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[4] ) );
    this.test_tasks.push( new WaypointTask( this.test_tasks.length, p[7] ) );
  }
  refresh_snapping_lines()
  {
    this.snapping_lines = [ ];
    var p = this.drawing_points;

    //this.bb = [p[0], p[3], p[4], p[7]];
    this.snapping_lines.push( new Line( p[0], p[3] ) );
    this.snapping_lines.push( new Line( p[3], p[4] ) );
    this.snapping_lines.push( new Line( p[4], p[7] ) );
    this.snapping_lines.push( new Line( p[7], p[0] ) );

    //for ( var i = 0; i < p.length - 1; i++ )
    //    this.snapping_lines.push( new Line( p[i], p[i + 1] ) );

    var e1 = new Line( p[1], p[2] ).middle;
    var e2 = new Line( p[5], p[6] ).middle;
    var m1 = new Line( e1, e2 );
    var s1 = new Line( p[3], p[4] ).middle;
    var s2 = new Line( p[0], p[7] ).middle;
    var m2 = new Line( s1, s2 );

    this.snapping_lines.push( m1 );
    this.snapping_lines.push( m2 );

  }

  reset_saved_stuff()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    this.test_tasks = [ ];
    this.bb = [ ];
  }
}


class square_pitch_dont_resize extends square_pitch
{

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "free_hand": 0
    };
  }

  refresh_handles()
  {
    var this_class = this;
    this.handles = [ ];
    var p = this.drawing_points;

    // Free hand handles
    if( this.layout_method === "free_hand" )
    {


      var e1 = new Line( p[1], p[2] ).middle;
      var e2 = new Line( p[5], p[6] ).middle;
      var pitch_center = new Line( e1, e2 ).middle;
      this.handles.push( new Handle( pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function( new_pos_v, snapping_lines )
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

      var gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
      this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines )
      {

        var new_angle = new Line( pitch_center, new_pos_v ).as_vector.angle - gml;
        new_angle = this_class.get_snap_rotation( new_angle, snapping_lines )[0];

        this_class.options.Angle.val = new_angle;
        delete this.calculated_drawing_points;
        this_class.draw();

      }, function( new_angle )
      {
        return this_class.set_new_val( this_class.options.Angle, new_angle );
      }, "deg" ) );
    }

  }
}
;