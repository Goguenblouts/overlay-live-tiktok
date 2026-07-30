// Ponte segura entre a janela do Painel (index.html) e o processo
// principal (main.js) — expõe só as funções necessárias pro botão de
// "Conexão com a live" no dashboard, nada de Node/Electron cru dentro
// da página.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("central", {
    conectar: (dados) => ipcRenderer.invoke("conectar-tiktok", dados),
    desconectar: () => ipcRenderer.invoke("desconectar-tiktok"),
    lerConfig: () => ipcRenderer.invoke("ler-config"),
    lerStatus: () => ipcRenderer.invoke("ler-status"),
    aoAtualizarStatus: (callback) => {
          ipcRenderer.on("status-atualizado", (_evento, dados) => callback(dados));
    },
});
