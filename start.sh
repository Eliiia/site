#!/bin/bash

rm www/neofetch.txt
neofetch --stdout >> www/neofetch.txt
sudo nodemon main.js --ignore ./config.json
