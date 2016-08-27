// ==UserScript==
// @name     saveTo.uc.js
// @include  chrome://mozapps/content/downloads/unknownContentType.xul
// @include  chrome://browser/content/browser.xul
// ==/UserScript==


if (location == "chrome://mozapps/content/downloads/unknownContentType.xul") {
var cssStr = (function(){/*
	button[dlgtype="accept"]::after{
	content:"";
	display:-moz-box;
	width:8px;
	height:19px;
	-moz-appearance: menulist-button;
	}
	button[dlgtype="accept"][disabled]::after{
	opacity:.3;
	}
*/}).toString().replace(/^.+\s|.+$/g,"");
var style = document.createProcessingInstruction("xml-stylesheet", "type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
document.insertBefore(style,document.firstChild);

document.querySelector("#mode").addEventListener("select", function () {
		if (dialog.dialogElement("save").selected) {
				if (!document.querySelector("#locationtext")) {
						var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("textbox"), document.querySelector("#location"));
						locationtext.id = "locationtext";
						locationtext.setAttribute("style", "margin-top:-2px;margin-bottom:-3px");
						locationtext.value = document.querySelector("#location").value;
				}
				document.querySelector("#location").hidden = true;
				document.querySelector("#locationtext").hidden = false;
		} else {
				document.querySelector("#locationtext").hidden = true;
				document.querySelector("#location").hidden = false;
		}
}, false);
dialog.dialogElement("save").click();
window.addEventListener("dialogaccept", function () {
 		if ((document.querySelector("#locationtext").value != document.querySelector("#location").value) && dialog.dialogElement("save").selected) {
			dialog.mLauncher.saveToDisk(dialog.promptForSaveToFile(dialog.mLauncher,window,document.querySelector("#locationtext").value),1);
			dialog.onCancel=null;
			document.documentElement.removeAttribute("ondialogaccept");
		}
}, false);

	
	//***********************目录路径的反斜杠\要双写\\**********************************//
	var dir = [
		["F:\\System related\\Desktop", "桌面"],
		["C:", "C盘"],
		["D:\\Downloads", "下载"],
		];
	var saveTo = document.documentElement.getButton("accept");
	var popDisAllowed = false;
	var savePopMenu = document.createElement("menupopup");
	saveTo.addEventListener("click", function(event) {
		popDisAllowed = event.button == 0 && event.target.boxObject.x + event.target.boxObject.width - event.clientX < 20;
		if (popDisAllowed) {event.preventDefault();savePopMenu.openPopup(this, "after_pointer", 0, 8, false, false);}
	}, false);
	
	var saveToMenu = saveTo.appendChild(savePopMenu);

	dir.map(function (dir) {
		var [name, dir] = [dir[1], dir[0]]; 
		var item = saveToMenu.appendChild(document.createElement("menuitem"));
		item.setAttribute("label", (name||(dir.match(/[^\\/]+$/) || [dir])[0]));
		item.setAttribute("image", "moz-icon:file:///" + dir + "\\");
		item.setAttribute("class", "menuitem-iconic");
		item.onclick = function(){
			var filename = (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value.trim() : document.querySelector("#location").value);
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(dir + "\\" + filename);
			if(file.exists() && !confirm("\""+filename+"\"\n"+"\u6587\u4EF6\u5DF2\u5B58\u5728\uFF0C\u662F\u5426\u8986\u76D6\u4E0B\u8F7D\uFF1F")) return false;
			dialog.mLauncher.saveToDisk(file,1);
			dialog.onCancel = function(){};
			close();
		}
	})
	
	saveTo.setAttribute("tooltiptext","\u5DE6\u952E\uFF1A\u786E\u5B9A\u3002\n\u4E2D\u952E\uFF1A\u4FDD\u5B58\u5E76\u6253\u5F00\u3002\n\u53F3\u952E\uFF1A\u6587\u4EF6\u53E6\u5B58\u4E3A\u3002");
	saveTo.addEventListener("click", function(event) {
		if (event.target == this) {
			if (saveTo.type != "menu" || event.button != 0 || event.target.boxObject.x + event.target.boxObject.width - event.clientX > 20) {
				if(event.button == 0){
				}else if(event.button == 1){
					Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow().saveAndOpen.urls.push(dialog.mLauncher.source.asciiSpec);
					document.querySelector("#save").click();
					document.documentElement.getButton("accept").disabled=0;
					document.documentElement.getButton("accept").click();
				}else if(event.button == 2){
					var file=dialog.promptForSaveToFile(dialog.mLauncher,window,dialog.mLauncher.suggestedFileName,"",true);
					if(file){
						dialog.mLauncher.saveToDisk(file,1);
						dialog.onCancel=function(){};
						close();
					}
				}
			}
		}
	}, false);
}

location == "chrome://browser/content/browser.xul" && (function () {
	saveAndOpen = {
		urls: [],
		onStateChange: function (prog, req, flags, status, dl) {
			if (flags == 327696 && !! ~this.urls.indexOf(dl.source.spec)) {
				this.urls[this.urls.indexOf(dl.source.spec)] = "";
				Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).getDownload(Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).DBConnection.lastInsertRowID).targetFile.launch();
			}
		},
		onSecurityChange: function (prog, req, state, dl) {},
		onProgressChange: function (prog, req, prog, progMax, tProg, tProgMax, dl) {},
		onDownloadStateChange: function (state, dl) {}
	}
	Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager).addListener(saveAndOpen);
})();

