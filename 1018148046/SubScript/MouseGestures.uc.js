// ==UserScript==
// @name                 Mousegestures.uc.js
// @namespace            Mousegestures@gmail.com
// @description          自定义鼠标手势,自用 DIY版
// @author               紫云飞&黒仪大螃蟹
// @homepageURL          http://www.cnblogs.com/ziyunfei/archive/2011/12/15/2289504.html
// @include              chrome://browser/content/browser.xul
// @charset              UTF-8
// ==/UserScript==
(function() {
	'use strict';
	window.ucjsMouseGestures = {
		trailColor: '#3133FF',//轨迹颜色		
		trailSize: 4,//轨迹粗细	
		lastX: 0,
		lastY: 0,
		directionChain: '',
		isMouseDownL: false,
		isMouseDownR: false,
		hideFireContext: false,
		shouldFireContext: false,
		GESTURES: {},
		createMenuitem: function() {
			var menuitem = document.createElement('menuitem');
			menuitem.setAttribute('id', 'ucjsMouseGestures');
			menuitem.setAttribute('class', 'menuitem-iconic');
			menuitem.setAttribute('label', '鼠标手势');
			menuitem.setAttribute('class', 'menuitem-iconic');
			menuitem.setAttribute('tooltiptext', '左键:编辑配置\n右键:重载配置');
			menuitem.setAttribute('oncommand', 'ucjsMouseGestures.edit(ucjsMouseGestures.file);');
			menuitem.setAttribute('onclick', 'if (event.button == 2) {event.preventDefault();closeMenus(event.currentTarget);ucjsMouseGestures.reload(true);}');
			var insPos = document.getElementById('devToolsSeparator');
			insPos.parentNode.insertBefore(menuitem, insPos);
		},
		init: function() {
			this.reload();
			var self = this;
			['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'DOMMouseScroll'].forEach(function(type) {
				gBrowser.mPanelContainer.addEventListener(type, self, true);
			});
			gBrowser.mPanelContainer.addEventListener('unload', function() {
				['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'DOMMouseScroll'].forEach(function(type) {
					gBrowser.mPanelContainer.removeEventListener(type, self, true);
				});
			}, false);
		},
		reload: function(isAlert) {
			var file = this.getMouseGesturesFile();
			if (!file.exists()) return this.alert('Load Error: 配置文件不存在');
			try {
				this.importMouseGestures(file);
			} catch (e) {
				this.alert('Error: ' + e + '\n请重新检查配置文件');
				return;
			}
			if (isAlert) this.alert('配置已经重新载入');
		},
		alert: function(aString, aTitle) {
			Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification('', aTitle || 'MouseGestures', aString, false, '', null);
		},
		getMouseGesturesFile: function() {
			var aFile = Services.dirsvc.get('UChrm', Ci.nsILocalFile);
			aFile.appendRelativePath('Local');
			aFile.appendRelativePath('_mouseGestures.js');
			if (!aFile.exists() || !aFile.isFile()) return null;
			delete this.file;
			return this.file = aFile;
		},
		importMouseGestures: function(file) {
			var fstream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
			var sstream = Cc['@mozilla.org/scriptableinputstream;1'].createInstance(Ci.nsIScriptableInputStream);
			fstream.init(file, -1, 0, 0);
			sstream.init(fstream);
			var data = sstream.read(sstream.available());
			try {
				data = decodeURIComponent(escape(data));
			} catch (e) {}
			sstream.close();
			fstream.close();
			this.GESTURES = new Function('', 'return ' + data)();
			return;
		},
		edit: function(aFile) {
			if (!aFile || !aFile.exists() || !aFile.isFile()) return;
			var editor;
			try {
				editor = Services.prefs.getComplexValue('view_source.editor.path', Ci.nsILocalFile);
			} catch (e) {
				this.alert('请设置编辑器的路径。\nview_source.editor.path');
				toOpenWindowByType('pref:pref', 'about:config?filter=view_source.editor.path');
				return;
			}
			var UI = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
			UI.charset = window.navigator.platform.toLowerCase().indexOf('win') >= 0 ? 'gbk' : 'UTF-8';
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			try {
				var path = UI.ConvertFromUnicode(aFile.path);
				var args = [path];
				process.init(editor);
				process.run(false, args, args.length);
			} catch (e) {
				this.alert('编辑器不正确！')
			}
		},
		handleEvent: function(event) {
			switch (event.type) {
			case 'mousedown':
				if (/object|embed/i.test(event.target.localName)) return;
				if (event.button == 2) {
					event.preventDefault();
					event.stopPropagation();
					this.isMouseDownR = true;
					this.hideFireContext = false;
					[this.lastX, this.lastY, this.directionChain] = [event.screenX, event.screenY, ''];
				}
				if (event.button == 0) {
					this.isMouseDownR = false;
					this.directionChain = '';
					this.stopGesture(event);
				}
				break;
			case 'mousemove':
				if (this.isMouseDownR) {
					this.hideFireContext = true;
					var [subX, subY] = [event.screenX - this.lastX, event.screenY - this.lastY];
					var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
					var direction;
					if (distX < 10 && distY < 10) return;
					if (distX > distY) direction = subX < 0 ? 'L' : 'R';
					else direction = subY < 0 ? 'U' : 'D';
					if (!this.xdTrailArea) {
						this.xdTrailArea = document.createElement('hbox');
						var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
						canvas.setAttribute('width', window.screen.width);
						canvas.setAttribute('height', window.screen.height);
						this.xdTrailAreaContext = canvas.getContext('2d');
						this.xdTrailArea.style.cssText = '-moz-user-focus: none !important;' + '-moz-user-select: none !important;' + 'display: -moz-box !important;' + 'box-sizing: border-box !important;' + 'pointer-events: none !important;' + 'margin: 0 !important;' + 'padding: 0 !important;' + 'width: 100% !important;' + 'height: 100% !important;' + 'border: none !important;' + 'box-shadow: none !important;' + 'overflow: hidden !important;' + 'background: none !important;' + 'opacity: 0.9 !important;' + 'position: fixed !important;' + 'z-index: 2147483647 !important;';
						this.xdTrailArea.appendChild(canvas);
						gBrowser.selectedBrowser.parentNode.insertBefore(this.xdTrailArea, gBrowser.selectedBrowser.nextSibling);
					}
					if (this.xdTrailAreaContext) {
						this.xdTrailAreaContext.strokeStyle = this.trailColor;
						this.xdTrailAreaContext.lineJoin = 'round';
						this.xdTrailAreaContext.lineCap = 'round';
						this.xdTrailAreaContext.lineWidth = this.trailSize;
						this.xdTrailAreaContext.beginPath();
						this.xdTrailAreaContext.moveTo(this.lastX - gBrowser.selectedBrowser.boxObject.screenX, this.lastY - gBrowser.selectedBrowser.boxObject.screenY);
						this.xdTrailAreaContext.lineTo(event.screenX - gBrowser.selectedBrowser.boxObject.screenX, event.screenY - gBrowser.selectedBrowser.boxObject.screenY);
						this.xdTrailAreaContext.closePath();
						this.xdTrailAreaContext.stroke();
						this.lastX = event.screenX;
						this.lastY = event.screenY;
					}
					if (direction != this.directionChain.charAt(this.directionChain.length - 1)) {
						this.directionChain += direction;
						XULBrowserWindow.statusTextField.label = this.GESTURES[this.directionChain] ? '手势: ' + this.directionChain + ' ' + this.GESTURES[this.directionChain].name : '未知手势:' + this.directionChain;
					}
				}
				break;
			case 'mouseup':
				if (this.isMouseDownR && event.button == 2) {
					if (this.directionChain) this.shouldFireContext = false;
					this.isMouseDownR = false;
					this.directionChain && this.stopGesture(event);
				}
				break;
			case 'contextmenu':
				if (this.isMouseDownR || this.hideFireContext) {
					var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
					var contextmenu = pref.getBoolPref('dom.event.contextmenu.enabled');
					pref.setBoolPref('dom.event.contextmenu.enabled', true);
					setTimeout(function() {
						pref.setBoolPref('dom.event.contextmenu.enabled', contextmenu);
					}, 10);
					this.shouldFireContext = true;
					this.hideFireContext = false;
					event.preventDefault();
					event.stopPropagation();
				}
				break;
			case 'DOMMouseScroll':
				if (this.isMouseDownR) {
					event.preventDefault();
					event.stopPropagation();
					this.shouldFireContext = false;
					this.hideFireContext = true;
					this.directionChain = 'W' + (event.detail > 0 ? '+' : '-');
					this.stopGesture(event);
				}
				break;
			}
		},
		stopGesture: function(event) {
			if (this.GESTURES[this.directionChain]) this.GESTURES[this.directionChain].cmd(this, event);
			if (this.xdTrailArea) {
				this.xdTrailArea.parentNode.removeChild(this.xdTrailArea);
				this.xdTrailArea = null;
				this.xdTrailAreaContext = null;
			}
			this.directionChain = '';
			setTimeout(function() {
				XULBrowserWindow.statusTextField.label = '';
			}, 2000);
			this.hideFireContext = true;
		}
	};
	ucjsMouseGestures.createMenuitem();
	ucjsMouseGestures.init();
})();