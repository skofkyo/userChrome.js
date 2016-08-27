// ==UserScript==
// @name           reloadAndstopButton
// @include        main
// @compatibility  FF29+
// @version        0.0.4
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){
	var reloadAndstopButton = {
		anchorBtn: null,
		isBusy: new WeakMap(),
		init: function(){
			try{
				CustomizableUI.createWidget({
					id: "reloadAndstopButton",
					type: "button",
					defaultArea: CustomizableUI.AREA_NAVBAR,
					label: "\u5237\u65B0/\u505C\u6B62",
					tooltiptext: "\u505C\u6B62",
					onCommand: function(event){
						var cl = document.getElementById("reloadAndstopButton").classList;
						if(cl.contains("reloadAndstopButton-stop")){
							BrowserStop();
						}else{
							BrowserReloadOrDuplicate(event);
						}
					}
				});
			}catch(ex){}
			var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){'
						+'#reloadAndstopButton{'
						+'list-style-image: url("chrome://browser/skin/Toolbar.png");'
						+ '-moz-image-region: rect(0px, 90px, 18px, 72px);'
						+ '}'
						+ '#reloadAndstopButton.reloadAndstopButton-stop{'
						+ '-moz-image-region: rect(0px, 108px, 18px, 90px);'
						+ '}'
						+'toolbar[brighttext] #reloadAndstopButton{'
						+ 'list-style-image: url("chrome://browser/skin/Toolbar-inverted.png");'
						+ '}'
						+'}';
			var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
			var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
			sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr),null, null), sss.USER_SHEET);

			this.updateBtnUI(gBrowser.selectedBrowser.webProgress.isLoadingDocument);

			gBrowser.addTabsProgressListener(this);
			gBrowser.tabContainer.addEventListener("TabSelect", this.tabSelect.bind(this), false);
		},

		onStateChange: function(browser, aWebProgress, aRequest, aStateFlags, aStatus){
			var isBusy = this.isBusy.get(browser) || true,
				isCurrent = CustomizableUI.getWidget("reloadAndstopButton").areaType 
							&& (browser == gBrowser.selectedBrowser);
			if (aStateFlags & 1 && aStateFlags & 262144){
				if (!(aStateFlags & 16777216)){
					isBusy = true;
					isCurrent && this.updateBtnUI(1);
				}
			}else if(aStateFlags & 16){
				if (isBusy) {
					isBusy = false;
					isCurrent && this.updateBtnUI();
				}
			}

			this.isBusy.set(browser, isBusy);
		},

		tabSelect : function(){
			if(CustomizableUI.getWidget("reloadAndstopButton").areaType){
				if(this.anchorBtn)
				this.updateBtnUI(this.isBusy.get(gBrowser.selectedBrowser) || false);
			}
		},

		updateBtnUI: function(add){
			if(CustomizableUI.getWidget("reloadAndstopButton").areaType){
				if(!this.anchorBtn)
					this.anchorBtn = CustomizableUI.getWidget("reloadAndstopButton").instances[0].anchor;
				add ? this.anchorBtn.classList.add("reloadAndstopButton-stop")
					: this.anchorBtn.classList.remove("reloadAndstopButton-stop");
				this.anchorBtn.setAttribute("tooltiptext", add ? "\u505C\u6B62" : "\u5237\u65B0");
			}
		}
	};

	reloadAndstopButton.init();
})();