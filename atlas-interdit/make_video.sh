#!/usr/bin/env bash
# Produit une vidéo complète à partir d'un fichier d'épisode.
# Usage : ./make_video.sh episodes/ep01-cadeaux-interdits.json [--voix-externe]
#   --voix-externe : réutilise build/<id>/voice.wav + timeline.json produits par scripts/align_voice.py
set -euo pipefail
EP="$1"
ID=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$EP")
OUT="build/$ID"
if [ "${2:-}" != "--voix-externe" ]; then
  python3 scripts/voice.py "$EP"          # voix Piper + timeline
fi
python3 scripts/audio.py "$EP"            # musique + bruitages
node scripts/render.mjs "$EP"             # images → vidéo muette
ffmpeg -y -v error -i "$OUT/video_silent.mp4" -i "$OUT/voice.wav" -i "$OUT/music_sfx.wav" -filter_complex \
  "[1:a][2:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,aresample=44100[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 21 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/$ID-final.mp4"
echo "OK → $OUT/$ID-final.mp4"
# 2e passe de normalisation (-14 LUFS, pic -1,5 dBTP) sur les mesures réelles → livrables/
J=$(ffmpeg -hide_banner -i "$OUT/$ID-final.mp4" -af loudnorm=I=-14:TP=-1.5:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
P=$(python3 -c "import json,sys;d=json.loads(sys.argv[1]);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")" "$J")
mkdir -p livrables
ffmpeg -y -v error -i "$OUT/$ID-final.mp4" -c:v copy -af "loudnorm=I=-14:TP=-1.5:linear=true:$P,aresample=44100" \
  -c:a aac -b:a 192k -movflags +faststart "livrables/$ID.mp4"
echo "Livrable → livrables/$ID.mp4"
