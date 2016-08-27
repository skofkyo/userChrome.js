
var FireCaptor = {

	btnId: "firecaptor-button",

	addbtn: function () {
		var gNavToolbox = gNavToolbox || document.getElementById("navigator-toolbox");
		if (!gNavToolbox) return;
		var browserToolbarPalette = gNavToolbox.palette;
		if (browserToolbarPalette.id != "BrowserToolbarPalette") return;

		this._browserToolbarPalette = browserToolbarPalette;

		var toolbarbutton = document.createElement("toolbarbutton");
		toolbarbutton.setAttribute("type", "menu");
		toolbarbutton.id = this.btnId;
		toolbarbutton.className = "toolbarbutton-1";
		toolbarbutton.setAttribute("label", "FireCaptor");
		toolbarbutton.setAttribute("tooltiptext", "FireCaptor");
		toolbarbutton.setAttribute("orient", "horizontal");
		toolbarbutton.setAttribute("removable", true);
		toolbarbutton.style.listStyleImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAABBtJREFUOBEBEATv+wFxkJh/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAD8+/sC6ePhDwAAAAAAAAAAFx0f8QQFBf78+/sC6ePhDwAAAAAAAAAAFx0f8QQFBf78+/sCAAAAAAQFBf4EAAAAAAAAAACqkoyWAAAA/AAAAAAAAADiAAAA/AAAAAQAAAAeAAAAAAAAAAAAAADiAAAA/AAAACJZcXdsGB8h8QQAAAAABAUF/gAAANoAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAN4AAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAgAAAAD8+/sCAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAOzm5A0AAAAaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOYUGhzzAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AQFBf4AAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE/Pv7AgAAAAACAAAAABQaHPMAAADmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrs5uQNAAAAAAIAAAAABAUF/gAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAD8+/sCAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAOzm5A0AAAAaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOYUGhzzAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AQFBf4AAAAABAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAHgAAAAAAAAAAAAAA4gAAAPwAAAAEAAAAHgAAAAAAAAAE/Pv7AgQFBf4EAAAAABQaHPNti5NfBAUF/vz7+wLp4+EPAAAAAAAAAAAXHR/xBAUF/vz7+wLp4+EPAAAAAAAAAAAAAADxAAAAAAQAAAAABAUF/gAAAAAAAAAABAUF/hsiJO8AAAAAAAAAAAAAAAAAAAAABAUF/hsiJO8AAAAAAAAAAAAAAAAAAAAAkcBiEmF6iUEAAAAASUVORK5CYII=')";
		var menupopup = document.createElement("menupopup");
		var items = [
			{
				label: "\u622A\u53D6\u53EF\u89C6\u754C\u9762",
				oncommand: "FireCaptor.doVisiblePortion();",
				data_name: "visiblePortion"
			},
			{
				label: "\u622A\u53D6\u6574\u4E2A\u9875\u9762",
				oncommand: "FireCaptor.doCompletePage();",
				data_name: "completePage",
			},
			{
				label: "\u622A\u53D6\u9009\u5B9A\u533A\u57DF",
				oncommand: "FireCaptor.doSelection();",
				data_name: "selection"
			}
		];
		items.forEach(function (item, index, array) {
			var menuitem = document.createElement("menuitem");
			for (i in item) {
				let value = item[i];
				menuitem.setAttribute(i, value);
			}
			menupopup.appendChild(menuitem);
		});
		toolbarbutton.appendChild(menupopup);


		browserToolbarPalette.appendChild(toolbarbutton);


			var toolbars = document.querySelectorAll("toolbar[currentset]");
			if (toolbars.length == 0) return;
			for (var i = 0, len = toolbars.length; i < len; i++) {
				var toolbar = toolbars[i];
				var currentSet = toolbar.getAttribute("currentset");
				if (!currentSet) continue;
				if (currentSet.split(",").some(function (item) {
					return item == this.btnId;
				}, this)) {
					toolbar.currentSet = currentSet;
					try {
						BrowserToolboxCustomizeDone(true);
					} catch (ex) {
						Cu.reportError(ex);
					}
					break;
				}
		}
	},

	doVisiblePortion: function () {
		this.selectwin(false);
	},

	doCompletePage: function () {
		this.selectwin(true);
	},

	selectwin: function (full) {
		var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
		div.style.cssText = ""
			+ "position: fixed; top: 0; left: 0; width: 0; height: 0"
			+ "maring: 0; padding: 0; z-index: 99999; "
			+ "background-color: rgba(113, 144, 152, 0.5); "
			+ "pointer-events: none; ";
		var parent = document.body || document.documentElement;
		parent.appendChild(div);

		var rect = {x: 0, y: 0, w: 0, h: 0};
		var getRoot = {
			"BackCompat": function (doc) doc.body,
			"CSS1Compat": function (doc) doc.documentElement,
			"undefined": function (doc) doc.documentElement
		};

		function updatediv(x, y, w, h) {
			div.style.left = x + "px";
			div.style.top = y + "px";
			div.style.width = w + "px";
			div.style.height = h + "px";
		}
		var prewin = null;
		function sel(e) {
			switch (e.type) {
				case "mouseover" :
					if (prewin == e.view) return;
					prewin = e.view;
					let doc = prewin.document;
					let root = getRoot[doc.compatMode](doc);
					var x = window.mozInnerScreenX - prewin.mozInnerScreenX;
					var y = window.mozInnerScreenY - prewin.mozInnerScreenY;
					rect.w = root.clientWidth;
					rect.h = root.clientHeight;
					updatediv(Math.abs(x), Math.abs(y), rect.w, rect.h);
					break;
				case "mouseout" :
					if (e.relatedTarget == null) {
						updatediv(0, 0, 1, 1);
						prewin = null;
					}
					break;
			}
		}
		function key(e) {
			if (e.keyCode == e.DOM_VK_ESCAPE) {
				cls();
			} else if (e.keyCode == e.DOM_VK_RETURN || e.keyCode == e.DOM_VK_ENTER) {
				cli(e);
			}
		}
		function cls() {
			window.removeEventListener("mouseover", sel, false);
			window.removeEventListener("mouseout", sel, false);
			window.removeEventListener("keydown", key, true);
			window.removeEventListener("click", cli, false);
			div.parentNode.removeChild(div);
		}
		function cli(e) {
			e.preventDefault();
			e.stopPropagation();
			cls();
			var win = e.view;
			if (full) {
				let doc = win.document;
				let rootElement = getRoot[doc.compatMode](doc);
				rect.w = Math.max(rootElement.scrollWidth, rootElement.clientWidth);
				rect.h = Math.max(rootElement.scrollHeight, rootElement.clientHeight);
			} else {
				rect.x = win.pageXOffset;
				rect.y = win.pageYOffset;
			}

			return FireCaptor.save(rect, win, e.ctrlKey, e.shiftKey);
		}
		window.addEventListener("mouseover", sel, false);
		window.addEventListener("mouseout", sel, false);
		window.addEventListener("keydown", key, true);
		window.addEventListener("click", cli, false);
	},

	doSelection: function () {

		function LightBox() {
			this.bindFn = function (type, listener, userCapture) {
				if (typeof type != "string" || typeof listener != "function") return;
				var fn = listener.bind(this);
				userCapture = userCapture ? true : false;
				var evt = {
					type: type,
					fn: fn,
					userCapture: userCapture
				};
				if (!Array.isArray(this._fns))
					this._fns = [];
				this._fns.push(evt);
			};
			this.init = function () {
				var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
				if (!div) return;
				var width = Math.max(document.documentElement.scrollWidth,
									 document.documentElement.clientWidth);
				var height = Math.max(document.documentElement.scrollHeight,
									  document.documentElement.clientHeight);
				div.style.cssText = ""
					+ "position: fixed; border: 0px solid rgba(113, 144, 152, 0.5); "
					+ "top: 0; right: 0; bottom: 0; left: 0; "
					+ "margin: 0; padding: 0; "
					+ "z-index: 99999; "
					+ "border-left-width: " + width + "px; "
					+ "border-top-width: " + height + "px; ";
				var span = document.createElementNS("http://www.w3.org/1999/xhtml", "span");
				span.style.cssText = ""
					+ "position: absolute; top: 0; right: 0; bottom: 0; left: 2px;"
					+ "margin: 0; padding: 0; z-index: 1; cursor: default; -moz-user-select: none;"
					+ "font-size: 11px; color: rgba(250, 0, 0, 0.98);"
					+ "white-space: nowrap;";
				this._sizeBox = div.appendChild(span);
				var parent = document.body || document.documentElement;
				var subDiv = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
				if (subDiv) {
					subDiv.style.cssText = ""
						+ "width: 100%; height: 100%; margin: 0; padding: 0; "
						+ "-moz-box-sizing: border-box; box-sizing: border-box; ";
					this._subBox = div.appendChild(subDiv);
				}
				this.box = parent.appendChild(div);
				this.width = width;
				this.height = height;
				if (this._fns) {
					this._fns.forEach(function (item, index, array) {
						div.addEventListener(item.type, item.fn, item.userCapture);
					});
				}
				div.addEventListener("mousedown", this, false);
				this.rect = {x: 0, y: 0, w: 0, h: 0};
			};
			this.handleEvent = function (e) {
				e.preventDefault();
				e.stopPropagation();
				var _box = e.currentTarget;
				switch (e.type) {
					case "mousedown" :
						this.x = e.clientX;
						this.y = e.clientY;
						_box.style.borderLeftWidth = this.x + "px";
						_box.style.borderTopWidth = this.y + "px";
						_box.style.borderRightWidth = this.width - this.x + "px";
						_box.style.borderBottomWidth = this.height - this.y + "px";
						_box.style.width = "0px";
						_box.style.height = "0px";
						this._subBox.style.border = "none";
						this._sizeBox.textContent = "";
						var self = this;
						this._tid = setTimeout(function () {
							self._tid = 0;
							_box.addEventListener("mousemove", self, false);
						}, 150);
						_box.addEventListener("mouseup", this, false);
						break;
					case "mousemove" :
						var x = e.clientX, y = e.clientY;
						_box.setCapture(true);
						_box.style.borderLeftWidth = Math.min(x, this.x) + "px";
						_box.style.borderTopWidth = Math.min(y, this.y) + "px";
						_box.style.borderRightWidth = this.width - Math.max(x, this.x) + "px";
						_box.style.borderBottomWidth = this.height - Math.max(y, this.y) + "px";
						let _w = Math.abs(x - this.x),
							_h = Math.abs(y - this.y);
						_box.style.width = _w + "px";
						_box.style.height = _h + "px";
						this._subBox.style.border = "1px dashed rgba(0, 0, 0, 0.6)";
						this._sizeBox.textContent = _w + ',' + _h;
						break;
					case "mouseup" :
						if (this._tid) {
							clearTimeout(this._tid);
							this._tid = 0;
						} else {
							_box.removeEventListener("mousemove", this, false);
							document.releaseCapture();
							var x = parseFloat(_box.style.borderLeftWidth),
								y = parseFloat(_box.style.borderTopWidth),
								w = parseFloat(_box.style.width),
								h = parseFloat(_box.style.height);
							this.rect = {x: x, y: y, w: w, h: h};
						}
						_box.removeEventListener("mouseup", this, false);
						break;
				}
			};
			this.uninit = function () {
				if (this.box) {
					this.box.removeEventListener("mousedown", this, false);
					if (this._fns) {
						this._fns.forEach(function (item, index, array) {
							this.box.removeEventListener(item.type, item.fn, item.userCapture);
						}, this);
						delete this._fns;
					}
					this.box.parentNode.removeChild(this.box);
					delete this.box;
					this._subBox && (delete this._subBox);
					this._sizeBox && (delete this._sizeBox);
				}
			};
		}

		var box = new LightBox();
		var self = this;
		function grab(e) {
			this.uninit();
			box = null;
			return self.save(this.rect, null, e.ctrlKey, e.shiftKey);
		}
		window.addEventListener("keydown", function (e) {
			if (box == null)
				return window.removeEventListener("keydown", arguments.callee, true);
			if (e.keyCode == e.DOM_VK_ESCAPE) {
				box.uninit();
				box = null;
				window.removeEventListener("keydown", arguments.callee, true);
			} else if (e.keyCode == e.DOM_VK_RETURN || e.keyCode == e.DOM_VK_ENTER) {
				grab.apply(box, [e]);
				box = null;
				window.removeEventListener("keydown", arguments.callee, true);
			}
		}, true);
		box.bindFn("dblclick", grab, false);
		box.init();
	},

	save: function (rect, win, toClip, silent, imagetype) {
		win = win || window;
		var x = rect.x || 0,
			y = rect.y || 0,
			w = rect.w || 0,
			h = rect.h || 0;
		var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		canvas.width = w;
		canvas.height = h;

		try {
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, w, h);
			ctx.save();
			ctx.drawWindow(win, x, y, w, h, "rgba(255, 255, 255, 0)");
			ctx.restore();
		} catch (ex) {
			alert("could not create the image, because the web page is too big!");
			return;
		}

		// if (toClip) {
			// return this.toClipboard(canvas, imagetype);
		// }

		if (silent && this._lastSavePath) {
			var exname = this._imagetype.replace("image/", "");
			var filename = new Date().getTime() + "." + exname;
			var savePath = this._lastSavePath.clone();
			savePath.append(filename);
			"XULBrowserWindow" in window && XULBrowserWindow.setOverLink("Saving: " 
											+ savePath.path, null);
			return this.saveImage(canvas, savePath, this._imagetype);
		}
		var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		var imagetypes = ["image/png", "image/jpeg"];
		filePicker.appendFilter("png", "*.png");
		filePicker.appendFilter("jpeg (only Gecko 7.0+)", "*.jpeg");
		let (exname = this._imagetype ? this._imagetype.replace("image/", "") : "png") {
			filePicker.defaultExtension = "." + exname;
			filePicker.defaultString = new Date().getTime() + "." + exname;
			let i = (function () {
				for (let i = 0; i < imagetypes.length; i++) {
					let (value = imagetypes[i]) {
						if (value.indexOf(exname) != -1) return i;
					}
				}
			})();
			filePicker.filterIndex = i;
		}
		filePicker.init(window, "Save Image...", filePicker.modeSave);
		var result = filePicker.show();
		if (result == filePicker.returnOK || result == filePicker.returnReplace) {
			this._lastSavePath = filePicker.file.parent;
			this._imagetype = imagetypes[filePicker.filterIndex];
			return this.saveImage(canvas, filePicker.file, imagetypes[filePicker.filterIndex]);
		}
	},


	saveImage: function (canvas, file, imagetype) {
		// create a data url from the canvas and then create URIs of the source and targets    
		var ios = Services.io;
		var source = ios.newURI(canvas.toDataURL(imagetype, ""), "UTF8", null);  
		//var target = ios.newFileURI(file)  
			
		// prepare to save the canvas data  
		var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);  
		persist.persistFlags = Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;  
		persist.persistFlags |= Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;  

		persist.saveURI(source, null, null, null, null, file, null);  
	},

	init: function () {



		if (document.documentElement.getAttribute("windowtype") == "navigator:browser")
			this.addbtn();

		window.addEventListener("keydown", this, true);
	},

	handleEvent: function (e) {
		var key = e.keyCode || e.which;
		var keyMod = e.altKey | e.ctrlKey << 1 | e.shiftKey << 2 | e.metaKey << 3;
		var code = key | keyMod << 8;
		if (this.visiblePortion && code == this.code_visiblePortion) {
			e.preventDefault();
			this.doVisiblePortion();
		} else if (this.completePage && code == this.code_completePage) {
			e.preventDefault();
			this.doCompletePage();
		} else if (this.selection && code == this.code_selection) {
			e.preventDefault();
			this.doSelection();
		}
	},

	uninit: function () {
		var fbt = document.getElementById(this.btnId);
		if (fbt) {
			fbt.parentNode.removeChild(fbt);
		} else if (this._browserToolbarPalette) {
			for each (node in this._browserToolbarPalette) {
				if (node.id == this.btnId) {
					this._browserToolbarPalette.removeChild(node);
					break;
				}
			}
		}
		window.removeEventListener("keydown", this, true);
	}
};

FireCaptor.init();
