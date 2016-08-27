// ==UserScript==
// @name            AddBookmarkHereWithMiddleClick
// @include         main
// @description     中键书签工具栏书签文件夹添加书签至对应文件夹
// @version         0.0.1
// ==/UserScript==

(function () {
    if (window.ABHere) return;

    var ABHere = {

        isInsertTop: true,          //是否添加在顶部

        init: function () {
            //hook书签文件夹中键
            eval("BookmarksEventHandler.onClick="+BookmarksEventHandler.onClick.toString().replace("PlacesUIUtils.openContainerNodeInTabs",'if (!(function(event){ \
                if (event.button != 1) return false; \
                ABHere.addBookmarkHere(event); \
                return true; \
            })(aEvent)) $&'));
            //编辑窗口定位相关
            eval("PlacesCommandHook.bookmarkPage="+PlacesCommandHook.bookmarkPage.toString()
                .replace("if (BookmarkingUI.anchor) {","var anchor = (typeof(aShowEditUI)=='object' && StarUI._batching) ? ABHere.getAnchorElementByItemId(aShowEditUI, itemId) : BookmarkingUI.anchor; if (anchor) {")
                .replace("StarUI.showEditBookmarkPopup(itemId, BookmarkingUI.anchor,","StarUI.showEditBookmarkPopup(itemId, anchor, (typeof(aShowEditUI)=='object' && StarUI._batching) ? 'after_pointer' : ")
                .replace("PlacesUtils.bookmarks.DEFAULT_INDEX","(typeof(arguments[3])=='number') ? arguments[3] : (ABHere.isInsertTop ? 0 : -1)"));
            //添加在顶部相关
             eval("gEditItemOverlay.onFolderMenuListCommand="+gEditItemOverlay.onFolderMenuListCommand.toString().replace("PlacesUtils.bookmarks.DEFAULT_INDEX","(ABHere.isInsertTop ? 0 : -1)"));
             eval("PlacesControllerDragHelper.onDrop="+PlacesControllerDragHelper.onDrop.toString().replace(/{/,
            "$& if (insertionPoint.orientation == Ci.nsITreeView.DROP_ON) { if (ABHere.isInsertTop) insertionPoint.index = 0; }"));
             eval("PlacesCommandHook.addLiveBookmark="+PlacesCommandHook.addLiveBookmark.toString().replace(
            "var toolbarIP = new InsertionPoint(PlacesUtils.toolbarFolderId, -1);",
            "var toolbarIP = new InsertionPoint(PlacesUtils.toolbarFolderId, ABHere.isInsertTop ? 0 : -1);"));
             //取消隐藏关键字,说明等;
             eval("StarUI._doShowEditBookmarkPanel="+StarUI._doShowEditBookmarkPanel.toString().replace(/hiddenRows: \[[^]*\]/,"hiddenRows: []").replace(/}$/,"setTimeout(function(){ gEditItemOverlay.toggleFolderTreeVisibility(); gEditItemOverlay.toggleTagsSelector(); document.getAnonymousNodes(document.getElementById('editBMPanel_tagsSelector'))[1].lastChild.style.display = 'inline-block'; document.getElementById('editBMPanel_tagsSelector').style.cssText = 'max-height:85px !important; width:350px !important'; document.getElementById('editBMPanel_folderTree').style.cssText = 'max-height:50px !important; width:350px !important';document.getElementById('editBookmarkPanel').style.maxHeight='400px'}, 0); $&"));
        },

        getAnchorElementByItemId: function(target, itemId) {
            var container = ["menuitem", "menu", "toolbarbutton"].indexOf(target.tagName) != -1 ? target.parentNode : target;
            for (var i = 0; i < container.childNodes.length; i++) {
                var elmt = container.childNodes[i];
                if (elmt._placesNode && (elmt._placesNode.itemId == itemId)) {
                    return elmt;
                }
            }
            return target;
        },

        closePopups: function(elmt) {
            while (elmt) {
                if (elmt.hidePopup) elmt.hidePopup();
                elmt = elmt.parentNode;
            }
        },

        addBookmarkHere: function (e) {
            var node = e.target;
            if (!node) return;

            var aBrowser = getBrowser().selectedBrowser;
            var exists = { "menupopup": true, "popup": true };
            var elmt = node;
            while (elmt && elmt.parentNode) {
                if (!exists[elmt.tagName] && !exists[elmt.parentNode.tagName]) break;
                elmt = elmt.parentNode;
            }
            var ip = { node: node._placesNode, index: 0, anchor:elmt};

            //关闭菜单
            this.closePopups(document.popupNode);
            this.closePopups(e.originalTarget);

            PlacesCommandHook.bookmarkPage(aBrowser, PlacesUtils.getConcreteItemId(ip.node), ip.anchor, this.isInsertTop ? 0 : -1)
        }
    };
    if (location == "chrome://browser/content/browser.xul") {
        ABHere.init();
        window.ABHere = ABHere;
    }
   
})();
