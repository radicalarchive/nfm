#!/bin/sh
java -Xms512M -Xms512M -jar Game.jar manar
if [ ! -f "data/manar.ok" ]; then
 xterm -hold -e echo -e "Need for Madness requires Java to be installed to work on Linux.\n\nJava will now be automatically installed.\nClose this terminal to begin...";
 xterm -hold -e sudo apt-get install openjdk-7-jre
 java -Xms512M -Xms512M -jar Game.jar manar
fi

