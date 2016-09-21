/*
 * Name: SewisePlayer framework 3.2.0
 * Author: keyun
 * Website: http://player.sewise.com
 * Date: October 26, 2015
 * Copyright: 2013-2016, Sewise
 * Mail: keyun@sewise.com
 * QQ: 
 * 
 */

(function(win){
	/**
	 * @name Sewise Player
	 * @sewise播放器框架的全局命名空间, 框架内部所有类的命名空间基于此扩展.
	 */
	var Sewise = win.Sewise = win.Sewise || 
	{
		name: "Sewise Player",
		version: "3.2.0",
		build: "2016.5.20 19:00",
	
	};
	var SewisePlayerSkin = win.SewisePlayerSkin = win.SewisePlayerSkin || {};
})(window);

(function(){
	/**
	 * Constructor.
	 * @name Utils : 工具对象.
	 * 
	 */
	var Utils = Sewise.Utils = {
		/**
		 * JSONP方式请求，服务器端要求地址格式如下
		 * 1.点播: "http://192.168.1.24/service/playerapi/?do=getvideos&callback=callbackFun&programid=WDK4kyc3&m3u8=1&isAjax=1";
		 * 2.直播: "http://192.168.1.219/service/playerapi/?do=getm3u8bypid&programid=xCM4opc3&published=0";
		 */
		jsonp: function(obj){
			var url = obj.url;
			var jsonp = obj.jsonp;
			var jsonpCallback = obj.jsonpCallback;
			var data = obj.data;
			var success = obj.success;
			var dataStr = "";
			for (var prop in data) { 
				dataStr += ("&" + prop + "=" + data[prop]);
			}
			dataStr = ("?" + dataStr.slice(1));
			if(jsonp === undefined){
				jsonp = "callback";
			}
			if(jsonpCallback === undefined){
				jsonpCallback = "callbackFun" + new Date().getTime();
			}
			var funStr = "&" + jsonp + "=" + jsonpCallback;
			var src = url + dataStr + funStr;
			var script = document.createElement('script');
	        script.setAttribute("type", "text/javascript");
	        script.src = src;
	        document.body.appendChild(script);
	        window[jsonpCallback] = success;
	        script.onload = script.onreadystatechange = function(){
				if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete'){
	        		document.body.removeChild(script);
				}
			};
		},
		getScript: function(obj){
			var url = obj.url;
			var data = obj.data;
			var success = obj.success;
			var dataStr = "";
			for (var prop in data) { 
				dataStr += ("&" + prop + "=" + data[prop]);
			}
			dataStr = ("?" + dataStr.slice(1));
			var src = url + dataStr;
			var script = document.createElement('script');
	        script.setAttribute("type", "text/javascript");
	        script.src = src;
	        document.body.appendChild(script);
	        script.onload = script.onreadystatechange = function(){
	        	success();
				if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete'){
	        		document.body.removeChild(script);
				}
			};
		},
		
		getParameters: function(fileNames){
			var sc = document.getElementsByTagName('script');
		    var paramsArray;
		    var scriptElement;
		    try{
			   var scLen = sc.length;
			   for(var j = 0; j < scLen; j ++){
			   		var srcPathArray = sc[j].src.split('#');
			   		var jsPath = srcPathArray[0];
			   		var jsPathArray = jsPath.split('/');
			   		if(jsPathArray.length == 1)
			   		{
			   			jsPath = jsPathArray[0];
			   		}else{
			   			jsPath = jsPathArray[jsPathArray.length - 1];
			   		}
			   		if(jsPath == fileNames[0] || jsPath == fileNames[1])
			   		{
			   			if(srcPathArray.length > 1){
			   				paramsArray = srcPathArray[1].split('&');
			   			}else{
			   				paramsArray = [];
			   			}
			   			scriptElement= sc[j];
			   			
			   			//获取js文件的相对路径
			   			if(jsPath == fileNames[0]||jsPath == fileNames[1]){
				   			var lastIndex = srcPathArray[0].lastIndexOf("/");
				   			if(lastIndex > 0) Sewise.localPath = srcPathArray[0].slice(0, lastIndex + 1);
				   		}
			   			/////////////////////
			   			break;
			   		}
			   }
			   var args = {}, argsStr = [], param, t, name, value;
			   for(var i = 0, len = paramsArray.length; i < len; i++){
			   		param = paramsArray[i].split('=');
			      	name = param[0];
			      	value=param[1];
			       	if(typeof args[name] == "undefined"){
			        	args[name] = value;
			        }else if(typeof args[name] == "string"){
		                args[name] = [args[name]];
		                args[name].push(value);
		            }else{
		                args[name].push(value);
		            }
			    }
			   args.scriptElement=scriptElement;
			    return args;
		    }catch(e){
		    	return [];
		    }
		},
		
		parseURL:function(url) { 
			var r = {
                protocol: /([^\/]+:)\/\/(.*)/i,
                host: /(^[^\:\/]+)((?:\/|:|$)?.*)/,
                port: /\:?([^\/]*)(\/?.*)/,
                pathname: /([^\?#]+)(\??[^#]*)(#?.*)/
             };
            var tmp, res = {};
            res.href = url;
            for (var p in r) {
                tmp = r[p].exec(url);
                if(tmp){
                   res[p] = tmp[1];
                   url = tmp[2];
                  if(url === "") {
                      url = "/";
                   }
                  if(p === "pathname") {
                      res.pathname= tmp[1];
                      res.search= tmp[2];
                      res.hash= tmp[3];
                   }
               }
            }
            res.segments=res.pathname.split("/");
            return res;
        },    
		
		object: {
			isEmpty: function(obj){
			    for (var name in obj){
			        return false;
			    }
			    return true;
			},
			paramsLength:function(obj){
				var pn=0;
				for (var va in obj){
			        pn++;
			    }
				return pn;
			}
		},
		
		browser: {
			versions: function(){
	           	var u = navigator.userAgent, app = navigator.appVersion; 
	           	var u2=navigator.userAgent.toLowerCase();
	           
	           	return {
	           				trident: u.indexOf('Trident') > -1, 										//IE内核
			                presto: u.indexOf('Presto') > -1, 											//opera内核
			                webKit: u.indexOf('AppleWebKit') > -1,										//苹果、谷歌内核
			                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, 				//火狐内核
			                mobile: !!u.match(/AppleWebKit.*Mobile.*/),									//是否为移动终端
			                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),							//ios终端
			                android: u.indexOf('Android') > -1,											//android终端
			                iPhone: u.indexOf('iPhone') > -1,											//是否为iPhone
			                iPad: u.indexOf('iPad') > -1,												//是否iPad
			            	webApp: u.indexOf('Safari') == -1,//是否web应该程序，没有头部与底部
			            	safari: (u2.match(/version\/([\d.]+).*safari/))?true:false
		            	};
	 		}(),
	 		supportH5: function(){																		//是否支持HTML5特性
	 			var isH5 = false;
	 			if(navigator.geolocation){
	 				isH5 = true;
	 			}
	 			return isH5;
	 		}(),
	 		supportFlash: function(){																	//是否支持Flash特性
	 			if(navigator.mimeTypes.length > 0){
	                var flashAct = navigator.mimeTypes["application/x-shockwave-flash"];
	                return flashAct !== undefined ? flashAct.enabledPlugin !== undefined : false;
	            }else if(self.ActiveXObject){
	                try{
	                    new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	                    return true;
	                }catch(oError){
	                    return false;
	                }
	            }
	 		}(),
	 		supportHls:function(){
	 			return window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
	 		}(),
	 		language: (navigator.browserLanguage || navigator.language).toLowerCase(),
	 		ieVersionNumber:function(){
	 			/MSIE\s*(\d+)/i.test(navigator.userAgent);
                var ienum=parseInt(RegExp.$1?RegExp.$1:0);
                return ienum;
	 		}()
		},
		
		location: {
			hostname: function(url){
				if(url){
					var a = document.createElement('a');
            		a.href = url;
            		return a.hostname;
				}else{
					return window.location.hostname;
				}
			},
			port: function(url){
				if(url){
					var a = document.createElement('a');
            		a.href = url;
            		return a.port;
				}else{
	            	return window.location.port;
	            }
			},
			porthost: function(url){
				var hostname;
				var port;
				if(url){
					var a = document.createElement('a');
            		a.href = url;
            		hostname = a.hostname;
            		port = a.port;
				}else{
					hostname = window.location.hostname;
		            port = window.location.port;
		        }
	            var porthost = hostname;
	            if(port && port !== "0" && port !== "") porthost = hostname + ":" + port;
	            return porthost;
			}
		},
		
		loader: {
			loadCssFile:function(url,loadend,loaderror){
				if(!isInclude(url)){
				   var css = document.createElement('link');
				   css.rel = 'stylesheet';
				   css.type="text/css";
				   css.href = url;
				   if(loadend){
//				   	   css.onload=function(){
//				   	   	  loadend();
//				   	   };
				   	   styleOnload(css,loadend);//兼容各种老式浏览器
				   }
				   if(loaderror){
	           		   css.onerror = function(){
	                	  loaderror();
	                   };
                   }
                   document.getElementsByTagName('head')[0].appendChild(css);
				}else{
					if(loadend)
					   loadend();
				}
				
                function isInclude(name){
                   var js= /js$/i.test(name);
                   var es=document.getElementsByTagName(js?'script':'link');
                   for(var i=0;i<es.length;i++) 
                      if(es[i][js?'src':'href'].indexOf(name)!=-1)return true;
                      return false;
                }
                function styleOnload(node, callback) {
                  // for IE6-9 and Opera
                  if (node.attachEvent) {
                    node.attachEvent('onload', hcsslod);
                  }
                 // polling for Firefox, Chrome, Safari
                 else {
                   setTimeout(function() {
                     poll(node, callback);
                   }, 0); // for cache
                 }
                 function hcsslod(){
                 	node.detachEvent("onload",hcsslod);
                 	callback();
                 }
               }
             function poll(node, callback) {
               if (callback.isCalled) {
                 return;
               }
               var isLoaded = false;
               if (/webkit/i.test(navigator.userAgent)) {//webkit
                 if (node.sheet) {
                   isLoaded = true;
                  }
               }
              // for Firefox
              else if (node.sheet) {
                try {
                   if (node.sheet.cssRules) {
                      isLoaded = true;
                   }
                } catch (ex) {
                    // NS_ERROR_DOM_SECURITY_ERR
                if (ex.code === 1000) {
                   isLoaded = true;
                }
              }
             }
             if (isLoaded) {
               // give time to render.
               setTimeout(function() {
                  callback();
                 }, 1);
             }
             else {
                setTimeout(function() {
                   poll(node, callback);
                }, 1);
              }
            }
			},
			loadJsFile: function(winObj, url, callback, loaderror, winObj2){
	            var nodeHead = document.getElementsByTagName('head')[0];
	            var nodeScript = null;
	            if((!winObj && !winObj2) || winObj == "override"){
	                //console.log("no lib");
	                nodeScript = document.createElement('script');
	                nodeScript.type = 'text/javascript';
	                nodeScript.charset = 'utf-8';
	                nodeScript.src = url;
	                if(callback){
	                    nodeScript.onload = nodeScript.onreadystatechange = function(){
	                        if(nodeScript.ready){
	                            return false;
	                        }
	                        if(!nodeScript.readyState || nodeScript.readyState == "loaded" || nodeScript.readyState == 'complete'){
	                            nodeScript.ready = true;
	                            callback();
	                        }
	                    };
	                }
	                if(loaderror){
		           		nodeScript.onerror = function(){
		                	loaderror();
		                };
	                }
	                nodeHead.appendChild(nodeScript);
	            }else{
	                //console.log("have lib");
	                if(callback){
	                    callback();
	                }
	            }
	        }
	        
	        
		}

		

	};
})();

(function(sewise){
	/**
	 * Constructor.
	 * @name ContextMenu : 播放器右键菜单项.
	 * 
	 */
	var ContextMenu = sewise.ContextMenu = function(container, params){
		var contextMenu,itemStyle;
		container.oncontextmenu = function(e){
			if(e.preventDefault){
				e.preventDefault();
			}else{
				e.returnValue = false;
			}
			/////////////////////
			if(!contextMenu){
			contextMenu = document.createElement("div");
			contextMenu.innerHTML = 
								'<ul class="sewise_player_contextmenu_items">' + 
									'<li>' + params.playerName + '</li>' + 
									'<li>' + params.playerVersion + '</li>' + 
									'<li>' + params.buildDate + '</li>' + 
									'<li>--------------------------------------------------</li>' + 
									'<li>' + params.copyright + '</li>' + 
								'</ul>';
			///////////////////////////////////////////////////
			contextMenu.style.position = 'absolute';
			contextMenu.style.width = '300px';
			contextMenu.style.background = '#eee';
			contextMenu.style.border = '1px solid #ccc';
			contextMenu.style.boxShadow = "3px 3px 3px rgba(0, 0, 0, 0.3)";
			contextMenu.style.left = (e.clientX - container.getBoundingClientRect().left) + 'px';
			contextMenu.style.top = (e.clientY - container.getBoundingClientRect().top) + 'px';
			contextMenu.style.zIndex = 888;
			container.appendChild(contextMenu);
			}else{
			   contextMenu.style.left = (e.clientX - container.getBoundingClientRect().left) + 'px';
			   contextMenu.style.top = (e.clientY - container.getBoundingClientRect().top) + 'px';
			   contextMenu.style.zIndex = 888;
			   container.appendChild(contextMenu);
			}
			///////////////////////////////////////////////////
			if(!itemStyle){
			itemStyle = document.createElement("style");
			itemStyle.innerHTML = 'ul.sewise_player_contextmenu_items {margin:0; padding:0; }' + 
								  'ul.sewise_player_contextmenu_items li {list-style: none; padding: 5px 20px; cursor: default; font-family: "MS Sans Serif", Geneva, sans-serif; font-size: 10px; }' + 
								  'ul.sewise_player_contextmenu_items li:hover {background: #888; color: #fff; }';
			container.appendChild(itemStyle);
			}else{
				container.appendChild(itemStyle);
			}
			///////////////////////////////////////////////////
			document.onmousedown = function(e){
				if(e.target.textContent == params.playerName){
					window.open("http://player.sewise.com/", "_blank");
				}
				if(contextMenu){
					container.removeChild(contextMenu);
					container.removeChild(itemStyle);
					//contextMenu = null;
					//itemStyle = null;
				}
			};

		};
		
	};
	
})(window.Sewise);

(function(win){
	//win.Sewise.localPath="http://192.168.1.117/sewiseplayer_js_2.7.0/bin/";
	//首先判断是否需要加载jQuery库文件
	var jqueryPath = win.Sewise.localPath + "js/jquery.min.js";
	//win.Sewise.Utils.loader.loadJsFile(window.jQuery, jqueryPath, jqueryLoadedCallback, jqueryLoadedError, window.Zepto);
	function jqueryLoadedCallback(){
		//alert("加载jquery库成功！");
	}
	function jqueryLoadedError(){
		alert("加载jquery库错误！");
	}
})(window);


(function(sewise){
	/**
	 * Constructor.
	 * @name Utils : 皮肤层工具对象.
	 * 
	 */
	var Utils = sewise.SkinUtils = {
		stringer: {
			time2FigFill: function(num){
	        	var time;
	        	num = Math.floor(num);
				time =(num < 10 ? "0" + num :String(num));
				return time;
			},
			secondsToHMS: function(seconds){
				if(seconds < 0) return;
				var hour = this.time2FigFill(Math.floor(seconds / 3600));
				var min = this.time2FigFill((seconds / 60) % 60);
				var sec = this.time2FigFill(seconds % 60);
				return hour + ":" + min + ":" + sec;
			},
			secondsToMS: function(seconds){
				if(seconds < 0) return;
				var min = this.time2FigFill(seconds / 60);
				var sec = this.time2FigFill(seconds % 60);
				return min + ":" + sec;
			},
			dateToTimeString: function(newDate){
				var date;
				if(newDate){
					date = newDate;
				}else{
					date = new Date();
				}
				var ye = date.getFullYear();
				var mo = date.getMonth() + 1;
				var da = date.getDate();
				var ho = this.time2FigFill(date.getHours());
				var mi = this.time2FigFill(date.getMinutes());
				var se = this.time2FigFill(date.getSeconds());
				return ye + "-" + mo + "-" + da + " " + ho + ":" + mi + ":" + se;
			},
			dateToTimeStr14: function(date){
				var ye = date.getFullYear();
				var mo = this.time2FigFill(date.getMonth() + 1);
				var da = this.time2FigFill(date.getDate());
				var ho = this.time2FigFill(date.getHours());
				var mi = this.time2FigFill(date.getMinutes());
				var se = this.time2FigFill(date.getSeconds());
				return ye + mo + da + ho + mi + se;
			},
			dateToStrHMS: function(date){
				var ho = this.time2FigFill(date.getHours());
				var mi = this.time2FigFill(date.getMinutes());
				var se = this.time2FigFill(date.getSeconds());
				return ho + ":" + mi + ":" + se;
			},
			dateToYMD: function(date){
				var ye = date.getFullYear();
				var mo = this.time2FigFill(date.getMonth() + 1);
				var da = this.time2FigFill(date.getUTCDate());
				return ye + "-" + mo + "-" + da;
			},
			hmsToDate: function(hms){
				var hmsArray = hms.split(":");
				var ho = hmsArray[0] ? hmsArray[0] : 0;
				var mi = hmsArray[1] ? hmsArray[1] : 0;
				var se = hmsArray[2] ? hmsArray[2] : 0;
				var date = new Date();
				date.setHours(ho, mi, se);
				return date;
			},
			hmsToSeconds: function(hms){
				var hmsArray = hms.split(":");
				var ho = hmsArray[0] ? parseInt(hmsArray[0]) : 0;
				var mi = hmsArray[1] ? parseInt(hmsArray[1]) : 0;
				var se = hmsArray[2] ? parseInt(hmsArray[2]) : 0;
				var seconds = ho * 3600 + mi *60 + se;
				return seconds;
			},
			timeStr14ToDate:function(str){
                var year = str.substring(0, 4);
                var month = str.substring(4, 6);
                var day = str.substring(6, 8);
                var hour = str.substring(8, 10);
                var minute = str.substring(10, 12);
                var second = str.substring(12, 14);
                var date = new Date(year, month-1, day, hour, minute, second);
                return date;
			}
			
		},
		language: {
			zh_cn: {
				"stop": "停止播放",
				"pause": "暂停",
				"play": "播放",
				"fullScreen": "全屏",
				"normalScreen": "恢复",
				"soundOn": "打开声音",
				"soundOff": "关闭声音",
				"clarity": "清晰度",
				"titleTip": " ",
				"claritySetting": "清晰度设置",
				"clarityOk": "确定",
				"clarityCancel": "取消",
				"backToLive": "回到直播",
				"loading": "缓冲",
				"subtitles": "字幕",
				"default": "默认",
				"urlError":"无效的视频地址"
			},
			en_us: {
				"stop": "Stop",
				"pause": "Pause",
				"play": "Play",
				"fullScreen": "Full Screen",
				"normalScreen": "Normal Screen",
				"soundOn": "Sound On",
				"soundOff": "Sound Off",
				"clarity": "Clarity",
				"titleTip": " ",
				"claritySetting": "Definition Setting",
				"clarityOk": "OK",
				"clarityCancel": "Cancel",
				"backToLive": "Back To Live",
				"loading": "Loading",
				"subtitles": "Subtitles",
				"default": "Default",
				"urlError":"invalid video url"
			},
			lang:{},
			init: function(lan){
				switch(lan){
					case "en_US":
						this.lang = this.en_us;
						break;
					case "zh_CN":
						this.lang = this.zh_cn;
						break;
					default:
						this.lang = this.zh_cn;
				}
			},
			getString: function(str){
				return this.lang[str];
			}
			
		},
		browser:{
			isXiaoMiBrowser:function(){
				var ua=navigator.userAgent;
				if(ua.indexOf("MiuiBrowser")>=0)
				   return true;
				else
				   return false;
			},
			isHuaweiBrowser:function(){
				var ua=navigator.userAgent.toLowerCase();
				if(ua.indexOf("huawei")>=0)
				   return true;
				else
				   return false;
			},
			 versions:function(){   
           var u = navigator.userAgent, app = navigator.appVersion;   
           return {//移动终端浏览器版本信息   
                trident: u.indexOf('Trident') > -1, //IE内核  
                presto: u.indexOf('Presto') > -1, //opera内核  
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核  
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核  
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端  
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端  
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器  
                iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器  
                iPad: u.indexOf('iPad') > -1, //是否iPad    
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部  
            };  
         }()
		},
		resizeRectangle:function(videoWidth, videoHeight, containerWidth, containerHeight){
        var rect={};
        var xscale= containerWidth / videoWidth;
        var yscale= containerHeight / videoHeight;
        if (xscale >= yscale) {
            rect.width = Math.min(videoWidth * yscale, containerWidth);
            rect.height = videoHeight * yscale;
        } else {
            rect.width = Math.min(videoWidth * xscale, containerWidth);
            rect.height = videoHeight * xscale;
        }
        rect.width = Math.ceil(rect.width);
        rect.height = Math.ceil(rect.height);
        rect.x = Math.round((containerWidth - rect.width) / 2);
        rect.y = Math.round((containerHeight - rect.height) / 2);
        return rect;
       }
		
		
	};
	
})(window.Sewise);

(function(sewise){
	/**
	 * Constructor.
	 * @name GlobalConstant : 全局常量.
	 * 
	 */
	var GlobalConstant = sewise.GlobalConstant = {
		FLASH: "flash",
		HTML5: "html5",
		
		VOD: "vod",
		LIVE: "live",
		
		AUDIO: "audio",
		VIDEO: "video",

		FLV: "flv",
		MP4: "mp4",
		RTMP: "rtmp",
		HTTP: "http",
		M3U8: "m3u8",
		MP3: "mp3",
		OGG:"ogg",
		
		PLAYER_NAME: sewise.name,
		PLAYER_COPYRIGHT: "(C) All right reserved the SEWISE inc 2015-2016",
		PLAYER_VERSION: "Version: " + sewise.version,
		BUILD_DATE: "Build: " + sewise.build,
        
        //-------------皮肤类型---------
		SKIN_TYPE_TANGERINE:"tangerine"
	};
	
})(window.Sewise);


(function(sewise){
	/**
	 * Constructor.
	 * @name GlobalVars : 全局变量.
	 * 
	 */
	var GlobalVars = sewise.GlobalVars =function() {
		this.clarities=[];
		
	};
	
})(window.Sewise);


(function(sewise){
	var Log = sewise.Log = {
    trace: true,
    
    logPrefix: "(SewisePlayer)",

    log: function(){
      if ( !this.trace ) return;
      if (typeof console == "undefined") return;
      var args = makeArray(arguments);
      if (this.logPrefix) args.unshift(this.logPrefix);
      console.log.apply(console, args);
      return this;
    }
  };
})(window.Sewise);


(function(sewise){
	/*
	 * 基于观察者模式的事件类
	 * Author:keyun
	 * Date:2015/9/25
	 */
	var Event=sewise.Event={
	
        on:function(evt, handler) {
        	var calls = this.eventListeners || (this.eventListeners = {});
            if (!(this.eventListeners[evt])) this.eventListeners[evt] = [];
            this.eventListeners[evt].push(handler);
        },
        off:function(evt, handler) {
        	if(!this.eventListeners) return false;
        	if(!this.eventListeners[evt]) return false;
        	
            var listeners = this.eventListeners[evt] || [];
            var i = listeners.indexOf(handler);
            if (i >= 0) {
                listeners.splice(i, 1);
            }
        },
        fireEvent:function(evt, evtData) {
        	if(!this.eventListeners) return false;
        	if(!this.eventListeners[evt]) return false;
            var listeners = this.eventListeners[evt] || [];
            $(listeners).each(function (i, func) {
                func(evtData);
            });
        },
        clearAllRegisterEvents:function(){
        	if(!this.eventListeners) return false;
        	var arr;
        	for(var key in this.eventListeners){
        		if(this.eventListeners[key]){
        			arr=this.eventListeners[key];
        			arr.splice(0,arr.length);
        		}
        	}
        }
	};
})(window.Sewise);


(function(sewise){
	/**
	 * Constructor.
	 * @name Events : 播放器事件对象.
	 * 
	 */
	var SewisePlayerEvent=sewise.SewisePlayerEvent = {
		PARAMS_READY: "paramsReady",
		PLAYER_READY:"playerReady",
		PLAYER_SKIN_LOADED: "player_skin_loaded",
		PLAYER_SKIN_LOADED_ERROR: "player_skin_loaded_error",
		STREAMS_DATA_READY: "streams_data_ready",
		STREAMS_DATA_FAILED: "streams_data_failed",
		GET_VOD_STREAMS: "get_vod_streams",
		GET_LIVE_STREAMS: "get_live_streams",
		GET_SHIFT_STREAMS: "get_shift_streams",
		
		PLAY_VIDEO: "play_video",
		PLAY_NEXT: "playNext",
		
		PLAY_START: "start",
		PLAY_PAUSE: "pause",
		PLAY_ENDED: "ended",
		PlAY_STOP:"stop",
		PLAYING:  "playing",
		DURATION_CHANGE: "durationChange",
		TIME_UPDATE: "timeupdate",
		LOAD_PROGRESS: "loadProgress",
		BUFFER_PROGRESS:"bufferProgress",
		METADATA:"metadata",
		SEEK:"seek",
        SEEKED:"seeked",
		LOAD_OPEN: "bufferBegin",
		LOAD_COMPLETE: "bufferComplete",
		BEFORE_PLAY:"beforePlay",
		//INFO_LOADED:"info_loaded",
		SHARE_VIDEO:"shareVideo",
		
		SET_VIDEO_URL:"setVideoUrl",
		UPDATE_VIDEO_URL:"updateVideoUrl",
		CONTROLBAR_SHOW_SATE:"controlbarShowState",
		
		FLASH_HLS_EVENTS:"hlsEvents",
		FULLSCREEN:"fullScreen",
		CANCEL_FULLSCREEN:"cancelFullScreen",
		SKIN_SHOWSTATE_CHANGE:"skinShowStateChange",
		FULLSCREEN_BTN_CLICK:"fullScreenBtnClick",
		NORMALSCREEN_BTN_CLICK:"normalScreenBtnClick"
		
	};
	
})(window.Sewise);


(function(win,$){
	/*
	 * 模拟html5 video的flash视频播放类
	 * 扩展swf播放器，目标是提供和html5 video一样的接口api
	 */
	var FlashVideo =win.Sewise.FlashVideo=function(isLive,playerID,mediaType){
		//实例ID,当页面有多个播放器实例时，用ID区别回调方法
        this.instanceID=null;
        //真正的flash(swf)播放器
        this.flashPlayer=null;
        //视频总时间
        this._duration=0;
        //当前播放时间，点播时类型为Number,直播时类型为Date
        this.currentPlayTime=0;
        //实例唯一ID赋值
        this.instanceID = 'flash_' +playerID;
        
        this.videoUrl="";
        //是否是直播
        this.isLive=isLive;
        //视频类型
        this.type="";
        //iframe内部的window(IE8之类的浏览器使用)
        this.subWindow=null;
        
        this.ieVersion=0;
        
        this.mediaType=mediaType;
        //poster元素容器
        this.posterElement=null;
        
        var insKey=this.instanceID;
        FlashVideo.flashInstances[insKey] = this;
     
   };
	
	//扩展FlashVideo类属性
    $.extend(FlashVideo,{
    	flashInstances:{}
    });
    FlashVideo.fn=FlashVideo.prototype;

    //-------------------flash播放器回调的js函数-------------------------------------------------------
    win.playerReady = function (instanceId) {
   
        //根据id获得对应的FlashVideo实例对象
        var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.flashReady();
        	flashVideo.fireEvent("flash_playerReady");//SewiseVideo对象监听
        }
        
    };
    win.onStart=function(instanceId){
    	var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
           flashVideo.fireEvent("play");
        }
        if(flashVideo.posterElement){
           flashVideo.posterElement.remove();
           flashVideo.posterElement=null;
        }
	};
	win.onBeforePlay=function(instanceId){
    	var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
           flashVideo.fireEvent("beforePlay");
        }
	};
	win.onStop=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("ended");
        }
	};
	win.onMetadata=function(meta, instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	var obj=JSON.parse(meta);
        	if(obj.duration&&parseFloat(obj.duration)>0)
        	flashVideo._duration=obj.duration;
        	flashVideo.fireEvent("durationchange");
        	flashVideo.fireEvent("loadedmetadata",obj);
        	//alert(obj.duration);
        }	
	};
	win.onClarity=function(clarity, instanceId){
			//console.log("onClarity");
	};
	win.onPause=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("pause");
        }
	};
	win.onSeek=function(time, instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("seeking",time);
        }
        //console.log("seeking");
	};
	win.onPlayTime=function(time, instanceId){
		//console.log(time+"xxxxx");
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo)
        {
        	flashVideo.currentPlayTime=time;	
        	flashVideo.fireEvent("timeupdate");
        }	
	};
	win.onBuffer=function(pt,instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("bufferprogress",pt);
        }
        //console.log(pt+"缓冲中...");
	};
	win.onBufferEmpty=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("seeking");
        }
        //console.log("bufferEmpty");
	};
	win.onBufferFull=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("seeked");
        }
        //console.log("bufferFull");
	};
		
	win.onLoadProgress=function(pt,instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("progress",pt);
        }
	};
	win.onFlashStageClick=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("singleClick");
        }
	};
	win.onFlashDoubleClick=function(instanceId){
		var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("doubleClick");
        }
	};
	win.flashlsCallback = function(eventName, args,instanceId) {
       //flashlsEvents[eventName].apply(null, args);
       var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	var obj={"eventName":eventName,"data":args};
        	flashVideo.fireEvent("hlsEvents",obj);
        }
        //if(eventName=="hlsSeekState")
           //console.log(args);
    };
    win.onSkinShowState=function(state,instanceId){
    	var flashVideo=FlashVideo.flashInstances[instanceId];
        if(flashVideo){
        	flashVideo.fireEvent("skinStateChange",state);
        }
    };
	//IE8之类浏览器flash回调
    FlashVideo.fn.handleIframeFlashCall=function(fparam){
		var subWin=this.subWindow;
		subWin.onPlayTime=function(time, instanceId){
			//console.log(time+"--"+instanceId);
			win.onPlayTime(time,instanceId);
		};
		subWin.playerReady = function (instanceId) {
			win.playerReady(instanceId);
		};
		subWin.onBeforePlay=function(instanceId){
    	    win.onBeforePlay(instanceId);
	    };
		subWin.onStart=function(instanceId){
			win.onStart(instanceId);
		};
		subWin.onStop=function(instanceId){
			win.onStop(instanceId);
		};
		subWin.onMetadata=function(meta, instanceId){
			win.onMetadata(meta,instanceId);
		};
		subWin.onPause=function(instanceId){
			win.onPause(instanceId);
		};
		subWin.onSeek=function(time, instanceId){
			win.onSeek(time,instanceId);
		};
		subWin.onBuffer=function(pt,instanceId){
			win.onBuffer(pt,instanceId);
		};
		subWin.onBufferEmpty=function(instanceId){
			win.onBufferEmpty(instanceId);
		};
		subWin.onBufferFull=function(instanceId){
			win.onBufferFull(instanceId);
		};
		subWin.onLoadProgress=function(pt,instanceId){
			win.onLoadProgress(pt,instanceId);
		};
		subWin.onFlashStageClick=function(instanceId){
		    win.onFlashStageClick(instanceId);
	    };
	    subWin.onFlashDoubleClick=function(instanceId){
		    win.onFlashDoubleClick(instanceId);
	    };
	    subWin.onClarity=function(clarity, instanceId){
			//console.log("onClarity"+clarity.videoUrl);
	    };
	    subWin.flashlsCallback = function(eventName, args,instanceId){
	    	win.flashlsCallback(eventName,args,instanceId);
	    };
	    subWin.onSkinShowState=function(state,instanceId){
    	    win.onSkinShowState(state,instanceId);
        };
        if(fparam.adsCallBack){//广告相关接口回调
        	var adsCallStr=decodeURIComponent(fparam.adsCallBack);
        	var adsFunObj=JSON.parse(adsCallStr);
        	subWin[adsFunObj.adsPlayCallBack]=function(data){
        		win[adsFunObj.adsPlayCallBack](data);
        	};
        }
	};
	
    //----------扩展FlashVideo实例对象方法，这些方法只能通过装饰类SewiseVideo调用------------------------------------------------------
    win.Sewise.Event.addEventListener=win.Sewise.Event.on;
    win.Sewise.Event.removeEventListener=win.Sewise.Event.off;
    $.extend(FlashVideo.prototype,win.Sewise.Event, {
            play: function () {
                if (!this.flashPlayer) return;
                this.flashPlayer.doPlay();
            },
            stop: function () {
                if (!this.flashPlayer) return;
                this.flashPlayer.doStop();
            },
            pause: function () {
                if (!this.flashPlayer) return;
                this.flashPlayer.doPause();
            },
            seek:function(time){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.doSeek(time);
            },
            //直播方法
            live:function(){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.doLive();
            },
            //直播方法
            liveTime:function(){
            	if (!this.flashPlayer) return;
            	var tLiveTime;
                tLiveTime=this.flashPlayer.liveTime();
            	return tLiveTime;
            },
            //直播方法
            setDuration:function(value){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.setDuration(value);
            },
            //直播方法
            refreshTimeSpan:function(startTime, endTime, localTime, gmtTimes){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.refreshTimeSpan(startTime, endTime, localTime, gmtTimes);
            },
            //点播方法
            playProgram:function(programId, startTime, autostart){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.playProgram(programId, startTime, autostart);
            },
            //直播方法
            playChannel:function(programId, shiftTime, autostart,serverPath){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.playChannel(programId, shiftTime, autostart,serverPath);
            },
            toPlay:function(videoUrl, title, startTime, autostart){
            	if (!this.flashPlayer) return;
            	this.flashPlayer.toPlay(videoUrl, title, startTime, autostart);
            },
            flashReady: function () {
            },
            renderTo: function(flashVars,el){
		        var flashParams = {
				    allowfullscreen 	: false,
				    wmode             	: "transparent",
				    allowscriptaccess 	: "always"
			    };
			    var flashAttrs = {
				    id 					: this.instanceID,
				    name 				: this.instanceID
			    };
			    var swfPath = flashVars.swfPath;
			
			    var mainSwfPath;
			    if(!swfPath){
				    if(this.mediaType == win.Sewise.GlobalConstant.AUDIO){
					    mainSwfPath = win.Sewise.localPath + "flash/AudioPlayer.swf";
				    }else{
					    mainSwfPath = win.Sewise.localPath + "flash/SewisePlayer.swf";
				    }
			    }else{
				    if(this.mediaType == win.Sewise.GlobalConstant.AUDIO){
					    mainSwfPath = swfPath + "flash/AudioPlayer.swf";
				    }else{
					    mainSwfPath = swfPath + "flash/SewisePlayer.swf";
				    }
			    }
			    var that=this;
			    this._duration=flashVars.duration;
			    this.type=flashVars.type;
			    //flashVars.programId="";//已经获得了视频地址，节目id清空
			    if(flashVars.adsJSONStr){//广告数据
			    	flashVars.adsJSONStr=encodeURIComponent(flashVars.adsJSONStr);
			    }
			    var ieNum=win.Sewise.Utils.browser.ieVersionNumber;//ie版本号
			    var issafari=win.Sewise.Utils.browser.versions.safari;
			    //ieNum=10;
			    if(ieNum>0&&ieNum<=10&&!issafari){
			    	this.ieVersion=ieNum;
			    	buildFlash(flashVars,el);
			    }else{
			    	//加载flash播放器到指定容器
            	    var swfDiv = document.createElement("div");
			        var swfDivId = "swfBox"+this.instanceID;
		            swfDiv.id = swfDivId;
		            el.append(swfDiv);
			    	var swfobjectPath = win.Sewise.localPath + "js/swfobject.js";
			        win.Sewise.Utils.loader.loadJsFile(win.swfobject, swfobjectPath, swfobjectLoadedCallback);
			    }
			    this.createPoster(flashVars.poster,el);//创建poster图片
			   
			    function swfobjectLoadedCallback(){
			    	swfobject.embedSWF(mainSwfPath, swfDivId, "100%", "100%", "9.0.115", false, flashVars, flashParams, flashAttrs, function(){
				       //保存flash播放器引用，以便调用内部接口
				       that.flashPlayer = document.getElementById(that.instanceID);
				       //console.log($(el).html());
			        });
			    }
			    //ie8之类浏览器特殊处理，这样js才能调用flash的方法
			    function buildFlash(obj,box){
			    	var paramStr=getParamsStr(obj);
			        var ht='<object name="'+flashAttrs.name+'" width="100%" height="100%"  style="margin:0 0 0 0" id="'+flashAttrs.id+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'+
			        '<param name="allowfullscreen" value="false"/>'+
			        '<param name="wmode" value="transparent"/>'+
			        '<param name="allowScriptAccess" value="always"/>'+
			        '<param name="flashvars" value="'+paramStr+'"/>'+
			        '<param name="movie" value="'+mainSwfPath+'"/>'+
	                '</object>';

                    //var wrapHtml="<html><head><meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" /><title></title></head><body style=\"background-color: #000000;\">这是IE8之类浏览器特殊处理的页面</body></html>";	
                    var iframe = document.createElement("iframe");
		 	        iframe.frameBorder=0;
		 	        iframe.marginHeight=0;
		 	        iframe.marginWidth=0;
		 	        iframe.scrolling="no";
			        iframe.style.width="100%";
			        iframe.style.height="100%";
			        box.append(iframe);
			        //iframe.src=wrapHtml;
			        iframe.contentWindow.document.write(ht);
			        iframe.contentWindow.document.body.style.backgroundColor="#000000";
			        that.subWindow=iframe.contentWindow;
			        that.flashPlayer=iframe.contentDocument.getElementById(flashAttrs.id);
			        that.handleIframeFlashCall(obj);
			        if(that.ieVersion>0&&that.ieVersion<=10){//刷新高度
			          var vh=$(iframe).height()+"px";
			          $(that.flashPlayer).css("height",vh);
			          $(iframe).bind("sewiseIframeResize",function(){
			          	   var h=$(iframe).height()+"px";
			          	   $(that.flashPlayer).css("height",h);
			          	   //alert("hahhadaaaa");
			          });
			        }
			    }
			    function getParamsStr(obj){
			    	var str;
			    	for(var k in obj){
			    		if(typeof str!="undefined") {
							str += "&" + k + "=" + obj[k];
						}
						else{
							str = k + "=" + obj[k];
						}
			    	}
			    	return str;
			    }
			    
            }
        });  
        
        FlashVideo.fn.createPoster=function(poster,box){
        	var that=this;
        	if(poster){
        	   this.posterElement=$('<div class="sewiseplayer-poster-div"><img class="sewiseplayer-poster-img"></img></div>').appendTo(box);
        	   var posterImg=this.posterElement.find(".sewiseplayer-poster-img");
        	   posterImg.get(0).onload=imgLoad;
        	   posterImg.attr("src",poster);
        	}
        	function imgLoad(){
        		if(that.posterElement){
        		var iw=posterImg.width(),ih=posterImg.height(),boxW=box.width(),boxH=box.height()-2;
        		var rectObj=win.Sewise.SkinUtils.resizeRectangle(iw,ih,boxW,boxH);
        		posterImg.width(rectObj.width);
        		posterImg.height(rectObj.height);
        		that.posterElement.css("left",rectObj.x);
        		that.posterElement.css("top",rectObj.y);
        		}
        	}
        	window.onresize=function(){imgLoad();};
        };
        //--------------------扩展FlashVideo实例对象属性，这些属性只能通过装饰类SewiseVideo调用-----------------------------------------------------
        FlashVideo.fn.setVolume=function(value){
        	if(this.flashPlayer){
        		this.flashPlayer.setVolume(value);
        	}
        };
            
        FlashVideo.fn.muted=function(value){
        	if(this.flashPlayer){
        		if(value)
        			this.flashPlayer.setVolume(0);
        		else
        			this.flashPlayer.recoverVolume();
        	}
        };
        FlashVideo.fn.getCurrentTime=function(){
        	return this.currentPlayTime;
        };
        FlashVideo.fn.setCurrentTime=function(value){
        	this.currentPlayTime=value;
        	if(this.flashPlayer){
        		this.flashPlayer.doSeek(value);
        	}
        };
        FlashVideo.fn.getDuration=function(){
        	return this._duration;
        };
        FlashVideo.fn.src=function(value){
        	if(value){
        		this.videoUrl=value;
        		if(this.flashPlayer){
        			//this.flashPlayer.switchClarity(value);
        			this.fireEvent("canplay");
        		}
        	}else{
        		return this.videoUrl;
        	}
        };
        FlashVideo.fn.screenshot=function(){
            if(this.flashPlayer)
              this.flashPlayer.doScreenshot();
        };
})(window,window.jQuery);

(function(sewise,$){
	/*
	 * 播放控制器类
	 * Author:keyun
	 * Date:2015/9/25
	 */
	var PlayController=sewise.PlayController=function(param,playerID,sewisePlayer){
		
		//播放器主类实例对象
		this.sewisePlayer=sewisePlayer;
		//全局参数实例对象
		this.globalParam=param;
		//是否是直播
		this.isLive=param.server==sewise.GlobalConstant.LIVE?true:false;
	    //获得播放关键参数对象
		this.playVars=this.globalParam.getPlayVars();
		//判断使用flash还是html5播放器
		this.playerType = this.globalParam.playerType;
		
		//视频音频核心实例对象
		this.sewiseVideo=null;
		//皮肤控制器实例对象
		this.skinController=null;
		//视频对象容器
		this.videoContainer=null;
		
		//播放器ID
		this.playerID=playerID;
		
		//全局常量实例
		this.globalVars=new sewise.GlobalVars();
		//更新节目id或者时移播放时值为true
		this.isUpateProgramID=false;
		//当前时移日期
		this.livePlayTime=null;
		//当前服务器日期
		this.serverTime=null;
		this.startMilliTime = 0;
		this.timeZoneOffsetTime = 0;
		this.intervalID=null;
		//电脑时间与服务器时间的偏移量
		this.timeOff=0;
		//没有时移数据时，是否回到直播
		this.backToLive=false;
		//是否锁屏
		this.isLockScreen=false;
		//是否seeking状态
		this.isSeeking=false;
		if(this.playerType == sewise.GlobalConstant.HTML5)
		   this.isHtml5=true;
		else
		   this.isHtml5=false;
		if(this.globalParam.mediaType==sewise.GlobalConstant.AUDIO){
		   this.isVideo=false;
		   this.sewiseVideo=new sewise.SewiseAudio(this.playerType,playerID);
		}
		else{
			this.isVideo=true;
		   this.sewiseVideo=new sewise.SewiseVideo(this.playerType,this.isLive,playerID);
		}
    };
	PlayController.fn=PlayController.prototype;
	$.extend(PlayController.fn,sewise.Event);
	PlayController.fn.startup=function(videoContainer,skinContainer)
	{
		this.videoContainer=videoContainer;
		//加载播放器皮肤
		var skinLoad=new sewise.PlayerSkinLoader(skinContainer,this.playVars.skin);
		skinLoad.on(sewise.SewisePlayerEvent.PLAYER_SKIN_LOADED,$.proxy(this.handleSkinLoaded,this));
		skinLoad.load(this.playVars.skinClass);
		
		this.registerDataEvents();
		
		//初始化右键菜单
		if(this.playerType == sewise.GlobalConstant.HTML5&&!sewise.Utils.browser.versions.mobile)
		    var contextMenu = new sewise.ContextMenu(this.sewisePlayer.getPlayerContainer(),this.playVars);
	};
	//加载皮肤成功，初始化皮肤控制器
	PlayController.fn.handleSkinLoaded=function(){
		
		this.skinController=new sewise.SkinController(this.playerID,this.playVars.skinClass,this.globalParam);
		
		this.skinController.logo(this.playVars.logo);
		this.skinController.lang(this.playVars.lang);
		this.skinController.clarityBtnDisplay(this.playVars.clarityBtnDisplay);
		this.skinController.timeDisplay(this.playVars.timeDisplay);
		this.skinController.controlBarDisplay(this.playVars.controlBarDisplay);
		this.skinController.topBarDisplay(this.playVars.topBarDisplay);
		this.skinController.bigPlayBtnDisplay(this.playVars.bigPlayBtnDisplay);
		this.skinController.customDatas(this.playVars.customDatas);
		this.skinController.player(this);
		this.skinController.volume(this.playVars.volume);
        if(this.isLive)
           this.skinController.duration(this.playVars.duration);
		
		//创建视频或者音频播放组件
		this.createSewiseMedia();
		//皮肤文件存在隐藏原生控制面板
	    this.sewiseVideo.controls(false);
		//获取分析播放数据
		if(this.isLive){
			if(this.playVars.shiftTime){
				this.getShiftStreams();
			}else{
				this.getLiveStreams();
			}
		}else{
		   this.getStreams();	
		}
	};
	//分析点播播放数据
	PlayController.fn.getStreams=function()
	{
		var that=this;
		var params=this.playVars;
		this.globalVars.clarities=[];
		//通过JSONP方式请求获取实际地址
		if(params.programId)
		{
			 sewise.Utils.jsonp({
					url:params.serverPath+params.programId,
					jsonp:"callback",
					//jsonpCallback:"callbackFun",
					data:{
						mode: "vod",
						protocal:params.protocal
					},
					success:function(data){
					   params.videoUrl = data.url;
					   var str=data.url.substr(data.url.length-4,4);
					   if(str.indexOf("mp4")>=0)
					      params.type="mp4";
					   else if(str.indexOf("flv")>=0)
					      params.type="flv";
					   else
					      params.type = sewise.GlobalConstant.M3U8;
						
						
						var clarity = { name: "默认", videoUrl: params.videoUrl, id: 0, selected: true };
						that.globalVars.clarities.push(clarity);
						//发出播放数据准备好通知。
						that.streamsReadyNotice(params);
					}
				});
	            return;
	       }
			
			//使用JSON格式多清晰度播放地址
		   if(params.videosJsonUrl)
		   {
		   	   if(this.playerType == sewise.GlobalConstant.HTML5)
				  this.parseVodData(params,params.videosJsonUrl);
			   else{
			   	  //传入flash的videosJsonUrl参数已经在GlobalParams处理过，这里要反序列化才能用
				  var jsonObj=JSON.parse(decodeURIComponent(params.videosJsonUrl));
				  this.parseVodData(params,jsonObj);
			   }
			   this.streamsReadyNotice(params);
			   return;
			}

			//如果programId参数未设置，则使用videoUrl播放地址
			if(params.videoUrl){
				var clarity = { name: "默认", videoUrl: params.videoUrl, id: 0, selected: true };
				this.globalVars.clarities.push(clarity);
				//发出播放数据准备好通知。
				this.streamsReadyNotice(params);
			}else{
				if(params.url==="#"){
				  //没有视频地址，只是初始化播放器
				  this.streamsReadyNotice(params);
				}else{
				  //发出播放数据获取失败的通知。
				  this.streamsFailedNotice();
				}
			}
			
			
	};
	//------------分析videosJsonUrl的函数----------------------------------
	PlayController.fn.parseVodData=function(playVar,data){
		playVar.title = data.programname;
		var videos = data.videos;
		var defaultClarity;
		this.globalVars.clarities=[];
		for(var i = 0; i < videos.length; i ++)
		{
			var video = videos[i];
			var clarity = { name: "", videoUrl: "", id: 0, selected: false };
			clarity.name = video.name ? video.name : "";
			clarity.selected = video.selected ? video.selected : false;
			clarity.videoUrl = video.url;
			clarity.id = i;
			this.globalVars.clarities.push(clarity);
			if(clarity.selected){
				defaultClarity = clarity;
				defaultClarity.selected = true;
				playVar.videoUrl = defaultClarity.videoUrl;
			}  
		}
		if(!defaultClarity){	
	      //将数组中第一个数据设置为默认播放视频
		  defaultClarity = this.globalVars.clarities[0];
		  defaultClarity.selected = true;
		  playVar.videoUrl = defaultClarity.videoUrl;
		}
		
   };
   PlayController.fn.streamsReadyNotice=function(params){
	     
		if(this.isLive)
		{
			this.initTimes(params);
		}
		else
		{
			if(this.isVideo)
		     this.skinController.initialClarity(this.globalVars.clarities);
		}
		//设置皮肤显示元素，主要是根据数据处理后返回的信息内容。
		this.skinController.programTitle(params.title);
		this.skinController.getMedia();
		if(this.isUpateProgramID){
			if(this.isLive){
			   this.toLivePlay(params.streamUrl,params.title,params.shiftTime,params.autoStart);	
			}else{
			  this.toPlay(params.videoUrl,params.title,params.startTime,params.autoStart);
			}
		}else{
		  this.readyPlay(params);	
		}
			
		
	};
	PlayController.fn.streamsFailedNotice=function(){
		if(this.playVars.showError===false) return;
		alert(sewise.SkinUtils.language.getString("urlError"));
	};
	
	//直播调用的方法
	PlayController.fn.initTimes=function(param){
			if(param.liveTime){
				//livePlayTime = new Date(params.liveTime.substring(0, 4), params.liveTime.substring(4, 6) - 1, params.liveTime.substring(6, 8), params.liveTime.substring(8, 10), params.liveTime.substring(10, 12), params.liveTime.substring(12, 14));
				this.livePlayTime = new Date(parseFloat(param.liveTime));
			}else{
				this.livePlayTime = new Date();
			}
			this.startMilliTime = this.livePlayTime.getTime();
			
			if(param.serverTime){
				//serverTime = new Date(params.serverTime.substring(0, 4), params.serverTime.substring(4, 6) - 1, params.serverTime.substring(6, 8), params.serverTime.substring(8, 10), params.serverTime.substring(10, 12), params.serverTime.substring(12, 14));
				this.serverTime = new Date(param.serverTime * 1000);
			}else{
				if(!this.serverTime) this.serverTime = new Date(this.startMilliTime);
			}
			this.timeOff=this.startMilliTime-(new Date()).getTime();
			this.beginLiveTimeHeart();
	};
	//启动直播心跳函数，更新直播时间
	PlayController.fn.beginLiveTimeHeart=function(){
		var that=this;
		clearInterval(this.intervalID);
		this.intervalID=setInterval(refreshTime,200);
		function refreshTime(){
			that.serverTime=new Date(that.serverTime.getTime()+200);
			var cda=new Date();
			that.livePlayTime=new Date(cda.getTime()+that.timeOff);
		}
	};
	//分析直播播放数据
	PlayController.fn.getLiveStreams = function(){
		var params=this.playVars;
		var that=this;
			if(params.programId&&this.isHtml5)
			{
				sewise.Utils.jsonp({
					url:params.serverPath+params.programId,
					//url:"http://219.232.161.204/api/player/",
					data:{
						mode: "live",
						protocal:params.protocal
					},
					success:function(data){
						if(data.url){
						  params.streamUrl =data.url;
						  params.type = sewise.GlobalConstant.M3U8;
						  //liveTime当前时移时间，servertime当前服务器时间。
						  if(data.livetime)
						     params.liveTime = data.livetime;
						  else if(data.live_time)
						     params.liveTime=data.live_time;
						  //发出播放数据准备好通知。
						  that.streamsReadyNotice(params);
						}else{
							if(data.error){
							  if(that.playVars.showError===false) return;
							  alert(data.error);
							}
						}
					}
				});
	            
	        }else if(params.programId&&!this.isHtml5){//flash内部请求
				that.streamsReadyNotice(params);
	        }
			else if(params.streamUrl){
				//发出播放数据准备好通知。
				this.streamsReadyNotice(params);
			}else{
				if(params.url==="#"){
				  //没有视频地址，只是初始化播放器
				  this.streamsReadyNotice(params);
				}else{
				  //发出播放数据获取失败的通知。
				  this.streamsFailedNotice();
				}
			}
	};
	//分析直播时移数据
	PlayController.fn.getShiftStreams = function(){
		var params=this.playVars;
		var that=this;
		if(this.isHtml5){
			sewise.Utils.jsonp({
				url:params.serverPath+params.programId,
				//url:"http://219.232.161.204/api/player/",
				data:{
					mode: "timeshift",
					protocal:params.protocal,
					start_tm: params.shiftTime
				},
				success:function(data){
					if(data.url){
					   params.streamUrl = data.url;
					   if(data.livetime)
						 params.liveTime = data.livetime;
					   else if(data.live_time)
						 params.liveTime=data.live_time;
					  //发出播放数据准备好通知。
					  that.streamsReadyNotice(params);	
					}else if(data&&parseInt(data.code)==10004){
						//没有时移，重新回到直播
					  that.fireEvent(sewise.SewisePlayerEvent.GET_LIVE_STREAMS);	
					}
				}
			});
		}
		else
		{
			that.streamsReadyNotice(params);
		}
	};
	//创建核心视频音频对象
	PlayController.fn.createSewiseMedia=function()
	{
		this.registerMediaEvents();
		this.sewiseVideo.init(this.playVars,this.videoContainer);
	};
	//数据准备好了，准备播放
	PlayController.fn.readyPlay=function(param)
	{
		var that=this;
		this.sewiseVideo.on("sewiseMediaReady",function(){
			if(that.playerType == sewise.GlobalConstant.HTML5)
			{
				if(that.isLive)
				{
					that.sewiseVideo.updatePlayer(param.streamUrl, param.buffer, param.shiftTime, param.poster, param.type,param.fallbackUrls, param.volume,param.hlsjs);
			        that.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.SET_VIDEO_URL,{url:param.streamUrl});
			        that.sewiseVideo.play();
			
				}else{
					that.sewiseVideo.updatePlayer(param.videoUrl, param.buffer, param.startTime, param.poster, param.type,param.fallbackUrls, param.volume,param.hlsjs);
			        that.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.SET_VIDEO_URL,{url:param.videoUrl});
			        if(param.autoStart){
				        if(param.startTime > 0)
				          that.sewiseVideo.seek(param.startTime);
				        else{
				        	if(that.playVars.url==="#") return;
				        	 that.sewiseVideo.play();
				        }
			        }	
				}	   
		    }
			else
		    {
			    
		    }
		    if(that.isVideo)
		      that.skinController.setScreenEvent();
		});
	
	    this.loadPlugins();
	    this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAYER_READY);
	    this.sewiseVideo.readyPlay();
	};
	//加载播放器插件
	PlayController.fn.loadPlugins = function () {
        var plugins =this.sewisePlayer.plugins || {};
        for (var s in plugins) {
            plugins[s].init(this.sewisePlayer);
        }
    };
	PlayController.fn.registerDataEvents=function()
	{
		this.on(sewise.SewisePlayerEvent.GET_VOD_STREAMS,$.proxy(function(){
			this.getStreams();
		},this));
		this.on(sewise.SewisePlayerEvent.GET_LIVE_STREAMS,$.proxy(function(){
			this.getLiveStreams();
		},this));
		this.on(sewise.SewisePlayerEvent.GET_SHIFT_STREAMS, $.proxy(function(){
			this.getShiftStreams();
		},this));
		
	};
	/*********************************侦听播放相关事件来控制皮肤显示状态，并抛出事件给外部使用者监听***********************************************/
	
	PlayController.fn.registerMediaEvents=function()
	{
		this.sewiseVideo.on(sewise.SewisePlayerEvent.PLAY_START, $.proxy(this.playStartHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.PLAY_PAUSE, $.proxy(this.playPauseHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.PLAY_ENDED, $.proxy(this.playEndedHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.PLAYING, $.proxy(this.playingHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.DURATION_CHANGE, $.proxy(this.durationChangeHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.TIME_UPDATE, $.proxy(this.timeupdateHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.LOAD_PROGRESS, $.proxy(this.loadProgressHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.BUFFER_PROGRESS, $.proxy(this.bufferProgressHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.LOAD_OPEN, $.proxy(this.loadedOpenHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.LOAD_COMPLETE, $.proxy(this.loadedCompleteHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.METADATA, $.proxy(this.metadataHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.SEEK, $.proxy(this.seekHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.SEEKED, $.proxy(this.seekedHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.BEFORE_PLAY, $.proxy(this.beforePlayHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.FLASH_HLS_EVENTS, $.proxy(this.hlsEventHandler,this));
		this.sewiseVideo.on(sewise.SewisePlayerEvent.SKIN_SHOWSTATE_CHANGE, $.proxy(this.skinStateChangeHandler,this));
	};
	PlayController.fn.playStartHandler=function(e){
		this.skinController.started();
	    this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAY_START);
	};
	PlayController.fn.playingHandler=function(e){
		this.skinController.started();
	    this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAYING);
	};
	PlayController.fn.playPauseHandler=function(e){
		this.skinController.paused();
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAY_PAUSE);
		//that.onPause();
	};
	PlayController.fn.playEndedHandler=function(e){
		this.skinController.stopped();
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAY_ENDED);
	};
	PlayController.fn.durationChangeHandler=function(e){
		this.skinController.duration(this.sewiseVideo.duration());
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.DURATION_CHANGE);
	};
	PlayController.fn.timeupdateHandler=function(e){
		
		var time =this.sewiseVideo.currentTime();
		//alert(time);
		if(this.isLive){
			this.livePlayTime = new Date(this.startMilliTime + time * 1000);
			this.skinController.timeUpdate(null);
		}else{
			this.skinController.timeUpdate(time);
		}
		//console.log("当前时间"+time);
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.TIME_UPDATE);
	};
	PlayController.fn.metadataHandler=function(e){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.METADATA,e);
	};
	PlayController.fn.seekHandler=function(e){
		this.isSeeking=true;
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.SEEK,e);
	};
	PlayController.fn.seekedHandler=function(e){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.SEEKED,e);
	};
	PlayController.fn.beforePlayHandler=function(e){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.BEFORE_PLAY);
	};
	PlayController.fn.loadProgressHandler=function(e){
		var pt = e.progress;
		if(!this.isLive)
		   this.skinController.loadedProgress(pt);
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.LOAD_PROGRESS, {progress:e.progress});
	};
	//flash播放m3u8的相关事件
	PlayController.fn.hlsEventHandler=function(obj){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.FLASH_HLS_EVENTS,obj);
	};
	//flash通知改变皮肤状态
	PlayController.fn.skinStateChangeHandler=function(state){
		var skinCon=this.sewisePlayer.skinContainer;
		if(state=="show"){
			$(skinCon ).css("display","block");
		}else{
			$(skinCon ).css("display","none");
		}
	};
	//缓冲进度，flash才有这个事件
	PlayController.fn.bufferProgressHandler=function(e){
		this.skinController.bufferProgress(e.progress);
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.BUFFER_PROGRESS, {progress:e.progress});
	};
	PlayController.fn.loadedOpenHandler=function(e){
		if(this.playVars.url==="#") return;//只是初始化播放器
		this.skinController.loadedOpen();
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.LOAD_OPEN);
	};
	PlayController.fn.loadedCompleteHandler=function(e){
		this.isSeeking=false;
		this.skinController.loadedComplete();
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.LOAD_COMPLETE);
	};
	
	
	/****************************************实现核心API接口，通过SewisePlayer类暴露给外部使用**********************************************/
	
	PlayController.fn.live = function(){
		if(this.playerType == sewise.GlobalConstant.HTML5){
		   //目前只有通过pid访问的地址才能回到直播
		    this.isUpateProgramID=true;
		    this.fireEvent(sewise.SewisePlayerEvent.GET_LIVE_STREAMS);	
		}else{
			this.sewiseVideo.live();
		}
	};
	
	/**
	 * @description 播放视频 
	 */
	PlayController.fn.play = function(){
		if(this.playVars.url==="#") return;
		this.sewiseVideo.play();
	};
	PlayController.fn.pause = function(){
		if(this.playVars.url==="#") return;
		if(this.sewisePlayer.timeupdateOpen)
		 this.sewiseVideo.pause();
	};
	PlayController.fn.seek = function(time){
		if(this.playVars.url==="#") return;
		if(this.playVars.seek==="disable") return;
		if(this.isLive){
			if(!this.playVars.draggable){
			   //alert("时移已被禁用!");
			   return;
		    }
			var tdate=sewise.SkinUtils.stringer.timeStr14ToDate(time);//时间字符串转换为date
			time=tdate.getTime().toString();
			var shiftTime=time;
			if(tdate.getTime() > this.serverTime.getTime()){
				alert("时移请求时间超出了范围");
				return;
			}
			if(this.playerType == sewise.GlobalConstant.HTML5){
			    this.isUpateProgramID=true;
			    this.playVars.shiftTime = shiftTime;
			    if(this.playVars.programId)
			      this.fireEvent(sewise.SewisePlayerEvent.GET_SHIFT_STREAMS);
			}else{
				this.sewiseVideo.seek(time);
			}
		}else{
			this.sewiseVideo.seek(time);
		}
		//that.onSeek(time);
	};
	PlayController.fn.stop = function(){
		this.sewiseVideo.stop();
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PlAY_STOP);
	};
	//点播切换清晰度
	PlayController.fn.changeClarity = function(clarity){
		var videoUrl = clarity.videoUrl;
		var startTime = this.playTime() > 0 ? this.playTime() : 0;
		this.toPlay(videoUrl, this.playVars.title, startTime, true);
	};
	PlayController.fn.setVolume = function(volume){
		this.sewiseVideo.volume(volume);
		if(this.skinController)
		   this.skinController.volume(volume);
	};
	PlayController.fn.muted = function(bool){
		this.sewiseVideo.muted(bool);
		if(this.skinController)
		   this.skinController.muted(bool);
	};
	PlayController.fn.changeControlBarShowState = function(state){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.CONTROLBAR_SHOW_SATE,{isShow:state});
	};
	PlayController.fn.changeFullScreen = function(state){
		if(state)
		   this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.FULLSCREEN);
		else
		   this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.CANCEL_FULLSCREEN);
	};
	PlayController.fn.changeScreenBtnState= function(state){
		if(state)
		   this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.FULLSCREEN_BTN_CLICK);
		else
		   this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.NORMALSCREEN_BTN_CLICK);
	};
	/*
	 * 根据节目ID播放点播视频
	 */
	PlayController.fn.playProgram = function(programId, startTime, autostart,serverPath){
		this.playVars.programId = programId;
		this.playVars.startTime = startTime;
		this.playVars.autoStart = autostart;
		if(serverPath)
		  this.playVars.serverPath=serverPath;
		this.playVars.title = "";
		this.isUpateProgramID=true;
		
		this.fireEvent(sewise.SewisePlayerEvent.GET_VOD_STREAMS);
	};
	/*
	 * 根据节目ID播放直播视频
	 */
	PlayController.fn.playChannel = function(programId, shiftTime, autostart,serverPath){
		this.playVars.programId = programId;
		this.playVars.shiftTime = shiftTime;
		this.playVars.autoStart = autostart;
		if(serverPath)
		  this.playVars.serverPath=serverPath;
		this.playVars.title = "";
		this.isUpateProgramID=true;
		if(this.playerType == sewise.GlobalConstant.HTML5){
			if(this.playVars.shiftTime){
			   this.fireEvent(sewise.SewisePlayerEvent.GET_SHIFT_STREAMS);
		    }else{
			   this.fireEvent(sewise.SewisePlayerEvent.GET_LIVE_STREAMS);
		    }
		}else{
			this.sewiseVideo.playProgram(programId, shiftTime, autostart,serverPath);
		}
		
	};
	/*
	 * 更新多清晰度播放列表
	 */
	PlayController.fn.updateVideosjsonurl = function(jsonObj){
		var para=this.playVars;
		//this.globalParam.type=type;
		this.parseVodData(para,jsonObj);
		this.skinController.initialClarity(this.globalVars.clarities);	
		
		this.toPlay(para.videoUrl,para.title,0,para.autoStart);	
	};
	//点播方法
	PlayController.fn.toPlay = function(videoUrl, title, startTime, autostart){
		var params=this.playVars;
		params.videoUrl = videoUrl;
		params.title = title;
		params.startTime = startTime;
		params.autoStart = autostart;
		params.url=videoUrl;
		
		this.skinController.programTitle(params.title);
		if(this.playerType == sewise.GlobalConstant.HTML5){
			this.sewiseVideo.updatePlayer(params.videoUrl, params.buffer, params.startTime, params.poster, params.type,
								params.fallbackUrls, params.volume,params.hlsjs);
		   if(params.autoStart){
			   if(params.startTime > 0) this.sewiseVideo.seek(params.startTime);
			   else this.sewiseVideo.play();
		   }else{
		   	  this.sewiseVideo.autoplay(autostart);
		   	  this.skinController.paused();
		   }
		   this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.UPDATE_VIDEO_URL,{url:videoUrl});
		}else
		{
			this.sewiseVideo.toPlay(videoUrl, title, startTime, autostart);
		}
		
	};
	//点播方法
	PlayController.fn.toPlayComplexUrl = function(videoUrl, title, startTime, autostart,isEncode){
		if(isEncode)
		   videoUrl = encodeURIComponent(videoUrl);
		  
	    this.toPlay(videoUrl, title, startTime, autostart);			
	};
	//直播方法
	PlayController.fn.toLivePlay = function(streamUrl, title, shiftTime, autostart){
		var params=this.playVars;
		params.streamUrl = streamUrl;
		params.title = title;
		params.shiftTime = shiftTime;
		params.autoStart = autostart;
		params.url=streamUrl;
		
			
		this.skinController.programTitle(params.title);
		if(this.playerType == sewise.GlobalConstant.HTML5){
		  this.sewiseVideo.updatePlayer(params.streamUrl, params.buffer, params.shiftTime, params.poster, params.type,params.fallbackUrls, params.volume,params.hlsjs);
		  this.sewiseVideo.play();
		}else{
			this.sewiseVideo.toPlay(streamUrl, title, shiftTime, autostart);
		}
	};
	PlayController.fn.duration = function(){
		if(this.isLive)
		   return this.playVars.duration;
		else
		   return this.sewiseVideo.duration();
	};
	//直播开始播放的时间
	PlayController.fn.liveTime = function(offset){
		if(this.isHtml5){
		   if(offset&&this.timeZoneOffsetTime !== 0){
			   return new Date(this.serverTime.getTime() + this.timeZoneOffsetTime);
		   }else{
			   return this.serverTime;
		   }
		}else{
			return this.sewiseVideo.liveTime();
		}
	};
	PlayController.fn.playTime=function(offset){
		if(this.isLive)
		{
			if(this.isHtml5){
			   if(offset &&this.timeZoneOffsetTime !== 0){
				   return new Date(this.livePlayTime.getTime() + this.timeZoneOffsetTime);
			   }else{
				   return this.livePlayTime;
			   }
			}else{
				return this.sewiseVideo.currentTime();
			}
		}
		else   
		   return this.sewiseVideo.currentTime();
	};
		
//	PlayController.fn.bufferProgress = function(){
//		return this.sewiseVideo.bufferPt();
//	};
    
    //设置总时间
	PlayController.fn.setDuration = function(value){
		this.playVars.duration = value;
	    this.skinController.duration(this.playVars.duration);
	    if(!this.isHtml5)
	      this.sewiseVideo.setDuration(value);
	};
	//直播方法
	PlayController.fn.refreshTimeSpan = function(startTime, endTime, localTime, gmtTimes){
		if(startTime && endTime)
		   this.skinController.refreshTimes(startTime, endTime, localTime, gmtTimes);
		if(localTime){
		   this.timeZoneOffsetTime =new Date(localTime).getTime() - gmtTimes * 1000;
		}
		if(!this.isHtml5){
			this.sewiseVideo.refreshTimeSpan(startTime, endTime, localTime, gmtTimes);
		}
	};
	//点击了皮肤的共享视频按钮
	PlayController.fn.shareVideo=function(){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.SHARE_VIDEO);
	};
	//获取视频或者音频对象
	PlayController.fn.getMedia=function(){
		var mediaObj;
		if(this.isVideo)
		   mediaObj=this.sewiseVideo.videoObject;
		else
		   mediaObj=this.sewiseVideo.audioObject;
		if(this.isHtml5)
		   return mediaObj;
		else
		   return mediaObj.flashPlayer;
	};
	//设置播放速率
	PlayController.fn.setPlaybackRate = function(value){
		if(this.isHtml5&&this.sewiseVideo.videoObject.playbackRate)
		  this.sewiseVideo.videoObject.playbackRate=value;
	};
	//获取播放速率
	PlayController.fn.getPlaybackRate = function(){
		if(this.isHtml5)
		   return this.sewiseVideo.videoObject.playbackRate;
		else
		   return 1;
	};
	//清除视频或者音频
	PlayController.fn.clearMedia= function(){
		this.stop();
		if(this.isHtml5){
		   if(this.sewiseVideo.videoObject)
		     this.sewiseVideo.videoObject.src="";
		   else
		     this.sewiseVideo.audioObject.src="";
		}
		this.skinController.stopped();
		this.playVars.url="#";
		this.skinController.setPlayTimeOffset(0,0);
		this.skinController.reset();
		this.skinController.duration(0);
		this.skinController.timeUpdate(0);
		this.skinController.loadedProgress(0);
		this.skinController.title("");
	};
	//锁定屏幕
	PlayController.fn.lockScreen = function(boo){
		this.isLockScreen=boo;
	};
	//销毁播放器
	PlayController.fn.dispose = function(){
		clearInterval(this.intervalID);
		this.sewiseVideo.clearAllRegisterEvents();
		this.clearMedia();
	};
    //播放下一个视频
	PlayController.fn.nextVideo = function(){
		this.sewisePlayer.fireEvent(sewise.SewisePlayerEvent.PLAY_NEXT);
	};
})(window.Sewise,window.jQuery);


(function(sewise,$){
	/*
	 * sewiseplayer播放器 video核心类，控制html5 video和FlashVideo逻辑
	 * Author:keyun
	 * Date:2015/9/25
	 */
	var SewiseVideo=sewise.SewiseVideo=function(playerType,isLive,playerID){
		//video实例对象
		this.videoObject=null;
		this.playerType=playerType;
		//播放参数
		this.playVars=null;
		this.isLive=isLive;
		this.isHtml5=true;
		this.isCanPlay = false;
		this.startTime = 0;
		this.loadPt = 0;
		this.videoContainer=null;
		this.playerID=playerID;
		this.mediaType=sewise.GlobalConstant.VIDEO;
		//是否使用hlsjs插件
		this.hlsjs=null;
		this.isLoading=false;
	};
	SewiseVideo.fn=SewiseVideo.prototype;
	$.extend(SewiseVideo.prototype,sewise.Event);
	
	SewiseVideo.prototype.init=function(playVars,container){
		this.playVars=playVars;
		this.videoContainer=container;
		var that=this;
		if(this.playerType == sewise.GlobalConstant.HTML5)
		{
			this.isHtml5=true;
			this.isCanPlay=false;
			/*********************************************************************
		     * 由于不同平台的webkit对video的实现不一样，ios设备下内部创建的video
		     * 对象会在父级元素移除时被回收掉，而部分android设备在父级元素移除时
		     * 无法收回内部创建的video对象。这里将非ios设备下创建的video对象挂在
		     * 全局对象Sewise下，用来防止video对象被多次创建。
		    ********************************************************************/
		   if(sewise.video && !sewise.Utils.browser.versions.ios&&sewise.Utils.browser.versions.mobile){
			 this.videoObject = sewise.video;
			 this.videoObject.pause();
		   }else{
			 this.videoObject = document.createElement("video");
			 if(this.playVars.playsinline)
			    this.videoObject.setAttribute("webkit-playsinline",true);
			 sewise.video = this.videoObject;
		   }
		   this.videoObject.autoplay = false;
		   this.videoObject.controls = true;
		   this.videoObject.loop = false;
		   container.append(this.videoObject);
		   /** 
		   * canplay事件
		   * 1、Chrome：视频初次播放时触发，但必须将autoplay属性设置为true。
		   * 2、Firefox：视频初次播放或seek时触发。
		   * 3、IE9：视频初次播放时触发。
		   */
		   //this.videoObject.addEventListener("canplay", $.proxy(this.canplayHandler,this), false); 
		   this.videoObject.addEventListener("canplay", canplayHandler, false);
		}
		else
		{
			this.isHtml5=false;
		    this.videoObject=new sewise.FlashVideo(this.isLive,this.playerID,this.mediaType); 
		}
		function canplayHandler(e){
			that.loadedCompleteHandler();
			that.videoObject.removeEventListener("canplay", canplayHandler, false);
			that.isCanPlay = true;
			/**
			 * 当startTime>0时才设置currentTime的值，
			 * 这样可以防止IE9在currentTime设置为0时，无法播放。
			 */
			if(that.startTime > 0){
				if(that.isHtml5)
				   that.videoObject.currentTime = that.startTime;
				else
				   that.videoObject.setCurrentTime(that.startTime);
			} 
	     }
		//播放事件
		   this.videoObject.addEventListener("emptied", $.proxy(this.emptiedOpenHandler,this), false);
		   this.videoObject.addEventListener("waiting", $.proxy(this.waitingOpenHandler,this), false);
		   this.videoObject.addEventListener("seeking", $.proxy(this.seekingHandler,this), false);
		   this.videoObject.addEventListener("seeked", $.proxy(this.seekedHandler,this), false);
		   this.videoObject.addEventListener("play", $.proxy(this.playStartHandler,this), false);
		   this.videoObject.addEventListener("playing", $.proxy(this.playingHandler,this), false);
		   this.videoObject.addEventListener("pause", $.proxy(this.playPauseHandler,this), false);
		   this.videoObject.addEventListener("ended", $.proxy(this.playEndedHandler,this), false);
		   this.videoObject.addEventListener("durationchange", $.proxy(this.durationChangeHandler,this), false);
		   this.videoObject.addEventListener("timeupdate", $.proxy(this.timeupdateHandler,this), false);
		   this.videoObject.addEventListener("progress", $.proxy(this.loadProgressHandler,this), false);
		   this.videoObject.addEventListener("bufferprogress", $.proxy(this.bufferProgressHandler,this), false);
		   this.videoObject.addEventListener("loadedmetadata",$.proxy(this.metadataHandler,this), false);
		   this.videoObject.addEventListener("beforePlay",$.proxy(this.beforePlayHandler,this), false);
		   this.videoObject.addEventListener("hlsEvents",$.proxy(this.hlsEventHandler,this), false);
		   this.videoObject.addEventListener("skinStateChange",$.proxy(this.skinShowStateHandler,this), false);
	};
	SewiseVideo.prototype.readyPlay=function(){
		if(this.isHtml5){
			this.fireEvent("sewiseMediaReady");
		}else{
			var that=this;
			this.videoObject.on("flash_playerReady",function(){
				that.isCanPlay=true;
		    	that.fireEvent("sewiseMediaReady");
		    });
		    //渲染flash播放器，加载到指定容器
		    this.videoObject.renderTo(this.playVars,this.videoContainer);
		}
	};
	//更新播放器数据
	SewiseVideo.prototype.updatePlayer= function(url, buffer, time, poster, type, fallbackUrls, defVolume,hlsjs){
		  var mimeTypes = {
			mp4: "video/mp4",
			ogg: "video/ogg",
			webm: "video/webm",
			m3u8: "application/x-mpegURL"
		  };
			//视频地址更新时要重新设置isCanPlay为false，并添加canplay事件否则startTime将无效。
			this.isCanPlay = false;
			this.hlsjs=hlsjs;
			var that=this;
			var video=this.videoObject;
			//video.addEventListener("canplay", $.proxy(this.canplayHandler,this), false);
			video.addEventListener("canplay", canplayHandler, false);
			///////////////////////////////
			this.startTime = time;
			if(poster) video.poster = poster;
			video.volume = defVolume;
			
			if(fallbackUrls){
				if (video.canPlayType){
					if ("" !== video.canPlayType(mimeTypes[type])){
					    video.src = url;
		            }else{
		            	for(var key in fallbackUrls){
		            		if ("" !== video.canPlayType(mimeTypes[key])){
		            			video.src = fallbackUrls[key];
		            			break;
		            		}
		            	}
		            }
		        }
			}else{
				if(hlsjs){//如果浏览器播放m3u8,用SewiseHlsJs插件单独处理
					
				}else{
					video.src = url;
				}
			}
			
		  function canplayHandler(e){
			
			that.videoObject.removeEventListener("canplay", canplayHandler, false);
			that.isCanPlay = true;
			if(that.startTime >= 0){//更新播放地址,0值也要设置
				if(that.isHtml5)
				   that.videoObject.currentTime = that.startTime;
				else
				   that.videoObject.setCurrentTime(that.startTime);
			} 
	     }
	};
	
	SewiseVideo.fn.play = function(){
		this.fireEvent(sewise.SewisePlayerEvent.BEFORE_PLAY);
		this.videoObject.autoplay = true;
		if(this.videoObject.play)
		  this.videoObject.play();
	};
	SewiseVideo.fn.pause = function(){
		if(this.hlsjs&&this.isLoading) return;
		this.videoObject.pause();
	};
	SewiseVideo.fn.seek = function(time){
		if(this.isCanPlay)
		{ 
			if(this.isHtml5)
			   this.videoObject.currentTime = time;
			else
			   this.videoObject.setCurrentTime(time);
		}else{
			this.videoObject.autoplay = true;
			if(this.videoObject.play)
			  this.videoObject.play();
		}
	};
    SewiseVideo.fn.stop = function(){
    	if(this.isHtml5){
    	    if(this.videoObject.currentTime) this.videoObject.currentTime = 0;
		    this.videoObject.pause();	
    	}else{
    		this.videoObject.stop();
    	}
		
	};
	SewiseVideo.fn.duration = function(){
		if(this.isHtml5){
			if(this.isLive)
			   return this.playVars.duration;
			else
		       return this.videoObject.duration;
		}
		else
		   return this.videoObject.getDuration();
	};
	SewiseVideo.fn.currentTime = function(){
		if(this.isHtml5)
		   return this.videoObject.currentTime;
		else
		   return this.videoObject.getCurrentTime();
	};
	SewiseVideo.fn.muted = function(bool){
		if(this.videoObject){
			if(this.isHtml5)
			  this.videoObject.muted = bool;
			else
			  this.videoObject.muted(bool);
		} 
	};
	SewiseVideo.fn.controls = function(bool){
		this.videoObject.controls = bool;
	};
	SewiseVideo.fn.volume = function(value){
		if(this.isHtml5)
		   this.videoObject.volume = value;
		else
		   this.videoObject.setVolume(value);
	};
	SewiseVideo.fn.autoplay= function(bool){
		this.videoObject.autoplay = bool;
	};
	SewiseVideo.fn.bufferPt = function(){
		return this.loadPt;
	};
	//调用flash直播方法
	SewiseVideo.fn.live=function(){
		this.videoObject.live();
	};
	//调用flash方法
	SewiseVideo.fn.liveTime=function(){
		return this.videoObject.liveTime();
	};
	//调用flash方法
	SewiseVideo.fn.toPlay = function(url, title, startTime, autostart){
		this.videoObject.toPlay(url, title, startTime, autostart);
	};
	//调用flash方法
	SewiseVideo.fn.playProgram = function(programId, startTime, autostart,serverPath){
		if(this.isLive)
		   this.videoObject.playChannel(programId, startTime, autostart,serverPath);
		//else
		  // this.videoObject.playProgram(programId, startTime, autostart);
	};
	//调用flash方法,视频截图
	SewiseVideo.fn.screenshot=function(){
		//this.videoObject.screenshot();
	};
	//调用flash直播方法
	SewiseVideo.fn.setDuration = function(value){
		this.videoObject.setDuration(value);
	};
	//调用flash直播方法
	SewiseVideo.fn.refreshTimeSpan=function(startTime, endTime, localTime, gmtTimes){
		this.videoObject.refreshTimeSpan(startTime, endTime, localTime, gmtTimes);
	};
	
	//-------------视频播放相关事件处理函数--------------------------------------------
	SewiseVideo.fn.loadedCompleteHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_COMPLETE);
	};
	SewiseVideo.fn.loadedOpenHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_OPEN);
	};
	SewiseVideo.fn.emptiedOpenHandler=function(e){
		//console.log("emptied--");
		//this.loadedOpenHandler();
	};
	SewiseVideo.fn.waitingOpenHandler=function(e){
		//console.log("waiting");
		this.isLoading=true;
		this.loadedOpenHandler();
	};
	SewiseVideo.fn.playStartHandler=function(e){
		//console.log("play");
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_START);
	};
	SewiseVideo.fn.playingHandler=function(e){
		//console.log("playing");
		this.isLoading=false;
		this.fireEvent(sewise.SewisePlayerEvent.PLAYING);
	};
	SewiseVideo.fn.playPauseHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_PAUSE);
	};
	SewiseVideo.fn.playEndedHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_ENDED);
	};
	SewiseVideo.fn.durationChangeHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.DURATION_CHANGE);
	};
	SewiseVideo.fn.timeupdateHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.TIME_UPDATE);
	};
	SewiseVideo.fn.loadProgressHandler=function(e){
		if(this.isHtml5){
			if(this.videoObject.buffered && this.videoObject.duration > 0){
			   try{
				   this.loadPt = this.videoObject.buffered.end(0) / this.videoObject.duration;
			   }catch(event){
				   this.loadPt = 0;
			   }		
			   //console.log("start[0]: " + video.buffered.start(0));
			   //console.log("end[0]: " + video.buffered.end(0));
		    }
		}else{
		   this.loadPt=parseFloat(e);
		}
		
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_PROGRESS, {progress: this.loadPt});
	};
	SewiseVideo.fn.seekingHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_OPEN);
		this.fireEvent(sewise.SewisePlayerEvent.SEEK,e);
	};
	SewiseVideo.fn.seekedHandler=function(e){
		//console.log("seeked-----");
		this.loadedCompleteHandler();
		this.fireEvent(sewise.SewisePlayerEvent.SEEKED,e);
	};
	SewiseVideo.fn.metadataHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.METADATA,e);
	};
	//flash的事件
	SewiseVideo.fn.beforePlayHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.BEFORE_PLAY);
	};
	//flash的事件
	SewiseVideo.fn.hlsEventHandler=function(obj){
		this.fireEvent(sewise.SewisePlayerEvent.FLASH_HLS_EVENTS,obj);
	};
	//flash的事件
	SewiseVideo.fn.skinShowStateHandler=function(obj){
		this.fireEvent(sewise.SewisePlayerEvent.SKIN_SHOWSTATE_CHANGE,obj);
	};
	
	//缓冲进度，目前flash才有这个事件
	SewiseVideo.fn.bufferProgressHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.BUFFER_PROGRESS, {progress:e});
	};
	//--------------------------------------------------------------------------
})(window.Sewise,window.jQuery);


(function(sewise,$){
	/*
	 * sewiseplayer播放器 audio核心类，控制html5 audio和FlashAudio逻辑
	 * Author:keyun
	 * Date:2016/3/14
	 */
	var SewiseAudio=sewise.SewiseAudio=function(playerType,playerID){
		//audio实例对象
		this.audioObject=null;
		this.playerType=playerType;
		//播放参数
		this.playVars=null;
		this.isHtml5=true;
		this.isCanPlay = false;
		this.audioContainer=null;
		this.startTime = 0;
		this.loadPt = 0;
		this.playerID=playerID;
		this.mediaType=sewise.GlobalConstant.AUDIO;
	};
	SewiseAudio.fn=SewiseAudio.prototype;
	$.extend(SewiseAudio.prototype,sewise.Event);
	
	SewiseAudio.fn.init=function(playVars,container){
		this.playVars=playVars;
		this.audioContainer=container;
		var that=this;
		if(this.playerType == sewise.GlobalConstant.HTML5)
		{
			this.isHtml5=true;
			this.isCanPlay=false;
			this.audioObject = document.createElement("audio");
		    this.audioObject.autoplay = false;
		    this.audioObject.controls = true;
		    this.audioObject.loop = false;
		    container.append(this.audioObject);
		    this.audioObject.addEventListener("canplay", canplayHandler, false);
		}
		else
		{
			this.isHtml5=false;
		    this.audioObject=new sewise.FlashVideo(this.isLive,this.playerID,this.mediaType); 
		}
		function canplayHandler(e){
			//that.loadedCompleteHandler();
			that.audioObject.removeEventListener("canplay", canplayHandler, false);
			that.isCanPlay = true;
			/**
			 * 当startTime>0时才设置currentTime的值，
			 * 这样可以防止IE9在currentTime设置为0时，无法播放。
			 */
			if(that.startTime > 0){
				if(that.isHtml5)
				   that.audioObject.currentTime = that.startTime;
				else
				   that.audioObject.setCurrentTime(that.startTime);
			} 
	     }
		//播放事件
		   this.audioObject.addEventListener("emptied", $.proxy(this.emptiedOpenHandler,this), false);
		   this.audioObject.addEventListener("waiting", $.proxy(this.waitingOpenHandler,this), false);
		   this.audioObject.addEventListener("seeking", $.proxy(this.seekingHandler,this), false);
		   this.audioObject.addEventListener("seeked", $.proxy(this.seekedHandler,this), false);
		   this.audioObject.addEventListener("play", $.proxy(this.playStartHandler,this), false);
		   this.audioObject.addEventListener("playing", $.proxy(this.playStartHandler,this), false);
		   this.audioObject.addEventListener("pause", $.proxy(this.playPauseHandler,this), false);
		   this.audioObject.addEventListener("ended", $.proxy(this.playEndedHandler,this), false);
		   this.audioObject.addEventListener("durationchange", $.proxy(this.durationChangeHandler,this), false);
		   this.audioObject.addEventListener("timeupdate", $.proxy(this.timeupdateHandler,this), false);
		   this.audioObject.addEventListener("loadedmetadata",$.proxy(this.metadataHandler,this), false);
    };
    SewiseAudio.fn.readyPlay=function(){
		if(this.isHtml5){
			this.fireEvent("sewiseMediaReady");
		}else{
			var that=this;
			this.audioObject.on("flash_playerReady",function(){
				that.isCanPlay=true;
		    	that.fireEvent("sewiseMediaReady");
		    });
		    //渲染flash播放器，加载到指定容器
		    this.audioObject.renderTo(this.playVars,this.audioContainer);
		}
	};
	//更新播放器数据
	SewiseAudio.fn.updatePlayer= function(url, buffer, time, poster, type, fallbackUrls, defVolume,hlsjs){
		  var mimeTypes = {
			mp3: "audio/mpeg",
			ogg: "audio/ogg",
			mp4: "audio/mp4",
		  };
			this.isCanPlay = false;
			var that=this;
			var taudio=this.audioObject;
			
			taudio.addEventListener("canplay", canplayHandler, false);
			///////////////////////////////
			this.startTime = time;
			
			taudio.volume = defVolume;
			
			if(fallbackUrls){
				if (taudio.canPlayType){
					if ("" !== taudio.canPlayType(mimeTypes[type])){
					    taudio.src = url;
		            }else{
		            	for(var key in fallbackUrls){
		            		if ("" !== taudio.canPlayType(mimeTypes[key])){
		            			taudio.src = fallbackUrls[key];
		            			break;
		            		}
		            	}
		            }
		        }
			}else{
			   taudio.src = url;	
			}
			
		  function canplayHandler(e){
			
			that.audioObject.removeEventListener("canplay", canplayHandler, false);
			that.isCanPlay = true;
			if(that.startTime >= 0){
				if(that.isHtml5)
				   that.audioObject.currentTime = that.startTime;
				else
				   that.audioObject.setCurrentTime(that.startTime);
			} 
	     }
	};
	SewiseAudio.fn.play = function(){
		this.fireEvent(sewise.SewisePlayerEvent.BEFORE_PLAY);
		this.audioObject.autoplay = true;
		if(this.audioObject.play)
		  this.audioObject.play();
	};
	SewiseAudio.fn.pause = function(){
		this.audioObject.pause();
	};
	SewiseAudio.fn.seek = function(time){
		if(this.isCanPlay)
		{ 
			if(this.isHtml5)
			   this.audioObject.currentTime = time;
			else
			   this.audioObject.setCurrentTime(time);
		}else{
			this.audioObject.autoplay = true;
			if(this.audioObject.play)
			  this.audioObject.play();
		}
	};
    SewiseAudio.fn.stop = function(){
    	if(this.isHtml5){
    	    if(this.audioObject.currentTime) this.audioObject.currentTime = 0;
		    this.audioObject.pause();	
    	}else{
    		this.audioObject.pause();
    	}
		
	};
	SewiseAudio.fn.duration = function(){
		if(this.isHtml5){
		    return this.audioObject.duration;
		}
		else
		   return this.audioObject.getDuration();
	};
	SewiseAudio.fn.currentTime = function(){
		if(this.isHtml5)
		   return this.audioObject.currentTime;
		else
		   return this.audioObject.getCurrentTime();
	};
	SewiseAudio.fn.muted = function(bool){
		if(this.audioObject){
			if(this.isHtml5)
			  this.audioObject.muted = bool;
			else
			  this.audioObject.muted(bool);
		} 
	};
	SewiseAudio.fn.controls = function(bool){
		this.audioObject.controls = bool;
	};
	SewiseAudio.fn.volume = function(value){
		if(this.isHtml5)
		   this.audioObject.volume = value;
		else
		   this.audioObject.setVolume(value);
	};
	SewiseAudio.fn.autoplay= function(bool){
		this.audioObject.autoplay = bool;
	};
	//调用flash方法
	SewiseAudio.fn.toPlay = function(url, title, startTime, autostart){
		this.audioObject.toPlay(url, title, startTime, autostart);
	};
    //-------------音频播放相关事件处理函数--------------------------------------------
	SewiseAudio.fn.loadedCompleteHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_COMPLETE);
	};
	SewiseAudio.fn.loadedOpenHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_OPEN);
	};
	SewiseAudio.fn.emptiedOpenHandler=function(e){
		//console.log("emptied--");
		//this.loadedOpenHandler();
	};
	SewiseAudio.fn.waitingOpenHandler=function(e){
		//console.log("waiting");
		this.loadedOpenHandler();
	};
	SewiseAudio.fn.playStartHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_START);
	};
	SewiseAudio.fn.playPauseHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_PAUSE);
	};
	SewiseAudio.fn.playEndedHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.PLAY_ENDED);
	};
	SewiseAudio.fn.durationChangeHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.DURATION_CHANGE);
	};
	SewiseAudio.fn.timeupdateHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.TIME_UPDATE);
	};
	SewiseAudio.fn.loadProgressHandler=function(e){
		if(this.isHtml5){
			if(this.audioObject.buffered && this.audioObject.duration > 0){
			   try{
				   this.loadPt = this.audioObject.buffered.end(0) / this.audioObject.duration;
			   }catch(event){
				   this.loadPt = 0;
			   }		
			   //console.log("start[0]: " + video.buffered.start(0));
			   //console.log("end[0]: " + video.buffered.end(0));
		    }
		}else{
		   this.loadPt=parseFloat(e);
		}
		
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_PROGRESS, {progress: this.loadPt});
	};
	SewiseAudio.fn.seekingHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.LOAD_OPEN);
		this.fireEvent(sewise.SewisePlayerEvent.SEEK,e);
	};
	SewiseAudio.fn.seekedHandler=function(e){
		//console.log("seeked-----");
		this.loadedCompleteHandler();
	};
	SewiseAudio.fn.metadataHandler=function(e){
		this.fireEvent(sewise.SewisePlayerEvent.METADATA,e);
	};
})(window.Sewise,window.jQuery);


(function(sewise){
    /*
     * Description:全局参数类 
     * Author: keyun
     */
	var GlobalParams = sewise.GlobalParams = function(config){
		var that = this;
		/**
		 * server判断服务器是点播还是直播的参数，不可省略。
		 * 可设置值为：vod、live。
		 */
		this.server = "";
		
		/**
		 * type判断点播视频格式的参数，直播状态下根据平台手动设置该值。
		 * 可设置值为：点播flv、mp4、m3u8,  直播rtmp。
		 */
		this.type = "";

		/**
		 * swfPath用于flash跨域时加载的swf路径。
		 */
		this.swfPath = "";

		/**
		 * primary用于设置优先播放的模块，值为html5或flash。
		 */
		this.primary = "html5";
		
		/**
		 * isMobile判断是否为移动平台。
		 */
		this.isMobile=false;

		/**
		 * supportH5判断平台是否支持HTML5。
		 */
		this.supportH5=true;

		/**
		 * supportFlash判断平台是否支持FLASH。
		 */
		this.supportFlash=false;
		
		/**
		 * 判断浏览器是否支持hls插件
		 */
		this.supportHls=false;

		/**
		 * prothost带端口的host地址。
		 */
		this.porthost=null;

		/**
		 * playerType所启用播放器的类别，HTML5或FLASH。
		 */
		this.playerType = "";
        
        //外部传入的参数对象
        this.parameObj=config;
        //节目ID
        this.programId="";
        
        //是否用浏览器播放m3u8文件
        this.hlsjs=false;
        
        //根据节目ID请求数据时的参数
        this.protocal="hls";
        
        //是否是safari终端
        this.safari=false;
		/**
		 * mediaType媒体文件的类型音频audio或视频video。
		 */
		this.mediaType = sewise.GlobalConstant.VIDEO;
		//全屏时，是否计算播放器容器的top偏移值
		this.calculateOffTop=true;
	};
	GlobalParams.prototype.init=function(){ 
		if(this.parameObj.hlsjs=="true")
		   this.hlsjs=true;
		else if(this.parameObj=="false")
		   this.hlsjs=false;
		else
		   this.hlsjs=this.parameObj.hlsjs;
		   
		var tmpUrl=this.parameObj.url;
		if(!tmpUrl){
			this.server="vod";
			this.type=this.parameObj.type;
		}else if(tmpUrl==="#"){
			if(this.parameObj.server)
			   this.server=this.parameObj.server;
			else
			   this.server="vod";
			if(this.parameObj.type)
			   this.type=this.parameObj.type;
			else
			   this.type="mp4";
		}
		else{
		   var urlObj=sewise.Utils.parseURL(tmpUrl);
		   if(urlObj.protocol=="vod:")
		   {
			   this.server="vod";
			   this.programId=urlObj.segments[1];
			   this.porthost=urlObj.host;
			   if(urlObj.port)
			      this.porthost+=":"+urlObj.port;
			   this.type="m3u8";
		   }
		   else if(urlObj.protocol=="live:"){
			   this.server="live";
			   this.programId=urlObj.segments[1];
			   if(urlObj.segments[2])
			      this.protocal=urlObj.segments[2];
			   this.porthost=urlObj.host;
			   if(urlObj.port)
			      this.porthost+=":"+urlObj.port;
			   if(this.protocal=="rtmp")
			      this.type="rtmp";
			   else
			      this.type="m3u8";
		   }
		   else
		   {
		      var str=tmpUrl.substr(tmpUrl.length-4,4);
		      if(urlObj.protocol=="rtmp:"){
		   	     this.server="live";
		   	     this.type="rtmp";
		   	     this.parameObj.streamurl=tmpUrl;
		      }else if(str.indexOf("mp4")>=0){
		   	     this.server="vod";
		   	     this.type="mp4";
		   	     this.parameObj.videourl=tmpUrl;
		      }
		      else if(str.indexOf("flv")>=0){
		   	     this.server="vod";
		   	     this.type="flv";
		   	     this.parameObj.videourl=tmpUrl;
		      }else if(str.indexOf("m3u8")>=0){
		   	     if(this.parameObj.server&&this.parameObj.server=="live"){
		   	         this.server ="live";
		   	         this.parameObj.streamurl=tmpUrl;
		   	     }
		   	     else{
		   	        this.server="vod";//默认点播
		   	        this.parameObj.videourl=tmpUrl;
		   	     }
		   	     this.type="m3u8"; 
		      }else
		      {
		   	      this.type=this.parameObj.type;
		   	      if(this.parameObj.server&&this.parameObj.server=="live"){
		   	         this.server ="live";
		   	         this.parameObj.streamurl=tmpUrl;
		   	      }
		   	      else{
		   	        this.server="vod";//默认点播
		   	        this.parameObj.videourl=tmpUrl;
		   	      }
		      }
		   }
		}
		if(this.parameObj.swfpath) this.swfPath = this.parameObj.swfpath;
		if(this.parameObj.primary) this.primary = this.parameObj.primary;
        if(this.parameObj.calculateOffTop=="false")
           this.calculateOffTop=false;
        else
          this.calculateOffTop=this.parameObj.calculateOffTop;
        
        if(this.server=="vod"&&!this.parameObj.skin)//设置默认皮肤
           this.parameObj.skin="vodWhite";
        else if(this.server=="live"&&!this.parameObj.skin)
           this.parameObj.skin="liveWhite";
		this.isMobile = sewise.Utils.browser.versions.mobile;
		this.supportH5 = sewise.Utils.browser.supportH5;
		this.supportFlash = sewise.Utils.browser.supportFlash;
        this.supportHls=sewise.Utils.browser.supportHls;
		this.safari=sewise.Utils.browser.versions.safari;
		
		this.playerType=this.getPlayerType();
		
		//测试地址，写死
		Sewise.localPath="http://192.168.1.114/sewiseplayer_js_3.0.0/bin/";
	};
	
	GlobalParams.prototype.getPlayerId = function(){
			//var playerId = parameObj.playerid ? parameObj.playerid : "sewise_player";
			//return playerId;
	};
	GlobalParams.prototype.getServerType = function(){
			return this.server;
	};
	GlobalParams.prototype.getSwfPath = function(){
			return this.swfPath;
	};
	GlobalParams.prototype.getMediaType = function(){
			return this.mediaType;
	};
	GlobalParams.prototype.getPlayerType = function(){
			if(this.parameObj.playerType){
				this.playerType = this.parameObj.playerType;
				return this.parameObj.playerType;
			}
			if(this.server == sewise.GlobalConstant.VOD){
				switch(this.type){
					case sewise.GlobalConstant.FLV:
						if(this.supportFlash){
							this.playerType = sewise.GlobalConstant.FLASH;
						}else{
							this.playerType = sewise.GlobalConstant.HTML5;
						}
						break;
					case sewise.GlobalConstant.MP4:
						if(this.supportH5 && this.primary !== "flash" || !this.supportFlash){
							this.playerType = sewise.GlobalConstant.HTML5;
						}else{
							this.playerType = sewise.GlobalConstant.FLASH;
						}
						break;
					case sewise.GlobalConstant.M3U8:
					    //this.isMobile=true;//测试
					   //var ua=navigator.userAgent.toLowerCase();
					   //var s=ua.match(/version\/([\d.]+).*safari/);
						if(this.supportH5 && this.isMobile && this.primary !== "flash" || !this.supportFlash){
							this.playerType = sewise.GlobalConstant.HTML5;
						}else{
							if(this.supportHls&&this.hlsjs)
							   this.playerType=sewise.GlobalConstant.HTML5;
							else if(this.supportH5&&this.safari&&this.primary !== "flash")
							   this.playerType=sewise.GlobalConstant.HTML5;
							else
							   this.playerType = sewise.GlobalConstant.FLASH;
						}
						break;
					
					//音频类类型文件
					case sewise.GlobalConstant.MP3:
					case sewise.GlobalConstant.OGG:
						if(this.supportFlash && this.primary !== "html5" || !this.supportH5){
							this.playerType = sewise.GlobalConstant.FLASH;
						}else{
							this.playerType = sewise.GlobalConstant.HTML5;
						}
						this.mediaType = sewise.GlobalConstant.AUDIO;
						break;
					default:
						
				}
			}else if(this.server == sewise.GlobalConstant.LIVE){
				switch(this.type){
					case sewise.GlobalConstant.RTMP:
						if(this.supportFlash){
							this.playerType = sewise.GlobalConstant.FLASH;
						}else{
							this.playerType = sewise.GlobalConstant.HTML5;
						}
						break;
					case sewise.GlobalConstant.HTTP:
						if(this.supportFlash){
							this.playerType = sewise.GlobalConstant.FLASH;
						}else{
							this.playerType = sewise.GlobalConstant.HTML5;
						}
						break;
					case sewise.GlobalConstant.M3U8:
						if(this.supportH5 && this.isMobile && this.primary !== "flash" || !this.supportFlash){
							this.playerType = sewise.GlobalConstant.HTML5;
						}else{
							if(this.supportHls&&this.hlsjs)
							   this.playerType=sewise.GlobalConstant.HTML5;
							else if(this.supportH5&&this.safari&&this.primary !== "flash")
							   this.playerType=sewise.GlobalConstant.HTML5;
							else
							   this.playerType = sewise.GlobalConstant.FLASH;
						}
						break;
					//音频类类型文件
					case sewise.GlobalConstant.MP3:
						if(this.supportFlash && this.primary !== "html5" || !this.supportH5){
							this.playerType = sewise.GlobalConstant.FLASH;
						}else{
							this.playerType = sewise.GlobalConstant.HTML5;
						}
						this.mediaType = sewise.GlobalConstant.AUDIO;
						break;
					default:
					
				}
			}
			//alert(this.playerType);
			return this.playerType;
	};
	//获得播放器播放的参数
	GlobalParams.prototype.getPlayVars = function()
	{
		    var playVars;
			var $autoStart;
			var $programId;
			var $lang;
			var $logo;
			var $buffer;
			var $type;
			var $skin;
			var $skinClass;
			var $title;
			var $draggable;
			var $published;
			var $poster;
			var $playerName;
			var $copyright;
			var $playerVersion;
			var $buildDate;
			var $volume;
			var $key;
			var $videosJsonUrl;
			var $videoUrl;
			var $startTime;
			var $streamUrl;
			var $shiftTime;
			var $duration;
			var $serverPath;
			var $clarityBtnDisplay;
			var $timeDisplay;
			var $controlBarDisplay;
			var $topBarDisplay;
			var $bigPlayBtnDisplay;
			var $playsinline;
			var $fallbackUrls;
			var $customDatas;
			var $serverApi;//flash专有
			var $swfPath;//flash专有
			var parameObj=this.parameObj;
			
			var skinObj;
			$skin = parameObj.skin;
			$skinClass=parameObj.skin;
			if($skin){
				/* 将皮肤用到的相关文件路径保存到skinObj对象，
				* skinCssPath为CSS文件地址， skinHtmlPath为dom文件地址， skinHtmlJsPath为dom兼容跨域本地js文件地址。*/
				skinObj = {};
				skinObj.skinCssPath = sewise.localPath + "html/skins/" + $skin + "/skin.css";
				skinObj.skinHtmlPath = sewise.localPath + "html/skins/" + $skin + "/skin.html";
				skinObj.skinHtmlJsPath = sewise.localPath + "html/skins/" + $skin + "/skin.html.js";
				$skin = skinObj;
			}else{
				$skin = "";
			}
			$lang = parameObj.lang ? parameObj.lang : "en_US";
			$logo = parameObj.logo ? parameObj.logo : "http://player.sewise.com/playerimages/logo.png";
			$type = this.type;
			$volume = parameObj.volume ? parameObj.volume : 0.8;
			$key = parameObj.key ? parameObj.key : "";
			$published = parameObj.published ? parameObj.published : 0;
			$poster = parameObj.poster ? parameObj.poster : "";
			$title = parameObj.title ? parameObj.title : "";
			$clarityBtnDisplay = parameObj.claritybtndisplay ? parameObj.claritybtndisplay : "enable";
			$timeDisplay = parameObj.timedisplay ? parameObj.timedisplay : "enable";
			$controlBarDisplay = parameObj.controlbardisplay ? parameObj.controlbardisplay : "enable";
			$topBarDisplay = parameObj.topbardisplay ? parameObj.topbardisplay : "enable";
			$bigPlayBtnDisplay=parameObj.bigplaybtndisplay?parameObj.bigplaybtndisplay:"enable";
			$draggable = parameObj.draggable ? parameObj.draggable : "true";
			$programId = this.programId?this.programId: "";
			//定制的参数。
			if(typeof(parameObj.customdatas) == "string"){
				$customDatas = parameObj.customdatas ? JSON.parse(decodeURIComponent(parameObj.customdatas)) : "";
			}else{
				$customDatas = parameObj.customdatas ? parameObj.customdatas : "";
			}
			if(parameObj.playsinline=="true")
			   $playsinline=true;
			else if(parameObj.playsinline=="false")
			   $playsinline=false;
			else
			   $playsinline=parameObj.playsinline;
			if(parameObj.autostart=="false")
			   parameObj.autostart=false;
			else if(parameObj.autostart=="true")
			   parameObj.autostart=true;
			
			if(this.server == sewise.GlobalConstant.VOD){
				$autoStart = parameObj.autostart ? parameObj.autostart : false;
				$buffer = parameObj.buffer ? parameObj.buffer : 2;
				$startTime = parameObj.starttime ? parameObj.starttime : 0;
			
				if(this.playerType == sewise.GlobalConstant.HTML5){
					$serverPath = "http://" + this.porthost + "/api/player/";
					//多码率json地址。
				    if(typeof(parameObj.videosjsonurl) == "string"){
					   $videosJsonUrl = parameObj.videosjsonurl ? JSON.parse(decodeURIComponent(parameObj.videosjsonurl)) : "";
				    }else{
					   $videosJsonUrl = parameObj.videosjsonurl ? parameObj.videosjsonurl : "";
				    }
				    //兼容视频地址
				    if(typeof(parameObj.fallbackurls) == "string"){
						$fallbackUrls = parameObj.fallbackurls ? JSON.parse(decodeURIComponent(parameObj.fallbackurls)) : "";
					}else{
						$fallbackUrls = parameObj.fallbackurls ? parameObj.fallbackurls : "";
					}
					$videoUrl = parameObj.videourl ? decodeURIComponent(parameObj.videourl) : "";
					$playerName = parameObj.playername ? decodeURIComponent(parameObj.playername) : sewise.GlobalConstant.PLAYER_NAME;
					$copyright = parameObj.copyright ? decodeURIComponent(parameObj.copyright) : sewise.GlobalConstant.PLAYER_COPYRIGHT;
					$playerVersion = parameObj.playerversion ? decodeURIComponent(parameObj.playerversion) : sewise.GlobalConstant.PLAYER_VERSION;
					$buildDate = parameObj.builddate ? decodeURIComponent(parameObj.builddate) : sewise.GlobalConstant.BUILD_DATE;
				}
				else if(this.playerType == sewise.GlobalConstant.FLASH){
					$serverPath = "http://" + this.porthost + "/api/player/";
					 //多码率json地址。
					if(typeof(parameObj.videosjsonurl) == "string"){
						$videosJsonUrl = parameObj.videosjsonurl ? parameObj.videosjsonurl : "";
					}else{
						$videosJsonUrl = parameObj.videosjsonurl ? encodeURIComponent(JSON.stringify(parameObj.videosjsonurl, "", "\t")) : "";
					}
					if(parameObj.encodeurl)
					  $videoUrl = parameObj.videourl ? encodeURIComponent(parameObj.videourl) : "";
					else
					  $videoUrl = parameObj.videourl ? parameObj.videourl : "";
					//解决当视频地址为相对路径时，flash模块播放时存在路径错误的问题。
					if(parameObj.videourl&&!parameObj.videourl.match(/(?:http|https|file):\/\//)){
						var htmlHref = window.location.href;
						$videoUrl = htmlHref.slice(0, htmlHref.lastIndexOf("/") + 1) + $videoUrl;
					}
					$playerName = parameObj.playername ? parameObj.playername : sewise.GlobalConstant.PLAYER_NAME;
					$copyright = parameObj.copyright ? parameObj.copyright : sewise.GlobalConstant.PLAYER_COPYRIGHT;
					$playerVersion = parameObj.playerversion ? parameObj.playerversion : sewise.GlobalConstant.PLAYER_VERSION;
					$buildDate = parameObj.builddate ? parameObj.builddate : sewise.GlobalConstant.BUILD_DATE;
					$swfPath=this.swfPath?this.swfPath:"";
				}
				
			}
			else if(this.server == sewise.GlobalConstant.LIVE)
			{
				$autoStart = parameObj.autostart ? parameObj.autostart : true;
				$buffer = parameObj.buffer ? parameObj.buffer : 0.1;
				$shiftTime = parameObj.shifttime ? parameObj.shifttime : "";
				$duration = parameObj.duration ? parameObj.duration : 3600;
			
				if(this.playerType == sewise.GlobalConstant.HTML5){
					$serverPath = "http://" + this.porthost + "/api/player/";
					//多码率json地址。
					if(typeof(parameObj.videosjsonurl) == "string"){
						$videosJsonUrl = parameObj.videosjsonurl ? JSON.parse(decodeURIComponent(parameObj.videosjsonurl)) : "";
					}else{
						$videosJsonUrl = parameObj.videosjsonurl ? parameObj.videosjsonurl : "";
					}
					$streamUrl = parameObj.streamurl ? decodeURIComponent(parameObj.streamurl) : "";
					
					$playerName = parameObj.playername ? decodeURIComponent(parameObj.playername) : sewise.GlobalConstant.PLAYER_NAME;
					$copyright = parameObj.copyright ? decodeURIComponent(parameObj.copyright) : sewise.GlobalConstant.PLAYER_COPYRIGHT;
					$playerVersion = parameObj.playerversion ? decodeURIComponent(parameObj.playerversion) : sewise.GlobalConstant.PLAYER_VERSION;
					$buildDate = parameObj.builddate ? decodeURIComponent(parameObj.builddate) : sewise.GlobalConstant.BUILD_DATE;
				}
				else if(this.playerType == sewise.GlobalConstant.FLASH){
					$serverPath = "http://" + this.porthost + "/api/player/";
					//$serverApi = "ServerApi.execute";
					//多码率json地址。
					if(typeof(parameObj.videosjsonurl) == "string"){
						$videosJsonUrl = parameObj.videosjsonurl ? parameObj.videosjsonurl : "";
					}else{
						$videosJsonUrl = parameObj.videosjsonurl ? encodeURIComponent(JSON.stringify(parameObj.videosjsonurl, "", "\t")) : "";
					}
					if(parameObj.encodeurl)
					  $streamUrl = parameObj.streamurl ? encodeURIComponent(parameObj.streamurl) : "";
					else
					  $streamUrl = parameObj.streamurl ? parameObj.streamurl : "";
					$playerName = parameObj.playername ? parameObj.playername : sewise.GlobalConstant.PLAYER_NAME;
					$copyright = parameObj.copyright ? parameObj.copyright : sewise.GlobalConstant.PLAYER_COPYRIGHT;
					$playerVersion = parameObj.playerversion ? parameObj.playerversion : sewise.GlobalConstant.PLAYER_VERSION;
					$buildDate = parameObj.builddate ? parameObj.builddate : sewise.GlobalConstant.BUILD_DATE;
				}
			}
			playVars = {
						autoStart        : $autoStart,
						programId        : $programId,
						lang             : $lang,
						logo             : $logo,
						buffer           : $buffer,
						type             : $type,
						skin             : $skin,
						skinClass        : $skinClass,
						serverPath       : $serverPath,
						server           : this.server,
						fallbackUrls	 : $fallbackUrls,
						title            : $title,
						draggable		 : $draggable,
		                published        : $published,
		                videoUrl         : $videoUrl,
						startTime        : $startTime,
						poster			 : $poster,
						videosJsonUrl    : $videosJsonUrl,
						playerName		 : $playerName,
						copyright		 : $copyright,
						playerVersion    : $playerVersion,
						buildDate        : $buildDate,
		                volume           : $volume,
		                key           	 : $key,
		                swfPath          : $swfPath,
		                customDatas      : $customDatas,
		                clarityBtnDisplay	 : $clarityBtnDisplay,
		                timeDisplay	     : $timeDisplay,
		                controlBarDisplay: $controlBarDisplay,
		                topBarDisplay    : $topBarDisplay,
		                bigPlayBtnDisplay: $bigPlayBtnDisplay,
		                protocal         : this.protocal,
		                playsinline      : $playsinline,
		                //值为"#"标识只是初始化播放器
		                url              : parameObj.url
					};
					if(parameObj.fragmentloadmaxretry)
					  playVars.fragmentLoadMaxRetry=parameObj.fragmentloadmaxretry;
					//if(typeof(parameObj.loadflashplugin)!="undefined")
					  //playVars.loadFlashPlugin=parameObj.loadflashplugin;
					if(typeof(parameObj.accelerate)!="undefined")
					  playVars.accelerate=parameObj.accelerate;
					if(typeof(parameObj.seek)!="undefined")
					  playVars.seek=parameObj.seek;
					if(typeof(parameObj.showerror)!="undefined")
					  playVars.showError=parameObj.showerror;
					if(typeof(parameObj.autofullscreen)!="undefined")
					  playVars.autoFullScreen=parameObj.autofullscreen;
					  
					if(typeof(this.hlsjs)!="undefined")
					  playVars.hlsjs=this.hlsjs;
					  //以下参数直播特有
					if(typeof($shiftTime)!="undefined")
					  playVars.shiftTime=$shiftTime;
					if(typeof($streamUrl)!="undefined")
					  playVars.streamUrl=$streamUrl;
					if(typeof($duration)!="undefined")
					  playVars.duration=$duration;
					if(typeof(parameObj.adscallback)!="undefined"){
						var adsCallFunObjStr=JSON.stringify(parameObj.adscallback);
						adsCallFunObjStr=encodeURIComponent(adsCallFunObjStr);
						playVars.adsCallBack=adsCallFunObjStr;
					}
					if(typeof(parameObj.adsjsonstr)!="undefined")
					  playVars.adsJSONStr=parameObj.adsjsonstr;
					if(typeof(parameObj.seekmode)!="undefined")
					  playVars.seekMode=parameObj.seekmode;
					if(typeof(parameObj.maxbufferlength)!="undefined")
					  playVars.maxBufferLength=parameObj.maxbufferlength;
					
			return playVars;
	  };
			
})(window.Sewise);


(function () {
	'use strict';

	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = (function () {
		var val;
		var valLength;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// new WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0, valLength = val.length; i < valLength; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return !!document[fn.fullscreenElement];
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return !!document[fn.fullscreenEnabled];
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();

(function(sewise,$){
	/*
	 * 皮肤控制层对象
	 * Author:keyun
	 * Date:2015/9/28
	 */
	var ControlBar = sewise.ControlBar = function(elementObject, elementLayout, topBar,clarityWindow,globalParam){
		var isLive=globalParam.server==sewise.GlobalConstant.LIVE?true:false;
		var $container = elementObject.$container;
		var $video = elementObject.$video;
		var $controlbar = elementObject.$controlbar;
		var $playBtn = elementObject.$playBtn;
		var $pauseBtn = elementObject.$pauseBtn;
		var $stopBtn = elementObject.$stopBtn;
		var $fullscreenBtn = elementObject.$fullscreenBtn;
		var $normalscreenBtn = elementObject.$normalscreenBtn;
		var $soundopenBtn = elementObject.$soundopenBtn;
		var $soundcloseBtn = elementObject.$soundcloseBtn;
		var $volumeline=elementObject.$volumeline;
		var $volumelineVolume = elementObject.$volumelineVolume;
		var $volumelineDragger = elementObject.$volumelineDragger;
		var $volumelinePoint = elementObject.$volumelinePoint;
		var $playtime = elementObject.$playtime;
		var $totaltime = elementObject.$totaltime;//有些皮肤为空
		var $shareBtn=elementObject.$shareBtn;
		var $progressPlayedLine = elementObject.$progressPlayedLine;
		var $progressPlayedPoint = elementObject.$progressPlayedPoint;
		var $progressLoadedLine = elementObject.$progressLoadedLine;
		var $progressSeekLine = elementObject.$progressSeekLine;
		var $liveBtn = elementObject.$liveBtn;
		var $topbarClock=elementObject.$topbarClock;
		//////////////
		var $buffer = elementObject.$buffer;
		var $bufferTip = elementObject.$bufferTip;
		var $bufferText=elementObject.$bufferText;
		var $bigPlayBtn = elementObject.$bigPlayBtn;
		//清晰度切换按钮
		var $claritySwitchBtn = elementObject.$claritySwitchBtn;
		var $clarityBtnText = elementObject.$clarityBtnText;
		//声音条垂直布局
		var volumeline_vlayout=!elementObject.volumeline_hlayout;
		var volumelineOriginalH=0;
		//////////////
		var that = this;
		var mainPlayer;
		var screenState = "normal";
		var duration = 0.1;
		var playTime = 0;
		var playTimeHMS = "00:00:00";
		var durationHMS = "00:00:00";
		var ppPointW = 0;
		var dragging = false;
		var beforeDownX = 0;
		var afterUpX = 0;
		var ppLineWidth = 0;
		var psLineWidth = 0;
		var seekPt = 0;
		var displayBar = true;
		var isPlaying = false;
		var hideTimeout;
		var delayTime = 5000;
		
		var vlPointW = 0;
		var vdLinePos = 0;
		var vvLinePos = 0;
		var volumePt = 0;
		var vDragging = false;
		var vBeforeDownX = 0;
		var vAfterUpX = 0;
		var fixedTimes = false;
		var leftTimeOffset=0;//播放时间偏移值
		var rightTimeOffset=0;
		var endTime=0;
		var isMobile=false;
		var showBigPlayBtn=true;
		var showClarityBtn=true;
		var isTangerineSkinType=false;
		var defaultPlayTimeLf=0;
		init();
		/////////////////////////////////////////
		function init(){
			ppPointW = $progressPlayedPoint.width();
			psLineWidth = $progressSeekLine.width();
			if($volumelineVolume)
			  volumelineOriginalH=$volumelineVolume.height();
			if($volumelineDragger){
			  if(volumeline_vlayout){
                 vdLinePos = $volumelineDragger.height();
                 $volumeline.hide();
			  }
              else
                 vdLinePos = $volumelineDragger.width();
           }
			isMobile=sewise.Utils.browser.versions.mobile;
			$pauseBtn.hide();
			$normalscreenBtn.hide();
			$soundcloseBtn.hide();
			$buffer.hide();
            if(sewise.Utils.browser.versions.mobile&&$volumeline)//移动端隐藏声音控制滑动条
              $volumeline.hide();
			hideTimeout = setTimeout(hideControlBar, delayTime);
			if(globalParam.parameObj.skinType&&globalParam.parameObj.skinType===sewise.GlobalConstant.SKIN_TYPE_TANGERINE)
			   isTangerineSkinType=true;
			defaultPlayTimeLf=$playtime.css("left");
		}
		//设置屏幕的单击和双击事件
		this.setScreenEvent=function(){
			var screenObj;
			if(mainPlayer.isHtml5)
			{
				screenObj=$container;
				screenObj.click(function(e){
				  if(mainPlayer.isLockScreen) return;
			       screenObj.mousemove();
			       singleClickHandle();
		        });	
		        screenObj.dblclick(function(e){
		           if(mainPlayer.isLockScreen) return;
			       doubleClickHandle();
		        });
			}else{
				//flash挡住了container，所以这里用flash元素对象侦听事件
				screenObj=mainPlayer.sewiseVideo.videoObject;
				screenObj.on("singleClick",function(){
					if(mainPlayer.isLockScreen) return;
					singleClickHandle();
				});
				screenObj.on("doubleClick",function(){
					if(mainPlayer.isLockScreen) return;
					doubleClickHandle();
				});
			}
			
		};
		function singleClickHandle(){
			if(mainPlayer)
			{
				if(isMobile){
					if(displayBar)
					  hideControlBar();
					else
					  showControlBar();
				}else{
				   if(isPlaying){
				     mainPlayer.pause();
			       }else{
				     mainPlayer.play();
			       }	
				}	
			}
		}
		function doubleClickHandle(){
			 if(globalParam.parameObj.doubleClickFullScreen==="disable") return;
			 if(screenState == "normal"){
				 that.fullScreen();
			 }else{
				 that.noramlScreen();
			 }
		}
		function checkIE(){
			var ieNum=window.Sewise.Utils.browser.ieVersionNumber;//ie版本号
	        if(ieNum>0&&ieNum<=10)
			    return true;	
			else if(ieNum===0&&("ActiveXObject" in window))//ie11
			    return true;	
			else
				return false;
		}
		if(!isMobile){
		 $container.bind({"mousemove": containerOnMoveHandler, "touchmove": containerOnMoveHandler});
		 $controlbar.bind({"mouseover": controlbarOnOverHandler, "touchstart": controlbarOnOverHandler});
		 $controlbar.bind({"mouseout": controlbarOnOutHandler, "touchend": controlbarOnOutHandler});
		 var isIE=checkIE();
		  if(isIE){
			$container.mouseenter(function(e){
			   if(displayBar === false){
			   	clearTimeout(hideTimeout);
				showControlBar();
			   }
		    });
		    $container.mouseleave(function(){
		    	hideTimeout = setTimeout(hideControlBar, delayTime);
		    });
		  }
		}
		function containerOnMoveHandler(e){
			if(displayBar === false){
				showControlBar();
				hideTimeout = setTimeout(hideControlBar, delayTime);
			}
		}
		function controlbarOnOverHandler(e){
			if(hideTimeout !== 0){
				clearTimeout(hideTimeout);
				hideTimeout = 0;
			}
		}
		function controlbarOnOutHandler(e){
			if(hideTimeout === 0){
				hideTimeout = setTimeout(hideControlBar, delayTime);
			}
		}

		function hideControlBar(){
		    if(mainPlayer&&!mainPlayer.isVideo) return;
			if($claritySwitchBtn)
			   $claritySwitchBtn.hide();
			hideBar();
			topBar.hide();
			displayBar = false;
			if(mainPlayer)
			  mainPlayer.changeControlBarShowState(false);
		}
		function showControlBar(){
			if($claritySwitchBtn&&showClarityBtn)
			   $claritySwitchBtn.show();
			showBar();
			topBar.show();
			displayBar = true;
			if(mainPlayer)
			  mainPlayer.changeControlBarShowState(true);
		}
		
		$controlbar.click(function(e){
			if(e.originalEvent.stopPropagation)
			   e.originalEvent.stopPropagation();
			else
			   e.originalEvent.cancelBubble=true;
		});
		$playBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			mainPlayer.play();
		});
		$pauseBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			mainPlayer.pause();
		});
		$stopBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			mainPlayer.stop();
		});
		if($liveBtn){
		   $liveBtn.click(function(){
		   	  if(mainPlayer.isLockScreen) return;
			  mainPlayer.live();
		   });
		}
		if(elementObject.$nextBtn){
			elementObject.$nextBtn.click(function(){
				if(mainPlayer.isLockScreen) return;
				mainPlayer.nextVideo();
			});
		}
		$bigPlayBtn.click(function(e){
			if(mainPlayer.isLockScreen) return;
			if(e.originalEvent.stopPropagation)
			   e.originalEvent.stopPropagation();
			else
			   e.originalEvent.cancelBubble=true;
			mainPlayer.play();
		});
		$fullscreenBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			if(globalParam.parameObj.autofullscreen===false)
			  mainPlayer.changeScreenBtnState(true);
			else
			  that.fullScreen();
		});
		$normalscreenBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			if(globalParam.parameObj.autofullscreen===false)
			  mainPlayer.changeScreenBtnState(false);
			else
			  that.noramlScreen();
		});
		$soundopenBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			mainPlayer.muted(true);
		});
		$soundcloseBtn.click(function(){
			if(mainPlayer.isLockScreen) return;
			mainPlayer.muted(false);
		});
		if(volumeline_vlayout&&$volumeline){
		  $soundopenBtn.mouseenter(function(){
		  	if(!isMobile)
			 $volumeline.show();
		  });
		  $soundopenBtn.mouseleave(function(){
		  	$volumeline.hide();
		  });
		  $volumeline.mouseenter(function(){
		  	if(!isMobile)
		  	 $volumeline.show();
		  });
		  $volumeline.mouseleave(function(){
		  	$volumeline.hide();
		  });
		}
		
		if($shareBtn){
			$shareBtn.click(function(){
			  if(mainPlayer)
			     mainPlayer.shareVideo();
		  });
		}
		
	    if($claritySwitchBtn){
		   $claritySwitchBtn.click(function(e){
		   	   if(mainPlayer.isLockScreen) return;
			   if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			   else
			      e.originalEvent.cancelBubble=true;
			   clarityWindow.toggle();
		   });
		   if(isTangerineSkinType){
		   	   $claritySwitchBtn.mouseenter(function(e){
		   	   	   clarityWindow.show();
		   	   });
		   	   $claritySwitchBtn.mouseleave(function(e){
		   	   	   clarityWindow.hide();
		   	   });
		   	   elementObject.$clarityWindowContainer.mouseenter(function(e){
		   	   	   clarityWindow.show();
		   	   });
		   	   elementObject.$clarityWindowContainer.mouseleave(function(e){
		   	   	    clarityWindow.hide();
		   	   });
		   }
	    }
		
		if(isTangerineSkinType)
		{
		    $progressSeekLine.mouseenter(function(e){
		    	elementObject.$overtime.show();
		    	elementObject.$overline.show();
		    	$progressSeekLine.bind("mousemove",seeklineMouseMoveHandle);
		    });
		    $progressSeekLine.mouseleave(function(e){
		    	elementObject.$overtime.hide();
		    	elementObject.$overline.hide();
		    	$progressSeekLine.unbind("mousemove",seeklineMouseMoveHandle);
		    });
		    
		} 
		function seeklineMouseMoveHandle(e){
			elementObject.$overtime.css("left",e.pageX-elementObject.$overtime.width()/2);
			elementObject.$overline.css("left",e.pageX-parseInt($("body").css("margin-left")));
			var gbcrleft=e.target.getBoundingClientRect().left;
			var slw = (e.pageX -gbcrleft);
			var alw = $progressSeekLine.width();
			var moSecond = parseInt(slw / alw*duration);
			elementObject.$overtimeText.text(sewise.SkinUtils.stringer.secondsToMS(moSecond));
			
		}
		$progressSeekLine.mousedown(function(e){
			if(mainPlayer.isLockScreen) return;
			if(mainPlayer.playVars.url==="#") return;
			var gbcrleft=e.target.getBoundingClientRect().left;
			ppLineWidth = (e.pageX -gbcrleft);
			psLineWidth = $progressSeekLine.width();
			//$progressPlayedLine.css("width", ppLineWidth);
			//$progressPlayedPoint.css("left", ppLineWidth - ppPointW / 2);
			seekPt = ppLineWidth / psLineWidth;
			if(isLive)
			   seekPlay(seekPt);
			else{
			   var tim=duration-leftTimeOffset-rightTimeOffset;
			   mainPlayer.seek(seekPt *tim+leftTimeOffset);
			}

			//console.log(seekPt * duration);
		});
		$progressPlayedPoint.mousedown(function(e){
			if(mainPlayer.isLockScreen) return;
			if(mainPlayer.playVars.url==="#") return;

			this.blur();
			dragging = true;
			beforeDownX = e.pageX;
			ppLineWidth = $progressPlayedLine.width();
			psLineWidth = $progressSeekLine.width();

			$container.bind("mousemove", containerMouseMoveHandler);
			$(document).bind("mouseup", ppPointMouseUpHandler);
		});
		function containerMouseMoveHandler(e){
			//console.log("mouseMove");
			if(document.selection)
			   document.selection.empty();
			if(window.getSelection)
			   window.getSelection().removeAllRanges();
			if(isLive){
				if($progressPlayedLine.width() > $progressLoadedLine.width()){
				   return;
			    }
			}
			var currentWidth = ppLineWidth + (e.pageX - beforeDownX);
			if(currentWidth > 0 && currentWidth < psLineWidth){
				//console.log(currentWidth);
				
				$progressPlayedLine.css("width", currentWidth);
				$progressPlayedPoint.css("left", currentWidth - ppPointW / 2);
			}
		}
		
		function ppPointMouseUpHandler(e){
			//console.log("mouseup");
			$container.unbind("mousemove", containerMouseMoveHandler);
			$(document).unbind("mouseup", ppPointMouseUpHandler);
			afterUpX = e.pageX;
			if(beforeDownX != afterUpX){
				ppLineWidth = $progressPlayedLine.width();
				seekPt = ppLineWidth / psLineWidth;
				if(isLive)
				   seekPlay(seekPt);
				else
				   mainPlayer.seek(seekPt * duration);
			}
			dragging = false;
		}

		//touch事件处理///////////////////////
		$progressPlayedPoint.bind("touchstart", touchstartHandler);
		function touchstartHandler(event){
			//console.log("touchstart");
			if(mainPlayer.isLockScreen) return;
			e = event.originalEvent;
			//console.log(e);
			$progressPlayedPoint.blur();
			var touchTarget = e.targetTouches[0];
			dragging = true;
			beforeDownX = touchTarget.pageX;
			//console.log("beforeDownX:" + beforeDownX);
			ppLineWidth = $progressPlayedLine.width();
			psLineWidth = $progressSeekLine.width();
			$progressPlayedPoint.bind("touchmove", ppPointTouchMoveHandler);
			$progressPlayedPoint.bind("touchend", ppPointTouchEndHandler);
		}
		function ppPointTouchMoveHandler(event){
			//console.log("touchMove");
			if(isLive){
				if($progressPlayedLine.width() > $progressLoadedLine.width()){
				   return;
			    }
			}
			e = event.originalEvent;
			//console.log(e);
			if (e.targetTouches.length == 1){
				e.preventDefault();
				var touchTarget = e.targetTouches[0];
				//console.log("touchmove pageX:" + touchTarget.pageX);
				var currentWidth = ppLineWidth + (touchTarget.pageX - beforeDownX);
				if(currentWidth > 0 && currentWidth < psLineWidth){
					$progressPlayedLine.css("width", currentWidth);
					$progressPlayedPoint.css("left", currentWidth - ppPointW / 2);
				}
			}
		}
		function ppPointTouchEndHandler(event){
			//console.log("touchend");
			e = event.originalEvent;
			//console.log(e);
			$progressPlayedPoint.unbind("touchmove", ppPointTouchMoveHandler);
			$progressPlayedPoint.unbind("touchend", ppPointTouchEndHandler);
			if (e.changedTouches.length == 1){
				var touchTarget = e.changedTouches[0];
				afterUpX = touchTarget.pageX;
				if(beforeDownX != afterUpX){
					ppLineWidth = $progressPlayedLine.width();
					seekPt = ppLineWidth / psLineWidth;
					if(isLive)
					  seekPlay(seekPt);
					else
					  mainPlayer.seek(seekPt * duration);
				}
			}
			dragging = false;
		}
		function seekPlay($seekPt){
			var tmDate=mainPlayer.playTime();
			if(tmDate){
			  var shiftDate = new Date(Math.floor(tmDate.getTime() / 1000 / 3600) * 3600 * 1000 + $seekPt * duration * 1000);
			  var shiftTime = sewise.SkinUtils.stringer.dateToTimeStr14(shiftDate);
			  mainPlayer.seek(shiftTime);
			}
			//console.log(shiftDate);
			//console.log(shiftTime);
		}
		//*****************************声音拖动条*********************************************************
		if($volumelineDragger){
		    $volumelineDragger.mousedown(function(e){
			    if(mainPlayer.isLockScreen) return;
			    if(volumeline_vlayout){
			       var gbtop=e.target.getBoundingClientRect().top;
			       var scrollTp=$(document).scrollTop();
			       var vvh = (e.pageY -gbtop-scrollTp );
			       //console.log(e.pageY+"----"+gbtop+"--"+scrollTp);
			       vvLinePos=volumelineOriginalH-vvh;
                   vdLinePos = $volumelineDragger.height();
                   //console.log(vvLinePos+"vv--vd"+vdLinePos+"--vvh"+vvh+"pw"+vlPointW);
                   $volumelineVolume.css("height", vvLinePos);
			       $volumelinePoint.css("top", vvh - vlPointW / 2);
			    }else if(isTangerineSkinType){
			       var gbleft=e.target.getBoundingClientRect().left+$(document).scrollLeft();
			       vvLinePos=e.pageX-gbleft;
			       vdLinePos = $volumelineDragger.width();
			       $volumelineVolume.css("width",vvLinePos);
			       
			    }
                else{
                  vvLinePos = (e.pageX - e.target.getBoundingClientRect().left-$(document).scrollLeft());
                  vdLinePos = $volumelineDragger.width();
			      $volumelineVolume.css("width", vvLinePos);
			      $volumelinePoint.css("left", vvLinePos - vlPointW / 2);
                }
			    volumePt = vvLinePos / vdLinePos;
			    mainPlayer.setVolume(volumePt);
			    mutedCheck();
		    });
		}
		if($volumelinePoint){
		    $volumelinePoint.mousedown(function(e){
		       if(e.originalEvent.stopPropagation)
			     e.originalEvent.stopPropagation();
		       else
			     e.originalEvent.cancelBubble=true;
		       if(mainPlayer.isLockScreen) return;
			   this.blur();
			   vDragging = true;
			   if(volumeline_vlayout){
                 vdLinePos = $volumelineDragger.height();
                 vvLinePos = $volumelineVolume.height();
                 vBeforeDownX = e.pageY;
			   }
              else{
                 vdLinePos = $volumelineDragger.width();
                 vvLinePos = $volumelineVolume.width();
                 vBeforeDownX = e.pageX;
              }
			   $container.bind("mousemove", vContainerMouseMoveHandler);
			   $(document).bind("mouseup", vPointMouseUpHandler);
		   });
		}
		function mutedCheck(){
			if(volumePt > 0){
				if(mainPlayer)
				  mainPlayer.muted(false);
				$soundopenBtn.show();
				$soundcloseBtn.hide();
			}else{
				if(mainPlayer)
				   mainPlayer.muted(true);
				$soundopenBtn.hide();
				$soundcloseBtn.show();
			}
		}
		function vContainerMouseMoveHandler(e){
			if(document.selection)
			   document.selection.empty();
			if(window.getSelection)
			   window.getSelection().removeAllRanges();
			var vCurrentValue;
			if(volumeline_vlayout){
				vCurrentValue = vvLinePos -(e.pageY - vBeforeDownX);
				var vp=volumelineOriginalH-vCurrentValue;
			  if(vCurrentValue > 0 && vCurrentValue < vdLinePos){
				$volumelineVolume.css("height", vCurrentValue);
				$volumelinePoint.css("top", vp - vlPointW / 2);
			  }	
			}else{
			  vCurrentValue = vvLinePos + (e.pageX - vBeforeDownX);
			  if(vCurrentValue > 0 && vCurrentValue < vdLinePos){
				$volumelineVolume.css("width", vCurrentValue);
				$volumelinePoint.css("left", vCurrentValue - vlPointW / 2);
			  }	
			}
		}
		function vPointMouseUpHandler(e){
			$container.unbind("mousemove", vContainerMouseMoveHandler);
			$(document).unbind("mouseup", vPointMouseUpHandler);
			if(volumeline_vlayout)
			   vAfterUpX = e.pageX;
			else
			   vAfterUpX=e.pageY;
			if(vBeforeDownX != vAfterUpX){
				if(volumeline_vlayout)
				  vvLinePos = $volumelineVolume.height();
				else
				  vvLinePos = $volumelineVolume.width();
				volumePt = vvLinePos / vdLinePos;
				mainPlayer.setVolume(volumePt);

				mutedCheck();
			}
			vDragging = false;
		}
		//touch事件处理
		if($volumelinePoint)
		   $volumelinePoint.bind("touchstart", vTouchstartHandler);
		function vTouchstartHandler(event){
			//console.log("touchstart");
			e = event.originalEvent;
			//console.log(e);
			$volumelinePoint.blur();
			var touchTarget = e.targetTouches[0];
			vDragging = true;
			vBeforeDownX = touchTarget.pageX;
			//console.log("vBeforeDownX:" + vBeforeDownX);
			if(volumeline_vlayout)
			  vvLinePos=$volumelineVolume.height();
			else
			  vvLinePos = $volumelineVolume.width();
			
			if(volumeline_vlayout)
                 vdLinePos = $volumelineDragger.height();
            else
                 vdLinePos = $volumelineDragger.width();
			$volumelinePoint.bind("touchmove", vPointTouchMoveHandler);
			$volumelinePoint.bind("touchend", vPointTouchEndHandler);
		}
		function vPointTouchMoveHandler(event){
			//console.log("touchmove");
			e = event.originalEvent;
			//console.log(e);
			if (e.targetTouches.length == 1){
				e.preventDefault();
				var touchTarget = e.targetTouches[0];
				//console.log("touchmove pageX:" + touchTarget.pageX);
				var vCurrentWidth = vvLinePos + (touchTarget.pageX - vBeforeDownX);
				if(vCurrentWidth > 0 && vCurrentWidth < vdLinePos){
					$volumelineVolume.css("width", vCurrentWidth);
					$volumelinePoint.css("left", vCurrentWidth - vlPointW / 2);
				}
			}
		}
		function vPointTouchEndHandler(event){
			//console.log("touchend");
			e = event.originalEvent;
			//console.log(e);
			$volumelinePoint.unbind("touchmove", vPointTouchMoveHandler);
			$volumelinePoint.unbind("touchend", vPointTouchEndHandler);
			if (e.changedTouches.length == 1){
				var touchTarget = e.changedTouches[0];
				vAfterUpX = touchTarget.pageX;
				if(vBeforeDownX != vAfterUpX){
					if(volumeline_vlayout)
					   vvLinePos=$volumelineVolume.height();
					else
					   vvLinePos= $volumelineVolume.width();
					volumePt = vvLinePos / vdLinePos;
					//console.log("volume:" + volumePt);
					mainPlayer.setVolume(volumePt);

					mutedCheck();
				}
			}
			vDragging = false;
		}
		//************************************************************************************************************
		
		
		
		function hideBar(){
			$controlbar.css("visibility", "hidden");
		}
		function showBar(){
			$controlbar.css("visibility", "visible");
		}

		//////////////////////////////////////////
		if(document.addEventListener){//ie8不支持此方法
		   document.addEventListener("fullscreenchange", fullscreenChangeHandler);
		   document.addEventListener("MSFullscreenChange", fullscreenChangeHandler);
		   document.addEventListener("mozfullscreenchange", fullscreenChangeHandler);
		   document.addEventListener("webkitfullscreenchange", fullscreenChangeHandler);
		}
		function fullscreenChangeHandler(){
			if(document.fullscreenElement||document.msFullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement){
				
            	elementLayout.fullScreen();
            	mainPlayer.changeFullScreen(true);
          	}else{
          		$fullscreenBtn.show();
			    $normalscreenBtn.hide();
            	elementLayout.normalScreen();
            	mainPlayer.changeFullScreen(false);
          	}
          	that.timeUpdate(playTime);
      	}
		$(window).bind("resize", nsResizeHandler);
		function nsResizeHandler(e){
			if(elementLayout)
			elementLayout.resize();
			that.timeUpdate(playTime);
		}
		function fsResizeHandler(e){
			elementLayout.fullScreen("not-support");
			that.timeUpdate(playTime);
		}

		function fullScreen(obj){
			$video = elementObject.$video;
			$(window).unbind("resize", nsResizeHandler);
//			console.log(obj.webkitRequestFullscreen+"--webkitRequestFullscreen");
//			console.log(obj.requestFullscreen+"--requestFullscreen");
//			console.log(obj.msRequestFullscreen+"--msRequestFullscreen");
//			console.log(obj.mozRequestFullScreen+"--mozRequestFullScreen");
//			console.log($video+"---video");

			if (obj.requestFullscreen){
				obj.requestFullscreen();
			} else if (obj.msRequestFullscreen){
				obj.msRequestFullscreen();
			} else if (obj.mozRequestFullScreen){
				obj.mozRequestFullScreen();
			}else if($video&&$video.webkitEnterFullscreen){
				if(isMobile){
				   $video.webkitEnterFullscreen();
				   $fullscreenBtn.hide();
				   $normalscreenBtn.show();
				}else if(obj.webkitRequestFullscreen){//pc端调用这个全屏时才能看见皮肤
				   obj.webkitRequestFullscreen();
				}else{
				   $video.webkitEnterFullscreen();
				   $fullscreenBtn.hide();
				   $normalscreenBtn.show();
				}
				
			} else if (obj.webkitRequestFullscreen){
				obj.webkitRequestFullscreen();
				if(sewise.SkinUtils.browser.isXiaoMiBrowser()){
					//小米手机自带浏览器，调用这个全屏api没有效果，进行特殊处理
					fsResizeHandler();
				}
				else if(sewise.SkinUtils.browser.isHuaweiBrowser()){
					//华为手机自带浏览器，调用这个全屏api没有效果，进行特殊处理
					//console.log("华为全屏1");
					fsResizeHandler();
				}
			}else{
				//console.log("not-support---6");
				elementLayout.fullScreen("not-support");
				that.timeUpdate(playTime);
				mainPlayer.changeFullScreen(true);
				$(window).bind("resize", fsResizeHandler);
			}
			screenState = "full";

			return;
		}
		function normalscreen(){
			if (document.exitFullscreen){
				document.exitFullscreen();
			} else if (document.msExitFullscreen){
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen){
				document.mozCancelFullScreen();
			}else if($video&&$video.webkitExitFullScreen){
				if(isMobile){
				  $video.webkitExitFullScreen();
				  $fullscreenBtn.show();
				  $normalscreenBtn.hide();
				}else if(document.webkitCancelFullScreen){
				  document.webkitCancelFullScreen();
				}else{
				  $video.webkitExitFullScreen();
				  $fullscreenBtn.show();
				  $normalscreenBtn.hide();
				}
			}
			else if (document.webkitCancelFullScreen){
				document.webkitCancelFullScreen();
				fullscreenChangeHandler();//调用它，防止有些手机浏览器侦听不到webkitfullscreenchange
			}else{
				elementLayout.normalScreen();
				that.timeUpdate(playTime);
				mainPlayer.changeFullScreen(false);
				$(window).unbind("resize", fsResizeHandler);
			}
			screenState = "normal";
			
			$(window).bind("resize", nsResizeHandler);

			return;
		}

		///////////////////////////////////////////
		this.setPlayer = function(mPlayer){
			mainPlayer = mPlayer;
		};
		this.started = function(){
			$playBtn.hide();
			$pauseBtn.show();
			$bigPlayBtn.hide();
			isPlaying = true;
		};
		this.paused = function(){
			$playBtn.show();
			$pauseBtn.hide();
			if(showBigPlayBtn)
			  $bigPlayBtn.show();
			isPlaying = false;
		};
		this.stopped = function(){
			$playBtn.show();
			$pauseBtn.hide();
			if(showBigPlayBtn)
			  $bigPlayBtn.show();
			$buffer.hide();
			isPlaying = false;
			that.timeUpdate(duration);
		};
		this.setDuration = function(totalTimes){
			if(isLive){
				duration = totalTimes;
			}else{
				duration = (totalTimes != Infinity) ? totalTimes : 3600;
				if(endTime>0)
				rightTimeOffset=duration-endTime;
			   if(totalTimes >=0)
			   {
				  if($totaltime){
					 durationHMS = sewise.SkinUtils.stringer.secondsToMS(duration-rightTimeOffset);
					 $totaltime.text(durationHMS);
				  }else{
					durationHMS = sewise.SkinUtils.stringer.secondsToHMS(duration-rightTimeOffset);
				  }
			   }
			}
			
		};
		this.timeUpdate = function(currentTime){
			
			if(mainPlayer){
			   if(!mainPlayer.sewisePlayer.timeupdateOpen) return;
			}
			var playPt;
			if(isLive)
			{
				var tmpPlayTime=mainPlayer.playTime();
				if(!tmpPlayTime) return;
			    if(!tmpPlayTime.getTime) return;
			    if(!fixedTimes){
				   durationHMS = sewise.SkinUtils.stringer.dateToStrHMS(new Date(Math.ceil(tmpPlayTime.getTime() / 1000 / duration) * duration * 1000));
				   playTimeHMS = sewise.SkinUtils.stringer.dateToStrHMS(new Date(Math.floor(tmpPlayTime.getTime() / 1000 / duration) * duration * 1000));
				  if($totaltime){
				  	$playtime.text(playTimeHMS);
				  	$totaltime.text(durationHMS);
				  }else{
				  	$playtime.text(playTimeHMS + "/" + durationHMS);
				  }
				  
			    }
			
			    if(dragging) return;
			    playPt = (Math.floor(tmpPlayTime.getTime() / 1000) % duration) / duration;
			    
			    var loadedPt;
			    var tmpLiveTime=mainPlayer.liveTime();
			    var playTimeRightHour = Math.ceil(tmpPlayTime.getTime() / 1000 / 3600);
			    var liveTimeLeftHour = Math.floor(tmpLiveTime.getTime() / 1000 / 3600);
			    if(liveTimeLeftHour >= playTimeRightHour){
				   loadedPt = 1;
			    }else{
				   loadedPt = (Math.floor(tmpLiveTime.getTime() / 1000) % duration) / duration;
			    }
			
			    var plLineWidth = loadedPt * 100 + "%";
			    $progressLoadedLine.css("width", plLineWidth);
			}
			else
			{
				if(mainPlayer&&!mainPlayer.isHtml5){
					if(mainPlayer.isSeeking) return;
				}
				if(currentTime === undefined || currentTime === Infinity||currentTime<0){
				   currentTime = 0;
			    }
			   
			    playTime = currentTime;
			    var showTime=playTime;
			    showTime=showTime<0?0:showTime;
			    if(showTime===0&&leftTimeOffset&&endTime)//设置了偏移时间播放
			       showTime=leftTimeOffset;
			    if(leftTimeOffset&&showTime<leftTimeOffset)//防止时间倒退显示错误(微录播)
			       showTime=leftTimeOffset;
			    if($totaltime){
			         playTimeHMS = sewise.SkinUtils.stringer.secondsToMS(showTime);
			         $playtime.text(playTimeHMS);
			    }
			    else{
			       playTimeHMS = sewise.SkinUtils.stringer.secondsToHMS(showTime);
			       $playtime.text(playTimeHMS + "/" + durationHMS);
			    }
			   
			   if(dragging) return;
			   playPt = (playTime-leftTimeOffset) / (duration-leftTimeOffset-rightTimeOffset);
			   
			}
			ppLineWidth = playPt * 100 + "%";
			$progressPlayedLine.css("width", ppLineWidth);
			
			var ppPointLeft = $progressPlayedLine.width() - ppPointW / 2;
			$progressPlayedPoint.css("left", ppPointLeft);
			if(isTangerineSkinType){
			   var playedW=$progressPlayedLine.width();
			   if(playedW>$playtime.width())//跟随移动
			      $playtime.css("left",ppPointLeft+$pauseBtn.outerWidth(true)+elementObject.$nextBtn.outerWidth(true)-$playtime.outerWidth(true));
			   else
			      $playtime.css("left",defaultPlayTimeLf);
			   var remainWh=($progressSeekLine.width()-playedW);
			   if($playtime.width()*1.1>=remainWh)
			      $totaltime.hide();
			   else
			      $totaltime.show();
			   //console.log("left"+"--"+$playtime.css("left")+"---"+$totaltime.css("left"));
			}
		};
		//播放时间偏移值
		this.setPlayTimeOffset=function(sTime,eTime){
			leftTimeOffset=parseFloat(sTime);
			rightTimeOffset=duration-parseFloat(eTime);
			endTime=parseFloat(eTime);
			
			if($totaltime){
				durationHMS = sewise.SkinUtils.stringer.secondsToMS(eTime);
				$totaltime.text(durationHMS);
			}else{
				durationHMS = sewise.SkinUtils.stringer.secondsToHMS(eTime);
			}
		};
		this.loadProgress = function(loadedPt){
			//console.log(loadedPt);
			
			var plLineWidth = loadedPt * 100 + "%";
			$progressLoadedLine.css("width", plLineWidth);
		};
		this.initVolume = function(value){
			if($volumelineVolume){
			volumePt = value;
			vvLinePos = vdLinePos * volumePt;
			if(volumeline_vlayout){
			  var vp=volumelineOriginalH-vvLinePos;
			  $volumelineVolume.css("height", vvLinePos);
			  $volumelinePoint.css("top", vp - vlPointW / 2);
			}else{
			  $volumelineVolume.css("width", vvLinePos);
			  $volumelinePoint.css("left", vvLinePos - vlPointW / 2);
	
			}
			
			mutedCheck();
			}
		};
		this.muted=function(bool){
			if(bool){
				$soundopenBtn.hide();
			    $soundcloseBtn.show();
				if($volumelineVolume){
			      if(volumeline_vlayout){
			   	     $volumelineVolume.css("height", 0);
			         $volumelinePoint.css("top", volumelineOriginalH- vlPointW / 2);
			      }else{
			         $volumelineVolume.css("width", 0);
			         $volumelinePoint.css("left", - vlPointW / 2);
			      }
			    }
			}else{
				$soundopenBtn.show();
			    $soundcloseBtn.hide();
				if($volumelineVolume){
				  if(volumeline_vlayout){
				    $volumelineVolume.css("height", vvLinePos);
			        $volumelinePoint.css("top", volumelineOriginalH-vvLinePos - vlPointW / 2);
				  }else{
				    $volumelineVolume.css("width", vvLinePos);
			        $volumelinePoint.css("left", vvLinePos - vlPointW / 2);
				  }
			   }
			}
		};
		this.hide2 = function(){
			$controlbar.hide();
		};
		this.hideTopbarClock=function(){
			$topbarClock.hide();
		};
		this.hideClarityBtn = function(){
			if($claritySwitchBtn){
			  $claritySwitchBtn.hide();
			  showClarityBtn=false;
			}
		};
		this.hideBigPlayBtn=function(){
			if($bigPlayBtn)
			 $bigPlayBtn.hide();
			 showBigPlayBtn=false;
		};
		this.updateClarityBtnPosition = function(){
			if($claritySwitchBtn){
			  $claritySwitchBtn.css("top", "0%");
			  $claritySwitchBtn.css("margin-top", "-5px");
			}
		};
		this.updateClarityBtnText = function(value){
			if($clarityBtnText)
			  $clarityBtnText.text(value);
		};
		this.fullScreen = function(){
			$fullscreenBtn.hide();
			$normalscreenBtn.show();
			fullScreen($container.get(0));
//			if(mainPlayer)
//			   mainPlayer.changeFullScreen(true);
		};
		this.noramlScreen = function(){
			$fullscreenBtn.show();
			$normalscreenBtn.hide();
			normalscreen();
		};
		this.showBuffer = function(){
			$buffer.show();
		};
		this.hideBuffer = function(){
			$buffer.hide();
		};
		this.bufferProgress=function(pt){
			if(parseFloat(pt)>0){
			  $bufferText.text(parseInt(pt*100)+"%");
			}else{
			  $bufferText.text("...");
			}
		};
		this.initLanguage = function(){
			var bufferTipStr = sewise.SkinUtils.language.getString("loading");
			$bufferTip.text(bufferTipStr);
		};
		
		this.refreshTimes = function(startTime, endTime){
			fixedTimes = true;
			$playtime.text(startTime + "/" + endTime);
			
			//duration = SewisePlayerSkin.Utils.stringer.hmsToSeconds(endTime) - SewisePlayerSkin.Utils.stringer.hmsToSeconds(startTime);
			var timeEnd = sewise.SkinUtils.stringer.hmsToSeconds(endTime);
			var timeStart = sewise.SkinUtils.stringer.hmsToSeconds(startTime);
			if(timeEnd > timeStart){
				duration = timeEnd - timeStart;
			}else{
				duration = sewise.SkinUtils.stringer.hmsToSeconds("24:00:00") - timeStart + timeEnd;
			}
		};
		this.getProgressSeekline=function(){
			return $progressSeekLine.get(0);
		};
		this.forceRefreshSize=function(){
			nsResizeHandler();
		};
		this.reset=function(){
			leftTimeOffset=0;
			rightTimeOffset=0;
		};
	};
	
})(window.Sewise,window.jQuery);

(function(sewise,$){
	/**
	 * Constructor.
	 * @name ElementLayout : 皮肤布局对象.
	 * 
	 */
	var ElementLayout = sewise.ElementLayout = function(elementObject,param){
		var skinType=param.skinType;
		var $container = elementObject.$container;
		var $controlBarProgress = elementObject.$controlBarProgress;
		var $playtime = elementObject.$playtime;
        var playerController;
		var that = this;
		var defStageWidth = elementObject.defStageWidth;
		var defStageHeight = elementObject.defStageHeight;
		
		var defLeftValue = elementObject.defLeftValue;
		var defTopValue = elementObject.defTopValue;
		var defOffsetX = elementObject.defOffsetX;
		var defOffsetY = elementObject.defOffsetY;
		var defOverflow = elementObject.defOverflow;
        var originalFrameW=0;
        var originalFrameH=0;
		var btnsWidth=calculateBtnWidth();
		
		var defProgressWidth = parseInt(defStageWidth) - btnsWidth;
		
		init();
		////////////////////////////////////////////////////////////////////////////////////////////
		function init(){
			if(defProgressWidth < 0){
				defProgressWidth = defProgressWidth + $playtime.width();
				$playtime.hide();
			}
			$controlBarProgress.css("width", defProgressWidth);
		}
		function calculateBtnWidth(){
			var btnW=0;
		    if(elementObject.progressBarIsUp)//播放进度条独立一行布局
		        btnW=0;
		    else//进度条和按钮在一条直线上布局
		    {
			   btnW=getBtnsWidth(sewise.Utils.browser.versions.mobile);
		    }
		    if(param.progressbarwidthoff)
		      btnW=btnW+parseInt(param.progressbarwidthoff);
		    return btnW;
		}
		//计算和播放进度条在一条直线上的所有元素宽度,如果是移动端隐藏声音控制滑动条(宽度为0)
		function getBtnsWidth(isMobile){
			var totalW=0;
			totalW+=elementObject.$playBtn.outerWidth(true);
			if(skinType!=sewise.GlobalConstant.SKIN_TYPE_TANGERINE)
			  totalW+=elementObject.$playtime.outerWidth(true);
			totalW+=elementObject.$fullscreenBtn.outerWidth(true);
			totalW+=parseInt(elementObject.$controlbarBtns.css("margin-left"));
			
			if(elementObject.$soundopenBtn&&elementObject.$soundopenBtn.length)
			   	totalW+=elementObject.$soundopenBtn.outerWidth(true);
			if(elementObject.$stopBtn&&elementObject.$stopBtn.length)
			   totalW+=elementObject.$stopBtn.outerWidth(true);
			if(elementObject.$liveBtn&&elementObject.$liveBtn.length)
			   totalW+=elementObject.$liveBtn.outerWidth(true);
			if(elementObject.$volumeline&&!isMobile&&elementObject.$volumeline.length&&elementObject.volumeline_hlayout)
			   totalW+=elementObject.$volumeline.outerWidth(true);
			if(elementObject.$totaltime&&elementObject.$totaltime.length&&skinType!=sewise.GlobalConstant.SKIN_TYPE_TANGERINE)
			   totalW+=elementObject.$totaltime.outerWidth(true);
			if(skinType&&skinType===sewise.GlobalConstant.SKIN_TYPE_TANGERINE){
			   totalW+=elementObject.$claritySwitchBtn.outerWidth(true);
			   totalW+=elementObject.$nextBtn.outerWidth(true);
			}
			
			return totalW;
		}
		this.fullScreen = function(state){
			if(state == "not-support"){
				$("body").css("overflow", "hidden");

				var clientW = $(window).width();
				var clientH=$(window).height();
				$container.css("width", clientW);
				$container.css("height", clientH);
				
				var iframeArr=$container.find("iframe");//播放器包含iframe(ie8,9特殊处理的情况)
				var len=iframeArr.length;
				if(len>0){
					var tIframe;
					for(var i=0;i<len;i++){
						tIframe=iframeArr[i];
						$(tIframe).height(clientH);
						$(tIframe).trigger("sewiseIframeResize");
					}
				}
				
				
                if(playerController&&!playerController.globalParam.calculateOffTop){
                	
                }else{
                  var scrollL = $(document).scrollLeft();
				  var scrollT = $(document).scrollTop();
				  var marginL = parseInt($("body").css("margin-left"));
				  var marginT = parseInt($("body").css("margin-top"));
				  var offsetX = (defLeftValue - defOffsetX + scrollL) + 'px';
				  var offsetY = (defTopValue - defOffsetY + scrollT - marginT) + 'px';
                  $container.css("left", offsetX);
				  $container.css("top", offsetY);	
                }
				
			}else{
				$container.css("width", "100%");
				$container.css("height", "100%");
			}
            $("body").addClass("sewiseFullScreen");
			btnsWidth=calculateBtnWidth();
			
			var fullProgressWidth = parseInt($(window).width()) - btnsWidth;
			
			if(fullProgressWidth < 0){
				fullProgressWidth = fullProgressWidth + $playtime.width();
				$playtime.hide();
			}else{
				$playtime.show();
			}
			$controlBarProgress.css("width", fullProgressWidth);
		};
		this.normalScreen = function(){
			$container.css("left", defLeftValue);
			$container.css("top", defTopValue);
			$container.css("width", "100%");
		    $container.css("height", "100%");
		    
			var iframeArr=$container.find("iframe");//播放器包含iframe(ie8,9特殊处理的情况)
			var len=iframeArr.length;
			var tIframe;
			if(len>0){
			   for(var i=0;i<len;i++){
				  tIframe=iframeArr[i];
				  $(tIframe).css("height", "100%");
				  $(tIframe).trigger("sewiseIframeResize");
			   }
			}
			
			
			$("body").removeClass("sewiseFullScreen");
			$("body").css("overflow", defOverflow);
			var defStageW = $container.width();
			btnsWidth=calculateBtnWidth();
			defProgressWidth = parseInt(defStageW) - btnsWidth;
			if(defProgressWidth < 0){
				defProgressWidth = defProgressWidth + $playtime.width();
				$playtime.hide();
			}else{
				$playtime.show();
			}
			$controlBarProgress.css("width", defProgressWidth);
		};
		this.resize = function(){
			var defStageW = $container.width();
			//defStageHeight = $container.height();
			btnsWidth=calculateBtnWidth();
			defProgressWidth = parseInt(defStageW) - btnsWidth;
			if(defProgressWidth < 0){
				defProgressWidth = defProgressWidth + $playtime.width();
				$playtime.hide();
			}else{
				$playtime.show();
			}
			$controlBarProgress.css("width", defProgressWidth);
		};
		this.setPlayer=function(player){
			playerController=player;
		};
	};
	
})(window.Sewise,window.jQuery);

(function(sewise,$){
	/**
	 * 保存皮肤元素对象引用
	 * @name ElementObject : 皮肤肤元素对象.
	 * 
	 */
	var ElementObject = sewise.ElementObject = function(playerID,skinClass){
		var uiSelector="#"+playerID+" ."+skinClass+" .sewise-player-ui";
		this.$sewisePlayerUi = $(uiSelector);
		
		this.$container =this.$sewisePlayerUi.parent().parent();
		
		
		this.$video =null;
		
		this.$controlbar =  this.$sewisePlayerUi.find(".controlbar");
		this.$controlbarBtns=this.$sewisePlayerUi.find(".controlbar-btns");
		this.$playBtn = this.$sewisePlayerUi.find(".controlbar-btns-play");
		this.$pauseBtn = this.$sewisePlayerUi.find(".controlbar-btns-pause");
		this.$stopBtn = this.$sewisePlayerUi.find(".controlbar-btns-stop");
		this.$fullscreenBtn = this.$sewisePlayerUi.find(".controlbar-btns-fullscreen");
		this.$normalscreenBtn = this.$sewisePlayerUi.find(".controlbar-btns-normalscreen");
		this.$soundopenBtn = this.$sewisePlayerUi.find(".controlbar-btns-soundopen");
		this.$soundcloseBtn = this.$sewisePlayerUi.find(".controlbar-btns-soundclose");
		
		if(this.$sewisePlayerUi.find(".controlbar-btns-share").length>0)
		    this.$shareBtn = this.$sewisePlayerUi.find(".controlbar-btns-share");
		else
		    this.$shareBtn=null;
		if(this.$sewisePlayerUi.find(".controlbar-btns-live").length>0)
		    this.$liveBtn=this.$sewisePlayerUi.find(".controlbar-btns-live");
		else
		    this.$liveBtn=null;
		
		if(this.$sewisePlayerUi.find(".controlbar-volumeline-volume").get(0)){
		   this.$volumeline=this.$sewisePlayerUi.find(".controlbar-volumeline");
		   this.$volumelineVolume = this.$sewisePlayerUi.find(".controlbar-volumeline-volume");
		   this.$volumelineDragger = this.$sewisePlayerUi.find(".controlbar-volumeline-dragger");
		   this.$volumelinePoint = this.$sewisePlayerUi.find(".controlbar-volumeline-point");
		   if(this.$controlbarBtns.find(".controlbar-volumeline").length>0)
		      this.volumeline_hlayout=true;
		   else
		      this.volumeline_hlayout=false;//声音条垂直布局
		}else{
		   this.$volumeline=null;
		   this.$volumelineVolume=null;
		   this.$volumelineDragger=null;
		   this.$volumelinePoint=null;
		}
		
		this.$playtime = this.$sewisePlayerUi.find(".controlbar-playtime");
		
		if(this.$sewisePlayerUi.find(".controlbar-totaltime").get(0))
           this.$totaltime = this.$sewisePlayerUi.find(".controlbar-totaltime");//有些皮肤(比如vodFlowPlayer)有这个组件
        else
           this.$totaltime=null;
        if(this.$sewisePlayerUi.find(".controlbar-overtime").get(0)){
           this.$overtime = this.$sewisePlayerUi.find(".controlbar-overtime");//vodTangerine
           this.$overtimeText = this.$sewisePlayerUi.find(".controlbar-overtime-text");
           this.$overline=this.$sewisePlayerUi.find(".controlbar-overline");
           this.$nextBtn=this.$sewisePlayerUi.find(".controlbar-btns-next");
        }
        else{
           this.$overtime=null;
           this.$overline=null;
           this.$nextBtn=null;
        }
        if(this.$sewisePlayerUi.find(".controlbar-clarity-window").get(0))
        	this.$clarityWindowContainer=this.$sewisePlayerUi.find(".controlbar-clarity-window");
        else
            this.$clarityWindowContainer=null;
		this.$controlBarProgress = this.$sewisePlayerUi.find(".controlbar-progress");
		this.$progressPlayedLine = this.$sewisePlayerUi.find(".controlbar-progress-playedline");
		this.$progressPlayedPoint = this.$sewisePlayerUi.find(".controlbar-progress-playpoint");
		this.$progressLoadedLine = this.$sewisePlayerUi.find(".controlbar-progress-loadedline");
		this.$progressSeekLine = this.$sewisePlayerUi.find(".controlbar-progress-seekline");

		
		this.$logo = this.$sewisePlayerUi.find(".logo");
		this.$logoIcon = this.$sewisePlayerUi.find(".logo-icon");
		
		
		this.$topbar = this.$sewisePlayerUi.find(".topbar");
		this.$programTip= this.$sewisePlayerUi.find(".topbar-program-tip");
		this.$programTitle= this.$sewisePlayerUi.find(".topbar-program-title");
		this.$topbarClock = this.$sewisePlayerUi.find(".topbar-clock");

		
		this.$buffer = this.$sewisePlayerUi.find(".buffer");
		this.$bufferTip = this.$sewisePlayerUi.find(".buffer-text-tip");
		this.$bufferText=this.$sewisePlayerUi.find(".buffer-text-bufferPt");
		
		this.$bigPlayBtn = this.$sewisePlayerUi.find(".big-play-btn");
        
        //清晰度切换按钮
        if(this.$sewisePlayerUi.find(".clarity-switch-btn").get(0)){
           this.$claritySwitchBtn = this.$sewisePlayerUi.find(".clarity-switch-btn");
		   this.$clarityBtnText = this.$sewisePlayerUi.find(".clarity-btn-text");
        }else{
           this.$claritySwitchBtn=null;
		   this.$clarityBtnText=null; 
        }
        if(this.$controlbarBtns.find(".controlbar-progress").length>0)
           this.progressBarIsUp=false;//进度条独立一行布局
        else
           this.progressBarIsUp=true;//进度条和按钮在一条直线上
        
		this.defStageWidth = this.$container.width();
		this.defStageHeight = this.$container.height();

		//获取初始时container的相对偏移位置
		this.defLeftValue = parseInt(this.$container.css("left"));
		this.defTopValue = parseInt(this.$container.css("top"));
		this.defOffsetX = this.$container.get(0).getBoundingClientRect().left;
		this.defOffsetY = this.$container.get(0).getBoundingClientRect().top;
		this.defOverflow = $("body").css("overflow");
		
		this.getMedia=function(){
			if(this.$container.find("video").length>0)
		      this.$video =this.$container.find("video").get(0);
		    else
		      this.$video =this.$container.find("audio").get(0);
		};
	};
	
})(window.Sewise,window.jQuery);

(function(sewise,$){
	/**
	 * Constructor.
	 * @name LogoBox: logo层对象.
	 * 
	 */
	var LogoBox = sewise.LogoBox = function(elementObject){
		var $logoIcon = elementObject.$logoIcon;

		$logoIcon.click(function(e){
			e.originalEvent.stopPropagation();
		});
		/////////////////////////////
		var logoLink = "http://www.sewise.com/";
		this.setLogo = function(url){
			$logoIcon.css("background", "url(" + url + ") 0px 0px no-repeat");
			$logoIcon.attr("href", logoLink);
		};
		this.setLink = function(url){
			logoLink = url;
			$logoIcon.attr("href", logoLink);
		};
		
	};
	
})(window.Sewise,window.jQuery);

(function(sewise,$){
	/**
	 * Constructor.
	 * @name PlayerSkinLoader : 播放器皮肤文件加载对象.
	 * 
	 */
	var PlayerSkinLoader = sewise.PlayerSkinLoader = function(container, skinObj){
		
		var skinCssPath = skinObj.skinCssPath;
		var skinHtmlPath = skinObj.skinHtmlPath;
		var skinHtmlJsPath = skinObj.skinHtmlJsPath;
        var that=this;
		var skinCssLoad=false;
		var skinLocalLoad=false;
		//加载皮肤资源
		this.load=function(skinClass){
		   container.addClass(skinClass);//用此属性区别不同的播放器皮肤
		   sewise.Utils.loader.loadCssFile(skinCssPath,skinCssLoadHandle,skinLoadedError);
		   	
		};
		
		function skinCssLoadHandle(){
			if(!skinCssLoad){
			   skinCssLoad=true;
			   loadSkinFromGlobal();
			}
		}
		function skinLoadedError(){
			alert("skinLoadedError");
			//SewisePlayer.CommandDispatcher.dispatchEvent({type: SewisePlayer.Events.PLAYER_SKIN_LOADED_ERROR});
		}
		function loadSkinFromGlobal(){
			var body = document.getElementsByTagName("body")[0];
			var iframe = document.createElement("iframe");
			iframe.style.display = "none";
			iframe.src =  skinHtmlPath;
			iframe.onload = iframe.onreadystatechange = function(){
				try{
					if(iframe === null) return;
					var skin;
					if(iframe.contentWindow.document.getElementsByClassName){
					   skin= iframe.contentWindow.document.getElementsByClassName("sewise-player-ui")[0];
					}
				    else{
				       skin=getElementByClassForIE("sewise-player-ui",iframe.contentWindow.document)[0];
				    }
					var skinDom = document.createElement("div");
					container.append(skinDom);
					skinDom.outerHTML = skin.outerHTML;
					
			        $(iframe).remove();
			        iframe = null;
			        that.fireEvent(sewise.SewisePlayerEvent.PLAYER_SKIN_LOADED);
				}catch(e){
					console.log("本地皮肤加载"+e);
					$(iframe).remove();
					if(!skinLocalLoad){
					  skinLocalLoad=true;
					  loadSkinFromLocal();
					}
				}
			};
			body.appendChild(iframe);
		}
		/**
		 * ie8的getElementsByClassName方法
		 * @param {String} cls  className
		 * @param {Object} ele
		 */
        function getElementByClassForIE(cls,ele){
             var els=ele.getElementsByTagName('*');
             var ell=els.length;
             var elements=[];
             for(var n=0;n<ell;n++){
                    var oCls=els[n].className||'';
                    if(oCls.indexOf(cls)<0) continue;
                    oCls=oCls.split(/\s+/);
                    var oCll=oCls.length;
                    for(var j=0;j<oCll;j++){
                        if(cls==oCls[j]){
                            elements.push(els[n]);
                            break;
                        }
                    }
            }
            return elements;
        }
       
		
		function loadSkinFromLocal(){
			sewise.Utils.loader.loadJsFile("override", skinHtmlJsPath, localSkinLoadCallback, localSkinLoadError);
		}
		function localSkinLoadCallback(){
			var skin = window.SewisePlayerSkin.localSkin;
			
			container.append(parseToDOM(skin)[0]);
			that.fireEvent(sewise.SewisePlayerEvent.PLAYER_SKIN_LOADED);
		}
		/**
		 * 检查JS皮肤文件是否正常加载，用于解决IE加载CSS文件失败时无法触发onerror事件，
		 * 从而造成的前面skinLoadedError方法没有执行。
		 */
		function localSkinLoadError(){
			//console.log("localSkinLoadError");
			skinLoadedError();
		}
		function parseToDOM(domStr){
            var div = document.createElement("div");
            if(typeof domStr == "string"){
                div.innerHTML = domStr;
            }
            return div.childNodes;
        }
        
        
	};
	$.extend(PlayerSkinLoader.prototype,sewise.Event);
})(window.Sewise,window.jQuery);

(function(sewise,$){
	/**
	 * Constructor.
	 * @name ClarityWindow : 多分辨率切换面板.
	 * 
	 */
	
	var ClarityWindow = sewise.ClarityWindow = function(elementObject,skinType){
		var $container = elementObject.$container;
		var isTangerineSkinType=(skinType===sewise.GlobalConstant.SKIN_TYPE_TANGERINE?true:false);
		var that = this;
		var mainPlayer;
		var controlBar;
		var clarityWindow;
        var radiosDom = "";
		var clarityPanelDom = "";
		var clarityArray;
		var clarityLen;
		var currentCheckIndex = 0;
		var radioCheckIndex = 0;
        var orginCWinConH=0;
		///////////////////////////
		this.setPlayer = function(mPlayer){
			mainPlayer = mPlayer;
		};
		this.setControlBar = function(controlBarObj){
			controlBar = controlBarObj;
		};
		this.initialClarities = function(levels){
			radiosDom="";
			clarityPanelDom="";
			currentCheckIndex = 0;
		    radioCheckIndex = 0;
			if(isTangerineSkinType){
				orginCWinConH=elementObject.$clarityWindowContainer.height();
				clarityWindowTwo(levels);//多码率窗口2
			}else{
				clarityWindowOne(levels);//多码率窗口1
			}

		};
		this.toggle = function(){
			if(!isTangerineSkinType){
			 elementObject.$clarityWindowContainer.toggle();
			 elementObject.$clarityWindowContainer.find("[name = radio_clarity]").get(currentCheckIndex).checked = true;
			 radioCheckIndex = currentCheckIndex;
			}
		};
		this.show=function(){
			if(elementObject.$clarityWindowContainer){
			  if(isTangerineSkinType&&clarityLen<=1) return;
			  elementObject.$clarityWindowContainer.show();
			}
		};
		this.hide=function(){
			if(elementObject.$clarityWindowContainer)
			  elementObject.$clarityWindowContainer.hide();
		};
        function clarityWindowOne(levels){
        	//var claritySettingStr = sewise.SkinUtils.language.getString("claritySetting");
			//var clarityOkStr = sewise.SkinUtils.language.getString("clarityOk");
			//var clarityCancelStr = sewise.SkinUtils.language.getString("clarityCancel");

			//初始化多码率, name, videoUrl, id, selected.
			clarityArray = levels;
			clarityLen = clarityArray.length;
			for(var i = 0; i < clarityLen; i ++){
				var checked;
				if(clarityArray[i].selected){
					checked = ' checked = "checked" ';
					currentCheckIndex = i;
					controlBar.updateClarityBtnText(clarityArray[i].name);
				}else{
					checked = " ";
				}
				
				radiosDom += '<input  type="radio" name="radio_clarity"' + checked + '"value="' + clarityArray[i].name + '">' + clarityArray[i].name + "\n";
			}
				
			var radioGroup=elementObject.$clarityWindowContainer.find(".clarity-radios-group");
			radioGroup.empty();
			radioGroup.html(radiosDom);

			elementObject.$clarityWindowContainer.click(function(e){
				if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			    else
			      e.originalEvent.cancelBubble=true;
			});
			elementObject.$clarityWindowContainer.find(".clarity-box").click(function(e){
				if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			    else
			      e.originalEvent.cancelBubble=true;
			});
			elementObject.$clarityWindowContainer.find("[name = confirm_clarity]").click(function(e){
				if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			    else
			      e.originalEvent.cancelBubble=true;
				elementObject.$clarityWindowContainer.hide();
				if(currentCheckIndex == radioCheckIndex) return;
				currentCheckIndex = radioCheckIndex;
				controlBar.updateClarityBtnText(clarityArray[currentCheckIndex].name);
            	mainPlayer.changeClarity({ 
            								name: clarityArray[currentCheckIndex].name,
            	  						   	videoUrl: clarityArray[currentCheckIndex].videoUrl,
            	  						   	id: clarityArray[currentCheckIndex].id,
            	  							selected: true
            	  						});
            });
            elementObject.$clarityWindowContainer.find("[name = cancel_clarity]").click(function(e){
            	if(e.originalEvent.stopPropagation)
			       e.originalEvent.stopPropagation();
			    else
			       e.originalEvent.cancelBubble=true;
            	elementObject.$clarityWindowContainer.hide();
            	radioCheckIndex = currentCheckIndex;
            	
            });
            elementObject.$clarityWindowContainer.find("[name = radio_clarity]").click(function(e){
            	if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			   else
			      e.originalEvent.cancelBubble=true;
            	radioCheckIndex = $(e.target).index();
            });
       }
       function clarityWindowTwo(levels){
       	   //初始化多码率, name, videoUrl, id, selected.
       	   var liStr="";
			clarityArray = levels;
			clarityLen = clarityArray.length;
			 
			for(var i = 0; i < clarityLen; i ++){
				if(clarityArray[i].selected){
					currentCheckIndex = i;
					controlBar.updateClarityBtnText(clarityArray[i].name);
				}else{
					
				}
			   liStr+="<li name='"+i+"'>"+clarityArray[i].name+"</li>";
			}
			if(clarityWindow)
			   clarityWindow.remove();
			elementObject.$clarityWindowContainer.height(clarityLen/3*orginCWinConH);
			clarityWindow = $('<ul></ul>');
			clarityWindow.html(liStr);
			clarityWindow.appendTo(elementObject.$clarityWindowContainer);
			clarityWindow.find("li").click(function(e){
				if(e.originalEvent.stopPropagation)
			      e.originalEvent.stopPropagation();
			    else
			      e.originalEvent.cancelBubble=true;
			    var sindex=parseInt(e.target.attributes.name.value);
			    if(sindex==currentCheckIndex) return;
			    currentCheckIndex=sindex;
			    controlBar.updateClarityBtnText(clarityArray[sindex].name);
			    mainPlayer.changeClarity({ 
            								name: clarityArray[currentCheckIndex].name,
            	  						   	videoUrl: clarityArray[currentCheckIndex].videoUrl,
            	  						   	id: clarityArray[currentCheckIndex].id,
            	  							selected: true
            	  						});
			});
       }
		
	};
	
})(window.Sewise,window.jQuery);

(function(sewise){
	/*
	 * 皮肤控制器类
	 * Author:keyun
	 * Date:2015/9/28
	 */
	var SkinController=sewise.SkinController=function(playerID,skinClass,globalParam){
		this.globalParam=globalParam;
		var mainPlayer;
		var isLive=globalParam.server==sewise.GlobalConstant.LIVE?true:false;
		var elementObject = new sewise.ElementObject(playerID,skinClass);
		var elementLayout = new sewise.ElementLayout(elementObject,globalParam.parameObj);
		var logoBox = new sewise.LogoBox(elementObject);
		var topBar = new sewise.TopBar(elementObject,globalParam.server);
		var clarityWindow=null;
		if(elementObject.$claritySwitchBtn)
		  	clarityWindow = new sewise.ClarityWindow(elementObject,globalParam.parameObj.skinType);
		var controlBar = new sewise.ControlBar(elementObject, elementLayout, topBar,clarityWindow,globalParam);
		//获取视频组件
		this.getMedia=function(){
			elementObject.getMedia();
		    //这里设置video,audio不接受鼠标事件，防止android 设备下点击video时切换播放状态，以避免和 container的click动作发生冲突。
		    if(elementObject.$video)
		      $(elementObject.$video).css("pointer-events", "none");
		};
		//设置播放控制核心对象
		this.player = function(mPlayer){
			mainPlayer = mPlayer;
			controlBar.setPlayer(mainPlayer);
			elementLayout.setPlayer(mainPlayer);
			if(clarityWindow)
			   clarityWindow.setPlayer(mainPlayer);
		};
		this.started = function(){
			controlBar.hideBuffer();
			controlBar.started();
		};
		this.paused = function(){
			controlBar.paused();
		};
		this.stopped = function(){
			controlBar.stopped();
		};
		this.duration = function(totalTimes){
			controlBar.setDuration(totalTimes);
		};
		this.timeUpdate = function(currentTime){
			controlBar.timeUpdate(currentTime);
			if(isLive)
			  topBar.setLiveClock(mainPlayer.playTime());
		};
		//播放时间偏移值
		this.setPlayTimeOffset=function(sTime,eTime){
			controlBar.setPlayTimeOffset(sTime,eTime);
		};
		this.bufferProgress= function(pt){
//			if(isLive){
//			  if(pt>0)
//			    controlBar.showBuffer();
//			}
//			else
//			  controlBar.showBuffer();
			controlBar.bufferProgress(pt);
		};
		this.loadedProgress = function(loadedPt){
			controlBar.loadProgress(loadedPt);
		};
		this.loadedOpen = function(){
			controlBar.showBuffer();
		};
		this.loadedComplete = function(loadedPt){
			controlBar.hideBuffer();
		};
		
		this.programTitle = function(title){
			topBar.setTitle(title);
		};
		this.logo = function(url){
			logoBox.setLogo(url);
		};
		this.title=function(value){
			topBar.setTitle(value);
		};
		this.volume = function(value){
			//重置音量UI状态。
			controlBar.initVolume(value);
		};
		this.muted=function(bool){
			controlBar.muted(bool);
		};
		this.initialClarity = function(levels){
			if(clarityWindow){
			  clarityWindow.setControlBar(controlBar);
			  //初始化多码率, name, videoUrl, id, selected.
			  clarityWindow.initialClarities(levels);
			}
		};
		
		this.clarityBtnDisplay = function(state){
			if(state != "enable"){
				controlBar.hideClarityBtn();
			}
		};
		this.timeDisplay = function(state){
			if(state != "enable"){
				controlBar.hideTopbarClock();
			}
		};
		this.controlBarDisplay = function(state){
			//重置controlBar显示状态。
			if(state != "enable"){
				controlBar.hide2();
			}
		};
		this.topBarDisplay = function(state){
			//重置topBar显示状态。
			if(state != "enable"){
				topBar.hide2();
				controlBar.updateClarityBtnPosition();
			}
		};
		this.bigPlayBtnDisplay=function(state){
			if(state != "enable"){
				controlBar.hideBigPlayBtn();
			}
		};
		this.customDatas = function(data){
			if(data){
				if(data.logoLink){
					logoBox.setLink(data.logoLink);
				}
			}
			//console.log(data);
		};
		this.fullScreen = function(){
			controlBar.fullScreen();
		};
		this.normalScreen = function(){
			controlBar.noramlScreen();
		};
		
		
		this.lang = function(lan){
			//en_US, zh_CN
			sewise.SkinUtils.language.init(lan);
			controlBar.initLanguage();
			topBar.initLanguage();
		};
		//直播跳转
		this.refreshTimes = function(startTime, endTime){
			controlBar.refreshTimes(startTime, endTime);
		};
		/**
		 * @description 设置屏幕的单击和双击事件
		 */
		this.setScreenEvent=function(){
			controlBar.setScreenEvent();
		};
		//获取进度条中用于seek的组件
		this.getProgressSeekline=function(){
			return controlBar.getProgressSeekline();
		};
		/**
		 * 强制刷新皮肤页面布局 
		 */
		this.forceRefreshSize=function(){
			controlBar.forceRefreshSize();
		};
		/**
		 * 获取皮肤逻辑控制对象
		 */
		this.getControlBar=function(){
			return controlBar;
		};
		this.reset=function(){
			controlBar.reset();
		};
	};
	
})(window.Sewise);





(function(sewise,$){
	/*
	 * 皮肤上部标题层
	 * Author:keyun
	 * Date:2015/9/28
	 */
	var TopBar = sewise.TopBar = function(elementObject,server){
		var $topbar = elementObject.$topbar;
		var $programTip = elementObject.$programTip;
		var $programTitle = elementObject.$programTitle;
		var $topbarClock = elementObject.$topbarClock;

		var titleTip = sewise.SkinUtils.language.getString("titleTip");
		$programTip.text(titleTip);
        
        function setClock(){
			var timeString = sewise.SkinUtils.stringer.dateToTimeString();
			$topbarClock.text(timeString);
		 }	
//      if(server==sewise.GlobalConstant.VOD){
//         var interval = setInterval(setClock, 1000);
//      }
	
		this.setLiveClock = function(date){
			//var timeString = sewise.SkinUtils.stringer.dateToTimeString(date);
			//$topbarClock.text(timeString);
		};
		this.setTitle = function(title){
			$programTitle.text(title);
		};
		this.show = function(){
			$topbar.css("visibility", "visible");
		};
		this.hide = function(){
			$topbar.css("visibility", "hidden");
		};
		this.hide2 = function(){
			$topbar.hide();
		};
		this.initLanguage = function(){
			var titleTip = sewise.SkinUtils.language.getString("titleTip");
			$programTip.text(titleTip);
		};
		
		
	};
	
})(window.Sewise,window.jQuery);

(function(win,$){
	/*
	 * 播放器主类SewisePlayer
	 */
	
	var SewisePlayer=win.Sewise.SewisePlayer=function(config){
		//外部传入的配置参数
		this.config=config;
		//包含video和皮肤ui的容器
		this.playerContainer=null;
		//video的父容器
		this.videoContainer=null;
		//播放器皮肤的父容器
		this.skinContainer=null;
		//外部传入的参数信息
		this.config=config;
		//播放器插件信息
		this.plugins=null;
		//时间处理函数是否打开
		this.timeupdateOpen=true;
		//全局参数实例对象
		this.globalParams=new win.Sewise.GlobalParams(config);
		this.globalParams.init();
		
		this.isLive=(this.globalParams.server==win.Sewise.GlobalConstant.LIVE?true:false);
		//播放器ID
		this.playerID="SewisePlayer"+SewisePlayer.guid++;
		//判断使用flash还是html5播放器
		var playerType = this.globalParams.playerType;
		
		//播放控制器实例对象
		this.playController=new win.Sewise.PlayController(this.globalParams,this.playerID,this);
		
	};
	SewisePlayer.fn=SewisePlayer.prototype;
	//扩展SewisePlayer类属性
    $.extend(SewisePlayer,{
    	guid:0,
    	supportHls:function(){
	 			return window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
	 		}()
	 });
    //扩展实例对象属性
    $.extend(SewisePlayer.fn,win.Sewise.Event);
	/*
	 * 启动播放器
	 */
	SewisePlayer.fn.startup=function(){
		var root;
		if(this.config.elid)//传config对象参数方式
		{
		   var elId;
		   var elType=typeof(this.config.elid);
		   if(elType==="object"){
		   	 root=$(this.config.elid);
		   }else{
		     elId="#"+this.config.elid;
		     root=$(elId);
		   }
		}
		else{//嵌入SewisePlayer.js的方式
		   var playerRoot=this.config.scriptElement.parentNode;
		   root=$(playerRoot);
		}
		//播放器插入到指定根容器
		root.append(SewisePlayer.template);
		
		this.playerContainer=root.find(".sewiseplayer-container");
		this.videoContainer=root.find(".sewiseplayer-video");
		this.skinContainer=root.find(".sewiseplayer-skin");
		
		//增加ID属性，当一个页面有多个播放器时，用此属性区分
		this.playerContainer.attr("id",this.playerID);
		//加载必须的css文件
		win.Sewise.Utils.loader.loadCssFile(win.Sewise.localPath+"css/sewiseplayer.css");
		
		this.playController.startup(this.videoContainer,this.skinContainer);
	};
	 
	SewisePlayer.template ='<div class="sewiseplayer-container">'+
                 '<div class="sewiseplayer-video"></div>'+
                '<div class="sewiseplayer-skin"></div>'+
                '</div>';
         //oncontextmenu="return false"
    //-------------------------------对外暴露的API接口-----------------------------------------------------
    /*
     * 播放
     */
    SewisePlayer.fn.play = function(){
		this.playController.play();
	};
	/**
	 * 暂停
	 */
	SewisePlayer.fn.pause = function(){
		this.playController.pause();
	};
	/*
	 * 停止
	 */
	SewisePlayer.fn.stop = function(){
		this.playController.stop();
	};
	
	/*
	 * 跳转到指定时间播放,
	 * @param time 
	 * time类型点播时为数值表示要跳转到的位置（秒），直播时为字符串表示要跳转到的日期（如：’20110503123456’）
	 */
	SewisePlayer.fn.seek = function(time){
		this.playController.seek(time);
	};
	
	/*
	 * 设置声音
	 * @param volume 值0-1
	 */
	SewisePlayer.fn.setVolume = function(volume){
		this.playController.setVolume(volume);
	};
	/*
	 * 设置是否静音
	 * @param bool 值true,false
	 */
	SewisePlayer.fn.muted = function(bool){
		this.playController.muted(bool);
	};
	/*
	 * 根据节目id播放视频
	 * @param programId 节目ID
	 * @param startTime 点播时值为(秒)，直播时值为毫秒
	 * @param autostart 是否自动播放
	 * @param serverPath 获取数据的地址
	 */
	SewisePlayer.fn.playProgram = function(programId, startTime, autostart,serverPath){
		if(this.isLive)
		   this.playController.playChannel(programId, startTime, autostart,serverPath);
		else
		   this.playController.playProgram(programId, startTime, autostart,serverPath);
	};
	/*
	 * 根据视频地址播放
	 * @param videoUrl 视频地址
	 * @param title 节目标题
	 * @param startTime 点播时为数值表示开始播放的位置（秒）。 直播时为字符串表示开始播放位置的日期:’20110503123456’
	 * @param autostart 是否自动播放true false
	 */
	SewisePlayer.fn.toPlay = function(videoUrl, title, startTime, autostart){
		if(this.isLive)
		   this.playController.toLivePlay(videoUrl, title, startTime, autostart);
		else
		   this.playController.toPlay(videoUrl, title, startTime, autostart);
	};
	/*
	 * 根据视频地址播放,根据参数决定是否编码视频地址
	 * @param videoUrl 视频地址
	 * @param title 节目标题
	 * @param startTime 点播时为数值表示开始播放的位置（秒）。 直播时为字符串表示开始播放位置的日期:’20110503123456’
	 * @param autostart 是否自动播放true false
	 * @param encodeurl 是否编码视频地址true false
	 */
	SewisePlayer.fn.toPlayComplexUrl = function(videoUrl, title, startTime, autostart,encodeurl){
		if(this.isLive)
		   this.playController.toLivePlay(videoUrl, title, startTime, autostart);
		else
		   this.playController.toPlayComplexUrl(videoUrl, title, startTime, autostart,encodeurl);
	};
	
	/*
	 * 更新多清晰度播放列表
	 */
	SewisePlayer.fn.updateVideosjsonurl = function(jsonObj){
		if(!this.isLive){
		   this.playController.updateVideosjsonurl(jsonObj);	
		}
	};
	/*
	 * 返回视频总时长(秒)
	 */
	SewisePlayer.fn.duration = function(){
		return this.playController.duration();
	};
	/*
	 * 返回当前播放时间位置、日期
	 * 点播返回当前视频播放到的位置（秒），直播返回当前视频播放到的时间点（日期）
	 */
	SewisePlayer.fn.playTime = function(){
		return this.playController.playTime();
	};
	/*
	 * 返回视频缓冲进度
	 */
//	SewisePlayer.fn.bufferProgress = function(){
//		return this.playController.bufferPt();
//	};
	/*
	 * 获取播放器根容器
	 */
	SewisePlayer.fn.getPlayerContainer = function(){
		return this.playerContainer.get(0);
	};
	/*
	 * 获取视频容器
	 */
	SewisePlayer.fn.getVideoContainer = function(){
		return this.videoContainer.get(0);
	};
	/*
	 * 获取皮肤容器
	 */
	SewisePlayer.fn.getSkinContainer = function(){
		return this.skinContainer.get(0);
	};
	/*
	 * 获取视频元素对象
	 */
	SewisePlayer.fn.getVideo = function(){
		return this.playController.getMedia();
	};
	/*
	 * 获取音频元素对象
	 */
	SewisePlayer.fn.getAudio = function(){
		return this.playController.getMedia();
	};
	/*
	 * 清除视频
	 */
	SewisePlayer.fn.clearVideo = function(){
		this.playController.clearMedia();
	};
	/*
	 * 清除音频
	 */
	SewisePlayer.fn.clearAudio = function(){
		this.playController.clearMedia();
	};
	/**
	 * 销毁播放器
	 */
	SewisePlayer.fn.dispose = function(){
		this.playController.dispose();
	};
	/*
	 * 设置播放速率(只支持html5)
	 * 1.0 正常速度
     * 0.5 半速（更慢）
     * 2.0 倍速（更快）
     * -1.0 向后，正常速度
     * -0.5 向后，半速
	 */
	SewisePlayer.fn.setPlaybackRate = function(value){
		this.playController.setPlaybackRate(value);
	};
	/*
	 * 获取播放速率(只支持html5)
	 */
	SewisePlayer.fn.getPlaybackRate = function(){
		return this.playController.getPlaybackRate();
	};
	/**
	 * 强制刷新皮肤页面布局
	 */
	SewisePlayer.fn.forceRefreshSkinSize=function(){
		this.playController.skinController.forceRefreshSize();
	};

	/*
	 * 直播时设置直播时间跨度，点播时设置总的播放时间
	 * value类型为数值，直播时表示播放进度条上规化的时长
	 * 默认值3600秒
	 */
	SewisePlayer.fn.setDuration = function(value){
		this.playController.setDuration(value);
	};
	/**
	 * 开启全屏
	 */
	SewisePlayer.fn.fullScreen= function(){
		this.playController.skinController.fullScreen();
	};
	/**
	 * 退出全屏
	 */
	SewisePlayer.fn.normalScreen= function(){
		this.playController.skinController.normalScreen();
	};
	/**
	 * 是否锁定屏幕
	 * @param {Object} boo 
	 * true,false
	 */
	SewisePlayer.fn.lockScreen = function(boo){
		this.playController.lockScreen(boo);
	};
	/**
	 * 获取皮肤逻辑控制对象
	 */
	SewisePlayer.fn.getControlBar=function(){
	    return this.playController.skinController.getControlBar();
	};
	//------------------------点、直播专用接口方法-------------------------
	/* 点播方法
	 * 切换清晰度播放
	 * @param clarity={videoUrl："http://192.168.1.1/test.mp4"}
	 */
	SewisePlayer.fn.changeClarity = function(clarity){
		this.playController.changeClarity(clarity);
	};
	/** 
	 * 点播方法
	 * 设置播放开始时间和结束时间
	 */
	SewisePlayer.fn.setPlayTimeOffset=function(startTime,endTime){
		this.playController.skinController.setPlayTimeOffset(startTime,endTime);
	};
	/**
	 * 直播方法
	 * 回到直播
	 */
	SewisePlayer.fn.live = function(){
		this.playController.live();
	};
	/* 直播方法
	 * 返回直播播放开始的日期时间
	 */
	SewisePlayer.fn.liveTime = function(){
		return this.playController.liveTime();
	};
	
	
	/*************如果是嵌入方式，首先解析参数，生成config对象****************************************/
	var fileNames = ["SewisePlayer.js", "sewise.player.min.js"];
	var paramobj = win.Sewise.Utils.getParameters(fileNames);
	if(!win.Sewise.Utils.object.isEmpty(paramobj)&&win.Sewise.Utils.object.paramsLength(paramobj)>1){
		//实例化播放器，并启动
		var player=new win.Sewise.SewisePlayer(paramobj);       
	    player.startup();
	    win.SewisePlayer=player;//全局引用
	}
	/**********************************************************/
})(window,window.jQuery);
