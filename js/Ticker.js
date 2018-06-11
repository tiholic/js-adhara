/**
 * @class
 * @classdesc Ticker class that handles repetitive, time based queueing
 * @param {Number} [interval=2000] - polling interval
 * @param {Number} [exponential_factor=2] - factor by which polling interval should be multiplied
 * @param {Number} min_interval - minimum value configured for Poller's timer to work
 * */
class AdharaTicker{

    constructor(interval, exponential_factor, min_interval){
        this.interval = ( interval===0 ? interval: (interval || 2000) );
        this.exponential_factor = exponential_factor || 2;
        this.min_interval = min_interval || 0;
        this.initial_interval = interval;
        this.timeoutId = null;
    }

    scheduleNextTick(){
        self.pause();
        if(!(this.interval <= this.min_interval)) {
            this.timeoutId = window.setTimeout(this.onExecute, this.interval);
        }
    }

    next(){
        this.scheduleNextTick();
    }

    onExecute(){
        this.interval *= this.exponential_factor;
        self.on_execute(this.next);
    }

    /**
     * @function
     * @description
     * Starts polling
     * */
    start(execute){
        this.on_execute = execute;
        this.scheduleNextTick();
    }

    /**
     * @function
     * @description
     * stops current timeout
     * doesn't call next or on-execute function
     * */
    pause(){
        window.clearTimeout(this.timeoutId);
    };

    /**
     * @function
     * @description
     * stops current timeout
     * doesn't call next or on-execute function
     * start new timeout
     * */
    resume(){
        this.scheduleNextTick();
    };

    /**
     * @function
     * @description
     * stops current timeout
     * doesn't call next or on-execute function
     * reset's interval to initial interval
     * */
    stop(){
        this.pause();
        this.interval = this.initial_interval;
    };

    /**
     * @function
     * @description
     * stops current timeout
     * doesn't call next or on-execute function
     * reset's interval to initial interval
     * start new timeout
     * */
    restart(){
        this.stop();
        this.scheduleNextTick();
    };

}