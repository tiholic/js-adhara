function deserialize(str, context) {
    if(typeof context === 'object' && context.blob){
        let data = JSON.parse(str);
        return new context.blob(data);
    }
    if(context){
        let data = JSON.parse(str);
        return new context.blob(data);
    }
    throw new Error (`context passed is invalid: ${context}`);
}

function isPrimitive(ob) {
    return (ob !== Object(ob));
}

class Serializable{

    static _validateData(data){ // checks if there is information loss on serializing the data
        function equivalence(ob1, ob2){
            if(isPrimitive(ob1) && isPrimitive(ob2)){
                return ob1 === ob2;
            } else if(isPrimitive(ob1) !== isPrimitive(ob2)){
                return false;
            }
            for(let key in ob1){
                if(ob1.hasOwnProperty(key)){
                    if(!equivalence(ob1[key], ob2[key])){
                        return false;
                    }
                }
            }
            return true;
        }
        if(isPrimitive(data)){
            return true;
        }else if(typeof data !== 'object' || data === null || data instanceof Array){
            // console.warn("null/array data", data);
            return true;            //Todo handle array of arrays as well !
        } else {
            let eq_success = equivalence(JSON.parse(JSON.stringify(data)), data);
            if(!eq_success){
                console.warn("Equivalence check failed for the data. Data is not serializable.", data);
            }
            return eq_success;
        }
    }

    constructor(data){
        if(!Serializable._validateData(data)){
            throw new Error(`blob must be initialized with serializable(tree-like, non-array) object: ${data}`);
        }
    }

    serialize(){
        throw new Error("Need to define method: serialize");
    }

}