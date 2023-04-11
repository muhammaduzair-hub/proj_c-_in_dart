const startupScreenController = {
    htmlID: "startup_screen",

    open(header, body, extra, buttons) {
        const content = document.createElement("div");
        content.id = "content";
        content.appendChild(startupScreenController.makeHeader(header));
        content.appendChild(startupScreenController.makeBody(body));
        content.appendChild(startupScreenController.makeQRImage());
        content.appendChild(startupScreenController.makeButtons(buttons));
        
        const query = $(`#${startupScreenController.htmlID}`)
        query.html(content);

        startupScreenController.makeWatermark();

        query.removeClass("gone");
    },

    close() {
        $(`#${startupScreenController.htmlID}`).addClass("gone");
    },

    makeHeader(header) {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        const headerElement = document.createElement("h1");
        headerElement.id = "header";
        headerElement.innerText = translate[header];
        const versionElement = document.createElement("h3");
        versionElement.id = "version";
        versionElement.innerText = `"${APP_VERSION_NUMBER}"`;

        wrapper.appendChild(headerElement);
        wrapper.appendChild(versionElement);

        return wrapper;
    },

    /**
     * @param {Array} body Accepts an array of strings
     * @returns HTML element
     */
    makeBody(body) {
        const element = document.createElement("div");
        element.id = "body";
            body.forEach((string)=>{
                element.appendChild(startupScreenController._makeBodyHelper(string));
            });
        
        return element;
    },

    /**
     * 
     * @param {String} string 
     * @returns HTML element
     */
    _makeBodyHelper(string) {
        const element = document.createElement("p");
        element.innerText = translate[string];
        return element;
    },

    makeQRImage() {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.id = "qr_code_wrapper";

        const element = document.createElement("img");
        element.src = "img/qr_codes/startup_screen/code.svg";
        element.id = "qr_code";
        
        wrapper.appendChild(element);

        return wrapper;
    },

    makeButtons(buttons) {
        const element = document.createElement("div");
        element.id = "button_container";

        buttons.forEach(button => {
            element.appendChild(button.create());
        });

        return element;
    },

    makeWatermark() {
        const query = $(`#${startupScreenController.htmlID}`);
        const element = document.createElement("img");
        element.id = "watermark";
        element.src = "img/TinyMobileRobots_petrol_trademark.svg";
        query.append(element);
    },

    versionIsRC() {
        return APP_VERSION_NUMBER.includes("RC") ? true : false;
    }
}

$(()=>{
    if (startupScreenController.versionIsRC()) {
        const header = "Release Candidate loaded";
        const body = ['We have detected that you are running a release candidate version of the tablet software. This implies you are testing something for us. If this is not the case, you can download a release version by checking for updates in settings.', 'If you are testing the release candidate, please fill out the questionnaire which can be found by scanning the QR-code below:'];
        const extra = "";
        
        const buttons = [new PopButton(translate["I understand"], startupScreenController.close, "red")];

        startupScreenController.open(header, body, extra, buttons);
    }
});