// ==UserScript==
// @name         redirect
// @description  简单的重定向
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	let {WebRequest} = Cu.import("resource://gre/modules/WebRequest.jsm", {});
	Cu.import("resource://gre/modules/MatchPattern.jsm");
	let pattern = new MatchPattern("http://imgsrc.baidu.com/forum/w%3D580/*");
	WebRequest.onBeforeSendHeaders.addListener(redirect, {urls: pattern}, ["blocking"]);
	function redirect(e) {
		let url = "http://imgsrc.baidu.com/forum/pic/item/" + e.url.match(/([a-z0-9]{15,})\.[a-zA-Z]{3,}$/)[0];
		return {redirectUrl: url};
	}
	let pattern2 = new MatchPattern('https://sourceforge.net/projects/*/download');
	WebRequest.onBeforeSendHeaders.addListener(redirect2, {urls: pattern2}, ["blocking"]);
	function redirect2(e) {
		let url = e.url.replace(/^https?:\/\/sourceforge\.net\/projects\/(((\w)\w).*)\/files\/(.*)\/download/i, "http://master.dl.sourceforge.net/project/$1/$4");
		return {redirectUrl: url};
	}
})();