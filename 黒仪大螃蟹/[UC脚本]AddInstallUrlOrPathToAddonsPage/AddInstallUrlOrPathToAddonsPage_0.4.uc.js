// ==UserScript==
// @name         Add InstallUrl Or Path To AddonsPage
// @description  在附件组件页加入用户脚本、扩展、主题安装地址和插件路径;右键即复制。
// @author       Crab
// @include      main
// @version      0.4
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function(){
	var AddToAddonsPage = {
		init: function(){
			if (["about:addons","chrome://mozapps/content/extensions/extensions.xul"].indexOf(content.document.URL)==-1) return;
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
			return url.pluginFullpath || false;
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
							label = "%Installpage%";
							break;
						case "plugin":
							value = this.getPath;
							label = "%Path%";
							break;
					}
				}
				if(!!value && !!label){
					var xul = "";
					if(typeof(value) != "string"){
						xul = "<vbox>";
						for(var i=0;i< value.length;i++){
							xul += ('<label class="detail-row-value text-link" crop="end" onclick="\
								if(event.button == 0) {\
									var file=Components.classes[\'@mozilla.org/file/local;1\']\
												.createInstance(Components.interfaces.nsILocalFile);\
									file.initWithPath(this.value); \
									if(file.exists()) \
										file.reveal(); \
								}else if(event.button == 2){\
									Components.classes[\'@mozilla.org/widget/clipboardhelper;1\']\
												.createInstance(Components.interfaces.nsIClipboardHelper)\
												.copyString(this.value);\
								}\
								return false;\
								" value="'+ value[i] +'" href="'+ value[i] +'"/>');
						}
						xul += "</vbox>";
					}else{
						xul = '<label class="detail-row-value text-link" crop="end" onclick="\
							if(event.button == 2){\
								Components.classes[\'@mozilla.org/widget/clipboardhelper;1\']\
										.createInstance(Components.interfaces.nsIClipboardHelper)\
										.copyString(this.value);\
							return false;\
							}" value="'+ value +'" href="'+ value +'"/>';
					}
					xul = '<row class="detail-row-complex" id="detail-InstallURL-row" label="'+ label +'">'+
								'<label class="detail-row-label" value="'+ label +'"/>'+ xul +'</row>';
					if(Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref("general.useragent.locale").indexOf("zh")!=-1){
						xul = xul.replace(/\%Installpage\%/g,"\u5B89\u88C5\u9875\u9762").replace(/\%Path\%/g,"\u8DEF\u5F84");
					}else{
						xul = xul.replace(/\%/g,"");
					}
					content.document.getElementById("detail-rows").innerHTML += xul;
				}
			}
		}
	}

	document.addEventListener("DOMContentLoaded", AddToAddonsPage.init, false);
})();



