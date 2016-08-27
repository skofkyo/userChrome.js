// ==UserScript==
// @name         MenuPlus
// @description  简单的菜单修改
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	'use strict';
	//自动刷新标签页
	let time = 10; //刷新间隔,单位分钟
	let reloadTab = document.getElementById('context_reloadTab');
	reloadTab.setAttribute('tooltiptext', '右键:自动刷新标签页\n间隔:' + time + '分钟');
	reloadTab.setAttribute('onclick', 'if (event.button == 2) {AutoReload(gBrowser.selectedTab,' + time + ');closeMenus(this);event.preventDefault(); event.stopPropagation();}');
	window.AutoReload = function(tab, time) {
		if (!tab.getAttribute('AutoReload')) {
			tab.setAttribute('AutoReload', 'true');
			tab.setAttribute('style', 'background-image: linear-gradient(to right, transparent 20%, rgb(0, 167, 224) 30%, rgb(0, 167, 224) 70%, transparent 80%)!important;background-size: auto 2px!important;background-repeat: no-repeat!important;');
			let interval = setInterval(function() {
				if (tab.getAttribute('AutoReload') == 'true' && gBrowser.getBrowserForTab(tab)) {
					gBrowser.reloadTab(tab);
				} else {
					clearInterval(interval)
				}
			}, time * 1000 * 60);
		} else {
			tab.removeAttribute('AutoReload');
			tab.removeAttribute('style');
		};
	};
	//复制gif
	let copyimage = document.getElementById('context-copyimage-contents');
	copyimage.setAttribute('tooltiptext', '右键:复制GIF');
	copyimage.setAttribute('onclick', 'if (event.button == 2) {copygif();closeMenus(this);event.preventDefault();event.stopPropagation()}');
	window.copygif = function() {
		let Cc = Components.classes;
		let Ci = Components.interfaces;
		let trans = Cc['@mozilla.org/widget/transferable;1'].createInstance(Ci.nsITransferable);
		let str = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
		let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		let partialPath = '\\Cache2\\' + (+new Date) + '.gif';
		try {
			var completePath = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getCharPref('browser.cache.disk.parent_directory') + partialPath;
		} catch (e) {
			var completePath = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('ProfLD', Ci.nsILocalFile).path + partialPath;
		}
		file.initWithPath(completePath);
		Cc['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Ci.nsIWebBrowserPersist).saveURI(Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService).newURI(gContextMenu.mediaURL || gContextMenu.imageURL, null, null), null, null, null, null, null, file, null);
		str.data = '<img src="file:///' + completePath + '">';
		trans.setTransferData('text/html', str, str.data.length * 2);
		Cc['@mozilla.org/widget/clipboard;1'].createInstance(Ci.nsIClipboard).setData(trans, null, 1);
	};
	//识图
	let copyimageU = document.getElementById('context-copyimage');
	copyimageU.setAttribute('tooltiptext', '右键:识图');
	copyimageU.setAttribute('onclick', 'if (event.button == 2) {gBrowser.addTab("https://iqdb.org/?url=" + gContextMenu.imageURL);closeMenus(this);event.preventDefault();event.stopPropagation();};');
	//粘贴并确定
	let undo = document.getElementById('context-undo');
	undo.setAttribute('label', '粘贴并确定');
	undo.removeAttribute('command');
	undo.setAttribute('oncommand', '((function (event) {goDoCommand("cmd_selectAll");goDoCommand("cmd_paste");window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).sendKeyEvent("keypress", KeyEvent.DOM_VK_RETURN, 0, 0);})).call(this, event);');
})();