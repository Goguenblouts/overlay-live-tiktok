/* ============================================================
   Central de Overlays — app desktop (Electron)
   Substitui o TikFinity: conecta direto na sua live do TikTok
   (via tiktok-live-connector, sem senha, só o @) e repassa os
   eventos (chat, like, presente, seguidor, compartilhamento) pra
   um servidor WebSocket local na porta 21213 — a mesma porta e o
   mesmo formato que a Central de Overlays (index.html, na pasta
   de cima) já espera no campo "Endereço da conexão" da Config.
   Ou seja: o site (index.html) NÃO precisa de nenhuma alteração,
   só aponta pra "ws://127.0.0.1:21213/" (já é o valor padrão dele).

   Duas janelas abrem ao iniciar o app:
   - Painel (index.html): a Central de Overlays de sempre.
   - Conexão com a live: janela pequena pra digitar o @ do TikTok
     e ligar/desligar a conexão — feito à parte do painel porque
     TikFinity/tiktok-live-connector não têm nada a ver com a
     configuração de overlays em si.
   ============================================================ */
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { WebSocketServer } = require("ws");

const PORTA_WS = 21213;
// Em desenvolvimento (npm start), index.html/styles.css/js-*.js ficam na
// pasta de cima (repo raiz). Num instalador gerado (npm run dist), o
// README pede pra copiar esses arquivos PRA DENTRO desta pasta antes de
// empacotar — então checa os dois lugares, nessa ordem.
const CAMINHO_INDEX_IRMAO = path.join(__dirname, "..", "index.html");
const CAMINHO_INDEX_LOCAL = path.join(__dirname, "index.html");
const CAMINHO_INDEX = fs.existsSync(CAMINHO_INDEX_IRMAO) ? CAMINHO_INDEX_IRMAO : CAMINHO_INDEX_LOCAL;
const CAMINHO_CONFIG_LOCAL = path.join(app.getPath("userData"), "central-overlays-desktop.json");

let janelaPainel = null;
let janelaConexao = null;
let servidorWs = null;
let conexaoTikTok = null;
let statusAtual = { status: "desconectado", mensagem: "Ainda não conectado." };

/* ------------------------------------------------------------
   Config local (só guarda o último @ usado, pra já vir preenchido
   da próxima vez que o app abrir).
   ------------------------------------------------------------ */
function lerConfigLocal() {
    try {
          return JSON.parse(fs.readFileSync(CAMINHO_CONFIG_LOCAL, "utf8"));
    } catch (e) {
          return { username: "" };
    }
}
function salvarConfigLocal(dados) {
    try {
          fs.writeFileSync(CAMINHO_CONFIG_LOCAL, JSON.stringify(dados, null, 2), "utf8");
    } catch (e) {
          console.warn("[config] não consegui salvar a config local:", e.message);
    }
}

/* ------------------------------------------------------------
   Servidor WebSocket local — é nele que o index.html (Browser
   Source no OBS/TikTok Studio, ou a própria janela do Painel)
   se conecta pra receber os eventos em tempo real.
   ------------------------------------------------------------ */
function iniciarServidorWebSocket() {
    servidorWs = new WebSocketServer({ port: PORTA_WS, host: "127.0.0.1" });

  servidorWs.on("listening", () => {
        console.log(`[ws] servidor local rodando em ws://127.0.0.1:${PORTA_WS}/`);
  });

  servidorWs.on("connection", (socket) => {
        console.log("[ws] um overlay acabou de se conectar");
        socket.on("close", () => console.log("[ws] um overlay se desconectou"));
  });

  servidorWs.on("error", (erro) => {
        console.error("[ws] erro no servidor local:", erro.message);
        const mensagem = erro.code === "EADDRINUSE"
          ? `A porta ${PORTA_WS} já está em uso — feche o TikFinity (ou qualquer outro programa) que esteja usando essa porta e reabra o app.`
                : "Erro ao abrir o servidor local: " + erro.message;
        atualizarStatus("erro-servidor", mensagem);
  });
}

function transmitirParaOverlays(payload) {
    if (!servidorWs) return;
    const texto = JSON.stringify(payload);
    servidorWs.clients.forEach((cliente) => {
          if (cliente.readyState === 1) cliente.send(texto);
    });
}

/* ------------------------------------------------------------
   Conexão com o TikTok (tiktok-live-connector) — usa só o @ do
   perfil, sem login/senha, igual o TikFinity faz. A lib é
   distribuída como ESM, então carregamos com import() dinâmico
   mesmo estando num arquivo CommonJS (o require() normal não
   entende módulos ESM-only).
   ------------------------------------------------------------ */
function dadosBasicosDoEvento(data) {
    return {
          userId: data.userId || data.uniqueId,
          uniqueId: data.uniqueId,
          nickname: data.nickname || data.uniqueId || "espectador",
    };
}

async function conectarNoTikTok(usernameBruto) {
    const username = String(usernameBruto || "").trim().replace(/^@/, "");
    if (!username) {
          atualizarStatus("erro", "Digite o @ do perfil que está ao vivo.");
          return;
    }

  await desconectarDoTikTok();
    atualizarStatus("conectando", `Conectando na live de @${username}...`);

  let WebcastPushConnection;
    try {
          // import() dinâmico: funciona dentro de um arquivo CommonJS mesmo
      // com uma dependência que só existe em formato ESM.
      ({ WebcastPushConnection } = await import("tiktok-live-connector"));
    } catch (erro) {
          console.error("[tiktok-live] falha ao carregar a biblioteca:", erro);
          atualizarStatus("erro", "Não consegui carregar o tiktok-live-connector — rode 'npm install' na pasta do app.");
          return;
    }

  conexaoTikTok = new WebcastPushConnection(username, {
        enableExtendedGiftInfo: true,
  });

  conexaoTikTok.on("chat", (data) => {
        transmitirParaOverlays({
                event: "chat",
                data: { ...dadosBasicosDoEvento(data), comment: data.comment || "" },
        });
  });

  conexaoTikTok.on("like", (data) => {
        transmitirParaOverlays({
                event: "like",
                data: { ...dadosBasicosDoEvento(data), likeCount: data.likeCount || 1 },
        });
  });

  conexaoTikTok.on("gift", (data) => {
        // PONTO EM ABERTO (avisado no README): o campo com a quantidade de
                       // diamantes do presente pode variar um pouco conforme a versão da
                       // lib (normalmente "diamondCount", mas confira aqui no log se o
                       // valor que aparecer no overlay estiver estranho).
                       console.log("[tiktok-live] evento de presente (cru, pra debug):", JSON.stringify(data));

                       // presentes "seguráveis" (tipo Rosa) disparam um evento a cada
                       // "tique" enquanto a pessoa segura — só conta quando repeatEnd
                       // vier true, senão o mesmo presente é contado várias vezes.
                       if (data.giftType === 1 && !data.repeatEnd) return;

                       const diamantes = data.diamondCount ?? data?.gift?.diamond_count ?? data?.giftDetails?.diamondCount ?? 1;
        const nomePresente = data.giftName ?? data?.gift?.name ?? "presente";

                       transmitirParaOverlays({
                               event: "gift",
                               data: {
                                         ...dadosBasicosDoEvento(data),
                                         diamondCount: diamantes,
                                         giftDetails: { giftName: nomePresente, giftType: data.giftType ?? 0 },
                                         repeatCount: data.repeatCount || 1,
                                         repeatEnd: data.repeatEnd !== false,
                               },
                       });
  });

  // A lib manda "follow" e "compartilhar" juntos num único evento
  // "social" — dá pra diferenciar pelo campo displayType.
  conexaoTikTok.on("social", (data) => {
        const tipo = String(data.displayType || "").toLowerCase();
        const base = dadosBasicosDoEvento(data);
        if (tipo.includes("follow")) {
                transmitirParaOverlays({ event: "follow", data: { ...base, followRole: 1 } });
        } else if (tipo.includes("share")) {
                transmitirParaOverlays({ event: "share", data: base });
        }
  });

  conexaoTikTok.on("streamEnd", () => {
        atualizarStatus("desconectado", "A live acabou.");
  });
    conexaoTikTok.on("disconnected", () => {
          atualizarStatus("desconectado", "A conexão com o TikTok caiu.");
    });

  try {
        const estado = await conexaoTikTok.connect();
        atualizarStatus("conectado", `Conectado na live de @${username} (sala ${estado.roomId}).`);
        salvarConfigLocal({ username });
  } catch (erro) {
        console.error("[tiktok-live] falha ao conectar:", erro);
        atualizarStatus("erro", `Não consegui conectar em @${username} — confira se a live está ao vivo agora. (${erro.message || erro})`);
        conexaoTikTok = null;
  }
}

async function desconectarDoTikTok() {
    if (conexaoTikTok) {
          try { conexaoTikTok.disconnect(); } catch (e) {}
          conexaoTikTok = null;
          atualizarStatus("desconectado", "Desconectado.");
    }
}

function atualizarStatus(status, mensagem) {
    statusAtual = { status, mensagem };
    console.log(`[status] ${status}: ${mensagem}`);
    if (janelaConexao && !janelaConexao.isDestroyed()) {
          janelaConexao.webContents.send("status-atualizado", statusAtual);
    }
}

/* ------------------------------------------------------------
   Janelas
   ------------------------------------------------------------ */
function criarJanelaPainel() {
    janelaPainel = new BrowserWindow({
          width: 1280,
          height: 820,
          title: "Central de Overlays",
          webPreferences: { contextIsolation: true },
    });
    janelaPainel.setMenuBarVisibility(false);
    janelaPainel.loadFile(CAMINHO_INDEX);
}

function criarJanelaConexao() {
    janelaConexao = new BrowserWindow({
          width: 420,
          height: 520,
          resizable: false,
          title: "Conexão com a live",
          webPreferences: {
                  preload: path.join(__dirname, "control-preload.js"),
                  contextIsolation: true,
          },
    });
    janelaConexao.setMenuBarVisibility(false);
    janelaConexao.loadFile(path.join(__dirname, "control.html"));
}

/* ------------------------------------------------------------
   Ponte com a janela "Conexão com a live" (control.html)
   ------------------------------------------------------------ */
ipcMain.handle("conectar-tiktok", (evento, username) => conectarNoTikTok(username));
ipcMain.handle("desconectar-tiktok", () => desconectarDoTikTok());
ipcMain.handle("ler-config", () => lerConfigLocal());
ipcMain.handle("ler-status", () => statusAtual);

app.whenReady().then(() => {
    iniciarServidorWebSocket();
    criarJanelaPainel();
    criarJanelaConexao();

                       app.on("activate", () => {
                             if (BrowserWindow.getAllWindows().length === 0) {
                                     criarJanelaPainel();
                                     criarJanelaConexao();
                             }
                       });
});

app.on("window-all-closed", () => {
    desconectarDoTikTok();
    if (servidorWs) servidorWs.close();
    if (process.platform !== "darwin") app.quit();
});
