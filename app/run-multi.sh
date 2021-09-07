#!/bin/bash
#MODES = -r: run , -d: dry-run
MODE=-r
#node app.js $MODE multirun -m [ poolreb poolreb poolreb ] -n [ TP500G:DC TP500DC:G POOL500G:DC ] -g 3600 -i 5 -l 0
node app.js $MODE multirun -m [ poolreb poolreb poolreb ] -n [ POOL500G:DC POOL500G:DC POOL500G:DC ] -g 30 -i 10 -l 3