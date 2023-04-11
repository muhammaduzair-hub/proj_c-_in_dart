
class custom_soccer extends dbu_soccer_11_man_pitch
{
  
  static create_from_other_soccer( job )
  {

    var new_job = new custom_soccer( job.id, job.name, job.layout_method );
    this.copy_job_options_to_job(new_job);
    
    //new_job.options = JSON.copy( this.options );
    new_job.points = job.points.copy();
    new_job.job_options = job.job_options.copy();
    new_job.projection = job.projection;
    new_job.proj_alias = job.proj_alias;
    new_job.start_from = job.start_from;

    // fields
    new_job.options["Goal box"].val = false;
    new_job.options["Penalty box"].val = false;
    new_job.options["Penalty spot"].val = false;

    if( job.options.Fields.val[0] )
    {
      new_job.options["Goal box"].val = true;
      new_job.options["Goal box width"].val = job.options.Fields.val[0].width;
      new_job.options["Goal box depth"].val = job.options.Fields.val[0].length;
      if( job.options.Fields.val[0].kick_spot_from_back )
      {
        new_job.options["Penalty spot dist"].val = job.options.Fields.val[0].kick_spot_from_back;
        new_job.options["Penalty spot"].val = true;
      }

    }
    if( job.options.Fields.val[1] )
    {
      new_job.options["Penalty box"].val = true;
      new_job.options["Penalty box width"].val = job.options.Fields.val[1].width;
      new_job.options["Penalty box depth"].val = job.options.Fields.val[1].length;
      new_job.options["Penalty arc radius"].val = job.options.Fields.val[1].arc.radius;
      if( job.options.Fields.val[1].kick_spot_from_back )
      {
        new_job.options["Penalty spot dist"].val = job.options.Fields.val[1].kick_spot_from_back;
        new_job.options["Penalty spot"].val = true;
      }
    }

    new_job.draw();
    return new_job;
  }

  static template_title = "Custom";
  static template_id = "custom_soccer";

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    var this_class = this;
    this.options.GoalWidth.dontsave = false;

    this.options.GoalWidth.configurable = true;
    Object.defineProperty( this.options.GoalWidth, 'configurable', {
      get: function()
      {
        return this_class.options["Right goal pole"].val || this_class.options["Left goal pole"].val || this_class.options["reverseInGoal"].val;
      }
    } );

    this.options.GoalWidth.dontsave = false;
    this.options.GoalWidth.prev_sibling = "Right goal pole";
    this.options["Right goal pole"].prev_sibling = "Left goal pole";

    this.options.reverseInGoal = {
      adjustable: false,
      configurable: true,
      name: "Fixed goal posts",
      val: false,
      type: "bool"
    };
    if( layout_method === "all_goal_posts" || layout_method === "all_corners,all_goal_posts" )
      this.options.reverseInGoal.val = true;


    this.options.ScalePitch.configurable = false;
    this.options["PitchInPitch 1"].configurable = false;
    this.options["PitchInPitch 2"].configurable = false;
    this.options["Full PitchInPitch"] = {
      adjustable: false,
      configurable: false,
      name: "Full 8 man pitches",
      val: true,
      type: "bool",
      prev_sibling: "PitchInPitch 2"
    };
    //1
    this.options.Length.name = "Side line";
    this.options.Length.prev_sibling = "1";
    if( layout_method === "two_corners" || layout_method === "two_corners,side" || layout_method === "all_goal_posts" )
    {
      this.options.Width.configurable = true;
      this.options.Length.configurable = false;
    }
    else if( layout_method === "all_corners" || layout_method === "all_corners,all_goal_posts" )
    {
      this.options.Width.configurable = false;
      this.options.Length.configurable = false;
    }
    else
    {
      this.options.Width.configurable = true;
      this.options.Length.configurable = true;
    }
    this.options.Width.name = "Goal line";
    this.options.Width.prev_sibling = "1";
    //2
    this.options["Penalty box"] = {
      adjustable: false,
      configurable: true,
      name: "Penalty box",
      prev_sibling: "3",
      val: true,
      type: "bool"
    };
    this.options["Penalty box width"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Penalty box"].val;
      },
      name: "Penalty box width",
      prev_sibling: "Penalty box",
      type: "float",
      _val: 40.32,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    this.options["Penalty box depth"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Penalty box"].val;
      },
      name: "Penalty box depth",
      prev_sibling: "Penalty box",
      type: "float",
      _val: 16.5,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    this.options["Penalty arc radius"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Penalty box"].val;
      },
      name: "Penalty arc radius",
      prev_sibling: "Penalty box",
      type: "float",
      _val: 9.15,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    //3
    this.options["Penalty spot"] = {
      configurable: true,
      name: "Penalty spot",
      prev_sibling: "2",
      val: true,
      type: "bool"
    };
    this.options["Penalty spot dist"] = {
      get configurable( )
      {
        return (this_class.options["Penalty spot"].val);
      },
      name: "Penalty spot distance",
      prev_sibling: "Penalty spot",
      type: "float",
      _val: 11,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    //4
    this.options["Goal box"] = {
      configurable: true,
      name: "Goal box",
      prev_sibling: "4",
      val: true,
      type: "bool"
    };
    this.options["Goal box width"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Goal box"].val;
      },
      name: "Goal box width",
      prev_sibling: "Goal box",
      type: "float",
      _val: 18.32,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    this.options["Goal box depth"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Goal box"].val;
      },
      name: "Goal box depth",
      prev_sibling: "Goal box",
      type: "float",
      _val: 5.5,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;
      }
    };
    //5
    this.options.MakeBuildOut.val = false;
    this.options.MakeBuildOut.configurable = true;
    this.options["Middle line"] = {
      configurable: true,
      name: "Middle line",
      val: true,
      type: "bool"
    };
    this.options.MakeKickDot.configurable = true;
    this.options.MakeKickDot.name = "Kickoff spot";

    this.options.reciseCenterCirlce.val = false;
    this.options["Center circle"].configurable = true;

    this.options["Center circle radius"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options["Center circle"].val;
      },
      name: "Center circle radius",
      prev_sibling: "Center circle",
      type: "float",
      _val: 9.15,
      get val( )
      {

        /*if( this._val > this_class.options.Width.val )
         return this_class.options.Width.val;
         else if( this._val > this_class.options.Length.val )
         return this_class.options.Length.val;
         else
         return this._val;*/

        return this._val;
      },
      set val( new_val )
      {
        this._val = new_val;

        /*if( new_val > this_class.options.Width.val )
         this._val = this_class.options.Width.val;
         else if( new_val > this_class.options.Length.val )
         this._val = this_class.options.Length.val;
         else
         this._val = new_val;*/
      }
    };
    this.options["DrawCorners"] = {
      configurable: true,
      name: "Corners",
      val: true,
      type: "bool"
    };
    this.options["Corner radius"] = {
      adjustable: false,
      get configurable( )
      {
        return this_class.options.DrawCorners.val;
      },
      name: "Corner radius",
      prev_sibling: "DrawCorners",
      type: "float",
      _val: 1,
      get val( )
      {
        return this._val;
      },
      set val( new_val )
      {
        if( new_val > this_class.options.Width.val )
          this._val = this_class.options.Width.val;
        else if( new_val > this_class.options.Length.val )
          this._val = this_class.options.Length.val;
        else
          this._val = new_val;
      }
    };
    this.options.CenterCircleRadius = {
      adjustable: false,
      name: "CenterCircleRadius",
      get val( )
      {
        return this_class.options["Center circle radius"].val;
      },
      set val( new_val )
      {
        this_class.options["Center circle radius"].val = new_val;
      },
      type: "float",
      "dontsave": true
    };

    this.options.CornerRadius = {
      name: "CornerRadius",
      get val( )
      {
        return this_class.options["Corner radius"].val;
      },
      set val( v )
      {
        this_class.options["Corner radius"].val = v;
      },
      type: "float"
    };
    this.options.Fields = {
      adjustable: false,
      name: "Fields",
      get val( )
      {

        if( !this_class.options["Penalty spot"].val )
        {
          if( this_class.options["Goal box"].val && this_class.options["Penalty box"].val )
          {
            return [
              {
                width: this_class.options["Goal box width"].val,
                length: this_class.options["Goal box depth"].val
              },
              {
                width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                length: this_class.options["Penalty box depth"].val
              }
            ];
          }
          else if( this_class.options["Goal box"].val && !this_class.options["Penalty box"].val )
          {
            return [
              {
                width: this_class.options["Goal box width"].val,
                length: this_class.options["Goal box depth"].val
              }
            ];
          }
          else if( this_class.options["Penalty box"].val && !this_class.options["Goal box"].val )
          {
            return [
              {
                width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                length: this_class.options["Penalty box depth"].val
              }
            ];
          }
          else
          {
            return [ ];
          }
        }
        else
        {
          if( this_class.options["Goal box"].val && this_class.options["Penalty box"].val )
          {
            if( this_class.options["Penalty spot dist"].val + this_class.options["Penalty arc radius"].val < this_class.options["Penalty box depth"].val )
            {
              if( this_class.options["Penalty spot dist"].val < 0 )
              {
                return [
                  {
                    width: this_class.options["Goal box width"].val,
                    length: this_class.options["Goal box depth"].val
                  }
                ];
              }
              else
              {
                return [
                  {
                    width: this_class.options["Goal box width"].val,
                    length: this_class.options["Goal box depth"].val
                  },
                  {
                    width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                    length: this_class.options["Penalty box depth"].val,
                    kick_spot_from_back: this_class.options["Penalty spot dist"].val
                  }
                ];
              }
            }
            else if( this_class.options["Penalty spot dist"].val - this_class.options["Penalty arc radius"].val > this_class.options["Penalty box depth"].val )
            {
              return [
                {
                  width: this_class.options["Goal box width"].val,
                  length: this_class.options["Goal box depth"].val
                }
              ];
            }
            else
            {
              return [
                {
                  width: this_class.options["Goal box width"].val,
                  length: this_class.options["Goal box depth"].val
                },
                {
                  width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                  length: this_class.options["Penalty box depth"].val,
                  kick_spot_from_back: this_class.options["Penalty spot dist"].val,
                  arc: {
                    radius: this_class.options["Penalty arc radius"].val // the radius is measured to the inside of the circle
                  }
                }
              ];
            }
          }
          else if( this_class.options["Goal box"].val && !this_class.options["Penalty box"].val )
          {
            if( this_class.options["Penalty spot dist"].val < 0 )
              return [ ];
            else
            {
              if( this_class.options["Penalty spot dist"].val > this_class.options.Length.val / 2 )
                this_class.options["Penalty spot dist"].val = this_class.options.Length.val / 2;
              return [
                {
                  width: this_class.options["Goal box width"].val,
                  length: this_class.options["Goal box depth"].val,
                  kick_spot_from_back: this_class.options["Penalty spot dist"].val
                }
              ];
            }
          }
          else if( this_class.options["Penalty box"].val && !this_class.options["Goal box"].val )
          {
            if( this_class.options["Penalty spot dist"].val + this_class.options["Penalty arc radius"].val < this_class.options["Penalty box depth"].val )
            {
              if( this_class.options["Penalty spot dist"].val < 0 )
              {
                return [ ];
              }
              else
              {
                return [
                  {
                    width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                    length: this_class.options["Penalty box depth"].val,
                    kick_spot_from_back: this_class.options["Penalty spot dist"].val
                  }
                ];
              }
            }
            else if( this_class.options["Penalty spot dist"].val - this_class.options["Penalty arc radius"].val > this_class.options["Penalty box depth"].val )
            {
              return [ ];
            }
            else
            {
              return [
                {
                  width: this_class.options["Penalty box width"].val, // the line is measured from the outside og the line
                  length: this_class.options["Penalty box depth"].val,
                  kick_spot_from_back: this_class.options["Penalty spot dist"].val,
                  arc: {
                    radius: this_class.options["Penalty arc radius"].val // the radius is measured to the inside of the circle
                  }
                }
              ];
            }
          }
          else
          {
            return [
              {
                width: 0,
                length: 0,
                kick_spot_from_back: this_class.options["Penalty spot dist"].val
              }
            ];
          }
        }

      },
      set val( new_val )
      {

      },
      type: "array",
      "dontsave": true
    };

    this.options["Training Lines"] = {
      configurable: true,
      name: "Dashed training lines",
      val: false,
      type: "bool",

    };
    
    this.options["Paints Length"] = {
      configurable: true,
      name: "Paints length & space",
      _val: 0.5,
      type: "float",
      get val() 
      {
        return this._val;
      },
      set val(v)
      {
        if(v < 0.1 ) {
          this._val = 0.1;
        }
        else if (v > 1) {
          this._val = 1;
        }
        else {
          this._val = v;
        }
      },
      prev_sibling: "Training Lines",
    }
  }
  
  
  create_goalend( which_end )
  {

    var p = this.drawing_points;
    var c1 = p[0 + which_end * 4];
    var p1 = p[1 + which_end * 4];
    var p2 = p[2 + which_end * 4];
    var c2 = p[3 + which_end * 4];
    var this_goal_middle = new Line( p1, p2 ).middle;
    var oposite = 1 - which_end;
    var p3 = p[1 + oposite * 4];
    var p4 = p[2 + oposite * 4];
    var c3 = p[0 + oposite * 4];
    var c4 = p[3 + oposite * 4];
    var oposite_goal_middle = new Line( p3, p4 ).middle;
    var field_guide = new Line( this_goal_middle, oposite_goal_middle ).unit_vector;
    var g2;
    if( this.options.alignWithBackLine.val )
      g2 = new Line( p1, p2 ).unit_vector; // along backline
    else
      g2 = new Line( c1, c2 ).unit_vector; // along backline
    var g1 = g2.rotate( -Math.PI / 2 ); // along the long side
    var middle = new Line( p1, p2 ).middle;
    var build_out_vector;
    var corners;

    if(this.options["corner_markings_only"].val)
    {
      //Corner markings only
      
      let c1p1 = c1;
      let c1p2 = c1.add(g2.multiply(0.5));
      let c2p1 = c2;
      let c2p2 = c2.subtract(g2.multiply(0.5));

      let penaltyP1;
      let penaltyP1p2;
      let penaltyP2;
      let penaltyP2p2;
      let penaltyP3;
      let penaltyP4;

      let penaltyP3p1;
      let penaltyP3p2;

      let penaltyP4p1; 
      let penaltyP4p2;

      let penaltyMid; 
      let penaltyMid1; 
      let penaltyMid2;

      let blMid;
      let blMid1; 

      if(this.options.Fields.val.length === 0)
      {
        penaltyP1 = this_goal_middle.add(g2.multiply(this.options.GoalWidth.val/2));
        penaltyP1p2 = penaltyP1.subtract(g2.multiply(0.2).rotate_90_cw());
  
        penaltyP2 = this_goal_middle.subtract(g2.multiply(this.options.GoalWidth.val/2));
        penaltyP2p2 = penaltyP2.subtract(g2.multiply(0.2).rotate_90_cw());
      }
      else
      {
        penaltyP1 = this_goal_middle.add(g2.multiply(this.options.Fields.val[0].width/2));
        penaltyP1p2 = penaltyP1.add(g2.multiply(0.5).rotate_90_cw());

        penaltyP2 = this_goal_middle.subtract(g2.multiply(this.options.Fields.val[0].width/2));
        penaltyP2p2 = penaltyP2.add(g2.multiply(0.5).rotate_90_cw());
      }
      
      if((this.options.Fields.val.length === 1))
      {
        penaltyP3 = penaltyP1.add(g2.multiply(this.options.Fields.val[0].length - this.options.LineWidth.val).rotate_90_cw());
        penaltyP4 = penaltyP2.add(g2.multiply(this.options.Fields.val[0].length - this.options.LineWidth.val).rotate_90_cw());
        penaltyP3p1 = penaltyP3.add(g2.multiply(0.5).rotate_90_ccw());
        penaltyP3p2 = penaltyP3.subtract(g2.multiply(0.5));

        penaltyP4p1 = penaltyP4.add(g2.multiply(0.5).rotate_90_ccw());
        penaltyP4p2 = penaltyP4.add(g2.multiply(0.5));

        penaltyMid = new Line(penaltyP4, penaltyP3).middle;
        penaltyMid1 = penaltyMid.add(g2.multiply(0.25));
        penaltyMid2 = penaltyMid.subtract(g2.multiply(0.25));

        blMid = new Line(penaltyP1, penaltyP2).middle;
        blMid1 = blMid.add(g2.multiply(0.5).rotate_90_ccw());
      }
       
      let local_field_guide = g1;
      var kick_dot;
      
      if(!(this.options.Fields.val.length === 0))
      {
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[0].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        if( this.options.Fields.val[0].kick_spot_from_back - this.options.LineWidth.val / 2 );
        {
          if( this.options.KickFieldsAsDots.val )
            kick_dot = new WaypointTask( this.tasks.length + 1, kick_center, false, true );
          else
          {
            var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
            var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
            kick_dot = new ArcTask( this.tasks.length + 1, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
          
          }
        }
      }
     

      if(which_end === 0)
      {
        this.tasks.push(new LineTask(this.tasks.length, [c1p1, c1p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP1, penaltyP1p2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3p1, penaltyP3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3, penaltyP3p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyMid1, penaltyMid2], false, true));
        this.tasks.push(kick_dot);

        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4p2, penaltyP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4, penaltyP4p1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP2p2, penaltyP2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [blMid, blMid1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [c2p2, c2p1], false, true));
      }
      if(which_end === 1)
      {
        this.tasks.push(new LineTask(this.tasks.length, [c2p1, c2p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP2, penaltyP2p2], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4p1, penaltyP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP4, penaltyP4p2], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyMid2, penaltyMid1], false, true));
        this.tasks.push(kick_dot);

        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3p2, penaltyP3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP3, penaltyP3p1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [penaltyP1p2, penaltyP1], false, true));
        if(this.options.Fields.val.length === 1){
        this.tasks.push(new LineTask(this.tasks.length, [blMid, blMid1], false, true));
        }
        this.tasks.push(new LineTask(this.tasks.length, [c1p2, c1p1], false, true));
      }
    }
    else
      {
    // draw some of backline and the two goal poles
    this.start_locations.push( new StartLocation( c1, this.tasks.length ) );

    var bl1 = new Line( c1, p1 );
    var bl2 = new Line( p2, c2 );
    if( !this.options.reverseInGoal.val )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c1, p1 ], false, true ) );
    }
    if( !this.options ["running lines"] )
    {
// mark goal poles
      if( !this.options.reverseInGoal.val && !(this.options.Fields.val.length % 2) )
      {
        if( this.get_option_val( "Right goal pole" ) )
          //if ( this.options.DrawRightGoalPole.val )
          this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
        if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }
    }
    if( !this.options.reverseInGoal.val )
    {
     this.tasks.push( new LineTask( this.tasks.length, [ p1, p2 ], false, true ) );
      if( !this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
        this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
    }

    var outer_dot = undefined;
    // make fields
    var fields_drawn = 0;
    var start_end = 1;
    var goalcorners;
    var k = 0;
    var fc_array = [ ];

    for( var i = this.options.Fields.val.length - 1; i >= 0; i-- )
    {


      var local_field_guide = g1;
      if( this.options.makeFieldsSkew.val )
        local_field_guide = field_guide;
      var width = (this.options.Fields.val[i].width - this.options.LineWidth.val) * start_end;
      
      var pitch_length = this.options.Length.val - (this.options.CenterCircleRadius.val * 2);
      var field_length = (this.options.Fields.val[i].length - this.options.LineWidth.val);
      if( this.options.Fields.val[i].arc )
      {
        if( this.options.Fields.val[i].arc.center_from_back !== undefined )
          field_length = this.options.Fields.val[i].arc.radius + this.options.LineWidth.val / 2 + this.options.Fields.val[i].arc.center_from_back - this.options.LineWidth.val / 2;
        else
          field_length = this.options.Fields.val[i].arc.radius + this.options.LineWidth.val / 2 + this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2;
      }
      
      if( !this.options.Fields.val[i].length && !this.options.Fields.val[i].width )
      {

        var kick_dot;
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
        {
          if( this.options.KickFieldsAsDots.val )
            kick_dot = new WaypointTask( this.tasks.length + 1, kick_center, false, true );
          else
          {

            var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
            var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
            kick_dot = new ArcTask( this.tasks.length + 1, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
          }
        }

        this.tasks.push( kick_dot );
        continue;
      }
      var fc1 = middle.add( g2.multiply( width / 2 ) );

      var fc2 = fc1.add( local_field_guide.multiply( this.options.Fields.val[i].length - this.options.LineWidth.val ) );
     

      if( !outer_dot )
      {
        if( this.options.reverseInGoal.val )
        {
          let tasks;
          if( this.options["running lines"].val === true )
          {
            tasks = drive_around_goal_posts( this, c1, p1, p2, c2, 2, this.tasks.length, this.options.goalPoleWidth.val );
            var b = tasks.last( -1 ).end;
            tasks.pop();
            tasks.pop();
            tasks[0].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
            tasks[0].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
            // brug last end til at finde det sidste element gem det og derefter smid det
          }
          else
          {
            tasks = drive_around_goal_posts( this, c1, p1, p2, fc1, 2, this.tasks.length, this.options.goalPoleWidth.val );
          }



          this.tasks.pushAll( tasks );
          if( this.options["running lines"].val === true )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ c2, b ], false, true ) );
            this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
            SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
          }
        }
        else
        {
          if( this.options["running lines"].val === true )
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, c2 ], false, true ) );
          }
          else
          {
            this.tasks.push( new LineTask( this.tasks.length, [ p2, fc1 ], false, true ) );
          }
        }
        outer_dot = fc1;
      }

      if( this.options["Goal corners"].val && !goalcorners )
      {
        if( which_end === 0 )
        {
          this.create_goal_corner( 1, fc1, fc2 );
          goalcorners = 1;
        }
        else
        {
          this.create_goal_corner( 3, fc1, fc2 );
          goalcorners = 1;
        }
      }

      var fc3 = fc2.add( g2.multiply( -(this.options.Fields.val[i].width - this.options.LineWidth.val) * start_end ) );
      var fc4 = fc3.add( local_field_guide.multiply( -(this.options.Fields.val[i].length - this.options.LineWidth.val) ) );
      if( width >= this.options.Width.val )
        fc4 = c1;

      if( this.options.Fields.val[i].is_round )
      {

        let arc_radius_l = this.options.Fields.val[i].length - this.options.LineWidth.val;
        let arc_radius_w = this.options.Fields.val[i].width / 2 - this.options.LineWidth.val / 2;
        let arc_radius = (arc_radius_l < arc_radius_w) ? arc_radius_l : arc_radius_w;
        let arc1_c1 = fc2.subtract( local_field_guide.multiply( arc_radius ) );
        let arc1_c2 = fc2.subtract( g2.multiply( arc_radius ) );
        let arc1_cent = arc1_c2.subtract( local_field_guide.multiply( arc_radius ) );

        let arc2_c1 = fc3.add( g2.multiply( arc_radius ) );
        let arc2_c2 = fc3.subtract( local_field_guide.multiply( arc_radius ) );
        let arc2_cent = arc2_c1.subtract( local_field_guide.multiply( arc_radius ) );

        var arc1 = (Arc.From2PointsAndCenter( arc1_c1, arc1_c2, arc1_cent, true ));
        var arc2 = (Arc.From2PointsAndCenter( arc2_c1, arc2_c2, arc2_cent, true ));

        if( width < this.options.Width.val )
        {
          let l1 = new LineTask( this.tasks.length, [ fc1, arc1_c1 ], false, true );
          if( !l1.length.veryclose( 0 ) )
          {
            this.tasks.push( l1 );
          }
        }
        else
        {
          let side1_l = new Line( c2, c3 );
          let side2_l = new Line( c1, c4 );

          arc1_c1 = arc1.crosses_with_line( side1_l, true )[0];
          arc2_c2 = arc2.crosses_with_line( side2_l, true )[0];
        }

        arc1 = (Arc.From2PointsAndCenter( arc1_c1, arc1_c2, arc1_cent, true ));
        arc2 = (Arc.From2PointsAndCenter( arc2_c1, arc2_c2, arc2_cent, true ));
        if(this.options["running lines"].val)
        {
          this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) );
          this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) );
        }
        else
          this.tasks.push( arc1.toArcTask( this.tasks.length, false, false, true ) );
        
        let l2 = new LineTask( this.tasks.length, [ arc1_c2, arc2_c1 ], false, true );
        if( !l2.length.veryclose( 0 ) )
          this.tasks.push( l2 );

        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val ) );
        //this.options.KickFieldRadius.val
        var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
        if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
        {
          if( this.options.KickFieldsAsDots.val )
            this.tasks.push( new WaypointTask( this.tasks.length + 1, kick_center, false, true ) );
          else
            this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide1, kick_guide2 ], kick_center, false, false, true ) );
        }
        if(!this.options["running lines"].val)
        this.tasks.push( arc2.toArcTask( this.tasks.length, false, false, true ) );

        if( width < this.options.Width.val )
        {
          let l3 = new LineTask( this.tasks.length, [ arc2_c2, fc4 ], false, true );
          if( !l3.length.veryclose( 0 ) )
            this.tasks.push( l3 );
        }

      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ fc1, fc2 ], false, true ) );

       

        var fc2_line = new Line( fc3, fc4 );
        if( start_end > 0 )
          fc4 = fc2_line.cross_with_line( bl1 );
        else
          fc4 = fc2_line.cross_with_line( bl2 );
        // kick field setup
        var kick_center = middle.add( local_field_guide.multiply( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 ) );
        //this.options.KickFieldRadius.val
        var kick_guide1 = kick_center.add( local_field_guide.multiply( -this.options.KickFieldRadius.val ) );
        var kick_guide2 = kick_center.add( local_field_guide.multiply( this.options.KickFieldRadius.val ) );
        var field_line = new Line( fc2, fc3 );
        if( this.options.Fields.val[i].arc )
        {
          let center_from_back = (this.options.Fields.val[i].arc.center_from_back !== undefined) ? this.options.Fields.val[i].arc.center_from_back : this.options.Fields.val[i].kick_spot_from_back;
          let arc_center = middle.add( local_field_guide.multiply( center_from_back - this.options.LineWidth.val / 2 ) );

          var crosses = field_line.crosses_with_circle( arc_center, this.options.Fields.val[i].arc.radius - this.options.LineWidth.val / 2 );
          var arc_guide = arc_center.add( local_field_guide.multiply( this.options.Fields.val[i].arc.radius - this.options.LineWidth.val / 2 ) );
          this.tasks.push( new LineTask( this.tasks.length, [ fc2, crosses[1] ], false, true ) );
          var the_arc = new ArcTask( this.tasks.length, [ crosses[1], arc_guide, crosses[0] ], arc_center, false, false, true );

          // kick_arc
          if( this.options["running lines"].val === true )
          {

            var rest_of_field = new LineTask( this.tasks.length, [ crosses[1], fc3 ], false, true );
            rest_of_field.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
            this.tasks.push( rest_of_field );

            this.tasks.push( the_arc );
            // kick_dot
            var kick_dot;
            if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
            {
              if( this.options.KickFieldsAsDots.val )
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
              else
                kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
            }
            this.tasks.push( kick_dot );
            // Make pitchinpitcc kick dot
            if( i === (this.options.Fields.val.length - 1) )
            {
              if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
              {
                var c3 = p[0 + oposite * 4];
                var c4 = p[3 + oposite * 4];
                var m1 = new Line( c1, c4 ).middle;
                var m2 = new Line( c2, c3 ).middle;
                var cm = new Line( c1, c2 ).middle;
                var mm = new Line( m1, m2 ).middle;
                var m = new Line( cm, mm ).middle;
                this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
              }
            }


          }
          else
          {
            this.tasks.push( the_arc );
            // kick_dot
            var kick_dot;
            if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
            {
              if( this.options.KickFieldsAsDots.val )
                kick_dot = new WaypointTask( this.tasks.length, kick_center, false, true );
              else
                kick_dot = new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true );
            }
            this.tasks.push( kick_dot );
            // Make pitchinpitcc kick dot
            if( i === (this.options.Fields.val.length - 1) )
            {

              if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
              {
                var c3 = p[0 + oposite * 4];
                var c4 = p[3 + oposite * 4];
                var m1 = new Line( c1, c4 ).middle;
                var m2 = new Line( c2, c3 ).middle;
                var cm = new Line( c1, c2 ).middle;
                var mm = new Line( m1, m2 ).middle;
                var m = new Line( cm, mm ).middle;
                this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
              }
            }

            var rest_of_field = new LineTask( this.tasks.length, [ crosses[1], fc3 ], false, true );
            rest_of_field.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
            this.tasks.push( rest_of_field );
          }
        }
        else
        {
          if(this.options["running lines"].val)
            this.tasks.push( new LineTask( this.tasks.length, [ fc2, fc3 ], false, true ) );
          else  
            this.tasks.push( new LineTask( this.tasks.length, [ fc2, field_line.middle ], false, true ) );
          // kick_dot
          if( this.options.Fields.val[i].kick_spot_from_back - this.options.LineWidth.val / 2 )
          {
            if( this.options.KickFieldsAsDots.val )
              this.tasks.push( new WaypointTask( this.tasks.length + 1, kick_center, false, true ) );
            else
              this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide1, kick_guide2 ], kick_center, false, false, true ) );
          }
// Make pitchinpitcc kick dot
          if( i === (this.options.Fields.val.length - 1) )
          {

            if( (which_end === 0 && this.get_option_val( "PitchInPitch 1" )) || (which_end === 1 && this.get_option_val( "PitchInPitch 2" )) )
            {
              var c3 = p[0 + oposite * 4];
              var c4 = p[3 + oposite * 4];
              var m1 = new Line( c1, c4 ).middle;
              var m2 = new Line( c2, c3 ).middle;
              var cm = new Line( c1, c2 ).middle;
              var mm = new Line( m1, m2 ).middle;
              var m = new Line( cm, mm ).middle;
              this.tasks.push( new WaypointTask( this.tasks.length, m, false, true ) );
            }
          }
          if(!this.options["running lines"].val)
          {
            this.tasks.push( new LineTask( this.tasks.length, [ field_line.middle, fc3 ], false, true ) );
            this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
          }
        }
        let fcA = fc2.add( g2.multiply( -(this.options.Fields.val[i].width - this.options.LineWidth.val) * start_end ) );
        let fcB = fc3.add( local_field_guide.multiply( -(this.options.Fields.val[i].length - this.options.LineWidth.val) ) );

        this.tasks.push( new LineTask( this.tasks.length, [ fcA, fcB ], false, true ) );
        
        //this.tasks.push( new LineTask( this.tasks.length, [ fc3, fc4 ], false, true ) );
        //if(k === 0){this.tasks.push( new LineTask( this.tasks.length, [ fc2, fc4 ], false, true ) );}
      }
      start_end *= -1;
      fields_drawn++;
      if( !build_out_vector )
      {
        build_out_vector = new Line( fc1, fc2 ).unit_vector;
        corners = [ fc2, fc3 ];
      }

      if( this.options["Goal corners"].val && goalcorners === 1 )
      {
        if( which_end === 0 )
        {
          this.create_goal_corner( 0, fc4, fc3 );
          goalcorners = 2;
        }
        else
        {
          this.create_goal_corner( 2, fc4, fc3 );
          goalcorners = 2;
        }


      }

      if( k === 0 )
      {
        fc_array.push( fc1, fc2, fc3, fc4 );
        k++;
      }

    }

    if( fc_array.length )
    {
      this.snapping_lines.push( new Line( fc_array[0], fc_array[1] ) );
      this.snapping_lines.push( new Line( fc_array[2], fc_array[3] ) );
      this.snapping_lines.push( new Line( fc_array[1], fc_array[2] ) );
    }




    if( !this.options.reverseInGoal.val && (this.options.Fields.val.length % 2) )
    {
      if( this.get_option_val( "Right goal pole" ) )
        //if ( this.options.DrawRightGoalPole.val )
        this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
        this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
    }

    if( fields_drawn % 2 )
    {
      if( this.options.reverseInGoal.val )
      {
        // The robot ends on the wrong side of the goal, and there is fixed goal posts.

        //var first_bezier_point = this.tasks.last( ).ends.last( );
        //var last_bezier_point = outer_dot;
        var first_bezier_point = p1.subtract( g2.multiply( 5 ) );
        var last_bezier_point = p2.add( g2.multiply( 7 ) );
        var gbl = new Line( first_bezier_point, last_bezier_point );
        var gb = gbl.unit_vector;
        var gbt = gb.rotate_90_cw( );
        var middle = gbl.middle;
        var bp1 = first_bezier_point.add( gbt.multiply( -0.10 ) );
        var bp2 = first_bezier_point.add( gb );
        var bp3 = middle.add( gbt.multiply( 3 ) );
        var bp4 = last_bezier_point.add( gb.multiply( -4 ) );
        var bp42 = last_bezier_point.add( gb.multiply( -3 ) );
        var bp5 = last_bezier_point.add( gb.multiply( -2 ) );
        this.tasks.push( new CubicBezierTask( this.tasks.length, [ bp1, bp3, bp4, bp42, bp5 ], false, false ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", 0 ) );
        this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0 ) );
        if( this.options.AllowCoarseStart.val )
          this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
        
       
      }
    }
    if( this.options ["running lines"] )
    {
// mark goal poles
      if( !this.options.reverseInGoal.val && !(this.options.Fields.val.length % 2) )
      {
        if( this.get_option_val( "Right goal pole" ) )
          //if ( this.options.DrawRightGoalPole.val )
          this.tasks.push( new WaypointTask( this.tasks.length, p1.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
        if( this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }

      if( !this.options.reverseInGoal.val )
      {
        if( !this.get_option_val( "Right goal pole" ) && this.get_option_val( "Left goal pole" ) )
          this.tasks.push( new WaypointTask( this.tasks.length, p2.add( g1.unit_vector.multiply( -this.options.GoalDistFromBack.val ) ), false, true ) );
      }
    }
    if( !this.options["running lines"].val )
    {

      if( !outer_dot )
      {
        outer_dot = p2;
        if( this.options.reverseInGoal.val )
        {

          var tasks = drive_around_goal_posts( this, c1, p1, p2, c2, 2, this.tasks.length, this.options.goalPoleWidth.val );
          tasks.forEach( ( t ) => {
            this.tasks.push( t );
          } );
          var last_line = new Line( c2, outer_dot );
          var last_line_length = last_line.length;
          last_line = last_line.add_to_end( -(this.options.goalPoleWidth.val / 2 + 0.2) );
          var bezier_end = this.tasks[this.tasks.length - 1].ends[this.tasks[this.tasks.length - 1].ends.length - 1];
          var ramp = new Line( c2, bezier_end ).length;
          //this.tasks[this.tasks.length - 1].ends.push( ramp.start );
          this.tasks.push( new LineTask( this.tasks.length, [ c2, last_line.end ], true, true ) );
          if( last_line_length < 3 )
            this.tasks[this.tasks.length - 1].action_options.push( new IntRobotAction( "platform_direction", 2 ) );
          else
            this.tasks[this.tasks.length - 1].task_options.push( new IntRobotAction( "platform_direction", 2 ) );
          SETTINGS.backwards_max_speed && this.tasks[this.tasks.length - 1].action_options.push( new FloatRobotAction( "drive_max_velocity", SETTINGS.backwards_max_speed ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", ramp ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", 0.0 ) );
          if( this.options.AllowCoarseStart.val )
            this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
          this.tasks.push( new WaypointTask( this.tasks.length, last_line.add_to_end( -0.5 ).end, false, false ) );
        }
        else
        {
          this.tasks.push( new LineTask( this.tasks.length, [ outer_dot, c2 ], false, true ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        }
      }
      else
      {
        this.tasks.push( new LineTask( this.tasks.length, [ outer_dot, c2 ], false, true ) );
        //To prevent crash into goal post under specific conditions
        let dist2goalpost = fc1.dist_to_point(p2) + 1; 
        if(fields_drawn % 2 && dist2goalpost < settings_screeen_controller.INTERNAL_RAMP)
        {
          let ramp = 0.5;
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", ramp ) );
          this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_down_max_dist", ramp ) );
          
        }
        else{
           this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
        }
       
        if( this.options.AllowCoarseStart.val )
          this.tasks[this.tasks.length - 1].task_options.push( new BoolRobotAction( "coarse_line_start", true ) );
      }
    }
    if( !build_out_vector )
    {
      build_out_vector = new Line( p1, p4 ).unit_vector;
      corners = [ p1, p2 ];
    }
    var stuff = [ corners, build_out_vector ];
    return stuff;
    }
  }
  
  create_goal_corner_new( corner, new_c, oppo_c )
  {
    var p = this.drawing_points;
    var corner_indexes = [ 0, 3, 4, 7 ];
    var corner_index = corner_indexes[corner];
    var new_g1;
    var new_g2;
    var l1 = 0;
    var l2 = 0;
    var m = 0;
    if( this.get_option_val( "Goal corners" ) )
    {
      if( corner_index === 0 || corner_index === 4 )
      {
        new_g1 = new Line( new_c, oppo_c ).unit_vector;
        new_g2 = new Line( new_c, p[corner_index + 1] ).unit_vector;
        var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2) - Math.sqrt( 2 * Math.pow( this.options.LineWidth.val / 2, 2 ) );
        // find line upto
        l1 = new_c.add( new_g1.multiply( corner_radius ) );
        // find line outfrom
        l2 = new_c.add( new_g2.multiply( corner_radius ) );
        // find middle of the two with same radius from corner
        m = new_c.add( new Line( new_c, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      }
      else
      {
        new_g1 = new Line( new_c, oppo_c ).unit_vector;
        new_g2 = new Line( new_c, p[corner_index - 1] ).unit_vector;
        var corner_radius = this.options.CornerRadius.val - (this.options.LineWidth.val / 2) - Math.sqrt( 2 * Math.pow( this.options.LineWidth.val / 2, 2 ) );
        // find line upto
        l1 = new_c.add( new_g2.multiply( corner_radius ) );
        // find line outfrom
        l2 = new_c.add( new_g1.multiply( corner_radius ) );
        // find middle of the two with same radius from corner
        m = new_c.add( new Line( new_c, new Line( l1, l2 ).middle ).unit_vector.multiply( corner_radius ) );
      }

      this.tasks.push( new ArcTask( this.tasks.length, [ l1, m, l2 ], new_c, false, false, true ) );
    }
  }

  create_side_feature_new( which_side )
  {
    if( (which_side === 0 || which_side === 3) && !this.get_option_val( "PitchInPitch 1" ) )
      return;
    if( (which_side === 1 || which_side === 2) && !this.get_option_val( "PitchInPitch 2" ) )
      return;
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var m1 = new Line( c2, c3 ).middle;
    var m2 = new Line( c4, c1 ).middle;
    var this_goal_middle = new Line( p[1], p[2] ).middle;
    var oposite_goal_middle = new Line( p[3], p[4] ).middle;
    var field_guide;
    if( which_side >= 2 )
      field_guide = new Line( oposite_goal_middle, this_goal_middle ).unit_vector;
    else
      field_guide = new Line( this_goal_middle, oposite_goal_middle ).unit_vector;
    var s1, s2;
    switch( which_side )
    {
      case 0:
        s1 = c2;
        s2 = m1;
        break;
      case 1:
        s1 = m1;
        s2 = c3;
        break;
      case 2:
        s1 = c4;
        s2 = m2;
        break;
      case 3:
        s1 = m2;
        s2 = c1;
        break;
    }

    var l1, l2;
    if( which_side === 2 || which_side === 1 )
    {
      l1 = new Line( m1, c3 ).middle;
      l2 = new Line( c4, m2 ).middle;
    }
    else if( which_side === 3 || which_side === 0 )
    {
      l1 = new Line( c2, m1 ).middle;
      l2 = new Line( m2, c1 ).middle;
    }
    var mp = new Line( l1, l2 );
    var g2 = mp.unit_vector;
    if( which_side >= 2 )
      g2 = g2.multiply( -1 );
    mp = mp.middle;
    var g1 = new Line( s1, s2 );
    var m = g1.middle;
    g1 = g1.unit_vector;
    //var g2 = g1.rotate_90_cw();
    //var g2 = field_guide.rotate_90_cw();

    var c1 = m.add( g1.multiply( this.get_option_val( "sideFeatureWidth" ) / 2 ) );
    var feature_start = c1;
    var c2 = c1.add( g2.multiply( this.get_option_val( "sideFeatureLength" ) ) );
    var c2_2, c3_2;
    var c3 = c2.add( g1.multiply( -this.get_option_val( "sideFeatureWidth" ) ) );
    var c4 = c3.add( g2.multiply( -this.get_option_val( "sideFeatureLength" ) ) );
    var c4_1, c4_2;
    if( !this.get_option_val( "Full PitchInPitch" ) )
    {
      var l1 = new Line( c1, c2 ).add_to_end( -1 ).add_to_start( -1 );
      this.tasks.push( new LineTask( this.tasks.length, [ c1, l1.start ], false, true ) );
      c1 = l1.end;
      var l3 = new Line( c4, c3 ).add_to_end( -1 ).add_to_start( -1 );
      c4_1 = c4;
      c4_2 = l3.start;
      c4 = l3.end;
      var l2 = new Line( c2, c3 ).add_to_end( -1 ).add_to_start( -1 );
      c2_2 = l2.start;
      c3_2 = l2.end;
    }

    this.tasks.push( new LineTask( this.tasks.length, [ c1, c2 ], false, true ) );
    var kick_center = new Line( c2, c3 ).middle;
    var kick_guide1 = kick_center.add( g2.multiply( this.options.KickFieldRadius.val ) );
    var kick_guide2 = kick_center.add( g2.multiply( -this.options.KickFieldRadius.val ) );
    if( this.get_option_val( "Full PitchInPitch" ) )
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, kick_center ], false, true ) );
      if( this.options.KickFieldsAsDots.val )
        this.tasks.push( new WaypointTask( this.tasks.length, kick_center, false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ kick_center, c3 ], false, true ) );
    }
    else
    {
      this.tasks.push( new LineTask( this.tasks.length, [ c2, c2_2 ], false, true ) );
      if( this.options.KickFieldsAsDots.val )
        this.tasks.push( new WaypointTask( this.tasks.length, kick_center, false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], kick_center, false, false, true ) );
      this.tasks.push( new LineTask( this.tasks.length, [ c3_2, c3 ], false, true ) );
    }
    this.tasks.push( new LineTask( this.tasks.length, [ c3, c4 ], false, true ) );
    if( !this.get_option_val( "Full PitchInPitch" ) )
      this.tasks.push( new LineTask( this.tasks.length, [ c4_2, c4_1 ], false, true ) );
    if( this.options["Right goal pole"].val )
    {
      var goal_back = m.add( g2.multiply( -this.options.GoalDistFromBack.val ) );
      var right_goal = goal_back.add( g1.multiply( -this.options["sideFeatureGoalWidth"].val / 2 ) );
      this.tasks.push( new WaypointTask( this.tasks.length, right_goal, false, true ) );
    }
    if( this.options["Left goal pole"].val )
    {
      var goal_back = m.add( g2.multiply( -this.options.GoalDistFromBack.val ) );
      var left_goal = goal_back.add( g1.multiply( this.options["sideFeatureGoalWidth"].val / 2 ) );
      this.tasks.push( new WaypointTask( this.tasks.length, left_goal, false, true ) );
    }

    return feature_start;
  }

  create_side( which_side )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];

    if(this.options["corner_markings_only"].val){

      let g2 = new Line(c4, c1).unit_vector;
      
      
      let c1p1 = c1;
      let c1p2 = c1.subtract(g2.multiply(0.5));

      let c2p1 = c2;
      let c2p2 = c2.subtract(g2.multiply(0.5));


      let c3p1 = c3;
      let c3p2 = c3.add(g2.multiply(0.5));
      let c4p1 = c4;
      let c4p2 = c4.add(g2.multiply(0.5));

      let side1Mid = new Line(c1, c4).middle;
      let side1Mid1 = side1Mid.add(g2.multiply(0.5));
      let side1Mid2 = side1Mid.subtract(g2.multiply(0.5)); 

      let side2Mid = new Line(c2, c3).middle;
      let side2Mid1 = side2Mid.add(g2.multiply(0.5));
      let side2Mid2 = side2Mid.subtract(g2.multiply(0.5)); 

      if(which_side === 0){
      this.tasks.push(new LineTask(this.tasks.length, [c2p1, c2p2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [side2Mid1, side2Mid2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [c3p2, c3p1], false, true));
      }
      if(which_side === 1){
      this.tasks.push(new LineTask(this.tasks.length, [c1p1, c1p2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [side1Mid1, side1Mid2], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [c4p2, c4p1], false, true));
      }
    }
    else{
    if( this.options ["running lines"].val )
    {
      var m1 = c3;
      var m2 = c1;
    }
    else
    {
      var m1 = new Line( c2, c3 ).middle;
      var m2 = new Line( c4, c1 ).middle;
    }
    var l1, l2;
    switch( which_side )
    {
      case 0:
        this.start_locations.push( new StartLocation( c2, this.tasks.length ) );
        l1 = c2;
        l2 = m1;
        break;
      case 1:
        l1 = m1;
        l2 = c3;
        break;
      case 2:
        l1 = c4;
        l2 = m2;
        this.start_locations.push( new StartLocation( c4, this.tasks.length ) );
        break;
      case 3:
        l1 = m2;
        l2 = c1;
        break;
    }

    var before_feature = this.tasks.length;
    var split = this.create_side_feature_new( which_side );
    if( split )
    {

      var new_task = new LineTask( this.tasks.length, [ l1, split ], false, true );
      if( which_side === 1 || which_side === 3 )
        new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.splice( before_feature, 0, new_task );
      this.tasks.push( new_task );

      var new_task = new LineTask( this.tasks.length, [ split, l2 ], false, true );
      new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.push( new_task );
    }
    else
    {
      var new_task = new LineTask( this.tasks.length, [ l1, l2 ], false, true );
      if( which_side === 1 || which_side === 3 )
        new_task.task_options.push( new FloatRobotAction( "ramp_up_max_dist", parseFloat( $( "#force_new_internal_ramp_up_length" ).val( ) ) ) );
      this.tasks.push( new_task );
    }

    return new_task.toLine( );
  }
  }


  create_middle( )
  {
    var p = this.drawing_points;
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    var goal_1_middle = new Line( p[1], p[2] ).middle;
    var goal_2_middle = new Line( p[5], p[6] ).middle;
    var goal_middle_middle = new Line( goal_1_middle, goal_2_middle );
    var m2 = new Line( c4, c1 ).middle;
    var m1 = new Line( c2, c3 ).middle;
    var middle_line = new Line( m1, m2 );
    var c;
    let myPoint1 = new Line(c1, c2).middle;
    let myPoint2 = new Line(c3, c4).middle;
    let myCentrePoint = new Line(myPoint1, myPoint2).middle;

   if(this.options["corner_markings_only"].val){
      let g2 = new Line(c1, c2).unit_vector;
      let m2p1 = m2.add(g2.multiply(0.5));
      let m1p1 = m1.subtract(g2.multiply(0.5));
      let center = middle_line.middle;
      let center1 = center.add(g2.multiply(0.05));
      let center2 = center.subtract(g2.multiply(0.05));

      this.tasks.push(new LineTask(this.tasks.length, [m1, m1p1], false, true));
      this.tasks.push(new ArcTask( this.tasks.length, [ center1, center2 ], center, true, false, true ));
      this.tasks.push(new LineTask(this.tasks.length, [m2p1, m2], false, true));
    }else{
    if( this.options.makeFieldsSkew.val )
      c = middle_line.cross_with_line( goal_middle_middle );
    else
      c = middle_line.middle;
    if( !c )
      c = middle_line.middle;
    var g = middle_line.unit_vector;
     if( !this.options["Middle line"] || this.options["Middle line"].val )
       this.tasks.push( new LineTask( this.tasks.length, [ m1, m2 ], false, true ) );
       if( this.options.CenterCircleRadius.val && this.options["Center circle"].val )
       {
     
        var use_radius = (this.options.CenterCircleRadius.val - this.options.LineWidth.val / 2);

        var center_circle_to_big = false;
  
        var center_guide1 = myCentrePoint.add( g.multiply( use_radius ) );
        var center_guide2 = myCentrePoint.add( g.multiply( -use_radius ) );
        var big_circle = new ArcTask( this.tasks.length, [ center_guide1, center_guide2 ], myCentrePoint, true, false, true );
        big_circle.task_options.push( new FloatRobotAction( "ramp_up_max_dist", 3.0 ) );

        if( !center_circle_to_big || this.options.reciseCenterCirlce.val )
          this.tasks.push( big_circle );
      }

    var kick_guide1 = c.add( g.rotate_90_cw( ).multiply( -this.options.KickFieldRadius.val ) );
    var kick_guide2 = c.add( g.rotate_90_cw( ).multiply( this.options.KickFieldRadius.val ) );
    if( this.options.MakeKickDot.val )
    {
      if( this.options.KickFieldsAsDots.val )
        this.tasks.push( new WaypointTask( this.tasks.length, c, false, true ) );
      else
        this.tasks.push( new ArcTask( this.tasks.length, [ kick_guide2, kick_guide1 ], c, false, false, true ) );
    }
  }
  }

  create_buildout( goalend1_corners, goalend2_corners, sides )
  {
    var p = this.drawing_points;
    var g1 = goalend1_corners[1];
    var h1 = goalend2_corners[1];

    var l1, l2;
    if( !this.options.BuildOutDistFromMiddle.val )
    {
      let g1c1 = goalend1_corners[0][0];
      let g1c2 = goalend1_corners[0][1];
      let g2c1 = goalend2_corners[0][0];
      let g2c2 = goalend2_corners[0][1];
      
      let add1;
      let add2;

      if(this.options.BuildOutDistPercentageVal.configurable)
      {
        add1 = this.options.Length.val * (this.options.BuildOutDistPercentageVal.val/100);
        add2 = this.options.Length.val * (this.options.BuildOutDistPercentageVal.val/100);
        if(this.options.Fields.val.length !== 0)
        {
          g1c1 = g1c1.subtract(g1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
          g1c2 = g1c2.subtract(g1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));

          g2c1 = g2c1.subtract(h1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
          g2c2 = g2c2.subtract(h1.multiply( this.options.Fields.val[0].length - this.options.LineWidth.val ));
        }
      }
      else
      {
        add1 = (new Line( g1c1, g2c2 ).length / 2) / 2;
        add2 = (new Line( g1c2, g2c1 ).length / 2) / 2;
      }
      
      l1 = new Line(
        new Line( g1c1.add( g1.multiply( add1 ) ), g1c2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[0] ),
        new Line( g1c1.add( g1.multiply( add1 ) ), g1c2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[2] )
        );
      l2 = new Line(
        new Line( g2c1.add( h1.multiply( add2 ) ), g2c2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[0] ),
        new Line( g2c1.add( h1.multiply( add2 ) ), g2c2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[2] )
        );
    }
    else
    {
      let add1;
      let add2;
      
      add1 = this.options.BuildOutDistFromMiddle.val;
      add2 = this.options.BuildOutDistFromMiddle.val;

      let m1 = (new Line( p[3], p[4] )).middle;
      let m2 = (new Line( p[7], p[0] )).middle;

      l1 = new Line(
        new Line( m1.add( g1.multiply( add1 ) ), m2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[0] ),
        new Line( m1.add( g1.multiply( add1 ) ), m2.add( g1.multiply( add2 ) ) ).cross_with_line( sides[2] )
        );
      l2 = new Line(
        new Line( m1.add( h1.multiply( add2 ) ), m2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[0] ),
        new Line( m1.add( h1.multiply( add2 ) ), m2.add( h1.multiply( add1 ) ) ).cross_with_line( sides[2] )
        );
    }

    this.tasks.push( l1.reverse( ).toLineTask( this.tasks.length, false, true ) );
    this.tasks.push( l2.toLineTask( this.tasks.length, false, true ) );

    var dash_factor = this.options.DashFactorBuildOut.val;
    var dash_length = (this.options.Width.val * dash_factor);

    if( this.options.DashBuildOut.val && !this.options["All dashed lines"].val )
    {
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 2].task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );

      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", dash_length ) );
    }
  }

  drawDashedLines(start, end)
  {

    this.tasks.push( new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_length", this.options["Paints Length"].val ) );
    this.tasks[this.tasks.length - 1].task_options.push( new FloatRobotAction( "dashed_space", this.options["Paints Length"].val ) );

  }



  drawTrainingLines() 
  {

    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    const horizontal = new Line(c2, c3).unit_vector;
    const vertical = horizontal.rotate_90_cw();
    let fromSideLine2goalCornerLength = 0.5 * this.options.Width.val - 0.5 * this.options["Penalty box width"].val - this.options.LineWidth.val;


    // Dashed line on the width sides
    let start = c2.add(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val)).add(vertical.multiply(this.options.LineWidth.val));
    let end = start.add(vertical.multiply( fromSideLine2goalCornerLength + this.options.LineWidth.val));
    this.drawDashedLines(start, end ); // from c2 to goalCorner


    start = end.add(vertical.multiply( this.options["Penalty box width"].val));
    end = c1.add(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val ));
    this.drawDashedLines(start, end ); // from C1 to goalCorner
    

    start = c1.add(horizontal.multiply( 2* this.options["Penalty box depth"].val )).subtract(vertical.multiply( this.options.LineWidth.val ));
    end = c2.add(horizontal.multiply( 2 * this.options["Penalty box depth"].val));
    this.drawDashedLines(start, end ); // The long dashed line close to C1 & C2


    start = c3.subtract(horizontal.multiply( 2 * this.options["Penalty box depth"].val)).add(vertical.multiply( this.options.LineWidth.val ));
    end = c4.subtract(horizontal.multiply( 2* this.options["Penalty box depth"].val ));
    this.drawDashedLines(start, end ); // The long dashed line close to C3 & C4


    start = c4.subtract(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val)).subtract(vertical.multiply(this.options.LineWidth.val));
    end = start.subtract(vertical.multiply(fromSideLine2goalCornerLength));
    this.drawDashedLines(start, end ); // from c4 to goalCorner


    start = end.subtract(vertical.multiply( this.options["Penalty box width"].val + this.options.LineWidth.val));
    end = c3.subtract(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val ));
    this.drawDashedLines(start, end ); // from C1 to goalCorner


    
    // Dashed lines on the length sides
    let spaceBetweenLines = 0.25 * this.options["Penalty box width"].val;

    start = c3.add(vertical.multiply( fromSideLine2goalCornerLength + this.options.LineWidth.val )).subtract(horizontal.multiply( this.options["Penalty box depth"].val + this.options.LineWidth.val ));
    end = c2.add(horizontal.multiply( this.options["Penalty box depth"].val + this.options.LineWidth.val)).add(vertical.multiply(fromSideLine2goalCornerLength + this.options.LineWidth.val));
    this.drawDashedLines(start, end ); // from goal corner close to C3 to corner close to C2

    
    start = end.add(vertical.multiply ( spaceBetweenLines ));
    end = c3.subtract(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val )).add(vertical.multiply(fromSideLine2goalCornerLength + spaceBetweenLines));
    this.drawDashedLines(start, end ); // The bottom lines close to center circle

   
    start = c4.subtract(horizontal.multiply( this.options["Penalty box depth"].val + this.options.LineWidth.val )).subtract(vertical.multiply(fromSideLine2goalCornerLength + spaceBetweenLines));
    end = c1.add(horizontal.multiply(this.options["Penalty box depth"].val )).subtract(vertical.multiply(fromSideLine2goalCornerLength + spaceBetweenLines));
    this.drawDashedLines(start, end ); // The top lines close to center circle


    start = c1.add(horizontal.multiply(this.options["Penalty box depth"].val )).subtract(vertical.multiply(fromSideLine2goalCornerLength + this.options.LineWidth.val));
    end = c4.subtract(horizontal.multiply( this.options["Penalty box depth"].val - this.options.LineWidth.val )).subtract(vertical.multiply(fromSideLine2goalCornerLength + this.options.LineWidth.val));
    this.drawDashedLines(start, end ); // From corner close to C1 to 


  }




  draw( )
  {  
    if(this.options.reverseInGoal.val)
    {
      this.options["fast_test"].val = false;
      this.options["normal_test"].val = false;
    }
    else
    {
      this.options["fast_test"].val = true;
      this.options["normal_test"].val = true;
    }

    if( this.points.length === 4 )
    {
      let d1 = (new Line( this.points[0], this.points[1] )).unit_vector;
      let d2 = (new Line( this.points[2], this.points[3] )).unit_vector;
      let d = (new Line( d1, d2 )).length;
      if( d < 1 )
      {
        let p2 = this.points[2];
        let p3 = this.points[3];
        this.points[2] = p3;
        this.points[3] = p2;
      }
    }



    if( this.points.length >= 3 && !this.border_is_clockwise() )
    {
      this.points = this.points.reverse();
    }

    var save_CenterCircleRadius = this.options.CenterCircleRadius.val;
    var original_fields = this.options.Fields;
    this.options.Fields = {
      val: JSON.parse( JSON.stringify( this.options.Fields.val ) )
    };
    try
    {

      delete this.calculated_drawing_points;
      this.refresh_snapping_lines();
      this.tasks = [ ];
      this.start_locations = [ ];
      var goalend1 = [ ];
      var goalend2 = [ ];
      var sides = [ ];
      if( this.options.ScalePitch.val )
      {

        var scaleX = this.options.Length.val / this.options.Length.default;
        var scaleY = this.options.Width.val / this.options.Width.default;
        var scale = scaleX;
        if( scaleY < scale )
          scale = scaleY;
        this.options.CenterCircleRadius.val *= scale;
        this.options.Fields.val.forEach( function( field )
        {
          field.width *= scaleY;
          field.length *= scaleX;
          if( field.kick_spot_from_back )
            field.kick_spot_from_back *= scaleX;
          if( field.arc )
          {
            field.arc.radius *= scaleX;
            if( field.arc.center_from_back )
              field.arc.center_from_back *= scaleX;
          }
        } );
      }

       goalend1 = this.create_goalend( 0 );
       this.create_corner( 1 );
       sides.push( this.create_side( 0 ) );




       this.create_middle( );
       sides.push( this.create_side( 1 ) );
       this.create_corner( 2 );
       goalend2 = this.create_goalend( 1 );
       this.create_corner( 3 );
       sides.push( this.create_side( 2 ) );
       sides.push( this.create_side( 3 ) );
       this.create_corner( 0 );
       if( this.options.MakeBuildOut.val && !this.options["corner_markings_only"].val )
         this.create_buildout( goalend1, goalend2, sides );
      this.refresh_bb( );
      this.refresh_handles( );
      this.refresh_test_run( );

    }
    catch( e )
    {
      console.error( "Something whent wrong when drawing a soccer pitch." );
      console.error( e );
      console.error( this.id, this );
    }

    this.options.CenterCircleRadius.val = save_CenterCircleRadius;
    this.options.Fields = original_fields;

    this.tasks = this.tasks.filter( t => {
      return t;
    } );

    // Training lines

    if(this.options["Training Lines"].val)
    {
      this.drawTrainingLines();
    }

  }

  get_rearranged_tasks( robot_position )
  {
    if( this.options.MakeBuildOut.val ) {
      return super.get_rearranged_tasks( robot_position, 2 );
    }
    else {
      return super.get_rearranged_tasks( robot_position );
    }
  }

} 