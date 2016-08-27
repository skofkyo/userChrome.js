// ==UserScript==
// @name           downloadSoundPlay.uc
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードマネージャー用のダウンロードを監視し音を鳴らす
// @include        main
// @compatibility  Firefox 26+
// @author         Alice0775
// @version        2009/11/28
// ==/UserScript==
(function(){
Components.utils.import("resource://gre/modules/Downloads.jsm");
var downloadPlaySound = {
  // -- config --
  DL_START : "",
  DL_DONE  : "file:///C:/WINDOWS/Media/chimes.wav",
  DL_CANCEL: "",
  DL_FAILED: "",
  // -- config --

  _list: null,

  init: function sampleDownload_init() {
    window.addEventListener("unload", this, false);

    //**** ダウンロード監視の追加
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

  onDownloadChanged: function(dl){
    if(dl.succeeded){
      this.playSoundFile(this.DL_DONE);
    }
    if(dl.canceled){
      this.playSoundFile(this.DL_CANCEL);
    }
    if(dl.error!=null){
      this.playSoundFile(this.DL_FAILED);
    }
  },

  onDownloadAdded:  function(dl){
    this.playSoundFile(this.DL_START);
  },

  playSoundFile: function(aFilePath) {
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
})();