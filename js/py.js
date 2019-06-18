function* range(start, stop, step=1){
    if(step >= 0){
        for(let i=start; i+step<=stop; i+=step){
            yield i;
        }
    }else{
        for(let i=start; i+step>=stop; i+=step){
            yield i;
        }
    }
}