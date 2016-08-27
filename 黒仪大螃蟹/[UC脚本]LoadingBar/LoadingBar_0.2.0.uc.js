// ==UserScript==
// @include			main
// @version			0.2.0
// @note			[20141128]兼容E10S
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function () {
	//Location Bar Enhancer5.1;Loading Bar0.3.0
	var loadingBar = {
		progress: new WeakMap(),
		init: function () {
			var cssStr = (function () {/*
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);
				@-moz-document url("chrome://browser/content/browser.xul"){
				#urlbar {
					background-image: -moz-repeating-linear-gradient(top -45deg, rgba(255,255,255,0), rgba(255,255,255,0) 6px, rgba(255,255,255,1) 6px, rgba(255,255,255,1) 12px), -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(117,155,205,.25) 100%);
					background-size:0 0;
					background-repeat:repeat-x, no-repeat;
				}
				#urlbar[style="background-size: 0% 100%;"]{
					background-image:none;
				}
				#urlbar[loadingBarAnimation][style]:not([style="background-size: 0% 100%;"]) {
					animation: lbprogress-bar-stripes 2s linear infinite;
				}
				@-moz-keyframes lbprogress-bar-stripes {
					from {
						background-position: 0, 0;
					}to {
						background-position: 51px 0, 0;
					}
				}
				}
			*/}).toString().replace(/^.+\s|.+$/g, "");
			//117,155,205,0.35
			var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
			var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
			sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);

			gURLBar.setAttribute("loadingBarAnimation", true);
			gBrowser.tabContainer.addEventListener('TabSelect', this, false);
			gBrowser.addTabsProgressListener(this);
		},
		handleEvent: function (e) {
			if (e.type == "TabSelect") {
				this.onChangeTab();
			}
		},
		onChangeTab: function () {
		gURLBar.removeAttribute("loadingBarAnimation");
			var cd = gBrowser.selectedBrowser,
				val = this.progress.get(cd);
			if (!val) {
				this.progress.set(cd, 0);
				val = 0;
			}
			if (val > 0.95) {
				gURLBar.style.backgroundSize = (val == 1 ? 0 : 100) + '% 100%';
			} else {
				gURLBar.style.backgroundSize = (val * 100) + '% 100%';
			}
			setTimeout(function () {
				gURLBar.setAttribute("loadingBarAnimation", true);
			}, 200);
		},
		onProgressChange: function (aBrowser, webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress) {
			if (/^about\:/.test(aBrowser[gMultiProcessBrowser ?'contentDocumentAsCPOW' : 'contentDocument'].URL)) return;
			var val = (curTotalProgress - 1) / (maxTotalProgress - 1);
			this.progress.set(aBrowser, val);
			if (gBrowser.selectedBrowser === aBrowser) {
				gURLBar.style.backgroundSize = (100 * val) + '% 100%';
				if (val > 0.9) this.timer(function () {
					if (val > 0.95) {
						gURLBar.style.backgroundSize = (val == 1 ? 0 : 100) + '% 100%';
					}
				}, 500);
			}
		},
		onStateChange: function () {
			var aBrowser = arguments[0],
				val = this.progress.get(aBrowser);
			this.progress.set(aBrowser, val || 0);
			if (this.progress.get(aBrowser) > 0.95) {
				this.timer(function () {
					gURLBar.style.backgroundSize = '0% 100%';
				}, 500);
			}
			if(arguments[3] & 16){
				this.progress.set(aBrowser, 1);
			}
		},
		timer: function (callback, delay) {
			delay = delay || 0;
			let timer = setTimeout(function () {
				stopTimer();
				callback();
			}, delay);

			function stopTimer() {
				if (timer == null) return;
				clearTimeout(timer);
				timer = null;
			}
		}
	};
	loadingBar.init();
})();