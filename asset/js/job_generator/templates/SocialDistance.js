/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class SocialDistance extends square_pitch
{

  static get layout_methods()
  {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "corner,side" )
    {
      return [
        new Vector( -0.01, 1.05 ),
        new Vector( -0.01, 0.25 )
      ];
    }
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( -0.01, 1.05 ),
        new Vector( -0.01, -0.05 )
      ];
    }
    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( -0.01, 1.05 ),
        new Vector( -0.01, -0.05 ),
        new Vector( 1.03, 0.25 )
      ];
    }
  }

  static template_type = "Event";
  static template_title = "Social Distance";
  static template_id = "event_social_distance";
  static template_image = "img/templates/social_distance_black.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.show_template_type = false;
    
    this.options["Ignore lines"] = {
      name: "Skip ignored lines",
      get val()
      {
        return true;
      },
      set val(v)
      { },
      type: "bool",
      configurable: false
    };

    this.options.addLineLengthInSides = {
      name: "addLineLengthInSides",
      get val()
      {
        return false;
      },
      set val( v )
      {},
      type: "bool"
    };
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.Length.val = 10;
    this.options.Width.val = 10;

    this.options.box_space = {
      configurable: true,
      name: "Box space X",
      _val: 2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v < 0.05 ? 0.05 : v;
      },
      type: "float"
    };
    this.options.box_space_y = {
      configurable: true,
      name: "Box space Y",
      _val: 2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v < 0.05 ? 0.05 : v;
      },
      type: "float",
      prev_sibling: "box_space"
    };

    this.options.draw_circles = {
      configurable: true,
      name: "Draw circles",
      val: false,
      type: "bool",
      prev_sibling: "box_space_y"
    };

    this.options.box_width = {
      configurable: true,
      get name()
      {
        if( this_class.options.draw_circles.val )
          return  "Circle diameter";
        else
          return  "Box width";
      },
      _val: 1,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v < 0 ? 0 : v;
      },
      type: "float",
      prev_sibling: "draw_circles"
    };
    this.options.box_length = {
      get configurable()
      {
        return !this_class.options.draw_circles.val;
      },
      name: "Box length",
      _val: 1,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = v < 0 ? 0 : v;
      },
      type: "float",
      prev_sibling: "box_width"
    };

    this.options.translate_every_other = {
      configurable: true,
      name: "Shift every other row",
      val: false,
      type: "bool",
      prev_sibling: "box_length"
    };

    this.options.only_corners = {
      get configurable()
      {
        return !this_class.options.draw_circles.val;
      },
      name: "Only corners",
      val: false,
      type: "bool",
      prev_sibling: "box_length"
    };
    this.options.corner_size = {
      get configurable()
      {
        return this_class.options.only_corners.val;
      },
      name: "Corner size",
      _val: 0.3,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        this._val = (v < (this_class.options.LineWidth.val * 2) ? (this_class.options.LineWidth.val * 2) : v);
      },
      type: "float",
      prev_sibling: "only_corners"
    };

  }

  job_name( translate_dict )
  {
    return translate_dict[this.template_title];
  }

  draw( )
  {

    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];
    {
      var p = this.drawing_points;
      var c1 = p[0];
      var c2 = p[3];
      var c3 = p[4];
      var c4 = p[7];
    }


    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();

    let box_width = this.options.box_width.val;
    let box_length = this.options.box_length.val;

    if( this.options.draw_circles.val )
      box_length = box_width;

    if( box_length <= 0 )
      return;
    if( box_width <= 0 )
      return;

    let g1 = (new Line( c1, c2 )).unit_vector;
    let g2 = (new Line( c2, c3 )).unit_vector;

    let vertical_boxes = ((this.options.Length.val + this.options.box_space.val) / (box_length + this.options.box_space.val)) - 1;
    let vertical_boxes_2 = vertical_boxes;
    if( this.options.translate_every_other.val )
      vertical_boxes_2 = (((this.options.Length.val - (this.options.box_space.val / 2 + box_length / 2)) + this.options.box_space.val) / (box_length + this.options.box_space.val)) - 1;

    let horizontal_boxes = ((this.options.Width.val + this.options.box_space_y.val) / (box_width + this.options.box_space_y.val)) - 1;
    let horizontal_boxes_2 = horizontal_boxes;
    if( this.options.translate_every_other.val )
      horizontal_boxes_2 = (((this.options.Width.val - (this.options.box_space_y.val / 2 + box_width / 2)) + this.options.box_space_y.val) / (box_width + this.options.box_space_y.val)) - 1;


    //let vertical_boxes = Math.floor( this.options.Length.val / (box_width + this.options.box_space.val) );
    /*if( (this.options.Length.val - (box_width + this.options.box_space.val)) > box_width )
     vertical_boxes++;*/
    //let horizontal_boxes = Math.floor( this.options.Width.val / (box_length + this.options.box_space.val) );
    /*if( (this.options.Width.val - (box_length + this.options.box_space.val)) > box_length )
     horizontal_boxes++;*/

    //this.tasks.push( new LineTask( 0, [ c1, c1.add( g1 ), c1.add( g2 ) ], false, true ) );

    let centers = [ ];
    for( let v = 0; v <= vertical_boxes; v++ )
    {
      let row = [ ];
      for( let h = 0; h <= horizontal_boxes; h++ )
      {
        let shift_row = 0;
        if( this.options.translate_every_other.val && h >= horizontal_boxes_2 && (v % 2) )
          continue;
        if( this.options.translate_every_other.val && (v % 2) )
          shift_row = this.options.box_space_y.val / 2 + box_width / 2;
        let next_point = c1.add( g2.multiply( v * (box_length + this.options.box_space.val) + box_length / 2 ) ).add( g1.multiply( h * (box_width + this.options.box_space_y.val) + box_width / 2 + shift_row ) );
        row.push( next_point );
      }
      centers.push( row );
    }


    let reverseIt = false;
    for( let r = 0; r < centers.length; r++ )
    {
      if( reverseIt )
        centers[r] = centers[r].reverse();
      for( let c = 0; c < centers[r].length; c++ )
      {
        let center = centers[r][c];
        if( this.options.draw_circles.val )
        {
          let circle_center = center;
          let start_circle_point = circle_center.add( g2.multiply( -box_width / 2 ) );
          let circle_guide = (new Line( circle_center, start_circle_point )).as_vector;
          let t = new CircleTask( this.tasks.length, circle_guide, circle_center, true ); // id, guide, center, paint
          this.tasks.push( t );
        }
        else
        {
          let bp1, bp2;
          if( !reverseIt )
          {
            bp1 = center.add( g2.multiply( -box_length / 2 ) ).add( g1.multiply( -box_width / 2 ) );
            bp2 = center.add( g2.multiply( -box_length / 2 ) ).add( g1.multiply( box_width / 2 ) );
          }
          else
          {
            bp2 = center.add( g2.multiply( box_length / 2 ) ).add( g1.multiply( -box_width / 2 ) );
            bp1 = center.add( g2.multiply( box_length / 2 ) ).add( g1.multiply( box_width / 2 ) );
          }
          let t = new LineTask( this.tasks.length, [ bp1, bp2 ], false, true );
          this.tasks.push( t );

        }
      }
      if( !reverseIt && !this.options.draw_circles.val )
        r--;
      reverseIt = !reverseIt;
    }

    if( !this.options.draw_circles.val )
    {
      for( let r = 0; r < centers.length; r++ )
      {
        centers[r] = centers[r].reverse();
      }

      reverseIt = true;
      let dim2 = centers[0] ? centers[0].length : 0;
      for( let c = 0; c < dim2; c++ )
      {

        for( let r_index = 0; r_index < centers.length; r_index++ )
        {

          let r = r_index;
          if( reverseIt )
            r = centers.length - r_index - 1;
          if( c >= centers[r].length )
            continue;

          let center = centers[r][c];
          let bp1, bp2;
          if( reverseIt )
          {
            bp1 = center.add( g2.multiply( box_length / 2 ) ).add( g1.multiply( -box_width / 2 ) );
            bp2 = center.add( g2.multiply( -box_length / 2 ) ).add( g1.multiply( -box_width / 2 ) );
          }
          else
          {
            bp1 = center.add( g2.multiply( -box_length / 2 ) ).add( g1.multiply( box_width / 2 ) );
            bp2 = center.add( g2.multiply( box_length / 2 ) ).add( g1.multiply( box_width / 2 ) );
          }
          let t = new LineTask( this.tasks.length, [ bp1, bp2 ], false, true );
          this.tasks.push( t );
        }
        if( reverseIt )
          c--;
        reverseIt = !reverseIt;
      }

      if( this.options.only_corners.val )
      {
        this.tasks = this.tasks.map( t => {
          let l = t.length;
          let corner_length = this.options.corner_size.val - this.options.LineWidth.val;
          if( l > (corner_length * 2) )
          {
            let space = l - (corner_length * 2);
            let shorter = space + corner_length;
            let t1 = t;
            let t2 = t.copy();
            t1 = t1.makeLonger( 0, -shorter );
            t2 = t2.makeLonger( -shorter, 0 );
            return [ t1, t2 ];
          }
          else
            return t;
        } ).flat();
      }

    }

    this.start_locations.push(this.tasks[0].toStartLocation());

  }

  make_side_copy( i, space, n )
  {
    let box_width = this.options.box_width.val;
    let box_length = this.options.box_length.val;

    if( this.options.draw_circles.val )
      box_length = box_width;

    let vertical_boxes = Math.floor( ((this.options.Length.val + this.options.box_space.val) / (box_length + this.options.box_space.val)) );

    let horizontal_boxes = Math.floor( ((this.options.Width.val + this.options.box_space_y.val) / (box_width + this.options.box_space_y.val)) );
    let horizontal_boxes_2 = horizontal_boxes;
    if( this.options.translate_every_other.val )
      horizontal_boxes_2 = Math.floor( (((this.options.Width.val - (this.options.box_space_y.val / 2 + box_width / 2)) + this.options.box_space_y.val) / (box_width + this.options.box_space_y.val)) );


    let actual_length = vertical_boxes * box_length + (vertical_boxes) * this.options.box_space.val;
    let actual_width = horizontal_boxes * box_width + (horizontal_boxes - 1) * this.options.box_space_y.val;
    let actual_width_2 = horizontal_boxes_2 * box_width + (horizontal_boxes_2 - 1) * this.options.box_space_y.val + this.options.box_space_y.val / 2 + box_width / 2;
    if( this.options.translate_every_other.val )
      if( actual_width_2 > actual_width )
        actual_width = actual_width_2;



    var plus = actual_length ? actual_length : 0;
    if( i % 2 )
      plus = actual_width ? actual_width : 0;

    var angle = this.options.Angle ? this.options.Angle.val : 0;

    var job_copy = this.copy();
    var g = new Vector( space + plus, 0 ).rotate( angle + ((Math.PI / 2) * i) );
    g = g.multiply( n );
    job_copy.move_points( g );
    job_copy.editable = this.editable;
    job_copy.side_copy_plus_value = plus;
    return job_copy;
  }

}