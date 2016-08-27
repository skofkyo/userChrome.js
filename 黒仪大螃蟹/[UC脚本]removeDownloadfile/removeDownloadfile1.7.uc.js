// ==UserScript==
// @include  main
// @include  chrome://browser/content/places/places.xul
// ==/UserScript==

(function () {
	var removeDownloadfile = {
		removeStatus : function (){
			var RMBtn = document.querySelector("#removeDownload"),
				listbox = document.querySelector("#downloadsListBox") || document.querySelector("#downloadsRichListBox"),
				state = listbox.selectedItems[0].getAttribute('state');
				RMBtn.setAttribute("disabled","true");
			if(state != "0" && state != "4" && state != "5") 
				RMBtn.removeAttribute("disabled");
		},
		removeMenu : function (){
			try{removeDownloadfile.removeStatus();}catch(e){};
			if(document.querySelector("#removeDownload")) return;
			var menuitem = document.createElement("menuitem"),
				rlm = document.querySelector('.downloadRemoveFromHistoryMenuItem');
			menuitem.setAttribute("label", rlm.getAttribute("label").indexOf("History") != -1 ? "Delete File" : "\u4ECE\u786C\u76D8\u4E2D\u5220\u9664");
			menuitem.setAttribute("id","removeDownload");
			
			menuitem.onclick = function (e){
				if(e.target.disabled) return;
				var path = "";
				var dlView = 'DownloadsView' in window ? DownloadsView : null;
				if(typeof DownloadsViewItemController != "undefined"){
					if(dlView.controllerForElement){
						//FF38
						path = dlView.controllerForElement(document.popupNode).download.target.path;
					}else{
						//FF37
						path = (new DownloadsViewItemController(document.popupNode)).dataItem.file;
					}
				}else{
					if(!dlView || !dlView._richlistbox && !dlView.richListBox)
						dlView = document.getElementById("downloadsRichListBox")._placesView;
					let selectedItemsShell = document.popupNode._shell;
					if(!(selectedItemsShell._metaData && selectedItemsShell._metaData.filePath)){
						//FF38
						path = (selectedItemsShell.download || selectedItemsShell._sessionDownload || selectedItemsShell._historyDownload).target.path;//selectedItemsShell.download nightly47 160301
					}else{
						//FF37
						path = selectedItemsShell._metaData.filePath;
					}
				}
				
				var file=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				try{
					file.initWithPath(path);
				}catch(e){
					var fileUrl = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService)
									.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler)
									.getFileFromURLSpec(path).path;
					file.initWithPath(fileUrl);
				}
				if(!file.exists()){
					if(/\..{0,10}(\.part)$/.test(file.path)) 
						file.initWithPath(file.path.replace(".part",""));
					else
						file.initWithPath(file.path+".part");
				}
				if(file.exists()){file.permissions |= 0666;file.remove(0);}
				
				if(typeof DownloadsViewItemController != "undefined"){
					if(dlView.controllerForElement){
						//FF38
						dlView.controllerForElement(document.popupNode).doCommand("cmd_delete");
					}else{
						//FF37
						(new DownloadsViewItemController(document.popupNode)).doCommand("cmd_delete");
					}
				}else{
					if(dlView.doCommand){
						dlView.doCommand("cmd_delete");
					}else if(DownloadsViewController){//nightly47 160301
						DownloadsViewController.doCommand("cmd_delete");
					}
				}
			};
			
			document.querySelector("#downloadsContextMenu").insertBefore(menuitem, rlm.nextSibling);
			removeDownloadfile.removeStatus();
		},

		init : function(){
			document.querySelector("#downloadsContextMenu").addEventListener("popupshowing", this.removeMenu, false);
		}
	}
	if(location != "chrome://browser/content/places/places.xul"){
		try{
			eval("DownloadsPanel.showPanel = " + DownloadsPanel.showPanel.toString()
				.replace(/(?:this|DownloadsPanel)\.\_openPopupIfDataReady\(\)/,"{$&;removeDownloadfile\.init\(\);}"));
		}catch(e){
			//Components.utils.reportError(e);
		}
	}else{
		removeDownloadfile.init();
	}
})()