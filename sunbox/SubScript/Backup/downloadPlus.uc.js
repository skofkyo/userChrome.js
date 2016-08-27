// ==UserScript==
// @name         downloadPlus.uc.js
// @description  从硬盘中删除+下载重命名并可转码+双击复制链接+另存为+保存并打开+完成下载提示音+自动关闭下载产生的空白标签
// @author       w13998686967再次修改整合 (ywzhaiqi、黒仪大螃蟹、Alice0775、紫云飞)
// @include      chrome://browser/content/browser.xul
// @include      chrome://browser/content/places/places.xul
// @include      chrome://mozapps/content/downloads/unknownContentType.xul
// @include      chrome://mozapps/content/downloads/downloads.xul
// @version      2014.11.02 增加多个功能
// @version      2014.06.06 add delay to fix for new userChrome.js
// @charset      UTF-8
// ==/UserScript==
(function() {

    var popups = true           //true,(新建下载)弹窗                                false,不弹窗
    var rename = true           //true,(下载改名)可改名                              false,不可改
    var locking = true          //true,(下载改名)锁定保存文件按钮                    false,不锁定
    var encodingConvert = true  //true,(下载改名)开启下拉菜单选项                    false,关闭下拉菜单选项
    var convert = true          //true,(保存并打开)兼容火狐版本26+(也许会有BUG)      false,火狐版本29+
	var suffix = true	        //true,(保存到)后缀样式一,如downloadPlus.uc.js(1).7z false,后缀样式二,如downloadPlus.uc.js-1.7z

    switch (location.href) {
	    case "chrome://browser/content/browser.xul":
		    setTimeout(function(){
			    new_Download();                    // 新建下载              
			    downloadsPanel_removeFile();       // 从硬盘中删除
			    downloadSound_Play();              // 下载完成提示音
				downloadFileSize();                // 精确显示文件大小
				autoClose_blankTab();              // 自动关闭下载产生的空白标签
				saveAndOpen_on_main(); 		       // 跟下面的 save_AndOpen 配合使用
				download_dialog_changeName_on_main();// 跟下面的 download_dialog_changeName 配合使用
			}, 200);	
            break;
        case "chrome://mozapps/content/downloads/unknownContentType.xul":
 //           setTimeout(function(){
			    save_And_Open();                   // 保存并打开
                download_dialog_changeName();      // 下载改名
                download_dialog_saveas();          // 另存为...
				download_dialog_saveTo();          // 保存到...
				download_dialog_showCompleteURL(); // 下载弹出窗口双击链接复制完整链接
				download_dialog_doubleclicksaveL();// 下载弹出窗口双击保存文件项执行下载
				window.sizeToContent();            // 下载弹出窗口大小自适应(确保在添加的按钮之后加载)
//            }, 200);
            break;
		case "chrome://browser/content/places/places.xul":
		    setTimeout(function(){
			    new_Download();                    // 新建下载(我的足迹)
                downloadsPanel_removeFile();       // 从硬盘中删除(我的足迹)
			}, 200);	
            break;
    }
		
	// 下载完成提示音
	function downloadSound_Play() {
	    var downloadPlaySound = {
        
            DL_START : null,
            DL_DONE : "file:///C:/WINDOWS/Media/chimes.wav",
            DL_CANCEL: null,
            DL_FAILED: null,
            
            
            _list: null,
            init: function sampleDownload_init() {
                XPCOMUtils.defineLazyModuleGetter(window, "Downloads",
                        "resource://gre/modules/Downloads.jsm");
            
            
                window.addEventListener("unload", this, false);
            
                //**** 监视下载
                if (!this._list) {
                  Downloads.getList(Downloads.ALL).then(list => {
                    this._list = list;
                    return this._list.addView(this);
                  }).then(null, Cu.reportError);
                }
            },
            
            uninit: function() {
                window.removeEventListener("unload", this, false);
                if (this._list) {
                  this._list.removeView(this);
                }
            },
            
            onDownloadAdded: function (aDownload) {
                 //**** 开始下载
                if (this.DL_START);
                  this.playSoundFile(this.DL_START);
            },
            
            onDownloadChanged: function (aDownload) {
                //**** 取消下载
                if (aDownload.canceled && this.DL_CANCEL)
                  this.playSoundFile(this.DL_CANCEL)
                //**** 下载失败
                if (aDownload.error && this.DL_FAILED)
                  this.playSoundFile(this.DL_FAILED)
                //**** 完成下载
                if (aDownload.succeeded && this.DL_DONE)
                  this.playSoundFile(this.DL_DONE)
            },
            
            playSoundFile: function(aFilePath) {
                if (!aFilePath)
                  return;
                var ios = Components.classes["@mozilla.org/network/io-service;1"]
                          .createInstance(Components.interfaces["nsIIOService"]);
                try {
                  var uri = ios.newURI(aFilePath, "UTF-8", null);
                } catch(e) {
                  return;
                }
                var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
                if (!file.exists())
                  return;
                
                this.play(uri);
            },
            
            play: function(aUri) {
                var sound = Components.classes["@mozilla.org/sound;1"]
                        .createInstance(Components.interfaces["nsISound"]);
                sound.play(aUri);
            },
            
            handleEvent: function(event) {
                switch (event.type) {
                  case "unload":
                    this.uninit();
                    break;
                }
            }
        }
        downloadPlaySound.init();
    }
	
	//新建下载
	function new_Download() {
	    var createDownloadDialog = function(){
        if (popups)
            window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KCTxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KCQk8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KCQk8dGV4dGJveCBmbGV4PSIxIi8+Cgk8L2hib3g+Cgk8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+Cgk8aGJveCBkaXI9InJldmVyc2UiPgoJCTxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgoJPC9oYm94PgoJPHNjcmlwdD4KCQk8IVtDREFUQVsKCQlmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CgkJCXZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKCQkJaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CgkJCQlmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CgkJCQkJdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwoJCQkJfQoJCQkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKCQkJfSBlbHNlIHsKCQkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKCQkJfQoJCX0KCQl2YXIgb3duZXIgPSB3aW5kb3cub3BlbmVyOwoJCXdoaWxlKG93bmVyLm9wZW5lciAmJiBvd25lci5sb2NhdGlvbiAhPSAiY2hyb21lOi8vYnJvd3Nlci9jb250ZW50L2Jyb3dzZXIueHVsIil7CgkJCW93bmVyID0gb3duZXIub3BlbmVyOwoJCX0KdmFyIG1haW53aW4gPSBDb21wb25lbnRzLmNsYXNzZXNbIkBtb3ppbGxhLm9yZy9hcHBzaGVsbC93aW5kb3ctbWVkaWF0b3I7MSJdLmdldFNlcnZpY2UoQ29tcG9uZW50cy5pbnRlcmZhY2VzLm5zSVdpbmRvd01lZGlhdG9yKS5nZXRNb3N0UmVjZW50V2luZG93KCJuYXZpZ2F0b3I6YnJvd3NlciIpOwkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIFBhcnNlVVJMcywgZmFsc2UpOwoJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoImJ1dHRvbiIpLmFkZEV2ZW50TGlzdGVuZXIoImNvbW1hbmQiLCBmdW5jdGlvbiAoKSB7CQlkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewoJCQkJb3duZXIuc2F2ZVVSTCh1cmwgLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBtYWlud2luLmRvY3VtZW50KTsKCQkJfSk7CgkJCWNsb3NlKCkKCQl9LCBmYWxzZSk7CgkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigidGV4dGJveCIpLnZhbHVlID0gb3duZXIucmVhZEZyb21DbGlwYm9hcmQoKTsKCQlQYXJzZVVSTHMoKTsKCQldXT4KCTwvc2NyaXB0Pgo8L3dpbmRvdz4=", "name", "top=" + (window.screenY + window.innerHeight/4 - 50) + ",left=" + (window.screenX + window.innerWidth/2 - 250));
	    else
	        window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KCTxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KCQk8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KCQk8dGV4dGJveCBmbGV4PSIxIi8+Cgk8L2hib3g+Cgk8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+Cgk8aGJveCBkaXI9InJldmVyc2UiPgoJCTxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgoJPC9oYm94PgoJPHNjcmlwdD4KCQk8IVtDREFUQVsKCQlmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CgkJCXZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKCQkJaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CgkJCQlmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CgkJCQkJdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwoJCQkJfQoJCQkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKCQkJfSBlbHNlIHsKCQkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKCQkJfQoJCX0KCQl2YXIgb3duZXIgPSB3aW5kb3cub3BlbmVyOwoJCXdoaWxlKG93bmVyLm9wZW5lciAmJiBvd25lci5sb2NhdGlvbiAhPSAiY2hyb21lOi8vYnJvd3Nlci9jb250ZW50L2Jyb3dzZXIueHVsIil7CgkJCW93bmVyID0gb3duZXIub3BlbmVyOwoJCX0KdmFyIG1haW53aW4gPSBDb21wb25lbnRzLmNsYXNzZXNbIkBtb3ppbGxhLm9yZy9hcHBzaGVsbC93aW5kb3ctbWVkaWF0b3I7MSJdLmdldFNlcnZpY2UoQ29tcG9uZW50cy5pbnRlcmZhY2VzLm5zSVdpbmRvd01lZGlhdG9yKS5nZXRNb3N0UmVjZW50V2luZG93KCJuYXZpZ2F0b3I6YnJvd3NlciIpOwkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIFBhcnNlVVJMcywgZmFsc2UpOwoJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoImJ1dHRvbiIpLmFkZEV2ZW50TGlzdGVuZXIoImNvbW1hbmQiLCBmdW5jdGlvbiAoKSB7CQlkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewoJCQkJb3duZXIuc2F2ZVVSTCh1cmwgLCBudWxsLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCBtYWlud2luLmRvY3VtZW50KTsKCQkJfSk7CgkJCWNsb3NlKCkKCQl9LCBmYWxzZSk7CgkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigidGV4dGJveCIpLnZhbHVlID0gb3duZXIucmVhZEZyb21DbGlwYm9hcmQoKTsKCQlQYXJzZVVSTHMoKTsKCQldXT4KCTwvc2NyaXB0Pgo8L3dpbmRvdz4=", "name", "top=" + (window.screenY + window.innerHeight/4 - 50) + ",left=" + (window.screenX + window.innerWidth/2 - 250));
    }
        
        location == "chrome://browser/content/browser.xul" && (function () {
            document.getElementById('downloads-button').parentNode.addEventListener('click', function(e){
                    if(e.target.id == "downloads-button" || e.target.id == "downloads-indicator"){
                        if(e.button == 2){
                            if(!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)){
                                createDownloadDialog();
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        }
                    }
                }
                , false);
        })();
        
        location == "chrome://browser/content/places/places.xul" && (function () {
            var button = document.querySelector("#placesToolbar").insertBefore(document.createElement("toolbarbutton"), document.querySelector("#clearDownloadsButton"));
            button.id = "createNewDownload";
            button.label = "新建下载";
            button.style.paddingRight = "9px";
            button.addEventListener("command", createDownloadDialog, false);
            window.addEventListener("mouseover", function(e){
                button.style.display
                    = (document.getElementById("searchFilter").attributes.getNamedItem("collection").value == "downloads")
                    ? "-moz-box"
                    : "none";
                }, false);
        })();
	}
	// 从硬盘中删除
	function downloadsPanel_removeFile() {
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
	    		menuitem.setAttribute("label", rlm.getAttribute("label").indexOf("History") != -1 ? "Delete File" : "\u4ece\u7535\u8111\u786c\u76d8\u4e2d\u79fb\u9664");
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
    }
	
	//精确显示文件大小
	function downloadFileSize() {    
        location == "chrome://browser/content/browser.xul" && (DownloadUtils.convertByteUnits =
        function DU_convertByteUnits(aBytes) {
                let unitIndex = 0;
                while ((aBytes >= 999.5) && (unitIndex < 3)) {
                        aBytes /= 1024;
                        unitIndex++;
                }
                return [(aBytes > 0) && (aBytes < 100) && (unitIndex != 0) ? (aBytes < 10 ? (parseInt(aBytes * 100) / 100).toFixed(2) : (parseInt(aBytes * 10) / 10).toFixed(1)): parseInt(aBytes), ['bytes', 'KB', 'MB', 'GB'][unitIndex]];
        });
	}
	
	// 自动关闭下载产生的空白标签
    function autoClose_blankTab() {
        eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
            if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
            && aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank" && aStatus == 0) {\
            aWebProgress.DOMWindow.setTimeout(function() {\
            !aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
            }, 100);\
            }\
        '));
    }
	
	// 保存并打开
	function save_And_Open() {
	    var saveAndOpen = document.getAnonymousElementByAttribute(document.querySelector("*"), "dlgtype", "extra2");
	    saveAndOpen.parentNode.insertBefore(saveAndOpen,document.documentElement.getButton("accept").nextSibling);
	    saveAndOpen.setAttribute("hidden", "false");
	    saveAndOpen.setAttribute("label", "\u4FDD\u5B58\u5E76\u6253\u5F00");
	    saveAndOpen.setAttribute("oncommand", 'Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow().saveAndOpen.urls.push(dialog.mLauncher.source.asciiSpec);document.querySelector("#save").click();document.documentElement.getButton("accept").disabled=0;document.documentElement.getButton("accept").click()')
    }
	//作用于 main 窗口
	function saveAndOpen_on_main() {
    	Components.utils.import("resource://gre/modules/Downloads.jsm");
    	saveAndOpen = {
    		urls: [],
    		init: function(){
    			Downloads.getList(Downloads.ALL).then(list => {
    				list.addView({
    					onDownloadChanged: function(dl){
						    if (convert){
							    if(dl.progress == 100 && saveAndOpen.urls.indexOf(dl.source.url)>-1){
						    		dl.launch();
    					    		saveAndOpen.urls[saveAndOpen.urls.indexOf(dl.source.url)] = "";
    					    	}
						    } else {
						        if(dl.progress == 100 && saveAndOpen.urls.indexOf(dl.source.url)>-1){
    					    		(new FileUtils.File(dl.target.path)).launch(); 
    					    		saveAndOpen.urls[saveAndOpen.urls.indexOf(dl.source.url)] = "";
    					    	}
						    }	
    					},
    					onDownloadAdded:  function(){},
    					onDownloadRemoved: function(){},
    				});
    			}).then(null, Cu.reportError);
    		}
    
    	}
    	saveAndOpen.init();
    }
	
    // 下载改名
    function download_dialog_changeName() {
        //注:同时关闭改名和下拉菜单会导致下载文件的文件名不显示(非要关闭请默认在28行最前面加//来注释掉该功能)
        if (location != "chrome://mozapps/content/downloads/unknownContentType.xul") return;
        document.querySelector("#mode").addEventListener("select", function() {
            if (dialog.dialogElement("save").selected) {
                if (!document.querySelector("#locationtext")) {
				    if (rename || encodingConvert) {
					    var orginalString = "";
                        if (encodingConvert) {
                            try{
                                orginalString = (opener.localStorage.getItem(dialog.mLauncher.source.spec) ||
                                dialog.mLauncher.source.asciiSpec.substring(dialog.mLauncher.source.asciiSpec.lastIndexOf("/"))).replace(/[\/:*?"<>|]/g, "");
                                opener.localStorage.removeItem(dialog.mLauncher.source.spec)
                            }catch(e){
							    orginalString = dialog.mLauncher.suggestedFileName;
                            }
                        }
					    if (encodingConvert)
                            var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("menulist"), document.querySelector("#location"));
					    else
					        var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("textbox"), document.querySelector("#location"));
                        locationtext.id = "locationtext";
					    if (rename && encodingConvert)
					        locationtext.setAttribute("editable", "true");
                            locationtext.setAttribute("style", "margin-top:-2px;margin-bottom:-3px");
							locationtext.setAttribute("tooltiptext","Ctrl+\u70B9\u51FB\u8F6C\u6362url\u7F16\u7801\n\u5DE6\u952E\u003AUNICODE\n\u53F3\u952E\u003AGB2312");
                            locationtext.addEventListener("click",function(e){
                                if(e.ctrlKey){
                                    if(e.button==0)
                                        this.value = decodeURIComponent(this.value);
                                    if(e.button==2){
                                        e.preventDefault();
                                        converter.charset = "GB2312";
                                        this.value = converter.ConvertToUnicode(unescape(this.value));
                                    }
                                }
                            },false); 
					    if (rename)
						    locationtext.value = dialog.mLauncher.suggestedFileName;
					    if (encodingConvert) {
					        locationtext.addEventListener("command", function (e) {
							    if (rename)
                                    locationtext.value = e.target.value;
                                    document.title = "Opening " + e.target.value;
                            });
					        let menupopup = locationtext.appendChild(document.createElement("menupopup"));
                            let menuitem = menupopup.appendChild(document.createElement("menuitem"));
                            menuitem.value = dialog.mLauncher.suggestedFileName;
                            menuitem.label = "Original: " + menuitem.value;
					        if (!rename)
				        	locationtext.value = menuitem.value;
                            let converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter']
                                .getService(Components.interfaces.nsIScriptableUnicodeConverter);
				        	function createMenuitem(encoding) {
                                converter.charset = encoding;
                                let menuitem = menupopup.appendChild(document.createElement("menuitem"));
                                menuitem.value = converter.ConvertToUnicode(orginalString).replace(/^"(.+)"$/, "$1");
                                menuitem.label = encoding + ": " + menuitem.value;       
                            }
                            ["GB18030", "BIG5", "Shift-JIS"].forEach(function (item) { createMenuitem(item) });	
                        }
				    }
				}
                document.querySelector("#location").hidden = true;
                document.querySelector("#locationtext").hidden = false;
            } else {
                document.querySelector("#locationtext").hidden = true;
                document.querySelector("#location").hidden = false;
            }
        }, false)
		if (locking)
		    dialog.dialogElement("save").click();
        else
            dialog.dialogElement("save").selected && dialog.dialogElement("save").click();
        window.addEventListener("dialogaccept", function() {
            if ((document.querySelector("#locationtext").value != dialog.mLauncher.suggestedFileName) && dialog.dialogElement("save").selected) {
                var mainwin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
                mainwin.eval("(" + mainwin.internalSave.toString().replace("let ", "").replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")(dialog.mLauncher.source.asciiSpec, null, document.querySelector("#locationtext").value, null, null, null, null, null, null, mainwin.document, Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref("browser.download.useDownloadDir"), null);
                document.documentElement.removeAttribute("ondialogaccept");
            }
        }, false);
	}
	//作用于 main 窗口
	function download_dialog_changeName_on_main() {
	    const obsService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
        const RESPONSE_TOPIC = 'http-on-examine-response';

        var respObserver = {
            observing: false,
            observe: function (subject, topic, data) {
                try {
                    let channel = subject.QueryInterface(Ci.nsIHttpChannel);
                    let header = channel.contentDispositionHeader;
                    let associatedWindow = channel.notificationCallbacks
                                            .getInterface(Components.interfaces.nsILoadContext)
                                            .associatedWindow;
                    associatedWindow.localStorage.setItem(channel.URI.spec, header.split("=")[1]);
                } catch (ex) { }
            },
            start: function () {
                if (!this.observing) {
                    obsService.addObserver(this, RESPONSE_TOPIC, false);
                    this.observing = true;
                }
            },
            stop: function () {
                if (this.observing) {
                    obsService.removeObserver(this, RESPONSE_TOPIC, false);
                    this.observing = false;
                }
            }
        };

        respObserver.start();
        addEventListener("beforeunload", function () {
            respObserver.stop();
        })
	}
	
	
	// 另存为...
    function download_dialog_saveas() {
        var saveas = document.documentElement.getButton("extra1");
        saveas.setAttribute("hidden", "false");
        saveas.setAttribute("label", "\u53E6\u5B58\u4E3A");
        saveas.setAttribute("oncommand", 'var mainwin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser"); mainwin.eval("(" + mainwin.internalSave.toString().replace("let ", "").replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")(dialog.mLauncher.source.asciiSpec, null, (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value : dialog.mLauncher.suggestedFileName), null, null, null, null, null, null, mainwin.document, 0, null);close()');
    }
	
	// 保存到...
	function download_dialog_saveTo() {
	//目录路径的反斜杠\要双写\\
	//第一次使用要修改路径，否则无法下载
	//如果使用Firefox3.6 + userChromeJS v1.2,则路径中的汉字要转义为\u6C49\u5B57编码类型,否则会出现乱码
        var cssStr = (function(){/*
        button[label="\4FDD\5B58\5230"] .dropmarker-icon{
                display:none;
        }
        button[label="\4FDD\5B58\5230"]::after{
                content:"";
                display:-moz-box;
                width:8px;
                height:19px;
                margin-left:-20px;
                -moz-appearance: menulist-button;
        }
        button[label="\4FDD\5B58\5230"][disabled]::after{
                opacity:.3;
        }
        */}).toString().replace(/^.+\s|.+$/g,"");
        var style = document.createProcessingInstruction("xml-stylesheet", "type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
        document.insertBefore(style,document.firstChild);
	    var dir = [
		    ["F:\\IDM下载\\压缩", "压缩"],
		    ["F:\\IDM下载\\程序", "软件"],
		    ["F:\\IDM下载\\文档", "文档"],
		    ["F:\\IDM下载\\音乐", "歌曲"],
		    ["F:\\IDM下载\\常规", "其他"]
	    ];
	    var saveTo = document.documentElement._buttons.cancel.parentNode.insertBefore(document.createElement("button"), document.documentElement._buttons.cancel);
	    var saveToMenu = saveTo.appendChild(document.createElement("menupopup"));
	        saveTo.classList.toggle("dialog-button");
	        saveTo.label = "\u4FDD\u5B58\u5230";
	        saveTo.type = "menu";
	    dir.forEach(function (dir) {
	    var [name, dir] = [dir[1], dir[0]];
	    var item = saveToMenu.appendChild(document.createElement("menuitem"));
	    	item.setAttribute("label", (name || (dir.match(/[^\\/]+$/) || [dir])[0]));
	    	item.setAttribute("image", "moz-icon:file:///" + dir + "\\");
	    	item.setAttribute("class", "menuitem-iconic");
	    	item.onclick = function(){
			var filename = (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value.trim() : document.querySelector("#location").value);
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			    file.initWithPath(dir + "\\" + filename);
			if (suffix)
				while(file.exists()){
                    let index = filename.match(/\((\d+)\)(?:\.[^\.]+)?$/);
                    if(index && index[1]){
                        filename = filename.replace(/\d+(?=\)(?:\.[^\.]+)?$)/, parseInt(index[1]) + 1);
                    }else{
                        filename = filename.replace(/(?=(\.[^\.]+)?$)/, "(1)");
                    }
                    file.initWithPath(dir + "\\" + filename);
                }
            else				
				if(file.exists()) file.createUnique(0,0644);
			    dialog.mLauncher.saveToDisk(file,1);
			    dialog.onCancel = function(){};
			    close();
		    };
	    })	
	}
		
	// 下载弹出窗口双击链接复制完整链接
	function download_dialog_showCompleteURL() {
	    var s = document.querySelector("#source");
        s.value = dialog.mLauncher.source.spec;
        s.setAttribute("crop", "center");
        s.setAttribute("tooltiptext", dialog.mLauncher.source.spec);
        s.setAttribute("ondblclick", 'Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)')
    }
	
	// 下载弹出窗口双击保存文件项执行下载
	function download_dialog_doubleclicksaveL() {
        addEventListener("dblclick", function (event) {
            event.target.nodeName === "radio" && document.documentElement.getButton("accept").click()
        }, false)
    }	
})();