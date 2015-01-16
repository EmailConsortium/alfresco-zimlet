/**
 * Copyright (C) 2005-2007 Alfresco Software Limited.
 *
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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

 * As a special exception to the terms and conditions of version 2.0 of 
 * the GPL, you may redistribute this Program in connection with Free/Libre 
 * and Open Source Software ("FLOSS") applications as described in Alfresco's 
 * FLOSS exception.  You should have recieved a copy of the text describing 
 * the FLOSS exception, and it is also available here: 
 * http://www.alfresco.com/legal/licensing"
 */


/**
 * Alfresco Common Javascript
 * @project AlfCommon
 * @author Yong Qu
 * @version 1.0.0.0
 * @description Alfresco Common Javascript library for JS Templating and Web Scripting.
 * 
  */
var AlfCommon = {
  Version: '1.0.0.0'
};

/**
 * Utility Functions.
 * @namespace Util
 * 
 * */
AlfCommon.Util = {

	DEFAULT_ITEMS_PER_PAGE: 6,
	
	/**	 
	 * @function isNotNull
	 *  Check to see if the object is neither null nor empty
	 * @param obj Object for checking
	 * @return true is neither null nor empty, otherwise false.
	 */

  isNotNull: function(obj) {

	if ( obj != null && obj != "" ) {
	
		return true;
		
	} else {
	
		return false;
		
	}
  },

	/**
	 * @function isNull
	 * Check to see if the object is neither null nor empty
	 * @param obj Object for checking
	 * @return true is neither null nor empty, otherwise false.
	 */

  isNull: function(obj) {

	if ( obj != null && obj != "" ) {
	
		return false;
		
	} else {
	
		return true;
		
	}
  },
  
	/**
	 * @function isInt
	 * Check to see if the object is integer or not
	 * @param x Object for checking
	 * @return true is integer, otherwise false.
	 */

	isInt: function isInt(x) {

		var y=parseInt(x);
	
		if (isNaN(y)) return false;
	
		return x==y && x.toString()==y.toString();

 	}, 

	/**
	 * @function getPagingList
	 * Get certain page of a list. This function gets paging related paramerts from request directly.
	 * 
	 * @param itemList List for paging.
	 * @param args.c Number of items per page. The default is 6.
	 * @param args.p Starting page number. The default is 1.
	 * 
	 * @return pagingListReturn.itemsPerPage Number of items per page.
	 * @return pagingListReturn.startPage Starting page number.
	 * @return pagingListReturn.status True if valid page is found, otherwise false.
	 * @return pagingListReturn.msg Message.
	 * @return pagingListReturn.pagingList Sublist of the page.
	 * @return pagingListReturn.startIndex Start index of the page.
	 * @return pagingListReturn.totalPageItems Total items of the page.
	 */

	getPagingList: function getPagingList (itemList) {

		var pagingListReturn = {};
	
		pagingListReturn.msg = "";

	   	var startPageArg = args.p;
   
   		var startPage = 1;
   
   		if ( startPageArg != null && AlfCommon.Util.isInt(startPageArg) ) {
   
   			startPage = parseInt(startPageArg);
   	
   		}		

	   	var itemsPerPageArg = args.c;
   
   		var itemsPerPage = AlfCommon.Util.DEFAULT_ITEMS_PER_PAGE;
   
   		if ( itemsPerPageArg != null && AlfCommon.Util.isInt(itemsPerPageArg) ) {
   
   			itemsPerPage= parseInt(itemsPerPageArg);
   	
   		}		


		// are we out-of-range
	
		var totalResults = itemList.length;

		var totalPages = (totalResults / itemsPerPage);

		totalPages += (totalResults % itemsPerPage != 0) ? 1 : 0;

		if (totalPages != 0 && (startPage < 1 || startPage > totalPages)) {

    		pagingListReturn.msg = "Start page " + startPage + " is outside boundary of " + totalPages + " pages";
			pagingListReturn.status = false;
			pagingListReturn.pagingList = null;
		
		} else {
	
			pagingListReturn.itemsPerPage = itemsPerPage;
			pagingListReturn.startPage    = startPage;
			pagingListReturn.totalResults = totalResults;
	
			if (totalResults == 0) {
	
	    		pagingListReturn.totalPages = 0;
	    		pagingListReturn.startIndex = 0;
	    		pagingListReturn.totalPageItems = 0;

			} else {

		    	pagingListReturn.totalPages = totalPages;
	   			pagingListReturn.startIndex = ((startPage -1) * itemsPerPage) + 1;
	    		pagingListReturn.totalPageItems = Math.min(itemsPerPage, totalResults - pagingListReturn.startIndex + 1);

			}

			var nodes = new Array();
		
			for (var i = 0; i < pagingListReturn.totalPageItems; i++) {
		
	    		var node = itemList[i + pagingListReturn.startIndex - 1];

				nodes.push(node);
			
			}

			pagingListReturn.pagingList = nodes;
			pagingListReturn.totalPages = totalPages;
			pagingListReturn.status = true;
		
			pagingListReturn.msg = "Paging Result: Start Page "+ pagingListReturn.startPage +", Total Items "+pagingListReturn.totalPageItems;
		
		}
	
		return pagingListReturn;
	},
   
	/**
	 * @function sortByModified
	 * Comparision function for comparing two items by last modified time.
	 * 
	 * @param node_a Item A to be compared.
	 * @param node_b Item B to be compared.
	 * 
	 * @return 1 if Item B is newer,  -1 if Item A is newer, otherwise 0.
	 */
	
	sortByModified: function(node_a, node_b) {
   	
	    var x = node_a.properties.modified;
    	var y = node_b.properties.modified;
    	return ((x < y) ? 1 : ((x > y) ? -1 : 0));

	},

	/**
	 * @function sortByCreated
	 * Comparision function for comparing two items by creation time.
	 * 
	 * @param node_a Item A to be compared.
	 * @param node_b Item B to be compared.
	 * 
	 * @return 1 if Item B is newer,  -1 if Item A is newer, otherwise 0.
	 */

	sortByCreated: function(node_a, node_b) {
    
    	var x = node_a.properties.created;
    	var y = node_b.properties.created;
    	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	},

	/**
	 * @function sortByName
	 * Comparision function for comparing two items by name.
	 * 
	 * @param node_a Item A to be compared.
	 * @param node_b Item B to be compared.
	 * 
	 * @return 1 if Item B is greater,  -1 if Item A is greater, otherwise 0.
	 */

	sortByName: function(node_a, node_b) {
    
    	var x = node_a.properties.name;
    	var y = node_b.properties.name;
    	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	},

	/**
	 * @function sortByName
	 * Comparision function for comparing two items by a given property.
	 * 
	 * @param node_a Item A to be compared.
	 * @param node_b Item B to be compared.
	 * @param args.sortproperty Name of the property to be compared
	 * 
	 * @return 1 if Item B is greater,  -1 if Item A is greater, otherwise 0.
	 */

	sortByProperty: function(node_a, node_b) {
    	
    	var sortedProperty = args.sortproperty;
    	var x = node_a.properties[sortedProperty];
    	var y = node_b.properties[sortedProperty];
    	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	},

	/**
	 * @function getSortedList
	 * Sort a list based on given criteria.
	 * 
	 * @param itemList List to be sorted.
	 * @param args.sortby Sorting criteria. "modified" for sorted by last modified, "created" for sorted by creation time, "name" for sorted by name and "property" for sorted by node property.
	 * @param args.sortproperty Name of the property to be compared if sorted by property.
	 * @param args.asc asc for returning list in ascending order. Otherwise, return in decending order.
	 * @return sorted list.
	 */

	getSortedList: function(itemList) {
    
    	var sortedBy = args.sortby;
    
    	if ( AlfCommon.Util.isNotNull(sortedBy) ) {
    	
    		if ( sortedBy == "modified" ) {
    			itemList.sort(AlfCommon.Util.sortByModified);
    		} else if ( sortedBy == "created" ) {
    			itemList.sort(AlfCommon.Util.sortByCreated);
    		} else if ( sortedBy == "name" ) {
    			itemList.sort(AlfCommon.Util.sortByName);
    		} else if ( sortedBy == "property" ) {
    			itemList.sort(AlfCommon.Util.sortByProperty);
    		} else {
    			itemList.sort(AlfCommon.Util.sortByModified);
    		}
    	} else {
    		itemList.sort(AlfCommon.Util.sortByModified);
    	}
    
    	if ( AlfCommon.Util.isNotNull(args.asc) && args.asc == "asc" ) {
    
    		return itemList.reverse();
    	
    	} else {
    
    		return itemList;
	    	
    	}	
    
	}
    
};



/**
 * Access Control Functions. 
 * @namespace ACL
 */
AlfCommon.ACL = {

	/**
 	* @function canCreate
 	* Check if current user can create child for a given node.
 	* @param node The node for Checking.
 	* @return true if the user has the role. false if the user doesn't have the role. 
 	*/
	canCreate: function(node) {

		return node.hasPermission("Contributor"); 

	},

	/**
 	* @function canUpdate
 	* Check if current user can update a given node.
 	* @param node The node for Checking.
 	* @return true if the user has the role. false if the user doesn't have the role. 
 	*/
	canUpdate: function(node) {


		return node.hasPermission("Editor"); 

	},

	/**
	* @function canRead
 	* Check if current user can access a given node.
 	* @param node The node for Checking.
 	* @return true if the user has the role. false if the user doesn't have the role. 
 	*/
	canRead: function(node) {

		return node.hasPermission("Consumer"); 

	}
};

/**
 * User Functions. 
 * @namespace User
 */
AlfCommon.User = {

	/**
 	* @function getFullNameByID
 	* Get FullName of the user with given Id.
 	* @param userID User's ID.
 	* @return full name of the user. 
 	*/
	getFullNameByID: function(userId) {

		var fullName = "";
	
		var user = people.getPerson(userId);
	
		if ( user != null && user.properties != null ) {
	
			if ( user.properties.firstName != null ) {

				fullName += user.properties.firstName;
	
				if ( user.properties.lastName != null ) {

					fullName += " "+user.properties.lastName;

				}
			} else {

				if ( user.properties.lastName != null ) {

					fullName += user.properties.lastName;

				}
			}
		}
			
		return fullName; 		
	},
	/**
 	* @function getFullName
 	* Get FullName of the current user.
 	* @return full name of the user. 
 	*/
	getFullName: function() {

		var fullName = "";
	
		var user = person;
	
		if ( user != null && user.properties != null ) {
	
			if ( user.properties.firstName != null ) {

				fullName += user.properties.firstName;
	
				if ( user.properties.lastName != null ) {

					fullName += " "+user.properties.lastName;

				}
			} else {

				if ( user.properties.lastName != null ) {

					fullName += user.properties.lastName;

				}
			}
		}
		
		return fullName; 
	
	}		
};

/**
 * Url Functions. 
 * @namespace Url
 */
AlfCommon.Url = {

    // public method for url encoding
    encode : function (string) {
        return escape(this._utf8_encode(string));
    },

    // public method for url decoding
    decode : function (string) {
        return this._utf8_decode(unescape(string));
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        //string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

};