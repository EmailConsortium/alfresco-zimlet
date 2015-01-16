<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/org/alfresco/util/alfcommon.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/org/alfresco/fastpublish/configuration.js">

var node = null;

//Find out the root path
if(defaultRootSpaceName==undefined) {
	rootSpace = companyhome;
} else {
	// search for nodeRef of defaultRootSpaceName
	var newRootSpace = companyhome.childByNamePath(defaultRootSpaceName);
	if(newRootSpace!=null) {
		rootSpace = newRootSpace;
	} else {
		rootSpace = companyhome;
	}
}

if ((args.n) && (args.n != "")) {
	node = search.findNode("workspace://SpacesStore/" + args.n);
} else {
	// node = rootSpace;
}

// Check here in case invalid nodeRef passed-in
if (node == null) {
   if ((args.p) && (args.p != "")) {
      var path = args.p;
      // if (path == "/" + companyhome.name) {
      if (path == "/") {
         node = rootSpace;
      } else {
         var node = companyhome.childByNamePath(path.substring(companyhome.name.length()+2));
         if (node != null) {
            node = node;
         } else {
            node = userhome;
         }
      }
   }
}

// Last chance - default to userhome
if (node == null) {
   node = userhome;
}

// Get the children of the node and generate json string
var children = node.children;

var result = {};

var children = new Array();

for each ( var child in node.children ) {

	var childNode = {};
	
	childNode.label = child.name;
	
	childNode.path = child.displayPath+"/"+child.name;
	
	childNode.title = "";
	
	if ( child.properties != null ) {
		
		if ( child.properties.description != null ) {
	
			childNode.title += child.properties.description;
			
		}	
		
		if ( child.properties["cm:author"] != null ) {
	
			childNode.title += " By: "+child.properties["cm:author"];
			
		}	

	}	
	
	childNode.isDocument = false;
	
	if ( childNode.label != null && childNode.label != "") {
		children.push(childNode);
		if ( child.isDocument ) {
			childNode.isDocument = true;
			childNode.src = "/alfresco/wcservice/api/node/content/"+child.nodeRef.storeRef.protocol+"/"+child.nodeRef.storeRef.identifier+"/"+child.nodeRef.id+"/"+AlfCommon.Url.encode(child.name);
			childNode.shortlink = "/alfresco/wcs/d/"+child.properties["sys:node-dbid"];
			childNode.dlink = "/alfresco"+child.downloadUrl;
			
			if ( child.size != null ) {
	
				var size = child.size/1024;
				
				childNode.title += " Size: "+size.toFixed(2) +" K";
			
			}	
		}
	}		

}

result.children = children;

// model.result = result.toJSONString();
model.result = jsonUtils.toJSONString(result);