// ==UserScript==
// @name           autoCopy.uc.js
// @namespace      ithinc#mozine.cn
// @description    AutoCopy with AutoPaste to search bar
// @include        main
// @exclude        chrome://browser/content/devtools/cssruleview.xul
// @compatibility  Firefox 3.0.x
// @author         ithinc
// @version        LastMod 2009/3/1 22:30 Initial release
// @Note           null
// ==/UserScript==

/* :::: AutoCopy with AutoPaste to search bar :::: */

(function() {
  var lastSelection = "";
  
  var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
  if(!prefs.getPrefType("userChrome.autocopy.autocopyState")) prefs.setIntPref("userChrome.autocopy.autocopyState", 2);

  function autocopyStart(e) {
    lastSelection = getBrowserSelection();
  }

  function autocopyStop(e) {
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    var autocopyState = prefs.getIntPref("userChrome.autocopy.autocopyState");
    var selection = getBrowserSelection();
	var targetName = e.target.nodeName.toUpperCase();
    if(autocopyState>0 && selection && selection!=lastSelection && 
       ["INPUT","TEXTAREA","TEXTBOX"].indexOf(targetName) == -1 && 
	   e.target.getAttribute("contenteditable") != "true") {
      goDoCommand('cmd_copy');

      /*×Ô¶¯Õ³Ìùµ½ËÑË÷À¸
      if(autocopyState>1) {
        var searchbar = document.getElementById('searchbar');
        searchbar.removeAttribute("empty");
        searchbar.value = selection;

        var evt = document.createEvent("Events");
        evt.initEvent("oninput", true, true);
        searchbar.dispatchEvent(evt);
      }*/
    }
  }

  gBrowser.mPanelContainer.addEventListener("mousedown", autocopyStart, false);
  gBrowser.mPanelContainer.addEventListener("mouseup", autocopyStop, false);

})();
