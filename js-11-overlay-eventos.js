/* ============================================================
   OVERLAY: EVENTOS PERSONALIZADOS (regras estilo TikFinity)
   - "Ações" (cfg.automacoes.acoes): reações reutilizáveis — card com
     ícone, texto (aceita {nickname} e {valor}), cor e som.
   - "Eventos" (cfg.automacoes.eventos): regras gatilho → condição →
     ação. Quando um evento do TikFinity (ou do simulador) bate com
     o gatilho e a condição de uma regra ativa, dispara a ação ligada.
   ============================================================ */
function tipoGatilhoDoEvento(tipoEvento) {
  if (tipoEvento === "gift") return "presente";
  if (tipoEvento === "like") return "like";
  if (tipoEvento === "chat" || tipoEvento === "comment") return "mensagem";
  if (tipoEvento === "follow" || tipoEvento === "member") return "seguidor";
  if (tipoEvento === "share") return "compartilhamento";
  return null;
}
function extrairValorEvento(gatilho, payload) {
  const data = payload.data || {};
  if (gatilho === "presente") {
    const base = extrairValorPresente(data);
    return base === null ? 0 : base * (data.repeatCount || 1);
  }
  if (gatilho === "like") return data.likeCount ?? data.count ?? 1;
  return 1;
}

function renderEventos() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "eventos");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  const root = document.createElement("div");
  root.style.cssText = "position:fixed;top:24px;right:24px;display:flex;flex-direction:column;gap:10px;max-width:380px;align-items:flex-end;";
  document.body.appendChild(root);

  // reporta o estado da fila pro painel (só faz sentido dentro de um
  // iframe do Simulador — no OBS de verdade não tem "parent" ouvindo,
  // e isso não afeta em nada o funcionamento do overlay em si)
  function reportarFilaAoPainel(itens) {
    if (window.parent === window) return;
    try { window.parent.postMessage({ tipo: "filaEventosPainel", itens }, "*"); } catch (e) {}
  }
  const api = criarFilaDeAcoes(root, cfg.sons.volume, { config: cfg.automacoes.filaConfig, aoAtualizar: reportarFilaAoPainel });
  window.addEventListener("message", (e) => {
    if (e.data && e.data.tipo === "cancelarFilaPainel") api.cancelar();
  });

  const ultimoDisparoRegra = {};

  // ------------------------------------------------------------
  // Dispara UMA regra já sabida como "deve rodar" (evento bateu +
  // condições OK, OU chamada em cadeia via passo "executarRegra"):
  // aplica efeitos em variável, mostra a ação (se estiver ativa) e
  // roda a sequência de passos extras, se houver.
  // profundidade evita loop infinito de regras se chamando entre si.
  // ------------------------------------------------------------
  function dispararRegra(regra, ctx, profundidade) {
    aplicarEfeitosVariaveis(regra, ctx);
    const acao = (cfg.automacoes.acoes || []).find(a => a.id === regra.acaoId);
    if (acao && acao.ativo !== false) {
      const textoResolvido = textoComPlaceholders(acao.texto, ctx.nickname, ctx.valor, cfg);
      api.mostrar(acao, t, textoResolvido, cfg.animacoes);
    }
    if (regra.passos && regra.passos.length) executarPassosSequencia(regra.passos, ctx, profundidade || 0);
  }

  function executarPassosSequencia(passos, ctx, profundidade) {
    if (profundidade > 5) return; // guarda contra "executar outra regra" em loop
    let i = 0;
    function proximo() {
      if (i >= passos.length) return;
      executarUmPasso(passos[i++], ctx, profundidade, proximo);
    }
    proximo();
  }

  function executarUmPasso(passo, ctx, profundidade, continuar) {
    switch (passo.tipo) {
      case "esperar":
        setTimeout(continuar, Math.max(0, Number(passo.segundos) || 0) * 1000);
        return; // não chama continuar() agora — só depois do setTimeout
      case "tocarSom":
        tocarSomConfig({ ativo: true, som: passo.som || "ding", url: passo.url || "" }, passo.volume != null ? passo.volume : cfg.sons.volume);
        break;
      case "pararSom":
        pararTodosOsSons();
        break;
      case "confete":
        efeitoConfeteTela(passo.cor);
        break;
      case "fogos":
        efeitoFogosTela(passo.cor);
        break;
      case "variavel": {
        const runtime = lerVariaveisRuntime();
        aplicarUmEfeitoVariavel(passo, ctx, runtime);
        salvarVariaveisRuntime(runtime);
        break;
      }
      case "executarRegra": {
        const outra = (cfg.automacoes.eventos || []).find(r => r.id === passo.regraId);
        if (outra) dispararRegra(outra, ctx, profundidade + 1);
        break;
      }
    }
    continuar();
  }

  function processarEventoAutomacao(payload) {
    const gatilho = tipoGatilhoDoEvento(payload.event);
    if (!gatilho) return;
    const data = payload.data || {};
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    const valor = extrairValorEvento(gatilho, payload);
    const ctx = { gatilho, payload, data, nickname, valor, cfg };

    // prioridade mais alta primeiro; várias regras podem disparar pro
    // mesmo evento (cada uma com sua própria ação e cooldown).
    const regrasOrdenadas = (cfg.automacoes.eventos || []).slice().sort((a, b) => (b.prioridade || 5) - (a.prioridade || 5));
    regrasOrdenadas.forEach(regra => {
      if (regra.ativo === false) return;
      if (!avaliarRegra(regra, ctx)) return;
      const agora = Date.now();
      if (regra.cooldownMs && ultimoDisparoRegra[regra.id] && agora - ultimoDisparoRegra[regra.id] < regra.cooldownMs) return;
      ultimoDisparoRegra[regra.id] = agora;
      dispararRegra(regra, ctx, 0);
    });
  }

  escutarSimuladorDoPainel(processarEventoAutomacao);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoAutomacao, { min: 1000, max: 2400 });
  } else {
    conectarTikFinity(cfg, "overlay-eventos", processarEventoAutomacao);
  }
}
