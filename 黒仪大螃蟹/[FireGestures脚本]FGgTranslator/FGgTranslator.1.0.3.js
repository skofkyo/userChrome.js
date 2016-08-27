(function (window, document){
// ==FireGesturesScript==
// @name           FGgTranslator
// @author         Crab
// @description    Google, bing, baidu划词翻译
// @compatibility  FF26+
// @version        2014.11.24.1.0.3
// @Note           需要安装FireGestures扩展，按ALT键可以鼠标选择文本。
// @Note           [140320]更换谷歌翻译服务器地址为IP(173.194.127.152)，访问速度应该会快点
// @Note           [140322]还原上次变更。改进长文本发音问题。
// @Note           [140404]修正翻译iframe下的文本问题。
// @Note           [140410][140421][140505]修正小错误。
// @Note           [140911]修正、增加谷歌错误状态提示。
// @Note           [140926]修正 0925 Nightly prefService的问题和一些小问题。
// @Note           [141030]修正发音文本不全的问题。
// @Note           [141122]添加bing, baidu翻译服务。
// @Note           [141123]修正baidu翻译一处错误, 一些css小调整。
// @Note           [141124]修正复制翻译框内文本会同时复制之前的选中的翻译文本、bing链接乱码问题和改进baidu翻译目标语言逻辑判断。
// ==/FireGesturesScript==
	if(!window.FGgTranslator){
		window.FGgTranslator = {
			offset: {
				x: 50,   //翻译框出现的位置相对于鼠标手势结束时的横坐标位移
				y: 10,   //纵坐标位移, 值越大越往 上/左
			},
			google: "https://translate.google.com.hk/",
			//link: "http://173.194.127.152/", //直接使用服务器IP，
											 //可以换一个比较通畅的google翻译服务器地址或IP,
											 //注意地址或IP最后还有还有"/"。
			service: 'google',
			bingAppId: '',
			selectText: null,
			boxElements:null,
			player: null,
			to: "zh-CN",
			from: "auto",
			checkLanguge: "auto",
			camelCase: false,
			preSelection: [],
			originDocument: null,
			_languages:{
				'google-bing':{
					en: '英语 English',
					ja: '日语 Japanese',
					fr: '法语 French',
					ru: '俄语 Russian',
					de: '德语 German',
					ko: '韩语 Korean',
					ar: '阿拉伯语 Arabic',
					et: '爱沙尼亚语 Estonian',
					bg: '保加利亚语 Bulgarian',
					pl: '波兰语 Polish',
					fa: '波斯语 Persian',
					da: '丹麦语 Danish',
					fi: '芬兰语 Finnish',
					ht: '海地克里奥尔语 Haitian Creole',
					nl: '荷兰语 Dutch',
					ca: '加泰罗尼亚语 Catalan',
					cs: '捷克语 Czech',
					lv: '拉脱维亚语 Latvian',
					lt: '立陶宛语 Lithuanian',
					ro: '罗马尼亚语 Romanian',
					mt: '马耳他语 Maltese',
					ms: '马来语 Malay',
					no: '挪威语 Norwegian',
					pt: '葡萄牙语 Portuguese',
					sv: '瑞典语 Swedish',
					sk: '斯洛伐克语 Slovak',
					sl: '斯洛文尼亚语 Slovenian',
					th: '泰语 Thai',
					tr: '土耳其语 Turkish',
					cy: '威尔士语 Welsh',
					ur: '乌尔都语 Urdu',
					uk: '乌克兰语 Ukrainian',
					el: '希腊语 Greek',
					es: '西班牙语 Spanish',
					hu: '匈牙利语 Hungarian',
					it: '意大利语 Italian',
					hi: '印地语 Hindi',
					id: '印尼语 Indonesian',
					vi: '越南语 Vietnamese',
				},
				google: {
					'zh-TW': '中文(繁体)',
					'zh-CN': '中文(简体)',
					sq: '阿尔巴尼亚语 Albanian',
					az: '阿塞拜疆语 Azerbaijani',
					ga: '爱尔兰语 Irish',
					eu: '巴斯克语 Basque',
					be: '白俄罗斯语 Belarusian',
					is: '冰岛语 Icelandic',
					bs: '波斯尼亚语 Bosnian',
					af: '布尔语(南非荷兰语) Afrikaans',
					tl: '菲律宾语 Filipino',
					km: '高棉语 Khmer',
					ka: '格鲁吉亚语 Georgian',
					gu: '古吉拉特语 Gujarati',
					ha: '豪萨语 Hausa',
					gl: '加利西亚语 Galician',
					kn: '卡纳达语 Kannada',
					hr: '克罗地亚语 Croatian',
					la: '拉丁语 Latin',
					lo: '老挝语 Lao',
					mr: '马拉地语 Marathi',
					mk: '马其顿语 Macedonian',
					mi: '毛利语 Maori',
					mn: '蒙古语 Mongolian',
					bn: '孟加拉语 Bengali',
					hmn: '苗语 Hmong',
					zu: '南非祖鲁语 Zulu',
					ne: '尼泊尔语 Nepali',
					pa: '旁遮普语 Punjabi',
					sr: '塞尔维亚语 Serbian',
					eo: '世界语 Esperanto',
					sw: '斯瓦希里语 Swahili',
					ceb: '宿务语 Cebuano',
					so: '索马里语 Somali',
					te: '泰卢固语 Telugu',
					ta: '泰米尔语 Tamil',
					iw: '希伯来语 Hebrew',
					hy: '亚美尼亚语 Armenian',
					ig: '伊博语 Igbo',
					yi: '意第绪语 Yiddish',
					jw: '印尼爪哇语 Javanese',
					yo: '约鲁巴语 Yoruba'
				},
				bing: {
					'zh-CHT': '中文(繁体)',
					'zh-CHS': '中文(简体)',
					mww: '白苗文 Hmong Daw',
					tlh: '克林贡语 Klingon',
					he: '希伯来语 Hebrew'
				},
				baidu:{
					zh: '中文',
					en: '英语',
					yue: '粤语',
					wyw: '文言文',
					jp: '日语',
					de: '德语',
					ru: '俄语',
					fra: '法语',
					kor: '韩语',
					ara: '阿拉伯语',
					pt: '葡萄牙语',
					th: '泰语',
					spa: '西班牙语',
					it: '意大利语'
				},
				baiduLM: {
					'zh': ['en', 'jp', 'spa', 'fra', 'th', 'ara', 'kor', 'yue', 'ru', 'wyw', 'pt', 'de', 'it'],
					'en': ['zh', 'jp', 'th', 'ara', 'pt', 'spa'],
					'jp': ['zh', 'en'],
					'th': ['zh', 'en'],
					'ara': ['en', 'zh'],
					'fra': ['zh'],
					'spa': ['zh', 'en'],
					'kor': ['zh'],
					'yue': ['zh'],
					'ru': ['zh'],
					'pt': ['en', 'zh'],
					'wyw': ['zh'],
					'de': ['zh'],
					'it': ['zh']
				}
			},

			get languages(){
				var _l = this._languages,
					s = _l[this.service];
					l = {},
					gb = 'google-bing';
				if(!!~gb.indexOf(this.service))
					for(var i in _l[gb]) l[i] = _l[gb][i];
				for(var i in s) l[i] = s[i];
				return l;
			},

			init: function(event){
				if(document.body === null) return;
				this.selectText = this.getSelection(event);
				if(this.selectText.replace(/[\n\t\s]+/g,'') === ''){
					if(readFromClipboard && readFromClipboard().replace(/[\n\t\s]+/g,'') !== ''){
						this.selectText = readFromClipboard().replace(/\n+/g,'\n');
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
						camelCase : this.camelCase,
						service   : this.service,
						bingAppId : this.bingAppId
					}) = this.getPref();

					document.addEventListener('mousedown',this, false);
					document.addEventListener('mouseup',this, false);
					document.addEventListener('mousemove',this, false);
					document.addEventListener('keypass',this, false);
					window.addEventListener('unload',this, false);
					this.boxElements.detail.addEventListener('DOMMouseScroll', this, false);
					this.originDocument = event.view.document;
					this.originDocument.addEventListener('mousedown',this, false);
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

				this.boxElements.box.style.top = pageXY.y + window.pageYOffset-this.offset.y +'px';
				this.boxElements.box.style.left = pageXY.x + window.pageXOffset-this.offset.x +'px';

				this.setTranslateText();
			},

			googleService: function(res){
				var {strFilter: sF, title: ftt, resultText: resultText} = this.filter,
					ftt = ftt.bind(this.filter),
					resultBox = this.boxElements.resultBox;


				var text = eval('(' + res.responseText +')'),
					rt = '',//译文
					rp = '',//注音
					languages = this.languages;

				if(!res.responseText || !text[0]){
					return this.statusAlert('未知错误');
				}

				//原文所属语言
				this.checkLanguge = text[2];

				var t = text[0];
				for(var i=0;i<t.length;i++){
					//译文
					rt += ftt(t[i][0], t[i][1], 
						(languages[text[2]] + 
							' -&gt; ' + languages[this.to])
								.replace(/\s[A-Za-z]+/g,''));
					//注音
					rp += ftt(t[i][3], t[i][1]);
				}

				//显示翻译文本
				this.boxElements.resultText = resultText(rt);

				//显示注音
				this.boxElements.phonetic = rp;

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
						sp = li = '';
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
						var span = document.createElement('span');
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
				this.setClassName(this.boxElements.detail, '_FgGTrDetailOverflow', false);
				if(text[1] || text[5]){
					this.setScrollbar();
				}
			},

			bingService: function(res, details){
				this.statusAlert('');
				var {title: ftt, resultText: resultText} = this.filter,
					ftt = ftt.bind(this.filter),
					resultBox = this.boxElements.resultBox,
					sentRequest = this.sentRequest.bind(this),
					detailBox = this.boxElements.detail,
					bingTrantor = function(res){
						var text = res.responseText;
						if(!text || text.indexOf('onComplete') != 0){
							return this.statusAlert("未知错误");
						}
						var text = eval(res.responseText.replace(/^[^\(]*/,''));

						//原文所属语言
						this.checkLanguge = text[0].From;

						var cText = this.camelCaseText,
							oText = cText.split('\n'), //原文
							rt = '', //译文
							languages = this.languages;

						for(var i=0;i<text.length;i++){
							//译文
							rt += ftt(text[i].TranslatedText, oText[i], 
								(languages[text[i].From] + 
									' -&gt; ' + languages[this.to])
										.replace(/\s[A-Za-z]+/g,''))
										.replace(/\<\/span\>/, '<br />$&');
						}

						//显示翻译文本
						this.boxElements.resultText = resultText(rt);

						//详细
						sentRequest({
							url: 'http://www.microsofttranslator.com/dictionary.ashx?oncomplete=jQuery&from='
								+ this.checkLanguge +'&to='+ this.to 
								+'&text='+ encodeURIComponent(cText) +'&_=',
							rqType: 'bingCallback'
						}, function(res){
							var text = res.responseText;
							if(text == '') return;
							text = eval(text.replace(/^[^\(]*/,''));
							if(text == '') return;
							detailBox.innerHTML = '<span class="_FgGTrDetailDictBing">'
							+ text.replace(/(\<span class\=")d(ictB"\>[^\>]+\>)\<br \/\>/g, '$1_FgGTrDetailD$2') +'</span>'
							//设置滚动条
							this.setClassName(detailBox, '_FgGTrDetailOverflow', false);
							this.setScrollbar();
						}.bind(this));
				}.bind(this);
				if(!this.bingAppId 
					|| /^onError.*(Invalid appId|The token is invalid\: Decryption failed|The token has expired)/
				.test(res.responseText)){
					//appid过期
					this.getBingAppId.call(this, function(appId){
						var url = details.url.replace(/appId\=%22[^%]*%22/, 'appId=%22' + appId + '%22');
						sentRequest({url: url}, bingTrantor);
					}.bind(this));
				}else{
					bingTrantor(res);
				}
			},

			getBingAppId: function(callback){
				this.sentRequest({
					url: 'http://www.bing.com/translator/dynamic/js/LandingPage.js?gt='
				}, function(res){
					var appid = res.responseText.match(/rttAppId\:\"([^\"]+)/);
					if(appid && appid.length == 2){
						this.bingAppId = appid[1] || '';
						this.setPref.call(this, {baiduAppId: this.baiduAppId}); //保存bingAppId
						callback && callback.call(this, this.bingAppId);
					}else{
						this.loadingAnimation();
						this.statusAlert('错误：获取appId失败。');
					}
				}.bind(this));
			},

			baiduService: function(res, details){
				var {title: ftt, resultText: resultText, strFilter: sF} = this.filter,
					ftt = ftt.bind(this.filter),
					resultBox = this.boxElements.resultBox,
					detailBox = this.boxElements.detail,
					sentRequest = this.sentRequest.bind(this),
					setScrollbar = this.setScrollbar.bind(this),
					text = res.responseText,
					err = function(msg){
						return this.statusAlert(msg || '未知错误');
					}.bind(this);

				if(text == '') return err();
				try{
					text = JSON.parse(text);
					if(text.error != 0 && text.msg != 'success') return err(text.msg)
				}catch(ex){
					return err();
				}
				//原文所属语言
				this.checkLanguge = text.lan || 'auto';

				//当自动检测到为zh, 且翻译目标语言为zh时，默认翻译为 en
				if(this.from == 'auto' && this.checkLanguge == 'zh' && this.to == 'zh'){
					this.to = 'en';
					this.setResultLink();
				}

				details.postData = 'from='+ (this.from == 'auto' ? this.checkLanguge : this.from)
							+ '&to=' + this.to + '&query=' + details.tText + '&transtype=realtime';
				details.url = 'http://fanyi.baidu.com.cn/v2transapi';
				//上次请求清除，重新添加
				this.loadingAnimation();
				sentRequest.call(this, details, function(res){
					clearInterval(resultBox.loading);
					var text = res.responseText,
						tRD = null,
						tDM = null,
						languages = this.languages,
						rt = '';//译文
					if(text == '') return err();
					try{
						text = JSON.parse(text);
					}catch(ex){
						return err();
					}

					var tt_r = text.trans_result,
						td_r = text.dict_result;

					if(tt_r){
						//重新设置原文所属语言
						this.checkLanguge = tt_r.from;

						//翻译结果
						tRD = tt_r.data;

						var ara_ru = !!~['ara', 'ru'].indexOf(this.checkLanguge);

						for(var p of tRD){
							for(var ci of p.result){
								var range = ci[4][0].split('|').map(function(r){return parseInt(r, 10)});
								rt += ftt(ci[1], this.filter[ara_ru ? 'ruCut' : 'zhCut'](p.src, range[0], range[0] + range[1]),
									(languages[this.checkLanguge] + 
									" -&gt; " + languages[this.to])
										.replace(/\s[A-Za-z]+/g,""));
							}
							if(p != tRD[tRD.length-1])
								rt = rt.replace(/(\<span title\="[^"]+?" class\=")([^"]+?)("\>[^\<]+)\<\/span\>$/,
											'$1$2 ' + '_FgGTrR-T-Span-P' + '$3</span><br />');
						}
					}else{
						this.checkLanguge = null;
					}
					this.boxElements.resultText = 
						resultText(rt == '' ? this.camelCaseText : rt);

					var dictResult = null;
					//简单翻译
					if(td_r){
						var tSM = td_r.simple_means;
						if(tSM){
							tSM = tSM.symbols;
							var smUL = '';
							for(var p of tSM){
								var ph = [];
								p.word_symbol && ph.push(p.word_symbol);
								if(!p.word_symbol){
									p.ph_en && ph.push('[英]:['+ p.ph_en + ']');
									p.ph_am && ph.push('[美]:['+ p.ph_am + ']');
									(p.ph_en == p.ph_am) && ph.pop();
								}
								(ph.join(', ') != '') && (this.boxElements.phonetic = '<span class="_FgGTrR-T-Span">' + ph.join(', ') + '<span>');

								for(var parts of p.parts){
									//parts.part      en->zh
									//parts.means.word_mean zh->en
									smUL += '<ul class="_FgGTr-bd-sm-parts';
									if(parts.part){
										smUL += '"><b>'+ parts.part +'</b><ul>';
										for(var means of parts.means)
											smUL += '<li>' + means + '</li>';
										smUL += '</ul>';
									}else if(parts.means){
										smUL += ' _FgGTr-bd-sm-parts-sg">';
										for(var means of parts.means){
											if(Array.isArray(parts.means)){
												if(typeof means == 'string'){
													smUL += '<li>' + means + '</li>';
												}else if(typeof means == 'object' && means.word_mean){
													smUL += '<li>' + means.word_mean + '</li>';
												}
											}else if(means.word_mean){
												smUL += '<li>' + means.word_mean + '</li>';
											}
										}
									}
									smUL += '</ul>';
								}
							}
							if(smUL != ''){
								dictResult = document.createElement('div');
								dictResult.id = '_FgGTr-bd-dict-result';
								dictResult.innerHTML = smUL + '</div>';
								detailBox.appendChild(dictResult);
							}
						}
						var tCt = td_r.content,
							tVe = td_r.voice;
						if(tCt){
							var tcUL = '';
							for(var i of tCt){
								tcUL = '<ul>'
								for(var m of i.mean){
									tcUL += '<li class="_FgGTr-bd-sm-parts"><b>'+ m.pre +'</b><ul>';
									for(var c in m.cont){
										tcUL += '<li>' + c + '</li>';
									}
									tcUL += '</ul></li>';
								}
							}
							if(tcUL != ''){
								dictResult = document.createElement('div');
								dictResult.id = '_FgGTr-bd-dict-result';
								dictResult.innerHTML = tcUL + '</div>';
								detailBox.appendChild(dictResult);
							}
						}
						if(tVe){
							var _ph = {}, ph = '';
							for(var i of tVe) for(var p in i) _ph[p] = i[p];
							if(_ph.en_phonic && _ph.us_phonic){
								ph = (_ph.en_phonic == _ph.us_phonic)
									? '[EN]:' + _ph.en_phonic
									: '[EN]:' + _ph.en_phonic + '' + ', [US]:' + _ph.us_phonic;

							}
							(ph != '') && (this.boxElements.phonetic = '<span class="_FgGTrR-T-Span">' + ph + '<span>');
						}
					}

					//其他详细翻译
					if(td_r && ((typeof td_r == 'object') && !Array.isArray(td_r) || dictResult)){
						var tName = ['网络析义', '短语词组', '同反义词', '百科析义'],
							tab ,net, cizu, tongfanyici, baike, tContent,
							items = [
							td_r.net_means,//0: array
							(td_r.cizu && td_r.cizu.length && td_r.cizu) ||
								(td_r.cizuxiyu && td_r.cizuxiyu.cizu 
									&& td_r.cizuxiyu.cizu.length && td_r.cizuxiyu.cizu),//1:arr
							(td_r.tongyici && td_r.tongyici.length) || (td_r.fanyici && td_r.fanyici.length),//2: num
							td_r.baike_means && td_r.baike_means.content && td_r.baike_means, //3: obj
						];
						tab = net = cizu = tongyi = fanyi = baike = tContent = '';

						for(var i in tName){
							if(items[i])
								tab += '<li>' + tName[i] + '</li>';
						}
						if(tab != '') tab = '<ul class="_FgGTr-bd-drTab">' + tab + '</ul>';

						if(items[0]){
							for(var i of items[0])
								net += '<li><span>' + i.means + '</span></li>';
							if(net != '') net = '<ul class="_FgGTr-bd-net-means">' + net + '</ul>';
						}
						if(items[1]){
							for(var i of items[1]){
								cizu += '<li><span>'+ (i.cz_name || i.cizu_name) +'</span>';
								if(i.jx && i.jx.length){
									cizu += '<ul class="_FgGTr-bd-czjx">';
									for(var jx of i.jx){
										cizu += '<li><span>' + (jx.jx_en || jx.jx_cn_mean) + '</span>';
										if(jx.lj && jx.lj.length){
											cizu += '<ul class="_FgGTr-bd-czlj">';
											for(var lj of jx.lj){
												cizu += '<li>'+ lj.lj_ly +'</li><li>' + lj.lj_ls + '</li>';
											}
											cizu += '</ul>';
										}
										cizu += '</li>'
									}
									cizu += '</ul>';
								}
								cizu += '</li>';
							}
							if(cizu != '') cizu = '<ul class="_FgGTr-bd-cizu">' + cizu + '</ul>';
						}
						if(items[2]){
							tongfanyici = (function(tfyc){
								var ul = [];
								for(var tf in tfyc){
									if(tfyc[tf]){
										var str = '';
										for(var i of tfyc[tf]){
											if(i.means){//en->zh
												str += '<li><b>'+ i.part_name +'</b><span><ul class="_FgGTr-bd-part-name">';
												for(var m of i.means){
													str += '<li><h6>' + m.word_mean + '</h6><ul class="_FgGTr-bd-word-mean">';
													for(var cis of m.cis){
														str += '<li><a target="_blank" href="http://fanyi.baidu.com.cn/#' 
															+ (this.checkLanguge || this.from) +'/'+ this.to +'/'
															+ cis.ci_name +'">' + cis.ci_name + '</a></li>';
													}
													str += '</ul></span></li>';
												}
												str += '</ul></span></li>';
											}else if(i.ci_name){//zh->en
												str += '<li><h6>' + i.ci_name + '</h6></li>';
											}
										}
										if(str != '')
											ul.push('<h5>'+ tName[2].charAt(tf) +'义词</h5><ul class="_FgGTr-bd-tongfanyici">' + str + '</ul>');
									}
								}
								return ul.join('');
							}).call(this, [td_r.tongyici, td_r.fanyici]);
						}
						if(items[3])
							baike = '<div class="_FgGTr-bd-baike"><span>'+ items[3].content.replace(/\&amp;/g, '&') +'</span><a title="前往百科页面" href="'+ items[3].link +'" target="_blank"></a></div>';


						//标签内容
						for(var tc of [net, cizu, tongfanyici, baike])
							if(tc != '' && tc != undefined) tContent += '<li>' + tc + '</li>';

						if(tContent && tab){
							tContent = '<div><ul class="_FgGTr-bd-tContent">' + tContent + '</ul></div>';
							detailBox.innerHTML += (tab + tContent);
						}

						var tabs = detailBox.querySelectorAll('._FgGTr-bd-drTab>li'),
							contents = detailBox.querySelectorAll('._FgGTr-bd-tContent>li');
						for(var i=0, len = tabs.length; i<len; i++){
							if(i == 0) {
								tabs[0].classList.add('_FgGTr-bd-drTab-current');
								contents[0].classList.add('_FgGTr-bd-tContent-current');
								tabs[0].parentNode.style
									.setProperty('min-width', (tabs[0].offsetWidth + 4) * len + 'px', 'important');
								//设置当前标签后才设置滚动条
								setScrollbar(contents[0].parentNode.parentNode);
							}
							tabs[i].onclick = (function(t){
								return function(){
									if(tabs[t].classList.contains('_FgGTr-bd-drTab-current')) return;

									//记录上一个的滚动位置
									var perv = detailBox.querySelector('._FgGTr-bd-tContent-current');
									if(perv){
										if(!perv.WHTB)
											perv.WHTB = {};
										perv.WHTB.T = perv.parentNode.offsetTop;
									}
									for(var i=0; i<len; i++){
										tabs[i].classList[i == t ? 'add' : 'remove']('_FgGTr-bd-drTab-current');
										contents[i].classList[i == t ? 'add' : 'remove']('_FgGTr-bd-tContent-current');
									}
									setScrollbar(contents[t].parentNode.parentNode);
								}
							})(i);
						}

					}

					if(!tt_r && !td_r && text.error == 999 && text.from != null){
						this.checkLanguge = text.from;
						if(text.query)
							this.boxElements.resultText = text.query;
					}
				}.bind(this));
			},

			setTranslateText: function(word){
				word = (word || this.camelCaseText).trim();

				var details = {},
					callback = null,
					sentRequest = this.sentRequest,
					detailBox = this.boxElements.detail;

				//清除翻译文本
				this.boxElements.resultText = '';

				//清除状态
				this.boxElements.alertBox = '';

				//清空原来的
				while(detailBox.children.length){
					detailBox.removeChild(detailBox.firstChild);
				}
				detailBox.style.minWidth = '';
				this.setClassName(detailBox, '_FgGTrDetailOverflow', false);

				//清除注音
				this.boxElements.phonetic = '';

				//设置链接
				this.setResultLink();

				if(this.service == 'google'){
					details.url = this.google + "translate_a/t?client=t&hl=auto&sl=" + this.from + "&tl="+this.to
										+"&ie=UTF-8&oe=UTF-8&multires=1&otf=2&srcrom=1&ssel=0&tsel=0&sc=1&q=" 
										+ encodeURIComponent(word) + '&getTime=';
				}else if(this.service == 'bing'){
					details.url = 'http://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId=%22'+ this.bingAppId +'%22&texts=%5B%22'+ encodeURIComponent(word).split('%0A').join('%22%2C%22') +'%22%5D&from=%22'+ (this.from == 'auto' ? '' : this.from) +'%22&to=%22' + this.to + '%22&options={}&oncomplete=onComplete_4&onerror=onError_4&_=';
				}else if(this.service == 'baidu'){
					var cut = this.filter.zhCut;
					details.method = 'POST';
					details.tText = encodeURIComponent(word);
					details.url = 'http://fanyi.baidu.com.cn/langdetect';
					details.postData = 'query='+ encodeURIComponent(cut(word, 0, 50)).replace(/%20/g, '+');
					details.headers = {
						'Content-Type': 'application/x-www-form-urlencoded;',
						'X-Requested-With': 'XMLHttpRequest',
						'Accept':'*\/*'
					};
				}
				this.loadingAnimation();
				details.url && sentRequest.call(this, details, callback);
			},

			updateLanguages: function(both){
				var index = ['google', 'bing', 'baidu'].indexOf(this.service),
					languages = this.languages,
					updateList = {},
					lg = [
					['zh-CN', 'zh-CHS', 'zh'],
					['zh-TW', 'zh-CHT', 'zh'],
					['ar', 'ar', 'ara'],
					['fr', 'fr', 'fra'],
					['ko', 'ko', 'kor'],
					['ja', 'ja', 'jp'],
					['es', 'es', 'spa']
				], baiduLM = this._languages.baiduLM;

				for(var i of lg){
					for(var j of i){
						if(j == this.from)
							this.from = i[index];
						if(j == this.to)
							this.to = i[index];
					}
				}

				//如果不支持翻译的语言则设置为自动
				(!languages[this.from]) && (this.from = 'auto');
				(!languages[this.to]) && (this.to = lg[0][index]);

				if(index == 2){//baidu
					both && (updateList.from = languages);
					var blm = baiduLM[this.from];
					if(blm){
						updateList.to = {};
						for(var i of blm){
							updateList.to[i] = languages[i];
						}
						(!~blm.indexOf(this.to)) && (this.to = blm[0]);
					}else if(this.from == 'auto'){
						updateList.to = languages;
					}
				}else{
					both && (updateList.from = languages);
					updateList.to = languages;
				}

				this.updateSelectMenu(updateList);
			},

			updateSelectMenu: function(obj){
				var o = this.boxElements,
					optionsBox = o.optionsBox,
					select = optionsBox.getElementsByClassName("_FgGTrOptionsSelect"),
					{from: fromList, to: toList} = obj;
				if(!select.length) return;

				for(var i=0;i<select.length;i++){
					if(select[i].className.indexOf('Service')<0){
						var itemsText = '', item = '',
							languages = [fromList, toList][i];
						if(languages){
							for(item in languages){
								var isZH = languages[item].indexOf('中文') == 0, //中文排在前
									option = '<option value="'+ item +'">'+ languages[item] +'</option>';
								itemsText = (isZH ? (option + itemsText) : (itemsText + option));
							}
							select[i].innerHTML = (i != 1 ? '<option value="auto">自动检测</option>' : '') + itemsText;
						}
					}
				}

				select[0].value = this.from;
				select[1].value = this.to;
			},

			sentRequest: function(details, callback){
				var resultBox = this.boxElements.resultBox;

				if(resultBox.ajaxRequest && resultBox.ajaxRequest.status !== 200){
					resultBox.ajaxRequest.abort();
				}

				var {url, method, postData, headers, rqType} = details;
				if(!url) return;

				resultBox.ajaxRequest = this.ajax({
					method : method || "GET",
					url : url + (/\=$/.test(url) ? new Date().getTime() : ''),
					timeout: 5000,
					postData: postData,
					headers: headers || {},
					onload : function(res) {
						res = res.target;
						if (res.status == 200) {
							if(callback){
								callback(res);
							}else{
								clearInterval(resultBox.loading);
								this[this.service + 'Service'](res, details);
							}
						}else if(res.status == 404){
							this.loadingAnimation();
							this.statusAlert('错误：访问'+ this.service +'翻译服务器出错。');
						}else if(res.status == 414 || res.status == 400){
							var ld = rqType !='bingCallback';
							if(this.service == 'google'){
								this.statusAlert('错误：要翻译的文本过长。');
							}else{
								ld && this.statusAlert('错误：网络错误');
							}
							ld && this.loadingAnimation();
						}
					}.bind(this),

					ontimeout: function(e){
						this.loadingAnimation();
						this.statusAlert('错误：访问'+ this.service +'翻译服务器超时。');
						e.target.abort();
					}.bind(this),

					onerror: function(e){
						this.loadingAnimation();
						this.statusAlert('错误：访问'+ this.service +'翻译服务器发生错误。');
						e.target.abort();
					}.bind(this)
				});
			},

			getTranslateBox: function (){
				var box = document.createElement('div');
				box.id = '_FgGTrMainBox';
				box.innerHTML = '\
					<div id="_FgGTrResult">\
						<div>\
							<a title="前往翻译页面" target="_blank">\
								<span class="_FgGTrResultText">loading</span>\
							</a>\
						</div>\
						<div class="_FgGTrSoundAndAlertBox">\
							<a class="_FgGTrSoundButton" title="发音"></a>\
							<span class="_FgGTrAlertBox _FgGTr-text-label"></span>\
							<span class="_FgGTrSoundPhonetic"></span>\
						</div>\
						<div class="_FgGTrDetail"></div>\
						<div class="_FgGTrOptions">\
							<a class="_FgGTrOptionsToggle" title="设置">▼</a>\
						</div>\
					</div>\
					<div class="_FgGTrOptionsBox"></div>';
				document.body.appendChild(box);

				this.boxElements = {
					box: box,
					toggleOn: false,
					style: null,
					set resultText(text) this.resultBox.innerHTML = text,
					get resultText() this.resultBox.textContent,
					set phonetic(text) this.phoneticBox.innerHTML = text,
					set alertBox(text) this.alertBox.textContent = text,
					get alertBox() this.get('AlertBox'),
					get phoneticBox() this.get('SoundPhonetic'),
					get soundButton() this.get('SoundButton'),
					get resultBox() this.get('ResultText'),
					get toggleButton() this.get('OptionsToggle'),
					get optionsBox()  this.get('OptionsBox'),
					get detail() this.get('Detail'),
					get swapButton() this.get('SwapButton'),
					get saveButton() this.get('OptionsSave'),
					get cancelButton() this.get('OptionsCancel'),
					get checkbox() this.get('OptionsCheckbox'),
					get serviceSelect() this.get('OptionsService'),
					get: function(name) {
						return this.box.querySelector('._FgGTr'+ name);
					}
				};
			},

			setResultLink: function(){
				var obj = {
					text        : encodeURIComponent(this.camelCaseText),
					from        : this.from,
					to          : this.to,
					checkLanguge: this.checkLanguge
				};
				var link = this.boxElements.resultBox.parentNode;
				if(this.service == 'google'){
					link.href = (this.google.indexOf("translate") < 0 
							//无法使用服务器IP直接连接至谷歌翻译页面
							? "https://translate.google.com.hk/"
							: this.google) + "?text="+ obj.text +"&langpair="+ obj.from +"|"+ obj.to;
				}else if(this.service == 'bing'){
					link.href = 'http://www.bing.com/translator/default.aspx?to='+ obj.to +'&text='+ obj.text;
				}else if(this.service == 'baidu'){
					link.href = 'http://fanyi.baidu.com/#'
						+ obj.from + '/' + obj.to + '/' + obj.text;
				}
			},

			loadingAnimation: function(){
				var resultBox = this.boxElements.resultBox;
				clearInterval(resultBox.loading);
				resultBox.textContent = "loading";
				resultBox.loading = setInterval(function(){
					try{
						if(resultBox.textContent.length<10){
							resultBox.textContent += '.';
						}else{
							resultBox.textContent = 'loading';
						}
					}catch(ex){
						clearInterval(arguments.callee);
					}
				}, 500);
			},

			setOptionsBox: function(){
				var o = this.boxElements;
				this.setClassName(o.toggleButton.parentNode, '_FgGTrOptionsHidden', true);
				if(o.optionsBox.children.length){
					return this.toggleHidden(o.optionsBox);
				}
				var optionsBox = o.optionsBox;
				optionsBox.innerHTML = '\
					<div>\
						<span class="_FgGTr-text-label">从:</span>\
						<select class="_FgGTrOptionsSelect _FgGTrOptionsSelectFrom"></select>\
						<a class="_FgGTrSwapButton" title="交换"></a>\
						<span class="_FgGTr-text-label">译作:</span>\
						<select class="_FgGTrOptionsSelect _FgGTrOptionsSelectTo"></select>\
					</div>\
					<div>\
						<span>\
							<span class="_FgGTr-text-label">服务:</span>\
							<select class="_FgGTrOptionsSelect _FgGTrOptionsService">\
								<option value="google">google</option>\
								<option bing="bing">bing</option>\
								<option bing="baidu">baidu</option>\
							</select>\
						</span>\
						<span id="_FgGTrOptionsCheckboxSpan">\
							<input type="checkbox" class="_FgGTrOptionsCheckbox" />\
							<span class="_FgGTr-text-label">驼峰式</span>\
						</span>\
						<span id="_FgGTrOptionsButtonSpan">\
							<a class="_FgGTrOptionsButton _FgGTrOptionsSave">保存</a>\
							<a class="_FgGTrOptionsButton _FgGTrOptionsCancel">取消</a>\
						</span>\
					</div>';
				var select = optionsBox.getElementsByClassName('_FgGTrOptionsSelect');

				//更新选择语言框
				this.updateLanguages(true);

				o.toggleOn = true;
				o.checkbox.checked    = this.camelCase;
				o.serviceSelect.value = this.service;

				o.optionsBox.addEventListener('change', this, false);
			},

			get getPlayList (){
				var str = this.camelCaseText;
				if(this.service == 'google'){
					var strArr = str.split(/(?=[ \u3000\n\r\t\s\,\.\?\!\！\？\。\，\u4e00-\u9fa5])/),
						strArr2 = [], strLeng = '',
						u1 = this.google + "translate_tts?&q=",
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
				}else if(this.service == 'bing'){
					return ['http://api.microsofttranslator.com/v2/http.svc/speak?appId='+ this.bingAppId +'&language='+this.checkLanguge +'&format=audio/mp3&options=MinSize&text='+encodeURIComponent(str)];
				}else if(this.service == 'baidu'){
					var lan = (this.checkLanguge || (this.from == 'auto' ? this.checkLanguge : this.from)),
						spd = 2,
						part = '&text=' + encodeURIComponent(str) + '&spd=';
					if(lan == 'yue') lan = 'cte', spd = 5;
					else (lan == 'en' || lan == 'zh') && (spd = 2);
					return [lan != 'zh'
							? 'http://fanyi.baidu.com/gettts?source=web&lan=' + lan + part + spd
							: 'http://tts.baidu.com/text2audio?pid=101&ie=UTF-8&lan=' + lan + part + spd
					];
				}
			},

			playSound: function(){
				var that = this,
					PL = that.getPlayList,
					PS = that.playSound;

				if(!PS.initialized){
					var header = {
						//google当使用服务器IP时要发送Host，否则返回404无法发音
						google:{Host:'translate.google.com', Referer:'http://translate.google.com/'},
						bing:{Host:'api.microsofttranslator.com', Referer:'http://www.bing.com/translator/'},
						//baidu:{}
					};
					PS.get = function(idx){
						this.initialized = true;
						if(that.getPlayList[idx])
						that.ajax({
							method: 'GET',
							timeout: 5000,
							url: that.getPlayList[idx],
							headers: (that.service in header) ? header[that.service] : [],
							onload: function(res) {
								res = res.target;
								if (res.status == 200) {
									var tpl = that.getPlayList;
									if(idx == 0){
										that.player.setAttribute('src', tpl[0]);
										that.player.play();
									}

									if(idx + 1 <= tpl.length){
										PS.get(idx + 1);
									}
								}else if(res.status == 404){
									if(that.service == 'google'){
										that.statusAlert('错误：无此语音，或文本过长。', 1000);
									}else{
										that.statusAlert('网络错误。', 1000);
									}
								}
							},
							ontimeout: function(e){
								that.statusAlert('错误：访问'+ that.service +'翻译服务器超时。');
								e.target.abort();
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
							this.setAttribute('src', that.getPlayList[this.pIndex]);
							this.play();
						}
					};
					this.player.onloadstart = function(){
						that.statusAlert('共'+ PL.length
									+ '段语音，正在播放第' + (this.pIndex + 1) + '段', 2500);
					};
					this.player.onerror = function(e){
						var i = that.getPlayList.indexOf(e.target.currentSrc);
						that.statusAlert('错误: 第'+ ((!!~i ? i : 0) + 1) +'段语音加载失败', 2500);
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
				this.setClassName(this.boxElements.alertBox, '_FgGTrAlertBoxHide', false);
				this.boxElements.alertBox = text;
				this.boxElements.alertBox.hideTimer = setTimeout(function(){
					try{
						!delay || this.setClassName(this.boxElements.alertBox, 
														'_FgGTrAlertBoxHide', true);
					}catch(ex){
						clearTimeout(arguments.callee);
					}
				}.bind(this), typeof delay == 'number' ? delay : 1000);
			},

			ajax: function(obj){
				var req = Cc['@mozilla.org/xmlextras/xmlhttprequest;1']
									.createInstance(Ci.nsIXMLHttpRequest);
				req.open(obj.method, obj.url, true);
				if(obj.headers){
					for(var i in obj.headers){
						req.setRequestHeader(i, obj.headers[i]);
					}
				}
				if(obj.timeout) req.timeout = obj.timeout;
				if(obj.ontimeout) req.ontimeout = obj.ontimeout;
				if(obj.onerror) req.onerror = obj.onerror;
				req.send(obj.postData && obj.method=='POST' ? obj.postData : null);
				req.onload = obj.onload;
				return req;
			},

			removeTranslateBox: function(){
				this.selectText = null;
				this.player = null;
				this.preSelection = [];
				if(this.boxElements){
					clearInterval(this.boxElements.resultBox.loading);
					this.boxElements.detail.removeEventListener('DOMMouseScroll', this, false);
					document.body.removeChild(this.boxElements.box);
					this.boxElements = null;
				}
				document.removeEventListener('mousedown',this, false);
				document.removeEventListener('mouseup',this, false);
				document.removeEventListener('mousemove',this, false);
				document.removeEventListener('keypass',this, false);
				window.removeEventListener('unload', this, false);
				this.originDocument.removeEventListener('mousedown',this, false);
			},

			setScrollbar: function(element){
				var detailBox = this.boxElements.detail;

				if(element && detailBox.scrollbar && detailBox.scrollbar.bar){
					try{
						//移除原来的滚动条, 由detail滚动条切换到baidu try
						element.removeChild(detailBox.scrollbar.bar);
						this.setClassName(element, '_FgGTrDetailOverflow', false);
					}catch(ex){}
					detailBox.scrollbar.bar = null;
				}
				var scrollBox = element || detailBox,
					contentBox = scrollBox.firstChild;

				if(!contentBox) return;

				//缓存宽高
				var bdTab = detailBox.querySelector('._FgGTr-bd-tContent-current'),
					WHTB = (bdTab && bdTab.WHTB || (bdTab && (bdTab.WHTB = {})));

				setTimeout(function(){
					var detailHeight = 150,
						contentStyle = getComputedStyle(contentBox, null),
						contentHeight = (bdTab && (typeof WHTB.H == 'number'))
									? WHTB.H : parseInt(contentStyle.height),
						contentWidth = (bdTab && (typeof WHTB.W == 'number'))
									? WHTB.W : parseInt(contentStyle.width);

					if(bdTab && !WHTB.H){
						//如果未设置
						WHTB.H = contentHeight;
						WHTB.W = contentWidth;
					}

					if(contentHeight < 250) return;
					var scrollbar = document.createElement('div'),
						thumb = document.createElement('div');
					scrollbar.className = '_FgGTr-scrollbar';
					thumb.className = '_FgGTr-thumb';

					detailBox.scrollbar = {
						scrollBox: scrollBox,
						bar: scrollbar,
						thumb: thumb,
						status: false,
						contentBox: contentBox,
						Y: 0,
						barHeight: parseInt(detailHeight),
						thumbHeight: Math.max(parseInt(detailHeight / 
									contentBox.offsetHeight * detailHeight), 10),
					};

					//上次滚动位置
					if(bdTab){
						contentBox.style.top = (!WHTB.T ? 0 : WHTB.T) + 'px';
						thumb.style.top = (!WHTB.B ? 0 : WHTB.B) + 'px';
					}

					this.setClassName(scrollBox, '_FgGTrDetailOverflow', true);

					if(contentWidth>=382){
						contentWidth = 382
					}else{
						contentWidth += 12;
					}

					scrollBox.style.setProperty('min-width', contentWidth + 'px','important');
					thumb.style.setProperty('height', detailBox.scrollbar.thumbHeight + 'px','important');

					scrollbar.appendChild(thumb);
					scrollBox.appendChild(scrollbar);
				}.bind(this), (bdTab && typeof WHTB.H == 'number') ? 0 : 50);
			},

			onScroll: function(event){
				var od = this.boxElements.detail,
					scroll = od.scrollbar,
					bdTab = od.querySelector('._FgGTr-bd-tContent-current');
				if(!scroll || !scroll.bar) return;
				var scrollBox = scroll.scrollBox || od,
					sbHeight = scroll.bar.offsetHeight;
				if(event.type == 'mousedown'){
					if(event.target == scroll.thumb){
						scroll.status = true;
						scroll.Y = event.clientY - scroll.thumb.offsetTop;
						return true;
					}
					return;
				}else if(event.type == 'mousemove'){
					var T = event.clientY - scroll.Y,
						Y = 0, p = 0;
					if(T <= scroll.bar.offsetTop){
						Y = scroll.bar.offsetTop;
					}else if(T >= sbHeight - scroll.thumbHeight){
						Y = sbHeight - scroll.thumbHeight;
					}else{
						Y = T;
					}
					p = (scroll.thumb.offsetTop - scroll.bar.offsetTop) / 
								(sbHeight - scroll.thumbHeight);
					if(p>=0.95){
						p = 1;
					}else if(p<0.05){
						p = 0;
					}

					scroll.contentBox.style.top = 
								parseInt((scrollBox.offsetHeight - 
									scroll.contentBox.offsetHeight) * p) + 'px';

					scroll.thumb.style.top = Y +'px';
					if(bdTab){
						if(!bdTab.WHTB)
							bdTab.WHTB = {};
						bdTab.WHTB.B = Y
					}

				}else if(event.type == 'DOMMouseScroll'){
					if(scrollBox.contains(event.target)){
						event.preventDefault();
						var s = parseInt(0 - event.detail * 4),
							ct = scroll.contentBox.offsetTop + s,
							cy = 0, p = 0, t = 0,
							outerHeight = scrollBox.offsetHeight,
							innerHeight = scroll.contentBox.offsetHeight;

						if(ct <= outerHeight - innerHeight){
							cy = outerHeight - innerHeight;
						}else if(ct>=0){
							cy = 0;
						}else{
							cy = ct;
						}
						p = cy/(outerHeight - innerHeight);

						if(p>=0.95){
							p = 1;
						}else if(p<0.05){
							p = 0;
						}

						t = parseInt((sbHeight - scroll.thumbHeight) * p);
						if(t<=0){
							t=0;
						}else if(t>= sbHeight - scroll.thumbHeight){
							t = sbHeight - scroll.thumbHeight;
						}

						scroll.thumb.style.top = parseInt(t*p) + 'px';
						scroll.contentBox.style.top = cy + 'px';

						if(bdTab){
							if(!bdTab.WHTB)
								bdTab.WHTB = {};
							bdTab.WHTB.B = parseInt(t*p);
						}
					}

					//渐变过度
					this.setClassName(scroll.bar, '_FgGTrScrolling', true);
					if(event.type == 'DOMMouseScroll' && scroll.contentBox.contains(event.target))
						this.setClassName(scroll.contentBox, '_FgGTrScrolling', true);
					clearTimeout(scroll.scrTimer);
					scroll.scrTimer = setTimeout(function(){
						if(event.type == 'DOMMouseScroll'){
							this.setClassName(scroll.contentBox, '_FgGTrScrolling', false);
						}
						this.setClassName(scroll.bar, '_FgGTrScrolling', false);
					}.bind(this), 500);
				}
			},

			handleEvent: function(event){
				var box = this.boxElements.box;
				if(!box) return;
				var target = event.target,
					drag = box.drag,
					o = this.boxElements;
				if(!event.altKey && event.type == 'mousedown' && event.button==0){
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
								if(this.onScroll(event))
									break;
								var eTarget = event.explicitOriginalTarget,
									oTarget = event.originalTarget;

								if ((o.detail.contains(target) 
									|| o.resultBox.contains(target) 
									|| o.phoneticBox.contains(target))
									&& eTarget.nodeType == 3 && oTarget.nodeType == 1
									|| target.classList.contains('_FgGTrOptionsSelect')
								) return;

								drag.status = true;
								this.setClassName(o.box, '_FgGTrOptionsGrab', true);
								drag.X = event.clientX - box.offsetLeft;
								drag.Y = event.clientY - box.offsetTop;
						}
					}else{
						this.removeTranslateBox();
					}
					if(!~Array.prototype.slice.call(box.querySelectorAll('._FgGTrOptionsSelect'))
							.indexOf(target) &&
							(drag.status || (o.detail.scrollbar && o.detail.scrollbar.status))){
						event.preventDefault();
					}
				}
				if(event.type == 'mouseup' || event.type == 'keypass'){
					if(event.type == 'mouseup'){
						box.drag.status = false;
						o.detail.scrollbar && (o.detail.scrollbar.status = false);
						this.setClassName(o.box, '_FgGTrOptionsGrab _FgGTrOptionsGrabbing', false);
					}

					clearTimeout(o.selectionTimer);
					if(((o.detail.children[0] && o.detail.children[0] != target && 
									o.detail.children[0].contains(target))
								&& !(target.classList && target.classList.contains('_FgGTr-D-t1-Ci'))
						) || event.altKey || event.button!=0
					) return;
					o.selectionTimer = setTimeout(function(){
						var selection = window.getSelection();
						if(selection.focusNode 
							&& box.contains(selection.focusNode) 
							&& selection.toString().replace(/\s/g, '') !='')
							return;
						for (var i in this.preSelection){
							selection.addRange(this.preSelection[i]);
						}
					}.bind(this),50);
				}
				if(event.type == 'mousemove'){
					if(drag.status){
						this.setClassName(o.box, '_FgGTrOptionsGrabbing', true);
						this.setClassName(o.box, '_FgGTrOptionsGrab',false);
						box.style.left = event.clientX - drag.X + 'px';
						box.style.top  = event.clientY - drag.Y + 'px';
					}
					if(o.detail.scrollbar && o.detail.scrollbar.status){
						this.onScroll(event);
					}


					if(o.detail.moreUl && o.detail.moreUl.contains(target)){
						Array.prototype.slice.call(o.detail.moreUl.children).forEach(function(li){
							if(li.contains(target)){
								li.getElementsByTagName('ul')[0].style.top 
										= li.getClientRects()[0].top + 16 +'px';
							}
						});
					}
				}

				if(event.type == 'DOMMouseScroll'){
					this.onScroll(event);
				}

				if(event.type == 'change'){
					if(box.contains(target)){
						if(target == o.checkbox){
							this.toggleCamelCase();
						}else if(target.className){
							if( /Select[^ ]/.test(target.className)){
								this.selectLanguages(event);
								if(target == o.get('OptionsSelectFrom'))
									this.updateLanguages();
							}else if(target.className.indexOf('Service')>0){
								this.toggleService();
							}
						}
					}
				}
				if(event.type == 'unload'){
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

			toggleService: function(){
				this.service = this.boxElements.serviceSelect.value;
				this.updateLanguages(true);
				this.setTranslateText();
			},

			swapLanguages: function(){
				var select = this.boxElements.box.getElementsByClassName('_FgGTrOptionsSelect'),
					[from, to] = [select[0].value, select[1].value];

				//先设置form更新列表后才设置to
				select[0].value = to;
				this.from = select[0].value;
				this.updateLanguages(true);

				select[1].value = 
						Array.prototype.some.call(select[1].options, function(i){return i.value == from})
						? from : select[1].options[0].value;
				this.to = select[1].value;
				this.setTranslateText();
			},

			selectLanguages: function(event){
				var target = event.target;
				if(target.className.indexOf('SelectTo')>0){
					this.to = target.value;
				}else{
					this.from = target.value;
				}
				this.setTranslateText();
			},

			toggleHidden: function(elm){
				var o = this.boxElements,
					t = o.toggleOn,
					c = '_FgGTrOptionsHidden';
				if(elm){
					this.setClassName(elm, c, t);
				}else{
					this.setClassName(o.toggleButton.parentNode, c, !t);
					this.setClassName(o.optionsBox, c, t);
				}
				o.toggleOn = !t;
			},

			setClassName: function(elm, className, add){
				var classList = elm.className.split(' '),
					_classList = [];
				className = className.split(' ');

				for(var i=0;i<className.length;i++){
					var find = 0;
					for(var j=0;j<classList.length;j++){
						if(className[i] == classList[j]){
							if(!add && classList[0]!=''){
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
					classList = classList[0]!='' ? classList.concat(_classList) : _classList;
				}

				classList = classList.sort().join(' ');
				if(elm.className.split(' ').sort().join(' ') != classList){
					elm.className = classList;
				}
			},

			xpPref:function(value){
				var pref = 'FireGestures.FGgTranslator.optionJSON';
				if(arguments.length==0){
					return Services.prefs.getCharPref(pref);
				}else{
					Services.prefs.setCharPref(pref, value);
					return value;
				}
			},

			getPref: function(){
				try{
					var pref = JSON.parse(this.xpPref());
					!pref.service && (pref.service = this.service);
					return pref;
				}catch(ex){
					var pref = {
						from:         this.from,
						to:           this.to,
						camelCase:    this.camelCase,
						service:      this.service,
						bingAppId:    this.bingAppId
					};
					this.xpPref(JSON.stringify(pref));
					return pref;
				}
			},

			setPref: function(json){
				if(json){
					var pref = this.getPref();
					for(var i in json)
						pref[i] = json[i];
					this.xpPref(JSON.stringify(pref));
				}else{
					this.xpPref(JSON.stringify({
						from:         this.from,
						to:           this.to,
						camelCase:    this.camelCase,
						service:      this.service,
						bingAppId:    this.bingAppId
					}));
				}
			},

			get camelCaseText() {
				return (this.camelCase 
							? this.selectText
								.replace(/([A-Z0-9])([A-Z])([a-z])/g, function(a, b, c, d){
									return b + ' ' + c.toLowerCase() + d;
								}).replace(/([a-z])([A-Z])/g, function(a, b, c){
									return b + ' ' + c.toLowerCase();
								}).replace(/([A-Za-z])\.([A-Za-z])/g, function(a, b, c){
									return b + ' ' + c.toLowerCase();
								})
							: this.selectText);
			},

			filter: {
				strFilter: function(str, num){
					num = num || 0;
					var f = [{
							'&':'&amp;',
							'\'':'&#x27;',
							'"':'&#x22;',
							'<':'&lt;',
							'>':'&gt;',
							'/':'&#47;',
						},
						' "\'“”‘’、｛｝{}[]【】.。…~·～〜，,;；:：' +
						'-=+*&＆＄$￥＊*＾^％%＃#＠@~()（）<>《》?？！!'
						],
						sF = arguments.callee;

					if(typeof num == 'number'){
						return str.replace(/./g, function(s){
								return num == 0 ? 
									(f[0][s] ? f[0][s] : s) : 
									(!!~f[1].indexOf(s) ? '' : s);
							});
					}else{
						return sF(str, 1).toLowerCase() == 
									sF(num, 1).toLowerCase();
					}
				},

				resultText: function(str){
					return str.replace(/(^\<span title\="[^"]+?" class\="[^"]+?"\>)((\<br \/\>)?[\s]?)*/,'$1')
					.replace(/\<span title\="[^"]+?" class\="[^"]+?"\>\<\/span\>/g,'')
					.replace(/(\<span title\="[^"]+?" class\=")([^"]+?)("\>[^\<]+)\<br \/\><\/span\>/g,
						'$1$2 '+'_FgGTrR-T-Span-P'+'$3</span><br />');
				},

				title: function(text, title, rt){
					var sF = this.strFilter;
					return '<span'+(title ? (' title="' + (rt ? rt+'\n' : '') +'原文:\n\t'+ sF(title) +'"') : '')
							+' class="_FgGTrR-T-Span">'+ (sF(text).replace(/\n+/g,'<br />')) + '</span>';
				},

				zhCut: function(str, start, end){
					var step = 0, string = '', i = 0, l = str.length;
					for (; i < l; i++) {
						step += /^[\u0391-\uFFE5]+$/.test(str.substr(i, 1)) ? 3 : 1;
						if (end < step)
							return string;
						else if (start < step)
							string += str.substr(i, 1);
					}
					return string;
				},

				ruCut: function (ak, al, ag) {
					var aj = 0, ah = '', ai = 0, af = ak.length;
					for (; ai < af; ai++) {
						aj += (/^[\u0600-\u06ff]+$/.test(ak[ai]) || /^[\ufb50\ufdff]+$/.test(ak[ai]) || /^[\ufe70-\ufefc]+$/.test(ak[ai]) || /^[\u0400-\u052F]+$/.test(ak[ai])) ? 2 : 1;
						if (ag < aj) {
							return ah
						} else {
							if (al < aj)
								ah += ak.substr(ai, 1)
						}
					}
					return ah
				}
			},

			getSelection: function(event){
				var view = event.view,
					selection = view.getSelection(),
					txt = '';

				if(!this.selectText || !this.boxElements.box.contains(event.target)){
					this.preSelection = [];
					for (var i = 0; i < selection.rangeCount; i++){
						this.preSelection.push(selection.getRangeAt(i));
					}
				}

				function innrText(elemt) {
					var str = '',
						childs = elemt.childNodes;
					for (var i = 0; i < childs.length; i++) {
						if (childs[i].nodeType == 1){
							if(!!~'divph1h2h3h4h5h6pre'
									.indexOf(childs[i].tagName.toLowerCase())){
								str += arguments.callee(childs[i]) + '\n';
							}else if(childs[i].tagName == 'BR'){
								str +=  '\n';
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
					.call(view.document.querySelectorAll('TEXTAREA, input'))
						.some(function(item){
							return item.contains(event.target);
						})
				){
					txt = event.target.value.substr(event.target.selectionStart, 
													event.target.selectionEnd - 
													event.target.selectionStart);
				}else{
					try{
						var tempElemnt = document.createElement('div')
						tempElemnt.appendChild(selection.getRangeAt(0).cloneContents());
						txt = innrText(tempElemnt);
					}catch(ex){
						return '';
					}
				}

				return txt.replace(/(\&nbsp\;)/g,' ')
							.replace(/(\n\s*\n)/g,'\n')
							.replace(/\n+/g,'\n');
			},

			setStyle: function(element){
				var style = document.createElement('style'),
					cssText = (function(){/*
						#_FgGTrMainBox, #_FgGTrMainBox :-moz-any(a, span, div, ul, li, img, h6, h5, input, select){
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
							border:none;
							max-width: none;
							min-width: 0;
							max-height:none;
							min-height:0;
							word-wrap: break-word;
							height: auto;
							width: auto;
							vertical-align: baseline;
							box-shadow: none;
							text-shadow:none;
							outline: none;
						}
						#_FgGTrMainBox #_FgGTrResult b{
							font-weight: bold;
						}
						._FgGTrOptionsSelect{
							background:#FFF;
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
							cursor: pointer;
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
						._FgGTrDetail:not(:empty), 
						._FgGTr-bd-drTab + ._FgGTrDetailOverflow{
							position: relative;
							padding-bottom:4px;
						}
						._FgGTrDetailOverflow{
							height:150px;
							overflow-y:hidden;
							padding-right:7px;
						}
						._FgGTrDetail>span{
							display:inline-block;
						}
						._FgGTrDetailOverflow>:-moz-any(span, ._FgGTr-bd-tContent){
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
							-moz-user-select: none;
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
							font-size: 12px;
							text-align:left;
							border: 1px solid #ccc;
							margin: 0;
							padding: 0;
							width: 88px;
							height: 24px;
							color:#000;
							outline: 0;
						}
						._FgGTrOptionsService{
							width: 65px;
						}
						._FgGTrOptionsCheckbox{
							position: relative;
							top: 2px;
							vertical-align: baseline;
						}
						._FgGTrOptionsCheckbox+span{
							margin-right:15px;
						}
						._FgGTrOptionsButton{
							-moz-user-select: none;
							background:#FFFFF0;
							border: 1px solid #CCCCCC;
							border-radius: 4px;
							color: #FFA500;
							height: 19px;
							padding: 0px 5px 0;
							font-size:12px;
							opacity:1;
						}
						._FgGTr-text-label{
							pointer-events: none;
							-moz-user-select: none;
						}
						#_FgGTrMainBox ul{
							list-style:none;
							display:inline-block;
						}
						#_FgGTrMainBox li{
							height:16px;
							line-height:16px;
						}
						._FgGTrDetailDictBing{
							color: #1F4072;
						}
						._FgGTrDetailDictB{
							font-weight: bold;
							display: block;
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

						._FgGTr-bd-sm-parts b{
							color: #124DF6;
						}
						._FgGTr-bd-sm-parts li{
							display: inline-block;
							margin-left: 10px;
							color: #1373B0;
						}
						._FgGTr-bd-sm-parts li:not(:last-child)::after{
							content: ';';
							color: #000;
						}
						._FgGTr-bd-sm-parts:not(._FgGTr-bd-sm-parts-sg) {
							height: auto;
							display: flex;
						}
						._FgGTr-bd-sm-parts._FgGTr-bd-sm-parts-sg>li{
							margin:0 0 0 5px;
							word-wrap: normal;
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

						._FgGTr-bd-drTab-current{
							background-color: #D7E3E9;
							font-weight: bold;
						}
						._FgGTr-bd-drTab+div{
							border:2px solid #A2CD5A;
						}
						._FgGTr-bd-drTab{
							width: 100%;
							
						}
						._FgGTr-bd-drTab>li {
							display: inline-block;
							padding: 2px 4px;
							margin: 1px 2px -2px;
							border: 2px solid #A2CD5A;
							border-radius: 5px 5px 0 0;
							border-bottom: 2px solid #D7E3E9;
							cursor: pointer;
							-moz-user-select: none;
							position: relative;
							z-index:1;
						}

						._FgGTr-bd-drTab>li:first-child{
							margin-left: 0;
						}
						._FgGTr-bd-drTab>li:not(._FgGTr-bd-drTab-current){
							color: #666;
						}
						._FgGTr-bd-drTab>li::after{
							display: block;
							width: calc(100% + 2px);
							height: 1px;
							content: '';
							position: absolute;
							bottom: -2px;
							left: -1px;
							background-color: #A2CD5A;
						}
						._FgGTr-bd-drTab>li._FgGTr-bd-drTab-current::after{
							width: 1px;
						}
						._FgGTr-bd-tContent>li:not(._FgGTr-bd-tContent-current){
							display:none;
						}
						._FgGTr-bd-net-means {
							list-style: inside decimal;
							width: 100%;
						}
						._FgGTr-bd-net-means>li {
							padding:2px 5px;
						}
						._FgGTr-bd-net-means>li:hover {
							background-color: #ccc;
						}
						._FgGTr-bd-net-means>li>span {
							color: #1373B0;
						}
						._FgGTr-bd-tContent>li {
							display: block;
							height: auto;
							margin: 10px 0;
						}
						._FgGTr-bd-tongfanyici li {
							height: auto;
						}
						._FgGTr-bd-tContent :-moz-any(h5, h6, b) {
							font-weight: bold;
						}
						._FgGTr-bd-tContent h5 {
							color: #000;
							font-size: 14px;
						}
						._FgGTr-bd-tContent h6 {
							color: #CC9646;
						}
						._FgGTr-bd-tContent b {
							color: #124DF6;
						}
						._FgGTr-bd-tongfanyici>li {
							display: flex;
						}
						._FgGTr-bd-tongfanyici>li>b {
							min-width: 30px;
						}
						._FgGTr-bd-word-mean>li {
							display: inline-block;
						}
						._FgGTr-bd-word-mean>li>a{
							color: #1373B0;
							text-decoration: none;
							padding: 0 2px;
						}
						._FgGTr-bd-word-mean>li>a:hover{
							text-decoration: underline;
							background-color: #ccc;
							border-radius: 3px;
							box-shadow:inset 0 0 4px rgba(0,0,0,.3);
							transition: background-color 200ms, box-shadow 200ms;
						}
						._FgGTr-bd-word-mean>li:not(:last-child)::after {
							content:',';
							color:#666;
						}
						._FgGTr-bd-tongfanyici h6 {
							margin:0;
						}
						._FgGTr-bd-cizu li{
							height:auto;
						}

						._FgGTr-bd-tContent {
							background-color: #D7E3E9;
							width: 100%;
						}
						._FgGTr-bd-czjx>li {
							margin-left: 20px;
						}
						._FgGTr-bd-cizu>li>span {
							display: block;
							font-weight: bold;
							margin-left: 5px;
							color: #CC9646;
						}
						._FgGTr-bd-czjx{
							width: 100%;
							
						}
						._FgGTr-bd-tongfanyici,
						._FgGTr-bd-part-name,
						._FgGTr-bd-czjx {
							counter-reset: bd-czjx;
						}
						._FgGTr-bd-czjx>li>span {
							font-weight: bold;
							color: #124DF6;
						}
						._FgGTr-bd-tongfanyici>li>h6:not(:empty)::before,
						._FgGTr-bd-part-name>li>h6:not(:empty)::before,
						._FgGTr-bd-czjx>li>span:not(:empty)::before {
							content: counter(bd-czjx)". ";
							counter-increment: bd-czjx;
							display: inline-block;
							margin-right: 5px;
							color: #777;
						}

						._FgGTr-bd-czlj{
							display: block;
							width: 100%;
						}
						._FgGTr-bd-tongfanyici>li>h6{
							margin-left: 20px;
						}

						._FgGTr-bd-tongfanyici>li>h6,
						._FgGTr-bd-czlj>li {
							color: #1373B0;
							width: 100%;
						}
						._FgGTr-bd-tongfanyici>li>h6:hover,
						._FgGTr-bd-czlj>li:hover{
							background-color: #F5ECD4;
							transition: background-color 200ms;
						}

						._FgGTr-bd-baike{
							min-height: 50px;
							text-indent: 2em;
							margin-left:5px;
							margin-right: 5px;
						}
						._FgGTr-bd-baike>span{
							vertical-align: text-top;
							text-decoration: none;
							color: #1373B0;
						}
						._FgGTr-bd-baike>span+a{
							position: relative;
							width: 12px;
							height:12px;
							display: inline-block;
							background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMS8yMy8xNAID5ZwAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAABI0lEQVQYlV2Qu0qcURSF19lnn+vPPzLgH7AJzitYDFhZBHwAEZ9AbCzTBVKFELuQiC9g4w3yIAGL2IiCjyB2wuDssyzMwOAHq103kMSyutJdqihVlN55Ro0v45XxhSMJAOhK98E5l81saK0dt9Y28R/xMpf1j+urNdffZnZtZt+HYbh3zj1gCZubuprrP2tmbPzlvb9rrX02s128J/jAWuo3kiipfF30U1FGjVdR418VpQAAiAQAzrlbJ+4ZAETkz2Qy2Q8hHMYYz98cc/2xWF1L3ckxf8kpb5VUTrvSrZEEokaWVI7e35RD3kshPfZdP5CEppROZrPZdknFi4gBEIIE8ElEzlT1CQBwsH/gRv3oZ/CBKsrgA4MPLLncTDem/SLhFW8KhG0rqnVmAAAAAElFTkSuQmCC') no-repeat 0 1px;
							opacity: 0.4;
							margin-left: 3px;
						}
						._FgGTr-bd-baike>span+a:hover{
							top: 1px;
							left: 1px;
							opacity: 0.6;
						}
					*/}).toString().replace(/^.+\s|.+$/g,'')
						.replace(/\/\/.*/g,'')
						.replace(/;\n/g,' !important;\n')
						.replace(/\n\t+\./g,'\n#_FgGTrMainBox .');
				style.textContent = cssText
						.replace(/\n\t+\$[^;]+;\$/g,'').replace(/\&/g,'&amp;');
				element.appendChild(style);
				return style;
			},
		}
	}
	window.FGgTranslator.init(event);
})(content.window, content.window.document);

