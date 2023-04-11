
// Timer plugin git repo:
// https://github.com/kitolog/cordova-plugin-timer

class IntervalHandler {
    constructor(identifier, onTickFunction, window, delay, tickTime) {
        this.interval = null;
        this.identifier = identifier;
        this.onTickFunction = onTickFunction;
        this.window = window;
        this.delay = delay;
        this.tickTime = tickTime;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            this.stop();
        }
        if (!this.checkParameters()) {
            console.log(`Failed to create interval`);
            return false;
        }

        if (this.window.cordova) {
            try {
                this.interval = new this.window.nativeTimer();
                this.interval.onTick = this.onTickFunction;
                this.interval.start(this.delay, this.tickTime);
            } catch (error) {
                console.error("Failed to set interval", error);
                setTimeout(()=>{
                    console.error("Attempting to set interval again...");
                    this.start();
                }, 1000);
            }
        }
        else {
            this.interval = setInterval(()=>{
                this.onTickFunction();
            }, this.tickTime);
        }
        this.isRunning = true;
        console.log(`Interval \"${this.identifier}\" started`);
    }

    stop() {
        if (this.window.cordova) {
            this.interval.stop();
        }
        else {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log(`Interval \"${this.identifier}\" stopped`);
    }

    checkParameters() {
        if (!this.identifier) {
            console.error("Interval handler received no identifier");
            return false;
        }
        if (!this.onTickFunction) {
            console.error("Interval handler received no function");
            return false;
        }
        if (!this.window) {
            console.error("Interval handler received no window");
            return false;
        }
        if (!this.delay) {
            console.error("Interval handler received no delay");
            return false;
        }
        if (!this.tickTime) {
            console.error("Interval handler received no tick time");
            return false;
        }
        return true;
    }
}