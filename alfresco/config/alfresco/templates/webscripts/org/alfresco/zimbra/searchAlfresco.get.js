<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/json.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/alfcommon.js">

var contentList = new Array();

var q = (args.q == null) ? "***" : args.q;

if ( q.length == 0) 
	q = "***";

var luceneQueryString = "( TEXT:"+q +" @cm\\:name:"+q+" @cm\\:description:"+q+")";


var results = search.luceneSearch(luceneQueryString);

var count = 0;

for ( var i = 0 ; i < results.length ; i ++ ) {
		
	if ( results[i].isDocument ) {
	
		contentList[count] = {};
			
		var displayPath = results[i].displayPath;

		if ( AlfCommon.Util.startsWith(displayPath,"/Company Home") )
			displayPath = displayPath.substring("/Company Home".length);

		contentList[count].path = displayPath+"/"+results[i].name;
	
		contentList[count].name = results[i].name;
		
		contentList[count].author = results[i].properties["cm:author"];
		
		contentList[count].src = "/alfresco/wcservice/api/node/content/"+results[i].nodeRef.storeRef.protocol+"/"+results[i].nodeRef.storeRef.identifier+"/"+results[i].nodeRef.id+"/"+results[i].name;
		
		contentList[count].shortlink = "/alfresco/wcs/d/"+results[i].properties["sys:node-dbid"];
		
		contentList[count].dlink = "/alfresco"+results[i].downloadUrl;
		
		count++;
	}
	
}

// Paging
contentList = AlfCommon.Util.getPagingList(contentList);


model.results= contentList.toJSONString();

