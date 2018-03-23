class AdharaTabView extends AdharaView{

    get template(){
        return "adhara-tab-view";
    }

    get containerClass(){
        return 'nav nav-pills';
    }

    get tabClass(){
        return 'custom-tabs-line tabs-line-bottom left-aligned';
    }

    get currentTabLink(){
        let current_tab = AdharaRouter.getCurrentURL();
        let tab_links = this.tabs.map(tab => tab.link);
        if(tab_links.indexOf(current_tab)===-1){
            return tab_links[0];
        }
        return current_tab;
    }

    get tabsList(){
        let current_tab_link = this.currentTabLink;
        return this.tabs.map(tab => {
            tab.className = (tab.link === current_tab_link)?"active":"";
            return tab;
        });
    }

    get nextSelector(){
        return '.btn-next';
    }

    get previousSelector(){
        return '.btn-previous';
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Active tab configuration
     * */
    get currentTab(){
        let current_tab_link = this.currentTabLink;
        return this.tabs.filter(tab=>tab.link===current_tab_link)[0];
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

    renderSubViews(){
        Adhara.createView(Adhara.getView(this.currentTab.view, this));
    }

}