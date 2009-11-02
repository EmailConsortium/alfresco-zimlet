script:
{

	var dbid = url.extension;

	if ( dbid == null ) {

		status.code = 400;
		status.message = "DB id has not been provided.";
		status.redirect = true;
     	break script;

	} else {

		var luceneQueryStr = "@sys\\:node-dbid:"+dbid;

		var nodes = search.luceneSearch(luceneQueryStr);

		if ( nodes != null ) {

			var node = nodes[0];
			
			if ( node != null && node.isDocument ) {

				var nodeUrl = node.url;

				status.code = 303;  // Temporary redirect
				status.location = url.context+nodeUrl;
				
			} else {
			
				status.code = 400;
				status.message = "Document with given DB id "+dbid+" is not a document.";
				status.redirect = true;
				break script;		
			
			}

		} else {
		
			status.code = 404;
			status.message = "Document with given DB id "+dbid+" has not been found.";
			status.redirect = true;
			break script;		
		
		}

	}

}
