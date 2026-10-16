# Atlas Interdit — usine à vidéos TikTok

Produit des vidéos verticales 1080×1920 au format « carte qui raconte » : carte en relief, drapeaux, avion, objets détourés, sous-titres karaoké, voix off et bruitages (la musique s'ajoute dans TikTok). Une vidéo = un fichier JSON dans `episodes/`.

- Stratégie de la chaîne, idées et texte de publication : **[CHAINE.md](CHAINE.md)**
- Vidéos finales : `livrables/`
- Logos : `brand/`

## Installation (une fois)

```bash
npm install
pip install edge-tts piper-tts faster-whisper "rembg[cpu]" numpy pillow
# (optionnel) voix hors ligne Piper, si "voice" vaut {"engine": "piper", ...}
mkdir -p assets/voices && cd assets/voices
B=https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium
curl -LO $B/fr_FR-tom-medium.onnx && curl -LO $B/fr_FR-tom-medium.onnx.json && cd ../..
# carte en relief Natural Earth (domaine public)
mkdir -p assets/map build && curl -L -o assets/map/SR_HR.zip https://naturalearth.s3.amazonaws.com/10m_raster/SR_HR.zip && (cd assets/map && unzip SR_HR.zip)
node scripts/basemap_mask.mjs && python3 scripts/basemap.py
```

## Fabriquer une vidéo

1. **Écrire l'épisode** (règles de ton : voir CHAINE.md, section 4) : copier `episodes/ep01-cadeaux-interdits.json`. Chaque pays a deux phrases : la 1re déclenche le tampon INTERDIT, la 2e affiche l'étiquette rouge. `keys` = mots surlignés en magenta, `say` = prononciation forcée pour la voix.
2. **Trouver les photos** (licences libres, sans crédit obligatoire pour CC0) :
   ```bash
   python3 scripts/openverse_sheet.py parapluie "umbrella isolated white" "red umbrella"
   # regarder build/ov_parapluie.png, puis ajouter le choix dans PICKS de scripts/cutout.py
   python3 scripts/cutout.py parapluie     # détourage → assets/objects/parapluie.png
   ```
3. **Vérifier la voix** : `python3 scripts/voice.py episodes/ep02-xxx.json && python3 scripts/check_voice.py episodes/ep02-xxx.json`, puis reformuler les phrases signalées.
4. **Rendre** :
   ```bash
   ./make_video.sh episodes/ep02-xxx.json --voix-externe   # réutilise la voix vérifiée
   ```
   Aperçu rapide de quelques images : `node scripts/render.mjs episodes/ep02-xxx.json --preview 0,10,20`.

### Utiliser une voix plus naturelle (ElevenLabs, ta propre voix…)

Enregistre ou génère le texte complet de l'épisode dans un seul fichier audio, puis :
```bash
python3 scripts/align_voice.py episodes/ep01-cadeaux-interdits.json ma_voix.mp3
./make_video.sh episodes/ep01-cadeaux-interdits.json --voix-externe
```
Les sous-titres et les animations se recalent automatiquement sur ta voix.

## Sources et licences

- Carte : Natural Earth (domaine public). Contours : world-atlas / Natural Earth.
- Drapeaux : flag-icons (MIT). Polices : Montserrat, Caveat (OFL).
- Photos : Openverse, CC0 ou CC BY (crédits dans `assets/objects/credits.json`).
- Voix : Microsoft Edge Neural TTS (`fr-FR-HenriNeural`, via `edge-tts`), ou Piper hors ligne. Bruitages (et musique optionnelle, `"music": true`) : synthétisés par `scripts/audio.py`.
- Derrière un proxy d'entreprise, `scripts/voice.py` fait pointer `certifi` vers le certificat racine du proxy, sans désactiver la vérification SSL.
