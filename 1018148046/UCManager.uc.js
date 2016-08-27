// ==UserScript==
// @name         UCManager
// @description  rebuild_userChrome.uc.xul的替代品
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	'use strict';
	function moveMenu() {
		//需要移动的菜单id,移到到功能菜单内
		let menuitems = ['youkuvip', 'ucjsMouseGestures'];
		for (let menuitem of menuitems) {
			let Item = $(menuitem);
			if (Item != null) $('UCmenu-popup').appendChild(Item);
		};
	};
	function addmenu() {
		let mp = $('UCM-popup');
		mp.appendChild($C('menu', {
			label: '功能菜单'
		})).appendChild($C('menupopup', {
			id: 'UCmenu-popup'
		}));
		let list = [{
			label: "打开文件",
			items: [{
				label: "打开Chrome",
				oncommand: 'CQC.exec(CQC.folder(1))'
			}, {
				label: "打开Profile",
				oncommand: 'CQC.exec(CQC.folder(0))'
			}, {
				label: "EDGE中打开",
				oncommand: 'CQC.exec("C:\\WINDOWS\\explorer.exe","microsoft-edge:"+ gBrowser.currentURI.spec)'
			}, {
				label: "IE中打开",
				oncommand: 'CQC.exec("C:\\Program Files\\Internet Explorer\\iexplore.exe",gBrowser.currentURI.spec)'
			}, ]
		}, {
			label: "配置多开",
			items: [{
				label: "测试配置1",
				oncommand: 'CQC.exec(CQC.folder(0) + "\\..\\Firefox\\Firefox.exe","-no-remote -profile ..\\Profiles1")'
			}, {
				label: "测试配置2",
				oncommand: 'CQC.exec(CQC.folder(0) + "\\..\\Firefox\\Firefox.exe","-no-remote -profile ..\\Profiles2")'
			}, {
				label: "测试配置3",
				oncommand: 'CQC.exec(CQC.folder(0) + "\\..\\Firefox\\Firefox.exe","-no-remote -profile ..\\Profiles3")'
			}, ]
		}, {
			label: "编辑文件",
			items: [{
				label: "userChrome",
				oncommand: 'CQC.edit(CQC.folder(1)+"\\userChrome.js")'
			}, {
				label: "UCManager",
				oncommand: 'CQC.edit(CQC.folder(1)+"\\UCManager.uc.js")'
			}, {
				label: "prefs.js",
				oncommand: 'CQC.edit(CQC.folder(0)+"\\prefs.js")'
			}, {
				label: "user.js",
				oncommand: 'CQC.edit(CQC.folder(0)+"\\user.js")'
			}, ]
		}, ];
		for (let menu of list) {
			let pop = mp.appendChild($C('menu', {
				label: menu.label
			})).appendChild($C('menupopup'));
			for (let menuitem of menu.items) {
				pop.appendChild($C("menuitem", {
					label: menuitem.label,
					oncommand: menuitem.oncommand.replace(/\\/g, '\\\\')
				}));
			}
		}
	};
	function addbtn() {
		$('mainPopupSet').appendChild($C('menupopup', {
			id: 'UCM-popup',
			position: 'after_start',
			onclick: 'event.preventDefault(); event.stopPropagation();',
			onpopupshowing: 'let mp = event.target;'
			+ 'if (mp.id != "UCM-popup") {return;}'
			+ 'if (mp.triggerNode) {mp.triggerNode.setAttribute("open", "true");}'
			+ 'if (mp !== event.currentTarget) {return;}',
			onpopuphiding: 'let mp = event.target;'
			+ 'if (mp.id != "UCM-popup") {return;}'
			+ 'if (mp.triggerNode){mp.triggerNode.removeAttribute("open");}'
		}));
		CustomizableUI.createWidget({
			id: 'UCManager',
			type: 'custom',
			defaultArea: CustomizableUI.AREA_NAVBAR,
			onBuild: function(aDocument) {
				let toolbarbutton = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
				let attributes = {
					id: 'UCManager',
					class: 'toolbarbutton-1',
					removable: 'true',
					onclick: 'if (event.button === 1) {event.preventDefault();event.stopPropagation();'
					+ 'Services.appinfo.invalidateCachesOnRestart();BrowserUtils.restartApplication();}',
					label: 'UC管理器',
					type: 'menu',
					tooltiptext: '中键:重启浏览器',
					popup: "UCM-popup"
				};
				Object.keys(attributes).forEach(function(n) toolbarbutton.setAttribute(n, attributes[n]));
				return toolbarbutton;
			}
		})
	};
	function UCmenu() {
		let mp = $('UCM-popup');
		mp.appendChild($C('menuseparator', {
			class: 'uc-menuseparator'
		}));
		for (let dir of userChrome_js.UCfiles) {
			if (dir.file.length == 0) continue;
			let ucmp = mp.appendChild($C("menu", {
				class: "uc-menu",
				label: dir.folder
			})).appendChild($C("menupopup"));
			for (let scripts of dir.file) {
				let scriptname = scripts.scriptname;
				ucmp.appendChild($C("menuitem", {
					label: scriptname.replace(/\.uc\.js$|\.uc\.xul$/g, ''),
					type: "checkbox",
					checked: userChrome_js.disablescript.indexOf(scriptname) == -1,
					oncommand: 'let scriptname = "' + scriptname + '";'
					+ 'let s = Preferences.get("userChrome.disable.script");'
					+ 'if (userChrome_js.disablescript.indexOf(scriptname) == -1) {'
					+ 's = (s + ",").replace(scriptname + ",", "") + scriptname + ",";'
					+ '}else{'
					+ 's = (s + ",").replace(scriptname + ",", "");}'
					+ 's = s.replace(/,,/g, ",").replace(/^,/, "");'
					+ 'Preferences.set("userChrome.disable.script", s);'
					+ 'userChrome_js.disablescript = s;',
					onclick: 'if (event.button === 2) {CQC.edit("' + scripts.scriptpath.replace(/\\/g, '\\\\') + '");}'
				}));
			}
		}
	};
	function addstyle() {
		let cssStr = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);'
		+ '@-moz-document url("chrome://browser/content/browser.xul"){'
		+ '#UCManager[cui-areatype="toolbar"]>.toolbarbutton-icon{list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABBSURBVDhPY6AUMIIIHx+f/2AeEGzZsgUsBgK4xJEBE5QmGwwDAzACkRQACthB4gVcYGikA6K9gA0MjligEDAwAABeLRQZBbQvKAAAAABJRU5ErkJggg==);}'
		+ 'toolbar[brighttext]>#UCManager[cui-areatype="toolbar"]>.toolbarbutton-icon{list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWElEQVR42mNIS0v7b2hoCMRGYAziMwABRNwIQxwDgCSRAYiPTxyLAYaUGmA0CA2AYVziKAGLrpAUAHbVwBuAnmBIDgNcgOhYIMUAilyAMwwGrwH4Ygc5DADQRCaVzUm2owAAAABJRU5ErkJggg==);}'
		+ '#UCManager[cui-areatype="menu-panel"]>.toolbarbutton-icon,toolbarpaletteitem[place="palette"]>#UCManager>.toolbarbutton-icon{list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACwSURBVFhHYxhowAilGSor6zUYmRl9///9v7m9vfEGVBgvIEcPOmCC0kAW47L/DIxdIBoqQhiQowcNIBzAyGiIQhMDyNGDBhAOGCAw6oBRB4w6YNQBow5A1IY1jf+hTNqD///PM/z7HwWqQQcmBICVF6gaBzERDmBkmAdl0R4AQwDUhgAx4VFADkCOtvaWerLMGs0Fow4YdcCoA6hWEJEEBmddQA4gt/5AqgtGOmBgAAAvJD35T3a11AAAAABJRU5ErkJggg==);}'
		+ '#UCM-popup>.uc-menuseparator{-moz-box-ordinal-group:998;}'
		+ '#UCM-popup>.uc-menu{-moz-box-ordinal-group:999;}'
		+ '#UCM-popup>.uc-menu>menupopup>menuitem:not([checked="true"]){-moz-box-ordinal-group:999;color:#999!important;}'
		+ '}';
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
		sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);
	};
	addbtn();
	addstyle();
	UCmenu();
	addmenu();
	moveMenu();
	function $(id) {
		return document.getElementById(id);
	};
	function $C(name, attr) {
		const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
		let el = document.createElementNS(XUL_NS, name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	};
	window.CQC = {
		exec: function(path, arg) {
			let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			let process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			let a;
			if (typeof arg == 'string' || arg instanceof String) {
				a = arg.split(/\s+/)
			} else if (Array.isArray(arg)) {
				a = arg;
			} else {
				a = [arg];
			}
			file.initWithPath(path);
			if (!file.exists()) {
				Cu.reportError('File Not Found: ' + path);
				return;
			}
			if (file.isExecutable()) {
				process.init(file);
				process.runw(false, a, a.length);
			} else {
				file.launch();
			}
		},
		folder: function(key) {
			switch (key) {
			case 0:
				var path = Services.dirsvc.get("ProfD", Ci.nsILocalFile).path;
				break;
			case 1:
				var path = Services.dirsvc.get("UChrm", Ci.nsILocalFile).path;
				break;
			}
			return path;
		},
		edit: function(path) {
			CQC.exec(Services.prefs.getCharPref('view_source.editor.path'), path);
		},
	};
	(function() {
		let PATH = '/chrome/Local/Notepad2.exe';
		let handleRelativePath = function(path) {
			if (path) {
				path = path.replace(/\//g, '\\').toLocaleLowerCase();
				let ProfD = CQC.folder(0);
				return ProfD + path;
			}
		};
		let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(handleRelativePath(PATH));
		if (file.exists()) {
			gPrefService.setCharPref('view_source.editor.path', file.path);
		}
	})();
}());