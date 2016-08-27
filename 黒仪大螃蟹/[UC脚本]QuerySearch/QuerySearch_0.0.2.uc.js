// ==UserScript==
// @name			querySearch
// @version			0.0.2
// @description		右键添加快捷搜索菜单
// @include			main
// @note			[20141005]修复FF启动期间nsIBrowserSearchService初始化的问题。
// ==/UserScript==

location == 'chrome://browser/content/browser.xul' && (function () {
	var querySearch = {
		description: [
			'shift	+ 鼠标左键：使用“关键词 size:当前域名”搜索',
			'鼠标中键：弹出框搜索。',
			'shift + 鼠标中键：弹出框使用“关键词 size:当前域名”搜索',
			'鼠标右键： 搜索粘贴板',
			'ctrl + 鼠标点击：后台新标签打开搜索结果页',
			'alt + 鼠标点击：新窗口打开搜索结果页',
			'ctrl + alt + 鼠标点击：隐私窗口打开搜索结果页'
		].join('\n').replace(/：/g, '：\n\t'),

		_browserSearchService: null,

		get browserSearchService() {
			return this._browserSearchService || 
				(this._browserSearchService = Cc['@mozilla.org/browser/search-service;1']
						.getService(Ci.nsIBrowserSearchService));
		},

		get contextMenu() document.getElementById('contentAreaContextMenu'),

		zh: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).getCharPref('general.useragent.locale').indexOf('zh') != -1,

		engineWeakMap:null,

		init: function(){
			if(document.getElementById('querySearch')) return;
			this.browserSearchService.init(aStatus => {
				if (Components.isSuccessCode(aStatus)) {
					this.updateMenu();
					var cM = this.contextMenu;
					cM.addEventListener('click', this, false);
					cM.addEventListener('popupshowing', this, false);
					Cc['@mozilla.org/observer-service;1']
						.getService(Ci.nsIObserverService)
						.addObserver(this.updateMenu.bind(this), 'browser-search-engine-modified', false);
				} else {
					console.error(aStatus);
				}
			});
		},

		updateMenu: function(){
			this.engineWeakMap && this.engineWeakMap.clear();
			if(arguments.length == 3) {
				document.getElementById('querySearchHbox').remove();
				this._browserSearchService = null;
			}
			this.menu = null;
			var wm = new WeakMap(),
				cE = this.createElement,
				hbox = cE('hbox', {id: 'querySearchHbox', class: 'hboxSplitMenu', hidden: true}, 
									[this.contextMenu, document.getElementById('context-searchselect')]);
			this.menu = cE('menuitem', {id: 'querySearch', flex: 1}, hbox);
			this.engineWeakMap = wm;
			var popup = cE('menupopup', null, cE('menu', {class: 'menu-iconic'}, cE('spacer', null,  hbox).parentNode));
			this.browserSearchService.getVisibleEngines({}).forEach(engine => {
				wm.set(cE('menuitem', {
					class: 'menuitem-iconic',
					label: engine.name,
					tooltiptext: engine.description +'\n\n'+ this.description,
					src: engine.iconURI ? engine.iconURI.asciiSpec : ''
				}, popup), engine);
			});
		},

		createElement: function(name, attr, parent){
			var e = document.createElementNS(
					'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', name);
			if(attr) for (var i in attr) e.setAttribute(i, attr[i]);
			if(parent){
				if(parent instanceof Array){
					parent[0].insertBefore(e, parent[1]);
				}else{
					parent.appendChild(e);
				}
			}
			return e;
		},

		handleEvent: function(event){
			switch (event.type){
				case 'click':
					this.onClick(event);
					break;
				case 'popupshowing':
					this.onPopupShowing(event);
					break;
			}
		},

		onClick: function(event){
			var target = event.target,
				engine = this.engineWeakMap.get(target),
				rClick = event.button == 2,
				link = (gContextMenu && gContextMenu.onLink) && gContextMenu.target,
				searchText  = (!rClick && link)
							? (link.textContent.trim() || link.href)
							: this.getSearchText(rClick);
			if(engine && searchText){
				let inBackground = false,
					useNewWin =	false,
					text = null;

				if(event.shiftKey)
					searchText += ' site:' + BrowserUtils.getFocusSync(document)[1].document.domain;
				inBackground = event.ctrlKey;
				useNewWin = event.altKey;
				if(event.button == 1){
					text = prompt((this.zh ? '使用 ':'Search ')+ engine.name + (this.zh?' 搜索：':' for'), searchText);
					if(!text) return;
					searchText = text;
				}
				if(engine.name == '迅雷离线' && link){
					searchText = link.href;
				}
				this.loadSearch(engine, searchText, inBackground, useNewWin);
			}
		},

		onPopupShowing: function(event){
			var target = event.target;
			if(target.id == 'contentAreaContextMenu'){
				let seaechText = this.getSearchText(),
					onLink = gContextMenu.onLink;

				if(seaechText || onLink){
					this.menu.parentNode.removeAttribute('hidden');
					let link = onLink && gContextMenu.target,
						ss = this.browserSearchService;
						engine = ss.currentEngine,
						text = link && (link.textContent.trim() || link.href);

					((str) => {
						if(/(^magnet:\?xt=urn:btih:[a-z0-9]{40})|(\.torrent)/i.test(str)){
							let xl = ss.getEngineByName('迅雷离线');
							if(xl){
								engine = xl;
								text = str;
							}
						}
					})((link && link.href || seaechText).trim());
					if(this.engineWeakMap.get(this.menu) !== engine){
						this.engineWeakMap.set(this.menu, engine);
						// this.menu.setAttribute('label', (this.zh ? '使用 ':'Search ') 
						// 			+ engine.name + (this.zh?' 搜索:':' for') + (()=>{
						// 	let s = (text && !seaechText ? text : seaechText).replace(/\n/g,'') ;
						// 	return s?' “'+(s.length>15?s.substr(0,15)+'…':s)+'”':''
						// })());
						this.menu.setAttribute('label', (this.zh ? '使用 ':'Search In ') 
									+ engine.name + (this.zh?' 搜索':''));
					}
					this.menu.setAttribute('tooltiptext', (s => s ?' “'+(s.length>30?s.substr(0,30)+'…':s)+'”':'')((text && !seaechText ? text : seaechText).replace(/\n/g,'')));
				}else{
					!this.menu.parentNode.hasAttribute('hidden') &&
						this.menu.parentNode.setAttribute('hidden', true);
				}
			}
		},

		getSearchText: function(isClipboard) {
			var charLen = 150,
				selection;
			if(isClipboard) {
				selection = readFromClipboard();
			}else{
				let [element, focusedWindow] = BrowserUtils.getFocusSync(document);
				selection = focusedWindow.getSelection().toString();
				if (!selection) {
					let isOnTextInput = function isOnTextInput(elem) {
						return elem instanceof HTMLTextAreaElement || 
								(elem instanceof HTMLInputElement && elem.mozIsTextField(true));
					};
					if (isOnTextInput(element)) {
						selection = element.QueryInterface(Ci.nsIDOMNSEditableElement)
							.editor.selection.toString();
					}
				}
			}
			if (selection) {
				if (selection.length > charLen) {
					var pattern = new RegExp('^(?:\\s*.){0,' + charLen + '}');
					pattern.test(selection);
					selection = RegExp.lastMatch;
				}
				selection = selection.trim().replace(/\s+/g, ' ');
				if (selection.length > charLen) selection = selection.substr(0, charLen);
			}
			return selection;
		},

		loadSearch: function(aEngine, searchText, inBackground, useNewWin) {
			if (!aEngine) aEngine = this.browserSearchService.getDefaultEngine();
			var submission = aEngine.getSubmission(searchText, null);
			if (!submission) return;
			if (useNewWin) {
				if(inBackground){
					openLinkIn(submission.uri.spec, 'window',{ 
						private: true
					});
				}else{
					openNewWindowWith(submission.uri.spec, null, submission.postData, false);
				}
			}else{
				gBrowser.loadOneTab(submission.uri.spec, null, null, null, inBackground || false, false);
			}
		},
	};

	querySearch.init();
})();