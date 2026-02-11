path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/tts/sherpa-onnx-wasm.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 9 is index 8
lines[8] = lines[8].replace('throw new Error("NODERAWFS is currently only supported on Node.js environment.")', 'console.warn("Bypassed NODERAWFS check")')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
