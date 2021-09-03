#!/bin/bash
#MODES = -r: run , -d: dry-run
MODE=-r
node app.js $MODE multirun -m [ tokenex tokenex poolreb ] -n [ TP500G:DC TP500DC:G POOL500G:DC ] -g 10 -i 5 -l 2