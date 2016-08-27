// ==UserScript==
// @name           NetEase Global Shortcut Keys
// @author         crab
// @include        main
// @description    网易云音乐浏览器全局快捷键：上/下一首(Ctrl + Shift + ←/→)，暂停/播放(Ctrl + Shift + Num0)
// @version        0.0.1
// ==/UserScript==

location == 'chrome://browser/content/browser.xul' && ({
	init: function(){
		messageManager.loadFrameScript('data:application/javascript;charset=UTF-8,'
		+ encodeURIComponent('('+(function(){
			addMessageListener('NeteaseShortcutKey', function(msg){
				let button = content.document.querySelector(({
					37: '.prv',
					39: '.nxt',
					48: '.ply',
					96: '.ply'
				})[msg.data.keyCode]);
				button && button.click();
			});
		}).toString() + ')();'), true);
		addEventListener('keydown', this, false);
	},
	sendMessage: function(code){
		for(let i = 0; i < gBrowser.browsers.length; i++){
			let browser = gBrowser.browsers[i];
			if(browser.documentURI.asciiHost === 'music.163.com'){
				if(browser === gBrowser.selectedBrowser && (code === 37 || code === 39))
					break;
				browser.messageManager.sendAsyncMessage('NeteaseShortcutKey', {
					keyCode: code
				});
				break;
			}
		}
	},
	handleEvent: function(event){
		if(event.type === 'keydown' && event.ctrlKey && event.altKey){
			switch(event.keyCode){
				case 37:
				case 39:
				case 48:
				case 96:
					this.sendMessage(event.keyCode);
					break;
			}
		}
	},
}).init();