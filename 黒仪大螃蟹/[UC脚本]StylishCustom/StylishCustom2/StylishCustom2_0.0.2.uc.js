// ==UserScript==
// @name         Stylish Custom2
// @description  在Stylish编辑窗口中增加一些小功能
// @namespace    stylishCustom2@uc.js
// @author       Crab
// @include      about:stylish-edit*
// @version      0.0.2.20150205
// ==/UserScript==
if(location.href.indexOf('about:stylish-edit') == 0) {
/* 
// 1.取消预览:  恢复 预览 至未保存时的状态(实质上是将保存前的样式再一次"预览")
// 2.键盘输入"!"时自动补全为"!important;"
// 3.注释按钮(ctrl+/)
// 4.插入链接:检测当前打开的窗口和标签列出其地址链接;
//		左键菜单项直接插入对应的链接;
//		中键或右键则插入包含@-moz-document url("")的链接
// 5.插入文本:第一个子菜单为文档规则,其余为一些常用的文本 
// 6.显示行和列，在行文本框内输入正整数回车可跳转之对应行
*/
	var stylishCustom2 = {

		_revertOldFindbar: false, //还原旧查找栏(默认关闭，若开启请将 false , 改为 true);

		insertRules: {
			//可以在text中按格式加入一些常用的属性或文本
			text: [
				'/* AGENT_SHEET */',
				'-moz-box-ordinal-group:',
				'-moz-linear-gradient',
				'vertical-align:middle',
				'text-decoration:underline',
				['::before 伪元素', '::before {\n\tcontent: ""\n}', 3], // 插入模板块数组，
				['::after 伪元素', '::after {\n\tcontent: ""\n}', 3],	// 参数 0：菜单名，
																		// 参数 1：插入内容，其中\n代表换行符，\t为制表符（tab）。
																		// 参数 2：插入内容后光标所在对应内容倒数位置，可忽略默认为0，即最末
			],
			domRules: {
				'url("")': '@-moz-document url(""){\n\n}',
				'url-prefix("")': '@-moz-document url-prefix(""){\n\n}',
				'domain("")': '@-moz-document domain(""){\n\n}',
				'regexp("")': '@-moz-document regexp(""){\n\n}'
			}
		},

		locale : ['zh-CN', 'en-US'].indexOf(Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getCharPref('general.useragent.locale')),

		_localeText: {
			unperview: ['取消预览', 'UnPerview'],
			lineNumber: ['行: ', 'Ln: '],
			colNumber: [',列: ', ',Col: '],
			comment: ['注释', 'comment'],
			save: ['保存', 'Save'],
			insertURL:['插入链接', 'Insert URL'],
			insertText:['插入文本', 'Insert Text'],
			documentRules:['文档规则', 'Document Rule'],
			chromeMenu: ['Chrome 路径' , 'Chrome URL'],
		},

		localeText: function(name){
			return this._localeText[name][this.locale == -1 ? 1 : this.locale];
		},

		oldPreview: null,
		init: function () {
			if(document.getElementById('stylishCustomToolbar') || !sourceEditor || sourceEditorType == 'textarea') return;
			eval('save=' + save.toString().replace(/(?=return true;\s+}$)/, 'if(typeof(stylishCustom2)!=\'undefined\'){stylishCustom2.oldPreview = codeElementWrapper.value;document.getElementById(\'unperview\').setAttribute(\'disabled\',true);}\n'));
			eval('preview=' + preview.toString().replace('setTimeout', 'if(typeof(stylishCustom2)!=\'undefined\'){document.getElementById(\'unperview\').setAttribute(\'disabled\',false);}$&'));

			this.setToolButtons();
			this.setShortcuts();
			this.oldPreview = codeElementWrapper.value;
			this.revertOldFindbar();
			sourceEditor.on('cursorActivity', this.setLineAndcolNum.bind(this));
		},

		setToolButtons: function () {
			var _et = document.getElementById('editor-tools'),
				cE = this.createElement,
				editortools = cE('hbox', {id: 'stylishCustomToolbar'}, [_et.parentNode, _et.nextSibling]),
				insertMenupopup =  document.getElementById('insert-data-uri').parentNode;
			//工具栏按钮
			cE('button', {id: 'comment', class: 'devtools-toolbarbutton', label: this.localeText('comment'), onclick: this.setComment}, editortools);
			this.unperview = cE('button', {id: 'unperview', class: 'devtools-toolbarbutton', label: this.localeText('unperview'), onclick: this.unperview.bind(this)}, editortools);
			cE('spacer', {flex: '1'}, editortools);
			cE('label', {style: 'max-height: 20px; margin:7px 0 4px 0;', value: this.localeText('lineNumber')}, editortools);
			(this.lineNumber = cE('textbox', {id:'lineNumber', class: 'devtools-textinput', style: 'padding: 0; width:40px; max-height: 20px; margin:5px 0;', onkeydown: this.goToLine.bind(this)}, editortools)).value = 1;
			this.colNumber = cE('label', {id:'colNumber', style: 'width:50px; max-height: 20px; margin:7px 0 4px 2px;', value: this.localeText('colNumber') + '0'}, editortools);
			//插入链接菜单
			cE('menupopup', {onpopupshowing: 'stylishCustom2.showDocumentList(event,false);'},
				cE('menu', {id:'insertURLMenu',  label: this.localeText('insertURL')}, insertMenupopup));
			//插入文本菜单
			var insertTextMenupopup = cE('menupopup', {}, 
					cE('menu', {id:'insertTextMenu',  label: this.localeText('insertText')}, insertMenupopup));
			//插入文档规则
			var documentRules = cE('menupopup', {}, cE('menu', {id:'documentRules', label: this.localeText('documentRules')}, insertTextMenupopup));
			var {text, domRules} = this.insertRules;
			for(var i in domRules){
				cE('menuitem', {label: i, onclick: this.insertString.bind(null, domRules[i], 6)}, documentRules);
			}
			cE('menuseparator', {}, insertTextMenupopup);
			for(var i in text){
				cE('menuitem', {label: Array.isArray(text[i]) ? text[i][0] : text[i], onclick: this.insertString.bind(null, text[i])}, insertTextMenupopup);
			}

		},

		setLineAndcolNum: function(){
			var {line, ch} = sourceEditor.getCursor();
			this.lineNumber.value = line + 1;
			this.colNumber.value = this.localeText('colNumber') + ch;
		},

		goToLine: function(event){
			if(event.keyCode == 13 || event.keyCode == 108){
				event.preventDefault();
				var l = parseInt(event.target.value);
				if(isNaN(l) || l <= 0) return;
				sourceEditor.setCursor({line: l - 1, ch: 0});
				sourceEditor.focus();
			}
		},

		unperview: function(){
			style.name = nameE.value;
			style.code = stylishCustom2.oldPreview;
			this.unperview.setAttribute('disabled', true);
			document.getElementById('preview-button').removeAttribute('disabled');
			document.getElementById('errors').style.display = 'none';
			setTimeout(function () {
				style.setPreview(true);
			}, 50);
		},

		setComment: function(){
			var selText = sourceEditor.getSelection();
			if(!selText) return;
			var [from, to] = [sourceEditor.getCursor('start'), sourceEditor.getCursor('end')],
				re = /(^[\W\s]*?\/\*)((?:(?!\/\*|\*\/)[\s\S])*?)(\*\/[\W\s]*?$)/;
			if(!re.test(selText)){
				if(!/\/\*|\*\//.test(selText)){
					sourceEditor.replaceSelection('/*' + selText + '*/');
					sourceEditor.setSelection(from, {line: to.line, ch: to.ch + (from.line == to.line ? 4 : 2)});
				}
			}else{
				var reg = selText.match(re);
				sourceEditor.replaceSelection(reg[1].replace(/\/\*$/g, '') + reg[2] + reg[3].replace(/^\*\//g, ''));
				sourceEditor.setSelection(from, {line: to.line, ch: to.ch - (from.line == to.line ? 4 : 2)});
			}
			sourceEditor.focus();
		},

		setShortcuts: function(){
			sourceEditor.config.extraKeys['Shift-1'] = function(e){
				sourceEditor.replaceSelection(' !important;');
			};
			sourceEditor.config.extraKeys['Ctrl-/'] = this.setComment.bind(this);
		},

		insertString: function (str, range) {
			if(Array.isArray(str)){
				sourceEditor.replaceSelection(str[1]);
				range = str[2] || range || 0;
			}else{
				sourceEditor.replaceSelection(str);
			}
			if(range)
				sourceEditor.setCursor(sourceEditor.getPosition(sourceEditor.getOffset(sourceEditor.getCursor('end')) - range));
			sourceEditor.focus();
		},

		revertOldFindbar: function(){
			if(!this._revertOldFindbar) return;
			Object.defineProperty(codeElementWrapper, 'scrollElement', {get: function(){
				if(sourceEditorType == 'sourceeditor')
					return sourceEditor.container.contentDocument.getElementsByClassName('CodeMirror-code')[0];
				return sourceEditor.inputField;
			}});
			finder.requestMatchesCount = function(){};
			var findBar = document.getElementById('findbar');
			Object.defineProperty(findBar.browser, '_lastSearchString', {get: function() finder.searchString});
			findBar.browser.finder = finder;
			findBar.open();
		},

		showDocumentList: function (event, isChrome) {
			var menu = event.target,
				ww = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator),
				windows = ww.getXULWindowEnumerator(null),
				docs = [],
				cE = this.createElement;
			while (windows.hasMoreElements()) {
				try {
					var windowDocShell = windows.getNext().QueryInterface(Components.interfaces.nsIXULWindow).docShell;
					this.appendContainedDocuments(docs, windowDocShell,
					isChrome ? Components.interfaces.nsIDocShellTreeItem.typeChrome : Components.interfaces.nsIDocShellTreeItem.typeContent);
				} catch (ex) {
					Components.utils.reportError(ex);
				}
			}
			this.emptyChildren(menu);
			if(!isChrome && menu.id != 'chromeMenu'){
				cE('menuseparator', {},
					cE('menupopup', {},
						cE('menu', {
							id: 'chromeMenu',
							label: this.localeText('chromeMenu'),
							onpopupshowing:'event.stopPropagation();stylishCustom2.showDocumentList(event,true);'
					}, menu)
				).parentNode.parentNode);
			}
			if (!docs.length) {
				cE('menuitem', {label: '(None)', disabled: true}, menu);
			} else {
				for (var i = 0; i < docs.length; i++) {
					this.addMenuItem(menu, docs[i]);
				}
			}
		},

		appendContainedDocuments: function (array, docShell, type) {
			var containedDocShells = docShell.getDocShellEnumerator(type,
			Components.interfaces.nsIDocShell.ENUMERATE_FORWARDS);
			while (containedDocShells.hasMoreElements()) {
				try {
					var childDoc = containedDocShells.getNext().QueryInterface(Components.interfaces.nsIDocShell)
						.contentViewer.DOMDocument;
					if (type == 0 && docShell.contentViewer.DOMDocument.location.href == childDoc.location.href && childDoc.location.href != 'about:blank') {
						array.push(childDoc);
					}
					if (type == 1 && docShell.contentViewer.DOMDocument.location.href != childDoc.location.href && (childDoc.location.href != 'about:blank' ||childDoc.URL == childDoc.baseURI)) {
						if(childDoc.location.href == 'about:blank' && childDoc.URL != childDoc.baseURI || (childDoc.defaultView && childDoc.defaultView.frameElement != null)) 
							continue;
						array.push(childDoc);
					}
				} catch (ex) {
					console.log(ex + '\n');
				}
			}
		},

		emptyChildren: function (node) {
			while (node.hasChildNodes()) {
				node.removeChild(node.lastChild);
			}
		},

		createElement: function(name, attr, parent){
			var e = document.createElementNS(
					'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', name);
			if(attr){
				for (var i in attr) {
					if(typeof attr[i] == 'function' || (i == 'value' && (name == 'textbox' || name == 'menuitem')))
						e[i] = attr[i];
					else
						e.setAttribute(i, attr[i]);
				}
			}
			if(parent){
				if(parent instanceof Array){
					parent[0].insertBefore(e, parent[1]);
				}else{
					parent.appendChild(e);
				}
			}
			return e;
		},

		addMenuItem: function (parent, doc) {
			this.createElement('menuitem', {
				label: doc.title || doc.location.href, 
				tooltiptext: doc.location.href, 
				onclick: function (e) {
					if (e.button != 0) 
						stylishCustom2.insertString('@-moz-document url("' + e.target.getAttribute('tooltiptext') + '"){\n\n}', 2);
					else
						stylishCustom2.insertString(e.target.getAttribute('tooltiptext'));
					stylishCustom2.closeMenus(this);
				}
			}, parent);
		},

		closeMenus: function (node) {
			if ('tagName' in node) {
				if (node.namespaceURI == 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul' && (node.tagName == 'menupopup' || node.tagName == 'popup')) node.hidePopup();
				this.closeMenus(node.parentNode);
			}
		}
	}
	setTimeout(stylishCustom2.init.bind(stylishCustom2), 150);
}