/* ============================================================
   PAINEL — lista de overlays + configurações + tema
   ============================================================ */
function renderPainel() {
  document.body.innerHTML = "";
  document.body.style.background = "var(--bg)";
  document.body.style.minHeight = "100vh";
  document.body.style.fontFamily = "var(--font-display)";
  document.body.style.color = "var(--text)";

  const cfg = carregarConfig();

  const SECOES = [
    { id: "inicio",     label: "Início",      icone: '<i class="fa-solid fa-house"></i>', cor: "var(--ic-links)" },
    { id: "overlays",   label: "Overlays",    icone: '<i class="fa-solid fa-layer-group"></i>', cor: "var(--ic-links)" },
    { id: "eventos",    label: "Eventos",     icone: '<i class="fa-solid fa-bolt"></i>', cor: "var(--ic-eventos)" },
    { id: "simulador",  label: "Simulador",   icone: '<i class="fa-solid fa-flask"></i>', cor: "var(--ic-simulador)" },
    { id: "aparencia",  label: "Aparência",    icone: '<i class="fa-solid fa-wand-magic-sparkles"></i>', cor: "var(--ic-aparencia)" },
    { id: "config",     label: "Config",       icone: '<i class="fa-solid fa-sliders"></i>', cor: "var(--ic-config)" },
  ];

  const shell = document.createElement("div");
  shell.className = "app-shell";
  document.body.appendChild(shell);

  // -------- topbar --------
  shell.innerHTML = `
    <div class="topbar">
      <div class="topbar-logo"><i class="fa-solid fa-gamepad"></i></div>
      <div>
        <div class="topbar-title">Central de Overlays</div>
        <div class="topbar-sub">Gamificação gratuita pra sua live, em qualquer programa de transmissão</div>
      </div>
      <div class="topbar-right">
        <a id="btnDoar" class="topbar-btn topbar-btn-doar" href="#" target="_blank" rel="noopener"><i class="fa-solid fa-heart"></i> Doar</a>
        <button id="btnMeusLinks" class="topbar-btn"><i class="fa-solid fa-link"></i> Meus links</button>
        <button id="btnContato" class="topbar-btn"><i class="fa-solid fa-envelope"></i> Contato</button>
      </div>
    </div>
  `;

  // -------- topbar: contato (abre por cima do site, manda por e-mail) --------
  // WEB3FORMS_ACCESS_KEY: chave grátis do https://web3forms.com (só pede um
  // e-mail, sem senha, chega na hora). Enquanto estiver vazia, o botão cai
  // pro modo antigo (abre o app de e-mail já preenchido).
  const WEB3FORMS_ACCESS_KEY = "b324e58f-cf3a-446f-9419-466c4f011f99";

  document.getElementById("btnContato").addEventListener("click", () => {
    const backdrop = document.createElement("div");
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal">
        <div style="font-size:16px;font-weight:700;margin-bottom:6px;">Sugestões e melhorias</div>
        <p style="font-size:13px;color:var(--text-dim);line-height:1.55;margin:0 0 16px;">${WEB3FORMS_ACCESS_KEY ? "Manda uma ideia, um bug ou o que quiser — sai direto daqui." : "Manda uma ideia, um bug ou o que quiser — abre no seu app de e-mail já preenchido, é só enviar."}</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Seu nome (opcional)</label>
            <input id="contatoNome" type="text" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/></div>
          <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Seu e-mail (opcional, pra eu responder)</label>
            <input id="contatoEmail" type="email" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/></div>
          <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Mensagem</label>
            <textarea id="contatoMensagem" rows="4" placeholder="Sugestão, melhoria, bug..." style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;font-family:var(--font-display);resize:vertical;"></textarea></div>
        </div>
        <p id="contatoErro" style="color:#e0637a;font-size:12.5px;margin:10px 0 0;display:none;"></p>
        <p id="contatoSucesso" style="color:var(--accent);font-size:12.5px;margin:10px 0 0;display:none;">Enviado ✓ — obrigado!</p>
        <div style="display:flex;gap:8px;margin-top:16px;">
          <button id="fecharModalContato" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Cancelar</button>
          <button id="enviarContato" class="btn-cta" style="flex:2;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">${WEB3FORMS_ACCESS_KEY ? "Enviar" : "Enviar por e-mail"}</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.remove(); });
    document.getElementById("fecharModalContato").addEventListener("click", () => backdrop.remove());
    document.getElementById("enviarContato").addEventListener("click", () => {
      const nome = document.getElementById("contatoNome").value.trim();
      const emailRemetente = document.getElementById("contatoEmail").value.trim();
      const mensagem = document.getElementById("contatoMensagem").value.trim();
      const erroEl = document.getElementById("contatoErro");
      erroEl.style.display = "none";
      if (!mensagem) {
        erroEl.textContent = "Escreve alguma coisa na mensagem antes de enviar.";
        erroEl.style.display = "block";
        return;
      }
      const assunto = "Sugestão - Central de Overlays" + (nome ? " (" + nome + ")" : "");

      if (!WEB3FORMS_ACCESS_KEY) {
        const corpo = (nome ? "Nome: " + nome + "\n" : "") + (emailRemetente ? "E-mail: " + emailRemetente + "\n" : "") + "\n" + mensagem;
        window.location.href = "mailto:marceliovenancio25@gmail.com?subject=" + encodeURIComponent(assunto) + "&body=" + encodeURIComponent(corpo);
        backdrop.remove();
        return;
      }

      const btn = document.getElementById("enviarContato");
      btn.disabled = true;
      btn.textContent = "Enviando…";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: assunto,
          from_name: nome || "Visitante da Central de Overlays",
          email: emailRemetente || undefined,
          message: mensagem,
        }),
      })
        .then(r => r.json())
        .then(dados => {
          if (dados.success) {
            document.getElementById("contatoSucesso").style.display = "block";
            setTimeout(() => backdrop.remove(), 1800);
          } else {
            throw new Error(dados.message || "falha");
          }
        })
        .catch(() => {
          erroEl.textContent = "Não consegui enviar agora — tenta de novo em instantes.";
          erroEl.style.display = "block";
          btn.disabled = false;
          btn.textContent = "Enviar";
        });
    });
  });

  // -------- topbar: doar / meus links (dados fixos, não editáveis) --------
  const btnDoarEl = document.getElementById("btnDoar");
  btnDoarEl.href = PERFIL_FIXO.livepix;
  btnDoarEl.title = "Abrir LivePix";

  document.getElementById("btnMeusLinks").addEventListener("click", (e) => {
    e.stopPropagation();
    const existente = document.getElementById("painelMeusLinks");
    if (existente) { existente.remove(); return; }
    const painel = document.createElement("div");
    painel.id = "painelMeusLinks";
    painel.className = "topbar-dropdown";
    painel.innerHTML = PERFIL_FIXO.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square" style="opacity:.6;font-size:11px;"></i> ${l.label || l.url}</a>`).join("");
    document.getElementById("btnMeusLinks").parentElement.appendChild(painel);
    setTimeout(() => {
      document.addEventListener("click", function fechar(ev) {
        if (!painel.contains(ev.target)) { painel.remove(); document.removeEventListener("click", fechar); }
      });
    }, 0);
  });

  // -------- topbar: manuais de uso (lista em box + detalhe + PDF) --------
  // Monta o HTML das seções de um manual (h/p/li), reaproveitado tanto no
  // modal de detalhe quanto (em texto puro) na geração do PDF.
  function renderConteudoManualHtml(secoes) {
    return secoes.map(sec => {
      if (sec.h) return `<div style="font-size:14px;font-weight:700;margin:16px 0 6px;color:var(--text);">${sec.h}</div>`;
      if (sec.p) return `<p style="font-size:13px;color:var(--text-dim);line-height:1.6;margin:0 0 8px;">${sec.p}</p>`;
      if (sec.li) return `<ul style="margin:0 0 8px;padding-left:18px;">${sec.li.map(item => `<li style="font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:4px;">${item}</li>`).join("")}</ul>`;
      return "";
    }).join("");
  }

  function abrirModalListaManuais() {
    const backdrop = document.createElement("div");
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:760px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div style="font-size:16px;font-weight:700;">Manuais de uso</div>
          <button id="fecharModalListaManuais" style="background:none;border:none;color:var(--text-faint);font-size:18px;cursor:pointer;line-height:1;">&times;</button>
        </div>
        <p style="font-size:13px;color:var(--text-dim);line-height:1.55;margin:0 0 16px;">Um guia curto pra cada ferramenta do site. Clique num card pra abrir.</p>
        <div id="gradeManuais" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;"></div>
      </div>
    `;
    document.body.appendChild(backdrop);
    const grade = backdrop.querySelector("#gradeManuais");
    MANUAIS.forEach(m => {
      const card = document.createElement("button");
      card.type = "button";
      card.dataset.manualId = m.id;
      card.style.cssText = "text-align:left;background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;display:flex;flex-direction:column;gap:8px;color:var(--text);font-family:var(--font-display);transition:border-color .15s;";
      card.innerHTML = `
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:${m.cor};font-size:15px;"><i class="${m.icone}"></i></div>
        <div style="font-size:13.5px;font-weight:700;">${m.titulo}</div>
        <div style="font-size:12px;color:var(--text-faint);line-height:1.5;">${m.resumo}</div>
      `;
      card.addEventListener("mouseenter", () => { card.style.borderColor = m.cor; });
      card.addEventListener("mouseleave", () => { card.style.borderColor = "var(--border)"; });
      card.addEventListener("click", () => { backdrop.remove(); abrirModalManual(m.id); });
      grade.appendChild(card);
    });
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.querySelector("#fecharModalListaManuais").addEventListener("click", () => backdrop.remove());
  }

  function abrirModalManual(id) {
    const manual = MANUAIS.find(m => m.id === id);
    if (!manual) return;
    const backdrop = document.createElement("div");
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:600px;max-height:82vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
          <div style="width:34px;height:34px;flex:0 0 auto;border-radius:8px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:${manual.cor};font-size:16px;"><i class="${manual.icone}"></i></div>
          <div style="font-size:16px;font-weight:700;">${manual.titulo}</div>
        </div>
        <div id="conteudoManual">${renderConteudoManualHtml(manual.secoes)}</div>
        <div style="display:flex;gap:8px;margin-top:16px;">
          <button id="voltarListaManuais" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Voltar</button>
          <button id="baixarPdfManual" class="btn-cta" style="flex:1;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;"><i class="fa-solid fa-download"></i> Baixar PDF</button>
          <button id="fecharModalManual" style="flex:0 0 auto;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px 14px;font-size:13.5px;cursor:pointer;">&times;</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.querySelector("#fecharModalManual").addEventListener("click", () => backdrop.remove());
    backdrop.querySelector("#voltarListaManuais").addEventListener("click", () => { backdrop.remove(); abrirModalListaManuais(); });
    backdrop.querySelector("#baixarPdfManual").addEventListener("click", () => gerarPdfManual(manual));
  }

  function gerarPdfManual(manual) {
    if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
      alert("Não consegui carregar o gerador de PDF agora (falha ao baixar da internet). Tenta de novo em instantes, ou leia o manual direto aqui no modal.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margem = 48;
    const larguraUtil = doc.internal.pageSize.getWidth() - margem * 2;
    const alturaPagina = doc.internal.pageSize.getHeight();
    let y = margem;

    function novaLinhaSeNecessario(altura) {
      if (y + altura > alturaPagina - margem) { doc.addPage(); y = margem; }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    novaLinhaSeNecessario(26);
    doc.text(manual.titulo, margem, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90);
    const linhasResumo = doc.splitTextToSize(manual.resumo, larguraUtil);
    linhasResumo.forEach(linha => { novaLinhaSeNecessario(15); doc.text(linha, margem, y); y += 15; });
    y += 10;
    doc.setTextColor(20);

    manual.secoes.forEach(sec => {
      if (sec.h) {
        y += 6;
        novaLinhaSeNecessario(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(sec.h, margem, y);
        y += 18;
      } else if (sec.p) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const linhas = doc.splitTextToSize(sec.p, larguraUtil);
        linhas.forEach(linha => { novaLinhaSeNecessario(15); doc.text(linha, margem, y); y += 15; });
        y += 6;
      } else if (sec.li) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        sec.li.forEach(item => {
          const linhas = doc.splitTextToSize("•  " + item, larguraUtil - 10);
          linhas.forEach((linha, i) => { novaLinhaSeNecessario(15); doc.text(linha, margem + (i === 0 ? 0 : 12), y); y += 15; });
        });
        y += 6;
      }
    });

    doc.save("manual-" + manual.id + ".pdf");
  }

  const layout = document.createElement("div");
  layout.className = "painel-layout";
  shell.appendChild(layout);

  // -------- sidebar --------
  const sidebar = document.createElement("div");
  sidebar.className = "painel-sidebar";
  layout.appendChild(sidebar);

  SECOES.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.className = "nav-item" + (i === 0 ? " ativo" : "");
    btn.dataset.secao = s.id;
    btn.innerHTML = `<span class="nav-icon" style="color:${s.cor};">${s.icone}</span><span class="nav-label">${s.label}</span>`;
    sidebar.appendChild(btn);
  });
  const btnManuais = document.createElement("button");
  btnManuais.id = "btnManuais";
  btnManuais.className = "nav-item";
  btnManuais.style.borderTop = "1px solid var(--border)";
  btnManuais.style.marginTop = "6px";
  btnManuais.style.paddingTop = "14px";
  btnManuais.innerHTML = `<span class="nav-icon" style="color:var(--ic-links);"><i class="fa-solid fa-book"></i></span><span class="nav-label">Manuais</span>`;
  btnManuais.addEventListener("click", () => abrirModalListaManuais());
  sidebar.appendChild(btnManuais);
  const infoBox = document.createElement("div");
  infoBox.className = "sidebar-sync";
  infoBox.title = "Sincronia instantânea: salva aqui, atualiza sozinho em todo overlay já aberto no OBS — sem recopiar link.";
  infoBox.innerHTML = `<i class="fa-solid fa-bolt"></i>`;
  sidebar.appendChild(infoBox);
  const nav = sidebar;

  // -------- área principal --------
  const wrap = document.createElement("div");
  wrap.className = "painel-main";
  layout.appendChild(wrap);

  function criarSecao(id) {
    const sec = document.createElement("div");
    sec.className = "secao-conteudo" + (id === "inicio" ? "" : " oculto");
    sec.id = "secao-" + id;
    wrap.appendChild(sec);
    return sec;
  }

  // preenchida mais abaixo, quando a sub-navegação de Config existir —
  // troca a sub-aba visível dentro de Config (Conexão/Pontuação/Ranking/etc)
  let ativarConfigSubpage = () => {};

  function irParaAba(secaoId, subpageId) {
    nav.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("ativo", b.dataset.secao === secaoId));
    SECOES.forEach(s => document.getElementById("secao-" + s.id).classList.add("oculto"));
    const alvo = document.getElementById("secao-" + secaoId);
    alvo.classList.remove("oculto");
    alvo.classList.remove("secao-conteudo");
    void alvo.offsetWidth;
    alvo.classList.add("secao-conteudo");
    if (secaoId === "config" && subpageId) {
      ativarConfigSubpage(subpageId);
    }
  }

  nav.querySelectorAll(".nav-item[data-secao]").forEach(btn => {
    btn.addEventListener("click", () => irParaAba(btn.dataset.secao));
  });

  // ============================================================
  // SEÇÃO: Início — primeira tela ao abrir o painel, explicando pra
  // que serve o app antes da pessoa mexer em qualquer configuração.
  // ============================================================
  const secaoInicio = criarSecao("inicio");

  const RECURSOS_INICIO = [
    { icone: "fa-trophy", cor: "var(--ic-links)", titulo: "Prêmios por espectador", desc: "Cada espectador junta pontos por conta própria e desbloqueia prêmios (tiers) conforme evolui.", ir: "overlays" },
    { icone: "fa-ranking-star", cor: "var(--ic-links)", titulo: "Ranking de seguidores", desc: "Mostra o top espectadores da live em tempo real, atualizando sozinho.", ir: "overlays" },
    { icone: "fa-gift", cor: "var(--ic-links)", titulo: "Alerta de presente", desc: "Card chamativo quando chega um presente grande — com destaque pro maior da live.", ir: "overlays" },
    { icone: "fa-bolt", cor: "var(--ic-eventos)", titulo: "Eventos personalizados", desc: "Crie suas próprias regras: quando X acontecer (like, presente, palavra no chat...), dispare uma ação na tela.", ir: "eventos" },
    { icone: "fa-wand-magic-sparkles", cor: "var(--ic-aparencia)", titulo: "Aparência sua", desc: "Cores livres, fontes, animações (slide/fade/zoom/bounce) e ícones — do jeito que combinar com sua marca.", ir: "aparencia" },
    { icone: "fa-volume-high", cor: "var(--ic-config)", titulo: "Sons e alertas", desc: "Sons prontos ou um link de áudio seu pra cada evento — configurado direto no card de cada overlay, em Overlays.", ir: "overlays" },
    { icone: "fa-cloud", cor: "var(--ic-config)", titulo: "Sincronia automática", desc: "Salvou aqui, atualiza sozinho em todo overlay já aberto na transmissão — sem recopiar link.", ir: "config" },
    { icone: "fa-heart", cor: "var(--ic-links)", titulo: "Doações e links", desc: "LivePix e seus links importantes direto na barra superior, pro público apoiar e te seguir em qualquer rede.", ir: "config" },
  ];

  const PLATAFORMAS = [
    "OBS Studio", "Streamlabs Desktop", "TikTok LIVE Studio", "XSplit", "vMix", "Twitch Studio", "Wirecast", "Restream Studio",
  ];

  secaoInicio.innerHTML = `
    <div style="max-width:980px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff;flex-shrink:0;"><i class="fa-solid fa-gamepad"></i></div>
        <div>
          <h1 style="font-size:26px;font-weight:700;margin:0 0 2px;letter-spacing:-0.015em;">Central de Overlays</h1>
          <div style="font-size:13px;color:var(--text-dim);">Gamificação completa e gratuita pra sua live — em qualquer programa de transmissão</div>
        </div>
      </div>
      <p style="font-size:14px;color:var(--text-dim);line-height:1.65;margin:0 0 26px;max-width:760px;">Este app transforma likes, presentes, seguidas, mensagens e compartilhamentos da sua live em pontos, ranking, prêmios e alertas na tela — igual às ferramentas pagas de gamificação (tipo TikFinity), mas de graça e sem limite de espectadores. Tudo é configurado aqui, uma vez só, e sincroniza sozinho na nuvem: qualquer overlay que já estiver aberto na sua transmissão se atualiza na hora, sem precisar recopiar link.</p>

      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-faint);margin-bottom:12px;">O que dá pra fazer</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:14px;margin-bottom:28px;">
        ${RECURSOS_INICIO.map(r => `
          <div class="painel-card card-clicavel" data-ir="${r.ir}" style="padding:16px;">
            <div style="width:34px;height:34px;border-radius:9px;background:${r.cor}22;display:flex;align-items:center;justify-content:center;margin-bottom:10px;"><i class="fa-solid ${r.icone}" style="color:${r.cor};font-size:15px;"></i></div>
            <div style="font-size:13.5px;font-weight:700;margin-bottom:5px;">${r.titulo}</div>
            <div style="font-size:12px;color:var(--text-dim);line-height:1.5;">${r.desc}</div>
          </div>
        `).join("")}
      </div>

      <div class="painel-card" style="padding:18px;margin-bottom:18px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-faint);margin-bottom:6px;">Funciona em qualquer programa de live</div>
        <p style="font-size:12.5px;color:var(--text-dim);line-height:1.6;margin:0 0 14px;">Cada overlay daqui é só um link (Browser Source) — não é exclusivo do OBS ou do TikTok LIVE Studio. Funciona em qualquer software ou plataforma que aceite adicionar uma fonte de navegador/URL personalizada:</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${PLATAFORMAS.map(p => `<span class="plataforma-pill"><i class="fa-solid fa-desktop" style="font-size:11px;opacity:.6;"></i>${p}</span>`).join("")}
        </div>
      </div>

      <div class="painel-card" style="padding:18px;margin-bottom:18px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-faint);margin-bottom:14px;">Como começar</div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</div>
            <div><div style="font-size:13.5px;font-weight:600;">Abra o card do overlay em Overlays</div><div style="font-size:12px;color:var(--text-dim);">Cada card já mostra a prévia ao vivo e o link. Clique em "Config" pra ajustar pontos, prêmios, alertas e sons daquele overlay.</div></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</div>
            <div><div style="font-size:13.5px;font-weight:600;">Deixe do seu jeito na Aparência e crie Eventos</div><div style="font-size:12px;color:var(--text-dim);">Cores, fonte, animações e ícones na Aparência (ou direto no Config de cada card); regras personalizadas na aba Eventos.</div></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</div>
            <div><div style="font-size:13.5px;font-weight:600;">Teste e copie o link pro seu programa de transmissão</div><div style="font-size:12px;color:var(--text-dim);">Botão "Testar" abre o overlay de verdade numa aba nova; "Copiar link" cola como Browser Source no OBS/Streamlabs/etc.</div></div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button data-ir="overlays" class="btn-cta" style="border-radius:8px;padding:11px 18px;font-size:13px;cursor:pointer;">Ver overlays →</button>
        <button data-ir="eventos" style="background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px 18px;font-size:13px;cursor:pointer;">Ir pra Eventos</button>
        <button data-ir="config" style="background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px 18px;font-size:13px;cursor:pointer;">Ir pra Config</button>
      </div>
    </div>
  `;
  secaoInicio.querySelectorAll("[data-ir]").forEach(btn => {
    btn.addEventListener("click", () => irParaAba(btn.dataset.ir));
  });

  // ============================================================
  // SEÇÃO: Overlays — um card por overlay, tudo junto: prévia ao
  // vivo grande (é o overlay de verdade rodando num iframe isolado,
  // gerando eventos de teste sozinho — nunca mexe em dado real nem
  // toca som), link + copiar, Testar (abre o overlay de verdade numa
  // aba nova, com som, pra conferir antes de colar no OBS) e Config
  // (abre um modal só com o que aquele overlay precisa: pontos,
  // prêmios/alertas/regras, som e cor rápida — testar e salvar dali
  // mesmo).
  // ============================================================
  const secaoOverlaysGaleria = criarSecao("overlays");
  secaoOverlaysGaleria.innerHTML = `
    <h2 style="font-size:23px;font-weight:700;margin:0 0 6px;letter-spacing:-0.01em;">Overlays</h2>
    <p style="font-size:13px;color:var(--text-dim);margin:0 0 16px;">Um Browser Source por overlay — funciona no OBS, Streamlabs, TikTok LIVE Studio, XSplit, vMix ou qualquer programa que aceite uma fonte de navegador/URL. Prévia, link, teste e configuração ficam juntos no mesmo card. <strong>Importante:</strong> seu programa de transmissão roda um navegador separado do seu — toda vez que salvar uma mudança, copie o link de novo aqui e cole lá, senão o overlay continua com a versão antiga.</p>
  `;

  const galeriaWrap = document.createElement("div");
  galeriaWrap.style.cssText = "display:flex;flex-direction:column;gap:18px;";
  secaoOverlaysGaleria.appendChild(galeriaWrap);

  const LAYOUTS_METAS_INFO = [
    { id: "lateral", nome: "Lateral", desc: "Card no canto superior esquerdo (padrão)" },
    { id: "barra", nome: "Barra inferior", desc: "Faixa na parte de baixo da tela" },
    { id: "popup", nome: "Popup central", desc: "Card grande centralizado, bem chamativo" },
  ];

  const TITULO_PREVIA = `<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">Prévia ao vivo — aproximada na área onde o overlay aparece, com eventos de teste automáticos e sem som</div>`;

  function caixaPreviaIframe(viewId) {
    return `<div style="position:relative;width:100%;max-width:${PREVIA_BOX_W}px;aspect-ratio:16/9;overflow:hidden;border-radius:8px;background:repeating-conic-gradient(var(--bg-alt) 0% 25%, var(--bg) 0% 50%) 0 0/16px 16px;">
      <iframe id="previaFrame_${viewId}" style="position:absolute;top:0;left:0;width:1920px;height:1080px;border:0;background:transparent;transform-origin:top left;pointer-events:none;"></iframe>
    </div>`;
  }

  // Aproxima a prévia na região onde o overlay realmente aparece (em vez de
  // mostrar o quadro 1920x1080 inteiro reduzido, o que deixava o card
  // minúsculo num canto). PREVIA_BOX_W/H precisam bater com o tamanho da
  // caixa acima (max-width e aspect-ratio 16:9).
  const PREVIA_BOX_W = 720, PREVIA_BOX_H = 405;
  function calcularTransformPrevia(overlayId, cfgFresco) {
    function crop(escala, foco) {
      const w = PREVIA_BOX_W / escala, h = PREVIA_BOX_H / escala;
      let x0 = 0, y0 = 0;
      if (foco === "topright") { x0 = 1920 - w; y0 = 0; }
      else if (foco === "bottomcenter") { x0 = 960 - w / 2; y0 = 1080 - h; }
      else if (foco === "center") { x0 = 960 - w / 2; y0 = 540 - h / 2; }
      return { escala, tx: -x0, ty: -y0 };
    }
    if (overlayId === "metas") {
      const layout = (cfgFresco.metas && cfgFresco.metas.layout) || "lateral";
      if (layout === "barra") return crop(0.85, "bottomcenter");
      if (layout === "popup") return crop(0.55, "center");
      return crop(0.95, "topleft");
    }
    if (overlayId === "vitrine") return crop(2.2, "bottomcenter");
    if (overlayId === "eventos") return crop(0.95, "topright");
    return crop(0.95, "topleft"); // ranking, alerta, combo — aparecem sem position fixa, no canto superior esquerdo
  }

  OVERLAYS.forEach(ov => {
    const linkBase = location.origin + location.pathname + "?view=" + ov.id;

    const bloco = document.createElement("div");
    bloco.className = "painel-card";
    bloco.style.cssText = "border-top:3px solid var(--ic-links);overflow:hidden;padding:0;";

    const linkRow = document.createElement("div");
    linkRow.style.cssText = "padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;background:var(--surface);";
    linkRow.innerHTML = `
      <div style="min-width:0;flex:1;">
        <div style="font-size:15px;font-weight:700;margin-bottom:2px;">${ov.nome}</div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:5px;">${ov.desc}</div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${linkBase}</div>
      </div>
      <div style="flex-shrink:0;display:flex;gap:8px;flex-wrap:wrap;">
        <button data-view="${ov.id}" style="background:var(--accent);color:#ffffff;border:none;border-radius:6px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;">Copiar link <i class="fa-regular fa-copy"></i></button>
        <button data-testar="${ov.id}" style="background:var(--bg-alt);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;">Testar</button>
        <button data-config="${ov.id}" style="background:var(--bg-alt);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;">Config</button>
      </div>
    `;
    bloco.appendChild(linkRow);

    const previaRow = document.createElement("div");
    previaRow.style.cssText = "border-top:1px solid var(--border);padding:16px 18px;background:var(--bg-alt);display:flex;flex-direction:column;align-items:center;";
    previaRow.innerHTML = `${TITULO_PREVIA}${caixaPreviaIframe(ov.id)}`;
    bloco.appendChild(previaRow);

    galeriaWrap.appendChild(bloco);
  });

  galeriaWrap.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      // monta o link com a config MAIS RECENTE do localStorage (não a
      // capturada quando o painel abriu) — assim, mesmo que você tenha
      // salvo algo em Config sem recarregar a página, o link copiado
      // aqui já sai atualizado.
      const cfgFresco = carregarConfig();
      const cfgCodificadoFresco = codificarConfigParaLink(cfgFresco);
      const linkFinal = location.origin + location.pathname + "?view=" + btn.dataset.view + "&cfg=" + cfgCodificadoFresco;
      copiarTexto(linkFinal);
      const original = btn.textContent;
      btn.textContent = "Copiado ✓";
      setTimeout(() => (btn.innerHTML = original), 1500);
    });
  });

  galeriaWrap.querySelectorAll("[data-testar]").forEach(btn => {
    btn.addEventListener("click", () => {
      abrirOverlayDeTeste(btn.dataset.testar, carregarConfig());
    });
  });

  galeriaWrap.querySelectorAll("[data-config]").forEach(btn => {
    btn.addEventListener("click", () => abrirModalConfigOverlay(btn.dataset.config));
  });

  const notaPrevia = document.createElement("p");
  notaPrevia.style.cssText = "font-size:12px;color:var(--text-faint);margin:4px 0 0;";
  notaPrevia.textContent = "O fundo quadriculado é referência de transparência — no OBS/TikTok Studio o overlay fica por cima da câmera/jogo.";
  secaoOverlaysGaleria.appendChild(notaPrevia);

  // ------------------------------------------------------------
  // Abre o overlay de verdade numa aba nova pra testar (com som e
  // eventos falsos automáticos), sem sujar os dados reais de
  // espectador: usa preview=1 (chave de armazenamento isolada,
  // __preview) mas SEM mudo=1, então o som toca normalmente. cfgOverride
  // permite testar mudanças ainda não salvas (usado pelo modal de config).
  // ------------------------------------------------------------
  function abrirOverlayDeTeste(overlayId, cfgParaTestar) {
    const cfgCodificado = codificarConfigParaLink(cfgParaTestar);
    window.open(location.pathname + "?view=" + overlayId + "&sim=1&preview=1&cfg=" + cfgCodificado, "_blank");
  }

  // ------------------------------------------------------------
  // Atualiza os iframes de prévia acima toda vez que o tema muda
  // (mesmo sem clicar em Salvar) e sempre que a Config é salva.
  // Usa o modo prévia (preview=1) + mudo (mudo=1), que nunca grava a
  // config/dados de espectador editados aqui em cima da config real
  // salva, e nunca toca som (só a aba de Testar/modal toca som).
  // ------------------------------------------------------------
  let _timerPrevia = null;
  function renderPrevias() {
    clearTimeout(_timerPrevia);
    _timerPrevia = setTimeout(() => {
      const cfgFresco = carregarConfig();
      const corPrimariaEl = document.getElementById("corPrimaria");
      if (corPrimariaEl) cfgFresco.tema = lerTemaDoForm();
      const cfgCodificado = codificarConfigParaLink(cfgFresco);
      OVERLAYS.forEach(ov => {
        const frame = document.getElementById("previaFrame_" + ov.id);
        if (!frame) return;
        frame.src = location.pathname + "?view=" + ov.id + "&sim=1&preview=1&mudo=1&cfg=" + cfgCodificado;
        const t = calcularTransformPrevia(ov.id, cfgFresco);
        frame.style.transform = `scale(${t.escala}) translate(${t.tx}px, ${t.ty}px)`;
      });
    }, 300);
  }

  // ============================================================
  // SEÇÃO: Eventos — regras "gatilho → ação" estilo TikFinity.
  // Ações reutilizáveis (card + som) disparadas por eventos que
  // batem com uma condição, no overlay dedicado "Eventos personalizados".
  // ============================================================
  const secaoEventos = criarSecao("eventos");
  secaoEventos.innerHTML = `
    <div class="evt-header">
      <div class="evt-header-icone"><i class="fa-solid fa-bolt"></i></div>
      <div>
        <div class="evt-header-title">Ações &amp; Eventos</div>
        <p class="evt-header-sub">Monte automações no formato <strong>gatilho → ação</strong>: crie ações (card + som) e depois regras que disparam essas ações quando algo acontece na live. Roda no overlay "Eventos personalizados" (copie o link na aba Links).</p>
      </div>
    </div>`;

  // precisa vir ANTES do HTML da caixa "Fila de eventos" logo abaixo, que
  // já lê filaConfigEditando.maximoItens direto no template (sem passar
  // por função) — se ficasse mais pra baixo, dava erro de "usado antes
  // de existir" e travava o painel inteiro (mesma armadilha do TDZ já
  // documentada em outros pontos deste arquivo).
  let filaConfigEditando = Object.assign({ maximoItens: 20, agruparIguais: false, ignorarDuplicados: false }, cfg.automacoes.filaConfig || {});

  // ------------------------------------------------------------
  // Barra de ferramentas (Fase 5a): pesquisar, desfazer/refazer,
  // importar/exportar automações e desativar todas as regras de uma vez.
  // As funções de baixo (renderListaAcoes, normalizarAcao, etc.) ainda
  // não foram declaradas aqui em cima, mas como só rodam dentro de
  // callbacks de clique/input (nunca na hora que a página carrega),
  // já estão prontas quando alguém realmente clicar em algo.
  // ------------------------------------------------------------
  const toolbarEventos = document.createElement("div");
  toolbarEventos.className = "painel-card evt-toolbar";
  toolbarEventos.style.cssText = "margin-bottom:18px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
  secaoEventos.appendChild(toolbarEventos);
  const estiloBotaoToolbar = "background:transparent;color:var(--text-dim);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-size:12px;cursor:pointer;white-space:nowrap;";
  toolbarEventos.innerHTML = `
    <div class="evt-search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input id="evtBusca" type="text" placeholder="Pesquisar ações e regras..."/></div>
    <button id="evtDesativarTodas" style="${estiloBotaoToolbar}"><i class="fa-solid fa-power-off"></i> Desativar todas</button>
    <button id="evtTestarTudo" class="btn-cta" style="border-radius:999px;padding:8px 16px;font-size:12px;cursor:pointer;"><i class="fa-solid fa-flask"></i> Testar tudo</button>
  `;

  let filtroBuscaEventos = "";

  document.getElementById("evtBusca").addEventListener("input", e => {
    filtroBuscaEventos = e.target.value || "";
    renderListaAcoes();
    renderListaEventos();
  });

  document.getElementById("evtDesativarTodas").addEventListener("click", () => {
    if (!eventosEditando.length) return;
    if (!confirm("Desativar todas as " + eventosEditando.length + " regras? Elas ficam salvas, só param de disparar até você reativar.")) return;
    eventosEditando.forEach(r => { r.ativo = false; });
    renderListaEventos();
  });

  document.getElementById("evtTestarTudo").addEventListener("click", () => irParaAba("simulador"));

  const acoesBox = document.createElement("div");
  acoesBox.className = "painel-card evt-box";
  acoesBox.style.cssText = "padding:18px;margin-bottom:18px;";
  secaoEventos.appendChild(acoesBox);
  acoesBox.innerHTML = `
    <div class="evt-box-header">
      <div class="evt-box-icone"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="evt-box-titulo">Ações</div>
      <span class="evt-box-count" id="acoesCount">0</span>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;">Uma ação é o que aparece na tela: um card com ícone, texto e som. Use <code>{nickname}</code> e <code>{valor}</code> no texto pra puxar dados do evento.</p>
    <div id="listaAcoes"></div>
    <button id="addAcao" class="evt-btn-add"><i class="fa-solid fa-plus"></i> Nova ação</button>
  `;

  const variaveisBox = document.createElement("div");
  variaveisBox.className = "painel-card evt-box";
  variaveisBox.style.cssText = "padding:18px;margin-bottom:18px;";
  secaoEventos.appendChild(variaveisBox);
  variaveisBox.innerHTML = `
    <div class="evt-box-header">
      <div class="evt-box-icone"><i class="fa-solid fa-diamond"></i></div>
      <div class="evt-box-titulo">Variáveis globais</div>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;">Contadores/valores que as regras podem ler (nas condições) e alterar (nos efeitos) — ex: "combos_hoje", "meta_diaria". Use <code>{var:nome}</code> no texto de uma ação pra mostrar o valor atual.</p>
    <div id="listaVariaveis"></div>
    <button id="addVariavel" class="evt-btn-add"><i class="fa-solid fa-plus"></i> Nova variável</button>
  `;

  const eventosBox = document.createElement("div");
  eventosBox.className = "painel-card evt-box";
  eventosBox.style.cssText = "padding:18px;";
  secaoEventos.appendChild(eventosBox);
  eventosBox.innerHTML = `
    <div class="evt-box-header">
      <div class="evt-box-icone"><i class="fa-solid fa-diagram-project"></i></div>
      <div class="evt-box-titulo">Regras</div>
      <span class="evt-box-count" id="regrasCount">0</span>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;">Quando o gatilho acontecer e as condições baterem, a ação escolhida dispara no overlay. Cada regra pode ter vários grupos de condições combinados por E/OU, prioridade e cooldown próprios.</p>
    <div id="listaEventos"></div>
    <button id="addEvento" class="evt-btn-add"><i class="fa-solid fa-plus"></i> Nova regra</button>

    <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--border);">
      <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Fila de eventos</div>
      <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 10px;">Quando várias ações disparam quase juntas no overlay "Eventos personalizados", elas entram numa fila em vez de aparecer todas empilhadas.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
        ${campoNumero("filaMaximoItens", "Máximo de itens na fila", filaConfigEditando.maximoItens)}
        <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Agrupar iguais</label><div style="padding-top:9px;">${toggleHtml("filaAgruparIguais", "Agrupar iguais", filaConfigEditando.agruparIguais)}</div></div>
        <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Ignorar duplicados</label><div style="padding-top:9px;">${toggleHtml("filaIgnorarDuplicados", "Ignorar duplicados", filaConfigEditando.ignorarDuplicados)}</div></div>
      </div>
      <p style="font-size:11px;color:var(--text-faint);margin:8px 0 0;"><strong>Agrupar iguais</strong> junta a mesma ação repetida num só card com contador (ex: "Rosa ×5"). <strong>Ignorar duplicados</strong> descarta uma ação repetida se a anterior ainda estiver na tela.</p>
    </div>

    <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--border);">
      <button id="salvarEventos" class="btn-cta" style="border-radius:999px;padding:12px 26px;font-size:14px;cursor:pointer;"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar automações</button>
      <span id="salvoEventosMsg" style="margin-left:12px;font-size:13px;color:var(--accent);display:none;font-family:var(--font-mono);">salvo ✓ — atualiza sozinho nos overlays já abertos</span>
    </div>
  `;

  // Preenche todo campo novo que uma ação salva antes dessa versão não
  // tinha (fonte, sombra, animação, fundo, barra...) com um padrão
  // sensato, sem perder nada que já estava configurado.
  function normalizarAcao(a0) {
    const a = a0 || {};
    return {
      id: a.id || ("acao" + Date.now() + Math.random().toString(36).slice(2, 7)),
      ativo: a.ativo !== false,
      nome: a.nome || "nova ação",
      categoria: a.categoria || "Geral",
      prioridade: a.prioridade != null ? a.prioridade : 5,
      cooldownMs: a.cooldownMs || 0,
      duracaoMs: a.duracaoMs || 4000,
      texto: a.texto || "{nickname} ativou!",
      textoEstilo: Object.assign({ fonte: "", cor: "#ffffff", tamanho: 15, alinhamento: "left", contornoAtivo: false, contornoCor: "#000000", contornoEspessura: 2, sombraAtiva: false, sombraCor: "#000000", sombraBlur: 4 }, a.textoEstilo || {}),
      icone: a.icone || "",
      iconeTipo: a.iconeTipo || "auto",
      iconeUrl: a.iconeUrl || "",
      cor: a.cor || "#F0A63C",
      som: Object.assign({ ativo: false, som: "ding", url: "", volume: null, fadeInMs: 0, fadeOutMs: 0, loop: false }, a.som || {}),
      animacao: Object.assign({ entrada: "slideTop", saida: "fade" }, a.animacao || {}),
      fundo: Object.assign({ tipo: "cor", cor: "#202226", corGradiente2: "#151719", imagemUrl: "", blur: 0, glow: false, radius: 12, opacidade: 100 }, a.fundo || {}),
      barraProgresso: Object.assign({ ativo: false, cor: "#F0A63C", espessura: 4 }, a.barraProgresso || {}),
    };
  }

  // ------------------------------------------------------------
  // Biblioteca de templates (Fase 6) — modelos prontos, ricos (fundo,
  // glow, animação, som, barra), 100% locais (embutidos aqui mesmo, sem
  // marketplace nem download). Escolher um já cria a ação normalizada
  // com tudo preenchido; dá pra editar qualquer campo depois.
  // ------------------------------------------------------------
  const TEMPLATES_ACAO = [
    {
      nome: "Galaxy Premium", categoria: "Presente", texto: "{nickname} mandou uma GALÁXIA PREMIUM! 🌌",
      cor: "#9B5DE5", icone: "🌌", iconeTipo: "emoji", prioridade: 9, duracaoMs: 6000,
      textoEstilo: { tamanho: 17, sombraAtiva: true, sombraCor: "#000000", sombraBlur: 6 },
      fundo: { tipo: "gradiente", cor: "#3a2266", corGradiente2: "#150f24", glow: true, radius: 16 },
      animacao: { entrada: "elastic", saida: "zoom" },
      som: { ativo: true, som: "fanfarra" },
      barraProgresso: { ativo: true, cor: "#9B5DE5" },
    },
    {
      nome: "Lion", categoria: "Presente", texto: "{nickname} mandou um LEÃO! 🦁",
      cor: "#F0A63C", icone: "🦁", iconeTipo: "emoji", prioridade: 8, duracaoMs: 5000,
      fundo: { tipo: "gradiente", cor: "#4a3210", corGradiente2: "#1f1608", glow: true },
      animacao: { entrada: "bounce", saida: "fade" },
      som: { ativo: true, som: "fanfarra" },
      barraProgresso: { ativo: true, cor: "#F0A63C" },
    },
    {
      nome: "Rose", categoria: "Presente", texto: "{nickname} mandou uma Rosa! 🌹",
      cor: "#E0637A", icone: "🌹", iconeTipo: "emoji", prioridade: 3, duracaoMs: 3000,
      fundo: { tipo: "cor", cor: "#2a1620" },
      animacao: { entrada: "slideLeft", saida: "fade" },
      som: { ativo: true, som: "ding" },
    },
    {
      nome: "Follow", categoria: "Seguidor", texto: "{nickname} começou a seguir! ⭐",
      cor: "#F0C24B", icone: "⭐", iconeTipo: "emoji", prioridade: 5, duracaoMs: 3500,
      fundo: { tipo: "cor", cor: "#241d0f" },
      animacao: { entrada: "slideTop", saida: "fade" },
      som: { ativo: true, som: "ding" },
    },
    {
      nome: "Like", categoria: "Like", texto: "{nickname} curtiu a live! ❤️",
      cor: "#D4537E", icone: "❤️", iconeTipo: "emoji", prioridade: 2, duracaoMs: 2500,
      fundo: { tipo: "cor", cor: "#2a1620" },
      animacao: { entrada: "pop", saida: "fade" },
      som: { ativo: false, som: "ding" }, // like é muito frequente — som fica desligado por padrão
    },
    {
      nome: "Subscriber", categoria: "Assinante", texto: "{nickname} é assinante agora! 👑",
      cor: "#F0C24B", icone: "👑", iconeTipo: "emoji", prioridade: 8, duracaoMs: 5000,
      fundo: { tipo: "gradiente", cor: "#4a3d17", corGradiente2: "#1e1809", glow: true },
      animacao: { entrada: "scale", saida: "zoom" },
      som: { ativo: true, som: "fanfarra" },
      barraProgresso: { ativo: true, cor: "#F0C24B" },
    },
    {
      nome: "PK", categoria: "PK", texto: "🎉 Vitória no PK!!!",
      cor: "#28C48A", icone: "🎉", iconeTipo: "emoji", prioridade: 9, duracaoMs: 6000,
      textoEstilo: { tamanho: 17, alinhamento: "center" },
      fundo: { tipo: "gradiente", cor: "#123324", corGradiente2: "#0a1a15", glow: true },
      animacao: { entrada: "bounce", saida: "zoom" },
      som: { ativo: true, som: "fanfarra" },
    },
    {
      nome: "Meta", categoria: "Meta", texto: "📌 Meta alcançada!",
      cor: "#F0A63C", icone: "📌", iconeTipo: "emoji", prioridade: 7, duracaoMs: 5000,
      fundo: { tipo: "cor", cor: "#241d0f" },
      animacao: { entrada: "pop", saida: "fade" },
      som: { ativo: true, som: "fanfarra" },
      barraProgresso: { ativo: true, cor: "#F0A63C" },
    },
    {
      nome: "PIX", categoria: "Doação", texto: "{nickname} mandou um PIX! 💸",
      cor: "#32BCAD", icone: "💸", iconeTipo: "emoji", prioridade: 9, duracaoMs: 6000,
      fundo: { tipo: "gradiente", cor: "#0f3d38", corGradiente2: "#0a1f1c", glow: true },
      animacao: { entrada: "slideBottom", saida: "fade" },
      som: { ativo: true, som: "moeda" },
    },
    {
      nome: "Doação", categoria: "Doação", texto: "{nickname} fez uma doação! Muito obrigado 💝",
      cor: "#F0464B", icone: "💝", iconeTipo: "emoji", prioridade: 9, duracaoMs: 6000,
      fundo: { tipo: "gradiente", cor: "#3d1418", corGradiente2: "#1a0a0c", glow: true },
      animacao: { entrada: "elastic", saida: "fade" },
      som: { ativo: true, som: "fanfarra" },
      barraProgresso: { ativo: true, cor: "#F0464B" },
    },
  ];

  let acoesEditando = (cfg.automacoes.acoes || []).map(normalizarAcao);

  const GATILHOS = [
    { id: "mensagem", label: "Mensagem no chat" },
    { id: "like", label: "Like" },
    { id: "presente", label: "Presente" },
    { id: "seguidor", label: "Novo seguidor" },
    { id: "compartilhamento", label: "Compartilhamento" },
  ];

  // ------------------------------------------------------------
  // Variáveis globais: nome (usado em {var:nome}), tipo (número/texto)
  // e valor inicial. O valor QUE MUDA em tempo real fica só no overlay
  // (localStorage runtime); aqui só se edita a definição.
  // ------------------------------------------------------------
  function normalizarVariavel(v0) {
    const v = v0 || {};
    return {
      id: v.id || ("var" + Date.now() + Math.random().toString(36).slice(2, 7)),
      nome: v.nome || "minha_variavel",
      tipo: v.tipo === "texto" ? "texto" : "numero",
      valorInicial: v.tipo === "texto" ? (v.valorInicial || "") : (Number(v.valorInicial) || 0),
    };
  }
  let variaveisEditando = (cfg.automacoes.variaveis || []).map(normalizarVariavel);

  function renderListaVariaveis() {
    const el = document.getElementById("listaVariaveis");
    if (!variaveisEditando.length) {
      el.innerHTML = `<div class="evt-vazio"><i class="fa-solid fa-diamond" style="margin-right:6px;opacity:.7;"></i>Nenhuma variável criada ainda.</div>`;
    } else {
      el.innerHTML = variaveisEditando.map((v, i) => `
        <div class="evt-card" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end;">
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">nome (use {var:nome})</label>
            <input data-i="${i}" data-varcampo="nome" type="text" value="${v.nome}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/></div>
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">tipo</label>
            <select data-i="${i}" data-varcampo="tipo" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;">
              <option value="numero" ${v.tipo === "numero" ? "selected" : ""}>Número</option>
              <option value="texto" ${v.tipo === "texto" ? "selected" : ""}>Texto</option>
            </select></div>
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">valor inicial</label>
            <input data-i="${i}" data-varcampo="valorInicial" type="text" value="${v.valorInicial}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/></div>
          <button data-removevariavel="${i}" title="Remover" class="evt-btn evt-btn-remover"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      `).join("");
    }
    el.querySelectorAll("[data-varcampo]").forEach(input => {
      input.addEventListener("input", () => {
        const i = Number(input.dataset.i);
        const campo = input.dataset.varcampo;
        if (campo === "valorInicial") {
          variaveisEditando[i].valorInicial = variaveisEditando[i].tipo === "texto" ? input.value : (Number(input.value) || 0);
        } else {
          variaveisEditando[i][campo] = input.value;
        }
        if (campo === "tipo") renderListaVariaveis();
      });
    });
    el.querySelectorAll("[data-removevariavel]").forEach(btn => {
      btn.addEventListener("click", () => {
        variaveisEditando.splice(Number(btn.dataset.removevariavel), 1);
        renderListaVariaveis();
      });
    });
  }
  renderListaVariaveis();
  document.getElementById("addVariavel").addEventListener("click", () => {
    variaveisEditando.push(normalizarVariavel({}));
    renderListaVariaveis();
  });

  // ------------------------------------------------------------
  // Regras: cada uma tem no máximo UMA condição (campo/operador/valor).
  // Migra formatos antigos (grupos de condições E/OU, ou o formato ainda
  // mais antigo condicaoTipo/condicaoValor) pegando a primeira condição
  // que existir, sem perder o que já estava configurado.
  // ------------------------------------------------------------
  function normalizarRegra(r0) {
    const r = r0 || {};
    let condicao = r.condicao || null;
    if (!condicao) {
      const primeiroGrupo = r.condicionamento && r.condicionamento.grupos && r.condicionamento.grupos[0];
      const primeiraCondicao = primeiroGrupo && primeiroGrupo.condicoes && primeiroGrupo.condicoes[0];
      if (primeiraCondicao) {
        condicao = { campo: primeiraCondicao.campo, operador: primeiraCondicao.operador, valor: primeiraCondicao.valor };
      } else if (r.condicaoTipo === "valorMinimo") {
        condicao = { campo: "valor", operador: "maiorIgual", valor: r.condicaoValor || "0" };
      } else if (r.condicaoTipo === "contemPalavra") {
        condicao = { campo: "comentario", operador: "contem", valor: r.condicaoValor || "" };
      }
    }
    return {
      id: r.id || ("evento" + Date.now() + Math.random().toString(36).slice(2, 7)),
      nome: r.nome || "nova regra",
      ativo: r.ativo !== false,
      gatilho: r.gatilho || "mensagem",
      prioridade: r.prioridade != null ? r.prioridade : 5,
      cooldownMs: r.cooldownMs || 0,
      // campo vazio = sem condição, a regra sempre dispara quando o
      // gatilho acontecer.
      condicao: condicao || { campo: "", operador: "", valor: "" },
      acaoId: r.acaoId || "",
      efeitos: r.efeitos || [],
      // Fase 4 — "ações executáveis": sequência extra que roda DEPOIS da
      // ação principal (esperar, tocar/parar som, confete, fogos,
      // mexer em variável, ou disparar outra regra).
      passos: r.passos || [],
    };
  }
  let eventosEditando = (cfg.automacoes.eventos || []).map(normalizarRegra);

  // ------------------------------------------------------------
  // Lista de ações: um resumo (ícone + nome + categoria) por linha,
  // com Editar (abre o modal completo), Duplicar e Remover. O editor
  // rico fica todo dentro do modal, pra não lotar essa lista.
  // ------------------------------------------------------------
  function renderListaAcoes() {
    const el = document.getElementById("listaAcoes");
    const contador = document.getElementById("acoesCount");
    if (contador) contador.textContent = String(acoesEditando.length);
    const termo = (filtroBuscaEventos || "").toLowerCase().trim();
    const itensFiltrados = acoesEditando
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => !termo || a.nome.toLowerCase().includes(termo) || (a.categoria || "").toLowerCase().includes(termo));
    if (!acoesEditando.length) {
      el.innerHTML = `<div class="evt-vazio"><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:6px;opacity:.7;"></i>Nenhuma ação criada ainda — comece com um template abaixo.</div>`;
    } else if (!itensFiltrados.length) {
      el.innerHTML = `<div class="evt-vazio">Nenhuma ação encontrada pra "${termo}".</div>`;
    } else {
      el.innerHTML = itensFiltrados.map(({ a, i }) => {
        const inativa = a.ativo === false;
        const cor = a.cor || "var(--ic-eventos)";
        return `
        <div class="evt-card${inativa ? " evt-inativo" : ""}" style="--evt-accent:${cor};">
          <label class="toggle" style="flex-shrink:0;" title="Ativar/desativar ação"><input type="checkbox" data-toggleacao="${i}" ${!inativa ? "checked" : ""}/><span class="trilha"></span></label>
          <div class="evt-avatar" style="background:${cor};">${iconeAcaoHtml(a, 16)}</div>
          <div class="evt-info">
            <div class="evt-nome">${a.nome}<span class="evt-chip">${a.categoria}</span>${inativa ? `<span class="evt-chip evt-chip-inativo">pausada</span>` : ""}</div>
            <div class="evt-meta">${Math.round((a.duracaoMs || 4000) / 1000)}s na tela${a.som && a.som.ativo ? " · <i class=\"fa-solid fa-volume-high\"></i> som" : ""}${a.cooldownMs ? ` · cooldown ${Math.round(a.cooldownMs / 1000)}s` : ""}</div>
          </div>
          <div class="evt-actions">
            <button data-editaracao="${i}" class="evt-btn evt-btn-editar"><i class="fa-solid fa-pen"></i> Editar</button>
            <button data-duplicaracao="${i}" title="Duplicar" class="evt-btn evt-btn-duplicar"><i class="fa-regular fa-copy"></i></button>
            <button data-removeacao="${i}" title="Remover" class="evt-btn evt-btn-remover"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;
      }).join("");
    }
    el.querySelectorAll("[data-toggleacao]").forEach(cb => {
      cb.addEventListener("change", () => {
        acoesEditando[Number(cb.dataset.toggleacao)].ativo = cb.checked;
        renderListaAcoes();
      });
    });
    el.querySelectorAll("[data-editaracao]").forEach(btn => {
      btn.addEventListener("click", () => abrirModalEditarAcao(Number(btn.dataset.editaracao)));
    });
    el.querySelectorAll("[data-duplicaracao]").forEach(btn => {
      btn.addEventListener("click", () => {
        const original = acoesEditando[Number(btn.dataset.duplicaracao)];
        const copia = normalizarAcao(Object.assign(structuredClone(original), { id: "acao" + Date.now(), nome: original.nome + " (cópia)" }));
        acoesEditando.push(copia);
        renderListaAcoes();
      });
    });
    el.querySelectorAll("[data-removeacao]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idRemovido = acoesEditando[Number(btn.dataset.removeacao)].id;
        acoesEditando.splice(Number(btn.dataset.removeacao), 1);
        eventosEditando.forEach(ev => { if (ev.acaoId === idRemovido) ev.acaoId = ""; });
        renderListaAcoes();
        renderListaEventos();
      });
    });
  }
  renderListaAcoes();

  // ------------------------------------------------------------
  // "+ nova ação" abre um seletor de templates prontos (ou "do zero"),
  // cria a ação normalizada e já abre o editor completo nela.
  // ------------------------------------------------------------
  document.getElementById("addAcao").addEventListener("click", () => {
    const temaPreview = temaEfetivo(carregarConfig(), "eventos");
    const backdrop = document.createElement("div");
    backdrop.id = "modalTemplateAcao";
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:660px;max-height:85vh;overflow-y:auto;">
        <div style="font-size:16px;font-weight:700;margin-bottom:4px;">Biblioteca de templates</div>
        <p style="font-size:12.5px;color:var(--text-dim);margin:0 0 14px;">Modelos prontos e 100% locais — escolha um pra já começar com visual, som e animação configurados (dá pra mudar tudo depois), ou comece do zero.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;">
          ${TEMPLATES_ACAO.map((tpl, i) => {
            const tplNormalizado = normalizarAcao(tpl);
            const textoExemplo = tplNormalizado.texto.replace("{nickname}", "espectador").replace("{valor}", "123");
            const montado = montarCardAcaoHtml(tplNormalizado, temaPreview, textoExemplo);
            return `
              <button data-template="${i}" style="${montado.wrapperCss}padding:0;text-align:left;cursor:pointer;background:none;">
                ${montado.innerHtml}
              </button>
            `;
          }).join("")}
        </div>
        <button id="templateDoZero" style="margin-top:14px;width:100%;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:8px;padding:10px;font-size:12.5px;cursor:pointer;">+ Começar do zero</button>
        <button id="fecharModalTemplate" style="margin-top:10px;width:100%;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:10px;font-size:13px;cursor:pointer;">Cancelar</button>
      </div>
    `;
    document.body.appendChild(backdrop);
    iniciarLottiesPendentes(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) backdrop.remove(); });
    document.getElementById("fecharModalTemplate").addEventListener("click", () => backdrop.remove());
    function criarECfgAbrirEditor(base) {
      const nova = normalizarAcao(Object.assign({ id: "acao" + Date.now() }, base));
      acoesEditando.push(nova);
      renderListaAcoes();
      renderListaEventos();
      backdrop.remove();
      abrirModalEditarAcao(acoesEditando.length - 1);
    }
    backdrop.querySelectorAll("[data-template]").forEach(btn => {
      btn.addEventListener("click", () => criarECfgAbrirEditor(TEMPLATES_ACAO[Number(btn.dataset.template)]));
    });
    document.getElementById("templateDoZero").addEventListener("click", () => criarECfgAbrirEditor({}));
  });

  // ------------------------------------------------------------
  // Modal de edição completa de uma ação: geral, texto, ícone, som,
  // animação, fundo e barra de progresso — com prévia ao vivo que
  // atualiza a cada mudança de campo, igual pedido (Fase 1).
  // ------------------------------------------------------------
  const estiloCampoAE = "width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;";
  const rotuloAE = "font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;";
  function campoSelectAE(id, label, opcoes, valorAtual) {
    return `<div><label style="${rotuloAE}">${label}</label>
      <select id="${id}" style="${estiloCampoAE}">
        ${opcoes.map(o => `<option value="${o.id}" ${o.id === valorAtual ? "selected" : ""}>${o.nome}</option>`).join("")}
      </select></div>`;
  }
  function fecharModalAcao() {
    const el = document.getElementById("modalEditarAcao");
    if (el) el.remove();
  }

  function abrirModalEditarAcao(index) {
    fecharModalAcao();
    const a = acoesEditando[index];
    if (!a) return;

    const backdrop = document.createElement("div");
    backdrop.id = "modalEditarAcao";
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:640px;max-height:88vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="font-size:16px;font-weight:700;">Editar ação — ${a.nome}</div>
          <button id="aeFechar" style="background:transparent;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;line-height:1;">×</button>
        </div>

        <div id="aePreviaBox" style="max-width:400px;margin:0 auto 20px;"></div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Geral</div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoTexto("aeNome", "Nome da ação", a.nome)}
          <div><label style="${rotuloAE}">Categoria</label><input id="aeCategoria" type="text" value="${a.categoria}" style="${estiloCampoAE}"/></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
          ${campoNumero("aePrioridade", "Prioridade (1-10)", a.prioridade)}
          ${campoNumero("aeCooldown", "Cooldown (segundos)", Math.round((a.cooldownMs || 0) / 1000))}
          ${campoNumero("aeDuracao", "Duração na tela (seg)", Math.round((a.duracaoMs || 4000) / 1000))}
        </div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Texto</div>
        <div style="margin-bottom:10px;">${campoTexto("aeTexto", "Mensagem (aceita {nickname} e {valor})", a.texto)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoSelectAE("aeFonte", "Fonte", Object.entries(FONTES).map(([k, f]) => ({ id: k, nome: f.nome })), a.textoEstilo.fonte)}
          ${campoCor("aeTextoCor", "Cor do texto", a.textoEstilo.cor)}
          ${campoNumero("aeTamanho", "Tamanho (px)", a.textoEstilo.tamanho)}
        </div>
        <div style="margin-bottom:12px;">
          ${campoSelectAE("aeAlinhamento", "Alinhamento", [{ id: "left", nome: "Esquerda" }, { id: "center", nome: "Centro" }, { id: "right", nome: "Direita" }], a.textoEstilo.alinhamento)}
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin-bottom:10px;">
          <div>${toggleHtml("aeContornoAtivo", "Contorno", a.textoEstilo.contornoAtivo)}</div>
          ${campoCor("aeContornoCor", "Cor do contorno", a.textoEstilo.contornoCor)}
          ${campoNumero("aeContornoEspessura", "Espessura (px)", a.textoEstilo.contornoEspessura)}
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin-bottom:16px;">
          <div>${toggleHtml("aeSombraAtiva", "Sombra", a.textoEstilo.sombraAtiva)}</div>
          ${campoCor("aeSombraCor", "Cor da sombra", a.textoEstilo.sombraCor)}
          ${campoNumero("aeSombraBlur", "Blur (px)", a.textoEstilo.sombraBlur)}
        </div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Ícone e cor de destaque</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoSelectAE("aeIconeTipo", "Tipo de ícone", [
            { id: "auto", nome: "Auto (por nome)" }, { id: "emoji", nome: "Emoji" }, { id: "imagem", nome: "Imagem (PNG/JPG)" },
            { id: "gif", nome: "GIF" }, { id: "svg", nome: "SVG" }, { id: "lottie", nome: "Lottie (JSON animado)" },
          ], a.iconeTipo)}
          ${campoCor("aeCor", "Cor de destaque (borda/ícone)", a.cor)}
        </div>
        <div id="aeIconeEmojiWrap" style="margin-bottom:10px;${a.iconeTipo === "emoji" || a.iconeTipo === "auto" ? "" : "display:none;"}">
          <label style="${rotuloAE}">Emoji ou palavra-chave (auto)</label>
          <input id="aeIconeEmoji" type="text" value="${a.icone || ""}" placeholder="⭐" style="${estiloCampoAE}"/>
        </div>
        <div id="aeIconeUrlWrap" style="margin-bottom:16px;${a.iconeTipo === "auto" || a.iconeTipo === "emoji" ? "display:none;" : ""}">
          <label style="${rotuloAE}">URL da imagem/gif/svg/lottie</label>
          <input id="aeIconeUrl" type="text" value="${a.iconeUrl || ""}" placeholder="https://..." style="${estiloCampoAE}"/>
        </div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Som</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
          ${toggleHtml("aeSomAtivo", "Tocar som", a.som.ativo)}
          <select id="aeSomTipo" style="background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px 8px;font-size:12px;">
            ${Object.entries(SONS_DISPONIVEIS).map(([k, s]) => `<option value="${k}" ${a.som.som === k ? "selected" : ""}>${s.nome}</option>`).join("")}
          </select>
          <button id="aeTestarSom" style="background:transparent;color:var(--text-dim);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;">Testar som</button>
        </div>
        <div id="aeSomUrlWrap" style="margin-bottom:10px;${a.som.som === "personalizado" ? "" : "display:none;"}">
          <input id="aeSomUrl" type="text" value="${a.som.url || ""}" placeholder="https://... (link direto do arquivo de áudio)" style="${estiloCampoAE}"/>
          <label style="font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:6px;margin-top:6px;">ou envie um arquivo do seu computador:
            <input id="aeSomArquivo" type="file" accept="audio/*" style="font-size:11px;"/>
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px;">
          <div><label style="${rotuloAE}">Volume (vazio = usa o geral)</label><input id="aeSomVolume" type="number" min="0" max="100" value="${a.som.volume != null ? a.som.volume : ""}" style="${estiloCampoAE}"/></div>
          ${campoNumero("aeSomFadeIn", "Fade in (seg)", (a.som.fadeInMs || 0) / 1000)}
          ${campoNumero("aeSomFadeOut", "Fade out (seg)", (a.som.fadeOutMs || 0) / 1000)}
        </div>
        <div style="margin-bottom:16px;">${toggleHtml("aeSomLoop", "Repetir em loop (só p/ som personalizado)", a.som.loop)}</div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Animação</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          ${campoSelectAE("aeAnimEntrada", "Entrada", ANIMACOES_ACAO_INFO, a.animacao.entrada)}
          ${campoSelectAE("aeAnimSaida", "Saída", ANIMACOES_ACAO_INFO, a.animacao.saida)}
        </div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Fundo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoSelectAE("aeFundoTipo", "Tipo", [{ id: "cor", nome: "Cor sólida" }, { id: "gradiente", nome: "Gradiente" }, { id: "imagem", nome: "Imagem" }], a.fundo.tipo)}
          ${campoCor("aeFundoCor", "Cor de fundo", a.fundo.cor)}
        </div>
        <div id="aeFundoCor2Wrap" style="margin-bottom:10px;${a.fundo.tipo === "gradiente" ? "" : "display:none;"}">
          ${campoCor("aeFundoCor2", "2ª cor do gradiente", a.fundo.corGradiente2)}
        </div>
        <div id="aeFundoImagemWrap" style="margin-bottom:10px;${a.fundo.tipo === "imagem" ? "" : "display:none;"}">
          <label style="${rotuloAE}">URL da imagem de fundo</label>
          <input id="aeFundoImagemUrl" type="text" value="${a.fundo.imagemUrl || ""}" placeholder="https://..." style="${estiloCampoAE}"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoNumero("aeFundoBlur", "Blur do fundo (px)", a.fundo.blur)}
          ${campoNumero("aeFundoRadius", "Borda arredondada (px)", a.fundo.radius)}
          ${campoNumero("aeFundoOpacidade", "Opacidade (%)", a.fundo.opacidade)}
        </div>
        <div style="margin-bottom:16px;">${toggleHtml("aeFundoGlow", "Glow (brilho ao redor)", a.fundo.glow)}</div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Barra de progresso</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin-bottom:6px;">
          <div>${toggleHtml("aeBarraAtiva", "Mostrar barra (esvazia até sumir)", a.barraProgresso.ativo)}</div>
          ${campoCor("aeBarraCor", "Cor da barra", a.barraProgresso.cor)}
          ${campoNumero("aeBarraEspessura", "Espessura (px)", a.barraProgresso.espessura)}
        </div>

        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);align-items:center;">
          <button id="aeCancelar" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Cancelar</button>
          <button id="aeTestarCompleto" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">▶ Testar</button>
          <button id="aeSalvar" class="btn-cta" style="flex:2;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Salvar ação</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) fecharModalAcao(); });
    document.getElementById("aeFechar").addEventListener("click", fecharModalAcao);
    document.getElementById("aeCancelar").addEventListener("click", fecharModalAcao);

    // mostra/esconde campos condicionais conforme o tipo escolhido
    document.getElementById("aeIconeTipo").addEventListener("change", () => {
      const t = document.getElementById("aeIconeTipo").value;
      document.getElementById("aeIconeEmojiWrap").style.display = (t === "emoji" || t === "auto") ? "" : "none";
      document.getElementById("aeIconeUrlWrap").style.display = (t === "auto" || t === "emoji") ? "none" : "";
    });
    document.getElementById("aeSomTipo").addEventListener("change", () => {
      document.getElementById("aeSomUrlWrap").style.display = document.getElementById("aeSomTipo").value === "personalizado" ? "" : "none";
    });
    wireUploadDeAudio(document.getElementById("aeSomArquivo"), document.getElementById("aeSomUrl"));
    document.getElementById("aeFundoTipo").addEventListener("change", () => {
      const t = document.getElementById("aeFundoTipo").value;
      document.getElementById("aeFundoCor2Wrap").style.display = t === "gradiente" ? "" : "none";
      document.getElementById("aeFundoImagemWrap").style.display = t === "imagem" ? "" : "none";
    });

    function lerAcaoDoForm() {
      return normalizarAcao({
        id: a.id,
        nome: document.getElementById("aeNome").value || "sem nome",
        categoria: document.getElementById("aeCategoria").value || "Geral",
        prioridade: Number(document.getElementById("aePrioridade").value) || 5,
        cooldownMs: Math.round((Number(document.getElementById("aeCooldown").value) || 0) * 1000),
        duracaoMs: Math.round((Number(document.getElementById("aeDuracao").value) || 4) * 1000),
        texto: document.getElementById("aeTexto").value,
        textoEstilo: {
          fonte: document.getElementById("aeFonte").value,
          cor: document.getElementById("aeTextoCor").value,
          tamanho: Number(document.getElementById("aeTamanho").value) || 15,
          alinhamento: document.getElementById("aeAlinhamento").value,
          contornoAtivo: document.getElementById("aeContornoAtivo").checked,
          contornoCor: document.getElementById("aeContornoCor").value,
          contornoEspessura: Number(document.getElementById("aeContornoEspessura").value) || 2,
          sombraAtiva: document.getElementById("aeSombraAtiva").checked,
          sombraCor: document.getElementById("aeSombraCor").value,
          sombraBlur: Number(document.getElementById("aeSombraBlur").value) || 4,
        },
        icone: document.getElementById("aeIconeEmoji").value,
        iconeTipo: document.getElementById("aeIconeTipo").value,
        iconeUrl: document.getElementById("aeIconeUrl").value,
        cor: document.getElementById("aeCor").value,
        som: {
          ativo: document.getElementById("aeSomAtivo").checked,
          som: document.getElementById("aeSomTipo").value,
          url: document.getElementById("aeSomUrl").value,
          volume: document.getElementById("aeSomVolume").value === "" ? null : Number(document.getElementById("aeSomVolume").value),
          fadeInMs: Math.round((Number(document.getElementById("aeSomFadeIn").value) || 0) * 1000),
          fadeOutMs: Math.round((Number(document.getElementById("aeSomFadeOut").value) || 0) * 1000),
          loop: document.getElementById("aeSomLoop").checked,
        },
        animacao: {
          entrada: document.getElementById("aeAnimEntrada").value,
          saida: document.getElementById("aeAnimSaida").value,
        },
        fundo: {
          tipo: document.getElementById("aeFundoTipo").value,
          cor: document.getElementById("aeFundoCor").value,
          corGradiente2: document.getElementById("aeFundoCor2").value,
          imagemUrl: document.getElementById("aeFundoImagemUrl").value,
          blur: Number(document.getElementById("aeFundoBlur").value) || 0,
          glow: document.getElementById("aeFundoGlow").checked,
          radius: Number(document.getElementById("aeFundoRadius").value) || 12,
          opacidade: Number(document.getElementById("aeFundoOpacidade").value) || 100,
        },
        barraProgresso: {
          ativo: document.getElementById("aeBarraAtiva").checked,
          cor: document.getElementById("aeBarraCor").value,
          espessura: Number(document.getElementById("aeBarraEspessura").value) || 4,
        },
      });
    }

    // prévia ao vivo: qualquer mudança em qualquer campo já reflete no
    // card mostrado, sem precisar salvar nem recarregar nada.
    function atualizarPreviaAcao() {
      const acaoAtual = lerAcaoDoForm();
      const tema = temaEfetivo(carregarConfig(), "eventos");
      const textoResolvido = acaoAtual.texto.replace("{nickname}", "espectador_teste").replace("{valor}", "123");
      const montado = montarCardAcaoHtml(acaoAtual, tema, textoResolvido);
      const box = document.getElementById("aePreviaBox");
      box.innerHTML = `<div style="${montado.wrapperCss}">${montado.innerHtml}</div>`;
      iniciarLottiesPendentes(box);
    }
    backdrop.querySelectorAll("input, select").forEach(el => el.addEventListener("input", atualizarPreviaAcao));
    atualizarPreviaAcao();

    document.getElementById("aeTestarSom").addEventListener("click", () => {
      const acaoAtual = lerAcaoDoForm();
      const cfgAtual = carregarConfig();
      tocarSomAcao(acaoAtual.som, cfgAtual.sons.volume, acaoAtual.duracaoMs);
    });

    document.getElementById("aeTestarCompleto").addEventListener("click", () => {
      const acaoAtual = lerAcaoDoForm();
      const tema = temaEfetivo(carregarConfig(), "eventos");
      const textoResolvido = acaoAtual.texto.replace("{nickname}", "espectador_teste").replace("{valor}", "123");
      const box = document.getElementById("aePreviaBox");
      box.innerHTML = "";
      criarFilaDeAcoes(box, carregarConfig().sons.volume).mostrar(acaoAtual, tema, textoResolvido, true);
      setTimeout(atualizarPreviaAcao, (acaoAtual.duracaoMs || 4000) + 500);
    });

    document.getElementById("aeSalvar").addEventListener("click", () => {
      acoesEditando[index] = lerAcaoDoForm();
      renderListaAcoes();
      renderListaEventos();
      fecharModalAcao();
    });
  }

  // legenda curta de operador, pro resumo da lista de regras
  const LEGENDA_OPERADOR = { igual: "=", diferente: "≠", maior: ">", maiorIgual: "≥", menor: "<", menorIgual: "≤", contem: "contém", naoContem: "não contém", comecaCom: "começa com", terminaCom: "termina com" };
  function nomeCampoLegivel(campo) {
    if (campo && campo.indexOf("variavel:") === 0) {
      const v = variaveisEditando.find(v => v.id === campo.slice(9));
      return v ? v.nome : "variável";
    }
    return (CAMPOS_CONDICAO[campo] && CAMPOS_CONDICAO[campo].nome) || campo;
  }
  function resumoRegraTexto(regra) {
    const c = regra.condicao;
    if (!c || !c.campo) return "sempre (sem condição)";
    return `${nomeCampoLegivel(c.campo)} ${LEGENDA_OPERADOR[c.operador] || c.operador} ${c.valor}`;
  }

  // ------------------------------------------------------------
  // Lista de regras: resumo compacto (ativo/inativo, gatilho, condições
  // em texto, ação) com Editar/Duplicar/Remover — o editor completo
  // (condição, efeitos em variáveis, testador) fica no modal.
  // ------------------------------------------------------------
  function renderListaEventos() {
    const el = document.getElementById("listaEventos");
    const contador = document.getElementById("regrasCount");
    if (contador) contador.textContent = String(eventosEditando.length);
    const termo = (filtroBuscaEventos || "").toLowerCase().trim();
    const itensFiltrados = eventosEditando
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => {
        if (!termo) return true;
        const gatilhoLabel = (GATILHOS.find(g => g.id === r.gatilho) || {}).label || r.gatilho || "";
        return r.nome.toLowerCase().includes(termo) || gatilhoLabel.toLowerCase().includes(termo);
      });
    if (!eventosEditando.length) {
      el.innerHTML = `<div class="evt-vazio"><i class="fa-solid fa-diagram-project" style="margin-right:6px;opacity:.7;"></i>Nenhuma regra criada ainda — ligue um gatilho a uma ação.</div>`;
    } else if (!itensFiltrados.length) {
      el.innerHTML = `<div class="evt-vazio">Nenhuma regra encontrada pra "${termo}".</div>`;
    } else {
      el.innerHTML = itensFiltrados.map(({ r, i }) => {
        const acao = acoesEditando.find(a => a.id === r.acaoId);
        const gatilhoLabel = (GATILHOS.find(g => g.id === r.gatilho) || {}).label || r.gatilho;
        const inativa = r.ativo === false;
        return `
        <div class="evt-card${inativa ? " evt-inativo" : ""}">
          <label class="toggle" style="flex-shrink:0;" title="Ativar/desativar regra"><input type="checkbox" data-toggleregra="${i}" ${!inativa ? "checked" : ""}/><span class="trilha"></span></label>
          <div class="evt-avatar" style="background:var(--surface);border:1px solid var(--border);color:var(--ic-eventos);"><i class="fa-solid fa-bolt"></i></div>
          <div class="evt-info">
            <div class="evt-nome">${r.nome}${inativa ? `<span class="evt-chip evt-chip-inativo">pausada</span>` : `<span class="evt-chip evt-chip-ativo">ativa</span>`}</div>
            <div class="evt-flow" style="margin-top:3px;">
              <span class="evt-chip">${gatilhoLabel}</span>
              <i class="fa-solid fa-arrow-right evt-flow-seta"></i>
              <span class="evt-flow-acao">${acao ? acao.nome : "(sem ação escolhida)"}</span>
            </div>
            <div class="evt-meta" style="margin-top:3px;">${resumoRegraTexto(r)}${r.cooldownMs ? ` · cooldown ${Math.round(r.cooldownMs / 1000)}s` : ""}${r.prioridade !== 5 ? ` · prioridade ${r.prioridade}` : ""}</div>
          </div>
          <div class="evt-actions">
            <button data-editarregra="${i}" class="evt-btn evt-btn-editar"><i class="fa-solid fa-pen"></i> Editar</button>
            <button data-duplicarregra="${i}" title="Duplicar" class="evt-btn evt-btn-duplicar"><i class="fa-regular fa-copy"></i></button>
            <button data-removeevento="${i}" title="Remover" class="evt-btn evt-btn-remover"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;
      }).join("");
    }
    el.querySelectorAll("[data-toggleregra]").forEach(cb => {
      cb.addEventListener("change", () => {
        eventosEditando[Number(cb.dataset.toggleregra)].ativo = cb.checked;
        renderListaEventos();
      });
    });
    el.querySelectorAll("[data-editarregra]").forEach(btn => {
      btn.addEventListener("click", () => abrirModalEditarRegra(Number(btn.dataset.editarregra)));
    });
    el.querySelectorAll("[data-duplicarregra]").forEach(btn => {
      btn.addEventListener("click", () => {
        const original = eventosEditando[Number(btn.dataset.duplicarregra)];
        const copia = normalizarRegra(Object.assign(structuredClone(original), { id: "evento" + Date.now(), nome: original.nome + " (cópia)" }));
        eventosEditando.push(copia);
        renderListaEventos();
      });
    });
    el.querySelectorAll("[data-removeevento]").forEach(btn => {
      btn.addEventListener("click", () => {
        eventosEditando.splice(Number(btn.dataset.removeevento), 1);
        renderListaEventos();
      });
    });
  }
  renderListaEventos();
  document.getElementById("addEvento").addEventListener("click", () => {
    const nova = normalizarRegra({ acaoId: acoesEditando[0] ? acoesEditando[0].id : "" });
    eventosEditando.push(nova);
    renderListaEventos();
    abrirModalEditarRegra(eventosEditando.length - 1);
  });

  document.getElementById("filaMaximoItens").addEventListener("input", e => { filaConfigEditando.maximoItens = Number(e.target.value) || 1; });
  document.getElementById("filaAgruparIguais").addEventListener("change", e => { filaConfigEditando.agruparIguais = e.target.checked; });
  document.getElementById("filaIgnorarDuplicados").addEventListener("change", e => { filaConfigEditando.ignorarDuplicados = e.target.checked; });

  document.getElementById("salvarEventos").addEventListener("click", () => {
    const atual = carregarConfig();
    atual.automacoes = { acoes: acoesEditando, eventos: eventosEditando, variaveis: variaveisEditando, filaConfig: filaConfigEditando };
    salvarConfig(atual);
    renderPrevias();
    const msg = document.getElementById("salvoEventosMsg");
    msg.style.display = "inline";
    setTimeout(() => (msg.style.display = "none"), 4000);
  });

  // ------------------------------------------------------------
  // Modal de edição completa de uma regra: geral, condições (grupos
  // E/OU sobre campo+operador+valor), efeitos em variáveis, e um
  // testador manual (digita valores de exemplo e vê se bateria).
  // ------------------------------------------------------------
  function fecharModalRegra() {
    const el = document.getElementById("modalEditarRegra");
    if (el) el.remove();
  }

  function abrirModalEditarRegra(index) {
    fecharModalRegra();
    const original = eventosEditando[index];
    if (!original) return;
    const regraState = structuredClone(original); // só grava em eventosEditando ao clicar Salvar

    const backdrop = document.createElement("div");
    backdrop.id = "modalEditarRegra";
    backdrop.className = "topbar-modal-backdrop";
    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:620px;max-height:88vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="font-size:16px;font-weight:700;">Editar regra — ${regraState.nome}</div>
          <button id="rgFechar" style="background:transparent;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;line-height:1;">×</button>
        </div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Geral</div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoTexto("rgNome", "Nome da regra", regraState.nome)}
          <div><label style="${rotuloAE}">Ativa</label><div style="padding-top:9px;">${toggleHtml("rgAtivo", "Regra ativa", regraState.ativo !== false)}</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          ${campoSelectAE("rgGatilho", "Gatilho", GATILHOS.map(g => ({ id: g.id, nome: g.label })), regraState.gatilho)}
          ${campoSelectAE("rgAcaoId", "Ação disparada", acoesEditando.map(a => ({ id: a.id, nome: a.nome })), regraState.acaoId)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          ${campoNumero("rgPrioridade", "Prioridade (1-10, maior dispara antes)", regraState.prioridade)}
          ${campoNumero("rgCooldown", "Cooldown da regra (segundos)", Math.round((regraState.cooldownMs || 0) / 1000))}
        </div>
        ${!acoesEditando.length ? `<p style="font-size:11.5px;color:#e0a63c;margin:-8px 0 16px;">Nenhuma ação criada ainda — crie uma no card "Ações" antes de escolher aqui.</p>` : ""}

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Condições</div>
        <div id="rgCondicoesContainer"></div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Efeitos em variáveis</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Quando a regra disparar, além de mostrar a ação, ela pode alterar uma variável global (contador, etc.).</p>
        <div id="rgEfeitosContainer"></div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Ações executáveis (sequência)</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Depois de mostrar a ação, rode passos extras em ordem — esperar, tocar/parar som, confete, fogos, ou disparar outra regra. "Trocar cena no OBS" e "executar EXE/script" não dá pra fazer num navegador, por segurança.</p>
        <div id="rgPassosContainer"></div>

        <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-top:14px;border-top:1px solid var(--border);">Testar</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Preencha valores de exemplo e veja se a regra bateria com eles.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
          <div><label style="${rotuloAE}">Nickname de teste</label><input id="rgTesteNickname" type="text" value="espectador_teste" style="${estiloCampoAE}"/></div>
          <div><label style="${rotuloAE}">Mensagem de teste</label><input id="rgTesteComentario" type="text" value="" style="${estiloCampoAE}"/></div>
          <div><label style="${rotuloAE}">Valor de teste (likes/diamantes)</label><input id="rgTesteValor" type="number" value="0" style="${estiloCampoAE}"/></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <button id="rgVerificar" style="background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:8px 14px;font-size:12.5px;cursor:pointer;">Verificar</button>
          <span id="rgResultadoTeste" style="font-size:12.5px;font-weight:600;"></span>
        </div>
        <div id="rgPreviaBox" style="max-width:380px;"></div>

        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);align-items:center;">
          <button id="rgCancelar" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Cancelar</button>
          <button id="rgSalvar" class="btn-cta" style="flex:2;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Salvar regra</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) fecharModalRegra(); });
    document.getElementById("rgFechar").addEventListener("click", fecharModalRegra);
    document.getElementById("rgCancelar").addEventListener("click", fecharModalRegra);

    document.getElementById("rgNome").addEventListener("input", () => { regraState.nome = document.getElementById("rgNome").value; });
    document.getElementById("rgAtivo").addEventListener("change", () => { regraState.ativo = document.getElementById("rgAtivo").checked; });
    document.getElementById("rgAcaoId").addEventListener("change", () => { regraState.acaoId = document.getElementById("rgAcaoId").value; });
    document.getElementById("rgPrioridade").addEventListener("input", () => { regraState.prioridade = Number(document.getElementById("rgPrioridade").value) || 5; });
    document.getElementById("rgCooldown").addEventListener("input", () => { regraState.cooldownMs = Math.round((Number(document.getElementById("rgCooldown").value) || 0) * 1000); });
    document.getElementById("rgGatilho").addEventListener("change", () => {
      regraState.gatilho = document.getElementById("rgGatilho").value;
      renderCondicoesUI();
    });

    function garantirOperadorValido(cond, tipo) {
      const validos = OPERADORES_POR_TIPO[tipo].map(o => o.id);
      if (!validos.includes(cond.operador)) cond.operador = validos[0];
    }

    // Condição única por regra: campo vazio = sem condição (dispara
    // sempre). O checkbox só troca entre "sem condição" e "com uma
    // condição" — bem mais simples que grupos com E/OU aninhados, que
    // na prática quase ninguém precisava.
    function renderCondicoesUI() {
      const container = document.getElementById("rgCondicoesContainer");
      const opcoesCampo = camposDisponiveisParaGatilho(regraState.gatilho).concat(variaveisEditando.map(v => ({ id: "variavel:" + v.id, nome: "Variável: " + v.nome })));
      const cfgFake = { automacoes: { variaveis: variaveisEditando } };
      const c = regraState.condicao;
      if (c.campo && !opcoesCampo.find(o => o.id === c.campo)) c.campo = "";
      if (c.campo) garantirOperadorValido(c, tipoDoCampo(c.campo, cfgFake));
      const temCondicao = !!c.campo;

      container.innerHTML = `
        <label style="font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:6px;margin-bottom:${temCondicao ? "10px" : "2px"};">
          <input type="checkbox" id="rgTemCondicao" ${temCondicao ? "checked" : ""}/> Só disparar se uma condição bater
        </label>
        ${temCondicao ? `
          <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:6px;">
            <select id="rgCondCampo" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;">
              ${opcoesCampo.map(o => `<option value="${o.id}" ${o.id === c.campo ? "selected" : ""}>${o.nome}</option>`).join("")}
            </select>
            <select id="rgCondOperador" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;">
              ${OPERADORES_POR_TIPO[tipoDoCampo(c.campo, cfgFake)].map(o => `<option value="${o.id}" ${o.id === c.operador ? "selected" : ""}>${o.nome}</option>`).join("")}
            </select>
            <input id="rgCondValor" type="text" value="${c.valor ?? ""}" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/>
          </div>
        ` : `<p style="font-size:11px;color:var(--text-faint);margin:0;">Sem condição, a regra dispara sempre que o gatilho acontecer.</p>`}
      `;

      document.getElementById("rgTemCondicao").addEventListener("change", e => {
        regraState.condicao = e.target.checked
          ? { campo: opcoesCampo[0] ? opcoesCampo[0].id : "", operador: "", valor: "" }
          : { campo: "", operador: "", valor: "" };
        renderCondicoesUI();
      });
      const selCampo = document.getElementById("rgCondCampo");
      if (selCampo) selCampo.addEventListener("change", () => { regraState.condicao.campo = selCampo.value; renderCondicoesUI(); });
      const selOperador = document.getElementById("rgCondOperador");
      if (selOperador) selOperador.addEventListener("change", () => { regraState.condicao.operador = selOperador.value; });
      const inpValor = document.getElementById("rgCondValor");
      if (inpValor) inpValor.addEventListener("input", () => { regraState.condicao.valor = inpValor.value; });
    }
    renderCondicoesUI();

    function renderEfeitosUI() {
      const container = document.getElementById("rgEfeitosContainer");
      if (!variaveisEditando.length) {
        container.innerHTML = `<p style="font-size:11.5px;color:var(--text-faint);margin:0;">Crie uma variável global (no card "Variáveis globais", acima da lista de regras) pra poder usá-la aqui.</p>`;
        return;
      }
      container.innerHTML = regraState.efeitos.map((ef, i) => {
        const v = variaveisEditando.find(vv => vv.id === ef.variavelId) || variaveisEditando[0];
        const operacoes = v.tipo === "numero"
          ? [{ id: "incrementar", nome: "Incrementar" }, { id: "decrementar", nome: "Decrementar" }, { id: "definir", nome: "Definir valor" }, { id: "somarValorEvento", nome: "Somar o valor do evento" }]
          : [{ id: "definir", nome: "Definir valor" }];
        return `
        <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:6px;margin-bottom:6px;align-items:center;">
          <select data-ef="${i}" data-efcampo="variavelId" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px;font-size:11.5px;">
            ${variaveisEditando.map(vv => `<option value="${vv.id}" ${vv.id === ef.variavelId ? "selected" : ""}>${vv.nome}</option>`).join("")}
          </select>
          <select data-ef="${i}" data-efcampo="operacao" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px;font-size:11.5px;">
            ${operacoes.map(o => `<option value="${o.id}" ${o.id === ef.operacao ? "selected" : ""}>${o.nome}</option>`).join("")}
          </select>
          <input data-ef="${i}" data-efcampo="valor" type="text" value="${ef.valor ?? ""}" placeholder="${ef.operacao === "somarValorEvento" ? "usa o valor do evento" : "valor"}" ${ef.operacao === "somarValorEvento" ? "disabled" : ""} style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px;font-size:11.5px;"/>
          <button data-removeref="${i}" style="background:transparent;color:#e8794f;border:none;font-size:14px;cursor:pointer;line-height:1;">×</button>
        </div>`;
      }).join("") + `<button id="rgAddEfeito" style="margin-top:2px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:5px 10px;font-size:11px;cursor:pointer;">+ efeito</button>`;

      container.querySelectorAll('[data-efcampo="variavelId"]').forEach(sel => {
        sel.addEventListener("change", () => { regraState.efeitos[Number(sel.dataset.ef)].variavelId = sel.value; renderEfeitosUI(); });
      });
      container.querySelectorAll('[data-efcampo="operacao"]').forEach(sel => {
        sel.addEventListener("change", () => { regraState.efeitos[Number(sel.dataset.ef)].operacao = sel.value; renderEfeitosUI(); });
      });
      container.querySelectorAll('[data-efcampo="valor"]').forEach(inp => {
        inp.addEventListener("input", () => { regraState.efeitos[Number(inp.dataset.ef)].valor = inp.value; });
      });
      container.querySelectorAll("[data-removeref]").forEach(btn => {
        btn.addEventListener("click", () => { regraState.efeitos.splice(Number(btn.dataset.removeref), 1); renderEfeitosUI(); });
      });
      const btnAdd = document.getElementById("rgAddEfeito");
      if (btnAdd) btnAdd.addEventListener("click", () => {
        regraState.efeitos.push({ variavelId: variaveisEditando[0].id, operacao: "incrementar", valor: "1" });
        renderEfeitosUI();
      });
    }
    renderEfeitosUI();

    // ------------------------------------------------------------
    // Ações executáveis em sequência (Fase 4): cada passo roda um por
    // vez, na ordem da lista, depois que a ação principal já disparou.
    // ------------------------------------------------------------
    const TIPOS_PASSO = [
      { id: "esperar", nome: "Esperar (segundos)" },
      { id: "tocarSom", nome: "Tocar som" },
      { id: "pararSom", nome: "Parar som" },
      { id: "confete", nome: "Mostrar confete" },
      { id: "fogos", nome: "Mostrar fogos" },
      { id: "variavel", nome: "Atualizar variável" },
      { id: "executarRegra", nome: "Executar outra regra" },
    ];
    const estiloMini = "background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px 8px;font-size:11.5px;";

    function renderPassosUI() {
      const container = document.getElementById("rgPassosContainer");
      const linhas = regraState.passos.map((p, i) => {
        let camposExtras = "";
        if (p.tipo === "esperar") {
          camposExtras = `<input data-passo="${i}" data-passocampo="segundos" type="number" min="0" step="0.5" value="${p.segundos}" style="${estiloMini}width:70px;"/><span style="font-size:11px;color:var(--text-faint);">segundos</span>`;
        } else if (p.tipo === "tocarSom") {
          camposExtras = `
            <select data-passo="${i}" data-passocampo="som" style="${estiloMini}">
              ${Object.entries(SONS_DISPONIVEIS).map(([k, s]) => `<option value="${k}" ${p.som === k ? "selected" : ""}>${s.nome}</option>`).join("")}
            </select>
            ${p.som === "personalizado" ? `<input data-passo="${i}" data-passocampo="url" type="text" placeholder="URL do áudio" value="${p.url || ""}" style="${estiloMini}flex:1;min-width:120px;"/><input data-passoarquivo="${i}" type="file" accept="audio/*" style="font-size:11px;max-width:140px;"/>` : ""}
          `;
        } else if (p.tipo === "confete" || p.tipo === "fogos") {
          camposExtras = `<span style="font-size:11px;color:var(--text-faint);">cor</span><input data-passo="${i}" data-passocampo="cor" type="color" value="${p.cor || "#F0A63C"}" style="width:40px;height:30px;border:1px solid var(--border);border-radius:6px;background:var(--surface);cursor:pointer;padding:2px;"/>`;
        } else if (p.tipo === "variavel") {
          if (!variaveisEditando.length) {
            camposExtras = `<span style="font-size:11px;color:var(--text-faint);">crie uma variável global primeiro</span>`;
          } else {
            const v = variaveisEditando.find(vv => vv.id === p.variavelId) || variaveisEditando[0];
            const operacoes = v.tipo === "numero"
              ? [{ id: "incrementar", nome: "Incrementar" }, { id: "decrementar", nome: "Decrementar" }, { id: "definir", nome: "Definir" }, { id: "somarValorEvento", nome: "Somar valor do evento" }]
              : [{ id: "definir", nome: "Definir" }];
            camposExtras = `
              <select data-passo="${i}" data-passocampo="variavelId" style="${estiloMini}">
                ${variaveisEditando.map(vv => `<option value="${vv.id}" ${vv.id === p.variavelId ? "selected" : ""}>${vv.nome}</option>`).join("")}
              </select>
              <select data-passo="${i}" data-passocampo="operacao" style="${estiloMini}">
                ${operacoes.map(o => `<option value="${o.id}" ${o.id === p.operacao ? "selected" : ""}>${o.nome}</option>`).join("")}
              </select>
              ${p.operacao !== "somarValorEvento" ? `<input data-passo="${i}" data-passocampo="valor" type="text" value="${p.valor ?? ""}" style="${estiloMini}width:70px;"/>` : ""}
            `;
          }
        } else if (p.tipo === "executarRegra") {
          const outras = eventosEditando.filter((r, ri) => ri !== index);
          camposExtras = outras.length
            ? `<select data-passo="${i}" data-passocampo="regraId" style="${estiloMini}">
                 <option value="">Escolha...</option>
                 ${outras.map(r => `<option value="${r.id}" ${r.id === p.regraId ? "selected" : ""}>${r.nome}</option>`).join("")}
               </select>`
            : `<span style="font-size:11px;color:var(--text-faint);">crie outra regra primeiro</span>`;
        }
        return `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;padding:6px 8px;">
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);width:16px;flex-shrink:0;">${i + 1}.</span>
          <select data-passo="${i}" data-passocampo="tipo" style="${estiloMini}">
            ${TIPOS_PASSO.map(tp => `<option value="${tp.id}" ${tp.id === p.tipo ? "selected" : ""}>${tp.nome}</option>`).join("")}
          </select>
          ${camposExtras}
          <button data-removerpasso="${i}" style="margin-left:auto;background:transparent;color:#e8794f;border:none;font-size:14px;cursor:pointer;line-height:1;">×</button>
        </div>`;
      }).join("");
      container.innerHTML =
        (regraState.passos.length ? linhas : `<p style="font-size:11.5px;color:var(--text-faint);margin:0 0 8px;">Nenhum passo extra — a regra só mostra a ação (e os efeitos em variável, se tiver).</p>`) +
        `<button id="rgAddPasso" style="margin-top:2px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:5px 10px;font-size:11px;cursor:pointer;">+ passo</button>`;

      container.querySelectorAll('[data-passocampo="tipo"]').forEach(sel => {
        sel.addEventListener("change", () => {
          regraState.passos[Number(sel.dataset.passo)].tipo = sel.value;
          renderPassosUI();
        });
      });
      container.querySelectorAll('[data-passocampo]:not([data-passocampo="tipo"])').forEach(el => {
        const evento = el.tagName === "SELECT" || el.type === "color" ? "change" : "input";
        el.addEventListener(evento, () => {
          const i = Number(el.dataset.passo);
          const campo = el.dataset.passocampo;
          regraState.passos[i][campo] = el.value;
          if (campo === "som" || campo === "operacao") renderPassosUI(); // pode revelar/esconder campo extra
        });
      });
      container.querySelectorAll("[data-removerpasso]").forEach(btn => {
        btn.addEventListener("click", () => { regraState.passos.splice(Number(btn.dataset.removerpasso), 1); renderPassosUI(); });
      });
      container.querySelectorAll("[data-passoarquivo]").forEach(inputArquivo => {
        inputArquivo.addEventListener("change", async () => {
          const arquivo = inputArquivo.files && inputArquivo.files[0];
          if (!arquivo) return;
          try {
            const dataUrl = await lerArquivoAudioComoDataUrl(arquivo);
            regraState.passos[Number(inputArquivo.dataset.passoarquivo)].url = dataUrl;
            renderPassosUI();
          } catch (e) {
            console.warn("[som] falha ao carregar arquivo:", e);
            alert("Não consegui carregar esse arquivo de áudio. Tente outro arquivo.");
          }
        });
      });
      document.getElementById("rgAddPasso").addEventListener("click", () => {
        regraState.passos.push({ tipo: "esperar", segundos: 2, som: "ding", url: "", volume: null, cor: "#F0A63C", variavelId: variaveisEditando[0] ? variaveisEditando[0].id : "", operacao: "incrementar", valor: "1", regraId: "" });
        renderPassosUI();
      });
    }
    renderPassosUI();

    let ultimoResultadoTeste = null;
    document.getElementById("rgVerificar").addEventListener("click", () => {
      const nickname = document.getElementById("rgTesteNickname").value || "espectador_teste";
      const comentario = document.getElementById("rgTesteComentario").value || "";
      const valorTeste = Number(document.getElementById("rgTesteValor").value) || 0;
      const ctxTeste = { gatilho: regraState.gatilho, payload: { event: "", data: { comment: comentario } }, data: { comment: comentario }, nickname, valor: valorTeste, cfg: { automacoes: { variaveis: variaveisEditando } } };
      const bateu = avaliarRegra(regraState, ctxTeste);
      const badge = document.getElementById("rgResultadoTeste");
      badge.textContent = bateu ? "✅ Bateu — a ação dispararia" : "❌ Não bateu com esses valores";
      badge.style.color = bateu ? "var(--accent)" : "#e8794f";
      ultimoResultadoTeste = { bateu, ctxTeste };
      const box = document.getElementById("rgPreviaBox");
      box.innerHTML = "";
      if (bateu) {
        const acaoLigada = acoesEditando.find(a => a.id === regraState.acaoId);
        if (acaoLigada) {
          const tema = temaEfetivo(carregarConfig(), "eventos");
          const textoResolvido = textoComPlaceholders(acaoLigada.texto, nickname, valorTeste, { automacoes: { variaveis: variaveisEditando } });
          criarFilaDeAcoes(box, carregarConfig().sons.volume).mostrar(acaoLigada, tema, textoResolvido, true);
        }
      }
    });

    document.getElementById("rgSalvar").addEventListener("click", () => {
      eventosEditando[index] = normalizarRegra(regraState);
      renderListaEventos();
      fecharModalRegra();
    });
  }

  // ============================================================
  // SEÇÃO: Simulador (Fase 3) — monta UM evento com valores que você
  // escolhe (nickname, gift, coins, likes, comentário) e manda pros
  // overlays de teste abaixo, sem precisar de live nem de TikFinity
  // rodando. Os overlays de teste rodam o código real (pontos, tiers,
  // ranking, alerta, combo e as regras de Eventos) — só recebem o
  // evento por postMessage em vez de WebSocket.
  // ============================================================
  const secaoSimulador = criarSecao("simulador");
  secaoSimulador.innerHTML = `<h2 style="font-size:23px;font-weight:700;margin:0 0 6px;letter-spacing:-0.01em;">Simulador</h2><p style="font-size:13px;color:var(--text-dim);margin:0 0 16px;">Monte um evento de teste e veja/ouça a reação de verdade nos overlays abaixo — sem precisar estar ao vivo.</p>`;

  const OVERLAYS_SIMULAVEIS = [
    { id: "metas", nome: "Prêmios da live" },
    { id: "ranking", nome: "Ranking" },
    { id: "alerta", nome: "Alerta de presente" },
    { id: "combo", nome: "Combo" },
    { id: "eventos", nome: "Eventos personalizados" },
  ];
  const PRESETS_GIFT_SIM = [
    { nome: "Rosa", coins: 1 },
    { nome: "Boneco de neve", coins: 99 },
    { nome: "Leão", coins: 500 },
    { nome: "Galáxia", coins: 1000 },
    { nome: "Universo", coins: 5000 },
  ];

  const simForm = document.createElement("div");
  simForm.className = "painel-card";
  simForm.style.cssText = "padding:18px;border-top:3px solid var(--ic-simulador);margin-bottom:18px;";
  secaoSimulador.appendChild(simForm);
  simForm.innerHTML = `
    <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Simular evento</div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 14px;">Preencha só o que quiser testar — cada campo preenchido vira um evento separado (dá pra combinar vários de uma vez, tipo presente + like + comentário juntos).</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
      ${campoTexto("simNickname", "Nickname", "Goguen")}
      <div>${campoTexto("simComentario", "Comentário (dispara mensagem no chat)", "Boraaaa")}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
      <div><label style="${rotuloAE}">Gift (nome do presente)</label><input id="simGift" type="text" value="Galáxia" style="${estiloCampoAE}"/></div>
      ${campoNumero("simCoins", "Coins (valor em diamantes)", 1000)}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
      ${PRESETS_GIFT_SIM.map(g => `<button data-presetgift="${g.nome}" data-presetcoins="${g.coins}" style="background:var(--bg-alt);color:var(--text-dim);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:11px;cursor:pointer;">${g.nome} · ${g.coins}</button>`).join("")}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
      ${campoNumero("simLikes", "Likes", 1200)}
      <div style="display:flex;gap:18px;align-items:center;padding-top:22px;">
        <label style="font-size:12.5px;color:var(--text-dim);display:flex;align-items:center;gap:6px;"><input type="checkbox" id="simSeguidor"/> Simular novo seguidor</label>
        <label style="font-size:12.5px;color:var(--text-dim);display:flex;align-items:center;gap:6px;"><input type="checkbox" id="simCompartilhar"/> Simular compartilhamento</label>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:14px;border-top:1px solid var(--border);">
      <button id="simTestarOverlay" style="background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px 18px;font-size:13.5px;font-weight:600;cursor:pointer;">Testar Overlay</button>
      <button id="simTestarSom" style="background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px 18px;font-size:13.5px;font-weight:600;cursor:pointer;">Testar Som</button>
      <button id="simTestarTudo" class="btn-cta" style="border-radius:8px;padding:11px 22px;font-size:13.5px;cursor:pointer;">Testar Tudo</button>
    </div>
    <p style="font-size:11px;color:var(--text-faint);margin:10px 0 0;"><strong>Testar Overlay</strong> mostra a reação visual sem som. <strong>Testar Som</strong> toca só o áudio (presente, seguidor e as ações de Eventos que baterem), sem abrir card. <strong>Testar Tudo</strong> faz os dois juntos — igual aconteceria ao vivo.</p>
  `;

  simForm.querySelectorAll("[data-presetgift]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("simGift").value = btn.dataset.presetgift;
      document.getElementById("simCoins").value = btn.dataset.presetcoins;
    });
  });

  const simPreviasWrap = document.createElement("div");
  simPreviasWrap.className = "painel-card";
  simPreviasWrap.style.cssText = "padding:18px;border-top:3px solid var(--ic-simulador);";
  secaoSimulador.appendChild(simPreviasWrap);
  simPreviasWrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-size:14px;font-weight:600;">Overlays de teste</div>
      <button id="simRecarregarFrames" style="background:transparent;color:var(--text-dim);border:1px solid var(--border);border-radius:6px;padding:6px 12px;font-size:11.5px;cursor:pointer;"><i class="fa-solid fa-arrows-rotate"></i> Recarregar com a config salva</button>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 14px;">Rodam a config salva mais recente. Se você mudou algo em Eventos/Config e ainda não salvou, clique em recarregar antes de testar.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;">
      ${OVERLAYS_SIMULAVEIS.map(ov => `
        <div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">${ov.nome}</div>
          <div style="position:relative;width:100%;max-width:${PREVIA_BOX_W}px;aspect-ratio:16/9;overflow:hidden;border-radius:8px;background:repeating-conic-gradient(var(--bg-alt) 0% 25%, var(--bg) 0% 50%) 0 0/16px 16px;">
            <iframe id="simFrame_${ov.id}" style="position:absolute;top:0;left:0;width:1920px;height:1080px;border:0;background:transparent;transform-origin:top left;pointer-events:none;"></iframe>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  const simFilaBox = document.createElement("div");
  simFilaBox.className = "painel-card";
  simFilaBox.style.cssText = "padding:18px;border-top:3px solid var(--ic-simulador);margin-top:18px;";
  secaoSimulador.appendChild(simFilaBox);
  simFilaBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-size:14px;font-weight:600;">Fila de eventos (ao vivo)</div>
      <button id="simCancelarFila" style="background:transparent;color:var(--text-dim);border:1px solid var(--border);border-radius:6px;padding:6px 12px;font-size:11.5px;cursor:pointer;">Cancelar fila</button>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;">Mostra em tempo real o que está passando (ou esperando) na fila do overlay "Eventos personalizados" — dispare "Testar Tudo" algumas vezes seguidas pra ver a fila em ação.</p>
    <div id="simFilaLista" style="display:flex;flex-direction:column;gap:6px;"></div>
  `;

  function renderFilaSimulador(itens) {
    const el = document.getElementById("simFilaLista");
    if (!el) return;
    if (!itens || !itens.length) {
      el.innerHTML = `<p style="font-size:12px;color:var(--text-faint);margin:0;">Fila vazia.</p>`;
      return;
    }
    el.innerHTML = itens.map(item => `
      <div style="display:flex;align-items:center;gap:8px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:12px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${item.cor || "#F0A63C"};flex-shrink:0;"></span>
        <span style="flex:1;">${item.nome}${item.quantidade > 1 ? ` ×${item.quantidade}` : ""}</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:${item.status === "mostrando" ? "var(--accent)" : "var(--text-faint)"};text-transform:uppercase;letter-spacing:0.04em;">${item.status === "mostrando" ? "mostrando" : "aguardando"}</span>
      </div>
    `).join("");
  }
  renderFilaSimulador([]);

  window.addEventListener("message", e => {
    if (e.data && e.data.tipo === "filaEventosPainel") renderFilaSimulador(e.data.itens);
  });

  document.getElementById("simCancelarFila").addEventListener("click", () => {
    const frame = document.getElementById("simFrame_eventos");
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ tipo: "cancelarFilaPainel" }, "*");
  });

  function carregarIframesSimulador() {
    const cfgFresco = carregarConfig();
    const cfgCodificado = codificarConfigParaLink(cfgFresco);
    OVERLAYS_SIMULAVEIS.forEach(ov => {
      const frame = document.getElementById("simFrame_" + ov.id);
      if (!frame) return;
      // sem sim=1 (não gera eventos aleatórios sozinho — só reage ao que o
      // Simulador mandar) e sem mudo=1 (toca som quando "Testar Som/Tudo" pedir).
      frame.src = location.pathname + "?view=" + ov.id + "&preview=1&cfg=" + cfgCodificado;
      const t = calcularTransformPrevia(ov.id, cfgFresco);
      frame.style.transform = `scale(${t.escala}) translate(${t.tx}px, ${t.ty}px)`;
    });
  }
  carregarIframesSimulador();
  document.getElementById("simRecarregarFrames").addEventListener("click", carregarIframesSimulador);

  // monta um evento por campo preenchido, no mesmo formato que o
  // TikFinity/simulador aleatório mandam (payload.event + payload.data)
  function montarEventosSimulados() {
    const nickname = (document.getElementById("simNickname").value || "espectador_teste").trim();
    const userId = "sim_" + nickname;
    const gift = document.getElementById("simGift").value.trim();
    const coins = Number(document.getElementById("simCoins").value) || 0;
    const likes = Number(document.getElementById("simLikes").value) || 0;
    const comentario = document.getElementById("simComentario").value.trim();
    const seguidor = document.getElementById("simSeguidor").checked;
    const compartilhar = document.getElementById("simCompartilhar").checked;

    const eventos = [];
    if (gift && coins > 0) {
      eventos.push({ event: "gift", data: { userId, nickname, diamondCount: coins, giftDetails: { giftName: gift, giftType: 0 }, repeatCount: 1, repeatEnd: true } });
    }
    if (likes > 0) {
      eventos.push({ event: "like", data: { userId, nickname, likeCount: likes } });
    }
    if (comentario) {
      eventos.push({ event: "chat", data: { userId, nickname, comment: comentario } });
    }
    if (seguidor) {
      eventos.push({ event: "follow", data: { userId, nickname, followRole: 1 } });
    }
    if (compartilhar) {
      eventos.push({ event: "share", data: { userId, nickname } });
    }
    return eventos;
  }

  function enviarEventosParaOverlays(eventos, silencioso) {
    eventos.forEach(payload => {
      OVERLAYS_SIMULAVEIS.forEach(ov => {
        const frame = document.getElementById("simFrame_" + ov.id);
        if (!frame || !frame.contentWindow) return;
        frame.contentWindow.postMessage({ tipo: "eventoSimuladoPainel", payload, silencioso }, "*");
      });
    });
  }

  // "Testar Som" não passa pelos iframes — toca direto no painel. Cobre
  // presente/seguidor (sempre tocam) e as ações de Eventos que baterem
  // com as regras salvas. Prêmio (tier) e combo dependem de pontos já
  // acumulados, então esses dois só tocam de verdade via Testar Overlay/Tudo.
  function testarSomDosEventos(eventos) {
    const cfgAtual = carregarConfig();
    eventos.forEach(payload => {
      if (payload.event === "gift") tocarSomConfig(cfgAtual.sons.presente, cfgAtual.sons.volume);
      if (payload.event === "follow") tocarSomConfig(cfgAtual.sons.seguidor, cfgAtual.sons.volume);
      const gatilho = tipoGatilhoDoEvento(payload.event);
      if (!gatilho) return;
      const data = payload.data || {};
      const nickname = data.nickname || "espectador_teste";
      const valor = extrairValorEvento(gatilho, payload);
      const ctx = { gatilho, payload, data, nickname, valor, cfg: cfgAtual };
      (cfgAtual.automacoes.eventos || []).forEach(regra => {
        if (regra.ativo === false) return;
        if (!avaliarRegra(regra, ctx)) return;
        const acao = (cfgAtual.automacoes.acoes || []).find(a => a.id === regra.acaoId);
        if (acao) tocarSomAcao(acao.som, cfgAtual.sons.volume, acao.duracaoMs);
      });
    });
  }

  function avisarSemEvento() {
    alert("Preencha pelo menos um campo (gift+coins, likes, comentário, seguidor ou compartilhar) pra simular alguma coisa.");
  }
  document.getElementById("simTestarOverlay").addEventListener("click", () => {
    const eventos = montarEventosSimulados();
    if (!eventos.length) return avisarSemEvento();
    enviarEventosParaOverlays(eventos, true);
  });
  document.getElementById("simTestarSom").addEventListener("click", () => {
    const eventos = montarEventosSimulados();
    if (!eventos.length) return avisarSemEvento();
    testarSomDosEventos(eventos);
  });
  document.getElementById("simTestarTudo").addEventListener("click", () => {
    const eventos = montarEventosSimulados();
    if (!eventos.length) return avisarSemEvento();
    enviarEventosParaOverlays(eventos, false);
  });

  // ============================================================
  // SEÇÃO: Aparência
  // ============================================================
  const secaoAparencia = criarSecao("aparencia");
  secaoAparencia.innerHTML = `<h2 style="font-size:23px;font-weight:700;margin:0 0 6px;letter-spacing:-0.01em;">Aparência</h2><p style="font-size:13px;color:var(--text-dim);margin:0 0 16px;">Cores, fonte, arredondamento e animações dos overlays — vale pra todos de uma vez. Salva sozinho a cada mudança, sem precisar de botão.</p>`;

  const temaBox = document.createElement("div");
  temaBox.className = "painel-card";
  temaBox.style.cssText = "padding:18px;border-top:3px solid var(--ic-aparencia);";
  secaoAparencia.appendChild(temaBox);

  temaBox.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
      ${Object.entries(PRESETS_TEMA).map(([nome, p]) => `<button data-preset="${nome}" style="background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px 13px 7px 9px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;"><span style="width:10px;height:10px;border-radius:50%;background:${p.corPrimaria};display:inline-block;"></span>${nome}</button>`).join("")}
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;">
      ${campoCor("corPrimaria", "Destaque", cfg.tema.corPrimaria)}
      ${campoCor("corFundo", "Fundo", cfg.tema.corFundo)}
      ${campoCor("corCard", "Card", cfg.tema.corCard)}
      ${campoCor("corBorda", "Borda", cfg.tema.corBorda)}
      ${campoCor("corTexto", "Texto", cfg.tema.corTexto)}
      ${campoCor("corTextoSec", "Texto sec.", cfg.tema.corTextoSec)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
      <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Fonte</label>
        <select id="fonte" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;">
          ${Object.entries(FONTES).map(([k, f]) => `<option value="${k}" ${cfg.tema.fonte === k ? "selected" : ""}>${f.nome}</option>`).join("")}
        </select></div>
      <div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Arredondamento (px)</label>
        <input id="raio" type="number" value="${cfg.tema.raio}" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/></div>
    </div>
    <div style="margin-top:16px;">
      <label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">Estilo de animação dos cards</label>
      <select id="animacaoEstilo" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;">
        <option value="slide" ${cfg.tema.animacaoEstilo === "slide" ? "selected" : ""}>Slide (desliza de cima)</option>
        <option value="fade" ${cfg.tema.animacaoEstilo === "fade" ? "selected" : ""}>Fade (aparece suave)</option>
        <option value="zoom" ${cfg.tema.animacaoEstilo === "zoom" ? "selected" : ""}>Zoom (cresce do centro)</option>
        <option value="bounce" ${cfg.tema.animacaoEstilo === "bounce" ? "selected" : ""}>Bounce (quica ao entrar)</option>
      </select>
    </div>
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
      ${toggleHtml("animacoesAtivas", "Animações nos overlays (confete, contagem, combo)", cfg.animacoes)}
    </div>
  `;
  function campoCor(id, label, valor) {
    return `<div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">${label}</label>
      <input id="${id}" type="color" value="${valor}" style="width:100%;height:36px;border:1px solid var(--border);border-radius:6px;background:var(--bg-alt);cursor:pointer;padding:2px;"/></div>`;
  }

  function lerTemaDoForm() {
    return {
      corPrimaria: document.getElementById("corPrimaria").value,
      corFundo: document.getElementById("corFundo").value,
      corCard: document.getElementById("corCard").value,
      corBorda: document.getElementById("corBorda").value,
      corTexto: document.getElementById("corTexto").value,
      corTextoSec: document.getElementById("corTextoSec").value,
      raio: Number(document.getElementById("raio").value),
      fonte: document.getElementById("fonte").value,
      animacaoEstilo: document.getElementById("animacaoEstilo").value,
    };
  }

  // A Aparência não tem botão "Salvar" próprio — cada mudança já grava
  // sozinha (com um pequeno atraso, pra não salvar a cada pixel arrastado
  // no seletor de cor) e atualiza as prévias ao vivo.
  let _timerSalvarAparencia = null;
  function salvarAparenciaAtual() {
    clearTimeout(_timerSalvarAparencia);
    _timerSalvarAparencia = setTimeout(() => {
      const base = carregarConfig();
      const novo = Object.assign({}, base, {
        tema: lerTemaDoForm(),
        animacoes: document.getElementById("animacoesAtivas").checked,
      });
      salvarConfig(novo);
    }, 400);
  }

  temaBox.querySelectorAll("input, select").forEach(el => el.addEventListener("input", () => { renderPrevias(); salvarAparenciaAtual(); }));
  temaBox.querySelectorAll("button[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = PRESETS_TEMA[btn.dataset.preset];
      document.getElementById("corPrimaria").value = p.corPrimaria;
      document.getElementById("corFundo").value = p.corFundo;
      document.getElementById("corCard").value = p.corCard;
      document.getElementById("corBorda").value = p.corBorda;
      document.getElementById("corTexto").value = p.corTexto;
      document.getElementById("corTextoSec").value = p.corTextoSec;
      document.getElementById("raio").value = p.raio;
      document.getElementById("fonte").value = p.fonte;
      renderPrevias();
      salvarAparenciaAtual();
    });
  });
  renderPrevias();

  // ============================================================
  // SEÇÃO: Configurações
  // ============================================================
  const secaoConfig = criarSecao("config");
  secaoConfig.innerHTML = `<h2 style="font-size:23px;font-weight:700;margin:0 0 6px;letter-spacing:-0.01em;">Configurações gerais</h2><p style="font-size:13px;color:var(--text-dim);margin:0 0 16px;">Só o que é global, não específico de um overlay: conexão com a live e zona de risco. Pontos, prêmios, alertas, combo, som e cor de cada overlay ficam no botão "Config" do card dele, na aba Overlays.</p>`;

  const form = document.createElement("div");
  form.className = "painel-card";
  form.style.cssText = "padding:18px;border-top:3px solid var(--ic-config);";
  secaoConfig.appendChild(form);

  const fontesDisponiveis = ["mensagem", "like", "presente", "seguidor", "compartilhamento"];
  // prêmios (tiers) também podem contar pontos adicionados na mão (aba
  // "Pontos manuais" do Config) — combo fica de fora, já que pontos
  // manuais não são um evento da live pra formar sequência.
  const fontesTierDisponiveis = [...fontesDisponiveis, "manual"];

  const SUBPAGINAS_CONFIG = [
    { id: "conexao",    label: "Conexão",           icone: "fa-plug" },
    { id: "manual",     label: "Pontos manuais",    icone: "fa-hand-holding-dollar" },
    { id: "zona",       label: "Zona de risco",     icone: "fa-triangle-exclamation" },
  ];

  form.innerHTML = `
    <div class="config-shell">
      <div class="config-subnav">
        ${SUBPAGINAS_CONFIG.map((s, i) => `
          <button type="button" class="config-subnav-btn${i === 0 ? " ativo" : ""}" data-subnav="${s.id}">
            <i class="fa-solid ${s.icone}" style="width:16px;margin-right:8px;opacity:.8;"></i>${s.label}
          </button>
        `).join("")}
      </div>
      <div class="config-subpage-wrap">
        <div class="config-subpage" data-subpage="conexao">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Conexão com a live</div>
          <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;line-height:1.5;">
            É o app <strong>Central de Overlays — Desktop</strong> que conecta direto na sua live do TikTok (só o @ do perfil, sem senha) e conta curtidas, comentários, presentes e seguidores em tempo real. Ele abre um endereço local (WebSocket) — cole esse endereço aqui embaixo pra os overlays receberem os eventos.<br/>
            Esse campo aceita qualquer fonte compatível: se você preferir usar o TikFinity ou outro programa (ou seu próprio bridge) em vez do app desktop, basta trocar o endereço aqui — contanto que mande os eventos no mesmo formato.
          </p>
          ${campoTexto("wsUrl", "Endereço da conexão (WebSocket)", cfg.tikfinityWsUrl)}
        </div>
        <div class="config-subpage oculto" data-subpage="manual">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Adicionar pontos manualmente</div>
          <p style="font-size:12px;color:var(--text-dim);margin:0 0 12px;line-height:1.5;">
            Pra dar pontos na mão pra alguém, sem precisar de presente/like/etc — soma direto no Ranking. Nos Prêmios (aba "Prêmios da live"), cada prêmio tem um checkbox "manual" pra escolher se ele também conta pontos manuais.<br/>
            Escolha o espectador na lista (é o nome de verdade, sem risco de duplicar) — só use "espectador novo" se a pessoa realmente nunca participou dessa live ainda. Isso funciona mesmo com o overlay já aberto (atualiza sozinho).
          </p>
          <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;">
            <div>
              <label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">espectador</label>
              <select id="manualNickSelect" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;">
                <option value="">Carregando espectadores...</option>
              </select>
            </div>
            <div>
              <label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">pontos (pode ser negativo)</label>
              <input id="manualPontos" type="number" value="100" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/>
            </div>
            <button id="manualAdicionar" class="btn-cta" style="border-radius:6px;padding:9px 16px;font-size:13px;cursor:pointer;">Adicionar</button>
          </div>
          <div id="manualNickNovoWrap" style="display:none;margin-bottom:10px;">
            <label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">nome exato (@) do espectador novo</label>
            <input id="manualNickNovo" type="text" placeholder="cole/digite igualzinho ao nome dela no TikTok" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/>
            <p style="font-size:11px;color:var(--text-faint);margin:5px 0 0;">Só use isso se a pessoa NUNCA participou dessa live ainda (nenhum like/comentário/etc). Se ela já apareceu, escolha o nome dela na lista acima — evita criar um espectador duplicado.</p>
          </div>
          <p id="manualMsg" style="font-size:12px;color:var(--accent);margin:0 0 14px;display:none;font-family:var(--font-mono);"></p>
          <div id="manualListaRecentes" style="font-size:12px;color:var(--text-dim);margin-bottom:16px;"></div>
          <div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:16px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Histórico diário</div>
            <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 10px;">Quanto o espectador escolhido acima ganhou em cada dia deste mês — soma TODAS as fontes (mensagem, like, presente, seguidor, compartilhar e manual), não só os pontos manuais. Zera junto com o resto na virada do mês.</p>
            <div id="manualHistoricoDiario" style="font-size:12px;color:var(--text-faint);">Escolha um espectador acima pra ver o histórico dele.</div>
          </div>
          <div id="manualDuplicadosWrap" style="display:none;border-top:1px solid var(--border);padding-top:14px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:#e0637a;">Espectadores duplicados encontrados</div>
            <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 10px;">Aconteceu de um nome digitado não bater 100% com o nickname real (emoji, espaço, etc.) e criar um registro separado. Clique em "Mesclar" pra juntar os pontos no espectador de verdade e apagar o duplicado.</p>
            <div id="manualListaDuplicados"></div>
          </div>
        </div>
        <div class="config-subpage oculto" data-subpage="zona">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Zona de risco</div>
          <p style="font-size:12px;color:var(--text-dim);margin:0 0 10px;">Todos os pontos (mensagem/like/presente/seguidor/compartilhamento) acumulam o mês inteiro sozinhos, sem precisar de nada aqui — só zeram na virada do mês. Se quiser começar do zero antes disso (nova temporada, por exemplo), use o botão abaixo. Isso apaga TUDO, sem volta.</p>
          <button id="resetarEspectadores" style="background:transparent;color:#e0637a;border:1px solid #e0637a55;border-radius:6px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;">Zerar pontos de todos os espectadores</button>
        </div>
      </div>
    </div>
    <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--border);">
      <button id="salvar" class="btn-cta" style="border-radius:8px;padding:11px 22px;font-size:14px;cursor:pointer;">Salvar configurações</button>
      <span id="salvoMsg" style="margin-left:12px;font-size:13px;color:var(--accent);display:none;font-family:var(--font-mono);">salvo ✓ — atualiza sozinho nos overlays já abertos</span>
    </div>
  `;

  form.querySelectorAll(".config-subnav-btn").forEach(btn => {
    btn.addEventListener("click", () => ativarConfigSubpage(btn.dataset.subnav));
  });
  ativarConfigSubpage = function (id) {
    form.querySelectorAll(".config-subnav-btn").forEach(b => b.classList.toggle("ativo", b.dataset.subnav === id));
    form.querySelectorAll(".config-subpage").forEach(p => p.classList.toggle("oculto", p.dataset.subpage !== id));
  };

  // linhaSom/wireSomRow: reaproveitados pelos modais de config de cada
  // overlay (metas/ranking/alerta/combo), cada um mostrando só o som dele.
  function linhaSom(id, label, valor, comACada) {
    const mostrarUrl = valor.som === "personalizado";
    return `<div style="display:flex;flex-direction:column;gap:8px;padding:9px 0;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        ${toggleHtml("som_" + id + "_ativo", label, valor.ativo)}
        <select id="som_${id}_tipo" data-som-select="${id}" style="background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px 8px;font-size:12px;">
          ${Object.entries(SONS_DISPONIVEIS).map(([k, s]) => `<option value="${k}" ${valor.som === k ? "selected" : ""}>${s.nome}</option>`).join("")}
        </select>
        ${comACada ? `<span style="font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:5px;">a cada <input id="som_${id}_aCada" type="number" min="1" value="${valor.aCada}" style="width:48px;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px;font-size:12px;"/></span>` : ""}
        <button data-testar-som="${id}" style="margin-left:auto;background:transparent;color:var(--text-dim);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;">Testar</button>
      </div>
      <div style="display:${mostrarUrl ? "flex" : "none"};flex-direction:column;gap:6px;" data-som-urlwrap="${id}">
        <input id="som_${id}_url" type="text" placeholder="https://... (link direto do arquivo de áudio)" value="${valor.url || ""}" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px 9px;font-size:12px;"/>
        <label style="font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:6px;">ou envie um arquivo do seu computador:
          <input id="som_${id}_arquivo" type="file" accept="audio/*" style="font-size:11px;"/>
        </label>
      </div>
    </div>`;
  }
  function wireSomRow(container, id, volumeInputId) {
    const sel = container.querySelector(`select[data-som-select="${id}"]`);
    if (sel) {
      sel.addEventListener("change", () => {
        const urlWrap = document.querySelector(`[data-som-urlwrap="${id}"]`);
        if (urlWrap) urlWrap.style.display = sel.value === "personalizado" ? "flex" : "none";
      });
    }
    wireUploadDeAudio(document.getElementById(`som_${id}_arquivo`), document.getElementById(`som_${id}_url`));
    const btnTestar = container.querySelector(`[data-testar-som="${id}"]`);
    if (btnTestar) {
      btnTestar.addEventListener("click", () => {
        const tipo = document.getElementById(`som_${id}_tipo`).value;
        const url = document.getElementById(`som_${id}_url`).value;
        const vol = Number((document.getElementById(volumeInputId) || {}).value || 100);
        tocarSomConfig({ ativo: true, som: tipo, url }, vol);
      });
    }
  }

  function renderListaRecentesManual() {
    const lista = document.getElementById("manualListaRecentes");
    if (!lista || !dbRefRanking) return;
    // busca direto na nuvem — o painel não tem os pontos de verdade no
    // localStorage dele (quem escreve é o overlay, noutro navegador).
    dbRefRanking.once("value").then(snap => {
      const ranking = snap.val() || {};
      const top = Object.values(ranking).sort((a, b) => b.pontos - a.pontos).slice(0, 8);
      lista.innerHTML = top.length
        ? `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">espectadores do mês (referência rápida)</div>` +
          top.map(u => `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);">${u.nickname}<span style="color:var(--text-faint);">${u.pontos} pts</span></div>`).join("")
        : `<p style="font-size:11.5px;color:var(--text-faint);margin:0;">Nenhum espectador com pontos ainda.</p>`;
    }).catch(() => {});
  }

  // mostra, pro espectador escolhido no dropdown, quanto ele ganhou em
  // cada dia deste mês (lê direto de dbRefHistorico — ver registrarPontosGanhos
  // em js-06-overlay-metas.js, que é quem escreve isso a cada ponto ganho).
  function renderHistoricoDiarioManual(userId) {
    const el = document.getElementById("manualHistoricoDiario");
    if (!el) return;
    if (!userId || userId === "novo") {
      el.innerHTML = "Escolha um espectador acima pra ver o histórico dele.";
      return;
    }
    if (!dbRefHistorico) { el.innerHTML = "Sincronização com a nuvem indisponível."; return; }
    el.innerHTML = "Carregando...";
    dbRefHistorico.child(userId).once("value").then(snap => {
      const dados = snap.val() || {};
      const dias = Object.entries(dados)
        .filter(([chave]) => /^\d{4}-\d{2}-\d{2}$/.test(chave))
        .map(([data, v]) => ({ data, total: (v && v.total) || 0 }))
        .filter(d => d.total)
        .sort((a, b) => b.data.localeCompare(a.data));
      if (!dias.length) {
        el.innerHTML = "Esse espectador ainda não tem histórico neste mês.";
        return;
      }
      const maior = Math.max(...dias.map(d => d.total));
      el.innerHTML = dias.map(d => {
        const largura = Math.max(6, Math.round((d.total / maior) * 100));
        const [ano, mes, dia] = d.data.split("-");
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:4px 0;">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);width:38px;flex-shrink:0;">${dia}/${mes}</span>
            <div style="flex:1;background:var(--bg-alt);border-radius:4px;overflow:hidden;height:14px;">
              <div style="width:${largura}%;height:100%;background:var(--ic-eventos);border-radius:4px;"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:11.5px;color:var(--text);width:56px;text-align:right;flex-shrink:0;">${d.total} pts</span>
          </div>
        `;
      }).join("");
    }).catch(() => { el.innerHTML = "Não consegui carregar o histórico agora."; });
  }

  // popula o <select> com os espectadores DE VERDADE (vindos da nuvem) —
  // escolher da lista em vez de digitar elimina o risco de criar
  // duplicado por causa de emoji/espaço/maiúscula diferente no nome.
  function carregarOpcoesManual() {
    const select = document.getElementById("manualNickSelect");
    if (!select) return;
    const opcaoNovo = `<option value="novo">+ espectador novo (nunca participou ainda)</option>`;
    if (!dbRefRanking) { select.innerHTML = opcaoNovo; return; }
    dbRefRanking.once("value").then(snap => {
      const ranking = snap.val() || {};
      const itens = Object.entries(ranking)
        .map(([id, u]) => ({ id, nickname: u.nickname || id, pontos: u.pontos || 0 }))
        .sort((a, b) => b.pontos - a.pontos);
      select.innerHTML = `<option value="">Escolha...</option>` +
        itens.map(u => `<option value="${u.id}">${u.nickname} — ${u.pontos} pts</option>`).join("") +
        opcaoNovo;
    }).catch(() => { select.innerHTML = opcaoNovo; });
  }

  // detecta pares "espectador real" + "fantasma" (mesmo nome, criado antes
  // de mudarmos pra lista) e oferece um botão pra mesclar num clique.
  function carregarDuplicadosManual() {
    const wrap = document.getElementById("manualDuplicadosWrap");
    const lista = document.getElementById("manualListaDuplicados");
    if (!wrap || !lista || !dbRefRanking) return;
    dbRefRanking.once("value").then(snap => {
      const ranking = snap.val() || {};
      const porNick = {};
      Object.entries(ranking).forEach(([id, u]) => {
        const chave = normalizarNickParaBusca(u.nickname);
        if (!chave) return;
        if (!porNick[chave]) porNick[chave] = [];
        porNick[chave].push({ id, nickname: u.nickname, pontos: u.pontos || 0 });
      });
      const pares = [];
      Object.values(porNick).forEach(itens => {
        if (itens.length < 2) return;
        const real = itens.find(x => !x.id.startsWith("manual_"));
        const fantasmas = itens.filter(x => x.id.startsWith("manual_"));
        if (real && fantasmas.length) fantasmas.forEach(f => pares.push({ real, fantasma: f }));
      });
      if (!pares.length) { wrap.style.display = "none"; lista.innerHTML = ""; return; }
      wrap.style.display = "block";
      lista.innerHTML = pares.map((p, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:12px;">
          <span>${p.real.nickname} <span style="color:var(--text-faint);">(${p.real.pontos} pts real + ${p.fantasma.pontos} pts duplicado)</span></span>
          <button data-mesclar="${i}" style="background:transparent;color:var(--accent);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:11px;cursor:pointer;">Mesclar</button>
        </div>`).join("");
      lista.querySelectorAll("[data-mesclar]").forEach(btn => {
        btn.addEventListener("click", () => {
          const par = pares[Number(btn.dataset.mesclar)];
          btn.disabled = true;
          btn.textContent = "Mesclando...";
          mesclarDuplicadoManual(par.real.id, par.fantasma.id, par.fantasma.pontos, () => {
            carregarDuplicadosManual();
            renderListaRecentesManual();
            carregarOpcoesManual();
          });
        });
      });
    }).catch(() => {});
  }

  renderListaRecentesManual();
  carregarOpcoesManual();
  carregarDuplicadosManual();

  document.getElementById("manualNickSelect").addEventListener("change", () => {
    const val = document.getElementById("manualNickSelect").value;
    document.getElementById("manualNickNovoWrap").style.display = val === "novo" ? "block" : "none";
    renderHistoricoDiarioManual(val);
  });

  document.getElementById("manualAdicionar").addEventListener("click", () => {
    const select = document.getElementById("manualNickSelect");
    const nickNovoInput = document.getElementById("manualNickNovo");
    const pontosInput = document.getElementById("manualPontos");
    const btnAdicionar = document.getElementById("manualAdicionar");
    const escolha = select.value;
    const pontos = Number(pontosInput.value);
    if (!escolha) { alert("Escolhe um espectador na lista."); return; }
    if (!pontos) { alert("Digita quantos pontos (diferente de zero)."); return; }

    const finalizar = (nomeExibido, userId) => {
      btnAdicionar.disabled = false;
      btnAdicionar.textContent = "Adicionar";
      const msg = document.getElementById("manualMsg");
      msg.textContent = `${pontos > 0 ? "+" : ""}${pontos} pontos pra ${nomeExibido} ✓`;
      msg.style.display = "block";
      setTimeout(() => { msg.style.display = "none"; }, 3500);
      nickNovoInput.value = "";
      document.getElementById("manualNickNovoWrap").style.display = "none";
      renderListaRecentesManual();
      carregarOpcoesManual();
      carregarDuplicadosManual();
      if (userId) renderHistoricoDiarioManual(userId);
    };

    btnAdicionar.disabled = true;
    btnAdicionar.textContent = "Adicionando...";
    if (escolha === "novo") {
      const nick = nickNovoInput.value.trim();
      if (!nick) {
        alert("Digita o nome do espectador novo.");
        btnAdicionar.disabled = false;
        btnAdicionar.textContent = "Adicionar";
        return;
      }
      adicionarPontosManualmente(nick, pontos, (userId) => finalizar(nick, userId));
    } else {
      const nomeExibido = (select.options[select.selectedIndex].textContent || "").split(" — ")[0];
      adicionarPontosPorUserId(escolha, pontos, (userId) => finalizar(nomeExibido, userId));
    }
  });

  document.getElementById("resetarEspectadores").addEventListener("click", () => {
    const ok = confirm("Isso apaga o progresso de TODOS os espectadores (ranking e prêmios) — inclusive nos overlays que já estiverem abertos no OBS. Essa ação não pode ser desfeita. Continuar?");
    if (!ok) return;
    localStorage.removeItem(chaveEspectadores("rankingUsuarios"));
    localStorage.removeItem(chaveEspectadores("premiosPorUsuario"));
    localStorage.removeItem(chaveEspectadores("seguidoresConhecidos"));
    // zera na nuvem também — senão os overlays voltam a puxar os pontos
    // antigos de lá assim que o sync roda de novo.
    if (dbRefPremios) dbRefPremios.remove().catch(() => {});
    if (dbRefRanking) dbRefRanking.remove().catch(() => {});
    if (dbRefHistorico) dbRefHistorico.remove().catch(() => {});
    if (dbRefReset) {
      const agora = Date.now();
      localStorage.setItem(chaveEspectadores("ultimoResetAplicado"), String(agora));
      dbRefReset.set(agora).catch(e => console.warn("[firebase] falha ao propagar reset:", e));
    }
    alert("Pronto — os pontos de todos os espectadores foram zerados, inclusive nos overlays já abertos no OBS.");
  });

  function campoTexto(id, label, valor) {
    return `<div><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">${label}</label>
      <input id="${id}" type="text" value="${valor}" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/></div>`;
  }
  function campoNumero(id, label, valor, estiloExtra) {
    return `<div style="${estiloExtra || ''}"><label style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;">${label}</label>
      <input id="${id}" type="number" value="${valor}" style="width:100%;box-sizing:border-box;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:9px;font-size:13px;"/></div>`;
  }

  let tiersEditando = structuredClone(cfg.tiers);

  // Corrige/normaliza uma lista de faixas de presente que pode ter vindo
  // bagunçada (salva fora de ordem, ou com a última faixa sem o "ate:
  // null" que ela deveria ter) — bug real que achamos: se a lista fica
  // fora de ordem crescente, a faixa errada é escolhida pra presentes de
  // tamanho médio e os pontos saem muito acima (ou abaixo) do esperado.
  // Ordena as faixas com teto numérico e garante que só a ÚLTIMA fica
  // "sem teto" (pega tudo que sobrar acima da maior faixa configurada).
  function normalizarFaixasPresente(faixas) {
    const lista = ((faixas && faixas.length) ? faixas : CONFIG_PADRAO.valores.faixasPresente).map(f => ({
      ate: f.ate == null ? null : Number(f.ate),
      pontos: Number(f.pontos) || 0,
    }));
    const comTeto = lista.filter(f => f.ate != null).sort((a, b) => a.ate - b.ate);
    const semTeto = lista.filter(f => f.ate == null);
    const ultima = semTeto[semTeto.length - 1] || comTeto[comTeto.length - 1] || { ate: null, pontos: 10 };
    const resto = comTeto.filter(f => f !== ultima);
    return [...resto, { ate: null, pontos: ultima.pontos }];
  }

  let faixasPresenteEditando = normalizarFaixasPresente(cfg.valores.faixasPresente);

  // Editor de faixas de presente: usado pelos modais de "metas" e
  // "ranking" (compartilham a mesma pontuação). Cada faixa vale por
  // presente sozinho — um presente de 500 diamantes usa a faixa que
  // contém 500, não soma pedaço por pedaço de faixas diferentes.
  function renderFaixasPresente() {
    const el = document.getElementById("listaFaixasPresente");
    if (!el) return;
    el.innerHTML = faixasPresenteEditando.map((f, i) => {
      const ultima = i === faixasPresenteEditando.length - 1;
      return `
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:6px;">
        <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">até quantos diamantes</label>
          ${ultima
            ? `<input type="text" value="sem teto" disabled style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text-faint);border-radius:6px;padding:7px;font-size:12px;"/>`
            : `<input data-i="${i}" data-campo-faixa="ate" type="number" value="${f.ate}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/>`}
        </div>
        <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">pontos por diamante</label>
          <input data-i="${i}" data-campo-faixa="pontos" type="number" value="${f.pontos}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/></div>
        ${faixasPresenteEditando.length > 1 ? `<button data-remove-faixa="${i}" style="background:transparent;color:#e8794f;border:1px solid var(--border);border-radius:6px;padding:7px 12px;font-size:12px;cursor:pointer;">remover</button>` : `<div></div>`}
      </div>
    `;
    }).join("");

    el.querySelectorAll("input[data-campo-faixa]").forEach(input => {
      input.addEventListener("input", () => {
        const i = Number(input.dataset.i);
        const campo = input.dataset.campoFaixa;
        faixasPresenteEditando[i][campo] = Number(input.value);
      });
    });
    el.querySelectorAll("button[data-remove-faixa]").forEach(btn => {
      btn.addEventListener("click", () => {
        faixasPresenteEditando.splice(Number(btn.dataset.removeFaixa), 1);
        renderFaixasPresente();
      });
    });
  }

  function montarEditorFaixasPresente() {
    renderFaixasPresente();
    const btnAdd = document.getElementById("addFaixaPresente");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => {
        // nova faixa entra antes da última (a última fica sempre "sem teto")
        const penultima = faixasPresenteEditando[faixasPresenteEditando.length - 2];
        const tetoAnterior = penultima ? penultima.ate : 0;
        faixasPresenteEditando.splice(faixasPresenteEditando.length - 1, 0, { ate: tetoAnterior + 50, pontos: 10 });
        renderFaixasPresente();
      });
    }
  }

  function renderListaTiers() {
    const el = document.getElementById("listaTiers");
    el.innerHTML = tiersEditando.map((t, i) => {
      const raridade = raridadeDoTier(i, tiersEditando.length);
      return `
      <div style="background:var(--bg-alt);border:1px solid var(--border);border-left:3px solid ${raridade.cor};border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="font-size:10.5px;font-weight:700;color:${raridade.cor};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${iconeTierHtml(t)} ${raridade.nome}</div>
        <div style="display:grid;grid-template-columns:2fr 1fr auto auto;gap:8px;align-items:end;">
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">prêmio</label>
            <input data-i="${i}" data-campo="nome" type="text" value="${t.nome}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/></div>
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">pontos p/ ganhar</label>
            <input data-i="${i}" data-campo="pontos" type="number" value="${t.pontos}" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;"/></div>
          <div><label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">ícone</label>
            <select data-i="${i}" data-campo="icone" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px;font-size:12px;">
              <option value="">Auto (por nome)</option>
              ${ICONES_TIER_DISPONIVEIS.map(ic => `<option value="${ic.classe}" ${t.icone === ic.classe ? "selected" : ""}>${ic.label}</option>`).join("")}
            </select></div>
          <button data-remove="${i}" style="background:transparent;color:#e8794f;border:1px solid var(--border);border-radius:6px;padding:7px 12px;font-size:12px;cursor:pointer;">remover</button>
        </div>
        <div style="margin-top:10px;">
          <label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);text-transform:uppercase;">soma pontos de:</label>
          <div style="margin-top:6px;display:flex;gap:14px;flex-wrap:wrap;">
            ${fontesTierDisponiveis.map(f => `
              <label style="font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:5px;">
                <input type="checkbox" data-i="${i}" data-fonte="${f}" ${t.fontes.includes(f) ? "checked" : ""}/> ${f}
              </label>
            `).join("")}
          </div>
          <p style="font-size:10.5px;color:var(--text-faint);margin:6px 0 0;">Pode misturar à vontade — inclusive presente com engajamento no mesmo prêmio. Todo ponto acumula o mês inteiro, sem resetar entre lives.</p>
        </div>
      </div>
    `;
    }).join("");

    el.querySelectorAll("input[data-campo], select[data-campo]").forEach(input => {
      input.addEventListener("input", () => {
        const i = Number(input.dataset.i);
        const campo = input.dataset.campo;
        tiersEditando[i][campo] = campo === "pontos" ? Number(input.value) : input.value;
      });
    });
    el.querySelectorAll("input[data-fonte]").forEach(cb => {
      cb.addEventListener("change", () => {
        const i = Number(cb.dataset.i);
        const fonte = cb.dataset.fonte;
        const set = new Set(tiersEditando[i].fontes);
        if (cb.checked) set.add(fonte); else set.delete(fonte);
        tiersEditando[i].fontes = Array.from(set);
      });
    });
    el.querySelectorAll("button[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        tiersEditando.splice(Number(btn.dataset.remove), 1);
        renderListaTiers();
      });
    });
  }

  // Editor de tiers: usado pelos modais de config de "metas" e "vitrine"
  // (compartilham os mesmos prêmios). Só é montado/ligado quando o modal
  // que contém #listaTiers/#addTier é aberto — ver montarEditorTiers().
  function montarEditorTiers() {
    renderListaTiers();
    document.getElementById("addTier").addEventListener("click", () => {
      tiersEditando.push({ id: "tier" + Date.now(), nome: "novo prêmio", pontos: 500, fontes: ["mensagem"], icone: "" });
      renderListaTiers();
    });
  }

  // Salvar da Config geral: só existe wsUrl aqui agora (o resto foi pros
  // modais de cada overlay, cada um com seu próprio botão Salvar).
  document.getElementById("salvar").addEventListener("click", () => {
    const base = carregarConfig();
    const novo = Object.assign({}, base, {
      tikfinityWsUrl: document.getElementById("wsUrl").value,
    });
    salvarConfig(novo);
    renderPrevias();
    const msg = document.getElementById("salvoMsg");
    msg.style.display = "inline";
    setTimeout(() => (msg.style.display = "none"), 4000);
  });

  // ============================================================
  // MODAL DE CONFIG POR OVERLAY — aberto pelo botão "Config" de cada
  // card em Overlays. Mostra só os campos daquele overlay (pontos,
  // prêmios/alerta/combo/ranking, som, modelo visual) + cor rápida,
  // com Testar (abre aba nova com as edições ainda não salvas) e
  // Salvar (grava só os campos deste modal, sem mexer no resto).
  // ============================================================
  function fecharModalOverlay() {
    const el = document.getElementById("modalConfigOverlay");
    if (el) el.remove();
  }

  function campoVolumeModal(cfgAtual) {
    return `
    <div style="margin:10px 0 4px;">
      <label style="font-family:var(--font-mono);font-size:10px;color:var(--text-faint);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.04em;">Volume geral dos sons</label>
      <input id="somVolumeModal" type="range" min="0" max="100" value="${cfgAtual.sons.volume}" style="width:100%;"/>
    </div>`;
  }

  function corpoModalPorOverlay(overlayId, cfgAtual) {
    if (overlayId === "metas") {
      const layoutAtual = (cfgAtual.metas && cfgAtual.metas.layout) || "lateral";
      return `
        <div style="margin-bottom:16px;">
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Modelo do overlay</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${LAYOUTS_METAS_INFO.map(l => `
              <button data-layout-metas="${l.id}" title="${l.desc}" style="background:${l.id === layoutAtual ? "var(--accent)" : "var(--bg-alt)"};color:${l.id === layoutAtual ? "#fff" : "var(--text)"};border:1px solid ${l.id === layoutAtual ? "var(--accent)" : "var(--border)"};border-radius:6px;padding:8px 12px;font-size:12px;font-weight:600;cursor:pointer;">${l.nome}</button>
            `).join("")}
          </div>
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Pontuação por ação</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Vale pra Prêmios e pro Ranking (os dois usam a mesma pontuação).</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          ${campoNumero("vMensagem", "Pontos por mensagem", cfgAtual.valores.mensagem)}
          ${campoNumero("vLikeACada", "A cada X likes", cfgAtual.valores.likeACada)}
          ${campoNumero("vLikeValor", "...vale quantos pontos", cfgAtual.valores.likeValor)}
          ${campoNumero("vSeguidor", "Pontos por novo seguidor", cfgAtual.valores.seguidor)}
          ${campoNumero("vCompartilhar", "Pontos por compartilhar", cfgAtual.valores.compartilhamento)}
          ${campoNumero("vPresenteMinimo", "Mínimo por presente", cfgAtual.valores.presenteMinimo)}
        </div>
        <div style="font-size:12.5px;font-weight:600;margin-bottom:2px;">Faixas de presente</div>
        <p style="font-size:11px;color:var(--text-dim);margin:0 0 8px;">Cada presente vale pelo tamanho dele (em diamantes) — presentes maiores caem numa faixa que vale mais pontos por diamante, igual os pacotes de moeda que o TikTok vende.</p>
        <div id="listaFaixasPresente"></div>
        <button id="addFaixaPresente" style="margin-top:2px;margin-bottom:16px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">+ adicionar faixa</button>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Prêmios (tiers)</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Cada espectador acumula pontos sozinho; ao bater o valor de um tier, desbloqueia aquele prêmio.</p>
        <div id="listaTiers"></div>
        <button id="addTier" style="margin-top:6px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">+ adicionar tier</button>
        <div style="font-size:13px;font-weight:600;margin:16px 0 4px;">Som</div>
        ${linhaSom("premio", "Prêmio desbloqueado", cfgAtual.sons.premio)}
        ${campoVolumeModal(cfgAtual)}
      `;
    }
    if (overlayId === "ranking") {
      return `
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Ranking</div>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:16px;">
          ${toggleHtml("exigirSeguidor", "Ranking só conta seguidor confirmado", cfgAtual.exigirSeguidor)}
          <div>${campoNumero("tamanhoRanking", "Tamanho do ranking", cfgAtual.tamanhoRanking, "width:120px;")}</div>
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Pontuação por ação</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Vale pra Ranking e pra Prêmios (os dois usam a mesma pontuação).</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          ${campoNumero("vMensagem", "Pontos por mensagem", cfgAtual.valores.mensagem)}
          ${campoNumero("vLikeACada", "A cada X likes", cfgAtual.valores.likeACada)}
          ${campoNumero("vLikeValor", "...vale quantos pontos", cfgAtual.valores.likeValor)}
          ${campoNumero("vSeguidor", "Pontos por novo seguidor", cfgAtual.valores.seguidor)}
          ${campoNumero("vCompartilhar", "Pontos por compartilhar", cfgAtual.valores.compartilhamento)}
          ${campoNumero("vPresenteMinimo", "Mínimo por presente", cfgAtual.valores.presenteMinimo)}
        </div>
        <div style="font-size:12.5px;font-weight:600;margin-bottom:2px;">Faixas de presente</div>
        <p style="font-size:11px;color:var(--text-dim);margin:0 0 8px;">Cada presente vale pelo tamanho dele (em diamantes) — presentes maiores caem numa faixa que vale mais pontos por diamante.</p>
        <div id="listaFaixasPresente"></div>
        <button id="addFaixaPresente" style="margin-top:2px;margin-bottom:16px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">+ adicionar faixa</button>
        <div style="font-size:13px;font-weight:600;margin:16px 0 4px;">Som</div>
        ${linhaSom("seguidor", "Novo seguidor", cfgAtual.sons.seguidor)}
        ${campoVolumeModal(cfgAtual)}
      `;
    }
    if (overlayId === "alerta") {
      return `
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Alerta de presente</div>
        <div style="margin-bottom:12px;">${toggleHtml("alertaAtivo", "Ativar overlay de alerta", cfgAtual.alerta.ativo)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          ${campoNumero("alertaValorMinimo", "Valor mínimo pra alertar (pontos)", cfgAtual.alerta.valorMinimo)}
          ${campoNumero("alertaDuracao", "Tempo na tela (segundos)", Math.round(cfgAtual.alerta.duracaoMs / 1000))}
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Som</div>
        ${linhaSom("presente", "Presente recebido", cfgAtual.sons.presente)}
        ${campoVolumeModal(cfgAtual)}
      `;
    }
    if (overlayId === "combo") {
      return `
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Combo / sequência</div>
        <div style="margin-bottom:12px;">${toggleHtml("comboAtivo", "Ativar overlay de combo", cfgAtual.combo.ativo)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          ${campoNumero("comboJanela", "Janela pra contar combo (segundos)", cfgAtual.combo.janelaMs / 1000)}
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Conta combo de:</div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px;">
          ${fontesDisponiveis.map(f => `
            <label style="font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:5px;">
              <input type="checkbox" data-combo-fonte="${f}" ${cfgAtual.combo.fontes.includes(f) ? "checked" : ""}/> ${f}
            </label>
          `).join("")}
        </div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Som</div>
        ${linhaSom("combo", "Combo", cfgAtual.sons.combo, true)}
        ${campoVolumeModal(cfgAtual)}
      `;
    }
    if (overlayId === "vitrine") {
      return `
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Prêmios (tiers)</div>
        <p style="font-size:11.5px;color:var(--text-dim);margin:0 0 8px;">Mesma lista de prêmios do overlay "Prêmios da live" — os dois mostram os mesmos tiers.</p>
        <div id="listaTiers"></div>
        <button id="addTier" style="margin-top:6px;background:transparent;color:var(--text-dim);border:1px dashed var(--border);border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">+ adicionar tier</button>
      `;
    }
    return "";
  }

  function coresRapidasHtml(overlayId) {
    return `
    <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);">
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Cor rápida (aplica na hora, só neste overlay)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        ${Object.entries(PRESETS_TEMA).map(([nome, p]) => `<button data-preset-rapido="${nome}" title="${nome}" style="width:28px;height:28px;border-radius:50%;background:${p.corPrimaria};border:2px solid var(--border);cursor:pointer;padding:0;"></button>`).join("")}
        <button data-preset-rapido-limpar="1" title="Usar a cor padrão (aba Aparência)" style="width:28px;height:28px;border-radius:50%;background:transparent;border:2px dashed var(--text-faint);cursor:pointer;padding:0;color:var(--text-faint);font-size:13px;line-height:1;">×</button>
      </div>
      <button id="btnMaisCores" style="margin-top:10px;background:transparent;color:var(--text-dim);border:none;text-decoration:underline;font-size:11.5px;cursor:pointer;padding:0;">Mudar a cor de todos os overlays de uma vez, na Aparência →</button>
    </div>
  `;
  }

  function coletarConfigDoModal(overlayId, base) {
    const novo = Object.assign({}, base);
    const pegaValoresPontuacao = () => ({
      mensagem: Number(document.getElementById("vMensagem").value),
      likeACada: Number(document.getElementById("vLikeACada").value),
      likeValor: Number(document.getElementById("vLikeValor").value),
      faixasPresente: normalizarFaixasPresente(faixasPresenteEditando),
      presenteMinimo: Number(document.getElementById("vPresenteMinimo").value),
      seguidor: Number(document.getElementById("vSeguidor").value),
      compartilhamento: Number(document.getElementById("vCompartilhar").value),
    });
    const pegaSom = (id, comACada) => Object.assign({
      ativo: document.getElementById(`som_${id}_ativo`).checked,
      som: document.getElementById(`som_${id}_tipo`).value,
      url: document.getElementById(`som_${id}_url`).value,
    }, comACada ? { aCada: Number(document.getElementById(`som_${id}_aCada`).value) || 1 } : {});
    const volumeAtual = () => {
      const el = document.getElementById("somVolumeModal");
      return el ? Number(el.value) : base.sons.volume;
    };

    if (overlayId === "metas") {
      novo.valores = pegaValoresPontuacao();
      novo.tiers = tiersEditando;
      novo.sons = Object.assign({}, base.sons, { volume: volumeAtual(), premio: pegaSom("premio") });
    } else if (overlayId === "ranking") {
      novo.valores = pegaValoresPontuacao();
      novo.exigirSeguidor = document.getElementById("exigirSeguidor").checked;
      novo.tamanhoRanking = Number(document.getElementById("tamanhoRanking").value);
      novo.sons = Object.assign({}, base.sons, { volume: volumeAtual(), seguidor: pegaSom("seguidor") });
    } else if (overlayId === "alerta") {
      novo.alerta = {
        ativo: document.getElementById("alertaAtivo").checked,
        valorMinimo: Number(document.getElementById("alertaValorMinimo").value),
        duracaoMs: Number(document.getElementById("alertaDuracao").value) * 1000,
      };
      novo.sons = Object.assign({}, base.sons, { volume: volumeAtual(), presente: pegaSom("presente") });
    } else if (overlayId === "combo") {
      const comboFontesSelecionadas = Array.from(document.querySelectorAll("#modalConfigOverlay [data-combo-fonte]")).filter(cb => cb.checked).map(cb => cb.dataset.comboFonte);
      novo.combo = {
        ativo: document.getElementById("comboAtivo").checked,
        janelaMs: Number(document.getElementById("comboJanela").value) * 1000,
        fontes: comboFontesSelecionadas,
      };
      novo.sons = Object.assign({}, base.sons, { volume: volumeAtual(), combo: pegaSom("combo", true) });
    } else if (overlayId === "vitrine") {
      novo.tiers = tiersEditando;
    }
    return novo;
  }

  function abrirModalConfigOverlay(overlayId) {
    fecharModalOverlay();
    const ov = OVERLAYS.find(o => o.id === overlayId);
    if (!ov) return;
    const cfgAtual = carregarConfig();

    const backdrop = document.createElement("div");
    backdrop.id = "modalConfigOverlay";
    backdrop.className = "topbar-modal-backdrop";

    if (overlayId === "eventos") {
      backdrop.innerHTML = `
        <div class="topbar-modal" style="max-width:460px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="font-size:16px;font-weight:700;">Config — ${ov.nome}</div>
            <button id="fecharModalOverlayBtn" style="background:transparent;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;line-height:1;">×</button>
          </div>
          <p style="font-size:13px;color:var(--text-dim);line-height:1.55;margin:0 0 16px;">As regras desse overlay (gatilho → ação) ficam numa tela própria, a aba Eventos, porque é uma lista de regras — não um formulário simples de encaixar aqui.</p>
          <div style="display:flex;gap:8px;">
            <button id="btnTestarModal" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Testar</button>
            <button id="btnIrEventos" class="btn-cta" style="flex:2;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Editar regras em Eventos →</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
      backdrop.addEventListener("click", e => { if (e.target === backdrop) fecharModalOverlay(); });
      document.getElementById("fecharModalOverlayBtn").addEventListener("click", fecharModalOverlay);
      document.getElementById("btnTestarModal").addEventListener("click", () => abrirOverlayDeTeste("eventos", carregarConfig()));
      document.getElementById("btnIrEventos").addEventListener("click", () => { fecharModalOverlay(); irParaAba("eventos"); });
      return;
    }

    backdrop.innerHTML = `
      <div class="topbar-modal" style="max-width:560px;max-height:85vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="font-size:16px;font-weight:700;">Config — ${ov.nome}</div>
          <button id="fecharModalOverlayBtn" style="background:transparent;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;line-height:1;">×</button>
        </div>
        <p style="font-size:12.5px;color:var(--text-dim);margin:0 0 16px;">${ov.desc}</p>
        ${corpoModalPorOverlay(overlayId, cfgAtual)}
        ${coresRapidasHtml(overlayId)}
        <div style="display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);align-items:center;">
          <button id="btnTestarModal" style="flex:1;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Testar</button>
          <button id="btnSalvarModal" class="btn-cta" style="flex:2;border-radius:8px;padding:11px;font-size:13.5px;cursor:pointer;">Salvar</button>
        </div>
        <span id="modalSalvoMsg" style="display:none;font-size:12px;color:var(--accent);margin-top:8px;font-family:var(--font-mono);">salvo ✓ — atualiza sozinho nos overlays já abertos</span>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) fecharModalOverlay(); });
    document.getElementById("fecharModalOverlayBtn").addEventListener("click", fecharModalOverlay);

    // wiring específico por tipo — feito depois de inserir no DOM
    if (overlayId === "metas" || overlayId === "vitrine") {
      tiersEditando = structuredClone(cfgAtual.tiers);
      montarEditorTiers();
    }
    if (overlayId === "metas" || overlayId === "ranking") {
      faixasPresenteEditando = normalizarFaixasPresente(cfgAtual.valores.faixasPresente);
      montarEditorFaixasPresente();
    }
    if (overlayId === "metas") wireSomRow(backdrop, "premio", "somVolumeModal");
    if (overlayId === "ranking") wireSomRow(backdrop, "seguidor", "somVolumeModal");
    if (overlayId === "alerta") wireSomRow(backdrop, "presente", "somVolumeModal");
    if (overlayId === "combo") wireSomRow(backdrop, "combo", "somVolumeModal");

    backdrop.querySelectorAll("[data-layout-metas]").forEach(btn => {
      btn.addEventListener("click", () => {
        const atual = carregarConfig();
        atual.metas = { layout: btn.dataset.layoutMetas };
        salvarConfig(atual);
        renderPrevias();
        backdrop.querySelectorAll("[data-layout-metas]").forEach(b => {
          const ativo = b.dataset.layoutMetas === btn.dataset.layoutMetas;
          b.style.background = ativo ? "var(--accent)" : "var(--bg-alt)";
          b.style.color = ativo ? "#fff" : "var(--text)";
          b.style.borderColor = ativo ? "var(--accent)" : "var(--border)";
        });
      });
    });

    // Cor rápida do modal: grava só em cfg.overlayTema[overlayId] — não
    // toca no tema global nem nos outros overlays. Só a Aparência muda tudo.
    backdrop.querySelectorAll("[data-preset-rapido]").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = PRESETS_TEMA[btn.dataset.presetRapido];
        const baseCfg = carregarConfig();
        const novoOverlayTema = Object.assign({}, baseCfg.overlayTema, { [overlayId]: p });
        salvarConfig(Object.assign({}, baseCfg, { overlayTema: novoOverlayTema }));
        renderPrevias();
        backdrop.querySelectorAll("[data-preset-rapido], [data-preset-rapido-limpar]").forEach(b => (b.style.outline = "none"));
        btn.style.outline = "3px solid var(--accent)";
      });
    });
    const btnLimparCor = backdrop.querySelector("[data-preset-rapido-limpar]");
    if (btnLimparCor) {
      btnLimparCor.addEventListener("click", () => {
        const baseCfg = carregarConfig();
        const novoOverlayTema = Object.assign({}, baseCfg.overlayTema, { [overlayId]: {} });
        salvarConfig(Object.assign({}, baseCfg, { overlayTema: novoOverlayTema }));
        renderPrevias();
        backdrop.querySelectorAll("[data-preset-rapido], [data-preset-rapido-limpar]").forEach(b => (b.style.outline = "none"));
        btnLimparCor.style.outline = "3px solid var(--accent)";
      });
    }

    const btnMaisCores = document.getElementById("btnMaisCores");
    if (btnMaisCores) btnMaisCores.addEventListener("click", () => { fecharModalOverlay(); irParaAba("aparencia"); });

    document.getElementById("btnTestarModal").addEventListener("click", () => {
      const cfgTeste = coletarConfigDoModal(overlayId, carregarConfig());
      abrirOverlayDeTeste(overlayId, cfgTeste);
    });

    document.getElementById("btnSalvarModal").addEventListener("click", () => {
      const base = carregarConfig();
      const novo = coletarConfigDoModal(overlayId, base);
      salvarConfig(novo);
      renderPrevias();
      const msg = document.getElementById("modalSalvoMsg");
      if (msg) {
        msg.style.display = "inline";
        setTimeout(() => fecharModalOverlay(), 1000);
      }
    });
  }
}

function copiarTexto(texto) {
  const temp = document.createElement("textarea");
  temp.value = texto;
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(temp);
}
