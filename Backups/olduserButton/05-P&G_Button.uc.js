// ==UserScript==
// @name                 P&G_Button.uc.js
// @description       貼上就瀏覽&貼上就搜索
// @author               skofkyo
// @license               MIT License
// @compatibility    Firefox 29+
// @charset              UTF-8
// @version              2014.12.26                 
// @include              main
// @include              chrome://browser/content/browser.xul
// ==/UserScript==

/* :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 貼上就瀏覽&貼上就搜索 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */
/*
(function() {

	CustomizableUI.createWidget({
		id: "RFC-button",
		type: 'custom',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		onBuild: function(aDocument) {
			var toolbarbutton = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			var props = {
				id: "RFC-button",
				class: "toolbarbutton-1 chromeclass-toolbar-additional",
				label: "貼上就瀏覽",
				tooltiptext: "左鍵：貼上就瀏覽(新分頁背景)\n中鍵：貼上就瀏覽(新分頁前景)\n右鍵：貼上就瀏覽",
				removable: "true",
				overflows: "false",
				type: 'button',
				style: "list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANYSURBVDhPbZFbTJNnHMa/C8VtVaCODqW0CP360RpRYdMOQdBWsdATbW1HOZWWQjm02HKQU1eGpMREIigajZqQoHFkGhHjIQo74IiGhAESpRovuqvdbAlZsmUhIo/v92nILnyTX96b//N7n/xfar+YWqeVUp8QeFqa4ukkFC9TnshLFgsDX8THT4oShef2pEk3qpkono7M6BiClPqUsD46ivr4sZcWXa9yVf5RUlr2r8NR8WeL3zMnEMQxH5225Sb1eHXMAmEp4MpbGhn5fml+fn45HA6/XVx8sRoOL7599erlytjY7b97jlmX2DnCa8JwXPQGMWVXJT/pKd7+5mSpHCec+xEIBODz+eD1etdQN0jh8FgRrFKjr0yGfrt8pcUs/0cQsyGNFcy1HZWj2ZSKGo0MlsMZMCp3ovBg2hrK1k3QdO6CQilFnYZGszEV9VopSIPdnIDY0GSSwWdIRZ32PS61FBWHJbAfkkB/QojTE24U9WfjQEkSnEdo+AtlrCBjTdBMBBxEpq3l44grFipHNDING1EYEmHwqROhnw3wXFMhtzgBbtJg86YoBSdgQ2yDdtuXHPruRFyebMX5n/wY/NGLwckahKY0cI9vRd9verTdLsCh6kTwhevd7wUk3GiUIejIQdCZC2MoCecn6+G9kUFIR90YA8edzXCNx8DzRIBTC2oE72uhahFFOEETCfsLU7kwiym0DZemmtA8mo2m0Swcv/c16h+kwPUoBrW/8tE4LcLArAUNV5WrnIANHyMLDHxoYOpNwfD0twje0yB4twBdD/PQMZGJmodbUDURi94ZFboeaKHsTF/mBD4i8OoZdJRncw3MvTTuPruI0bkBjM7249ZcP4Znj6P7FyVOPTVzO8hpVSBaLr3CCdjXPVoGjZZ0bol7S2goylOw9wO2vh248/wMhqbb0faDFQp/DmzlJvD5sXmcoIG8XltAo4YlXwJ3PgNjVhLUX4m42xKicXPmDDxDR7GvRQ17ZTFOt5chPi6G+8bHDTpmuY6Ea/NZAU0ENMz7RNDsSYAlW4y8zs9RMZCPXZXFq+WVtuWznXZc6HIiIZ6fQZmzRB3VaskUIfJ/iCCiVwgj3+SIIwerP/svy2pYMRh1f33nMf8e8lkjLFsFsdvfARA31F/rldguAAAAAElFTkSuQmCC)",
				onclick: 'RFC.onClick(event);',
				context: '_child',
			};
			for (var p in props) {
				toolbarbutton.setAttribute(p, props[p]);
			};
			return toolbarbutton;
		}
	});

	RFC = {
		onClick: function(event) {
			switch (event.button) {
				case 0:
					gBrowser.addTab(readFromClipboard());
					break;
				case 1:
					gBrowser.selectedTab = gBrowser.addTab(readFromClipboard());
					break;
				case 2:
					loadURI(readFromClipboard());
					break;
			}
		}
	}

})();
*/

(function() {

	CustomizableUI.createWidget({
		id: "searchClipboard-button",
		type: 'custom',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		onBuild: function(aDocument) {
			var toolbarbutton = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			var props = {
				id: "searchClipboard-button",
				class: "toolbarbutton-1 chromeclass-toolbar-additional",
				label: "貼上就搜索",
				tooltiptext: "左鍵：Google搜索剪貼簿文字如果是網址的話直接開啟\n中鍵：Google翻譯剪貼簿文字\n右鍵：Google站內搜索選取文字否則搜索剪貼簿文字",
				removable: "true",
				overflows: "false",
				type: 'button',
				style: "list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANGSURBVDhPbZJrTFJhHMbPh66jy1bZzUsX5ACVtXXbXLlWDdEE77YsnICABxIFBW8RE3DaulmKpimGXa1mabOs7GJXc9lilRL1QavVl9ZcrT5U2tN7qNVsne335ez//z3Pe85LRYRQYyQ8agKBIwmlOFIuxQkXBnEWhARaZs6adSs4KNC5Kow3KYoex5GSGSlN4FETCWOnjKP+/6TLtpxUqzLebZOlfVEo5O/NxqzHAQEz6P9Op66b59BL6SeEIYsqcqi5+dSQx+P56vV6R/r7+354vf0jPt/z4ba21o+OnM1D7BzhJeHojCnjQ6j0jQvuO7Yu+r5LJoRdGQGLxQKDwQC9Xj8Km82GUm0M9qYJUJEuHDYnCT8HTB0fxgoeFyYLYUrkg4kRIEW0HAkbliJ+fdgoUiJXQB2zGLlxNEwJfGyX8EAaLPMLiA15iQIY4vjQSQhSIQo18Th9rAEdV66h/UIb9tlNYBJWQCXmgonmITdBANLgr8BEBH6SFsFZZkbLlR7sdnfi0JkulLsuoeL4DVzvvApD6lp/EBv6R2D63SCPWK1MLNqu9aDm9HW8GHiDZ74B3Ot9isqmC3AcvojWsydgTl7yj4Aks5WM8QI01uyGnQzefODBg0dPcKe7F503b6OsygWN9RDukPdWtXi0gE02xvP91c6ccKOosgXnO26gtf0yzp07j+qaamTlmpFZuAeXunqxp0iJcl0k5kyf/OsbsMs5ZDk7lkb9wVJy5g4UOvajwFICRqMAo0iBdrsOTHEF7nY/hNOmRZ0tA0Gzp/0SGIhAT5bJ5UCBQoR7PR6odjixVclAti0VjDoNmpwCuFpuwVVbidqSjNECNj1LQvv/rS6GB0eeHN0PPdjn7kBeuQslVc1o73qEvr4+NDW5UWxUwWlV/m3AVtduCgXDEs1FZhQX8rhw2IoMcNfXoPZAGTSbN4KRxY643UdQV1cHS342Vi1fJmaPcDtbSn/VkWVtNCsIRSYhMTwY0SvnInHtfMjFfKSLQrFTLf6SrUz61tBQj8bGRtjt9kEqaU1wsSaKe5cwwEJu2qBStHBQujrwVVwE/bY0X/PBVVX+yWqUf9BtWf82XyV9rUgWvT+wf++wz+fDT0mU+xExjL1SAAAAAElFTkSuQmCC)",
				onclick: 'searchClipboard.onClick(event);',
				context: '_child',
			};
			for (var p in props) {
				toolbarbutton.setAttribute(p, props[p]);
			};
			return toolbarbutton;
		}
	});

	searchClipboard = {
		onClick: function(event) {
			switch (event.button) {
				case 0:
					//let url = readFromClipboard();
					//if (!/^(https?:\/\/)?([\w\-]+\.)+\w+/.test(url))
					//	url = 'https://www.google.com.tw/search?q='+ encodeURIComponent(url);
					//openUILinkIn(url, 'tab');
					let url = readFromClipboard();
					try {
						switchToTabHavingURI(url, true);
					} catch (ex) {
						url = 'https://www.google.com.tw/search?q='+ encodeURIComponent(url);
						switchToTabHavingURI(url, true);
					}
					break;
				case 1:
					openUILinkIn("https://translate.google.com.tw/?hl=zh-TW#auto|zh-TW|" + encodeURIComponent(readFromClipboard()), 'tab');
					break;
				case 2:
					var selection = content.document.getSelection().toString();
					var gbs = getBrowserSelection();
					if (selection || gbs) {
						loadURI("https://www.google.com.tw/search?q=" + "site:" + content.location.host + " " + encodeURIComponent(selection || gbs));
					} else {
						loadURI("https://www.google.com.tw/search?q=" + "site:" + content.location.host + " " + encodeURIComponent(readFromClipboard()));
					}
					break;
			}
		}
	}

})();
