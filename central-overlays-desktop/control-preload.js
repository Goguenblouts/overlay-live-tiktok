// Ponte segura entre a janela "Conexão com a live" (control.html) e o
// processo principal (main.js) — expõe só as funções necessárias,
// nada de Node/Electron cru dentro da página.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("central", {
    conectar: (username) => ipcRenderer.invoke("conectar-tiktok", username),
    desconectar: () => ipcRenderer.invoke("desconectar-tiktok"),
    lerConfig: () => ipcRenderer.invoke("ler-config"),
    lerStatus: () => ipcRenderer.invoke("ler-status"),
    aoAtualizarStatus: (callback) => {
          ipcRenderer.on("status-atualizado", (_evento, dados) => callback(dados));
    },
});
