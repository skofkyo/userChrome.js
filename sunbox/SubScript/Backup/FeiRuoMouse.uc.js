// ==UserScript==
// @name 			FeiRuoMouse.uc.js
// @description		手势与拖拽
// @author			feiruo
// @namespace		feiruosama@gmail.com
// @include			main
// @compatibility	Firefox 16
// @charset			UTF-8
// @id 				[4E4E49D6]
// @inspect         window.FeiRuoMouse
// @startup         window.FeiRuoMouse.init();
// @shutdown        window.FeiRuoMouse.onDestroy();
// @optionsURL		about:config?filter=FeiRuoMouse.
// @config 			window.FeiRuoMouse.OpenPref();
// @reviewURL		http://www.feiruo.pw
// @homepageURL		https://github.com/feiruo/userChromeJS/tree/master/FeiRuoMouse
// @downloadURL		https://github.com/feiruo/userChromeJS/raw/master/FeiRuoMouse/FeiRuoMouse.uc.js
// @note            Begin 2015.04.23
// @note            手势与拖拽。
// @version      	0.0.9 	2015.06.20	15:00 	修改机制，需要从新编辑配置文件。
// @version      	0.0.8 	2015.06.10	15:00 	修复切换标签时轨迹不消失问题。
// @version      	0.0.7 	2015.05.30	18:00 	Add mouse button&&staus time&&Fix R<L R>L etc。
// @version      	0.0.6 	2015.05.29	10:00 	delete TextLink&&QRCreator。
// @version      	0.0.5 	2015.05.20	23:00 	Fix Ges disable on some page ex http://news.qq.com/a/20150521/002254.htm。
// @version      	0.0.4 	2015.05.20	23:00 	Fix dead object。
// @version         0.0.3 	2015.05.18 	15:00	修复拖拽，自定义手势轨迹。
// @version         0.0.2 	2015.05.17 	15:00	TextLink&QRCreator&E10s。
// @version         0.0.1 	2015.04.28 	10:00	Build。
// ==/UserScript==
(function() {

	let {
		classes: Cc,
		interfaces: Ci,
		utils: Cu,
		results: Cr
	} = Components;

	if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

	if (window.FeiRuoMouse) {
		window.FeiRuoMouse.onDestroy();
		delete window.FeiRuoMouse;
	}

	var FeiRuoMouse = {
		DragIng: {},
		GesIng: {},
		get Prefs() {
			delete this.Prefs;
			return this.Prefs = Services.prefs.getBranch("userChromeJS.FeiRuoMouse.");
		},
		get file() {
			let aFile;
			aFile = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
			aFile.appendRelativePath("Local");
			aFile.appendRelativePath("_FeiRuoMouse.js");
			try {
				this._modifiedTime = aFile.lastModifiedTime;
			} catch (e) {}
			delete this.file;
			return this.file = aFile;
		},

		init: function() {
			var ins = $("menu_ToolsPopup").firstChild;
			ins.parentNode.insertBefore($C("menuitem", {
				id: "FeiRuoMouse_set",
				label: "鼠标拖拽及手势配置",
				tooltiptext: "左键：打开配置窗口\n中键：重载配置文件\n右键：打开配置文件",
				onclick: "FeiRuoMouse.SetMenuItmClick(event);",
				class: "menuitem-iconic",
				image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAANwAAADcBYx2BhQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFOSURBVDiNldO/a5UxFMbxj/VHQai0+RscS4cIrioOLk4i4ipUcKlZHO0oOOgQEEQo4qwggigIrm7eOLg7FOE6RVSwosjr0PeWy/ujxQfOcpLnm5yTE03TGIqVyc2lsbX5ONQ0jXmFkhbwFiu4XWN+ZR8tDOTWMMV1XNnPPAY4jh38wPJBgCMj0L/4hXOhpAke4H2N+eP/Ar7gIj7jXSjpKx7VmF/3SgglrYWSXuJuC/jWbp5iC2dxHuuhpM2Zb+8VQklbeIKIpRrzne7VQkmn8AkvasxnuiV8wIUa82bXOFONeRJKWsZirwQ8xuVQ0okxQKtj+N0D1Jh32hJuHAA4abepvRvAQ1wLJS0a11U8HQTUmL/jOdaHnKGko3ZfYm+8hybxHjZGerGBZzXmP7NE7zO1J93CJWx3llZxusb8c5YYmkS4jzc43MlP583wDyHKkkt8iujJAAAAAElFTkSuQmCC",
			}), ins);

			this.loadSetting();
			this.loadCustomCommand();

			this.Prefs.addObserver('', this.Prefobs, false);
			window.addEventListener("unload", function() {
				FeiRuoMouse.onDestroy();
			}, false);
		},

		onDestroy: function() {
			this.Listen_Ges(false);
			this.Listen_Drag(false);
			this.TextToLink = false;
			if (this.getWindow(0)) this.getWindow(0).close();
			if (this.getWindow(1)) this.getWindow(1).close();
			this.Prefs.removeObserver('', this.Prefobs, false);
			if ($("FeiRuoMouse_set")) $("FeiRuoMouse_set").parentNode.removeChild($("FeiRuoMouse_set"));
			Services.obs.notifyObservers(null, "startupcache-invalidate", "");
		},

		SetMenuItmClick: function(e) {
			if (e.target != e.currentTarget) return;
			if (e.button == 0)
				this.OpenPref();
			else if (e.button == 1)
				this.loadCustomCommand(true);
			else if (e.button == 2)
				this.Edit(this.file);
			e.stopPropagation();
			e.preventDefault();
		},

		Prefobs: function(subject, topic, data) {
			if (topic == 'nsPref:changed') {
				switch (data) {
					case 'DragCustom':
					case 'GesCustom':
					case 'GesTrailEnabel':
					case 'trailSize':
					case 'trailColor':
					case 'isStatus':
					case 'StatusTime':
					case 'GesIngBtn':
						FeiRuoMouse.loadSetting(data);
						break;
				}
			}
		},

		loadSetting: function(type) {
			if (!type || type === "DragCustom") {
				this.DragCustom = unescape(this.getPrefs(2, "DragCustom", ""));
				this.DragRules_Image = {};
				this.DragRules_Url = {};
				this.DragRules_Text = {};
				this.DragRules_AnyImage = {};
				this.DragRules_AnyUrl = {};
				this.DragRules_AnyText = {};
				this.loadRule("DragCustom", this.DragCustom);
				this.Listen_Drag(true);
			}

			if (!type || type === "GesCustom") {
				this.GesCustom = unescape(this.getPrefs(2, "GesCustom", ""));
				this.GesturesRules = {};
				this.loadRule("GesCustom", this.GesCustom);
				this.Listen_Ges(true);
			}

			if (!type || type === "GesIngBtn")
				this.GesIngBtn = this.getPrefs(1, "GesIngBtn", 2);

			if (!type || type === "isStatus")
				this.isStatus = this.getPrefs(0, "isStatus", true);

			if (!type || type === "StatusTime")
				this.StatusTime = this.getPrefs(1, "StatusTime", 3000);

			if (!type || type === "GesTrailEnabel")
				this.GesTrailEnabel = this.getPrefs(0, "GesTrailEnabel", true);

			if (!type || type === "trailSize")
				this.trailSize = this.getPrefs(1, "trailSize", 2);

			if (!type || type === "trailColor")
				this.trailColor = this.getPrefs(2, "trailColor", "brown");
		},

		loadRule: function(Prefs, val) {
			var Rules = val.split(";;");
			if (!Rules[0]) return;

			for (var i in Rules) {
				var Rule = Rules[i].split("|");
				var obj = {};
				var Enable = Rule[0] || "",
					Command = Rule[1] || "",
					Action = Rule[2] || "",
					Type = Rule[3] || "",
					Key = Rule[4] || "",
					TKey = Rule[5] || "";

				obj.Enable = Enable;
				obj.Command = Command;

				if (Action.indexOf("R") == 0 && Action.match(">"))
					Action = "L<R";
				else if (Action.indexOf("R") == 0 && Action.match("<"))
					Action = "L>R";

				obj.Action = Action;
				obj.Type = Type;
				obj.TKey = TKey;

				var keys = [];
				if (Key) {
					if (Key.match("Alt"))
						keys.push("Alt")
					if (Key.match("Ctrl"))
						keys.push("Ctrl")
					if (Key.match("Shift"))
						keys.push("Shift")
				}
				Key = keys.join("+");
				obj.Key = Key;

				if (Prefs == "DragCustom" && Type) {
					if (Action != "ANY")
						FeiRuoMouse["DragRules_" + Type][Action] = obj;
					else
						FeiRuoMouse["DragRules_Any" + Type][Key] = obj;
				} else if (Prefs == "GesCustom") {
					FeiRuoMouse.GesturesRules[Action] = obj;
				}
			}
		},

		loadCustomCommand: function(isAlert) {
			if (this.file && this.file.exists() && this.file.isFile())
				var data = this.loadFile(this.file);

			if (!data)
				return alert("自定义命令配置文件不存在！");

			var sandbox = new Cu.Sandbox(new XPCNativeWrapper(window));
			sandbox.Components = Components;
			sandbox.Cc = Cc;
			sandbox.Ci = Ci;
			sandbox.Cr = Cr;
			sandbox.Cu = Cu;
			sandbox.Services = Services;
			sandbox.locale = Services.prefs.getCharPref("general.useragent.locale");

			try {
				var lineFinder = new Error();
				Cu.evalInSandbox(data, sandbox, "1.8");
			} catch (e) {
				let line = e.lineNumber - lineFinder.lineNumber - 1;
				var ErrMsg = e + "请重新检查配置文件第 " + line + " 行！";
				log(ErrMsg);
				if (isAlert) alert("Rebuild Error: \n" + ErrMsg);
				return;
			}

			delete this.DragCustomCommand;
			delete this.GesCustomCommand;
			var DragCustomCommand = sandbox.DragCustomCommand || {};
			var GesCustomCommand = sandbox.GesCustomCommand || {};
			this.DragCustomCommand = {};
			this.GesCustomCommand = {};

			for (var i in DragCustomCommand) {
				this.DragCustomCommand[DragCustomCommand[i].label] = DragCustomCommand[i];
			}
			for (var i in GesCustomCommand) {
				this.GesCustomCommand[GesCustomCommand[i].label] = GesCustomCommand[i];
			}
			if (isAlert)
				alert('自定义命令重载完成！');
		},

		/*****************************************************************************************/
		Listen_Ges: function(isAlert) {
			gBrowser.mPanelContainer.removeEventListener("mousedown", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.ownerDocument.defaultView.document.documentElement.removeEventListener("mousemove", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.ownerDocument.defaultView.document.documentElement.removeEventListener("mouseup", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.removeEventListener("contextmenu", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.removeEventListener("draggesture", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.removeEventListener("DOMMouseScroll", FeiRuoMouse.Listener_Ges, true);

			if (!isAlert) return;

			gBrowser.mPanelContainer.addEventListener("mousedown", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.ownerDocument.defaultView.document.documentElement.addEventListener("mousemove", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.ownerDocument.defaultView.document.documentElement.addEventListener("mouseup", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.addEventListener("contextmenu", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.addEventListener("draggesture", FeiRuoMouse.Listener_Ges, true);
			gBrowser.mPanelContainer.addEventListener("DOMMouseScroll", FeiRuoMouse.Listener_Ges, true);
		},

		Listen_Drag: function(isAlert) {
			var Events = ["dragstart", "drag", "dragover", "drop"];
			Events.forEach(function(type) {
				gBrowser.mPanelContainer.removeEventListener(type, FeiRuoMouse.Listener_Drag, false);
			});

			if (!isAlert) return;

			Events.forEach(function(type) {
				gBrowser.mPanelContainer.addEventListener(type, FeiRuoMouse.Listener_Drag, false);
			});
		},

		/*****************************************************************************************/
		Listener_Drag: function(event) {
			var that = FeiRuoMouse.DragIng;
			switch (event.type) {
				case "dragstart":
					that.lastPoint = [event.screenX, event.screenY];
					that.sourceNode = event.target;
					that.directionChain = "";
					event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
					break;
				case "drag":
					//that.dragFromInside = true;
					break;
				case "dragover":
					if (!that.lastPoint) return;
					Cc["@mozilla.org/widget/dragservice;1"].getService(Ci.nsIDragService).getCurrentSession().canDrop = true;
					var [subX, subY] = [event.screenX - that.lastPoint[0], event.screenY - that.lastPoint[1]];
					var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
					var direction;
					if (distX < 10 && distY < 10) return;
					if (distX > distY) direction = subX < 0 ? "L" : "R";
					else direction = subY < 0 ? "U" : "D";
					if (direction != that.directionChain.charAt(that.directionChain.length - 1)) {
						that.directionChain += direction;
						that.Drag = that.directionChain;
						FeiRuoMouse.ActionStaus(event, that.Drag);
					}
					that.lastPoint = [event.screenX, event.screenY];
					break;
				case "drop":
					if (that.lastPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
						event.preventDefault();
						event.stopPropagation();
						var type;
						if (event.dataTransfer.types.contains("application/x-moz-file-promise-url"))
							type = "Image";
						else if (event.dataTransfer.types.contains("text/x-moz-url"))
							type = "Url";
						else
							type = "Text";
						that.lastPoint = "";
						FeiRuoMouse.Listen_AidtKey(event, that.Drag, type);
					}
					break;
			}
		},

		Listener_Ges: function(event) {
			var that = FeiRuoMouse.GesIng;
			switch (event.type) {
				case "mousedown":
					if (gInPrintPreviewMode) return;
					if (event.target instanceof HTMLCanvasElement && event.target.parentNode instanceof Ci.nsIDOMXULElement) return;
					if (event.button == FeiRuoMouse.GesIngBtn) {
						event.preventDefault();
						event.stopPropagation();
						that.isGesIngBtn = true;
						that._hideFireContext = false;
						FeiRuoMouse.StartGesture(event);
					}
					if (event.button == 2)
						that._isMouseDownR = true;
					if (event.button == 2 && that._isMouseDownL) {
						that._isMouseDownR = false;
						that._shouldFireContext = false;
						that._hideFireContext = true;
						that._directionChain = "L>R";
						FeiRuoMouse.ActionStaus(event, that._directionChain);
						FeiRuoMouse.StopGesture(event);
					} else if (event.button == 0) {
						that._isMouseDownL = true;
						if (that._isMouseDownR) {
							that._isMouseDownL = false;
							that._shouldFireContext = false;
							that._hideFireContext = true;
							that._directionChain = "L<R";
							FeiRuoMouse.ActionStaus(event, that._directionChain);
							FeiRuoMouse.StopGesture(event);
						}
					}
					break;
				case "mousemove":
					if (that.isGesIngBtn) {
						that._hideFireContext = true;
						FeiRuoMouse.ProgressGesture(event);
					}
					break;
				case "mouseup":
					if (that.isGesIngBtn && event.button == FeiRuoMouse.GesIngBtn) {
						if (that._directionChain)
							that._shouldFireContext = false;
						that.isGesIngBtn = false;
						that._directionChain && FeiRuoMouse.StopGesture(event);
						if (that._shouldFireContext && !that._hideFireContext) {
							that._shouldFireContext = false;
							FeiRuoMouse._displayContextMenu(event);
						}
					}
					if (that._isMouseDownR && event.button == 2)
						that._isMouseDownR = false;
					else if (event.button == 0 && that._isMouseDownL)
						that._isMouseDownL = false;
					that._shouldFireContext = false;
					break;
				case "contextmenu":
					if (that._isMouseDownL || that.isGesIngBtn || that._hideFireContext) {
						var pref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
						var contextmenu = pref.getBoolPref("dom.event.contextmenu.enabled");
						pref.setBoolPref("dom.event.contextmenu.enabled", true);
						setTimeout(function() {
							pref.setBoolPref("dom.event.contextmenu.enabled", contextmenu);
						}, 10);
						event.preventDefault();
						event.stopPropagation();
						that._shouldFireContext = true;
						that._hideFireContext = false;
					}
					break;
				case "DOMMouseScroll":
					if (that.isGesIngBtn) {
						event.preventDefault();
						event.stopPropagation();
						that._shouldFireContext = false;
						that._hideFireContext = true;
						that._directionChain = "W" + (event.detail > 0 ? "+" : "-");
						FeiRuoMouse.StopGesture(event);
					}
					break;
				case "draggesture":
					that._isMouseDownL = false;
					break;
			}
		},

		/*****************************************************************************************/
		Listen_AidtKey: function(event, dChain, type) {
			var EventKey = this.ActionEventKey(event);
			var obj;
			if (!type) {
				obj = this.GesturesRules[dChain];
				type = "Ges";
			} else {
				obj = this["DragRules_" + type][dChain] || this["DragRules_Any" + type][EventKey];
				type = "Drag";
			}

			if (!obj)
				return this.ActionStaus(event, dChain);

			if (obj.Enable != "1")
				return this.ActionStaus(event, dChain, obj.label + "(未启用)");

			if (!obj.Key || (obj.TKey != "1" && EventKey == obj.Key) || (obj.TKey == "1" && EventKey != obj.Key))
				FeiRuoMouse.Listen_Command(type, event, obj, dChain);
			else
				this.ActionStaus(event, dChain);
		},

		Listen_Command: function(type, event, obj, dChain) {
			event.stopPropagation();
			event.preventDefault();
			var command = obj.Command;
			var cmd = this[type + "CustomCommand"][command];
			if (cmd) {
				try {
					var funstr = cmd.command.toString().replace(/^function.*{|}$/g, "");
					(new Function("event", funstr))(event);
				} catch (ex) {
					log(command + "(执行错误：" + ex + ")")
					status(command + "(执行错误：" + ex + ")");
				}
			} else
				this.ActionStaus(event, dChain, command);
		},

		ActionStaus: function(event, dChain, str) {
			if (!this.isStatus) return;
			var type = this.ActionEventType(event);
			var key = this.ActionEventKey(event);
			if (!str) {
				var obj;
				if (type)
					obj = FeiRuoMouse["DragRules_" + type.en][dChain] || FeiRuoMouse["DragRules_Any" + type.en][key];
				else
					obj = FeiRuoMouse.GesturesRules[dChain];
			}

			if (obj) {
				str = obj.Command ? ("(" + obj.Command + ")") : "";

				if (!obj.TKey && key != obj.Key)
					str = "";

				if (obj.TKey && key == obj.Key)
					str = str + "(已排除)";
			}

			type = type ? (type.cn + "拖拽：") : "手势：";
			key = key ? (key + "+") : "";
			status(type + key + dChain + (str ? str : "(未定义)"));
		},

		ActionEventKey: function(event) {
			var EventKey = [];
			if (event.altKey)
				EventKey.push("Alt")
			if (event.ctrlKey)
				EventKey.push("Ctrl")
			if (event.shiftKey)
				EventKey.push("Shift")
			EventKey = EventKey.join("+");
			return EventKey;
		},

		ActionEventType: function(event) {
			var drag = event.dataTransfer;
			if (!drag) return "";
			var type = {};
			if (drag.types.contains("application/x-moz-file-promise-url")) {
				type.en = "Image";
				type.cn = "图片";
			} else if (drag.types.contains("text/x-moz-url")) {
				type.en = "Url";
				type.cn = "链接";
			} else {
				type.en = "Text";
				type.cn = "文字";
			}
			return type;
		},

		/*****************************************************************************************/
		_displayContextMenu: function(event) {
			var evt = event.originalTarget.ownerDocument.createEvent("MouseEvents");
			evt.initMouseEvent("contextmenu", true, true, event.originalTarget.defaultView, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 2, null);
			event.originalTarget.dispatchEvent(evt);
		},

		StartGesture: function(event) {
			var that = FeiRuoMouse.GesIng;
			that._lastX = event.screenX;
			that._lastY = event.screenY;
			that._directionChain = "";
			if (!this.GesTrailEnabel) return;
			var obj = {
				trailSize: this.trailSize || 2,
				trailColor: this.trailColor || "brown",
			};
			var str = JSON.stringify(obj);
			if (window.content)
				this.GesTrails.CreateTrail(str, event.view);
			else {
				if (!gBrowser.selectedBrowser.contentWindowAsCPOW.FeiRuoMouse_GesTrails)
					gBrowser.selectedBrowser.messageManager.loadFrameScript("data:application/x-javascript;charset=UTF-8," + escape("content.FeiRuoMouse_GesTrails=" + this.obj2str(this.GesTrails) + ";"), true);
				gBrowser.selectedBrowser.messageManager.loadFrameScript("data:application/x-javascript;charset=UTF-8,if(content.FeiRuoMouse_GesTrails){content.FeiRuoMouse_GesTrails.CreateTrail('" + escape(str) + "');}", true);
			}
		},

		ProgressGesture: function(event) {
			var that = FeiRuoMouse.GesIng;
			var x = event.screenX,
				y = event.screenY;
			var lastX = that._lastX,
				lastY = that._lastY;
			var subX = x - lastX,
				subY = y - lastY;
			var distX = (subX > 0 ? subX : (-subX)),
				distY = (subY > 0 ? subY : (-subY));
			var direction;
			if (distX < 10 && distY < 10) return;
			if (distX > distY) direction = subX < 0 ? "L" : "R";
			else direction = subY < 0 ? "U" : "D";
			var dChain = that._directionChain;
			if (this.GesTrailEnabel) {
				var obj = {
					x1: that._lastX,
					y1: that._lastY,
					x2: x,
					y2: y
				};
				var str = JSON.stringify(obj);

				if (window.content)
					this.GesTrails.DrawTrail(str);
				else
					gBrowser.selectedBrowser.messageManager.loadFrameScript("data:application/x-javascript;charset=UTF-8,if(content.FeiRuoMouse_GesTrails){content.FeiRuoMouse_GesTrails.DrawTrail('" + escape(str) + "');}", true);
			}

			if (direction != dChain.charAt(dChain.length - 1)) {
				dChain += direction;
				that._directionChain += direction;
				this.ActionStaus(event, dChain);
			}
			that._lastX = x;
			that._lastY = y;
		},

		StopGesture: function(event) {
			var that = FeiRuoMouse.GesIng;
			this.Listen_AidtKey(event, that._directionChain);
			that._directionChain = "";
			if (!this.GesTrailEnabel) return;
			if (window.content)
				this.GesTrails.EraseTrail();
			else
				window.messageManager.loadFrameScript("data:application/x-javascript;charset=UTF-8,if(content.FeiRuoMouse_GesTrails){content.FeiRuoMouse_GesTrails.EraseTrail();}", true);
		},

		/*****************************************************************************************/
		obj2str: function(o) {
			var r = [];
			if (typeof o == 'string')
				return '"' + o.replace(/([\'\"\\])/g, '\\$1').replace(/(\n)/g, '\\n').replace(/(\r)/g, '\\r').replace(/(\t)/g, '\\t') + '"';
			if (typeof o == 'undefined')
				return 'undefined';
			if (typeof o == 'object') {
				if (o === null)
					return 'null';
				else if (!o.sort) {
					for (var i in o)
						r.push(i + ':' + FeiRuoMouse.obj2str(o[i]))
					r = '{' + r.join() + '}'
				} else {
					for (var i = 0; i < o.length; i++)
						r.push(FeiRuoMouse.obj2str(o[i]))
					r = '[' + r.join() + ']'
				}
				return r;
			}
			return o.toString();
		},

		getPrefs: function(type, name, val) {
			switch (type) {
				case 0:
					if (!this.Prefs.prefHasUserValue(name) || this.Prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_BOOL)
						this.Prefs.setBoolPref(name, val ? val : false);
					return this.Prefs.getBoolPref(name);
					break;
				case 1:
					if (!this.Prefs.prefHasUserValue(name) || this.Prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_INT)
						this.Prefs.setIntPref(name, val ? val : 0);
					return this.Prefs.getIntPref(name);
					break;
				case 2:
					if (!this.Prefs.prefHasUserValue(name) || this.Prefs.getPrefType(name) != Ci.nsIPrefBranch.PREF_STRING)
						this.Prefs.setCharPref(name, val ? val : "");
					return this.Prefs.getCharPref(name);
					break;
			}
		},

		getWindow: function(num) {
			var windowsMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
			if (num === 0)
				return windowsMediator.getMostRecentWindow("FeiRuoMouse:Preferences");
			if (num === 1)
				return windowsMediator.getMostRecentWindow("FeiRuoMouse:DetailWindow");
		},

		UpdateFile: function(isAlert) {
			if (!this.file || !this.file.exists() || !this.file.isFile()) return;

			if (this._modifiedTime != this.file.lastModifiedTime) {
				this._modifiedTime = this.file.lastModifiedTime;
				setTimeout(function() {
					FeiRuoMouse.loadCustomCommand(true);
				}, 10);
			}
		},

		Edit: function(aFile, aLineNumber) {
			if (!aFile)
				aFile = this.file;

			if (typeof(aFile) == "string") {
				var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
				var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
				aFile = file.initWithPath(aFile);
			}

			if (!aFile || !aFile.exists() || !aFile.isFile())
				return alert("文件不存在:\n" + aFile.path);

			var editor;
			try {
				editor = Services.prefs.getComplexValue("view_source.editor.path", Ci.nsILocalFile);
			} catch (e) {
				alert("请先设置编辑器的路径!!!\nview_source.editor.path");
			}

			if (!editor || !editor.exists()) {
				this.openScriptInScratchpad(window, aFile);
				return;
			}
			var aURL = userChrome.getURLSpecFromFile(aFile);
			var aDocument = null;
			var aCallBack = null;
			var aPageDescriptor = null;
			if (/aLineNumber/.test(gViewSourceUtils.openInExternalEditor.toSource()))
				gViewSourceUtils.openInExternalEditor(aURL, aPageDescriptor, aDocument, aLineNumber, aCallBack);
			else
				gViewSourceUtils.openInExternalEditor(aURL, aPageDescriptor, aDocument, aCallBack);
		},

		openScriptInScratchpad: function(parentWindow, file) {
			let spWin = (parentWindow.Scratchpad || Services.wm.getMostRecentWindow("navigator:browser").Scratchpad)
				.openScratchpad();

			spWin.addEventListener("load", function spWinLoaded() {
				spWin.removeEventListener("load", spWinLoaded, false);

				let Scratchpad = spWin.Scratchpad;
				Scratchpad.setFilename(file.path);
				Scratchpad.addObserver({
					onReady: function() {
						Scratchpad.removeObserver(this);
						Scratchpad.importFromFile.call(Scratchpad, file);
					}
				});
			}, false);
		},

		loadFile: function(aFile) {
			if (!aFile.exists() || !aFile.isFile()) return null;
			var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
			var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
			fstream.init(aFile, -1, 0, 0);
			sstream.init(fstream);
			var data = sstream.read(sstream.available());
			try {
				data = decodeURIComponent(escape(data));
			} catch (e) {}
			sstream.close();
			fstream.close();
			return data;
		},

		OpenPref: function() {
			if (this.getWindow(0))
				this.getWindow(0).focus();
			else {
				var OptionWin = this.OptionWin();
				window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8," + OptionWin, '', 'chrome,titlebar,toolbar,centerscreen,dialog=no');
			}
		},
	};

	FeiRuoMouse.GesTrails = {
		trailDot: null,
		trailArea: null,
		trailLastDot: null,
		trailOffsetX: 0,
		trailOffsetY: 0,
		trailZoom: 1,

		CreateTrail: function FeiRuoMouse_CreateTrail(str, win) {
			var obj = JSON.parse(str);
			win = win || content;
			if (!win) return;
			if (win.top.document instanceof Components.interfaces.nsIDOMHTMLDocument) win = win.top;
			else if (win.document instanceof Components.interfaces.nsIDOMHTMLDocument === false) return;
			var doc = content.document;
			var insertionNode = doc.documentElement ? doc.documentElement : doc;
			var win = doc.defaultView;
			this.trailSize = obj.trailSize;
			this.trailZoom = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
			getInterface(Components.interfaces.nsIDOMWindowUtils).screenPixelsPerCSSPixel;
			this.trailOffsetX = (win.mozInnerScreenX - win.scrollX) * this.trailZoom;
			this.trailOffsetY = (win.mozInnerScreenY - win.scrollY) * this.trailZoom;
			this.trailArea = doc.createElementNS("http://www.w3.org/1999/xhtml", "xdTrailArea");
			insertionNode.appendChild(this.trailArea);
			this.trailDot = doc.createElementNS("http://www.w3.org/1999/xhtml", "xdTrailDot");
			this.trailDot.style.width = this.trailSize + "px";
			this.trailDot.style.height = this.trailSize + "px";
			this.trailDot.style.background = obj.trailColor;
			this.trailDot.style.border = "0px";
			this.trailDot.style.position = "absolute";
			this.trailDot.style.zIndex = 2147483647;
		},

		DrawTrail: function FeiRuoMouse_DrawTrail(str) {
			if (!this.trailArea)
				return;
			var obj = JSON.parse(str);
			var x1 = obj.x1,
				y1 = obj.y1,
				x2 = obj.x2,
				y2 = obj.y2;
			var xMove = x2 - x1;
			var yMove = y2 - y1;
			var xDecrement = xMove < 0 ? 1 : -1;
			var yDecrement = yMove < 0 ? 1 : -1;
			x2 -= this.trailOffsetX;
			y2 -= this.trailOffsetY;
			if (Math.abs(xMove) >= Math.abs(yMove))
				for (var i = xMove; i != 0; i += xDecrement)
					this.StrokeDot(x2 - i, y2 - Math.round(yMove * i / xMove));
			else
				for (var i = yMove; i != 0; i += yDecrement)
					this.StrokeDot(x2 - Math.round(xMove * i / yMove), y2 - i);
		},

		EraseTrail: function FeiRuoMouse_EraseTrail() {
			if (this.trailArea && this.trailArea.parentNode) {
				while (this.trailArea.lastChild)
					this.trailArea.removeChild(this.trailArea.lastChild);
				this.trailArea.parentNode.removeChild(this.trailArea);
			}
			this.trailDot = null;
			this.trailArea = null;
			this.trailLastDot = null;
		},

		StrokeDot: function FeiRuoMouse_StrokeDot(x, y) {
			if (this.trailArea.y == y && this.trailArea.h == this.trailSize) {
				var newX = Math.min(this.trailArea.x, x);
				var newW = Math.max(this.trailArea.x + this.trailArea.w, x + this.trailSize) - newX;
				this.trailArea.x = newX;
				this.trailArea.w = newW;
				this.trailLastDot.style.left = newX.toString() + "px";
				this.trailLastDot.style.width = newW.toString() + "px";
				return;
			} else if (this.trailArea.x == x && this.trailArea.w == this.trailSize) {
				var newY = Math.min(this.trailArea.y, y);
				var newH = Math.max(this.trailArea.y + this.trailArea.h, y + this.trailSize) - newY;
				this.trailArea.y = newY;
				this.trailArea.h = newH;
				this.trailLastDot.style.top = newY.toString() + "px";
				this.trailLastDot.style.height = newH.toString() + "px";
				return;
			}
			if (this.trailZoom != 1) {
				x = Math.floor(x / this.trailZoom);
				y = Math.floor(y / this.trailZoom);
			}
			var dot = this.trailDot.cloneNode(true);
			dot.style.left = x + "px";
			dot.style.top = y + "px";
			this.trailArea.x = x;
			this.trailArea.y = y;
			this.trailArea.w = this.trailSize;
			this.trailArea.h = this.trailSize;
			this.trailArea.appendChild(dot);
			this.trailLastDot = dot;
		},
	};

	FeiRuoMouse.DragScript = {
		Image: function(e) {
			return e.dataTransfer.getData("application/x-moz-file-promise-url")
		},

		Text: function(e) {
			return e.dataTransfer.getData("text/unicode");
		},

		Url: function(e) {
			return e.dataTransfer.getData("application/x-moz-file-promise-url")
		},

		Url2: function(e) {
			return e.dataTransfer.getData("text/x-moz-url").split("\n")[0]
		},

		SeeAsURL: function(url) {
			var DomainName = /(\w+(\-+\w+)*\.)+\w{2,7}/i;
			var HasSpace = /\S\s+\S/;
			var KnowNameOrSlash = /^(www|bbs|forum|blog)|\//i;
			var KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/i;
			var KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/i;
			var IsIpAddress = /^([1-2]?\d?\d\.){3}[1-2]?\d?\d/;
			var seemAsURL = !HasSpace.test(url) && DomainName.test(url) && (KnowNameOrSlash.test(url) || KnowTopDomain1.test(url) || KnowTopDomain2.test(url) || IsIpAddress.test(url));
			return seemAsURL;
		},
	};

	FeiRuoMouse.OptionScript = {
		Rules: [],
		ruleOption: [{
			name: 'Enable',
			default: '1'
		}, {
			name: 'Command',
			default: ''
		}, {
			name: 'Action',
			default: ''
		}, {
			name: 'Type',
			default: ''
		}, {
			name: 'Key',
			default: ''
		}, {
			name: 'TKey',
			default: ''
		}],

		init: function() {
			FeiRuoMouse.UpdateFile(true);
			var checkboximg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAaCAYAAABsONZfAAABD0lEQVQ4je2TMa5FQBSGrUIURiURhVJH3BXYgg1IprYGHa1FCGtheslf0UgkFMZ51ZUn3rvkJvdVr/iLKb4z55z5Ronj+ME5p7uJ4/ihcM5pmiYQ0a9ZlgVEhGmawDknhXNOr4BxHBFFEYQQIKJraBgG+L4PxhjSNIWU8git6woiwrZteJ7DMISqqsiybC90gNq2RV3XO1gUBRhjSJJkL3SCgiCAYRioqgp938OyLLiui3meDy0foKZp4DgOGGPwPA+6rqMsy9Ocp0U0TQPbtqFpGhhj+5wvISKCEAKmaSLPc0gp70FSSggh0HXdj8+wQ1dGPLMb8ZZ7HxP21N6VsLe29w+9C33/bJ+56U+E/QKpA0b/pEOBQAAAAABJRU5ErkJggg==";

			var cssStr = ('\
					treechildren::-moz-tree-checkbox(unchecked){\
						list-style-image: url(' + checkboximg + ');\
						-moz-image-region: rect(13px 13px 26px 0px);\
					}\
					treechildren::-moz-tree-checkbox(checked){\
						list-style-image: url(' + checkboximg + ');\
						-moz-image-region: rect(0px 13px 13px 0px);\
					}\
					');
			var doc = FeiRuoMouse.getWindow(0).document;
			var style = doc.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(cssStr) + '"');
			doc.insertBefore(style, doc.documentElement);

			this.TreeResets("TreeList0");
			this.TreeResets("TreeList1");
			this.TreeCreate("TreeList0", FeiRuoMouse.DragCustom);
			this.TreeCreate("TreeList1", FeiRuoMouse.GesCustom);

			this.ChangeStatus();
		},

		ChangeStatus: function() {
			_$("trailColor").disabled = _$("trailSize").disabled = !(_$("GesTrailEnabelr").checked);
			_$("StatusTime").disabled = !(_$("isStatusr").checked);
		},

		Resets: function() {
			this.TreeResets("TreeList0");
			this.TreeResets("TreeList1");
			_$("trailColor").value = "brown";
			_$("GesIngBtn").value = 2;
			_$("GesTrailr").value = true;
			_$("isStatus").value = true;
			_$("StatusTime").value = 3000;
			_$("trailSize").value = 2;
			this.ChangeStatus();
		},

		Save: function() {
			FeiRuoMouse.Prefs.setCharPref("trailColor", _$("trailColor").value);
			FeiRuoMouse.Prefs.setIntPref("trailSize", _$("trailSize").value);
			FeiRuoMouse.Prefs.setIntPref("GesIngBtn", _$("GesIngBtn").value);
			FeiRuoMouse.Prefs.setIntPref("StatusTime", _$("StatusTime").value);
			FeiRuoMouse.Prefs.setBoolPref("isStatus", _$("isStatusr").checked);
			FeiRuoMouse.Prefs.setBoolPref("GesTrailEnabel", _$("GesTrailEnabelr").checked);
			this.TreeSave("TreeList0", "DragCustom");
			this.TreeSave("TreeList1", "GesCustom");
		},

		/******************************************************************/
		TreeResets: function(listName) {
			while (_$(listName).hasChildNodes()) {
				_$(listName).removeChild(_$(listName).lastChild);
			}
		},

		TreeCreate: function(listName, val) {
			if (!val) return;
			val = val.split(";;");
			if (!val[0]) return;
			for (var i = 0; i < val.length; i++) {
				this.createTreeitem(listName, this.str2Obj(val[i]));
			}
		},

		TreeSave: function(listName, Prefs) {
			var Rules = [];
			var list = _$(listName);
			//if (!list.hasChildNodes()) return;
			for (var i = 0; i < list.childNodes.length; i++) {
				var rule = this.getTreeitem(list.childNodes[i]);
				rule.Command = escape(rule.Command);
				Rules.push(rule);
			}
			var objArr = [];
			for (var i in Rules) {
				var currentObj = this.obj2Str(Rules[i]);
				objArr.push(currentObj);
			}
			var Custom = objArr.join(";;");
			if (!FeiRuoMouse.Prefs.prefHasUserValue(Prefs) || FeiRuoMouse.Prefs.getPrefType(Prefs) != Ci.nsIPrefBranch.PREF_STRING)
				FeiRuoMouse.Prefs.setCharPref(Prefs, "");
			FeiRuoMouse.Prefs.setCharPref(Prefs, Custom);
		},

		/******************************************************************/
		str2Obj: function(str) {
			var tempArr = str.split("|");
			var ret = {};
			var i = 0;
			var tempStr = '';
			for (var k = 0; k < this.ruleOption.length; k++) {
				var o = this.ruleOption[k];
				if (i < tempArr.length) {
					tempStr = tempArr[i];
					i = i + 1;
				} else {
					tempStr = o.default;
				}
				ret[o.name] = tempStr;
			}
			return ret;
		},

		obj2Str: function(myArr) {
			var tempArr = [];
			for (var k = 0; k < this.ruleOption.length; k++) {
				var o = this.ruleOption[k];
				var tempStr = (myArr[o.name] == undefined) ? o.default : myArr[o.name];
				tempArr.push(tempStr);
			}
			return tempArr.join("|");
		},

		/******************************************************************/
		createTreeitem: function(listName, params) {
			var treecell1 = _$C("treecell");
			var treecell2 = _$C("treecell");
			var treecell3 = _$C("treecell");
			var treecell4 = _$C("treecell");
			var treecell5 = _$C("treecell");
			var treecell6 = _$C("treecell");
			var treerow = _$C("treerow");
			treerow.appendChild(treecell1);
			treerow.appendChild(treecell2);
			treerow.appendChild(treecell3);
			treerow.appendChild(treecell4);
			treerow.appendChild(treecell5);
			treerow.appendChild(treecell6);
			var treeitem = _$C("treeitem");
			treeitem.setAttribute("container", "false");
			treeitem.appendChild(treerow);
			params.groupid = listName;
			this.setTreeitem(treeitem, params);
			_$(listName).appendChild(treeitem);
		},

		setCheckbox: function(treeitem, checked) {
			if (this.isGroup(treeitem) == "true") {
				return;
			}
			var checkboxCell = treeitem.firstChild.childNodes[5];
			var currentValue = checkboxCell.getAttribute("value");
			var newValue = "";
			if (checked == "reverse") {
				if (currentValue == null || currentValue == "0") {
					newValue = "1";
				} else if (currentValue == "1") {
					newValue = "0";
				} else {
					return;
				}
			} else {
				newValue = checked;
			}

			checkboxCell.setAttribute("value", newValue);
			if (newValue == "1") {
				checkboxCell.setAttribute("properties", "checked");
			} else if (newValue == "0") {
				checkboxCell.setAttribute("properties", "unchecked");
			}
		},

		ActionLabel: function(str) {
			if (str == "ANY")
				return "任意";
			var label = [];
			for (var i in str) {
				if (str[i] == "U")
					label.push("↑");
				else if (str[i] == "D")
					label.push("↓");
				else if (str[i] == "L")
					label.push("←");
				else if (str[i] == "R")
					label.push("→");
				else
					label.push(str[i]);
			}
			return label.join("");
		},

		setTreeitem: function(treeitem, params) {
			with(treeitem.firstChild) {
				childNodes[0].setAttribute("label", params["Command"]);
				childNodes[0].setAttribute("Command", params["Command"]);

				childNodes[1].setAttribute("label", this.ActionLabel(params["Action"]));
				childNodes[1].setAttribute("Action", params["Action"]);
				var type = params["Type"];
				if (type != "")
					type = params["Type"] == "Image" ? "图片" : (params["Type"] == "Url" ? "链接" : "文字");

				childNodes[2].setAttribute("label", type);
				childNodes[2].setAttribute("Type", params["Type"]);

				childNodes[3].setAttribute("label", params["Key"]);
				childNodes[3].setAttribute("Key", params["Key"]);

				childNodes[4].setAttribute("label", params["TKey"] == "1" ? "排除" : !params["Key"] ? "" : "辅助");
				childNodes[4].setAttribute("TKey", params["TKey"]);

				this.setCheckbox(treeitem, params["Enable"]);
				setAttribute("groupid", params["groupid"]);

			}
		},

		/******************************************************************/
		getGroup: function(treeItem) {
			with(treeItem) {
				var treerow = childNodes[0];
				var treechildren = childNodes[1];
				var treecell = treerow.childNodes[0];
				return {
					id: treechildren.getAttribute("id"),
					des: treecell.getAttribute("label"),
					open: getAttribute("open")
				};
			}
		},

		/******************************************************************/
		isGroup: function(treeitem) {
			if (treeitem == null) return null;
			return treeitem.getAttribute("container");
		},

		getEventRow: function(event) {
			var row = {};
			var col = {};
			var obj = {};
			_$("ruleTree").treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);
			if (col.value == null || row.value == null || obj.value == null)
				return null;
			else
				return row.value;
		},

		getTreeitem: function(treeitem) {
			with(treeitem.firstChild) {
				return {
					Command: childNodes[0].getAttribute("Command"),
					Action: childNodes[1].getAttribute("Action"),
					Type: childNodes[2].getAttribute("Type"),
					Key: childNodes[3].getAttribute("Key"),
					TKey: childNodes[4].getAttribute("TKey"),
					Enable: childNodes[5].getAttribute("value"),
					groupid: getAttribute("groupid")
				}
			}
		},

		/******************************************************************/
		onTreeclick: function(event) {
			with(_$("ruleTree")) {
				if (event.button != 0) return;

				var row = {};
				var col = {};
				var obj = {};
				treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);

				if (col.value == null || row.value == null || obj.value == null) return;
				if (col.value.type == Ci.nsITreeColumn.TYPE_CHECKBOX) {
					var treeitem = view.getItemAtIndex(row.value);
					if (treeitem != null) {
						this.setCheckbox(treeitem, "reverse");
					}
				}
			}
		},

		onTreedblclick: function(event) {
			if (event.button != 0) return;
			if (this.getEventRow(event) == null) return;
			var treeitem = _$("ruleTree").view.getItemAtIndex(_$("ruleTree").currentIndex);
			this.jumptoDetailWindow(treeitem);
		},

		jumptoDetailWindow: function(treeitem) {
			if (this.isGroup(treeitem) == "true") return;
			var params = {};
			if (treeitem == null) {
				params = {
					Enable: "1",
					Command: "",
					Action: "",
					Type: "",
					Key: "",
					TKey: "",
					changed: "",
					groupid: params["groupid"]
				};
			} else {
				params = this.getTreeitem(treeitem);
			}
			var retParams = {
				Enable: params["Enable"],
				Command: "",
				Action: "",
				Type: "",
				Key: "",
				TKey: "",
				changed: "",
				groupid: params["groupid"]
			};
			this.OpenWindow(params, retParams);

			if (retParams["changed"] != "") {
				if (treeitem == null) {
					this.createTreeitem(retParams.groupid, retParams);
				} else {
					this.setTreeitem(treeitem, retParams);
				}
			}
		},

		/******************************************************************/
		OpenWindow: function(params, retParams) {
			var win = "FeiRuoMouse:DetailWindow";
			var thisWindow = FeiRuoMouse.getWindow(1);
			if (thisWindow) {
				thisWindow.focus();
			} else {
				var detaill = FeiRuoMouse.DetaillWin();
				thisWindow = window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8," + detaill, win, "modal, chrome=yes,centerscreen", params, retParams);
			}
			return thisWindow;
		},

		/******************************************************************/
		onDragstart: function(event) {
			var row = this.getEventRow(event);
			if (row == null) return false;
			var treeitem = _$("ruleTree").view.getItemAtIndex(row);
			if (!this.canMove(treeitem, "from")) return false;
			var dt = event.dataTransfer;
			dt.setData('FeiRuoMouse/row', row);
			dt.setData('FeiRuoMouse/isGroup', this.isGroup(treeitem));
		},

		onDragover: function(event) {
			var row = this.getEventRow(event);
			if (row == null) return;
			var treeitem = _$("ruleTree").view.getItemAtIndex(row);
			if (!this.canMove(treeitem, "to")) return;
			if (event.dataTransfer.getData("FeiRuoMouse/isGroup") == "true" && this.isGroup(treeitem) != "true") return;
			event.preventDefault();
		},

		canMove: function(treeitem, fromTo) {
			var groupid = "";
			if (this.isGroup(treeitem) == "true") {
				var group = this.getGroup(treeitem);
				groupid = group.id;
				if (groupid == "customList" && fromTo == "from") return false;
			} else {
				var item = this.getTreeitem(treeitem);
				groupid = item.groupid;
			}
			if (groupid == "" || groupid == "defaultList") return false;
			else return true;
		},

		onDrop: function(event) {
			var dtRow = event.dataTransfer.getData('FeiRuoMouse/row');
			var dtIsGroup = event.dataTransfer.getData('FeiRuoMouse/isGroup');

			var row = this.getEventRow(event);
			if (row == null) return;
			if (row == dtRow) return;

			var pTreeitem = _$("ruleTree").view.getItemAtIndex(row);
			var treeitem = _$("ruleTree").view.getItemAtIndex(dtRow);

			if (dtIsGroup == "true") {
				if (this.isGroup(pTreeitem) == "true") {
					this.moveGroupBeforeGroup(treeitem, pTreeitem);
				}
			} else {
				if (this.isGroup(pTreeitem) == "true") {
					var group = this.getGroup(pTreeitem);
					this.moveItemToGroup(treeitem, group.id);
				} else {
					this.moveItemBeforeItem(treeitem, pTreeitem);
				}
			}
		},

		moveItemBeforeItem: function(treeitem, pTreeitem) {
			var item = this.getTreeitem(pTreeitem);
			treeitem.parentNode.removeChild(treeitem);
			pTreeitem.parentNode.insertBefore(treeitem, pTreeitem);
		},

		moveGroupBeforeGroup: function(group, pGroup) {
			group.parentNode.removeChild(group);
			pGroup.parentNode.insertBefore(group, pGroup);
		},

		moveItemToGroup: function(treeitem, groupid) {
			treeitem.parentNode.removeChild(treeitem);
			this.setItemAttr(treeitem, "groupid", groupid);
			document.getElementById(groupid).appendChild(treeitem);
		},

		setItemAttr: function(treeitem, key, value) {
			with(treeitem.firstChild) {
				if (key == "groupid") {
					setAttribute("groupid", value);
				}
			}
		},

		/******************************************************************/
		onNewButtonClick: function() {
			with(_$("ruleTree")) {
				var idx = currentIndex;
				var parentId = "TreeList0";
				if (idx >= 0) {
					var treeitem = view.getItemAtIndex(idx);
					if (this.isGroup(treeitem) == "true") {
						var group = this.getGroup(treeitem);
						if (group.id) parentId = group.id;
					} else {
						var rule = this.getTreeitem(treeitem);
						if (rule.groupid) parentId = rule.groupid;
					}
				}
				this.jumptoDetailWindow(null, parentId);
			}
		},

		onEditButtonClick: function() {
			this.editRuleList("edit");
		},

		onDeleteButtonClick: function() {
			this.editRuleList("delete");
		},

		editRuleList: function(mode) {
			with(_$("ruleTree")) {
				var idx = currentIndex;
				if (idx < 0) {
					return;
				}
				var treeitem = view.getItemAtIndex(idx);
				if (mode == "edit") {
					this.jumptoDetailWindow(treeitem);
				} else if (mode == "delete") {
					treeitem.parentNode.removeChild(treeitem);
					view.selection.select(idx);
				}
				treeBoxObject.ensureRowIsVisible(currentIndex);
			}
			this.ChangeStatus();
		},
	};

	FeiRuoMouse.OptionWin = function() {
		var xul = '<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
					<prefwindow xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
					id="FeiRuoMouse_Settings"\
					ignorekeys="true"\
					title="FeiRuoMouse 设置"\
					onload="opener.FeiRuoMouse.OptionScript.init();"\
					onunload="opener.FeiRuoMouse.UpdateFile(true);"\
					buttons="accept,cancel,extra1,extra2"\
					ondialogextra1="opener.FeiRuoMouse.OptionScript.Resets();"\
					ondialogextra2="opener.FeiRuoMouse.Edit();"\
					ondialogaccept="opener.FeiRuoMouse.OptionScript.Save();"\
					windowtype="FeiRuoMouse:Preferences">\
					<prefpane id="main" flex="1">\
						<preferences>\
							<preference id="isStatus" type="bool" name="userChromeJS.FeiRuoMouse.isStatus"/>\
							<preference id="GesTrailEnabel" type="bool" name="userChromeJS.FeiRuoMouse.GesTrailEnabel"/>\
							<preference id="GesIngBtn" type="int" name="userChromeJS.FeiRuoMouse.GesIngBtn"/>\
							<preference id="StatusTime" type="int" name="userChromeJS.FeiRuoMouse.StatusTime"/>\
							<preference id="trailSize" type="int" name="userChromeJS.FeiRuoMouse.trailSize"/>\
							<preference id="trailColor" type="string" name="userChromeJS.FeiRuoMouse.trailColor"/>\
						</preferences>\
						<script>\
							function Change() {\
								opener.FeiRuoMouse.OptionScript.ChangeStatus();\
							}\
						</script>\
						<tabbox class="text">\
							<tabs>\
								<tab label="一般选项"/>\
								<tab label="拖拽/手势 规则"/>\
							</tabs>\
							<tabpanels flex="1">\
								<tabpanel orient="vertical" flex="1">\
									<groupbox>\
										<caption label="鼠标手势自定义"/>\
											<grid>\
												<rows>\
													<row align="center">\
														<checkbox id="GesTrailEnabelr" label="显示轨迹" preference="GesTrailEnabel" oncommand="Change();"/>\
													</row>\
													<row align="center">\
														<label value="轨迹尺寸："/>\
														<textbox id="trailSize" type="number" preference="trailSize" style="width:180px" tooltiptext="单位：像素(px)"/>\
													</row>\
													<row align="center">\
														<label value="轨迹颜色："/>\
														<textbox id="trailColor" preference="trailColor" tooltiptext="如：brown、#999、#FFFFFF 、rgba(153, 153, 153, 0) 等"/>\
													</row>\
													<row align="center">\
														<checkbox id="isStatusr" label="显示状态提示" preference="isStatus" oncommand="Change();"/>\
													</row>\
													<row align="center">\
														<label value="状态提示时间："/>\
														<textbox id="StatusTime" type="number" preference="StatusTime" tooltiptext="单位：毫秒"/>\
													</row>\
													<row align="center">\
														<label value="鼠标手势触发按键："/>\
														<radiogroup id="GesIngBtn" preference="GesIngBtn">\
															<hbox>\
																<radio label="左键" id="DragBtn_0" value="0"/>\
																<radio label="中键" id="DragBtn_1" value="1"/>\
																<radio label="右键" id="DragBtn_2" value="2"/>\
															</hbox>\
														</radiogroup>\
													</row>\
												</rows>\
											</grid>\
									</groupbox>\
								</tabpanel>\
								<tabpanel orient="vertical" flex="1" style="width:500px">\
									<vbox>\
										<hbox id="listarea" flex="1">\
											<tree id="ruleTree" seltype="single" flex="1" enableColumnDrag="true" class="tree" rows="15"\
												onclick="opener.FeiRuoMouse.OptionScript.onTreeclick(event);"\
												ondblclick="opener.FeiRuoMouse.OptionScript.onTreedblclick(event);">\
												<treecols>\
													<treecol id="Command-col2" label="命令" flex="10" persist="width hidden ordinal" primary="true"/>\
													<splitter class="tree-splitter"/>\
													<treecol id="Type-col2" label="动作" flex="1" persist="width hidden ordinal"/>\
													<splitter class="tree-splitter"/>\
													<treecol id="Action-col2" label="目标" flex="1" persist="width hidden ordinal"/>\
													<splitter class="tree-splitter"/>\
													<treecol id="Keys-col2" label="键盘" flex="1" persist="width hidden ordinal" hidden="true"/>\
													<splitter class="tree-splitter"/>\
													<treecol id="TKeys-col2" label="辅助" flex="1" persist="width hidden ordinal" hidden="true"/>\
													<splitter class="tree-splitter"/>\
													<treecol id="Enable-col2" label="启用" flex="1" type="checkbox" persist="width hidden ordinal"/>\
												</treecols>\
												<treechildren id="treeroot"\
													ondragstart="opener.FeiRuoMouse.OptionScript.onDragstart(event);"\
													ondragover="opener.FeiRuoMouse.OptionScript.onDragover(event);"\
													ondrop="opener.FeiRuoMouse.OptionScript.onDrop(event);">\
													<treeitem container="true" open="true" nodelete="true">\
														<treerow>\
															<treecell label="拖拽规则" />\
														</treerow>\
														<treechildren id="TreeList0"/>\
													</treeitem>\
													<treeitem container="true" open="true" nodelete="true">\
														<treerow>\
															<treecell label="手势规则" />\
														</treerow>\
														<treechildren id="TreeList1" />\
													</treeitem>\
												</treechildren>\
											</tree>\
										</hbox>\
										<hbox>\
											<spacer flex="1"/>\
											<button label="添加" id="newButton" oncommand="opener.FeiRuoMouse.OptionScript.onNewButtonClick();"/>\
											<button label="修改" id="editButton" oncommand="opener.FeiRuoMouse.OptionScript.onEditButtonClick();"/>\
											<button label="移除" id="deleteButton" oncommand="opener.FeiRuoMouse.OptionScript.onDeleteButtonClick()"/>\
										</hbox>\
									</vbox>\
								</tabpanel>\
							</tabpanels>\
						</tabbox>\
						<hbox flex="1">\
							<button dlgtype="extra1" label="还原默认值"/>\
							<button dlgtype="extra2" label="自定义命令"/>\
							<spacer flex="1" />\
							<button label="应用" oncommand="opener.FeiRuoMouse.OptionScript.Save();"/>\
							<button dlgtype="accept"/>\
							<button dlgtype="cancel"/>\
						</hbox>\
					</prefpane>\
					</prefwindow>\
          			';
		return encodeURIComponent(xul);
	};

	FeiRuoMouse.DetaillScript = {
		init: function(param) {
			FeiRuoMouse.UpdateFile(true);
			var keys = param["Key"];
			if (keys) {
				keys = keys.split("+");
				for (var i in keys) {
					if (keys[i] == "Alt")
						_$D("Alt").checked = true;

					if (keys[i] == "Ctrl") {
						_$D("Ctrl").checked = true;
					}

					if (keys[i] == "Shift")
						_$D("Shift").checked = true;
				}
			}
			_$D("TKey").checked = param["TKey"] ? true : false;


			if (param["groupid"] == "TreeList0")
				_$D("MType").value = "Drag";
			else if (param["groupid"] == "TreeList1")
				_$D("MType").value = "Ges";

			_$D("DragType").value = param["Type"];
			_$D("Action").value = param["Action"];
			this.KChanged();
			this.MChanged();

			var cmd = param["Command"];
			var menu = _$D("Command");
			if (cmd)
				menu.value = cmd;
			else
				menu.selectedIndex = 0;
		},

		Resets: function() {
			_$D("Alt").checked = _$D("Ctrl").checked = _$D("Shift").checked = false;
			_$D("MType").value = "Ges";
			_$D("DragType").value = "0";
			_$D("Action").value = "";
			this.KChanged();
			this.MChanged();
		},

		Save: function(retParam) {
			var groupid;
			if (_$D("MType").value == "Ges")
				groupid = "TreeList1";
			else
				groupid = "TreeList0";

			var Key = [];
			if (_$D("Alt").checked)
				Key.push("Alt");
			if (_$D("Ctrl").checked)
				Key.push("Ctrl");
			if (_$D("Shift").checked)
				Key.push("Shift");
			Key = Key.join("+");

			var TKey;
			if (Key && _$D("TKey").checked)
				TKey = "1";

			var Type;
			if (_$D("Drag_Image").selected)
				Type = "Image";
			else if (_$D("Drag_Url").selected)
				Type = "Url";
			else if (_$D("Drag_Text").selected)
				Type = "Text";

			var Command = _$D("Command").label;
			var str = _$D("Action").value.toUpperCase();
			var Action = []
			if (str == "ANY")
				Action = str;
			else {
				if (groupid == "TreeList0") {
					for (var i in str) {
						if ((str[i] == "U" || str[i] == "D" || str[i] == "L" || str[i] == "R") && str[i] != str[i - 1])
							Action.push(str[i]);
					}
				} else if (groupid == "TreeList1") {
					for (var i in str) {
						if ((str[i] == "U" || str[i] == "D" || str[i] == "L" || str[i] == "R" || str[i] == "W" || str[i] == "+" || str[i] == "-" || str[i] == "<" || str[i] == ">") && str[i] != str[i - 1])
							Action.push(str[i]);
					}
					Type = "";
				}

				Action = Action.join("");
			}

			//if (Command == "" || Action == "") return;
			if (Action == "") return;

			retParam["Command"] = Command || "";
			retParam["Action"] = Action || "";
			retParam["Type"] = Type || "";
			retParam["Key"] = Key || "";
			retParam["TKey"] = TKey || "";
			retParam["Btn"] = "0";
			retParam["groupid"] = groupid || "";
			retParam["Enable"] = 1 || "";
			retParam["changed"] = "1";
			setTimeout(function() {
				FeiRuoMouse.OptionScript.ChangeStatus();
			}, 10);
			return true;
		},

		KChanged: function() {
			if (!_$D("Alt").checked && !_$D("Ctrl").checked && !_$D("Shift").checked)
				_$D("TKey").disabled = true;
			else
				_$D("TKey").disabled = false;
		},

		MChanged: function() {
			var status = _$D("Ges").selected;
			_$D("Drag_Image").disabled = _$D("Drag_Url").disabled = _$D("Drag_Text").disabled = status;
			this.CreateCommandMenu(status);
			this.Action_Label(status);
		},

		Action_Label: function(isAlert) {
			if (!isAlert)
				_$D("Action_Label").value = "";
			else
				_$D("Action_Label").value = "W-(上滚轮),W+(下滚轮),L<R(右左),L>R(左右)";
		},

		CreateCommandMenu: function(Ges) {
			var menu = _$D("Command");

			while (menu.hasChildNodes()) {
				menu.removeChild(menu.lastChild);
			}

			if (Ges && FeiRuoMouse.GesCustomCommand) {
				var GesCustomCommand = FeiRuoMouse.GesCustomCommand;
				for (var i in GesCustomCommand) {
					menu.appendItem(GesCustomCommand[i].label, GesCustomCommand[i].label);
				}
			}

			if (!Ges && FeiRuoMouse.DragCustomCommand) {
				var DragCustomCommand = FeiRuoMouse.DragCustomCommand;
				for (var i in DragCustomCommand) {
					if (_$D("Drag_Image").selected && DragCustomCommand[i].Type.match("Image"))
						menu.appendItem(DragCustomCommand[i].label, DragCustomCommand[i].label);
					else if (_$D("Drag_Url").selected && DragCustomCommand[i].Type.match("Url"))
						menu.appendItem(DragCustomCommand[i].label, DragCustomCommand[i].label);
					else if (_$D("Drag_Text").selected && DragCustomCommand[i].Type.match("Text"))
						menu.appendItem(DragCustomCommand[i].label, DragCustomCommand[i].label);
				}
			}

			menu.selectedIndex = 0;
		},
	};

	FeiRuoMouse.DetaillWin = function() {
		var xul = '<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
					<prefwindow xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
					id="FeiRuoMouse_Detail"\
					ignorekeys="true"\
					title="FeiRuoMouse 拖拽/手势"\
					onload="init();"\
					onunload="WindoFocus();"\
					buttons="accept, cancel, extra1"\
					ondialogextra1="opener.FeiRuoMouse.DetaillScript.Resets();"\
					ondialogaccept="Save();"\
					windowtype="FeiRuoMouse:DetailWindow">\
						<prefpane id="main" flex="1">\
						<script>\
							function init() {\
								var param=window.arguments[0];\
								opener.FeiRuoMouse.DetaillScript.init(param);\
							}\
							function Save() {\
								var retparam=window.arguments[1];\
								opener.FeiRuoMouse.DetaillScript.Save(retparam);\
							}\
							function WindoFocus(){\
								if (opener.FeiRuoMouse.getWindow(0))\
									opener.FeiRuoMouse.getWindow(0).focus();\
							}\
						</script>\
							<vbox style = "width:400px; min-height:275px;">\
								<groupbox>\
									<radiogroup id="MType">\
										<rows>\
											<row align="center">\
												<radio label="鼠标手势" id="Ges" value="Ges" oncommand="opener.FeiRuoMouse.DetaillScript.MChanged();"/>\
											</row>\
											<row align="center">\
												<radio label="拖拽" id="Drag" value="Drag" style="width:100px;" oncommand="opener.FeiRuoMouse.DetaillScript.MChanged();"/>\
												<radiogroup id="DragType">\
													<hbox>\
														<radio label="图片" id="Drag_Image" value="Image" oncommand="opener.FeiRuoMouse.DetaillScript.CreateCommandMenu();"/>\
														<radio label="链接" id="Drag_Url" value="Url" oncommand="opener.FeiRuoMouse.DetaillScript.CreateCommandMenu();"/>\
														<radio label="文字" id="Drag_Text" value="Text" oncommand="opener.FeiRuoMouse.DetaillScript.CreateCommandMenu();"/>\
													</hbox>\
												</radiogroup>\
											</row>\
										</rows>\
									</radiogroup>\
								</groupbox>\
								<groupbox>\
									<caption label="键盘辅助键"/>\
										<row align="center">\
											<checkbox label="Alt" id="Alt" oncommand="opener.FeiRuoMouse.DetaillScript.KChanged();"/>\
											<label value="+"/>\
											<checkbox label="Ctrl" id="Ctrl" oncommand="opener.FeiRuoMouse.DetaillScript.KChanged();"/>\
											<label value="+"/>\
											<checkbox label="Shift" id="Shift" oncommand="opener.FeiRuoMouse.DetaillScript.KChanged();"/>\
											<spacer flex="1" />\
											<checkbox label="作为排除键" id="TKey"/>\
										</row>\
								</groupbox>\
								<groupbox>\
									<caption label="命令"/>\
										<menulist id="Command" style="width:400px;"/>\
								</groupbox>\
								<groupbox>\
									<caption label="手势方向"/>\
										<textbox id="Action" style="width:400px; height:25px;"/>\
										<label value="U(上),D(下),L(左),R(右),Any(任意)"/>\
										<label id="Action_Label" value=""/>\
								</groupbox>\
							</vbox>\
							<hbox flex="1">\
								<button dlgtype="extra1" label="重置" />\
								<spacer flex="1" />\
								<button dlgtype="accept"/>\
								<button dlgtype="cancel"/>\
							</hbox>\
						</prefpane>\
					</prefwindow>\
					';
		return encodeURIComponent(xul);
	};

	/*****************************************************************************************/
	function _$D(id) {
		return FeiRuoMouse.getWindow(1).document.getElementById(id);
	}

	function _$(id) {
		return FeiRuoMouse.getWindow(0).document.getElementById(id);
	}

	function _$C(name, attr) {
		var el = FeiRuoMouse.getWindow(0).document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	function $(id) {
		return document.getElementById(id);
	}

	function log() {
		Application.console.log("[FeiRuoMouse] " + Array.slice(arguments));
	}

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	function status(str) {
		XULBrowserWindow.statusTextField.label = '[FeiRuoMouse]' + str;
		setTimeout(function() {
			XULBrowserWindow.statusTextField.label = '';
		}, FeiRuoMouse.StatusTime)
	}

	function alert(aString, aTitle) {
		Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
			.showAlertNotification("", aTitle || "FeiRuoMouse", aString, false, "", null);
	}

	FeiRuoMouse.init();
	window.FeiRuoMouse = FeiRuoMouse;
})();