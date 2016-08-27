// ==UserScript==
// @name         TabPlus
// @description  增强标签页功能
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	'use strict';
	// 新标签打开:书签、历史、搜索栏
	try {
		eval('openLinkIn=' + openLinkIn.toString().replace('w.gBrowser.selectedTab.pinned', '(!w.isTabEmpty(w.gBrowser.selectedTab) || $&)').replace(/&&\s+w\.gBrowser\.currentURI\.host != uriObj\.host/, ''));
	} catch (e) {};
	//地址栏新标签打开
	try {
		var str = gURLBar.handleCommand.toString();
		str = str.replace('&& !isTabEmpty', '|| isTabEmpty');
		str = str.replace('|| altEnter', '|| !altEnter');
		eval('gURLBar.handleCommand = ' + str);
	} catch (e) {};
	//open home in new tab 
	try {
		eval('BrowserGoHome = ' + BrowserGoHome.toString().replace(/switch \(where\) {/, 'where = \'tab\'; $&'));
	} catch (e) {};
	//紧邻当前标签新建标签页
	gBrowser.tabContainer.addEventListener('TabOpen', tabOpenHandler, false);

	function tabOpenHandler(event) {
		let tab = event.target;
		if (tab.linkedBrowser.currentURI.spec == 'about:newtab') return; //跳过新建标签页
		gBrowser.moveTabTo(tab, gBrowser.mCurrentTab._tPos + 1);
	};
	//鼠标移动到标签自动聚焦
	(document.getElementById('tabbrowser-tabs') || gBrowser.mTabBox).addEventListener('mouseover', function self(e) {
		if ((self.target = e.target).localName === 'tab') {
			if (!self.timeoutID) {
				this.addEventListener('mouseout', function() {
					clearTimeout(self.timeoutID);
				}, false);
			}
			self.timeoutID = setTimeout(function() {
				gBrowser.selectedTab = self.target;
			}, 150);
		}
	}, false);
})();