// ==UserScript==
// @name                 ProfDbutton.uc.js
// @description       開啟使用者設定資料夾
// @author               skofkyo
// @license               MIT License
// @compatibility    Firefox 29+
// @charset              UTF-8
// @version              2014.12.26        
// @include              main
// @include              chrome://browser/content/browser.xul
// ==/UserScript==
(function() {

	CustomizableUI.createWidget({
		id: "ProfD-button",
		type: 'custom',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		onBuild: function(aDocument) {
			var toolbarbutton = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
			var props = {
				id: "ProfD-button",
				class: "toolbarbutton-1 chromeclass-toolbar-additional",
				label: "使用者設定資料夾",
				tooltiptext: "左鍵：打開Profile資料夾\n中鍵：打開extensions資料夾\n右鍵：打開chrome資料夾",
				removable: "true",
				overflows: "false",
				type: 'button',
				style: "list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABMklEQVQ4jb2SsWoCQRCGt1BCiCSFhb7HwqVdOOPufDvP4APkVbRJYW1rY5XAvUAQEcHSOk06tUipkDSnXI4zZ5WBHwZ2/m9nhjGmFCJyE0J4VtUNcIgxfgFZv99/LNdWhnOuBexU9bsoYOeca9UCQgjDsvmkEMKwFgCsLwGA9b8AXv4AvNQCnHPdGOOxbI4xHp1z3VpA3sW44vfxVWZjjEmSpF0GJEnSvhrQ6/UeVHVeAMxrTdbapvd+ICJLILPWNoEZMMvzDHj33g+stc1f5k6ncwfMCvNujTG3wAJY5Pn29C4iryJyfwYAb+WZ0zRVYAJM0jTViqVmZ4Cq7isKVjHGTYxxA6wq7mJ/BojIFDhcOqAKHVV1WlxDA3gSkVG+xI+Kjj5FZCkiI+99cM41jDHmB/Xe+MttdkMPAAAAAElFTkSuQmCC)",
				onclick: 'ProfD.onClick(event);',
				context: '_child',
			};
			for (var p in props) {
				toolbarbutton.setAttribute(p, props[p]);
			};
			return toolbarbutton;
		}
	});

	ProfD = {
		onClick: function(event) {
			switch (event.button) {
				case 0:
					Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).launch();
					break;
				case 1:
					var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile);
					file.append("extensions");
					file.launch();
					break;
				case 2:
					Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).launch();
					break;
			}
		}
	}

})();