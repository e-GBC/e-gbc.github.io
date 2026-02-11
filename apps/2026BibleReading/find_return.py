path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/tts/sherpa-onnx-wasm.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the factory function.
# It starts at line 9.
# Let's search for "return " near the end of the first big function.
idx = content.rfind('return ')
print("Last 'return ' at:", idx)
print("Context:", content[max(0, idx-100):idx+100])
