'use strict';
location == 'chrome://browser/content/browser.xul' && (function() {
	userChrome.loadOverlayDelayIncr = 0;
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
	let arrSubdir = new Array("SubScript", "ScriptPlus", "TestScript");
	let UCfiles = new Array;
	if (!Preferences.get('userChrome.disable.script')) {
		Preferences.set('userChrome.disable.script', "");
	};
	let disablescript = Preferences.get('userChrome.disable.script').split(',');
	for (let i = 0; i < arrSubdir.length; i++) {
		let workDir = ds.get('UChrm', Ci.nsILocalFile);
		UCfiles.push({
			folder: arrSubdir[i],
			file: []
		});
		workDir.append(arrSubdir[i]);
		let files = workDir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
		while (files.hasMoreElements()) {
			let file = files.getNext().QueryInterface(Ci.nsIFile);
			if (/\.uc\.(js|xul)$/i.test(file.leafName)) {
				UCfiles[i].file.push({
					scriptname: file.leafName,
					scriptpath: file.path
				});
				if (disablescript.indexOf(file.leafName) == -1) {
					userChrome.import(arrSubdir[i] + '/' + file.leafName, 'UChrm');
				}
			}
		}
	};
	window.userChrome_js = {
		UCfiles: UCfiles,
		disablescript: disablescript,
	};
	userChrome.import('UCManager.uc.js', 'UChrm');
})();