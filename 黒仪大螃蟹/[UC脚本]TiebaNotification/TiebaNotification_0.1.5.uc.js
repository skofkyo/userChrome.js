// ==UserScript==
// @name           TiebaNotification
// @author         crab
// @include        main
// @description    贴吧消息提醒按钮
// @version        0.1.5
// @note           [20141103.0.1.2]添加关闭通知面板的选项，改进tooltip显示，和修正一些错误。
// @note           [20141103.0.1.3]增加点击按钮时显示查询状态标志。
// @note           [20141104.0.1.4]尝试修复网络错误时几率的异常状态。
// @note           [20150126.0.1.5]修复因贴吧抽风无法清除状态的错误；一些兼容问题。
// ==/UserScript==
location == 'chrome://browser/content/browser.xul' && (function(){
var tiebaNotification = {

	interval: 2 * 1000 * 60, //检测间隔（单位毫秒），2*100*60=2分钟

	showNotification: true, //显示弹出通知面板，默认显示 true, 关闭设置为 false

	info: {
		icon: {
			//大图标
			notification: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAUCSURBVFiFxVdfbFNVGP+dc29vZ9st22AyV6ErZRg1rGMl2aCDEexiohkmDpEEjS/GJePBBCMhKIkvvunQROSNyIMkRvYgD0okxIHutmRlMEbnoE63sY45oLP7Z3vvuff4cNvS1W7rGIRfcl/O+b5zfuc7v+873yWcczxJiAAgSRIArAXwwjL97wO4CkADYAVQA8CWnOsBcHcxZ0VRDAIA1nq9DV/W1nrq8t2ZUoKJiYm7Z858/52qqp8VFRUdamnZs89mK7QBnHd2dv7c13f9EIB7i62TIuDeunWr1+2ueTpfAgDAOa+QZfni8PCQZc2a8tW7dr20MTUXiURe7Ou7XgHgmRyuYzCilyaga5qmL2dzAFBVNe3DuQ7GmC6KIgUAh8Oxbvfu144LgiBkuZFbt27eCIVCRwGMi1gAjKm6rs8XKOcckiQRQghZilxtrae8ttZTnmsuGOx2hEKhDgDnchKIxf5RT5z4+lQ0Gp1UVaYBxp2bTJLU3Nzc4vU2OJYisBgEQRQACMCDK5iHRELRQqFQwOl0uquq1jk451xV1UQg4P8qGo3uBLAiAolEXAGgLEggGWLi8zW9umNH43oAmJub0wIBf1ce0QcAdHX9Ntzf39+brQFCCBkcHPwDRvrmJpCCrutpkWka0wGwvHYHMDExMX7p0sWjAKazpgiM+jC9JIGVIHlyAcBfi9nRx0UgXzxxAiu+AkoJASDNzMzMAA/qBmNMAbAawMs53EIARh8JAUVRVYej8uPm5uYWSoV0irjdNdV2u/0kIfR/Ub5yJRiQ5a73AYyumEA8/m+8rq5+W11dvT1z3OVy2Vwuly2Xj9ksNchyVw2A0UeiAb7MpkLTNA5ABx5TGmqaxhljPFW0KCUQRVPmYdOEHzkBzjlOn/72fCgUuiGKoqjrum61Wq1tbQfeKSkpkbLtH0sERkZGhiOR0U8BqDBO+0YikXg7l20mgbSCk5FbqOhn2BHkUrkkSSYYVTAKgIqiWE5p7uVSzvOeeEIoAUCM9sqA2VwgVFRUOHVd19Lsk83HckWYiVQErsmyfHFycrIaAMbGxiLFxcVrnU5nacap6LZt3kZZ7uq0WCxWSimZmpqavn//XkwQhIe+ypRjJBDwHwwE/Kl3Xti7980vVq1aNU8027fvcPv9/l9Pnfrm3eTQHACFUvrKwxLIvL8IjJfL2ti480Ofr8mdbVxaWiq1tra+53Su35ccGs61KGOqCqNVLwRgYYyNZ7d3KaRDRwg57PFscdfX1zd4PFvsoijmVI3Tud528OAHrcFgt+/y5cClgYGBk9k2dvuzjlhs6qMHaWh5ymw25yx6KQJlmzZVP9fWdmCvyTSvYCAej2u3b4/MVlVtLEqNFRcXSz5f0/MezxbXkSOH72gaSzcqhBDs3/9WE2PMt0ghSiM1KFksFkv25oyp+tmzP8jt7Z+39/RcGc92LiwsNBUUFEjZOSAIAjGbzVSSJCpJEl1o88wIzMskzjnC4fDUhQvnz8uyfBzA78eOtXe3tOz5xOttqC4rKzMDgCiKhHOOfNr0TCRrB8kkEB0cHPzz3Lmf+hhjbGhoKBwMdl/VNK0DQDhp82NHx5m/Ozt/ed3trtlcWVm5YXZ2djoWi82Ew+H+QMC/gVJhyceNUoLe3t4eGD0BSPJnAwAKAFTDUO+d5JdLumYA9uQ3C+AagFIAm5F/h3UTwJCiKAaBJ4n/AFjW3pvbkY0lAAAAAElFTkSuQmCC',
			//按钮图标
			button: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAkCAYAAACE7WrnAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAUUSURBVEiJrZRbbFRVFIa/dfbpdNKxgFZHKReZBhojoZGLGIxAABF4qMGS0PhCSdCUW0J8MAQBmQcMkEh84PKkBoxkBAxaiZfUQCqV0lC0SclgKyWkhTLQAC00TBlgzvJh9mlOmxJ8YL2c2bPW/tf+/3URVeVpmAuwfPnyGcAyVUVEgn5HVW8CXwAviMg6VT0nIj8Gg44cOZIDUtXlIvKxD+K/0p4fisjXQJmqbgYuqGoGMCJiVLUdSLr2gmfB/wJqROQh8Azwof2iFl1EXlXVX/ykInICeNsJBqnqT6p6HMhT1f3AeSAUeB2q2iMidcApVT2tqn8MaCQiPh1PRJYBW4AW4NFQUUWkCVgUOOfEHBoHZKzoj3JxA0k08HsAxD8PAvIdwQB79mySIEWCVXYDwUMp+GCPgJeA9db1OlBn/Qb4Gdg5oNFwr7LmAc+r6iz737OqOjdwzwN2+lUbRGWokOSK4Nn++UBEFgE7rC8T1ChkX5InImoBFAgDBeQ6XETkvqr+oKq1InIyKIVrv82q+qeI/K2qSy3QK0CtiNwB+mwXi4gUALdtksFVE5FvRWS2qvaKyHvWuR44BrwLdKtqXu6epi3A/SB9n9oo4BPgMDDCOmPAr8BqS/2hiOTbRO+IyLygnj61Oar6mdXpDPAVsFlEYsB+VZ0rIo6l8+WQVskHcF3XpaKi4hJwCDgvIgeAG8BJYKWqFgMdwBFVLRERfzSx4L+7rosYY3ga5lObCZQ9JqYHqCe3TmYD/wBnhwOauW7duu/mzZv3MrneCZpcv379/oYNGw6OHz++aPv27RUNDQ1X9u3bt4rc6DjATexim7Z48eIJS5YsEYaxvr6+gk2bNuWVlJSMrqysdKdNmxYLh8MHRcQxxkhnZ+etRCLxkQs8ymQyCkg8Hr9x+vTpVoBIJBKOx+NvxGIxADzP8wAmTZrErl27xvmJLl++XJxIJOa42J0DcOLEiZaysrLY9OnTx27btu379vb2GaWlpYOq0dbWxrFjx26JiDiOIx0dHbeAU24wyHVds3DhwpKlS5c6hw4dGhscZt+SyWR269atG4Euq1E3cG4QkIhIJpPxACebzWaDjed5ngI4jiPkltxvQ6v2RMtms14oFDIWCKAI2Og4zjjP8+qB+icCeZ5HUVFRYXV19ZsA8+fPd5qamnZCbvKbm5tXVVdXr/xfQCNHjoxMnTrVAIRCIcrKyvAnIhKJhIHSxwJpQGVfn56eHiorK091d3f3RqPRUUePHp2TzWYBPBfIC4fD/l4amEhVJRwOS2FhIY7jiIjQ399PY2Njazqd3lRQULCjv79/ji2IuEBzbW1tRyqVerGrq+tmLBbLA5g8efL448ePX+zs7BzT19eXNsYgIkQikfx0Op2ORCL5g9aJMQZjzCxjzPtr1669mM1mVVW1paVFx4wZ840xpiIajR5IpVLa1dWloVBovzGmJBQK7U+lUnrhwgU1xmzBGFNYWlp6ePfu3b337t1TVdUHDx6oqmoymdQ1a9b8G41GD1y5ckXv3LmjVVVV58vLyxuqqqrO3717V5PJpBpjNmOMWRCPx6+rtb179/aVl5c3nDlzRlVV0+m0Tpky5cerV6/qcNbW1qbGmE9d4FJTU1P7nj17InV1da01NTWfA5cbGxtXr1ixYkFxcfHIa9eu3U4kEr0TJ04cQW7ViP9tbW3tBc76G3IC8BqQBC5a+ULADOA5covtLWD0MJ1yFaj/Dyv2hX/k+Vy/AAAAAElFTkSuQmCC'
		},
		title: '贴吧消息提醒',
		neterr: '网络出错。',
		expired: '查询消息过程中出错，\n或Cookies过期，请确认贴吧登录状态。',
		noMsg: '暂无新贴吧消息。',
		loading: '正在查询。',
		type: {
			0: ['fans', '新粉丝'],
			3: ['replyme', '新回复'],
			4: ['feature', '新精品'],
			8: ['atme', '@到我'],
			9: ['recycle', '回收提醒'],
		},
	},

	_id: 'tiebaNotification-toolbar-button',
	_viewId: 'tiebaNotification-view-panel',

	init: function(){
		this.createButton();
		this.setStyle();
	},

	setBadge: function(value, message){
		try {
			var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
						.getService(Ci.nsIWindowMediator).getEnumerator("navigator:browser");
			while(wm.hasMoreElements()){
				let win = wm.getNext(),
					button = win.document.getElementById(this._id);
				if(!button || (this._button && this.isWindowPrivate(win))) continue;
				if(!!value){
					button.setAttribute('badge', value);
					button.setAttribute('tooltiptext', 
						typeof message == 'string' ? message : message.map(function(m) m.text).join('\n'));
				}else{
					button.removeAttribute('badge');
					button.setAttribute('tooltiptext', this.info.noMsg);
				}
			}
		}catch(e){}
	},

	isWindowPrivate :function(win){
		let cWin = this._button.ownerDocument.defaultView;
		if(typeof PrivateBrowsingUtils.isWindowPrivate == 'function'){
			if(win && PrivateBrowsingUtils.isWindowPrivate(cWin) 
				!= PrivateBrowsingUtils.isWindowPrivate(win))
				return true;
			else if(!win && PrivateBrowsingUtils.isWindowPrivate(cWin))
				return true;
		}else{
			if(win && PrivateBrowsingUtils.isContentWindowPrivate(cWin)
				!= PrivateBrowsingUtils.isContentWindowPrivate(win))
				return true;
			else if(!win && PrivateBrowsingUtils.isContentWindowPrivate(cWin))
				return true;
		}
		return false;
	},

	createButton: function(){
		CustomizableUI.addListener(this);
		try{
			CustomizableUI.createWidget({
				id : this._id,
				type: 'custom',
				defaultArea : CustomizableUI.AREA_NAVBAR,
				label: this.info.title,
				tooltiptext : this.info.title,
				onBuild: function(doc){
					var node = doc.createElementNS(
						'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
						'toolbarbutton');
					node.setAttribute('id', this.id);
					node.setAttribute('label', this.label);
					node.setAttribute('tooltiptext', this.tooltiptext);
					node.className = 'toolbarbutton-1 chromeclass-toolbar-additional badged-button';
					return node;
				}
			});
		}catch(ex){}
		this.updateButton();
	},

	updateButton: function(){
		var that = this,
			button = this._button;
		if(button){
			button.onclick = function(event){
				if(event.button != 0) return;
				clearInterval(that._loading);
				that.setBadge('\u2022\u2000\u2000', that.info.loading);
				that._loading = window.setInterval(function(){
					try{
						let index = button.getAttribute('badge').indexOf('\u2022'),
							bText = '';
						for(var i=0; i<3; i++){
							bText += i == (index == 2 ? -1 : index) + 1 ? '\u2022' : '\u2000';
						}
						this.setBadge(bText, this.info.loading);
					}catch(ex){
						clearInterval.apply(this, arguments.callee);
					}
				}.bind(that), 500);
				if(typeof Promise == 'function'){
					(new Promise(function(resolve, reject){
						that.getTiebaMessage(resolve, reject);
					})).then(function(){
						that.popupPanel.call(that, event, that.info._message);
					}).catch(function(){});
				}else if(typeof Promise == 'object'){
					let promise = Promise.defer();
					promise.promise.then(function(){
						that.popupPanel.call(that, event, that.info._message);
					});
					that.getTiebaMessage(promise.resolve, promise.reject);
				}
			};
			setTimeout(this.getTiebaMessage.bind(this), this.interval);
		}
	},

	onWidgetAfterDOMChange: function(node, nextNode, container, wasRemoval){
		if(wasRemoval || !node.id || node.id != this._id) return;
		this.updateButton();
	},

	popupPanel: function(event, message){
		var button = CustomizableUI.getWidget(this._id);
		if (button.areaType == 'menu-panel') return;
		var document = event.target.ownerDocument,
			[message, count] = message,
			panel = this.getPanel(document),
			setBadge = this.setBadge,
			clearTiebaMsg = this.clearTiebaMsg.bind(this),
			isWindowPrivate = this.isWindowPrivate.bind(this),
			ul = panel.firstElementChild,
			nsHtml = 'http://www.w3.org/1999/xhtml',
			_message = this.info._message,
			that = this;
		while(ul.firstElementChild)
			ul.firstElementChild.remove();
		for(var i=0; i<message.length; i++){
			let li = document.createElementNS(nsHtml,'li');
			li.onclick = (function(msg){
				return function(){
					// 由于未找到隐私"标签"（非窗口）下利用隐私模式产生的Cookie查询的方法，
					// 所以为了兼容"隐私标签"扩展，只能不跟随当前"隐私标签"状态。
					// 自带的"隐私窗口" 无此问题。
					if(('privateTab' in window) && !isWindowPrivate())
						privateTab.readyToOpenTab(false);
					gBrowser.loadOneTab(msg.url, null, null, null, false, false);
					clearTiebaMsg(msg.type);
					count -= msg.value;
					message.forEach(function(m, index){
						(m.type == msg.type) && message.splice(index, 1);
					});
					setBadge.call(that, count, message);
					li.remove(); _message.count = count;
					count == 0 && panel.hidePopup();
				};
			})(message[i]);
			li.innerHTML = message[i].text.replace(/^\d+/, '<b>$&</b> ');
			ul.appendChild(li);
		}

		button = this._button;
		var position = (button.boxObject.y < (window.outerHeight / 2)) ?
							'bottomcenter top' : 'topcenter bottom';
		position += (button.boxObject.x < (window.innerWidth / 2)) ?
							'left' : 'right';
		panel.openPopup(
			document.getAnonymousElementByAttribute(button, 'class', 'toolbarbutton-icon'),
			position, 0, 0, false, false);

		clearInterval(this._loading);
	},

	clearTiebaMsg(type){
		this.ajax({
			url: 'http://message.tieba.baidu.com/i/msg/clear_data?type=' 
					+ (type + 1) + '&gt=' + new Date().getTime(),
			method: 'GET'
		});
	},

	get _button() {
		var button = CustomizableUI.getWidget(this._id);
		return document.getElementById(this._id) || 
				(button && button.instances[0] && button.instances[0].node);
	},

	getPanel: function(document){
		var panel = document.getElementById(this._viewId);
		if(!panel){
			var panel = document.createElement('panel');
			panel.id = this._viewId;
			panel.setAttribute('type', 'arrow');
			panel.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml','html:ul'));
			document.getElementById('mainPopupSet').appendChild(panel);
			return panel;
		}
		return panel;
	},

	setInterval: function(clear){
		clearTimeout(this._setInterval);
		if((clear == undefined || clear) && this._button)
			this._setInterval = setTimeout(this.getTiebaMessage.bind(this), this.interval);
	},

	popupNotification: function(message, listener){
		if(!!~[this.info.neterr, this.info.expired].indexOf(message))
			this.setBadge('Err', message);
		if(!this.showNotification) return;
		clearTimeout(this._popupNotificationTimeout);
		this._popupNotificationTimeout = setTimeout(function(){
			var alertsService = this._alertsService || 
				(this._alertsService =  Cc['@mozilla.org/alerts-service;1']
					.getService(Ci.nsIAlertsService));
			alertsService.showAlertNotification(this.info.icon.notification, 
				this.info.title + '：', message, true, null, listener || null, '');
		}.bind(this), 0);
	},

	getTiebaMessage: function(resolve, reject){
		if (!CustomizableUI.getWidget(this._id).areaType) return;
		var {info,  setInterval} = this,
			isPromise = (typeof resolve == 'function') && (typeof reject == 'function'),
			popupNotification = this.popupNotification.bind(this),
			isWindowPrivate = this.isWindowPrivate.bind(this),
			clearTiebaMsg = this.clearTiebaMsg.bind(this),
			popupPanel = this.popupPanel.bind(this),
			setBadge = this.setBadge.bind(this),
			_loading = this._loading || null;

		setInterval(false);
		if(this._tiebaMessageRequest && this._tiebaMessageRequest.status !== 200){
			this._tiebaMessageRequest.abort();
		}

		this._tiebaMessageRequest = this.ajax({
			url: 'http://message.tieba.baidu.com/i/msg/get_data?t=' + new Date().getTime(),
			method: 'GET',
			timeout: 10000,
			ontimeout: function () {
				clearInterval(_loading);
				popupNotification(info.neterr);
				isPromise && reject();
			},
			onload :function (req) {
				req = req.target;
				var n = req.responseText.match(/\d+/g);
				if(req.status != 200 || !n || n.length != 23) {
					clearInterval(_loading);
					isPromise && reject();
					return popupNotification(req.status != 200 ? info.neterr : info.expired);
				}
				n = n.map(function (i) parseInt(i));
				
				var message = [],
					count = 0,
					tbUrl = 'http://tieba.baidu.com/i/sys/jump?u='+ (new Date().getTime()) + '&type=';
				for(var i=0; i<n.length; i++){
					if(n[i] != 0 && (i in info.type)){
						count += n[i];
						message.push({
							text: n[i] + '个' + info.type[i][1],
							type: i,
							value: n[i],
							url: (i == 9 ? 'http://tieba.baidu.com/pmc/': tbUrl) + info.type[i][0]
						});
					}
				}

				info._message = [message, count];
				if(message.length == 0) {
					setTimeout(function(){clearInterval(_loading); setBadge(count, message);}, 2500);
					return isPromise && reject();
				}else{
					clearInterval(_loading);
				}
				setBadge(count, message);
				isPromise && resolve();

				popupNotification('你共有'+ count + '条消息未读。\n\t' + message.map(function(m) m.text).join(', \n\t'), {
					observe: function(subject, topic, data) {
						if(topic == 'alertclickcallback'){
							var ip = (('privateTab' in window) && !isWindowPrivate());
							ip && privateTab.readyToOpenTab(false);
							for(var i of message){
								clearTiebaMsg(i.type);
								gBrowser.loadOneTab(i.url, null, null, null, false, false);
							}
							ip && privateTab.stopToOpenTabs();
							setBadge(0);
						}
					}
				});
			}
		});
		setInterval.call(this);
	},

	ajax: function(obj){
		var req = new XMLHttpRequest();
		req.open(obj.method, obj.url, true);
		if(obj.headers){
			for(var i in obj.headers){
				req.setRequestHeader(i, obj.headers[i]);
			}
		}
		if(obj.timeout) req.timeout = obj.timeout;
		if(obj.ontimeout) {
			req.ontimeout = obj.ontimeout;
			req.onerror = obj.ontimeout;
		}
		if(obj.onload) req.onload = obj.onload;
		req.send(null);
		return req;
	},

	setStyle: function(){
		var cssStr = (function(){/*
			@-moz-document url("chrome://browser/content/browser.xul"){
				<badge>

				#tiebaNotification-toolbar-button {
					-moz-binding: url('data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxiaW5kaW5ncyB4bWxucz0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy94YmwiIHhtbG5zOnhibD0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy94YmwiIHhtbG5zOnh1bD0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy9rZXltYXN0ZXIvZ2F0ZWtlZXBlci90aGVyZS5pcy5vbmx5Lnh1bCI+Cgk8YmluZGluZyBpZD0idGllYmFOb3RpZmljYXRpb24tdG9vbGJhci1idXR0b24iIGV4dGVuZHM9ImNocm9tZTovL2dsb2JhbC9jb250ZW50L2JpbmRpbmdzL3Rvb2xiYXJidXR0b24ueG1sI3Rvb2xiYXJidXR0b24iPgoJCTxjb250ZW50PgoJCQk8Y2hpbGRyZW4gaW5jbHVkZXM9Im9ic2VydmVzfHRlbXBsYXRlfG1lbnVwb3B1cHxwYW5lbHx0b29sdGlwIiAvPgoJCQk8eHVsOmhib3ggY2xhc3M9InRvb2xiYXJidXR0b24tYmFkZ2UtY29udGFpbmVyIiBhbGlnbj0ic3RhcnQiIHBhY2s9ImVuZCI+CgkJCQk8eHVsOmhib3ggY2xhc3M9InRvb2xiYXJidXR0b24tYmFkZ2UiIHhibDppbmhlcml0cz0iYmFkZ2UiIC8+CgkJCQk8eHVsOmltYWdlIGNsYXNzPSJ0b29sYmFyYnV0dG9uLWljb24iIHhibDppbmhlcml0cz0idmFsaWRhdGUsc3JjPWltYWdlLGxhYmVsIiAvPjwveHVsOmhib3g+CgkJCTx4dWw6bGFiZWwgY2xhc3M9InRvb2xiYXJidXR0b24tdGV4dCIgY3JvcD0icmlnaHQiIGZsZXg9IjEiIHhibDppbmhlcml0cz0idmFsdWU9bGFiZWwsYWNjZXNza2V5LGNyb3Asd3JhcCIgLz4KCQkJPHh1bDpsYWJlbCBjbGFzcz0idG9vbGJhcmJ1dHRvbi1tdWx0aWxpbmUtdGV4dCIgZmxleD0iMSIgeGJsOmluaGVyaXRzPSJ4Ymw6dGV4dD1sYWJlbCxhY2Nlc3NrZXksd3JhcCIgLz4KCQk8L2NvbnRlbnQ+Cgk8L2JpbmRpbmc+CjwvYmluZGluZ3M+#tiebaNotification-toolbar-button');
					
				}

				#tiebaNotification-toolbar-button .toolbarbutton-badge-container > .toolbarbutton-icon[label]:not([label=""]) {
					-moz-margin-end: 0 !important;
				}
				#tiebaNotification-toolbar-button .toolbarbutton-badge[badge=""] {
					display: none !important;
				}
				#tiebaNotification-toolbar-button .toolbarbutton-badge {
					background-color: #d90000 !important;
				}
				#tiebaNotification-toolbar-button .toolbarbutton-badge::after {
					font-size: 10px !important !important;
					font-weight: bold !important !important;
					padding: 1px 2px 2px !important;
					color: #fff !important;
					background-color: inherit !important;
					border-radius: 2px !important;
					box-shadow: 0 1px 0 hsla(0, 100%, 100%, .2) inset,
								0 -1px 0 hsla(0, 0%, 0%, .1) inset,
								0 1px 0 hsla(206, 50%, 10%, .2) !important;
					border-width: 0 !important;
					position: absolute !important;
					top: -4px !important;
					right: -2px !important;
					min-width: 10px !important;
					line-height: 10px !important;
					text-align: center !important;
				}
				#tiebaNotification-toolbar-button .toolbarbutton-badge:-moz-locale-dir(rtl)::after {
					left: -2px !important;
					right: auto !important;
				}
				#tiebaNotification-toolbar-button .toolbarbutton-badge-container {
					position: relative !important;
				}
				</badge>

				#tiebaNotification-toolbar-button {
					-moz-image-region:rect(0px, 18px, 18px, 0px);
					list-style-image:url("$URL1$");
				}
				toolbar[brighttext] #tiebaNotification-toolbar-button{
					-moz-image-region:rect(18px, 18px, 36px, 0px);
				}
				toolbarpaletteitem[place="palette"] > #tiebaNotification-toolbar-button{
					-moz-image-region:rect(0px, 32px, 32px, 0px);
					list-style-image:url("$URL2$");
				}
				#tiebaNotification-view-panel ul{
					list-style:none;
					margin:0;
					padding:0;
				}
				#tiebaNotification-view-panel li:hover{
					background-color:#eee;
					cursor: pointer;
				}
			}
		*/}).toString().replace(/^.+\s|.+$/g,'')
			.replace(/\$URL1\$/, this.info.icon.button)
			.replace(/\$URL2\$/, this.info.icon.notification)
			.replace(/<badge>([^<]+)<\/badge>/, 
				!!~Services.vc.compare(Services.appinfo.platformVersion, '35.0a1') ? '' : '$1');

		var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
		var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
		sss.loadAndRegisterSheet(ios.newURI('data:text/css,/*tiebaNotification.uc.js*/' + 
				encodeURIComponent(cssStr),null, null), sss.USER_SHEET);
	},
};

tiebaNotification.init();

})();


