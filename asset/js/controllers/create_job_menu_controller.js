
const createJobMenuController = {
  templateID: '',
  layoutMethodID: '',
  chosenFeatureGroup: null, // -1 is "all", -2 is "file",
  handler: null,

  get defaultChosenGroup() {
    return AppType === APP_TYPE.TinySurveyor && createJobMenuController.hasAccessToImport() ? -2 : -1;
  },

  uniqueAvailableFeatureGroups(ignoreTheseIDs = []) {
    const fetched = templateshop_controller.template_groups;
    let uniqueAvailableGroups = [];
    let addedIDs = [];
    fetched.forEach((templateGroup)=>{
      if (!addedIDs.includes(templateGroup.id)
      && !ignoreTheseIDs.includes(templateGroup.id)
      &&  templateGroup.owned
      &&  templateGroup.templategroup) {
        uniqueAvailableGroups.push(templateGroup);
        addedIDs.push(templateGroup.id);
      }
    });
    return uniqueAvailableGroups;
  },

  hasAccessToImport() {
    return file_loader_screen.legalExtensions.length > 0 ? true : false;
  },

  begin() {
    createJobMenuController.reset();
    projection_controller.set_zone_on_next_gps();
    popup_screen_controller.close();
    createJobMenuScreenController.open();
  },

  reset() {
    if (!createJobMenuController.chosenFeatureGroup) {
      createJobMenuController.chosenFeatureGroup = createJobMenuController.defaultChosenGroup;
    }
    createJobMenuController.templateID = '';
    createJobMenuController.layoutMethodID = '';
    createJobMenuController.handler = null;
  },

  toString() {
    return `Template: ${this.templateID}, Method: ${this.layoutMethodID}, Group: ${this.chosenFeatureGroup}, Handler: ${this.handler}`
  },

  chooseFeatureGroup(newID) {
    createJobMenuController.templateID = "";
    createJobMenuController.layoutMethodID = "";

    const oldID = createJobMenuController.chosenFeatureGroup;

    createJobMenuController.chosenFeatureGroup = newID;
    createJobMenuScreenController.updateFeatureGroupMenu(oldID);
  },

  chooseTemplate(templateID) {
    if (templateID === createJobMenuController.templateID) {
      return;
    }

    createJobMenuController.layoutMethodID = "";
    const oldID = createJobMenuController.templateID;
    createJobMenuController.templateID = templateID;

    const methodKeys = Object.keys(pt[createJobMenuController.templateID].layout_methods);
    const desiredMethod = methodKeys.length === 1 ? methodKeys[0] : "";

    if (createJobMenuController.layoutMethodAvailable(desiredMethod)) {
      createJobMenuController.layoutMethodID = desiredMethod;
    }
    
    createJobMenuScreenController.updateJobMenu(oldID);
  },

  chooseLayoutMethod(method) {
    if (createJobMenuController.layoutMethodAvailable(method)) {
      const oldMethod = createJobMenuController.layoutMethodID;
      createJobMenuController.layoutMethodID = createJobMenuController.revertLayoutMethodHTMLID(method);
      createJobMenuScreenController.updateLayoutMethodMenu(oldMethod);
      return true;
    }
    else {
      createJobMenuController.layoutMethodID = "";
      if (!communication_controller.appServerConnection.connected) {
        createJobMenuScreenController.setTimedMessage("No server connection");
      }
      else if (!robot_controller.chosen_robot.online) {
        createJobMenuScreenController.setTimedMessage("No connection to the robot");
      }
      else if (!robot_controller.joystickControlLinkExists) {
        createJobMenuScreenController.setTimedMessage("Not connected to bluetooth");
      }
      return false;
    }
  },

  layoutMethodAvailable(method) {
    if (method === "fixed" || method === "") {
        return true;
    }
    else if (communication_controller.appServerConnection.connected) {
        if (robot_controller.chosen_robot.online
        && robot_controller.joystickControlLinkExists) {
            return true;
        }
        else if (method === "free_hand") {
            return true;
        }
    }
    return false;
  },

  revertLayoutMethodHTMLID(htmlLayoutMethodID) {
    return htmlLayoutMethodID.replace("-", ",");
  },

  createJob() {
    if (!createJobMenuController.userInputOK()) {
      return;
    }

    if (!createJobMenuController.templateVisible(createJobMenuController.templateID))  {
      settings_screeen_controller.show_template(createJobMenuController.templateID);
      if (settings_screeen_controller.chosen_menu_item === "templateshop_screen_header") {
        settings_screeen_controller.choose_menu('templateshop_screen_header', 'templateshop_screen');
      }
    }

    if (createJobMenuController.chosenFeatureGroup !== -2) {
      if (createJobMenuController.layoutMethodID === "free_hand") {
        createJobMenuController.handler = new CreateJobOnMapHandler(createJobMenuController.templateID, createJobMenuController.layoutMethodID);
      }
      else {
        if (createJobMenuController.layoutMethodID === "n_ends") {
        createJobMenuController.handler = new CreateNPointsJobUsingRobotHandler(createJobMenuController.templateID, createJobMenuController.layoutMethodID);

        }
        else {
          createJobMenuController.handler = new CreateJobUsingRobotHandler(createJobMenuController.templateID, createJobMenuController.layoutMethodID);
        }
      }
    }
    else {
      createJobMenuController.handler = new ImportJobHandler(createJobMenuController.templateID, createJobMenuController.layoutMethodID);
    }

    createJobMenuScreenController.close();
    createJobMenuController.handler.begin();
  },

  importHelper() { //TODO: DELETE THIS WHEN FLOW COMPLETE
    const cadGroup = templateshop_controller.get_group_by_id(28);
    const cadTemplates = cadGroup ? cadGroup.templates : [];
    const svgGroup = templateshop_controller.get_group_by_id(29);
    const svgTemplates = svgGroup ? svgGroup.templates : [];
    const toggleTheseOn = cadTemplates.concat(svgTemplates);

    toggleTheseOn.forEach((templateID)=>{
      if (!createJobMenuController.templateVisible(templateID)) {
        templateshop_controller.toggle_template(templateID);
      }
    });
    file_loader_screen.importHelper();
  },

  userInputOK() {
    let checkedOK = true;
    if (createJobMenuController.chosenFeatureGroup !== -2) {
      if (createJobMenuController.templateID === "") {
        createJobMenuScreenController.blink("job_selection_menu");
        checkedOK = false;
      }
      else if (createJobMenuController.layoutMethodID === "") {
        createJobMenuScreenController.blink("layout_method_selection_menu");
        checkedOK = false;
      }
    }

    return checkedOK;
  },

  templateVisible(templateID) {
    if (settings_screeen_controller.template_hidden(templateID)) {
      return false;
    }
    return true;
  },

  layOutUsingRobot() {
    createJobMenuController.collectedPoints = [];
    pitch_generator.active = new pt[createJobMenuController.templateID]( -1, createJobMenuController.getJobName(), createJobMenuController.layoutMethodID ).create();
    pitch_generator.active.projection = robot_controller.chosen_robot.projection;
    pitch_generator.active.proj_alias = robot_controller.chosen_robot.proj_alias;

    if( pitch_generator.active.options.Rotation ) {
      pitch_generator.active.options.Rotation.val = 3; // TODO: WHY?! - Because of legacy code; rotating pitches during layout using robot
    }
    
    createJobMenuController.change_bottom_bar();
    createJobMenuController.update_corner_visualiser();
    event_controller.add_callback( "got_robot_position", createJobMenuController.draw_point_markers );
    createJobMenuScreenController.closeAndEnterLayoutWithRobot();

  },

  getJobName() {
    const queryString = "#create_job_popup #job_name";
    return $(queryString).val() ? $(queryString).val() : $(queryString).prop("placeholder");
  },

  goBack() {
      createJobMenuController.remove_pitch();
      createJobMenuController.remove_corner_visualiser();
      createJobMenuController.remove_point_markers();
      createJobMenuScreenController.open(false);
  },

  askToCancel: function()
  {
    popup_screen_controller.confirm_popup( translate["Are you sure you want to cancel"], "", translate["Yes"], translate["no"], 
    ()=>{
      // yes
      createJobMenuController.cancel();
      popup_screen_controller.close( "#confirm_popup" );
    }, 
    ()=>{
      //no
      popup_screen_controller.close( "#confirm_popup" );
    } );
  },
  cancel: function( )
  {
    createJobMenuController.remove_pitch();
    event_controller.remove_callback( "got_robot_position", createJobMenuController.draw_point_markers );
    createJobMenuController.remove_corner_visualiser();
    createJobMenuController.remove_point_markers();
    pitch_generator.reset();
  }
};

$(()=>{
  function updateHelper() {
    if (createJobMenuScreenController.isOpen
    &&  !robot_controller.joystickControlLinkExists
    &&  createJobMenuController.layoutMethodID !== "free_hand"
    &&  createJobMenuController.layoutMethodID !== "fixed") {
      createJobMenuController.chooseLayoutMethod("");
    }
  }
  event_controller.add_callback("chosen_robot_online_changed", updateHelper);
});