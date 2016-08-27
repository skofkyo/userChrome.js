// ==UserScript==
// @name            youkuantiads.uc.js
// @namespace       YoukuAntiADs@harv.c
// @description     視頻網站去黑屏
// @include         chrome://browser/content/browser.xul
// @author          harv.c
// @homepage        http://haoutil.tk
// @version         1.6.2.27
// @homepageURL     https://j.mozest.com/zh-CN/ucscript/script/92/
// @downloadUrl     https://j.mozest.com/zh-CN/ucscript/script/92.uc.js
// ==/UserScript==
(function() {
	// YoukuAntiADs, request observer
	function YoukuAntiADs() {};
	YoukuAntiADs.prototype = {
		SITES: {
			'youku_loader': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/loader.swf',
				're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/loaders?\.swf/i
			},
			'youku_player': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/player.swf',
				're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/q?player[^\.]*\.swf/i
			},
			'ku6': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/ku6.swf',
				're': /http:\/\/player\.ku6cdn\.com\/default\/common\/player\/\d{12}\/player\.swf/i
			},
			'ku6_out': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/ku6_out.swf',
				're': /http:\/\/player\.ku6cdn\.com\/default\/out\/\d{12}\/player\.swf/i
			},
			'iqiyi': {
				'player0': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi_out.swf',
				'player1': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi5.swf',
				'player2': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi.swf',
				're': /https?:\/\/www\.iqiyi\.com\/(player\/\d+\/player|common\/flashplayer\/\d+\/(main)?player.*)\.swf/i
			},
			'iqiyip2p': {
				'player': 'http://www.iqiyi.com/player/20140709110406/20088.swf',
				're': /https?:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/\d[a-z0-9]*.swf/i
			},
			'tudou': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/tudou.swf',
				're': /http:\/\/js\.tudouui\.com\/.*portalplayer[^\.]*\.swf/i
			},
			'tudou_olc': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/olc_8.swf',
				're': /http:\/\/js\.tudouui\.com\/.*olc[^\.]*\.swf/i
			},
			'tudou_sp': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/sp.swf',
				're': /http:\/\/js\.tudouui\.com\/.*\/socialplayer[^\.]*\.swf/i
			},
			'letv': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/letv.swf',
				're': /http:\/\/.*letv[\w]*\.com\/(hz|.*\/(?!(Live|seed))(S[\w]{2,3})?(?!Live)[\w]{4})Player[^\.]*\.swf/i
			},
			'letvskin': {
				'player': 'http://player.letvcdn.com/p/201403/05/1456/newplayer/1/SLetvPlayer.swf',
				're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/(?!1456)\d*\/newplayer\/\d+\/SLetvPlayer\.swf/i
			},
			'pplive': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/pplive.swf',
				're': /http:\/\/player\.pplive\.cn\/ikan\/.*\/player4player2\.swf/i
			},
			'pplive_live': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/pplive_live.swf',
				're': /http:\/\/player\.pplive\.cn\/live\/.*\/player4live2\.swf/i
			},
			'sohu': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/sohu.swf',
				're': /http:\/\/tv\.sohu\.com\/upload\/swf(\/p2p(\/yc)?)?\/\d+\/(main|playershell)\.swf/i
			},
			'pps': {
				'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/pps.swf',
				're': /http:\/\/www\.iqiyi\.com\/player\/cupid\/.*\/pps[\w]+.swf/i
			}
		},
		os: Cc['@mozilla.org/observer-service;1']
				.getService(Ci.nsIObserverService),
		init: function() {
			var site = this.SITES['iqiyi'];
			site['preHandle'] = function(aSubject) {
				var wnd = this.getWindowForRequest(aSubject);
				if(wnd) {
					site['cond'] = [
						!/(^((?!baidu|61|178).)*\.iqiyi\.com|pps\.tv)/i.test(wnd.self.location.host),
						wnd.self.document.querySelector('span[data-flashplayerparam-flashurl]'),
						true
					];
					if(!site['cond']) return;
					
					for(var i = 0; i < site['cond'].length; i++) {
						if(site['cond'][i]) {
							if(site['player'] != site['player' + i]) {
								site['player'] = site['player' + i];
								site['storageStream'] = site['storageStream' + i] ? site['storageStream' + i] : null;
								site['count'] = site['count' + i] ? site['count' + i] : null;
							}
							break;
						}
					}
				}
			};
			site['callback'] = function() {
				if(!site['cond']) return;

				for(var i = 0; i < site['cond'].length; i++) {
					if(site['player' + i] == site['player']) {
						site['storageStream' + i] = site['storageStream'];
						site['count' + i] = site['count'];
						break;
					}
				}
			};
		},
		// getPlayer, get modified player
		getPlayer: function(site, callback) {
			NetUtil.asyncFetch(site['player'], function(inputStream, status) {
				var binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1']
											.createInstance(Ci['nsIBinaryOutputStream']);
				var storageStream = Cc['@mozilla.org/storagestream;1']
										.createInstance(Ci['nsIStorageStream']);
				var count = inputStream.available();
				var data = NetUtil.readInputStreamToString(inputStream, count);

				storageStream.init(512, count, null);
				binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
				binaryOutputStream.writeBytes(data, count);

				site['storageStream'] = storageStream;
				site['count'] = count;

				if(typeof callback === 'function') {
					callback();
				}
			});
		},
		getWindowForRequest: function(request){
			if(request instanceof Ci.nsIRequest){
				try{
					if(request.notificationCallbacks){
						return request.notificationCallbacks
									.getInterface(Ci.nsILoadContext)
									.associatedWindow;
					}
				} catch(e) {}
				try{
					if(request.loadGroup && request.loadGroup.notificationCallbacks){
						return request.loadGroup.notificationCallbacks
									.getInterface(Ci.nsILoadContext)
									.associatedWindow;
					}
				} catch(e) {}
			}
			return null;
		},
		observe: function(aSubject, aTopic, aData) {
			if(aTopic != 'http-on-examine-response') return;

			var http = aSubject.QueryInterface(Ci.nsIHttpChannel);

			var aVisitor = new HttpHeaderVisitor();
			http.visitResponseHeaders(aVisitor);
			if (!aVisitor.isFlash()) return;

			for(var i in this.SITES) {
				var site = this.SITES[i];
				if(site['re'].test(http.URI.spec)) {
					var fn = this, args = Array.prototype.slice.call(arguments);

					if(typeof site['preHandle'] === 'function')
						site['preHandle'].apply(fn, args);

					if(!site['storageStream'] || !site['count']) {
						http.suspend();
						this.getPlayer(site, function() {
							http.resume();
							if(typeof site['callback'] === 'function')
								site['callback'].apply(fn, args);
						});
					}

					var newListener = new TrackingListener();
					aSubject.QueryInterface(Ci.nsITraceableChannel);
					newListener.originalListener = aSubject.setNewListener(newListener);
					newListener.site = site;

					break;
				}
			}
		},
		QueryInterface: function(aIID) {
			if(aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIObserver))
				return this;

			return Cr.NS_ERROR_NO_INTERFACE;
		},
		register: function() {
			this.init();
			this.os.addObserver(this, 'http-on-examine-response', false);
		},
		unregister: function() {
			this.os.removeObserver(this, 'http-on-examine-response', false);
		}
	};

	// TrackingListener, redirect youku player to modified player
	function TrackingListener() {
		this.originalListener = null;
		this.site = null;
	}
	TrackingListener.prototype = {
		onStartRequest: function(request, context) {
			this.originalListener.onStartRequest(request, context);
		},
		onStopRequest: function(request, context) {
			this.originalListener.onStopRequest(request, context, Cr.NS_OK);
		},
		onDataAvailable: function(request, context) {
			this.originalListener.onDataAvailable(request, context, this.site['storageStream'].newInputStream(0), 0, this.site['count']);
		}
	};

	function HttpHeaderVisitor() {
		this._isFlash = false;
	}
	HttpHeaderVisitor.prototype = {
		visitHeader: function(aHeader, aValue) {
			if (aHeader.indexOf("Content-Type") !== -1) {
				if (aValue.indexOf("application/x-shockwave-flash") !== -1) {
					this._isFlash = true;
				}
			}
		},
		isFlash: function() {
			return this._isFlash;
		}
	};

	// register observer
	var y = new YoukuAntiADs();
	if(location == 'chrome://browser/content/browser.xul') {
		y.register();
	}

	// unregister observer
	window.addEventListener('unload', function() {
		if(location == 'chrome://browser/content/browser.xul') {
			y.unregister();
		}
	});
})();
