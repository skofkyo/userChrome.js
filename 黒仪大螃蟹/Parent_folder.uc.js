// ==UserScript==
// @name       Go Parent Folder
// @version   2.7
// @include    chrome://browser/content/places/places.xul
// @include    chrome://browser/content/bookmarks/bookmarksPanel.xul
// ==/UserScript==



//到上层文件夹 
var lang = (document.getElementById("placesContext_delete").label == "Delete");
var goParentFolder = {
	_placesContext: null,
	get placesContext() {
		if (!this._placesContext) this._placesContext = document.getElementById('placesContext');
		return this._placesContext;
	},
	
	showAll: false, //选择所有相关书签（仅在侧栏有效）
	disableSelectFolder: true, //禁用在侧栏选择上层文件夹
	
	handleEvent: function (aEvent) {
		switch (aEvent.type) {
			case 'load':
				this.init();
				break;
			case 'unload':
				this.unload();
				break;
			case 'popupshowing':
				this.popupshowing(aEvent);
				break;
		}
	},
	init: function () {
		var langStr = lang ? "Go Parent Folder" : "\u5230\u4E0A\u5C42\u6587\u4EF6\u5939";
		if(location == "chrome://browser/content/places/places.xul"){
		var overlay = '\
				<overlay id="goParentFolderOverlay"\
					 xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">">\
				<commandset id="placesCommands">\
					<command id="placesCmd_goParentFolder" oncommand="goParentFolder.openParentFolder();" />\
				</commandset>\
				<keyset id="placesOrganizerKeyset">\
					<key id="key_placesCmd_goParentFolder" command="placesCmd_goParentFolder" keycode="VK_F1" modifiers="accel"/>\
				</keyset>\
				<keyset id="mainKeyset">\
					<key id="key_placesCmd_goParentFolder" command="placesCmd_goParentFolder" keycode="VK_F1" modifiers="accel"/>\
				</keyset>\
				<popup id="placesContext">\
					<menuitem id="placesContext_goParentFolder"\
							  command="placesCmd_goParentFolder"\
							  label="'+ langStr +'"\
							  key="key_placesCmd_goParentFolder"\
							  accesskey="G"\
							  insertafter="placesContext_sortSeparator"\
							  selectiontype="single"\
							  selection="bookmark"\
							  forcehideselection="livemarkChild|livemark/feedURI|PlacesOrganizer/OrganizerQuery" />\
				</popup>\
			</overlay>';
		overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
		window.userChrome_js.loadOverlay(overlay, null);
		}else{
			var mu = document.getElementById("placesContext").appendChild(document.createElement("menuitem"));
			mu.id="placesContext_goParentFolder";
			mu.setAttribute("selectiontype","single");
			mu.setAttribute("oncommand","goParentFolder.openParentFolder()");
			mu.setAttribute("selection","bookmark");
			mu.setAttribute("forcehideselection","livemarkChild|livemark/feedURI|PlacesOrganizer/OrganizerQuery");
			mu.setAttribute("label",langStr);
		}
		window.removeEventListener('load', this, false);
		window.addEventListener('unload', this, false);
		this.placesContext.addEventListener('popupshowing', this, true);
	},
	unload: function () {
		this.placesContext.removeEventListener('popupshowing', this, true);
		window.removeEventListener('unload', this, false);
	},
	//hide the menuitem if the context is in the menu-bar and bookmarks-toolbar
	popupshowing: function (aEvent) {
		var view = PlacesUIUtils.getViewForNode(document.popupNode);
		//this.debug(view.localName);
		if (!/tree/i.test(view.localName)) {
			var node = document.getElementById('placesContext_goParentFolder');
			node.hidden = true;
		}
	},
	openParentFolder: function () {
		var view;
		if (!document.popupNode) {
			view = document.commandDispatcher.focusedElement;
		} else {
			view = PlacesUIUtils.getViewForNode(document.popupNode); // XULElement
		}
		if (!view || view.getAttribute("type") != "places") return;
		var node = view.selectedNode; // nsINavHistoryResultNode
		var aItemId = node.itemId;
		var aFolderItemId = goParentFolder.getParentFolderByItemId(aItemId);
		if (aFolderItemId) goParentFolder.selectFolderByItemId(view, aFolderItemId, aItemId);
	},
	getParentFolderByItemId: function (aItemId) {
		var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Components.interfaces.nsINavBookmarksService);
		var parentFolderId = bmsvc.getFolderIdForItem(aItemId);
		return parentFolderId;
	},
	selectFolderByItemId: function (view, aFolderItemId, aItemId) {
		//Library
		if (view.getAttribute("id") == "placeContent") {
			view = document.getElementById("placesList");
			//Select a folder node in folder pane
			view.selectItems([aFolderItemId]);
			if (view.currentIndex) view.treeBoxObject.ensureRowIsVisible(view.currentIndex);
			//Reselect child node
			setTimeout(function (aItemId, view) {
				var aView = view.ownerDocument.getElementById("placeContent");
				aView.selectItems([aItemId]);
				if (aView.currentIndex) aView.treeBoxObject.ensureRowIsVisible(aView.currentIndex);
				//Focus folder pane
				//view.focus();
			}, 0, aItemId, view);
			return;
		}
		//Bookmarks Sidebar
		//var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		//getService(Components.interfaces.nsIPrefBranch);
		//var showAll = prefs.getBoolPref('extensions.goParentFolder.showAll');
		//var disableSelectFolder = prefs.getBoolPref('extensions.goParentFolder.disableSelectFolder');
		var showAll = this.showAll;
		var disableSelectFolder = this.disableSelectFolder;
		if (!view) return;
		view.place = view.place;
		if ('FlatBookmarksOverlay' in window) {
			var sidebarwin = view.ownerDocument.defaultView;
			var searchBox = sidebarwin.document.getElementById("search-box");
			searchBox.value = "";
			searchBox.doCommand();
			sidebarwin.FlatBookmarks._setTreePlace(sidebarwin.FlatBookmarks._makePlaceForFolder(aFolderItemId));
			view.selectItems([aItemId]);
			var tbo = view.treeBoxObject;
			tbo.ensureRowIsVisible(view.currentIndex);
			view.focus();
			return;
		}
		if (showAll) {
			view.selectItems2 = function (aIDs) {
				var ids = aIDs; // don't manipulate the caller's array
				// Array of nodes found by findNodes which are to be selected
				var nodes = [];
				// Array of nodes found by findNodes which should be opened
				var nodesToOpen = [];
				// A set of URIs of container-nodes that were previously searched,
				// and thus shouldn't be searched again. This is empty at the initial
				// start of the recursion and gets filled in as the recursion
				// progresses.
				var nodesURIChecked = [];
				/**
				 * Recursively search through a node's children for items
				 * with the given IDs. When a matching item is found, remove its ID
				 * from the IDs array, and add the found node to the nodes dictionary.
				 *
				 * NOTE: This method will leave open any node that had matching items
				 * in its subtree.
				 */
				function findNodes(node) {
					var foundOne = false;
					// See if node matches an ID we wanted; add to results.
					// For simple folder queries, check both itemId and the concrete
					// item id.
					var index = ids.indexOf(node.itemId);
					if (index == -1 && node.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER_SHORTCUT) {
						if (typeof asQuery == 'function') index = ids.indexOf(asQuery(node).folderItemId);
						else index = ids.indexOf(PlacesUtils.asQuery(node).folderItemId); //xxx Bug 556739 3.7a5pre
					}
					if (index != -1) {
						nodes.push(node);
						foundOne = true;
						if (!showAll) ids.splice(index, 1);
					}
					if (ids.length == 0 || !PlacesUtils.nodeIsContainer(node) || nodesURIChecked.indexOf(node.uri) != -1) return foundOne;
					nodesURIChecked.push(node.uri);
					if (typeof asContainer == 'function') asContainer(node);
					else PlacesUtils.asContainer(node); //xxx Bug 556739 3.7a6pre
					// Remember the beginning state so that we can re-close
					// this node if we don't find any additional results here.
					var previousOpenness = node.containerOpen;
					node.containerOpen = true;
					for (var child = 0; child < node.childCount && ids.length > 0;
					child++) {
						var childNode = node.getChild(child);
						var found = findNodes(childNode);
						if (!foundOne) foundOne = found;
					}
					// If we didn't find any additional matches in this node's
					// subtree, revert the node to its previous openness.
					if (foundOne) nodesToOpen.unshift(node);
					node.containerOpen = previousOpenness;
					return foundOne;
				} //findNodes
				/*
        // Null the viewer while looking for nodes
        var result = this.result;
        var oldViewer = result.viewer;
        result.viewer = null;
        findNodes(this.result.root);
        result.viewer = oldViewer;
*/
				// Disable notifications while looking for nodes.
				let result = this.result;
				let didSuppressNotifications = result.suppressNotifications;
				if (!didSuppressNotifications) result.suppressNotifications = true
				try {
					findNodes(this.result.root);
				} finally {
					if (!didSuppressNotifications) result.suppressNotifications = false;
				}
				// For all the nodes we've found, highlight the corresponding
				// index in the tree.
				var resultview = this.view;
				//var resultview = this.getResultView();
				var selection = this.view.selection;
				selection.selectEventsSuppressed = true;
				selection.clearSelection();
				// Open nodes containing found items
				for (var i = 0; i < nodesToOpen.length; i++) {
					nodesToOpen[i].containerOpen = true;
				}
				for (var i = 0; i < nodes.length; i++) {
					if (disableSelectFolder) {
						if (PlacesUtils.nodeIsContainer(nodes[i])) continue;
					}
					var index = resultview.treeIndexForNode(nodes[i]);
					selection.rangedSelect(index, index, true);
				}
				selection.selectEventsSuppressed = false;
			}; //selectItems2
			view.selectItems2([aFolderItemId, aItemId]);
		} else {
			view.findNode = function flatChildNodes(node, aIDs) {
				var ids = aIDs; // don't manipulate the caller's array
				// Array of nodes found by findNodes which are to be selected
				var nodes = [];
				// Array of nodes found by findNodes which should be opened
				var nodesToOpen = [];
				// A set of URIs of container-nodes that were previously searched,
				// and thus shouldn't be searched again. This is empty at the initial
				// start of the recursion and gets filled in as the recursion
				// progresses.
				var nodesURIChecked = [];
				/**
				 * Recursively search through a node's children for items
				 * with the given IDs. When a matching item is found, remove its ID
				 * from the IDs array, and add the found node to the nodes dictionary.
				 *
				 * NOTE: This method will leave open any node that had matching items
				 * in its subtree.
				 */
				function findNodes(node) {
					var foundOne = false;
					// See if node matches an ID we wanted; add to results.
					// For simple folder queries, check both itemId and the concrete
					// item id.
					var index = ids.indexOf(node.itemId);
					if (index == -1 && node.type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER_SHORTCUT) {
						if (typeof asQuery == 'function') index = ids.indexOf(asQuery(node).folderItemId);
						else index = ids.indexOf(PlacesUtils.asQuery(node).folderItemId); //xxx Bug 556739 3.7a5pre
					}
					if (index != -1) {
						nodes.push(node);
						foundOne = true;
						ids.splice(index, 1);
					}
					if (ids.length == 0 || !PlacesUtils.nodeIsContainer(node) || nodesURIChecked.indexOf(node.uri) != -1) return foundOne;
					nodesURIChecked.push(node.uri);
					if (typeof asContainer == 'function') asContainer(node);
					else PlacesUtils.asContainer(node); //xxx Bug 556739 3.7a6pre
					// Remember the beginning state so that we can re-close
					// this node if we don't find any additional results here.
					var previousOpenness = node.containerOpen;
					node.containerOpen = true;
					for (var child = 0; child < node.childCount && ids.length > 0;
					child++) {
						var childNode = node.getChild(child);
						if ( /*PlacesUtils.nodeIsLivemarkContainer(childNode) ||*/
						PlacesUtils.nodeIsQuery(childNode)) continue;
						var found = findNodes(childNode);
						if (!foundOne) foundOne = found;
					}
					// If we didn't find any additional matches in this node's
					// subtree, revert the node to its previous openness.
					if (foundOne) nodesToOpen.unshift(node);
					node.containerOpen = previousOpenness;
					return foundOne;
				} //findNodes
				/*
        // Null the viewer while looking for nodes
        var result = this.result;
        var oldViewer = result.viewer;
        result.viewer = null;
        findNodes(node);
        result.viewer = oldViewer;
*/
				// Disable notifications while looking for nodes.
				let result = this.result;
				let didSuppressNotifications = result.suppressNotifications;
				if (!didSuppressNotifications) result.suppressNotifications = true
				try {
					findNodes(this.result.root);
				} finally {
					if (!didSuppressNotifications) result.suppressNotifications = false;
				}
				// Open nodes containing found items
				for (var i = 0; i < nodesToOpen.length; i++) {
					nodesToOpen[i].containerOpen = true;
				}
				return nodes;
			}; //findNode
			// For all the nodes we've found, highlight the corresponding
			// index in the tree.
			var resultview = view.view;
			//var resultview = view.getResultView();
			var selection = view.view.selection;
			selection.selectEventsSuppressed = true;
			selection.clearSelection();
			var nodes = view.findNode(view.result.root, [aFolderItemId]);
			if (nodes.length > 0) {
				var index = resultview.treeIndexForNode(nodes[0]);
				if (!disableSelectFolder) {
					selection.rangedSelect(index, index, true);
				}
				nodes = view.findNode(nodes[0], [aItemId]);
				if (nodes.length > 0) {
					index = resultview.treeIndexForNode(nodes[0]);
					selection.rangedSelect(index, index, true);
				}
			}
			selection.selectEventsSuppressed = false;
		} //if
		var tbo = view.treeBoxObject;
		tbo.ensureRowIsVisible(view.currentIndex);
		view.focus();
		return;
	},
	debug: function (aMsg) {
		const Cc = Components.classes;
		const Ci = Components.interfaces;
		Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService)
			.logStringMessage(aMsg);
	}
}
window.addEventListener('load', goParentFolder, false);
goParentFolder.init();

if(location == "chrome://browser/content/places/places.xul"){
var showparentfolder = {
	init: function () {
		var langStr = lang ? "Parent Folder" : "\u7236\u6587\u4EF6\u5939";
		var overlay = '\
			<overlay id="showparentfolderOverlay"\
				xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
			<treecols id="placeContentColumns">\
				<splitter class="tree-splitter"/>\
				<treecol label="'+ langStr +'" id="placesContentParentFolder" anonid="parentFolder" flex="1" hidden="true"\
						 persist="width hidden ordinal"/>\
			</treecols>\
		</overlay>';
		overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
		window.userChrome_js.loadOverlay(overlay, null);
		window.removeEventListener("load", showparentfolder.init, false);
		window.addEventListener('unload', showparentfolder.uninit, false);
		//Bug 196509  Search for bookmark should show parent folder
		PlacesTreeView.prototype.COLUMN_TYPE_PARENTFOLDER = 999;
		var func = PlacesTreeView.prototype._getColumnType.toString();
		func = func.replace('return this.COLUMN_TYPE_TAGS;', 'return this.COLUMN_TYPE_TAGS;case "parentFolder":return this.COLUMN_TYPE_PARENTFOLDER;');
		PlacesTreeView.prototype._getColumnType = new Function("aColumn",
		func.replace(/^function\s*.*\s*\(.*\)\s*\{/, '').replace(/}$/, ''));
		//console.log(PlacesTreeView.prototype._getColumnType.toString());
		func = PlacesTreeView.prototype.getCellText.toString();
		func = func.replace('switch (this._getColumnType(aColumn)) {', ' \
      switch (this._getColumnType(aColumn)) { \
        case this.COLUMN_TYPE_PARENTFOLDER: \
            if (PlacesUtils.nodeIsQuery(node.parent) && \
                 PlacesUtils.asQuery(node.parent).queryOptions.queryType == \
                  Ci.nsINavHistoryQueryOptions.QUERY_TYPE_HISTORY && \
                 node.uri ) \
              return ""; \
            var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"] \
                        .getService(Components.interfaces.nsINavBookmarksService); \
            var rowId = node.itemId; \
            try { \
              var FolderId; \
              var parentFolderId = bmsvc.getFolderIdForItem(rowId); \
              var folderTitle = bmsvc.getItemTitle(parentFolderId); \
              /*var xpref = Components.classes["@mozilla.org/preferences-service;1"] \
                  .getService(Components.interfaces.nsIPrefBranch2); \
              var reverse = xpref.getBoolPref("extensions.showParentFolder.reverseFolderHierarchy"); \
              if (xpref.getBoolPref("extensions.showParentFolder.showFolderHierarchy")){ */\
			  var reverse = false;\
			  if(true) {\
                while ( (FolderId = bmsvc.getFolderIdForItem(parentFolderId)) ){ \
                  if (FolderId == parentFolderId) \
                    break; \
                  parentFolderId = FolderId; \
                  var text = bmsvc.getItemTitle(parentFolderId); \
                  if (!text) \
                    break; \
                  if (!reverse) \
                    folderTitle = text + " /"+ folderTitle; \
                  else \
                    folderTitle = folderTitle + "<"+ text; \
                } \
                folderTitle = folderTitle.replace(/^\s/,""); \
              } \
            } catch(ex) { \
              var folderTitle = ""; \
            } \
            return folderTitle; \
      ');
		//reverseFolderHierarchy 反向文件夹层次
		//showFolderHierarchy 显示文件夹层次
		PlacesTreeView.prototype.getCellText = new Function(
		func.match(/\(([^)]*)/)[1],
		func.replace(/[^{]*\{/, '').replace(/}\s*$/, ''));
		//console.log(PlacesTreeView.prototype.getCellText.toString());
		//xxx Parentfolder column sort will do nothing.
		func = PlacesTreeView.prototype.cycleHeader.toString();
		func = func.replace('switch (this._getColumnType(aColumn)) {', ' \
      switch (this._getColumnType(aColumn)) { \
        case this.COLUMN_TYPE_PARENTFOLDER: \
          return; \
      ');
		PlacesTreeView.prototype.cycleHeader = new Function(
		func.match(/\(([^)]*)/)[1],
		func.replace(/[^{]*\{/, '').replace(/}\s*$/, ''));
		//debug(PlacesTreeView.prototype.cycleHeader.toString());
	},
	uninit: function () {
		window.removeEventListener("unload", showparentfolder.uninit, false);
	}
}
window.addEventListener("load", showparentfolder.init, false);
showparentfolder.init();
}