#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Compiling BakeMusic.java..."
mkdir -p /tmp/bake-music-classes
javac -cp java/Game.jar -d /tmp/bake-music-classes web/tools/BakeMusic.java

echo "Running tools.BakeMusic..."
java -cp /tmp/bake-music-classes:java/Game.jar tools.BakeMusic

echo "Encoding raw files to FLAC..."
for rawfile in music-baked/*.raw; do
    if [ -f "$rawfile" ]; then
        flacfile="${rawfile%.raw}.flac"
        # Encode raw PCM: signed 16-bit little-endian, 22000Hz, mono
        # -loglevel error avoids spamming the console
        ffmpeg -y -loglevel error -f s16le -ar 22000 -ac 1 -i "$rawfile" -c:a flac "$flacfile" </dev/null
        
        opusfile="${rawfile%.raw}.opus"
        # Opus encoding (lossy, but much smaller)
        ffmpeg -y -loglevel error -f s16le -ar 22000 -ac 1 -i "$rawfile" -c:a libopus -b:a 64k "$opusfile" </dev/null
        
        rm -f "$rawfile"
    fi
done

echo "Done! Baked music size:"
du -sh music-baked
