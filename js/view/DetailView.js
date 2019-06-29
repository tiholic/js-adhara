class AdharaDetailView extends AdharaMutableView{

    get isExclusivelyEditable(){
        return false;
    }

    enhanceFieldForSubViewRendering(field){
        field = super.enhanceFieldForSubViewRendering(field);
        field.readonly = true;
        return field;
    }

}