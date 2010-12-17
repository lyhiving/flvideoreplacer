var flvideoreplacerListener = {

    init: function() {
	var appcontent = document.getElementById("appcontent"); // browser
	if(appcontent)
	appcontent.addEventListener("DOMContentLoaded", flvideoreplacerListener.onPageLoad, true);
    },

    onPageLoad: function(aEvent) {

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event

	//declare page url
	var sourceurl = doc.location.href;

	if((sourceurl.match("youtube") && sourceurl.match("watch") && sourceurl.match("v=") && !sourceurl.match("html5=True")) || sourceurl.match(/vimeo.com\/\d{1,8}/)){

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    //fetch prefs
	    var replacemethod = this.prefs.getCharPref("method");
	    var preferwebm = this.prefs.getBoolPref("preferwebm");

	    if(sourceurl.match(/youtube/)){

		//get Youtube Prefs
		var replacevideo = this.prefs.getBoolPref("youtube");

		if(replacevideo == true){

		    //fetch video ID from url
		    var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");

		    if(replacemethod == "standalone" && !sourceurl.match(/nocookie/)){

			//redirect to nocookie domain
			doc.location.href = "http://www.youtube-nocookie.com/watch?v="+videoid;

		    }else if(replacemethod !== "standalone" && sourceurl.match(/nocookie/)){

			//redirect to regular domain
			doc.location.href = "http://www.youtube.com/watch?v="+videoid;

		    }else if(preferwebm == true && (replacemethod == "embedded" || replacemethod == "prompt") && !sourceurl.match(/nocookie/)){

			//redirect to webm page
			var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
			var replacewebm = false;
			try{
			    var webmRequest = new XMLHttpRequest();
			    webmRequest.open('GET', webmurl, false);
			    webmRequest.onreadystatechange=function(){
				if (webmRequest.readyState == 4 && webmRequest.status == 200) {
				    var webmsource = webmRequest.responseText;
				    var newlinewebm = webmsource.split("\n");
				    for(var i=0; i< newlinewebm.length; i++){
					//match patterns
					var html5player = /html5-player/.test(newlinewebm[i]);
					if (html5player == true) {
					    var replacewebm = true;
					}
				    }
				    if(replacewebm == true){
					flvideoreplacerListener.webmReplacer(aEvent);
				    }else{
					flvideoreplacerListener.pluginReplacer(aEvent);
				    }
				}
			    }
			    webmRequest.send(null);
			}catch(e){
			    flvideoreplacerListener.pluginReplacer(aEvent);
			}
		    }else{
			flvideoreplacerListener.pluginReplacer(aEvent);
		    }
		}
	    }

	    if(sourceurl.match(/vimeo\.com/)){
		//get Vimeo Prefs
		var replacevideo = this.prefs.getBoolPref("vimeo");
		if(replacevideo == true){
		    flvideoreplacerListener.pluginReplacer(aEvent);
		}
	    }
	}
    },

    pluginReplacer: function(aEvent) {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//fetch common preferences
	var replacemethod = this.prefs.getCharPref("method");
	var mimetype = this.prefs.getCharPref("mimetype");
	var autoplay = this.prefs.getBoolPref("autoplay");
	var prefermp4 = this.prefs.getBoolPref("prefermp4");
	var newmimetype = mimetype;
	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var original = strbundle.getString("original");

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
	//declare page url
	var sourceurl = doc.location.href;
	//declare the video should not be replaced
	var replacevideo = false;

	if(sourceurl.match(/youtube/)){

	    //declare element to be replaced
	    var testelement = doc.getElementById('movie_player');
	    var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");

	    if (testelement != null) {

		var youtubequality = this.prefs.getCharPref("youtubequality");

		//declare youtube videos should not be replaced
		var replaceyoutube = false;

		//fetch page html content
		var pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
		var newline = pagecontent.split("\n");

		for(var i=0; i< newline.length; i++){

		    //match patterns
		    var matchswfConfig = /var swfConfig/.test(newline[i]);

		    if (matchswfConfig == true) {

			//declare video uality based on user settings and video availability
			var fmt = "18";

			if (youtubequality == "LOW"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				var fmt = "5";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				var fmt = "18";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				var fmt = "34";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				var fmt = "35";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if(prefermp4 == true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    var replaceyoutube = true;
				    if(mimetype == "autodetect"){
					var newmimetype = "video/mp4";
				    }
				}
			    }
			}

			if (youtubequality == "MEDIUM"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				var fmt = "5";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				var fmt = "18";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				var fmt = "34";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				var fmt = "35";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if(prefermp4 == true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    var replaceyoutube = true;
				    if(mimetype == "autodetect"){
					var newmimetype = "video/mp4";
				    }
				}
			    }
			    if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				var fmt = "22";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			}

			if (youtubequality == "HIGH"){

			    if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
				var fmt = "5";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				var fmt = "18";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			    if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				var fmt = "34";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				var fmt = "35";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "application/x-flv";
				}
			    }
			    if(prefermp4 == true){
				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				    var replaceyoutube = true;
				    if(mimetype == "autodetect"){
					var newmimetype = "video/mp4";
				    }
				}
			    }
			    if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				var fmt = "22";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			    if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
				var fmt = "37";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*37\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			    if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
				var fmt = "38";
				var videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*38\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
				var replaceyoutube = true;
				if(mimetype == "autodetect"){
				    var newmimetype = "video/mp4";
				}
			    }
			}

			if (replaceyoutube == true){

			    //declare player params
			    var videowidth = "100%";
			    var videoheight = "100%";
			    var videoelement = "movie_player";
			    //declare the video should be replaced
			    var replacevideo = true;
			    //declare strings to be used by extension incompatibility check
			    var aSite = "YouTube";
			    var aString = "youtube";
			    //set file mime type
			    if(mimetype == "autodetect"){
				this.prefs.setCharPref("filemime",newmimetype);
			    }else{
				this.prefs.setCharPref("filemime",mimetype);
			    }
			}
		    }
		}
	    }
	}
	if(sourceurl.match(/vimeo\.com/)){

	    //fetch video ID from url
	    var videoid = sourceurl.replace(/.*\//g, "");
	    //declare element to be replaced
	    var videoelement = "meat";
	    var testelement = doc.getElementById(videoelement);

	    if (testelement != null) {

		var signature = false;
		var signature_expires = false;

		//declare xml file with authentication data to be downloaded
		var xmlsource = "http://vimeo.com/moogaloop/load/clip:"+videoid;

		//get xml document content
		var req = new XMLHttpRequest();  
		req.open('GET', xmlsource, false);   
		req.send(null);  
		if(req.status == 200) {//match if data has been downloaded and execute function

		    //read lines
		    var pagecontent = req.responseText;
		    var newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){

			//match patterns
			var matchrequest_signature = /\<request_signature\>/.test(newline[i]);
			var matchrequest_signature_expires = /\<request_signature_expires\>/.test(newline[i]);

			if (matchrequest_signature == true) {

			    //replace unneeded characters and declare new value
			    var request_signature = newline[i].replace(/\<request_signature\>/, "");
			    var request_signature = request_signature.replace(/\<\/request_signature\>/, "");
			    var request_signature = request_signature.replace(/\s/g, "");
			    //declare the video should be replaced
			    var signature = true;
			}

			if (matchrequest_signature_expires == true) {

			    //replace unneeded characters and declare new value
			    var request_signature_expires = newline[i].replace(/\<request_signature_expires\>/, "");
			    var request_signature_expires = request_signature_expires.replace(/\<\/request_signature_expires\>/, "");
			    var request_signature_expires = request_signature_expires.replace(/\s/g, "");
			    //declare the video should be replaced
			    var signature_expires = true;
			}
		    }

		    if(signature == true && signature_expires == true){

			//declare player params
			var videowidth = "640";
			var videoheight = "384";
			var videourl = "http://vimeo.com/moogaloop/play/clip:"+videoid+"/"+request_signature+"/"+request_signature_expires+"/?q=sd";
			var videoelement = "meat";
			//declare the video should be replaced
			var replacevideo = true;
			//declare strings to be used by extension incompatibility check
			var aSite = "Vimeo";
			var aString = "vimeo";
			//declare auto selected mime type
			if(mimetype == "autodetect"){
			    var newmimetype = "video/mp4";
			}
			//declare file mime
			if(mimetype == "autodetect"){
			    this.prefs.setCharPref("filemime",newmimetype);
			}else{
			    this.prefs.setCharPref("filemime",mimetype);
			}
		    }
		}
	    }
	}

	//**********************check incompatible extensions************************************

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.");

	if(replacevideo == true){
	    //check enabled extensions
	    try{
		var enableditems = this.prefs.getCharPref("enabledAddons");
	    }catch(e){
		var enableditems = this.prefs.getCharPref("enabledItems");
	    }finally{

		if (enableditems.match(/\{3d7eb24f-2740-49df-8937-200b1cc08f8a\}/)) {//flashblock

		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("flashblock.");

		    try{
			var whitelist = this.prefs.getCharPref("whitelist");
		    }catch(e){
			var whitelist = "";
		    }

		    if(!whitelist.match(aString)){

			//don't try to replace
			replacevideo = false;

			//get text from strbundle
			var message = strbundle.getFormattedString("flashblock", [ aSite ]);
			var messagetitle = strbundle.getString("flvideoreplaceralert");
			//alert user
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			    .getService(Components.interfaces.nsIAlertsService);
			alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
			messagetitle, message,
			false, "", null);
		    }
		}
		if (enableditems.match(/\{84b24861-62f6-364b-eba5-2e5e2061d7e6\}/)) {//mediaplayerconnectivity

		    //access preferences interface
		    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.mediaplayerconnectivity.");

		    try{
			var whitelist = this.prefs.getCharPref("whiteList");
		    }catch(e){
			var whitelist = "";
		    }

		    if(!whitelist.match(aString)){

			//don't try to replace
			replacevideo = false;

			//get text from strbundle
			var message = strbundle.getFormattedString("mpc", [ aSite ]);
			var messagetitle = strbundle.getString("flvideoreplaceralert");
			//alert user
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			    .getService(Components.interfaces.nsIAlertsService);
			alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
			messagetitle, message,
			false, "", null);
		    }
		}
	    }
	}

	if(replacevideo == true){


	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    if(replacemethod == "prompt"){

		if(sourceurl.match(/youtube/)){
		    var params = {inn:{psite:"youtube",pmethod:"embedded",pfmt:fmt}, out:null};
		    window.openDialog("chrome://flvideoreplacer/content/prompt.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();
		    if (params.out) {
			//get value from params
			var replacemethod = params.out.pmethod;
		    }
		}

		if(sourceurl.match(/vimeo\.com/)){

		    var params = {inn:{psite:"vimeo",pmethod:"embedded",pfmt:"0"}, out:null};
		    window.openDialog("chrome://flvideoreplacer/content/prompt.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();
		    if (params.out) {
			//get value from params
			var replacemethod = params.out.pmethod;
		    }
		}
	    }

	    if(replacemethod == "embedded"){

		//get plugin compatibility
		var pluginvmp4 = this.prefs.getBoolPref("pluginvmp4");
		var pluginxflv = this.prefs.getBoolPref("pluginxflv");
		var pluginaqt = this.prefs.getBoolPref("pluginaqt");
		var pluginawmp = this.prefs.getBoolPref("pluginawmp");

		if(newmimetype == "application/x-flv"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);

		    if(pluginxflv == true){

			//create the object element
			var flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-flv");
			//append innerHTML code
			flvideoreplacer.innerHTML = "\
			    <param name=\"src\" value=\""+videourl+"\"></param>\
			    <param name=\"autoplay\" value=\""+autoplay+"\">\
			    <param name=\"controller\" value=\"true\">\
			    <param name=\"loop\" value=\"false\">\
			    <param name=\"scale\" value=\"aspect\">\
			    <embed src=\""+videourl+"\" \
				width=\""+videowidth+"\" \
				height=\""+videoheight+"\" \
				scale=\"aspect\" \
				type=\"application/x-flv\" \
				autoplay=\""+autoplay+"\" \
				controller=\"true\" \
				loop=\"false\" \
			    </embed>";
			if(sourceurl.match(/vimeo\.com/)){
			    var childdivs = videoplayer.getElementsByTagName("div");
			    var videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback
			var newmimetype = "video/mp4";
		    }
		}

		if(newmimetype == "video/mp4"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);

		    if(pluginvmp4 == true){

			//create the object element
			var flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/mp4");
			//append innerHTML code
			flvideoreplacer.innerHTML = "\
			    <param name=\"src\" value=\""+videourl+"\"></param>\
			    <param name=\"autoplay\" value=\""+autoplay+"\">\
			    <param name=\"controller\" value=\"true\">\
			    <param name=\"loop\" value=\"false\">\
			    <param name=\"scale\" value=\"aspect\">\
			    <embed src=\""+videourl+"\" \
				width=\""+videowidth+"\" \
				height=\""+videoheight+"\" \
				scale=\"aspect\" \
				type=\"video/mp4\" \
				autoplay=\""+autoplay+"\" \
				controller=\"true\" \
				loop=\"false\" \
			    </embed>";
			if(sourceurl.match(/vimeo\.com/)){
			    var childdivs = videoplayer.getElementsByTagName("div");
			    var videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback
			var newmimetype = "video/quicktime";
		    }
		}

		if(newmimetype == "video/quicktime"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);

		    if(pluginaqt == true){
			//create the object element
			var flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/quicktime");
			//append innerHTML code
			flvideoreplacer.innerHTML = "\
			    <param name=\"src\" value=\""+videourl+"\"></param>\
			    <param name=\"autoplay\" value=\""+autoplay+"\">\
			    <param name=\"controller\" value=\"true\">\
			    <param name=\"loop\" value=\"false\">\
			    <param name=\"scale\" value=\"aspect\">\
			    <embed src=\""+videourl+"\" \
				width=\""+videowidth+"\" \
				height=\""+videoheight+"\" \
				scale=\"aspect\" \
				type=\"video/quicktime\" \
				autoplay=\""+autoplay+"\" \
				controller=\"true\" \
				loop=\"false\" \
			    </embed>";
			if(sourceurl.match(/vimeo\.com/)){
			    var childdivs = videoplayer.getElementsByTagName("div");
			    var videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback
			var newmimetype = "application/x-mplayer2";
		    }
		}
		if(newmimetype == "application/x-mplayer2"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);

		    if(pluginawmp == true){

			//create the object element
			var flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6");
			flvideoreplacer.setAttribute("codebase", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112");
			flvideoreplacer.setAttribute("standby", "Loading Microsoft Windows Media Player components...");
			flvideoreplacer.setAttribute("type", "application/x-oleobject");
			//append innerHTML code
			flvideoreplacer.innerHTML = "\
			    <param name=\"fileName\" value=\""+videourl+"\"></param>\
			    <param name=\"autoStart\" value=\""+autoplay+"\">\
			    <param name=\"showControls\" value=\"true\">\
			    <param name=\"loop\" value=\"false\">\
			    <embed type=\"application/x-mplayer2\" \
				autostart=\""+autoplay+"\" \
				showcontrols=\"true\" \
				loop=\"false\" \
				src=\""+videourl+"\" \
				width=\""+videowidth+"\" \
				height=\""+videoheight+"\" \
			    </embed>";
			if(sourceurl.match(/vimeo\.com/)){
			    var childdivs = videoplayer.getElementsByTagName("div");
			    var videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback

			var fmt = "99";
/*
			//create the object element
			var flvideoreplacer = doc.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
			flvideoreplacer.setAttribute("data", "http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf");
			//append innerHTML code
			flvideoreplacer.innerHTML = "\
			    <param name=\"movie\" value=\"http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf\"></param>\
			    <param name=\"allowfullscreen\" value=\"true\"></param>\
			    <param name=\"flashvars\" value='config={\"playlist\":[\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\", {\"url\": \""+videourl+"\",\"autoPlay\":"+autoplay+",\"autoBuffering\":true}]}'></param>\
			    <img src=\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\" width=\""+videowidth+"\" height=\""+videowidth+"\" alt=\"FlashVideoReplacer\" title=\"No video playback capabilities.\" />";
*/
		    }
		}
	    }

	    if(replacemethod == "newtab"){

		//declare element to be replaced
		var videoplayer = doc.getElementById(videoelement);
		if(sourceurl.match(/vimeo\.com/)){
		    var childdivs = videoplayer.getElementsByTagName("div");
		    var videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//open media in new tab
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
			.rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

		mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab(videourl);

		//content.window.location.href = videourl;
	    }

	    if(replacemethod == "newwindow"){

		//declare element to be replaced
		var videoplayer = doc.getElementById(videoelement);
		if(sourceurl.match(/vimeo\.com/)){
		    var childdivs = videoplayer.getElementsByTagName("div");
		    var videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//set videourl pref
		this.prefs.setCharPref("videourl",videourl);
		//launch player
		window.openDialog('chrome://flvideoreplacer/content/player.xul', 'flvideoreplacer-player', 'chrome,centerscreen,alwaysRaised');
	    }

	    if(replacemethod == "standalone"){

		//get player path
		var playerpath = this.prefs.getCharPref("playerpath");

		//declare element to be replaced
		var videoplayer = doc.getElementById(videoelement);
		if(sourceurl.match(/vimeo\.com/)){
		    var childdivs = videoplayer.getElementsByTagName("div");
		    var videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//set videourl pref
		this.prefs.setCharPref("videourl",videourl);

		if(playerpath != ""){
		    //initiate player
		    var player = Components.classes["@mozilla.org/file/local;1"]
			    .createInstance(Components.interfaces.nsILocalFile);
		    player.initWithPath(playerpath);
		    if (player.exists()) {//match if player exists and launch it
			var process = Components.classes['@mozilla.org/process/util;1']
			    .createInstance(Components.interfaces.nsIProcess);
			process.init(player);
			var arguments = [videourl];
			process.run(false, arguments, arguments.length);
		    }
		}
	    }

	    //yt video info alert
	    if(videourl.match(/youtube/)){
		if (fmt == "5") {
		    var message = strbundle.getFormattedString("videores", [ "240p flv ("+mimetype+")" ]);
		}
		if (fmt == "18") {
		    var message = strbundle.getFormattedString("videores", [ "360p mp4 ("+mimetype+")" ]);
		}
		if (fmt == "34") {
		    var message = strbundle.getFormattedString("videores", [ "360p flv ("+mimetype+")" ]);
		}
		if (fmt == "35") {
		    var message = strbundle.getFormattedString("videores", [ "480p flv ("+mimetype+")" ]);
		}
		if (fmt == "22") {
		    var message = strbundle.getFormattedString("videores", [ "720p mp4 ("+mimetype+")" ]);
		}
		if (fmt == "37") {
		    var message = strbundle.getFormattedString("videores", [ "1080p mp4 ("+mimetype+")" ]);
		}
		if (fmt == "38") {
		    var message = strbundle.getFormattedString("videores", [ original+" ("+mimetype+")" ]);
		}
		if (fmt !== "99") {
		    var messagetitle = strbundle.getString("flvideoreplacermessage");
		    //alert user
		    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		    alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
		    messagetitle, message,
		    false, "", null);
		}
	    }
	    //no available plugin message
	    if (fmt == "99"){
		var message = strbundle.getFormattedString("noreplace", [ mimetype ]);
		var messagetitle = strbundle.getString("flvideoreplacermessage");
		//alert user
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		    .getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
		messagetitle, message,
		false, "", null);
	    }

	    //set download data***********************************************

	    var dir = this.prefs.getCharPref("downdir");

	    if(sourceurl.match(/youtube/)){
		//fetch video ID from url
		var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");
		if(mimetype == "application/x-flv"){
		    var vidfilename = "youtube-"+videoid+".flv";
		}else{
		    var vidfilename = "youtube-"+videoid+".mp4";
		}
	    }
	    if(sourceurl.match(/vimeo\.com/)){
		//fetch video ID from url
		var videoid = sourceurl.replace(/.*\//g, "");
		var vidfilename = "vimeo-"+videoid+".mp4";
	    }

	    //set downloader prefs
	    this.prefs.setCharPref("downsource",videourl);
	    this.prefs.setCharPref("downfile",dir+"/"+vidfilename);
	}
    },

    webmReplacer: function(aEvent) {

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
	//declare page url
	var sourceurl = doc.location.href;

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");

	if(sourceurl.match(/youtube/)){

	    //fetch video ID from url
	    var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");
	    //declare webm url
	    var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
	    //load webm page
	    doc.location.href = webmurl;

	    var message = strbundle.getFormattedString("videores", [ "HTML5 WebM" ]);
	    var messagetitle = strbundle.getString("flvideoreplacermessage");
	    //alert user
	    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService);
	    alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
	    messagetitle, message,
	    false, "", null);
	}
    },

    vidDownloader: function () {

	  window.openDialog('chrome://flvideoreplacer/content/downloader.xul', 'flvideoreplacer-downloader', 'chrome,centerscreen,alwaysRaised');
    },

    flvrcopyToClipboard: function () {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get video path from prefs
	var downsource = this.prefs.getCharPref("downsource");

	const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
	getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(downsource);

    },

    showHideMenus: function () {//show and hide context menus

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	var downsource = this.prefs.getCharPref("downsource");
	var downfile = this.prefs.getCharPref("downfile");
	var downfilename = downfile.replace(/.*\//g,"");
	var filecheck = downfilename.replace(/.*\-/,"").replace(/\.mp4/g,"").replace(/\.flv/g,"");
	var sourceurl = gURLBar.value;

	if((downsource.match(/youtube/) && (sourceurl.match("youtube") && sourceurl.match("watch") && sourceurl.match("v=") && !sourceurl.match("html5=True"))) || (downsource.match(/vimeo/) && sourceurl.match(/vimeo.com\/\d{1,8}/))){//match supported sites

	    if(sourceurl.match(/youtube/)){
		//fetch video ID from url
		var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");
	    }
	    if(sourceurl.match(/vimeo\.com/)){
		//fetch video ID from url
		var videoid = sourceurl.replace(/.*\//g, "");
	    }

	    if(filecheck == videoid){
		document.getElementById("flvideoreplacer-copy").hidden = false;
		document.getElementById("flvideoreplacer-download").hidden = false;
		document.getElementById("flvideoreplacer-prefs-separator").hidden = false;
		document.getElementById("flvideoreplacer-copy-file").setAttribute('label',downfilename);
		document.getElementById("flvideoreplacer-download-file").setAttribute('label',downfilename);
	    }else{
		document.getElementById("flvideoreplacer-copy").hidden = true;
		document.getElementById("flvideoreplacer-download").hidden = true;
		document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
	    }
	}else{
	    document.getElementById("flvideoreplacer-copy").hidden = true;
	    document.getElementById("flvideoreplacer-download").hidden = true;
	    document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
	}
    }
};
window.addEventListener("load", function() { flvideoreplacerListener.init(); }, false);