(function(){
//Location Bar Enhancer5.1;Loading Bar0.3.0
	var cssStr = (function(){/*
		@-moz-document url-prefix('chrome://browser/content/browser.xul') {
			#urlbar{position: relative;}
			#LoadingBarProgress {
				background-image: -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(117,155,205,.25) 100%);
				background-repeat:no-repeat;
				background-size:100% 100%;
				width:0%;
				height:100%;
				position:absolute;
				z-index:0;
				transition:visibility 350ms ease 0s,width 350ms ease 0s;
			}
			#LoadingBarProgress[style="width: 0%; visibility: hidden;"]{
				background-image: -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(117,155,205,.15) 100%);
			}
			#LoadingBarProgress:not([style="width: 0%; visibility: hidden;"])::after {
				animation: progress-bar-stripes 2s linear infinite;
				background-image:-moz-repeating-linear-gradient(top -45deg, rgba(255,255,255,0), rgba(255,255,255,0) 6px, rgba(255,255,255,1) 6px, rgba(255,255,255,1) 12px);
				background-size: 17px 23px;
				bottom: 0;
				content: "";
				left: 0;
				position: absolute;
				z-index:0;
				right: 0;
				top: 0;
			}
			
			#identity-box,#urlbar .urlbar-history-dropmarker,#urlbar > .chromeclass-toolbar-additional,
			#urlbar > hbox >*:not(#LoadingBarProgress){
				position: relative;
				z-index:1;
			}
			@-moz-keyframes progress-bar-stripes {
				from {
					background-position: 0 0;
				}
				to {
					background-position: 51px 0;
				}
			}
		}
	*/}).toString().replace(/^.+\s|.+$/,"");
	
	var style = document.createProcessingInstruction("xml-stylesheet", "title=\"url-addon-bar\" type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
	var mainW = document.getElementById("main-window");
	document.insertBefore(style, mainW);

	function main(window) {
	  var {document, gBrowser} = window;
	  function $(id) document.getElementById(id);
	  var Progress = document.createElement("box");
	  Progress.id = "LoadingBarProgress";
	  var urlbar = $("urlbar");
	  if(!$("LoadingBarProgress")) urlbar.insertBefore(Progress,urlbar.firstChild);
	  let pageProgress = 0;
	  let async = makeWindowHelpers(window).async;
	  var LoadingBar = {
		listener: {
		  onChangeTab: function(e) {
			Progress.style.width = '0%';
			pageProgress = 0;
			Progress.style.visibility = "hidden";
		  },
		  onProgressChange: function(aBrowser,webProgress,request,curSelfProgress,maxSelfProgress,curTotalProgress,maxTotalProgress) {
			if (gBrowser.contentDocument === aBrowser.contentDocument) {
				Progress.style.visibility = "visible";
				var val = (curTotalProgress-1)/(maxTotalProgress-1);
				pageProgress = val;
				Progress.style.width = (100*val) + '%';
				if (val > 0.9)
				  async(function() {
					if (pageProgress > 0.95)
					  Progress.style.width = '100%';
				  }, 500);
			}
		  },
		  onStateChange: function() {
			if (pageProgress > 0.95){
				async(function() {
					Progress.style.width = '0%';
					pageProgress = 0;
					Progress.style.visibility = "hidden";
				}, 500);
			}else{
				Progress.style.width = '0%';
			}
		  }
		}
	  };

	  gBrowser.tabContainer.addEventListener('TabSelect',LoadingBar.listener.onChangeTab,false);
	  gBrowser.addTabsProgressListener(LoadingBar.listener);

	  unload(function() {
		gBrowser.tabContainer.removeEventListener('TabSelect',LoadingBar.listener.onChangeTab,false);
		gBrowser.removeTabsProgressListener(LoadingBar.listener);
	  }, window);
	}

	watchWindows(main, "navigator:browser");

	function runOnLoad(window, callback, winType) {
	  window.addEventListener("load", function() {
		window.removeEventListener("load", arguments.callee, false);

		if (window.document.documentElement.getAttribute("windowtype") == winType)
		  callback(window);
	  }, false);
	}

	function runOnWindows(callback, winType) {
	  function watcher(window) {
		try {
		  callback(window);
		}
		catch(ex) {}
	  }

	  let browserWindows = Services.wm.getEnumerator(winType);
	  while (browserWindows.hasMoreElements()) {
		let browserWindow = browserWindows.getNext();
		if (browserWindow.document.readyState == "complete")
		  watcher(browserWindow);
		else
		  runOnLoad(browserWindow, watcher, winType);
	  }
	}

	function watchWindows(callback, winType) {
	  function watcher(window) {
		try {
		  callback(window);
		}
		catch(ex) {}
	  }

	  runOnWindows(callback, winType);

	  function windowWatcher(subject, topic) {
		if (topic == "domwindowopened")
		  runOnLoad(subject, watcher, winType);
	  }
	  Services.ww.registerNotification(windowWatcher);

	  unload(function() Services.ww.unregisterNotification(windowWatcher));
	}

	function unload(callback, container) {
	  let unloaders = unload.unloaders;
	  if (unloaders == null)
		unloaders = unload.unloaders = [];

	  if (callback == null) {
		unloaders.slice().forEach(function(unloader) unloader());
		unloaders.length = 0;
		return null;
	  }

	  if (container != null) {
		container.addEventListener("unload", removeUnloader, false);

		let origCallback = callback;
		callback = function() {
		  container.removeEventListener("unload", removeUnloader, false);
		  origCallback();
		}
	  }

	  function unloader() {
		try {
		  callback();
		}
		catch(ex) {}
	  }
	  unloaders.push(unloader);

	  function removeUnloader() {
		let index = unloaders.indexOf(unloader);
		if (index != -1)
		  unloaders.splice(index, 1);
	  }
	  return removeUnloader;
	}
	
	function makeWindowHelpers(window) {
	  let {clearTimeout, setTimeout} = window;

	  function async(callback, delay) {
		delay = delay || 0;
		let timer = setTimeout(function() {
		  stopTimer();
		  callback();
		}, delay);

		function stopTimer() {
		  if (timer == null)
			return;
		  clearTimeout(timer);
		  timer = null;
		}

	  }

	  return {
		async: async,
	  };
	}

})();
