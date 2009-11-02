<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/json.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/alfcommon.js">

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
	
	rootSpace = companyhome;
	
	if ( query == null ) {
	
		nodes = rootSpace.children;
	
	} else {
	
		if ( startsWith(query,"~") ) {
	
			rootSpace = userhome;
			
			query = query.substring(1);
		
		}
		
		//
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
	
	if ( matchStr == null ) {
	
		for ( var i = 0 ; i < nodes.length ; i ++ ) {
		
			nodeList[i] = {};
			
			var displayPath = nodes[i].displayPath;

			if ( startsWith(displayPath,"/Company Home") )
				displayPath = displayPath.substring("/Company Home".length);

			nodeList[i].path = displayPath+"/"+nodes[i].name;
		}
		
	} else {
	

		var count = 0;
		
		for ( var i = 0 ; i < nodes.length ; i ++ ) {
		
			var name = nodes[i].properties.name;
			
			if ( startsWith(name,matchStr) && nodes[i].isContainer) {
			
				nodeList[count] = {};
			
				var displayPath = nodes[i].displayPath;
				
				if ( startsWith(displayPath,"/Company Home") )
					displayPath = displayPath.substring("/Company Home".length);
					
			
				nodeList[count].path = displayPath+"/"+nodes[i].name;
				
				count ++;
			}	
		}
	
	}

}

result.nodeList = nodeList;

model.result = result.toJSONString();