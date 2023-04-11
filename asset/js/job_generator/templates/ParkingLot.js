/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class ParkingLot extends square_pitch
{
  static template_type = "Parking lot";// Translateable
  static template_title = "Standard";// Translateable
  static template_id = "parking_lot"; // no spaces
  static template_image = "img/templates/parking_lot.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;

    this.options.addLineLengthInSides.val = false;
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    
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

    this.options.Length.val = 8;
    this.options.Width.val = 8;


    this.options.slot_angle = {
      configurable: true,
      name: "Slot Angle",
      val: 90,
      type: "float",
      units: "deg",
      min: 1,
      max: 179
    };
    this.options.columns = {
      configurable: true,
      name: "Columns",
      _val: 2,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 1 )
          v = 1;
        this._val = v;
      },
      type: "int",
      units: "number",
      min: 1
    };
    this.options.rows = {
      configurable: true,
      name: "Rows",
      _val: 4,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 1 )
          v = 1;
        this._val = v;
      },
      type: "int",
      units: "number",
      min: 1
    };
    this.options.border = {
      get configurable()
      {
        return !this_class.options.only_dots.val;
      },
      name: "Close slots",
      val: false,
      type: "bool"
    };
    this.options.straight = {
      configurable: true,
      name: "straight slots",
      val: false,
      type: "bool"
    };
    this.options.crosses = {
      configurable: true,
      name: "Make crosses",
      val: false,
      type: "bool"
    }
    this.options.cross_length = {
      get configurable()
      {
        return this_class.options.crosses.val;
      },
      name: "Cross length",
      _val: 0.4,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 0 )
          v = 0;
        this._val = v;
      },
      type: "float",
    };

    this.options.slot_direct_width = {
      dontsave: true,
      get val()
      {
        var o = Math.abs( Math.tan( (90 - this_class.options.slot_angle.val).deg2rad() ) * this_class.options.slot_direct_length.val );
        return (this_class.options.Length.val - o) / this_class.options.rows.val;
      },
      set val( v )
      {},
      type: "float"
    };
    this.options.slot_direct_length = {
      dontsave: true,
      get val()
      {
        return this_class.options.Width.val / (this_class.options.straight.val ? 1 : this_class.options.columns.val);
      },
      set val( v )
      {},
      type: "float"
    };

    this.options.slot_width = {
      name: "Slot Width",
      dontsave: true,
      get val()
      {
        return Math.sin( this_class.options.slot_angle.val.deg2rad() ) * this_class.options.slot_direct_width.val;
      },
      set val( v )
      {},
      type: "float",
      configurable: true,
      adjustable: true,
      is_info: true
    };
    this.options.slot_length = {
      name: "Slot Length",
      dontsave: true,
      get val()
      {
        var d = Math.cos( (90 - this_class.options.slot_angle.val).deg2rad() ) * this_class.options.slot_direct_length.val;
        if( this_class.options.straight.val )
          d /= this_class.options.columns.val;
        return d;
      },
      set val( v )
      {},
      type: "float",
      configurable: true,
      adjustable: true,
      is_info: true
    };

    this.options.only_dots = {
      configurable: true,
      name: "Make dots",
      val: false,
      type: "bool"
    };

    this.options.reverseDraw = {
      configurable: true,
      name: "Paint in reverse",
      val: false,
      type: "bool"
    };
  }

  get info_options()
  {
    return [ "columns", "rows", "slot_width", "slot_length" ];
  }

  static get layout_methods()
  {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }

  draw()
  {
    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var g1 = new Line( c1, c2 ).unit_vector;
    var g2 = g1.rotate_90_cw();
    var c3 = p[4];
    var c4 = p[7];


    var o = Math.tan( (90 - this.options.slot_angle.val).deg2rad() ) * this.options.slot_direct_length.val;

    // update tasks
    var first_start, first_end, last_start, last_end;
    var columns_handle_line;
    var d = 1;
    var columns = this.options.columns.val;
    if( this.options.straight.val )
      columns = 1;


    var lot_c1, lot_c2, lot_c4, last_line;
    for( var s = 0; s <= columns; s++ )
    {
      var side = new Line( c2, c3 );
      if( (d * o) > 0 )
        side = side.add_to_end( -o * d );
      else
        side = side.add_to_start( o * d );
      side = side.move( g1, -s * this.options.slot_direct_length.val );
      if( !first_start )
        first_start = side.start;
      if( !first_end )
        first_end = side.end;
      last_start = side.start;
      last_end = side.end;


      if( d < 0 )
        side = side.reverse();

      last_line = side.toLineTask( this.tasks.length, false, true );
      
      if( !this.options.only_dots.val && !this.options.crosses.val)
      {
        if( s < columns )
        this.tasks.push( last_line );
      }
      /*if(this.options.border.val)
      {
        if( s < columns )
        this.tasks.push( last_line );
      }*/
      
      if( !lot_c1 )
        lot_c1 = side.start;
      if( !lot_c2 )
        lot_c2 = side.end;
      lot_c4 = side.end;

      if( s < columns && d > 0 )
        columns_handle_line = side;
      if( s < columns && d < 0 )
        columns_handle_line = side;
      d *= -1;
    }


    if( !this.options.border.val && !this.options.only_dots.val  )
    {
      this.tasks.shift();
    }

    if( this.options.straight.val )
    {
      columns_handle_line = new Line( lot_c1, lot_c2 );
      // split slots if it's a streight lot

      var side_g = (new Line( lot_c1, lot_c4 ));
      var slot_length = side_g.length / this.options.columns.val;
      side_g = side_g.unit_vector;

      //var side1 = new Line( lot_c1, lot_c4 );
      //var side2 = new Line( lot_c2, lot_c3 );
      //var slot_length = this.options.slot_length.val;
      //d *= -1;
      var this_directions = d * -1;
      for( var s = 1; s < this.options.columns.val; s++ )
      {
        let line = new Line( lot_c1.add( side_g.multiply( s * slot_length ) ),
          lot_c2.add( side_g.multiply( s * slot_length ) ) );
        columns_handle_line = line;
        if( this_directions < 0 )
          line = line.reverse();
        if( line.length )
        {
          var lines = line.split( line.length / this.options.rows.val, 0 );
          lines.forEach( l => {
            if( !this.options.only_dots.val )
              this.tasks.push( l.toLineTask( this.tasks.length, false, true ) );
          } );
        }

        this_directions *= -1;
      }

      if( this_directions > 0 )
        last_line = last_line.opposite_direction;

    }
    if( this.options.border.val && !this.options.only_dots.val  )
    {
      last_line.id = this.tasks.length;
      this.tasks.push( last_line );
    }

    var use_c_first = last_start;
    var use_c_second = first_start;
    if( d < 0 && !this.options.reverseDraw.val)
    {
      use_c_first = last_end;
      use_c_second = first_end;
    }
    if(!this.options.reverseDraw.val)
      var rd = 1;
    else
      var rd = -1;
    var cd = 1;
    var row_handle_line;
   
      this.options.only_dots.configurable = true;
      this.options.straight.configurable = true;
      this.options.straight.adjustable = true;
      this.options.crosses.configurable  = false;
      let tdAr = [];
      let start;
      for( var r = 0; r <= this.options.rows.val; r++ )
      {
       
          start = use_c_first.add( g2.multiply( r * d * this.options.slot_direct_width.val ) );
          if( rd < 0 )
            start = use_c_second.add( g2.multiply( r * d * this.options.slot_direct_width.val ) );
        
        
        for( var s = 1; s <= columns; s++ )
        {
          var next = start.add( g1.multiply( this.options.slot_direct_length.val * rd ) ).add( g2.multiply( -o * cd * d ) );
          //if( (r !== 0 || this.options.border.val) && (r !== this.options.rows.val || this.options.border.val) )
          var row_line = new Line( start, next );

          if( !this.options.straight.val )
          {
            this.options.crosses.configurable = true;
            if(this.options.crosses.val)
            {
              this.options.only_dots.configurable = false;
              this.options.straight.val = false;
              this.options.straight.configurable = false;
              this.options.straight.adjustable = false;
              this.options.reverseDraw.configurable = false;
              
              let cr1;
              let cr2;
              let cr3;
              let cr4;
              let horiLine;
              let vertLine;
              let side1 = new Line(c1, c2);
              let side2 = new Line(c2, c3);
              let side3 = new Line(c3, c4);
              let side4 = new Line(c4, c1);
              
              cr1 = start.add(g1.multiply(this.options.cross_length.val));
              cr2 = start.subtract(g1.multiply(this.options.cross_length.val));
              cr3 = start.add(g1.multiply((this.options.cross_length.val)).rotate_90_cw());
              cr4 = start.add(g1.multiply((this.options.cross_length.val)).rotate_90_ccw());
              let line1 = new Line(cr2, cr1); 
              let line2 = new Line(cr3, cr4); 
              if(line1.cross_with_line(side2, true) ){
                vertLine = new LineTask(tdAr.length, [start, cr2], false, true);
              }
              else if( line1.cross_with_line(side4, true))
              {
                vertLine = new LineTask(tdAr.length, [cr1, start], false, true);
              }
              else
              {
                vertLine = new LineTask(tdAr.length, [cr1, cr2], false, true)
              }
              
              tdAr.push(vertLine);
              //horiLine = new LineTask(tdAr.length, [cr3, cr4], false, true);
              if(line2.cross_with_line(side1, true) ){
                horiLine = new LineTask(tdAr.length, [start, cr3], false, true);
              }
              else if( line2.cross_with_line(side3, true))
              {
                horiLine = new LineTask(tdAr.length, [cr4, start], false, true);
              }
              else
              {
                horiLine = new LineTask(tdAr.length, [cr3, cr4], false, true)
              }
              tdAr.push(horiLine);
              
              if(s === columns)
              {
                cr1 = next.add(g1.multiply(this.options.cross_length.val));
                cr2 = next.subtract(g1.multiply(this.options.cross_length.val));
                cr3 = next.add(g1.multiply((this.options.cross_length.val)).rotate_90_cw());
                cr4 = next.add(g1.multiply((this.options.cross_length.val)).rotate_90_ccw());
                line1 = new Line(cr2, cr1); 
                line2 = new Line(cr3, cr4); 

                if(line1.cross_with_line(side2, true) ){
                  vertLine = new LineTask(tdAr.length, [next, cr2], false, true);
                }
                else if( line1.cross_with_line(side4, true))
                {
                  vertLine = new LineTask(tdAr.length, [cr1, next], false, true);
                }
                else
                {
                  vertLine = new LineTask(tdAr.length, [cr1, cr2], false, true)
                }

                //vertLine = new LineTask(tdAr.length, [cr2, cr1], false, true);
                tdAr.push(vertLine);
                //horiLine = new LineTask(tdAr.length, [cr4, cr3], false, true);
                if(line2.cross_with_line(side1, true) ){
                  horiLine = new LineTask(tdAr.length, [next, cr3], false, true);
                }
                else if( line2.cross_with_line(side3, true))
                {
                  horiLine = new LineTask(tdAr.length, [cr4, next], false, true);
                }
                else
                {
                  horiLine = new LineTask(tdAr.length, [cr3, cr4], false, true)
                }
                tdAr.push(horiLine);
              }
            }
            else if( !this.options.only_dots.val )
            {
              this.tasks.push( new LineTask( this.tasks.length, [ start, next ], false, true ) );
              this.options.reverseDraw.configurable = true;
            }
              
            else
            {
              this.options.crosses.configurable = false;
              this.options.reverseDraw.configurable = false;
              this.tasks.push( new WaypointTask( this.tasks.length, start, false, true ) );
            if( s === columns )
              this.tasks.push( new WaypointTask( this.tasks.length, next, false, true ) );
            }
            if( this.options.rows.val % 2 )
            {
              if( r === 1 && (this.options.columns.val % 2) )
                row_handle_line = row_line;

              if( r === (this.options.rows.val - 1) && !(this.options.columns.val % 2) && s === 1 )
                row_handle_line = row_line;
            }
            else
            {
              if( r === 1 && (this.options.columns.val % 2) )
                row_handle_line = row_line;
              if( r === (this.options.rows.val - 1) && !(this.options.columns.val % 2) )
                row_handle_line = row_line;
            }
          }
          else
          {
            let l = row_line;
            let ls = l.split( l.length / this.options.columns.val, 0 );
            ls.forEach( lp => {
            
              if( !this.options.only_dots.val )
                this.tasks.push( lp.toLineTask( this.tasks.length, false, true ) );
              else
              {
                this.tasks.push( new WaypointTask( this.tasks.length, lp.start, false, true ) );
                if( s === columns )
                  this.tasks.push( new WaypointTask( this.tasks.length, lp.end, false, true ) );
              }
            } );

            if( r === 1 )
              row_handle_line = ls.last();

          }

          start = next;
          cd *= -1;
        }
      if(!this.options.reverseDraw.val)      
        rd *= -1;
      else
        rd = -1;
      //if( d > 0 )
      //  rd *= -1;
      }
      if(this.options.crosses.val)
      {
        //Sorting the tasks
        this.tasks = tdAr;

        this.tasks = this.tasks.map( t => {
          if( t.start_direction.normalizeAngle >= Math.PI )
            return t.opposite_direction;
          else
            return t;
        } );
        this.tasks.forEach( t => {
          t.sort_a_90 = parseFloat( t.start_direction.normalizeAngle.toFixed( 5 ) % (Math.PI / 2) );
          t.sort_a = parseFloat( t.start_direction.normalizeAngle.toFixed( 5 ) );
  
          var p = new Vector( t.start.x, t.start.y );
          p = p.rotate( -t.sort_a );
          t.sort_y = parseFloat( (-p.y).toFixed( 2 ) );
          t.sort_x = parseFloat( p.x.toFixed( 2 ) );
        } );
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
              t.ends = t.ends.reverse();
              return t
            } );
          }
          else
            return a;
        } );
        this.tasks = parts.flat();
      }   
  
    if(this.options.reverseDraw.val)
    {
      this.options.only_dots.configurable = false;
      this.options.straight.val = false;
      this.options.straight.configurable = false;
      this.options.straight.adjustable = false;
      this.options.crosses.configurable = false;

      let ctrl_line = new Line(c1, c4);
      this.tasks.filter(t=>t instanceof LineTask).forEach(t =>
      {
        let l1 = new Line(t.ends[0], t.ends[1]);
        let angle =ctrl_line.angle_between(l1);
        if(angle === Math.PI/2 )
        {
          t.action_options.push( new IntRobotAction( "platform_direction", 2 ) );
          SETTINGS.backwards_max_speed && t.action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
          //this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
        }
      })
    }

    // Fix ids
    this.tasks.forEach((task, idx)=>task.id=idx);
    this.start_locations.push( new StartLocation( this.tasks[0].start, this.tasks[0].id ) );

    // Update test_tasks
    // Update bb
    // Update handles
    //this.refresh_snapping_lines( );
    this.refresh_bb();
    this.refresh_handles( columns_handle_line, row_handle_line );
    this.refresh_test_run();
    this.refresh_snapping_lines();

  }

  static get_point_positions( layout_method )
  {
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0, 1.01 ),
        new Vector( 0, -0.01 )
      ];
    }

    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0, 1.01 ),
        new Vector( 0, -0.01 ),
        new Vector( 1, 0.23 )
      ];
    }
  }

  refresh_handles( columns_handle_line, row_handle_line )
  {
    super.refresh_handles();
    var this_class = this;

    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    //var c3 = p[4];
    var c4 = p[7];
    //var g1 = new Line( c1, c2 ).unit_vector;
    //var g2 = g1.rotate_90_cw();

    //var o = Math.tan( (90 - this.options.slot_angle.val).deg2rad() ) * this.options.slot_direct_length.val;
//    console.log( o )

    /*var slot1_c2 = c1.add( g1.multiply( this.options.slot_direct_length.val ) );
     if( this.options.straight.val )
     slot1_c2 = c1.add( g1.multiply( this.options.slot_direct_length.val / this.options.columns.val ) );
     
     if( !(this_class.options.columns.val % 2) )
     slot1_c2 = slot1_c2.add( g2.multiply( o ) );
     
     var slot1_c3 = slot1_c2.add( g2.multiply( this.options.slot_direct_width.val ) );
     
     
     var slot1_c4 = c1.add( g2.multiply( this.options.slot_direct_width.val ) );
     if( this_class.options.columns.val % 2 )
     slot1_c4 = slot1_c4.add( g2.multiply( o ) );
     */

    //var slot_columns_handle_center = (new Line( slot1_c2, slot1_c3 )).middle;
    //var slot_rows_handle_center = (new Line( slot1_c3, slot1_c4 )).middle;
    if( !columns_handle_line || columns_handle_line.length === 0 )
      return;
    if( !row_handle_line || row_handle_line.length === 0 )
      return;

    var slot_columns_handle_center = columns_handle_line.split( columns_handle_line.length / this.options.rows.val, 0 )[0].middle;
    var slot_rows_handle_center = row_handle_line.middle;

    var ref_columns_line = new Line( c1, c4 );
    var ref_rows_line = new Line( c1, c2 );

    if(!this.options.reverseDraw.val){
    this.handles.push( new Handle( slot_columns_handle_center, -this.options.Angle.val + Math.PI / 2, "columns", "move_handle_onedirection", "yellow_move_handle_onedirection", function( new_pos_v, snapping_lines )
    {
      this_class.options.taskModificationIds.val = {};
      var p = ref_columns_line.point_on_line( new_pos_v );
      var d = (new Line( p, new_pos_v )).length;

      var new_columns = Math.round( this_class.options.Width.val / d );

      return this_class.set_new_val( this_class.options.columns, new_columns );

    }, function( new_number )
    {
      this_class.options.taskModificationIds.val = {};
      return this_class.set_new_val( this_class.options.columns, Math.round( new_number ) );
    }, "int" ) );
  }
    this.handles.push( new Handle( slot_rows_handle_center, -this.options.Angle.val, "rows", "move_handle_onedirection", "yellow_move_handle_onedirection", function( new_pos_v, snapping_lines )
    {
      this_class.options.taskModificationIds.val = {};
      var p = ref_rows_line.point_on_line( new_pos_v );
      var d = (new Line( p, new_pos_v )).length;

      var new_rows = Math.round( this_class.options.Length.val / d );

      return this_class.set_new_val( this_class.options.rows, new_rows );

    }, function( new_number )
    {
      this_class.options.taskModificationIds.val = {};
      return this_class.set_new_val( this_class.options.rows, Math.round( new_number ) );
    }, "int" ) );

    // rows / columns handle

  }

}