import os

path = r'c:/Antigravity/000.e-GBC/apps/2026BibleReading/app/tts/sherpa-onnx-wasm.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

mock = 'var Module = moduleArg; var nodePath = { posix: { resolve: function() { return Array.from(arguments).pop(); }, relative: function(f, t) { return t; } }, isAbsolute: function(p) { return p.startsWith("/"); }, normalize: function(p) { return p; }, dirname: function(p) { return p.split("/").slice(0, -1).join("/") || "."; }, basename: function(p) { return p.split("/").pop(); }, join: function() { return Array.from(arguments).join("/").replace(/\/+/g, "/"); } }; var fs = { readFileSync: function() { }, lstatSync: function() { }, realpathSync: function(p) { return p; }, read: function() {}, readFile: function() {} }; '

# Line 9 is index 8
lines[8] = lines[8].replace('var Module = moduleArg;', mock)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
