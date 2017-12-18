/**
 * Created by varun on 19/12/17.
 */

class AdharaSubView extends AdharaView{

    constructor(template){
        super();
        this.template = template;
    }

    get isSubView(){
        return true;
    }

    get template(){
        if(this.template){
            return this.template;
        }
        //TODO check if returning super template is legal, else just throw an error if super template is not defined
        return super.template;
    }

    set template(template){
        this.template = template;
    }
}