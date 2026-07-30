/* ============================================================
   OVERLAY: ALERTA DE PRESENTE
   ============================================================ */

// gerencia uma fila de cards genéricos dentro de "container" — usado
// pelo alerta de presente E pelo aviso de prêmio desbloqueado (e pela
// prévia do painel). cada item: {icone, titulo, subtitulo, destaque,
// tema, duracaoMs, animacoesAtivas}
const ANIMACOES_CARD = {
  slide: { in: "slideInTop 0.35s cubic-bezier(.22,1,.36,1) both", out: "slideOutTop 0.3s ease both" },
  fade:  { in: "fadeInCard 0.3s ease both", out: "fadeOutCard 0.3s ease both" },
  zoom:  { in: "zoomInCard 0.32s cubic-bezier(.22,1,.36,1) both", out: "zoomOutCard 0.25s ease both" },
  bounce:{ in: "bounceInCard 0.55s cubic-bezier(.22,1,.36,1) both", out: "bounceOutCard 0.25s ease both" },
};

function criarFilaDeCards(container, escala) {
  escala = escala || 1;
  const fila = [];
  let mostrando = false;

  function processarFila() {
    if (mostrando || fila.length === 0) return;
    mostrando = true;
    const { icone, titulo, subtitulo, destaque, tema, duracaoMs, animacoesAtivas, corDestaque, raridade } = fila.shift();
    const corBorda = corDestaque || tema.corPrimaria;
    const raioCard = Math.max(8, tema.raio) * escala;
    const fundoCard = raridade
      ? `${gradienteRaridade(corBorda)}, ${tema.corCard}`
      : tema.corCard;
    const anim = ANIMACOES_CARD[tema.animacaoEstilo] || ANIMACOES_CARD.slide;
    const cartao = document.createElement("div");
    cartao.className = raridade ? "card-raridade" : "";
    cartao.style.cssText = `position:relative;display:flex;align-items:center;gap:${12 * escala}px;padding:${14 * escala}px ${18 * escala}px;border-radius:${raioCard}px;background:${fundoCard};border:1.5px solid ${destaque ? corBorda : (raridade ? corBorda + "88" : tema.corBorda)};box-shadow:0 10px 30px rgba(0,0,0,.35)${destaque ? `, 0 0 0 1px ${corBorda}55, 0 0 24px ${corBorda}55` : ""};animation:${anim.in};`;
    cartao.innerHTML = `
      <div style="width:${38 * escala}px;height:${38 * escala}px;flex-shrink:0;border-radius:50%;background:${corBorda};display:flex;align-items:center;justify-content:center;font-size:${18 * escala}px;">${icone}</div>
      <div style="min-width:0;">
        <div style="font-size:${12 * escala}px;color:${tema.corTextoSec};">${titulo}${raridade ? ` · <span style="color:${corBorda};font-weight:600;">${raridade}</span>` : ""}</div>
        <div style="font-size:${15 * escala}px;color:${tema.corTexto};font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subtitulo}</div>
      </div>
    `;
    container.appendChild(cartao);
    if (destaque && animacoesAtivas !== false) dispararConfete(cartao, corBorda);
    setTimeout(() => {
      cartao.style.animation = anim.out;
      setTimeout(() => {
        cartao.remove();
        mostrando = false;
        processarFila();
      }, 300);
    }, duracaoMs);
  }

  return {
    mostrar(opcoes) {
      fila.push(opcoes);
      processarFila();
    },
  };
}

/* ============================================================
   CARDS DE AÇÃO (aba Eventos) — mais ricos que os cards genéricos
   acima: texto com fonte/cor/contorno/sombra/alinhamento própria,
   ícone (emoji/imagem/gif/svg/lottie), fundo (cor/gradiente/imagem/
   blur/glow/opacidade), barra de progresso e a lista completa de
   animações de entrada/saída.
   ============================================================ */
const ANIMACOES_ACAO = {
  fade:        { in: "fadeInCard 0.3s ease both",                          out: "fadeOutCard 0.3s ease both" },
  slideTop:    { in: "slideInTop 0.35s cubic-bezier(.22,1,.36,1) both",     out: "slideOutTop 0.3s ease both" },
  slideBottom: { in: "slideInBottom 0.35s cubic-bezier(.22,1,.36,1) both",  out: "slideOutBottom 0.3s ease both" },
  slideLeft:   { in: "slideInLeft 0.35s cubic-bezier(.22,1,.36,1) both",    out: "slideOutLeft 0.3s ease both" },
  slideRight:  { in: "slideInRight 0.35s cubic-bezier(.22,1,.36,1) both",   out: "slideOutRight 0.3s ease both" },
  zoom:        { in: "zoomInCard 0.32s cubic-bezier(.22,1,.36,1) both",     out: "zoomOutCard 0.25s ease both" },
  scale:       { in: "scaleInCard 0.28s ease both",                        out: "scaleOutCard 0.22s ease both" },
  bounce:      { in: "bounceInCard 0.55s cubic-bezier(.22,1,.36,1) both",   out: "bounceOutCard 0.25s ease both" },
  elastic:     { in: "elasticInCard 0.65s cubic-bezier(.22,1,.36,1) both",  out: "elasticOutCard 0.3s ease both" },
  flip:        { in: "flipInCard 0.45s ease both",                         out: "flipOutCard 0.35s ease both" },
  rotate:      { in: "rotateInCard 0.4s cubic-bezier(.22,1,.36,1) both",    out: "rotateOutCard 0.3s ease both" },
  pop:         { in: "popInCard 0.35s ease both",                          out: "popOutCard 0.25s ease both" },
  shake:       { in: "shakeInCard 0.5s ease both",                         out: "shakeOutCard 0.25s ease both" },
  glitch:      { in: "glitchInCard 0.4s steps(6) both",                    out: "glitchOutCard 0.3s steps(4) both" },
};
const ANIMACOES_ACAO_INFO = [
  { id: "fade", nome: "Fade" }, { id: "slideLeft", nome: "Slide Left" }, { id: "slideRight", nome: "Slide Right" },
  { id: "slideTop", nome: "Slide Top" }, { id: "slideBottom", nome: "Slide Bottom" }, { id: "zoom", nome: "Zoom" },
  { id: "scale", nome: "Scale" }, { id: "bounce", nome: "Bounce" }, { id: "elastic", nome: "Elastic" },
  { id: "flip", nome: "Flip" }, { id: "rotate", nome: "Rotate" }, { id: "pop", nome: "Pop" },
  { id: "shake", nome: "Shake" }, { id: "glitch", nome: "Glitch" },
];

// Carrega a lib lottie-web sob demanda (só se alguma ação usar ícone
// Lottie) e inicia qualquer animação pendente na tela.
let _lottiePromise = null;
function garantirLottie() {
  if (typeof window.lottie !== "undefined") return Promise.resolve();
  if (_lottiePromise) return _lottiePromise;
  _lottiePromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js";
    script.onload = () => resolve();
    script.onerror = () => resolve(); // falha silenciosa (ex: sem internet) — ícone some, resto continua
    document.head.appendChild(script);
  });
  return _lottiePromise;
}
function iniciarLottiesPendentes(container) {
  const alvos = container.querySelectorAll(".lottie-acao[data-lottie-url]:not([data-lottie-ok])");
  if (!alvos.length) return;
  garantirLottie().then(() => {
    if (typeof window.lottie === "undefined") return;
    alvos.forEach(el => {
      el.setAttribute("data-lottie-ok", "1");
      try {
        window.lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: true, path: el.dataset.lottieUrl });
      } catch (e) { /* json inválido ou inacessível — segue sem o ícone */ }
    });
  });
}

// Ícone de uma ação: emoji (texto puro), imagem/gif/svg (img), lottie
// (json animado) ou "auto" (comportamento antigo: classe FA ou emoji por
// palavra-chave no nome, via iconeTierHtml — mantém ações antigas iguais).
function iconeAcaoHtml(acao, tamanhoPx) {
  const tamanho = tamanhoPx || 20;
  const tipo = acao.iconeTipo || "auto";
  if ((tipo === "imagem" || tipo === "gif" || tipo === "svg") && acao.iconeUrl) {
    return `<img src="${acao.iconeUrl}" style="width:${tamanho}px;height:${tamanho}px;object-fit:cover;border-radius:50%;" onerror="this.style.opacity='0'"/>`;
  }
  if (tipo === "lottie" && acao.iconeUrl) {
    return `<div class="lottie-acao" data-lottie-url="${acao.iconeUrl}" style="width:${tamanho + 6}px;height:${tamanho + 6}px;"></div>`;
  }
  if (tipo === "emoji") {
    return `<span style="font-size:${tamanho}px;line-height:1;">${acao.icone || "⭐"}</span>`;
  }
  return iconeTierHtml({ icone: acao.icone, nome: acao.nome }, tamanho);
}

// Toca o som de uma ação com suporte a volume próprio, fade in/out e
// loop (só faz sentido pra som "personalizado", os tons embutidos são
// curtos demais pra fade/loop). Devolve uma função pra parar na hora
// (usada quando o card some antes do fim do som, ex: loop).
function tocarSomAcao(somCfg, volumeGeral, duracaoMs) {
  if (!somCfg || !somCfg.ativo) return () => {};
  if (typeof modoMudo !== "undefined" && modoMudo) return () => {};
  if (typeof window !== "undefined" && window.__silenciarSom) return () => {};
  const volBase = Math.min(1, Math.max(0, ((somCfg.volume ?? volumeGeral) ?? 70) / 100));
  if (somCfg.som !== "personalizado" || !somCfg.url) {
    tocarSom(somCfg.som, somCfg.volume ?? volumeGeral);
    return () => {};
  }
  try {
    const audio = new Audio(somCfg.url);
    audio.loop = !!somCfg.loop;
    const fadeInMs = somCfg.fadeInMs || 0;
    const fadeOutMs = somCfg.fadeOutMs || 0;
    audio.volume = fadeInMs > 0 ? 0 : volBase;
    audio.play().catch(e => console.warn("[som] não consegui tocar o link:", e));
    let timerFadeIn = null, timerFadeOut = null;
    if (fadeInMs > 0) {
      const passos = 20;
      let passo = 0;
      timerFadeIn = setInterval(() => {
        passo++;
        audio.volume = Math.min(volBase, (volBase * passo) / passos);
        if (passo >= passos) clearInterval(timerFadeIn);
      }, fadeInMs / passos);
    }
    if (fadeOutMs > 0 && duracaoMs && duracaoMs > fadeOutMs) {
      timerFadeOut = setTimeout(() => {
        const passos = 20;
        let passo = 0;
        const partida = audio.volume;
        const t2 = setInterval(() => {
          passo++;
          audio.volume = Math.max(0, partida * (1 - passo / passos));
          if (passo >= passos) clearInterval(t2);
        }, fadeOutMs / passos);
      }, duracaoMs - fadeOutMs);
    }
    const parar = () => {
      if (timerFadeIn) clearInterval(timerFadeIn);
      if (timerFadeOut) clearTimeout(timerFadeOut);
      try { audio.pause(); } catch (e) {}
    };
    registrarSomAtivo(parar);
    return parar;
  } catch (e) { console.warn("[som] falhou:", e); return () => {}; }
}

// Monta o HTML/CSS de uma ação completa (fundo, borda, glow, texto
// estilizado, barra de progresso) — usado tanto no card real do overlay
// quanto na prévia ao vivo do editor, garantindo que fica idêntico.
// "extras" (opcional): { raridade } — nome de uma raridade (RARIDADES_TIER)
// pra mostrar um selinho colorido, usado pela Roleta de presente.
function montarCardAcaoHtml(acao, tema, textoResolvido, extras) {
  const corDestaque = acao.cor || tema.corPrimaria;
  const fundo = Object.assign({ tipo: "cor", cor: tema.corCard, corGradiente2: tema.corFundo, imagemUrl: "", blur: 0, glow: false, radius: tema.raio, opacidade: 100 }, acao.fundo || {});
  const txt = Object.assign({ fonte: "", cor: tema.corTexto, tamanho: 15, alinhamento: "left", contornoAtivo: false, contornoCor: "#000000", contornoEspessura: 2, sombraAtiva: false, sombraCor: "#000000", sombraBlur: 4 }, acao.textoEstilo || {});
  const barra = Object.assign({ ativo: false, cor: corDestaque, espessura: 4 }, acao.barraProgresso || {});
  const raridadeInfo = extras && extras.raridade ? raridadePorNome(extras.raridade) : null;

  let backgroundCss;
  if (fundo.tipo === "gradiente") backgroundCss = `background:linear-gradient(135deg, ${fundo.cor}, ${fundo.corGradiente2});`;
  else if (fundo.tipo === "imagem" && fundo.imagemUrl) backgroundCss = `background:url('${fundo.imagemUrl}') center/cover, ${fundo.cor};`;
  else backgroundCss = `background:${fundo.cor};`;
  const blurCss = fundo.blur > 0 ? `backdrop-filter:blur(${fundo.blur}px);-webkit-backdrop-filter:blur(${fundo.blur}px);` : "";
  const opacidadeDecimal = Math.max(0, Math.min(100, fundo.opacidade)) / 100;
  const glowCss = fundo.glow ? `0 0 22px ${corDestaque}88, ` : "";

  const fonteFamilia = FONTES[txt.fonte] ? FONTES[txt.fonte].css : "inherit";
  const textoSombraPartes = [];
  if (txt.contornoAtivo) {
    const e = txt.contornoEspessura;
    textoSombraPartes.push(`-${e}px -${e}px 0 ${txt.contornoCor}`, `${e}px -${e}px 0 ${txt.contornoCor}`, `-${e}px ${e}px 0 ${txt.contornoCor}`, `${e}px ${e}px 0 ${txt.contornoCor}`);
  }
  if (txt.sombraAtiva) textoSombraPartes.push(`2px 3px ${txt.sombraBlur}px ${txt.sombraCor}`);
  const textoSombraCss = textoSombraPartes.length ? `text-shadow:${textoSombraPartes.join(",")};` : "";

  const innerHtml = `
    <div class="acao-fundo" style="position:absolute;inset:0;${backgroundCss}${blurCss}opacity:${opacidadeDecimal};"></div>
    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:12px;padding:14px 18px;text-align:${txt.alinhamento};${txt.alinhamento === "center" ? "justify-content:center;" : txt.alinhamento === "right" ? "justify-content:flex-end;" : ""}">
      <div style="width:38px;height:38px;flex-shrink:0;border-radius:50%;background:${corDestaque};display:flex;align-items:center;justify-content:center;font-size:18px;">${iconeAcaoHtml(acao, 18)}</div>
      <div style="min-width:0;">
        <div style="font-size:11.5px;color:${tema.corTextoSec};">${acao.nome || ""}${raridadeInfo ? ` · <span style="color:${raridadeInfo.cor};font-weight:700;">${raridadeInfo.nome}</span>` : ""}</div>
        <div style="font-size:${txt.tamanho}px;color:${txt.cor};font-weight:700;font-family:${fonteFamilia};${textoSombraCss}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${textoResolvido}</div>
      </div>
    </div>
    ${barra.ativo ? `<div style="position:relative;z-index:1;height:${barra.espessura}px;background:${barra.cor}33;"><div class="acao-barra-progresso" style="height:100%;width:100%;background:${barra.cor};transform-origin:left;"></div></div>` : ""}
  `.trim();
  const corBordaFinal = raridadeInfo ? raridadeInfo.cor : corDestaque;
  const wrapperCss = `position:relative;overflow:hidden;border-radius:${fundo.radius}px;border:1.5px solid ${corBordaFinal};box-shadow:${raridadeInfo ? `0 0 20px ${raridadeInfo.cor}66, ` : glowCss}0 10px 30px rgba(0,0,0,.35);`;
  return { innerHtml, wrapperCss };
}

// opcoes (Fase 4 — "Sistema de Fila"): { config: { maximoItens, agruparIguais,
// ignorarDuplicados }, aoAtualizar: fn(itens) } — tudo opcional, sem opcoes
// o comportamento é idêntico ao original (fila sem limite, sem agrupar).
function criarFilaDeAcoes(container, volumeGeralPadrao, opcoes) {
  const cfgFila = Object.assign({ maximoItens: 0, agruparIguais: false, ignorarDuplicados: false }, (opcoes && opcoes.config) || {});
  const aoAtualizar = (opcoes && opcoes.aoAtualizar) || null;
  const fila = [];
  let mostrando = false;
  let itemAtual = null;
  let cartaoAtual = null;
  let timerAtual = null;
  const ultimoDisparoPorAcao = {};

  function notificar() {
    if (!aoAtualizar) return;
    const itens = [];
    if (itemAtual) itens.push({ nome: itemAtual.acao.nome, cor: itemAtual.acao.cor, status: "mostrando" });
    fila.forEach(it => itens.push({ nome: it.acao.nome, cor: it.acao.cor, status: "aguardando", quantidade: it.quantidade || 1 }));
    try { aoAtualizar(itens); } catch (e) {}
  }

  function processarFila() {
    if (mostrando || fila.length === 0) return;
    mostrando = true;
    const item = fila.shift();
    itemAtual = item;
    const { acao, tema, extras } = item;
    let textoResolvido = item.textoResolvido;
    if (item.quantidade > 1) textoResolvido += ` (x${item.quantidade})`;
    const montado = montarCardAcaoHtml(acao, tema, textoResolvido, extras);
    const anim = ANIMACOES_ACAO[(acao.animacao && acao.animacao.entrada) || "slideTop"] || ANIMACOES_ACAO.fade;
    const cartao = document.createElement("div");
    cartao.className = acao.interromperFila ? "acao-card-interrupcao" : "";
    cartao.style.cssText = montado.wrapperCss + `animation:${anim.in};`;
    cartao.innerHTML = montado.innerHtml;
    container.appendChild(cartao);
    cartaoAtual = cartao;
    iniciarLottiesPendentes(cartao);
    const barraEl = cartao.querySelector(".acao-barra-progresso");
    const duracaoMs = acao.duracaoMs || 4000;
    if (barraEl) {
      requestAnimationFrame(() => {
        barraEl.style.transition = `transform ${duracaoMs}ms linear`;
        barraEl.style.transform = "scaleX(0)";
      });
    }
    const pararSom = tocarSomAcao(acao.som, volumeGeralPadrao, duracaoMs);
    const animSaida = ANIMACOES_ACAO[(acao.animacao && acao.animacao.saida) || "fade"] || ANIMACOES_ACAO.fade;
    notificar();
    timerAtual = setTimeout(() => {
      pararSom();
      cartao.style.animation = animSaida.out;
      setTimeout(() => {
        cartao.remove();
        if (cartaoAtual === cartao) cartaoAtual = null;
        mostrando = false;
        itemAtual = null;
        timerAtual = null;
        notificar();
        processarFila();
      }, 320);
    }, duracaoMs);
  }

  return {
    // "extras" (opcional): { raridade } — repassado até montarCardAcaoHtml
    // pra mostrar o selinho de raridade (usado pela Roleta de presente).
    mostrar(acao, tema, textoResolvido, animacoesAtivas, extras) {
      const agora = Date.now();
      const cooldownMs = acao.cooldownMs || 0;
      if (cooldownMs > 0 && ultimoDisparoPorAcao[acao.id] && agora - ultimoDisparoPorAcao[acao.id] < cooldownMs) return; // ainda em cooldown
      ultimoDisparoPorAcao[acao.id] = agora;

      // "Interromper fila" (Alertas + interrupções, estilo StreamToEarn):
      // essa ação passa na frente de tudo — limpa o que já tá na tela e
      // na espera, e mostra na hora. O cooldown acima já evita spam.
      if (acao.interromperFila) {
        fila.length = 0;
        if (timerAtual) { clearTimeout(timerAtual); timerAtual = null; }
        if (cartaoAtual) { cartaoAtual.remove(); cartaoAtual = null; }
        mostrando = false;
        itemAtual = null;
        fila.push({ acao, tema, textoResolvido, animacoesAtivas, extras, quantidade: 1 });
        notificar();
        processarFila();
        return;
      }

      if (cfgFila.ignorarDuplicados) {
        const jaTem = (itemAtual && itemAtual.acao.id === acao.id && itemAtual.textoResolvido === textoResolvido)
          || fila.some(it => it.acao.id === acao.id && it.textoResolvido === textoResolvido);
        if (jaTem) return;
      }
      if (cfgFila.agruparIguais) {
        const existente = fila.find(it => it.acao.id === acao.id);
        if (existente) { existente.quantidade = (existente.quantidade || 1) + 1; notificar(); return; }
      }

      const prioridade = acao.prioridade || 5;
      let indiceInsercao = fila.length;
      for (let i = 0; i < fila.length; i++) {
        if ((fila[i].acao.prioridade || 5) < prioridade) { indiceInsercao = i; break; }
      }
      fila.splice(indiceInsercao, 0, { acao, tema, textoResolvido, animacoesAtivas, extras, quantidade: 1 });
      if (cfgFila.maximoItens > 0 && fila.length > cfgFila.maximoItens) {
        fila.length = cfgFila.maximoItens; // descarta o excesso do fim (menor prioridade primeiro)
      }
      notificar();
      processarFila();
    },
    // "Cancelar fila" (Fase 4): esvazia tudo que está esperando e tira o
    // card que estiver na tela na hora, sem esperar a duração dele acabar.
    cancelar() {
      fila.length = 0;
      if (timerAtual) { clearTimeout(timerAtual); timerAtual = null; }
      if (cartaoAtual) { cartaoAtual.remove(); cartaoAtual = null; }
      mostrando = false;
      itemAtual = null;
      notificar();
    },
  };
}

function renderAlerta() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "alerta");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  const root = document.createElement("div");
  root.style.cssText = "display:flex;flex-direction:column;gap:10px;max-width:360px;";
  document.body.appendChild(root);
  const api = criarFilaDeCards(root);
  let recordeAtual = 0;

  function processarEventoAlerta(payload) {
    if (payload.event !== "gift") return;
    const data = payload.data || {};
    const valorBase = extrairValorPresente(data);
    if (valorBase === null) return;
    const valor = pontosDoPresente(valorBase, cfg);

    tocarSomConfig(cfg.sons.presente, cfg.sons.volume);
    if (!cfg.alerta.ativo || valor < cfg.alerta.valorMinimo) return;
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    const ehRecorde = valor > recordeAtual;
    if (ehRecorde) recordeAtual = valor;
    api.mostrar({
      icone: "🎁",
      titulo: ehRecorde ? "🏆 maior presente da live" : "novo presente",
      subtitulo: `${nickname} <span style="color:${t.corPrimaria};">· ${valor} pts</span>`,
      destaque: ehRecorde,
      tema: t,
      duracaoMs: cfg.alerta.duracaoMs,
      animacoesAtivas: cfg.animacoes,
    });
  }

  escutarSimuladorDoPainel(processarEventoAlerta);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoAlerta, { min: 900, max: 2200 });
  } else {
    conectarTikFinity(cfg, "overlay-alerta", processarEventoAlerta);
  }
}
