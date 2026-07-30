/* ============================================================
   OVERLAY: TEXTO-PRA-VOZ (TTS)
   - fala em voz alta usando a Web Speech API do navegador que abre esse
     link (window.speechSynthesis), zero serviço externo/chave. Cada tipo
     de evento (mensagem, presente, seguidor, like, compartilhamento)
     liga/desliga, tem seu próprio modelo de frase e um cooldown pra não
     ficar repetindo o mesmo tipo toda hora — tudo configurado no modal
     "Config" do card na aba Overlays.
   - único elemento visual: um selinho "🔊 falando..." que aparece só
     enquanto a voz está lendo algo (dá pra desligar em Config).
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

// callbacks (opcional): { onInicio, onFim } — usados pelo selo visual
// "falando agora" (ver renderTts abaixo). Sem callbacks, funciona igual
// antes (só fala, sem avisar mais nada).
function falarTts(texto, ttsCfg, callbacks) {
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
  if (callbacks) {
    if (callbacks.onInicio) utter.onstart = () => callbacks.onInicio(texto);
    if (callbacks.onFim) { utter.onend = callbacks.onFim; utter.onerror = callbacks.onFim; }
  }
  speechSynthesis.speak(utter);
}

function renderTts() {
  const cfg = carregarConfig();
  const ttsCfg = cfg.tts;
  const t = temaEfetivo(cfg, "tts");
  document.body.style.background = "transparent";

  // ------------------------------------------------------------
  // Selo "🔊 falando..." — único elemento visual desse overlay. Fica
  // escondido o tempo todo, só some pra dentro da tela enquanto uma
  // fala está rolando (onstart/onend da utterance controlam isso).
  // ------------------------------------------------------------
  let selo = null;
  if (ttsCfg.mostrarSelo !== false) {
    selo = document.createElement("div");
    selo.style.cssText = `position:fixed;bottom:24px;left:24px;display:none;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:${t.corCard};border:1.5px solid ${t.corPrimaria};color:${t.corTexto};font-size:13px;font-weight:600;box-shadow:0 8px 20px rgba(0,0,0,.35);z-index:9999;`;
    selo.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${t.corPrimaria};animation:pulsarConexao 1s ease-in-out infinite;"></span><span>🔊 falando...</span>`;
    document.body.appendChild(selo);
  }
  function mostrarSelo() { if (selo) selo.style.display = "flex"; }
  function esconderSelo() { if (selo) selo.style.display = "none"; }

  // cooldown por tipo de evento — evita, por exemplo, ler todo like que
  // chega (like é frequente demais pra isso ficar bom de ouvir).
  const ultimaFalaPorTipo = {};

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

    const cooldownMs = (regraEvento.cooldownSegundos || 0) * 1000;
    if (cooldownMs > 0) {
      const agora = Date.now();
      if (ultimaFalaPorTipo[chaveEvento] && agora - ultimaFalaPorTipo[chaveEvento] < cooldownMs) return;
      ultimaFalaPorTipo[chaveEvento] = agora;
    }

    const texto = textoTtsComPlaceholders(regraEvento.template, ctx).trim();
    falarTts(texto, ttsCfg, { onInicio: mostrarSelo, onFim: esconderSelo });
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
