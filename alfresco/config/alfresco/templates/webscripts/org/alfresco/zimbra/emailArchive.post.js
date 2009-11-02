<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/json.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/alfcommon.js">

var result = {};

var status = true;
var msg = "";

// Define default value

var defaultEmailArchiveSpace = "Email Archives";

// Get inputs from the post form

var id, from,body,subject,sentDate,action,attachment;

id = (args.id == null) ? "" : args.id;

from = (args.from == null) ? "" : args.from;

to = (args.to == null) ? "" : args.to;

body = (args.body == null) ? "" : args.body;

subject = (args.subject == null) ? "" : args.subject;

sentDate = (args.sentdate == null) ? "" : args.sentdate;

action = (args.action == null) ? "" : args.action;

attachment = (args.attachment == null || args.attachment == "false") ? false: true;

var attSpacePath = "";

// Locate email archive home space.
// If not found, create the space.

var emailArchiveHome = userhome.childByNamePath (defaultEmailArchiveSpace);

var userFullName = AlfCommon.User.getFullName();

if ( emailArchiveHome == null ) {

	emailArchiveHome = userhome.createFolder(defaultEmailArchiveSpace);

	emailArchiveHome.addAspect("{http://www.alfresco.org/model/content/1.0}titled");
	emailArchiveHome.addAspect("{http://www.alfresco.org/model/content/1.0}author");

	emailArchiveHome.properties.name   = defaultEmailArchiveSpace;
	emailArchiveHome.properties.title  = defaultEmailArchiveSpace;
	emailArchiveHome.properties.author = userFullName;
	emailArchiveHome.properties.description = "Email Archive Space for User "+ userFullName;

	emailArchiveHome.save();

}

if ( action == "savebody") {

	// Test 
	// Create a new file and add emailed aspect and populate fields.

	var emailFileName = id;

	var emailMsg = emailArchiveHome.childByNamePath(emailFileName);

	if (emailMsg == null) {

		emailMsg = emailArchiveHome.createFile(emailFileName); 

		emailMsg.addAspect("{http://www.alfresco.org/model/content/1.0}author");
		emailMsg.addAspect("{http://www.alfresco.org/model/content/1.0}auditable");
		emailMsg.addAspect("{http://www.alfresco.org/model/content/1.0}titled");
		emailMsg.addAspect("{http://www.alfresco.org/model/system/1.0}referenceable");
		emailMsg.addAspect("{http://www.alfresco.org/model/content/1.0}attachable");
		emailMsg.addAspect("{http://www.alfresco.org/model/emailserver/1.0}emailed");

		msg += " Created a new emailMsg with name "+emailFileName;

	}

	emailMsg.properties.name  =  emailFileName;
	emailMsg.properties.title  = subject;
	emailMsg.properties.author = userFullName;
	emailMsg.properties.encoding = "UTF-8";
	emailMsg.properties.description = subject;

	emailMsg.properties["cm:originator"] = from;
	emailMsg.properties["cm:subjectline"]  = subject;

	var toArray = to.split(",");

	if ( toArray.length > 1 )
		emailMsg.properties["cm:addressees"]  = toArray ;
	else
		emailMsg.properties["cm:addresse"]  = to;

	var theDate = new Date();
	theDate.setTime(sentDate);

	emailMsg.properties["cm:sentdate"]  = theDate;

	emailMsg.properties.content.content  = body;

	emailMsg.properties.content.mimetype ="text/plain";


	emailMsg.save();
	
	msg += "Message body of email "+ emailFileName + " has been saved to Alfresco";
	
	// Create a folder for email attachments
	
	if ( attachment ) {
	
		var attachmentSpaceName = "Message "+emailFileName+" Attachments";
		
		var attachmentSpace = emailArchiveHome.childByNamePath (attachmentSpaceName);

		if ( attachmentSpace == null ) {

			attachmentSpace = emailArchiveHome.createFolder(attachmentSpaceName);

			attachmentSpace.addAspect("{http://www.alfresco.org/model/content/1.0}titled");
			attachmentSpace.addAspect("{http://www.alfresco.org/model/content/1.0}author");

			attachmentSpace.properties.name   = attachmentSpaceName;
			attachmentSpace.properties.title  = attachmentSpaceName;
			attachmentSpace.properties.author = userFullName;
			attachmentSpace.properties.description = "Attachment Space for Message "+ emailFileName;

			attachmentSpace.save();

		}
		
		// Process the path to get the relative path to company home
		
		attSpacePath = emailArchiveHome.name + "/" + attachmentSpace.name ;
			
	}


} else if ( action == "attassoc") {

	var emailFileName = id;

	var emailMsg = emailArchiveHome.childByNamePath(emailFileName);
	
	if (attachment) {
	
		// Find the attachment space
		var attachmentSpaceName = "Message "+emailFileName+" Attachments";
			
		var attachmentSpace = emailArchiveHome.childByNamePath (attachmentSpaceName);
		
		if ( attachmentSpace != null ) {
		
			var emailAttachments = emailMsg.assocs["cm:attachments"];
			
			// Remove the existing attachment association if any
			if ( emailAttachments != null ) {
			
				for ( var i = 0 ; i < emailAttachments.length ; i ++ ) {
						
						emailMsg.removeAssociation(emailAttachments[i], "cm:attachments");
				
				}
				
				emailMsg.save();
			}
			
			// Add the association between the attachments and the email body
			var attachments = attachmentSpace.children;
			
			for ( var j = 0 ; j < attachments.length ; j ++ )  {
						
					emailMsg.createAssociation(attachments[j], "cm:attachments");
				
			}	
			
			emailMsg.save();
		}
	
	}
	

}

result.status = status;
result.msg = msg;
result.attspacepath = attSpacePath;

model.result = result.toJSONString();

