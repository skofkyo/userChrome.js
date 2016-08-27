// ==UserScript==
// @name			ImageSearch
// @version			0.0.1
// @description		搜索相似图片
// @include			main
// ==/UserScript==

// 下面的字符串可以被用来与网站的特定的变量传递图像的信息

// {$URL}				-> 替换图像地址 - 对 GET 和 POST 有效
// {$IMGDATA}			-> 替换为被右击的图像的数据 - 对 POST 有效
// {$IMGBASE64[H]}		-> 替换为被右击的图像的Base64（末尾包含H表示完整base64编码）的数据 - 对 POST 有效

location == "chrome://browser/content/browser.xul" && (function () {
	var imageSearch = {

		bgImage: true, //是否对背景图起效

		get contextMenu() document.getElementById('contentAreaContextMenu'),

		zh: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch).getCharPref("general.useragent.locale").indexOf("zh") != -1,

		site: {
			//Google为一般模板，Bing和baidu相对特殊另外一些处理
			'Google': 		{
				disable: false,	//默认非禁用，可省略
				icon: true,		//true时默认会使用 配置目录\extensions\userchromejs@mozdev.org\content\skin\imageSearch\Google.png 同名png文件作为菜单图标，可使用base64图片，注意要用引号引住【如 icon: 'data:image/jpeg;base64,xxxxxxxxxx==',】
				left:{ //左键，下面如果出现both则为左右键行为一致
					url:'https://www.google.com/searchbyimage', //搜图地址
					method: 'GET', //GET方法
					parameters:{
						qs: ['image_url={$URL}'] //查询字符串，
					}
				},right:{//右键，下面如果出现both则为左右键行为一致
					url:'https://www.google.com/searchbyimage/upload', 
					method: 'POST',//POST方法
					parameters:{
						qs: ['encoded_image={$IMGDATA}']
					}
				}},
			'Bing': 	{
				icon: true,
				left:{url:'http://cn.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi', method: 'GET',
					parameters:{
						qs: ['imgurl={$URL}']
					}
				},right:{url:'http://cn.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi', method: 'POST',
					parameters:{
						qs: ['imgurl=', 'cbir=sbi', 'imageBin={$IMGBASE64}'],
						whs:'sbifsz={$W}+x+{$H}+%c2%b7+{$S}+kB+%c2%b7+png&sbifnm=upload.png&thw={$W}&thh={$H}',//链接参数，W、H、S分别对应 宽、高、图片大小
						octetStream: true, //octet-stream
					}
				}},
			'Baidu': 		{
				icon: true,
				left:{url:'http://stu.baidu.com/i', method: 'GET',
					parameters:{
						qs: ['rt=0', 'rn=10', 'ct=1', 'tn=baiduimage', 'objurl={$URL}']
					}
				},right:{url:'http://image.baidu.com/i?rainbow=1&rt=0&rn=10&ct=0&stt=0&tn=shituresultpc', method: 'POST',
					parameters:{
						qs: ['dragimage={$IMGBASE64H}'] //完整base64图片字符串
					}
				}},
			'SauceNAO': 	{
				icon: true,
				left:{url:'http://saucenao.com/search.php', method: 'GET',
					parameters:{
						qs: ['db=999', 'url={$URL}']
					}
				},right:{url:'http://saucenao.com/search.php', method: 'POST',
					parameters:{
						qs: ['db=999', 'file={$IMGDATA}']
					}
				}},
			'IQDB': 		{
				icon: true,
				left:{url:'http://iqdb.org', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://iqdb.org', method: 'POST',
					parameters:{
						qs: ['file={$IMGDATA}']
					}
				}},
			'TinEye': 		{
				icon: true,
				left:{url:'http://www.tineye.com/search/', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://www.tineye.com/search/', method: 'POST',
					parameters:{
						qs: ['image={$IMGDATA}']
					}
				}},
			'GazoPa': 		{
				icon: true,
				left:{url:'http://www.gazopa.com/search/navigate', method: 'GET',
					parameters:{
						qs: ['key_url={$URL}']
					}
				},right:{url:'http://www.gazopa.com/search/navigate', method: 'POST',
					parameters:{
						qs: ['file={$IMGDATA}']
					}
				}},
			'Ascii2D': 		{
				icon: true,
				left:{url:'http://www.ascii2d.net/imagesearch/search/', method: 'POST',
					parameters:{
						qs: ['uri={$URL}']
					}
				},right:{url:'http://www.ascii2d.net/imagesearch/search/', method: 'POST',
					parameters:{
						qs: ['upload[file]={$IMGDATA}']
					}
				}},
			'Cydral': 		{//本人无法打开这个网站
				icon: true,
				both:{url:'http://www.cydral.com/', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				}},
			'Yandex': 		{//网站使用json查询，如果要使用本地的图片只能在网站上上传了。
				icon: true, 
				both:{url:'http://yandex.ru/images/search', method: 'GET',
					parameters:{
						qs: ['rpt=imageview', 'img_url={$URL}']
					}
				}},
			'Regex': 		{
				icon: true,
				left:{url:'http://regex.info/exif.cgi', method: 'GET',
					parameters:{
						qs: ['url={$URL}']
					}
				},right:{url:'http://regex.info/exif.cgi', method: 'POST',
					parameters:{
						qs: ['dummy=no', 'f={$IMGDATA}']
					}
				}},
			'E-Hentai': 	{//本人无法打开这个网站
				icon: true,
				both:{url:'http://gu.e-hentai.org/image_lookup.php', method: 'POST',
					parameters:{
						qs: ['sfile={$IMGDATA}', 'f_sfile=File Search', 'fs_similar=on', 'fs_exp=on']
					}
				}},
			'Doujinshi': 	{
				icon: true,
				left:{url:'http://www.doujinshi.org/IMGSERV/socket.php', method: 'GET', 
					parameters:{
						qs: ['URL={$URL}', 'COLOR=4']
					}
				},right:{url:'http://www.doujinshi.org/IMGSERV/socket.php', method: 'POST',
					parameters:{
						qs: ['img={$IMGDATA}', 'COLOR=4']
					}
				}},
		},

		init: function(){
			if(document.getElementById('imageSearch')) return;
			this.createMenu();
			var cM = this.contextMenu;
			cM.addEventListener('click', this, false);
			cM.addEventListener('popupshowing', this, false);
		},

		createMenu: function(){
			var cE = this.createElement,
				site = this.site,
				menu = cE('menu', {id: 'imageSearch', hidden: true, 
					label: this.zh ? '搜索相似图片' : 'Image Search'}, 
					[this.contextMenu, document.getElementById('context-saveimage')]),
				popup = cE('menupopup', null, menu);
			for(var i in site){
				if(site[i].disable) continue;
				let icon = site[i].icon,
					tip = [];
				('left' in site[i]) && tip.push((this.zh ? '左键：' : 'Left Click:') + site[i].left.method);
				('right' in site[i]) && tip.push((this.zh ?'右键：' : 'Right Click:') + site[i].right.method);
				('both' in site[i]) && tip.push((this.zh ?'左、右键：' : 'Left & Right Click:') + site[i].both.method);
				cE('menuitem', {
					class: 'menuitem-iconic image-search-engine', label: i, tooltiptext: tip.join('\n'),
					src: (typeof icon == 'boolean') && icon ? 'chrome://userchromejs/content/skin/imageSearch/' + i +'.png' : (icon ? icon :'')
				}, popup);
			}
			this.menu = menu;
		},

		createElement: function(name, attr, parent){
			var e = document.createElementNS(
					'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', name);
			if(attr) for (var i in attr) e.setAttribute(i, attr[i]);
			if(parent){
				if(parent instanceof Array){
					parent[0].insertBefore(e, parent[1]);
				}else{
					parent.appendChild(e);
				}
			}
			return e;
		},

		handleEvent: function(event){
			switch (event.type){
				case 'click':
					this.onClick(event);
					break;
				case 'popupshowing':
					this.onPopupShowing(event);
					break;
			}
		},

		onClick: function(event){
			var target = event.target,
				click = event.button == 2 ? 'right' : (event.button == 0 ? 'left' : null),
				imgURL = (gContextMenu && (gContextMenu.onImage && gContextMenu.imageURL) || 
					(this.bgImage && gContextMenu.hasBGImage && gContextMenu.bgImageURL)),
				site = this.site, name = null, rule = null;
			if(!click || !target.classList.contains('image-search-engine')) return;
			name = target.getAttribute('label');
			if(name in site){
				let engine = site[name],
					imgDataRequest = '', 
					dataParam = {},
					imgIndex = 0;
				dataParam.qs = [];
				rule = engine[click] ? engine[click] : engine.both;
				for(var j in rule.parameters){
					if(j != 'qs') dataParam[j] = rule.parameters[j];
				}

				for(var i = 0; i<rule.parameters.qs.length; i++){
					let regx = /\{\$([A-Z]*(?:64(?:H)?)?)\}/;
						match = rule.parameters.qs[i].match(regx);
					if(match){
						imgDataRequest = match;
						if(match[1] == 'URL'){
							dataParam.qs.push(rule.parameters.qs[i]
								.replace(regx, rule.method == 'GET' ? encodeURIComponent(imgURL) : imgURL));
						}else{
							imgIndex = i;
							dataParam.qs.push(rule.parameters.qs[i]);
						}
					}else{
						dataParam.qs.push(rule.parameters.qs[i]);
					}
				}

				if(!imgDataRequest) return;

				if(rule.method == 'GET'){
					this.methodGetURL(rule.url, dataParam);
				}else if(rule.method == 'POST'){
					if(imgDataRequest[1] == 'URL'){
						this.methodPostURL(rule.url, dataParam);
					}else{
						this.methodPostData(imgURL, rule.url, dataParam, imgIndex);
					}
				}
			}
		},

		onPopupShowing: function(event){
			var target = event.target;
			if(target.id == 'contentAreaContextMenu' && this.menu){
				if(gContextMenu && (gContextMenu.onImage || (this.bgImage && gContextMenu.hasBGImage))){
					this.menu.removeAttribute('hidden');
				}else{
					this.menu.setAttribute('hidden', true);
				}
			}
		},

		methodGetURL: function(siteURL, siteVars){
			siteVars = siteVars.qs;
			siteVars = siteVars.join('&');
			siteURL += (siteURL.indexOf('?') > 0 ? '&' : '?') + siteVars
			gBrowser.loadOneTab(siteURL, null, null, null, false, false);
		},

		methodPostURL: function(siteURL, siteVars) {
			siteVars = siteVars.qs;
			var separator = "-----------------------------8361219948688";
			var formData = "";
			for (var i = 0; i < (siteVars.length); i++) {
				var splitVar = siteVars[i].split("=", 2);
				formData += "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"" + splitVar[0] + "\"\r\n\r\n" + splitVar[1] + "\r\n";
			}
			formData += "--" + separator + "--\r\n"; //finish off request
			var postData = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);
			formData = "Content-Type: multipart/form-data; boundary=" + separator + "\n" + 'Content-Length: ' + formData.length + '\n\n' + formData;
			postData.setData(formData, formData.length);
			var flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
			gBrowser.selectedTab = gBrowser.addTab()
			gBrowser.loadURIWithFlags(siteURL, flags, Services.io.newURI(siteURL, null, null), null, postData);
		},


		methodPostData: function(imgURL, siteURL, siteVars, imgDataVar) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', imgURL, true);
			xhr.responseType = "blob";
			xhr.onload = () => {
				var blob = xhr.response;
				if(!blob) return;
				var reader = new FileReader();
				reader.onloadend = () => {
					var result = reader.result;
					if(!result) return;
					var p = siteVars;
					siteVars = siteVars.qs;
					var match = siteVars[imgDataVar].match(/\{\$([A-Z]*(?:64(H)?)?)\}/);
					var base64 = match && match[1] && match[1].indexOf('IMGBASE64') == 0;

					//use post instead of get - tricky stuff here...
					var separator = "-----------------------------8361219948688";
					var dataURL = result.split(',', 2)[1];
					var mimetype = xhr.getResponseHeader('content-type');
					var size = blob.size;
					dataURL = (base64 && match[2] == 'H' ? ('data:'+ mimetype +';base64,' + dataURL) : dataURL);
					var fileSpecifier = "";
					var formData = "";
					for (var i = 0; i < (siteVars.length); i++) {
						var splitVar = siteVars[i].split("=", 2);
						if (i == imgDataVar) {
							if(!base64){
								fileSpecifier = splitVar[0];
								formData += "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"iso2\"\r\n\r\nyoro~n\r\n";
							}else{
								formData += "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"" + splitVar[0] + "\"\r\n\r\n" + dataURL + "\r\n";
							}
						} else {
							formData += "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"" + splitVar[0] + "\"\r\n\r\n" + splitVar[1] + "\r\n";
						}
					}

					formData += "--" + separator + "--\r\n"; //finish off the string
					if(!base64){
						var imageData = atob(dataURL);
						var suffixStringInputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
						suffixStringInputStream.setData(formData, formData.length);
						//set up post form
						var prefixStringInputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);

						formData = "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"" + fileSpecifier + "\"; filename=\"upload.png" + "\"\r\n" + "Content-Type: \""+ mimetype +"\"\r\n\r\n";
						prefixStringInputStream.setData(formData, formData.length);
						//create storage stream
						var binaryOutStream = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);
						var storageStream = Cc["@mozilla.org/storagestream;1"].createInstance(Ci.nsIStorageStream);
						storageStream.init(4096, imageData.length, null);
						binaryOutStream.setOutputStream(storageStream.getOutputStream(0));
						binaryOutStream.writeBytes(imageData, imageData.length);
						binaryOutStream.close();
						//combine
						var combinedStream = Cc["@mozilla.org/io/multiplex-input-stream;1"].createInstance(Ci.nsIMultiplexInputStream);
						combinedStream.appendStream(prefixStringInputStream);
						combinedStream.appendStream(storageStream.newInputStream(0));
						combinedStream.appendStream(suffixStringInputStream);
						formData = "Content-Type: multipart/form-data; boundary=" + separator + "\n" + 'Content-Length: ' + combinedStream.available() + '\n\n';
						var postData = Cc["@mozilla.org/io/multiplex-input-stream;1"].createInstance(Ci.nsIMultiplexInputStream);
						var postHeader = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);

						postHeader.setData(formData, formData.length);
						postData.appendStream(postHeader);
						postData.appendStream(combinedStream);
					}else{
						if(p.octetStream) formData = "--" + separator + "\r\n" + "Content-Disposition: form-data; name=\"image\"; filename=\"\" \r\n\r\nContent-Type: application/octet-stream \r\n" + formData;

						formData = "Content-Type: multipart/form-data; boundary=" + separator + "\n" + 'Content-Length: ' + formData.length + '\n\n' + formData;

						var postData = Cc['@mozilla.org/io/string-input-stream;1'].createInstance(Ci.nsIStringInputStream);
						postData.setData(formData, formData.length);
					}


					var flags = Ci.nsIWebNavigation.LOAD_FLAGS_NONE;
					gBrowser.selectedTab = gBrowser.addTab();
					if(p.whs){
						var imageObj = new Image();
						imageObj.src = imgURL;
						siteURL += (siteURL.indexOf('?') > 0 ? '&' : '?') + 
						p.whs.replace(/\{\$([WHS])\}/g, ($0, $1) => {
							if($1 == 'W') return imageObj.width;
							else if($1 == 'H') return imageObj.height;
							else if($1 == 'S') return Math.round(size/1024);
						});
					}
					gBrowser.loadURIWithFlags(siteURL, flags, Services.io.newURI(siteURL, null, null), null, postData);
				};
				reader.readAsDataURL(blob);
			};
			xhr.send(null);

		},
	};

	imageSearch.init();
})();