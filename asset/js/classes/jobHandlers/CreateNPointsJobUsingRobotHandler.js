class CreateNPointsJobUsingRobotHandler extends CreateJobUsingRobotHandler {
    constructor(templateID, layoutMethodID) {
        super(templateID, layoutMethodID);
    }

    begin() {
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
        createJobUsingRobotScreenController.closeCornerVisualizer();
    }

    prepareCollect() {
        if (this.collectedPoints[this.currentlyModifying]) {
            this.askToRecollect();
        }
        else {
            this.waitForPositionThenCollect();
        }
    }

    collect() {
        event_controller.remove_callback("got_robot_position", this.collect.bind(this));
        popup_screen_controller.close_info_waiter();
        
        const position = this.robotPosition();
        if (position) {
            const index = this.currentlyModifying;
            const oldVector = this.collectedPoints[index];
            this.collectedPoints[index] = position;
            this.actions.push(new CollectAction(index, oldVector, position));
            this.nextUncollectedPoint();
        }
        else {
            throw "Unknown robot position while collecting point!";
        }

        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    undo(action) {
        if (action.oldVector) {
            this.collectedPoints[action.index] = action.oldVector;
            this.currentlyModifying = action.index;
        }
        else {
            this.collectedPoints.splice(action.index, 1);
            this.nextUncollectedPoint();
        }

        this.actions.pop();

        if (!this.allPointsAreCollected()) {
            createJobUsingRobotScreenController.toggleButtonOff("done");
        }

        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    nextPoint() {
        const highestIndex = this.collectedPoints.length - 1;
        
        if (this.currentlyModifying > highestIndex) {
            this.currentlyModifying = 0;
        }
        else {
            this.currentlyModifying += 1;
        }

        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    nextUncollectedPoint() {
        this.currentlyModifying = this.collectedPoints.length;
        
        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }

    previousPoint() {
        const highestIndex = this.collectedPoints.length - 1;

        if (this.currentlyModifying === 0) {
            this.currentlyModifying = highestIndex + 1;
        }
        else {
            this.currentlyModifying -= 1;
        }
        createJobUsingRobotScreenController.updateMapMarkers();
        createJobUsingRobotScreenController.updateButtons();
    }


    allPointsAreCollected() {
        if (this.collectedPoints.length > 0) {
            return true;
        }
        return false;
    }

    isLayingOutAGoalPost() {
        return false;
    }

    alwaysOnExit() {
        this.turnSlowModeOff();
    }
}