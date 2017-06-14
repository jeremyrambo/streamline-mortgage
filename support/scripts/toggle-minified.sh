#!/bin/bash

echo
echo This script provides an easy means of toggling the minified environment variable.
echo If you execute this directly, such as ./toggle-minifieds.sh, it will not work.
echo
echo Correct usage is: source toggle-minifieds.sh
echo

if [ "$VENT_MINIFIED" = "standard" ]; then
   export VENT_MINIFIED=minified
else
   export VENT_MINIFIED=standard
fi

echo
echo Mode is $VENT_MINIFIED.

