/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global message_controller, cordova, event_controller */

const screen_lock_controller = {
  _lockCheckIntervalHandler: null,
  _factoryTimeOut: 15, // Base timeout for the tablet is set to 15 seconds when it leaves the factory
  _automaticLockIsOn: null,
  inactivityCount: 0,

  get userVisibleTimeoutInManual() {
    return (this.timeoutSecondsInManual + this._factoryTimeOut);
  },

  get inManualString() {
    if (!screenTimeoutSettings[screen_lock_controller.timeoutSettingInManual]) {
      return translate["never"];
    }
    return translation.seconds2time(this.userVisibleTimeoutInManual, "short");
  },

  get timeoutSecondsInManual() {
    const seconds = screenTimeoutSettings[general_settings_screen.settings.screen_timeout_in_manual.val];
    return seconds - this._factoryTimeOut;
  },
  
  get timeoutSettingInManual() {
    return general_settings_screen.settings.screen_timeout_in_manual.val;
  },
  
  set timeoutSettingInManual(v) {
    general_settings_screen.settings.screen_timeout_in_manual.val = v;
  },
  
  get userVisibleTimeoutInAuto() {
    return (this.timeoutSecondsInAuto + this._factoryTimeOut);
  },

  get inAutoString() {
    if (!screenTimeoutSettings[screen_lock_controller.timeoutSettingInAuto]) {
      return translate["never"];
    }
    return translation.seconds2time(this.userVisibleTimeoutInAuto, "short");
  },

  get timeoutSecondsInAuto() {
    const seconds = screenTimeoutSettings[general_settings_screen.settings.screen_timeout_in_auto.val];
    return seconds - this._factoryTimeOut;
  },
  
  get timeoutSettingInAuto() {
    return general_settings_screen.settings.screen_timeout_in_auto.val;
  },
  
  set timeoutSettingInAuto(v) {
    general_settings_screen.settings.screen_timeout_in_auto.val = v;
  },
  
  get lowPowerString() {
    if (!lowPowerSettings[screen_lock_controller.lowPowerSetting]) {
      return translate["never"];
    }
    return translation.seconds2time(this.lowPowerSeconds, "short");
  },

  get lowPowerSeconds() {
    return lowPowerSettings[general_settings_screen.settings.low_power.val];
  },

  get lowPowerSetting() {
    return general_settings_screen.settings.low_power.val;
  },

  set lowPowerSetting(v) {
    general_settings_screen.settings.low_power.val = v;
  },
  
  updateScreenTimeoutInManual() {
    $("#general_settings_screen #screen_timeout_in_manual").val(general_settings_screen.settings.screen_timeout_in_manual.val);
    $("#general_settings_screen #screen_timeout_in_manual_value").text(screen_lock_controller.inManualString);
  },

  updateScreenTimeoutInAuto() {
    $("#general_settings_screen #screen_timeout_in_auto").val(general_settings_screen.settings.screen_timeout_in_auto.val);
    $("#general_settings_screen #screen_timeout_in_auto_value").text(screen_lock_controller.inAutoString);
  },

  updateLowPowerSlider() {
    $("#general_settings_screen #low_power_seconds").val(general_settings_screen.settings.low_power.val);
    $("#general_settings_screen #low_power_seconds_value").text(screen_lock_controller.lowPowerString);
  },

  resetInactivityCount() {
    screen_lock_controller.inactivityCount = 0;
    if (screen_lock_controller._automaticLockIsOn) {
      screen_lock_controller.unlockScreen(false, false)
    }
  },

  lockScreen() {
    if (screen_lock_controller._automaticLockIsOn) {
      return false;
    }
    if(window.screenLocker) {
      screen_lock_controller._automaticLockIsOn = true;
      window.screenLocker.lock(()=>{}, ()=>{});
      console.log("Automatic screen lock ON");
    }
    return true;
  },

  /**
   * @param {Boolean} resetTimer - Whether to set the inactivityCount to 0.
   * @param {Boolean} force - Whether to unlock the screen even if it is already unlocked.
   * @returns {Boolean} - True if the screen was unlocked.
   */
  unlockScreen(resetTimer=false, force=false) {
    if (!screen_lock_controller._automaticLockIsOn && !force) {
      return false;
    }
    if (resetTimer) {
      screen_lock_controller.inactivityCount = 0;
    }
    if(window.screenLocker) {
      screen_lock_controller._automaticLockIsOn = false;
      window.screenLocker.unlock(()=>{}, ()=>{});
      console.log("Automatic screen lock OFF");
    }
    return true;
  },

  backgroundModeOn() {
    if(window.cordova && cordova.plugins && cordova.plugins.backgroundMode) {
      cordova.plugins.backgroundMode.enable();
    }
  },
  
  lockCheck() {
    screen_lock_controller.inactivityCount += 1;
    
    if (lowPowerSettings[screen_lock_controller.lowPowerSetting]
    &&  screen_lock_controller.inactivityCount > screen_lock_controller.lowPowerSeconds
    &&  robot_controller.state_top === TopStates.MANUAL
    &&  !run_pitch_controller.saved_progress) {
      lowPowerModeController.enterLowPowerMode();
    }
    else {
      if (robot_controller.state_top === TopStates.AUTOMATIC) {
        if (screenTimeoutSettings[screen_lock_controller.timeoutSettingInAuto]
        &&  screen_lock_controller.inactivityCount >= screen_lock_controller.timeoutSecondsInAuto) {
            screen_lock_controller.lockScreen();
          }
      }
      
      if (robot_controller.state_top === TopStates.MANUAL
      || robot_controller.state_top === TopStates.UNDEFINED) {
        if (screenTimeoutSettings[screen_lock_controller.timeoutSettingInManual]
        &&  screen_lock_controller.inactivityCount >= screen_lock_controller.timeoutSecondsInManual) {
          screen_lock_controller.lockScreen();
        }
      }
    }
  },

  startLockCheckInterval() {
    screen_lock_controller._lockCheckIntervalHandler = new IntervalHandler(
      "Screen lock check interval",
      screen_lock_controller.lockCheck, 
      window,
      1, 
      1000
    );
    screen_lock_controller._lockCheckIntervalHandler.start();
  },

  initializeOnStartup() {
    screen_lock_controller.unlockScreen(true, true);
    screen_lock_controller.backgroundModeOn();
    screen_lock_controller.startLockCheckInterval();
  }
};

$(()=>{
  screen_lock_controller.updateScreenTimeoutInManual();
  screen_lock_controller.updateScreenTimeoutInAuto();
  screen_lock_controller.updateLowPowerSlider();

  document.ontouchstart = screen_lock_controller.resetInactivityCount;
  
  document.addEventListener("resume", ()=>{
    screen_lock_controller.unlockScreen(true, true);
  }, false );

  event_controller.add_callback("app_server_connection_lost", ()=>{
    console.warn("Unlocking screen due to connection loss");
    screen_lock_controller.unlockScreen(true, true);
  });

  event_controller.add_callback("on_system_diag_change", ()=>{
    if(robot_controller.state_top  === TopStates.ERROR_HARD
    || robot_controller.state_top  === TopStates.ERROR_USER_WAIT
    || robot_controller.state_top  === TopStates.ERROR_SOFT) {
      screen_lock_controller.unlockScreen(true, true);
    }
  });

  event_controller.add_callback("marking_done", ()=>{
    screen_lock_controller.unlockScreen(false, true);
  });

  event_controller.add_callback("tablet_offline", ()=>{
    screen_lock_controller.unlockScreen(true, true);
  });
  
  event_controller.add_callback("paint_indicator_warning", ()=>{
    screen_lock_controller.unlockScreen(true, true);
  });

  $("#general_settings_screen #screen_timeout_in_manual").attr({
    "min": general_settings_screen.settings.screen_timeout_in_manual.min,
    "max":general_settings_screen.settings.screen_timeout_in_manual.max,
    "step": general_settings_screen.settings.screen_timeout_in_manual.step
  });

  $("#general_settings_screen #screen_timeout_in_auto").attr({
    "min": general_settings_screen.settings.screen_timeout_in_auto.min,
    "max":general_settings_screen.settings.screen_timeout_in_auto.max,
    "step": general_settings_screen.settings.screen_timeout_in_auto.step
  });

  $("#general_settings_screen #low_power_seconds").attr({
    "min": general_settings_screen.settings.low_power.min,
    "max":general_settings_screen.settings.low_power.max,
    "step": general_settings_screen.settings.low_power.step
  });
});
