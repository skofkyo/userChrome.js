// ==UserScript==
// @name         UAchange
// @description  简单的切换UA按钮
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	'use strict';
	let src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAP0lEQVR42mNgoAZoaGhYD8T/ScTbkQ34Tw7GMIAEF48aQDMDKInG7RQlJEJOJNWL5BlAYn7Yjs2A7VTxP6kAAPufFVAPowwfAAAAAElFTkSuQmCC";
	let newsrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWUlEQVR42mNgoBaor683aWhoOA7E/wng40C1NhgGACXWE6EZhrdiMwAsScilONWNGjAYDUBLF9vJMWA7RQaQ7AVg+t5EQlLejs0AG6DEaSI0nwaqdaFaLgYAVOfpV8oLG2AAAAAASUVORK5CYII=";
	let tooltiptext = '左键:切换UA\n当前UA:默认';
	let newtooltiptext = '左键:切换UA\n当前UA:安卓';
	let ua = "Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";
	let uacPanel = document.getElementById('urlbar-icons').appendChild(document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'image'));
	uacPanel.setAttribute('id','uacPanel');
	uacPanel.setAttribute('class','urlbar-icon');
	let preferencesService = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('');
	if (preferencesService.getPrefType('general.useragent.override') == 0) {
		uacPanel.setAttribute('src', src);
		uacPanel.setAttribute('tooltiptext', tooltiptext);
	} else {
		uacPanel.setAttribute('src', newsrc);
		uacPanel.setAttribute('tooltiptext', newtooltiptext);
	};	
	uacPanel.addEventListener("click", function(e) {
		if (e.button == 0) {
			if (preferencesService.getPrefType("general.useragent.override") == 0) {
				preferencesService.setCharPref("general.useragent.override", ua);
				uacPanel.setAttribute("src", newsrc);
				uacPanel.setAttribute('tooltiptext', newtooltiptext);
			} else {
				preferencesService.clearUserPref("general.useragent.override");
				uacPanel.setAttribute("src", src);
				uacPanel.setAttribute('tooltiptext', tooltiptext);
			}
		}
	}, false);
})();