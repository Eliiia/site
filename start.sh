#!/bin/bash

rm www/neofetch
neofetch --stdout >> www/neofetch
sudo nodemon main.js --ignore ./config.json