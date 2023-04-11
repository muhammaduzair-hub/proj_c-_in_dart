/**
 * Calls to this controller will add/remove errors (see above indicatorErrors). Every second the controller determines the error in the list with the 
 * highest severity to show the user. An error whose condition is not met cannot be added to the list.
 */
const errorIndicatorController = {
    trackedErrors: [],
    
    /**
     * @param {Object} error is the error to add. Use indicatorErrors object.
     */
    addError(error) {
        const clonedError = Object.assign({}, error);

        try {
            if (typeof error.condition === "undefined"
            ||  error.condition === "always"
            ||  SETTINGS[error.condition] === true
            &&  !errorIndicatorController.errorAlreadyTracked(error)) {
                this.trackedErrors.push(clonedError);
            }
        } 
        catch (error) {
            console.error("errorIndicatorController was passed a malformed object", error);
        }
    },

    /**
     * @param {Object} error 
     * @returns {boolean} Whether or not the error is already added to tracked errors
     */
    errorAlreadyTracked(error) {
        return errorIndicatorController.trackedErrors.filter(err => err.code === error.code).length > 0 ? true : false;
    },

    /**
     * @param {Object} error is the error to remove. Use indicatorErrors object.
     */
    removeError(error) {
        errorIndicatorController.trackedErrors = errorIndicatorController.trackedErrors.filter(err => err.code !== error.code);
    },

    /**
     * @param {integer} group is the number of the error group to remove. "Group" is determined by the first digit of an error's error code.
     * 
     * Groups:
     * 1 is "connectivity"
     * 2 is "robot"
     */
    removeByGroup(group) {
        for (const error of this.trackedErrors) {
            const rounded = (error.code / 1000).round();
            if (group === rounded) {
                this.removeError(error);
            }
        }
    },

    /**
     * @param {String} msg Error message to set
     */
    setErrorMessage(msg) {
        const translated = translate[msg];
        $("#error_indicator_text").text(translated);
    },

    /**
     * @param {String} msg Error message to show
     */
    showErrorIndicator(msg) {
        this.setErrorMessage(msg);
        $("#error_indicator").removeClass("gone");
    },

    hideErrorIndicator() {
        if (!$("#error_indicator").hasClass("gone")) {
            $("#error_indicator").addClass("gone");
        }
    },

    /**
     * Finds the (first) highest severity error with 0 delay and shows said error.
     * Errors with delays have their delay lowered until 0.
     * If an error that should be shown is located, shows the error indicator - otherwise hides it.
     */
    errorCheck() {
        let highestSeverityError = null;
        for (let error of errorIndicatorController.trackedErrors) {
            if (error.delay > 0) {
                error.delay = error.delay - 1;
            }
            else if (highestSeverityError === null || error.severity > highestSeverityError.severity) {
                highestSeverityError = error;
            }
        }
        
        if (highestSeverityError) {
            errorIndicatorController.showErrorIndicator(highestSeverityError.message);
        }
        else {
            errorIndicatorController.hideErrorIndicator();
        }
    }
};

$(()=>{
    setInterval(()=>{
        errorIndicatorController.errorCheck();
    }, 1000);
});