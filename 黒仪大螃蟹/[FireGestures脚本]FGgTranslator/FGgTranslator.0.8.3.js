(function (window, document){
// ==FireGesturesScript==
// @name           FGgTranslator
// @author         Crab
// @description    Google划词翻译
// @compatibility  FF26+
// @version        2014.05.05.0.08.3
// @Note           需要安装FireGestures扩展。
// @Note           [140320]更换谷歌翻译服务器地址为IP(173.194.127.152)，访问速度应该会快点
// @Note           [140322]还原上次变更。改进长文本发音问题。
// @Note           [140404]修正翻译iframe下的文本问题。
// @Note           [140410][140421][140505]修正小错误。
// ==/FireGesturesScript==
	if(!window.FGgTranslator){
		window.FGgTranslator = {
			offset: {
				x: 50,   //翻译框出现的位置相对于鼠标手势结束时的横坐标位移
				y: 10,   //纵坐标位移, 值越大越往 上/左
			},
			link: "https://translate.google.com.hk/",
			//link: "http://173.194.127.152/", //直接使用服务器IP，
											 //可以换一个比较通畅的google翻译服务器地址或IP,
											 //注意地址或IP最后还有还有"/"。
			selectText: null,
			boxElements:null,
			player: null,
			to: "zh-CN",
			from: "auto",
			checkLanguge: "auto",
			camelCase: false,
			preSelection: [],
			originDocument: null,
			languages:{
				auto: '自动检测',
				'zh-CN': '中文(简体)',
				'zh-TW': '中文(繁体)',
				en: '英语 English',
				ja: '日语 Japanese',
				fr: '法语 French',
				ru: '俄语 Russian',
				de: '德语 German',
				ko: '韩语 Korean',
				sq: '阿尔巴尼亚语 Albanian',
				ar: '阿拉伯语 Arabic',
				az: '阿塞拜疆语 Azerbaijani',
				ga: '爱尔兰语 Irish',
				et: '爱沙尼亚语 Estonian',
				eu: '巴斯克语 Basque',
				be: '白俄罗斯语 Belarusian',
				bg: '保加利亚语 Bulgarian',
				is: '冰岛语 Icelandic',
				pl: '波兰语 Polish',
				bs: '波斯尼亚语 Bosnian',
				fa: '波斯语 Persian',
				af: '布尔语(南非荷兰语) Afrikaans',
				da: '丹麦语 Danish',
				tl: '菲律宾语 Filipino',
				fi: '芬兰语 Finnish',
				km: '高棉语 Khmer',
				ka: '格鲁吉亚语 Georgian',
				gu: '古吉拉特语 Gujarati',
				ht: '海地克里奥尔语 Haitian Creole',
				ha: '豪萨语 Hausa',
				nl: '荷兰语 Dutch',
				gl: '加利西亚语 Galician',
				ca: '加泰罗尼亚语 Catalan',
				cs: '捷克语 Czech',
				kn: '卡纳达语 Kannada',
				hr: '克罗地亚语 Croatian',
				la: '拉丁语 Latin',
				lv: '拉脱维亚语 Latvian',
				lo: '老挝语 Lao',
				lt: '立陶宛语 Lithuanian',
				ro: '罗马尼亚语 Romanian',
				mt: '马耳他语 Maltese',
				mr: '马拉地语 Marathi',
				ms: '马来语 Malay',
				mk: '马其顿语 Macedonian',
				mi: '毛利语 Maori',
				mn: '蒙古语 Mongolian',
				bn: '孟加拉语 Bengali',
				hmn: '苗语 Hmong',
				zu: '南非祖鲁语 Zulu',
				ne: '尼泊尔语 Nepali',
				no: '挪威语 Norwegian',
				pa: '旁遮普语 Punjabi',
				pt: '葡萄牙语 Portuguese',
				sv: '瑞典语 Swedish',
				sr: '塞尔维亚语 Serbian',
				eo: '世界语 Esperanto',
				sk: '斯洛伐克语 Slovak',
				sl: '斯洛文尼亚语 Slovenian',
				sw: '斯瓦希里语 Swahili',
				ceb: '宿务语 Cebuano',
				so: '索马里语 Somali',
				te: '泰卢固语 Telugu',
				ta: '泰米尔语 Tamil',
				th: '泰语 Thai',
				tr: '土耳其语 Turkish',
				cy: '威尔士语 Welsh',
				ur: '乌尔都语 Urdu',
				uk: '乌克兰语 Ukrainian',
				iw: '希伯来语 Hebrew',
				el: '希腊语 Greek',
				es: '西班牙语 Spanish',
				hu: '匈牙利语 Hungarian',
				hy: '亚美尼亚语 Armenian',
				ig: '伊博语 Igbo',
				it: '意大利语 Italian',
				yi: '意第绪语 Yiddish',
				hi: '印地语 Hindi',
				id: '印尼语 Indonesian',
				jw: '印尼爪哇语 Javanese',
				yo: '约鲁巴语 Yoruba',
				vi: '越南语 Vietnamese',
			},

			init: function(event){
				this.selectText = this.getSelection(event);
				if(this.selectText.replace(/[\n\t\s]+/g,"") === ""){
					if(readFromClipboard && readFromClipboard().replace(/[\n\t\s]+/g,"") !== ""){
						this.selectText = readFromClipboard().replace(/\n+/g,"\n");
					}else{
						return;
					}
				}

				if(!this.boxElements){
					this.getTranslateBox();
					this.boxElements.box.drag = {
						status: false,
						X     : 0,
						Y     : 0
					};

					this.boxElements.style = 
							this.setStyle(this.boxElements.box);

					({
						from      : this.from,
						to        : this.to,
						camelCase : this.camelCase
					}) = this.getPref();

					document.addEventListener("mousedown",this, false);
					document.addEventListener("mouseup",this, false);
					document.addEventListener("mousemove",this, false);
					document.addEventListener("keypass",this, false);
					window.addEventListener("unload",this, false);
					this.originDocument = event.view.document;
					this.originDocument.addEventListener("mousedown",this, false);
				}

				var pageXY = (function(e){
					var target = e.view,
						top = 0,
						left = 0,
						rect = null;
					while(target != null && target != window.top){
						rect = target.frameElement.getBoundingClientRect();
						top += rect.top || 0;
						left += rect.left || 0;
						target = target.parent;
					}
					return {
						x: left + e.clientX,
						y: top + e.clientY
					};
				})(event);

				this.boxElements.box.style.top = pageXY.y + window.pageYOffset-this.offset.y +"px";
				this.boxElements.box.style.left = pageXY.x + window.pageXOffset-this.offset.x +"px";

				this.setTranslateText();
			},

			setTranslateText: function(word){
				word = word || this.camelCaseText;

				//设置链接
				this.boxElements.setResultLink({
					text      : word,
					from      : this.from,
					to        : this.to,
				});

				function ftt(text, title, rt){
					return '<span'+(title ? (' title="' + (rt ? rt+"\n" : "") +'原文:\n\t'+ sF(title) +'"') : '')
							+' class="_FgGTrR-T-Span">'+ (sF(text).replace(/\n+/g,"<br />")) + '</span>';
				}

				var sF = this.strFilter,
					resultBox = this.boxElements.resultBox;

				if(resultBox.ajaxRequest && resultBox.ajaxRequest.status !== 200){
					resultBox.ajaxRequest.abort();
				}

				resultBox.ajaxRequest = this.ajax({
					method : "GET",
					url : this.link + "translate_a/t?client=t&hl=auto&sl="+this.from+"&tl="+this.to
									+"&ie=UTF-8&oe=UTF-8&multires=1&otf=2&srcrom=1&ssel=0&tsel=0&sc=1&q=" 
									+ encodeURIComponent(word),
					onload : function(res) {
						res = res.target;
						if (res.status == 200) {
							clearInterval(resultBox.loading);
							var text = eval("(" + res.responseText +")"),
								rt = "",//译文
								rp = "";//注音

							if(!res.responseText || !text[0]){
								return this.statusAlert("未知错误");
							}

							//原文所属语言
							this.checkLanguge = text[2];

							var t = text[0];
							for(var i=0;i<t.length;i++){
								//译文
								rt += ftt(t[i][0], t[i][1], 
									(this.languages[text[2]] + 
										" -&gt; " + this.languages[this.to])
											.replace(/\s[A-Za-z]+/g,""));
								//注音
								rp += ftt(t[i][3], t[i][1]);
							}

							//显示翻译文本
							this.boxElements.resultText = rt
								.replace(/(^\<span title\="[^"]+?" class\="[^"]+?"\>)((\<br \/\>)?[\s]?)*/,"$1")
								.replace(/\<span title\="[^"]+?" class\="[^"]+?"\>\<\/span\>/g,"")
								.replace(/(\<span title\="[^"]+?" class\=")([^"]+?)("\>[^\<]+)\<br \/\><\/span\>/g,
									"$1$2 "+"_FgGTrR-T-Span-P"+"$3</span><br />");

							//显示注音
							this.boxElements.phonetic = rp;

							//清空原来的
							while(this.boxElements.detail.children.length){
								this.boxElements.detail.removeChild(this.boxElements.detail.firstChild);
							}
							/*//////////////////////////////////*/
							/*
							<span class="_FgGTr-D-t1-Ci">[词性]</span>
							<ul class="_FgGTr-D-t1-Ul">
								<li class="_FgGTr-D-t1-li">
									<span>未翻译文本</span>
									<span>
										<ul>
											<li>译文1</li>
										</ul>
									</span>
								</li>
							</ul>*/

							if(text[1]){
								var t1 = text[1],
									sp = li = "";
								for(var m=0;m<t1.length;m++){
									li = '<span class="_FgGTr-D-t1-Ci">['+ sF(t1[m][0]) 
										+ '].</span><ul class="_FgGTr-D-t1-Ul">';
									for(var n=0;n<t1[m][2].length;n++){
										li += '<li class="_FgGTr-D-t1-li"><span>'
											+ sF(t1[m][2][n][0]) +'</span><span><ul>'
										for(var l=0;l<t1[m][2][n][1].length;l++){
											li += '<li>'+ sF(t1[m][2][n][1][l]) +'</li>';
										}
										li += '</ul></span></li>';
									}
									sp += li + '</ul>';
								}
								if(!!sp){
									var span = document.createElement("span");
									span.innerHTML = sp;
									this.boxElements.detail.appendChild(span);
								}
							/*//////////////////////////////////*/
							/*
							<span class="_FgGTr-D-t5-Ul"><ul>
								<li class="_FgGTr-D-t5-li1">
									<span>未翻译文本</span>
								</li>
							</ul>
							<ul>
								<li class="_FgGTr-D-t5-li2">
									<span>
										<span>译文0</span>
										<ul>
											<li>译文1</li>
										</ul>
									</span>
								</li>
							</ul></span>*/
							}else if(text[5]){
								var t5 = text[5],
									li1 = li2 = '',
									filter = {};
								for(var j=0;j<t5.length;j++){
									if(!(t5[j][0] in filter) && t5[j][2] && 
										(t5[j][2].length!=1 || (t5[j][0] != t5[j][2][0][0])) &&
										!sF(t5[j][0], t5[j][2][0][0])
									){
										li1 += '<li class="_FgGTr-D-t5-li1"><span>'+sF(t5[j][0])+'</span></li>';
										li2 += '<li class="_FgGTr-D-t5-li2"><span><span>'
											+sF(t5[j][2][0][0])+'</span><ul>';
										for(var k=0;k<t5[j][2].length;k++){
											li2 += '<li>'+sF(t5[j][2][k][0])+'</li>';
										}
										li2 += '</ul></span></li>';
										filter[t5[j][0]] = true;
									}
								}

								if(!!li1 && !!li2){
									var span = document.createElement("span");
									span.innerHTML = '<ul>'+li1+'</ul><ul>'+li2+'</ul>';
									this.boxElements.detail.appendChild(span);
									this.boxElements.detail.moreUl = span.lastChild;
								}
							}

							//设置滚动条
							this.setClassName(this.boxElements.detail, "_FgGTrDetailOverflow", false);
							if(text[1] || text[5]){
								this.setScrollbar();
							}

						}else if(res.status == 404){
							this.statusAlert("错误：访问google翻译服务器出错。");
						}else if(res.status == 414){
							this.statusAlert("错误：要翻译的文本过长。");
						}
					}.bind(this)
				});
			},

			getTranslateBox: function (){
				var box = document.createElement("div");
				box.id = "_FgGTrMainBox";
				box.innerHTML = '\
					<div id="_FgGTrResult">\
						<div>\
							<a target="_blank" href="">\
								<span class="_FgGTrResultText">loading</span>\
							</a>\
						</div>\
						<div class="_FgGTrSoundAndAlertBox">\
							<a class="_FgGTrSoundButton" title="发音"></a>\
							<span class="_FgGTrAlertBox"></span>\
							<span class="_FgGTrSoundPhonetic"></span>\
						</div>\
						<div class="_FgGTrDetail"></div>\
						<div class="_FgGTrOptions">\
							<a class="_FgGTrOptionsToggle" title="设置">▼</a>\
						</div>\
					</div>\
					<div class="_FgGTrOptionsBox"></div>';
				document.body.appendChild(box);

				var that = this;
				this.boxElements = {
					box: box,
					toggleOn: false,
					style: null,
					set resultText(text) this.resultBox.innerHTML = text,
					get resultText() this.resultBox.textContent,
					set phonetic(text) this.phoneticBox.innerHTML = text,
					set alertBox(text) this.alertBox.textContent = text,
					get alertBox() this.get("AlertBox"),
					get phoneticBox() this.get("SoundPhonetic"),
					get soundButton() this.get("SoundButton"),
					get resultBox() this.get("ResultText"),
					get toggleButton() this.get("OptionsToggle"),
					get optionsBox()  this.get("OptionsBox"),
					get detail() this.get("Detail"),
					get swapButton() this.get("SwapButton"),
					get saveButton() this.get("OptionsSave"),
					get cancelButton() this.get("OptionsCancel"),
					get checkbox() this.get("OptionsCheckbox"),
					get: function(name) {
						return this.box.querySelector("._FgGTr"+ name);
					},
					setResultLink: function(obj) {
						this.resultBox.parentNode.href = 
								(that.link.indexOf("translate") < 0 
									//无法使用服务器IP直接连接至谷歌翻译页面
									? "https://translate.google.com.hk/"
									: that.link) + "?text="+ 
								encodeURIComponent(obj.text || that.camelCaseText) +"&langpair="+
								(obj.from || that.from) +"|"+
								(obj.to || that.to);
					},
				};

				clearInterval(this.boxElements.resultBox.loading);
				this.boxElements.resultBox.loading = setInterval(function(){
					try{
						if(this.boxElements.resultText.length<10){
							this.boxElements.resultText+=".";
						}else{
							this.boxElements.resultText="loading";
						}
					}catch(ex){
						console.log(ex);
						clearInterval(arguments.callee);
					}
				}.bind(this), 500);
			},

			setOptionsBox: function(){
				var o = this.boxElements;
				this.setClassName(o.toggleButton.parentNode, "_FgGTrOptionsHidden", true);
				if(o.optionsBox.children.length){
					return this.toggleHidden(o.optionsBox);
				}
				var optionsBox = o.optionsBox;
				optionsBox.innerHTML = '\
					<div>\
						<span>从:</span>\
						<select class="_FgGTrOptionsSelect _FgGTrOptionsSelectFrom"></select>\
						<span>译作:</span>\
						<a class="_FgGTrSwapButton" title="交换"></a>\
						<select class="_FgGTrOptionsSelect _FgGTrOptionsSelectTo"></select>\
					</div>\
					<div>\
						<span id="_FgGTrOptionsCheckboxSpan">\
							<input type="checkbox" class="_FgGTrOptionsCheckbox" />\
							<span>驼峰式</span>\
						</span>\
						<span id="_FgGTrOptionsButtonSpan">\
							<a class="_FgGTrOptionsButton _FgGTrOptionsSave">保存</a>\
							<a class="_FgGTrOptionsButton _FgGTrOptionsCancel">取消</a>\
						</span>\
					</div>';
				var select = optionsBox.getElementsByClassName("_FgGTrOptionsSelect");
				for(var i=0;i<2;i++){
					var itemsText = item = "";
					for(item in this.languages){
						itemsText+='<option value="'+ item +'">'+ this.languages[item] +'</option>';
					}
					select[i].innerHTML = itemsText;
					select[i].addEventListener("change", this, false);
				}

				o.toggleOn = true;
				o.checkbox.checked = this.camelCase;
				select[0].value    = this.from;
				select[1].value    = this.to;

				o.checkbox.addEventListener("change", this, false);
			},

			get getPlayList (){
				var str = this.camelCaseText,
					strArr = [],
					strArr2 = [],
					index = 0;
				for(var i=0; i<str.length; i++){
					if(/[ \u3000\n\r\t\s\,\.\?\!\！\？\。\，\u4e00-\u9fa5]/.test(str.charAt(i))){
						strArr.push(str.substring(index, i+1));
						index = i+1;
					}
				}
				if(!strArr.length){
					strArr[0] = str;
				}
				var strLeng = "",
					u1 = this.link + "translate_tts?&q=",
					u2 = "&tl=" + this.checkLanguge + "&prev=input";
				for(var j=0; j<strArr.length; j++){
					if((strLeng + strArr[j]).length<=100){
						strLeng += strArr[j];
					}else{
						strArr2.push(u1 + encodeURIComponent(strLeng) + u2);
						strLeng = strArr[j];
					}
					if(j==strArr.length-1){
						strArr2.push(u1 + encodeURIComponent(strLeng) + u2);
					}
				}
				return strArr2;
			},

			playSound: function(){
				var that = this,
					PL = that.getPlayList,
					PS = that.playSound;

				if(!PS.initialized){
					PS.get = function(idx){
						this.initialized = true;
						if(that.getPlayList[idx])
						that.ajax({
							method: 'GET',
							url: that.getPlayList[idx],
							headers:{
								//当使用服务器IP时要发送Host，否则返回404无法发音
								Host    : "translate.google.com",
								Referer : "http://translate.google.com/"
							},
							onload: function(res) {
								res = res.target;
								if (res.status == 200) {
									var tpl = that.getPlayList;
									if(idx == 0){
										that.player.setAttribute("src", tpl[0]);
										that.player.play();
									}

									if(idx + 1 <= tpl.length){
										PS.get(idx + 1);
									}
								}else if(res.status == 404){
									that.statusAlert("错误：无此语音，或文本过长。", 1000);
								}
							}
						});
					};
				}

				if(!this.player){
					var audio = document.createElement('audio');
					this.boxElements.box.appendChild(audio);
					this.player = audio;
					this.player.pIndex = 0;
					this.player.onended = function(){
						this.pIndex += 1;
						if(this.pIndex == PL.length){
							this.pIndex = 0;
							this.pause();
						}else{
							PS.get(this.pIndex);
							this.setAttribute("src", that.getPlayList[this.pIndex]);
							this.play();
						}
					};
					this.player.onloadstart = function(){
						that.statusAlert("共"+ PL.length
									+ "段语音，正在播放第" + (this.pIndex + 1) + "段", 2500);
					};
					this.player.onerror = function(e){
						var i = that.getPlayList.indexOf(e.target.currentSrc);
						that.statusAlert("错误: 第"+ ((!!~i ? i : 0) + 1) +"段语音加载失败", 2500);
					};
				}

				if (this.player && this.getPlayList.every(function(a, b){
						return PL[b] == a;
				})){
					PS.get(this.player.pIndex = 0);
				}
			},

			statusAlert: function(text, delay){
				clearTimeout(this.boxElements.alertBox.hideTimer);
				this.setClassName(this.boxElements.alertBox, "_FgGTrAlertBoxHide", false);
				this.boxElements.alertBox = text;
				this.boxElements.alertBox.hideTimer = setTimeout(function(){
					try{
						!delay || this.setClassName(this.boxElements.alertBox, 
														"_FgGTrAlertBoxHide", true);
					}catch(ex){
						clearTimeout(arguments.callee);
					}
				}.bind(this), typeof delay == "number" ? delay : 1000);
			},

			ajax: function(obj){
				var req = new XMLHttpRequest();
				req.open(obj.method, obj.url, true);
				if(obj.headers){
					for(var i in obj.headers){
						req.setRequestHeader(i, obj.headers[i]);
					}
				}
				req.send(null);
				req.onload = obj.onload;
				return req;
			},

			removeTranslateBox: function(){
				clearInterval(this.boxElements.resultBox.loading);
				this.selectText = null;
				this.player = null;
				this.preSelection = [];
				if(this.boxElements){
					document.body.removeChild(this.boxElements.box);
					this.boxElements = null;
				}
				document.removeEventListener("mousedown",this, false);
				document.removeEventListener("mouseup",this, false);
				document.removeEventListener("mousemove",this, false);
				document.removeEventListener("keypass",this, false);
				window.removeEventListener("unload", this, false);
				window.removeEventListener("DOMMouseScroll", this, false);
				this.originDocument.removeEventListener("mousedown",this, false);
			},

			setScrollbar: function(){
				var detailBox = this.boxElements.detail,
					scrollbar = document.createElement("div"),
					thumb = document.createElement("div"),
					detailHeight = 150,
					contentBox = this.boxElements.detail.firstChild;
				if(!contentBox) return;
				setTimeout(function(){
					var contentStyle = getComputedStyle(contentBox, null),
						contentHeight =  parseInt(contentStyle.height),
						contentWidth = parseInt(contentStyle.width);

					if(contentHeight < 250) return;
					scrollbar.className = "_FgGTr-scrollbar";
					thumb.className = "_FgGTr-thumb";


					detailBox.scrollbar = {
						bar: scrollbar,
						thumb: thumb,
						status: false,
						contentBox: contentBox,
						Y:0,
						barHeight: parseInt(detailHeight),
						thumbHeight: parseInt(detailHeight / 
									contentBox.offsetHeight * detailHeight),
					};

					this.setClassName(detailBox, "_FgGTrDetailOverflow", true);

					if(contentWidth>=382){
						contentWidth = 382
					}else{
						contentWidth += 12;
					}

					this.boxElements.style.textContent = 
							this.boxElements.style.CssText
								.replace(/\$([^\:]+\:\s*?)overflowMinWidth;\$/, 
									"$1"+(contentWidth+"px !important;"))
								.replace(/\$([^\:]+\:\s*?)ThumbHeight;\$/,
									"$1"+(detailBox.scrollbar.thumbHeight+"px !important;"));

					scrollbar.appendChild(thumb);
					detailBox.appendChild(scrollbar);
					window.addEventListener("DOMMouseScroll", this, false);
				}.bind(this), 50);
			},

			handleEvent: function(event){
				var box = this.boxElements.box;
				if(!box) return;
				var target = event.target,
					drag = box.drag,
					o = this.boxElements;
				if(!event.altKey && event.type == "mousedown" && event.button==0){
					if(box.contains(target)){
						switch(target){
							case o.soundButton:
								this.playSound();
								break;
							case o.toggleButton:
								this.setOptionsBox();
								break;
							case o.saveButton:
								this.setPref();
								this.toggleHidden();
								break;
							case o.cancelButton:
								this.toggleHidden();
								break;
							case o.swapButton:
								this.swapLanguages();
								break;
							default:
								if(o.detail.scrollbar && 
									target == o.detail.scrollbar.thumb){
									o.detail.scrollbar.status = true;
									o.detail.scrollbar.Y = event.clientY - 
												o.detail.scrollbar.thumb.offsetTop;
									break;
								}
								if((o.detail.children[0] && o.detail.children[0] != target && 
									o.detail.children[0].contains(target))
								&& !(target.classList && target.classList.contains("_FgGTr-D-t1-Ci"))
								) return;
								drag.status = true;
								this.setClassName(o.box, "_FgGTrOptionsGrab", true);
								drag.X = event.clientX - box.offsetLeft;
								drag.Y = event.clientY - box.offsetTop;
						}
					}else{
						this.removeTranslateBox();
					}
					if(!~Array.prototype.slice.call(box.querySelectorAll("._FgGTrOptionsSelect"))
							.indexOf(target) &&
							(drag.status || (o.detail.scrollbar && o.detail.scrollbar.status))){
						event.preventDefault();
					}
				}
				if(event.type == "mouseup" || event.type == "keypass"){
					if(event.type == "mouseup"){
						box.drag.status = false;
						o.detail.scrollbar && (o.detail.scrollbar.status = false);
						this.setClassName(o.box, "_FgGTrOptionsGrab _FgGTrOptionsGrabbing", false);
					}

					clearTimeout(o.selectionTimer);
					if(((o.detail.children[0] && o.detail.children[0] != target && 
									o.detail.children[0].contains(target))
								&& !(target.classList && target.classList.contains("_FgGTr-D-t1-Ci"))
						) || event.altKey || event.button!=0
					) return;
					o.selectionTimer = setTimeout(function(){
						var selection = window.getSelection();
						for (var i in this.preSelection){
							selection.addRange(this.preSelection[i]);
						}
					}.bind(this),50);
				}
				if(event.type == "mousemove"){
					if(drag.status){
						this.setClassName(o.box, "_FgGTrOptionsGrabbing", true);
						this.setClassName(o.box, "_FgGTrOptionsGrab",false);
						box.style.left = event.clientX - drag.X + "px";
						box.style.top  = event.clientY - drag.Y + "px";
					}
					if(o.detail.scrollbar && o.detail.scrollbar.status){
						var scroll = o.detail.scrollbar,
							T = event.clientY - scroll.Y,
							Y = p = 0;
						if(T <= scroll.bar.offsetTop){
							Y = scroll.bar.offsetTop;
						}else if(T >= scroll.bar.offsetHeight - scroll.thumbHeight){
							Y = scroll.bar.offsetHeight - scroll.thumbHeight;
						}else{
							Y = T;
						}
						p = (scroll.thumb.offsetTop - scroll.bar.offsetTop) / 
									(scroll.bar.offsetHeight - scroll.thumbHeight);
						if(p>=0.95){
							p = 1;
						}else if(p<0.05){
							p = 0;
						}

						scroll.contentBox.style.top = 
									parseInt((o.detail.offsetHeight - 
										scroll.contentBox.offsetHeight) * p) + "px";

						scroll.thumb.style.top = Y +"px";

						this.setClassName(scroll.bar, "_FgGTrScrolling", true);
						clearTimeout(scroll.scrTimer);
						scroll.scrTimer = setTimeout(function(){
							this.setClassName(scroll.bar, "_FgGTrScrolling", false);
						}.bind(this),500);
					}


					if(o.detail.moreUl && o.detail.moreUl.contains(target)){
						Array.prototype.slice.call(o.detail.moreUl.children).forEach(function(li){
							if(li.contains(target)){
								li.getElementsByTagName("ul")[0].style.top 
										= li.getClientRects()[0].top + 16 +"px";
							}
						});
					}
				}

				if(event.type == "DOMMouseScroll"){
					if(o.detail.contains(target)){
						event.preventDefault();
						var scroll = o.detail.scrollbar,
							s = parseInt(0 - event.detail*4),
							ct = scroll.contentBox.offsetTop + s,
							cy = p = t = 0;

						if(ct <= o.detail.offsetHeight - scroll.contentBox.offsetHeight){
							cy = o.detail.offsetHeight-scroll.contentBox.offsetHeight;
						}else if(ct>=0){
							cy = 0;
						}else{
							cy = ct;
						}
						p = cy/(o.detail.offsetHeight - scroll.contentBox.offsetHeight);

						if(p>=0.95){
							p = 1;
						}else if(p<0.05){
							p = 0;
						}

						t = parseInt((scroll.bar.offsetHeight - scroll.thumbHeight)*p);
						if(t<=0){
							t=0;
						}else if(t>= scroll.bar.offsetHeight - scroll.thumbHeight){
							t = scroll.bar.offsetHeight - scroll.thumbHeight;
						}

						scroll.thumb.style.top = parseInt(t*p) + "px";
						scroll.contentBox.style.top = cy + "px";

						this.setClassName(scroll.bar, "_FgGTrScrolling", true);
						if(scroll.contentBox.contains(target)){
							this.setClassName(scroll.contentBox, "_FgGTrScrolling", true);
						}
						clearTimeout(scroll.scrTimer);
						scroll.scrTimer = setTimeout(function(){
							this.setClassName(scroll.bar, "_FgGTrScrolling", false);
							this.setClassName(scroll.contentBox, "_FgGTrScrolling", false);
						}.bind(this),500);
					}
				}

				if(event.type == "change"){
					if(box.contains(target)){
						if(target == o.checkbox){
							this.toggleCamelCase();
						}else if(target.className && target.className.indexOf("Select")>0){
							this.selectLanguages(event);
						}
					}
				}
				if(event.type == "unload"){
					clearInterval(o.resultBox.loading);
					this.removeTranslateBox();
					window.FGgTranslator = null;
				}
			},

			toggleCamelCase: function(){
				var checked = this.boxElements.checkbox.checked;
				this.camelCase = this.camelCase != checked ?
							 checked : this.camelCase;

				this.setTranslateText();
			},

			swapLanguages: function(){
				var select = this.boxElements.box.getElementsByClassName("_FgGTrOptionsSelect");
				[select[0].value, select[1].value] = [select[1].value, select[0].value];
				this.from = select[0].value;
				this.to = select[1].value;
				this.setTranslateText();
			},

			selectLanguages: function(event){
				var target = event.target;
				if(target.className.indexOf("SelectTo")>0){
					this.to = target.value;
				}else{
					this.from = target.value;
				}
				this.setTranslateText();
			},

			toggleHidden: function(elm){
				var o = this.boxElements,
					t = o.toggleOn,
					c = "_FgGTrOptionsHidden";
				if(elm){
					this.setClassName(elm, c, t);
				}else{
					this.setClassName(o.toggleButton.parentNode, c, !t);
					this.setClassName(o.optionsBox, c, t);
				}
				o.toggleOn = !t;
			},

			setClassName: function(elm,className,add){
				var classList = elm.className.split(" "),
					_classList = [];
				className = className.split(" ");

				for(var i=0;i<className.length;i++){
					var find = 0;
					for(var j=0;j<classList.length;j++){
						if(className[i] == classList[j]){
							if(!add && classList[0]!=""){
								classList.splice(j,1);
							}
						}else{
							if(add) find++;
						}
					}
					if(add && find == classList.length){
						_classList.push(className[i]);
					}
				}
				if(add){
					classList = classList[0]!="" ? classList.concat(_classList) : _classList;
				}

				classList = classList.sort().join(" ");
				if(elm.className.split(" ").sort().join(" ") != classList){
					elm.className = classList;
				}
			},

			xpPref:function(value){
				var Cc = Components.classes,
					Ci = Components.interfaces,
					prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
				if(arguments.length==0){
					return prefs.getComplexValue("FireGestures.FGgTranslator.optionJSON", Ci.nsISupportsString).data;
				}else{
					var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
					str.data = value;
					prefs.setComplexValue("FireGestures.FGgTranslator.optionJSON", Ci.nsISupportsString, str);
					return value;
				}
			},

			getPref: function(){
				try{
					return JSON.parse(this.xpPref());
				}catch(ex){
					var pref = {
						from:         this.from,
						to:           this.to,
						camelCase:    this.camelCase
					};
					this.xpPref(JSON.stringify(pref));
					return pref;
				}
			},

			setPref: function(json){
				if(json){
					this.from       = json.from || this.from;
					this.to         = json.to || this.to;
					this.camelCase  = json.camelCase || this.camelCase;
				}

				this.xpPref(JSON.stringify({
					from:         this.from,
					to:           this.to,
					camelCase:    this.camelCase
				}));
			},

			get camelCaseText() {
				return (this.camelCase 
							? this.selectText
								.replace(/([A-Z0-9])([A-Z])([a-z])/g, 
									"$1 "+("$2".toLowerCase())+"$3")
								.replace(/([a-z])([A-Z])/g,
									"$1 "+("$2".toLowerCase()))
								.replace(/([A-Za-z])\.([A-Za-z])/g,
									"$1 $2")
							: this.selectText);
			},

			strFilter: function(str, num){
				num = num || 0;
				var f = [{
						"&":"&amp;",
						"'":"&#x27;",
						'"':"&#x22;",
						"<":"&lt;",
						">":"&gt;",
						"/":"&#47;",
					},
					" \"'“”‘’、｛｝{}[]【】.。…~·～〜，,;；:：" +
					"-=+*&＆＄$￥＊*＾^％%＃#＠@~()（）<>《》?？！!"
					],
					sF = arguments.callee;

				if(typeof num == "number"){
					return str.replace(/./g, function(s){
							return num == 0 ? 
								(f[0][s] ? f[0][s] : s) : 
								(!!~f[1].indexOf(s) ? "" : s);
						});
				}else{
					return sF(str, 1).toLowerCase() == 
								sF(num, 1).toLowerCase();
				}
			},

			getSelection: function(event){
				var view = event.view,
					selection = view.getSelection(),
					txt = "";

				if(!this.selectText || !this.boxElements.box.contains(event.target)){
					this.preSelection = [];
					for (var i = 0; i < selection.rangeCount; i++){
						this.preSelection.push(selection.getRangeAt(i));
					}
				}

				function innrText(elemt) {
					var str = "",
						childs = elemt.childNodes;
					for (var i = 0; i < childs.length; i++) {
						if (childs[i].nodeType == 1){
							if(!!~"divph1h2h3h4h5h6pre"
									.indexOf(childs[i].tagName.toLowerCase())){
								str += arguments.callee(childs[i]) + "\n";
							}else if(childs[i].tagName == "BR"){
								str +=  "\n";
							}else{
								str += arguments.callee(childs[i]);
							}
						}else if (childs[i].nodeType == 3){
							str += childs[i].nodeValue;
						}
					}
					return str;
				}

				if(event && Array.prototype.slice
					.call(view.document.querySelectorAll("TEXTAREA, input"))
						.some(function(item){
							return item.contains(event.target);
						})
				){
					txt = event.target.value.substr(event.target.selectionStart, 
													event.target.selectionEnd - 
													event.target.selectionStart);
				}else{
					try{
						var tempElemnt = document.createElement("div")
						tempElemnt.appendChild(selection.getRangeAt(0).cloneContents());
						txt = innrText(tempElemnt);
					}catch(ex){
						return "";
					}
				}

				return txt.replace(/(\&nbsp\;)/g," ")
							.replace(/(\n\s*\n)/g,"\n")
							.replace(/\n+/g,"\n");
			},

			setStyle: function(element){
				var style = document.createElement("style"),
					CssText = (function(){/*
					#_FgGTrMainBox, #_FgGTrMainBox :-moz-any(a, span, div, ul, li, img){
						margin:0;
						padding:0;
						font-size:12px;
						font-weight:normal;
						font-family:"微软雅黑";
						font-style:normal;
						text-align:left;
						line-height:16px;
						background:none;
						color:#000;
						white-space:normal;
					}
					#_FgGTrMainBox span::after,
					#_FgGTrMainBox span::before{
						display:none;
					}
					#_FgGTrMainBox {
						position:absolute;
						border: 2px solid #A2CD5A;
						border-radius: 8px;
						background:#D6E9F8;
						padding:5px;
						z-index: 10000;
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
						max-width: 400px;
						min-height: 26px;
						min-width: 71px;
					}
					#_FgGTrMainBox._FgGTrOptionsGrab{
						cursor: -moz-grab;
					}
					#_FgGTrMainBox._FgGTrOptionsGrabbing{
						cursor: -moz-grabbing;
					}
					#_FgGTrMainBox audio{
						display:none;
					}
					._FgGTrR-T-Span{
						border-bottom:1px dotted transparent;
					}
					._FgGTrResultText ._FgGTrR-T-Span{
						font-size:13px;
					}
					._FgGTrResultText,
					._FgGTrR-T-Span{
						color: #4899FF;
					}
					._FgGTrR-T-Span:hover{
						position: relative;
						border-color:#555;
						top:1px;
						left:1px;
					}
					._FgGTrR-T-Span._FgGTrR-T-Span-P::after{
						content:"¶";
						display:inline-block;
						width:1em;
						color:transparent;
					}
					._FgGTrR-T-Span._FgGTrR-T-Span-P:hover::after{
						color:#555;
					}
					._FgGTrSoundPhonetic:not(:empty){
						margin-bottom:5px;
						display: block;
					}
					._FgGTrSoundPhonetic >span._FgGTrR-T-Span{
						color:#078723;
					}
					#_FgGTrMainBox #_FgGTrResult>div:first-child>a{
						text-decoration: none;
						outline: none;
					}
					#_FgGTrMainBox #_FgGTrResult>div:first-child{
						margin-bottom:5px;
					}
					._FgGTrDetail:not(:empty){
						position: relative;
						padding-bottom:4px;
					}
					._FgGTrDetail._FgGTrDetailOverflow{
						height:150px;
						overflow-y:hidden;
						padding-right:7px;
						$min-width:overflowMinWidth;$
					}
					._FgGTrDetail>span{
						display:inline-block;
					}
					._FgGTrDetail._FgGTrDetailOverflow>span{
						position:absolute;
					}
					._FgGTr-scrollbar{
						height:calc(100% - 2px);
						position: absolute;
						right:3px;
						display: inline-block;
						width:1px;
						z-index:1000;
						background:transparent content-box;
						transition: background-color .3s ease-in-out .1s;
					}
					._FgGTr-thumb{
						$height:ThumbHeight;$
						border-radius:2px;
						right:-3px;
						position: absolute;
						background-color:rgba(0,0,0,.2);
						box-shadow:0 0 5px rgba(100,100,100,.3);
						width:7px;
						transition-duration: .5s;
						transition-property: background-color, box-shadow;
						transition-timing-function: ease-out;
					}
					._FgGTr-scrollbar:hover,
					._FgGTr-scrollbar._FgGTrScrolling{
						background-color:rgba(100,100,100,.3);
						transition: background-color .1s ease-in-out .1s;
					}
					._FgGTr-scrollbar>._FgGTr-thumb:hover,
					._FgGTr-scrollbar._FgGTrScrolling>._FgGTr-thumb{
						background-color: rgba(0,0,0,.8);
					}

					._FgGTrOptionsHidden {
						display:none;
					}
					._FgGTrSwapButton {
						padding:2px;
						margin-left:5px;
						display:inline-block;
						width:10px;
						height:10px;
						position:relative;
						top:3px;
						border-radius:3px;
						background:#63b8ff url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAABPSURBVBiVjZBBEoAwDALB6d/0yfZ1eCmZHMTKNQSyoSQsCQARNJoJAM7gm1SL/BDHqrP5is6/Nx596WVeKYZJENXk6i2QExPE7bO4+U4BPkLhGpcNmzyTAAAAAElFTkSuQmCC") no-repeat 2px 2px;
					}
					._FgGTrSwapButton:hover {
						background-color:#836FFF;
					}
					._FgGTrSoundButton {
						display:inline-block;
						width:16px;
						height:16px;
						background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDkvMTIDX+muAAAAmElEQVQ4ja2TYRGDMAxGHyjAAVaQhAQcTAISkLA5mAYUIOHjx1ou69KOHry7HqFtHrnSNJK4RIVgA6af3IJgTt6fgIA30P0TzGFzyhjml5IgJudKe4S1wRPYZLtwlB2eG7BYgTIjIj5n8PUhSbSZMj0GE68xqBG41AheJu6P6K5DzEk8ir8xlaScukhWYqm6yh5uMzVX23kHcuJ5DR7Q8gwAAAAASUVORK5CYII=") no-repeat;
					}

					._FgGTr-D-t1-Ci{
						color: #666;
						font-weight: bold;
						display:block;
					}
					._FgGTr-D-t1-Ul{
						display:table;
					}
					._FgGTr-D-t1-li{
						display:table-row;
					}
					._FgGTr-D-t1-li>span {
						display:table-cell;
					}
					._FgGTr-D-t1-li>span:first-child{
						color: #D2691E;
						padding-right:15px;
						white-space:pre;
						vertical-align:middle;
					}
					._FgGTr-D-t1-li>span:last-child{
						max-width: 360px;
					}
					._FgGTr-D-t1-li>span:last-child>ul:hover{
						background:#ccc;
					}
					._FgGTr-D-t1-li>span:last-child>ul>li{
						display:inline-block;
						color: #336FB8;
					}
					._FgGTr-D-t1-li>span:last-child>ul>li:not(:last-child)::after{
						content:",";
						color:#000;
						display:inline-block;
						margin-right:2px;
					}

					#_FgGTrMainBox :-moz-any(._FgGTrSoundButton,._FgGTrOptionsButton,._FgGTrOptionsToggle){
						position:relative;
						color: #EE9A49;
						cursor: pointer;
						font-size: 10px;
						text-decoration: none;
						opacity:.5;
					}
					#_FgGTrMainBox :-moz-any(._FgGTrSoundButton,._FgGTrOptionsButton):active{
						opacity:1;
					}
					#_FgGTrMainBox :-moz-any(._FgGTrSoundButton,._FgGTrOptionsButton):hover{
						left:1px;
						top:1px;
						color:#A020F0;
					}
					._FgGTrOptionsToggle{
						opacity:1;
						top:-7px;
						left:2px;
					}
					._FgGTrOptionsToggle:hover{
						color:#A020F0;
						top:-6px;
						left:3px;
					}
					._FgGTrOptions{
						text-align:right;
						height:2px;
					}
					._FgGTrOptionsBox:not(:empty){
						background-color: #F0FFFF;
						border-radius: 0 0 7px 7px;
						line-height: 24px;
						min-height: 48px;
						text-align: center;
						min-width:255px;
						padding-top: 2px;
					}
					._FgGTrOptionsBox>div{
						text-align: center;
					}
					._FgGTrOptionsBox>div:last-child{
						padding: 4px 0;
					}
					._FgGTrOptionsSelect{
						font-family:"微软雅黑";
						text-align:left;
						border: 2px solid threedface;
						border-radius: 4px;
						margin: 0;
						padding: 0;
						width: 88px;
						color:#000;
					}
					._FgGTrOptionsCheckbox{
						position: relative;
						top: 2px;
					}
					._FgGTrOptionsCheckbox+span{
						margin-right:90px;
					}
					._FgGTrOptionsButton{
						background:#FFFFF0;
						border: 1px solid #CCCCCC;
						border-radius: 4px;
						color: #FFA500;
						height: 19px;
						padding: 0px 5px 0;
						font-size:12px;
						opacity:1;
					}
					#_FgGTrMainBox ul{
						list-style:none;
						display:inline-block;
					}
					#_FgGTrMainBox li{
						height:16px;
						line-height:16px;
					}
					#_FgGTrMainBox :-moz-any(._FgGTr-D-t5-li1, ._FgGTr-D-t5-li2) :-moz-any(span,li){
						white-space: pre;
					}
					._FgGTr-D-t5-li1{
						margin-right:15px;
					}
					._FgGTr-D-t5-li1 >span{
						color: #D2691E;
					}
					._FgGTr-D-t5-li2>span{
						position:relative;
					}
					._FgGTr-D-t5-li2 >span>span{
						color: #336FB8;
						padding:0 4px;
						border: 2px solid transparent;
					}
					._FgGTr-D-t5-li2>span>ul>li{
						color: #336FB8;
					}
					._FgGTr-D-t5-li2>span>ul>li:not(:first-child){
						border-top: 1px dotted #555;
					}
					._FgGTr-D-t5-li2 >span>span:hover,
					._FgGTr-D-t5-li2>span>ul>li:hover{
						background:#ccc;
					}
					._FgGTr-D-t5-li2>span>ul{
						position:fixed;
						display:none;
						padding:4px 4px;
						margin-top:-22px;
						border: 2px solid #A2CD5A;
						border-radius: 8px;
						background:#D6E9F8;
						z-index: 10000;
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
					}
					._FgGTr-D-t5-li2:hover >span>ul{
						display:block;
					}
					._FgGTrDetailOverflow>span._FgGTrScrolling ._FgGTr-D-t5-li2 >span>ul{
						display:none;
					}
					._FgGTrAlertBox{
						color: #F60;
						opacity: 1;
						display:inline-block;
						position:relative;
						top:-3px;
						height:16px;
						transition: opacity .2s ease-in-out .2s;
					}
					._FgGTrAlertBox._FgGTrAlertBoxHide{
						opacity: 0;
						transition: opacity .3s ease-in-out .5s;
					}
					*/}).toString().replace(/^.+\s|.+$/g,"")
						.replace(/\/\/.*/g,"")
						.replace(/;\n/g," !important;\n")
						.replace(/\n\t+\./g,"\n#_FgGTrMainBox .");
				style.textContent = CssText
						.replace(/\n\t+\$[^;]+;\$/g,"").replace(/\&/g,"&amp;");

				style.CssText = CssText;
				element.appendChild(style);
				return style;
			},
		}
	}
	window.FGgTranslator.init(event);
})(content.window, content.window.document);

