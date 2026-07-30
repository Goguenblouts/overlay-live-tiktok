/* ============================================================
   OVERLAY: RANKING
   ============================================================ */
function renderRanking() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "ranking");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  // "Top seguidores do mês" acumula o mês inteiro, sem resetar entre
  // lives — só zera na virada do mês (ver checarResetAutomaticoMensal).
  checarResetAutomaticoMensal();

  let ranking = carregarRanking();
  let seguidoresConhecidos = JSON.parse(localStorage.getItem(chaveEspectadores("seguidoresConhecidos")) || "{}");
  function salvarSeguidores() { localStorage.setItem(chaveEspectadores("seguidoresConhecidos"), JSON.stringify(seguidoresConhecidos)); }
  // igual no overlay de Prêmios: fica ouvindo a nuvem pra pegar pontos
  // manuais adicionados no painel (ou recuperar os dados se essa tela
  // abriu com o localStorage local vazio) e atualiza a lista na hora.
  if (dbRefRanking && !modoPreview) {
    dbRefRanking.on("value", snap => {
      const daNuvem = snap.val();
      if (daNuvem) { ranking = daNuvem; salvarRanking(ranking); render(); }
    });
  }
  // também ouve os prêmios — só pra mostrar certinho quantos prêmios cada
  // um já ganhou aqui na lista (quem soma os pontos de verdade é o overlay
  // de Prêmios da live).
  if (dbRefPremios && !modoPreview) {
    dbRefPremios.on("value", snap => {
      const daNuvem = snap.val();
      if (daNuvem) { salvarPremios(daNuvem); render(); }
    });
  }

  function ehSeguidor(userId, data) {
    if (typeof data.followRole === "number") {
      if (data.followRole >= 1) { seguidoresConhecidos[userId] = true; salvarSeguidores(); }
      return data.followRole >= 1;
    }
    if (typeof data.isFollower === "boolean") {
      if (data.isFollower) { seguidoresConhecidos[userId] = true; salvarSeguidores(); }
      return data.isFollower;
    }
    return !!seguidoresConhecidos[userId];
  }
  function somar(userId, nickname, pontos) {
    if (!ranking[userId]) ranking[userId] = { nickname, pontos: 0 };
    ranking[userId].nickname = nickname || ranking[userId].nickname;
    ranking[userId].pontos += pontos;
    salvarRanking(ranking); // cache local — a nuvem manda, ver incremento abaixo
    incrementarPontosNaNuvem(dbRefRanking, userId, "pontos", pontos, nickname);
  }

  const root = document.createElement("div");
  root.style.cssText = `background:${t.corFundo};border-radius:${t.raio}px;padding:18px 22px;max-width:320px;font-family:${fonteCss};`;
  document.body.appendChild(root);
  root.innerHTML = `<div style="font-size:12px;color:${t.corTextoSec};margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">Top seguidores do mês</div><div id="lista"></div>`;

  let ultimoTop = [];
  function render() {
    const premios = carregarPremios(); // só leitura, quem escreve é o overlay de metas
    const mapaAntigo = {};
    ultimoTop.forEach((u, i) => { mapaAntigo[u.id] = i; });
    const top = Object.entries(ranking)
      .map(([id, u]) => ({ id, nickname: u.nickname, pontos: u.pontos, premios: premios[id]?.tiersGanhos?.length || 0 }))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, cfg.tamanhoRanking);
    document.getElementById("lista").innerHTML = gerarHtmlRanking(t, top, mapaAntigo, cfg.animacoes);
    ultimoTop = top;
  }
  render();

  function processarEventoRanking(payload) {
    console.log("[overlay-ranking] evento:", payload);
    if (checarResetAutomaticoMensal()) { location.reload(); return; }
    const tipo = payload.event;
    const data = payload.data || {};
    const v = cfg.valores;
    const userId = data.userId ?? data.uniqueId ?? data.user?.userId ?? data.user?.uniqueId;
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    if (!userId) return;
    // guarda ANTES de marcar como conhecido — usado logo abaixo pra só
    // tocar som e somar pontos de "novo seguidor" uma vez por pessoa (a
    // lib do TikTok às vezes reenvia o evento "follow" de quem já seguia
    // ao reconectar, e sem essa trava isso tocava o som e somava pontos
    // de novo a cada reconexão).
    const jaEraSeguidorAntes = !!seguidoresConhecidos[userId];
    if (tipo === "follow") {
      seguidoresConhecidos[userId] = true;
      salvarSeguidores();
      if (!jaEraSeguidorAntes) tocarSomConfig(cfg.sons.seguidor, cfg.sons.volume);
    }
    const conta = !cfg.exigirSeguidor || ehSeguidor(userId, data);
    if (!conta) return;
    if (tipo === "gift") {
      const valorBase = extrairValorPresente(data);
      if (valorBase !== null) somar(userId, nickname, pontosDoPresente(valorBase, cfg));
    }
    if (tipo === "chat" || tipo === "comment") somar(userId, nickname, v.mensagem);
    if (tipo === "like") {
      const qtd = data.likeCount ?? data.count ?? 1;
      const ganhos = Math.floor(qtd / v.likeACada) * v.likeValor;
      if (ganhos > 0) somar(userId, nickname, ganhos);
    }
    if ((tipo === "follow" || tipo === "member") && !jaEraSeguidorAntes) somar(userId, nickname, v.seguidor);
    if (tipo === "share") somar(userId, nickname, v.compartilhamento);
    render();
  }

  escutarSimuladorDoPainel(processarEventoRanking);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoRanking);
  } else {
    conectarTikFinity(cfg, "overlay-ranking", processarEventoRanking);
  }
}
