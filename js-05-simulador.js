/* ============================================================
   SIMULADOR DE EVENTOS (modo de teste, sem precisar de live)
   - ativado com ?sim=1 no final do link do overlay
   - gera eventos falsos (chat, like, presente, seguidor,
   compartilhar) em intervalos aleatórios, então dá pra testar
   qualquer overlay no OBS/TikTok Studio com a live apagada e o
   TikFinity fechado.
   ============================================================ */
function gerarEventoFake() {
  // Só 4 nomes (não 8) pra concentrar os pontos em menos gente — assim os
  // tiers de prêmio (Config de "Prêmios da live") batem bem mais rápido
  // durante o teste. O likeCount também sobe (50-400 em vez de 1-30) pra
  // ultrapassar o "a cada X likes" com mais frequência.
  const nicks = ["ana_lives", "joao22", "gamer_br", "luiza.ttk"];
  const sorteio = Math.random() * 100;
  const nickname = nicks[Math.floor(Math.random() * nicks.length)];
  const userId = "teste_" + nickname;
  if (sorteio < 38) {
    return { event: "chat", data: { userId, nickname, comment: "mensagem de teste" } };
  } else if (sorteio < 68) {
    return { event: "like", data: { userId, nickname, likeCount: Math.floor(Math.random() * 350) + 50 } };
  } else if (sorteio < 88) {
    const opcoesDiamantes = [1, 1, 5, 5, 10, 10, 20, 50, 100, 500, 1000];
    const diamantes = opcoesDiamantes[Math.floor(Math.random() * opcoesDiamantes.length)];
    return { event: "gift", data: { userId, nickname, diamondCount: diamantes, repeatCount: 1 } };
  } else if (sorteio < 96) {
    return { event: "follow", data: { userId, nickname, followRole: 1 } };
  } else {
    return { event: "share", data: { userId, nickname } };
  }
}

// ------------------------------------------------------------
// SIMULADOR DO PAINEL (Fase 3): permite ao painel mandar UM evento
// específico e controlado (montado no formulário da aba Simulador),
// diferente do gerador aleatório acima. O overlay escuta via
// postMessage — funciona junto com ?sim=1 e com o TikFinity de
// verdade, sem conflito, porque só reage às mensagens que recebe.
// ------------------------------------------------------------
function escutarSimuladorDoPainel(processarFn) {
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.tipo !== "eventoSimuladoPainel") return;
    window.__silenciarSom = !!e.data.silencioso;
    try {
      processarFn(e.data.payload);
    } finally {
      window.__silenciarSom = false;
    }
  });
}

function iniciarSimulador(processarEvento, opcoes) {
  const min = (opcoes && opcoes.min) || 1200;
  const max = (opcoes && opcoes.max) || 3000;
  console.log("[modo teste] gerando eventos falsos automaticamente — sem live e sem TikFinity");
  processarEvento(gerarEventoFake());
  setInterval(() => processarEvento(gerarEventoFake()), min + Math.random() * (max - min));
}

// conecta no TikFinity e repassa cada evento recebido pra função aoReceber
function conectarTikFinity(cfg, tag, aoReceber) {
  function conectar() {
    const ws = new WebSocket(cfg.tikfinityWsUrl);
    ws.onopen = () => console.log(`[${tag}] conectado ao TikFinity`);
    ws.onmessage = (msg) => {
      let payload;
      try { payload = JSON.parse(msg.data); } catch (e) { return; }
      aoReceber(payload);
    };
    ws.onclose = () => setTimeout(conectar, 3000);
    ws.onerror = () => ws.close();
  }
  conectar();
}
