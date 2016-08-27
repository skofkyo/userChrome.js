// ==UserScript==
// @name         Add InstallUrl Or Path To AddonsPage
// @description  在附件组件页加入用户脚本、扩展、主题安装地址和插件路径;右键即复制。
// @author       Crab
// @include      main
// @version      0.3
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function(){
	var AddToAddonsPage = {
		init: function(){
			if (content.document.URL!="about:addons" && content.document.URL!="chrome://mozapps/content/extensions/extensions.xul") return;
			var observer = new MutationObserver(function(e) {
					e = e[e.length-1];
					if(e.attributeName == "loading") {
						AddToAddonsPage.setUrlOrPath();
				}
			});
			observer.observe(content.document.getElementById("detail-view"), {attributes: true});
		},
		get getUrl() {
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			var url2 = (url.contributionURL || url.reviewURL) || false;
			return ((url2 && url2.replace(/\/developers|\/reviews/g,"")) || (url._script && url._script.downloadURL))||false;
		},
		get getPath(){
			var url = content.gViewController.viewObjects.detail._addon;
			if(!url) return false;
			return (url.pluginFullpath && url.pluginFullpath.toString()) || false;
		},
		setUrlOrPath :function(){
			if (!this.getUrl && !this.getPath) return;
			if(!content.document.getElementById("detail-InstallURL-row")){
				var value = "",label = "";
				if(content.gViewController.currentViewId.indexOf("detail")!= -1){
					switch (content.gViewController.viewObjects.detail._addon.type){
						case "extension":
						case "theme":
						case "greasemonkey-user-script":
							value = this.getUrl;
							label = "Installpage";
							break;
						case "plugin":
							value = this.getPath;
							label = "Path";
							break;
					}
				}
				if(!!value && !!label){
					var xul = '<row class="detail-row-complex" id="detail-InstallURL-row" label="'+ label +'">'+
								'<label class="detail-row-label" value="'+ label +'"/>'+
								'<label id="detail-InstallURL" class="detail-row-value text-link" onclick="if(event.button == 2){Components.classes[\'@mozilla.org/widget/clipboardhelper;1\'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(this.value);return false;}" crop="end" value="'+ value +'" href="'+ value +'"/></row>';
					var locale = (Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref("general.useragent.locale").indexOf("zh")!=-1);
					if(locale)
						xul = xul.replace(/Installpage/g,"\u5B89\u88C5\u9875\u9762").replace(/Path/g,"\u8DEF\u5F84");
					content.document.getElementById("detail-rows").innerHTML += xul;
				}
			}
		}
	}

	document.addEventListener("DOMContentLoaded",function(){
		content.addEventListener("unload",function(){
			if(content.document.URL=="about:addons" || content.document.URL=="chrome://mozapps/content/extensions/extensions.xul")
				AddToAddonsPage.setUrlOrPath();
		},false)
		AddToAddonsPage.init();
	}, false);
})();



