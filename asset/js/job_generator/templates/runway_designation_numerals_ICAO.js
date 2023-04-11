/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Infinity, login_screen_controller, CubicBezierTask, pt, this_class */

class Runway_Designation_Numerals_ICAO extends square_pitch
{
  static template_type = "Text";
  static template_title = "Designation Numerals ICAO";
  static template_id = "runway_designation_numerals_icao_dev";
  static template_image = "img/templates/airport_designation.png";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    this.options["fast_test"].val = false;
    this.options["normal_test"].val = false;
    //this.options.SizeHandlesMoveCenter.val = true;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    //this.options.LineWidth.val = 0.05;
    this.options.Length.val = 5; // width of the whole thing , Calculated in draw
    this.options.Width = {
      adjustable: true,
      name: "Height",
      _val: 9 - this.options.LineWidth.val*2,
      set val( v )
      {
        if( v < 0.5 )
          v = 0.5;
        this._val = v;
      },
      get val()
      {
        return this._val;
      },
      type: "float"
    };

    this.options.font_icao = {
      name: "Font",
      val: "ICAO",
      get values()
      {
        var fonts = ["ICAO"];
        return fonts;
      },
      type: "select",
      configurable: false
  };

  this.options.disableLengthHandles.val = true;
  this.options.disableWidthHandles.val = true;
  this.options.text = {
    name: "Text",
    val: "8",
    type: "text",
    configurable: true,
    adjustable: true
  };

  this.options.extra_space = {
    name: "Space between characters "+ "("+ translate_unit()+")",
    configurable: true,
    val: (15).foot2meter() - this.options.LineWidth.val,
    type: "float"
  };

  this.options.natual_space_between = {
      val: true,
      dontsave: true
    };
    this.options.center_after_letter = {
      val: -1,
      dontsave: true
    };
  this.options.td_zone = {
    name: "td-zone",
    adjustable: false,
    val: false,
    type: "bool"
  };
  this.options.letter_size = {
    name: "Letter size " + "("+ translate_unit()+")",
    configurable: "true",
    val: (60).foot2meter(),
    type: "float"
  };
  this.options.distance2Letters = {
    name: "Distance to characters " + "("+ translate_unit()+")",
    configurable: "true",
    val: (0).foot2meter(),
    type: "float"
  };
  var letter_R = this.get_char_tasks( "R" );
  var letter_size = letter_R[4]- letter_R[2] - this.options.LineWidth.val;
  let _width = (this.options.distance2Letters.val) + letter_size/(letter_size / this.options.letter_size.val)

  this.options.Width = {
    adjustable: true,
    name: "Height",
    val: _width,
    type: "float"
  };
 
}

static get layout_methods()
{
  return {
    "two_corners,side": 3,
    "two_corners": 2,
    "free_hand": 0
  };
}
static get_point_positions( layout_method )
{
  if( layout_method === "two_corners,side" )
  {
    return [
      new Vector( 1, 1 ),
      new Vector( 1, 0 ),
      new Vector( 0, 0 )
    ];
  }
  if( layout_method === "two_corners" )
  {
    return [
      new Vector( 1, 1 ),
      new Vector( 1, 0 )
    ];
  }
}

get_char_tasks( char )
{
  var char_path = text_paths_icao[this.options.font_icao.val][char];
  var result;
  if( char_path.cache )
  {
    result = char_path.cache.slice( 0 );
    result[0] = result[0].copy();
  }
  else
  {
    result = this.path_to_lines( char_path.d );
    char_path.cache = result.slice( 0 );
    char_path.cache[0] = result[0].copy();
  }
  /*
  if( !this.options.natual_space_between.val )
  {
    var min_x = result[1];
    result[0] = result[0].map( t => {
      t.ends = t.ends.map( e => {
        return e.subtract( new Vector( min_x, 0 ) );
      } );
      return t;
    } );

    result[1] = 0;
    result[3] -= min_x;
    result[5] = char_path["horiz-adv-x"] + min_x;
  }
  else
    result[5] = char_path["horiz-adv-x"];
  */
  return result;
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
  for( var c = 0; c < commands.length; c++ )
  {
    var cmd = commands[c];
    var cmdU = cmd.toUpperCase();
    var param = parameters[c + 1].trim();
    var required_numbers = this.get_required_points( cmdU );
    var numbers = param.splitFloats( param );
    if( numbers.length > required_numbers )
    {
      var extra = numbers.splice( required_numbers ).toString().replace( /,/g, " " );
      commands.splice( c + 1, 0, cmd );
      parameters.splice( c + 2, 0, extra );
      param = numbers.toString().replace( /,/g, " " );
      parameters[c + 1] = param;
    }
  }
}
path_to_lines( s )
{
  if( !s.length )
    return [ [ ], 0, 0, 0, 0 ];
  var tasks = [ ];
  var commands = s.match( /[MLHVCSQTAZmlhvcsqtaz]/g );
  var parameters = s.split( /[MLHVCSQTAZmlhvcsqtaz]/g );
  this.expand_commands( commands, parameters );
  var last_point = new Vector( 0, 0 );
  var last_start = new Vector( 0, 0 );
  var max_x = -Infinity;
  var max_y = -Infinity;
  var min_x = Infinity;
  var min_y = Infinity;
  for( var c = 0; c < commands.length; c++ )
  {

    var cmd = commands[c];
    var cmdU = cmd.toUpperCase();
    var upper = cmd === cmdU;
    var param = parameters[c + 1].trim();
    switch( cmdU )
    {
      case "M":
        last_start = param.toVector( true );
        if( !upper )
          last_start = last_start.add( last_point );
        last_point = last_start;
        break;
      case "H":
      case "V":
      case "L":
        let p;
        if( cmdU === "H" )
          p = new Vector( parseFloat( param ), 0 );
        else if( cmdU === "V" )
          p = new Vector( 0, -parseFloat( param ) );
        else
          p = param.toVector( true );
        if( !upper )
          p = p.add( last_point );
        else
        {
          if( cmdU === "H" )
            p.y = last_point.y;
          else if( cmdU === "V" )
            p.x = last_point.x;
        }
        if( last_point.dist_to_point( p ) >= 0.01 )
          tasks.push( new LineTask( tasks.length, [ last_point, p ], false, true ) );
        last_point = p;
        break;
      case "C":
      case "Q":
        var points = param.toVector( true );
        if( !upper )
          points = points.map( p => {
            var new_p = p.add( last_point );
            return new_p;
          } );
        points.unshift( last_point );
        tasks.push( new CubicBezierTask( tasks.length, points, false, true ) );
        last_point = points.last();
        break;
      case "T":
      case "S":
        var points = param.toVector( true );
        if( cmd === "t" )
          points = [ points ];
        if( !upper )
          points = points.map( p => {
            var new_p = p.add( last_point );
            return new_p;
          } );
        if( tasks.last() instanceof CubicBezierTask )
        {
          var last_controll = tasks.last().ends.last( -1 );
          var guide = (new Line( last_controll, tasks.last().end )).as_vector;
          var new_controll = tasks.last().end.add( guide );
          points.unshift( new_controll );
        }
        else
          points.unshift( last_point );
        points.unshift( last_point );
        tasks.push( new CubicBezierTask( tasks.length, points, false, true ) );
        last_point = points.last();
        break;
      case "A":
        //rx ry x-axis-rotation large-arc-flag sweep-flag x y
        var parts = param.splitFloats();
        var rx = parts[0];
        var ry = parts[1];
        var angle = parts[2].deg2rad();
        var arc_flag = parts[3] > 0.5;
        var sweap_flag = parts[4] > 0.5;
        var start = last_point;
        var end = new Vector( parts[5], -parts[6] );
        if( !upper )
          end = end.add( last_point );

        var center = this.getPathACenterParameters( start, end, arc_flag, sweap_flag, rx, ry, angle );

        if( rx === ry )
        {
          tasks.push( ArcTask.From2PointsAndCenter( tasks.length, start, end, center, sweap_flag, true ) );
        }
        else
        {
          var minor = (new Vector( rx, 0 )).rotate( angle );
          var minorGuide = new Line( start, start.add( minor ) );
          var el = new Ellipse2MinorGuide( start, end, minorGuide, sweap_flag ); // minorGuide = line from middle between goals to minor length out perpendicular to line between goals
          tasks.push( el.toEllipseTask( tasks.length, true ) );
        }

        last_point = end.copy();
        break;
      case "Z":
        if( last_start.dist_to_point( last_point ) >= 0.01 )
          tasks.push( new LineTask( tasks.length, [ last_point, last_start ], false, true ) );
        last_start = last_point.copy();
        break;
      default:
        console.log( "Couldn't parse path command", cmd );
        break;
    }

    if( last_point.x > max_x )
      max_x = last_point.x;
    if( last_point.y > max_y )
      max_y = last_point.y;
    if( last_point.x < min_x )
      min_x = last_point.x;
    if( last_point.y < min_y )
      min_y = last_point.y;
  }
  tasks = tasks.map(t => {
    if(t instanceof CubicBezierTask){
      return t.isThisALine()
    }
    else{
      return t;
    }
  })

  return [ tasks, min_x, min_y, max_x, max_y ];
}


draw()
{
  delete this.calculated_drawing_points;
  this.tasks = [ ];
  this.start_locations = [ ];
  var p = this.drawing_points;
  var c1 = p[0];
  var c2 = p[3];
  var c3 = p[4];
  var c4 = p[7];
  var angle = this.options.Angle.val;// (new Line( c3, c2 )).angle;
  
  if(this.layout_method === "two_corners"){
    var sizeCheck = 0;
    
  }
  if(sizeCheck === 0){
    this.options.Width.val -=  this.options.LineWidth.val*2;
  }
  
  let g1 = new Line(c2 ,c1).unit_vector;
 
  
  //var max_x = -Infinity;
  var max_y = -Infinity;
  var min_x = Infinity;
  var min_y = Infinity;
  var chars_tasks = [ ];
  this.options.text.val.split( "" ).forEach( ( char, i ) => {
    if(this.options.text.val.length === 1 && char === "1"){
      let result = this.get_char_tasks( "P" );
      var offset = result[3];
      chars_tasks.push( [ result[0], offset ] );
    }
    else if( text_paths_icao[this.options.font_icao.val][char] )
    {
      //var char_tath = text_paths[this.options.font.val][char];
      let result = this.get_char_tasks( char );

      //max_x = result[3];
      if( i === 0 )
        min_x = result[1];
      if( min_y > result[2] )
        min_y = result[2];
      if( max_y < result[4] )
        max_y = result[4];
      var offset = result[3];
      if( result[5] > 0 && this.options.natual_space_between.val )
        offset = result[5];
      chars_tasks.push( [ result[0], offset ] );

    }
    else
    {
      chars_tasks.push( [ [ ], 0 ] );
    }
  } );
  
  //change move_to_zero y coordinate to letter[2] if you want to center the characters in the square pitch.
  var letter_R = this.get_char_tasks( "R" );
  var letter_size = letter_R[4]- letter_R[2] - this.options.LineWidth.val;
  var one_meter_increase = (letter_size / this.options.letter_size.val + this.options.LineWidth.val)* this.options.distance2Letters.val + this.options.LineWidth.val*2;
  var letter_size_for_positioning = ((letter_size / this.options.letter_size.val - this.options.LineWidth.val*2)/100);
  var move_to_zero = new Vector( letter_R[1], -one_meter_increase + letter_R[2] +(letter_size_for_positioning));
  var scale = (this.options.letter_size.val - this.options.LineWidth.val ) / letter_size;
  var char_x_offset = (-this.options.LineWidth.val)*scale;
  var last_max_x = -Infinity;
  var char_offsets = [ ];

  
  chars_tasks.forEach( ( tasks_p ) => {
    var tasks = tasks_p[0];
    tasks.forEach( t => {
      t.ends = t.ends.map( e => {
        var new_e = e.subtract( move_to_zero );
        new_e = new_e.multiply( scale );
        new_e.x += char_x_offset + this.options.LineWidth.val;
        if( last_max_x < new_e.x )
          last_max_x = new_e.x;
        return new_e;
      } );
    } );
    //var scaleLeft1 = 9.54 * scale;
    char_offsets.push( last_max_x );
    char_x_offset += tasks_p[1] * scale + (this.options.extra_space.val - this.options.LineWidth.val*2) ;
    this.tasks.pushAll( tasks );
  } );
  
  
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
  


  var new_length = last_max_x + this.options.LineWidth.val;
  var mid_bottom = (new Line( c2, c3 )).middle;
  var direction_g = (new Line( c2, c3 )).unit_vector;
  mid_bottom = mid_bottom.add( direction_g.multiply( new_length / 2 ) );

  this.tasks = this.tasks.map( ( t, id ) => {
    t.id = id;
    t.ends = t.ends.map( e => {
      if( this.options.center_after_letter.val >= 0 )

        e = e.add( new Vector( last_max_x / 2 - char_offsets[this.options.center_after_letter.val] + this.options.extra_space.val / 2, 0 ) );
      return e.rotate( this.options.Angle.val ).add( mid_bottom );
    } );
    return t;
  } );
  
  if(this.options.td_zone.val){
  var middle1 = new Line(c1, c4).middle;
  var middle2 = new Line(c2, c3).middle;
  let letterSize = ((60).foot2meter() - this.options.letter_size.val) * -1;
  let moveIt = this.options.distance2Letters.val + letterSize; 
  let cc1 = c1.add(g1.multiply(moveIt));
  let cc2 = c4.add(g1.multiply(moveIt));
  this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
  this.tasks.push( new LineTask( this.tasks.length, [ c2, c3 ], false, true ) );
  this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
  this.tasks.push( new LineTask( this.tasks.length, [ c4, c1 ], false, true ) );
  this.tasks.push( new LineTask( this.tasks.length, [ middle1, middle2 ], false, true ) );
  this.tasks.push( new LineTask( this.tasks.length, [ cc1, cc2 ], false, true ) );
  
  }
  
  this.options.Length.val = last_max_x;

  this.refresh_bb();
  this.refresh_handles();
  this.refresh_test_run();
  this.refresh_snapping_lines();
}

refresh_snapping_lines(){
  this.snapping_lines = [ ];
  var p = this.drawing_points;

  let g1 = new Line(p[3], p[0]).unit_vector;
  this.snapping_lines.push( new Line( p[0], p[3] ) );
  this.snapping_lines.push( new Line( p[3], p[4] ) );
  this.snapping_lines.push( new Line( p[4], p[7] ) );
  this.snapping_lines.push( new Line( p[7], p[0] ) );
  let letterSize = ((60).foot2meter() - this.options.letter_size.val) * -1;
  let moveIt = this.options.distance2Letters.val + letterSize; 
  let cc1 = p[0].add(g1.multiply(moveIt));
  let cc2 = p[7].add(g1.multiply(moveIt ));
  this.snapping_lines.push( new Line( cc1, cc2 ) );

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


/*
refresh_handles()
{
  super.refresh_handles();

  var this_class = this;
  this_class.options.SizeHandlesMoveCenter.val = true;
  var p = this.drawing_points;



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
 
    if( this_class.options.SizeHandlesMoveCenter.val ){
          return this_class.change_width_or_length_with_center_point( this_class.options.Width, new_width, Math.PI/2 );
        }
        else
        {
          return this_class.set_new_val( this_class.options.Width, new_width, false );
        }
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
    if(this_class.options.SizeHandlesMoveCenter.val){
      return this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, -Math.PI/2);
    }
    else
    {
    return this_class.set_new_val( this_class.options.Width, new_width, false );
    }
  } ) );
  
}*/

from2cornersTo4Corners( corners )
{
 let [ c0, c1, c2, c3 ] = super.from2cornersTo4Corners( corners );

  if( (this.options.Rotation.val % 2) )
    return [ c0, c1, c2, c3 ];
  else
    return [ c2, c3, c0, c1 ];
 
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
   var g3 = side_line.unit_vector.rotate_90_ccw();
   

   
   //var c3 = c2.add( g2 );
   //var c4 = c3.add( g1.multiply( -1 ) );
  
   c1 = c1.subtract(g3.multiply(width));
   c2 = c2.subtract(g3.multiply(width));
   var c3 = c2.subtract( g3.multiply(-(this.options.letter_size.val - this.options.LineWidth.val)) );
   var c4 = c1.subtract( g3.multiply(-(this.options.letter_size.val - this.options.LineWidth.val)));

   return [ c3, c2, c1, c4 ];
   
  }
}


  var text_paths_icao = {
   
    "ICAO": {
      "0": {"d": "m 48.15338,208.81165 v -320.99223 h 77.79508 V 208.81165 Z M 9.2558274,287.74418 V -193.74417 H 167.43918 v 481.48835 z"},
      "1": {"d": "m 9.3047904,-177.82519 v 63.48006 H 24.946104 V 287.69521 H 64.049409 V -193.69521 H 24.946104 Z"},
      "2": {"d": "M 48.408109,208.34514 V 160.73509 L 168.32499,-24.414997 V -193.69521 H 9.3047904 V -66.735084 H 48.408109 v -47.610046 h 80.813561 v 71.415139 L 9.3047904,144.86507 V 287.69521 H 168.32499 v -79.35007 z"},
      "3": {"d": "m 105.75961,-0.61004327 c 20.8551,-19.39670073 41.7102,-38.79340173 62.5653,-58.19010273 0,-44.965024 0,-89.930044 0,-134.895064 -53.00671,0 -106.013413,0 -159.0201196,0 0,26.45003 0,52.90005 0,79.35008 39.9722666,0 79.9445326,0 119.9167996,0 -0.53657,8.05974 1.05743,17.028718 -0.76623,24.539192 C 97.428126,-60.073973 66.400889,-30.342008 35.373651,-0.61004327 66.656297,28.484961 97.938944,57.579966 129.22159,86.674971 c 0,40.556719 0,81.113449 0,121.670169 -39.972267,0 -79.944533,0 -119.9167996,0 0,26.45002 0,52.90005 0,79.35007 53.0067066,0 106.0134096,0 159.0201196,0 0,-77.58676 0,-155.17351 0,-232.760269 -20.8551,-18.514995 -41.7102,-37.02999 -62.5653,-55.54498427 z"},
      "4": {"d": "m 20.252558,186.1297 c 45.220245,0 90.440492,0 135.660742,0 0,33.91881 0,67.83816 0,101.75698 15.0736,0 30.14662,0 45.22023,0 0,-33.91882 0,-67.83817 0,-101.75698 13.18905,0 26.37867,0 39.56771,0 0,-26.77815 0,-53.5563 0,-80.33449 -13.18904,0 -26.37866,0 -39.56771,0 0,-51.771277 0,-103.5420301 0,-155.313297 -15.07361,0 -30.14663,0 -45.22023,0 0,51.7712669 0,103.54202 0,155.313297 -24.49411,0 -48.98879,0 -73.482906,0 20.726146,-99.9719619 41.451706,-199.943353 62.177836,-299.9153 -15.07359,0 -30.14664,0 -45.220246,0 C 73.009322,-67.37001 46.631224,59.379565 20.252558,186.1297 Z"},
      "5": {"d": "M 48.408095,-50.865069 V -114.34513 H 168.32494 v -79.35008 H 9.3047904 V 31.129987 H 129.22162 V 208.34514 H 9.3047904 v 79.35007 H 168.32494 V -50.865069 Z"},
      "6": {"d": "m 51.115341,208.34527 c 0,-45.8468 0,-91.6936 0,-137.540402 26.068911,0 52.137819,0 78.206729,0 0,45.846802 0,91.693602 0,137.540402 -26.06891,0 -52.137818,0 -78.206729,0 z M 51.115075,-8.5454765 c 0,-24.6867465 0,-49.3734925 0,-74.0602385 26.068911,-26.450065 52.137825,-52.900135 78.206735,-79.350205 0,-19.39673 0,-38.79347 0,-58.19019 -39.972335,35.26676 -79.944669,70.53354 -119.9170046,105.80031 0,134.013666 0,268.02732 0,402.04099 53.0067976,0 106.0135946,0 159.0203946,0 0,-98.74689 0,-197.49378 0,-296.2406665 -39.10338,0 -78.206752,0 -117.310125,0 z"},
      "7": {"d": "m 194.47121,-193.62994 c -61.70039,0 -123.40077,0 -185.1011553,0 0,26.44284 0,52.88569 0,79.32853 39.6645313,0 79.3290633,0 118.9935953,0 C 93.987722,19.67571 59.611795,153.65283 25.235867,287.62995 c 13.221511,0 26.443023,0 39.664534,0 C 108.09067,127.20999 151.28094,-33.209977 194.47121,-193.62994 Z"},
      "8": {"d": "m 48.40836,-32.350074 c 0,-26.450025 0,-52.900051 0,-79.350076 26.06887,0 52.13774,0 78.20661,0 0,26.450025 0,52.900051 0,79.350076 -26.06887,0 -52.13774,0 -78.20661,0 z m 0,240.695484 c 0,-51.13668 0,-102.27337 0,-153.410051 26.06887,0 52.13774,0 78.20661,0 0,51.136681 0,102.273371 0,153.410051 -26.06887,0 -52.13774,0 -78.20661,0 z M 139.64915,15.259972 c 9.55859,-9.698304 19.11717,-19.396608 28.67576,-29.094912 0,-59.953423 0,-119.90685 0,-179.86027 -53.00671,0 -106.013413,0 -159.0201196,0 0,59.95342 0,119.906847 0,179.86027 9.5585856,9.698304 19.1171716,19.396608 28.6757576,29.094912 -9.558586,8.816691 -19.117172,17.633381 -28.6757576,26.450072 0,81.995056 0,163.990106 0,245.985166 53.0067066,0 106.0134096,0 159.0201196,0 0,-81.99506 0,-163.99011 0,-245.985166 -9.55859,-8.816691 -19.11717,-17.633381 -28.67576,-26.450072 z"},
      "9": {"d": "m 51.014997,23.1459 c 0,-45.846813 0,-91.693631 0,-137.54054 26.068931,0 52.137863,0 78.206793,0 0,45.846909 0,91.693727 0,137.54054 -26.06893,0 -52.137862,0 -78.206793,0 z m 0,290.95045 c 0,-19.39669 0,-38.79339 0,-58.19008 26.068931,-26.45008 52.137863,-52.90015 78.206793,-79.35023 0,-24.68676 0,-49.37351 0,-74.06024 -39.972327,0 -79.944654,0 -119.916981,0 0,-98.7468786 0,-197.49383 0,-296.24082 53.006794,0 106.013591,0 159.020381,0 0,134.013809 0,268.027525 0,402.04115 -39.1034,35.26674 -78.206795,70.53348 -117.310193,105.80022 z"},
      "C": {"d": "m 129.22167,176.6051 v 31.74004 H 48.408109 v -322.69027 h 80.813561 v 31.740031 h 39.10332 V -193.69521 H 9.3047904 V 287.69521 H 168.32499 V 176.6051 Z"},
      "L": {"d": "M 48.408109,-193.69521 H 9.3047904 V 287.69521 H 168.32485 V 208.34514 H 48.408109 Z"},
      "R": {"d": "m 48.408109,7.3250341 c 0,-40.5567211 0,-81.1134431 0,-121.6701641 26.06888,0 52.137761,0 78.206641,0 0,40.556721 0,81.113443 0,121.6701641 -26.06888,0 -52.137761,0 -78.206641,0 z M 90.118353,86.675111 c 13.034437,67.006699 26.068877,134.013399 39.103317,201.020099 13.03442,0 26.06885,0 39.10327,0 -13.03442,-67.0067 -26.06885,-134.0134 -39.10327,-201.020099 13.03442,0 26.06885,0 39.10327,0 0,-93.4567737 0,-186.913551 0,-280.370321 -53.00672,0 -106.013433,0 -159.0201496,0 0,160.463473 0,320.92695 0,481.39042 13.0344396,0 26.0688786,0 39.1033186,0 0,-67.0067 0,-134.0134 0,-201.020099 13.903415,0 27.806829,0 41.710244,0 z"}
    }
  
  }