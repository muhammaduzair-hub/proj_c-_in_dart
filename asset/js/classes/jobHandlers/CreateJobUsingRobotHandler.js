class CreateJobUsingRobotHandler extends CreateJobHandler {
    constructor(templateID, layoutMethodID) {
        super(templateID, layoutMethodID);
        this.dummyTemplate = new NullJob();
        this.collectedPoints = [];
        this.currentlyModifying = 0;
        this.slowModeIsOn = false;
        this.actions = [];
    }
        
    get canRecollect() {
        return false;
    }
       
    begin() {
        this.determinePointsToCollect();
        this.setNewActive();
        createJobMenuScreenController.close();
        createJobUsingRobotScreenController.open(
            this.cancel.bind(this), 
            this.toggleSlow.bind(this), 
            this.previousPoint.bind(this),
            this.prepareCollect.bind(this),
            this.nextPoint.bind(this),
            this.askToUndo.bind(this),
            this.done.bind(this)
        );
    }

    resume() {
        createJobUsingRobotScreenController.open(
            this.cancel.bind(this), 
            this.toggleSlow.bind(this), 
            this.previousPoint.bind(this),
            this.prepareCollect.bind(this),
            this.nextPoint.bind(this),
            this.askToUndo.bind(this),
            this.done.bind(this)
        );
        createJobUsingRobotScreenController.updateCornerVisualizer();
        createJobUsingRobotScreenController.updateMapMarkers();
        if (this.allPointsAreCollected()) {
            createJobUsingRobotScreenController.updatePreview();
            createJobUsingRobotScreenController.toggleButtonOn("done", true);
        }
    }

    determinePointsToCollect() {
        const layoutMethod = pt[this.templateID].layout_methods[this.layoutMethodID];
        let amountPoints;

        if(layoutMethod instanceof LayoutMethod) {
            amountPoints = layoutMethod.number_of_points;
        }
        else {
            amountPoints = layoutMethod;
        }

        for (let i = 0; i < amountPoints; i++) {
            this.collectedPoints[i] = null;
        }
    }

    setNewActive() {
        const projectionInfo = createJobMenuController.handler.getProjectionStringAndAlias();
        let newActive = new pt[createJobMenuController.templateID](-1, createJobMenuController.handler.getJobName(), createJobMenuController.layoutMethodID).create();    
        newActive.projection = projectionInfo.string;
        newActive.proj_alias = projectionInfo.alias;
        if (newActive.options.Rotation) {
            newActive.options.Rotation.val = 3;
        }
        this.dummyTemplate = newActive;
    }

    cancel() {
        popup_screen_controller.confirm_popup(translate["Are you sure you want to cancel"], "", translate["Yes"], translate["No"], yes.bind(this), no.bind(this));

        function no() {
            popup_screen_controller.close("#confirm_popup");
        }
        
        function yes() {
            this.alwaysOnExit();
            bottom_bar_chooser.choose_bottom_bar();
            popup_screen_controller.close("#confirm_popup");
            createJobMenuController.reset();
            createJobUsingRobotScreenController.close();
        }
    }

    alwaysOnExit() {
        createJobUsingRobotScreenController.removePreview();
        this.turnSlowModeOff();
    }
    
    toggleSlow() {
        if (this.slowModeIsOn) {
            this.turnSlowModeOff();
        }
        else {
            this.turnSlowModeOn();
        }
    }

    turnSlowModeOn() {
        this.slowModeIsOn = true;
        joystick_controller.use_slow_speed = true;
        $("#create-new-pitch-get-corner #toggle_slow_button").addClass("green");
    }

    turnSlowModeOff() {
        this.slowModeIsOn = false;
        joystick_controller.use_slow_speed = false;
        $("#create-new-pitch-get-corner #toggle_slow_button").removeClass("green");
    }

    previousPoint() {
        const highestIndex = this.collectedPoints.length - 1;

        if (this.currentlyModifying === 0) {
            this.currentlyModifying = highestIndex;
        }
        else {
            this.currentlyModifying -= 1;
        }

        createJobUsingRobotScreenController.updateCornerVisualizer();
        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    nextPoint() {
        const highestIndex = this.collectedPoints.length - 1;

        if (this.currentlyModifying === highestIndex) {
            this.currentlyModifying = 0;
        }
        else {
            this.currentlyModifying += 1;
        }

        createJobUsingRobotScreenController.updateCornerVisualizer();
        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    nextUncollectedPoint() {
        if (!this.allPointsAreCollected()) {
            this.nextPoint();
            if (this.collectedPoints[this.currentlyModifying]) {
                this.nextUncollectedPoint();
            }
        }
    }

    prepareCollect() {
        if (this.allPointsAreCollected()) {
            this.askToRecollect();
        }
        else {
            this.waitForPositionThenCollect();
        }
    }

    askToRecollect() {
        const labelNumber = parseInt(this.currentlyModifying) + 1;
        const headerText = translate["Recollect"];
        const bodyText = translate["bodyAskToRecollect"].format(labelNumber);

        popup_screen_controller.confirm_popup(headerText, bodyText, translate["Yes"], translate["No"], yes, no);

        function no() {
            popup_screen_controller.close("#confirm_popup");
        }
        
        function yes() {
            popup_screen_controller.close("#confirm_popup");
            createJobMenuController.handler.waitForPositionThenCollect();
        }
    }

    waitForPositionThenCollect() {
        popup_screen_controller.open_info_waiter( translate["Waiting for position from robot"], "", "", true);        
        event_controller.add_callback("got_robot_position", this.collect.bind(this));
    }
    
    collect() {
        event_controller.remove_callback("got_robot_position", this.collect.bind(this));
        popup_screen_controller.close_info_waiter();
        
        let position = this.robotPosition();
        if (position) {
            const index = this.currentlyModifying;
            const oldVector = this.collectedPoints[index];

            if (this.isLayingOutAGoalPost()) {
                position = this.correctForGoalPost(position);
            }

            this.collectedPoints[index] = position;
            this.actions.push(new CollectAction(index, oldVector, position));
        }
        else {
            throw "Unknown robot position while collecting point!";
        }
        
        if (this.allPointsAreCollected()) {
            createJobUsingRobotScreenController.updateCornerVisualizer();
            createJobUsingRobotScreenController.updateMapMarkers();
            createJobUsingRobotScreenController.updatePreview();
        }
        else {
            this.nextUncollectedPoint();
        }
        createJobUsingRobotScreenController.updateButtons();
    }

    isLayingOutAGoalPost() {
        if (this.layoutMethodID === "all_goal_posts") {
            return true;
        }
        else {
            let postIDs;
            if (this.layoutMethodID === "all_corners,all_goal_posts") {
                postIDs = [1, 2, 5, 6];
            }
            else if (this.layoutMethodID === "single_post") {
                postIDs = [0, 1];
            }
            else {
                postIDs = [];
            }

            if (postIDs.includes(this.currentlyModifying)) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    /**
     * @param {Vector} position 
     * @returns {Vector} A vector position transformed backwards from the robot (paint nozzle)
     */
    correctForGoalPost(position) {
        const postThickness = this.dummyTemplate.options.goalPoleWidth ? this.dummyTemplate.options.goalPoleWidth.val : ASSUMED_POST_THICKNESS;
        const distance = 0.5 * postThickness + ROBOT_DISTANCE_NOZZLE_TO_FRAME_REAR;
        const robotT = robot_controller.chosen_robot.t;
        const unitVector = new Vector(1, 0).rotate(robotT + Math.PI);
        position = position.add(unitVector.multiply(distance));

        return position;
    }

    askToUndo() {
        if (this.actions.length === 0) {
            return false;
        }

        const action = this.actions.last();

        const labelNumber = parseInt(action.index) + 1;
        const headerText = translate["undo"];
        const bodyText = translate["bodyAskToUndo"].format(labelNumber);

        popup_screen_controller.confirm_popup(headerText, bodyText, translate["Yes"], translate["No"], yes, no);

        function no() {
            popup_screen_controller.close("#confirm_popup");
        }
        
        function yes() {
            popup_screen_controller.close("#confirm_popup");
            createJobMenuController.handler.undo(action);
        }
    }

    /**
     * @param {CollectAction} action 
     */
    undo(action) {
        this.collectedPoints[action.index] = action.oldVector;

        this.actions.pop();

        if (this.allPointsAreCollected()) {
            createJobUsingRobotScreenController.updatePreview();
        }
        else {
            createJobUsingRobotScreenController.removePreview();
            createJobUsingRobotScreenController.toggleButtonOff("done");
        }

        createJobUsingRobotScreenController.updateCornerVisualizer();
        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    robotPosition() {
        if (robot_controller.chosen_robot.online) {
            return robot_controller.chosen_robot.pos;
        }
        return null;
    }

    allPointsAreCollected() {
        let result = true;
        Object.keys(this.collectedPoints).forEach((key)=>{
            if (this.collectedPoints[key] === null) {
                result = false;
            }
        });
        return result;
    }

    done() {
        event_controller.add_callback("create_db_job_done", saved.bind(this));
        event_controller.add_callback("save_db_job_done", saved.bind(this));


        this.alwaysOnExit();

        this.dummyTemplate.points = this.collectedPoints;
        if (this.dummyTemplate.options.Rotation) {
            this.dummyTemplate.options.Rotation.val = 3;
        }
        this.setActive(this.dummyTemplate);
        this.saveJob();

        function saved() {
            event_controller.remove_callback("create_db_job_done", saved.bind(this));
            event_controller.remove_callback("save_db_job_done", saved.bind(this));

            createJobUsingRobotScreenController.close();
        }
    }
}