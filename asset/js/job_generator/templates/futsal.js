


class Futsal extends square_pitch 
{
    static template_title = "Futsal";
    static template_type = "Soccer"
    static template_id = "futsal_beta";
    static template_image = "img/templates/futsal.png";
    constructor(id, name, layout_method) 
    {
        super(id, name, layout_method);
        this.options.Length.val = 40;
        this.options.Width.val = 20;
        this.options.GoalWidth.val = 3;
        this.options.LineWidth.val = 0.08;
        this.options["Left goal pole"].configurable = false;
        this.options["Right goal pole"].configurable = false;

        this.options["Sublines"] = {
            configurable: true,
            name: "Substitution area lines",
            val: true,
            type: "bool"
        }
    }

    static get layout_methods() {
        return {
            "corner,side": 2,
            "two_corners": 2,
            "two_corners,side": 3,
            "all_corners": 4,
            "free_hand": 0
        };
    }

    draw() 
    {
        delete this.calculated_drawing_points;
        this.tasks = [];
        this.start_locations = [];

        var p = this.drawing_points;
        //corners
        var c1 = p[0];
        var c2 = p[3];
        var c3 = p[4];
        var c4 = p[7];

        //goal posts
        var c5 = p[1];
        var c6 = p[2];
        var c7 = p[5];
        var c8 = p[6];

        //Guidelines that help define points  
        var g1 = new Line(c5, c1).unit_vector;
        var g2 = new Line(c6, c2).unit_vector;
        var g3 = new Line(c7, c3).unit_vector;
        var g4 = new Line(c8, c4).unit_vector;

            var n3 = 3;
            var n5 = 5;
            var n6 = 6;
            var n10 = 10;
        



        //Penaltyfield
        //Definition of the points an arc will be drawn between
        //arc 1
        var arc1p1 = c5.add(g1.multiply(n6));
        var arc1p2 = c5.add(g1.multiply(n6).rotate_90_ccw());
        var arc1Top = c5.add(new Line(c5, new Line(arc1p1, arc1p2).middle).unit_vector.multiply(n6));

        //arc 2
        var arc2p1 = c6.add(g2.multiply(n6));
        var arc2p2 = c6.add(g2.multiply(n6).rotate_90_cw());
        var arc2Top = c6.add(new Line(c6, new Line(arc2p1, arc2p2).middle).unit_vector.multiply(n6));

        //arc 3
        var arc3p1 = c7.add(g3.multiply(n6));
        var arc3p2 = c7.add(g3.multiply(n6).rotate_90_ccw());
        var arc3Top = c7.add(new Line(c7, new Line(arc3p1, arc3p2).middle).unit_vector.multiply(n6));

        //arc 4
        var arc4p1 = c8.add(g4.multiply(n6));
        var arc4p2 = c8.add(g4.multiply(n6).rotate_90_cw());
        var arc4Top = c8.add(new Line(c8, new Line(arc4p1, arc4p2).middle).unit_vector.multiply(n6));

        //Penalty line Kickpoint
        let kickPointCenter1 = new Line(arc1p2, arc2p2).middle;
        let kickPointCenter2 = new Line(arc3p2, arc4p2).middle;
        let midOfEndline = new Line(c1, c2).middle;
        let g14 = new Line(kickPointCenter1, midOfEndline).unit_vector;
        let kickPoint1_g1 = kickPointCenter1.add(g14.multiply(0.05).rotate_90_cw());
        let kickPoint1_g2 = kickPointCenter1.add(g14.multiply(0.05).rotate_90_ccw());
        let kickPoint2_g1 = kickPointCenter2.add(g14.multiply(0.05).rotate_90_cw());
        let kickPoint2_g2 = kickPointCenter2.add(g14.multiply(0.05).rotate_90_ccw());

        //Definition of middle field points
        var middleOfGoal1 = new Line(c5, c6).middle;
        var middleOfGoal2 = new Line(c7, c8).middle;
        var g5 = new Line(middleOfGoal1, middleOfGoal2);
        var mp = g5.middle;
        var g6 = new Line(middleOfGoal2, middleOfGoal1).unit_vector;
        var g9 = new Line(middleOfGoal1, middleOfGoal2).unit_vector;
        let g10 = new Line(mp, midOfEndline).unit_vector;
        let mp_g1 = mp.add(g10.multiply(0.05).rotate_90_cw());
        let mp_g2 = mp.add(g10.multiply(0.05).rotate_90_ccw());

        //right side of the field
        var mp1 = middleOfGoal1.add(g9.multiply(n10));
        var g7 = new Line(mp1, mp).unit_vector;
        var mp1_g1 = mp1.add(g7.multiply(0.05).rotate_90_cw());
        var mp1_g2 = mp1.add(g7.multiply(0.05).rotate_90_ccw());
        var mp3 = mp1.add(g7.multiply(n5).rotate_90_cw());
        var mp4 = mp1.add(g7.multiply(n5).rotate_90_ccw());
        let kickDot_right1 = new WaypointTask(this.tasks.length + 1, mp3, false, true);
        let kickDot_right2 = new WaypointTask(this.tasks.length + 1, mp4, false, true);

        //left side of the field
        var mp2 = middleOfGoal2.add(g6.multiply(n10));
        var g8 = new Line(mp2, mp).unit_vector;
        var mp2_g1 = mp2.add(g8.multiply(0.05).rotate_90_cw());
        var mp2_g2 = mp2.add(g8.multiply(0.05).rotate_90_ccw());
        var mp5 = mp2.add(g8.multiply(n5).rotate_90_cw());
        var mp6 = mp2.add(g8.multiply(n5).rotate_90_ccw());
        let kickDot_left1 = new WaypointTask(this.tasks.length + 1, mp5, false, true);
        let kickDot_left2 = new WaypointTask(this.tasks.length + 1, mp6, false, true);

        //Definitions of Middle line center circle points
        let mlp1 = new Line(c1, c4).middle;
        let mlp2 = new Line(c2, c3).middle;
        let g12 = new Line(mp, mlp1).unit_vector;
        let g13 = new Line(mp, mlp2).unit_vector;
        let cp1 = mp.add(g12.multiply(n3));
        let cp2 = mp.add(g13.multiply(n3));


        //Corners
        let g15 = new Line(c1, c4).unit_vector;
        let c1_p1 = c1.add(g15.multiply(0.25));
        let c1_p2 = c1.add(g15.multiply(0.25).rotate_90_ccw());
        let c1_p3 = c1.add(new Line(c1, new Line(c1_p1, c1_p2).middle).unit_vector.multiply(0.25));

        let g16 = new Line(c2, c3).unit_vector;
        let c2_p1 = c2.add(g16.multiply(0.25));
        let c2_p2 = c2.add(g16.multiply(0.25).rotate_90_cw());
        let c2_p3 = c2.add(new Line(c2, new Line(c2_p1, c2_p2).middle).unit_vector.multiply(0.25));

        let g17 = new Line(c3, c4).unit_vector;
        let c3_p1 = c3.add(g17.multiply(0.25));
        let c3_p2 = c3.add(g17.multiply(0.25).rotate_90_cw());
        let c3_p3 = c3.add(new Line(c3, new Line(c3_p1, c3_p2).middle).unit_vector.multiply(0.25));

        let g18 = new Line(c4, c1).unit_vector;
        let c4_p1 = c4.add(g18.multiply(0.25));
        let c4_p2 = c4.add(g18.multiply(0.25).rotate_90_cw());
        let c4_p3 = c4.add(new Line(c4, new Line(c4_p1, c4_p2).middle).unit_vector.multiply(0.25));

        //Lines for substitutionzone
        let g19 = new Line(mlp1, c1).unit_vector;
        let subLine1 = mlp1.add(g19.multiply(5));
        let subLine2 = mlp1.add(g19.multiply(10));
        let g20 = new Line(subLine1, c1).unit_vector;
        let g21 = new Line(subLine2, c1).unit_vector;
        let subLine1_endpoint1 = subLine1.add(g20.multiply(0.4).rotate_90_ccw())
        let subLine1_endpoint2 = subLine1.add(g20.multiply(0.4).rotate_90_cw())
        let subLine2_endpoint1 = subLine2.add(g21.multiply(0.4).rotate_90_ccw())
        let subLine2_endpoint2 = subLine2.add(g21.multiply(0.4).rotate_90_cw())

        let g22 = new Line(mlp1, c4).unit_vector;
        let subLine3 = mlp1.add(g22.multiply(5));
        let subLine4 = mlp1.add(g22.multiply(10));
        let g23 = new Line(subLine3, c4).unit_vector;
        let g24 = new Line(subLine4, c4).unit_vector;
        let subLine3_endpoint1 = subLine3.add(g23.multiply(0.4).rotate_90_cw())
        let subLine3_endpoint2 = subLine3.add(g23.multiply(0.4).rotate_90_ccw())
        let subLine4_endpoint1 = subLine4.add(g24.multiply(0.4).rotate_90_cw())
        let subLine4_endpoint2 = subLine4.add(g24.multiply(0.4).rotate_90_ccw())


        //lines beside goals
        //right side
        let g31 = new Line(c1, c2).unit_vector;
        let goalLine1 = c1.add(g31.multiply(n5));
        let g25 = new Line(c2, c1).unit_vector;
        let goalLine2 = c2.add(g25.multiply(n5));
        let g26 = new Line(goalLine1, c1).unit_vector;
        let g27 = new Line(goalLine2, c2).unit_vector;
        let goalLine1_endpoint = goalLine1.add(g26.multiply(0.4).rotate_90_cw())
        let goalLine2_endpoint = goalLine2.add(g27.multiply(0.4).rotate_90_ccw())

        //Left side
        let goalLine3 = c3.add(g17.multiply(n5));
        let g28 = new Line(c4, c3).unit_vector;
        let goalLine4 = c4.add(g28.multiply(n5));
        let g29 = new Line(goalLine3, c3).unit_vector;
        let g30 = new Line(goalLine4, c4).unit_vector;
        let goalLine3_endpoint = goalLine3.add(g29.multiply(0.4).rotate_90_cw())
        let goalLine4_endpoint = goalLine4.add(g30.multiply(0.4).rotate_90_ccw())

        let c1c4 = new Line(c1, c4);

        //draw
        this.tasks.push(new ArcTask(this.tasks.length, [c1_p1, c1_p3, c1_p2], c1, false, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [c1, arc2p1], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [arc2p1, arc2Top, arc2p2], c6, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc2p2, kickPointCenter1], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [kickPoint1_g1, kickPoint1_g2], kickPointCenter1, true, false, true));
        if (this.options["Sublines"].val) {
            this.tasks.push(new LineTask(this.tasks.length, [subLine1_endpoint1, subLine1_endpoint2], false, true));
            this.tasks.push(new LineTask(this.tasks.length, [subLine2_endpoint1, subLine2_endpoint2], false, true));
        }
        this.tasks.push(kickDot_right1);
        this.tasks.push(new ArcTask(this.tasks.length, [mp1_g1, mp1_g2], mp1, true, false, true));
        this.tasks.push(kickDot_right2);
        this.tasks.push(new ArcTask(this.tasks.length, [arc1p1, arc1Top, arc1p2], c5, false, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc1p2, kickPointCenter1], false, true));

        this.tasks.push(new LineTask(this.tasks.length, [goalLine1, goalLine1_endpoint], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [goalLine2, goalLine2_endpoint], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc2p1, c2], false, true));

        this.tasks.push(new ArcTask(this.tasks.length, [c2_p1, c2_p3, c2_p2], c2, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [c2, c3], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [c3_p1, c3_p3, c3_p2], c3, true, false, true));

        this.tasks.push(new LineTask(this.tasks.length, [c3, arc4p1], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [arc4p1, arc4Top, arc4p2], c8, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc4p2, kickPointCenter2], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [kickPoint2_g1, kickPoint2_g2], kickPointCenter2, true, false, true));
        if (this.options["Sublines"].val) {
            this.tasks.push(new LineTask(this.tasks.length, [subLine3_endpoint2, subLine3_endpoint1], false, true));
            this.tasks.push(new LineTask(this.tasks.length, [subLine4_endpoint1, subLine4_endpoint2], false, true));
        }

        this.tasks.push(kickDot_left2);
        this.tasks.push(new ArcTask(this.tasks.length, [mp2_g1, mp2_g2], mp2, true, false, true));
        this.tasks.push(kickDot_left1);
        this.tasks.push(new ArcTask(this.tasks.length, [arc3p1, arc3Top, arc3p2], c7, false, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc3p2, kickPointCenter2], false, true));

        this.tasks.push(new LineTask(this.tasks.length, [goalLine3, goalLine3_endpoint], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [goalLine4, goalLine4_endpoint], false, true));
        this.tasks.push(new LineTask(this.tasks.length, [arc4p1, c4], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [c4_p1, c4_p3, c4_p2], c4, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [c4, c1], false, true));

        this.tasks.push(new LineTask(this.tasks.length, [mlp1, mp], false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [mp_g1, mp_g2], mp, true, false, true));
        this.tasks.push(new ArcTask(this.tasks.length, [cp1, cp2], mp, true, false, true));
        this.tasks.push(new LineTask(this.tasks.length, [mp, mlp2], false, true));


        this.refresh_bb();
        this.refresh_handles();
        this.refresh_snapping_lines();
        this.refresh_test_run();
    }
    
}