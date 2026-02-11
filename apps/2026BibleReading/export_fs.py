path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/tts/sherpa-onnx-wasm.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find 'var FS = {'
idx = content.find('var FS = {')
if idx != -1:
    # Insert 'Module["FS"] = FS;' after the next ';' or just after the declaration.
    # Actually, let's just insert it right after the declaration start to be safe.
    # var FS = { ... }; Module["FS"] = FS;
    # But FS is large. Let's find the closing '};' of the FS object.
    
    # Simple approach: Insert it at the very end of the factory function.
    # We know the factory function ends with 'return moduleArg'.
    ret_idx = content.rfind('return moduleArg')
    if ret_idx != -1:
        content = content[:ret_idx] + 'moduleArg["FS"] = FS; ' + content[ret_idx:]
        print("Exported FS to moduleArg.")
    else:
        print("Could not find return moduleArg.")
else:
    print("Could not find var FS = {")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
