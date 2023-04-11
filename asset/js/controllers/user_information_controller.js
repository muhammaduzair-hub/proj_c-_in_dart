const userInformationController = {
    infoLocation: "user.contactInformation",
    // checkInformationAddTime: 10000,                                // FOR TESTING
    checkInformationAddTime: 2419200000, // 4 weeks * 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

    get information() {
        const information = userInformationController._getItem()
        return information ? information : {email: null, phone: null};
    },

    get informationHasBeenUpdated() {
        const information = userInformationController._getItem()
        if (!information
        ||  !information.lastUpdated) {
                return false;
            }
        return true;
    },

    get informationIsSet() {
        if (userInformationController.email) {
            return true;
        }
        return false;
    },

    get email() {
        let email = userInformationController._getItem("email");
        return email ? email : null;
    },

    get informationIsOutdated() {
        return (userInformationController.information.lastUpdated + userInformationController.checkInformationAddTime) < Date.now();
    },

    baseHTML() {
        const messageElement = '<p class="message"></p>';
        const emailElement = '<input class="input_email" type="email" name="user_email" placeholder="E-mail address">';
        return messageElement + emailElement;
    },

    enterUserInformation() {
        const buttons = [
            new PopButton(translate["submit"], submit, null, null),
            new PopButton(translate["remindMe"], remindMe, "red", null)
        ]
    
        const options = {
            popup_id: "enter_user_info_popup",
            header: translate["contactInfoHeaderEnter"],
            body: translate["contactInfoBodyEnter"],
            extra_before_buttons_html: userInformationController.baseHTML(),
            buttons: buttons,
        }

        pop_generator.create_popup_with_options(options);

        if (userInformationController.email) {
            $("#enter_user_info_popup .input_email").val(userInformationController.email);
        }
        $("#enter_user_info_popup .input_email").prop("disabled", false);
        
        function submit() {
            userInformationController.handleUserInput();
        }
        
        function remindMe() {
            pop_generator.close();
            userInformationController.userInputSkipped();
        }
    },

    askIfStillValid() {
        const buttons = [
            new PopButton(translate["yes"], yes, null, null),
            new PopButton(translate["no"], no, null, null)
        ]
        const options = {
            popup_id: "enter_user_info_popup",
            header: translate["headerStillCorrect"],
            body: translate["contactInfoBodyStillCorrect"],
            extra_before_buttons_html: userInformationController.baseHTML(),
            buttons: buttons,
        }

        pop_generator.create_popup_with_options(options);

        $("#enter_user_info_popup .input_email").val(userInformationController.email);
        $("#enter_user_info_popup .input_email").prop("disabled", true);

        function yes() {
            userInformationController.lastUpdatedIsNow();
            pop_generator.close();
        }

        function no() {
            pop_generator.close();
            userInformationController.enterUserInformation();
        }
    },

    editUserInformation() {
        const buttonDisabled = $("#user_information #btn_edit_user_information").hasClass("disabled");
        if (buttonDisabled) {
            settings_screeen_controller.offlInePopup();
            return;
        }

        if (developer_screen.isSafemode) {
            const buttons = [
                new PopButton(translate["ok"], ok, null, null)
            ]

            const options = {
                popup_id: "enter_user_info_popup",
                header: translate["editUserContactInfoHeader"],
                body: translate["cannotChangeInSafemodeBody"],
                buttons: buttons,
            }

            pop_generator.create_popup_with_options(options);
            
            function ok() {
                pop_generator.close();
            }
        }
        else {
            const buttons = [
                new PopButton(translate["submit"], submit, null, null),
                new PopButton(translate["cancel"], cancel, "red", null)
            ]
        
            const options = {
                popup_id: "enter_user_info_popup",
                header: translate["editUserContactInfoHeader"],
                extra_before_buttons_html: userInformationController.baseHTML(),
                buttons: buttons,
            }

            pop_generator.create_popup_with_options(options);

            if (userInformationController.email) {
                $("#enter_user_info_popup .input_email").val(userInformationController.email);
            }
            $("#enter_user_info_popup .input_email").prop("disabled", false);
            
            function submit() {
                userInformationController.handleUserInput();
            }
            
            function cancel() {
                pop_generator.close();
            }
        }
    },

    handleUserInput() {
        const email = $("#enter_user_info_popup .input_email").val();
        
        if (userInformationController.checkEmailInput(email)) {
            userInformationController.setEmail(email);
        }
        else {
            return false;
        }

        userInformationController.transmitInformationToServer();

        event_controller.call_callback("open_settings_menu", settings_screeen_controller.chosen_menu);
        popup_screen_controller.close();
        
        userInformationController.userInputConfirmed();

        return true;
    },

    userInputSkipped() {
        userInformationController.setEmail("");

        const buttons = [
            new PopButton(translate["OK"], pop_generator.close, null, null)
        ]
        const options = {
            header: translate["skipped"],
            body: translate["contactInfoBodyCanBeChanged"],
            buttons: buttons
        }
        pop_generator.create_popup_with_options(options);
    },

    userInputConfirmed() {
        const headerText = '"'+userInformationController.email+'" '+ translate["confirmed"].toLowerCase();

        const buttons = [
            new PopButton(translate["ok"], ok, null, null),
        ]
    
        const options = {
            popup_id: "enter_user_info_popup",
            header: headerText,
            body: translate["contactInfoBodyCanBeChanged"],
            buttons: buttons,
        }

        pop_generator.create_popup_with_options(options);
        
        function ok() {
            pop_generator.close();
        }
    },

    checkEmailInput(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        else {
            userInformationController.setMessage("userInfoInvalidEmail", "error")
            return false;
        }
    },

    checkPhoneInput(countryCode, phoneNumber) {
        if (!countryCode) {
            userInformationController.setMessage("userInfoNoCountryCode", "error");
            return false;
        }
        else if (!(/^[0-9]{1,3}$/.test(countryCode))) {
            userInformationController.setMessage("userInfoInvalidCountryCode", "error");
            return false;
        }
        else if (!phoneNumber) {
            userInformationController.setMessage("userInfoNoPhoneNumber", "error");
            return false;
        }
        else if (!(/^[0-9]+$/.test(phoneNumber))) {
            userInformationController.setMessage("userInfoInvalidPhoneNumber", "error");
            return false;
        }
        return true;
    },

    transmitInformationToServer() {
        userInformationController._transmitEmail();
        userInformationController._transmitPhone();
    },

    _transmitEmail() {
        const data = {key: "User email", val: userInformationController.email}
        communication_controller.send("save_key_val", data, "cloud", 5);
    },

    _transmitPhone() {
        // TODO: IMPLEMENT
    },

    setEmail(newEmailAddress) {
        userInformationController._setItem("email", newEmailAddress);
        userInformationController.updateButtons();
    },

    setPhone(countryCode, phoneNumber) {

        const phoneObject = {countryCode: countryCode, number: phoneNumber};
        userInformationController._setItem("phone", phoneObject);
    },

    setMessage(message=null, error=false) {
        const query = $("#enter_user_info_popup .message");

        if (message) {
            query.html(translate[message]);
        }
        else {
            query.html("");
        }

        if(error) {
            query.css("color", "red");
        }
        else {
            query.css("color", "black");
        }
    },

    clearUserInformation() {
        const buttonDisabled = $("#user_information #btn_clear_user_information").hasClass("disabled");
        if (buttonDisabled) {
            if (!userInformationController.informationIsSet) {
                return;
            }

            if (!tablet_connection.online
            ||  !communication_controller.appServerConnection.connected) {
                settings_screeen_controller.offlInePopup();
            }
            return;
        }

        const buttons = [
            new PopButton(translate["yes"], yes, "red", null),
            new PopButton(translate["no"], no, null, null)
        ]
        const options = {
            header: translate["contactInfoHeaderDelete"],
            body: translate["contactInfoBodyDelete"],
            buttons: buttons
        }

        pop_generator.create_popup_with_options(options);

        function yes() {
            userInformationController.destroyUserInformation();
            userInformationController.updateButtons();
            auto_update_screen.updateUserSection();
            pop_generator.close();
        }

        function no() {
            pop_generator.close();
        }
    },

    clearEmail() {
        userInformationController.setEmail("");
        userInformationController.transmitInformationToServer();
    },

    clearLastUpdated() {
        userInformationController._setItem("lastUpdated", 0);
    },

    lastUpdatedIsNow() {
        userInformationController._setItem("lastUpdated", Date.now());
    },

    destroyUserInformation() {
        userInformationController.clearEmail();
        userInformationController.clearLastUpdated();

        const buttons = [
            new PopButton("OK", ok, null, null)
        ]

        const options = {
            header: "User information has been deleted.",
            buttons: buttons
        }

        pop_generator.create_popup_with_options(options);

        function ok() {
            pop_generator.close();
        }
    },

    updateButtons() {
        const editButton = $("#user_information #btn_edit_user_information");
        const deleteButton = $("#user_information #btn_clear_user_information");

        if (!communication_controller.appServerConnection.connected
        || developer_screen.isSafemode) {
            editButton.addClass("disabled");
            deleteButton.addClass("disabled");
        }
        else {
            editButton.removeClass("disabled");
            
            if (userInformationController.informationIsSet) {
                deleteButton.removeClass("disabled");
            }
            else {
                deleteButton.addClass("disabled");
            }
        }
    },

    transmitOnStartup() {
        userInformationController.transmitInformationToServer();
        event_controller.remove_callback("app_server_connection_established", userInformationController.transmitOnStartup);
    },

    infoCheck() {
        if (developer_screen.isSafemode) {
            return;
        }

        if (!userInformationController.informationHasBeenUpdated 
        || userInformationController.informationIsOutdated) {
            if (userInformationController.informationIsSet) {
                userInformationController.askIfStillValid();
            }
            else {
                userInformationController.enterUserInformation();
            }
        }

        event_controller.remove_callback("app_server_connection_established", userInformationController.infoCheck);
    },

    _getItem(field=null) {
        const data = JSON.parse(localStorage.getItem(userInformationController.infoLocation));
        if (data) {
            if (field) {
                return data[field];
            }
            else {
                return data;
            }
        }
        else {
            return null;
        }
    },

    _setItem(field, data) {
        let information = userInformationController.information;
        information.lastUpdated = Date.now();
        information[field] = data;
        const stringified = JSON.stringify(information);
        localStorage.setItem(userInformationController.infoLocation, stringified);
    }
}

$(()=>{
    event_controller.add_callback("app_server_connection_established", userInformationController.transmitOnStartup);
    event_controller.add_callback("app_server_connection_established", userInformationController.infoCheck);

    event_controller.add_callback("app_server_connection_established", userInformationController.updateButtons);
    event_controller.add_callback("app_server_connection_lost", userInformationController.updateButtons);
    event_controller.add_callback("app_server_connection_closed", userInformationController.updateButtons);

    userInformationController.updateButtons();
});