/* ============================================================
   OVERLAY: ROLETA DE PRESENTE (Gift Spinner)
   - fica escondida até um presente que bate a condição configurada
     chegar (qualquer presente valendo X diamantes, ou um presente
     específico pelo nome); aí a roda gira e sorteia uma das "fatias"
     configuradas (cada fatia = uma Ação já criada em Eventos, com um
     peso que é a chance dela sair — fatia maior = mais chance — e uma
     raridade opcional só pra destacar visualmente).
   - ao parar, mostra a ação sorteada com o mesmo motor de card+som
     (criarFilaDeAcoes) usado no overlay de Eventos personalizados.
   - Múltiplos grupos (estilo StreamToEarn "multi-spinner"): cfg.spinners
     é uma lista de roletas independentes. "?grupo=<id>" na URL escolhe
     qual delas esse overlay mostra; sem o parâmetro, usa a primeira —
     assim um link antigo (sem &grupo=) continua funcionando sozinho.
   ============================================================ */

// fatia.peso vira um ARCO no círculo (não é sorteio por "n cópias") —
// fatia com peso 3 ocupa 3x mais grau que uma de peso 1, igual uma
// roleta de verdade com pedaços de tamanhos diferentes.
function calcularFatiasComAngulo(fatias) {
  const validas = (fatias || []).filter(f => f.acaoId);
  const pesoTotal = validas.reduce((s, f) => s + Math.max(0.01, Number(f.peso) || 1), 0) || 1;
  let acumulado = 0;
  return validas.map(f => {
    const peso = Math.max(0.01, Number(f.peso) || 1);
    const inicioDeg = (acumulado / pesoTotal) * 360;
    acumulado += peso;
    const fimDeg = (acumulado / pesoTotal) * 360;
    return Object.assign({}, f, { inicioDeg, fimDeg });
  });
}
function escolherFatiaAleatoria(fatiasComAngulo) {
  const alvoDeg = Math.random() * 360;
  return fatiasComAngulo.find(f => alvoDeg >= f.inicioDeg && alvoDeg < f.fimDeg) || fatiasComAngulo[0];
}

function renderSpinner() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "spinner");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  const grupos = cfg.spinners || [];
  const grupoId = params.get("grupo");
  const spinnerCfg = (grupoId && grupos.find(g => g.id === grupoId)) || grupos[0];
  if (!spinnerCfg) return; // nenhum grupo configurado ainda

  const TAMANHO = 300;
  const fatiasComAngulo = calcularFatiasComAngulo(spinnerCfg.fatias);
  const gradiente = fatiasComAngulo.length
    ? `conic-gradient(${fatiasComAngulo.map(f => `${f.cor || "#888"} ${f.inicioDeg}deg ${f.fimDeg}deg`).join(", ")})`
    : t.corCard;

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);display:none;flex-direction:column;align-items:center;gap:10px;";
  document.body.appendChild(wrap);
  wrap.innerHTML = `
    <div style="position:relative;width:${TAMANHO}px;height:${TAMANHO}px;">
      <div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:22px solid ${t.corPrimaria};z-index:2;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4));"></div>
      <div id="spinnerRoda" style="width:100%;height:100%;border-radius:50%;background:${gradiente};border:5px solid ${t.corBorda};box-shadow:0 10px 30px rgba(0,0,0,.5);position:relative;">
        ${fatiasComAngulo.map(f => {
          const meio = (f.inicioDeg + f.fimDeg) / 2;
          const acao = (cfg.automacoes.acoes || []).find(a => a.id === f.acaoId);
          const label = f.label || (acao ? acao.nome : "?");
          const raridadeInfo = f.raridade ? raridadePorNome(f.raridade) : null;
          return `<div style="position:absolute;top:50%;left:50%;width:${TAMANHO / 2 - 20}px;transform-origin:left center;transform:rotate(${meio}deg) translateY(-50%);">
            <span style="display:block;margin-left:26px;font-size:11px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);white-space:nowrap;max-width:${TAMANHO / 2 - 44}px;overflow:hidden;text-overflow:ellipsis;">
              ${raridadeInfo ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${raridadeInfo.cor};margin-right:4px;box-shadow:0 0 5px ${raridadeInfo.cor};"></span>` : ""}${label}
            </span>
          </div>`;
        }).join("")}
      </div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:${t.corPrimaria};border:3px solid ${t.corFundo};z-index:2;"></div>
    </div>
  `;
  const roda = document.getElementById("spinnerRoda");

  const root = document.createElement("div");
  document.body.appendChild(root);
  const api = criarFilaDeAcoes(root, cfg.sons.volume, { config: { maximoItens: 3 } });

  let rotacaoAtual = 0;
  let girando = false;
  let ultimoDisparo = 0;

  function girar(ctxEvento) {
    if (girando || !fatiasComAngulo.length) return;
    girando = true;
    wrap.style.display = "flex";
    const escolhida = escolherFatiaAleatoria(fatiasComAngulo);
    const meio = (escolhida.inicioDeg + escolhida.fimDeg) / 2;
    const voltas = 5;
    // gira até o meio da fatia escolhida ficar embaixo do ponteiro fixo
    // no topo (0deg do conic-gradient): rotacionar a roda X graus no
    // sentido horário move o ponto que estava em "meio" pra "meio + X".
    const alvoMod = ((360 - meio) % 360 + 360) % 360;
    const rotAtualMod = ((rotacaoAtual % 360) + 360) % 360;
    let delta = alvoMod - rotAtualMod;
    if (delta <= 0) delta += 360;
    rotacaoAtual += voltas * 360 + delta;
    const duracaoMs = spinnerCfg.duracaoGiroMs || 4000;
    roda.style.transition = `transform ${duracaoMs}ms cubic-bezier(0.12,0.83,0.24,1)`;
    roda.style.transform = `rotate(${rotacaoAtual}deg)`;
    setTimeout(() => {
      girando = false;
      const acao = (cfg.automacoes.acoes || []).find(a => a.id === escolhida.acaoId);
      if (acao && acao.ativo !== false) {
        const textoResolvido = textoComPlaceholders(acao.texto, ctxEvento.nickname, ctxEvento.valor, cfg);
        api.mostrar(acao, t, textoResolvido, cfg.animacoes, { raridade: escolhida.raridade });
      }
      setTimeout(() => { wrap.style.display = "none"; }, 3000);
    }, duracaoMs);
  }

  function processarEventoSpinner(payload) {
    if (!spinnerCfg.ativo) return;
    if (payload.event !== "gift") return;
    const data = payload.data || {};
    const valorBase = extrairValorPresente(data);
    if (valorBase === null) return;
    if (spinnerCfg.modoGatilho === "especifico") {
      const nomePresente = data.giftDetails?.giftName ?? data.giftName ?? "";
      if (nomePresente !== spinnerCfg.nomePresenteEspecifico) return;
    } else if (valorBase < (spinnerCfg.valorMinimo || 0)) {
      return;
    }
    // trava simples de 1s — é uma roda física, só um giro por vez,
    // então não faz sentido enfileirar giros como os outros overlays.
    const agora = Date.now();
    if (agora - ultimoDisparo < 1000) return;
    ultimoDisparo = agora;
    const nickname = data.nickname ?? data.user?.nickname ?? data.uniqueId ?? "espectador";
    girar({ nickname, valor: valorBase });
  }

  escutarSimuladorDoPainel(processarEventoSpinner);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoSpinner, { min: 3000, max: 6000 });
  } else {
    conectarTikFinity(cfg, "overlay-spinner-" + spinnerCfg.id, processarEventoSpinner);
  }
}
