
class RecollectUsingRobotHandler extends CreateJobUsingRobotHandler{
    constructor(job) {
        super(job.template_id, null);
        this.job = job;
        this.collectedPoints = this.jobPoints;
        this.handler = null;
        this.currentlyModifying = 0;
    }
    
    get templateID() {
        return this.job.template_id;
    }

    set templateID(_) {
        // DO NOTHING
    }

    get layoutMethodID() {
        if (this.job.options.original_points
        &&  this.job.options.original_points.val !== "") {
            return this.job.options.original_points.val.layout_method;
        }
        else {
            return this.job.layout_method;
        }
    }

    set layoutMethodID(_) {
        // DO NOTHING
    }

    get jobPoints() {
        if (this.job.options.original_points 
        &&  this.job.options.original_points.val !== "") {
            return this.convertOriginalPointsToVectorList(this.job.options.original_points.val.points);
        }
        else {
            return this.job.points;
        }
    }

    get canRecollect() {
        if (this.job instanceof MultiJob) {
            return false;
        }
        if (this.layoutMethodID === "free_hand" 
        ||  this.layoutMethodID === "fixed") {
            return false;
        }
        if (!robot_controller.joystickControlLinkExists) {
            return false;
        }
        return true;
    }

    convertOriginalPointsToVectorList(originalPoints) {
        let result = [];

        Object.keys(originalPoints).forEach((key)=>{
            const point = originalPoints[key];
            const vector = new Vector(point.x, point.y);
            result.push(vector);
        });
        return result;
    }

    resume() {
        pitch_generator.active.pitch_layer.remove();
        pitch_generator.original.pitch_layer.remove();
        this.setCreateJobMenuController();

        createJobUsingRobotScreenController.open(
            this.cancel.bind(this), 
            this.toggleSlow.bind(this), 
            this.previousPoint.bind(this),
            this.askToRecollect.bind(this),
            this.nextPoint.bind(this),
            this.askToUndo.bind(this),
            this.done.bind(this)
        );
        createJobUsingRobotScreenController.toggleButtonOn("done", true);
        createJobUsingRobotScreenController.updateCornerVisualizer();
        createJobUsingRobotScreenController.updateMapMarkers();
        if (this.layoutMethodID !== "n_ends") {
            createJobUsingRobotScreenController.updatePreview();
        }
        createJobUsingRobotScreenController.updateButtons();

        return true;
    }

    cancel() {
        popup_screen_controller.confirm_popup(translate["Are you sure you want to cancel"], "", translate["Yes"], translate["No"], yes.bind(this), no.bind(this));

        function no() {
            popup_screen_controller.close("#confirm_popup");
        }
        
        function yes() {
            this.alwaysOnExit();
            popup_screen_controller.close("#confirm_popup");
            createJobMenuController.reset();
            pitch_generator.reselect();
            createJobUsingRobotScreenController.close();
        }
    }
 
    done() {
        this.alwaysOnExit();
        let modifiedJob = this.job.copy();
        modifiedJob.id = pitch_generator.active.id;
        modifiedJob.layout_method = this.layoutMethodID;
        modifiedJob.points = this.collectedPoints;
        this.setActive(modifiedJob);
        this.saveJob();
        createJobUsingRobotScreenController.close();
    }
    
    setCreateJobMenuController() {
        createJobMenuController.templateID = this.templateID;
        createJobMenuController.layoutMethodID = this.layoutMethodID;
        createJobMenuController.handler = this;
    }

    getJobName() {
        return this.job.name;
    }
}