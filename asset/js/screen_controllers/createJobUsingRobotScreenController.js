const createJobUsingRobotScreenController = {
  template: null,
  callbacks: null,
  mapMarkerLayers: [],
  previewLayer: null,
  previewJob: null,

  /**
   * @param {Function} cancel 
   * @param {Function} toggleSlow 
   * @param {Function} previous 
   * @param {Function} collect 
   * @param {Function} next 
   * @param {Function} undo 
   * @param {Function} done 
   */
  open(cancel, toggleSlow, previous, collect, next, undo, done) {
    createJobUsingRobotScreenController.reset();
    createJobUsingRobotScreenController.template = pt[createJobMenuController.templateID];
    createJobUsingRobotScreenController.callbacks = [cancel, toggleSlow, previous, collect, next, undo, done];
    createJobUsingRobotScreenController.openBottomBar();

    if (SETTINGS.joystick_get_speed_from_robot) {
      createJobUsingRobotScreenController.toggleButtonOff("toggle_slow");
    }
    else {
        createJobUsingRobotScreenController.toggleButtonOn("toggle_slow", false);
    }

    createJobUsingRobotScreenController.openCornerVizualizer();
    bottom_bar_chooser.choose_bottom_bar( "#create-new-pitch-get-corner" );
    map_controller.background.zoom_to_robot();
  },

  close() {
    createJobUsingRobotScreenController.closeCornerVisualizer();
    createJobUsingRobotScreenController.removeMapMarkers();
    createJobUsingRobotScreenController.removePreview();
    createJobUsingRobotScreenController.reset();
  },

  reset() {
    createJobUsingRobotScreenController.template = null;
    createJobUsingRobotScreenController.callbacks = null;
    createJobUsingRobotScreenController.mapMarkerLayers = [];
    createJobUsingRobotScreenController.previewLayer = null;
  },

  openBottomBar() {
    createJobUsingRobotScreenController.setBottomBarHeader();
    createJobUsingRobotScreenController.setMessage(" ");
    createJobUsingRobotScreenController.populateBottomBarButtons();
  },

  setBottomBarHeader() {
    const query = $("#create-new-pitch-get-corner #header");
    let createString = "";
    if(pitch_generator.active instanceof NullJob) {
      createString = AppType === APP_TYPE.TinyLineMarker ? translate["Create new pitch"] : translate["Create new job"];
    }
    else {
      createString = AppType === APP_TYPE.TinyLineMarker ? translate["Recollect"] : translate["Create new job"];
    }

    const completeString = createString + " '" + createJobMenuController.handler.getJobName() + "'";  
    query.html(completeString);
  },

  /**
   * @param {String} message A message to display
   */
  setMessage(message) {
    const query = $("#create-new-pitch-get-corner #info_label");
    const translated = translate[message];
    query.html(translated);
    console.log("Laying out using robot does not support messaging");
  },
  
  /**
   * @param {String} id 
   * @param {Boolean} colorGreen 
   */
  toggleButtonOn(id, colorGreen=false) {
    const query = $("#create-new-pitch-get-corner .button-container #" + id + "_button");
    query.removeClass("disabled");
    query.prop("disabled", false);
    if (colorGreen) {
      query.addClass("green");
    }
  },

  /**
   * @param {String} id 
   */
  toggleButtonOff(id) {
    const query = $("#create-new-pitch-get-corner .button-container #" + id + "_button");
    query.addClass("disabled");
    query.prop("disabled", true);
    query.removeClass("green");
  },

  /**
   * @param {String} id 
   * @returns {Boolean} - Whether or not the button is disabled (has the css-class "disabled")
   */
  buttonIsDisabled(id) {
    const buttonID = id + "_button";
    const query = $("#create-new-pitch-get-corner .button-container #" + buttonID);
    return query.hasClass("disabled");
  },

  populateBottomBarButtons() {
    const container = $("#create-new-pitch-get-corner .button-container");

    let html = "";
    html += '<button id="cancel_button" class="red">cancel</button>';
    html += '<button id="toggle_slow_button" class="dark">slow joystick</button>';
    html += '<button id="previous_point_button" class="dark navigate_button"><span class="material-icons">chevron_left</span></button>';
    html += '<button id="collect_button" class="dark blue">collect</button>';
    html += '<button id="next_point_button" class="dark navigate_button"><span class="material-icons">chevron_right</span></button>';
    html += '<button id="undo_button" class="dark disabled">undo</button>';
    html += '<button id="done_button" class="dark disabled">save</button>';
    
    container.html(html);
    
    createJobUsingRobotScreenController.addCallbacks(container);
    createJobUsingRobotScreenController.translateButtons(container);
    createJobUsingRobotScreenController.setButtons();
  },

  setButtons() {
    if (SETTINGS.joystick_get_speed_from_robot) {
      const slowButtonQuery = $("#create-new-pitch-get-corner .button-container #toggle_slow_button");
      slowButtonQuery.remove();
    }
    createJobUsingRobotScreenController.toggleButtonOff("undo");
    createJobUsingRobotScreenController.toggleButtonOff("done");
  },

  updateButtons() {
    const query = $("#create-new-pitch-get-corner .button-container #collect_button");
    const modifying = createJobMenuController.handler.currentlyModifying;
    if (createJobMenuController.handler.collectedPoints[modifying]) {
      query.text(translate["recollect"]);
    }
    else {
      query.text(translate["collect"]);
    }

    if (createJobMenuController.handler.actions.length) {
        createJobUsingRobotScreenController.toggleButtonOn("undo", false);
    }
    else {
        createJobUsingRobotScreenController.toggleButtonOff("undo");
    }
    
    if (createJobMenuController.handler.allPointsAreCollected()) {
        createJobUsingRobotScreenController.toggleButtonOn("done", true);
    }
    else {
        createJobUsingRobotScreenController.toggleButtonOff("done");
    }
  },

  /**
   * @param {JQuery} container 
   */
  addCallbacks(container) {
    container.children().each((i, button)=>{                
      $(button).on("click", createJobUsingRobotScreenController.callbacks[i]);
    });
  },

  /**
   * @param {JQuery} container 
   */
  translateButtons(container) {
    container.children().each((i, button)=>{
      const translateThis = $(button).html();
      $(button).html(translate[translateThis]);
    });
  },

  openCornerVizualizer() {
    $("#which-corner-visualiser").removeClass("gone");
    const query = $("#which-corner-visualiser #template_image");
    query.addClass("invert");
    query.attr("src", createJobUsingRobotScreenController.template.template_image);
    setTimeout(()=>{ // Timeout due to update errors
      createJobUsingRobotScreenController.updateCornerVisualizer();
    }, 100);
  },

  closeCornerVisualizer() {
    $("#which-corner-visualiser").addClass( "gone" );
  },

  updateCornerVisualizer() {
    if(createJobMenuController.layoutMethodID === "n_ends") {
      return;
    }

    $( "#which-corner-visualiser #crosses" ).empty();

    const method = createJobUsingRobotScreenController.template.layout_methods[createJobMenuController.layoutMethodID];
    let positions;

    if(method instanceof LayoutMethod) {
      positions = method.layout_point_positions;
    }
    else {
      positions = createJobUsingRobotScreenController.template.get_point_positions(createJobMenuController.layoutMethodID);
    }

    positions.forEach((cross, i)=>{
      const html = createJobUsingRobotScreenController.createVisualizerPointHTML(cross, i);
      $("#which-corner-visualiser #crosses").append(html);
    });
  },

  /**
   * @param {Vector} cross 
   * @param {Number} index - accepts integers
   * @returns {String} (HTML)
   */
  createVisualizerPointHTML(cross, index) {
    const handler = createJobMenuController.handler;
    const templateObject = new createJobUsingRobotScreenController.template();

    cross = createJobUsingRobotScreenController.adjustCross(cross, templateObject.adjust_template_crosses);

    let icon = null;

    if(handler.collectedPoints[index]) {
      icon = createJobUsingRobotScreenController.createVisualizerIcon(cross, index, "green");
    }
    else {
      icon = createJobUsingRobotScreenController.createVisualizerIcon(cross, index, "orange");
    }
    return icon;
  },

  /**
   * @param {Vector} cross 
   * @param {Object} adjustments 
   * @returns {Vector}
   */
  adjustCross(cross, adjustments) {
    if( cross.y < 0.5 ) {
      cross.y += adjustments.top;
    }
    else {
      cross.y -= adjustments.bottom;
    }

    if( cross.x < 0.5 ) {
      cross.x += adjustments.left;
    }
    else {
      cross.x -= adjustments.right;
    }
    return cross;
  },

  /**
   * @param {Vector} position
   * @param {Number} index Accepts integers
   * @param {String} color 
   * @returns {String} (HTML)
   */
  createVisualizerIcon(position, index, color) {
    const numberString = "" + (index + 1);
    const crosshairBaseAdjustX = 11;
    const crosshairBaseAdjustY = 11;
    const numberBaseAdjustX = 15;
    const numberBaseAdjustY = 11;
    
    const crosshairStyle = createJobUsingRobotScreenController.generateStyle(position, crosshairBaseAdjustX, crosshairBaseAdjustY);
    const numberStyle = createJobUsingRobotScreenController.generateStyle(position, numberBaseAdjustX, numberBaseAdjustY);
    const crosshairTag = '<div class="crosshair adjustable '+color+'" style="'+crosshairStyle+'"></div>';
    const labelTag = '<div class="crosshair_label txt_wrapper adjustable '+color+'" style="'+numberStyle+'">'+numberString+'</div>';
    let selectionRingTag = "";
    if (createJobMenuController.handler.currentlyModifying === index) {
      const selectionRingBaseAdjustX = 2;
      const selectionRingBaseAdjustY = 2;
      const selectionRingStyle = createJobUsingRobotScreenController.generateStyle(position, selectionRingBaseAdjustX, selectionRingBaseAdjustY);
      selectionRingTag = '<div class="selection_ring adjustable" style="'+selectionRingStyle+'"></div>'
    }
    return crosshairTag + selectionRingTag + labelTag;
  },

  /**
   * 
   * @param {Vector} position 
   * @param {Number} baseAdjustX 
   * @param {Number} baseAdjustY 
   * @returns {String} (HTML)
   */
  generateStyle(position, baseAdjustX, baseAdjustY) {
    const query = $("#which-corner-visualiser #template_image");
    const imageHeight = query.height();
    const imageWidth = query.width();

    const adjustX = baseAdjustX + position.x * imageWidth;
    const adjustY = baseAdjustY + position.y * imageHeight;

    return  `top: ${adjustY}px; left: ${adjustX}px;`;
  },

  /**
   * 
   * @param {Number} index - Accepts integers
   * @param {String} color - Hex-color
   * @param {Vector} position 
   * @returns {String} (HTML)
   */
  createCrosshair(index, color, position) {
    const numberString = (index + 1).toString();
    const crosshairBaseAdjustX = 11;
    const crosshairBaseAdjustY = 11;
    const numberBaseAdjustX = 15;
    const numberBaseAdjustY = 11;
    
    const crosshairStyle = createJobUsingRobotScreenController.generateStyle(position, crosshairBaseAdjustX, crosshairBaseAdjustY);
    const numberStyle = createJobUsingRobotScreenController.generateStyle(position, numberBaseAdjustX, numberBaseAdjustY);
    const crosshairTag = '<div class="crosshair adjustable '+color+'" style="'+crosshairStyle+'"></div>';
    const labelTag = '<div class="txt_wrapper  adjustable '+color+'" style="'+numberStyle+'">'+numberString+'</div>';
    let selectionRingTag = "";
    if (createJobMenuController.handler.currentlyModifying === index) {
      const selectionRingBaseAdjustX = 2;
      const selectionRingBaseAdjustY = 2;
      const selectionRingStyle = createJobUsingRobotScreenController.generateStyle(position, selectionRingBaseAdjustX, selectionRingBaseAdjustY);
      selectionRingTag = '<div class="selection_ring adjustable" style="'+selectionRingStyle+'"></div>'
    }
    return crosshairTag + selectionRingTag + labelTag;
  },

  updateMapMarkers() {
    createJobUsingRobotScreenController.removeMapMarkers();
    Object.keys(createJobMenuController.handler.collectedPoints).forEach((key)=>{
      if (createJobMenuController.handler.collectedPoints[key]) {
        const point = createJobMenuController.handler.collectedPoints[key];
        const center = map_controller.background.robot_to_map([point.x, point.y]);
        const number = (parseInt(key) + 1);
        const addRing = (createJobMenuController.handler.currentlyModifying + 1) === number ? true : false;
        const marker = ol_markers.create_marker("marker_" + key, center, "numbered_marker", [number, "#02CC66", addRing]);
        marker.layer.setZIndex(1100000);
        createJobUsingRobotScreenController.mapMarkerLayers.push(marker.layer);
        map_controller.background.map.addLayer(marker.layer);
      }
    });
  },

  removeMapMarkers() {
    createJobUsingRobotScreenController.mapMarkerLayers.forEach((layer)=>{
      map_controller.background.map.removeLayer(layer);
    });
  },

  updatePreview() {
    createJobUsingRobotScreenController.removePreview();
    
    const projectionInfo = createJobMenuController.handler.getProjectionStringAndAlias();
        
    let previewJob = new pt[createJobMenuController.templateID](-1, createJobMenuController.handler.getJobName(), createJobMenuController.layoutMethodID).create();
    previewJob.projection = projectionInfo.string;
    previewJob.proj_alias = projectionInfo.alias;
    previewJob.points = createJobMenuController.handler.collectedPoints;
    if (previewJob.options.Rotation) {
      previewJob.options.Rotation.val = 3;
    }

    createJobUsingRobotScreenController.previewJob = previewJob;
    map_controller.background.draw_pitch(previewJob, Background.featureColor.ACTIVE, false);
  },

  removePreview() {
    if (createJobUsingRobotScreenController.previewJob
    && createJobUsingRobotScreenController.previewJob.pitch_layer) {
      createJobUsingRobotScreenController.previewJob.pitch_layer.remove();
    }
  }
}
