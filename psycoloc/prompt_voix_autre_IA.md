Tu vas générer la voix off de mes prochaines vidéos TikTok. Elle doit être IDENTIQUE à celle de mon autre compte : même voix, même ton, même vitesse, même hauteur. Je joins un échantillon de 12 s (`voix_reference_PsyColoc.m4a`) pour comparer. Suis exactement ces réglages, sans « améliorer » quoi que ce soit.

## 1. Moteur et réglages (à ne pas modifier)

- Moteur : Microsoft Edge Neural TTS, via la librairie Python `edge-tts` (`pip install edge-tts`)
- Voix : `fr-FR-HenriNeural`
- Vitesse : `rate="+38%"`
- Hauteur : `pitch="+30Hz"`
- Volume : par défaut
- Pas de SSML, pas de style émotionnel, pas d'effet audio (ni écho, ni compression, ni égaliseur)

Valeurs cibles une fois le texte lu : environ **4,5 mots par seconde** et une hauteur médiane d'environ **145 Hz**. Un script de ~300 mots doit donner ~65 s.

## 2. Méthode de génération

- Découpe le script en **scènes** de 1 à 2 phrases (une scène = un plan de 2 à 7 s). Génère chaque scène séparément.
- Retire les silences au début et à la fin de chaque morceau : seuil d'amplitude 0,012, en gardant 20 ms avant la voix et 60 ms après.
- Recolle les morceaux en laissant **0,08 s de silence** entre deux scènes, plus 0,25 s au tout début. C'est ce qui donne le débit enchaîné, sans respiration, typique de ces vidéos.
- Exporte en WAV mono 24 kHz pour le montage. Sur la vidéo finale, normalise le son à **-14 LUFS** avec un pic à -1,5 dBTP : `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out.mp4`
- **Pas de musique de fond** : la musique éventuelle est ajoutée directement dans TikTok, à environ 10 %.

Code minimal pour une scène, qui récupère aussi l'horodatage de chaque mot pour les sous-titres :

```python
import asyncio, edge_tts

async def tts(text, out_mp3):
    c = edge_tts.Communicate(text, "fr-FR-HenriNeural", rate="+38%", pitch="+30Hz", boundary="WordBoundary")
    words = []
    with open(out_mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append((ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"]))
    return words  # [(début_s, fin_s, mot), ...] → sous-titres synchronisés

asyncio.run(tts("Tu savais que…", "scene01.mp3"))
```

Derrière un proxy d'entreprise, une erreur « certificate verify failed » se règle en faisant pointer `certifi.where()` vers le bon certificat racine. Ne désactive jamais la vérification SSL.

## 3. Comment écrire le texte pour obtenir le même ton

- Phrases courtes et rythmées, à la 2ᵉ personne (« Tu savais que… », « Et devine quoi : … », « Alors si tu… »).
- Le **premier mot de la vidéo** est l'accroche : jamais de « Bonjour » ni d'introduction.
- La ponctuation pilote l'intonation : « ? » fait monter la voix, « … » crée une petite pause de suspense, « : » annonce une révélation. N'ajoute aucune autre pause.
- Écris les nombres en chiffres (« 36 », « 2003 », « 4,4 ») : la voix les lit correctement.
- Évite les mots que la voix prononce mal : préfère « binômes » à « duos » et « Et devine quoi » à « Spoiler ».

## 4. Contrôle qualité avant de livrer

1. Transcris l'audio (Whisper, par exemple) et vérifie que le texte ressort à l'identique. Sinon, reformule le mot mal prononcé.
2. Vérifie le débit : nombre de mots divisé par la durée, entre 4,3 et 4,8 mots/s.
3. Écoute côte à côte avec `voix_reference_PsyColoc.m4a` : ça doit être la même voix, au même rythme.
