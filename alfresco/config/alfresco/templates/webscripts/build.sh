#!/bin/sh
#
# Zimlet builder script
#

ZIMLET_FILE=../../installer/webscripts_extensions.zip

rm ${ZIMLET_FILE}
zip -r ${ZIMLET_FILE} *
