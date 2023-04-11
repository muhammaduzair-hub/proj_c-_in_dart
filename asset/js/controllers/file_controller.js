/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global cordova, robot_controller, communication_controller, event_controller, blue, map_controller, settings_screeen_controller, popup_screen_controller, file_loader_screen, translate, SETTINGS, permission_controller, login_screen_controller */


$( document ).ready( function( )
{
  document.getElementById( "file-input-field" ).onclick = function( )
  {
    file_controller.opening_filepicker = true;
  };
  document.getElementById( "file-input-field" ).onchange = file_controller.fileInput;
} );


var file_controller = {
  pluginFileOpenerIsActive: false,
  loading_multiple_files: false,
  fileInput: function()
  {
    setTimeout( function()
    {
      file_controller.opening_filepicker = false;
    }, 1000 );
    if( this.files.length > 1 )
    {
      file_controller.loading_multiple_files = true;
    }
    else {
      file_controller.loading_multiple_files = false;
    }
    Object.values( this.files ).forEach( function( file )
    {
      popup_screen_controller.open_info_waiter( translate["Importing file"], "" );
      setTimeout( function()
      {
        file_loader_screen.process_file( file, file_loader_screen.file_loaded_callback );
      }, 1 );
    } );
    document.getElementById( "file-input-field" ).value = "";
  },
  load_file: function( file_loader, file_entry, callback, showerror = false )
  {

    if( !file_loader )
      file_loader = file_controller.load_job_file;
    var file_read = function()
    {
      const reader = new FileReader();
      reader.readAsText( file_entry );
      reader.onload = function( e )
      {
        try
        {
          file_loader( file_entry, callback, e.target.result );
          popup_screen_controller.close_info_waiter();
        }
        catch( e )
        {
          uncaughtErrorSend( e.stack ? e.stack : e );
          console.error( e );
          var diag_header = translate["ErrorDiagFileHeader"];
          var diag_body = translate["ErrorDiagFileBody"];
          if(showerror || AppType === APP_TYPE.TinySurveyor)
            diag_body += "<br><br>" + translate["Error: %1s"].format(e);
          popup_screen_controller.confirm_popup( diag_header, diag_body, translate["OK"], undefined, function()
          {
            popup_screen_controller.close();
          } );
        }
      };
    };
    if( file_entry.size > 10 * 1024 * 1024 )
    {
      // Show warning
      popup_screen_controller.confirm_popup( translate["Warning"], translate["FileSizeWarningText"], translate["OK"], translate["Cancel"], function()
      {
        popup_screen_controller.close();
        file_read();
      }, function()
      {
        popup_screen_controller.close();
        return;
      } );
    }
    else
    {
      file_read();
    }
  },
  requirements: {
    NONE: "none",
    ROBOT_ONLINE: "robot_online",
    PROJECTION_SET: "projection_set"
    // Add requirements as needed
  },
  mimeTranslations: {
    // csv: "text/csv",
    csv: "text/*", // "text/csv" not recognized by android
    // dxf: "application/dxf",
    dxf: "application/*", // "application/dxf" not recognized by android
    // geo: "application/geo+json",
    geo: "application/*", // "application/geo+json" not recognized by android
    // prj: "application/octet-stream",
    prj: "application/*", // "application/octet-stream" not recognized by android
    svg: "image/svg+xml",
    xml: "text/xml"
  },
  filePreProcessor(requirements) {
    if (requirements.includes("none")) {
      return true;
    }
    if (requirements.includes("robot_online") && !robot_controller.chosen_robot_last_online_state) {
      popup_screen_controller.confirm_popup( translate["HeaderNoConnectedRobot"], translate["BodyNoConnectedRobot"], translate["Ok"], "", ()=>{
        popup_screen_controller.close()
      });
      return false;
    }
    if (requirements.includes("projection_set") && !robot_controller.chosen_robot.proj_string) {
      let options = {}
      options.header = translate["HeaderSelectValidProjection"];
      options.body = translate["BodySelectValidProjection"];
      options.ok_text = translate["Go to %1s"].format(translate["Edit projections"]);
      options.ok_callback = openProjections;
      options.cancel_text = translate["Cancel"];
      options.cancel_callback = popup_screen_controller.close;
      options.cancel_class = "red";
      popup_screen_controller.confirm_popup_with_options(options);
      return false;
    }
    // Add clauses as needed

    function openProjections() {
      settings_screeen_controller.open();
      settings_screeen_controller.choose_menu( 'position_settings_header', 'position_settings_screen' );
      popup_screen_controller.close();
    }

    return true;
  },

  fileExtensionNotSupported() {
    let options = {
      header: translate["HeaderUnsupportedFormat"], 
      body: translate["BodyUnsupportedFormat"], 
      ok_text: translate["OK"],
      ok_callback: popup_screen_controller.close
    };
    popup_screen_controller.confirm_popup_with_options(options);
    console.log('File format not supported in this context');
  },

  async pluginFileOpener(legalExtensions, fileLoader, fileLoadedCallback) {
    file_controller.pluginFileOpenerIsActive = true;
    const file = await chooser.getFile();
    file_controller.pluginFileOpenerIsActive = false;

    if (file) {
      let extension = file.name.split(".").last();
      if (legalExtensions.includes(extension.toLowerCase())) {
        let translated = translator(file);
        let data = decoder(file.dataURI);
        
        console.log('Opening file: ',file ? file.name : "Canceled");

        try {
          fileLoader(translated, fileLoadedCallback, data);  
        } catch (error) {
          console.log(error);
          console.log("FILE: ", file);
        }
      }
      else {
        file_controller.fileExtensionNotSupported();
      }
    }
    else {
      console.log("No file chosen");
    }

    popup_screen_controller.close_info_waiter();    

    // Saved in case we change our minds regarding MIME-types
    function mimeSelector(legalExtensions) { 
      let mimeString = "";
      const lngth = legalExtensions.length;
      for (let i = 0; i < lngth; i++) {
        mimeString += file_controller.mimeTranslations[legalExtensions[i]];
        if (i < lngth-1) {
          mimeString += ",";
        }
      }
      console.log("RESULT: ", mimeString, " (", typeof(mimeString), ")");
      return mimeString;
    }
    function decoder(dataURI) {
      try{
        const encoded = dataURI.split(",").last();
        const decoded = decodeURIComponent(escape(window.atob(encoded)));
        return decoded;
      }catch(e){
        popup_screen_controller.confirm_popup( translate["HeaderUnsupportedFormat"], translate["BodyUnsupportedFormat"] + "\n" + e, translate["Ok"], "", popup_screen_controller.close );
        popup_screen_controller.close_info_waiter();
      }
    }
    function translator(rawFile) {
      return {
        name: rawFile.name,
      }
    }
  },

  load_job_file: function(file_entry, callback, data) {
    const {filename, ext} = file_controller.getFileNameAndExtension(file_entry);
    
    const id = map_controller.background.jobs.nextImportID;
          
    if(!file_controller.can_load(ext)) {
      file_controller.fileExtensionNotSupported();
      return false;
    }
    const file_jobs = file_controller.load[ext]( id, filename, data );
    file_jobs.forEach(job=>job.source = JobSource.USB);

    if(callback) {
      callback( file_jobs );
    }
    return true;
  },

  can_load: function( ext )
  {
    switch( ext )
    {
      case "dxf":
      case "xml":
      case "csv":
      case "geo":
      case "svg":
        return file_controller.load[ext];
        break;
      default:
        return false;
        break;
    }
  },
  load: {
    dxf: function( id, name, data )
    {
      var jobs = [ ];
      if( SETTINGS.split_usb_jobs )
      {
        var tasks = dxf.load( data );
        var layers = [ ];
        tasks.forEach( ( entities ) =>
        {
          if( layers.indexOf( entities[0].layer ) < 0 )
            layers.push( entities[0].layer );
        } );
        var i = 0;
        var layer_indexes = {};
        tasks.forEach( function( entities )
        {
          if( !layer_indexes[entities[0].layer] )
            layer_indexes[entities[0].layer] = 0;
          layer_indexes[entities[0].layer]++;
          if( layers.length > 1 )
            var entity_name = translate["Layer"] + " " + entities[0].layer + ", " + translate["Entity"] + " " + layer_indexes[entities[0].layer];
          else
            var entity_name = translate["Entity"] + " " + layer_indexes[entities[0].layer];
          var dxf_job = new dxf_parser( id - i, entity_name, "", entities );
          dxf_job.template_type = name;
          dxf_job.draw();
          jobs.push( dxf_job );
          i++;
        } );
        return jobs;
      }
      else
      {
        var dxf_job = new dxf_parser( id, name, data );
        dxf_job.draw();
        return dxf_job;
      }
    },
    xml: function( id, name, data )
    {
      var landxml_job = new landxml_parser( id, name, data );
      landxml_job.draw();
      return [ landxml_job ];
    },
    csv: function( id, name, data )
    {
      var csv_job = new csv_parser( id, name, data ).toPointJob();
      csv_job.draw();
      return [ csv_job ];
    },
    geo: function( id, name, data )
    {
      var geo_job = new geo_parser( id, name, data ).toPointJob();
      geo_job.draw();
      return [ geo_job ];
    },
    svg: function( id, name, data )
    {
      const svg_file = new svg_parser( id, name );
      svg_file.parseString(data);
      if(!svg_file.projection)
      {
        svg_file.projection = robot_controller.chosen_robot.projection;
      }
      var lnglat_map_center = map_controller.background.get_map_center_lnglat();
      var proj_string = svg_file.projection;
      var new_center = ProjectorForward( proj_string, lnglat_map_center );
      var new_center_v = new Vector( new_center[0], new_center[1] );
      svg_file.points = [ new_center_v ];
      svg_file.draw();

      if( file_controller.loading_multiple_files && map_controller.background.jobs.containsImportedJobs )
      {
        var last_job = map_controller.background.jobs.lastImportedJob;
        svg_file.points[0] = last_job.points[0];
        svg_file.points[0] = svg_file.points[0].add( new Vector( last_job.options.Width.val / 2 + svg_file.options.Width.val / 2, 0 ) );
        svg_file.draw();
      }

      return [ svg_file ];
    }
  },
  getFilenameFromPath: function( path )
  {
    var filename = path.split( "\\" );
    return filename[filename.length - 1];
  },
  getExtension: function( filename )
  {
    var parts = filename.split( "." );
    return parts[parts.length - 1].toLowerCase();
  },
  getFileNameAndExtension: function( file_entry )
  {
    var filename = file_controller.getFilenameFromPath( file_entry.name );
    var ext = file_controller.getExtension( filename );
    return {
      filename: filename,
      ext: ext
    };
  },
  getDir( path, recursive, callback )
  {
    if( !window.resolveLocalFileSystemURL )
    {
      callback( {
        children: [ ]
      } );
      return;
    }
    window.resolveLocalFileSystemURL( path,
      function( fileSystem )
      {
        fileSystem.children = [ ];
        var reader = fileSystem.createReader();
        reader.readEntries( function( entries )
        {
          var i = -1;
          function oneDone()
          {
            i++;
            if( i === entries.length )
            {
              callback( fileSystem );
            }
          }

          entries.forEach( function( entry )
          {
            if( entry.isDirectory && recursive )
            {
              file_controller.getDir( entry.nativeURL, recursive, function( new_entry )
              {
//                console.log( new_entry );
                oneDone();
              } );
            }
            else
            {
              fileSystem.children.push( entry ); // <----- Only adds files to children, flattened
              oneDone();
            }
          } );
          oneDone();
        }, function()
        {
          callback( {
            children: [ ]
          } );
        } );
      }, function()
    {
      callback( {
        children: [ ]
      } );
    } );
  },
  findUSB: function( callback )
  {
    file_controller.getDir( "file:///storage/", false, function( folders )
    {

      const illegal_dirs = [ "emulated", "enc_emulated", "self" ];
      var result = folders.children.filter( function( entry )
      {
        return illegal_dirs.indexOf( entry.name ) === -1;
      } );
      callback( result );
    } );
  },
  getFiles( dirEntry )
  {
    var files = [ ];
    dirEntry.children.forEach( function( entry )
    {
      if( entry.isDirectory )
      {
        //files = files.concat( file_controller.getFiles( entry ) );
      }
      else
      {
        entry.ext = file_controller.getExtension( entry.name );
        files.push( entry );
      }
    } );
    return files;
  },
  readUSB: function( callback, depth )
  {
    if( !depth )
      depth = 0;
    permission_controller.getPermission( "READ_EXTERNAL_STORAGE", function( hasPermission )
    {
      if( hasPermission )
      {

        file_controller.findUSB( function( usbs )
        {
          if( usbs.length )
          {
            let all = [ ];
            let i = 0;


            const cb = function( f )
            {
              all = all.concat( f );
              if( ++i >= usbs.length )
                callback( all );
            };

            usbs.forEach( ( usb ) => {
              file_controller.getDir( usb.nativeURL, true, function( usbEntry )
              {
                cb( file_controller.getFiles( usbEntry ) );
              } );
            } );

          }
          else
          {
            callback( [ ] );
          }
        } );
      }
      else
      {
        if( depth === 0 )
        {
          file_controller.readUSB( function( files, error )
          {
            callback( files, error );
          }, depth + 1 );
        }
        else
        {
          console.log( "permission not given" );
          callback( [ ], "permission not given" );
        }
      }
    } );
  },
  getValidFiles: function( callback )
  {
    if( !file_loader_screen.legal_endings || file_loader_screen.legal_endings.length === 0 )
      file_loader_screen.legal_endings = Object.keys( file_controller.load );

    let files = [ ];
    file_controller.readUSB( function( tmpfiles )
    {
      files = files.concat( tmpfiles );

      file_controller.readLocal( function( tmpfiles )
      {
        files = files.concat( tmpfiles );


        files = files.filter( function( file )
        {
          file.uuid = "file_" + guid();
          var end = file.name.toLowerCase().split( "." );
          end = end[end.length - 1];
          return file_loader_screen.legal_endings.indexOf( end ) >= 0;
        } );

        callback( files );
      } );
    } );
  },
  getScreenshots: function( callback )
  {
    file_controller.getDir( "file:///storage/emulated/0/DCIM/Screenshots", false, dir => {
      var screenshots = dir.children.filter( entry => {
        return entry.isFile && entry.name.startsWith( "Screenshot_" );
      } );
      screenshots = screenshots.sort_objects( "name" );
      /*
       Screenshot_20200429-150348_TinyMobileRobots.jpg
       Screenshot_20200423-143215_TinyMobileRobots.jpg
       */

      callback( screenshots );
    } );
  },
  writeUSB: function( name, data, successCallback, errorCallback, append )
  {
    console.warn( "THIS METHOD IS NOT SUPPORTED IN Android > Q" );
    file_controller.findUSB( function( usbs )
    {
      usbs.forEach( usb => {
        file_controller.writePath( usb.nativeURL, name, data, successCallback, errorCallback, append );
      } );
    } );
  },
  writeLocal: function( name, data, successCallback, errorCallback, append )
  {
    if( !window.cordova )
      errorCallback( "No cordova" );

    file_controller.getTMRDirectory( function()
    {
      const path = cordova.file.externalRootDirectory + file_controller.tmr_directory_name;
      file_controller.writePath( path, name, data, successCallback, errorCallback, append );
    }, file_controller.errorHandler );
  },
  writePath: function( path, name, data, successCallback, errorCallback, append = false)
  {
    permission_controller.getPermission( "WRITE_EXTERNAL_STORAGE", function( hasPermission )
    {
      if( hasPermission )
      {

        window.resolveLocalFileSystemURL( path, function( dirEntry )
        {
          file_controller.createFile( dirEntry, name, data, successCallback, errorCallback, append );
        } );
      }
      else
      {
        console.log( "permission not given" );
        callback( [ ], "permission not given" );
      }
    } );
  },
  readLocal: function( callback, depth )
  {
    if( !depth )
      depth = 0;
    permission_controller.getPermission( "READ_EXTERNAL_STORAGE", function( hasPermission )
    {
      if( hasPermission )
      {

        file_controller.getTMRDirectory( function( dirEntry )
        {
          file_controller.getDir( dirEntry.nativeURL, true, function( usbEntry )
          {
            const all = file_controller.getFiles( usbEntry );
            callback( all );
          } );
        } );
      }
      else
      {
        if( depth === 0 )
        {
          file_controller.readLocal( function( files, error )
          {
            callback( files, error );
          }, depth + 1 );
        }
        else
        {
          console.log( "permission not given" );
          callback( [ ], "permission not given" );
        }
      }
    } );
  },
  tmr_directory_name: "TinyMobileRobots",
  getTMRDirectory: function( successCallback, errorCallback )
  {
    if( !window.cordova )
      errorCallback( "No cordova" );

    window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( dirEntry )
    {
      dirEntry.getDirectory( file_controller.tmr_directory_name, {
        create: true
      }, function( newDirEntry )
      {
        successCallback( newDirEntry );
      }, errorCallback );
    } );
  },
  createTMRDirectory: function( successCallback, errorCallback )
  {
    file_controller.getTMRDirectory( function( dirEntry )
    {
      file_controller.createFile( dirEntry, ".init", "" );
      successCallback();
    }, errorCallback );
  },
  initDirectory: function()
  {
    try
    {
      file_controller.createTMRDirectory( function()
      {
        console.log( "Created TinyMobileRobots directory" );
      }, file_controller.errorHandler );
    }
    catch( e )
    {
      console.warn( e );
    }
  },
  createFile: function( dirEntry, fileName, dataObj, successCallback, errorCallback, isAppend )
  {
    if( !errorCallback )
      errorCallback = file_controller.errorHandler;

    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile( fileName, {
      create: true,
      exclusive: true
    }, function( fileEntry )
    {
      file_controller.writeFile( fileEntry, dataObj, successCallback, errorCallback, isAppend );
    }, function( e )
    {
      try
      {
        file_controller.errorHandler( e );
      }
      catch( e2 )
      {
        errorCallback( e2 );
      }
    } );

  },
  writeFile: function( fileEntry, dataObj, successCallback, errorCallback, isAppend )
  {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter( function( fileWriter )
    {

      fileWriter.onwriteend = function()
      {
        console.log( "Successful file read...", fileEntry );
        if( successCallback )
          successCallback( fileEntry );
      };

      fileWriter.onerror = function( e )
      {
        console.log( "Failed file read: " + e.toString() );
        if( errorCallback )
          errorCallback( e.toString() );
      };

      // If we are appending data to file, go to the end of the file.
      if( isAppend )
      {
        try
        {
          fileWriter.seek( fileWriter.length );
        }
        catch( e )
        {
          console.log( "file doesn't exist!" );
        }
      }
      fileWriter.write( dataObj );
    } );
  },
  errorHandler( e )
  {
    if( e.code )
    {
      let error = file_controller.errorCodeLookup( e.code );
      if(e.code === 12)
        console.warn("FileError",error.code, error.constant);
      else
        throw new FileError( error );
    }
    else
      throw e;
  },
  errorCodes: {
    1: "NOT_FOUND_ERR",
    2: "SECURITY_ERR",
    3: "ABORT_ERR",
    4: "NOT_READABLE_ERR",
    5: "ENCODING_ERR",
    6: "NO_MODIFICATION_ALLOWED_ERR",
    7: "INVALID_STATE_ERR",
    8: "SYNTAX_ERR",
    9: "INVALID_MODIFICATION_ERR",
    10: "QUOTA_EXCEEDED_ERR",
    11: "TYPE_MISMATCH_ERR",
    12: "PATH_EXISTS_ERR"
  },
  errorCodeLookup( code )
  {
    return {
      "code": code,
      "constant": file_controller.errorCodes[code]
    };
  },
  readFile: function( fileEntry, callback )
  {
    fileEntry.file( function( file )
    {
      var reader = new FileReader();
      reader.onloadend = function()
      {
        console.log( "Successful file read: " + this.result );
        if( callback )
          callback( this.result );
      };
      reader.readAsText( file );
    }, file_controller.errorHandler );
  },
  sendFile: function( filePath )
  {
    /*
     topic == "new_file":
     filename = msg["data"]["filename"]
     filedata = msg["data"]["filedata"]
     */

    window.resolveLocalFileSystemURL( filePath, function( fileEntry )
    {
      file_controller.readFile( fileEntry, function( fileData )
      {
        if( fileData )
        {
          console.log( "file is read" );
          var filename = filePath.split( "/" );
          filename = filename[filename.length - 1];
          file_controller.sendData( filename, fileData );
        }
      } );
    }, file_controller.errorHandler );
  },
  last_sender: null,
  sendData: function( filename, fileData )
  {

    var sender = new BigFileSender( filename, fileData, function()
    {
      console.log( "done sending" );
    } );
    sender.start();
    file_controller.last_sender = sender;
    //communication_controller.send( 'new_file', {robot: robot_controller.chosen_robot_id, filename: filename, filedata: fileData}, "all", 10 );
  },
  test_send: function( i )
  {
    file_controller.getValidFiles( function( files )
    {
      file_controller.sendFile( files[i].nativeURL );
    } );
  }
};
var BIG_FILE_SENDER_SIZE_LIMIT = 1024 * 10;
class BigFileSender
{
  static get SIZE_LIMIT()
  {
    //return 51200; // 50 Kb
    //return 1024 * 10; // 10 kb
    return BIG_FILE_SENDER_SIZE_LIMIT;
  }
  static get DELAY()
  {
    return 10; // 0.1 sec
    //return 100; // 0.1 sec
  }

  constructor( filename, filedata, doneCallback )
  {
    this.filename = filename;
    this.fileSize = filedata.length;
    this.packagesSent = 0;
    this.totalParts = Math.ceil( this.fileSize / BigFileSender.SIZE_LIMIT );
    console.log( "Sending ", this.totalParts, " parts" );
    this.filedata = filedata;
    this.doneCallback = doneCallback;
  }
  getPart()
  {
    var dataToSend = this.filedata.substring( 0, BigFileSender.SIZE_LIMIT );
    this.filedata = this.filedata.substring( BigFileSender.SIZE_LIMIT );
    return dataToSend;
  }
  partSuccessfullySend( respData )
  {

    if( respData.filename === this.filename )
    {
      //console.log( respData, this );

      if( this.filedata.length )
      {
        this.packagesSent++;
        this.sendNext();
        this.splitTime = new Date();
        var time = (this.splitTime - this.start); // Seconds
        var dataLeft = this.filedata.length; // bytes
        var dataSend = this.fileSize - dataLeft; // bytes
        var speed = dataSend / (time / 1000.0); // byte/second
        var timeLeft = dataLeft / speed; // seconds
        console.log( " ", this.packagesSent, "/", this.totalParts, ", file split time ", Math.round( time / 10 ) / 100, " seconds, Thats ", Math.round( speed / 10.24 ) / 100, " KiloBytes/second, estimated time left: ", timeLeft.round( 100 ), " seconds" );
      }
      else
      {

        event_controller.remove_callback( "new_file", "partSuccessfullySend", this );
        event_controller.remove_callback( "append_file", "partSuccessfullySend", this );
        event_controller.add_callback( "bluetooth_sending_enabled", "bluetooth_sending_is_enabled", this );
        robot_controller.enable_robot_bluetooth_sending();
      }
    }
  }
  start()
  {
    this.start = new Date();
    console.log( "sending first chunk" );
    event_controller.add_callback( "new_file", "partSuccessfullySend", this );
    event_controller.add_callback( "append_file", "partSuccessfullySend", this );
    console.log( blue.socketId );
    if( blue.socketId <= 0 )
    {
      var self = this;
      setTimeout( function()
      {
        self.start.apply( self, [ ] );
      }, 1000 );
    }
    else
    {
      event_controller.add_callback( "bluetooth_sending_disabled", "bluetooth_sending_is_disabled", this );
      robot_controller.disable_robot_bluetooth_sending();
    }
  }
  bluetooth_sending_is_disabled()
  {
    event_controller.remove_callback( "bluetooth_sending_disabled", "bluetooth_sending_is_disabled", this );
    console.log( "sending the first part" );
    communication_controller.send( 'new_file', {
      part: 0,
      totalParts: this.totalParts,
      robot: robot_controller.chosen_robot_id,
      filename: this.filename,
      filedata: this.getPart()
    }, "any", 10 );
  }
  bluetooth_sending_is_enabled()
  {
    this.doneCallback.apply( this, [ ] );
    event_controller.remove_callback( "bluetooth_sending_enabled", "bluetooth_sending_is_enabled", this );
    this.end = new Date();
    var time = (this.end - this.start);
    console.log( " ", Math.round( (this.fileSize / 10.24) ) / 100, "Kb file uploaded in ", Math.round( time / 600 ) / 100, " minutes, Thats ", ((this.fileSize / 1024.0) / (time / 1000.0)).round( 2 ), " KiloBytes/second" );
  }
  sendNext()
  {
    var this_class = this;
    setTimeout( function()
    {
      console.log( "sending next chunk" );
      communication_controller.send( 'append_file', {
        part: this_class.packagesSent,
        totalParts: this_class.totalParts,
        robot: robot_controller.chosen_robot_id,
        filename: this_class.filename,
        filedata: this_class.getPart()
      }, "any", 10 );
    }, BigFileSender.DELAY );
  }
  cancel()
  {
    event_controller.remove_callback( "new_file", "partSuccessfullySend", this );
    event_controller.remove_callback( "append_file", "partSuccessfullySend", this );
  }
};
Object.freeze(file_controller.errorCodes);
Object.freeze(file_controller.requirements);
Object.freeze(file_controller.mimeTranslations);