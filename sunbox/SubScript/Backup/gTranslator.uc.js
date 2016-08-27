// ==UserScript==
// @name           gTranslator.uc.js
// @description    基于 Dannylee 脚本uc_google_translator.uc.js的修改自用版翻译脚本
// @author         Dannylee
// @namespace      lidanny2012@gmail.com
// @include        main
// @license        MIT License
// @compatibility  Firefox 4
// @charset        UTF-8
// @version        v2014.05.04 by defpt
// @note           2014-05-04，更新了翻译的api，修复链接不到谷歌的情况
// @note           2014-02-25，随原脚本更新部分代码，并完善正则
// @note           左键点击按钮直接翻译，如果有选中文字就翻译文字，否则翻译网页
// @note           右键弹出设置菜单
// @note           不勾选弹窗显示则直接替换原文本，否则弹窗显示翻译结果
// @note           不勾选对比显示则只显示翻译结果，否则对比显示翻译结果
// @homepageURL    https://github.com/defpt/userChromeJs/blob/master/Translator
// @reviewURL      http://bbs.kafan.cn/thread-1690445-1-1.html
// ==/UserScript==

var gTranslator = {
	_prefs : null,
	_targetlang : "zh-CN",
	_showpopuptext : true,
	_showoritext : false,
	_timer : null,

	onLoad : function () {
		this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("uc.gTranslator.");
		this._prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		
		if (!this._prefs.prefHasUserValue("targetlang")) {
			this._prefs.setCharPref("targetlang", this._targetlang);
		} else {
			this._targetlang = this._prefs.getCharPref("targetlang");
		}
		if (!this._prefs.prefHasUserValue("showpopuptext")) {
			this._prefs.setBoolPref("showpopuptext", this._showpopuptext);
		} else {
			this._showpopuptext = this._prefs.getBoolPref("showpopuptext");
		}
		if (!this._prefs.prefHasUserValue("showoritext")) {
			this._prefs.setBoolPref("showoritext", this._showoritext);
		} else {
			this._showoritext = this._prefs.getBoolPref("showoritext");
		}
		var overlay = '\
		<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
				xmlns:html="http://www.w3.org/1999/xhtml"> \
			<toolbarpalette id="urlbar-icons">\
				<toolbarbutton id="gTranslator" label="翻译器" \
						context="gTranslator-contextmenu"\
						tooltiptext = "左键翻译|右键菜单" \
					    onclick="if(event.button === 0) gTranslator.ToolBarTranslatorClick(event);" >\
					<menupopup id="gTranslator-contextmenu" \
                            onpopupshowing="gTranslator.showStatbarContextMenu(event);">\
						<menuitem id="translateselected-gTranslator" \
							label="翻译选定文本" \
							onclick="gTranslator.selectionTranslation(event);"/> \
						<menuitem id="translatepage-gTranslator" \
							label="翻译整个页面" \
							onclick="gTranslator.pageTranslation(event);"/> \
						<menuseparator/> \
						<menuitem label="翻译为简中" \
							id="trtid1" \
							type="checkbox" \
							value="zh-CN" \
							onclick = "gTranslator.settargetlang(event);" /> \
						<menuitem label="翻译为英文"  \
							id="trtid2" \
							type="checkbox" \
							value="en" \
							onclick = "gTranslator.settargetlang(event);" /> \
						<menuitem label="翻译为德文" \
							id="trtid3" \
							type="checkbox" \
							value="de" \
							onclick = "gTranslator.settargetlang(event);" /> \
						<menuseparator/> \
						<menuitem id="showsreplaced" \
							label="弹窗显示翻译结果" \
							tooltiptext = "选中弹窗翻译，否则替换原文" \
							type="checkbox" \
							value="' + this._showpopuptext + '" \
							onclick = "gTranslator.setshowmode(event);"/> \
						<menuitem id="showoritext" \
							label="对比显示翻译结果" \
							tooltiptext = "选中同时显示译文和原文，否则只显示译文" \
							value="' + this._showoritext + '" \
							type="checkbox" \
							onclick = "gTranslator.setoridisplay(event);"/> \
					</menupopup>\
				</toolbarbutton>\
			</toolbarpalette>\
			<popup id="contentAreaContextMenu">\
				<menuitem id="context-translator" label="谷歌翻译选中文本" \
					class="menuitem-iconic" \
image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAALVBMVEVAhfn///+Ar/s+hPnA1/3E2f2wzf1wpPuKtPtpn/phm/pRkPr0+P/J3P2RufyoYBlkAAAAS0lEQVQI12PAAhgFBYXBDEVBQTEoQwLKkG6EMiQ3ipYXgxiMgkAAYhgKyjCCGMwMhgIPQQwGAUapW4IQMycKCMLMhjBYQ1ycsdgNAE2OCLaXXlwhAAAAAElFTkSuQmCC" \
					oncommand="gTranslator.selectionTranslation(event);"/> \
				<menuitem id="context-page-translator" label="谷歌翻译当前页面" \
					class="menuitem-iconic" \
image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAALVBMVEVAhfn///+Ar/s+hPnA1/3E2f2wzf1wpPuKtPtpn/phm/pRkPr0+P/J3P2RufyoYBlkAAAAS0lEQVQI12PAAhgFBYXBDEVBQTEoQwLKkG6EMiQ3ipYXgxiMgkAAYhgKyjCCGMwMhgIPQQwGAUapW4IQMycKCMLMhjBYQ1ycsdgNAE2OCLaXXlwhAAAAAElFTkSuQmCC" \
					oncommand="gTranslator.pageTranslation(event);"/> \
			</popup>\
		</overlay>';
		overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
		window.userChrome_js.loadOverlay(overlay, gTranslator);
		var css = '\
			#gTranslator {\
				list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAANwAAADcBYx2BhQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIISURBVDiNpZM/aFNRFMa/794XO752EMGKUCdRB1upRXBTFJyEYhFR6GQsmIRHI4LLM4uLkFcbhRYUat10UNwEkVqkUqh2E4qDKGQQhySLQ8K9n8vLMwndeqbL+fM73z3nXkrCXiwYdMzMzNjR0dEbAM4AGCNpJP0kuRmG4Uocx+3efPYqKBaLx4wxz0juSBoKgqDgnDtB8pf3fprkJQDzSZJ87daY7qFcLh+11r4BcCdJklnn3Lz3/iOAC5Iee+9XvPc3AbyOomiiD1CpVALn3CrJzYWFhU8A0G63/wCokXxC8r4xJm+tfQfgMIDnlUplXwZoNBrXAExKul4sFvcDwPLycqdarS51Oh0BeEDytqSxtPHxVqs123uFqUySMXMkmc5kKJfLvZV0DsCBbo6kNUlT2RZInsqmSsalUmkoiqKWtbYk6eDgpki2ABzKFJB0PXFD8p6kq5LWAbwHsDXAqAH4PwNJX3bpMk5yGsCVJEkmSc4B+J2GH5L83qtgYxCQmgVwBACq1eqS9/586p+QtJEBwjB8CWB9F4CR9BQA8vl8zlp7N/Vv1ev1F0DPSywUCmNBEGwDCAcga8PDwxcbjcYjkrcA/HXOTS4uLn7LFABArVb7AeAkgA8DgJ1ms7maFn82xox3i/sUZA6SURRdlnQWwGkAIrntvd8YGRl5Fcex78vf63f+B+aC0/ptXkuWAAAAAElFTkSuQmCC");\
				-moz-appearance: none !important;\
				box-shadow: none !important;\
				border: none !important;\
				min-width: 18px !important;\
				min-height: 18px !important;\
				margin-right: -5px !important;\
				-moz-box-align: center !important;\
				-moz-box-pack: center !important;\
			}\
		'.replace(/[\r\n\t]/g, '');
        function addStyle(css) {
        	var pi = document.createProcessingInstruction(
        			'xml-stylesheet',
        			'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
        	return document.insertBefore(pi, document.documentElement);
        }
		gTranslator.style = addStyle(css);

		var xmltt = '\
			        <tooltip id="translationResult"	style="-moz-appearance: none;display:-moz-popup;font:message-box;background-color:InfoBackground;color:InfoText;border: 1px solid InfoText;width:450px;">\
			      			<vbox id="translationResultPopupBox">\
			        			<label id="translationResultPopupLabel" flex="1" onclick="gTranslator.copyToClipboard(event,this.textContent);" tooltiptext="左键复制到剪切板、右键关闭！"/>\
			      			</vbox>\
			    		</tooltip>\
			    	';
		var rangett = document.createRange();
		rangett.selectNodeContents(document.getElementById('mainPopupSet'));
		rangett.collapse(false);
		rangett.insertNode(rangett.createContextualFragment(xmltt.replace(/\n|\r/g, ''))); //.replace(/\n/g, '')
		rangett.detach();

	},

	observe : function (aSubject, aTopic, aData) {
		if (aTopic == "xul-overlay-merged") {
			//	Application.console.log("GoogleTranslator界面加载完毕！");
			document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", this.showContextMenu, false);
			window.addEventListener("unload", this, false);
		}
	},

	uninit : function () {
		if (this._timer)
			clearTimeout(this._timer);
		var i = document.getElementById("gTranslator");
		if (i)
			i.parentNode.removeChild(i);
		var i = document.getElementById("gTranslator-contextmenu");
		if (i)
			i.parentNode.removeChild(i);
		document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", this.showContextMenu, false);
		var i = document.getElementById("context-translator");
		if (i)
			i.parentNode.removeChild(i);
		var i = document.getElementById("context-page-translator");
		if (i)
			i.parentNode.removeChild(i);
		var i = document.getElementById("translationResult");
		if (i)
			i.parentNode.removeChild(i);
		window.removeEventListener("unload", this, false);
	},

	handleEvent : function (event) {
		switch (event.type) {
		case "unload":
			this.uninit();
			break;
		}
	},

	settargetlang : function (event) {
		if (event.button != 0)
			return;
		this._targetlang = event.target.value;
		this._prefs.setCharPref("targetlang", this._targetlang);
		this.settargetlangshow();
	},

	settargetlangshow : function () {
		document.getElementById("trtid1").setAttribute('checked', ((document.getElementById("trtid1").value != this._targetlang) ? false : true));
		document.getElementById("trtid2").setAttribute('checked', ((document.getElementById("trtid2").value != this._targetlang) ? false : true));
		document.getElementById("trtid3").setAttribute('checked', ((document.getElementById("trtid3").value != this._targetlang) ? false : true));
	},

	setshowmode : function (event) {
		if (event.button != 0)
			return;
		this._showpopuptext = !this._showpopuptext;
		this._prefs.setBoolPref("showpopuptext", this._showpopuptext);
		this.showmodeshow();
	},

	setoridisplay : function (event) {
		if (event.button != 0) return;
		this._showoritext = !this._showoritext;
		this._prefs.setBoolPref("showoritext", this._showoritext);
		this.showmodeshow();
	},

	showmodeshow : function (event) {
		document.getElementById("showsreplaced").setAttribute('checked', this._showpopuptext);
		document.getElementById("showoritext").setAttribute('checked', this._showoritext);
	},

	showContextMenu : function () {
		document.getElementById("context-translator").hidden = !(gContextMenu.isTextSelected);
		document.getElementById("context-page-translator").hidden = (gContextMenu.isTextSelected);
	},

	showStatbarContextMenu : function () {
		if (document.getElementById("translateselected-gTranslator")) {
			document.getElementById("translateselected-gTranslator").disabled = !(this.isValidTextLength(this.getSelectedText()));
		}
		this.settargetlangshow();
		this.showmodeshow();
	},

	getFocusedWindow: function(){
        var focusedWindow = document.commandDispatcher.focusedWindow;
        if (!focusedWindow || focusedWindow == window)
          return window.content;
        else
          return focusedWindow;
    },

	getSelectedText: function(e) {
    	var focusedWindow = this.getFocusedWindow();
		var selectedsel = focusedWindow.getSelection();
		if (selectedsel && !selectedsel.toString()) {
			var node = document.commandDispatcher.focusedElement;
			if (node &&
				node.ownerDocument.defaultView == focusedWindow &&
				(node.type == "text" || node.type == "textarea") &&
				'selectionStart' in node &&
				node.selectionStart != node.selectionEnd) {
				var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
				var offsetEnd  = Math.max(node.selectionStart, node.selectionEnd);
				var selectedText = node.value.substr(offsetStart, offsetEnd-offsetStart);
				return selectedText;
			}
		}
		var selectedText = selectedsel ? selectedsel.toString() : "";
		return selectedText;
    },

	isValidTextLength : function (selectedtext) {
		if (selectedtext.length > 0 && selectedtext.length <= 38000) {
			return true;
		} else {
			return false;
		}
	},

	ToolBarTranslatorClick : function (e) {
		var tbt = document.getElementById("gTranslator");
		if (e.target != tbt)
			return;
		var selectedText = this.getSelectedText();
		if (this.isValidTextLength(selectedText)) {
			this.selectionTranslation(e);
		} else {
			this.pageTranslation();
		}
	},

	selectionTranslation : function (event) {
		var selectedText = this.getSelectedText();
		this.refreshInformation(selectedText);
	},

	pageTranslation : function (e) {
		var cel = this._targetlang;
		var docurl = content.location.href;
		if (docurl.match(/^about/)) {
            return;
        } else if(docurl.match(/^https/)) {
			docurl = docurl.replace(/https/i, "http");
		}
		var fordUrl = "http://translate.google.com.hk/translate?hl=" + cel + "&sl=auto&tl=" + cel + "&u=" + encodeURIComponent(docurl);
		gBrowser.selectedTab = gBrowser.addTab(fordUrl);
	},

	refreshInformation : function (whatToTranslate) {
		if (this.isValidTextLength(whatToTranslate)) {
			var cel = this._targetlang;
			var httpRequest = null;
			var fullUrl = "http://translate.google.com.hk/translate_t?text="+whatToTranslate+"&hl="+cel+"&langpair=auto|"+cel+"&tbb=1" ;

			function removeHTMLTags(mitkell) {
				var strTagStrippedText = mitkell.replace(/<br>/ig, "\n").replace(/<\/span>/ig, "");
				if (gTranslator._showoritext == false) {
					strTagStrippedText = strTagStrippedText.replace(/onmouseout=[^>]+>/ig, "∮")
						.replace(/<span title="[^∮]+∮/ig, "")
						.replace(/\s*\n+/ig, "\n");
				} else {
					strTagStrippedText = strTagStrippedText.replace(/<span title=\"/ig, "")
						.replace(/\"\sonmouseover[^>]+>/ig, "\n")
						.replace(/\s*\n+/ig, "\n");
				}
				return strTagStrippedText;
			}

			function infoReceived() {
				var output = httpRequest.responseText;
				if (whatToTranslate[0] == " ") {
					var kezdospace = " ";
				} else {
					var kezdospace = "";
				}
				if (whatToTranslate[whatToTranslate.length - 1] == " ") {
					var vegespace = " ";
				} else {
					var vegespace = "";
				}
				if (output.length) {
					output = output.replace(/&quot;/gi, '"');
					output = output.replace(/&lt;/gi, '<');
					output = output.replace(/&gt;/gi, '>');
					output = output.replace(/&amp;/gi, '&');
					output = output.replace(/&#39;/gi, "'");
					var fieldArray = output.split('</head>');
					if (fieldArray[1].search('class="short_text"') != -1) {
						var tempResz = fieldArray[1].split('<span id=result_box class="short_text">');
					} else if (fieldArray[1].search('class="medium_text"') != -1) {
						var tempResz = fieldArray[1].split('<span id=result_box class="medium_text">');
					} else {
						var tempResz = fieldArray[1].split('<span id=result_box class="long_text">');
					}
					var kimenet = tempResz[1].split('</span></div>');
					if (gTranslator._showpopuptext === false) {
						var focusedWindow = document.commandDispatcher.focusedWindow;
						var range = focusedWindow.getSelection().getRangeAt(0);
						range.deleteContents();
						range.insertNode(document.createTextNode(kezdospace + removeHTMLTags(kimenet[0]) + vegespace));
					} else {
						gTranslator.show(kezdospace + removeHTMLTags(kimenet[0]) + vegespace);
					}
				}
			}

			httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", fullUrl, true);
			httpRequest.onload = infoReceived;
			httpRequest.send(null);
			if (gTranslator._showpopuptext === true)
				this.show("正在获取翻译结果,请等待...");
			else
           	    XULBrowserWindow.statusTextField.label="正在获取翻译结果,请等待...";
				
		} else { //ha a kijelolt szoveg hossza <=0 vagy >38000
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, "Google Translator", "选中的文本不能超过38000个字符！");
		}
	},

	show : function (res) {
		var popup = document.getElementById("translationResult");
		this.setValue(res);
		this.sizeChange();
		var node = document.getElementById("content");
		if (!node) {
			node = document.getElementById("messagepane");
		}
		if (this._timer)
			clearTimeout(this._timer);

		if (typeof popup.openPopup != 'undefined')
			popup.openPopup(node, "overlap", 0, 0, true, false);
		else
			popup.showPopup(node, -1, -1, "popup", null, null);
		setTimeout(function () {
			gTranslator.sizeChange();
		}, 0);
		this._timer = setTimeout(function () {
				popup.hidePopup();
			}, 15000); //显示时间15秒
	},

	setValue : function (val) {
		var label = document.getElementById("translationResultPopupLabel");
		while (label.firstChild) {
			label.removeChild(label.firstChild);
		}
		if (val != "")
			label.appendChild(document.createTextNode(val));
	},

	sizeChange : function () {
		var popup = document.getElementById("translationResult");
		var box = document.getElementById("translationResultPopupBox");
		popup.sizeTo(450, Math.max(box.boxObject.height * 1.0 + 15, 23));
	},

	copyToClipboard : function (e, aValue) {
		if (e.button == 0) {
			var clipid = Components.interfaces.nsIClipboard;
			var clip = Components.classes['@mozilla.org/widget/clipboard;1'].getService(clipid);
			if (!clip) {
				return;
			}
			var trans = Components.classes['@mozilla.org/widget/transferable;1'].
				createInstance(Components.interfaces.nsITransferable);
			if (!trans) {
				return;
			}
			var str = Components.classes['@mozilla.org/supports-string;1'].
				createInstance(Components.interfaces.nsISupportsString);
			str.data = aValue;
			trans.setTransferData("text/unicode", str, aValue.length * 2);
			clip.setData(trans, null, clipid.kGlobalClipboard);
		} else if (e.button == 2) {
			var popup = document.getElementById("translationResult");
			clearTimeout(this._timer);
			popup.hidePopup();
		}
	}
};
gTranslator.onLoad();