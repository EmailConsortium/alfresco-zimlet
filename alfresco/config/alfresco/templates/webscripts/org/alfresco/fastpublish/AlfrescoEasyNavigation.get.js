<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/org/alfresco/util/alfcommon.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/org/alfresco/fastpublish/configuration.js">

function startsWith (str, pattern) {
    return str.indexOf(pattern) === 0;
}

function endsWith (str,pattern) {
    var d = str.length - pattern.length;
    return d >= 0 && str.lastIndexOf(pattern) === d;
}

var result = {};

var nodes = null;

var nodeList = new Array{};

var query = args.query;

var rootSpace = null;

var matchStr = null;

script:

{
	// Find out the root path
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
		
	if ( query == null ) {
	
		nodes = rootSpace.children;
	
	} else {
	
		// user home space
		if ( startsWith(query,"~") ) {
	
			rootSpace = userhome;
			
			query = query.substring(1);
		
		}
		
		// root space
		var lastIndex = query.lastIndexOf("/");
		
		if ( lastIndex >= 0 ) {
			
			var namePath = query.substring(0,lastIndex);
			
			var tempSpace = rootSpace.childByNamePath(namePath);
			
			matchStr = query.substring(lastIndex+1);
			
			if ( tempSpace != null ) {
			
				rootSpace = tempSpace;				
				
			}
		
		} else {
		
		}
	}
	
	var nodes = rootSpace.children;
	
	var count = 0;

	if ( matchStr == null ) {
		
		for ( var i = 0 ; i < nodes.length ; i ++ ) {
		
			// list only folders...
			if(nodes[i].isContainer) {
				nodeList[count] = {};
				
				var displayPath = nodes[i].displayPath;
	
				if ( startsWith(displayPath,"/Company Home") )
					displayPath = displayPath.substring("/Company Home".length);
	
				// not display hidden folders in the list
				if(isHiddenFolder(nodes[i].name)!=true) {
					nodeList[count].path = displayPath+"/"+nodes[i].name;
					count ++;
				}
			}
		}
		
	} else {
			
		for ( var i = 0 ; i < nodes.length ; i ++ ) {
		
			var name = nodes[i].properties.name;
			
			if ( startsWith(name,matchStr) && nodes[i].isContainer) {
			
				nodeList[count] = {};
			
				var displayPath = nodes[i].displayPath;
				
				if ( startsWith(displayPath,"/Company Home") )
					displayPath = displayPath.substring("/Company Home".length);
					
				// not display hidden folders in the list
				if(isHiddenFolder(nodes[i].name)!=true) {
					nodeList[count].path = displayPath+"/"+nodes[i].name;
					count ++;
				}
			}	
		}
	
	}

}

result.nodeList = nodeList;

// model.result = result.toJSONString();
model.result = jsonUtils.toJSONString(result);
