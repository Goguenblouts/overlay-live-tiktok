# build/

Pasta pra ícones do instalador (opcional). Se quiser um ícone próprio:

- Windows: `build/icon.ico`
- macOS: `build/icon.icns`
- Linux: `build/icon.png` (512x512)

Depois de colocar os arquivos, referencie-os no `package.json`, dentro
de `build.win.icon` / `build.mac.icon` / `build.linux.icon`. Sem isso,
o `electron-builder` usa um ícone padrão genérico — o app funciona
normalmente do mesmo jeito.
