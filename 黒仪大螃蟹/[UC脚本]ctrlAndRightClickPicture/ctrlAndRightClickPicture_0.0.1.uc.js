// ==UserScript==
// @name           Ctrl And Right Click Picture
// @version        0.0.1
// @include        main
// @description    使用Ctrl + 右键，破解某些禁止右键图片另存为的站点
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(){
	var ctrlAndRightClickPicture ={
		image: null,
		getCursor: function(event){
			var target = event.view,
				top = 0,
				left = 0,
				rect = null;
			while(target != null && target != content.window.top){
				rect = target.frameElement.getBoundingClientRect();
				top += rect.top || 0;
				left += rect.left || 0;
				target = target.parent;
			}
			return {
				x: left + event.clientX,
				y: top + event.clientY
			};
		},
		getPic: function(event){
			try{
				this.image && this.image.remove();
			}catch(e){}
			var o = this.getCursor(event);
			var target = event.target;
			if(target.localName == "img" && (target.naturalWidth > 4 || target.naturalHeight > 4)){
				return null;
			}
			var imgs = content.document.querySelectorAll("img[src]");
			for(var img of imgs){
				var rect = img.getBoundingClientRect();
				if(rect.left < o.x , rect.left + rect.width > o.x 
					&& rect.top < o.y && rect.top + rect.height > o.y){
					var image = content.document.createElement("img");
					image.style.cssText = 'width:' + img.width +'px;'
										+ 'height:' + img.height +'px;'
										+ 'top:' + ((rect.height - img.height)/2 + rect.top) +'px;'
										+ 'left:' + ((rect.width - img.width)/2 + rect.left) +'px;'
										+ 'position: fixed;'
										+ 'z-index:100000;'
										+ 'opacity: 0;';
					image.src = img.src;
					content.document.body.appendChild(image);
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
				this.image = this.getPic(event);
			}else if(event.type == "popuphiding"){
				try{
					this.image && this.image.remove();
				}catch(e){}
			}
		}
	};

	ctrlAndRightClickPicture.init();
})();