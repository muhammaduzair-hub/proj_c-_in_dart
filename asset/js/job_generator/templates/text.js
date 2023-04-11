/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Infinity, login_screen_controller, CubicBezierTask, pt, this_class */

class Text extends square_pitch
{
  static template_type = "Text";
  static template_title = "Standard";
  static template_id = "text";
  static template_image = "img/templates/text_black.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    // configurable = can be changed on creation
    // adjustable = can be changed on modification
    //this.options.LineWidth.val = 0.05;
    this.options.Length.val = 5; // width of the whole thing , Calculated in draw
    //this.options.Width.val = 20; // height of the letters
    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 29,
      set val( v )
      {
        if( v < 0.5 )
          v = 0.5;
        this._val = v;
      },
      get val()
      {
        if( this_class.options.font.val === "Teko" && this._val < 5 )
          this._val = 5;
        return this._val;
      },
      type: "float"
    };
    this.options.disableLengthHandles.val = true;
    this.options.disableWidthHandles.val = true;
    this.options.text = {
      name: "Text",
      val: "TinyMobileRobots",
      type: "text",
      configurable: true,
      adjustable: true
    };
    this.options.extra_space = {
      name: "Extra space",
      configurable: true,
      val: 0,
      type: "float"
    };
    this.options.font = {
      name: "Font",
      val: "College",
      get values()
      {
        if( login_screen_controller.user_level === user_level.DEVELOPER )
          return Object.keys( Text_paths );
        else
        {
          var fonts = [ "College", "Segment" ];
          if( pt.template_options[this_class.template_id] && pt.template_options[this_class.template_id].indexOf( "enable_teko_font" ) >= 0 )
            fonts.push( "Teko" );
          return fonts;
        }
      },
      type: "select",
      configurable: true
    };
    this.options.natual_space_between = {
      val: true,
      dontsave: true
    };
    this.options.center_after_letter = {
      val: -1,
      dontsave: true
    };

  }

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, 0.25 )
      ];
    }
  }

  get_char_tasks( char )
  {
    var char_path = Text_paths[this.options.font.val][char];
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

    return result;
  }
  path_to_lines( s )
  {
    if( !s.length )
      return [ [ ], 0, 0, 0, 0 ];
    var tasks = [ ];
    var commands = s.match( /[A-Za-z]/g );
    var parameters = s.split( /[A-Za-z]/g );
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
          last_start = param.toVector();
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
            p = new Vector( 0, parseFloat( param ) );
          else
            p = param.toVector();
          if( !upper )
            p = p.add( last_point );
          if( last_point.dist_to_point( p ) >= 0.01 )
            tasks.push( new LineTask( tasks.length, [ last_point, p ], false, true ) );
          last_point = p;
          break;
        case "C":
        case "Q":
          var points = param.toVector();
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
          var points = param.toVector();
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
        case "Z":
          if( last_start.dist_to_point( last_point ) >= 0.01 )
            tasks.push( new LineTask( tasks.length, [ last_point, last_start ], false, true ) );
          break;
        default:
          console.log( cmd );
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

    //var max_x = -Infinity;
    var max_y = -Infinity;
    var min_x = Infinity;
    var min_y = Infinity;
    var chars_tasks = [ ];
    this.options.text.val.split( "" ).forEach( ( char, i ) => {
      if( Text_paths[this.options.font.val][char] )
      {
        //var char_path = Text_paths[this.options.font.val][char];
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


    var move_to_zero = new Vector( 0, 0 );
    var letter_A = this.get_char_tasks( "A" );
    var letter_size = letter_A[4];// - letter_A[2];
    var scale = (this.options.Width.val - this.options.LineWidth.val) / letter_size;
    var char_x_offset = 0;
    var last_max_x = -Infinity;
    var char_offsets = [ ];
    chars_tasks.forEach( ( tasks_p ) => {
      var tasks = tasks_p[0];
      tasks.forEach( t => {
        t.ends = t.ends.map( e => {
          var new_e = e.subtract( move_to_zero );
          new_e = new_e.multiply( scale );
          new_e.x += char_x_offset;
          if( last_max_x < new_e.x )
            last_max_x = new_e.x;
          return new_e;
        } );
      } );
      char_offsets.push( last_max_x );
      char_x_offset += tasks_p[1] * scale + this.options.extra_space.val;
      this.tasks.pushAll( tasks );
    } );

    if( this.options.font.val === "Teko" )
    {
      this.tasks.map( ( t, i ) => {
        let lt = this.tasks[i - 1];
        if( i > 0 )
        {
          if( t.start.dist_to_point( lt.end ) > t.end.dist_to_point( lt.end ) )
            return t.opposite_direction;
        }
        return t;
      } );

      let last_task = this.tasks[0];
      this.tasks.forEach( t => {
        let ad = Math.abs( t.start_direction - t.end_direction );
        let d = t.start.dist_to_point( t.end );
        let naive_curvature = d / ad;
        let max_speed = naive_curvature * 4;
        if( max_speed > 1 )
          max_speed = 1;
        if( max_speed < 0.3 )
          max_speed = 0.3;
        t.max_speed = max_speed.round( 1 );
        if( t.max_speed < 1 )
          t.task_options.push( new FloatRobotAction( "drive_max_velocity", t.max_speed ) );
        if( t.max_speed !== last_task.max_speed )
          last_task.task_options.push( new BoolRobotAction( "task_merge_next", false ) );
        last_task = t;
      } );
    }
    else
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
    }

    var new_length = last_max_x;
    var mid_bottom = (new Line( c2, c3 )).middle;
    var direction_g = (new Line( c2, c3 )).unit_vector;
    mid_bottom = mid_bottom.add( direction_g.multiply( new_length / 2 ) );

    this.tasks = this.tasks.map( ( t, id ) => {
      t.id = id;
      t.ends = t.ends.map( e => {
        if( this.options.center_after_letter.val >= 0 )
          e = e.add( new Vector( last_max_x / 2 - char_offsets[this.options.center_after_letter.val] - this.options.extra_space.val / 2, 0 ) );
        return e.rotate( this.options.Angle.val ).add( mid_bottom );
      } );
      return t;
    } );

    this.options.Length.val = last_max_x;

    this.start_locations.push(this.tasks[0].toStartLocation());

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

  refresh_handles()
  {
    super.refresh_handles();

    var this_class = this;
    this_class.options.SizeHandlesMoveCenter.val = false;
    var p = this.drawing_points;

    var center_line = new Line( (new Line( p[0], p[3] )).middle, (new Line( p[4], p[7] )).middle );
    const pitch_center = center_line.middle;

    this.handles.push( new Handle( new Line( p[5], p[6] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {
      var p2 = center_line.point_on_line( new_pos_v );
      var length_line = new Line( center_line.start, p2 );
      var new_length = length_line.length;
      var new_middle = length_line.middle;

      var different = this_class.options.Width.val / this_class.options.Length.val;
      var new_width = different * new_length;

      this_class.points = [ new_middle ];

      this_class.options.Length.val = new_length;
      this_class.set_new_val( this_class.options.Width, new_width, false );


    }, function( new_length )
    {
      var different = this_class.options.Width.val / this_class.options.Length.val;
      var new_width = different * new_length;

      var move = this_class.options.Length.val - new_length;
      var g = (new Vector( move / 2.0, 0 )).rotate( this_class.options.Angle.val );
      this_class.points = [ this_class.points[0].add( g ) ];
      this_class.options.Length.val = new_length;

      return this_class.set_new_val( this_class.options.Width, new_width, false );
    } ) );

    this.handles.push( new Handle( new Line( p[1], p[2] ).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {

      var p2 = center_line.point_on_line( new_pos_v );
      var length_line = new Line( center_line.end, p2 );
      var new_length = length_line.length;
      var new_middle = length_line.middle;

      var different = this_class.options.Width.val / this_class.options.Length.val;
      var new_width = different * new_length;

      this_class.points = [ new_middle ];

      this_class.options.Length.val = new_length;
      this_class.set_new_val( this_class.options.Width, new_width, false );

    }, function( new_length )
    {

      var different = this_class.options.Width.val / this_class.options.Length.val;
      var new_width = different * new_length;

      var move = this_class.options.Length.val - new_length;
      var g = (new Vector( -move / 2.0, 0 )).rotate( this_class.options.Angle.val );
      this_class.points = [ this_class.points[0].add( g ) ];
      this_class.options.Length.val = new_length;

      return this_class.set_new_val( this_class.options.Width, new_width, false );

    } ) );


    this.handles.push( new Handle( new Line( p[3], p[4] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {
      var g = new Line( p[0], p[3] );
      var aspect = this_class.options.Width.val / this_class.options.Length.val;

      var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
      var new_length = new_width / aspect;
      this_class.options.Length.val = new_length;
      this_class.set_new_val( this_class.options.Width, new_width, false );

    }, function( new_width )
    {
      var aspect = this_class.options.Width.val / this_class.options.Length.val;
      var new_length = new_width / aspect;

      this_class.options.Length.val = new_length;
      return this_class.set_new_val( this_class.options.Width, new_width, false );
    } ) );



    this.handles.push( new Handle( new Line( p[0], p[7] ).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function( new_pos_v, snapping_lines )
    {
      var g = new Line( p[3], p[0] );
      var aspect = this_class.options.Width.val / this_class.options.Length.val;

      var new_width = g.middle.dist_to_point( g.point_on_line( new_pos_v ) ) * 2;
      var new_length = new_width / aspect;

      this_class.options.Length.val = new_length;
      this_class.set_new_val( this_class.options.Width, new_width, false );


    }, function( new_width )
    {
      var aspect = this_class.options.Width.val / this_class.options.Length.val;
      var new_length = new_width / aspect;

      this_class.options.Length.val = new_length;
      return this_class.set_new_val( this_class.options.Width, new_width, false );
    } ) );

    const gml = new Line( pitch_center, p[0] ).as_vector.angle - this.options.Angle.val;
    this.handles.push( new Handle( p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function( new_pos_v, snapping_lines ) {
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
}




var Text_paths = {
  "College": {
    "!": {"horiz-adv-x": 400, "d": "M100 0v200h200v-200h-200zM150 400l-50 500v500h200v-500l-50 -500h-100z"},
    "#": {"horiz-adv-x": 1200, "d": "M300 200v200h-200v200h200v200h-200v200h200v200h200v-200h200v200h200v-200h200v-200h-200v-200h200v-200h-200v-200h-200v200h-200v-200h-200zM500 600h200v200h-200v-200z"},
    "$": {"horiz-adv-x": 0, "d": "M400 0v200h-140l-160 160v140h200v-100h400v200h-440l-160 160v280l160 160h140v200h200v-200h140l160 -160v-140h-200v100h-400v-200h440l160 -160v-280l-160 -160h-140v-200h-200z"},
    "'": {"horiz-adv-x": 400, "d": "M100 1200v200h200v-200l-100 -200h-100l100 200h-100z"},
    "+": {"horiz-adv-x": 0, "d": "M400 300v300h-300v200h300v300h200v-300h300v-200h-300v-300h-200z"},
    ",": {"horiz-adv-x": 400, "d": "M100 0v200h200v-200l-100 -200h-100l100 200h-100z"},
    "-": {"horiz-adv-x": 0, "d": "M100 600v200h800v-200h-800z"},
    ".": {"horiz-adv-x": 400, "d": "M100 0v200h200v-200h-200z"},
    "0": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-1080l-160 -160h-480zM300 200h400v1000h-400v-1000z"},
    "1": {"horiz-adv-x": 0, "d": "M200 0v200h200v852h-148v148l148 200h200v-1200h200v-200h-600z"},
    "2": {"horiz-adv-x": 0, "d": "M100 0v640l160 160h440v400h-400v-100h-200v140l160 160h480l160 -160v-480l-160 -160h-440v-400h400v100h200v-300h-800z"},
    "3": {"horiz-adv-x": 0, "d": "M100 1100v140l160 160h480l160 -160v-480l-60 -60l60 -60v-480l-160 -160h-480l-160 160v140h200v-100h400v400h-200v200h200v400h-400v-100h-200z"},
    "4": {"horiz-adv-x": 0, "d": "M500 0v200h100v200h-500v200l500 800h200v-800h100v-200h-100v-200h100v-200h-400zM352 600h248v400z"},
    "5": {"horiz-adv-x": 0, "d": "M100 1400h800v-200h-600v-400h440l160 -160v-480l-160 -160h-480l-160 160v140h200v-100h400v400h-440l-160 160v640z"},
    "6": {"horiz-adv-x": 0, "d": "M900 1100h-200v100h-400v-400h440l160 -160v-480l-160 -160h-480l-160 160v1080l160 160h480l160 -160v-140zM300 200h400v400h-400v-400z"},
    "7": {"horiz-adv-x": 0, "d": "M100 0v200h148l396 1000h-344v-100h-200v300h800v-200l-412 -1000h148v-200h-536z"},
    "8": {"horiz-adv-x": 0, "d": "M900 760l-60 -60l60 -60v-480l-160 -160h-480l-160 160v480l60 60l-60 60v480l160 160h480l160 -160v-480zM300 800h400v400h-400v-400zM300 200h400v400h-400v-400z"},
    "9": {"horiz-adv-x": 0, "d": "M100 300h200v-100h400v400h-440l-160 160v480l160 160h480l160 -160v-1080l-160 -160h-480l-160 160v140zM700 1200h-400v-400h400v400z"},
    ":": {"horiz-adv-x": 400, "d": "M100 0v200h200v-200h-200zM100 600v200h200v-200h-200z"},
    ";": {"horiz-adv-x": 400, "d": "M100 600v200h200v-200h-200zM100 0v200h200v-200l-100 -200h-100l100 200h-100z"},
    "=": {"horiz-adv-x": 0, "d": "M100 800v200h800v-200h-800zM100 400v200h800v-200h-800z"},
    "?": {"horiz-adv-x": 0, "d": "M100 1000v240l160 160h480l160 -160v-480l-160 -160h-140v-200h-200v240l160 160h140v400h-400v-200h-200zM400 200h200v-200h-200v200z"},
    "A": {"horiz-adv-x": 1200, "d": "M100 0v200h100l300 1200h200l300 -1200h100v-200h-400v200h100l-50 200h-300l-50 -200h100v-200h-400zM600 1000l-100 -400h200z"},
    "B": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h740l160 -160v-480l-60 -60l60 -60v-480l-160 -160h-740zM400 800h400v400h-400v-400zM400 200h400v400h-400v-400z"},
    "C": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-240h-200v200h-400v-1000h400v200h200v-240l-160 -160h-480z"},
    "D": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h740l160 -160v-1080l-160 -160h-740zM400 200h400v1000h-400v-1000z"},
    "E": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h900v-300h-200v100h-400v-400h200v100h200v-400h-200v100h-200v-400h400v100h200v-300h-900z"},
    "F": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h900v-300h-200v100h-400v-400h200v100h200v-400h-200v100h-200v-400h100v-200h-400z"},
    "G": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-240h-200v200h-400v-1000h400v400h-200v200h400v-640l-160 -160h-480z"},
    "H": {"horiz-adv-x": 1200, "d": "M100 0v200h100v1000h-100v200h400v-200h-100v-400h400v400h-100v200h400v-200h-100v-1000h100v-200h-400v200h100v400h-400v-400h100v-200h-400z"},
    "I": {"horiz-adv-x": 600, "d": "M100 0v200h100v1000h-100v200h400v-200h-100v-1000h100v-200h-400z"},
    "J": {"horiz-adv-x": 1100, "d": "M300 400v-200h400v1000h-100v200h400v-200h-100v-1040l-160 -160h-480l-160 160v240h200z"},
    "K": {"horiz-adv-x": 1280, "d": "M100 0v200h100v1000h-100v200h400v-200h-100v-400l400 400h-100v200h480v-200h-100l-440 -440l440 -560h100v-200h-444v200h100l-336 420l-100 -100v-320h100v-200h-400z"},
    "L": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h400v-200h-100v-1000h400v100h200v-300h-900z"},
    "M": {"horiz-adv-x": 1500, "d": "M100 0v200h100v1000h-100v200h300l350 -860l350 860h300v-200h-100v-1000h100v-200h-400v200h100v660l-350 -860l-350 860v-660h100v-200h-400z"},
    "N": {"horiz-adv-x": 1300, "d": "M100 0v200h100v1000h-100v200h300l500 -960v760h-100v200h400v-200h-100v-1200h-200l-500 960v-760h100v-200h-400z"},
    "O": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-1080l-160 -160h-480zM300 200h400v1000h-400v-1000z"},
    "P": {"horiz-adv-x": 1100, "d": "M100 0v200h100v1000h-100v200h740l160 -160v-480l-160 -160h-440v-400h100v-200h-400zM400 800h400v400h-400v-400z"},
    "Q": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-1080l-160 -160h-140v-100h-200v100h-140zM300 200h100v100h200v-100h100v1000h-400v-1000z"},
    "R": {"horiz-adv-x": 1200, "d": "M100 0v200h100v1000h-100v200h740l160 -160v-480l-60 -60l60 -60v-440h100v-200h-400v200h100v400h-400v-400h100v-200h-400zM400 800h400v400h-400v-400z"},
    "S": {"horiz-adv-x": 0, "d": "M100 300h200v-100h400v400h-440l-160 160v480l160 160h480l160 -160v-140h-200v100h-400v-400h440l160 -160v-480l-160 -160h-480l-160 160v140z"},
    "T": {"horiz-adv-x": 1200, "d": "M400 0v200h100v1000h-200v-100h-200v300h1000v-300h-200v100h-200v-1000h100v-200h-400z"},
    "U": {"horiz-adv-x": 1200, "d": "M100 1400h400v-200h-100v-1000h400v1000h-100v200h400v-200h-100v-1040l-160 -160h-480l-160 160v1040h-100v200z"},
    "V": {"horiz-adv-x": 1200, "d": "M100 1400h400v-200h-100l200 -800l200 800h-100v200h400v-200h-100l-300 -1200h-200l-300 1200h-100v200z"},
    "W": {"horiz-adv-x": 1600, "d": "M100 1200v200h400v-200h-100l140 -700l260 520l260 -520l140 700h-100v200h400v-200h-100l-200 -1000h100v-200h-400v200h100l-200 400l-200 -400h100v-200h-400v200h100l-200 1000h-100z"},
    "X": {"horiz-adv-x": 1200, "d": "M100 1200v200h400v-200h-100l200 -333l200 333h-100v200h400v-200h-100l-300 -500l300 -500h100v-200h-400v200h100l-200 333l-200 -333h100v-200h-400v200h100l300 500l-300 500h-100z"},
    "Y": {"horiz-adv-x": 1200, "d": "M100 1200v200h400v-200h-100l200 -333l200 333h-100v200h400v-200h-100l-300 -500v-500h100v-200h-400v200h100v500l-300 500h-100z"},
    "Z": {"horiz-adv-x": 1200, "d": "M100 1100v300h1000v-200l-740 -1000h540v100h200v-300h-1000v200l740 1000h-540v-100h-200z"},
    "Æ": {"horiz-adv-x": 1300, "d": "M0,200 L100,200 L400,1400 L1200,1400 L1200,1100 L1000,1100 L1000,1200 L700,1200 L700,800 L800,800 L800,900 L1000,900 L1000,500 L800,500 L800,600 L700,600 L700,200 L1000,200 L1000,300 L1200,300 L1200,0 L500,0 L500,400 L350,400 L300,200 L400,200 L400,0 L0,0 Z M400,600 L500,600 L500,1000 Z"},
    "Ø": {"horiz-adv-x": 0, "d": "M767.4875,1452.2247 L740.3511,1399.6586 L740.0097,1400 L259.9171,1399.9999 L100,1239.9122 L100,159.9171 L36.6817,37.2059 L228.514,-61.7823 L260.4291,0 L740.0097,0 L899.9268,159.9171 L899.9268,1238.5468 L959.1491,1353.2366 ZM299.8537,1199.9756 L637.2668,1199.9756 L299.8537,546.8243 ZM699.9024,199.8537 L363.684,199.8537 L699.9024,851.1276 Z"},
    "Å": {"horiz-adv-x": 0, "d": "M100,0 L100,200 L200,200 L500,1400 L700,1400 L1000,200 L1100,200 L1100,0 L700,0 L700,200 L800,200 L750,400 L450,400 L400,200 L500,200 L500,0 Z M600,1000 L500,600 L700,600 Z M500,1700 L700,1700  M700,1700 L700,1500  M700,1500 L500,1500  M500,1500 L500,1700"},
    "Ö": {"horiz-adv-x": 0, "d": "M260,1400 L100,1240 L100,160 L260,0 L740,0 L900,160 L900,1240 L740,1400 Z M300,1200 L700,1200 L700,200 L300,200 Z M259.6066,1700 L459.6066,1700  M740.3934,1700 L540.3934,1700  M459.6066,1700 L459.6066,1500  M540.3934,1700 L540.3934,1500  M459.6066,1500 L259.6066,1500  M540.3934,1500 L740.3934,1500  M259.6066,1500 L259.6066,1700  M740.3934,1500 L740.3934,1700"},
    "Ä": {"horiz-adv-x": 0, "d": "M100,0 L100,200 L200,200 L500,1400 L700,1400 L1000,200 L1100,200 L1100,0 L700,0 L700,200 L800,200 L750,400 L450,400 L400,200 L500,200 L500,0 Z M600,1000 L500,600 L700,600 Z M359.6066,1700 L559.6066,1700  M840.3934,1700 L640.3934,1700  M559.6066,1700 L559.6066,1500  M640.3934,1700 L640.3934,1500  M559.6066,1500 L359.6066,1500  M640.3934,1500 L840.3934,1500  M359.6066,1500 L359.6066,1700  M840.3934,1500 L840.3934,1700"},
    "a": {"horiz-adv-x": 1100, "d": "M100 0l350 1400h200l350 -1400h-200l-100 400h-300l-100 -400h-200zM550 1000l-100 -400h200z"},
    "b": {"horiz-adv-x": 0, "d": "M100 0v1400h640l160 -160v-480l-60 -60l60 -60v-480l-160 -160h-640zM300 800h400v400h-400v-400zM300 200h400v400h-400v-400z"},
    "c": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-240h-200v200h-400v-1000h400v200h200v-240l-160 -160h-480z"},
    "d": {"horiz-adv-x": 0, "d": "M100 0v1400h640l160 -160v-1080l-160 -160h-640zM300 200h400v1000h-400v-1000z"},
    "e": {"horiz-adv-x": 0, "d": "M100 0v1400h800v-200h-600v-400h400v-200h-400v-400h600v-200h-800z"},
    "f": {"horiz-adv-x": 0, "d": "M100 0v1400h800v-200h-600v-400h400v-200h-400v-600h-200z"},
    "g": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-240h-200v200h-400v-1000h400v400h-200v200h400v-640l-160 -160h-480z"},
    "h": {"horiz-adv-x": 0, "d": "M100 0v1400h200v-600h400v600h200v-1400h-200v600h-400v-600h-200z"},
    "i": {"horiz-adv-x": 400, "d": "M100 0v1400h200v-1400h-200z"},
    "j": {"horiz-adv-x": 0, "d": "M300 400v-200h400v1200h200v-1240l-160 -160h-480l-160 160v240h200z"},
    "k": {"horiz-adv-x": 1200, "d": "M100 0v1400h200v-552l552 552h248l-560 -560l560 -840h-244l-456 700l-100 -100v-600h-200z"},
    "l": {"horiz-adv-x": 0, "d": "M100 0v1400h200v-1200h600v-200h-800z"},
    "m": {"horiz-adv-x": 1300, "d": "M100 0v1400h200l350 -860l350 860h200v-1400h-200v860l-350 -860l-350 860v-860h-200z"},
    "n": {"horiz-adv-x": 1100, "d": "M100 0v1400h200l500 -960v960h200v-1400h-200l-500 960v-960h-200z"},
    "o": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-1080l-160 -160h-480zM300 200h400v1000h-400v-1000z"},
    "p": {"horiz-adv-x": 0, "d": "M100 0v1400h640l160 -160v-480l-160 -160h-440v-600h-200zM300 800h400v400h-400v-400z"},
    "q": {"horiz-adv-x": 0, "d": "M260 0l-160 160v1080l160 160h480l160 -160v-1080l-160 -160h-140v-100h-200v100h-140zM300 200h100v100h200v-100h100v1000h-400v-1000z"},
    "r": {"horiz-adv-x": 0, "d": "M100 0v1400h640l160 -160v-480l-60 -60l60 -60v-640h-200v600h-400v-600h-200zM300 800h400v400h-400v-400z"},
    "s": {"horiz-adv-x": 0, "d": "M100 300h200v-100h400v400h-440l-160 160v480l160 160h480l160 -160v-140h-200v100h-400v-400h440l160 -160v-480l-160 -160h-480l-160 160v140z"},
    "t": {"horiz-adv-x": 0, "d": "M400 0v1200h-300v200h800v-200h-300v-1200h-200z"},
    "u": {"horiz-adv-x": 0, "d": "M100 1400h200v-1200h400v1200h200v-1240l-160 -160h-480l-160 160v1240z"},
    "v": {"horiz-adv-x": 1100, "d": "M100 1400h200l250 -1000l250 1000h200l-350 -1400h-200z"},
    "w": {"horiz-adv-x": 1600, "d": "M100 1400h200l200 -1000l200 800h200l200 -800l200 1000h200l-300 -1400h-200l-200 800l-200 -800h-200z"},
    "x": {"horiz-adv-x": 1200, "d": "M100 1400h200l300 -525l300 525h200l-400 -700l400 -700h-200l-300 525l-300 -525h-200l400 700z"},
    "y": {"horiz-adv-x": 1200, "d": "M100 1400h200l300 -525l300 525h200l-400 -700v-700h-200v700z"},
    "z": {"horiz-adv-x": 0, "d": "M100 1200v200h800v-200l-540 -1000h540v-200h-800v200l540 1000h-540z"},
    "æ": {"horiz-adv-x": 1100, "d": "M352.5094,1399.4914 L1000,1400 L1000,1200 L652.5094,1199.4914 L652.5094,799.4914 L921.6357,799.4914 L921.6357,599.4914 L652.5094,599.4914 L652.5094,199.4914 L1000,200 L1000,0 L452.5094,-0.5086 L452.5094,399.4914 L302.5094,399.4914 L200,0 L0,0 Z M352.5094,599.4914 L452.5094,599.4914 L452.5094,999.4914 Z"},
    "ø": {"horiz-adv-x": 0, "d": "M767.4875,1452.2247 L740.3511,1399.6586 L740.0097,1400 L259.9171,1399.9999 L100,1239.9122 L100,159.9171 L36.6817,37.2059 L228.514,-61.7823 L260.4291,0 L740.0097,0 L899.9268,159.9171 L899.9268,1238.5468 L959.1491,1353.2366 ZM299.8537,1199.9756 L637.2668,1199.9756 L299.8537,546.8243 ZM699.9024,199.8537 L363.684,199.8537 L699.9024,851.1276 Z"},
    "å": {"horiz-adv-x": 1100, "d": "M1063.8642,0 L850,0 L750,400 L450,400 L350,0 L136.0453,0 L500,1137.2101 L700,1137.2101 ZM600,900 L500,600 L700,600 ZM700,1400 L700,1200 L500,1200 L500,1400 Z"},
    "ö": {"horiz-adv-x": 0, "d": "M259.6066,1398.6997 L459.6066,1398.6997 M740.3934,1398.6997 L540.3934,1398.6997 M459.6066,1398.6997 L459.6066,1198.6997 M540.3934,1398.6997 L540.3934,1198.6997 M459.6066,1198.6997 L259.6066,1198.6997 M540.3934,1198.6997 L740.3934,1198.6997 M259.6066,1198.6997 L259.6066,1398.6997 M740.3934,1198.6997 L740.3934,1398.6997 M260,1100 L100,940 L100,160 L260,0 L740,0 L900,160 L900,940 L740,1100 ZM300,900 L700,900 L700,200 L300,200 Z"},
    "ä": {"horiz-adv-x": 1200, "d": "M1063.8642,0 L850,0 L750,400 L450,400 L350,0 L136.0453,0 L500,1137.2101 L700,1137.2101 ZM600,900 L500,600 L700,600 ZM559.6066,1400 L559.6066,1200 L359.6066,1200 L359.6066,1400 ZM640.3934,1200 L840.3934,1200 L840.3934,1400 L640.3934,1400 Z"},
    " ": {"horiz-adv-x": 801, "d": ""},
  },
  "Teko": {
    " ": {"horiz-adv-x": 145, "d": ""},
    "!": {"horiz-adv-x": 209, "d": "M53 0v123h101v-123h-101zM50 626h109l-17 -422h-75z"},
    "#": {"horiz-adv-x": 496, "d": "M466 396h-66l-30 -166h63v-69h-75l-29 -161h-80l29 161h-113l-29 -161h-81l29 161h-54v69h66l30 166h-62v69h74l29 161h80l-29 -161h114l29 161h80l-29 -161h54v-69zM290 230l30 166h-114l-29 -166h113z"},
    "$": {"horiz-adv-x": 361, "d": "M159 356h73q92 0 92 -88v-180q0 -88 -94 -88h-6v-77h-86v77h-5q-93 0 -93 88v92h91v-78q0 -18 6 -23.5t24 -5.5h42q18 0 23.5 5.5t5.5 23.5v153q0 18 -5.5 23.5t-23.5 5.5h-74q-91 0 -91 89v165q0 88 93 88h7v77h86v-77h5q93 0 93 -88v-92h-91v78q0 18 -6 23.5t-24 5.5h-42q-18 0 -24 -5.5t-6 -23.5v-139q0 -18 6 -23.5t24 -5.5z"},
    "%": {"horiz-adv-x": 641, "d": "M429 626h75l-292 -626h-74zM538 88v162q0 17 -4.5 22t-21.5 5h-21q-17 0 -22 -5t-5 -22v-162q0 -17 5 -22t22 -5h21q17 0 21.5 5t4.5 22zM177 377v161q0 17 -5 22t-21 5h-22q-17 0 -21.5 -5t-4.5 -22v-161q0 -18 4.5 -23t21.5 -5h22q16 0 21 5.5t5 22.5zM612 261v-184q0 -77 -77 -77h-67q-78 0 -78 77v184q0 77 78 77h67q77 0 77 -77zM251 549v-184q0 -77 -78 -77h-66q-78 0 -78 77v184q0 39 18.5 58t59.5 19h66q41 0 59.5 -19t18.5 -58z"},
    "'": {"horiz-adv-x": 161, "d": "M36 626h89v-223h-89v223z"},
    "(": {"horiz-adv-x": 264, "d": "M47 375q0 203 55.5 311t165.5 108h15v-76l-13 -1q-133 -8 -133 -341v-134q0 -333 133 -341l13 -1v-75h-15q-110 0 -165.5 107.5t-55.5 311.5v131z"},
    ")": {"horiz-adv-x": 264, "d": "M215 244q0 -204 -55.5 -311.5t-165.5 -107.5h-15v75l13 1q133 8 133 341v134q0 333 -133 341l-13 1v76h15q110 0 165.5 -108t55.5 -311v-131z"},
    "*": {"horiz-adv-x": 320, "d": "M123 590v36h75v-36q0 -33 -7 -61q24 15 57 25l33 11l24 -72l-35 -10q-25 -9 -60 -13q20 -16 42 -46l21 -29l-61 -44l-21 30q-21 29 -30 53q-16 -33 -31 -55l-21 -28l-62 44l22 29q21 29 42 46q-27 2 -95 24l23 71q68 -22 91 -37q-7 28 -7 62z"},
    "+": {"horiz-adv-x": 408, "d": "M385 350v-74h-136v-151h-90v151h-136v74h136v151h90v-151h136z"},
    ",": {"horiz-adv-x": 165, "d": "M32 123h101v-65l-69 -198h-32v263z"},
    "-": {"horiz-adv-x": 315, "d": "M48 259v70h218v-70h-218z"},
    ".": {"horiz-adv-x": 165, "d": "M32 0v123h101v-123h-101z"},
    "/": {"horiz-adv-x": 390, "d": "M275 700h84l-273 -820h-84z"},
    "0": {"horiz-adv-x": 390, "d": "M252 102v422q0 18 -6 23.5t-24 5.5h-54q-18 0 -23.5 -5.5t-5.5 -23.5v-422q0 -18 5.5 -23.5t23.5 -5.5h54q18 0 24 5.5t6 23.5zM343 538v-450q0 -88 -93 -88h-109q-94 0 -94 88v450q0 88 94 88h109q93 0 93 -88z"},
    "1": {"horiz-adv-x": 235, "d": "M183 626v-626h-91v553h-72v73h163z"},
    "2": {"horiz-adv-x": 328, "d": "M115 524v-102h-90v116q0 88 93 88h86q94 0 94 -88v-63q0 -70 -35 -137l-135 -265h174v-73h-276v70l153 288q28 53 28 120v46q0 18 -5.5 23.5t-24.5 5.5h-32q-18 0 -24 -5.5t-6 -23.5z"},
    "3": {"horiz-adv-x": 355, "d": "M119 524v-94h-90v108q0 88 93 88h92q94 0 94 -88v-158q0 -53 -40 -62q40 -9 40 -58v-172q0 -88 -94 -88h-92q-93 0 -93 88v107h90v-93q0 -18 6 -23.5t24 -5.5h39q18 0 24 5.5t6 23.5v150q0 18 -6 23.5t-24 5.5h-75v72h75q18 0 24 5.5t6 23.5v142q0 18 -6 23.5t-24 5.5h-39q-18 0 -24 -5.5t-6 -23.5z"},
    "4": {"horiz-adv-x": 363, "d": "M363 198v-74h-56v-124h-87v124h-214v75l180 427h90l-184 -428h128v120h87v-120h56z"},
    "5": {"horiz-adv-x": 358, "d": "M132 391h97q94 0 94 -88v-215q0 -88 -94 -88h-96q-93 0 -93 88v111h91v-97q0 -18 6 -23.5t24 -5.5h41q18 0 24 5.5t6 23.5v187q0 18 -6 24t-24 6h-160v307h279v-73h-189v-162z"},
    "6": {"horiz-adv-x": 382, "d": "M137 360h110q93 0 93 -89v-183q0 -88 -93 -88h-106q-94 0 -94 88v450q0 88 94 88h103q93 0 93 -88v-108h-89v94q0 18 -6 23.5t-24 5.5h-51q-18 0 -24 -5.5t-6 -23.5v-164zM250 102v157q0 17 -6 23t-24 6h-83v-186q0 -18 6 -23.5t24 -5.5h53q18 0 24 5.5t6 23.5z"},
    "7": {"horiz-adv-x": 291, "d": "M286 626v-56l-168 -570h-92l163 551h-183v75h280z"},
    "8": {"horiz-adv-x": 389, "d": "M342 538v-161q0 -53 -39 -62q39 -11 39 -59v-168q0 -88 -93 -88h-109q-93 0 -93 88v168q0 48 39 59q-39 9 -39 62v161q0 88 93 88h109q93 0 93 -88zM253 102v150q0 17 -5.5 23t-23.5 6h-59q-18 0 -23.5 -6t-5.5 -23v-150q0 -18 5.5 -24t23.5 -6h59q18 0 23.5 6t5.5 24zM253 379v146q0 17 -5.5 23t-23.5 6h-59q-18 0 -23.5 -6t-5.5 -23v-146q0 -17 5.5 -23t23.5 -6h59q18 0 23.5 6t5.5 23z"},
    "9": {"horiz-adv-x": 378, "d": "M131 626h106q94 0 94 -88v-450q0 -88 -94 -88h-103q-94 0 -94 88v107h90v-93q0 -18 5.5 -23.5t24.5 -5.5h51q18 0 23.5 5.5t5.5 23.5v154h-109q-93 0 -93 89v193q0 88 93 88zM158 327h82v197q0 18 -5.5 23.5t-23.5 5.5h-53q-18 0 -24 -5.5t-6 -23.5v-168q0 -17 6 -23t24 -6z"},
    ":": {"horiz-adv-x": 165, "d": "M32 295v123h101v-123h-101zM32 70v123h101v-123h-101z"},
    ";": {"horiz-adv-x": 165, "d": "M32 365v123h101v-123h-101zM32 123h101v-65l-69 -198h-32v263z"},
    "=": {"horiz-adv-x": 420, "d": "M29 185v76h362v-76h-362zM29 365v76h362v-76h-362z"},
    "?": {"horiz-adv-x": 342, "d": "M113 626h96q93 0 93 -87v-182q0 -87 -93 -87h-13l-4 -66h-76l-8 131h75q17 0 22.5 6.5t5.5 23.5v161q0 17 -5.5 23.5t-22.5 6.5h-44q-17 0 -22.5 -6.5t-5.5 -23.5v-72h-91v85q0 87 93 87zM103 0v123h101v-123h-101z"},
    "@": {"horiz-adv-x": 696, "d": "M318 332v-154q0 -17 5.5 -23t23.5 -6h29q32 0 32 35v142q0 19 -7.5 26.5t-24.5 7.5h-29q-18 0 -23.5 -5.5t-5.5 -22.5zM233 343q0 86 88 86h27q48 0 61 -39v39h82v-280h44q19 0 24.5 5.5t5.5 23.5v295q0 18 -5.5 24t-24.5 6h-344q-18 0 -23.5 -6t-5.5 -24v-442q0 -17 5.5 -23t23.5 -6h301v-72h-326q-90 0 -90 88v469q0 88 90 88h394q90 0 90 -88v-318q0 -88 -91 -88h-145v51q-7 -51 -66 -51h-27q-88 0 -88 86v176z"},
    "A": {"horiz-adv-x": 385, "d": "M282 0l-25 145h-132l-23 -145h-90l111 626h131l119 -626h-91zM136 218h109l-57 330z"},
    "B": {"horiz-adv-x": 409, "d": "M272 383v143q0 18 -6 23.5t-24 5.5h-100v-201h100q18 0 24 5.5t6 23.5zM272 100v154q0 18 -6 23.5t-24 5.5h-100v-212h100q18 0 24 5.5t6 23.5zM52 626h217q94 0 94 -88v-159q0 -53 -40 -62q40 -10 40 -58v-171q0 -88 -94 -88h-217v626z"},
    "C": {"horiz-adv-x": 377, "d": "M340 430h-92v96q0 18 -5.5 23.5t-23.5 5.5h-51q-18 0 -24 -5.5t-6 -23.5v-427q0 -18 6 -23.5t24 -5.5h51q18 0 23.5 5.5t5.5 23.5v95h92v-106q0 -89 -94 -89h-106q-93 0 -93 89v450q0 88 93 88h106q94 0 94 -88v-108z"},
    "D": {"horiz-adv-x": 412, "d": "M54 626h218q93 0 93 -88v-450q0 -88 -93 -88h-218v626zM274 100v426q0 18 -6 23.5t-24 5.5h-99v-484h99q18 0 24 5.5t6 23.5z"},
    "E": {"horiz-adv-x": 343, "d": "M143 73h181v-73h-272v626h265v-73h-174v-193h144v-73h-144v-214z"},
    "F": {"horiz-adv-x": 332, "d": "M325 553h-182v-206h144v-71h-144v-276h-91v626h273v-73z"},
    "G": {"horiz-adv-x": 382, "d": "M340 443h-91v83q0 18 -6 23.5t-24 5.5h-51q-18 0 -24 -5.5t-6 -23.5v-427q0 -18 6 -23.5t24 -5.5h51q18 0 24 5.5t6 23.5v153h-50v70h141v-234q0 -89 -93 -89h-107q-93 0 -93 89v450q0 88 93 88h107q93 0 93 -88v-95z"},
    "H": {"horiz-adv-x": 417, "d": "M275 626h90v-626h-90v275h-133v-275h-90v626h90v-278h133v278z"},
    "I": {"horiz-adv-x": 210, "d": "M60 626h90v-626h-90v626z"},
    "J": {"horiz-adv-x": 334, "d": "M14 206h91v-104q0 -18 6 -23.5t24 -5.5h29q18 0 24 5.5t6 23.5v524h91v-538q0 -88 -93 -88h-85q-93 0 -93 88v118z"},
    "K": {"horiz-adv-x": 384, "d": "M374 626l-132 -314l131 -312h-98l-127 312l129 314h97zM52 0v626h90v-626h-90z"},
    "L": {"horiz-adv-x": 301, "d": "M142 73h155v-73h-245v626h90v-553z"},
    "M": {"horiz-adv-x": 516, "d": "M131 0h-79v626h99l107 -388l107 388h99v-626h-79v458l-86 -322h-82l-86 321v-457z"},
    "N": {"horiz-adv-x": 410, "d": "M275 626h83v-626h-91l-132 452v-452h-83v626h95l128 -439v439z"},
    "O": {"horiz-adv-x": 393, "d": "M141 626h111q93 0 93 -88v-450q0 -88 -93 -88h-111q-94 0 -94 88v450q0 88 94 88zM255 102v422q0 18 -6 23.5t-24 5.5h-58q-18 0 -23.5 -5.5t-5.5 -23.5v-422q0 -18 5.5 -23.5t23.5 -5.5h58q18 0 24 5.5t6 23.5z"},
    "P": {"horiz-adv-x": 378, "d": "M52 626h205q93 0 93 -88v-208q0 -88 -93 -88h-115v-242h-90v626zM260 344v180q0 18 -6 23.5t-24 5.5h-88v-239h88q18 0 24 6t6 24z"},
    "Q": {"horiz-adv-x": 393, "d": "M141 0q-94 0 -94 88v450q0 88 94 88h111q93 0 93 -88v-450q0 -68 -56 -84l71 -95h-96l-66 91h-57zM138 524v-422q0 -18 5.5 -23.5t23.5 -5.5h58q18 0 24 5.5t6 23.5v422q0 18 -6 23.5t-24 5.5h-58q-18 0 -23.5 -5.5t-5.5 -23.5z"},
    "R": {"horiz-adv-x": 396, "d": "M142 253v-253h-90v626h205q93 0 93 -88v-196q0 -76 -67 -87l99 -255h-97l-94 253h-49zM142 553v-228h88q18 0 24 5.5t6 23.5v170q0 18 -6 23.5t-24 5.5h-88z"},
    "S": {"horiz-adv-x": 361, "d": "M232 102v153q0 18 -5.5 23.5t-23.5 5.5h-74q-91 0 -91 89v165q0 88 93 88h98q93 0 93 -88v-92h-91v78q0 18 -6 23.5t-24 5.5h-42q-18 0 -24 -5.5t-6 -23.5v-139q0 -18 6 -23.5t24 -5.5h73q92 0 92 -88v-180q0 -88 -94 -88h-97q-93 0 -93 88v92h91v-78q0 -18 6 -23.5t24 -5.5h42q18 0 23.5 5.5t5.5 23.5z"},
    "T": {"horiz-adv-x": 310, "d": "M305 626v-73h-105v-553h-90v553h-105v73h300z"},
    "U": {"horiz-adv-x": 397, "d": "M257 626h91v-538q0 -88 -94 -88h-111q-94 0 -94 88v538h91v-524q0 -18 6 -23.5t24 -5.5h57q19 0 24.5 5.5t5.5 23.5v524z"},
    "V": {"horiz-adv-x": 364, "d": "M266 626h93l-113 -626h-128l-113 626h93l83 -543z"},
    "W": {"horiz-adv-x": 609, "d": "M508 626h91l-100 -626h-125l-70 470l-69 -470h-125l-100 626h93l70 -544l81 544h100l81 -544z"},
    "X": {"horiz-adv-x": 373, "d": "M235 320l134 -320h-100l-84 238l-84 -238h-97l132 320l-123 306h100l72 -225l73 225h98z"},
    "Y": {"horiz-adv-x": 361, "d": "M229 0h-91v198l-134 428h92l87 -345l82 345h92l-128 -428v-198z"},
    "Z": {"horiz-adv-x": 313, "d": "M305 627v-73l-205 -481h200v-73h-292v73l205 481h-194v73h286z"},
    "[": {"horiz-adv-x": 311, "d": "M249 710h-100v-802h100v-73h-191v948h191v-73z"},
    "\\": {"horiz-adv-x": 390, "d": "M31 700h84l273 -820h-84z"},
    "]": {"horiz-adv-x": 311, "d": "M234 783v-948h-190v73h99v802h-99v73h190z"},
    "^": {"horiz-adv-x": 498, "d": "M187 671h114l133 -354h-94l-96 270l-95 -270h-94z"},
    "_": {"horiz-adv-x": 474, "d": "M0 -114v71h474v-71h-474z"},
    "`": {"horiz-adv-x": 421, "d": "M216 651l82 -132h-77l-105 132h100z"},
    "a": {"horiz-adv-x": 360, "d": "M226 488h90v-488h-90v39q-13 -39 -62 -39h-36q-90 0 -90 88v311q0 89 90 89h36q49 0 62 -39v39zM158 73h35q18 0 25.5 8t7.5 27v272q0 19 -7.5 27t-25.5 8h-35q-18 0 -24 -5.5t-6 -23.5v-284q0 -18 6 -23.5t24 -5.5z"},
    "b": {"horiz-adv-x": 360, "d": "M196 489h35q91 0 91 -89v-312q0 -88 -91 -88h-35q-49 0 -62 39v-39h-90v669h90v-219q13 39 62 39zM232 102v285q0 17 -6 23t-24 6h-35q-18 0 -25.5 -8t-7.5 -27v-273q0 -19 7.5 -27t25.5 -8h35q18 0 24 5.5t6 23.5z"},
    "c": {"horiz-adv-x": 351, "d": "M320 334h-89v52q0 18 -6 23.5t-24 5.5h-43q-18 0 -24 -5.5t-6 -23.5v-284q0 -18 6 -23.5t24 -5.5h43q18 0 24 5.5t6 23.5v52h89v-66q0 -88 -94 -88h-95q-93 0 -93 88v311q0 89 93 89h95q94 0 94 -89v-65z"},
    "d": {"horiz-adv-x": 360, "d": "M226 669h90v-669h-90v39q-13 -39 -62 -39h-36q-90 0 -90 88v312q0 89 90 89h36q49 0 62 -39v219zM158 73h35q18 0 25.5 8t7.5 27v273q0 19 -7.5 27t-25.5 8h-35q-18 0 -24 -6t-6 -23v-285q0 -18 6 -23.5t24 -5.5z"},
    "e": {"horiz-adv-x": 360, "d": "M135 488h98q94 0 94 -89v-183h-197v-116q0 -17 6 -23t24 -6h46q18 0 24 6t6 24v40h88v-53q0 -88 -93 -88h-96q-93 0 -93 88v311q0 89 93 89zM130 282h108v106q0 17 -5.5 23t-23.5 6h-49q-18 0 -24 -6t-6 -23v-106z"},
    "f": {"horiz-adv-x": 222, "d": "M217 593h-42q-18 0 -24 -5.5t-6 -23.5v-76h72v-73h-72v-415h-90v415h-49v73h49v93q0 88 93 88h69v-76z"},
    "g": {"horiz-adv-x": 360, "d": "M226 488h90v-538q0 -88 -94 -88h-167v71h141q18 0 24 6t6 23v83q-13 -39 -62 -39h-36q-90 0 -90 89v304q0 89 90 89h36q49 0 62 -39v39zM158 79h35q18 0 25.5 8t7.5 27v266q0 19 -7.5 27t-25.5 8h-35q-18 0 -24 -5.5t-6 -23.5v-278q0 -17 6 -23t24 -6z"},
    "h": {"horiz-adv-x": 365, "d": "M196 488h35q91 0 91 -89v-399h-90v386q0 18 -6 23.5t-24 5.5h-35q-18 0 -25.5 -8t-7.5 -27v-380h-90v669h90v-220q13 39 62 39z"},
    "i": {"horiz-adv-x": 178, "d": "M42 581v89h94v-89h-94zM134 0h-90v488h90v-488z"},
    "j": {"horiz-adv-x": 178, "d": "M42 581v89h94v-89h-94zM44 -38v526h90v-538q0 -88 -93 -88h-45v71h18q18 0 24 6t6 23z"},
    "k": {"horiz-adv-x": 357, "d": "M354 488l-112 -233l112 -255h-96l-108 255l108 233h96zM44 0v669h90v-669h-90z"},
    "l": {"horiz-adv-x": 178, "d": "M134 0h-90v669h90v-669z"},
    "m": {"horiz-adv-x": 548, "d": "M384 488h35q90 0 90 -89v-399h-90v386q0 18 -5.5 23.5t-23.5 5.5h-36q-32 0 -32 -35v-380h-90v386q0 18 -6 23.5t-24 5.5h-35q-18 0 -25.5 -8t-7.5 -27v-380h-90v488h90v-39q13 39 62 39h35q64 0 83 -45q12 45 70 45z"},
    "n": {"horiz-adv-x": 365, "d": "M196 488h35q91 0 91 -89v-399h-90v386q0 18 -6 23.5t-24 5.5h-35q-18 0 -25.5 -8t-7.5 -27v-380h-90v488h90v-39q13 39 62 39z"},
    "o": {"horiz-adv-x": 370, "d": "M131 488h107q93 0 93 -89v-311q0 -88 -93 -88h-107q-92 0 -92 88v311q0 89 92 89zM242 101v286q0 18 -6 24t-24 6h-55q-18 0 -23.5 -6t-5.5 -24v-286q0 -18 5.5 -24t23.5 -6h55q18 0 24 6t6 24z"},
    "p": {"horiz-adv-x": 360, "d": "M196 488h35q91 0 91 -89v-311q0 -88 -91 -88h-35q-49 0 -62 39v-177h-90v626h90v-39q13 39 62 39zM232 102v284q0 18 -6 23.5t-24 5.5h-35q-18 0 -25.5 -8t-7.5 -27v-272q0 -19 7.5 -27t25.5 -8h35q18 0 24 5.5t6 23.5z"},
    "q": {"horiz-adv-x": 360, "d": "M226 488h90v-626h-90v177q-13 -39 -62 -39h-36q-90 0 -90 88v311q0 89 90 89h36q49 0 62 -39v39zM158 73h35q18 0 25.5 8t7.5 27v272q0 19 -7.5 27t-25.5 8h-35q-18 0 -24 -5.5t-6 -23.5v-284q0 -18 6 -23.5t24 -5.5z"},
    "r": {"horiz-adv-x": 238, "d": "M213 489h20v-78h-36q-63 0 -63 -74v-337h-90v488h90v-60q8 26 28.5 43.5t50.5 17.5z"},
    "s": {"horiz-adv-x": 328, "d": "M207 98v81q0 18 -6 23.5t-24 5.5h-51q-93 0 -93 88v103q0 89 93 89h73q94 0 94 -89v-47h-88v38q0 18 -6 23.5t-24 5.5h-24q-18 0 -24 -5.5t-6 -23.5v-84q0 -18 6 -23.5t24 -5.5h52q92 0 92 -89v-100q0 -88 -93 -88h-74q-93 0 -93 88v48h88v-38q0 -18 6 -23.5t24 -5.5h24q18 0 24 5.5t6 23.5z"},
    "t": {"horiz-adv-x": 219, "d": "M209 415h-67v-309q0 -18 5.5 -23.5t23.5 -5.5h38v-77h-64q-94 0 -94 88v327h-46v73h46v83h91v-83h67v-73z"},
    "u": {"horiz-adv-x": 365, "d": "M231 488h90v-488h-90v39q-13 -39 -62 -39h-36q-90 0 -90 88v400h90v-386q0 -18 6 -23.5t24 -5.5h35q18 0 25.5 8t7.5 27v380z"},
    "v": {"horiz-adv-x": 317, "d": "M94 488l64 -412l65 412h90l-90 -488h-129l-90 488h90z"},
    "w": {"horiz-adv-x": 543, "d": "M453 488h85l-90 -488h-119l-58 369l-58 -369h-119l-89 488h85l65 -411l63 411h107l61 -411z"},
    "x": {"horiz-adv-x": 342, "d": "M216 250l122 -250h-95l-73 169l-71 -169h-94l120 249l-113 239h96l63 -160l62 160h94z"},
    "y": {"horiz-adv-x": 342, "d": "M116 -138h-60v72h41q43 0 52 33l10 41h-49l-102 480h92l74 -409l69 409h91l-103 -535q-22 -91 -115 -91z"},
    "z": {"horiz-adv-x": 292, "d": "M278 72v-72h-264v72l169 344h-158v72h251v-72l-170 -344h172z"},
    "{": {"horiz-adv-x": 283, "d": "M198 682v-251q0 -110 -76 -121q76 -9 76 -118v-254q0 -17 7 -24t25 -7h45v-71h-82q-47 0 -66.5 23t-19.5 67v241q0 56 -20 82t-63 26h-17v70h17q43 0 63 26.5t20 83.5v238q0 90 86 90h82v-71h-45q-18 0 -25 -6.5t-7 -23.5z"},
    "|": {"horiz-adv-x": 197, "d": "M54 743h87v-861h-87v861z"},
    "}": {"horiz-adv-x": 283, "d": "M84 431v251q0 17 -7 23.5t-25 6.5h-45v71h82q47 0 66 -23.5t19 -66.5v-238q0 -57 20 -83.5t64 -26.5h16v-70h-16q-44 0 -64 -26t-20 -82v-241q0 -44 -19 -67t-66 -23h-82v71h45q18 0 25 7t7 24v254q0 109 76 118q-76 11 -76 121z"},
    "~": {"horiz-adv-x": 524, "d": "M344 213q-30 0 -55 12.5t-39 28.5q-37 40 -76 40q-18 0 -24 -8t-6 -25v-47h-83v66q0 81 84 81h37q28 0 52 -12.5t38 -28.5q38 -40 81 -40q17 0 22 7.5t5 26.5v46h83v-65q0 -82 -85 -82h-34z"}
  },
  "Handwriting": {
    " ": {"horiz-adv-x": 415, "d": ""},
    "A": {"horiz-adv-x": 619, "d": "M473.5 102.5q-5.5 10.5 -8.5 13.5q-9 4 -32.5 11.5t-50.5 17t-51 17.5t-34 11q-2 1 -10 5.5t-18 10t-18 9.5t-11 4q-15 0 -28.5 -19t-27.5 -46.5t-29 -58.5t-34 -56.5t-41 -39.5t-50 -6v28q6 7 18 22.5t27.5 35t32.5 40.5t32 41t26.5 35.5t17.5 23.5q10 13 3.5 38t-20 53t-29 56.5t-22 49t1 29.5t40.5 -2q10 -34 30.5 -70t51.5 -56q26 17 49 45.5t43 65t36.5 77.5t30 81t23.5 76t16 62q7 11 18.5 17.5t23.5 10.5q5 -7 7 -35.5t2 -69t-1.5 -90.5t-2 -100.5t0.5 -98.5t4.5 -85t11 -60t20.5 -23h85v-50h-71q-14 0 -11 -18.5t15 -46.5t27.5 -62.5t26.5 -66.5t12.5 -57.5t-14.5 -36.5q-3 -2 -14 -2t-15 2q-3 15 -15 51l-25.5 76.5t-26 76t-16.5 49.5q-1 4 -6.5 14.5zM357.5 206.5q13.5 -5.5 29 -12.5t30.5 -12.5t21 -8.5q2 -1 6.5 -1t6.5 1q4 33 0.5 83.5t-9 103t-11 101t-7.5 76.5l-155 -280q3 -3 13.5 -9t21 -12.5t21 -12.5t14.5 -8q5 -3 18.5 -8.5z"},
    "B": {"horiz-adv-x": 696, "d": "M202 -37.5q0 10.5 1 13.5q1 1 5 2.5t8.5 4.5t9 4.5t5.5 2.5q36 10 71.5 21.5t69.5 25.5t65.5 33.5t60.5 44.5q70 64 100 109.5t32 77.5t-19.5 51t-54.5 28.5t-72 10t-73 -4t-57 -13.5t-24 -19l-28 -281q0 -7 -7.5 -11t-15 -4t-13.5 4t-6 11v226h-57v6.5v6.5q3 5 11 15t16.5 21t17 21t12.5 13q1 10 3 36.5t4 55.5t4 55t3 36q1 22 -5 31.5t-16.5 10t-23.5 -6t-26 -15.5t-24.5 -18.5t-17.5 -14.5q-6 -8 -22.5 -23.5t-34.5 -33.5l-34 -34t-21 -23h-43q-7 24 9.5 49t50 52t79 53.5t97 50.5t102.5 44t96 34.5t79.5 22t49.5 4.5q14 -3 18 -16t2 -28.5t-8.5 -31t-11.5 -23.5q-25 -35 -46.5 -64t-43.5 -54.5t-47.5 -51t-58.5 -55.5q28 -5 53 -1.5t49.5 7t51.5 4t56 -9.5q18 -6 31.5 -12t24 -15t17 -22.5t12.5 -33.5q10 -49 -8.5 -95t-56.5 -87.5t-88 -77.5t-102 -65.5t-100 -50t-82 -33.5q-9 -3 -17 2t-11 12q-1 5 -1 15.5zM347 455.5q11 10.5 25 24.5t29.5 29t29 29.5t24 25.5t16.5 17q8 8 19.5 23.5t23 31.5t19.5 28t8 15v42q-24 4 -57 -4.5t-65.5 -21t-60.5 -25.5t-42 -20l14 -27v-184q6 6 17 16.5z"},
    "C": {"horiz-adv-x": 514, "d": "M58.5 -6.5q-20.5 33.5 -29.5 78.5t-6.5 97.5t14.5 105.5t32 100.5t47.5 83t62 53.5t74.5 12q2 -8 6 -28l8.5 -42.5t8 -42.5t5.5 -28q2 -9 -5.5 -19.5t-17.5 -17t-19.5 -6t-13.5 14.5q-3 8 -4 23t-4 32.5t-7 32t-11 21.5t-18 2.5t-26 -27.5q-6 -6 -12.5 -17t-13.5 -22t-11.5 -20t-4.5 -11l-43 -225q-7 -37 1 -66.5t26 -50.5t44 -32.5t54.5 -13t58.5 7t56 29.5q10 7 25.5 27.5t33 45.5t37 53t36.5 50.5t30 36.5t19 12q13 -36 -0.5 -75.5t-43.5 -77.5t-73 -70.5t-89 -53t-91 -27.5t-81 8q-34 13 -54.5 46.5z"},
    "D": {"horiz-adv-x": 569, "d": "M226.5 19q2.5 20 4.5 46.5t4 55t3 46.5q0 11 0.5 30.5t0.5 43.5v50v49t-0.5 41t-0.5 26q0 3 -2.5 11t-4 17t-4.5 16.5t-5 11.5q-28 1 -57 -4t-57.5 -12.5t-56.5 -12.5t-53 0q-6 13 13 27.5t55.5 25.5t85 18t100 6t102 -11t90 -32t64 -58t24.5 -89q0 -19 -6.5 -39.5t-16.5 -41.5t-23 -40.5t-24 -32.5q-6 -6 -19 -19.5t-29.5 -30.5t-35 -35t-35 -34.5t-30 -29.5t-20.5 -20q-2 -20 -6 -36t-12.5 -24.5t-21 -8t-31.5 12.5q-17 -12 -36.5 -34t-41 -43t-44.5 -33t-45 -2v28l167 140q2 1 4.5 21zM383.5 117q39.5 41 62.5 89.5t28 98.5t-12 88t-58 58.5t-111 11.5v-408q51 21 90.5 62z"},
    "E": {"horiz-adv-x": 386, "d": "M29 2.5q-10 32.5 -15 71.5q1 11 3.5 35t6 54.5t6 64.5t5.5 64.5t4.5 55t2.5 35.5q1 7 1 23v67q0 16 -1 23l15 14l253 84h28q4 -11 1 -24t-16 -17l-210 -86l-14 -13q-1 -1 -2.5 -17.5t-4 -39t-5 -45.5t-2.5 -39q0 -3 -0.5 -13.5t-0.5 -21.5t0.5 -21t0.5 -14l238 126q6 4 9 -1t3 -13t-3 -16.5t-9 -11.5q-13 -9 -33 -20.5t-41.5 -24t-43 -24.5t-39 -21.5t-28 -16t-11.5 -6.5h-57v-182q0 -37 17 -47.5t42.5 -4.5t55 24t56 38t45.5 37.5t24 22.5q2 20 9 33q4 12 12 16.5t21 -7.5q4 -25 -8.5 -54.5t-36 -57t-55 -50.5t-64.5 -36.5t-64 -14.5t-54 16q-31 23 -41 55.5z"},
    "F": {"horiz-adv-x": 548, "d": "M272.5 -39q-0.5 13 -0.5 31.5t0.5 37.5t1.5 30q0 2 2.5 18.5t5.5 39t4.5 46t0.5 37.5q-1 1 -6.5 1t-6.5 -1q-7 -3 -23 -11l-34 -17l-34 -17t-22 -12q-20 10 -16.5 21t19 23t40.5 25t48.5 26.5t41.5 29t22 31.5l57 266q2 11 -2 17.5t-11 10t-15.5 3.5t-14.5 -3q-10 -4 -28.5 -12.5t-36.5 -17.5t-32 -16.5t-16 -10.5l-182 -195q-7 -9 -12 -6t-7 11.5t-1 19t6 16.5q5 8 16 22t25 32t29 38.5t28.5 38t25 32t16.5 20.5q33 3 61.5 18.5t57 30.5t58 23t63.5 -3q18 -18 22.5 -45t0 -58t-14 -64t-19 -64t-16 -58.5t-1.5 -45.5q19 -7 37.5 1t37.5 18.5t38.5 19t40.5 3.5q3 -12 -3.5 -24t-10.5 -18q-8 -3 -28.5 -10.5t-43 -17t-42 -17.5t-26.5 -12q-3 -2 -7 -5.5t-9 -8t-8.5 -8.5t-4.5 -7q-2 -10 -6 -36t-9 -54.5t-8.5 -54.5t-4.5 -37q-2 -10 0.5 -25t2 -30t-7 -27t-24.5 -17l-13 14q-1 1 -1.5 14z"},
    "G": {"horiz-adv-x": 485, "d": "M46.5 27.5q-12.5 32.5 -17.5 70t-4 72.5t3 59q1 9 4.5 32.5t8 51t9 51.5t7.5 33q20 87 46 140.5t52.5 81.5t52 33.5t46.5 -2.5t35 -27t18 -40.5t-5 -42t-35 -30.5l-10 -2.5t-12 -1.5t-9.5 1.5t-3.5 2.5v84q0 3 -8.5 3t-12.5 -3q-27 -15 -49 -50t-38.5 -76t-27 -79.5t-11.5 -61.5q-1 -9 -2 -27.5t-1.5 -42.5t-0.5 -50t0.5 -49.5t1.5 -42.5t2 -28q0 -13 7 -28.5t17.5 -28.5t22.5 -24t23 -16q27 -13 59.5 -6t63.5 29t59 53.5t49 65.5t31 67t5 58q-30 4 -60 -1.5t-59.5 -12.5t-59.5 -12.5t-61 -1.5q-1 5 -1.5 11.5t1 12.5t5 11t10.5 7q29 0 64.5 11t72 23.5t70.5 20.5t60 1q4 -45 -9 -99.5t-38.5 -105.5t-62.5 -93.5t-80.5 -66.5t-92 -23.5t-96.5 37.5q-26 19 -38.5 51.5z"},
    "H": {"horiz-adv-x": 626, "d": "M352.5 328q-5.5 0 -8.5 -1q-28 -10 -45.5 -17.5t-29.5 -13.5t-21.5 -10.5t-22 -9t-31 -9t-46.5 -10.5v-281q0 -15 -7 -16t-14.5 6t-14.5 18t-7 20q-1 19 -2.5 45t-2.5 54t-3 55.5t-3 49.5t-1 35l-1 14l-71 28q-1 0 -1 5t1 10q4 8 13.5 13t20 8t20.5 4t17 2q0 12 1.5 42t4 63.5t4.5 64t3 40.5q0 3 4.5 13.5t10.5 22.5t13.5 22.5t13.5 14.5t10 -2.5t4 -26.5q0 -5 -1.5 -21.5t-5 -35.5t-5 -35.5t-1.5 -21.5q-1 -9 -1.5 -30.5t-0.5 -46t0.5 -46.5t1.5 -31q19 -4 52.5 -1t67.5 13t63 25t42 33q15 23 23 52t14.5 59.5t16.5 60.5t29 54q24 28 47 38.5t42 8t33.5 -16.5t19 -34.5t-1.5 -45t-27 -49.5l-18 -18t-27 -28t-31.5 -32.5t-31.5 -32t-28 -27.5t-18 -17q-5 -49 -3.5 -101.5t8 -105.5t16.5 -103.5t20 -97.5h-55l-43 380q0 1 -5.5 1zM450.5 504.5q-4.5 -13.5 -9 -29.5t-8 -30t-5.5 -20q25 12 45.5 34t36 46t25.5 48t13 40t-2 21.5t-19 -5.5q-21 -18 -41.5 -38t-29.5 -47q-1 -6 -5.5 -19.5z"},
    "I": {"horiz-adv-x": 653, "d": "M7 -129q3 7 8 12.5t11 10t9 6.5l211 84l14 14q-1 14 -1.5 42.5t-0.5 64.5v152q0 36 0.5 64.5t1.5 42.5q0 4 2 16t4 26t4 26t4 16h-182q-11 0 -13.5 6t-1.5 13t5.5 14t9.5 10q98 -8 195 14q17 40 47.5 60.5t66.5 28t75.5 3t74 -16t60.5 -28t37 -32.5t3 -30.5t-43 -22t-98.5 -6t-165.5 15.5q-20 -30 -31 -66.5t-14.5 -78t-1.5 -85t7.5 -85t12.5 -80.5t13 -70q25 -5 49.5 -1.5t49.5 12t49 18.5t49 18t49 12t50 -3q3 -9 1 -23t-16 -18q-65 -13 -142 -29.5t-155.5 -39t-153.5 -51t-139 -64.5l-15 15q-2 6 1 13zM489 498q54 -4 79 -0.5t26 13t-15 19t-44.5 17t-62 9t-67.5 -6.5t-61 -30q91 -17 145 -21z"},
    "J": {"horiz-adv-x": 513, "d": "M122 -133.5q-3 39.5 10.5 88.5t38 102t51.5 99.5t51.5 81.5t37.5 47v15v14q-2 10 -5.5 34t-8 51t-9 50.5t-6.5 33.5q-4 8 -11.5 12.5t-16.5 0.5l-225 -83q-9 -4 -16.5 1t-11 13t-0.5 16t13 12l465 154h42q6 -16 3.5 -24t-9.5 -11t-16.5 -4t-19.5 -3q-8 -3 -28 -8.5t-43 -12.5t-42.5 -13t-27.5 -8q-4 -46 3 -93t26 -90l140 71q11 6 22 1.5t16.5 -12.5t3.5 -17.5t-14 -13.5q-19 -7 -44.5 -15t-50.5 -18.5t-45.5 -26t-27.5 -39.5q-3 -8 -5.5 -38t-6 -71.5t-10 -91t-16 -97t-24 -89t-36 -67t-49.5 -30t-65 19.5q-30 19 -33 58.5zM208 -165q14 7 28 30.5t27 59t23 69.5t17 61t8 35v26v86v28q-35 -36 -61.5 -81.5t-43 -95.5t-23.5 -102t0 -100q11 -23 25 -16z"},
    "K": {"horiz-adv-x": 542, "d": "M455.5 2.5q-3.5 32.5 -9.5 67t-15.5 69.5t-25 64.5t-39 51t-56.5 30.5q-7 1 -16.5 2t-18.5 1t-15.5 -1t-6.5 -2l-28 -253q-1 -7 -4.5 -14t-9 -12.5t-13 -7t-16.5 5.5v289l-125 -79q-10 -5 -24.5 -0.5t-18.5 15.5q11 15 38 32.5t55.5 36.5t51 37t23.5 34l29 295q1 7 6 11t12.5 5t14 0.5t9.5 -1.5v-268l42 28l169 211h27q6 -18 -4.5 -42.5t-26 -47.5t-31.5 -41t-20 -23q-7 -6 -19 -17.5t-27 -25.5t-32 -29t-32 -28.5t-27.5 -25t-18.5 -15.5q37 -10 72 -23.5t68 -31.5q21 -13 37 -39t28 -60t20 -72t12.5 -73.5t5 -65t-2.5 -46.5t-11 -18t-18 21q-5 23 -8.5 55.5z"},
    "L": {"horiz-adv-x": 527, "d": "M17 529q3 2 7.5 4.5t9.5 3.5t8 0t8 -4.5t9.5 -7.5t7.5 -8.5t3 -6.5v-450q10 13 33 17.5t55 6t69.5 2t76.5 4t76.5 13t68.5 28.5q31 17 41.5 17.5t7.5 -10t-19 -27.5t-40 -34.5t-54 -30t-62 -14.5h-24t-37.5 -0.5t-44 0t-43.5 0.5h-37h-24q-10 -7 -20 -24.5t-22 -33.5t-25.5 -26t-31.5 -1v577q0 3 3 5z"},
    "M": {"horiz-adv-x": 808, "d": "M607 -19q-19 23 -32 50.5t-21 58t-13 54.5q-3 13 -6.5 40.5t-8 62.5t-8.5 73t-9 72l-7 63q-3 27 -4 41l-97 -394l-5 -9q-4 -7 -9.5 -16t-13 -17t-15 -11.5t-15 -1.5t-13.5 13l-211 422l-56 -422q-2 -10 -9 -13.5t-14.5 0t-13.5 10.5t-5 17l71 520q0 4 5.5 9t12.5 8t14 3.5t9 -5.5l222 -492l129 492q1 2 9 12.5t18 19.5t18.5 13t11.5 -4l13 -56q3 -55 5 -128t9 -150t23.5 -151t48.5 -133q3 -4 8 -11t12 -13t13.5 -11.5t8.5 -6.5q8 -4 21.5 -1t28.5 4.5t28 -2t20 -15.5q7 -14 1.5 -21.5t-17.5 -11.5t-28.5 -4.5t-32.5 0.5t-29.5 3.5t-20.5 4.5q-27 11 -46 34z"},
    "N": {"horiz-adv-x": 485, "d": "M13.5 193.5q-3.5 123.5 0.5 245.5q1 5 6.5 15.5t13 20t17 13t19.5 -5.5l71 -71l197 -324l4 -5q5 -6 11.5 -12t13.5 -9.5t13 -0.5q-1 14 -3.5 41.5t-5.5 61.5t-6 72.5t-6 73t-5 62.5t-2 40q-1 11 -1 36t2.5 55.5t8.5 63t18 57t28.5 37t40.5 4.5q4 0 9.5 -5.5t5.5 -8.5q-7 -7 -15 -17t-15.5 -21.5l-15 -23t-9.5 -22.5q-1 -11 -1 -32.5t-0.5 -50t0 -58.5t0.5 -59v-48q0 -23 1 -33q0 -7 1.5 -31.5t4 -53t5 -53.5t2.5 -32t0.5 -24t0.5 -35t-0.5 -33t-0.5 -19q-1 -4 -4 -12t-9 -15t-13 -8.5t-16 7.5l-99 98l-182 295l-22 14v-436q0 -11 -7 -14t-15.5 -1t-16.5 6.5t-10 8.5q-11 123 -14.5 246.5z"},
    "O": {"horiz-adv-x": 386, "d": "M26 52q-10 49 -4.5 101t19.5 104.5t22 97.5q4 18 5 43t4 52.5t7 54t13 48.5q1 1 5.5 6t7.5 7q56 33 100.5 25.5t77 -43.5t52.5 -94t26.5 -124t-0.5 -133.5t-28.5 -124t-57.5 -94.5t-86 -45q-20 -2 -34.5 -2.5t-27.5 1.5t-24.5 9t-25.5 21q-41 41 -51 90zM190.5 -34q31.5 4 54 29t37 67t22 92t8.5 103.5t-3 100.5t-13 84t-22 54q-30 40 -52.5 52.5t-39 7.5t-27.5 -26t-17 -49.5t-8 -61.5t-0.5 -62.5t6.5 -53t12 -32.5q1 -3 11 -10.5t22.5 -16.5t24 -20.5t18 -23.5t6.5 -22.5t-13 -19.5q-11 -7 -23 -3.5t-25 12.5t-25.5 22.5t-23 26.5t-18 24.5t-10.5 16.5l-15 -28v-169q0 -4 4 -14t10 -21t13.5 -20.5t14.5 -14.5q40 -28 71.5 -24z"},
    "P": {"horiz-adv-x": 514, "d": "M178.5 156.5q-12.5 -10.5 -28.5 -22t-33 -17.5t-32 -2q-8 3 -11.5 8t-4.5 11t-1 12.5t2 11.5l148 85v239q0 7 9 10.5t19.5 3.5t19.5 -3.5t9 -10.5v-197q34 17 66.5 44t56.5 55.5t34.5 56t0 48t-46.5 30.5t-105 5q-15 -2 -37.5 -9t-49.5 -17.5t-54.5 -22t-53 -20.5t-44.5 -13.5t-28 -2.5q2 15 11 25.5t21.5 19.5t26 15.5t26.5 10.5q50 17 85.5 28t69.5 17t73 5.5t95 -7.5q45 -12 62.5 -31.5t15.5 -43.5t-20 -51.5t-44 -54.5t-55 -53t-54 -47t-42 -36t-18 -22l-28 -252l-5 -7q-4 -5 -10 -11t-13.5 -10t-13.5 -1v239q-6 -5 -18.5 -15.5z"},
    "Q": {"horiz-adv-x": 555, "d": "M357.5 -42q-10.5 8 -21 17.5t-21 17.5t-13.5 11q-34 -34 -68.5 -45t-65.5 -5.5t-57.5 26t-46.5 50t-31.5 66t-11.5 76.5q0 55 5.5 112t17 113t30.5 110t45 102h-7h-7q-2 -1 -8.5 -5.5l-13 -9t-12 -8.5t-8.5 -5q-13 25 -3 40.5t34.5 20.5t59 -2t71 -28.5t71 -57.5t59 -88t35 -121.5t-3.5 -158.5q-2 -8 -7 -27.5t-11.5 -42.5t-13.5 -43t-10 -27q28 -33 49.5 -49.5t42 -16.5t42 16.5t49.5 49.5q9 -22 5.5 -41t-15.5 -33.5t-30.5 -24t-38.5 -13.5t-40.5 -0.5t-34.5 13.5q-5 3 -15.5 11zM195 -6q21 0 41 8.5t32 23.5t6 34l-71 211q-8 23 -19.5 27t-23.5 -2t-23.5 -18t-17.5 -21q-3 0 -8.5 5.5t-5.5 8.5q0 12 5.5 25t13.5 24t17.5 20.5t19.5 14.5q21 10 40.5 -1.5t35.5 -36.5t29.5 -58t24 -64.5t16.5 -57t9 -35.5q19 9 27.5 38t10.5 68.5t-3.5 85t-14.5 88t-21.5 76.5t-27.5 52q-8 11 -25.5 25t-36.5 28.5t-36.5 29.5t-27.5 30l-3 -6q-1 -4 -4 -8.5t-4.5 -8.5t-1.5 -6q-13 -44 -29 -95.5t-29 -104.5t-20 -107.5t-1 -105t27 -95.5t65 -82q13 -10 34 -10z"},
    "R": {"horiz-adv-x": 583, "d": "M151.5 -8.5q-1.5 29.5 -2 67t-2.5 79t-3.5 78.5t-2 66.5t-0.5 44.5q0 5 -0.5 17t-0.5 25.5t0.5 25.5t0.5 16q-10 -4 -23.5 -16t-28.5 -26.5t-31 -26.5t-30 -15q-18 11 -16.5 28t18 36t44.5 39t61.5 39t69 34t67.5 25t57 13.5t37 -4.5q23 -23 22 -57.5t-15.5 -74.5t-38 -83t-45.5 -83t-37 -75t-14 -60.5t23.5 -37.5t76.5 -6q27 7 57 21t58.5 32t53 37t41.5 36q29 -7 32 -21t-11.5 -31t-42.5 -35.5t-63.5 -36t-74 -31t-74 -21t-63.5 -6.5t-40 14q0 -5 -1 -17.5t-3.5 -25.5t-8 -25t-16.5 -17q-8 -3 -16 2.5t-12 11.5q-1 15 -2.5 44.5zM346 458q-6 19 -19.5 26.5t-30.5 7t-34.5 -7.5t-32.5 -17.5t-25 -22t-10 -21.5l3 -298z"},
    "S": {"horiz-adv-x": 450, "d": "M56.5 -3.5q-24.5 30.5 -33.5 63t-5.5 63.5t12.5 50t20.5 21t19.5 -22q-9 -50 0 -88t29.5 -63t49.5 -36.5t59.5 -12t60 11t50.5 33t31 54t2 73.5q-5 19 -22.5 46t-39.5 57.5t-45.5 62.5t-39 61.5t-20 54.5t11.5 41q13 11 38.5 32t55 42.5t61 37t57.5 15.5q18 0 19 -5.5t-8.5 -15t-27.5 -22.5t-39.5 -27.5t-43 -31.5t-36.5 -33.5t-21.5 -32.5t1.5 -29q29 -41 58.5 -83.5t51 -83.5t33 -80t3.5 -75t-39.5 -68.5t-92.5 -59.5q-37 -15 -70 -14.5t-70 14.5q-46 19 -70.5 49.5z"},
    "T": {"horiz-adv-x": 577, "d": "M294.5 74.5q-2.5 56.5 -6.5 112.5t-6.5 112.5t-0.5 111.5q-9 -2 -27.5 -6.5t-42 -10t-50 -12t-50 -12t-42 -10t-27.5 -5.5q-11 -3 -22 2.5t-20 11.5l28 28q129 12 252.5 49.5t239.5 90.5h43q3 -6 -0.5 -13t-10 -13.5t-13.5 -10.5l-5 -4l-196 -71q-1 0 -1.5 -19.5t-0.5 -46t0.5 -55.5t1.5 -47q0 -7 1 -29t2.5 -50.5t3 -61t3 -61.5t2.5 -50.5t2 -28.5q0 -14 -8 -25.5t-17.5 -15.5t-19 1t-12.5 26q2 56 -0.5 112.5z"},
    "U": {"horiz-adv-x": 504, "d": "M31 -2q-6 21 -8.5 45t-2.5 47t1 41q1 11 3 38t5 60t5.5 69.5t5.5 69.5t5 60t4 39q3 7 11 13t17 2q11 -7 14.5 -17t3.5 -23t-1.5 -25t-1.5 -20q-3 -42 -11 -93.5t-12.5 -105t-1 -104.5t24.5 -90q11 -23 27 -21.5t34.5 16.5t37 40.5t33.5 51.5t24.5 48.5t11.5 32.5v16q0 12 -0.5 26.5t-0.5 26.5t1 16q1 12 5 42t8 63.5t8 63t6 41.5q5 13 19 15.5t24 -0.5q3 -46 -1.5 -92t-9.5 -91.5t-7 -91.5t4 -92q6 -40 20.5 -61.5t33 -27.5t41 0t45 19t44 28.5t38.5 28.5t29 21.5t16 7.5q7 -23 -7.5 -48.5t-42.5 -47t-65.5 -35.5t-74.5 -12.5t-68.5 21t-50.5 65.5q-13 -11 -28.5 -30.5t-33.5 -40.5t-38 -40t-40.5 -28t-42.5 -4t-42 31q-12 15 -18 36z"},
    "V": {"horiz-adv-x": 534, "d": "M38 382.5q-8 9.5 -13 20.5t-5 21.5t15 14.5q6 3 16.5 3t11.5 -3l140 -337q7 54 17.5 109t28.5 108t44.5 102t64.5 89q11 13 30 32l37 37t31.5 31t14.5 13h42q6 -10 -3.5 -21.5t-23 -21.5t-27.5 -18t-17 -9q-65 -65 -102 -134t-57 -144t-27.5 -156.5t-9.5 -171.5l-7 -3q-3 -2 -7.5 -4t-8.5 -4l-6 -3q-3 -1 -8 -1t-6 1l-154 436q-3 4 -11 13.5z"},
    "W": {"horiz-adv-x": 612, "d": "M41.5 -19q-10.5 22 -16.5 46t-8.5 48t-2.5 40q-1 10 -1 31t-0.5 48t0 55.5t0.5 54.5v48q0 22 1 31q5 14 18 16t25 -2q0 -13 1 -38t2 -57t2.5 -67t3.5 -66.5t2.5 -57t1.5 -37.5q1 -11 4 -25t7.5 -28t12.5 -26t19 -19q18 14 32.5 45.5t26.5 71t21.5 84t19 83t18 68.5t18.5 42.5t21.5 4t24.5 -47.5q2 -4 6 -17t10 -30.5t12 -37t12 -37t10.5 -30t6.5 -17.5q8 -22 20.5 -48.5t28.5 -50.5t33 -40t34.5 -18t34 14.5t31.5 58.5q1 10 1.5 30.5t1 47.5t0.5 56t-0.5 55.5t-1 47t-1.5 31.5q0 5 -4 25t-9 44t-9.5 44.5t-5.5 26.5q0 7 2.5 21.5t8 26t13.5 13t18 -18.5q13 -54 24.5 -116.5t16.5 -127t-0.5 -128t-25.5 -120.5q-18 -46 -39 -66t-44 -19t-46 18t-44.5 44t-41.5 60.5t-36.5 66t-28 61t-16.5 46.5h-14q-2 -8 -5.5 -28.5t-8 -43t-8.5 -42t-6 -27.5q-4 -14 -10.5 -34.5t-16.5 -42.5t-23 -42.5t-29 -33t-34.5 -15t-41.5 12.5q-18 12 -28.5 34z"},
    "X": {"horiz-adv-x": 590, "d": "M103 15.5q10 34.5 23 69t20.5 67.5t-5.5 62q-16 36 -39.5 70t-43 69t-30 73t-0.5 84q35 8 53 -3t26 -32.5t10 -50.5t6 -57.5t13.5 -54.5t31.5 -41q3 1 8.5 6.5t5.5 7.5q21 33 35.5 58t27 46t23.5 39t26.5 36t35.5 39.5t50 49.5q42 38 77.5 42t60.5 -15.5t37 -58t8 -84t-26.5 -93.5t-66.5 -86t-111 -62.5t-162 -23.5q-13 -23 -22 -52t-16.5 -59.5t-11.5 -60.5t-6 -53q-2 -6 -9 -10t-13 -5t-12 2.5t-8 12.5q-6 34 4 68.5zM223 235.5q0 -5.5 2 -6.5q71 -11 123.5 2t88.5 40t56.5 63.5t27.5 73t0.5 68.5t-23 49t-43.5 15t-62.5 -32t-77.5 -94t-90 -171q-2 -2 -2 -7.5z"},
    "Y": {"horiz-adv-x": 496, "d": "M130 -212q-4 34 2.5 71t20.5 75.5t31 73.5t36 65t33 49q34 46 56 79.5t30 66.5t1 70t-30 93q-26 -110 -64.5 -191.5t-77.5 -129.5t-75 -58.5t-58.5 21.5t-26.5 110t20 208q4 12 18 14t24 -1v-267q0 -35 10.5 -43t25.5 1.5t32.5 31t33 44t26.5 41t13 24.5q3 11 10.5 34.5t16 54.5t17.5 64.5t17 64t14.5 55t8.5 36.5q3 6 9.5 10t13 5t12.5 -2.5t8 -12.5l55 -268q2 -5 13 -2t27 11.5t35 20t35.5 23t29 20t15.5 12.5q26 -4 27 -15t-13 -26.5t-38 -33t-48 -33t-43.5 -29t-23.5 -18.5q0 -8 -1 -24t-2.5 -37.5t-3 -44t-3 -43.5t-3.5 -37l-3 -25q-1 -10 -7 -33.5t-16.5 -53t-25 -62t-31 -62t-35.5 -52.5t-39.5 -33.5t-42 -4.5t-42.5 34q-20 25 -24 59zM224 -255q15 5 30 23.5t29.5 45.5t26 53.5t19 47t9.5 25.5q11 55 14 113t0 112q-23 -19 -49 -49t-49.5 -65t-43.5 -74t-29.5 -77.5t-7 -75t23.5 -66.5q12 -18 27 -13z"},
    "Z": {"horiz-adv-x": 542, "d": "M502.5 187.5q-20.5 -45.5 -50.5 -89t-67.5 -82t-75.5 -62t-72 -29t-57.5 15.5t-33.5 73.5t2 143.5l90 314l-203 -172q-1 0 -5 3t-7 7t-4.5 9t2.5 8l239 210q11 9 20 11.5t15.5 -2t8.5 -14t-2 -22.5q-18 -55 -36 -105.5t-32.5 -100t-26 -99t-18.5 -103.5q-7 -61 3.5 -88t33 -29.5t52 13.5t58.5 39.5t54.5 49.5t37.5 44q7 9 11.5 25t8.5 35t9 38t12 33t17.5 21t26.5 2q2 -1 7.5 -6t6.5 -8q-4 -38 -24.5 -83.5z"},
    "a": {"horiz-adv-x": 410, "d": "M17.5 16q-1.5 35 3.5 71q1 12 4 34.5t7 50t9 58.5t9 58.5t7.5 48.5t5.5 32q6 34 14 58t21.5 37t35 14t55.5 -11q4 -1 9 -6.5t5 -6.5q2 -11 6.5 -33t10 -50t12 -58t11.5 -58t9.5 -50t7.5 -33q12 -57 30 -79.5t38 -23.5t42 13.5t42.5 30.5t39.5 27t32 4q0 -15 -7 -29.5t-17.5 -27t-22.5 -23.5t-22 -18q-46 -30 -76 -31.5t-51.5 13.5t-34.5 42t-22.5 54.5t-19 49t-22.5 27.5q-3 -11 -10.5 -36.5t-16.5 -55t-17 -55.5t-12 -36q-1 -4 -6 -15.5t-13.5 -25t-18.5 -26t-20.5 -19.5t-21 -4.5t-18.5 19.5q-16 34 -17.5 69zM75.5 150q-0.5 -26 -0.5 -54.5t0.5 -55t1.5 -36.5q28 43 50.5 100t34.5 118.5t9.5 121.5t-23.5 110q-15 -26 -27 -64t-20.5 -77t-15 -74t-8.5 -53q-1 -10 -1.5 -36z"},
    "b": {"horiz-adv-x": 386, "d": "M112.5 -33.5q9.5 13.5 27.5 28t40.5 29t43 28.5t36 26.5t21.5 23.5q12 24 21 56.5t11.5 63t-0.5 55.5t-15.5 33.5t-33.5 -3t-53 -50.5q-9 -12 -21.5 -40.5t-26.5 -63.5l-28 -70t-28 -59.5t-27 -32t-23 12.5q0 6 0.5 19.5t0.5 29t-0.5 29.5t-0.5 20q-3 55 -6 107.5t-6.5 104.5t-8 104t-8.5 106q-1 23 2 31t8.5 5.5t13.5 -14.5t15 -29t12 -37.5t6 -40.5q0 -9 0.5 -30t2.5 -47.5t3.5 -55.5t2.5 -55.5t2.5 -47.5t2.5 -31q18 13 30 32t24.5 39t25.5 39t32 31q52 33 85.5 35.5t52 -15.5t22 -52t-6.5 -75.5t-31.5 -86.5t-53 -84.5t-72 -68.5t-87.5 -39l-7 6q-5 6 -6 8q-4 12 5.5 25.5z"},
    "c": {"horiz-adv-x": 421, "d": "M27.5 17q-13.5 32 -14.5 69t8 77t24 77t34.5 69.5t39 54.5t36.5 31.5t27 1.5q2 -9 6.5 -33t9 -51.5t8 -51t5.5 -32.5q1 -10 0.5 -22t-4.5 -21.5t-13.5 -14t-25.5 0.5q-1 6 -4.5 19.5t-8 29.5t-9 30.5t-5.5 19.5l-14 14q-25 -17 -42 -49t-24 -68.5t-3.5 -73t19 -64.5t42.5 -42.5t68 -4.5t96 47.5t126 113.5v-29q0 -2 -10 -14t-24 -27.5l-28 -31t-24 -24.5q-27 -25 -57 -46.5t-62.5 -31.5t-66 -6.5t-67.5 28.5q-29 23 -42.5 55z"},
    "d": {"horiz-adv-x": 429, "d": "M16.5 27q-2.5 32 1 72.5t13 85t23.5 84t32 72.5t40.5 51t47 17.5t51.5 -26.5l28 226q1 3 6.5 8.5t7.5 5.5q4 0 8.5 -2t9 -3.5t7.5 -4.5t3 -4v-395q0 -44 16 -76.5t40.5 -47.5t57.5 -10t69 35q12 0 11 -10t-9.5 -23.5t-24.5 -28t-35 -24t-40.5 -10t-41.5 12.5q-17 11 -30 25.5t-23 31.5t-18.5 34.5t-13.5 34.5q-4 -7 -11.5 -21t-17.5 -32.5t-20 -38t-20 -37.5t-18 -32.5t-12 -20.5q-12 -22 -28.5 -32.5t-35 -10.5t-35 10.5t-27.5 32.5q-9 19 -11.5 51zM74 -1.5q3 -3.5 7.5 -7t9 -4.5t8.5 3q40 30 64.5 71.5t40 87.5t24.5 94.5t17 91.5q-44 6 -75 -6.5t-52.5 -37.5t-33.5 -60t-17 -73.5t-3.5 -78.5t6.5 -75q1 -2 4 -5.5z"},
    "e": {"horiz-adv-x": 425, "d": "M114.5 10q-19.5 36 -29.5 77q-6 -4 -15.5 -8.5t-19.5 -8t-20 -4.5t-14 2t-2.5 10.5t14.5 23.5l10.5 10.5t18.5 18t18 17.5l10 10q8 21 10 45.5t2.5 50.5t3 52t12.5 49q5 12 20.5 31.5t36 37t40.5 32t35.5 17.5t22.5 -7.5t-1 -40.5q-9 -35 -27 -69t-37.5 -66.5t-36.5 -65t-25 -66.5q-4 -18 -4 -43t6 -50t18.5 -46t35.5 -29q25 -10 51.5 -5t51 19t47 34.5t42.5 42.5t35 42.5t25 34.5l15 -14q5 -4 -7.5 -27t-36.5 -52t-56.5 -58.5t-66.5 -50t-68 -25.5t-61 16q-34 27 -53.5 63zM140 285v-21v-21t1 -14q26 45 48.5 95t35.5 101q-19 -6 -34 -19.5t-25 -31t-16.5 -37t-8.5 -37.5q-1 -5 -1 -15z"},
    "f": {"horiz-adv-x": 436, "d": "M185 -44q-2 6 -4 13.5t-4 12.5t-2 8q-1 9 -2 27.5t-3 42t-3 50t-2.5 50t-2.5 42.5t-1 27q-2 1 -7 1t-7 -1q-7 -1 -22.5 -5t-33.5 -10l-34 -8q-16 -3 -22 -5l-36 36l162 48l28 309q3 31 18 51.5t36.5 32.5t44 15t38.5 -4t22.5 -23.5t-4.5 -42.5q-12 -9 -18.5 -7.5t-10.5 7.5t-6.5 14t-6.5 13q-15 16 -27 10.5t-20.5 -25t-15.5 -50t-11 -64.5t-6 -69.5t-3.5 -64.5t-1.5 -49v-25q16 -4 36 1.5t40.5 16t41 22.5t38.5 18t32 4t23 -20l-27 -28l-170 -70l-14 -14q-1 -2 -1.5 -23t-0.5 -50.5t0.5 -59.5t1.5 -50q1 -9 6.5 -26.5t9 -37.5t1 -37.5t-16.5 -25.5q-9 -3 -16.5 2.5t-11.5 11.5q-2 3 -4 9z"},
    "g": {"horiz-adv-x": 437, "d": "M127.5 -244q-1.5 37 12.5 79.5t38.5 87.5t50.5 86.5t48 77t33 57.5q5 13 2.5 36.5t-9 48.5t-13 45t-9.5 26l-14 -15l-154 -267q-2 -2 -7 -6t-12 -8t-13.5 -8t-10.5 -6q-26 -11 -38 2t-12.5 42t8.5 70t26.5 86.5t41 91.5t51.5 85.5t58.5 68t60.5 37.5q16 -5 16.5 -12.5t-8 -17t-22.5 -20t-29.5 -21t-28 -19.5t-16.5 -15q-20 -42 -40.5 -80.5t-37 -76.5t-25.5 -78t-5 -87l15 14q29 36 53.5 82t44.5 93t37.5 89t31.5 70.5t28 38.5t27 -9.5t28 -73t31 -149.5q4 3 15.5 11.5t25 17.5t26 16.5t16.5 10.5q5 1 15 1t14 -1q-4 -15 -18.5 -34t-32 -36t-32 -29.5t-15.5 -13.5q0 -8 -0.5 -24t-2 -37.5t-2.5 -44t-3 -43.5t-4 -37l-2 -25q-1 -10 -11.5 -38t-26 -63t-35.5 -70t-42.5 -58t-47.5 -28t-49 19q-25 24 -26.5 61zM195.5 -187.5q-0.5 -15.5 -0.5 -33.5t0.5 -34.5t1.5 -21.5q42 18 70.5 59.5t43.5 93.5t17.5 105.5t-5.5 93.5q-23 -20 -44.5 -49t-38.5 -61.5t-28 -66.5t-15 -64q-1 -6 -1.5 -21.5z"},
    "h": {"horiz-adv-x": 380, "d": "M88.5 126q-3.5 78 -13.5 156t-23 158t-24 169v8v12.5v12.5v8h29q2 -15 7 -45.5t12.5 -69.5t15 -82t14.5 -81.5t12.5 -69.5t8.5 -45q0 -3 2 -9t4 -12.5t4.5 -12.5t3.5 -9q2 7 9.5 23t16.5 34t17.5 33.5t12.5 22.5q13 23 33 43t39.5 24.5t35 -9.5t18.5 -58q1 -10 2.5 -32t2.5 -50t3 -58.5t3.5 -58.5t2.5 -49.5t1 -32.5q9 -11 13.5 -26t0.5 -30q-16 -5 -28 1t-20 18t-13.5 26.5t-9.5 24.5q2 31 2.5 67t-0.5 73t-4.5 73.5t-11.5 68.5q-14 7 -26.5 -6t-23.5 -39.5t-21 -62t-19 -74.5t-17.5 -78t-16 -71t-15 -52.5t-15.5 -25.5l-28 29q7 86 3.5 164z"},
    "i": {"horiz-adv-x": 162, "d": "M24.5 -12.5q-2.5 9.5 -5 21t-4 22t-1.5 15.5v393q0 8 7 12t16.5 4t17 -0.5t8.5 -0.5v-436q0 -14 9 -23t21 -14t25 -6.5t22 1.5q11 -17 -0.5 -27.5t-33 -11.5t-44.5 8t-34 31q-1 2 -3.5 11.5zM18.5 610.5q18.5 6.5 38.5 -1.5v-43q-3 -1 -9 -1.5t-13 -0.5t-13 0.5t-8 1.5q-3 1 -8.5 6.5t-5.5 8.5q0 23 18.5 29.5z"},
    "j": {"horiz-adv-x": 214, "d": "M-58 -506q-4 22 -2.5 45.5t6.5 45.5t12 39q3 10 10.5 29.5t17 45t20 53t20.5 52t18 44.5l13 29q3 32 -0.5 62.5t-9.5 59.5t-15 58t-18 59q-3 11 1.5 17.5t11.5 9t15.5 0t14.5 -11.5q12 -23 19 -45t12 -45t9.5 -47t14.5 -47q9 7 28.5 23.5t44.5 32.5t50.5 26t45.5 3q3 0 8.5 -5.5t5.5 -8.5q-6 -11 -21.5 -21t-35 -19.5t-41 -19.5t-39 -20.5t-28.5 -22t-11 -24.5v-295q0 -14 -7 -35.5t-18.5 -45.5t-27.5 -45.5t-34 -32.5t-37 -8.5t-37 26.5q-12 17 -16 39zM-1.5 -426.5q-0.5 -16.5 -0.5 -34t0.5 -33.5t1.5 -22q2 -1 7 -1t7 1q13 7 23 28.5t17 45t11.5 44t4.5 22.5q1 10 1.5 33.5t0.5 50.5t-0.5 51.5t-1.5 33.5q-26 -46 -46 -95t-24 -102q-1 -6 -1.5 -22.5zM57 374q6 8 17 10t22 -1t16 -13q5 -11 -1.5 -17.5t-16.5 -9t-21.5 0t-15.5 12.5q-6 10 0 18z"},
    "k": {"horiz-adv-x": 390, "d": "M79.5 27.5q5.5 24.5 9.5 52.5t5 56t-5 47t-22.5 25t-48.5 -7q-18 4 -20.5 13t5 20.5t20.5 25t27 28t25 28t12 26.5q-1 6 -2.5 28t-4.5 50.5t-6.5 61t-6.5 61.5t-5 51t-3 29q0 11 0.5 20t5.5 15.5t13.5 8.5t22.5 -3q4 -30 8 -69.5t9 -80.5t11 -82t14 -77q8 6 19.5 21.5t24.5 35t27.5 38.5t27.5 30.5t24 13.5t18 -12q1 -2 1 -7t-1 -8q-10 -32 -33 -59.5t-47 -53.5t-42 -53t-19 -58q7 -6 22 -22l70 -70l38 -38t31 -32l22 -21l15 -15t19 -24t8.5 -25t-14.5 -20q-2 -1 -7 -1t-7 1q-41 51 -91 104t-106 92q-1 -7 -2 -22.5t-4.5 -35t-6 -41t-5.5 -40.5t-5.5 -34.5t-4.5 -22.5q-1 -5 -4.5 -13.5t-9.5 -16.5t-13 -12t-15 -1q0 4 -0.5 11.5t-0.5 16.5t0.5 17t0.5 12q1 13 6.5 37.5z"},
    "l": {"horiz-adv-x": 202, "d": "M36.5 -17.5q-8.5 23.5 -12 50t-3.5 49.5v33q0 9 1 36.5t2.5 63.5t3 77t3 77t3 62.5t1.5 35.5q0 13 0.5 42.5t0.5 63.5t-0.5 63.5t-0.5 42.5q12 9 21 11q8 4 14.5 2t6.5 -13v-661q0 -6 4 -14t9 -13t13 -6.5t16 5.5l98 84q4 -19 -0.5 -39.5t-15.5 -38.5t-27 -32t-35 -22t-38.5 -7.5t-37.5 12.5t-26.5 35.5z"},
    "m": {"horiz-adv-x": 604, "d": "M262.5 15q0.5 36 -1.5 72.5t-5.5 72.5t-9.5 69q-12 59 -29.5 90t-36.5 33.5t-35.5 -24.5t-25.5 -85q-2 -9 -4 -28t-5 -42.5t-6 -49.5t-6 -49.5t-4 -42t-2 -27.5q-6 -13 -19 -15.5t-24 1.5l-28 421q-1 11 5 18.5t13 10.5t14 0t10 -15l29 -125q25 60 46 85.5t40 26.5t35.5 -18t32 -45t29 -55.5t27.5 -50.5q34 114 76 164.5t81.5 41.5t69.5 -75.5t40 -187.5q2 -19 2.5 -49t0.5 -59t-0.5 -51t-2.5 -23l-15 -14l-27 28q4 41 2 87t-8.5 92.5t-16.5 90t-20 81.5q-11 32 -27 37.5t-32.5 -5t-30.5 -32.5t-21 -42q-5 -12 -12 -32t-13.5 -40.5t-11.5 -36t-6 -17.5q-2 -15 -6.5 -50.5t-9 -76t-8 -76.5t-4.5 -51q0 -12 -6.5 -13.5t-14.5 1.5q-9 3 -21 12q2 32 2.5 68z"},
    "n": {"horiz-adv-x": 410, "d": "M58 -16v110q0 26 -1 37q-1 4 -3 20t-5 38.5t-6 46.5t-6.5 45.5t-5.5 38t-3 22.5q-1 11 -0.5 23t4.5 21t12.5 12.5t25.5 -1.5q1 -17 3.5 -40t5.5 -48t8 -49.5t12 -45.5q10 31 20.5 54t23.5 42t29 37t39 36q28 24 47 19.5t31.5 -28t21 -60t14.5 -77.5t13 -80t17.5 -68t26.5 -42t40 -1q7 -22 2 -32t-18 -11t-29.5 6.5t-33 20.5t-29.5 32t-19 40q-2 14 -5 47.5t-7.5 71.5t-15 75t-28.5 59l-57 -55q-2 -4 -11.5 -29.5t-20.5 -59.5t-22 -68.5t-15 -55.5q-2 -7 -4.5 -26.5t-5 -42.5t-3.5 -43t-1 -28q-7 -15 -21 -15t-21 15q1 11 1 37z"},
    "o": {"horiz-adv-x": 279, "d": "M57 42q-4 37 0 77.5t13 82t16 80t7.5 72t-11.5 57.5q-6 13 -17.5 12.5t-24 -3t-24.5 -2t-22 15.5q1 3 6 8t7 6q73 11 122 -14.5t78.5 -72t40 -106.5t7.5 -119t-18.5 -109.5t-39 -78t-53.5 -24.5t-62 52q-21 29 -25 66zM129 -2q4 -4 8 -9t8 -8.5t6 -4.5q31 17 45.5 46t17 64.5t-3.5 75t-17 76t-26.5 67t-28.5 50.5q-1 -11 -3.5 -32.5t-5 -49.5t-5.5 -58.5t-6 -58.5t-5.5 -50t-3.5 -32q0 -8 1 -18.5t3.5 -20t5.5 -18t5 -13.5q1 -2 5 -6z"},
    "p": {"horiz-adv-x": 457, "d": "M36.5 -441.5q-10.5 22.5 -17 47.5t-9.5 49.5t-4 39.5q-2 69 -1.5 146.5t14 154t40.5 147t74 128.5q25 31 49 55t50.5 44t57 34t68.5 22q34 7 52.5 -7.5t24.5 -43t0 -68t-20 -81t-33.5 -81.5t-42 -70t-47 -46.5t-46.5 -10.5q-4 5 6.5 26.5t28 52t38 68.5t37.5 76.5t26.5 76t3.5 65.5q-2 14 -14 16t-26.5 -1t-27.5 -8t-16 -7q-62 -26 -107 -76.5t-75.5 -116t-48 -139t-24.5 -145.5t-5.5 -137t10 -112.5t22.5 -72t31 -16.5q2 1 7 7t7 7q12 35 19 75.5t10.5 84t4.5 88t0 86.5t-2.5 79t-3.5 65q-3 7 -4.5 22t-1.5 32.5t1 35t5 26.5t11 6.5t17 -23.5q1 -10 3.5 -36t4.5 -55.5t4 -55.5t2 -36q1 -12 1 -32v-42v-94v-36t-1 -20q0 -9 -3.5 -30t-7.5 -45.5t-9 -47.5t-8 -32q-4 -17 -13 -35t-22 -30.5t-28.5 -15t-34.5 9.5q-16 10 -26.5 32.5z"},
    "q": {"horiz-adv-x": 275, "d": "M300.5 -506q-15.5 35 -25 69.5t-13.5 65t-1 51.5q-7 49 -37.5 76.5t-70.5 41t-85 17.5t-82 6q-4 6 1 17t13 11q25 3 52.5 2t54.5 -5t53.5 -11t50.5 -14q3 27 0.5 60t-7.5 65.5t-11 63t-11 50.5q-14 -10 -23 -23t-17.5 -26.5t-18.5 -26.5t-24 -22q-32 -22 -51 -14.5t-26 34.5t-4 68t13.5 86.5t27.5 90.5t37 79t42 52t44 11q2 -2 2 -7.5t-2 -6.5q-4 -8 -19.5 -36t-35 -67.5t-39.5 -84t-31 -82t-9.5 -64t22.5 -31.5q28 7 48 27t34 47.5t22 60t13 64.5t7 60.5t3 50.5q4 12 18 15t24 -2v-31v-47t-0.5 -55.5t0 -55.5t0.5 -47v-31q0 -11 2 -32t5 -47.5t7 -55.5t8.5 -54.5t9.5 -46.5t10 -31q15 -28 42.5 -59t55 -62.5t50 -65t28.5 -67.5t-10.5 -69.5t-66.5 -70.5q-4 2 -9.5 8t-12.5 12t-13 13t-7 10q-22 31 -37.5 66zM334 -446l17 -43q9 -22 17 -42t12 -27q12 -14 17.5 -5t4.5 32t-8 55.5t-20.5 66t-33.5 65t-45 52.5v-6.5v-6.5q3 -10 7 -28l9 -36q3 -17 6.5 -31.5t5.5 -18.5q3 -8 11 -27z"},
    "r": {"horiz-adv-x": 342, "d": "M59 -85.5q-9 -0.5 -15.5 18t-10 52t-4.5 74t-0.5 85t2.5 85.5t5.5 75.5t7 54.5t7.5 22t8 -23q26 20 56 37.5t62 29.5t65 15t63 -6q4 -11 1 -24.5t-15 -17.5q-13 2 -34 2t-44.5 -3t-47.5 -10t-42.5 -19t-30.5 -28.5t-12 -40.5v-351q-12 -27 -21 -27.5z"},
    "s": {"horiz-adv-x": 302, "d": "M34.5 -12q-9.5 26 -10 49t6 36t18.5 1q-2 -44 16 -66.5t43 -28.5t54 3t49.5 28t28.5 46.5t-9 58.5q-20 25 -46.5 47t-53.5 44t-52 45t-44 49q-2 2 -2 6.5t2 6.5q6 7 16 22.5t24 35.5t29.5 41t29.5 40.5t24.5 35t16.5 22.5q11 15 23 17t33 -3q-1 -4 -6 -14.5t-8 -13.5q-6 -10 -24 -34t-38.5 -51.5t-38 -51t-24.5 -32.5t4.5 -22t32 -29.5t47.5 -36t51 -42.5t40.5 -49t18 -55.5t-17 -62t-65.5 -68.5q-14 -12 -31.5 -20t-36 -10.5t-37.5 0.5t-35 15q-19 15 -28.5 41z"},
    "t": {"horiz-adv-x": 361, "d": "M204 138.5q-10 37.5 -14 77.5t-3.5 79t2.5 71q-12 3 -26 -2t-30.5 -12.5t-33.5 -16.5t-32 -13t-27 -1.5t-19 17.5q-7 13 1.5 21t25 12.5t38.5 7t41.5 5.5t33 8.5t14.5 15.5l28 308q1 8 8 12t14.5 4t14 -3.5t6.5 -12.5v-266q11 -3 21.5 0.5t21 7.5t21 6t20.5 0q6 -9 -1 -17t-13 -11l-14 -9q-10 -6 -21 -13t-21.5 -12.5t-13.5 -7.5q-1 -11 -1.5 -39t-0.5 -59.5t0.5 -59.5t1.5 -40q2 -38 13.5 -69.5t31.5 -49.5t47 -18t63 26q6 -18 -1 -33t-21 -23.5t-34.5 -11t-41 2.5t-40 17.5t-32.5 33.5q-17 30 -27 67.5z"},
    "u": {"horiz-adv-x": 364, "d": "M38.5 -13.5q-2.5 8.5 -4.5 17.5t-4 17t-2 11v310q0 7 6 10.5t13 4t14 0t9 -1.5q-1 -11 -1 -32.5t-0.5 -49.5t0 -58.5t0.5 -58.5v-50q0 -22 1 -32q2 -46 13 -63.5t26.5 -16.5t33 17.5t32.5 40t25.5 48t10.5 44.5v211h56q-1 -19 -3.5 -49t-3 -65t1 -71t7.5 -68t17.5 -55.5t30 -33.5t44 -3.5t61.5 36.5q7 -21 -6 -40.5t-34 -34t-45.5 -21.5t-41.5 -3q-2 1 -7 6.5t-7 8.5q-3 6 -11 21.5t-17 33.5t-16.5 34t-11.5 23q-4 -9 -15.5 -27.5t-27.5 -39.5t-34 -39t-36.5 -25.5t-36.5 -1.5t-33 35q-1 2 -3.5 10.5z"},
    "v": {"horiz-adv-x": 345, "d": "M52 237l-16 34q-9 18 -17.5 33.5t-12.5 22.5q3 9 11 13t17 3.5t17.5 -4.5t11.5 -12l112 -253l99 351l4 6q5 6 11 12t13.5 10t13.5 1q2 -4 2 -15t-2 -14q-2 -6 -10.5 -30.5t-18 -53.5t-17.5 -53.5t-10 -30.5q-2 -7 -5.5 -27.5t-7.5 -48t-9 -58.5t-9.5 -58.5t-7.5 -48t-4 -26.5q-2 -10 -5.5 -21t-10 -20.5t-16.5 -14t-24 -1.5q-3 11 -11 33t-17.5 49.5t-20 58.5t-20 58.5t-17 49.5t-12.5 32q-3 7 -11 23z"},
    "w": {"horiz-adv-x": 499, "d": "M266.5 29.5q-9.5 34.5 -16.5 71t-11 67.5q-6 31 -8 45q-1 -14 -9 -42q-8 -29 -20 -61.5t-28 -65.5t-36 -56.5t-42.5 -32.5t-46.5 7q-2 0 -4.5 5.5t-4.5 12t-3.5 13.5t-1.5 11v338q-12 23 -13.5 37.5t3 22.5t13 10.5t17.5 -0.5t15.5 -10.5t6.5 -18.5v-337l15 -42q39 28 63.5 67.5t37.5 85t17.5 93t6.5 92.5q4 0 11 1t13.5 0t11.5 -5t7 -11l56 -295l28 -56q19 12 29 44.5t14 77t4.5 96.5t0 104t0 99t7.5 81t20.5 50.5t36.5 8.5q17 -4 16 -17.5t-9 -27.5t-17 -25.5t-10 -12.5v-380q0 -16 -7 -37.5t-18 -41t-26 -36t-31.5 -22t-33.5 2.5t-33 36q-11 19 -20.5 53.5z"},
    "x": {"horiz-adv-x": 478, "d": "M22 7q3 29 13 57t25.5 56t28 55t20 54.5t4.5 55.5q-1 6 -3.5 22t-5.5 37.5t-6 46t-6 46t-5 38t-2 21.5q-4 32 4.5 55.5t20 35t21.5 10.5t10 -16q-1 -11 -1 -37v-55.5v-55.5t1 -36q0 -4 1.5 -12t4 -17t4.5 -16.5t4 -9.5q47 76 97 115t93 48t75.5 -8t44.5 -53.5t0.5 -88.5t-56.5 -112q-30 -39 -60.5 -55t-60.5 -18.5t-57 3t-48.5 10.5t-36 4.5t-19.5 -15.5q-4 -11 -11 -32.5t-13.5 -44t-12 -41t-5.5 -22.5q-3 -9 -1.5 -26.5t-1.5 -33t-11.5 -27.5t-28.5 -12q-1 0 -6.5 5.5t-7.5 8.5q-9 31 -6 60zM274 198.5q26 2.5 49 15.5q38 23 62 54.5t33.5 64t8 62t-13.5 50t-34.5 28t-52 -5t-66.5 -49.5t-78 -105q-7 -19 -6.5 -32.5t7.5 -25t18.5 -21.5t23.5 -20q23 -18 49 -15.5z"},
    "y": {"horiz-adv-x": 618, "d": "M317.5 -269.5q-7.5 22.5 -7 50t8 58t17 59t20 53t18.5 39.5q2 7 10 22.5t17 35.5l40 81q10 19 18 34.5t13 22.5q3 38 -6 60t-26 30t-39.5 4t-45.5 -17t-44.5 -32.5t-35.5 -44.5q-5 -4 -17 -19t-29 -36.5t-38 -46.5t-42.5 -49t-42 -44.5t-37.5 -31.5t-29.5 -12t-17.5 15q-1 0 -1.5 4t-0.5 8.5t0.5 8.5t1.5 7q1 8 6.5 34t12.5 61t15 74.5t14.5 74.5t12.5 60.5t9 33.5q1 7 10 19t20 20t22.5 7.5t17.5 -18.5q-8 -12 -18.5 -37.5t-20.5 -58t-20 -68.5t-17 -69.5t-9 -61.5t0 -43q35 46 77 97.5t86 98t87 80.5t80 43.5t65 -11t42 -83.5l98 84h42q8 -23 0 -31t-22.5 -12.5t-32 -9.5t-29 -21t-14 -48t13.5 -90q11 -40 15.5 -83t-1.5 -85q-3 -18 -12.5 -50t-26 -67t-38.5 -68.5t-47.5 -55t-54.5 -27t-60 15.5q-20 13 -27.5 35.5zM380 -274q15 -8 34.5 1.5t41 35t40 60t31 77t15.5 87.5t-6.5 89t-36.5 82q-18 -13 -37 -41.5t-35.5 -65t-31 -77.5t-24 -80t-13 -73t0.5 -56q6 -31 21 -39z"},
    "z": {"horiz-adv-x": 518, "d": "M38.5 58q-2.5 37 11 71t38.5 64t48.5 53.5t42 39.5t19.5 23q-9 -10 -25 -17.5t-35.5 -10.5t-39.5 0.5t-34.5 16t-23 34t-4.5 56.5q12 13 20.5 11.5t16 -10.5t14.5 -23.5t15.5 -27t19.5 -20.5t26 -5q21 5 43.5 22.5t47 35.5t52 29t56.5 3q21 -5 19.5 -18t-15.5 -30t-37 -34.5t-45 -32t-39.5 -25t-20.5 -11.5q-19 -14 -38.5 -29.5t-36 -33.5t-28 -38t-14.5 -42q-7 -45 1 -73.5t28 -43.5t49 -19t62.5 0t68.5 14.5t67.5 23t59.5 26.5t44 25q10 0 19.5 -5t14 -12.5t1 -16t-18.5 -14.5q-25 -10 -59 -24.5t-71.5 -28.5t-78 -23t-78.5 -9t-72 12t-59 43q-29 37 -31.5 74z"},
    "0": {"horiz-adv-x": 457, "d": "M66 -36.5q-9 10.5 -16.5 22t-12.5 24.5t-9 22q-5 27 -4 67t9 87t21.5 97.5t34 98t46.5 88t57 67t67.5 35.5t78.5 -6q35 -13 53 -39.5t31 -59.5q0 -9 0.5 -33t0.5 -51t-0.5 -50.5t-0.5 -32.5q-2 -22 -17.5 -62.5t-41.5 -86.5t-59.5 -91.5t-71 -77.5t-75.5 -44t-72 9q-10 6 -19 16.5zM156.5 -11q26.5 6 54.5 29q56 49 92.5 102t56 106t24 102.5t-2 90t-22 69t-37 38.5t-47 1t-50.5 -45q-12 -18 -28.5 -38.5t-32 -41t-30 -43.5t-21.5 -46q-4 -11 -12.5 -35.5t-17 -54.5t-15 -63t-7 -63t7.5 -54.5t30 -38.5q31 -21 57.5 -15z"},
    "1": {"horiz-adv-x": 256, "d": "M102 125.5q2 78.5 6.5 154t12.5 152.5t24 167q-7 -9 -18 -18.5t-24.5 -17t-28 -9.5t-28.5 3q-1 4 8 18.5t24.5 34.5t35 43.5t39.5 44t37 36t28.5 20.5t15.5 -4t-4 -37q-3 -7 -9 -25.5t-12.5 -39t-12.5 -38t-10 -25.5q-1 -14 -4.5 -45t-8 -70t-9 -81.5t-8.5 -81.5t-7 -70t-4 -45q-3 -33 -3 -40.5t0.5 -5t1.5 10.5t1 7q-1 -16 -2.5 -44.5t-2 -60.5t-1.5 -60.5t-2 -44.5q0 -8 -3.5 -15t-10 -12t-14 -5.5t-14.5 4.5v28q5 93 7 171.5z"},
    "2": {"horiz-adv-x": 577, "d": "M41 66q14 36 37 65.5t54.5 50.5t70.5 32q19 36 37 75.5t31 80.5t17.5 83.5t-1.5 83.5l-112 -98h-27v28l126 127q15 15 28.5 14.5t23.5 -9.5t14.5 -22.5t3.5 -23.5t-3.5 -26.5t-4 -32t-4 -27.5t-2.5 -13q-2 -13 -12 -42.5t-21.5 -63.5t-21.5 -64t-15 -41q-12 -13 -7.5 -21t16.5 -12q13 -6 33 -9q18 -2 42 1t49.5 9t51.5 12.5t47.5 11.5t37.5 7.5t24 0.5q5 -2 11 -7.5t4 -6.5l-28 -43q-2 -2 -18.5 -8.5t-39 -13t-45.5 -12.5t-37 -8q-10 -2 -36.5 -2.5t-56 -0.5t-55 0.5t-36.5 2.5q-5 -8 -18.5 -28.5t-29 -42.5t-30 -42t-20.5 -27q-6 -9 -16 -21.5t-22.5 -23.5t-28.5 -16t-31 4q0 3 -0.5 9t-0.5 13t0.5 12.5t0.5 8.5q6 40 20 76zM58 -11q0 -7 5 -7t5 7t-5 7t-5 -7zM77 32.5v-14.5h15l83 126h-14q-4 0 -17 -11t-26.5 -26t-25.5 -31.5t-15 -29.5v-13.5z"},
    "3": {"horiz-adv-x": 409, "d": "M37 -15.5q-13 21.5 -19 46t-6 50t2 50.5q7 4 15 -7t17.5 -30t21 -43t26.5 -43.5t35 -31t44 -7t54 28.5t68 76q52 69 56 121.5t-25.5 79.5t-86 23.5t-126.5 -41.5q-18 0 -11 13t27 34t48.5 46t54.5 50.5t44.5 47t18.5 34.5v14q-11 4 -27.5 -2t-34.5 -16t-35.5 -21t-33.5 -17.5t-29.5 -4.5t-21.5 19q-4 6 -0.5 12.5t8.5 13t11 10.5l9 6q10 3 36 11.5t55.5 17.5t55 16.5t35.5 11.5h14.5h14.5q6 -24 -2.5 -49.5t-23.5 -50.5t-31.5 -47.5t-27.5 -36.5q10 4 23 -3t20 -11q37 -30 53 -68.5t14.5 -79t-16.5 -81.5t-40.5 -77t-57 -64.5t-65 -43.5t-67 -15t-61.5 21q-20 16 -33 37.5z"},
    "4": {"horiz-adv-x": 499, "d": "M298.5 -4.5q2.5 15.5 5 35.5t5.5 43t6.5 43t5 35t2.5 20q0 3 0.5 9t0.5 12.5t-0.5 12.5t-0.5 8q-9 4 -33 12.5t-51 17.5l-51 17t-34 10q-15 4 -29 -6.5t-26.5 -27.5t-24 -36.5t-21.5 -32t-20 -13.5t-19 17q4 11 11 33t17 50t21 58t20.5 58t17.5 50l12 33q2 7 8 18t14 18.5t17 7t16 -15.5q-2 -7 -8 -22.5t-13 -33.5t-12.5 -34.5l-7.5 -22.5q-2 -4 -2 -14t2 -13q6 -1 24.5 -8t41 -16.5t48 -20.5t46.5 -18t35 -10t16 2l98 379q2 11 10 13.5t16 -0.5t13.5 -10.5t2.5 -17.5l-69 -308v-42l10 5l17 8.5t16.5 8.5t11.5 6h14q-21 -16 -37 -29.5t-28 -27.5t-20.5 -30.5t-12.5 -39.5q-2 -9 -5.5 -27.5t-7.5 -42t-8.5 -49.5t-8.5 -49.5t-7.5 -42.5t-4.5 -28q-3 -2 -8 -5t-11.5 -5.5t-12 -3.5t-11.5 0v9v12.5v12.5v9q1 4 3.5 19.5z"},
    "5": {"horiz-adv-x": 450, "d": "M41.5 -6q-11.5 29 -14.5 62t1 65.5t11.5 56.5t18 35t19.5 1q1 -7 -2 -30t-5 -53.5t-2 -62.5t7 -56t24 -35.5t49 -0.5q46 16 61 41t9 56t-28 64.5t-47 66t-48 61t-32 48.5q-19 41 -15 70t20 48t39 29t42.5 11.5t32 -3t7.5 -14.5l226 70q15 4 20.5 -3t4 -18t-8 -21.5t-16.5 -14.5l-254 -84q-13 -4 -24 7t-18 21q-14 -3 -16.5 -16.5t-0.5 -29.5t8 -31t9 -21q5 -6 15 -19t22.5 -29.5t26.5 -34.5t26 -35.5t21.5 -31t15.5 -19.5q17 -25 19 -55t-7.5 -58.5t-29 -52.5t-44.5 -37.5t-52.5 -13.5t-54.5 20q-24 18 -35.5 47z"},
    "6": {"horiz-adv-x": 373, "d": "M41 -29.5q-13 17.5 -19 43t-6.5 54t2.5 56.5t8 52t9 38q1 7 8 29t16 51t20 63t21 66t19 58.5t14 42.5q2 5 5 13t7.5 13.5t12 7t17.5 -4.5v-43l-98 -324v-154q0 -8 9 -18.5t19.5 -17.5t19 -6.5t8.5 14.5q3 10 10.5 36.5t16.5 55t17 54.5t12 36q1 6 12 22t26 35t33.5 37t34.5 27.5t29.5 6t19.5 -28.5q6 -40 1.5 -83.5t-19.5 -85t-37.5 -77t-54 -60.5t-71.5 -34t-86 2q-23 6 -36 23.5zM187.5 49q-0.5 -8 -0.5 -17t0.5 -17t1.5 -11q28 10 54 38t44 63t26 72t3 66h-42q-1 0 -6 -8t-12.5 -19.5t-14 -23.5t-10.5 -20q-3 -7 -10 -24t-13 -34.5t-12 -32.5t-7 -21q-1 -3 -1.5 -11z"},
    "7": {"horiz-adv-x": 436, "d": "M99 439q-1 0 -10 -11.5t-20.5 -26t-24 -27.5t-21.5 -16t-12.5 8t3.5 45q1 8 8.5 20t16.5 22.5t18 18.5t13 10l339 76v-48q-7 -17 -16.5 -53.5t-22.5 -82t-27 -96t-26.5 -96.5t-22 -82.5t-13.5 -53.5q-2 -5 -4 -19t-4 -30t-4 -30t-2 -20q-6 -4 -18.5 -10.5t-23.5 -3.5v57l139 523z"},
    "8": {"horiz-adv-x": 478, "d": "M24.5 -16.5q-1.5 24.5 3.5 50t14.5 48.5t14.5 33q3 9 15.5 31.5t25.5 47.5t25.5 46.5t17.5 30.5q8 31 0 62.5t-19.5 65t-20 68.5t-2.5 70q5 4 14.5 9t19.5 9t20 7t15 4q13 1 32 1.5t37 0.5t30.5 -0.5t13.5 -1.5l42 -56q2 -1 -4 -7t-9 -7q-2 -1 -7.5 -1t-7.5 1q-1 0 -7.5 4.5t-13.5 9.5t-13 9.5t-8 4.5q-6 1 -19.5 1.5t-29.5 0.5t-30 -0.5t-19 -1.5q-13 -6 -14.5 -20t1 -30t7 -29.5l6.5 -19.5q3 -9 7.5 -23t8.5 -27.5t7 -23.5l4 -9h15l225 211q17 15 26 14t12 -11t-0.5 -23.5t-10.5 -22.5q-7 -10 -19.5 -19.5t-27.5 -18t-28.5 -17t-21.5 -16.5q-11 -9 -26 -23.5t-30.5 -29t-30.5 -30t-27 -28t-19.5 -20t-7.5 -8.5v-240q0 -24 -18 -51t-44 -46.5t-55 -26t-52 10.5q-16 12 -17.5 36.5zM90.5 -14q15.5 0 33 8.5t31 23.5t13.5 28v155l-13 28q-16 -21 -33.5 -48.5t-31 -58t-20 -61t-0.5 -57.5q5 -18 20.5 -18z"},
    "9": {"horiz-adv-x": 330, "d": "M217 482q-16 -12 -37.5 -25t-46 -22.5t-49.5 -13t-49 3.5q-15 32 -13 68.5t18.5 69t43.5 57t60 34t70 0t73 -44.5q9 -9 16.5 -10.5t12 -3.5t4.5 -7.5t-4 -21.5l-155 -590q9 -14 4 -23t-15.5 -14t-23.5 -6t-21 0v29l112 421v99zM76.5 512.5q-0.5 -7.5 -0.5 -16.5t0.5 -17t0.5 -12q16 -4 36.5 -1t41.5 12t39 23t30 31.5t14.5 37t-7.5 39.5q-20 15 -46 11.5t-48 -17t-39 -35.5t-21 -44q0 -4 -0.5 -11.5z"},
    ".": {"horiz-adv-x": 203, "d": "M57 -23q3 16 13 29.5t24 24t29 11.5t29 -7t22 -31q6 -14 1.5 -27.5t-15.5 -23.5t-25 -16.5t-28 -8.5t-26.5 2.5t-19.5 16.5q-7 14 -4 30z"},
    ",": {"horiz-adv-x": 239, "d": "M-12.5 -250.5q0.5 6.5 3.5 11t8 8t8 8.5q25 32 43.5 58t34 52.5t27 56.5t21.5 72q6 21 2.5 40t-9 35.5t-9 32.5t1.5 32q3 10 11.5 13t17 2t16.5 -5.5t12 -9.5q14 -15 16 -43.5t-4.5 -65t-21.5 -78.5t-33 -81t-38.5 -74t-39.5 -57t-35 -29.5t-26 7.5q-7 8 -6.5 14.5z"},
    ":": {"horiz-adv-x": 218, "d": "M79.5 93q5.5 20 15.5 37t24 29t27.5 16t25 -1t17.5 -23q5 -13 -1 -30t-18 -31.5t-27 -27t-29 -19t-25 -5t-12 13.5q-3 21 2.5 41zM12.5 387q-2.5 13 6 24t25 19.5t36 14t37.5 8t29.5 -1t13 -11.5t-11.5 -21l-71 -71q0 -1 -5.5 -1t-8.5 1q-3 2 -14 6.5t-14 7.5q-20 12 -22.5 25z"},
    ";": {"horiz-adv-x": 176, "d": "M-4 -208q36 49 58.5 101.5t31 111t-1.5 126.5q4 13 17.5 15t24.5 -2q15 -40 15.5 -81t-9.5 -81t-28.5 -78.5t-41 -75t-46.5 -70t-44 -63.5q-11 -15 -28.5 -15t-28.5 15q45 48 81 97zM46.5 324.5q13.5 9.5 30.5 13.5t34 4.5t29 -0.5q9 -22 -0.5 -42t-28 -35t-42 -21.5t-41.5 -0.5q-1 3 -1.5 10.5t-0.5 17t0.5 17.5t1.5 12q5 15 18.5 24.5zM78 299q0 -7 6 -7t6 7t-6 7t-6 -7z"},
    "!": {"horiz-adv-x": 310, "d": "M50 -21q6 12 16 17.5t20.5 3.5t15 -10t0 -22t-24.5 -35q-3 -3 -8 -2t-9 4t-7 7t-4 5q-5 20 1 32zM27.5 258q-7.5 56 -0.5 118.5t27 127t45.5 123t54.5 107.5t56 80t47.5 41.5t29.5 -8.5q2 -2 2 -7t-2 -7q-47 -54 -89 -118.5t-72.5 -135t-44 -145.5t-4.5 -149q0 -7 9 -26.5t16 -42t7 -43t-17 -29.5q-11 -4 -17.5 2t-11.5 12q-28 44 -35.5 100z"},
    "?": {"horiz-adv-x": 520, "d": "M272 -15.5q4 16.5 17.5 24.5t31 5t31.5 -24q7 -11 0 -24t-19.5 -21.5t-27 -10t-24.5 12.5q-13 21 -9 37.5zM38 257q-10 10 -17 23t-6.5 25.5t13.5 21.5l352 239q27 18 34 30.5t1 21.5t-23.5 14.5t-40.5 8.5t-49.5 3t-50 -1t-42.5 -3t-27 -5q-24 -6 -28.5 1.5t4.5 19.5t27.5 23t39.5 13q11 1 34 2t51 -1t56.5 -7t50 -16.5t31.5 -29.5t1 -46q0 -3 -4 -9.5t-8 -13.5t-8.5 -12.5t-6.5 -5.5l-309 -211q-7 -5 -16.5 -17.5t-13 -24.5t2 -21.5t27.5 -7.5q10 -2 36 -2h55h55t36 2q5 0 18 3t30 7.5t37 9.5t36.5 9.5t29.5 8t18 4.5h27q4 -11 2 -24.5t-15 -17.5q-37 -10 -91.5 -23t-114.5 -21t-117 -7t-98 23q-9 4 -19 14z"},
    "*": {"horiz-adv-x": 415, "d": "M55.5 -43q-0.5 7 -0.5 14t0.5 12t1.5 7l70 97v15q-2 0 -17 -0.5t-34 1.5t-37.5 8t-24.5 20q-3 5 -0.5 12.5t8.5 14t11.5 10.5t8.5 4h112q1 0 2.5 5t4.5 12t4.5 14t2.5 11q1 7 3.5 20.5t4.5 29.5t4 30t2 19q12 9 21 13q9 3 15.5 1.5t6.5 -14.5v-112q0 -14 10 -16t25 2.5t33.5 12.5t38 15.5t35.5 12t26 1.5q5 -7 1.5 -14t-10 -13.5t-12.5 -11.5l-6 -4q-7 -5 -25 -17t-38 -25t-38 -25t-26 -17q-4 -17 -0.5 -33t9.5 -30.5t11.5 -27.5t5.5 -24.5t-8.5 -21.5t-31.5 -18l-43 85q-8 17 -18.5 10t-22.5 -24.5t-24.5 -39.5t-24 -36.5t-21 -16.5t-14.5 22q-1 3 -1.5 10z"},
    "#": {"horiz-adv-x": 661, "d": "M273 -11l8.5 42.5l8.5 42.5t5 28q1 2 1 7t-1 6q-3 1 -20.5 -0.5t-35.5 -6t-33.5 -10t-15.5 -11.5v-111h-36l-27 98q-2 4 -14.5 1t-28.5 -8.5t-32 -8.5t-24 2q-14 9 -11.5 17.5t13.5 17t29 18t34.5 20t30 23.5t17.5 30q0 5 2.5 15.5t4 23t4 23.5t2.5 16h-126l-14 21q9 15 23.5 20t31 6t33 0.5t32 1t28.5 7.5t20 22q3 3 8 14.5t12.5 27.5t15.5 34.5t14.5 34t12 27t8.5 16.5q10 17 21 37t24 37.5t30 31.5t38 21q9 3 16.5 -1.5t10.5 -12.5q-54 -57 -91.5 -125.5t-62.5 -141.5q8 -1 30 -1t45.5 1.5t43 4.5t22.5 8l126 239q1 2 6.5 8t12 12.5t13.5 13t10 7.5q2 2 7.5 2t7.5 -2v-41l-114 -211l-13 -14q16 -3 31.5 0t31 7t31 6.5t33.5 0.5q6 -18 -1.5 -26.5t-23.5 -13.5t-38 -11t-44.5 -20t-43 -40t-32.5 -71q-1 -2 -1 -7.5t1 -7.5q31 -4 62.5 1.5t63.5 12.5t63.5 13t63.5 1v-42l-267 -41q-6 -1 -12 -18.5t-12 -43t-13 -54t-14 -49.5t-15.5 -32t-18.5 -1q-2 1 -4 5l-4 8l-4 9q-2 5 -2 7q2 7 6 27zM248 156q34 8 60 25.5t39 46t5 72.5q-44 -4 -72 -9t-46.5 -17.5t-29.5 -36.5t-22 -65v-28q32 4 66 12z"},
    "/": {"horiz-adv-x": 415, "d": "M5 -31.5q0 5.5 1 7.5l8 30q6 21 12.5 47.5t14 56t14.5 55.5t13 47t9 31q15 45 34.5 92t43.5 92t50.5 87t54.5 80q8 11 23 28t30.5 32.5t28.5 26.5t16 11h28v-28q-7 -7 -25 -27t-38.5 -42.5t-38.5 -42.5t-24 -28q-3 -3 -7 -8.5t-8.5 -12.5t-8.5 -13t-5 -8q-5 -14 -17.5 -42.5t-28 -64.5t-32 -75.5t-32 -76t-27 -65t-17.5 -43.5q-9 -20 -8.5 -46t0 -50.5t-6 -47.5t-27.5 -38q-2 1 -6.5 5t-9 8.5t-8.5 9t-5 6.5q-1 1 -1 6.5z"},
    "\\": {"horiz-adv-x": 436, "d": "M143 119q-42 49 -72 105.5t-44.5 118t-5.5 124.5q11 5 24.5 2.5t17.5 -15.5q11 -79 33.5 -146t60 -125t91 -106t125.5 -87q28 -4 40 -16t11.5 -23t-14 -17t-37.5 -1q-9 5 -29.5 19t-42.5 29.5t-42 30t-28 20.5q-46 38 -88 87z"},
    "(": {"horiz-adv-x": 330, "d": "M85.5 42q-44.5 47 -60.5 104t-9 119t29.5 125t55 122.5t67.5 110.5q12 15 21 25.5t18 14t20.5 1t25.5 -13.5q-27 -37 -59.5 -85t-61 -102t-48.5 -110.5t-22 -111t18.5 -105t73.5 -90.5q4 -3 19 -11t35 -18t41 -22t35.5 -24t19 -21.5t-8.5 -16.5q-4 1 -16 5l-26 8q-14 5 -26 9.5t-16 6.5q-81 33 -125.5 80z"},
    ")": {"horiz-adv-x": 380, "d": "M19.5 -37.5q5.5 10.5 8.5 13.5q90 65 154 130.5t95 142t26.5 167.5t-50.5 207l-8 15q-6 12 -13.5 26.5t-13.5 25.5l-7 17q-1 0 -1 6t1 8q10 4 18 3t15 -6t13 -12.5t10 -13.5q57 -94 75 -187t0.5 -180.5t-69 -168.5t-132.5 -152q-1 -1 -12 -8.5t-24 -16.5t-27 -18t-21 -14q-13 -9 -22 -12q-8 -3 -14.5 -1.5t-6.5 13.5q0 5 5.5 15.5z"},
    "{": {"horiz-adv-x": 464, "d": "M72 -170.5q-16 11.5 -26 26.5t-11 32t13 37q6 8 20 25.5t30.5 39.5t35 46.5t35 46.5t29.5 39.5t18 26.5q31 45 32.5 71.5t-13 42t-40 25t-48 18t-36.5 20.5t-7 34q19 5 43 9t48 11t44.5 19t33.5 32q2 1 2 7t-2 8l-140 98q-9 6 -12.5 21t-4.5 30.5t0 29t2 17.5q15 16 35.5 37t44.5 42.5t51.5 41t55.5 33t55.5 18t53.5 -3.5q5 -10 -14 -22t-49.5 -27t-66.5 -33.5t-64 -40t-42.5 -47t-3.5 -55.5q7 -16 22.5 -31t35 -28.5t40 -27.5t35 -28t22 -28t0.5 -28.5t-30 -31.5t-69 -35q40 -31 51.5 -65.5t4.5 -70t-27 -71t-45.5 -68.5t-51.5 -63.5t-44 -55.5q-23 -31 -22 -52.5t18 -34t47 -18t66 -6t74 1.5t72 4.5t59.5 5t37.5 1.5q11 -16 2 -27.5t-31.5 -17.5t-55 -9t-68.5 -3.5t-72 1t-66 4.5l-50 5t-25 4q-16 6 -32 17.5z"},
    "}": {"horiz-adv-x": 428, "d": "M70 -216.5q11 10.5 34.5 19t54.5 15.5t63.5 16.5t60.5 22.5t46.5 32.5t22 46.5t-15 65.5t-63 88.5t-124.5 116q-10 27 -9 50.5t11.5 44t28.5 39t41 35.5l-141 29q-14 3 -21 15.5t-7.5 28.5t4 31t11.5 22q115 78 172 130t52.5 87t-73.5 56.5t-208 36.5q-5 9 14 15.5t50.5 9.5t71.5 1t78 -11t68 -25t44 -41.5t5 -61.5t-50 -83q-7 -6 -20 -15.5t-29.5 -22t-34.5 -27t-34.5 -26.5t-30 -22t-19.5 -14q-19 -15 -14.5 -25.5t28.5 -16.5q62 -17 124.5 -17.5t128.5 2.5q8 -16 -0.5 -28t-27 -23.5t-43 -21.5t-48.5 -20.5t-46 -22t-32.5 -25.5t-9 -31t22.5 -38l184 -183q24 -24 25 -52.5t-15 -57.5t-45 -57t-63.5 -51.5t-71.5 -41.5t-68.5 -27.5t-54.5 -8.5t-30 15q-8 16 3 26.5z"},
    "[": {"horiz-adv-x": 527, "d": "M20 -45.5q0 5.5 1 7.5q15 83 33.5 169.5t32.5 173.5t20 173.5t-2 171.5q1 3 16.5 8.5t39 13t51.5 15.5t54.5 16.5t48 16.5t29.5 14q5 4 17.5 13.5t26 20.5t25 21.5t15.5 15.5h43v-14l-70 -70l-226 -98l-83 -591q48 -5 99.5 -2.5t104 7t104 8t98.5 1.5q4 -11 2 -24.5t-16 -17.5q-9 0 -27.5 0.5t-41.5 0.5h-100q-23 0 -41.5 -0.5t-27.5 -0.5q-17 -1 -39 -9t-44.5 -17.5t-46 -19.5t-43 -16t-33.5 -5.5t-19 10.5q-1 2 -1 7.5z"},
    "]": {"horiz-adv-x": 485, "d": "M221 -34.5q-28 5.5 -57.5 7.5t-62.5 2t-73 1q-4 2 -8.5 9t-6 14t1.5 13t13 6h267q1 74 4.5 156.5t12.5 166.5t25.5 166.5t42.5 156.5h-295l-57 15q-8 2 -3.5 6.5t14 9t19.5 8.5t12 4q5 0 21.5 -3t35 -5t35 -4.5t20.5 -2.5q11 0 36 -0.5t52 -0.5t50.5 0.5t31.5 0.5q13 1 25 7t23.5 11.5t23.5 9.5t25 1v-29q-35 -75 -52.5 -145t-25.5 -140.5t-11 -145t-8 -159.5q-2 -20 1 -43t6 -44t3 -39.5t-7.5 -29t-25 -11.5t-48.5 12q-32 13 -60 18.5z"},
    "-": {"horiz-adv-x": 386, "d": "M6 170q2 5 7 8.5t11 5t11 2.5q10 2 33.5 6.5t52 10.5t61 12t62 11.5t53 9.5t33.5 7q19 3 24 -3.5t2 -17t-10.5 -21t-15.5 -15.5q-23 3 -55 -1t-65.5 -11t-67.5 -15t-62 -12t-48 -2t-26 13q-2 7 0 12z"},
    "_": {"horiz-adv-x": 752, "d": "M13 -41q2 5 7 8.5t11 5.5t11 3q16 3 48.5 11t74 16.5t87.5 17.5t88 17t74.5 14.5t49.5 7.5q14 2 36 3.5t47.5 2t52 0.5t48 -0.5t36.5 -2t19 -3.5l28 -14q1 -15 -12 -21.5t-34 -8t-46 1t-49 6t-43 6.5t-27 2q-14 -2 -44 -7.5t-67 -12.5t-78.5 -14.5t-79 -14t-67 -13t-43.5 -8.5q-4 -1 -21.5 -9.5t-38.5 -15t-40 -6.5t-27 16q-3 7 -1 12z"},
    "'": {"horiz-adv-x": 127, "d": "M27 576.5q-4 27.5 -5.5 61.5t0 69.5t8.5 63t22.5 42.5t39.5 7q0 -5 0.5 -17.5t0.5 -26t-0.5 -25.5t-0.5 -17q-2 -13 -4.5 -33t-6 -41.5t-6 -43t-5 -38.5t-4.5 -28.5t-3 -12.5l-14 -13l-14 13q-4 12 -8 39.5z"},
    "$": {"horiz-adv-x": 548, "d": "M267 -45.5q-5 5.5 -7 7.5q-1 19 -1 41t-2 44t-7.5 43.5t-18.5 40.5q-10 17 -27 29.5t-35.5 24t-36.5 23.5t-32.5 26t-24.5 33t-12 46q-2 19 -2.5 49t-0.5 59.5t0.5 51t2.5 23.5l14 14q-43 42 -53 82.5t5.5 71t54 47t91.5 10.5v112q18 6 27.5 0.5t14.5 -19t6 -31t1.5 -35t2 -33t4.5 -23.5q6 -9 17 -21.5t25 -27.5t26 -31.5t20.5 -33.5t8.5 -34t-12 -34q-13 34 -34.5 68.5t-50.5 56.5q-2 -45 3 -98.5t12 -97.5q1 -1 6 -6.5t8 -7.5q51 -33 104 -66.5t93.5 -66.5t61 -63t8 -54t-65 -39.5t-159.5 -20.5q0 -7 3 -26t6 -42t5.5 -46.5t-1 -39.5t-13 -21.5t-28.5 7.5q-2 2 -7 7.5zM295 179.5q6 -5.5 7 -7.5q87 -7 129 -0.5t50.5 23t-10 39.5t-52.5 49t-76.5 52t-82.5 48q-3 -25 -4 -50.5t1.5 -51t9.5 -50.5t20 -45q2 -1 8 -6.5zM208.5 203.5q12.5 -7.5 22.5 -2.5q1 3 1 13.5t-1 14.5q-1 9 -5 32.5t-8 51t-8.5 51.5t-6.5 33q-21 25 -46 46t-52 39q-20 -35 -21 -74.5t12 -76t37.5 -67.5t55.5 -50q7 -3 19.5 -10.5zM118 527q9 -8 20 -17.5t21.5 -17t15.5 -10.5q1 -2 6.5 -2t7.5 2q4 46 0 91t-14 91q-22 16 -40 17t-32 -7t-21.5 -23.5t-8 -35t6.5 -40t25 -38.5q4 -2 13 -10zM85 495q0 -7 7 -7q4 0 4 7t-4 7q-7 0 -7 -7z"},
    "+": {"horiz-adv-x": 676, "d": "M270 108q7 40 4 78q-26 7 -48.5 2.5t-45 -14.5t-44.5 -22.5t-43.5 -22.5t-43 -15t-43.5 1q-5 9 1 19t16.5 17.5t22.5 13.5t17 7q8 3 24.5 7.5t37.5 10t43.5 11.5t43.5 12t37.5 10t24.5 6q1 10 2 30.5t3.5 43.5t8 44t14.5 36q1 3 6.5 8.5t7.5 5.5q4 0 8.5 -2t9 -3.5t7.5 -4.5t3 -4v-140q8 -1 36.5 2.5t65 8t75.5 8t70.5 2t50 -9t11.5 -25.5q0 -2 -5 -7.5t-8 -7.5q-7 0 -25.5 0.5t-39 0.5t-38 -0.5t-24.5 -0.5l-47.5 -2.5t-55 -4t-46 -4t-20.5 -2.5l-14 -15l-2 -12q-1 -11 -4 -29.5t-5 -41.5l-8 -46q-2 -23 -5 -44.5t-4 -36.5q0 -10 -1 -20t-5 -17t-12.5 -8.5t-23.5 2.5q-1 6 -1.5 20t-0.5 29.5t0.5 30t1.5 19.5q3 36 10 76z"},
    "=": {"horiz-adv-x": 759, "d": "M47 87.5q11 8.5 26 14.5t31 8.5t21 2.5l521 70h97q6 -9 5.5 -17t-5.5 -13.5t-11.5 -9t-15.5 -3.5h-183l-449 -84q-15 -3 -25.5 -1.5t-17.5 14.5q-5 10 6 18.5zM34.5 246q5.5 6 6.5 7q63 22 137 39.5t150 29.5t151 16t139 -1q3 -11 1 -24.5t-16 -18.5q-62 8 -132.5 3.5t-142 -15.5t-138 -27t-121.5 -31h-41q-1 2 -1 7.5t1 6.5q1 2 6.5 8z"},
    "~": {"horiz-adv-x": 576, "d": "M119 578q24 17 49.5 19t52 -7.5t53.5 -20t53 -17t51 1.5q10 7 26.5 23t34.5 33t34.5 30.5t26 15.5t9 -13t-16.5 -53q-23 -25 -48 -44t-51.5 -32t-53 -17.5t-52.5 2.5q-18 5 -42 17.5t-48.5 20.5t-48.5 1.5t-41 -39.5l-33 19q21 43 45 60z"},
    "^": {"horiz-adv-x": 691, "d": "M509.5 416.5q-29.5 9.5 -53.5 21.5t-39.5 34.5t-14.5 68.5l-173 -165q-11 -2 -17 2.5t-7.5 13.5t-0.5 17.5t3 13.5q1 2 0 2t2 4t12 15t31.5 34t59 62t94.5 100q2 3 7 1.5t6 -4.5q20 -28 29.5 -49.5t16 -37.5t12 -29.5t18.5 -26t35.5 -26t61.5 -29.5l-23 -53q-30 21 -59.5 30.5z"},
    "%": {"horiz-adv-x": 851, "d": "M272.5 26.5q-19.5 47.5 -21 98.5t11.5 104t32 98q-2 1 -17.5 -8.5t-35.5 -22.5t-37.5 -25t-22.5 -14q-15 -6 -35 -9t-41 -3t-40 5.5t-31 16t-15.5 29t8.5 46.5q1 1 7 7.5t13.5 13t13.5 13t8 7.5l3 6q3 3 5 7.5l4 9t3 5.5q32 4 65 -4.5t65 -19.5t59.5 -17.5t48.5 -0.5q6 8 20 24t31.5 35.5t38 41t38.5 40.5t33 34.5t22 21.5q42 38 88 58t85.5 25t69.5 -4t39 -28.5t-4 -49t-59.5 -65.5t-130.5 -77t-214 -83q-20 -8 -36 -35t-25.5 -65t-13 -81.5t1.5 -81.5t19.5 -66.5t39.5 -36.5q19 -7 44.5 -6t50.5 8t48 17t39 23q33 24 44 45.5t11 40.5t-6 37t-7 35t7 33.5t36 33.5q29 17 65.5 20t67.5 -8t47 -39t2 -72q-2 -13 -14 -21.5t-28 -15.5t-33.5 -12t-33.5 -9t-28.5 -7t-16.5 -5q-1 -1 -6 -7l-9 -14q-4 -7 -8 -13.5t-5 -7.5q-22 -21 -59 -46t-79 -40.5t-84 -18.5t-73 20q-46 32 -65.5 79.5zM418 406q-2 -4 -4.5 -8.5t-3.5 -9t-1 -5.5h12.5h14.5q9 2 27.5 8.5t39 13t37.5 12.5t23 8q81 37 123 72.5t51 61t-12 36t-64 -3.5t-104.5 -56.5t-134.5 -123.5q-2 -1 -4 -5zM710.5 130q22.5 -1 36.5 10.5t18.5 30.5t-4.5 32.5t-33 15.5t-67 -18q-17 -9 -15 -19t15 -24q27 -27 49.5 -28zM83.5 318.5q-0.5 -6.5 -0.5 -13t0.5 -12.5t1.5 -8q40 -7 70 0.5t56 41.5q-4 1 -22.5 6t-40.5 8.5t-41.5 1.5t-21.5 -16q-1 -2 -1.5 -8.5zM195.5 374q-2.5 1 -5.5 1t-5.5 -1t-2.5 -5q2 -6 7.5 -6t7.5 6q1 4 -1.5 5z"},
    "@": {"horiz-adv-x": 823, "d": "M42.5 43.5q-16.5 35.5 -21.5 77t-0.5 82.5t14.5 68q22 66 52.5 123t71.5 104.5t93.5 86t120.5 65.5q25 11 56 16t63 5t63 -5t56 -16q69 -28 109.5 -69t57 -88t10 -97.5t-30.5 -99t-65 -91.5t-95 -74q-29 -18 -53.5 -23t-47.5 -1t-46 14t-49 23q-13 6 -26.5 4.5t-27.5 -7.5t-29 -13t-29 -11t-28.5 -2t-29.5 16q-7 31 6.5 69.5t39.5 76.5t61.5 70.5t72.5 52t71.5 20.5t58.5 -23q5 -5 -7 -12.5t-33.5 -17t-48.5 -21t-54 -23.5t-49 -25.5t-33 -26.5q-28 -34 -34.5 -60t3.5 -37.5t36.5 -6.5t64.5 34q9 6 16.5 23.5t16.5 33t21 21.5t31 -8q2 -11 -2.5 -24.5l-9 -27t-7.5 -25.5t4 -22q9 -14 25.5 -18.5t35.5 -1.5t39.5 10t39.5 16.5t33.5 19t23.5 16.5q57 49 80.5 99t21 96t-26.5 86.5t-63 70.5t-89.5 47.5t-104.5 18.5t-109 -18.5t-102 -60.5q-28 -26 -61.5 -65.5t-64 -86t-52.5 -98t-27 -101t12.5 -93.5t65.5 -77q2 -1 9 -5t16 -8.5l18 -9t13 -5.5q42 -18 53 -34t-5 -21.5t-54 3t-91 38.5q-33 18 -49.5 53.5z"},
    "|": {"horiz-adv-x": 148, "d": "M79 567q8 3 16.5 -4.5t14.5 -24t3 -42.5q-2 -11 -6 -43.5t-10 -75.5t-13 -92t-12 -92.5t-9.5 -76t-5.5 -42.5q-1 -7 -1.5 -23t-0.5 -33.5t0.5 -33.5t1.5 -22q-2 -3 -6.5 -9t-10.5 -11t-13 -8.5t-13 -0.5q-3 2 -8.5 7.5t-5.5 6.5l70 606q1 11 9 14z"},
    "`": {"horiz-adv-x": 188, "d": "M24 552.5q2 10.5 10.5 8.5t22 -14t29.5 -26t33 -26t32 -13q2 -19 -4.5 -27t-18.5 -7t-27 8.5t-28.5 16.5t-25.5 19.5t-18 17.5q-7 32 -5 42.5z"}
  },
  "Segment": {
    " ": {"horiz-adv-x": 3510, "d": ""},
    "!": {"horiz-adv-x": 3510, "d": "M3218 0v585h585v-585h-585zM2340 0v4096h585v-4096h-585z"},
    "#": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v4096h585v-1756h1755v1756h585v-4096h-2925z"},
    "$": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1755h585v-2340h-2925zM0 1755v2341h2925v-586h-2340v-1755h-585z"},
    "%": {"horiz-adv-x": 3510, "d": "M2340 0v585h585v-585h-585zM0 3510v586h585v-586h-585zM0 0v2340h2340v1756h585v-2341h-2340v-1755h-585z"},
    "'": {"horiz-adv-x": 3510, "d": "M2340 1755v2341h585v-2341h-585z"},
    "(": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-2925h2340v-585h-2925z"},
    ")": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v2925h-2340v586h2925v-4096h-2925z"},
    "*": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 1755v2341h2925v-2341h-2925z"},
    "+": {"horiz-adv-x": 3510, "d": "M1170 877v585h585v-585h-585zM0 1755v585h2925v-585h-2925zM1170 2633v585h585v-585h-585z"},
    ",": {"horiz-adv-x": 3510, "d": "M3218 -585v1170h585v-1170h-585z"},
    "-": {"horiz-adv-x": 3510, "d": "M0 1755v585h2925v-585h-2925z"},
    ".": {"horiz-adv-x": 3510, "d": "M3218 0v585h585v-585h-585z"},
    "/": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1756h585v-2341h-2340v-1755h-585z"},
    "0": {"horiz-adv-x": 3510, "d": "M2340 585v2925h-1755v-2925h1755zM0 0v4096h2925v-4096h-2925z"},
    "1": {"horiz-adv-x": 3510, "d": "M2340 0v4096h585v-4096h-585z"},
    "2": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1170h-2340v586h2925v-2341h-2340v-1170h2340v-585h-2925z"},
    "3": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v585h2340v1170h-2340v586h2925v-4096h-2925z"},
    "4": {"horiz-adv-x": 3510, "d": "M2340 0v1755h-2340v2341h585v-1756h1755v1756h585v-4096h-585z"},
    "5": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v2341h2925v-586h-2340v-1170h2340v-2340h-2925z"},
    "6": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v4096h2925v-586h-2340v-1170h2340v-2340h-2925z"},
    "7": {"horiz-adv-x": 3510, "d": "M2340 0v3510h-2340v586h2925v-4096h-585z"},
    "8": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-4096h-2925z"},
    "9": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v585h2340v1170h-2340v2341h2925v-4096h-2925z"},
    ":": {"horiz-adv-x": 3510, "d": "M3218 0v585h585v-585h-585zM0 1755v585h2925v-585h-2925z"},
    ";": {"horiz-adv-x": 3510, "d": "M3218 -585v1170h585v-1170h-585zM0 1755v585h2925v-585h-2925z"},
    "=": {"horiz-adv-x": 3510, "d": "M0 0v585h2925v-585h-2925zM0 1755v585h2925v-585h-2925z"},
    "?": {"horiz-adv-x": 3510, "d": "M3218 0v585h585v-585h-585zM0 0v2340h2340v1170h-2340v586h2925v-2341h-2340v-1755h-585z"},
    "@": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v2340h2340v1170h-2340v586h2925v-4096h-2925z"},
    "A": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-4096h-585v1755h-1755v-1755h-585z"},
    "B": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-4096h-2925z"},
    "C": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-2925h2340v-585h-2925z"},
    "D": {"horiz-adv-x": 3510, "d": "M0 0v2340h585v-1755h1755v2925h-2340v586h2925v-4096h-2925z"},
    "E": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-1170h2340v-585h-2340v-1170h2340v-585h-2925z"},
    "F": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-1170h2340v-585h-2340v-1755h-585z"},
    "G": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-2925h1755v1755h585v-2340h-2925z"},
    "H": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-1756h1755v1756h585v-4096h-585v1755h-1755v-1755h-585z"},
    "I": {"horiz-adv-x": 3510, "d": "M2340 0v4096h585v-4096h-585z"},
    "J": {"horiz-adv-x": 3510, "d": "M0 0v2340h585v-1755h1755v3511h585v-4096h-2925z"},
    "K": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-1756h1755v1756h585v-2341h-2340v-1170h2340v-585h-2925z"},
    "L": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-3511h2340v-585h-2925z"},
    "M": {"horiz-adv-x": 3510, "d": "M0 0v2340h585v-2340h-585zM2340 0v2340h585v-2340h-585zM0 3510v586h2925v-586h-2925z"},
    "N": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-4096h-585v3510h-1755v-3510h-585z"},
    "O": {"horiz-adv-x": 3510, "d": "M2340 585v2925h-1755v-2925h1755zM0 0v4096h2925v-4096h-2925z"},
    "P": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-2341h-2340v-1755h-585z"},
    "Q": {"horiz-adv-x": 3510, "d": "M0 0v585h2925v-585h-2925zM2340 2340v1170h-1755v-1170h1755zM0 1755v2341h2925v-2341h-2925z"},
    "R": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-2341h-585v1755h-1755v-3510h-585z"},
    "S": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v2341h2925v-586h-2340v-1170h2340v-2340h-2925z"},
    "T": {"horiz-adv-x": 3510, "d": "M2340 0v3510h-2340v586h2925v-4096h-585z"},
    "U": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-3511h1755v3511h585v-4096h-2925z"},
    "V": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-1756h1755v1756h585v-2341h-2340v-1755h-585z"},
    "W": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v4096h585v-1756h1755v1756h585v-4096h-2925z"},
    "X": {"horiz-adv-x": 3510, "d": "M2340 0v1755h-2340v2341h585v-1756h2340v-2340h-585z"},
    "Y": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v2341h585v-1756h1755v1756h585v-4096h-2925z"},
    "Z": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1170h-2340v586h2925v-2341h-2340v-1170h2340v-585h-2925z"},
    "[": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-2925h2340v-585h-2925z"},
    "\\": {"horiz-adv-x": 3510, "d": "M2340 0v1755h-2340v2341h585v-1756h2340v-2340h-585z"},
    "]": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v2925h-2340v586h2925v-4096h-2925z"},
    "^": {"horiz-adv-x": 3510, "d": "M0 1755v2341h2925v-2341h-585v1755h-1755v-1755h-585z"},
    "_": {"horiz-adv-x": 3510, "d": "M0 0v585h2925v-585h-2925z"},
    "`": {"horiz-adv-x": 3510, "d": "M0 1755v2341h585v-2341h-585z"},
    "a": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v2340h2340v1170h-2340v586h2925v-4096h-2925z"},
    "b": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v4096h585v-1756h2340v-2340h-2925z"},
    "c": {"horiz-adv-x": 3510, "d": "M0 0v2340h2925v-585h-2340v-1170h2340v-585h-2925z"},
    "d": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v2340h2340v1756h585v-4096h-2925z"},
    "e": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-2341h-2340v-1170h2340v-585h-2925z"},
    "f": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-1170h2340v-585h-2340v-1755h-585z"},
    "g": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v585h2340v1170h-2340v2341h2925v-4096h-2925z"},
    "h": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-1756h2340v-2340h-585v1755h-1755v-1755h-585z"},
    "i": {"horiz-adv-x": 3510, "d": "M2340 0v2340h585v-2340h-585z"},
    "j": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v3511h585v-4096h-2925z"},
    "k": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-1170h2340v-2340h-585v1755h-1755v-1755h-585z"},
    "l": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-4096h-585z"},
    "m": {"horiz-adv-x": 3510, "d": "M0 0v2340h585v-2340h-585zM2340 0v2340h585v-2340h-585z"},
    "n": {"horiz-adv-x": 3510, "d": "M0 0v2340h2925v-2340h-585v1755h-1755v-1755h-585z"},
    "o": {"horiz-adv-x": 3510, "d": "M2340 585v1170h-1755v-1170h1755zM0 0v2340h2925v-2340h-2925z"},
    "p": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM0 0v4096h2925v-2341h-2340v-1755h-585z"},
    "q": {"horiz-adv-x": 3510, "d": "M2340 2340v1170h-1755v-1170h1755zM2340 0v1755h-2340v2341h2925v-4096h-585z"},
    "r": {"horiz-adv-x": 3510, "d": "M0 0v2340h2925v-585h-2340v-1755h-585z"},
    "s": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v2341h2925v-586h-2340v-1170h2340v-2340h-2925z"},
    "t": {"horiz-adv-x": 3510, "d": "M0 0v4096h585v-1756h2340v-585h-2340v-1170h2340v-585h-2925z"},
    "u": {"horiz-adv-x": 3510, "d": "M0 0v2340h585v-1755h1755v1755h585v-2340h-2925z"},
    "v": {"horiz-adv-x": 3510, "d": "M0 1755v2341h585v-1756h1755v1756h585v-2341h-2925z"},
    "w": {"horiz-adv-x": 3510, "d": "M0 0v585h2925v-585h-2925zM0 1755v2341h585v-2341h-585zM2340 1755v2341h585v-2341h-585z"},
    "x": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1756h585v-2341h-2340v-1755h-585z"},
    "y": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v1170h-2340v2341h585v-1756h1755v1756h585v-4096h-2925z"},
    "z": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1170h-2340v586h2925v-2341h-2340v-1170h2340v-585h-2925z"},
    "{": {"horiz-adv-x": 3510, "d": "M0 0v4096h2925v-586h-2340v-2925h2340v-585h-2925z"},
    "|": {"horiz-adv-x": 3510, "d": "M2340 0v4096h585v-4096h-585z"},
    "}": {"horiz-adv-x": 3510, "d": "M0 0v585h2340v2925h-2340v586h2925v-4096h-2925z"},
    "~": {"horiz-adv-x": 3510, "d": "M0 0v2340h2340v1756h585v-2341h-2340v-1755h-585z"}
  }
};