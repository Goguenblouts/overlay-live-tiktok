/* ============================================================
   OVERLAY: COMBO / SEQUÊNCIA
   ============================================================ */

// cria a caixinha de combo dentro de "container" e devolve uma API
// pra registrar eventos (usado no overlay de verdade e na prévia).
// aoIncrementar(contagem), se passado, roda a cada incremento (pra
// tocar som a cada N, por exemplo).
function criarNoCombo(container, tema, aoIncrementar) {
  const caixa = document.createElement("div");
  caixa.style.cssText = `display:none;align-items:baseline;gap:8px;padding:10px 18px;border-radius:${Math.max(8, tema.raio)}px;background:${tema.corCard};border:1px solid ${tema.corBorda};width:fit-content;`;
  caixa.innerHTML = `<span class="combo-numero" style="font-size:24px;font-weight:800;color:${tema.corPrimaria};">0</span><span style="font-size:11px;color:${tema.corTextoSec};text-transform:uppercase;letter-spacing:0.05em;">combo</span>`;
  container.appendChild(caixa);
  const numeroEl = caixa.querySelector(".combo-numero");

  let contagem = 0;
  let ultimoTimestamp = 0;
  let timerEsconder = null;

  return {
    registrarEvento(janelaMs, animacoesAtivas) {
      const agora = Date.now();
      contagem = (agora - ultimoTimestamp > janelaMs) ? 1 : contagem + 1;
      ultimoTimestamp = agora;
      numeroEl.textContent = contagem;
      caixa.style.display = contagem >= 2 ? "flex" : "none";
      if (animacoesAtivas) {
        numeroEl.classList.remove("anim-pop");
        void numeroEl.offsetWidth;
        numeroEl.classList.add("anim-pop");
      }
      clearTimeout(timerEsconder);
      timerEsconder = setTimeout(() => { caixa.style.display = "none"; contagem = 0; }, janelaMs);
      if (aoIncrementar) aoIncrementar(contagem);
    },
  };
}

function renderCombo() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "combo");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;

  const root = document.createElement("div");
  document.body.appendChild(root);
  const api = criarNoCombo(root, t, (contagem) => {
    const s = cfg.sons.combo;
    if (s.ativo && s.aCada > 0 && contagem % s.aCada === 0) tocarSomConfig(s, cfg.sons.volume);
  });

  function processarEventoCombo(payload) {
    if (!cfg.combo.ativo) return;
    const tipo = payload.event === "comment" ? "chat" : payload.event === "member" ? "follow" : payload.event;
    if (!cfg.combo.fontes.includes(tipo)) return;
    api.registrarEvento(cfg.combo.janelaMs, cfg.animacoes);
  }

  escutarSimuladorDoPainel(processarEventoCombo);
  if (params.get("sim") === "1") {
    iniciarSimulador(processarEventoCombo, { min: 400, max: 1000 });
  } else {
    conectarTikFinity(cfg, "overlay-combo", processarEventoCombo);
  }
}
