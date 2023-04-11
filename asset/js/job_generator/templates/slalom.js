/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




class Slalom extends square_pitch
{
  static template_type = "Slalom";// Translateable
  static template_title = "Standard"
  static template_id = "slalom_dev"; // no spaces
  static template_image = "img/templates/slalom_black.png"; // no spaces
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    this.options.Length.val = 10;
    this.options.Width.val = 1.5;

    this.options.Mirror = {
      configurable: true,
      "dontsave": false,
      name: "Mirror",
      type: "bool",
      val: false
    };
    this.options.Spray = {
      configurable: true,
      "dontsave": false,
      name: "Spray",
      type: "bool",
      val: true
    };
    this.options.StepLength = {
      adjustable: true,
      configurable: true,
      name: "Step length",
      _val: 0.5,
      get val()
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val <= 0 )
          this._val = 0.5;
        else
          this._val = Math.abs( new_val );
      },
      type: "float"
    };
  }

  static get layout_methods()
  {
    return {
      //"two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }
  static get_point_positions( layout_method )
  {
    if( layout_method === "two_corners" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, -0.05 )
      ];
    }

    if( layout_method === "two_corners,side" )
    {
      return [
        new Vector( 0, 1 ),
        new Vector( 0, -0.05 ),
        new Vector( 1, 0.5 )
      ];
    }
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
    var s1 = new Line( c1, c2 );
    var s2 = new Line( c3, c4 );
    var s3 = new Line( c2, c3 );
    var s4 = new Line( c4, c1 );

    var g = s1.unit_vector;
    var g2 = s3.unit_vector;
    var spray = false;
    if( this.options.Spray.val )
      spray = true;

    var step_len = this.options.StepLength.val;
    if( !this.options.Mirror.val )
    {
      //Default
      this.start_locations.push( new StartLocation( c1, this.tasks.length ) );
      var start = c1;
      var end = c2;
    }
    else
    {
      //Mirror
      this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
      var start = c2;
      var end = c1;
    }

    var interval = 0;
    for( var i = 0; i <= Math.floor( this.options.Length.val / step_len ); i++ )
    {
//      this.tasks.push( new WaypointTask( this.tasks.length, start.add( g2.multiply( interval ) ), false, spray ) );
//      this.tasks.push( new WaypointTask( this.tasks.length, end.add( g2.multiply( interval ) ), false, spray ) );

      //this.tasks.push( new LineTask( this.tasks.length, [ start.add( g2.multiply( interval ) ), end.add( g2.multiply( interval ) ) ], false, true ) );
      this.tasks.push( new LineTaskWay( this.tasks.length, [ start.add( g2.multiply( interval ) ), end.add( g2.multiply( interval ) ) ], false, true ) );

      if( interval >= this.options.Length.val )
      {
        var point = this.tasks[this.tasks.length - 1].ends[1];
        this.tasks.push( new WaypointTask( this.tasks.length, point, false, spray ) );
        break;
      }
      else
      {
        if( (this.options.Length.val - interval) < step_len )
        {
          var point = this.tasks[this.tasks.length - 1].ends[1];
          this.tasks.push( new WaypointTask( this.tasks.length, point, false, spray ) );
//          var buf = interval;
//          interval += this.options.Length.val - interval;
//          this.tasks.push( new WaypointTask( this.tasks.length, end.add( g2.multiply( interval ) ), false, true ) );
          //this.tasks.push( new LineTask( this.tasks.length, [ end.add( g2.multiply( buf ) ), end.add( g2.multiply( interval ) ) ], false, true ) );
          break;
        }
        else
          interval += step_len;
      }

      //this.tasks.push( new WaypointTask( this.tasks.length, end.add( g2.multiply( interval ) ), false, spray ) );
      //this.tasks.push( new LineTask( this.tasks.length, [ end.add( g2.multiply( interval - step_len ) ), end.add( g2.multiply( interval ) ) ], false, true ) );
      this.tasks.push( new LineTaskWay( this.tasks.length, [ end.add( g2.multiply( interval - step_len ) ),
        end.add( g2.multiply( interval ) ) ], false, true ) );


      //this.tasks.push( new WaypointTask( this.tasks.length, start.add( g2.multiply( interval ) ), false, spray ) );
      //this.tasks.push( new LineTask( this.tasks.length, [ end.add( g2.multiply( interval ) ), start.add( g2.multiply( interval ) ) ], false, true ) );
      this.tasks.push( new LineTaskWay( this.tasks.length, [ end.add( g2.multiply( interval ) ), start.add( g2.multiply( interval ) ) ], false, true ) );

      if( interval >= this.options.Length.val )
      {
        var point = this.tasks[this.tasks.length - 1].ends[1];
        this.tasks.push( new WaypointTask( this.tasks.length, point, false, spray ) );
        break;
      }
      else
      {
        if( (this.options.Length.val - interval) < step_len )
        {
          var point = this.tasks[this.tasks.length - 1].ends[1];
          this.tasks.push( new WaypointTask( this.tasks.length, point, false, spray ) );
//          var buf = interval;
//          interval += this.options.Length.val - interval;
//
//          this.tasks.push( new WaypointTask( this.tasks.length, start.add( g2.multiply( interval ) ), false, true ) );
          //this.tasks.push( new LineTask( this.tasks.length, [ start.add( g2.multiply( buf ) ), start.add( g2.multiply( interval ) ) ], false, true ) );
          break;
        }
        else
          interval += step_len;
      }

      //this.tasks.push( new WaypointTask( this.tasks.length, start.add( g2.multiply( interval ) ), false, spray ) );
      //this.tasks.push( new LineTask( this.tasks.length, [ start.add( g2.multiply( interval - step_len ) ), start.add( g2.multiply( interval ) ) ], false, true ) );
      this.tasks.push( new LineTaskWay( this.tasks.length, [ start.add( g2.multiply( interval - step_len ) ),
        start.add( g2.multiply( interval ) ) ], false, true ) );

    }

    this.tasks[0].label = "start";
    this.tasks[this.tasks.length - 1].label = "end";

    // Update test_tasks
    // Update bb
    // Update handles
    //this.refresh_snapping_lines( );
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}
