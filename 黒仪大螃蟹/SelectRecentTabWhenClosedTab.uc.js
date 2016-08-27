// ==UserScript==
// @name      Select Recent Tab When Closed Tab
// @version   0.1
// ==/UserScript==
(function () {
	var SelectRecentTab = {
		tabClose: function (e) {
			var tab = e.target,
				tabs = tab.parentNode.childNodes,
				index = last = 0;
			for (var i = 0; i < tabs.length; i++) {
				var s = tabs[i].getAttribute('lastselected');
				if (s && s > last && tabs[i] != tab) {
					index = i;
					last = s;
				}
			}
			gBrowser.selectedTab = tabs[index];
		},
		tabSelect: function (e) {
			var tab = e.target;
			tab.setAttribute('lastselected', Date.now());
		},
		startup: function () {
			gBrowser.tabContainer.addEventListener('TabClose', function (e) {
				SelectRecentTab.tabClose(e);
			}, false);
			gBrowser.tabContainer.addEventListener('TabSelect', function (e) {
				SelectRecentTab.tabSelect(e);
			}, false);
		}
	};
	SelectRecentTab.startup();
})();