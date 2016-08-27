(function(){
	var cssStr = (function(){/*
	@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);

	@-moz-document url("chrome://browser/content/browser.xul") {

	#urlbar-icons > #addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-dropmarker {
		border-style: none !important;
		box-shadow: none !important;
		padding: 0 0 0 1px !important;
	}

	#urlbar-icons > * {
		padding: 0 3px !important;
	}

	#urlbar-icons > #addon-bar,
	#urlbar-icons > #addon-bar > #status-bar {
		-moz-appearance: none !important;
		height: 18px !important;
		min-height: 18px !important;
		border-style: none !important;
		background: transparent !important;
		-moz-box-align: center !important;
		padding: 0 !important;
		margin: 0 !important;
		box-shadow: none !important;
	}

	#urlbar-icons > #addon-bar > toolbaritem {
		-moz-box-align: center !important;
		-moz-box-pack: center !important;
	}

	#urlbar-icons > #addon-bar .toolbarbutton-1,
	#urlbar-icons > #addon-bar statusbarpanel,
	#urlbar-icons > #addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button {
		-moz-appearance: none !important;
		border-style: none !important;
		border-radius: 0 !important;
		padding: 0 3px !important;
		margin: 0 !important;
		background: transparent !important;
		box-shadow: none !important;
		-moz-box-align: center !important;
		-moz-box-pack: center !important;
	}

	#urlbar-icons > #addon-bar > .toolbarbutton-1,
	#urlbar-icons > #addon-bar > #status-bar > statusbarpanel {
		min-width: 18px !important;
		min-height: 18px !important;
	}

	#urlbar-icons > #addon-bar .toolbarbutton-1 > .toolbarbutton-icon,
	#urlbar-icons > #addon-bar > #status-bar > statusbarpanel > .statusbarpanel-icon {
		max-width: 18px !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	#urlbar-icons > #addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button,
	#urlbar-icons > #addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button > .toolbarbutton-icon {
		padding: 0 !important;
		margin: 0 !important;
	}

	#urlbar-icons > #addon-bar .toolbarbutton-1:not([disabled="true"]):hover,
	#urlbar-icons > #addon-bar .toolbarbutton-1:not([disabled="true"])[type="menu-button"]:hover,
	#urlbar-icons > #addon-bar .toolbarbutton-1:not([disabled="true"])[open="true"],
	#urlbar-icons > #addon-bar .toolbarbutton-1:not([disabled="true"])[type="menu-button"][open="true"],
	#urlbar-icons > #addon-bar > #status-bar statusbarpanel:not([disabled="true"]):hover,
	#urlbar-icons > #addon-bar > #status-bar statusbarpanel:not([disabled="true"])[open="true"] {
		background-image: -moz-linear-gradient(rgba(242, 245, 249, 0.95), rgba(220, 223, 225, 0.67) 49%, rgba(198, 204, 208, 0.65) 51%, rgba(194, 197, 201, 0.3)) !important;
	}

	#urlbar-icons > #addon-bar #addonbar-closebutton,
	#urlbar-icons > #addon-bar toolbarspring,
	#urlbar-icons > #addon-bar toolbarspacer,
	#urlbar-icons > #addon-bar toolbarseparator,
	#urlbar-icons > #addon-bar > #status-bar > .statusbar-resizerpanel {
		display: none !important;
	}

	}

	*/}).toString().replace(/^.+\s|.+$/,"");
	var style = document.createProcessingInstruction("xml-stylesheet", "title=\"url-addon-bar\" type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
	var main = document.getElementById("main-window");
	document.insertBefore(style, main);

	"use strict";

	var UrlAddonBar = {
		init: function () {
			if (this._loaded) return;
			this._loaded = true;
			let (addonBar = document.getElementById("addon-bar")) {
				if (!addonBar) return;
				if (addonBar.getAttribute("customizing") === "true") {
					window.addEventListener("aftercustomization", this, false);
				} else {
					this.toggle() && window.addEventListener("beforecustomization", this, true);
				}
			}
		},
		handleEvent: function (e) {
			switch (e.type) {
				case "beforecustomization" :
					window.addEventListener("aftercustomization", this, false);
					break;
				case "aftercustomization" :
					window.removeEventListener("aftercustomization", this, false);
					break;
			}
			this.toggle();
		},
		contains: function (otherNode) {
			if (!this instanceof Node || !otherNode instanceof Node) return false;
			return (this === otherNode) || !!(this.compareDocumentPosition(otherNode) & this.DOCUMENT_POSITION_CONTAINED_BY);
		},
		toggle: function () {
			let addonBar = document.getElementById("addon-bar");
			if (!addonBar) return false;
			if (this._isInUrlbar) {
				let browserBottombox = document.getElementById("browser-bottombox");
				if (this.contains.bind(browserBottombox)(addonBar)) return false;
				if (!browserBottombox) return false;
				browserBottombox.appendChild(addonBar);
				addonBar.setAttribute("toolboxid", "navigator-toolbox");
				addonBar.setAttribute("context", "toolbar-context-menu");
				this._isInUrlbar = false;
			} else {
				let urlbarIcons = document.getElementById("urlbar-icons");
				if (!urlbarIcons) return false;
				if (this.contains.bind(urlbarIcons)(addonBar)) return false;
				urlbarIcons.insertBefore(addonBar, urlbarIcons.firstChild);
				addonBar.removeAttribute("toolboxid");
				addonBar.removeAttribute("context");
				this._isInUrlbar = true;
			}
			return true;
		},
		uninit: function () {
			this._isInUrlbar = true;
			this.toggle();
			window.removeEventListener("beforecustomization", this, true);
			window.removeEventListener("aftercustomization", this, false);
		}
	};

	UrlAddonBar.init();
})();
