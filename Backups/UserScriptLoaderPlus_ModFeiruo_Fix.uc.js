﻿// ==UserScript==
// @name           UserScriptLoader 特殊用途版
// @description    Greasemonkey 模擬器。新增 GM_saveFile、GM_download 等 API，個人用於特殊用途
// @namespace      http://d.hatena.ne.jp/Griever/
// @include        main
// @compatibility  Firefox 35
// @license        MIT License
// @versin         2015.04.12 support @grant none
// @version        0.1.8.4
// @note           0.1.8.4 add persistFlags for PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION to fix @require save data
// @note      2016/5/3  Firefox46修正 by Jasake
// @note           0.1.8.4 Firefox 35 用の修正
// @note           0.1.8.4 エディタで Scratchpad を使えるようにした
// @note           0.1.8.4 GM_notification を獨自実裝
// @note           0.1.8.3 Firefox 32 で GM_xmlhttpRequest が動かないのを修正
// @note           0.1.8.3 內臓の console を利用するようにした
// @note           0.1.8.3 obsever を使わないようにした
// @note           0.1.8.2 Firefox 22 用の修正
// @note           0.1.8.2 require が機能していないのを修正
// @note           0.1.8.1 Save Script が機能していないのを修正
// @note           0.1.8.0 Remove E4X
// @note           0.1.8.0 @match, @unmatch に超テキトーに対応
// @note           0.1.8.0 .tld を Scriptish を參考にテキトーに改善
// @note           0.1.7.9 __exposedProps__ を付けた
// @note           0.1.7.9 uAutoPagerize との連攜をやめた
// @note           0.1.7.8 window.open や target="_blank" で実行されないのを修正
// @note           0.1.7.7 @delay 周りのバグを修正
// @note           0.1.7.6 require で外部ファイルの取得がうまくいかない場合があるのを修正
// @note           0.1.7.5 0.1.7.4 にミスがあったので修正
// @note           0.1.7.4 GM_xmlhttpRequest の url が相対パスが使えなかったのを修正
// @note           0.1.7.3 Google Reader NG Filterがとりあえず動くように修正
// @note           0.1.7.2 document-startが機能していなかったのを修正
// @note           0.1.7.1 .tld がうまく動作していなかったのを修正
// @note           書きなおした
// @note           スクリプトを編集時に日本語のファイル名のファイルを開けなかったのを修正
// @note           複數のウインドウを開くとバグることがあったのを修正
// @note           .user.js 間で window を共有できるように修正
// @note           .tld を簡略化した
// @note           スクリプトをキャッシュしないオプションを追加
// @note           GM_safeHTMLParser, GM_generateUUID に対応
// @note           GM_unregisterMenuCommand, GM_enableMenuCommand, GM_disableMenuCommand に対応
// @note           GM_getMetadata に対応(返り値は Array or undefined)
// @note           GM_openInTab に第２引數を追加
// @note           @require, @resource のファイルをフォルダに保存するようにした
// @note           @delay に対応
// @note           @bookmarklet に対応（from NinjaKit）
// @note           GLOBAL_EXCLUDES を用意した
// @note           セキュリティを軽視してみた
// ==/UserScript==

(function(css) {

	const GLOBAL_EXCLUDES = [
		"chrome:*", "jar:*", "resource:*"
	];


	const {
		classes: Cc,
		interfaces: Ci,
		utils: Cu,
		results: Cr
	} = Components;
	if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
	if (!window.Downloads) Cu.import("resource://gre/modules/Downloads.jsm");
	if (!window.OS) Cu.import("resource://gre/modules/osfile.jsm");

	if (window.USL) {
		window.USL.destroy();
		delete window.USL;
	}

	var USL = {};
	//所有腳本設置保存於JSON
	USL.IsSaveSetting = 1;
	//保存間隔時間,1000為1秒
	USL.saveSettingTimer = 60 * 1000;
	// Class
	USL.PrefManager = function(str) {
		var root = 'UserScriptLoader.';
		if (str)
			root += str;
		this.pref = Services.prefs.getBranch(root);
	};
	USL.PrefManager.prototype = {
		setValue: function(name, value) {
			try {
				switch (typeof value) {
					case 'string':
						var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
						str.data = value;
						this.pref.setComplexValue(name, Ci.nsISupportsString, str);
						break;
					case 'number':
						this.pref.setIntPref(name, value);
						break;
					case 'boolean':
						this.pref.setBoolPref(name, value);
						break;
				}
			} catch (e) {}
		},
		getValue: function(name, defaultValue) {
			var value = defaultValue;
			try {
				switch (this.pref.getPrefType(name)) {
					case Ci.nsIPrefBranch.PREF_STRING:
						value = this.pref.getComplexValue(name, Ci.nsISupportsString).data;
						break;
					case Ci.nsIPrefBranch.PREF_INT:
						value = this.pref.getIntPref(name);
						break;
					case Ci.nsIPrefBranch.PREF_BOOL:
						value = this.pref.getBoolPref(name);
						break;
				}
			} catch (e) {}
			return value;
		},
		deleteValue: function(name) {
			try {
				this.pref.deleteBranch(name);
			} catch (e) {}
		},
		listValues: function() this.pref.getChildList("", {}),
	};

	USL.ScriptEntry = function(aFile) {
		this.init.apply(this, arguments);
	};
	USL.ScriptEntry.prototype = {
		includeRegExp: /^https?:\/\/.*/,
		excludeRegExp: /^$/,
		init: function(aFile) {
			this.file = aFile;
			this.leafName = aFile.leafName;
			this.path = aFile.path;
			this.lastModifiedTime = aFile.lastModifiedTime;
			this.code = USL.loadText(aFile);
			this.getMetadata();
			this.disabled = false;
			this.requireSrc = "";
			this.resources = {};

			this.version = "version" in this.metadata ? this.metadata["version"][0] : "未定義";
			this.downloadURL = "downloadurl" in this.metadata ? this.metadata["downloadurl"][0] : null;
			this.updateURL = "updateurl" in this.metadata ? this.metadata["updateurl"][0] : null;
			this.homepageURL = "homepageurl" in this.metadata ? this.metadata["homepageurl"][0] : null;

			let dbInfo = USL.database.info[this.leafName];
			if (dbInfo) {
				this.installTime = dbInfo.installTime;
				this.installURL = dbInfo.installURL;
			}

			if (!this.downloadURL) {
				this.downloadURL = this.installURL;
			}

			this.run_at = "run-at" in this.metadata ? this.metadata["run-at"][0] : "document-end";
			this.name = "name" in this.metadata ? this.metadata.name[0] : this.leafName;
			if (this.metadata.delay) {
				let delay = parseInt(this.metadata.delay[0], 10);
				this.delay = isNaN(delay) ? 0 : Math.max(delay, 0);
			} else if (this.run_at === "document-idle") {
				this.delay = 0;
			}

			// support @grant none
			if ('grant' in this.metadata) {
				if (this.metadata['grant'][0] == 'none')
					this.grantNone = true;
			}

			if (this.metadata.match) {
				this.includeRegExp = this.createRegExp(this.metadata.match, true);
				this.includeTLD = this.isTLD(this.metadata.match);
			} else if (this.metadata.include) {
				this.includeRegExp = this.createRegExp(this.metadata.include);
				this.includeTLD = this.isTLD(this.metadata.include);
			}
			if (this.metadata.unmatch) {
				this.excludeRegExp = this.createRegExp(this.metadata.unmatch, true);
				this.excludeTLD = this.isTLD(this.metadata.unmatch);
			} else if (this.metadata.exclude) {
				this.excludeRegExp = this.createRegExp(this.metadata.exclude);
				this.excludeTLD = this.isTLD(this.metadata.exclude);
			}

			this.prefName = 'scriptival.' + (this.metadata.namespace || 'nonamespace/') + '/' + this.name + '.';
			this.__defineGetter__('pref', function() {
				delete this.pref;
				return this.pref = new USL.PrefManager(this.prefName);
			});

			if (this.metadata.resource) {
				this.metadata.resource.forEach(function(r) {
					let res = r.split(/\s+/);
					this.resources[res[0]] = {
						url: res[1]
					};
				}, this);
			}

			this.getRequire();
			this.getResource();
		},
		getMetadata: function() {
			this.metadata = {};
			let m = this.code.match(/\/\/\s*==UserScript==[\s\S]+?\/\/\s*==\/UserScript==/);
			if (!m)
				return;
			m = (m + '').split(/[\r\n]+/);
			for (let i = 0; i < m.length; i++) {
				if (!/\/\/\s*?@(\S+)($|\s+([^\r\n]+))/.test(m[i]))
					continue;
				let name = RegExp.$1.toLowerCase().trim();
				let value = RegExp.$3;
				if (this.metadata[name]) {
					this.metadata[name].push(value);
				} else {
					this.metadata[name] = [value];
				}
			}
		},
		createRegExp: function(urlarray, isMatch) {
			let regstr = urlarray.map(function(url) {
				if (!isMatch && '/' == url.substr(0, 1) && '/' == url.substr(-1, 1)) {
					return url.substring(1, url.length - 1);
				}
				url = url.replace(/([()[\]{}|+.,^$?\\])/g, "\\$1");
				if (isMatch) {
					url = url.replace(/\*+|:\/\/\*\\\./g, function(str, index, full) {
						if (str === "\\^") return "(?:^|$|\\b)";
						if (str === "://*\\.") return "://(?:[^/]+\\.)?";
						if (str[0] === "*" && index === 0) return "(?:https?|ftp|file)";
						if (str[0] === "*") return ".*";
						return str;
					});
				} else {
					url = url.replace(/\*+/g, ".*");
					url = url.replace(/^\.\*\:?\/\//, "https?://");
					url = url.replace(/^\.\*/, "https?:.*");
				}
				//url = url.replace(/^([^:]*?:\/\/[^\/\*]+)\.tld\b/,"$1\.(?:com|net|org|info|(?:(?:co|ne|or)\\.)?jp)");
				//url = url.replace(/\.tld\//,"\.(?:com|net|org|info|(?:(?:co|ne|or)\\.)?jp)/");
				return "^" + url + "$";
			}).join('|');
			return new RegExp(regstr);
		},
		isTLD: function(urlarray) {
			return urlarray.some(function(url) / ^ . + ? : \/{2,3}?[^\/]+\.tld\b/.test(url));
		},
		makeTLDURL: function(aURL) {
			try {
				var uri = Services.io.newURI(aURL, null, null);
				uri.host = uri.host.slice(0, -Services.eTLD.getPublicSuffix(uri).length) + "tld";
				return uri.spec;
			} catch (e) {}
			return "";
		},
		isURLMatching: function(url) {
			if (this.disabled) return false;
			if (this.excludeRegExp.test(url)) return false;

			var tldurl = this.excludeTLD || this.includeTLD ? this.makeTLDURL(url) : "";
			if (this.excludeTLD && tldurl && this.excludeRegExp.test(tldurl)) return false;
			if (this.includeRegExp.test(url)) return true;
			if (this.includeTLD && tldurl && this.includeRegExp.test(tldurl)) return true;
			return false;
		},
		getResource: function() {
			if (!this.metadata.resource) return;
			var self = this;
			for (let [name, aaa] in Iterator(this.resources)) {
				let obj = aaa;
				let url = obj.url;
				let aFile = USL.REQUIRES_FOLDER.clone();
				aFile.QueryInterface(Ci.nsILocalFile);
				aFile.appendRelativePath(encodeURIComponent(url));
				if (aFile.exists() && aFile.isFile()) {
					let fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
					USL.getLocalFileContents(fileURL, function(bytes, contentType) {
						let ascii = /^text|javascript/.test(contentType);
						if (ascii) {
							try {
								bytes = decodeURIComponent(escape(bytes));
							} catch (e) {}
						}
						obj.bytes = bytes;
						obj.contentType = contentType;
					});
					continue;
				}
				USL.getContents(url, function(bytes, contentType) {
					let ascii = /^text|javascript/.test(contentType);
					if (ascii) {
						try {
							bytes = decodeURIComponent(escape(bytes));
						} catch (e) {}
					}
					let data = ascii ? USL.saveText(aFile, bytes) : USL.saveFile(aFile, bytes);
					obj.bytes = data;
					obj.contentType = contentType;
				});
			}
		},
		getRequire: function() {
			if (!this.metadata.require) return;
			var self = this;
			this.metadata.require.forEach(function(url) {
				let aFile = USL.REQUIRES_FOLDER.clone();
				aFile.QueryInterface(Ci.nsILocalFile);
				aFile.appendRelativePath(encodeURIComponent(url));
				if (aFile.exists() && aFile.isFile()) {
					self.requireSrc += USL.loadText(aFile) + ";\r\n";
					return;
				}
				USL.getContents(url, function(bytes, contentType) {
					let ascii = /^text|javascript/.test(contentType);
					if (ascii) {
						try {
							bytes = decodeURIComponent(escape(bytes));
						} catch (e) {}
					}
					let data = ascii ? USL.saveText(aFile, bytes) : USL.saveFile(aFile, bytes);
					self.requireSrc += data + ';\r\n';
				});
			}, this);
		},
	};

	USL.API = function(script, sandbox, win, doc) {
		var self = this;

		this.GM_log = function() {
			var arr = Array.slice(arguments);
			arr.unshift('[' + script.name + ']');
			win.console.log.apply(win.console, arr);
			// Services.console.logStringMessage("["+ script.name +"] " + Array.slice(arguments).join(", "));
		};

		this.GM_xmlhttpRequest = function(obj) {
			if (typeof(obj) != 'object' || (typeof(obj.url) != 'string' && !(obj.url instanceof String))) return;

			var baseURI = Services.io.newURI(win.location.href, null, null);
			obj.url = Services.io.newURI(obj.url, null, baseURI).spec;
			var req = new XMLHttpRequest();
			req.open(obj.method || 'GET', obj.url, true);
			if (typeof(obj.headers) == 'object')
				for (var i in obj.headers) req.setRequestHeader(i, obj.headers[i]);
			['onload', 'onerror', 'onreadystatechange'].forEach(function(k) {
				// thx! script uploader
				let obj_k = (obj.wrappedJSObject) ? new XPCNativeWrapper(obj.wrappedJSObject[k]) : obj[k];
				if (obj_k && (typeof(obj_k) == 'function' || obj_k instanceof Function)) req[k] = function() {
					obj_k({
						__exposedProps__: {
							status: "r",
							statusText: "r",
							responseHeaders: "r",
							responseText: "rw",
							readyState: "r",
							finalUrl: "r"
						},
						status: (req.readyState == 4) ? req.status : 0,
						statusText: (req.readyState == 4) ? req.statusText : '',
						responseHeaders: (req.readyState == 4) ? req.getAllResponseHeaders() : '',
						responseText: req.responseText,
						readyState: req.readyState,
						finalUrl: (req.readyState == 4) ? req.channel.URI.spec : ''
					});
				};
			});

			if (obj.overrideMimeType) req.overrideMimeType(obj.overrideMimeType);
			var c = 0;
			var timer = setInterval(function() {
				if (req.readyState == 1 || ++c > 100) {
					clearInterval(timer);
					req.send(obj.data || null);
				}
			}, 10);
			USL.debug(script.name + ' GM_xmlhttpRequest ' + obj.url);
		};

		this.GM_addStyle = function GM_addStyle(code) {
			var head = doc.getElementsByTagName('head')[0];
			if (head) {
				var style = doc.createElement('style');
				style.type = 'text/css';
				style.appendChild(doc.createTextNode(code + ''));
				head.appendChild(style);
				return style;
			}
		};

		this.GM_setValue = function(name, value) {
			if (!USL.IsSaveSetting) {
				return USL.USE_STORAGE_NAME.indexOf(name) >= 0 ?
					USL.database.pref[script.prefName + name] = value :
					script.pref.setValue(name, value);
			} else {
				USL.database.pref[script.prefName + name] = value;
				if (USL.saveSettingTimeout) {
					clearTimeout(USL.saveSettingTimeout)
					USL.saveSettingTimeout = null;
				}
				USL.saveSettingTimeout = setTimeout(function() {
					USL.saveSetting()
				}, USL.saveSettingTimer)
			}
		};

		this.GM_getValue = function(name, def) {
			if (!USL.IsSaveSetting) {
				return USL.USE_STORAGE_NAME.indexOf(name) >= 0 ?
					USL.database.pref[script.prefName + name] || def :
					script.pref.getValue(name, def);
			} else return USL.database.pref[script.prefName + name] || def;
		};

		this.GM_listValues = function() {
			var p = script.pref.listValues();
			//var s = [x for (x in USL.database.pref[script.prefName + name])];
			var s = [];
			for (x in USL.database.pref[script.prefName + name]) s.push(x);
			s.forEach(function(e, i, a) a[i] = e.replace(script.prefName, ''));
			p.push.apply(p, s);
			return p;
		};

		this.GM_deleteValue = function(name) {
			if (!USL.IsSaveSetting) {
				return USL.USE_STORAGE_NAME.indexOf(name) >= 0 ?
					delete USL.database.pref[script.prefName + name] :
					script.pref.deleteValue(name);
			} else return delete USL.database.pref[script.prefName + name]
		};

		this.GM_registerMenuCommand = function(label, func, aAccelKey, aAccelModifiers, aAccessKey) {
			let uuid = self.GM_generateUUID();
			win.USL_registerCommands[uuid] = {
				label: label,
				func: func,
				accelKey: aAccelKey,
				accelModifiers: aAccelModifiers,
				accessKey: aAccessKey,
				tooltiptext: script.name
			};
			return uuid;
		};

		this.GM_unregisterMenuCommand = function(aUUID) {
			return delete win.USL_registerCommands[aUUID];
		};

		this.GM_enableMenuCommand = function(aUUID) {
			let item = win.USL_registerCommands[aUUID];
			if (item) delete item.disabled;
		};

		this.GM_disableMenuCommand = function(aUUID) {
			let item = win.USL_registerCommands[aUUID];
			if (item) item.disabled = "true";
		};

		this.GM_getResourceText = function(name) {
			let obj = script.resources[name];
			if (obj) return obj.bytes;
		};

		this.GM_getResourceURL = function(name) {
			let obj = script.resources[name];
			try {
				if (obj) return 'data:' + obj.contentType + ';base64,' + btoa(obj.bytes);
			} catch (e) {
				USL.error(e);
			}
		};

		this.GM_getMetadata = function(key) {
			return script.metadata[key] ? script.metadata[key].slice() : void 0;
		};

		this.GM_notification = function(msg, title, icon, callback) {
			if (!icon)
				icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NDcgLTA1MDDUnvhKAAAAB3RJTUUH2AQGETEsCzNv6AAAAk9JREFUOE9lU09Ik3EYfo91mtFhY2NtKxexQGOMMJU5sojoYGU3g1UyNUQ0Kvpjukozgmqm1iyyr4zMpBweyvCybh7NOgjq+mYUdeu449P7vl+bW/7g4ff+eZ6Hl9/7feT3+8nn85HH4yG3201Op5PsdnsB8QhVMjpPVlDqwHYyi3t6igt5sMDDSDDM9r2EQ+WEiFcRL+bpcTgcJfgnhKCpoiBEwy7ChWpKHy4nk3ObcDcYsGhBhInGLWgNEaJ7CM1BwvlqC40BNavL8/X0hKmhp45SvYzXXbuR+9wHLN/HwosmnUJuyaUufeEJX3Rq0F2/+c9YR1DJKl4ZBDKPgG9PYM5e1BuZJNeHuN+vPOGLTg2G24KYGTgCo2UHkxJKNiZPwxiPAWuvYLxp4fgMGz3m/gPlCV90lkFHDSYu1WC2LwysjgDmU0Q6IyirLQN+TK/HpqGTCe9tvB6iU4NYeKspBvPJo9bo2eegnQRyE/Dr43q8Nq5TzCePqYHo1IDXEr26fxNyi7cKBsbDs4wu4PccjOQ5GCPtbPBSDXKLAxC+6NSAH8Uma8PyPQx2H8eX9zeA7xM8/jvg5wxjmvNJfP1wE0PXTuhG5CHliy0Y5DeQTfei+WAlooFt6K8KYHRfAHf4jgU8aOV69tN15ZUYSMCFdOpKiN3v6rqQGdXHhPmMMWZtQB6YpxSe8P83kB/GlBUtTZ2y1rk6bInk5m9jaYpXy33hCb9g4HK5FFy0tYXo9uVaWuFYxyyG1KXPsS2vKTEoKnoZVYxIEST3buQS/QUCx7vn2Dh8TQAAAABJRU5ErkJggg==";

			let aBrowser = win.QueryInterface(Ci.nsIDOMWindow)
				.QueryInterface(Ci.nsIInterfaceRequestor)
				.getInterface(Ci.nsIWebNavigation)
				.QueryInterface(Ci.nsIDocShell).chromeEventHandler;

			let buttons = [{
				label: msg,
				accessKey: 'U',
				callback: function(aNotification, aButton) {
					try {
						if (callback)
							callback.call(win);
					} catch (e) {
						self.GM_log(new Error(e));
					}
				}.bind(this)
			}];
			let notificationBox = gBrowser.getNotificationBox(aBrowser);
			let notification = notificationBox.appendNotification(
				title, 'USL_notification', icon,
				notificationBox.PRIORITY_INFO_MEDIUM,
				buttons);
		};
	};
	USL.API.prototype = {
		GM_openInTab: function(url, loadInBackground, reuseTab) {
			openLinkIn(url, loadInBackground ? "tabshifted" : "tab", {});
		},
		GM_setClipboard: function(str) {
			if (str.constructor === String || str.constructor === Number) {
				Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(str);
			}
		},
		GM_safeHTMLParser: function(code) {
			let HTMLNS = "http://www.w3.org/1999/xhtml";
			let gUnescapeHTML = Cc["@mozilla.org/feed-unescapehtml;1"].getService(Ci.nsIScriptableUnescapeHTML);
			let doc = document.implementation.createDocument(HTMLNS, "html", null);
			let body = document.createElementNS(HTMLNS, "body");
			doc.documentElement.appendChild(body);
			body.appendChild(gUnescapeHTML.parseFragment(code, false, null, body));
			return doc;
		},
		GM_generateUUID: function() {
			return Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator).generateUUID().toString();
		},


		// 以下我新增的
		/**
		 * filename 支持 text/a.html
		 */
		GM_saveFile: function(data, filename, dir) {
			var file = getDownloadFile(filename, dir);

			var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			converter.charset = 'UTF-8';
			var istream = converter.convertToInputStream(data);
			var ostream = FileUtils.openSafeFileOutputStream(file);

			NetUtil.asyncCopy(istream, ostream, function(status) {
				if (!Components.isSuccessCode(status)) {
					// Handle error!
					return;
				}

				// Data has been written to the file.
			});
		},
		GM_saveFileSync: function(data, filename, dir) {
			var file = getDownloadFile(filename, dir);

			var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			converter.charset = 'UTF-8';
			data = converter.ConvertFromUnicode(data);

			var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
			foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
			foStream.write(data, data.length);
			foStream.close();
		},

		/**
		 * http://tampermonkey.net/documentation.php?ext=dhdg#GM_download
		 * GM_download(url, name)  GM_download(details)
		 */
		GM_download: function(url, name, dir) {
			var details;
			if (arguments.length == 1) {
				details = arguments[0];
			} else {
				details = {
					url: arguments[0],
					name: arguments[1],
					dir: arguments[2],
				};
			}

			if (!details.name) {
				try {
					details.name = getFileBaseName(url);
				} catch (ex) {}
			}
			details.onload || (details.onload = function() {});

			var uri;
			try {
				uri = NetUtil.newURI(url);
			} catch (ex) {
				USL.error(ex)
				return;
			}

			var targetFile = getDownloadFile(details.name, details.dir);

			var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
				.createInstance(Ci.nsIWebBrowserPersist);
			persist.persistFlags = persist.PERSIST_FLAGS_FROM_CACHE | persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
			persist.progressListener = {
				onProgressChange: function(progress, request, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
				onStateChange: function(progress, request, flags, status) {
					if ((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0) {
						details.onload(targetFile.path);
					}
				}
			};

			persist.saveURI(uri, null, uri, Ci.nsIHttpChannel.REFERRER_POLICY_NO_REFERRER_WHEN_DOWNGRADE, null, null, targetFile, null);
		},
		GM_run: function(path, args) {
			var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);

			file.initWithPath(path);
			if (!args) args = [];

			try {
				if (file.isExecutable()) {
					process.init(file);
					process.runw(false, args, args.length);
				} else {
					file.launch();
				}
			} catch (ex) {
				USL.log(ex);
			}
		},
	};

	function safeFileName(title) {
		return title.replace(/:/g, '：').replace(/[\\\|\:\*\"\?\<\>]/g, "_");
	}

	// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O
	function getDownloadFile(filename, dir) {
		if (!getDownloadFile.isSeted) {
			// 注冊一個自定義路徑供下面調用
			Cc["@mozilla.org/file/directory_service;1"]
				.getService(Ci.nsIProperties)
				.set("Dwnld", USL.DOWNLOAD_FOLDER);
			getDownloadFile.isSeted = true;
		}

		var pathArr = dir ? dir.split(/\/|\\/) : [];
		filename = safeFileName(filename)
		pathArr.push(filename);
		var file = FileUtils.getFile("Dwnld", pathArr, true);
		return file;
	}

	function playSoundFile(aFilePath) {
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
			.createInstance(Components.interfaces["nsIIOService"]);
		try {
			var uri = ios.newURI(aFilePath, "UTF-8", null);
		} catch (e) {
			return;
		}
		var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
		if (!file.exists())
			return;

		play(uri);
	}

	function play(aUri) {
		var sound = Components.classes["@mozilla.org/sound;1"]
			.createInstance(Components.interfaces["nsISound"]);
		sound.play(aUri);
	}

	USL.database = {
		info: {},
		pref: {},
		resource: {}
	};
	USL.readScripts = [];
	USL.USE_STORAGE_NAME = ['cache', 'cacheInfo'];
	USL.initialized = false;

	USL.__defineGetter__("pref", function() {
		delete this.pref;
		return this.pref = new USL.PrefManager();
	});

	USL.__defineGetter__("SCRIPTS_FOLDER", function() {
		let folderPath = this.pref.getValue('SCRIPTS_FOLDER', "");
		let aFolder = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile)
		if (!folderPath) {
			aFolder.initWithPath(Services.dirsvc.get("UChrm", Ci.nsIFile).path);
			aFolder.appendRelativePath('UserScriptLoader');
		} else {
			aFolder.initWithPath(folderPath);
		}
		if (!aFolder.exists() || !aFolder.isDirectory()) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.SCRIPTS_FOLDER;
		return this.SCRIPTS_FOLDER = aFolder;
	});

	USL.__defineGetter__("REQUIRES_FOLDER", function() {
		let aFolder = this.SCRIPTS_FOLDER.clone();
		aFolder.QueryInterface(Ci.nsILocalFile);
		aFolder.appendRelativePath('require');
		if (!aFolder.exists() || !aFolder.isDirectory()) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.REQUIRES_FOLDER;
		return this.REQUIRES_FOLDER = aFolder;
	});

	USL.__defineGetter__("TEMP_FOLDER", function() {
		let aFolder = this.SCRIPTS_FOLDER.clone();
		aFolder.QueryInterface(Ci.nsILocalFile);
		aFolder.appendRelativePath('temp');
		if (!aFolder.exists() || !aFolder.isDirectory()) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.TEMP_FOLDER;
		return this.TEMP_FOLDER = aFolder;
	});

	USL.__defineGetter__("NEW_VERSION_FOLDER", function() {
		let aFolder = this.SCRIPTS_FOLDER.clone();
		aFolder.QueryInterface(Ci.nsILocalFile);
		aFolder.appendRelativePath('newVersion');
		if (!aFolder.exists() || !aFolder.isDirectory()) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.NEW_VERSION_FOLDER;
		return this.NEW_VERSION_FOLDER = aFolder;
	});

	USL.__defineGetter__("EDITOR", function() {
		delete this.EDITOR;
		return this.EDITOR = this.pref.getValue('EDITOR', "") || Services.prefs.getCharPref("view_source.editor.path");
	});

	USL.__defineGetter__("disabled_scripts", function() {
		let ds = this.pref.getValue('script.disabled', '');
		delete this.disabled_scripts;
		return this.disabled_scripts = ds ? ds.split('|') : [];
	});

	USL.__defineGetter__("GLOBAL_EXCLUDES_REGEXP", function() {
		let regexp = null;
		let ge = USL.pref.getValue('GLOBAL_EXCLUDES', null);
		ge = ge ? ge.trim().split(/\s*\,\s*/) : GLOBAL_EXCLUDES;
		try {
			regexp = new RegExp(ge.map(USL.wildcardToRegExpStr).join("|"));
		} catch (e) {
			regexp = /^(?:chrome|resource|jar):/;
		}
		delete this.GLOBAL_EXCLUDES_REGEXP;
		return this.GLOBAL_EXCLUDES_REGEXP = regexp;
	});

	USL.__defineGetter__("DOWNLOAD_FOLDER", function() {
		var prefs = Services.prefs.getBranch("browser.download.");
		try {
			var aFolder = prefs.getComplexValue("dir", Ci.nsILocalFile);
		} catch (ex) {
			var aFolder = FileUtils.getFile("DfltDwnld", []);
		}
		delete this.DOWNLOAD_FOLDER;
		return this.DOWNLOAD_FOLDER = aFolder;
	});


	var DISABLED = true;
	USL.__defineGetter__("disabled", function() DISABLED);
	USL.__defineSetter__("disabled", function(bool) {
		if (bool) {
			this.icon.setAttribute("state", "disable");
			this.icon.setAttribute("tooltiptext", "UserScriptLoader已禁用");
			// gBrowser.mPanelContainer.removeEventListener("DOMWindowCreated", this, false);
		} else {
			this.icon.setAttribute("state", "enable");
			this.icon.setAttribute("tooltiptext", "UserScriptLoader已啟用");
			// gBrowser.mPanelContainer.addEventListener("DOMWindowCreated", this, false);
		}
		return DISABLED = bool;
	});

	var DEBUG = USL.pref.getValue('DEBUG', false);
	USL.__defineGetter__("DEBUG", function() DEBUG);
	USL.__defineSetter__("DEBUG", function(bool) {
		DEBUG = !!bool;
		let elem = $("UserScriptLoader-debug-mode");
		if (elem) elem.setAttribute("checked", DEBUG);
		return bool;
	});

	var HIDE_EXCLUDE = USL.pref.getValue('HIDE_EXCLUDE', false);
	USL.__defineGetter__("HIDE_EXCLUDE", function() HIDE_EXCLUDE);
	USL.__defineSetter__("HIDE_EXCLUDE", function(bool) {
		HIDE_EXCLUDE = !!bool;
		let elem = $("UserScriptLoader-hide-exclude");
		if (elem) elem.setAttribute("checked", HIDE_EXCLUDE);
		return bool;
	});

	var ALLOW_NOTIFY = USL.pref.getValue('ALLOW_NOTIFY', true);
	USL.__defineGetter__("ALLOW_NOTIFY", function() ALLOW_NOTIFY);
	USL.__defineSetter__("ALLOW_NOTIFY", function(bool) {
		ALLOW_NOTIFY = !!bool;
		let elem = $("UserScriptLoader-allow-notify");
		if (elem) elem.setAttribute("checked", ALLOW_NOTIFY);
		return bool;
	});

	var AUTO_RELOAD_PAGE = USL.pref.getValue('AUTO_RELOAD_PAGE', true);
	USL.__defineGetter__("AUTO_RELOAD_PAGE", function() AUTO_RELOAD_PAGE);
	USL.__defineSetter__("AUTO_RELOAD_PAGE", function(bool) {
		AUTO_RELOAD_PAGE = !!bool;
		let elem = $("UserScriptLoader-auto-reload-page");
		if (elem) elem.setAttribute("checked", AUTO_RELOAD_PAGE);
		return bool;
	});

	var CACHE_SCRIPT = USL.pref.getValue('CACHE_SCRIPT', true);
	USL.__defineGetter__("CACHE_SCRIPT", function() CACHE_SCRIPT);
	USL.__defineSetter__("CACHE_SCRIPT", function(bool) {
		CACHE_SCRIPT = !!bool;
		let elem = $("UserScriptLoader-cache-script");
		if (elem) elem.setAttribute("checked", CACHE_SCRIPT);
		return bool;
	});

	var MY_EDITOR = USL.pref.getValue('MY_EDITOR', true);
	USL.__defineGetter__("MY_EDITOR", function() MY_EDITOR);
	USL.__defineSetter__("MY_EDITOR", function(bool) {
		MY_EDITOR = !!bool;
		let elem = $("UserScriptLoader-use-myeditor");
		if (elem) elem.setAttribute("checked", MY_EDITOR);
		return bool;
	});

	USL.getFocusedWindow = function() {
		var win = document.commandDispatcher.focusedWindow;
		return (!win || win == window) ? content : win;
	};

	USL.init = function() {
		USL.loadSetting();
		USL.style = addStyle(css);
		USL.icon = $('urlbar-icons').appendChild($C("image", {
			id: "UserScriptLoader-icon",
			context: "UserScriptLoader-popup",
			onclick: "USL.iconClick(event);",
			tooltiptext: "油猴腳本管理器（左鍵開關）"
		}));

		var xml = '\
				<menupopup id="UserScriptLoader-popup" onpopupshowing="USL.onPopupShowing(event);" onpopuphidden="USL.onPopupHidden(event);" onclick="USL.menuClick(event);">\
					<menuseparator id="UserScriptLoader-menuseparator"/>\
					<menu label="腳本命令" id="UserScriptLoader-register-menu">\
						<menupopup id="UserScriptLoader-register-popup"/>\
					</menu>\
					<menu label="管理菜單" id="UserScriptLoader-submenu">\
						<menupopup id="UserScriptLoader-submenu-popup">\
							<menuitem label="刪除 Pref" id="UserScriptLoader-delete-pref" oncommand="USL.deleteStorage(\'pref\');" tooltiptext="刪除存儲在 UserScriptLoader.json 文件中的 pref"/>\
							<menuitem label="刪除額外信息" id="UserScriptLoader-delete-info" oncommand="USL.deleteStorage(\'info\');" tooltiptext="刪除存儲在 UserScriptLoader.json 文件中的額外信息，包括安裝地址、安裝時間"/>\
							<menuseparator/>\
							<menuitem label="隱藏未觸發腳本" id="UserScriptLoader-hide-exclude" type="checkbox" checked="' + USL.HIDE_EXCLUDE + '" oncommand="USL.HIDE_EXCLUDE = !USL.HIDE_EXCLUDE;"/>\
							<menuitem label="打開腳本文件夾" id="UserScriptLoader-openFolderMenu" oncommand="USL.openFolder();"/>\
							<menuitem label="重新載入腳本" oncommand="USL.rebuild();"/>\
							<menuitem label="緩存所有腳本" id="UserScriptLoader-cache-script" type="checkbox" checked="' + USL.CACHE_SCRIPT + '" tooltiptext="緩存腳本則不檢查文件的修改時間，修改文件後並不會自動載入" oncommand="USL.CACHE_SCRIPT = !USL.CACHE_SCRIPT;"/>\
							<menuitem label="Use My Editor" id="UserScriptLoader-use-myeditor" type="checkbox" checked="' + USL.MY_EDITOR + '" oncommand="USL.MY_EDITOR = !USL.MY_EDITOR;"/>\
							<menuitem label="啟用調試模式" id="UserScriptLoader-debug-mode" type="checkbox" checked="' + USL.DEBUG + '" oncommand="USL.DEBUG = !USL.DEBUG;"/>\
							<menuitem label="自動刷新頁面" id="UserScriptLoader-auto-reload-page" type="checkbox" checked="' + USL.AUTO_RELOAD_PAGE + '" oncommand="USL.AUTO_RELOAD_PAGE = !USL.AUTO_RELOAD_PAGE;" />\
						</menupopup>\
					</menu>\
					<menu label="相關網站">\
						<menupopup>\
							<menuitem label="greasyfork.org" oncommand="USL.openTab(\'https://greasyfork.org/scripts\');" />\
							<menuitem label="Userscripts.org" oncommand="USL.openTab(\'http://userscripts.org:8080/\');" />\
							<menuseparator/>\
							<menuitem label="Greasespot 博客" oncommand="USL.openTab(\'http://www.greasespot.net/\');" />\
							<menuitem label="Greasespot Wiki" oncommand="USL.openTab(\'http://wiki.greasespot.net/\');" />\
							<menuitem label="Greasemonkey 手冊" oncommand="USL.openTab(\'http://wiki.greasespot.net/Greasemonkey_Manual\');" />\
							<menuseparator/>\
							<menuitem label="GM 腳本開發小冊子" oncommand="USL.openTab(\'http://jixunmoe.github.io/gmDevBook\');"/>\
						</menupopup>\
					</menu>\
					<menuseparator/>\
					<menuitem label="檢查腳本更新" id="UserScriptLoader-check-script" oncommand="USL.checkScripts();" />\
					<menuitem label="為本站搜索腳本" id="UserScriptLoader-find-script" oncommand="USL.findscripts();" onclick="if(event.button !=2) USL.findscripts(\'search\');" />\
					<menuitem label="保存當前頁面腳本" id="UserScriptLoader-saveMenu" oncommand="USL.saveScript();"/>\
				</menupopup>\
			';
		var range = document.createRange();
		range.selectNodeContents($('mainPopupSet'));
		range.collapse(false);
		range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
		range.detach();

		USL.popup = $('UserScriptLoader-popup');
		USL.menuseparator = $('UserScriptLoader-menuseparator');
		USL.registMenu = $('UserScriptLoader-register-menu');
		USL.saveMenu = $('UserScriptLoader-saveMenu');

		USL.rebuild();
		USL.disabled = USL.pref.getValue('disabled', false);
		Array.from(gBrowser.browsers, browser => {
			browser.addEventListener('DOMWindowCreated', USL, false);
		});
		gBrowser.mTabContainer.addEventListener('TabOpen', USL, false);
		gBrowser.mTabContainer.addEventListener('TabClose', USL, false);
		window.addEventListener('unload', USL, false);
		USL.initialized = true;
	};

	USL.uninit = function() {
		Array.from(gBrowser.browsers, browser => {
			browser.removeEventListener('DOMWindowCreated', USL, false);
		});
		gBrowser.mTabContainer.removeEventListener('TabOpen', USL, false);
		gBrowser.mTabContainer.removeEventListener('TabClose', USL, false);
		window.removeEventListener('unload', USL, false);
	};

	USL.destroy = function() {
		USL.saveSetting();
		USL.uninit();

		var e = document.getElementById("UserScriptLoader-icon");
		if (e) e.parentNode.removeChild(e);
		var e = document.getElementById("UserScriptLoader-popup");
		if (e) e.parentNode.removeChild(e);
		if (USL.style) USL.style.parentNode.removeChild(USL.style);
		USL.disabled = true;
	};

	USL.handleEvent = function(event) {
		switch (event.type) {
			case "DOMWindowCreated":
				var win = event.target.defaultView;
				win.USL_registerCommands = {};
				win.USL_run = [];
				win.USL_match = [];
				if (USL.disabled) return;
				if (USL.readScripts.length === 0) return;
				USL.injectScripts(win);
				break;
			case 'TabOpen':
				event.target.linkedBrowser.addEventListener('DOMWindowCreated', USL, false);
				break;
			case 'TabClose':
				event.target.linkedBrowser.removeEventListener('DOMWindowCreated', USL, false);
				break;
			case "unload":
				USL.saveSetting();
				USL.uninit();
				break;
		}
	};

	USL.createMenuitem = function() {
		if (USL.popup.firstChild != USL.menuseparator) {
			var range = document.createRange();
			range.setStartBefore(USL.popup.firstChild);
			range.setEndBefore(USL.menuseparator);
			range.deleteContents();
			range.detach();
		}
		USL.readScripts.forEach(function(script) {
			let m = document.createElement('menuitem');
			m.setAttribute('label', script.name + '(' + script.version + ')');
			m.setAttribute('tooltiptext', '左鍵啟用/禁用，中鍵打開主頁，右鍵編輯');
			m.setAttribute("class", "UserScriptLoader-item");
			m.setAttribute('checked', !script.disabled);
			m.setAttribute('type', 'checkbox');
			m.setAttribute('oncommand', 'this.script.disabled = !this.script.disabled;if(USL.AUTO_RELOAD_PAGE)BrowserReload();');
			m.script = script;
			USL.popup.insertBefore(m, USL.menuseparator);
		});
	};

	USL.rebuild = function() {
		//USL.disabled_scripts = [x.leafName for each(x in USL.readScripts) if (x.disabled)];
		USL.disabled_scripts = [];
		for each(x in USL.readScripts) if (x.disabled) USL.disabled_scripts.push(x.leafName);
		USL.pref.setValue('script.disabled', USL.disabled_scripts.join('|'));

		let newScripts = [];
		let ext = /\.user\.js$/i;
		let files = USL.SCRIPTS_FOLDER.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

		while (files.hasMoreElements()) {
			let file = files.getNext().QueryInterface(Ci.nsIFile);
			if (!ext.test(file.leafName)) continue;
			let script = loadScript(file);
			newScripts.push(script);
		}

		ApplyPatchForScript.addHomePage(newScripts);
		USL.readScripts = newScripts;
		USL.createMenuitem();

		function loadScript(aFile) {
			var script,
				leafName = aFile.leafName,
				lastModifiedTime = aFile.lastModifiedTime;
			USL.readScripts.some(function(s, i) {
				if (s.leafName === leafName) {
					if (s.lastModifiedTime !== lastModifiedTime && USL.initialized) {
						USL.log(s.name + " reload.");
						return true;
					}
					script = s;
					return true;
				}
			});

			if (!script) {
				script = new USL.ScriptEntry(aFile);
				if (USL.disabled_scripts.indexOf(leafName) !== -1)
					script.disabled = true;
			}
			return script;
		}
	};

	USL.reloadScripts = function() {
		USL.readScripts.forEach(function(script, index) {
			let aFile = script.file;
			if (aFile.exists()) {
				if (script.lastModifiedTime !== aFile.lastModifiedTimeOfLink) {
					script.init(aFile);
					USL.log(script.name + " reload.");
				}
			} else {
				USL.readScripts.splice(index, 1);
				USL.createMenuitem();
			}
		});
	};

	USL.openFolder = function() {
		USL.SCRIPTS_FOLDER.launch();
	};

	USL.openTab = function(url, loadInBackground) {
		if (url) {
			openLinkIn(url, loadInBackground ? "tab" : "tabshifted", {});
		}
	};

	USL.saveScript = function() {
		var win = USL.getFocusedWindow();
		var doc = win.document;
		var name = /\/\/\s*@name\s+(.*)/i.exec(doc.body.textContent);
		var filename = (name && name[1] ? name[1] : win.location.href.split("/").pop()).replace(/\.user\.js$|$/i, ".user.js");

		// https://developer.mozilla.org/ja/XUL_Tutorial/Open_and_Save_Dialogs
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, "", Ci.nsIFilePicker.modeSave);
		fp.appendFilter("JS Files", "*.js");
		fp.appendFilters(Ci.nsIFilePicker.filterAll);
		fp.displayDirectory = USL.SCRIPTS_FOLDER; // nsILocalFile
		fp.defaultExtension = "js";
		fp.defaultString = filename;
		var callbackObj = {
			done: function(res) {
				if (res != fp.returnOK && res != fp.returnReplace) return;

				var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
				wbp.persistFlags = wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
				var uri = doc.documentURIObject;
				var loadContext = win.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsILoadContext);

				// 修改後載入
				wbp.progressListener = {
					onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
					onStateChange: function(progress, request, flags, status) {
						if ((flags & Ci.nsIWebProgressListener.STATE_STOP) && status == 0) {
							// 保存相關信息
							USL.database.info[fp.file.leafName] = {
								installURL: win.location.href,
								installTime: fp.file.lastModifiedTime
							};

							USL.rebuild();

							let details = {
								id: "UserScriptLoader-install-popup-notification",
								message: "'" + fp.file.leafName + "' 安裝完畢",
								mainAction: null,
								secondActions: null,
								options: null
							};

							PopupNotifications.show(
								gBrowser.selectedBrowser,
								details.id,
								details.message,
								"",
								details.mainAction,
								details.secondActions,
								details.options);
						}
					}
				};

				wbp.saveURI(uri, null, uri, null, null, null, fp.file, loadContext);
			}
		}
		fp.open(callbackObj);
	};

	USL.deleteStorage = function(type) {
		var data = USL.database[type];
		//var list = [x for (x in data)];
		var list = [];
		for (x in data) list.push(x);
		if (list.length == 0)
			return alert(type + ' is none.');

		list.push('All ' + type);
		var selected = {};
		var ok = Services.prompt.select(
			window, "UserScriptLoader " + type, "Select delete URL.", list.length, list, selected);

		if (!ok) return;
		if (selected.value == list.length - 1) {
			list.pop();
			list.forEach(function(url, i, a) {
				delete data[url]
			});
			return;
		}
		delete data[list[selected.value]];
	};

	USL.onPopupShowing = function(event) {
		var win = USL.getFocusedWindow();
		var popup = event.target;

		switch (popup.id) {
			case 'UserScriptLoader-popup':
				let run = win.USL_run,
					match = win.USL_match;
				Array.slice(popup.children).some(function(menuitem) {
					if (!menuitem.classList.contains("UserScriptLoader-item")) return true;
					let index_run = run ? run.indexOf(menuitem.script) : -1,
						index_match = match ? match.indexOf(menuitem.script) : -1;
					menuitem.style.fontWeight = index_run !== -1 ? "bold" : "";
					menuitem.hidden = USL.HIDE_EXCLUDE && index_match === -1;
				});
				//USL.saveMenu.hidden = win.document.contentType.indexOf("javascript") === -1;
				USL.saveMenu.hidden = !(/\.user\.js$/.test(win.document.location.href) && /javascript|plain/.test(win.document.contentType));
				b: if (win.USL_registerCommands) {
						for (let n in win.USL_registerCommands) {
							USL.registMenu.disabled = false;
							break b;
						}
						USL.registMenu.disabled = true;
					} else {
						USL.registMenu.disabled = true;
					}
				break;

			case 'UserScriptLoader-register-popup':
				var registers = win.USL_registerCommands;
				if (!registers) return;
				for (let [uuid, item] in Iterator(registers)) {
					let m = document.createElement('menuitem');
					m.setAttribute('label', item.label);
					m.setAttribute('tooltiptext', item.tooltiptext);
					m.setAttribute('oncommand', 'this.registCommand();');
					if (item.accessKey)
						m.setAttribute("accesskey", item.accessKey);
					if (item.disabled)
						m.setAttribute("disabled", item.disabled);
					m.registCommand = item.func;
					popup.appendChild(m);
				}
				break;

			case 'UserScriptLoader-submenu-popup':
				// 加上數量
				let menuitem = $('UserScriptLoader-delete-pref');
				menuitem.label = menuitem.label.replace(/(\(\d+\))?$/, '(' + Object.keys(USL.database.pref).length + ')');

				menuitem = $('UserScriptLoader-delete-info');
				menuitem.label = menuitem.label.replace(/(\(\d+\))?$/, '(' + Object.keys(USL.database.info).length + ')');
				break;
		}
	};

	USL.onPopupHidden = function(event) {
		var popup = event.target;
		switch (popup.id) {
			case 'UserScriptLoader-register-popup':
				var child = popup.firstChild;
				while (child && child.localName == 'menuitem') {
					popup.removeChild(child);
					child = popup.firstChild;
				}
				break;
		}
	};

	USL.menuClick = function(event) {
		var menuitem = event.target;
		if (event.button == 0 || menuitem.getAttribute('type') != 'checkbox')
			return;

		event.preventDefault();
		event.stopPropagation();
		if (event.button == 1) {
			if (menuitem.script) {
				var url = menuitem.script.homepageURL || menuitem.script.downloadURL;
				if (url) {
					openLinkIn(url, "tab", {});
				}
			}
		} else if (event.button == 2 && menuitem.script) {
			USL.edit(menuitem.script);
		}
	};

	USL.edit = function(script) {
		if (!USL.MY_EDITOR || !USL.EDITOR)
			return USL.editByScratchpad(script);
		try {
			var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			// UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "Shift_JIS": "UTF-8";
			UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0 ? "BIG5" : "UTF-8";
			var path = UI.ConvertFromUnicode(script.path);
			var app = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			app.initWithPath(USL.EDITOR);
			var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
			process.init(app);
			process.run(false, [path], 1);
		} catch (e) {}
	};

	USL.editByScratchpad = function(script) {
		var win = Scratchpad.ScratchpadManager.openScratchpad({
			filename: script.path,
			text: USL.loadText(script.file),
			saved: true,
		});

		var onload = (event) => {
			win.removeEventListener('load', onload, false);
			['sp-cmd-newWindow', 'sp-cmd-openFile', 'sp-cmd-clearRecentFiles', 'sp-cmd-run', 'sp-cmd-inspect', 'sp-cmd-display', 'sp-cmd-reloadAndRun'].forEach(id => {
				var elem = win.document.getElementById(id);
				if (!elem) return;
				elem.setAttribute('disabled', 'true');
			});
		};
		win.addEventListener('load', onload, false);
	};

	USL.iconClick = function(event) {
		if (!event || !event.button) {
			USL.disabled = !USL.disabled;
			USL.pref.setValue('disabled', USL.disabled);
		} else if (event.button == 1) {
			USL.rebuild();
		}
	};

	USL.retryInject = function(safeWin) {
		function func(event) {
			safeWin.removeEventListener("readystatechange", func, true);
			if (event.target.URL === "about:blank") return;
			USL.injectScripts(event.target.defaultView, true);
		}
		safeWin.addEventListener("readystatechange", func, true);
	};

	USL.injectScripts = function(safeWindow, rsflag) {
		var aDocument = safeWindow.document;
		var locationHref = safeWindow.location.href;

		// document-start でフレームを開いた際にちょっとおかしいので…
		if (!rsflag && locationHref == "" /* && safeWindow.frameElement*/ )
			return USL.retryInject(safeWindow);
		// target="_blank" で about:blank 狀態で開かれるので…
		if (!rsflag && locationHref == 'about:blank')
			return USL.retryInject(safeWindow);

		if (USL.GLOBAL_EXCLUDES_REGEXP.test(locationHref)) return;

		if (!USL.CACHE_SCRIPT)
			USL.reloadScripts();

		var documentEnds = [];
		var windowLoads = [];

		USL.readScripts.filter(function(script, index) {
			//if (!/^(?:https?|data|file|chrome):/.test(locationHref)) return;
			if (!script.isURLMatching(locationHref)) return false;
			if ("noframes" in script &&
				safeWindow.frameElement &&
				!(safeWindow.frameElement instanceof HTMLFrameElement))
				return false;

			safeWindow.USL_match.push(script);
			if (script.disabled) return false;

			if (script.run_at === "document-start") {
				"delay" in script ? safeWindow.setTimeout(run, script.delay, script) : run(script)
			} else if (script.run_at === "window-load") {
				windowLoads.push(script);
			} else {
				documentEnds.push(script);
			}
		});
		/* 畫像を開いた際に実行されないので適當に実行する */
		if (aDocument instanceof ImageDocument) {
			safeWindow.setTimeout(function() {
				documentEnds.forEach(function(s)
					"delay" in s ?
					safeWindow.setTimeout(run, s.delay, s) :
					run(s));
			}, 10);
			safeWindow.setTimeout(function() {
				windowLoads.forEach(function(s)
					"delay" in s ?
					safeWindow.setTimeout(run, s.delay, s) :
					run(s));
			}, 300);
		} else {
			if (documentEnds.length) {
				safeWindow.addEventListener("DOMContentLoaded", function(event) {
					event.currentTarget.removeEventListener(event.type, arguments.callee, false);
					documentEnds.forEach(function(s)
						"delay" in s ?
						safeWindow.setTimeout(run, s.delay, s) : run(s));
				}, false);
			}
			if (windowLoads.length) {
				safeWindow.addEventListener("load", function(event) {
					event.currentTarget.removeEventListener(event.type, arguments.callee, false);
					windowLoads.forEach(function(s)
						"delay" in s ?
						safeWindow.setTimeout(run, s.delay, s) : run(s));
				}, false);
			}
		}

		function run(script) {
			if (safeWindow.USL_run.indexOf(script) >= 0) {
				USL.debug('DABUTTAYO!!!!! ' + script.name + locationHref);
				return false;
			}
			if ("bookmarklet" in script.metadata) {
				let func = new Function(script.code);
				safeWindow.location.href = "javascript:" + encodeURIComponent(func.toSource()) + "();";
				safeWindow.USL_run.push(script);
				return;
			}

			let sandbox = new Cu.Sandbox(safeWindow, {
				sandboxPrototype: safeWindow,
				'wantXrays': !script.grantNone
			});
			let unsafeWindowGetter = new sandbox.Function('return window.wrappedJSObject || window;');
			Object.defineProperty(sandbox, 'unsafeWindow', {
				get: unsafeWindowGetter
			});

			if (!script.grantNone) {
				let GM_API = new USL.API(script, sandbox, safeWindow, aDocument);
				for (let n in GM_API)
					sandbox[n] = GM_API[n];
			}

			sandbox.XPathResult = Ci.nsIDOMXPathResult;
			// sandbox.unsafeWindow = safeWindow.wrappedJSObject;
			sandbox.document = safeWindow.document;
			sandbox.console = safeWindow.console;
			sandbox.window = safeWindow;

			// sandbox.__proto__ = safeWindow;
			USL.evalInSandbox(script, sandbox);
			safeWindow.USL_run.push(script);
		}
	};

	USL.evalInSandbox = function(aScript, aSandbox) {
		try {
			var lineFinder = new Error();
			Cu.evalInSandbox('(function() {' + aScript.requireSrc + '\r\n' + aScript.code + '\r\n})();', aSandbox, "1.8");
		} catch (e) {
			let line = e.lineNumber - lineFinder.lineNumber - aScript.requireSrc.split("\n").length;
			USL.error(aScript.name + ' / line:' + line + "\n" + e);
		}
	};

	USL.log = console.log.bind(console);

	USL.debug = function() {
		if (!USL.DEBUG) return;
		var arr = ['[USL DEBUG]'].concat(Array.from(arguments));
		console.log.apply(console, arr);
	};

	USL.error = console.error.bind(console);

	USL.loadText = function(aFile) {
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
	};

	USL.loadBinary = function(aFile) {
		var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		istream.init(aFile, -1, -1, false);
		var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
		bstream.setInputStream(istream);
		let bytes = bstream.readBytes(bstream.available());
		bstream.close();
		return bytes;
	};

	USL.saveText = function(aFile, data) {
		var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
		suConverter.charset = "UTF-8";
		data = suConverter.ConvertFromUnicode(data);
		return USL.saveFile(aFile, data);
	};

	USL.saveFile = function(aFile, data) {
		var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
		foStream.init(aFile, 0x02 | 0x08 | 0x20, 0664, 0);
		foStream.write(data, data.length);
		foStream.close();
		return data;
	};

	USL.loadSetting = function() {
		try {
			var aFile = USL.SCRIPTS_FOLDER.clone();
			aFile.appendRelativePath("Local");
			aFile.appendRelativePath("UserScriptLoader.json");
			var data = USL.loadText(aFile);
			data = JSON.parse(data);
			USL.database.info = data.info;
			USL.database.pref = data.pref;
			//USL.database.resource = data.resource;
			USL.debug('loaded UserScriptLoader.json');
		} catch (e) {
			USL.debug('can not load UserScriptLoader.json');
		}
	};

	USL.saveSetting = function() {
		//let disabledScripts = [x.leafName for each(x in USL.readScripts) if (x.disabled)];
		let disabledScripts = [];
		for each(x in USL.readScripts) if (x.disabled) disabledScripts.push(x.leafName);
		USL.pref.setValue('script.disabled', disabledScripts.join('|'));
		USL.pref.setValue('disabled', USL.disabled);
		USL.pref.setValue('HIDE_EXCLUDE', USL.HIDE_EXCLUDE);
		USL.pref.setValue('ALLOW_NOTIFY', USL.ALLOW_NOTIFY);
		USL.pref.setValue('AUTO_RELOAD_PAGE', USL.AUTO_RELOAD_PAGE);
		USL.pref.setValue('CACHE_SCRIPT', USL.CACHE_SCRIPT);
		USL.pref.setValue('MY_EDITOR', USL.MY_EDITOR);
		USL.pref.setValue('DEBUG', USL.DEBUG);

		var aFile = USL.SCRIPTS_FOLDER.clone();
		aFile.appendRelativePath("Local");
		aFile.appendRelativePath("UserScriptLoader.json");
		USL.saveText(aFile, JSON.stringify(USL.database));
	};

	USL.getContents = function(aURL, aCallback, isTmpFile) {
		try {
			urlSecurityCheck(aURL, gBrowser.contentPrincipal, Ci.nsIScriptSecurityManager.DISALLOW_INHERIT_PRINCIPAL);
		} catch (ex) {
			return;
		}
		var uri = Services.io.newURI(aURL, null, null);
		if (uri.scheme != 'http' && uri.scheme != 'https')
			return USL.error('getContents is "http" or "https" only');


		// 如果地址經過了2次轉義，下面的 aFile 就會不存在？
		aURL = decodeURIComponent(aURL);
		let aFile = isTmpFile ? USL.TEMP_FOLDER : USL.REQUIRES_FOLDER;
		aFile = aFile.clone();
		aFile.QueryInterface(Ci.nsILocalFile);
		aFile.appendRelativePath(encodeURIComponent(aURL));

		var wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
		wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
		if (aCallback) {
			wbp.progressListener = {
				onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
					if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
						let channel = aRequest.QueryInterface(Ci.nsIHttpChannel);
						if (aFile.exists()) {
							let bytes = USL.loadBinary(aFile);
							aCallback(bytes, channel.contentType, aFile);
						} else {
							console.error('下載文件不存在', aFile.path)
						}
						return;
					}
				},
				onLocationChange: function(aProgress, aRequest, aURI) {},
				onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {},
				onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {},
				onSecurityChange: function(aWebProgress, aRequest, aState) {},
				onLinkIconAvailable: function(aIconURL) {},
			}
		}
		wbp.persistFlags = Ci.nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE;
		wbp.persistFlags |= Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
		wbp.saveURI(uri, null, null, null, null, null, aFile, null);
		USL.debug("getContents: " + aURL);
	};

	USL.getLocalFileContents = function(aURL, callback) {
		var channel = Services.io.newChannel(aURL, null, null);
		if (channel.URI.scheme != 'file')
			return USL.error('getLocalFileContents is "file" only');

		var input = channel.open();
		var binaryStream = Cc['@mozilla.org/binaryinputstream;1'].createInstance(Ci.nsIBinaryInputStream);
		binaryStream.setInputStream(input);
		var bytes = binaryStream.readBytes(input.available());
		binaryStream.close();
		input.close();
		callback(bytes, channel.contentType);
	};

	USL.wildcardToRegExpStr = function(urlstr) {
		if (urlstr instanceof RegExp) return urlstr.source;
		let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str) {
			return str === "*" ? ".*" : "[^/]*";
		});
		return "^" + reg + "$";
	};

	USL.checkScripts = function() {
		USL.rebuild();

		let ScriptLen = USL.readScripts.length,
			count = 0;
		let handleSucc = function() {
			count += 1;
			// console.log('count ', count)
			if (count >= ScriptLen) {
				USL.rebuild();
				USL.alert('所有腳本檢查完畢，點擊打開目錄', null, null, function() {
					USL.SCRIPTS_FOLDER.reveal();
				});
				// USL.TEMP_FOLDER.remove(true);
			}
		};

		USL.readScripts.forEach(function(script) {
			USL.checkScript(script, handleSucc);
		});
	};

	USL.checkScript = function(script, handleSucc) {
		let checkURL = script.updateURL || script.downloadURL;
		if (!checkURL) {
			console.log(script.name + ' 不存在更新或下載地址');
			handleSucc();
			return;
		}

		// 其它一些網站可能沒有 .meta.js
		if (checkURL.match(/\/\/(?:userscripts|greasyfork)\.org/)) {
			checkURL = checkURL.replace(/\.user\.js$/, '.meta.js');
		}

		USL.getContents(checkURL, function(bytes, contentType, aFile) {
			let newVersion = Utils.r1(/\/\/\s*?@version\s*([^\r\n]+)/i, bytes);
			if (!newVersion) {
				console.error(script.name + ' 腳本更新沒找到 @version', bytes);
				handleSucc();
			} else if (Services.vc.compare(script.version, newVersion) >= 0) {
				console.log(script.name + ' 腳本無需更新');
				handleSucc();
			} else {
				let downURL = Utils.r1(/\/\/\s*?@downloadURL\s*([^\r\n]+)/i, bytes) || script.downloadURL;

				let name = /\/\/\s*@name\s+(.*)/i.exec(bytes);
				//let filename = (name && name[1] ? name[1] : downURL.split("/").pop()).replace(/\.user\.js$|$/i, ".user.js").replace(/\s/g, '_').toLowerCase();
				let filename = script.name.replace(/\.user\.js$|$/i, ".user.js").replace(/\s/g, '_').toLowerCase();
				let folder = (script.installTime != script.lastModifiedTime) ?
					USL.NEW_VERSION_FOLDER :
					USL.SCRIPTS_FOLDER;
				let scriptFile = folder.clone();
				scriptFile.append(filename);

				var callback = function() {
					USL.database.info[filename] = {
						installURL: downURL,
						installTime: script.installTime
					};

					handleSucc();

				};
				if (filename && downURL == checkURL) {
					aFile.renameTo(folder, filename);
					callback();
				} else {
					USL.downloader(downURL, scriptFile.path, filename, callback);
				}
			}
		}, true);
	};

	USL.downloader = function(url, path, filename, callback) {
		Task.spawn(function*() {
			yield Downloads.fetch(url, path);
			console.log(filename + "已下載!", path);
			callback();
		}).then(null, Cu.reportError);
	};

	USL.alert = function(aMsg, aTitle, aIconURL, aCallback) {
		if (aCallback) {
			var callback = {
				observe: function(subject, topic, data) {
					if ("alertclickcallback" != topic)
						return;
					aCallback.call(null);
				}
			};
		} else
			callback = null;
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification(
			aIconURL || "chrome://global/skin/icons/information-32.png", aTitle || "UserScriptLoader-notification", aMsg + "", !!callback, "", callback);
	};

	USL.findscripts = function(type) {
		var stringa;
		if (type === 'search') {
			stringa = prompt('請輸入要搜索的關鍵詞：');
			if (!stringa) return;
		} else {
			var wins = USL.getFocusedWindow();
			var href = wins.location.href;
			if (!href) return;

			var p = 0; //for number of "."
			var f = new Array();
			var q = 2;
			var t = 1;
			var a = 0;
			var y;
			var o;
			var m = 4;
			var re = /(?:[a-z0-9-]+\.)+[a-z]{2,4}/;
			href = href.match(re); //extract the url part
			href = href.toString();
			//get the places and nunbers of the "."
			for (var i = 0; i < href.length; i++) {
				if (href[i] == ".") {
					f[p] = i;
					p++;
				}
			}
			if (p == t) {
				stringa = href.substring(a, f[0]);
			} else if (p == q) {
				stringa = href.substring(++f[0], f[1]);
			} else {
				stringa = href.substring(++f[0], f[2]);
			}
		}

		openLinkIn("http://www.google.com/search?btnG=Google+Search&q=site:userscripts.org+inurl:scripts+inurl:show+" + stringa, "tab", {});
		// openLinkIn("http://userscripts.org:8080/scripts/search?q=" + stringa + "&submit=Search", "tab", {});
		openLinkIn("https://greasyfork.org/scripts/search?q=" + stringa, "tab", {});
	};

	var ApplyPatchForScript = (function() {
		const USO_URL_RE = /(^https?:\/\/userscripts.org.*\/scripts\/source\/\d+)\.\w+\.js$/i;

		const GFO_URL_RE_1 = /(^https?:\/\/greasyfork.org\/scripts\/code\/\w+)\.\w+\.js$/i;
		const GFO_URL_RE_2 = /(^https?:\/\/greasyfork.org\/scripts\/[^\/]+\/)code[\.\/].*\w+\.js$/i;

		// (http://binux.github.io/ThunderLixianExporter/)master/ThunderLixianExporter.user.js
		const GITHUB_URL_RE_1 = /(^https?:\/\/\w+.github.io\/\w+\/)master\/.*.*\w+\.js$/i;
		// 從   https://raw.githubusercontent.com/ywzhaiqi/userscript/master/noNoticetitleflashOnBBS.user.js
		// 轉為 https://github.com/ywzhaiqi/userscript/blob/master/noNoticetitleflashOnBBS.user.js
		const GITHUB_URL_RE_2 = /(^https?:\/\/raw.githubusercontent.com\/.*?\/master\/.*\.user\.js$)/i;

		function getScriptHomeURL(downURL) {
			var url;
			if (downURL && downURL.startsWith('http')) {
				if (USO_URL_RE.test(downURL)) {
					url = RegExp.$1.replace(/source/, "show");
				} else if (GFO_URL_RE_1.test(downURL)) {
					url = RegExp.$1;
				} else if (GFO_URL_RE_2.test(downURL)) {
					url = RegExp.$1;
				} else if (GITHUB_URL_RE_1.test(downURL)) {
					url = RegExp.$1;
				} else if (GITHUB_URL_RE_2.test(downURL)) {
					url = RegExp.$1.replace('raw.githubusercontent.com', 'github.com')
						.replace('/master/', '/blob/master/');
				}
			}
			return url ? decodeURIComponent(url) : null;
		}

		function addHomePage(scripts) {
			scripts.forEach(function(script) {
				if (!script.homepageURL) {
					var url = script.downloadURL || script.updateURL;
					script.homepageURL = getScriptHomeURL(url);
				}
			});
		}

		return {
			addHomePage: addHomePage,
			getHomePageURL: getScriptHomeURL
		}
	})();

	var Utils = {
		r1: function(reg, str) {
			var m = str.match(reg);
			return m ? m[1] : null;
		},
	};

	USL.init();
	window.USL = USL;


	function log(str) {
		Application.console.log(Array.slice(arguments));
	}

	function debug() {
		if (USL.DEBUG) Application.console.log('[USL DEBUG] ' + Array.slice(arguments));
	}

	function $(id) document.getElementById(id);

	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}

	function addStyle(css) {
		var pi = document.createProcessingInstruction(
			'xml-stylesheet',
			'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
		);
		return document.insertBefore(pi, document.documentElement);
	}


})('\
/* */\
#UserScriptLoader-icon {\
  list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NDcgLTA1MDDUnvhKAAAAB3RJTUUH2AQGETEsCzNv6AAAAk9JREFUOE9lU09Ik3EYfo91mtFhY2NtKxexQGOMMJU5sojoYGU3g1UyNUQ0Kvpjukozgmqm1iyyr4zMpBweyvCybh7NOgjq+mYUdeu449P7vl+bW/7g4ff+eZ6Hl9/7feT3+8nn85HH4yG3201Op5PsdnsB8QhVMjpPVlDqwHYyi3t6igt5sMDDSDDM9r2EQ+WEiFcRL+bpcTgcJfgnhKCpoiBEwy7ChWpKHy4nk3ObcDcYsGhBhInGLWgNEaJ7CM1BwvlqC40BNavL8/X0hKmhp45SvYzXXbuR+9wHLN/HwosmnUJuyaUufeEJX3Rq0F2/+c9YR1DJKl4ZBDKPgG9PYM5e1BuZJNeHuN+vPOGLTg2G24KYGTgCo2UHkxJKNiZPwxiPAWuvYLxp4fgMGz3m/gPlCV90lkFHDSYu1WC2LwysjgDmU0Q6IyirLQN+TK/HpqGTCe9tvB6iU4NYeKspBvPJo9bo2eegnQRyE/Dr43q8Nq5TzCePqYHo1IDXEr26fxNyi7cKBsbDs4wu4PccjOQ5GCPtbPBSDXKLAxC+6NSAH8Uma8PyPQx2H8eX9zeA7xM8/jvg5wxjmvNJfP1wE0PXTuhG5CHliy0Y5DeQTfei+WAlooFt6K8KYHRfAHf4jgU8aOV69tN15ZUYSMCFdOpKiN3v6rqQGdXHhPmMMWZtQB6YpxSe8P83kB/GlBUtTZ2y1rk6bInk5m9jaYpXy33hCb9g4HK5FFy0tYXo9uVaWuFYxyyG1KXPsS2vKTEoKnoZVYxIEST3buQS/QUCx7vn2Dh8TQAAAABJRU5ErkJggg==");\
  -moz-appearance: none !important;\
  border-style: none !important;\
  border-radius: 0 !important;\
  padding: 0 3px !important;\
  margin: 0 !important;\
  box-shadow: none !important;\
  -moz-box-align: center !important;\
  -moz-box-pack: center !important;\
  min-width: 16px !important;\
  min-height: 16px !important;\
}\
#UserScriptLoader-icon > .toolbarbutton-icon {\
    min-width: 16px !important;\
    min-height: 16px !important;\
    padding: 0 !important;\
    border-style: none !important;\
    border-radius: 0 !important;\
}\
#UserScriptLoader-icon:not([disabled="true"]):hover,\
#UserScriptLoader-icon:not([disabled="true"])[type="menu-button"]:hover,\
#UserScriptLoader-icon:not([disabled="true"])[open="true"],\
#UserScriptLoader-icon:not([disabled="true"])[type="menu-button"][open="true"] {\
    \
}\
#UserScriptLoader-icon dropmarker{display: none !important;}\
#UserScriptLoader-icon[state="disable"] {\
    list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEgAACxIB0t1+/AAAACx0RVh0Q3JlYXRpb24gVGltZQBTdW4gMzAgTWFyIDIwMDggMTc6MjI6NTAgLTA1MDDdk8ZaAAAAB3RJTUUH2AQWER4YaIL0rwAAAldJREFUOE+FU99Lk2EY3d0uBItuMowUWWyYSx3D0EzNgUqjLS0a1MViFyXZtqDCIY2zGAoic2ZGUUpB1MUIjaLUNC1XGWyz0v1quiSo/6PnefxmM/rxwOF93+c757wP7+FT/a+sTVU7CQdq95fZyst2uZX2v4sE2witBHdzjQ4VmmLoSosYjQrl76UIwaBbc0JU6/agra7CrtcUu+msVuhbi0TnWGhvb0KTUYuDVRocMuxFa90+gbG8hM1KFPpGHW2o1FoaK20MT9cpRBbGEY9O4cHtPpmC1wSduc/fc1zWiUGHydDtc1qFzKREbBqpj6/w5fM8JsfHaH2N9Kc5JGMvEV2YEB7zWScGPZ1mjPadwUVHO900LeThm35cv+FHNvkeI7d6MTR8DWkyZBPmMZ91YgCnBQPdJ9Hv7UJqaRaZ5TdweVzQGrT4lolu7ldXFmSyfu8FjOA0WCcG5ga9mw3uDF4Vwmo8jMKiQhTsKMD39eXN/VriHU03j7tBrxiwTgwolsr25mpEwxNIKwaDAz4EA378WF/BULAXATrnDGLhJ2A+68SAHkXNscUjk5h9/hDH2kxoqa2Bw2qGy3YcZzssMNfX4oS5BXMvHklC/JAi5mKDXAKeS514GhqVKbLJRXxNfUA2tYi1+Fs8ezyGnivnhbfFgIsadt9lh0yRjM1IEvyYGXo4XjnSJD1wPDIF5jFfkW4UNfiHcXNEoXsBiTO5NCOp8Jqg+EL3AxIh85ivSH8VNdWHjVrTkXq9k/YyZj64z99p/+f/IK+2E3YTSvPAZ+7/VirVTyD9VsdYQ1AqAAAAAElFTkSuQmCC");\
}\
'.replace(/[\r\n\t]/g, ''));