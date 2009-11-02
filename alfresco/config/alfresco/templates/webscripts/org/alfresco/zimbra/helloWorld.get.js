<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/json.js">
<import resource="/Company Home/Data Dictionary/Web Scripts Extensions/zimlets/org/alfresco/util/alfcommon.js">

var result = {};

result.version = server.version;

result.edition = server.edition;

result.userId = person.properties.userName;

result.fullName = person.properties.firstName + person.properties.lastName;

model.result = result.toJSONString();

