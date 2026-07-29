/* ============================================================
   OVERLAY: METAS — prêmios por espectador
   Cada espectador acumula pontos por conta própria (chat, likes,
   presentes, seguir, compartilhar) — todas as fontes ficam disponíveis
   pra qualquer prêmio, dá pra misturar à vontade. Quando OS PONTOS DELE
   batem um tier, ele desbloqueia aquele prêmio e aparece um card aqui
   avisando. Os pontos acumulam o mês inteiro sem perder nada — só
   zeram na virada do mês (automático) ou se o streamer resetar
   manualmente pelo painel (Config > Zona de risco).
   ============================================================ */
function dispararConfeteCanvas(container, cor) {
  if (typeof window.confetti !== "function") return;
  try {
    const rect = container.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
    window.confetti({ particleCount: 60, spread: 65, startVelocity: 32, origin, colors: [cor, "#ffffff"], disableForReducedMotion: true });
  } catch (e) { /* biblioteca indisponível (ex: sem internet) — segue só com o efeito local */ }
}

function dispararConfete(container, cor) {
  dispararConfeteCanvas(container, cor);
  const camada = document.createElement("div");
  camada.style.cssText = "position:absolute;left:50%;top:40%;width:0;height:0;pointer-events:none;";
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("span");
    const ang = Math.random() * Math.PI * 2;
    const dist = 26 + Math.random() * 34;
    const tx = Math.cos(ang) * dist;
    const ty = Math.sin(ang) * dist;
    p.style.cssText = `position:absolute;left:0;top:0;width:6px;height:6px;border-radius:2px;background:${Math.random() > 0.5 ? cor : "#fff"};--tx:${tx}px;--ty:${ty}px;--rot:${Math.round(Math.random() * 360)}deg;animation:confetePop 0.7s ease-out forwards;`;
    camada.appendChild(p);
  }
  container.appendChild(camada);
  setTimeout(() => camada.remove(), 750);
}

// ------------------------------------------------------------
// Efeitos de tela cheia (Fase 4 — "ações executáveis" de uma regra):
// confete/fogos não dependem de um card específico, então disparam
// direto na tela toda, reaproveitando o canvas-confetti já carregado.
// ------------------------------------------------------------
function efeitoConfeteTela(cor) {
  if (typeof window.confetti !== "function") return;
  try {
    window.confetti({ particleCount: 90, spread: 80, startVelocity: 38, origin: { x: 0.5, y: 0.4 }, colors: [cor || "#F0A63C", "#ffffff"], disableForReducedMotion: true });
  } catch (e) {}
}
function efeitoFogosTela(cor) {
  if (typeof window.confetti !== "function") return;
  const cores = [cor || "#F0464B", "#F0C24B", "#22D3EE", "#7F77DD"];
  [0, 300, 600].forEach((atraso, i) => {
    setTimeout(() => {
      try {
        window.confetti({
          particleCount: 55, spread: 360, startVelocity: 45, gravity: 0.6, ticks: 90, scalar: 1.05,
          origin: { x: 0.2 + Math.random() * 0.6, y: 0.25 + Math.random() * 0.25 },
          colors: [cores[i % cores.length], "#ffffff"], disableForReducedMotion: true,
        });
      } catch (e) {}
    }, atraso);
  });
}

function carregarPremios() {
  try { return JSON.parse(localStorage.getItem(chaveEspectadores("premiosPorUsuario")) || "{}"); }
  catch (e) { return {}; }
}
function salvarPremios(obj) {
  localStorage.setItem(chaveEspectadores("premiosPorUsuario"), JSON.stringify(obj));
}
// soma um valor no campo de um espectador lá na nuvem SEM NUNCA ler e
// reescrever o resto do objeto — usa o incremento atômico do Firebase
// (ServerValue.increment), que soma direto no servidor. Isso é essencial
// pra dois "escritores" diferentes (o overlay ao vivo no OBS e o painel
// somando pontos manuais) nunca um apagar o progresso que o outro já
// tinha salvo — cada update só toca o campo que mudou, nada mais.
function incrementarPontosNaNuvem(dbRef, userId, caminho, delta, nickname) {
  if (!dbRef || modoPreview || !userId || !delta) return;
  const atualizacoes = {};
  atualizacoes[caminho] = firebase.database.ServerValue.increment(delta);
  if (nickname) atualizacoes.nickname = nickname;
  try { dbRef.child(userId).update(atualizacoes).catch(() => {}); } catch (e) {}
}

// ------------------------------------------------------------
// Histórico diário de pontos: além do total do mês (premios[userId]),
// guarda também quanto cada espectador ganhou EM CADA DIA — pra dar pra
// ver, na aba Config > Pontos manuais, um histórico tipo "dia 28: 150
// pontos, dia 29: 40 pontos". Zera junto com tudo na virada do mês
// (checarResetAutomaticoMensal também limpa o histórico).
// ------------------------------------------------------------
function chaveDiaHoje() { return new Date().toISOString().slice(0, 10); } // "2026-07-29"

// soma pontos no total do mês (premios[userId].fontes) E no histórico do
// dia de hoje, numa chamada só — usado em todo lugar que dá pontos "de
// verdade" (evento real da live ou pontos manuais). NÃO usar em
// mesclarDuplicadoManual: ali os pontos só estão trocando de dono, não
// sendo ganhos agora, então não deve contar de novo no histórico de hoje.
function registrarPontosGanhos(userId, fonte, pontos, nickname) {
  incrementarPontosNaNuvem(dbRefPremios, userId, "fontes/" + fonte, pontos, nickname);
  incrementarPontosNaNuvem(dbRefHistorico, userId, chaveDiaHoje() + "/total", pontos, nickname);
}

function carregarRanking() {
  try { return JSON.parse(localStorage.getItem(chaveEspectadores("rankingUsuarios")) || "{}"); }
  catch (e) { return {}; }
}
function salvarRanking(obj) {
  localStorage.setItem(chaveEspectadores("rankingUsuarios"), JSON.stringify(obj));
}

// ------------------------------------------------------------
// Pontos "na mão" (fora de presente/like/etc): usado pela aba "Pontos
// manuais" do Config. O painel (navegador do streamer) NÃO tem os pontos
// de verdade no localStorage dele — quem escreve isso é o overlay,
// rodando num navegador separado (dentro do OBS) — então a busca pelo
// espectador (por nickname) e a soma dos pontos vão direto na nuvem,
// nunca no cache local daqui. Assim: (1) acha o userId de verdade do
// espectador, em vez de criar um espectador "fantasma" duplicado; (2) soma
// por cima com incremento atômico, sem apagar o que ele já tinha.
// ------------------------------------------------------------
function normalizarNickParaBusca(nick) { return String(nick || "").trim().toLowerCase().replace(/^@/, ""); }
function encontrarUserIdNaNuvemPorNick(nick, callback) {
  const alvo = normalizarNickParaBusca(nick);
  if (!dbRefRanking) { callback(null); return; }
  dbRefRanking.once("value").then(snap => {
    const dados = snap.val() || {};
    const achado = Object.entries(dados).find(([, u]) => normalizarNickParaBusca(u.nickname) === alvo);
    if (achado) { callback(achado[0]); return; }
    if (!dbRefPremios) { callback(null); return; }
    dbRefPremios.once("value").then(snap2 => {
      const dados2 = snap2.val() || {};
      const achado2 = Object.entries(dados2).find(([, u]) => normalizarNickParaBusca(u.nickname) === alvo);
      callback(achado2 ? achado2[0] : null);
    }).catch(() => callback(null));
  }).catch(() => callback(null));
}
function adicionarPontosManualmente(nick, pontos, aoTerminar) {
  const nickLimpo = String(nick || "").trim();
  encontrarUserIdNaNuvemPorNick(nickLimpo, (userIdAchado) => {
    const userId = userIdAchado || ("manual_" + (normalizarNickParaBusca(nickLimpo).replace(/[^a-z0-9_]/g, "") || "espectador") + "_" + Date.now());
    registrarPontosGanhos(userId, "manual", pontos, nickLimpo);
    incrementarPontosNaNuvem(dbRefRanking, userId, "pontos", pontos, nickLimpo);
    if (aoTerminar) aoTerminar(userId);
  });
}
// caminho sem busca por nome — usado quando o streamer ESCOLHE o
// espectador numa lista (em vez de digitar), então o userId já é o real,
// sem chance nenhuma de criar duplicado.
function adicionarPontosPorUserId(userId, pontos, aoTerminar) {
  incrementarPontosNaNuvem(dbRefRanking, userId, "pontos", pontos, null);
  registrarPontosGanhos(userId, "manual", pontos, null);
  if (aoTerminar) aoTerminar(userId);
}
// junta um espectador "fantasma" (criado por engano, nome não bateu 100%)
// com o espectador real: soma os pontos dele por cima (incremento atômico)
// e apaga o fantasma. Usado pela ferramenta "Mesclar duplicados".
function mesclarDuplicadoManual(userIdReal, userIdFantasma, pontosFantasma, aoTerminar) {
  if (pontosFantasma) incrementarPontosNaNuvem(dbRefRanking, userIdReal, "pontos", pontosFantasma, null);
  if (dbRefRanking) { try { dbRefRanking.child(userIdFantasma).remove().catch(() => {}); } catch (e) {} }
  if (dbRefPremios) {
    dbRefPremios.child(userIdFantasma).once("value").then(snap => {
      const dados = snap.val();
      if (dados && dados.fontes) {
        Object.entries(dados.fontes).forEach(([f, v]) => {
          if (v) incrementarPontosNaNuvem(dbRefPremios, userIdReal, "fontes/" + f, v, null);
        });
      }
      try { dbRefPremios.child(userIdFantasma).remove().catch(() => {}); } catch (e) {}
      if (aoTerminar) aoTerminar();
    }).catch(() => { if (aoTerminar) aoTerminar(); });
  } else if (aoTerminar) aoTerminar();
}

// ------------------------------------------------------------
// Pontos de presente: cada presente cai numa faixa (pelo tamanho dele
// em diamantes) e vale "pontos por diamante" DAQUELA faixa vezes o
// tamanho — não é progressivo/acumulado, cada presente é avaliado
// sozinho pelo próprio tamanho. Sempre com um piso mínimo por presente
// (cfg.valores.presenteMinimo), pra presente bem baratinho não valer
// quase nada. Usado em Prêmios, Ranking e Alerta de presente — os três
// mostram o mesmo valor em pontos.
// ------------------------------------------------------------
function pontosDoPresente(valorBase, cfg) {
  const v = cfg.valores;
  const diamantes = Number(valorBase) || 0;
  const faixasBrutas = (v.faixasPresente && v.faixasPresente.length) ? v.faixasPresente : CONFIG_PADRAO.valores.faixasPresente;
  // BUG corrigido: antes essa função pegava a PRIMEIRA faixa da lista cujo
  // "ate" bate, na ordem em que foi salva — então se o editor de Faixas de
  // presente (Config) salvasse as faixas fora de ordem (ex: usuário
  // reordenou/editou e ficou [{ate:1},{ate:99},{ate:10}] em vez de
  // [{ate:1},{ate:10},{ate:99}]), presentes de tamanho médio caíam na
  // faixa errada — dando pontos muito acima (ou abaixo) do esperado.
  // Agora a lista é normalizada (ate:null vira Infinity) e ORDENADA por
  // teto crescente antes de escolher a faixa, então o resultado é sempre
  // certo independente da ordem em que as faixas foram salvas.
  const faixasOrdenadas = faixasBrutas
    .map(f => ({ ate: f.ate == null ? Infinity : Number(f.ate), pontos: Number(f.pontos) || 0 }))
    .sort((a, b) => a.ate - b.ate);
  const faixa = faixasOrdenadas.find(f => diamantes <= f.ate) || faixasOrdenadas[faixasOrdenadas.length - 1];
  const proporcional = diamantes * (faixa ? faixa.pontos : 0);
  const minimo = v.presenteMinimo != null ? v.presenteMinimo : 10;
  return Math.max(minimo, proporcional);
}

// ------------------------------------------------------------
// Reset "do mês": TODOS os pontos (mensagem/like/presente/seguidor/
// compartilhamento) zeram sozinhos quando o mês do calendário muda —
// cada overlay detecta isso comparando com o próprio relógio, sem
// precisar de sinal do Firebase (o mês vira igual em qualquer lugar do
// mundo no mesmo dia). Fora disso, nada reseta sozinho: os pontos
// acumulam a live inteira e o mês inteiro sem perder nada.
// ------------------------------------------------------------
function chaveMesReferencia() { return chaveEspectadores("mesReferenciaMensal"); }

function checarResetAutomaticoMensal() {
  const mesAtual = new Date().toISOString().slice(0, 7); // "2026-07"
  const mesSalvo = localStorage.getItem(chaveMesReferencia());
  let resetou = false;
  if (mesSalvo && mesSalvo !== mesAtual) {
    const premiosAtual = carregarPremios();
    Object.values(premiosAtual).forEach(u => {
      if (u.fontes) Object.keys(u.fontes).forEach(f => { u.fontes[f] = 0; });
      u.tiersGanhos = [];
    });
    salvarPremios(premiosAtual);
    localStorage.removeItem(chaveEspectadores("rankingUsuarios"));
    // também zera na nuvem — senão o próprio sync (dbRefPremios/dbRefRanking
    // "on value") traz os pontos antigos de volta um instante depois.
    if (dbRefPremios && !modoPreview) dbRefPremios.set(premiosAtual).catch(() => {});
    if (dbRefRanking && !modoPreview) dbRefRanking.remove().catch(() => {});
    if (dbRefHistorico && !modoPreview) dbRefHistorico.remove().catch(() => {});
    resetou = true;
  }
  localStorage.setItem(chaveMesReferencia(), mesAtual);
  return resetou;
}

function renderMetas() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "metas");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  // roda antes de ler os prêmios do localStorage, pra já carregar os
  // dados frescos (zerados, se acabou de virar o mês) daqui pra baixo.
  checarResetAutomaticoMensal();

  const fontesPossiveis = ["mensagem", "like", "presente", "seguidor", "compartilhamento", "manual"];
  let premios = carregarPremios(); // { [userId]: { nickname, fontes:{...}, tiersGanhos:[] } }
  // fica ouvindo a nuvem: se alguém adicionar pontos manuais no painel (ou
  // se essa tela tiver aberto sem nada no localStorage local), atualiza
  // sozinho sem precisar recarregar a página.
  if (dbRefPremios && !modoPreview) {
    dbRefPremios.on("value", snap => {
      const daNuvem = snap.val();
      if (daNuvem) { premios = daNuvem; salvarPremios(premios); }
    });
  }

  const LAYOUTS_METAS = {
    lateral: { css: "position:fixed;top:24px;left:24px;max-width:380px;display:flex;flex-direction:column;gap:10px;", escala: 1 },
    barra:   { css: "position:fixed;bottom:0;left:0;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;padding:22px 0;", escala: 1.1 },
    popup:   { css: "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;", escala: 1.5 },
  };
  const layoutEscolhido = LAYOUTS_METAS[cfg.metas && cfg.metas.layout] || LAYOUTS_METAS.lateral;

  const root = document.createElement("div");
  root.style.cssText = layoutEscolhido.css;
  document.body.appendChild(root);
  const api = criarFilaDeCards(root, layoutEscolhido.escala);

  function obterUsuario(userId, nickname) {
    if (!premios[userId]) {
      premios[userId] = { nickname, fontes: Object.fromEntries(fontesPossiveis.map(f => [f, 0])), tiersGanhos: [] };
    }
    const u = premios[userId];
    if (!u.fontes) u.fontes = {};
    // migração: quem tinha pontos de presente guardados separado em
    // "presenteMensal" (modelo antigo, antes de tudo virar um balde só)
    // não pode perder isso — soma dentro de fontes.presente uma vez só.
    if (typeof u.presenteMensal === "number") {
      u.fontes.presente = (u.fontes.presente || 0) + u.presenteMensal;
      delete u.presenteMensal;
    }
    fontesPossiveis.forEach(f => { if (typeof u.fontes[f] !== "number") u.fontes[f] = 0; });
    if (nickname) u.nickname = nickname;
    return u;
  }

  function checarTiers(userId) {
    const u = premios[userId];
    cfg.tiers.forEach((tier, index) => {
      if (u.tiersGanhos.includes(tier.id)) return;
      const soma = (tier.fontes || []).reduce((s, f) => s + (u.fontes[f] || 0), 0);
      if (soma >= tier.pontos) {
        u.tiersGanhos.push(tier.id);
        // sem isso, um reload do overlay perderia a lista de prêmios já
        // ganhos (ela vem da nuvem) e anunciaria o mesmo prêmio de novo.
        if (dbRefPremios && !modoPreview) {
          try { dbRefPremios.child(userId).update({ tiersGanhos: u.tiersGanhos }).catch(() => {}); } catch (e) {}
        }
        const raridade = raridadeDoTier(index, cfg.tiers.length);
        api.mostrar({
          icone: iconeTierHtml(tier, 22),
          titulo: "prêmio desbloqueado",
          subtitulo: `${u.nickname} ganhou <span style="color:${raridade.cor};">${tier.nome}</span>`,
          destaque: true,
          tema: t,
          corDestaque: raridade.cor,
          raridade: raridade.nome,
          duracaoMs: 5500,
          animacoesAtivas: cfg.animacoes,
        });
        tocarSomConfig(cfg.sons.premio, cfg.sons.volume);
      }
    });
  }

  function processarEventoMetas(payload) {
    console.log("[overlay-metas] evento:", payload);
    if (checarResetAutomaticoMensal()) { location.reload(); return; }
    const tipo = payload.event;
    const data = payload.data || {};
    const v = cfg.valores;
    const userId = data.userId ?? data.uniqueId ?? data.user?.userId ?? data.user?.uniqueId;
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    if (!userId) return;
    const u = obterUsuario(userId, nickname);

    if (tipo === "gift") {
      const valorBase = extrairValorPresente(data);
      if (valorBase !== null) {
        const pts = pontosDoPresente(valorBase, cfg);
        u.fontes.presente += pts;
        registrarPontosGanhos(userId, "presente", pts, nickname);
      }
    }
    if (tipo === "chat" || tipo === "comment") {
      u.fontes.mensagem += v.mensagem;
      registrarPontosGanhos(userId, "mensagem", v.mensagem, nickname);
    }
    if (tipo === "like") {
      const qtd = data.likeCount ?? data.count ?? 1;
      const ganhos = Math.floor(qtd / v.likeACada) * v.likeValor;
      u.fontes.like += ganhos;
      registrarPontosGanhos(userId, "like", ganhos, nickname);
    }
    if (tipo === "follow" || tipo === "member") {
      u.fontes.seguidor += v.seguidor;
      registrarPontosGanhos(userId, "seguidor", v.seguidor, nickname);
    }
    if (tipo === "share") {
      u.fontes.compartilhamento += v.compartilhamento;
      registrarPontosGanhos(userId, "compartilhamento", v.compartilhamento, nickname);
    }

    // salva local só como cache/fallback — quem manda de verdade agora é a
    // nuvem, um campo por vez (incrementarPontosNaNuvem acima), pra nunca
    // apagar pontos que outra tela (painel, ranking) tenha somado.
    salvarPremios(premios);
    checarTiers(userId);
  }

  escutarSimuladorDoPainel(processarEventoMetas);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoMetas);
  } else {
    conectarTikFinity(cfg, "overlay-metas", processarEventoMetas);
  }
}
