const sprayToolUtilitiesController = {
  isPriming: false,
  isPrimed: false,
  primingTime: 10,
  primingTimeout: null,
  isTesting: false,
  sprayTestInterval: null,
  sprayTestTimeout: null,
  
  primePump() {
    this.isPriming = true;

    sprayToolUtilitiesScreenController.drawPrimePumpButton();
    sprayToolUtilitiesScreenController.disableCleaningButton();
    sprayToolUtilitiesScreenController.disableMeasureButton();

    this.primingTimeout = setTimeout(()=>{
      robot_controller.pump(false);
      this.isPriming = false;
      this.isPrimed = true;
      sprayToolUtilitiesScreenController.drawPrimePumpButton();
      sprayToolUtilitiesScreenController.enableCleaningButton();
      sprayToolUtilitiesScreenController.enableTestSprayButton()
      sprayToolUtilitiesScreenController.enableMeasureButton();
    }, this.primingTime * 1000);
    robot_controller.pump(true);
  },
  cancelPrimingPump() {
    robot_controller.pump(false);
    this.isPriming = false;
    clearTimeout(this.primingTimeout);
    sprayToolUtilitiesScreenController.drawPrimePumpButton();
    sprayToolUtilitiesScreenController.enableCleaningButton();
    sprayToolUtilitiesScreenController.enableMeasureButton();
  },

  togglePriming() {
    if(this.isPriming) {
      this.cancelPrimingPump();
    }
    else {
      this.primePump();
    }
  },

  startTestSpray() {
    if (!this.isTesting) {
      this.isTesting = true;
      sprayToolUtilitiesScreenController.drawTestSprayButton();
      sprayToolUtilitiesScreenController.disableCleaningButton();
      sprayToolUtilitiesScreenController.disablePrimePumpButton();
      sprayToolUtilitiesScreenController.disableMeasureButton();
      robot_controller.pump(true);
      robot_controller.spray(2000);
      clearInterval(this.sprayTestInterval);
      this.sprayTestInterval = setInterval(()=>{
        robot_controller.spray(2000);
      }, 1000);
    }
  },

  stopTestSpray(keepPumpOn=false) {
    if (!this.isTesting) {
      return;
    }
    this.isTesting = false;
    sprayToolUtilitiesScreenController.drawTestSprayButton();
    sprayToolUtilitiesScreenController.enableCleaningButton();
    sprayToolUtilitiesScreenController.enablePrimePumpButton();
    sprayToolUtilitiesScreenController.enableMeasureButton();
    clearInterval(this.sprayTestInterval);
    this.sprayTestInterval = null;
    robot_controller.spray(1);
    if (!keepPumpOn) {
      robot_controller.pump(false);
    }
  },

  toggleTestSpray() {
    if (SETTINGS.test_spray_until_manual_stop) {
      if (this.isTesting) {
        this.stopTestSpray();
        return true; // RETURN
      }
      if (robot_controller.robot_has_capability("platform_pump") && !this.isPrimed) {
          const options = {header: translate["headerPumpUnprimed"],
                          body: translate["bodyPumpUnprimed"],
                          ok_text: translate["OK"],
                          ok_callback: popup_screen_controller.close}
                          popup_screen_controller.confirm_popup_with_options(options);
          return false; // RETURN
      }
      // FALL-THROUGH
      this.startTestSpray();
      return true; // RETURN
    }
    else {
      if(!this.isTesting) {
        robot_controller.spray( robot_behaviour_settings_screen.user_params.waypoint_spray_duration.current * 1000 );
        sprayToolUtilitiesController.isTesting = true;
        sprayToolUtilitiesScreenController.drawTestSprayButton();
        sprayToolUtilitiesController.sprayTestTimeout = setTimeout(()=>{
          sprayToolUtilitiesController.isTesting = false;
          sprayToolUtilitiesScreenController.drawTestSprayButton();
        }, robot_behaviour_settings_screen.user_params.waypoint_spray_duration.current * 1000 );
      }
      else {
        clearTimeout(sprayToolUtilitiesController.sprayTestTimeout);
        robot_controller.spray( 1 );
        sprayToolUtilitiesController.isTesting = false;
        sprayToolUtilitiesScreenController.drawTestSprayButton();
      }
    }
  },
}
