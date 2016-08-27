// ==UserScript==
// @name         YouKuVip.uc.js
// @description  启动时发送提速请求
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(function() {
	let menuitem = document.createElement('menuitem');
	menuitem.setAttribute('id', 'youkuvip');
	menuitem.setAttribute('label', '宽带提速');
	menuitem.setAttribute('tooltiptext', '优酷会员宽带提速');
	menuitem.setAttribute('oncommand', 'youkuvip();');
	let insPos = document.getElementById('devToolsSeparator');
	insPos.parentNode.insertBefore(menuitem, insPos);
})();
window.youkuvip = function() {
	function chage() {
		let xmlHttp = new XMLHttpRequest();
		xmlHttp.open('POST', 'http://vip.youku.com/?c=ajax&a=ajax_speedup_service_switch', true);
		xmlHttp.send({
			c: 'ajax',
			a: "ajax_speedup_service_switch"
		});
		xmlHttp.onload = function() {
			if (xmlHttp.status == 200) {
				let data = JSON.parse(xmlHttp.responseText)
				if (data.result.state == "2") {
					chage();
				} else {
					start();
				}
			}
		}
	};
	function start() {
		let xmlHttp = new XMLHttpRequest();
		let msg = Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification;
		xmlHttp.open('POST', 'http://vip.youku.com/?c=ajax&a=ajax_do_speed_up', true);
		xmlHttp.send({
			c: 'ajax',
			a: 'ajax_do_speed_up'
		});
		xmlHttp.onload = function() {
			let data = JSON.parse(xmlHttp.responseText)
			msg('', '优酷vip', data.msg, false, '', null)
		}
	};
	chage();
};