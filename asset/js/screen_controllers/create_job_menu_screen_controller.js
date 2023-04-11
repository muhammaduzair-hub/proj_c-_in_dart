const createJobMenuScreenController = {
    isOpen: false,
    ignoreFeatureGroups: [28, 29],
    timedMessageSet: false,
    
    open(resetCreateJobMenu=true) {
        createJobMenuScreenController.isOpen = true;
        if (resetCreateJobMenu) {
            createJobMenuController.reset();
        }
        popup_screen_controller.open( "#create_job_popup", true );
        createJobMenuScreenController.setFlowMessage();
        createJobMenuScreenController.populateFeatureGroupMenu();
        createJobMenuScreenController.populateJobMenu();
        createJobMenuScreenController.populateLayoutMethodMenu();
        createJobMenuScreenController.updateCreateButton();
    },

    close() {
        createJobMenuScreenController.isOpen = false;
        bottom_bar_chooser.choose_bottom_bar();
        popup_screen_controller.close();
    },

    closeAndEnterLayoutWithRobot() {
        createJobMenuScreenController.isOpen = false;
        popup_screen_controller.close();
    },

    populateFeatureGroupMenu() {
        const menuIDString = "#create_job_popup #feature_group_selection_menu";
        $(menuIDString).empty();

        let menuItemsHTML = "";
        
        if (createJobMenuController.hasAccessToImport()) {
            menuItemsHTML += createJobMenuScreenController.createImportFeatureGroupButton();
        }
        menuItemsHTML += createJobMenuScreenController.createFeatureGroupMenuItem(-1, translate["all"]);

        const templateGroups = createJobMenuScreenController.preparedFeatureGroups(createJobMenuController.uniqueAvailableFeatureGroups(createJobMenuScreenController.ignoreFeatureGroups));
        
        templateGroups.forEach((group)=>{
            menuItemsHTML += createJobMenuScreenController.createFeatureGroupMenuItem(group.id, group.name);
        });
        $(menuIDString).html(menuItemsHTML);
        createJobMenuScreenController.updateFeatureGroupMenu();
    },
    
    updateFeatureGroupMenu(toggleOff="") {
        if (toggleOff !== "") {
            $("#" + toggleOff + ".feature_group_menu_item").removeClass("chosen");
        }
        
        const toggleOn = createJobMenuController.chosenFeatureGroup;
        $("#" + toggleOn + ".feature_group_menu_item").addClass("chosen");

        if (toggleOn === -2) {
             $("#create_job_popup #job_name_wrapper").addClass("gone");
        }
        else {
            $("#create_job_popup #job_name_wrapper").removeClass("gone");
        }
        
        createJobMenuScreenController.populateJobMenu();
        createJobMenuScreenController.updateJobMenu();
    },

    createFeatureGroupMenuItem(id, name) {
        const itemHTML = '<div id="'+id+'" class="feature_group_menu_item tile txt_wrapper" onclick="createJobMenuController.chooseFeatureGroup('+id+')"><p>'+name+'</p></div>'
        return itemHTML;
    },

    createImportFeatureGroupButton() {
        const imageString = '<img src="img/icons/open_folder.svg">'
        const itemHTML = '<div id="-2" class="feature_group_menu_item tile img_wrapper" onclick="createJobMenuController.chooseFeatureGroup('+-2+')">'+imageString+'</div>'
        return itemHTML;
    },

    populateJobMenu() {
        let featureGroups = createJobMenuController.uniqueAvailableFeatureGroups(createJobMenuScreenController.ignoreFeatureGroups);
        let html = "";

        if (createJobMenuController.chosenFeatureGroup === -2) {
            html += createJobMenuScreenController.createImportMenuItem();
        }
        else {
            if (createJobMenuController.chosenFeatureGroup !== -1) {
                featureGroups = featureGroups.filter(group=>group.id === createJobMenuController.chosenFeatureGroup);
            }
            featureGroups.forEach((group)=>{
                html += createJobMenuScreenController.createFeatureGroup(group);
            });
        }
        $("#create_job_popup #job_selection_menu").html(html);
        createJobMenuScreenController.populateLayoutMethodMenu();
        createJobMenuScreenController.updateJobMenu();
    },

    preparedFeatureGroups(featureGroups) {
        let preparedFeatureGroups = [];
        let addedFileGroup = false;

        featureGroups.forEach((group)=>{
            if (group.id !== 26 && group.id !== 28 && group.id !== 29) {
                preparedFeatureGroups.push({id: group.id, name: group.name});
            }
            else if (!addedFileGroup){
                preparedFeatureGroups.push({id: -2, name: translate["Import"]});
                addedFileGroup = true;
            }
        });

        preparedFeatureGroups = preparedFeatureGroups.sort((a, b)=>a.name.localeCompare(b.name));
        return preparedFeatureGroups
    },

    updateJobMenu(toggleOff) {
        if (toggleOff !== "") {
            $("#" + toggleOff + ".selection_menu_item").removeClass("chosen");
        }
        const toggleOn = createJobMenuController.templateID;
        if (toggleOn !== "") {
            $("#" + toggleOn + ".selection_menu_item").addClass("chosen");
        }
        
        createJobMenuScreenController.populateLayoutMethodMenu();
        createJobMenuScreenController.updateJobNamePlaceholder();
        createJobMenuScreenController.updateCreateButton();
        createJobMenuScreenController.setFlowMessage();
    },

    createFeatureGroup(featureGroup) {
        const templates = featureGroup.templates;
        const showType = showTypeOnItem();
        let html = "";



        templates.forEach((template)=>{
            html += createJobMenuScreenController.createJobMenuItem(pt[template], showTypeOnItem());
        });

        return html;


        function showTypeOnItem() {
            if (createJobMenuController.chosenFeatureGroup === -1) {
                return true;
            }
            const checkAgainst = pt[templates[0]].template_type;
            for (const template of templates) {
                if (pt[template].template_type !== checkAgainst) {
                    return true;
                }
            }

            return false;
        }
    },

    createImportMenuItem() {
        let openTagHTML;
        
        if (SETTINGS.import_default_save_to_cloud 
        &&  !communication_controller.appServerConnection.connected) {
            // Disabled
            openTagHTML = `<div id="open_file_button" class="import_feature_menu_item tile txt_wrapper disabled" onclick="createJobMenuScreenController.setTimedMessage('No server connection')">`;
        }
        else {
            // Enabled
            openTagHTML = '<div id="open_file_button" class="import_feature_menu_item tile txt_wrapper" onclick="createJobMenuController.createJob()">';
        }
        const labelHTML = '<h1>'+translate["clickToOpenFile"]+'</h1>';
        const closeTagHTML = '</div>';
    
        return openTagHTML + labelHTML + closeTagHTML;
    },

    createJobMenuItem(templateObject, showType) {
        const id = templateObject.template_id;
        const imageURL = templateObject.template_image;
        const templateType = templateObject.template_type;
        const templateTitle = templateObject.template_title;


        let type = "";
        let title = "";
        
        if (templateTitle && templateTitle !== "") {
            title = translate[templateTitle];
        }

        if (showType) {
            type = translate[templateType];
        }

        const openTagHTML = '<div id="'+id+'" class="selection_menu_item tile" onclick="createJobMenuController.chooseTemplate(\'' + id + '\')">'
        const openTextWrapperHTML = '<div class="txt_wrapper">';
        const typeHTML = '<p>'+type+'</p>';
        const titleHTML = '<p>'+title+'</p>';
        const closeTextWrapperHTML = '</div>'
        const imageHTML = '<div class="img_wrapper"><img src="'+imageURL+'" alt="Template"></div>';
        const closeTagHTML = '</div>';
    
        return openTagHTML + openTextWrapperHTML + typeHTML + titleHTML + closeTextWrapperHTML + imageHTML + closeTagHTML;
    },

    populateLayoutMethodMenu() {
        $("#create_job_popup #layout_method_selection_menu").empty();
        const template = pt[createJobMenuController.templateID];
        if (!template) {
            return;
        }
        
        const layoutMethods = template.layout_methods;
        const templateImage = template.template_image;
        const keys = Object.keys(layoutMethods);
        let html = "";

        if (keys.includes("free_hand")) {
            html += createJobMenuScreenController.createLayoutMenuItem("free_hand", "img/icons/pin_drop.svg", true, false);
        }
        if (keys.includes("fixed")) {
            html += createJobMenuScreenController.createLayoutMenuItem("fixed", "img/icons/explore.svg", false, false);
        }

        keys.forEach((key)=>{
            if (key !== "free_hand" && key !== "fixed") {
                if (layoutMethods[key] instanceof LayoutMethod) {
                    html += createJobMenuScreenController.createLayoutMenuItem(key, templateImage, true, true, layoutMethods[key]);
                }
                else {
                    html += createJobMenuScreenController.createLayoutMenuItem(key, templateImage, true, true, null);
                }
            }
        });

        $("#create_job_popup #layout_method_selection_menu").html(html);
        createJobMenuScreenController.populateLayoutMethodPointMarkers(template);
        createJobMenuScreenController.updateLayoutMethodMenu();
    },

    updateLayoutMethodMenu(toggleOff="") {
        if (toggleOff !== "") {
            $("#" + createJobMenuScreenController.generateLayoutMethodHTMLID(toggleOff) + ".selection_menu_item").removeClass("chosen");
        }
        const toggleOn = createJobMenuController.layoutMethodID;
        if (toggleOn !== "") {
            $("#" + createJobMenuScreenController.generateLayoutMethodHTMLID(toggleOn) + ".selection_menu_item").addClass("chosen");
        }
        createJobMenuScreenController.updateCreateButton();
        createJobMenuScreenController.setFlowMessage();
    },

    createLayoutMenuItem(layoutMethodID, iconURL, disableIfNoServer=true, disableIfNoRobot=true, layoutMethodObject=null) {
        let openTagHTML = null;
        const modifiedLayoutMethodID = createJobMenuScreenController.generateLayoutMethodHTMLID(layoutMethodID);

        let methodTitle = "";
        if (layoutMethodObject) {
            methodTitle = translate[layoutMethodObject.name];
        }
        else {
            methodTitle = this.createLayoutMethodTitle(layoutMethodID);
        }

        if(createJobMenuScreenController.shouldDisable(disableIfNoServer, disableIfNoRobot)) {
            //Button is disabled
            openTagHTML = '<div id="'+modifiedLayoutMethodID+'" class="disabled selection_menu_item tile" onclick="createJobMenuController.chooseLayoutMethod(\'' + modifiedLayoutMethodID + '\')">';
        }
        else {
            //Button is enabled
            openTagHTML = '<div id="'+modifiedLayoutMethodID+'" class="selection_menu_item tile" onclick="createJobMenuController.chooseLayoutMethod(\'' + modifiedLayoutMethodID + '\')">';
        }

        const openTextWrapperHTML = '<div class="txt_wrapper">';
        const methodHTML = '<p>'+methodTitle+'</p>';
        const closeTextWrapperHTML = '</div>'
        const openImagesHTML = '<div id="images">'
        const markerWrapperHTML = '<div class="marker_wrapper"></div>'
        const imageHTML = '<div class="img_wrapper"><img id="layout_img_'+modifiedLayoutMethodID+'" src="'+iconURL+'" alt="Template"></div>';
        const closeImagesHTML = '</div>';
        const closeTagHTML = '</div>'

        return openTagHTML + openTextWrapperHTML + methodHTML + closeTextWrapperHTML + openImagesHTML + markerWrapperHTML + imageHTML + closeImagesHTML + closeTagHTML;
    },

    populateLayoutMethodPointMarkers(template) {
        Object.keys(template.layout_methods).forEach((key)=>{
            if (key !== "free_hand" && key !== "fixed") {
                const modifiedID = createJobMenuScreenController.generateLayoutMethodHTMLID(key);
                const queryString = "#layout_method_selection_menu #"+modifiedID+" .marker_wrapper";
                let markerPositions;
                
                if (typeof template.layout_methods[key] === "object") {
                    markerPositions = template.layout_methods[key].layout_point_positions;
                }
                else {
                    markerPositions = template.get_point_positions(key);
                }

                $(queryString).html(createJobMenuScreenController.createMarkersForMethod(key, markerPositions));
            }
        });
    },

    createMarkersForMethod(layoutMethodID, markerPositions) {
        if(!layoutMethodID) {
            throw "Missing layout method ID while creating markers";
        }

        if (!markerPositions) {
            throw "Missing marker positions while creating markers";
        }
        
        const modifiedLayoutMethodID = createJobMenuScreenController.generateLayoutMethodHTMLID(layoutMethodID);

        let markersHTML = "";

        markerPositions.forEach((position)=>{
            markersHTML += createJobMenuScreenController.createPointCollectionMarkerItem(modifiedLayoutMethodID, position);
        });
        
        return markersHTML;
    },
    
    createPointCollectionMarkerItem(modifiedLayoutMethodID, position) {
        const crossURL = "img/icons/orange_cross.png";
        const queryString = "#layout_img_"+ modifiedLayoutMethodID;
        const baseAdjustY = -8; // Always move this amount pixels (> 0: down, < 0: up)
        const baseAdjustX = -8; // Always move this amount pixels (> 0: right, < 0: left)
        const imageHeight = $(queryString).height(); // Move up, not down
        const imageWidth = $(queryString).width();        

        const adjustments = new pt[createJobMenuController.templateID](-1, "", "").adjust_template_crosses;
        let x = position.x;
        let y = position.y;
        
        if (y < 0.5) {
            y += adjustments.top;
        }
        else {
            y -= adjustments.bottom;
        }

        if (x < 0.5) {
            x += adjustments.left;
        }
        else {
            x -= adjustments.right;
        }
        
        const adjustY = baseAdjustY + y * imageHeight;
        const adjustX = baseAdjustX + x * imageWidth + (130 - imageWidth) / 2;
        
        const markerHTML = '<img class="layout_marker" src="'+ crossURL +'" style="top: '+ adjustY +'px; left: '+ adjustX +'px;">';

        return markerHTML;
    },

    shouldDisable(disableIfNoServer, disableIfNoControlLink) {
        if (disableIfNoServer && !communication_controller.appServerConnection.connected) {
            return true;
        }
        if (disableIfNoControlLink && !robot_controller.joystickControlLinkExists) {
            return true;
        }
        return false;
    },

    generateLayoutMethodHTMLID(tmrLayoutMethodID) {
        if (tmrLayoutMethodID !== undefined) {
            return tmrLayoutMethodID.replace(",", "-");
        }
        return tmrLayoutMethodID;
    },

    updateCreateButton() {
        $("#create_job_popup #ok_button").addClass("gone");

        if (createJobMenuController.chosenFeatureGroup === -2) {
            $("#create_job_popup #template_create_button").addClass("gone");
            $("#create_job_popup #import_create_button").removeClass("gone");
        }
        else {
            $("#create_job_popup #template_create_button").removeClass("gone");
            $("#create_job_popup #import_create_button").addClass("gone");
        }
        createJobMenuScreenController.colorCreateButton();
    },

    colorCreateButton() {
        if (createJobMenuController.templateID !== "" 
        && createJobMenuController.layoutMethodID !== "") {
            $("#create_job_popup #template_create_button").addClass("enabled");
            $("#create_job_popup #import_create_button").addClass("enabled");
            $("#create_job_popup #template_create_button").removeClass("disabled");
            $("#create_job_popup #import_create_button").removeClass("disabled");
        }
        else {
            $("#create_job_popup #template_create_button").removeClass("enabled");
            $("#create_job_popup #import_create_button").removeClass("enabled");
            $("#create_job_popup #template_create_button").addClass("disabled");
            $("#create_job_popup #import_create_button").addClass("disabled");
        }
    },

    showOKButton() {
        $("#create_job_popup #template_create_button").addClass("gone");
        $("#create_job_popup #import_create_button").addClass("gone");
        $("#create_job_popup #ok_button").removeClass("gone");
    },

    createLayoutMethodTitle(layoutMethodID) {
        if (layoutMethodID === "free_hand") {
            return translate["On Map"];
        }
        if (layoutMethodID === "fixed") {
            return translate["fixed position"];
        }

        const methodName = LAYOUT_DICT[layoutMethodID].split( "," ).map( function( s ) {
          const q = s.replace( /_/g, " " );
          return capitalizeFirstLetter(translate[q]);
        } ).join(" + ");
        
        function capitalizeFirstLetter(string) {
            const firstChar = string.charAt(0).toUpperCase();
            const restOfString = string.slice(1);
            
            return firstChar + restOfString;
        }

        return methodName;
    },

    blink(item) {
        const queryString = "#create_job_popup #" + item;
        $(queryString).addClass("animated flash");
        $(queryString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
          $(queryString).removeClass("animated flash");
        } );
    },

    setFlowMessage() {
        let format = [];

        if (  !createJobMenuScreenController.isOpen
           || createJobMenuScreenController.timedMessageSet) {
            return;
        }
        if (createJobMenuController.templateID === "") {
            message = "selectTemplateOrImport"
        }
        else if (createJobMenuController.layoutMethodID === "") {
            message = "Choose layout method";
        }
        else {
            message = "enterNameOrClickContinue";
            format.push(createJobMenuScreenController.jobSynonym());
        }
        createJobMenuScreenController.setMessage(message, false, format);
    },

    setTimedMessage(message, format=[], seconds=2) {
        if (createJobMenuScreenController.timedMessageSet) {
            return;
        }
        createJobMenuScreenController.timedMessageSet = true;
        createJobMenuScreenController.setMessage(message, true, format, "#FF4D4D", "", "");
        setTimeout(()=>{
            createJobMenuScreenController.timedMessageSet = false;
            createJobMenuScreenController.setFlowMessage();
        }, seconds * 1000);
    },

    jobSynonym() {
        if (AppType === APP_TYPE.TinyLineMarker) {
            return translate["pitch"];
        }
        else {
            return translate["job"];
        }
    },

    setMessage(message, blink=false, format=[], color="black", buttonLabel="", buttonFunc="") {
        const queryString = "#create_job_popup #create_job_message_wrapper";
        $(queryString).empty();
    
        let html = "";
        let translated = "";

        if(format.length < 1) {
            translated = translate[message];
        }
        else {
            translated = translate[message].format(format);
        }

        html += '<h2 id="create_job_message">'+translated+'</h2>';

        if (buttonLabel !== "" && buttonFunc !== "") {
            html += '<button id="message_button" class="button enabled" onclick="'+buttonFunc+'">'+buttonLabel+'</button>'
            const queryString = "#create_job_popup #"+buttonLabel;
            $(queryString).removeClass("gone");
        }

        $(queryString).html(html);
        
        $("#create_job_message").css("color", color);
        
        if (blink) {
            createJobMenuScreenController.blink("create_job_message");
        }
    },

    updateJobNamePlaceholder() {
        const templateID = createJobMenuController.templateID;
        const queryString = "#create_job_popup #job_name";
        let placeholderString = ""
        if (templateID !== "") {
            const template = pt[templateID];
            const fullName = template.template_type + " " + template.template_title
            const dateNow = new Date();
            placeholderString = fullName + " " + dateNow.getDate() + "/" + (dateNow.getMonth() + 1) + "/" + dateNow.getFullYear();
        }
        $(queryString).prop("placeholder", placeholderString);
    },
}

$(()=>{
    function updateHelper() {
        if (createJobMenuScreenController.isOpen) {
            createJobMenuScreenController.populateJobMenu();
            createJobMenuScreenController.populateLayoutMethodMenu();
            createJobMenuScreenController.updateLayoutMethodMenu(createJobMenuController.layoutMethod);
            createJobMenuScreenController.setFlowMessage();
        }
    }
    event_controller.add_callback("chosen_robot_online_changed", updateHelper);
    event_controller.add_callback("app_server_connection_established", updateHelper);
    event_controller.add_callback("app_server_connection_lost", updateHelper);
});