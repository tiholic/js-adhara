class SuggestionHintsMetaField extends AdharaView{

    onInit() {
        super.onInit();
        this.cursor = 0;
        this._rc = 0;
        this._hints = [];
        this.hintTempalate = this.settings.options.hint_template;
    }

    get template(){
        return "adhara-form-fields/field-hints";
    }

    get events(){
        return ["HintSelected", "ScrollHitBottom"];
    }

    onScroll(event, data){
        if(
            (event.target.offsetHeight + event.target.scrollTop) >= event.target.scrollHeight
            && (this.scroll_position !== event.target.scrollTop)
        ){
            this.scroll_position = event.target.scrollTop;
            this.trigger("ScrollHitBottom");
        }
    }

    get _hc(){
        return this.getParentContainerElement().querySelector('.hint-container')
    }

    show(){
        this.enable = true;
        this.setState();
    }

    hide(){
        this.enable = false;
        this.setState();
        // setTimeout(()=>{
        //     this._hc && this._hc.classList.add('d-none');
        // }, 1000);

        /*this.enable = false;
        setTimeout(()=>{
            this.setState();
        }, 500);*/
    }

    format(container) {
        super.format(container);
        let hintContainer = this.querySelector('.hint-container');
        if(hintContainer) hintContainer.scrollTop = this.scroll_position;
        this.scroll_position = 0;
    }

    get hints(){
        return this._hints;
    }

    set hints(_){
        this._hints = _;
        this.enable = !!this._hints.length;
        this.setState();
    }

    reset(){
        this.cursor = 0;
        this._hints = [];
        this.setState();
    }

    cursorUp(){
        if(this.cursor > 0) this.cursor--;
        else this.cursor = this.hints.length-1;
        this.setState();
    }

    cursorDown(){
        if(this.cursor < (this.hints.length-1)) this.cursor++;
        else this.cursor = 0;
        this.setState();
    }

    onChoice(event, data){
        this.cursor = +data.index;
        this.trigger("HintSelected", this.selectedHint);
    }

    get selectedHint(){
        return this.hints[this.cursor];
    }

}