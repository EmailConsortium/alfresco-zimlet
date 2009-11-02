<style type="text/css">
/*margin and padding on body element
  can introduce errors in determining
  element position and are not recommended;
  we turn them off as a foundation for YUI
  CSS treatments. */
body {
	margin:10;
	padding:10;
}
</style>

<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.5.2/build/fonts/fonts-min.css" />
<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.5.2/build/autocomplete/assets/skins/sam/autocomplete.css" />

<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/utilities/utilities.js"></script>
<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/autocomplete/autocomplete-min.js"></script>


<style type="text/css">
/* custom styles for this implementation */
div#ysearchautocomplete { margin-bottom:2em;width:25em;}
div#ysearchautocomplete .result {position:relative;height:62px;}
div#ysearchautocomplete .name {position:absolute;bottom:0;left:64px;}
div#ysearchautocomplete .img {position:absolute;top:0;left:0;width:58px;height:58px;border:1px solid black;}
div#ysearchautocomplete .imgtext {position:absolute;width:58px;top:50%;text-align:center;}
div#ysearchautocomplete img {width:60px;height:60px;margin-right:4px;}
</style>

<body class="yui-skin-sam">

<form action="http://audio.search.yahoo.com/search/audio" onsubmit="return YAHOO.example.ACScriptNode.validateForm();">
	<h3>Alfresco Easy Address Bar:</h3>
	<div id="ysearchautocomplete">
		<input id="ysearchinput" type="text" name="p">
		<div id="ysearchcontainer"></div>
	</div>
</form>

<script type="text/javascript">
YAHOO.example.ACScriptNode = new function(){
    // Instantiate an Script Node DataSource and define schema as an array:
    //     ["Multi-depth.object.notation.to.find.a.single.result.item",
    //     "Query Key",
    //     "Additional Param Name 1",
    //     ...
    //     "Additional Param Name n"]
    this.oACDS = new YAHOO.widget.DS_ScriptNode("http://zimbra.alfrescolabs.com:8080/alfresco/service/easy/nav?test=dummy", ["nodeList","path"]);
    this.oACDS.scriptQueryParam = "query";

    // Instantiate AutoComplete
    this.oAutoComp = new YAHOO.widget.AutoComplete("ysearchinput","ysearchcontainer", this.oACDS);
    //this.oAutoComp.formatResult = function(oResultItem, sQuery) {        
        //return "<div class=\"result\"> &nbsp;<span class=\"name\">" + oResultItem[0] + "</span></div>";
    //};

    // Stub for form validation
    this.validateForm = function() {
        // Validation code goes here
        return true;
    };
};
</script>

</body>