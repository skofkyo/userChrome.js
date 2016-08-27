// ==UserScript==
// @name           tiebaNotification.uc.js
// @author         crab
// @description    贴吧消息提醒按钮
// @version        0.1
// ==/UserScript==

var tiebaNotification = {
	
	defaultPref : {
		"interval" : 5,
		"cookie" : null
	},
	
	xpPref:function(value){
		var Cc = Components.classes,
			Ci = Components.interfaces;
		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		if(arguments.length==0){
			return prefs.getComplexValue("UCJS.tiebaNotification", Ci.nsISupportsString).data;
		}else{
			var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			str.data = value;
			prefs.setComplexValue("UCJS.tiebaNotification", Ci.nsISupportsString, str);
			return value;
		}
	},

	getNotification: function(){
		var req = new XMLHttpRequest();
		var btntext = document.querySelector("#tiebaNotification-text"),
			btn = document.querySelector("#tiebaNotification-toolbar-button");
		var that = this;
		req.open("GET", 'http://message.tieba.baidu.com/i/msg/get_data', true);
		req.setRequestHeader("Cookie", JSON.parse(this.xpPref()).cookie);
		req.send(null);
		req.onload = function () {
			if (req.status == 200) {
				var n = req.responseText;
				if(!n) {
					btn.setAttribute("tooltiptext",'\u7F51\u7EDC\u9519\u8BEF\u6216\u6CA1\u6709\u767B\u5F55');
					btn.setAttribute("newMsg","false");
					btntext.setAttribute("value","");
					return;
				}
				n=n.match(/\[(.*)\]/)[1].split(',');
				var reply = n[3];
				var AtMe = n[8];
				var note='';
				if(reply!=0) note+='\u4F60\u6709' + n[3] + '\u4E2A\u65B0\u56DE\u590D'+ (AtMe ? "\n" : "");
				if(AtMe!=0) note+='\u6709'+n[8] + '\u4E2A@\u4F60'
				if(note){
					btn.setAttribute("tooltiptext", note);
					btntext.setAttribute("value", parseInt(n[3]) + parseInt(n[8]));
					btn.setAttribute("newMsg","true");
					var Cc = Components.classes,
						Ci = Components.interfaces;
					var alertsService=Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
					
					var listener = {
					  observe: function(subject, topic, data) {
							if(topic == "alertclickcallback"){
								var postData = Cc["@mozilla.org/network/mime-input-stream;1"].createInstance(Ci.nsIMIMEInputStream);
								postData.addHeader("Cookie", data);
								gBrowser.loadOneTab("http://tieba.baidu.com/i/sys/jump", null, null, postData, false, false);
							}
						}
					}
					
					alertsService.showAlertNotification("http://static.tieba.baidu.com/tb/favicon.ico","\u8D34\u5427\u4FE1\u606F\u63D0\u9192\uFF1A", note ,true,JSON.parse(that.xpPref()).cookie,listener,"");
				}else{
					btn.setAttribute("tooltiptext", "\u65E0\u8D34\u5427\u4FE1\u606F");
					btntext.setAttribute("value","");
					btn.setAttribute("newMsg","false");
				}
			}
		}
	},
	
	updateMsg:function(){
		var interval, that = this;
		try{
			interval = JSON.parse(this.xpPref()).interval;
		}catch(e){
			this.xpPref(JSON.stringify(this.defaultPref));
			interval = this.defaultPref.interval;
		}
		
		main();
		that.getNotification();
		
		function main() {
			var interval = JSON.parse(that.xpPref()).interval,
				cookie = JSON.parse(that.xpPref()).cookie;
			if(cookie == null) {
				var Cc = Components.classes,
					Ci = Components.interfaces;
				var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
				alertsService.showAlertNotification("http://static.tieba.baidu.com/tb/favicon.ico", "\u67E5\u8BE2\u9519\u8BEF\uFF01", "\u8BF7\u53F3\u952E\u6309\u94AE\u8BBE\u7F6ECookie\u3002", false, "", null, "");
			}else{
				that.getNotification();
			}
			clearTimeout(that.timeout);
			that.timeout = setTimeout(main, interval * 60 * 1000);
		}
	},
	
	createBtn: function () {
		var navigator = document.getElementById("navigator-toolbox");
		
		if (!navigator || navigator.palette.id !== "BrowserToolbarPalette") return;
		var btn = document.createElement("toolbarbutton");
		btn.id = "tiebaNotification-toolbar-button";
		btn.setAttribute("label", "\u8D34\u5427\u6D88\u606F\u63D0\u9192");
		btn.setAttribute("tooltiptext", "");
		btn.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional"); 
		btn.setAttribute("removable", "true");
		btn.setAttribute("onclick", 'if(event.button == 0)tiebaNotification.updateMsg();');
		navigator.palette.appendChild(btn);
		var stack = document.createElement("stack");
		stack.setAttribute("class", "toolbarbutton-icon");
		btn.appendChild(stack);
		var vbox1 = stack.appendChild(document.createElement("vbox"));
		var vbox2 = stack.appendChild(document.createElement("vbox"));
		var image = vbox1.appendChild(document.createElement("image"));
		var label = vbox2.appendChild(document.createElement("label"));
		image.id = "tiebaNotification-image";
		image.style.listStyleImage = 'url("http://static.tieba.baidu.com/tb/favicon.ico")';
		label.id = "tiebaNotification-text";
		label.setAttribute("value", "");
		
		var mainPopupSet = document.querySelector("#mainPopupSet");
		var menupopup = mainPopupSet.appendChild(document.createElement("menupopup"));
		
		btn.addEventListener("click", function (e) {
			if (e.button == 2) {
				e.preventDefault();
				menupopup.openPopup(this, "after_pointer", 0, 0, false, false);
			}
		}, false);
		
		
		
		var m1 = menupopup.appendChild(document.createElement("menuitem")); 
			m1.setAttribute("label","\u8BBE\u7F6E\u68C0\u6D4B\u5468\u671F");
		var m2 = menupopup.appendChild(document.createElement("menuitem"));
		    m2.setAttribute("label","\u8BBE\u7F6ECookie");
		
		var that = this;
		m1.onclick = function(){
			var interval = prompt("\u8BF7\u8F93\u5165\u68C0\u6D4B\u5468\u671F(\u5355\u4F4D\uFF1A\u5206\u949F\u3001\u5927\u4E8E0\u7684\u6574\u6570)", 
								JSON.parse(that.xpPref()).interval);
			if(interval == null && interval !="" || parseInt(interval) < 0) return;
			var perf = JSON.parse(that.xpPref());
				perf.interval = interval;
			that.xpPref(JSON.stringify(perf));
		}
		
		m2.onclick = function(){
			var cookie = prompt("\u8BF7\u8F93\u5165\u8981\u68C0\u6D4B\u8D26\u53F7\u7684Cookie\n>>Shift+Ctrl+K \u8F93\u5165alert(document.cookie);\u56DE\u8F66", 
			JSON.parse(that.xpPref()).cookie);
			if(cookie == null && cookie !=""|| cookie.indexOf("BAIDUID") ==  -1) return;
			var perf = JSON.parse(that.xpPref());
				perf.cookie = cookie;
			that.xpPref(JSON.stringify(perf));
		}
		
		var toolbars = document.querySelectorAll("toolbar");
		Array.slice(toolbars).forEach(function (toolbar) {
			var currentset = toolbar.getAttribute("currentset");
			if (currentset.split(",").indexOf("tiebaNotification-toolbar-button") < 0) return;
			toolbar.currentSet = currentset;
			try {
				BrowserToolboxCustomizeDone(true);
			} catch (ex) {
			}
		});
		
		function goUpdate(){
			if(document.querySelector("#nav-bar>#tiebaNotification-toolbar-button") 
				|| document.querySelector("#addon-bar>#tiebaNotification-toolbar-button")
				|| document.querySelector("#TabsToolbar>#tiebaNotification-toolbar-button")){
				that.updateMsg();
			}else{
				clearTimeout(that.timeout);
			}
		}
		
		window.addEventListener("aftercustomization", goUpdate, false)
		goUpdate();
		
		var cssStr = (function(){/*
			#tiebaNotification-image{padding-top:2px;}
			#tiebaNotification-toolbar-button[newMsg="true"] #tiebaNotification-image{
			margin-top:0px; margin-bottom:2px;}
			#tiebaNotification-toolbar-button[newMsg="true"] #tiebaNotification-text{
			border-radius:3px!important;
			box-shadow: 0 1px 0 rgba(255,255,255,.4) !important;
			padding:0 3px !important;
			color:#FFF;
			text-align:center;
			font: bold 9px Arial,Helvetica!important;
			height:11px!important;
			background:-moz-linear-gradient(top, #dd4f4f 0%, #e02424 100%)!important;
			text-shadow:none!important;
			margin-top:7px!important;
			margin-bottom:2px!important;
			margin-right:-3px!important;
			-moz-animation:bounceIn 2s 0s infinite;
			}
			@-moz-keyframes bounceIn {
				0%, 100% {-moz-transform: translateX(0);}
				10%, 30%, 50%, 70%, 90% {-moz-transform: translateX(-1px);}
				20%, 40%, 60%, 80% {-moz-transform: translateX(1px);}
			}
		*/}).toString().replace(/^.+\s|.+$/g,"");
		var style = document.createProcessingInstruction("xml-stylesheet", "type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
		var main = document.getElementById("main-window");
		document.insertBefore(style, main);
	}

}


tiebaNotification.createBtn();

