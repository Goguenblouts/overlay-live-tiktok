/* ============================================================
   OVERLAY: Vitrine de prêmios — lista os prêmios (tiers) rolando
   em loop contínuo, da direita pra esquerda, tipo um "letreiro".
   Não depende de eventos nem do TikFinity — só mostra os prêmios
   configurados. Ótimo pra deixar fixo numa faixa da tela durante
   a live inteira.
   ============================================================ */
function renderVitrine() {
  const cfg = carregarConfig();
  const t = temaEfetivo(cfg, "vitrine");
  const fonteCss = carregarFonteGoogle(t.fonte);
  document.body.style.fontFamily = fonteCss;
  document.body.style.overflow = "hidden";

  const faixa = document.createElement("div");
  faixa.style.cssText = `
    position: fixed; left: 0; bottom: 0; width: 100%; height: 68px;
    overflow: hidden; display: flex; align-items: center;
    background: ${t.corFundo}e6; border-top: 2px solid ${t.corPrimaria};
    box-sizing: border-box;
  `;

  const trilho = document.createElement("div");
  trilho.style.cssText = "display:flex;white-space:nowrap;will-change:transform;";
  faixa.appendChild(trilho);
  document.body.appendChild(faixa);

  function itemHtml(tier, index, total) {
    const raridade = raridadeDoTier(index, total);
    return `
      <span style="display:inline-flex;align-items:center;gap:12px;padding:0 44px;font-size:21px;font-weight:700;color:${t.corTexto};border-left:3px solid ${raridade.cor}88;">
        <span style="font-size:24px;">${iconeTierHtml(tier, 24)}</span>
        <span>${tier.nome}</span>
        <span style="font-size:12px;font-weight:700;color:${raridade.cor};text-transform:uppercase;letter-spacing:0.04em;">${raridade.nome}</span>
        <span style="color:${t.corPrimaria};">${Number(tier.pontos).toLocaleString("pt-BR")} pts</span>
      </span>
    `;
  }

  const tiers = (cfg.tiers && cfg.tiers.length) ? cfg.tiers : [{ id: "vazio", nome: "Configure os prêmios em Config", pontos: 0 }];
  const conteudo = tiers.map((tier, i) => itemHtml(tier, i, tiers.length)).join("");
  // duplica o conteúdo pra criar um loop sem costura: quando a 1ª cópia
  // sai totalmente pela esquerda, a 2ª já está exatamente onde a 1ª começou.
  trilho.innerHTML = conteudo + conteudo;

  const VELOCIDADE_PX_POR_SEG = 70;
  function iniciarAnimacao() {
    const larguraTotal = trilho.scrollWidth / 2;
    if (!larguraTotal) { requestAnimationFrame(iniciarAnimacao); return; }
    const duracaoSeg = larguraTotal / VELOCIDADE_PX_POR_SEG;
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @keyframes vitrineScroll { from { transform: translateX(0); } to { transform: translateX(-${larguraTotal}px); } }
    `;
    document.head.appendChild(styleTag);
    trilho.style.animation = `vitrineScroll ${duracaoSeg}s linear infinite`;
  }
  requestAnimationFrame(iniciarAnimacao);
}
