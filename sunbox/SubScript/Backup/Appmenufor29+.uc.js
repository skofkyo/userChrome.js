// ==UserScript==
// @name           Appmenu.uc.js
// @namespace      Appmenu@gmail.com
// @description    基于externalFuncButtonM.uc.js修改，还原FF橙色菜单
// @include        main
// @author         defpt
// @charset        UTF-8
// @version        v2014.05.10
// ==/UserScript==
var Appmenu = {
    autohideEmptySubDirs: true,
    //自动隐藏没有一个子项目的子目录菜单
    moveSubDirstoBottom: true,
    //把主菜单下的子目录移动到最下面
    subdirPopupHash: [],
    subdirMenuHash: [],
    toolbar: {
        //定义主菜单下子目录,加{name: 'separator'}建立分隔线
        subdirs: [{
            name: 'Firefox目录',
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB1SURBVDhPvVNJCsAgDPRfvRhv+v8nSPuMNilRQmhqCtqBAYdZyMUwBSmljNyRpyDpzJF3cFiW+whHbDyUPnHeAB/kxroBrS30nC5I3d6SdwjRtTa8+GegeZJsLbggxrixNwRl5YD1Dzw8AgAUeihjSOxVACgXiATg0EptZz4AAAAASUVORK5CYII="
        },
        {
            name: 'Firefox配置文件',
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAd0lEQVR42mNgGFTAyclJDoh3AfFnIP6PB3+GqpNDN2A3AY3oeD+6ATCbbaCuAbF/YnGpDVY5mMlQdgU5LkA2oBiPxi9Q78rjNABHIOOVR3cBiq0kG0C0PLa4J8kF2OKeVBfAbNYl0oCfVE99clBDvhDQiD3uKQUAMzDR0XUWC64AAAAASUVORK5CYII="
        },
		{
            name: 'Firefox辅助功能',
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACkSURBVDhPtVNBDsMwCNu/tkOIcmm/vTxlyp6xwQaIFqJwqSVLxDa0IsrNota6IQfyMyF5G8c9OBA1Wg6Oe0iotfZgSUGa+Cx5rALXDEDBLY4tB5tB/hfKhTWyA4hDxWhxqHcAePJRcVioFgFSXhSir4ouPP+J6OkByM72D6KHAwQpbxHqRD4eoH1SRLcwQynlbgdkHtCMb1rYTsXJWBL7XgCwfwHZ++hZlAI3zQAAAABJRU5ErkJggg=="
        }],
        //下面定义子菜单功能
        apps: [{
            name: 'userChrome.css',
            path: '\\chrome\\userChrome.css',
            subdir: 'Firefox配置文件',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADRSURBVDhPrZK7DcJAEAUvIoECkGiBHixbcmByVwJO3AREJHRFAgXw6QJ4i+ew0eqAgJFWPs97Wksnh79SFEWluTAVOukdFO7MBZ30jkGpzbJsgg52NhdztCcW6roeoV6wJL1AhenHgoi5dVE9eZ6vLdRzj3IoP9DZoDokl5qbgrO2z9EOy6xDd4V+fr1h8y8LTnQbdIfEzgLNEeWwjM4W1SM5I/x6idZFvfPrAl49saBpy7Ico4OdzcUc7VE4/GWv6KR36CIXVrCbtjM66f9ACA+WlpJhWkqyOwAAAABJRU5ErkJggg=='
        },
        {
            name: 'userContent.css',
            path: '\\chrome\\userContent.css',
            subdir: 'Firefox配置文件',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADRSURBVDhPrZK7DcJAEAUvIoECkGiBHixbcmByVwJO3AREJHRFAgXw6QJ4i+ew0eqAgJFWPs97Wksnh79SFEWluTAVOukdFO7MBZ30jkGpzbJsgg52NhdztCcW6roeoV6wJL1AhenHgoi5dVE9eZ6vLdRzj3IoP9DZoDokl5qbgrO2z9EOy6xDd4V+fr1h8y8LTnQbdIfEzgLNEeWwjM4W1SM5I/x6idZFvfPrAl49saBpy7Ico4OdzcUc7VE4/GWv6KR36CIXVrCbtjM66f9ACA+WlpJhWkqyOwAAAABJRU5ErkJggg=='
        },
        {
            name: '编辑 prefs.js',
            path: '\\prefs.js',
            subdir: 'Firefox配置文件',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC2SURBVDhPzVG5EcMwDNMkyQTeII2ejdJktrjIUHaTKgZkUifJtF24Ce5wRwGgqBPdfyGldPPev0MIE/g74MQc89K6AuJohHeJ/EdaV0DMk3Hzg7dL6Ct2AX3To0iyhvnS8x6tF2RD6qeee6JxBkfwnhsVGpDjBmd+/4IysddYmzgLmL61e+paWxrrAn5GHdwEKpg+hDw5xjiYgQr0MLDdvfWCIyLf7l7+gDudrQYlfcm1u78G5xYt+dG/P60iLQAAAABJRU5ErkJggg=='
        },
        {
            name: '编辑 user.js',
            path: '\\user.js',
            subdir: 'Firefox配置文件',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC2SURBVDhPzVG5EcMwDNMkyQTeII2ejdJktrjIUHaTKgZkUifJtF24Ce5wRwGgqBPdfyGldPPev0MIE/g74MQc89K6AuJohHeJ/EdaV0DMk3Hzg7dL6Ct2AX3To0iyhvnS8x6tF2RD6qeee6JxBkfwnhsVGpDjBmd+/4IysddYmzgLmL61e+paWxrrAn5GHdwEKpg+hDw5xjiYgQr0MLDdvfWCIyLf7l7+gDudrQYlfcm1u78G5xYt+dG/P60iLQAAAABJRU5ErkJggg=='
        },
        //本地路径
        {
            name: 'Profiles',
            path: '\\',
			image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB1SURBVDhPvVNJCsAgDPRfvRhv+v8nSPuMNilRQmhqCtqBAYdZyMUwBSmljNyRpyDpzJF3cFiW+whHbDyUPnHeAB/kxroBrS30nC5I3d6SdwjRtTa8+GegeZJsLbggxrixNwRl5YD1Dzw8AgAUeihjSOxVACgXiATg0EptZz4AAAAASUVORK5CYII=',
            subdir: 'Firefox目录'
        },
		{
            name: 'Chrome',
            path: '\\chrome',
			image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB+SURBVDhPY6AKcHR0bHVycvoM5cIBSAwkB+XiBkBFf4CK/0O5cAASA8r9hHJxA5BCXAZgE8cAg8cABwcHa6gQA4hNigHPYIqJwaCARYkdIMcLKPEcXSEBjBHtGACmGNlrJAGYAVAu6YBqBlDiBXyxQzgQ8cTOL5RoJB8wMAAAVumGVmySQOkAAAAASUVORK5CYII=',
            subdir: 'Firefox目录'
        },
		{
            name: 'Plugins',
            path: '\\Plugins',
			image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACHSURBVDhPzZNLDoAgDES5ly6AsMFr61EMHkNb0hLCRxBd+JJJ6NBOmijiU7TWG+hEKaVWsqt+BjexyK76HjAsyMUNncIZiwEjwywX1pNSTrRUE2PMzHMhgO48aV2iGsB1r5cFIGld4jaghx8GPPmM2BsHvPmRDgGPY8FDctEUzO04S0uNIsQFBhTTt3pWtZkAAAAASUVORK5CYII=',
            subdir: 'Firefox目录'
        },
       ],
        //定义firefox的功能
        configs: [
        //Firefox辅助功能
		{
            name: 'about:config',
            command: "getBrowser().selectedTab = getBrowser().addTab ('about:config')",
            subdir: 'Firefox辅助功能',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACUSURBVDhPzVLbDYAgELsRHIER3IDAJG7oCI7gKI6AV+0lRPGFH9qERPpS8OR/8N63IYQhxtiREjyDg0aqDBjUPOlKCJAWFiZohyUqOAtvjXkxNUdphRKNCmNm2L1lUzIiY8Jl2FAs0fP1JNJZ2MCSxY/s+wJ8hm7qj0Ch/hINStT/RkNuxPCQvjdIBhgYeD7KH0BkBunBj8nDYt6dAAAAAElFTkSuQmCC'
        },
        {
            name: '安全模式重启',
            subdir: 'Firefox辅助功能',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEpSURBVDhPjZJNSgNBFIQb3IngCbyCceFSnV9GArOdnegNxI03EEEh++QYgYAHkGxzi2SRlZCtIVY9a7DttI0FRb/U+96bnjCOKstyCK/g3T9NdmjDlIIYmPJK47bAwrquLxT9KTI9r+hnAeuiKB5RT2JmL+RNfkAw5ZA3+QGhlEPe5AeEUg55kx8QSjnkTX3QNM0Jzlc4Oow/8UXM3gL7DgCM4AHhmLMsOyODmuxS47bgQeFnVVU1ztt+yPNNnucVGdQ71Pcad67rugM03tjA+YHzFMA16rHcMFOP159yRuPfwhd2jMZcwBrXPef70qyZsYcl72Q19lsAjwDYTeANXucOv/k6G2Wztm0PhcfFqwF8xuBWQ3zqFn7au3ZKGLiCFzSWXCoO5NwX+GUOM6/q1IwAAAAASUVORK5CYII=',
            command: "safeModeRestart();"
        },
        {
            name: '错误控制台',
            subdir: 'Firefox辅助功能',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACHSURBVDhPzZNLDoAgDES5ly6AsMFr61EMHkNb0hLCRxBd+JJJ6NBOmijiU7TWG+hEKaVWsqt+BjexyK76HjAsyMUNncIZiwEjwywX1pNSTrRUE2PMzHMhgO48aV2iGsB1r5cFIGld4jaghx8GPPmM2BsHvPmRDgGPY8FDctEUzO04S0uNIsQFBhTTt3pWtZkAAAAASUVORK5CYII=',
            command: "toJavaScriptConsole();"
        },
		{
            name: '立即同步火狐',
            subdir: 'Firefox辅助功能',
			image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADJSURBVDhPrVOBDcIwDMsJnMAJfFDWPsAJO4ET+IQTOGUn7AROgLg4U1qCihCWrCqxnVZaJhFSSrtpmi4551X5cFzRh06rSCnlCLJE+KDGpQv2XLYh1nThu/X0tiuGa3+PE7X1axgwcx9WzrQ08K+tcIFhOIQLVdqzKY/RDzBSHiMKg5T/h+gSkPIYURikPIbfg58GqHl2wW1TKb/w6fOpsQljja2mRcSt6U3PE4bhZN2E4bdeDXPi9z+QAhe8vVhNZ2X4C9PSQeQJaqDMYjYgrJgAAAAASUVORK5CYII=',
            command: "gSyncUI.doSync(event);"
        },
        //下面定义主菜单功能
        {
            name: '重启浏览器',
            command: "Services.appinfo.invalidateCachesOnRestart() || Application.restart();",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1klEQVR42mNgoCZwcnJiAuIIIN4IxK+A+D+U3gTEUSB5JLX16JpVgfgsVBMuDJJXA2kG8ZE1KwHxS6iih0CcCcSKQMwFxApQ/kOo/DeYgcjOPg0V3AHEfDi8xwvEt5FdBJOIhArcB2J+POFTj+4lmMQmqEAaKZqRDXgOFZAlN+r+QA1gIdeAt5S6YDPUgFRyDYhCigU+ItQfBmH05HseKR3w4kkH26HqrgIxK7KkClLaJ5QSQWGmgs0GZSC+SCAvXALlGUK5MQaItwLxC6imD1Cnx2CLagCrE7TimOQIRAAAAABJRU5ErkJggg=="
        },
        {
            name: '新建隐私窗口',
            command: "OpenBrowserWindow({private: true});",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA20lEQVR42mNgoBQ4OTkdBmEkPi8Q5wJxhxMCdEDFeLEZ8B+KWYE4C4hfI4mh49dQNSC13EDci2zAFzwa0TFI7W8QmwFN4gMQXwbi71g0fYfKfUAS+41sQBHIaVBvmQDxXyQ5ENsEKscKVQsSf4RswFwgZkQKmzNIcmeQxBmhakHiC9G9AHLiaiBeBcTPkMSfQcVAcleQxM0ZSAg4dLwQPRqPk6D5HBDzoxsAitd2IH4D5d8B4nQovgMVewNVw42RkJD4TEAshCXBCYHkcKZESvLCwBsAyo1HyNUPAFr59v1e4pXxAAAAAElFTkSuQmCC"
        },
        {
            name: 'separator'
        },
        {
            name: '设置选项',
            command: "openPreferences();",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABBUlEQVR42q2TSwrCQAyGu1OK9gGioO68hd31CO1x3Ai60o24E3ceQtwo9Q4K2ku4UAQfpf6BDIShrQ8c+GDon6RJJjGMnOP7fh3cwRN0jHcHRiVQ5bsNBiBlJqDBmgdM3dkEW7AHM3AWzgrKZs0ZRaAsA3gspB9CP7L0LFbCIAYhl2LzPRb6Qnd2wJXFI3AzeuSKIGRbU0IbDEX0oKDRodbYNn1MtPqsggCWZpv8JUAL9H4oYQyaSqiAEwsHamqGs8MNJpubGixpMNWeMeCULb7LZ9xk1bb7YpBo6LoyQJlHmYSlmAnJBcx5CqO8ffDEMvWF80j1hRaOFu+T7aR1fvAz567zC1y88fHJYEJlAAAAAElFTkSuQmCC"
        },
        {
            name: '附加组件',
            command: "getBrowser().selectedTab = getBrowser().addTab ('about:addons')",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVR42mNgQAJOTk6tQPwZRDOQA4AavwHxf5AhDHQDQNsOQ20lBmN6DyjwkwQDML0HDbivJBhwllyvwg0hS9EQNABdAxY+8VGKwwDioxSHAV9IyjNEhQEBA35SlNGg3sNwNgBH7bnMGdLHkAAAAABJRU5ErkJggg=="
        },
        {
            name: '书签管理',
            command: "PlacesCommandHook.showPlacesOrganizer('AllBookmarks');",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAb0lEQVR42mNwcnLyBOJnQPyfRAzS48lApma4IQxIHBsGEgBQ/RGwHpgBDCQCuB5sLkDz1jOiXIDsEmLE4HKjBtDOgFdAHAbFL8kxQB2IV0KxBkkGAHEIyFYkPogdis8ASjLTc5ABXiAGGZqfgPQCAKZ5ZToRpqI8AAAAAElFTkSuQmCC"
        },
        {
            name: 'separator'
        },
		{
            name: '历史记录',
            command: "PlacesCommandHook.showPlacesOrganizer('History');",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABOUlEQVR42pWTu0oEQRBFx0TZH9Af0EB0cQPByGQiFTYRxEA0MnAj8UOUFWZ9hoZmxoLmgolvEYyMTIRFYX2fwtvYFjMDNpygu2/dqeqpShK30jQdgS24g3d4gRvYgVpStLjsgQw+4KsAu9swrQ/uhkOJOtCEURiEaViCPXiT5shiYoOWLh6gGp2fwAXUxQI8SrsZREOq1dzHXGYh9XpEAz5VzrCJ1iTazXmXPAPjQOdNE51pk/7DYEXn5yZ60qavxCAQ3mNe+3Zs0OuCu+DUGVw6g05cwrgz6IeJnPSNZcVcmXBVm5YLnioINvbjRwy/0RqoBgMwWRK8KP3Pb9QXMznew0xJ8Kya7beRclq5Desw5zow02CZ5vhPK8ukoimMh8nKenXDZJpK2VRWLT24Va3PcA3bNupe/w25ShMkCh869AAAAABJRU5ErkJggg=="
        },
		{
            name: '下载管理',
            command: "BrowserDownloadsUI();",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAa0lEQVR42mNgwAGcnJyOAPF/KD7MQCpA0gzGowYQaQAotNE1YsGHKTXgCCFXNODR3ECsVxqI1gx19mEChjTgSKmHGfCFMtSQBnyxxEBuPGMYAMQ2JGi2RjbgGRFRhws/BxngBWKQofkJSC8A7kTAGZ4aXdgAAAAASUVORK5CYII="
        },
		{
            name: '页面另存为',
            command: "saveDocument(window.content.document);",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdklEQVR42mNwcnLyBOJnQPyfRAzS48mApvkdERqR1TxjQOIYMgABugYGKEDmA2l9OB+XQnwGoPBpbgBBA7FIHMFjwBGCBhALaGcAkG0NxL44sDUxBvjiw7R3AdlhAMRWJGi2RDaAnJwIw89BBniBGGRofgLSCwDDQxufnOjqdgAAAABJRU5ErkJggg=="
        },
		{
            name: '清理浏览痕迹',
            command: "Cc['@mozilla.org/browser/browserglue;1'].getService(Ci.nsIBrowserGlue).sanitize(window);",
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdUlEQVR42mNgwAOcnJyOAPFhBnIBUPN/EB7aBoDC4AjJNhLCtDOAYgA0fT8xGJfmOGK9AMQJ2AyYT4IB87EZcB8q+RNJITY2iL6PrlkBSeEbAmwYrYBsQDySwvsE2PcxwgHN/5cIsGH0Amz+B+GjBNgwGhwOAAxv3WzpCH5wAAAAAElFTkSuQmCC"
        },
        {
            name: 'separator',
        },
		]
    },
    _externalAppPopup: null,
    _isready: false,
    init: function() {
        this.handleRelativePath(this.toolbar.apps);
        const XULNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
        var TabsToolbar = document.getElementById("TabsToolbar");
        if (!TabsToolbar) return;
        var ExternalAppBtn = document.createElementNS(XULNS, 'toolbarbutton');
        ExternalAppBtn.id = "AppMenuButton";
        ExternalAppBtn.setAttribute("label", "橙色按钮");
        ExternalAppBtn.setAttribute("onclick", "event.preventDefault();event.stopPropagation();");
        ExternalAppBtn.setAttribute("tooltiptext", "Firefox菜单");
        ExternalAppBtn.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
        ExternalAppBtn.setAttribute("type", "menu");
        ExternalAppBtn.setAttribute("removable", "true");
        ExternalAppBtn.style.listStyleImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAZBAMAAACV7/6WAAAAJ1BMVEX1jD/////2lVP4qHb6x6r+9O/4t5H96+L7z7j85Nf5v572nmT83czH7IKcAAAAq0lEQVQoz2MYBYaCgg4RME6jMHY1CQwMMVA2F0wJpho4YBHCraaCSSRQoVHc4KBggY5gFMNUBkMHLGpEN3AUcQQAzalUWLhgq8NxDDcrAM1h2GjAJMYixCXNwDOBJUwYm11iDImCgiIsQhwBDCwBDKEOONRsYGCAqSnEoWbjApAariCQXSHR2NVwBjNPALo5UmGhwdYFldjVMB2UNACq0RQsYyhnSFzAMOIBAKvxJoQbdpeUAAAAAElFTkSuQmCC)";
        TabsToolbar.insertBefore(ExternalAppBtn,TabsToolbar.firstChild);
		document.insertBefore(document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent('\
#AppMenuButton{\
	padding:0 !important;\
	margin:0 0 6px 0!important;\
	background: #FFF !important;\
}\
#AppMenuButton > dropmarker{display:none !important;}\
') + '"'), document.documentElement);

        var ExternalAppPopup = document.createElementNS(XULNS, 'menupopup');
        ExternalAppPopup.setAttribute('onpopupshowing', 'event.stopPropagation();Appmenu.onpopupshowing();');
        this._externalAppPopup = ExternalAppPopup;
        ExternalAppBtn.appendChild(ExternalAppPopup);
    },

    onpopupshowing: function() {
        if (this._isready) return;
        if (this._externalAppPopup === null) return;
        var ExternalAppPopup = this._externalAppPopup;
        for (var i = 0; i < this.toolbar.subdirs.length; i++) {
            if (this.toolbar.subdirs[i].name == 'separator') {
                ExternalAppPopup.appendChild(document.createElement('menuseparator'));
            } else {
                var subDirItem = ExternalAppPopup.appendChild(document.createElement('menu'));
                var subDirItemPopup = subDirItem.appendChild(document.createElement('menupopup'));
                subDirItem.setAttribute('class', 'menu-iconic');
                subDirItem.setAttribute('label', this.toolbar.subdirs[i].name);
                subDirItem.setAttribute('image', this.toolbar.subdirs[i].image);
                Appmenu.subdirPopupHash[this.toolbar.subdirs[i].name] = subDirItemPopup;
                Appmenu.subdirMenuHash[this.toolbar.subdirs[i].name] = subDirItem;
            }
        }

        for (var i = 0; i < this.toolbar.apps.length; i++) {
            var appsItems;
            if (this.toolbar.apps[i].name == 'separator') {
                appsItems = document.createElement('menuseparator');
            } else {
                appsItems = document.createElement('menuitem');
                appsItems.setAttribute('class', 'menuitem-iconic');
                appsItems.setAttribute('label', this.toolbar.apps[i].name);
				appsItems.setAttribute('image', this.toolbar.apps[i].image);
                appsItems.setAttribute('oncommand', "Appmenu.exec(this.path, this.args);");
                appsItems.setAttribute('tooltiptext', this.toolbar.apps[i].name);
                appsItems.path = this.toolbar.apps[i].path;
                appsItems.args = this.toolbar.apps[i].args;
            }
            if (this.toolbar.apps[i].subdir && Appmenu.subdirPopupHash[this.toolbar.apps[i].subdir]) Appmenu.subdirPopupHash[this.toolbar.apps[i].subdir].appendChild(appsItems);
            else ExternalAppPopup.appendChild(appsItems);
        }

        for (var i = 0; i < this.toolbar.configs.length; i++) {
            var configItems;
            if (this.toolbar.configs[i].name == 'separator') {
                configItems = document.createElement('menuseparator');
            } else {
                configItems = ExternalAppPopup.appendChild(document.createElement('menuitem'));
                configItems.setAttribute('class', 'menuitem-iconic');
                configItems.setAttribute('label', this.toolbar.configs[i].name);
                configItems.setAttribute('image', this.toolbar.configs[i].image);
                configItems.setAttribute('oncommand', this.toolbar.configs[i].command);
                configItems.setAttribute('tooltiptext', this.toolbar.configs[i].name);
            }
            if (this.toolbar.configs[i].subdir && Appmenu.subdirPopupHash[this.toolbar.configs[i].subdir]) Appmenu.subdirPopupHash[this.toolbar.configs[i].subdir].appendChild(configItems);
            else ExternalAppPopup.appendChild(configItems);
        }

        if (this.autohideEmptySubDirs) {
            for (let[name, popup] in Iterator(Appmenu.subdirPopupHash)) {
                //Application.console.log("popup: " + popup);
                if (popup.hasChildNodes()) {
                    continue;
                } else {
                    Appmenu.subdirMenuHash[name].setAttribute("hidden", "true");
                }
            }
        }

        if (this.moveSubDirstoBottom) {
            let i = ExternalAppPopup.childNodes.length;
            while (ExternalAppPopup.firstChild.getAttribute('class') != 'menuitem-iconic' && i--!==0) {
                ExternalAppPopup.appendChild(ExternalAppPopup.firstChild);
            }
        }
        this._isready = true;
    },

    handleRelativePath: function(apps) {
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].path) {
                apps[i].path = apps[i].path.replace(/\//g, '\\').toLocaleLowerCase();
                var ffdir = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).path;
                if (/^(\\)/.test(apps[i].path)) {
                    apps[i].path = ffdir + apps[i].path;
                }
            }
        }
    },

    exec: function(path, args) {
        args = args || [];
        var args_t = args.slice(0);
        for (var i = 0; i < args_t.length; i++) {
            args_t[i] = args_t[i].replace(/%u/g, gBrowser.currentURI.spec);
        }

        var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
        file.initWithPath(path);
        if (!file.exists()) {
            Cu.reportError('File Not Found: ' + path);
            return;
        }

        if (!file.isExecutable()) {
            file.launch();
        } else {
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            process.init(file);
            process.run(false, args_t, args_t.length);
        }
    },
};

Appmenu.init();