class CoalesceTasker{

    constructor(wait_for=0){
        this.wait_for = wait_for;
        this.timer_idx = 0;
    }

    async execute(executor, terminator){
        if(this.terminator) this.terminator();
        this.executor = executor;
        this.terminator = terminator;
        clearTimeout(this.timer_idx);
        return new Promise((resolve, reject)=>{
            this.timer_idx = setTimeout(()=>{
                this.executor();
                resolve();
            }, this.wait_for);
        });
    }

}
