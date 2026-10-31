#!/bin/bash
cd /home/claude/subjects/cs
L=$1; BR=$2
until grep -q DONE a_$L.log 2>/dev/null; do python3 audio2.py cs $L $BR >> a_$L.log 2>&1; sleep 3; done
