import os

path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Restore correct head
head_pattern = re.compile(r'<head>.*?</head>', re.DOTALL)
new_head = """<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>懷恩堂編年式讀經</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#2196F3">
    <link rel="icon" type="image/png" href="icons/icon-192x192.png">
    <link rel="apple-touch-icon" href="icons/icon-192x192.png">

    <script src="../data/bible.js"></script>
    <script src="../data/bible_en.js"></script>
    <script src="js/i18n.js"></script>
    <script src="js/app-v23.js?v=23" defer></script>
    <script src="js/pwa-handler.js" defer></script>

    <!-- Sherpa-ONNX TTS -->
    <script src="tts/sherpa-onnx-wasm.js"></script>
    <script src="tts/sherpa-onnx-tts.js"></script>

    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(reg => {
                        console.log('SW Registered');
                    });
            });
        }
    </script>
</head>"""

content = head_pattern.sub(new_head, content)
content = content.replace('v.1.0.22', 'v.1.0.23')
content = content.replace('v.1.0.21', 'v.1.0.23')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
