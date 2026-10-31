#!/bin/bash
# $1=lang $2=mode ; újraindul, amíg minden klip kész
cd /home/claude/subjects/ns
for i in $(seq 1 60); do python3 ns_tts_helper2.py ns $1 24k $2 >> helper2_$1_$2.log 2>&1 && break; sleep 2; done
