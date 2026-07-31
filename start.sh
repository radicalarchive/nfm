#!/bin/sh
# Need for Madness - patched to run on modern Java (>=18).
# Original called System.runFinalizersOnExit (removed in Java 18); NOP'd in Madness.class.
# Jar signature files removed so the patched class verifies.
cd "$(dirname "$0")"
java -Xms512M -Xmx512M -jar Game.jar manar
