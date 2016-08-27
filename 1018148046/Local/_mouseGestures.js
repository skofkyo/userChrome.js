GESTURES = {
  'U': {
    name: '转到页首',
    cmd: function (event) {
      goDoCommand('cmd_scrollTop');
    }
  },
  'D': {
    name: '转到页尾',
    cmd: function (event) {
      goDoCommand('cmd_scrollBottom');
    }
  },
  'L': {
    name: '后退',
    cmd: function (event) {
      getWebNavigation().canGoBack && getWebNavigation().goBack();
    }
  },
  'R': {
    name: '前进',
    cmd: function (event) {
      getWebNavigation().canGoForward && getWebNavigation().goForward();
    }
  },
  'DL': {
    name: '刷新页面',
    cmd: function (event) {
      gBrowser.mCurrentBrowser.reload();
    }
  },
  'DR': {
    name: '关闭标签页',
    cmd: function (event) {
      if (gBrowser.mCurrentTab.pinned || gBrowser.selectedTab.getAttribute('AutoReload'))
      XULBrowserWindow.statusTextField.label = '不关闭此标签页';
       else
      gBrowser.removeCurrentTab();
    }
  },
  'DLU': {
    name: '跳过缓存刷新标签页',
    cmd: function (event) {
      BrowserReloadSkipCache();
    }
  },
  'W-': {
    name: '激活左边标签页',
    cmd: function (event) {
      gBrowser.tabContainer.advanceSelectedTab( - 1, true);
    }
  },
  'W+': {
    name: '激活右边标签页',
    cmd: function (event) {
      gBrowser.tabContainer.advanceSelectedTab( + 1, true);
    }
  },
  'UL': {
    name: '激活左边标签页',
    cmd: function (event) {
      gBrowser.tabContainer.advanceSelectedTab( - 1, true);
    }
  },
  'UR': {
    name: '激活右边标签页',
    cmd: function (event) {
      gBrowser.tabContainer.advanceSelectedTab( + 1, true);
    }
  },
  'RL': {
    name: '转到第一个标签页',
    cmd: function (event) {
      gBrowser.mTabContainer.selectedIndex = 0;
    }
  },
}
