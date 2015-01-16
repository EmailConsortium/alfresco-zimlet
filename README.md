Alfresco Zimlet provides integration between two leading open source solutions,
Alfresco Enterprise Content Management and Zimbra Collaboration Suite.

It was built on top of open technologies such as Alfresco Webscript,
Zimbra Zimlet and YUI library.

It allows the end user to save incoming email attachments to the Alfresco
ECM Server. The user is provided with the ability to select multiple Alfresco
documents and attach them to outgoing emails. Links are provided for
downloading Alfresco Documents when composing emails from within Zimbra.

Alfresco Documents and features are surfaced as shortcut links within the
Zimbra application. Widgets are provided for ease-of-use in Alfresco space
selection and repository navigation. A simple installation and setup is
provided.

Original sources: http://code.google.com/p/alfresco-zimlet/
Original developer: Yong Qu


*******************************************************************************

Compatibility Updates and Fixes: LouiSe@louise.hu - http://louise.hu


Installation procedure:

    0. See two package files in "installer" folder:
        - org_alfresco_zimbra.zip: Alfresco Zimlet for Zimbra
        - webscripts_extensions.zip: WebScripts for Alfresco

    1. Alfresco: navigate to "Company Home/Data Dictionary/Web Scripts Extensions"
        folder and Import "webscripts_extensions.zip" file

    2. Alfresco: restart Alfresco server or refresh web scripts:
        http://localhost:8080/alfresco/service/

    3. Zimbra: enable proxy with command:
        zmprov mc default zimbraProxyAllowedDomains "*"

    4. Zimbra: import "org_alfresco_zimbra.zip" file as a new Zimlet at
        Zimbra administration interface

    5. Setup Alfresco Zimlet by double-click on icon:
        URL: http://localhost:8080
        Username: admin
        Password: *


New features and fixes:

    - ticket based authentication support ('alfresco_ticket' and 'alfresco_url' cookies)
    - localization support (english and hungarian properties included)
    - works with Alfresco 4.x and Zimbra 7.x
    - bugfixes

