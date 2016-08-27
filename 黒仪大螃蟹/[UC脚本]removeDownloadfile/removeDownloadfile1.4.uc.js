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
				if(typeof DownloadsViewItemController != "undefined"){
					DownloadsView._dataItems.forEach(function(item){
						if(item.downloadGuid == DownloadsView.richListBox.selectedItem.getAttribute("downloadGuid")) {
							path = item.file;
							if(item.done == false) path += ".part";
							return path;
						}
					});
				}else{
					DownloadsView = document.getElementById("downloadsRichListBox")._placesView;
					var selectedItems = DownloadsView._richlistbox.selectedItems;
					path = selectedItems[0]._shell._metaData.filePath;
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
				if(file.exists()){file.permissions |= 0666;file.remove(0);}
				
				if(typeof DownloadsViewItemController != "undefined"){
					new DownloadsViewItemController(DownloadsView.richListBox.selectedItem).doCommand("cmd_delete");
				}else{
					DownloadsView.doCommand("cmd_delete");
				}
			};
			
			document.querySelector("#downloadsContextMenu").insertBefore(menuitem, rlm.nextSibling);
			removeDownloadfile.removeStatus();
		},

		Start : function(){
			document.querySelector("#downloadsContextMenu").addEventListener("popupshowing", this.removeMenu, false);

		}
	}
	if(location != "chrome://browser/content/places/places.xul"){
		try{
			eval("DownloadsPanel.showPanel = " + DownloadsPanel.showPanel.toString()
				.replace(/DownloadsPanel\.\_openPopupIfDataReady\(\)/,"{$&;removeDownloadfile\.Start\(\);}"));

		}catch(e){
			//Components.utils.reportError(e);
		}
	}else{
		removeDownloadfile.Start();
	}
})()