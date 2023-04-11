/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global bottom_bar_chooser, pitch_generator, event_controller, map_controller, proj4, settings_screeen_controller, Projector, ArcTask */

var measure_screen = {
  active: false,
  measureMode: "OtO",
  previous_mode : null,
  _shortest_result: 0,
  _straight_result: 0,
  _point_center_result: 0,
  _center_center_result: 0,
  label_offsets: [0,0,0,0],
  first_drawn: false,
  center_center_drawn: false,
  point_center_drawn: false,
  force_MtM : false,
  COLORS_FOR_MEASUREMENTS: {
    "POINT_LABEL": "#FFFFFF",
    "SELECTED_MEASURE_MODE" : "#02CC66",
    "DESELECTED_MEASURE_MODE": "#545454",
    "STRAIGHT_DISTANCE": "#B0FC38",
    "SHORTEST_DISTANCE": "#3F00FF",
    "CENTER_CENTER_DISTANCE": "#D203FC",
    "POINT_CENTER_DISTANCE": "#ffc80088"
  },
  get shortest_result(){
    return measure_screen._shortest_result;
  },
  set shortest_result(v){
    measure_screen._shortest_result = v;
  },
  get straight_result(){
    return measure_screen._straight_result;
  },
  set straight_result(v){
    measure_screen._straight_result = v;
  },
  get center_center_result(){
    return measure_screen._center_center_result;
  },
  set center_center_result(v){
    measure_screen._center_center_result = v;
  },
  get point_center_result(){
    return measure_screen._point_center_result;
  },
  set point_center_result(v){
    measure_screen._point_center_result = v;
  },
  open: function()
  {
    measure_screen.active = true;
    joystickScreenController.hide("measure_screen");
    utilitiesScreenController.choose_utility_overlay.off();
    pitch_generator.reset( );
    map_controller.background.eventController.call_callback( "active_job_changed" );
    bottom_bar_chooser.choose_bottom_bar( "#measure-screen" );
    settings_screeen_controller.close();
    if(SETTINGS.showMeasurementScreenLegend){
      measure_screen.measureMode = "OtO";
      measure_screen.previous_mode = measure_screen.measureMode;
      $("#measurement_legend").removeClass("gone");
      measure_screen.initial_svg_color_handling();
    }
    else{
      measure_screen.force_MtM = true;
      measure_screen.measureMode = "MtM";
      measure_screen.previous_mode = measure_screen.measureMode;
    }
    measure_screen.translation_of_UI();
    measure_screen.reset_measurement();
    if( !measure_screen.points.length )
    {
      $( "#measure-screen #info" ).html( translate["Choose first point"] );
    }
  },
  close: function()
  {
    measure_screen.active = false;
    joystickScreenController.unhide("measure_screen");
    bottom_bar_chooser.choose_bottom_bar( "#robot-selected" );
    measure_screen.reset_measurement(true);
    if(SETTINGS.showMeasurementScreenLegend){
      measure_screen.svg_color_handling("MtM", true);
      measure_screen.svg_color_handling(measure_screen.measureMode, true);
    }
    $("#measurement_legend").addClass("gone");
    joystickScreenController.unhide("measure_screen");
  },
  translation_of_UI(){
    $("#OtO_measurement").html(translate["Outside to outside"]);
    $("#MtM_measurement").html(translate["Middle to middle"]);
    $("#ItI_measurement").html(translate["Inside to inside"]);
    $("#MtO_measurement").html(translate["Middle to outside"]);
    $("#MtI_measurement").html(translate["Middle to inside"]);
    $("#measurement_reset").html(translate["Clear"]);
  },
  /**
   * 
   * @param {Boolean} closing Used to make sure that the MtM mode is deselected when the measurement page is being closed
   */
  reset_measurement(closing = false){
    if(measure_screen.force_MtM){
      $("#OtO_measurement").removeClass("darkened").addClass("dark");
      $("#ItI_measurement").removeClass("darkened").addClass("dark");
      $("#MtO_measurement").removeClass("darkened").addClass("dark");
      $("#MtI_measurement").removeClass("darkened").addClass("dark");
      measure_screen.force_MtM = false;
    }
    if(closing){
      $("#MtM_measurement").removeClass("chosen").addClass("dark");
      $("#OtO_measurement").removeClass("chosen").addClass("dark");
      $("#ItI_measurement").removeClass("chosen").addClass("dark");
      $("#MtO_measurement").removeClass("chosen").addClass("dark");
      $("#MtI_measurement").removeClass("chosen").addClass("dark");
    }
    $("#measured_element0_info").html("");
    $("#measured_element1_info").html("");
    $("#measurement_distance_info").html(""); 
    measure_screen.reset_of_pitches_and_drawn();
    measure_screen.shortest_result = null;
    measure_screen.straight_result = null;
    measure_screen.center_center_result = null;
    measure_screen.point_center_result = null;
    measure_screen.points.length = 0;
    if( !measure_screen.points.length )
    {
      $( "#measure-screen #info" ).html( translate["Choose first point"] );
    }
  },
  /**
   * 
   * @param {String} measureMode Selected measurement mode from the legend.svg 
   */
  selectMeasureMode(measureMode){
    if(!measure_screen.force_MtM){
      measure_screen.measure_mode_change_handling(measureMode)
    }
    if(measure_screen.points.length > 0)
    measure_screen.draw_on_map();
  },
  reset_of_pitches_and_drawn(){
    measure_screen.first_drawn = false;
    measure_screen.center_center_drawn = false;
    measure_screen.point_center_drawn = false;
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_shortest );
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_straight );
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_point_center );
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_center_center );
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_label_1 );
    map_controller.background.removePitchLayer( measure_screen.pitch_layer_label_2 );
    measure_screen.label_offsets = [0,0,0,0];
    measure_screen.pitch_layer_shortest = '';
    measure_screen.pitch_layer_straight = '';
    measure_screen.pitch_layer_center_center = '';
    measure_screen.pitch_layer_point_center = '';
    measure_screen.pitch_layer_label_1 = '';
    measure_screen.pitch_layer_label_2 = '';
  },

  points: [ ],
  /**
   * 
   * @param {Job} nearest_job Nearest job located to the clicked position on the map
   * @param {Task} nearest_task Nearest task located to the clicked position on the map
   * @param {Vector} nearest_point Nearest point on the element located to the clicked position on the map
   * @param {String} proj Projection string of the marked point 
   */
  add_point (nearest_job, nearest_task, nearest_point, proj){
    measure_screen.points.push( [ nearest_job, nearest_task, nearest_point, proj ] );
    console.log( "-------------------------------------------" );
    console.log( "Selected task:", nearest_task );
    console.log( "length of selected task:", nearest_task.length, "m" );
    console.log( "length of selected task:", nearest_task.length.meter2foot(), "feet" );
    console.log( "length of selected task:", nearest_task.length.meter2yard(), "yards" );
    console.log( "remember that the length is without the spray length added" );
    console.log( "Painted length of selected task:", nearest_task.length + nearest_job.options.LineWidth.val.abs, "m" );
    console.log( "Painted length of selected task:", (nearest_task.length + nearest_job.options.LineWidth.val.abs).meter2foot().round(3), "feet" );
    console.log( "Painted length of selected task:", (nearest_task.length + nearest_job.options.LineWidth.val.abs).meter2yard().round(3), "yards" );

    console.log( "-------------------------------------------" );

    if( measure_screen.points.length > 2 )
    {
      if(measure_screen.points[1][0].id === measure_screen.points[2][0].id){
        measure_screen.points[1] = [ nearest_job, nearest_task, nearest_point, proj ];
        measure_screen.points = measure_screen.points.splice(0,2);
      }
      else if(measure_screen.points[0][0].id === measure_screen.points[2][0].id){
        measure_screen.points[0] = [ nearest_job, nearest_task, nearest_point, proj ];
        measure_screen.points = measure_screen.points.splice(0,2);
      }
      else{
        measure_screen.points.length = 0;
        measure_screen.points.push( [ nearest_job, nearest_task, nearest_point, proj ] );
      }
    }
    measure_screen.element_info();
    measure_screen.draw_on_map();
  },

  pitch_layer_shortest: '',
  pitch_layer_straight: '',
  pitch_layer_point_center: '',
  pitch_layer_center_center: '',
  pitch_layer_label_1: '',
  pitch_layer_label_2: '',
  saved_origin_point: new Vector(0,0), 

  draw_on_map: function()
  {
    if(!measure_screen.active){
        return;
    }  
    measure_screen.reset_of_pitches_and_drawn();
    let shortest_dist_job = new Job();
    let straight_dist_job = new Job();
    let point_center_dist_job = new Job();
    let center_dist_job = new Job();
    let el1label = new Job();
    let el2label = new Job();
    let projection;
    if(measure_screen.points[0]){
      projection = measure_screen.points[0][3];
    }
    shortest_dist_job.projection = projection;
    straight_dist_job.projection = projection;
    point_center_dist_job.projection = projection;
    center_dist_job.projection = projection;
    el1label.projection = projection;
    el2label.projection = projection;
    let origin_point, second_point_straight_line, circle_center1, circle_center2;
    
    if( measure_screen.points.length === 1 )
    {
      $("#measure-screen #info").html(translate["Choose another point to measure"]);
      const projector = Projector( measure_screen.points[0][3], projection );
      var point = projector.forward( measure_screen.points[0][2].toArray() ).toVector();
      projector.release();
      shortest_dist_job.tasks.push( new WaypointTask( 0, point, false, true ) );
      shortest_dist_job.projection = measure_screen.points[0][3];

      straight_dist_job.tasks.push( new WaypointTask(0 , point, false, true) );
      straight_dist_job.projection = measure_screen.points[0][3];
      
      point_center_dist_job.tasks.push( new WaypointTask(0, point, false, true));
      point_center_dist_job.projection = measure_screen.points[0][3];
      if(!(measure_screen.points[0][1] instanceof LineTask)){
        center_dist_job.tasks.push( new WaypointTask(0, point, false, true));
        center_dist_job.projection = measure_screen.points[0][3];
        measure_screen.force_MtM = true;
        if(SETTINGS.showMeasurementScreenLegend)
        measure_screen.measure_mode_change_handling("MtM");
      }
      else{
        measure_screen.force_MtM = false;
        if(SETTINGS.showMeasurementScreenLegend)
        measure_screen.measure_mode_change_handling(measure_screen.measureMode);
      }
    }
    else
    {
      $("#measure-screen #info").html("");
      let different_projections = measure_screen.points[0][3] != measure_screen.points[1][3];
      const projector = Projector( measure_screen.points[0][3], measure_screen.points[1][3] );
      if(!different_projections){
      origin_point = projector.forward( measure_screen.points[0][2].toArray() ).toVector();
      }
      else 
      {
        origin_point = measure_screen.different_projections_handling();
      }
      second_point_straight_line = projector.forward( measure_screen.points[1][2].toArray() ).toVector();
      if((!(measure_screen.points[0][1] instanceof LineTask) && !(measure_screen.points[0][1] instanceof WaypointTask) && !(measure_screen.points[0][1] instanceof SplineTask)) && (!(measure_screen.points[1][1] instanceof LineTask) && !(measure_screen.points[1][1] instanceof WaypointTask) && !(measure_screen.points[1][1] instanceof SplineTask))){
        if(!((measure_screen.points[0][0].id === measure_screen.points[1][0].id) && (measure_screen.points[0][1].id === measure_screen.points[1][1].id)))
          circle_center1 = projector.forward( measure_screen.points[0][1].center.toArray()).toVector();
      }
      if(!(measure_screen.points[1][1] instanceof LineTask) && !(measure_screen.points[1][1] instanceof WaypointTask) && !(measure_screen.points[1][1] instanceof SplineTask)){
          circle_center2 = projector.forward( measure_screen.points[1][1].center.toArray()).toVector();
          measure_screen.force_MtM = true;
          if(SETTINGS.showMeasurementScreenLegend)
          measure_screen.measure_mode_change_handling("MtM");
      }
      else{
        if(!measure_screen.force_MtM){
          measure_screen.force_MtM = false;
          if(SETTINGS.showMeasurementScreenLegend)
          measure_screen.measure_mode_change_handling(measure_screen.measureMode);
        }
      }

      projector.release();
      origin_point = origin_point ? origin_point : measure_screen.saved_origin_point;
      let task2 = measure_screen.points[1][1];
      let second_point_shortest = task2.getNearestPoint( origin_point);
      
      el1label.tasks.push( new WaypointTask("Element_label1", origin_point, false, true));
      el1label.projection = measure_screen.points[0][3];
      el2label.tasks.push( new WaypointTask("Element_label2", second_point_straight_line, false, true));
      el2label.projection = measure_screen.points[0][3];
      if( (new Line( origin_point, second_point_shortest )).length < 0.0001 && measure_screen.points[0][0].id != measure_screen.points[1][0].id){
        shortest_dist_job.tasks.push( new WaypointTask( 0, origin_point, false, true ) );
      }
      else{
        if(circle_center2){
          point_center_dist_job.tasks.push( new LineTask( "measurement_p_c", [ origin_point, circle_center2 ], false, true));
          point_center_dist_job.projection = measure_screen.points[1][3];
        }
        if(circle_center1){
          center_dist_job.tasks.push(new LineTask("measurement_c_c", [ circle_center1, circle_center2 ], false, true));
          center_dist_job.projection = measure_screen.points[1][3];
        }
        shortest_dist_job.tasks.push( new LineTask( "measurement", [ origin_point, second_point_shortest ], false, true ) );
        shortest_dist_job.projection = measure_screen.points[1][3];
        straight_dist_job.tasks.push( new LineTask( "measurement", [ origin_point, second_point_straight_line ], false, true ) );
        straight_dist_job.projection = measure_screen.points[1][3];
      }
    }
    if(measure_screen.points.length > 1)
    {
      let shortest_distance;
        shortest_distance = measure_screen.shortest_distance_handling(shortest_dist_job);

      let straight_distance = measure_screen.straight_distance_handling(straight_dist_job, origin_point, second_point_straight_line);
      let modes = ["OtO", "MtM", "MtI", "MtO", "ItI"];
          measure_screen.shortest_result = measure_screen.roundTo3Decimals(shortest_distance[modes.indexOf(measure_screen.measureMode)].meter2unit());
        measure_screen.straight_result = measure_screen.roundTo3Decimals(straight_distance[modes.indexOf(measure_screen.measureMode)].meter2unit());
        if(circle_center2){
          measure_screen.point_center_result =  measure_screen.roundTo3Decimals(point_center_dist_job.tasks[0].length.meter2unit());
        }
        if(circle_center1){
          measure_screen.center_center_result = measure_screen.roundTo3Decimals(center_dist_job.tasks[0].length.meter2unit());
      }
      measure_screen.element_info(true);
      measure_screen.check_labels_position(circle_center2, circle_center1, point_center_dist_job, center_dist_job, shortest_dist_job, straight_dist_job);
    }
    measure_screen.drawing_of_lines(circle_center2, circle_center1, point_center_dist_job, center_dist_job, shortest_dist_job, straight_dist_job, el1label, el2label);
  },

  check_labels_position(circle_center2, circle_center1, point_center_dist_job, center_dist_job, shortest_dist_job, straight_dist_job){
    let all_middles = [];
    let shortest_middle = new Line(shortest_dist_job.tasks[0].ends[0],shortest_dist_job.tasks[0].ends[1]).middle;
    all_middles.push(shortest_middle);
    let straight_middle = new Line(straight_dist_job.tasks[0].ends[0],straight_dist_job.tasks[0].ends[1]).middle;
    all_middles.push(straight_middle);
    if(circle_center2){
      let center2_middle = new Line(point_center_dist_job.tasks[0].ends[0],point_center_dist_job.tasks[0].ends[1]).middle;
      all_middles.push(center2_middle);
    }
    if(circle_center1){
      let center1_middle = new Line(center_dist_job.tasks[0].ends[0],center_dist_job.tasks[0].ends[1]).middle;
      all_middles.push(center1_middle);
    }
    let allowed_dist = 10;
    let too_close = [];
    all_middles.forEach((element, index)=>{
      if(index === (all_middles.length - 1)){
        if(element.dist_to_point(all_middles[0]) < allowed_dist){
          too_close.push(index);
        }
      }
      else{
        if(element.dist_to_point(all_middles[index + 1]) < allowed_dist){
          too_close.push(index);
        } 
      }
    });
    if(too_close.length === 2){
      measure_screen.label_offsets[too_close[0]] = 20;
    }
    else if(too_close.length === 3){
      measure_screen.label_offsets[too_close[0]] = 20;
      measure_screen.label_offsets[too_close[2]] = -20;
    }
    else if(too_close.length === 4){
      measure_screen.label_offsets[too_close[0]] = 20;
      measure_screen.label_offsets[too_close[2]] = 40;
      measure_screen.label_offsets[too_close[3]] = -20;
    }
  },

  drawing_of_lines(circle_center2, circle_center1, point_center_dist_job, center_dist_job, shortest_dist_job, straight_dist_job, el1label, el2label){
    if(circle_center2){
      measure_screen.point_center_drawn = true;
      measure_screen.pitch_layer_point_center = map_controller.background.draw_job( point_center_dist_job, measure_screen.COLORS_FOR_MEASUREMENTS.POINT_CENTER_DISTANCE, false, false, null, 7 );
    }
    if(circle_center1){
      measure_screen.center_center_drawn = true;
      measure_screen.pitch_layer_center_center = map_controller.background.draw_job( center_dist_job, measure_screen.COLORS_FOR_MEASUREMENTS.CENTER_CENTER_DISTANCE, false, false );
    }    
    if(measure_screen.points.length > 1){
          measure_screen.pitch_layer_label_1 = map_controller.background.draw_job( el1label, measure_screen.COLORS_FOR_MEASUREMENTS.POINT_LABEL, false, false);
        if(!(measure_screen.points[1][1] instanceof LineTask) && !(measure_screen.points[1][1] instanceof WaypointTask)){
          if(!((measure_screen.points[0][0].id === measure_screen.points[1][0].id) && (measure_screen.points[0][1].id === measure_screen.points[1][1].id))){  
          measure_screen.pitch_layer_shortest = map_controller.background.draw_job( shortest_dist_job, measure_screen.COLORS_FOR_MEASUREMENTS.SHORTEST_DISTANCE, false, false, null, 1.5 );
          }
        }
        else if(measure_screen.points[1][1] instanceof LineTask){
          measure_screen.pitch_layer_shortest = map_controller.background.draw_job( shortest_dist_job, measure_screen.COLORS_FOR_MEASUREMENTS.SHORTEST_DISTANCE, false, false );
        }
      else
      {
        if(measure_screen.points[0][1] instanceof LineTask && measure_screen.points[1][1] instanceof LineTask)
        measure_screen.force_MtM = false;
      }
      measure_screen.first_drawn = true;
    }
      measure_screen.pitch_layer_label_2 =  map_controller.background.draw_job( el2label, measure_screen.COLORS_FOR_MEASUREMENTS.POINT_LABEL, false, false);
      measure_screen.pitch_layer_straight = map_controller.background.draw_job( straight_dist_job, measure_screen.COLORS_FOR_MEASUREMENTS.STRAIGHT_DISTANCE, false, false );
  },

  different_projections_handling(){
    if(measure_screen.points[0][2].dist_to_point(measure_screen.saved_origin_point) != 0){
      let project = Projector(measure_screen.points[0][3], measure_screen.points[1][3], measure_screen.points[0][2].toArray());
      measure_screen.points[0][2] = project.toVector();
      measure_screen.saved_origin_point = project.toVector();
      return project.toVector();
    }
  },
  /**
   * 
   * @param {SVGTextPathElement} item SVG path xml object
   */
  marking_the_chosen_measure_mode(item, color, stroke_width){
    item.style.setProperty("stroke", color);
    item.style.setProperty("fill", color);
    item.style.setProperty("stroke-width", stroke_width);
  },
  /**
   * 
   * @param {String} previous_mode Previously chosen measurement mode on the legend.svg
   */
  svg_color_handling(previous_mode = null, closing){ 
    let svg = document.getElementById("measurement_svg").contentDocument;
    for(let item of svg.getElementsByClassName(measure_screen.measureMode)){
      measure_screen.marking_the_chosen_measure_mode(item, measure_screen.COLORS_FOR_MEASUREMENTS.SELECTED_MEASURE_MODE, "0.1");
    }
    if(previous_mode && previous_mode != measure_screen.measureMode){
      for(let item of svg.getElementsByClassName(previous_mode)){
        measure_screen.marking_the_chosen_measure_mode(item, measure_screen.COLORS_FOR_MEASUREMENTS.DESELECTED_MEASURE_MODE, "0.05");
      }
    }
    if(closing) {
      for(let item of svg.getElementsByClassName(previous_mode)){
        measure_screen.marking_the_chosen_measure_mode(item, measure_screen.COLORS_FOR_MEASUREMENTS.DESELECTED_MEASURE_MODE, "0.05");
      }
    }
  },

  initial_svg_color_handling(){
    setTimeout(function(){
      $("#" + measure_screen.measureMode + "_measurement").toggleClass("chosen");
      let svg = document.getElementById("measurement_svg").contentDocument;
      for(let item of svg.getElementsByClassName(measure_screen.measureMode)){
        measure_screen.marking_the_chosen_measure_mode(item, measure_screen.COLORS_FOR_MEASUREMENTS.SELECTED_MEASURE_MODE, "0.1");
      }
    },100);
  },
  /**
   * 
   * @param {String} measureMode Chosen measurement mode on the legend.svg
   */
  measure_mode_change_handling(measureMode){
    if(measureMode != measure_screen.measureMode){
      measure_screen.previous_mode = measure_screen.measureMode;
      measure_screen.measureMode = measureMode;
    }
    let style = measure_screen.force_MtM ? "darkened" : "dark";
    $("#OtO_measurement").removeClass("chosen").addClass(style);
    $("#ItI_measurement").removeClass("chosen").addClass(style);
    $("#MtI_measurement").removeClass("chosen").addClass(style);
    $("#MtO_measurement").removeClass("chosen").addClass(style);
    $("#MtM_measurement").removeClass("chosen").addClass(style);
    $("#" + measure_screen.measureMode + "_measurement").removeClass(style).addClass("chosen");
    measure_screen.svg_color_handling(measure_screen.previous_mode);
  },

 /**
  * Kept for reference
  * @param {Number} d Number to be split up into imperial units 
  * @returns Umber converted to string of imperial units
  */
  splitImperialUnits( d )
  {
    var yards = Math.floor( d.meter2yard() );
    d -= yards.yard2meter();
    yards = yards < 0 ? yards * -1 : yards;
    var feet = Math.floor( d.meter2foot() );
    d -= feet.foot2meter();
    var inch = d.meter2inch().round(3);
    return "" + yards + " yards " + feet + " feets " + inch + " inches";
  },
  /**
   * 
   * @param {Job} shortest Job handling the shortest distance between two chosen elements
   * @returns Returns list of distances for the shortest path for different measurement modes
   */
  shortest_distance_handling(shortest){
    let dist_short = shortest.tasks[0].length;
    if(measure_screen.points[0][1] instanceof LineTask && measure_screen.points[1][1] instanceof LineTask){
      let dist_half_line_short = (dist_short - shortest.options.LineWidth.val / 2);
      let dist_no_line_short = (dist_short - shortest.options.LineWidth.val);
      let dist_with_half_line_short = (dist_short + shortest.options.LineWidth.val / 2);
      let dist_with_line_short = (dist_short + shortest.options.LineWidth.val);
      return [dist_with_line_short, dist_short, dist_half_line_short, dist_with_half_line_short, dist_no_line_short];
    }
    else{
      return [dist_short, dist_short, dist_short, dist_short, dist_short];
    }
  }, 
  /**
   * 
   * @param {Job} straight_dist_job Job handling the specific distance between two marked points on the map 
   * @param {Vector} p1 Starting point 
   * @param {Vector} p2 Ending point
   * @returns Returns list of distances for the straight path for different measurement modes
   */
  straight_distance_handling(straight_dist_job, p1, p2){
    let dist_straight = straight_dist_job.tasks[0].length;
    if(measure_screen.points[0][1] instanceof LineTask && measure_screen.points[1][1] instanceof LineTask){
      let entity1Direction = measure_screen.points[0][1].toLine().unit_vector;
      let e1oRight = measure_screen.points[0][2].add(entity1Direction.rotate_90_ccw().multiply(straight_dist_job.options.LineWidth.val/ 2));
      let e1oLeft = measure_screen.points[0][2].add(entity1Direction.rotate_90_cw().multiply(straight_dist_job.options.LineWidth.val/ 2));
      let entity2Direction = measure_screen.points[1][1].toLine().unit_vector;
      let e2oRight = measure_screen.points[1][2].add(entity2Direction.rotate_90_ccw().multiply(straight_dist_job.options.LineWidth.val/ 2));
      let e2oLeft = measure_screen.points[1][2].add(entity2Direction.rotate_90_cw().multiply(straight_dist_job.options.LineWidth.val/ 2));
      let e1r = p1.dist_to_point(e2oRight);
      let e1l = p1.dist_to_point(e2oLeft);
      let e2r = p2.dist_to_point(e1oRight);
      let e2l = p2.dist_to_point(e1oLeft);
      let dist_with_line_straight = (e1l <= e1r ? e2oRight.dist_to_point(e2l <= e2r ? e1oRight : e1oLeft) : e2oLeft.dist_to_point(e2l <= e2r ? e1oRight : e1oLeft));
      let dist_half_line_straight = (e1l <= e1r ? e1l: e1r);
      let dist_with_half_line_straight = (e1l <= e1r ? e1r : e1l);
      let dist_no_line_straight = (e1l <= e1r ? e2oLeft.dist_to_point(e2l <= e2r ? e1oLeft : e1oRight) : e2oRight.dist_to_point(e2l <= e2r ? e1oLeft : e1oRight));
      return [dist_with_line_straight, dist_straight, dist_half_line_straight, dist_with_half_line_straight, dist_no_line_straight];
    }
    else{
      return [dist_straight, dist_straight, dist_straight, dist_straight, dist_straight];
    }

  },

  element_info(distances_info = false){
      let result = "";
      if(measure_screen.points.length > 0){
        measure_screen.points.forEach((element) => {
          if(element[1] instanceof ArcTask){
            result += "<b>" + translate["Circumference"] + "</b>" + ": ";
            result += measure_screen.roundTo3Decimals(element[1].length.meter2unit()) + " " + translate_unit();
            result += "\n" + "<b>" +  translate["Radius"] + "</b>" + ": ";
            result += measure_screen.roundTo3Decimals(element[1].radius.length.meter2unit()) + " " + translate_unit();
          }
          else {
            result += "<b>" + translate["Length"] + "</b>" + ": ";
            result += measure_screen.roundTo3Decimals(element[1].length.meter2unit()) + " " + translate_unit();
          }
          $("#measured_element" + measure_screen.points.indexOf(element) + "_info").html( "<b>" + translate["Element"] + "</b>" + ": " + (measure_screen.points.indexOf(element) === 0 ? "<b>A</b>" : "<b>B</b>") + ":\n" + result); 
          result = "";
        });
      }
    if(distances_info){
      let result = "";
      result += "<b>" + translate["Shortest dist"] + "</b>: " + measure_screen.roundTo3Decimals(measure_screen.shortest_result.meter2unit()) + " " + translate_unit() + "\n";
      result += "<b>" + translate["Direct dist"] + "</b>: " + measure_screen.roundTo3Decimals(measure_screen.straight_result.meter2unit()) + " " + translate_unit() + "\n";
      if(measure_screen.point_center_result){
        result += "<b>" + translate["Point to center dist"] + "</b>: " + measure_screen.roundTo3Decimals(measure_screen.point_center_result.meter2unit()) + " " + translate_unit() + "\n";
      }
      if(measure_screen.center_center_result){
        result += "<b>" + translate["Center to center dist"] + "</b>: " + measure_screen.roundTo3Decimals(measure_screen.center_center_result.meter2unit()) + " " + translate_unit() + "\n";
      }
      $("#measurement_distance_info").html(result); 
    }
  },
  /**
   * 
   * @param {Number} input Number to be rounded to 3 decimals 
   * @returns Number rounded to 3 decimals
   */
  roundTo3Decimals(input){
    return Math.round(input * 1000) / 1000;
  }
};
