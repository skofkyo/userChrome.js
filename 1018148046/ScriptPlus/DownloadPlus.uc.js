// ==UserScript==
// @name         DownloadPlus
// @description  增强下载功能
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset              UTF-8
// ==/UserScript==
(function() {
	'use strict';
	//右键下载按钮新建下载
	if (!document.getElementById('downloads-button')) {
		return
	} else {
		document.getElementById('downloads-button').setAttribute('tooltiptext', '右键:新建下载');
		document.getElementById('downloads-button').addEventListener('click', function(e) {
			if (e.button == 2) {
				window.openDialog('data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KCTxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KCQk8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KCQk8dGV4dGJveCBmbGV4PSIxIi8+Cgk8L2hib3g+Cgk8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+Cgk8aGJveCBkaXI9InJldmVyc2UiPgoJCTxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgoJPC9oYm94PgoJPHNjcmlwdD4KCQk8IVtDREFUQVsKCQlmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CgkJCXZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKCQkJaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CgkJCQlmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CgkJCQkJdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwoJCQkJfQoJCQkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKCQkJfSBlbHNlIHsKCQkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKCQkJfQoJCX0KCQl2YXIgb3duZXIgPSB3aW5kb3cub3BlbmVyOwoJCXdoaWxlKG93bmVyLm9wZW5lciAmJiBvd25lci5sb2NhdGlvbiAhPSAiY2hyb21lOi8vYnJvd3Nlci9jb250ZW50L2Jyb3dzZXIueHVsIil7CgkJCW93bmVyID0gb3duZXIub3BlbmVyOwoJCX0KdmFyIG1haW53aW4gPSBDb21wb25lbnRzLmNsYXNzZXNbIkBtb3ppbGxhLm9yZy9hcHBzaGVsbC93aW5kb3ctbWVkaWF0b3I7MSJdLmdldFNlcnZpY2UoQ29tcG9uZW50cy5pbnRlcmZhY2VzLm5zSVdpbmRvd01lZGlhdG9yKS5nZXRNb3N0UmVjZW50V2luZG93KCJuYXZpZ2F0b3I6YnJvd3NlciIpOwkJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIFBhcnNlVVJMcywgZmFsc2UpOwoJCWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoImJ1dHRvbiIpLmFkZEV2ZW50TGlzdGVuZXIoImNvbW1hbmQiLCBmdW5jdGlvbiAoKSB7CQlkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewoJCQkJb3duZXIuc2F2ZVVSTCh1cmwgLCBudWxsLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCBtYWlud2luLmRvY3VtZW50KTsKCQkJfSk7CgkJCWNsb3NlKCkKCQl9LCBmYWxzZSk7CgkJZG9jdW1lbnQucXVlcnlTZWxlY3RvcigidGV4dGJveCIpLnZhbHVlID0gb3duZXIucmVhZEZyb21DbGlwYm9hcmQoKTsKCQlQYXJzZVVSTHMoKTsKCQldXT4KCTwvc2NyaXB0Pgo8L3dpbmRvdz4=', 'name', 'top=' + (window.screenY + window.innerHeight / 4 - 50) + ',left=' + (window.screenX + window.innerWidth / 2 - 250));
				e.stopPropagation();
				e.preventDefault();
			}
		}, false)
	};
	//下载完成提示音
	let downloadPlaySound = {
		// -- config --
		DL_START: null,
		DL_DONE: 'file:///C:/WINDOWS/Media/chimes.wav',
		DL_CANCEL: null,
		DL_FAILED: null,
		// -- config --
		_list: null,
		init: function sampleDownload_init() {
			XPCOMUtils.defineLazyModuleGetter(window, 'Downloads', 'resource://gre/modules/Downloads.jsm');
			//window.removeEventListener("load", this, false);
			window.addEventListener('unload', this, false);
			//**** ダウンロード監視の追加
			if (!this._list) {
				Downloads.getList(Downloads.ALL).then(list => {
					this._list = list;
					return this._list.addView(this);
				}).then(null, Cu.reportError);
			}
		},
		uninit: function() {
			window.removeEventListener('unload', this, false);
			if (this._list) {
				this._list.removeView(this);
			}
		},
		onDownloadAdded: function(aDownload) {
			//**** ダウンロード開始イベント
			if (this.DL_START) this.playSoundFile(this.DL_START);
		},
		onDownloadChanged: function(aDownload) {
			//**** ダウンロードキャンセル
			if (aDownload.canceled && this.DL_CANCEL) this.playSoundFile(this.DL_CANCEL) //**** ダウンロード失敗
			if (aDownload.error && this.DL_FAILED) this.playSoundFile(this.DL_FAILED) //**** ダウンロード完了
			if (typeof aDownload.downloadPlaySound == 'undefined' && aDownload.succeeded && aDownload.stopped && this.DL_DONE) {
				aDownload.downloadPlaySound = true;
				this.playSoundFile(this.DL_DONE);
			}
		},
		playSoundFile: function(aFilePath) {
			if (!aFilePath) return;
			let ios = Components.classes['@mozilla.org/network/io-service;1'].createInstance(Components.interfaces['nsIIOService']);
			try {
				var uri = ios.newURI(aFilePath, 'UTF-8', null);
			} catch (e) {
				return;
			}
			let file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
			if (!file.exists()) return;
			this.play(uri);
		},
		play: function(aUri) {
			let sound = Components.classes['@mozilla.org/sound;1'].createInstance(Components.interfaces['nsISound']);
			sound.play(aUri);
		},
		handleEvent: function(event) {
			switch (event.type) {
			case 'unload':
				this.uninit();
				break;
			}
		}
	}
	downloadPlaySound.init();
})();