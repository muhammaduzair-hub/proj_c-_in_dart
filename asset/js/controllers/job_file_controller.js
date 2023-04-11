const jobFileController = {
    pluginFileOpenerIsActive: false,
    loadedFile: null,

    get userHasAccess() {
      
    },



    loadFile() {
        if( window.cordova && device) {
            try {
              let allOk = file_controller.filePreProcessor(requirements);
              if (allOk) {
                popup_screen_controller.open_info_waiter( translate["Importing file"], "" );
                file_controller.pluginFileOpener(legal_endings, file_loader, file_loaded_callback);
              }
            } 
            catch (error) {
              console.log(error);
            }
        }
        else {
          $( "#file-input-field" ).attr( "accept", file_loader_screen.legal_endings.map( e => `.${e}` ).join( ',' ) );
          javascript:document.getElementById( 'file-input-field' ).click();
        }
    },

    async pluginFileLoader() {
        file_controller.pluginFileOpenerIsActive = true;
        const file = await chooser.getFile();
        file_controller.pluginFileOpenerIsActive = false;

        if (file) {
          console.log(file);
        }
        else {
          console.warn("JobFileController failed to load file");
        }
    },

    processLoadedFile() {

    },

    createJob() {
        console.log("CREATING JOB FROM FILE");
    }
}