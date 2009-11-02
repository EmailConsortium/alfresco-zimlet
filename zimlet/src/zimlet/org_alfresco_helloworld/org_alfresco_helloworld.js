/* Alfresco Hello World zimlet object */

// Constants for web script services

var ALF_WS_URL_PREFIX   = "/alfresco/service";

var ALF_WCWS_URL_PREFIX = "/alfresco/wcservice";

var ALF_LOGIN_SERVICE_URL  = ALF_WS_URL_PREFIX + "/api/login";

var ALF_TICKET_SERVICE_URL = ALF_WS_URL_PREFIX + "/api/login/ticket/";


function Org_Alfresco_Helloworld()
{
	this.ticket = null;
}

Org_Alfresco_Helloworld.prototype = new ZmZimletBase();
Org_Alfresco_Helloworld.prototype.constructor = Org_Alfresco_Helloworld;

// initializer function (automatically called by zimlet framework)
Org_Alfresco_Helloworld.prototype.init = function()
{
};

/* Utility functions for debugging */
Org_Alfresco_Helloworld.prototype.debug = function(msg) {
    DBG.println ("[alfhw] " + msg);
}

Org_Alfresco_Helloworld.prototype.info = function(msg) {
    this.displayStatusMessage (msg);
    this.debug (msg);
}

// handler for menu items that do not have <actionURL> 
// (see xml file for details on the menu items)
Org_Alfresco_Helloworld.prototype.menuItemSelected = function(itemId)
{
	switch (itemId) {
		case "HelloworldAbout":
			this.displayAboutHelloworldZimlet();
		break;
		case "PREFERENCES":
			this.createPropertyEditor();
		break;

	}
}

Org_Alfresco_Helloworld.prototype.displayAboutHelloworldZimlet = function()
{
    var view = new DwtComposite (this.getShell());
    var args = {title: "About Alfresco", view: view};
    var dlg = this._createDialog (args);
    
    var alfTicket =  this.getTicket() ;
    
    if ( alfTicket == null ) {
    
    	view.getHtmlElement().innerHTML = "Failed to Connect to Alfresco !";
   
   	} else {
   
		var alfurl = this.getUserProperty("alfurl");	
		if(!alfurl)
			alfurl = this._zimletContext.getConfig("alfurl");	

		var alfHelloWorldWSUrl = ["http://",alfurl,ALF_WCWS_URL_PREFIX,"/zimbra/helloworld","?ticket=",alfTicket].join("");

		var hwUrl = ZmZimletBase.PROXY + AjxStringUtil.urlComponentEncode(alfHelloWorldWSUrl);

		var hwResult = AjxRpc.invoke(null, hwUrl, null, null,true);

		var myObject = eval('(' + hwResult.text + ')');
		
		var info  ="<table>";
		    info +="<tr><td><b>Alfresco Server</b></td><td>"+alfurl +"</td></tr>";
		    info +="<tr><td><b>Server Version</b></td><td>"+myObject.version +"</td></tr>";
		    info +="<tr><td><b>Server Edition</b></td><td>"+myObject.edition +"</td></tr>";
		    info +="<tr><td><b>User Id</b></td><td>"+myObject.userId +"</td></tr>";
		    info +="<tr><td><b>User Name</b></td><td>"+myObject.fullName +"</td></tr>";
			info +="</table>";
		
		view.getHtmlElement().innerHTML = info;
   
	}
	
    dlg.setButtonListener (DwtDialog.OK_BUTTON, new AjxListener(this,function() { dlg.popdown(); dlg.dispose(); }));
    dlg.setButtonListener (DwtDialog.CANCEL_BUTTON, new AjxListener(this,function() { dlg.popdown(); dlg.dispose(); }));
    dlg.popup();
}

Org_Alfresco_Helloworld.prototype.getTicket = function(){

	// Check if we already have the ticket
	if ( this.ticket == null ) {
	
		this.ticket = this.login();
	
	} else {

		// If yes, validate the ticket
		
		if ( ! this.validateTicket() ) {
	
			this.ticket = this.login();
			
		} 
		
	}
	
	return this.ticket;
		
};

Org_Alfresco_Helloworld.prototype.validateTicket = function(){

	var alfurl = this.getUserProperty("alfurl");	
	if(!alfurl)
		alfurl = this._zimletContext.getConfig("alfurl");	

	var password = this.getUserProperty("password");
	if(!password)
		password = this._zimletContext.getConfig("password");
			
	var user = this.getUserProperty("user");	
	if(!user)
		user = this._zimletContext.getConfig("user");	

	if ( this.ticket == null ) {
	
		return false ;
		
	} else {
	
		var validationUrl = ["http://",alfurl,ALF_TICKET_SERVICE_URL,this.ticket].join("");

		var proxyUrl = ZmZimletBase.PROXY + AjxStringUtil.urlComponentEncode(validationUrl)+"&user="+user+"&pass="+password+"&auth=basic";

		var result = AjxRpc.invoke(null, proxyUrl, null, null,true);

		if ( result.success ) {

			var xmlDoc = AjxXmlDoc.createFromXml(result.text);

			var firstNode = xmlDoc._doc.firstChild;

			if ( firstNode.tagName == "ticket" ) {

				return true;

			} else {

				return false;

			}

		} else {

			return false;

		}
			
	}


};

Org_Alfresco_Helloworld.prototype.login = function(){

	var password = this.getUserProperty("password");
	if(!password)
		password = this._zimletContext.getConfig("password");
			
	var user = this.getUserProperty("user");	
	if(!user)
		user = this._zimletContext.getConfig("user");	

	var alfurl = this.getUserProperty("alfurl");	
	if(!alfurl)
		alfurl = this._zimletContext.getConfig("alfurl");	

	var alfLoginUrl = ["http://",alfurl,ALF_LOGIN_SERVICE_URL,"?u=",user,"&pw=",password].join("");
			
	var proxyUrl = ZmZimletBase.PROXY + AjxStringUtil.urlComponentEncode(alfLoginUrl);
	
    var result = AjxRpc.invoke(null, proxyUrl, null, null,true);
    
    if ( result.success ) {
    
    	var xmlDoc = AjxXmlDoc.createFromXml(result.text);
    	
    	var firstNode = xmlDoc._doc.firstChild;
    	
    	if ( firstNode.tagName == "ticket" ) {
    	
    		return firstNode.firstChild.nodeValue;
    	
    	} else {
    	
    		return null;
        
    	}
    	
    } else {
    
    	return null;
    	
    }
	
};