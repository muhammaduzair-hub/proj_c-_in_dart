const lowPowerModeController = {

    enterLowPowerMode() {
        if (window.cordova) {
            blue.disconnect();
            communication_controller.closeAppServerConnectionWithoutReconnecting();
            screen_lock_controller.lockScreen(false, true);
            document.location.href = "lowpower.html";
        }
    },

    setLanguage() {
        let language = null;
        if(typeof Storage !== "undefined" ) {
            language = localStorage.getItem( "language" );
        }
        if(!language) {
            language = "en";
        }
        translation.set_language(language);
    },

    setPhrase() {
        const infoPhrase = translate["Low power mode, click anywhere to continue."];
        console.log(infoPhrase);
        $('#info_lbl').html(infoPhrase);
    },

    wakeFromLowPowerMode() {
        const loadPhrase = translate["Loading"] + "..."
        $('info_lbl').html(loadPhrase);
        document.location.href = "index.html";
    }
}
