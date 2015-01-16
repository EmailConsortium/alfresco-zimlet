/**
 *
 * Zimbra and Alfresco integration with alfresco webscript and Zimlet
 * Copyright (C) 2010  Businessmomentum

 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/**
 * Orginial author : Yong Qu
 *
 * Updated and changed for working with zimbra version 6
 *
 * Localization and other fixes by LouiSe@louise.hu
 * "http://" prefixes removed by LouiSe@louise.hu
 */


/* Alfresco Integration zimlet object */
// Constants for web script services
var ALF_WS_URL_PREFIX = "/alfresco/service";
var ALF_WCWS_URL_PREFIX = "/alfresco/wcservice";
var ALF_LOGIN_SERVICE_URL = ALF_WS_URL_PREFIX + "/api/login";
var ALF_TICKET_SERVICE_URL = ALF_WS_URL_PREFIX + "/api/login/ticket/";

// Other constants used by this program
var ALFRESCO_BUSYIMGURL = "img/animated/Imgwait_32.gif";

// Required as a global configuration instance for the NavTree loadNodeData function
var alfrescoAttachConfig = new Object();

// Message strings
var messageStrings = new Array();

function Org_Alfresco_Zimbra() {
    this.ticket = decodeURIComponent(this.readCookie('alfresco_ticket'));
    this.alfurl = decodeURIComponent(this.readCookie('alfresco_url'));
    // this.alfurl = this.getAlfUrl();


    /* view state management (for attach files dialog) */
    this.viewstate_div = null; /* view state (document selection, pagination, etc) */

    /* (attachment state) variables */
    this.attach_current = -1; // current document being attached
    this.attach_documents = []; // list of documents to be attached
}

Org_Alfresco_Zimbra.prototype = new ZmZimletBase();
Org_Alfresco_Zimbra.prototype.constructor = Org_Alfresco_Zimbra;


AlfrescoAttachView = function(attachDialog, parentTabView, zimlet) {
    var className = null;
    this._attachDialog = attachDialog;
    this._zimlet = zimlet;
    DwtTabViewPage.call(this, parentTabView, className, Dwt.STATIC_STYLE);
    this.setScrollStyle(Dwt.SCROLL);
};

AlfrescoAttachView.prototype = new DwtTabViewPage;
AlfrescoAttachView.prototype.constructor = AlfrescoAttachView;

// initializer function (automatically called by zimlet framework)
Org_Alfresco_Zimbra.prototype.init = function() {

    // load message strings to a global array
    messageStrings["aboutMenu"] = this.getMessage("aboutMenu");
    messageStrings["aboutText"] = this.getMessage("aboutText");
    messageStrings["preferencesMenu"] = this.getMessage("preferencesMenu");
    messageStrings["preferencesServer"] = this.getMessage("preferencesServer");
    messageStrings["preferencesUserName"] = this.getMessage("preferencesUserName");
    messageStrings["preferencesPassword"] = this.getMessage("preferencesPassword");
    messageStrings["saveToAlfrescoMenu"] = this.getMessage("saveToAlfrescoMenu");
    messageStrings["saveToAlfrescoTitle"] = this.getMessage("saveToAlfrescoTitle");
    messageStrings["saveToAlfrescoDescription"] = this.getMessage("saveToAlfrescoDescription");
    messageStrings["saveToAlfrescoTags"] = this.getMessage("saveToAlfrescoTags");
    messageStrings["saveToAlfrescoSpace"] = this.getMessage("saveToAlfrescoSpace");
    messageStrings["saveToAlfrescoSpaceHint1"] = this.getMessage("saveToAlfrescoSpaceHint1");
    messageStrings["saveToAlfrescoSpaceHint2"] = this.getMessage("saveToAlfrescoSpaceHint2");
    messageStrings["saveToAlfrescoSave"] = this.getMessage("saveToAlfrescoSave");
    messageStrings["addAttachmentAlfrescoDocuments"] = this.getMessage("addAttachmentAlfrescoDocuments");
    messageStrings["addAttachmentAttach"] = this.getMessage("addAttachmentAttach");
    messageStrings["addAttachmentAttaching1"] = this.getMessage("addAttachmentAttaching1");
    messageStrings["addAttachmentAttaching2"] = this.getMessage("addAttachmentAttaching2");
    messageStrings["waitForAttaching"] = this.getMessage("waitForAttaching");
    messageStrings["waitForUploading"] = this.getMessage("waitForUploading");
    messageStrings["failedToConnectAlfresco"] = this.getMessage("failedToConnectAlfresco");
    messageStrings["uploadSuccess"] = this.getMessage("uploadSuccess");
    messageStrings["uploadFailed"] = this.getMessage("uploadFailed");
    messageStrings["message"] = this.getMessage("message");
    messageStrings["download"] = this.getMessage("download");
    messageStrings["pasteSortLink"] = this.getMessage("pasteSortLink");
    messageStrings["selectedDocuments"] = this.getMessage("selectedDocuments");
    messageStrings["selectedDocumentsName"] = this.getMessage("selectedDocumentsName");
    messageStrings["selectedDocumentsPath"] = this.getMessage("selectedDocumentsPath");
    messageStrings["selectedDocumentsActions"] = this.getMessage("selectedDocumentsActions");

    // add a property page to the `attach files' dialog
    this.addAlfrescoTabToAttachDialog();

    // add 'Save to Alfresco' link
    this.addAttachmentHandler();

    // assign self to window object because we need to execute some code in window context
    window.Alfresco_widget = this;
};

// Cookie handler functions
Org_Alfresco_Zimbra.prototype.createCookie = function(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
};

Org_Alfresco_Zimbra.prototype.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }

    return null;
};

Org_Alfresco_Zimbra.prototype.eraseCookie = function(name) {
    createCookie(name,"",-1);
};

// Return the address URL of alfresco server
Org_Alfresco_Zimbra.prototype.getAlfUrl = function() {

    var url = decodeURIComponent(this.readCookie('alfresco_url'));
    if (this.alfurl !== undefined && this.alfurl !== null && this.alfurl !== "null") {
        return this.alfurl;

    } else if(url !== null && url !== '' && url !== "null") {
        this.alfurl = url;
        return this.alfurl;
    } else {
        var alfurl = this.getUserProperty("alfurl");
        if (!alfurl) {
            alfurl = this._zimletContext.getConfig("alfurl");
        }
    
        this.alfurl = alfurl;
        return this.alfurl;
    }
}

/* Utility functions for debugging */
Org_Alfresco_Zimbra.prototype.debug = function(msg) {
    DBG.println("[alfhw] " + msg);
}

Org_Alfresco_Zimbra.prototype.info = function(msg) {
    this.displayStatusMessage(msg);
    this.debug(msg);
}

// handler for menu items that do not have <actionURL>
// (see xml file for details on the menu items)
Org_Alfresco_Zimbra.prototype.menuItemSelected = function(itemId) {
    switch (itemId) {
        case "AboutAlfresco":
            this.displayAboutAlfrescoZimlet();
            break;
        case "PREFERENCES":
            this.createPropertyEditor();
            break;
    }
}

// display basic information about the alfresco server. It can also serve as a test of
// the connection to the alfresco server.
Org_Alfresco_Zimbra.prototype.displayAboutAlfrescoZimlet = function() {

    var view = new DwtComposite(this.getShell());
    var args = {
        title : messageStrings["aboutText"],
        view : view
    };
    var dlg = this._createDialog(args);

    var alfTicket = this.getTicket();

    if (alfTicket == null) {

        view.getHtmlElement().innerHTML = messageStrings["failedToConnectAlfresco"];

    } else {

        var alfurl = this.getAlfUrl();
        // var alfAboutWSUrl = ["http://",alfurl,ALF_WCWS_URL_PREFIX,"/zimbra/about","?ticket=",alfTicket].join("");
        var alfAboutWSUrl = [ "", alfurl, ALF_WCWS_URL_PREFIX, "/zimbra/about",
        "?ticket=", alfTicket ].join("");
        var hwUrl = ZmZimletBase.PROXY
        + AjxStringUtil.urlComponentEncode(alfAboutWSUrl);
        var hwResult = AjxRpc.invoke(null, hwUrl, null, null, true);
        var myObject = eval('(' + hwResult.text + ')');

        var info = "<table>";
        info += "<tr><td><b>Alfresco Server</b></td><td>" + alfurl
        + "</td></tr>";
        info += "<tr><td><b>Server Version</b></td><td>" + myObject.version
        + "</td></tr>";
        info += "<tr><td><b>Server Edition</b></td><td>" + myObject.edition
        + "</td></tr>";
        info += "<tr><td><b>User Id</b></td><td>" + myObject.userId
        + "</td></tr>";
        info += "<tr><td><b>User Name</b></td><td>" + myObject.fullName
        + "</td></tr>";
        info += "</table>";

        view.getHtmlElement().innerHTML = info;

    }
    dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,
        function() {
            dlg.popdown();
            dlg.dispose();
        }));
    dlg.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this,
        function() {
            dlg.popdown();
            dlg.dispose();
        }));
    dlg.popup();
}

// retrieve alfresco ticket for webscript service calls.
Org_Alfresco_Zimbra.prototype.getTicket = function() {

    // this.ticket = $.cookie('ticket');	// TODO: read Alfresco ticket from cookie

    // Check if we already have the ticket
    if (this.ticket == null) {
        this.ticket = this.login();

    } else {
        var alfTicket = this.readCookie('alfresco_ticket');

        // If yes, validate the ticket
        if ((alfTicket === null || alfTicket === '') && !this.validateTicket()) {
            this.ticket = this.login();
        }
    }
    return this.ticket;
}

// validate the ticket. If it expires, try to renew it.
Org_Alfresco_Zimbra.prototype.validateTicket = function() {

    /*
        var alfurl = this.getUserProperty("alfurl");
	if (!alfurl)
		alfurl = this._zimletContext.getConfig("alfurl");
    */
    var alfurl = this.getAlfUrl();

    var password = this.getUserProperty("password");
    if (!password)
        password = this._zimletContext.getConfig("password");

    var user = this.getUserProperty("user");
    if (!user)
        user = this._zimletContext.getConfig("user");

    if (this.ticket == null) {
        return false;
    } else {

        // var validationUrl = ["http://",alfurl,ALF_TICKET_SERVICE_URL,this.ticket].join("");
        var validationUrl = [ "", alfurl, ALF_TICKET_SERVICE_URL, this.ticket ]
        .join("");
        var proxyUrl = ZmZimletBase.PROXY
        + AjxStringUtil.urlComponentEncode(validationUrl) + "&user="
        + user + "&pass=" + password + "&auth=basic";
        var result = AjxRpc.invoke(null, proxyUrl, null, null, true);

        if (result.success) {
            var xmlDoc = AjxXmlDoc.createFromXml(result.text);
            var firstNode = xmlDoc._doc.firstChild;
            if (firstNode.tagName == "ticket") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}

Org_Alfresco_Zimbra.prototype.login = function() {

    var password = this.getUserProperty("password");
    if (!password)
        password = this._zimletContext.getConfig("password");

    var user = this.getUserProperty("user");
    if (!user)
        user = this._zimletContext.getConfig("user");

    var alfurl = this.getAlfUrl();
    // var alfLoginUrl = ["http://",alfurl,ALF_LOGIN_SERVICE_URL,"?u=",user,"&pw=",password].join("");
    var alfLoginUrl = [ "", alfurl, ALF_LOGIN_SERVICE_URL, "?u=", user, "&pw=",
    password ].join("");
    var proxyUrl = ZmZimletBase.PROXY
    + AjxStringUtil.urlComponentEncode(alfLoginUrl);

    var result = AjxRpc.invoke(null, proxyUrl, null, null, true);

    if (result.success) {
        var xmlDoc = AjxXmlDoc.createFromXml(result.text);
        var firstNode = AjxEnv.isIE ? xmlDoc._doc.childNodes[1]
        : xmlDoc._doc.childNodes[0];

        if (firstNode.tagName == "ticket") {
            return firstNode.firstChild.nodeValue;
        } else {
            return null;
        }
    } else {
        return null;

    }
}

/*************************************************************************************************************************/
// ADD ATTACHMENT FROM ALFRESCO
/*************************************************************************************************************************/

// add the alfreco document selection dialog box to the attach files page
Org_Alfresco_Zimbra.prototype.addAlfrescoTabToAttachDialog = function() {
    alfrescoAttachConfig.alfUrl = this.getAlfUrl();
    alfrescoAttachConfig.alfTicket = this.getTicket();

    var attachDialog = this._attachDialog = appCtxt.getAttachDialog();
    var tabview = attachDialog ? attachDialog.getTabView() : null;
    this.ATV = new AlfrescoAttachView(attachDialog, tabview, this);
    var tabkey = attachDialog.addTab("alfresco", messageStrings["addAttachmentAlfrescoDocuments"], this.ATV);
    var callback = new AjxCallback(this.ATV, this.ATV.onAttachDocuments);
    attachDialog.addOkListener(tabkey, callback);
}

// (event handler) called when alfresco documents are selected for attachment
Org_Alfresco_Zimbra.prototype.onCheckDocuments = function(type, args) {
    //Populate the list of selected alfresco documents
    var isDocument = type.data.isDocument;
    var name = type.data.label;
    //var src = "http://"+args.alfurl+type.data.src;
    var src = "" + args.alfurl + type.data.src;
}

AlfrescoAttachView.prototype.isInline = function() {
    return this._attachDialog.isInline();
}

// (event handler) called when alfresco documents are selected for attachment
AlfrescoAttachView.prototype.onAttachDocuments = function() {
    this.attach_documents = this.getSelectedDocuments();
    this.attach_current = -1;
    this.attachment_ids = [];

    this.showAttachingDocuments(); /* display progress */
    var callback = new AjxCallback(this, this.uploadFiles);
    this.retreiveDocumentsFromAlfresco(callback);
}

/* get all <img> nodes selected for attachment */
AlfrescoAttachView.prototype.getSelectedDocuments = function() {
    var documents = [];
    var nodes = this.getCheckNodes();

    if (nodes != null) {
        var counter = 0;

        for ( var i = 0; i < nodes.length; i++) {
            if (nodes[i].data.isDocument) {
                var document = {};
                // document.src = "http://"+this._zimlet.getAlfUrl()+nodes[i].data.src+"?ticket="+this._zimlet.getTicket();
                document.src = "" + this._zimlet.getAlfUrl()
                + nodes[i].data.src + "?ticket="
                + this._zimlet.getTicket();
                document.name = nodes[i].data.label;
                document.path = nodes[i].data.path;
                // document.dlink = "http://"+this._zimlet.getAlfUrl()+nodes[i].data.dlink;
                document.dlink = "" + this._zimlet.getAlfUrl()
                + nodes[i].data.dlink;
                // document.shortlink = "http://"+this._zimlet.getAlfUrl()+nodes[i].data.shortlink;
                document.shortlink = "" + this._zimlet.getAlfUrl()
                + nodes[i].data.shortlink;
                documents[counter] = document;
                counter++;
            }
        }
    }
    return documents;
}

AlfrescoAttachView.prototype.uploadFiles = function() {

    // attachmentIds = this.attachment_ids.join(",");
    attIds = [];
    var items = this.attachment_ids;

    for ( var i in items) {
        attIds.push({
            aid : items[i].id,
            id : null
        });
    }

    var callback = this._attachDialog.getUploadCallback();
    if (callback) {
        callback.run(AjxPost.SC_OK, attIds, null);
    }

    this.attach_documents = [];
    this.attach_current = -1;
    this.attachment_ids = [];
};

// upload a document to the zimbra file-upload servlet
AlfrescoAttachView.prototype.retreiveDocumentsFromAlfresco = function(callback) {
    var i = this.attach_current;
    var l = this.attach_documents.length;
    if (i == (l - 1)) {
        // we have finished attaching all documents
        this.debug("Attached " + l + " Alfresco documents");
        callback.run();
    } else {
        i = i + 1; // starts at -1, so ++ for 0-based index
        var doc = this.attach_documents[i];
        var src = doc.src;
        var filename = doc.name;

        var params = [ "upload=1", "&", "fmt=raw", "&", "filename=", filename ]
        .join("");
        var server_url = ZmZimletBase.PROXY
        + AjxStringUtil.urlComponentEncode(src) + "&" + params;
        var cb = new AjxCallback(this, this.doneAttachDocument, [ callback ]);
        AjxRpc.invoke(null, server_url, null, cb, true);
    }
}

// invoked as a callback when a single document has been attached
AlfrescoAttachView.prototype.doneAttachDocument = function(callback, result) {
    this.attach_current = this.attach_current + 1;
    this.debug("<xmp>" + result.text + "</xmp>");

    var resultText = result.text;
    this.showAttachProgress();
    // result.text is some html code with embedded strings inside ''
    var properties = resultText.split(",");

    if (properties[0] == "200") {
        var attachmentId = properties[2].replace("'", "").replace("'", "");

        //	   this.attachment_ids.push ( {id: attachmentId, ct: ""} );
        this.attachment_ids.push({
            id : attachmentId.trim(),
            ct : "text/pdf",
            s : 10000
        });
    } else {
        alert("Proxy returned HTTP Error code: " + properties[0]);
    }
    this.retreiveDocumentsFromAlfresco(callback);
}

AlfrescoAttachView.prototype.showAttachingDocuments = function() {
    this.showElement(this.getApDiv());
}

/* Updates the view of attaching documents */
AlfrescoAttachView.prototype.showAttachProgress = function() {
    Alfresco_clearElement(this.getApprogressDiv());
    this.getApprogressDiv().appendChild(
        document.createTextNode(messageStrings["addAttachmentAttaching1"]
            + (this.attach_current + 1) + "/"
            + this.attach_documents.length + " "
            + messageStrings["addAttachmentAttaching2"]));
}

AlfrescoAttachView.prototype._createProgressDivs = function() {

    var apDiv = document.createElement("div");
    apDiv.className = "Alfresco_busyMsg";

    /* the 'work in progress' image */
    var apbusyDiv = document.createElement("div");
    var busyimg = document.createElement("img");
    busyimg.setAttribute("src", ALFRESCO_BUSYIMGURL);
    apbusyDiv.appendChild(busyimg);
    apDiv.appendChild(apbusyDiv);

    /* the progress text div */
    var approgressDiv = document.createElement("div");
    approgressDiv.appendChild(document.createTextNode(messageStrings["waitForAttaching"]));
    apDiv.appendChild(approgressDiv);

    this.apDiv = apDiv;
    this.approgressDiv = approgressDiv;
};

AlfrescoAttachView.prototype.getApprogressDiv = function() {
    if (!this.approgressDiv) {
        this._createProgressDivs();
    }
    return this.approgressDiv;
};

AlfrescoAttachView.prototype.getApDiv = function() {
    if (!this.apDiv) {
        this._createProgressDivs();
    }
    return this.apDiv;
};

/* Utility functions for debugging */
AlfrescoAttachView.prototype.debug = function(msg) {
    DBG.println("[BM] " + msg);
};

AlfrescoAttachView.prototype.info = function(msg) {
    this.displayStatusMessage(msg);
    this.debug(msg);
};

/********************************************************************************************************************************************
 // END OF ATTACHMENT UPLOADING
 /********************************************************************************************************************************************

 /* For uploading attachments to alfresco */
Org_Alfresco_Zimbra.prototype.addAttachmentHandler = function() {
    this._msgController = AjxDispatcher.run("GetMsgController");
    this._msgController._initializeListView(ZmId.VIEW_MSG);

    // Any better way to add attachment link?

    //var attLinksDiv = document.getElementById(this._msgController._listView[ZmId.VIEW_MSG]._attLinksId);
    //attLinksDiv.innerHTML += "I am here";

    for ( var mimeType in ZmMimeTable._table) {
        this._msgController._listView[ZmId.VIEW_MSG].addAttachmentLinkHandler(
            mimeType, "alfresco", this.addSaveToAlfrescoLink);
    }

    for ( var i = 0; i < AlfMimeTable.list.length; i++) {
        this._msgController._listView[ZmId.VIEW_MSG].addAttachmentLinkHandler(
            AlfMimeTable.list[i], "alfresco", this.addSaveToAlfrescoLink);
    }
}

Org_Alfresco_Zimbra.prototype.addSaveToAlfrescoLink = function(attachment) {
    var html = "<a href='#' class='AttLink' style='text-decoration:underline;' "
    + "onClick=\"window.Alfresco_widget.onSaveToAlfresco('"
    + attachment.ct
    + "','"
    + attachment.label
    + "','"
    + attachment.url
    + "');\">" + messageStrings["saveToAlfrescoMenu"] + "</a>";
    return html;
}

/* Handle 'Save to Alfresco' action */
Org_Alfresco_Zimbra.prototype.onSaveToAlfresco = function(ct, label, src) {

    var uploadDlg = this._getUploadDlg();
    var d = uploadDlg._getContentDiv(); /* Initialize the Upload Dialog */
    Alfresco_clearElement(d);

    var div = document.createElement("div");
    div.className = "Alfresco_hCenter";

    var imgI = document.createElement("img");
    imgI.setAttribute("src", src);

    var pathMsg = document.createElement("div");
    pathMsg.className = "Alfresco_hLeft";
    pathMsg.appendChild(document.createTextNode(messageStrings["saveToAlfrescoSpace"] + ": "));

    var pathHelpMsg = document.createElement("div");
    pathHelpMsg.className = "Alfresco_hLeft_hint";
    pathHelpMsg.appendChild(document.createTextNode(messageStrings["saveToAlfrescoSpaceHint1"]));
    pathHelpMsg.appendChild(document.createElement("br"));
    pathHelpMsg.appendChild(document.createTextNode(messageStrings["saveToAlfrescoSpaceHint2"]));

    var pathS = document.createElement("div");
    pathS.className = "Alfresco_hLeft";
    pathS.id = "spacepathinputdiv";
    pathS.setAttribute("style", "width: 460px;");
    var pathI = document.createElement("input");
    pathI.id = "spacepathinput";
    pathS.appendChild(pathI);

    var containerI = document.createElement("div");
    containerI.id = "spacepathcontainer";
    pathS.appendChild(pathI);
    pathS.appendChild(containerI);

    var titleMsg = document.createElement("div");
    titleMsg.className = "Alfresco_hLeft";
    titleMsg.appendChild(document.createTextNode(messageStrings["saveToAlfrescoTitle"]+": "));

    var titleS = document.createElement("div");
    titleS.className = "Alfresco_hLeft";
    var titleI = document.createElement("input");
    titleI.setAttribute("size", "65");
    titleI.value = label;
    titleS.appendChild(titleI);

    var descMsg = document.createElement("div");
    descMsg.className = "Alfresco_hLeft";
    descMsg.appendChild(document.createTextNode(messageStrings["saveToAlfrescoDescription"]+": "));

    var descS = document.createElement("div");
    descS.className = "Alfresco_hLeft";
    var descI = document.createElement("textarea");
    descS.appendChild(descI);

    var tagsS = document.createElement("div");
    tagsS.className = "Alfresco_hLeft";
    tagsS.appendChild(document.createTextNode(messageStrings["saveToAlfrescoTags"]+": "));
    var tagsI = document.createElement("input");
    tagsS.appendChild(tagsI);

    var brS = document.createElement("br");
    var brS1 = document.createElement("br");
    var brS2 = document.createElement("br");
    var brS3 = document.createElement("br");
    var brS4 = document.createElement("br");

    div.appendChild(titleMsg);
    div.appendChild(titleS);
    div.appendChild(descMsg);
    div.appendChild(descS);
    // div.appendChild(tagsS);		// Input for tags...
    div.appendChild(pathMsg);
    div.appendChild(pathHelpMsg);
    div.appendChild(pathS);
    div.appendChild(brS);
    div.appendChild(brS1);
    d.appendChild(div);

    uploadDlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,
        function() {
            this.onConfirmSaveToAlfresco(ct, label, src, pathI.value,
                titleI.value, descI.value, tagsI.value);
        }));
    uploadDlg.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this,
        function() {
            uploadDlg.popdown();
        }));

    uploadDlg.popup();

    this.setupSpacePathAutoComplete();
}

/* Setup space path autocomplete using YUI AutoComplete widget */
Org_Alfresco_Zimbra.prototype.setupSpacePathAutoComplete = function() {
    var alfTicket = this.getTicket();

    /*
    var alfurl = this.getUserProperty("alfurl");
    if (!alfurl)
        alfurl = this._zimletContext.getConfig("alfurl");
    */
    var alfurl = this.getAlfUrl();

    // var alfEasyNavWSUrl = ["http://",alfurl,ALF_WCWS_URL_PREFIX,"/easy/nav","?ticket=",alfTicket].join("");
    var alfEasyNavWSUrl = [ "", alfurl, ALF_WCWS_URL_PREFIX, "/easy/nav",
    "?ticket=", alfTicket ].join("");
    this.oACDS = new YAHOO.widget.DS_ScriptNode(alfEasyNavWSUrl, [ "nodeList",
        "path" ]);
    this.oACDS.scriptQueryParam = "query";

    // Instantiate AutoComplete
    this.oAutoComp = new YAHOO.widget.AutoComplete("spacepathinput",
        "spacepathcontainer", this.oACDS);
    this.oAutoComp.formatResult = function(oResultItem, sQuery) {
        return "<div class=\"result\"> &nbsp;<span class=\"name\">"
        + oResultItem[0] + "</span></div>";
    };

    // Stub for form validation
    this.validateForm = function() {
        // Validation code goes here
        return true;
    };
}

/* Upload a single attachment to Alfresco */
Org_Alfresco_Zimbra.prototype.onConfirmSaveToAlfresco = function(ct, label,
    src, path, title, desc, tags) {
    /* Show a busy message indicating that the file is being uploaded */
    var busy = document.createElement("div");
    busy.className = "Alfresco_hCenter";

    var busyImgS = document.createElement("span");
    busyImgS.className = "Alfresco_hCenter";
    var busyImg = document.createElement("img");
    busyImg.setAttribute("src", ALFRESCO_BUSYIMGURL);
    busyImgS.appendChild(busyImg);

    var busyTextS = document.createElement("span");
    busyTextS.className = "Alfresco_hCenter";
    busyTextS.appendChild(document.createTextNode(messageStrings["waitForUploading"]));

    busy.appendChild(busyImgS);
    busy.appendChild(busyTextS);

    var uploadDlg = this._getUploadDlg();
    var d = uploadDlg._getContentDiv();
    Alfresco_clearElement(d);

    d.appendChild(busy);

    uploadDlg.setButtonEnabled(DwtDialog.OK_BUTTON, false);
    uploadDlg.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);

    title = title || "";
    tags = tags || "";

    /* Make a call to zimbra.jsp to upload the selected document to Alfresco */

    var alfTicket = this.getTicket();

    var url = this.getResource("zimbra.jsp");
    var alfrescoparams = [ [ "ticket", alfTicket ] ];
    if (path.length > 0) {
        alfrescoparams.push([ "path", path ]);
    }
    if (title.length > 0) {
        alfrescoparams.push([ "title", title ]);
    }
    if (desc.length > 0) {
        alfrescoparams.push([ "desc", desc ]);
    }
    if (tags.length > 0) {
        alfrescoparams.push([ "tags", tags ]);
    }


    /*
    var alfurl = this.getUserProperty("alfurl");

    if (!alfurl)
        alfurl = this._zimletContext.getConfig("alfurl");

    if (!alfurl)
        alfurl = this.readCookie('alfresco_url');
    */
    var alfurl = this.getAlfUrl();

    var params = [ "src=" + AjxStringUtil.urlComponentEncode(src),
    "alfurl=" + alfurl, "ticket=" + alfTicket,
    "name=" + AjxStringUtil.urlEncode(label),
    "path=" + AjxStringUtil.urlEncode(path),
    "title=" + AjxStringUtil.urlEncode(title),
    "desc=" + AjxStringUtil.urlEncode(desc),
    "tags=" + AjxStringUtil.urlEncode(tags) ].join("&");

    var callback = new AjxCallback(this, this.onDoneSaveToAlfresco);
    AjxRpc.invoke(null, url + "?" + params, null, callback, true);
}

Org_Alfresco_Zimbra.prototype._getUploadDlg = function() {
    if (!this.uploadDlg) {
        this.uploadDlg = new DwtDialog(appCtxt.getShell(), null, messageStrings["saveToAlfrescoSave"],
            [ DwtDialog.OK_BUTTON,
            DwtDialog.CANCEL_BUTTON ]);
    }
    return this.uploadDlg;
};

/* Callback function after a document has been uploaded to Alfresco
 @result  contains the result of the Alfresco upload operation
 */
Org_Alfresco_Zimbra.prototype.onDoneSaveToAlfresco = function(result) {
    var uploadDlg = this._getUploadDlg();

    var d = uploadDlg._getContentDiv();
    Alfresco_clearElement(d);

    var jso = null;

    try {

        jso = eval('(' + result.text + ')');

        this.debug("Alfresco Upload - status=" + jso.status);
        this.debug("Alfresco Upload - result=")
        this.debug("<xmp>" + result.text + "</xmp>");
    } catch (e) {
        this.debug("Alfresco Upload Failed:");
        this.debug(e.toString());
    }

    var statusS = document.createElement("span");
    statusS.className = "Alfresco_hCenter";
    var detailS = document.createElement("span");
    detailS.className = "Alfresco_hCenter";

    if (jso.status) {
        statusS.appendChild(document.createTextNode(messageStrings["uploadSuccess"]));
        // detailS.appendChild(document.createTextNode(messageStrings["Message"] + ": " + jso.msg));
        detailS.appendChild(document.createTextNode(""));
    } else {
        statusS.appendChild(document.createTextNode(messageStrings["uploadFailed"]));
        this.debug("<xmp>" + result.text + "</xmp>");
    }

    d.appendChild(statusS);
    d.appendChild(detailS);

    uploadDlg.setButtonEnabled(DwtDialog.OK_BUTTON, true);
    uploadDlg.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

    uploadDlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,
        function() {
            uploadDlg.popdown();
        }));
    uploadDlg.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this,
        function() {
            uploadDlg.popdown();
        }));
    if (!uploadDlg.isPoppedUp()) {
        uploadDlg.popup();
    }

    uploadDlg.setLocation(200, 200);

}

Org_Alfresco_Zimbra.prototype.msgDropped = function(msg) {
    var links = msg.attLinks;
    if ((links != null) && (links.length != 0)) {
        this.attLinks = links;
    }
}

Org_Alfresco_Zimbra.prototype.addMsg = function(msg) {
    // locate the composer control and set up the callback handler
    var composer = appCtxt.getApp(ZmApp.MAIL).getComposeController();

    composer._composeView._htmlEditor.setContent(composer._getBodyContent()
        + " " + msg);

}

/* removes all child nodes of a dom element */
function Alfresco_clearElement(el) {
    if (!el) {
        return;
    }
    while (el.childNodes.length > 0) {
        var firstchild = el.childNodes[0];
        el.removeChild(firstchild);
        firstchild = null;
    }
}

AlfrescoAttachView.prototype.toString = function() {
    return "AlfrescoAttachView";
}

AlfrescoAttachView.prototype.gotAttachments = function() {
    return (this.getSelectedDocuments().length > 0);
}

AlfrescoAttachView.prototype._createProgressDivs = function() {

    var apDiv = document.createElement("div");
    apDiv.className = "Alfresco_busyMsg";

    /* the 'work in progress' image */
    var apbusyDiv = document.createElement("div");
    var busyimg = document.createElement("img");
    busyimg.setAttribute("src", ALFRESCO_BUSYIMGURL);
    apbusyDiv.appendChild(busyimg);
    apDiv.appendChild(apbusyDiv);

    /* the progress text div */
    var approgressDiv = document.createElement("div");
    approgressDiv.appendChild(document.createTextNode(messageStrings["waitForAttaching"]));
    apDiv.appendChild(approgressDiv);

    this.apDiv = apDiv;
    this.approgressDiv = approgressDiv;
};

AlfrescoAttachView.prototype.getApprogressDiv = function() {
    if (!this.approgressDiv) {
        this._createProgressDivs();
    }
    return this.approgressDiv;
};

AlfrescoAttachView.prototype.getApDiv = function() {
    if (!this.apDiv) {
        this._createProgressDivs();
    }
    return this.apDiv;
};

AlfrescoAttachView.prototype._createHtml = function() {
    this._contentEl = this.getContentHtmlElement();
    this._contentEl.innerHTML = "";
    this.treeDiv = document.createElement("div");
    this.treeDiv.id = "treeDiv1";
    this.treeDiv.className = "treeNav";
}

AlfrescoAttachView.prototype.resetAttachProgress = function() {
    Alfresco_clearElement(this.getApprogressDiv());
    this.getApprogressDiv().appendChild(
        document.createTextNode(messageStrings["waitForAttaching"]));
}

// Utility function to show custom text in the attachment dialog. Useful when something else needs to be shown
AlfrescoAttachView.prototype.showElement = function(el) {
    Alfresco_clearElement(this._contentEl);
    this._contentEl.appendChild(el);
}

// Overridden function to draw the (contents of the) Alfresco Documents tab in the Attach Files dialog box
AlfrescoAttachView.prototype.showMe = function() {
    // clear the main view prior to displaying anything
    Alfresco_clearElement(this._contentEl);
    this.resetAttachProgress();
    this.showElement(this.treeDiv);

    this._alfrescoNavTree = new AlfrescoNavTree(this._zimlet);

    DwtTabViewPage.prototype.showMe.call(this, parent);
    this.setSize(Dwt.DEFAULT, "240");
}

AlfrescoAttachView.prototype.getCheckNodes = function() {
    return this._alfrescoNavTree.getCheckedNodes();
}

/*************************************************************************************************************************/
// NAVTREE FOR THE ZIMLET
/*************************************************************************************************************************/

function AlfrescoNavTree(zimlet) {
    this.tree = null;
    this.currentIconMode = null;
    this._zimlet = zimlet;

    YAHOO.util.Event.on([ "mode0", "mode1" ], "click", this.changeIconMode);

    var el = document.getElementById("mode1");
    if (el && el.checked) {
        this.currentIconMode = parseInt(el.value);
    } else {
        this.currentIconMode = 0;
    }
    this.buildTree();
    var args = {};

    this.tree.subscribe("checkClick", this._zimlet.onCheckDocuments, args);
}

AlfrescoNavTree.prototype = new Object();
AlfrescoNavTree.prototype.constructor = AlfrescoNavTree;

AlfrescoNavTree.prototype.changeIconMode = function() {
    var newVal = parseInt(this.value); //TODO: value does not exist!!!!
    if (newVal != this.currentIconMode) {
        this.currentIconMode = newVal;
    }
    this.buildTree();
}

function loadNodeData(node, fnLoadComplete) {
    var nodeLabel = encodeURI(node.data.path);

    var alfurl = alfrescoAttachConfig.alfUrl;
    var alfTicket = alfrescoAttachConfig.alfTicket;

    // var sUrl = ["http://",alfurl,ALF_WCWS_URL_PREFIX,"/easy/tree","?ticket=",alfTicket,"&p=",nodeLabel,"&callback=alfCallback"].join("");
    var sUrl = [ "", alfurl, ALF_WCWS_URL_PREFIX, "/easy/tree", "?ticket=",
    alfTicket, "&p=", nodeLabel, "&callback=alfCallback" ].join("");
    var result = AjxRpc.invoke(null, ZmZimletBase.PROXY
        + AjxStringUtil.urlComponentEncode(sUrl), null, null, true);

    if (result.success) {
        var alfResult = eval('(' + result.text + ')');

        if (alfResult.children != null) {
            for ( var i = 0, j = alfResult.children.length; i < j; i++) {
                if (!alfResult.children[i].isDocument) {
                    var tempNode = new YAHOO.widget.AlfNode(
                        alfResult.children[i], node, false, false);
                    tempNode.isCheckDisabled = true;
                }
            }

            for ( var i = 0, j = alfResult.children.length; i < j; i++) {
                if (alfResult.children[i].isDocument) {
                    var tempNode = new YAHOO.widget.AlfNode(
                        alfResult.children[i], node, false, false);
                    tempNode.isLeaf = true;
                }
            }

        }
        node.loadComplete();
    }
}

AlfrescoNavTree.prototype.buildTree = function() {
    //create a new tree:
    this.tree = new YAHOO.widget.TreeView("treeDiv1");

    //turn dynamic loading on for entire tree:
    loadNodeData._zimlet = this._zimlet;
    this.tree.setDynamicLoad(loadNodeData, this.currentIconMode);

    //get root node for tree:
    var root = this.tree.getRoot();

    //add child nodes for tree; our top level nodes are
    //all the states in India:
    var companyHome = {
        /* label : "Company Home",
		path : "/Company Home",
		title : "Company Home" */
        label : "/",
        path : "/",
        title : "/"
    };
    var tempNode = new YAHOO.widget.AlfNode(companyHome, root, false, false);
    tempNode.isCheckDisabled = true;

    //render tree with these toplevel nodes; all descendants of these nodes
    //will be generated as needed by the dynamic loader.
    this.tree.draw();
}

AlfrescoNavTree.prototype.getCheckedNodes = function(nodes) {
    nodes = nodes || this.tree.getRoot().children;
    var checkedNodes = [];

    for ( var i = 0, l = nodes.length; i < l; i = i + 1) {
        var n = nodes[i];

        //if (n.checkState > 0) { // if we were interested in the nodes that have some but not all children checked
        if (n.checkState === 2) {
            checkedNodes.push(n); // just using label for simplicity
        }

        if (n.hasChildren()) {
            checkedNodes = checkedNodes
            .concat(this.getCheckedNodes(n.children));
        }
    }
    return checkedNodes;
}

// (event handler) called when alfresco documents are selected for attachment
// display list of selected documents with download and short links.
AlfrescoNavTree.prototype.onCheckDocuments = function(type, args) {
    //Populate the list of selected alfresco documents
    var isDocument = type.data.isDocument;
    var name = type.data.label;
    var src = type.data.src;
    var view = new DwtComposite(this._zimlet.getShell());

    // TODO: ???
    var args = {
        title : messageStrings["selectedDocuments"],
        view : view
    };

    var dlg = this._zimlet._createDialog(args);
    var info = "<table class='Alfresco_iTable'><tr><th>"
    + messageStrings["selectedDocumentsName"] + "</th><th>"
    + messageStrings["selectedDocumentsPath"] + "</th><th>"
    + messageStrings["selectedDocumentsActions"] + "</th></tr>";
    var docs = this._zimlet.ATV.getSelectedDocuments();

    if (docs != null) {
        for ( var i = 0; i < docs.length; i++) {
            var docSrc = docs[i].src;
            var docName = docs[i].name;
            var docPath = docs[i].path;
            var docDLink = docs[i].dlink;
            var docShortLink = "<a href=\\'" + docs[i].shortlink + "\\'>"
            + docName + "</a>";
            info += "<tr>";
            info += "<td>" + docName + "</td>";
            info += "<td>" + docPath + "</td>";
            info += "<td><a class='AttLink' style='text-decoration:underline;' href='"
            + docDLink + "'>" + messageStrings["download"] + "</a> | ";
            info += "<a href='#' class='AttLink' style='text-decoration:underline;' onClick=\"window.Alfresco_widget.addMsg('"
            + docShortLink
            + "' \">"
            + messageStrings["pasteSortLink"]
            + "</a></td>";
            info += "</tr>";
        }
    }

    info += "</table>";
    view.getHtmlElement().innerHTML = info;

    dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,
        function() {
            dlg.popdown();
            dlg.dispose();
        }));
    dlg.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this,
        function() {
            dlg.popdown();
            dlg.dispose();
        }));
    dlg.popup();
}