// ==UserScript==
// @name           Ctrl And Right Click Picture
// @version        0.0.2
// @include        main
// @description    使用Ctrl + 右键，破解某些禁止右键图片另存为的站点
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){
	var ctrlAndRightClickPicture ={
		image: null,
		getPicture: function(event){
			try{
				this.image && this.image.remove();
			}catch(e){}
			var target = event.target;
			if(target.localName == "img" && (target.naturalWidth > 4 || target.naturalHeight > 4)){
				return null;
			}
			var targetStyle = getComputedStyle(target),
				imgs = event.view.document.querySelectorAll("img[src]"),
				x = event.clientX,
				y = event.clientY;
			for(var img of imgs){
				var rect = img.getBoundingClientRect(),
					bh = (rect.height - img.height) / 2,
					bw = (rect.width - img.width) / 2;
				if(rect.left < x , rect.left + rect.width + bw > x 
					&& rect.top < y && rect.top + rect.height + bh > y
					&& (Math.abs(parseInt(targetStyle.height) - img.height) < 20
					|| Math.abs(parseInt(targetStyle.width) - img.width) < 20)
				){
					var image = event.view.document.createElement("img");
					image.style.cssText = 'width:' + img.width +'px;'
										+ 'height:' + img.height +'px;'
										+ 'top:' + (bh + rect.top) +'px;'
										+ 'left:' + (bw + rect.left) +'px;'
										+ 'cursor:' + targetStyle.cursor + ';'
										+ 'position: fixed;'
										+ 'z-index:100000;'
										+ 'opacity: 0;';
					image.src = img.src;
					event.view.document.body.appendChild(image);
					return image;
				}
			}
			return null;
		},
		init: function(){
			gBrowser.addEventListener("mousedown", this, true);
			gBrowser.addEventListener("keydown", this, true);
			document.getElementById("contentAreaContextMenu").addEventListener("popuphiding", this, true);
		},
		handleEvent: function(event){
			if(event.type == 'mousedown' && event.button == 2 && event.ctrlKey){
				this.image = this.getPicture(event);
			}else if(event.type == "popuphiding"){
				try{
					this.image && this.image.remove();
				}catch(e){}
			}
		}
	};

	ctrlAndRightClickPicture.init();
})();