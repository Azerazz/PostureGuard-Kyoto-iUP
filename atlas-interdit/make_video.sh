#!/usr/bin/env bash
# Produit une vidéo complète à partir d'un fichier d'épisode.
# Usage : ./make_video.sh episodes/ep01-cadeaux-interdits.json [--voix-externe]
#   --voix-externe : réutilise build/<id>/voice.wav + timeline.json produits par scripts/align_voice.py
set -euo pipefail
EP="$1"
ID=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$EP")
OUT="build/$ID"
if [ -z "${2:-}" ]; then
  python3 scripts/voice.py "$EP"          # voix Piper + timeline
fi
python3 scripts/audio.py "$EP"            # musique + bruitages
node scripts/render.mjs "$EP"             # images → vidéo muette
ffmpeg -y -v error -i "$OUT/video_silent.mp4" -i "$OUT/voice.wav" -i "$OUT/music_sfx.wav" -filter_complex \
  "[1:a]highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=4:attack=5:release=80,volume=1.6[v];\
   [v][2:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=44100[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 21 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/$ID-final.mp4"
echo "OK → $OUT/$ID-final.mp4"
