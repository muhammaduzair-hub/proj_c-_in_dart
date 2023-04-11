class CreateJobHandler {
    constructor(templateID, layoutMethodID) {
        this.layoutMethodID = layoutMethodID;
        this.templateID = templateID;
    }

    get canRecollect() {
        return false;
    }

    begin() {
        throw "CreateJobHandler does not know how to proceed!";
    }
      
    getJobName() {
        const queryString = "#create_job_popup #job_name";
        return $(queryString).val() ? $(queryString).val() : $(queryString).prop("placeholder");
    }

    getProjectionStringAndAlias() {
        const useChosenProjectionTLM = !general_settings_screen.settings.automatic_choose_projection.val && robot_controller.chosen_robot.projection;
        const useChosenProjectionTS = (SETTINGS.use_chosen_projection_on_create_job && robot_controller.chosen_robot.projection || totalstation_controller.totalstation_in_use);
        
        let projectionString;
        let projectionAlias;

        if (useChosenProjectionTLM || useChosenProjectionTS) {
            projectionString = robot_controller.chosen_robot.proj_string;
            projectionAlias = robot_controller.chosen_robot.projection;
        }
        else {
            const lngLatMapCenter = map_controller.background.get_map_center_lnglat();
            projectionString = projection_controller.lnglat2UTMProjString( lngLatMapCenter );
            projectionAlias = projection_controller.lnglat2UTMAlias( lngLatMapCenter );
        }
        return {string: projectionString, alias: projectionAlias}
    }

    setActive(newActive) {
        pitch_generator.active.name = this.getJobName().trim();
        pitch_generator.active = newActive;
    }
    
    saveJob() {
        event_controller.add_callback("db_jobs_list_updated", done.bind(this));

        // All jobs created with the robot should be cloud savable

        const headerText = AppType === APP_TYPE.TinyLineMarker ? translate["Saving pitch"] : translate["Saving job"];
        const options = {
            header: headerText,
            spinner: true,
        }
        pop_generator.create_popup_with_options(options);
        this.sendToCloud();

        function done() {
            if(!pitch_generator.active.new_job) {
              pitch_generator.set_active_from_db_job_id(pitch_generator.active.id);
            }
            pitch_generator.reselect();

            event_controller.remove_callback("db_jobs_list_updated", done.bind(this));
            
            pop_generator.close();
        }
    }

    sendToCloud() {
        const job = pitch_generator.active;
        const msg = {
            name: job.name, 
            template: job.template_id,
            build_extra: job.get_build_extra(),
            generated: [ ]
        };

        let topic = "create_db_job";

        if (job.id > 0) {
            msg.id = job.id;
            topic = "save_db_job";
        }
        console.log(topic, msg);
        communication_controller.send(topic, msg, "cloud");
    }
}