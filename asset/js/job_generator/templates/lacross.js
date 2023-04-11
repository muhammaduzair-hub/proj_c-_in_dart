/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global ArcTask, five_degrees_equal, login_screen_controller */

class LacrossFunctions extends square_pitch {
  static template_type = "Lacrosse";
  constructor(id, name, layout_method) {
    super(id, name, layout_method);

    this.options.DotBehindGoalRadius = {
      adjustable: false,
      name: "DotBehindGoalRadius",
      val: 0.06,
      type: "float",
      "dontsave": true
    };

    this.options.eight_meters_hash_marks = {
      configurable: true,
      name: "Eight man hash marks",
      val: true,
      type: "bool",

    };
  }

  create_circle_goal(which_goal) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    let c3 = p[4];
    let c4 = p[7];
    let middle = new Line(c1, c2).middle;
    if (which_goal) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }
    let goalc = middle.add(g2.multiply(this.options.GoalDistance.val));
    let goal_circle_radius = this.options.GoalRadius.val - this.options.LineWidth.val / 2;
    let small_arc_radius = (34).foot2meter() + (10).inch2meter() - this.options.LineWidth.val / 2;
    let big_arc_radius = (47).foot2meter() + (9).inch2meter() - this.options.LineWidth.val / 2;
    let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;
    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [guide2, guide1], goalc, true, false, true));
    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options.GoalRadius.val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];
    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));
    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = 4 / small_arc_radius;
    let goal_hash = [];
    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    if (this.options.eight_meters_hash_marks.val) {
      for (let i = -3; i <= 3; i++) {
        let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
        goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
      }
    }

    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-distance_to_dots));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-distance_to_dots));
    this.tasks.push(new WaypointTask(this.tasks.length, dot1_behind_goal, false, true));

    let reverse = false;
    goal_hash.forEach((hash_mark, i) => {
      if (!this.options.DriveOneWay.val && i > 0 && i < (goal_hash.length - 1) && reverse)
        this.tasks.push(hash_mark.reverse().toLineTask(this.tasks.length, false, true));
      else
        this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });

    this.tasks.push(new WaypointTask(this.tasks.length, dot2_behind_goal, false, true));

    // big circle
    let big_arc_start = goalc.add(g1.multiply(-big_arc_radius));
    let big_arc_middle = goalc.add(g2.multiply(big_arc_radius));
    let big_arc_end = goalc.add(g1.multiply(big_arc_radius));

    this.tasks.push(new ArcTask(this.tasks.length, [big_arc_start, big_arc_middle, big_arc_end], goalc, false, false, true));

    // Back line
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_end, guide1], false, true));
    if (this.options.GoalLine.val) {
      if (this.options.FullGoalLine.val)
        this.tasks.push(new LineTask(this.tasks.length, [guide1, guide2], false, true));
      else {
        let goal_line = new Line(guide1, guide2);
        let too_long = goal_line.length - this.options.GoalWidth.val - this.options.LineWidth.val;
        if (too_long > 0)
          goal_line = goal_line.add_to_start(-too_long / 2).add_to_end(-too_long / 2);
        this.tasks.push(new LineTask(this.tasks.length, [goal_line.start, goal_line.end], false, true));
      }
    }
    this.tasks.push(new LineTask(this.tasks.length, [guide2, big_arc_start], false, true));
  }
};

class UsLacrossMen extends square_pitch {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Men"; // Translateable
  static template_id = "us_lacross_men"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;

    this.options.Length = {
      adjustable: true,
      name: "Length",
      _val: 0,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v < 55) {
          this._val = 55;
        }
        else {
          this._val = v;
        }
      },
      type: "float"
    };
    this.options.GoalRadius = {
      name: "Goal circle Radius",
      val: (9).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      _val: false,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v) {
          this_class.options.CenterSquare.val = false;
        }
        this._val = v;
      },
      type: "bool"
    };
    this.options.CenterSquare = {
      configurable: true,
      name: "Center Square",
      _val: false,
      get val() {
        return this._val;
      },
      set val(v) {
        if (v) {
          this_class.options.CenterCross.val = false;
        }
        this._val = v;
      },
      type: "bool"
    };
    this.options.HashLength = {
      name: "Hash Marks length",
      val: (2).foot2meter(),
      min: (1).foot2meter(),
      type: "float",
      _configurable: this_class.options.CenterCross.val,
      get configurable() {
        if (this_class.options.CenterCross.val) {
          return true;
        }
        return false;
      },
      set configurable(_) {},
      prev_sibling: "CenterCross"
    };
    this.options.Crease = {
      configurable: true,
      name: "Crease",
      val: false,
      type: "bool"
    };
    this.options.Youth = {
      configurable: true,
      name: "Youth Lacrosse",
      val: false,
      type: "bool"
    };
    this.options.touth_bench_area = {
      get configurable() {
        if (this_class.options.Youth.val)
          return this_class.options.Youth.val;
        else
          return this_class.options.lacrosseUnified.val;
      },
      name: "Bench area",
      val: false,
      type: "bool",
      prev_sibling: "Youth"
    };
    this.options.youth_bench_area_depth = {
      get configurable() {
        return this_class.options.touth_bench_area.val && this_class.options.Youth.val;
      },
      name: "Youth bench area depth",
      val: (5).yard2meter(),
      type: "float",
      prev_sibling: "touth_bench_area"
    };
    this.options.lacrosseUnified = {
      configurable: true,
      name: "Small lacrosse unified",
      val: false,
      type: "bool",
      prev_sibling: "Dashed Side Lines",
    }
    this.options.smallArcRadius =
    {
      name: "Arc radius",
      val: (35).foot2meter() + (4).inch2meter(),
      type: "float",
      get configurable() {
        return this_class.options.lacrosseUnified.val
      },
    }
    this.options.goalHashDist =
    {
      name: "Distance between lines on arc",
      val: (13).foot2meter() + (2).inch2meter(),
      type: "float",
      get configurable() {
        return this_class.options.lacrosseUnified.val;
      },
    }
    this.options.drawHalfField =
    {
      configurable: true,
      name: "Draw half field only",
      val: false,
      type: "bool",

    }
    this.options.attackArea =
    {
      configurable: false,
      name: "Attack area width",
      val: (35).yard2meter(),
      type: "bool",
    };
    this.options.MidFieldArea = {
      name: "Mid field width",
      val: (40).yard2meter(),
      type: "float",
      "dontsave": true
    };
    this.options["Side Bench"] = {
      configurable: true,
      name: "Bench on the length side",
      val: false,
      type: "bool",
    };
    this.options["Dashed Side Lines"] = {
      get configurable() {
        return this_class.options["Side Bench"].val;
      },
      name: "Dashed lines on the side field",
      val: false,
      type: "bool",
      prev_sibling: "Side Bench",
    };
    this.options.SubstitutionLength = {
      configurable: false,
      name: "Substitution area - length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.SubstitutionWidth = {
      configurable: false,
      name: "Substitution area - width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.BehindCoachWidth = {
      configurable: false,
      name: "The area behind the substitution",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.CoachBenchLength = {
      configurable: false,
      name: "Coaches area from one to other side",
      val: (20).yard2meter(),
      type: "bool",
    };
    this.options.CoachAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.CoeachAreaDashedLength = {
      configurable: false,
      name: "The length of dashed coaches area ",
      val: (50).yard2meter(),
      type: "float"
    };
    this.options.DashedSideLineWidth = {
      configurable: false,
      name: "The dashed area width - from field side",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (20).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaLength = {
      configurable: false,
      name: "Coach area width",
      val: this.options.CoeachAreaDashedLength.val,
      type: "float",
    };
    this.options.TimerLength = {
      configurable: false,
      name: "Timer Length",
      val: (8).yard2meter(),
      type: "float",
    };
    this.options.TimerWidth = {
      configurable: false,
      name: "Timer width",
      val: (2).yard2meter(),
      type: "float",
    };
    this.options.TimerDistanceFromSideLine = {
      configurable: false,
      name: "Distance from side line",
      val: (7).yard2meter(),
      type: "float",
    };
    this.options.ExtraSidelineLength = {
      configurable: false,
      name: "Dashed lines on the side of field",
      val: (5).yard2meter(),
      type: "float",
    };
    this.options.DashedDistanceOnTopSide = {
      configurable: false,
      name: "The distance of the dashed sideline on bench side",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.DashedDistanceOnBottomSide = {
      configurable: false,
      name: "The distance of the dashed sideline on other side",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.BenchDistanceFromCoachArea = {
      configurable: false,
      name: "The distance between coach team area and bench",
      val: (2.5).yard2meter(),
      type: "float",
    };
    this.options.BenchBoxLength = {
      configurable: false,
      name: "Bench box length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.BenchBoxWidth = {
      configurable: false,
      name: "Bench box width",
      val: (3).yard2meter(),
      type: "float",
    };
    this.options.Scale = {
      configurable: true,
      name: "Scale midfield and benches",
      val: false,
      type: "bool",
      
    };

    let totalLength = (110).yard2meter() + this.options.LineWidth.val;
    let totalWidth = (60).yard2meter() + this.options.LineWidth.val;

    this.options.Length.val = totalLength; 
    this.options.Width.val = totalWidth ; 
    
    this.options.CustomAttackArea = {
    configurable : true,
    name : "Custom attack area width",
    type : "bool",
    val  : false
    };
    this.options.AttackAreaWidth = {
      get configurable()
      {
        return this_class.options.CustomAttackArea.val;
      },
      name : "Attack area width",
      type : "float",
      val  : (120).foot2meter(),
      prev_sibling: "CustomAttackArea"
    };
    
  }
  static get layout_methods() {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  refresh_handles() {
    super.refresh_handles();
    let this_class = this;
    this.handles = [];
    let p = this.drawing_points;
    // Free hand handles
    if (this.layout_method === "free_hand") {

      this.handles.push(new Handle(new Line(p[4], p[7]).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {

        let g = new Line(p[0], p[7]);
        let new_length = g.start.dist_to_point(g.point_on_line(new_pos_v));

        if (new_length < 55) {
          new_length = 55;
        }
        this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, 0);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[5], new_ps[6])], snapping_lines)[0];
        if (angle_equal(align_this.angle, this_class.options.Angle.val) < five_degrees_equal) {
          new_length += align_this.length;
        }
        else if (angle_equal(align_this.angle + Math.PI, this_class.options.Angle.val) < five_degrees_equal) {
          new_length -= align_this.length;
        }

        this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, 0);
      }, function (new_length) {
        return this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, 0);
      }));
      this.handles.push(new Handle(new Line(p[0], p[3]).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {
        let g = new Line(p[7], p[0]);
        let new_length = g.start.dist_to_point(g.point_on_line(new_pos_v));
        if (new_length < 55) {
          new_length = 55;
        }

        this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, Math.PI);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[1], new_ps[2])], snapping_lines)[0];
        if (angle_equal(align_this.angle, this_class.options.Angle.val) < five_degrees_equal) {
          new_length -= align_this.length;
        }
        else if (angle_equal(align_this.angle + Math.PI, this_class.options.Angle.val) < five_degrees_equal) {
          new_length += align_this.length;
        }

        this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, Math.PI);
      }, function (new_length) {
        return this_class.change_width_or_length_with_center_point(this_class.options.Length, new_length, Math.PI);
      }));
      this.handles.push(new Handle(new Line(p[3], p[4]).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {
        let g = new Line(p[0], p[3]);
        let new_width = g.start.dist_to_point(g.point_on_line(new_pos_v));
        this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, Math.PI / 2);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[3], new_ps[4])], snapping_lines)[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width -= align_this.length;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width += align_this.length;
        }

        this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, Math.PI / 2);
      }, function (new_width) {
        return this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, Math.PI / 2);
      }));
      this.handles.push(new Handle(new Line(p[0], p[7]).middle, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {
        let g = new Line(p[3], p[0]);
        let new_width = g.start.dist_to_point(g.point_on_line(new_pos_v));
        this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, -Math.PI / 2);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[0], new_ps[7])], snapping_lines)[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width += align_this.length;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width -= align_this.length;
        }

        this_class.change_width_or_length_with_center_point(this_class.options.Width, new_width, -Math.PI / 2);
      }, function (new_length) {
        return this_class.change_width_or_length_with_center_point(this_class.options.Width, new_length, -Math.PI / 2);
      }));
      let e1 = new Line(p[1], p[2]).middle;
      let e2 = new Line(p[5], p[6]).middle;
      let pitch_center = new Line(e1, e2).middle;
      this.handles.push(new Handle(pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function (new_pos_v, snapping_lines) {

        this_class.points = [new_pos_v];
        delete this_class.calculated_drawing_points;
        this_class.draw();
        let align_this = this_class.get_align_move(this_class.snapping_lines, snapping_lines);
        align_this = align_this[0];
        this_class.points = [new_pos_v.subtract(align_this)];
        delete this_class.calculated_drawing_points;
        this_class.draw();
      }, function (new_pos_v) {

        this_class.points = [new_pos_v];
        this_class.draw();
        return true;
      }));
      let gml = new Line(pitch_center, p[0]).as_vector.angle - this.options.Angle.val;
      this.handles.push(new Handle(p[0], this.options.Angle.val, "Angle", "turn_handle", "yellow_turn_handle", function (new_pos_v, snapping_lines) {

        let new_angle = new Line(pitch_center, new_pos_v).as_vector.angle - gml;
        new_angle = this_class.get_snap_rotation(new_angle, snapping_lines)[0];
        if (new_angle.veryclose(0))
          this_class.options.Angle.val = 0;
        else
          this_class.options.Angle.val = new_angle;

        //if()
        delete this.calculated_drawing_points;
        this_class.draw();
      }, function (new_angle) {
        return this_class.set_new_val(this_class.options.Angle, new_angle);
      }, "deg"));
    }
    else if (login_screen_controller.user_level === user_level.DEVELOPER) {
      let e1 = new Line(p[1], p[2]).middle;
      let e2 = new Line(p[5], p[6]).middle;
      let pitch_center = new Line(e1, e2).middle;
      let original_points = this_class.points.copy();
      this.handles.push(new Handle(pitch_center, 0, "Move", "move_handle", "yellow_move_handle", function (new_pos_v) {

        let diff_vec = new_pos_v.subtract(pitch_center);
        this_class.points = original_points.map(function (p) {
          return p.add(diff_vec);
        });
        delete this_class.calculated_drawing_points;
        this_class.draw();
      }, function (new_pos_v) {

        let diff_vec = new_pos_v.subtract(pitch_center);
        this_class.points = original_points.map(function (p) {
          return p.add(diff_vec);
        });
        delete this_class.calculated_drawing_points;
        this_class.draw();
        return true;

      }));
    }

    // 2 points handles
    if (this.layout_method === "corner,side") {

      this.handles.push(new Handle(new Line(p[1], p[2]).middle, -this.options.Angle.val + Math.PI / 2, "Length", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {

        let g = new Line(p[4], p[3]);
        let new_length = g.start.dist_to_point(g.point_on_line(new_pos_v));
        this_class.set_new_val(this_class.options.Length, new_length);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[1], new_ps[2])], snapping_lines)[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_length += align_this.length;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_length -= align_this.length;
        }

        this_class.set_new_val(this_class.options.Length, new_length);
      }, function (new_length) {
        return this_class.set_new_val(this_class.options.Length, new_length);
      }));
      let handle_center = new Line(p[3], p[4]).middle;
      if (this.options.Rotation.val === 1 || this.options.Rotation.val === 4)
        handle_center = new Line(p[0], p[7]).middle;
      this.handles.push(new Handle(handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {

        let g = new Line(p[0], p[3]);
        if (this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4)
          g = new Line(p[3], p[0]);
        let new_width = g.start.dist_to_point(g.point_on_line(new_pos_v));
        this_class.set_new_val(this_class.options.Width, new_width);
        let new_ps = this_class.drawing_points;
        let align_this;
        if (this_class.options.Rotation.val === 1 || this_class.options.Rotation.val === 4)
          align_this = this_class.get_align_move([new Line(new_ps[0], new_ps[7])], snapping_lines);
        else
          align_this = this_class.get_align_move([new Line(new_ps[3], new_ps[4])], snapping_lines);
        let the_lines = align_this[1];
        align_this = align_this[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width += align_this.length;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width -= align_this.length;
        }

        this_class.set_new_val(this_class.options.Width, new_width);
        return the_lines;
      }, function (new_width) {
        return this_class.set_new_val(this_class.options.Width, new_width);
      }));
    }

    // 2 corners handles
    if (this.layout_method === "two_corners") {

      let handle_center = new Line(p[3], p[4]).middle;
      if (this_class.options.Rotation.val % 2)
        handle_center = new Line(p[0], p[7]).middle;
      this.handles.push(new Handle(handle_center, -this.options.Angle.val, "Width", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {

        let g = new Line(p[0], p[3]);
        if (this_class.options.Rotation.val % 2)
          g = new Line(p[3], p[0]);
        let new_width = g.start.dist_to_point(g.point_on_line(new_pos_v));
        this_class.set_new_val(this_class.options.Width, new_width);
        let new_ps = this_class.drawing_points;
        let align_this;
        if (this_class.options.Rotation.val % 2)
          align_this = this_class.get_align_move([new Line(new_ps[0], new_ps[7])], snapping_lines);
        else
          align_this = this_class.get_align_move([new Line(new_ps[3], new_ps[4])], snapping_lines);
        let the_lines = align_this[1];
        align_this = align_this[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width += align_this.length;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width -= align_this.length;
        }

        this_class.set_new_val(this_class.options.Width, new_width);
        return the_lines;
      }, function (new_width) {
        return this_class.set_new_val(this_class.options.Width, new_width);
      }));
    }

    if (this.layout_method === "all_goal_posts") {
      let handle1 = new Line(p[3], p[4]);
      let handle2 = new Line(p[0], p[7]);
      let center_line = new Line(handle1.middle, handle2.middle);
      let center = center_line.middle;
      this.handles.push(new Handle(handle1.middle, -handle1.angle, "Width", "Handle", "Yellow_Handle", function (new_pos_v, snapping_lines) {
        let new_width = center.dist_to_point(center_line.point_on_line(new_pos_v)) * 2;
        this_class.set_new_val(this_class.options.Width, new_width);
        let new_ps = this_class.drawing_points;
        let align_this = this_class.get_align_move([new Line(new_ps[3], new_ps[4])], snapping_lines)[0];
        if (angle_equal(align_this.angle + Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width -= align_this.length * 2;
        }
        else if (angle_equal(align_this.angle - Math.PI / 2, this_class.options.Angle.val) < five_degrees_equal) {
          new_width += align_this.length * 2;
        }

        this_class.set_new_val(this_class.options.Width, new_width);
      }, function (new_width) {
        return this_class.set_new_val(this_class.options.Width, new_width);
      }));
      this.handles.push(new Handle(handle2.middle, -handle2.angle, "Width", "Handle", "Yellow_Handle", function (new_pos_v) {
        let new_width = center.dist_to_point(center_line.point_on_line(new_pos_v)) * 2;
        this_class.set_new_val(this_class.options.Width, new_width);
      }, function (new_width) {
        return this_class.set_new_val(this_class.options.Width, new_width);
      }));
    }
  }

  connect_to_sides(start, end, s1, s2) {
    let line = new Line(new Line(start, end).cross_with_line(s1), new Line(start, end).cross_with_line(s2));
    return line;
  }

  create_side(which_side, p, o, s, wa) {
    {
    }

    let mid = s[0];
    let draw_mid, side;
    switch (which_side) {
      case 0:
        draw_mid = true;
        side = s[3];
        break;
      case 1:
        draw_mid = false;
        side = s[4];
        break;
    }

    this.tasks.push(new LineTask(this.tasks.length, [side.start, side.cross_with_line(mid)], false, true));
    if (draw_mid)
      this.create_middle(p, o, s, wa);
    this.tasks.push(new LineTask(this.tasks.length, [side.cross_with_line(mid), side.end], false, true));
  }
  create_goal(which_goal, p, o, s, goal_center) {
    let g1 = o[0];
    let g2 = o[1];
    let h1 = o[2];
    let h2 = o[3];

    let end, m1, m2;

    switch (which_goal) {
      case 0:
        end = -1;
        m1 = g1;
        m2 = g2;
        break;
      case 1:
        end = 1;
        m1 = h1;
        m2 = h2;
        break;
    }
    let goalStart = goal_center.add(m2.multiply((-9).foot2meter()));
    let goalEnd = goal_center.add(m2.multiply((9).foot2meter()));

    this.tasks.push(new ArcTask(this.tasks.length, [goalStart, goalEnd], goal_center, true, false, true));

    if (this.options.Crease.val) {
      this.tasks.push(new LineTask(this.tasks.length, [goal_center.add(m2.multiply((-(6).foot2meter() / 2) * end)),
      goal_center.add(m2.multiply(((6).foot2meter() / 2) * end))], false, true));
      this.tasks.push(new ArcTask(this.tasks.length,
        [
          goal_center.add(m2.multiply((-6 / 2).foot2meter() * end)),
          goal_center.add(m1.multiply((6 / 2).foot2meter() * end)),
          goal_center.add(m2.multiply((6 / 2).foot2meter() * end))
        ], goal_center, true, false, true));
    }
    else
      this.tasks.push(new LineTask(this.tasks.length, [goal_center.add(m2.multiply((-(6).foot2meter() / 2 + this.options.LineWidth.val / 2) * end)),
      goal_center.add(m2.multiply(((6).foot2meter() / 2 - this.options.LineWidth.val / 2) * end))], false, true));
  }
  create_end( which_end, p, o, s )                          // Change here
  {
    {
      var g1 = o[0];
      var g2 = o[1];
      var h1 = o[2];
      var h2 = o[3];
      var l2 = o[11];
      var l1 = l2.rotate_90_cw();
    }
    var mid = s[0];

    if(this.options.CustomAttackArea.val)
    {
      var wa1 = new Line(
        s[1].middle.subtract( l2.multiply( this.options.AttackAreaWidth.val/2)),
        s[2].middle.subtract( l2.multiply( this.options.AttackAreaWidth.val/2)));
      var wa2 = new Line(
        s[1].middle.add( l2.multiply( this.options.AttackAreaWidth.val/2) ) ,
        s[2].middle.add( l2.multiply( this.options.AttackAreaWidth.val/2) ) );
    }else{
    var wa1 = new Line(
      s[1].middle.subtract( l2.multiply( this.options.Width.val/3)),
      s[2].middle.subtract( l2.multiply( this.options.Width.val/3)));
    var wa2 = new Line(
      s[1].middle.add( l2.multiply( this.options.Width.val/3) ) ,
      s[2].middle.add( l2.multiply( this.options.Width.val/3) ) );
    }

    let m1, m2, end, side, first_side, last_side, wing_area;

    switch (which_end) {
      case 0:
        m1 = g1;
        m2 = g2;
        end = -1;
        side = s[1];
        first_side = s[3];
        last_side = s[4];
        wing_area = [wa1, wa2];
        break;
      case 1:
        m1 = h1;
        m2 = h2;
        end = 1;
        side = s[2];
        first_side = s[4];
        last_side = s[3];
        wing_area = [wa2.reverse(), wa1.reverse()];
        break;
    }

    const ratio = 0.5 * this.options.MidFieldArea.val / (this.options.attackArea.val + this.options.LineWidth.val / 2);

    const mutableLength = 0.5 * (this.options.Length.val - this.options.MidFieldArea.val);
    let goal_center = mid.middle.add(m1.multiply((0.5 * this.options.MidFieldArea.val + (mutableLength * ratio)) * end));
    if (this.options.Scale.val) {
      goal_center = mid.middle.add(m1.multiply(((40.055).yard2meter() / (0.5 * (110).yard2meter()) * end) * (this.options.Length.val * 0.5)));
    }
    let goal_line;
    if (this.options.Scale.val) {
      goal_line = this.connect_to_sides(
        mid.start.add(m1.multiply(((20).yard2meter() / (110).yard2meter()) * this.options.Length.val * end)),
        mid.end.add(m1.multiply(((20).yard2meter() / (110).yard2meter()) * this.options.Length.val * end)), first_side, last_side);
      this.tasks.push(new LineTask(this.tasks.length, [side.start, wing_area[0].start], false, true));
    }
    else {
      goal_line = this.connect_to_sides(
        mid.start.add(m1.multiply(((20).yard2meter()) * end)),
        mid.end.add(m1.multiply(((20).yard2meter()) * end)), first_side, last_side);
      this.tasks.push(new LineTask(this.tasks.length, [side.start, wing_area[0].start], false, true));
    }

    let wing1 = new Line(wing_area[0].start, wing_area[0].cross_with_line(goal_line));
    let c1 = wing1.middle;
    let a1 = c1.add(g1.multiply((9).foot2meter()));
    let a2 = c1.subtract(g1.multiply((9).foot2meter()));
    this.tasks.push(new LineTask(this.tasks.length, [wing1.start, wing1.end], false, true));

    if (this.options.Youth.val)
      this.tasks.push(new ArcTask(this.tasks.length, [a1, a2], c1, true, false, true));

    this.tasks.push(goal_line.reverse().toLineTask(this.tasks.length, false, true));
    let wing2 = new Line(wing_area[1].cross_with_line(goal_line), wing_area[1].start);
    let c2 = wing2.middle;
    let a3 = c2.add(g1.multiply((9).foot2meter()));
    let a4 = c2.subtract(g1.multiply((9).foot2meter()))

    this.tasks.push(new LineTask(this.tasks.length, [wing2.start, wing2.end], false, true));

    if (this.options.Youth.val)
      this.tasks.push(new ArcTask(this.tasks.length, [a3, a4], c1, true, false, true));

    if (this.options.lacrosseUnified.val) {
      let goalc;
      let m1temp = m1;
      let m2temp = m2;
      for (let b = 0; b < 2; b++) {
        if (b === 0)
          goalc = wing1.middle;
        else
          goalc = wing2.middle;

        if (which_end === 0 && b === 1 || which_end === 1 && b === 0) {
          m1 = m1.rotate(Math.PI);
          m2 = m2.rotate(Math.PI);
        }
        else {
          m2 = m2temp
          m1 = m1temp;
        }
        let goal_circle_radius = this.options.GoalRadius.val - this.options.LineWidth.val / 2;
        let small_arc_radius = this.options.smallArcRadius.val - this.options.LineWidth.val / 2;
        let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;

        // Goal circle
        let guide1 = goalc.subtract(m1.multiply(-goal_circle_radius));
        let guide2 = goalc.subtract(m1.multiply(goal_circle_radius));
        this.tasks.push(new ArcTask(this.tasks.length, [guide2, guide1], goalc, true, false, true));

        // Small circle
        let back_of_goal_circle = goalc.subtract(m2.multiply(this.options.GoalRadius.val));
        let AB_guide2 = new Line(back_of_goal_circle, guide2);
        let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
        let small_arc_middle = goalc.add(m1.multiply(small_arc_radius).rotate_90_ccw());
        let AB_guide1 = new Line(back_of_goal_circle, guide1);

        let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];

        this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));

        // small circle hash marks
        let middle_has_guide = new Line(goalc, goalc.add(m1.rotate_90_ccw())).unit_vector;
        let goal_hash_radians_between = (this.options.goalHashDist.val + this.options.LineWidth.val * 2) / small_arc_radius;
        let goal_hash = [];

        goal_hash.push(new Line(goalc.add(m1.multiply(-small_arc_radius)), goalc.add(m1.multiply(-small_arc_radius)).add(m2.multiply((1).foot2meter()))));
        for (let i = -3; i <= 3; i++) {
          let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
          goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - (1).foot2meter() / 2)), goalc.add(hash_guide.multiply(small_arc_radius + (1).foot2meter() / 2))));
        }
        goal_hash.push(new Line(goalc.add(m1.multiply(small_arc_radius)).add(m2.multiply((1).foot2meter())), goalc.add(m1.multiply(small_arc_radius))));

        let dot2_behind_goal = goal_hash.last().end.subtract(m1.multiply(-distance_to_dots).rotate_90_cw());
        let dot1_behind_goal = goal_hash[0].start.subtract(m1.multiply(-distance_to_dots).rotate_90_cw());
        let dot1_guide1 = dot1_behind_goal.add(g1.multiply(0.05));
        let dot1_guide2 = dot1_behind_goal.subtract(g1.multiply(0.05));
        let dot2_guide1 = dot2_behind_goal.add(g1.multiply(0.05));
        let dot2_guide2 = dot2_behind_goal.subtract(g1.multiply(0.05));
        this.tasks.push(new ArcTask(this.tasks.length, [dot2_guide1, dot2_guide2], dot2_behind_goal, true, false, true));
        let reverse = false;
        goal_hash.reverse();

        //Removes the hash lines if they go behind the goal line
        let mid_between_dots = new Line(dot1_behind_goal, dot2_behind_goal).middle;
        let point_on_goalline1 = goalc.add(g1.multiply(small_arc_radius));
        let point_on_goalline2 = goalc.add(g1.multiply(-small_arc_radius));
        let result = goal_hash.filter(hash => hash.start.dist_to_point(mid_between_dots) > point_on_goalline1.dist_to_point(mid_between_dots) || hash.start.dist_to_point(mid_between_dots) > point_on_goalline2.dist_to_point(mid_between_dots));
        goal_hash = result;

        goal_hash.forEach((hash_mark, i) => {
          if (i > 0 && i < (goal_hash.length - 1) && reverse)
            this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
          else
            this.tasks.push(hash_mark.reverse().toLineTask(this.tasks.length, false, true));
          reverse = !reverse;
        });
        this.tasks.push(new ArcTask(this.tasks.length, [dot1_guide1, dot1_guide2], dot1_behind_goal, true, false, true));
      }
    }

    if (this.options.Youth.val || this.options.lacrosseUnified.val) {
      // make outside stuff
      if (this.options.touth_bench_area.val && !this.options.lacrosseUnified.val) {
        let side_stuff_depth = this.options.youth_bench_area_depth.val;
        let table_area_width = (16).yard2meter() - this.options.LineWidth.val;
        let table_area_c1 = side.middle.add(side.unit_vector.multiply(table_area_width / 2));
        let table_area_c2 = table_area_c1.add(wing2.unit_vector.multiply(side_stuff_depth));
        let table_area_c2_out = table_area_c1.add(wing2.unit_vector.multiply(side_stuff_depth + (1).foot2meter()));
        let coaches_area1_c1 = table_area_c1.add(side.unit_vector.multiply((12).yard2meter() + this.options.LineWidth.val));
        let coaches_area1_c2 = coaches_area1_c1.add(wing2.unit_vector.multiply(side_stuff_depth));
        let table_area_c3 = side.middle.add(side.unit_vector.multiply(-table_area_width / 2));
        let table_area_c4 = table_area_c3.add(wing1.unit_vector.multiply(-side_stuff_depth));
        let table_area_c4_out = table_area_c3.add(wing1.unit_vector.multiply(-side_stuff_depth - (1).foot2meter()));
        let coaches_area2_c1 = table_area_c3.add(side.unit_vector.multiply((-12).yard2meter() - this.options.LineWidth.val));
        let coaches_area2_c2 = coaches_area2_c1.add(wing1.unit_vector.multiply(-side_stuff_depth));
        let line_length = (2).foot2meter();
        let space_length = (2).foot2meter();
        this.tasks.push(new LineTask(this.tasks.length, [coaches_area1_c1, coaches_area1_c2], false, true));
        this.add_dash_on_last(line_length, space_length);
        this.tasks.push(new LineTask(this.tasks.length, [coaches_area1_c2, table_area_c2], false, true));
        this.add_dash_on_last(line_length, space_length);
        this.tasks.push(new LineTask(this.tasks.length, [table_area_c2, table_area_c4], false, true));
        this.tasks[this.tasks.length - 1].task_options.push(new BoolRobotAction("task_merge_next", false));
        this.tasks.push(new LineTask(this.tasks.length, [table_area_c4, coaches_area2_c2], false, true));
        this.add_dash_on_last(line_length, space_length);
        this.tasks.last().align_dash_to_end();
        this.tasks.push(new LineTask(this.tasks.length, [coaches_area2_c2, coaches_area2_c1], false, true));
        this.add_dash_on_last(line_length, space_length);
        this.tasks.push(new LineTask(this.tasks.length, [table_area_c3, table_area_c4_out], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [table_area_c2_out, table_area_c1], false, true));
      }
      if (this.options.touth_bench_area.val && !this.options.Youth.val) {
        let dash_length = (1.5).foot2meter();
        let dash_space = dash_length;
        m1 = m1.rotate_90_ccw();
        m2 = m2.rotate_90_ccw();
        let sideMid = goal_line.middle;
        let T_areaP1 = sideMid.add(m1.multiply((8).yard2meter()));
        let T_areaP2 = sideMid.subtract(m1.multiply((8).yard2meter()));
        let T_areaP3 = T_areaP1.add(m2.multiply((10).yard2meter()));
        let T_areaP4 = T_areaP2.add(m2.multiply((10).yard2meter()));
        let T_areaP5 = T_areaP1.add(m2.multiply((6).yard2meter()));
        let T_areaP6 = T_areaP2.add(m2.multiply((6).yard2meter()));

        let C_areaP1 = T_areaP1.add(m1.multiply((12).yard2meter()));
        let C_areaP2 = T_areaP2.subtract(m1.multiply((12).yard2meter()));
        let C_areaP3 = C_areaP1.add(m2.multiply((6).yard2meter()));
        let C_areaP4 = C_areaP2.add(m2.multiply((6).yard2meter()));

        this.tasks.push(new LineTask(this.tasks.length, [C_areaP1, C_areaP3], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [C_areaP3, T_areaP5], false, true));

        for (let i = 1; i <= 2; i++) {
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_offset", 0));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_length", dash_length));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_space", dash_space));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("ramp_up_max_dist", 3));
          this.tasks[this.tasks.length - i].action_options.push(new FloatRobotAction("drive_max_velocity", 0.8));
        }
        this.tasks.push(new LineTask(this.tasks.length, [T_areaP5, T_areaP6], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [T_areaP6, C_areaP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [C_areaP4, C_areaP2], false, true));

        for (let i = 1; i <= 2; i++) {
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_offset", 0));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_length", dash_length));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_space", dash_space));
          this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("ramp_up_max_dist", 3));
          this.tasks[this.tasks.length - i].action_options.push(new FloatRobotAction("drive_max_velocity", 0.8));
        }
        this.tasks.push(new LineTask(this.tasks.length, [T_areaP2, T_areaP4], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [T_areaP3, T_areaP1], false, true));
      }

      // create middle part
      let middle_wing = new Line(side.middle, goal_line.middle);
      this.tasks.push(new LineTask(this.tasks.length, [middle_wing.start, middle_wing.end], false, true));
      this.create_cross(middle_wing.middle, middle_wing.unit_vector.multiply((1).foot2meter()));
    }

    this.create_goal(which_end, p, o, s, goal_center);
    this.tasks.push(new LineTask(this.tasks.length, [wing_area[0].start, side.end], false, true));

    return wing_area;
  }
  add_dash_on_last(line_length, space_length) {
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", line_length));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_space", space_length));
    this.tasks[this.tasks.length - 1].task_options.push(new BoolRobotAction("task_merge_next", false));
  }
  create_cross(center, guide) {
    let c1 = guide.rotate(Math.PI / 4);
    let c2 = c1.rotate_90_cw();
    let l1 = new Line(center.add(c1), center.subtract(c1));
    let l2 = new Line(center.add(c2), center.subtract(c2));
    this.tasks.push(new LineTask(this.tasks.length, [l1.start, l1.end], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [l2.start, l2.end], false, true));
  }
  create_middle(p, o, s, wa) {
    let l1 = o[10];
    let mid = s[0];
    let lineLength1 = (10).yard2meter() + this.options.LineWidth.val / 2;
    let lineLength2 = (-10).yard2meter() - this.options.LineWidth.val / 2;

    if (this.options.drawHalfField.val) {
      lineLength1 = (0).yard2meter();
    }

    let first = wa[0].cross_with_line(mid);
    let last = wa[1].cross_with_line(mid);
    this.drawMidLine(s[0]);

    if (this.options.Scale.val) {
      this.tasks.push(new LineTask(this.tasks.length, [first.add(l1.multiply((lineLength2 / (110).yard2meter()) * this.options.Length.val)), first.add(l1.multiply((lineLength1 / (110).yard2meter()) * this.options.Length.val))], false, true));
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [first.add(l1.multiply(lineLength2)), first.add(l1.multiply(lineLength1))], false, true));
    }
    if (this.options.Scale.val) {
      this.tasks.push(new LineTask(this.tasks.length, [last.add(l1.multiply((lineLength1 / (110).yard2meter()) * this.options.Length.val)), last.add(l1.multiply((lineLength2 / (110).yard2meter()) * this.options.Length.val))], false, true));
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [last.add(l1.multiply(lineLength1)), last.add(l1.multiply(lineLength2))], false, true));
    }
  }

  drawMidLine(midLine) {
    if (this.options.CenterSquare.val) {
      const guideVector = new Vector(0, 1).rotate(this.options.Angle.val);

      const midStart = midLine.start;
      const midEnd = midLine.end;
      const middle = midLine.middle;
      const firstEnd = middle.subtract(guideVector.multiply((2).inch2meter() + 0.5 * this.options.LineWidth.val));
      const secondStart = middle.add(guideVector.multiply((2).inch2meter() + 0.5 * this.options.LineWidth.val));

      const firstTask = new LineTask(this.tasks.length, [midStart, firstEnd], false, true);
      const secondTask = new LineTask(this.tasks.length, [secondStart, midEnd], false, true);

      this.tasks.push(firstTask);
      this.tasks.push(secondTask);
    }
    else if(this.options.CenterCross.val) {
      let guideVector = new Vector(0, 1).rotate(this.options.Angle.val).rotate((45).deg2rad());
      const middle = midLine.middle;
      const lengthEachSide = 0.5 * this.options.HashLength.val - this.options.LineWidth.val;
      
      if (lengthEachSide > 0.1) { // If line is shorter than 10 cm it would not be seen on top of middle line
        const lineOneStart = middle.add(guideVector.multiply(lengthEachSide));
        const lineOneEnd = middle.subtract(guideVector.multiply(lengthEachSide));
        
        guideVector = guideVector.rotate((90).deg2rad());
        
        const lineTwoStart = middle.subtract(guideVector.multiply(lengthEachSide));
        const lineTwoEnd = middle.add(guideVector.multiply(lengthEachSide));
        
        this.tasks.push(new LineTask(this.tasks.length, [midLine.start, middle], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [lineOneStart, lineOneEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [lineTwoStart, lineTwoEnd], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [middle, midLine.end], false, true));
      }
      else {
        this.tasks.push(midLine.toLineTask(this.tasks.length, false, true));
      }
    }
    else {
      this.tasks.push(midLine.toLineTask(this.tasks.length, false, true));
    }
  }

  drawDashedLine(start, end) {
    let dashedLength = (2).foot2meter();
    let paintLength = (2).foot2meter();
    this.tasks.push(new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", paintLength));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_space", dashedLength));
  }

  createSideBench() {
    if (!this.options["Side Bench"].val) // If side bench is false, don't paint it. Duh.
    {
      return;
    }

    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];

    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let coachCenter = new Line(c1, c4).middle;
    if (this.options.Scale.val) {
      //Widths
      this.options.TeamAreaWidth.val = ((20).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.SubstitutionWidth.val = ((6).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.CoachAreaWidth.val = ((6).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.BehindCoachWidth.val = ((10).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.TimerDistanceFromSideLine.val = ((7).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.TimerWidth.val = ((2).yard2meter() / (60).yard2meter()) * this.options.Width.val;

      //Lengths
      this.options.SubstitutionLength.val = ((10).yard2meter() / (110).yard2meter()) * this.options.Length.val;
      this.options.CoachBenchLength.val = ((20).yard2meter() / (110).yard2meter()) * this.options.Length.val;
      this.options.TeamAreaLength.val = ((50).yard2meter() / (110).yard2meter()) * this.options.Length.val;
      this.options.TimerLength.val = ((8).yard2meter() / (110).yard2meter()) * this.options.Length.val;
      this.options.BenchDistanceFromCoachArea.val = ((2.5).yard2meter() / (110).yard2meter()) * this.options.Length.val;
    }
    else {
      //Widths
      this.options.TeamAreaWidth.val = (20).yard2meter();
      this.options.SubstitutionWidth.val = (6).yard2meter();
      this.options.CoachAreaWidth.val = (6).yard2meter();
      this.options.BehindCoachWidth.val = (10).yard2meter();
      this.options.TimerDistanceFromSideLine.val = (7).yard2meter();
      this.options.TimerWidth.val = (2).yard2meter();


      //Lengths
      this.options.SubstitutionLength.val = (10).yard2meter();
      this.options.CoachBenchLength.val = (20).yard2meter();
      this.options.TeamAreaLength.val = (50).yard2meter();
      this.options.TimerLength.val = (8).yard2meter();
      this.options.BenchDistanceFromCoachArea.val = (2.5).yard2meter();
    }

    // Substitution Area
    let substitionOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionWidthC1 = substitionOnLineC1.add(vertical.multiply(this.options.SubstitutionWidth.val));
    let substitionWidthC4 = substitionOnLineC4.add(vertical.multiply(this.options.SubstitutionWidth.val));

    // Coach Area
    let coachOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.CoachAreaWidth.val));
    let coachWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.CoachAreaWidth.val));
    let coachBehindWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let coachBehindWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let coachDashedWidthC1 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));
    let coachDashedWidthC4 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));

    // Team Area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let teamAreaBehindC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaBehindC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.BehindCoachWidth.val));

    // Timer box
    let timerStartC1 = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).subtract(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerStartC4 = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).add(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerEndC1 = timerStartC1.add(vertical.multiply(this.options.TimerWidth.val));
    let timerEndC4 = timerStartC4.add(vertical.multiply(this.options.TimerWidth.val));

    // Drawing Substitution
    this.tasks.push(new LineTask(this.tasks.length, [substitionOnLineC4, substitionWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [substitionWidthC1, substitionOnLineC1], false, true));

    // Drawing coach area
    this.tasks.push(new LineTask(this.tasks.length, [coachOnLineC1, coachBehindWidthC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC1, coachBehindWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC4, coachOnLineC4], false, true));

    // Drawing Team Area - Dashed lines
    this.drawDashedLine(teamAreaOnLineC4, coachDashedWidthC4);

    if (this.options["Dashed Side Lines"].val) {
      this.drawDashedLine(teamArea10FeetC4, teamAreaBehindC4);
      this.drawDashedLine(teamAreaBehindC4, teamAreaBehindC1);
      this.drawDashedLine(teamAreaBehindC1, teamArea10FeetC1);
      this.drawDashedLine(coachDashedWidthC1, teamAreaOnLineC1);
      this.drawDashedLine(coachDashedWidthC1, coachWidthC1);
      this.tasks.push(new LineTask(this.tasks.length, [coachWidthC1, coachWidthC4], false, true));
      this.drawDashedLine(coachWidthC4, coachDashedWidthC4);
    }
    else {
      this.drawDashedLine(coachDashedWidthC4, coachWidthC4);
      this.tasks.push(new LineTask(this.tasks.length, [coachWidthC4, coachWidthC1], false, true));
      this.drawDashedLine(coachWidthC1, coachDashedWidthC1);
      this.drawDashedLine(coachDashedWidthC1, teamAreaOnLineC1);
    }

    // Drawing Timer box - What is a "timer box"?
    this.tasks.push(new LineTask(this.tasks.length, [timerStartC4, timerStartC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [timerEndC1, timerEndC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [timerEndC4, timerStartC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [timerStartC1, timerEndC1], false, true));

    let benchStartLeft = coachBehindWidthC4.add(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));
    let benchStartRight = coachBehindWidthC1.subtract(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));
    this.drawBenchBox(benchStartLeft, "left");
    this.drawBenchBox(benchStartRight, "right");
  }

  drawBenchBox(start, side) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();

    let rightTop;
    let leftBottom;
    let leftTop;
    if (this.options.Scale.val) {
      this.options.BenchBoxWidth.val = ((3).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.BenchBoxLength.val = ((10).yard2meter() / (110).yard2meter()) * this.options.Length.val;
    }
    else {
      this.options.BenchBoxWidth.val = (3).yard2meter();
      this.options.BenchBoxLength.val = (10).yard2meter();
    }
    rightTop = start.add(vertical.multiply(this.options.BenchBoxWidth.val));
    leftBottom = start.add(horizontal.multiply(this.options.BenchBoxLength.val));
    leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));

    if (side === "right") {
      leftBottom = start.subtract(horizontal.multiply(this.options.BenchBoxLength.val));
      leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));
    }

    this.tasks.push(new LineTask(this.tasks.length, [start, leftBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftTop, rightTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [rightTop, start], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftBottom, leftTop], false, true));
  }

  drawDashedSideline(c1, c2, c3, c4) {
    if (!this.options["Side Bench"].val) // If sideBench is false, don't paint it. O'rly?
    {
      return;
    }

    if (this.options.Scale.val) {
      //Widths
      this.options.BehindCoachWidth.val = ((10).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.DashedDistanceOnTopSide.val = ((10).yard2meter() / (60).yard2meter()) * this.options.Width.val;
      this.options.DashedDistanceOnBottomSide.val = ((6).yard2meter() / (60).yard2meter()) * this.options.Width.val;

      //Lengths
      this.options.TeamAreaLength.val = ((50).yard2meter() / (110).yard2meter()) * this.options.Length.val;
      this.options.ExtraSidelineLength.val = ((5).yard2meter() / (110).yard2meter()) * this.options.Length.val;
    }
    else {
      //Widths
      this.options.BehindCoachWidth.val = (10).yard2meter();
      this.options.DashedDistanceOnTopSide.val = (10).yard2meter();
      this.options.DashedDistanceOnBottomSide.val = (6).yard2meter();

      //Lengths
      this.options.TeamAreaLength.val = (50).yard2meter();
      this.options.ExtraSidelineLength.val = (5).yard2meter();
    }

    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let coachCenter = new Line(c1, c4).middle;

    // Dashed lines from coach area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(this.options.TeamAreaLength.val / 2));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(this.options.TeamAreaLength.val / 2));

    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.BehindCoachWidth.val));

    // Start and end points of dashed lines on the side of field as bench
    let dashedC1 = c1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC4 = c4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    // Points defination of dashed lines on the bottom side
    let dashedC2 = c2.subtract(vertical.multiply(this.options.DashedDistanceOnBottomSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC3 = c3.subtract(vertical.multiply(this.options.DashedDistanceOnBottomSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    // Drawing the dashed lines
    this.drawDashedLine(teamArea10FeetC1, dashedC1);
    this.drawDashedLine(dashedC2, dashedC3);
    this.drawDashedLine(dashedC4, teamArea10FeetC4);
  }

  drawFullField() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let s1 = new Line(c1, c2);
    let s2 = new Line(c3, c4);
    let s3 = new Line(c2, c3);
    let s4 = new Line(c4, c1);
    let midline = new Line(s3.middle, s4.middle);
    let s = [midline, s1, s2, s3, s4];
    let g2 = s1.unit_vector;
    let g1 = g2.rotate_90_cw();
    let h2 = midline.reverse().unit_vector;
    let h1 = h2.rotate_90_cw();
    let i2 = s2.reverse().unit_vector;
    let i1 = i2.rotate_90_cw();
    let j1 = s3.unit_vector;
    let j2 = j1.rotate_90_ccw();
    let k1 = s4.reverse().unit_vector;
    let k2 = k1.rotate_90_ccw();
    let l1 = new Line(s1.middle, s2.middle).unit_vector;
    let l2 = l1.rotate_90_ccw();
    let o = [g1, g2, h1, h2, i1, i2, j1, j2, k1, k2, l1, l2];
    let wing_area_lines;

    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    wing_area_lines = this.create_end(0, p, o, s);     //end 1
    this.create_side(0, p, o, s, wing_area_lines);     //side 1 + mid
    wing_area_lines = this.create_end(1, p, o, s);     //end2
    this.create_side(1, p, o, s);                      //side 2

    this.createSideBench();
    if (this.options["Dashed Side Lines"].val)
      this.drawDashedSideline(c1, c2, c3, c4);
  }

  drawHalfField() {
    let p = this.drawing_points;
    {
      let c1 = p[0];
      let c2 = p[3];
      let c3 = p[4];
      let c4 = p[7];
      let s3 = new Line(c2, c3);
      let s4 = new Line(c4, c1);

      let midline = new Line(s3.middle, s4.middle);

      this.start_locations.push(new StartLocation(c1, this.tasks.length));

      // Changes start
      let newC4 = new Line(c1, c4).middle;
      let newC3 = new Line(c2, c3).middle;

      let newS1 = new Line(c1, c2);
      let newS2 = new Line(newC3, newC4);
      let newS3 = new Line(c2, newC3);
      let newS4 = new Line(newC4, c1);

      let newMidline = new Line(newS3.end, newS4.start);
    }

    let s = [newMidline, newS1, newS2, newS3, newS4];
    {
      let g2 = newS1.unit_vector;
      let g1 = g2.rotate_90_cw();
      let h2 = midline.reverse().unit_vector;
      let h1 = h2.rotate_90_cw();
      let i2 = newS2.reverse().unit_vector;
      let i1 = i2.rotate_90_cw();
      let j1 = newS3.unit_vector;
      let j2 = j1.rotate_90_ccw();
      let k1 = newS4.reverse().unit_vector;
      let k2 = k1.rotate_90_ccw();
      let l1 = new Line(newS1.middle, newS2.middle).unit_vector;
      let l2 = l1.rotate_90_ccw();
    }

    let o = [g1, g2, h1, h2, i1, i2, j1, j2, k1, k2, l1, l2];
    let wing_area_lines;

    //end 1
    wing_area_lines = this.create_end(0, p, o, s);

    //side 1 + mid
    this.create_side(0, p, o, s, wing_area_lines);

    //side 2
    this.create_side(1, p, o, s);
  }

  draw() {
    if (this.options.lacrosseUnified.val && this.check === 0) {
      this.check = 1;
      this.options.Youth.val = false;
    } else if (this.options.Youth.val) {
      this.check = 0;
      this.options.lacrosseUnified.val = false;
    }
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    if (this.options.drawHalfField.val) {
      this.drawHalfField();

    }
    else {
      this.drawFullField();

    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}

class UsLacrossWomen extends LacrossFunctions {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Women"; // Translateable
  static template_id = "us_lacross_women"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;
    this.options.DriveOneWay = {
      configurable: true,
      name: "Drive One Way",
      val: true,
      type: "bool"
    };
    this.options.TableMarks = {
      configurable: true,
      name: "Table Marks",
      val: true,
      type: "bool"
    };
    this.options.TableMarkLength = {
      name: "Table Mark Length",
      val: 1.9558,
      type: "float",
      "dontsave": true
    };
    this.options.GoalWidth.val = (6).foot2meter();
    this.options.GoalWidth.dontsave = true;
    this.options.GoalLine = {
      configurable: true,
      name: "Line through Goal Circle",
      val: true,
      type: "bool"
    };
    this.options.FullGoalLine = {
      get configurable() {
        return this_class.options.GoalLine.val;
      },
      prev_sibling: "GoalLine",
      name: "Full goal line",
      val: false,
      type: "bool"
    };
    this.options.GoalDistance = {
      name: "Distance from goal to end line",
      val: (10).yard2meter(),
      type: "float"
    };
    this.options.GoalRadius = {
      name: "Goal circle Radius",
      val: (8).foot2meter() + (6).inch2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.CenterRadius = {
      name: "Center circle Radius",
      val: 9,
      type: "float",
      "dontsave": true
    };
    this.options.CenterLine = {
      name: "Center Line length",
      val: 3,
      type: "float",
      "dontsave": true
    };
    this.options.HashLength = {
      configurable: true,
      name: "Hash Marks length",
      val: (1).foot2meter(),
      min: (0.5).foot2meter(),
      type: "float",
    };
    this.options["Goal2Restraning Line"] = {
      name: "goal to restraning line",
      val: (30).yard2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.drawHalfField = {
      configurable: true,
      name: "Draw only one side",
      val: false,
      type: "bool"
    };
    this.options.SubLength = {
      configurable: false,
      name: "Substitution area length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.SubWidth = {
      configurable: false,
      name: "Substitution area width",
      val: 2,
      type: "float",
    };
    this.options.PenalityLength = {
      configurable: false,
      name: "Penality area length",
      val: this.options.SubLength.val,
      type: "float",
    };
    this.options.PenalityWidth = {
      configurable: false,
      name: "Penality area width",
      val: this.options.SubWidth.val,
      type: "float",
    };
    this.options.TableDistanceFromSideline = {
      configurable: false,
      name: "Distance between table and playing ground",
      val: 4,
      type: "float",
    };
    this.options.TableLength = {
      configurable: false,
      name: "Table length",
      val: (4).yard2meter(),
      type: "float",
    };
    this.options.TableWidth = {
      configurable: false,
      name: "Table Width",
      val: (2).yard2meter(),
      type: "float",
    };
    this.options.BenchBoxLength = {
      configurable: false,
      name: "Bench length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.BenchBoxWidth = {
      configurable: false,
      name: "Bench width",
      val: (2).yard2meter(),
      type: "float",
    };
    this.options.BenchDistanceFromPlayingGround = {
      configurable: false,
      name: "Bench distance from playing ground",
      val: 5,
      type: "float",
    };
    this.options.dashedAroundBenchWidth = {
      configurable: false,
      name: "The dashed lines around the benchs and table width",
      val: (5).yard2meter(),
      type: "float",
    };
    this.options.IsolateBench = {
      configurable: true,
      name: "Bench isolation",
      val: true,
      type: "bool",
    };
    this.options.BenchIsolationLength = {
      configurable: false,
      name: "Drawing a restrected line",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.BenchArea = {
      configurable: true,
      name: "Bench area",
      type: "bool",
      val: false
    };

    const maxLength = (120).yard2meter() + this.options.LineWidth.val;
    const maxWidth = (65).yard2meter() + this.options.LineWidth.val;

    this.options.Length.val = maxLength;
    this.options.Width.val = maxWidth;
  }

  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }

  refresh_handles() {
    super.refresh_handles();
    let this_class = this;
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    this.handles.push(new Handle((new Line(p[0], p[3]).middle).add(g2.multiply(this_class.options.GoalDistance.val + this_class.options.LineWidth.val / 2)), -this_class.options.Angle.val + Math.PI / 2, "GoalDistance", "Handle", "Yellow_Handle", function (new_pos_v) {

      let g = new Line(p[0], p[7]);
      let new_goal_length = g.start.dist_to_point(g.point_on_line(new_pos_v));
      this_class.set_new_val(this_class.options.GoalDistance, new_goal_length);
    }, function (new_goal_length) {
      return this_class.set_new_val(this_class.options.GoalDistance, new_goal_length);
    }));
  }

  drawHalfField() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    let c3 = p[4];
    let c4 = p[7];

    c3 = c2.add(g2.multiply(0.5 * this.options.Length.val));
    c4 = c1.add(g2.multiply(0.5 * this.options.Length.val));


    let s3p5 = c2.add(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val + this.options.LineWidth.val));
    let s4p5 = c1.add(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val + this.options.LineWidth.val));


    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c4], false, true));
    this.start_locations.push(new StartLocation(c4, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c3], false, true));
    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c2], false, true));
    this.start_locations.push(new StartLocation(c2, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c1], false, true));
    this.create_circle_goal(0);
    this.tasks.push(new LineTask(this.tasks.length, [s4p5, s3p5], false, true));

    // //center circle
    const center = new Line(c3, c4).middle;
    let center_guide1 = center.add(g1.multiply(this.options.CenterRadius.val));
    let center_guide2 = center.add(g1.multiply(-this.options.CenterRadius.val));
    let midtCircle = center.add(g2.multiply(this.options.CenterRadius.val));
    this.tasks.push(new ArcTask(this.tasks.length, [center_guide2, midtCircle, center_guide1], center, true, false, true));
  }

  drawDashedLine(start, end) {
    let dashedLength = (2).foot2meter();
    let paintLength = (2).foot2meter();
    let offset = 0.2;
    this.tasks.push(new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_offset", offset));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", paintLength));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_space", dashedLength));
  }
  drawBenchArea(c1, c2, c3, c4) {
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let fieldTopCenter = new Line(c1, c4).middle;

    // Defining the Substitution area
    let subLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subLeftTop = subLeftBottom.add(vertical.multiply(this.options.SubWidth.val));
    let subRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subRightTop = subRightBottom.add(vertical.multiply(this.options.SubWidth.val));

    // Defining the Penality area
    let penLeftBottom = subLeftTop;
    let penLeftTop = penLeftBottom.add(vertical.multiply(this.options.PenalityWidth.val));
    let penRightBottom = subRightTop;
    let penRightTop = penRightBottom.add(vertical.multiply(this.options.PenalityWidth.val));

    if (this.options.IsolateBench.val) {
      penLeftTop = penLeftBottom.add(vertical.multiply(this.options.BenchIsolationLength.val));
      penRightTop = penRightBottom.add(vertical.multiply(this.options.BenchIsolationLength.val));
    }

    // Defining the Table

    // Defining the dashed lines around the benchs 
    let dashedLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(2 * this.options.SubWidth.val));
    let dashedRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(2 * this.options.SubWidth.val));
    let dashedLeftTop = dashedLeftBottom.add(vertical.multiply(this.options.dashedAroundBenchWidth.val));
    let dashedRightTop = dashedRightBottom.add(vertical.multiply(this.options.dashedAroundBenchWidth.val));

    // Drawing substitution and penality area
    this.tasks.push(new LineTask(this.tasks.length, [subLeftBottom, subLeftTop], false, true));
    this.drawDashedLine(penLeftBottom, penLeftTop);

    this.drawDashedLine(penRightTop, penRightBottom);
    this.tasks.push(new LineTask(this.tasks.length, [subRightTop, subRightBottom], false, true));

    this.drawDashedLine(subRightTop, subLeftTop);

    // drawing the dashed bench area
    this.drawDashedLine(dashedRightBottom, dashedRightTop);
    this.drawDashedLine(dashedRightBottom, dashedLeftBottom);
    this.drawDashedLine(dashedLeftBottom, dashedLeftTop);
  }

  drawBenchBox(start, side) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();

    let rightTop;
    let leftBottom;
    let leftTop;

    rightTop = start.add(vertical.multiply(this.options.BenchBoxWidth.val));
    leftBottom = start.add(horizontal.multiply(this.options.BenchBoxLength.val));
    leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));

    if (side === "right") {
      leftBottom = start.subtract(horizontal.multiply(this.options.BenchBoxLength.val));
      leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));
    }

    this.tasks.push(new LineTask(this.tasks.length, [start, leftBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftBottom, leftTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftTop, rightTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [rightTop, start], false, true));
  }


  drawFullField() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    let c3 = p[4];
    let c4 = p[7];

    let s3p5 = c2.add(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val));
    let s3p6 = new Line(c2, c3).middle;
    let s3p7 = c3.subtract(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val));
    let s4p5 = c1.add(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val));
    let s4p6 = new Line(c1, c4).middle;
    let s4p7 = c4.subtract(g2.multiply(this.options.GoalDistance.val + this.options["Goal2Restraning Line"].val));
    let center = new Line(s3p6, s4p6).middle;
    let center_guide1 = center.add(g1.multiply(this.options.CenterRadius.val));
    let center_guide2 = center.add(g1.multiply(-this.options.CenterRadius.val));
    let center_line = new Line(center.subtract(g1.multiply(this.options.CenterLine.val / 2)), center.add(g1.multiply(this.options.CenterLine.val / 2)));
    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c4], false, true));
    this.start_locations.push(new StartLocation(c4, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c3], false, true));
    this.create_circle_goal(1);
    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c2], false, true));
    this.start_locations.push(new StartLocation(c2, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c1], false, true));
    this.create_circle_goal(0);
    this.tasks.push(new LineTask(this.tasks.length, [s4p5, s3p5], false, true));

    if (this.options.BenchArea.val) {
      this.drawBenchArea(c1, c2, c3, c4);
    }
    this.tasks.push(new LineTask(this.tasks.length, [s3p7, s4p7], false, true));
    //center circle
    this.tasks.push(center_line.toLineTask(this.tasks.length, false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [center_guide1, center_guide2], center, true, false, true));
  }

  draw() {
    delete this.calculated_drawing_points;
    this.tasks = [];
    this.start_locations = [];

    if (this.options.drawHalfField.val) {
      this.drawHalfField();
    }
    else {
      this.drawFullField();
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }

}

class UsLacrossUnified extends LacrossFunctions {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Unified High School"; // Translateable
  static template_id = "us_lacross_unified_highschool"; // no spaces
  static template_image = "img/templates/" + this.template_id + "_black.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    let this_class = this;
    this.options.DriveOneWay = {
      configurable: true,
      name: "Drive One Way",
      val: true,
      type: "bool"
    };
    this.options.GoalWidth.val = (6).foot2meter();

    this.options.GoalRadius = {
      name: "Goal circle Radius",
      val: (9).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.GoalLine = {
      configurable: true,
      name: "Line through Goal Circle",
      val: true,
      type: "bool"
    };
    this.options.FullGoalLine = {
      get configurable() {
        return this_class.options.GoalLine.val;
      },
      prev_sibling: "GoalLine",
      name: "Full goal line",
      val: false,
      type: "bool"
    };
    this.options.GoalDistance = {
      name: "Goal distance to end line",
      val: (15).yard2meter(),
      type: "float",

    };
    this.options.CenterRadius = {
      name: "Center circle Radius",
      val: (30).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.CenterCircle = {
      configurable: true,
      name: "Center Circle",
      val: true,
      type: "bool"
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      val: true,
      type: "bool"
    };
    this.options.HashLength = {
      configurable: true,
      name: "Hash Marks length",
      val: (1).foot2meter(),
      min: (0.5).foot2meter(),
      type: "float",
    };
    this.options.drawHalfField = {
      configurable: true,
      name: "Draw only one side",
      val: false,
      type: "bool"

    };
    this.options["Side Bench"] = {
      configurable: true,
      name: "Bench on the length side",
      val: false,
      type: "bool",

    };
    this.options["Dashed Side Lines"] = {
      get configurable() {
        return this_class.options["Side Bench"].val;
      },
      name: "Dashed lines on the side field",
      val: false,
      type: "bool",
      prev_sibling: "Side Bench",
    };
    this.options.BehindPenalityWidth = {
      configurable: false,
      name: "The area behind the substitution",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.PenalityLength = {
      configurable: false,
      name: "Coaches area from one to other side",
      val: (20).yard2meter(),
      type: "bool",
    };
    this.options.CoachAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.CoeachAreaDashedLength = {
      configurable: false,
      name: "The length of dashed coaches area ",
      val: (50).yard2meter(),
      type: "float"
    };
    this.options.DashedSideLineWidth = {
      configurable: false,
      name: "The dashed area width - from field side",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (15).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaLength = {
      configurable: false,
      name: "Coach area width",
      val: this.options.CoeachAreaDashedLength.val,
      type: "float",
    };
    this.options.TableLength = {
      configurable: false,
      name: "Timer Length",
      val: (8).yard2meter(),
      type: "float",
    };
    this.options.TableWidth = {
      configurable: false,
      name: "Timer width",
      val: (3).yard2meter(),
      type: "float",
    };
    this.options.TableDistanceFromSideline = {
      configurable: false,
      name: "Distance from side line",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.ExtraSidelineLength = {
      configurable: false,
      name: "Dashed lines on the side of field",
      val: (5).yard2meter(),
      type: "float",
    };
    this.options.DashedDistanceOnTopSide = {
      configurable: false,
      name: "The distance of the dashed sideline on bench side",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.DashedDistanceOnBottomSide = {
      configurable: false,
      name: "The distance of the dashed sideline on other side",
      val: (6).yard2meter(),
      type: "float",
    };

    const maxLength = (120).yard2meter() + this.options.LineWidth.val;
    const maxWidth = (60).yard2meter() + this.options.LineWidth.val;
    this.options.Length.val = maxLength;
    this.options.Width.val = maxWidth;
  }
  static get layout_methods() {
    return {
      "corner,side": 2,
      "two_corners": 2,
      "two_corners,side": 3,
      "free_hand": 0
    };
  }

  drawDashedLine(start, end) {
    let dashedLength = (2).foot2meter();
    let paintLength = (2).foot2meter();
    this.tasks.push(new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", paintLength));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_space", dashedLength));
  }

  createSideBench() {
    if (!this.options["Side Bench"].val) // If side bench is false, don't paint it
    {
      return;
    }

    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];

    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let coachCenter = new Line(c1, c4).middle;

    // Team Area
    let penalityOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * (this.options.PenalityLength.val + lineWidth)));
    let penalityOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * (this.options.PenalityLength.val + lineWidth)));

    let penalityBehindWidthC1 = penalityOnLineC1.add(vertical.multiply(this.options.BehindPenalityWidth.val));
    let penalityBehindWidthC4 = penalityOnLineC4.add(vertical.multiply(this.options.BehindPenalityWidth.val));

    let dashedVerticalInsideC1 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let dashedVerticalInsideC4 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));

    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaBehindC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaBehindC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));

    // Table box
    let tableStartC1 = coachCenter.add(vertical.multiply(this.options.TableDistanceFromSideline.val)).subtract(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableStartC4 = coachCenter.add(vertical.multiply(this.options.TableDistanceFromSideline.val)).add(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableEndC1 = tableStartC1.add(vertical.multiply(this.options.TableWidth.val));
    let tableEndC4 = tableStartC4.add(vertical.multiply(this.options.TableWidth.val));

    // Drawing Team area
    this.drawDashedLine(penalityOnLineC1, penalityBehindWidthC1);
    this.drawDashedLine(penalityBehindWidthC4, penalityOnLineC4);

    this.drawDashedLine(teamAreaOnLineC4, teamAreaBehindC4);
    this.drawDashedLine(teamAreaBehindC4, teamAreaBehindC1);
    this.drawDashedLine(teamAreaBehindC1, teamAreaOnLineC1);

    this.drawDashedLine(dashedVerticalInsideC1, tableStartC1.subtract(horizontal.multiply(2 * this.options.LineWidth.val)));
    this.tasks.push(new LineTask(this.tasks.length, [tableStartC1, tableStartC4], false, true));
    this.drawDashedLine(tableStartC4.add(horizontal.multiply(2 * this.options.LineWidth.val)), dashedVerticalInsideC4);

    // Drawing Table box
    this.tasks.push(new LineTask(this.tasks.length, [tableEndC4, tableEndC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [tableEndC1, tableStartC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [tableStartC4, tableEndC4], false, true));
  }

  drawDashedSideline(c1, c2, c3, c4) {
    if (this.options["Dashed Side Lines"].val) {
      if (!this.options["Side Bench"].val) // If sideBench is false, don't paint it
      {
        return;
      }

      let horizontal = new Line(c1, c4).unit_vector;
      let vertical = horizontal.rotate_90_cw();
      let lineWidth = this.options.LineWidth.val;
      let coachCenter = new Line(c1, c4).middle;

      // Dashed lines from coach area
      let teamArea10FeetC1 = coachCenter.add(vertical.multiply(this.options.BehindPenalityWidth.val + lineWidth)).subtract(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
      let teamArea10FeetC4 = coachCenter.add(vertical.multiply(this.options.BehindPenalityWidth.val + lineWidth)).add(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));

      // Start and end points of dashed lines on the side of field as bench
      let dashedC1 = c1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val + lineWidth)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
      let dashedC4 = c4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val + lineWidth)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

      // Points defination of dashed lines on the bottom side
      let dashedC2 = c2.subtract(vertical.multiply(this.options.DashedDistanceOnBottomSide.val + lineWidth)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
      let dashedC3 = c3.subtract(vertical.multiply(this.options.DashedDistanceOnBottomSide.val + lineWidth)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

      // Drawing the dashed lines
      this.drawDashedLine(teamArea10FeetC1, dashedC1);
      this.drawDashedLine(dashedC2, dashedC3);
      this.drawDashedLine(dashedC4, teamArea10FeetC4);
    }
  }

  create_center() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g2 = new Line(c2, c3).unit_vector;
    let g1 = g2.rotate_90_ccw();

    let s3p6 = new Line(c3, c2).middle;
    let s4p6 = new Line(c1, c4).middle;
    //circle
    let center = s4p6.add(g1.multiply(this.options.Width.val / 2));
    let guide1 = center.add(g1.multiply(this.options.CenterRadius.val));
    let guide2 = center.add(g1.multiply(-this.options.CenterRadius.val));
    //cross
    let cross = (5).foot2meter();
    let s3p5 = s3p6.subtract(g2.multiply(cross / 2));
    let s3p7 = s3p6.add(g2.multiply(cross / 2));
    let s4p5 = s4p6.subtract(g2.multiply(cross / 2));
    let s4p7 = s4p6.add(g2.multiply(cross / 2));

    let circleRadius = center.add(g2.multiply(this.options.CenterRadius.val));
    let circleRadius2 = center.add(g1.multiply(this.options.CenterRadius.val));

    let line1end = s4p5.add(g1.multiply(this.options.Width.val / 2 - cross / 2));
    let line1start = s3p7.subtract(g1.multiply(this.options.Width.val / 2 - cross / 2));
    let line2end = s3p5.subtract(g1.multiply(this.options.Width.val / 2 - cross / 2));
    let line2start = s4p7.add(g1.multiply(this.options.Width.val / 2 - cross / 2));
    if (this.options.CenterCross.val) {
      this.tasks.push(new LineTask(this.tasks.length, [line1start, line1end], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [line2start, line2end], false, true));
    }
    if (this.options.CenterCircle.val) {
      if (this.options.drawHalfField.val)
        this.tasks.push(new ArcTask(this.tasks.length, [guide1, circleRadius, guide2], center, false, false, true));
      else
        this.tasks.push(new ArcTask(this.tasks.length, [guide1, guide2, circleRadius2], center, false, false, true));
    }
  }

  refresh_handles() {
    super.refresh_handles();
    let this_class = this;
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    this.handles.push(new Handle((new Line(p[0], p[3]).middle).add(g2.multiply(this_class.options.GoalDistance.val + this_class.options.LineWidth.val / 2)), -this_class.options.Angle.val + Math.PI / 2, "GoalDistance", "Handle", "Yellow_Handle", function (new_pos_v) {

      let g = new Line(p[0], p[7]);
      let new_goal_length = g.start.dist_to_point(g.point_on_line(new_pos_v));
      this_class.set_new_val(this_class.options.GoalDistance, new_goal_length);
    }, function (new_goal_length) {
      return this_class.set_new_val(this_class.options.GoalDistance, new_goal_length);
    }));
  }

  drawHalfField() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g2 = new Line(c2, c3).unit_vector;
    let g1 = g2.rotate_90_ccw();

    c3 = c2.add(g2.multiply(0.5 * this.options.Length.val - this.options.LineWidth.val / 2));
    c4 = c1.add(g2.multiply(0.5 * this.options.Length.val - this.options.LineWidth.val / 2));

    let s1p6 = new Line(c2, c1).middle;
    let s1p2 = s1p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s1p10 = s1p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));

    let s2p6 = new Line(c3, c4).middle;
    let s2p2 = s2p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s2p10 = s2p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));

    let s3p8 = c4.subtract(g2.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s4p3 = c3.subtract(g2.multiply((20).yard2meter() + this.options.LineWidth.val / 2));

    let midLine = new Line(s4p3, s3p8).middle;
    let mlp2 = midLine.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let mlp1 = midLine.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));

    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c3], false, true));

    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c2], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [s1p2, mlp2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [s2p2.subtract(g2.multiply((10).yard2meter())), s2p2], false, true));

    this.create_center();

    this.tasks.push(new LineTask(this.tasks.length, [s2p10, s2p10.subtract(g2.multiply((10).yard2meter()))], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [mlp1, s1p10], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));

    this.create_circle_goal(0);

    this.tasks.push(new LineTask(this.tasks.length, [s3p8, s4p3], false, true));
  }

  drawFullField() {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g2 = new Line(c2, c3).unit_vector;
    let g1 = g2.rotate_90_ccw();
    let s1p6 = new Line(c2, c1).middle;
    let s1p2 = s1p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s1p10 = s1p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s2p6 = new Line(c3, c4).middle;
    let s2p2 = s2p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s2p10 = s2p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s3p6 = new Line(c3, c2).middle;
    let s3p3 = s3p6.subtract(g2.multiply((20).yard2meter()));
    let s3p4 = s3p6.subtract(g2.multiply(9.144 + this.options.LineWidth.val));
    let s3p8 = s3p6.add(g2.multiply(9.144 + this.options.LineWidth.val));
    let s3p9 = s3p6.add(g2.multiply((20).yard2meter()));
    let s4p6 = new Line(c1, c4).middle;
    let s4p3 = s4p6.subtract(g2.multiply((20).yard2meter()));
    let s4p4 = s4p6.subtract(g2.multiply(9.144 + this.options.LineWidth.val));
    let s4p8 = s4p6.add(g2.multiply(9.144 + this.options.LineWidth.val));
    let s4p9 = s4p6.add(g2.multiply((20).yard2meter()));
    let line_a = new Line(s2p10, s4p9.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_b = new Line(s4p8.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s4p4.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_c = new Line(s4p3.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s1p10);
    let line_d = new Line(s2p2, s3p9.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_e = new Line(s3p8.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s3p4.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_f = new Line(s3p3.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s1p2);
    //horizontal
    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [s2p10, line_a.end], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [line_b.start, line_b.end], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [line_c.start, s1p10], false, true));
    this.create_center();
    this.tasks.push(new LineTask(this.tasks.length, [s2p2, line_d.end], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [line_e.start, line_e.end], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [line_f.start, s1p2], false, true));
    this.start_locations.push(new StartLocation(c2, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));
    //vertical
    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.create_circle_goal(1);
    this.tasks.push(new LineTask(this.tasks.length, [s3p9, s4p9], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [s4p6, s3p6], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [s3p3, s4p3], false, true));
    this.create_circle_goal(0);
    this.tasks.push(new LineTask(this.tasks.length, [c2, c1], false, true));

    this.createSideBench();
    this.drawDashedSideline(c1, c2, c3, c4);
  }

  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    if (this.options.drawHalfField.val) {
      this.drawHalfField();
    }
    else {
      this.drawFullField();
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class WorldLacrosse extends UsLacrossUnified {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "World"; // Translateable
  static template_id = "world_lacrosse"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options.Length.val = 110.0; //max length
    this.options.Width.val = 60.0; //max width
    this.options.GoalDistance.val = 12 - (this.options.LineWidth.val / 2);
    //this.options  ["Goal2Restraning Line"].val = 24.9;
    this.options.GoalRadius.val = 3.0;
    this.options.HashLength.val = 0.31;
    this.options.GoalWidth.val = 1.83;
    this.options["side lines"] = {
      configurable: true,
      name: "Side lines",
      val: true,
      type: "bool"
    };

    this.options["women"] = {
      configurable: true,
      name: "Womens restraining line",
      val: true,
      type: "bool"
    };

    this.options["men"] = {
      configurable: true,
      name: "Mens restraining line",
      val: true,
      type: "bool"
    };
  }

  create_circle_goal(which_goal) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    let c3 = p[4];
    let c4 = p[7];
    let middle = new Line(c1, c2).middle;
    if (which_goal) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }
    let goalc = middle.add(g2.multiply(this.options.GoalDistance.val));
    let goal_circle_radius = this.options.GoalRadius.val - this.options.LineWidth.val / 2;
    let small_arc_radius = (34).foot2meter() + (10).inch2meter() - this.options.LineWidth.val / 2;
    let big_arc_radius = 15;
    let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;
    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [guide2, guide1], goalc, true, false, true));
    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options.GoalRadius.val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];
    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));
    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = 4 / small_arc_radius;
    let goal_hash = [];
    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    for (let i = -3; i <= 3; i++) {
      let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
      goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
    }
    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-distance_to_dots));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-distance_to_dots));
    this.tasks.push(new WaypointTask(this.tasks.length, dot1_behind_goal, false, true));
    let reverse = false;
    goal_hash.forEach((hash_mark, i) => {
      if (!this.options.DriveOneWay.val && i > 0 && i < (goal_hash.length - 1) && reverse)
        this.tasks.push(hash_mark.reverse().toLineTask(this.tasks.length, false, true));
      else
        this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });
    this.tasks.push(new WaypointTask(this.tasks.length, dot2_behind_goal, false, true));
    // big circle
    let big_arc_start = goalc.add(g1.multiply(-big_arc_radius));
    let big_arc_middle = goalc.add(g2.multiply(big_arc_radius));
    let big_arc_end = goalc.add(g1.multiply(big_arc_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [big_arc_start, big_arc_middle, big_arc_end], goalc, false, false, true));
    // Back line
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_end, guide1], false, true));
    if (this.options.GoalLine.val) {
      if (this.options.FullGoalLine.val)
        this.tasks.push(new LineTask(this.tasks.length, [guide1, guide2], false, true));
      else {
        let goal_line = new Line(guide1, guide2);
        let too_long = goal_line.length - this.options.GoalWidth.val - this.options.LineWidth.val;
        if (too_long > 0)
          goal_line = goal_line.add_to_start(-too_long / 2).add_to_end(-too_long / 2);
        this.tasks.push(new LineTask(this.tasks.length, [goal_line.start, goal_line.end], false, true));
      }
    }
    this.tasks.push(new LineTask(this.tasks.length, [guide2, big_arc_start], false, true));
  }

  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g2 = new Line(c2, c3).unit_vector;
    let g1 = g2.rotate_90_ccw();
    let s1p6 = new Line(c2, c1).middle;
    let s1p2 = s1p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s1p10 = s1p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s2p6 = new Line(c3, c4).middle;
    let s2p2 = s2p6.add(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s2p10 = s2p6.subtract(g1.multiply((20).yard2meter() + this.options.LineWidth.val / 2));
    let s3p6 = new Line(c3, c2).middle;
    let s3p3 = s3p6.subtract(g2.multiply(25));
    let s3p4 = s3p6.subtract(g2.multiply(9.144 + this.options.LineWidth.val));
    let s3p8 = s3p6.add(g2.multiply(9.144 + this.options.LineWidth.val));
    let s3p9 = s3p6.add(g2.multiply(25));
    let s4p6 = new Line(c1, c4).middle;
    let w_restrain1 = s3p6.add(g2.multiply(18));
    let w_restrain2 = s4p6.subtract(g2.multiply(18));
    let w_restrain3 = s3p6.subtract(g2.multiply(18));
    let w_restrain4 = s4p6.add(g2.multiply(18));
    let s4p3 = s4p6.subtract(g2.multiply(25));
    let s4p4 = s4p6.subtract(g2.multiply(9.144 + this.options.LineWidth.val));
    let s4p8 = s4p6.add(g2.multiply(9.144 + this.options.LineWidth.val));
    let s4p9 = s4p6.add(g2.multiply(25));
    let line_a = new Line(s2p10, s4p9.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_b = new Line(s4p8.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s4p4.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_c = new Line(s4p3.add(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s1p10);
    let line_d = new Line(s2p2, s3p9.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_e = new Line(s3p8.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s3p4.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)));
    let line_f = new Line(s3p3.subtract(g1.multiply(this.options.Width.val / 2 - (20).yard2meter() - this.options.LineWidth.val / 2)), s1p2);
    //horizontal
    this.start_locations.push(new StartLocation(c1, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c4], false, true));
    if (this.options["side lines"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [s2p10, line_a.end], false, true));
    }
    this.tasks.push(new LineTask(this.tasks.length, [line_b.start, line_b.end], false, true));
    if (this.options["side lines"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [line_c.start, s1p10], false, true));
    }
    this.create_center();
    if (this.options["side lines"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [s2p2, line_d.end], false, true));
    }
    this.tasks.push(new LineTask(this.tasks.length, [line_e.start, line_e.end], false, true));
    if (this.options["side lines"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [line_f.start, s1p2], false, true));
    }
    this.start_locations.push(new StartLocation(c2, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));
    //vertical
    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.create_circle_goal(1);
    if (this.options["men"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [s3p9, s4p9], false, true));
    }
    if (this.options["women"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [w_restrain4, w_restrain1], false, true));
    }

    this.tasks.push(new LineTask(this.tasks.length, [s3p6, s4p6], false, true));

    if (this.options["women"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [w_restrain2, w_restrain3], false, true));
    }
    if (this.options["men"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [s3p3, s4p3], false, true));
    }
    this.create_circle_goal(0);
    this.tasks.push(new LineTask(this.tasks.length, [c2, c1], false, true));
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class SmallLacrosseUnified extends LacrossFunctions {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Small, Unified"; // Translateable
  static template_id = "small_lacrosse_unified"; // no spaces
  static template_image = "img/templates/small_lacrosse_unified.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;

    let this_class = this;
    this.options.DriveOneWay = {
      configurable: false,
      name: "Drive One Way",
      val: true,
      type: "bool"
    };
    this.options.GoalWidth.val = (6).foot2meter();

    this.options.GoalRadius = {
      name: "Goal circle Radius",
      val: (9).foot2meter(),
      type: "float",
      "dontsave": true
    };

    this.options.GoalLine = {
      configurable: true,
      name: "Line through Goal Circle",
      val: false,
      type: "bool"
    };
    this.options.FullGoalLine = {
      get configurable() {
        return this_class.options.GoalLine.val;
      },
      prev_sibling: "GoalLine",
      name: "Full goal line",
      val: false,
      type: "bool"
    };
    this.options.GoalDistance = {
      name: "Goal distance to end line",
      val: (10).yard2meter(),
      type: "float",
      configurable: true

    };
    this.options.HashLength = {
      name: "Hash Marks length",
      val: (1).foot2meter(),
      min: (0.5).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.sideArea = {
      name: "Coach area",
      val: false,
      type: "bool",
      configurable: true
    };
    this.options.sideAreaLeft = {
      name: "Coach area left side",
      val: false,
      type: "bool",
      get configurable() {
        return this_class.options.sideArea.val;
      },
    };
    this.options.sideAreaRight = {
      name: "Coach area right side",
      val: false,
      type: "bool",
      get configurable() {
        return this_class.options.sideArea.val;
      },
    };
    this.options.sideAreaDepth =
    {
      name: "Coach area depth",
      val: (6).yard2meter(),
      type: "float",
      get configurable() {
        return this_class.options.sideArea.val;
      },
    }
    this.options.smallArcRadius =
    {
      name: "Arc radius",
      val: (35).foot2meter() + (4).inch2meter(),
      type: "float",
      configurable: true
    }

    this.options.goalHashDist =
    {
      name: "Distance between lines on arc",
      val: (13).foot2meter() + (2).inch2meter(),
      type: "float",
      configurable: true
    }
    this.options.Length.val = (60).yard2meter(); //min length
    this.options.Width.val = (35).yard2meter(); //min width
  }
  static get layout_methods() {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  create_circle_goal(which_goal) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();
    let c3 = p[4];
    let c4 = p[7];
    let middle = new Line(c1, c2).middle;
    if (which_goal) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }
    let goalc = middle.add(g2.multiply(this.options.GoalDistance.val - this.options.LineWidth.val));
    let goal_circle_radius = this.options.GoalRadius.val - this.options.LineWidth.val / 2;
    let small_arc_radius = this.options.smallArcRadius.val - this.options.LineWidth.val / 2;
    let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;
    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));
    this.tasks.push(new ArcTask(this.tasks.length, [guide2, guide1], goalc, true, false, true));
    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options.GoalRadius.val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];

    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));
    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = (this.options.goalHashDist.val + this.options.LineWidth.val * 2) / small_arc_radius;
    let goal_hash = [];
    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    for (let i = -3; i <= 3; i++) {
      let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
      goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
    }
    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-distance_to_dots));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-distance_to_dots));
    let dot1_guide1 = dot1_behind_goal.add(g1.multiply(0.05));
    let dot1_guide2 = dot1_behind_goal.subtract(g1.multiply(0.05));
    let dot2_guide1 = dot2_behind_goal.add(g1.multiply(0.05));
    let dot2_guide2 = dot2_behind_goal.subtract(g1.multiply(0.05));

    this.tasks.push(new ArcTask(this.tasks.length, [dot1_guide1, dot1_guide2], dot1_behind_goal, true, false, true));
    let reverse = false;
    goal_hash.forEach((hash_mark, i) => {
      if (!this.options.DriveOneWay.val && i > 0 && i < (goal_hash.length - 1) && reverse)
        this.tasks.push(hash_mark.reverse().toLineTask(this.tasks.length, false, true));
      else
        this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });
    this.tasks.push(new ArcTask(this.tasks.length, [dot2_guide1, dot2_guide2], dot2_behind_goal, true, false, true));
    // Big circle

    let big_arc_start = goalc.add(g1.multiply(-(35.3).foot2meter()));
    let big_arc_end = goalc.add(g1.multiply((35.3).foot2meter()));

    // Back line
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_end, guide1], false, true));
    if (this.options.GoalLine.val) {
      if (this.options.FullGoalLine.val)
        this.tasks.push(new LineTask(this.tasks.length, [guide1, guide2], false, true));
      else {
        let goal_line = new Line(guide1, guide2);
        let too_long = goal_line.length - this.options.GoalWidth.val - this.options.LineWidth.val;
        if (too_long > 0)
          goal_line = goal_line.add_to_start(-too_long / 2).add_to_end(-too_long / 2);
        this.tasks.push(new LineTask(this.tasks.length, [goal_line.start, goal_line.end], false, true));
      }
    }
    this.tasks.push(new LineTask(this.tasks.length, [guide2, big_arc_start], false, true));
  }
  create_mid(p) {
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g1 = new Line(c1, c2).unit_vector;

    let sideMid1 = new Line(c1, c4).middle;
    let sideMid2 = new Line(c2, c3).middle;
    this.tasks.push(new LineTask(this.tasks.length, [sideMid1, sideMid2], false, true));
    let mid = new Line(sideMid1, sideMid2).middle;

    let guidemid = mid.add(g1.multiply((8.485).inch2meter()));
    let guidemid1 = mid.subtract(g1.multiply((8.485).inch2meter()));

    let guidemid2 = guidemid.add(g1.multiply((8.485).inch2meter()).rotate_90_cw());
    let guidemid3 = guidemid.add(g1.multiply((8.485).inch2meter()).rotate_90_ccw());

    let guidemid4 = guidemid1.add(g1.multiply((8.485).inch2meter()).rotate_90_cw());
    let guidemid5 = guidemid1.add(g1.multiply((8.485).inch2meter()).rotate_90_ccw());

    this.tasks.push(new LineTask(this.tasks.length, [guidemid2, guidemid5], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [guidemid3, guidemid4], false, true));
  }
  create_side_area(p, which_side) {
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];
    let g1 = new Line(c1, c4).unit_vector;
    let g2;

    let dash_length = (1.5).foot2meter();
    let dash_space = dash_length;

    let sideMid;
    if (which_side === 1) {
      sideMid = new Line(c1, c4).middle;
      g2 = g1.rotate_90_cw();
    }
    else {
      sideMid = new Line(c2, c3).middle;
      g2 = g1.rotate_90_ccw();
    }

    let T_areaP1 = sideMid.add(g1.multiply((8).yard2meter()));
    let T_areaP2 = sideMid.subtract(g1.multiply((8).yard2meter()));
    let T_areaP3 = T_areaP1.add(g2.multiply(this.options.sideAreaDepth.val + (4).yard2meter()));
    let T_areaP4 = T_areaP2.add(g2.multiply(this.options.sideAreaDepth.val + (4).yard2meter()));
    let T_areaP5 = T_areaP1.add(g2.multiply(this.options.sideAreaDepth.val));
    let T_areaP6 = T_areaP2.add(g2.multiply(this.options.sideAreaDepth.val));

    let C_areaP1 = T_areaP1.add(g1.multiply((12).yard2meter()));
    let C_areaP2 = T_areaP2.subtract(g1.multiply((12).yard2meter()));
    let C_areaP3 = C_areaP1.add(g2.multiply(this.options.sideAreaDepth.val));
    let C_areaP4 = C_areaP2.add(g2.multiply(this.options.sideAreaDepth.val));

    this.tasks.push(new LineTask(this.tasks.length, [C_areaP1, C_areaP3], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [C_areaP3, T_areaP5], false, true));

    for (let i = 1; i <= 2; i++) {
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_offset", 0));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_length", dash_length));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_space", dash_space));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("ramp_up_max_dist", 3));
      this.tasks[this.tasks.length - i].action_options.push(new FloatRobotAction("drive_max_velocity", 0.8));
      this.tasks[this.tasks.length - i].task_options.push(new BoolRobotAction("task_merge_next", false));
    }
    this.tasks.push(new LineTask(this.tasks.length, [T_areaP5, T_areaP6], false, true));
    this.tasks[this.tasks.length - 1].task_options.push(new BoolRobotAction("task_merge_next", false));


    this.tasks.push(new LineTask(this.tasks.length, [T_areaP6, C_areaP4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [C_areaP4, C_areaP2], false, true));

    for (let i = 1; i <= 2; i++) {
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_offset", 0));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_length", dash_length));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("dashed_space", dash_space));
      this.tasks[this.tasks.length - i].task_options.push(new FloatRobotAction("ramp_up_max_dist", 3));
      this.tasks[this.tasks.length - i].action_options.push(new FloatRobotAction("drive_max_velocity", 0.8));
      this.tasks[this.tasks.length - i].task_options.push(new BoolRobotAction("task_merge_next", false));
    }
    this.tasks.push(new LineTask(this.tasks.length, [T_areaP2, T_areaP4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [T_areaP3, T_areaP1], false, true));
  }
  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    this.start_locations.push(new StartLocation(c1, this.tasks.length));


    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));

    this.create_mid(p)
    this.create_circle_goal(0);
    this.create_circle_goal(1)
    if (this.options.sideArea.val) {
      if (this.options.sideAreaRight.val)
        this.create_side_area(p, 1);

      if (this.options.sideAreaLeft.val)
        this.create_side_area(p, 0);
    }
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class YouthLacrosse extends SmallLacrosseUnified {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Youth"; // Translateable
  static template_id = "us_lacrosse_youth"; // no spaces
  static template_image = "img/templates/us_lacrosse_youth.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;


    this.options.GoalRadius = {
      name: "Goal circle Radius",
      val: (9).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options.GoalLine = {
      configurable: true,
      name: "Line through Goal Circle",
      val: true,
      type: "bool"
    };
    this.options.FullGoalLine = {
      get configurable() {
        return this_class.options.GoalLine.val;
      },
      prev_sibling: "GoalLine",
      name: "Full goal line",
      val: false,
      type: "bool"
    };
    this.options.GoalDistance = {
      name: "Goal distance to end line",
      val: (10).yard2meter(),
      type: "float",
      configurable: true
    };
    this.options.smallArcRadius.configurable = false;
    this.options.goalHashDist.configurable = false;
    this.options.Length.val = (60).yard2meter(); //min length
    this.options.Width.val = (35).yard2meter(); //min width
  }
  static get layout_methods() {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  createEnd(p, which_end) {
    let c1;
    let c2;

    if (which_end === 0) {
      c1 = p[0];
      c2 = p[3];
    }
    else {
      c1 = p[4];
      c2 = p[7];
    }
    let mid = new Line(c1, c2).middle;
    let g1 = new Line(c1, c2).unit_vector;
    let goal_center = mid.add(g1.multiply(this.options.GoalDistance.val + this.options.LineWidth.val).rotate_90_cw());

    let a1 = goal_center.add(g1.multiply(this.options.GoalRadius.val));
    let a2 = goal_center.subtract(g1.multiply(this.options.GoalRadius.val));

    this.tasks.push(new ArcTask(this.tasks.length, [a1, a2], goal_center, true, false, true));
    if (this.options.GoalLine.val) {
      if (this.options.FullGoalLine.val) {
        let s1 = c1.add(g1.multiply(this.options.GoalDistance.val + this.options.LineWidth.val).rotate_90_cw());
        let s2 = c2.add(g1.multiply(this.options.GoalDistance.val + this.options.LineWidth.val).rotate_90_cw());
        this.tasks.push(new LineTask(this.tasks.length, [s1, s2], false, true));
      }
      else {
        a1 = goal_center.add(g1.multiply((3).foot2meter()));
        a2 = goal_center.subtract(g1.multiply((3).foot2meter()));
        this.tasks.push(new LineTask(this.tasks.length, [a1, a2], false, true));
      }
    }
  }
  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;
    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    this.start_locations.push(new StartLocation(c1, this.tasks.length));

    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));

    this.createEnd(p, 0);
    this.createEnd(p, 1);
    this.create_mid(p);
    if (this.options.sideArea.val) {
      if (this.options.sideAreaRight.val)
        this.create_side_area(p, 1);

      if (this.options.sideAreaLeft.val)
        this.create_side_area(p, 0);
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class CustomLacrosse extends square_pitch {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Custom"; // Translateable
  static template_id = "custom_lacrosse_old_dev"; // no spaces
  static template_image = "img/templates/small_lacrosse_unified.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;

    this.options.customizedMen = {
      configurable: true,
      name: "Customized men",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.customizedWomen.val = false;
          this_class.options.customizedUnified.val = false;
          this_class.options.GoalTraingle.configurable = false;
          this_class.options.DotBehindGoal.configurable = false;
          this_class.options.GoalArcs.configurable = false;
        }
        else {
          this_class.options.GoalTraingle.configurable = true;
          this_class.options.DotBehindGoal.configurable = true;
          this_class.options.GoalArcs.configurable = true;
        }
      }
    };
    this.options.customizedWomen = {
      configurable: true,
      name: "Customized women",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.customizedMen.val = false;
          this_class.options.customizedUnified.val = false;
          this_class.options["Timer Box"].configurable = false;
          this_class.options.Table.configurable = true;
          this_class.options.CenterWings.configurable = false;
          this_class.options.CenterWings.val = false;
          this_class.options.CenterCrossLength.configurable = false;
          this_class.options.defensive10yard.configurable = false;
          this_class.options["Goal Line"].configurable = true;
          this_class.options["Goal Line"].val = true;
          this_class.options.DashedSideLine.configurable = false;
          this_class.options.DashedSideLine.val = false;
          this_class.options.BenchIsolationLength.configurable = true;
          this_class.options.IsolateBench.configurable = true;
          this_class.options.CenterCircleLineLength.configurable = true;
        }
        else {
          this_class.options.defensive10yard.configurable = true;
          this_class.options.DashedSideLine.configurable = true;
          this_class.options.DashedSideLine.val = true;
          this_class.options.CenterWings.configurable = true;
          this_class.options.DashedDistanceOnTopSide.configurable = true;
          this_class.options.DashedDistanceOnBottomSide.configurable = true;
          this_class.options.ExtraSidelineLength.configurable = true;
          this_class.options.BenchIsolationLength.configurable = false;
          this_class.options.IsolateBench.configurable = false;
          this_class.options.CenterCircleLineLength.configurable = false;
          this_class.options["Timer Box"].configurable = true;
          this_class.options.Table.configurable = false;
        }
      },
      prev_sibling: "customizedMen",
    };
    this.options.customizedUnified = {
      configurable: true,
      name: "Customized unified",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.customizedWomen.val = false;
          this_class.options.customizedMen.val = false;
        }
      },
      prev_sibling: "customizedWomen",
    };

    this.options["Draw Goals"] = {
      configurable: true,
      name: "Draw goals",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].configurable = true;
          this_class.options["Full Goal Line"].configurable = true;
          this_class.options["Goal Distance"].configurable = true;
          this_class.options["Goal Radius"].configurable = true;
          this_class.options["Goal Mouth"].configurable = true;
        }
        else {
          this_class.options["Goal Line"].configurable = false;
          this_class.options["Full Goal Line"].configurable = false;
          this_class.options["Goal Distance"].configurable = false;
          this_class.options["Goal Radius"].configurable = false;
          this_class.options["Goal Mouth"].configurable = false;
          this_class.options.GoalMouthLength.configurable = false;
          this_class.options.GoalLineLength.configurable = false;
        }
      },
      prev_sibling: "customizedUnified"
    };
    this.options["Goal Distance"] = {
      name: "Goal center to end line",
      _val: (15).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Draw Goals",
    };
    this.options["Goal Radius"] = {
      name: "Goal circle Radius",
      _val: (9).foot2meter(),
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      type: "float",
      "dontsave": true,
      prev_sibling: "Goal Distance"
    };
    this.options["Goal Line"] = {
      name: "Goal line",
      _val: true,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalLineLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
          this_class.options.GoalTraingle.val = false;
        }
        else {
          this_class.options.GoalLineLength.configurable = false;
        }
      },
      prev_sibling: "Goal Radius",
    };
    this.options.GoalLineLength = {
      name: "Goal line length",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Line",
    };
    this.options["Full Goal Line"] = {
      name: "Full goal line",
      _val: false,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
        }
      },
      prev_sibling: "Goal Line",
    };
    this.options["Goal Mouth"] = {
      configurable: true,
      name: "Goal mouth",
      _val: false,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalMouthLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Line"].val = false;
          this_class.options.GoalTraingle.val = false;
          this_class.options.DotBehindGoal.configurable = false;
        }
        else {
          this_class.options.GoalMouthLength.configurable = false;
        }
      },
      prev_sibling: "Full Goal Line",
    };
    this.options.GoalMouthLength = {
      name: "Goal mouth width",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Mouth",
    };
    this.options.GoalTraingle = {
      name: "Goal traingle",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TriangleSideLength.configurable = true;
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
        }
        else {
          this_class.options.TriangleSideLength.configurable = false;
        }
      },
      prev_sibling: "GoalMouthLength",
    };
    this.options.TriangleSideLength = {
      name: "Triangle side length",
      _val: (6).foot2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "GoalTraingle",
    };
    this.options["Defensive Sides Area"] = {
      configurable: true,
      name: "Defensive end to field end",
      _val: (35).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "DotBehindGoal"
    };
    this.options.defensive10yard = {
      configurable: true,
      name: "Defensive sides area",
      _val: (10).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Defensive Sides Area",
    };
    this.options["Center Circle"] = {
      configurable: true,
      name: "Center Circle",
      _val: true,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleRadius.configurable = true;
        }
        else {
          this_class.options.CenterCircleRadius.configurable = false;
        }
      },
      prev_sibling: "defensive10yard"
    };
    this.options.CenterCircleRadius = {
      name: "Circle Radius",
      _val: (30).foot2meter(),
      type: "float",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
      },
      "dontsave": true,
      prev_sibling: "Center Circle"
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      val: true,
      type: "bool",
      prev_sibling: "CenterCircleRadius"
    };
    this.options.CenterCrossLength = {
      configurable: false,
      name: "Center cross line length",
      val: 0.5,
      type: "float",
      prev_sibling: "CenterCross",
    };
    this.options.CenterWings = {
      configurable: true,
      name: "Center wings",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterWingsLength.configurable = true;
        }
        else {
          this_class.options.CenterWingsLength.configurable = false;
        }
      },
      prev_sibling: "CenterCrossLength",

    };
    this.options.CenterWingsLength = {
      name: "Center wings length",
      _val: (20).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterWings",
    }
    this.options.HashLength = {
      name: "Hash Marks length",
      val: (1).foot2meter(),
      type: "float",
      "dontsave": true
    };
    this.options["Side Bench"] = {
      configurable: true,
      name: "Bench area",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          if (this_class.options.customizedUnified.val) {
            this_class.options["Bench Boxes"].configurable = false;
          }
          this_class.options["Timer Box"].configurable = true;

        }
        else {
          this_class.options["Bench Boxes"].configurable = true;
          this_class.options["Timer Box"].configurable = false;
        }
      },

      prev_sibling: "CenterWingsLength",
    };
    this.options["Bench Boxes"] = {
      configurable: false,
      name: "Bench boxes",
      val: true,
      type: "bool",
      prev_sibling: "Side Bench",
    };
    this.options["Bench Box Length"] = {
      configurable: false,
      name: "Bench box length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options["Bench Box Width"] = {
      configurable: false,
      name: "Bench box width",
      val: (3).yard2meter(),
      type: "float",
      prev_sibling: "Bench Box Length",
    };
    this.options.BehindPenalityWidth = {
      configurable: false,
      name: "The area behind the substitution",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.PenalityLength = {
      configurable: false,
      name: "Coaches area from one to other side",
      val: (20).yard2meter(),
      type: "bool",
    };
    this.options.CoeachAreaDashedLength = {
      configurable: false,
      name: "The length of dashed coaches area ",
      val: (50).yard2meter(),
      type: "float"
    };
    this.options.TeamAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (15).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaLength = {
      configurable: false,
      name: "Coach area width",
      val: this.options.CoeachAreaDashedLength.val,
      type: "float",
    };
    this.options.SubstitutionLength = {
      configurable: false,
      name: "Substitution area - length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.SubstitutionWidth = {
      configurable: false,
      name: "Substitution area - width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.CoachBenchLength = {
      configurable: false,
      name: "Coaches area from one to other side",
      val: (20).yard2meter(),
      type: "bool",
    };
    this.options.CoachAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.BehindCoachWidth = {
      configurable: false,
      name: "The area behind the substitution",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options["Timer Box"] = {
      name: "Timer box",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TimerLength.configurable = true;
          this_class.options.TimerWidth.configurable = true;
        }
        else {
          this_class.options.TimerLength.configurable = false;
          this_class.options.TimerWidth.configurable = false;
        }
      },
      prev_sibling: "Bench Boxes",
    };
    this.options.TimerLength = {
      configurable: this_class.options["Timer Box"].configurable,
      name: "Timer Length",
      _val: (8).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Timer Box",
    };
    this.options.TimerWidth = {
      configurable: this_class.options["Timer Box"].configurable,
      name: "Timer width",
      _val: (2).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "TimerLength",
    };
    this.options.DashedSideLine = {
      configurable: true,
      name: "Dashed lines on the field sides",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.DashedDistanceOnTopSide.configurable = true;
          this_class.options.DashedDistanceOnBottomSide.configurable = true;
          this_class.options.ExtraSidelineLength.configurable = true;
        }
        else {
          this_class.options.DashedDistanceOnTopSide.configurable = false;
          this_class.options.DashedDistanceOnBottomSide.configurable = false;
          this_class.options.ExtraSidelineLength.configurable = false;
        }
      },
      prev_sibling: "DotBehindGoalRadius",
    };
    this.options.DashedDistanceOnTopSide = {
      name: "Distance to the dashed line - top",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "DashedSideLine",
    };
    this.options.DashedDistanceOnBottomSide = {
      name: "Distance to the dashed line - bottom",
      val: (6).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnTopSide",
    };
    this.options.ExtraSidelineLength = {
      name: "Extra lines at the dashed end",
      val: (5).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnBottomSide",
    };
    this.options.BenchDistanceFromCoachArea = {
      configurable: false,
      name: "Distance between bench and coach area",
      val: (2.5).yard2meter(),
      type: "float",
    };

    //  Options used only on customized women
    this.options.SubLength = {
      configurable: false,
      name: "Substitution area length",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options.SubWidth = {
      configurable: false,
      name: "Substitution area width",
      val: 2,
      type: "float",
    };
    this.options.PenalityLength = {
      configurable: false,
      name: "Penality area length",
      val: this.options.SubLength.val,
      type: "float",
    };
    this.options.PenalityWidth = {
      configurable: false,
      name: "Penality area width",
      val: this.options.SubWidth.val,
      type: "float",
    };
    this.options.Table = {
      name: "Table box",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TableLength.configurable = true;
          this_class.options.TableWidth.configurable = true;
        }
        else {
          this_class.options.TableLength.configurable = false;
          this_class.options.TableWidth.configurable = false;
        }
      },
      prev_sibling: "Bench Boxes",
    };
    this.options.TableLength = {
      configurable: this_class.options.Table.val,
      name: "Table length",
      _val: (7).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Table",
    };
    this.options.TableWidth = {
      configurable: this_class.options.Table.val,
      name: "Table Width",
      _val: (3).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "TableLength",
    };
    this.options.TimerDistanceFromSideLine = {
      configurable: false,
      name: "Distance between table and field side",
      val: (7).yard2meter(),
      type: "float",
      prev_sibling: "TableWidth",
    };
    this.options.TableDistanceFromSideline = {
      configurable: false,
      name: "Distance between table and field side",
      val: 4,
      type: "float",
      prev_sibling: "TableWidth",
    };
    this.options.BenchBoxLength = {
      configurable: false,
      name: "Bench length",
      val: (8).yard2meter(),
      type: "float",
      prev_sibling: "TableDistanceFromSideline",
    };
    this.options.BenchBoxWidth = {
      configurable: false,
      name: "Bench width",
      val: (2).yard2meter(),
      type: "float",
      prev_sibling: "BenchBoxLength",
    };
    this.options.BenchDistanceFromPlayingGround = {
      configurable: false,
      name: "Bench distance from field side",
      val: 5,
      type: "float",

    };
    this.options.IsolateBench = {
      configurable: true,
      name: "Bench isolation",
      val: true,
      type: "bool",
      prev_sibling: "Side Bench"
    };
    this.options.BenchIsolationLength = {
      configurable: false,
      name: "Bench isolation length",
      val: (6).yard2meter(),
      type: "float",
      prev_sibling: "IsolateBench",
    };
    this.options.dashedAroundBench = {
      configurable: false,
      name: "Dashed lines bench and table",
      val: (5).yard2meter(),
      type: "float"
    };
    this.options.CenterCircleLine = {
      configurable: this_class.options.customizedWomen.val,
      name: "Center circle line",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterCircleRadius",
    }
    this.options.CenterCircleLineLength = {
      name: "Circle line length",
      _val: 3,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterCircleLine",
    };

    this.option_categories.add({ title: "Pitch types", position: 1 });
    // OPTIONS ONLY USED IN UNIFIED LACROSSE
    this.options.GoalArcs = {
      name: "Goal area",
      val: true,
      type: "bool",
      prev_sibling: "Draw Goals",
    };
    this.options.Goal8meterArcRadius = {
      name: "8 meter arc radius",
      _val: 8,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "GoalArcs",

    };
    this.options.Goal12meterArcRadius = {
      name: "12 meter arc radius",
      _val: 12,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal8meterArcRadius",
    };
    this.options.DotBehindGoalRadius = {
      adjustable: false,
      name: "DotBehindGoalRadius",
      val: 0.06,
      type: "float",
      "dontsave": true,
      prev_sibling: "DotBehindGoal"
    };
    this.options.DotBehindGoal = {
      adjustable: false,
      name: "Spots as dots",
      val: true,
      type: "bool",
      prev_sibling: "TriangleSideLength"
    };
    this.options.TableDistanceFromSideline = {
      configurable: false,
      name: "Distance from side line",
      val: (6).yard2meter(),
      type: "float",
    };


    let maxLength;
    let maxWidth;

    if (this.options.customizedMen.val) {
      maxLength = (110).yard2meter();
      maxWidth = (60).yard2meter();
    }
    else {
      maxLength = (120).yard2meter();
      maxWidth = (65).yard2meter();
    }

    this.options.Length.val = maxLength;
    this.options.Width.val = maxWidth;

  }

  static get layout_methods() {
    return {
      "two_corners": 2,
      "two_corners,side": 3,
      "corner,side": 2,
      "all_corners": 4,
      "free_hand": 0
    };
  }

  chooseGoalType(c1, c2, c3, c4, angle, drawingSide) {
    let horizontal = angle.rotate_90_cw();
    let verticalCenter;
    let goalCenter;

    let kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
    if (drawingSide === 1) {
      verticalCenter = new Line(c1, c2).middle;
      goalCenter = verticalCenter.add(horizontal.multiply(this.options["Goal Distance"].val));
    }
    else {
      verticalCenter = new Line(c4, c3).middle;
      kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
      goalCenter = verticalCenter.subtract(horizontal.multiply(- this.options["Goal Distance"].val));
    }

    // Defining goal points
    let goalStart = goalCenter.add(angle.multiply(this.options["Goal Radius"].val));
    let goalEnd = goalCenter.subtract(angle.multiply(this.options["Goal Radius"].val));
    let ends = [goalStart, goalEnd];

    let goalLineStart = goalCenter.add(angle.multiply(0.5 * this.options.GoalLineLength.val));
    let goalLineEnd = goalCenter.subtract(angle.multiply(0.5 * this.options.GoalLineLength.val));
    let goalMouthRadius = goalCenter.subtract(horizontal.multiply(0.5 * this.options.GoalLineLength.val));

    // Triangle inside goal Circle
    let cornerBottom = goalCenter.add(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerTop = goalCenter.subtract(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerMiddleRight = goalCenter.add(horizontal.multiply(-kateteA));

    // Drawing goals
    if (this.options["Draw Goals"].val) {

      this.tasks.push(new ArcTask(this.tasks.length, ends, goalCenter, true, false, true));

      if (this.options["Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
      else if (this.options["Full Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalStart, goalEnd], false, true));
      else if (this.options["Goal Mouth"].val) {
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
        if (drawingSide === 1)
          this.tasks.push(new ArcTask(this.tasks.length, [goalLineStart, goalMouthRadius, goalLineEnd], goalCenter, true, false, true));
        else
          this.tasks.push(new ArcTask(this.tasks.length, [goalLineEnd, goalMouthRadius, goalLineStart], goalCenter, false, false, true));
      }
      else if (this.options.GoalTraingle.val) {
        this.tasks.push(new LineTask(this.tasks.length, [cornerBottom, cornerTop], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerTop, cornerMiddleRight], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerMiddleRight, cornerBottom], false, true));
      }
      else {
        return;
      }
    }

  }

  drawGoal(c1, c2, c3, c4, drawingSide) {

    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();

    let middle = new Line(c1, c2).middle;
    if (drawingSide === 2) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }

    if (this.options.customizedMen.val) {
      this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);
      return;
    }
    if (!this.options.GoalArcs.val) {
      this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);
      return;
    }


    let goalc = middle.add(g2.multiply(this.options["Goal Distance"].val));
    let goal_circle_radius = this.options["Goal Radius"].val - this.options.LineWidth.val / 2;
    let small_arc_radius = (34).foot2meter() + (10).inch2meter() - this.options.LineWidth.val / 2;
    let big_arc_radius = (47).foot2meter() + (9).inch2meter() - this.options.LineWidth.val / 2;

    // big circle
    let big_arc_start = goalc.add(g1.multiply(-big_arc_radius));
    let big_arc_middle = goalc.add(g2.multiply(big_arc_radius));
    let big_arc_end = goalc.add(g1.multiply(big_arc_radius));

    this.tasks.push(new ArcTask(this.tasks.length, [big_arc_start, big_arc_middle, big_arc_end], goalc, false, false, true));

    let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;
    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));

    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options["Goal Radius"].val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];

    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = 4 / small_arc_radius;
    let goal_hash = [];

    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    for (let i = -3; i <= 3; i++) {
      let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
      goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
    }

    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-distance_to_dots));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-distance_to_dots));
    let kick_guide1 = dot1_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide2 = dot1_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));
    let kick_guide3 = dot2_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide4 = dot2_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot1_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide2, kick_guide1], dot1_behind_goal, false, false, true));
    }

    let reverse = false;
    goal_hash.forEach((hash_mark) => {
      this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot2_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide4, kick_guide3], dot2_behind_goal, false, false, true));
    }

    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));

    // Goal and inside goal circles
    this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);

    // Back line
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_start, guide2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [guide1, big_arc_end], false, true));

  }

  drawDashedLine(start, end) {
    let dashedLength = 0.5;
    let paintLength = 0.5;
    this.tasks.push(new LineTask(this.tasks.length, [start, end], false, true));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_length", paintLength));
    this.tasks[this.tasks.length - 1].task_options.push(new FloatRobotAction("dashed_space", dashedLength));
  }

  drawBenchWomen(c1, c4) {

    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let fieldTopCenter = new Line(c1, c4).middle;

    // Defining the Substitution area
    let subLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subLeftTop = subLeftBottom.add(vertical.multiply(this.options.SubWidth.val));
    let subRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subRightTop = subRightBottom.add(vertical.multiply(this.options.SubWidth.val));

    // Defining the Penality area
    let penLeftBottom = subLeftTop;
    let penLeftTop = penLeftBottom.add(vertical.multiply(this.options.PenalityWidth.val));
    let penRightBottom = subRightTop;
    let penRightTop = penRightBottom.add(vertical.multiply(this.options.PenalityWidth.val));

    if (this.options.IsolateBench.val) {
      penLeftTop = penLeftBottom.add(vertical.multiply(this.options.BenchIsolationLength.val));
      penRightTop = penRightBottom.add(vertical.multiply(this.options.BenchIsolationLength.val));
    }

    // Defining the Table
    let tableLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.TableLength.val)).add(vertical.multiply(2 * this.options.SubWidth.val));
    let tableRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.TableLength.val)).add(vertical.multiply(2 * this.options.SubWidth.val));

    let tableLeftTop = tableLeftBottom.add(vertical.multiply(this.options.TableWidth.val));
    let tableRightTop = tableRightBottom.add(vertical.multiply(this.options.TableWidth.val));

    // // Defining an start point for Bench box
    let leftBenchRightSideBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.SubLength.val + 1)).add(vertical.multiply(this.options.BenchDistanceFromPlayingGround.val));
    let rightBenchLeftSideBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.SubLength.val + 1)).add(vertical.multiply(this.options.BenchDistanceFromPlayingGround.val));

    // Defining the dashed lines around the benchs 
    let dashedLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(2 * this.options.SubWidth.val));
    let dashedRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(2 * this.options.SubWidth.val));
    let dashedLeftTop = dashedLeftBottom.add(vertical.multiply(this.options.dashedAroundBench.val));
    let dashedRightTop = dashedRightBottom.add(vertical.multiply(this.options.dashedAroundBench.val));

    // Drawing substitution and penality area
    this.tasks.push(new LineTask(this.tasks.length, [subLeftBottom, subLeftTop], false, true));
    this.drawDashedLine(penLeftBottom, penLeftTop);

    this.drawDashedLine(penRightTop, penRightBottom);
    this.tasks.push(new LineTask(this.tasks.length, [subRightTop, subRightBottom], false, true));

    this.drawDashedLine(subRightTop, subLeftTop);

    // drawing the dashed bench area
    this.drawDashedLine(dashedRightBottom, dashedRightTop);
    this.drawDashedLine(dashedRightBottom, dashedLeftBottom);
    this.drawDashedLine(dashedLeftBottom, dashedLeftTop);

    // Drawing benchs & Table
    // if(this.options.B)
    this.drawBenchBox(leftBenchRightSideBottom, "left");

    if (this.options.Table.val) {
      this.tasks.push(new LineTask(this.tasks.length, [tableLeftBottom, tableLeftTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableLeftTop, tableRightTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableRightTop, tableRightBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableRightBottom, tableLeftBottom], false, true));
    }

    this.drawBenchBox(rightBenchLeftSideBottom, "right");
  }

  drawSideBenchUnified(c1, c4, horizontal) {
    if (!this.options["Side Bench"].val) // If side bench is false, don't paint it
    {
      return;
    }

    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let coachCenter = new Line(c1, c4).middle;

    // Team Area
    let penalityOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * (this.options.PenalityLength.val + lineWidth)));
    let penalityOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * (this.options.PenalityLength.val + lineWidth)));

    let penalityBehindWidthC1 = penalityOnLineC1.add(vertical.multiply(this.options.BehindPenalityWidth.val));
    let penalityBehindWidthC4 = penalityOnLineC4.add(vertical.multiply(this.options.BehindPenalityWidth.val));

    let dashedVerticalInsideC1 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let dashedVerticalInsideC4 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));

    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaBehindC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaBehindC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));

    // Table box
    let tableStartC1 = coachCenter.add(vertical.multiply(this.options.TableDistanceFromSideline.val)).subtract(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableStartC4 = coachCenter.add(vertical.multiply(this.options.TableDistanceFromSideline.val)).add(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableEndC1 = tableStartC1.add(vertical.multiply(this.options.TableWidth.val));
    let tableEndC4 = tableStartC4.add(vertical.multiply(this.options.TableWidth.val));

    // Drawing Team area
    this.drawDashedLine(penalityOnLineC1, penalityBehindWidthC1);
    this.drawDashedLine(penalityBehindWidthC4, penalityOnLineC4);

    this.drawDashedLine(teamAreaOnLineC4, teamAreaBehindC4);
    this.drawDashedLine(teamAreaBehindC4, teamAreaBehindC1);
    this.drawDashedLine(teamAreaBehindC1, teamAreaOnLineC1);

    this.drawDashedLine(dashedVerticalInsideC1, tableStartC1.subtract(horizontal.multiply(2 * this.options.LineWidth.val)));
    this.tasks.push(new LineTask(this.tasks.length, [tableStartC1, tableStartC4], false, true));
    this.drawDashedLine(tableStartC4.add(horizontal.multiply(2 * this.options.LineWidth.val)), dashedVerticalInsideC4);

    // Drawing Table box
    this.tasks.push(new LineTask(this.tasks.length, [tableEndC4, tableEndC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [tableEndC1, tableStartC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [tableStartC4, tableEndC4], false, true));

    if (this.options.DashedSideLine.val) {
      this.drawDashedLinesOnCoachSide(c1, c4);
    }
  }
  drawSideBenchMen(c1, c4, horizontal) {
    if (!this.options["Side Bench"].val) // If side bench is false, don't paint it
    {
      return;
    }

    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let coachCenter = new Line(c1, c4).middle;

    // Substitution Area
    let substitionOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionWidthC1 = substitionOnLineC1.add(vertical.multiply(this.options.SubstitutionWidth.val));
    let substitionWidthC4 = substitionOnLineC4.add(vertical.multiply(this.options.SubstitutionWidth.val));

    // Coach Area
    let coachOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.CoachAreaWidth.val));
    let coachWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.CoachAreaWidth.val));

    let coachBehindWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let coachBehindWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.BehindCoachWidth.val));

    let coachDashedWidthC1 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));
    let coachDashedWidthC4 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));

    // Team Area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let teamAreaBehindC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaBehindC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));

    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));

    // Timer box
    let timerStartC1 = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).subtract(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerStartC4 = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).add(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerEndC1 = timerStartC1.add(vertical.multiply(this.options.TimerWidth.val));
    let timerEndC4 = timerStartC4.add(vertical.multiply(this.options.TimerWidth.val));

    // Drawing Substitution
    this.tasks.push(new LineTask(this.tasks.length, [substitionOnLineC4, substitionWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [substitionWidthC1, substitionOnLineC1], false, true));

    // Drawing coach area
    this.tasks.push(new LineTask(this.tasks.length, [coachOnLineC1, coachBehindWidthC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC1, coachBehindWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC4, coachOnLineC4], false, true));

    // Drawing Team Area - Dashed lines
    this.drawDashedLine(teamAreaOnLineC4, coachDashedWidthC4);

    if (this.options.DashedSideLine.val) {
      this.drawDashedLine(teamArea10FeetC4, teamAreaBehindC4);
      this.drawDashedLine(teamAreaBehindC4, teamAreaBehindC1);
      this.drawDashedLine(teamAreaBehindC1, teamArea10FeetC1);
      this.drawDashedLine(coachDashedWidthC1, teamAreaOnLineC1);
      this.drawDashedLine(coachDashedWidthC1, coachWidthC1);
      this.tasks.push(new LineTask(this.tasks.length, [coachWidthC1, coachWidthC4], false, true));
      this.drawDashedLine(coachWidthC4, coachDashedWidthC4);
    }
    else {
      this.drawDashedLine(coachDashedWidthC4, coachWidthC4);
      this.tasks.push(new LineTask(this.tasks.length, [coachWidthC4, coachWidthC1], false, true));
      this.drawDashedLine(coachWidthC1, coachDashedWidthC1);
      this.drawDashedLine(coachDashedWidthC1, teamAreaOnLineC1);
    }

    // Drawing Timer box
    if (this.options["Timer Box"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [timerStartC4, timerStartC1], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerEndC1, timerEndC4], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerEndC4, timerStartC4], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerStartC1, timerEndC1], false, true));
    }


    let benchStartLeft = coachBehindWidthC4.add(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));
    let benchStartRight = coachBehindWidthC1.subtract(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));
    this.drawBenchBox(benchStartLeft, "left");
    this.drawBenchBox(benchStartRight, "right");

    if (this.options.DashedSideLine.val) {
      this.drawDashedLinesOnCoachSide(c1, c4);
    }
  }


  drawBenchBox(start, side) {
    if (!this.options["Bench Boxes"].val) {
      return;
    }

    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();

    let rightTop;
    let leftBottom;
    let leftTop;

    rightTop = start.add(vertical.multiply(this.options["Bench Box Width"].val));
    leftBottom = start.add(horizontal.multiply(this.options["Bench Box Length"].val));
    leftTop = leftBottom.add(vertical.multiply(this.options["Bench Box Width"].val));

    if (side === "right") {
      leftBottom = start.subtract(horizontal.multiply(this.options["Bench Box Length"].val));
      leftTop = leftBottom.add(vertical.multiply(this.options["Bench Box Width"].val));
    }

    this.tasks.push(new LineTask(this.tasks.length, [start, leftBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftTop, rightTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [rightTop, start], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftBottom, leftTop], false, true));

  }

  drawDashedLinesOnCoachSide(c1, c4) {
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let coachCenter = new Line(c1, c4).middle;

    // Dashed lines from coach area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(this.options.TeamAreaLength.val / 2));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(this.options.TeamAreaLength.val / 2));

    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));

    // Start and end points of dashed lines on the side of field as bench
    let dashedC1 = c1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC4 = c4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    // Drawing the dashed lines
    this.drawDashedLine(teamArea10FeetC1, dashedC1);
    this.drawDashedLine(dashedC4, teamArea10FeetC4);
  }

  drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide) {
    const horizontal = angle.rotate_90_cw();

    let defensive10yardVerticalTop;
    let defensive10yardVerticalBottom;
    let defensive10yardHorizontalTop;
    let defensive10yardHorizontalBottom;
    let defensive10yardEndTop;
    let defensive10yardEndBottom;

    if (drawingSide === 1) {
      defensive10yardVerticalTop = c1.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c2.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c1.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c2.add(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }
    else {
      defensive10yardVerticalTop = c4.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c3.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c4.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c3.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }

    if (this.options.customizedWomen.val) {
      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, drawingSide);
      }

      if (drawingSide === 1)
        this.tasks.push(new LineTask(this.tasks.length, [defensive10yardHorizontalBottom, defensive10yardHorizontalTop], false, true));
      else
        this.tasks.push(new LineTask(this.tasks.length, [defensive10yardHorizontalTop, defensive10yardHorizontalBottom], false, true));
      return;
    }

    // Drawing defensice sides
    if (drawingSide === 1) {
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalTop, defensive10yardEndTop], false, true));

      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, drawingSide);
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalBottom, defensive10yardEndBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardHorizontalBottom, defensive10yardHorizontalTop], false, true));
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardHorizontalTop, defensive10yardHorizontalBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardEndBottom, defensive10yardVerticalBottom], false, true));


      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, drawingSide);
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardEndTop, defensive10yardVerticalTop], false, true));
    }
  }


  createMiddle(c1, c2, c3, c4, angle) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;
    const fieldCenter = new Line(horizontalMiddleBottom, horizontalMiddleTop).middle;

    // Circle in the center of field defination
    const centerCircleStart = fieldCenter.subtract(horizontal.multiply(- this.options.CenterCircleRadius.val));
    const centerCircleEnd = fieldCenter.subtract(horizontal.multiply(this.options.CenterCircleRadius.val));
    const centerCircleLineTop = fieldCenter.subtract(angle.multiply(this.options.CenterCircleLineLength.val / 2));
    const centerCircleLineBottom = fieldCenter.add(angle.multiply(this.options.CenterCircleLineLength.val / 2));

    if (this.options.customizedWomen.val) {
      if (this.options["Center Circle"].val) {
        this.tasks.push(new ArcTask(this.tasks.length, [centerCircleStart, centerCircleEnd], fieldCenter, false, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [centerCircleLineTop, centerCircleLineBottom], false, true));
      }
      return;
    }

    const wingTopRight = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingTopLeft = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomRight = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomLeft = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));

    if (this.options.CenterWings.val) {
      this.tasks.push(new LineTask(this.tasks.length, [wingTopRight, wingTopLeft], false, true));
    }

    if (this.options["Center Circle"].val) {
      this.tasks.push(new ArcTask(this.tasks.length, [centerCircleStart, centerCircleEnd], fieldCenter, false, false, true));
    }

    if (this.options.CenterCross.val) {
      const pointRightTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
      const pointRightBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
      const pointLeftBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
      const pointLeftTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));

      this.tasks.push(new LineTask(this.tasks.length, [pointRightTop, pointLeftBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [pointRightBottom, pointLeftTop], false, true));

    }

    if (this.options.CenterWings.val) {
      this.tasks.push(new LineTask(this.tasks.length, [wingBottomLeft, wingBottomRight], false, true));
    }

    this.tasks.push(new LineTask(this.tasks.length, [horizontalMiddleBottom, horizontalMiddleTop], false, true));
  }

  drawBench(c1, c4, horizontal) {

    if (this.options.customizedWomen.val) {
      this.drawBenchWomen(c1, c4, horizontal);
    }
    else if (this.options.customizedUnified.val) {
      this.drawSideBenchUnified(c1, c4, horizontal);
    }
    else {
      this.drawSideBenchMen(c1, c4, horizontal);
    }
  }


  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    let angle = new Line(c1, c2).unit_vector;
    let horizontal = angle.rotate_90_cw();
    let drawingSide = 1;

    // Points defination of dashed lines on the bottom side
    let dashedC2 = c2.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC3 = c3.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    this.start_locations.push(new StartLocation(c4, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));

    this.drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide);
    this.createMiddle(c1, c2, c3, c4, angle);

    drawingSide = 2;
    this.drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide);
    this.tasks.push(new LineTask(this.tasks.length, [c4, c3], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c2], false, true));

    if (this.options.DashedSideLine.val) {
      this.drawDashedLine(dashedC2, dashedC3);
    }
    this.drawBench(c1, c4, horizontal);

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class CustomLacrosseWomen extends square_pitch {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Custom Women"; // Translateable
  static template_id = "custom_lacrosse_women_dev"; // no spaces
  static template_image = "img/templates/us_lacross_women_black.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;

    this.options.Width.val = (65).yard2meter();
    this.options.Length.val = (120).yard2meter();

    this.options.DefensiveSideWidth = {
      configurable: true,
      name: "Defensive vertical to end line",
      _val: (40).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
    };
    this.options["Draw Goals"] = {
      configurable: true,
      name: "Draw goals",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].configurable = true;
          this_class.options["Full Goal Line"].configurable = true;
          this_class.options["Goal Distance"].configurable = true;
          this_class.options["Goal Radius"].configurable = true;
          this_class.options["Goal Mouth"].configurable = true;
          this_class.options.GoalTraingle.configurable = true;
          this_class.options.GoalMouthRadius.configurable = true;
          this_class.options.GoalArcs.configurable = true;
          this_class.options.GoalArcs.val = true;
        }
        else {
          this_class.options["Goal Line"].configurable = false;
          this_class.options["Full Goal Line"].configurable = false;
          this_class.options["Goal Distance"].configurable = false;
          this_class.options["Goal Radius"].configurable = false;
          this_class.options["Goal Mouth"].configurable = false;
          this_class.options.GoalTraingle.configurable = false;
          this_class.options.GoalMouthRadius.configurable = false;
          this_class.options.GoalLineLength.configurable = false;
          this_class.options.GoalArcs.configurable = false;
          this_class.options.GoalArcs.val = true;
        }
      },
      prev_sibling: "DefensiveSideWidth",
    };
    this.options["Goal Distance"] = {
      name: "Goal center to end line",
      _val: (15).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Draw Goals",
    };
    this.options["Goal Radius"] = {
      name: "Goal circle Radius",
      _val: (9).foot2meter(),
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      type: "float",
      "dontsave": true,
      prev_sibling: "Goal Distance"
    };
    this.options["Goal Line"] = {
      name: "Goal line",
      _val: false,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalLineLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
          this_class.options.GoalTraingle.val = false;
        }
        else {
          this_class.options.GoalLineLength.configurable = false;
        }
      },
      prev_sibling: "Goal Radius",
    };
    this.options.GoalLineLength = {
      name: "Goal line length",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Line",
    };
    this.options["Full Goal Line"] = {
      name: "Full goal line",
      _val: false,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
        }
      },
      prev_sibling: "GoalLineLength",
    };
    this.options["Goal Mouth"] = {
      configurable: true,
      name: "Goal mouth",
      _val: false,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalMouthRadius.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Line"].val = false;
          this_class.options.GoalTraingle.val = false;
          this_class.options.DotBehindGoal.configurable = false;
        }
        else {
          this_class.options.GoalMouthRadius.configurable = false;
        }
      },
      prev_sibling: "Full Goal Line",
    };
    this.options.GoalMouthRadius = {
      name: "Goal mouth radius",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Mouth",
    };
    this.options.GoalTraingle = {
      name: "Goal traingle",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TriangleSideLength.configurable = true;
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
        }
        else {
          this_class.options.TriangleSideLength.configurable = false;
        }
      },
      prev_sibling: "GoalMouthRadius",
    };
    this.options.TriangleSideLength = {
      name: "Triangle side length",
      _val: (6).foot2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "GoalTraingle",
    };
    this.options.GoalArcs = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal arcs",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.DotDistanceToGoalLine.configurable = true;
          this_class.options.HashLength.configurable = true;
        }
        else {
          this_class.options.DotDistanceToGoalLine.configurable = false;
          this_class.options.HashLength.configurable = false;
        }
      },
      prev_sibling: "TriangleSideLength",
    };
    this.options.HashLength = {
      configurable: this_class.options.GoalArcs.val,
      name: "Hash Marks length",
      _val: (1).foot2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      "dontsave": true,
      prev_sibling: "GoalArcs",
    };
    this.options.DotDistanceToGoalLine = {
      configurable: this_class.options.GoalArcs.val,
      name: "Distance from dot to hash mark",
      _val: (5).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "HashLength",
    };
    this.options.DotBehindGoal = {
      adjustable: false,
      name: "Dots as circle",
      val: true,
      type: "bool",
      prev_sibling: "DotDistanceToGoalLine"
    };
    this.options.DotBehindGoalRadius = {
      configurable: this_class.options.GoalArcs.val,
      adjustable: false,
      name: "Dots radius",
      val: 0.06,
      type: "float",
      "dontsave": true,
      prev_sibling: "DotBehindGoal"
    };
    this.options["Center Circle"] = {
      configurable: true,
      name: "Center Circle",
      _val: true,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleRadius.configurable = true;
          this_class.options.CenterCircleLine.configurable = true;
        }
        else {
          this_class.options.CenterCircleRadius.configurable = false;
          this_class.options.CenterCircleLine.configurable = false;
          this_class.options.CenterCircleLine.val = false;
        }
      },
      prev_sibling: "DotBehindGoalRadius",
    };
    this.options.CenterCircleRadius = {
      name: "Circle Radius",
      _val: (30).foot2meter(),
      type: "float",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
      },
      "dontsave": true,
      prev_sibling: "Center Circle",
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCrossLength.configurable = true;
          this_class.options.CenterCircleLine.val = false;
        }
        else {
          this_class.options.CenterCrossLength.configurable = false;
        }
      },
      prev_sibling: "CenterCircleRadius"
    };
    this.options.CenterCrossLength = {
      configurable: this_class.options.CenterCross.val,
      name: "Center cross line length",
      _val: 0.5,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleLine.val = false;
        }
      },
      prev_sibling: "CenterCross",
    };
    this.options.CenterCircleLine = {
      configurable: true,
      name: "Center circle line",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleLineLength.configurable = true;
          this_class.options.CenterCross.val = false;
        }
        else {
          this_class.options.CenterCircleLineLength.configurable = false;
        }
      },
      prev_sibling: "CenterCrossLength",
    }
    this.options.CenterCircleLineLength = {
      configurable: this_class.options.CenterCircleLine.val,
      name: "Circle line length",
      _val: 3,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterCircleLine",
    };
    this.options["Side Bench"] = {
      configurable: true,
      name: "Bench area",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.Table.configurable = true;
          this_class.options.Table.val = true;
          this_class.options.BenchBoxes.configurable = true;
          this_class.options.BenchBoxes.val = true;
          this_class.options.SubLength.configurable = true;
          this_class.options.SubWidth.configurable = true;
          this_class.options.PenalityWidth.configurable = true;
          this_class.options.BenchIsolationLength.configurable = true;
          this_class.options.BenchDistanceFromIsolationLine.configurable = true;
          this_class.options.DashedLength.configurable = true;
          this_class.options.DashedSpace.configurable = true;
        }
        else {
          this_class.options.Table.configurable = false;
          this_class.options.Table.val = false;
          this_class.options.BenchBoxes.configurable = false;
          this_class.options.BenchBoxes.val = false;
          this_class.options.SubLength.configurable = false;
          this_class.options.SubWidth.configurable = false;
          this_class.options.PenalityWidth.configurable = false;
          this_class.options.BenchIsolationLength.configurable = false;
          this_class.options.BenchDistanceFromIsolationLine.configurable = false;
          this_class.options.DashedLength.configurable = false;
          this_class.options.DashedSpace.configurable = false;
        }
      },
      prev_sibling: "CenterCircleLineLength",
    };
    this.options.SubLength = {
      configurable: this_class.options["Side Bench"].val,
      name: "Substitution and penality length",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "Side Bench",
    };
    this.options.SubWidth = {
      configurable: this_class.options["Side Bench"].val,
      name: "Substitution width",
      val: 2,
      type: "float",
      prev_sibling: "SubLength",
    };
    this.options.PenalityWidth = {
      configurable: this_class.options["Side Bench"].val,
      name: "Penality width",
      val: 2,
      type: "float",
      prev_sibling: "SubWidth",
    };
    this.options.Table = {
      configurable: this_class.options["Side Bench"].val,
      name: "Table box",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TableLength.configurable = true;
          this_class.options.TableWidth.configurable = true;
        }
        else {
          this_class.options.TableLength.configurable = false;
          this_class.options.TableWidth.configurable = false;
        }
      },
      prev_sibling: "PenalityWidth",
    };
    this.options.TableLength = {
      configurable: this_class.options.Table.val,
      name: "Table length",
      _val: (7).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Table",
    };
    this.options.TableWidth = {
      configurable: this_class.options.Table.val,
      name: "Table Width",
      _val: (3).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "TableLength",
    };
    this.options.TableDistanceFromSideline = {
      configurable: false,
      name: "Distance between table and field side",
      val: 4,
      type: "float",
      prev_sibling: "TableWidth",
    };
    this.options.BenchIsolationLength = {
      configurable: this_class.options["Side Bench"].val,
      name: "Isolate each team area",
      val: (0).yard2meter(),
      type: "float",
      prev_sibling: "TableDistanceFromSideline",
    };
    this.options.BenchBoxes = {
      configurable: this_class.options.Table.val,
      name: "Bench boxes",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.BenchBoxLength.configurable = true;
          this_class.options.BenchBoxWidth.configurable = true;
          this_class.options.BenchDistanceFromPlayingGround.configurable = true;
          this_class.options.BenchDistanceFromIsolationLine.configurable = true;
        }
        else {
          this_class.options.BenchBoxLength.configurable = false;
          this_class.options.BenchBoxWidth.configurable = false;
          this_class.options.BenchDistanceFromPlayingGround.configurable = false;
          this_class.options.BenchDistanceFromIsolationLine.configurable = false;
        }
      },
      prev_sibling: "BenchIsolationLength",
    };
    this.options.BenchBoxLength = {
      configurable: this_class.options.BenchBoxes.val,
      name: "Bench length",
      val: (8).yard2meter(),
      type: "float",
      prev_sibling: "BenchBoxes",
    };
    this.options.BenchBoxWidth = {
      configurable: this_class.options.BenchBoxes.val,
      name: "Bench width",
      val: (2).yard2meter(),
      type: "float",
      prev_sibling: "BenchBoxLength",
    };
    this.options.BenchDistanceFromIsolationLine = {
      configurable: this_class.options.BenchBoxes.val,
      name: "Benchs distance to table",
      _val: (6).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "BenchBoxWidth"
    }
    this.options.BenchDistanceFromPlayingGround = {
      configurable: this_class.options.BenchBoxes.val,
      name: "Benchs distance to field side",
      val: 5,
      type: "float",
      prev_sibling: "BenchDistanceFromIsolationLine",
    };
    this.options.dashedAroundBench = {
      configurable: false,
      name: "Dashed lines bench and table",
      val: (5).yard2meter(),
      type: "float",

      prev_sibling: "BenchDistanceFromPlayingGround",
    };
    this.options.DashedLength = {
      name: "Dash length",
      val: 0.5,
      type: "float",
      prev_sibling: "dashedAroundBench",
    };
    this.options.DashedSpace = {
      name: "Dash space",
      val: 0.5,
      type: "float",
      prev_sibling: "DashedLength",
    };
  }

  createDashedLineTask(start, end) {
    let task = new LineTask(this.tasks.length, [start, end], false, true);
    task.task_options.push(new FloatRobotAction("dashed_offset", 0.1));
    task.task_options.push(new FloatRobotAction("dashed_length", this.options.DashedLength.val));
    task.task_options.push(new FloatRobotAction("dashed_space", this.options.DashedSpace.val));
    if (task.id > 0) {

      this.tasks[task.id - 2].task_options.push(new BoolRobotAction("task_merge_next", false));
    }
    return task;
  }

  drawBenchBox(start, side) {
    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();

    let rightTop;
    let leftBottom;
    let leftTop;

    rightTop = start.add(vertical.multiply(this.options.BenchBoxWidth.val));
    leftBottom = start.add(horizontal.multiply(this.options.BenchBoxLength.val));
    leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));

    if (side === "right") {
      leftBottom = start.subtract(horizontal.multiply(this.options.BenchBoxLength.val));
      leftTop = leftBottom.add(vertical.multiply(this.options.BenchBoxWidth.val));
    }
    this.tasks.push(new LineTask(this.tasks.length, [rightTop, start], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [start, leftBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftBottom, leftTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [leftTop, rightTop], false, true));
  }

  drawBench(c1, c4) {
    if (!this.options["Side Bench"].val) {
      return;
    }

    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let fieldTopCenter = new Line(c1, c4).middle;

    // Defining the Substitution area
    let subLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subLeftTop = subLeftBottom.add(vertical.multiply(this.options.SubWidth.val));
    let subRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.SubLength.val));
    let subRightTop = subRightBottom.add(vertical.multiply(this.options.SubWidth.val));

    // Defining the Penality area
    let penLeftBottom = subLeftTop;
    let penRightBottom = subRightTop;
    let penLeftTop = subLeftTop.add(vertical.multiply(this.options.PenalityWidth.val + this.options.BenchIsolationLength.val));
    let penRightTop = penRightBottom.add(vertical.multiply(this.options.PenalityWidth.val + this.options.BenchIsolationLength.val));


    // Defining the Table
    let tableLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.TableLength.val)).add(vertical.multiply(this.options.PenalityWidth.val + this.options.SubWidth.val));
    let tableRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.TableLength.val)).add(vertical.multiply(this.options.PenalityWidth.val + this.options.SubWidth.val));

    let tableLeftTop = tableLeftBottom.add(vertical.multiply(this.options.TableWidth.val));
    let tableRightTop = tableRightBottom.add(vertical.multiply(this.options.TableWidth.val));

    // // Defining an start point for Bench box
    let leftBenchRightSideBottom = fieldTopCenter.add(horizontal.multiply(0.5 * this.options.TableLength.val + this.options.BenchDistanceFromIsolationLine.val)).add(vertical.multiply(this.options.BenchDistanceFromPlayingGround.val));
    let rightBenchLeftSideBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * this.options.TableLength.val + this.options.BenchDistanceFromIsolationLine.val)).add(vertical.multiply(this.options.BenchDistanceFromPlayingGround.val));

    // Defining the dashed lines around the benchs 
    let dashedLeftBottom = fieldTopCenter.add(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(this.options.SubWidth.val + this.options.PenalityWidth.val));
    let dashedRightBottom = fieldTopCenter.subtract(horizontal.multiply(0.5 * (this.options.Length.val / 3))).add(vertical.multiply(this.options.SubWidth.val + this.options.PenalityWidth.val));
    let dashedLeftTop = dashedLeftBottom.add(vertical.multiply(this.options.dashedAroundBench.val));
    let dashedRightTop = dashedRightBottom.add(vertical.multiply(this.options.dashedAroundBench.val));

    this.start_locations.push(new StartLocation(subRightBottom, this.tasks.length));
    // Drawing substitution and penality area
    this.tasks.push(new LineTask(this.tasks.length, [subRightBottom, subRightTop], false, true));
    this.tasks.push(this.createDashedLineTask(penRightBottom, penRightTop));

    this.tasks.push(this.createDashedLineTask(penLeftTop, penLeftBottom));
    this.tasks.push(new LineTask(this.tasks.length, [subLeftTop, subLeftBottom], false, true));

    this.tasks.push(this.createDashedLineTask(subLeftTop, subRightTop));

    // drawing the dashed bench area
    this.tasks.push(this.createDashedLineTask(dashedRightBottom, dashedRightTop));
    if (this.options.Table.val) {
      this.tasks.push(this.createDashedLineTask(dashedRightBottom, tableRightBottom));
      this.tasks.push(new LineTask(this.tasks.length, [tableRightBottom, tableLeftBottom], false, true));
      this.tasks.push(this.createDashedLineTask(tableLeftBottom, dashedLeftBottom));
    }
    else {
      this.tasks.push(this.createDashedLineTask(dashedRightBottom, dashedLeftBottom));
    }
    this.tasks.push(this.createDashedLineTask(dashedLeftBottom, dashedLeftTop));

    // Drawing benchs & Table
    if (this.options.BenchBoxes.val) {
      this.drawBenchBox(leftBenchRightSideBottom, "left");
    }

    if (this.options.Table.val) {
      this.tasks.push(new LineTask(this.tasks.length, [tableLeftBottom, tableLeftTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableLeftTop, tableRightTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableRightTop, tableRightBottom], false, true));
    }

    if (this.options.BenchBoxes.val) {
      this.drawBenchBox(rightBenchLeftSideBottom, "right");
    }
  }
  chooseGoalType(c1, c2, c3, c4, angle, drawingSide) {
    let horizontal = angle.rotate_90_cw();
    let verticalCenter;
    let goalCenter;

    let kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
    if (drawingSide === 1) {
      verticalCenter = new Line(c1, c2).middle;
      goalCenter = verticalCenter.add(horizontal.multiply(this.options["Goal Distance"].val));
    }
    else {
      verticalCenter = new Line(c4, c3).middle;
      kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
      goalCenter = verticalCenter.subtract(horizontal.multiply(- this.options["Goal Distance"].val));
    }

    // Defining goal points
    let goalStart = goalCenter.add(angle.multiply(this.options["Goal Radius"].val));
    let goalEnd = goalCenter.subtract(angle.multiply(this.options["Goal Radius"].val));
    let ends = [goalStart, goalEnd];

    let goalLineStart = goalCenter.add(angle.multiply(0.5 * this.options.GoalLineLength.val));
    let goalLineEnd = goalCenter.subtract(angle.multiply(0.5 * this.options.GoalLineLength.val));

    // Goal mouth behind length
    let goalMouthRadius = goalCenter.subtract(horizontal.multiply(this.options.GoalMouthRadius.val));
    let goalMouthBehindLineStart = goalCenter.subtract(angle.multiply(this.options.GoalMouthRadius.val));
    let goalMouthBehindLineEnd = goalCenter.add(angle.multiply(this.options.GoalMouthRadius.val));

    // Triangle inside goal Circle
    let cornerBottom = goalCenter.add(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerTop = goalCenter.subtract(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerMiddleRight = goalCenter.add(horizontal.multiply(-kateteA));

    // Drawing goals
    if (this.options["Draw Goals"].val) {
      this.tasks.push(new ArcTask(this.tasks.length, ends, goalCenter, false, false, true));

      if (this.options["Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
      else if (this.options["Full Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalStart, goalEnd], false, true));
      else if (this.options["Goal Mouth"].val) {
        this.tasks.push(new LineTask(this.tasks.length, [goalMouthBehindLineStart, goalMouthBehindLineEnd], false, true));
        if (drawingSide === 1)
          this.tasks.push(new ArcTask(this.tasks.length, [goalMouthBehindLineStart, goalMouthRadius, goalMouthBehindLineEnd], goalCenter, false, false, true));
        else
          this.tasks.push(new ArcTask(this.tasks.length, [goalMouthBehindLineEnd, goalMouthRadius, goalMouthBehindLineStart], goalCenter, true, false, true));
      }
      else if (this.options.GoalTraingle.val) {
        this.tasks.push(new LineTask(this.tasks.length, [cornerBottom, cornerTop], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerTop, cornerMiddleRight], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerMiddleRight, cornerBottom], false, true));
      }
      else {
        return;
      }
    }
  }

  drawGoal(c1, c2, c3, c4, drawingSide) {
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();

    let middle = new Line(c1, c2).middle;
    if (drawingSide === 2) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }

    if (!this.options.GoalArcs.val) {
      this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);
      return;
    }

    let goalc = middle.add(g2.multiply(this.options["Goal Distance"].val));
    let goal_circle_radius = this.options["Goal Radius"].val - this.options.LineWidth.val / 2;
    let small_arc_radius = (34).foot2meter() + (10).inch2meter() - this.options.LineWidth.val / 2;
    let big_arc_radius = (47).foot2meter() + (9).inch2meter() - this.options.LineWidth.val / 2;

    // big circle
    let big_arc_start = goalc.add(g1.multiply(-big_arc_radius));
    let big_arc_middle = goalc.add(g2.multiply(big_arc_radius));
    let big_arc_end = goalc.add(g1.multiply(big_arc_radius));

    this.tasks.push(new ArcTask(this.tasks.length, [big_arc_start, big_arc_middle, big_arc_end], goalc, false, false, true));

    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));

    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options["Goal Radius"].val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];

    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = 4 / small_arc_radius;
    let goal_hash = [];

    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    for (let i = -3; i <= 3; i++) {
      let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
      goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
    }

    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-this.options.DotDistanceToGoalLine.val));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-this.options.DotDistanceToGoalLine.val));
    let kick_guide1 = dot1_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide2 = dot1_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));
    let kick_guide3 = dot2_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide4 = dot2_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot1_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide2, kick_guide1], dot1_behind_goal, false, false, true));
    }

    let reverse = false;
    goal_hash.forEach((hash_mark) => {
      this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot2_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide4, kick_guide3], dot2_behind_goal, false, false, true));
    }
    // Back line - top
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_start, guide2], false, true));

    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));

    // Goal and inside goal circles
    this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);

    // Back line - bottom
    this.tasks.push(new LineTask(this.tasks.length, [guide1, big_arc_end], false, true));
  }

  drawMiddle(c1, c2, c3, c4, angle) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;
    const fieldCenter = new Line(horizontalMiddleBottom, horizontalMiddleTop).middle;

    // Circle in the center of field defination
    const centerCircleStart = fieldCenter.subtract(angle.multiply(- this.options.CenterCircleRadius.val));
    const centerCircleEnd = fieldCenter.subtract(angle.multiply(this.options.CenterCircleRadius.val));
    const centerCircleLineTop = fieldCenter.subtract(angle.multiply(this.options.CenterCircleLineLength.val / 2));
    const centerCircleLineBottom = fieldCenter.add(angle.multiply(this.options.CenterCircleLineLength.val / 2));

    // Center cross
    const pointRightTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointRightBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));

    if (this.options["Center Circle"].val) {
      this.tasks.push(new ArcTask(this.tasks.length, [centerCircleStart, centerCircleEnd], fieldCenter, false, false, true));
      if (this.options.CenterCircleLine.val) {
        this.tasks.push(new LineTask(this.tasks.length, [centerCircleLineBottom, centerCircleLineTop], false, true));
      }
    }

    // The cross lines inside the center circle
    if (this.options.CenterCross.val) {
      this.tasks.push(new LineTask(this.tasks.length, [pointRightTop, pointLeftBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [pointRightBottom, pointLeftTop], false, true));
    }
  }

  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    const angle = new Line(c1, c2).unit_vector;
    const horizontal = angle.rotate_90_cw();

    // Vertical lines
    const leftTop = c4.subtract(horizontal.multiply(this.options.DefensiveSideWidth.val));
    const leftBottom = c3.subtract(horizontal.multiply(this.options.DefensiveSideWidth.val));
    const rightTop = c1.add(horizontal.multiply(this.options.DefensiveSideWidth.val));
    const rightBottom = c2.add(horizontal.multiply(this.options.DefensiveSideWidth.val));

    this.start_locations.push(new StartLocation(c3, this.tasks.length));
    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));

    this.drawGoal(c1, c2, c3, c4, 2);
    this.tasks.push(new LineTask(this.tasks.length, [leftTop, leftBottom], false, true));

    this.drawMiddle(c1, c2, c3, c4, angle);
    this.drawGoal(c1, c2, c3, c4, 1);

    this.tasks.push(new LineTask(this.tasks.length, [rightBottom, rightTop], false, true));
    this.drawBench(c1, c4);

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class CustomLacrosseUnified extends square_pitch {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Custom Unified"; // Translateable
  static template_id = "custom_lacrosse_unified_dev"; // no spaces
  static template_image = "img/templates/us_lacross_unified_highschool_black.png"; // no spaces
  constructor(id, name, layout_method) {
    super(id, name, layout_method);

    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;

    this.options.Width.val = (60).yard2meter();
    this.options.Length.val = (120).yard2meter();

    this.options.defensive10yard = {
      configurable: true,
      name: "Defensive horizontal to side line",
      _val: (10).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
    };
    this.options["Defensive Sides Area"] = {
      configurable: true,
      name: "Defensive vertical to end line",

      _val: (35).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "defensive10yard",
    };

    this.options["Draw Goals"] = {
      configurable: true,
      name: "Draw goals",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].configurable = true;
          this_class.options["Full Goal Line"].configurable = true;
          this_class.options["Goal Distance"].configurable = true;
          this_class.options["Goal Radius"].configurable = true;
          this_class.options["Goal Mouth"].configurable = true;
          this_class.options.GoalTraingle.configurable = true;
          this_class.options.GoalArcs.configurable = true;
          this_class.options.GoalArcs.val = true;
        }
        else {
          this_class.options["Goal Line"].configurable = false;
          this_class.options["Full Goal Line"].configurable = false;
          this_class.options["Goal Distance"].configurable = false;
          this_class.options["Goal Radius"].configurable = false;
          this_class.options["Goal Mouth"].configurable = false;
          this_class.options.GoalMouthLength.configurable = false;
          this_class.options.GoalLineLength.configurable = false;
          this_class.options.GoalTraingle.configurable = false;
          this_class.options.GoalArcs.configurable = false;
          this_class.options.GoalArcs.val = false;
        }
      },
      prev_sibling: "Defensive Sides Area"
    };
    this.options["Goal Distance"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal distance to end line",
      _val: (15).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Draw Goals",
    };
    this.options["Goal Radius"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal radius",
      _val: (9).foot2meter(),
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      type: "float",
      "dontsave": true,
      prev_sibling: "Goal Distance"
    };
    this.options["Goal Line"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal line",
      _val: true,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalLineLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
          this_class.options.GoalTraingle.val = false;
        }
        else {
          this_class.options.GoalLineLength.configurable = false;
        }
      },
      prev_sibling: "Goal Radius",
    };
    this.options.GoalLineLength = {
      configurable: this_class.options["Goal Line"].val,
      name: "Goal line length",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Line",
    };
    this.options["Full Goal Line"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Full goal line",
      _val: false,
      type: "bool",
      get val() { return this._val },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
          this_class.options.GoalTraingle.val = false;
        }
      },
      prev_sibling: "GoalLineLength",
    };
    this.options["Goal Mouth"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal mouth",
      _val: false,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.GoalMouthLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Line"].val = false;
          this_class.options.GoalTraingle.val = false;
        }
        else {
          this_class.options.GoalMouthLength.configurable = false;
        }
      },
      prev_sibling: "Full Goal Line",
    };
    this.options.GoalMouthLength = {
      configurable: this_class.options["Goal Mouth"].val,
      name: "Goal mouth width",
      _val: (6).foot2meter(),
      type: "float",
      get val() { return this._val },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Mouth",
    };
    this.options.GoalTraingle = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal traingle",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TriangleSideLength.configurable = true;
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Line"].val = false;
          this_class.options["Goal Mouth"].val = false;
        }
        else {
          this_class.options.TriangleSideLength.configurable = false;
        }
      },
      prev_sibling: "GoalMouthLength",
    };
    this.options.TriangleSideLength = {
      configurable: this_class.options.GoalTraingle.val,
      name: "Triangle side length",
      _val: (6).foot2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "GoalTraingle",
    };
    this.options.GoalArcs = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal arcs",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.HashLength.configurable = true;
          this_class.options.DotBehindGoal.configurable = true;
        }
        else {
          this_class.options.DotBehindGoal.configurable = false;
          this_class.options.HashLength.configurable = false;
        }
      },
      prev_sibling: "TriangleSideLength",
    };
    this.options.HashLength = {
      configurable: this_class.options.GoalArcs.val,
      name: "Hash Marks length",
      val: (1).foot2meter(),
      type: "float",
      "dontsave": true,
      prev_sibling: "GoalArcs"
    };
    this.options.DotBehindGoal = {
      configurable: this_class.options.GoalArcs.val,
      adjustable: false,
      name: "Dots as circle",
      val: true,
      type: "bool",
      prev_sibling: "HashLength"
    };
    this.options.DotBehindGoalRadius = {
      adjustable: false,
      name: "Spot as dot radius",
      val: 0.06,
      type: "float",
      "dontsave": true,
      prev_sibling: "DotBehindGoal"
    };
    this.options.Goal8meterArcRadius = {
      name: "8 meter arc radius",
      _val: 8,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "DotBehindGoalRadius",

    };
    this.options.Goal12meterArcRadius = {
      name: "12 meter arc radius",
      _val: 12,
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal8meterArcRadius",
    };
    this.options["Center Circle"] = {
      configurable: true,
      name: "Center Circle",
      _val: true,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleRadius.configurable = true;
        }
        else {
          this_class.options.CenterCircleRadius.configurable = false;
        }
      },
      prev_sibling: "Goal12meterArcRadius"
    };
    this.options.CenterCircleRadius = {
      configurable: this_class.options["Center Circle"].val,
      name: "Circle Radius",
      _val: (30).foot2meter(),
      type: "float",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
      },
      "dontsave": true,
      prev_sibling: "Center Circle"
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCrossLength.configurable = true;
        }
        else {
          this_class.options.CenterCrossLength.configurable = false;
        }
      },
      prev_sibling: "CenterCircleRadius"
    };
    this.options.CenterCrossLength = {
      configurable: this_class.options.CenterCross.val,
      name: "Center cross length",
      val: 0.5,
      type: "float",
      prev_sibling: "CenterCross",
    };
    this.options.CenterWings = {
      configurable: true,
      name: "Center wings",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterWingsLength.configurable = true;
        }
        else {
          this_class.options.CenterWingsLength.configurable = false;
        }
      },
      prev_sibling: "CenterCrossLength",

    };
    this.options.CenterWingsLength = {
      configurable: this_class.options.CenterWings.val,
      name: "Center wings length",
      _val: (20).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterWings",
    }

    // Bench options
    this.options.BenchArea = {
      configurable: true,
      name: "Bench area",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.penalityIsolationLineLength.configurable = true;
          this_class.options.TeamAreaLength.configurable = true;
          this_class.options.TeamAreaWidth.configurable = true;
          this_class.options.PenaltyLength.configurable = true;
          this_class.options.PenaltyWidth.configurable = true;
          this_class.options.Table.configurable = true;
          this_class.options.TableLength.configurable = true;
          this_class.options.TableWidth.configurable = true;
          this_class.options.DashedLength.configurable = true;
          this_class.options.DashedSpace.configurable = true;
        }
        else {
          this_class.options.penalityIsolationLineLength.configurable = false;
          this_class.options.TeamAreaLength.configurable = false;
          this_class.options.TeamAreaWidth.configurable = false;
          this_class.options.PenaltyLength.configurable = false;
          this_class.options.PenaltyWidth.configurable = false;
          this_class.options.Table.configurable = false;
          this_class.options.TableLength.configurable = false;
          this_class.options.TableWidth.configurable = false;
          this_class.options.DashedLength.configurable = false;
          this_class.options.DashedSpace.configurable = false;
        }
      },
      prev_sibling: "CenterWingsLength",

    };
    this.options.TeamAreaLength = {
      name: "Team area length",
      _val: (50).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "BenchArea",
    };
    this.options.TeamAreaWidth = {
      name: "Team area width",
      val: (15).yard2meter(),
      type: "float",
      prev_sibling: "TeamAreaLength",

    };
    this.options.DashedLength = {
      name: "Dash length",
      val: 0.5,
      type: "float",
      prev_sibling: "TeamAreaWidth",
    };
    this.options.DashedSpace = {
      name: "Dash space",
      val: 0.5,
      type: "float",
      prev_sibling: "DashedLength",
    };
    this.options.PenaltyLength = {
      name: "Penality area length",
      _val: (20).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "DashedSpace",
    };
    this.options.PenaltyWidth = {
      name: "Penality area width",
      val: (6).yard2meter(),
      type: "float",
      prev_sibling: "PenaltyLength",
    };
    this.options.penalityIsolationLineLength = {
      name: "Penality side lines length",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "PenaltyWidth",
    };
    this.options.Table = {
      name: "Table box",
      _val: this_class.options.BenchArea.val,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TableLength.configurable = true;
          this_class.options.TableWidth.configurable = true;
        }
        else {
          this_class.options.TableLength.configurable = false;
          this_class.options.TableWidth.configurable = false;
        }
      },
      prev_sibling: "penalityIsolationLineLength",
    };
    this.options.TableLength = {
      name: "Table length",
      _val: (7).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Table",
    };
    this.options.TableWidth = {
      name: "Table Width",
      _val: (3).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "TableLength",
    };
    this.options.DashedSideLine = {
      configurable: true,
      name: "Dashed side lines",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.DashedDistanceOnTopSide.configurable = true;
          this_class.options.DashedDistanceOnBottomSide.configurable = true;
          this_class.options.ExtraSidelineLength.configurable = true;
        }
        else {
          this_class.options.DashedDistanceOnTopSide.configurable = false;
          this_class.options.DashedDistanceOnBottomSide.configurable = false;
          this_class.options.ExtraSidelineLength.configurable = false;
        }
      },
      prev_sibling: "Full Goal Line",
    };
    this.options.DashedDistanceOnTopSide = {
      name: "Dashed distance - top",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "DashedSideLine",
    };
    this.options.DashedDistanceOnBottomSide = {
      name: "Dashed distance - bottom",
      val: (6).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnTopSide",
    };
    this.options.ExtraSidelineLength = {
      name: "Extra at the dashed ends",
      val: (5).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnBottomSide",
    };
    this.options.BenchDistanceFromCoachArea = {
      configurable: false,
      name: "Bench to coach area",
      val: (2.5).yard2meter(),
      type: "float",
    };
  }

  createDashedLine(start, end) {
    let task = new LineTask(this.tasks.length, [start, end], false, true);
    task.task_options.push(new FloatRobotAction("dashed_offset", 0.1));
    task.task_options.push(new FloatRobotAction("dashed_length", this.options.DashedLength.val));
    task.task_options.push(new FloatRobotAction("dashed_space", this.options.DashedSpace.val));
    if (task.id > 0) {
      this.tasks[task.id - 2].task_options.push(new BoolRobotAction("task_merge_next", false));
    }

    return task;
  }

  drawDashedLinesOnCoachSide(c1, c4) {
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let coachCenter = new Line(c1, c4).middle;

    // Dashed lines from coach area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(this.options.TeamAreaLength.val / 2));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(this.options.TeamAreaLength.val / 2));


    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));

    // Start and end points of dashed lines on the side of field as bench
    let dashedC1 = c1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC4 = c4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    // Drawing the dashed lines
    this.tasks.push(this.createDashedLine(dashedC1, teamArea10FeetC1));
    this.tasks.push(this.createDashedLine(teamArea10FeetC4, dashedC4));
  }

  drawBench(c1, c4, horizontal) {

    if (!this.options.BenchArea.val) {
      return;
    }

    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let benchCenter = new Line(c1, c4).middle;

    // Team Area
    let teamAreaOnLineC1 = benchCenter.subtract(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaOnLineC4 = benchCenter.add(horizontal.multiply(0.5 * (this.options.TeamAreaLength.val + lineWidth)));
    let teamAreaWidthC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaWidthC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));

    // Penality area
    let penalityOnLineC1 = benchCenter.subtract(horizontal.multiply(0.5 * (this.options.PenaltyLength.val + lineWidth)));
    let penalityOnLineC4 = benchCenter.add(horizontal.multiply(0.5 * (this.options.PenaltyLength.val + lineWidth)));
    let penalityWidthC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.PenaltyWidth.val));
    let penalityWidthC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.PenaltyWidth.val));

    let penalityIsolationLineC1 = penalityOnLineC1.add(vertical.multiply(this.options.penalityIsolationLineLength.val));
    let penalityIsolationLineC4 = penalityOnLineC4.add(vertical.multiply(this.options.penalityIsolationLineLength.val));

    // Table box
    let tableStartC1 = benchCenter.add(vertical.multiply(this.options.PenaltyWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableStartC4 = benchCenter.add(vertical.multiply(this.options.PenaltyWidth.val)).add(horizontal.multiply(0.5 * this.options.TableLength.val - 0.5 * lineWidth));
    let tableEndC1 = tableStartC1.add(vertical.multiply(this.options.TableWidth.val));
    let tableEndC4 = tableStartC4.add(vertical.multiply(this.options.TableWidth.val));

    this.start_locations.push(new StartLocation(teamAreaOnLineC4, this.tasks.length));
    // Team area
    this.tasks.push(this.createDashedLine(teamAreaOnLineC4, teamAreaWidthC4));
    this.tasks.push(this.createDashedLine(teamAreaWidthC4, teamAreaWidthC1));
    this.tasks.push(this.createDashedLine(teamAreaWidthC1, teamAreaOnLineC1));

    this.tasks.push(this.createDashedLine(penalityOnLineC1, penalityIsolationLineC1));
    if (this.options.Table.val) {
      this.tasks.push(new LineTask(this.tasks.length, [tableEndC1, tableEndC4], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableEndC1, tableStartC1], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [tableStartC4, tableEndC4], false, true));
    }

    this.tasks.push(this.createDashedLine(penalityIsolationLineC4, penalityOnLineC4));

    if (this.options.Table.val) {
      this.tasks.push(this.createDashedLine(penalityWidthC4, tableStartC4));
      this.tasks.push(new LineTask(this.tasks.length, [tableStartC4, tableStartC1], false, true));
      this.tasks.push(this.createDashedLine(tableStartC1, penalityWidthC1));
    }
    else {
      this.tasks.push(this.createDashedLine(penalityWidthC4, penalityWidthC1));
    }
  }

  createVerticalMidleLines(c1, c2, c3, c4, angle) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;

    let middleRightTop = c1.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleRightBottom = c2.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleLeftTop = c4.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleLeftBottom = c3.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));

    this.tasks.push(new LineTask(this.tasks.length, [middleRightBottom, middleRightTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [horizontalMiddleTop, horizontalMiddleBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [middleLeftBottom, middleLeftTop], false, true));
  }

  chooseGoalType(c1, c2, c3, c4, angle, drawingSide) {
    let horizontal = angle.rotate_90_cw();
    let verticalCenter;
    let goalCenter;

    let kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
    if (drawingSide === 1) {
      verticalCenter = new Line(c1, c2).middle;
      goalCenter = verticalCenter.add(horizontal.multiply(this.options["Goal Distance"].val));
    }
    else {
      verticalCenter = new Line(c4, c3).middle;
      kateteA = this.options.TriangleSideLength.val * Math.cos((45 * (Math.PI / 180)));
      goalCenter = verticalCenter.subtract(horizontal.multiply(- this.options["Goal Distance"].val));
    }

    // Defining goal points
    let goalStart = goalCenter.add(angle.multiply(this.options["Goal Radius"].val));
    let goalEnd = goalCenter.subtract(angle.multiply(this.options["Goal Radius"].val));
    let ends = [goalStart, goalEnd];

    let goalLineStart = goalCenter.add(angle.multiply(0.5 * this.options.GoalLineLength.val));
    let goalLineEnd = goalCenter.subtract(angle.multiply(0.5 * this.options.GoalLineLength.val));
    let goalMouthRadius = goalCenter.subtract(horizontal.multiply(0.5 * this.options.GoalLineLength.val));

    // Triangle inside goal Circle
    let cornerBottom = goalCenter.add(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerTop = goalCenter.subtract(angle.multiply(this.options.TriangleSideLength.val / 2));
    let cornerMiddleRight = goalCenter.add(horizontal.multiply(-kateteA));

    // Drawing goals
    if (this.options["Draw Goals"].val) {
      this.tasks.push(new ArcTask(this.tasks.length, ends, goalCenter, false, false, true));

      if (this.options["Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
      else if (this.options["Full Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalStart, goalEnd], false, true));
      else if (this.options["Goal Mouth"].val) {
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
        if (drawingSide === 1)
          this.tasks.push(new ArcTask(this.tasks.length, [goalLineStart, goalMouthRadius, goalLineEnd], goalCenter, true, false, true));
        else
          this.tasks.push(new ArcTask(this.tasks.length, [goalLineEnd, goalMouthRadius, goalLineStart], goalCenter, false, false, true));
      }
      else if (this.options.GoalTraingle.val) {
        this.tasks.push(new LineTask(this.tasks.length, [cornerBottom, cornerTop], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerTop, cornerMiddleRight], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [cornerMiddleRight, cornerBottom], false, true));
      }
      else {
        return;
      }
    }
  }

  drawGoal(c1, c2, c3, c4, drawingSide) {
    let g1 = new Line(c1, c2).unit_vector; //1.00m guideline
    let g2 = g1.rotate_90_cw();

    let middle = new Line(c1, c2).middle;
    if (drawingSide === 2) {
      g2 = g2.multiply(-1);
      g1 = g1.multiply(-1);
      middle = new Line(c3, c4).middle;
    }

    if (!this.options.GoalArcs.val) {
      this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);
      return;
    }

    let goalc = middle.add(g2.multiply(this.options["Goal Distance"].val));
    let goal_circle_radius = this.options["Goal Radius"].val - this.options.LineWidth.val / 2;
    let small_arc_radius = (34).foot2meter() + (10).inch2meter() - this.options.LineWidth.val / 2;
    let big_arc_radius = (47).foot2meter() + (9).inch2meter() - this.options.LineWidth.val / 2;

    // big circle
    let big_arc_start = goalc.add(g1.multiply(-big_arc_radius));
    let big_arc_middle = goalc.add(g2.multiply(big_arc_radius));
    let big_arc_end = goalc.add(g1.multiply(big_arc_radius));

    this.tasks.push(new ArcTask(this.tasks.length, [big_arc_start, big_arc_middle, big_arc_end], goalc, false, false, true));

    let distance_to_dots = (5).yard2meter() + this.options.LineWidth.val / 2;
    // Goal circle
    let guide1 = goalc.subtract(g1.multiply(-goal_circle_radius));
    let guide2 = goalc.subtract(g1.multiply(goal_circle_radius));

    // Small circle
    let back_of_goal_circle = goalc.subtract(g2.multiply(this.options["Goal Radius"].val));
    let AB_guide2 = new Line(back_of_goal_circle, guide2);
    let small_arc_start = AB_guide2.crosses_with_circle(goalc, small_arc_radius)[1];
    let small_arc_middle = goalc.add(g2.multiply(small_arc_radius));
    let AB_guide1 = new Line(back_of_goal_circle, guide1);
    let small_arc_end = AB_guide1.crosses_with_circle(goalc, small_arc_radius)[1];

    // small circle hash marks
    let middle_has_guide = new Line(goalc, goalc.add(g2)).unit_vector;
    let goal_hash_radians_between = 4 / small_arc_radius;
    let goal_hash = [];

    goal_hash.push(new Line(goalc.add(g1.multiply(small_arc_radius)), goalc.add(g1.multiply(small_arc_radius)).add(g2.multiply(this.options.HashLength.val))));
    for (let i = -3; i <= 3; i++) {
      let hash_guide = middle_has_guide.rotate(-i * goal_hash_radians_between);
      goal_hash.push(new Line(goalc.add(hash_guide.multiply(small_arc_radius - this.options.HashLength.val / 2)), goalc.add(hash_guide.multiply(small_arc_radius + this.options.HashLength.val / 2))));
    }


    goal_hash.push(new Line(goalc.add(g1.multiply(-small_arc_radius)).add(g2.multiply(this.options.HashLength.val)), goalc.add(g1.multiply(-small_arc_radius))));
    let dot1_behind_goal = goal_hash[0].start.add(g2.multiply(-distance_to_dots));
    let dot2_behind_goal = goal_hash.last().end.add(g2.multiply(-distance_to_dots));
    let kick_guide1 = dot1_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide2 = dot1_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));
    let kick_guide3 = dot2_behind_goal.add(g1.multiply(-this.options.DotBehindGoalRadius.val));
    let kick_guide4 = dot2_behind_goal.add(g1.multiply(this.options.DotBehindGoalRadius.val));

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot1_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide2, kick_guide1], dot1_behind_goal, false, false, true));
    }

    let reverse = false;
    goal_hash.forEach((hash_mark) => {
      this.tasks.push(hash_mark.toLineTask(this.tasks.length, false, true));
      reverse = !reverse;
    });

    if (this.options.DotBehindGoal.val) {
      this.tasks.push(new WaypointTask(this.tasks.length, dot2_behind_goal, false, true));
    }
    else {
      this.tasks.push(new ArcTask(this.tasks.length + 1, [kick_guide4, kick_guide3], dot2_behind_goal, false, false, true));
    }

    this.tasks.push(new LineTask(this.tasks.length, [guide2, small_arc_start], false, true));
    this.tasks.push(new ArcTask(this.tasks.length, [small_arc_start, small_arc_middle, small_arc_end], goalc, false, false, true));
    this.tasks.push(new LineTask(this.tasks.length, [small_arc_end, guide1], false, true));

    // Goal and inside goal circles
    this.chooseGoalType(c1, c2, c3, c4, g1, drawingSide);

    // Back line
    this.tasks.push(new LineTask(this.tasks.length, [big_arc_start, guide2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [guide1, big_arc_end], false, true));

  }

  drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;
    const fieldCenter = new Line(horizontalMiddleBottom, horizontalMiddleTop).middle;

    let defensive10yardVerticalTop;
    let defensive10yardVerticalBottom;
    let defensive10yardEndTop;
    let defensive10yardEndBottom;

    // Center wings
    const wingTopRight = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingTopLeft = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomRight = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomLeft = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));

    // Circle in the center of field defination
    const centerCircleEnd = fieldCenter.subtract(horizontal.multiply(this.options.CenterCircleRadius.val));
    const centerCircleStart = fieldCenter.subtract(horizontal.multiply(- this.options.CenterCircleRadius.val));

    // Center cross
    const pointRightTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointRightBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));

    if (drawingSide === 1) {
      defensive10yardVerticalTop = c1.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c2.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c1.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c2.add(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }
    else {
      defensive10yardVerticalTop = c4.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c3.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c4.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c3.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }

    // Drawing defensice sides
    if (drawingSide === 2) {
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalBottom, defensive10yardEndBottom], false, true));

      if (this.options.CenterWings.val) {
        this.tasks.push(new LineTask(this.tasks.length, [wingBottomLeft, wingBottomRight], false, true));
      }

      if (this.options.CenterCross.val) {  // The cross lines inside the center circle
        this.tasks.push(new LineTask(this.tasks.length, [pointRightTop, pointLeftBottom], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [pointRightBottom, pointLeftTop], false, true));
      }
      if (this.options["Center Circle"].val) {
        this.tasks.push(new ArcTask(this.tasks.length, [centerCircleStart, centerCircleEnd], fieldCenter, false, false, true));
      }

      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, drawingSide);
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalTop, defensive10yardEndTop], false, true));
      if (this.options.CenterWings.val) {
        this.tasks.push(new LineTask(this.tasks.length, [wingTopLeft, wingTopRight], false, true));
      }
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardEndTop, defensive10yardVerticalTop], false, true));

      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, drawingSide);
      }
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalBottom, defensive10yardEndBottom], false, true));
    }
  }

  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    let angle = new Line(c1, c2).unit_vector;
    let horizontal = angle.rotate_90_cw();
    let drawingSide;

    // Points defination of dashed lines on the bottom side
    let dashedC2 = c2.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC3 = c3.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    this.start_locations.push(new StartLocation(dashedC2, this.tasks.length));
    if (this.options.DashedSideLine.val) {
      this.tasks.push(this.createDashedLine(dashedC2, dashedC3));
    }

    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));

    drawingSide = "left";
    this.drawDefensiveLines(c1, c2, c3, c4, angle, 2);

    drawingSide = "right";
    this.drawDefensiveLines(c1, c2, c3, c4, angle, 1);

    this.createVerticalMidleLines(c1, c2, c3, c4, angle);

    this.drawBench(c1, c4, horizontal);

    // Drawing dashed side line
    if (this.options.DashedSideLine.val) {
      this.drawDashedLinesOnCoachSide(c1, c4);
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}

class CustomLacrosseMen extends square_pitch {
  static template_type = "Lacrosse"; // Translateable
  static template_title = "Custom men"; // Translateable
  static template_id = "custom_lacrosse_men_dev"; // no spaces
  static template_image = "img/templates/us_lacross_men_black.png"; // no spaces

  constructor(id, name, layout_method) {
    super(id, name, layout_method);
    this.options["Right goal pole"].configurable = false;
    this.options["Left goal pole"].configurable = false;
    let this_class = this;

    this.options.Length.val = (110).yard2meter();
    this.options.Width.val = (60).yard2meter();

    this.options["Defensive Sides Area"] = {
      configurable: true,
      name: "Defensive width from end line",
      _val: (35).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
    };
    this.options.defensive10yard = {
      configurable: true,
      name: "Defensive sides area",
      _val: (10).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Defensive Sides Area",
    };
    this.options["Draw Goals"] = {
      configurable: true,
      name: "Draw goals",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].configurable = true;
          this_class.options["Goal Line"].val = true;
          this_class.options["Full Goal Line"].configurable = true;
          this_class.options["Goal Radius"].configurable = true;
          this_class.options["Goal Distance"].configurable = true;
        }
        else {
          this_class.options["Goal Line"].configurable = false;
          this_class.options["Goal Line"].val = false;
          this_class.options["Full Goal Line"].configurable = false;
          this_class.options["Goal Radius"].configurable = false;
          this_class.options["Goal Distance"].configurable = false;
        }
      },
      prev_sibling: "defensive10yard",
    };
    this.options["Goal Radius"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal Radius",
      _val: (9).foot2meter(),
      type: "float",
      "dontsave": true,
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

      },
      prev_sibling: "Draw Goals"
    };

    this.options["Goal Line"] = {
      configurable: true,
      name: "Goal line",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Full Goal Line"].val = false;
          this_class.options["Goal Line Length"].configurable = true;
        }
        else {
          this_class.options["Goal Line Length"].configurable = false;
        }
      },
      prev_sibling: "Goal Radius",
    };
    this.options["Goal Line Length"] = {
      name: "Goal line length",
      _val: (6).foot2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Goal Line",
    };
    this.options["Full Goal Line"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Full goal line",
      _val: false,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Goal Line"].val = false;
        }
      },
      prev_sibling: "Goal Line Length",
    };
    this.options["Goal Distance"] = {
      configurable: this_class.options["Draw Goals"].val,
      name: "Goal center to end line",
      _val: (15).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Full Goal Line",
    };
    this.options["Center Circle"] = {
      configurable: true,
      name: "Center Circle",
      _val: true,
      type: "bool",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCircleRadius.configurable = true;
        }
        else {
          this_class.options.CenterCircleRadius.configurable = false;
        }
      },
      prev_sibling: "Goal Distance",
    };
    this.options.CenterCircleRadius = {
      configurable: this_class.options["Center Circle"].val,
      name: "Circle Radius",
      _val: (30).foot2meter(),
      type: "float",
      get val() { return this._val; },
      set val(v) {
        this._val = v;
      },
      "dontsave": true,
      prev_sibling: "Center Circle",
    };
    this.options.CenterCross = {
      configurable: true,
      name: "Center Cross",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterCrossLength.configurable = true;
        }
        else {
          this_class.options.CenterCrossLength.configurable = false;
        }
      },
      prev_sibling: "CenterCircleRadius"
    };
    this.options.CenterCrossLength = {
      configurable: this_class.options.CenterCross.val,
      name: "Center cross line length",
      val: 0.5,
      type: "float",
      prev_sibling: "CenterCross",
    };
    this.options.CenterWings = {
      configurable: true,
      name: "Center wings",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.CenterWingsLength.configurable = true;
        }
        else {
          this_class.options.CenterWingsLength.configurable = false;
        }
      },
      prev_sibling: "CenterCrossLength",

    };
    this.options.CenterWingsLength = {
      configurable: this_class.options.CenterWings.val,
      name: "Center wings length",
      _val: (20).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "CenterWings",
    };
    this.options["Side Bench"] = {
      configurable: true,
      name: "Bench area",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options["Bench Boxes"].configurable = true;
          this_class.options["Bench Boxes"].val = true;
          this_class.options["Timer Box"].configurable = true;
          this_class.options["Timer Box"].val = true;
          this_class.options.SubstitutionLength.configurable = true;
          this_class.options.CoachBenchLength.configurable = true;
        }
        else {
          this_class.options["Bench Boxes"].configurable = false;
          this_class.options["Bench Boxes"].val = false;
          this_class.options["Timer Box"].configurable = false;
          this_class.options["Timer Box"].val = false;
          this_class.options.SubstitutionLength.configurable = false;
          this_class.options.CoachBenchLength.configurable = false;
        }
      },

      prev_sibling: "CenterWingsLength",
    };
    this.options.CoeachAreaDashedLength = {
      configurable: false,
      name: "The length of dashed coaches area ",
      val: (50).yard2meter(),
      type: "float"
    };
    this.options.TeamAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (15).yard2meter(),
      type: "float",
    };
    this.options.TeamAreaLength = {
      configurable: false,
      name: "Coach area width",
      val: this.options.CoeachAreaDashedLength.val,
      type: "float",
    };
    this.options.SubstitutionLength = {
      configurable: false,
      name: "Substitution length",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "Side Bench"
    };
    this.options.SubstitutionWidth = {
      configurable: false,
      name: "Substitution area - width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.CoachBenchLength = {
      configurable: false,
      name: "Coaches area length",
      val: (20).yard2meter(),
      type: "float",
      prev_sibling: "SubstitutionLength",
    };
    this.options.CoachAreaWidth = {
      configurable: false,
      name: "Coach area width",
      val: (6).yard2meter(),
      type: "float",
    };
    this.options.BehindCoachWidth = {
      configurable: false,
      name: "The area behind the substitution",
      val: (10).yard2meter(),
      type: "float",
    };
    this.options["Bench Boxes"] = {
      configurable: true,
      name: "Bench boxes",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.BenchDistanceFromCoachArea.configurable = true;
          this_class.options["Bench Box Length"].configurable = true;
          this_class.options["Bench Box Width"].configurable = true;
        }
        else {
          this_class.options.BenchDistanceFromCoachArea.configurable = false;
          this_class.options["Bench Box Length"].configurable = false;
          this_class.options["Bench Box Width"].configurable = false;
        }
      },
      prev_sibling: "CoachBenchLength",
    };
    this.options["Bench Box Length"] = {
      configurable: this_class.options["Bench Boxes"].val,
      name: "Bench box length",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "Bench Boxes",
    };
    this.options["Bench Box Width"] = {
      configurable: this_class.options["Bench Boxes"].val,
      name: "Bench box width",
      val: (3).yard2meter(),
      type: "float",
      prev_sibling: "Bench Box Length",
    };
    this.options.BenchDistanceFromCoachArea = {
      configurable: this_class.options["Bench Boxes"].val,
      name: "Distance from benchs to coach area",
      val: (2.5).yard2meter(),
      type: "float",
      prev_sibling: "Bench Box Width",
    };
    this.options["Timer Box"] = {
      configurable: true,
      name: "Timer box",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
        if (v) {
          this_class.options.TimerLength.configurable = true;
          this_class.options.TimerWidth.configurable = true;
          this_class.options.TimerDistanceFromSideLine.configurable = true;
        }
        else {
          this_class.options.TimerLength.configurable = false;
          this_class.options.TimerWidth.configurable = false;
          this_class.options.TimerDistanceFromSideLine.configurable = false;
        }
      },
      prev_sibling: "BenchDistanceFromCoachArea",
    };
    this.options.TimerLength = {
      configurable: this_class.options["Timer Box"].val,
      name: "Timer Length",
      _val: (8).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "Timer Box",
    };
    this.options.TimerWidth = {
      configurable: this_class.options["Timer Box"].val,
      name: "Timer width",
      _val: (2).yard2meter(),
      type: "float",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;
      },
      prev_sibling: "TimerLength",
    };
    this.options.TimerDistanceFromSideLine = {
      configurable: this_class.options["Timer Box"].val,
      name: "Timer distance to the field",
      val: (7).yard2meter(),
      type: "float",
      prev_sibling: "TimerWidth",
    };

    this.options.DashedSideLine = {
      configurable: true,
      name: "Dashed side lines",
      _val: true,
      type: "bool",
      get val() {
        return this._val;
      },
      set val(v) {
        this._val = v;

        if (v) {
          this_class.options.DashedDistanceOnTopSide.configurable = true;
          this_class.options.DashedDistanceOnBottomSide.configurable = true;
          this_class.options.ExtraSidelineLength.configurable = true;
          this_class.options.DashedLength.configurable = true;
          this_class.options.DashedSpace.configurable = true;
        }
        else {
          this_class.options.DashedDistanceOnTopSide.configurable = false;
          this_class.options.DashedDistanceOnBottomSide.configurable = false;
          this_class.options.ExtraSidelineLength.configurable = false;
          this_class.options.DashedLength.configurable = false;
          this_class.options.DashedSpace.configurable = false;
        }
      },
      prev_sibling: "TimerDistanceFromSideLine",
    };
    this.options.DashedDistanceOnTopSide = {
      configurable: this_class.options.DashedSideLine.val,
      name: "Dashed distance - top",
      val: (10).yard2meter(),
      type: "float",
      prev_sibling: "DashedSideLine",
    };
    this.options.DashedDistanceOnBottomSide = {
      configurable: this_class.options.DashedSideLine.val,
      name: "Dashed distance - bottom",
      val: (6).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnTopSide",
    };
    this.options.ExtraSidelineLength = {
      configurable: this_class.options.DashedSideLine.val,
      name: "Extra lines at the dashed ends",
      val: (5).yard2meter(),
      type: "float",
      prev_sibling: "DashedDistanceOnBottomSide",
    };
    this.options.DashedLength = {
      configurable: this_class.options.DashedSideLine.val || this_class.options["Side Bench"].val,
      name: "Dash length",
      val: 0.5,
      type: "float",
      prev_sibling: "BenchDistanceFromCoachArea",
    };
    this.options.DashedSpace = {
      configurable: this_class.options.DashedSideLine.val || this_class.options["Side Bench"].val,
      name: "Dash space",
      val: 0.5,
      type: "float",
      prev_sibling: "DashedLength",
    };
  };

  createDashedLine(start, end) {

    let task = new LineTask(this.tasks.length, [start, end], false, true);
    task.task_options.push(new FloatRobotAction("dashed_offset", 0.1));
    task.task_options.push(new FloatRobotAction("dashed_length", this.options.DashedLength.val));
    task.task_options.push(new FloatRobotAction("dashed_space", this.options.DashedSpace.val));
    if (task.id > 0) {
      this.tasks[task.id - 2].task_options.push(new BoolRobotAction("task_merge_next", false));
    }

    return task;
  }

  drawBenchBox(start, side) {

    let p = this.drawing_points;
    let c1 = p[0];
    let c4 = p[7];
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();

    let rightTop = start.add(vertical.multiply(this.options["Bench Box Width"].val));
    let leftBottom = start.add(horizontal.multiply(this.options["Bench Box Length"].val));
    let leftTop = leftBottom.add(vertical.multiply(this.options["Bench Box Width"].val));

    if (side === "right") {
      leftBottom = start.subtract(horizontal.multiply(this.options["Bench Box Length"].val));
      leftTop = leftBottom.add(vertical.multiply(this.options["Bench Box Width"].val));
    }

    if (side === "right") {
      this.tasks.push(new LineTask(this.tasks.length, [leftBottom, start], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [start, rightTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [rightTop, leftTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [leftTop, leftBottom], false, true));
    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [start, leftBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [leftBottom, leftTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [leftTop, rightTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [rightTop, start], false, true));
    }
  }

  drawDashedLinesOnCoachSide(c1, c4) {
    let horizontal = new Line(c1, c4).unit_vector;
    let vertical = horizontal.rotate_90_cw();
    let coachCenter = new Line(c1, c4).middle;

    // Dashed lines from coach area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(this.options.TeamAreaLength.val / 2));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(this.options.TeamAreaLength.val / 2));

    let teamAreaBehindC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.TeamAreaWidth.val));
    let teamAreaBehindC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.TeamAreaWidth.val));

    let teamArea10FeetC1 = teamAreaOnLineC1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));
    let teamArea10FeetC4 = teamAreaOnLineC4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val));

    // Start and end points of dashed lines on the side of field as bench
    let dashedC1 = c1.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC4 = c4.add(vertical.multiply(this.options.DashedDistanceOnTopSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    // Drawing the dashed lines
    this.tasks.push(this.createDashedLine(dashedC4, teamArea10FeetC4));
    this.tasks.push(this.createDashedLine(teamArea10FeetC4, teamAreaBehindC4));
    this.tasks.push(this.createDashedLine(teamAreaBehindC4, teamAreaBehindC1));
    this.tasks.push(this.createDashedLine(teamAreaBehindC1, teamArea10FeetC1));
    this.tasks.push(this.createDashedLine(teamArea10FeetC1, dashedC1));

  }

  drawBench(c1, c4, horizontal) {
    if (!this.options["Side Bench"].val) // If side bench is false, don't paint it
    {
      return;
    }

    let vertical = horizontal.rotate_90_cw();
    let lineWidth = this.options.LineWidth.val;
    let coachCenter = new Line(c1, c4).middle;

    // Substitution Area
    let substitionOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.SubstitutionLength.val));
    let substitionWidthC1 = substitionOnLineC1.add(vertical.multiply(this.options.SubstitutionWidth.val));
    let substitionWidthC4 = substitionOnLineC4.add(vertical.multiply(this.options.SubstitutionWidth.val));


    // Coach Area
    let coachOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.CoachBenchLength.val));
    let coachWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.CoachAreaWidth.val));
    let coachWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.CoachAreaWidth.val));

    let coachBehindWidthC1 = coachOnLineC1.add(vertical.multiply(this.options.BehindCoachWidth.val));
    let coachBehindWidthC4 = coachOnLineC4.add(vertical.multiply(this.options.BehindCoachWidth.val));

    let coachDashedWidthC1 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));
    let coachDashedWidthC4 = coachCenter.add(vertical.multiply(this.options.CoachAreaWidth.val)).add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val));

    // Team Area
    let teamAreaOnLineC1 = coachCenter.subtract(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));
    let teamAreaOnLineC4 = coachCenter.add(horizontal.multiply(0.5 * this.options.TeamAreaLength.val - 0.5 * lineWidth));

    // Timer box
    let timerRightBottom = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).subtract(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerLeftBottom = coachCenter.add(vertical.multiply(this.options.TimerDistanceFromSideLine.val)).add(horizontal.multiply(0.5 * this.options.TimerLength.val - 0.5 * lineWidth));
    let timerRightTop = timerRightBottom.add(vertical.multiply(this.options.TimerWidth.val));
    let timerLeftTop = timerLeftBottom.add(vertical.multiply(this.options.TimerWidth.val));

    // Benchs start points
    let benchStartLeft = coachBehindWidthC4.add(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));
    let benchStartRight = coachBehindWidthC1.subtract(horizontal.multiply(this.options.BenchDistanceFromCoachArea.val));

    // Drawing Substitution
    this.tasks.push(new LineTask(this.tasks.length, [substitionOnLineC4, substitionWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [substitionWidthC1, substitionOnLineC1], false, true));

    // Drawing coach area
    this.tasks.push(new LineTask(this.tasks.length, [coachOnLineC1, coachBehindWidthC1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC1, coachBehindWidthC4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [coachBehindWidthC4, coachOnLineC4], false, true));

    // Drawing Team Area - Dashed lines
    this.tasks.push(this.createDashedLine(teamAreaOnLineC4, coachDashedWidthC4));
    this.tasks.push(this.createDashedLine(coachDashedWidthC4, coachWidthC4));
    this.tasks.push(new LineTask(this.tasks.length, [coachWidthC4, coachWidthC1], false, true));
    this.tasks.push(this.createDashedLine(coachWidthC1, coachDashedWidthC1));
    this.tasks.push(this.createDashedLine(coachDashedWidthC1, teamAreaOnLineC1));

    if (this.options["Bench Boxes"].val) {
      this.drawBenchBox(benchStartRight, "right");
    }

    // Drawing Timer box
    if (this.options["Timer Box"].val) {
      this.tasks.push(new LineTask(this.tasks.length, [timerRightBottom, timerLeftBottom], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerLeftBottom, timerLeftTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerLeftTop, timerRightTop], false, true));
      this.tasks.push(new LineTask(this.tasks.length, [timerRightTop, timerRightBottom], false, true));
    }
    if (this.options["Bench Boxes"].val) {
      this.drawBenchBox(benchStartLeft, "left");
    }
  }

  drawGoal(c1, c2, c3, c4, angle, drawingSide) {
    let horizontal = angle.rotate_90_cw();
    let verticalCenter;
    let goalCenter;

    if (drawingSide === "right") {
      verticalCenter = new Line(c1, c2).middle;
      goalCenter = verticalCenter.add(horizontal.multiply(this.options["Goal Distance"].val));
    }
    else {
      verticalCenter = new Line(c4, c3).middle;
      goalCenter = verticalCenter.subtract(horizontal.multiply(this.options["Goal Distance"].val));
    }

    // Defining goal points
    let goalEnd = goalCenter.subtract(angle.multiply(this.options["Goal Radius"].val));
    let goalStart = goalCenter.add(angle.multiply(this.options["Goal Radius"].val));
    let ends = [goalStart, goalEnd];

    let goalLineStart = goalCenter.add(angle.multiply(0.5 * this.options["Goal Line Length"].val));
    let goalLineEnd = goalCenter.subtract(angle.multiply(0.5 * this.options["Goal Line Length"].val));

    // Drawing goals
    if (this.options["Draw Goals"].val) {
      this.tasks.push(new ArcTask(this.tasks.length, ends, goalCenter, true, false, true));

      if (this.options["Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalLineStart, goalLineEnd], false, true));
      else if (this.options["Full Goal Line"].val)
        this.tasks.push(new LineTask(this.tasks.length, [goalStart, goalEnd], false, true));
      else {
        return;
      }
    }
  }

  drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;
    const fieldCenter = new Line(horizontalMiddleBottom, horizontalMiddleTop).middle;

    let defensive10yardVerticalTop;
    let defensive10yardVerticalBottom;
    let defensive10yardHorizontalTop;
    let defensive10yardHorizontalBottom;
    let defensive10yardEndTop;
    let defensive10yardEndBottom;

    // Center wings
    const wingTopRight = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingTopLeft = horizontalMiddleTop.add(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomRight = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).subtract(horizontal.multiply(this.options.CenterWingsLength.val / 2));
    const wingBottomLeft = horizontalMiddleBottom.subtract(angle.multiply(this.options.defensive10yard.val)).add(horizontal.multiply(this.options.CenterWingsLength.val / 2));

    // Circle in the center of field defination
    const centerCircleEnd = fieldCenter.subtract(horizontal.multiply(this.options.CenterCircleRadius.val));
    const centerCircleStart = fieldCenter.subtract(horizontal.multiply(- this.options.CenterCircleRadius.val));

    // Center cross
    const pointRightTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointRightBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).subtract(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftBottom = fieldCenter.add(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));
    const pointLeftTop = fieldCenter.subtract(angle.multiply(0.5 * this.options.CenterCrossLength.val)).add(horizontal.multiply(0.5 * this.options.CenterCrossLength.val));

    if (drawingSide === "right") {
      defensive10yardVerticalTop = c1.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c2.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c1.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c2.add(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }
    else {
      defensive10yardVerticalTop = c4.add(angle.multiply(this.options.defensive10yard.val));
      defensive10yardVerticalBottom = c3.subtract(angle.multiply(this.options.defensive10yard.val));
      defensive10yardHorizontalTop = c4.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardHorizontalBottom = c3.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));

      defensive10yardEndTop = defensive10yardVerticalTop.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
      defensive10yardEndBottom = defensive10yardVerticalBottom.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
    }

    // Drawing defensice sides
    if (drawingSide === "right") {

      if (this.options.CenterWings.val) {
        this.tasks.push(new LineTask(this.tasks.length, [wingTopLeft, wingTopRight], false, true));
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardEndTop, defensive10yardVerticalTop], false, true));

      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, angle, drawingSide);
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalBottom, defensive10yardEndBottom], false, true));

    }
    else {
      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalBottom, defensive10yardEndBottom], false, true));

      if (this.options.CenterWings.val) {
        this.tasks.push(new LineTask(this.tasks.length, [wingBottomLeft, wingBottomRight], false, true));
      }
      if (this.options.CenterCross.val) {  // The cross lines inside the center circle
        this.tasks.push(new LineTask(this.tasks.length, [pointRightTop, pointLeftBottom], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [pointRightBottom, pointLeftTop], false, true));
      }
      if (this.options["Center Circle"].val) {
        this.tasks.push(new ArcTask(this.tasks.length, [centerCircleStart, centerCircleEnd], fieldCenter, true, false, true));
      }
      if (this.options["Draw Goals"].val) {
        this.drawGoal(c1, c2, c3, c4, angle, drawingSide);
      }

      this.tasks.push(new LineTask(this.tasks.length, [defensive10yardVerticalTop, defensive10yardEndTop], false, true));
    }
  }

  createVerticalMidleLines(c1, c2, c3, c4, angle) {
    const horizontal = angle.rotate_90_cw();
    const horizontalMiddleTop = new Line(c1, c4).middle;
    const horizontalMiddleBottom = new Line(c2, c3).middle;

    let middleRightTop = c1.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleRightBottom = c2.add(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleLeftTop = c4.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));
    let middleLeftBottom = c3.subtract(horizontal.multiply(this.options["Defensive Sides Area"].val));

    this.tasks.push(new LineTask(this.tasks.length, [middleRightBottom, middleRightTop], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [horizontalMiddleTop, horizontalMiddleBottom], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [middleLeftBottom, middleLeftTop], false, true));
  }

  draw() {
    this.tasks = [];
    this.start_locations = [];
    delete this.calculated_drawing_points;

    let p = this.drawing_points;
    let c1 = p[0];
    let c2 = p[3];
    let c3 = p[4];
    let c4 = p[7];

    let angle = new Line(c1, c2).unit_vector;
    let horizontal = angle.rotate_90_cw();
    let drawingSide;

    // Points defination of dashed lines on the bottom side
    let dashedC2 = c2.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).subtract(horizontal.multiply(this.options.ExtraSidelineLength.val));
    let dashedC3 = c3.add(angle.multiply(this.options.DashedDistanceOnBottomSide.val)).add(horizontal.multiply(this.options.ExtraSidelineLength.val));

    this.start_locations.push(new StartLocation(dashedC2, this.tasks.length));
    if (this.options.DashedSideLine.val) {
      this.tasks.push(this.createDashedLine(dashedC2, dashedC3));
    }

    this.tasks.push(new LineTask(this.tasks.length, [c3, c4], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c1, c2], false, true));
    this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));

    drawingSide = "left";
    this.drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide);

    drawingSide = "right";
    this.drawDefensiveLines(c1, c2, c3, c4, angle, drawingSide);

    this.createVerticalMidleLines(c1, c2, c3, c4, angle);

    this.drawBench(c1, c4, horizontal);

    // Dashed lines on top side
    if (this.options.DashedSideLine.val) {
      this.drawDashedLinesOnCoachSide(c1, c4);
    }

    this.refresh_bb();
    this.refresh_handles();
    this.refresh_test_run();
    this.refresh_snapping_lines();
  }
}