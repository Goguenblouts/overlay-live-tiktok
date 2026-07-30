/* ============================================================
   OVERLAY: TEXTO-PRA-VOZ (TTS)
   - não tem elemento visual — só fala em voz alta usando a Web Speech
     API do navegador que abre esse link (window.speechSynthesis), zero
     serviço externo/chave. Cada tipo de evento (mensagem, presente,
     seguidor, like, compartilhamento) liga/desliga e tem seu próprio
     modelo de frase, configurado no modal "Config" do card na aba
     Overlays.
   - a API de voz enfileira sozinha (chamar .speak() de novo não corta a
     fala anterior), então não precisa de fila própria aqui.
   ============================================================ */
function textoTtsComPlaceholders(template, ctx) {
  return (template || "")
    .replace(/\{nickname\}/g, ctx.nickname || "espectador")
    .replace(/\{presente\}/g, ctx.presente || "")
    .replace(/\{mensagem\}/g, ctx.mensagem || "")
    .replace(/\{valor\}/g, ctx.valor != null ? String(ctx.valor) : "");
}

function falarTts(texto, ttsCfg) {
  if (!texto || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  // mesma trava de mudo usada pro resto do site: nas mini-prévias
  // (&mudo=1) e quando o Simulador pede silêncio, não fala nada.
  if (typeof modoMudo !== "undefined" && modoMudo) return;
  if (typeof window !== "undefined" && window.__silenciarSom) return;
  const utter = new SpeechSynthesisUtterance(texto);
  utter.rate = Number(ttsCfg.taxa) || 1;
  utter.pitch = Number(ttsCfg.tom) || 1;
  utter.volume = Math.max(0, Math.min(1, (ttsCfg.volume != null ? ttsCfg.volume : 80) / 100));
  if (ttsCfg.vozURI) {
    const voz = speechSynthesis.getVoices().find(v => v.voiceURI === ttsCfg.vozURI);
    if (voz) utter.voice = voz;
  }
  speechSynthesis.speak(utter);
}

function renderTts() {
  const cfg = carregarConfig();
  const ttsCfg = cfg.tts;
  // Browser Source sem visual — precisa existir na página só pra rodar
  // o JS que escuta os eventos e fala; deixa transparente por segurança
  // caso alguém abra numa aba comum sem querer.
  document.body.style.background = "transparent";

  function processarEventoTts(payload) {
    if (!ttsCfg.ativo) return;
    const tipo = payload.event === "comment" ? "chat" : payload.event === "member" ? "follow" : payload.event;
    const data = payload.data || {};
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    const ctx = { nickname };
    let chaveEvento = null;

    if (tipo === "chat") {
      chaveEvento = "mensagem";
      let msg = data.comment || "";
      if (ttsCfg.ignorarComandos && /^[!/]/.test(msg.trim())) return;
      ctx.mensagem = msg.slice(0, ttsCfg.tamanhoMaximo || 200);
    } else if (tipo === "gift") {
      chaveEvento = "presente";
      ctx.presente = data.giftDetails?.giftName ?? data.giftName ?? "um presente";
      const base = extrairValorPresente(data);
      ctx.valor = base === null ? 0 : base;
    } else if (tipo === "follow") {
      chaveEvento = "seguidor";
    } else if (tipo === "like") {
      chaveEvento = "like";
      ctx.valor = data.likeCount ?? data.count ?? 1;
    } else if (tipo === "share") {
      chaveEvento = "compartilhamento";
    }
    if (!chaveEvento) return;

    const regraEvento = ttsCfg.eventos[chaveEvento];
    if (!regraEvento || !regraEvento.ativo) return;
    const texto = textoTtsComPlaceholders(regraEvento.template, ctx).trim();
    falarTts(texto, ttsCfg);
  }

  escutarSimuladorDoPainel(processarEventoTts);
  if (params.get("sim") === "1") {
    // eventos mais espaçados que os outros overlays — falar rápido
    // demais em sequência vira ruído incompreensível.
    iniciarSimulador(processarEventoTts, { min: 2500, max: 5000 });
  } else {
    conectarTikFinity(cfg, "overlay-tts", processarEventoTts);
  }
}
