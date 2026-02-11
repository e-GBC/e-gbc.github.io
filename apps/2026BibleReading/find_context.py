path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/tts/sherpa-onnx-wasm.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('writeFile')
if idx != -1:
    print("Found 'writeFile' at:", idx)
    print("Context:", content[max(0, idx-100):idx+100])
else:
    print("'writeFile' not found.")
