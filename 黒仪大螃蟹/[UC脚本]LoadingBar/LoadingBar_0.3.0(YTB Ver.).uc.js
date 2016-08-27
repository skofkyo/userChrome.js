// ==UserScript==
// @include			main
// @version			0.3.0
// @note			[20141128]兼容E10S
// @note			[20150206]添加connecting动画
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function () {
	//Location Bar Enhancer5.1;Loading Bar0.3.0
	var loadingBar = {
		progress: new WeakMap(),
		init: function () {
			if(document.getElementById('UCloadingBar')) return;
			var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
			sss.loadAndRegisterSheet(Services.io.newURI('data:text/css;base64,' + btoa((function () {/*
				@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
				@-moz-document url("chrome://browser/content/browser.xul"){
					@keyframes UCloadingBarPulse {
						0% {opacity:1}
						50% {opacity:0}
						100% {opacity:1}
					}
					@keyframes loadingBarConnecting {
						0% {transform: translateX(300%)}
						100% {transform: translateX(-300%)}
					}
					#UCloadingBar:not([connecting])[style="transform: translate3d(-100%, 0px, 0px);"], 
					#UCloadingBar:not([connecting]):not([style]){
						opacity:0;
						transition: opacity 300ms ease 800ms;
					}
					#UCloadingBar{
						position: fixed;
						pointer-events:none;
						background-size: 100% 2px;
						overflow: hidden;
						background-repeat: repeat-x;
						border-left:2px transparent;
						border-right:2px transparent;
						height: 10px;
					}
					#UCloadingBar:not([connecting]){
						transition: transform 400ms ease 0s, opacity 300ms ease 800ms;
						opacity:1;
						background-image:-moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 25%, rgba(254,178,53,1) 100%);
						transform: translate3d(-100%, 0px, 0px);
						width:100%;
					}
					#UCloadingBar[connecting] {
						animation: loadingBarConnecting 2500ms infinite linear;
						background-image: -moz-radial-gradient(center top, ellipse farthest-corner, rgba(254,178,53, 1) 25%, rgba(255,255,255,0.25) 100%);
						width: 30%;
					}
					#UCloadingBar:not([connecting])::before{
						content:'';
						position: absolute;
						top:-10px;
						right: 0px;
						width: 100px;
						height: 100%;
						box-shadow: 0px 0px 10px 3px rgba(254,178,53,1), 0px 0px 5px 2px rgba(254,178,53,1);
						transform: rotate(3deg) translate(0px, -4px);
						animation:UCloadingBarPulse 2s ease-out 0s infinite;
					}
				}
			*/}).toString().replace(/^.+\s|.+$|\t+\/\/.*/g, '')), null, null), sss.USER_SHEET);
			var appcontent = document.getElementById('appcontent'),
				lb  = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'hbox');
			lb.id = 'UCloadingBar';
			appcontent.insertBefore(lb, appcontent.firstChild);
			this.progressBar = lb;
			gBrowser.tabContainer.addEventListener('TabSelect', this, false);
			gBrowser.addTabsProgressListener(this);
		},
		setConnecting: function(connecting){
			if(connecting){
				!this.progressBar.hasAttribute('connecting') && this.progressBar.setAttribute('connecting', 'true');
			}else{
				this.progressBar.hasAttribute('connecting') && this.progressBar.removeAttribute('connecting');
			}
		},
		handleEvent: function (e) {
			if (e.type == 'TabSelect') {
				this.onChangeTab();
			}
		},
		onChangeTab: function () {
			var cd = gBrowser.selectedBrowser,
				val = this.progress.get(cd);
			if (!val) {
				val = [0, false];
				this.progress.set(cd, val);
			}
			if(!this.progressBar) return;

			this.setConnecting(val[1]);
			if (val[0] > 0.95) {
				this.progressBar.style.transform = 'translate3d(-'+ (val[0] == 1 ? 100 : 0) + '%, 0, 0)';
			} else {
				this.progressBar.style.transform = 'translate3d('+((val[0] * 100) - 100) + '%, 0, 0)';
			}
		},
		onProgressChange: function (aBrowser, webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress) {
			if (!/^((ht|f)tps?\:|about:blank)/.test((aBrowser.registeredOpenURI || {asciiSpec: 'about:blank'}).asciiSpec)){
				return this.progress.set(aBrowser, [0, false]);
			}
			var val = (curTotalProgress - 1) / (maxTotalProgress - 1);
			this.progress.set(aBrowser, [val, false]);
			if (this.progressBar && gBrowser.selectedBrowser === aBrowser) {
				this.setConnecting(false);

				this.progressBar.style.transform = 'translate3d('+((val * 100) - 100) + '%, 0, 0)';

				if (val > 0.9) this.timer(function(){
					if (val > 0.95) {
						this.progressBar.style.transform = 'translate3d(-'+ (val == 1 ? 100 : 0) + '%, 0, 0)';
					}
				}.bind(this), 500);
			}
		},
		onStateChange: function (aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
			var val = this.progress.get(aBrowser),
				isCBrowser = gBrowser.selectedBrowser === aBrowser;
			if(!val){
				val = [0, false];
				this.progress.set(aBrowser, val);
			}
			if (val[0] > 0.95) {
				this.timer(function () {
					this.progressBar.style.transform = 'translate3d(-100%, 0, 0)';
				}.bind(this), 500);
			}
			if (aStateFlags & 1 && aStateFlags & 262144){
				if (!(aStateFlags & 16777216)){
					val[1] = /^((ht|f)tps?\:|about:blank)/.test((aBrowser.registeredOpenURI || {asciiSpec: 'about:blank'}).asciiSpec)
					isCBrowser && this.setConnecting(val[1]);
					this.progress.set(aBrowser, val);
				}
			}else if(aStateFlags & 16){
				isCBrowser && this.setConnecting(false);
				this.progress.set(aBrowser, [1, false]);
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