// ==UserScript==
// @Name                 UndoTab.uc.js
// @description          恢复已关闭标签
// @author               颜太吓
// @include              chrome://browser/content/browser.xul
// @charset              UTF-8
// @version              0.1
// ==/UserScript==
(function() {
	'use strict';
	let History = 20; //历史记录数量
	gPrefService.setIntPref('browser.sessionstore.max_tabs_undo', History);
	document.getElementById('TabsToolbar').appendChild($C('toolbarbutton', {
		id: 'UndoTab-button',
		class: 'toolbarbutton-1',
		removable: 'false',
		tooltiptext: '左键:恢复标签页\n右键:标签页列表',
		onclick: 'UndoTab.ClickBtn(this,event)',
		image: 'chrome://browser/skin/undoCloseTab.png'
	}));
	document.getElementById('mainPopupSet').appendChild($C('menupopup', {
		id: 'UndoTab-popup',
		style: 'max-width: 240px',
		onclick: 'event.preventDefault(); event.stopPropagation();',
		onpopupshowing: 'UndoTab.popupshowing()',
		onpopuphiding: 'UndoTab.popuphiding()'
	}));
	function $C(name, attr) {
		const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
		let el = document.createElementNS(XUL_NS, name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	};
	window.UndoTab = {
		History: History,
		popupshowing: function() {
			document.getElementById('UndoTab-button').setAttribute("open", "true");
			let popup = document.getElementById('UndoTab-popup');
			while (popup.firstChild) popup.removeChild(popup.firstChild);
			let closedTabs = JSON.parse(Cc['@mozilla.org/browser/sessionstore;1'].getService(Ci.nsISessionStore).getClosedTabData(window));
			closedTabs.map(function(item, id) {
				popup.appendChild($C('menuitem', {
					label: item.title,
					image: item.image ? 'moz-anno:favicon:' + item.image : '',
					class: 'menuitem-iconic bookmark-item',
					oncommand: 'undoCloseTab(' + id + ')'
				}));
			});
			popup.appendChild($C('menuseparator'));
			popup.appendChild($C('menuitem', {
				label: '清空历史',
				oncommand: 'UndoTab.ClearHistory()'
			}));
		},
		popuphiding: function() {
			document.getElementById('UndoTab-button').removeAttribute("open");
		},
		ClickBtn: function(aNode, aEvent) {
			aEvent.preventDefault();
			aEvent.stopPropagation();
			let ClosedTabCount = Cc['@mozilla.org/browser/sessionstore;1'].getService(Ci.nsISessionStore).getClosedTabCount(window);
			if (ClosedTabCount == 0) {
				Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification('', '恢复标签页', '没有可恢复标签页', false, '', null);
			} else {
				if (aEvent.button === 0) {
					undoCloseTab()
				}
				if (aEvent.button === 2) {
					let x = aNode.boxObject.screenX;
					let y = aNode.boxObject.screenY + aNode.boxObject.height;
					document.getElementById('UndoTab-popup').showPopup(aNode, x, y, 'popup', null, null);
				}
			}
		},
		ClearHistory: function() {
			gPrefService.setIntPref('browser.sessionstore.max_tabs_undo', 0);
			gPrefService.setIntPref('browser.sessionstore.max_tabs_undo', this.History);
		},
	};
})();