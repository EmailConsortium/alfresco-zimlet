<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/json.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/alfcommon.js">

function startsWith (str, pattern) {
    return str.indexOf(pattern) === 0;
}

var result = {};

var status = true;
var msg = "";

var DEFAULT_FILE_NAME = "zimbra_email_attachment";

var defaultEmailArchiveSpace = "Email Archives";

var path = null;
var name = null;
var filename = null;
var content = null;
var title = "";
var description = "";
var mimetype = null;
var id = null;


var tags;

var username="";

if ( AlfCommon.Util.isNull(username) ) 
	username = AlfCommon.User.getFullName();

// Get inputs from the post form

for each (field in formdata.fields)
{
  if (field.name == "id")
  {
    id= field.value;
  }
  else if (field.name == "title")
  {
    title= field.value;
  }
  else if (field.name == "desc")
  {
    description= field.value;
  }
  else if (field.name == "path")
  {
    path= field.value;
  }
  else if (field.name == "name")
  {
    name = field.value;
  }
  else if (field.name == "file" && field.isFile)
  {
    filename = field.filename;
    content = field.content;
    mimetype = field.mimetype;
  }  
}


script:
{

	// Check file content
	if ( content == null ) {
	
		status = false;
		msg = "Undefined file. File Content is null.";
		
		break script;
		
	}	
	
	// if name input is not null, use it as the filename
	if ( name != null) {
		filename = name;
	}

	if ( filename == null ) {
	
		filename = DEFAULT_FILE_NAME;
	}
	
	filename = AlfCommon.Url.decode(filename);

	// Locate the space to upload the file
	var docSpace = null;

	if ( path == null ) {

		// If path is not given, use user's home space.
		docSpace = userhome;

	} else {

		if ( startsWith(path,"/") ) {
			path = path.substring(1);
		}
		
		docSpace = companyhome.childByNamePath(path);
		
		if ( docSpace == null ) {
		
			status = false;
			msg = "Space with path "+path+" not found!";

			break script;			
		}

	}
	
	// Check the permission
	var upload = null;
	
	upload = docSpace.childByNamePath(filename);
	
	if ( upload != null ) {
	
		if ( upload.isDocument ) {
		
			if (! AlfCommon.ACL.canUpdate(upload) ) {

				status = false;
				msg ="User doesn't have role to update the document "+filename+" under Space "+path;

				break script;

			}
			
		} else {
		
				status = false;
				msg ="Node "+filename+" under Space "+path+" is not a valid document";

				break script;
		}	
	
	} else {
	
		if (! AlfCommon.ACL.canCreate(docSpace) ) {
		
			status = false;
			msg ="User doesn't have role to create a new document under Space "+path;
		
			break script;
			
		} else {
			
			upload = docSpace.createFile(filename) ;
		
		}
	}
	  
	upload.properties.content.write(content);
	upload.properties.title = AlfCommon.Url.decode(title);
	upload.properties.description = AlfCommon.Url.decode(description);
	upload.properties.author = username;
	// This will only work for 3.0
	upload.properties.content.guessMimetype(filename);
	upload.properties.content.encoding = "UTF-8";
	
	upload.save();
  	
  	// Check to see if it needs to be associated with email body
  	if ( id != null ) {
  	
  		// Try to find the email body
  		var emailMsg = userhome.childByNamePath (defaultEmailArchiveSpace+"/"+id);
  		
  		// If email exists
  		if ( emailMsg != null ) {
  		
  			var emailAttachments = emailMsg.assocs["cm:attachments"];
						
			var uploadNodeRef = upload.nodeRef;
			
			var associated = false;
			
			// Remove the existing attachment association if any
			if ( emailAttachments != null ) {

				for ( var i = 0 ; i < emailAttachments.length ; i ++ ) {

					if ( emailAttachments[i].nodeRef.equals(uploadNodeRef))
						associated = true;		

				}

			}
  		
			if ( ! associated) {
				emailMsg.createAssociation(upload, "cm:attachments");
				emailMsg.save();
			}	
					
  		}
  	
  	}
  	
  	
  	status = true;
  	msg += "Attachment "+filename+" has been saved to Space "+docSpace.properties.name; 
  
}

result.status = status;
result.msg = msg;

model.result = result.toJSONString();

