#!/bin/sh
#
# Zimlet builder script
#

ZIMLET_FILE=../../../installer/org_alfresco_zimbra.zip

rm ${ZIMLET_FILE}
zip -r ${ZIMLET_FILE} * -x "*.git*" -x "*.svn*" -x "*~"
