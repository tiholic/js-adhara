class AdharaTabView extends AdharaView{

    onInit(){
        this.containerId = `d${Date.now()}`;
    }

    get template(){
        return "adhara-tab-view";
    }

    get containerClass(){
        return 'nav nav-pills';
    }

    get tabNavClass(){
        return 'custom-tabs-line tabs-line-bottom left-aligned';
    }

    get tabListClass(){
        return "nav";
    }

    /**
     * @typedef {Object} TabObject
     * @property {String} id
     * @property {AdharaView} instance of adhara view
     * */

    /**
     * @returns {Array<TabObject>} list of tab objects
     * */
    get tabs(){
        return [];
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Active tab configuration
     * */
    get currentTab(){
        let current_tab_link_from_url = Adhara.router.getCurrentURL();
        let current_Tab = this.tabs.filter(tab=>tab.link===current_tab_link_from_url);
        return current_Tab.length?current_Tab[0]:(this._current_Tab || this.tabs[0]);
    }

    get tabsList(){
        let current_tab_id = this.currentTab.id;
        return this.tabs.map(tab => {
            tab.className = (tab.id === current_tab_id)?"active":"";
            return tab;
        });
    }

    changeCurrentTab(tabId){
        let new_tab = this.tabs.filter(tab=>tab.id===tabId)[0];
        if(!new_tab) return false;
        this._current_Tab = new_tab;
        this.setState();
        return true;
    }

    onLinklessTabClick(event, data){
        this.changeCurrentTab(data.tabid);
    }

    get nextSelector(){
        return '.btn-next';
    }

    get previousSelector(){
        return '.btn-previous';
    }

    onTabShow() {

    }

    onTabClick(){

    }

    onTabChange(){

    }

    /*onShow(){

    }*/

    format(){

    }

    get contentContainer(){
        return ".tab-content .tab-pane";
    }

    get subViews(){
        let cTab = this.currentTab.view;
        cTab.parentContainer = `#${this.containerId} .tab-content .tab-pane.active`;
        return [cTab];
    }

    // renderSubViews(){
    //     Adhara.createView(this.currentTab.view, this);
    // }

}